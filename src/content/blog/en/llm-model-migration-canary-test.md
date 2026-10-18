---
title: "LLM Model Migration: Why It's Never Just a Config Change"
description: "LLM model migration looks like a one-line diff but carries production risk. Here's the eval diff, shadow traffic, and canary process that catches it."
published: "2026-10-18"
tags: ["LLM model migration", "AI engineering", "production AI", "LLM evaluation", "MLOps"]
ogImage: "/images/blog/llm-model-migration-canary-test/cover.jpg"
primaryService: "hardening"
---
A model swap looks like a one-line diff. You change `gpt-4o` to `gpt-4.1`, or `claude-sonnet-4` to whatever replaced it, the tests still pass, and the PR gets approved in four minutes because there is nothing to read. That is the part of LLM model migration that fools people. The diff is small and the blast radius is the entire feature.

I get called in after this goes wrong often enough that the shape is familiar. Nobody notices for days. Then support forwards a few complaints that sound vague, the kind where the user says the answers feel "off" rather than wrong, and someone finally correlates the timestamps with the deploy. By then the new model has served a few hundred thousand requests and you cannot tell which outputs were bad because nobody scored them.

What follows is the sequence I use when a team deliberately changes the model behind a live feature: eval diff, shadow traffic, capped canary, pre-agreed rollback trigger. It is not exotic. It is mostly refusing to do the swap in one step.

## An LLM model migration is a production change, not a config edit

The reason teams treat it as config is that it is stored as config. The model identifier sits in an environment variable next to the timeout and the log level, and everything in that file is boring. Your deploy pipeline makes no distinction between changing `LOG_LEVEL` and changing the thing that generates every word your users read.

Compare it to a database migration. Nobody ships a schema change without a plan for what happens when it goes badly, because the failure mode is loud and the data is at stake. A model change has the opposite profile: the failure is quiet, and what is at stake is output quality, which most teams do not measure continuously. That asymmetry is why model swaps get less process than schema changes while deserving more.

There is also a timing trap. Migrations driven by deprecation notices arrive with a date attached, and the date is usually generous until it isn't. Teams sit on the notice for two months, then do the swap under deadline pressure in the same week, which is exactly when you skip the shadow run. If you have a deprecation email in your inbox right now, the useful action today is to start the eval diff, not to schedule the swap.

## What actually changes: instruction-following, formatting, refusals

Benchmark scores tell you almost nothing about how a migration will land in your product, because your prompt is not a benchmark. The things that move are narrower and weirder than "capability".

![LLM Model Migration: Why It's Never Just a Config Change](/images/blog/llm-model-migration-canary-test/1.jpg)

Instruction-following changes in character. Prompts accumulate workarounds for the quirks of one specific model: an all-caps "DO NOT include a preamble" that a previous model needed, a three-shot example added because one version kept inventing a field. The new model may not need those, may actively be distracted by them, or may need different ones. Prompts are tuned to a model whether you intended that or not.

Formatting habits shift too. A model that used to return clean JSON starts wrapping it in a fenced code block, or adds a trailing explanation after the closing brace, or changes how it escapes quotes inside string values. If your parser is strict you find out immediately, which is the good case. If your parser is forgiving you find out later, through a slow rise in empty fields downstream. I have written about [structured output failures and why nobody dashboards them](/en/blog/llm-structured-output-failures-production); a model migration is the single most reliable way to generate a fresh batch of them.

Refusal boundaries move in both directions. Newer versions are sometimes more willing on content the older one declined, and occasionally more cautious on a narrow category that happens to be your core use case. For a legal, medical, HR or financial product this is not a tone issue. It is a feature outage for a subset of users that your error rate will never show, because a refusal is a successful API call.

Then there is tone and length. Verbosity drifts, hedging drifts, the model starts opening every answer with a restatement of the question. None of that breaks a test. All of it changes how the product feels, and for a customer-facing assistant, feel is the product.

Latency and cost shift as well, and not always in the direction the pricing page suggests. A cheaper per-token model that writes 40% longer answers is not cheaper, and if your feature streams to a user it is also slower in the way that matters.

## Build the eval diff before you touch the default model

The eval diff is the cheapest step and the one most teams skip, usually because they do not have an eval set and do not want to admit it on the day a deprecation deadline lands.

You need a fixed set of real inputs, pulled from production logs, covering the boring middle and the edges that actually hurt: the longest documents you serve, the multi-language requests, the inputs that previously caused incidents, the ones where users retried. A hundred to three hundred cases is enough to be useful. Ten is not, and a thousand curated by hand is a project you will not finish this week.

Run both models against that set, same prompt, same temperature, same tools, and score them on the dimensions you care about rather than on similarity. Exact-match comparison between two model outputs is mostly noise. What you want is per-dimension scoring: did it follow the format contract, did it stay grounded in the retrieved context, did it refuse, how long was the output, how many tool calls did it make, what did it cost. If you run an LLM judge for the subjective dimensions, pin the judge model and never migrate it in the same week; otherwise you cannot tell whether quality moved or the ruler did. The mechanics of running this continuously rather than once are in my piece on [the continuous eval loop nobody runs](/en/blog/llm-evaluation-production-continuous-eval).

Two outcomes from an eval diff on a model upgrade are both fine. The new model wins or ties everywhere, and you proceed. Or it loses on two dimensions, and now you know what to fix in the prompt before any user sees it. The outcome that is not fine is "it looked fine when I tried a few prompts in the playground."

If the fix is a prompt change, version it as its own change, with its own regression run, and do not bundle it invisibly with the model swap. When something degrades later you want to know which variable moved. That discipline is the same one described in [prompt versioning and regression testing](/en/blog/prompt-versioning-regression-testing), and it matters more during a migration than at any other time.

## Shadow traffic: scoring the new model on requests nobody sees

An eval set is a frozen photograph of last month's traffic. Shadow testing an LLM model is how you check it against this week's.

The mechanism is simple: for a percentage of live requests, call both models, serve the old one's output to the user, and log both. The user experience is untouched. You pay double on that slice of traffic, which is the main reason to cap it and to run it for days rather than weeks.

What shadow traffic catches that an eval set cannot is distribution. Real users send things your curated set does not contain: the pasted email thread with a forwarded signature block, the half-Dutch half-English question, the prompt injection attempt, the 40-page PDF someone uploaded by mistake. You see context length distributions shift. You see the long tail of tool-call sequences. If your feature is agentic, the number that usually moves first is steps per task, and that number quietly owns your bill. I have gone through [the loop guardrail version of that problem](/en/blog/ai-agent-loop-guardrails-production) separately.

Two practical constraints. Shadow calls must not perform side effects, so if the new model's path can write to a database, send a message, or charge a card, run it against a sandbox or stub the tools. And log enough to compare pairwise: same request ID, both outputs, both latencies, both token counts, both tool traces. A shadow run you cannot query afterwards is just a bigger invoice.

Three to five days of shadow traffic covers a full weekly cycle for most B2B products, including the Monday pattern and whatever your batch jobs do overnight.

## The canary percentage and the rollback trigger you set before, not after

A canary rollout for an LLM is worth little without a number written down in advance. The failure I see is a 10% canary that runs for two weeks while everyone glances at a dashboard and says it looks okay, which is a decision made by fatigue.

Start at 5%, held for at least 24 hours. Then 25%, then 50%, then 100%, with at least a day at each step and no promotion on a Friday. Route by a stable hash of user or tenant ID, not per request, so one user does not get the old model and the new one in the same conversation.

Before the first percent goes live, write down the triggers. They should be specific enough that an on-call engineer can act without convening a meeting. Something like: structured output parse failures above 0.5% on the canary slice, refusal rate more than 2x the control, p95 latency above the number in your SLA, cost per request more than 20% over control, or any single severity-one complaint from a named enterprise account. Pick thresholds that fit your own baseline, write who is allowed to pull the trigger, and make the rollback a config flip that takes seconds rather than a redeploy that takes twenty minutes.

Keep the old model reachable for at least two weeks after reaching 100%. Deleting the fallback path on day one is how a reversible change becomes an incident.

## The quiet regressions a single eval suite never catches

Even a disciplined migration leaves gaps, and it is worth knowing where they are.

Per-segment regressions hide inside aggregate numbers. Overall quality holds steady while the new model gets noticeably worse on your three largest enterprise tenants, because their documents are longer and more structured than everyone else's. Always slice canary metrics by tenant, language, and input length before you promote.

Caching behaviour changes. Switching models invalidates prompt caches, and a feature whose economics depended on a high cache hit rate can look twice as expensive for the first days purely because the cache is cold. Do not call a cost regression until the cache has warmed.

Downstream consumers break in ways the LLM layer cannot see. If another service parses your output, or a human workflow depends on the summary being under a certain length, a tone or verbosity change propagates into places with no eval coverage at all. Ask who reads the output, including humans.

And second-order behaviour drifts in agents. Slightly different reasoning produces a different tool choice, which produces a different retrieval, which produces a different answer. The individual step scores fine. The trajectory is worse. This is the model-swap regression that unit-level evals structurally cannot catch, and the only honest defence is end-to-end task success measured on real traffic, plus a hard step cap.

Worth saying clearly: this entire sequence is what you need even when the vendor makes the change instead of you. A deliberate migration is the easy case because you chose the timing. The harder case is covered in [silent model updates](/en/blog/silent-model-updates-ai-feature), where the version string stayed the same and the behaviour did not.

## The week this takes, and what to decide first

For a single feature with an existing eval set, budget about a week of real engineering time: a day to build the diff harness and curate cases, a day to fix what the diff exposes, three to five days of shadow traffic running in the background while you do other work, then a week of staged canary that needs attention rather than effort. Without an existing eval set, add a few days for building one, and treat that as an asset rather than migration overhead, because the next model change is already scheduled whether you know it or not.

Decide three things before you start. Which single metric decides go or no-go, named now, so the decision is not relitigated at 50%. Who owns the rollback and what their threshold is. And whether you are allowed to change the prompt during the migration, because if you are, you need two eval runs rather than one, and a clear record of which change moved the number.

The teams that find this painful are usually missing the layer underneath: no eval set, no per-request logging, no traffic splitting, no fast rollback. The migration is just what exposed it. Building that layer into a live feature, so the next model change is a routine Tuesday instead of an incident, is the core of a [Production Hardening](/en/services) engagement: three to six weeks on evals, monitoring, prompt versioning, latency and cost controls, and a deploy you can reverse. If you have a deprecation date on the calendar and no way to measure what the swap will do, [get in touch](/en/contact) before the date, not after.

## Questions that come up

**How long should shadow traffic run before a canary?**
Three to five days for most B2B products, which covers a full weekly cycle including weekend and overnight batch patterns. Consumer products with strong weekday/weekend splits benefit from a full seven days. Running longer mostly adds cost rather than information, unless your traffic is highly seasonal.

**What percentage should an LLM canary start at?**
5% is a sensible floor for a feature with meaningful volume, held at least 24 hours before promoting. Below roughly a thousand requests per day, percentage-based canaries stop being statistically useful, and you are better off routing specific internal users or a single friendly tenant to the new model first and reading outputs by hand.

**Do I need to rewrite my prompts when I change models?**
Often you need to adjust rather than rewrite, and the eval diff tells you which parts. The usual candidates are few-shot examples tuned to the old model's quirks, format instructions it no longer needs, and negative instructions ("do not apologise", "do not restate the question") added to patch old behaviour. Change them as a separate, versioned step so you can attribute any movement in quality.

**Can I skip the shadow run if the eval diff looks clean?**
You can, and sometimes it is the right trade for a low-stakes internal tool. For anything customer-facing, understand what you are giving up: the eval set contains the inputs you thought of, and shadow traffic contains the ones you did not. Most of the surprises I have seen came from the second category.

**What if the provider is deprecating the model and I have no time?**
Then compress rather than skip. A hundred-case eval diff can be built in a day, and a 48-hour shadow run on 10% of traffic is far better than none. If the deadline is genuinely days away, at minimum ship behind a flag you can flip back, and keep a human watching output for the first few hours at each canary step.
