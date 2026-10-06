---
title: "Multi-Tenant AI Data Isolation: Where RAG Actually Leaks"
description: "Row-level security doesn't cover your AI stack. Here's where multi-tenant AI data isolation really breaks—vector stores, caches, prompts, traces—and how to fix it."
published: "2026-10-06"
tags: ["multi-tenant AI", "data isolation", "RAG security", "LLM observability", "SaaS architecture"]
ogImage: "/images/blog/multi-tenant-ai-feature-data-leaks/cover.jpg"
primaryService: "hardening"
---
The database has row-level security. Every API handler checks `tenant_id`. Someone reviewed it, signed it off, and moved on. Then the team shipped an AI assistant on top of that same data, and at least two of the new paths customer content can travel now bypass the database layer entirely. **Multi-tenant AI data isolation** is not the problem you already solved in your ORM. It is a separate problem with its own surfaces: a vector index, a cache, a system prompt, a trace viewer, and a training set.

I get called in for this at a predictable moment. Customer one has been live for a few months and everything is fine. Customer two signs, customer three is in the pipeline, and someone in the security review asks the obvious question: can customer two's assistant ever surface customer one's data? The honest answer from the engineering side is usually "it shouldn't," which is not the same answer and everybody in the room knows it.

What follows is the checklist I work through, in the order the leaks actually happen.

## "It's just a prompt" is where the reasoning stops

The reason cross-tenant leakage in AI features gets underestimated is that the feature looks stateless. A request comes in, you build a prompt, you call a model, you return text. No new tables, no new joins, nothing that shows up in a schema review.

But a RAG assistant or an agent is not stateless. It writes. It writes embeddings into a shared index, conversation summaries into a memory store, request and response bodies into a trace, normalized queries into a cache, and sometimes curated examples into a prompt template that every tenant then shares. Each of those writes is a new copy of customer data living outside the boundary your database enforces, in a store that often has no concept of tenant at all.

The second reason is ownership. Row-level security was set up by whoever owned the data layer. The vector store was spun up by whoever was prototyping the AI feature, frequently in a hurry, frequently with one customer's documents in it because there was only one customer. That index then went to production without anyone revisiting the assumption it was built under.

## The four places multi-tenant AI data isolation actually fails

Across the audits I have run, the leak is in one of four layers. The distribution is not even. Retrieval and observability account for most of what I find.

![Multi-Tenant AI Data Isolation: Where RAG Actually Leaks](/images/blog/multi-tenant-ai-feature-data-leaks/1.jpg)

**1. Retrieval.** Vector store tenant isolation is usually implemented as a metadata filter, and metadata filters are easy to get subtly wrong. Three failure modes I keep seeing. The filter is applied after retrieval rather than as a pre-filter, so you fetch `top_k = 20` across all tenants, drop the foreign ones, and ship whatever survives. Hybrid search is the classic second case: the dense leg carries the filter, the BM25 or keyword leg was added later by someone else and does not. And reindexing jobs, which tend to be written as scripts rather than as application code, often rebuild vectors without carrying the tenant field forward at all, so your filter silently matches nothing or matches everything depending on how your store handles a missing key.

**2. The prompt.** Shared system prompt risk comes in two flavours. The first is few-shot examples lifted from real customer tickets during prototyping and never replaced with synthetic ones. Customer A's escalation about a specific invoice dispute becomes a permanent example in the prompt every tenant receives, and a sufficiently curious user can get the model to recite it. The second is caching. If you run a semantic cache in front of the model, keyed on a normalized question string, then two tenants asking "what is our refund policy for enterprise plans" hit the same entry and the second one gets the first one's answer. I have seen this exact key scheme in production more than once, because it tests beautifully with one customer.

**3. The tool and credential layer.** This is the quiet one. When an agent calls a tool, what identity does the tool run as? In a lot of implementations the answer is a service account with broad read access, because propagating the end user's token through a tool-calling loop is annoying and the prototype needed to work. Your database still has row-level security. The agent is just authenticated as a role that is exempt from it. Nothing in the SQL layer is broken, and the isolation is gone anyway.

**4. Everything downstream.** Traces, logs, eval sets, and fine-tunes. A trace in your LLM observability tool contains the full retrieved context and the full response, which is to say customer content, sitting in a project that your whole engineering team can read and that your support engineers sometimes get access to during an incident. Eval datasets get built from real production traffic, then shared with a contractor or pasted into a model provider's playground. And if anyone fine-tuned on pooled tenant data, that is not a leak you can patch, because the data is in the weights.

## A copilot that answered Customer B with Customer A's tickets

Here is a hypothetical that matches the shape of what I find, assembled from the patterns above rather than from any one client.

A B2B SaaS company builds a support copilot. It retrieves from the customer's own historical tickets and knowledge base and drafts a reply for the agent. Customer A, a logistics firm, goes live first. Six thousand tickets indexed, everyone happy.

Customer B onboards four months later. The team adds a `tenant_id` field to the vector store metadata and a filter in the retrieval call. They test it: ask Customer B's copilot a Customer-A-specific question, get nothing back. Isolation confirmed, ship it.

Three things were true that the test did not catch. Customer A's six thousand tickets were indexed before the `tenant_id` field existed, so those vectors have no tenant key. The store treats a missing key as not matching the filter, which is why the test passed. Then a reindex job runs a month later to upgrade the embedding model, and that job writes `tenant_id: null` explicitly rather than omitting it. Now the filter semantics change, because `null` compares differently than absent in this store. Meanwhile the drafting prompt still carries two few-shot examples taken from Customer A's tickets, including a named consignee and a claim amount.

Nobody notices for weeks, because the leak does not produce an error. It produces a slightly better answer. A support agent at Customer B gets a draft reply that references a shipping exception process they do not have, assumes it is a hallucination, edits it out, and moves on. That is the thing about cross-tenant data leakage in AI features: the failure mode is indistinguishable from the failure mode everyone already expects. Your users have been trained to interpret wrong content as model error. Some of it is not. I have written separately about why [RAG that works in dev breaks in production](/en/blog/rag-breaks-in-production), and tenant drift in the index belongs on that list.

## The checklist to run before tenant number two goes live

Work top to bottom. Most teams find something in the first four items.

- **Prove the pre-filter.** Confirm your vector store applies the tenant filter before the ANN search, not after. Check the client library docs, not your assumption. Then check what your store does with a document that has no tenant field, and what it does with an explicit null.
- **Count your vectors per tenant.** Run an aggregate over the index grouped by `tenant_id`. If the numbers do not add up to your total vector count, you have orphaned documents. This takes five minutes and finds the problem described above.
- **Audit every retrieval path.** Dense, sparse, hybrid, reranker, the "related articles" sidebar someone shipped on a Friday, the eval harness. Each one needs the filter. Grep for your retrieval client's method names and read every call site.
- **Read your system prompt out loud.** Every example, every piece of inlined context. If any of it came from a real customer, replace it with synthetic content that exercises the same format.
- **Include the tenant in every cache key.** Semantic cache, response cache, summary cache, embedding cache if it stores text. The tenant identifier goes in the key itself, not in a filter applied to the result.
- **Trace the tool credentials.** For each tool your agent can call, identify the identity it executes as. If it is a service role, the isolation guarantee lives in your prompt, which is to say it does not exist.
- **Scope the memory store.** Conversation history, user profiles, learned preferences, and summaries. Same question as the vector store: is the tenant part of the primary key, or part of a filter somebody has to remember to write?
- **Redact at the trace boundary.** Decide what your observability layer is allowed to retain. Full prompt and response content across tenants, readable by the whole team, is a decision worth making deliberately rather than by default. [Observability that actually helps you in production](/en/blog/llm-observability-production-monitoring) does not require storing raw customer content indefinitely.
- **Write down where the data went.** Model providers, eval tooling, trace vendors, and any fine-tune. This is also the register you will want when a customer's DPO asks, and it connects directly to the [GDPR questions around sending company data to a model provider](/en/blog/company-data-openai-gdpr-netherlands).

## The isolation test almost nobody runs

A one-off manual check proves nothing about next month's reindex. What you want is an automated test that fails loudly.

Plant a sentinel. For each tenant in a staging environment, insert one document containing a unique, meaningless string that appears nowhere else:
TENANT_SENTINEL_7f3a9c2e_ACME
TENANT_SENTINEL_b81d4e60_NORTHWIND

Then the test: for every tenant, run a set of queries designed to pull hard toward the other tenants' content, and assert that no retrieved chunk, no prompt sent to the model, and no response ever contains another tenant's sentinel. Assert on the prompt, not just the output, because a model that received foreign context and chose not to use it has already failed.

Run it three ways. Sequentially, which catches filter bugs. Concurrently with twenty parallel requests across tenants, which catches request-scoped state that is actually process-scoped, a surprisingly common bug in async handlers where the tenant context is set on a shared object. And again immediately after your reindex job, which is where the regression will eventually come from. Put all three in CI and gate deploys on them.

The concurrency run is the one that gets skipped, and it is the one that catches the worst class of bug, because a leak caused by shared mutable state does not reproduce when you test by hand.

## Weekend fix or architecture change

Not everything on the list costs the same.

Cache keys, missing filters on a retrieval path, and swapping few-shot examples for synthetic ones are hours of work. Sentinel tests in CI are a day. Trace redaction is usually two or three days, mostly spent deciding policy rather than writing code.

Three things are genuinely architectural. Moving from one shared index with metadata filters to a namespace or index per tenant means a full reindex and a change to every read path, and it is the right call once you have tenants with meaningfully different retention or residency requirements. Threading end-user identity through an agent's tool loop so tools execute under the caller's permissions touches your auth design, not just your AI code. And a model fine-tuned on pooled tenant data has to be retrained from scoped data, with the old artefact retired. Budget weeks, not an afternoon. If you are early enough that these are still open questions, they belong in the same conversation as the other [architecture decisions worth making before you build](/en/blog/ai-feature-architecture-decisions).

The reason to do this before tenant three rather than after is arithmetic about disclosure. A leak you find yourself is a bug. A leak your customer finds is a notification obligation, and under GDPR you have 72 hours from becoming aware of it to report to the Autoriteit Persoonsgegevens, plus a conversation with a customer who now has a reason to read their contract carefully.

Tenant isolation is exactly the kind of work a **Production Hardening** engagement exists for: three to six weeks auditing and fixing the boundaries in a feature that already works, which means namespace scoping, cache keys, credential propagation, log redaction, and the isolation tests that keep it fixed. If you are onboarding your second or third customer onto a shared AI feature and nobody can answer the isolation question with certainty, that is the right moment. The scope is on the [services page](/en/services), and you can describe your setup via the [contact page](/en/contact).
