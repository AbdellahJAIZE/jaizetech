---
title: "AI-feature SLA: waarom 95% nauwkeurigheid onhoudbaar is"
description: "Een AI-feature SLA met door klant gemeten nauwkeurigheid is een tijdbom. Regel voor regel herschrijven naar iets wat je echt kunt nakomen."
published: "2026-10-24"
tags: ["AI-feature SLA", "service level agreement", "LLM in productie", "contractonderhandeling", "AI engineering"]
ogImage: "/images/blog/ai-feature-sla-clause/cover.jpg"
primaryService: "hardening"
---
De pdf komt binnen met tracked changes, doorgestuurd om 19:40 met "legal heeft gereageerd, verder prima, kun jij naar 7.3 kijken?" Artikel 7.3 is het service level schedule, en iemand aan de inkoopkant heeft daar hun standaard hosting-SLA in geplakt en het woord "Platform" vervangen door "AI Assistent". Er staat nu 99,9% maandelijkse beschikbaarheid, een maximale responstijd van twee seconden, en "een nauwkeurigheid van niet minder dan 95%, zoals gemeten door Klant". Inkoop wil vrijdag een handtekening.

Die doorstuurstap is waar de meeste problemen met een AI-feature SLA beginnen. Niet in de clausule zelf, die is saai en gecopy-pasted, maar in het feit dat de jurist die de vrijwaring kan lezen en de engineer die het latency-dashboard kan lezen er apart naar kijken, nooit in hetzelfde uur. De beloftes die niemand kan meten overleven precies in dat gat.

Hieronder haal ik één clausule regel voor regel uiteen. Het contract is hypothetisch, in elkaar gezet uit de vormen die ik steeds terugzie in enterprise-deals, maar de redenering is wat ik in zo'n call zou zeggen.

## Uptime is de makkelijke helft van een AI-feature SLA

Beschikbaarheid is het enige getal in de clausule dat zich gedraagt als een normale engineering-belofte. Het is gedefinieerd, het is meetbaar met tooling die je waarschijnlijk al hebt, en de rekensom is niet voor interpretatie open: 99,9% per maand laat je 43 minuten downtime, 99,5% ongeveer 3 uur en 40 minuten. Kies het getal dat jouw on-call-werkelijkheid draagt, niet het getal dat indrukwekkend staat naast de marketingpagina van een concurrent.

Het deel dat achteloos ondertekend wordt is de definitie van "beschikbaar". Drie vragen bepalen of je het kunt nakomen. Welk endpoint wordt gemeten, het jouwe of dat van je modelprovider? Telt een HTTP 200 met een weigering, een afgekapt antwoord of een leeg object als beschikbaar? En wie meet, vanaf waar, met welk interval? Als de synthetische monitor van de klant elke 60 seconden vanaf hun eigen netwerk pollt en jij meet bij je load balancer, heb je tijdens het eerste incident twee verschillende uptimecijfers en geen afgesproken tiebreaker.

Dan is er de afhankelijkheidsvraag, die specifiek is voor AI-features en waar generieke hosting-SLA's nooit op zijn gebouwd. Als OpenAI, Anthropic of Azure OpenAI 90 minuten degradeert, valt die tijd in jouw beschikbaarheidsemmer tenzij de clausule iets anders zegt. Er zijn twee eerlijke manieren om dat te regelen: storingen bij externe modelproviders expliciet uitsluiten, of de volledige belofte staande houden en échte failover bouwen vóór de ondertekening. Ik kies het tweede als de deal het werk rechtvaardigt, omdat de uitsluiting in de onderhandeling toch meestal sneuvelt, en omdat [wat de meeste teams failover noemen een retry-loop tegen hetzelfde endpoint is](/blog/llm-provider-outage-failover-strategy). Een retry-loop overleeft geen regionale storing, en een regionale storing is precies wat die 43 minuten opeet.

## De clausule, regel voor regel

Dit is de versie die terugkwam van de juristen van de klant, teruggebracht tot de drie werkzame zinnen:

![AI-feature SLA: waarom 95% nauwkeurigheid onhoudbaar is](/images/blog/ai-feature-sla-clause/1.jpg)
7.3 Service Levels. Leverancier garandeert dat de AI Assistent
(a) 99,9% van elke kalendermaand beschikbaar is;
(b) antwoorden retourneert binnen twee (2) seconden; en
(c) een nauwkeurigheid handhaaft van niet minder dan 95%,
    zoals gemeten door Klant.
Het niet behalen van enig Service Level vormt een wezenlijke
tekortkoming.

Lid (a) is ondertekenbaar na het definitiewerk hierboven, waarschijnlijk op 99,5% in plaats van 99,9%, tenzij je multi-provider failover hebt en iemand die om 03:00 wakker is.

Lid (b) is niet ondertekenbaar zoals het er staat, en de reden is mechanisch, niet onderhandelbaar. "Binnen twee seconden" heeft bij een streaming LLM-respons geen enkelvoudige betekenis: tijd tot eerste token, tijd tot een volledig antwoord en tijd tot een volledig antwoord ná een tool call zijn drie verschillende verdelingen, en die derde is vaak vijf tot tien keer de eerste. Een "maximum" is ook de verkeerde statistiek, want één enkel traag request schendt het al. Wat je wél kunt beloven is een LLM latency SLA uitgedrukt als percentiel over een meetvenster: p95 tijd tot eerste token onder 1,5 seconde en p95 volledige completion onder 8 seconden, server-side gemeten, met uitzondering van requests waar de systemen van de klant zelf de bottleneck zijn. Voordat je een van die getallen opschrijft: meet ze. Ik heb teams een p95 uit een dev-omgeving zien quoten om in week twee te ontdekken dat [de echte bottleneck retrieval was en niet het model](/blog/llm-latency-audit-production), en dat de productie-p95 nergens in de buurt van het contractcijfer kwam.

Lid (c) is het lid waarvoor je alles stilzet. En die slotzin, "het niet behalen van enig Service Level vormt een wezenlijke tekortkoming", maakt van een onmeetbare belofte een uitgang voor de klant.

## Wat "95% nauwkeurigheid" moet worden

Een nauwkeurigheidsgarantie voor een AI-feature die door de klant gemeten wordt, is in de praktijk een garantie dat iemand aan hun kant in maart drie slechte antwoorden doorstuurt en dat een tekortkoming noemt. Dat is geen cynisme over klanten, het is het enige dat de clausule zoals geschreven kan betekenen. Er is geen gedefinieerde taak, geen gedefinieerde testset, geen gedefinieerde beoordelaar en geen gedefinieerde noemer. Niemand kan het berekenen, dus wordt het berekend uit anekdotes.

De herschrijving heeft vijf onderdelen, en alle vijf horen in het contract, niet in een mailtje ernaast:

- **De taak.** Niet "de AI Assistent" maar een benoemde capability met een benoemd inputtype. Extractie van zes specifieke velden uit leveranciersfacturen scoort heel anders dan open vraag-en-antwoord over dezelfde documenten.
- **De testset.** Een bevroren verzameling representatieve gevallen, groot genoeg dat het getal iets betekent (een paar honderd, geen twintig), bij ondertekening door beide partijen vastgesteld, met een vastgelegd proces om later gevallen toe te voegen.
- **De beoordelaar.** Exact match, F1 op veldniveau, een rubric toegepast door een benoemde menselijke reviewer, of een LLM-judge met een gepubliceerde prompt en een gemeten overeenstemming met menselijke labels. Zeg welke.
- **De noemer en het venster.** Per kalendermaand, over de bevroren set plus eventuele gezamenlijk afgesproken toevoegingen, met uitsluiting van input buiten de gedocumenteerde scope.
- **De remedie.** Wat er gebeurt bij een misser, en dat is bijna nooit "wezenlijke tekortkoming" (zie verder).

Die herschrijving doet iets ongemakkelijks: je moet je echte score kennen voordat je ondertekent. De meeste teams weten die op dit punt niet. Ze hebben een demo waar iedereen enthousiast over was en een vaag gevoel dat het "ongeveer goed" zit, en dat is geen getal dat je naast het woord "garandeert" kunt zetten. Als de feature uit documenten ophaalt, is het eerlijke startpunt [retrieval- en faithfulness-metrics met expliciete ship gates](/blog/rag-evaluation-metrics-production), gedraaid vóór de handtekening en niet na de eerste klacht.

## Wat er moet bestaan voordat je dit eerlijk kunt beloven

Elke regel van de herschreven clausule heeft een infrastructuurvoorwaarde. Ontbreekt die voorwaarde, dan doe je geen belofte maar een gok met je eigen balans.

Beschikbaarheid en latency-percentielen vragen tracing per request met token counts, modelversie, retrieval-timings en errorklassen, lang genoeg bewaard om een discussie over vorige maand te beslechten. "Het leek in orde" is geen verweer in een onderhandeling over service credits, en [observability die je achteraf bouwt dekt nooit het incident waarover je ruzie hebt](/blog/llm-observability-production-monitoring).

Het nauwkeurigheidsgetal vraagt een eval-suite die op schema draait en bij elke wijziging, geen notebook dat iemand één keer heeft gerund. [De continuous eval loop is het onderdeel dat vrijwel niemand echt draait](/blog/llm-evaluation-production-continuous-eval), en het is de enige manier waarop je een score ziet zakken van 94% naar 88% voordat de klant het ziet.

Daarnaast heb je prompt- en modelversiebeheer nodig, want als de score beweegt moet je binnen enkele uren "wat is er veranderd" kunnen antwoorden. Zonder [geversioneerde prompts en regressietests](/blog/prompt-versioning-regression-testing) is het eerlijke antwoord "dat weten we niet", en dat antwoord kost je de verlenging, zelfs als de feature zich herstelt.

En je hebt change control op het model zelf nodig. [Providers updaten modellen onder stabiel lijkende aliassen](/blog/silent-model-updates-ai-feature), wat betekent dat je nauwkeurigheidsgetal kan verschuiven zonder één commit aan jouw kant. Pin versies vast, en bedng in het contract het recht om een gelijkwaardig model te substitueren met kennisgeving.

## De credit-clausule, en wat er in een echt incident afgaat

Onderhandelaars verbranden hun energie op het creditpercentage. In de praktijk is de service credit het minst gevaarlijke deel van een service level agreement voor een AI-feature. Een credit van 5% of 10% op de maandfee bij een contract van enkele honderdduizenden is een slechte maand, geen existentiële.

Wat pijn doet is alles wat eraan hangt. "Wezenlijke tekortkoming" bij één gemist service level geeft de klant ontbindingsrecht, vaak met terugbetaling van vooruitbetaalde fees. Clausules over herhaalde missers ("drie opeenvolgende maanden of vier maanden in een rollende twaalf") zijn wat contracten beëindigen, dus onderhandel over de hersteltermijn en die maandendrempel in plaats van over het percentage. En let op een ongelimiteerde vrijwaring elders in het document die stilletjes "fouten in de output van Leverancier" dekt, want die haalt onbeperkte aansprakelijkheid voor nauwkeurigheid terug binnen nadat je die in 7.3 zorgvuldig had afgegrensd.

Nog één ding om op te staan: service credits als enige en uitsluitende remedie bij gemiste service levels, met een geschillenprocedure voor metingen die beide partijen tien werkdagen geeft en jouw telemetrie als referentie-administratie aanwijst. Dat laatste detail doet meer dan het lijkt, want [identieke input levert geen identieke output](/blog/llm-non-determinism-production), en een klant die volgende week een mislukt geval opnieuw draait, reproduceert de fout noch de fix.

## Redlines die je goodwill waard zijn

Als je maar drie wijzigingen door krijgt, neem deze. Vervang de maximale responstijd door percentielen plus een meetmethode. Vervang door-de-klant-gemeten nauwkeurigheid door een bevroren testset, een benoemde beoordelaar en credits als enige remedie. Voeg een afhankelijkheidsuitsluiting of uitsluitingsvenster toe voor incidenten bij externe modelproviders, plus het recht om vastgepinde modelversies te wisselen met kennisgeving.

Daarna komt het ongeglamoureerde deel: de getallen waarmaken. Hardening is wat van de clausule iets maakt dat je kunt verdedigen: evals die continu draaien, tracing waarmee je elk request van vorige maand kunt reconstrueren, failover die een providerstoring overleeft, vastgepinde versies, en acceptatiecriteria die [benoemen wie de feature na livegang bezit](/blog/ai-feature-definition-of-done). Dat is een [Production Hardening-traject](/services) van drie tot zes weken, en de volgorde doet ertoe: het hoort vóór de handtekening, niet na de eerste ingebrekestelling. Ligt er deze week zo'n enterprise-clausule in je inbox, [stuur hem door](/contact) en we lopen samen na wat veilig te ondertekenen is.
