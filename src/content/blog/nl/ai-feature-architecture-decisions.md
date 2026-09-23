---
title: "AI-feature architectuur: 4 beslissingen vóór je bouwt"
description: "Zonder heldere AI-feature architectuur eindigt elke full build in een herbouw in maand drie. Dit zijn de vier lagen die je vooraf moet vastleggen."
published: "2026-09-23"
tags: ["AI-feature architectuur", "AI-architectuur", "RAG", "LLM-observability", "AI-implementatie"]
ogImage: "/images/blog/ai-feature-architecture-decisions/cover.jpg"
primaryService: "ai-features"
---
De SOW ligt op tafel. Zes tot twaalf weken, een senior engineer, een vaste scope, en een startdatum over twee maandagen. Iedereen in de kamer is het eens over wat de feature doet. Niemand in die kamer kan me in één zin vertellen wat er met één gebruikersrequest gebeurt tussen de klik op de knop en het antwoord.

Precies daar gaan full builds mis. Niet in de modellering, niet in de prompt, niet in de UI — in de vier beslissingen over **AI-feature architectuur** die niemand heeft opgeschreven omdat ze voelden als implementatiedetails. Het zijn geen implementatiedetails. Het is de vorm van het systeem, en één ervan wijzigen in maand drie kost je een herbouw van alles wat eronder hangt.

Dit is de checklist die ik afloop vóór ik iets teken. Vier lagen, de echte afweging binnen elke laag, en een architectuurdocument van één pagina dat je vanmiddag zelf op een whiteboard kunt invullen — nog vóór je met een leverancier praat. Kun je alle vier beantwoorden, dan wordt je SOW voor het eerst vergelijkbaar tussen aanbieders. Kun je er één niet beantwoorden, dan is dat de laag waar je eerste week naartoe gaat.

## Het moment: de scope is akkoord, de routing niet

Dit is het gesprek dat blijft terugkomen. Het scope-document zegt "een assistent die vragen over onze contracten beantwoordt en een verlengingsmail kan opstellen". Prachtig. Dan stel ik vier vragen.

Welk model beantwoordt welke vraag — één model voor alles, of een goedkoop model voor classificatie en een duur model voor het schrijfwerk? Waar staat de contracttekst op het moment van de query — per request opgehaald, ingebakken in een fine-tune, of allebei? Draait de model-call in onze eigen VPC of tegen een managed API? En als een gebruiker zegt "hij gaf me vorige dinsdag de verkeerde verlengingsdatum", wat open je dan om uit te zoeken waarom?

Vier vragen, en het gebruikelijke antwoord is vier keer schouderophalen plus "we dachten dat het dev-team dat zou bepalen". Ze gaan het bepalen — impliciet, in week twee, onder deadlinedruk, door wie toevallig het eerste endpoint schrijft. Die keuze hardt daarna uit. In week zes hangen er twaalf bestanden aan. In week tien betekent hem wijzigen: de retrieval-laag, het kostenmodel en het deployment-target tegelijk herschrijven.

Ik schreef eerder over [de zeven lagen die een full build echt bevat en waarom offertes er maar drie beprijzen](/blog/full-ai-feature-build-scope-cost). Dit is de laag daaronder: de beslissingen die moeten bestaan vóórdat die zeven lagen überhaupt eerlijk te scopen zijn.

## Onbesliste AI-feature architectuur wordt een herarchitectuur in maand drie

Een full build heeft een karakteristieke faalcurve. Week één tot vier zien er uitstekend uit — er is een demo, hij beantwoordt vragen, stakeholders zijn blij. Week vijf tot acht komen de cijfers binnen: p95-latency van 11 seconden, de maandelijkse inferentierekening extrapoleert naar vier cijfers bij 200 gebruikers, en legal heeft vragen over waar de documenten heen gaan. Vanaf week negen ontdek je dat het oplossen van één van die drie betekent dat je aan de keuze uit week twee moet komen.

![AI-feature architectuur: 4 beslissingen vóór je bouwt](/images/blog/ai-feature-architecture-decisions/1.jpg)

De reden is dat deze vier lagen niet onafhankelijk zijn — ze beperken elkaar in één richting. Je infra-keuze bepaalt welke modellen je kunt gebruiken. Je modelkeuze bepaalt je contextbudget, en dat bepaalt je retrieval-strategie. Je retrieval-strategie bepaalt wat "correct" überhaupt betekent, en dat bepaalt wat je kunt meten. De afhankelijkheid loopt dus infra → model → data → observability, en een late wijziging bovenaan die keten maakt alles eronder ongeldig.

Concreet. Een team kiest managed API's van het GPT-type, bouwt een RAG-pipeline met 8k-token contexten en een reranker, en zet daar een nette eval-set tegenaan. In maand drie besluit inkoop dat de contractdata EU-gecontroleerde infrastructuur niet mag verlaten. Nu hosten ze zelf een 70B open-weight model, het effectieve contextbudget en het instructievolggedrag zijn veranderd, de chunking-strategie die werkte werkt niet meer, en de eval-scores zakken over de hele linie zonder dat iemand weet of het model, de retrieval of de prompt regresseerde. Dat is zes tot acht weken herwerk in een build van twaalf weken. Het was te vermijden met één vraag in week nul: *mag deze data onze infrastructuur verlaten — ja of nee?*

De beslissingen hieronder staan in de volgorde waarin ze elkaar beperken.

## De modellaag: één model, een router of multi-agent

Drie architecturen, en de meeste teams grijpen naar de verkeerde omdat de verkeerde leuker is om te bouwen.

**Eén model.** Eén model, één prompt-template, één call per request. Dit is veel vaker het juiste antwoord dan iemand toegeeft. Het is triviaal debugbaar — één trace, één promptversie, één kostenregel. Heeft je feature één taak en is de variatie in requesttypes klein, stop dan hier. Serieus. Ik heb multi-agent-opstellingen vervangen door één goed geprompte call en de p95-latency zien zakken van 14 seconden naar onder de 3, terwijl de accuraatheid omhoog ging — simpelweg omdat er minder plekken waren waar context kon sneuvelen.

**Router.** Een goedkope, snelle classifier bepaalt welk pad een request neemt: simpele lookup vs. volledige retrieval vs. generatie. Hier grijp je naar als requesttypes echt verschillen in kostenprofiel — 70% van het verkeer is "wat is de verlengingsdatum" en 30% is "schrijf me een alinea". De router verdient zichzelf terug wanneer het dure pad tien keer zo duur is als het goedkope en het goedkope pad de meerderheid van het verkeer dekt. Bouw de classifier als een kleine model-call of, beter, als gewone code — de helft van de routing-beslissingen die ik als LLM-call geïmplementeerd zie, is een regex plus een lookup in een verkleedpak. Dat is precies de pathologie uit [de AI-functie die eigenlijk een SQL-query had moeten zijn](/blog/ai-feature-that-should-have-been-sql-query).

**Multi-agent.** Meerdere gespecialiseerde agents met tools, planning en handoffs. Gerechtvaardigd wanneer de taak echt meerstaps tool-gebruik vraagt waarbij stap drie afhangt van het resultaat van stap twee en de volgorde vooraf niet bekend is. Veel minder vaak gerechtvaardigd dan de demo's suggereren. De prijs is reëel: niet-deterministische control flow, fouten die zich opstapelen over stappen, latency die stapelt, en debuggen dat trace-infrastructuur vanaf dag één vereist. Ga je hierheen, kies het framework dan bewust — ik zette het huidige veld op een rij in [agent-frameworks in 2026: wat overleeft de productie echt](/blog/agent-frameworks-2026-what-survives-production).

De beslisregel die ik hanteer: **begin bij één model en ga pas een trede omhoog als je het specifieke requesttype kunt benoemen dat de huidige trede slecht afhandelt.** Niet "we hebben later misschien agents nodig" — benoem het request.

## De datalaag: RAG, fine-tuning of allebei, en waar de pipeline-grens ligt

Hier bestaat een beslisprocedure voor, en die schreef ik volledig uit in [RAG of fine-tuning: een 20-minuten beslissing](/blog/rag-vs-fine-tuning-decision-flowchart). De korte vorm: RAG als de kennis verandert of bronvermelding nodig heeft, fine-tuning als het *gedrag* of het outputformaat moet veranderen, allebei als je een specifieke toon nodig hebt over verschuivende feiten. Negen van de tien keer is het bij een businessfeature RAG.

Wat die post niet beslecht, en wat de SOW wél nodig heeft, is de **pipeline-grens**: wie is eigenaar van het krijgen van data in het systeem, en waar houdt dat eigenaarschap op?

Schrijf deze vijf antwoorden op vóór de bouw begint:

- **Bron van waarheid.** Welk systeem houdt de canonieke documenten — SharePoint, een Postgres-tabel, een S3-bucket, iemands Drive-map? Benoem het.
- **Ingestie-trigger.** Push (webhook bij documentwijziging), pull (nachtelijke job) of handmatige upload? Dit bepaalt of "het antwoord is verouderd" een bug is of verwacht gedrag.
- **Eigenaarschap van transformatie.** Wie zet een gescande pdf van 40 pagina's om in chunks? Zitten er scans, formulieren of tabellen in je corpus, dan is dit een echt subsysteem en geen one-liner — zie [OCR plus LLM-extractiepatronen](/blog/document-intelligence-ocr-llm-extraction).
- **Rechten op het moment van retrieval.** Filtert de retriever op de autorisaties van de vragende gebruiker, of haalt hij alles op en hoopt hij dat de prompt zich gedraagt? Dat tweede is de meest voorkomende ernstige bevinding in de POC's die ik audit.
- **Kosten en trigger van herindexering.** Wat kost een volledige re-embed, en waardoor gebeurt er één? Teams die dit overslaan, her-embedden het hele corpus bij elke deploy en vragen zich af waarom de rekening is wat hij is.

Die vijf regels zijn in een leveranciersgesprek meer waard dan de hele modellaag-sectie, want hier verdubbelt de scope stilletjes. "We koppelen met jullie documenten" is geen scope. "Nachtelijke pull uit SharePoint, autorisatiefilter bij retrieval, OCR-pad voor de 8% gescande contracten" is scope.

## De infralaag: managed API vs. self-hosted, en de vraag die het echt beslist

Iedereen framet dit als een kostenvergelijking. Dat is het bijna nooit. Bij realistische volumes voor een eerste AI-feature zijn managed API's goedkoper dan een GPU die je zelf bezit en die 80% van de dag idle staat — ik rekende de echte cijfers voor 2026 door in [on-prem LLM-hosting in Nederland](/blog/on-prem-llm-hosting-netherlands), en het omslagpunt ligt hoger dan de meeste teams aannemen.

De vraag die het wél beslist is juridisch en contractueel, niet financieel: **mag deze data jouw infrastructuur verlaten, onder welke overeenkomst, en wie tekent daarvoor?** Voor Nederlandse en EU-teams betekent dat meestal een verwerkersovereenkomst, een clausule over dataresidentie en een verdedigbaar antwoord richting de FG. [Mag je bedrijfsdata naar OpenAI sturen](/blog/company-data-openai-gdpr-netherlands) loopt de praktische lezing daarvan af. Is het antwoord een hard nee — gereguleerde data, bezwaar van de OR, een klantcontract dat subverwerkers verbiedt — dan host je zelf, krimpt de modelshortlist tot open weights, en erft elke beslissing daaronder die beperking. Precies daarom hoort deze vraag in week nul en niet in maand drie.

Secundair maar nu al te beslissen: wat gebeurt er als je provider een 429 teruggeeft of veertig minuten plat ligt. Fallback naar een tweede provider, degraderen naar een gecachet of niet-AI-pad, of een foutmelding tonen. Kies er één. Het bepaalt of je promptlaag provider-portable moet zijn, en dat bepaalt hoe je hem op dag één schrijft.

## De observability-laag: vanaf dag één ingebouwd, niet later aangeplakt

Observability is de laag die uit de SOW wordt geknipt omdat er geen demo uit komt. Het is ook de enige laag die elke latere beslissing goedkoop maakt in plaats van duur, en daarom kom ik steeds terug bij [de continuous eval loop die niemand draait](/blog/llm-evaluation-production-continuous-eval).

Vier dingen zitten vanaf de eerste sprint in de bouw:

1. **Volledige request-traces.** Niet alleen input en output — de opgehaalde chunks met hun scores, de promptversie, het model en de parameters, tokens in en uit, en latency per stap. Kun je bij een slecht antwoord de opgehaalde context niet zien, dan kun je een retrieval-bug niet van een generatie-bug onderscheiden en ga je dagen zitten gokken.
2. **Een golden set.** 50 tot 150 echte voorbeelden met verwacht gedrag, verzameld tijdens de bouw in plaats van gereconstrueerd na de launch. Dit is goedkoop in week twee en ellendig in week tien.
3. **Prompt-versiebeheer.** Elke promptwijziging gekoppeld aan een commit en een eval-run, zodat "sinds vorige donderdag is het slechter" beantwoordbaar is. De mechaniek staat in [prompt-versiebeheer in productie](/blog/prompt-versioning-regression-testing).
4. **Kosten en latency per request, toegerekend.** Per gebruiker, per requesttype, per model-call. Zonder toerekening is een kostenpiek een mysterie; mét toerekening is het een lookup van vijf minuten.

Reken ruwweg 10 tot 15% van de bouwinspanning hiervoor. Het is de goedkoopste verzekering in het project, en het verschil tussen een feature die je na de launch kunt verbeteren en een die je alleen kunt aankijken.

## Het architectuurdocument van één pagina, vóór sprint één

Open een document. Deze kopjes, één tot drie zinnen per stuk. Met de juiste drie mensen in de kamer kost het negentig minuten.

text
1. REQUEST-PAD
   Eén alinea: klik → wat er gebeurt → antwoord. Benoem elke hop.

2. MODELLAAG
   Architectuur: één model / router / multi-agent
   Gekozen omdat: <het specifieke requesttype dat deze trede afdwong>
   Modellen + fallback-provider:

3. DATALAAG
   RAG / fine-tune / hybride — en waarom
   Bron van waarheid:
   Ingestie-trigger:
   Eigenaar transformatie (incl. OCR-pad):
   Rechtenfilter bij retrieval:
   Herindexering: trigger + kosten:

4. INFRALAAG
   Managed API / self-hosted / hybride
   Antwoord op dataresidentie + wie tekende:
   Gedrag bij provider-uitval:

5. OBSERVABILITY
   Trace-velden die we vastleggen:
   Eigenaar golden set + streefomvang:
   Mechanisme prompt-versiebeheer:
   Ship gate (de metric die een release blokkeert):

6. DE DRIE DINGEN DIE WE NIET BOUWEN

Dat laatste kopje telt net zo zwaar als de rest. Het opschrijven van de non-goals is wat voorkomt dat er in maand twee een agent-framework groeit waar niemand om vroeg.

Geef dit aan drie leveranciers en hun offertes worden voor het eerst vergelijkbaar, omdat ze hetzelfde systeem beprijzen in plaats van drie verschillende gokken erover. Combineer het met de technische vragen uit [hoe je een AI-leverancier beoordeelt vóór je tekent](/blog/vet-ai-vendor-before-you-sign) en je merkt snel wie dit eerder heeft opgeleverd.

## Waar dit een opdracht wordt

Als je met dat sjabloon ging zitten en drie van de zes secties eindigden als "ik weet niet hoe ik dit moet beslissen", dan is dat geen tekortkoming van het sjabloon — het is het eerlijke antwoord, en precies het gat dat een [Full Build](/services) dicht: zes tot twaalf weken waarin een senior engineer deze keuzes samen met je maakt, de model-, data-, infra- en observability-laag end-to-end bezit, en de feature plus het product eromheen oplevert. Het architectuurdocument wordt in week één geschreven, niet in maand drie ontdekt.

Wil je een tweede paar ogen op een document dat je al hebt ingevuld — of wil je die vier beslissingen netjes gemaakt hebben vóór er een SOW getekend wordt — [vertel me wat je bouwt](/contact) en ik vertel je welke laag je als eerste gaat bijten.
