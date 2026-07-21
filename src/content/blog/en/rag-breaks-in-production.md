---
title: "Your RAG works in dev. Here's why it breaks in prod."
description: "A five-question RAG diagnostic. The four places retrieval breaks under real users. What context engineering actually means when your eval is honest."
published: "2026-05-01"
tags: ["RAG", "retrieval", "context engineering", "production AI"]
ogImage: "/og-image.png"
primaryService: "hardening"
---

Your RAG demo answered every question perfectly. You shipped. Two weeks in, your support inbox has the same complaint three times. "It told me X but the right answer is Y." You check the docs. The right answer is in the docs. You re-run your test set. Test set still passes.

This is the most common shipped-RAG failure pattern I see. The system works in dev because you built the eval set around questions you knew the answers to. Production users do not.

This post is the diagnostic I run on RAG systems that look fine and aren't. Five questions to ask, four common failure modes, and what context engineering actually means once you stop using it as a buzzword.

## The 5-question RAG diagnostic

Run these against your system. If you cannot answer "yes" to all five with evidence, your RAG has a quality gap.

**1. Are your eval questions written by people who do not know the answer in advance?**

If your eval set was built by the engineer who indexed the docs, you are scoring the system on its strongest possible inputs. Real users do not phrase queries the way you do. They use synonyms. They drop context. They ask compound questions. Get five non-engineers to write 30 questions each. That is your real eval set.

**2. Do you know your retrieval recall, separately from your answer quality?**

If your final answer is wrong, was the right context retrieved and the LLM ignored it? Or was the right context not retrieved at all? These are different failures with different fixes. Most teams measure end-to-end quality and have no way to separate the two. Add a retrieval-only metric that asks: "is the document that contains the answer in the top-k results?" Run it on every eval. A 70 percent retrieval recall is your ceiling for end-to-end correctness.

**3. Do you re-index on a schedule that matches how your docs actually change?**

If your customer success team updates the knowledge base daily and you re-index weekly, you are answering customer questions with week-old information half the time. Match the re-index cadence to the document churn rate.

**4. Can your system say "I do not have current information about that"?**

If the answer is no, your LLM will fabricate. Always. The most important eval question in any RAG eval set is one where the right answer is "I do not know". If your system answers that question confidently with hallucinated content, you have a calibration problem that no amount of prompt tweaking will fix.

**5. Do you log the top-k retrieved chunks for every production query?**

If you do not, you cannot debug failures. When a user complains, you need to see what context the LLM had at the moment it generated the wrong answer. Logging top-k chunks plus the final prompt is non-negotiable in a production RAG system. Store them for 30 to 90 days minimum.

## The 4 places retrieval breaks

Once you have the diagnostic running, here is what actually breaks under real load.

### Failure mode 1: chunk-size mismatch

Your docs are 2,000 words each. You chunked them at 512 tokens. Every chunk has half the context it needs to make sense on its own. Retrieval finds plausible matches but they do not contain the actual answer.

The fix is not "use bigger chunks". The fix is to chunk at the semantic boundary, not the token boundary. For Markdown docs, chunk at H2 sections. For PDFs, chunk at page boundaries with overlap. For tabular data, chunk by row group, never split a row. Match your chunking to the structure of the source document. Tokenisation is downstream of structure.

### Failure mode 2: embedding drift

You indexed with `text-embedding-3-small` six months ago. You upgraded the embedding model in your retrieval code last week. Your old index is now in a different embedding space than your new queries.

You will not notice this from end-to-end metrics for a while because most retrievals are "close enough". The drift shows up on edge-case queries where the difference between rank 1 and rank 5 matters.

The fix is to re-index when you change embedding models. Always. Never mix embedding-model versions in the same index. If re-indexing is expensive, version your indexes and route queries to the index that matches their embedding model.

### Failure mode 3: retrieval recall versus precision tradeoff misset

You set top-k to 3 because longer context is more expensive. Three is right for some queries and wrong for others. The wrong queries fail silently.

The fix is to set top-k based on query complexity, not as a global constant. A simple lookup ("what time does support close on weekends") needs top-k 1 or 2. A synthesis question ("compare our policy A versus policy B") needs top-k 6 to 10 because it needs both documents in context. Use a small classifier or a heuristic at the front to route to the right k.

A cheaper version: always use a higher k (say 8) and let the LLM ignore irrelevant chunks. This costs more tokens but recovers more recall. Tradeoff, not a free lunch.

### Failure mode 4: prompt context overflow

You retrieved 8 chunks at 800 tokens each. That is 6,400 tokens of context. Plus your system prompt at 1,500 tokens. Plus the user query. You are pushing 8,000-plus tokens before generation. The LLM ignores chunks 4 through 8 due to context-position recency bias.

This is the "lost in the middle" failure mode that has been documented in research since 2023 and still happens in production all the time. Models attend to the start and end of context windows. The middle gets less weight.

The fix is to put the most relevant retrieved chunk last, just before the user's query. Re-rank your top-k by relevance and order them descendingly. Sometimes also: shorten the system prompt to make room for retrieval. A 500-token system prompt is almost always enough.

## What "context engineering" actually means

"Context engineering" is the rising term in 2026 for what used to be called "prompt engineering" with retrieval bolted on. It is more honest because what you are actually doing is shaping the full context window the LLM sees, not just the human-written prompt.

Three things context engineering means in practice:

1. **Deciding what goes in the context window and in what order.** Not just "retrieve and stuff", but: which chunks, in what sequence, with what surrounding scaffolding.

2. **Deciding what does not go in.** The temptation to add more context always wins unless you push back. More context means worse attention, higher cost, slower latency. Subtract aggressively.

3. **Making the decision repeatable and testable.** The first two are useless if you cannot reproduce them and verify they work for the next query. This is where evals live.

If your team does not have at least one engineer whose job description includes some version of "context shape", you are doing prompt engineering and calling it context engineering. They are different skills. The first one is "write a clever prompt". The second one is "design the data pipeline that constructs every prompt at runtime".

## What to actually do this week

If you have a shipped RAG system and you are reading this thinking "I am one of these failure modes":

1. Add top-k chunk logging to your production system. One day of work. Pays off the first time a customer complains.
2. Build a retrieval-recall metric separately from answer quality. Half a day.
3. Audit your re-index cadence against your document churn. Half a day.
4. Write 20 eval questions about information you have explicitly not indexed. Verify your system says "I do not know" instead of fabricating. Two hours.

That is two days of work and it will surface 70 percent of the latent quality issues in any RAG system shipped in the last year.

If you want a structured outside read on your RAG, the [AI integration audit](/services) covers exactly this kind of system review. The output is a written report with the specific failure modes I found, ranked by impact, with the cheapest fix for each.

A working RAG demo and a working RAG product are two different things. The bridge between them is mostly retrieval discipline, eval honesty, and the willingness to log everything until you can prove the system does what you think it does.

Related reading: [RAG vs fine-tuning decision flowchart](/blog/rag-vs-fine-tuning-decision-flowchart) covers the upstream "should we even be doing RAG" question. [What breaks in AI production](/blog/what-breaks-in-ai-production) covers the broader production failure landscape.
