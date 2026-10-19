---
title: "An AI Feature Rollout Plan Beats Flipping a Switch Live"
description: "Most teams ship without an AI feature rollout plan. Here's the shape, gates, kill switch, and signals to build before you go live."
published: "2026-10-19"
tags: ["AI feature rollout plan", "feature flags", "AI launch strategy", "LLM observability", "product engineering"]
ogImage: "/images/blog/ai-feature-rollout-plan/cover.jpg"
primaryService: "ai-features"
---
Week eleven of a build is usually the quietest week. The feature works end to end, the evals pass, the handover doc has a table of contents, and the only open item on the board is a date. Then someone asks "so we flip it on Thursday?" and nobody pushes back, because at that point in a project nobody wants to add work. That is the moment where an AI feature rollout plan either exists or it doesn't, and the difference shows up two weeks later in a cost report or a support queue.

The asymmetry is what makes this worse for AI features than for ordinary ones. A broken checkout button at 100% of traffic is loud: errors spike, somebody pages, you roll back in six minutes and write an apology. A retrieval path that silently returns nothing for tenants with more than fifty thousand documents produces a 200 response, a plausible-sounding answer with no grounding, and no alert at all. Users read it, some of them act on it, and the first signal reaching your team is a vague complaint routed to a support agent who files it under "general feedback."

So the go-live needs to be built, the same way the retrieval layer was built. Below is the sequence I use in the last two weeks of a build: pick the shape, make the flag control more than visibility, define the gates in front of each percentage, make "off" mean something fast, then watch the handful of signals your uptime dashboard will never surface.

## Pick the rollout shape before you write any flag code

There are three shapes worth considering, and the choice depends on what you are uncertain about. Teams skip this step and default to a percentage ramp, which is the right answer maybe half the time.

A **percentage ramp** is right when you are mostly worried about volume: cost per request, rate limits, latency under concurrency, queue depth. It gives you a dial you can turn down. It is a bad fit when your traffic is heterogeneous, because 5% of random users can easily miss every edge case that matters.

A **cohort rollout** is right when the risk is in the data, not the load. If your assistant reads customer documents, the thing that breaks it is one tenant with a 400-page scanned contract in Dutch, not a thousand tenants with clean PDFs. Pick cohorts deliberately: two internal teams, then three friendly accounts that span your actual data distribution, then the long tail. I have seen a build pass a 10% ramp cleanly and then fail on day one of 25% because the first large enterprise tenant landed in that bucket.

**Shadow traffic** goes first when the output is consequential and you have something to compare against. You run the new path on real requests, log the result, show the user nothing. It costs real money in tokens and buys you a scored sample before a single user is exposed. This is the same reasoning behind running a [capped canary during a model migration](/en/blog/llm-model-migration-canary-test), applied to a feature that has no production history at all.

Most real launches combine them: shadow for three days, then internal cohort, then a percentage ramp inside the remaining accounts. Write that sequence down with dates before anyone touches the flag framework, because the shape determines what the flag has to be able to express.

## What an AI feature rollout plan has to control beyond on and off

The default feature flag AI launch setup is a boolean that decides whether a user sees a button. That is not enough, because when something goes wrong mid-rollout the question is almost never "should this user see the feature." It is "can I make this cheaper, slower, more conservative, or narrower without turning it off entirely."

![An AI Feature Rollout Plan Beats Flipping a Switch Live](/images/blog/ai-feature-rollout-plan/1.jpg)

A flag that is only a boolean gives you two states: broken and absent. What you want is a config object the rollout can reshape at runtime without a deploy. In practice that means something close to this:

yaml
ai_assistant:
  enabled_for: { internal: true, cohort: ["acct_18", "acct_44"], percent: 10 }
  model: "primary"              # primary | fallback | off
  max_tokens_out: 800
  retrieval:
    top_k: 8
    require_citations: true     # block answers with zero retrieved chunks
  tools_enabled: ["search", "summarize"]   # write actions excluded at launch
  max_tool_calls: 6
  daily_cost_ceiling_eur: 400
  fallback_on_failure: "deterministic_template"

Each line there is a lever I have actually needed during a staged rollout AI feature. Token ceilings cap the cost of users pasting entire documents into the input. `require_citations` turns a hallucination risk into a visible empty state. Keeping write-capable tools out of the first week means the worst case is a wrong answer rather than a wrong record in someone's CRM, and you can enable them at 25% once you trust the loop. A per-day cost ceiling is the one teams forget and the one that prevents the Monday morning bill that nobody authorised.

One rule: these values live in a store you can change in seconds, and every change is logged with who made it. A flag you have to redeploy to adjust is not a rollout control. It is a slower deploy.

## The percentages, and the gate in front of each one

Percentages are easy to argue about and mostly arbitrary. What matters is that each step has a gate: a condition that has to hold before the next step opens, agreed in advance, with a named person who checks it. Without the gate, a ramp is just a slower way of reaching 100% regardless of what the data says.

The ladder I keep coming back to:

- **Shadow, 3 days.** Gate: a human has scored at least 100 logged outputs against your eval rubric and the pass rate is within a few points of what you measured in staging. If you cannot score them, you do not have a rollout, you have a hope.
- **Internal only.** Gate: one full day with no unhandled exception in the AI path, and the cost per successful request is inside the number you put in the business case. This is where you catch the integration mistakes that evals never touch, like the assistant answering correctly but writing to the wrong tenant's audit log.
- **10% of external traffic.** Gate: p95 end-to-end latency under your stated target, parse failure rate on structured outputs below 1%, and at least one deliberate rollback rehearsal completed. Yes, rehearse the rollback at 10%, when it costs you nothing.
- **25%, then 50%.** Gate at each: no new failure category in the logs for 48 hours. Not "no failures," which is unrealistic. No new *kinds* of failure. A known failure at a stable rate is a backlog item. A failure type you have never seen before is a stop sign.
- **100%.** Gate: everything below in the sign-off section.

Give each step a minimum duration and refuse to compress it for a launch date. Twenty-four hours at 10% covers one daily cycle of user behaviour, and a lot of AI feature problems are time-shaped: the batch job at 02:00, the Monday report rush, the end-of-month load when every account manager opens the thing at once. Ramping through five steps in one afternoon tells you nothing except that your servers stayed up.

## "Turn it off" has to mean something in under sixty seconds

Ask the team how they would disable the feature right now and time the answer. If it involves a pull request, a CI run, and a deploy, your real recovery time is twenty minutes on a good day and the on-call engineer will hesitate before starting it, because reverting a deploy feels like a bigger decision than toggling a value.

An AI feature kill switch needs three properties. It has to be a config change with no build step. It has to degrade to a defined state rather than an error, which is why `fallback_on_failure` sits in the config above: the UI shows the old manual flow, or a template, or a clear "unavailable, use X instead" message, never a spinner that never resolves. And it has to be pullable by more than one person. If only the engineer who built it can disable it, the switch does not work on a Friday evening.

Write down who is allowed to pull it and make the list longer than you are comfortable with: on-call engineering, the support lead, the product owner. Then make the cultural part explicit, because this is the part that fails in practice. Pulling the switch is never wrong. Nobody reviews the decision afterwards for whether it was justified. A team that treats the kill switch as an admission of failure will debate for forty minutes instead of pulling it, and that debate is the actual incident.

## The signals uptime and error rate will not show you

Your standard dashboard will report green through almost every AI failure that matters. These are the ones worth putting on screen during the ramp, and most of them need instrumentation you add during the build, not after. If none of this exists yet, [production LLM observability](/en/blog/llm-observability-production-monitoring) is the prerequisite, not a follow-up ticket.

- **Cost per request as a distribution, not a mean.** The mean hides the p99 user who pastes a 90-page document. Watch the top percentile and the daily total against the ceiling.
- **Retrieval empty-and-answered rate.** How often did the model produce an answer with zero or irrelevant retrieved context. This single metric predicts hallucination complaints better than anything else I track.
- **Structured output parse failures and silent repairs.** Count the retries and the fields your fallback parser quietly filled with null.
- **Refusal and hedge rate.** A sudden rise in "I don't have enough information" usually means a retrieval or permissions regression, not a cautious model.
- **Fallback path hit rate.** If 8% of requests are landing on the degraded path, the feature is half broken and fully green on your status page.
- **User-side rejection.** Regenerate clicks, edit distance between the generated draft and what the user actually sent, and the share of outputs nobody copies or saves. This is the closest thing to a quality signal you get for free.

Set a threshold and an owner for each one before the first external user arrives. A metric with no threshold is a chart someone glances at.

## What signing off on general availability actually takes

The general availability checklist is short, and almost none of it is on a dashboard. Going to 100% means someone is accepting ongoing responsibility, so the sign-off should be a conversation with specific answers.

The eval suite runs on a schedule against production traffic samples, not only in CI, and a human looks at the result weekly. The flag and all its levers stay in the codebase for at least a month after GA, because the reason you need them is usually a provider-side change rather than your own code. The rollback has been executed once for real. Latency, cost per request, and quality numbers from the 50% step are written down, because that is your baseline for noticing drift in February. And one named person owns the feature, with a clear answer to [who still owns it in month four](/en/blog/ai-feature-maintenance-after-handover). "The team" is not an answer.

If that list reads like your [definition of done](/en/blog/ai-feature-definition-of-done) with four extra lines, good. The rollout plan is the bridge between a feature being finished and a feature being live, and it is the cheapest two days of work in a twelve-week build.

A Full Build runs six to twelve weeks and includes the deploy and the handover walkthrough, which in my work means the flag config, the gates, the kill switch, and the dashboard exist and have been exercised before the first external user sees anything. If you are heading into launch week with a feature that works and no plan for how it goes live, the [services page](/en/services) covers the scope and [contact](/en/contact) is the faster route.
