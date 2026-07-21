---
title: "De AI-functie die eigenlijk een SQL-query had moeten zijn"
description: "Een veldgids voor over-engineerde AI. Hoe je herkent wanneer je echt een LLM nodig hebt, en wanneer je kosten, latency en onvoorspelbaarheid toevoegt aan een probleem dat gewone code allang oploste."
published: "2026-07-14"
tags: ["AI-functies", "over-engineering", "LLM", "product engineering"]
ogImage: "/og-image.png"
primaryService: "ai-features"
---

Mij wordt gevraagd om veel AI-functies te bouwen. Een flink deel daarvan zou niet moeten bestaan. Niet omdat AI nutteloos is, maar omdat het specifieke probleem voor ons al was opgelost door een databasequery, een rules engine, of vijftig regels gewone code. Iemand greep naar een taalmodel omdat het de spannende tool was, en nu staat er op de roadmap een onbetrouwbare, dure functie waar een saaie betrouwbare weken eerder klaar was geweest.

Dit is de meest voorkomende manier waarop ik AI-budgetten zie verdampen. Dus zo vang je het voordat je bouwt.

## Het teken: je kent het antwoord vooraf

De simpelste test. Als er voor een gegeven input een correct antwoord is dat je met een regel kunt beschrijven, heb je geen model nodig. Je hebt de regel nodig.

"Markeer orders boven 10.000 euro van nieuwe klanten" is een WHERE-clausule, geen classifier. "Stuur dit ticket naar facturatie als het een factuur noemt" is grotendeels keyword-matching met een klein model als terugval, geen volledige LLM-pipeline op elk ticket. Op het moment dat je de logica kunt opschrijven, is een LLM de tragere, duurdere, minder voorspelbare manier om die uit te voeren.

## Waar LLM's echt goed in zijn

Taalmodellen verdienen hun kosten terug op problemen die echt wollig zijn: vrije tekst die niet in een schema past, taken waarbij de input eindeloos varieert, oordeelskwesties waarbij "goed genoeg" het doel is en er geen enkel juist antwoord bestaat. Een rommelige supportthread samenvatten. Gestructureerde gegevens halen uit documenten die allemaal anders zijn opgemaakt. Een eerste versie schrijven van iets dat een mens daarna redigeert.

Let op wat deze gemeen hebben. De input is ongestructureerd, de output verdraagt variatie, en een mens deed het eerder langzaam. Dat is de zoete plek. Ga daarbuiten en elke sterkte wordt een zwakte.

## De drie vragen die ik stel voordat ik bouw

1. **Zou een regel of een query het juiste antwoord kunnen geven?** Zo ja, bouw dat. Je kunt altijd later een model toevoegen voor de staart.
2. **Draait dit een keer, of een miljoen keer per dag?** Een model in een zelden gebruikte admin-tool is prima. Datzelfde model in een hot path is een latency- en kostenprobleem dat je voor altijd beheert.
3. **Wat kost het om fout te zitten?** LLM's zijn probabilistisch. Als een fout antwoord gênant is, prima. Als het geld verplaatst of een juridische claim doet, heb je deterministische waarborgen om het model heen nodig, of helemaal geen model.

## De hybride die meestal wint

De beste ontwerpen zijn zelden alles-of-niets. Doe de deterministische 90% met code en een database, en roep het model alleen aan voor de werkelijk dubbelzinnige 10%. Classificeer eerst met een regel, val terug op het model wanneer de regel twijfelt. Zo blijven je kosten laag, je latency voorspelbaar, en doet je model het ene ding waar het uniek goed in is in plaats van een WHERE-clausule na te doen.

## Waarom dit in 2026 meer telt

Modelaanroepen zijn goedkoper dan vroeger, waardoor over-engineering makkelijker te verbergen is. Een functie die een overbodige LLM-aanroep doet, werkt nog steeds in de demo en komt nog steeds door de review. De kosten duiken later op, als latency die je niet kunt verklaren, een rekening die meegroeit met het gebruik, en een functie die faalt op manieren die gewone code nooit zou doen.

Goede AI-engineering gaat evenzeer over weten wanneer je geen model gebruikt als wanneer wel. Heb je een functie op de roadmap en weet je niet aan welke kant van die lijn hij ligt, dan is dat precies de vraag die het waard is te beantwoorden voordat je bouwt, niet erna.
