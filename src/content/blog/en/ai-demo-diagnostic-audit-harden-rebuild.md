---
title: "AI POC Diagnostic: Audit, Harden, or Rebuild Your Prototype?"
description: "An AI POC diagnostic tells you whether your prototype needs an audit, a hardening sprint, or a full rebuild—before you waste a budget cycle guessing."
published: "2026-10-08"
tags: ["AI POC diagnostic", "AI pilot production readiness", "AI hardening vs rebuild", "RAG audit", "LLM cost spikes"]
ogImage: "/images/blog/ai-demo-diagnostic-audit-harden-rebuild/cover.jpg"
primaryService: "ai-audit"
---
Most of the time the honest answer is: you need a week of diagnosis, not a quote. The three options in front of you (audit, hardening sprint, full build) solve genuinely different problems, and the symptom you are feeling right now does not reliably tell you which one you have. An **AI POC diagnostic** is mostly the work of separating "this is unfinished" from "this is broken" from "this was never the right shape".

So here is the triage, written as the questions I actually ask on a first call, and the answers that move a demo into one bucket or another. If you can answer all of them yourself, you do not need me for the diagnosis. Plenty of teams can.

## Every AI POC diagnostic starts with three questions

**One: has a real user outside your company ever used this?** Not a colleague with a Loom recording. Someone whose work depends on the output.

**Two: do you know what "correct" means, written down, as cases?** A set of inputs with expected outputs, even thirty of them in a spreadsheet, that you can re-run after a change.

**Three: if you delete the model call, is there still a product?** Auth, tenancy, audit logs, a place where results live, someone's workflow it fits into.

Those three answers map cleanly:

- No real users, no eval set, no product shell: the demo proves the model, and you are looking at a build.
- Real users, no eval set, something keeps surprising you: hardening.
- Real users, an eval set, and you already know roughly what is wrong but not what to fix first: you probably need prioritisation more than either, which is the cheapest week you will spend.

The reason this matters: hardening a thing that was never architected costs more than building it properly, and building from scratch when the retrieval layer just needs reranking is a few weeks of waste. I have watched both happen.

## Symptom set one: it works, but nobody trusts it under real load

The demo is real. It answers questions about your contracts, or routes tickets, or extracts fields from invoices, and in the room it looks finished. Then someone asks what happens at 200 concurrent users and the room goes quiet.

![AI POC Diagnostic: Audit, Harden, or Rebuild Your Prototype?](/images/blog/ai-demo-diagnostic-audit-harden-rebuild/1.jpg)

What people in this bucket usually describe:

- "It's fast on my machine." They have never run it against the production corpus, only a 50-document sample.
- "We don't know what it costs." No token accounting per request, so no cost per user, so no unit economics for pricing.
- "It's accurate, we think." Accuracy was assessed by the person who built it, reading answers and nodding.
- "We need a security review before we can launch it" and nobody has written down what data goes to which provider.

This is **AI pilot production readiness**, and it is the cleanest audit case there is. Nothing is on fire, because nothing is live. The questions are all answerable in days by someone who reads the code and the traces: where does latency actually come from, what is the per-request token spend at the 95th percentile, does retrieval degrade when the corpus goes from 50 documents to 50,000 (it usually does, and the fix is often reranking plus a hard look at chunking rather than a different model), and what breaks when the provider returns a 429.

The trap here is treating it as a build. Teams in this bucket often decide the demo is "just a prototype, let's rebuild it properly" and throw away working retrieval logic that someone spent two months tuning. Some of that code is fine. You need to know which parts before you decide, and that is an afternoon of reading, not a rewrite.

## Symptom set two: it's live and something keeps going wrong in production

Different bucket entirely. Users are on it, you have support tickets, and the pattern is recurring rather than catastrophic. Three times this quarter the assistant cited a document that does not exist. Latency spiked for two days and nobody can say why. A parser that worked all spring started throwing on 4% of responses after a provider update.

Giveaways for this set:

- You find out about problems from users, not from alerts.
- Nobody can answer "did last week's prompt change make this better or worse" because there is no versioning and no before/after on a fixed test set.
- The same incident type has happened more than once.
- Someone has already tried "we'll just add a validation step" and the failure moved rather than disappeared.

This is hardening, three to six weeks of it, and the work is unglamorous: an eval set with ship gates, prompt versioning so a change is a diff, tracing on every call, structured output validation with retries that are actually bounded, and a failover path that is not a retry loop against the same endpoint. I have written in more detail about why [structured output failures never show up on a dashboard](/en/blog/llm-structured-output-failures-production) and why [silent model updates break features](/en/blog/silent-model-updates-ai-feature) that passed every test the week before.

The distinction from bucket one is not severity, it is information. In bucket one you do not know what is wrong. In bucket two you know what is wrong and you lack the machinery to fix it without breaking something else. Audits are for the first state. Spending a week producing a report when you already have the list is paying for paperwork.

## Symptom set three: the demo proves the model, not the product

The hardest conversation. Someone built a notebook, or a Streamlit app, or a Next.js page calling an API route with the key in an env var, and it does the AI part convincingly. There is no multi-tenancy, no permission model, no audit trail, no admin view, no onboarding, nothing that stores what happened yesterday.

Signals:

- The demo runs with one set of credentials and one user's data.
- "We'll add auth later" has been said out loud.
- The product decisions are open: who sees what, what happens on a low-confidence answer, who approves what, how a user corrects a wrong output.
- Nobody owns it after the person who built it moves on.

That is a full build, six to twelve weeks, and the AI portion is often the smaller half. [Most quotes for a full feature price three of the seven layers](/en/blog/full-ai-feature-build-scope-cost), which is why the number feels wrong when you compare it to what the demo cost.

The **AI feature hardening vs rebuild** question resolves here on one test: is there an architecture to harden? If data isolation was never designed in, you are not adding it in week two of a hardening sprint. [Where multi-tenant RAG leaks](/en/blog/multi-tenant-ai-feature-data-leaks) is a design property, not a patch.

## The symptom that fools people: cost blowups can mean any of the three

Cost is the one signal that tells you nothing about which bucket you are in, and it is the one that most often triggers the call.

A €400 week that should have been €40 can come from a prototype that re-embeds the whole corpus on every deploy. That is bucket one, and the fix is a day. The same overspend can come from a production agent looping on a tool call it cannot complete, retrying five times, with no cap on iterations. That is bucket two: an observability and control gap, where the amount burned is a function of how long you did not notice. Or the spend is correct and the architecture is wrong, because every user question triggers a full-document summarisation that should have been a cached extraction run once at ingest. Bucket three, and no amount of prompt tuning saves it.

Same symptom, three diagnoses, three different price tags on the fix. Before you decide anything from a cost number, get the per-request breakdown: tokens in, tokens out, calls per user action, cache hit rate. I went through the [five causes that explain most LLM cost spikes](/en/blog/llm-cost-spike-production) separately, and the diagnostic value is in which cause it turns out to be, not in the total.

## A worked case: the same support bot, three different diagnoses, eighteen months apart

A hypothetical that matches a pattern I see repeatedly. A B2B SaaS company builds a support assistant over their help centre. Month zero: it answers well in demos, has never seen the full 8,000-article corpus, and there is no eval set. That is an audit. One week tells them retrieval collapses past about 2,000 documents because chunking ignores article structure, that the cost per conversation is roughly four times what their pricing assumes, and which three fixes to do before launch. They launch two months later.

Month seven: live, 600 customers using it. Tickets come in about answers that cite retired articles. A prompt tweak to reduce verbosity quietly broke the citation format and nobody noticed for nine days. Now it is hardening: evals with ship gates, prompt versioning, tracing, alerts on faithfulness drops. Same system, same code, completely different work.

Month eighteen: the company sells to enterprise customers who need per-customer knowledge bases, SSO, audit logs and an admin panel for reviewing flagged answers. The retrieval pipeline survives. Everything around it is new, and the honest answer is a build, because single-tenant assumptions are baked into the data layer.

Three engagements, one product, none of them a mistake. The failure mode is picking the wrong one for the current month: auditing when you already know, hardening when there is nothing underneath, rebuilding what works.

## The one-page self-test before you call anyone

Open a doc and answer these. Write the actual answer, not "we should look into that".

1. How many real external users have used this in the last 30 days?
2. Where is the eval set, and when was it last run?
3. What is the cost per user action, at the median and at p95?
4. Name the last three failures and how you found out about each.
5. If the model got 20% worse overnight, what would alert you?
6. Who sees whose data, and what in the code enforces that?
7. What is the plan when your primary provider returns errors for an hour?
8. Which single fix would you do first, and why that one?

Seven or eight solid answers and you do not need a diagnosis, you need to execute. Four to six, with the gaps clustered in monitoring and evals, and you are in hardening. Fewer than four, or you cannot answer 6 at all, and you are closer to a build than the demo suggests. If you want the longer version, [the 15-check POC audit checklist](/en/blog/ai-poc-self-audit-checklist) goes deeper on each, and [the audit you run before asking for budget](/en/blog/ai-demo-to-production-audit) covers how to present the findings to people who control the money.

If the answers contradict each other, which happens more often than you would expect, that ambiguity is exactly what a Production Readiness Audit resolves: one week, a written verdict on which bucket you are in, and a 90-day plan with the fixes ordered. You can see how I scope that on the [services page](/en/services), and if you want to walk through your answers to those eight questions with someone who has made each of these three calls wrong at least once, [get in touch](/en/contact).
