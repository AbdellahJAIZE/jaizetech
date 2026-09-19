---
title: "POC-audit kosten vs. een gebroken AI-launch: de rekensom"
description: "POC-audit kosten lijken hoog, tot je ze naast een mislukte AI-launch legt. Nederlandse tarieven, echte rekensom en wanneer de audit zichzelf terugverdient."
published: "2026-09-19"
tags: ["POC-audit kosten", "AI-audit", "productielaunch", "AI-risico", "startup budgettering"]
ogImage: "/images/blog/poc-audit-cost-vs-failed-launch/cover.jpg"
primaryService: "ai-audit"
---
Je demo werkt. Je boardmeeting is over drie weken. Ergens in het deck staat een slide met "productielaunch Q4", en iemand in je team heeft zachtjes gevraagd of je het ding niet eerst moet laten auditen. Je instinct zegt nee: het werkt, een audit is een week en een bak geld, en het budget is voor bouwen, niet voor kijken.

Ik heb aan beide kanten van die beslissing gestaan, vaak genoeg om je te vertellen dat de POC-audit kosten het verkeerde getal zijn om naar te staren. Het getal dat ertoe doet is het getal dat niemand opschrijft: wat een launch die in de eerste maand breekt daadwerkelijk kost, uitgesplitst, tegen Nederlandse en EU-marktprijzen. Zet je die twee naast elkaar, dan houdt de audit op een nice-to-have te zijn en wordt het de goedkoopste regel van het hele project.

Dit is die vergelijking. Geen klantnamen, geen verzonnen benchmarks, alleen de tarieven en doorlooptijden die ik op echte opdrachten in Nederland zie, en het rekensommetje dat een CFO of investeerder nodig heeft om de uitgave in één meeting goed te keuren.

## De vraag die niemand stelt totdat de launch al gebroken is

Het patroon herhaalt zich. Een founder bouwt in zes weken een RAG-assistent of een agent-workflow, demoot het aan de board, krijgt groen licht en zet het live voor de eerste 50 echte gebruikers. Binnen twee weken is er een Slack-kanaal dat `#ai-incidents` heet. De antwoorden waren prima in de demo omdat de demo 40 uitgezochte documenten gebruikte; productie heeft er 9.000 en de helft daarvan is een gescande PDF. De kosten per gesprek zijn 6x wat de spreadsheet zei, omdat niemand het contextvenster heeft begrensd. Een klant maakt een screenshot van een gehallucineerd retourbeleid en stuurt het naar zijn accountmanager.

Op dat moment wordt de vraag eindelijk gesteld, meestal door degene die het budget aftekent: wat had het gekost om dit vooraf te weten?

Het eerlijke antwoord is bijna altijd: minder dan wat we de afgelopen twee weken hebben uitgegeven. Ik heb eerder geschreven over [wat de audit daadwerkelijk test](/blog/ai-demo-to-production-audit) en over [wat er in een echt auditrapport staat](/blog/ai-poc-audit-report-checklist). Dit stuk gaat over geen van beide. Het gaat over het geld, want het geld bepaalt de beslissing, en de meeste teams maken die som nooit.

## Wat de POC-audit kosten echt dekken: één week, vaste prijs, vaste scope

Een POC Audit is een sprint van één week tegen een werkende demo. De prijs staat vast en is afgesproken voordat ik begin; er loopt geen uurteller en er is geen "fase twee"-verrassing. Je interne kosten zijn een paar uur van één engineer voor repository-toegang, een datasample en twee calls. Dat is de hele exposure: één week, één bekend bedrag, en het project loopt parallel gewoon door als je dat wilt.

![POC-audit kosten vs. een gebroken AI-launch: de rekensom](/images/blog/poc-audit-cost-vs-failed-launch/1.jpg)

Wat je voor die week krijgt is een geschreven antwoord op drie vragen. Wat breekt er op schaal: retrievalkwaliteit op je echte corpus, latency bij gelijktijdige gebruikers, kosten per request met echte prompts, faalmodi op echte input. Wat fix je eerst: gerangschikt op hoeveel schade het aanricht op launchdag, niet op hoe interessant het is. En een 90-dagenplan om te shippen: de realistische volgorde van waar de demo nu staat naar iets dat je voor betalende gebruikers kunt zetten zonder rollback-plan aan de muur.

Dit is het deel dat mensen onderschatten. De grootste opbrengst van de audit zijn niet de bugs die hij vindt. Het zijn de beslissingen die hij afschiet. Ongeveer één op de drie audits die ik draai eindigt met "bouw dit niet zoals je van plan was", en dat bespaart een bouwbudget, geen week. De andere twee derde eindigt met een korter plan, omdat de demo op sommige plekken dichterbij was dan het team vreesde en op andere verder weg dan ze dachten. Hoe dan ook: de kosten van de audit zijn begrensd, de kosten van de build niet.

## Wat een gebroken launch echt kost: de rekening die niemand begroot

Nu de andere kolom. Ik ga dit uitsplitsen in tariefranges die in mijn ervaring realistisch zijn voor de Nederlandse en EU-markt. Jouw getallen zullen afwijken; de vorm niet.

**Spoed-engineering.** Als een AI-feature breekt voor de ogen van echte gebruikers, huur je niet in op een normale tijdlijn. Een senior AI engineer via een normaal freelancecontract in Nederland kost in mijn ervaring ruwweg €110 tot €160 per uur. Iemand die maandag kan beginnen omdat je launch bloedt, kost €175 tot €250. Een incident waar twee mensen drie weken aan werken om het te stabiliseren is 240 uur tegen een premiumtarief: ergens tussen de €40.000 en €60.000, voor een fix die je brengt waar je dacht al te zijn.

**De tijd van je eigen team.** Volledig belast kost een senior engineer in Nederland een werkgever ruwweg €500 tot €650 per dag. Twee van hen drie weken van de roadmap trekken is nog eens €15.000 tot €20.000, plus wat de roadmap-items waard waren die ze lieten liggen. Dat tweede getal is meestal groter dan het eerste en verschijnt in geen enkele incident review.

**De LLM-rekening.** Een onbegrensd contextvenster, een retry-loop, of een agent die een tool vijf keer aanroept waar één keer volstaat, kan een maandschatting van €400 in €4.000 veranderen voordat iemand naar het dashboard kijkt. Ik heb de factuur eerder zien binnenkomen dan de alert. De gedetailleerde opbouw staat in [wat een productie-LLM-feature in 2026 echt kost](/blog/cost-of-production-llm-2026); de korte versie is dat een demo geen kostenplafond heeft omdat niemand er een nodig had.

**De rebuild.** Dit is de dure. Als de audit je had verteld dat je chunking-strategie, je vectorstore-keuze of je agent-framework je echte data niet overleeft, dan vertelt de launch je precies hetzelfde drie maanden later, na de build. Een retrieval-pipeline die gebouwd is voor 40 documenten herarchitecturen zodat hij 9.000 aankan, is typisch vier tot acht weken seniorwerk. Tegen de tarieven hierboven is dat €35.000 tot €90.000 aan arbeid om te komen op het punt waar de audit je had gezet voordat je de eerste bouw-euro uitgaf.

**De verloren dealcyclus.** Voor B2B overschaduwt dit alles hierboven. Als de AI-feature het ding was dat de enterprise-pilot binnenhaalde, en de pilot gaat in week twee mis, dan schuift die deal op z'n best een kwartaal. Voor een bedrijf met contracten van €20.000 tot €50.000 per maand op het spel, is een kwartaal vertraging een gat van zes cijfers, en het staat nergens in het engineeringbudget.

**De eerste cohort.** Je eerste 50 gebruikers en je investeerders vormen één keer een mening. "De AI-feature was rommelig bij launch" is een zin die een product een jaar lang achtervolgt. Ik kan er geen eurobedrag op plakken, en jij ook niet, en dat is precies waarom het uit de vergelijking wordt gelaten en precies waarom dat niet zou moeten.

Tel de kolommen op die je kunt kwantificeren en een slechte launch van een middelgrote AI-feature landt ergens tussen de €90.000 en €200.000 aan directe kosten, vóór de dealvertraging en vóór de reputatieschade. Tegenover een audit van één week tegen een vaste prijs. Dat is de vergelijking.

## Drie triggers die een werkende demo in een duur incident veranderen

Niet elke demo breekt. De demo's die wel breken delen een kleine set triggers, en elk daarvan is iets wat een audit in de eerste twee dagen boven water haalt.

- **Echt datavolume.** Het demo-corpus was uitgezocht. Productie heeft duplicaten, scans, tien jaar oude beleidsdocumenten die het huidige beleid tegenspreken, en een inhoudsopgave die prachtig embed en niets beantwoordt. Retrievalkwaliteit zakt van "geweldig" naar "soms" op de dag dat het volledige corpus wordt geladen. De mechaniek staat in [waarom RAG werkt in dev en breekt in productie](/blog/rag-breaks-in-production).
- **Echte concurrency.** Eén gebruiker tegelijk is een demo. Twintig gebruikers tegelijk raakt rate limits, vult een queue, en legt bloot dat de "2 seconden responstijd" een p50 was, gemeten op een rustige middag. De p95 onder load is wat klanten ervaren, en niemand heeft die gemeten.
- **Echte input.** Demo-prompts zijn geschreven door degene die de feature bouwde. Echte gebruikers plakken e-mails, vragen in het Nederlands terwijl de prompts in het Engels zijn getest, en zetten een vraag midden in een document van 3.000 woorden. Elk daarvan is een hallucinatiepad of een kostenpiek die nooit is uitgeprobeerd.

Er zijn er meer, en de volledige lijst staat in [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production). Maar deze drie veroorzaken het merendeel van de dure incidenten waar ik voor word gebeld, en alle drie zijn binnen een week te testen tegen een werkende demo. Dat is het hele argument voor de audit: de faalmodi zijn bekend, ze zijn goedkoop om vóór de launch te checken, en duur om erna te ontdekken.

## De som: wanneer de audit zichzelf terugverdient voordat je shipt

Zo frame ik het als een founder me vraagt de uitgave te verantwoorden, want "het kan breken" is geen businesscase.

Neem de kans dat een AI-demo van laptopkwaliteit minstens één launch-blokkerend probleem heeft. In mijn ervaring is dat geen 10 procent. Het is ruim boven de helft. De meeste demo's die ik audit hebben er twee of drie, en het team wist van nul daarvan, omdat de demo nooit de omstandigheden heeft gezien die ze triggeren.

Neem de kosten van de goedkoopste slechte uitkomst uit de lijst hierboven: een spoedstabilisatie met contractors en je eigen team, geen rebuild, geen verloren deal. Noem het €50.000. Vermenigvuldig met een conservatieve kans van 50 procent. De verwachte kosten van het overslaan van de audit zijn €25.000, en dat is de ondergrens.

Vergelijk dat nu met een vaste prijs voor één week. De audit hoeft geen rebuild te voorkomen of een deal te redden om zichzelf terug te verdienen. Hij hoeft maar één van de drie triggers hierboven te vangen, één keer. In de praktijk verkort hij ook de build, omdat het 90-dagenplan de "dat zoeken we later wel uit"-items schrapt die altijd de laatste vier weken van een project worden. Daarom zeg ik tegen mensen dat de audit zichzelf meestal terugverdient voordat de feature live gaat: de besparing zit in het bouwplan, niet in het incident dat niet gebeurde.

Er zit nog één term in de vergelijking. De audit vertelt je of je überhaupt moet bouwen. Als hij zegt "dit heeft een andere architectuur nodig" of "dit moet een SQL-query zijn met een LLM erbovenop" (ik heb dat rapport meer dan eens geschreven, zie [de AI-functie die eigenlijk een SQL-query had moeten zijn](/blog/ai-feature-that-should-have-been-sql-query)), dan heeft hij het volledige bouwbudget bespaard. Geen enkele incidentkostenberekening vangt dat, en het is de grootste opbrengst die een audit kan hebben.

## Wat de audit niet kan voorkomen, en waarom dat telt voor de beslissing

Ik hoor het je liever van mij vertellen dan dat je het later ontdekt. De audit is een momentopname van een specifieke demo tegen specifieke omstandigheden. Hij voorkomt niet dat je modelprovider een endpoint deprecates. Hij vangt geen regressie die zes weken na het rapport door een promptwijziging is geïntroduceerd. Hij maakt de feature niet production-grade; hij vertelt je precies wat dat wél doet, en in welke volgorde.

Hij vervangt ook geen evaluatie, monitoring of promptversiebeheer in productie. Dat is een andere opdracht, en als je die overslaat, vervallen de bevindingen van de audit. Een 90-dagenplan is een plan, geen systeem.

Dat telt voor de beslissing omdat het de eerlijke scope vastlegt. Je koopt geen zekerheid. Je koopt een bekende lijst van wat breekt, gerangschikt op kosten, één week voordat je je committeert aan een build, tegen een vaste prijs. Dat is wat een verzekering werkelijk is: niet de afwezigheid van risico, maar een begrensde prijs voor het kennen van het risico voordat het een factuur wordt.

## De één-slide-versie voor je CFO of investeerder

Als je dit goedgekeurd moet krijgen, stuur dan niet de auditchecklist. Stuur één slide met drie regels.

- **Bekende kosten:** één week, vaste prijs, geen afhankelijkheid van de bouwplanning.
- **Vermeden kosten:** een stabilisatie-incident tegen spoedtarieven van contractors, in mijn ervaring €40.000 tot €60.000, en een rebuild van €35.000 tot €90.000 als de architectuur fout zit. Kans dat een demo van laptopkwaliteit minstens één launch-blokkerend probleem heeft: boven de 50 procent in mijn ervaring.
- **Uitkomst:** een gerangschikte fixlijst en een 90-dagenplan dat je in het deck kunt zetten in plaats van "productielaunch Q4" zonder iets erachter.

De derde regel is degene die het sluit. Boards financieren geen audits; ze financieren geloofwaardige plannen. Een demo plus een launchdatum is een hoop. Een demo plus een onafhankelijke lezing van wat breekt plus een gedateerd plan om het te fixen is iets wat een investeerder kan onderschrijven. De audit is hoe die tweede slide geschreven wordt.

## Waar dit een opdracht wordt

De POC Audit is een sprint van één week: ik neem je werkende demo, test hem tegen je echte data, echte load en echte input, en lever op wat er breekt op schaal, wat je eerst fixt, en een 90-dagenplan om te shippen, tegen een vaste prijs die we vooraf afspreken. De scope staat op de [dienstenpagina](/services). Heb je een demo en een boarddatum, [neem dan contact op](/contact) en we vertellen je binnen één call of een week genoeg is om de vraag te beantwoorden.
