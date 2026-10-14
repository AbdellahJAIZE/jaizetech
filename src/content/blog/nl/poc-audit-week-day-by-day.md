---
title: "POC-audit week: wat een senior engineer écht test"
description: "Een POC-audit week is geen code review maar vijf dagen meten: load, kosten en evals tegen jouw echte data, met rapport en plan."
published: "2026-10-14"
tags: ["POC-audit", "AI-audit", "productierijpheid", "LLM-kosten", "RAG-evaluatie"]
ogImage: "/images/blog/poc-audit-week-day-by-day/cover.jpg"
primaryService: "ai-audit"
---
Niemand boekt een week senior engineeringtijd op gevoel, dus de vraag die ik het vaakst krijg vóór een **POC-audit week** begint is een variant op "wat doe je woensdag dan precies?". Dat is een terechte vraag. Op de regel staat één week, bij de deliverables staat een rapport plus een readout-call, en in de ruimte daartussen vult de verbeelding van een koper stilletjes "code review met een duurdere factuur" in.

Dat beeld is op een specifieke, controleerbare manier verkeerd. Je repository doorlezen is ongeveer de helft van maandag. Een code read kan me vertellen dat je retrieval-functie er gezond uitziet. Hij kan me niet vertellen dat die functie in 300 milliseconden terugkomt op de 400 documenten op de demo-laptop en vier seconden nodig heeft op je echte corpus van negentigduizend. Dat laatste bepaalt of je in maart of in juni live gaat. Code review voorspelt, tests meten. De week is opgebouwd rond meten, en daar herken je ook een serieuze audit aan.

Hieronder de echte vorm van de vijf dagen, wat ik per dag van jouw kant nodig heb, en de signalen die een leverancier verraden die de week vooral gaat vullen met schrijven in plaats van draaien.

## De repo lezen is het goedkoopste deel van de week

Statische review van een AI-prototype is snel en echt nuttig, maar vindt een smalle klasse problemen: ontbrekende timeouts, ongelimiteerde loops, secrets in config, geen retry-beleid, prompts die met stringconcatenatie in elkaar worden gezet zonder enige versiehistorie. Allemaal reële bevindingen, en ik kijk er serieus naar. Het probleem is dat de fouten die een launch slopen gedragsmatig zijn. Latency onder concurrency, kosten bij het 95e percentiel van de inputgrootte, retrieval-kwaliteit op documenten waarmee niemand heeft getest, en wat het systeem doet als de provider negentig seconden lang een 503 teruggeeft. Niets daarvan staat in een diff.

De week besteedt daarom zo'n vier uur aan lezen en de rest aan load, echte data en opzettelijke storingen door het systeem heen duwen. Als een auditvoorstel nergens vermeldt dat jouw systeem gedraaid gaat worden, koop je meningen. De mijne zijn goedkoper bij een kop koffie.

## Dag 1: intake, toegang, en bepalen wat er getest wordt

Maandag begint met een intakecall van 90 minuten. Ik wil daar drie mensen bij: de engineer die de demo heeft gebouwd (niet onderhandelbaar, want de ongedocumenteerde keuzes zitten in zijn of haar hoofd), degene die straks piket draait op deze feature, en de budgethouder voor de eerste twintig minuten. De vragen zijn onspannend. Wat doet dit voor een echte gebruiker, in één zin. Hoeveel requests per dag bij livegang, en van hoeveel gelijktijdige gebruikers. Wat is het ergste dat gebeurt als de output fout is en niemand het ziet. Wie neemt de telefoon op als het op zaterdag stukgaat.

![POC-audit week: wat een senior engineer écht test](/images/blog/poc-audit-week-day-by-day/1.jpg)

De tweede helft van maandag gaat over toegang, en daar verdampen weken als niemand iets heeft voorbereid. Ik vraag om leesrechten op de repository, een manier om het systeem te draaien (een staging-omgeving of een lokale setup die daadwerkelijk opstart), een sample van echte productiedata of het dichtstbijzijnde dat juridisch toelaat, API-keys met hun eigen spend cap zodat mijn loadtests niet op jouw productierekening landen, en wat er al aan observability ligt, al is het alleen stdout-logging. Dat lijstje op vrijdag van de week ervoor regelen is het meest renderende dat een klant kan doen.

Maandag eindigt met een geschreven testplan: vijf tot tien dingen die ik ga meten, met de drempelwaarden die als probleem gelden. Je krijgt dat diezelfde avond. Vind je dat ik de verkeerde dingen meet, dan is maandagavond het moment om dat te zeggen. Donderdag is de week al opgemaakt.

Eén eerlijke aftakking: als de demo door niemand te draaien is, verandert de opdracht van vorm en zeg ik dat op dag één, in plaats van een week archeologie te factureren. Dan hebben we meestal het andere gesprek, over [auditen, hardenen of toch opnieuw bouwen](/blog/ai-demo-diagnostic-audit-harden-rebuild).

## Dag 2 en 3: load, kosten en evals tegen jouw data

Deze twee dagen zijn de motor van het AI readiness audit-proces, en ze lopen als drie parallelle sporen.

**Load.** Ik duw het systeem aan met Locust of k6, met een profiel dat lijkt op jouw verwachte verkeer in plaats van een plat gemiddelde aan requests per seconde, want AI-features vallen om op concurrency-patronen. Waar ik naar zoek is het punt waarop p95-latency niet-lineair wordt: connection pools die leeglopen, een vector index die nooit voor deze corpusgrootte is gebouwd, rate limits die 429's teruggeven die jouw code als fataal behandelt, tool calls die serieel worden uitgevoerd in een agent loop die niemand heeft afgekapt. De oplevering is een getal en een curve, geen oordeel.

**Kosten.** Ik meet tokenaantallen per request tegen jouw echte inputs. Demo-inputs zijn kort, schoon en uitgekozen door de bouwer van de demo. Productie-inputs bevatten de gescande bijlage van 40 pagina's en de mailthread met elf lagen quoted reply. Ik reken kosten per request uit bij mediane en bij p95-inputgrootte, en vermenigvuldig dat met je launchvolume. Daar ontdekken de meeste teams dat hun unit economics op het happy path waren gemodelleerd, de eerste van de [vijf oorzaken achter kostenpieken](/blog/llm-cost-spike-production) die ik blijf tegenkomen.

**Evals.** Ik bouw een kleine gelabelde set uit jouw echte data, meestal 50 tot 150 cases. Dat kost je domeinexpert een uur of twee, en dat is het waardevolste uur van de week. Daarna scheid ik retrieval-kwaliteit van generatiekwaliteit, want als de output fout is wil je weten of de juiste chunk nooit is opgehaald of dat hij wel is opgehaald en genegeerd. Heb je dit nog nooit gedaan, dan is de uitkomst je [eerste echte baseline](/blog/rag-evaluation-metrics-production). Geen rapportcijfer. Een getal om tegen te verbeteren.

Daarnaast forceer ik storingen: de provider midden in een request afknijpen, malformed en te grote input versturen, de context voorbij zijn limiet duwen, een rechttoe-rechtaan prompt-injectiestring erin gooien. Die tests kosten een middag en leveren consequent de bevindingen op die klanten het langst bijblijven. Over opdrachten heen blijven dezelfde [zeven gaten terugkomen](/blog/ai-poc-audit-recurring-findings), wat in één opzicht geruststellend is en in een ander opzicht deprimerend.

## Dag 4: bevindingen ordenen tot een 90-dagenplan

Donderdag is synthese, en dat is de dag die een nuttige audit onderscheidt van een lijstje. Woensdagavond heb ik doorgaans twintig tot veertig bevindingen liggen. Een dump van veertig items is geen plan, het is huiswerk zonder deadlines, en het wordt één keer doorgescrold en gearchiveerd.

Donderdag gaat dus op aan rangordenen. Elke bevinding krijgt een score op blast radius, waarschijnlijkheid, inspanning, en of het oplossen ervan andere fixes deblokkeert. Dat is de [ordening op vier assen](/blog/ai-poc-audit-priority-framework) die ik voor elke punchlist gebruik. Daarna klapt die gerangschikte lijst in op drie horizonnen: wat waar moet zijn vóór één externe gebruiker dit aanraakt, wat waar moet zijn vóór je de uitrol verbreedt, en wat kan wachten tot de feature de investering heeft verdiend. Dat is het 90-dagenplan voor AI, en het is zo geschreven dat jouw eigen engineers het zonder mij kunnen uitvoeren.

De rest van donderdag is schrijven. Het rapport heeft een vast skelet: metingen, bevindingen, het plan, en de dingen die ik niet kon testen met de reden waarom. Die [structuur heb ik vastgelegd](/blog/ai-poc-audit-report-checklist) zodat je weet wat je ontvangt. Soms is de eerlijke conclusie ongemakkelijk: hard deze retrieval-laag niet, vervang hem, of deze specifieke feature [had nooit een LLM nodig gehad](/blog/ai-feature-that-should-have-been-sql-query). Ook dat komt in het rapport.

## Dag 5: de readout, en wat het niet is

Het rapport ligt donderdagavond in je inbox, zodat mensen het kunnen lezen voordat ze erover praten. Vrijdag is een AI-audit readout-call van 60 minuten: tien minuten over wat er is gemeten en hoe, twintig over de drie of vier bevindingen die je roadmap veranderen, twintig over het 90-dagenplan met het sequencing-argument eronder, tien voor vragen. Ik wil dezelfde mensen als op maandag, plus iedereen die gevraagd gaat worden de volgende fase te financieren.

Wat een readout de moeite waard maakt, is dat het geen salesgesprek is. Het plan benoemt eigenaren en inspanningsschattingen voor jouw team, niet voor mij. Is de lijst kort en zijn je engineers capabel, dan zeg ik het stille deel hardop: je hebt mij de komende drie weken niet nodig, ga dit doen. Dat is meer dan eens gebeurd en het is de juiste uitkomst van een week die aan meten is besteed in plaats van aan verkopen.

## Zo verraadt een opgeblazen POC-audit week zichzelf

Vóór je ondertekent zijn de signalen al zichtbaar in het voorstel:

- **Geen toegangsverzoek vóór dag één.** Als niemand om keys, data en een draaibare omgeving heeft gevraagd, gaat er niets gedraaid worden.
- **Deliverables beschreven zonder één meting.** "Maturity assessment" en "readiness score" met een radardiagram betekent dat iemand je team gaat interviewen en de antwoorden gaat herschikken.
- **Geen evalset.** Een AI-audit die geen baseline voor kwaliteit oplevert, heeft het moeilijkste deel overgeslagen.
- **Weigeren om tools te noemen.** Echt testen gebeurt met concrete dingen. Vaagheid hier is een signaal.
- **Bevindingen die ook vóór het zien van jouw systeem geschreven konden worden.** "Overweeg monitoring te implementeren en governance in te richten" geldt voor elk bedrijf op aarde.
- **Een POC-audit tijdlijn waarvan de eerste aanbeveling toevallig een traject van zes maanden bij dezelfde leverancier is.**

Doe ook dit eerst: loop de [vijftien checks](/blog/ai-poc-self-audit-checklist) langs die je eigen team in een middag kan doen. Kun je alle vijftien met getallen beantwoorden, dan heb je waarschijnlijk van niemand een week nodig.

## Vrijdagmiddag

Wat je aan het eind in handen hebt is smal en concreet: gemeten latency- en kostencurves tegen je echte data, een baseline voor retrieval en generatie waartegen je kunt regressietesten, een gerangschikte lijst van wat er breekt en in welke volgorde je het oplost, en een 90-dagenplan met genoeg detail om een budgetgesprek mee in te gaan. Dat is doorgaans genoeg om de enige vraag te beantwoorden die dit kwartaal telt: shippen, fixen of stoppen. De [rekensom tegen een mislukte launch](/blog/poc-audit-cost-vs-failed-launch) maakt die keuze meestal makkelijk.

Die week is de POC Audit: één week, één senior engineer, met aan het eind een rapport en een readout van 60 minuten. Scope en wat erbij hoort staan op de [servicespagina](/services), en wil je weten of jouw prototype in het juiste stadium zit, [vertel me dan wat je hebt gebouwd](/contact) en ik zeg het je recht voor z'n raap.
