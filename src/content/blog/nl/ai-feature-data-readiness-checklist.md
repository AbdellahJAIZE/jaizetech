---
title: "AI-feature data gereedheid: waarom week 1 de build bepaalt"
description: "AI-feature data gereedheid wordt in offertes weggeaannomen en vreet daarna weken bouwtijd op. Zo audit je toegang, schema en eval-data zelf."
published: "2026-10-22"
tags: ["AI-feature data gereedheid", "data audit", "RAG", "AI-implementatie", "softwareontwikkeling"]
ogImage: "/images/blog/ai-feature-data-readiness-checklist/cover.jpg"
primaryService: "ai-features"
---
Een build waar ik bij werd gehaald liep in week twee vast op AI-feature data gereedheid, niet op iets dat op het architectuurplaatje stond. De brief was schoon: een interne assistent over vijf jaar projectdocumentatie, zes weken, retrieval plus een chatvenster in hun bestaande adminpaneel. Het modelwerk was recht-toe-recht-aan. Maar de documenten stonden in een SharePoint-tenant waar het ene account met leesrechten over alle bibliotheken toebehoorde aan iemand die het bedrijf had verlaten, de vervangende service principal had goedkeuring nodig van een security board dat maandelijks vergadert, en ongeveer 40% van de oudere bestanden waren gescande PDF's die nooit door OCR waren gehaald. Niets daarvan stond in de brief, omdat niemand het had nagekeken. "We hebben de documenten" was waar in de zin dat de documenten bestonden.

Dit is het deel van een volledige build dat in de offerte wordt weggeaannomen en er daarna weken uit opvreet. Leveranciers prijzen de modelintegratie, de retrieval-laag, de UI, de deploy. Data wordt behandeld als een input die op dag één klaarligt. In de praktijk is de eerste week van een serieuze build precies een audit hiervan, en elke architectuurbeslissing daarna hangt af van wat die audit vindt.

Het nuttige is dat het grootste deel van deze audit geen engineeringwerk is. Een opdrachtgever kan het zelf doen, in een middag, nog voor er een brief is geschreven. Hieronder de checklist die ik in week één afloop, in de volgorde waarin ik hem afloop, met hoe een slecht antwoord eruitziet.

## "We hebben de data" betekent vier verschillende dingen

Als een founder zegt dat ze de data hebben, bedoelen ze één van vier dingen, en de afstand tussen die vier is weken bouwtijd.

Het bestaat ergens. Bestanden staan op een schijf, rijen staan in een database, tickets staan in Zendesk. Niemand heeft geprobeerd het in één keer er allemaal uit te trekken.

Het is bereikbaar. Er is een credential, in een omgeving waar een engineer daadwerkelijk bij kan, die de hele set leest en niet alleen het stukje dat de demo gebruikte.

Het is bruikbaar. Bereikbaar, plus voldoende gestructureerd dat je weet wat een record betekent zonder iemand te vragen die er al zeven jaar werkt.

Het is evalueerbaar. Bruikbaar, plus je hebt voorbeelden van correcte output, zodat je kunt vaststellen of de feature werkt voordat je hem op gebruikers afstuurt.

Vrijwel iedereen zit op niveau één of twee en denkt op niveau drie te zitten. Niveau vier is zeldzaam genoeg dat als een prospect al 50 gelabelde vraag-antwoordparen heeft, ik aanneem dat ze eerder een AI-feature hebben uitgeleverd.

Loop de rest hiervan af als een checklist tegen je eigen data. Elk onderdeel is een vraag met een verifieerbaar antwoord, geen smaakkwestie.

## Toegang: wie kan het queryen, in welke omgeving, onder welk contract

Begin hier, want dit is het onderdeel dat agendavertraging oplevert in plaats van engineeringvertraging, en agendavertraging los je niet op door meer uren te kopen.

![AI-feature data gereedheid: waarom week 1 de build bepaalt](/images/blog/ai-feature-data-readiness-checklist/1.jpg)

Vier checks:

- **Kan iemand deze week een werkende credential overhandigen aan een externe engineer?** Niet "toegang regelen we". Een echt service-account, API-key of read-only databasegebruiker, met bereik over de volledige dataset, uitgegeven zonder inkooptraject. Als het antwoord een commissie bevat: zoek uit wanneer die vergadert.
- **In welke omgeving werkt die credential?** Alleen productietoegang betekent dat de engineer ofwel tegen live data ontwikkelt (een AVG-gesprek, geen technisch gesprek) ofwel tegen een staging-kopie werkt die misschien niet op productie lijkt. Beide zijn werkbaar. Geen van beide is gratis.
- **Mag je de data contractueel zo verwerken?** Klantdata onder een verwerkersovereenkomst met een lijst sub-verwerkers, documenten onder een NDA met een opdrachtgever, alles uit een SaaS-tool waarvan de voorwaarden bulk-export beperken. Ik heb een build twee weken stil zien liggen op de rate limit van een export-API van een leverancier, en los daarvan op de vraag of de documenten van een klant naar een Amerikaanse modelprovider mochten. Die tweede heb ik apart uitgewerkt in [deze praktische AVG-lezing voor Nederlandse teams](/blog/company-data-openai-gdpr-netherlands).
- **Hoe komt het er in bulk uit?** Een API die 100 records per pagina teruggeeft met een daglimiet van 1.000 calls, tegen 400.000 records, is geen extractiepad maar een backfill van twee maanden. Check de limiet voordat iemand het ontwerp om die API heen bouwt.

Het slechte antwoord op dit onderdeel klinkt als "onze CTO heeft overal toegang tot". De persoonlijke credential van één iemand is geen toegangsplan, en het wordt het single point of failure in precies de week dat die persoon op vakantie is.

## Schema: de ongedocumenteerde kolom bepaalt je retrieval-ontwerp

Zodra een engineer de data kan lezen, bepaalt de vorm ervan de architectuur. Dit is het deel dat opdrachtgevers consequent onderschatten, want van buitenaf is een database een database.

Wat je nakijkt:

- **Is er documentatie, en is die actueel?** Een data dictionary uit 2021 tegen een schema met 30 migraties sindsdien is slechter dan niets, omdat mensen erop vertrouwen.
- **Hoeveel `status`-waarden komen er echt voor in productie?** Draai de `GROUP BY`. De enum in de code heeft zes waarden; productie heeft er elf, waarvan twee typefouten uit een import in 2019 en één die iets anders betekent afhankelijk van het jaar waarin de rij is aangemaakt. Dit is de meest voorkomende verrassing van de eerste week.
- **Waar zit de echte betekenis?** Als cruciale informatie in een vrij tekstveld `notes` leeft, in een JSON-blob zonder stabiele keys, of in een kolom die `field_7` heet, dan is je retrieval-probleem nu eerst een extractieprobleem. Dat verandert het ontwerp en de planning.
- **Hoeveel ervan is ongestructureerd?** Volume is makkelijk te beantwoorden en wordt zelden gevraagd. 10.000 documenten en 4 miljoen documenten leveren andere indexeringsstrategieën op, andere kostenmodellen en ander chunking-werk. Gescande PDF's versus native tekst-PDF's is het verschil tussen een OCR-pijplijn en een parser. Als dat antwoord slecht terugkomt, heb ik de [patronen voor OCR plus LLM-extractie die ik blijf pakken](/blog/document-intelligence-ocr-llm-extraction) apart opgeschreven.
- **Komt de data uit een systeem waar niemand aan wil zitten?** Een mainframe-export, een on-prem ERP met een SOAP-interface, een systeem waarvan de leverancier per integratie factureert. Legacy data en AI-integratie is waar schattingen niet met procenten maar met factoren misgaan, en ik heb in kaart gebracht [waar die weken daadwerkelijk heen gaan](/blog/ai-feature-legacy-system-integration).

Een ongedocumenteerd schema blokkeert een build niet. Het zet bouwtijd om in ontdekkingstijd, en dat is per uur langzamer en veel moeilijker te schatten. Wil je een kortere offerte, besteed dan een week aan het opschrijven van wat je eigen kolommen betekenen.

## Gelabelde voorbeelden: de eval-set hoort in week één

Dit is de check die vrijwel niemand doet vóór het inhuren, en degene die het meest betrouwbaar bepaalt of de feature uitgeleverd wordt of blijft hangen.

Om te weten of een AI-feature werkt, heb je voorbeelden van goede antwoorden nodig. Voor een retrieval-assistent: een vraag, de documenten die opgehaald hadden moeten worden, en een acceptabel antwoord. Voor een extractiefeature: een document en de correct geëxtraheerde velden. Voor een classifier: items met het label dat ze moeten krijgen. Dertig tot vijftig daarvan, verspreid over de makkelijke en de rare gevallen, is genoeg om een release op te kunnen afkeuren. Honderden is beter en niemand heeft ze.

Drie vragen:

- **Bestaan er voorbeelden als bijproduct van bestaand werk?** Vaak wel, en onopgemerkt. Opgeloste supporttickets met het artikel dat ze oploste. Facturen die al in het ERP zijn ingeklopt, naast hun PDF. Handmatig nagekeken classificaties in een spreadsheet. Dit is de goedkoopste eval-data die bestaat en ze zit meestal in een systeem waar je al voor betaalt.
- **Wie kan de voorbeelden maken die er nog niet zijn?** Daar is iemand met domeinautoriteit voor nodig, want de moeilijke gevallen zijn afwegingen. Twee uur van een senior tijdens elke week van de build. Benoem die persoon voor je iets ondertekent. Als niemand te benoemen is, wordt de feature op gevoel geëvalueerd en op een demo uitgeleverd.
- **Weet je welke gevallen mogen falen?** De vragen die de assistent moet weigeren, de documenten waar "dit kan ik niet vaststellen" het juiste antwoord is. Teams labelen alleen het happy path en ontdekken daarna dat de feature voor al het andere met volle overtuiging antwoorden verzint.

Zonder dit wordt acceptatie een mening, en meningen veranderen met wie er in de kamer zit. Mijn stuk over [retrieval, faithfulness en ship gates](/blog/rag-evaluation-metrics-production) gaat over wat je meet zodra de voorbeelden er zijn. Het punt hier zit daarvoor: de voorbeelden moeten überhaupt bestaan, en ze verzamelen is werk dat je deze week kunt starten tegen nul kosten.

## Versheid: hoe snel veroudert jouw data

Een build van zes weken tegen data met een halfwaardetijd van twee weken is een ander systeem dan zes weken tegen een statisch archief, en het verschil komt terug in de architectuur, niet in de laatste sprint.

- **Hoe vaak verandert de onderliggende data?** Beleidsdocumenten die per kwartaal worden bijgewerkt verdragen een nightly reindex. Een productcatalogus met prijswijzigingen per uur heeft een update-pad nodig dat vanaf het begin is ontworpen, niet achteraf ingebouwd.
- **Wat gebeurt er als een record verdwijnt?** Deletion-propagatie is de stille fout in elk retrieval-systeem dat ik heb geaudit. Het document gaat weg bij de bron, de embedding blijft in de vector store staan, en de assistent blijft een beleidsregel citeren die drie maanden geleden is ingetrokken. Iemand merkt het uiteindelijk op, tegenover een klant.
- **Is er een betrouwbaar wijzigingssignaal?** Een modified timestamp die je vertrouwt, een webhook, een change data capture stream. Als wijzigingen detecteren betekent dat je alles opnieuw moet lezen, dan is je reindex-kost je datasetgrootte maal je frequentie. Maak die rekensom voordat je de frequentie kiest.
- **Wie is eigenaar van de data tijdens en na de build?** Als het bronsysteem in Q2 gemigreerd wordt terwijl jouw build door Q1 loopt, bouw je tegen een bewegend doel. Dat gebeurt vaker dan je denkt, omdat de twee projecten door verschillende mensen zijn goedgekeurd.

## De audit op AI-feature data gereedheid die je deze week zelf doet

Blok drie uur. Kies de ene use case die je echt gebouwd wil hebben, niet de roadmap.

1. Schrijf elk systeem op dat data bevat die de feature nodig heeft. Eén regel per stuk: systeem, wie het bezit, hoe data eruit komt.
2. Haal per systeem antwoord op: kan een externe engineer binnen twee weken leesrechten krijgen, ja of nee? Schrijf de blokkade op waar het antwoord nee is.
3. Exporteer 100 echte records of documenten per bron. Kijk ernaar. Geen schemadiagram, de daadwerkelijke rijen.
4. Draai voor de hoofdtabel de `GROUP BY` over elke enum-achtige kolom en tel de waarden die echt voorkomen.
5. Tel het ongestructureerde volume: hoeveel documenten, welke formaten, welk deel is scan.
6. Vind of maak 30 gelabelde voorbeelden. Benoem de persoon die er meer gaat maken.
7. Schrijf per bron de wijzigingsfrequentie en het gedrag bij verwijdering op.
8. Maak een lijst van alles wat je niet kon beantwoorden. Die lijst is je echte projectrisico, en hij hoort in de brief.

Alles wat je niet kunt beantwoorden, moet een leverancier ontdekken, op jouw budget, tegen een slechter uurtarief dan je eigen mensen. Een afgeronde versie van dit werk vóór de AI-build is ook het scherpste dat je een leverancier kunt voorleggen. Het maakt offertes vergelijkbaar, omdat iedereen dezelfde bekende vorm prijst in plaats van zijn eigen gok naar jouw rommel. Dezelfde logica geldt voor de featurespec zelf, die ik heb uitgewerkt in [het sjabloon dat het gokken in offertes beëindigt](/blog/ai-feature-spec-template-vendor-quotes).

## Wat een leverancier moet vragen voor hij een planning geeft

Je kunt dit ook omdraaien, als filter. Een leverancier die zes weken quoteert voor een volledige build zonder naar je data te vragen, quoteert een fantasie, en het gesprek over de overschrijding staat al in de agenda. Vier dingen die ze willen weten voor ze zich aan een datum binden:

**Kan ik in week één de echte data queryen, en wie geeft de credential uit?** Als ze zonder aarzelen "stuur maar een voorbeeldexport" accepteren, zijn ze van plan de moeilijke delen laat te ontdekken.

**Wat heb je dat ik als eval-set kan gebruiken?** Een leverancier die dit niet vraagt, is van plan te demonstreren in plaats van te meten.

**Wat is het oudste en meest lelijke deel van deze dataset?** Gemiddelden verbergen het werk. De 5% records die elke aanname breekt bepaalt de planning, en een ervaren engineer vraagt daar specifiek om.

**Welke van deze cijfers mag ik zelf verifiëren?** Het volume, de mix van formaten, het aandeel scans. Wie een retrieval-systeem prijst op een mondelinge beschrijving van het corpus, zit te gokken.

Een volledige build is zes tot twaalf weken waarin een senior engineer de AI-feature en het product eromheen end-to-end bouwt, en week één is deze audit goed gedaan, door de persoon die daarna elke architectuurbeslissing bezit die eruit volgt. Met de antwoorden al op papier binnenkomen maakt die week korter en de scope eerlijker. Heb je de checklist gedraaid en wil je de gaten laten lezen door iemand die ze builds heeft zien breken: de [servicespagina](/services) legt uit hoe een volledige build gescoped wordt en via [contact](/contact) krijg je het snelst een recht antwoord op de vraag of je data draagt wat je wil bouwen.
