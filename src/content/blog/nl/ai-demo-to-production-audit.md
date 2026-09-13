---
title: "Van AI demo naar productie: de audit vóór het budget"
description: "Een werkende AI demo is geen bewijs. Zo audit je de weg van AI demo naar productie in een week, met een twaalfpuntenchecklist voor je budgetgesprek."
published: "2026-09-13"
tags: ["AI in productie", "LLM", "AI-strategie", "concurrency", "AVG"]
ogImage: "/images/blog/ai-demo-to-production-audit/cover.jpg"
primaryService: "ai-audit"
---
De demo ging goed. Iemand in je team heeft in een paar sprints een model aan je data gehangen, het beantwoordde de lastige vraag in het MT, en nu staat er een regel in het budget van volgend kwartaal die zegt "AI-assistent opschalen". Voordat die regel wordt goedgekeurd, moet iemand de vraag beantwoorden die niemand tijdens de demo stelde: wat breekt er op de weg van AI demo naar productie?

Ik heb er genoeg over die lijn getrokken om te weten dat het antwoord bijna nooit "niets" is en bijna nooit "alles". Het zijn meestal dezelfde twaalf dingen, in een voorspelbare volgorde, en de meeste zijn onzichtbaar op een laptop met een gebruiker en een vriendelijke testset. Het gat is geen modelprobleem. Het is een concurrency-probleem, een kostenprobleem, en een "niemand heeft opgeschreven wat correct is"-probleem.

Deze post is de audit die ik in een week op die demo zou draaien, voor het budgetgesprek. Het is geen scoping-gids voor een pilot die je nog niet hebt gebouwd; dat is [hoe je een AI-pilot scopet die productie wel haalt](/blog/ai-pilot-to-production-scoping). En het is niet de incidentenlijst van na de lancering; dat is [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production). Dit is het stuk ertussenin: je hebt iets dat werkt, en je wilt een eerlijke lezing voordat je er geld aan vastmaakt.

## Waarom een werkende demo nergens bewijs van is

Een demo bewijst een ding: het happy path bestaat. Het bewijst niet dat het happy path breed is.

Dit is waar een typische demo daadwerkelijk op draait. Een gebruiker tegelijk. Een testset van twintig tot vijftig vragen, gekozen door degene die het bouwde, wat betekent dat het de vragen zijn waar het systeem op is afgesteld. Documenten die de avond ervoor met de hand zijn opgeschoond. Een persoonlijke API-key op een pay-as-you-go-tier waar niemand de rekening van bekijkt. Een prompt die in een Python-bestand leeft en veertig keer is aangepast zonder dat iemand heeft vastgelegd welke aanpassing wat oploste.

Niets daarvan is nalatig. Het is precies hoe je een demo hoort te bouwen; het doel is goedkoop uitvinden of het idee signaal heeft. De fout is het succes van de demo behandelen als bewijs over productie. De demo vertelt je dat het model de taak op jouw data aankan als alles ervoor is klaargezet. Productie vraagt of het de taak nog steeds doet als niets dat is.

Ik heb teams de 92 procent van de interne testset mee zien nemen naar een budgetmeeting alsof het een productiegetal was. Het is een getal over vijftig vragen die de bouwer koos. Echte gebruikers stellen andere vragen, met slechtere spelling, over documenten die niemand heeft opgeschoond, om 9:05 op maandagochtend, samen met tweehonderd collega's.

## AI demo naar productie: de concurrency-test die bijna niemand draait

Het eerste wat ik doe met een demo die "werkt", is er twintig requests tegelijk op afsturen. Geen loadtest met tooling; een Python-script met `asyncio.gather`, twintig realistische queries en een timer. Het kost een half uur om te schrijven en het heeft me meer verteld over wat gaat breken dan welke architectuurreview ook.

![Van AI demo naar productie: de audit vóór het budget](/images/blog/ai-demo-to-production-audit/1.jpg)

Er gebeuren drie dingen, en meestal kan ik voorspellen welke voordat ik het draai.

**De rate limit van de provider slaat toe.** Elke model-API heeft limieten op requests per minuut en tokens per minuut, per key en per tier, en een demo op een persoonlijke key zit meestal op de laagste. Een RAG-request die zes of acht chunks in de prompt propt is 5.000 tot 10.000 input-tokens. Twintig daarvan in dezelfde seconde en je bent door een low-tier tokenquotum heen voor de tweede batch. Op Azure OpenAI is het equivalent het TPM-quotum per deployment, dat ik regelmatig aantref op demo-formaat en nooit meer herzien. Het symptoom is een 429 die de demo-code niet afhandelt, dus de gebruiker ziet een spinner, en dan niets.

**De latency-curve buigt om.** In de demo duurt een request misschien drie seconden van begin tot eind. Dat is de p50 van een enkele gebruiker. Onder twintig gelijktijdige requests gaan de vector store, de reranker en het model allemaal in de wachtrij, en de p95 loopt op naar vijftien of twintig seconden. Niemand heeft de p95 tijdens de demo gemeten, want er was nooit meer dan een request onderweg. Gebruikers ervaren je p50 niet; ze ervaren je p95, en zonder streaming haken ze ergens rond de acht seconden af.

**Iets wat nooit is ontworpen om gedeeld te worden, valt om.** Het embedding-model dat op de laptop van de bouwer draait. Een SQLite-bestand achter de vectorindex. Een enkele synchrone worker in de FastAPI-app. Een in-memory dictionary met gespreksgeschiedenis die prima werkt tot twee gebruikers elkaars geschiedenis krijgen. Ik heb ze allemaal gezien in demo's die een week van budget verwijderd waren.

Draai de twintig-requests-test voor de meeting. Twintig schone antwoorden onder de zes seconden op p95 en je loopt voor op de meesten. Alles anders, en je weet nu het eerste punt van het plan, en dat is geen modelupgrade.

## Wat er met je unit economics gebeurt bij 10x echte gebruikers

Het kostengetal van de demo is ook geen bewijs. Het kostte vorige maand veertig euro en finance schreef er "verwaarloosbaar" naast. Dat getal schaalt niet lineair, en er stapelen drie vermenigvuldigers bovenop het ruwe aantal gebruikers.

**De query rate per gebruiker gaat omhoog, niet omlaag.** De demo werd gebruikt door drie mensen die het elk tien keer probeerden. Echte gebruikers die het ding nuttig vinden, stellen het de hele dag vragen. In mijn ervaring komt een assistent die mensen echt adopteren uit op een query rate die een paar keer hoger ligt dan wat de pilotgroep liet zien.

**Gesprekslengte stapelt op.** Demo's zijn single-turn. Echte gesprekken lopen vier, zes, tien beurten, en tenzij je samenvat of afkapt, stuurt elke beurt de hele geschiedenis opnieuw mee. Een gesprek van tien beurten kost veel meer dan tien single-turn queries. Dit is de vermenigvuldiger die mensen het meest verrast.

**Retries en fallbacks worden ook gefactureerd.** Zodra je de retry-logica toevoegt waar de concurrency-test om vroeg, betaal je een deel van de requests twee keer. Zodra je een fallback-model toevoegt, kost een deel wat de fallback kost.

Doe de rekensom met die drie voordat je iemand een getal noemt. Het volledige model, met prijsbanden voor 2026 en de fouten die ik blijf tegenkomen, staat in [wat een productie-LLM-feature in 2026 echt kost](/blog/cost-of-production-llm-2026). De korte versie: een demo die tientallen euro's per maand kost, wordt bij 10x gebruikers regelmatig een paar duizend per maand, en het verschil zit vooral in contextlengte en retries, niet in aantallen mensen. Als dat prima is voor de waarde die het oplevert, heb je een businesscase. Zo niet, dan heb je caching nodig, een kleiner model voor de makkelijke queries, en een kortere context, en alle drie horen in het plan voor de lancering, niet na de eerste factuur.

## De vier dingen die ontbreken en die een demo nooit laat zien

Elke demo die ik audit mist dezelfde vier dingen, omdat geen ervan nodig is om een demo te laten werken. Alle vier zijn nodig om een productiefeature werkend te houden, en ze achteraf inbouwen kost grofweg het dubbele van ze meteen meenemen.

**Evals.** Er is geen geschreven definitie van correct. Er zijn vijftig vragen en het geheugen van een bouwer over welke "er goed uitzagen". Het plan heeft een gelabelde eval-set nodig van 100 tot 300 echte vragen met verwachte antwoorden of rubrics, en een script dat hem in minder dan tien minuten draait. Zonder dat is elke promptwijziging een gok en elke modelupgrade een gokje met hogere inzet. Hoe je die set na de lancering levend houdt staat in [de continuous eval loop die niemand draait](/blog/llm-evaluation-production-continuous-eval); voor de audit is de vraag simpelweg of er een bestaat.

**Monitoring.** De demo logt naar stdout. Productie heeft minimaal nodig: elke request getraceerd met promptversie, opgehaalde chunks, model, tokens in en uit, latency en kosten, plus een manier om vanuit de UI een fout antwoord te markeren. Niet per se een dashboardproduct; een tabel waar je op kunt querien is genoeg om te beginnen. Zonder dat hoor je over hallucinaties via een klantmail.

**Promptversionering.** De prompt is een string in een sourcebestand, vaak aangepast, en niemand kan zeggen welke versie het antwoord gaf dat de CEO goed vond. Prompts moeten geversioneerde artefacten zijn, getagd in elke logregel, met een rollback. Dit is een fix van een dag die weken aan "vorige week dinsdag werkte het nog" bespaart.

**Guardrails.** Aan de inputkant: wat gebeurt er als een gebruiker een PDF van 40 pagina's in het chatvenster plakt, de HR-assistent naar het salaris van een collega vraagt, of de prompt-injection-regel van een Reddit-thread probeert. Aan de outputkant: wat gebeurt er als het model vol zelfvertrouwen antwoordt over iets dat niet in de opgehaalde documenten staat. De demo heeft op geen van deze een antwoord, want niemand in de demo was vijandig of slordig. Echte gebruikers zijn beide, meestal per ongeluk.

## Security- en datagaten die een demo doorstaan maar een audit niet

Dit is de sectie die budgetgesprekken op de verkeerde manier beëindigt als niemand eerst heeft gekeken, dus kijk eerst.

De dataflow van de demo is op een whiteboard getekend, als hij al ergens staat. Als ik hem netjes natrek, vind ik dezelfde gaten: een persoonlijke API-key in de repo of in een Slack-thread; een evaluatie-notebook dat echte klantrecords naar een CSV op iemands laptop heeft geëxporteerd; documenten ingested vanaf een gedeelde schijf zonder check op wie welke mocht zien, zodat de assistent nu vragen uit het bestuurspakket beantwoordt voor iedereen die het vraagt; een provider gekozen voor de demo zonder dat iemand heeft bevestigd in welke regio de data wordt verwerkt of of er een verwerkersovereenkomst ligt.

Toegangscontrole op documentniveau is degene die het meest pijn doet, omdat de fix de architectuur verandert. Als je vector store geen permissies per document heeft en je gebruikers verschillende toegangsrechten hebben, moet retrieval op querymoment op permissie filteren, en dat moet gebouwd zijn voordat je schaalt. Vraag het direct: kan gebruiker A een antwoord krijgen dat komt uit een document dat gebruiker A niet mag openen? Als niemand met overtuiging nee kan zeggen, is dat een planpunt.

De providervraag is voor Nederlandse bedrijven zelden een blokkade, maar hij moet op papier beantwoord zijn. De echte AVG-positie heb ik doorgelopen in [mag je bedrijfsdata naar OpenAI sturen](/blog/company-data-openai-gdpr-netherlands). Voor de audit: verwerkersovereenkomst getekend, regio bevestigd, retentie bevestigd, en een geschreven lijst van welke datacategorieën een prompt in mogen.

## Zo draai je zelf een POC-audit van een week: de twaalfpuntenchecklist

Dit is de checklist die ik echt gebruik. Elk punt is een ja of een nee, en elke nee is een planpunt. Een senior engineer en een product owner kunnen het meeste ervan in een week draaien.

1. **Twintig gelijktijdige requests ronden schoon af** met een p95 onder een afgesproken getal (ik gebruik zes seconden voor gestreamde chat, twee voor alles wat inline zit).
2. **Rate limits zijn bekend en gedimensioneerd** voor het verwachte piekverkeer, met 429-afhandeling en backoff in de code.
3. **Niets single-user in de stack**: geen lokale modellen, geen SQLite achter de index, geen in-memory sessiestate.
4. **Er bestaat een kostenmodel** met vermenigvuldigers voor query rate, gesprekslengte en retries, en iemand is er eigenaar van.
5. **Een gelabelde eval-set** van minstens 100 echte vragen bestaat en draait vanuit een script.
6. **De eval-score op die set is bekend**, niet op de vijftig van de bouwer.
7. **Elke request wordt gelogd** met promptversie, chunks, tokens, latency, kosten.
8. **Prompts zijn geversioneerd** en de versie staat in de logs.
9. **Input-guardrails bestaan**: lengtelimieten, injection-checks, onderwerpsgrenzen passend bij de use case.
10. **Output-guardrails bestaan**: een grounding-check of citatieplicht, en een weigerpad als retrieval niets bruikbaars oplevert.
11. **Toegangscontrole op documentniveau** wordt afgedwongen op retrievalmoment, en de "gebruiker A, document B"-vraag heeft een gedocumenteerde nee.
12. **De provider en de dataflow staan op papier**: verwerkersovereenkomst, regio, retentie, toegestane datacategorieën, geen secrets in de repo.

Een demo die acht van de twaalf haalt, staat er goed voor en heeft een paar weken hardening nodig. Een demo die er vier haalt, is normaal en heeft een echt plan nodig. Een demo die er een haalt, en dat komt voor, is een demo, en het eerlijke advies is om het te plannen als een build in plaats van een opschaling. Wat dat in weken kost, staat in [vier echte tijdpaden voor een AI-feature](/blog/how-long-to-build-an-ai-feature).

## Wat een echt 90-dagenplan bevat, en wie het moet schrijven

De uitkomst van de audit is geen rapport. Een rapport wordt een keer gelezen. De uitkomst is een 90-dagenplan waar een engineer maandag mee kan beginnen, en dat heeft een specifieke vorm.

De eerste 30 dagen zijn de nee-punten die de architectuur veranderen: concurrency, toegangscontrole, de eval-set. Die gaan eerst omdat al het andere ervan afhangt en omdat ze duurder worden hoe langer ze wachten. De tweede 30 dagen zijn de operationele laag: monitoring, promptversionering, guardrails, de kostencontroles waar het kostenmodel om vroeg. De laatste 30 dagen zijn een beperkte uitrol naar een echte gebruikersgroep met evals en monitoring aan, tegen een go/no-go-criterium dat is opgeschreven voordat de uitrol begint, niet erna.

Wat een goed plan bewust weglaat: een modelupgrade, een framework-migratie, een tweede use case, een UI-redesign. Elk is verleidelijk en elk is een manier om 90 dagen te besteden zonder te beantwoorden of de eerste feature op schaal werkt. Ik heb meer opschalingen zien stranden op scope creep in het plan dan op welke technische fout ook.

Over wie het schrijft: heb je een senior engineer die al eens een LLM-feature door productie heeft getrokken, een vrije week heeft, en niet degene is die de demo bouwde, doe het dan zelf met de checklist hierboven. Die laatste voorwaarde weegt zwaarder dan mensen prettig vinden. De bouwer weet waar de lijken liggen en heeft belang bij goedkeuring van de demo; die haalt punt zes op de vijftig vragen die hij zelf koos. Heb je die persoon niet, of is de enige kandidaat de bouwer, dan verdient een blik van buiten zijn geld: niet omdat een buitenstaander slimmer is, maar omdat die geen reden heeft om aardig te zijn voor de demo en dezelfde twaalf dingen ergens anders al heeft zien falen. Hoe dan ook moet het plan uiteindelijk eigendom zijn van iemand aan jouw kant. Een plan dat niemand intern draagt, is een rapport met een andere kop.

## Waar dit een opdracht wordt

De POC Audit is precies dit: een sprint van een week op je werkende demo waarin ik de twaalf punten hierboven langs je echte code en data leg, je vertel wat breekt op schaal en wat je als eerste fixt, en je het 90-dagenplan geef om te shippen. De scope staat op de [dienstenpagina](/services); heb je een demo die net een budgetregel kreeg, [neem contact op](/contact) en we beginnen met de concurrency-test.
