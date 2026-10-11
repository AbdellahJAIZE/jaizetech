---
title: "AI POC-audit bevindingen: 7 gaten die elke demo verbergt"
description: "De AI POC-audit bevindingen die het vaakst terugkomen: retrieval op schaal, kostenmodellen, evalsets, prompts en failover. Met zelftest van zes checks."
published: "2026-10-11"
tags: ["AI POC audit", "RAG", "LLM kosten", "AI productierijpheid", "evalset"]
ogImage: "/images/blog/ai-poc-audit-recurring-findings/cover.jpg"
primaryService: "ai-audit"
---
Ik pak bij elke audit van een AI proof of concept ongeveer dezelfde lijst erbij, en dat heeft me een tijd gestoord voordat ik begreep waarom. Een documentassistent voor een Nederlandse verzekeraar en een vision-model dat onderdelen telt op een transportband hebben technisch niets met elkaar te maken. De **AI POC-audit bevindingen** overlappen alsnog voor ongeveer tweederde.

De reden is niet dat engineers slordig werken. Het is dat een demo geoptimaliseerd is voor een andere uitkomst dan een product. Een demo moet iemand in een vergadering overtuigen. Om dat goed te doen verklein je de inputset, sla je de faalpaden over, hardcode je het gelukkige geval en kies je het model dat het mooiste antwoord geeft in plaats van het model dat je op volume kunt betalen. Elk van die keuzes is juist voor de demo en verkeerd voor productie, dus de gaten clusteren op dezelfde plekken.

Hieronder staan de zeven die het vaakst terugkomen, hoe ze er bij doorvragen echt uitzien, en de fix die ik meestal adviseer. Aan het eind staat een versie van zes checks die je zelf kunt draaien voordat je iemand betaalt om ze voor je te draaien.

## De demo is getest met tien documenten, nooit met tienduizend

Dit is de meest betrouwbare bevinding van allemaal. Iemand heeft retrieval gebouwd op een gecureerde map: tien contracten, twintig supporttickets, een handvol pdf's die toevallig netjes gestructureerd zijn. Retrieval ziet er uitstekend uit, want met tien documenten zet vrijwel elk embedding-model het juiste document in de top drie. Er is niets om het mee te verwarren.

Laad het echte corpus en er breken twee dingen tegelijk. Eerst verschijnen de bijna-duplicaten. Vijf versies van hetzelfde polisdocument uit verschillende jaren, en de retriever heeft geen begrip van recentheid, dus citeert hij vol overtuiging de versie uit 2019. Daarna begint ruis op chunk-niveau te winnen. Headers, footers, standaard juridische tekst en inhoudsopgaves liggen semantisch dicht bij veel queries, en op schaal zijn er duizenden van.

De fix is saai en werkt: bouw de index opnieuw op het volledige corpus voordat je iets anders aanraakt, en meet dan recall op een set echte queries. Voeg metadata-filters toe voor documentversie en datum, dedupliceer bij ingestion, en haal boilerplate eruit in de parser in plaats van te hopen dat de ranker het negeert. Over de precieze mechaniek schreef ik eerder in [waarom je RAG in productie breekt](/blog/rag-breaks-in-production), want de faalmodi zijn voorspelbaar genoeg om op te sommen.

De bevinding is zelden "retrieval is slecht". De bevinding is "retrieval is nooit geëvalueerd op de grootte waarop het gaat draaien", en dat is een ander en veel beter op te lossen probleem.

## Het kostenmodel rekent met de tokens van de demo

De meeste kostenschattingen van een POC zijn een extrapolatie van één meting: iemand heeft een representatieve query gedraaid, naar het tokengebruik gekeken, vermenigvuldigd met het verwachte volume, en een getal gekregen waarmee de business case uitkwam.

![AI POC-audit bevindingen: 7 gaten die elke demo verbergt](/images/blog/ai-poc-audit-recurring-findings/1.jpg)

Dat getal is bijna altijd te laag, en de redenen zijn steeds dezelfde. De demo-query had een korte context omdat retrieval drie chunks teruggaf; productie geeft er acht terug omdat de recall dat nodig had. De demo had geen gespreksgeschiedenis; productie sleept zes turns mee. De demo had geen retries; productie doet een retry op misvormde output, en een retry is een volledig nieuw gefactureerde call. Agentic flows zijn erger, want een loop die in tests gemiddeld vier tool calls doet, heeft op rommelige input een staart die gemiddeld veertien doet, en in die staart zit het geld.

Dan is er nog het deel dat niemand modelleert: het goedkope pad. In de meeste productiesystemen zou een flink deel van de requests het dure model helemaal niet moeten bereiken. Gecachte antwoorden, deterministische routing, een kleine classifier ervoor. Heeft de POC geen routinglaag, dan is de kostenschatting in feite "alles gaat voor altijd naar het grootste model", en het verschil tussen dat en een afgestemd systeem is groot genoeg om de bouwbeslissing te veranderen. De [vijf oorzaken achter een piek in LLM-kosten](/blog/llm-cost-spike-production) zijn allemaal al in een POC zichtbaar als je weet waar je moet kijken.

Volgorde van de fix: instrumenteer tokengebruik per request met p50 en p95, niet met een gemiddelde. Modelleer de kosten dan tegen p95, want dat is wat je factuur volgt.

## Er is geen evalset, dus "het werd beter" is een gevoel

Vraag een team hoe ze weten dat de laatste promptwijziging hielp en je krijgt doorgaans een variant op "we hebben een paar queries geprobeerd en het leek beter". Dat is geen kritiek op het team. Een evalset schrijven is roemloos werk dat geen zichtbare voortgang oplevert, en in een POC-fase wordt niemand ervoor beloond.

Het gevolg komt boven zodra twee mensen aan prompts beginnen te sleutelen. Verbetering op de queries die je toevallig test, regressie op de queries die je niet test, en geen manier om het verschil te zien. Ik heb een team drie weken heen en weer zien pendelen tussen twee promptversies, omdat elke wijziging de klacht van dat moment verhielp en iets brak waar niemand naar keek.

Wat ik in een audit vraag is bescheiden: 30 tot 50 echte voorbeelden met verwachte uitkomsten, uit daadwerkelijke gebruikersvragen of daadwerkelijke documenten, inclusief de gevallen die nu misgaan. Geen benchmark. Een regressienet. Het kost een dag of twee om bij elkaar te zetten en het is het nuttigste dat een POC-team kan doen voordat het opschaalt. Combineer het met [promptversiebeheer](/blog/prompt-versioning-regression-testing) zodat je een kwaliteitsverandering aan een specifieke diff kunt toeschrijven, en met [continuous eval](/blog/llm-evaluation-production-continuous-eval) zodra je verkeer hebt.

Teams schuiven dit vooruit omdat ze verwachten een scoringsframework nodig te hebben. Je hebt een lijst inputs nodig, verwachte outputs, en een script dat ze draait. Begin daar.

## Eén prompt doet retrieval, redeneren en formatteren tegelijk

Open de repository van vrijwel elke werkende POC en je vindt één prompt van 60 tot 200 regels die bepaalt welke context relevant is, over het antwoord redeneert, een tone of voice handhaaft en JSON uitspuugt. Hij werkt. Dat is precies wat hem gevaarlijk maakt.

Het probleem is dat je hem niet kunt debuggen. Zakt de outputkwaliteit, dan is er geen manier om te zien of het model het verkeerde heeft opgehaald, slecht heeft geredeneerd, of simpelweg het schema heeft gebroken omdat het redeneren lang werd en het geduld met de formatinstructies opraakte. Alle drie de symptomen zien er van buiten identiek uit: kapotte JSON, of een plausibel verkeerd antwoord.

Verantwoordelijkheden splitsen is meestal de fix. Retrieval en reranking in code, niet in de prompt. Redeneren in één call met een helder doel. Formatteren in een tweede goedkope call of, beter, via de structured output-modus van de provider met een schema dat je valideert. De winst in betrouwbaarheid is reëel en de kosten gaan vaak omlaag, omdat de redeneer-call niet langer 80 regels formatteerregels in elke request meesleept. [Fouten in gestructureerde output](/blog/llm-structured-output-failures-production) is precies wat dit voorkomt, en het is de bug die het minst waarschijnlijk op iemands dashboard staat.

Bij agent-POC's bestaat hier een tweede versie van: één prompt bevat de planning, de toolselectie en de stopconditie. Die faalt luider. Als niets de loop begrenst, lees dan [de guardrails die een ticket van 340 calls stoppen](/blog/ai-agent-loop-guardrails-production).

## Er is niets afgesproken voor als de leverancier een slechte dag heeft

Vraag wat er gebeurt als de model-API elf minuten lang 529's teruggeeft. In een POC is het eerlijke antwoord "de request faalt" of, iets erger, "we proberen het drie keer en dan faalt hij". Niemand heeft besloten wat het product zou moeten doen, want in een demo is de API nog nooit op een ongelegen moment plat gegaan.

Dit is een productbeslissing vermomd als infrastructuurkeuze. Voor een documentassistent is degraderen naar "retrieval werkte, hier zijn de drie bronpassages, geen samenvatting" vaak volstrekt acceptabel en veel beter dan een foutmelding. Voor een geautomatiseerde beslissing in een workflow kan het juiste antwoord zijn: in de wachtrij zetten en later verwerken. Voor een voice agent is een stilte van 30 seconden een verloren gesprek en heb je een warmgehouden fallback-model nodig. De engineering is rechttoe rechtaan zodra iemand beslist welke van die drie geldt. De bevinding is dat niemand dat heeft gedaan.

Het verwante gat is geen uitval maar stille verandering bij de provider. Een vastgepinde model-alias schuift ongemerkt op en de output drift zonder dat jij deployt. [Stille modelupdates](/blog/silent-model-updates-ai-feature) raken precies de teams zonder evalset, en daar overlapt deze bevinding met de derde.

## AI POC-audit bevindingen herhalen zich, los van de stack

Zet een stap terug van de losse punten en het patroon is schoon: elk van deze gaten is een plek waar de demo een redelijke scoping-beslissing nam die niemand als beslissing heeft opgeschreven. Klein corpus, één model, één prompt, geen faalpad, kwaliteit met het oog beoordeeld. Geen daarvan is een fout in een POC. Ze worden een fout op het moment dat de POC als fundament wordt behandeld in plaats van als experiment.

Dat verklaart ook waarom de overige twee bevindingen zo vaak voorkomen. Nummer zes is dat er geen enkele observability is, waardoor het eerste productie-incident gediagnosticeerd wordt door code te lezen in plaats van traces. Nummer zeven is dat toegangscontrole nooit over tenants heen is getest, omdat er in de demo data van één klant zat. [Waar je multi-tenant RAG echt lekt](/blog/multi-tenant-ai-feature-data-leaks) behandelt dat grondig, en het is de bevinding die ik het minst graag overbreng, want aan deze hangen juridische gevolgen.

## De zes checks die je draait voordat je iemand belt

Je kunt het grootste deel van een readiness-diagnose zelf in een middag reproduceren. Draai deze tegen je eigen demo:

1. **Schaal het corpus op.** Indexeer de volledige documentset, niet de steekproef, en draai twintig echte queries. Noteer hoe vaak de juiste bron in de top vijf staat.
2. **Meet p95-tokens.** Log input- en outputtokens per request voor een dag intern gebruik. Vermenigvuldig p95, niet het gemiddelde, met je verwachte volume.
3. **Schrijf dertig voorbeelden.** Echte inputs, verwachte outputs, inclusief drie die nu misgaan. Draai ze. Dat is je baseline.
4. **Tel de taken in je langste prompt.** Doet hij meer dan één van retrieval, redeneren of formatteren, dan heb je je betrouwbaarheidsplafond gevonden.
5. **Sloop de API-key.** Richt de app op een ongeldig endpoint en kijk wat de gebruiker ziet. Is het antwoord een stacktrace of een eeuwige spinner, dan is dat je faalontwerp.
6. **Query als de verkeerde gebruiker.** Neem een vraag die alleen uit de data van tenant A te beantwoorden valt en stel hem terwijl je als tenant B bent ingelogd.

Komen alle zes schoon terug, dan is je demo er beter aan toe dan de meeste en heb je nog geen externe audit nodig. Komt er bij vier van de zes iets boven, dan heb je een prioriteringsprobleem en geen kennisprobleem, en is het [prioriteitenraamwerk op vier assen](/blog/ai-poc-audit-priority-framework) nuttiger voor je dan nog een lijst risico's. Voor een langere versie van de zelftest gaat de [POC-zelfaudit met 15 checks](/blog/ai-poc-self-audit-checklist) per punt dieper.

Een POC Audit van één week bestaat om dit op een diepte te doen die je niet haalt terwijl je ook features aan het shippen bent: retrieval gemeten op het volledige corpus, een echt kostenmodel, de evalbaseline voor je uitgeschreven, en een 90-dagenplan dat zegt wat je in welke volgorde fixt. Heeft de zelftest hierboven je al verteld wat er stuk is en wil je een tweede paar ogen op de volgorde, dan staat de scope op de [dienstenpagina](/services) en kun je me bereiken via [contact](/contact).
