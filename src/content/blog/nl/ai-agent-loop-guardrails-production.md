---
title: "AI-agent loops beheersen: stop de 340-call ticket-ramp"
description: "AI-agent loops beheersen met iteratie-, tijd- en kostenbudgetten, loopdetectie en escalatiepaden, zodat agents aantoonbaar stoppen in plaats van doorwerken."
published: "2026-10-09"
tags: ["AI-agents", "LLM-kosten", "agent loops", "observability", "production hardening"]
ogImage: "/images/blog/ai-agent-loop-guardrails-production/cover.jpg"
primaryService: "hardening"
---
Een support-agent waar ik naar mocht kijken deed 340 tool calls op één ticket voordat iemand het merkte. Hij probeerde een ordernummer te vinden. De lookup-tool gaf een leeg resultaat terug, de agent besloot dat het formaat dan wel verkeerd moest zijn, herformatteerde het en riep dezelfde tool opnieuw aan. Niets crashte, geen alert ging af, en de tokenkosten voor dat ene gesprek waren ruwweg wat honderd normale tickets kosten. **AI-agent loops beheersen** begint precies daar: bij het geval dat geen error gooit.

Elke iteratie sleepte de volledige, groeiende message history mee, dus de kosten per stap liepen onderweg op. Het ticket stond negen minuten op "in behandeling". Een agent die een error gooit is zichtbaar. Een agent die blijft doorwerken is dat niet, en het standaardgedrag van elk framework dat ik heb gebruikt is: doorwerken tot iets van buitenaf hem stopt.

Hieronder staat de workflow die ik gebruik om een agent aantoonbaar te laten stoppen: waar de loopbeslissingen zitten, welke caps echt binden, hoe je een loop detecteert vóór een cap hoeft af te gaan, wanneer je overdraagt aan een mens, en hoe je het geheel test.

## Hij crasht niet, hij gaat alleen door

Losgeslagen agents zijn duur om een saaie, structurele reden: wat een agent tot agent maakt is een loop waarvan de exitconditie door het model wordt bepaald. Een chain heeft een vast aantal stappen. Een agent vraagt na elke stap "ben ik klaar?" en het antwoord komt van dezelfde component die net het probleem niet kon oplossen.

Dus als een tool iets teruggeeft dat het model niet verwacht (een leeg resultaat, kapotte JSON, een 500, een timeout, een permissiefout verwoord als proza), concludeert het model heel vaak dat het de taak verkeerd heeft aangepakt in plaats van dat de taak niet uitvoerbaar is. Eén keer is dat een redelijke gevolgtrekking. Twaalf keer op rij met een uitdijend contextvenster is het een ramp.

Twee dingen verbergen het. Ten eerste: de kosten per request zien er prima uit, het zijn de kosten per taak die exploderen, en de meeste teams meten requests. Ik schreef over dit patroon in [de vijf oorzaken achter een LLM-kostenpiek](/blog/llm-cost-spike-production), waar ongecapte agent loops naast retrieval bloat en retry storms staan. Ten tweede: loops lossen zich vaak uiteindelijk op, dus ze komen binnen als "dat ticket was een beetje traag" in plaats van als incident.

## Drie plekken waar een agent besluit om nóg een ronde te doen

Voordat je caps toevoegt, moet helder zijn welke loop je capt, want teams cappen er meestal één en laten de andere twee open.

![AI-agent loops beheersen: stop de 340-call ticket-ramp](/images/blog/ai-agent-loop-guardrails-production/1.jpg)

**De reasoning loop.** De hoofdcyclus van de agent: denken, tool aanroepen, observeren, beslissen of je doorgaat. Dit is de loop waarvoor frameworks een limiet aanbieden (`recursion_limit` in LangGraph, `max_iterations` in oudere LangChain-agents, `max_iter` per CrewAI-agent). Het is ook de enige die de meeste teams instellen.

**De retry loop binnen één stap.** Je HTTP-client probeert de provider drie keer. Je tool wrapper probeert de onderliggende API twee keer. Je parser voor gestructureerde output probeert het opnieuw met een repair prompt als validatie faalt. Geen van die pogingen verhoogt de iteratieteller, dus een agent met een limiet van 15 kan makkelijk 90 modelcalls doen. [Repair loops bij gestructureerde output](/blog/llm-structured-output-failures-production) zijn hier bijzonder goed in, omdat de repair prompt de mislukte output én het schema bevat, waardoor elke retry duurder is dan de oorspronkelijke call.

**De delegatieloop.** In multi-agent-opstellingen vraagt agent A iets aan agent B, B heeft opheldering nodig, vraagt A, A delegeert opnieuw met meer context. Elke sub-agent kan zijn eigen iteratiebudget hebben, en die budgetten vermenigvuldigen. Een supervisor met 10 iteraties over vier workers met elk 10 is een plafond van 400 stappen dat niemand heeft opgeschreven. Dit is een van de echte redenen om naar [een expliciete graph te bewegen in plaats van impliciete delegatie](/blog/crewai-to-langgraph-migration-playbook): de edges die je kunt tekenen zijn de loops die je kunt tellen.

Schrijf dat plafond als rekensom op voordat je code aanraakt. Vermenigvuldig de nesting, vermenigvuldig met je worst-case tokens per stap, vermenigvuldig met je prijs per miljoen. Voelt dat getal ongemakkelijk, dan heb je je eerste hardeningtaak gevonden.

## AI-agent loops beheersen met drie caps: iteraties, tijd en budget

Je hebt ze alle drie nodig, want elke cap mist precies wat de andere twee opvangen.

Een **agent iteration limit** is de makkelijkste en de zwakste. Hij stopt oneindige loops maar zegt niets over kosten, want iteratie 14 met 80k tokens opgebouwde historie kost veel meer dan iteratie 2. Zet hem toch, en zet hem laag. Voor de meeste single-purpose agents begin ik op 8 tot 12 en kijk ik streng naar elke taak die legitiem meer nodig heeft. Als je p99-taak 11 van de 12 iteraties gebruikt, is je limiet geen guardrail maar de rand van een klif waarop je staat.

Een **wall-clock deadline** vangt wat iteratietellers missen: één tool call die 90 seconden hangt, een provider die degradeert, een retryketen met exponential backoff die technisch gezien netjes afrondt. Zet de deadline één keer bij het entrypoint, geef hem door als absolute timestamp, en check hem vóór elke tool call en elke modelcall in plaats van alleen tussen iteraties. Timeouts per call zijn geen vervanging: vier timeouts van 30 seconden achter elkaar is een taak van twee minuten.

Een **token- of kostenbudget** per taak is de cap die commercieel uitmaakt en die ik het minst vaak zie. Hij is ook simpel: tel prompt- plus completion-tokens op over elke modelcall in de taak, inclusief retries en sub-agents, en weiger de volgende call als de verwachte kosten het plafond zouden doorbreken. Dat "verwachte" is belangrijk. Pas na de call checken betekent dat de dure call al gedaan is.

python
class TaskBudget:
    def __init__(self, max_tokens, deadline_ts, max_steps):
        self.max_tokens = max_tokens
        self.deadline_ts = deadline_ts
        self.max_steps = max_steps
        self.tokens = 0
        self.steps = 0

    def check(self, projected_tokens):
        if time.time() > self.deadline_ts:
            raise Terminated("deadline")
        if self.steps >= self.max_steps:
            raise Terminated("step_limit")
        if self.tokens + projected_tokens > self.max_tokens:
            raise Terminated("budget")

    def record(self, usage):
        self.tokens += usage.prompt_tokens + usage.completion_tokens
        self.steps += 1

Eén object, aangemaakt bij het begin van de taak, doorgegeven aan elke modelcall en elke tool wrapper inclusief geneste agents. De belangrijke ontwerpkeuze is dat sub-agents het budget van de parent delen in plaats van een eigen budget te krijgen. Gedeelde budgetten vermenigvuldigen niet.

De andere helft van echte **LLM agent cost control** is wat er gebeurt als een cap afgaat. Een exception gooien die als stack trace in een 500 eindigt is een slechte uitkomst voor de gebruiker en een slechtere voor je supportqueue. Termineer naar een gedefinieerde staat: een deelresultaat met het werk dat wel gedaan is, een reason code, en een volgende actie (escaleren, in de wachtrij zetten voor een retry met andere parameters, of eerlijk terugmelden "dit heb ik niet af kunnen maken"). Een cap die afgaat moet een bruikbaar artefact opleveren, geen leegte.

## Een loop opmerken vóór de cap afgaat: herhaling en geen voortgang

Caps zijn de vloer. Goede **agent loop detection** ziet de pathologie bij stap vier in plaats van bij stap twaalf, en dat is het verschil tussen een goedkope stop en een dure.

Twee signalen doen het meeste werk.

**Herhaling.** Hash elke tool call als (toolnaam, genormaliseerde argumenten) en houd een teller per taak bij. Dezelfde tool met dezelfde argumenten twee keer is vaak legitiem, bijvoorbeeld een retry na een tijdelijke storing. Drie keer is vrijwel nooit productief. Dat normaliseren is cruciaal, want het interessante geval is de agent die de input cosmetisch verandert: `ORD-10432`, `ord 10432`, `10432`. Lowercase, whitespace en interpunctie eruit, dan hashen. Herhaalt de genormaliseerde call zich, stop dan en vertel het model expliciet dat het dit al geprobeerd heeft en dit resultaat kreeg. Soms breekt die ene geïnjecteerde observatie de loop al, omdat het model de herhaling in de context nodig heeft en niet alleen in jouw metrics.

**Geen voortgang.** Moeilijker, en de moeite waard. Definieer voortgang voor jouw agent concreet in plaats van abstract: nieuwe feiten die aan een scratchpad zijn toegevoegd, een verplicht veld in het outputschema dat gevuld is, een document dat eerder niet werd opgehaald, een statusovergang in je eigen workflow. Tel dan de iteraties sinds de laatste voortgang. Twee of drie zonder iets nieuws is een loop, hoe gevarieerd de tool calls er ook uitzien. Een agent die vijf verschillende tools afgaat die allemaal niets nuttigs teruggeven, komt door een herhalingscheck heen en zakt op deze.

Een derde, nog goedkoper signaal: contextgroei zonder statusverandering. Als de message history met 6k tokens is gegroeid en je gestructureerde taakstatus byte-identiek is, praat de agent tegen zichzelf.

Zet dit allemaal in je traces. De sequentie van tool calls, de iteratieteller, cumulatieve tokens en de terminatiereden per taak, geaggregeerd zodat je de verdeling ziet in plaats van losse slechte dagen. Zonder dat kun je geen eerlijke iteratielimiet zetten, want je weet niet wat je p95-taak daadwerkelijk nodig heeft. Dit is het punt waarop [LLM-observability ophoudt een dashboard te zijn en een ontwerpinput wordt](/blog/llm-observability-production-monitoring).

## Wanneer de agent moet stoppen en een mens vragen in plaats van opnieuw proberen

Opnieuw proberen is het standaardantwoord van het model op bijna alles. Bij een behoorlijk deel van de echte storingen is retrying de verkeerde zet en escaleren de goede, en de agent kan dat verschil zelf meestal niet zien. Beslis het dus buiten het model.

Escaleer, retry niet, wanneer:

- Een tool een permissie- of authfout teruggeeft. Geen enkele herformulering repareert een ontbrekende scope.
- Een verplichte input echt afwezig of ambigu is. Een agent die een ordernummer gokt is erger dan een agent die het vraagt.
- De actie onomkeerbaar is en de zekerheid laag: refunds, mails naar klanten, writes naar een system of record. Vraag goedkeuring in plaats van opnieuw te redeneren.
- Twee verschillende tools het oneens zijn over een feit waar de taak op leunt. Dat is een dataprobleem, geen redeneerprobleem.
- Een herhalings- of geen-voortgangssignaal al één keer is afgegaan.

In de praktijk betekent dat dat je tool wrappers getypeerde fouten teruggeven (`retryable`, `terminal`, `needs_human`) in plaats van strings, en dat de orchestratielaag op dat type routeert voordat het model het resultaat ooit ziet. Het model mag nooit degene zijn die beslist of een authfout nog een poging waard is.

Escalatie heeft een bestemming nodig die echt bestaat: een wachtrij die iemand leest, met het deelresultaat, de trace en een specifieke vraag. Escaleren naar het niets is gewoon een langzamere timeout.

## Terminatie aantonen: zo test je of je agent echt stopt

Dit is het deel dat wordt overgeslagen, en het is het enige deel dat van de rest een garantie maakt.

Test terminatie zoals je overal foutafhandeling test: forceer de condities. Bouw een fixture-harnas waarin tools stubs zijn die je zelf bepaalt, en schrijf dan cases die er specifiek op zijn ontworpen om een agent te laten tollen.

- **De altijd-lege tool.** Elke lookup geeft geen resultaten. Assert dat de taak binnen de iteratielimiet termineert met reden `no_progress` of `step_limit`, en nooit het tokenbudget overschrijdt.
- **De altijd-falende tool.** Geeft elke keer een 500. Assert dat het totaal aan modelcalls onder je berekende plafond blijft, inclusief retries op HTTP-niveau. Dit is de case die vermenigvuldigde retrylagen blootlegt.
- **De trage tool.** Slaapt tot voorbij de deadline. Assert dat de deadline midden in de call afgaat, niet erna.
- **De oscillerende tool.** Geeft A, dan B, dan A voor identieke inputs. Klassieke brandstof voor een oneindige loop, en een goede test van je herhalingshash.
- **De permissiefout.** Assert dat de run bij het eerste voorkomen escaleert en nul extra modelcalls doet.
- **Het dure-context-geval.** Voer een groot document in zodat elke iteratie 20k tokens meesleept. Assert dat de budgetcap afgaat vóór de iteratiecap, met een bruikbaar deelresultaat.

Draai die in CI bij elke prompt- en frameworkwijziging. Promptwijzigingen veranderen loopgedrag; een nieuwe instructie als "wees grondig en verifieer je werk" kan het gemiddeld aantal iteraties verdubbelen zonder dat er één regel code verandert. Nog een argument voor [prompts versioneren en er regressietests op draaien](/blog/prompt-versioning-regression-testing).

Assert daarna ook op kosten in je testsuite, niet alleen op correctheid. Leg per scenario het maximum aan tokens per taak vast en laat de build falen als dat met meer dan, zeg, 20% regresseert. Het is de enige kostenbeheersing die werkt vóór de deployment in plaats van na de factuur.

## Wat je checkt voordat je hem meer autonomie geeft

Sta je op het punt een agent meer traffic, meer tools of schrijfrechten op een echt systeem te geven, dan zijn dit de vragen waar ik eerst antwoord op zou willen:

- Wat is het maximale aantal modelcalls dat één taak kan doen, retries en sub-agents meegerekend, en heb je dat met een test geverifieerd in plaats van door de code te lezen?
- Wat zijn de maximale kosten van één taak, en wie wordt gepaged als de p99 daarboven komt?
- Delen alle geneste agents één budgetobject, of heeft elk een eigen budget?
- Levert een afgaande cap een deelresultaat met reason code op, of een stack trace?
- Welke storingen escaleren in plaats van retryen, en wordt die beslissing buiten het model genomen?
- Kun je van vorige week de verdeling van iteraties per taak zien, en niet alleen het gemiddelde?

De meeste teams kunnen er twee of drie beantwoorden. Het gat is zelden vakmanschap, het is dat deze vragen pas urgent worden na de eerste dure week, en dan heeft de agent al traffic. Het ontwerpwerk zelf is bescheiden: een budgetobject, getypeerde toolfouten, twee detectiesignalen, zes testfixtures. Een paar dagen werk die een open-einde aansprakelijkheid dichtzet, en dat is in elk kwartaal een goede ruil.

## Veelgestelde vragen

**Wat is een redelijke agent iteration limit?**
Lager dan je denkt. Voor single-purpose agents (lookup, extractie, routing) dekt 8 tot 12 bijna alles. Voor research- of multi-tool-agents: kijk naar je tracedata, neem de p95 iteratieteller van succesvolle taken en voeg een kleine marge toe. Kun je dat getal niet krijgen, dan gok je, en hoog gokken is hoe een ticket van 340 calls ontstaat.

**Voorkomt een tokenbudget per taak echt kostenpieken?**
Het voorkomt de onbegrensde variant, en dat is degene die een verrassende factuur oplevert. Het helpt niet tegen een gestage toename in traffic of tegen prompts die stilletjes langer zijn geworden. Behandel het budget per taak als een plafond op worst-case schade en houd aparte monitoring op je totale spend; de [oorzaken achter een kostenpiek](/blog/llm-cost-spike-production) zijn meestal meerdere dingen tegelijk.

**Hoe detecteer ik een agent loop zonder de agent te vertragen?**
Beide hoofdsignalen zijn goedkoop. Een genormaliseerde tool call hashen kost microseconden, en voortgang bijhouden is een teller die je verhoogt als je eigen status verandert. Geen van beide heeft een modelcall nodig. Weersta de verleiding om een LLM-judge realtime loops te laten detecteren: dan voeg je kosten en latency toe aan een pad dat bestaat om kosten en latency te beheersen.

**Kunnen de framework-defaults dit voor me regelen?**
Deels. LangGraph's recursion limit en CrewAI's `max_iter` dekken de reasoning loop, en dat is één van de drie. Geen enkel framework dat ik heb gebruikt houdt een gedeeld kostenbudget bij over geneste agents, projecteert kosten vóór een call, of onderscheidt retryable van terminale toolfouten voor je. Dat deel is van jou, welk framework je ook koos. Wat er verder overleeft bij contact met productie schreef ik uit in [agent-frameworks in 2026](/blog/agent-frameworks-2026-what-survives-production).

**Moet de agent zelf van zijn budget weten?**
Het model vertellen dat het een beperkt budget heeft kan helpen bij prioriteren, maar het kan hem ook nerveus en sloppy maken: werk afkappen om tokens te "sparen". Ik houd het budget liever in de orchestratielaag en injecteer alleen specifieke observaties, zoals "je hebt deze tool al met deze argumenten aangeroepen en kreeg een leeg resultaat".

Een agent cappen die al in productie werkt is precies de vorm van een Production Hardening-traject: drie tot zes weken om iteratie-, tijd- en gedeelde budgetplafonds toe te voegen, loopdetectie op herhaling en geen-voortgang, getypeerde escalatiepaden, en een terminatietestsuite die in CI draait, zodat de agent meer traffic kan dragen zonder meer risico. De scope van dat werk staat op de [servicespagina](/services), en wil je een tweede paar ogen op je huidige agent loop voordat je zijn rechten uitbreidt, dan is de [contactpagina](/contact) de snelste route.
