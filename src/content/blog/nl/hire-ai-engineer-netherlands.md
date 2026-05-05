---
title: "Een AI engineer aannemen in Nederland"
description: "Drie manieren om senior AI engineering binnen te halen bij een Nederlandse scale-up in 2026. Wat elke optie echt kost, en welke red flags je moet vermijden."
published: "2026-05-04"
tags: ["werving", "fractional CTO", "Nederland", "AI engineering"]
ogImage: "/og-image.png"
primaryService: "fractional-cto"
---

Je hebt AI engineering nodig in je product. De board wil een roadmap voor Q3, je concurrenten shippen features die op magie lijken, en die ene engineer in je team die de OpenAI changelog leest is per ongeluk "de AI persoon" geworden. Dus open je LinkedIn Recruiter en begin je de zoektocht.

Zes maanden later heb je een recruiter betaald, iemand met een geweldig CV aangenomen, gezien hoe diegene een interne demo bouwde die niemand gebruikt, en sta je weer op af. Ik zie dit patroon vaak genoeg bij Nederlandse scale-ups om er een post over te schrijven.

Er zijn drie echte manieren om senior AI engineering binnen te halen bij een bedrijf van 5 tot 50 mensen in Nederland in 2026. Een fulltime hire, een agency engagement, of een fractional advisor. De meeste teams kiezen optie één zonder de andere twee te vergelijken. Dit is wat elke optie echt kost, wanneer welke past, en hoe je de verkeerde vermijdt.

## De drie opties, met eerlijke marktcijfers

**Fulltime hire.** Een mid tot senior AI engineer in Nederland landt ergens tussen 75k en 110k base, met senior specialisten in Amsterdam die over de 130k heen gaan zodra je de schaarstetoeslag op AI-rollen meerekent. Tel daar 30 procent werkgeverskosten bij op (pensioen, vakantiegeld, reserves voor ziekteverlof) en je betaalt 100k tot 170k all-in. Tel een recruiter fee van 15 tot 25 procent van het eerstejaars salaris erbij op en je bent nog 15k tot 30k kwijt voordat de persoon één regel code schrijft.

**Agency engagement.** Nederlandse AI consultancies factureren tussen 950 en 1500 euro per dag voor een senior, meer voor de named-partner shops in de Zuidas. Een typische scope (één feature, end to end, acht tot twaalf weken) landt tussen 60k en 130k. Je krijgt snelheid en een team achter één persoon. Je krijgt ook iemand wiens incentive het is om het project draaiend te houden.

**Fractional CTO of AI advisor.** Twee tot drie dagen per week, embedded in je team, meestal 800 tot 1400 per dag afhankelijk van senioriteit en scope. Maandelijkse burn landt tussen 6k en 20k. Geen recruiter fee, geen exposure op ontslagvergoeding, geen onboarding ramp. De afspraak stopt wanneer je het niet meer nodig hebt. Ik ben hier biased omdat dit is wat ik vanaf juni 2026 ga aanbieden, maar de rekensom is de rekensom.

Je kunt meer lezen over hoe ik dit structureer op mijn [services pagina](/services). De eerlijke versie is dat alle drie de opties een plek hebben. De fout is kiezen zonder de rekensom te maken.

## De verborgen kosten van een verkeerde fulltime hire

Het gepubliceerde salaris is het kleinste deel van de rekening.

Een senior engineer in Nederland heeft ongeveer 8 maanden nodig om volledig productief te zijn in een niet-triviale codebase. Dat is geen probleem van langzame onboarding, dat is een normaal probleem. Half productief de eerste 4 maanden, driekwart productief tegen maand 6, volledig shippen in maand 8. Als je de verkeerde persoon hebt aangenomen, weet je dat meestal pas in maand 5 of 6. Tegen die tijd hebben ze code geschreven die je team jarenlang zal onderhouden.

Reken het door op een verkeerde hire op 95k base.

Recruiter fee van 20 procent. 19k.
Werkgeverslasten voor 8 maanden. Rond de 50k.
Salaris voor 8 maanden. Rond de 63k.
Transitievergoeding plus onderhandelde uitstap onder Nederlands recht. 5k tot 15k voor iemand korter dan twee jaar in dienst.
Opportunity cost van de roadmap die niet geshipt is. Dit is de grote, en niemand zet hem in de spreadsheet.

Je zit op 140k tot 160k aan cash uitgegeven en een team dat nu sceptisch is over de volgende AI hire. Als je runway 18 maanden is, heb je net 7 procent ervan uitgegeven aan een hire die niet werkte.

Dit is geen argument tegen fulltime aannemen. Zodra je twee of meer actieve AI projecten hebt, een duidelijke productrichting, en een bestaande engineer die kan mentoren, is fulltime correct. Het argument is tegen het er standaard voor kiezen.

## Wanneer fractional fulltime verslaat

Fractional past wanneer minimaal drie van deze waar zijn.

Je hebt minder dan 30 uur per week senior AI aandacht nodig. Je hebt één of twee AI projecten, geen vijf. Je hebt nog geen team van AI engineers om te managen, alleen één of twee engineers die er met de juiste begeleiding in kunnen groeien. Je zit nog in de exploratiefase, beslissend wat je gaat bouwen voordat je een jaar bouwen committeert. Je CTO is sterk in backend of product maar heeft nog nooit een model naar production geshipt.

Fractional past NIET wanneer je over minder dan drie maanden launcht en iemand nodig hebt die om 9 uur 's ochtends dagelijkse productbeslissingen neemt in de team Slack. Het past ook niet wanneer het werk echt fulltime is, zoals een recommendation system from scratch herbouwen met een team van vier. Op dat punt heb je een fulltime tech lead nodig, geen advisor.

Het signaal waar ik naar zoek: ben je aan het uitzoeken *wat* je moet bouwen, of probeer je een ding te *bouwen* dat al gespecificeerd is? Fractional is uitstekend voor het eerste. Fulltime of agency wint het tweede.

## Hoe een goed AI engineering interview eruit ziet

De meeste Nederlandse tech interviews leunen nog steeds te zwaar op academische ML. De kandidaat krijgt de vraag om backpropagation af te leiden, attention from scratch uit te leggen, of een leetcode hard op te lossen. Niets daarvan voorspelt of ze een RAG systeem kunnen shippen dat niet hallucineert in production.

Wat beter werkt.

**System design op jouw echte probleem.** Vijfenveertig minuten. Breng een echt probleem mee waar je team op vastzit. Kijk hoe ze denken. Vragen ze eerst naar je data, of springen ze meteen naar model selection? Rekenen ze de inference uit, of nemen ze GPT-4 voor alles aan? Denken ze aan evals voordat ze aan het model denken? Sterke kandidaten stellen vroeg saaie infrastructuurvragen.

**Code review van je bestaande AI feature.** Laat ze 200 regels van je eigen code zien (geanonimiseerd). Vraag wat ze zouden veranderen. Dit is het beste signaal dat je kunt krijgen. Senior engineers zien het prompt injection risico, de ontbrekende retry logica, de stille token budget overrun. Junior engineers complimenteren je variabelenamen.

**De broken-thing vraag.** "Wat was het laatste AI ding dat je geshipt hebt dat brak in production, en hoe heb je het opgelost?" Als ze deze niet kunnen beantwoorden met een specifiek verhaal, hebben ze niet echt geshipt. Ze hebben demo's gebouwd. Er is een verschil. Echte engineers vertellen je over het embedding model dat NaN teruggaf voor lege strings, de Pinecone index die om 3 uur 's nachts zijn quota raakte, de LLM call die JSON met een leading newline begon terug te geven na een model update.

**Cost trade-off vraag.** "Loop me door hoe je zou beslissen tussen fine-tuning, RAG, en een langere prompt voor dit probleem." Luister of ze grijpen naar evals, dollars, en latency, of gewoon "RAG is flexibeler" zeggen.

Als je interview twee coding rondes en een culture chat is, filter je op het verkeerde. Je kunt meer lezen over hoe ik hier over denk op mijn [about pagina](/about), waar ik mijn eigen production achtergrond uiteenzet.

## Red flags in CV's en agency pitches

Een paar patronen die je moeten laten vertragen.

**Buzzword salade.** Een CV dat LangChain, RAG, AI Agents, LLM, Vector DB, Multi-Modal, Fine-Tuning, RLHF, en MLOps opsomt maar niet linkt naar één live URL of production credit. Iedereen kan deze opsommen. Weinigen hebben ze geshipt.

**Geen production credentials.** "Een AI assistent gebouwd" zonder link, zonder bedrijfsnaam, zonder gebruikersaantal, zonder uptime verhaal. De persoon kan briljant zijn. Diegene kan ook nog nooit een echte gebruiker hebben gehad die om 23 uur klaagde.

**Nooit on-call geweest.** AI features falen op interessante manieren. Modellen driften, prompts regresseren na vendor updates, vector indexes raken corrupt, third-party API's throttlen zonder waarschuwing. Als je kandidaat nog nooit wakker is gemaakt door een production AI bug, hebben ze de lessen die ertoe doen niet geleerd.

**Kan kosten niet verwoorden.** Vraag elke senior AI engineer wat hun laatste systeem per 1000 requests kostte om te draaien. Ze zouden het binnen een orde van grootte moeten weten. Als ze hun schouders ophalen, hebben ze gewerkt in omgevingen waar iemand anders de rekening betaalde.

**Demo-kwaliteit portfolio zonder live URL's.** Mooie Streamlit apps, screenshots van indrukwekkende notebooks, een Medium post per maand. Geen live systeem dat je kunt aanroepen. Dit is het meest voorkomende patroon in 2026 omdat LLMs demo's goedkoop maken. Production is nog steeds moeilijk.

De agency versie van deze red flags ziet er zo uit. Een deck met logo's van klanten waar ze discovery werk voor deden maar nooit naar production shipten, case studies die het probleem in detail beschrijven en de uitkomst in vage percentages, en een weigering om de specifieke engineer te noemen die jouw werk gaat doen.

Voor de fractional versie is de red flag iemand die alleen ooit geconsulteerd heeft, nooit een payroll baan heeft gehad. Ze kunnen een geweldige consultant zijn. Ze weten waarschijnlijk niet hoe het voelt om code drie jaar lang te onderhouden.

## Een praktische checklist voordat je iets tekent

Vijf vragen om te stellen aan elke AI engineering hire, agency, of fractional voordat je commit. Gebruik ze in het laatste gesprek, niet het eerste.

1. **Laat me een systeem zien dat je geshipt hebt en dat nog draait.** Geen demo. Een live URL of een klant login. Als ze er geen kunnen produceren, stop hier.

2. **Wat is de duurste AI fout die je in production hebt gemaakt, en wat heeft die gekost?** Je wilt een specifiek bedrag of een specifiek incident. Vage antwoorden betekenen dat ze geen skin in the game hebben gehad.

3. **Loop me door je evals strategie voor een RAG systeem.** Luister of ze het hebben over golden datasets, regression suites, en human-in-the-loop review, of gewoon "we testen het handmatig".

4. **Waar zou je een LLM NIET voor gebruiken in ons product?** Sterke kandidaten hebben een lijst. Zwakke kandidaten denken dat LLMs alles oplossen.

5. **Hoe ga je om met een model vendor die zijn gedrag van de ene op de andere dag verandert?** Dit gebeurde twee keer in 2025 en al één keer in 2026. Hun antwoord vertelt je of ze het hebben meegemaakt.

6. **Wat is je stop-loss?** Wanneer zou je ons vertellen dat deze engagement niet werkt en dat we moeten stoppen? Een senior engineer of advisor die deze niet kan beantwoorden, verkoopt je een permanente retainer.

7. **Wie zit hier nog meer op met je?** Voor agencies, krijg de specifieke engineer aan de lijn. Voor fractional, vraag wat er gebeurt als ze twee weken ziek worden. Voor fulltime, vraag wie ze zouden bellen voor hulp als ze vastlopen op iets buiten hun expertise.

## De korte versie

Een verkeerde fulltime AI hire in Nederland kost je 140k en 8 maanden. Een goede is het beste geld dat je kunt uitgeven, maar alleen wanneer het werk echt fulltime is en de richting vaststaat. Een agency is goed voor het leveren van een gedefinieerde scope op een deadline. Een fractional advisor is goed om uit te zoeken wat je moet aannemen, wat je moet bouwen, en wat je moet stoppen met bouwen, voordat je de 140k uitgeeft.

De meeste Nederlandse scale-ups die ik nu zie zitten in de derde bucket en nemen aan alsof ze in de eerste zaten.

Als je één van deze drie opties voor je team afweegt, is een gesprek van 15 minuten meestal de snelste manier om te weten welke past bij jouw situatie. Je kunt er [hier eentje boeken](/contact). Geen pitch, gewoon een rechte lezing op welk pad zinnig is voor waar je bent.

## Verder lezen

- [Build vs buy AI features: de math voor je CTO](/blog/build-vs-buy-ai-features) — beslis eerst of je überhaupt zelf moet bouwen
- [EU AI Act-checklist voor Nederlandse softwareteams](/blog/eu-ai-act-checklist-dutch-software-teams) — het compliance-werk dat je nieuwe engineer moet oppakken
