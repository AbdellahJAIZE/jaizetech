---
title: "Hoe lang duurt het om een AI-feature te bouwen? Vier ranges"
description: "Twijfel je hoe lang AI-feature bouwen echt duurt? Vier projectvormen, eerlijke weekranges en het middelste derde dat elke offerte weglaat."
published: "2026-09-13"
tags: ["AI-feature bouwen", "AI ontwikkeltijd", "RAG", "AI agent", "evals"]
ogImage: "/images/blog/how-long-to-build-an-ai-feature/cover.jpg"
primaryService: "ai-features"
---
Typ "hoe lang AI-feature bouwen" in een zoekbalk en je krijgt twee soorten antwoorden. Leveranciers zeggen twee weken. Engineers zeggen "dat hangt ervan af". Allebei heb je er nu niets aan, want het budget is net goedgekeurd en iemand in het MT wil voor vrijdag een lanceerdatum.

Ik heb er genoeg van begin tot eind gebouwd om je een beter antwoord te geven dan die twee. Geen enkel getal, want dat zou een leugen zijn, maar vier concrete projectvormen met eerlijke weekranges, een voorbeeld week voor week, en het deel dat elke schatting weglaat: het middelste derde van het project, waarin niemand een model integreert en iedereen vecht met evals, latency en randgevallen.

Twijfel je nog of je überhaupt moet bouwen, lees dan eerst [de build-versus-buy-rekensom](/blog/build-vs-buy-ai-features). Deze post gaat ervan uit dat je hebt besloten. Je wilt weten hoe lang het duurt, wat het korter maakt, en wat je vraagt aan een leverancier die in het eerste gesprek al een tijdpad noemt.

## Waarom elk tijdpad voor een AI-feature op dag een al fout is

Dat getal van twee weken is niet de leugen die je denkt. Twee weken is echt hoe lang het duurt om een demo te krijgen die werkt. Ik kan in een paar dagen een chatvenster aan een model hangen, het op jouw documentatie richten en het vragen laten beantwoorden. Dat is de demo die je bij de leverancierspitch zag. Het is ook de demo die je eigen team in een hackathon bouwt.

Het probleem is dat die demo grofweg de eerste 20 procent van het werk is, en het is de enige 20 procent die van buitenaf zichtbaar is. Alles daarna, het deel dat een demo omzet in iets dat je bij betalende klanten neerzet zonder supportincident, is onzichtbaar tot het ontbreekt. Ik heb een lange lijst geschreven van [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production); de korte versie is dat niets daarvan in week twee opduikt.

De leverancier liegt dus niet. Hij offreert het deel dat hij weet te offreren. De "hangt ervan af"-engineer doet ook niet moeilijk; die heeft de andere 80 procent gezien en wil zich niet vastleggen op een getal voordat hij weet hoe jouw data eruitziet. Geen van beiden geeft je wat je nodig hebt: een range met de aannames erbij.

## Hoe lang AI-feature bouwen: de vier projectvormen en hun weekranges

Bijna elke AI-feature die ik gevraagd word te bouwen valt in een van vier vormen. De vorm, niet de branche en niet het model, bepaalt het tijdpad. Deze ranges gaan uit van een senior engineer die er als hoofdtaak aan werkt, met aan jouw kant een product owner die binnen een dag vragen beantwoordt. Verdubbel ze als de engineer dit naast een volle sprint doet.

![Hoe lang duurt het om een AI-feature te bouwen? Vier ranges](/images/blog/how-long-to-build-an-ai-feature/1.jpg)

**Chatbot op je documenten (RAG-assistent): 6 tot 8 weken.** Supportassistent, interne kennisbank, "vraag het onze docs". De modelintegratie is een dag. De tijd gaat zitten in ingestie (je documenten zijn rommeliger dan je denkt), chunking en retrieval-kwaliteit, de eval-set, en de faalwijzen die ik beschreef in [waarom RAG in productie breekt](/blog/rag-breaks-in-production). Zes weken als je content in een systeem staat en redelijk actueel is. Acht als het verspreid staat over Confluence, SharePoint, een PDF-map en iemands Google Drive.

**Agent met tools: 8 tot 12 weken.** Alles wat handelt: een order opzoekt, een CRM-record bijwerkt, opstelt en verstuurt, inplant. Elke tool is een integratie met eigen auth, rate limits en faalwijzen, en elke tool die de agent kan aanroepen is een tool die de agent verkeerd kan aanroepen. De extra weken ten opzichte van de chatbot zijn permissies, guardrails, een menselijke goedkeuringsstap waar geld of data wordt geraakt, en het testen van meerstapspaden die op stap vier omvallen. Twaalf weken als er meer dan vijf tools zijn of als de tools schrijven naar systemen van waarheid.

**Extractie-pipeline: 6 tot 10 weken.** Facturen, contracten, intakeformulieren, e-mails naar gestructureerde data. Deze vorm oogt het simpelst en is het gevoeligst voor je data. Zijn de documenten uniform, dan zes weken. Zijn er twaalf leveranciers met twaalf lay-outs, gescande pagina's en handgeschreven notities, dan tien. De eval is hier onverbiddelijk, want de output gaat een database in, niet een chatvenster waar een mens hem eerst leest. Mijn post over [document intelligence-patronen](/blog/document-intelligence-ocr-llm-extraction) beschrijft hoe de pipeline zelf eruitziet.

**Voice of realtime: 10 tot 14 weken.** Telefoonagents, live transcriptie met acties, alles waar latency in honderden milliseconden wordt gemeten en een stilte van twee seconden kapot voelt. Al het werk van de agentvorm, plus audio-infrastructuur, afhandeling van onderbrekingen, telefonie en een compleet ander eval-probleem. Ik heb [de stack gebenchmarkt](/blog/voice-ai-b2b-livekit-openai-realtime-benchmarks) en ik begroot nog steeds de bovenkant van de range. Dit is de vorm waarbij een offerte van twee weken het gesprek hoort te beëindigen.

Let op wat niet op de lijst staat: het model. GPT wisselen voor Claude voor Gemini voor een zelfgehoste Qwen is dagen, geen weken. Besteedt een leverancier het eerste gesprek aan welk model hij gaat gebruiken, dan praat hij over het deel dat jouw tijdpad niet bepaalt.

## Wat het middelste derde opeet: evals, latency en kosten tunen, niet modelintegratie

Zo ziet elk van deze projecten eruit op een kalender. Eerste derde: de demo, plus infrastructuur en datatoegang. Laatste derde: hardening, uitrol, overdracht. En een middelste derde dat vrijwel volledig uit drie activiteiten bestaat die niemand in een voorstel zet.

**De eval-set bouwen.** Je kunt niet zien of een wijziging de feature beter maakte zonder een set echte inputs met bekend-goede outputs. In mijn ervaring heb je grofweg 150 tot 300 voorbeelden nodig voordat de cijfers stoppen met schommelen als je ze opnieuw draait, en het moeten echte cases uit jouw data zijn, niet cases die de engineer heeft verzonnen. Ze verzamelen, labelen met je domeinexpert en de harness bouwen om ze te draaien kost op zichzelf een tot twee weken. Teams slaan dit over, shippen op gevoel, en besteden dan dezelfde twee weken na de lancering in incidentmodus. Ik heb geschreven over de [continuous eval loop](/blog/llm-evaluation-production-continuous-eval) die uit deze stap voortkomt; het bouwproject is waar hij begint.

**Latency en kosten tunen.** De demo gebruikte het grootste model zonder caching en niemand vond het erg dat een antwoord negen seconden duurde. Echte gebruikers vinden dat wel erg. Het middelste derde is waar je makkelijke gevallen naar een kleiner model routeert, prompt caching toevoegt, de context inkort die je in elke call propt, en de retrieval parallelliseert. Hier zakt ook de kostprijs per request van "prima voor een demo" naar iets dat tienduizend gebruikers per dag overleeft; de cijfers in mijn [post over productie-LLM-kosten](/blog/cost-of-production-llm-2026) zijn de uitkomst van dit werk, niet de input ervan.

**Randgevallen.** De lange staart van inputs die de demo nooit zag: de vraag in het Nederlands terwijl de docs Engels zijn, de PDF die eigenlijk een afbeelding is, de klant die drie dingen in een bericht vraagt, de tool die een time-out geeft. Elk daarvan is een middag. Het zijn er dertig. Dat is de week.

Niets hiervan is glamoureus en niets hiervan is "AI" zoals de directiepresentatie het zich voorstelt. Het is het verschil tussen een feature die in een demo werkt en een die op een dinsdagmiddag werkt met een echte klant.

## Een uitgewerkt tijdpad: een B2B SaaS-team shipt een AI-feature voor supporttickets

Concreet voorbeeld, samengesteld uit projecten die ik heb gedaan. Een B2B SaaS-bedrijf met een supportteam van twaalf mensen wil een AI-feature in de helpdesk: inkomende tickets classificeren, een antwoord opstellen uit het helpcenter en eerder opgeloste tickets, en een medewerker laten bewerken en versturen. Agentvorm, licht: twee leestools, een schrijftool met een mens in de loop. Ik zou tien weken offreren en hier gaan ze naartoe.

**Week 1.** Toegang tot de helpdesk-API, de helpcenter-export en een jaar aan opgeloste tickets. Gegevensbeschermingsreview, want oude tickets bevatten klantdata; de [AVG-vraag voor Nederlandse teams](/blog/company-data-openai-gdpr-netherlands) wordt hier beslecht, niet in week negen. De product owner en ik spreken af wat een "goed concept" is en kiezen 200 tickets die de eval-set worden.

**Week 2.** De demo: retrieval over helpcenter en oude tickets, er verschijnt een concept in een zijbalk. Iedereen is enthousiast. Dit is de week die de leverancier "klaar" zou hebben genoemd.

**Week 3.** Supportleads labelen de 200 eval-tickets. Eerste eval-run. Concepten zijn acceptabel op grofweg de helft. De andere helft laat zien dat het helpcenter voor twee productgebieden verouderd is en dat oude tickets vol oplossingen staan die een jaar geleden klopten en nu niet meer. Dit is een contentprobleem en een retrieval-probleem en het kost een week om te fixen.

**Week 4 en 5.** Classificatie en routering. Latency zakt van zeven seconden naar onder de drie door classificatie naar een klein model te verplaatsen en de system prompt te cachen. De eval klimt naar de zeventig procent. De randgevallen beginnen: tickets met meerdere vragen, boze klanten waar een opgewekt concept verkeerd is, tickets in het Nederlands.

**Week 6.** Guardrails. Het concept mag nooit een terugbetaling, een datum of een feature beloven. Een tweede, goedkope modelcheck vangt die af voordat het concept getoond wordt. Hallucinatiegevallen in de eval krijgen een eigen categorie en een target. De menselijke goedkeuringsstap krijgt zijn echte UI.

**Week 7.** Shadow mode. De feature draait op elk live ticket, niemand ziet de concepten, we loggen alles. Dit vindt de tickettypes die de eval-set nooit haalden, en dat is precies het punt.

**Week 8.** Drie supportmedewerkers gebruiken het echt. Feedbackknoppen, trace-logging, een dashboard met acceptatiepercentage, edit distance en kosten per ticket. Prompts gaan onder versiebeheer met een rollback.

**Week 9.** Het hele supportteam. Kosten per ticket landen op een paar cent. Het acceptatiepercentage stabiliseert. Twee randgevallen uit echt gebruik dezelfde dag gefixt.

**Week 10.** Overdracht: runbook, een eval-harness die het team zelf kan draaien, alerting op drift, een geschreven lijst van wat de feature niet doet. Klaar.

Het model werd in week 2 gekozen en in week 4 een keer gewisseld. Totale tijd besteed aan "AI-integratie" zoals mensen zich dat voorstellen: misschien vier dagen van de vijftig.

## Wat het tijdpad echt korter maakt, en wat nooit korter wordt

Dingen die echt weken schelen:

- **Schone, gecentraliseerde data.** Een bron van waarheid voor de documenten of records die de feature leest. Dit is de grootste hefboom en hij ligt volledig aan jouw kant van de tafel.
- **Een domeinexpert met echte uren.** Iemand die eval-cases kan labelen en binnen een dag "klopt dit concept?" beantwoordt. Elke dag wachten op dat antwoord is een dag dat het project stilstaat.
- **Smalle scope voor versie een.** De supportfeature hierboven ging live met drie tools, niet negen. Al het andere ging op een lijst voor versie twee. De [post over pilot-scoping](/blog/ai-pilot-to-production-scoping) beschrijft hoe je die lijn trekt.
- **Bestaande infrastructuur.** Heb je al observability, een deploy-pipeline en feature flags, dan is dat een week die ik niet kwijt ben aan het bouwen ervan.

Dingen die nooit korter worden, wie je ook inhuurt:

- **De eval-set bouwen.** Je kunt een senior of een junior engineer betalen; de domeinexpert moet nog steeds naar 200 cases kijken.
- **Shadow mode en gefaseerde uitrol.** Echt verkeer laat dingen zien die synthetisch verkeer niet kan, en het laat ze zien in het tempo waarin echt verkeer binnenkomt.
- **Juridische en datareview.** Begint die niet in week een, dan landt hij in week acht als blocker.

Een senior engineer zorgt er niet voor dat de eval-set zichzelf labelt. Wat een senior engineer wel doet: op dag drie weten welke van de dertig randgevallen ertoe doen en welke kunnen wachten, de omweg van twee weken vermijden naar een framework dat toch vervangen wordt, en weigeren een datum te beloven voordat hij je data heeft gezien. Dat is het verschil tussen de onderkant en de bovenkant van elke range hierboven; het is niet het verschil tussen acht weken en twee.

## Hoe "klaar" eruitziet voordat je het geshipt noemt

Omdat "de demo werkt" het niet is, hier mijn definitie, en ik zou hem in het contract zetten:

- Een eval-set van echte cases, met een cijfer, die draait bij elke prompt- of modelwijziging.
- p95-latency en kosten per request gemeten tegen een target dat je in week een hebt afgesproken.
- Traces opgeslagen voor elke request: promptversie, opgehaalde context, tool calls, output.
- Prompts onder versiebeheer met een rollback in een commando.
- Een kill switch, per feature of per onderwerp, die een niet-engineer kan omzetten.
- Een geschreven lijst van wat de feature expliciet niet afhandelt, en wat er gebeurt als hij zo'n geval tegenkomt.
- Een runbook dat je team kan volgen als het acceptatiepercentage volgend kwartaal zakt.

Wordt een build afgerond zonder die punten, dan is hij niet af, dan is het een demo met gebruikers. Die versie van "klaar" is wat mensen zes maanden later een hardening-traject in trekt.

## Vier vragen voor een leverancier die in het eerste gesprek een tijdpad noemt

Of het nu een bureau is, een freelancer of ik, stel deze vragen voordat je iets tekent:

1. **"Welke van de vier vormen is dit, en waar in de range zitten we?"** Kunnen ze geen vorm noemen en geen reden voor de onder- of bovenkant, dan hebben ze nog niet over jouw project nagedacht.
2. **"Waar in jullie tijdpad wordt de eval-set gebouwd, en wie labelt hem?"** Het juiste antwoord noemt een week en noemt iemand aan mijn kant van de tafel. "We testen grondig" is geen antwoord.
3. **"Wat is de vroegste week waarin dit op echt verkeer draait, en in welke modus?"** Shadow mode rond het tweederdepunt. Als het eerste echte verkeer de lanceerdag is, is het tijdpad fictie.
4. **"Wat staat er in jullie definitie van klaar, op papier?"** Leg hem naast de lijst hierboven. Alles wat ontbreekt is een kostenpost die je later betaalt, meestal aan iemand anders.

Wil je de build liever in huis halen, dan is [een AI engineer aannemen in Nederland](/blog/hire-ai-engineer-netherlands) een aparte rekensom, en het eerlijke tijdpad daarvoor is de wervingstijd plus dezelfde ranges als hierboven.

## Waar dit een opdracht wordt

Heb je het budget en een feature die in een van deze vormen past, dan is een [Full Build](/services) een senior engineer die het van begin tot eind in eigendom neemt, zes tot twaalf weken lang: de AI-feature en het product eromheen, met de eval-set, de gefaseerde uitrol en de definitie van klaar hierboven vanaf week een in het plan ingebouwd. Wil je een realistisch tijdpad voor jouw specifieke feature voordat je je vastlegt op een lanceerdatum, [neem contact op](/contact) en we leggen het in het eerste gesprek naast je data en je team.
