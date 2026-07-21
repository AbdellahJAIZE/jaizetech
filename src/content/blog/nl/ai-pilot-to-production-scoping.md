---
title: "De meeste AI-pilots halen productie nooit. Zo scope je er een die het wel haalt."
description: "De demo werkt, iedereen is enthousiast, en zes maanden later staat er nog niets in productie. De oplossing is bijna nooit technisch. Het zit in hoe je de pilot scopet. Dit is de checklist die ik gebruik voordat ik een regel code schrijf."
published: "2026-05-26"
tags: ["AI-strategie", "productie-AI", "AI-pilot", "scoping"]
ogImage: "/og-image.png"
primaryService: "ai-features"
---

Het patroon komt zo vaak voor dat het bijna een ritueel is. Een team bouwt in twee weken een AI-demo. Hij werkt. Iedereen in de kamer is onder de indruk. De CEO noemt het tegen de raad van bestuur. En zes maanden later is het nog steeds een demo, stilletjes geparkeerd achter een feature flag die niemand durft aan te zetten.

Op precies dit moment word ik er vaker bij gehaald dan op welk ander. De vraag is altijd een variant van "we hebben bewezen dat het werkt, waarom kunnen we het niet live zetten". Het antwoord is bijna nooit technisch. Het model is prima. De pilot was gescopet om indruk te maken, niet om een ontmoeting met echte gebruikers te overleven. Dat zijn twee verschillende taken, en de tweede begint voordat je code schrijft.

Deze post is de scoping-checklist die ik met een klant doorloop voordat we beloven iets te bouwen.

## Waarom de demo tegen je liegt

Een demo is een gecontroleerde omgeving. Jij kiest de input. Je draait hem een paar keer. Levert hij iets goeds, dan maak je een screenshot. Levert hij onzin, dan draai je hem opnieuw. Dat is niet oneerlijk, zo werken demo's nu eenmaal. Maar elk van die comforts verdwijnt in productie.

In productie is de input wat een echte gebruiker ook maar typt, inclusief de lege string, de pdf van 40 pagina's, en de vraag in een taal waar je geen rekening mee hield. Er is geen tweede run, de gebruiker ziet het eerste antwoord. En niemand staat klaar om de goede output te screenshotten en de slechte te negeren. Het systeem moet vaak genoeg goed zijn, op zichzelf, op input die niemand gekozen heeft.

Het gat tussen die twee werelden is waar pilots sneuvelen. De scoping-taak is dus om dat gat op papier te dichten, vóór de bouw, terwijl het nog goedkoop is om je te bedenken.

## De zes vragen die ik stel vóór elke bouw

### 1. Welke ene workflow vervangt of versnelt dit?

Niet "we willen AI in het product". Eén workflow. Een supportmedewerker die tier-één tickets beantwoordt. Een backofficemedewerker die velden van facturen plukt. Een verkoper die een eerste opzet voor een offerte schrijft. Als je de ene menselijke taak waar dit naast staat niet kunt benoemen, heeft de pilot niets om zich tegen af te meten en geen voor de hand liggende plek om te leven.

Smal wint. De succesvolste eerste features die ik live bracht deden één klein ding betrouwbaar. De mislukkingen probeerden op dag één een platform te zijn.

### 2. Wat betekent "goed genoeg om live te gaan" eigenlijk, in een getal?

Dit is de vraag die pilots die live gaan scheidt van pilots die blijven hangen. Vóór de bouw bepaal je de lat. Negentig procent van de facturen geparseerd zonder veldfouten. Tier-één tickets opgelost zonder escalatie in 70 procent van de gevallen. Wat het ook is, schrijf het op als een getal, en bouw de kleine evaluatieset die het meet.

Sla je dit over, dan wordt "is het goed genoeg" een kwestie van mening, en meningen convergeren nooit. Ik schreef over het bouwen van die meting in [een LLM-feature evalueren zonder te gokken](/blog/llm-evaluation-production-continuous-eval). Doe het vóór de bouw, niet na de eerste klacht.

### 3. Wat kost een fout antwoord?

Een chatbot die het verkeerde helpartikel voorstelt kost bijna niets. Een AI die een terugbetaling goedkeurt, een juridische clausule indient, of een patiënt iets vertelt over zijn medicatie kost heel veel. De kosten van het mis hebben bepalen hoeveel van de rest van deze checklist je nodig hebt, en of er een mens in de loop moet zitten.

Teams scopen een pilot routinematig alsof een fout antwoord gratis is, en ontdekken dan tijdens de launch-review dat dat niet zo is. Voer dat gesprek in week één.

### 4. Waar zit de mens, en wat ziet die?

Bijna elke leverbare eerste feature heeft ergens een mens in de loop. De medewerker die de geëxtraheerde velden bevestigt. De agent die het opgestelde antwoord goedkeurt voordat het verstuurd wordt. De vraag is niet óf je er een hebt, maar waar die zit en wat je laat zien.

Toon de mens de zekerheid, de bron, en een makkelijke manier om te corrigeren. Een correctie is geen mislukking, het is je beste trainingssignaal en je goedkoopste verzekering. De menselijke stap goed ontwerpen is vaak belangrijker dan de modelkeuze.

### 5. Wat is het kleinste model dat de lat haalt?

Teams grijpen naar het grootste, duurste frontier model omdat het de veiligste demokeuze is. In productie duikt die beslissing elke maand op de rekening op, en de rekening is groter dan iedereen verwacht. Ik brak uit [wat een productie-LLM-feature echt kost](/blog/cost-of-production-llm-2026), en de modelklasse is daarin een echte knop om aan te draaien.

Stel eerst je kwaliteitslat vast (vraag twee), zoek dan het kleinste, goedkoopste model dat die haalt. Soms is dat een frontier model. Vaak is het een mid-tier model met een goede prompt en wat structuur eromheen. Je weet het pas als je kunt meten.

### 6. Wat gebeurt er op het onfortuinlijke pad?

De demo toont alleen ooit het gelukkige pad. Productie bestaat grotendeels uit onfortuinlijke paden. De lege input. De rate-limit van de vendor om 9 uur op maandagochtend. De misvormde output die de volgende stap breekt. De vraag die naar een mens hoort te gaan en dat niet doet.

Heeft je pilot hier geen antwoord op, dan is het geen pilot, maar een screenshot. Ik behandelde de faalmodi in detail in [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production). Scope het onfortuinlijke pad nu, want daar zit het meeste echte engineeringwerk.

## Een uitgewerkt voorbeeld

Een middelgroot Nederlands logistiek bedrijf wilde "AI gebruiken om klantmail af te handelen". Dat is een platform, geen pilot, en het zou net als de anderen gesneuveld zijn.

We scopeten het naar beneden. Eén workflow: binnenkomende vragen over de bezorgstatus, goed voor 40 procent van hun inbox. Goed genoeg: een correct, onderbouwd antwoord in 85 procent van de gevallen, gemeten op 150 echte oude mails. Kosten van fout: laag, want een mens beoordeelde elke conceptmail voordat die in de eerste fase verstuurd werd. Mens in de loop: de bestaande supportmedewerker, die het concept en de order waarop het gebaseerd was zag, en op verzenden klikte of bijwerkte. Kleinste model: een mid-tier model haalde de lat zodra we het gestructureerde toegang tot het ordersysteem gaven. Onfortuinlijk pad: alles wat niet over de bezorgstatus ging, of onder een zekerheidsdrempel viel, ging onaangeraakt direct naar een mens.

Dat ging live. Niet omdat het model bijzonder was, maar omdat elk van die beslissingen bewust gemaakt is, vóór de bouw, in plaats van ontdekt in productie.

## Wat je deze week kunt doen

Heb je een pilot die vastzit achter een flag, bouw hem dan niet opnieuw. Loop hem langs de zes vragen hierboven en meestal blijkt de blokkade één ontbrekend antwoord, niet het model. Het vaakst is het vraag twee, geen afgesproken definitie van goed genoeg, waardoor niemand kan tekenen omdat er niets is om tegen te tekenen.

Sta je op het punt een pilot te starten, draai dan de checklist vóór de bouw. Het kost een middag en bespaart de zes maanden aan blijven hangen.

Een pilot zo scopen dat hij productie echt haalt is het grootste deel van wat ik doe in een [AI-featurebouw](/services). De oplevering is geen demo. Het is een feature die je team kan aanzetten en aan kan laten.

