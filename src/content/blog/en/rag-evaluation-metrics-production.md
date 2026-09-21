---
title: "RAG Evaluation Metrics: Retrieval, Faithfulness, and Ship Gates"
description: "A practical guide to RAG evaluation metrics: recall, MRR, faithfulness, judge pitfalls, golden sets, launch thresholds, and CI gates."
published: "2026-09-21"
tags: ["RAG", "LLM evaluation", "retrieval", "AI engineering", "CI/CD"]
ogImage: "/images/blog/rag-evaluation-metrics-production/cover.jpg"
primaryService: "hardening"
---
Your RAG assistant answers fluently. The founder demoed it to the board, the first twenty users said "wow", and Slack has a screenshot of it summarising a 40-page policy document in three sentences. Then somebody asks the question that stops the room: "How do we know it's right?" Nobody has a number, because nobody picked RAG evaluation metrics before building.

I get called in at exactly this point, usually two weeks before a planned launch or two weeks after a quiet one. The team has a system that works on vibes and a backlog of "it got this one wrong" tickets that nobody can turn into a priority. What is missing is not a better model. It is a handful of metrics that predict which questions will fail in production, a small golden set to compute them against, and a pass/fail line a release can be held to.

This is the metric-by-metric version: what to measure on the retrieval side, what to measure on the generation side, how to build the eval set in days rather than months, where LLM-as-judge scoring quietly lies, what "good enough" is as a number, and how to wire it into CI so the next chunking change cannot regress silently.

## The moment: your RAG demo answers well, but nobody can say if it's good enough to ship

The pattern repeats. A RAG system is built in three weeks, tested by the people who built it on the questions they thought of, and judged by whether the answers read well. Reading well is the one thing a modern LLM does unconditionally. It reads well when the retrieved context is perfect, and it reads exactly as well when the retriever returned three irrelevant chunks and the model filled the gap from its own weights.

So the demo tells you almost nothing about production. I covered the runtime failure modes in [why RAG works in dev and breaks in prod](/en/blog/rag-breaks-in-production): corpus growth, chunk boundaries, query drift, stale indexes. Every one of those is invisible in a demo and every one shows up as a confident wrong answer. The only way to see them before your users do is to measure retrieval and generation separately, on a fixed set of questions, every time something changes.

## Why "it sounds right" is not one of the RAG evaluation metrics

A metric has three properties: it is computed the same way every time, it moves when the system gets worse, and it points at the component that caused the change. "Sounds right" has none of these. It is computed by whoever happens to be reading, it does not move until the error is embarrassing, and it cannot tell a retrieval failure from a generation failure.

![RAG Evaluation Metrics: Retrieval, Faithfulness, and Ship Gates](/images/blog/rag-evaluation-metrics-production/1.jpg)

That last distinction is the whole game. In my experience roughly two-thirds of wrong RAG answers are retrieval failures: the right passage was never in the context window, so the model refused, guessed, or answered a neighbouring question. The remaining third are generation failures: the right passage was there and the model contradicted it, ignored it, or added a detail it does not contain. These need different fixes. Retrieval failures are fixed with chunking, embedding models, hybrid search, reranking, metadata filters. Generation failures are fixed with prompts, model choice, citation formatting, refusal rules. If your only signal is "the answer was wrong", you will spend a week tuning the prompt for a problem that lives in the chunker. I have watched teams do exactly that.

So the first move is always the same: split the metrics into two layers, score them independently, and only then look at the end-to-end answer.

## Retrieval metrics: precision, recall, and MRR

Retrieval evaluation asks one question: for this query, did the right chunks come back, and how high up? Three numbers, computed at the `k` you actually pass to the model, not at a flattering `k=50`.

- **Recall@k**: of the chunks that contain the answer, what fraction appeared in the top `k`? This is the metric that predicts wrong answers. If recall@5 is 0.6, then for 40% of questions the model is working without the evidence it needs, and it will answer anyway.
- **Precision@k**: of the `k` chunks returned, what fraction were relevant? Low precision means the model is reading noise, which costs tokens, adds latency, and in longer contexts measurably degrades answers because the relevant passage is buried.
- **MRR (mean reciprocal rank)**: on average, how high did the first relevant chunk land? An MRR of 0.5 means the first useful passage is typically in position two. It matters more than people think, because most generation prompts weight earlier context more heavily whether you intend it or not.

Compute these at `k=3`, `k=5` and `k=10` and watch the curve. A system with recall@10 of 0.9 but recall@3 of 0.5 does not have a retrieval problem, it has a ranking problem, and a cross-encoder reranker will fix it in an afternoon. A system with recall@10 of 0.55 has a chunking or embedding problem and no reranker will save it.

### The retrieval golden set without months of labeling

Teams skip retrieval measurement because they think they need a labeled corpus. They need 100–300 question-to-chunk pairs, and there is a fast way to get them.

Sample 150 chunks from your real corpus, stratified across document types so you are not testing only the well-formatted PDFs. For each chunk, have an LLM generate two or three questions that this chunk, and ideally only this chunk, answers. Now you have queries with a known relevant chunk ID. Run them through your retriever and compute recall and MRR. This takes one day, script included.

Two warnings. Synthetic questions are phrased the way a model phrases them, which is cleaner than the way your users type, so the numbers run optimistic by ten to fifteen points in my experience. And a chunk that answers its own generated question is close to a tautology for lexical search. Both have the same fix: replace the synthetic set with real user queries as soon as you have logs, and keep the synthetic set as a regression floor.

## Generation metrics: faithfulness, groundedness, and where LLM-as-judge lies

Once the right context is retrieved, the second layer asks whether the model used it honestly. Three metrics, each catching a specific failure.

- **Faithfulness**: every claim in the answer is supported by the retrieved context. Split the answer into atomic statements and check each against the chunks. This is the anti-hallucination metric. Faithfulness of 0.85 means 15% of statements have no support in the evidence, which is a number you can put in front of a compliance lead.
- **Groundedness / context utilisation**: did the answer actually use the relevant chunk, or did it answer from parametric memory while the right passage sat unused? This catches the subtle case where retrieval is fine, the answer is even correct, and the system is still not doing what you think. It breaks the day the corpus disagrees with the model's training data.
- **Answer relevance**: does the answer address the question asked, rather than a nearby question the context happened to answer better? RAG systems drift toward answering "what the documents say" instead of "what the user asked".

All three are scored by an LLM judge in practice; there is no other way to score free text at volume. The judge lies in three predictable ways.

**It rewards length and confidence.** An answer that says more, with more structure, scores higher on relevance even when it says more wrong things. Fix: score faithfulness per claim, not per answer, so extra claims cost points rather than earn them.

**It agrees with itself.** A judge from the same model family as the generator shares its blind spots and rates its errors as reasonable. Fix: judge with a different provider than you generate with, and calibrate against 50 human-labeled examples first. If judge and human agree below roughly 80% on your own data, the scores are noise.

**It cannot see what is missing.** The judge sees the answer and the context, not the correct answer the system failed to give. Faithfulness can be 1.0 on an answer that omits the one caveat that mattered. Fix: for questions where completeness matters (pricing, eligibility, safety), add a reference answer and a separate "covers the required points" check. That is the one place where a small amount of human-written ground truth pays for itself many times over.

I covered first-hour triage of a live incident in [the hallucination field guide](/en/blog/llm-hallucination-in-production). The metrics above are what stop the incident from being the first time you find out.

## Building the eval set: how many examples, where they come from, who labels them

"How big does the golden set need to be?" Smaller than you fear, more diverse than you have.

- **Size**: 150–300 questions detects a five-point regression with reasonable confidence. Below 100, metrics move on noise. Above 500, labeling cost outpaces information gain unless distinct user segments need separate slices.
- **Sources**, in order of value: real user queries from logs (the thumbs-down ones are gold), questions the support team already answers by hand, questions the domain expert considers hard, and synthetic questions to fill coverage gaps. No logs yet? Spend two hours with whoever answers these questions by email today. They will give you fifty in one sitting, including the ambiguous ones.
- **Slices**: tag every question with document type, topic, and difficulty. Aggregates hide failures. A system at 0.85 overall can sit at 0.55 on the one document category sales actually cares about.
- **Who labels**: relevant-chunk labels can come from the synthetic trick, verified by a spot check. Reference answers and completeness criteria must come from a domain expert, roughly two days of their time for 200 questions. Do not let an engineer write the "correct" answer to a tax question.
- **Refresh**: rotate 10–20% of the set monthly from fresh logs; old questions stay as the regression floor. A golden set that never changes measures the past.

This is the RAG-specific instance of the loop in [the continuous eval pipeline nobody runs](/en/blog/llm-evaluation-production-continuous-eval). The difference is two layers with a hard boundary between them, and a golden set that carries chunk IDs, not just answers.

## Thresholds: what score is good enough to launch, and what blocks a release

Nobody wants to commit to a number, so here are the starting lines I actually use. They are not benchmarks; they are the points below which I have seen systems produce enough wrong answers that users stop trusting them.

- **Recall@5 below 0.75**: do not launch. A quarter of questions are answered without evidence. Fix retrieval first; nothing downstream will help.
- **Recall@5 between 0.75 and 0.85**: launchable for internal or low-stakes use with a visible "I could not find this" refusal path. Not for customer-facing anything where the answer has consequences.
- **Recall@5 above 0.85 and MRR above 0.7**: retrieval is not your problem. Move to generation.
- **Faithfulness below 0.9**: blocks release for any external use. One unsupported claim in ten is a hallucination complaint every day at modest traffic.
- **Faithfulness above 0.95, answer relevance above 0.85**: ship, and measure the rest in production.

Two rules matter more than the absolute numbers. First, **no slice may drop more than 5 points from the previous release**, even if the aggregate improves. An embedding swap that lifts overall recall by three points and drops the contracts slice by twelve is a regression, and it will be discovered by exactly the users who matter most. Second, **any change to chunking, embedding model, reranker, prompt, or generation model triggers the full run**. There is no small change in a RAG pipeline; I have seen a chunk-overlap tweak from 50 to 100 tokens move recall@5 by nine points in either direction depending on the corpus.

If you are still upstream of all this, deciding whether RAG is even the right architecture, the [RAG vs fine-tuning decision](/en/blog/rag-vs-fine-tuning-decision-flowchart) comes first. These thresholds assume you made that call and are now trying to ship what you built.

## Wiring RAG evaluation into CI so a retrieval change can't ship silently

Metrics are useless in a notebook one engineer runs when they remember. The point is that a pull request touching the chunker gets a red check, and the reviewer sees "recall@5: 0.84 → 0.71 on the invoices slice" before merging.

The workflow is simpler than it sounds. A `rag-eval.yml` in your CI config, triggered on the paths that matter:

yaml
on:
  pull_request:
    paths:
      - "ingest/**"        # chunking, parsing, metadata
      - "retrieval/**"     # embeddings, hybrid search, reranker
      - "prompts/**"       # generation prompts, versioned
      - "eval/golden/**"   # the eval set itself

jobs:
  rag-eval:
    runs-on: ubuntu-latest
    steps:
      - run: python -m eval.retrieval --golden eval/golden/v3.jsonl --k 3 5 10
      - run: python -m eval.generation --golden eval/golden/v3.jsonl --judge claude --sample 100
      - run: python -m eval.gate --baseline main --max-slice-drop 0.05 --min-recall5 0.80 --min-faithfulness 0.90

What makes this work in practice rather than on paper:

- **Retrieval eval runs on every PR and is cheap.** No LLM calls, just embedding queries against a frozen index snapshot. A 300-question set runs in under a minute. Never skip it.
- **Generation eval runs on a sample.** Judging 300 answers with a strong model costs real money and minutes; sample 100 on PRs, run the full set nightly and before releases. Pin the judge model version, because a judge that silently upgrades moves your scores without anything in your system changing.
- **The gate compares against `main`, not against a fixed number alone.** Absolute thresholds catch disasters; relative drops per slice catch the slow bleed.
- **The index is versioned with the code.** If the eval runs against whatever the vector store holds today, you are measuring data drift, not the effect of the change. Snapshot it.
- **Prompt changes go through the same gate.** Most teams miss this because prompts feel like copy rather than code. They are code. I wrote up the mechanics in [prompt versioning and regression testing](/en/blog/prompt-versioning-regression-testing); the RAG eval is the test suite that post assumes you have.

Once this is in place, the team's conversation changes. "I think the new embedding model is better" becomes "recall@5 went from 0.81 to 0.88, MRR from 0.66 to 0.74, no slice dropped, faithfulness unchanged". That sentence is what a launch decision should be built on, and it takes roughly a week to reach the point where your team can say it. The metrics, the golden set, the CI gate, and a dashboard showing the same numbers on production traffic are the hardening layer most RAG builds skip; the rest of that layer is listed on [the services page](/en/services).

## Where this becomes an engagement

If your RAG assistant is live or about to be, and the honest answer to "is retrieval good enough?" is a shrug, this is the [Production Hardening](/en/services) engagement: three to six weeks in which I build the golden set with your domain expert, stand up retrieval and generation evals with calibrated judges, set release thresholds per slice, wire the gate into your CI, and put the same metrics on a production dashboard so regressions are seen before users report them. If that is the missing piece, [get in touch](/en/contact) and we can look at your numbers together.
