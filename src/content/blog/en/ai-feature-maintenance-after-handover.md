---
title: "AI Feature Maintenance Plan: Who Owns It by Month 4?"
description: "Most SOWs skip the AI feature maintenance plan. Here are three ownership models after handover, with real ramp time, cost and risk of each."
published: "2026-10-16"
tags: ["AI-features", "productie-AI", "onderhoudsplan", "handover", "full build"]
ogImage: "/images/blog/ai-feature-maintenance-after-handover/cover.jpg"
primaryService: "ai-features"
---
---
title: "Your AI Feature Maintenance Plan: Who Owns It in Month 4?"
description: "The AI feature maintenance plan nobody writes: three ownership models after handover, with the real ramp time, cost and risk of each."
published: 2026-10-16
tags: ["AI features", "production AI", "full build", "handover"]
ogImage: /images/blog/ai-feature-maintenance-after-handover.png
primaryService: ai-features
slug: ai-feature-maintenance-after-handover
---

A support-ticket drafting feature went live six weeks ago. It handles about 400 tickets a day, drafts a reply from the knowledge base and the customer's history, and an agent edits and sends. Acceptance tests passed, the eval suite is green, the runbook is in the repo. The engineer who built it finished the handover walkthrough on a Thursday and moved to a different project. The SOW ran from kickoff to launch and contained no AI feature maintenance plan, so in month four, when draft quality drops, nobody is on call.

That Tuesday looks like this: answers go vague, agents start deleting the draft and writing from scratch, support files a ticket with IT, and IT opens a repo containing a Python service nobody on the team has ever written. The service is up. The dashboards are green. The thing is simply worse than it was, and "worse" has no owner.

There are exactly three honest answers to "who owns this after you leave", and they have very different ramp times, costs and failure modes. Picking one before you sign is a twenty-minute conversation. Picking one after something breaks takes a month.

## An AI feature maintenance plan is a staffing decision, not a document

The three options are an in-house owner, a retainer with the engineer who built it, and a clean walk-away where nobody is specifically assigned. All three are legitimate. Each one quietly assumes something about your organisation, and the assumption is where the decision actually lives.

An in-house owner assumes you have, or will have, someone who can read the code, run the eval suite, and interpret what it says. Not necessarily an AI specialist. Someone who can tell the difference between "retrieval is returning the wrong documents" and "the model got worse". A retainer assumes the feature needs occasional expert attention rather than continuous work, and that a few hours a month of the right person beats forty hours a month of the wrong one. Walking away clean assumes the feature is genuinely stable, genuinely low-stakes, or genuinely replaceable, and that you have accepted what happens if it degrades unnoticed.

What makes all three fail is the same thing: nobody checks the assumption. Teams pick in-house because it feels responsible, then don't hire. They pick a retainer and treat it as insurance against anything. Or they walk away without ever deciding to, which is the most common path of the three and the only one that happens by default.

## In-house: the ramp time nobody puts in the plan

An in-house owner is the right long-term answer for any AI feature that sits on a core workflow. If support-ticket drafting touches every customer conversation you have, somebody inside the building should understand it. The problem is the calendar.

![AI Feature Maintenance Plan: Who Owns It by Month 4?](/images/blog/ai-feature-maintenance-after-handover/1.jpg)

If you don't already have the person, an [in-house AI engineer hire](/en/blog/hire-ai-engineer-netherlands) in the Dutch market realistically takes two to four months from writing the role to a signed contract, and that is before notice periods, which are routinely one or two months here. Then there is ramp. In my experience a strong engineer who has not worked on LLM systems before needs four to eight weeks of part-time contact with a production AI feature before they can diagnose a quality regression without help. They can deploy it on day three. Reading an eval report and knowing which of five possible causes to chase is different work.

Stack that against the launch date and the arithmetic is uncomfortable. Launch in month zero, start hiring in month zero, candidate starts in month four, is self-sufficient in month five or six. The drafting feature degraded in month four. You were six weeks short, and nobody noticed the gap existed because the plan said "in-house ownership" and that sounded finished.

If you already have the person, the number that matters is capacity, not skill. An engineer carrying a full roadmap will not run the weekly eval review. It gets skipped in week two, skipped in week three, and by week eight it isn't a thing anyone does. So write down the hours per week and whose roadmap they come out of. Half a day a week is usually enough for a single feature in steady state, and it is the same argument for why [one senior engineer beats four](/en/blog/ai-feature-build-team-size) during the build: named capacity beats distributed good intentions.

What the in-house model buys you, and the other two don't, is compounding knowledge. The person who fixes the retrieval problem in month four knows the data in month nine when you want to extend the feature. That is worth real money and is the main argument for paying the ramp cost.

## A retainer: what it covers, and what it quietly doesn't

An AI feature retainer with the engineer who built the thing removes the ramp problem entirely. There is no ramp. They know why the chunking strategy is what it is, which prompt version is live, and what the eval numbers looked like on launch day, which matters enormously when you are trying to decide whether today's numbers are bad or just normal.

A retainer is good at the narrow band of work that genuinely requires the builder: a quality regression with no obvious cause, a provider deprecating the model you are on, a [silent model update](/en/blog/silent-model-updates-ai-feature) shifting behaviour under you, a cost curve bending the wrong way, an eval suite that needs new cases because users found a question type nobody anticipated. Those are the things that actually happen in month four, and they are diagnosis problems far more than coding problems.

Where I have watched the arrangement sour is everything adjacent to that band. Support wants the draft tone changed for enterprise accounts. Product wants the feature on a second ticket queue. Somebody wants a dashboard. None of that is maintenance, all of it arrives labelled as maintenance, and a retainer sized for diagnosis gets eaten by feature requests in the first month. Then the real regression hits and the hours are gone.

So the retainer has to be specific about three things and vague on none of them. First, what counts as in scope. I draw the line at keeping the committed behaviour working, which includes evals, prompts, model migrations, retrieval quality and cost, and excludes new behaviour. Second, response expectation: a quality regression is not a sev-1 outage and does not need a thirty-minute SLA, but "within two business days" is a different product from "when I have time". Third, what happens when scope is exceeded, because it will be. A standing rate for adjacent work, agreed in advance, keeps that negotiation from happening while support is manually writing 400 replies a day.

The honest limitation: a retainer is not a path to independence. Twelve months in, your team knows the feature no better than on handover day. For a feature at the edge of your product, fine. For one on the critical path, treat it as a bridge to the in-house hire rather than a replacement for it.

## Walking away clean: when nothing is the right answer

Some features should be left alone, and saying so out loud is more useful than pretending every deployment needs a care plan.

Walking away works when three conditions hold. The feature is behind a human, so every draft is reviewed by an agent before it reaches a customer and degraded quality costs editing time rather than trust. The failure is visible to the people who use it rather than buried in a log, which for the drafting feature means the agents will notice within a day because they feel it. And there is a usable fallback, which here is simply the agent writing the reply themselves, the thing they did for years before the feature existed.

Under those conditions, degradation is an annoyance with a cost you can estimate. Suppose drafts save five minutes per ticket across 400 tickets a day and quality drops far enough that half the drafts become useless. You are losing roughly sixteen hours of agent time a day until someone acts. That number tells you how long you can tolerate not having an owner, and for most teams it says a week, not a quarter.

What makes walking away dangerous is autonomy and invisibility. An agent that sends emails without review, a feature sitting in a compliance path, anything where the first signal is a customer complaint: there, no-ownership is a decision to find out the hard way. The useful question is not whether the feature is important. It is whether a failure announces itself.

## The clause that makes any of the three work

Whichever model you pick, the handover has to be built for it, and that gets decided when you write the SOW rather than in the last week of the build. A handover sized for a retainer can lean on the builder's memory. A handover sized for in-house ownership or a walk-away cannot lean on anything.

Concretely, an AI feature handover checklist that survives the builder leaving needs an eval suite runnable by one command with its launch-day baseline committed, so month four has something to compare against. Prompts under [version control with a change log](/en/blog/prompt-versioning-regression-testing), because an unexplained regression is usually an undocumented prompt edit. A cost and latency dashboard someone other than the builder knows how to open. A written list of the three or four failure modes seen during the build and what each looks like in the logs. And a named escalation path with an actual name in it. I treat all of that as part of the [definition of done](/en/blog/ai-feature-definition-of-done) rather than a post-launch nice-to-have, because once the last [milestone is paid](/en/blog/ai-feature-build-milestones-payment), nobody writes documentation.

The one clause I would not sign a full build without is a fixed-price, fixed-duration support window after launch, four to six weeks, covering diagnosis of anything that breaks in the committed behaviour. Not a retainer. Not a warranty argument. A defined period where the person who built it is still reachable while real users hit it for the first time. Most of what month four looks like shows up in weeks two through five, and having the builder present for that is how you find out whether you need the retainer at all.

## Decide before you sign

Run it in order. Does this feature sit on a core workflow, or beside it? Core means in-house ownership eventually, so the hire starts during the build, not after. Beside it means a retainer or nothing. Does a failure announce itself, and is there a fallback? If both yes, walking away is defensible, and you should write down what degradation costs per week. If either no, you need a named owner. Can your team run and read the eval suite today? If no, the retainer is a bridge whose purpose is buying ramp time. Then ask what the handover has to contain for the model you picked, and write that into the SOW while you still have leverage.

All three models work. Picking none is also a choice, just one you make by accident, and it usually surfaces on a Tuesday when draft quality drops and nobody knows whose problem it is.

A [Full Build](/en/services) is six to twelve weeks of a senior engineer owning the AI feature and the product around it end to end, and the handover (clean code, docs, eval suite, walkthrough) is written for whichever of the three ownership models you choose, which is a question I would rather settle in week one than in the last week. If the feature sits on a core workflow and the in-house hire is still months out, a Production Hardening engagement of three to six weeks is the sane bridge. Tell me which workflow it touches and what happens when it degrades, and we can size the ownership question properly: [contact](/en/contact).
