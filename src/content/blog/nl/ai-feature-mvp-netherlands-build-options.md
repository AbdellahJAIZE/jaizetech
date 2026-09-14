---
title: "AI-feature MVP bouwen Nederland: bureau, freelancer of senior?"
description: "AI-feature MVP bouwen in Nederland: prijsbanden voor bureau, freelancer en fractional engineer, plus een spec-checklist om offertes te vergelijken."
published: "2026-09-14"
tags: ["AI-feature MVP", "MVP bouwen", "AI-engineer inhuren", "Nederland", "fractional engineer"]
ogImage: "/images/blog/ai-feature-mvp-netherlands-build-options/cover.jpg"
primaryService: "ai-features"
---
Zoek op "AI-feature MVP bouwen Nederland" en je krijgt vooral framework-vergelijkingen. LangGraph tegenover iets anders, welke vector database, welk model. Dat is de verkeerde pagina voor de beslissing die je deze maand neemt. Je hebt een demo of een spreadsheet die bewijst dat het idee signaal heeft. De vraag is niet welke tool. Het is wie het echte ding bouwt, en wat dat eerlijk gaat kosten.

Ik heb aan alle kanten van deze tafel gezeten. Ik ben de freelancer op het platform geweest, ik heb als onderaannemer voor bureaus gewerkt, en de laatste jaren ben ik de ene senior engineer die een AI-feature van lege repo naar productie brengt en er daarna verantwoordelijk voor blijft. De drie opties zijn niet drie prijzen voor hetzelfde product. Het zijn drie verschillende producten, en elk is structureel slecht in iets waar de andere goed in zijn.

Deze post zet die drie routes op een rij met de prijsbanden die ik in de Nederlandse en EU-markt zie, wat elke route niet kan hoe goed de mensen ook zijn, en een spec-checklist waarmee een niet-technische founder offertes krijgt die je naast elkaar kunt leggen. Het eindigt met één feature van zes weken, drie keer bemenst en geprijsd.

## Waarom "bouw een MVP" drie heel verschillende opdrachten betekent

Als een founder zegt "we hebben een MVP van de AI-feature nodig", horen drie mensen drie verschillende dingen.

Een bureau hoort een project: discovery, design, bouw, oplevering, een Jira-board en een wekelijkse stuurgroep. Een platform-freelancer hoort een stroom tickets: geef me de taken, ik sluit ze af tegen mijn uurtarief. Een senior zelfstandige die een full build doet hoort een uitkomst: dit ding staat in productie, echte gebruikers zitten erop, en ik ben degene die je belt als het zich misdraagt.

Dat het juist bij AI uitmaakt, komt doordat een AI-feature twee helften heeft die de meeste software-MVP's niet hebben. Er is de producthelft (backend, UI, auth, deployment) en de modelhelft (prompts, retrieval, evals, kostencontroles, foutafhandeling). Een normale web-MVP is voor negentig procent producthelft. Een AI-feature zit dichter bij fifty-fifty, en de modelhelft is het deel waar de meeste teams nog nooit iets in hebben opgeleverd.

Over de doorlooptijden schreef ik in [hoe lang het duurt om een AI-feature te bouwen](/blog/how-long-to-build-an-ai-feature); de korte versie is dat de modelhelft niet comprimeert zoals de producthelft, omdat je niet weet of de feature goed genoeg is tot je hem op echte input hebt gemeten. Wie je ook inhuurt, die moet die meting bezitten. Als niemand dat doet, krijg je een demo met een loginpagina en noem je het een MVP.

## AI-feature MVP bouwen in Nederland: drie routes met echte prijsbanden

Dit zijn ranges uit offertes die ik heb gezien, facturen die ik heb gestuurd of waar ik onder heb gewerkt, en founders die me lieten zien wat ze betaalden. Lees ze als "in mijn ervaring ruwweg", niet als marktrapport.

![AI-feature MVP bouwen Nederland: bureau, freelancer of senior?](/images/blog/ai-feature-mvp-netherlands-build-options/1.jpg)

**Route een: een digital agency of AI-consultancy.** Een team van drie tot vijf: projectlead, designer, een of twee developers, soms een data scientist die aanschuift voor de modelhelft. Nederlandse bureaus factureren blended dagtarieven die in mijn ervaring tussen de 900 en 1.400 euro per persoon per dag landen, met de grotere consultancies daar ruim boven. Een AI-feature MVP van zes tot acht weken met twee weken discovery ervoor wordt typisch geoffreerd op 80.000 tot 160.000 euro. Wat je koopt: een proces, een bedrijf achter het contract, design inbegrepen, en een team dat iemand op vakantie kan opvangen.

**Route twee: een freelancer of contractor via een platform.** Eén developer, gevonden via een platform of recruiter, die aan jouw tickets werkt. Nederlandse en EU-tarieven voor iemand die geloofwaardig LLM-werk kan doen lopen van ruwweg 70 tot 120 euro per uur, met de echt seniore mensen daarboven. Zes weken fulltime is 17.000 tot 30.000 euro. Wat je koopt: handen. Goedkoop, snel gestart, en volledig afhankelijk van wat jij ze voert.

**Route drie: een fractional senior engineer die een full build doet.** Eén persoon die dit soort feature eerder heeft opgeleverd, die de spec pakt, ermee in discussie gaat, het hele ding bouwt inclusief deployment en evals, en er verantwoordelijk voor blijft. Tarieven zitten tussen de freelancerband en het blended tarief van het bureau; je betaalt voor één persoon in plaats van een team, en degene met wie je praat is degene die de code schrijft. Zes tot twaalf weken is het realistische venster voor een feature die in productie eindigt in plaats van in een demo.

De eerlijke samenvatting: het bureau kost drie tot vijf keer de freelancer, de senior zelfstandige landt ertussenin, en het getal dat ertoe doet is geen van die drie. Het is de prijs van de versie die nooit live gaat. Ik heb meer freelancer-builds van 25.000 euro in de prullenbak zien belanden dan bureau-builds van 120.000 euro, en ik heb bureau-builds gezien waar de modelhelft zo dun was dat de klant een tweede keer betaalde om het werkend te krijgen.

## Waar bureaus structureel slecht in zijn, en waarom dat niet hun schuld is

Ik heb als onderaannemer voor goede bureaus gewerkt. De mensen zijn competent en het proces is echt. De problemen zijn structureel.

**De modelhelft wordt als laatste bemenst.** De bench van een bureau bestaat uit designers en webdevelopers, want dat is wat negentig procent van hun werk nodig heeft. De persoon die echt evals op een RAG-pipeline heeft gedraaid of een tool-calling agent onder load heeft gedebugd is óf een onderaannemer (vaak ik) óf een junior met een notebook. Discovery en design gebeuren voordat die persoon aan tafel zit, dus de spec wordt geschreven rond hoe de UI eruit moet zien in plaats van rond wat het model betrouwbaar kan.

**De margestructuur straft iteratie af.** Een AI-feature is goed na de vierde prompt-herschrijving en het tweede retrieval-redesign, niet na de eerste. Fixed-price maakt van die herschrijvingen een change request. Uurtje-factuurtje maakt er een budgetgesprek van. Hoe dan ook: de iteratie die de feature nodig heeft is precies wat het commerciële model tegenwerkt.

**Oplevering is het einde van de verantwoordelijkheid.** De MVP gaat live, het team rolt door naar de volgende klant, en de eerste hallucinatieklacht landt bij je eigen developers die het niet hebben gebouwd. Supportcontracten bestaan, maar support is geen eigenaarschap; de persoon die weet waarom de prompt zo is opgebouwd is weg.

**Discovery wordt een product.** Twee weken workshops is factureerbaar, en de output is een deck. Voor een AI-feature bestaat de nuttige discovery uit dertig voorbeelden van echte input en een definitie van "correct", zoals ik beschreef in [hoe je een AI-pilot scopet die productie wel haalt](/blog/ai-pilot-to-production-scoping). Dat kost twee dagen met de juiste persoon, niet twee weken met een zaal.

Niets hiervan is een reden om nooit een bureau in te huren. Als de producthelft het grootste deel van het werk is (een nieuwe klantgerichte app waarin de AI één scherm is), is een bureau vaak de juiste keuze. Verwacht alleen niet dat het bureau de modelhelft bezit.

## Waar een freelancer of platform-hire structureel slecht in is

De freelancerroute is waar founders naar grijpen als de bureau-offerte binnenkomt. Goedkoop, en het start maandag. Dit is wat het niet kan.

**Niemand schrijft de spec.** Een platform-hire voert tickets uit. De spec moet van jou komen, en als je een goede spec voor een AI-feature kon schrijven zou je dit waarschijnlijk niet lezen. De freelancer bouwt wat hij uit het ticket begrijpt, en dat is het happy path; de edge cases die bepalen of de feature bruikbaar is krijgen nooit een ticket.

**De deployment is andermans probleem.** De build draait op zijn laptop tegen een persoonlijke API-key. Het in jouw infrastructuur krijgen, met secrets management, rate-limit-afhandeling, een fallback bij een providerstoring, en een kostenplafond zodat een retry-loop niet 's nachts 3.000 euro verbrandt: allemaal "niet in scope" tenzij jij het hebt opgeschreven.

**Er is geen eval-loop.** De feature werkt op de twintig voorbeelden die de freelancer heeft getest. Of hij werkt op de tweeduizend die jouw gebruikers gaan sturen is onbekend, en niemand heeft de taak dat uit te zoeken. Dit is de meest voorkomende reden dat ik word gebeld om een freelancer-build te redden: de code is prima, de meting bestaat niet.

**Senioriteit is bij het inhuren niet te verifiëren.** Elk profiel zegt nu "LLM". Hoe je daarop test schreef ik in [een AI engineer aannemen in Nederland](/blog/hire-ai-engineer-netherlands); als je dat interview niet zelf kunt voeren, is het platform een loterij.

De freelancerroute werkt als je al een technische lead in huis hebt die de spec, de deployment en de evals bezit, en alleen handen nodig heeft. Als die persoon niet bestaat, koop je geen MVP; je koopt een codebase waar je iemand anders voor moet betalen om hem te begrijpen.

## De spec-checklist die offertes vergelijkbaar maakt

Bureau- en freelancer-offertes zijn onmogelijk te vergelijken omdat ze verschillende dingen offreren. Fix de spec en de offertes vallen op één lijn. Dit laat ik een founder invullen voordat ik ergens een getal op zet, en elke leverancier die het inhuren waard is wil dezelfde antwoorden.

- **De ene taak.** Eén zin: "Een gebruiker uploadt X en krijgt Y." Als er een "en" in moet, zijn het twee features. Kies er een.
- **Dertig echte inputs.** Echte documenten, vragen, afbeeldingen, van echte gebruikers. Niet synthetisch, niet opgeschoond. Het meest waardevolle wat je kunt doen voordat je met iemand praat.
- **Hoe correct eruitziet.** Schrijf voor tien van die dertig het antwoord op dat een goede medewerker zou geven. Dit is je eerste eval-set, en het ding dat elke leverancier anders overslaat.
- **Waar de data staat en wie hem mag zien.** Welk systeem, welk formaat, of hij de EU mag verlaten, of hij überhaupt naar een Amerikaanse modelprovider mag. Dit bepaalt de helft van de architectuur.
- **Waar het draait.** Jouw cloudaccount, jouw Kubernetes, een managed platform, on-prem. "Dat zien we later wel" is hoe deployments een tweede project worden.
- **Wie het gebruikt en hoeveel.** Tien interne gebruikers of tienduizend klanten verandert het kostenmodel en het latency-budget met een orde van grootte.
- **Het foutpad.** Wat er gebeurt als het model onzeker is of fout zit: een confidence-drempel en een mens in de loop, een "kon niet verwerken"-status, een escalatie. Elke leverancier zou dit moeten offreren; de meeste doen het niet tenzij je erom vraagt.
- **De definitie van klaar.** Niet "het werkt" maar "in onze productieomgeving, op echt verkeer, met een dashboard dat we kunnen lezen, en de eval-set scoort boven N."

Stuur die ene pagina naar alle drie de routes. Een bureau offreert nu de bouw in plaats van de discovery. Een freelancer ziet de deployment en de evals en prijst ze óf geeft toe dat het buiten zijn bereik ligt. Een senior zelfstandige gaat in discussie met je één-zins-taak, wat meestal het nuttigste is dat in het hele proces gebeurt. En als de AI één scherm is in een veel grotere app, lees dan eerst [build versus buy voor AI-features](/blog/build-vs-buy-ai-features), want het juiste antwoord is misschien een vendor-API en een week integratie.

## Een uitgewerkt voorbeeld: één AI-feature MVP van zes weken, drie keer geprijsd

Een feature waar ik meerdere varianten van heb gebouwd. Een B2B-logistiekbedrijf ontvangt leveranciersdocumenten (pakbonnen, facturen, douaneformulieren) als PDF en e-mailbijlage. De feature: de vijftien velden eruit halen die planners vandaag met de hand overtypen, ze tonen in een reviewscherm met de bron gemarkeerd, bevestigde records naar het ERP pushen. Tweehonderd documenten per dag, twaalf interne gebruikers, data blijft in de EU.

**Bureau.** Twee weken discovery, zes weken bouw. Projectlead voor 40 procent, designer voor drie weken, twee developers, een data scientist als onderaannemer voor de extractie-pipeline. Offerte in de range van 110.000 tot 140.000 euro. Je krijgt een gepolijst reviewscherm, een gedocumenteerde oplevering, en een pipeline die in mijn ervaring goed scoort op de demo-set en nog nooit op tweehonderd per dag heeft gedraaid. Deployment naar jouw omgeving is vaak een aparte regel. Realistische tijd tot echte gebruikers: tien tot twaalf weken inclusief overdracht.

**Freelancer.** Eén developer, zes weken tegen ruwweg 95 euro per uur, zo'n 23.000 euro. Jij schrijft de spec, of niet. Je krijgt een werkend extractiescript en een basaal reviewscherm op zijn laptop of een persoonlijk cloudaccount. Geen eval-set tenzij jij die hebt aangeleverd. De ERP-integratie landt in week vijf en daar breekt de planning, omdat de API van het ERP niet was wat het ticket aannam. Realistische tijd tot echte gebruikers: zes weken plus zolang je eigen team nodig heeft om het te deployen, te beveiligen en te begrijpen. In mijn ervaring komt ruwweg de helft daar.

**Fractional senior engineer, full build.** Eén persoon, zes tot acht weken. Week een: de dertig documenten en de eval-set, een discussie over welke van de vijftien velden er echt toe doen, en een beslissing over OCR-plus-LLM versus een vision-model voor de lastigere documenttypes. Week twee tot vijf: pipeline, reviewscherm, ERP-push, vanaf dag een in jouw cloudaccount. Week zes: evals op twee weken echte documenten, kosten per document gemeten en begrensd, monitoring op de twee failure modes die opdoken, planners erop. De prijs landt tussen de andere twee, en degene die het scopete is degene die het deployde en degene aan de telefoon in week negen. Realistische tijd tot echte gebruikers: de zes tot acht weken, omdat "in productie" vanaf het begin de definitie van klaar was.

Dezelfde feature in alle drie de kolommen. Wat verschilt is wie de modelhelft bezit, wie de deployment bezit, en wie er nog is als het zich misdraagt.

## Wat "klaar" moet betekenen voordat je de laatste factuur betaalt

Welke route je ook kiest, accepteer "het werkt" niet als klaar. Dit zet ik in mijn eigen contracten als acceptatiecriteria, en dit zou ik elke leverancier vragen te ondertekenen.

- Het draait in jouw omgeving, onder jouw accounts, met secrets die jij beheert. Geen demo-URL.
- Een eval-set van minstens vijftig echte inputs met verwachte outputs, en een script dat iedereen kan draaien en dat de huidige versie scoort. De score staat opgeschreven.
- Kosten per request gemeten op echt verkeer, niet geschat, met een hard plafond dat een op hol geslagen loop stopt.
- Een dashboard, of op zijn minst een log-query, met volume, latency, foutpercentage en het aandeel requests dat het foutpad raakt. Iemand in jouw team heeft het geopend.
- Prompts en retrieval-config geversioneerd in jouw repo, met een notitie waarom de huidige versie eruitziet zoals hij eruitziet.
- Het foutpad is bewust getriggerd en doet wat de spec zei.
- Echte gebruikers hebben het een week gebruikt en hun klachten zijn gelezen.

Als een leverancier die lijst niet kan leveren, levert hij een demo, en die moet je als demo prijzen. Wil je een second opinion op een build die al loopt, dan beschrijft de [dienstenpagina](/services) hoe ik daarnaar kijk.

## Waar dit een opdracht wordt

De Full Build is de derde route hierboven: ik neem de AI-feature en het product eromheen in zes tot twaalf weken van spec naar productie als de ene verantwoordelijke eigenaar, van backend en model-pipeline tot evals, monitoring en de deployment in jouw omgeving. De scope staat op de [dienstenpagina](/services). Heb je de spec van één pagina, of wil je hulp bij het schrijven ervan, [neem contact op](/contact) en dan zetten we er samen een echt getal op.
