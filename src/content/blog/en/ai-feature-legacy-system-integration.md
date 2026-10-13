---
title: "AI Feature Legacy System Integration: Where the Weeks Go"
description: "AI feature legacy system integration costs 40-80% more than greenfield builds. See where auth, data, and deploy actually eat the timeline."
published: "2026-10-13"
tags: ["AI integratie", "legacy systemen", "RAG", "softwarearchitectuur", "AI feature"]
ogImage: "/images/blog/ai-feature-legacy-system-integration/cover.jpg"
primaryService: "ai-features"
---
A claims handler opens a case, reads the loss description, then switches to a document viewer to find the policy schedule, because the two systems share a policy number and nothing else. She checks endorsement history in a third screen, writes four sentences of summary into a free-text field, and sets a coverage flag from a dropdown of eleven values. Eleven minutes a case, forty cases a day. The AI feature the business wants is obvious: summarise the file, propose the flag, cite the sentences used.

Almost every **AI feature legacy system integration** I get called into is quoted as though that summary is the work. It is maybe fifteen percent of it. The rest is inheriting someone else's auth model, someone else's data schema, and someone else's release process, none of which were built with an outbound model call in mind.

Three integrations stay in my head because each one got expensive somewhere different. I will describe them as stack shapes rather than clients: a fifteen-year-old .NET insurance claims platform, a Django monolith that had grown for nine years, and a logistics planning system whose source of truth was a nightly extract off a mainframe. Same AI feature category in all three. Very different bills.

## Three legacy stacks, three places the weeks disappeared

In the claims platform, the model work was straightforward and the permissions work was not. Claim visibility was computed in stored procedures, differently for handlers, team leads, fraud investigators and external loss adjusters, with overrides at branch level that had accumulated for a decade. Retrieval had to respect all of it, per request, at query time.

In the Django monolith, auth was fine. The data was the problem. Nine years of product decisions meant the text we needed to retrieve lived in four places: a `description` column, a `notes` table with no foreign key constraints, a JSON blob written by a 2021 feature that was half-migrated, and a document store of PDFs whose metadata disagreed with the database rows pointing at them. Nobody could tell me which one was authoritative, because the honest answer was "depends on the record's age".

In the logistics platform, both of those were manageable. Deployment was where it went. The release process had a two-week change window, a change advisory board that met on Tuesdays, and a hard rule that no service could make outbound internet calls from the production VLAN. The AI feature was ready in week four and live in week eleven.

If you only remember one thing from this: in a brownfield AI build, the model is the predictable part. The cost sits in whichever of auth, data, or deploy your organisation has let drift the longest.

## What AI feature legacy system integration adds to a greenfield estimate

A greenfield quote assumes the build chooses its own identity provider, its own schema, and its own deploy path. Remove those three freedoms and you are adding work that does not shrink just because the model got better.

![AI Feature Legacy System Integration: Where the Weeks Go](/images/blog/ai-feature-legacy-system-integration/1.jpg)

In my experience the realistic uplift over an equivalent greenfield feature is roughly 40 to 80 percent in elapsed weeks, and it is not evenly spread. Auth and permissions mapping is usually one to two weeks of real engineering, plus whatever calendar time it takes to get a straight answer about who is allowed to see what. Data archaeology on an old schema is one to three weeks before you write any retrieval code, because you cannot chunk what you cannot trust. Getting a new service through an unfamiliar release process is the one that varies wildest: a week if there is a container platform and a self-service pipeline, five or six weeks if the answer involves a firewall change request and a security review you were not told about at kickoff. My [four real timelines](/en/blog/how-long-to-build-an-ai-feature) post assumes you control the deploy target. Subtract that assumption and every number moves right.

The honest version of the estimate separates the AI feature from the integration surface and prices them apart, which is also how you spot a greenfield quote wearing brownfield clothes. If a proposal has a line for "model integration" and nothing for permission mapping or pipeline onboarding, it was written against a clean slate.

## The permission model you inherit, not design

Retrieval-augmented generation has a default shape in every tutorial: embed the corpus, search it, pass the top chunks to the model. That shape quietly assumes every user may see every document. Legacy systems almost never work that way, and the permission logic is rarely somewhere you can query cleanly.

What I look for first is where authorisation is actually computed. Three bad answers, in increasing order of pain: it lives in application code scattered across controllers, it lives in stored procedures, or it lives in a Windows group membership structure that mirrors a 2014 org chart. In the claims platform it was option two plus option three. We ended up not querying the vector index directly at all. The flow became: resolve the handler's claim scope through the existing stored procedure, get back a list of claim IDs, then run a filtered vector search restricted to those IDs. Slower than an unfiltered search and considerably more correct.

Authorise first, then retrieve. That is the pattern I now reach for by default when the AI feature has to live in an existing codebase, and it has two properties that matter when you defend the design to a security officer. The AI feature never becomes a second, weaker source of truth about permissions. And when the business changes an access rule next year, they change it in one place. The alternative, copying permission metadata into your index at ingest time, is faster to build and goes stale the first time someone moves teams. I have written about [where multi-tenant RAG actually leaks](/en/blog/multi-tenant-ai-feature-data-leaks); inside a single-tenant legacy system the leak is between user roles instead of between customers, which is harder to notice because nobody is watching for it.

Budget the conversation, not just the code. Getting a written answer to "who may see this document and why" took longer than implementing it in two of the three cases.

## Your schema decides the retrieval design before you do

The Django monolith taught me to stop designing retrieval on a whiteboard before reading the actual tables. Chunk size, embedding strategy and whether you need a vector store at all are downstream of what the data looks like, and old data looks nothing like a documentation corpus.

The specific things that forced design changes there:

- Records where the authoritative text moved between columns depending on creation date, so ingest needed per-era handling instead of one query.
- Soft deletes via an `is_active` flag that half the codebase respected and half did not, meaning the index would happily surface records the UI hides.
- Free-text fields containing pasted email threads with signatures and legal footers, which is noise that wrecks retrieval quality if you embed it raw.
- No reliable updated-at timestamp on one of the tables, which killed incremental re-indexing and pushed us to change data capture on the replica instead.

The reflex to resist is the full data cleanup. Someone will propose fixing the schema first, and that is a two-quarter project which will outlive the AI budget. The workable move is a read-side adaptation layer: one well-tested module that normalises the mess into a clean document shape for ingest, with the era-specific rules written down and covered by tests. Ugly, bounded, and it leaves the migration question where it belongs, with the team that owns the monolith. The [four architecture decisions](/en/blog/ai-feature-architecture-decisions) I make at the start of any build all get constrained here, and that is fine as long as you discover it in week one rather than week six.

## A new service inside a release process that predates it

AI features want to deploy often. Prompt changes, retrieval tuning, model version pins, eval thresholds: these move weekly in the first months of production. Legacy release processes exist to make change rare and auditable. That is the collision, and it is organisational more than technical.

In the logistics case the blockers were specific and none of them were in the original scope. Production egress was blocked, so the model provider had to be reachable inside the existing cloud tenancy rather than over the public internet, which meant a different endpoint, a different auth mechanism and a security sign-off. There was no staging environment with realistic data, so retrieval quality could only be validated against a sanitised extract that behaved differently from production. Secrets lived in a config management system that predated the company's vault, so the new service needed a secret path someone had to approve. And the change board reasonably asked what a rollback looks like for a feature whose behaviour depends on a prompt and a model version, which is a question worth answering properly rather than deflecting.

What works is decoupling the two release cadences on purpose. The service itself goes through the normal process and changes rarely. Prompts, retrieval parameters and eval thresholds live in versioned configuration that can change without a deploy, gated behind a feature flag per user group, with the model version pinned explicitly so a provider update does not become an unannounced release. That buys you weekly iteration inside a quarterly release train, and it is the single highest-leverage thing to agree with platform and security during scoping instead of after. Pilots that skip this make up a large share of the ones that [never reach production](/en/blog/ai-pilot-to-production-scoping).

## Run this before you accept a number

Seven checks, each answerable in a day or two by someone already inside your organisation:

- Where is authorisation computed for the data the feature will read, and can it be called as a function from a new service?
- Which table or field is authoritative for the text you need, and does that answer change for older records?
- Is there a reliable change signal (timestamp, CDC, event stream) for incremental re-indexing, or will you be re-indexing everything?
- Can a new service in production make outbound calls to your chosen model provider, today, without a firewall change?
- What is the shortest path from merged code to production for a new service, in calendar days, including approvals?
- Does a staging environment exist with data that resembles production closely enough to validate retrieval quality?
- Who owns the legacy codebase, and how much of their time is committed to this in writing?

Any question you cannot answer is a line item, not a detail. Hand the answers to whoever is quoting and watch whether the estimate changes. A vendor who has done [a full build with all its layers](/en/blog/full-ai-feature-build-scope-cost) will adjust. One who says it does not affect the timeline has not integrated with anything old.

## What to ask someone who has only built greenfield

Ask which legacy auth model they inherited most recently and how they mapped it to retrieval. Ask for the ugliest schema decision they had to work around, and what they chose instead of fixing it. Ask what their deploy story becomes when the customer's release process is quarterly. Ask who on their side talks to the platform team, because if the answer is "we assume that is handled internally", it is you, and that work is unbudgeted. The [technical questions worth asking any AI vendor](/en/blog/vet-ai-vendor-before-you-sign) still apply; these four are the brownfield additions.

The structural reason these projects slip is fragmentation. Permission mapping, schema archaeology and pipeline onboarding each need someone who can read the old code, talk to the platform team, and still build the feature. Split that across a model wrapper shop and two freelancers and the integration seams turn into status meetings.

A Full Build at Jaize Tech is six to twelve weeks with one senior engineer owning the backend, frontend, model integration, infrastructure and deploy together, which is the shape this work needs when the feature has to integrate AI into an old codebase rather than start clean. If you are scoping one against a system that predates your current stack, the [services page](/en/services) has the scope, and you can send me the seven answers above through [contact](/en/contact).
