---
title: "AI-feature team grootte: waarom één engineer vaak genoeg is"
description: "De juiste AI-feature team grootte is meestal geen squad van vier. Waarom één senior engineer plus domeinexpert vaker het beste werk levert."
published: "2026-10-07"
tags: ["AI-feature team grootte", "AI-team samenstellen", "AI feature bouwen", "staffing AI project", "AI MVP Nederland"]
ogImage: "/images/blog/ai-feature-build-team-size/cover.jpg"
primaryService: "ai-features"
---
De meeste AI-feature builds worden bemand voordat iemand naar het echte werk heeft gekeken. De redenering gaat zo: hier zit machine learning in, dus we hebben een ML-engineer nodig, en er moet een API komen, dus een backender, en een UI, dus een frontender, en het moet ergens draaien, dus DevOps. Vier vacatures, of een leveranciersvoorstel met vier namen erop. Ik heb aan beide kanten van die tafel gezeten, en mijn eerlijke antwoord over **AI-feature team grootte** voor een eerste productiefeature is: één senior engineer plus een domeinexpert die vragen beantwoordt. Geen squad.

Dat is geen kostenargument. Eén senior engineer tegen een senior tarief is niet goedkoop. Het is een argument over waar het werk in een AI-feature daadwerkelijk zit, en over wat je betaalt zodra je een strak gekoppeld systeem opdeelt tussen vier mensen die elk een schijfje bezitten.

Hieronder staat hoe ik de rollen uit elkaar trek voordat iemand een vacaturetekst schrijft of een opdrachtbevestiging ondertekent, waar een enkele eigenaar echt vastloopt, en een korte test die je deze week kunt doen.

## Het organogram dat niemand betwist

De vierdeling komt uit webproductwerk, waar hij vaak klopt. Bouw een klantportaal met een betaalflow, een rapportagedashboard en SSO, en ja, dan wil je een frontend-specialist en iemand die in de database woont. Die oppervlakken zijn echt te scheiden. Eén persoon kan de checkout-UI bezitten terwijl een ander het grootboek bezit, en ze ontmoeten elkaar bij een gedocumenteerde API.

AI-features zijn niet op die manier te scheiden. Wat er in productie misgaat, zit bijna nooit netjes in één laag. Een gebruiker meldt dat de assistent met volle overtuiging een verkeerd antwoord gaf over een contract uit 2024. De oorzaak is één van deze: chunking die de clausule over twee chunks heen heeft gesplitst, een retriever die drie bijna-duplicaten teruggeeft en je contextbudget opbrandt, een prompt die het model vertelt om "behulpzaam" te zijn waardoor het gaten opvult, een provider die stil een nieuwe modelsnapshot heeft uitgerold, een cache die het antwoord van gisteren serveert, of een frontend die het bronnenblok afkapt. Ik heb varianten van alle zes gedebugd. Dat onderzoek kruist elke laag binnen één sessie, en het bestaat vooral uit traces lezen en varianten draaien.

Geef dat onderzoek aan vier specialisten en je hebt het niet geparallelliseerd. Je hebt een triage-overleg gecreëerd.

## Wat een echte specialist vraagt, en wat één persoon met vier petten is

Een deel van de rollen die mensen opsommen zijn wél losse vaardigheden die een sterke generalist niet kan faken. Een model from scratch trainen, of dat nu een YOLO-variant op foto's van de fabrieksvloer is of een fine-tune met echte train- en validatiediscipline, is specialistenwerk en de faalmodi zijn van buitenaf niet zichtbaar. Data-engineering op volume (change data capture, orchestratie, een warehouse met lineage) is een apart vak. Serieus interactieontwerp is een apart vak. Security- en compliance-review, inclusief een DPIA en een EU AI Act-classificatie, vraagt iemand die dat voor zijn beroep doet. 24/7 piket tegen een SLA vraagt koppen, geen talent.

![AI-feature team grootte: waarom één engineer vaak genoeg is](/images/blog/ai-feature-build-team-size/1.jpg)

En dan is er de lijst die op vier rollen lijkt en in werkelijkheid één werkweek is:

- **"ML-engineer" voor een RAG- of agentfeature.** Als je een gehost model aanroept, wordt er niets getraind. Het werk is retrievalkwaliteit, chunkingstrategie, promptversiebeheer, validatie van structured output, een evalset met duidelijke drempels om te mogen shippen. Dat is toegepaste backend-engineering met een meetgewoonte. Het leunt op dezelfde skills als het bouwen van een zoekfeature, niet op die van een research scientist.
- **"Backender" los van het bovenstaande.** De retrievalcode, de queue, de rate limiter, de tokenboekhouding, het tenantfilter: zelfde repo, zelfde persoon, zelfde middag.
- **"DevOps-hire" voor één service.** Een container, een managed Postgres met pgvector of een gehoste vector store, een secrets manager, een CI-pipeline, een staging-omgeving, structured logs die ergens doorzoekbaar landen. Een senior backend-engineer die eerder iets live heeft gezet doet dit in dagen. Je hebt een platformspecialist nodig bij vijftien services en een compliance-grens, niet bij twee.
- **"Frontender" voor een streaming chatpaneel.** Token streaming, een loading state die niet liegt, bronvermeldingen renderen, een foutstatus voor als het model een timeout geeft, een duimpje-omlaag dat naar een feedbacktabel schrijft. Echt werk, en echt vakmanschap als de UI het product is, maar een competente full-stack AI engineer levert dit zonder aparte hire.

Het patroon dat ik in offertes zie: vier titels gefactureerd tegen werk dat één persoon met minder herstelwerk doet, omdat degene die de prompt schrijft ook degene is die de opgehaalde chunks ziet en degene die bepaalt wat de UI toont. Die drie beslissingen zijn dezelfde beslissing. Voordat je mensen op lagen plot, is het de moeite om naar [de architectuurkeuzes die je als eerste vastzet](/blog/ai-feature-architecture-decisions) te kijken, want die vier keuzes bepalen grotendeels of het werk überhaupt te scheiden valt.

## Waar één eigenaar echt vastloopt

Ik ga niet beweren dat één engineer eeuwig meeschaalt. Er zijn vier grenzen die echt bestaan, en ze komen in een voorspelbare volgorde.

**Piket.** Eén persoon kan geen pager dragen voor een feature met een contractuele uptime-belofte. Zodra je een SLA toezegt, heb je minimaal drie mensen in een rooster nodig, en dat is een staffingfeit, geen engineeringfeit. Tot dat moment is best-effort support met een gedocumenteerde runbook eerlijk en voldoende.

**Vaste externe deadlines.** Als een vakbeurs of een klant-golive de datum bepaalt en de scope niet beweegt, koop je met parallelle werkstromen kalendertijd. Een tweede engineer toevoegen aan een build van vier weken maakt het geen twee weken, maar een frontend-specialist erbij zodat de UI-afwerking naast het retrievalwerk loopt kan je wel een week schelen.

**Eigen modeltraining.** Heeft de feature een visionmodel nodig dat op je eigen gelabelde data is getraind, of een echte fine-tune met held-out evaluatie, haal dan iemand binnen die dat werk fulltime doet. Een generalist kan een model integreren en evalueren. Er een goed trainen is een ander beroep.

**Labelen en domeinwaarheid.** Geen enkele engineer kan de ground truth verzinnen. Iemand die het domein kent moet keer op keer zeggen welk van twee antwoorden juist is, anders betekent je evalset niets. Dit is de rol die elk staffingplan vergeet, en het is de rol die bepaalt of de feature live gaat.

## AI-feature team grootte, uitgewerkt voor drie projectvormen

Zo zou ik drie concrete builds bemannen. De doorlooptijden gaan uit van iemand senior die dit soort dingen eerder heeft opgeleverd.

**Vorm 1: één AI-feature in een bestaand product.** Een supportassistent over 4.000 interne documenten, of extractie uit inkomende facturen. Zes tot twaalf weken. Bemanning: één senior engineer die het end-to-end bezit, plus een domeinexpert voor ruwweg twee uur per week om de evalset te bouwen en geschillen te beslechten, plus iemand intern die bij overdracht met naam en toenaam onderhouder wordt. De rol die deze vorm vergeet is die onderhouder. Features sterven een half jaar na livegang omdat niemand de prompt bezat toen de provider het model uitfaseerde.

**Vorm 2: een AI-native productoppervlak.** Meerdere features, een nieuwe UI, een paar integraties, een echt product om te ontwerpen. Drie tot vijf maanden. Bemanning: een senior eigenaar op AI en backend, een tweede engineer op frontend en integraties, een designer op zo'n 30 procent. Drie mensen, twee fulltime. De vergeten rol is hier productbeslissing. Twee engineers zonder iemand die bepaalt wat de assistent weigert te doen, bouwen twee verschillende meningen in dezelfde feature.

**Vorm 3: gereguleerd, hoog volume, of multi-tenant met SLA.** Computer vision op een productielijn, of een assistent die aan twintig enterprise-tenants wordt verkocht. Hier is het team van vier tot zes mensen wél correct, en het is niet het team dat mensen meestal noemen. Je hebt de senior eigenaar nodig, een tweede en derde engineer voor het piketrooster, platform- en securityondersteuning, en een compliance-eigenaar. Je hebt geen vier verschillende specialisten nodig die elk één laag van het requestpad bezitten. Je hebt genoeg mensen nodig om een rooster en een review te dekken.

Alleen de derde vorm rechtvaardigt het standaard organogram, en de reden is operatie, niet technische complexiteit. Zet je kosten naast koppen, dan is [de laagsgewijze uitsplitsing van een full build](/blog/full-ai-feature-build-scope-cost) het logische vervolg hierop.

## De coördinatiebelasting

Vier mensen hebben zes onderlinge raakvlakken. Twee mensen hebben er één. Dat rekensommetje is het hele argument, en bij AI-features doet het meer pijn dan bij normaal productwerk omdat de raakvlakken niet stabiel zijn.

Concreet ziet die belasting er zo uit. De evalset ligt bij de ML-persoon, de prompt leeft in de backend-repo, en niemand bezit de regressie wanneer retrieval verandert. Het outputschema verandert, de frontend breekt, en de fix wacht een dag op een heen-en-weer. Elke specialist heeft het hele systeem in zijn hoofd nodig om iets te kunnen debuggen, dus je betaalt de kosten van context opbouwen vier keer in plaats van één keer. En vier parttime specialisten die over andere accounts verdeeld zijn, betekent vier aparte inlooptijden tegen vier aparte agenda's.

Een enkele eigenaar draagt daar niets van, en betaalt een andere prijs: geen tweede mening, een bus factor van één, en een hard plafond op doorvoer. Beide kosten zijn echt. De fout is dat er altijd maar één van de twee wordt ingeprijsd.

## Vraag wie de code aanraakt

Als een leverancier een team voorstelt, vertelt het voorstel je wie factureerbaar is, niet wie bouwt. Vijf dingen om op papier te krijgen, en ze trekken voorstellen sneller uit elkaar dan het teamdiagram:

- De naam en senioriteit van iedereen die code gaat schrijven. Niet de rolverdeling, de individuen.
- Of degene die de scope heeft bepaald ook degene is die bouwt, of dat het na ondertekening overgaat.
- De allocatie in uren per week voor de ML-specialist op het voorstel. "Betrokken" betekent meestal verdeeld over vijf accounts.
- Wie de pager houdt na livegang, hoe lang, en wat er op dag 91 verandert.
- Wat de overdracht omvat: de evalset met zijn labels, de prompthistorie, de runbook, het kostendashboard, of alleen een repo.

Een voorstel met twee bij naam genoemde senior engineers verslaat doorgaans een voorstel met vijf mensen bovenop een staffingpiramide. Weeg je leveringsroutes af in plaats van mensen, dan heb ik [bureau, freelancer en full build](/blog/ai-feature-mvp-netherlands-build-options) apart vergeleken, en [de kant van zelf aannemen](/blog/hire-ai-engineer-netherlands) als er een vaste vacature op tafel ligt.

## Een test van één pagina voordat je de vacature schrijft

Markeer elk van deze vijf uitspraken als waar of niet waar voor jouw build, en tel de waars.

1. De feature vereist het trainen van een model op je eigen gelabelde data, niet het integreren van een gehost model.
2. Je hebt je vastgelegd op een uptime-SLA met financiële gevolgen.
3. De gebruikersinterface is het product, niet een paneel in iets bestaands.
4. Er zitten meer dan drie losse AI-oppervlakken in de scope van deze release.
5. De opleverdatum staat vast door iets buiten engineering en de scope kan niet bewegen.

Nul of één waar: één senior engineer die het geheel bezit, plus een domeinexpert voor de evalset. Twee of drie: een kern-eigenaar plus één of twee specialisten op precies de gebieden die waar scoorden. Vier of vijf: je hebt een platformprogramma, en je staffingplan heeft een lead, een rooster en een compliance-eigenaar nodig.

De meeste teams die ik spreek scoren één waar, en hebben al vier functieprofielen geschreven.

## FAQ

### Heb ik een ML-engineer nodig om een AI-feature te bouwen?

Integreer je een gehost model (GPT, Claude, Gemini) met retrieval over je eigen data, dan niet. Je hebt een engineer nodig die modeloutput behandelt als iets dat je meet, met een evalset en versiebeheer op prompts. Een echte ML-engineer verdient zijn stoel zodra je een model traint of fine-tunet op eigen data, of computer vision draait op beelden die nog niemand heeft gelabeld.

### Kan één engineer realistisch frontend, backend en infrastructuur doen?

Voor één feature in een bestaand product: ja, en het resultaat is meestal coherenter omdat degene die kiest wat het model teruggeeft ook degene is die het rendert. De grenzen zijn doorvoer en operationele dekking, niet vaardigheid. Waar het misgaat is een grote nieuwe UI met echte designeisen, of een 24/7 supportbelofte.

### Hoeveel mensen heb ik nodig voor onderhoud na livegang?

Minder dan de meeste plannen aannemen, maar nul kan niet. Begroot een onderhouder met naam en een paar uur per maand voor modeluitfaseringen, evals opnieuw draaien en kostenreview, plus de domeinexpert die de evalset actueel houdt. De faalmodus is een werkende feature overdragen aan een team zonder eigenaar en zonder evalset, en dat is precies hoe een feature in een kwartaal stil wegzakt.

### Is een bureauteam van vier sneller dan één senior engineer?

Voor de eerste productieversie meestal niet. De kalendertijd die je met parallellisme wint, gaat op aan verschuivende raakvlakken en triage, en AI-features verschuiven meer dan gewoon productwerk omdat retrieval, prompt en outputschema samen blijven bewegen. Meerdere mensen gaan winnen zodra de scope echt uiteenvalt in onafhankelijke oppervlakken, of zodra je een piketrooster nodig hebt.

Kwam je test uit op nul of één waar, dan is dat precies wat een Full Build is: zes tot twaalf weken met één senior engineer die de AI-feature en het product eromheen end-to-end bezit, van backend tot deploy, in plaats van dat jij vier hires coördineert die elk een kwart van het systeem vasthouden. Op de [servicespagina](/services) staat de scope, en wil je je eigen antwoorden op de vijf uitspraken doorlopen voordat je iets opschrijft, [neem dan contact op](/contact).
