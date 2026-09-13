---
title: "How Long to Build an AI Feature? Four Real Timelines"
description: "Wondering how long to build AI feature projects actually take? Four project shapes, honest week ranges, and what eats the middle third of the build."
published: "2026-09-13"
tags: ["AI development", "software engineering", "product timelines", "AI implementatie", "SaaS"]
ogImage: "/images/blog/how-long-to-build-an-ai-feature/cover.jpg"
primaryService: "ai-features"
---
Type "how long to build AI feature" into a search box and you get two kinds of answers. Vendors say two weeks. Engineers say "it depends". Both are useless to you right now, because you just got the budget approved and someone in the leadership meeting wants a launch date before Friday.

I have built enough of these end to end to give you a better answer than either. Not a single number, because that would be a lie, but four concrete project shapes with honest week ranges, a week-by-week example, and the part every estimate leaves out: the middle third of the project, where nobody is integrating a model and everybody is fighting evals, latency and edge cases.

If you are still deciding whether to build at all, read [the build-versus-buy math](/en/blog/build-vs-buy-ai-features) first. This post assumes you have decided. You want to know how long it takes, what shrinks it, and what to ask a vendor who quotes you a timeline on the first call.

## Why every AI feature timeline you've been given is wrong on day one

The two-week number is not a lie in the way you think. Two weeks is genuinely how long it takes to get a demo that works. I can wire a chat window to a model, point it at your docs, and have it answering questions in a few days. That is the demo you saw at the vendor pitch. It is also the demo your own team can build in a hackathon.

The problem is that the demo is roughly the first 20 percent of the work, and it is the only 20 percent that is visible from the outside. Everything after that, the part that turns a demo into something you can put in front of paying customers without a support incident, is invisible until it is missing. I wrote a long punchlist of [what actually breaks when AI hits production](/en/blog/what-breaks-in-ai-production); the short version is that none of it shows up in week two.

So the vendor is not lying. They are quoting the part they know how to quote. The "it depends" engineer is not being difficult either; they have seen the other 80 percent and do not want to be held to a number before they know what your data looks like. Neither of them is giving you what you need, which is a range with the assumptions attached.

## How long to build AI feature work: the four project shapes and their week ranges

Almost every AI feature I get asked to build falls into one of four shapes. The shape, not the industry and not the model, is what determines the timeline. These ranges are from a senior engineer working on it as the main thing, with a product owner on your side who can answer questions within a day. Double them if the engineer is doing this alongside a full sprint load.

![How Long to Build an AI Feature? Four Real Timelines](/images/blog/how-long-to-build-an-ai-feature/1.jpg)

**Chatbot on your documents (RAG assistant): 6 to 8 weeks.** Support assistant, internal knowledge base, "ask our docs". The model integration is a day. The time goes into ingestion (your documents are messier than you think), chunking and retrieval quality, the eval set, and the failure modes I described in [why RAG breaks in prod](/en/blog/rag-breaks-in-production). Six weeks if your content lives in one system and is reasonably current. Eight if it is spread across Confluence, SharePoint, a PDF folder and someone's Google Drive.

**Agent with tools: 8 to 12 weeks.** Anything that acts: looks up an order, updates a CRM record, drafts and sends, schedules. Every tool is an integration with its own auth, rate limits and failure modes, and every tool the agent can call is something the agent can call wrongly. The extra weeks over the chatbot are permissions, guardrails, a human-approval step where money or data is touched, and testing multi-step paths that fail on step four. Twelve weeks when there are more than five tools or the tools write to systems of record.

**Extraction pipeline: 6 to 10 weeks.** Invoices, contracts, intake forms, emails into structured data. This shape looks simplest and is the most sensitive to your data. If the documents are uniform, six weeks. If there are twelve vendors with twelve layouts, scanned pages and handwritten notes, ten. The eval here is unforgiving because the output goes into a database, not into a chat window where a human reads it first. My [document intelligence patterns](/en/blog/document-intelligence-ocr-llm-extraction) post covers what the pipeline itself looks like.

**Voice or real-time: 10 to 14 weeks.** Phone agents, live transcription with actions, anything where latency is measured in hundreds of milliseconds and a pause of two seconds feels broken. All the work of the agent shape, plus audio infrastructure, interruption handling, telephony and a completely different eval problem. I have [benchmarked the stack](/en/blog/voice-ai-b2b-livekit-openai-realtime-benchmarks) and I still budget the top of the range. This is the shape where a two-week quote should end the conversation.

Notice what is not on the list: the model. Swapping GPT for Claude for Gemini for a self-hosted Qwen is days, not weeks. If a vendor spends the first call on which model they will use, they are talking about the part that does not drive your timeline.

## What eats the middle third: evals, latency and cost tuning, not model integration

Here is the shape of every one of these projects on a calendar. First third: the demo, plus infrastructure and data access. Last third: hardening, rollout, handover. And a middle third that is almost entirely three activities nobody puts in a proposal.

**Building the eval set.** You cannot tell whether a change made the feature better without a set of real inputs with known-good outputs. In my experience you need roughly 150 to 300 examples before the numbers stop moving around when you re-run them, and they have to be real cases from your data, not ones the engineer made up. Collecting them, labelling them with your domain expert, and building the harness to run them takes one to two weeks by itself. Teams skip this, ship on vibes, and then spend the same two weeks after launch in incident mode. I have written about the [continuous eval loop](/en/blog/llm-evaluation-production-continuous-eval) that comes out of this step; the build project is where it starts.

**Latency and cost tuning.** The demo used the biggest model with no caching and nobody cared that a response took nine seconds. Real users care. The middle third is where you route easy cases to a smaller model, add prompt caching, cut the context you are stuffing into every call, and parallelise the retrieval. This is also where the per-request cost drops from "fine for a demo" to something that survives ten thousand users a day; the numbers in my [production LLM cost post](/en/blog/cost-of-production-llm-2026) are the output of this work, not the input to it.

**Edge cases.** The long tail of inputs that the demo never saw: the question in Dutch when the docs are in English, the PDF that is actually an image, the customer who asks three things in one message, the tool that times out. Each one is an afternoon. There are thirty of them. That is the week.

None of this is glamorous and none of it is "AI" in the way the leadership deck imagines it. It is the difference between a feature that works in a demo and one that works on a Tuesday afternoon with a real customer.

## A worked timeline: a B2B SaaS team ships a support-ticket AI feature

Concrete example, composite of projects I have done. A B2B SaaS company with a 12-person support team wants an AI feature inside their helpdesk: classify incoming tickets, draft a reply from the help centre and past resolved tickets, and let an agent edit and send. Agent shape, lightly: two read tools, one write tool with a human in the loop. I would quote 10 weeks and here is where they go.

**Week 1.** Access to the helpdesk API, the help centre export and a year of resolved tickets. Data protection review, because past tickets contain customer data; the [GDPR question for Dutch teams](/en/blog/company-data-openai-gdpr-netherlands) gets settled here, not in week nine. Product owner and I agree on what "good draft" means and pick 200 tickets to become the eval set.

**Week 2.** The demo: retrieval over help centre and past tickets, a draft appears in a sidebar. Everyone is excited. This is the week the vendor would have called "done".

**Week 3.** Support leads label the 200 eval tickets. First eval run. Drafts are acceptable on roughly half of them. The other half reveal that the help centre is out of date for two product areas and that past tickets are full of resolutions that were correct a year ago and wrong now. This is a content problem and a retrieval problem and it costs a week to fix.

**Weeks 4 and 5.** Classification and routing. Latency drops from seven seconds to under three by moving classification to a small model and caching the system prompt. The eval climbs into the seventies. Edge cases start: multi-question tickets, angry customers where a cheerful draft is wrong, tickets in Dutch.

**Week 6.** Guardrails. The draft must never promise a refund, a date or a feature. A second, cheap model check catches these before the draft is shown. Hallucination cases in the eval get their own category and a target. The human-approval step gets its actual UI.

**Week 7.** Shadow mode. The feature runs on every live ticket, nobody sees the drafts, we log everything. This finds the ticket types that never made the eval set, which is the point.

**Week 8.** Three support agents use it for real. Feedback buttons, trace logging, a dashboard with acceptance rate, edit distance and cost per ticket. Prompts go under version control with a rollback.

**Week 9.** Full support team. Cost per ticket lands at a few cents. Acceptance rate stabilises. Two edge cases from real use fixed the same day.

**Week 10.** Handover: runbook, eval harness the team can run themselves, alerting on drift, a written list of what the feature does not do. Done.

The model was chosen in week 2 and swapped once in week 4. Total time spent on "AI integration" in the way people imagine it: maybe four days out of fifty.

## What actually shrinks the timeline, and what never does

Things that genuinely take weeks off:

- **Clean, centralised data.** One source of truth for the documents or records the feature reads. This is the single biggest lever and it is entirely on your side of the table.
- **A domain expert with real hours.** Someone who can label eval cases and answer "is this draft right?" within a day. Every day of waiting on that answer is a day the project is stalled.
- **Narrow scope on version one.** The support feature above shipped with three tools, not nine. Everything else went on a list for version two. The [pilot scoping post](/en/blog/ai-pilot-to-production-scoping) covers how to draw that line.
- **Existing infrastructure.** If you already have observability, a deploy pipeline and a way to feature-flag, that is a week I do not spend building them.

Things that never shrink no matter who you hire:

- **Building the eval set.** You can pay a senior engineer or a junior one; the domain expert still has to look at 200 cases.
- **Shadow mode and staged rollout.** Real traffic reveals things synthetic traffic cannot, and it reveals them at the speed real traffic arrives.
- **Legal and data review.** If it is not started in week one, it lands in week eight as a blocker.

A senior engineer does not make the eval set label itself. What a senior engineer does is know on day three which of the thirty edge cases matter and which can wait, avoid the two-week detour into a framework that will be replaced, and refuse to promise a date before seeing your data. That is the difference between the low and high end of every range above; it is not the difference between eight weeks and two.

## What "done" looks like before you call it shipped

Because "the demo works" is not it, here is my definition, and I would put it in the contract:

- An eval set of real cases, with a number, that runs on every prompt or model change.
- p95 latency and cost per request measured against a target you agreed in week one.
- Traces stored for every request: prompt version, retrieved context, tool calls, output.
- Prompts versioned with a one-command rollback.
- A kill switch, per feature or per topic, that a non-engineer can flip.
- A written list of what the feature explicitly does not handle, and what happens when it hits one of those cases.
- A runbook your team can follow when the acceptance rate drops next quarter.

If a build finishes without those, it is not finished, it is a demo with users. That version of "done" is what pulls people into a hardening project six months later.

## Four questions to ask a vendor who gives you a timeline on the first call

Whether it is an agency, a freelancer or me, ask these before you sign anything:

1. **"Which of the four shapes is this, and where in the range do we sit?"** If they cannot name a shape and a reason for the low or high end, they have not thought about your project yet.
2. **"Where in your timeline is the eval set built, and who labels it?"** The right answer names a week and names someone on my side of the table. "We test thoroughly" is not an answer.
3. **"What is the earliest week this runs on real traffic, and in what mode?"** Shadow mode by roughly the two-thirds point. If the first real traffic is launch day, the timeline is fiction.
4. **"What does your definition of done include, in writing?"** Compare it with the list above. Anything missing is a cost you will pay later, usually to someone else.

If you would rather bring the build in-house, [hiring an AI engineer in the Netherlands](/en/blog/hire-ai-engineer-netherlands) is a separate calculation, and the honest timeline for that is the hiring time plus the same ranges above.

## Where this becomes an engagement

If you have the budget and a feature that fits one of these shapes, a [Full Build](/en/services) is a senior engineer owning it end to end for six to twelve weeks: the AI feature and the product around it, with the eval set, staged rollout and definition of done above built into the plan from week one. If you want a realistic timeline for your specific feature before you commit to a launch date, [get in touch](/en/contact) and we will map it against your data and your team in the first conversation.
