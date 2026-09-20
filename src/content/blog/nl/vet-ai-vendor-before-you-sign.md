---
title: "AI-leverancier beoordelen: 7 vragen die wrapper-shops ontmaskeren"
description: "Een AI-leverancier beoordelen doe je niet met vragen over prijs of model. Dit script van 30 minuten en de scorekaart onthullen wie echt productie-ervaring heeft."
published: "2026-09-20"
tags: ["AI-leverancier beoordelen", "AI-implementatie", "LLM in productie", "leverancierselectie", "RFP"]
ogImage: "/images/blog/vet-ai-vendor-before-you-sign/cover.jpg"
primaryService: "ai-features"
---
Je hebt drie offertes op tafel. Eén van een bureau met een mooi deck, één van een tweemansstudio die "gespecialiseerd is in LLM-apps", één van een senior freelancer die je RFP beantwoordde met een e-mail van twee pagina's. De prijzen verschillen een factor drie. De doorlooptijden een factor twee. En de technische secties van alle drie de voorstellen zeggen ongeveer hetzelfde: "we integreren een state-of-the-art LLM met jullie data via RAG".

Ik zit aan de andere kant van die calls, en founders vragen me ook regelmatig om erbij te zitten als technisch oor. Een AI-leverancier beoordelen doe je niet met de vragen die kopers stellen. Kopers vragen naar modelkeuze, doorlooptijd en prijs. Die antwoorden zijn makkelijk in te studeren. De vragen die echt onderscheid maken tussen iemand die een LLM-feature in productie heeft gedraaid en iemand die een heel goede demo heeft gebouwd, staan hieronder. Die antwoorden zijn niet in te studeren.

Dit is het script. Het is gebouwd voor een call van 30 minuten, het werkt ook als je zelf niet technisch bent, en het eindigt met een scorekaart die je naast de drie SOW's kunt leggen. Het is ook eerlijk over de uitkomst waarbij het juiste antwoord is: teken niets.

## Het moment: drie leverancierscalls, drie totaal verschillende technische antwoorden

De reden dat de voorstellen op elkaar lijken, is dat elke leverancier dezelfde eerste drie weken beschrijft. Modelintegratie, een vectordatabase, een chat-UI, een demo. Dat deel is bijna commodity geworden: een competente developer heeft in een paar dagen een werkende RAG-assistent of een tool-calling agent draaien. Ik heb eerder geschreven over hoe [een volledige build zeven lagen heeft en de meeste offertes er drie prijzen](/blog/full-ai-feature-build-scope-cost); de vier ontbrekende zijn evals, monitoring, cost- en latency-controle, en de operationele overdracht. Dát zijn de lagen die bepalen of het ding in maand zes nog draait.

De vergelijking die je moet maken is dus niet "wie bouwt de demo het best". Het is "wie is persoonlijk om 3 uur 's nachts gebeld omdat een LLM-feature brak, en wat heeft die daarna veranderd". Dat lees je niet af aan een voorstel. Je hoort het binnen twee minuten in een call, als je het juiste vraagt.

## De ene vraag die wrapper-shops er in twee minuten uitfiltert

Stel deze vraag, en houd dan je mond: **"Vertel me over de laatste AI-feature die jullie hebben opgeleverd en die in productie brak. Wat brak er, hoe kwamen jullie erachter, en wat hebben jullie veranderd?"**

![AI-leverancier beoordelen: 7 vragen die wrapper-shops ontmaskeren](/images/blog/vet-ai-vendor-before-you-sign/1.jpg)

Een leverancier die productie-AI heeft gedraaid, antwoordt met specifieke details, en iets te veel ervan. De retrievalkwaliteit stortte in toen het corpus van de klant van 300 naar 12.000 documenten ging, ze kwamen erachter via een supportticket in plaats van een dashboard, en ze hebben daarna een nachtelijke eval-run tegen een golden set toegevoegd. De tokenkosten gingen in week twee 5x omhoog omdat niemand de gespreksgeschiedenis had begrensd. Een modelprovider veranderde stilletjes het gedrag in een minor version en 4% van de gestructureerde output parste niet meer. De verhalen zijn saai, operationeel en een beetje gênant. Zo ziet echt eruit.

Een wrapper-shop antwoordt op een van drie manieren. "Er is eigenlijk nooit iets echt gebroken, onze builds zijn solide." Of een draai naar een klanttevredenheidsverhaal. Of een generiek antwoord over hallucinaties dat zo uit een blogpost had kunnen komen. Geen van die antwoorden is per se een leugen. Ze vertellen je alleen dat deze leverancier het werk heeft overgedragen in de demofase en nooit heeft gekeken wat er daarna gebeurde. Krijg je zo'n antwoord, dan gaat de rest van de call over de vraag of ze eerlijk zijn over het feit dat ze een build-only shop zijn. Dat is een legitiem ding om te zijn, zolang jij de ontbrekende lagen zelf inprijst.

## Een AI-leverancier beoordelen op evals en monitoring, en hoe een ontwijking klinkt

Het woord "evals" is waar de meeste leverancierscalls stil worden. Vraag het gewoon rechtstreeks: **"Hoe weten we, elke week na de launch, of de feature beter of slechter wordt?"**

Het antwoord dat je wilt heeft drie onderdelen. Een **golden set**: een vaste verzameling echte inputs met afgesproken correcte outputs, idealiter 100 tot 300 cases uit jouw data, niet synthetisch. Een **scoremethode**: exact-match of schema-validatie voor gestructureerde output, een LLM-as-judge met een uitgeschreven rubric voor vrije tekst, en een menselijke steekproef. En een **trigger**: de eval draait bij elke promptwijziging, elke modelupgrade, en op een schema tegen samples uit live verkeer. Ik heb die loop in detail beschreven in [het stuk over continuous eval](/blog/llm-evaluation-production-continuous-eval); een leverancier hoeft mijn versie niet te gebruiken, maar moet er wel een hebben.

Ontwijkingen klinken zo:

- "We testen uitgebreid vóór de launch." Testen vóór de launch is geen evaluatie ná de launch. Het model, de data en de gebruikers veranderen allemaal.
- "We gebruiken GPT-4 / Claude / Gemini, dus de kwaliteit is heel hoog." Modelkeuze is geen kwaliteitsstrategie.
- "Monitoring kunnen we in een latere fase toevoegen." Monitoring die achteraf wordt ontworpen, meet de verkeerde dingen. Vraag wat "fase twee" kost en of het in de offerte zit.
- "We loggen alle gesprekken." Loggen is opslag. Vraag wat een alert afvuurt, en wie die ontvangt.

Vervolg met: **"Hoe ziet het dashboard eruit op dag 30? Noem drie getallen die erop staan."** Een productieleverancier noemt iets als answer-acceptance rate, retrieval hit rate of citation precision, en p95-latency, plus kosten per gesprek. Zijn de drie getallen uptime, aantal requests en aantal gebruikers, dan beschrijven ze een webapp, geen AI-feature.

## Cost control, latency, en wie de pager om 3 uur 's nachts draagt

Drie vragen, in deze volgorde.

**"Wat kost één gesprek bij 1.000 gebruikers per dag, en wat voorkomt dat het 5x zoveel wordt?"** Je wilt een getal met een range, en je wilt een lijst met controls: begrensde contextvensters, samengevatte gespreksgeschiedenis, model routing (een kleiner model voor classificatie en routering, het dure model alleen waar het zijn geld waard is), caching van herhaalde retrievals. Een leverancier die een tokenprijs van de website van de provider pakt en vermenigvuldigt, heeft dit niet in productie gedraaid. In mijn ervaring is de eerlijke range voor een tekst-RAG-assistent een paar cent per gesprek als het goed geëngineerd is en tien keer dat als het dat niet is, en het verschil zit volledig in ontwerpbeslissingen uit de eerste vier weken.

**"Wat is jullie p95-latency-doel, en waar in de pipeline verwachten jullie de tijd te verliezen?"** Het antwoord moet de echte bottlenecks noemen: embedding en retrieval, de wachttijd op het eerste token van het model, eventuele tool calls die de agent achter elkaar doet, en streaming naar de UI. Een leverancier die zegt "het model is snel" heeft niet gemeten. De meeste latency-problemen waarvoor ik word ingeschakeld zitten helemaal niet in het model; het zijn sequentiële tool calls en niet-geïndexeerde retrieval, en ik heb uitgeschreven [hoe je de echte bottleneck vindt](/blog/llm-latency-audit-production) als je hun antwoord daartegen wilt houden.

**"Het is zaterdag, 3 uur 's nachts, maand twee, en de feature geeft rotzooi terug. Wie komt er als eerste achter, wie fixt het, en wat kost mij dat?"** Dit is de vraag die de meeste kopers nooit stellen en de meeste SOW's nooit beantwoorden. Acceptabele antwoorden zijn een gedefinieerd supportvenster met een escalatiepad op naam, een hypercare-periode na de launch met een concrete duur, of een eerlijk "na de overdracht is jullie team eigenaar, en dit doen wij om dat mogelijk te maken". Onacceptabel is stilte, of "we zijn altijd bereikbaar op Slack", want dat betekent dat niemand on-call staat.

## Wat een overdracht moet bevatten vóór je tekent, niet nadat je vastzit

Elke leverancier zegt dat ze "de code overdragen". Code is het minst waardevolle deel van wat je nodig hebt. De feature wordt in het eerste jaar tientallen keren opnieuw geprompt, opnieuw geïndexeerd en opnieuw gedeployed, en als jouw team dat niet veilig kan, huur je de feature van de leverancier, of het contract dat nu zegt of niet.

Overdracht, als deliverables opgenomen in de SOW, moet bevatten:

- **Prompt-versiebeheer met regressietests.** Prompts staan in version control, elke wijziging draait de golden set, en een verschil in scores blokkeert de deploy. Heeft de leverancier dit niet, dan [veroorzaken promptwijzigingen stille regressies](/blog/prompt-versioning-regression-testing) binnen weken na hun vertrek.
- **De eval-harness zelf, draaibaar door jouw team.** Eén commando, een rapport, geen leveranciersaccount nodig.
- **Infrastructure as code en een gedocumenteerde deploy.** Geen Notion-pagina; een script dat iemand van jouw team minstens één keer heeft uitgevoerd terwijl de leverancier toekeek.
- **Een runbook voor de vijf meest waarschijnlijke incidenten.** Retrieval geeft niets terug, storing bij de modelprovider, kostenpiek, output-schema faalt, databron veranderde van vorm. Elk met een detectiesignaal en een eerste actie.
- **Toegang en eigendom.** Elke API-key, elk modelprovider-account, elke vectordatabase en elke observability-tool staat vanaf dag één op naam van jouw organisatie. Ik heb een bedrijf twee weken productie zien verliezen omdat het OpenAI-account op het e-mailadres van een vertrokken contractor stond.
- **Een kennisoverdrachtsessie met jouw engineers, opgenomen.** Minimaal een halve dag voor alles wat agentic is.

Vraag de leverancier om je door de laatste overdracht te leiden die ze hebben gedaan. Is de beschrijving "we hebben de repo gedeeld en een call gedaan", dan weet je nu wat je koopt.

## Vijf antwoorden die zelfverzekerd klinken maar red flags zijn

**"We zijn framework-agnostisch, we kunnen LangChain, CrewAI, wat jullie maar willen."** Klinkt flexibel. Betekent eigenlijk dat ze geen mening hebben, wat betekent dat ze zich nog nooit gebrand hebben. Iedereen die agents in productie heeft gedraaid, heeft sterke opvattingen over [welke frameworks het overleven](/blog/agent-frameworks-2026-what-survives-production) en vertelt je wat ze zouden weigeren te gebruiken.

**"We fine-tunen het model op jullie data voor maximale nauwkeurigheid."** Voor de meeste zakelijke features is dit de verkeerde eerste stap; RAG plus goede retrieval brengt je verder, sneller, en blijft bij te werken. Een leverancier die opent met fine-tuning verkoopt óf GPU-uren, óf heeft niet gevraagd hoe jouw data er eigenlijk uitziet.

**"Hallucinaties zijn met de nieuwste modellen eigenlijk opgelost."** Dat zijn ze niet. Ze worden beheerst met grounding, citaties, weigerpaden en evals. Dit antwoord vertelt je dat de leverancier in productie verrast gaat worden.

**"AVG regelen we door de EU-regio te gebruiken."** Regio is één regel van een langer antwoord. Vraag naar verwerkersovereenkomsten, retentie aan de kant van de provider, PII in logs, en wat er gebeurt met de inhoud van ge-embedde documenten. Kunnen ze dat niet beantwoorden, dan stopt jouw DPO de launch, niet de leverancier.

**"Vaste prijs, vaste scope, zes weken, alles inbegrepen."** Voor een volledige build is een harde vaste prijs voor alle zeven lagen, voordat iemand jouw data heeft gezien, een teken dat de leverancier in week vier gaat heronderhandelen. De geloofwaardige variant is een vaste prijs voor een scopingfase, daarna een bouwprijs met benoemde aannames. Het is prima om dat te vergelijken met de [routes bureau, freelancer en senior engineer](/blog/ai-feature-mvp-netherlands-build-options); vergelijk alleen wel appels met appels.

## Een callscript van 30 minuten en een scorekaart van één pagina die je kunt hergebruiken

Doorloop dit in deze volgorde. Stuur de vragen niet vooraf op; het punt is om te horen hoe ze denken, niet hoe ze schrijven.
0-2 min   Context: één zin over jouw feature en jouw gebruikers.
2-6 min   "Laatste AI-feature die in productie brak: wat, hoe ontdekt, wat veranderd?"
6-12 min  "Hoe weten we wekelijks of het beter of slechter wordt?"
          "Noem drie getallen op het dashboard van dag 30."
12-18 min "Kosten per gesprek bij 1.000 gebruikers/dag; wat voorkomt 5x?"
          "p95-doel en waar verlies je de tijd?"
18-22 min "Zaterdag 3 uur 's nachts, maand twee, rotzooi als output. Wie ontdekt het, wie fixt, wat kost het mij?"
22-27 min "Leid me door jullie laatste overdracht. Wat draaide het team van de klant zelf op dag één?"
27-30 min "Wat zou jullie doen zeggen dat ik dit niet moet bouwen?"

Die laatste vraag telt. Een senior engineer heeft eerder klanten een build uitgepraat, en vertelt je daarover. Ik heb dat gedaan; ruwweg één op de vier scopinggesprekken die ik voer eindigt met "dit is een zoekfilter en een SQL-query, geen AI-feature", en de discipline van [pilot naar productie scopen](/blog/ai-pilot-to-production-scoping) bestaat precies om dat vóór de SOW te vangen. Een leverancier die nog nooit nee heeft gezegd, verkoopt capaciteit, geen oordeel.

Geef elke leverancier 0, 1 of 2 punten op zeven regels:

1. **Productiefaalverhaal** – specifiek, operationeel, en gevolgd door een concrete verandering.
2. **Evals** – golden set uit echte data, scoremethode, triggers op prompt- en modelwijziging.
3. **Monitoring** – drie AI-specifieke getallen, een alert, een ontvanger.
4. **Cost control** – een range per gesprek en benoemde ontwerpcontrols.
5. **Latency** – een p95-doel en een geloofwaardig verhaal over waar de tijd heen gaat.
6. **Eigenaarschap na de launch** – een escalatiepad op naam, of een eerlijke, geprijsde overdracht.
7. **Overdrachtsdeliverables** – geversioneerde prompts, draaibare evals, IaC, runbook, accounts op jouw naam.

Veertien is het maximum. In mijn ervaring is alles vanaf 11 een leverancier die productie-AI heeft gedraaid, en kun je met vertrouwen over de prijs onderhandelen. Zeven tot tien is een goede bouwpartij; koop de build, en budgetteer apart voor hardening en operations, met open ogen. Onder de zeven wordt de demo prachtig en is de feature vanaf maand twee jouw zorg om in leven te houden.

En als alle drie onder de zeven uitkomen en de laatste vraag je deed beseffen dat de feature dunner is dan het deck suggereerde, dan is de juiste zet om dit kwartaal niets te tekenen, een week goed te scopen, en opnieuw de markt op te gaan met een scherpere RFP. Dat is een goedkopere uitkomst dan elk van de drie SOW's.

## Waar dit een opdracht wordt

Als de scorekaart je vertelt dat je een senior engineer nodig hebt die de feature end-to-end eigenaar is, inclusief de evals, monitoring, cost controls en overdracht die de meeste offertes weglaten, dan is dat wat een Full Build is: zes tot twaalf weken, de AI-feature en het product eromheen, gebouwd en overgedragen door één persoon die er eerder voor gebeld is. De scope en hoe die naast de andere opdrachten past staat op de [dienstenpagina](/services), en wil je een tweede technisch oor bij je leverancierscalls voordat je tekent, [neem dan contact op](/contact) en we lopen de scorekaart samen door.
