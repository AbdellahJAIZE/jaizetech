---
title: "AI Feature Architecture: The 4 Decisions to Make First"
description: "Skip full-build rework: nail your AI feature architecture across model, data, infra, and observability before the SOW is signed."
published: "2026-09-23"
tags: ["AI feature architecture", "AI engineering", "RAG", "LLM infrastructure", "software architecture"]
ogImage: "/images/blog/ai-feature-architecture-decisions/cover.jpg"
primaryService: "ai-features"
---
The SOW is on the desk. Six to twelve weeks, a senior engineer, a fixed scope, and a start date two Mondays from now. Everyone in the room agrees on what the feature does. Nobody in the room can tell me, in one sentence, what happens to a single user request between the button click and the answer.

That gap is where full builds go wrong. Not in the modelling, not in the prompt, not in the UI — in the four **AI feature architecture** decisions that nobody wrote down because they felt like implementation details. They are not implementation details. They are the shape of the system, and changing any one of them in month three costs you a rebuild of everything downstream of it.

This post is the pre-build checklist I run before I sign anything. Four layers, the real tradeoff inside each, and a one-page architecture doc you can fill in yourself on a whiteboard this afternoon — before you talk to a single vendor. If you can answer all four, your SOW becomes comparable across bidders. If you cannot answer one of them, that is the layer to spend your first week on.

## The moment: the scope is agreed, the routing is not

Here is the conversation that keeps happening. The scope doc says "an assistant that answers questions about our contracts and can draft a renewal email". Beautiful. Then I ask four questions.

Which model answers which question — one model for everything, or a cheap one for classification and an expensive one for drafting? Where does the contract text live at query time — retrieved per request, baked into a fine-tune, or both? Does the model call run in our VPC or against a managed API? And when a user says "it gave me the wrong renewal date last Tuesday", what do you open to find out why?

Four questions, and the usual answer is four shrugs plus "we figured the dev team would decide that". They will decide it — implicitly, in week two, under deadline pressure, by whoever writes the first endpoint. That decision then hardens. By week six there are twelve files depending on it. By week ten, changing it means rewriting the retrieval layer, the cost model, and the deployment target at once.

I have written about [the seven layers a full build actually contains and how quotes only price three](/en/blog/full-ai-feature-build-scope-cost). This is the layer underneath that: the decisions that must exist before those seven layers can be scoped honestly at all.

## Why undecided AI feature architecture becomes a rearchitecture at month three

A full build has a characteristic failure curve. Weeks one to four look excellent — there is a demo, it answers questions, stakeholders are happy. Weeks five to eight the numbers arrive: p95 latency is 11 seconds, the monthly inference bill extrapolates to four figures at 200 users, and legal has questions about where the documents go. Weeks nine onward you discover that fixing any of those means touching the decision made in week two.

![AI Feature Architecture: The 4 Decisions to Make First](/images/blog/ai-feature-architecture-decisions/1.jpg)

The reason is that these four layers are not independent — they constrain each other in one direction. Your infra choice caps which models you can use. Your model choice caps your context budget, which caps your retrieval strategy. Your retrieval strategy determines what "correct" even means, which determines what you can measure. So the dependency runs infra → model → data → observability, and a late change at the top of that chain invalidates everything below it.

Concrete version. A team picks GPT-class managed APIs, builds a RAG pipeline with 8k-token contexts and a reranker, wires up a nice eval set against it. In month three, procurement decides the contract data cannot leave EU-controlled infrastructure. Now they are self-hosting a 70B open-weight model, the effective context budget and instruction-following behaviour changed, the chunking strategy that worked no longer does, and the eval set scores drop across the board without anyone knowing whether the model, the retrieval, or the prompt regressed. That is six to eight weeks of rework in a twelve-week build. It was avoidable with one question asked in week zero: *can this data leave our infrastructure — yes or no?*

The decisions below are ordered so the constraining ones come first.

## The model layer: single model, router, or multi-agent

Three architectures, and most teams reach for the wrong one because the wrong one is more fun to build.

**Single model.** One model, one prompt template, one call per request. This is correct far more often than anyone admits. It is trivially debuggable — one trace, one prompt version, one cost line. If your feature has one job and the variance in request types is small, stop here. Seriously. I have replaced multi-agent setups with a single well-prompted call and watched p95 latency drop from 14 seconds to under 3 while accuracy went up, because there were fewer places for context to get mangled.

**Router.** A cheap, fast classifier decides which downstream path a request takes: simple lookup vs. full retrieval vs. generation. You reach for this when request types genuinely differ in cost profile — 70% of traffic is "what's the renewal date" and 30% is "draft me a paragraph". The router pays for itself when the expensive path is ten times the price of the cheap one and the cheap path covers the majority of traffic. Build the classifier as a small model call or, better, as actual code — half the routing decisions I see implemented as an LLM call are a regex and a lookup wearing a costume, which is the pathology I described in [the AI feature that should have been a SQL query](/en/blog/ai-feature-that-should-have-been-sql-query).

**Multi-agent.** Multiple specialised agents with tools, planning, and handoffs. Justified when the task genuinely requires multi-step tool use where step three depends on the result of step two and the sequence is not knowable in advance. Justified far less often than the demos suggest. The cost is real: non-deterministic control flow, error compounding across steps, latency that stacks, and debugging that requires trace infrastructure from day one. If you go here, pick the framework deliberately — I put the current field in [agent frameworks in 2026: what actually survives production](/en/blog/agent-frameworks-2026-what-survives-production).

The decision rule I use: **start at single model and only move up a rung when you can name the specific request type that the current rung handles badly.** Not "we might need agents later" — name the request.

## The data layer: RAG, fine-tuning, or both, and where the pipeline boundary sits

This one has a decision procedure, and I wrote it out in full as [the 20-minute RAG vs fine-tuning decision](/en/blog/rag-vs-fine-tuning-decision-flowchart). The short form: RAG when the knowledge changes or needs citations, fine-tuning when the *behaviour* or output format needs to change, both when you need a specific voice over shifting facts. Nine times in ten for a business feature, it is RAG.

What that post does not settle, and what the SOW needs, is the **pipeline boundary**: who owns getting data into the system, and where does that ownership stop?

Write down these five answers before the build starts:

- **Source of truth.** Which system holds the canonical documents — SharePoint, a Postgres table, an S3 bucket, someone's Drive folder? Name it.
- **Ingestion trigger.** Push (webhook on document change), pull (nightly job), or manual upload? This decides whether "the answer is stale" is a bug or expected behaviour.
- **Transformation ownership.** Who converts a 40-page scanned PDF into chunks? If your corpus has scans, forms, or tables, this is a real subsystem, not a one-liner — see [OCR plus LLM extraction patterns](/en/blog/document-intelligence-ocr-llm-extraction).
- **Permissions at retrieval time.** Does the retriever filter by the asking user's entitlements, or does it retrieve everything and hope the prompt behaves? The second one is the single most common serious finding in the POCs I audit.
- **Re-index cost and trigger.** What does a full re-embed cost, and what causes one? Teams that skip this re-embed the whole corpus on every deploy and wonder why the bill is what it is.

Those five lines are worth more in a vendor conversation than the whole model-layer section, because they are where scope quietly doubles. "We'll connect to your documents" is not scope. "Nightly pull from SharePoint, entitlement filter on retrieval, OCR path for the 8% of scanned contracts" is scope.

## The infra layer: managed API vs self-hosted, and the one question that decides it

Everyone frames this as a cost comparison. It almost never is. At realistic volumes for a first AI feature, managed APIs are cheaper than a GPU you own that idles 80% of the day — I ran the actual 2026 numbers in [on-prem LLM hosting in the Netherlands](/en/blog/on-prem-llm-hosting-netherlands) and the crossover point is higher than most teams assume.

The question that actually decides it is legal and contractual, not financial: **can this data leave your infrastructure, under which agreement, and who signs off?** For Dutch and EU teams that usually means a DPA, a data-residency clause, and a defensible answer for the DPO. [Can you legally send company data to OpenAI](/en/blog/company-data-openai-gdpr-netherlands) walks the practical version of that read. If the answer is a firm no — regulated data, works council objection, a customer contract that forbids sub-processors — then you self-host, the model shortlist shrinks to open weights, and every downstream decision inherits that constraint. Which is exactly why this question belongs in week zero and not month three.

Secondary but worth deciding now: what happens when your provider returns a 429 or goes down for forty minutes. Fallback to a second provider, degrade to a cached or non-AI path, or show an error. Pick one. It changes whether your prompt layer needs to be provider-portable, which changes how you write it on day one.

## The observability layer: instrumented from day one, not bolted on

Observability is the layer that gets cut from the SOW because it produces no demo. It is also the only layer that makes every later decision cheap instead of expensive, which is why I keep coming back to [the continuous eval loop nobody runs](/en/blog/llm-evaluation-production-continuous-eval).

Four things must be in the build from the first sprint:

1. **Full request traces.** Not just input and output — the retrieved chunks with their scores, the prompt version, the model and parameters, token counts in and out, and per-stage latency. If you cannot see the retrieved context for a bad answer, you cannot tell a retrieval bug from a generation bug, and you will spend days guessing.
2. **A golden set.** 50–150 real examples with expected behaviour, collected during the build rather than reconstructed after launch. This is cheap in week two and miserable in week ten.
3. **Prompt versioning.** Every prompt change tied to a commit and an eval run, so "it got worse last Thursday" is answerable. The mechanics are in [prompt versioning in production](/en/blog/prompt-versioning-regression-testing).
4. **Cost and latency per request, attributed.** Per user, per request type, per model call. Without attribution, a cost spike is a mystery; with it, it is a five-minute lookup.

Budget roughly 10–15% of build effort for this. It is the cheapest insurance in the project, and it is the difference between a feature you can improve after launch and one you can only watch.

## The one-page architecture doc to write before sprint one

Open a document. These headings, one to three sentences each. It takes ninety minutes with the right three people in the room.

text
1. REQUEST PATH
   One paragraph: click → what happens → answer. Name every hop.

2. MODEL LAYER
   Architecture: single / router / multi-agent
   Chosen because: <the specific request type that forced this rung>
   Models + fallback provider:

3. DATA LAYER
   RAG / fine-tune / hybrid — and why
   Source of truth:
   Ingestion trigger:
   Transformation owner (incl. OCR path):
   Permission filter at retrieval:
   Re-index trigger + cost:

4. INFRA LAYER
   Managed API / self-hosted / hybrid
   Data-residency answer + who signed off:
   Provider-failure behaviour:

5. OBSERVABILITY
   Trace fields captured:
   Golden set owner + target size:
   Prompt versioning mechanism:
   Ship gate (the metric that blocks a release):

6. THE THREE THINGS WE ARE NOT BUILDING

That last heading matters as much as the rest. Writing down the non-goals is what keeps month two from growing an agent framework nobody asked for.

Hand this to three vendors and their quotes become comparable for the first time, because they are pricing the same system instead of three different guesses about it. Combine it with the technical questions in [how to vet an AI vendor before you sign](/en/blog/vet-ai-vendor-before-you-sign) and you will find out quickly who has shipped this before.

## Where this becomes an engagement

If you sat down with that template and three of the six sections came out as "I don't know how to decide this", that is not a failure of the template — it is the honest answer, and it is exactly the gap a [Full Build](/en/services) closes: six to twelve weeks in which a senior engineer makes these calls with you, owns the model, data, infra and observability layers end to end, and ships the feature and the product around it. The architecture doc gets written in week one, not discovered in month three.

If you want a second pair of eyes on a doc you have already filled in — or you want the four decisions made properly before an SOW gets signed — [tell me what you are building](/en/contact) and I will tell you which layer will bite you first.
