---
title: "Prompt Versiebeheer in Productie: Stop Stille Regressies Nu"
description: "Prompt versiebeheer productie voorkomt stille regressies: manifest, git-diff, regressiesuite en rollback in 5 minuten zonder redeploy."
published: "2026-09-15"
tags: ["prompt versiebeheer", "LLM in productie", "AI engineering", "regressietests", "MLOps"]
ogImage: "/images/blog/prompt-versioning-regression-testing/cover.jpg"
primaryService: "hardening"
---
Eén prompt-aanpassing, dezelfde middag geshipt, loste de bug op die een klant had gemeld. Een week later zag support dat twee andere flows stilletjes slechter waren geworden. Niemand kon zeggen hoe de prompt er vóór de wijziging uitzag, niemand had een test die het had gevangen, en terugdraaien betekende een volledige redeploy van een service die sindsdien vier andere dingen had uitgeleverd. Als dat jouw week is, is deze post voor jou.

Ik ben meer dan eens in precies die situatie binnengeroepen, en de oorzaak is altijd dezelfde: het team ziet prompt-versiebeheer in productie als een nice-to-have, terwijl een wijziging van twee regels in een Python-bestand een branch, een review, een CI-run en een getagde release nodig heeft. De prompt is het artefact dat het gedrag van het hele systeem het sterkst bepaalt, en het krijgt de minste discipline.

Dit is de praktische opzet die ik tijdens hardening-werk neerzet: wat je versioneert naast de prompt-string, hoe je je eigen productiefouten omzet in een regressiesuite, en een rollback-pad dat minuten kost in plaats van een deployment. Niets hiervan vraagt een nieuwe vendor. Het meeste is een dag of twee werk als je weet waar je op mikt.

## Het moment waarop dit bijt: één prompt-edit, drie stille regressies

Het patroon herhaalt zich zo betrouwbaar dat ik het ticket kan beschrijven voordat ik het lees. Een gebruiker meldt dat de assistent te langdradig is, of een geldig verzoek weigert, of een datum verkeerd formatteert. Een engineer opent de system prompt, voegt een zin toe ("Antwoord altijd in maximaal drie zinnen" of "Noem nooit producten van concurrenten"), test hem tegen die ene gemelde case, ziet dat het werkt, en merget. De fix is echt. De gemelde case is nu correct.

Wat niemand heeft getest: dezelfde prompt bedient de onboarding-flow, de support-flow en de interne samenvattingsjob. "Maximaal drie zinnen" heeft zojuist elk meerstaps troubleshooting-antwoord afgekapt. "Noem nooit concurrenten" zorgt ervoor dat het model een legitieme migratievraag weigert. Geen van beide flows heeft een owner die er dagelijks naar kijkt, dus de regressie komt een week later boven via een klantescalatie, niet via een dashboard.

Drie dingen maakten dit duur in plaats van een fix van vijf minuten:

- **Geen diff.** De prompt leefde in een databaserij of een f-string, en de vorige versie bestond alleen in iemands geheugen of een Slack-thread.
- **Geen test.** Er was geen set inputs die de andere twee flows vertegenwoordigde, dus er faalde niets vóór de merge.
- **Geen rollback-pad korter dan een release.** De prompt-wijziging ging mee met ongerelateerde code, dus terugdraaien betekende ook de code terugdraaien.

Over de algemene lijst van dingen die breken schreef ik in [de productie-punchlist uit 2,5 jaar praktijk](/blog/what-breaks-in-ai-production). Ongetrackte prompt-edits staan op die lijst, maar ze verdienen een eigen artikel omdat de fix specifiek is, goedkoop, en bijna niemand hem doorvoert voordat hij zich eraan heeft gebrand.

## Waarom "het is maar een string" precies het probleem is

Engineers versioneren code omdat ze begrijpen dat code gedrag definieert. Prompts definiëren gedrag directer dan het meeste van de code eromheen, en toch worden ze opgeslagen als configuratie, bewerkt als copy, en geshipt als een typo-fix. Dat komt deels door cultuur (de product owner "is eigenaar van de tekst") en deels doordat de tooling voor prompts nog steeds op een tekstvak lijkt.

![Prompt Versiebeheer in Productie: Stop Stille Regressies Nu](/images/blog/prompt-versioning-regression-testing/1.jpg)

Het diepere probleem is dat een prompt geen string is. Het is een functie met verborgen inputs. Zijn gedrag hangt af van het model waar hij tegen is afgesteld, de temperature en max tokens waarmee hij draait, de few-shot-voorbeelden die erin zitten, de tool-definities waarvoor hij is geschreven, het formaat van de retrieval-context dat hij verwacht, en de output-parser die leest wat er terugkomt. Verander één van die dingen en "dezelfde" prompt gedraagt zich anders. Een team dat de string versioneert maar niet de model-pin, krijgt alsnog een verrassing op de dag dat de provider een alias uitfaseert en de default stilletjes naar een nieuwer model schuift.

Dit is ook waarom de test "draai de gemelde case nog een keer" vals vertrouwen geeft. Eén case vertelt je dat de wijziging het gedrag in één richting heeft verschoven. Hij zegt niets over de tien andere richtingen waarin het tegelijk is verschoven. LLM-gedrag is niet lokaal: een zin die je toevoegt om de opmaak te fixen kan weigeringspercentages, toon, frequentie van tool-calls en hallucinatiegraad allemaal tegelijk verschuiven. Je hebt een spreiding van cases nodig om dat te zien, en die spreiding moet uit echt verkeer komen.

## Prompt-versiebeheer in productie: wat echt een versie nodig heeft

De eenheid van versiebeheer is niet de prompt-tekst. Het is de volledige configuratie die een bepaald gedrag heeft opgeleverd. Ik noem het een prompt-manifest, en in de praktijk is het een YAML- of JSON-bestand in de repo, één per prompt, dat er ongeveer zo uitziet:

yaml
id: support-answer
version: 14
model: <provider-model-id, gepind op een gedateerde snapshot, nooit een alias>
params:
  temperature: 0.2
  max_output_tokens: 800
template: prompts/support-answer/v14.md
few_shot: prompts/support-answer/examples-v3.jsonl
tools: [lookup_order, create_ticket]
output_schema: schemas/support-answer.json
eval:
  suite: evals/support-answer/regression.jsonl
  baseline_score: 0.91
  last_run: 2026-09-12
changelog: "Kortere antwoorden alleen voor order-status intent; zie incident #482"

Elk veld op die lijst heeft een productieregressie veroorzaakt die ik persoonlijk heb gedebugd:

- **Model-pin.** Altijd een gedateerde snapshot, nooit `latest` of een zwevende alias. Provider-upgrades zijn de meest voorkomende ongetrackte prompt-wijziging in de hele industrie, en ze gebeuren zonder dat iemand in je team iets aanraakt.
- **Params.** Een temperature die van 0.2 naar 0.7 gaat "om het vriendelijker te maken" is een gedragswijziging van dezelfde orde als de prompt herschrijven.
- **Few-shot-voorbeelden.** Dat is trainingsdata in vermomming. Eén voorbeeld aanpassen verandert het patroon dat het model imiteert voor elke input.
- **Tool-definities.** Een tool hernoemen of de beschrijving herformuleren verandert wanneer het model hem aanroept. Dat is een prompt-wijziging, ook als het prompt-bestand onaangeraakt blijft.
- **Output-schema en parser.** Als de prompt zegt "antwoord in JSON met velden a, b, c" en de parser verwacht d, dan is dat een geversioneerd contract tussen twee bestanden.
- **Eval-score op het moment van release.** Zonder die score kun je niet zeggen of versie 15 beter of slechter is dan 14; je kunt alleen zeggen dat ze verschillen.

De template zelf leeft als bestand in git, niet als databaserij. Als een product owner de tekst moet aanpassen, geef die persoon dan een pull-request-flow met een preview-omgeving, geen CMS-veld. Git geeft je de diff, de blame, de review en de tag gratis. Elke prompt-management-vendor verkoopt in essentie een mooiere UI daarbovenop, en sommige zijn dat later waard, maar de git-versie is genoeg om het bloeden te stoppen.

Nog een regel die ik afdwing: prompt-wijzigingen gaan in hun eigen commits, gescheiden van codewijzigingen. Dat klinkt bureaucratisch tot de dag dat je de ene moet terugdraaien en de andere niet.

## Een regressiesuite bouwen uit je eigen productiefouten

De reflex is om testcases uit je verbeelding te schrijven: "een gebruiker vraagt naar refunds", "een gebruiker is onbeleefd", "een gebruiker schrijft in het Engels". Die cases zijn prima als smoke test, maar het zijn gokjes. De suite die echte regressies vangt, is gebouwd uit de inputs die al zijn misgegaan in productie, want dat zijn de inputs waarop je prompt fragiel is.

Dit is de procedure die ik gebruik, en hij levert binnen een week na aanzetten een bruikbare suite op:

1. **Log elke request en response met de manifest-versie eraan.** Input, opgehaalde context, tool-calls, output, model, versienummer, latency, kosten. Zonder de versie-tag kun je een slechte output niet toeschrijven aan een wijziging.
2. **Vang fouten op het moment dat ze worden opgemerkt.** Een duimpje omlaag in de UI, een support-escalatie, een engineer die iets vreemds ziet in de logs. Elke wordt een case: de exacte input, de exacte context, en een korte notitie over wat het juiste gedrag had moeten zijn.
3. **Schrijf de assertion op het juiste niveau.** Sommige cases hebben een deterministische check: de output is geldige JSON, de tool `create_ticket` is aangeroepen, het antwoord bevat een bepaalde zin niet, het antwoord is korter dan N tokens. Andere hebben een oordeel nodig: "het antwoord gaat over de leververtraging, niet over het retourbeleid". Daarvoor gebruik ik een tweede model als grader, met een rubric geschreven door de mens die de fout meldde, en ik kalibreer de grader tegen een steekproef van menselijke labels voordat ik hem vertrouw.
4. **Neem de cases op die nu wél slagen.** Een regressiesuite is geen buglijst. Het is een vastlegging van het gedrag dat je wilt behouden. Elke flow die de prompt bedient heeft een handvol representatieve, nu-correcte cases nodig, anders beschermt de suite alleen het laatste dat kapotging.
5. **Draai hem bij elke prompt-wijziging, en blokkeer de merge erop.** In mijn ervaring draait een suite van 80 tot 200 cases in een paar minuten en kost hij centen per run. Er is geen budgetargument om hem over te slaan.

Eén case in de suite ziet er zo uit:

json
{
  "id": "support-0137",
  "source": "escalatie #482, 2026-09-03",
  "flow": "troubleshooting",
  "input": "Mijn router geeft een oranje lampje na de firmware-update, wat moet ik doen?",
  "context_fixture": "fixtures/kb-router-oranje-lampje.txt",
  "assert": {
    "min_steps": 3,
    "must_mention": ["houd de resetknop ingedrukt"],
    "must_not_mention": ["neem contact op met je provider"],
    "judge_rubric": "Antwoord loopt de stappen uit het KB-artikel in volgorde af en kapt niet af."
  }
}

Het veld `flow` is belangrijker dan het lijkt. Als een wijziging bedoeld is om alleen één flow te raken, moet de suite je vertellen welke andere flows zijn verschoven. Dat is precies de informatie die het team uit het openingsverhaal niet had.

Waar de gelabelde cases vandaan komen, is waar dit aansluit op [de continuous eval loop](/blog/llm-evaluation-production-continuous-eval): dezelfde productie-sampling die je wekelijkse kwaliteitscijfer voedt, voedt ook de regressiesuite. Als hallucinatie je grootste probleem is, beschrijft [de veldgids voor het eerste uur bij hallucinatie](/blog/llm-hallucination-in-production) hoe je die specifieke cases triageert voordat je er tests van maakt.

## Rollback: een prompt in productie terugdraaien in minder dan 5 minuten

Een rollback die een redeploy vereist, is geen rollback. Het is een release, met alle ceremonie en risico van een release, op het slechtst mogelijke moment. Het doel is: een slechte prompt-versie wordt gedetecteerd, iemand met de juiste rechten zet de actieve versie terug naar het vorige manifest, en het verkeer draait binnen minuten op het oude gedrag, zonder de code aan te raken.

De mechaniek is niet ingewikkeld:

- **De service laadt het prompt-manifest at runtime**, op prompt-id en versie, uit een store die hij opnieuw kan inlezen zonder herstart. Een kleine tabel, een config-bucket, een feature-flag-service die je toch al draait voor andere dingen. De repo blijft de bron van waarheid; de store is een gepubliceerde kopie van een getagde versie.
- **De actieve versie is een pointer.** `support-answer → v14`. Een nieuwe prompt-versie deployen betekent v15 publiceren en de pointer verzetten. Terugdraaien betekent de pointer naar v14 verzetten. Beide zijn één commando.
- **Elke versie die ooit actief was, blijft beschikbaar.** Je verwijdert v14 niet als v15 live gaat. Schijfruimte is goedkoop en de mogelijkheid om live outputs over versies heen te vergelijken is meer waard dan de netheid.
- **Roll forward op dezelfde manier als je terugrolt.** Canary v15 naar 10 procent van het verkeer, vergelijk een dag lang de eval-metrics en de gebruikerssignalen met v14, en verzet dan de pointer voor iedereen. Een prompt die maar één flow bedient kan sneller naar 100 procent; een die er vijf bedient niet.

Twee dingen maken dat dit echt vijf minuten kost in plaats van een uur. Ten eerste: de persoon met dienst kent het commando en heeft de rechten; dit is een runbook-entry, geen stamkennis. Ten tweede: de logs dragen het versienummer, zodat de on-call binnen een minuut na de rollback kan bevestigen dat nieuwe requests op v14 draaien en het foutpercentage daalt.

Ik heb teams dit zien doen met niets meer dan een YAML-bestand in een S3-bucket en een cache-TTL van 30 seconden in de service. Het is niet glamoureus. Het werkt, en het is het verschil tussen een slechte vrijdagmiddag en een slecht weekend.

## Waar dit aansluit op continuous eval, en waar het niet overlapt

Mensen halen de regressiesuite en de eval loop door elkaar, en bouwen dan de ene in de veronderstelling dat ze de andere hebben. Ze beantwoorden verschillende vragen.

De **regressiesuite** beantwoordt: heeft deze wijziging iets kapotgemaakt dat eerst werkte? Hij draait vóór de merge, op een vaste set cases, en hij is deterministisch genoeg dat een fout de wijziging blokkeert. Zijn taak is bestaand gedrag beschermen.

De **continuous eval loop** beantwoordt: wordt het systeem in de loop van de tijd beter of slechter op echt verkeer, inclusief verkeer waar je nooit een test voor schreef? Hij draait op een schema tegen gesamplede productiedata, produceert een score met een trend, en zijn taak is drift detecteren: gebruikers die nieuwe dingen vragen, een kennisbank die verandert, een provider-snapshot dat veroudert.

De overlap is de pipeline die gelabelde cases produceert. De fout die je vindt in de wekelijkse eval-steekproef wordt een case in de regressiesuite, zodat de volgende prompt-wijziging hem niet opnieuw kan introduceren. Zet de regressiesuite als eerste op: hij is kleiner, hij blokkeert, en hij is wat het bloeden stopt voor het team uit de eerste alinea. De eval loop komt daarna en hergebruikt dezelfde logging, dezelfde grader en hetzelfde case-formaat.

Wat versiebeheer niet oplost, is modeldrift aan jouw kant van de pin. Als je een snapshot pint en de provider zet hem op deprecated, dan word je gedwongen van model te wisselen, en dat is de prompt-wijziging met de grootste blast radius van allemaal. De regressiesuite is wat een gedwongen modelmigratie een klus van één dag maakt in plaats van twee weken gokken; het is de enige manier om te weten welke van je 30 prompts de overstap hebben overleefd en welke werk nodig hebben.

## Wat je deze week opzet als je hier nog niets van hebt

Als het openingsverhaal jouw team is en je vrijdag uit de gevarenzone wilt zijn, is dit de volgorde waarin ik het zou doen:

- **Dag een: zet elke prompt in de repo** als bestand, met een manifest dat de model-snapshot en de params pint. Grep de codebase op elke f-string met "You are a" of "Je bent een" erin; je vindt er meer dan je verwacht. Tag de huidige staat als versie 1 van elke prompt, ook als je vermoedt dat hij fout is. Je hebt een baseline nodig voordat je een betere prompt nodig hebt.
- **Dag twee: voeg het versienummer toe aan elke LLM-request-log.** Als je inputs en outputs nog helemaal niet logt, is dit de dag dat je begint. Niets anders op deze lijst werkt zonder.
- **Dag drie: schrijf de eerste 30 regressiecases** uit de afgelopen maand aan escalaties, duimpjes omlaag en Slack-klachten. Splits ze per flow. Voeg per flow tien nu-slagende cases toe zodat de suite beschermt wat werkt.
- **Dag vier: koppel de suite aan CI** zodat een prompt-wijziging niet kan mergen met een falende case. Deterministische asserts eerst; voeg de model-als-grader toe voor de cases die dat nodig hebben.
- **Dag vijf: maak de actieve versie een runtime-pointer** en schrijf het rollback-runbook. Oefen het daarna één keer, expres, in een rustig uur, zodat de eerste echte rollback niet ook de eerste generale repetitie is.

Niets hiervan vraagt een nieuw platform. Het vraagt de beslissing dat de prompt code is, en hem dezelfde discipline te geven die je een betalingsberekening zou geven. De teams die dit doen, hebben de week van "één edit, drie regressies" niet meer. De teams die het niet doen, hebben hem over een maand opnieuw, met een andere zin.

## Waar dit een opdracht wordt

Prompt-versiebeheer, de regressiesuite en het rollback-pad zijn één regel in de [Production Hardening](/services)-opdracht: drie tot zes weken waarin ik evals, monitoring, prompt-versiebeheer en latency- en kostencontroles om een AI-feature heen zet die werkt in dev maar breekt onder echte gebruikers. Als je team net een prompt-edit heeft geshipt die iets brak wat je niet kunt terugdraaien, [neem dan contact op](/contact) en we beginnen met de regressiesuite.
