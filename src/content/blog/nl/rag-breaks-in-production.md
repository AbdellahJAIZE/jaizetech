---
title: "Je RAG werkt in dev. Hier is waarom het in productie breekt."
description: "Een RAG-diagnose in vijf vragen. De vier plekken waar retrieval breekt onder echte gebruikers. Wat context engineering daadwerkelijk betekent als je eval eerlijk is."
published: "2026-05-01"
tags: ["RAG", "retrieval", "context engineering", "productie-AI"]
ogImage: "/og-image.png"
primaryService: "hardening"
---

Je RAG-demo beantwoordde elke vraag perfect. Je shipte. Twee weken later staat dezelfde klacht drie keer in je support-inbox. "Het zei me X maar het juiste antwoord is Y." Je checkt de docs. Het juiste antwoord staat in de docs. Je draait je testset opnieuw. Testset slaagt nog steeds.

Dit is het meest voorkomende RAG-faalpatroon dat ik zie nadat het gelanceerd is. Het systeem werkt in dev omdat je de eval-set gebouwd hebt rond vragen waarvan je de antwoorden van tevoren wist. Productiegebruikers niet.

Deze post is de diagnose die ik draai op RAG-systemen die er oké uitzien en het niet zijn. Vijf vragen om te stellen, vier veelvoorkomende faalmodi, en wat context engineering daadwerkelijk betekent zodra je het stopt te gebruiken als buzzword.

## De RAG-diagnose in 5 vragen

Draai deze tegen je systeem. Als je geen "ja" met bewijs kunt antwoorden op alle vijf, heeft je RAG een kwaliteitsgat.

**1. Zijn je eval-vragen geschreven door mensen die het antwoord niet van tevoren weten?**

Als je eval-set gebouwd is door de engineer die de docs geïndexeerd heeft, scoor je het systeem op zijn sterkst mogelijke inputs. Echte gebruikers formuleren queries niet zoals jij. Ze gebruiken synoniemen. Ze laten context weg. Ze stellen samengestelde vragen. Laat vijf niet-engineers elk 30 vragen schrijven. Dat is je echte eval-set.

**2. Ken je je retrieval-recall, los van je antwoordkwaliteit?**

Als je eindantwoord fout is, werd de juiste context dan opgehaald en negeerde de LLM hem? Of werd de juiste context überhaupt niet opgehaald? Dit zijn verschillende fouten met verschillende fixes. De meeste teams meten end-to-end kwaliteit en hebben geen manier om de twee uit elkaar te halen. Voeg een retrieval-only metric toe die vraagt: "zit het document dat het antwoord bevat in de top-k resultaten?" Draai het bij elke eval. Een retrieval-recall van 70 procent is je plafond voor end-to-end correctheid.

**3. Re-indexeer je op een schema dat past bij hoe je docs daadwerkelijk veranderen?**

Als je customer success team de knowledge base dagelijks bijwerkt en jij wekelijks re-indexeert, beantwoord je klantvragen de helft van de tijd met week-oude info. Match het re-index-tempo aan de document-churnrate.

**4. Kan je systeem zeggen "ik heb geen actuele info daarover"?**

Als het antwoord nee is, gaat je LLM verzinnen. Altijd. De belangrijkste eval-vraag in elke RAG-eval-set is er een waar het juiste antwoord "ik weet het niet" is. Als je systeem die vraag zelfverzekerd beantwoordt met verzonnen content, heb je een kalibratieprobleem dat geen enkele prompt-aanpassing oplost.

**5. Log je de top-k opgehaalde chunks voor elke productie-query?**

Zo niet, dan kun je fouten niet debuggen. Als een gebruiker klaagt, moet je kunnen zien welke context de LLM had op het moment dat hij het foute antwoord genereerde. Top-k chunks plus de uiteindelijke prompt loggen is niet onderhandelbaar in een productie-RAG-systeem. Bewaar ze minimaal 30 tot 90 dagen.

## De 4 plekken waar retrieval breekt

Zodra je de diagnose draait, dit is wat er daadwerkelijk breekt onder echte load.

### Faalmodus 1: chunk-grootte mismatch

Je docs zijn elk 2.000 woorden. Je hebt ze gechunkt op 512 tokens. Elke chunk heeft de helft van de context die nodig is om op zichzelf zin te hebben. Retrieval vindt plausibele matches maar ze bevatten niet het daadwerkelijke antwoord.

De fix is niet "gebruik grotere chunks". De fix is om te chunken op de semantische grens, niet de tokengrens. Voor Markdown-docs, chunk op H2-secties. Voor PDF's, chunk op paginagrenzen met overlap. Voor tabulaire data, chunk op rijgroep, splits nooit een rij. Stem je chunking af op de structuur van het brondocument. Tokenisering komt na structuur.

### Faalmodus 2: embedding-drift

Je hebt geïndexeerd met `text-embedding-3-small` zes maanden geleden. Je hebt het embedding-model in je retrieval-code vorige week geüpgraded. Je oude index zit nu in een andere embedding-ruimte dan je nieuwe queries.

Je merkt dit een tijdje niet aan end-to-end metrics omdat de meeste retrievals "dichtbij genoeg" zijn. De drift komt naar boven op edge-case queries waar het verschil tussen rank 1 en rank 5 ertoe doet.

De fix is om opnieuw te indexeren wanneer je embedding-modellen wisselt. Altijd. Meng nooit embedding-modelversies in dezelfde index. Als opnieuw indexeren duur is, versie je indexes en route queries naar de index die past bij hun embedding-model.

### Faalmodus 3: retrieval recall versus precision tradeoff verkeerd ingesteld

Je hebt top-k op 3 gezet omdat langere context duurder is. Drie is goed voor sommige queries en fout voor andere. De foute queries falen stilletjes.

De fix is top-k instellen op basis van query-complexiteit, niet als een globale constante. Een simpele lookup ("hoe laat sluit support in het weekend") heeft top-k 1 of 2 nodig. Een synthesevraag ("vergelijk ons beleid A versus beleid B") heeft top-k 6 tot 10 nodig omdat het beide documenten in context nodig heeft. Gebruik een kleine classifier of heuristiek vooraan om naar de juiste k te routen.

Een goedkopere versie: gebruik altijd een hogere k (zeg 8) en laat de LLM irrelevante chunks negeren. Dit kost meer tokens maar wint meer recall terug. Tradeoff, geen gratis lunch.

### Faalmodus 4: prompt context overflow

Je hebt 8 chunks opgehaald van elk 800 tokens. Dat is 6.400 tokens aan context. Plus je system prompt van 1.500 tokens. Plus de user-query. Je duwt 8.000-plus tokens in voordat er gegenereerd wordt. De LLM negeert chunks 4 tot en met 8 vanwege context-position recency bias.

Dit is de "lost in the middle" faalmodus die sinds 2023 in onderzoek gedocumenteerd is en nog steeds de hele tijd in productie gebeurt. Modellen letten op het begin en einde van contextvensters. Het midden krijgt minder gewicht.

De fix is om de meest relevante opgehaalde chunk als laatste te zetten, vlak voor de user-query. Re-rank je top-k op relevantie en orden ze aflopend. Soms ook: verkort de system prompt om plek te maken voor retrieval. Een system prompt van 500 tokens is bijna altijd genoeg.

## Wat "context engineering" daadwerkelijk betekent

"Context engineering" is de opkomende term in 2026 voor wat vroeger "prompt engineering" heette met retrieval erbij gebouwd. Het is eerlijker omdat wat je daadwerkelijk doet het volledige contextvenster vormen is dat de LLM ziet, niet alleen de door mensen geschreven prompt.

Drie dingen die context engineering in de praktijk betekent:

1. **Beslissen wat in het contextvenster komt en in welke volgorde.** Niet alleen "ophalen en proppen", maar: welke chunks, in welke volgorde, met welke omringende scaffolding.

2. **Beslissen wat er niet in gaat.** De verleiding om meer context toe te voegen wint altijd tenzij je terugduwt. Meer context betekent slechtere attention, hogere kosten, tragere latency. Trek agressief af.

3. **De beslissing herhaalbaar en testbaar maken.** De eerste twee zijn nutteloos als je ze niet kunt reproduceren en kunt verifiëren dat ze werken voor de volgende query. Hier wonen evals.

Als je team geen engineer heeft van wie de functieomschrijving een versie bevat van "context shape", doe je prompt engineering en noem je het context engineering. Het zijn verschillende vaardigheden. De eerste is "schrijf een slimme prompt". De tweede is "ontwerp de data-pipeline die elke prompt tijdens runtime construeert".

## Wat deze week daadwerkelijk te doen

Als je een gelanceerd RAG-systeem hebt en je dit leest met de gedachte "ik ben een van deze faalmodi":

1. Voeg top-k chunk-logging toe aan je productiesysteem. Eén dag werk. Verdient zich terug de eerste keer dat een klant klaagt.
2. Bouw een retrieval-recall metric los van antwoordkwaliteit. Halve dag.
3. Audit je re-index cadans tegen je document-churn. Halve dag.
4. Schrijf 20 eval-vragen over info die je expliciet niet geïndexeerd hebt. Verifieer dat je systeem "ik weet het niet" zegt in plaats van te verzinnen. Twee uur.

Dat is twee dagen werk en het brengt 70 procent van de latente kwaliteitsproblemen naar boven in elk RAG-systeem dat in het afgelopen jaar gelanceerd is.

Als je een gestructureerde lezing van buitenaf wilt op je RAG, de [AI-integratie-audit](/services) dekt precies dit soort systeembeoordeling. De output is een geschreven rapport met de specifieke faalmodi die ik gevonden heb, gerangschikt op impact, met de goedkoopste fix voor elk.

Een werkende RAG-demo en een werkend RAG-product zijn twee verschillende dingen. De brug ertussen is grotendeels retrieval-discipline, eval-eerlijkheid en de bereidheid om alles te loggen tot je kunt bewijzen dat het systeem doet wat je denkt dat het doet.

Verwante leesstof: [RAG vs fine-tuning beslisboom](/blog/rag-vs-fine-tuning-decision-flowchart) dekt de stroomopwaartse vraag "moeten we überhaupt RAG doen". [Wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production) dekt het bredere productie-faallandschap.
