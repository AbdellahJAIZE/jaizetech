---
title: "The AI Feature Spec Template That Ends Quote Guesswork"
description: "An AI feature spec template with eight sections, a worked example, and a scoring method so vendor quotes finally price the same project."
published: "2026-10-04"
tags: ["AI feature spec template", "AI vendor RFP", "AI project scoping", "SaaS AI features", "AI procurement"]
ogImage: "/images/blog/ai-feature-spec-template-vendor-quotes/cover.jpg"
primaryService: "ai-features"
---
An approved budget is the most dangerous moment in an AI project. You have the money, you have five vendors on a list, and the thing you are about to send them is two paragraphs in an email that starts "we want an AI assistant that…". Six quotes come back between €18k and €210k and you have no way to tell whether the cheap one is efficient or the expensive one is honest. What you needed first was an **AI feature spec template** that pins the scope before anybody prices it.

I have been on both sides of this. I have written quotes against briefs so vague that the only rational move was to price the part I could see, and I have been hired later to fix the features that got built from those quotes. The pattern is boring and repeats: the variance in the quotes was never about vendor efficiency. It was about which layers each vendor silently decided were out of scope.

So this post is the document, not the advice. Eight sections, what goes in each, a worked example filled in for a mid-size SaaS support feature, and how to score the quotes that come back. You can write it in an afternoon and you never have to hire me to use it.

## The moment: five vendors, five quotes, none of them pricing the same project

Here is what the spread usually decomposes into once I read all the quotes side by side.

The €18k quote prices the model call and a UI. Prompt, API, a chat box, deploy to Vercel. It is not a lie; it is a demo with an invoice. The €60k quote adds retrieval, ingestion for two data sources and some tests. The €210k quote includes an eval suite, observability, a staging environment, a load test, a security review and twelve weeks of a senior engineer's calendar.

All three read the same email. Each one imagined a different project, because the brief did not say whether "works" meant *a stakeholder nods at a demo* or *300 support agents use it on a Tuesday and the answer is right 95% of the time*. Those are genuinely different builds — [the full build has seven layers and most quotes price three](/en/blog/full-ai-feature-build-scope-cost) — and no amount of procurement rigour downstream can rescue a comparison between them.

The failure mode I care about most is not overpaying. It is picking the €18k quote, shipping in six weeks, and discovering in month four that the missing €42k of evals, monitoring and hardening now costs €70k because it has to be retrofitted around a live feature with users on it. The cheapest quote is frequently the most expensive project. You cannot see that from the quote. You can see it from the spec.

## Why an AI feature spec template has to fix scope before it fixes price

A normal software RFP works because the scope is mostly visible in the feature list. "Users can export to CSV" is either done or not. AI features break that assumption: the interesting scope lives in the *quality and operations* layers, which are invisible in a feature list and infinitely compressible by anyone trying to win on price.

![The AI Feature Spec Template That Ends Quote Guesswork](/images/blog/ai-feature-spec-template-vendor-quotes/1.jpg)

So the spec has one job: move every compressible decision from the vendor's imagination into your document. Not the technical decisions — those are theirs to make and I will come back to that. The *scope* decisions. How good is good enough, measured how, on what data, at what latency, at what cost per unit, monitored by whom, handed over as what.

Two practical consequences. First, the spec is short. Mine run four to six pages; anything longer and vendors skim it and you are back to guessing. Second, the spec is written in outcomes and constraints, never in architecture. The moment you write "must use LangGraph with a Pinecone vector store" you have destroyed your own comparison, because you have taken responsibility for the [architecture decisions](/en/blog/ai-feature-architecture-decisions) that separate a good vendor from a bad one — and you will still get five different quotes, just with a shared excuse when it fails.

## The eight sections every spec needs, and what goes wrong when one is missing
1. The job          who, trigger, input, output, what it replaces
2. Data             sources, volume, access, refresh, PII
3. Quality bar      what "correct" means, eval set, ship gate
4. Runtime targets  p50/p95 latency, volume, cost ceiling per unit
5. Surface          where it lives, auth, fallback, human-in-the-loop
6. Constraints      region, hosting, model-provider policy, AI Act
7. Day 2            monitoring, prompt versioning, on-call, handover
8. Process          milestones, acceptance, IP, who you provide

**1. The job.** One paragraph, no AI words. Who uses it, what triggers it, what goes in, what comes out, what human activity it replaces or accelerates. *Missing:* vendors scope a platform instead of a feature. This section is also where the honest vendor tells you a retrieval step and a form field would do it — sometimes [the AI feature should have been a SQL query](/en/blog/ai-feature-that-should-have-been-sql-query).

**2. Data.** Every source with its real size, format, ownership, refresh rate and mess. "14,000 Zendesk tickets, CSV export, 2019–2026, Dutch and English mixed" is a spec. "our knowledge base" is a trap. *Missing:* every quote assumes clean data and every project spends three weeks it did not budget on ingestion.

**3. Quality bar.** The section buyers skip and the one that decides the price. What does a correct output look like, who judges it, and on which set of examples. Ask for an eval set of 80–150 real cases with expected answers, and say whether you are providing it or paying the vendor to build it. *Missing:* "done" becomes "the demo went well", and you have no [definition of done](/en/blog/ai-feature-definition-of-done) to hold the final invoice against.

**4. Runtime targets.** p50 and p95 latency, expected volume at launch and at month twelve, concurrency, and a cost ceiling per interaction. *Missing:* you get a feature that is beautiful at 20 requests a day and unaffordable at 2,000.

**5. Surface.** Where it renders, which auth system, what happens when the model fails or is unsure, and whether a human approves before anything leaves the building. *Missing:* the fallback UX gets invented in the last week by whoever is least qualified.

**6. Constraints.** Data region, cloud or on-prem, whether US-hosted model APIs are allowed, DPA requirements, and your read on EU AI Act classification. *Missing:* legal kills the project in week ten. Decide this before the RFP, not during it.

**7. Day 2.** Monitoring, tracing, prompt versioning, alert thresholds, who is on call for the first 30 days, and the physical artefacts handed to you. *Missing:* this is where the €18k quote made its savings.

**8. Process.** Milestones, acceptance criteria per milestone, IP ownership, named people (not "our team"), what you provide, and your own decision turnaround. *Missing:* the schedule slips and it is genuinely your fault.

## A worked example: filling out the template for a mid-size SaaS support feature

Composite of several builds, numbers realistic, no client named.

**Job.** A support agent opens a ticket in Zendesk and sees a suggested reply with citations. The agent edits and sends. Target: cut median handle time on tier-1 tickets. It does not send anything autonomously.

**Data.** 14,200 resolved tickets (CSV, 2019–2026, ~70% Dutch); 340 help-centre articles (Markdown, via API, changes weekly); a product changelog (Notion). Tickets contain customer names and email addresses — must be redacted before indexing. Vendor gets a sanitised copy in week one; I own the export.

**Quality bar.** We provide 120 held-out tickets with the reply an agent actually sent. Gate: on 70%+ of cases a senior agent rates the suggestion "send with minor edits or better", zero cases citing a source that does not contain the claim, and no suggestion inventing a policy. Faithfulness is measured, not vibed — [retrieval and faithfulness metrics with ship gates](/en/blog/rag-evaluation-metrics-production).

**Runtime.** p50 under 3s, p95 under 8s. 600 suggestions/day at launch, 2,500 by month twelve, peak 15 concurrent. Ceiling: €0.06 per suggestion at launch volume.

**Surface.** Zendesk sidebar app, SSO via our Entra ID. If retrieval returns nothing above threshold, show "no confident suggestion" — never a guess. Agent always in the loop.

**Constraints.** EU region only. Frontier API models allowed with a signed DPA and zero-retention; open-weight self-hosted is acceptable if it hits the quality gate. Our read: limited-risk under the AI Act, transparency obligation, agent-facing not customer-facing.

**Day 2.** Tracing on every call with cost and latency per request. Prompts versioned in git with the eval suite in CI. Alerts on p95, spend/day, and refusal rate. 30 days of support after go-live, then our two backend engineers own it. Handover: repo, runbook, eval suite, dashboards in our accounts.

**Process.** Four milestones: ingestion + retrieval baseline, eval harness green, staging with five pilot agents, production rollout. Acceptance per milestone against the gate above. IP ours, MIT-compatible dependencies only. Named senior engineer, not a rotating pool. We answer questions within one working day.

That is under two pages and it is unbudgeable. Every vendor now prices the same project.

## What to leave open on purpose (and flag as a vendor decision, not a gap)

Do not specify: the model, the vector store or whether you need one, the framework, chunking strategy, whether retrieval or fine-tuning, or the deployment platform. Add a line saying so: *"Architecture is the vendor's call. Justify it against the quality bar and cost ceiling."*

This is the most useful part of the whole document, because how a vendor fills those blanks *is* the evaluation. A good one asks about your Dutch/English mix before proposing an embedding model. A weak one proposes their standard stack regardless. That is exactly the signal you are hunting for when you [vet an AI vendor before you sign](/en/blog/vet-ai-vendor-before-you-sign).

Also leave open, explicitly: anything you genuinely do not know. "We do not know our real ticket-volume growth" is a legitimate spec line. It invites a staged proposal instead of a fantasy.

## How to use the filled template to make quotes score against each other line by line

Require the quote to be broken out per spec section, in hours or days, with a euro figure. That single sentence in your RFP does most of the work. It is nearly impossible to hide a missing eval suite when section 3 has to carry a number.

Then read down the columns, not across:

- **Any section priced at zero or omitted.** Ask why in writing. Sometimes the answer is good ("your 120-case eval set makes the harness a 2-day job"). Sometimes it reveals they were never going to build it.
- **Section 7 under 10% of total.** In my experience, monitoring, prompt versioning and handover land between 15% and 25% of a full build. Much less means it is a stub.
- **Section 2 much cheaper than your own engineers' estimate.** They have not looked at the data.
- **Timelines that ignore your decision latency.** [Real build timelines](/en/blog/how-long-to-build-an-ai-feature) include your review cycles.
- **Assumptions restated.** A strong quote lists what it assumed and what would change the number. Treat that as a quality signal, not as weaselling.

Expect the spread to collapse. When I have watched buyers do this, the 10x range compresses to roughly 1.5x — and the remaining difference is a real conversation about seniority and risk rather than a guessing game. If you are still deciding between an agency, a freelancer and a single senior build partner, the same filled spec makes [that comparison](/en/blog/ai-feature-mvp-netherlands-build-options) tractable too.

One last thing: send the spec to every vendor at the same time, and send the *same* document. The temptation to tailor it is strong and it destroys the only property that matters.

## Where this becomes an engagement

If you have the spec filled in and the decision is who builds it, a Full Build is six to twelve weeks with me owning the AI feature and the product around it end to end — the layers in sections 3 and 7 included, not bolted on afterwards. I am also happy to read a spec you have drafted and tell you which section will cause the argument in week eight.

See what a Full Build covers on the [services page](/en/services), or send me the draft spec via the [contact page](/en/contact) and we can go through it.
