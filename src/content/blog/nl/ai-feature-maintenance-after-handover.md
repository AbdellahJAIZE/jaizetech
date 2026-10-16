---
title: "AI-feature onderhoud na oplevering: wie is eigenaar?"
description: "AI-feature onderhoud na oplevering wordt zelden vastgelegd. Drie modellen, hun aannames en hoe je er vóór livegang een kiest."
published: "2026-10-16"
tags: ["AI-onderhoud", "softwarebeheer", "SOW", "AI engineering", "productiebeheer"]
ogImage: "/images/blog/ai-feature-maintenance-after-handover/cover.jpg"
primaryService: "ai-features"
---
Zes weken geleden ging een feature live die supporttickets voorbereidt: zo'n 400 tickets per dag, een conceptantwoord opgesteld uit de kennisbank en de klanthistorie, waarna een agent het bijschaaft en verstuurt. Acceptatietests doorlopen, eval-suite groen, runbook in de repo. De engineer die het bouwde rondde op een donderdag de overdrachtssessie af en zit nu op een ander project. De SOW liep van kickoff tot livegang en bevatte geen woord over AI-feature onderhoud na oplevering, dus in maand vier, als de conceptkwaliteit wegzakt, heeft niemand piket.

Die dinsdag ziet er zo uit: antwoorden worden vaag, agents gooien het concept weg en typen zelf, support meldt het bij IT, en IT opent een repo met een Python-service die niemand in het team ooit heeft geschreven. De service staat omhoog. De dashboards staan groen. Het ding is simpelweg slechter dan het was, en "slechter" heeft geen eigenaar.

Er bestaan precies drie eerlijke antwoorden op "wie beheert dit als jij weg bent", en ze verschillen sterk in doorlooptijd, kosten en faalwijze. Eén kiezen vóór je tekent is een gesprek van twintig minuten. Eén kiezen nadat er iets stuk is gegaan kost een maand.

## AI-feature onderhoud na oplevering is een personeelsbeslissing, geen document

De drie modellen zijn een interne eigenaar, een retainer bij de engineer die het bouwde, en netjes weglopen waarbij niemand specifiek is aangewezen. Alle drie zijn legitiem. Elk model neemt stilzwijgend iets aan over jouw organisatie, en in die aanname zit de werkelijke beslissing.

Een interne eigenaar veronderstelt dat je iemand hebt, of krijgt, die de code kan lezen, de eval-suite kan draaien en kan interpreteren wat eruit komt. Niet per se een AI-specialist. Wel iemand die het verschil ziet tussen "retrieval haalt de verkeerde documenten op" en "het model is slechter geworden". Een retainer veronderstelt dat de feature af en toe expertaandacht nodig heeft in plaats van continu werk, en dat een paar uur per maand van de juiste persoon meer oplevert dan veertig uur van de verkeerde. Netjes weglopen veronderstelt dat de feature echt stabiel is, echt lage inzet heeft of echt vervangbaar is, en dat je hebt geaccepteerd wat er gebeurt als hij ongemerkt degradeert.

Wat alle drie laat mislukken is hetzelfde: niemand toetst die aanname. Teams kiezen intern omdat dat verantwoordelijk voelt, en werven vervolgens niet. Ze nemen een retainer en behandelen die als verzekering tegen alles. Of ze lopen weg zonder dat ooit te besluiten, wat van de drie het meest voorkomt en het enige is dat vanzelf gebeurt.

## Intern beleggen: de inwerktijd die niemand in de planning zet

Een interne eigenaar is het juiste antwoord op lange termijn voor elke AI-feature die op een kernproces zit. Als ticketconcepten elk klantgesprek raken dat je voert, hoort iemand binnen het pand te snappen hoe het werkt. Het probleem is de kalender.

![AI-feature onderhoud na oplevering: wie is eigenaar?](/images/blog/ai-feature-maintenance-after-handover/1.jpg)

Als je die persoon nog niet hebt, duurt [een AI engineer aannemen in Nederland](/blog/hire-ai-engineer-netherlands) realistisch twee tot vier maanden vanaf het schrijven van de vacature tot een getekend contract, en dan heb je de opzegtermijn nog niet gehad, hier routinematig één of twee maanden. Daarna komt de inwerkperiode. Naar mijn ervaring heeft een sterke engineer die niet eerder aan LLM-systemen heeft gewerkt vier tot acht weken deeltijdcontact met een productie-AI-feature nodig voordat hij een kwaliteitsregressie zonder hulp kan diagnosticeren. Deployen lukt op dag drie. Een eval-rapport lezen en weten welke van vijf mogelijke oorzaken je als eerste najaagt, is ander werk.

Leg dat naast de livegang en de rekensom wordt ongemakkelijk. Live in maand nul, werving start in maand nul, kandidaat begint in maand vier, is zelfstandig in maand vijf of zes. De ticketfeature zakte weg in maand vier. Je kwam zes weken tekort, en niemand zag het gat aankomen omdat er "intern eigenaarschap" in het plan stond en dat klonk als iets wat af was.

Heb je de persoon al wel, dan is capaciteit het getal dat telt, niet vaardigheid. Een engineer met een volle roadmap draait de wekelijkse eval-review niet. Week twee wordt overgeslagen, week drie ook, en in week acht doet niemand het meer. Schrijf dus op hoeveel uur per week en uit wiens roadmap die uren komen. Een halve dag per week is voor één feature in stabiele toestand meestal genoeg, en het is dezelfde redenering waarom [één senior engineer het vaak beter doet dan vier](/blog/ai-feature-build-team-size) tijdens de bouw: benoemde capaciteit verslaat verspreide goede bedoelingen.

Wat het interne model je wél oplevert, en de andere twee niet, is kennis die zich opstapelt. Wie in maand vier het retrieval-probleem oplost, kent de data in maand negen als je de feature wilt uitbreiden. Dat is echt geld waard en het is het belangrijkste argument om de inwerkkosten te betalen.

## Een retainer: wat erin zit en wat er stilletjes buiten valt

Een AI feature retainer bij de engineer die het gebouwd heeft, lost het inwerkprobleem volledig op. Er is geen inwerkperiode. Hij weet waarom de chunking-strategie is zoals hij is, welke promptversie live staat en hoe de eval-cijfers er op de dag van livegang uitzagen, wat enorm scheelt als je moet beoordelen of de cijfers van vandaag slecht zijn of gewoon normaal.

Waar een retainer goed in is, is de smalle band werk die echt de bouwer vereist: een kwaliteitsregressie zonder duidelijke oorzaak, een provider die het model uitfaseert waar jij op draait, [een stille modelupdate](/blog/silent-model-updates-ai-feature) die het gedrag onder je vandaan verschuift, een kostencurve die de verkeerde kant op buigt, een eval-suite die nieuwe cases nodig heeft omdat gebruikers een vraagtype vonden dat je nooit had voorzien. Dit is wat er in maand vier daadwerkelijk gebeurt, en het zijn stuk voor stuk diagnoseproblemen, veel meer dan programmeerproblemen.

Waar ik de afspraak heb zien verzuren, is alles eromheen. Support wil een andere toon in concepten voor enterprise-accounts. Product wil de feature op een tweede ticketwachtrij. Iemand wil een dashboard. Niets daarvan is onderhoud, alles komt binnen onder het label onderhoud, en een retainer die op diagnose is gedimensioneerd wordt in de eerste maand opgegeten door featureverzoeken. Dan komt de echte regressie en zijn de uren op.

Een retainer moet daarom over drie dingen expliciet zijn, en over geen ervan vaag. Eén: wat binnen scope valt. Ik trek de grens bij "het afgesproken gedrag werkend houden", wat evals, prompts, modelmigraties, retrievalkwaliteit en kosten omvat, en nieuw gedrag uitsluit. Twee: de reactieverwachting. Een kwaliteitsregressie is geen sev-1-storing en vraagt geen SLA van dertig minuten, maar "binnen twee werkdagen" is een ander product dan "als ik tijd heb". Drie: wat er gebeurt als de scope wordt overschreden, want dat gebeurt. Een vooraf afgesproken tarief voor aangrenzend werk voorkomt dat je daarover onderhandelt terwijl support 400 antwoorden per dag met de hand zit te typen.

De eerlijke beperking: een retainer is geen route naar zelfstandigheid. Na twaalf maanden kent je team de feature niet beter dan op de dag van overdracht. Voor een feature aan de rand van je product is dat prima. Voor eentje op het kritieke pad behandel je het als een brug naar de interne hire, niet als vervanging ervan.

## Netjes weglopen: wanneer niets het juiste antwoord is

Sommige features moet je met rust laten, en dat hardop zeggen helpt meer dan doen alsof elke deployment een zorgplan nodig heeft.

Weglopen werkt als drie dingen kloppen. De feature zit achter een mens: elk concept wordt door een agent bekeken voordat het een klant bereikt, dus slechtere kwaliteit kost bewerkingstijd en geen vertrouwen. De storing is zichtbaar voor de mensen die ermee werken in plaats van begraven in een logbestand, wat voor deze feature betekent dat de agents het binnen een dag voelen. En er is een bruikbare terugvaloptie, hier simpelweg de agent die het antwoord zelf schrijft, precies wat ze jaren deden voordat de feature bestond.

Onder die condities is degradatie een ergernis met een prijskaartje dat je kunt uitrekenen. Stel dat concepten vijf minuten per ticket besparen over 400 tickets per dag en de kwaliteit zakt zo ver dat de helft van de concepten onbruikbaar wordt. Dan verlies je ruwweg zestien uur agenttijd per dag tot iemand ingrijpt. Dat getal vertelt je hoe lang je zonder eigenaar kunt, en bij de meeste teams zegt het "een week, geen kwartaal".

Wat weglopen gevaarlijk maakt is autonomie en onzichtbaarheid. Een agent die zonder review mails verstuurt, een feature in een compliance-pad, alles waarbij het eerste signaal een klantklacht is: daar is geen eigenaarschap een besluit om het op de harde manier te ontdekken. De bruikbare vraag is niet of de feature belangrijk is, maar of een storing zichzelf aankondigt.

## De clausule die alle drie de modellen laat werken

Welk model je ook kiest, de overdracht moet erop gebouwd zijn, en dat bepaal je bij het schrijven van de SOW, niet in de laatste week van de build. Een overdracht die op een retainer is gedimensioneerd mag leunen op het geheugen van de bouwer. Een overdracht voor intern eigenaarschap of een walk-away kan nergens op leunen.

Concreet heeft een overdracht die het vertrek van de bouwer overleeft dit nodig: een eval-suite die met één commando draait en waarvan de baseline van de livegang is vastgelegd, zodat maand vier iets heeft om tegen af te zetten; prompts onder [versiebeheer met een changelog](/blog/prompt-versioning-regression-testing), omdat een onverklaarde regressie meestal een ongedocumenteerde promptwijziging is; een kosten- en latencydashboard dat iemand anders dan de bouwer weet te openen; een uitgeschreven lijst van de drie of vier faalwijzen die tijdens de bouw zijn gezien en hoe elk eruitziet in de logs; en een escalatiepad met een echte naam erin. Ik reken dit tot de [acceptatiecriteria](/blog/ai-feature-definition-of-done) in plaats van tot leuke extra's na livegang, want zodra de [laatste mijlpaal is betaald](/blog/ai-feature-build-milestones-payment) schrijft niemand nog documentatie.

De ene clausule waar ik een volledige build niet zonder zou tekenen: een supportvenster na livegang met vaste prijs en vaste duur, vier tot zes weken, dat diagnose dekt van alles wat breekt binnen het afgesproken gedrag. Geen retainer. Geen discussie over garantie. Een afgebakende periode waarin de bouwer bereikbaar blijft terwijl echte gebruikers er voor het eerst op loslaten. Het meeste van wat maand vier gaat zijn, dient zich aan in week twee tot vijf, en de bouwer daarbij hebben is hoe je erachter komt of je de retainer überhaupt nodig hebt.

## Beslis vóór je tekent

Loop het in volgorde af. Zit deze feature op een kernproces of ernaast? Kern betekent op termijn intern eigenaarschap, dus de werving start tijdens de bouw, niet erna. Ernaast betekent een retainer of niets. Kondigt een storing zichzelf aan, en is er een terugvaloptie? Twee keer ja: weglopen is verdedigbaar, en dan schrijf je op wat degradatie per week kost. Bij één keer nee heb je een aangewezen eigenaar nodig. Kan je team de eval-suite vandaag draaien en lezen? Zo nee, dan is de retainer een brug die inwerktijd koopt en geen eindsituatie. Vraag daarna wat de overdracht moet bevatten voor het model dat je koos, en zet dat in de SOW zolang je nog onderhandelingsruimte hebt.

Alle drie de modellen werken. Geen van de drie kiezen is ook een keuze, alleen eentje die je per ongeluk maakt, en die komt meestal op een dinsdag boven water als de conceptkwaliteit zakt en niemand weet van wie het probleem is.

Een [Full Build](/services) is zes tot twaalf weken waarin een senior engineer de AI-feature en het product eromheen end-to-end bezit, en de overdracht (schone code, documentatie, eval-suite, walkthrough) wordt geschreven voor het eigenaarschapsmodel dat jij kiest, een vraag die ik liever in week één beslecht dan in de laatste week. Zit de feature op een kernproces en is de interne hire nog maanden weg, dan is een Production Hardening-traject van drie tot zes weken de verstandige brug. Vertel me welk proces hij raakt en wat er gebeurt als hij degradeert, dan kunnen we de eigenaarschapsvraag fatsoenlijk dimensioneren: [contact](/contact).
