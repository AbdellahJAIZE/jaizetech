---
title: "What a POC Audit Scope Does Not Cover (And Why That Matters)"
description: "A clear breakdown of the poc audit scope: what a one-week readiness audit covers, what it excludes, and why that boundary protects your decisions."
published: "2026-10-20"
tags: ["poc audit", "AI readiness", "productiegereedheid", "AI compliance", "startup engineering"]
ogImage: "/images/blog/poc-audit-scope-limits/cover.jpg"
primaryService: "ai-audit"
---
Before you sign anything, ask the vendor what the engagement will *not* cover. The answer tells you more about a poc audit scope than any deliverables list, because the disappointments I hear about afterwards are almost never "the work was bad." They are "I assumed the compliance part was in there," or "we thought this would also tell us whether to build it at all."

A one-week production readiness audit is a narrow instrument. It answers a specific question: does this prototype survive real users, real data volumes and real cost at the scale you are about to promise, and if not, what do you fix first. That question is worth answering in a week. It is also one question among several that a founder shipping an AI feature has to answer this quarter, and the other ones need different people.

So here is the honest boundary map, written as the questions buyers actually ask me on the call before they book.

## The scope line most sales calls skip

Most audit proposals list inclusions. Almost none list exclusions, and that asymmetry is where mismatched expectations get manufactured. A deliverables bullet that says "security review of the AI pipeline" is true and also radically different from a penetration test, but the buyer reading it at 22:00 before a board update does not know that yet.

I write the exclusions into the scope document on purpose. It costs me a small amount of perceived value on the sales call and saves a large amount of friction in week two, when someone in the room expects a signed statement about GDPR that I was never going to produce. If a vendor cannot tell you in one sentence what their audit refuses to cover, you are buying an undefined thing. That applies to mine and to everyone else's; the broader version of this check is in the [technical questions worth asking any AI vendor](/en/blog/vet-ai-vendor-before-you-sign) before you sign.

## It will not tell you whether the market wants this product

This is the most expensive misunderstanding of the four, because it is the one that gets discovered latest. An audit measures whether the system works. It says nothing about whether anyone will pay for it working.

![What a POC Audit Scope Does Not Cover (And Why That Matters)](/images/blog/poc-audit-scope-limits/1.jpg)

I can tell you that your RAG assistant answers 88% of your eval questions with correct grounding, costs roughly €0.04 per conversation at current token prices, and returns p95 in 2.1 seconds. I cannot tell you whether the twelve pilot users who asked for it represent four hundred paying accounts or four. Those are different disciplines with different evidence: one needs eval sets and traces, the other needs pricing conversations, churn data and a sales motion. Technical readiness and commercial demand fail independently, and I have audited POCs that were in excellent shape technically and should have been killed anyway.

If demand is your real uncertainty, do not spend a week on engineering review yet. Go get three signed letters of intent, or run the manual version of the feature with a human behind the curtain for a month. The audit is worth more once the answer to "will they use it" is already yes, which is roughly the [timing argument](/en/blog/poc-audit-timing-before-you-commit) for booking it the week before you commit budget rather than months earlier.

## Compliance exposure does not move because an engineer looked at it

An audit will surface the facts your legal exposure depends on. It will not resolve the exposure.

Concretely: I will document which personal data categories move through the pipeline, which sub-processors receive them, where inference happens geographically, how long prompts and completions are retained by each provider under their current terms, whether your logs contain data you would not want in logs, and whether the feature plausibly falls into a higher-risk category under the EU AI Act based on its use case. That is the factual substrate. Useful, and often the first time anyone has written it down in one place.

What happens next is not engineering work. Someone has to decide whether your DPIA needs updating, whether the processor agreement with your model provider is adequate, whether your privacy statement describes what the product now does, and whether the AI Act obligations that attach to your classification are met. That is a privacy counsel and a compliance owner, working from the technical facts. I hand them the facts. I do not sign off on the conclusion, and you should be suspicious of any engineer who offers to.

Two sequencing notes from projects where this went sideways. If you are already fairly sure the data flow is legally problematic, fix that before you pay for a readiness audit, because a cross-border inference path can invalidate half the architecture and make the punchlist moot. The practical starting points are the [GDPR read on sending company data to OpenAI](/en/blog/company-data-openai-gdpr-netherlands) and the [AI Act checklist for Dutch software teams](/en/blog/eu-ai-act-checklist-dutch-software-teams). If you are not sure, the audit is a reasonable way to find out what you are dealing with.

## Where a readiness audit stops and a penetration test starts

The poc audit vs security review confusion is reasonable, because the two overlap in a visible way and diverge in an invisible one.

I do look at the attack surface that is specific to LLM systems. Can a document in your corpus steer the model into ignoring its instructions, which is a real failure mode that [system prompts do not fix](/en/blog/prompt-injection-production-guardrails). Does retrieval respect tenant boundaries, or does one embedding index serve everybody and hope the filter holds. Can an agent loop be driven into calling a write endpoint it should never reach. Are API keys in the right place. Does the output path let model text land unescaped in a browser.

What I do not do is a penetration test. No adversarial testing of your auth layer, no dependency CVE sweep, no network and infrastructure assessment, no attempt to break session handling or privilege escalation in the surrounding application, no report in the format your enterprise customer's security questionnaire expects. Those require a different skill set and, if an enterprise deal depends on it, an independent party whose name on the report means something to your buyer.

The practical split: if your blocker is "a prospect sent us a 200-question security questionnaire," hire a pen test firm. If your blocker is "we do not know whether this thing leaks data between customers or can be talked into deleting a record," that is inside the audit, and the [multi-tenant isolation failures](/en/blog/multi-tenant-ai-feature-data-leaks) are the ones I find most often.

## Nobody can guarantee the 90-day plan gets executed

The audit ends with a prioritized punchlist and a 90-day plan. The plan is a sequencing document: what to fix in which order, what each item costs in engineering days, what can wait until after launch, and which two or three items are genuinely blocking.

90-day plan execution is yours unless you separately buy it. I have watched good plans sit untouched for a quarter because the one engineer who understood the retrieval layer went on parental leave, or because a funding round reshuffled priorities, or because nobody was named as owner and so everybody assumed someone else had it. The plan does not come with a project manager attached.

Two things measurably improve the odds. Name an owner per punchlist item before the audit week ends, while the context is still fresh and the room still agrees the findings matter. And convert the top three items into actual tickets with estimates in your tracker that same week, not a PDF someone will reopen in January. If your team has no capacity to execute at all, the audit is still worth doing, because it tells you how big the gap is and what to put in a quote. But be honest with yourself that you are buying a diagnosis, not a treatment. The honest version of that decision is the [audit, harden, or rebuild](/en/blog/ai-demo-diagnostic-audit-harden-rebuild) question.

## What a one-week poc audit scope reliably delivers

Narrow does not mean thin. Within its boundary, a week of measurement produces things most teams do not have:

- **A real eval set and a measured baseline.** Not vibes. A scored sample of your actual questions against your actual corpus, with retrieval and faithfulness separated so you know which half is broken.
- **Cost per request and per user at your projected volume**, with the specific inputs that make it spike: context growth, retry storms, agent loops that do not terminate.
- **Latency percentiles with the bottleneck located**, which is usually not the model call.
- **The failure modes you have not seen yet**, found by running the paths your demo never touched: empty retrieval, oversized documents, concurrent load, provider timeouts, malformed structured output.
- **A prioritized punchlist and a 90-day plan** with owners and effort estimates.

If you want the detailed shape of the output, I wrote up [what a real readiness audit report contains](/en/blog/ai-poc-audit-report-checklist) and [how the week itself is structured day by day](/en/blog/poc-audit-week-day-by-day).

## The one question to ask before you book

Ask this, of me or of anyone else: **"What decision will I be able to make on Friday that I cannot make today, and what decisions will still be open?"**

A vendor who has run these engagements will answer in specifics. Mine: on Friday you can decide whether to launch, harden, or rebuild, you can put a defensible number in a budget request, and you can brief your team on the three things to fix first. Still open: whether the market wants it, whether your DPIA holds, whether your auth survives a determined attacker, and whether the plan actually gets executed.

If the answer you get is a list of deliverables rather than a list of decisions, keep asking.

## Questions buyers ask before signing

**Does the week include fixing anything?**
Small things, yes, where the fix is faster than describing it. The week is weighted toward measurement, because an unmeasured fix is a guess. Substantive remediation is a separate three to six week hardening engagement.

**Our POC was built by an external agency. Does that change the audit?**
It changes the first morning, not the scope. I need repo access, the ability to run the system against real-shaped data, and someone who can answer architecture questions. If the agency controls all three and is not cooperative, say so before we book, because that is a genuine blocker rather than an inconvenience.

**We have no evals at all. Is it too early?**
That is the normal starting state and not a reason to wait. Building the first eval set is part of the week. What does make it too early: the POC does not run end to end yet, or you have no idea what questions users will actually ask, because then there is nothing to measure against.

**Can the audit output go to an enterprise prospect or an investor?**
The findings are written for your team, with enough technical detail to be actionable and enough plain language for a board slide. It is not a certification and carries no independent attestation. If a prospect wants assurance, they usually want a pen test report or a SOC 2, which are different documents from different providers.

**We already know the POC is bad. Should we skip to a rebuild?**
Sometimes. If the architecture is clearly wrong and you know why, the audit mostly confirms what you already decided. If "bad" means "it is slow and sometimes wrong and we do not know why," the diagnosis is worth a week, because rebuilds driven by an unidentified root cause tend to reproduce it.

The POC Audit is one week, fixed scope, ending in a measured punchlist and a 90-day plan: the diagnosis, deliberately not everything around it. The boundaries are on the [services page](/en/services), and if you want to check whether your situation fits inside them before committing, [send me the specifics](/en/contact) and I will tell you plainly if it does not.
