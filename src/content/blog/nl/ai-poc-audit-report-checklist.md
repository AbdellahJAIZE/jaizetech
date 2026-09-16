---
title: "AI POC-audit rapport: koop bewijs, geen PDF vol adjectieven"
description: "Wat hoort er echt in een AI POC-audit rapport? Acht secties, een uitvoerbaar 90-dagenplan en vijf signalen dat je audit theater is."
published: "2026-09-16"
tags: ["AI-audit", "POC audit", "production readiness", "AI Act", "software engineering"]
ogImage: "/images/blog/ai-poc-audit-report-checklist/cover.jpg"
primaryService: "ai-audit"
---
Je hebt een demo die werkt. Iemand heeft je een offerte gestuurd voor een "AI-audit" voordat het naar productie gaat, of je eigen lead engineer heeft een week gevraagd om er zelf een te doen. Hoe dan ook: je staat op het punt geld uit te geven aan een document, en je hebt geen enkele manier om te weten of dat document het nuttigste is wat je dit kwartaal leest, of een mooi opgemaakte PDF met "overweeg monitoring toe te voegen".

Ik draai deze audits als een sprint van één week, en ik heb er een behoorlijk aantal gelezen die door anderen zijn gemaakt. Het verschil tussen een echt AI POC-audit rapport en een stempel is niet het aantal pagina's of het design. Het is of elke bewering erin komt met een getal, een reproductie, een eigenaar en een datum.

Deze post is de kopersgids die ik meer mensen had gegund voordat ze tekenden. Wat het rapport moet bevatten, sectie voor sectie. Hoe het 90-dagenplan eruit moet zien om ook echt uitgevoerd te worden. Waar het readout-gesprek voor dient. Vijf tekenen dat de audit theater is. En een checklist die je vanmiddag zelf gratis kunt draaien, of je nu iemand inhuurt of niet.

## Het moment waarop je naar een offerte staart en niet weet wat je koopt

De offerte zegt meestal iets als "assessment van production readiness", "architectuurreview", "best-practice-aanbevelingen". Twee pagina's. Een dagtarief of een fixed fee. Niets erin vertelt je wat je vrijdag in handen hebt.

Dat is het kernprobleem van een audit kopen: het is een kennisproduct, en je kunt het niet inspecteren voordat je betaalt. Bij een feature kun je in de repo kijken. Bij een audit krijg je een belofte dat iemand in jouw repo kijkt en je iets nuttigs vertelt.

Definieer dus "nuttig" voordat je tekent. In mijn ervaring bestaat een POC-audit om precies drie vragen te beantwoorden:

- **Wat breekt als eerste** als echte gebruikers, echt datavolume en echte kosten op dit ding landen?
- **Wat is het bewijs** daarvoor, zodat mijn engineers niet op iemands woord hoeven te vertrouwen?
- **In welke volgorde fixen we het**, door wie, wanneer, en hoe weten we wanneer elke fix klaar is?

Al het andere is een rondleiding. Als de offerte zich niet vastlegt op een schriftelijk antwoord op die drie vragen, koop je een rondleiding. Over de technische kant van wat een audit doorgaans vindt schreef ik in [de audit vóór het budget](/blog/ai-demo-to-production-audit); dit stuk gaat over het beoordelen van de opdracht zelf.

## Wat een echt AI POC-audit rapport bevat, sectie voor sectie

Een rapport waar ik mijn naam onder zet heeft acht delen, en de volgorde doet ertoe, want het is de volgorde waarin je CTO het leest: eerst scope, dan bewijs, als laatste het plan.

![AI POC-audit rapport: koop bewijs, geen PDF vol adjectieven](/images/blog/ai-poc-audit-report-checklist/1.jpg)

**1. Scope: wat er daadwerkelijk is onderzocht.** De commit-hash. De omgeving (laptop, staging, wat het ook was). De data die is gebruikt. En, belangrijker, wat er *niet* is bekeken. Een eerlijk rapport zegt "de ingestion-pipeline viel buiten scope; ik heb alleen het query-pad bekeken". Een rapport zonder uitsluitingen heeft nergens diep naar gekeken.

**2. Bevindingen, één per pagina, in een vast format.** Elke bevinding krijgt dezelfde velden: severity (blokkeert launch / degradeert op schaal / opruimwerk), het bewijs, de blast radius, een inschatting in dagen, en een eigenaar met naam. Het bewijsveld ís het rapport. Vergelijk:

- "Latency kan een aandachtspunt worden onder load." Waardeloos.
- "Bij 20 gelijktijdige gebruikers is de p95-latency 14,2 s tegenover een target van 3 s. De bottleneck is een synchrone embedding-call per request. Gereproduceerd met het k6-script in bijlage B." Bruikbaar.

**3. Load-cijfers.** Iemand moet gelijktijdig verkeer op het systeem zetten. Het concurrency-plafond voordat er errors komen, p50- en p95-latency op drie load-niveaus, de error rate, en wat als eerste faalt (rate limits, databaseconnecties, geheugen). Als er geen load test is gedraaid, heeft de audit geen production readiness geaudit, maar codestijl.

**4. Unit economics.** Tokens per request, gesplitst in prompt en completion. Kosten per 1.000 requests tegen de modelprijzen van vandaag. Kosten bij tien keer je verwachte volume. Waar de tokens heen gaan (een system prompt van 6.000 tokens die bij elke call wordt herhaald is de klassieker). Dit is de sectie die budgetten verandert, dus het moet rekenwerk zijn, geen bijvoeglijke naamwoorden.

**5. Data- en security-oppervlak.** Elk extern endpoint dat je data raakt, en welke vendor achter elk endpoint zit. Of er een verwerkersovereenkomst ligt. Waar secrets leven. Het prompt-injection-oppervlak: welke door gebruikers gecontroleerde tekst het model bereikt, en wat het model met tools kan doen zodra die tekst er is. Voor Nederlandse en EU-bedrijven staat in deze sectie ook of iets hier de risicocategorieën van de EU AI Act raakt, in één alinea, niet in tien.

**6. Een eval-baseline.** Een set van 50 tot 100 representatieve inputs met verwachte outputs, gedraaid tegen het huidige systeem, met de score. Zonder dit is "het hallucineert soms" een anekdote en is elke toekomstige verbetering onmeetbaar. De eval-set blijft in jouw repo achter. Het is het meest herbruikbare artefact van de week.

**7. Architectuuroordeel per component.** Houden, refactoren of herbouwen, met één alinea onderbouwing per stuk. Geen diagram van het ideale systeem. Een oordeel over het systeem dat je hebt.

**8. Bijlage: scripts en ruwe cijfers.** Het load-script, de eval-runner, het notebook voor het tellen van tokens. Je engineers moeten elk getal in het rapport opnieuw kunnen draaien zonder de auditor.

Vijftien tot dertig pagina's is normaal. Tachtig pagina's is opvulling.

## Het 90-dagenplan: hoe "fix dit eerst" er op papier uit moet zien

De bevindingen zijn de diagnose. Het plan is waarvoor je hebt betaald. En de meeste plannen die ik zie falen op dezelfde manier: het zijn gesorteerde lijsten, geen schema's.

Een bruikbaar plan heeft drie horizonnen. Week 1 en 2: deblokkeren, de dingen zonder welke niets anders meetbaar is, meestal de eval-set en basale observability. Week 3 tot 6: de launch-blockers, in volgorde van afhankelijkheid. Week 7 tot 12: de degradeert-op-schaal-items en het opruimwerk. Elk item ziet er zo uit:

text
Item 4 — Embedding verplaatsen naar async batch-job
Waarom:       Bevinding F-02 (p95 14,2 s bij 20 gebruikers)
Eigenaar:     backend lead (met naam)
Inspanning:   3 dagen
Hangt af van: Item 1 (load-script in CI)
Klaar als:    p95 < 3 s bij 20 gelijktijdige gebruikers, geverifieerd door k6-run in CI
Niet vóór:    Item 2, anders optimaliseer je het verkeerde pad

Drie dingen in dat blok scheiden een plan van een verlanglijstje. Een eigenaar met naam, niet "het team". Een meetbare definitie van klaar, niet "latency verbeteren". En expliciete afhankelijkheden, want de meest voorkomende manier waarop een 90-dagenplan sterft is dat het team begint met het interessantste item in plaats van het item dat de rest deblokkeert.

Een goed plan bevat ook beslismomenten: "Op dag 30, als de eval-score op de retrieval-set nog onder de 80 procent zit, stop dan met chunking tunen en stap over op hybrid search; besteed week 5 niet aan prompt-edits." Die zin bespaart meer geld dan welke bevinding ook, omdat hij het team weerhoudt van wat teams altijd doen: een maand lang itereren op de prompt. De scoping-logica achter deze checkpoints is dezelfde die ik beschreef in [zo scope je een pilot die productie haalt](/blog/ai-pilot-to-production-scoping).

En een plan zegt wat je *nog niet* moet doen. Geen agents, geen fine-tuning, geen tweede vector store totdat de baseline stabiel is. De helft van de waarde van een externe audit is toestemming om dingen met rust te laten.

## Waarom het readout-gesprek van 60 minuten meer telt dan de PDF

De readout is waar je erachter komt of de bevindingen van de auditor zijn of van een template. Een PDF kun je niet aan een kruisverhoor onderwerpen. Een persoon wel.

Wie er aan tafel hoort: de CTO of founder die het budget beheert, de engineer die de demo heeft gebouwd, en degene die eigenaar wordt van het plan. Geen breder publiek. De engineer die de demo bouwde gaat in de verdediging, en dat is prima; het is de snelste manier om te ontdekken welke bevindingen echt zijn. Als die zegt "dat gebeurt alleen op mijn laptop", moet de auditor kunnen zeggen "hier is de run op staging".

Vragen die ik aan elke auditor zou stellen, mezelf inbegrepen:

- "Welke bevinding had je bijna gemist?" Een echte audit heeft er een. Een template niet.
- "Als dit jouw bedrijf was, wat zou je dan maandag doen?" Het antwoord moet overeenkomen met item 1 van het plan. Zo niet, dan is het plan geschreven voor het document, niet voor jou.
- "Welke van deze zou je *niet* fixen?" Iedereen die dit werk heeft gedaan heeft een lijst met bevindingen die ernstig lijken en de dagen niet waard zijn.
- "Waar had je geen tijd voor om naar te kijken?" Stilte hier is een slecht teken.

Neem het gesprek op. Wat je drie weken later terugspoelt is niet de slide, maar de zin waarin de auditor uitlegt waarom bevinding F-02 de launch blokkeert en F-07 niet.

Als de readout iemand is die de PDF voorleest, heb je een PDF gekocht.

## Vijf rode vlaggen die betekenen dat de audit theater is

Ik heb alle vijf gezien in rapporten waar bedrijven echt geld voor hebben betaald.

1. **Bevindingen zonder cijfers.** "Latency zou een probleem kunnen zijn", "kosten kunnen niet-lineair schalen", "overweeg evaluatie toe te voegen". Als een bevinding niet te reproduceren is, is het een mening, en voor een mening hoefde je niet te betalen.
2. **Er is geen load test gedraaid.** Vraag het direct: op welke concurrency heb je getest, en met welke tool? Als het antwoord is "we hebben de architectuur gereviewd", heeft niemand het concurrency-plafond gevonden, wat betekent dat de eerste die het vindt een klant is.
3. **Geen eigenaar per fix.** "Het team moet monitoring implementeren." Welke persoon, hoeveel dagen, klaar wanneer? Een plan waarin elk item van "het team" is, is van niemand.
4. **Een plan zonder datums en zonder volgorde.** Een op prioriteit gesorteerde lijst is geen plan. Als items 1 tot en met 12 in willekeurige volgorde kunnen, heeft de auditor niet over afhankelijkheden nagedacht, en dus niet over jouw systeem.
5. **De aanbeveling is het eigen platform van de vendor.** Als het rapport concludeert dat de fix een rebuild op de stack van de auditor is, of hun managed service, dan was de audit een salesgesprek met een factuur. Een eerlijke audit beveelt de kleinste verandering aan die het systeem veilig maakt, en vaak is die verandering saai.

Een zesde, subtielere: vervang je bedrijfsnaam door een andere en het rapport klopt nog steeds. Generieke rapporten komen uit generiek werk.

## Wat je zelf kunt checken voordat je iemand betaalt

Je kunt in een middag grofweg een vijfde van een echte audit produceren, en dat vertelt je precies wat je moet eisen van wie de rest doet. Niets hiervan vraagt een AI-specialist.

- **Zet er load op.** Schrijf een k6- of Locust-script van tien regels dat vijf minuten lang 20 gelijktijdige requests op je demo-endpoint afvuurt. Noteer p50, p95 en de error rate. De meeste demo's die ik zie beginnen ergens tussen 5 en 15 gelijktijdige gebruikers te falen, meestal op de rate limit van de LLM-provider of een database connection pool.
- **Tel de tokens.** Log de prompt- en completion-tokens van 50 echte requests. Vermenigvuldig met de huidige prijs per token van de provider. Vermenigvuldig met je verwachte dagvolume. Als het getal je verrast, is dat bevinding nummer één.
- **Schrijf 30 testcases.** Dertig echte vragen met het antwoord dat je zou accepteren. Draai ze vandaag en tel hoeveel er slagen. Dat getal is je baseline, en het is het getal dat de audit moet verbeteren.
- **Lijst elke uitgaande call.** Grep de codebase op externe hosts. Elk daarvan is een datastroom waar je juridische team van moet weten.
- **Check de git log van de prompt.** Als de system prompt niet in versiebeheer staat met historie, kun je onmogelijk weten wat er veranderd is als het gedrag verandert.
- **Stel één vraag aan wie het heeft gebouwd:** "Wat gebeurt er als de model-API een 429 teruggeeft?" Het antwoord vertelt je of iemand überhaupt over falen heeft nagedacht.

Als je dit doet en cijfers krijgt, gebeuren er twee dingen. Je weet nu of je een externe audit nodig hebt of gewoon een hardening-sprint. En elke auditor die je wél inhuurt moet jouw baseline verslaan, wat ze eerlijk houdt. Als de middag je ervan overtuigt dat het gat een persoon is en geen rapport, dan is [een AI engineer aannemen in Nederland](/blog/hire-ai-engineer-netherlands) de volgende beslissing, en [de build-versus-buy-math](/blog/build-vs-buy-ai-features) de beslissing daarna.

## Hoe "klaar" eruitziet voor een POC-audit-opdracht

Een echte audit van één week heeft een vorm. Dag één is toegang en interviews: repo, omgevingen, de eigen zorgen van de bouwer, die meestal kloppen. Dag twee en drie zijn het systeem draaien, niet erover lezen: load, evals, tokenboekhouding, de data traceren. Dag vier is schrijven. Dag vijf is de readout, en de middag erna is de auditor die de vragen beantwoordt die de readout opriep.

"Klaar" betekent dat vier dingen in jouw handen bestaan. Het geschreven rapport met genummerde, reproduceerbare bevindingen. Het 90-dagenplan met eigenaren, afhankelijkheden en definities van klaar. De readout, opgenomen. En de scripts, achtergelaten in jouw repository, zodat elk getal volgende maand door je team opnieuw gedraaid kan worden zonder iemand te bellen.

De echte test van klaar is simpeler: kan je team het plan uitvoeren als de auditor verdwijnt? Als het antwoord nee is, heeft de audit een afhankelijkheid gecreëerd in plaats van er een weggenomen. De beste audit die ik kan leveren is er een die mij de komende negentig dagen overbodig maakt, en zo is de [POC Audit op de dienstenpagina gescoped](/services).

## Waar dit een opdracht wordt

Als je een werkende demo hebt en een offerte voor je ligt, is de POC Audit een sprint van één week die eindigt met precies de deliverables hierboven: een geschreven rapport over wat er op schaal breekt, een geprioriteerd 90-dagenplan om te shippen, en een readout-gesprek waarin elke bevinding wordt verdedigd. De scope staat op de [dienstenpagina](/services). Wil je hem naast de offerte leggen die je nu in handen hebt, [neem dan contact op](/contact) en we vertellen je eerlijk of je hem nodig hebt.
