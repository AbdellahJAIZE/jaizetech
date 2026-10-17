---
title: "Poc-audit timing: boek pas als geld onomkeerbaar wordt"
description: "Poc-audit timing draait niet om code maar om budget. Boek de audit in de week vóór het onomkeerbare commitment, niet erna."
published: "2026-10-17"
tags: ["poc-audit", "AI-productie", "startups", "risicobeheer", "due diligence"]
ogImage: "/images/blog/poc-audit-timing-before-you-commit/cover.jpg"
primaryService: "ai-audit"
---
Boek de audit in de week vóór je geld uitgeeft dat je niet kunt terugdraaien. Dat is het hele antwoord op poc-audit timing, en bijna niemand houdt zich eraan. Als een demo bij mij op tafel komt, heeft hij meestal al een verplichting opgeslokt: een getekend enterprisecontract met een uptimeclausule, twee nieuwe hires wier functieprofiel ervan uitgaat dat de feature in Q1 live gaat, of een afgeronde ronde waarin de demovideo echt werk heeft verricht in de kamer.

De audit helpt dan nog steeds. Hij helpt minder, omdat de helft van wat hij vindt geen beslissing meer is maar een probleem.

Wat de meeste teams als trigger gebruiken is een gevoel. De feature begint riskant te voelen, of een investeerder stelt een scherpe vraag, of de security questionnaire van een klant komt binnen en niemand kan sectie vier invullen. Dat gevoel komt op een onhandig moment opzetten: meestal lang na het nuttige venster, of helemaal zonder beslissing eraan vast. Drie momenten komen steeds terug, en alle drie zijn slechter dan dat ene smalle moment dat telt.

## Poc-audit timing is een budgetvraag, geen engineeringvraag

Een audit maakt je code niet beter. Hij levert een gemeten punchlist en een 90-dagenplan op, en die output is alleen iets waard in verhouding tot het aantal beslissingen dat nog openstaat als hij landt. Kun je de launchdatum nog verzetten? De retrieval-aanpak omgooien? Het hiringplan hersnijden? Heronderhandelen wat de pilot belooft? Zo ja, dan is elke bevinding een hendel. Zo nee, dan is diezelfde lijst een opsomming van dingen waarvoor je later je excuses aanbiedt.

Daarom houd ik vol dat de trigger financieel is en niet technisch. De juiste week heeft niets te maken met hoe de code eruitziet en alles met wat je op het punt staat te ondertekenen. Engineers willen de audit doorgaans als de architectuur wankel aanvoelt. Founders willen hem als iemand van buiten erom vraagt. Het nuttige signaal zit ergens anders: bij de volgende actie die de gok onomkeerbaar maakt.

## Fout moment één: wachten tot de demo breekt

De meeste teams behandelen production readiness timing zoals ze een autobeurt behandelen en wachten op het geluid. De logica klinkt redelijk. Waarom betalen om iets te meten dat nu werkt?

![Poc-audit timing: boek pas als geld onomkeerbaar wordt](/images/blog/poc-audit-timing-before-you-commit/1.jpg)

Omdat AI-features niet breken zoals services breken. Een web-API geeft 500's terug of niet, en je dashboards melden het binnen een minuut. Een LLM-feature degradeert langs assen waar niemand naar kijkt. Retrieval haalt opeens het bijna-juiste document op. Samenvattingen worden vager zodra brondocumenten langer worden. De agent doet een zevende tool call waar hij er eerst drie deed, en je factuur beweegt eerder dan je foutpercentage. Op het moment dat iets zichtbaar stuk is vóór de ogen van gebruikers, kijk je niet meer naar een readinessvraag. Je kijkt naar vertrouwen dat je terug moet verdienen bij de mensen die de slechte output hebben gezien, en dat herstelt geen enkele punchlist.

Er zit ook een scopegevolg aan. Zodra een feature live is en onder echt verkeer faalt, is het eerlijke traject geen audit van een week meer. Het is hardeningwerk aan een draaiend systeem met echte gebruikers eraan, en dat kost weken in plaats van dagen en moet gebeuren terwijl het ding overeind blijft. Wachten op de breuk zet een goedkope beslissing om in een dure reparatie, en ik heb [de rekensom van auditkosten tegen een gebroken launch](/blog/poc-audit-cost-vs-failed-launch) apart uitgeschreven omdat het gat groter is dan de meeste teams aannemen voordat ze het narekenen.

## Fout moment twee: hem inkopen als decorstuk voor de ronde

Het tweede foute moment kondigt zich aan in de briefing. "We sluiten een ronde en we willen graag een technische beoordeling voor de data room." Soms directer geformuleerd: we hebben vooral een bevestiging nodig dat we production ready zijn.

Een audit die geschreven is om gerust te stellen, is voor niemand iets waard, ook niet voor de investeerder. Meten vindt gaten, of het vindt ze niet omdat de testopstelling te zwak was, en die twee uitkomsten zien er in een PDF identiek uit. Het diepere probleem is dat de framing als due-diligencemateriaal de opdracht corrumpeert. De scope wordt onderhandeld richting gebieden die waarschijnlijk slagen. De ongemakkelijke vraag (wat gebeurt er bij 500 tenants, wat gebeurt er als de modelleverancier stil een nieuwe checkpoint uitrolt, wat gebeurt er als een gebruiker een contract van 40 pagina's in een veld plakt dat voor een alinea bedoeld is) verdwijnt geruisloos uit het plan.

Een POC-audit vóór funding kan echt waardevol zijn, maar niet als document voor de andere kant van de tafel. Hij is waardevol omdat hij je vertelt wat je moet ophalen en wat je mag beloven. Vooraf ontdekken dat de feature tien weken werk nodig heeft voordat hij een mid-market klantenbestand kan dragen, verandert de grootte van de ronde, het hiringplan dat je presenteert en de roadmapslide. Die informatie is voor jou. Als het rapport achteraf ook nog nuttig blijkt in een data room: prima, maar schrijf het voor de beslissing, niet voor het publiek.

## Fout moment drie: voordat er iets te meten is

De omgekeerde fout komt minder voor en is makkelijker te repareren. Iemand vraagt om een readiness-audit op een prototype dat bestaat uit een prompt in een notebook, gericht op zes voorbeeld-PDF's, zonder gebruikers, zonder evalset en zonder gesteld doel. Er is niets te meten. Wat je terugkrijgt is een ervaren mening over architectuur, wat waarde heeft, maar dat een AI pilot readiness check noemen is flink overdreven.

Een POC wordt pas te auditen als vier dingen bestaan. Echte data in plaats van gecureerde voorbeelden, inclusief de lelijke documenten. Een volledig pad dat een gebruiker van begin tot eind kan aflopen, ook als er nog een mens in de loop zit. Genoeg verkeer voor een representatieve set queries, of minstens een queryset die is samengesteld door iemand anders dan degene die de prompts schreef. En een gesteld doel, hoe grof ook: dit moet bij 9 van de 10 facturen het juiste antwoord geven, of dit moet binnen drie seconden reageren. Zonder dat doel kan niets slagen of falen.

Kom je daar tekort, dan ligt het nuttige werk elders. Loop eerst [de zelfaudit-checks](/blog/ai-poc-self-audit-checklist) door, zet het prototype voor tien echte gebruikers en besteed je geld aan de architectuurbeslissingen. De vraag of je moet auditen, harden of [het prototype toch helemaal herbouwen](/blog/ai-demo-diagnostic-audit-harden-rebuild), is het waard om te beslechten voordat je iets boekt.

## De juiste trigger: de week waarin het geld beweegt

Er zijn drie verplichtingen die de week betrouwbaar markeren. Een enterprisecontract met een SLA, een volumestaffel of een vastgelegde go-livedatum. Een hire (of twee) wier rol alleen zin heeft als de feature opschaalt. En een financieringsbeslissing waarin de demo gewicht had, je eigen budgetallocatie meegerekend.

Elk daarvan heeft een kort voorbereidingsvenster, en dat is precies het argument voor een vaste sprint van één week in plaats van een langere discoveryfase. Een week past binnen een contractonderhandeling. Hij past binnen de voorbereiding van een board meeting. Hij past tussen het afspreken van headcount en het plaatsen van de vacature. Twee weken passen doorgaans niet, en wat niet in het venster past wordt simpelweg overgeslagen. Zo komen teams ertoe eerst te tekenen en daarna te meten.

De andere reden om die week te kiezen: de bevindingen komen binnen terwijl de volgorde nog vrij is. Een punchlist is niet nuttiger dan je vermogen om de volgorde te bepalen, en [fixes prioriteren op impact, inspanning, risico en omkeerbaarheid](/blog/ai-poc-audit-priority-framework) is een ander spel wanneer de launchdatum al in de agenda van een klant staat. Op dat punt wordt de volgorde je gedicteerd.

## Wat wachten kost als je toch wacht

Genoeg teams horen dit argument, zijn het ermee eens en committeren zich alsnog. Goed om helder te zijn over wat dat kost, want het zijn zelden de engineeringuren.

Het is de belofte die je niet kunt terugnemen. Een SLA met 99,9% erin, afgesproken voordat iemand heeft gemeten wat de beschikbaarheid van je modelleverancier met je p99 doet, is een commerciële blootstelling die je nu twaalf maanden draagt. Het is de misser in je hiring: twee engineers aangenomen voor de laag die prima was, terwijl de echte bottleneck in data-toegang en evaluatie zat. En het is de langzame variant van falen, waarbij de pilot niet live gaat en niet sterft maar drie kwartalen in review hangt. Die stilstand is bijna nooit een modelprobleem, en daarom blijf ik [pilotpurgatorium een governancegat noemen](/blog/ai-pilot-purgatory-why-pocs-stall): niemand heeft vooraf afgesproken welk bewijs genoeg zou zijn om door te gaan, dus is geen enkel bewijs ooit genoeg.

## Deze week beslissen

Stel één vraag: wat is het volgende onomkeerbare dat ik met deze demo ga doen, en wanneer staat het gepland? Ligt dat antwoord binnen zes weken, dan is dat je venster en staat het nu open. Staat er niets onomkeerbaars op de rol, dan heb je nog geen audit nodig. Dan heb je gebruikers nodig, een doel, en een maand echt verkeer, en daarna antwoordt de vraag zichzelf.

De POC Audit is voor precies die week gebouwd: één sprint van een week tegen een vaste prijs, meten in plaats van code reviewen, en een 90-dagenplan waar je nog naar kunt handelen. Staat er iets onomkeerbaars in je agenda, dan vind je de scope op de [servicespagina](/services) en kun je me [vertellen waartoe je je gaat verbinden](/contact).
