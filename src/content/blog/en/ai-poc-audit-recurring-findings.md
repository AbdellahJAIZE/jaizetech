---
title: "AI POC Audit Findings: The 7 Gaps That Repeat Every Time"
description: "Seven AI POC audit findings that show up in almost every review, why demos hide them, and the fixes that actually hold up in production."
published: "2026-10-11"
tags: ["AI audit", "proof of concept", "LLM productie", "RAG", "AI betrouwbaarheid"]
ogImage: "/images/blog/ai-poc-audit-recurring-findings/cover.jpg"
primaryService: "ai-audit"
---
I pull up roughly the same punchlist every time I audit an AI proof of concept, and that bothered me for a while before I understood why. A document assistant for a Dutch insurer and a vision model counting parts on a conveyor have nothing in common technically. The **AI POC audit findings** still overlap by about two thirds.

The reason is not that engineers are careless. It is that a demo is optimised for a different outcome than a product. A demo has to convince someone in a meeting. To do that well you shrink the input set, skip the failure paths, hardcode the happy case, and pick the model that gives the best answer rather than the one you can afford at volume. Every one of those choices is correct for the demo and wrong for production, so the gaps cluster in the same places.

Below are the seven that come back most often, what each one actually looks like when you dig, and the fix I usually recommend. At the end there is a six-check version you can run yourself before paying anyone to run it for you.

## The demo was tested with ten documents, never ten thousand

This is the single most reliable finding. Someone built retrieval against a curated folder: ten contracts, twenty support tickets, a handful of PDFs that happen to be well structured. Retrieval looks excellent, because with ten documents almost any embedding model puts the right one in the top three. There is nothing to confuse it with.

Load the real corpus and two things break at once. First, near-duplicates appear. Five versions of the same policy document from different years, and the retriever has no concept of recency, so it confidently cites the 2019 version. Second, chunk-level noise starts winning. Headers, footers, boilerplate legal text and table-of-contents pages are semantically close to a lot of queries, and at scale there are thousands of them.

The fix is boring and it works: rebuild the index on the full corpus before you touch anything else, then measure recall on a set of real queries. Add metadata filters for document version and date, deduplicate at ingestion, and strip boilerplate in the parser rather than hoping the ranker ignores it. I wrote about the specific mechanics in [why RAG breaks in production](/en/blog/rag-breaks-in-production), because the failure modes are predictable enough to list.

The audit finding is rarely "retrieval is bad". It is "retrieval has never been evaluated at the size it will run at", which is a different and more fixable problem.

## The cost model assumes the demo's token counts

Most POC cost estimates are an extrapolation of one measurement: someone ran a representative query, looked at the token usage, multiplied by expected volume, and got a number that made the business case work.

![AI POC Audit Findings: The 7 Gaps That Repeat Every Time](/images/blog/ai-poc-audit-recurring-findings/1.jpg)

That number is almost always low, and the reasons are consistent. The demo query had a short context because retrieval returned three chunks; production returns eight because recall needed it. The demo had no conversation history; production carries six turns. The demo had no retries; production retries on malformed output, and a retry is a full repriced call. Agentic flows are worse, since a loop that averages four tool calls in testing will have a tail that averages fourteen on messy input, and the tail is where the money goes.

Then there is the part nobody models: the cheap path. In most production systems a meaningful share of requests should never reach the expensive model at all. Cached answers, deterministic routing, a small classifier in front. If the POC has no routing layer, the cost estimate is effectively "everything goes to the largest model forever", and the gap between that and a tuned system is large enough to change the build decision. The [five causes behind an LLM cost spike](/en/blog/llm-cost-spike-production) are each visible in a POC if you know to look.

Fix order: instrument token usage per request with p50 and p95, not an average. Then model cost against p95, because that is what your bill follows.

## There is no eval set, so "it got better" is a feeling

Ask a team how they know the last prompt change helped and you usually get some version of "we tried a few queries and it looked better". That is not a criticism of the team. Writing an eval set is unglamorous work that produces no visible progress, and in a POC phase nobody is rewarded for it.

The consequence shows up as soon as two people start changing prompts. Improvement on the queries you happen to test, regression on the ones you do not, and no way to tell the difference. I have seen a team spend three weeks oscillating between two prompt versions because each change fixed the complaint in front of them and broke something nobody was watching.

What I ask for in an audit is modest: 30 to 50 real examples with expected outcomes, drawn from actual user queries or actual documents, including the ones that failed. Not a benchmark. A regression net. It takes a day or two to assemble and it is the single highest-leverage thing a POC team can do before scaling. Pair it with [prompt versioning](/en/blog/prompt-versioning-regression-testing) so you can attribute a change in quality to a specific diff, and with [continuous eval](/en/blog/llm-evaluation-production-continuous-eval) once you have traffic.

Teams resist this because they expect to need a scoring framework. You need a list of inputs, expected outputs, and a script that runs them. Start there.

## One prompt is doing retrieval, reasoning and formatting at once

Open the repository of almost any working POC and you will find a single prompt of 60 to 200 lines that decides which context matters, reasons about the answer, enforces a tone, and emits JSON. It works. That is what makes it dangerous.

The problem is that you cannot debug it. When output quality drops, there is no way to tell whether the model retrieved the wrong thing, reasoned badly, or simply broke the schema because the reasoning got long and it ran out of patience with the format instructions. All three symptoms look identical from the outside: bad JSON, or a plausible wrong answer.

Splitting responsibilities is usually the fix. Retrieval and reranking in code, not in the prompt. Reasoning in one call with a clear objective. Formatting either in a second cheap call or, better, through the provider's structured output mode with a schema you validate. The reliability gain is real and the cost often drops, because the reasoning call no longer carries 80 lines of formatting rules in every request. [Structured output failures](/en/blog/llm-structured-output-failures-production) are the specific thing this prevents, and they are the bug least likely to be on anyone's dashboard.

There is a second version of this finding in agent POCs: one prompt holds the planning, the tool selection and the stop condition. That one fails louder. If nothing bounds the loop, see [the guardrails that stop a 340-call ticket](/en/blog/ai-agent-loop-guardrails-production).

## Nothing is defined for when the vendor has a bad day

Ask what happens when the model API returns 529s for eleven minutes. In a POC the honest answer is "the request fails" or, slightly worse, "we retry three times and then it fails". Nobody has decided what the product should do, because in a demo the API has never been down at an inconvenient moment.

This is a product decision disguised as an infrastructure one. For a document assistant, degrading to "retrieval worked, here are the three source passages, no summary" is often perfectly acceptable and much better than an error. For an automated decision in a workflow, the right answer might be to queue and process late. For a voice agent, a 30-second stall is a lost call and you need a fallback model warmed up. The engineering is straightforward once someone decides which of those applies. The audit finding is that nobody has.

The related gap is silent provider change rather than outage. A pinned model alias quietly moves, and output drifts without a deploy on your side. [Silent model updates](/en/blog/silent-model-updates-ai-feature) catch teams who have no eval set, which is exactly the overlap between this finding and the third one.

## Why AI POC audit findings repeat regardless of stack

Pull back from the individual items and the pattern is clean: every one of these is a place where the demo made a reasonable scoping decision and nobody wrote it down as a decision. Small corpus, one model, one prompt, no failure path, manual quality judgement. None of those are mistakes in a POC. They become mistakes the moment the POC is treated as a foundation rather than an experiment.

That is also why the remaining two findings are so common. Number six is that there is no observability at all, so the first production incident is diagnosed by reading code instead of traces. Number seven is that access control was never tested across tenants, because the demo had one customer's data in it. [Where multi-tenant RAG actually leaks](/en/blog/multi-tenant-ai-feature-data-leaks) covers that one properly, and it is the finding I most dislike delivering, because it is the one with legal consequences attached.

## The six checks to run before you call anyone

You can reproduce most of a readiness diagnosis yourself in an afternoon. Run these against your own demo:

1. **Scale the corpus.** Index the full document set, not the sample, and run twenty real queries. Note how often the right source is in the top five.
2. **Measure p95 tokens.** Log input and output tokens per request for a day of internal use. Multiply p95, not the average, by your expected volume.
3. **Write thirty examples.** Real inputs, expected outputs, including three that currently fail. Run them. That is your baseline.
4. **Count the jobs in your longest prompt.** If it is doing more than one of retrieval, reasoning or formatting, you have found your reliability ceiling.
5. **Kill the API key.** Point the app at an invalid endpoint and watch what the user sees. If the answer is a stack trace or a spinner, that is your failure design.
6. **Query as the wrong user.** Take a question that should only be answerable from tenant A's data and ask it while authenticated as tenant B.

If all six come back clean, your demo is in better shape than most and you probably do not need an external audit yet. If four of them surface something, you have a prioritisation problem rather than a knowledge problem, and the [four-axis fix priority framework](/en/blog/ai-poc-audit-priority-framework) is more useful to you than another list of risks. For a longer version of the self-test, the [15-check POC self-audit](/en/blog/ai-poc-self-audit-checklist) goes deeper on each item.

A one-week POC Audit exists to do this at a depth you cannot reach while also shipping features: full corpus retrieval measurement, a real cost model, the eval baseline written for you, and a 90-day plan that says what to fix in which order. If the self-test above already told you what is broken and you want a second pair of eyes on the sequencing, the [services page](/en/services) has the scope, and you can reach me through [contact](/en/contact).
