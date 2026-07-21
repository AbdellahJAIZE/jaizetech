---
title: "Computer vision op de fabrieksvloer: wat er verandert tussen de demo en de lijn"
description: "Een visiemodel dat 98 procent haalt op een schone testset kan op een echte productielijn waardeloos zijn. Het gat zit in belichting, timing, drift en de kosten van een verkeerde beslissing. Dit is wat er echt verandert als de camera naar de vloer gaat."
published: "2026-06-02"
tags: ["computer vision", "industriële AI", "productie-AI", "kwaliteitscontrole"]
ogImage: "/og-image.png"
primaryService: "cv"
---

Een visiemodel dat 98 procent scoort op een schone testset vertelt je bijna niets over de vraag of het op een productielijn werkt. Ik heb een model met prachtige validatiecijfers uiteen zien vallen op de dag dat het boven een echte lopende band gemonteerd werd, en ik heb een eenvoudiger model met slechtere papieren cijfers jarenlang zien draaien. Het verschil was nooit de architectuur. Het was alles rondom de camera.

Ik heb ruim twee jaar computer vision gebouwd in een industriële omgeving, een Nederlands agritechbedrijf dat visuele kwaliteitscontrole draaide op een lijn met hoge doorvoer. Deze post is wat ik graag van iemand had gehoord vóór de eerste installatie. Sta je op het punt een visieprototype de fabrieksvloer op te nemen, lees dit dan eerst.

## De testset is een laboratorium. De lijn niet.

Je testset is waarschijnlijk verzameld onder goede omstandigheden. Fatsoenlijk licht, schone lens, producten één voor één gepresenteerd, gefotografeerd door iemand die er om gaf. De lijn is het tegenovergestelde van dat alles, en elk verschil vreet stilletjes aan je nauwkeurigheid.

### Belichting beweegt, en je model voelt het

Dit is de grootste bron van productiedrift die ik gezien heb. Zonlicht door een dakraam om 15 uur in juni is niet hetzelfde als diezelfde lijn om 8 uur in december. Een lamp veroudert en verschuift van kleur. Iemand installeert een nieuw armatuur verderop in de hal. Niets daarvan is zichtbaar voor een menselijke operator, die zich zonder erbij na te denken aanpast. Je model past zich niet aan. Het is getraind op het licht dat het zag, en een ander licht is een andere verdeling.

De oplossing is saai en ze werkt. Beheers het licht. Sluit de inspectiezone af, gebruik consistente industriële belichting, en behandel de lichtopstelling als onderdeel van het model, want dat is het. Een model plus een afgeschermde lichtbox is een systeem. Een model plus wat het gebouw toevallig aan het doen is, is een gok.

### Timing is nu onderdeel van het probleem

In een notebook is inferentietijd een getal waar je even naar kijkt. Op een lijn die meerdere stuks per seconde verwerkt, is het een harde randvoorwaarde. Doet de lijn zes stuks per seconde, dan heb je ruim onder de 166 milliseconden per stuk inclusief opname, overdracht, inferentie en de beslissing, of je begint stuks te laten vallen of de lijn te vertragen. Geen van beide is acceptabel voor de mensen die de lijn draaien.

Daarom wint het grootste model zelden op de vloer. Een model dat 0,5 procent nauwkeuriger is maar twee keer zo traag, kan de verkeerde keuze zijn als traag betekent dat er een fysieke wachtrij ontstaat. Je optimaliseert voor nauwkeurigheid-binnen-het-tijdbudget, en dat is een ander doel dan nauwkeurigheid alleen.

### Producten arriveren in standen die je nooit fotografeerde

Op de lijn is het object gedraaid, deels verdekt door het exemplaar erachter, soms twee aan elkaar geplakt, soms nat, soms bedekt met het stof van wat er verwerkt wordt. Je schone testset had niets van dit alles. Het model komt het voor het eerst tegen in productie, en dat is de slechtste plek om wat dan ook tegen te komen.

Je kunt niet elke stand vooraf fotograferen, maar je kunt wel stoppen met doen alsof de schone set representatief is. Augmenteer agressief voor rotatie, occlusie en belichting. Verzamel daarna continu lastige gevallen van de live lijn, want de lijn verzint altijd iets wat je augmentatie niet deed.

## Een verkeerde beslissing kost iets specifieks, en je moet weten wat

In een demo voelen een vals positief en een vals negatief symmetrisch. Op een lijn zijn ze dat bijna nooit, en de asymmetrie hoort het hele ontwerp te sturen.

Denk na over wat elke fout eigenlijk doet. Een onterechte afkeur gooit een goed product weg, dat is verspilling, meetbaar in euro's per stuk. Een onterechte goedkeuring laat een slecht product door naar een klant, en dat kan een klacht, een terugroepactie of een veiligheidskwestie zijn, vaak veel duurder dan de verspilling. Die twee getallen zijn zelden gelijk, dus de drempel die ze in balans brengt is zelden 0,5.

Ik heb drempels bewust op overafkeuring gezet omdat een onterechte goedkeuring op die specifieke lijn twintig keer duurder was dan een goed exemplaar weggooien. Dat is geen modelbeslissing, het is een bedrijfsbeslissing die het model moet dienen. Voer die expliciet, met de echte kosten van elk fouttype, voordat je een werkpunt kiest.

## Het model gaat driften, dus plan om het te betrappen

Een lijnmodel is geen ding dat je één keer oplevert. De wereld die het bekijkt verandert. Nieuwe leverancier, net iets ander product. Het seizoen verandert het licht. Een camera wordt tijdens onderhoud verschoven. Elk van die dingen verschuift de inputverdeling, en de nauwkeurigheid verslechtert stilletjes, zonder een fout in de logs.

De fout is opleveren zonder enige manier om dit te zien gebeuren. Je hebt een feedbackloop nodig. Log een steekproef van beslissingen met hun beelden. Laat een operator een deel ervan bevestigen of corrigeren. Volg de bevestigde nauwkeurigheid over weken, niet de validatienauwkeurigheid van de trainingsdag. Zakt het live cijfer, dan hertrain of herijk je voordat het een kwaliteitsincident wordt in plaats van erna. De meeste faalmodi hier zijn dezelfde operationele gaten die ik beschreef in [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production), alleen gericht op een camera in plaats van een API.

## Operators zijn onderdeel van het systeem, geen obstakel

De mensen die de lijn draaien weten dingen die je model niet weet. Ze weten dat deze batch altijd op het randje zit, dat de camera op station drie haperig is sinds het onderhoud, dat het model nerveus wordt als de ochtendzon erop valt. Behandel ze als sensoren en als de mens-in-de-loop, niet als gebruikers om omheen te ontwerpen.

Geef ze een eenvoudige manier om een verkeerde beslissing te markeren en om te zien waarom het model besloot wat het besloot. Die markering is je goedkoopste en meest relevante trainingsdata, verzameld uit precies de verdeling waar het je om gaat. Een model dat operators vertrouwen wordt gebruikt. Een model dat ze zonder uitleg overruled, gaat de eerste rustige week uit, en dan heb je een dure camera die niets doet.

## Wat je controleert vóór de eerste installatie

Verplaats je een visieprototype naar een echte lijn, loop deze lijst dan langs voordat je iets monteert.

- Is de belichting beheerst en afgeschermd, of ben je overgeleverd aan het gebouw?
- Heb je een hard tijdbudget per stuk, en haalt je model dat met marge?
- Ken je de eurokosten van een onterechte goedkeuring en een onterechte afkeur, en staat je drempel daarop, niet op 0,5?
- Is er een feedbackloop die de bevestigde nauwkeurigheid op de live lijn over tijd meet?
- Kan een operator een verkeerde beslissing in één handeling markeren, en komt die markering bij jou terug?

Kun je deze niet beantwoorden, dan is het prototype niet klaar voor de vloer, hoe goed de testcijfers er ook uitzien. Ik ging dieper in op de engineeringlessen in [zeven dingen die ik leerde van industriële computer vision](/blog/production-computer-vision-industrial-7-lessons).

Een visiemodel van een veelbelovend prototype naar iets brengen waar een productieleider op een live lijn op vertrouwt, is specifiek werk, en het is onderdeel van wat ik doe als [computer vision engineer](/services). De winst is geen betere score op je testset. Het is een systeem dat de lijn kan draaien zonder erop te letten.

