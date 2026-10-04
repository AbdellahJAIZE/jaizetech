---
title: "AI Feature ROI: The Framework to Price It Before You Build"
description: "Learn how to calculate real AI feature ROI before writing code, using honest value levers, cost ranges, and a worked support-ticket example."
published: "2026-10-04"
tags: ["AI feature ROI", "business case", "AI kosten", "SaaS", "product strategie"]
ogImage: "/images/blog/ai-feature-roi-business-case/cover.jpg"
primaryService: "ai-features"
---
The budget is approved. Somebody above you said yes to "an AI feature" in a planning session, and now you have to write the one-pager that justifies it — before a single line of code exists, before you've picked a vendor, before anyone can tell you what it costs to run. And the question you cannot answer yet is the only one finance cares about: what is the **AI feature ROI**, and how confident are you in that number?

I have sat on both sides of this document. I have been the engineer whose quote got pasted into a business case I never saw, and I have been the person a founder calls three months later to explain why the projected savings never appeared in any report.

The pattern is consistent: the cost side of these models is roughly right, and the value side is fiction. So here is the framework I actually use to size an AI feature before building it — four value levers, an honest cost stack, a worked model for a support-ticket feature at a 40-person SaaS company, and the discount you have to apply for production reality. Plus the single number that lets you kill a bad AI project in the business-case meeting instead of in month five.

## The meeting where you have to defend a budget you can't price yet

Your situation has a specific shape. You have a rough idea of what the feature does. You do not have a quote, a model choice, a data audit, or a latency target. You have a slide deadline.

The instinct is to go get quotes first and build the case around them. That is backwards, and it hands the framing to whoever quotes lowest. A vendor's number tells you the price of building something; it tells you nothing about whether the something is worth building. Worse, it anchors your CFO on a figure that is [usually missing three or four of the seven layers a real build contains](/en/blog/full-ai-feature-build-scope-cost), so the first change order reads as your mistake.

Build the value model first, with your own operational data, which you already have. Then the quote becomes a test: does this price fit inside a payback window I can defend? That reverses the power dynamic in every vendor conversation you are about to have.

## Why most AI feature ROI cases fail: they price the build and guess the value

Here is the structure of nearly every AI feature ROI model I get shown. Cost: a build quote, plus a line for "API costs" that is wrong by a factor of three. Value: "saves the support team 30% of their time." That 30% came from nowhere. Nobody measured it, nobody defined which 30%, and nobody asked whether 30% of a person's time converts into money or just into a slightly less busy person.

![AI Feature ROI: The Framework to Price It Before You Build](/images/blog/ai-feature-roi-business-case/1.jpg)

The deeper error is modeling value off demo accuracy. Someone ran forty examples through a prompt in a notebook, thirty-seven looked great, and 92% became an input to a spreadsheet. That 92% was measured on curated examples, with a human choosing the inputs, on the distribution of problems the builder already knew about. Production accuracy on the real distribution — messy language, mixed Dutch and English, attachments, three questions in one message, the 8% of cases that are genuinely ambiguous — lands materially lower. In my experience the honest gap between a curated demo score and a first-month production score is somewhere between 10 and 25 points, and it is worst exactly where the demo looked most impressive.

That gap does not reduce your ROI proportionally. It reduces it super-proportionally, because outputs below the usability threshold do not produce zero value — they produce negative value. A support agent who has to read, distrust, and rewrite a draft is slower than one who typed from scratch.

So the model needs three things the usual one doesn't: value expressed per successful output, an explicit production discount, and a cost side that includes the parts nobody quotes.

## The four value levers, and which ones survive production

Every AI feature business case reduces to some mix of four levers. They are not equally real.

**1. Time saved (labour).** The most popular and the weakest. It only becomes money if the hours convert — if you avoid a hire, reduce contractor spend, or the freed capacity absorbs growth you would otherwise have staffed for. "The team gets 4 hours back per week" is not a line on a P&L. Ask, before you model it: what specifically stops being bought? If the answer is nothing, discount this lever by 50–70% and say so out loud in the meeting. That honesty buys you credibility for the levers that do hold.

**2. Revenue lift.** Strongest when the mechanism is short. Faster first response raising trial-to-paid conversion. A feature that unlocks a higher pricing tier. Sales engineers answering RFP questions in an afternoon instead of a week. Model it only where you can name the conversion step and already have a baseline number for it. If you have to invent the baseline, this lever is zero.

**3. Cost avoided.** Usually the most defensible: the BPO seats you don't renew, the rework caused by manual data-entry errors, the SLA credits you stop paying, the headcount in the hiring plan you remove. It's defensible because it references a decision someone already made and a number someone already signed.

**4. Risk and optionality.** Compliance exposure reduced, competitive parity, learning capability in-house. Real, and I would never argue against it — but score it at **zero euros** in the model and mention it as a qualitative paragraph. The moment you put a number on strategic value, your entire spreadsheet becomes negotiable.

A rule I hold to: if levers 2 and 3 together cannot carry the payback, the project is probably an efficiency nicety, not a build. Sometimes the honest conclusion is that [the feature should have been a SQL query and a scheduled report](/en/blog/ai-feature-that-should-have-been-sql-query), and finding that out in the business case is the cheapest possible outcome.

## Building the cost side honestly, in ranges instead of a vendor's best case

Four cost layers. Use ranges, not points, and show the range in the document.

- **Build.** Whatever your quote says, plus contingency for the layers usually absent: evals, observability, prompt versioning, the admin surface someone has to use, data plumbing. A full build is a six-to-twelve-week arc for a senior engineer owning it end to end; if a quote implies far less, it is pricing the prototype. [Four real timelines for AI feature builds](/en/blog/how-long-to-build-an-ai-feature) is a better sanity check than a gut feel.
- **Inference and infra.** Model calls, retries, embeddings, re-ranking, vector store, logging. Retries and context growth are what blow this up, not the headline per-token price. I wrote out the actual arithmetic in [what a production LLM feature really costs in 2026](/en/blog/cost-of-production-llm-2026); use that shape rather than a vendor's pricing page.
- **Maintenance and model drift.** Budget engineering time every month, permanently. Prompts rot, providers deprecate models, your data distribution moves. In my experience a shipped AI feature needs roughly half a day to two days of engineering attention per month to stay at its launch quality.
- **Human-in-the-loop.** Review queues, escalation handling, labelling for evals. This is a real operating cost and it often cancels a chunk of lever 1.

## A worked ROI model: support-ticket drafting at a 40-person SaaS company

Concrete, so you can copy the shape. A B2B SaaS company, six support agents, 2,000 tickets a month. The feature drafts first replies from the knowledge base and past tickets.
Scope         2,000 tickets/mo × 60% draftable        = 1,200
Accepted      × 70% production acceptance             =   840
Adopted       × 75% of agents actually use it         =   630
Time saved    × 4 min saved per accepted draft        = 2,520 min/mo
              = 42 hours/mo × €45 loaded cost         = €1,890/mo gross

Run cost      inference + infra  ~€200/mo
              maintenance (1 eng day/mo) ~€900/mo     = €1,100/mo

Net monthly value                                     =   €790/mo
Build budget that pays back in 12 months              = ~€9,500

Note what just happened. Every input is deliberately un-heroic: 60% in scope rather than "all tickets", 70% acceptance rather than the demo's 92%, 75% adoption rather than 100%, 4 minutes rather than "half the handle time". And the result is that the labour lever alone supports a build budget most serious full builds exceed.

That is not an argument against the project. It is the argument for finding the second lever. In the real version of this case, the thing that carried it was cost avoided: the company had two support hires in next year's plan at roughly €55k each and could defer one, plus a first-response time drop from 6 hours to under 30 minutes that mattered to enterprise deals in procurement. Those two lines moved the payback from marginal to obvious — and crucially, both referenced numbers that already existed in someone else's spreadsheet.

## The production-reality discount you must apply

Three multipliers, applied explicitly and visibly:

**Accuracy discount.** Take whatever score exists today and cut it. If the number came from a notebook on hand-picked examples, model production at 15 points lower and say why. If it came from a held-out set on real historical data with a defined pass criterion, cut 5. If there is no measured number at all, you do not have a value model — you have a hope. The way out is a measured baseline on real data before you commit, which is exactly what [scoping a pilot that actually ships](/en/blog/ai-pilot-to-production-scoping) produces.

**Adoption discount.** Features people can route around get routed around. Assume 60–80% adoption in month three unless the AI step is the only path through the workflow. If it is mandatory in the flow, you can go higher — and you should check whether that's a good idea for other reasons.

**Maintenance drag.** Value in month 12 is lower than value in month 1 unless someone is paid to keep it there. Model either declining value or a permanent maintenance line. Never both at zero.

And one guardrail: add a line for the cost of wrong outputs. Not all AI errors are equally cheap. A wrong support draft costs a rewrite; a wrong invoice extraction costs a payment. If your feature touches money, legal text, or medical content, that line is the whole business case.

## What to put in front of your CFO, and the one number that kills bad projects early

One page. Value levers 2 and 3 with sources, lever 1 discounted and labelled as discounted, lever 4 as prose with no euros. Cost as a range across all four layers. Payback in months, and the assumption that payback is most sensitive to. Then the assumption list itself, in plain language, because the credibility of this document comes from naming what could make it wrong.

The number I lead with is **value per accepted output versus fully loaded cost per attempted output**. In the worked model above: €3.00 of value per accepted draft, against maybe €0.25–0.40 of inference and infra per attempt, plus amortized build and maintenance. My rule of thumb is that gross value per accepted output should be at least 10× the marginal cost per attempt. Under 10×, the feature is fragile — a small accuracy drop or a context-size increase flips it negative. Under 3×, don't build it; nothing about engineering excellence rescues that ratio.

This single number does something a payback period can't: it works before you have a quote, it tells you immediately whether volume can save a weak case (it can, if unit economics are healthy; it cannot, if they aren't), and it converts an argument about enthusiasm into an argument about arithmetic. If you are also weighing a vendor product against building, run the same ratio on both — the comparison I lay out in [build vs buy for AI features](/en/blog/build-vs-buy-ai-features) uses the same denominators.

## Where this becomes an engagement

If the model holds and you decide to build, a **Full Build** is a six-to-twelve-week engagement where I own the AI feature and the product around it end to end — data plumbing, model and retrieval layer, evals and monitoring, the UI your users touch, and a hardened deployment — with the value assumptions from your business case turned into measurable ship gates rather than hopes. The ROI model becomes the spec: we instrument the exact acceptance rate and time-saved numbers you defended, so month three reports reality instead of anecdote.

You can see the scope of that engagement on [the services page](/en/services). If you have a business case in draft and want the value and cost assumptions pressure-tested by someone who has shipped these before, [send it over](/en/contact) — wij kijken graag mee, and an hour on the assumptions is cheaper than a quarter on the wrong build.
