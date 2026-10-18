---
title: "LLM model wisselen? Behandel het als migratie, niet als config"
description: "LLM model wisselen lijkt een kleine configwijziging, maar heeft grote impact. Leer de sequentie: eval diff, shadow traffic, canary en rollbacktrigger."
published: "2026-10-18"
tags: ["LLM model wisselen", "AI in productie", "model migratie", "LLM evaluatie", "production hardening"]
ogImage: "/images/blog/llm-model-migration-canary-test/cover.jpg"
primaryService: "hardening"
---
Een modelswap ziet eruit als een diff van één regel. Je verandert `gpt-4o` in `gpt-4.1`, of `claude-sonnet-4` in wat het vervangen heeft, de tests blijven groen, en de PR wordt in vier minuten goedgekeurd omdat er niets te lezen valt. Dat is precies het stuk waar LLM model wisselen mensen om de tuin leidt. De diff is klein en de blast radius is de hele feature.

Ik word hier vaak genoeg bij gehaald nadat het misging om de vorm te herkennen. Dagen lang merkt niemand iets. Dan stuurt support een paar klachten door die vaag klinken, van het type waarin de gebruiker zegt dat de antwoorden "anders aanvoelen" in plaats van fout zijn, en uiteindelijk legt iemand de timestamps naast de deploy. Op dat moment heeft het nieuwe model al een paar honderdduizend requests afgehandeld en kun je niet zeggen welke outputs slecht waren, want niemand heeft ze gescoord.

Hieronder staat de sequentie die ik gebruik als een team bewust het model achter een live feature verandert: eval diff, shadow traffic, afgetopte canary, een rollbacktrigger die vooraf is afgesproken. Niets exotisch. Het is vooral weigeren om de swap in één stap te doen.

## LLM model wisselen is een productiewijziging, geen configregel

Teams behandelen het als config omdat het als config is opgeslagen. De model-identifier staat in een environment variable naast de timeout en het loglevel, en alles in dat bestand is saai. Je deploy-pipeline maakt geen enkel onderscheid tussen het wijzigen van `LOG_LEVEL` en het wijzigen van het ding dat elk woord genereert dat je gebruikers lezen.

Zet het naast een databasemigratie. Niemand zet een schemawijziging live zonder plan voor wat er gebeurt als het verkeerd gaat, omdat de failure mode luid is en er data op het spel staat. Een modelwijziging heeft het omgekeerde profiel: de fout is stil, en wat op het spel staat is outputkwaliteit, die de meeste teams niet continu meten. Die asymmetrie verklaart waarom modelswaps minder proces krijgen dan schemawijzigingen, terwijl ze er meer verdienen.

Er zit ook een timingval in. Migraties die door een deprecation notice worden opgedrongen komen met een datum, en die datum is meestal ruim tot hij dat niet meer is. Teams laten de melding twee maanden liggen en doen de swap vervolgens onder deadlinedruk in één week, precies het moment waarop je de shadow run overslaat. Heb je nu een deprecation-mail in je inbox staan, dan is de nuttige actie van vandaag het starten van de eval diff, niet het inplannen van de swap.

## Wat er echt verandert: instructies volgen, formatting, weigeringen

Benchmarkscores zeggen bijna niets over hoe een migratie in jouw product landt, want jouw prompt is geen benchmark. De dingen die bewegen zijn smaller en vreemder dan "capability".

![LLM model wisselen? Behandel het als migratie, niet als config](/images/blog/llm-model-migration-canary-test/1.jpg)

Instructies volgen verandert van karakter. Prompts hopen workarounds op voor de eigenaardigheden van één specifiek model: een "GEEN inleiding" in kapitalen die een eerder model nodig had, een three-shot voorbeeld dat erin kwam omdat één versie steeds een veld verzon. Het nieuwe model heeft die misschien niet nodig, laat zich er misschien actief door afleiden, of heeft andere nodig. Prompts zijn op een model getuned, of je dat zo bedoeld had of niet.

Formattinggewoontes schuiven ook. Een model dat schone JSON teruggaf begint het in een fenced code block te wikkelen, of zet er een afsluitende uitleg achter de laatste accolade, of escapet quotes binnen stringwaarden anders. Is je parser strikt, dan merk je het direct, en dat is het goede geval. Is je parser vergevingsgezind, dan merk je het later, via een langzame stijging van lege velden verderop in de keten. Ik heb eerder geschreven over [gestructureerde output fouten en waarom niemand ze op een dashboard zet](/blog/llm-structured-output-failures-production); een modelmigratie is de meest betrouwbare manier om er een verse lading van te produceren.

Weigeringsgrenzen bewegen in twee richtingen. Nieuwere versies zijn soms meewerkender op content die de oudere afwees, en soms voorzichtiger op één smalle categorie die toevallig jouw kernuse case is. Voor een juridisch, medisch, HR- of financieel product is dat geen tone-of-voice-kwestie. Het is een feature-uitval voor een deel van je gebruikers die je foutpercentage nooit laat zien, want een weigering is een geslaagde API-call.

Dan is er toon en lengte. Breedsprakigheid drift, hedging drift, het model begint elk antwoord met een herhaling van de vraag. Daar breekt geen test op. Het verandert wel hoe het product aanvoelt, en bij een klantgerichte assistent is gevoel het product.

Latency en kosten schuiven mee, en niet altijd in de richting die de prijslijst suggereert. Een model dat per token goedkoper is maar 40% langere antwoorden schrijft is niet goedkoper, en als je feature naar een gebruiker streamt is het ook langzamer op de manier die telt.

## Bouw de eval diff vóór je het default model aanraakt

De eval diff is de goedkoopste stap en degene die de meeste teams overslaan, meestal omdat ze geen evalset hebben en dat niet willen toegeven op de dag dat er een deprecation-deadline valt.

Je hebt een vaste set echte inputs nodig, getrokken uit productielogs, die het saaie midden dekt plus de randen die daadwerkelijk pijn doen: de langste documenten die je verwerkt, de meertalige requests, de inputs die eerder incidenten veroorzaakten, en die waarbij gebruikers het opnieuw probeerden. Honderd tot driehonderd cases is genoeg om nuttig te zijn. Tien is het niet, en duizend met de hand gecureerd is een project dat je deze week niet afmaakt.

Draai beide modellen tegen die set, zelfde prompt, zelfde temperature, zelfde tools, en scoor op de dimensies waar je om geeft in plaats van op gelijkenis. Exacte vergelijking tussen twee modeloutputs is grotendeels ruis. Wat je wil is scoring per dimensie: hield het zich aan het formaatcontract, bleef het gegrond in de opgehaalde context, weigerde het, hoe lang was de output, hoeveel tool calls deed het, wat kostte het. Gebruik je een LLM-judge voor de subjectieve dimensies, zet dan het judge-model vast en migreer het nooit in dezelfde week; anders kun je niet zien of de kwaliteit bewoog of de meetlat. Hoe je dit continu draait in plaats van eenmalig staat in mijn stuk over [de continuous eval loop die niemand draait](/blog/llm-evaluation-production-continuous-eval).

Twee uitkomsten van een eval diff bij een model upgrade zijn allebei prima. Het nieuwe model wint of doet gelijk op alles, en je gaat door. Of het verliest op twee dimensies, en nu weet je wat je in de prompt moet repareren voordat één gebruiker het ziet. De uitkomst die niet prima is: "het leek goed toen ik een paar prompts in de playground probeerde."

Is de fix een promptwijziging, versioneer die dan als een eigen wijziging met een eigen regressierun, en bundel hem niet onzichtbaar met de modelswap. Als er later iets degradeert wil je weten welke variabele bewoog. Dat is dezelfde discipline die ik beschrijf in [prompt versiebeheer en regressietesten](/blog/prompt-versioning-regression-testing), en tijdens een migratie telt die zwaarder dan op enig ander moment.

## Shadow traffic: het nieuwe model scoren op requests die niemand ziet

Een evalset is een bevroren foto van het verkeer van vorige maand. Shadow testing van een LLM model is hoe je het nieuwe model tegen het verkeer van deze week houdt.

Het mechanisme is simpel: voor een percentage van de live requests roep je beide modellen aan, serveer je de output van het oude aan de gebruiker, en log je beide. De gebruikerservaring blijft onaangeroerd. Je betaalt dubbel op die slice verkeer, en dat is de belangrijkste reden om hem af te toppen en om dagen te draaien in plaats van weken.

Wat shadow traffic vindt en een evalset niet, is distributie. Echte gebruikers sturen dingen die je gecureerde set niet bevat: de geplakte mailthread met doorgestuurde signature, de half-Nederlandse half-Engelse vraag, de prompt-injectiepoging, de pdf van 40 pagina's die iemand per ongeluk uploadde. Je ziet de verdeling van contextlengtes verschuiven. Je ziet de lange staart van tool-callsequenties. Is je feature agentisch, dan is het getal dat meestal eerst beweegt het aantal stappen per taak, en dat getal bezit stilletjes je factuur. Ik heb [de loop-guardrail-variant van dat probleem](/blog/ai-agent-loop-guardrails-production) apart uitgewerkt.

Twee praktische randvoorwaarden. Shadow calls mogen geen side effects hebben, dus als het pad van het nieuwe model naar een database kan schrijven, een bericht kan versturen of een kaart kan belasten, draai je het tegen een sandbox of stub je de tools. En log genoeg om paarsgewijs te vergelijken: hetzelfde request-ID, beide outputs, beide latencies, beide tokenaantallen, beide tool traces. Een shadow run die je achteraf niet kunt doorzoeken is alleen een hogere factuur.

Drie tot vijf dagen shadow traffic dekt bij de meeste B2B-producten een volledige weekcyclus, inclusief het maandagpatroon en wat je batchjobs 's nachts uitspoken.

## Het canarypercentage en de rollbacktrigger die je vooraf vastlegt

Een canary rollout voor een LLM is weinig waard zonder een getal dat vooraf is opgeschreven. De mislukking die ik zie is een canary op 10% die twee weken blijft staan terwijl iedereen af en toe naar een dashboard kijkt en zegt dat het er goed uitziet, wat een beslissing is die door vermoeidheid wordt genomen.

Begin op 5%, minimaal 24 uur vastgehouden. Dan 25%, dan 50%, dan 100%, met minstens een dag per stap en geen promotie op vrijdag. Route op een stabiele hash van gebruiker- of tenant-ID, niet per request, zodat één gebruiker niet in hetzelfde gesprek het oude en het nieuwe model krijgt.

Voordat de eerste procent live gaat, schrijf je de triggers op. Ze moeten specifiek genoeg zijn dat een on-call engineer kan handelen zonder een overleg te beleggen. Bijvoorbeeld: parse failures op gestructureerde output boven 0,5% op de canary-slice, een weigeringspercentage van meer dan 2x de control, p95-latency boven het getal in je SLA, kosten per request meer dan 20% boven control, of één enkele severity-one klacht van een met naam genoemd enterpriseaccount. Kies drempels die bij je eigen baseline passen, leg vast wie aan de trigger mag trekken, en maak de rollback een configflip van seconden in plaats van een redeploy van twintig minuten.

Houd het oude model minstens twee weken bereikbaar nadat je 100% hebt gehaald. Het fallbackpad op dag één verwijderen is hoe een omkeerbare wijziging een incident wordt.

## De stille regressies die één evalsuite nooit vindt

Zelfs een gedisciplineerde migratie laat gaten, en het is nuttig om te weten waar ze zitten.

Regressies per segment verstoppen zich in geaggregeerde cijfers. De totale kwaliteit blijft stabiel terwijl het nieuwe model merkbaar slechter wordt op je drie grootste enterprisetenants, omdat hun documenten langer en gestructureerder zijn dan die van de rest. Snijd canary-metrics altijd uit per tenant, per taal en per inputlengte voordat je promoveert.

Cachegedrag verandert. Van model wisselen invalideert prompt caches, en een feature wiens economie leunde op een hoge cache hit rate kan de eerste dagen twee keer zo duur lijken puur omdat de cache koud is. Roep geen kostenregressie uit voordat de cache is opgewarmd.

Downstream consumers breken op manieren die de LLM-laag niet kan zien. Parseert een andere service jouw output, of hangt een menselijke workflow ervan af dat de samenvatting onder een bepaalde lengte blijft, dan propageert een verandering in toon of breedsprakigheid naar plekken zonder enige evaldekking. Vraag wie de output leest, mensen inbegrepen.

En in agents drift tweede-ordegedrag. Iets ander redeneren geeft een andere toolkeuze, die geeft een andere retrieval, die geeft een ander antwoord. De losse stappen scoren prima. Het traject is slechter. Dit is de model swap regression die evals op stapniveau structureel niet kunnen zien, en de enige eerlijke verdediging is end-to-end task success gemeten op echt verkeer, plus een harde stapcap.

Even duidelijk gezegd: deze hele sequentie heb je ook nodig wanneer de leverancier de wijziging doet in plaats van jij. Een bewuste migratie is het makkelijke geval, omdat jij de timing koos. Het lastigere geval staat in [stille modelupdates](/blog/silent-model-updates-ai-feature), waar de versiestring gelijk bleef en het gedrag niet.

## De week die dit kost, en wat je eerst beslist

Voor één feature met een bestaande evalset reken je op ongeveer een week echte engineeringtijd: een dag om de diff-harness te bouwen en cases te cureren, een dag om te repareren wat de diff blootlegt, drie tot vijf dagen shadow traffic die op de achtergrond draait terwijl je ander werk doet, en dan een week gefaseerde canary die aandacht vraagt in plaats van inspanning. Zonder bestaande evalset komen daar een paar dagen bij om er een te bouwen, en behandel dat als bezit in plaats van migratie-overhead, want de volgende modelwijziging staat al ingeplant of je het weet of niet.

Beslis drie dingen voor je begint. Welke ene metric go of no-go bepaalt, nu benoemd, zodat de beslissing niet op 50% opnieuw ter discussie staat. Wie de rollback bezit en wat zijn drempel is. En of je de prompt mag wijzigen tijdens de migratie, want zo ja, dan heb je twee evalruns nodig in plaats van één, en een helder spoor van welke wijziging het getal bewoog.

De teams die dit pijnlijk vinden missen meestal de laag eronder: geen evalset, geen logging per request, geen traffic splitting, geen snelle rollback. De migratie is alleen wat het blootlegde. Die laag inbouwen in een live feature, zodat de volgende modelwijziging een routineuze dinsdag is in plaats van een incident, is de kern van een [Production Hardening](/services)-traject: drie tot zes weken op evals, monitoring, prompt versioning, latency- en kostenbeheersing, en een deploy die je kunt terugdraaien. Staat er een deprecationdatum in je agenda en heb je geen manier om te meten wat de swap gaat doen, [neem dan contact op](/contact) vóór die datum, niet erna.

## Vragen die terugkomen

**Hoe lang moet shadow traffic draaien voor een canary?**
Drie tot vijf dagen voor de meeste B2B-producten, wat een volledige weekcyclus dekt inclusief weekend- en nachtelijke batchpatronen. Consumentenproducten met een sterke splitsing tussen werkweek en weekend hebben profijt van zeven volle dagen. Langer draaien voegt vooral kosten toe en weinig informatie, tenzij je verkeer sterk seizoensgebonden is.

**Op welk percentage start een LLM-canary?**
5% is een redelijke bodem voor een feature met serieus volume, minstens 24 uur vastgehouden voor je promoveert. Onder ongeveer duizend requests per dag houden percentagegebaseerde canaries statistisch op zinvol te zijn, en ben je beter af door eerst specifieke interne gebruikers of één meewerkende tenant naar het nieuwe model te routeren en de outputs met de hand te lezen.

**Moet ik mijn prompts herschrijven als ik van model wissel?**
Vaak moet je bijstellen in plaats van herschrijven, en de eval diff vertelt je welke delen. De gebruikelijke kandidaten zijn few-shot voorbeelden die op de eigenaardigheden van het oude model waren getuned, formaatinstructies die niet meer nodig zijn, en negatieve instructies ("bied geen excuses aan", "herhaal de vraag niet") die oud gedrag moesten dichten. Wijzig ze als een aparte, geversioneerde stap zodat je beweging in kwaliteit kunt toeschrijven.

**Kan ik de shadow run overslaan als de eval diff schoon is?**
Dat kan, en voor een intern tool met lage inzet is het soms de juiste ruil. Voor alles wat klanten raken moet je weten wat je opgeeft: de evalset bevat de inputs waar je aan dacht, shadow traffic bevat de inputs waar je niet aan dacht. De meeste verrassingen die ik heb gezien kwamen uit de tweede categorie.

**En als de provider het model uitfaseert en ik geen tijd heb?**
Comprimeer dan in plaats van overslaan. Een eval diff van honderd cases bouw je in een dag, en een shadow run van 48 uur op 10% van je verkeer is veel beter dan geen. Is de deadline echt een paar dagen weg, zet het dan minimaal achter een flag die je kunt terugzetten, en laat de eerste uren van elke canarystap een mens naar de output kijken.
