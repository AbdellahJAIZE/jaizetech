---
title: "LLM Hallucination in Production: The First-Hour Field Guide"
description: "A practical playbook for LLM hallucination production incidents: triage, root-cause taxonomy, same-day fixes, and lasting guardrails."
published: "2026-09-11"
tags: ["LLM hallucination", "AI in production", "RAG", "AI reliability", "incident response"]
ogImage: "/images/blog/llm-hallucination-in-production/cover.jpg"
primaryService: "hardening"
---
Your support inbox has a screenshot in it. The assistant told a customer their contract has a 30-day cancellation window. It has a 90-day window. The customer already acted on the 30. Someone has forwarded it to you with the subject line "??".

I have been on the receiving end of that email enough times to have a routine for it, and the routine is what this post is. It is not another piece about eval pipelines or retrieval architecture; I have written those. This is the field guide for the week an LLM hallucination in production actually embarrasses you: what to do in the first hour, how to tell a hallucination from a data bug wearing a hallucination costume, what you can ship today versus what needs real engineering, and what to say to the people asking questions.

The thing most teams get wrong is that they fix the one answer. They add a line to the system prompt, re-test the exact question, see a correct answer, and close the ticket. Two weeks later a different customer gets a different wrong answer and now the company thinks the feature cannot be trusted. Patching the response is triage. It is not the fix.

## The moment you find out: triage in the first hour

The first hour is about containing blast radius and preserving evidence, in that order. Do not start debugging yet.

**Preserve the trace.** Before anyone touches the prompt, pull the full trace for that conversation: the exact system prompt version that was live, the retrieved chunks (if RAG), the tool calls and their raw outputs, the model and its parameters, and the final response. If you cannot get all of that from your logs, write that down as finding number one; it will matter later. Prompts get edited in the panic, and then nobody can reproduce what the customer saw.

**Assess blast radius.** Query your logs for the same intent over the last 30 days. Not the same question, the same intent: anything touching cancellation windows, in my example. In my experience the first reported hallucination is rarely the first one that happened. Frequently it is the tenth; the other nine went to customers who did not complain. You need that number before you talk to anyone.

**Decide on the kill switch.** You should have a feature flag that swaps the AI answer for a "let me connect you with a person" fallback, scoped by topic or globally. If you do not have one, build one now, because it takes an hour and you will want it by lunchtime. Whether you flip it depends on what the answer touched: money, legal terms, health, safety, or anything with a deadline gets a topic-level kill until you understand it. A wrong restaurant recommendation does not.

**Assign one owner.** One engineer owns the incident, one person owns communication. Group debugging in a Slack thread with fourteen people produces fourteen half-theories and no reproduction.

## Is this LLM hallucination in production, or a retrieval bug in costume?

Here is the uncomfortable truth from my incident notes: most of the "hallucinations" I have been called in on were not the model inventing things. The model faithfully summarised a wrong or stale document, or it was never given the right document and did its best with nothing. Those are different bugs with different fixes, and calling everything a hallucination sends you down the wrong road for a week.

![LLM Hallucination in Production: The First-Hour Field Guide](/images/blog/llm-hallucination-in-production/1.jpg)

Sit down with the trace and answer three questions, in order.

**Was the correct information available to the model at all?** Look at the retrieved context. If the 90-day clause was not in it, you do not have a hallucination, you have a retrieval miss. The model was asked a question it had no grounds to answer and answered anyway; the second half of that is a prompt and guardrail problem, but the first half is retrieval. I covered the usual reasons in [why RAG breaks in production](/en/blog/rag-breaks-in-production): chunking that splits a clause from its heading, an embedding model that treats "cancellation" and "termination" as distant, a metadata filter that silently excluded the current contract version.

**Was the information available but wrong or stale?** Now look at the chunk itself. If it says 30 days, your model is innocent and your data pipeline is guilty. Old contract template still indexed next to the new one, a wiki page nobody retired, a PDF version from 2023 outranking the 2026 one because it has more inbound links. This is the most common case I see, and it is the one that gets misdiagnosed most, because the fix people reach for (prompt engineering) does nothing about it.

**Was the information available and correct, and the model contradicted it anyway?** Only now do you have a genuine hallucination. The model had the 90 days in context and said 30. That happens, and it happens more with long contexts, with contradictory chunks in the same window, with smaller models under aggressive cost pressure, and with prompts that ask the model to "be concise and confident."

A fourth category deserves its own line: **the tool lied.** If the agent called `get_contract_terms(customer_id)` and the API returned the wrong customer's terms, or a cached response, or an error the agent interpreted as an empty result, the model repeated a bad tool output. Check raw tool responses before you blame the model. Agents are excellent at making an upstream bug look like an AI bug.

Write down which of the four you have. The rest of the week depends on it.

## Same-day mitigations you can ship before the root-cause fix

Whatever the root cause, you can lower the risk today without pretending you have solved it. These are the mitigations I ship in the first afternoon, roughly in order of how often they help.

- **Topic-scoped fallback.** For the intent class that failed, route to a canned answer plus a human handoff. "Cancellation terms depend on your contract; I've flagged this for a colleague who will confirm within one business day." Boring, safe, and it buys you the week.
- **Force citations for factual claims.** Change the prompt so any number, date, or policy statement must be followed by a reference to the source chunk, and reject responses that make such claims without one. This is a cheap output check, a regex and a lookup, and it catches a surprising share of fabrications because a model that has to cite a source is far less likely to invent a figure.
- **Abstention instruction, tested.** Add an explicit "if the context does not contain the answer, say you do not know and offer the handoff" instruction. Then test it with ten questions that are not in your corpus. Most prompts already have this line and most models ignore it under a confident user; you need to check that yours actually abstains.
- **Pin the model version.** If you are on an alias like `gpt-4o` or `claude-sonnet-latest` rather than a dated snapshot, pin it now. I have seen a provider rollout change abstention behaviour overnight with no code change on the customer's side.
- **Lower temperature for factual routes.** Not a fix, but on factual Q&A there is no reason to be at 0.7 or 1.0. Drop it to 0 or 0.1 for those paths.

Note what is not on this list: rewriting the system prompt from scratch. That is the panic move, and it changes twenty things at once so you can no longer tell which one helped.

## The four root causes, and how to tell which one is yours

The triage step above told you which layer failed. Here is how each one actually gets fixed, and how long it realistically takes.

### Retrieval miss

The right document exists, the retriever did not surface it. Diagnose by running the failed query against your vector store directly and looking at the top 20, not the top 5. If the correct chunk is at rank 12, you have a ranking problem: add a reranker, or hybrid search with BM25, or both. If it is nowhere in the top 50, it is a chunking or embedding problem, and you re-chunk. Budget two to five days for the fix and its regression tests.

### Stale or conflicting data

Two versions of the truth in the index. Diagnose by searching for the wrong fact and seeing where it comes from. The fix is unglamorous: document lifecycle. Versioned sources, a retirement process, a metadata field for effective date that the retriever filters on. The engineering is a day or two; getting the business to agree on who owns document retirement is the actual work.

### Genuine model fabrication

Correct context, wrong answer. Diagnose by re-running the exact prompt and context ten times; if you get 30 days in three of ten runs, it is a real model-level failure. Fixes, in order of cost: shorten the context so the relevant clause is not buried, put the relevant chunk first (models attend to the start and end more than the middle), add a grounding verification step where a second, cheaper call checks each claim against the context, or move to a stronger model for that route. That last one has cost implications; I ran the numbers in [what production LLM features cost in 2026](/en/blog/cost-of-production-llm-2026), and a verification call on 5% of traffic is usually cheaper than a stronger model on 100%.

### Tool or upstream failure

The model faithfully repeated bad input. Diagnose from raw tool logs. Fix by treating tool outputs like untrusted user input: validate schemas, distinguish "empty result" from "error," and never let an agent fill in a value the tool failed to return. This is a plain software bug and it gets fixed like one.

## What "fixed" actually looks like (not just patching the one bad response)

You are done with the incident when four things are true, and not before.

First, the failing case is a permanent regression test. The exact question, the exact context, an assertion on the answer. It runs on every prompt change and every model change.

Second, so are its siblings. One failure implies a class. If cancellation windows failed, write fifteen tests across every contract term you care about: notice periods, renewal dates, price escalation clauses. In my experience, writing the siblings finds two more live bugs about half the time.

Third, you have a number. What percentage of factual answers in that intent class are grounded in the context? If you could not answer that before the incident, you could not have known you had a problem, and you will not know when the next one starts. This is the part of the fix that turns into the [continuous eval loop](/en/blog/llm-evaluation-production-continuous-eval) most teams never actually run.

Fourth, the trace you wished you had in hour one now exists for every request. Prompt version, model version, retrieved chunks with scores, tool calls, response. Retention long enough to reconstruct a complaint that arrives three weeks late.

If your fix was "we added a sentence to the prompt and it works now," you have none of these four and you are one model update away from doing this again.

## Building the guardrails that catch the next one before a user does

The incident response above is reactive by design. The point of the following week is to make the next one boring: caught by a monitor, not by a customer.

**Groundedness sampling in production.** Take a sample of live responses, a few percent is enough, and run an LLM-as-judge check: does every factual claim in this answer appear in the retrieved context? Log the score, alert on the trend. This costs a fraction of a cent per checked response and it is the single highest-value monitor I have added to any assistant.

**Claim-level output checks on high-risk routes.** For money, dates, legal terms: extract the claims, verify against the source system of record (not the vector store, the actual database), block or soften the answer on mismatch. Synchronous, in the request path, adds 300 to 800 ms. Worth it on the routes where a wrong answer costs more than a slow one.

**Prompt versioning with a diff review.** Every prompt change is a commit, runs the regression suite, and shows the before/after on the eval set. I have watched a well-meaning "make the tone warmer" edit reduce abstention by a third; without the diff nobody would have connected the two.

**Feedback capture that actually reaches an engineer.** Thumbs-down with a free text field, piped into the same trace store, reviewed weekly. Customers report hallucinations at a much higher rate than they report anything else; you just need to be listening.

**A drift alarm on model and retrieval.** Weekly re-run of the eval set against the pinned model and the current index. If groundedness drops two points, someone looks before customers do.

None of this is exotic. It is the same punchlist I described in [what actually breaks when AI hits production](/en/blog/what-breaks-in-ai-production), applied specifically to the failure mode that scares executives most.

## What to tell your team, your customer, and your boss

Three audiences, three different messages, and all three should be true.

**Your team:** what layer failed, in the four-way taxonomy above, and what the regression test looks like. Resist the blameless-postmortem theatre if the actual cause was that nobody owned document retirement; name the gap, not the person, and assign the ownership. Engineers respect precision more than diplomacy in these meetings.

**Your customer:** the correct answer, in writing, from a human, with an apology that does not explain how language models work. They do not care. What they want is to know the wrong answer will not cost them, and that a person confirmed the right one. If the wrong answer caused them to act, fix the consequence first and discuss the AI second. A sentence like "the assistant gave incorrect information and we have corrected it and added a check so this category of answer is verified" is enough.

**Your boss:** the blast-radius number from hour one, the root cause in one line, the same-day mitigation that is live, and the date the real fix ships with its regression tests. Then the sentence they actually need to hear: "this is the failure mode every production assistant has, and the fix is a monitoring and evaluation layer we did not have yet, not a decision about whether the feature works." Most executives are asking whether to kill the feature. The honest answer, almost always, is no, but only if the guardrails get built this time rather than next time.

The teams I have seen come out of an LLM-hallucination production incident stronger are the ones that treated it as the moment the feature became a real product, with the observability and tests a real product has. The ones that patched the prompt and moved on are the ones I met again three months later.

## Where this becomes an engagement

If your feature works but just produced an answer you cannot defend, and you need the evals, monitoring, prompt versioning, and output guardrails that make it not happen again, that is what [Production Hardening](/en/services) is: a three-to-six-week engagement that takes an AI feature from "works in dev, embarrasses us in prod" to a hardened deploy with a groundedness number you can show your board. If that is where you are this week, [get in touch](/en/contact) and we can start with the trace from the incident.
