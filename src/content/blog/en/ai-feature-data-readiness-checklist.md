---
title: "AI Feature Data Readiness: The Week-One Audit That Saves Builds"
description: "Most AI feature data readiness problems aren't technical. This checklist shows what to verify on access, schema, labels and freshness before you brief a vendor."
published: "2026-10-22"
tags: ["AI feature data readiness", "data readiness", "AI implementatie", "data audit", "RAG"]
ogImage: "/images/blog/ai-feature-data-readiness-checklist/cover.jpg"
primaryService: "ai-features"
---
A build I was brought into had a clean brief: an internal assistant over five years of project documentation, six weeks, retrieval plus a chat surface in their existing admin panel. The model work was straightforward. It stalled in week two on AI feature data readiness, not on anything in the architecture diagram. The documents lived in a SharePoint tenant where the one account with read access across all the libraries belonged to someone who had left, the replacement service principal needed approval from a security board that met monthly, and roughly 40% of the older files were scanned PDFs nobody had ever OCR'd. None of that was in the brief, because nobody had checked. "We have the documents" was true in the sense that the documents existed.

This is the part of a full build that gets assumed into the quote and then eats weeks of it. Vendors price the model integration, the retrieval layer, the UI, the deploy. The data is treated as an input that arrives on day one. In practice the first week of a serious build is an audit of exactly this, and every architecture decision downstream depends on what it finds.

The useful thing is that most of this audit is not engineering work. A buyer can run it themselves, in an afternoon, before writing a brief. Below is the checklist I run in week one, in the order I run it, with what a bad answer looks like.

## "We have the data" means four different things

When a founder says they have the data, they mean one of four things, and the distance between them is weeks of build time.

It exists somewhere. Files are on a drive, rows are in a database, tickets are in Zendesk. Nobody has tried to pull all of it out at once.

It is accessible. There is a credential, in an environment an engineer can actually reach, that reads the whole set and not just the slice the demo used.

It is usable. Accessible, plus structured enough that you know what a record means without asking a person who has been there seven years.

It is evaluable. Usable, plus you have examples of correct output, so you can tell whether the feature works before you ship it to users.

Almost everyone is at level one or two and believes they are at three. Level four is rare enough that when a prospect already has 50 labeled question-answer pairs, I assume they have shipped an AI feature before.

Run the rest of this as a checklist against your own data. Each section is a question with a verifiable answer, not a judgment call.

## Access: who can query it, in which environment, under what contract

Start here, because this is the one that produces calendar delays rather than engineering delays, and calendar delays cannot be solved by paying for more hours.

![AI Feature Data Readiness: The Week-One Audit That Saves Builds](/images/blog/ai-feature-data-readiness-checklist/1.jpg)

Four checks:

- **Can someone hand an external engineer a working credential this week?** Not "we'll sort out access." An actual service account, API key or read-only database user, scoped to the full dataset, issued without a procurement cycle. If the answer involves a committee, find out when it meets.
- **Which environment does that credential work in?** Production-only access means the engineer either develops against live data (a GDPR conversation, not a technical one) or works against a staging copy that may not resemble production. Both are workable. Neither is free.
- **Is the data contractually yours to process this way?** Customer data under a DPA that lists sub-processors, documents under an NDA with a client, anything from a SaaS tool whose terms restrict bulk export. I have seen a build pause for two weeks over a vendor's export API rate limit, and separately over whether sending a client's documents to a US model provider was permitted. The GDPR side of that second one I wrote up separately in [this practical read for Dutch teams](/en/blog/company-data-openai-gdpr-netherlands).
- **How do you get it out in bulk?** An API that returns 100 records per page with a 1,000 call daily limit against 400,000 records is not an extraction path, it is a two-month backfill. Check the limit before anyone designs around the API.

The bad answer to this section sounds like "our CTO has access to everything." One person's personal credential is not an access plan, and it will be the single point of failure during the one week they are on holiday.

## Schema: the undocumented column decides your retrieval design

Once an engineer can read the data, the shape of it determines the architecture. This is the part buyers consistently underestimate, because from the outside a database is a database.

What to check:

- **Is there documentation, and is it current?** A data dictionary from 2021 against a schema that has had 30 migrations since is worse than nothing, because people trust it.
- **How many `status` values actually appear in production?** Run the `GROUP BY`. The enum in the code has six values; production has eleven, two of which are typos from a 2019 import, and one of which means something different depending on which year the row was created. This is the single most common surprise in the first week.
- **Where is the real meaning stored?** If critical information lives in a free-text `notes` field, a JSON blob with no stable keys, or a column named `field_7`, your retrieval problem is now an extraction problem first. That changes the design and the timeline.
- **How much of it is unstructured?** Volume is easy to answer and rarely asked. 10,000 documents and 4 million documents produce different indexing strategies, different cost models and different chunking work. Scanned PDFs versus native text PDFs is the difference between an OCR pipeline and a parser. I have written up the [patterns I keep reaching for on OCR plus LLM extraction](/en/blog/document-intelligence-ocr-llm-extraction) when that answer comes back badly.
- **Does the data come out of a system nobody wants to touch?** A mainframe export, an on-prem ERP with a SOAP interface, a system whose vendor charges per integration. Legacy data AI integration is where estimates go wrong by multiples rather than percentages, and I have mapped out [where those weeks actually go](/en/blog/ai-feature-legacy-system-integration).

An undocumented schema does not block a build. It converts build time into discovery time, which is slower per hour and much harder to estimate. If you want a shorter quote, spend a week writing down what your own columns mean.

## Labeled examples: the eval set belongs in week one

This is the check almost nobody runs before hiring, and the one that most reliably determines whether the feature ships or lingers.

To know whether an AI feature works, you need examples of right answers. For a retrieval assistant: a question, the documents that should have been retrieved, and an acceptable answer. For an extraction feature: a document and the correct extracted fields. For a classifier: items with the label they should get. Thirty to fifty of these, spread across the easy cases and the awkward ones, is enough to gate a release. Hundreds are better and nobody has them.

Three questions:

- **Do examples exist as a byproduct of existing work?** Often yes, and unrecognised. Resolved support tickets with the article that solved them. Invoices already keyed into the ERP next to their PDFs. Manually reviewed classifications in a spreadsheet. This is the cheapest eval data in existence and it is usually sitting in a system you already pay for.
- **Who can produce the examples that don't exist?** It needs a person with domain authority, because the hard cases are judgment calls. Two hours of a senior person's time per week during the build. Name them before you sign anything. If nobody can be named, the feature will be evaluated by vibes and shipped on a demo.
- **Do you know which cases are allowed to fail?** The questions the assistant should refuse, the documents where "I can't determine this" is the correct output. Teams label only the happy path and then discover the feature confidently invents answers for everything else.

Without this, acceptance becomes an opinion, and opinions change with whoever is in the room. My write-up on [retrieval, faithfulness and ship gates](/en/blog/rag-evaluation-metrics-production) covers what to measure once the examples exist. The point here is upstream of that: the examples have to exist at all, and collecting them is work you can start this week at zero cost.

## Freshness: how fast does your data go stale

A six-week build against data with a two-week half-life is a different system than a six-week build against a static archive, and the difference shows up in the architecture, not in the final sprint.

- **How often does the underlying data change?** Policy documents updated quarterly tolerate a nightly reindex. A product catalogue with hourly price changes needs an update path designed in from the start, not retrofitted.
- **What happens when a record is deleted?** Deletion propagation is the quiet failure in every retrieval system I have audited. The document is removed from the source, the embedding stays in the vector store, and the assistant keeps citing a policy that was withdrawn three months ago. Someone eventually notices in front of a customer.
- **Is there a reliable change signal?** A modified timestamp you trust, a webhook, a change data capture stream. If detecting changes means re-reading everything, your reindex cost is your dataset size times your frequency. Do that arithmetic before choosing the frequency.
- **Who owns the data during and after the build?** If the source system is being migrated in Q2 while your build runs through Q1, you are building against a moving target. It happens more than you would think, because the two projects are approved by different people.

## The AI feature data readiness audit you can run this week

Block three hours. Pick the one use case you actually want built, not the roadmap.

1. Write down every system that holds data the feature needs. One line each: system, who owns it, how data gets out.
2. For each, get an answer to: can an external engineer have read access within two weeks, yes or no? Write the blocker where the answer is no.
3. Export 100 real records or documents from each source. Look at them. Not a schema diagram, the actual rows.
4. For the main table, run the `GROUP BY` on every enum-ish column and count the values that genuinely appear.
5. Count the unstructured volume: how many documents, what formats, what share are scans.
6. Find or create 30 labeled examples. Name the person who will produce more.
7. Write the change frequency and the deletion behaviour for each source.
8. List everything you could not answer. That list is your real project risk, and it belongs in the brief.

Anything you cannot answer, a vendor will have to discover, on your budget, at a worse hourly rate than your own staff. A completed version of this data readiness before AI build work is also the sharpest thing you can put in front of a vendor. It makes quotes comparable, because everyone is pricing the same known shape instead of their own guess about your mess. The same logic applies to the feature spec itself, which I covered in [the template that ends quote guesswork](/en/blog/ai-feature-spec-template-vendor-quotes).

## What a vendor should ask before quoting a timeline

You can use this in reverse, as a filter. A vendor who quotes six weeks for a full build without asking about your data is quoting a fantasy, and the overrun conversation is already scheduled. Four things they should want to know before committing to a date:

**Can I query the real data during week one, and who issues the credential?** If they accept "we'll give you a sample export" without flinching, they plan to discover the hard parts late.

**What do you have that I can use as an eval set?** A vendor who does not ask this intends to demo rather than measure.

**What is the oldest and ugliest part of this dataset?** Averages hide the work. The 5% of records that break every assumption set the timeline, and an experienced engineer asks for them specifically.

**Which of these numbers am I allowed to verify myself?** The volume, the format mix, the share of scans. Anyone who prices a retrieval system off a verbal description of the corpus is guessing.

A full build is six to twelve weeks of a senior engineer building the AI feature and the product around it end to end, and week one is this audit run properly, by the person who then owns every architecture decision that follows from it. Walking in with the answers already written down shortens that and makes the scope honest. If you have run the checklist and want the gaps read by someone who has seen them break builds, the [services page](/en/services) covers how a full build is scoped and [contact](/en/contact) is the fastest way to get a straight answer on whether your data supports what you want to build.
