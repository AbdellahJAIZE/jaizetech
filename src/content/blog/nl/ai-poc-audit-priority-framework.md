---
title: "AI POC prioriteiten: welke fixes eerst na een audit"
description: "Twaalf audit-bevindingen, drie weken, één engineer. Zo bepaal je AI POC prioriteiten met vier assen in plaats van severity-labels."
published: "2026-09-22"
tags: ["AI POC", "prioriteiten", "productie AI", "RAG", "risicomanagement"]
ogImage: "/images/blog/ai-poc-audit-priority-framework/cover.jpg"
primaryService: "ai-audit"
---
De audit is binnen. Twaalf bevindingen, netjes gekleurd, allemaal verdedigbaar. In diezelfde week is de board-demo ingepland, en je hebt één engineer en ongeveer drie weken echte capaciteit tot dat moment. Wat het rapport je niet geeft, is een volgorde: **AI POC prioriteiten** die de botsing met die agenda overleven. De meeste rapporten stoppen bij "dit is er mis", en het sequencen laten ze als oefening aan de lezer.

Dat sequencen is het eigenlijke werk. Ik heb teams met een accurate punchlist iets slechters zien opleveren dan teams met een slordigere lijst, puur omdat ze van boven naar beneden door een lijst werkten die gesorteerd was op severity-label in plaats van op gevolg.

Dit is het kader dat ik gebruik om een punchlist in een volgorde om te zetten: vier assen, een tie-break-regel, een uitgewerkt voorbeeld met een realistische twaalf-item-lijst, en het punt waarop je stopt met fixen en achter monitoring live gaat. Je kunt het zelf in negentig minuten op een whiteboard draaien.

## Het moment: twaalf items, drie weken, en geen volgorde

De lijst ziet er altijd ruwweg zo uit. Een auth-gat waarbij de RAG-assistent documenten ophaalt die de vragende gebruiker niet mag zien. Een p95-latency van 9 seconden met een lelijke staart. Een kostenlek — iemand her-embedt het hele corpus bij elke deploy. Geen prompt-versiebeheer, dus de "kleine tweak" van donderdag heeft stilletjes het weigergedrag veranderd. Geen eval-set. Logs die het antwoord vastleggen maar niet de opgehaalde context. Eén hardcoded API-key. Geen rate limiting. Chunking die tabellen doormidden knipt. Geen retry of fallback als de provider 429't. PII die naar een Amerikaans endpoint gaat zonder verwerkersovereenkomst. En een UI zonder bronvermeldingen, dus gebruikers kunnen niets controleren.

Elk van die twaalf is echt. De algemene vorm ervan beschreef ik in [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production), en een goed rapport — het soort dat ik uiteenzet in [wat een echt POC-auditrapport bevat](/blog/ai-poc-audit-report-checklist) — noemt alle twaalf met bewijs erbij.

Twaalf items, één engineer, vijftien werkdagen. Zelfs bij een royale twee dagen per item sluit je er zes. De enige vraag die telt is dus: welke zes?

## Waarom "alles fixen vóór de demo" je runway stilletjes opbrandt

De reflex is om de punchlist als definition of done te behandelen en erdoorheen te malen. Die reflex kost je de runway twee keer. Eerst besteed je drie weken en sta je bij de demo met elf half-gefixte dingen en geen verhaal. En erger: je verbrandt de geloofwaardigheid die je nodig hebt voor het *volgende* budgetgesprek, want "we hebben veel technical debt opgelost" is geen zin waar een board geld voor vrijmaakt.

![AI POC prioriteiten: welke fixes eerst na een audit](/images/blog/ai-poc-audit-priority-framework/1.jpg)

Er speelt ook een stapeleffect. Verschillende items op een typische punchlist zijn niet onafhankelijk. Chunking fixen zonder eval-set betekent dat je niet kunt zien of je retrieval verbeterde of de fouten alleen verplaatste. Prompts tunen zonder versiebeheer betekent dat de verbetering onreproduceerbaar is zodra iemand anders het bestand aanraakt. Je doet het werk twee keer. Ik heb een team negen dagen aan chunking-strategie zien besteden, het uitrollen, en daarna uit gebruikersklachten ontdekken dat de faithfulness was gezakt — omdat er vooraf noch achteraf iets gemeten werd. Negen dagen, negatieve waarde, en het voelde de hele tijd als vooruitgang.

De punchlist is dus geen to-dolijst. Het is input voor een volgordebeslissing, en die volgorde bepaal je op vier assen.

## De vier assen achter je AI POC prioriteiten

Scoor elk item op deze vier. Gebruik kleine gehele getallen — 1 tot 3 is ruim genoeg resolutie — en doe het hardop met de engineer die het werk gaat doen, want alleen diens schatting telt.

### 1. Blast radius: wie raakt het, hoeveel, en kun je het terugdraaien?

Niet "hoe erg is de bug" maar "wat raakt de ergste uiting van deze bug, en is dat omkeerbaar?" Eén fout antwoord aan één interne gebruiker is omkeerbaar. Een cross-tenant datalek niet — zodra klant A het contract van klant B heeft gezien, is er geen rollback, er is een meldplicht. Een kostenlek is duur maar perfect omkeerbaar: je merkt het, je fixt het, je slikt de rekening.

Zet onomkeerbaar-en-breed boven omkeerbaar-en-ernstig. Security, datalekkage en alles wat een juridische verplichting creëert staan bovenaan deze as, ongeacht waarschijnlijkheid — want waarschijnlijkheid schat je slecht in en gevolg kun je beredeneren.

### 2. Kosten om te fixen: engineer-dagen, inclusief review en deploy

Schat in dagen, door degene die het doet, inclusief code review, deploy en de halve dag verificatie die niemand begroot. Wees eerlijk over de items waar de echte kost een besluit is en geen code — "PII-verwerking naar een EU-regio verhuizen" is twee dagen werk achter een gesprek van drie weken met de leverancier. De fixkosten van dat item zijn drie weken, geen twee dagen, en het moet vandaag starten ook al raakt niemand het de komende veertien dagen aan.

### 3. Kosten van het laten liggen: per week, in iets telbaars

Dit is de as die mensen overslaan, en juist die doet het meeste werk. Beantwoord per item: wat kost nog een week hiervan ons? Soms zijn het euro's — het her-embed-lek verbrandt ruwweg €400 per week, en dat kun je daadwerkelijk berekenen uit je provider-dashboard en de cijfers in [wat een productie-LLM-feature echt kost](/blog/cost-of-production-llm-2026). Soms zijn het supporturen. Soms is het "niks, tot we in november de tweede klant onboarden" — een enorm nuttig antwoord, want het vertelt je dat dit item een deadline heeft en geen urgentie.

Items waarvan de weekkost nul is tot een bekende datum horen in het 90-dagenplan, niet in de drie weken. Items waarvan de weekkost een getal is dat je hardop kunt zeggen, horen vooraan.

### 4. Afhankelijkheidsvolgorde: wat moet bestaan voordat iets anders meetbaar is

Sommige fixes zijn randvoorwaarden om te weten of andere fixes werkten. Dat is vrijwel altijd observability en evaluatie:

- **Tracing waarin de opgehaalde context gelogd wordt** komt vóór elk retrieval- of chunkingwerk. Zonder tracing debug je blind, en het [latency-werk](/blog/llm-latency-audit-production) heeft geen bottleneck om naar te wijzen.
- **Een golden set van 50–100 vragen met verwacht gedrag** komt vóór prompt-, model- of chunkingwijzigingen. Vijftig vragen is twee dagen werk en verandert elke latere fix van een mening in een meting. De [continuous eval loop](/blog/llm-evaluation-production-continuous-eval) is de volwassen versie; die heb je in week één niet nodig, je hebt die vijftig vragen nodig.
- **Prompt-versiebeheer** komt vóór prompt-tuning, om de reden die ik uitwerk in [stop stille prompt-regressies](/blog/prompt-versioning-regression-testing).

Afhankelijkheden overrulen de andere drie assen. Altijd.

Bij elkaar is de regel kort genoeg voor het whiteboard:

text
1. Eerst afhankelijkheden — alles wat andere fixes meetbaar maakt.
2. Dan onomkeerbare blast radius, gesorteerd op gevolg, niet op kans.
3. Dan de rest op (kosten van laten liggen per week) / (dagen om te fixen).
4. Alles met weekkost nul tot een gedateerde gebeurtenis gaat met die
   datum naar het 90-dagenplan, niet naar deze sprint.

## Uitgewerkt: die twaalf-item-punchlist in volgorde

Draai de regel over de lijst hierboven en de drie weken vallen er bijna mechanisch uit.

**Dag 1–2.** Tracing die de query, de opgehaalde chunk-ID's en de volledige prompt naar het model logt. Pure afhankelijkheid. Niets stroomafwaarts is meetbaar zonder, en het vertelt je onmiddellijk dingen die de audit alleen kon afleiden.

**Dag 3–4.** Het auth-gat. Onomkeerbare blast radius, en in een RAG-assistent is het meestal een ontbrekende metadata-filter en geen herarchitectuur — een dag werk plus een dag om de test te schrijven die het bewijst. Laat het niet voorbij de eerste week glippen; elke dag dat het blijft staan is blootstelling die je later niet ongedaan maakt.

**Dag 4–5, parallel in iemand anders' agenda.** Open het gesprek over PII naar een Amerikaanse regio met legal en de leverancier. Nul engineering-dagen deze sprint, maar de klok loopt vanaf nu. Klassiek item waarbij de fixkosten gedomineerd worden door wachten.

**Dag 5–7.** De golden set. Vijftig tot tachtig vragen met verwachte antwoorden én verwachte weigeringen, getrokken uit echte gebruikersvragen in je logs. Tweede afhankelijkheid, en het ding dat de rest van het kwartaal eerlijk maakt.

**Dag 8.** Het kostenlek. Eén dag, ruwweg €400 per week bespaard, met afstand de beste ratio op de lijst. Ook het item dat je met een getal op een slide kunt zetten.

**Dag 9–10.** Prompt-versiebeheer plus een CI-job die de golden set draait bij elke promptwijziging. Derde afhankelijkheid, en het beschermt alles wat je daarna doet.

**Dag 11–13.** Nu, en pas nu, het retrievalwerk: chunking die geen tabellen meer doorknipt, plus bronvermeldingen in de UI. Je hebt tracing om te diagnosticeren, een golden set om te scoren en versiebeheer om het vast te houden. Bronvermeldingen doen bovendien iets wat geen enkele andere fix doet: ze laten gebruikers de fouten van het model zélf vangen, wat je effectieve foutpercentage verlaagt voordat je het model ook maar hebt verbeterd.

**Dag 14–15.** Rate limiting, retry met backoff en een fallback-model. Goedkoop, en het verwijdert de meest gênante demo-faalmodus: een 429 van je provider op het podium.

Wat het niet haalde: de hardcoded key (roteer hem in vijf minuten, ga deze sprint geen "secret management oplossen"), volledige latency-optimalisatie en de p95-staart. Wat ons bij het eerlijke deel brengt.

## Wat hoort in week één versus maand twee van het 90-dagenplan

Week één is afhankelijkheden en onomkeerbaar risico. Maand twee is alles wat een besluit, een leverancier of een herbouw vraagt: de latency-architectuur, model routing, de regioverhuizing, de eval-loop die continu draait in plaats van in CI, on-prem of VPC-hosting als de dataclassificatie dat eist.

Die splitsing heeft een test. Kan de engineer die de fix schreef hem binnen de sprint valideren? Dan is het een nu-item. Vraagt valideren een maand productieverkeer, een contract of de roadmap van een ander team? Dan is het een 90-dagen-item — en hoort het op een gedateerd plan met een eigenaar, niet in de sprint waar het stilletjes alles opslokt.

## De valkuil: eerst het goedkope werk, omdat het als vooruitgang voelt

De meest voorkomende fout die ik zie is een punchlist afgewerkt in oplopende volgorde van inspanning. Acht kleine items gesloten in week één, een groen dashboard, echte moraal — en het auth-gat in week drie nog steeds open, want dat was de enge.

Goedkoop-eerst optimaliseert voor het aantal gesloten tickets, een metric waar niemand buiten het team om geeft. Het zet bovendien precies de items vooraan met de laagste kosten van laten liggen, want goedkoop en laag-gevolg correleren sterk. De ratio in stap 3 van de regel bestaat juist om dit te stoppen: een fix van één dag mag alleen voordringen als wat hij voorkomt je déze week daadwerkelijk iets kost. Dat is de rekensom achter [auditkosten versus een gebroken launch](/blog/poc-audit-cost-vs-failed-launch) — de dure fouten zijn zelden de dure fixes.

Draai de vier assen voordat iemand een editor opent, schrijf de volgorde op, en laat de schatting van de engineer de schatting op het bord zijn.

## Wanneer je stopt met fixen en achter monitoring live gaat

Op een gegeven moment zijn de resterende items geen dingen meer die je moet fixen, maar dingen die je moet *bekijken*. Het signaal: je schatting van de waarde van de fix wordt een gok. Als je niet kunt zeggen wat een fix oplevert, weet je nog te weinig — en de goedkoopste manier om het te leren is gecontroleerd productieverkeer.

Achter monitoring live gaan betekent iets specifieks: een beperkte cohort (één vriendelijke klant of interne gebruikers), een dashboard met p95-latency, kosten per request en weigerpercentage, alerts met drempels waar iemand mee akkoord ging, een overduidelijke kill switch, en een persoon met naam die er de eerste week naar kijkt. Die opstelling verandert onbekend risico in geobserveerd risico, en geobserveerd risico prioriteer je volgende sprint fatsoenlijk — met echte getallen in plaats van audit-bijvoeglijke naamwoorden.

Wat nooit achter monitoring mag: alles aan de onomkeerbare kant van de blast radius. Monitoring vertelt je dát er een datalek was. Het maakt het niet ongedaan. Al het andere — latency, kosten, kwaliteit, de lange staart aan edge cases — is kandidaat voor ship-and-watch, en meestal een betere kandidaat dan nog drie weken fixen in het donker.

## Waar dit een opdracht wordt

Heb je de punchlist maar niet het vertrouwen om hem te sequencen — of heb je de symptomen en helemaal geen punchlist — dan is dat waar een **POC Audit** voor is: een sprint van één week waarin ik door de codebase, infrastructuur, dataflow, prompts en kosten ga, en de bevindingen teruggeef *plus* het 90-dagenplan met de volgorde, de afhankelijkheden en de week-één/maand-twee-splitsing al beslist.

Je krijgt het kader hierboven toegepast op jouw systeem door iemand die deze lijsten eerder heeft gesequencet, zodat je engineer die drie weken bouwt in plaats van discussieert over wat te bouwen. De scope staat op de [dienstenpagina](/services), en wil je eerst je huidige lijst doorlopen: [vertel me wat erop staat](/contact).
