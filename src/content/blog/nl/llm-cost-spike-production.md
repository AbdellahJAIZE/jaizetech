---
title: "LLM kosten productie piek: de 5 oorzaken en de fix"
description: "Een LLM kosten productie piek is zelden groei. Vijf echte oorzaken, de fix per fout en het dashboard dat finance voor blijft."
published: "2026-10-04"
tags: ["LLM kosten", "AI observability", "prompt caching", "LLM routing", "production hardening"]
ogImage: "/images/blog/llm-cost-spike-production/cover.jpg"
primaryService: "hardening"
---
Neem een rekening die in één maand van €3.400 naar €11.900 gaat, terwijl het aantal requests met 18% steeg. Deel die twee door elkaar: de kosten per request gingen van ongeveer €0,0057 naar ongeveer €0,0168, bijna een verdrievoudiging. Die staartdeling zijn de nuttigste twintig seconden die je kwijt bent aan een **LLM kosten productie piek**, omdat ze je direct vertellen dat dit geen groeiverhaal is. Iets in het systeem is meer gaan betalen per eenheid werk, en de verklaring staat in je code, niet in je funnel.

Ik draai deze triage vaak genoeg dat de shortlist nauwelijks verandert. In bijna elk geval is de oorzaak één van vijf dingen, en in ongeveer een derde van de gevallen zijn het er twee die elkaar versterken. Geen van die oorzaken vraagt om slimme analyse. Ze vragen om iemand die naar tokenaantallen per request kijkt in plaats van naar het maandtotaal.

Hieronder de volgorde waarin ik zoek, de fix per oorzaak, en het dashboard dat ik achterlaat zodat finance niet langer je alerting is.

## Waarom een LLM kosten productie piek zelden een groeiverhaal is

Groei is een lineair verhaal. Kosten die lineair meestijgen met traffic zijn saai en meestal in orde. Wat een rekening laat pieken is iets multiplicatiefs: een langere prompt bij elke call, een extra ronde in een loop, een cache die geen reads meer absorbeert, een route die is verschoven naar een model dat per token een paar keer zo duur is.

Haal daarom, voordat je één dashboard opent, twee cijfers op voor deze periode en de vorige: totale spend en totaal aantal billable requests. Zijn de kosten per request vlak gebleven en is het volume verdubbeld, dan heb je een capaciteitsgesprek en moet je eerder lezen [wat een productie-LLM-feature echt kost om te draaien](/blog/cost-of-production-llm-2026) dan incident-triage doen. Zijn de kosten per request bewogen, dan heb je een lek en geldt de rest van dit stuk.

Nog één splitsing die dag één verdient: input- versus outputtokens. Output is bij elke grote provider de dure kant, typisch een paar keer het inputtarief, en reasoning-tokens van extended-thinking modellen worden als output afgerekend terwijl je gebruiker ze nooit ziet. Een piek die vrijwel volledig uit outputtokens bestaat wijst naar een heel andere plek dan een piek die vrijwel volledig input is.

Vijf oorzaken, ruwweg in de volgorde waarin ik ze aantref: ongelimiteerde context, ongecapte retry- en agent-loops, een default route naar het duurste model, een prompt cache die stil is gestopt met hitten, en traffic die niemand als traffic meerekende. Alles wat ik daarbuiten heb gezien (een input-pad vol afbeeldingen, een provider die herprijst, een batch-backfill die nog loopt) is een variant van één van deze vijf. Die lijst is kort omdat tokenspend maar drie knoppen heeft: hoeveel tokens erin gaan, hoeveel eruit komen, en hoe vaak je ervoor betaalt. Elke echte oorzaak is een knop die is verschoven, en zo geformuleerd wordt triage mechanisch in plaats van speculatief.

## Fout één: context laten groeien tot de rekening hem meet

De klassieke vorm is een chat- of agent-loop die bij elke ronde het volledige gesprek opnieuw verstuurt. Ronde één stuurt 2k tokens, ronde vijftien stuurt 30k, en het totaal aan afgerekende tokens over een gesprek groeit met het kwadraat van het aantal rondes, niet lineair.

![LLM kosten productie piek: de 5 oorzaken en de fix](/images/blog/llm-cost-spike-production/1.jpg)

Een productwijziging die de gemiddelde sessielengte van vier naar twaalf rondes duwt verhoogt je context window cost dus niet met een factor 3. Eerder met een factor die richting 9 gaat, terwijl je requestcount nauwelijks beweegt. Precies daarom pakt de metriek kosten-per-request dit op en het maandtotaal niet.

RAG-systemen hebben hun eigen variant. Iemand heeft `top_k` van 5 naar 12 gezet om een recall-klacht op te lossen, de chunk size was al royaal, en nu sleept elke query vier keer zoveel opgehaalde tekst mee. De verbetering in retrievalkwaliteit was echt. Niemand heeft hem geprijsd.

Wat je vandaag kunt nakijken:

- p50, p95 en max inputtokens per request van deze week tegenover vier weken terug. Beweegt p95 harder dan p50, dan trekt een deel van je traffic het gemiddelde omhoog.
- Het langste levende gesprek in je systeem. Niet het gemiddelde, de ergste. Ik heb losse sessies boven 200k inputtokens zien uitkomen omdat de historie nooit werd afgekapt en de contextlimiet van het model de enige cap in het systeem was.
- Elk promptveld dat een heel document, een hele tabeldump of een heel vorig antwoord interpoleert.

De fixes, goedkoopste eerst. Cap je historie expliciet: laatste N rondes plus een rollende samenvatting, met N gekozen op evalscore en niet op gevoel. Trim opgehaalde context met een reranker zodat je vijf sterke chunks doorgeeft in plaats van twaalf middelmatige, wat de antwoordkwaliteit meestal ook nog verbetert. Zet een harde tokenbudget-check in de client vóór de call, en log of weiger alles daarboven in plaats van het stil af te rekenen. En stop met het meesturen van de volledige tool-schemaset bij elke call als de route maar drie tools mag gebruiken.

## Fout twee: retries en agent-loops die niemand heeft gecapt

Retries zijn de snelste manier om een rekening te vermenigvuldigen, want een retry is een volledige, opnieuw geprijsde call. Een SDK-default van drie pogingen met backoff betekent dat een provider-degradatie die je timeout-rate van 0,5% naar 20% duwt je spend meeneemt, terwijl het symptoom dat gebruikers voelen latency is en niet kosten. Zit je in dezelfde periode [achter een latencyregressie aan](/blog/llm-latency-audit-production), check dan of je retry-rate beide in één keer verklaart.

Agent-loops zijn erger, omdat ze bedoeld zijn. Een ReAct-achtige agent zonder iteratieplafond doet vrolijk vijftig tool-calls om vast te stellen dat hij het antwoord niet weet. Elke call sleept het volledige opgebouwde scratchpad mee, dus je hebt het contextprobleem en het loopprobleem tegelijk.

Los het op met limieten die in code bestaan in plaats van in intentie. Een `max_iterations` op elke agent-graph, met een gelogde terminal state als die afgaat, zodat je ziet hoe vaak agents tegen het plafond lopen. Retries alleen op echt retryable errors: nooit op een 400, en behandel een refusal van het contentfilter als resultaat, niet als storing. Een tokenbudget per request dat de loop afbreekt bij overschrijding. En een circuit breaker, want tijdens een provider-incident is het juiste gedrag de feature degraderen, niet zes keer hetzelfde antwoord kopen.

## Fout drie: standaard alles naar het grootste model sturen

Default routes worden gezet tijdens de demo, als je de best mogelijke output wil en het volume nul is. Daarna komt het volume en kijkt niemand er nog naar. Het verschil tussen een frontier-model en een klein model is per token vaak een ordegrootte, waardoor routekeuze meestal de grootste hefboom in LLM cost optimization is, groter dan al het promptwerk dat je gaat doen.

Waar teams de fout in gaan: overal naar het goedkope model zwaaien en een kwaliteitsregressie accepteren die ze niet kunnen meten. Doe het omgekeerd. Splits je traffic naar taak, wat je met je requestlogs in een middag kunt: classificatie en extractie, korte gestructureerde responses, lange reasoning, tekst die de gebruiker leest. Verplaats dan één segment per keer naar een kleiner model en draai je evalsuite ervoor en erna. Heb je geen evalsuite, dan is dát de echte bevinding, en het is hetzelfde gat dat [elk ander productieprobleem moeilijk diagnoseerbaar maakt](/blog/what-breaks-in-ai-production).

Eén eerlijke nuance over goedkope modellen: een kleiner model dat twee passes of een langere prompt nodig heeft voor hetzelfde resultaat is niet goedkoper. Meet kosten per geslaagde taak, niet kosten per token.

## Fout vier: caching die stil is gestopt met werken

Prompt caching is de enige optimalisatie in deze lijst die kan breken zonder dat iemand de cachingcode aanraakt. Het cachebare deel van een request is de prefix, dus de cache werkt alleen als het begin van je prompt byte-identiek is over calls heen. Zet een timestamp, een gebruikersnaam, een session id of een opnieuw geshuffelde set few-shot voorbeelden bovenin je system prompt, en elke request wordt een cache miss. Erger nog: bij providers die een premium rekenen voor cache writes betaal je dan meer dan zonder caching.

Het andere stille falen is TTL. De prompt cache van Anthropic verloopt standaard vijf minuten na laatste gebruik, met een optie van een uur. Een trafficpatroon van één request per acht minuten per tenant levert een hit rate van vrijwel nul op, terwijl je applicatiemetrieken er volledig gezond uitzien.

Wat je verifieert: de cache read- en cache write-tokens per request van je provider, als ratio. Zijn de cache reads op een specifieke dag van een klif gevallen, diff dan je prompttemplates rond die datum. Check daarnaast of er überhaupt nog semantische of exact-match response caching vóór het model hangt, want een gewijzigd Redis eviction policy of een verlopen cachecluster gooit geen enkele applicatie-error. Het verdrievoudigt alleen je AI API cost.

## Fout vijf: alleen de traffic tellen waar een gebruiker aan hangt

De laatste is geen bug maar een blinde vlek. Je kostendashboard meet gebruikersrequests. Je rekening meet alle requests. Het verschil bestaat uit evalsuites die op elke CI-commit draaien, nachtelijke reindex-jobs die een embedding- of samenvattingsmodel over de volledige corpus halen, een backfill die iemand op donderdag startte en vergat, een stagingomgeving die naar de productie-API-key wijst, en in een paar gevallen misbruik: een endpoint zonder authenticatie dat als gratis LLM-proxy wordt gebruikt.

Aparte API-keys per omgeving en per jobtype, vandaag nog. Het kost een uur en het verandert "we hebben geen idee waar het geld heen ging" voorgoed in een leesbare uitsplitsing. Rate limit elk endpoint dat een model bereikt, ook de interne. En geef elke achtergrondjob een spend-plafond, want een reindex van €40 is prima en dezelfde reindex die negen uur op één misvormd document blijft loopen niet.

## Het dashboard dat de volgende piek ziet vóór finance

Als het lek gedicht is, is instrumentatie het werk dat een herhaling echt voorkomt. De billingconsole van je provider is daarvoor het verkeerde gereedschap: die aggregeert, loopt uren tot een dag achter, en kan je niet vertellen welke feature het geld heeft uitgegeven. Wat je wil is kostenattributie op requestniveau, uitgestuurd door je eigen code.

De velden die ik bij elke modelcall log:

- modelnaam en versie, prompttemplate-id en versie, route- of featurenaam, tenant id
- inputtokens, outputtokens, cache read-tokens, cache write-tokens
- berekende kosten, afgeleid uit een prijstabel die je zelf in config beheert en niet hardcoded
- retry-pogingnummer, aantal agent-iteraties, terminal reason
- omgeving en jobtype

Daaruit rollen de vier grafieken die het waard zijn om op een muur te hangen: kosten per request over tijd, tokenverbruik gesplitst in input en output, cache hit ratio, en spend per feature. Zet je alerts daarna op ratio's in plaats van op totalen. Dagspend boven 1,5x de mediaan van de afgelopen zeven dagen, p95 inputtokens boven je begrote plafond, cache hit ratio onder zijn vloer, agent-iteratieplafond geraakt bij meer dan een klein percentage van de calls. Budget-alerts bij de provider zijn een vangnet, geen detector, want op het moment dat een maanddrempel afgaat is het geld al weg. Dit is dezelfde leiding die kwaliteitsregressies zichtbaar maakt, en daarom behandel ik [kosten en observability als één stuk werk](/blog/llm-observability-production-monitoring) in plaats van twee projecten.

Realistisch: het lek vinden kost een dag of twee als de logs bestaan en een week als ze er niet zijn. Loops cappen en cachekeys fixen is een paar dagen. Traffic herrouteren per taak met evals erachter is het langzame deel, twee tot drie weken, omdat die evalsuite meestal eerst gebouwd moet worden.

## Vragen die ik tijdens deze triage krijg

**Ik heb alleen billing op providerniveau. Kan ik de oorzaak dan toch vinden?**
Deels. De input/output-split en vaak ook de uitsplitsing per model haal je uit de provider, en dat brengt je terug naar twee of drie kandidaten. Wat je niet krijgt is attributie per feature, dus de eerste fix is doorgaans API-keys splitsen per omgeving en job, en daarna logging op requestniveau toevoegen. Reken erop dat je eerst instrumenteert en daarna pas volledig kunt verklaren.

**Is overstappen op een goedkoper model de snelste fix?**
Het is de grootste hefboom, maar zelden de snelste veilige, want je hebt evals nodig om te weten wat je hebt weggegeven. Is de rekening urgent, cap dan eerst loops en trim context. Dat zijn begrensde wijzigingen met voorspelbare kwaliteitsimpact. Routing doe je daarna goed, over de weken erna.

**Verlaagt prompt caching de kosten of alleen de latency?**
Beide, mits de prefix echt stabiel is en hergebruikt wordt binnen de TTL. Cache reads kosten een fractie van het normale inputtarief, terwijl cache writes bij sommige providers duurder zijn dan een ongecachte call. Een prompt die één keer per uur wordt gebruikt met een TTL van vijf minuten maakt de rekening dus slechter. Check je hit ratio voordat je aanneemt dat het helpt.

**Hoe voorkom ik dat dit na de fix opnieuw gebeurt?**
Behandel kosten als een geteste eigenschap. Zet een tokenbudget-assertie in je evalsuite zodat een promptwijziging die de context verdubbelt je CI laat falen, log kosten per request, en alert op kosten per request in plaats van op het maandtotaal.

Als je rekening al gepiekt is en de logs ontbreken om het te verklaren, dan is dat precies het kosten- en monitoringwerk in een **Production Hardening**-traject: drie tot zes weken om het lek te vinden, de loops te cappen, caching en routing te repareren, en je achter te laten met evals, kostenattributie op requestniveau en alerts die afgaan vóór finance dat doet. De scope staat op de [servicespagina](/services), en als je vrijdag een antwoord nodig hebt, [stuur me de vorm van het probleem](/contact) en ik vertel je wat ik als eerste zou checken.
