---
title: "Context Window Overflow: The Silent Bug in Your LLM Stack"
description: "Context window overflow rarely errors out—it truncates silently. Learn where tokens go, how to spot it in logs, and how to budget per component."
published: "2026-10-12"
tags: ["context window overflow", "LLM observability", "RAG", "prompt engineering", "production AI"]
ogImage: "/images/blog/context-window-overflow-production/cover.jpg"
primaryService: "hardening"
---
A 128,000-token context window sounds like it ends this class of problem. Then you count what a single production request actually carries: a system prompt with fifteen tool schemas attached, eight retrieved chunks, six turns of history that include two raw tool results, and a user message where someone pasted a 40-page supplier contract. At roughly 600 to 800 tokens per page of dense Dutch legal text, that one paste is 25,000 tokens on its own. Compare three contracts in one thread and you are past 90,000 before the model has done anything.

**Context window overflow** in production is rarely about the median request. The median request is fine. It is the p99 that overflows, and the thing that makes it dangerous is that almost nothing in your stack is designed to tell you when it happens. The request succeeds. The model answers fluently. It just answers from a version of the input you never saw.

This is a correctness bug that lives in the same request path as your cost and latency problems, which is why it usually gets diagnosed as something else.

## Why context window overflow still happens at 128K

Three things shrink the advertised number before you get to use it.

The window is shared with the output. If you set `max_tokens` to 8,000 so long answers do not get cut off, you have 8,000 fewer tokens for input. On reasoning models it is worse, because hidden thinking tokens come out of that same output budget, and you have to reserve for the worst case rather than the average.

Token counts are not proportional to characters in the way people estimate. English prose runs around four characters per token. Dutch, German, legal boilerplate with long compound words, and anything with heavy punctuation run meaningfully worse. OCR output of a scanned invoice, with its layout artefacts and broken table cells, is the worst input I regularly see on a per-page basis. If your estimate came from counting words in a clean English test file, it is low for real traffic.

And input length is not normally distributed. It has a long, fat tail made of the 300-page PDF, the user who pastes an entire email thread, the agent that looped nine times and accumulated nine tool results. Your p50 might be 4,000 tokens and your p99 120,000. Capacity planning against the median is how teams end up with a feature that is correct for 97% of requests and silently wrong for the rest, which is exactly the shape of bug that survives a demo.

## The four places the tokens come from

Before you fix anything, instrument where the budget actually goes. In my experience it is almost never where the team assumes.

![Context Window Overflow: The Silent Bug in Your LLM Stack](/images/blog/context-window-overflow-production/1.jpg)

**System prompt and tool schemas.** The prose part is usually a few hundred tokens and nobody worries about it. The JSON schemas for your tools are the part people forget. Fifteen tools with descriptive parameter docs is easily 3,000 to 5,000 tokens on every single call, and it grows every time someone adds a capability. Few-shot examples live here too, and they tend to be added during debugging and never removed.

**Chat history.** Not just the user and assistant text. Every past tool call and its full result is a message in that history. An agent that queried your database three turns ago is still carrying the entire result set.

**Retrieval.** `top_k` is a count, not a token budget. If you set `k=8` and your chunk size is 512 tokens, that is 4,000 tokens on a good day. But if you chunk by document section instead of by fixed size, one of those eight "chunks" can be an eleven-page appendix. Retrieval context limits expressed as a chunk count rather than a token ceiling are the most common way a request silently doubles in size. I went into the rest of the dev-to-prod gap in [why RAG breaks in production](/en/blog/rag-breaks-in-production).

**Tool outputs.** The biggest single offender. A tool that returns the raw JSON of an API response, a full SQL result set, or the entire text of a fetched page will dwarf everything else. One unpaginated `list_orders` call can produce 40,000 tokens of nested JSON that the model will use maybe 200 tokens of.

## Most frameworks trim instead of failing, and they do it quietly

Here is the part that surprises people: the raw provider APIs behave correctly. Send OpenAI or Anthropic more tokens than the model accepts and you get a 400 back, with a clear message about the maximum context length. That is an honest failure. You can catch it, log it, and degrade on purpose.

The silence is introduced by the layers you added for convenience.

- Memory helpers do exactly what they advertise. LangChain's `trim_messages` with `strategy="last"` keeps the most recent messages that fit. LlamaIndex's chat memory buffer has a `token_limit` and drops what exceeds it. Both are reasonable defaults and both produce no application-level event you can alert on.
- Hand-rolled memory is usually `messages[-10:]`. That is LLM context truncation with no token awareness at all: ten short turns is nothing, ten turns containing tool results is over budget anyway.
- Some conversation-state APIs offer an automatic truncation strategy that drops older messages on your behalf, and some gateways offer a "middle-out" transform that cuts from the center of the prompt. Both are real features people enable once during an incident and then forget.
- Your own code does it too. `text[:50000]` in a document ingestion path is a truncation. So is a parser that only reads the first N pages.

None of these are bugs in the libraries. They are a design choice: availability over correctness. A trimmed prompt returns 200, and a 500 generates a support ticket. The problem is that the layer doing the trimming has no idea which tokens carried the answer.

## Three failure modes, depending on what got cut

The symptom you see depends entirely on which component lost its tokens, and they look like three unrelated bugs.

**History dropped.** The user set a constraint in turn two ("only EU-based suppliers") and asks a follow-up in turn nine. The constraint is gone from the context. The model answers correctly for the question as it now sees it. Users describe this as the assistant forgetting, and it gets filed as a UX complaint rather than a correctness defect.

**Retrieval dropped.** The chunk containing the answer was ranked sixth, the budget fit four, and the model fell back on parametric knowledge. The output is fluent, plausible, specifically wrong, and completely indistinguishable from a hallucination in your logs. This is the mode that does real damage, because it corrupts the one thing RAG was supposed to guarantee: that the answer came from your documents.

**Instructions dropped.** When trimming cuts from the front, or when a long system prompt gets squeezed to make room, you lose formatting rules, refusal rules, and tone. The visible version is structured output breaking: a parser that worked for months starts failing because the JSON schema instruction is no longer in the prompt. The invisible version is worse, because your injection and scope guardrails were in that same block.

## The signature of silent truncation in your logs

You can check for this today without new tooling, as long as you are logging per-request token counts.

Plot a histogram of `prompt_tokens`. Healthy traffic has a long right tail. Traffic hitting a ceiling piles up against a value and stops dead: a vertical wall just under 128,000, or just under whatever limit your trimming code enforces. That wall is the fingerprint. Nothing natural produces it.

Then add four fields to your request logs:

- token count per component (system, history, retrieval, tools, user input)
- the chunk IDs retrieved versus the chunk IDs actually sent
- a boolean `truncated` plus which component lost tokens
- `finish_reason`, so you separate input overflow from output being cut at `length`

The retrieved-versus-sent comparison is the highest-value one. If those lists differ and you never log it, you cannot tell truncation from hallucination after the fact, and you will spend a week tuning your retriever to fix a budgeting bug. The broader case for this kind of per-request detail is in [LLM observability in production](/en/blog/llm-observability-production-monitoring). While you are in there, look at the correlation between thumbs-down ratings and the prompt-token percentile. A feature that only disappoints on the longest inputs is not a model quality problem.

## Budget per component, not one number for the whole prompt

The fix is to stop treating the context window as a single pool that whoever shows up first gets to drain. Allocate it, in order, with floors.

python
WINDOW = 128_000
RESERVE_OUTPUT = 8_000          # includes reasoning tokens
SAFETY = 2_000                  # tokenizer estimate drift

budget = WINDOW - RESERVE_OUTPUT - SAFETY

system = count(system_prompt) + count(tool_schemas)   # never trimmed
budget -= system

user_input = fit(raw_user_input, max_tokens=40_000)   # may fail loudly
budget -= user_input.tokens

retrieval = pack(ranked_chunks, max_tokens=min(12_000, budget * 0.4))
budget -= retrieval.tokens

history = pack_recent(messages, max_tokens=budget)

Four rules make this work in practice.

Pack retrieval by token count, not by `k`. Walk the ranked list and add chunks until the token budget is spent. You get four big chunks or fourteen small ones depending on what retrieval returned, which is what you wanted anyway.

Never let the system prompt be trimmable. If it does not fit alongside a floor for everything else, that is a deploy-time error, not a runtime decision.

Summarize tool outputs before they enter history. Keep the raw payload in your own store with an ID the model can ask for again. A 40,000-token order dump becomes a 300-token summary plus a pointer.

Degrade explicitly when a component cannot meet its floor. If a document does not fit, process it in sections and merge, which is how most serious [document extraction pipelines](/en/blog/document-intelligence-ocr-llm-extraction) are built anyway. If history does not fit, summarize it and tell the user you did. An honest "this document is being processed in three parts" beats a confident answer based on page 1 to 40 of 90. And emit a metric every time it happens, so silent truncation in production becomes a number on a dashboard instead of a mystery.

Doing this well usually reduces your bill at the same time, for the reasons I listed in [the five causes of an LLM cost spike](/en/blog/llm-cost-spike-production). Packing tightly and summarizing tool output cuts tokens on every request, not just the overflowing ones.

## What to ask before you accept "it handles long documents"

If you are evaluating a vendor or reviewing your own team's implementation, these five questions separate a real answer from a shrug. They pair well with the rest of my list of [technical questions to ask an AI vendor](/en/blog/vet-ai-vendor-before-you-sign).

1. What is the p99 prompt token count in production right now?
2. When input exceeds the budget, does the system error or trim? If it trims, which component loses tokens first, and who decided that order?
3. Is a truncation event logged and alertable, or is it inferred?
4. Can you show me, for a specific past request, which retrieved chunks were sent to the model versus which were retrieved?
5. What is the reserved output budget, and does it account for reasoning tokens?

Question four is the one that gets the most honest reactions. Most teams cannot answer it, and that gap is the whole problem.

## Questions I get asked

**Does a bigger context window solve this?**
It moves the ceiling, it does not remove it. Long-context models still degrade on recall of material buried in the middle of a very large prompt, you pay for every token on every call, and your tail inputs grow to fill whatever space you provide. Budgeting is cheaper and more predictable than buying headroom.

**Will the API just return an error if I send too much?**
The provider API will. Your application probably will not, because a memory helper, a gateway transform, or a slice in your own code already cut the input down to something that fits before it got there.

**How do I tell a hallucination from a truncation after the fact?**
By logging the chunk IDs you sent, not just the ones you retrieved, and by replaying the exact assembled prompt. Without that, the two are identical in your logs, and the distinction matters because the fixes are completely different. More on separating them in [the hallucination field guide](/en/blog/llm-hallucination-in-production).

**What truncation rate is acceptable?**
Silent: zero. Explicit, logged, user-visible degradation: whatever your product can live with, as long as you are measuring it. The target is not "never truncate", it is "never truncate without anyone knowing".

If your feature is already live and you suspect the long requests are quietly wrong, this is standard Production Hardening work: instrument per-component token budgets, add truncation alerts, and redesign how history, retrieval and tool output share the window. That runs three to six weeks depending on how much of the pipeline needs restructuring. The scope is on the [services page](/en/services), and if you want to talk through what your logs are showing, [get in touch](/en/contact).
