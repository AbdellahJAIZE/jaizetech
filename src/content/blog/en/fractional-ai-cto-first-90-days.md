---
title: "What a Fractional AI CTO Actually Does in 90 Days"
description: "A fractional AI CTO doesn't build first, it audits. Here's the real 90-day sequence: triage, one shipped project, roadmap, and guardrails."
published: "2026-09-11"
tags: ["fractional AI CTO", "AI strategy", "AI governance", "fractional CTO", "AI implementation"]
ogImage: "/images/blog/fractional-ai-cto-first-90-days/cover.jpg"
primaryService: "fractional-cto"
---
Most founders who call me about a fractional AI CTO engagement expect the first month to be about building. It is not. The first month is about finding out what the company already has, what it is quietly wasting money on, and which of the six "AI initiatives" on the slide deck has any chance of surviving contact with real users.

I have done this enough times now that the shape of the first 90 days is predictable. Not the outcome, that depends on the company, but the sequence: audit, triage, one shipped thing, a roadmap short enough to follow, a team that can carry it without me, and guardrails in place before I step back. This is the honest walkthrough of what you are actually paying for.

If you were hoping for a silver-bullet AI overhaul, read this anyway. The overhaul is what fails. The sequencing is what works.

## Why companies actually call in a fractional AI CTO

Nobody calls because things are going well. The calls I get fall into three buckets.

The first is the **stalled pilot**. Someone built a RAG assistant or a document extraction flow eight months ago, it demoed beautifully, and it has been "almost ready" ever since. The founder cannot tell whether it is two weeks or two quarters from done, and the engineer who built it cannot tell them either.

The second is the **vendor pressure** situation. The board wants "an AI strategy", three agencies have pitched, one of them quoted a six-figure platform build, and the CTO (if there is one) is a strong backend engineer who has never run a model in production and knows it.

The third is the **hiring stall**. They tried to hire a senior AI engineer for four months, wrote about the options in a spreadsheet, and got nowhere. I wrote up that market in [how to hire an AI engineer in the Netherlands](/en/blog/hire-ai-engineer-netherlands); the short version is that the people you want are rare, expensive, and not interested in being the only AI person at a company with no AI direction yet.

In all three cases the actual need is the same: someone senior who has shipped this before, who will make the unpopular calls, and who does not need to be on payroll for three years to do it. That is the job. It is triage and sequencing, done by someone with scar tissue.

## Weeks 1-2: the audit nobody wants to hear

The first two weeks are unglamorous and I refuse to skip them. I read code, I read the cloud bill, I sit in on standups, and I talk to every engineer who has touched anything with a model call in it. I also talk to the two or three people in sales or operations who would actually use whatever gets built, because they usually have a clearer picture of the problem than the deck does.

![What a Fractional AI CTO Actually Does in 90 Days](/images/blog/fractional-ai-cto-first-90-days/1.jpg)

What comes out of the audit is rarely what the founder expected. A few patterns I have seen more than once:

- **The "AI feature" is a query.** A classification step running through an LLM on every request that could have been a SQL filter plus a lookup table. I have a whole post on [the AI feature that should have been a SQL query](/en/blog/ai-feature-that-should-have-been-sql-query); it is depressingly common.
- **The pilot has no evaluation.** Nobody can say whether last month's prompt change made the assistant better or worse, because there is no test set, only vibes and a Slack thread.
- **The token bill is a mystery.** Usually there is one endpoint responsible for most of the spend, and nobody has looked.
- **Data is being sent somewhere it should not go.** Customer records to a US API with no DPA and no one having asked the question. Not malice, just nobody owning it.
- **There is a shadow build.** A contractor or an agency quietly built a second version of something the internal team also built. Both are half done.

I write this up as a short document: what exists, what it costs, what is actually in use, what is risky. It is two to four pages. It is not a 40-slide assessment, because nobody reads those, and because the point is to make decisions, not to prove I did work.

The conversation that follows is the hardest one of the engagement. Someone in the room championed the project I am about to recommend killing. I have learned to be direct about it and to separate the person from the decision: the idea was reasonable eighteen months ago, the market moved, here is what I would do instead. The founders who get the most out of the engagement are the ones who can hear that in week two rather than month six.

## Weeks 3-6: picking the one thing that ships

After the audit there is always a list. Six ideas, sometimes ten. The founder wants to do four of them in parallel. I want to do one.

This is not caution for its own sake. It is that a team with no production AI experience yet needs a first win to learn the actual shape of the work: evaluation, cost control, failure handling, monitoring. Doing that on one project teaches it. Doing it on four at once teaches nothing and ships nothing.

How I pick the one:

1. **Is the problem already understood without AI?** If nobody can describe what "correct" looks like for a human doing the task, a model will not figure it out either.
2. **Is there a measurable outcome within eight weeks?** Hours saved per week, tickets deflected, documents processed per day. Something someone will notice.
3. **Is the data already there, and are we allowed to use it?** Half the candidate projects die on this question alone.
4. **Can the existing team maintain it?** If the answer requires a stack nobody on staff knows, it drops down the list, no matter how exciting.
5. **Build or buy?** For a lot of the list, a vendor product at a few hundred euros a month beats an internal build. I put the arithmetic in [build vs buy AI features](/en/blog/build-vs-buy-ai-features), and I run exactly that arithmetic in week three.

The winner is usually the least exciting option on the list. An internal document-lookup assistant for the support team. An extraction pipeline that replaces manual re-keying of supplier PDFs. A triage step in front of an inbox. These are not the things that get a LinkedIn post, but they ship, they get used, and they teach the team the discipline it will need for the ambitious thing later.

Then we scope it properly. I wrote about the scoping mechanics in [how to scope an AI pilot that actually ships](/en/blog/ai-pilot-to-production-scoping), and the core of it is: define the failure modes and the eval set before writing the first prompt. In a fractional engagement I typically pair with one engineer on this for the first two weeks, then step back to review. By week six the thing is in front of real users, even if it is only ten of them.

## The roadmap document, and why it's shorter than founders expect

Around week six I write the roadmap. Founders expect a twelve-month plan with quarters and swimlanes. What they get is a page and a half.

The reason is that a roadmap longer than that is fiction. The model landscape changes every quarter, and the first shipped project will change what the team believes is possible. Anything I write for month nine is a guess, and writing it in detail just makes the guess look authoritative.

What the document actually contains:

- **The thing we just shipped**, what it measured, and what the next iteration is.
- **The next one project**, chosen with the same five questions, with a target date and an owner from the internal team.
- **A short list of things we are explicitly not doing** and why. This is the most valuable section. It stops the same three ideas from resurfacing every board meeting.
- **The decisions that are still open**, with the date by which they need an answer. Model provider. EU hosting or not. Whether to hire.
- **The principles**: evaluation before prompt changes, cost per request tracked from day one, no customer data leaves the EU without a signed reason.

That is it. It fits in a Notion page. People actually read it, which is the entire point. I have seen beautiful 30-page AI strategies at companies where nobody below the founder could tell me what was in them.

## Team enablement: what changes for engineers already on staff

The biggest mistake a fractional AI CTO can make is to build a shadow team. Bringing in two contractors who report to me, shipping something they own, and leaving the internal team watching from the side. It looks productive for three months and then I leave and the knowledge leaves with me.

So the model I run is the reverse. The internal engineers build it. I review, I unblock, I make the architecture calls, and I take the political heat when a decision is unpopular. In practice that looks like:

- **One engineer becomes the AI lead**, explicitly, with time carved out. Usually a strong backend developer who is curious and slightly sceptical. Sceptical is good; the enthusiasts tend to over-build.
- **Weekly design review** of anything touching a model. Thirty minutes. Which prompt changed, what the eval set said, what the cost did.
- **The eval harness is the first thing we build together**, before the feature. Once the team has seen a prompt change break twelve test cases, they never go back to shipping on vibes.
- **Cost is visible to everyone.** A dashboard with tokens and euros per feature per day. Engineers optimise what they can see.
- **I write down the "why" behind every architecture choice** in the repo, not in my head. Why we chose RAG over fine-tuning, why the pipeline is a plain graph and not a framework, why the fallback goes to a smaller model.

By week ten the AI lead should be running the design review without me in the room. If they cannot, I have done the job wrong.

This is also where hiring decisions get made properly. After two months of watching the team work, I can tell the founder whether they need a full-time senior AI engineer, whether the lead they already have can grow into it with a few months of support, or whether the honest answer is "you do not need a full-time AI hire this year, you need a good backend engineer and a vendor". That answer is worth more than most of the code I write.

## The governance and guardrails you put in before you leave

Governance is a word that makes engineers wince, so I keep it concrete. Before I reduce my hours, these things exist and someone internal owns each one:

- **A data map.** Which data goes to which model provider, under which agreement, hosted where. One page. If a customer or the Autoriteit Persoonsgegevens asks, you can answer in ten minutes rather than ten days.
- **An EU AI Act classification** of each AI feature. For most Dutch SaaS companies the answer is "limited risk, transparency obligations apply" and the work is small. For anything touching hiring, credit, or safety, it is not small, and it is far cheaper to know in month two than in month fourteen. I keep a working [EU AI Act checklist for Dutch software teams](/en/blog/eu-ai-act-checklist-dutch-software-teams) for exactly this step.
- **A model-change procedure.** Provider deprecates a model, or releases a cheaper one. Who evaluates, against which test set, who approves. Written down, because this will happen every quarter.
- **Cost alerts** at the feature level, not just the account level. A runaway retry loop should page someone before it pages the finance team.
- **A kill switch** per feature. Feature flag, fallback to the non-AI path. If the assistant starts hallucinating refund policies on a Friday evening, someone can turn it off without a deploy.
- **An incident log** for model behaviour. Not just outages; wrong answers that reached a user. This becomes the seed of the next eval set.

None of this is exotic. It is the same operational hygiene you would want around a payment integration. The difference is that with AI features nobody has usually done it yet, so it has to be built deliberately.

## How to tell it's working, and when to convert to something else

The honest signals that a fractional engagement is working are not on a dashboard. They are:

- The founder stops forwarding me vendor pitches and starts answering them with the roadmap's "not doing" list.
- The AI lead disagrees with me in a design review and is right.
- The cloud bill went down, or stayed flat while usage went up.
- Someone in support or operations mentions the shipped feature unprompted, in a complaint or a compliment. Either means it is being used.
- The second project is scoped by the team, not by me.

Around day 90 there is a decision to make about what the engagement becomes. In my experience it goes one of three ways.

**It winds down to a few hours a month.** The team has its own AI lead, the guardrails are in, the second project is on its way. I stay on for architecture reviews and the occasional escalation. This is the good outcome and it is the most common one.

**It converts to a hire.** The company now knows what it needs and can write a real job description, and I help interview. The candidate walks into a team with an eval harness, a cost dashboard and a one-page roadmap, which is a very different offer from "be our first AI person".

**It gets bigger, for a while.** The first project worked so well that the next one is genuinely ambitious, an agent workflow across three systems, or a computer vision line, and it needs more senior hands for a quarter. That is fine as long as it is explicit and time-boxed, and as long as the internal team still owns the result.

What I try to avoid is the fourth option: an open-ended retainer where I am effectively the CTO, forever, at part-time hours. That is not fractional leadership, it is a dependency. The whole point of the first 90 days is to leave the company more capable than I found it, not more attached to me.

If you recognise your company in the three buckets at the top of this piece, the audit, the triage and the first shipped project are exactly what the [fractional CTO engagement](/en/services) is built around.

If you are staring at a stalled pilot, a stack of vendor quotes, or a hiring search that will not close, that is the gap we help teams close, and the [contact page](/en/contact) is where the 90 days start.
