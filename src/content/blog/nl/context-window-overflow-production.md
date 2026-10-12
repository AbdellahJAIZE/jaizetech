---
title: "Context window overflow: waarom 128K tokens niet genoeg is"
description: "Context window overflow slaat stil toe in productie: frameworks trimmen zonder waarschuwing. Zo meet en budgetteer je tokens per onderdeel."
published: "2026-10-12"
tags: ["context window overflow", "LLM productie", "token budget", "RAG", "LLM observability"]
ogImage: "/images/blog/context-window-overflow-production/cover.jpg"
primaryService: "hardening"
---
Een context window van 128.000 tokens klinkt als het einde van deze categorie problemen. Tel dan eens op wat één productierequest echt meesleept: een system prompt met vijftien tool-schemas eraan vast, acht opgehaalde chunks, zes turns geschiedenis waarvan twee een ruw toolresultaat bevatten, en een gebruikersbericht waarin iemand een leveranciersovereenkomst van 40 pagina's heeft gepakt. Bij ongeveer 600 tot 800 tokens per pagina dichte Nederlandse juridische tekst is die ene paste al 25.000 tokens. Vergelijk drie contracten in één thread en je zit boven de 90.000 voordat het model iets heeft gedaan.

**Context window overflow** in productie gaat zelden over de mediane request. Die mediaan is prima. Het is de p99 die overloopt, en wat het gevaarlijk maakt is dat vrijwel niets in je stack is ontworpen om je te vertellen dat het gebeurt. De request slaagt. Het model antwoordt vloeiend. Het antwoordt alleen op een versie van de input die jij nooit hebt gezien.

Dit is een correctheidsbug die in hetzelfde requestpad woont als je kosten- en latencyproblemen, en daarom wordt hij meestal als iets anders gediagnosticeerd.

## Waarom context window overflow ook bij 128K nog gebeurt

Drie dingen knabbelen aan het geadverteerde getal voordat jij het mag gebruiken.

Het window is gedeeld met de output. Zet je `max_tokens` op 8.000 zodat lange antwoorden niet afgekapt worden, dan heb je 8.000 tokens minder voor input. Bij reasoning-modellen is het erger, want verborgen thinking-tokens komen uit datzelfde outputbudget, en je moet reserveren voor het slechtste geval in plaats van het gemiddelde.

Tokenaantallen verhouden zich niet tot karakters zoals mensen schatten. Engels proza zit rond vier karakters per token. Nederlands, Duits, juridische boilerplate met lange samenstellingen en alles met veel interpunctie doen het merkbaar slechter. OCR-output van een gescande factuur, met layout-artefacten en gebroken tabelcellen, is per pagina de slechtste input die ik regelmatig zie. Komt je schatting uit het woorden tellen in een schoon Engels testbestand, dan is hij te laag voor echt verkeer.

En inputlengte is niet normaal verdeeld. De staart is lang en dik: de pdf van 300 pagina's, de gebruiker die een hele mailthread plakt, de agent die negen keer heeft gelust en negen toolresultaten heeft opgespaard. Je p50 is misschien 4.000 tokens en je p99 120.000. Capaciteitsplanning op de mediaan is precies hoe teams eindigen met een feature die voor 97% van de requests correct is en voor de rest stil fout. Dat is exact de vorm van bug die een demo overleeft.

## De vier plekken waar de tokens vandaan komen

Voordat je iets repareert: meet waar het budget naartoe gaat. In mijn ervaring is dat bijna nooit waar het team denkt.

![Context window overflow: waarom 128K tokens niet genoeg is](/images/blog/context-window-overflow-production/1.jpg)

**System prompt en tool-schemas.** Het prozadeel is meestal een paar honderd tokens en daar maakt niemand zich zorgen over. De JSON-schemas van je tools zijn het deel dat mensen vergeten. Vijftien tools met uitgebreide parameterdocumentatie is makkelijk 3.000 tot 5.000 tokens bij élke call, en het groeit elke keer dat iemand een capability toevoegt. Few-shot voorbeelden wonen hier ook, en die worden tijdens debuggen toegevoegd en nooit meer weggehaald.

**Gespreksgeschiedenis.** Niet alleen de tekst van gebruiker en assistent. Elke eerdere tool-call en het volledige resultaat ervan is een bericht in die geschiedenis. Een agent die drie turns terug je database heeft bevraagd, sleept die hele resultset nog mee.

**Retrieval.** `top_k` is een aantal, geen tokenbudget. Zet je `k=8` met een chunkgrootte van 512 tokens, dan is dat 4.000 tokens op een goede dag. Maar chunk je per documentsectie in plaats van op vaste grootte, dan kan één van die acht "chunks" een bijlage van elf pagina's zijn. Retrieval context limits uitgedrukt in een aantal chunks in plaats van een tokenplafond zijn de meest voorkomende manier waarop een request stil verdubbelt. De rest van het gat tussen dev en productie staat in [waarom je RAG in productie breekt](/blog/rag-breaks-in-production).

**Tool-output.** De grootste enkele boosdoener. Een tool die de ruwe JSON van een API-response, een volledige SQL-resultset of de hele tekst van een opgehaalde pagina teruggeeft, overschaduwt al het andere. Eén ongepagineerde `list_orders` kan 40.000 tokens geneste JSON opleveren waarvan het model er misschien 200 gebruikt.

## De meeste frameworks trimmen in plaats van falen, en ze doen het stil

Dit is het deel dat mensen verrast: de ruwe provider-API's gedragen zich correct. Stuur OpenAI of Anthropic meer tokens dan het model accepteert en je krijgt een 400 terug, met een duidelijke melding over de maximale contextlengte. Dat is een eerlijke failure. Die kun je catchen, loggen en met opzet degraderen.

De stilte wordt geïntroduceerd door de lagen die je voor je gemak hebt toegevoegd.

- Memory-helpers doen exact wat ze beloven. `trim_messages` in LangChain met `strategy="last"` houdt de recentste berichten die passen. De chat memory buffer van LlamaIndex heeft een `token_limit` en gooit weg wat eroverheen gaat. Beide zijn redelijke defaults en beide produceren geen event op applicatieniveau waar je op kunt alerten.
- Zelfgebouwde memory is meestal `messages[-10:]`. Dat is LLM context truncation zonder enig tokenbewustzijn: tien korte turns is niets, tien turns met toolresultaten erin gaat alsnog over het budget.
- Sommige conversation-state API's bieden een automatische truncation-strategie die oudere berichten namens jou weggooit, en sommige gateways hebben een "middle-out" transform die uit het midden van de prompt snijdt. Dat zijn echte features die mensen tijdens een incident één keer aanzetten en daarna vergeten.
- Je eigen code doet het ook. `text[:50000]` in een ingestion-pad is truncation. Een parser die alleen de eerste N pagina's leest ook.

Niets hiervan is een bug in de libraries. Het is een ontwerpkeuze: beschikbaarheid boven correctheid. Een getrimde prompt geeft 200 terug, en een 500 levert een supportticket op. Het probleem is dat de laag die trimt geen idee heeft welke tokens het antwoord bevatten.

## Drie faalmodi, afhankelijk van wat er sneuvelt

Welk symptoom je ziet hangt volledig af van welk onderdeel zijn tokens kwijtraakte, en ze lijken op drie ongerelateerde bugs.

**Geschiedenis weggevallen.** De gebruiker stelde in turn twee een voorwaarde ("alleen leveranciers binnen de EU") en vraagt in turn negen door. Die voorwaarde zit niet meer in de context. Het model antwoordt correct op de vraag zoals hij die nu ziet. Gebruikers beschrijven dit als "de assistent vergeet dingen", en het wordt weggeschreven als een UX-klacht in plaats van een correctheidsdefect.

**Retrieval weggevallen.** De chunk met het antwoord stond op plek zes, het budget paste er vier, en het model viel terug op parametrische kennis. De output is vloeiend, plausibel, specifiek fout en in je logs niet te onderscheiden van een hallucinatie. Dit is de modus die echte schade doet, want hij ondermijnt precies het enige dat RAG zou garanderen: dat het antwoord uit jouw documenten komt.

**Instructies weggevallen.** Als trimmen vooraan snijdt, of als een lange system prompt wordt platgedrukt om ruimte te maken, verlies je opmaakregels, weigeringsregels en toon. De zichtbare versie is dat gestructureerde output breekt: een parser die maanden werkte begint te falen omdat de instructie over het JSON-schema niet meer in de prompt staat. De onzichtbare versie is erger, want je injection- en scope-guardrails zaten in datzelfde blok.

## Hoe stille truncation eruitziet in je logs

Je kunt dit vandaag controleren zonder nieuwe tooling, mits je tokenaantallen per request logt.

Plot een histogram van `prompt_tokens`. Gezond verkeer heeft een lange rechterstaart. Verkeer dat tegen een plafond aanloopt stapelt zich op tegen één waarde en stopt dan abrupt: een verticale muur net onder de 128.000, of net onder welke limiet je trimcode dan ook oplegt. Die muur is de vingerafdruk. Niets natuurlijks produceert hem.

Voeg daarna vier velden toe aan je requestlogs:

- tokenaantal per onderdeel (system, geschiedenis, retrieval, tools, gebruikersinput)
- de opgehaalde chunk-ID's versus de chunk-ID's die daadwerkelijk zijn meegestuurd
- een boolean `truncated` plus welk onderdeel tokens heeft ingeleverd
- `finish_reason`, zodat je input-overflow scheidt van output die bij `length` is afgekapt

De vergelijking tussen opgehaald en verstuurd is de waardevolste. Verschillen die lijsten en log je dat niet, dan kun je truncation achteraf niet van hallucinatie onderscheiden, en ga je een week je retriever tunen om een budgetteringsbug te repareren. De bredere onderbouwing voor dit soort detail per request staat in [AI monitoring in productie](/blog/llm-observability-production-monitoring). Kijk, nu je er toch bent, ook naar de correlatie tussen duimen-omlaag en het percentiel van je prompt tokens. Een feature die alleen bij de langste inputs teleurstelt, heeft geen modelkwaliteitsprobleem.

## Budgetteer per onderdeel, niet één getal voor de hele prompt

De fix is om het context window niet langer te behandelen als één vijver die leeggevist wordt door wie het eerst komt. Wijs hem toe, in volgorde, met ondergrenzen.

python
WINDOW = 128_000
RESERVE_OUTPUT = 8_000          # inclusief reasoning-tokens
SAFETY = 2_000                  # afwijking van de tokenizer-schatting

budget = WINDOW - RESERVE_OUTPUT - SAFETY

system = count(system_prompt) + count(tool_schemas)   # nooit trimmen
budget -= system

user_input = fit(raw_user_input, max_tokens=40_000)   # mag hard falen
budget -= user_input.tokens

retrieval = pack(ranked_chunks, max_tokens=min(12_000, budget * 0.4))
budget -= retrieval.tokens

history = pack_recent(messages, max_tokens=budget)

Vier regels maken dit in de praktijk werkbaar.

Pak retrieval op tokenaantal, niet op `k`. Loop de geranghikte lijst af en voeg chunks toe tot het tokenbudget op is. Je krijgt vier grote chunks of veertien kleine, afhankelijk van wat retrieval teruggaf, en dat is precies wat je wilde.

Maak de system prompt nooit trimbaar. Past hij niet naast een ondergrens voor al het andere, dan is dat een fout bij deploy, geen beslissing op runtime.

Vat tool-output samen voordat die de geschiedenis in gaat. Houd de ruwe payload in je eigen store met een ID dat het model opnieuw kan opvragen. Een orderdump van 40.000 tokens wordt een samenvatting van 300 tokens plus een verwijzing.

Degradeer expliciet als een onderdeel zijn ondergrens niet haalt. Past een document niet, verwerk het dan in secties en voeg samen, wat de manier is waarop serieuze [document-extractiepipelines](/blog/document-intelligence-ocr-llm-extraction) toch al gebouwd worden. Past de geschiedenis niet, vat hem samen en zeg tegen de gebruiker dat je dat hebt gedaan. Een eerlijke melding dat dit document in drie delen wordt verwerkt is beter dan een zelfverzekerd antwoord op pagina 1 tot 40 van 90. En stuur elke keer een metric mee, zodat silent truncation in production een getal op een dashboard wordt in plaats van een mysterie.

Dit goed doen verlaagt meestal ook je rekening, om de redenen die ik opsomde in [de vijf oorzaken van een LLM-kostenpiek](/blog/llm-cost-spike-production). Dicht inpakken en tool-output samenvatten scheelt tokens bij elke request, niet alleen bij de overlopende.

## Wat je vraagt voordat je "hij kan lange documenten aan" accepteert

Beoordeel je een leverancier of review je de implementatie van je eigen team, dan scheiden deze vijf vragen een echt antwoord van een schouderophalen. Ze passen naast de rest van mijn lijst met [technische vragen aan een AI-leverancier](/blog/vet-ai-vendor-before-you-sign).

1. Wat is op dit moment de p99 van het prompt-tokenaantal in productie?
2. Als de input het budget overschrijdt, geeft het systeem dan een fout of trimt het? Als het trimt: welk onderdeel levert als eerste tokens in, en wie heeft die volgorde bepaald?
3. Wordt een truncation-event gelogd en is er een alert op, of wordt het afgeleid?
4. Kun je me voor een specifieke request uit het verleden laten zien welke opgehaalde chunks naar het model zijn gegaan versus welke zijn opgehaald?
5. Wat is het gereserveerde outputbudget, en zitten reasoning-tokens daarin?

Vraag vier levert de meest eerlijke reacties op. De meeste teams kunnen hem niet beantwoorden, en dat gat is het hele probleem.

## Vragen die ik hierover krijg

**Lost een groter context window dit op?**
Het verschuift het plafond, het haalt het niet weg. Long-context modellen zijn nog steeds slechter in het terugvinden van materiaal dat midden in een hele grote prompt begraven zit, je betaalt voor elk token bij elke call, en je staart-inputs groeien mee met de ruimte die je biedt. Budgetteren is goedkoper en voorspelbaarder dan hoofdruimte kopen.

**Geeft de API niet simpelweg een foutmelding als ik te veel stuur?**
De provider-API wel. Jouw applicatie waarschijnlijk niet, omdat een memory-helper, een gateway-transform of een slice in je eigen code de input al had teruggesneden tot iets dat paste voordat hij daar aankwam.

**Hoe onderscheid ik achteraf een hallucinatie van truncation?**
Door de chunk-ID's te loggen die je hebt verstuurd, niet alleen die je hebt opgehaald, en door de exact samengestelde prompt te kunnen replayen. Zonder dat zijn de twee identiek in je logs, en het onderscheid telt omdat de fixes volledig verschillen. Meer over dat uit elkaar trekken in [de veldgids voor hallucinaties](/blog/llm-hallucination-in-production).

**Welk truncation-percentage is acceptabel?**
Stil: nul. Expliciete, gelogde, voor de gebruiker zichtbare degradatie: wat je product kan verdragen, zolang je het meet. Het doel is niet "nooit afkappen", het doel is "nooit afkappen zonder dat iemand het weet".

Staat je feature al live en vermoed je dat de lange requests stil verkeerd zijn, dan is dit standaard Production Hardening-werk: tokenbudgetten per onderdeel instrumenteren, truncation-alerts toevoegen, en herontwerpen hoe geschiedenis, retrieval en tool-output het window delen. Dat loopt drie tot zes weken, afhankelijk van hoeveel van de pipeline herstructurering nodig heeft. De scope staat op de [servicespagina](/services), en wil je doornemen wat jouw logs laten zien, [neem dan contact op](/contact).
