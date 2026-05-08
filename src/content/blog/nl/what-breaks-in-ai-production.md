---
title: "Wat er echt breekt als AI in productie komt: een lijst uit 2,5 jaar praktijk"
description: "Zeven faalmodi die ik het vaakst zie wanneer AI-features van werkend in dev naar 24/7 productie gaan. Concrete fixes, geen theorie."
published: "2026-05-08"
tags: ["productie-AI", "AI-engineering", "operations", "betrouwbaarheid"]
ogImage: "/og-image.png"
primaryService: "hardening"
---

Tweederde van de organisaties heeft AI in ontwikkeling. Minder dan een op de vier heeft het betrouwbaar in productie draaien. Dat gat is op dit moment het duurste in de AI-engineering markt, en bijna niemand schrijft over wat het echt dicht.

Ik ben tweeënhalf jaar de enige engineer geweest op een AI computer-vision platform dat 24/7 in industriële productie draait. Echte gebruikers, echt geld, echte gevolgen als het model fout zit. Deze post is de checklist van faalmodi die ik blijf zien in dat werk en in aanpalende klantopdrachten. Zeven categorieën. Elke categorie heeft een AI-feature gecrasht die ik of iemand met wie ik gepraat heb draaide. Elke categorie heeft een fix. Geen theorie.

Lees je dit met een AI-demo die werkt op je laptop en een roadmap die zegt "naar productie in Q3", bewaar deze pagina dan.

## 1. Vendor wijzigt modelgedrag van de ene op de andere dag

Je wordt dinsdag wakker en een feature die maandag werkte geeft nu malformed JSON terug. Jij hebt niets veranderd. De vendor heeft een model-update gepushed.

Dit gebeurde twee keer in 2025 (OpenAI verschoof GPT-4 turbo's neiging om een leading newline voor JSON te zetten, Claude Sonnet veranderde zijn samenvattingsstructuur onder instructies) en al één keer in 2026. Is je output-parsing strak, dan breek je. Is hij los, dan verspil je tokens en tijd aan retries.

**Fix.** Twee lagen. Ten eerste, pin modelversies waar de vendor het toelaat. Snapshot-modellen zoals `gpt-4-2024-12-...` versies, niet zomaar `gpt-4`. Ten tweede, parse met intentie, niet met regex. Vraag het model om een strikt formaat EN valideer via JSON-schema, met één automatische retry bij parse-failure. Log elke parse-failure. Zie je een piek, dan heb je dezelfde dag een vendor drift gedetecteerd.

## 2. Rate limit cliffs onder piekbelasting

Een LangChain-analyse liet zien dat 60% van de LLM-call errors in februari 2026 veroorzaakt werd door overschreden rate limits. Dat is geen edge case. Dat is op dit moment de dominante faalmodus in productie.

Het patroon is altijd hetzelfde. Je dev-omgeving raakt de API rustig. Je evals draaien sequentieel. Je demo werkt prima. Dan gaat productie live, echte gebruikers komen in bursts, en je queue overspoelt het per-minuut quotum van de vendor. Errors stapelen zich op. Retries maken het erger.

**Fix.** Drie dingen op volgorde. Ten eerste, vraag voor launch een hogere rate limit aan. De meeste vendors verhogen stilletjes als je de use case uitlegt. Ten tweede, queue en concurrency-limit aan jouw kant. Laat je code niet meer requests per seconde maken dan de limiet toelaat. Ten derde, exponential backoff met jitter op 429s. Nooit lineaire retry, nooit instant retry. Klopt je concurrency-control, dan vuurt het derde nauwelijks af.

## 3. Prompt-regressie na een "kleine" wijziging

Je past een prompt aan om één rare output te fixen. Twee weken later merk je dat drie andere outputs slechter zijn geworden. Dan kun je het oorspronkelijke goede gedrag niet reproduceren omdat je de oude prompt nergens hebt.

Dit is de grootste reden dat teams "het gevoel hebben dat de AI slechter is geworden" zonder het te kunnen bewijzen. Ze hebben gelijk. Het is zo. Ze hebben alleen de data niet om te laten zien waarom.

**Fix.** Behandel prompts als code. Versioneer ze in git. Draai een eval-suite van 50 tot 200 representatieve prompt-input paren bij elke wijziging, met een drempelwaarde. Lever geen prompt op die onder de drempel zakt zonder een expliciet gelogde "ik accepteer deze regressie" beslissing. De eval-set kost de eerste keer een dag om te bouwen. Daarna betaalt het zich oneindig terug.

## 4. Retrieval verouderd en je team denkt dat het fris is

Je RAG indexeert bij launch 1.400 documenten. Zes weken later staan de docs op 1.540. Je index staat nog op 1.400. Je beantwoordt een klantvraag met informatie van twee weken oud. De klant maakt een ticket aan.

Dit is context staleness, en het is de meest voorkomende kwaliteitsklacht die ik zie in geleverde RAG-systemen.

**Fix.** Bouw de re-indexing pipeline voor launch, niet erna. Cron-gebaseerd voor langzaam bewegende bronnen zoals kennisbanken en contracten. Webhook-getriggerd voor snel bewegende zoals Notion- of Confluence-pagina's. Toon "indexed at" timestamps in admin-tooling zodat iemand het kan verifiëren. En voeg een eval-vraag toe waarvan het correcte antwoord is "ik heb daar geen actuele informatie over". Je retrieval moet zijn limieten kennen, en jij moet kunnen zien wanneer het ophoudt te weten.

## 5. Kosten lopen weg in een agent-loop

Je bouwt een agent. Hij kan tools aanroepen. Hij kan zichzelf aanroepen. Dan stelt een gebruiker een ambigue vraag en de agent spendeert 47 turns met sub-tool calls, en jaagt 18 euro aan tokens door één gesprek. Vermenigvuldig met 200 gebruikers.

Agent cost runaway is de productie-faal die het duurst is en het makkelijkst gemist wordt, omdat het geen error is. Het is gewoon een factuur.

**Fix.** Harde limieten op drie lagen. Ten eerste, max turns per gesprek. Acht tot twaalf is genoeg voor de meeste use cases, veel meer betekent dat je de verkeerde architectuur gebruikt. Ten tweede, max token-budget per sessie, afgedwongen in je wrapper. Ten derde, dagelijkse en wekelijkse cost-dashboards met alerts op drempels die je voor launch instelt. Kun je me niet binnen een orde van grootte vertellen wat je kost is per 1000 sessies, dan heb je geen cost monitoring.

## 6. Evals slagen, productie breekt, en je hebt twee waarheden

Dit is de faalmodus die ik het meest heb gezien het afgelopen jaar. Je eval-suite slaagt. Echte gebruikers klagen. Je draait je evals opnieuw, weer slagend. Het verschil laat je zowel je evals als je gebruikers tegelijk wantrouwen.

Wat er werkelijk gebeurt: je eval-set is gebouwd uit geïdealiseerde inputs, niet uit echte. Productiegebruikers maken typo's, plakken broken context, vragen midden in een zin in twee talen, hangen afbeeldingen aan in onverwachte resoluties. Je eval heeft daar niets van gezien.

**Fix.** Continue eval-vanuit-productie. Sample 1 tot 3% van echte productie-interacties, scrub voor PII, score ze met dezelfde eval-rubriek als je dev-set, en voer de nieuwe voorbeelden wekelijks terug in je eval-suite. Na een kwartaal hiervan is je eval echt. Voor die tijd is het wishful thinking.

## 7. Inference-latency onder echte gelijktijdige belasting

Latency op één request is prima. Tien requests tegelijk en je p95 springt van 1,2s naar 14s. Je gebruikers merken het. Sommigen verlaten de pagina voordat het antwoord binnen is.

Dit is grotendeels een serving-probleem, vooral voor self-hosted modellen op GPU's. Het happy path voor één request gebruikt één batch slot. Gelijktijdige requests gaan in een queue en de batch-logica is misschien niet geoptimaliseerd voor jouw verkeerspatroon.

**Fix.** Drie knoppen. Ten eerste, profileer onder realistische concurrency, niet alleen single-call benchmarks. Vendor-hosted API's hebben hun eigen load test nodig tegen jouw daadwerkelijke prompts en lengtes. Self-hosted serving (Triton, vLLM, en vergelijkbaar) heeft batching nodig die geconfigureerd is voor jouw verkeer. Ten tweede, val zachtjes terug. Klimt je p95, geef dan een "we komen er op terug" pad of schakel naar een kleiner goedkoper model. Ten derde, monitor latency p50, p95, p99. Gemiddelden liegen op deze laag.

## Het patroon onder alle zeven

Elke faalmodus deelt dezelfde onderliggende oorzaak. Het systeem werd getest in condities die niet matchen met productie, en het gat werd pas ontdekt toen echt verkeer binnenkwam. Elke fix vereist dezelfde engineering-discipline: een echte eval, echte instrumentatie, en de bereidheid om harde limieten te zetten op een systeem dat zonder limieten ontworpen is.

Dit is geen glamoureus werk. Het is het verschil tussen een feature die naar productie gaat en een feature die in week drie wordt teruggetrokken omdat het team het niet draaiend kan houden.

## Hoe ik help

Als drie of meer van deze faalmodi matchen waar jij staat, dan is dat geen pech. Dat is een systeem dat niet vanaf dag één voor productie ontworpen is, en dat zijn de meeste systemen.

Twee van mijn opdrachten zijn hier specifiek voor gebouwd:

- **POC Audit** (één week, vaste prijs). Ik bekijk je stack en breng exact in kaart welke van deze zeven (of andere) je gaan bijten. Je gaat naar huis met een schriftelijk rapport en een plan voor 90 dagen.
- **Production Hardening** (3 tot 6 weken). Ik werk samen met je team om de faalmodi daadwerkelijk te fixen. Eval-suite, monitoring, cost controls, prompt-versioning, retrieval-freshness, het hele pakket.

Lees je dit en herken je drie of meer, [laten we praten](/contact). Een gesprek van 15 minuten is meestal genoeg om voor ons beiden te weten op welke van de zeven jij staat.

## Verder lezen

- [RAG of fine-tuning: een 20-minuten beslissing](/blog/rag-vs-fine-tuning-decision-flowchart). Beslis wat je gaat gebruiken voordat je je zorgen maakt over schalen.
- [Een AI engineer aannemen in Nederland](/blog/hire-ai-engineer-netherlands). De hiring-kant van hetzelfde probleem. Wie heeft daadwerkelijk de production-litekens.
