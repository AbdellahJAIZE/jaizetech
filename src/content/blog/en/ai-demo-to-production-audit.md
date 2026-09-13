---
title: "AI Demo to Production: The Audit Before You Get Budget"
description: "Going from AI demo to production breaks on concurrency, cost and missing evals. Here's the one-week audit to run before you approve the budget."
published: "2026-09-13"
tags: ["AI in productie", "LLM", "AI pilot", "GenAI", "MLOps"]
ogImage: "/images/blog/ai-demo-to-production-audit/cover.jpg"
primaryService: "ai-audit"
---
The demo went well. Someone on your team wired a model to your data over a couple of sprints, it answered the hard question in the leadership meeting, and now there is a line in next quarter's budget that says "scale the AI assistant". Before that line gets approved, someone has to answer the question nobody asked during the demo: what breaks on the road from AI demo to production?

I have taken enough of these across that line to know the answer is almost never "nothing" and almost never "everything". It is usually the same twelve things, in a predictable order, and most of them are invisible on a laptop with one user and a friendly test set. The gap is not a model problem. It is a concurrency problem, a cost problem, and a "nobody wrote down what correct looks like" problem.

This post is the audit I would run on that demo in one week, before the budget conversation. It is not a scoping guide for a pilot you have not built yet; that is [how to scope an AI pilot that ships](/en/blog/ai-pilot-to-production-scoping). And it is not the incident list from after launch; that is [what actually breaks when AI hits production](/en/blog/what-breaks-in-ai-production). This is the part in between: you have something that works, and you need an honest read before you commit money to it.

## Why a working demo is not evidence of anything

A demo proves one thing: the happy path exists. It does not prove the happy path is wide.

Here is what a typical demo is actually running on. One user at a time. A test set of twenty to fifty questions chosen by the person who built it, which means they are the questions the system was tuned to answer. Documents cleaned by hand the night before. A personal API key on a pay-as-you-go tier with nobody watching the bill. A prompt that lives in a Python file and has been edited forty times without anyone recording which edit fixed what.

None of that is negligence. It is exactly how you should build a demo; the point is to find out cheaply whether the idea has signal. The mistake is treating the demo's success as evidence about production. The demo tells you the model can do the task on your data when everything is arranged for it. Production asks whether it still does the task when nothing is.

I have watched teams carry the demo's 92 percent on the internal test set into a budget meeting as if it were a production number. It is a number about fifty questions the builder chose. Real users write different questions, in worse spelling, about documents nobody cleaned, at 9:05 on a Monday morning together with two hundred colleagues.

## AI demo to production: the concurrency test almost nobody runs

The first thing I do with a demo that "works" is send it twenty requests at once. Not a load test with tooling; a Python script with `asyncio.gather`, twenty realistic queries, and a timer. It takes half an hour to write and it has told me more about what will break than any architecture review.

![AI Demo to Production: The Audit Before You Get Budget](/images/blog/ai-demo-to-production-audit/1.jpg)

Three things happen, and I can usually predict which one before I run it.

**The provider rate limit hits.** Every model API has requests-per-minute and tokens-per-minute limits per key and per tier, and a demo built on a personal key is usually on the lowest one. A RAG request that stuffs six or eight chunks into the prompt is 5,000 to 10,000 input tokens. Twenty of those in the same second and you are through a low-tier token quota before the second batch. On Azure OpenAI the equivalent is the per-deployment TPM quota, which I regularly find sized for the demo and never revisited. The symptom is a 429 the demo code does not handle, so the user sees a spinner, then nothing.

**The latency curve bends.** In the demo, one request takes maybe three seconds end to end. That is the p50 of a single user. Under twenty concurrent requests, the vector store, the reranker and the model all queue, and the p95 goes to fifteen or twenty seconds. Nobody measured p95 during the demo because there was only ever one request in flight. Users do not experience your p50; they experience your p95, and without streaming they give up somewhere around eight seconds.

**Something that was never designed to be shared falls over.** The embedding model running on the builder's laptop. A SQLite file behind the vector index. A single synchronous worker in the FastAPI app. An in-memory conversation-history dictionary that works fine until two users get each other's history. I have seen every one of these in demos that were a week from getting budget.

Run the twenty-request test before the meeting. Twenty clean responses under six seconds at p95 and you are ahead of most. Anything else, and you now know the first item on the plan, and it is not a model upgrade.

## What happens to your unit economics at 10x real users

The demo's cost number is not evidence either. It cost forty euros last month and finance wrote "negligible" next to it. That number does not scale linearly, and three multipliers stack on top of the raw user count.

**Query rate per user goes up, not down.** The demo was used by three people who each tried it ten times. Real users who find the thing useful ask it questions all day. In my experience an assistant that people actually adopt settles at a query rate several times what the pilot group showed.

**Conversation length compounds.** Demos are single-turn. Real conversations run four, six, ten turns, and unless you summarise or truncate, every turn resends the whole history. A ten-turn conversation costs far more than ten single-turn queries. This is the multiplier that surprises people most.

**Retries and fallbacks are billed too.** Once you add the retry logic the concurrency test told you to add, a fraction of requests are paid for twice. Once you add a fallback model, a fraction costs whatever the fallback costs.

Do the arithmetic with those three before you tell anyone a number. I put the full model, with 2026 price bands and the mistakes I keep seeing, in [what it really costs to run a production LLM feature](/en/blog/cost-of-production-llm-2026). The short version: a demo that costs tens of euros a month routinely becomes low thousands a month at 10x users, and the difference is mostly context length and retries, not headcount. If that is fine for the value delivered, you have a business case. If not, you need caching, a smaller model for the easy queries, and a shorter context, and all three belong in the plan before launch, not after the first invoice.

## The four things missing that a demo never reveals

Every demo I audit is missing the same four things, because none of them are needed to make a demo work. All four are needed to keep a production feature working, and retrofitting them after launch is roughly twice the effort of building them in.

**Evals.** There is no written definition of correct. There are fifty questions and a builder's memory of which ones "looked good". The plan needs a labelled eval set of 100 to 300 real questions with expected answers or rubrics, and a script that runs it in under ten minutes. Without it, every prompt change is a guess and every model upgrade is a gamble. How to keep that set alive after launch is in [the continuous eval loop nobody runs](/en/blog/llm-evaluation-production-continuous-eval); for the audit, the question is simply whether one exists.

**Monitoring.** The demo logs to stdout. Production needs, at minimum, every request traced with prompt version, retrieved chunks, model, tokens in and out, latency and cost, plus a way to flag a bad answer from the UI. Not necessarily a dashboard product; a table you can query is enough to start. Without it you learn about hallucinations from a customer email.

**Prompt versioning.** The prompt is a string in a source file, edited many times, and nobody can say which version produced the answer the CEO liked. Prompts need to be versioned artefacts, tagged in every log line, with a rollback. This is a one-day fix that saves weeks of "it worked last Tuesday".

**Guardrails.** Input side: what happens when a user pastes a 40-page PDF into the chat box, asks the HR assistant for a colleague's salary, or tries the prompt-injection line from a Reddit thread. Output side: what happens when the model answers confidently about something not in the retrieved documents. The demo has no answer to any of these, because nobody in the demo was hostile or careless. Real users are both, usually by accident.

## Security and data-handling gaps that pass a demo but fail an audit

This is the section that ends budget conversations the wrong way if nobody looked first, so look first.

The demo's data flow was drawn on a whiteboard, if at all. When I trace it properly I find the same gaps: a personal API key in the repo or in a Slack thread; an evaluation notebook that exported real customer records to a CSV on someone's laptop; documents ingested from a shared drive with no check on who was allowed to see which ones, so the assistant now answers questions from the board pack to anyone who asks; a provider chosen for the demo without anyone confirming which region processes the data or whether a data processing agreement exists.

Document-level access control is the one that hurts most, because fixing it changes the architecture. If your vector store has no per-document permissions and your users have different access rights, retrieval has to filter by permission at query time, and that has to be built before scaling. Ask directly: can user A get an answer sourced from a document user A cannot open? If nobody can say no with confidence, that is a plan item.

The provider question is rarely a blocker for Dutch companies, but it has to be answered on paper. I walked through the actual GDPR position in [can you legally send company data to OpenAI](/en/blog/company-data-openai-gdpr-netherlands). For the audit: DPA signed, region confirmed, retention confirmed, and a written list of which data categories may enter a prompt.

## How to run a one-week POC audit yourself: the twelve-point checklist

Here is the checklist I actually use. Each point is a yes or a no, and each no is a plan item. A senior engineer and a product owner can run most of it in one week.

1. **Twenty concurrent requests complete cleanly** with p95 under an agreed number (I use six seconds for streamed chat, two for anything inline).
2. **Rate limits are known and sized** for peak expected traffic, with 429 handling and backoff in the code.
3. **Nothing single-user in the stack**: no local models, no SQLite behind the index, no in-memory session state.
4. **A cost model exists** with query-rate, conversation-length and retry multipliers, and someone owns it.
5. **A labelled eval set** of at least 100 real questions exists and runs from a script.
6. **The eval score is known on that set**, not on the builder's fifty.
7. **Every request is logged** with prompt version, chunks, tokens, latency, cost.
8. **Prompts are versioned** and the version appears in the logs.
9. **Input guardrails exist**: length limits, injection checks, topic limits fit for the use case.
10. **Output guardrails exist**: a grounding check or citation requirement, and a refusal path when retrieval returns nothing useful.
11. **Document-level access control** is enforced at retrieval time, and the "user A, document B" question has a documented no.
12. **The provider and data flow are on paper**: DPA, region, retention, allowed data categories, no secrets in the repo.

A demo that passes eight of twelve is in good shape and needs a few weeks of hardening. A demo that passes four is normal and needs a real plan. A demo that passes one, which happens, is a demo, and the honest advice is to plan it as a build rather than a scale-up. For what that costs in weeks, [four real AI feature timelines](/en/blog/how-long-to-build-an-ai-feature) has the ranges.

## What a real 90-day plan contains, and who should write it

The output of the audit is not a report. A report gets read once. The output is a 90-day plan an engineer can start on Monday, and it has a specific shape.

The first 30 days are the "no" items that change the architecture: concurrency, access control, the eval set. They go first because everything else depends on them and because they get more expensive the longer they wait. The second 30 days are the operational layer: monitoring, prompt versioning, guardrails, the cost controls the model told you to add. The last 30 days are a limited rollout to a real user group with evals and monitoring running, against a go/no-go criterion written down before rollout starts, not after.

What a good plan deliberately leaves out: a model upgrade, a framework migration, a second use case, a UI redesign. Each is tempting and each is a way to spend 90 days without answering whether the first feature works at scale. I have seen more scale-ups sunk by scope creep in the plan than by any technical failure.

On who writes it: if you have a senior engineer who has taken an LLM feature through production before, has a free week, and is not the person who built the demo, do it yourself with the checklist above. That last condition matters more than people like. The builder knows where the bodies are and has a stake in the demo being approved; they will pass item six on the fifty questions they chose. If you do not have that person, or the only candidate is the builder, that is when an outside read earns its cost: not because an outsider is smarter, but because they have no reason to be kind to the demo and have watched the same twelve things fail somewhere else. Either way the plan must end up owned by someone on your side. A plan nobody inside owns is a report with a different heading.

## Where this becomes an engagement

The POC Audit is exactly this: a one-week sprint on your working demo that runs the twelve points above against your actual code and data, tells you what breaks at scale and what to fix first, and hands you the 90-day plan to ship. The scope is on the [services page](/en/services); if you have a demo that just got a budget line, [get in touch](/en/contact) and we start with the concurrency test.
