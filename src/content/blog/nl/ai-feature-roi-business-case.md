---
title: "AI-feature ROI: het model dat waarde meet vóór de build"
description: "Zo bereken je AI-feature ROI vóór er een regel code is: vier waardehefbomen, een eerlijke kostenstack en de korting die je moet toepassen op elke demo-score."
published: "2026-10-04"
tags: ["AI-feature ROI", "business case", "SaaS", "AI-implementatie", "kostenraming"]
ogImage: "/images/blog/ai-feature-roi-business-case/cover.jpg"
primaryService: "ai-features"
---
Het budget is goedgekeurd. Iemand boven je heeft in een planningssessie ja gezegd tegen "een AI-feature", en nu moet jij de one-pager schrijven die het onderbouwt — voordat er één regel code bestaat, voordat er een leverancier is gekozen, voordat iemand je kan vertellen wat het per maand kost om te draaien. En de vraag die je nog niet kunt beantwoorden is precies de enige die finance interesseert: wat is de **AI-feature ROI**, en hoe zeker ben je van dat getal?

Ik heb aan beide kanten van dat document gezeten. Ik ben de engineer geweest wiens offerte in een business case werd geplakt die ik nooit heb gezien, en ik ben de persoon die een founder drie maanden later belt om uit te leggen waarom de voorspelde besparing in geen enkel rapport terug te vinden is.

Het patroon is consistent: de kostenkant van die modellen is ongeveer goed, en de waardekant is fictie. Dus hier is het raamwerk dat ik echt gebruik om een AI-feature door te rekenen vóór de bouw — vier waardehefbomen, een eerlijke kostenstack, een uitgewerkt model voor een support-ticketfeature bij een SaaS-bedrijf van 40 man, en de korting die je moet toepassen voor productierealiteit. Plus het ene getal waarmee je een slecht AI-project in de business-casemeeting kunt afblazen in plaats van in maand vijf.

## Het overleg waarin je een budget moet verdedigen dat je nog niet kunt prijzen

Jouw situatie heeft een specifieke vorm. Je hebt een grof idee van wat de feature doet. Je hebt geen offerte, geen modelkeuze, geen data-audit, geen latency-target. Je hebt een deadline voor een slide.

De reflex is eerst offertes ophalen en daar de case rond bouwen. Dat is omgekeerd, en je geeft de framing weg aan wie het laagst biedt. Het getal van een leverancier vertelt je de prijs van iets bouwen; het vertelt je niets over de vraag of dat iets het bouwen waard is. Erger: het ankert je CFO op een bedrag waarin [meestal drie of vier van de zeven lagen van een echte build ontbreken](/blog/full-ai-feature-build-scope-cost), waardoor het eerste meerwerk overkomt als jouw fout.

Bouw eerst het waardemodel, met je eigen operationele data — die je al hebt. Dan wordt de offerte een test: past deze prijs binnen een terugverdientijd die ik kan verdedigen? Dat draait de machtsverhouding om in elk leveranciersgesprek dat je nog gaat voeren.

## Waarom de meeste AI-feature ROI-cases falen: de build wordt geprijsd, de waarde geraden

Dit is de structuur van vrijwel elk ROI-model dat mij wordt voorgelegd. Kosten: een bouwofferte, plus een regel "API-kosten" die een factor drie mis zit. Waarde: "bespaart het supportteam 30% van hun tijd." Die 30% kwam uit niets. Niemand heeft het gemeten, niemand heeft gedefinieerd wélke 30%, en niemand heeft gevraagd of 30% van iemands tijd omzet in geld of alleen in een iets minder drukke collega.

![AI-feature ROI: het model dat waarde meet vóór de build](/images/blog/ai-feature-roi-business-case/1.jpg)

De diepere fout is waarde modelleren op demo-accuraatheid. Iemand heeft veertig voorbeelden door een prompt gehaald in een notebook, zevenendertig zagen er prima uit, en 92% werd input voor een spreadsheet. Die 92% is gemeten op gecureerde voorbeelden, met een mens die de inputs koos, op de verdeling van problemen die de bouwer al kende. Productie-accuraatheid op de echte verdeling — rommelige taal, Nederlands en Engels door elkaar, bijlagen, drie vragen in één bericht, de 8% gevallen die oprecht ambigu zijn — landt substantieel lager. In mijn ervaring zit het eerlijke gat tussen een gecureerde demoscore en een eerste-maands productiescore ergens tussen 10 en 25 punten, en het is het grootst precies daar waar de demo het meest indrukwekkend leek.

Dat gat verlaagt je ROI niet proportioneel. Het verlaagt hem meer dan proportioneel, want output onder de bruikbaarheidsdrempel levert geen nul waarde op — die levert negatieve waarde op. Een supportmedewerker die een concept moet lezen, wantrouwen en herschrijven is langzamer dan iemand die zelf begint te typen.

Het model heeft dus drie dingen nodig die het standaardmodel niet heeft: waarde uitgedrukt per geslaagde output, een expliciete productiekorting, en een kostenkant die de onderdelen bevat die niemand offreert.

## De vier waardehefbomen, en welke productie overleven

Elke AI-feature business case valt uiteen in een mix van vier hefbomen. Ze zijn niet even echt.

**1. Tijdwinst (arbeid).** De populairste en de zwakste. Het wordt alleen geld als de uren converteren — als je een hire voorkomt, inhuur afbouwt, of de vrijgekomen capaciteit groei absorbeert waar je anders voor had moeten bemensen. "Het team krijgt 4 uur per week terug" is geen regel op een P&L. Vraag je af, vóór je het modelleert: wat wordt er concreet níet meer gekocht? Is het antwoord niets, dan kort je deze hefboom met 50–70% en zeg je dat hardop in het overleg. Die eerlijkheid koopt je krediet voor de hefbomen die wél overeind blijven.

**2. Omzetgroei.** Sterkst als het mechanisme kort is. Snellere eerste reactie die trial-naar-betaald verhoogt. Een feature die een hogere prijsschijf ontsluit. Sales engineers die RFP-vragen in een middag afhandelen in plaats van een week. Modelleer dit alleen waar je de conversiestap kunt benoemen én er al een baseline voor hebt. Moet je de baseline verzinnen, dan is deze hefboom nul.

**3. Vermeden kosten.** Meestal het best verdedigbaar: de BPO-plekken die je niet verlengt, het herstelwerk door handmatige invoerfouten, de SLA-credits die je stopt te betalen, de fte in het hiringplan die je schrapt. Verdedigbaar omdat het verwijst naar een besluit dat iemand al nam en een getal dat iemand al ondertekende.

**4. Risico en optionaliteit.** Minder compliance-exposure, concurrentiepariteit, kennisopbouw in huis. Echt, en ik zou er nooit tegen pleiten — maar zet het in het model op **nul euro** en benoem het als een kwalitatieve alinea. Het moment dat je een getal op strategische waarde plakt, wordt je hele spreadsheet onderhandelbaar.

Een regel waar ik me aan hou: kunnen hefbomen 2 en 3 samen de terugverdientijd niet dragen, dan is het project waarschijnlijk een efficiëntieluxe en geen build. Soms is de eerlijke conclusie dat [de feature eigenlijk een SQL-query en een geplande rapportage had moeten zijn](/blog/ai-feature-that-should-have-been-sql-query), en dat ontdekken in de business case is de goedkoopste uitkomst die bestaat.

## De kostenkant eerlijk opbouwen, in ranges in plaats van een best case

Vier kostenlagen. Gebruik ranges, geen punten, en laat de range in het document staan.

- **Bouw.** Wat je offerte ook zegt, plus contingency voor de lagen die meestal ontbreken: evals, observability, prompt-versiebeheer, het beheerscherm dat iemand moet gebruiken, dataplumbing. Een full build is een traject van zes tot twaalf weken voor een senior engineer die het end-to-end bezit; impliceert een offerte veel minder, dan prijst hij het prototype. [Vier realistische doorlooptijden voor AI-feature builds](/blog/how-long-to-build-an-ai-feature) is een betere sanity check dan onderbuik.
- **Inference en infra.** Modelcalls, retries, embeddings, re-ranking, vector store, logging. Retries en groeiende context blazen dit op, niet de prijs per token op de homepage. Ik heb de rekensom uitgeschreven in [wat een productie-LLM-feature in 2026 echt kost](/blog/cost-of-production-llm-2026); gebruik die vorm in plaats van een pricing page.
- **Onderhoud en model drift.** Begroot elke maand engineeringtijd, permanent. Prompts verouderen, providers deprecaten modellen, je dataverdeling schuift. In mijn ervaring vraagt een live AI-feature ruwweg een halve dag tot twee dagen engineeringaandacht per maand om op launchkwaliteit te blijven.
- **Human-in-the-loop.** Reviewwachtrijen, escalaties, labelen voor evals. Dit is een echte operationele kostenpost en hij eet vaak een flink deel van hefboom 1 op.

## Een uitgewerkt ROI-model: supportconcepten bij een SaaS-bedrijf van 40 man

Concreet, zodat je de vorm kunt kopiëren. Een B2B-SaaS-bedrijf, zes supportmedewerkers, 2.000 tickets per maand. De feature schrijft eerste antwoorden voor op basis van de kennisbank en eerdere tickets.
Scope          2.000 tickets/mnd × 60% concipieerbaar  = 1.200
Geaccepteerd   × 70% acceptatie in productie           =   840
Gebruikt       × 75% van de medewerkers gebruikt het   =   630
Tijdwinst      × 4 min per geaccepteerd concept        = 2.520 min/mnd
               = 42 uur/mnd × €45 loaded cost          = €1.890/mnd bruto

Runkosten      inference + infra  ~€200/mnd
               onderhoud (1 eng-dag/mnd) ~€900/mnd     = €1.100/mnd

Netto waarde per maand                                 =   €790/mnd
Bouwbudget dat in 12 maanden terugverdient             = ~€9.500

Let op wat hier gebeurde. Elke input is bewust onheldhaftig: 60% in scope in plaats van "alle tickets", 70% acceptatie in plaats van de 92% uit de demo, 75% adoptie in plaats van 100%, 4 minuten in plaats van "de helft van de handle time". En de uitkomst is dat de arbeidshefboom alléén een bouwbudget draagt dat de meeste serieuze full builds overschrijden.

Dat is geen argument tegen het project. Dat is het argument om de tweede hefboom te vinden. In de echte versie van deze case was dat vermeden kosten: het bedrijf had twee supporthires in het plan voor volgend jaar staan à ruwweg €55k en kon er één uitstellen, plus een eerste-reactietijd die van 6 uur naar onder de 30 minuten ging en die in enterprise-inkooptrajecten meetelde. Die twee regels bewogen de terugverdientijd van marginaal naar evident — en cruciaal: beide verwezen naar getallen die al in iemand anders' spreadsheet stonden.

## De productierealiteitskorting die je moet toepassen

Drie vermenigvuldigers, expliciet en zichtbaar toegepast:

**Accuraatheidskorting.** Neem de score die vandaag bestaat en snijd erin. Komt het getal uit een notebook met handgekozen voorbeelden, modelleer productie dan 15 punten lager en schrijf op waarom. Komt het uit een held-out set op echte historische data met een gedefinieerd slaagcriterium, snijd 5. Is er helemaal geen gemeten getal, dan heb je geen waardemodel — dan heb je een hoop. De uitweg is een gemeten baseline op echte data vóór je commit, en dat is precies wat [een pilot scopen die productie wél haalt](/blog/ai-pilot-to-production-scoping) oplevert.

**Adoptiekorting.** Features waar mensen omheen kunnen, worden omheen gelopen. Ga uit van 60–80% adoptie in maand drie, tenzij de AI-stap de enige route door de workflow is. Is hij verplicht in de flow, dan mag je hoger — en dan moet je om andere redenen checken of dat een goed idee is.

**Onderhoudsslijtage.** Waarde in maand 12 is lager dan in maand 1, tenzij iemand betaald wordt om dat te voorkomen. Modelleer óf aflopende waarde, óf een permanente onderhoudsregel. Nooit beide op nul.

En één vangrail: zet een regel in voor de kosten van foute output. Niet elke AI-fout is even goedkoop. Een fout supportconcept kost een herschrijving; een foute factuurextractie kost een betaling. Raakt je feature geld, juridische tekst of medische inhoud, dan ís die regel de hele business case.

## Wat je je CFO voorlegt, en het getal dat slechte projecten vroeg afblaast

Eén pagina. Hefbomen 2 en 3 met bron, hefboom 1 gekort én gelabeld als gekort, hefboom 4 als proza zonder euro's. Kosten als range over alle vier lagen. Terugverdientijd in maanden, plus de aanname waar die terugverdientijd het gevoeligst voor is. Daarna de aannamelijst zelf, in normale taal, want de geloofwaardigheid van dit document komt van het benoemen van wat het onderuit kan halen.

Het getal waarmee ik open is **waarde per geaccepteerde output versus volledig belaste kosten per poging**. In het model hierboven: €3,00 waarde per geaccepteerd concept, tegen misschien €0,25–0,40 inference en infra per poging, plus geamortiseerde bouw en onderhoud. Mijn vuistregel is dat brutowaarde per geaccepteerde output minimaal 10× de marginale kosten per poging is. Onder 10× is de feature fragiel — een kleine accuraatheidsdip of een groter contextvenster kantelt hem negatief. Onder 3×: niet bouwen; geen enkele vorm van engineering-excellentie redt die ratio.

Dit ene getal doet iets wat een terugverdientijd niet kan: het werkt vóórdat je een offerte hebt, het vertelt je direct of volume een zwakke case kan redden (dat kan, als de unit economics gezond zijn; dat kan niet, als ze dat niet zijn), en het verandert een discussie over enthousiasme in een discussie over rekenen. Weeg je ook een leveranciersproduct tegen zelf bouwen af, reken dan dezelfde ratio voor beide door — de vergelijking die ik uitwerk in [build vs buy voor AI-features](/blog/build-vs-buy-ai-features) gebruikt dezelfde noemers.

## Waar dit een opdracht wordt

Houdt het model stand en besluit je te bouwen, dan is een **Full Build** een traject van zes tot twaalf weken waarin ik de AI-feature en het product eromheen end-to-end bezit — dataplumbing, model- en retrievallaag, evals en monitoring, de UI die je gebruikers aanraken, en een gehardende deployment — met de waarde-aannames uit je business case omgezet in meetbare ship gates in plaats van hoop. Het ROI-model wordt de spec: we instrumenteren exact de acceptatiegraad en tijdwinst die je hebt verdedigd, zodat maand drie realiteit rapporteert en geen anekdote.

De scope van die opdracht staat op [de dienstenpagina](/services). Heb je een business case in concept en wil je de waarde- en kostenaannames laten testen door iemand die dit eerder heeft opgeleverd, [stuur hem op](/contact) — wij kijken graag mee, en een uur op de aannames is goedkoper dan een kwartaal op de verkeerde build.
