---
title: "Multi-tenant AI data isolatie: waar je RAG-stack echt lekt"
description: "Multi-tenant AI data isolatie gaat verder dan row-level security. Dit zijn de vier plekken waar cross-tenant lekken écht ontstaan, met checklist en test."
published: "2026-10-06"
tags: ["multi-tenant AI", "data isolatie", "RAG", "AI-beveiliging", "AVG"]
ogImage: "/images/blog/multi-tenant-ai-feature-data-leaks/cover.jpg"
primaryService: "hardening"
---
De database heeft row-level security. Elke API-handler checkt `tenant_id`. Iemand heeft het nagekeken, afgetekend en is doorgegaan. Daarna heeft het team een AI-assistent bovenop diezelfde data gezet, en minstens twee van de nieuwe paden waarlangs klantcontent nu reist gaan volledig om de databaselaag heen. **Multi-tenant AI data isolatie** is niet het probleem dat je al in je ORM hebt opgelost. Het is een apart probleem met zijn eigen oppervlakken: een vector-index, een cache, een system prompt, een trace viewer en een trainingsset.

Ik word hiervoor op een voorspelbaar moment gebeld. Klant één is een paar maanden live en alles gaat goed. Klant twee tekent, klant drie zit in de pipeline, en iemand stelt tijdens de security review de voor de hand liggende vraag: kan de assistent van klant twee ooit data van klant één naar boven halen? Het eerlijke antwoord vanuit engineering is meestal "dat zou niet moeten," en dat is niet hetzelfde antwoord, en iedereen in de ruimte weet dat.

Hieronder staat de checklist die ik afloop, in de volgorde waarin de lekken daadwerkelijk ontstaan.

## "Het is maar een prompt" is waar het denken stopt

De reden dat cross-tenant datalekken in AI-features onderschat worden, is dat de feature stateless lijkt. Er komt een request binnen, je bouwt een prompt, je roept een model aan, je geeft tekst terug. Geen nieuwe tabellen, geen nieuwe joins, niets wat opduikt in een schema review.

Maar een RAG-assistent of een agent is niet stateless. Hij schrijft. Hij schrijft embeddings naar een gedeelde index, gespreksamenvattingen naar een memory store, request- en response-bodies naar een trace, genormaliseerde queries naar een cache, en soms zorgvuldig gekozen voorbeelden naar een prompt-template die elke tenant vervolgens deelt. Elk van die writes is een nieuwe kopie van klantdata die buiten de grens leeft die je database afdwingt, in een store die vaak helemaal geen begrip van tenants heeft.

De tweede reden is eigenaarschap. Row-level security is opgezet door degene die de datalaag beheerde. De vector store is opgetuigd door degene die aan de AI-feature prototypeerde, meestal met haast, meestal met de documenten van één klant erin omdat er maar één klant was. Die index ging daarna naar productie zonder dat iemand de aanname waaronder hij gebouwd was opnieuw tegen het licht hield.

## De vier plekken waar multi-tenant AI data isolatie echt faalt

In de audits die ik heb gedaan zit het lek in één van vier lagen. De verdeling is niet gelijk. Retrieval en observability zijn samen verantwoordelijk voor het grootste deel van wat ik vind.

![Multi-tenant AI data isolatie: waar je RAG-stack echt lekt](/images/blog/multi-tenant-ai-feature-data-leaks/1.jpg)

**1. Retrieval.** Vector store tenant isolatie wordt doorgaans geïmplementeerd als een metadata-filter, en metadata-filters zijn makkelijk subtiel verkeerd te krijgen. Drie faalmodi die ik blijf zien. Het filter wordt ná de retrieval toegepast in plaats van als pre-filter, dus je haalt `top_k = 20` op over alle tenants heen, gooit de vreemde eruit, en levert wat overblijft. Hybrid search is de klassieker: de dense kant draagt het filter, de BM25- of keyword-kant is later door iemand anders toegevoegd en doet dat niet. En reindex-jobs, die doorgaans als script worden geschreven in plaats van als applicatiecode, bouwen vectoren vaak opnieuw op zonder het tenant-veld mee te nemen, waardoor je filter stilletjes niets matcht of alles matcht, afhankelijk van hoe je store met een ontbrekende key omgaat.

**2. De prompt.** Shared system prompt risk komt in twee varianten. De eerste is few-shot voorbeelden die tijdens het prototypen uit echte klanttickets zijn getrokken en nooit door synthetische zijn vervangen. De escalatie van klant A over een specifiek factuurgeschil wordt een permanent voorbeeld in de prompt die elke tenant krijgt, en een voldoende nieuwsgierige gebruiker krijgt het model zover dat het die oplepelt. De tweede is caching. Draai je een semantische cache voor het model, gekeyed op een genormaliseerde vraagstring, dan raken twee tenants die vragen "wat is ons restitutiebeleid voor enterprise-plannen" dezelfde entry, en krijgt de tweede het antwoord van de eerste. Ik heb precies dat key-schema meer dan eens in productie gezien, omdat het prachtig test met één klant.

**3. De tool- en credentiallaag.** Dit is de stille. Als een agent een tool aanroept, onder welke identiteit draait die tool dan? In veel implementaties is het antwoord een service account met brede leesrechten, omdat het doorgeven van het token van de eindgebruiker door een tool-calling loop irritant werk is en het prototype moest werken. Je database heeft nog steeds row-level security. De agent is alleen geauthenticeerd als een rol die daarvan is uitgezonderd. Niets in de SQL-laag is kapot, en de isolatie is toch verdwenen.

**4. Alles stroomafwaarts.** Traces, logs, eval-sets en fine-tunes. Een trace in je LLM-observability-tool bevat de volledige opgehaalde context en de volledige response, dus klantcontent, in een project dat je hele engineeringteam kan lezen en waar support-engineers tijdens een incident soms toegang tot krijgen. Eval-datasets worden gebouwd uit echt productieverkeer en daarna gedeeld met een externe partij of in de playground van een modelleverancier geplakt. En heeft iemand gefinetuned op gepoolde tenant-data, dan is dat geen lek dat je kunt patchen, want de data zit in de weights.

## Een copilot die klant B antwoordde met de tickets van klant A

Hieronder een hypothetische casus die de vorm heeft van wat ik aantref, samengesteld uit de patronen hierboven en niet uit één specifieke opdracht.

Een B2B SaaS-bedrijf bouwt een support-copilot. Hij haalt op uit de eigen historische tickets en kennisbank van de klant en schrijft een conceptantwoord voor de agent. Klant A, een logistiek bedrijf, gaat als eerste live. Zesduizend tickets geïndexeerd, iedereen tevreden.

Klant B komt vier maanden later aan boord. Het team voegt een `tenant_id`-veld toe aan de metadata van de vector store en een filter in de retrieval-call. Ze testen het: stel de copilot van klant B een vraag die specifiek over klant A gaat, krijg niets terug. Isolatie bevestigd, live.

Drie dingen waren waar die de test niet ving. De zesduizend tickets van klant A zijn geïndexeerd voordat het `tenant_id`-veld bestond, dus die vectoren hebben geen tenant-key. De store behandelt een ontbrekende key als "matcht het filter niet," en dat is precies waarom de test slaagde. Een maand later draait er een reindex-job om het embedding-model te upgraden, en die job schrijft expliciet `tenant_id: null` in plaats van het veld weg te laten. Nu verandert de filtersemantiek, want `null` vergelijkt in deze store anders dan afwezig. Ondertussen draagt de concept-prompt nog steeds twee few-shot voorbeelden uit de tickets van klant A, inclusief een genoemde geadresseerde en een schadebedrag.

Wekenlang merkt niemand het, omdat het lek geen error produceert. Het produceert een iets beter antwoord. Een supportmedewerker bij klant B krijgt een conceptantwoord dat verwijst naar een uitzonderingsproces voor verzendingen dat ze niet hebben, neemt aan dat het een hallucinatie is, haalt het eruit en gaat door. Dat is het venijnige aan cross-tenant data leakage in AI-features: de faalmodus is niet te onderscheiden van de faalmodus die iedereen toch al verwacht. Je gebruikers zijn getraind om verkeerde content te interpreteren als modelfout. Een deel ervan is dat niet. Ik heb eerder apart geschreven over waarom [RAG dat in dev werkt in productie breekt](/blog/rag-breaks-in-production), en tenant-drift in de index hoort op die lijst.

## De checklist vóór tenant nummer twee live gaat

Werk van boven naar onder. De meeste teams vinden iets in de eerste vier punten.

- **Bewijs het pre-filter.** Controleer dat je vector store het tenant-filter toepast vóór de ANN-search, niet erna. Lees de docs van de client library, niet je aanname. Check daarna wat je store doet met een document zonder tenant-veld, en wat hij doet met een expliciete null.
- **Tel je vectoren per tenant.** Draai een aggregatie over de index, gegroepeerd op `tenant_id`. Tellen die aantallen niet op tot je totale vectoraantal, dan heb je verweesde documenten. Dit kost vijf minuten en vindt precies het probleem hierboven.
- **Audit elk retrieval-pad.** Dense, sparse, hybrid, reranker, de "gerelateerde artikelen"-sidebar die iemand op een vrijdag heeft opgeleverd, de eval-harness. Elk pad heeft het filter nodig. Grep op de methodenamen van je retrieval-client en lees elke call site.
- **Lees je system prompt hardop voor.** Elk voorbeeld, elk stuk inline context. Komt er iets van een echte klant, vervang het dan door synthetische content die hetzelfde formaat afdekt.
- **Zet de tenant in elke cache key.** Semantische cache, response cache, samenvattingscache, embedding-cache als die tekst bewaart. De tenant-identifier gaat in de key zelf, niet in een filter op het resultaat.
- **Volg de tool-credentials.** Stel voor elke tool die je agent kan aanroepen vast onder welke identiteit hij uitvoert. Is dat een servicerol, dan leeft je isolatiegarantie in je prompt, en dat betekent dat hij niet bestaat.
- **Scope de memory store.** Gespreksgeschiedenis, gebruikersprofielen, geleerde voorkeuren en samenvattingen. Dezelfde vraag als bij de vector store: is de tenant deel van de primary key, of deel van een filter dat iemand moet onthouden te schrijven?
- **Redigeer op de trace-grens.** Bepaal wat je observability-laag mag bewaren. Volledige prompt- en response-content over tenants heen, leesbaar voor het hele team, is een beslissing die je bewust hoort te nemen in plaats van by default. [Monitoring die je in productie echt helpt](/blog/llm-observability-production-monitoring) vereist niet dat je ruwe klantcontent onbeperkt bewaart.
- **Schrijf op waar de data heen is gegaan.** Modelleveranciers, eval-tooling, trace-vendors en elke fine-tune. Dit is ook het register dat je wil hebben als de FG van een klant ernaar vraagt, en het sluit direct aan op de [AVG-vragen rond het sturen van bedrijfsdata naar een modelleverancier](/blog/company-data-openai-gdpr-netherlands).

## De isolatietest die bijna niemand draait

Een eenmalige handmatige check bewijst niets over de reindex van volgende maand. Wat je wil is een geautomatiseerde test die hard faalt.

Plant een sentinel. Voeg voor elke tenant in een staging-omgeving één document toe met een unieke, betekenisloze string die nergens anders voorkomt:
TENANT_SENTINEL_7f3a9c2e_ACME
TENANT_SENTINEL_b81d4e60_NORTHWIND

Dan de test: draai voor elke tenant een set queries die hard naar de content van de andere tenants trekt, en assert dat geen enkele opgehaalde chunk, geen enkele prompt die naar het model gaat en geen enkele response ooit de sentinel van een andere tenant bevat. Assert op de prompt, niet alleen op de output, want een model dat vreemde context binnenkreeg en besloot die niet te gebruiken is al gefaald.

Draai hem op drie manieren. Sequentieel, wat filterbugs vangt. Gelijktijdig met twintig parallelle requests over tenants heen, wat request-scoped state vangt die in werkelijkheid process-scoped is, een verrassend veelvoorkomende bug in async handlers waar de tenant-context op een gedeeld object wordt gezet. En nog eens direct na je reindex-job, want daar zal de regressie uiteindelijk vandaan komen. Zet alle drie in CI en laat deploys erop afketsen.

De concurrency-run is degene die wordt overgeslagen, en het is degene die de ergste klasse bugs vangt, want een lek dat door gedeelde mutable state wordt veroorzaakt reproduceert niet als je handmatig test.

## Weekendklus of architectuurwijziging

Niet alles op de lijst kost hetzelfde.

Cache keys, een ontbrekend filter op een retrieval-pad en few-shot voorbeelden vervangen door synthetische zijn uren werk. Sentinel-tests in CI zijn een dag. Trace-redactie is meestal twee of drie dagen, waarvan het grootste deel opgaat aan het bepalen van beleid in plaats van aan code schrijven.

Drie dingen zijn echt architectureel. Overstappen van één gedeelde index met metadata-filters naar een namespace of index per tenant betekent een volledige reindex en een wijziging in elk leespad, en het is de juiste keuze zodra je tenants hebt met wezenlijk verschillende bewaartermijnen of residency-eisen. De identiteit van de eindgebruiker door de tool-loop van een agent rijgen zodat tools onder de rechten van de aanroeper uitvoeren raakt je auth-ontwerp, niet alleen je AI-code. En een model dat op gepoolde tenant-data is gefinetuned moet opnieuw getraind worden op gescopeerde data, en het oude artefact moet uit dienst. Reken op weken, niet op een middag. Zit je nog vroeg genoeg dat dit open vragen zijn, dan horen ze in hetzelfde gesprek als de andere [architectuurbeslissingen die je vóór de build neemt](/blog/ai-feature-architecture-decisions).

De reden om dit vóór tenant drie te doen en niet erna, is een rekensom over meldplicht. Een lek dat je zelf vindt is een bug. Een lek dat je klant vindt is een meldplicht, en onder de AVG heb je 72 uur vanaf het moment dat je ervan op de hoogte bent om het bij de Autoriteit Persoonsgegevens te melden, plus een gesprek met een klant die nu een reden heeft om zijn contract nauwkeurig te lezen.

Tenant-isolatie is precies het soort werk waarvoor een **Production Hardening**-traject bestaat: drie tot zes weken om de grenzen in een feature die al werkt te auditen en te repareren, dus namespace-scoping, cache keys, credential-propagatie, log-redactie en de isolatietests die het gerepareerd houden. Onboard je je tweede of derde klant op een gedeelde AI-feature en kan niemand de isolatievraag met zekerheid beantwoorden, dan is dat het juiste moment. De scope staat op de [dienstenpagina](/services), en je setup beschrijven kan via de [contactpagina](/contact).
