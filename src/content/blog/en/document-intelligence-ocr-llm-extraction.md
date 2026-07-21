---
title: "Document intelligence in 2026: OCR plus LLM extraction patterns I keep reaching for"
description: "Six patterns for extracting structured data from documents using OCR and LLMs. With the tradeoffs that decide which one fits your use case."
published: "2026-05-17"
tags: ["document AI", "OCR", "LLM extraction", "production AI"]
ogImage: "/og-image.png"
primaryService: "ai-features"
---

Document intelligence in 2026 is one of those AI use cases that is genuinely solved. Receipts, invoices, contracts, application forms, lab reports, regulatory filings. If you have a stack of documents and you need the data out of them in a structured way, the technology exists and works. The question is which pattern to use.

I have built document-extraction pipelines for several clients in the last two years. This post is the six patterns I keep coming back to, with the tradeoffs that decide which one fits a given use case. None of them are novel. Most teams I see ship one of them. The mistake I see most often is picking the wrong one for the document type and the throughput you actually have.

## The six patterns

Each pattern combines an OCR layer (turning images of text into text) with an LLM layer (turning unstructured text into structured fields). The differences are in how much each layer does.

### Pattern 1: Pure LLM with vision input

You send the document image directly to a multimodal LLM (GPT-4o vision, Claude Sonnet vision, Gemini Pro vision) and ask for structured output.

**When to use**: low-volume use cases (under 1,000 docs per month) where document quality varies and you need flexibility. Receipts, invoices, ad-hoc form extraction.

**Cost**: 0.05 to 0.30 euro per document depending on image size and output complexity.

**Pros**: simplest pipeline, no separate OCR step, handles weird layouts well, easy to iterate on the prompt.

**Cons**: expensive at scale, no granular control over OCR quality, inconsistent on edge cases.

### Pattern 2: Dedicated OCR plus LLM extraction

You use a dedicated OCR service (AWS Textract, Google Document AI, Azure Form Recognizer, or Mistral OCR) to get text plus layout. Then an LLM extracts structured fields from that text.

**When to use**: medium volume (1,000 to 50,000 docs per month), well-structured documents (invoices, forms, receipts).

**Cost**: 0.005 to 0.02 euro per document for OCR, plus 0.001 to 0.01 euro per document for LLM extraction. Total around 0.01 to 0.03 euro per document.

**Pros**: 5-30x cheaper than pure vision LLM, OCR layer is mature and accurate, LLM only has to do extraction (the easy part).

**Cons**: two-vendor dependency, OCR errors compound into extraction errors, layout-aware OCR has tier limits.

### Pattern 3: Pre-trained extraction model plus LLM verification

You use a model specifically trained for the document type (invoice extractor from AWS Textract, layout-aware models from Roboflow, table extractors from Camelot) to get structured fields directly. Then an LLM verifies and reformats the output.

**When to use**: high volume (50,000+ docs per month), highly standardised document types (invoices, receipts, tax forms).

**Cost**: 0.002 to 0.01 euro per document for the dedicated extractor, plus minimal LLM verification cost.

**Pros**: cheapest per document at scale, dedicated models are usually higher accuracy than general LLMs on the document type they were trained on.

**Cons**: tied to vendor's document categories, fails ungracefully on document variations the model has not seen.

### Pattern 4: Self-hosted OCR with open-weights LLM extraction

You self-host an OCR model (PaddleOCR, EasyOCR, Tesseract for simple cases, Surya for complex layouts) and an open-weights LLM (Llama, Mistral, or a fine-tuned smaller model) for extraction.

**When to use**: data residency requirements, high-volume use cases where vendor cost is becoming significant, or use cases where the documents contain sensitive data.

**Cost**: amortised infrastructure cost, can be 0.0005 to 0.005 euro per document at high utilisation.

**Pros**: data never leaves your infrastructure, predictable cost at scale, no vendor dependency.

**Cons**: serious operational lift, open-weights OCR is 1-2 generations behind commercial OCR on complex layouts, you own the maintenance.

### Pattern 5: Hybrid (OCR + LLM + rule-based post-processing)

OCR gets you text, LLM gets you structured fields, deterministic rules clean up the output (validate dates, normalise currencies, check totals, look up known vendors).

**When to use**: business-critical extraction where errors cost real money (invoice automation, expense reports, claims processing).

**Cost**: similar to Pattern 2 for the AI parts, plus engineering time for rule maintenance.

**Pros**: most accurate, catches LLM hallucinations through deterministic checks, auditable.

**Cons**: highest engineering cost, rules need maintenance as document formats change.

### Pattern 6: Document Q&A (don't extract, query)

You do not pre-extract fields. You store the OCR output and an embedding index. When a downstream system needs a field, it queries the document via RAG.

**When to use**: when the set of fields you might need is open-ended (legal contracts, research papers, regulatory filings), or when most documents are queried zero or one time after ingest.

**Cost**: low ingest cost (just OCR + embedding), pay per query.

**Pros**: flexible, no need to predict the schema in advance, single ingest pipeline for many document types.

**Cons**: not great for high-throughput repeated queries, latency on each query, harder to ensure exhaustive extraction.

## How to pick

The decision tree I usually walk teams through:

| Question | If yes | If no |
|---|---|---|
| Under 1,000 docs per month? | Pattern 1 (pure vision LLM) | Continue |
| Documents are highly standardised? | Pattern 3 (pre-trained extractor) | Continue |
| Data must stay on-prem or in EU? | Pattern 4 (self-hosted) | Continue |
| Errors cost real money? | Pattern 5 (hybrid with rules) | Continue |
| Field schema known in advance? | Pattern 2 (OCR plus LLM) | Pattern 6 (document Q&A) |

This is a heuristic, not a formula. Real picks often combine elements from multiple patterns. The point is to have a clear answer to "why this pattern" before you start building.

## The things that go wrong

Common failures I see in document extraction pipelines:

### 1. OCR errors compounding into extraction errors

If OCR misreads "1,234.56" as "I,234.56" (capital I instead of digit 1), your LLM might extract it as a string instead of a number. Or worse, hallucinate a different value that looks plausible.

Fix: validate extracted fields against expected types and ranges. Reject and re-OCR documents that fail validation. Track OCR-error rates per document type.

### 2. Table extraction is harder than text extraction

Tables in PDFs and scanned documents are the single hardest part of document extraction. Commercial OCR has gotten better but still struggles with complex tables (merged cells, multi-line entries, headers across pages).

Fix: for table-heavy documents, evaluate dedicated table extractors (AWS Textract's table mode, Camelot for PDF tables, Unstructured.io's table parser). Pure text-OCR followed by LLM table-reconstruction often fails on real-world tables.

### 3. Multi-page documents lose context

A 30-page contract has clauses on page 4 that reference definitions on page 1. If you process pages independently, the LLM doing extraction on page 4 has no idea what the definitions mean.

Fix: for multi-page documents, either (a) include a summary of the full document in the extraction prompt, (b) use a long-context model that can see all pages, or (c) two-pass extraction where the first pass builds context and the second pass extracts fields.

### 4. Language and locale issues

Dutch invoices use commas as decimal separators (1.234,56). French dates are DD/MM/YYYY. American invoices put currency symbol before the number ($100), Dutch invoices put it after (100 €). If your extractor was tuned for US English data, it will get these wrong silently.

Fix: extract raw strings, normalise in deterministic post-processing. Never trust the LLM to convert locale-specific formats correctly.

### 5. Document variations break standardised extractors

You trained a model on 1,000 invoices from your 20 biggest customers. Customer 21 starts sending invoices with a slightly different layout. Your accuracy on that customer drops by 30 percentage points without anyone noticing.

Fix: monitor extraction confidence and accuracy per document source. Set alerts when a new source has low confidence or when an existing source's accuracy drops.

## What I would build today for a typical Dutch SME

If a mid-sized Dutch company asked me to build invoice extraction for their accounting workflow in 2026, here is what I would build:

1. **Pattern 5 (hybrid).** Accuracy matters because invoices feed accounting.
2. **OCR**: AWS Textract for the invoice-specific mode (English, French, Dutch all supported reasonably well).
3. **LLM**: gpt-4o-mini for extraction, with a strict JSON schema and one retry on validation failure.
4. **Rules**: validate VAT IDs against a regex per country, validate totals match line-item sums, validate dates are in plausible range, look up known vendors in a small database.
5. **Monitoring**: per-vendor accuracy tracking, with alerts when accuracy drops or when a new vendor appears with low confidence.

Total per-invoice cost: around 0.02 to 0.04 euro. End-to-end accuracy: 95-99 percent on standard invoice formats. Engineering time to build: 3-4 weeks for the pipeline plus 1-2 weeks of accuracy tuning.

If you want a structured analysis of which pattern fits a specific document extraction problem you are working on, that is the kind of thing I do in a [POC sprint](/services). The output is a working prototype on real sample documents plus a recommendation for the pattern that fits your volume, accuracy, and cost constraints.

Related reading: [what it really costs to run a production LLM feature in 2026](/blog/cost-of-production-llm-2026) covers the broader cost picture for any LLM-based extraction pipeline.
