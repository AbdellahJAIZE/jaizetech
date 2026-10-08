---
title: "AI-feature failover strategie: val niet overal uit door één provider"
description: "Een AI-feature failover strategie met provider-, model- en degraded-mode-lagen voorkomt dat één provider-storing je hele product platlegt."
published: "2026-10-04"
tags: ["AI-feature failover strategie", "LLM betrouwbaarheid", "circuit breaker", "production hardening", "degraded mode"]
ogImage: "/images/blog/llm-provider-outage-failover-strategy/cover.jpg"
primaryService: "hardening"
seoTitle: "AI-feature failover: val niet uit door één provider"
---
Een provider geeft HTTP 503 terug op het chat completions-endpoint. Je client heeft een timeout van 60 seconden en drie retries met een backoff van één seconde, dus elke falende request bezet nu zo'n drie minuten een worker. Je connection pool loopt binnen een minuut vol, en requests die niets met AI te maken hebben lopen erachter in een timeout omdat ze dezelfde pool delen. De provider heeft een gedeeltelijke storing in één regio. Jouw product ligt overal plat. Het verschil tussen die twee zinnen is je **AI-feature failover strategie**, of het ontbreken daarvan.

Die asymmetrie is het punt om even naar te blijven kijken. De provider degradeerde op een percentage van de requests in één regio, jij ging overal naar nul. De oorzaak staat in jouw code, niet in die van hen. De meeste teams ontdekken dit terwijl ze een statuspagina verversen, en dat is het slechtste moment om er iets aan te gaan ontwerpen.

Hieronder de bouwvolgorde die ik aanhoud als ik een live feature hard maak tegen providerfalen: hoe je calls begrenst, waar de tweede provider komt, hoe je over modellen heen routeert zonder je outputcontract te breken, en wat je gebruikers laat zien als elk pad op is. Niets daarvan is exotisch. Alles daarvan moet bestaan vóór het incident, want tijdens het incident schrijf je geen code.

## Een storing is zelden schoon, en dát is het probleem

Een volledige harde outage is de makkelijke variant. Het endpoint weigert connecties, je error rate gaat naar 100%, je alerts gaan af, iedereen weet het. De dure storing is gedeeltelijk en langzaam: verhoogde foutpercentages op een deel van de requests, een time-to-first-token die van 600 ms naar negen seconden kruipt, streams die opengaan en halverwege stilvallen, of 200-responses waarvan de inhoud stilletjes slechter is omdat capaciteitsdruk je ergens stroomopwaarts op een degraded pad heeft gezet.

In dat venster gaan er binnen je eigen stack doorgaans vijf dingen tegelijk mis. Retries versterken de load precies op het moment dat de provider overbelast is. Timeouts die per request zijn gezet in plaats van per gebruikersactie stapelen op tot iets dat niemand heeft begroot. Streaming-responses die stilvallen triggeren de timeout helemaal niet, want er zijn technisch gezien bytes aangekomen. Achtergrondjobs stapelen op in de queue en bestormen de provider zodra die herstelt. En de statuspagina loopt tien tot dertig minuten achter op de werkelijkheid, dus het eerste halfuur weet je echt niet of het probleem bij jou zit.

Als je monitoring binnen twee minuten geen onderscheid kan maken tussen "de provider is traag" en "onze retrieval-stap is traag", ga je de hele storing zitten gokken. Dat onderscheid is een dashboardbeslissing die je vooraf neemt, en het is het eerste waar ik naar kijk als ik [bekijk wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production).

## "We doen gewoon een retry" is geen fallback

Retries lossen precies één failure mode op: een tijdelijke hapering bij een verder gezonde provider. Ze zijn het juiste instrument bij een losse 429 met een `Retry-After`-header. Ze zijn actief schadelijk tijdens een capaciteitsincident, waar elke retry die je verstuurt load is die de provider al niet kan verwerken, en waar je drie pogingen je eigen latency verdrievoudigen voordat je alsnog faalt.

![AI-feature failover strategie: val niet overal uit door één provider](/images/blog/llm-provider-outage-failover-strategy/1.jpg)

Een retry-policy die onder druk standhoudt heeft regels die de meeste implementaties overslaan. Retry alleen op condities die echt herhaalbaar zijn: connectiefouten, 429 met backoff, 500, 503, en de 529 overload-response van Anthropic. Nooit retryen op een 400, een context-length-fout of een afwijzing door een contentfilter, want de tweede poging faalt identiek en je hebt de eerste al betaald. Gebruik exponentiële backoff met volledige jitter, zodat je eigen instances niet in golven gaan synchroniseren. Begrens het totaal op een wall-clock-budget in plaats van op een aantal pogingen: heeft de gebruikersactie 8 seconden, dan past één retry en twee niet. En schrijft de call iets weg (een tool-invocatie, een databasemutatie), stuur dan een idempotency key mee, want het herhalen van een half afgeronde agent-stap is hoe je bovenop een storing ook nog dubbele records krijgt.

Retries zijn de binnenste loop. Failover is de buitenste. Die twee door elkaar halen is precies waarom teams denken dat ze resilience hebben, terwijl ze een langzamere manier hebben gebouwd om een 500 terug te geven.

## Een AI-feature failover strategie heeft drie lagen: provider, model, degraded mode

Zie het als drie onafhankelijke mechanismen, elk met zijn eigen trigger.

**Laag 1: provider-failover.** Dezelfde modelfamilie via een tweede leverancier. GPT-klasse modellen via zowel OpenAI als Azure OpenAI. Claude via de Anthropic API en via Bedrock of Vertex. Dit is de goedkoopste laag om te bouwen en levert het meeste op, omdat het modelgedrag identiek is: je prompts en je evals gaan onaangeroerd mee. Andere control plane, andere regio, andere rate-limit-bucket. Bouw deze eerst.

**Laag 2: model-failover.** Een compleet ander model, van een andere leverancier, voor als de hele familie onbereikbaar is. Hier zit een prijs die je vooraf betaalt: het fallback-model moet ook door je eval-set komen, met zijn eigen promptversie. Tool-calling-schema's, structured-output-gedrag, het volgen van de systeemprompt en refusal-patronen verschillen allemaal per leverancier, dus een fallback die je nooit hebt geëvalueerd is een fallback die om 03:00 kapotte JSON produceert. Houd je je [prompts in versiebeheer met regressietests](/blog/prompt-versioning-regression-testing), dan is dit een overzichtelijke hoeveelheid werk. Doe je dat niet, dan is multi-model failover in productie een risico dat je nog niet hebt gemeten.

**Laag 3: degraded mode.** Wat de feature doet als geen enkel model antwoordt. Geen foutpagina. Een bewust uitgeklede versie van de feature, waar ik op terugkom, want dit is de laag die teams overslaan en gebruikers het sterkst merken.

Het call-pad, uitgekleed:

python
PROVIDERS = [
    ("azure-gpt",      breaker_azure),    # zelfde familie, andere control plane
    ("openai-gpt",     breaker_openai),
    ("bedrock-claude", breaker_bedrock),  # ander model, apart geëvalueerd
]

def complete(req, budget_ms=8000):
    deadline = now_ms() + budget_ms
    for name, breaker in PROVIDERS:
        if not breaker.allows():          # open circuit: overslaan zonder call
            continue
        if now_ms() > deadline - 1500:    # geen tijd meer voor een eerlijke poging
            break
        try:
            return call(name, req, timeout_ms=deadline - now_ms())
        except Retryable as e:
            breaker.record_failure(e)
            continue
        except NonRetryable:
            raise                         # bad request: failover verandert niets
    return degraded(req)                  # laag 3, altijd bereikbaar

De belangrijke eigenschap: `degraded()` is een normale returnwaarde, geen exception handler. Woont je degraded mode in een `catch`-blok, dan is hij fout, want niemand test `catch`-blokken.

## De circuit breaker is wat de versterking stopt

Een circuit breaker om je LLM API-client is een kleine state machine per provider, en hij doet het ene wat retries niet kunnen: stoppen met traffic sturen naar iets dat al faalt.

Closed is normale werking, met falen geteld over een schuivend venster (zeg 20 requests). Ga je over de drempel, grofweg 50% fouten of vijf opeenvolgende timeouts, dan gaat de breaker open. Open betekent dat calls direct terugkomen zonder het netwerk aan te raken, en dat is het hele punt: je workers blijven vrij, je pool blijft gezond, en de rest van je product blijft bedienen. Na een cool-down van 20 tot 60 seconden gaat de breaker half-open en laat precies één probe-request door. Succes sluit hem, falen opent hem opnieuw met een langere cool-down.

Twee details wegen zwaarder dan de drempelwaarden. Houd een aparte breaker per provider én per model, want een regionaal probleem bij Bedrock hoort het circuit op je directe Anthropic-pad niet te openen. En behandel timeouts als fouten, met een goede definitie voor streaming: een time-to-first-token-timeout van ongeveer 3 tot 5 seconden, plus een inter-token stall-timeout, anders houdt een stilgevallen stream een connectie bezet tot de client opgeeft. De meeste pathologische latency die ik tijdens een [latency-audit](/blog/llm-latency-audit-production) tegenkom, komt uit streams die niemand heeft begrensd.

Zet een metric op elke state-transitie en alert op breaker-open. Dat ene signaal vertelt je in seconden wat een statuspagina je in twintig minuten vertelt.

## Degraded mode: geef mensen iets, en zeg hoe het zit

Gebruikers vergeven een uitgeklede feature. Ze vergeven geen spinner die 45 seconden draait en daarna een generieke foutmelding geeft, want die spinner liet ze eerst wachten en loog toen pas.

Hoe een ontworpen degraded mode eruitziet hangt af van de feature, maar de opties zijn concreet. Een RAG-assistent kan terugvallen op het teruggeven van de opgehaalde brontekstpassages met een duidelijke notitie dat de samenvatting niet beschikbaar is: vaak het grootste deel van de waarde, en volledig accuraat. Een classificatie- of extractiepad kan terugvallen op een deterministische regelset en de output markeren voor review. Een agent-workflow kan de taak aannemen, in de queue zetten en het resultaat mailen zodra er weer capaciteit is. Alles met een cachelaag kan het laatste goede antwoord serveren met een zichtbaar tijdstempel. En het ingangspunt zelf kan zacht uitgeschakeld worden: grijs de AI-actie uit, meld "AI-samenvattingen zijn tijdelijk niet beschikbaar wegens een storing bij de provider", en houd de rest van het product volledig bruikbaar.

Een paar regels maken dit werkend. Faal snel, binnen twee of drie seconden, zodat de gebruiker niet gestraft wordt voor de lengte van jouw fallback-keten. Benoem welke capability degraded is in plaats van een generieke fout te tonen. En vervang nooit stilletjes door een zwakker model bij een beslissing die ertoe doet (een medische triage-hint, een prijsadvies, een geschiktheidscheck) zonder dat te labelen, want een ongelabelde kwaliteitsdaling is erger dan een eerlijk "niet beschikbaar".

## Chaos-test het, anders heb je het niet

Failover-code die nooit is afgegaan, werkt niet. Ik heb nog nooit een ongeteste fallback de eerste keer in productie goed zien draaien, en de oorzaken zijn banaal: de fallback-credential was nooit aangemaakt, de regio van het fallback-model mag de data niet verwerken, de breaker-config stond fout in prod, de degraded-template rendert `undefined`.

Bouw een fault-injection-schakelaar in je provider-client, bestuurd via config, die per provider foutpercentages, harde timeouts, stilgevallen streams en kapotte responses kan forceren. Draai daarna vier scenario's met opzet. Primaire provider geeft 100% 503: gaat de breaker binnen één venster open en landt het verkeer bij provider twee? Primaire geeft 50% fouten: flap je heen en weer tussen providers, en schieten je kosten omhoog? Primaire valt stil midden in een stream: vuurt de inter-token-timeout, of blijft de request hangen? Alle providers plat: rendert de degraded mode, en blijft de rest van de app overeind?

Doe het in staging, daarna één keer in productie tijdens je rustigste uur, met het team erbij. Herhaal per kwartaal en na elke upgrade van een provider-SDK. Je [observability-opzet](/blog/llm-observability-production-monitoring) moet dit hele verhaal laten zien zonder dat iemand logs hoeft te tailen.

## Wat het kost om te bouwen, tegenover wat de storing kost

In mijn ervaring is provider-failover plus een circuit breaker een paar dagen gefocust werk voor iemand die het eerder heeft gebouwd, aangenomen dat je LLM-calls al via één clientmodule gaan. Zitten ze verspreid over twaalf plekken, reken dan eerst tijd voor die abstractie. Model-failover kost meer, want het echte werk is het evalueren van het tweede model, niet het aansluiten. Degraded-mode UX vraagt doorgaans om designinput, en dat is het deel dat uitloopt.

De running costs zijn beperkt maar reëel: een tweede provider betekent een tweede set credentials en vaak een tweede egress-pad, het fallback-model kan andere prijzen per token hebben, en failover tijdens een incident kan de dagbesteding boven budget duwen. Dat hoort in je [kostenmodel voor productie-LLM's](/blog/cost-of-production-llm-2026) te staan, niet in een verrassingsfactuur. Zet het naast het alternatief: een volledige productiestoring die je niet kunt verkorten, niet kunt uitleggen, en waarvan je niet kunt beloven dat hij niet terugkomt, omdat er aan jouw kant niets is veranderd.

## Vragen die ik hierover krijg

**Geeft een gateway als LiteLLM, Portkey of OpenRouter me failover gratis?**
Je krijgt provider-abstractie en basale retry- of fallback-routing, wat echt nuttig is en werk scheelt. Je krijgt er geen geteste degraded mode bij, geen evals op het fallback-model, en geen correcte timeout-budgetten voor jouw gebruikersactie. Het wordt ook zelf een afhankelijkheid: host je de gateway zelf, dan staat hij nu in je kritieke pad, en gebruik je de hosted versie, dan heb je een leverancier vóór je leverancier gezet.

**Is één provider met een goede SLA genoeg?**
Een SLA is een creditnota, geen uptime. Servicekortingen helpen de klant niet wiens workflow is vastgelopen. Zit de AI-feature op een omzetpad of een supportpad, bouw dan minstens laag 1, en dat is meestal hetzelfde model via een tweede cloud.

**Hoe voorkom ik dat het fallback-model stilletjes slechter werk aflevert?**
Draai je eval-set bij elke promptwijziging tegen beide modellen, en log bij elke productie-response welke provider en welk model hem heeft geserveerd. Zet daarna een aparte kwaliteitsdrempel voor de fallback en label degraded antwoorden in de UI. Kun je niet herleiden welk model een request heeft beantwoord, dan kun je hier later niets over auditen.

**Moeten achtergrondjobs op dezelfde manier failoveren?**
Meestal niet. Batch- en async-werk mag juist langzaam falen: laat de breaker open staan, houd de queue vast, en hervat bij herstel met een rate limit zodat je de provider niet bestormt op het moment dat hij terugkomt. Agressieve failover houd je voor interactieve requests waar een mens zit te wachten.

## Voor het volgende statuspagina-incident

Provider-failover, model-routing, circuit breakers en een echte degraded-mode UX ontwerpen is deploy-hardening, en het hoort in de Production Hardening-opdracht van drie tot zes weken die ik op live AI-features doe, naast evals, monitoring en latency- en kostenbeheersing. Heeft je AI-feature nu één provider, één model en een spinner, dan is dat het gat, en het is deze maand goedkoper te dichten dan tijdens een storing. Bekijk [wat die opdracht inhoudt](/services) of [laat me zien hoe je call-pad er nu uitziet](/contact).
