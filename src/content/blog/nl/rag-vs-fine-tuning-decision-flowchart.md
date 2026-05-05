---
title: "RAG of fine-tuning: een 20-minuten beslissing"
description: "Hoe je kiest tussen RAG en fine-tuning. Een beslisstroom van 20 minuten, drie gevallen waarin fine-tuning fout is, en hoe hybride er echt uitziet."
published: "2026-04-29"
tags: ["RAG", "fine-tuning", "LLM", "architectuur"]
ogImage: "/og-image.png"
primaryService: "rag-assistant"
---

De meeste artikelen over "RAG vs fine-tuning" lezen als een Wikipedia-diff. Twee kolommen, voors en tegens, geen mening, je loopt weg met de definities en weet nog steeds niet wat je moet bouwen. Deze post is het tegenovergestelde. Ik geef je een beslisstroom van 20 minuten met drie heldere uitkomsten, en ik vertel je precies wanneer fine-tuning het verkeerde antwoord is (meestal wel) en wanneer RAG alleen niet genoeg is.

Ik bouw nu tweeënhalf jaar RAG-systemen in productie op een hybride Triton-plus-cloudplatform, en een flink deel van mijn werk is klanten uit fine-tuning praten als ze het niet nodig hebben. Dat patroon herhaalt zich vaak genoeg om een flowchart te rechtvaardigen.

## Korte definities, één alinea per stuk

**RAG** (retrieval-augmented generation) laat het model met rust. Bij inference haal je relevante stukken van je data op uit een vector database (of een hybride keyword-plus-vector store), je propt ze in de prompt en je laat het model erover redeneren. De gewichten van het model veranderen nooit. Je verandert alleen wat je ervoor zet.

**Fine-tuning** past de gewichten van het model aan op jouw data. Je neemt een base model, voert het duizenden input-output voorbeelden, en het model leert zich anders te gedragen. Na fine-tunen is het model zelf anders. Het heeft je data niet meer in de prompt nodig om het nieuwe gedrag te produceren, want dat gedrag zit ingebakken.

Dat is het hele onderscheid. De meeste lezers weten dit al. De interessante vraag is niet "wat zijn ze", maar "welke, waarvoor, en wanneer".

## De flowchart van 20 minuten die 90% van de gevallen beslist

Loop deze vijf vragen op volgorde door. Stop bij de eerste die een antwoord geeft.

```
V1. Verandert je kennis vaker dan eens per kwartaal?
    JA   -> RAG. Stop hier.
    NEE  -> ga door.

V2. Is het gewenste outputformaat of de stijl het echte probleem,
    niet de kennis?
    JA   -> Fine-tuning komt in beeld. Ga door naar V3.
    NEE  -> ga door.

V3. Heb je 10.000+ kwalitatief goede, gelabelde voorbeelden
    van het gewenste gedrag?
    NEE  -> Nog niet fine-tunen. Terug naar RAG plus prompt engineering.
    JA   -> ga door.

V4. Is hallucinatie op feiten onacceptabel
    (juridisch, medisch, financieel, support op echte klantdata)?
    JA   -> RAG, met een echte eval harness. Stop hier.
    NEE  -> ga door.

V5. Is de use case smal en repetitief
    (classificatie, extractie, format-locked generatie)?
    JA   -> Fine-tune een klein model. Dit is een van de paar goede gevallen.
    NEE  -> Standaard terug naar RAG. Je hebt waarschijnlijk geen fine-tuning nodig.
```

Dat is het. Vijf vragen, twintig minuten als je eerlijk bent tegen jezelf. Dat eerlijke deel is waar de meeste teams struikelen, want vooral V3 heeft een hoge "we hebben data" faalkans. Data hebben is niet hetzelfde als 10.000 schone, gelabelde voorbeelden hebben van precies het gedrag dat je wilt.

De reden dat deze stroom werkt is dat de twee technieken echt verschillende problemen oplossen. RAG is voor "het model kent mijn spullen niet". Fine-tuning is voor "het model gedraagt zich niet zoals ik nodig heb". Als teams die twee door elkaar halen, grijpen ze naar het verkeerde gereedschap, en ze betalen er twee keer voor (één keer in geld, één keer in maanden).

## Drie use cases waar fine-tuning het verkeerde antwoord is (en mensen het toch proberen)

### 1. Q&A op interne documentatie

Deze komt bijna elke week voorbij. Een team heeft een Confluence wiki, een paar honderd PDF's, wat Notion-pagina's, en ze willen een chatbot die vragen beantwoordt over alles. Iemand in de kamer zegt "we moeten een model fine-tunen op onze docs".

Nee, dat moet je niet. Drie redenen.

Ten eerste, je documentatie verandert. Iemand werkt de onboarding-doc volgende dinsdag bij, en je fine-tuned model weet het niet. Je zou elke keer opnieuw moeten trainen, wat absurd is. RAG pakt het nieuwe document op zodra het geïndexeerd is.

Ten tweede, je hebt citaties nodig. Als de bot zegt "het deployproces is X", wil een engineer kunnen doorklikken naar de bronpagina. Fine-tuned modellen kunnen niet citeren. RAG wel, want de bronchunks staan gewoon in de prompt.

Ten derde, hallucinatie op interne feiten is funest. Als de bot vol vertrouwen een deploystap verzint, is het vertrouwen binnen een week weg. RAG met onderbouwde antwoorden en een "ik weet het niet" fallback is veel veiliger.

### 2. Klantenservice chatbot

Zelfde vorm, ander domein. Het team wil een supportbot die tier-1 tickets afhandelt. Iemand stelt voor om een foundation model te fine-tunen op het historische ticketarchief.

De kennis in die tickets (productgedrag, bekende issues, refundbeleid) hoort in RAG, punt. Het verandert constant. Het enige dat een kleine fine-tune kan rechtvaardigen is **toon en formaat**, bijvoorbeeld het model dwingen om altijd in de brand voice te antwoorden met een specifieke openings- en afsluitstructuur. Zelfs dat is in mijn ervaring 80% van de tijd op te lossen met een goede system prompt en wat few-shot voorbeelden. Een foundation model fine-tunen op je tickets is duur, traag, en geeft je een model dat al verouderd is op de dag dat je het uitlevert.

### 3. "We willen dat onze LLM onze company kent"

Dit is de variant die van niet-technische stakeholders komt, en het betekent altijd RAG. De intuïtie erachter is "het model moet aanvoelen alsof het voor ons werkt", wat een productgevoel is, geen technische eis. Stop je bedrijfskennis in een vector database, haal het op bij elke query, en het model voelt aan alsof het je kent. Het blijft ook accuraat, citeerbaar, en updatable.

Als iemand in de kamer op dit punt nog steeds aandringt op fine-tuning, is de vraag om te stellen, "wat gaat het fine-tuned model specifiek doen dat RAG plus een sterke system prompt niet kan?" Als ze geen antwoord hebben, is het antwoord RAG.

## Twee gevallen waar RAG alleen niet genoeg is

Ik ben niet anti fine-tuning. Er zijn echte gevallen. Hier zijn er twee die ik daadwerkelijk ben tegengekomen.

### 1. Het outputformaat is het product

Sommige outputs hebben een harde structuur die het model elke keer moet volgen. Juridische contractclausules met specifieke nummering en kruisverwijzingen. Stukken in een medisch rapport die op een gereguleerd template gemapt moeten worden. Codegeneratie in een interne niche-DSL waar de grammatica telt en "bijna goed" gewoon fout is.

Voor zulke gevallen brengt prompt engineering je tot misschien 90% formaatnaleving, en dat is niet goed genoeg als de afnemer een andere machine of een toezichthouder is. Een kleine fine-tune op een paar duizend correct geformatteerde outputs brengt je naar 99-plus. Het patroon is **fine-tunen voor formaat, RAG voor feiten**. Het model leert de vorm van de output. De feiten die de vorm vullen komen uit retrieval.

### 2. Domeintaal zo gespecialiseerd dat off-the-shelf embeddings onzin ophalen

Standaard embedding-modellen zijn getraind op algemene webteksten. Ze zijn prima voor de meeste domeinen. Ze vallen om in smalle technische domeinen waar hetzelfde woord heel verschillende dingen betekent, of waar de domeinwoordenschat nauwelijks in de trainingsdata voorkomt. Zeldzame medische sub-specialismen, specifieke deelgebieden van octrooirecht, bepaalde industriële engineering-domeinen.

Als je je docs indexeert en je top-5 retrievals zijn consequent irrelevant terwijl het antwoord duidelijk ergens in het corpus staat, dan zijn je embeddings de bottleneck. De fix is een fine-tuned embedding model of een domain-adapted base model, niet de generator fine-tunen. De meeste teams raken dit nooit. Als jij wel, dan weet je het, want de retrieval-kwaliteit is zichtbaar slecht in je eval.

## Hoe hybride er echt uitziet (en waarom de meeste teams het niet moeten doen)

Hybride betekent, RAG voor de kennis, plus een klein fine-tuned model voor het formaat of de toon van de output. In een schone implementatie blijft de retrieval-pipeline ongewijzigd, en is de generator jouw fine-tuned model in plaats van een base model.

Het werkt. Ik heb het zien werken. Ik vertel je ook dat 80% van de teams die denken hybride nodig te hebben, dat niet hebben. De onderhoudskost is de killer. Je hebt nu twee systemen om gezond te houden, een retrieval-pipeline (embeddings, index, chunkstrategie, reranker) en een fine-tuning pipeline (curatie van trainingsdata, eval, hertraincadans, modelversionering). Elk daarvan is een serieuze engineering-verplichting. Beide goed doen is ruwweg dubbel het werk van er één goed doen.

De eerlijke test voor hybride is dit. Je hebt RAG live. Je hebt een eval harness met minstens 100 representatieve cases. Je kunt in de eval specifieke faalmodi aanwijzen die duidelijk formaat- of toonproblemen zijn, geen kennisproblemen. Je hebt prompt engineering en few-shot geprobeerd om ze te fixen en je raakt een plafond. **Dán** overweeg je hybride. Niet eerder.

Als je RAG nog niet live hebt en je bent al de hybride architectuur aan het plannen, dan ben je aan het over-engineeren. Stop.

## De eval-vraag

Zonder evals werkt RAG niet, en fine-tuning ook niet. Dit is het onsexy deel dat niemand wil horen.

Een eval is een set representatieve inputs met verwacht gedrag, gedraaid op elke wijziging, automatisch gescoord (of semi-automatisch met een LLM-judge die je steekproefsgewijs hebt gecontroleerd). Zonder eval vlieg je blind. Je denkt dat je systeem beter is geworden, je shipt, een gebruiker vindt de regressie, je rolt terug, herhaal.

De volgorde telt. Bouw de eval **voordat** je kiest tussen RAG en fine-tuning. De eval vertelt je hoe "goed" eruit ziet voor jouw use case, en die definitie maakt de RAG vs fine-tuning vraag pas beantwoordbaar. Zonder eval is "is RAG goed genoeg?" niet te beantwoorden, want niemand kan het eens worden over wat "goed genoeg" betekent.

Ik schrijf een aparte post over een minimum-viable RAG eval bouwen. De korte versie nu, 30 tot 100 echte vragen, verwachte antwoorden of verwachte bronnen, draaien op elke promptwijziging, hard falen als de scores zakken.

## Een praktische eerste zet

Begin met RAG. Altijd.

Als je twijfelt tussen de twee, is RAG de veiligere gok voor een eerste versie. De redenen zijn concreet. RAG is sneller te shippen (dagen tot een bruikbaar prototype, geen weken). RAG is goedkoper om over te itereren (verander de prompt, herindexeer, klaar). RAG faalt op leesbare manieren (je kunt de opgehaalde chunks lezen en zien waarom het antwoord fout was). En cruciaal, als RAG onvoldoende blijkt, vertelt je eval je precies welke faalmodi overblijven, en **dan** heb je een echte basis om fine-tuning te kiezen.

De omgekeerde volgorde is veel duurder. Als je begint met fine-tuning, ben je weken bezig met dataprep, je geeft geld uit aan trainruns, je shipt iets, en dan ontdek je dat het echte probleem versheid van kennis of citatie was, geen van beide opgelost door fine-tuning. Vervolgens bouw je alsnog RAG, bovenop een fine-tuned model dat al wegdrijft van je live data. Je hebt twee keer betaald.

Dus de regel, met alle nuances die hierboven al staan, is simpel. Standaard kies je RAG. Gebruik de flowchart om te bevestigen. Grijp pas naar fine-tuning als de flowchart daar duidelijk naar wijst, en overweeg pas hybride als je RAG die live staat plus je echte eval je vertellen dat dat de volgende stap is.

Wil je zien hoe productie-RAG er in de praktijk uitziet, dan heb ik geschreven over mijn [eerdere werk](/work) en de [services](/services) die ik aanbied rond RAG en LLM-architectuur audits.

## Een korte afsluiting

Als je vastzit tussen RAG en fine-tuning voor een specifieke use case, dan is een gesprek van 15 minuten meestal genoeg om het te beslissen. Ik heb deze conversatie vaak genoeg gevoerd dat het juiste antwoord meestal duidelijk wordt zodra we naar je echte data kijken, je updatecadans, en wat "goed" betekent voor jouw gebruikers. Boek er [hier](/contact) een, dan lopen we jouw probleem samen door de flowchart.

## Verder lezen

- [Van CrewAI naar LangGraph: een migratiehandleiding](/blog/crewai-to-langgraph-migration-playbook). Je RAG-agent van prototype naar productie brengen.
- [Build vs buy AI features: de math voor je CTO](/blog/build-vs-buy-ai-features). Wanneer RAG een buy-keuze is en wanneer een build-keuze.
