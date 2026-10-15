---
title: "LLM rate limits productie: het plafond dat je zelf veroorzaakt"
description: "LLM rate limits productie zijn geen providerstoring maar een capaciteitsvraagstuk: meet je piek, log je headroom en bepaal vooraf wat je laat vallen."
published: "2026-10-15"
tags: ["LLM rate limits", "productie", "API quotum", "schaalbaarheid", "AI betrouwbaarheid"]
ogImage: "/images/blog/llm-api-rate-limits-production/cover.jpg"
primaryService: "hardening"
---
Dit is de vraag die ik stel zodra een team me vertelt dat er over drie weken een marketingcampagne live gaat: bij tien keer het huidige verkeer, welk plafond raak je als eerste, en wat ziet een gebruiker op de seconde dat je het raakt? De eerste helft kan bijna iedereen gokken. De tweede helft kan vrijwel niemand beantwoorden. LLM rate limits in productie zijn het plafond dat teams per ongeluk ontdekken, meestal precies in dat ene uur van het jaar waarin het verkeer echt geld waard is.

De storing zelf is onspectaculair. De provider is gezond, je code is onveranderd, het model is hetzelfde model als gisteren. Je vraagt simpelweg meer tokens per minuut dan jouw account mag verbruiken, de API zegt nee, en dan pakt je retry-logica dat nee en vermenigvuldigt het. Nergens in je monitoring staat het woord "capaciteit". Er staat 429, en 429 ziet uit als een providerprobleem tot je de documentatie leest.

Dit is een capaciteitsvraagstuk. Het is in een middag op een whiteboard op te lossen, en dat is een aanzienlijk prettigere plek dan een Slack-kanaal tijdens de piek. Hieronder de checklist die ik afloop als de launchdatum al in de agenda staat.

## Begin bij je eigen piek, niet bij de documentatie van de provider

Het getal dat je nodig hebt is niet requests per dag. Pak de requestlogs van de laatste 30 dagen en zoek de drukste minuut. Dagvolume gedeeld door 1.440 onderschat je echte piek met een factor vijf of meer, want menselijk verkeer komt in klonters: het uur na een mailing, het eerste uur van de Europese werkdag, de inhaalslag op maandagochtend.

Meet daarna tokens per request op p95, niet op het gemiddelde. Een RAG-assistent die gemiddeld 2.000 inputtokens gebruikt, heeft een lange staart van requests van 15.000 tokens zodra iemand een vraag stelt die tien lange documenten ophaalt. Token-per-minuut-plafonds worden opgegeten door die staart, dezelfde staart die opduikt als je [een onverklaarde kostenpiek](/blog/llm-cost-spike-production) uitzoekt.

De derde factor wordt structureel vergeten: fan-out. Eén gebruikersactie is zelden één API-call. Een query rewrite, een reranking-stap, de antwoordgeneratie en een guardrail-check zijn vier calls per bericht. Bij agents is het erger, omdat het aantal calls per taak variabel is in plaats van vast, en dat is [een betrouwbaarheidsprobleem op zichzelf](/blog/ai-agent-loop-guardrails-production).

Reken het uit, schat het niet. Stel dat de campagne 12.000 requests in het piekuur brengt en 40% daarvan in de drukste tien minuten landt. Dat is ongeveer 480 gebruikersacties per minuut. Bij een fan-out van drie calls en een p95 van 6.000 input plus 800 outputtokens vraag je om zo'n 1.440 API-calls en bijna 10 miljoen tokens per minuut. Schrijf die twee getallen op. Dat is straks je vraag aan de provider.

## De drie getallen die je LLM rate limits productie-klaar maken

Elke grote provider handhaaft losse plafonds, en ze zijn niet uitwisselbaar. Requests per minuut, inputtokens per minuut en outputtokens per minuut worden onafhankelijk bijgehouden, meestal per model en soms per regio of per deployment. Een chatfeature met korte prompts raakt eerst het requestplafond. Een samenvatter van documenten van veertig pagina's raakt het inputtokenplafond terwijl hij een fractie van zijn toegestane requests gebruikt. Weten welke van de TPM/RPM limits in productie als eerste bindt, bepaalt wat je optimaliseert, en die antwoorden verschillen: batching helpt het ene, context trimmen het andere.

![LLM rate limits productie: het plafond dat je zelf veroorzaakt](/images/blog/llm-api-rate-limits-production/1.jpg)

Het tweede getal zit in de response headers, en naar mijn ervaring logt minder dan één op de vijf teams ze. OpenAI geeft bij elke call `x-ratelimit-remaining-requests`, `x-ratelimit-remaining-tokens` en de bijbehorende resetwaarden terug. Anthropic geeft `anthropic-ratelimit-requests-remaining` en `anthropic-ratelimit-tokens-remaining`, plus `retry-after` bij een afwijzing. Log ze naast latency en kosten, en je headroom is geen raadsel meer:

python
resp = client.messages.create(**kwargs)
h = resp.response_headers  # of de raw response in jouw SDK
log.info("llm_headroom",
    model=model,
    req_remaining=int(h.get("anthropic-ratelimit-requests-remaining", -1)),
    req_limit=int(h.get("anthropic-ratelimit-requests-limit", -1)),
    tok_remaining=int(h.get("anthropic-ratelimit-input-tokens-remaining", -1)),
)

Nu kun je alarmeren bij 75% verbruik van een window in plaats van bij de eerste afwijzing. Dat is het verschil tussen een waarschuwing en een incident, en het hoort op hetzelfde dashboard als [de rest van je LLM-observability](/blog/llm-observability-production-monitoring).

Het derde getal is: wie deelt dat plafond nog met je? Limieten gelden per organisatie, project of deployment-key, niet per service. Je nachtelijke eval-run, de backfill van het datateam, de staging-omgeving die iemand op de productiekey heeft gericht en de live feature trekken allemaal uit één pot. Ik heb een launch zien degraderen door het eenmalige scriptje van een collega. Aparte keys per workload, met eigen limieten, is een fix van twintig minuten die je isolatie oplevert op de dag dat het uitmaakt.

## "Vang de 429 op en retry" is hoe één rate limit een storing wordt

Dit is de mechaniek die een korte plafondtik in een langdurige verandert. Je zit op je TPM-limiet. Vierhonderd requests worden geweigerd. Je handler probeert ze na twee seconden opnieuw. Die herhaalde tokens landen in het volgende window, bovenop het nieuwe organische verkeer, dus ook dat window gaat over de limiet en weigert zowel de nieuwe requests als de retries. De wachtrij groeit sneller dan het window leegloopt. Niets herstelt tot het verkeer vanzelf afneemt.

Retries stapelen zich ook op zonder dat iemand dat zo heeft besloten. De officiële SDK's retryen standaard (doorgaans twee keer, met backoff). Je servicewrapper retryt. Je job scheduler retryt de hele job. Je frontend retryt bij een fout, en de gebruiker drukt op refresh. Eén gebruikersactie kan twaalf upstream calls worden in precies de minuut waarin je geen capaciteit hebt.

Wat wél werkt:

- **Respecteer `retry-after`.** Als de provider vertelt hoe lang je moet wachten, is korter wachten zinloos en langer wachten gratis.
- **Exponential backoff met volledige jitter**, een cap (30 seconden is meestal ruim genoeg) en een totale deadline per gebruikersrequest. Backoff zonder jitter synchroniseert je clients weer tot golven.
- **Tel je retry-lagen** en zet alles uit op één na. Zet de SDK op nul retries als je het zelf afhandelt.
- **Krimp bij een tokenlimiet, wacht niet alleen.** Een 429 op TPM is een signaal om opgehaalde chunks te schrappen of historie af te kappen, want hetzelfde request faalt op dezelfde grootte opnieuw.
- **Limiteer jezelf client-side.** Een token bucket op ongeveer 80% van je gemeten plafond betekent dat je intern wachtrijt in plaats van afwijzingen produceert. Requests die je nooit verstuurt kosten niets en stormen nooit.

Dit is een andere storing dan een provider die omvalt, en vraagt dus om een andere remedie. [Failover naar een tweede provider](/blog/llm-provider-outage-failover-strategy) is het juiste antwoord als Anthropic of OpenAI degradeert. Het is de verkeerde reflex als je over je eigen quotum zit, want je sleept hetzelfde ongelimiteerde retry-gedrag mee naar het nieuwe endpoint.

## Bepaal wat je laat vallen vóórdat je moet kiezen

Boven het plafond moet er iets níet gebeuren. Kiezen op het moment zelf betekent slecht kiezen, dus classificeer je verkeer nu al in interactief (er kijkt een gebruiker mee), uitstelbaar (verrijking, samenvattingen, embeddings van documenten die tien minuten geleden zijn geüpload) en intern (evals, backfills, experimenten). Onder druk pauzeert intern werk, wachtrijt uitstelbaar werk, en interactief werk krijgt wat er over is.

Eén chokepoint maakt dat handhaafbaar. Routeer elke modelcall door één component die de client-side limiter en een priority queue bevat. Request queuing voor LLM-calls werkt alleen als niets eromheen gaat, wat in de praktijk betekent: één module, geen directe SDK-imports elders, en een lint-regel als je team groot genoeg is om die nodig te hebben.

Schrijf daarna de degradatieladder op, in volgorde, en laat degene die de klantrelatie bezit er zijn fiat op geven:

1. Pauzeer interne en batchjobs. Verplaats wat kan naar het batch-endpoint van de provider, met een eigen quotumpot en een window van 24 uur.
2. Lever gecachete of voorberekende antwoorden waar de vraag zich herhaalt.
3. Val terug op een kleiner, sneller model voor paden met lage impact. Een goedkoper model met een tien keer hogere tokentoewijzing is capaciteit, niet alleen besparing.
4. Trim context: minder opgehaalde chunks, kortere historie. Dat verlaagt je TPM-verbruik onmiddellijk.
5. Begrens de wachtrij. Voorbij een diepte die meer dan een paar seconden wachten impliceert: snel weigeren met een eerlijke melding en een duidelijke retry-optie. Een helder "we zitten aan onze capaciteit, probeer het over een minuut" is beter dan een spinner van 40 seconden die eindigt in een foutmelding.

Fairness per tenant hoort in dezelfde component. De bulk import van één enterprise-klant mag het gedeelde plafond niet opeten, en dat is de throughput-neef van [de isolatieproblemen die multi-tenant AI-features toch al hebben](/blog/multi-tenant-ai-feature-data-leaks).

## Hoe een quotumverhoging echt verloopt

Self-serve tiers schuiven grotendeels vanzelf op. De usage tiers van OpenAI bewegen op basis van cumulatieve spend en de tijd sinds je eerste betaling, dus er is geen formulier: je kwalificeert of niet. Azure OpenAI-quotum wordt toegewezen per subscription, per regio en per model, en je verdeelt het zelf over je deployments. Quotum dat vastzit op een ongebruikte deployment is dus een limiet die je al bezit. Op Bedrock staan de quota per model in Service Quotas en zijn sommige via een verzoek aanpasbaar.

Voor alles buiten de standaardladder praat je met een mens, en die vraagt om de getallen uit het eerste deel van deze checklist: verwachte requests en tokens per minuut per model, de vorm van het verkeer, de use case en je betaalhistorie. Teams die aankomen met "we hebben meer nodig, het blijft falen" krijgen langzamere antwoorden dan teams die aankomen met "we hebben 1.500 RPM en 10M input-TPM nodig op dit model, piek op werkdagen tussen 09:00 en 11:00 CET, hier is het gebruik van vorige maand."

De doorlooptijd is het onderdeel dat bijt. Reken in weken, niet in dagen, en dien het verzoek nooit in in de launchweek. Moet je capaciteit vastliggen in plaats van best-effort, dan kom je bij gecommitteerde opties: Azure provisioned throughput units, de priority tier van Anthropic, provisioned throughput op Bedrock. Die ruilen geld en een looptijd voor gereserveerde headroom, wat de moeite waard is bij een contractuele SLA en overkill is voor een marketingcampagne.

Een tweede provider of een tweede regio, vooraf aangesloten en getest, is ook capaciteit. Twee accounts op een comfortabele tier verslaan één account op een opgerekte tier, en je failover-pad krijg je er gratis bij.

## Het capaciteitsplan dat je deze week schrijft

Eén pagina. Een middag werk als je logging op orde is.

- Gemeten piek-RPM en p95 tokens per request, uit echt verkeer.
- Fan-out-factor: API-calls per gebruikersactie, geteld in de code, niet geschat.
- Doelfactor (5x, 10x) en de resulterende piek-RPM en TPM, per model.
- Huidige limieten per model per key, en het headroom-percentage op doelniveau. Onder 100% is precies wat je gaat repareren.
- Elke andere workload die op die keys zit, en welke daarvan vóór de launch een eigen key krijgt.
- Waarde van de client-side limiter, op ongeveer 80% van het plafond.
- Retry-beleid: één laag, met jitter, gecapt, met een deadline per request en respect voor `retry-after`.
- De shed-volgorde, opgeschreven en goedgekeurd.
- Alerts op 75% windowverbruik en op 429-ratio, niet alleen op foutpercentage.
- Een loadtest op 1,5x doelniveau, vijftien minuten, tegen een key met een eigen spend cap, met het shedding-pad aan zodat je ziet wat gebruikers krijgen. Combineer dit met [een latency-opsplitsing](/blog/llm-latency-audit-production), want wachtrijen veranderen het getal dat je gebruikers voelen, zelfs als er niets faalt.
- Een kill switch (feature flag) voor elke niet-essentiële modelcall.

De test is het punt dat mensen overslaan, en het is het enige punt dat het plan van een document in een feit verandert.

## Vragen die opkomen in de week voor een launch

**Hoe weet ik welke limiet ik raak, requests of tokens?**
De error body zegt het meestal, de headers altijd. Log de remaining-requests- en remaining-tokens-waarden een week lang bij elke call. Degene die op je piek naar nul kruipt, is je bindende constraint, en de twee hebben verschillende fixes.

**Betekenen 429 errors in OpenAI-productie dat er iets mis is met mijn code?**
Niet per se. Een 429 kan betekenen dat je RPM overschreed, dat je TPM overschreed, dat je een tokens-per-dag-cap raakte op bepaalde tiers, of dat je een insufficient-quota-probleem met je facturatie hebt. Dat laatste is helemaal geen rate limit en geen enkele hoeveelheid backoff lost het op, dus lees het error type voordat je retryt.

**Helpt streaming tegen rate limits?**
Het helpt tegen ervaren latency, niet tegen capaciteit. Outputtokens tellen mee tegen je plafond, of je ze streamt of niet. Streaming maakt wachtrijen wel verdraaglijker, omdat een antwoord dat na een korte wachttijd binnen 900 milliseconden begint te lopen prima aanvoelt.

**Kan ik niet simpelweg mijn concurrency verhogen om meer door te duwen?**
Nee. Concurrency bepaalt hoeveel requests gelijktijdig onderweg zijn, terwijl het plafond van de provider per minuut over het hele window wordt gehandhaafd. Meer concurrency tegen een vast plafond levert alleen meer afwijzingen op bij dezelfde throughput, en daarom hoort de limiter aan jouw kant.

**Is batching een oplossing?**
Deels. Batch-endpoints hebben aparte, doorgaans ruime quota en zijn de juiste plek voor embeddings, nachtelijke samenvattingen en eval-runs. Ze zijn geen optie voor iets waarop een gebruiker wacht.

Capaciteitsplanning, request queuing en shedding, en het quotumgesprek met je provider zijn de betrouwbaarheidscontroles die ik toevoeg tijdens een **Production Hardening**-traject: een blok van drie tot zes weken, naast evals, monitoring en kostenbeheersing. Staat die verkeerspiek al in je agenda en heeft niemand de headroom doorgerekend, dan vind je de scope op de [servicespagina](/services) en is de [contactpagina](/contact) de snelste route naar een datum.
