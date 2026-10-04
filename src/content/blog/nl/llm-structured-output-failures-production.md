---
title: "Gestructureerde output fouten: de stille datacorruptie in AI"
description: "Gestructureerde output fouten corrumperen data in plaats van gebruikers te irriteren. Zo bouw je de validatielaag, repair-logica en metrieken die dit voorkomen."
published: "2026-10-04"
tags: ["gestructureerde output", "LLM productie", "JSON validatie", "AI observability", "function calling"]
ogImage: "/images/blog/llm-structured-output-failures-production/cover.jpg"
primaryService: "hardening"
---
De storing lijkt op geen van de dingen waar je je op hebt voorbereid. Geen hallucinatie, geen timeout, geen onverwachte rekening. Alleen een Sentry-alert om 03:12 die zegt `Unexpected token 'a', ..."amount": NaN...` en een supportticket van een klant wiens factuur is weggeschreven met een lege regel. **Gestructureerde output fouten** — het model geeft JSON of een tool call terug die je code niet kan parsen of niet kan vertrouwen — zijn de slechtst geïnstrumenteerde breukklasse in productie-AI, en het zijn de enige die data corrumpeert in plaats van alleen gebruikers irriteert.

Ik heb genoeg LLM-features gehardend om dit met overtuiging te zeggen: bijna elk team dat een LLM aanroept voor gestructureerde data gaat live met een `json.loads()` in een try/except, een logregel, en verder niets. Dat is geen validatielaag. Dat is een plek waar slechte data stil wordt.

Dit is de gids die ik afloop als een team me vertelt "het werkt, behalve dat het soms niet parst". Waar de fouten echt vandaan komen, wat de laag tussen het model en je code moet doen, wanneer je een gebroken response repareert versus opnieuw uitvoert, de ene metriek die niemand op een dashboard heeft, en hoe je ziet dat de echte fix een andere decoding-strategie is in plaats van nóg een promptherschrijving.

## Het moment: het kwam door QA, daarna brak 2% van de responses je parser

Zo ziet het eruit. Je hebt een extractie- of routeringsstap gebouwd. Je hebt hem getest op misschien 80 voorbeelden, vermoedelijk gecureerd, vermoedelijk kort. Groen. QA heeft er een sprint op gebeukt. Groen. Je bent live gegaan.

Dan komt echt verkeer, en echt verkeer is niet je testset. Gebruikers plakken e-mails met slimme aanhalingstekens en kastlijntjes. Een supportticket bevat een codeblok met niet-geëscapete backslashes. Iemands bedrijfsnaam is `O'Brien & Zonen "De Vries"`. Een document is 40 pagina's in plaats van 2, de output van het model wordt afgekapt op de max-tokengrens midden in een object, en je krijgt JSON die er geldig uitziet maar simpelweg stopt.

Het foutpercentage is klein — in mijn ervaring ergens tussen 0,5% en 4%, afhankelijk van schemacomplexiteit en hoe wild de input is — en die kleinheid is de valkuil. Het is te zeldzaam om in QA te betrappen en te frequent om te negeren bij 50.000 calls per dag. En het faalt niet luid. Een `try/except: return None` verandert een parse-fout in een ontbrekend record. Een gedeeltelijke parse verandert het in een *verkeerd* record, wat strikt slechter is, want nu staat het in je database en weet niemand ervan.

De specifieke foutvormen die ik zie, ruwweg op frequentie:

- **Prosa-omhulling.** ` ```json `-fences, of "Hier is de JSON die je vroeg:" ervoor. Triviaal te fixen, en de reden dat de helft van alle teams denkt dit met een regex te hebben opgelost.
- **Afkapping.** De output raakt het tokenplafond. De JSON is welgevormd tot precies het moment dat hij het niet meer is.
- **Ontbrekende verplichte velden.** Het model laat een key volledig weg als de input er geen bewijs voor bevat, in plaats van `null` terug te geven.
- **Type-drift.** `"amount": "1.250,00"` terwijl je een float wilde. `"quantity": "twee"`. Booleans als `"ja"`.
- **Enum-overtredingen.** Je hebt `status` gedefinieerd als één van vier waarden; het model verzint een vijfde die semantisch redelijk en structureel fataal is.
- **Mislukte tool call-routering.** In agentic flows: een functienaam die niet bestaat, argumenten voor een ander tool, of twee tool calls terwijl je executor er één verwerkt.

Merk op dat alleen de eerste twee parseerproblemen zijn. De rest zijn *schemaconformiteits*problemen — de JSON parst prima en is nog steeds verkeerd. Dat onderscheid bepaalt alles hieronder.

## Gestructureerde output fouten zijn hun eigen breukklasse

De reden dat dit ongefixt blijft is taxonomisch. Teams boeken het onder "het model doet flaky" en grijpen naar prompt engineering, want dat is het gereedschap dat ze hebben. Maar dit is geen contentkwaliteitsprobleem zoals [hallucinatie, waar het model met overtuiging iets onwaars beweert](/blog/llm-hallucination-in-production). Het is een *contract*probleem: je hebt een interface gedefinieerd tussen een probabilistisch systeem en een deterministisch systeem, en je handhaaft die met een verzoek in plaats van een dwang.

![Gestructureerde output fouten: de stille datacorruptie in AI](/images/blog/llm-structured-output-failures-production/1.jpg)

"Vraag gewoon om JSON" werkt in dev om een saaie reden. Je dev-inputs zijn kort, schoon en in-distributie, dus de meest waarschijnlijke voortzetting van het model is toevallig welgevormd. Productie verbreedt de inputverdeling, en elke verbreding — langere context, gemengde talen, adversariële interpunctie, edge-case businesslogica — duwt een deel van de generaties naar voortzettingen waar de syntaxbeperking verliest van de semantische. Het model legt liever uit dan dat het `null` uitspuugt.

Promptfixes verlagen het percentage. Ze veranderen de klasse niet. Je kunt van 3% naar 0,8% met een betere system prompt en few-shot voorbeelden, en je corrumpeert dan nog steeds ruwweg één op de 125 records. Als de downstream-write financieel, medisch of juridisch is, dan is dat getal geen tuning-doel — het is een ontwerpfout. Dit is dezelfde les als de bredere [lijst van wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production): het gat tussen demo en productie gaat bijna nooit over modelkwaliteit, het gaat over het ontbreken van handhaving aan de randen.

## De validatielaag die tussen het model en je code moet zitten

Geen enkele LLM-output raakt businesslogica direct aan. Nooit. Er is een laag, hij is saai, en hij heeft vier taken in deze volgorde.

**1. Extraheren.** Strip fences, voorafgaande prosa, nagekomen commentaar. Vind de buitenste gebalanceerde `{...}` of `[...]`. Dit is mechanisch en hoort een gedeelde utility te zijn, niet per call site gecopypaste.

**2. Tolerant parsen, daarna strikt herserialiseren.** Gebruik een lenient parser voor de eerste pass (trailing comma's, enkele quotes, niet-geëscapete newlines in strings zijn allemaal herstelbaar), dump daarna terug naar canonieke JSON. Laat de lenient vorm nooit doorstromen.

**3. Valideren tegen een echt schema.** Pydantic in Python, Zod in TypeScript. Geen dict met `isinstance`-checks. Een schema-object dat de enige bron van waarheid is — hetzelfde object dat je serialiseert naar de `response_format` of tooldefinitie van de API-call, zodat het contract dat je handhaaft en het contract dat je vraagt niet uit elkaar kunnen lopen.

**4. Bewust coerceren, al het andere weigeren.** Bepaal vooraf welke coercies legitiem zijn: `"1250.00"` → float, `"JA"` → `true`, `"2026-09-28T00:00:00Z"` → date. Whitelist ze. Alles buiten de whitelist is een fout, geen gok.

python
class Invoice(BaseModel):
    model_config = ConfigDict(extra="forbid")  # vang verzonnen velden
    vendor: str = Field(min_length=1)
    amount_cents: int = Field(ge=0)           # nooit floats voor geld
    currency: Literal["EUR", "USD", "GBP"]
    due_date: date | None                     # expliciet nullable, niet optional

Twee details die zwaarder wegen dan ze lijken. `extra="forbid"` betrapt het model op het verzinnen van behulpzame velden — een echt signaal dat je prompt en je schema het oneens zijn, en een signaal dat je anders nooit zou zien. En het verschil tussen *nullable* en *optional*: als een veld afwezig kan zijn, dan maakt het model het afwezig, en dan ziet je downstream-code een andere vorm dan hij verwacht. Maak onbekenden expliciete `null`-waarden in een verplichte key. Het kost een paar tokens en verwijdert een hele categorie ambiguïteit.

De laag moet ook uitzenden. Elke weigering wordt gelogd met de ruwe output, de schemaversie, het pad van de validatiefout en de hash van de input. Zonder de ruwe output debug je blind, en je hebt hem nodig in sectie vijf.

## Repareren versus opnieuw uitvoeren: welke fouten je ter plekke fixt

Zodra validatie iets betrapt, heb je drie zetten, en verkeerd kiezen is waar het geld heen gaat.

**Deterministische reparatie — gratis, instant, altijd eerst.** Fences strippen, whitespace, trailing comma's, quotes normaliseren. Geen modelcall. Als je validatielaag dit goed doet, absorbeert hij een groot deel van de fouten tegen nul marginale kosten. Besteed geen LLM-call aan een probleem dat `str.strip()` oplost.

**Retry met dezelfde call — goedkoop, en effectiever dan mensen verwachten.** Omdat generatie gesampled is, slaagt een identiek verzoek vaak bij de tweede poging. Eén retry op temperature 0 (of lager dan je primaire) ruimt doorgaans het merendeel van de resterende transiënte fouten op. Begroot precies één, met jitter, en maak hem zichtbaar in je traces zodat retries niet in je latency-p95 verdwijnen.

**Reparatiecall — stuur de gebroken output terug met de validatiefout.** "Je vorige response faalde validatie: `amount_cents: Input should be a valid integer`. Geef alleen gecorrigeerde JSON terug." Dit is de dure optie: een volledige extra round trip, extra latency, en een tweede kans om ernaast te zitten. Hij verdient zijn plek in precies één geval — als de oorspronkelijke call een grote, dure context had (een document van 40 pagina's, een lange agenthistorie) die je niet opnieuw wil versturen. Dan is een kleine reparatiecall tegen alleen de gebroken output en de fout dramatisch goedkoper dan een volledige retry.

De beslissing is een kostenratio, geen voorkeur:
als fout deterministisch is:        lokaal repareren, geen call
anders als input_tokens < ~4k:      originele call retryen, temp 0
anders:                             reparatiecall met foutfeedback, klein model
nog steeds ongeldig na 2 pogingen:  luid falen, in queue voor mens, NIET wegschrijven

Die laatste regel is degene die teams overslaan. Een gestructureerde outputfout die zijn budget opmaakt moet **luid falen en niet wegschrijven**. Een dead-letter queue met de ruwe output en de input is tien minuten bouwen en het verschil tussen "we hebben 40 slechte extracties in één batch gevangen" en "we vonden ze zes weken later bij een audit".

## De metriek die niemand dashboardt: schema-valid rate, per veld

Je error-rate dashboard toont excepties. Gestructureerde output fouten die gerepareerd, geretryd of stil genulled worden, worden nooit excepties, dus je dashboard staat groen terwijl de feature degradeert. De metriek die je nodig hebt is **schema-valid rate bij eerste poging**, en die heeft drie uitsnedes nodig.

**Totaal, eerste poging.** Validiteit ná reparatie is een vanity metric; die vertelt je dat je vangnet werkt, niet dat je model werkt. Meet pre-repair.

**Per veld.** Hier zit de waarde. Een geaggregeerde schema-valid rate van 96% zegt niets. "96% totaal, maar `due_date` valideert 99,8% en `line_items[].vat_rate` valideert 81%" vertelt je precies welk deel van het schema je moet fixen en of het probleem de prompt, het veldtype of een oprecht ambigue businessregel is. Log het *pad* van de validatiefout, niet alleen het feit dat er iets faalde.

**Per inputsegment.** Taal, documentlengte, bronkanaal, klant. Gestructureerde output fouten clusteren hard. Ik vind regelmatig een totaalfoutpercentage van 3% dat in werkelijkheid 0,4% is voor één inputtype en 22% voor een ander — en dat 22%-segment is meestal het documentformaat van één klant waar niemand tegen getest heeft.

Hang dit in wat je al gebruikt voor [LLM-observability en productiemonitoring](/blog/llm-observability-production-monitoring) — het is dezelfde trace, één attribuut extra. Zet er daarna een shipgate op: schema-valid rate is een regressietest. Als je een prompt wijzigt of een modelversie bumpt, is de valid rate per veld deel van de diff, precies zoals de [prompt-versiebeheer en regressietest-discipline](/blog/prompt-versioning-regression-testing) die je al zou moeten draaien. Modelproviders veranderen gedrag onder een stabiele versiestring. Je enum-compliance vertelt het je vóór je gebruikers het doen.

## Wanneer de fix een andere decoding-strategie is, geen betere prompt

Op een bepaald punt stop je met vriendelijk vragen en begin je ongeldige output onmogelijk te maken. Ruwweg op sterkte:

**Native structured outputs / strikte JSON-schemamodus.** OpenAI's `response_format: {type: "json_schema", strict: true}`, Gemini's response schema, Anthropic's tool-use schema. Die beperken de generatie, ze instrueren hem niet alleen. Ze ondersteunen niet elke JSON Schema-feature — diepe recursie, sommige `anyOf`-vormen, onbegrensde maps — en die beperking vertelt je meestal dat je schema te slim is.

**Function/tool calling.** Definieer voor agentic flows het tool netjes en laat de provider de argumenten valideren. Zet daarna `tool_choice` om een specifiek tool te forceren als je weet wat er moet gebeuren, in plaats van te hopen dat het model goed routeert. De meeste tool-routeringsfouten die ik zie zijn een model met elf tools met overlappende beschrijvingen en geen forcering.

**Constrained decoding op je eigen inference.** Zelf hosten via vLLM of llama.cpp geeft je grammatica-gebaseerde decoding (xgrammar, GBNF) die malformed output structureel onbereikbaar maakt — de sampler kan geen token uitgeven dat de grammatica schendt. Dit is de sterkste garantie die er is en een echt argument voor [on-prem of zelfgehoste LLM-inference](/blog/on-prem-llm-hosting-netherlands) als data-integriteit zwaarder weegt dan het plafond van het model.

**Vereenvoudig het schema.** De goedkoopste fix en de minst gebruikte. Drie platte calls met elk vier velden verslaan één geneste call met twintig. Splits extractie van classificatie. Vraag om een string en parse de datum zelf, in plaats van het model ISO-8601 te laten formatteren. Elk niveau nesting en elk vrij-tekstveld is oppervlak voor fouten.

Eén waarschuwing, want dat is het eerlijke deel: constrained decoding garandeert *vorm*, geen *waarheid*. Een grammatica geeft met plezier een perfect geldige `amount_cents: 0` terug. Structuur forceren kan een model zelfs duwen naar het vullen van een verplicht veld met iets plausibels in plaats van afwezigheid toegeven. Structurele geldigheid en inhoudelijke correctheid zijn twee aparte poorten, en je hebt ze beide nodig.

## Waar dit een opdracht wordt

Als je AI-feature naar een database schrijft, een API aanroept of agentacties routeert op basis van LLM-output, en je kunt je huidige schema-valid rate per veld niet noemen, dan is dat een Production Hardening-klus: drie tot zes weken om de validatielaag, het repair/retry-beleid, de metrieken per veld en de regressiegates te bouwen, en het daarna live te zetten achter een gehardende deploy die je echt kunt bekijken. Het meeste werk is niet glamoureus, precies daarom staat het nog open.

Bekijk wat dat dekt op de [servicespagina](/services), of stuur me de falende payloads en het schema en ik vertel je welke van de zes foutvormen je hebt — [neem contact op](/contact).
