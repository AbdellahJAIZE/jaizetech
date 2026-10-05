---
title: "Waarom je AI pilot purgatorium geen technisch probleem is"
description: "Zit je vast in AI pilot purgatorium? Vaak is het geen modelprobleem maar een ontbrekend besluit. Vier vragen die direct duidelijkheid geven."
published: "2026-10-05"
tags: ["AI pilot purgatorium", "AI implementatie", "proof of concept", "AI in productie", "besluitvorming"]
ogImage: "/images/blog/ai-pilot-purgatory-why-pocs-stall/cover.jpg"
primaryService: "ai-audit"
---
Welke van jouw vastgelopen pilots heeft een persoon met naam en toenaam die kan besluiten om het ding voor echte klanten te zetten, zonder eerst iemand anders om goedkeuring te vragen? Als je daar meer dan een paar seconden over moet nadenken, heb je vermoedelijk net gevonden wat je werkelijk blokkeert, en dat is niet het model. Het **AI pilot purgatorium** is zelden een modelleringsprobleem. Het is de toestand waarin niets hard genoeg faalt om te stoppen, en niets overtuigend genoeg werkt om te financieren.

Het telefoontje dat ik een paar keer per jaar krijg heeft steeds dezelfde vorm. Twee of drie AI-pilots, allemaal goed gedemonstreerd, allemaal afgesloten met een variant van "veelbelovend, we kijken er volgend kwartaal opnieuw naar." Maanden gaan voorbij. Dan vraagt de directie of het probleem technisch of organisatorisch is, want niemand wil nieuw budget vrijgeven zonder dat te weten.

Het goede nieuws: je kunt meestal binnen een middag vaststellen in welk soort stilstand je zit, zonder iemand in te huren. Hieronder staat de diagnose die ik gebruik, opgehangen aan een hypothetische casus die dicht genoeg bij het echte patroon ligt om herkenbaar te zijn.

## Drie demo's, drie keer "ja, maar nog niet", nul launches

Eén vastgelopen proof of concept is meestal een technisch verhaal. Iemand heeft gebouwd op 200 schone documenten, productie heeft er 400.000 rommelige, retrieval valt om, en de lijst met fixes is leesbaar. Over die versie van het probleem heb ik eerder geschreven: het gat tussen [een demo en een productie-deployment](/blog/ai-demo-to-production-audit) is grotendeels engineeringwerk dat je kunt scopen.

Herhaalde pilots zijn een ander beest. Als de derde demo op precies dezelfde plek eindigt als de eerste twee, dan was de variabele die over alle drie gelijk bleef nooit de techstack. Andere teams, andere modellen, soms andere leveranciers, dezelfde uitkomst. Dat wijst naar het besluitvormingsproces, niet naar de code.

Het eerste signaal waar ik op let: vraag drie mensen in de ruimte wat "live" zou hebben betekend voor pilot nummer één. Krijg je drie verschillende antwoorden, dan zijn de pilots nooit tegen een standaard beoordeeld. Ze zijn beoordeeld tegen een gevoel, en een gevoel haalt nooit een drempelwaarde.

## Waarom het AI pilot purgatorium van binnenuit technisch lijkt

Elke vastgelopen pilot komt met een technische actielijst, en elk punt op die lijst is echt. De latency is te hoog. Het hallucinatiepercentage maakt legal nerveus. Er is geen monitoring. De kosten zijn onvoorspelbaar. Niemand liegt als hij zegt dat het ding niet productierijp is, want naar elke eerlijke maatstaf is het dat ook niet.

![Waarom je AI pilot purgatorium geen technisch probleem is](/images/blog/ai-pilot-purgatory-why-pocs-stall/1.jpg)

Wat dit misleidend maakt, is dat die actielijst ook de meest comfortabele verklaring is die beschikbaar is. Hij legt het probleem bij engineering, een afdeling die je kunt vragen dingen op te lossen, in plaats van bij een gat in de besluitvorming, wat degene raakt die het overleg voorzit. Dus besteedt het team nog zes weken aan de lijst, wordt de demo beter, en komt het besluit er nog steeds niet, omdat een betere demo nooit de blokkade was.

Ik heb teams een pilot drie keer achter elkaar zien hardenen. Betere evals, schonere gestructureerde output, een echt kostendashboard. Allemaal oprecht nuttig werk. De pilot ging nog steeds niet live, omdat niemand ooit de vraag had beantwoord wie het restrisico accepteert als het model er voor een klant naast zit.

## De vier plekken waar een pilot echt doodgaat

Bij de stilstanden waar ik bij ben gehaald, landt de oorzaak op een van vier plekken. Alleen de eerste is een engineeringprobleem.

**1. Het productiegat.** De POC werkt op een gecureerde selectie en degradeert op de echte verdeling. Retrievalkwaliteit stort in buiten het democorpus, latency verdrievoudigt onder concurrency, de kosten per request bij echt volume zetten de business case op zijn kop. Dit is oplosbaar, het is meetbaar, en het heeft een actielijst met een volgorde. Het [prioriteitenraamwerk op vier assen](/blog/ai-poc-audit-priority-framework) bestaat precies om zo'n lijst te sorteren.

**2. Het eigenaarsgat.** Niemand heeft tegelijk de bevoegdheid om live te gaan en het mandaat om de gevolgen van een foute output te dragen. Product denkt dat het een technische afweging is. Engineering denkt dat het een productafweging is. Risk of legal heeft een open vraag die niemand formeel bij hen heeft neergelegd. De pilot wordt niet afgewezen, hij wordt uitgesteld, wat van buiten identiek lijkt en meer kost omdat het werk steeds opnieuw wordt opgefrist.

**3. Het workflowgat.** De AI-feature werkt en niemand in het ontvangende team heeft zijn manier van werken aangepast. Een prijsassistent die een voorstel produceert dat een accountmanager handmatig in een ander systeem moet overtypen, is geen feature maar extra huiswerk. Had de pilot nooit een toegewijde eigenaar aan de operationele kant, dan is er niets om in te landen.

**4. Het meetgat.** Geen afgesproken definitie van goed genoeg. Zonder een vooraf vastgelegde drempel ("85% van de extracties zonder correctie geaccepteerd, p95 onder vier seconden, nul ongemarkeerde prijsfouten in een steekproef van 500 cases") wordt elke readout een discussie over de vraag of de output goed voelde. Zulke discussies hebben geen stopconditie. Dit gat produceert stilletjes de langste purgatoria, omdat het onbeperkt engineeringinzet kan absorberen zonder ooit op te lossen.

De meeste vastgelopen teams hebben er twee tegelijk. Meestal het productiegat plus een van de andere drie, en daarom is "is het technisch of organisatorisch" de verkeerde vraag. Het is bijna altijd beide, en de volgorde van aanpakken is wat uitmaakt.

## Een uitgewerkte casus: de prijs-copilot die al achttien maanden "bijna klaar" is

Neem een hypothetisch middelgroot Nederlands logistiek bedrijf, rond de 300 mensen, met een quoteringsproces waar een ervaren pricing-analist 20 tot 40 minuten per complexe zending aan kwijt is. Ze bouwen een prijs-copilot: die leest de aanvraag, haalt vergelijkbare historische quotes op en schrijft een prijs met een korte onderbouwing.

De eerste pilot, gebouwd door een data scientist op het analyticsteam, werd in maart gedemonstreerd. Op 30 handmatig geselecteerde historische aanvragen produceerde hij goede concepten. Sales was enthousiast. De feedback was "we moeten zeker weten dat hij een lane niet te laag prijst", en de pilot ging terug voor meer werk.

Ronde twee, zes maanden later, voegde retrieval over drie jaar quotehistorie toe plus een confidence score. Betere demo. Nu was het bezwaar dat de historische data quotes bevat die later zijn heronderhandeld, waardoor sommige vergelijkingen fout zijn. Terecht punt. Iemand werd aangewezen om de datakwaliteit te onderzoeken.

Ronde drie haalde een extern bureau binnen, een echte evalset en een mooiere UI. De demo was indrukwekkend. De CFO vroeg wat er gebeurt als de copilot een prijs voorstelt, de accountmanager die verstuurt, en de marge negatief blijkt. Niemand in de ruimte kon zeggen wie die uitkomst zou bezitten. Intern wordt de pilot nu omschreven als "wachtend op de datawarehouse-migratie".

Waar ik mijn geld op zou zetten, met een paar varianten van dit verhaal achter me: de technische actielijst is echt maar oppervlakkig. Het filteren van vergelijkbare quotes is fout, er is geen guardrail die een voorstel onder een ondergrensmarge blokkeert, en er wordt niets gelogd over wat de accountmanager met elk voorstel deed, dus er is geen feedbackloop. Twee tot vier weken gericht werk. De werkelijke blokkade is dat in achttien maanden niemand de vraag van de CFO heeft omgezet in een specificatie. Als het antwoord is "de copilot mag nooit een verzendbare prijs produceren, alleen een concept dat de accountmanager goedkeurt, en de accountmanager bezit het getal", dan is de feature dit kwartaal te shippen. Als het antwoord is "de prijs van de copilot gaat automatisch de deur uit", dan is er een harde margefloor nodig, een audit trail, en goedkeuring van iemand die dat risico mag accepteren. Beide zijn bouwbaar. Geen van beide is bouwbaar voordat iemand kiest.

## De test die je vertelt welk probleem je hebt

Doe dit voordat je iemand inhuurt, mij inbegrepen. Vier vragen, los van elkaar gesteld aan de betrokkenen, zodat ze niet in de vergaderruimte naar elkaar toe praten.

- **De drempelvraag.** Welke accuraatheid, latency en kosten zouden dit een ja maken? Kan niemand getallen noemen, dan heb je een meetgat en geen audit dicht dat voor je.
- **De eigenaarsvraag.** Wie tekent voor livegang, en weet die persoon dat? Noem één naam. "De stuurgroep" is geen antwoord, dat is een beschrijving van het probleem.
- **De gevolgvraag.** Als het model voor een klant een foute output geeft, wie is dan verantwoordelijk en wat is het herstelpad? Is dit nooit besproken, reken er dan op dat de pilot op exact dit punt opnieuw stilvalt.
- **De workflowvraag.** Welk team verandert op de dag van livegang zijn dagelijkse proces, en heeft hun manager zich aan die verandering gecommitteerd?

Krijg je op alle vier scherpe antwoorden en zit de pilot nog steeds vast, dan is je probleem echt technisch, en is [een scoped onderzoek naar wat breekt op echt volume](/blog/ai-pilot-to-production-scoping) de juiste volgende stap. Komen er twee of meer vaag terug, koop dan nog geen engineering. Laat eerst het besluit vallen, want engineeringinzet vóór dat besluit is de duurste vorm van herwerk die er bestaat.

## Wat één week kan oplossen en wat niet

Een POC Audit van een week maakt de technische helft met echte zekerheid rond. Ik ga door de code, prompts, retrievalopzet, datapad en kostenprofiel van de pilot, laat hem lopen op input die hij nog niet gezien heeft, en kom terug met een geprioriteerde actielijst en een 90-dagenplan: wat eerst wordt gefixt, wat kan wachten, wat weg moet, en wat het realistisch kost in engineeringweken. Daarmee wordt "we zijn nog aan het piloten" een reeks stappen met een datum aan het eind.

Wat een audit niet kan, is jouw beslisser kiezen. Wat hij wel kan: de afwezigheid daarvan onmogelijk maken om te negeren. Een schriftelijke readout die zegt "de technische blokkades zijn 15 engineeringdagen, en de resterende blokkade is dat niemand het restrisico op geautomatiseerde prijsvorming heeft geaccepteerd" doet in één vergadering vaak meer dan nog een kwartaal itereren. In mijn ervaring is die zin de output van de week met de grootste hefboom, en hij is ongemakkelijk genoeg dat niemand hem van binnenuit opschrijft.

De rekensom is ook niet subtiel. Zet een week diagnose naast [wat een vastgelopen of gebroken launch werkelijk kost](/blog/poc-audit-cost-vs-failed-launch) aan opnieuw opgefriste pilots, verloren interne geloofwaardigheid en het budget dat nooit meer wordt goedgekeurd omdat de laatste drie pogingen niets opleverden.

## Als je deze maand één ding doet

Pak de pilot met de helderste business case, stel de vier vragen hierboven, en schrijf de antwoorden op. Komen ze scherp terug en is het engineeringpad waar je over twijfelt, dan is een [POC Audit](/services) een sprint van één week met vaste scope die je vertelt wat er breekt op schaal, wat je eerst moet fixen, en die je een 90-dagenplan geeft met een launchdatum eraan vast. Wil je een tweede mening over welke van je vastgelopen pilots die week waard is, [stuur me de korte versie](/contact) en ik zeg je eerlijk wat ik ervan vind.
