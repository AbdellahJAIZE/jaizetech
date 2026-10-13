---
title: "AI-feature legacy systeem integratie: waarom het dubbel kost"
description: "Een AI-feature legacy systeem integratie lijkt op modelwerk, maar auth, data en deploy bepalen écht de kosten en doorlooptijd."
published: "2026-10-13"
tags: ["AI-feature legacy systeem integratie", "legacy systemen", "RAG", "softwarearchitectuur", "AI-implementatie"]
ogImage: "/images/blog/ai-feature-legacy-system-integration/cover.jpg"
primaryService: "ai-features"
---
Een schadebehandelaar opent een dossier in de behandelapplicatie, leest de schadebeschrijving en switcht dan naar een aparte documentviewer om het polisblad te vinden, omdat die twee systemen alleen via een gedeeld polisnummer aan elkaar hangen en verder niets. Ze checkt de clausulehistorie in een derde scherm, typt vier regels samenvatting in een vrij tekstveld en zet een dekkingsvlag uit een dropdown met elf waarden, waarvan er drie sinds 2019 niemand meer heeft gebruikt. Zeg elf minuten per dossier, veertig dossiers per dag over het team. De AI-feature die de business wil is duidelijk: vat het dossier samen, stel de dekkingsvlag voor, laat de behandelaar de passages zien waarop dat is gebaseerd.

Vrijwel elke **AI-feature legacy systeem integratie** waar ik bij word gehaald, wordt begroot alsof die samenvatting het werk is. Het is misschien vijftien procent. De rest is het overnemen van iemand anders zijn autorisatiemodel, iemand anders zijn datamodel en iemand anders zijn releaseproces, en geen van die drie is ooit ontworpen met een uitgaande modelcall in gedachten.

Drie integraties zijn me bijgebleven omdat ze allemaal op een andere plek duur werden. Ik beschrijf ze als stackvormen in plaats van als klanten: een vijftien jaar oud .NET-schadeplatform, een Django-monoliet die negen jaar was doorgegroeid, en een logistiek planningssysteem waarvan de bron van waarheid een nachtelijke extract van een mainframe was. Dezelfde categorie AI-feature in alle drie. Heel verschillende rekeningen.

## Drie legacy stacks, drie plekken waar de weken verdwenen

In het schadeplatform was het modelwerk recht-toe-recht-aan en het rechtenwerk niet. Welke claims iemand mocht zien werd berekend in stored procedures, anders voor behandelaars, teamleiders, fraudeonderzoekers en externe experts, met overrides op vestigingsniveau die zich een decennium hadden opgestapeld. Retrieval moest dat allemaal respecteren, per request, op het moment van de query.

Bij de Django-monoliet was auth geen probleem. De data was het probleem. Negen jaar productbeslissingen betekende dat de tekst die we wilden ophalen op vier plekken leefde: een `description`-kolom, een `notes`-tabel zonder foreign keys, een JSON-blob die een feature uit 2021 had weggeschreven en die half gemigreerd was, en een documentstore met pdf's waarvan de metadata niet overeenkwam met de databaserijen die ernaar verwezen. Niemand kon me vertellen welke bron leidend was, want het antwoord was "hangt af van hoe oud het record is".

In het logistieke platform waren die twee beheersbaar. Daar ging het op deployment. Het releaseproces had een change window van twee weken, een CAB die op dinsdag vergaderde, en een harde regel dat geen enkele service uitgaande internetcalls mocht doen vanuit het productie-VLAN. De AI-feature was klaar in week vier en live in week elf.

Als je één ding meeneemt: in een brownfield AI-build is het model het voorspelbare deel. De kosten zitten in welke van de drie (auth, data of deploy) jouw organisatie het langst heeft laten verlopen.

## Wat AI-feature legacy systeem integratie bovenop een greenfield-schatting legt

Een greenfield-offerte gaat ervan uit dat de build zijn eigen identity provider, eigen schema en eigen deploypad kiest. Haal die drie vrijheden weg en je voegt werk toe dat niet kleiner wordt omdat het model beter is geworden.

![AI-feature legacy systeem integratie: waarom het dubbel kost](/images/blog/ai-feature-legacy-system-integration/1.jpg)

In mijn ervaring is de realistische opslag ten opzichte van een vergelijkbare greenfield-feature ruwweg 40 tot 80 procent in doorlooptijd, en die is niet gelijk verdeeld. Het mappen van auth en rechten is meestal één tot twee weken echt engineeringwerk plus de kalendertijd die het kost om een helder antwoord te krijgen op wie wat mag zien. Data-archeologie op een oud schema is één tot drie weken voordat je één regel retrievalcode schrijft, want je kunt niet chunken wat je niet vertrouwt. Een nieuwe service door een onbekend releaseproces krijgen varieert het wildst: een week als er een containerplatform en een self-service pipeline staan, vijf of zes weken als het antwoord een firewall-aanvraag en een security review bevat waar bij de kickoff niemand over sprak. Mijn stuk over [vier realistische doorlooptijden](/blog/how-long-to-build-an-ai-feature) gaat ervan uit dat je het deploytarget zelf bepaalt. Laat die aanname vallen en elk getal schuift naar rechts.

De eerlijke versie van een schatting scheidt de AI-feature van het integratievlak en prijst ze apart. Dat is ook hoe je een greenfield-offerte in brownfield-kleren herkent. Staat er een regel voor "modelintegratie" en niets voor rechtenmapping of pipeline-onboarding, dan is hij geschreven tegen een schone lei.

## Het rechtenmodel dat je overneemt, niet ontwerpt

Retrieval-augmented generation heeft in elke tutorial dezelfde vorm: embed het corpus, zoek erin, geef de top-chunks aan het model. Die vorm neemt stilzwijgend aan dat elke gebruiker elk document mag zien. Legacy systemen werken vrijwel nooit zo, en de rechtenlogica zit zelden op een plek die je netjes kunt bevragen.

Waar ik als eerste naar kijk: waar wordt autorisatie feitelijk berekend? Drie slechte antwoorden, in toenemende pijn: het zit in applicatiecode verspreid over controllers, het zit in stored procedures, of het zit in een Windows-groepsstructuur die een organogram uit 2014 nabouwt. In het schadeplatform was het optie twee plus optie drie. We zijn uiteindelijk de vector-index helemaal niet direct gaan bevragen. De flow werd: haal de claim-scope van de behandelaar op via de bestaande stored procedure, krijg een lijst claim-ID's terug, en doe dan een gefilterde vector search die tot die ID's beperkt is. Langzamer dan een ongefilterde search, en aanzienlijk correcter.

Dat patroon, eerst autoriseren en dan ophalen, is wat ik in brownfield-werk inmiddels standaard pak. Het heeft twee eigenschappen die tellen als je de feature aan een security officer moet uitleggen: de AI-feature wordt nooit een tweede, zwakkere bron van waarheid over rechten, en als de business volgend jaar een toegangsregel wijzigt, doen ze dat op één plek. Het alternatief, rechtenmetadata meekopiëren in je index bij ingest, is sneller te bouwen en is verouderd zodra iemand van team wisselt. Ik heb eerder geschreven over [waar multi-tenant RAG echt lekt](/blog/multi-tenant-ai-feature-data-leaks); binnen één legacy systeem zit het lek tussen gebruikersrollen in plaats van tussen klanten, en dat valt moeilijker op omdat niemand erop let.

Begroot het gesprek, niet alleen de code. Een schriftelijk antwoord krijgen op "wie mag dit document zien en waarom" kostte in twee van de drie gevallen meer tijd dan de implementatie.

## Je schema bepaalt het retrievalontwerp voordat jij dat doet

De Django-monoliet heeft me geleerd om retrieval niet meer op een whiteboard te ontwerpen voordat ik de echte tabellen heb gelezen. Chunkgrootte, embeddingstrategie en de vraag of je überhaupt een vector store nodig hebt, volgen allemaal uit hoe de data eruitziet. En oude data ziet er niet uit als een documentatiecorpus.

Concreet, de dingen die het ontwerp hebben omgegooid: records waarin de leidende tekst van kolom wisselde afhankelijk van de aanmaakdatum, dus ingest had per tijdvak eigen logica nodig in plaats van één query. Soft deletes via een `is_active`-vlag waar de helft van de codebase zich aan hield en de andere helft niet, waardoor de index vrolijk records zou opdiepen die de UI verbergt. Vrije tekstvelden met geplakte mailthreads inclusief ondertekeningen en juridische disclaimers, ruis die je retrievalkwaliteit sloopt als je het rauw embedt. En geen betrouwbare updated-at timestamp op één van de tabellen, wat het plan voor incrementeel herindexeren de nek omdraaide en ons naar change data capture op de replica duwde.

De reflex die je moet onderdrukken is de grote dataopschoning. Iemand gaat voorstellen om eerst het schema te fixen, en dat is een project van twee kwartalen dat het AI-budget zal overleven. De werkbare zet is een adaptatielaag aan de leeszijde: één goed getest module die de rommel normaliseert naar een schone documentvorm voor ingest, met de tijdvakspecifieke regels opgeschreven en onder test. Lelijk, begrensd, en het laat de migratievraag liggen waar hij hoort, bij het team dat de monoliet bezit. De [vier architectuurbeslissingen](/blog/ai-feature-architecture-decisions) die ik aan het begin van elke build neem, worden hier allemaal ingeperkt, en dat is prima zolang je het in week één ontdekt in plaats van in week zes.

## Een nieuwe service in een releaseproces dat ouder is

AI-features willen vaak deployen. Promptwijzigingen, retrieval-tuning, vastgepinde modelversies, eval-drempels: die bewegen in de eerste maanden productie wekelijks. Legacy releaseprocessen zijn gebouwd om verandering zeldzaam en auditeerbaar te maken. Dat is de botsing, en die is meer organisatorisch dan technisch.

In het logistieke geval waren de blokkades concreet en stond geen ervan in de oorspronkelijke scope. Uitgaand verkeer uit productie was dicht, dus de modelprovider moest binnen de bestaande cloud-tenancy bereikbaar zijn in plaats van over publiek internet, met een ander endpoint, een ander authmechanisme en een security sign-off. Er was geen staging met realistische data, dus retrievalkwaliteit kon alleen worden gevalideerd tegen een geschoonde extract die zich anders gedroeg dan productie. Secrets leefden in een configmanagementsysteem dat ouder was dan de vault van het bedrijf, dus de nieuwe service had een secret-pad nodig dat iemand moest goedkeuren. En de CAB vroeg terecht hoe een rollback eruitziet voor een feature waarvan het gedrag van een prompt en een modelversie afhangt, een vraag die je beter netjes beantwoordt dan wegwuift.

Wat werkt is de twee releasecadansen bewust loskoppelen. De service zelf gaat door het normale proces en verandert zelden. Prompts, retrievalparameters en eval-drempels leven in geversioneerde configuratie die kan wijzigen zonder deploy, achter een feature flag per gebruikersgroep, met de modelversie expliciet gepind zodat een provider-update geen onaangekondigde release wordt. Dat koopt je wekelijkse iteratie binnen een kwartaalrelease, en het is het meest waardevolle dat je tijdens scoping met platform en security afspreekt in plaats van erna. Pilots die dit overslaan vormen een flink deel van de pilots die [productie nooit halen](/blog/ai-pilot-to-production-scoping).

## Doe deze checks voordat je een getal accepteert

Zeven vragen, elk binnen een dag of twee te beantwoorden door iemand die al binnen je organisatie werkt:

- Waar wordt autorisatie berekend voor de data die de feature gaat lezen, en kan dat als functie worden aangeroepen vanuit een nieuwe service?
- Welke tabel of welk veld is leidend voor de tekst die je nodig hebt, en verandert dat antwoord voor oudere records?
- Is er een betrouwbaar wijzigingssignaal (timestamp, CDC, eventstream) voor incrementeel herindexeren, of ga je telkens alles opnieuw indexeren?
- Kan een nieuwe service in productie vandaag uitgaande calls doen naar de modelprovider van je keuze, zonder firewallwijziging?
- Wat is de kortste weg van gemergede code naar productie voor een nieuwe service, in kalenderdagen, inclusief goedkeuringen?
- Bestaat er een stagingomgeving met data die genoeg op productie lijkt om retrievalkwaliteit te valideren?
- Wie bezit de legacy codebase, en hoeveel van hun tijd is hier schriftelijk voor vrijgemaakt?

Elke vraag die je niet kunt beantwoorden is een begrotingsregel, geen detail. Geef de antwoorden aan wie de offerte maakt en kijk of de schatting verandert. Een leverancier die [een volledige build met alle lagen](/blog/full-ai-feature-build-scope-cost) heeft gedaan, past hem aan. Wie zegt dat het de planning niet raakt, heeft nog nooit met iets ouds geïntegreerd.

## Wat je vraagt aan iemand die alleen greenfield heeft gebouwd

Vraag welk legacy authmodel ze het laatst hebben overgenomen en hoe ze dat op retrieval hebben gemapt. Vraag naar de lelijkste schemabeslissing waar ze omheen moesten werken en wat ze kozen in plaats van het te repareren. Vraag wat hun deployverhaal is als het releaseproces van de klant per kwartaal loopt. Vraag wie aan hun kant met het platformteam praat, want als het antwoord "dat gaan we ervan uit dat dat intern geregeld is" is, dan ben jij dat, en dat werk zit niet in de begroting. De [technische vragen die elke AI-leverancier moet kunnen beantwoorden](/blog/vet-ai-vendor-before-you-sign) gelden nog steeds; deze vier zijn de brownfield-aanvulling.

De structurele reden dat deze projecten uitlopen is versnippering. Rechtenmapping, schema-archeologie en pipeline-onboarding hebben elk iemand nodig die de oude code kan lezen, met het platformteam kan praten en daarnaast de feature bouwt. Verdeel dat over een wrapper-shop en twee freelancers en de integratienaden worden statusoverleggen.

Een Full Build bij Jaize Tech is zes tot twaalf weken met één senior engineer die backend, frontend, modelintegratie, infrastructuur en deploy samen bezit. Dat is de vorm die dit werk nodig heeft zodra de AI-feature in een bestaande codebase moet leven. Scope je er een tegen een systeem dat ouder is dan je huidige stack, dan staat de scope op de [services-pagina](/services) en kun je me de zeven antwoorden hierboven sturen via [contact](/contact).
