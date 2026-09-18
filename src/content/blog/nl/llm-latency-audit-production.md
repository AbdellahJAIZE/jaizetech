---
title: "AI latency productie: van 'voelt traag' naar meetbare p95-fix"
description: "AI latency productie oplossen begint niet bij een sneller model, maar bij vijf gemeten pipeline-stages, budgetten en monitoring per stage."
published: "2026-09-18"
tags: ["AI latency", "productie", "LLM performance", "observability", "AI engineering"]
ogImage: "/images/blog/llm-latency-audit-production/cover.jpg"
primaryService: "hardening"
---
Je AI-feature haalt de evals. De antwoorden kloppen. En het ticket voor je zegt "het voelt traag", zonder getal erbij, van een klant die geen ongelijk heeft. Vraag je het team waar de tijd zit, dan krijg je drie gokken: het model, retrieval, "waarschijnlijk het framework". Niemand heeft het gemeten, want niemand heeft een plek om te kijken.

Ik heb dit op genoeg productiesystemen meegemaakt om het patroon te kennen. Latency is bijna nooit een modelprobleem. Het is een pipeline-probleem, en pipelines kun je debuggen. Dit is mijn AI latency productie-audit: knip het request op in stages die je apart timet, stel per use case een budget vast, pas de fixes toe die echte seconden schelen, en zet monitoring neer zodat de volgende regressie op een dashboard verschijnt voordat hij in een supportticket staat.

Alles hier kun je zelf in een week doen. De instrumentatie is een paar dozijn regels code. Het lastige deel is besluiten dat "het voelt traag" een bug met een root cause is, geen eigenschap van AI.

## Het moment waarop "het voelt traag" binnenkomt en niemand kan zeggen waar de tijd zit

Dit tref ik op de eerste dag meestal aan. Een chatfeature die ergens tussen de 2 en 14 seconden doet over een antwoord, zonder patroon dat het team kan verklaren. Eén trace, als tracing überhaupt bestaat, met één span genaamd `llm_call` die alles omvat. Een Slack-thread van drie weken geleden waarin iemand een sneller model voorstelde en iemand anders een grotere vectordatabase, en beide voorstellen nog open staan omdat niemand kon bewijzen dat een van de twee zou helpen.

De inconsistentie is de verklikker. Als het model de bottleneck was, zou de latency ruwweg evenredig zijn met de outputlengte en redelijk stabiel. Wild variërende latency betekent dat iets in het pad soms goedkoop is en soms niet: een retrieval-call die af en toe een koude index raakt, een tool-loop die op maandag één iteratie draait en op dinsdag vijf, een retry verstopt in een client library, een reranker die bij de ene query 20 documenten krijgt en bij de volgende 200.

Het team ziet hier niets van, omdat ze de feature hebben gemeten zoals je een normale API meet: totale requesttijd. Dat getal vertelt je dat er een probleem is en niets over waar. De bredere lijst staat in [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production); latency is het punt op die lijst dat het vaakst verkeerd wordt gediagnosticeerd, omdat de voor de hand liggende verdachte, het model, meestal onschuldig is.

## Stel een AI latency productie-budget vast voordat je iets aanraakt

Je kunt niet optimaliseren richting "sneller". Je kunt optimaliseren richting een getal, en dat getal hangt volledig af van wat de feature is. Het eerste wat ik op een latency-opdracht doe is per use case een budget opschrijven, in milliseconden, en de product owner ervoor laten tekenen. Dat klinkt bureaucratisch. Het is de stap die voorkomt dat het team twee weken besteedt aan 300 ms afschaven van een achtergrondjob waar niemand op wacht.

![AI latency productie: van 'voelt traag' naar meetbare p95-fix](/images/blog/llm-latency-audit-production/1.jpg)

De budgetten die ik daadwerkelijk gebruik, uit ervaring en niet uit een gepubliceerde standaard:

- **Chat met streaming.** Time to first token onder de 1 seconde, liefst onder de 600 ms. Zodra de tokens stromen, tolereren gebruikers een lang antwoord. Vóór het eerste token wordt elke 100 ms gevoeld.
- **Chat zonder streaming, of een single-shot antwoord in een formulierveld.** Totaal onder de 3 seconden, met een zichtbare loading state vanaf 200 ms. Boven de 5 seconden gaan gebruikers opnieuw proberen, wat je load en je kosten verdubbelt.
- **Voice.** Onder de 800 ms van het einde van de spraak tot het begin van het antwoord, anders voelt het gesprek kapot. De cijfers per component staan in de [voice AI benchmarks-post](/blog/voice-ai-b2b-livekit-openai-realtime-benchmarks); deze post gaat over de pipeline rond die componenten.
- **Achtergrondjobs: documentextractie, classificatie, nachtelijke verrijking.** Throughput en kosten, geen latency. Een document van 20 seconden is prima als je er tienduizend parallel verwerkt.
- **Autocomplete en inline suggesties.** Onder de 300 ms, of ship het niet. Dit is het ene budget waar een klein model geen compromis is maar het ontwerp.

Schrijf het budget als twee getallen: p50 en p95. De p95 is degene die gebruikers onthouden. Een feature met een mediaan van 1,5 seconde en een p95 van 11 seconden "voelt traag", omdat één op de twintig requests een slechte ervaring is en iedereen er een raakt in zijn eerste sessie.

## Instrumenteer de pipeline: vijf stages, vijf timers

Met een budget in de hand splits je het request op in de stages die daadwerkelijk in je code bestaan en time je elke stage apart. Voor vrijwel elke LLM-feature die ik heb geaudit zijn het deze vijf:

1. **Netwerk in en uit.** Client naar jouw API, jouw API naar de modelprovider, en terug. Vanuit Nederland is een round trip naar een US-East endpoint in mijn ervaring ruwweg 90 tot 120 ms voordat er werk gebeurt; naar een EU-regio 10 tot 30 ms. Biedt je provider een EU-endpoint en gebruik je het niet, dan is dat 100 ms per call, maal het aantal calls in het request.
2. **Retrieval.** De query embedden, de vector search, eventuele keyword search, de reranker. Elk een aparte timer. Alleen al de embedding-call is een netwerk-round-trip naar een model.
3. **Orchestratie.** Alles wat je framework doet tussen de stappen: prompts opbouwen, output parsen, tools kiezen, state serialiseren. Teams nemen aan dat dit nul is. Dat is het niet, zeker niet in agent-frameworks met veel abstractie tussen jouw code en de HTTP-call.
4. **Modelcall.** Gesplitst in time to first token en generatietijd. Die hebben verschillende oorzaken en fixes: de eerste wordt gedomineerd door promptlengte en queueing bij de provider, de tweede door outputlengte en modelsnelheid.
5. **Streaming en post-processing.** Tijd van het laatste token tot het scherm van de gebruiker: output parsen, guardrail-checks, JSON-validatie, een tweede "formatting"-call die iemand in maand drie heeft toegevoegd.

De implementatie heeft geen vendor nodig. OpenTelemetry-spans met één attribuut per stage, geëxporteerd naar wat je al draait, is genoeg:

python
with tracer.start_as_current_span("retrieval") as span:
    t0 = time.perf_counter()
    q_emb = embed(query)
    span.set_attribute("retrieval.embed_ms", (time.perf_counter() - t0) * 1000)
    t1 = time.perf_counter()
    docs = rerank(query, vector_search(q_emb, k=20))
    span.set_attribute("retrieval.search_rerank_ms", (time.perf_counter() - t1) * 1000)
    span.set_attribute("retrieval.doc_count", len(docs))

with tracer.start_as_current_span("model") as span:
    t2 = time.perf_counter()
    first_token_at = None
    for chunk in client.stream(prompt):
        if first_token_at is None:
            first_token_at = time.perf_counter()
            span.set_attribute("model.ttft_ms", (first_token_at - t2) * 1000)
        yield chunk
    span.set_attribute("model.gen_ms", (time.perf_counter() - first_token_at) * 1000)
    span.set_attribute("model.prompt_tokens", usage.prompt_tokens)

Leg de inputgroottes naast de timings vast: prompt tokens, aantal opgehaalde documenten, aantal tool-iteraties. De helft van de tijd is de root cause "deze stage is prima bij 2.000 tokens en dramatisch bij 30.000", en dat zie je alleen als de grootte op dezelfde trace staat als de tijd.

Na een dag echt verkeer heb je een gestapelde uitsplitsing per request en, belangrijker, per p95-request. Die p95-uitsplitsing verrast het team bijna elke keer. Het model is meestal 30 tot 50 procent van de wall clock. De rest is retrieval, orchestratie en calls die niet sequentieel hadden hoeven zijn.

## Vijf fixes die echte tijd schelen zonder aan het model te komen

Dit zijn de fixes waar ik als eerste naar grijp, op volgorde van hoe vaak ze de grootste winst opleveren. Geen ervan vereist een ander model.

**1. Stream, vanaf de eerste stage die output produceert die de gebruiker ziet.** Als je niet streamt, is dit de grootste verbetering in ervaren latency die er is, en het kost een middag. Stream je wel maar buffer je het hele antwoord om het eerst te valideren, dan stream je niet. Valideer incrementeel, of valideer achteraf en corrigeer bij de zeldzame fout.

**2. Cache op drie niveaus.** Prompt caching aan de providerkant voor de statische system prompt en de few-shot-voorbeelden; dat verkort de time to first token merkbaar bij lange prompts en de kosten nog meer. Een embedding-cache op genormaliseerde querytekst, want gebruikers stellen dezelfde vijftig vragen. Een response-cache met korte TTL voor werkelijk identieke requests, het FAQ-achtige verkeer dat bij de meeste assistenten 10 tot 30 procent is.

**3. Draai onafhankelijke calls parallel.** De query embedden en de gebruikerscontext laden. Vector search en keyword search. Twee tool-calls die niet van elkaar afhangen. Ik vind regelmatig ketens waarin vier calls sequentieel draaien en twee ervan op tijdstip nul hadden kunnen starten. `asyncio.gather` is niet exotisch; het is alleen niet de default in de meeste framework-voorbeelden.

**4. Gebruik een kleiner model voor subtaken.** Query herschrijven, intentclassificatie, "heeft dit überhaupt retrieval nodig", output formatteren. Een klein model beantwoordt een classificatieprompt in een paar honderd milliseconden waar het frontier-model er meer dan een seconde over doet, en het is een orde van grootte goedkoper. Dit is dezelfde discipline als [een continuous eval loop draaien](/blog/llm-evaluation-production-continuous-eval): je kunt het model op een subtaak alleen veilig wisselen als je een eval voor die subtaak hebt.

**5. Snoei de prompt.** Time to first token schaalt met input tokens. 20 chunks ophalen en ze er allemaal in proppen terwijl de top 5 het antwoord draagt, kost je latency én nauwkeurigheid. Een system prompt van 12.000 tokens die in een jaar is aangegroeid, is een latency-bug. Meet prompt tokens per request, stel een plafond in, en behandel overschrijding als een falende test.

Elk van deze fixes beweegt de p50 en de p95 samen. Let op de fixes die er maar één bewegen: een grotere connection pool die de mediaan helpt en niets doet voor de staart is geen latency-fix maar een load-fix.

## Wanneer de fix re-architectuur is, geen tuning

Soms laat de trace een vorm zien die geen enkele hoeveelheid caching redt. Drie patronen komen steeds terug.

**De sequentiële keten die één call had moeten zijn.** Query herschrijven, intent classificeren, retrieval, genereren, samenvatten, formatteren: zes modelcalls in serie, elk met een eigen round trip en time to first token. De keten bestaat omdat hij stap voor stap is gebouwd, elke stap als fix voor een kwaliteitsprobleem. Vaak vallen drie stappen samen tot één goed gestructureerde prompt met schema-beperkte output, en halveert de p50. De [post over prompt-versiebeheer](/blog/prompt-versioning-regression-testing) beschrijft hoe je dat doet zonder stille kwaliteitsregressie.

**Redundante retrieval.** De agent doet retrieval voor de eerste stap, een sub-agent doet het opnieuw voor dezelfde vraag met net andere bewoording, en de "verificatie"-stap doet het een derde keer. Ik heb requests gezien met vijf retrieval-calls en één nuttige. Doe retrieval één keer en geef de resultaten door via de state. De kwaliteitskant hiervan staat in [waarom RAG in productie breekt](/blog/rag-breaks-in-production); hier is het punt puur dat elke redundante call 200 tot 600 ms is die je voor niets betaalt.

**De praatgrage tool-loop.** Een agent die één tool-call per keer beslist, met een volledige modelcall tussen elke beslissing. Vijf tools betekent zes model-round-trips. Batch de tool-beslissingen waar het model ze vooraf kan plannen, zet een harde cap op het aantal iteraties, en zet die cap in de trace zodat je ziet wanneer hij geraakt wordt. Heeft de loop voor het mediane request meer dan drie iteraties nodig, dan is de taak verkeerd opgeknipt en zit de fix in het ontwerp.

Het eerlijke signaal dat je in re-architectuurgebied zit: de stage die de p95 domineert is orchestratie, niet één specifieke call. Individuele calls tunen helpt dan niet, want het probleem is hoeveel er zijn.

## Latency monitoren zodat hij niet stilletjes regresseert

Latency-regressies zijn stil. Niemand wisselt het model en kondigt aan "dit wordt trager". Iemand voegt een guardrail-check toe. Iemand verhoogt `k` van 5 naar 20 om een klacht over recall op te lossen. De provider heeft een trage week. Een nieuwe klant uploadt documenten die tien keer groter zijn dan alles in je testset. Elk daarvan kost een paar honderd milliseconden, en zes maanden later is de feature twee keer zo traag en kan niemand de dag noemen waarop het gebeurde.

De monitoring die dit vangt is niet ingewikkeld, maar ze moet per stage bestaan, niet alleen per request:

- **Een dashboard met p50 en p95 per stage**, gestapeld, over de afgelopen 7 en 30 dagen. Eén blik beantwoordt "wat werd trager en wanneer".
- **Alerts op de p95 per stage, niet op het totaal.** Een alert op totale latency gaat af nadat gebruikers het merken. Een alert op de retrieval-p95 gaat af als de index koud wordt of het corpus van een klant groeit.
- **Inputgroottes naast de timings.** Prompt tokens, opgehaalde documenten, tool-iteraties. Als latency beweegt, is de eerste vraag of de grootte mee bewoog.
- **Time to first token van de provider als eigen reeks**, zodat je "onze code werd trager" kunt onderscheiden van "de provider heeft een slechte dag". Allebei gebeurt; de reactie verschilt.
- **Een latency-assertie in CI.** Speel bij elke deploy 50 representatieve requests af tegen staging en laat de build falen als de p95 per stage het budget met meer dan een vaste marge overschrijdt. Dit is de eval loop toegepast op snelheid, en het enige dat ik heb gevonden dat de aangroei betrouwbaar stopt.

Koppel het latency-dashboard aan het kostendashboard. Ze delen vaker wel dan niet een root cause: de redundante retrieval-call is zowel traag als betaald; de prompt van 12.000 tokens is zowel traag als duur.

## Wat je een vendor vraagt, en wat je deze week zelf kunt meten

Als een vendor of bureau een snelle AI-feature belooft, scheiden drie vragen degenen die het hebben gedaan van degenen die erover hebben gelezen. Eén: wat is jullie time-to-first-token p95, onder load, vanaf een EU-client? Een getal met een locatie en een percentiel is een antwoord; "sub-second" niet. Twee: waar in de pipeline gaat jullie p95-tijd naartoe? Wie geen uitsplitsing per stage kan laten zien, heeft er geen. Drie: wat gebeurt er met de latency als het corpus tien keer groter is en de prompt twee keer zo lang? Een vendor die dit heeft geshipt, heeft een grafiek.

Wat je zelf kunt doen, deze week, met de code die je al hebt:

1. Voeg de vijf stage-timers toe. Eén dag, inclusief ze in je bestaande observability-stack krijgen.
2. Draai een dag echt verkeer en haal de p95-uitsplitsing op. Niet het gemiddelde. De p95.
3. Schrijf het latency-budget voor je belangrijkste use case en laat het aftekenen.
4. Pas de fix toe die past bij de grootste stage in je p95. Meestal streaming of parallellisme eerst.
5. Zet een p95-per-stage-paneel op het dashboard waar het team al naar kijkt.

Zit de p95 daarna nog steeds buiten budget en is de grootste stage orchestratie, dan zit je in het re-architectuurgeval, en dat is een afgebakend stuk werk in plaats van een tuning-sessie. De [dienstenpagina](/services) beschrijft hoe dat er als opdracht uitziet.

## Waar dit een opdracht wordt

Dit is de kern van een **Production Hardening**-opdracht: drie tot zes weken waarin ik de pipeline instrumenteer, samen met jou de latency- en kostenbudgetten vaststel, de fixes toepas op volgorde van gemeten impact, en de monitoring per stage, alerts en CI-asserties achterlaat die regressie stoppen, naast de evals en het prompt-versiebeheer die de wijzigingen veilig maken. Als je AI-feature werkt maar gebruikers zeggen dat hij traag voelt en niemand kan aanwijzen welke stage de tijd opeet, is dat precies het startpunt. Lees de scope op de [dienstenpagina](/services), of [neem contact op](/contact) en we beginnen met jouw p95-uitsplitsing.
