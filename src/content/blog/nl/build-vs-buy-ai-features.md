---
title: "Build vs buy AI features: de math voor je CTO"
description: "Drie echte patronen voor de build vs buy keuze rond AI, met ruwe cijfers en een oefening van twee uur. De ene vraag die 80% van de discussies oplost."
published: "2026-05-02"
tags: ["build vs buy", "AI strategie", "CTO", "product"]
ogImage: "/og-image.png"
primaryService: "ai-audit"
---

De meeste artikelen over build vs buy voor AI features lezen alsof ze geschreven zijn door iemand die er nog nooit eentje live heeft gezet. Je krijgt een 2x2 matrix, een paar bullets over "kerncompetentie", en nul cijfers die je in een planningsoverleg kunt verdedigen. Dus loop je terug naar je team met dezelfde vraag waar je mee begon, alleen wat netter aangekleed.

Deze post is de versie die ik graag had gelezen voor mijn eerste grote beslissing hierover. Drie echte patronen met ruwe cijfers, de ene vraag die de meeste discussies in je hoofd al beslecht voor ze het team bereiken, de vendor lock-in val die SaaS shops na ongeveer achttien maanden raakt, en een oefening van twee uur die je kunt draaien voor het volgende planningsoverleg. Ik heb production AI op beide manieren gebouwd, custom en met een vendor wrapper, dus ik ben eerlijk over wat elke kant je echt kost.

## De ene vraag die 80% van de build vs buy discussies oplost

Voordat je iets in een spreadsheet stopt, stel jezelf deze vraag. Is deze AI feature de defensibility van je product, of is het table stakes?

Table stakes betekent dat de markt het verwacht, klanten er niet extra voor betalen, en drie van je concurrenten al een versie ervan hebben. Denk aan een chat samenvatter in een CRM, een "schrijf deze email" knop in een help desk tool, slimme tagging voor geüploade bestanden. Niets daarvan is waar mensen jouw product om kiezen. Het is wat ze zouden missen als het er niet was.

Defensibility betekent dat het de reden is waarom klanten blijven, of de reden waarom ze naar jou zouden overstappen. Jouw retrieval over tien jaar interne technische documentatie. Een fine-tuned model dat leads scoort op basis van jouw specifieke historische conversiedata. Een computer-vision pipeline getraind op een dataset die alleen jij hebt omdat je vijf jaar bezig bent geweest met verzamelen. Dit is de moat.

Als het table stakes is, buy. Wrap een vendor API, ship in twee weken, ga door. De onderhoudslast van een custom build vreet het team op dat aan je moat zou moeten werken.

Als het defensibility is, build. Accepteer dat je tekent voor doorlopend onderhoud, evals, hertrainen, en on-call voor een systeem dat zich niet deterministisch gedraagt. Je koopt geen feature, je begint een klein product binnen je product.

De meeste teams hebben dit precies omgedraaid. Ze bouwen de chat samenvatter (table stakes) omdat het voelt als echt engineering werk, en kopen daarna een generieke vendor voor het stuk dat hun moat had moeten zijn omdat de vendor demo strak was. Twee jaar later hebben ze een onderhoudslast op de verkeerde feature en een "me too" versie van het stuk waar klanten juist op vergelijken.

Die ene vraag doodt ongeveer 80% van de discussies die ik zie. De resterende 20% zijn echt lastig, en daar verdient het rekenwerk zijn geld terug.

## Drie veelvoorkomende patronen met de cijfers

Hier zijn drie patronen die ik vaak zie. De cijfers zijn ruwe marktranges, geen facturen van echte projecten, maar dichtbij genoeg om voor een finance persoon te verdedigen.

### Patroon 1: BUY. De support inbox classifier

Je hebt 200 support tickets per dag. Je wilt ze automatisch taggen op urgentie en routeren naar de juiste queue. Klassiek, nuttig, geen moat.

Vendor route. Een OpenAI of Anthropic API call per ticket, met een structured-output prompt en vier of vijf categorieën. Bij de huidige prijzen kost 200 tickets per dag met een kleine prompt en korte response ergens tussen de 20 en 40 euro per maand aan API spend. Integratie is twee tot drie engineering dagen als je support tool een webhook heeft (en die heeft hij). Lopend onderhoud is in de basis nul, je kijkt eens per maand naar de eval cijfers en past de prompt aan als de accuracy wegloopt.

Build route. Verzamel een gelabelde dataset (of betaal iemand om te labelen), fine-tune een kleine open-source classifier, deploy hem achter je eigen inference service, zet monitoring op, hertrain als categorieën verschuiven. Realistische upfront kosten in de Nederlandse markt zijn 15k tot 25k euro aan engineering tijd, plus 200 tot 500 euro per maand aan compute en iemands aandacht elke keer dat het support team een nieuwe ticket categorie toevoegt.

Niet bouwen. De vendor wint op elke as, inclusief accuracy, omdat hun model groter is dan wat jij ooit zou trainen. De enige reden om hier te bouwen is als je een harde data-residency eis hebt die US API's uitsluit, en dan kies je niet op kosten maar op compliance.

### Patroon 2: BUILD. RAG over je proprietary corpus

Je verkoopt aan een gereguleerde industrie. Je hebt tien jaar interne technische documentatie, klantdossiers en engineering rapporten. Je concurrenten hebben dit corpus niet. Klanten kopen jou deels omdat jouw product het juiste antwoord uit dit kennisarchief sneller naar boven haalt dan wie dan ook.

Vendor route. Je richt een generieke RAG-as-a-service oplossing op je documenten. Hij chunkt ze met default settings, embedt ze met een default model, retrieved met default top-k. De antwoorden zijn oké. Ze zijn ook precies even goed als wat je concurrent zou krijgen als hij zijn (slechtere) corpus aan dezelfde vendor zou voeren. Je hebt zojuist je eigen moat tot een commodity gemaakt.

Build route. Je ontwerpt de chunking strategie rond hoe jouw documenten daadwerkelijk gestructureerd zijn (secties, tabellen, diagrammen met onderschriften). Je kiest of fine-tuned een embedding model dat je domein vocabulaire kent. Je bouwt een retrieval laag die metadata filters gebruikt die specifiek zijn voor hoe jouw klanten vragen stellen. Je voegt evals toe die kwaliteit meten op je moeilijkste echte vragen, niet op generieke benchmarks. Realistische upfront kosten zijn 25k tot 50k euro afhankelijk van de complexiteit van het corpus. Lopend onderhoud is een tot twee dagen per maand plus inference kosten.

Build. Het hele punt is dat het tuning werk het product is. Als een vendor het net zo goed kon, was het sowieso je moat niet.

### Patroon 3: HYBRID. De AI agent

De meeste B2B AI producten in 2026 landen hier, en met goede reden. Je bouwt een agent die je gebruikers helpt iets specifieks te doen in jouw product. Hij moet kunnen redeneren (een LLM aanroepen), retrieven (jouw data), en acties ondernemen (jouw API's en de gekoppelde tools van je klant).

Buy de model laag. Gebruik GPT-class of Claude-class modellen via hun API's. Je gaat OpenAI of Anthropic niet verslaan op general reasoning, en de prijs per token blijft toch dalen. Hier je eigen LLM omheen wrappen is bijna altijd een fout, tenzij je een hele specifieke privacy of cost-at-scale reden hebt.

Build de orchestration. De tool definities, de retrieval, de guardrails, het eval harnas, de human-in-the-loop fallbacks, de manier waarop de agent beslist wanneer hij de gebruiker om bevestiging vraagt. Hier woont de persoonlijkheid van je product. Hier lockken vendor "agent platforms" je ook in voor capabilities die je in twee sprints zelf had kunnen bouwen.

De realistische cijfers lopen hier flink uiteen op basis van hoeveel tools de agent aanroept en hoe streng je eval lat ligt, maar een bruikbare v1 van een gefocuste agent in een B2B product kost typisch 40k tot 80k euro aan engineering, plus model inference kosten die meeschalen met gebruik. Reken op doorlopend werk, agents hebben voor altijd eval en tuning aandacht nodig, niet alleen bij launch.

Hybrid is het standaard antwoord voor elke AI feature die in het hart van je product zit. Buy wat een commodity is (het base model). Build wat je onderscheidt (alles eromheen).

## De vendor lock-in val waar niemand SaaS teams voor waarschuwt

Hier komt het stuk dat het sales deck van de vendor niet behandelt.

Als je AI feature afhangt van één enkele LLM provider, heb je een contract getekend met drie clausules die je niet kunt lezen. De prijs (die ze kunnen aanpassen). Het model (dat ze kunnen deprecaten, soms met 90 dagen opzegtermijn, soms minder). De rate limits (die ze kunnen verlagen als hun capaciteit krap wordt, en daar kom je om 2 uur 's nachts achter).

Ik heb teams dit op de harde manier zien ontdekken. Hun hele product feature breekt omdat een model versie waar ze op gepind zaten wordt uitgefaseerd. Of hun unit economics gaan onderuit omdat een prijswijziging van 30% op het model dat ze gebruiken een winstgevende feature in een verliespost verandert. Of ze kunnen niet uitleveren aan een grote nieuwe klant omdat de regionale beschikbaarheid van de vendor niet matcht met de compliance eisen van de klant.

De oplossing is niet om vendors te vermijden. De oplossing is ze te abstraheren.

Bouw vanaf dag één van elke AI feature je eigen dunne interface voor de model call. Geen zwaar framework, gewoon een functie in je codebase die (prompt, context) neemt en (response) teruggeeft. Achter die interface ondersteun je in development minimaal twee providers, ook al draait er maar één in production. De kosten om dit op dag één te doen zijn misschien een halve dag engineering. De kosten om het later te doen, nadat je 80 prompt-engineered call sites verspreid door je codebase hebt staan, zijn weken.

Dezelfde logica geldt voor embeddings (je vector store zou niet moeten weten welk embedding model de vectors heeft gemaakt, behalve een version tag). Dezelfde logica geldt voor fine-tuning (als je fine-tuned op een vendor, bewaar dan de training data en de eval set, niet alleen de resulterende model checkpoint).

Dit is gewoon hexagonal architecture toegepast op AI. Het feit dat het AI ecosysteem snel beweegt is precies waarom je die abstractie wilt, niet een reden om hem over te slaan.

## De oefening van twee uur die je team kan draaien voor het volgende planningsoverleg

Blok twee uur. Krijg de tech lead, de PM en één senior engineer in één ruimte (of een call). Pak de AI feature waar je over discussieert. Beantwoord deze vier vragen op een gedeeld document. Time-box elke vraag op 25 minuten.

**Vraag 1. Kan een vendor dit voor 80% net zo goed als wij?**

Wees eerlijk. Demo de top twee vendors tegen je echte use case, niet hun standaard demo. Als het antwoord ja is, ligt de bewijslast bij wie wil bouwen. Als het antwoord nee is, schrijf precies op waarom niet. "Onze data is privé" is niet genoeg, vendors handelen dat af. "Ons domein vocabulaire breekt generieke modellen" is een echte reden. "Onze retrieval moet filteren op klant-specifieke metadata die in een generieke vendor over tenants heen zou lekken" is een echte reden.

**Vraag 2. Maakt het onze klanten uit of het een wrapper is?**

Sommige klanten absoluut wel. Enterprise kopers in gereguleerde industrieën zullen vragen welk model je gebruikt, waar het draait, en hoe je garandeert dat de data het niet traint. Consumer-facing producten interesseert het vaak niet, zolang het werkt. SMB B2B klanten zitten ertussenin, het maakt ze uit als een concurrent "onze eigen AI, jouw data blijft bij ons" markt en jij geen antwoord hebt.

Als het antwoord is "het maakt ze niet uit", buy. Als het antwoord is "ja, en we verliezen deals erop", is dat een echte input voor de build case.

**Vraag 3. Wat kost falen ons als we een vendor gebruiken?**

Map de worst case. Vendor ligt vier uur plat. Vendor lekt data via een logging bug (het is bij elke grote gebeurd). Vendor verandert zijn content policy en weigert nu prompts die gisteren werkten. Voor een niet-kritieke feature slik je het en ga je door. Voor een feature op het kritieke pad van een gereguleerde workflow kun je dat niet.

Schrijf de kosten van falen in geld of in verloren klanten op. Als het klein is, wordt de buy case sterker. Als het "we verliezen onze grootste klant en de SLA boete is een bedrag van zes cijfers" is, heb je minimaal multi-vendor nodig en waarschijnlijk een build pad voor het meest gevoelige stuk.

**Vraag 4. Wat gaan de onderhoudskosten over 24 maanden eerlijk gezegd zijn?**

Dit is de vraag waar teams zichzelf voor de gek mee houden. Custom AI is niet "bouwen en vergeten". Het is evals, hertrainen als data verschuift, on-call als het model zich raar gedraagt in production, en stukken herbouwen als de onderliggende open-source library een breaking change uitbrengt. Reken minimaal op 20% van de initiële bouwkosten per jaar als doorlopend onderhoud, vaak meer.

Als je die doorlopende kosten eerlijk gezegd niet kunt dragen, kun je het je niet veroorloven om te bouwen, ook al ziet het upfront rekenwerk er prima uit. Buy en kijk over een jaar opnieuw.

Na de vier vragen heb je een document van één pagina met een verdedigbaar antwoord. Als drie van de vier dezelfde kant op wijzen, heb je je beslissing. Als ze splitsen, heb je een echte keuze te maken en in elk geval maak je hem nu op basis van inputs in plaats van onderbuikgevoel.

## Wanneer je iemand zoals mij erbij haalt om de keuze te maken

Soms splitsen de vier vragen en discussieert je team er al twee maanden over. Soms heb je geen engineer in huis die zowel custom AI als vendor wrappers in production heeft live gezet, en kiest het team op basis van wat ze hebben gezien, niet wat past bij het probleem. Soms weet de CTO het antwoord maar heeft hij een buitenstem nodig om het te bevestigen zodat de rest van het leadership team beweegt.

Dat is het soort werk dat ik doe. Een externe engineer die op beide manieren heeft gebouwd komt meestal in een sprint van een week tot een verdedigbaar antwoord, met de cijfers opgeschreven, de architectuur geschetst, en een build-or-buy aanbeveling die een vraag uit de board overleeft. Het soort production AI werk dat ik heb gedaan kun je zien op [/work](/work), en de vormen van samenwerking op [/services](/services).

Als je team nu vastzit op een specifieke build vs buy keuze, helpt een gesprek van vijftien minuten meestal gratis los. Boek er een op [/contact](/contact). Ik heb liever dat je snel de juiste keuze maakt dan langzaam de verkeerde met een chic framework.

## Verder lezen

- [RAG of fine-tuning: een 20-minuten beslissing](/blog/rag-vs-fine-tuning-decision-flowchart). Wanneer bouwen ook fine-tunen betekent versus retrieven over je eigen data.
- [EU AI Act-checklist voor Nederlandse softwareteams](/blog/eu-ai-act-checklist-dutch-software-teams). Hoe compliance de build vs buy keuze beïnvloedt.
