---
title: "Inside a POC Audit Week: Why We Measure, Not Just Read Code"
description: "A real POC audit week spends four hours reading code and four days measuring latency, cost, and eval quality against your actual data."
published: "2026-10-14"
tags: ["POC audit", "AI readiness", "LLM evaluation", "technical due diligence", "AI prototype"]
ogImage: "/images/blog/poc-audit-week-day-by-day/cover.jpg"
primaryService: "ai-audit"
---
Nobody books a week of senior engineering time on vibes, so the question I get most often before a **POC audit week** starts is some version of "what are you actually doing on Wednesday?" It is a fair question. The line item says one week, the deliverables say report plus readout call, and the space between those two things is where a buyer's imagination quietly fills in "code review with a nicer invoice".

That picture is wrong in a specific, checkable way. Reading your repository is roughly half of Monday. A code read can tell me your retrieval function looks sane. It cannot tell me that it returns in 300 milliseconds against the 400 documents on the demo laptop and takes four seconds against your real corpus of ninety thousand, which is the fact that decides whether you launch in March or in June. Code review predicts. Tests measure. The week is built around measuring, and that is also how you tell a real audit from a padded one.

Below is the actual shape of the five days, what I need from you on each, and the tells that give away a vendor who plans to spend the week writing instead of running things.

## Reading the repo is the cheapest part of the week

Static review of an AI prototype is fast and genuinely useful, but it finds a narrow class of problem: missing timeouts, unbounded loops, secrets in config, no retry policy, prompts assembled with string concatenation and no version history. Real issues, all of them, and I do look. The trouble is that the failures that kill launches are behavioural. Latency under concurrency, cost at the 95th percentile of input size, retrieval quality on documents nobody tested with, and what the system does when the provider returns a 503 for ninety seconds. None of those show up in a diff.

So the week allocates maybe four hours to reading and the rest to putting load, real data, and deliberate failures through the thing. If a proposed audit never mentions running your system, you are buying opinions. Mine would be cheaper over a coffee.

## Day 1: intake, access, and deciding what gets tested

Monday starts with a 90-minute intake call. I want three people on it: the engineer who built the demo (non-negotiable, because the undocumented decisions live in their head), the person who will be on call for this feature once it is live, and whoever owns the budget for about twenty minutes at the start. The questions are unglamorous. What does this do for an actual user, in one sentence. How many requests a day at launch, and from how many concurrent users. What is the worst thing that happens if the output is wrong and nobody catches it. Who answers the phone when it breaks on a Saturday.

![Inside a POC Audit Week: Why We Measure, Not Just Read Code](/images/blog/poc-audit-week-day-by-day/1.jpg)

The second half of Monday is access, and this is where weeks get wasted if nobody prepared. I ask for repository read access, a way to run the system (staging environment or a local setup that actually boots), a sample of real production data or the closest thing legal will let me touch, API keys with their own spend cap so my load tests do not land on your production bill, and whatever observability already exists even if it is just stdout logs. Getting that list sorted on Friday of the previous week is the single highest-leverage thing a client does.

Monday ends with a written test plan: five to ten things I am going to measure, with the thresholds that would count as a problem. You get it that evening. If you think I am measuring the wrong things, Monday night is the moment to say so. By Thursday the week has already spent itself.

One honest branch here: if the demo cannot be run at all, by anyone, the engagement changes shape and I tell you that on day one rather than billing a week of archaeology. That situation is usually a different conversation about [whether to audit, harden, or rebuild](/en/blog/ai-demo-diagnostic-audit-harden-rebuild).

## Days 2 and 3: load, cost, and evals against your data

These two days are the engine of the AI readiness audit process, and they run as three parallel tracks.

**Load.** I drive the system with Locust or k6, shaped like your expected traffic rather than a flat request-per-second average, because AI features fail on concurrency patterns. What I am looking for is the point where p95 latency goes nonlinear: connection pools exhausting, a vector index that was never built for the corpus size, provider rate limits returning 429s that your code treats as fatal, tool calls executing serially inside an agent loop that nobody capped. The deliverable is a number and a curve, not a verdict.

**Cost.** I instrument token counts per request against your real inputs. Demo inputs are short, clean, and chosen by the person who built the demo. Production inputs include the 40-page scanned attachment and the email thread with eleven levels of quoted reply. I compute cost per request at median and at p95 input size, then multiply by your launch volume. That calculation is where most teams discover their unit economics were modelled on the happy path, which is the first of the [five causes behind cost spikes](/en/blog/llm-cost-spike-production) I keep running into.

**Evals.** I build a small labelled set from your real data, typically 50 to 150 cases, which takes an hour or two of your domain expert's time and is the most valuable hour of the week. Then I separate retrieval quality from generation quality, because when the output is wrong you need to know whether the right chunk was never retrieved or whether it was retrieved and ignored. If you have never done this, the output is your [first real baseline](/en/blog/rag-evaluation-metrics-production). Not a grade. A number to improve against.

Alongside those, I inject failures on purpose: kill the provider mid-request, send malformed and oversized input, push the context past its limit, drop in a straightforward prompt injection string. Those tests take an afternoon and they consistently produce the findings clients remember longest. Across engagements the same [seven gaps keep repeating](/en/blog/ai-poc-audit-recurring-findings), which is reassuring in one sense and depressing in another.

## Day 4: ordering findings into a 90-day plan

Thursday is synthesis, and it is the day that separates a useful audit from a list. By Wednesday evening I typically have twenty to forty findings. A dump of forty items is not a plan, it is homework with no due dates, and it gets skimmed once and filed.

So Thursday is spent ranking. Each finding gets scored on blast radius, likelihood, effort, and whether fixing it unblocks other fixes, which is the [four-axis ordering](/en/blog/ai-poc-audit-priority-framework) I use for every punchlist. Then the ranked list collapses into three time horizons: what must be true before a single external user touches this, what must be true before you widen the rollout, and what can wait until the feature has earned the investment. That is the 90-day AI plan, and it is written so your own engineers can execute it without me.

The rest of Thursday is writing. The report has a fixed skeleton covering measurements, findings, the plan, and the things I could not test and why, and I have [documented that structure](/en/blog/ai-poc-audit-report-checklist) so you know what you are receiving. Occasionally the honest conclusion is uncomfortable: do not harden this retrieval layer, replace it, or this particular feature [did not need an LLM](/en/blog/ai-feature-that-should-have-been-sql-query) in the first place. Those go in the report too.

## Day 5: the readout, and what it is not

The report lands in your inbox Thursday evening so people can read it before they speak. Friday is a 60-minute AI audit readout call: ten minutes on what was measured and how, twenty on the three or four findings that change your roadmap, twenty on the 90-day plan with the sequencing argument behind it, ten for questions. I want the same people from Monday plus anyone who will be asked to fund the next phase.

The thing that makes a readout worth sitting through is that it is not a sales call. The plan names owners and effort estimates for your team, not mine. If the finding list is short and your engineers are capable, I say the quiet part: you do not need to hire me for the next three weeks, go do this. That has happened more than once and it is the correct outcome of a week spent measuring rather than selling.

## How a padded POC audit week gives itself away

Before you sign, the tells are visible in the proposal:

- **No access request ahead of day one.** If nobody asked for keys, data, and a runnable environment, nothing is going to be run.
- **Deliverables described without a single measurement.** "Maturity assessment" and "readiness score" with a radar chart means someone is going to interview your team and reformat the answers.
- **No eval set.** An AI audit that produces no baseline quality number has skipped the hardest part.
- **Refusal to name tools.** Real testing uses specific things. Vagueness here is a signal.
- **Findings that could have been written before seeing your system.** "Consider implementing monitoring and establishing governance" applies to every company on earth.
- **A POC audit timeline whose first recommendation is conveniently a six-month engagement with the same vendor.**

Also worth doing first: run the [fifteen checks](/en/blog/ai-poc-self-audit-checklist) your own team can do in an afternoon. If you can answer all fifteen with numbers, you probably do not need to buy a week from anyone.

## Friday afternoon

What you hold at the end is narrow and concrete: measured latency and cost curves against your real data, a retrieval and generation baseline you can regression-test against, a ranked list of what breaks and in what order to fix it, and a 90-day plan with enough detail to take into a budget conversation. That is usually sufficient to answer the only question that matters this quarter, which is whether to ship, fix, or stop. The [arithmetic against a failed launch](/en/blog/poc-audit-cost-vs-failed-launch) tends to make the decision easy.

That week is the POC Audit: one week, one senior engineer, a report and a 60-minute readout at the end of it. Scope and what is included sit on the [services page](/en/services), and if you want to check whether your prototype is at the right stage for it, [tell me what you have built](/en/contact) and I will say so straight.
