---
title: "AI Monitoring Productie: Zie Kwaliteitsverlies Voor de Klant Het Doet"
description: "AI monitoring productie voorkomt dat verslechterde antwoorden pas via klachten opvallen. Vijf signalen, drempels en een bouwplan met tooling die je al hebt."
published: "2026-09-24"
tags: ["AI monitoring", "productie", "LLM observability", "AI operations", "dashboards"]
ogImage: "/images/blog/llm-observability-production-monitoring/cover.jpg"
primaryService: "hardening"
---
Je AI-feature staat vijf weken live. Hij is niet omgevallen. Support heeft niets geëscaleerd. Het dashboard dat je openslaat is hetzelfde dashboard als vóór de feature bestond: uptime, error rate, p95 op de HTTP-laag — alles groen. En ergens achter in je hoofd zit de vraag waarmee je deze pagina opende: als de antwoorden vorige dinsdag slechter werden, hoe zou ik dat dan weten?

Dat zou je niet. Dat is het eerlijke antwoord voor de meeste teams een maand na launch. **AI monitoring productie** is het stuk hardening dat iedereen uitstelt omdat er op dit moment niets stuk is, en het is precies het stuk dat bepaalt of de volgende storing door jou wordt gevonden of door een klant wordt gemeld, met je CEO in de cc.

Dit gaat specifiek over de dashboard- en alerting-laag. Niet over evals, niet over logs — die lijnen trek ik straks hard. Vijf signaalfamilies, de drempels die het rechtvaardigen om iemand 's nachts te bellen versus de drempels die in een maandagreview horen, hoe je het bouwt met tooling waar je vrijwel zeker al voor betaalt, en hoe een opgeleverde setup eruitziet — zodat je jezelf kunt beoordelen of het in de scope van een leverancier kunt plakken.

## Het moment: het staat live, het "lijkt goed te gaan", en niemand zou het weten als dat niet zo was

Het patroon herhaalt zich met bijna komische betrouwbaarheid. Launchweek kijkt iedereen mee. Week twee wordt het Slack-kanaal stil. Week vier vraagt iemand "hoe doet die assistent het eigenlijk?" en het antwoord is schouderophalen plus "geen klachten". Week zeven rolt een provider een stille modelupdate uit, of je contentteam herindexeert de kennisbank, of een retry-loop begint te vuren op een malformed tool call, en de kwaliteit zakt met een derde. Elf dagen merkt niemand het.

Elf dagen is geen getal dat ik voor het drama heb verzonnen. Het is ongeveer hoe lang het duurt voordat genoeg gebruikers op een verslechterd pad terechtkomen, concluderen dat de feature matig is, dat tegen elkáár zeggen in plaats van tegen jou, en één van hen uiteindelijk een ticket schrijft. Tegen die tijd is de schade vertrouwen, niet tokens.

Wat AI-features anders maakt dan de rest van je stack is dat ze falen *zonder te erroren*. Een kapot betaalendpoint geeft een 500 en je bestaande alerting ziet dat binnen negentig seconden. Een kapotte RAG-assistent geeft een zelfverzekerd, netjes opgemaakt, grammaticaal perfect fout antwoord met statuscode 200, in 1,4 seconde, voor €0,004. Elk signaal dat je infrastructuurmonitoring bekijkt, zegt dat het systeem gezond is. De algemene versie van dit verhaal schreef ik in [de lijst van wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production); dit stuk gaat over de instrumentatie die diezelfde storingen op dag één had gevonden in plaats van op dag elf.

## Waarom je logs geen monitoring zijn en je eval-suite ook niet

Twee dingen waar teams naar wijzen als ik vraag wát ze monitoren, en geen van beide is monitoring.

![AI Monitoring Productie: Zie Kwaliteitsverlies Voor de Klant Het Doet](/images/blog/llm-observability-production-monitoring/1.jpg)

**Logs zijn geen monitoring.** Bijna iedereen logt requests — prompt in, completion uit, een trace-ID, misschien token counts. Dat is oprecht waardevol en dat moet je houden. Maar een log is forensisch materiaal. Het beantwoordt "wat gebeurde er in dít request", *nadat* je al weet dat je moet kijken. Het is een berg tekst die niemand leest tot er iets in brand staat, en de waarde ervan meet je in hoe snel het een incident oplost dat je al gedetecteerd had. Detectie is een ander vak.

**Evals zijn ook geen monitoring.** Een goede eval-suite — het soort waar ik voor pleit in [de continuous eval loop die niemand draait](/blog/llm-evaluation-production-continuous-eval) — is een poort. Hij draait op een vaste, gecureerde set cases, op een trigger: een promptwijziging, een modelversie omhoog, een aanpassing in de retrieval-config. Hij vertelt je of de *verandering die je gaat shippen* beter of slechter is dan wat er live staat. Hij zegt niets over het verkeer dat zondagnacht om 02:00 binnenkwam op input die niemand in je testset had bedacht.

Monitoring is het derde ding: een kleine set **continue, geaggregeerde** signalen over live verkeer, met drempels eraan, die zichtbaar verslechteren voordat een gebruiker het hoeft te zeggen. Continu, niet getriggerd. Geaggregeerd, niet per request. Met drempels, niet "er af en toe naar kijken".

Het onderscheid is ook commercieel relevant. Teams die in maand één een dedicated LLM-observability-platform kopen, krijgen doorgaans trace viewers — een mooie UI om logs te lezen — en ontdekken zes maanden later dat niemand ook maar één alert heeft geconfigureerd. Je hebt forensics gekocht en het detectie genoemd.

## De vijf signaalfamilies die een dashboard voor AI monitoring productie echt nodig heeft

Vijf families. Geen vijftig metrics. Als je dashboard meer dan ongeveer een dozijn tegels heeft, leest niemand het, en dat is functioneel hetzelfde als er geen hebben.

### 1. Kwaliteitsdrift, via gesamplede judge-scores

Het enige signaal dat direct "is het nog goed" benadert. Sample een vast percentage van de live interacties — 1 tot 5% is genoeg bij de meeste B2B-volumes — en scoor elke sample met een goedkoop judge-model tegen drie of vier rubriek-dimensies die bij jouw feature passen. Voor een support-assistent is dat meestal: gegrond in de opgehaalde context, beantwoordt de gestelde vraag, weigert correct als hij het niet kan weten. Sla de score op en plot de **dagelijkse mediaan en p10**, niet het gemiddelde. Het gemiddelde verbergt een bimodale instorting; de p10 is waar degradatie zich als eerste laat zien.

De valkuil: judge-scores driften uit zichzelf als de versie van het judge-model verandert. Pin je judge-model expliciet en behandel een judge-upgrade als een deploy.

### 2. Kosten per interactie

Niet de maandspend — spend per *afgeronde gebruikersinteractie*, dagelijks geplot. Maandspend is een achterlopend aggregaat dat verkeersgroei en efficiëntieregressies door elkaar husselt. Kosten per interactie isoleert het ding waar je invloed op hebt. Springt dat 40% omhoog van de ene dag op de andere bij vlak verkeer, dan is er iets veranderd: een prompt werd langer, retrieval geeft tien chunks in plaats van vier, of een retry-loop verdubbelt stil je calls. Waar het geld daadwerkelijk heen gaat heb ik uitgesplitst in [wat een productie-LLM-feature in 2026 echt kost](/blog/cost-of-production-llm-2026); de monitoring-versie van dat artikel is deze ene tegel.

### 3. Latency-percentielen — p50, p95, p99, gesplitst per stap

Eén getal is hier waardeloos. AI-features hebben pipelines met meerdere stappen, en de geaggregeerde p95 zegt je niets over welke stap bewoog. Splits minimaal in retrieval, model-call en totaal. Meet time-to-first-token apart van de totale completion-tijd als je streamt, want die twee voelen compleet verschillend voor een gebruiker als ze falen. De methodiek om dit te ontleden staat in [van 'voelt traag' naar een meetbare p95-fix](/blog/llm-latency-audit-production) — monitoring is precies die audit, voor altijd, op een grafiek.

### 4. Failure- en fallback-rate

Elke AI-feature in productie heeft fallbacks: provider-timeouts, rate-limit retries, een secundair model, een dichtgeplamuurd "dat kon ik niet verwerken", een leeg retrieval-resultaat. Tel ze allemaal als rate, per uur. Dit is de familie met de hoogste opbrengst per uur werk op deze lijst, want fallbacks zitten al geïnstrumenteerd in je code — je hebt ze alleen nooit geaggregeerd. Een empty-retrieval-rate die van 2% naar 9% kruipt is een herindexering die halverwege is gestrand, en dat is onzichtbaar in elke andere metric.

### 5. Output-anomalie-rate

Goedkoop, deterministisch, geen model nodig. Tel het aandeel responses dat structurele regels breekt: lengte buiten de verwachte bandbreedte, JSON die faalt op schemavalidatie, een weigeringszin, nul citaties waar je format citaties eist, een taal die niet matcht met de input van de gebruiker. Dit vangt de domme catastrofale fouten — truncatie, ingestorte formattering na een provider-update, het model dat plots in het Engels antwoordt aan Nederlandse gebruikers — binnen minuten en voor vrijwel nul kosten.

## Drempels zetten: wat iemand om 3 uur 's nachts belt versus wat tot maandag wacht

De faalmodus hier is niet dat alerts ontbreken. Het is dat alerts afgaan, na de derde false positive gemute worden, en daarna voor altijd stil falen. Splits je drempels dus in exact twee niveaus en wees onbarmhartig over wat voor het bovenste niveau kwalificeert.

**Nu iemand bellen** — uitsluitend voor snelle, ondubbelzinnige, voor gebruikers zichtbare breuk waar wachten echt geld of vertrouwen kost:

- Failure- of fallback-rate boven ~10%, 15 minuten aangehouden
- Output-anomalie-rate boven ~5% over 15 minuten (schemafouten, truncatie)
- p95 totale latency boven twee keer je afgesproken budget, 10 minuten lang
- Kosten per interactie meer dan 3× de mediaan van de afgelopen 7 dagen, een uur lang — dit is je runaway-loop-struikeldraad en die heeft zichzelf meer dan eens terugbetaald
- Nul geslaagde completions gedurende 5 minuten bij niet-triviaal verkeer

**Wachten tot de weekreview** — traag bewegend, statistisch rommelig, vraagt een mens om interpretatie:

- Judge-score p10 meer dan 15% omlaag week-op-week
- Kosten per interactie meer dan 20% omhoog week-op-week
- p95-latency kruipt tot binnen 20% van het budget
- Empty-retrieval-rate loopt op
- Elke verschuiving in de verdeling van querytopics

Twee regels maken het verschil tussen een alerting-setup die overleeft en één die gemute wordt. Alert altijd op een *rate over een tijdvenster*, nooit op één request. En zet de link naar de runbook in de body van de alert: wat check je eerst, wat is de rollback, wie is de owner. Een alert die zonder volgende actie binnenkomt, leert mensen alerts te negeren.

## Goedkoop bouwen, met tooling die je waarschijnlijk al draait

Je hoeft geen LLM-observability-platform te kopen om alle vijf de families te krijgen. Voordat je één euro aan een nieuwe leverancier uitgeeft: draad versie één aan elkaar met wat je al hebt. Een competente engineer doet dat in drie tot vijf dagen.

Het patroon dat vrijwel overal werkt: emit één gestructureerd event per interactie vanuit je applicatie, stuur het naar wat je al gebruikt voor metrics of analytics, en bereken de vijf families als aggregaties daarbovenop.

json
{
  "ts": "2026-09-24T09:14:02Z",
  "feature": "support-assistant",
  "prompt_version": "v7",
  "model": "<pinned-model-id>",
  "retrieval_chunks": 4,
  "retrieval_empty": false,
  "tokens_in": 3120, "tokens_out": 240,
  "cost_eur": 0.0041,
  "latency_ms": {"retrieval": 180, "model": 1240, "total": 1480},
  "fallback": null,
  "anomaly_flags": [],
  "judge_sampled": true, "judge_score": 0.82
}

Eén event, elke familie eruit af te leiden. En dan:

- **Al op Grafana/Prometheus of Datadog?** Emit dit als metrics met labels en bouw één dashboard. Alerting zit er al in.
- **Warehouse-first shop (BigQuery, Snowflake, Postgres)?** Stream events naar een tabel, schrijf vijf SQL-views, zet Metabase of Grafana erboven, schedule één query als alert.
- **Klein team, geen metrics-stack?** Een Postgres-tabel, een dagelijkse cron die de aggregaten berekent, en een Slack-webhook voor drempeloverschrijdingen. Niet glamoureus. Werkt.

De judge-scoring draait als async job over de gesamplede rijen, níet in het request-pad — zet nooit een judge-call vóór je gebruiker.

Koop het dedicated platform later, wanneer je echt cross-request trace-visualisatie nodig hebt, prompt-playgrounds gekoppeld aan live verkeer, of vijf mensen die tegelijk debuggen. Het eerst kopen betekent betalen voor forensics die je niet gaat configureren, terwijl je nog steeds geen detectie hebt. Combineer de eventstroom met [prompt-versiebeheer](/blog/prompt-versioning-regression-testing) en elke metric wordt te slicen per promptversie — precies waar de root cause meestal zit.

## Hoe een gehardende, opgeleverde monitoring-setup eruitziet

Gebruik dit als zelfbeoordeling, of plak het in de SOW van een leverancier. Een afgeronde setup heeft:

1. Eén gestructureerd event per interactie, met een geversioneerd schema, en promptversie plus model-ID op elke rij
2. Eén dashboard, onder een dozijn tegels, dat alle vijf signaalfamilies dekt en dat een niet-engineer kan lezen
3. Een gesamplede judge-pipeline die async draait, met een gepind judge-model en een gedocumenteerde rubriek
4. Bel-nu-alerts aangesloten op wie daadwerkelijk bereikbaar is, elk met een runbook-link
5. Een weekritueel — vijftien minuten, een benoemde owner, met de driftsignalen op het scherm
6. Een gedocumenteerde baseline: de cijfers waarop de feature draaide in zijn eerste gezonde week, zodat "verslechterd" een referentiepunt heeft
7. Een getest rollback-pad: promptversie gepind, vorige model-ID bekend, één commando

Punt zes is degene die bijna iedereen mist. Zonder vastgelegde gezonde baseline is elke drempel een gok en is elke discussie over of de kwaliteit is gezakt een kwestie van onderbuik. Leg hem vast in de eerste twee weken na launch.

Realistisch is dit drie tot vijf engineeringdagen voor versie één, plus nog een week om drempels te tunen tegen echt verkeer — en daarom past het binnen een hardening-traject in plaats van er één te zijn.

## Waar dit een opdracht wordt

Staat je feature live, is de kwaliteit ongeverifieerd en heb je geen idee hoe je erachter zou komen dat hij gebroken is, dan is dat Production Hardening: drie tot zes weken waarin ik de eval- en monitoringlaag bouw, prompts in versiebeheer zet, latency- en kostencontroles inricht en een gehardende deploy oplever — en daarna het dashboard, de alerts, de runbooks en de baseline overdraag, zodat je team het zelf bezit.

De scope staat op de [dienstenpagina](/services). Wil je doornemen wat jouw feature nu emit en wat hij zou moeten emitten, [neem dan contact op](/contact).
