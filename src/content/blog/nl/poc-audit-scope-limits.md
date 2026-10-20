---
title: "Poc-audit scope: wat een readiness-audit wel en niet dekt"
description: "Een poc-audit scope is smal: hij meet of je prototype productie overleeft, niet of de markt het wil of je juridisch gedekt bent. Hier zijn de grenzen."
published: "2026-10-20"
tags: ["poc-audit", "AI-productiegereedheid", "due diligence", "AI-governance", "softwareleveranciers"]
ogImage: "/images/blog/poc-audit-scope-limits/cover.jpg"
primaryService: "ai-audit"
---
Vraag een leverancier voordat je iets ondertekent wat de opdracht *niet* dekt. Dat antwoord zegt meer over een poc-audit scope dan welke lijst met deliverables ook, want de teleurstellingen die ik achteraf hoor gaan vrijwel nooit over de kwaliteit van het werk. Ze gaan over "ik ging ervan uit dat het compliance-deel erin zat", of "we dachten dat hieruit zou blijken of we het überhaupt moeten bouwen".

Een production readiness audit van een week is een smal instrument. Het beantwoordt één vraag: overleeft dit prototype echte gebruikers, echte datavolumes en echte kosten op de schaal die je op het punt staat te beloven, en zo niet, wat fix je dan eerst. Die vraag is een week waard. Het is ook één vraag van de meerdere die een founder met een AI-feature dit kwartaal moet beantwoorden, en voor de andere heb je andere mensen nodig.

Hieronder staat de eerlijke grenskaart, opgeschreven als de vragen die kopers me stellen in het gesprek vóór ze boeken.

## De scopegrens die de meeste salesgesprekken overslaan

Bijna elk auditvoorstel somt op wat erin zit. Vrijwel geen enkel voorstel somt op wat eruit valt, en in die asymmetrie worden verkeerde verwachtingen gefabriceerd. Een bullet die zegt "security review van de AI-pipeline" is waar en tegelijk fundamenteel iets anders dan een penetratietest, maar de koper die dat om 22:00 doorleest vóór een board-update weet dat nog niet.

Ik schrijf de uitsluitingen bewust in het scopedocument. Het kost me een beetje gevoelde waarde in het verkoopgesprek en het bespaart een hoop frictie in week twee, als iemand aan tafel een ondertekende uitspraak over de AVG verwacht die ik nooit ging leveren. Kan een leverancier je niet in één zin vertellen wat zijn audit weigert te dekken, dan koop je een ongedefinieerd ding. Dat geldt voor de mijne en voor die van ieder ander; de bredere versie van deze check staat in de [technische vragen die je elke AI-leverancier moet stellen](/blog/vet-ai-vendor-before-you-sign) voordat je tekent.

## Het vertelt je niet of de markt dit product wil

Dit is het duurste misverstand van de vier, omdat het als laatste wordt ontdekt. Een audit meet of het systeem werkt. Het zegt niets over of iemand gaat betalen voor dat het werkt.

![Poc-audit scope: wat een readiness-audit wel en niet dekt](/images/blog/poc-audit-scope-limits/1.jpg)

Ik kan je vertellen dat je RAG-assistent 88% van je evalvragen correct gegrond beantwoordt, bij de huidige tokenprijzen ruwweg €0,04 per gesprek kost en een p95 van 2,1 seconden haalt. Ik kan je niet vertellen of de twaalf pilotgebruikers die erom vroegen staan voor vierhonderd betalende accounts of voor vier. Dat zijn verschillende disciplines met verschillend bewijs: de een vraagt evalsets en traces, de ander vraagt prijsgesprekken, churncijfers en een salesproces. Technische gereedheid en commerciële vraag falen onafhankelijk van elkaar, en ik heb POC's geaudit die technisch uitstekend in vorm waren en toch gestopt hadden moeten worden.

Als vraag jouw echte onzekerheid is, besteed dan nog geen week aan engineering review. Haal drie ondertekende intentieverklaringen, of draai een maand de handmatige versie van de feature met een mens achter het gordijn. De audit is meer waard zodra het antwoord op "gaan ze het gebruiken" al ja is, wat ongeveer het [timingargument](/blog/poc-audit-timing-before-you-commit) is om hem de week vóór je budget vastlegt te boeken in plaats van maanden eerder.

## Je juridische blootstelling beweegt niet omdat een engineer ernaar keek

Een audit brengt de feiten naar boven waar je juridische positie van afhangt. Hij lost die positie niet op.

Concreet: ik documenteer welke categorieën persoonsgegevens door de pipeline bewegen, welke sub-processors die ontvangen, waar de inference geografisch plaatsvindt, hoelang prompts en completions bij elke provider bewaard worden onder hun huidige voorwaarden, of je logs data bevatten die je daar niet wil hebben, en of de feature op basis van de use case plausibel in een hogere risicocategorie van de EU AI Act valt. Dat is het feitelijke substraat. Nuttig, en vaak de eerste keer dat iemand het op één plek heeft opgeschreven.

Wat daarna gebeurt is geen engineeringwerk. Iemand moet besluiten of je DPIA bijgewerkt moet worden, of de verwerkersovereenkomst met je modelleverancier toereikend is, of je privacyverklaring beschrijft wat het product nu doet, en of aan de AI Act-verplichtingen bij jouw classificatie is voldaan. Dat is een privacyjurist samen met een compliance-eigenaar, werkend vanuit de technische feiten. Ik lever de feiten aan. Ik onderteken de conclusie niet, en bij elke engineer die aanbiedt dat wel te doen zou ik mijn wenkbrauwen optrekken.

Twee opmerkingen over volgorde, uit projecten waar dit scheef liep. Ben je al redelijk zeker dat de datastroom juridisch problematisch is, fix dat dan vóór je een readiness audit betaalt, want een inferencepad over de grens kan de helft van de architectuur ongeldig maken en de punchlist zinloos. Praktische startpunten zijn de [AVG-lezing over bedrijfsdata naar OpenAI](/blog/company-data-openai-gdpr-netherlands) en de [AI Act-checklist voor Nederlandse softwareteams](/blog/eu-ai-act-checklist-dutch-software-teams). Weet je het niet zeker, dan is de audit een redelijke manier om uit te vinden waar je mee te maken hebt.

## Waar een readiness audit stopt en een penetratietest begint

De verwarring tussen poc audit vs security review is begrijpelijk, omdat de twee zichtbaar overlappen en op een onzichtbare manier uiteenlopen.

Ik kijk wel naar het aanvalsoppervlak dat specifiek is voor LLM-systemen. Kan een document in je corpus het model zo sturen dat het zijn instructies negeert, een echte failure mode die een [system prompt niet oplost](/blog/prompt-injection-production-guardrails). Respecteert retrieval de tenantgrenzen, of dient één embedding-index iedereen en hopen we dat het filter blijft houden. Kan een agent loop gedreven worden naar een write-endpoint dat hij nooit had mogen aanraken. Staan API-keys op de juiste plek. Laat het outputpad modeltekst ongeëscaped in een browser landen.

Wat ik niet doe is een penetratietest. Geen adversarial testen van je authlaag, geen CVE-sweep over je dependencies, geen netwerk- en infrastructuurbeoordeling, geen poging om sessiebeheer of privilege escalation in de omliggende applicatie te breken, en geen rapport in het formaat dat de security questionnaire van je enterprise-klant verwacht. Daarvoor is een andere vaardigheid nodig en, als er een enterprise-deal van afhangt, een onafhankelijke partij wiens naam op het rapport iets betekent voor jouw koper.

De praktische splitsing: is je blokkade "een prospect stuurde ons een vragenlijst met 200 securityvragen", huur dan een pentestbureau in. Is je blokkade "we weten niet of dit ding data lekt tussen klanten of overgehaald kan worden een record te verwijderen", dan zit dat binnen de audit, en de [multi-tenant isolatiefouten](/blog/multi-tenant-ai-feature-data-leaks) zijn degene die ik het vaakst vind.

## Niemand kan garanderen dat het 90-dagenplan wordt uitgevoerd

De audit eindigt met een geprioriteerde punchlist en een 90-dagenplan. Dat plan is een sequentiedocument: wat fix je in welke volgorde, wat kost elk item in engineeringdagen, wat kan wachten tot na de launch, en welke twee of drie items echt blokkerend zijn.

De uitvoering van dat 90-dagenplan is jouw werk, tenzij je die apart inkoopt. Ik heb goede plannen een kwartaal onaangeroerd zien liggen omdat de ene engineer die de retrievallaag begreep met ouderschapsverlof ging, of omdat een financieringsronde de prioriteiten herschikte, of omdat niemand als eigenaar was benoemd en dus iedereen aannam dat een ander het had. Er zit geen projectmanager aan het plan vastgeschroefd.

Twee dingen verbeteren de kans meetbaar. Benoem per punchlist-item een eigenaar voordat de auditweek voorbij is, terwijl de context nog vers is en de kamer het nog eens is over het belang van de bevindingen. En zet die week de bovenste drie items om in echte tickets met schattingen in je tracker, niet in een PDF die iemand in januari weer opent. Heeft je team helemaal geen capaciteit om uit te voeren, dan is de audit nog steeds zinvol, want hij vertelt je hoe groot het gat is en wat er in een aanvraag moet. Wees dan wel eerlijk tegen jezelf: je koopt een diagnose, geen behandeling. De eerlijke versie van die keuze staat in het stuk over [auditen, hardenen of herbouwen](/blog/ai-demo-diagnostic-audit-harden-rebuild).

## Wat een poc-audit scope van één week wel betrouwbaar oplevert

Smal betekent niet dun. Binnen zijn grens levert een week meten dingen op die de meeste teams niet hebben:

- **Een echte evalset en een gemeten baseline.** Geen onderbuik. Een gescoorde steekproef van je werkelijke vragen tegen je werkelijke corpus, met retrieval en faithfulness apart gemeten zodat je weet welke helft stuk is.
- **Kosten per request en per gebruiker op je verwachte volume**, inclusief de specifieke inputs die ze laten pieken: groeiende context, retry-stormen, agent loops die niet termineren.
- **Latency-percentielen met de bottleneck gelokaliseerd**, en die zit meestal niet in de modelcall.
- **De failure modes die je nog niet hebt gezien**, gevonden door de paden te draaien die je demo nooit raakte: lege retrieval, te grote documenten, gelijktijdige load, provider-timeouts, kapotte structured output.
- **Een geprioriteerde punchlist en een 90-dagenplan** met eigenaren en effortschattingen.

Wil je de precieze vorm van de output zien, dan schreef ik eerder op [wat er in een echt readiness-rapport staat](/blog/ai-poc-audit-report-checklist) en [hoe de week zelf dag voor dag is opgebouwd](/blog/poc-audit-week-day-by-day).

## De ene vraag die je stelt voordat je boekt

Stel deze, aan mij of aan wie dan ook: **"Welk besluit kan ik vrijdag nemen dat ik vandaag niet kan nemen, en welke besluiten staan dan nog open?"**

Iemand die deze opdrachten vaker heeft gedaan antwoordt in specifieke termen. De mijne: vrijdag kun je besluiten of je launcht, hardent of herbouwt, je kunt een verdedigbaar getal in een budgetaanvraag zetten, en je kunt je team briefen over de drie dingen die eerst moeten. Nog open: of de markt het wil, of je DPIA houdbaar is, of je auth een gemotiveerde aanvaller overleeft, en of het plan daadwerkelijk wordt uitgevoerd.

Krijg je een lijst deliverables terug in plaats van een lijst besluiten, blijf dan doorvragen.

## Vragen die kopers stellen voordat ze tekenen

**Wordt er in die week ook iets gefixt?**
Kleine dingen wel, waar fixen sneller is dan beschrijven. De week leunt op meten, want een ongemeten fix is een gok. Echt herstelwerk is een aparte hardening-opdracht van drie tot zes weken.

**Onze POC is gebouwd door een extern bureau. Verandert dat de audit?**
Dat verandert de eerste ochtend, niet de scope. Ik heb repo-toegang nodig, de mogelijkheid het systeem tegen realistisch gevormde data te draaien, en iemand die architectuurvragen kan beantwoorden. Als het bureau alle drie beheert en niet meewerkt, zeg dat dan voor we boeken, want dat is een echte blokkade en geen ongemak.

**We hebben nog geen enkele eval. Is het te vroeg?**
Dat is de normale beginsituatie en geen reden om te wachten. Het bouwen van de eerste evalset hoort bij de week. Wat het wél te vroeg maakt: de POC loopt nog niet end to end, of je hebt geen idee welke vragen gebruikers echt gaan stellen, want dan is er niets om tegen af te meten.

**Kan de output naar een enterprise-prospect of een investeerder?**
De bevindingen zijn geschreven voor jouw team, met genoeg technisch detail om ernaar te handelen en genoeg gewone taal voor een boardslide. Het is geen certificering en er zit geen onafhankelijke verklaring bij. Wil een prospect zekerheid, dan wil die meestal een pentestrapport of een SOC 2, en dat zijn andere documenten van andere leveranciers.

**We weten al dat de POC slecht is. Moeten we doorstappen naar een herbouw?**
Soms. Is de architectuur duidelijk verkeerd en weet je waarom, dan bevestigt de audit vooral wat je al besloten had. Betekent "slecht" dat het traag is en soms fout en dat je niet weet waarom, dan is de diagnose een week waard, want herbouwen zonder geïdentificeerde oorzaak reproduceert die oorzaak meestal gewoon.

De POC Audit duurt één week, heeft een vaste scope en eindigt in een gemeten punchlist met een 90-dagenplan: de diagnose, bewust niet alles eromheen. De grenzen staan op de [servicespagina](/services), en wil je vóór je vastlegt checken of jouw situatie erbinnen past, [stuur me dan de details](/contact), dan zeg ik je gewoon of dat niet zo is.
