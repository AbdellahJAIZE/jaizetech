---
title: "A Full AI Feature Build Has 7 Layers — Most Quotes Price 3"
description: "Comparing SOWs for a full AI feature build? Here are the seven layers, real costs, and the checklist that exposes underscoped or padded quotes."
published: "2026-09-17"
tags: ["AI development", "software engineering", "LLM", "SaaS", "scope of work"]
ogImage: "/images/blog/full-ai-feature-build-scope-cost/cover.jpg"
primaryService: "ai-features"
---
You have the budget. You have the feature. What you do not have is a way to compare the three quotes on your desk, because one is a 40-page proposal from an agency, one is a two-paragraph email from a freelancer, and one is a fixed-price offer that somehow costs half of the other two. They cannot all be describing the same project. They are not.

I have written enough of these scopes, and read enough written by others, to know that the price difference is almost never about rates. It is about what got left out. A full AI feature build has seven layers of work, and most quotes price three of them, wave at two, and do not mention the remaining two at all. The missing layers show up later as a change request, an outage, or a feature nobody trusts.

This post is the checklist I would hand a CTO before they sign: the seven layers, roughly what share of the budget each one takes, the one layer every quote underscopes, a worked scope for a mid-size SaaS company, what handover has to include, and the SOW line items that separate a real quote from a padded one. Whether you hire me, an agency, or your own team, hold the document you are about to sign against it.

## The moment you're comparing three SOWs and none of them scope the same project

Here is what the three quotes typically look like from the inside.

The agency quote scopes the product. Discovery workshops, design sprints, a "solution architecture" phase, and then build. It is expensive because it includes a lot of people, and it is vague about the AI part because the AI part is the thing they have done least often. The word "evaluation" appears once, in the context of a user survey.

The freelancer quote scopes the model. Prompt engineering, retrieval, an API. It is cheap because it assumes your team owns the frontend, the deploy, the monitoring, and the legal review. That may be true. Nobody has checked.

The fixed-price quote scopes a demo. It gets you to a working feature in staging with test data, which is roughly the same place you would be if your own engineer spent three weekends on it. Production is a "phase two".

None of these are dishonest. They are three different projects with the same name. The MVP-options post covers [who should build it, agency versus freelancer versus a single senior owner](/en/blog/ai-feature-mvp-netherlands-build-options), and the timeline post covers [how long each realistic path takes](/en/blog/how-long-to-build-an-ai-feature). This post is about the third axis: what the finished thing has to contain for you to be done.

## The seven layers a full AI feature build actually has, and what each one costs

A production AI feature is a normal software feature with three unusual components bolted on: a model, a data path into it, and a measurement loop around it. Everything else is the same engineering you already pay for. When I scope a full AI feature build, it has seven layers, and I estimate each one separately so the buyer can see where the days go.

![A Full AI Feature Build Has 7 Layers — Most Quotes Price 3](/images/blog/full-ai-feature-build-scope-cost/1.jpg)

The shares below are what I see on a six-to-twelve-week build by one senior engineer, roughly 30 to 60 working days. Multiply by whatever day rate is on the quote in front of you. If a layer is missing from a quote entirely, that is not a discount; that is work you will do later at a worse moment.

**1. Discovery and scoping — 5 to 10 percent.** Three to five days. Not workshops. The output is a written spec with the user, the trigger, the input, the output, the failure mode the product must never show, and the first version of the eval set: 50 to 150 real inputs with the answer a domain expert would accept. If the quote has no eval set in discovery, the vendor has no definition of "works". I wrote about this in [scoping a pilot that ships](/en/blog/ai-pilot-to-production-scoping).

**2. Data and retrieval — 15 to 20 percent.** Ingestion from wherever the data lives, cleaning, chunking, embeddings, a vector store (pgvector in your existing Postgres is the right default for most teams under a few million chunks), and, crucially, permissions: user A must never retrieve a document user B cannot see. Permissions-aware retrieval is the single most common thing missing from freelancer quotes.

**3. Model integration — 10 to 15 percent.** Prompts, structured output, tool calls if it is an agent, a provider abstraction so you can swap models, retries, timeouts, and a fallback path for when the provider is down. This is the layer everyone thinks is the project. It is the smallest layer that matters.

**4. Backend and product integration — 15 to 20 percent.** Auth, tenancy, queues for anything that takes longer than a few seconds, rate limits per user and per tenant, streaming, idempotency, and the plumbing into the existing product's data model. This is boring and it is where the days go on any real codebase.

**5. Frontend and UX — 10 to 15 percent.** Streaming responses, citations that link to the source, a feedback control that writes to a table you will actually read, and error states that say something useful when the model returns nothing. A chat box is one afternoon. A chat box people trust is two weeks.

**6. Evals, monitoring and cost controls — 15 to 20 percent.** The eval harness in CI, tracing on every call (Langfuse, or OpenTelemetry into whatever you already run), prompt versioning, a cost dashboard per tenant, and alerts on latency, error rate, and spend. More on this below, because it is the layer that decides whether the feature survives the first quarter.

**7. Infra, security, deploy and handover — 10 to 15 percent.** Infrastructure as code, CI/CD, secrets, a DPA with the model provider and an EU-region endpoint if you need one, a runbook, documentation, and structured pairing with the person who will own it after the engagement.

Add it up and model integration is somewhere between a tenth and a seventh of the work. If a quote's line items are 60 percent "AI development", the vendor either does not know where the time goes or is not planning to do layers four through seven.

One note on run cost, which is separate from build cost: for a typical B2B feature with a few thousand users, the monthly model bill is usually smaller than the vendor's weekly rate. The build is the expensive part. I broke the monthly numbers down in [what it costs to run a production LLM feature](/en/blog/cost-of-production-llm-2026).

## The layer every quote underscopes: evals and monitoring, not model integration

I have never seen a quote that forgot the model. I have seen very few that budgeted evals honestly.

The reason is structural. A vendor is paid to hand you a feature that works on demo day. An eval harness is the thing that tells you, in week eight, that the feature got worse after someone changed a prompt. It is a cost to the vendor and a benefit to you, and it only pays off after they have left. So it gets a line that says "testing" and two days.

Here is what the layer actually has to contain, and roughly what it costs in days on a mid-size build:

- **A versioned eval set** of real inputs with expected outputs, stored in the repo, grown from production feedback. Two to three days to build the first one, half a day a week to maintain.
- **An eval runner in CI** that scores every prompt or retrieval change against the set and fails the pipeline on regression. Two days. This is the mechanism I described in [the continuous eval loop nobody runs](/en/blog/llm-evaluation-production-continuous-eval).
- **Tracing on every model call**: prompt version, retrieved chunks, tokens, latency, cost, user feedback, all joined on one request id. One to two days with Langfuse or an OTel exporter, longer if you build it yourself. Do not build it yourself.
- **Prompt versioning** with the prompt in source control, a hash on every trace, and a rollback path. One day. Without it you cannot answer "what changed on Tuesday", and Tuesday will come.
- **Cost controls**: a per-tenant token budget, a hard cap, and an alert at 70 percent. One day. The first month without it produces the invoice that gets the feature cancelled.
- **Alerts** on p95 latency, error rate, empty-answer rate, and negative-feedback rate. One day.

That is eight to ten days, which is why the layer sits at 15 to 20 percent. A quote that puts it at two days is not going to deliver it. Ask the vendor to show you the eval harness from their last project. If they cannot, price the layer yourself and add it to their number before comparing.

## A worked scope: a mid-size SaaS company builds an AI feature end-to-end

Let me make this concrete with a composite of builds I have done. A B2B SaaS company, around 60 people, a React frontend on a Django backend with Postgres, roughly 300 customer tenants. They want an assistant inside the product that answers questions over each customer's own documents and support history. Budget approved. Ten weeks.

**Weeks 1–2: scope and data.** Written spec. Eval set of 120 questions collected from support tickets, answers written by two of their customer success people. Ingestion pipeline from their document store and ticket tables into pgvector, with the tenant id and the document ACL on every chunk. First retrieval numbers: recall at 5 on the eval set, which starts at about 60 percent and gets to the high 80s with better chunking and a hybrid keyword-plus-vector query.

**Weeks 3–5: backend and model.** A `/assistant` endpoint on the existing API, behind the existing auth, streaming over SSE. A job queue for ingestion so a customer uploading 5,000 PDFs does not block the request path. Provider abstraction with a frontier model behind an EU-region endpoint as primary and a cheaper model for query classification. Structured output for citations. Retries, a 20-second timeout, and a graceful "I could not find this in your documents" path that fires on low retrieval confidence rather than letting the model improvise.

**Weeks 6–7: frontend and evals.** The panel in the product: streaming text, citations that open the source document, thumbs up and down that write to a feedback table with the trace id. Eval runner in GitHub Actions scoring answer faithfulness and citation correctness on the 120 questions; the pipeline fails if faithfulness drops more than two points. Langfuse tracing on every call. Prompts in the repo with a version hash on every trace.

**Week 8: hardening.** Per-tenant token budgets and a hard cap. Alerts. Load test at three times expected concurrency. A DPA review with the model provider, a data-retention setting confirmed at zero, and a one-page note for their legal team. Rate limits per user.

**Weeks 9–10: pilot and handover.** Ten customer tenants get the feature. Feedback is read daily and 30 new questions go into the eval set. Runbook written. Two afternoons of pairing with the internal engineer who owns it next. A final readout with the numbers: eval scores, p95 latency, cost per tenant per month, and the three things that should be built next.

Every one of those weeks is a layer from the list above. If a quote for this project cannot be mapped onto that shape, ask what week the missing layer happens in.

## What 'handover' has to include for the code to survive after you leave

Handover is the layer buyers forget to demand because it happens last and because it is invisible when it goes right. It is also the layer that decides whether you have bought a feature or a dependency on the vendor.

The test is simple: three months after the engagement ends, someone on your team needs to change the prompt because customers are complaining about tone. Can they do it safely in an afternoon? If yes, the handover worked. Here is what makes the answer yes:

- **The repo is yours**, in your organisation, from day one. No vendor-owned repo transferred at the end, no proprietary framework licence.
- **A README that gets a new engineer to a running local environment in under an hour.** Test it by having someone who was not on the project do it.
- **Architecture decision records.** Five to ten short documents on why pgvector and not a managed vector store, why this model, why this chunking. Future engineers will otherwise re-litigate every choice.
- **The eval harness runs from one command** and in CI. This is the safety net for that afternoon prompt change. I described the workflow in [prompt versioning that stops silent regressions](/en/blog/prompt-versioning-regression-testing).
- **A runbook**: what the alerts mean, what to do when the provider is down, how to roll back a prompt, how to rotate keys, how to add a tenant.
- **Dashboards your team already looks at**, not a separate tool nobody logs into.
- **Named ownership.** One person on your side, named in the SOW, who pairs with the builder in the final two weeks. Without that name, the knowledge leaves with the invoice.
- **A "break it" session.** An hour where the builder walks through the three ways the feature most likely fails and shows the team where to look.

A quote that lists handover as "documentation and knowledge transfer, 1 day" will deliver a Confluence page. Budget four to six days for the layer and insist on the list above.

## The SOW checklist: line items that separate a real quote from a padded one

Print this and go through the quotes with a pen.

**Must be present, with days attached:**

- Written spec and an eval set of real inputs, delivered by end of week two
- Ingestion pipeline and retrieval with tenant and document-level permissions
- Model integration with provider abstraction, timeouts, retries, and a fallback path
- Backend endpoints inside your existing auth and tenancy, with queueing for slow work
- Frontend with streaming, citations, and feedback capture
- Eval runner in CI with a regression threshold
- Tracing on every model call with prompt version and cost
- Per-tenant cost caps and alerts on latency, errors, and spend
- Load test at a stated multiple of expected traffic
- DPA and data-region confirmation with the model provider
- Infrastructure as code and a CI/CD pipeline you own
- Runbook, ADRs, README, named internal owner, pairing time
- A pilot with real users inside the engagement, not after it
- A readout with numbers: eval scores, p95, cost per user, next three items

**Signs of padding:**

- An "AI strategy" or "innovation" phase longer than a week
- "Model training" or "fine-tuning" for a use case that is retrieval over documents
- A licence fee for the vendor's own framework or platform
- Change management, stakeholder alignment, or design thinking priced in engineering days
- A team of five where two would have shared context

**Signs of underscoping:**

- No eval set mentioned anywhere
- "Testing" as a single line under three days
- Monitoring listed as "optional" or "phase two"
- Handover under two days
- Production deploy described as "support for your DevOps team"
- No mention of permissions in retrieval
- No mention of the model provider's data terms

A real quote is not the cheapest or the most expensive one. It is the one where you can point at every line and say which layer it belongs to, and where all seven layers are there. Cross-reference against the [services page](/en/services) if you want to see how I lay the same layers out.

## Where this becomes an engagement

A Full Build is six to twelve weeks in which I build the AI feature and the product around it end-to-end, own all seven layers, run the pilot with your real users, and hand over a repo, an eval harness, and a runbook your team can change without me. The scope is on the [services page](/en/services). If you have three quotes and want a fourth opinion on what they are missing, send them over via the [contact page](/en/contact) — we read every SOW before we reply.
