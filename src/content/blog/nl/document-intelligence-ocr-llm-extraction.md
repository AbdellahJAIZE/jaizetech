---
title: "Document intelligence in 2026: OCR plus LLM-extractiepatronen die ik blijf pakken"
description: "Zes patronen voor het extraheren van gestructureerde data uit documenten met OCR en LLM's. Met de tradeoffs die bepalen welk patroon bij jouw use case past."
published: "2026-05-17"
tags: ["document AI", "OCR", "LLM-extractie", "productie-AI"]
ogImage: "/og-image.png"
primaryService: "ai-features"
---

Document intelligence in 2026 is een van die AI use cases die daadwerkelijk opgelost is. Bonnen, facturen, contracten, aanvraagformulieren, lab-rapporten, regelgevende ingediende stukken. Als je een stapel documenten hebt en je hebt de data eruit nodig op een gestructureerde manier, bestaat de technologie en werkt hij. De vraag is welk patroon te gebruiken.

Ik heb document-extractie pipelines gebouwd voor meerdere klanten in de afgelopen twee jaar. Deze post is de zes patronen waar ik op terug blijf komen, met de tradeoffs die bepalen welk patroon bij een gegeven use case past. Geen ervan is nieuw. De meeste teams die ik zie shippen er een. De fout die ik het vaakst zie is het verkeerde kiezen voor het documenttype en de throughput die je daadwerkelijk hebt.

## De zes patronen

Elk patroon combineert een OCR-laag (beelden van tekst omzetten in tekst) met een LLM-laag (ongestructureerde tekst omzetten in gestructureerde velden). De verschillen zitten in hoeveel elke laag doet.

### Patroon 1: Pure LLM met vision-input

Je stuurt het documentbeeld direct naar een multimodale LLM (GPT-4o vision, Claude Sonnet vision, Gemini Pro vision) en vraagt om gestructureerde output.

**Wanneer te gebruiken**: low-volume use cases (onder 1.000 docs per maand) waar documentkwaliteit varieert en je flexibiliteit nodig hebt. Bonnen, facturen, ad-hoc formulier-extractie.

**Kosten**: 0,05 tot 0,30 euro per document afhankelijk van beeldgrootte en output-complexiteit.

**Pros**: simpelste pipeline, geen aparte OCR-stap, behandelt vreemde layouts goed, makkelijk te itereren op de prompt.

**Cons**: duur op schaal, geen granulaire controle over OCR-kwaliteit, inconsistent op edge cases.

### Patroon 2: Toegewijde OCR plus LLM-extractie

Je gebruikt een toegewijde OCR-service (AWS Textract, Google Document AI, Azure Form Recognizer, of Mistral OCR) om tekst plus layout te krijgen. Daarna extraheert een LLM gestructureerde velden uit die tekst.

**Wanneer te gebruiken**: medium volume (1.000 tot 50.000 docs per maand), goed-gestructureerde documenten (facturen, formulieren, bonnen).

**Kosten**: 0,005 tot 0,02 euro per document voor OCR, plus 0,001 tot 0,01 euro per document voor LLM-extractie. Totaal rond 0,01 tot 0,03 euro per document.

**Pros**: 5-30x goedkoper dan pure vision LLM, OCR-laag is volwassen en accuraat, LLM hoeft alleen extractie te doen (het makkelijke deel).

**Cons**: twee-vendor afhankelijkheid, OCR-fouten werken door in extractie-fouten, layout-bewuste OCR heeft tier-limieten.

### Patroon 3: Voorgetraind extractiemodel plus LLM-verificatie

Je gebruikt een model dat specifiek getraind is voor het documenttype (factuur-extractor van AWS Textract, layout-bewuste modellen van Roboflow, tabel-extractors van Camelot) om gestructureerde velden direct te krijgen. Daarna verifieert en herformatteert een LLM de output.

**Wanneer te gebruiken**: hoog volume (50.000+ docs per maand), zeer gestandaardiseerde documenttypes (facturen, bonnen, belastingformulieren).

**Kosten**: 0,002 tot 0,01 euro per document voor de toegewijde extractor, plus minimale LLM-verificatiekosten.

**Pros**: goedkoopste per document op schaal, toegewijde modellen zijn meestal hogere accuratesse dan algemene LLM's op het documenttype waar ze op getraind zijn.

**Cons**: gebonden aan vendor-documentcategorieën, faalt ongracieus op documentvariaties die het model niet gezien heeft.

### Patroon 4: Self-hosted OCR met open-weights LLM-extractie

Je self-host een OCR-model (PaddleOCR, EasyOCR, Tesseract voor simpele cases, Surya voor complexe layouts) en een open-weights LLM (Llama, Mistral, of een fine-tuned kleiner model) voor extractie.

**Wanneer te gebruiken**: data-residency vereisten, high-volume use cases waar vendor-kosten significant worden, of use cases waar de documenten gevoelige data bevatten.

**Kosten**: geamortiseerde infra-kost, kan 0,0005 tot 0,005 euro per document zijn op hoge bezetting.

**Pros**: data verlaat nooit je infrastructuur, voorspelbare kosten op schaal, geen vendor-afhankelijkheid.

**Cons**: serieuze operationele last, open-weights OCR is 1-2 generaties achter op commerciële OCR op complexe layouts, jij bezit het onderhoud.

### Patroon 5: Hybride (OCR + LLM + rule-based post-processing)

OCR levert tekst, LLM levert gestructureerde velden, deterministische regels schonen de output op (valideer datums, normaliseer valuta, check totalen, zoek bekende leveranciers op).

**Wanneer te gebruiken**: business-kritische extractie waar fouten echt geld kosten (factuur-automatisering, declaratieformulieren, schadeafhandeling).

**Kosten**: vergelijkbaar met Patroon 2 voor de AI-delen, plus engineering-tijd voor regel-onderhoud.

**Pros**: meest accuraat, vangt LLM-hallucinaties via deterministische checks, auditeerbaar.

**Cons**: hoogste engineering-kost, regels hebben onderhoud nodig naarmate documentformaten veranderen.

### Patroon 6: Document Q&A (niet extraheren, opvragen)

Je extraheert geen velden vooraf. Je slaat de OCR-output en een embedding-index op. Wanneer een downstream-systeem een veld nodig heeft, vraagt het het document op via RAG.

**Wanneer te gebruiken**: als de set velden die je nodig zou kunnen hebben open-eindig is (juridische contracten, onderzoekspapers, regelgevende stukken), of als de meeste documenten nul of een keer opgevraagd worden na ingest.

**Kosten**: lage ingest-kost (alleen OCR + embedding), betaal per query.

**Pros**: flexibel, geen noodzaak om het schema vooraf te voorspellen, enkele ingest-pipeline voor veel documenttypes.

**Cons**: niet geweldig voor high-throughput herhaalde queries, latency op elke query, moeilijker om uitputtende extractie te garanderen.

## Hoe te kiezen

De beslisboom waar ik teams meestal doorheen loop:

| Vraag | Als ja | Als nee |
|---|---|---|
| Onder 1.000 docs per maand? | Patroon 1 (pure vision LLM) | Ga verder |
| Documenten zijn zeer gestandaardiseerd? | Patroon 3 (voorgetrainde extractor) | Ga verder |
| Data moet on-prem of in EU blijven? | Patroon 4 (self-hosted) | Ga verder |
| Fouten kosten echt geld? | Patroon 5 (hybride met regels) | Ga verder |
| Veld-schema vooraf bekend? | Patroon 2 (OCR plus LLM) | Patroon 6 (document Q&A) |

Dit is een heuristiek, geen formule. Echte keuzes combineren vaak elementen uit meerdere patronen. Het punt is een duidelijk antwoord hebben op "waarom dit patroon" voordat je begint te bouwen.

## De dingen die fout gaan

Veelvoorkomende fouten die ik zie in document-extractie pipelines:

### 1. OCR-fouten die doorwerken in extractie-fouten

Als OCR "1.234,56" verkeerd leest als "I.234,56" (hoofdletter I in plaats van cijfer 1), kan je LLM het extraheren als string in plaats van een nummer. Of erger, een andere waarde hallucineren die plausibel oogt.

Fix: valideer geëxtraheerde velden tegen verwachte types en ranges. Weiger en re-OCR documenten die validatie falen. Track OCR-fout-rates per documenttype.

### 2. Tabel-extractie is moeilijker dan tekst-extractie

Tabellen in PDF's en gescande documenten zijn het enkele moeilijkste deel van document-extractie. Commerciële OCR is beter geworden maar worstelt nog steeds met complexe tabellen (samengevoegde cellen, multi-line entries, headers over pagina's).

Fix: voor tabel-zware documenten, evalueer toegewijde tabel-extractors (AWS Textract's table mode, Camelot voor PDF-tabellen, Unstructured.io's tabel-parser). Pure tekst-OCR gevolgd door LLM-tabel-reconstructie faalt vaak op real-world tabellen.

### 3. Multi-page documenten verliezen context

Een contract van 30 pagina's heeft clausules op pagina 4 die verwijzen naar definities op pagina 1. Als je pagina's onafhankelijk verwerkt, heeft de LLM die extractie doet op pagina 4 geen idee wat de definities betekenen.

Fix: voor multi-page documenten, of (a) neem een samenvatting van het volledige document op in de extractie-prompt, (b) gebruik een long-context model dat alle pagina's kan zien, of (c) tweepass-extractie waar de eerste pass context bouwt en de tweede pass velden extraheert.

### 4. Taal- en locale-problemen

Nederlandse facturen gebruiken komma's als decimaalscheiders (1.234,56). Franse datums zijn DD/MM/YYYY. Amerikaanse facturen zetten valutateken voor het nummer ($100), Nederlandse facturen zetten het erna (100 €). Als je extractor afgestemd was op US-Engelse data, krijgt hij deze stilletjes verkeerd.

Fix: extraheer ruwe strings, normaliseer in deterministische post-processing. Vertrouw de LLM nooit met het correct converteren van locale-specifieke formaten.

### 5. Documentvariaties breken gestandaardiseerde extractors

Je trainde een model op 1.000 facturen van je 20 grootste klanten. Klant 21 begint facturen te sturen met een licht andere layout. Je accuratesse op die klant daalt met 30 procentpunt zonder dat iemand het merkt.

Fix: monitor extractie-confidence en accuratesse per documentbron. Zet alerts wanneer een nieuwe bron lage confidence heeft of wanneer accuratesse van een bestaande bron daalt.

## Wat ik vandaag zou bouwen voor een typisch Nederlands MKB-bedrijf

Als een mid-sized Nederlands bedrijf mij vroeg om factuur-extractie te bouwen voor hun boekhoud-workflow in 2026, hier is wat ik zou bouwen:

1. **Patroon 5 (hybride).** Accuratesse doet ertoe omdat facturen de boekhouding voeden.
2. **OCR**: AWS Textract voor de factuurspecifieke modus (Engels, Frans, Nederlands allemaal redelijk ondersteund).
3. **LLM**: gpt-4o-mini voor extractie, met een strikt JSON-schema en één retry op validatie-falen.
4. **Regels**: valideer BTW-IDs tegen een regex per land, valideer dat totalen kloppen met regel-itemsommen, valideer dat datums in plausibele range zitten, zoek bekende leveranciers op in een kleine database.
5. **Monitoring**: per-leverancier accuratesse-tracking, met alerts wanneer accuratesse daalt of wanneer een nieuwe leverancier verschijnt met lage confidence.

Totale kost per factuur: rond 0,02 tot 0,04 euro. End-to-end accuratesse: 95-99 procent op standaard factuurformaten. Engineering-tijd om te bouwen: 3-4 weken voor de pipeline plus 1-2 weken accuratesse-tuning.

Als je een gestructureerde analyse wilt van welk patroon past bij een specifiek document-extractie probleem waar je aan werkt, dat is het soort ding dat ik doe in een [POC sprint](/services). De output is een werkend prototype op echte sample-documenten plus een aanbeveling voor het patroon dat past bij jouw volume-, accuratesse- en kostenbeperkingen.

Verwante leesstof: [wat een productie-LLM-feature in 2026 echt kost](/blog/cost-of-production-llm-2026) dekt het bredere kostenplaatje voor elke LLM-gebaseerde extractie-pipeline.
