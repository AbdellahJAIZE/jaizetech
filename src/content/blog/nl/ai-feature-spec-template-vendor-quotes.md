---
title: "AI-feature spec sjabloon: leg scope vast vóór de offerte"
description: "Gebruik dit AI-feature spec sjabloon om scope vast te leggen vóórdat leveranciers offreren, zodat je offertes eerlijk kunt vergelijken en dure verrassingen voorkomt."
published: "2026-10-04"
tags: ["AI-feature spec sjabloon", "AI-project scoping", "leveranciersofferte", "RFP AI", "AI-project budget"]
ogImage: "/images/blog/ai-feature-spec-template-vendor-quotes/cover.jpg"
primaryService: "ai-features"
seoDescription: "Een AI-feature spec sjabloon dat scope vastlegt vóór leveranciers offreren, zodat je offertes eerlijk vergelijkt en dure verrassingen voorkomt."
---
Een goedgekeurd budget is het gevaarlijkste moment in een AI-project. Het geld is er, je hebt vijf leveranciers op een lijstje, en wat je ze zo gaat sturen zijn twee alinea's in een mail die begint met "we willen een AI-assistent die…". Er komen zes offertes terug tussen €18k en €210k en je hebt geen enkele manier om te bepalen of de goedkope efficiënt is of de dure eerlijk. Wat je eerst nodig had was een **AI-feature spec sjabloon** dat de scope vastzet voordat iemand er een prijs op plakt.

Ik heb aan beide kanten van die tafel gezeten. Ik heb offertes geschreven op briefings die zo vaag waren dat de enige rationele zet was om het deel te prijzen dat ik kón zien, en ik ben later ingehuurd om de features te repareren die uit zulke offertes zijn gerold. Het patroon is saai en herhaalt zich: de spreiding in de offertes ging nooit over de efficiëntie van de leverancier. Hij ging over welke lagen elke leverancier stilletjes buiten scope had geplaatst.

Dit stuk is dus het document, niet het advies. Acht secties, wat er in elke sectie hoort, een uitgewerkt voorbeeld voor een support-feature bij een middelgrote SaaS, en hoe je de offertes scoort die terugkomen. Je schrijft het in een middag en je hoeft mij nooit in te huren om het te gebruiken.

## Het moment: vijf leveranciers, vijf offertes, geen twee over hetzelfde project

Dit is waar de spreiding meestal in uiteenvalt als ik alle offertes naast elkaar leg.

De offerte van €18k prijst de modelcall en een UI. Prompt, API, een chatvenster, deploy naar Vercel. Het is geen leugen; het is een demo met een factuur eraan. De offerte van €60k voegt retrieval toe, ingestie voor twee databronnen en wat tests. De offerte van €210k bevat een eval-suite, observability, een stagingomgeving, een loadtest, een security review en twaalf weken agenda van een senior engineer.

Alle drie hebben dezelfde mail gelezen. Alle drie hebben zich een ander project voorgesteld, want de briefing zei niet of "werkt" betekende *een stakeholder knikt bij een demo* of *300 supportmedewerkers gebruiken het op dinsdag en het antwoord klopt in 95% van de gevallen*. Dat zijn echt verschillende builds — [de volledige build heeft zeven lagen en de meeste offertes prijzen er drie](/blog/full-ai-feature-build-scope-cost) — en geen enkele inkoopdiscipline stroomafwaarts redt nog een vergelijking tussen die twee.

Het faalscenario dat me het meest bezighoudt is niet te veel betalen. Het is de offerte van €18k kiezen, in zes weken live gaan, en in maand vier ontdekken dat de ontbrekende €42k aan evals, monitoring en hardening nu €70k kost, omdat het retroactief om een live feature met echte gebruikers heen gebouwd moet worden. De goedkoopste offerte is vaak het duurste project. Dat zie je niet aan de offerte. Dat zie je aan de spec.

## Waarom een AI-feature spec sjabloon eerst de scope vastzet en pas daarna de prijs

Een normale software-RFP werkt omdat de scope grotendeels zichtbaar is in de featurelijst. "Gebruikers kunnen exporteren naar CSV" is af of niet af. AI-features breken die aanname: de interessante scope zit in de *kwaliteits- en operationele* lagen, en die zijn onzichtbaar in een featurelijst en oneindig samendrukbaar voor iedereen die op prijs wil winnen.

![AI-feature spec sjabloon: leg scope vast vóór de offerte](/images/blog/ai-feature-spec-template-vendor-quotes/1.jpg)

De spec heeft dus één taak: elke samendrukbare beslissing verplaatsen van de verbeelding van de leverancier naar jouw document. Niet de technische beslissingen — die zijn van hen, en daar kom ik zo op terug. De *scope*-beslissingen. Hoe goed is goed genoeg, gemeten hoe, op welke data, bij welke latency, tegen welke kosten per eenheid, gemonitord door wie, overgedragen als wat.

Twee praktische gevolgen. Ten eerste: de spec is kort. De mijne zijn vier tot zes pagina's; langer en leveranciers scannen hem diagonaal en je zit weer te gissen. Ten tweede: de spec is geschreven in uitkomsten en randvoorwaarden, nooit in architectuur. Op het moment dat je "moet LangGraph met een Pinecone vector store gebruiken" opschrijft, heb je je eigen vergelijking vernietigd, want je hebt de verantwoordelijkheid overgenomen voor de [architectuurbeslissingen](/blog/ai-feature-architecture-decisions) die een goede leverancier van een slechte scheiden — en je krijgt nog steeds vijf verschillende offertes, alleen nu met een gedeeld excuus als het misgaat.

## De acht secties die elke spec nodig heeft, en wat er misgaat als er één ontbreekt
1. De taak          wie, trigger, input, output, wat het vervangt
2. Data             bronnen, volume, toegang, verversing, persoonsgegevens
3. Kwaliteitslat    wat "correct" betekent, eval-set, ship gate
4. Runtime-doelen   p50/p95-latency, volume, kostenplafond per eenheid
5. Oppervlak        waar het leeft, auth, fallback, human-in-the-loop
6. Randvoorwaarden  regio, hosting, modelleveranciersbeleid, AI Act
7. Dag 2            monitoring, promptversiebeheer, piket, overdracht
8. Proces           mijlpalen, acceptatie, IP, wat jij levert

**1. De taak.** Eén alinea, zonder AI-woorden. Wie gebruikt het, wat triggert het, wat gaat erin, wat komt eruit, welke menselijke handeling het vervangt of versnelt. *Ontbreekt:* leveranciers scopen een platform in plaats van een feature. Dit is ook de sectie waar de eerlijke leverancier zegt dat een filter en een formulierveld het ook zouden doen — soms [had de AI-functie eigenlijk een SQL-query moeten zijn](/blog/ai-feature-that-should-have-been-sql-query).

**2. Data.** Elke bron met zijn echte omvang, formaat, eigenaarschap, verversingsfrequentie en rommel. "14.000 Zendesk-tickets, CSV-export, 2019–2026, Nederlands en Engels door elkaar" is een spec. "onze kennisbank" is een val. *Ontbreekt:* elke offerte gaat uit van schone data en elk project verbrandt drie ongebudgetteerde weken aan ingestie.

**3. Kwaliteitslat.** De sectie die kopers overslaan en die de prijs bepaalt. Hoe ziet een correcte output eruit, wie beoordeelt dat, en op welke set voorbeelden. Vraag om een eval-set van 80 tot 150 echte gevallen met verwachte antwoorden, en zeg erbij of jij die levert of dat je de leverancier ervoor betaalt. *Ontbreekt:* "af" wordt "de demo ging goed", en je hebt geen [acceptatiecriteria](/blog/ai-feature-definition-of-done) om de eindfactuur tegen te houden.

**4. Runtime-doelen.** p50- en p95-latency, verwacht volume bij livegang en in maand twaalf, concurrency, en een kostenplafond per interactie. *Ontbreekt:* je krijgt een feature die prachtig is bij 20 requests per dag en onbetaalbaar bij 2.000.

**5. Oppervlak.** Waar het rendert, welk authenticatiesysteem, wat er gebeurt als het model faalt of onzeker is, en of een mens goedkeurt voordat er iets naar buiten gaat. *Ontbreekt:* de fallback-UX wordt in de laatste week bedacht door wie er het minst geschikt voor is.

**6. Randvoorwaarden.** Dataregio, cloud of on-prem, of Amerikaans gehoste model-API's zijn toegestaan, verwerkersovereenkomst-eisen, en jouw lezing van de AI Act-classificatie. *Ontbreekt:* legal schiet het project in week tien af. Beslis dit vóór de RFP, niet tijdens.

**7. Dag 2.** Monitoring, tracing, promptversiebeheer, alertdrempels, wie de eerste 30 dagen piket heeft, en de fysieke artefacten die je overgedragen krijgt. *Ontbreekt:* hier heeft die offerte van €18k zijn besparing gevonden.

**8. Proces.** Mijlpalen, acceptatiecriteria per mijlpaal, IP-eigendom, mensen met naam (niet "ons team"), wat jij levert, en je eigen doorlooptijd op beslissingen. *Ontbreekt:* de planning loopt uit en dat is echt jouw schuld.

## Een uitgewerkt voorbeeld: het sjabloon ingevuld voor een SaaS-supportfeature

Samenstelling van meerdere builds, realistische cijfers, geen klantnaam.

**Taak.** Een supportmedewerker opent een ticket in Zendesk en ziet een voorgesteld antwoord met bronverwijzingen. De medewerker past aan en verstuurt. Doel: de mediane afhandeltijd op tier-1-tickets omlaag. Het verstuurt zelf niets.

**Data.** 14.200 opgeloste tickets (CSV, 2019–2026, ~70% Nederlands); 340 helpcenter-artikelen (Markdown, via API, wekelijks gewijzigd); een product-changelog (Notion). Tickets bevatten klantnamen en e-mailadressen — moeten geredacteerd worden vóór indexering. Leverancier krijgt in week één een geschoonde kopie; de export is mijn verantwoordelijkheid.

**Kwaliteitslat.** Wij leveren 120 apart gehouden tickets met het antwoord dat een medewerker daadwerkelijk heeft verstuurd. Gate: bij 70%+ van de gevallen beoordeelt een senior medewerker het voorstel als "versturen met kleine aanpassingen of beter", nul gevallen waarin een bron wordt geciteerd die de bewering niet bevat, en geen enkel voorstel dat beleid verzint. Faithfulness wordt gemeten, niet gevoeld — [retrieval- en generatiemetrics met ship gates](/blog/rag-evaluation-metrics-production).

**Runtime.** p50 onder 3s, p95 onder 8s. 600 suggesties per dag bij livegang, 2.500 in maand twaalf, piek 15 gelijktijdig. Plafond: €0,06 per suggestie bij launchvolume.

**Oppervlak.** Zendesk-sidebar-app, SSO via onze Entra ID. Als retrieval niets boven de drempel teruggeeft: toon "geen betrouwbare suggestie" — nooit een gok. Medewerker altijd in de loop.

**Randvoorwaarden.** Alleen EU-regio. Frontier-API-modellen toegestaan met getekende verwerkersovereenkomst en zero retention; open-weight self-hosted mag als het de kwaliteitslat haalt. Onze lezing: beperkt risico onder de AI Act, transparantieverplichting, gericht op medewerkers en niet op klanten.

**Dag 2.** Tracing op elke call met kosten en latency per request. Prompts in git met de eval-suite in CI. Alerts op p95, uitgaven per dag en refusal rate. 30 dagen support na livegang, daarna nemen onze twee backend-engineers het over. Overdracht: repo, runbook, eval-suite, dashboards in onze eigen accounts.

**Proces.** Vier mijlpalen: ingestie plus retrieval-baseline, eval-harness groen, staging met vijf pilotmedewerkers, productie-uitrol. Acceptatie per mijlpaal tegen bovenstaande gate. IP bij ons, alleen MIT-compatibele dependencies. Senior engineer met naam, geen roulerende pool. Wij beantwoorden vragen binnen één werkdag.

Dat is nog geen twee pagina's en het is niet te buigen. Elke leverancier prijst nu hetzelfde project.

## Wat je bewust openlaat (en markeert als leveranciersbeslissing, niet als gat)

Specificeer niet: het model, de vector store of je er überhaupt één nodig hebt, het framework, de chunking-strategie, retrieval versus fine-tuning, of het deployment-platform. Zet er een regel bij: *"Architectuur is de keuze van de leverancier. Onderbouw hem tegen de kwaliteitslat en het kostenplafond."*

Dit is het nuttigste deel van het hele document, want hóé een leverancier die gaten invult *is* de beoordeling. Een goede vraagt naar je Nederlands/Engels-verhouding voordat hij een embeddingmodel voorstelt. Een zwakke stelt zijn standaardstack voor, ongeacht wat er staat. Precies dat signaal jaag je na als je [een AI-leverancier beoordeelt voordat je tekent](/blog/vet-ai-vendor-before-you-sign).

Laat ook expliciet open wat je echt niet weet. "We weten onze werkelijke groei in ticketvolume niet" is een legitieme spec-regel. Hij nodigt uit tot een gefaseerd voorstel in plaats van een fantasie.

## Hoe je met het ingevulde sjabloon offertes regel voor regel tegen elkaar scoort

Eis dat de offerte wordt uitgesplitst per spec-sectie, in uren of dagen, met een bedrag in euro's. Die ene zin in je RFP doet het meeste werk. Het is bijna onmogelijk om een ontbrekende eval-suite te verstoppen als sectie 3 een getal moet dragen.

Lees dan de kolommen naar beneden, niet naar rechts:

- **Elke sectie op nul of weggelaten.** Vraag schriftelijk waarom. Soms is het antwoord goed ("jullie eval-set van 120 gevallen maakt de harness een klus van 2 dagen"). Soms blijkt eruit dat ze het nooit gingen bouwen.
- **Sectie 7 onder 10% van het totaal.** In mijn ervaring landen monitoring, promptversiebeheer en overdracht tussen 15% en 25% van een volledige build. Veel minder betekent een stub.
- **Sectie 2 veel goedkoper dan de schatting van je eigen engineers.** Ze hebben niet naar de data gekeken.
- **Planningen die jouw beslissnelheid negeren.** [Echte doorlooptijden](/blog/how-long-to-build-an-ai-feature) rekenen jouw reviewrondes mee.
- **Aannames expliciet herhaald.** Een sterke offerte somt op waar hij van uitging en wat het getal zou veranderen. Behandel dat als kwaliteitssignaal, niet als slag om de arm.

Verwacht dat de spreiding instort. Als ik kopers dit heb zien doen, comprimeert een factor 10 tot ruwweg factor 1,5 — en het verschil dat overblijft is een echt gesprek over senioriteit en risico in plaats van een gokspel. Twijfel je nog tussen een bureau, een freelancer en één senior bouwpartner, dan maakt diezelfde ingevulde spec [die vergelijking](/blog/ai-feature-mvp-netherlands-build-options) ook hanteerbaar.

Nog één ding: stuur de spec naar alle leveranciers op hetzelfde moment, en stuur *hetzelfde* document. De verleiding om hem per partij bij te schaven is groot en hij vernietigt de enige eigenschap die telt.

## Waar dit een opdracht wordt

Heb je de spec ingevuld en is de vraag nog wie het bouwt, dan is een Full Build zes tot twaalf weken waarin ik de AI-feature en het product eromheen end-to-end bezit — inclusief de lagen uit sectie 3 en 7, niet er achteraf op geschroefd. Ik lees ook graag een spec die je zelf hebt opgesteld en vertel je welke sectie in week acht de ruzie gaat veroorzaken.

Bekijk wat een Full Build omvat op de [dienstenpagina](/services), of stuur je conceptspec via de [contactpagina](/contact) — dan lopen we hem samen door.
