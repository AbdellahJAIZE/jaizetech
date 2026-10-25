---
title: "AI Feature Build Scope Creep: Price It Before You Say Yes"
description: "AI feature build scope creep hits in week three. Here's the impact-assessment workflow that prices every mid-build change request in a day."
published: "2026-10-25"
tags: ["AI implementatie", "scope creep", "SOW", "projectmanagement", "AI features"]
ogImage: "/images/blog/ai-feature-build-scope-creep/cover.jpg"
primaryService: "ai-features"
---
Week three of a full build is when the thing starts looking real enough for people to have opinions about it. Retrieval is running against the customer's own documents, someone from sales has watched it answer a question correctly, and a message lands in the channel: "nice, could it also do X?" That message is where AI feature build scope creep actually begins, and most statements of work have nothing to say about it.

The paperwork usually covers two moments properly. Before the build there is a spec, a quote and a milestone plan. After the build there is a definition of done and a handover. The six to twelve weeks in between run on goodwill, which holds up fine until the third request, at which point either the engineer quietly absorbs the work and the date slips without anyone announcing it, or someone says "renegotiate" and the relationship changes temperature.

Here is the workflow I run when a change request arrives mid-build. It takes a day, it produces one page, and that page either gets signed or gets filed under phase two.

## AI feature build scope creep starts the week the demo gets real

Nobody asks for changes in week one. There is nothing to react to. The spec reads the way everyone agreed it would read, the architecture call has happened, and the first week is mostly data work: what is in the source systems, what the permissions model looks like, what is actually retrievable.

Requests cluster around the first demoable slice, which in a six to twelve week build tends to land somewhere in week three or four. That is the first time a stakeholder sees behaviour instead of a document. A spec sentence like "the assistant answers policy questions with citations" is abstract until you watch it cite the wrong version of a policy, and then it becomes three new requirements about document versioning.

This timing is also why the panic reaction is wrong. A change request in week three is the cheapest one you will ever get. The same request in week nine, after evals are written against the old behaviour and the integration is wired, costs several times more. The job is not to suppress week-three requests. It is to price them fast enough that the answer arrives while they are still cheap.

## Three places mid-project change requests come from

They are not all the same thing, and treating them the same is how a reasonable client ends up feeling stonewalled. In my experience the mid-build requests sort into three buckets, and each one deserves a different response.

![AI Feature Build Scope Creep: Price It Before You Say Yes](/images/blog/ai-feature-build-scope-creep/1.jpg)

**The stakeholder who finally saw it.** Someone outside the build loop watched the demo and noticed something missing. These are often small in words and large in work: "can it also handle the Dutch documents", "can users correct the answer", "can we see which chunks it used". Occasionally they are genuinely trivial. The honest reflex is not to say yes or no but to go and measure, because the gap between how a request sounds and what it costs is wider in AI work than in CRUD work.

**The build discovering reality.** This one comes from my side, not the client's. The export turns out to contain scanned PDFs nobody mentioned, the ERP exposes a SOAP endpoint instead of the REST API the docs described, the ground-truth set has 40 usable examples instead of 300. These are not scope creep at all, even though they look like it on a burndown. They are the [data readiness problems](/en/blog/ai-feature-data-readiness-checklist) that week one is supposed to surface, surfacing late. If I found it, I own the conversation, and the change order says so explicitly.

**The world moving.** A provider deprecates a model, the legal team comes back from an EU AI Act review with a logging requirement, a competitor ships something and the board asks a new question. Nobody is at fault. These usually have hard external deadlines attached, which makes them the most dangerous category for the timeline, because the pressure to just absorb them is highest.

Sorting the request before assessing it saves an argument later. A week-three request that falls in bucket two should never arrive at the client as an invoice.

## What a milestone-based SOW already absorbs

A lot of what gets called a change request is just the build working as designed. If the SOW is written around milestones and acceptance criteria rather than a task list, it already has room for iteration, and insisting on a change order for every adjustment is the fastest way to make a client stop telling you things.

Work that needs no change order:

- Prompt rewrites, few-shot changes, system prompt restructuring
- Swapping the model, or adding a cheaper model for a subset of calls
- Retrieval tuning: chunk size, overlap, reranking, hybrid search, metadata filters
- Growing the eval set, adding failure cases found during the build
- UI copy, empty states, error messages
- Anything that fixes behaviour the agreed acceptance criteria already describe

That list is not generosity, it is how the work gets done. If [milestones are tied to demonstrable behaviour rather than calendar dates](/en/blog/ai-feature-build-milestones-payment), the route to that behaviour is my problem, and I do not bill for choosing a different route.

The test for whether something crosses the line is narrow, and I apply it the same way every time. A request needs a change order if it does one of three things: adds a new data source, adds a new integration surface, or changes an acceptance criterion. "Make the citations more reliable" is build work. "Also index SharePoint" is a new data source. "Also let users edit the answer and write it back to the CRM" is a new integration surface plus a new criterion.

Say which one it is out loud. Half the friction in a change order AI project conversation comes from the client not knowing why this request costs money and the last one did not.

## The impact assessment that runs before anyone says yes

Never answer a change request in the thread it arrived in. The reply that costs the most is the fast confident one, especially "sure, that's small". Take a day, run the assessment, come back with a page. I aim to return it within two working days, and for most requests the real work is a few hours.

Five things the assessment has to establish:

**What it touches architecturally.** Does the request fit the shape already built, or does it reopen one of [the architecture decisions made in week one](/en/blog/ai-feature-architecture-decisions)? "Add Dutch documents" fits if the embedding model is multilingual and breaks the week if it is not. This is the question that turns a two-day estimate into a two-week one, so it goes first.

**Build days.** Not just implementation. New behaviour needs new eval cases, and new eval cases need labelled examples, which usually means someone on the client side spending time too. I estimate those client hours as well and put them in the document, because a change order that hides the customer's own effort gets agreed to and then stalls.

**Runtime cost.** An extra retrieval pass, a larger context, a second model call for verification: each one changes the per-request cost and the latency budget. If the feature has a cost target, and it should, the assessment says what the change does to it in euros per thousand requests. This is where [the layers most quotes forget](/en/blog/full-ai-feature-build-scope-cost) come back to bite.

**What it displaces.** With one senior engineer on a fixed window, every added day comes out of another day. The assessment names the specific work that moves, not "the timeline may be affected".

**The new date.** One date, with the milestone it attaches to.

## "Yes, but" is usually the right answer, and it has a price

Flat refusal is rarely correct and flat acceptance is never correct. The useful response offers three concrete shapes and lets the client pick.

**Swap.** The change goes in, something of comparable size comes out, the end date holds. This is my default suggestion, and it is the one clients underuse because dropping a feature feels like losing. It is usually the cheapest outcome for them. When a client sees the actual trade (Dutch document support in, inline answer editing out), the conversation gets concrete fast and sometimes the request withdraws itself.

**Extend.** The change goes in, the window grows by a named number of days, the cost grows with it. Fine for requests with real business value behind them, bad for requests that exist because someone enjoyed the demo.

**Defer.** The change goes into a phase two list with its estimate attached. Deferring is not a polite no if the estimate is real and the list is shared. Most of these requests belong here, and a client who sees their idea captured with a number next to it usually stops pushing for week-three delivery.

What makes this work is that all three options come with the same arithmetic underneath. Nobody is negotiating about whether the request is reasonable. They are choosing between three priced outcomes.

## The change that means the scope was wrong, not the client

There is one category that gets handled differently, and spotting it honestly is the difference between a build that ends well and one that ends in a procurement meeting.

Some requests are not additions. They are things the feature cannot be used without, that nobody noticed during specification because the spec described outputs and not the workflow around them. An assistant that answers correctly but gives the user no way to open the source document. An extraction pipeline with no path for a human to correct a bad extraction, in a process where corrections are routine. A classifier with no audit trail, in a team that gets audited.

The tell is simple: if the intended user cannot complete their actual job without it, it was never out of scope. It was missing from the spec. [A spec template that forces the end-to-end workflow to be written down](/en/blog/ai-feature-spec-template-vendor-quotes) catches most of these before the build, and the ones it misses are shared misses.

When this happens I say so plainly and absorb the work, or split it if the request also brings new capability along with the missing piece. It costs days. Arguing that a feature which cannot be used is nonetheless delivered costs considerably more, and the client who notices you did it is not calling back.

## The clause that turns this into a form

None of this needs a lawyer. It needs four or five lines in the SOW that pre-agree the process, so a week-three request triggers a form instead of a negotiation:
Change control
1. Either party may submit a change request in writing at any time.
2. Supplier returns an impact assessment within 2 working days:
   architecture impact, build days, runtime cost delta, displaced
   work, revised milestone date.
3. Customer selects one: swap (scope-neutral), extend (new date
   and fee), or defer to a named later phase.
4. No work begins on a change until the assessment is accepted
   in writing. The original milestone plan stands until then.
5. Changes required for the agreed acceptance criteria to be
   met are not change requests and carry no fee.

Point 4 is the one that saves the deadline. Point 5 is the one that keeps the client trusting the process, because it draws the boundary in their favour where the boundary belongs.

A build with this clause produces a short paper trail of decisions anyone can reread in month four. A build without it produces a date that moved for reasons nobody wrote down.

If you are planning a six to twelve week full build, write the change control process into the SOW alongside the milestones. When I take a build end to end, that clause is in it, and the impact assessment is something I can run in a day because I am the one who made the architecture decisions it touches. The [full build engagement](/en/services) covers the AI feature and the product around it, owned by one senior engineer for the whole window. If you are mid-build right now with a request on your desk and no process for it, [get in touch](/en/contact) and we can work through the assessment together.
