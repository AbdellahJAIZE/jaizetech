---
title: "AI-feature acceptatiecriteria: waarom een demo niet genoeg is"
description: "Zonder AI-feature acceptatiecriteria tekent u blind af bij een overdracht. Dit zijn de vijf harde eisen en artefacten die u zelf moet controleren."
published: "2026-09-26"
tags: ["AI-feature acceptatiecriteria", "AI-oplevering", "software-acceptatietest", "AI-projectmanagement", "eval suite"]
ogImage: "/images/blog/ai-feature-definition-of-done/cover.jpg"
primaryService: "ai-features"
---
Een extern team heeft je net verteld dat de AI-feature klaar is. Er staat een overdrachtscall in de agenda, er hangt een eindfactuur aan, en er komt een demo die vrijwel zeker vlekkeloos gaat. Je hebt misschien twee dagen om te beslissen of je aftekent. En niemand — zij niet, jij niet — heeft ooit opgeschreven wat de **AI-feature acceptatiecriteria** voor deze build eigenlijk zijn.

Dat gat is het duurste dat ik in AI-oplevering zie. Niet slechte engineers. Niet het verkeerde model. Gewoon een project waarin het scopedocument beschreef *wat er gebouwd moest worden* en niets zei over *hoe je zou weten dat het af was*.

Dus hier is de acceptatiechecklist die ik afloop als een founder of CTO me vraagt mee te kijken bij een overdracht. Vijf productiefeiten die waar moeten zijn, een set artefacten die fysiek in jóuw accounts moet staan, een doorloop van één middag die je zelf kunt doen, en een eerlijke sectie over wanneer het inhouden van de eindfactuur terecht is en wanneer je er de lastige klant van wordt.

## Het moment: ze zeggen dat het klaar is en je weet niet wat je moet checken

Je bent niet paranoïde. Je wordt gevraagd een oplevering die je niet kunt inspecteren om te zetten in een release waar jij verantwoordelijk voor bent. De demo bewijst dat het happy path werkt op de machine van de bouwer, met de bouwer aan het stuur. Dat was in week drie ook al zo.

Wat je echt moet weten voordat je aftekent: werkt dit nog op dinsdagochtend met 200 echte gebruikers, kost het wat je begroot hebt, en kan jouw team het repareren als het om 22:00 breekt zonder de mensen te bellen die net zijn uitgecheckt. Dat zijn drie verschillende vragen en de overdrachtscall beantwoordt er geen enkele van.

Het ongemakkelijke deel is dat de meeste externe teams niets verbergen. Ze geloven echt dat het klaar is, want hun interne definition of done is "de acceptatiecriteria in het ticket zijn groen". Voor traditionele software is dat vaak genoeg. Voor een AI-feature is het bij lange na niet genoeg, want AI-features falen probabilistisch — ze degraderen in plaats van breken, en degradatie laat geen ticket falen.

## Waarom een werkende demo geen AI-feature acceptatiecriteria zijn

Een demo is een gecureerde steekproef van grootte één. Elke AI-feature die ik heb opgeleverd heeft een verdeling van outputs, en de demo toont je de modus. Hij zegt niets over de staart, en in de staart wonen je supporttickets, je compliance-risico en je cloudrekening.

![AI-feature acceptatiecriteria: waarom een demo niet genoeg is](/images/blog/ai-feature-definition-of-done/1.jpg)

Concreet: dit is waar een vlekkeloze overdrachtsdemo volledig mee te verenigen is. Een retrieval-stap die rommel teruggeeft bij elke vraag in het Nederlands in plaats van het Engels, omdat niemand cross-linguale queries heeft getest. Een p95-latency van elf seconden terwijl de demo op 1,8 zat omdat de cache warm was. Een prompt die veertig minuten voor de call is aangepast, tegen niets getest, omdat het model één voorbeeld begon te weigeren. Tokenverbruik dat uitkomt op €4 per gebruiker per maand bij pilotvolume en €38 bij echt volume, door een retry-loop die niemand heeft gemeten.

Niets daarvan is zichtbaar in een demo. Alles daarvan is zichtbaar in twintig minuten als je weet waar je om moet vragen. En niets daarvan is oneerlijkheid — het is het voorspelbare resultaat van een opdracht waarin [de build over zeven lagen is gescoped maar acceptatie er nooit één van was](/blog/full-ai-feature-build-scope-cost).

De herkadering die helpt: stop met vragen "werkt het?" en begin met vragen "welk bewijs bestaat er dat het blíjft werken?". Dat zijn verschillende opleveringen. De tweede is waar je voor betaalt en de meest waarschijnlijke om te missen.

## De vijf productiefeiten die waar moeten zijn

Alles op deze lijst is binair. Of het artefact bestaat en je kunt het zelf openen, of het item is een fail. "Dat staat op de planning" is een fail. "Dat zou je in de logs zien" is een fail.

**1. Er is een eval suite, hij draait op commando, en er is een vastgelegde ondergrens.** Geen notebook met twaalf voorbeelden. Een geversioneerde testset — in mijn ervaring is 60 tot 200 cases het punt waarop dit nuttig wordt voor één feature — die de echte queryverdeling dekt, inclusief de lelijke input. Hij moet een getal produceren, dat getal moet een afgesproken vloer hebben, en jij moet hem zelf kunnen draaien met één commando. Vraag wat de huidige score is en wat de vloer is. Als die vloer deze week is bedacht en net onder de huidige score ligt, weet je nu iets. Specifiek voor RAG: [retrievalkwaliteit en faithfulness hebben aparte scores nodig](/blog/rag-evaluation-metrics-production); één samengesteld cijfer verbergt welke helft stuk is.

**2. Monitoring staat live, en het zijn niet alleen logs.** Logs vertellen je wat er is gebeurd nadat je al weet dat er iets mis is. Je wilt traces per request met tokenaantallen, latency uitgesplitst per stap, kosten toewijsbaar per feature, en een alert die een mens bereikt. Open het dashboard tijdens de call en kijk naar het echte verkeer van gisteren. Als het antwoord "het staat allemaal in CloudWatch" is, heb je logs, geen [observability — en "het lijkt goed te gaan" is precies hoe dat faalt](/blog/llm-observability-production-monitoring).

**3. Een latency- en kostenbudget dat gemeten is, niet geschat.** Twee getallen, opgeschreven: p95-latency onder verwachte concurrency, en kosten per eenheid werk — per gesprek, per document, per gebruiker per maand. Gemeten onder load, niet uit één sequentiële run op een rustige middag. Vraag daarna wat er gebeurt bij 10x volume. Een team dat gemeten heeft antwoordt in dertig seconden met een specifieke bottleneck. Een team dat dat niet heeft gedaan praat in algemeenheden over scaling.

**4. Een security-pass met benoemde findings.** Minimaal: prompt injection getest tegen de tool-calling- en retrieval-paden, tenant-isolatie geverifieerd zodat gebruiker A de documenten van gebruiker B niet kan ophalen, secrets uit de repo en in een manager, PII-verwerking gedocumenteerd, rate limits per gebruiker in plaats van globaal. Ik wil een lijst zien met findings en oplossingen, inclusief de dingen die ze bewust niet hebben gefixt en waarom. Een lege securitysectie betekent dat niemand gekeken heeft.

**5. Een rollbackpad dat iemand daadwerkelijk heeft uitgevoerd.** Niet "we kunnen de vorige container terugzetten". Uitgevoerd, in staging, met een timestamp. En voor AI-features heeft het twee dimensies: code terugdraaien, en prompts en modelversies terugdraaien. Als prompts in de codebase leven en meedeployen, zeg dat dan expliciet; leven ze in een aparte store, dan wil je versiehistorie en een gedocumenteerde revert. [Stille promptregressies](/blog/prompt-versioning-regression-testing) zijn de meest voorkomende storing waarvoor ik ná een overdracht word gebeld, en ze zijn niet te detecteren zonder de eval suite uit punt één.

## De overdrachtsartefacten die je echt moet krijgen

Feiten bewijzen dat het systeem werkt. Artefacten bewijzen dat jouw team het kan bezitten. Check deze tegen je eigen accounts, niet tegen een gedeelde drive die de leverancier beheert.

- **Toegang, op jouw naam.** Cloudaccounts, model provider keys, vector database, monitoring, CI, DNS, de repo. Jij bent de eigenaar; zij zijn collaborators die je kunt verwijderen. Doe de verwijdertest in gedachten: als je morgen al hun toegang intrekt, stopt er dan iets met werken?
- **Een runbook, één pagina, saai.** De vijf waarschijnlijkste storingen en de eerste actie per storing: modelprovider down, latency-piek, gedaalde evalscore, kostenpiek, slechte output gemeld door een klant. Met het echte commando of de dashboardlink, niet met een omschrijving.
- **Een architectuurnotitie met de beslissingen én de afgewezen alternatieven.** Waarom deze retrievalstrategie, waarom dit model, waarom deze chunking. Drie pagina's is beter dan dertig. Over zes maanden is de redenering meer waard dan het diagram.
- **De evalset als artefact in de repo**, met instructies om hem te draaien en cases toe te voegen. Dit is het bezit dat blijft renderen.
- **Een opgenomen walkthrough van 45 tot 90 minuten** door de code en het deploypad, live gedaan met jouw engineer die vragen stelt. Opgenomen, want degene die het in maart terugkijkt zit er vandaag niet bij.
- **Een lijst met bekende beperkingen.** Elke eerlijke AI-build heeft er één. Het ontbreken ervan zegt iets over het team, niet over de build.

## Een uitgewerkte acceptatiedoorloop die je in een middag draait

Reken op drie uur, zet de bouwer op een call, en doe het in deze volgorde.
0:00  Draai de eval suite zelf, uit een verse clone, op jouw machine.
      Pass = hij draait en haalt de afgesproken vloer.
      Dat hij niet draait, is zelf al een finding.
0:30  Load test. 20 gelijktijdige gebruikers, 5 minuten. Lees p50, p95, p99
      en de kostenmeter vóór en na. Vergelijk met het gestelde budget.
1:00  Breek het live: trek de modelkey in, stuur een document van 300 pagina's,
      stuur lege input, stuur een prompt-injection-string, stuur Nederlands.
      Je checkt wat de *gebruiker* ziet, niet of het netjes gaat.
1:30  Log in als tenant A, probeer data van tenant B op te halen. Check daarna
      of die poging zichtbaar is in het monitoringdashboard.
2:00  Voer de rollback uit in staging, met de klok erop, terwijl zij toekijken
      en jij stuurt.
2:30  Toegangsaudit: trek één leveranciersaccount in en bevestig dat niets breekt.
      Open het runbook en volg één entry van begin tot eind.

De load test is degene die mensen overslaan en degene die de middag terugbetaalt. Twintig gelijktijdige gebruikers is geen echte load test, maar het is genoeg om een ongebonden retry, een ontbrekende connection pool of een rate limit die je op launchdag raakt bloot te leggen. Wil je dieper op de cijfers die je terugkrijgt: [de latency-bottleneck zit bijna nooit waar het team denkt](/blog/llm-latency-audit-production).

Alles wat faalt schrijf je op als één regel: de check, het waargenomen gedrag, het verwachte gedrag. Geen oordeel. Een lijst van acht feitelijke regels landt heel anders dan "ik voel me hier niet comfortabel bij".

## Waarvoor je betaling inhoudt, en wat een eerlijke herstelclausule is

Wees eerlijk over ernst, want de eindfactuur als hamer gebruiken voor cosmetische punten is hoe je een goed team verliest dat je volgend jaar weer wilt.

**Inhouden bij:** geen eval suite met een drempel, geen rollback die is uitgevoerd, een openstaande finding rond tenant-isolatie of secrets, geen toegang overgedragen naar jouw accounts, of gemeten kosten die materieel boven het afgesproken budget uitkomen zonder plan. Dit is geen finishing touch. Dit is het verschil tussen een feature die je bezit en een afhankelijkheid die je huurt van mensen die zijn vertrokken.

**Herstelclausule in plaats daarvan:** documentatie die dunner is dan je wilde, een dashboard dat een panel mist, evaldekking op 60 cases waar je 120 wilde, een p95 die 20% over target zit terwijl de bottleneck is geïdentificeerd en de fix gescoped. Spreek een window van twee weken af, houd daar 10–15% tegen aan, en betaal de rest uit. Iedereen blijft professioneel en het werk wordt afgemaakt.

De structurele fix is natuurlijk om deze checklist in de opdrachtomschrijving te zetten vóórdat er iemand begint te bouwen, wat ook [is hoe je bij de inkoop een echte leverancier van een zelfverzekerde onderscheidt](/blog/vet-ai-vendor-before-you-sign). Acceptatiecriteria die aan het eind worden geschreven zijn een onderhandeling. Aan het begin geschreven zijn ze gewoon het plan.

## Waar dit een opdracht wordt

Kijk je naar een overdracht die je niet kunt verifiëren, of sta je op het punt een build uit te zetten en wil je acceptatiecriteria in het contract vóór de eerste sprint, dan is dat de vorm van een [Full Build](/services): zes tot twaalf weken waarin een senior engineer de AI-feature en het product eromheen end-to-end bouwt en eigenaar is — inclusief de evals, monitoring, het kostenbudget, het rollbackpad en de overdrachtsartefacten van deze lijst, niet als bijzaak maar als definitie van af.

Ik schuif ook aan bij overdrachten van anderen als tweede paar ogen, en dat is een veel goedkopere middag dan een verkeerde sign-off. Hoe dan ook: [vertel me waar de build staat](/contact) en we worden concreet over wat er mist.
