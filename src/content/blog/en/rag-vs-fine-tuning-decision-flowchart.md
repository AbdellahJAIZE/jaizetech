---
title: "RAG vs fine-tuning: a 20-minute decision"
description: "How to choose between RAG and fine-tuning. A 20-minute decision flow, three cases where fine-tuning is wrong, and what hybrid really looks like."
published: "2026-04-29"
tags: ["RAG", "fine-tuning", "LLM", "architecture"]
ogImage: "/og-image.png"
primaryService: "rag-assistant"
---

Most "RAG vs fine-tuning" articles read like a Wikipedia diff. Two columns, pros and cons, no opinion, you walk away knowing the definitions and still not knowing what to build. This post is the opposite. I am going to give you a 20-minute decision flow with three confident outcomes, and I am going to tell you exactly when fine-tuning is the wrong answer (it usually is) and when RAG alone will not cut it.

I have built RAG systems in production for the last two and a half years on a hybrid Triton plus cloud platform, and a non-trivial part of my job has been talking clients out of fine-tuning when they did not need it. The pattern repeats often enough that a flowchart fits.

## Quick definitions, one paragraph each

**RAG** (retrieval-augmented generation) leaves the model alone. At inference time, you fetch relevant chunks of your data from a vector store (or a hybrid keyword plus vector store), stuff them into the prompt, and let the model reason over them. The model weights never change. You change what you put in front of it.

**Fine-tuning** updates the model weights on your data. You take a base model, feed it thousands of input-output examples, and the model learns to behave differently. After fine-tuning, the model itself is different. It does not need your data in the prompt to produce the new behaviour, because the behaviour is baked in.

That is the whole distinction. Most readers know this already. The interesting question is not "what are they", it is "which one, for what, and when".

## The 20-minute flowchart that decides for 90% of cases

Run through these five questions in order. Stop at the first one that gives you an answer.

```
Q1. Does your knowledge change more than once a quarter?
    YES  -> RAG. Stop here.
    NO   -> continue.

Q2. Is the desired output format or style the actual problem,
    not the knowledge?
    YES  -> Fine-tuning is on the table. Continue to Q3.
    NO   -> continue.

Q3. Do you have 10,000+ high-quality, labelled examples
    of the desired behaviour?
    NO   -> Do not fine-tune yet. Go back to RAG plus prompt engineering.
    YES  -> continue.

Q4. Is hallucination on facts unacceptable
    (legal, medical, finance, support over real customer data)?
    YES  -> RAG, with a real eval harness. Stop here.
    NO   -> continue.

Q5. Is the use case narrow and repetitive
    (classification, extraction, format-locked generation)?
    YES  -> Fine-tune a small model. This is one of the few good cases.
    NO   -> Default back to RAG. You probably do not need fine-tuning.
```

That is it. Five questions, twenty minutes if you are honest with yourself. The honesty part is where most teams stumble, because Q3 in particular has a high "we have data" failure rate. Having data is not the same as having 10,000 clean, labelled examples of the exact behaviour you want.

The reason this flow works is that the two techniques solve genuinely different problems. RAG is for "the model does not know my stuff". Fine-tuning is for "the model does not behave the way I need it to". When teams confuse these, they reach for the wrong tool, and they pay for it twice (once in money, once in months).

## Three use cases where fine-tuning is the wrong answer (and people still try)

### 1. Internal documentation Q&A

This one comes up almost every week. A team has a Confluence wiki, a few hundred PDFs, some Notion pages, and they want a chatbot that answers questions over all of it. Someone in the room says "we should fine-tune a model on our docs".

No, you should not. Three reasons.

First, your documentation changes. Someone updates the onboarding doc next Tuesday, and your fine-tuned model does not know. You would need to re-train every time, which is absurd. RAG picks up the new doc the moment it is indexed.

Second, you need citations. When the bot says "the deployment process is X", an engineer wants to click through to the source page. Fine-tuned models cannot cite. RAG can, because the source chunks are right there in the prompt.

Third, hallucination on internal facts is corrosive. If the bot confidently invents a deployment step, trust dies in a week. RAG with grounded answers and a "I do not know" fallback is much safer.

### 2. Customer support chatbot

Same shape, different domain. The team wants a support bot that handles tier-1 tickets. Someone proposes fine-tuning a foundation model on the historical ticket archive.

The knowledge in those tickets (product behaviour, known issues, refund policies) belongs in RAG, full stop. It changes constantly. The only thing that might justify a small fine-tune is **tone and format**, for example forcing the model to always reply in the brand voice with a specific opening and closing structure. Even that, in my experience, is solvable with a good system prompt and few-shot examples 80% of the time. Fine-tuning a foundation model on your tickets is expensive, slow, and gives you a model that is stale the day you ship it.

### 3. "We want our LLM to know about our company"

This is the version that comes from non-technical stakeholders, and it always means RAG. The intuition behind it is "the model should feel like it works for us", which is a product feeling, not a technical requirement. Put your company knowledge in a vector store, retrieve it on every query, and the model will feel like it knows you. It will also stay accurate, citable, and updatable.

If anyone in the room is still pushing for fine-tuning at this point, the question to ask is: "what specifically will the fine-tuned model do that RAG plus a strong system prompt cannot do?" If they cannot answer, the answer is RAG.

## Two cases where RAG alone is not enough

I am not anti fine-tuning. There are real cases. Here are two I have actually run into.

### 1. Output format is the product

Some outputs have a hard structure that the model must follow every single time. Legal contract clauses with specific numbering and cross-references. Medical report sections that map to a regulated template. Code generation in a niche internal DSL where the grammar matters and "almost right" is wrong.

For these, prompt engineering will get you to maybe 90% format adherence, which is not good enough when the consumer is another machine or a regulator. A small fine-tune on a few thousand correctly-formatted outputs gets you to 99-plus. The pattern is **fine-tune for format, RAG for facts**. The model learns the shape of the output. The facts that fill the shape come from retrieval.

### 2. Domain language so specialised that off-the-shelf embeddings retrieve nonsense

Standard embedding models are trained on general web text. They are great for most domains. They fall over in narrow technical domains where the same word means very different things, or where the domain vocabulary barely appears in the training data. Rare medical sub-specialties, specific patent law areas, certain industrial engineering domains.

If you index your docs and your top-5 retrievals are consistently irrelevant despite the query being clearly answered somewhere in the corpus, your embeddings are the bottleneck. The fix is either a fine-tuned embedding model or a domain-adapted base model, not fine-tuning the generator. Most teams never hit this. If you do, you will know, because retrieval quality will be visibly bad in your eval.

## What hybrid actually looks like (and why most teams should not bother)

Hybrid means: RAG for the knowledge, plus a small fine-tuned model for the format or tone of the output. In a clean implementation, the retrieval pipeline is unchanged, and the generator is your fine-tuned model instead of a base model.

It works. I have seen it work. I will also tell you that 80% of teams who think they need hybrid do not. The maintenance cost is the killer. You now have two systems to keep healthy: a retrieval pipeline (embeddings, index, chunking strategy, reranker) and a fine-tuning pipeline (training data curation, eval, re-training cadence, model versioning). Each one is a real engineering commitment. Doing both well is roughly double the work of doing one well.

The honest test for hybrid is this. You have shipped RAG. You have an eval harness with at least 100 representative cases. You can point at specific failure modes in the eval that are clearly format or tone problems, not knowledge problems. You have tried prompt engineering and few-shot to fix them and hit a ceiling. **Then** you consider hybrid. Not before.

If you have not shipped RAG yet and you are already planning the hybrid architecture, you are over-engineering. Stop.

## The eval question

Neither RAG nor fine-tuning works without evals. This is the unsexy part nobody wants to hear.

An eval is a set of representative inputs with expected behaviours, run on every change, scored automatically (or semi-automatically with an LLM judge that you have spot-checked). Without it, you are flying blind. You think your system got better, you ship, a user finds the regression, you roll back, repeat.

The order matters. Build the eval **before** you choose between RAG and fine-tuning. The eval will tell you what "good" looks like for your use case, and that definition is what makes the RAG vs fine-tuning question answerable. Without an eval, "is RAG good enough?" is unanswerable, because nobody can agree on what "good enough" means.

I will write a separate post on building a minimum-viable RAG eval. For now, the short version is: 30 to 100 real questions, expected answers or expected sources, run on every prompt change, fail loudly when scores drop.

## A practical first move

Start with RAG. Always.

If you are between the two and unsure, RAG is the safer bet for a first version. The reasons are concrete. RAG is faster to ship (days to a useful prototype, not weeks). RAG is cheaper to iterate (change the prompt, re-index, you are done). RAG fails in legible ways (you can read the retrieved chunks and see why the answer was wrong). And critically, if RAG turns out to be insufficient, your eval will tell you exactly which failure modes remain, and **that** is when you have a real basis for choosing fine-tuning.

The reverse order is much more expensive. If you start with fine-tuning, you spend weeks on data prep, you spend money on training runs, you ship something, and then you discover that the actual problem was knowledge freshness or citation, neither of which fine-tuning solves. You then build RAG anyway, on top of a fine-tuned model that is already drifting from your live data. You have paid twice.

So the rule, with all the caveats above already stated, is simple. Default to RAG. Use the flowchart to confirm. Only reach for fine-tuning when the flowchart points there clearly, and only consider hybrid when your shipped RAG plus your real eval tells you it is the next step.

If you want to see what production RAG looks like in practice, I have written about my [past work](/work) and the [services](/services) I offer around RAG and LLM architecture audits.

## A short close

If you are stuck between RAG and fine-tuning for a specific use case, a 15-minute call usually settles it. I have done this conversation enough times that the right answer tends to be obvious once we look at your actual data, your update cadence, and what "good" means for your users. Book one [here](/contact) and we can run your problem through the flowchart together.

## Related reading

- [CrewAI to LangGraph: a migration playbook](/blog/crewai-to-langgraph-migration-playbook) — taking your RAG agent from prototype to production
- [Build vs buy AI features: math for your CTO](/blog/build-vs-buy-ai-features) — when RAG is a buy decision and when it is a build decision
