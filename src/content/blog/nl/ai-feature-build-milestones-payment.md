---
title: "AI-feature bouw mijlpalen: zo voorkom je een mislukte sprint"
description: "Leer hoe goede AI-feature bouw mijlpalen scope creep voorkomen en elke betaling koppelen aan iets dat echt werkt en draait."
published: "2026-10-10"
tags: ["AI-feature ontwikkeling", "SOW", "projectmanagement", "softwareontwikkeling", "AI-implementatie"]
ogImage: "/images/blog/ai-feature-build-milestones-payment/cover.jpg"
primaryService: "ai-features"
---
De meest voorkomende manier waarop een AI-build van 6 tot 12 weken misloopt is niet technisch. Het is dat in week 4 niemand in de kamer met bewijs kan zeggen of week 4 productief was. De engineer zegt dat de retrieval-kwaliteit "de goede kant op gaat". De CTO ziet een demo in Slack met drie zorgvuldig gekozen queries. Iedereen is het erover eens dat het veelbelovend oogt, en het eerste echt slechte nieuws arriveert in week 10, als er geen budget meer is om erop te reageren.

Goede **AI-feature bouw mijlpalen** bestaan om die ruimte weg te halen. Niet om papierwerk te maken, en niet om de leverancier een betaalmoment te geven, maar om één specifieke vraag op een specifieke datum beantwoordbaar te maken: kunnen we dit deel van het systeem draaien, op echte data, en zien wat het doet?

Ik heb deze SOW's aan beide kanten van de tafel geschreven en ondertekend. De structuur hieronder is wat ik nu gebruik, en de reden dat ik hem gebruik is dat hij mijn eigen vertraging vroeg genoeg heeft opgevangen om er nog iets aan te doen.

## Fixed price met een demo aan het eind, of een kalender in drieën

Twee SOW-vormen domineren, en ze falen in tegengestelde richtingen.

De eerste is fixed price, fixed scope, één oplevering. Je spreekt een spec af, je spreekt een bedrag af, en het volgende formele checkpoint is acceptatie. Comfortabel om te ondertekenen en verschrikkelijk om uit te voeren, want een AI-build is precies het soort werk waarbij de eerste twee weken veranderen wat de juiste architectuur is. Retrieval blijkt een andere chunking-strategie te vragen. De "schone" data van de klant bevat drie jaar aan vrije tekstvelden. Met één checkpoint aan het eind verdwijnt elke ontdekking geruisloos in de marge van de leverancier, of stilletjes uit de scope, en in week 10 hoor je welke van de twee het was.

De tweede is de 30/30/40-verdeling, of 40/30/30, of simpelweg in drieën. Die zien eruit als mijlpalen maar zijn een kalender in vermomming. Betaling twee valt "aan het eind van week 5", en week 5 komt er of er nu iets werkt of niet. Ik heb een hele AI project SOW structure gezien waarin het enige acceptatiecriterium aan een betaling het woord "voortgang" was. Dat is geen mijlpaal, dat is een dagboekaantekening.

Rapporteren in procenten-gereed maakt het erger. Software is lang 90% klaar, en AI-features zijn hierin bovengemiddeld gemeen omdat die laatste 10% meestal evalkwaliteit en foutafhandeling is, en dat is het grootste deel van het echte werk. Het scope creep AI project-probleem is niet dat scope verandert. Scope verandert altijd. Het is dat kalendergebonden betalingen niemand een reden geven om die verandering te melden zolang er nog iets te ruilen valt.

## Een mijlpaal is een slice die je kunt draaien, geen percentage

De definitie die ik aanhoud: een mijlpaal is een werkende, zelf te bedienen slice van het echte systeem, gedeployed op iets anders dan een laptop, gemeten tegen een geschreven criterium dat vóór het werk is afgesproken. Haalt het niet alle vier die voorwaarden, dan is het een statusupdate.

![AI-feature bouw mijlpalen: zo voorkom je een mislukte sprint](/images/blog/ai-feature-build-milestones-payment/1.jpg)

Elk van die vier woorden draagt gewicht, dus even uitpakken.

**Werkend** betekent dat het end to end draait voor het gedefinieerde inputbereik. Geen notebook, geen gemockte backend. Als de mijlpaal "inkomende tickets classificeren" is, dan gaat er een echt ticket in en komt er een echt gestructureerd resultaat uit.

**Zelf te bedienen** betekent dat de koper het bestuurt in plaats van ernaar kijkt. Geef een URL of een CLI en laat de CTO zijn eigen input typen. Daar sterft de uitgekozen demo, en dat is precies de bedoeling. Elke onaangename verrassing die ik op een build heb gehad was zichtbaar op het moment dat iemand van buiten het project zelf de input koos.

**Gedeployed** betekent in jullie omgeving, op jullie infrastructuur, achter jullie auth. In deployment zit de helft van het verborgen werk, dus dat allemaal naar het einde van de build schuiven is de manier om in week 11 paniek te krijgen. Verdeel het over de mijlpalen en het is geen klif meer.

**Gemeten** betekent een getal of een pass/fail-conditie die er al was vóór de sprint. Voor een AI-feature is dat vrijwel altijd een bevroren evalset: een vaste lijst echte inputs met verwachte uitkomsten, elke keer op dezelfde manier gescoord. Heb je de evalset niet gezien, dan kun je de mijlpaal niet accepteren, en een leverancier die weigert er in week 1 een te bouwen vertelt je iets. Hoe je zulke criteria opstelt heb ik uitgewerkt in [AI-feature acceptatiecriteria](/blog/ai-feature-definition-of-done).

Nog één regel die later ruzie voorkomt: schrijf het acceptatiecriterium in de SOW als een zin die een niet-engineer kan verifiëren. "Retrieval geeft het juiste brondocument in de top 3 voor minimaal 85% van de 120 vragen in de evalset, gemeten met de suite in `evals/retrieval`, uitgevoerd door de klant." Dat kunnen beide partijen nachecken. "Retrieval werkt goed" kan niemand nachecken.

## De vier AI-feature bouw mijlpalen die in 6 tot 12 weken passen

Vier is het aantal dat werkt. Twee geeft te weinig signaal. Zes maakt van de build een demofabriek waarin de engineer een derde van de tijd werk inpakt in plaats van doet.

### M1: de dunne verticale slice (eind week 2)

Eén pad door het hele systeem, smal en ondiep. Echte data erin, echte output eruit, gedeployed, met het evalharnas en de baselinecijfers die het oplevert. Geen UI-afwerking, geen edge cases, geen schaal.

M1 is de belangrijkste mijlpaal in de SOW en degene die de meeste leveranciers willen overslaan, want dit is het moment waarop het plan de data ontmoet. Draait de verticale slice niet aan het eind van week 2 in een build van tien weken, dan heb je iets enorms geleerd voor de prijs van twee weken.

### M2: de lastige gevallen (rond week 4 of 5)

Alles wat de dunne slice bewust negeerde. Meertalige input, documenten die scans zijn in plaats van tekst, tickets met twee onsamenhangende problemen erin, de tenantgrens, het gedrag als het model iets onparseerbaars teruggeeft. Hier groeit de evalset van de makkelijke voorbeelden naar de voorbeelden die jullie echte verkeer representeren.

M2 is de mijlpaal die een scope van 6 weken onderscheidt van één van 12. Het aantal en de gemeenheid van de lastige gevallen bepalen de doorlooptijd, iets wat ik eerder heb uitgesplitst in [hoe lang het duurt om een AI-feature te bouwen](/blog/how-long-to-build-an-ai-feature).

### M3: het productieoppervlak (rond week 7 tot 9)

Auth, rate limits, kostenmeting per request, logging en tracing van elke modelcall, promptversiebeheer, het pad voor menselijke overrule, de fallback als de provider eruit ligt. Gedrag onder iets dat op echte concurrency lijkt.

### M4: overdracht en shadow run (laatste 1 tot 2 weken)

De evalsuite in CI, een runbook voor de drie of vier manieren waarop deze feature in het wild faalt, een dashboard dat de on-call engineer om 2 uur 's nachts kan lezen, en bij voorkeur een periode waarin de feature op live verkeer meeloopt in shadow mode terwijl mensen nog de beslissingen nemen. Daarna de doorloop met het team dat het gaat beheren.

Betaling volgt dezelfde vier stappen. Ik werk met ruwweg 15 tot 20% bij kickoff om te mobiliseren, en de rest komt vrij bij acceptatie van elke mijlpaal, met het zwaartepunt op de middelste twee, want daar zit het werk. Het structurele punt is dat geen enkele betaling een datum heeft. Elke betaling wordt verdiend door iets dat draait.

## Wat een gemiste mijlpaal je werkelijk vertelt

Een slip is informatie, en de nuttige vraag is nooit "lopen we achter" maar "wat voor soort achter is dit".

- **M1 slipt.** Dit is het hardste signaal in de hele build. Het betekent bijna altijd dat de data niet is wat de spec aannam, of dat de integratie zwaarder is dan iemand had geprijsd. Beide zijn scopeproblemen, geen snelheidsproblemen, en beide vragen om een gesprek over wat er nu uit de scope gaat in plaats van om meer uren.
- **M2 slipt.** Meestal accuraat: de lastige gevallen zijn echt lastiger dan geschat. Dit is het punt om de long tail af te kappen. Kies de 80% van het verkeer die je automatisch afhandelt en routeer de rest naar een mens, bewust en op papier.
- **M3 slipt.** Vaak een teken dat M1 en M2 te ruimhartig zijn geaccepteerd, met uitgesteld in plaats van gedaan deploymentwerk. Als je mijlpaalcriteria niet "draait in jullie omgeving" bevatten, betaal je daar hier voor.
- **M4 slipt.** Doorgaans een documentatie- en eigenaarschapsgat, geen engineeringprobleem. Irritant, zelden gevaarlijk, en goedkoop op te lossen als je een laatste betaling hebt achtergehouden.

Eén gemiste mijlpaal met een heldere oorzaak is normaal. Twee opeenvolgende slips met dezelfde uitleg ("bijna zover") is een andere situatie, en het juiste antwoord daarop is een scopeheronderhandeling in week 5, niet hoop in week 10.

## De clausule die beide kanten beschermt

Een mijlpaalregime dat alleen de koper laat inhouden is voor niemand een goede deal, want het duwt de leverancier naar defensieve scoping en opgeblazen schattingen. De versie die ik onderteken heeft vier onderdelen.

**Een reviewtermijn.** De klant heeft een vast aantal werkdagen (drie werkt goed) om te accepteren of af te wijzen tegen de geschreven criteria. Stilte na die termijn geldt als acceptatie. Zonder dit blijven facturen hangen achter een stakeholder op vakantie.

**Afwijzen alleen op criteria.** Een mijlpaal kan worden afgewezen omdat hij zijn vastgelegde criteria niet haalt, niet vanwege nieuwe wensen. Nieuwe wensen zijn welkom en gaan naar een change note met hun eigen tijd en kosten.

**Eén herstelronde.** Faalt een mijlpaal, dan krijgt de leverancier een afgesproken periode (meestal een week) om het kosteloos te repareren. Faalt het twee keer, dan kan elke partij de opdracht stoppen, met betaling voor het werk tot dan toe en overdracht van alle code, prompts, evals en infrastructuurdefinities.

**Benoemde change-mechaniek.** Elke ontdekking die de scope verandert wordt gelogd met zijn tijdsimpact, en de klant kiest: verlengen, iets anders eruit halen, of het gat accepteren. Dit is de clausule die scope creep verandert van een stille margestrijd in een beslissing met een datum. Was je spec vaag bij de start, dan vermenigvuldigen deze gesprekken zich, en daarom hamer ik zo op [een degelijke spec voordat je offertes ophaalt](/blog/ai-feature-spec-template-vendor-quotes).

## Uitgewerkt voorbeeld: AI-triage voor supporttickets

Stel dat je tickettriage bouwt: inkomende supportmails worden geclassificeerd in jullie bestaande categorieën, gelabeld met urgentie en gematcht tegen jullie kennisbank zodat de agent een voorgesteld antwoord ziet. SOW van tien weken, één senior engineer, jullie stack. Zo staan de vier mijlpalen dan in het document.

**M1, eind week 2.** Gedeployed naar jullie staging-omgeving achter jullie auth. Accepteert een echt ticket via dezelfde webhook die productie gaat gebruiken, geeft een gestructureerd object terug met categorie, urgentie en maximaal drie KB-bronlinks. Scope beperkt tot Nederlandstalige tickets met één onderwerp en alleen tekst. Opgeleverd met een bevroren evalset van 100 historische tickets, gelabeld door jullie support lead, plus de baselinescores en het script dat ze produceert. Acceptatie: jullie support lead draait de suite en krijgt de gedocumenteerde cijfers, en stuurt tien zelfgekozen tickets door het staging-endpoint.

**M2, eind week 5.** Engelse en gemengde tickets, tickets met meer dan één onderwerp, PDF- en afbeeldingsbijlagen via extractie, en expliciet gedrag bij lage confidence waarbij de feature weigert iets voor te stellen in plaats van te gokken. Evalset gegroeid naar 300 tickets inclusief een bewust vervelende adversarial-slice. Acceptatie: afgesproken drempels gehaald op de volledige set, en geen ticket in de adversarial-slice levert een zelfverzekerd verkeerde categorie op.

**M3, eind week 8.** Rate limits per tenant, kosten per ticket gelogd en zichtbaar in een dashboard, volledige tracing van elke modelcall met promptversie eraan vast, retry- en fallbackpad als de provider degradeert, override voor de agent die de correctie vastlegt. Acceptatie: jullie draaien een loadtest op het verwachte piekvolume, triggeren een gesimuleerde provider-outage, en lezen zelf de kosten per ticket van het dashboard.

**M4, eind week 10.** Evalsuite in jullie CI-pipeline die de build laat falen bij regressie, runbook voor de vier bekende faalmodi, twee weken shadow-mode-output vergeleken met wat de agents daadwerkelijk deden, overdrachtssessie met jullie team. Acceptatie: een van jullie engineers deployt een promptwijziging door de volledige pipeline zonder dat ik in de kamer zit.

Elk van die punten is te controleren door iemand die de code niet heeft geschreven. Dat is de hele toets of een mijlpaal in een SOW thuishoort.

## Vragen die opkomen tijdens het opstellen van de SOW

**Kan een fixed price AI build nog echte mijlpalen gebruiken?**
Ja, en dat zou ook moeten. Zet de prijs vast, zet de vier mijlpalen met hun criteria vast, en hang de change-mechaniek eraan. De prijs blijft stabiel voor de afgesproken scope; de mijlpalen vertellen je vroeg of die scope klopte. Wat je niet eerlijk kunt doen is prijs en scope vastzetten zonder checkpoint, want de eerste week echte data verandert bijna altijd iets.

**Wat als de leverancier op kalenderdata wil factureren?**
Vraag waarom. Cashflow is een legitiem antwoord, en de oplossing is dan een grotere kickoffbetaling of tweewekelijks factureren tegen geaccepteerde mijlpalen, geen geld zonder voorwaarde. Een leverancier die geen enkel verifieerbaar criterium aan een betaling wil hangen, verwacht die ruimte nodig te hebben.

**Hoe schrijf ik acceptatiecriteria voor AI-kwaliteit als ik nog niet weet wat haalbaar is?**
Laat M1 de baseline produceren en zet de drempels voor M2 tot M4 relatief daaraan. De SOW legt de evalset en de meetmethode vooraf vast, en het numerieke doel voor de latere mijlpalen wordt binnen een week na acceptatie van M1 afgesproken. Je zet de meetlat vast vóór het werk, niet de uitkomst.

**Van wie is de evalset, van ons of van de leverancier?**
Van jullie, gebouwd uit jullie data, in jullie repository. Het is het waardevolste artefact van de hele build, want het is wat je in staat stelt de volgende wijziging en de volgende leverancier te beoordelen. Laat een SOW het eigendom van de evals onbenoemd, benoem het dan.

**Werken AI feature payment milestones ook voor een build van 6 weken?**
Vier mijlpalen passen nog steeds, alleen compacter: dunne slice eind week 1, lastige gevallen in week 3, productieoppervlak in week 5, overdracht in week 6. Onder ongeveer vijf weken zou ik naar drie gaan en de laatste twee samenvoegen, omdat de inpakoverhead dan meer kost dan het signaal oplevert.

## Voordat je ondertekent

De structuur hierboven is hoe ik een Full Build uitvoer: zes tot twaalf weken, één senior engineer die de AI-feature en het product eromheen end to end bezit, vier mijlpalen die elk iets opleveren dat je zelf kunt draaien, en een overdracht waarna jullie team de prompts kan wijzigen zonder mij. Wil je eerst weten welke lagen een echte offerte moet dekken voordat je aan mijlpalen begint, dan is [de zeven lagen van een volledige AI-feature build](/blog/full-ai-feature-build-scope-cost) het bijbehorende stuk, en de scope van de opdracht staat op de [servicespagina](/services). Stel je deze maand een SOW op en wil je een tweede paar ogen op de mijlpaaldefinities, [neem dan contact op](/contact).
