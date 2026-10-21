---
title: "Why LLM Non-Determinism in Production Isn't Just Temperature"
description: "Temperature zero doesn't fix LLM non-determinism production teams see. Learn the real variance sources and how to measure consistency correctly."
published: "2026-10-21"
tags: ["LLM non-determinism", "production AI", "RAG", "AI reliability", "eval testing"]
ogImage: "/images/blog/llm-non-determinism-production/cover.jpg"
primaryService: "hardening"
---
The metric that settles this argument is answer agreement rate: fix an input, run it N times against the live system, count how many semantically distinct answers come back. With N=10 against a production RAG feature, that count is almost never 1. LLM non-determinism in production shows up as a long tail. Most questions wobble only in wording, a few change their actual substance between runs, and those few are what stakeholders are reacting to when they start asking whether the feature is broken.

The reason this is hard to debug is that it is not one bug. It is four or five independent variance sources stacked on top of each other, and only some of them are yours to remove. Most teams reach for the temperature dial first, because it is the knob they know about, then discover it does not do the whole job and start rewriting the prompt. Prompt edits usually relocate the variance rather than reduce it.

Here is what temperature actually controls, where the rest of the variance enters, and how to measure consistency so that you can tell ordinary noise from a defect worth paging someone about.

## Temperature zero buys less determinism than the docs imply

At temperature 0 the sampler stops sampling. It takes the argmax over the logits at every step, which means the model emits its single highest-probability token each time instead of drawing from a distribution. That removes sampling noise, and it is worth doing when you want stability. It does not make the forward pass itself reproducible.

Three things still move underneath you:

- **Batching changes the arithmetic.** Your request is batched on the provider's GPUs with other people's requests. Floating point addition is not associative, so the reduction order inside a matmul or a layernorm changes the last bits of the result depending on how the batch is shaped. Batch shape depends on concurrent traffic, which you do not control. This is the core of what the inference community now calls batch invariance, and most serving stacks do not have it.
- **Near-ties flip.** If the top two tokens sit within a rounding error of each other, a last-bit difference picks a different word. Because generation is autoregressive, one flipped token at position 40 can send the rest of the answer down a different path. Small numeric noise, large textual consequence.
- **Routing and caching add their own paths.** Sparse mixture-of-experts models route tokens to experts with capacity limits that depend on batch composition. Speculative decoding and prefix caching introduce further code paths that are not bit-identical to the unaccelerated one.

The `seed` parameter on the major APIs is documented as best effort for exactly this reason, and the accompanying system fingerprint exists to tell you when the backend changed. Treating temperature zero LLM determinism as a guarantee is the assumption that gets written into test suites and then quietly breaks them.

Self-hosting on fixed hardware with a fixed batch size gets you much closer, which is one real argument in favour of [on-prem inference](/en/blog/on-prem-llm-hosting-netherlands) for workloads that need reproducible output. It is not a reason on its own, but it belongs in the column.

## The other sources of LLM non-determinism in production

Decoder variance is the part people talk about and usually the smallest contributor. In the systems I have hardened, the bigger swings come from the fact that the model is not being asked the same question twice.

![Why LLM Non-Determinism in Production Isn't Just Temperature](/images/blog/llm-non-determinism-production/1.jpg)

### Retrieval order is rarely stable

RAG retrieval variance is the most common culprit and the easiest to miss, because the retrieval step logs a successful 200 and moves on. Approximate nearest neighbour indexes such as HNSW are, by design, approximate: graph traversal depends on entry points and on `ef_search`, and concurrent writes change the graph. Scores tie, and if your sort is not stable with an explicit tiebreaker on document ID, two chunks swap places. Sharded search merges results in whatever order the shards answer.

Swapping chunk 3 and chunk 4 sounds harmless until you remember that position in context carries weight. Material at the top and bottom of a long context gets attended to differently than material in the middle, so reordering the same five chunks can change which fact the model decides to lead with. If your retrieval layer is new to you, the failure modes are catalogued in [why RAG breaks in prod](/en/blog/rag-breaks-in-production).

### The prompt is not the prompt you think it is

Count everything that gets interpolated into the final rendered string on each call. The current date. A user profile that was updated this morning. Conversation history that gets truncated when it crosses a token threshold, meaning the request on message 11 has a different shape than the request on message 10. Tool schemas assembled from a registry whose iteration order is not pinned. Any of these produce legitimately different inputs, and therefore legitimately different outputs.

### Parallel calls race

Agents that fan out to several tools and merge the results are inherently order-sensitive unless you force the order. If you append results as they arrive instead of reassembling them into a fixed slot order, the context differs run to run based on which API was fast that second. Partial failures and retries make it worse: a run where the third tool timed out and got retried carries extra observations into the next step.

### The model changed and nobody told you

Aliases like `gpt-4o` or `claude-sonnet-latest` point at snapshots, and snapshots move. A feature that was consistent in September can start varying in October without a single commit on your side. This deserves its own treatment and gets it in [silent model updates](/en/blog/silent-model-updates-ai-feature); the short version is to pin snapshot IDs and log the fingerprint on every call.

## Paraphrase variance and contradiction variance are different incidents

Not all non-deterministic AI output is a problem, and conflating the two kinds is why these conversations go in circles. Two answers that say the same thing in different words are fine for a chat surface. Two answers that disagree on a number, a date, an eligibility decision, or whether the document even covers the question are a defect, whatever the wording looks like.

So classify variance at the claim level, not the string level. For each run, extract the load-bearing content: the figures cited, the source documents referenced, the yes/no verdict, the fields in the structured payload. Then compare those. A feature that paraphrases freely but returns the same five claims and the same citations every time is consistent in the only sense that matters to a user. A feature that returns identical prose except that the amount changes from €4,200 to €4,800 is broken, and a string-diff test will score it as a 97% match.

There is also a third category that is neither noise nor a bug: the question was ambiguous and the model is picking a different valid reading each time. "What is our notice period?" against a document set with three contract templates has several correct answers. No amount of decoder pinning fixes that. The fix is disambiguation in the product, or scoping the retrieval to one contract before the question is answered.

## Measuring consistency as its own axis

Accuracy evals do not catch this. Run each eval question once, score it against a reference, and a question that is right 6 times out of 10 looks like a pass or a fail depending on which run you happened to record. Consistency needs its own measurement, and the shape of it is simple:
for each eval item:
    run N times (N = 5 for a cheap gate, 20 when investigating)
    extract claims / fields / citations from each output
    agreement = share of run pairs that agree on the load-bearing content
report: mean agreement, worst-item agreement, list of items below threshold

Two things make this useful rather than decorative. First, record the full inputs alongside the output: rendered prompt, retrieved document IDs in order, model snapshot, fingerprint. Without that you cannot tell whether a divergent run saw different context or just decoded differently, which is the difference between a retrieval fix and a sampling fix. Second, gate on worst-item agreement, not the mean. The mean hides the three questions that actually generate support tickets.

Then put it in CI next to your prompt tests. Variance is a regression target like latency: a prompt edit that raises mean accuracy by two points while halving agreement on your top ten questions is not an improvement, and you will only know that if both numbers are in the same report. This is the part teams skip, and it is the reason I keep arguing for a [continuous eval loop](/en/blog/llm-evaluation-production-continuous-eval) rather than a one-off benchmark, with [prompt versioning](/en/blog/prompt-versioning-regression-testing) underneath so you can attribute a variance jump to the change that caused it. Retrieval gets its own numbers in [RAG evaluation metrics](/en/blog/rag-evaluation-metrics-production).

## What you engineer away, and what the interface absorbs

Removable with engineering work:

- Pin model snapshots and alert on fingerprint changes.
- Set temperature 0 and top_p 1 for anything factual or extractive, and pass a seed even though it is best effort.
- Make retrieval deterministic: stable sort with an explicit tiebreaker, fixed `ef_search`, fixed chunk ordering into the prompt, and a frozen index snapshot for eval runs.
- Canonicalize context assembly: fixed slot order for tool results, sorted keys, explicit truncation rules instead of threshold-triggered ones.
- Cache the answer against a hash of the full rendered input. This is the cheapest win available. Most "it gave a different answer yesterday" complaints come from a user refreshing a page that re-ran the model instead of showing the stored result.
- Move anything that is arithmetic or a lookup out of the model. A feature that asks an LLM to total invoice lines will vary; SQL will not. That trade is worth revisiting more often than teams do, and I have [made that argument at length](/en/blog/ai-feature-that-should-have-been-sql-query).

Not removable, so design for it: ambiguous questions, genuinely multi-source answers, and free-text generation where paraphrase is the point. Store and display the answer that was given rather than regenerating it, show the sources used so a user can see why two answers differ, keep an audit record of the exact text served, and make regeneration an explicit action instead of a side effect of navigation.

## The non-fix

The pattern I see most often is a team that drops temperature to 0, watches variance fall by maybe a third, declares the issue addressed, and keeps shipping. Then a user screenshots two contradictory answers in a Slack channel with a CFO in it. The decoder was never the main source, nobody instrumented the retrieval layer, and there is no number anywhere that would have shown the problem getting worse. Lowering the temperature is a reasonable first step and a poor stopping point. Without [observability on the inputs](/en/blog/llm-observability-production-monitoring) you are tuning something you cannot see.

## Questions that come up on these calls

### Does passing a seed make the output deterministic?

No. It removes sampling randomness, which temperature 0 already does, and it does nothing about batch-dependent floating point behaviour on the provider's side. Both OpenAI and Anthropic document their reproducibility as best effort. Use it, log the returned fingerprint, and do not build a test suite that assumes byte-identical output.

### Is temperature 0 bad for answer quality?

For extraction, classification, structured output, and grounded question answering, greedy decoding is usually the right default and I treat anything else as a choice that needs justifying. For drafting, brainstorming, or copy generation, a higher temperature produces better results and consistency is not what you want there anyway. The mistake is applying one setting across a feature that does both.

### How many runs do I need to measure LLM output consistency?

Five runs per eval item is enough to catch the obviously unstable questions and cheap enough to run on every prompt change. When you are investigating a specific complaint, go to 20 runs on that one input, because the contradictions that generate tickets are often a one-in-ten event that five runs will miss.

### Will self-hosting the model fix it?

It fixes a slice of it. With fixed hardware, a pinned engine version, and controlled batch sizes you can get very close to bit-reproducible inference, and you remove silent model updates entirely. It does nothing for retrieval ordering, context assembly, parallel tool races, or ambiguous inputs, which in my experience account for most of the variance users actually notice.

### Can I just show users a disclaimer that answers may vary?

You can, and it buys nothing when the two answers contradict each other on a number someone is about to act on. The useful version is showing the sources behind the answer and storing what was served, so that a disagreement becomes inspectable instead of mysterious.

Variance that nobody measures is the kind of defect that gets found by a customer rather than a test. A Production Hardening engagement (three to six weeks) is built for this: an eval set that scores consistency as its own axis alongside accuracy, prompt versioning and pinned models so changes are attributable, and monitoring that surfaces drift before it reaches a support queue. The scope is on the [services page](/en/services), and if the same question is already coming back differently on different days, [tell me what you are seeing](/en/contact).
