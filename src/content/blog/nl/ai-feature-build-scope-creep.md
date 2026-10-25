---
title: "AI-feature scope creep: prijs het voordat het duur wordt"
description: "AI-feature scope creep ontstaat in week drie van een build. Dit proces sorteert verzoeken, prijst ze en houdt de deadline overeind."
published: "2026-10-25"
tags: ["AI-feature scope creep", "scope management", "AI-projecten", "statement of work", "changemanagement"]
ogImage: "/images/blog/ai-feature-build-scope-creep/cover.jpg"
primaryService: "ai-features"
---
Week drie van een full build is het moment waarop het ding echt genoeg begint te lijken om er een mening over te hebben. Retrieval loopt tegen de eigen documenten van de klant, iemand van sales heeft gezien dat het een vraag goed beantwoordt, en dan valt er een bericht in de channel: "mooi, kan hij ook X?" Dat bericht is waar AI-feature scope creep echt begint, en de meeste statements of work hebben er niets over te zeggen.

De papieren dekken meestal twee momenten netjes af. Vóór de build is er een spec, een offerte en een mijlplanning. Na de build zijn er acceptatiecriteria en een oplevering. De zes tot twaalf weken daartussen lopen op goodwill, en dat houdt prima tot het derde verzoek. Dan gebeurt er een van twee dingen: de engineer absorbeert het werk stilletjes en de datum schuift zonder dat iemand dat aankondigt, of iemand zegt "heronderhandelen" en de relatie verandert van temperatuur.

Dit is de workflow die ik draai als er midden in een build een wijzigingsverzoek binnenkomt. Hij kost een dag, levert één pagina op, en die pagina wordt ondertekend of belandt onder fase twee.

## AI-feature scope creep begint de week dat de demo echt wordt

Niemand vraagt in week één om wijzigingen. Er is nog niets om op te reageren. De spec leest zoals iedereen had afgesproken dat hij zou lezen, de architectuurcall is geweest, en week één is vooral datawerk: wat zit er in de bronsystemen, hoe ziet het permissiemodel eruit, wat is daadwerkelijk ophaalbaar.

Verzoeken clusteren rond de eerste demonstreerbare slice, en die landt in een build van zes tot twaalf weken ergens in week drie of vier. Dat is de eerste keer dat een stakeholder gedrag ziet in plaats van een document. Een specregel als "de assistent beantwoordt beleidsvragen met bronvermelding" is abstract tot je hem de verkeerde versie van een beleidsdocument ziet citeren, en dan worden het drie nieuwe eisen over documentversiebeheer.

Die timing is ook precies waarom de paniekreactie verkeerd is. Een wijzigingsverzoek in week drie is het goedkoopste dat je ooit krijgt. Hetzelfde verzoek in week negen, nadat de evals tegen het oude gedrag zijn geschreven en de integratie is aangesloten, kost een paar keer zoveel. Het doel is niet om week-drie-verzoeken te onderdrukken. Het doel is ze snel genoeg te prijzen dat het antwoord komt terwijl ze nog goedkoop zijn.

## Drie plekken waar een wijzigingsverzoek midden in de build vandaan komt

Het is niet allemaal hetzelfde, en door het hetzelfde te behandelen krijgt een redelijke klant het gevoel dat hij tegen een muur praat. In mijn ervaring vallen die verzoeken in drie bakken uiteen, en elke bak verdient een ander antwoord.

![AI-feature scope creep: prijs het voordat het duur wordt](/images/blog/ai-feature-build-scope-creep/1.jpg)

**De stakeholder die het eindelijk zag.** Iemand buiten de buildloop heeft de demo gezien en merkt op dat er iets mist. Die verzoeken zijn vaak klein in woorden en groot in werk: "kan hij ook de Nederlandse documenten aan", "kunnen gebruikers het antwoord corrigeren", "kunnen we zien welke chunks hij gebruikte". Soms zijn ze echt triviaal. De eerlijke reflex is niet ja of nee zeggen, maar gaan meten, want het gat tussen hoe een verzoek klinkt en wat het kost is in AI-werk breder dan in CRUD-werk.

**De build die de werkelijkheid ontdekt.** Deze komt van mijn kant, niet van de klant. De export blijkt gescande pdf's te bevatten waar niemand over sprak, het ERP biedt een SOAP-endpoint in plaats van de REST-API die in de documentatie stond, de ground-truth set heeft 40 bruikbare voorbeelden en geen 300. Dat is helemaal geen scope creep, ook al ziet het er op een burndown precies zo uit. Dit zijn de [data-gereedheidsproblemen](/blog/ai-feature-data-readiness-checklist) die week één had moeten blootleggen, die laat naar boven komen. Als ik het heb gevonden, is het gesprek van mij, en dat staat expliciet in de change order.

**De wereld die beweegt.** Een provider deprecieert een model, legal komt terug uit een EU AI Act-review met een logging-eis, een concurrent levert iets en de board stelt een nieuwe vraag. Niemand heeft schuld. Hier hangen meestal harde externe deadlines aan, wat dit de gevaarlijkste categorie maakt voor de planning, omdat de druk om het maar te absorberen hier het hoogst is.

Het verzoek sorteren vóór je het beoordeelt scheelt je later een discussie. Een week-drie-verzoek uit bak twee mag nooit als factuur bij de klant aankomen.

## Wat een SOW op mijlpalen al absorbeert

Veel van wat een wijzigingsverzoek wordt genoemd, is gewoon de build die werkt zoals bedoeld. Als de SOW rond mijlpalen en acceptatiecriteria is geschreven in plaats van rond een takenlijst, zit er al ruimte voor iteratie in, en op een change order staan voor elke aanpassing is de snelste manier om een klant te laten stoppen met dingen melden.

Werk dat geen change order nodig heeft:

- Prompts herschrijven, few-shot wijzigen, system prompt herstructureren
- Van model wisselen, of een goedkoper model toevoegen voor een deel van de calls
- Retrieval tunen: chunkgrootte, overlap, reranking, hybride search, metadatafilters
- De evalset laten groeien, faalgevallen toevoegen die tijdens de build opduiken
- UI-teksten, lege states, foutmeldingen
- Alles wat gedrag repareert dat de afgesproken acceptatiecriteria al beschrijven

Die lijst is geen vrijgevigheid, zo wordt het werk gedaan. Als [mijlpalen aan aantoonbaar gedrag hangen in plaats van aan kalenderdata](/blog/ai-feature-build-milestones-payment), dan is de route naar dat gedrag mijn probleem, en ik factureer niet voor het kiezen van een andere route.

De toets of iets over de grens gaat is smal, en ik pas hem elke keer hetzelfde toe. Een verzoek heeft een change order nodig als het één van drie dingen doet: een nieuwe databron toevoegen, een nieuw integratievlak toevoegen, of een acceptatiecriterium veranderen. "Maak de bronvermelding betrouwbaarder" is buildwerk. "Index ook SharePoint" is een nieuwe databron. "Laat gebruikers het antwoord ook aanpassen en terugschrijven naar het CRM" is een nieuw integratievlak plus een nieuw criterium.

Zeg hardop welke van de drie het is. De helft van de frictie in een change order bij een AI-project komt doordat de klant niet weet waarom dít verzoek geld kost en het vorige niet.

## De impactanalyse die draait voordat iemand ja zegt

Beantwoord een wijzigingsverzoek nooit in de thread waarin het binnenkwam. Het antwoord dat het meest kost is het snelle zelfverzekerde antwoord, en vooral "ja hoor, dat is klein". Neem een dag, draai de analyse, kom terug met één pagina. Ik streef naar twee werkdagen, en voor de meeste verzoeken is het echte werk een paar uur.

Vijf dingen die de analyse moet vaststellen:

**Wat het architectonisch raakt.** Past het verzoek in de vorm die er al staat, of opent het één van [de architectuurkeuzes uit week één](/blog/ai-feature-architecture-decisions) opnieuw? "Nederlandse documenten toevoegen" past als het embeddingmodel meertalig is, en kost je de week als dat niet zo is. Dit is de vraag die een schatting van twee dagen in twee weken verandert, dus hij staat vooraan.

**Builddagen.** Niet alleen implementatie. Nieuw gedrag vraagt nieuwe evalcases, en nieuwe evalcases vragen gelabelde voorbeelden, wat meestal betekent dat iemand aan klantzijde ook tijd kwijt is. Die klanturen schat ik ook en zet ik in het document, want een change order die de eigen inspanning van de klant verstopt wordt goedgekeurd en loopt dan vast.

**Runtimekosten.** Een extra retrieval-pass, een grotere context, een tweede modelcall om te verifiëren: elk daarvan verandert de kosten per request en het latency-budget. Als de feature een kostendoel heeft, en dat zou moeten, dan zegt de analyse wat de wijziging daarmee doet in euro's per duizend requests. Hier komen [de lagen die de meeste offertes vergeten](/blog/full-ai-feature-build-scope-cost) terug om je te bijten.

**Wat het verdringt.** Met één senior engineer in een vast venster komt elke extra dag uit een andere dag. De analyse noemt het specifieke werk dat opschuift, niet "de planning kan worden beïnvloed".

**De nieuwe datum.** Eén datum, met de mijlpaal waar hij aan hangt.

## "Ja, maar" is meestal het juiste antwoord, en het heeft een prijs

Plat weigeren is zelden goed en plat accepteren is nooit goed. Het nuttige antwoord biedt drie concrete vormen en laat de klant kiezen.

**Ruilen.** De wijziging gaat erin, iets van vergelijkbare omvang gaat eruit, de einddatum blijft staan. Dit is mijn standaardvoorstel, en het is de optie die klanten te weinig gebruiken omdat iets laten vallen voelt als verliezen. Meestal is het voor hen de goedkoopste uitkomst. Zodra een klant de echte ruil ziet (Nederlandse documenten erin, inline antwoorden aanpassen eruit), wordt het gesprek snel concreet en trekt het verzoek zich soms zelf terug.

**Verlengen.** De wijziging gaat erin, het venster groeit met een genoemd aantal dagen, de kosten groeien mee. Prima voor verzoeken met echte businesswaarde erachter, slecht voor verzoeken die bestaan omdat iemand de demo leuk vond.

**Uitstellen.** De wijziging gaat op een fase-twee-lijst met de schatting eraan vast. Uitstellen is geen nette nee als de schatting echt is en de lijst gedeeld wordt. De meeste van deze verzoeken horen hier, en een klant die zijn idee vastgelegd ziet staan met een getal ernaast stopt meestal met duwen op oplevering in week drie.

Wat dit laat werken, is dat onder alle drie opties dezelfde rekensom ligt. Niemand onderhandelt over de vraag of het verzoek redelijk is. Ze kiezen tussen drie geprijsde uitkomsten.

## De wijziging die betekent dat de scope fout was, niet de klant

Er is één categorie die anders wordt behandeld, en die eerlijk herkennen is het verschil tussen een build die goed eindigt en een build die eindigt in een inkoopvergadering.

Sommige verzoeken zijn geen toevoegingen. Het zijn dingen waarzonder de feature niet gebruikt kan worden, en die niemand tijdens het specificeren opmerkte omdat de spec outputs beschreef en niet de workflow eromheen. Een assistent die correct antwoordt maar de gebruiker geen manier geeft om het bronddocument te openen. Een extractiepipeline zonder route voor een mens om een foute extractie te corrigeren, in een proces waar correcties routine zijn. Een classifier zonder audit trail, in een team dat geaudit wordt.

De tell is simpel: als de beoogde gebruiker zijn eigenlijke werk niet kan afmaken zonder dat ding, dan viel het nooit buiten scope. Het miste in de spec. [Een spec-sjabloon dat de end-to-end workflow dwingt op te schrijven](/blog/ai-feature-spec-template-vendor-quotes) vangt de meeste hiervan vóór de build, en wat het mist is een gedeelde misser.

Als dit gebeurt zeg ik dat gewoon en absorbeer ik het werk, of ik splits het als het verzoek naast het ontbrekende stuk ook nieuwe functionaliteit meebrengt. Dat kost dagen. Volhouden dat een feature die niet gebruikt kan worden toch is opgeleverd kost aanzienlijk meer, en de klant die merkt dat je dat deed belt niet terug.

## De clausule die hier een formulier van maakt

Hier is geen jurist voor nodig. Er zijn vier of vijf regels in de SOW nodig die het proces vooraf afspreken, zodat een week-drie-verzoek een formulier start in plaats van een onderhandeling:
Wijzigingsbeheer
1. Elke partij kan op elk moment schriftelijk een wijzigings-
   verzoek indienen.
2. Leverancier levert binnen 2 werkdagen een impactanalyse:
   architectuurimpact, builddagen, delta in runtimekosten,
   verdrongen werk, herziene mijlpaaldatum.
3. Klant kiest één optie: ruilen (scope-neutraal), verlengen
   (nieuwe datum en vergoeding), of uitstellen naar een
   benoemde latere fase.
4. Er start geen werk aan een wijziging voordat de analyse
   schriftelijk is geaccepteerd. Tot dat moment staat de
   oorspronkelijke mijlplanning.
5. Wijzigingen die nodig zijn om de afgesproken acceptatie-
   criteria te halen zijn geen wijzigingsverzoeken en kosten
   niets extra.

Punt 4 is het punt dat de deadline redt. Punt 5 is het punt dat de klant het proces blijft vertrouwen, omdat het de grens in hun voordeel legt op de plek waar die grens hoort.

Een build met deze clausule levert een kort papieren spoor van beslissingen op dat iedereen in maand vier kan herlezen. Een build zonder die clausule levert een datum op die verschoof om redenen die niemand opschreef.

Plan je een full build van zes tot twaalf weken, zet het wijzigingsproces dan in de SOW naast de mijlpalen. Als ik een build end-to-end oppak, staat die clausule erin, en kan ik de impactanalyse in een dag draaien omdat ik degene ben die de architectuurkeuzes maakte die hij raakt. De [full build](/services) dekt de AI-feature en het product eromheen, in handen van één senior engineer voor het hele venster. Zit je nu midden in een build met een verzoek op je bureau en geen proces ervoor, [neem contact op](/contact) en we lopen de analyse samen door.
