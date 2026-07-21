---
title: "Agent-frameworks in 2026: wat overleeft de productie echt"
description: "LangGraph, CrewAI, de nieuwe SDK's. Welke agent-abstracties standhouden onder echte belasting, welke je in maand drie eruit sloopt, en wanneer je het framework beter overslaat."
published: "2026-07-16"
tags: ["AI-agents", "LangGraph", "agent-frameworks", "productie-AI"]
ogImage: "/og-image.png"
primaryService: "ai-agent"
---

Om de paar maanden is er een nieuw agent-framework dat belooft het vorige er primitief te laten uitzien. Ik heb er inmiddels een aantal in productie gebracht en onderhouden, en het patroon is saai voorspelbaar: de demo is altijd geweldig, en het framework waar je in week een verliefd op bent, is het framework waar je in maand drie tegen vecht.

Dus hier is het eerlijke veldverslag. Niet welk framework "het beste" is, maar wat werkelijk overleeft in productie, en wanneer je helemaal geen framework moet pakken.

## De demo is niet het moeilijke deel

Agent-frameworks zijn geoptimaliseerd voor de demo: koppel drie tools, voeg een planner toe, en kijk hoe het redeneert. Dat deel is nu makkelijk, in elk framework. Het moeilijke begint na de demo, en geen framework redt je daarvan:

- **Determinisme wanneer je het nodig hebt.** Echte workflows hebben stappen die precies een keer moeten gebeuren, in de juiste volgorde, met een duidelijk auditspoor. Een agent die "meestal" de juiste tool aanroept, is niet goed genoeg voor iets dat geld of gegevens raakt.
- **Foutafhandeling.** Wat gebeurt er als een tool een time-out geeft, een model onzin teruggeeft, of stap vier stap twee tegenspreekt? Dit is 80% van het echte werk, en juist het deel dat de demo's overslaan.
- **Kosten en latency onder belasting.** Een redeneerlus die zes modelaanroepen per verzoek doet, is prima voor een gebruiker en rampzalig voor duizend.

Als een framework deze drie dingen niet makkelijker maakt, is die mooie planner-abstractie decoratie.

## Wat standhoudt

De abstracties die in productie standhouden, zijn de ongelamoureuze. **Expliciete grafen van stappen** houden stand, omdat je ze kunt lezen, testen, en per node over falen kunt nadenken. **Getypeerde tool-interfaces** houden stand, omdat ze een klasse runtime-rampen omzetten in fouten bij het compileren. **Een harde grens tussen de deterministische delen en de modelaanroepen** houdt stand, omdat je zo de logica kunt unit-testen en het model daar houdt waar het echt waarde toevoegt.

Wat niet standhoudt, is de volledig autonome lus van "geef het een doel en laat het alles zelf uitzoeken". Het is een geweldige demo en een slecht productiesysteem. Elke serieuze agent die ik heb opgeleverd, ging er uiteindelijk minder uitzien als een autonome agent en meer als een gewoon programma dat op een paar goedgekozen punten een model aanroept.

## Wanneer je het framework overslaat

Veel van wat een "agent" wordt genoemd, is een workflow met twee modelaanroepen en een if-statement. Daar heb je geen graaf-framework voor nodig. Je hebt een functie nodig.

Mijn vuistregel: als je de hele flow op een bierviltje kunt tekenen en die minder dan vijf stappen heeft, schrijf hem dan als gewone code die het model aanroept waar nodig. Pak een framework wanneer de flow echt dynamisch is, wanneer de set stappen afhangt van de uitvoer van het model op manieren die je vooraf niet kunt opsommen, en wanneer je het lang genoeg onderhoudt zodat de structuur zichzelf terugverdient.

## De conclusie voor 2026

De frameworks zijn naar elkaar toegegroeid. Ze bieden nu grotendeels dezelfde primitieven, en de verschillen die ertoe doen zijn operationeel: observability, hoe makkelijk je een enkele node kunt testen, hoe netjes het degradeert als een stap faalt. Kies degene waarvan je het faalverhaal begrijpt, houd je deterministische logica uit het model, en laat het woord "agent" je niet praten in een autonoom systeem waar een script betrouwbaarder en een tiende van de kosten was geweest.

Zit je met een agent die in de demo werkt en zich in productie misdraagt, dan is dat precies het gat dat wij voor teams dichten.
