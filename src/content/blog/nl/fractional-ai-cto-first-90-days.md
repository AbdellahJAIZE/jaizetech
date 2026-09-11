---
title: "Fractional AI CTO Inhuren: Wat de Eerste 90 Dagen Echt Kosten"
description: "Overweeg je een fractional AI CTO inhuren? Dit is het eerlijke stappenplan: audit, triage, één live project, roadmap en guardrails in 90 dagen."
published: "2026-09-11"
tags: ["fractional AI CTO", "AI-strategie", "AI-governance", "productie-AI", "Nederlandse SaaS"]
ogImage: "/images/blog/fractional-ai-cto-first-90-days/cover.jpg"
primaryService: "fractional-cto"
---
De meeste founders die me bellen over het inhuren van een fractional AI CTO verwachten dat de eerste maand over bouwen gaat. Dat is niet zo. De eerste maand gaat over uitzoeken wat het bedrijf al heeft, waar het stilletjes geld aan verspilt, en welke van de zes "AI-initiatieven" op de slide deck ook maar enige kans maakt om echte gebruikers te overleven.

Ik heb dit inmiddels vaak genoeg gedaan om te weten dat de vorm van de eerste 90 dagen voorspelbaar is. Niet de uitkomst, die hangt af van het bedrijf, maar de volgorde: audit, triage, een ding dat live gaat, een roadmap die kort genoeg is om te volgen, een team dat het zonder mij kan dragen, en guardrails die er staan voordat ik een stap terug doe. Dit is het eerlijke verhaal van waar je voor betaalt als je een fractional AI CTO inhuren overweegt.

Hoopte je op een silver-bullet AI-overhaul? Lees dan toch door. De overhaul is wat mislukt. De volgorde is wat werkt.

## Waarom bedrijven echt een fractional AI CTO inhuren

Niemand belt omdat het goed gaat. De telefoontjes die ik krijg vallen in drie categorieën.

De eerste is de **vastgelopen pilot**. Iemand heeft acht maanden geleden een RAG-assistent of een documentextractie-flow gebouwd, de demo was prachtig, en sindsdien is het "bijna klaar". De founder kan niet zeggen of het nog twee weken of twee kwartalen duurt, en de engineer die het gebouwd heeft ook niet.

De tweede is de situatie met **vendor-druk**. De board wil "een AI-strategie", drie bureaus hebben gepitcht, een daarvan heeft een platform-build met zes cijfers geoffreerd, en de CTO (als die er is) is een sterke backend-engineer die nog nooit een model in productie heeft gedraaid en dat zelf ook weet.

De derde is de **vastgelopen wervingsronde**. Ze proberen al vier maanden een senior AI engineer aan te nemen, hebben de opties in een spreadsheet gezet, en komen nergens. Ik heb die markt beschreven in [een AI engineer aannemen in Nederland](/blog/hire-ai-engineer-netherlands); de korte versie is dat de mensen die je wilt zeldzaam en duur zijn, en geen zin hebben om de enige AI-persoon te zijn bij een bedrijf dat nog geen AI-richting heeft.

In alle drie de gevallen is de werkelijke behoefte hetzelfde: iemand senior die dit al eerder heeft opgeleverd, die de impopulaire beslissingen neemt, en die daarvoor niet drie jaar op de loonlijst hoeft te staan. Dat is de baan. Het is triage en sequencing, gedaan door iemand met littekens.

## Week 1-2: de audit die niemand wil horen

De eerste twee weken zijn ongelamoureus en ik weiger ze over te slaan. Ik lees code, ik lees de cloudfactuur, ik zit bij standups, en ik praat met elke engineer die iets heeft aangeraakt waar een modelaanroep in zit. Ik praat ook met de twee of drie mensen in sales of operations die zouden gebruiken wat er gebouwd wordt, want die hebben meestal een scherper beeld van het probleem dan de deck.

![Fractional AI CTO Inhuren: Wat de Eerste 90 Dagen Echt Kosten](/images/blog/fractional-ai-cto-first-90-days/1.jpg)

Wat uit de audit komt is zelden wat de founder verwachtte. Een paar patronen die ik meer dan eens heb gezien:

- **De "AI-feature" is een query.** Een classificatiestap die bij elk request door een LLM gaat, terwijl het een SQL-filter plus een lookup-tabel had kunnen zijn. Ik heb er een hele post over geschreven: [de AI-functie die eigenlijk een SQL-query had moeten zijn](/blog/ai-feature-that-should-have-been-sql-query). Het komt deprimerend vaak voor.
- **De pilot heeft geen evaluatie.** Niemand kan zeggen of de promptwijziging van vorige maand de assistent beter of slechter heeft gemaakt, want er is geen testset, alleen gevoel en een Slack-thread.
- **De tokenfactuur is een mysterie.** Meestal is er een endpoint dat verantwoordelijk is voor het grootste deel van de kosten, en niemand heeft gekeken.
- **Data gaat ergens heen waar het niet hoort.** Klantgegevens naar een Amerikaanse API zonder verwerkersovereenkomst, zonder dat iemand de vraag heeft gesteld. Geen kwade wil, gewoon niemand die eigenaar is.
- **Er is een schaduwbuild.** Een contractor of bureau heeft stilletjes een tweede versie gebouwd van iets wat het interne team ook heeft gebouwd. Beide zijn half af.

Ik schrijf dit op als een kort document: wat er is, wat het kost, wat er daadwerkelijk wordt gebruikt, wat risicovol is. Twee tot vier pagina's. Geen assessment van 40 slides, want die leest niemand, en omdat het doel is om beslissingen te nemen, niet om te bewijzen dat ik gewerkt heb.

Het gesprek dat daarop volgt is het moeilijkste van de hele opdracht. Iemand aan tafel was de kartrekker van het project dat ik ga aanraden te stoppen. Ik heb geleerd daar direct over te zijn en de persoon te scheiden van de beslissing: het idee was achttien maanden geleden redelijk, de markt is verschoven, dit is wat ik in plaats daarvan zou doen. De founders die het meest uit de opdracht halen, zijn degenen die dat in week twee kunnen horen in plaats van in maand zes.

## Week 3-6: het ene ding kiezen dat live gaat

Na de audit is er altijd een lijst. Zes ideeën, soms tien. De founder wil er vier tegelijk doen. Ik wil er een doen.

Dat is geen voorzichtigheid om de voorzichtigheid. Het is dat een team zonder productie-AI-ervaring een eerste overwinning nodig heeft om de echte vorm van het werk te leren: evaluatie, kostenbeheersing, foutafhandeling, monitoring. Dat op een project doen, leert het je. Op vier tegelijk leert het niets en levert het niets op.

Zo kies ik die ene:

1. **Is het probleem al begrepen zonder AI?** Als niemand kan beschrijven hoe "correct" eruitziet voor een mens die de taak doet, gaat een model het ook niet uitvinden.
2. **Is er een meetbare uitkomst binnen acht weken?** Uren bespaard per week, tickets afgevangen, documenten verwerkt per dag. Iets wat iemand gaat merken.
3. **Is de data er al, en mogen we die gebruiken?** De helft van de kandidaatprojecten sneuvelt alleen al op deze vraag.
4. **Kan het bestaande team het onderhouden?** Als het antwoord een stack vereist die niemand in huis kent, zakt het op de lijst, hoe spannend ook.
5. **Build of buy?** Voor een groot deel van de lijst wint een vendor-product van een paar honderd euro per maand het van een interne build. Ik heb de rekensom uitgeschreven in [build vs buy AI features](/blog/build-vs-buy-ai-features), en precies die rekensom maak ik in week drie.

De winnaar is meestal de minst spannende optie op de lijst. Een interne document-lookup-assistent voor het supportteam. Een extractie-pipeline die het handmatig overtypen van leveranciers-PDF's vervangt. Een triagestap voor een inbox. Dit zijn niet de dingen waar een LinkedIn-post over komt, maar ze gaan live, ze worden gebruikt, en ze leren het team de discipline die het later nodig heeft voor het ambitieuze ding.

Dan scopen we het goed. Ik heb de mechanica van het scopen beschreven in [zo scope je een AI-pilot die productie wel haalt](/blog/ai-pilot-to-production-scoping), en de kern is: definieer de faalmodi en de evalset voordat je de eerste prompt schrijft. In een fractional opdracht pair ik hier de eerste twee weken typisch met een engineer op, en daarna doe ik een stap terug om te reviewen. In week zes staat het ding voor echte gebruikers, ook al zijn het er maar tien.

## Het roadmap-document, en waarom het korter is dan founders verwachten

Rond week zes schrijf ik de roadmap. Founders verwachten een twaalfmaandenplan met kwartalen en swimlanes. Wat ze krijgen is anderhalve pagina.

De reden is dat een langere roadmap fictie is. Het modellandschap verandert elk kwartaal, en het eerste opgeleverde project verandert wat het team gelooft dat mogelijk is. Alles wat ik voor maand negen opschrijf is een gok, en het in detail uitschrijven maakt die gok alleen maar gezaghebbender dan hij is.

Wat er wel in staat:

- **Het ding dat we net hebben opgeleverd**, wat het heeft gemeten, en wat de volgende iteratie is.
- **Het volgende ene project**, gekozen met dezelfde vijf vragen, met een streefdatum en een eigenaar uit het interne team.
- **Een korte lijst van dingen die we expliciet niet doen** en waarom. Dit is de waardevolste sectie. Het voorkomt dat dezelfde drie ideeën elke boardmeeting weer opduiken.
- **De beslissingen die nog open staan**, met de datum waarop ze een antwoord nodig hebben. Modelprovider. EU-hosting of niet. Wel of niet aannemen.
- **De principes**: evaluatie vóór promptwijzigingen, kosten per request vanaf dag een bijgehouden, geen klantdata verlaat de EU zonder een ondertekende reden.

Dat is alles. Het past op een Notion-pagina. Mensen lezen het daadwerkelijk, en dat is het hele punt. Ik heb prachtige AI-strategieën van 30 pagina's gezien bij bedrijven waar niemand onder de founder me kon vertellen wat erin stond.

## Team-enablement: wat verandert er voor de engineers die er al zijn

De grootste fout die een fractional AI CTO kan maken, is een schaduwteam bouwen. Twee contractors binnenhalen die aan mij rapporteren, iets opleveren dat zij bezitten, en het interne team vanaf de zijlijn laten toekijken. Het ziet er drie maanden productief uit, en dan vertrek ik en vertrekt de kennis met mij mee.

Dus het model dat ik draai is het omgekeerde. De interne engineers bouwen het. Ik review, ik haal blokkades weg, ik neem de architectuurbeslissingen, en ik vang de politieke klappen op als een beslissing impopulair is. In de praktijk ziet dat er zo uit:

- **Een engineer wordt de AI-lead**, expliciet, met vrijgemaakte tijd. Meestal een sterke backend-developer die nieuwsgierig en een beetje sceptisch is. Sceptisch is goed; de enthousiastelingen bouwen doorgaans te veel.
- **Wekelijkse design review** van alles wat een model raakt. Dertig minuten. Welke prompt is veranderd, wat zei de evalset, wat deden de kosten.
- **De eval-harness is het eerste wat we samen bouwen**, vóór de feature. Als het team eenmaal een promptwijziging twaalf testcases heeft zien breken, gaan ze nooit meer terug naar opleveren op gevoel.
- **Kosten zijn voor iedereen zichtbaar.** Een dashboard met tokens en euro's per feature per dag. Engineers optimaliseren wat ze kunnen zien.
- **Ik schrijf het "waarom" achter elke architectuurkeuze op** in de repo, niet in mijn hoofd. Waarom we RAG boven fine-tuning kozen, waarom de pipeline een gewone graaf is en geen framework, waarom de fallback naar een kleiner model gaat.

In week tien moet de AI-lead de design review kunnen draaien zonder mij in de kamer. Als dat niet lukt, heb ik mijn werk verkeerd gedaan.

Dit is ook waar wervingsbeslissingen goed genomen worden. Na twee maanden kijken hoe het team werkt, kan ik de founder vertellen of ze een fulltime senior AI engineer nodig hebben, of de lead die ze al hebben er met een paar maanden steun in kan groeien, of dat het eerlijke antwoord is: "je hebt dit jaar geen fulltime AI-hire nodig, je hebt een goede backend-engineer en een vendor nodig". Dat antwoord is meer waard dan het meeste van de code die ik schrijf.

## De governance en guardrails die je neerzet voordat je vertrekt

Governance is een woord waar engineers van gaan grimassen, dus ik houd het concreet. Voordat ik mijn uren afbouw, bestaan deze dingen en is er intern iemand eigenaar van elk ervan:

- **Een datamap.** Welke data gaat naar welke modelprovider, onder welke overeenkomst, waar gehost. Eén pagina. Als een klant of de Autoriteit Persoonsgegevens het vraagt, kun je in tien minuten antwoorden in plaats van in tien dagen.
- **Een EU AI Act-classificatie** van elke AI-feature. Voor de meeste Nederlandse SaaS-bedrijven is het antwoord "beperkt risico, transparantieverplichtingen gelden" en is het werk klein. Voor alles wat werving, krediet of veiligheid raakt, is het niet klein, en het is veel goedkoper om dat in maand twee te weten dan in maand veertien. Ik houd hier een werkende [EU AI Act-checklist voor Nederlandse softwareteams](/blog/eu-ai-act-checklist-dutch-software-teams) voor bij, precies voor deze stap.
- **Een modelwijzigingsprocedure.** De provider deprecateert een model, of brengt een goedkoper model uit. Wie evalueert, tegen welke testset, wie keurt goed. Opgeschreven, want dit gebeurt elk kwartaal.
- **Kostenalerts** op feature-niveau, niet alleen op account-niveau. Een op hol geslagen retry-loop moet iemand wakker maken voordat de finance-afdeling het merkt.
- **Een kill switch** per feature. Feature flag, fallback naar het pad zonder AI. Als de assistent op vrijdagavond retourbeleid begint te hallucineren, kan iemand hem uitzetten zonder deploy.
- **Een incidentlog** voor modelgedrag. Niet alleen storingen; foute antwoorden die een gebruiker hebben bereikt. Dit wordt het zaad van de volgende evalset.

Niets hiervan is exotisch. Het is dezelfde operationele hygiëne die je rond een betaalintegratie zou willen. Het verschil is dat bij AI-features meestal nog niemand het heeft gedaan, dus het moet bewust gebouwd worden.

## Hoe je ziet dat het werkt, en wanneer je het omzet naar iets anders

De eerlijke signalen dat een fractional opdracht werkt, staan niet op een dashboard. Het zijn deze:

- De founder stopt met vendor-pitches naar mij doorsturen en begint ze te beantwoorden met de "doen we niet"-lijst uit de roadmap.
- De AI-lead is het in een design review niet met me eens en heeft gelijk.
- De cloudfactuur is gedaald, of gelijk gebleven terwijl het gebruik steeg.
- Iemand in support of operations noemt de opgeleverde feature uit zichzelf, in een klacht of een compliment. Beide betekenen dat het gebruikt wordt.
- Het tweede project wordt gescoped door het team, niet door mij.

Rond dag 90 moet er een beslissing genomen worden over wat de opdracht wordt. In mijn ervaring gaat het een van drie kanten op.

**Het bouwt af naar een paar uur per maand.** Het team heeft een AI-lead, de guardrails staan, het tweede project is onderweg. Ik blijf aan voor architectuurreviews en een enkele escalatie. Dit is de goede uitkomst en ook de meest voorkomende.

**Het wordt omgezet naar een hire.** Het bedrijf weet nu wat het nodig heeft en kan een echte vacaturetekst schrijven, en ik help bij het interviewen. De kandidaat stapt binnen in een team met een eval-harness, een kostendashboard en een roadmap van een pagina, en dat is een heel ander aanbod dan "word onze eerste AI-persoon".

**Het wordt groter, voor even.** Het eerste project werkte zo goed dat het volgende echt ambitieus is, een agent-workflow over drie systemen, of een computer vision-lijn, en dat heeft een kwartaal lang meer senior handen nodig. Dat is prima zolang het expliciet en time-boxed is, en zolang het interne team eigenaar blijft van het resultaat.

Wat ik probeer te vermijden is de vierde optie: een open-einde retainer waarin ik feitelijk de CTO ben, voor altijd, op parttime-uren. Dat is geen fractional leiderschap, dat is een afhankelijkheid. Het hele punt van de eerste 90 dagen is het bedrijf capabeler achterlaten dan ik het aantrof, niet meer aan mij gehecht.

Herken je je bedrijf in de drie categorieën bovenaan dit stuk, dan zijn de audit, de triage en het eerste opgeleverde project precies waar de [fractional CTO-dienst](/services) omheen is gebouwd.

Staar je naar een vastgelopen pilot, een stapel vendor-offertes of een wervingsronde die maar niet sluit, dan is dat precies het gat dat wij voor teams dichten, en de [contactpagina](/contact) is waar de 90 dagen beginnen.
