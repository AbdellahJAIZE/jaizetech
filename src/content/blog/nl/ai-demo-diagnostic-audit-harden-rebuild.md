---
title: "AI demo diagnose: audit, hardening of toch een volledige build?"
description: "Een AI demo diagnose scheidt onaf van stuk van verkeerd ontworpen, zodat je niet betaalt voor de verkeerde fix: audit, hardening of rebuild."
published: "2026-10-08"
tags: ["AI demo diagnose", "AI productierijpheid", "LLM hardening", "POC audit", "AI feature build"]
ogImage: "/images/blog/ai-demo-diagnostic-audit-harden-rebuild/cover.jpg"
primaryService: "ai-audit"
---
Meestal is het eerlijke antwoord: je hebt een week diagnose nodig, geen offerte. De drie opties die voor je liggen (audit, hardening-sprint, volledige build) lossen echt verschillende problemen op, en het symptoom dat je nu voelt vertelt je niet betrouwbaar welke je hebt. Een **AI demo diagnose** gaat vooral over het scheiden van "dit is onaf" van "dit is stuk" van "dit had nooit deze vorm moeten hebben".

Hieronder staat de triage, opgeschreven als de vragen die ik op een eerste gesprek daadwerkelijk stel, met de antwoorden die een demo in het ene of het andere bakje duwen. Kun je ze alle drie zelf beantwoorden, dan heb je mij niet nodig voor de diagnose. Genoeg teams kunnen dat.

## Elke AI demo diagnose begint met drie vragen

**Eén: heeft er ooit een echte gebruiker van buiten je bedrijf mee gewerkt?** Niet een collega met een Loom-opname. Iemand wiens werk afhangt van de output.

**Twee: weet je wat "correct" betekent, opgeschreven, als cases?** Een set inputs met verwachte outputs, al zijn het er dertig in een spreadsheet, die je na een wijziging opnieuw kunt draaien.

**Drie: als je de modelcall weghaalt, is er dan nog een product?** Auth, tenancy, audit logs, een plek waar resultaten leven, een workflow van iemand waar het in past.

Die drie antwoorden mappen vrij schoon:

- Geen echte gebruikers, geen evalset, geen productomhulsel: de demo bewijst het model, en je kijkt naar een build.
- Echte gebruikers, geen evalset, en er verrast je steeds iets: hardening.
- Echte gebruikers, een evalset, en je weet ruwweg wat er mis is maar niet wat eerst moet: dan heb je prioritering nodig, en dat is de goedkoopste week die je dit kwartaal besteedt.

Waarom dit uitmaakt: iets harden dat nooit is ontworpen kost meer dan het netjes bouwen, en opnieuw beginnen terwijl je retrievallaag alleen reranking mist is een paar weken verspilling. Ik heb beide zien gebeuren.

## Symptoomgroep één: het werkt, maar niemand vertrouwt het onder echte belasting

De demo is echt. Hij beantwoordt vragen over je contracten, of routeert tickets, of haalt velden uit facturen, en in de vergaderzaal ziet het af uit. Dan vraagt iemand wat er gebeurt bij 200 gelijktijdige gebruikers en het wordt stil.

![AI demo diagnose: audit, hardening of toch een volledige build?](/images/blog/ai-demo-diagnostic-audit-harden-rebuild/1.jpg)

Wat mensen in dit bakje meestal vertellen:

- "Op mijn machine is het snel." Ze hebben het nooit tegen het productiecorpus gedraaid, alleen tegen een steekproef van 50 documenten.
- "We weten niet wat het kost." Geen tokenboekhouding per request, dus geen kosten per gebruiker, dus geen unit economics voor je prijs.
- "Het is accuraat, denken we." De accuratesse is beoordeeld door degene die het bouwde, antwoorden lezend en knikkend.
- "Er moet een securityreview komen voordat we live kunnen" en niemand heeft opgeschreven welke data naar welke provider gaat.

Dit is de productierijpheid van je AI-pilot, en het is de schoonste auditcase die bestaat. Niets staat in brand, want niets staat live. De vragen zijn allemaal in dagen te beantwoorden door iemand die de code en de traces leest: waar komt latency echt vandaan, wat is de tokenkost per request op het 95e percentiel, degradeert retrieval als het corpus van 50 naar 50.000 documenten gaat (dat doet het meestal, en de fix is vaker reranking plus een eerlijke blik op chunking dan een ander model), en wat breekt er als de provider een 429 teruggeeft.

De valkuil hier is dit als een build behandelen. Teams in dit bakje besluiten vaak dat de demo "toch maar een prototype" is en dat ze het netjes opnieuw gaan doen, en gooien daarmee werkende retrievallogica weg waar iemand twee maanden aan heeft zitten tunen. Een deel van die code is prima. Je moet weten welk deel voordat je beslist, en dat is een middag lezen, geen rewrite.

## Symptoomgroep twee: het staat live en er gaat steeds iets mis

Compleet ander bakje. Gebruikers zitten erop, je hebt supporttickets, en het patroon is terugkerend in plaats van catastrofaal. Drie keer dit kwartaal citeerde de assistent een document dat niet bestaat. De latency piekte twee dagen en niemand kan zeggen waarom. Een parser die het hele voorjaar werkte begon na een providerupdate te klappen op 4% van de responses.

Verklikkers voor deze groep:

- Je hoort problemen van gebruikers, niet van alerts.
- Niemand kan antwoorden op "heeft de promptwijziging van vorige week dit beter of slechter gemaakt", omdat er geen versiebeheer is en geen voor/na op een vaste testset.
- Hetzelfde incidenttype is meer dan één keer gebeurd.
- Iemand heeft al "we zetten er gewoon een validatiestap voor" geprobeerd en de fout verhuisde in plaats van te verdwijnen.

Dit is hardening, drie tot zes weken, en het werk is weinig glamoureus: een evalset met ship gates, promptversiebeheer zodat een wijziging een diff is, tracing op elke call, validatie van gestructureerde output met retries die echt begrensd zijn, en een failoverpad dat geen retry-loop is tegen hetzelfde endpoint. Ik heb uitgebreider geschreven over waarom [fouten in gestructureerde output nooit op een dashboard verschijnen](/blog/llm-structured-output-failures-production) en waarom [stille modelupdates features slopen](/blog/silent-model-updates-ai-feature) die de week ervoor nog elke test haalden.

Het verschil met bakje één is niet de ernst, het is de informatie. In bakje één weet je niet wat er mis is. In bakje twee weet je wat er mis is en mis je het gereedschap om het te repareren zonder iets anders te breken. Audits zijn voor die eerste toestand. Een week besteden aan een rapport terwijl je de lijst al hebt, is betalen voor papierwerk.

## Symptoomgroep drie: de demo bewijst het model, niet het product

Het moeilijkste gesprek. Iemand bouwde een notebook, of een Streamlit-app, of een Next.js-pagina die een API-route aanroept met de key in een env var, en het AI-deel is overtuigend. Er is geen multi-tenancy, geen permissiemodel, geen audit trail, geen adminweergave, geen onboarding, niets dat bewaart wat er gisteren gebeurde.

Signalen:

- De demo draait op één set credentials en de data van één gebruiker.
- "Auth doen we later" is hardop gezegd.
- De productbeslissingen staan nog open: wie ziet wat, wat gebeurt er bij een antwoord met lage confidence, wie keurt wat goed, hoe corrigeert een gebruiker een verkeerde output.
- Niemand is eigenaar zodra degene die het bouwde iets anders gaat doen.

Dat is een volledige build, zes tot twaalf weken, en het AI-deel is vaak de kleinere helft. [De meeste offertes prijzen drie van de zeven lagen](/blog/full-ai-feature-build-scope-cost), en daarom voelt het bedrag verkeerd als je het vergelijkt met wat de demo kostte.

De vraag hardening of opnieuw bouwen valt hier op één test: is er een architectuur om te harden? Als data-isolatie nooit is ontworpen, ga je die niet in week twee van een hardening-sprint toevoegen. [Waar multi-tenant RAG lekt](/blog/multi-tenant-ai-feature-data-leaks) is een ontwerpeigenschap, geen patch.

## Het symptoom dat mensen op het verkeerde been zet: kosten

Kosten zijn het enige signaal dat je niets vertelt over het bakje waarin je zit, en het is het signaal dat de telefoon het vaakst laat rinkelen.

Een week van 400 euro die 40 had moeten zijn kan komen van een prototype dat bij elke deploy het hele corpus opnieuw embedt. Dat is bakje één, en de fix is een dag. Dezelfde overschrijding kan komen van een productieagent die blijft hangen op een tool call die hij niet kan afmaken, vijf keer retryt, zonder cap op iteraties. Dat is bakje twee: een gat in observability en controle, en het verbrande bedrag is een functie van hoe lang je het niet zag. Of de uitgaven zijn correct en de architectuur is verkeerd, omdat elke gebruikersvraag een samenvatting van een volledig document triggert die een gecachete extractie had moeten zijn, één keer bij ingest gedraaid. Bakje drie, en geen hoeveelheid prompt tuning redt dat.

Zelfde symptoom, drie diagnoses, drie heel verschillende prijskaartjes op de fix. Voordat je iets besluit op basis van een kostengetal: haal de uitsplitsing per request op. Tokens in, tokens uit, calls per gebruikersactie, cache hit rate. Ik ben de [vijf oorzaken achter de meeste LLM-kostenpieken](/blog/llm-cost-spike-production) elders doorgelopen, en de diagnostische waarde zit in welke oorzaak het blijkt te zijn, niet in het totaal.

## Eén product, drie diagnoses, achttien maanden ertussen

Een hypothetisch geval dat past op een patroon dat ik herhaaldelijk zie. Een B2B-SaaS-bedrijf bouwt een supportassistent over hun helpcentrum. Maand nul: hij antwoordt goed in demo's, heeft het volledige corpus van 8.000 artikelen nooit gezien, en er is geen evalset. Dat is een audit. Eén week vertelt ze dat retrieval instort voorbij ongeveer 2.000 documenten omdat chunking de artikelstructuur negeert, dat de kosten per gesprek ruwweg vier keer hun aanname in de prijsstelling zijn, en welke drie fixes vóór de launch moeten. Twee maanden later gaan ze live.

Maand zeven: live, 600 klanten gebruiken het. Er komen tickets over antwoorden die ingetrokken artikelen citeren. Een prompttweak om de breedsprakigheid te beperken sloopte stilletjes het citatieformaat en negen dagen merkte niemand het. Nu is het hardening: evals met ship gates, promptversiebeheer, tracing, alerts op dalende faithfulness. Zelfde systeem, zelfde code, volstrekt ander werk.

Maand achttien: het bedrijf verkoopt aan enterprise-klanten die kennisbanken per klant nodig hebben, SSO, audit logs en een adminpaneel om gemarkeerde antwoorden te reviewen. De retrievalpipeline blijft staan. Alles eromheen is nieuw, en het eerlijke antwoord is een build, omdat single-tenant-aannames in de datalaag zijn ingebakken.

Drie opdrachten, één product, geen van de drie een fout. De faalmodus is de verkeerde kiezen voor de huidige maand: auditen terwijl je het al weet, harden terwijl er niets onder zit, herbouwen wat werkt.

## De zelftest van één pagina, vóór je iemand belt

Open een document en beantwoord deze. Schrijf het echte antwoord op, niet "daar moeten we naar kijken".

1. Hoeveel echte externe gebruikers hebben dit de afgelopen 30 dagen gebruikt?
2. Waar staat de evalset, en wanneer is hij voor het laatst gedraaid?
3. Wat zijn de kosten per gebruikersactie, op de mediaan en op p95?
4. Noem de laatste drie storingen en hoe je er elke keer achter kwam.
5. Als het model vannacht 20% slechter werd, wat zou je dan alarmeren?
6. Wie ziet wiens data, en wat in de code dwingt dat af?
7. Wat is het plan als je primaire provider een uur lang errors teruggeeft?
8. Welke enkele fix zou je het eerst doen, en waarom die?

Zeven of acht stevige antwoorden en je hebt geen diagnose nodig, je moet uitvoeren. Vier tot zes, met de gaten geclusterd rond monitoring en evals, en je zit in hardening. Minder dan vier, of je kunt vraag 6 helemaal niet beantwoorden, en je staat dichter bij een build dan de demo suggereert. Wil je de langere versie, dan gaat [de POC-zelfaudit met 15 checks](/blog/ai-poc-self-audit-checklist) per punt dieper, en [de audit die je doet vóór je om budget vraagt](/blog/ai-demo-to-production-audit) behandelt hoe je de bevindingen presenteert aan de mensen die over het geld gaan.

Spreken de antwoorden elkaar tegen, wat vaker gebeurt dan je zou denken, dan is precies die onduidelijkheid wat een POC Audit oplost: één week, een schriftelijk oordeel over het bakje waarin je zit, en een 90-dagenplan met de fixes op volgorde. Hoe wij dat scopen staat op de [servicespagina](/services), en wil je je antwoorden op die acht vragen doorlopen met iemand die elk van deze drie keuzes minstens één keer verkeerd heeft gemaakt, [neem dan contact op](/contact).
