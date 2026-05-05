---
title: "EU AI Act-checklist voor Nederlandse softwareteams"
description: "Nederlandse SaaS-teams overschatten hun risicocategorie onder de EU AI Act. Een werkbare checklist voor de deadline van augustus 2026. Geen juridisch advies."
published: "2026-04-22"
tags: ["EU AI Act", "compliance", "Nederland", "regulering"]
ogImage: "/og-image.png"
primaryService: "ai-audit"
---

De deadline van augustus 2026 is over drie maanden, en elke Nederlandse CTO met wie ik praat heeft dezelfde blik op zijn gezicht. Ze hebben drie checklists van compliance-leveranciers gelezen, een webinar uitgezeten en kwamen er verwarder uit dan ze erin gingen. De leveranciers willen ze een platform verkopen. De advocaten willen een retainer. Niemand wil gewoon zeggen wat een normaal SaaS-team van twintig mensen op een dinsdagochtend moet doen.

Dat is wat deze post probeert te doen. Het is geschreven vanuit het perspectief van een werkende engineer die regelgeving leest omdat hij features moet uitleveren die eraan raken, niet omdat hij het leuk vindt. **Dit is geen juridisch advies.** Als je een aanbieder van hoogrisicosystemen bent, heb je een echte advocaat nodig. Als je dat niet bent, heb je waarschijnlijk een middag en een goede checklist nodig. De meesten van jullie zitten in de tweede groep, en je weet het nog niet.

## Val je eigenlijk wel onder de verordening?

Voordat je in paniek raakt over conformiteitsbeoordelingen en EU-databases, zoek uit in welke categorie je zit. De meeste Nederlandse B2B SaaS-teams waarmee ik gesproken heb denken dat ze hoogrisico zijn omdat ze "AI gebruiken". Dat zijn ze niet. De verordening is specifieker dan dat.

### Wat telt als een "AI-systeem"

De verordening definieert een AI-systeem in Artikel 3(1). De korte versie is dat het een machine-gebaseerd systeem moet zijn dat, op basis van de input die het ontvangt, afleidt hoe het outputs zoals voorspellingen, aanbevelingen of beslissingen genereert, met enige mate van autonomie en aanpassingsvermogen.

In gewone taal. Als je een rules engine hebt die zegt `if customer.country == "NL" then show_dutch_terms`, dan is dat geen AI onder de verordening. Als je een regex hebt die factuurnummers uit pdf's haalt, ook geen AI. Als je een logistische regressie hebt die churn voorspelt, dan is dat AI. Als je GPT-4 wrapt om tickets samen te vatten, dan is dat AI.

De grens die ertoe doet. Inferentie en aanpassingsvermogen. Een deterministische regel valt buiten de scope. Een geleerd model erbinnen.

### Aanbieder, gebruiksverantwoordelijke of general-purpose AI

Zodra je weet dat je een AI-systeem hebt, bepaal welke rol je speelt. De verordening splitst dit in drieën en je verplichtingen zijn voor elke rol heel verschillend.

Een **aanbieder** is degene die het AI-systeem onder eigen naam op de markt brengt. Als je een model traint en het in je product uitlevert, dan ben je de aanbieder van dat systeem.

Een **gebruiksverantwoordelijke** (deployer) is degene die een AI-systeem in een professionele context gebruikt. Als je de OpenAI API aanroept om supporttickets samen te vatten, dan ben je gebruiksverantwoordelijke van het OpenAI-model en aanbieder van de support-samenvattingsfeature die je erbovenop hebt gebouwd.

Een aanbieder van een **general-purpose AI-model** (AI voor algemene doeleinden, GPAI) is OpenAI, Anthropic, Mistral, Meta. Niet jij. Tenzij je foundation models traint, is deze categorie niet direct jouw probleem. Je erft een aantal verplichtingen via de contracten met je aanbieders.

De meeste Nederlandse SaaS-teams zijn gebruiksverantwoordelijken van GPAI-modellen en aanbieders van kleine taakspecifieke systemen die daar bovenop gebouwd zijn. Dat zet je in een redelijke positie.

### De vier risicocategorieën

De verordening sorteert AI-systemen in vier bakjes.

**Verboden.** Social scoring, real-time biometrische identificatie in publieke ruimtes (met smalle uitzonderingen), emotieherkenning op werkplekken en in scholen, manipulatieve dark patterns die kwetsbaarheden uitbuiten. Als je een van deze dingen doet, stop ermee. Het verbod is per 2 februari 2025 ingegaan. Boetes lopen op tot 35 miljoen euro of 7 procent van de wereldwijde omzet.

**Hoogrisico.** Opgesomd in Bijlage III. We gaan in de volgende sectie in op de details. Hier komen de zware verplichtingen bij kijken waar iedereen bang voor is.

**Beperkt risico.** Vooral transparantieverplichtingen. Vertel gebruikers dat ze met AI praten. Label AI-gegenereerde content. Dat is het meeste.

**Minimaal risico.** Geen specifieke verplichtingen onder de verordening, naast algemene productveiligheid en bestaande wetgeving. Denk aan spamfilters, aanbevelingsengines voor films, NPC's in games.

Mijn eerlijke inschatting. Ongeveer 80 tot 90 procent van de Nederlandse B2B SaaS-teams die ik bekeken heb zit in beperkt risico of minimaal risico. Het transparantiewerk is echt makkelijk te implementeren. Een weekend, misschien twee. De hoogrisicoverplichtingen zijn een heel ander gesprek, en als je daadwerkelijk hoogrisico bent zou je dat inmiddels moeten weten.

## Wat "hoogrisico" daadwerkelijk betekent in 2026

Bijlage III somt de use cases op. Als jouw product een van deze raakt, ben je hoogrisico en geldt de deadline van 2 augustus 2026 in volle kracht voor jou.

### De Bijlage III-categorieën die relevant zijn voor Nederlandse SaaS

**Werkgelegenheid, management van werknemers en toegang tot zelfstandig ondernemerschap.** AI die ingezet wordt om te werven, cv's te screenen, kandidaten te beoordelen, taken toe te wijzen, prestaties te monitoren of contracten te beëindigen. Als je HR-tech bouwt met enige vorm van scoring of ranking, dan val je eronder.

**Onderwijs en beroepsopleiding.** AI die toegang tot onderwijs bepaalt, leerresultaten beoordeelt, mensen aan programma's toewijst of examenfraude detecteert. Edtech met cijfergeven of toelatingsbeslissingen, in scope.

**Toegang tot essentiële private en publieke diensten.** AI die ingezet wordt voor kredietscoring, prijsstelling van levens- en zorgverzekeringen, recht op publieke uitkeringen en alarmering. Fintech die kredietwaardigheid bepaalt, in scope. Een buy-now-pay-later flow die ML gebruikt om goedkeuring te beslissen, in scope.

**Rechtshandhaving, migratie, asiel, grensbewaking, justitie.** Waarschijnlijk niet jouw product, tenzij je aan de overheid verkoopt. Als je dat doet, weet je het.

**Biometrische categorisatie en emotieherkenning** (buiten de verboden contexten). Beperkte use cases, maar in scope.

**Beheer van kritieke infrastructuur.** Energienet, water, gas, verkeer, digitale infrastructuur. Als jouw AI helpt een van deze te runnen, in scope.

**Veiligheidscomponenten van gereguleerde producten.** Medische hulpmiddelen, voertuigen, machines. Als jouw model deel uitmaakt van een CE-gemarkeerde veiligheidsketen, in scope.

### Wat NIET hoogrisico is onder Bijlage III

Dit is het deel dat niemand benadrukt. Automatisering van klantenservice. Sales-agents en SDR's. Interne RAG over bedrijfsdocumenten. Het genereren van marketingteksten. Vertaling. Code completion. Samenvattingen van vergaderingen. Sentimentanalyse op reviews. Interne analytics-dashboards met voorspellende functies. Fraudedetectie op betalingen (dit is wat genuanceerder, maar over het algemeen ja, niet Bijlage III).

De meeste B2B SaaS in Nederland zit in deze tweede lijst. Je hebt transparantieverplichtingen. Je hebt geen conformiteitsbeoordeling om in te dienen.

## De vijf dingen die je gedocumenteerd moet hebben voor augustus 2026

Stel dat je beperkt risico of general-purpose bent. Hier is de praktische checklist.

### 1. Een transparantiekennisgeving wanneer gebruikers met AI interacteren

Artikel 50 zegt dat wanneer een persoon met een AI-systeem interacteert, hij daarvan op de hoogte gesteld moet worden, tenzij het overduidelijk is. Een chatbot moet de gebruiker vertellen dat het een chatbot is. Een AI-voice agent moet bekendmaken dat hij AI is. De bekendmaking moet aan het begin van de interactie komen.

Hoe dit eruitziet in jouw product. Het eerste bericht in je chat-widget zegt iets als "Hi, ik ben een AI-assistent. Ik kan helpen met X, Y, Z. Voor al het andere geef ik je door aan een mens." Dat is genoeg. Je hebt geen beleidsstuk van 2000 woorden nodig. Je hebt één zin op de juiste plek nodig.

### 2. Het labelen van AI-gegenereerde content

Hetzelfde artikel. Als jouw systeem synthetische audio, beeld, video of tekst genereert die op echte content lijkt, moet die output machineleesbaar gelabeld zijn als AI-gegenereerd. Voor tekst geldt de verplichting wanneer de tekst gepubliceerd wordt om het publiek te informeren over zaken van publiek belang, met enkele uitzonderingen.

Praktische versie voor de meeste SaaS. Als je marketingteksten of samenvattingen genereert die binnen het account van de gebruiker blijven, lage prioriteit. Als je AI-gegenereerde content publiceert op het publieke web namens gebruikers, dan heb je watermerken of metadata-tags nodig. C2PA is de opkomende standaard. De meeste grote modelaanbieders voegen dit toe op API-niveau.

### 3. Basis van datagovernance

Schrijf op, in één document. Welke data jouw modellen traint of fine-tunet. Waar het vandaan komt. Of gebruikers kunnen opt-outen. Hoe lang je het bewaart. Of het naar een derde partij als modelaanbieder gaat en onder welke voorwaarden.

Dit is geen beleidsstuk van 50 pagina's. Het is één pagina. Als je het niet op één pagina kunt schrijven, dan begrijp je je eigen dataflows niet, wat een ander probleem is.

### 4. Aanbiederinformatie

Als je OpenAI, Anthropic, Mistral of een andere GPAI-aanbieder gebruikt, documenteer welke modellen je gebruikt, link naar hun model cards of system cards, en noteer je contractvoorwaarden rond datagebruik. Wanneer auditors of klanten vragen "welke AI zit er in dit product", moet je een antwoord van één pagina klaar hebben.

### 5. Een intern AI-gebruiksregister

Een simpele tabel. Waar AI in jouw product draait. Welk model. Wat het doet. Wie het intern bezit. Wanneer het voor het laatst is herzien. Dit is in deze specifieke vorm niet vereist door de verordening voor systemen met beperkt risico, maar het maakt al het andere makkelijker en je enterprise-klanten gaan er vanaf eind 2026 om vragen in hun procurement-vragenlijsten.

### Voor hoogrisicosystemen, voeg toe

Als je daadwerkelijk in Bijlage III zit, heb je ook nodig.

Een risicobeheersysteem, gedocumenteerd en onderhouden over de hele levenscyclus van het model (Artikel 9). Datagovernance met kwaliteitscriteria voor trainings-, validatie- en testsets (Artikel 10). Technische documentatie waarmee een toezichthouder kan begrijpen hoe het systeem werkt (Artikel 11). Automatische logging van gebeurtenissen terwijl het systeem in gebruik is (Artikel 12). Transparantie en gebruiksinstructies voor de gebruiksverantwoordelijke (Artikel 13). Maatregelen voor menselijk toezicht, het beroemde Artikel 14. Baselines voor nauwkeurigheid, robuustheid en cybersecurity (Artikel 15). Een conformiteitsbeoordeling voor het op de markt brengen. Registratie in de EU AI-database. Monitoring na het in de handel brengen, eenmaal uitgerold.

Dit is echt werk. Als je hoogrisico bent en nog niet begonnen, ben je laat. Bel deze week een advocaat.

## Wat verandert er in je CI/CD als je een hoogrisicosysteem uitlevert

Stel dat je in Bijlage III zit en al het bovenstaande daadwerkelijk moet doen. Hier is hoe het eruitziet in code, niet in een beleids-pdf.

### Risicobeoordeling-artefacten in de repo

Jouw risicobeheerdocumentatie leeft in de repo, versiebeheerd, naast de code. Niet in Confluence. Niet in Notion. In Git. Elke modelrelease heeft een bijbehorende update van de risicobeoordeling, beoordeeld in de PR. Als het model wezenlijk verandert, verandert het risicodocument mee.

Een redelijke folderstructuur.

```
/compliance
  /models
    /ticket-classifier-v2.3
      model_card.md
      risk_assessment.md
      data_governance.md
      eval_results.json
      training_data_summary.md
```

### Model cards als build-artefacten

Elk model dat je CI bouwt produceert ook een model card. Auto-gegenereerd waar mogelijk (beoogd gebruik, samenvatting van trainingsdata, evaluatiemetrieken, bekende beperkingen). Door mensen geredigeerd voor de delen die oordeelsvermogen vragen. De model card wordt uitgeleverd naast de modelgewichten. Het is geen bijzaak.

### Transparantiekennisgevingen die automatisch gerenderd worden

Elk UI-element dat door AI wordt aangeraakt krijgt een marker. In React kan dit een `<AIBadge reason="..." />` component zijn die om elke AI-gegenereerde content heen gewikkeld wordt. Het component is niet optioneel. Als een backend-respons terugkomt met een vlag die aangeeft dat de content AI-gegenereerd is en de frontend vergeet de badge te renderen, dan vangt een lint-regel of visuele regressietest dit op. Je wilt niet dat een sales engineer jouw product demonstreert aan een Duitse auditor zonder dat de bekendmaking gerenderd wordt.

### Audit logs die verwijdering overleven

Logging onder Artikel 12. Inputs, outputs, beslissingen, timestamps, modelversie. Opgeslagen in append-only opslag. Zelfs als een klant zijn data verwijdert onder de AVG, kan de logging-eis voor hoogrisicosystemen vereisen dat je bepaalde technische logs een gedefinieerde periode bewaart. Deze spanning tussen de AVG en de AI-verordening is reëel. Betrek een advocaat bij je bewaarbeleid.

### Artikel 14 human-in-the-loop checkpoints

Voor hoogrisicosystemen moet een mens kunnen ingrijpen, overrulen of het systeem stoppen. In code betekent dat. Geen volledig geautomatiseerde beslissingen op hoogrisicopaden zonder een expliciete menselijke goedkeuringsstap. De goedkeuringsstap wordt gelogd. De identiteit van de mens wordt gelogd. De override-optie is altijd zichtbaar in de UI, niet verstopt achter drie menu's.

### Een pre-deployment checklist als CI-gate

Voordat een model naar productie kan worden gepromoveerd, controleert de pipeline. Model card aanwezig en bijgewerkt. Risicobeoordeling binnen de afgelopen X maanden. Evaluatiemetrieken boven de drempel. Datagovernance-document beoordeeld in de afgelopen release. Als één van deze faalt, wordt de deployment geblokkeerd. Dit klinkt als overhead. Het is overhead. Het is ook precies de bedoeling van de verordening.

## Wanneer heb je een advocaat nodig vs. wanneer een engineer die regelgeving leest

Dit is de vraag die ik het vaakst krijg, en daar wil ik direct over zijn.

Een advocaat interpreteert jouw specifieke aansprakelijkheidsblootstelling. Ze kijken naar je contracten, je klantenbestand, de jurisdicties waaraan je verkoopt, de worst-case scenario's voor jouw specifieke product, en ze vertellen je hoe je juridische risico eruitziet. Ze schrijven jouw model cards niet. Ze refactoren jouw CI-pipeline niet.

Een engineer die regelgeving leest vertaalt de verordening naar uitgeleverde code. Ze zoeken uit waar de transparantiekennisgeving in de React component-tree komt te staan. Ze schrijven het audit-log schema. Ze zetten de CI-gate op. Zij interpreteren jouw aansprakelijkheidsblootstelling niet.

Voor systemen met beperkt risico heb je vooral de engineer-kant nodig. De juridische interpretatie is rechttoe rechtaan genoeg dat een fatsoenlijke privacyadvocaat in een uur kan tekenen.

Voor hoogrisicosystemen heb je beide nodig. Een advocaat om jouw verplichtingen en blootstelling te scopen, plus engineering-werk om er daadwerkelijk aan te voldoen. Een van beide overslaan is duur.

**Nogmaals. Deze post is engineering-advies. Het is geen juridisch advies.** Ik ben software engineer, geen advocaat. Ik lees de verordening omdat ik AI-features uitlever en ik moet weten waartegen ik bouw. Als jouw situatie iets anders is dan vanilla beperkt risico, praat dan met een echte advocaat.

Je kunt meer lezen over mijn achtergrond op de [about-pagina](/about). De korte versie is vijf jaar productie-engineering, tweeënhalf jaar op een Nederlands agritech computer vision-platform, en een stack die dicht bij de AI-onderdelen van de verordening leeft. Geen rechtenstudie.

## Een copy-paste compliance-starter

Neem dit mee naar je volgende standup. Eén sprint werk voor een team van twintig dat niet in Bijlage III zit.

1. Breng elke plek in kaart waar AI in jouw product draait. Eén rij in een spreadsheet per plek. Modelnaam, wat het doet, eigenaar. (Een halve dag.)
2. Beslis voor elke rij. Is dit user-facing? Zo ja, weet de gebruiker dat hij met AI interacteert? Zo nee, voeg een bekendmaking toe. (Eén dag specificeren, één dag uitleveren.)
3. Als jouw product content genereert die buiten je platform gepubliceerd wordt, voeg dan C2PA-metadata toe op het generatiepunt. (Eén tot drie dagen, afhankelijk van de stack.)
4. Schrijf je datagovernance one-pager. Bronnen van trainingsdata, bewaarduur, opt-out, externe aanbieders. (Een halve dag als je je systeem kent, twee dagen als je het niet kent.)
5. Maak een lijst van je modelaanbieders en link naar hun system cards. (Eén uur.)
6. Beslis welke Bijlage III-categorieën jouw roadmap in de komende 12 maanden zou kunnen raken. Als er een is, escaleer nu naar leiderschap, want de doorlooptijd voor hoogrisico-compliance is maanden, geen weken.
7. Voeg een paragraaf toe aan je algemene voorwaarden en je privacybeleid die AI-gebruik vermeldt. Laat een privacyadvocaat ernaar kijken. (Eén tot twee weken heen-en-weer.)
8. Brief je salesteam over wat ze moeten zeggen wanneer enterprise-prospects naar AI Act-compliance vragen. Ze gaan vragen. Het antwoord "we zijn beperkt risico onder de verordening en aan onze transparantieverplichtingen is voldaan, hier is onze one-pager" is een stuk geruststellender dan een blanco blik.

Voor Bijlage III-hoogrisicosystemen is deze lijst het begin van het werk, niet het einde. Je kijkt ook naar een conformiteitsbeoordeling, registratie in de EU-database, formele documentatie van risicobeheer en een plan voor monitoring na het in de handel brengen. Dat is een traject van meerdere maanden waarbij zowel juridisch als engineering betrokken is.

## De data die je echt moet onthouden

Vastgepind aan je muur.

- **1 augustus 2024.** De verordening is in werking getreden.
- **2 februari 2025.** Verboden praktijken verboden. (Voorbij.)
- **2 mei 2025.** Praktijkcodes voor general-purpose AI. (Voorbij.)
- **2 augustus 2025.** Regels voor general-purpose AI-modellen. (Voorbij.)
- **2 augustus 2026.** De meeste andere regels, inclusief de eisen voor hoogrisicosystemen. (Dit is de grote. Drie maanden te gaan.)
- **2 augustus 2027.** Deadline voor hoogrisicosystemen die al voor augustus 2026 op de markt waren om aan de eisen te voldoen.

Boetes. Tot 35 miljoen euro of 7 procent van de wereldwijde omzet voor verboden praktijken. Tot 15 miljoen euro of 3 procent voor de meeste andere overtredingen. Kleinere boetes voor het aanleveren van onjuiste informatie aan autoriteiten. Lidstaten krijgen wat ruimte in de handhaving, en de Nederlandse autoriteiten hebben een pragmatische aanpak gesignaleerd voor mkb's die te goeder trouw inzet tonen, maar zet je bedrijf niet in op de welwillendheid van de toezichthouder.

## Waar de meeste teams nu staan

Eerlijke momentopname van wat ik in mei 2026 zie in Nederlandse SaaS.

Een paar teams hebben het werk gedaan. Hun model cards staan in Git. Hun bekendmakingen renderen automatisch. Ze slapen prima.

De meeste teams weten dat de deadline eraan komt en zijn nog niet begonnen. Ze hopen dat hun bestaande privacy- en security-werk het afdekt. Een deel ervan wel. De transparantieverplichtingen worden niet per ongeluk afgevinkt.

Een klein aantal teams is daadwerkelijk hoogrisico en weet het ofwel (en is hard aan het werk) ofwel weet het niet (en gaat erachter komen op de harde manier wanneer een enterprise-klant in Q4 om hun conformiteitsbeoordeling vraagt).

Als je niet zeker weet in welke groep je zit, dan is die onzekerheid het echte probleem om op te lossen. De verordening is vervelend, maar voor de meeste producten niet eens zo ingewikkeld. De dure fout is om het te behandelen als ofwel irrelevant, ofwel als een compliance-project van vier kwartalen, terwijl het geen van beide is.

## Een korte afsluiting

Als je een werkende engineer met je team door de verordening wil laten lopen om uit te zoeken in welke categorie je daadwerkelijk zit, lukt dat meestal in een gesprek van vijftien minuten. Vanaf daar vertelt een [audit](/services) van een halve dag je precies wat je voor augustus moet uitleveren. [Plan een gesprek](/contact) en we kijken er samen naar.

**Eén laatste keer. Deze post is engineering-advies, geen juridisch advies.** Voor alles wat verder gaat dan vanilla beperkt risico, praat met een advocaat die de verordening kent. Praat daarna met een engineer die ertegen kan bouwen. Je hebt beide nodig.

## Verder lezen

- [Een AI engineer aannemen in Nederland](/blog/hire-ai-engineer-netherlands) — wie je nodig hebt om de deadline van augustus 2026 te halen
- [Build vs buy AI features: de math voor je CTO](/blog/build-vs-buy-ai-features) — compliance verschuift de grens tussen bouwen en kopen
