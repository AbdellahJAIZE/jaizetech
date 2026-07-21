---
title: "Mag je bedrijfsdata naar OpenAI sturen? Een praktische AVG-lezing voor Nederlandse teams"
description: "Het eerlijke antwoord is meestal ja, met voorwaarden, en soms nee. Dit is hoe je beslist, wat een verwerkersovereenkomst echt moet dekken, en wanneer je de data beter op je eigen infrastructuur houdt."
published: "2026-06-07"
tags: ["AVG", "dataprivacy", "AI-infrastructuur", "compliance"]
ogImage: "/og-image.png"
primaryService: "infrastructure"
---

Dit is de vraag die meer Nederlandse AI-projecten stillegt dan welk technisch probleem ook. Iemand van juridische zaken vraagt "mogen we dit naar OpenAI sturen", niemand weet het zeker, en het project blijft een maand liggen terwijl iedereen wacht op een helder antwoord dat nooit helemaal komt.

Ik ben engineer, geen jurist, en dit is geen juridisch advies. Maar ik heb genoeg teams voorbij precies deze blokkade geholpen om te weten dat de meeste verlamming voortkomt uit het slecht formuleren van de vraag. De echte vraag is nooit "mag AT". Het is "welke data, naar welke aanbieder, onder welke overeenkomst, en is er een manier met minder risico om hetzelfde resultaat te krijgen". Breek het zo af en het antwoord wordt meestal vanzelf duidelijk.

## Eerst de data scheiden, want niet alles is hetzelfde

De reflex is om "onze data" als één eng blok te behandelen. Dat is het niet. Onder de AVG dragen alleen persoonsgegevens de zware verplichtingen, en veel van wat je wilt versturen zijn helemaal geen persoonsgegevens.

Sorteer wat je op het punt staat te versturen in drie bakjes.

- **Geen persoonsgegevens.** Productspecificaties, geanonimiseerde aggregaten, openbare documenten, interne tekst zonder personen erin. Dit draagt geen AVG-verplichting. Je maakt je druk om niets. Verstuur het.
- **Persoonsgegevens, lage gevoeligheid.** Een klantnaam in een ticket, een e-mailadres, een orderhistorie. Dit is gereguleerd maar routine. Het mag, met de juiste overeenkomst en de juiste waarborgen, en daar gaat het grootste deel van deze post over.
- **Bijzondere categorieën of high-stakes data.** Gezondheidsgegevens, alles wat strafrechtelijke gegevens raakt, gegevens over kinderen, of volumes die groot genoeg zijn dat een lek echte schade is. Hier ligt de lat veel hoger en is het eerlijke antwoord vaak "niet naar een algemene API, houd het dichtbij".

De meeste teams ontdekken dat 80 procent van wat ze wilden versturen in de eerste twee bakjes zit. Het project hoeft niet op de lastige 20 procent te wachten. Lever het makkelijke deel, en zet de rest apart.

## Ten tweede, de overeenkomst die er echt toe doet

Stuur je persoonsgegevens naar een aanbieder, dan is die aanbieder jouw verwerker, en de AVG vereist een verwerkersovereenkomst tussen jullie. Dit is geen formaliteit die je even afvinkt. Een paar dingen die ze echt moet vastleggen.

- **Doelbinding.** De aanbieder mag de data alleen verwerken om de dienst aan jou te leveren, niet om er zijn modellen op te trainen. Bij de zakelijke API-niveaus van de grote aanbieders staat trainen op jouw data standaard uit, maar je bevestigt dit schriftelijk, je gaat er niet vanuit.
- **Subverwerkers en locatie.** Waar gaat de data fysiek heen, en wie raakt het verder aan. Voor een Nederlands of EU-bedrijf is dit vaak de kern. Verschillende aanbieders bieden inmiddels EU-dataresidentie en zero-retention-opties. Is data die de EU verlaat jouw blokkade, dan is dit de knop, en dat is een configuratie- en contractvraag, geen reden om het project op te geven.
- **Bewaartermijn.** Hoe lang de aanbieder de data houdt, en of je een zero-retention- of korte-retentieregeling kunt krijgen zodat prompts niet bewaard worden na het antwoord.
- **Beveiliging en meldplicht bij datalekken.** Standaard, maar controleer dat het er staat.

De praktische zet is om de verwerkersovereenkomst en de dataresidentie-opties van de aanbieder te lezen vóórdat de engineering begint, niet erna. Negen van de tien keer ondersteunt het contract al wat je nodig hebt, en was de maand wachten gewoon niemand die het las.

## Ten derde, is versturen überhaupt het juiste ontwerp?

Soms is de schoonste route voorbij de privacyvraag om de gevoelige data helemaal niet te versturen. Drie patronen brengen je een heel eind.

**Minimaliseer voordat je verstuurt.** Verwijder of maskeer de persoonsvelden die het model niet nodig heeft. Vat je een supportthread samen, dan heeft het model zelden de volledige naam en het adres van de klant nodig om het werk te doen. Redigeer aan je eigen kant, verstuur de rest. Minder verstuurde persoonsgegevens is minder risico om te beheren, punt.

**Pseudonimiseer.** Vervang identifiers door tokens vóór de aanroep en map ze daarna in je eigen systeem terug. De aanbieder ziet "Klant 4471", nooit de echte persoon. Dit is een beproefd patroon en het verlaagt je blootstelling aanzienlijk.

**Houd het in huis.** Voor het echt gevoelige bakje, of voor klanten in gereguleerde sectoren die simpelweg niet accepteren dat data hun muren verlaat, draai je een open-weight model op infrastructuur die je zelf beheert. Het gat naar de frontier is genoeg gekrompen dat dit nu een echte optie is, geen compromis. Ik werkte uit wanneer dit zinvol is en wat het kost in [een LLM hosten op je eigen infrastructuur in Nederland](/blog/on-prem-llm-hosting-netherlands).

Het punt is dat "stuur alles naar OpenAI" en "bouw niets" niet de enige twee keuzes zijn. De meeste productiesystemen die ik bouw zitten in het midden, gevoelige data geminimaliseerd of lokaal gehouden, de rest afgehandeld door de beste beschikbare API.

## Hoe dit zich verhoudt tot de EU AI Act

De AVG en de EU AI Act zijn verschillende wetten die verschillende vragen beantwoorden. De AVG gaat over de persoonsgegevens die erin gaan. De AI Act gaat over wat het systeem doet en hoe risicovol dat gebruik is. Je kunt aan de ene voldoen en nog werk aan de andere hebben. Scope je een feature, dan controleer je beide, en de AI Act-kant zette ik in een praktische lijst in [de EU AI Act-checklist voor Nederlandse softwareteams](/blog/eu-ai-act-checklist-dutch-software-teams).

## Een kort beslispad

Als een team mij de "mogen we dit versturen"-vraag brengt, komen we ongeveer zo nog dezelfde dag tot een antwoord.

1. Sorteer de data in de drie bakjes. Het meeste is niet de lastige soort.
2. Lees voor het persoonsgegevens-deel de verwerkersovereenkomst van de aanbieder en zet EU-residentie en zero-retention aan als dat je randvoorwaarden zijn.
3. Minimaliseer en pseudonimiseer zodat je de minste persoonsgegevens verstuurt die het werk nog doen.
4. Houd de echt gevoelige rest op infrastructuur die je zelf beheert in plaats van die door een publieke API te forceren.
5. Controleer de AI Act-vraag apart, want AVG-goedkeuring is geen AI Act-goedkeuring.

Niets hiervan kost een maand. Het kost iemand die het correct formuleert en twee documenten leest.

Een team hier precies van losmaken, met een architectuur die zowel compliant als echt leverbaar is, is onderdeel van wat ik doe aan de [infrastructuur- en integratiekant](/services). De oplevering is een helder datapad dat je zowel aan je CTO als aan je FG kunt voorleggen zonder dat een van beiden terugschrikt.

