---
title: "RAG evaluatie metrics: retrieval en generatie apart meten"
description: "RAG evaluatie metrics die falen voorspellen: recall, precision, MRR, faithfulness, golden sets en drempels om releases te blokkeren."
published: "2026-09-21"
tags: ["RAG", "evaluatie metrics", "LLM", "retrieval", "CI/CD"]
ogImage: "/images/blog/rag-evaluation-metrics-production/cover.jpg"
primaryService: "hardening"
---
Je RAG-assistent antwoordt vloeiend. De founder heeft hem aan de board gedemood, de eerste twintig gebruikers zeiden "wow", en in Slack staat een screenshot waarin hij 40 pagina's beleid in drie zinnen samenvat. Dan stelt iemand de vraag die de kamer stil legt: "Hoe weten we dat het klopt?" Niemand heeft een getal, omdat niemand vóór het bouwen RAG evaluatie metrics heeft gekozen.

Precies op dit punt word ik gebeld, meestal twee weken vóór een launch of twee weken na een stille. Het team heeft een systeem dat op gevoel werkt en een backlog vol "deze had hij fout"-tickets die niemand kan prioriteren. Wat ontbreekt is geen beter model. Het is een handvol metrics die voorspellen welke vragen in productie falen, een kleine golden set om ze tegen te berekenen, en een pass/fail-lijn voor elke release.

Dit is de versie metric voor metric: retrieval, generatie, de eval-set in dagen in plaats van maanden, waar LLM-as-judge liegt, wat "goed genoeg" is als getal, en hoe je het in CI hangt.

## Het moment: je RAG-demo antwoordt goed, maar niemand kan zeggen of het goed genoeg is

Het patroon herhaalt zich. Een RAG-systeem wordt in drie weken gebouwd, getest door de bouwers op hun eigen vragen, en beoordeeld op of de antwoorden lekker lezen. Lekker lezen doet een modern LLM onvoorwaardelijk: ook als de retriever drie irrelevante chunks teruggaf en het model het gat opvulde uit zijn eigen weights.

De demo zegt dus bijna niets over productie. De runtime-faalmodi staan in [waarom je RAG werkt in dev en breekt in productie](/blog/rag-breaks-in-production): corpusgroei, chunkgrenzen, query-drift, verouderde indexes. Elk daarvan is onzichtbaar in een demo en verschijnt als een zelfverzekerd fout antwoord. De enige manier om ze eerder te zien dan je gebruikers: retrieval en generatie apart meten, op een vaste set vragen, elke keer als er iets verandert.

## Waarom "het klinkt goed" geen van de RAG evaluatie metrics is

Een metric heeft drie eigenschappen: hij wordt elke keer hetzelfde berekend, hij beweegt als het systeem slechter wordt, en hij wijst naar het component dat de verandering veroorzaakte. "Klinkt goed" heeft geen van de drie. Het hangt af van wie toevallig meeleest, beweegt pas als de fout gênant is, en kan een retrievalfout niet onderscheiden van een generatiefout.

![RAG evaluatie metrics: retrieval en generatie apart meten](/images/blog/rag-evaluation-metrics-production/1.jpg)

Dat laatste onderscheid is het hele spel. In mijn ervaring is ruwweg twee derde van de foute RAG-antwoorden een retrievalfout: de juiste passage zat nooit in de context, dus het model weigerde, gokte, of beantwoordde een naburige vraag. Het resterende derde zijn generatiefouten: de passage zat er wél in en het model sprak hem tegen, negeerde hem, of verzon een detail erbij. Retrievalfouten los je op met chunking, embedding-modellen, hybrid search, reranking. Generatiefouten met prompts, modelkeuze, weigerregels. Als je enige signaal "het antwoord was fout" is, sleutel je een week aan de prompt voor een probleem in de chunker. Ik heb teams precies dat zien doen.

Dus: splits de metrics in twee lagen, scoor ze onafhankelijk, en kijk pas daarna naar het end-to-end antwoord.

## Retrieval-metrics: precision, recall en MRR

Retrieval-evaluatie stelt één vraag: kwamen de juiste chunks terug, en hoe hoog? Drie getallen, berekend op de `k` die je echt aan het model doorgeeft, niet op een flatterende `k=50`.

- **Recall@k**: van de chunks die het antwoord bevatten, welk deel zat in de top `k`? Dit is de metric die foute antwoorden voorspelt. Bij recall@5 van 0,6 werkt het model bij 40% van de vragen zonder bewijs, en antwoordt het toch.
- **Precision@k**: van de `k` teruggegeven chunks, welk deel was relevant? Lage precision betekent dat het model ruis leest: dat kost tokens en latency, en bij langere contexten verslechtert het de antwoorden meetbaar omdat de relevante passage begraven ligt.
- **MRR (mean reciprocal rank)**: hoe hoog landde gemiddeld de eerste relevante chunk? Een MRR van 0,5 betekent dat de eerste bruikbare passage doorgaans op positie twee staat. Dat telt, omdat de meeste generatie-prompts eerdere context zwaarder wegen, of je dat nu bedoelt of niet.

Bereken ze op `k=3`, `k=5` en `k=10` en kijk naar de curve. Recall@10 van 0,9 maar recall@3 van 0,5 is geen retrievalprobleem maar een rankingprobleem; een cross-encoder reranker lost dat in een middag op. Recall@10 van 0,55 is een chunking- of embedding-probleem en geen reranker gaat het redden.

### De retrieval golden set zonder maanden labelen

Teams slaan retrievalmeting over omdat ze denken een gelabeld corpus nodig te hebben. Ze hebben 100–300 vraag-naar-chunk-paren nodig, en die maak je in een dag.

Sample 150 chunks uit je echte corpus, gestratificeerd over documenttypes, zodat je niet alleen de nette PDF's test. Laat per chunk een LLM twee of drie vragen genereren die alleen deze chunk beantwoordt. Nu heb je queries met een bekend relevant chunk-ID. Haal ze door je retriever en bereken recall en MRR.

Twee waarschuwingen. Synthetische vragen zijn netter geformuleerd dan hoe je gebruikers typen; in mijn ervaring lopen de getallen daardoor tien tot vijftien punten te optimistisch. En een chunk die zijn eigen gegenereerde vraag beantwoordt, is bijna een tautologie voor lexicale search. Zelfde fix voor beide: vervang de synthetische set door echte gebruikersqueries zodra je logs hebt, en houd de oude set als regressievloer.

## Generatie-metrics: faithfulness, groundedness, en waar LLM-as-judge liegt

Zodra de juiste context is opgehaald, vraagt de tweede laag of het model die eerlijk gebruikte. Drie metrics, elk voor een specifieke fout.

- **Faithfulness**: elke bewering in het antwoord wordt ondersteund door de opgehaalde context. Splits het antwoord in atomaire statements en check elk tegen de chunks. Dit is de anti-hallucinatie-metric. Faithfulness 0,85 betekent dat 15% van de statements geen onderbouwing heeft, een getal dat je aan een compliance lead kunt voorleggen.
- **Groundedness / context-benutting**: heeft het antwoord de relevante chunk daadwerkelijk gebruikt, of antwoordde het uit parametrisch geheugen terwijl de juiste passage ongebruikt bleef? Dit vangt het geval waarin het antwoord zelfs klopt en het systeem toch niet doet wat je denkt. Het breekt op de dag dat het corpus het oneens is met de trainingsdata.
- **Answer relevance**: beantwoordt het antwoord de gestelde vraag, of een naburige vraag die de context toevallig beter beantwoordde? RAG-systemen driften richting "wat de documenten zeggen" in plaats van "wat de gebruiker vroeg".

Alle drie worden in de praktijk gescoord door een LLM-judge; anders schaalt het niet. De judge liegt op drie voorspelbare manieren.

**Hij beloont lengte en zelfvertrouwen.** Een antwoord dat meer zegt, met meer structuur, scoort hoger op relevance, ook als het meer fouten bevat. Fix: scoor faithfulness per bewering, niet per antwoord, zodat extra beweringen punten kosten.

**Hij is het met zichzelf eens.** Een judge uit dezelfde modelfamilie als de generator deelt diens blinde vlekken. Fix: judge met een andere provider dan waarmee je genereert, en kalibreer eerst tegen 50 door mensen gelabelde voorbeelden. Zitten judge en mens onder ruwweg 80% overeenstemming, dan zijn de scores ruis.

**Hij kan niet zien wat ontbreekt.** De judge ziet het antwoord en de context, niet het antwoord dat het systeem níet gaf. Faithfulness kan 1,0 zijn op een antwoord dat precies de ene voorwaarde weglaat die ertoe deed. Fix: voeg voor vragen waar volledigheid telt (prijzen, geschiktheid, veiligheid) een referentieantwoord toe plus een aparte check "dekt de vereiste punten". Dat is de ene plek waar een beetje menselijke ground truth zichzelf vele malen terugverdient.

De triage van het eerste uur bij een live incident staat in [de hallucinatie-veldgids](/blog/llm-hallucination-in-production). De metrics hierboven zorgen dat zo'n incident niet je eerste signaal is.

## De eval-set bouwen: hoeveel voorbeelden, waar ze vandaan komen, wie labelt

"Hoe groot moet de golden set zijn?" Kleiner dan je vreest, diverser dan je hebt.

- **Omvang**: 150–300 vragen detecteert een regressie van vijf punten met redelijke zekerheid. Onder de 100 bewegen metrics op ruis. Boven de 500 groeien de labelkosten harder dan de informatiewinst.
- **Bronnen**, in volgorde van waarde: echte gebruikersqueries uit logs (die met een thumbs-down zijn goud), vragen die support nu al met de hand beantwoordt, vragen die de domeinexpert lastig vindt, en synthetische vragen voor dekkingsgaten. Nog geen logs? Ga twee uur zitten met wie deze vragen vandaag per e-mail beantwoordt; dat levert er vijftig op.
- **Slices**: tag elke vraag met documenttype, onderwerp en moeilijkheid. Aggregaten verbergen fouten. Een systeem op 0,85 overall kan op 0,55 staan voor precies de ene documentcategorie waar sales om geeft.
- **Wie labelt**: chunk-labels komen uit de synthetische truc, geverifieerd met een steekproef. Referentieantwoorden en volledigheidscriteria komen van een domeinexpert, ruwweg twee dagen voor 200 vragen. Laat geen engineer het "juiste" antwoord op een belastingvraag schrijven.
- **Verversen**: rouleer maandelijks 10–20% van de set vanuit verse logs; oude vragen blijven als regressievloer. Een golden set die nooit verandert, meet het verleden.

Dit is de RAG-specifieke variant van [de continuous eval pipeline die niemand draait](/blog/llm-evaluation-production-continuous-eval). Het verschil: twee lagen met een harde grens ertussen, en een golden set met chunk-ID's, niet alleen antwoorden.

## Drempels: welke score goed genoeg is om te launchen, en wat een release blokkeert

Niemand wil zich vastleggen op een getal, dus hier zijn de startlijnen die ik zelf gebruik. Geen benchmarks; het zijn de punten waaronder gebruikers in mijn ervaring afhaken.

- **Recall@5 onder 0,75**: niet launchen. Een kwart van de vragen wordt zonder bewijs beantwoord. Fix eerst retrieval; niets stroomafwaarts helpt.
- **Recall@5 tussen 0,75 en 0,85**: launchbaar voor intern of low-stakes gebruik met een zichtbaar "dit kon ik niet vinden"-weigerpad. Niet voor klantgericht gebruik met gevolgen.
- **Recall@5 boven 0,85 en MRR boven 0,7**: retrieval is niet je probleem. Door naar generatie.
- **Faithfulness onder 0,9**: blokkeert release voor extern gebruik. Eén op de tien beweringen zonder onderbouwing is bij bescheiden verkeer dagelijks een hallucinatieklacht.
- **Faithfulness boven 0,95, answer relevance boven 0,85**: shippen, en de rest in productie meten.

Twee regels wegen zwaarder dan de absolute getallen. Ten eerste: **geen enkele slice mag meer dan 5 punten zakken ten opzichte van de vorige release**, ook niet als het aggregaat verbetert. Een embedding-wissel die de totale recall drie punten optilt en de contracten-slice twaalf laat zakken, is een regressie, ontdekt door precies de verkeerde gebruikers. Ten tweede: **elke wijziging aan chunking, embedding-model, reranker, prompt of generatiemodel triggert de volledige run**. Een kleine wijziging bestaat niet in een RAG-pipeline; een chunk-overlap van 50 naar 100 tokens heb ik recall@5 negen punten zien bewegen, beide kanten op.

Beslis je nog of RAG überhaupt de juiste architectuur is, dan komt [de RAG-of-fine-tuning-beslissing](/blog/rag-vs-fine-tuning-decision-flowchart) eerst. Deze drempels gaan ervan uit dat je die keuze hebt gemaakt.

## RAG-evaluatie in CI hangen zodat een retrievalwijziging niet stilletjes kan shippen

Metrics zijn nutteloos in een notebook die één engineer soms draait. Het punt is dat een pull request die de chunker raakt een rode check krijgt, en dat de reviewer "recall@5: 0,84 → 0,71 op de facturen-slice" ziet vóór het mergen. Een `rag-eval.yml` in je CI-config, getriggerd op de paden die ertoe doen:

yaml
on:
  pull_request:
    paths:
      - "ingest/**"        # chunking, parsing, metadata
      - "retrieval/**"     # embeddings, hybrid search, reranker
      - "prompts/**"       # generatie-prompts, versioned
      - "eval/golden/**"   # de eval-set zelf

jobs:
  rag-eval:
    runs-on: ubuntu-latest
    steps:
      - run: python -m eval.retrieval --golden eval/golden/v3.jsonl --k 3 5 10
      - run: python -m eval.generation --golden eval/golden/v3.jsonl --judge claude --sample 100
      - run: python -m eval.gate --baseline main --max-slice-drop 0.05 --min-recall5 0.80 --min-faithfulness 0.90

Wat dit in de praktijk laat werken:

- **Retrieval-eval draait op elke PR en is goedkoop.** Geen LLM-calls, alleen embedding-queries tegen een bevroren index-snapshot. 300 vragen draaien in minder dan een minuut. Sla hem nooit over.
- **Generatie-eval draait op een sample.** 300 antwoorden laten beoordelen kost echt geld en minuten; sample 100 op PR's, draai de volledige set 's nachts en vóór releases. Pin de versie van het judge-model, want een judge die stilletjes upgradet verschuift je scores zonder dat je systeem verandert.
- **De gate vergelijkt met `main`, niet alleen met een vast getal.** Absolute drempels vangen rampen; relatieve dalingen per slice vangen de langzame lek.
- **De index wordt geversioned naast de code.** Draait de eval tegen wat de vectorstore vandaag toevallig bevat, dan meet je datadrift, niet je wijziging.
- **Promptwijzigingen gaan door dezelfde gate.** Prompts voelen als tekst, maar het is code. De mechaniek staat in [prompt-versiebeheer en regressietests](/blog/prompt-versioning-regression-testing); de RAG-eval is de testsuite waarvan dat artikel aanneemt dat je hem hebt.

Zodra dit staat, verandert het gesprek. "Ik denk dat het nieuwe embedding-model beter is" wordt "recall@5 van 0,81 naar 0,88, MRR van 0,66 naar 0,74, geen slice gezakt, faithfulness ongewijzigd". Daar hoort een launchbeslissing op te rusten, en het kost ruwweg een week om daar te komen. Metrics, golden set, CI-gate en een productiedashboard vormen de hardening-laag die de meeste RAG-builds overslaan; de rest van die laag staat op [de dienstenpagina](/services).

## Waar dit een opdracht wordt

Als je RAG-assistent live is of bijna, en het eerlijke antwoord op "is retrieval goed genoeg?" een schouderophalen is, dan is dit de [Production Hardening](/services)-opdracht: drie tot zes weken waarin ik met jullie domeinexpert de golden set bouw, retrieval- en generatie-evals opzet met gekalibreerde judges, release-drempels per slice vastleg, de gate in jullie CI hang en dezelfde metrics op een productiedashboard zet. Is dat het ontbrekende stuk, [neem dan contact op](/contact) en we kijken samen naar je getallen.
