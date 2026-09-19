---
title: "POC Audit Cost vs. a Broken AI Launch: The Real Math"
description: "A POC audit cost looks like an expense until you price a broken launch: €90K-€200K in Dutch/EU market rates versus one fixed-price week."
published: "2026-09-19"
tags: ["POC audit", "AI production readiness", "RAG", "AI cost", "startup engineering"]
ogImage: "/images/blog/poc-audit-cost-vs-failed-launch/cover.jpg"
primaryService: "ai-audit"
---
Your demo works. Your board meeting is in three weeks. Somewhere in the deck is a slide that says "production launch Q4", and someone on your team has quietly asked whether you should get the thing audited first. Your instinct says no: it works, an audit is a week and a chunk of money, and the budget is for building, not for looking.

I have been on both sides of that decision enough times to tell you the POC audit cost is the wrong number to stare at. The number that matters is the one nobody writes down: what a launch that breaks in its first month actually costs, itemised, at Dutch and EU market rates. When you put the two side by side, the audit stops looking like a nice-to-have and starts looking like the cheapest line in the whole project.

This is that comparison. No client names, no invented benchmarks, just the rate cards and timelines I see on real engagements in the Netherlands, and the arithmetic a CFO or investor needs to approve the spend in one meeting.

## The question nobody asks until after the launch breaks

The pattern repeats. A founder builds a RAG assistant or an agent workflow over six weeks, demos it to the board, gets a green light, and ships it to the first 50 real users. Within two weeks there is a Slack channel called `#ai-incidents`. The answers were fine in the demo because the demo used 40 curated documents; production has 9,000 and half of them are scanned PDFs. The cost per conversation is 6x what the spreadsheet said because nobody bounded the context window. A customer screenshots a hallucinated refund policy and sends it to their account manager.

At that point the question finally gets asked, usually by the person who signs off the budget: what would it have cost to know this in advance?

The honest answer is almost always: less than what we spent in the last two weeks. I wrote about [what the audit actually tests](/en/blog/ai-demo-to-production-audit) and [what a real audit report contains](/en/blog/ai-poc-audit-report-checklist). This piece is about neither. It is about the money, because the money is what makes the decision, and most teams never run it.

## What a POC audit cost actually covers: one week, fixed price, fixed scope

A POC Audit is a one-week sprint against a working demo. The price is fixed and agreed before I start; there is no hourly meter running and no "phase two" surprise. Your internal cost is a few hours of one engineer's time for repository access, a data sample, and two calls. That is the whole exposure: one week, one known number, and the project continues in parallel if you want it to.

![POC Audit Cost vs. a Broken AI Launch: The Real Math](/images/blog/poc-audit-cost-vs-failed-launch/1.jpg)

What you get for that week is a written answer to three questions. What breaks at scale: retrieval quality on your real corpus, latency under concurrent users, cost per request with real prompts, failure modes on real inputs. What to fix first: ranked by how much damage it does on launch day, not by how interesting it is. And a 90-day plan to ship: the realistic sequence from where the demo is now to something you can put in front of paying users without a rollback plan taped to the wall.

Here is the part people underestimate. The audit's biggest payoff is not the bugs it finds. It is the decisions it kills. About one in three audits I run ends with "do not build this the way you planned", and that saves a build budget, not a week. The other two-thirds end with a shortened plan because the demo was closer than the team feared in some places and further than they thought in others. Either way, the audit's cost is bounded and the build's cost is not.

## What a broken launch actually costs: the bill nobody budgets for

Now the other column. I am going to itemise this at rate ranges that are realistic for the Dutch and EU market in my experience. Your numbers will differ; the shape will not.

**Emergency engineering.** When an AI feature breaks in front of real users, you do not hire on a normal timeline. A senior AI engineer through a normal freelance contract in the Netherlands runs roughly €110 to €160 an hour in my experience. Someone who can start on Monday because your launch is bleeding runs €175 to €250. An incident that takes two people three weeks to stabilise is 240 hours at a premium rate: somewhere between €40,000 and €60,000, for a fix that leaves you where you thought you already were.

**Your own team's time.** Fully loaded, a senior engineer in the Netherlands costs an employer roughly €500 to €650 a day. Two of them pulled off the roadmap for three weeks is another €15,000 to €20,000, plus whatever the roadmap items they dropped were worth. That second number is usually larger than the first and never appears in any incident review.

**The LLM bill.** An unbounded context window, a retry loop, or an agent that calls a tool five times where it should call once can turn a €400 monthly estimate into €4,000 before anyone looks at the dashboard. I have seen the invoice arrive before the alert did. The detailed breakdown is in [what it really costs to run a production LLM feature](/en/blog/cost-of-production-llm-2026); the short version is that a demo has no cost ceiling because nobody needed one.

**The rebuild.** This is the expensive one. If the audit would have told you that your chunking strategy, your vector store choice, or your agent framework will not survive your real data, then the launch tells you the same thing three months later, after the build. Re-architecting a retrieval pipeline that was built for 40 documents to handle 9,000 is typically four to eight weeks of senior work. At the rates above, that is €35,000 to €90,000 of labour to reach the point the audit would have put you at before you spent the first build euro.

**The lost deal cycle.** For B2B, this dwarfs everything above. If the AI feature was the thing that closed the enterprise pilot, and the pilot goes badly in week two, that deal moves a quarter at best. For a company with €20,000 to €50,000 monthly contracts on the line, a one-quarter slip is a six-figure hole, and it does not show up in the engineering budget at all.

**The first cohort.** Your first 50 users and your investors form an opinion once. "The AI feature was rough at launch" is a sentence that follows a product for a year. I cannot put a euro figure on it, and neither can you, which is exactly why it gets left out of the comparison and exactly why it should not be.

Add the columns you can quantify and a bad launch of a mid-sized AI feature lands somewhere between €90,000 and €200,000 in direct cost, before the deal slip and before reputation. Against a one-week fixed-price audit. That is the comparison.

## Three triggers that turn a working demo into an expensive incident

Not every demo breaks. The ones that do share a small set of triggers, and every one of them is something an audit surfaces in the first two days.

- **Real data volume.** The demo corpus was curated. Production has duplicates, scans, ten-year-old policies that contradict current ones, and a table of contents that embeds beautifully and answers nothing. Retrieval quality drops from "great" to "sometimes" the day the full corpus loads. I covered the mechanics in [why RAG works in dev and breaks in prod](/en/blog/rag-breaks-in-production).
- **Real concurrency.** One user at a time is a demo. Twenty users at once hits rate limits, fills a queue, and exposes that the "2-second response" was a p50 measured on a quiet afternoon. The p95 under load is what customers experience, and nobody measured it.
- **Real inputs.** Demo prompts were written by the person who built the feature. Real users paste in emails, ask in Dutch when the prompts were tested in English, and put a question in the middle of a 3,000-word document. Every one of those is a hallucination path or a cost spike that was never exercised.

There are more, and the full punchlist is in [what actually breaks when AI hits production](/en/blog/what-breaks-in-ai-production). But these three cause the majority of the expensive incidents I get called into, and all three are testable in a week against a working demo. That is the whole argument for the audit: the failure modes are known, they are cheap to check before launch, and they are expensive to discover after it.

## The math: when the audit pays for itself before you ship

Here is how I frame it when a founder asks me to justify the spend, because "it might break" is not a business case.

Take the probability that a laptop-grade AI demo has at least one launch-blocking issue. In my experience it is not 10 percent. It is well above half. Most demos I audit have two or three, and the team knew about zero of them because the demo never faced the conditions that trigger them.

Take the cost of the cheapest bad outcome from the list above: an emergency stabilisation with contractors and your own team, no rebuild, no lost deal. Call it €50,000. Multiply by a conservative 50 percent probability. The expected cost of skipping the audit is €25,000, and that is the floor.

Now compare that to a fixed one-week price. The audit does not need to prevent a rebuild or save a deal to pay for itself. It only needs to catch one of the three triggers above, once. In practice it also shortens the build, because the 90-day plan removes the "we will figure that out later" items that always turn into the last four weeks of a project. That is why I tell people the audit typically pays for itself before the feature ships: the savings show up in the build plan, not in the incident that did not happen.

There is one more term in the equation. The audit tells you whether to build at all. If it says "this needs a different architecture" or "this should be a SQL query with an LLM on top" (I have written that report more than once, see [the AI feature that should have been a SQL query](/en/blog/ai-feature-that-should-have-been-sql-query)), it saved the entire build budget. No incident cost calculation captures that, and it is the single largest payoff an audit can have.

## What the audit cannot prevent, and why that matters for the decision

I would rather you hear this from me than discover it later. The audit is a point-in-time assessment of a specific demo against specific conditions. It will not stop your model provider from deprecating an endpoint. It will not catch a regression introduced by a prompt change six weeks after the report. It does not make the feature production-grade; it tells you precisely what would, and in what order.

It also does not replace evaluation, monitoring, or prompt versioning in production. Those are a different engagement, and if you skip them the audit's findings decay. A 90-day plan is a plan, not a system.

That matters for the decision because it sets the honest scope. You are not buying certainty. You are buying a known list of what breaks, ranked by cost, one week before you commit to a build, at a fixed price. That is what insurance actually is: not the absence of risk, but a bounded cost for knowing the risk before it becomes a bill.

## The one-slide version for your CFO or investor

If you need to get this approved, do not send the audit checklist. Send one slide with three lines.

- **Known cost:** one week, fixed price, no dependency on the build schedule.
- **Avoided cost:** a stabilisation incident at emergency contractor rates, in my experience €40,000 to €60,000, and a rebuild at €35,000 to €90,000 if the architecture is wrong. Probability that a laptop-grade demo has at least one launch-blocking issue: above 50 percent in my experience.
- **Outcome:** a ranked fix list and a 90-day plan you can put in the deck instead of "production launch Q4" with nothing behind it.

The third line is the one that closes it. Boards do not fund audits; they fund credible plans. A demo plus a launch date is a hope. A demo plus an independent read of what breaks plus a dated plan to fix it is something an investor can underwrite. The audit is how the second slide gets written.

## Where this becomes an engagement

The POC Audit is a one-week sprint: I take your working demo, test it against your real data, real load, and real inputs, and deliver what breaks at scale, what to fix first, and a 90-day plan to ship, at a fixed price agreed before we start. The scope is on the [services page](/en/services). If you have a demo and a board date, [get in touch](/en/contact) and we will tell you within a call whether a week is enough to answer the question.
