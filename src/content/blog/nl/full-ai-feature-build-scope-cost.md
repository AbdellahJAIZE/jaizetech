---
title: "AI-feature laten bouwen: de 7 lagen die elke offerte verzwijgt"
description: "Een AI-feature laten bouwen kost meer dan modelintegratie. Deze checklist toont de 7 lagen, budgetverdeling en SOW-regels voor CTO's."
published: "2026-09-17"
tags: ["AI-feature laten bouwen", "SOW checklist", "AI development", "productie-AI", "SaaS"]
ogImage: "/images/blog/full-ai-feature-build-scope-cost/cover.jpg"
primaryService: "ai-features"
---
Je hebt het budget. Je hebt de feature. Wat je niet hebt is een manier om de drie offertes op je bureau te vergelijken, want de ene is een voorstel van 40 pagina's van een bureau, de tweede een e-mail van twee alinea's van een freelancer, en de derde een fixed-price aanbod dat op de een of andere manier de helft kost van de andere twee. Ze kunnen onmogelijk hetzelfde project beschrijven. Dat doen ze ook niet.

Ik heb genoeg van deze scopes geschreven, en genoeg van anderen gelezen, om te weten dat het prijsverschil bijna nooit over tarieven gaat. Het gaat over wat is weggelaten. Een AI-feature laten bouwen tot en met productie bestaat uit zeven lagen werk, en de meeste offertes prijzen er drie, wuiven naar twee, en noemen de overige twee helemaal niet. De ontbrekende lagen duiken later op als meerwerk, een storing, of een feature die niemand vertrouwt.

Deze post is de checklist die ik een CTO zou geven voordat hij tekent: de zeven lagen, ruwweg welk aandeel van het budget elke laag pakt, de ene laag die elke offerte te krap begroot, een uitgewerkte scope voor een middelgroot SaaS-bedrijf, wat een overdracht moet bevatten, en de SOW-regels die een echte offerte scheiden van een opgeklopte. Of je nu mij inhuurt, een bureau, of je eigen team: leg het document dat je gaat tekenen ernaast.

## Het moment waarop je drie SOW's vergelijkt en geen ervan hetzelfde project scopet

Zo zien de drie offertes er van binnen meestal uit.

De bureau-offerte scopet het product. Discovery-workshops, design sprints, een fase "solution architecture", en dan bouwen. Ze is duur omdat er veel mensen in zitten, en vaag over het AI-deel omdat het AI-deel het onderdeel is dat ze het minst vaak hebben gedaan. Het woord "evaluatie" komt één keer voor, in de context van een gebruikersenquête.

De freelancer-offerte scopet het model. Prompt engineering, retrieval, een API. Ze is goedkoop omdat ze aanneemt dat jouw team de frontend, de deployment, de monitoring en de juridische toets voor zijn rekening neemt. Dat kan waar zijn. Niemand heeft het gecheckt.

De fixed-price offerte scopet een demo. Je krijgt een werkende feature op staging met testdata, wat ongeveer dezelfde plek is waar je zou staan als je eigen engineer er drie weekenden aan had besteed. Productie is "fase twee".

Geen van deze is oneerlijk. Het zijn drie verschillende projecten met dezelfde naam. De MVP-post gaat over [wie het moet bouwen: bureau, freelancer of één senior eigenaar](/blog/ai-feature-mvp-netherlands-build-options), en de doorlooptijd-post over [hoe lang elk realistisch pad duurt](/blog/how-long-to-build-an-ai-feature). Deze post gaat over de derde as: wat het eindresultaat moet bevatten om klaar te zijn.

## De zeven lagen die een AI-feature laten bouwen echt heeft, en wat elke laag kost

Een productie-AI-feature is een normale softwarefeature met drie ongewone onderdelen eraan vastgeschroefd: een model, een datapad ernaartoe, en een meetlus eromheen. Al het andere is dezelfde engineering waar je nu al voor betaalt. Als ik een volledige build scope, heeft die zeven lagen, en ik schat elke laag apart in zodat de koper ziet waar de dagen naartoe gaan.

![AI-feature laten bouwen: de 7 lagen die elke offerte verzwijgt](/images/blog/full-ai-feature-build-scope-cost/1.jpg)

De aandelen hieronder zijn wat ik zie op een build van zes tot twaalf weken door één senior engineer, ruwweg 30 tot 60 werkdagen. Vermenigvuldig met het dagtarief dat op de offerte voor je staat. Als een laag helemaal ontbreekt in een offerte, is dat geen korting; dat is werk dat je later doet, op een slechter moment.

**1. Discovery en scoping: 5 tot 10 procent.** Drie tot vijf dagen. Geen workshops. De output is een geschreven spec met de gebruiker, de trigger, de input, de output, de faalmodus die het product nooit mag tonen, en de eerste versie van de eval-set: 50 tot 150 echte inputs met het antwoord dat een domeinexpert zou accepteren. Als de offerte geen eval-set in discovery heeft, heeft de leverancier geen definitie van "werkt". Ik schreef hierover in [een pilot scopen die productie haalt](/blog/ai-pilot-to-production-scoping).

**2. Data en retrieval: 15 tot 20 procent.** Ingestion vanaf waar de data ook staat, opschonen, chunking, embeddings, een vector store (pgvector in je bestaande Postgres is de juiste default voor de meeste teams onder een paar miljoen chunks), en, cruciaal, permissies: gebruiker A mag nooit een document ophalen dat gebruiker B niet mag zien. Permissie-bewuste retrieval is het vaakst ontbrekende onderdeel in freelancer-offertes.

**3. Modelintegratie: 10 tot 15 procent.** Prompts, structured output, tool calls als het een agent is, een provider-abstractie zodat je van model kunt wisselen, retries, timeouts, en een fallback-pad voor als de provider plat ligt. Dit is de laag waarvan iedereen denkt dat het hét project is. Het is de kleinste laag die ertoe doet.

**4. Backend en productintegratie: 15 tot 20 procent.** Auth, tenancy, queues voor alles wat langer dan een paar seconden duurt, rate limits per gebruiker en per tenant, streaming, idempotentie, en het loodgieterswerk naar het datamodel van het bestaande product. Dit is saai, en dit is waar de dagen naartoe gaan in elke echte codebase.

**5. Frontend en UX: 10 tot 15 procent.** Streaming antwoorden, citaties die naar de bron linken, een feedback-knop die wegschrijft naar een tabel die je ook echt gaat lezen, en foutmeldingen die iets nuttigs zeggen als het model niets teruggeeft. Een chatbox is één middag. Een chatbox die mensen vertrouwen is twee weken.

**6. Evals, monitoring en kostencontrole: 15 tot 20 procent.** De eval-harness in CI, tracing op elke call (Langfuse, of OpenTelemetry naar wat je al draait), prompt-versiebeheer, een kostendashboard per tenant, en alerts op latency, foutpercentage en verbruik. Hierover straks meer, want dit is de laag die bepaalt of de feature het eerste kwartaal overleeft.

**7. Infra, security, deployment en overdracht: 10 tot 15 procent.** Infrastructure as code, CI/CD, secrets, een verwerkersovereenkomst met de modelprovider en een EU-regio-endpoint als je die nodig hebt, een runbook, documentatie, en gestructureerd pairen met de persoon die het na de opdracht gaat beheren.

Tel het op en modelintegratie zit ergens tussen een tiende en een zevende van het werk. Als de regels van een offerte voor 60 procent uit "AI-ontwikkeling" bestaan, weet de leverancier óf niet waar de tijd naartoe gaat, óf is niet van plan laag vier tot en met zeven te doen.

Eén opmerking over de draaikosten, die losstaan van de bouwkosten: voor een typische B2B-feature met een paar duizend gebruikers is de maandelijkse modelrekening meestal kleiner dan het weektarief van de leverancier. De build is het dure deel. De maandcijfers heb ik uitgesplitst in [wat een productie-LLM-feature in 2026 echt kost](/blog/cost-of-production-llm-2026).

## De laag die elke offerte te krap begroot: evals en monitoring, niet modelintegratie

Ik heb nog nooit een offerte gezien die het model vergat. Ik heb er heel weinig gezien die evals eerlijk begrootten.

De reden is structureel. Een leverancier wordt betaald om je een feature te geven die werkt op demodag. Een eval-harness is het ding dat je in week acht vertelt dat de feature slechter werd nadat iemand een prompt aanpaste. Het is een kostenpost voor de leverancier en een voordeel voor jou, en het betaalt zich pas uit nadat ze vertrokken zijn. Dus krijgt het een regel "testen" en twee dagen.

Dit is wat de laag echt moet bevatten, en ruwweg wat het kost in dagen op een middelgrote build:

- **Een geversioneerde eval-set** van echte inputs met verwachte outputs, opgeslagen in de repo, aangevuld vanuit productiefeedback. Twee tot drie dagen om de eerste te bouwen, een halve dag per week om bij te houden.
- **Een eval-runner in CI** die elke prompt- of retrieval-wijziging scoort tegen de set en de pipeline laat falen bij regressie. Twee dagen. Dit is het mechanisme dat ik beschreef in [de continuous eval loop die niemand draait](/blog/llm-evaluation-production-continuous-eval).
- **Tracing op elke modelcall**: promptversie, opgehaalde chunks, tokens, latency, kosten, gebruikersfeedback, allemaal gekoppeld aan één request-id. Eén tot twee dagen met Langfuse of een OTel-exporter, langer als je het zelf bouwt. Bouw het niet zelf.
- **Prompt-versiebeheer** met de prompt in source control, een hash op elke trace, en een rollback-pad. Eén dag. Zonder dit kun je "wat is er dinsdag veranderd" niet beantwoorden, en die dinsdag komt.
- **Kostencontrole**: een tokenbudget per tenant, een harde cap, en een alert op 70 procent. Eén dag. De eerste maand zonder levert de factuur op waardoor de feature wordt geschrapt.
- **Alerts** op p95-latency, foutpercentage, percentage lege antwoorden en percentage negatieve feedback. Eén dag.

Dat is acht tot tien dagen, en daarom zit de laag op 15 tot 20 procent. Een offerte die er twee dagen voor rekent gaat het niet leveren. Vraag de leverancier om de eval-harness van hun vorige project te laten zien. Als dat niet kan, prijs de laag dan zelf en tel hem bij hun bedrag op voordat je vergelijkt.

## Een uitgewerkte scope: een middelgroot SaaS-bedrijf bouwt een AI-feature end-to-end

Laat ik het concreet maken met een samenstelling van builds die ik heb gedaan. Een B2B SaaS-bedrijf, zo'n 60 mensen, een React-frontend op een Django-backend met Postgres, ruwweg 300 klant-tenants. Ze willen een assistent in het product die vragen beantwoordt over de eigen documenten en supporthistorie van elke klant. Budget goedgekeurd. Tien weken.

**Week 1–2: scope en data.** Geschreven spec. Eval-set van 120 vragen verzameld uit supporttickets, antwoorden geschreven door twee van hun customer success-mensen. Ingestion-pipeline van hun documentopslag en tickettabellen naar pgvector, met het tenant-id en de document-ACL op elke chunk. Eerste retrieval-cijfers: recall@5 op de eval-set, die begint rond de 60 procent en naar de hoge 80 gaat met betere chunking en een hybride query van keyword plus vector.

**Week 3–5: backend en model.** Een `/assistant`-endpoint op de bestaande API, achter de bestaande auth, streaming via SSE. Een job queue voor ingestion zodat een klant die 5.000 PDF's uploadt het request-pad niet blokkeert. Provider-abstractie met een frontier-model achter een EU-regio-endpoint als primair en een goedkoper model voor query-classificatie. Structured output voor citaties. Retries, een timeout van 20 seconden, en een net "ik kon dit niet in je documenten vinden"-pad dat afgaat bij lage retrieval-confidence in plaats van het model te laten improviseren.

**Week 6–7: frontend en evals.** Het paneel in het product: streaming tekst, citaties die het brondocument openen, duim omhoog en omlaag die naar een feedbacktabel schrijven met het trace-id. Eval-runner in GitHub Actions die faithfulness van antwoorden en correctheid van citaties scoort op de 120 vragen; de pipeline faalt als faithfulness meer dan twee punten zakt. Langfuse-tracing op elke call. Prompts in de repo met een versiehash op elke trace.

**Week 8: hardening.** Tokenbudgetten per tenant en een harde cap. Alerts. Loadtest op drie keer de verwachte concurrency. Een toets van de verwerkersovereenkomst met de modelprovider, een data-retentie-instelling bevestigd op nul, en een notitie van één pagina voor hun juridische team. Rate limits per gebruiker.

**Week 9–10: pilot en overdracht.** Tien klant-tenants krijgen de feature. Feedback wordt dagelijks gelezen en 30 nieuwe vragen gaan de eval-set in. Runbook geschreven. Twee middagen pairen met de interne engineer die het hierna beheert. Een afsluitende readout met de cijfers: eval-scores, p95-latency, kosten per tenant per maand, en de drie dingen die hierna gebouwd moeten worden.

Elk van die weken is een laag uit de lijst hierboven. Als een offerte voor dit project niet op die vorm te leggen is, vraag dan in welke week de ontbrekende laag gebeurt.

## Wat 'overdracht' moet bevatten zodat de code overleeft nadat je weg bent

Overdracht is de laag die kopers vergeten te eisen, omdat ze als laatste komt en omdat ze onzichtbaar is als ze goed gaat. Het is ook de laag die bepaalt of je een feature hebt gekocht of een afhankelijkheid van de leverancier.

De test is simpel: drie maanden na afloop van de opdracht moet iemand in jouw team de prompt aanpassen omdat klanten klagen over de toon. Kan die persoon dat veilig in een middag? Zo ja, dan heeft de overdracht gewerkt. Dit maakt het antwoord ja:

- **De repo is van jou**, in jouw organisatie, vanaf dag één. Geen leveranciersrepo die aan het einde wordt overgedragen, geen licentie op een eigen framework.
- **Een README die een nieuwe engineer binnen een uur naar een draaiende lokale omgeving brengt.** Test het door iemand die niet op het project zat het te laten doen.
- **Architecture decision records.** Vijf tot tien korte documenten over waarom pgvector en niet een managed vector store, waarom dit model, waarom deze chunking. Anders gaan toekomstige engineers elke keuze opnieuw ter discussie stellen.
- **De eval-harness draait met één commando** en in CI. Dit is het vangnet voor die promptwijziging op een middag. De workflow beschreef ik in [prompt-versiebeheer dat stille regressies stopt](/blog/prompt-versioning-regression-testing).
- **Een runbook**: wat de alerts betekenen, wat te doen als de provider plat ligt, hoe je een prompt terugdraait, hoe je keys roteert, hoe je een tenant toevoegt.
- **Dashboards waar je team al naar kijkt**, geen aparte tool waar niemand op inlogt.
- **Eigenaarschap met een naam.** Eén persoon aan jouw kant, met naam in de SOW, die in de laatste twee weken met de bouwer pairt. Zonder die naam vertrekt de kennis met de factuur.
- **Een "maak het kapot"-sessie.** Een uur waarin de bouwer de drie meest waarschijnlijke manieren waarop de feature faalt doorloopt en het team laat zien waar ze moeten kijken.

Een offerte die overdracht opvoert als "documentatie en kennisoverdracht, 1 dag" levert een Confluence-pagina op. Budgetteer vier tot zes dagen voor de laag en sta op de lijst hierboven.

## De SOW-checklist: regels die een echte offerte scheiden van een opgeklopte

Print dit uit en ga met een pen door de offertes.

**Moet aanwezig zijn, met dagen erbij:**

- Geschreven spec en een eval-set van echte inputs, opgeleverd eind week twee
- Ingestion-pipeline en retrieval met permissies op tenant- en documentniveau
- Modelintegratie met provider-abstractie, timeouts, retries en een fallback-pad
- Backend-endpoints binnen je bestaande auth en tenancy, met queueing voor traag werk
- Frontend met streaming, citaties en feedback-registratie
- Eval-runner in CI met een regressiedrempel
- Tracing op elke modelcall met promptversie en kosten
- Kostencaps per tenant en alerts op latency, fouten en verbruik
- Loadtest op een genoemd veelvoud van het verwachte verkeer
- Verwerkersovereenkomst en bevestiging van de dataregio met de modelprovider
- Infrastructure as code en een CI/CD-pipeline die van jou is
- Runbook, ADR's, README, interne eigenaar met naam, pairing-tijd
- Een pilot met echte gebruikers binnen de opdracht, niet erna
- Een readout met cijfers: eval-scores, p95, kosten per gebruiker, de volgende drie punten

**Tekenen van opklopping:**

- Een fase "AI-strategie" of "innovatie" die langer duurt dan een week
- "Model trainen" of "fine-tuning" voor een use case die retrieval over documenten is
- Een licentievergoeding voor het eigen framework of platform van de leverancier
- Change management, stakeholder alignment of design thinking geprijsd in engineeringdagen
- Een team van vijf waar twee context hadden kunnen delen

**Tekenen van te krap scopen:**

- Nergens een eval-set genoemd
- "Testen" als één regel onder de drie dagen
- Monitoring opgevoerd als "optioneel" of "fase twee"
- Overdracht onder de twee dagen
- Productie-deployment omschreven als "ondersteuning voor jullie DevOps-team"
- Geen woord over permissies in retrieval
- Geen woord over de datavoorwaarden van de modelprovider

Een echte offerte is niet de goedkoopste of de duurste. Het is de offerte waarbij je op elke regel kunt wijzen en kunt zeggen bij welke laag die hoort, en waarin alle zeven lagen aanwezig zijn. Leg hem naast de [dienstenpagina](/services) als je wilt zien hoe ik dezelfde lagen uitzet.

## Waar dit een opdracht wordt

Een Full Build is zes tot twaalf weken waarin ik de AI-feature en het product eromheen end-to-end bouw, alle zeven lagen in eigen beheer neem, de pilot met jouw echte gebruikers draai, en een repo, een eval-harness en een runbook overdraag die je team zonder mij kan aanpassen. De scope staat op de [dienstenpagina](/services). Heb je drie offertes en wil je een vierde mening over wat eraan ontbreekt, stuur ze op via de [contactpagina](/contact) — wij lezen elke SOW voordat we antwoorden.
