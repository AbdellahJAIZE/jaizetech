---
title: "Why AI Feature Build Milestones Beat Calendar-Based SOWs"
description: "Fixed-price SOWs hide risk. Learn how real AI feature build milestones force proof of progress before the budget runs out in week 10."
published: "2026-10-10"
tags: ["AI project management", "SOW milestones", "AI development", "software delivery", "vendor management"]
ogImage: "/images/blog/ai-feature-build-milestones-payment/cover.jpg"
primaryService: "ai-features"
---
The most common way a 6-to-12-week AI build goes wrong is not technical. It is that by week 4 nobody in the room can say, with evidence, whether week 4 was productive. The engineer says retrieval quality is "coming along". The CTO sees a Slack demo of three cherry-picked queries. Everyone agrees things look promising, and the first genuinely bad news arrives in week 10, when there is no budget left to respond to it.

Good **AI feature build milestones** exist to kill that ambiguity. Not to create paperwork, and not to give the vendor a payment trigger, but to force a specific question to be answerable at a specific date: can we run this part of the system, against real data, and see what it does?

I have written and signed both sides of these SOWs. The structure below is what I use now, and the reason I use it is that it has caught my own slippage early enough to fix it.

## Fixed price with a demo at the end, or calendar thirds

Two SOW shapes dominate, and they fail in opposite directions.

The first is fixed price, fixed scope, one delivery. You agree on a spec, agree on a number, and the next formal checkpoint is acceptance. This is comfortable to sign and terrible to run, because an AI build is the kind of work where the first two weeks change what the right architecture is. Retrieval turns out to need a different chunking strategy. The customer's "clean" data has three years of free-text fields. The single checkpoint at the end means every discovery gets absorbed silently into the vendor's margin, or quietly dropped from scope, and you find out which one in week 10.

The second is the 30/30/40 split, or 40/30/30, or thirds. These look like milestones but they are a calendar in disguise. Payment two is due "at the end of week 5", and week 5 will arrive whether or not anything works. I have seen an entire AI project SOW structure where the only acceptance criterion attached to a payment was the word "progress". That is not a milestone, it is a diary entry.

Percentage-complete reporting makes it worse. Software is 90% done for a long time, and AI features are worse than average here because the last 10% is usually eval quality and failure handling, which is most of the actual work. The scope creep AI project problem is not that scope changes. Scope always changes. It is that calendar-based payments give nobody a reason to surface the change while there is still time to trade something away.

## A milestone is a slice you can run, not a percentage

The definition I hold to: a milestone is a working, demo-able slice of the real system, deployed somewhere other than a laptop, measured against a written criterion that was agreed before the work started. If it does not meet all four of those conditions, it is a status update.

![Why AI Feature Build Milestones Beat Calendar-Based SOWs](/images/blog/ai-feature-build-milestones-payment/1.jpg)

Unpack each condition, because each one is load-bearing.

**Working** means it executes end to end for its defined input range. Not a notebook, not a mocked backend. If the milestone is "classify incoming tickets", then a real ticket goes in and a real structured result comes out.

**Demo-able** means the buyer operates it, not watches it. Hand over a URL or a CLI and let the CTO type their own input. The cherry-picked demo dies here, which is the entire point. Every unpleasant surprise I have had on a build was visible the first time someone outside the project chose the input.

**Deployed** means it runs in your environment, on your infrastructure, with your auth. Deployment is where half the hidden work lives, so pushing all of it to the end of the build is how you get a week-11 panic. Spread it across milestones and it stops being a cliff.

**Measured** means a number or a pass/fail condition that existed before the sprint. For an AI feature that usually means a frozen eval set: a fixed list of real inputs with expected outcomes, scored the same way every time. If you have not seen the eval set, you cannot accept the milestone, and the vendor who resists building one in week 1 is telling you something. I go into how to construct these criteria in [the AI feature definition of done](/en/blog/ai-feature-definition-of-done).

One more rule that saves arguments later: the acceptance criterion is written into the SOW as a sentence a non-engineer can verify. "Retrieval returns the correct source document in the top 3 results for at least 85% of the 120-question eval set, measured by the suite in `evals/retrieval`, run by the client." Both parties can check that. "Retrieval works well" cannot be checked by anyone.

## The four AI feature build milestones that fit a 6-to-12 week scope

Four is the number that works. Two is not enough signal. Six turns the build into a demo factory where the engineer spends a third of the time packaging work instead of doing it.

### M1: the thin vertical slice (end of week 2)

One path through the whole system, narrow and shallow. Real data in, real output out, deployed, with the eval harness and the baseline numbers it produces. No UI polish, no edge cases, no scale.

M1 is the most important milestone in the SOW and the one most vendors want to skip, because it is the one where the plan meets the data. If the vertical slice is not running by the end of week 2 on a 10-week build, you have learned something enormous for the price of two weeks.

### M2: the hard cases (around week 4 or 5)

Everything the thin slice deliberately ignored. Multi-language input, documents that are scans rather than text, tickets that contain two unrelated problems, the tenant boundary, the behaviour when the model returns something unparseable. This is where the eval set grows from the easy examples to the ones that represent your actual traffic.

M2 is the milestone that separates a 6-week scope from a 12-week one. The number and nastiness of the hard cases is the real driver of the timeline, which I have unpacked before in [how long it takes to build an AI feature](/en/blog/how-long-to-build-an-ai-feature).

### M3: the production surface (around week 7 to 9)

Auth, rate limits, per-request cost metering, logging and tracing of every model call, prompt versioning, the human override path, the fallback when the provider is down. Load behaviour under something resembling real concurrency.

### M4: handover and shadow run (final 1 to 2 weeks)

The eval suite running in CI, a runbook for the three or four ways this feature fails in the wild, a dashboard the on-call engineer can read at 2am, and ideally a period where the feature runs against live traffic in shadow mode while humans still make the decisions. Then the walkthrough with the team who will own it.

Payment follows the same four steps. I run roughly 15 to 20% at kickoff to mobilise, then the balance released on acceptance of each milestone, weighted toward the middle two because that is where the work sits. The structural point is that no payment is dated. Each one is earned by a thing that runs.

## What a slipped milestone actually tells you

A slip is information, and the useful question is never "are we behind" but "which kind of behind is this".

- **M1 slips.** This is the loudest signal in the build. It almost always means the data is not what the spec assumed, or the integration is harder than anyone priced. Both are scope problems, not speed problems, and both need a conversation about what comes out of scope now rather than more hours.
- **M2 slips.** Usually accurate: the hard cases are genuinely harder than estimated. This is the point to cut the long tail. Pick the 80% of traffic you will handle automatically and route the rest to a human, on purpose, in writing.
- **M3 slips.** Frequently a sign that M1 and M2 were accepted too generously, with deployment work deferred rather than done. If your milestone criteria did not include "runs in your environment", this is where you pay for that.
- **M4 slips.** Often a documentation and ownership gap rather than an engineering one. Annoying, rarely dangerous, and cheap to fix if you held back a final payment.

One slipped milestone with a clear cause is normal. Two consecutive slips with the same explanation ("almost there") is a different situation, and the right response is a scope renegotiation in week 5, not hope in week 10.

## The clause that protects both sides

A milestone regime that only lets the buyer withhold money is not a good deal for either party, because it pushes the vendor toward defensive scoping and padded estimates. The version I sign has four parts.

**A review window.** The client has a fixed number of business days (three works) to accept or reject against the written criteria. Silence past the window is acceptance. Without this, invoices sit behind a holidaying stakeholder.

**Rejection on criteria only.** A milestone can be rejected for failing its stated criteria, not for new requirements. New requirements are welcome and go into a change note with their own time and cost.

**One remedy cycle.** If a milestone fails, the vendor gets a defined period (a week, typically) to fix it at no extra cost. If it fails twice, either side can stop the engagement, with work to date paid and all code, prompts, evals and infrastructure definitions handed over.

**Named change mechanics.** Every discovery that changes scope gets logged with its time impact, and the client chooses: extend, descope something else, or accept the gap. This is the clause that turns scope creep from a silent margin fight into a decision with a date on it. If your spec was vague going in, these conversations multiply, which is why I push so hard on [a proper spec before you collect quotes](/en/blog/ai-feature-spec-template-vendor-quotes).

## Worked example: AI triage for support tickets

Suppose you are building ticket triage: incoming support emails get classified into your existing categories, tagged with urgency, and matched against your knowledge base so the agent sees a suggested answer. Ten-week SOW, one senior engineer, your stack. Here is how the four milestones read in the document.

**M1, end of week 2.** Deployed to your staging environment behind your auth. Accepts a real ticket via the same webhook production will use, returns a structured object with category, urgency and up to three KB source links. Scope limited to Dutch-language, single-issue, text-only tickets. Delivered with a frozen eval set of 100 historical tickets labelled by your support lead, plus the baseline scores and the script that produces them. Acceptance: your support lead runs the suite and gets the documented numbers, and runs ten tickets of their own choosing through the staging endpoint.

**M2, end of week 5.** English and mixed-language tickets, tickets containing more than one issue, PDF and image attachments routed through extraction, and explicit low-confidence behaviour where the feature declines to suggest rather than guessing. Eval set grown to 300 tickets including a deliberately adversarial slice. Acceptance: agreed thresholds met on the full set, and no ticket in the adversarial slice produces a confidently wrong category.

**M3, end of week 8.** Rate limits per tenant, cost per ticket logged and visible in a dashboard, full tracing of every model call with prompt version attached, retry and fallback path when the provider degrades, agent-facing override that records the correction. Acceptance: you run a load test at projected peak volume, trigger a simulated provider outage, and read the cost per ticket off the dashboard yourself.

**M4, end of week 10.** Eval suite in your CI pipeline failing the build on regression, runbook covering the four known failure modes, two weeks of shadow-mode output compared against what agents actually did, handover session with your team. Acceptance: one of your engineers deploys a prompt change through the full pipeline without me in the room.

Every one of those is checkable by someone who is not the person who wrote the code. That is the whole test for whether a milestone belongs in a SOW.

## Questions that come up while the SOW is being drafted

**Can a fixed price AI build still use real milestones?**
Yes, and it should. Fix the price, fix the four milestones with their criteria, and attach the change mechanism. The price stays stable for the agreed scope; the milestones tell you early whether that scope was right. What you cannot do honestly is fix price and scope with no checkpoint, because the first week of real data nearly always changes something.

**What if the vendor wants payment on calendar dates?**
Ask why. Cash flow is a legitimate answer, and the fix is a larger kickoff payment or fortnightly invoicing against accepted milestones, not undated money. A vendor who will not attach any verifiable criterion to a payment is a vendor who expects to need the ambiguity.

**How do I write acceptance criteria for AI quality when I do not know what is achievable yet?**
Make M1 produce the baseline, then set M2 to M4 thresholds relative to it. The SOW says the eval set and the measurement method up front, and the numeric target for later milestones is agreed within a week of M1 acceptance. You are fixing the ruler before the work, not the result.

**Should the eval set belong to us or the vendor?**
Yours, built from your data, held in your repository. It is the single most valuable artefact of the build, because it is what lets you evaluate the next change and the next vendor. If an SOW leaves ownership of the evals unstated, state it.

**Do AI feature payment milestones work for a 6-week build too?**
Four milestones still fit, just compressed: thin slice at the end of week 1, hard cases at week 3, production surface at week 5, handover in week 6. Below about five weeks I would drop to three and merge the last two, because the packaging overhead starts to cost more than the signal is worth.

## Before you sign

The structure above is how I run a Full Build: six to twelve weeks, one senior engineer owning the AI feature and the product around it end to end, four milestones that each deliver something you can run yourself, and a handover that leaves your team able to change the prompts without me. If you want to see what layers a real quote should cover before you get to milestones, [the seven layers of a full AI feature build](/en/blog/full-ai-feature-build-scope-cost) is the companion piece, and the engagement scope is on the [services page](/en/services). If you are drafting an SOW this month and want a second pair of eyes on the milestone definitions, [get in touch](/en/contact).
