---
title: "Wat een productie-LLM-feature in 2026 echt kost"
description: "Tokenuitgaven zijn de kleinste post op de rekening. Hier zijn de verborgen kosten van een LLM-feature live brengen, met cijfers uit echte systemen."
published: "2026-04-10"
tags: ["LLM-economie", "productie-AI", "AI-engineering", "kosten"]
ogImage: "/og-image.png"
primaryService: "hardening"
---

Elke CTO met wie ik de afgelopen zes maanden gesproken heb stelt dezelfde vraag. Wat kost dit nou echt om te draaien? Niet de OpenAI-factuur. Het geheel.

Het eerlijke antwoord is dat tokenuitgaven de kleinste post zijn. Eval-runs, monitoring, modelupgrades van vendors, on-call uren en de rate-limit dans kosten samen meer dan de API-aanroepen in de meeste productiesystemen die ik gezien heb. Deze post breekt elke kostenpost uit, met cijfers uit echte systemen die ik gebouwd of geauditeerd heb.

Als je een productie-LLM-feature voor het komende kwartaal budgetteert, bewaar deze pagina.

## De kostenposten die niemand op de slide zet

Zes kostencategorieën die opduiken in een productie-LLM-rekening. Elk eentje is makkelijk te missen in een bouwschatting.

### 1. Tokenuitgaven inclusief retries

De voor de hand liggende. Prompt-tokens plus completion-tokens, vermenigvuldigd met je verkeer.

Wat niet voor de hand ligt is de retry-overhead. Rate-limits van vendors, transiënte 5xx, parse-fouten op slecht-gevormde JSON, agent-loops die timeouten. In één audit op een chatbot met 80.000 sessies per maand was retry-overhead 18 procent van het totale spendbedrag. Achtduizend euro per maand verspild aan retries die op poging twee of drie slaagden. Elke retry rekent de tokens opnieuw af.

Ruwe cijfers voor een mid-tier chatbot in 2026: 4.000 tokens per sessie gemiddeld. Tegen gpt-4o-mini tarieven is dat rond de 0,0006 euro per sessie. 80.000 sessies per maand is 48 euro pure API. Klinkt geweldig. Tel daar 18 procent retry-overhead bij op en je zit op 57 euro. Nog steeds goedkoop.

Maar dit is het kleinste cijfer op de rekening. Wacht maar op de rest.

### 2. Eval-runs

Hier wordt het duur.

Elke prompt-wijziging draait de eval-suite opnieuw. Elke modelversie-wijziging draait de eval-suite opnieuw. Elke wekelijkse QA draait de eval-suite opnieuw. Als je eval-set uit 200 voorbeelden bestaat en elk neemt 4.000 tokens, kost één volledige run ongeveer 0,20 euro tegen gpt-4o-mini tarieven. Veertig runs per maand uit actieve ontwikkeling is ongeveer 8 euro. Goedkoop.

Maar als je evalueert met een sterker model dan je serveert (een veelvoorkomend patroon, je serveert gpt-4o-mini en evalueert met gpt-4 of Claude Sonnet), zijn de kosten per call 10 tot 30 keer hoger. Diezelfde 40 runs worden 80 tot 240 euro per maand.

Als je naar een frontier model overstapt voor evaluatie, reken het expliciet mee. De meeste teams vergeten dit tot de rekening binnenkomt.

### 3. Monitoring stack

Je hebt iets nodig dat je LLM-aanroepen in de gaten houdt. Opties in 2026, met ruwe maandkosten op de 80.000-sessieschaal:

- Helicone of Langfuse self-hosted: 0 euro plus je infra
- Helicone of Langfuse cloud: 30 tot 200 euro afhankelijk van tier
- Datadog APM met LLM observability addon: 200 tot 600 euro
- Eigen logging naar je eigen warehouse: gratis qua tooling, 1 tot 2 dagen engineering per maand om te onderhouden

De meeste teams onderbudgetteren dit. Ze beginnen met ruwe logs in Postgres en ontdekken drie maanden later dat ze geen manier hebben om te beantwoorden "wat was onze parse-failure rate vorige week" zonder custom queries te schrijven.

### 4. Vendor-modelupgrades die hertests forceren

OpenAI haalt een model uit roulatie. Anthropic brengt een nieuwe uit. De frontier beweegt en jij moet je prompts hertesten tegen de nieuwe versie omdat de oude eruit gaat.

Dit is geen terugkerende maandkost. Het is een kwartaalbelasting. Reken op één tot drie dagen gerichte engineering per kwartaal om te hertesten, over te zetten en eventueel je prompt opnieuw af te stemmen op het nieuwe model. Tegen een engineerstarief van 100 euro per uur is dat 800 tot 2.400 euro per kwartaal. Ruwweg 267 tot 800 euro per maand geamortiseerd.

Dit is de kostenpost die finance-teams overvalt. Hij staat op geen enkele vendorfactuur. Hij verschijnt als "waarom daalt onze engineering velocity in Q3".

### 5. On-call dekking

Als je LLM-feature in het kritieke pad van een betalende klantervaring zit, moet iemand wakker worden als het breekt. Dat betekent PagerDuty of equivalent (50 tot 100 euro per maand voor een klein team), plus de daadwerkelijke engineering-uren.

Realistisch incident-tempo in de eerste zes maanden in productie: één klein incident per week, één groot per maand. Klein is 30 tot 60 minuten triage. Groot is 3 tot 6 uur gericht werk plus een writeup. Tegen 100 euro per uur is dat ruwweg 400 tot 800 euro per maand alleen aan incident-responskosten.

Dit daalt na zes maanden naarmate je het systeem hardt, maar het gaat nooit naar nul.

### 6. De infrastructuur rond de LLM-aanroep

Vector database voor RAG. Queue voor async processing. Cache voor herhaalde calls. File storage voor uploads. CDN voor outputs die naar gebruikers gestuurd worden. Elk heeft kosten.

Ruwe maandcijfers voor een mid-tier RAG-applicatie:

- Vector DB (Pinecone serverless of Qdrant cloud): 30 tot 150 euro
- Redis cache: 20 tot 80 euro
- Queue (SQS of BullMQ op Redis): 0 tot 30 euro
- File storage (S3): 5 tot 50 euro
- CDN: 10 tot 100 euro afhankelijk van verkeer

Makkelijk 65 tot 410 euro per maand voor de omringende infrastructuur. Vaak meer dan de API-calls.

## Uitgewerkt voorbeeld, drie systeemvormen

Om het concreet te maken, hier wat drie productie-grade LLM-features kosten per maand op schaal. Alle cijfers zijn ruwe schattingen uit systemen die ik geauditeerd of gebouwd heb, met de organisatiedetails geabstraheerd.

### Kleine chatbot, 80.000 sessies per maand

- API-tokens inclusief retries: 60 euro
- Eval-runs met frontier model: 250 euro
- Monitoring (Helicone cloud): 80 euro
- Kwartaal-vendorupgrade amortisatie: 400 euro
- On-call (PagerDuty plus engineer-tijd): 500 euro
- Infra rondom (cache, storage, CDN): 80 euro

**Totaal: ~1.370 euro per maand.** Waarvan API-calls 4 procent.

### Mid-tier RAG knowledge base, 12.000 queries per maand, 8.000 documenten geïndexeerd

- API-tokens inclusief retries: 200 euro
- Eval-runs: 300 euro
- Monitoring: 100 euro
- Vendorupgrade amortisatie: 500 euro
- On-call: 800 euro
- Infra (vector DB, cache, storage): 200 euro
- Re-indexering pipeline runs: 100 euro

**Totaal: ~2.200 euro per maand.** Waarvan API-calls 9 procent.

### Multi-step agent, 3.000 sessies per maand, gemiddeld 8 LLM-calls per sessie

- API-tokens inclusief retries en loop-overhead: 600 euro
- Eval-runs (duurder omdat agent-paden complex zijn): 600 euro
- Monitoring inclusief trace-opslag: 250 euro
- Vendorupgrade amortisatie: 600 euro
- On-call (agents falen op interessantere manieren): 1.200 euro
- Infra: 200 euro

**Totaal: ~3.450 euro per maand.** Waarvan API-calls 17 procent.

## Waar je kunt snijden zonder dingen te breken

Het patroon is hetzelfde over alle drie de vormen. De grote uitgaven zijn operationeel, niet rekenkundig. Dus de bezuinigingen die echt verschil maken zijn ook operationeel.

**Snij in eval-frequentie, niet in eval-kwaliteit.** Draai de volledige suite wekelijks en bij prompt-wijzigingen, niet bij elke commit. Dezelfde dekking voor de helft van de kosten.

**Stem je monitoring goed af.** Als je minder dan 100.000 calls per maand hebt, doet self-hosted Langfuse op een kleine VPS alles wat Datadog doet voor jouw use case. Het verschil van 100 euro per maand is op kleine schaal het verschil tussen winstgevend en niet.

**Pin je modellen.** Snapshot modelversies waar de vendor het toelaat. Pinnen betekent geen verrassende kwartaal-hertestbelasting. De kost is dat je kleine verbeteringen mist, wat de meeste teams kunnen verdragen.

**Verlaag je retry-rate met concurrency-control aan je edge.** Ik beschreef dit in [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production). Een queue met een per-seconde rate-limit doodt 90 procent van retries.

**Voor agents, harde cap op turns en budget.** De meeste agent-runaway is een enkele ambigue query die 40 turns lang ronddraait tegen 0,6 euro per turn. Cap op 8 tot 12 turns en je worst case is begrensd. Cap budget per sessie als backstop.

**Cache veelvoorkomende antwoorden.** Vooral voor chatbots zijn de top 200 vragen verantwoordelijk voor 40 tot 60 procent van het verkeer in de meeste systemen. Een Redis-cache die bijna-duplicate queries herkent via embedding-similariteit verdient zich in weken terug.

## Wat dit betekent voor budgettering

Als een vendor je pitcht op "AI-features voor 50 euro per maand aan API-kosten", citeert hij de kleinste post op de rekening. Vermenigvuldig met 20 tot 30 om de echte operationele kost te krijgen. Dat is wat productie-grade betrouwbaarheid daadwerkelijk kost.

Een handige vuistregel voor het budgetteren van een nieuwe LLM-feature in 2026: neem de API-schatting, vermenigvuldig met 25, en dat is je maandelijkse run-rate in het eerste jaar. Pas naar beneden aan naarmate je het systeem in maanden vier tot en met twaalf hardt.

Als je hulp wilt bij deze analyse op een feature die je op het punt staat te shippen, dat is onderdeel van wat ik doe in een [AI-integratie-audit](/services). De output is een cijfer dat je voor je CFO kunt leggen met het rekenwerk erbij.

De grootste fout die ik zie is teams die LLM-features behandelen als software die toevallig een API-call heeft. Het is software die toevallig een operationeel oppervlak heeft dat de meeste engineering-teams nog nooit gerund hebben. Dat oppervlak is waar de rekening daadwerkelijk woont.
