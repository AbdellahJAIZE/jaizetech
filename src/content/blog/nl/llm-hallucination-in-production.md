---
title: "LLM Hallucinatie in Productie: Het Eerste Uur Telt Echt"
description: "Praktische veldgids voor LLM hallucinatie productie: triage in het eerste uur, oorzaak vinden, mitigaties shippen en guardrails bouwen die blijven werken."
published: "2026-09-11"
tags: ["LLM hallucinatie", "AI in productie", "RAG", "incident response", "AI guardrails"]
ogImage: "/images/blog/llm-hallucination-in-production/cover.jpg"
primaryService: "hardening"
---
Je supportinbox bevat een screenshot. De assistent heeft een klant verteld dat het contract een opzegtermijn van 30 dagen heeft. Het is 90 dagen. De klant heeft al gehandeld op die 30. Iemand heeft het naar je doorgestuurd met als onderwerp "??".

Ik heb die mail vaak genoeg ontvangen om er een routine voor te hebben, en die routine is deze post. Het is geen zoveelste stuk over eval-pipelines of retrieval-architectuur; die heb ik al geschreven. Dit is de veldgids voor de week waarin een LLM-hallucinatie in productie je echt in verlegenheid brengt: wat je in het eerste uur doet, hoe je een hallucinatie onderscheidt van een databug in een hallucinatiekostuum, wat je vandaag kunt shippen versus wat echt engineering vraagt, en wat je zegt tegen de mensen die vragen stellen.

Wat de meeste teams verkeerd doen: ze fixen dat ene antwoord. Ze voegen een regel toe aan de system prompt, testen precies die ene vraag opnieuw, zien een goed antwoord, en sluiten het ticket. Twee weken later krijgt een andere klant een ander fout antwoord, en nu denkt het hele bedrijf dat de feature niet te vertrouwen is. Het antwoord patchen is triage. Het is niet de fix.

## Het moment dat je het hoort: triage in het eerste uur

Het eerste uur draait om schade beperken en bewijs bewaren, in die volgorde. Begin nog niet met debuggen.

**Bewaar de trace.** Voordat iemand aan de prompt zit, haal je de volledige trace van dat gesprek op: de exacte versie van de system prompt die live stond, de opgehaalde chunks (bij RAG), de tool calls met hun ruwe output, het model met zijn parameters, en het uiteindelijke antwoord. Kun je dat niet allemaal uit je logs halen, schrijf dat dan op als bevinding nummer een; het gaat later tellen. Prompts worden in de paniek aangepast, en dan kan niemand meer reproduceren wat de klant zag.

**Bepaal de schadeomvang.** Doorzoek je logs op dezelfde intentie over de laatste 30 dagen. Niet dezelfde vraag, dezelfde intentie: alles wat opzegtermijnen raakt, in mijn voorbeeld. In mijn ervaring is de eerste gemelde hallucinatie zelden de eerste die is gebeurd. Vaak is het de tiende; de andere negen gingen naar klanten die niet klaagden. Dat getal heb je nodig voordat je met wie dan ook praat.

**Beslis over de kill switch.** Je hoort een feature flag te hebben die het AI-antwoord vervangt door een "ik verbind je door met een collega"-fallback, per onderwerp of globaal. Heb je die niet, bouw hem dan nu, want het kost een uur en je wilt hem tegen de lunch hebben. Of je hem omzet, hangt af van wat het antwoord raakte: geld, juridische voorwaarden, gezondheid, veiligheid, of alles met een deadline krijgt een kill op onderwerpniveau tot je het begrijpt. Een verkeerde restaurantaanbeveling niet.

**Wijs een eigenaar aan.** Een engineer is eigenaar van het incident, een persoon is eigenaar van de communicatie. Groepsdebuggen in een Slack-thread met veertien mensen levert veertien halve theorieën op en geen reproductie.

## Is dit echt een LLM-hallucinatie in productie, of een retrieval-bug in vermomming?

Hier is de ongemakkelijke waarheid uit mijn incidentnotities: de meeste "hallucinaties" waarvoor ik ben ingevlogen, waren niet het model dat dingen verzon. Het model vatte trouw een fout of verouderd document samen, of het kreeg het juiste document nooit te zien en deed zijn best met niets. Dat zijn verschillende bugs met verschillende fixes, en alles een hallucinatie noemen stuurt je een week lang de verkeerde kant op.

![LLM Hallucinatie in Productie: Het Eerste Uur Telt Echt](/images/blog/llm-hallucination-in-production/1.jpg)

Ga met de trace zitten en beantwoord drie vragen, in volgorde.

**Was de juiste informatie überhaupt beschikbaar voor het model?** Kijk naar de opgehaalde context. Als de 90-dagenclausule er niet in zat, heb je geen hallucinatie, je hebt een retrieval-miss. Het model kreeg een vraag waarvoor het geen grond had om te antwoorden en antwoordde toch; de tweede helft daarvan is een prompt- en guardrail-probleem, maar de eerste helft is retrieval. De gebruikelijke oorzaken heb ik beschreven in [waarom RAG in productie breekt](/blog/rag-breaks-in-production): chunking die een clausule van zijn kopje scheidt, een embedding-model dat "opzegging" en "beëindiging" als ver uit elkaar ziet, een metadata-filter dat stilletjes de huidige contractversie uitsloot.

**Was de informatie beschikbaar maar fout of verouderd?** Kijk nu naar de chunk zelf. Als daar 30 dagen staat, is je model onschuldig en je datapipeline schuldig. Het oude contracttemplate staat nog naast het nieuwe in de index, een wikipagina die niemand heeft opgeruimd, een PDF-versie uit 2023 die hoger scoort dan die van 2026 omdat er meer naar wordt gelinkt. Dit is het meest voorkomende geval dat ik zie, en het geval dat het vaakst verkeerd wordt gediagnosticeerd, omdat de fix waar mensen naar grijpen (prompt engineering) er niets aan doet.

**Was de informatie beschikbaar en correct, en sprak het model die alsnog tegen?** Pas nu heb je een echte hallucinatie. Het model had de 90 dagen in context en zei 30. Dat gebeurt, en het gebeurt vaker bij lange contexten, bij tegenstrijdige chunks in hetzelfde venster, bij kleinere modellen onder agressieve kostendruk, en bij prompts die het model vragen om "beknopt en zelfverzekerd" te zijn.

Een vierde categorie verdient een eigen regel: **de tool loog.** Als de agent `get_contract_terms(customer_id)` aanriep en de API de voorwaarden van de verkeerde klant teruggaf, of een gecachet antwoord, of een fout die de agent als leeg resultaat interpreteerde, dan herhaalde het model een slechte tool-output. Check ruwe tool-responses voordat je het model de schuld geeft. Agents zijn uitstekend in een upstream-bug eruit laten zien als een AI-bug.

Schrijf op welke van de vier je hebt. De rest van de week hangt ervan af.

## Mitigaties die je vandaag nog shipt, vóór de root-cause fix

Wat de oorzaak ook is, je kunt het risico vandaag verlagen zonder te doen alsof je het hebt opgelost. Dit zijn de mitigaties die ik de eerste middag ship, ruwweg in volgorde van hoe vaak ze helpen.

- **Fallback per onderwerp.** Voor de intentieklasse die faalde: routeer naar een vast antwoord plus een overdracht naar een mens. "Opzegtermijnen hangen af van je contract; ik heb dit doorgezet naar een collega die het binnen een werkdag bevestigt." Saai, veilig, en het koopt je de week.
- **Verplichte bronvermelding bij feitelijke claims.** Pas de prompt aan zodat elk getal, elke datum en elke beleidsuitspraak gevolgd moet worden door een verwijzing naar de bron-chunk, en wijs antwoorden af die zulke claims doen zonder verwijzing. Dit is een goedkope output-check, een regex en een lookup, en hij vangt een verrassend deel van de verzinsels af, omdat een model dat een bron moet noemen veel minder snel een cijfer verzint.
- **Onthoudingsinstructie, getest.** Voeg een expliciete instructie toe: "als de context het antwoord niet bevat, zeg dan dat je het niet weet en bied de overdracht aan." Test die vervolgens met tien vragen die niet in je corpus zitten. De meeste prompts hebben deze regel al en de meeste modellen negeren hem bij een zelfverzekerde gebruiker; je moet controleren of de jouwe zich echt onthoudt.
- **Pin de modelversie.** Zit je op een alias zoals `gpt-4o` of `claude-sonnet-latest` in plaats van een gedateerde snapshot, pin die dan nu. Ik heb een provider-rollout het onthoudingsgedrag van de ene op de andere dag zien veranderen zonder één codewijziging aan de kant van de klant.
- **Lagere temperature op feitelijke routes.** Geen fix, maar bij feitelijke Q&A is er geen enkele reden om op 0.7 of 1.0 te zitten. Zet hem op 0 of 0.1 voor die paden.

Let op wat niet op deze lijst staat: de system prompt vanaf nul herschrijven. Dat is de paniekzet, en hij verandert twintig dingen tegelijk zodat je niet meer kunt zien welk ding heeft geholpen.

## De vier root causes, en hoe je ziet welke van jou is

De triagestap hierboven vertelde je welke laag faalde. Zo wordt elke laag daadwerkelijk gefixt, en hoe lang dat realistisch duurt.

### Retrieval-miss

Het juiste document bestaat, de retriever bracht het niet naar boven. Diagnosticeer door de gefaalde query direct tegen je vector store te draaien en naar de top 20 te kijken, niet de top 5. Staat de juiste chunk op positie 12, dan heb je een rankingprobleem: voeg een reranker toe, of hybrid search met BM25, of allebei. Staat hij nergens in de top 50, dan is het een chunking- of embedding-probleem, en dan re-chunk je. Reken op twee tot vijf dagen voor de fix en de regressietests.

### Verouderde of tegenstrijdige data

Twee versies van de waarheid in de index. Diagnosticeer door op het foute feit te zoeken en te kijken waar het vandaan komt. De fix is onglamoureus: documentlifecycle. Geversioneerde bronnen, een proces om documenten uit te faseren, een metadata-veld voor ingangsdatum waar de retriever op filtert. De engineering is een dag of twee; de business laten afspreken wie eigenaar is van het uitfaseren van documenten, dat is het echte werk.

### Echte modelverzinsels

Juiste context, fout antwoord. Diagnosticeer door exact dezelfde prompt en context tien keer te draaien; krijg je in drie van de tien runs 30 dagen, dan is het een echte fout op modelniveau. Fixes, in volgorde van kosten: kort de context in zodat de relevante clausule niet begraven ligt, zet de relevante chunk vooraan (modellen letten meer op het begin en het einde dan op het midden), voeg een grounding-verificatiestap toe waarin een tweede, goedkopere call elke claim tegen de context controleert, of ga naar een sterker model voor die route. Die laatste heeft kostengevolgen; ik heb de sommen gemaakt in [wat een productie-LLM-feature in 2026 echt kost](/blog/cost-of-production-llm-2026), en een verificatiecall op 5% van het verkeer is meestal goedkoper dan een sterker model op 100%.

### Tool- of upstream-fout

Het model herhaalde trouw slechte input. Diagnosticeer vanuit de ruwe tool-logs. Fix door tool-output te behandelen als niet-vertrouwde gebruikersinvoer: valideer schema's, maak onderscheid tussen "leeg resultaat" en "fout", en laat een agent nooit een waarde invullen die de tool niet teruggaf. Dit is een gewone softwarebug en die fix je als een gewone softwarebug.

## Hoe "gefixt" er echt uitziet (niet alleen dat ene antwoord patchen)

Je bent klaar met het incident als vier dingen waar zijn, en niet eerder.

Ten eerste: het falende geval is een permanente regressietest. De exacte vraag, de exacte context, een assertie op het antwoord. Hij draait bij elke promptwijziging en elke modelwijziging.

Ten tweede: zijn broertjes en zusjes ook. Eén fout impliceert een klasse. Als opzegtermijnen faalden, schrijf dan vijftien tests over elke contractvoorwaarde die ertoe doet: opzegtermijnen, verlengingsdata, prijsindexatieclausules. In mijn ervaring vind je met het schrijven van die tests in ongeveer de helft van de gevallen twee extra live bugs.

Ten derde: je hebt een getal. Welk percentage van de feitelijke antwoorden in die intentieklasse is gegrond in de context? Kon je dat vóór het incident niet beantwoorden, dan kon je niet weten dat je een probleem had, en weet je ook niet wanneer het volgende begint. Dit is het deel van de fix dat uitgroeit tot de [continuous eval loop](/blog/llm-evaluation-production-continuous-eval) die de meeste teams nooit echt draaien.

Ten vierde: de trace die je in uur een had willen hebben, bestaat nu voor elk verzoek. Promptversie, modelversie, opgehaalde chunks met scores, tool calls, antwoord. Met een bewaartermijn die lang genoeg is om een klacht te reconstrueren die drie weken later binnenkomt.

Was je fix "we hebben een zin aan de prompt toegevoegd en nu werkt het", dan heb je geen van deze vier en zit je één modelupdate verwijderd van dit alles opnieuw doen.

## De guardrails bouwen die de volgende vangen vóór een gebruiker dat doet

De incidentrespons hierboven is bewust reactief. Het doel van de week erna is de volgende saai maken: gevangen door een monitor, niet door een klant.

**Groundedness-sampling in productie.** Neem een steekproef van live antwoorden, een paar procent is genoeg, en draai een LLM-as-judge-check: komt elke feitelijke claim in dit antwoord voor in de opgehaalde context? Log de score, alarmeer op de trend. Dit kost een fractie van een cent per gecontroleerd antwoord en het is de monitor met de hoogste waarde die ik ooit aan een assistent heb toegevoegd.

**Output-checks op claimniveau voor risicovolle routes.** Voor geld, data, juridische voorwaarden: extraheer de claims, verifieer tegen het bronsysteem (niet de vector store, de echte database), blokkeer of verzacht het antwoord bij een mismatch. Synchroon, in het request-pad, kost 300 tot 800 ms extra. De moeite waard op de routes waar een fout antwoord meer kost dan een traag antwoord.

**Promptversionering met een diff-review.** Elke promptwijziging is een commit, draait de regressiesuite, en toont het voor/na op de eval-set. Ik heb een goedbedoelde "maak de toon wat warmer"-aanpassing de onthouding met een derde zien verminderen; zonder de diff had niemand die twee met elkaar in verband gebracht.

**Feedbackverzameling die echt bij een engineer terechtkomt.** Duimpje omlaag met een vrij tekstveld, doorgezet naar dezelfde trace-store, wekelijks bekeken. Klanten melden hallucinaties veel vaker dan wat dan ook; je moet alleen luisteren.

**Een drift-alarm op model en retrieval.** Wekelijks de eval-set opnieuw draaien tegen het gepinde model en de huidige index. Zakt de groundedness twee punten, dan kijkt er iemand voordat klanten dat doen.

Niets hiervan is exotisch. Het is dezelfde lijst die ik beschreef in [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production), specifiek toegepast op de faalmodus waar bestuurders het bangst voor zijn.

## Wat je vertelt aan je team, je klant en je baas

Drie doelgroepen, drie verschillende boodschappen, en alle drie moeten waar zijn.

**Je team:** welke laag faalde, in de vierdeling hierboven, en hoe de regressietest eruitziet. Vermijd het blameless-postmortem-theater als de echte oorzaak was dat niemand eigenaar was van documentuitfasering; benoem het gat, niet de persoon, en wijs het eigenaarschap toe. Engineers respecteren precisie meer dan diplomatie in die meetings.

**Je klant:** het juiste antwoord, schriftelijk, van een mens, met een excuus dat niet uitlegt hoe taalmodellen werken. Dat interesseert ze niet. Wat ze willen weten, is dat het foute antwoord ze niets gaat kosten, en dat een persoon het juiste heeft bevestigd. Als het foute antwoord ze tot handelen bracht, los dan eerst het gevolg op en bespreek de AI daarna. Een zin als "de assistent heeft onjuiste informatie gegeven, we hebben dit gecorrigeerd en een controle toegevoegd zodat deze categorie antwoorden wordt geverifieerd" is genoeg.

**Je baas:** het schadeomvang-getal uit uur een, de root cause in één regel, de mitigatie die vandaag live is gegaan, en de datum waarop de echte fix met zijn regressietests wordt uitgerold. En dan de zin die ze echt moeten horen: "dit is de faalmodus die elke productie-assistent heeft, en de fix is een monitoring- en evaluatielaag die we nog niet hadden, geen beslissing over of de feature werkt." De meeste bestuurders vragen of ze de feature moeten stopzetten. Het eerlijke antwoord is bijna altijd nee, maar alleen als de guardrails deze keer worden gebouwd in plaats van de volgende keer.

De teams die ik sterker uit een hallucinatie-incident heb zien komen, zijn de teams die het behandelden als het moment waarop de feature een echt product werd, met de observability en de tests die een echt product heeft. De teams die de prompt patchten en doorgingen, zijn de teams die ik drie maanden later weer tegenkwam.

## Waar dit een opdracht wordt

Werkt je feature, maar heeft hij net een antwoord gegeven dat je niet kunt verdedigen, en heb je de evals, monitoring, promptversionering en output-guardrails nodig die zorgen dat het niet opnieuw gebeurt, dan is dat wat [Production Hardening](/services) is: een traject van drie tot zes weken dat een AI-feature van "werkt in dev, zet ons voor schut in prod" brengt naar een geharde deployment met een groundedness-getal dat je aan je bestuur kunt laten zien. Zit je daar deze week, [neem dan contact op](/contact) en dan beginnen we met de trace van het incident.
