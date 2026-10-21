---
title: "LLM non-determinisme in productie: wat temperature niet oplost"
description: "LLM non-determinisme productie is meer dan sampling: retrieval-orde, prompt-drift en modelwissels spelen mee. Zo meet en fix je het."
published: "2026-10-21"
tags: ["LLM non-determinisme", "productie AI", "RAG", "LLM evaluatie", "AI observability"]
ogImage: "/images/blog/llm-non-determinism-production/cover.jpg"
primaryService: "hardening"
---
De metric die deze discussie beslecht is answer agreement rate: zet één input vast, draai die N keer tegen het live systeem, en tel hoeveel semantisch verschillende antwoorden terugkomen. Met N=10 tegen een RAG-feature in productie is die telling vrijwel nooit 1. LLM non-determinisme productie laat zich zien als een lange staart: de meeste vragen wiebelen alleen in formulering, een paar veranderen tussen runs van inhoud, en juist die paar zijn waar stakeholders op reageren als ze beginnen te vragen of de feature stuk is.

Debuggen is lastig omdat het geen bug is. Het zijn vier of vijf onafhankelijke variantiebronnen die op elkaar gestapeld liggen, en slechts een deel daarvan is van jou om weg te halen. De meeste teams grijpen eerst naar de temperature-knop, omdat dat de knop is die ze kennen, merken dan dat het niet het hele werk doet en gaan de prompt herschrijven. Promptwijzigingen verplaatsen de variantie meestal in plaats van dat ze die verkleinen.

Hieronder wat temperature werkelijk regelt, waar de rest van de variantie binnenkomt, en hoe je consistentie meet zodat je gewone ruis kunt onderscheiden van een defect waarvoor je iemand uit bed belt.

## Temperature 0 koopt minder determinisme dan de docs suggereren

Bij temperature 0 stopt de sampler met samplen. Hij neemt per stap de argmax over de logits, waardoor het model elke keer zijn token met de hoogste kans uitspuugt in plaats van uit een distributie te trekken. Dat haalt sampling-ruis eruit, en het is de moeite waard als je stabiliteit wil. Het maakt de forward pass zelf niet reproduceerbaar.

Drie dingen bewegen nog steeds onder je voeten:

- **Batching verandert de rekensom.** Jouw request wordt op de GPU's van de provider gebatcht met requests van anderen. Floating point optelling is niet associatief, dus de reductie-orde binnen een matmul of een layernorm verandert de laatste bits van het resultaat afhankelijk van de vorm van de batch. Die vorm hangt af van gelijktijdig verkeer, en daar heb je geen controle over. Dit is de kern van wat de inference-community nu batch invariance noemt, en de meeste serving-stacks hebben het niet.
- **Bijna-gelijkspel klapt om.** Zitten de top twee tokens binnen een afrondingsfout van elkaar, dan kiest een verschil in de laatste bit een ander woord. Omdat generatie autoregressief is, kan één omgeklapt token op positie 40 de rest van het antwoord een ander pad in sturen. Kleine numerieke ruis, groot tekstueel gevolg.
- **Routing en caching voegen eigen paden toe.** Sparse mixture-of-experts modellen routeren tokens naar experts met capaciteitslimieten die afhangen van de batchsamenstelling. Speculative decoding en prefix caching introduceren nog meer codepaden die niet bit-identiek zijn aan het niet-versnelde pad.

De `seed`-parameter op de grote API's staat precies hierom gedocumenteerd als best effort, en de bijbehorende system fingerprint bestaat om je te vertellen wanneer de backend is veranderd. Temperature zero LLM determinism behandelen als een garantie is de aanname die in testsuites belandt en die vervolgens stil onbruikbaar maakt.

Zelf hosten op vaste hardware met een vaste batchgrootte brengt je veel dichterbij, en dat is één echt argument voor [on-prem inference](/blog/on-prem-llm-hosting-netherlands) bij workloads die reproduceerbare output nodig hebben. Op zichzelf geen reden, maar het hoort wel in de kolom.

## De andere bronnen van LLM non-determinisme in productie

Decoder-variantie is het stuk waar mensen over praten en meestal de kleinste bijdrage. In de systemen die ik heb gehardend komen de grotere uitslagen uit het feit dat het model niet twee keer dezelfde vraag krijgt.

![LLM non-determinisme in productie: wat temperature niet oplost](/images/blog/llm-non-determinism-production/1.jpg)

### Retrieval-orde is zelden stabiel

RAG retrieval variance is de meest voorkomende dader en het makkelijkst te missen, omdat de retrieval-stap een nette 200 logt en doorloopt. Approximate nearest neighbour indexen zoals HNSW zijn bewust approximatief: graph traversal hangt af van entry points en van `ef_search`, en gelijktijdige writes veranderen de graph. Scores komen gelijk uit, en als je sortering niet stabiel is met een expliciete tiebreaker op document-ID, wisselen twee chunks van plek. Sharded search merget resultaten in de orde waarin de shards antwoorden.

Chunk 3 en chunk 4 omwisselen klinkt onschuldig tot je bedenkt dat positie in de context gewicht draagt. Materiaal bovenaan en onderaan een lange context krijgt andere aandacht dan materiaal in het midden, dus het herordenen van dezelfde vijf chunks kan veranderen met welk feit het model besluit te openen. Is je retrieval-laag nieuw voor je, dan staan de faalmodi op een rij in [waarom RAG breekt in productie](/blog/rag-breaks-in-production).

### De prompt is niet de prompt die je denkt

Tel alles op wat per call in de uiteindelijke gerenderde string wordt geïnterpoleerd. De huidige datum. Een gebruikersprofiel dat vanmorgen is bijgewerkt. Gespreksgeschiedenis die wordt afgekapt zodra ze een tokengrens passeert, waardoor het request bij bericht 11 een andere vorm heeft dan bij bericht 10. Tool-schema's die worden samengesteld uit een registry waarvan de iteratie-orde niet is vastgezet. Elk van deze dingen levert legitiem andere input op, en dus legitiem andere output.

### Parallelle calls racen

Agents die naar meerdere tools uitwaaieren en de resultaten samenvoegen zijn inherent ordegevoelig, tenzij je de orde forceert. Als je resultaten aanplakt zoals ze binnenkomen in plaats van ze terug te zetten in een vaste slotorde, verschilt de context per run op basis van welke API die seconde snel was. Gedeeltelijke failures en retries maken het erger: een run waarin de derde tool timeoutte en opnieuw werd aangeroepen draagt extra observaties mee naar de volgende stap.

### Het model veranderde en niemand zei het

Aliassen als `gpt-4o` of `claude-sonnet-latest` wijzen naar snapshots, en snapshots bewegen. Een feature die in september consistent was kan in oktober gaan variëren zonder één commit aan jouw kant. Dat verdient een eigen behandeling en krijgt die in [stille modelupdates](/blog/silent-model-updates-ai-feature); de korte versie is: pin snapshot-ID's en log de fingerprint bij elke call.

## Parafrase-variantie en tegenspraak-variantie zijn verschillende incidenten

Niet alle non-deterministische AI-output is een probleem, en die twee soorten door elkaar halen is waarom deze gesprekken rondjes draaien. Twee antwoorden die hetzelfde zeggen in andere woorden zijn prima voor een chatoppervlak. Twee antwoorden die het oneens zijn over een bedrag, een datum, een toekenningsbeslissing of over de vraag of het document de vraag überhaupt dekt, zijn een defect, los van hoe de formulering eruitziet.

Classificeer variantie dus op claimniveau, niet op stringniveau. Haal per run de dragende inhoud eruit: de genoemde cijfers, de aangehaalde brondocumenten, het ja/nee-oordeel, de velden in de structured payload. Vergelijk dan die. Een feature die vrij parafraseert maar elke keer dezelfde vijf claims en dezelfde citaties teruggeeft is consistent in de enige zin die voor een gebruiker telt. Een feature die identiek proza teruggeeft op één ding na, namelijk dat het bedrag van €4.200 naar €4.800 verschuift, is stuk, en een string-diff test scoort dat als 97% overeenkomst.

Er is ook een derde categorie die ruis noch bug is: de vraag was ambigu en het model kiest elke keer een andere geldige lezing. "Wat is onze opzegtermijn?" tegen een documentset met drie contracttemplates heeft meerdere juiste antwoorden. Geen enkele mate van decoder-pinning lost dat op. De fix is disambiguatie in het product, of de retrieval beperken tot één contract voordat de vraag wordt beantwoord.

## Consistentie meten als eigen as

Accuracy-evals pakken dit niet. Draai elke evalvraag één keer, scoor tegen een referentie, en een vraag die 6 van de 10 keer goed is ziet eruit als pass of fail afhankelijk van welke run je toevallig vastlegde. Consistentie heeft zijn eigen meting nodig, en de vorm daarvan is simpel:
voor elk eval-item:
    draai N keer (N = 5 voor een goedkope gate, 20 bij onderzoek)
    extraheer claims / velden / citaties uit elke output
    agreement = aandeel run-paren dat het eens is over de dragende inhoud
rapporteer: gemiddelde agreement, slechtste item, items onder drempel

Twee dingen maken dit nuttig in plaats van decoratief. Eén: leg de volledige input naast de output vast, dus de gerenderde prompt, de opgehaalde document-ID's in orde, het modelsnapshot en de fingerprint. Zonder dat kun je niet zien of een afwijkende run andere context zag of alleen anders decodeerde, en dat is het verschil tussen een retrieval-fix en een sampling-fix. Twee: gate op het slechtste item, niet op het gemiddelde. Het gemiddelde verbergt de drie vragen die daadwerkelijk supporttickets opleveren.

Zet het daarna in CI naast je prompttests. Variantie is een regressiedoel zoals latency: een promptwijziging die de gemiddelde accuracy twee punten optilt en tegelijk de agreement op je tien belangrijkste vragen halveert is geen verbetering, en dat weet je alleen als beide getallen in hetzelfde rapport staan. Dit is het stuk dat teams overslaan, en de reden dat ik blijf pleiten voor een [continuous eval loop](/blog/llm-evaluation-production-continuous-eval) in plaats van een eenmalige benchmark, met [promptversiebeheer](/blog/prompt-versioning-regression-testing) eronder zodat je een variantiesprong kunt toeschrijven aan de wijziging die hem veroorzaakte. Retrieval krijgt eigen cijfers in [RAG evaluatie metrics](/blog/rag-evaluation-metrics-production).

## Wat je wegengineert, en wat de interface moet absorberen

Weg te halen met engineeringwerk:

- Pin modelsnapshots en alarmeer op fingerprint-wijzigingen.
- Zet temperature 0 en top_p 1 voor alles wat feitelijk of extractief is, en stuur een seed mee, ook al is die best effort.
- Maak retrieval deterministisch: stabiele sortering met expliciete tiebreaker, vaste `ef_search`, vaste chunk-orde in de prompt, en een bevroren index-snapshot voor evalruns.
- Canonicaliseer het samenstellen van context: vaste slotorde voor toolresultaten, gesorteerde keys, expliciete afkapregels in plaats van drempelgestuurde.
- Cache het antwoord op een hash van de volledige gerenderde input. Dit is de goedkoopste winst die er ligt. De meeste klachten in de categorie "gisteren gaf hij een ander antwoord" komen van een gebruiker die een pagina ververst die het model opnieuw draaide in plaats van het opgeslagen resultaat te tonen.
- Haal alles wat rekenwerk of een lookup is uit het model. Een feature die een LLM factuurregels laat optellen gaat variëren; SQL niet. Die afweging verdient vaker een herbezoek dan teams doen, en ik heb dat [uitgebreid betoogd](/blog/ai-feature-that-should-have-been-sql-query).

Niet weg te halen, dus ontwerp ervoor: ambigue vragen, antwoorden die echt uit meerdere bronnen komen, en vrije tekstgeneratie waar parafrase juist het punt is. Sla het gegeven antwoord op en toon dat, in plaats van het opnieuw te genereren. Laat de gebruikte bronnen zien zodat een gebruiker kan zien waarom twee antwoorden verschillen. Houd een auditspoor van de exacte tekst die is geserveerd, en maak hergenereren een expliciete actie in plaats van een bijeffect van navigatie.

## De non-fix

Het patroon dat ik het vaakst zie: een team zet temperature op 0, ziet de variantie misschien met een derde zakken, verklaart de kwestie afgehandeld en gaat door met shippen. Daarna screenshot een gebruiker twee tegenstrijdige antwoorden in een Slack-kanaal waar een CFO in zit. De decoder was nooit de hoofdbron, niemand had de retrieval-laag geïnstrumenteerd, en er bestond nergens een getal dat het probleem had zien verslechteren. De temperature verlagen is een redelijke eerste stap en een slecht eindpunt. Zonder [observability op de inputs](/blog/llm-observability-production-monitoring) tune je iets wat je niet kunt zien.

## Vragen die in deze gesprekken terugkomen

### Maakt een seed meesturen de output deterministisch?

Nee. Het haalt sampling-randomness weg, wat temperature 0 al doet, en het doet niets aan batch-afhankelijk floating point gedrag aan de kant van de provider. Zowel OpenAI als Anthropic documenteren hun reproduceerbaarheid als best effort. Gebruik het, log de teruggegeven fingerprint, en bouw geen testsuite die byte-identieke output aanneemt.

### Is temperature 0 slecht voor antwoordkwaliteit?

Voor extractie, classificatie, structured output en gegronde vraag-antwoord is greedy decoding meestal de juiste default, en behandel ik alles anders als een keuze die onderbouwing nodig heeft. Voor schrijven, brainstormen of copy levert een hogere temperature betere resultaten, en consistentie is daar ook niet wat je wil. De fout is één instelling toepassen op een feature die beide doet.

### Hoeveel runs heb ik nodig om LLM output consistency te meten?

Vijf runs per evalitem is genoeg om de duidelijk instabiele vragen te pakken en goedkoop genoeg om bij elke promptwijziging te draaien. Onderzoek je een specifieke klacht, ga dan naar 20 runs op die ene input, want de tegenspraken die tickets opleveren zijn vaak een één-op-tien gebeurtenis die vijf runs missen.

### Lost het model zelf hosten dit op?

Het lost een deel op. Met vaste hardware, een gepinde engineversie en gecontroleerde batchgroottes kom je heel dicht bij bit-reproduceerbare inference, en je verwijdert stille modelupdates volledig. Het doet niets voor retrieval-orde, context-assemblage, races tussen parallelle tools of ambigue input, en dat is in mijn ervaring het grootste deel van de variantie die gebruikers daadwerkelijk opmerken.

### Kan ik gebruikers niet simpelweg melden dat antwoorden kunnen variëren?

Dat kan, en het koopt niets zodra twee antwoorden elkaar tegenspreken over een getal waar iemand op het punt staat naar te handelen. De nuttige versie is de bronnen achter het antwoord tonen en vastleggen wat er geserveerd is, zodat een meningsverschil inspecteerbaar wordt in plaats van mysterieus.

Variantie die niemand meet is het soort defect dat door een klant wordt gevonden en niet door een test. Een Production Hardening traject (drie tot zes weken) is hiervoor gebouwd: een evalset die consistentie als eigen as scoort naast accuracy, promptversiebeheer en gepinde modellen zodat wijzigingen toewijsbaar zijn, en monitoring die drift laat zien voordat die een supportwachtrij bereikt. De scope staat op de [servicespagina](/services), en komt dezelfde vraag nu al op verschillende dagen anders terug, [vertel me dan wat je ziet](/contact).
