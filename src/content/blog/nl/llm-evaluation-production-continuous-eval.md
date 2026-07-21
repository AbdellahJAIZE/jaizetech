---
title: "LLM-evaluatie die productie overleeft: de continuous eval loop die niemand draait"
description: "De meeste teams draaien een eval-suite een keer en raken hem nooit meer aan. Hier is de continuous eval-workflow die regressies vangt voordat klanten dat doen, met de tradeoffs van het bouwen ervan."
published: "2026-05-12"
tags: ["LLM-evaluatie", "productie-AI", "AI-engineering", "regressie-testen"]
ogImage: "/og-image.png"
primaryService: "hardening"
---

De meeste AI-teams draaien een eval een keer en shippen. Misschien draaien ze hem opnieuw als een vendor een nieuw model uitbrengt. Dan klaagt zes maanden later een klant over een regressie en heeft het team geen manier om te bepalen of zij het geïntroduceerd hebben, wanneer, of welke wijziging dingen brak.

Dit is het eval-gat. De meeste productie-LLM-systemen hebben een antwoord op "heeft deze commit dingen erger gemaakt" ergens tussen "geen idee" en "we hebben er tien queries doorheen gehaald en het leek prima". Dat is geen kwaliteitsprogramma. Dat is hopen.

Deze post is de continuous eval-workflow die ik in productie gebruik. Het is meer werk om op te zetten dan een eenmalige eval, minder werk om te draaien dan de meeste teams verwachten, en het vangt ruwweg 80 procent van regressies voordat klanten dat doen. Als je een LLM-feature gelanceerd hebt en je draait dit niet, heb je een kwaliteitsprogramma dat op papier bestaat en niet in de praktijk.

## Wat "continuous eval" daadwerkelijk betekent

Continuous eval is niet "draai de eval vaker". Het is een workflow met vier eigenschappen:

1. **Automatisch getriggerd bij elke wijziging die outputkwaliteit kan beïnvloeden.** Prompt-wijzigingen, model-swaps, retrieval-config wijzigingen, contextvenster-wijzigingen, library-upgrades.
2. **Geversioneerd naast code, zodat historische evals vergeleken kunnen worden.** Geen notebook die iemand opnieuw draait.
3. **Heeft een pass/fail drempel, niet alleen een score**. De drempel is van tevoren gezet en blokkeert merges.
4. **Bevat adversariale en hard-case inputs**, niet alleen happy-path voorbeelden.

Als je huidige eval-setup een van deze mist, is het een kwaliteitsmeting, geen kwaliteitspoort. Het verschil doet ertoe.

## De 5-laagse eval-pipeline

Een productie-grade eval-pipeline heeft vijf lagen. Je kunt een paar maanden met drie draaien, maar de ontbrekende twee bijten je terug.

### Laag 1: Unit-test-stijl asserties

De goedkoopste, snelste laag. Asserteert op specifieke eigenschappen van de LLM-output zonder kwaliteit te beoordelen.

Voorbeelden: "de output is geldige JSON", "de output bevat een datum in YYYY-MM-DD formaat", "de output is tussen 50 en 500 tokens", "de output bevat niet de placeholder-string [REDACTED]".

Deze vangen formatteringsregressies en duidelijke fouten. Ze draaien in onder een seconde per voorbeeld. Ze zouden bij elke commit moeten draaien.

Tooling: pytest met custom asserties, of LangSmith's structured assertions, of gewoon plain Python.

### Laag 2: Reference-based scoring

Vergelijk LLM-output met een bekende-goede referentie. Gebruik exact-match, BLEU, ROUGE, embedding-similariteit of LLM-as-a-judge voor fuzzy matching.

Voorbeelden: "de output moet matchen met dit gouden antwoord met cosine-similariteit > 0,85", "de output moet deze input classificeren als 'positief'".

Deze zijn geweldig voor taken met een duidelijk goed antwoord (classificatie, extractie, gestructureerde generatie). Minder nuttig voor open-eindige generatie waar er geen enkel goed antwoord is.

Tooling: scikit-learn voor classificatie-metrics, sentence-transformers voor embedding-similariteit, OpenAI's evals framework, of LangSmith voor managed.

### Laag 3: LLM-as-a-judge

Gebruik een sterkere LLM (of dezelfde met een andere prompt) om de output van je productie-LLM te beoordelen. Stel specifieke vragen: "beantwoordt deze output de vraag correct?", "is de toon gepast voor een customer support context?", "bevat deze output ongefundeerde claims?".

Pros: schaalt naar subjectieve kwaliteiten die mensen meestal moeten beoordelen. Cons: duur, langzaam, kan inconsistent zijn.

Nuttige guardrail: kalibreer je LLM-judge tegen menselijke beoordelingen op een sample van 50-100 outputs eerst. Als de judge 85+ procent van de tijd met mensen overeenkomt, kun je hem vertrouwen. Minder dan 75 procent, niet.

Tooling: OpenAI Evals, LangSmith Evaluators, custom met gpt-4o judge.

### Laag 4: Adversariale / red-team set

Een set inputs ontworpen om je systeem te breken. Edge cases, ambigue queries, prompt injection-pogingen, requests in onverwachte talen, requests met malicious intent (als je use case dat risico heeft).

Deze set zou met de tijd moeten groeien. Elk productie-incident zou minimaal één entry moeten toevoegen. Elke klantklacht die een legitieme edge case bleek te zijn zou een entry moeten toevoegen. Dit is je institutionele geheugen van "dingen die eerder gebroken zijn".

Als je adversariale set niet groeit, leer je niet van productie.

### Laag 5: Echte productie-sampling

Sample een klein percentage van productieverkeer (1-5 procent), log inputs en outputs, draai ze door je eval-suite. Dit is de enige laag die drift in echte input-distributies vangt.

Waarom dit ertoe doet: je andere vier lagen testen je systeem tegen eval-data die jij geconstrueerd hebt. Je productie-gebruikers construeren inputs die jij niet voorzien hebt. De enige manier om te weten of je systeem die aankan is ze te samplen en te checken.

Het moeilijke deel is privacy. Je kunt niet zomaar alles verbatim loggen als je gebruikers gevoelige data sturen. Oplossingen: hash persoonlijk identificeerbare delen, sample alleen inputs die aan een niet-gevoelige heuristiek voldoen, of gebruik een privacy-preserving eval (log alleen embeddings, geen ruwe tekst).

## Het continue deel: wanneer elke laag draait

Verschillende lagen draaien op verschillende tempo's. Alles draaien bij elke commit is duur en langzaam. Hier is het praktische schema.

| Laag | Wanneer het draait | Waarom dit tempo |
|---|---|---|
| Laag 1 (unit asserties) | Elke commit, pre-merge | Goedkoop en snel. Geen reden om niet te doen. |
| Laag 2 (reference-based) | Elke commit die prompts, modellen of retrieval raakt | Vangt duidelijke regressies voor merge. |
| Laag 3 (LLM-as-judge) | Nachtelijks, op de volledige eval-set. On-demand voor grote prompt-wijzigingen. | Duur genoeg dat je het niet bij elke commit wilt. |
| Laag 4 (adversariaal) | Wekelijks. On-demand wanneer een nieuwe edge case ontdekt wordt. | Minder tijdsgevoelig maar kritisch. |
| Laag 5 (productie-sampling) | Continu, met eval dagelijks draaiend op het gesampelde verkeer | De enige die input-drift vangt. |

Dit geeft je snelle feedback op de meeste wijzigingen (Lagen 1-2) en diepere feedback op een langzamer tempo (Lagen 3-5). Totale maandkost voor een mid-sized applicatie: 200 tot 600 euro aan LLM-judge calls plus je monitoring stack.

## Pass/fail drempels en wat te doen als ze falen

Hier blijven de meeste teams steken. Ze hebben evals draaien maar geen duidelijke "deze commit kan niet shippen" beslissing.

Zet expliciete drempels voordat je iets shipt. Voorbeelden:

- Laag 1: 100 procent van unit asserties slaagt. Harde poort.
- Laag 2: ≥85 procent van reference-based voorbeelden slaagt. Harde poort.
- Laag 3: ≥80 procent beoordeeld als "goed" door de LLM-judge. Zachte poort (review vereist).
- Laag 4: ≥90 procent van adversariale cases correct afgehandeld. Harde poort.

Wanneer een drempel faalt, zijn drie reacties geldig:

1. **Fix de regressie en draai opnieuw.** Default reactie.
2. **Verlaag de drempel met een expliciete gelogde beslissing.** Soms is de eval-set strikter geworden dan het echte product nodig heeft. Documenteer waarom.
3. **Erken de regressie en ship toch met een tracked issue.** Zeldzaam en gevaarlijk. Gebruik alleen wanneer de regressie in een bekend-acceptabel gebied zit en de wijziging elders grotere waarde biedt.

Het principe is dat de drempel-poort bestaat, je hem respecteert, en wanneer je hem overrulet de override een gelogde beslissing is die een toekomstige engineer kan auditeren. "We hebben gepushed zonder erover na te denken" is de faalmodus waar de poort voor bestaat.

## Wat dit vangt dat simpelere workflows missen

Als je alleen een eenmalige eval draait, mis je:

- **Prompt-regressies over commits heen.** Laag 1-2 vangt deze in seconden.
- **Subtiele drift in vendor-modelgedrag.** Laag 5 vangt deze omdat je echte inputs sampelt tegen je historische baseline.
- **Edge cases waar je team nooit aan dacht om te testen.** Laag 4 groeit met de tijd en onthoudt wat je vergat.
- **Productie-input distributies die van je eval-set divergeren.** Laag 5 is de enige bescherming hiertegen.

De grootste winst van continuous eval is niet het vangen van een specifieke regressie. Het is het team bewust maken van wanneer kwaliteit beweegt, welke kant op, en waarom. Kwaliteitsgesprekken zijn anders wanneer je data hebt.

## Wat het kost om op te zetten

Realistische tijd om dit vanaf nul te bouwen voor een mid-sized AI-product:

- Laag 1: 2-3 dagen engineering. Plus 1 dag per nieuwe prompt of feature om uit te breiden.
- Laag 2: 1 week om te bouwen, plus doorlopende kost van het cureren van referentievoorbeelden (1 dag per maand).
- Laag 3: 1 week om de judge-prompt te bouwen en te kalibreren tegen menselijke beoordelingen.
- Laag 4: doorlopend. Begin met 10 cases. Groei naar 50-100 over zes maanden naarmate je leert.
- Laag 5: 2-3 weken om de sampling pipeline te bouwen met privacy-controles.

Totaal: ruwweg 4-6 weken engineering om op te zetten, 3-5 dagen per maand om te onderhouden. Voor een productie-AI-product is dat significant minder dan de kost van één regressie die klanten raakt.

## Hoe dit er voor een klein team uitziet

Als je één engineer op de AI-kant hebt en beperkte tijd, prioriteer:

1. Laag 1 unit asserties. Twee dagen. Hoogste ROI per uur.
2. Een 50-voorbeeld Laag 2 referentieset met een pass-drempel. Eén week.
3. Een 10-case adversariale set die met de tijd groeit. In een uur gestart.

Sla Laag 3 en 5 initieel over. Voeg ze toe als je een echt productie-kwaliteitsprobleem hebt en herhaling moet voorkomen.

Als je een gestructureerde lezing van buitenaf wilt op je huidige eval-setup, het [AI-integratie-audit](/services) format dekt precies dit soort review. De output is een geschreven beoordeling met specifieke gaten in je eval-dekking en de goedkoopste fix voor elk.

Verwante leesstof: [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production) dekt de faalmodi die evals geacht worden te vangen. [Wat een productie-LLM-feature in 2026 echt kost](/blog/cost-of-production-llm-2026) bevat eval-runs als significante kostenpost.
