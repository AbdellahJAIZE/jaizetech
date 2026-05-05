---
title: "Van CrewAI naar LangGraph: een migratiehandleiding"
description: "CrewAI is top om te prototypen. LangGraph breng je naar productie. Vijf stukken die je moet toevoegen, plus de failure modes die in productie opduiken."
published: "2026-05-04"
tags: ["LangGraph", "CrewAI", "AI agents", "productie"]
ogImage: "/og-image.png"
primaryService: "ai-agent"
---

De meeste "CrewAI vs LangGraph" artikelen lezen als een feature checklist. Ze missen de echte vraag die engineers stellen. Je hebt al een CrewAI-prototype dat werkt op je laptop en het demo-publiek imponeert. Nu wil je baas het volgend kwartaal in productie. Wat moet je daadwerkelijk doen om daar te komen?

Deze post is de handleiding. Hij behandelt de vijf stukken die je nodig hebt voor je migreert, een uitgewerkt code-voorbeeld naast elkaar, de drie failure modes die opduiken zodra je live gaat, en duidelijke regels voor wanneer je het prototype houdt en wanneer je herschrijft.

## Waarom CrewAI top is om te prototypen en slecht voor productie

CrewAI is een plezier om op te zetten. De agent / role / task abstractie sluit netjes aan op hoe productmensen beschrijven wat ze willen. Je schrijft iets als "een researcher agent die bedrijfsinformatie vindt" en "een writer agent die een outreach mail opstelt", en het framework regelt het gesprek tussen die twee. Binnen een week heb je iets dat loopt en praat.

Het probleem is dat alles wat het prototype snel maakt, productie ook lastig maakt.

State management is impliciet. CrewAI geeft context door tussen agents via string concatenatie en gedeelde dictionaries die grotendeels ondoorzichtig zijn. Als er iets misgaat, kun je niet makkelijk inspecteren wat een agent zag bij stap vier versus stap vijf. Het framework beweegt snel, en dat heeft historisch gezien breaking changes betekend tussen minor versions, wat prima is als je itereert maar pijnlijk wordt zodra je een productie deployment hebt die moet blijven werken.

Observability is standaard oppervlakkig. Je ziet de eindoutput. Je ziet token usage. Je kunt niet eenvoudig in een oogopslag zien waarom een specifieke agent besloot een specifieke tool aan te roepen met specifieke argumenten op een specifieke stap.

Niets hiervan is een aanval op CrewAI. Het is het juiste tool voor een POC van een week. Het is het verkeerde tool voor maand zes in productie met een betalende klant aan de andere kant.

LangGraph maakt de tegenovergestelde keuze. Het vraagt je expliciet te zijn over state, edges en condities. De eerste keer dat je een LangGraph app schrijft, vind je het langdradig. De tweede keer dat je om elf uur 's avonds een productie-incident debugt, ben je blij dat het langdradig is.

## De vijf stukken die je nodig hebt voor je migreert

Voor je ook maar een regel migratiecode aanraakt, zorg dat deze vijf dingen bestaan. Als er een ontbreekt, bouw je je prototype opnieuw, raak je productie, en ontdek je dezelfde problemen in een meer langdradig framework.

**1. Persistente state en checkpointing.** Je CrewAI-prototype slaat conversatie geschiedenis waarschijnlijk in geheugen op. Als het proces herstart, is die geschiedenis weg. In productie heb je een checkpointer nodig. LangGraph levert `MemorySaver` voor development, `SqliteSaver` voor kleine deployments, en `PostgresSaver` voor serieuze workloads. Kies er een voor je begint.

**2. Observability met gestructureerde traces op node niveau.** Je wilt elke node entry zien, elke node exit, elke tool call, elke state diff. LangSmith is de weg van de minste weerstand omdat het door hetzelfde team is gebouwd. OpenTelemetry met een custom exporter werkt als je al een tracing stack hebt. Hoe dan ook, gestructureerde traces op node niveau zijn niet onderhandelbaar.

**3. Retry policy en idempotentie op node niveau.** Netwerkcalls falen. Model API's geven 429s terug. Tools timen out. Elke node heeft een duidelijk beleid nodig voor wat er bij falen gebeurt, en elke node moet veilig zijn om te retryen. Als je "stuur Slack notificatie" node twee berichten stuurt bij een retry, heb je een bug die op een klant zit te wachten.

**4. Een eval suite.** Golden conversations met verwachte outputs op final-answer niveau, plus assertions op stap niveau over intermediate state. Zonder dit is elke framework upgrade en elke prompt aanpassing een sprong in het diepe. Met deze suite kun je daadwerkelijk meten of je migratie een regressie is.

**5. Cost tracking op invocation niveau.** Je moet weten, voor elke gebruikersrequest, hoeveel tokens er werden verbruikt en over welk model. Dit vangt op hol geslagen agents op voor je finance team dat doet.

Merk op dat geen van deze specifiek over LangGraph gaan. Ze gaan over klaar zijn om een agent in productie te draaien. Ze bovenop CrewAI bouwen is lastiger dan ze bovenop LangGraph bouwen, maar het werk is hetzelfde werk.

## Een uitgewerkte migratie: dezelfde agent, beide frameworks

Laten we een bewust simpele taak pakken. De agent neemt een bedrijfs-URL, haalt de pagina op, extraheert gestructureerde info over het bedrijf, en post een notificatie naar Slack.

Hier is ongeveer hoe de CrewAI versie eruitziet.

```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Company researcher",
    goal="Extract structured info from a company URL",
    tools=[fetch_url_tool, parse_html_tool],
    llm=llm,
)

notifier = Agent(
    role="Slack notifier",
    goal="Post a clean summary to Slack",
    tools=[slack_post_tool],
    llm=llm,
)

research_task = Task(
    description="Fetch {url} and extract company name, industry, size",
    agent=researcher,
)

notify_task = Task(
    description="Post the summary to #sales-leads",
    agent=notifier,
)

crew = Crew(agents=[researcher, notifier], tasks=[research_task, notify_task])
result = crew.kickoff(inputs={"url": "https://example.com"})
```

Dat is ongeveer veertig regels zodra je imports en tool definities toevoegt. Het is leesbaar. Een product manager kan het pattern matchen.

Hier is hetzelfde in LangGraph.

```python
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

class AgentState(TypedDict):
    url: str
    raw_html: Optional[str]
    company_info: Optional[dict]
    slack_message_id: Optional[str]
    error: Optional[str]

def fetch_node(state: AgentState) -> AgentState:
    html = fetch_url(state["url"])
    return {"raw_html": html}

def extract_node(state: AgentState) -> AgentState:
    info = llm_extract_company_info(state["raw_html"])
    return {"company_info": info}

def notify_node(state: AgentState) -> AgentState:
    msg_id = post_to_slack(state["company_info"])
    return {"slack_message_id": msg_id}

def route_after_extract(state: AgentState) -> str:
    if state.get("error") or not state.get("company_info"):
        return END
    return "notify"

graph = StateGraph(AgentState)
graph.add_node("fetch", fetch_node)
graph.add_node("extract", extract_node)
graph.add_node("notify", notify_node)
graph.add_edge(START, "fetch")
graph.add_edge("fetch", "extract")
graph.add_conditional_edges("extract", route_after_extract, ["notify", END])
graph.add_edge("notify", END)

app = graph.compile(checkpointer=MemorySaver())
```

Ongeveer honderd regels zodra je de tool implementaties toevoegt. Langdradiger. Maar kijk wat je krijgt voor die extra zestig regels.

Je krijgt een expliciet state schema. Als `company_info` ooit de verkeerde vorm heeft, vangen je editor en je tests dat op voor productie dat doet.

Je krijgt expliciete edges. Er is geen vraag over wat na wat draait. De graph is een graph, geen vibe.

Je krijgt een conditional edge. Als extractie faalt, ga je naar END. Je post niet stilletjes een half leeg bericht naar Slack.

Je krijgt een checkpointer. Wissel `MemorySaver` voor `SqliteSaver` of `PostgresSaver` en je agent kan halverwege hervatten na een proces herstart.

Dat is de migratie in het klein. Het skelet blijft hetzelfde. Je benoemt de nodes, je definieert de state, je tekent de edges, je kiest een checkpointer.

## De drie failure modes die opduiken zodra je live gaat

Ik heb deze drie steeds zien terugkomen bij agent deployments in productie. Het maakt ze niet uit welk framework je gebruikte voor het prototype. LangGraph maakt ze zichtbaar, en CrewAI heeft de neiging ze te verbergen tot ze je geld kosten.

**Infinite loops.** Een agent besluit dat hij een tool moet aanroepen. De tool geeft iets terug wat de agent niet bevalt. De agent besluit de tool opnieuw aan te roepen met iets andere argumenten. Herhaal voor altijd. LangGraph heeft een `recursion_limit` setting op de gecompileerde graph (default 25) die precies hiervoor bestaat. Verhoog hem niet zonder na te denken. Als je echte workflow meer dan 25 stappen nodig heeft, heeft je graph waarschijnlijk een structureel probleem, geen diepteprobleem.

**State drift.** Een node muteert state op een manier die een andere node niet verwacht. Misschien is `company_info` soms een dict en soms een string. Misschien bestaat `error` maar is hij `None` versus volledig afwezig. In CrewAI veroorzaakt dit soort drift gewoon vreemd agent gedrag twee stappen later. In LangGraph met een TypedDict of Pydantic state schema vang je het op het moment dat je de node schrijft, omdat de type checker het je vertelt.

**Tool call cascades.** Een agent roept een tool aan. De tool geeft rommel terug (rate-limited response, partial JSON, een HTML error pagina die er vagelijk als data uitziet). De agent retryt met aangepaste argumenten. De tool geeft meer rommel terug. Tokens branden op. Latency piekt. Je maandrekening verdrievoudigt. De fix bestaat uit twee delen. Ten eerste, valideer tool outputs agressief voor ze in agent context komen. Ten tweede, voeg een circuit breaker toe op node niveau, zodat een node die drie keer op rij faalt stopt met proberen en de fout naar de gebruiker brengt.

Deze drie failure modes zijn de reden dat "het werkte in dev" geen nuttige uitspraak is over een agent. De interessante storingen leven op de naad tussen de vrijheid van je agent en de chaos van de echte wereld.

## Code patterns die de moeite waard zijn om te kopiëren

Een paar kleine snippets die zichzelf snel terugverdienen.

Een schoon state schema. Gebruik `TypedDict` voor simpele gevallen, Pydantic als je validatie wilt.

```python
from typing import TypedDict, Annotated
from operator import add

class AgentState(TypedDict):
    user_query: str
    messages: Annotated[list, add]
    retrieved_docs: list[dict]
    final_answer: str
```

Een conditional edge die routeert op basis van state.

```python
def route(state: AgentState) -> str:
    if not state.get("retrieved_docs"):
        return "search_more"
    if len(state["retrieved_docs"]) > 20:
        return "rerank"
    return "answer"

graph.add_conditional_edges(
    "retrieve",
    route,
    {"search_more": "search", "rerank": "rerank", "answer": "answer"},
)
```

Een checkpointer toevoegen. Gebruik `MemorySaver` in dev, echte storage in prod.

```python
from langgraph.checkpoint.sqlite import SqliteSaver

checkpointer = SqliteSaver.from_conn_string("agent_state.db")
app = graph.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": user_session_id}}
result = app.invoke({"user_query": "..."}, config=config)
```

Een tool call wrappen met retry en gestructureerde logging.

```python
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
def call_external_api(payload: dict) -> dict:
    logger.info("api_call_start", extra={"payload_keys": list(payload.keys())})
    response = http_client.post("/endpoint", json=payload, timeout=30)
    response.raise_for_status()
    result = response.json()
    logger.info("api_call_done", extra={"status": response.status_code})
    return result
```

Geen van deze is slim. Dat is precies het punt. Productie agent code hoort saaie code te zijn met een interessant stukje (de LLM call) middenin een hoop saaie scaffolding.

## Wanneer je het prototype houdt en wanneer je herschrijft

Je hoeft niet altijd te migreren. Hier zijn de regels die ik gebruik.

Houd CrewAI als al het volgende waar is.

- Minder dan 100 invocations per dag.
- Alleen interne gebruikers, geen externe klanten die ervan afhangen.
- Een nachtelijke herstart of incidentele crash is acceptabel.
- Geen compliance of audit eis.
- Workflow heeft minder dan 5 stappen en minimale branching.

Migreer naar LangGraph (of een vergelijkbaar expliciet graph framework) als een van het volgende waar is.

- Klantgericht, ook al is het een soft launch.
- Meer dan ruwweg 1000 invocations per dag.
- Je hebt een audit trail nodig van wat de agent deed en waarom.
- Workflow heeft meer dan 5 nodes of niet-triviale branching.
- Kosten zijn belangrijk en je hebt token tracking per stap nodig.
- Je moet een workflow kunnen hervatten na een proces herstart.

De reden dat deze regels werken, is dat de kosten van LangGraph vooral upfront verbosity zijn. De kosten van CrewAI in productie zijn vooral debugtijd en uptime risico. Bij laag volume domineren de upfront kosten en wint CrewAI. Bij hoog volume of externe blootstelling domineren de operationele kosten en wint LangGraph.

## Een kleine migratie checklist

Als je besluit te migreren, werk deze in volgorde af. Sla niets over.

1. Schrijf de eval suite eerst, tegen de bestaande CrewAI versie. Kies vijf tot tien golden inputs met verwachte outputs. Dit is je regressienet.
2. Definieer het state schema als een TypedDict of Pydantic model. Map elk stukje context dat de CrewAI agents aan elkaar doorgeven naar een expliciet veld.
3. Teken de graph op papier voor je code schrijft. Nodes zijn functies, edges zijn beslissingen. Als je hem niet kunt tekenen, is je workflow niet zo helder als je denkt.
4. Implementeer de nodes een voor een, met retry en logging op elke externe call.
5. Voeg de checkpointer toe. Begin met `MemorySaver`, wissel naar SQLite of Postgres voor je live gaat.
6. Draai de eval suite tegen de nieuwe versie. Diff de outputs tegen de CrewAI versie. Onderzoek elk verschil, ook de verschillen die op verbeteringen lijken.
7. Voeg cost tracking en tracing toe. Zet een harde `recursion_limit`. Zet een token budget alarm per invocation.

De meeste teams waar ik mee gewerkt heb, komen in twee tot drie weken door deze lijst voor een kleine agent. Grotere agents met meer tools kosten langer, vooral omdat het eval suite langer kost om eerlijk te schrijven.

## Slotgedachte

CrewAI heeft zijn werk gedaan als het je stakeholders ervan heeft overtuigd dat het idee echt was. LangGraph doet zijn werk als het je in staat stelt die belofte na te komen zonder om 3 uur 's nachts wakker te liggen. Ze zijn geen concurrenten. Ze zijn fases van hetzelfde project.

Heb je een CrewAI-prototype dat naar productie moet en weet je niet zeker waar de productie-gaten zitten, dan is een kort gesprek meestal genoeg om de volgende twee tot drie weken werk in kaart te brengen. Je kunt zien wat voor [AI agent werk](/services) ik doe, [recente productieprojecten](/work) bekijken, of gewoon [een gesprek van 15 minuten boeken](/contact) en dan kijken we samen naar je graph.

## Verder lezen

- [RAG of fine-tuning: een 20-minuten beslissing](/blog/rag-vs-fine-tuning-decision-flowchart). De architectuurkeuze die je agent als eerste moet maken.
- [Build vs buy AI features: de math voor je CTO](/blog/build-vs-buy-ai-features). Wanneer een managed platform versus zelf bouwen.
