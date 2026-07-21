---
title: "Can you legally send company data to OpenAI? A practical GDPR read for Dutch teams"
description: "The honest answer is usually yes, with conditions, and sometimes no. Here is how to decide, what a data processing agreement actually has to cover, and when to keep the data on your own infrastructure instead."
published: "2026-06-07"
tags: ["GDPR", "data privacy", "AI infrastructure", "compliance"]
ogImage: "/og-image.png"
primaryService: "infrastructure"
---

This is the question that stalls more Dutch AI projects than any technical problem. Someone in legal asks "are we allowed to send this to OpenAI", nobody is sure, and the project sits for a month while everyone waits for a clear answer that never quite arrives.

I am an engineer, not a lawyer, and this is not legal advice. But I have helped enough teams get past this exact blocker to know that most of the paralysis comes from not framing the question well. The real question is never "is AI allowed". It is "what data, to which provider, under what agreement, and is there a cheaper-risk way to get the same result". Break it down that way and the answer usually becomes obvious.

## First, separate the data, because not all of it is the same

The instinct is to treat "our data" as one scary block. It is not. Under the GDPR, the AVG as it is known here, only personal data carries the heavy obligations, and a lot of what you want to send is not personal data at all.

Sort what you are about to send into three buckets.

- **Not personal data.** Product specs, anonymised aggregates, public documents, internal text with no individuals in it. This carries no AVG obligation. You are arguing about nothing. Send it.
- **Personal data, low sensitivity.** A customer name in a support ticket, an email address, an order history. This is regulated but routine. It is allowed with the right agreement and the right safeguards, which is most of this post.
- **Special category or high-stakes data.** Health data, anything touching criminal records, data about children, or volumes large enough that a leak is a real harm. Here the bar is much higher and the honest answer is often "not to a general-purpose API, keep it close".

Most teams discover that 80 percent of what they wanted to send is in the first two buckets. The project does not need to wait on the hard 20 percent. Ship the easy part, ring-fence the rest.

## Second, the agreement that actually matters

If you are sending personal data to a provider, that provider is your processor, and the AVG requires a data processing agreement, a verwerkersovereenkomst, between you. This is not a formality you can wave through. A few things it genuinely has to nail down.

- **Purpose limitation.** The provider may only process the data to deliver the service to you, not to train their models on it. For the business API tiers of the major providers, training on your data is off by default, but you confirm this in writing, you do not assume it.
- **Sub-processors and location.** Where does the data physically go, and who else touches it. For a Dutch or EU company this is often the crux. Several providers now offer EU data residency and zero-retention options. If data leaving the EU is your blocker, this is the lever, and it is a configuration and contract question, not a reason to abandon the project.
- **Retention.** How long the provider keeps the data, and whether you can get a zero-retention or short-retention arrangement so prompts are not stored after the response.
- **Security and breach notification.** Standard, but check it is there.

The practical move is to read the provider's DPA and data residency options before the engineering starts, not after. Nine times out of ten the contract already supports what you need, and the month of waiting was just nobody reading it.

## Third, is sending it out even the right design?

Sometimes the cleanest way past the privacy question is to not send the sensitive data at all. Three patterns get you most of the way.

**Minimise before you send.** Strip or mask the personal fields the model does not need. If you are summarising a support thread, the model rarely needs the customer's full name and address to do the job. Redact at your edge, send the rest. Less personal data sent is less risk to manage, full stop.

**Pseudonymise.** Replace identifiers with tokens before the call and map them back in your own system afterwards. The provider sees "Customer 4471", never the real person. This is well-trodden and it materially lowers your exposure.

**Keep it in-house.** For the genuinely sensitive bucket, or for clients in regulated sectors who simply will not accept data leaving their walls, you run an open-weight model on infrastructure you control. The capability gap to the frontier has narrowed enough that this is a real option now, not a compromise. I worked through when this makes sense and what it costs in [hosting an LLM on your own infrastructure in the Netherlands](/en/blog/on-prem-llm-hosting-netherlands).

The point is that "send everything to OpenAI" and "build nothing" are not the only two choices. Most production systems I build sit in the middle, sensitive data minimised or kept local, everything else handled by the best available API.

## Where this sits next to the EU AI Act

GDPR and the EU AI Act are different laws answering different questions. GDPR is about the personal data going in. The AI Act is about what the system does and how risky that use is. You can satisfy one and still owe work on the other. If you are scoping a feature, you check both, and I put the AI Act side into a practical list in [the EU AI Act checklist for Dutch software teams](/en/blog/eu-ai-act-checklist-dutch-software-teams).

## A short decision path

When a team brings me the "are we allowed to send this" question, this is roughly how we get to an answer the same day.

1. Sort the data into the three buckets. Most of it is not the hard kind.
2. For the personal-data part, read the provider's DPA and turn on EU residency and zero-retention if those are your constraints.
3. Minimise and pseudonymise so you send the least personal data that still does the job.
4. For the genuinely sensitive remainder, keep it on infrastructure you control rather than forcing it through a public API.
5. Check the AI Act question separately, because GDPR clearance is not AI Act clearance.

None of this needs a month. It needs someone to frame it correctly and read two documents.

Getting a team unstuck on exactly this, with an architecture that is both compliant and actually shippable, is part of what I do on the [infrastructure and integration](/en/services) side. The deliverable is a clear data path you can put in front of both your CTO and your DPO without either of them flinching.

