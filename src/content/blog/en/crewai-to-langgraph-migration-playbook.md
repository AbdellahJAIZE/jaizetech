---
title: "CrewAI to LangGraph: a migration playbook"
description: "CrewAI is great for prototyping. LangGraph is what you ship. Five pieces to add before migrating, plus the failure modes that show up in production."
published: "2026-05-08"
tags: ["LangGraph", "CrewAI", "AI agents", "production"]
ogImage: "/og-image.png"
primaryService: "ai-agent"
---

Most "CrewAI vs LangGraph" articles read like a feature checklist. They miss the actual question engineers are asking. You already have a CrewAI prototype that works on your laptop and impresses the demo audience. Now your boss wants it in production by next quarter. What do you actually need to do to get there?

This post is the playbook. It covers the five pieces you need before you migrate, a worked side-by-side code example, the three failure modes that show up the moment you go live, and clear rules for when to keep the prototype and when to rewrite.

## Why CrewAI is great for prototyping and bad for production

CrewAI is a pleasure to spin up. The agent / role / task abstraction maps cleanly to how product folks describe what they want. You write something like "a researcher agent that finds company information" and "a writer agent that drafts an outreach email" and the framework wires up the conversation between them. In a week you have something that walks and talks.

The problem is everything that makes the prototype fast also makes production hard.

State management is implicit. CrewAI passes context between agents through string concatenation and shared dictionaries that are mostly opaque to you. When something goes wrong you cannot easily inspect what an agent saw at step four versus step five. The framework moves fast, and that has historically meant breaking changes between minor versions, which is fine when you are iterating but painful when you have a production deployment that needs to keep working.

Observability is shallow by default. You can see the final output. You can see token usage. You cannot easily see, at a glance, why a specific agent decided to call a specific tool with specific arguments at a specific step.

None of this is a knock on CrewAI. It is the right tool for a one-week proof of concept. It is the wrong tool for month six in production with a paying customer on the other end.

LangGraph makes the opposite trade. It asks you to be explicit about state, edges, and conditions. The first time you write a LangGraph app you will think it is verbose. The second time you debug a production incident at 11pm you will be glad it is verbose.

## The five pieces you need before you migrate

Before you touch a single line of migration code, make sure these five things exist. If any of them are missing you will rebuild your prototype, hit production, and discover the same problems in a more verbose framework.

**1. Persistent state and checkpointing.** Your CrewAI prototype probably stores conversation history in memory. When the process restarts, that history is gone. In production you need a checkpointer. LangGraph ships with `MemorySaver` for development, `SqliteSaver` for small deployments, and `PostgresSaver` for serious workloads. Pick one before you start.

**2. Observability with structured node-level traces.** You want to see every node entry, every node exit, every tool call, every state diff. LangSmith is the path of least resistance because it is built by the same team. OpenTelemetry with a custom exporter works if you already have a tracing stack. Either way, structured traces at the node level are non-negotiable.

**3. Retry policy and idempotency at the node level.** Network calls fail. Model APIs return 429s. Tools time out. Each node needs a clear policy for what happens on failure, and each node needs to be safe to retry. If your "send Slack notification" node sends two messages when retried, you have a bug waiting to bite a customer.

**4. An eval suite.** Golden conversations with expected outputs at the final-answer level, plus step-level assertions on intermediate state. Without this, every framework upgrade and every prompt tweak is a leap of faith. With it, you can actually measure whether your migration is a regression.

**5. Cost tracking at the per-invocation level.** You need to know, for any given user request, how many tokens it consumed and across which model. This catches runaway agents before your finance team does.

Notice that none of these are about LangGraph specifically. They are about being ready to run an agent in production. Building them on top of CrewAI is harder than building them on top of LangGraph, but the work is the same work.

## A worked migration: same agent, both frameworks

Let us pick a deliberately simple task. The agent takes a company URL, fetches the page, extracts structured information about the company, and posts a notification to Slack.

Here is roughly what the CrewAI version looks like.

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

That is roughly forty lines once you add imports and tool definitions. It is readable. A product manager could pattern-match it.

Here is the same thing in LangGraph.

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

Roughly a hundred lines once you add the tool implementations. More verbose. But look at what you got for the extra sixty lines.

You got an explicit state schema. If `company_info` ever has the wrong shape, your editor and your tests catch it before production does.

You got explicit edges. There is no question about what runs after what. The graph is a graph, not a vibe.

You got a conditional edge. If extraction fails, you go to END. You do not silently post a half-empty message to Slack.

You got a checkpointer. Swap `MemorySaver` for `SqliteSaver` or `PostgresSaver` and your agent can resume mid-flow after a process restart.

That is the migration in miniature. The skeleton stays the same. You name the nodes, you define the state, you draw the edges, you pick a checkpointer.

## The three failure modes that show up the moment you go live

I have seen these three keep showing up in production agent deployments. They do not care which framework you used to write the prototype. LangGraph makes them visible, and CrewAI tends to hide them until they cost you money.

**Infinite loops.** An agent decides it needs to call a tool. The tool returns something the agent does not like. The agent decides to call the tool again with slightly different arguments. Repeat forever. LangGraph has a `recursion_limit` setting on the compiled graph (default 25) that exists exactly for this reason. Do not raise it without thinking. If your real workflow needs more than 25 steps, your graph probably has a structural problem, not a depth problem.

**State drift.** One node mutates state in a way another node does not expect. Maybe `company_info` is sometimes a dict and sometimes a string. Maybe `error` exists but is `None` versus missing entirely. In CrewAI this kind of drift just causes weird agent behaviour two steps later. In LangGraph with a TypedDict or Pydantic state schema, you catch it the moment you write the node, because the type checker tells you.

**Tool call cascades.** An agent calls a tool. The tool returns garbage (rate-limited response, partial JSON, an HTML error page that vaguely looks like data). The agent retries with adjusted arguments. The tool returns more garbage. Tokens burn. Latency spikes. Your monthly bill triples. The fix is two parts. First, validate tool outputs aggressively before they enter agent context. Second, add a circuit breaker at the node level, so a node that fails three times in a row stops trying and surfaces the error to the user.

These three failure modes are the reason "it worked in dev" is not a useful statement about an agent. The interesting failures live at the joint between your agent's freedom and the real world's chaos.

## Code patterns worth copying

A few small snippets that pay for themselves quickly.

A clean state schema. Use `TypedDict` for simple cases, Pydantic when you want validation.

```python
from typing import TypedDict, Annotated
from operator import add

class AgentState(TypedDict):
    user_query: str
    messages: Annotated[list, add]
    retrieved_docs: list[dict]
    final_answer: str
```

A conditional edge that routes based on state.

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

Adding a checkpointer. Use `MemorySaver` in dev, real storage in prod.

```python
from langgraph.checkpoint.sqlite import SqliteSaver

checkpointer = SqliteSaver.from_conn_string("agent_state.db")
app = graph.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": user_session_id}}
result = app.invoke({"user_query": "..."}, config=config)
```

Wrapping a tool call with retry and structured logging.

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

None of these are clever. That is the point. Production agent code should be boring code with one interesting bit (the LLM call) sitting inside a lot of boring scaffolding.

## When to keep the prototype and when to rewrite

You do not always need to migrate. Here are the rules I use.

Keep CrewAI if all of the following are true.

- Fewer than 100 invocations per day.
- Internal users only, no external customers depend on it.
- A nightly restart or an occasional crash is acceptable.
- No compliance or audit requirement.
- Workflow has fewer than 5 steps and minimal branching.

Migrate to LangGraph (or a similar explicit graph framework) if any of the following are true.

- Customer-facing, even soft-launch.
- More than roughly 1000 invocations per day.
- You need an audit trail of what the agent did and why.
- Workflow has more than 5 nodes or non-trivial branching.
- Cost matters and you need per-step token tracking.
- You need to resume a workflow after a process restart.

The reason these rules work is that the cost of LangGraph is mostly upfront verbosity. The cost of CrewAI in production is mostly debugging time and uptime risk. At low volume, the upfront cost dominates and CrewAI wins. At high volume or external exposure, the operational cost dominates and LangGraph wins.

## A small migration checklist

If you decide to migrate, work through these in order. Do not skip ahead.

1. Write the eval suite first, against the existing CrewAI version. Pick five to ten golden inputs with expected outputs. This is your regression net.
2. Define the state schema as a TypedDict or Pydantic model. Map every piece of context the CrewAI agents pass to each other into one explicit field.
3. Draw the graph on paper before you write code. Nodes are functions, edges are decisions. If you cannot draw it, your workflow is not as clear as you think it is.
4. Implement the nodes one at a time, with retry and logging on every external call.
5. Add the checkpointer. Use `MemorySaver` to start, swap to SQLite or Postgres before you ship.
6. Run the eval suite against the new version. Diff the outputs against the CrewAI version. Investigate every difference, even the ones that look like improvements.
7. Add cost tracking and tracing. Set a hard `recursion_limit`. Set a per-invocation token budget alarm.

Most teams I have worked with can get through this list in two to three weeks for a small agent. Larger agents with more tools take longer, mostly because the eval suite takes longer to write honestly.

## Closing thought

CrewAI did its job if it convinced your stakeholders the idea was real. LangGraph does its job if it lets you keep that promise without waking up at 3am. They are not competitors. They are stages of the same project.

If you have a CrewAI prototype that needs to ship and you are not sure where the production gaps are, a short call is usually enough to map out the next two to three weeks of work. You can see the kind of [AI agent work](/services) I focus on, browse some [recent production projects](/work), or just [book a 15-minute call](/contact) and we can look at your graph together.

## Related reading

- [RAG vs fine-tuning: a 20-minute decision](/blog/rag-vs-fine-tuning-decision-flowchart) — the architectural choice your agent needs to make first
- [Build vs buy AI features: math for your CTO](/blog/build-vs-buy-ai-features) — when to use a managed agent platform vs ship your own
