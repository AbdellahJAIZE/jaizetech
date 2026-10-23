---
title: "POC Audit vs Leverancier Review: Wie Vertel Je Wat Niet Klopt"
description: "Een vergelijking tussen poc audit en leverancier review laat zien waar incentives botsen: drie bevindingen die een gratis review bijna nooit opschrijft."
published: "2026-10-23"
tags: ["POC audit", "AI-leverancier", "due diligence", "AI-implementatie", "productiegereedheid"]
ogImage: "/images/blog/poc-audit-vs-free-vendor-review/cover.jpg"
primaryService: "ai-audit"
---
De meeste opdrachtgevers die ik spreek behandelen het gratis "laat ons even naar je prototype kijken"-gesprek van een bureau als een goedkopere versie van een betaalde audit. De input lijkt identiek: iemand leest je repo, draait je demo, vraagt naar traffic en vertelt je daarna wat er stuk is. De output lijkt ook identiek, een lijst problemen in ruwe prioriteitsvolgorde. Het enige zichtbare verschil is de factuur, dus de rationele keuze lijkt de gratis variant.

Ik moet mijn eigen belang benoemen voordat ik verder ga: ik verkoop POC-audits, wat mij de minst neutrale persoon maakt om een vergelijking tussen poc audit en leverancier review te schrijven. Dus heb ik de versie opgeschreven die ik zelf als opdrachtgever zou willen krijgen, inclusief het stuk waar de gratis review de juiste keuze is en je je geld beter houdt.

De twee dingen zijn niet hetzelfde product op twee prijspunten. Het zijn verschillende producten met verschillende taken, en de problemen beginnen zodra een document dat geschreven is om een build te winnen wordt gebruikt om een budget te bepalen of een go/no-go te halen.

## De gratis review weet ruwweg al wat eruit gaat komen

Het format is consistent genoeg om te voorspellen. Dertig tot vijfenveertig minuten, een salesmens plus een tech lead, een kwartier waarin jij demonstreert, tien minuten vragen over gebruikers en datavolume, vijf minuten bevindingen, en twee dagen later een mail met een one-pager en een voorstel in de bijlage. De bevindingen in die mail zijn meestal echt. Niemand verzint iets. Je evals ontbreken waarschijnlijk, je retrieval is waarschijnlijk naïef, je promptlaag heeft waarschijnlijk geen versiebeheer.

Wat je leest is een steekproef uit een specifieke verzameling: de problemen die toevallig oplosbaar zijn met de dienst die de afzender aanbiedt. Dat is geen fraude, het is simpelweg hoe een tech lead met dertig minuten en een conversiedoel zijn aandacht verdeelt. Hij draait jouw POC niet tegen een representatieve queryset. Hij pattern-matcht jouw architectuur tegen de vorm van werk dat zijn team al goed doet, en schrijft op wat hij daar vindt.

## Poc audit versus leverancier review: het incentive is het hele verschil

Kijk naar wanneer elke opdracht eindigt. Een betaalde, onafhankelijke AI-audit eindigt bij oplevering van het rapport. Het rapport is het product, dus wat geoptimaliseerd wordt is of de bevindingen overeind blijven als jouw engineers ze lezen, inclusief de bevindingen die het werk kleiner maken. Een gratis leverancier-review eindigt als je de opdrachtbevestiging ondertekent. Het voorstel is het product, en de review is het argument ervoor.

![POC Audit vs Leverancier Review: Wie Vertel Je Wat Niet Klopt](/images/blog/poc-audit-vs-free-vendor-review/1.jpg)

Die twee optimalisaties overlappen op de meeste technische bevindingen, en precies daarom voelt de gratis review geloofwaardig. Ze lopen uiteen op drie categorieën, en dat zijn de categorieën die je budget bewegen: elke bevinding die scope verkleint, elke bevinding die concludeert dat je dit helemaal niet moet bouwen, en elke bevinding over de leverancier die de review doet. Een belangenconflict bij een AI-leverancier verschijnt niet als een leugen. Het verschijnt als een gat waar een conclusie had moeten staan.

## Drie bevindingen die een gratis review doorgaans opblaast

**Rebuild-scope.** "Dit prototype is niet productiewaardig, wij zouden de pipeline netjes herbouwen" is een verdedigbare zin over vrijwel elke POC. De nuttige versie is een triage: welke componenten blijven zoals ze zijn, welke hebben hardening nodig, welke moeten echt vervangen worden. Een rebuild-advies dat niet benoemt welke delen het bewaren waard zijn, is niet onderbouwd maar aangenomen.

**Infrastructuur die past bij hun bankzitters.** Een team waarvan de laatste vier projecten LangGraph op Kubernetes waren, vindt een LangGraph-op-Kubernetes-probleem in jouw FastAPI-service. Soms terecht. De vraag om door te drukken is wat er breekt bij jouw werkelijke load, niet bij een load die je misschien in jaar drie haalt.

**Permanente operationele afhankelijkheid.** Evals, monitoring en promptversiebeheer zijn echte behoeften, en ik heb genoeg geschreven over [kwaliteitsverlies zien voordat de klant het doet](/blog/llm-observability-production-monitoring) om niet het tegendeel te beweren. Maar "je hebt ons op retainer nodig hiervoor" en "hier zijn vier metrics, een dashboard en een wekelijkse review die je eigen team binnen een maand bezit" zijn verschillende conclusies uit identieke feiten. Slechts één van de twee heeft een maandelijkse factuur eronder.

## Twee conclusies die er vrijwel nooit uit komen

De eerste is dat je de build niet nodig hebt. Soms is de eerlijke bevinding dat de POC prima is voor veertig interne gebruikers en pas omvalt bij vierduizend, en dat de juiste zet is om hem smal uit te rollen en er over zes maanden opnieuw naar te kijken. Soms, en dat heb ik meer dan eens gezien, [had de AI-functie eigenlijk een SQL-query moeten zijn](/blog/ai-feature-that-should-have-been-sql-query) en is het LLM decoratie over een rapportageprobleem. Geen bureau komt daar in een salesgesprek op uit, want daar uitkomen beëindigt het salesgesprek.

De tweede is dat de leverancier in de kamer niet de juiste match is. Als jouw POC een computer vision-pipeline op fabriekshardware is en het reviewende team negen RAG-assistenten en nul edge-deployments heeft opgeleverd, zegt de eerlijke review dat. Ik heb er nog nooit een gezien die dat deed. Verwante gaten: gratis reviews prijzen zelden de oplevering, zeggen zelden wie in maand vier eigenaar is, en noemen zelden wat weggaan je kost. Dat zijn de vragen die ik op de lijst zou zetten van [vragen die wrapper-shops ontmaskeren](/blog/vet-ai-vendor-before-you-sign), en het zijn precies de vragen die een gratis review structureel niet over zichzelf stelt.

## Wanneer de gratis review wél genoeg is

Als eerste gevoelscheck voordat je een budget hebt is hij goed, en hij kost je een uur. Neem hem als je wil weten of een competente buitenstaander in vijf minuten iets alarmerends ziet, als het om een intern tool gaat in plaats van een klantgerichte feature, of als je zelf technisch genoeg bent om de stukken weg te filteren die verdacht goed op de capaciteit van de verkoper passen.

De onderschatte variant is er drie doen. Vraag gratis reviews bij drie leveranciers die niet van elkaar weten en vergelijk. Bevindingen die alle drie onafhankelijk benoemen zijn bijna zeker echt, want er is geen gedeeld belang dat ze produceert. Bevindingen die maar één leverancier opbrengt, vooral die waarvoor zijn specialisme nodig is, gaan in een andere kolom. Die triangulatie is een goedkope vervanger voor onafhankelijkheid en werkt beter dan de meeste opdrachtgevers verwachten.

Hij houdt op genoeg te zijn op het moment dat het document dragend werk gaat doen: een budget zetten dat je bij een board verdedigt, build-versus-buy beslissen, of een scope kiezen waar je op afgerekend wordt. Ook als er maar één bieder is, want dan komen de review en de offerte uit dezelfde pen zonder iets om ze tegen te controleren.

## Eén vraag die laat zien in welke kamer je zit

Stel deze, hardop, vroeg: "Als jullie eerlijke conclusie is dat we dit niet moeten bouwen, of dat jullie team niet de juiste partij is, wordt dat dan ook opgeschreven en naar mij gestuurd?"

Het antwoord is minder belangrijk dan wat eromheen gebeurt. Een leverancier die zegt "ja, en hier is een geval waarin we dat deden" is het luisteren waard. Vaagheid is ook een antwoord. Vraag daarna wat ze daadwerkelijk gaan meten. Een review zonder cijfers, zonder p95-latency op een echte queryset, zonder kosten per request, zonder retrieval hit rate tegen een steekproef van je eigen vragen, is een geïnformeerde indruk. Dat is iets waard, maar het is geen bevinding. Mijn eigen lijst van [wat een echt productierapport bevat](/blog/ai-poc-audit-report-checklist) is een redelijke lat om beide partijen aan te houden, gratis of betaald.

## Wat onafhankelijkheid je werkelijk koopt

Geen moreel gehalte. Een andere uitbetalingsstructuur. Als het rapport de deliverable is, heb ik geen reden om de fixlijst op te blazen en een sterke reden om hem contact met jouw engineers te laten overleven, want dat rapport gaat naar de leveranciers bij wie je offertes opvraagt en mijn naam staat eronder. Dat betekent ook dat het bewust overdraagbaar is: een POC-auditrapport moet bruikbaar zijn met welk team je daarna ook kiest, inclusief het bureau dat je de gratis review gaf en de helft hiervan niet noemde.

Onafhankelijkheid heeft grenzen die je vooraf moet weten. Een audit van een week meet wat in een week te meten is, en daarom houd ik een geschreven lijst bij van [wat een readiness-audit niet dekt](/blog/poc-audit-scope-limits). En als je POC klein is, je planning ruim en niemand een kwartaal op het spel zet, is de gratis review plus je eigen oordeel een verstandige keuze. De echte vergelijking qua kosten van een poc-audit is niet tegen nul, maar tegen [wat een gebroken launch je kost](/blog/poc-audit-cost-vs-failed-launch) aan herbouw, verloren kwartalen en geloofwaardigheid bij de mensen die het budget goedkeurden.

## Vragen die ik hierover krijg

**Is een gratis leverancier-review überhaupt de moeite?**
Ja, als eerste signaal en als manier om te zien hoe een leverancier denkt. Behandel de bevindingen als een hypotheselijst, niet als een werklijst, en markeer welke toevallig het specialisme van die leverancier vereisen.

**Mag ik een betaald auditrapport delen met de leveranciers die de build offreren?**
Dat is een van de hoofddoelen. Een specifieke, gemeten probleemlijst maakt vage offertes vergelijkbaar, omdat elke bieder dezelfde scope prijst in plaats van zijn eigen te verzinnen.

**Moet ik een leverancier vertellen dat ik eerst een onafhankelijke audit laat doen?**
Ja. De goede partijen verwelkomen het, want een afgebakende scope verlaagt ook hun risico. Een leverancier die argumenteert tegen een audit heeft je gratis iets nuttigs verteld.

**Heeft een onafhankelijke auditor toegang tot onze productiesystemen nodig?**
Meestal niet. Leesrechten op de repo, een werkende demo-omgeving, representatieve voorbeelddata en de logs die er zijn, zijn normaal gesproken genoeg voor een week meten.

Als je op het punt staat echt budget vast te leggen voor een build en je enige technische beeld van de POC komt van de partij die erop biedt, is dat het gat dat een POC Audit van één week dicht: een meting met vaste scope van wat er breekt bij schaal, een geprioriteerde fixlijst en een 90-dagenplan om live te gaan, geschreven om te gebruiken met welke leverancier je ook kiest. De scope staat op de [dienstenpagina](/services), en wil je bespreken of jouw prototype in dat stadium zit, [neem contact op](/contact) met wat het doet en ruwweg hoeveel gebruikers het moet overleven.
