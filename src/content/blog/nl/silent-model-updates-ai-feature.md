---
title: "Stille modelupdates: waarom je AI-feature degradeert zonder deploy"
description: "Stille modelupdates laten AI-features ongemerkt degraderen. Leer model pinning, eval-snapshots en een rollbackplan opzetten voor je klanten het melden."
published: "2026-10-04"
tags: ["stille modelupdates", "model version pinning", "AI in productie", "LLM evaluatie", "RAG"]
ogImage: "/images/blog/silent-model-updates-ai-feature/cover.jpg"
primaryService: "hardening"
---
Het eerste wat ik hoor aan het begin van een kwaliteitsincident is bijna altijd: "we hebben in twee weken niks gedeployed." Dat is doorgaans waar, en het is precies de reden waarom het team drie dagen door eigen diffs heeft gegrepeld in plaats van te kijken naar de enige dependency die ze nooit hebben gepind. Stille modelupdates laten AI-features in productie regelmatig degraderen, en omdat er niets in je repository is bewogen, begint het onderzoek vanuit een onjuiste aanname.

Je prompt is code. Je retrieval-index is data die je zelf beheert. De weights achter `gpt-4o`, `claude-sonnet-4-5` of `gemini-2.5-pro` zijn een dienst die iemand anders exploiteert en waarvan die partij expliciet het recht houdt om hem te wijzigen. Als je call site een alias noemt in plaats van een gedateerde snapshot, heb je een zwevende dependency naar productie gebracht en die gericht op het meest reputatiegevoelige deel van je product.

Hieronder staat de workflow die ik afloop als een klant belt over onverklaarbare driftende output, in de volgorde waarin je hem echt nodig hebt: het symptoomprofiel herkennen, de oorzaak bevestigen, pinnen, een diff-bare eval-snapshot bouwen, en de rollback klaarzetten voor de week waarin pinnen niet genoeg blijkt.

## Er is niets in je code veranderd. Juist daarom moet je je zorgen maken

Modeldrift kondigt zich niet aan zoals een slechte deploy dat doet. Foutpercentages blijven vlak. Latency verbetert soms zelfs. Er is geen exception in Sentry, geen gefaalde health check, geen alert. Wat je in plaats daarvan krijgt is een supportticket waarin staat dat de assistent "anders voelt", geschreven door een gebruiker die het niet preciezer kan formuleren, drie weken nadat de wijziging is geland.

De vormen die ik het vaakst zie: antwoorden die 40% langer worden met meer voorbehouden en meer bulletlijsten, waardoor een UI die voor drie zinnen is ontworpen nu scrollt. Een stijgende refusal rate op één smalle categorie, meestal alles dat ruikt naar juridisch, medisch of financieel advies, terwijl elke andere categorie ongemoeid blijft. Een model dat eerst nette proza teruggaf en dingen nu in markdown-headers gaat wikkelen, wat de downstream parser breekt die niemand heeft gehard. Tool calls die merkbaar gretiger of merkbaar luier worden, wat de kostencurve van je agent verandert nog voordat het de accuratesse raakt. Nederlandse antwoorden op Nederlandse vragen die veranderen in Engelse antwoorden met Nederlandse citaten erin.

De gemene deler is dat je monitoring is gebouwd om failures te vangen, en dit is geen failure. Het is een distributieverschuiving binnen het succespad. Als je dashboards alleen uptime, tokenverbruik en p95 volgen, hoor je dit van een klant, en dat is het duurste detectiekanaal dat bestaat.

## Waarom "we hebben niks aangeraakt" geen alibi is

Geen enkel competent team draait `npm install react@latest` bij het starten van een container. Toch is `model: "gpt-4o"` in een configbestand exact dat: een naam die aan de kant van de leverancier per request wordt opgelost naar wat zij op dat moment als actueel beschouwen. De pin ontbreekt, en niemand behandelt het als een missende lockfile, omdat de string eruitziet als een constante.

![Stille modelupdates: waarom je AI-feature degradeert zonder deploy](/images/blog/silent-model-updates-ai-feature/1.jpg)

In de codebases die ik audit is de hoofd-generatiecall meestal wel gepind. Daar heeft iemand één keer over nagedacht. De call die je bijt is de goedkope: de query rewriter, de titelgenerator, de intent classifier, de summarizer die chatgeschiedenis comprimeert voordat die in de hoofdprompt landt. Die zijn in een middag geschreven met de SDK-default, en de SDK-default is een alias. Als de alias verschuift, gaat je query rewriter subtiel andere zoekopdrachten produceren, zakt de retrieval-kwaliteit, en ben je een week je vectordatabase aan het verdenken voor een wijziging die één functie eerder plaatsvond. Dit is de failure mode achter meer dan één bullet op mijn [lijst van wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production).

Azure OpenAI voegt een tweede valluik toe dat je vandaag kunt nakijken: een deployment kan zo geconfigureerd staan dat hij automatisch meegaat naar de default versie. Dan bepaalt een operatorinstelling, niet jouw code, welke weights jouw traffic bedienen. Ik heb een team gezien dat in de applicatie correct had gepind en toch werd verplaatst, omdat het deployment-beleid eroverheen ging.

## Wat een modelupdate onder de motorkap echt verandert

"Ze hebben het model aangepast" dekt minstens zes verschillende dingen, met verschillende blast radius.

- **Post-training**, niet pretraining. Het meeste gedrag dat je opmerkt komt uit een nieuwe instruction-following- of preference-ronde: verbosity-kalibratie, refusal-grenzen, opmaakgewoontes, hoe letterlijk de system prompt wordt gevolgd. Daarom houdt je zorgvuldig getunede "antwoord in maximaal twee zinnen" ineens minder stevig.
- **De safety- en moderatielaag** voor of om het model heen, die op de meeste hosted API's apart van de weights wordt geversioneerd en de gebruikelijke oorzaak is van een refusal-piek in één categorie.
- **Structured output en tool-call serialisatie.** Implementaties van schema-enforcement veranderen. Een veld dat eerst als `null` terugkwam is nu gewoon afwezig, of een enum komt lowercased binnen, en je Pydantic-model gooit op 2% van de requests.
- **Servinggedrag**: batching, speculative decoding, routing. Dit maakt output non-deterministisch zelfs bij `temperature=0`, wat vooral uitmaakt omdat het naïeve golden-output-tests sloopt.
- **Prompt caching-semantiek**, die je kostenprofiel verandert zonder één karakter output te wijzigen.
- **Snapshot retirement**, waarbij een oud gedateerd model stopt te bestaan en requests worden omgeleid of geweigerd.

Degene die per incident de meeste schade aanricht is een update van het embeddingmodel. Als je nieuwe documenten her-embedt met een gewijzigd model terwijl je index vectoren uit het oude bevat, meng je twee coördinatenstelsels en degradeert retrieval voor alles, zonder ergens een foutmelding. Embeddingversies horen in je indexmetadata, en een versiemismatch moet ingestion blokkeren, niet waarschuwen. Dat is de stille helft van [waarom RAG die in dev werkt in productie breekt](/blog/rag-breaks-in-production).

## Model version pinning: wat het beschermt en de drie manieren waarop het je alsnog laat zitten

Pin alles. `gpt-4o-2024-08-06`, niet `gpt-4o`. `claude-sonnet-4-5-20250929`, niet `claude-sonnet-4-5`. Eén resolutiepunt in de codebase, nergens anders modelnamen als string literal, en een lintregel of test die faalt als er een alias opduikt. Dat is een uur werk en het haalt de meest voorkomende variant van dit probleem weg.

Wees daarna eerlijk over wat het niet dekt.

**Eén: de pin waarvan je niet wist dat je hem had.** Agent-frameworks, eval-libraries, LangChain-integraties en vendor-SDK's dragen allemaal defaultmodellen mee. Je fallbackpad, je retry-met-een-andere-provider-branch, je lokale devconfig en je notebooks matchen vaak niet met productie. Grep elke modelstring in de repo, inclusief tests en infrastructuur, en leg die lijst naast wat je logs zeggen dat er daadwerkelijk wordt aangeroepen. Die twee lijsten spreken elkaar vaker tegen dan niet.

**Twee: een snapshot pint weights, niet de stack eromheen.** Moderatielagen, capaciteit, defaultparameters, structured-output-enforcement en caching kunnen allemaal onder een gepinde model-ID vandaan schuiven. Pinnen versmalt het oppervlak, het dicht het niet. Behandel de pin als een lockfile voor één dependency, niet als een gedragsgarantie.

**Drie: snapshots verlopen.** Deprecatiedata worden gepubliceerd, dus een vendor model change in productie komt er hoe dan ook. Pinnen zet een verrassingsincident om in een geplande migratie, en dat is echte winst, maar de migratie moet nog steeds gebeuren. Oudere snapshots krijgen bovendien minder capaciteit, slechtere latency onder load en geen van de nieuwe features. Eindeloos pinnen is geen strategie, het is uitstel met een bekende einddatum.

## Stille modelupdates opsporen voor je gebruikers het doen

Het mechanisme dat echt werkt is saai. Pin productie, en draai elke nacht de zwevende alias tegen een bevroren set inputs, en diff de twee. Wat de volgende versie met jouw product doet, staat dan in een rapport op je eigen scherm voordat iemand je erheen duwt.

Bouw de eval regression snapshot uit echte traffic, niet uit fantasie. Ik sample 100 tot 200 requests, gestratificeerd zodat elk ding dat de feature gevraagd wordt te doen vertegenwoordigd is, plus elke input die ooit een incident heeft veroorzaakt. Bevries ze als JSONL met de volledige inputcontext, zodat het model de enige variabele is.

jsonl
{"id":"q-0142","lang":"nl","category":"contract_question","input":{...},"assert":{"max_sentences":3,"must_cite":true,"no_advice_disclaimer":true}}
{"id":"q-0143","lang":"en","category":"refusal_bait","input":{...},"assert":{"must_refuse":true}}

Stop vervolgens met het diffen van ruwe tekst. Exact-match vergelijken is op deze laag pure ruis. Diff per run de eigenschappen waar je echt om geeft:

- refusal rate, totaal en per categorie
- aantal JSON- of schema-parsefouten (drempel: nul)
- gemiddelde en p95 output-tokencount, plus kosten per case
- tool-call rate en gemiddeld aantal tool calls per taak
- pass rate van de assertions (citatie aanwezig, taal matcht de input, lengte binnen de grens)
- een LLM-judge-score tegen een rubric, gerapporteerd met de spreiding erbij, niet als één getal

Een nachtelijke run op het gepinde model geeft je LLM drift detection voor de stack om de pin heen. Dezelfde run op de alias geeft je een preview van de migratie. Beide schrijven één rij per model per dag, en het alert vuurt op delta's, niet op absolute waarden: refusal rate meer dan drie punten omhoog, gemiddelde outputlengte meer dan 20% verschoven, überhaupt één parsefout, judge-score verder omlaag dan de gebruikelijke dagelijkse spreiding. Op een set van 150 cases draait dit in een paar minuten en kost het per maand minder dan één uur van de engineer die anders blind het incident gaat debuggen.

Dit is dezelfde machinerie als [prompt versiebeheer en regressietesten](/blog/prompt-versioning-regression-testing), met één wijziging: de testmatrix is gesleuteld op het paar `(prompt_version, model_id)`. Een prompt is niet portable tussen modellen, en hem als portable behandelen is waarom cross-provider fallbacks zo vaak een slechte dag erger maken. Heb je al een [continuous eval loop](/blog/llm-evaluation-production-continuous-eval) staan, dan is het toevoegen van een shadow run op de zwevende alias een halve dag werk.

## Het fallback- en rollbackplan voor de week waarin het alsnog breekt

Detectie zonder knop is alleen snellere stress. Vier dingen maken die knop echt.

De model-ID moet runtime-configuratie zijn, aanpasbaar zonder deploy. Environment variable, feature flag, remote config, wat je stack al vertrouwt. Als wisselen van model een release vereist en je release train is wekelijks, dan is je rollbacktijd een week.

Elke request-log en trace span legt de exacte model-ID en promptversie vast die hem heeft bediend. Dat is wat je in staat stelt "klachten begonnen dinsdag" naast "modelmix veranderde dinsdag" te leggen in één query in plaats van in één vergadering. Zonder dat veld kun je de oorzaak niet eens bewijzen, en dat is het gat dat ik het vaakst vind in verder nette [observability-opstellingen](/blog/llm-observability-production-monitoring).

Houd de vorige snapshot warm en in de nachtelijke eval, en check zijn quota apart. Quota is doorgaans per model. Een rollback die faalt omdat de oude snapshot maar 20% van je traffic kan absorberen is geen rollback.

Beslis ten slotte vooraf wat je doet als de nieuwe versie gemiddeld beter is maar slechter op jouw ene kritieke categorie. Dit gebeurt vaker dan mensen verwachten, en het is een productbeslissing, geen engineeringbeslissing. Spreek vooraf de drempel af waarbij je een regressie accepteert, route die categorie naar een ander model, of houd de pin vast en plan de migratie netjes in. Dit naast je [triagepad voor hallucinaties](/blog/llm-hallucination-in-production) leggen voorkomt dat de twee playbooks elkaar om 22:00 tegenspreken.

## Een middag werk, of een hardening-traject

Elke call site pinnen, de model-ID aan je logs toevoegen en de modelnaam naar runtime-config verhuizen is echt een middag. Doe dat vandaag, voor al het andere, ook als je verder niets doet. Het is de hoogste verhouding tussen bescherming en inspanning in dit hele stuk.

De eval-snapshot is een ander formaat klus. Traffic samplen die de feature daadwerkelijk representeert, assertions schrijven die strikt genoeg zijn om drift te vangen en los genoeg om niet constant valse alarmen te geven, een judge-rubric kalibreren, de nachtelijke shadow run inrichten en drempels zetten die contact met normale variantie overleven: dat is één tot twee weken gericht werk, en het is precies het deel dat teams blijven uitstellen tot een update ze al een klantgesprek heeft gekost.

Die build, plus het rollbackpad en de monitoring die het triggert, is het grootste deel van wat een **Production Hardening**-traject van drie tot zes weken doet. Is je outputkwaliteit verschoven en kun je nog niet aantonen wat er is veranderd: de [servicespagina](/services) beschrijft de scope en via [contact](/contact) krijgen we het pinnen en loggen deze week geregeld.
