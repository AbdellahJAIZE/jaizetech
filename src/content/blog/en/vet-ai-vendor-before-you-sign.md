---
title: "AI Vendor Technical Questions Every Buyer Should Ask First"
description: "The AI vendor technical questions that separate real production experience from a good demo, with a 30-minute call script and scorecard."
published: "2026-09-20"
tags: ["AI vendors", "LLM development", "vendor evaluation", "AI in production", "technical due diligence"]
ogImage: "/images/blog/vet-ai-vendor-before-you-sign/cover.jpg"
primaryService: "ai-features"
---
You have three quotes on the table. One is from an agency with a nice deck, one from a two-person studio that "specialises in LLM apps", one from a senior freelancer who answered your RFP with a two-page email. The prices differ by a factor of three. The timelines differ by a factor of two. And the technical sections of all three proposals say roughly the same thing: "we will integrate a state-of-the-art LLM with your data using RAG".

I sit on the other side of these calls, and I also get asked by founders to sit in on them as the technical ear. The AI vendor technical questions that actually separate someone who has run an LLM feature in production from someone who has built a very good demo are not the questions buyers ask. Buyers ask about model choice, timeline and price. The answers to those are easy to rehearse. The answers to the questions below are not.

This is the script. It is built for a 30-minute call, it works if you are not technical yourself, and it ends with a scorecard you can put next to the three SOWs. It is also honest about the outcome where the right answer is to sign nothing.

## The moment: three vendor calls, three completely different technical answers

The reason the proposals look alike is that every vendor is describing the same first three weeks. Model integration, a vector database, a chat UI, a demo. That part has become close to commodity: a competent developer can get a working RAG assistant or a tool-calling agent running in days. I wrote about how [a full build actually has seven layers and most quotes price three](/en/blog/full-ai-feature-build-scope-cost); the missing four are evals, monitoring, cost and latency control, and the operational handover. Those are the layers that decide whether the thing is still running in month six.

So the comparison you need to make is not "who builds the demo best". It is "who has personally been paged at 3am because an LLM feature broke, and what did they change afterwards". You cannot read that off a proposal. You can hear it in about two minutes on a call, if you ask the right thing.

## The one question that filters out wrapper shops in under two minutes

Ask this, and then stay quiet: **"Tell me about the last AI feature you shipped that broke in production. What broke, how did you find out, and what did you change?"**

![AI Vendor Technical Questions Every Buyer Should Ask First](/images/blog/vet-ai-vendor-before-you-sign/1.jpg)

A vendor who has run production AI answers with specifics and slightly too much detail. Retrieval quality collapsed when the client's corpus went from 300 documents to 12,000, and they found out from a support ticket rather than a dashboard, and they added a nightly eval run against a golden set afterwards. Token costs went 5x in week two because nobody capped the conversation history. A model provider silently changed behaviour on a minor version and 4% of structured outputs stopped parsing. The stories are boring, operational, and a bit embarrassing. That is what real looks like.

A wrapper shop answers in one of three ways. "Nothing really broke, our builds are solid." Or a pivot to a customer-satisfaction story. Or a generic answer about hallucinations that could have come from a blog post. None of these are lies, necessarily. They just tell you that this vendor has handed things over at demo stage and never watched what happened afterwards. If you get one of those answers, the rest of this call is about whether they are honest about being a build-only shop, which is a legitimate thing to be, as long as you price the missing layers yourself.

## AI vendor technical questions on evals and monitoring, and what a dodge sounds like

The word "evals" is where most vendor calls go quiet. Ask it plainly: **"How will we know, every week after launch, whether the feature is getting better or worse?"**

The answer you want has three components. A **golden set**: a fixed collection of real inputs with agreed-correct outputs, ideally 100 to 300 cases drawn from your data, not synthetic ones. A **scoring method**: exact-match or schema validation for structured outputs, an LLM-as-judge with a written rubric for free text, and a human spot-check on a sample. And a **trigger**: the eval runs on every prompt change, every model upgrade, and on a schedule against live traffic samples. I described the loop in detail in [the continuous eval piece](/en/blog/llm-evaluation-production-continuous-eval); a vendor does not need to use my version, but they need to have one.

Dodges sound like this:

- "We test extensively before launch." Testing before launch is not evaluation after launch. The model, the data and the users all change.
- "We use GPT-4 / Claude / Gemini so quality is very high." Model choice is not a quality strategy.
- "We can add monitoring in a later phase." Monitoring designed in afterwards is monitoring that captures the wrong things. Ask what "phase two" costs and whether it is in the quote.
- "We log all the conversations." Logging is storage. Ask what fires an alert, and who receives it.

Follow with: **"What does the dashboard look like on day 30? Name three numbers on it."** A production vendor will name something like answer-acceptance rate, retrieval hit rate or citation precision, and p95 latency, plus cost per conversation. If the three numbers are uptime, number of requests and user count, they are describing a web app, not an AI feature.

## Cost control, latency, and who owns the 3am pager

Three questions, asked in order.

**"What will one conversation cost at 1,000 users a day, and what stops it from being 5x that?"** You want a number with a range, and you want a list of the controls: capped context windows, summarised conversation history, model routing (a smaller model for classification and routing, the expensive one only where it earns its keep), caching of repeated retrievals. A vendor who quotes a per-token price from the provider's website and multiplies has not run this in production. In my experience the honest range for a text RAG assistant is a few cents per conversation when it is engineered and ten times that when it is not, and the difference is entirely design decisions made in the first four weeks.

**"What is your p95 latency target, and where in the pipeline do you expect to lose the time?"** The answer should mention the actual bottlenecks: embedding and retrieval, the first-token wait on the model, any tool calls the agent makes in sequence, and streaming to the UI. A vendor who says "the model is fast" has not measured. Most of the latency problems I get called in to fix are not the model at all; they are sequential tool calls and un-indexed retrieval, and I wrote up [how to find the real bottleneck](/en/blog/llm-latency-audit-production) if you want to check their answer against it.

**"It is 3am on a Saturday in month two and the feature is returning garbage. Who finds out first, who fixes it, and what does that cost me?"** This is the question most buyers never ask and most SOWs never answer. Acceptable answers include a defined support window with a named escalation path, a hypercare period after launch with concrete duration, or an honest "after handover, your team owns it, and here is what we do to make that possible". Unacceptable is silence, or "we are always available on Slack", which means nobody is on call.

## What handover has to include before you sign, not after you're stuck

Every vendor says they will "hand over the code". Code is the least valuable part of what you need. The feature will be re-prompted, re-indexed and re-deployed dozens of times in its first year, and if your team cannot do that safely, you are renting the feature from the vendor whether the contract says so or not.

Handover, written into the SOW as deliverables, should include:

- **Prompt versioning with regression tests.** Prompts live in version control, every change runs the golden set, and a diff in scores blocks the deploy. If the vendor does not have this, [prompt changes will cause silent regressions](/en/blog/prompt-versioning-regression-testing) within weeks of them leaving.
- **The eval harness itself, runnable by your team.** One command, a report, no vendor account required.
- **Infrastructure as code and a documented deploy.** Not a Notion page; a script someone on your team has executed at least once with the vendor watching.
- **A runbook for the five most likely incidents.** Retrieval returns nothing, model provider outage, cost spike, output schema failure, data source changed shape. Each with a detection signal and a first action.
- **Access and ownership.** Every API key, model provider account, vector database and observability tool is in your organisation's name from day one. I have seen a company lose two weeks of production because the OpenAI account was on a departed contractor's email.
- **A knowledge transfer session with your engineers, recorded.** Half a day minimum for anything agentic.

Ask the vendor to walk you through the last handover they did. If the description is "we shared the repo and did a call", you now know what you are buying.

## Five answers that sound confident but are red flags

**"We are framework-agnostic, we can use LangChain, CrewAI, whatever you prefer."** Sounds flexible. Actually means they have no opinion, which means they have not been burned. Anyone who has run agents in production has strong views about [which frameworks survive](/en/blog/agent-frameworks-2026-what-survives-production) and will tell you what they would refuse to use.

**"We fine-tune the model on your data for maximum accuracy."** For most business features this is the wrong first move; RAG plus good retrieval gets you further, faster, and stays updatable. A vendor who leads with fine-tuning is either selling GPU hours or has not asked what your data actually looks like.

**"Hallucinations are basically solved with the latest models."** They are not. They are managed with grounding, citations, refusal paths and evals. This answer tells you the vendor will be surprised in production.

**"We handle GDPR by using the EU region."** Region is one line of a longer answer. Ask about data processing agreements, retention on the provider side, PII in logs, and what happens to embedded document content. If they cannot answer, your DPO will stop the launch, not the vendor.

**"Fixed price, fixed scope, six weeks, everything included."** For a full build, a hard fixed price for all seven layers before anyone has seen your data is a sign the vendor intends to renegotiate at week four. The credible version is a fixed price for a scoping phase, then a build price with named assumptions. It is fine to compare that against the [agency, freelancer and senior-engineer routes](/en/blog/ai-feature-mvp-netherlands-build-options); just compare like with like.

## A 30-minute call script and one-page scorecard you can reuse

Run this in order. Do not send the questions in advance; the point is to hear how they think, not how they write.
0-2 min   Context: one sentence on your feature and your users.
2-6 min   "Last AI feature that broke in production: what, how found, what changed?"
6-12 min  "How will we know weekly if it's getting better or worse?"
          "Name three numbers on the day-30 dashboard."
12-18 min "Cost per conversation at 1,000 users/day; what stops it going 5x?"
          "p95 target and where you lose the time?"
18-22 min "3am Saturday, month two, garbage output. Who finds out, who fixes, what does it cost me?"
22-27 min "Walk me through your last handover. What did the client's team run themselves on day one?"
27-30 min "What would make you tell me not to build this?"

That last question matters. A senior engineer has talked clients out of builds before, and will tell you about one. I have; roughly one in four scoping conversations I have ends with "this is a search filter and a SQL query, not an AI feature", and the [pilot-to-production scoping](/en/blog/ai-pilot-to-production-scoping) discipline exists precisely to catch that before the SOW. A vendor who has never said no is selling capacity, not judgement.

Score each vendor 0, 1 or 2 on seven lines:

1. **Production failure story** – specific, operational, and followed by a concrete change.
2. **Evals** – golden set from real data, scoring method, triggers on prompt and model change.
3. **Monitoring** – three AI-specific numbers, an alert, a recipient.
4. **Cost control** – a per-conversation range and named design controls.
5. **Latency** – a p95 target and a credible account of where the time goes.
6. **Ownership after launch** – a named escalation path or an honest, priced handover.
7. **Handover deliverables** – versioned prompts, runnable evals, IaC, runbook, accounts in your name.

Fourteen is the ceiling. In my experience anything at 11 or above is a vendor who has run production AI and you can negotiate price with confidence. Seven to ten is a good build shop; buy the build, and budget separately for hardening and operations, with eyes open. Below seven, the demo will be lovely and the feature will be yours to keep alive from month two.

And if all three come in below seven and the last question made you realise the feature is thinner than the deck suggested, the right move is to sign nothing this quarter, spend a week scoping properly, and go back out with a sharper RFP. That is a cheaper outcome than any of the three SOWs.

## Where this becomes an engagement

If the scorecard tells you that you need a senior engineer who owns the feature end-to-end, including the evals, monitoring, cost controls and handover that most quotes leave out, that is what a Full Build is: six to twelve weeks, the AI feature and the product around it, built and handed over by one person who has been paged for it before. The scope and how it fits next to the other engagements is on the [services page](/en/services), and if you want a second technical ear on your vendor calls before you sign, [get in touch](/en/contact) and we will go through the scorecard together.
