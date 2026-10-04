---
title: "Structured Output Failures: The Bug Nobody Dashboards"
description: "Structured output failures corrupt data silently instead of throwing errors. Here's the validation layer, repair policy, and metrics that catch them."
published: "2026-10-04"
tags: ["structured output", "LLM validation", "production AI", "JSON schema", "AI observability"]
ogImage: "/images/blog/llm-structured-output-failures-production/cover.jpg"
primaryService: "hardening"
---
The failure looks nothing like the ones you prepared for. No hallucination, no timeout, no bill shock. Just a Sentry alert at 03:12 saying `Unexpected token 'a', ..."amount": NaN...` and a support ticket from a customer whose invoice got written with a null line item. **Structured output failures** — the model returning JSON or a tool call your code cannot parse or cannot trust — are the most under-instrumented breakage class in production AI, and they are the one that corrupts data rather than just annoying users.

I have hardened enough LLM features to say this with confidence: nearly every team that calls an LLM for structured data ships with a `json.loads()` wrapped in a try/except, a log line, and nothing else. That is not a validation layer. That is a place where bad data becomes silent.

This is the playbook I run when a team tells me "it works, except sometimes it doesn't parse." Where the failures actually come from, what the layer between the model and your code has to do, when to repair a broken response versus re-run it, the one metric nobody dashboards, and how to tell when the real fix is a different decoding strategy instead of another prompt rewrite.

## The moment: it passed QA, then 2% of responses started breaking your parser

Here is the shape of it. You built an extraction or routing step. You tested it on maybe 80 examples, probably curated, probably short. It passed. QA banged on it for a sprint. It passed. You shipped.

Then real traffic arrives, and real traffic is not your test set. Users paste emails with smart quotes and em dashes. A support ticket contains a code block with unescaped backslashes. Someone's company name is `O'Brien & Zonen "De Vries"`. A document is 40 pages instead of 2, the model's output gets truncated at the max-token boundary mid-object, and you get valid-looking JSON that simply stops.

The failure rate is small — in my experience somewhere between 0.5% and 4% depending on schema complexity and input wildness — and that smallness is the trap. It is too rare to catch in QA and too common to ignore at 50,000 calls a day. And it does not fail loudly. A `try/except: return None` turns a parse failure into a missing record. A partial parse turns it into a *wrong* record, which is strictly worse, because now it's in your database and nobody knows.

The specific failure modes I see, roughly in order of frequency:

- **Prose wrapping.** ` ```json ` fences, or "Here is the JSON you requested:" prepended. Trivially fixable, and the reason half of all teams think they've solved this with a regex.
- **Truncation.** Output hits the token ceiling. The JSON is well-formed right up until it isn't.
- **Missing required fields.** The model omits a key entirely when the input has no evidence for it, instead of returning `null`.
- **Type drift.** `"amount": "1.250,00"` when you wanted a float. `"quantity": "two"`. Booleans as `"yes"`.
- **Enum violations.** You defined `status` as one of four values; the model invents a fifth that is semantically reasonable and structurally fatal.
- **Tool call routing failures.** In agentic flows: a function name that doesn't exist, arguments for a different tool, or two tool calls when your executor handles one.

Note that only the first two are parsing problems. The rest are *schema conformance* problems — the JSON parses fine and is still wrong. That distinction drives everything below.

## Structured output failures are their own breakage class

The reason this goes unfixed is taxonomic. Teams file it under "the model is being flaky" and reach for prompt engineering, which is the tool they have. But this is not a content-quality problem like [hallucination, where the model states something false with confidence](/en/blog/llm-hallucination-in-production). It is a *contract* problem: you defined an interface between a probabilistic system and a deterministic one, and you enforced it with a request rather than a constraint.

![Structured Output Failures: The Bug Nobody Dashboards](/images/blog/llm-structured-output-failures-production/1.jpg)

"Just ask for JSON" works in dev for a boring reason. Your dev inputs are short, clean, and in-distribution, so the model's highest-probability continuation happens to be well-formed. Production widens the input distribution, and every widening — longer context, mixed languages, adversarial punctuation, edge-case business logic — pushes some fraction of generations toward continuations where the syntax constraint loses to the semantic one. The model would rather explain than emit `null`.

Prompt fixes reduce the rate. They do not change the class. You can go from 3% to 0.8% with a better system prompt and few-shot examples, and you will still be corrupting roughly one record in 125. If the downstream write is financial, clinical, or legal, that number is not a tuning target — it's a design flaw. This is the same lesson as the broader [punchlist of what actually breaks when AI hits production](/en/blog/what-breaks-in-ai-production): the demo-to-prod gap is almost never about model quality, it's about the absence of enforcement at the boundaries.

## The validation layer that has to sit between the model and your code

No LLM output touches business logic directly. Ever. There is a layer, it is boring, and it has four jobs in this order.

**1. Extract.** Strip fences, leading prose, trailing commentary. Find the outermost balanced `{...}` or `[...]`. This is mechanical and should be a shared utility, not copy-pasted per call site.

**2. Parse with tolerance, then re-serialise strictly.** Use a lenient parser for the first pass (trailing commas, single quotes, unescaped newlines in strings are all recoverable), then dump back to canonical JSON. Never let the lenient form flow onward.

**3. Validate against a real schema.** Pydantic in Python, Zod in TypeScript. Not a dict of `isinstance` checks. A schema object that is the single source of truth — the same object you serialise into the API call's `response_format` or tool definition, so the contract you enforce and the contract you request cannot drift apart.

**4. Coerce deliberately, reject everything else.** Decide up front which coercions are legitimate: `"1250.00"` → float, `"YES"` → `true`, `"2026-09-28T00:00:00Z"` → date. Whitelist them. Everything outside the whitelist is a failure, not a guess.

python
class Invoice(BaseModel):
    model_config = ConfigDict(extra="forbid")  # catch invented fields
    vendor: str = Field(min_length=1)
    amount_cents: int = Field(ge=0)          # never floats for money
    currency: Literal["EUR", "USD", "GBP"]
    due_date: date | None                     # explicitly nullable, not optional

Two details that matter more than they look. `extra="forbid"` catches the model inventing helpful fields — a real signal that your prompt and schema disagree, and one you'd otherwise never see. And the distinction between *nullable* and *optional*: if a field can be absent, the model will make it absent, and your downstream code will see a different shape than it expects. Make unknowns explicit `null` values in a required key. It costs a few tokens and removes an entire category of ambiguity.

The layer must also emit. Every rejection gets logged with the raw output, the schema version, the validation error path, and the input hash. Without the raw output you are debugging blind, and you will need it in section five.

## Repair vs. retry: which failures you fix in place and which you re-run

Once validation catches something, you have three moves, and picking wrong is where the cost goes.

**Deterministic repair — free, instant, always first.** Fence stripping, whitespace, trailing commas, quote normalisation. No model call. If your validation layer does this properly, it absorbs a large share of failures at zero marginal cost. Do not spend an LLM call on a problem `str.strip()` solves.

**Retry with the same call — cheap, and more effective than people expect.** Because generation is sampled, an identical request often succeeds on the second attempt. One retry at temperature 0 (or lower than your primary) typically clears most of the remaining transient failures. Budget exactly one, with jitter, and make it visible in your traces so retries don't hide inside your latency p95.

**Repair call — send the broken output back with the validation error.** "Your previous response failed validation: `amount_cents: Input should be a valid integer`. Return only corrected JSON." This is the expensive option: a full extra round trip, added latency, and a second chance to be wrong. It earns its place in exactly one case — when the original call had a large, expensive context (a 40-page document, a long agent history) that you do not want to re-send. Then a small repair call against just the broken output and the error is dramatically cheaper than a full retry.

The decision is a cost ratio, not a preference:
if failure is deterministic:      repair locally, no call
elif input_tokens < ~4k:          retry the original call, temp 0
else:                             repair call with error feedback, small model
if still invalid after 2 attempts: fail loudly, queue for human, do not write

That last line is the one teams skip. A structured output failure that exhausts its budget must **fail loudly and not write**. A dead-letter queue with the raw output and the input is a ten-minute build and the difference between "we caught 40 bad extractions in a batch" and "we found them in an audit six weeks later."

## The metric nobody dashboards: schema-valid rate, broken out by field

Your error rate dashboard shows exceptions. Structured output failures that get repaired, retried, or silently nulled never become exceptions, so your dashboard is green while the feature degrades. The metric you need is **schema-valid rate on first attempt**, and it needs three cuts.

**Overall, first-attempt.** Post-repair validity is a vanity metric; it tells you your safety net works, not whether the model does. Track pre-repair.

**By field.** This is where the value is. An aggregate 96% schema-valid rate is uninformative. "96% overall, but `due_date` validates 99.8% and `line_items[].vat_rate` validates 81%" tells you exactly which part of the schema to fix and whether the problem is the prompt, the field type, or a genuinely ambiguous business rule. Log the validation error *path*, not just the fact of failure.

**By input segment.** Language, document length, source channel, customer. Structured output failures cluster hard. I regularly find a 3% overall failure rate that is actually 0.4% for one input type and 22% for another — and the 22% segment is usually one customer's document format nobody tested against.

Wire this into whatever you already use for [LLM observability and production monitoring](/en/blog/llm-observability-production-monitoring) — it's the same trace, one more attribute. Then set a ship gate: schema-valid rate is a regression test. When you change a prompt or bump a model version, the valid rate per field is part of the diff, exactly like the [prompt versioning and regression testing discipline](/en/blog/prompt-versioning-regression-testing) you should already be running. Model providers change behaviour under a stable version string. Your enum compliance will tell you before your users do.

## When the fix is a different decoding strategy, not a better prompt

At some point you stop asking nicely and start making invalid output impossible. Roughly in order of strength:

**Native structured outputs / strict JSON schema mode.** OpenAI's `response_format: {type: "json_schema", strict: true}`, Gemini's response schema, Anthropic's tool-use schema. These constrain generation, not just instruct it. They do not support every JSON Schema feature — deep recursion, some `anyOf` shapes, unbounded maps — and that limitation is usually telling you your schema is too clever.

**Function/tool calling.** For agentic flows, define the tool properly and let the provider validate the arguments. Then set `tool_choice` to force a specific tool when you know what should happen, rather than hoping the model routes correctly. Most tool-routing failures I see are a model given eleven tools with overlapping descriptions and no forcing.

**Constrained decoding on your own inference.** Self-hosting via vLLM or llama.cpp gives you grammar-based decoding (xgrammar, GBNF) that makes malformed output structurally unreachable — the sampler cannot emit a token that violates the grammar. This is the strongest guarantee available and a real argument for [on-prem or self-hosted LLM inference](/en/blog/on-prem-llm-hosting-netherlands) when data integrity matters more than model ceiling.

**Simplify the schema.** The cheapest fix and the least used. Three flat calls with four fields each beat one nested call with twenty. Split extraction from classification. Ask for a string and parse the date yourself rather than asking the model to format ISO-8601. Every level of nesting and every free-form field is surface area for failure.

One caution, because it is the honest part: constrained decoding guarantees *shape*, not *truth*. A grammar will happily emit a perfectly valid `amount_cents: 0`. Forcing structure can even push a model toward filling a required field with something plausible rather than admitting absence. Structural validity and content correctness are two separate gates, and you need both.

## Where this becomes an engagement

If your AI feature is writing to a database, calling an API, or routing agent actions on the back of LLM output, and you cannot state your current schema-valid rate per field, that is a Production Hardening job: three to six weeks to build the validation layer, the repair/retry policy, the per-field metrics and the regression gates, then ship it behind a hardened deploy you can actually watch. Most of the work is not glamorous, which is exactly why it is still open.

See what that covers on the [services page](/en/services), or send me the failing payloads and the schema and I'll tell you which of the six failure modes you have — [get in touch](/en/contact).
