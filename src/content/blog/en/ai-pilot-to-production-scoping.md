---
title: "Most AI pilots never ship. Here is how to scope one that does."
description: "The demo works, everyone is excited, and six months later nothing is in production. The fix is almost never technical. It is in how you scope the pilot. Here is the checklist I use before writing a line of code."
published: "2026-05-26"
tags: ["AI strategy", "production AI", "AI pilot", "scoping"]
ogImage: "/og-image.png"
primaryService: "ai-features"
---

The pattern is so common it is almost a ritual. A team builds an AI demo in two weeks. It works. Everyone in the room is impressed. The CEO mentions it to the board. And then six months later it is still a demo, quietly parked behind a feature flag nobody dares to turn on.

I get called in at exactly this moment more than any other. The question is always some version of "we proved it works, why can we not ship it". The answer is almost never technical. The model is fine. The pilot was scoped to impress, not to survive contact with real users. Those are two different jobs, and the second one starts before you write any code.

This post is the scoping checklist I run through with a client before we commit to building anything.

## Why the demo lies to you

A demo is a controlled environment. You pick the inputs. You run it a few times. When it produces something good, you screenshot it. When it produces garbage, you run it again. That is not dishonest, it is just how demos work. But every one of those comforts disappears in production.

In production the inputs are whatever a real user types, including the empty string, the 40-page PDF, and the question in a language you did not plan for. There is no second run, the user sees the first answer. And nobody is standing by to screenshot the good outputs and ignore the bad ones. The system has to be right often enough, on its own, on inputs nobody chose.

The gap between those two worlds is where pilots die. So the scoping job is to close that gap on paper, before the build, while it is still cheap to change your mind.

## The six questions I ask before any build

### 1. What is the one workflow this replaces or accelerates?

Not "we want AI in the product". One workflow. A support agent answering tier-one tickets. A back-office clerk pulling fields off invoices. A salesperson drafting a first-pass proposal. If you cannot name the single human task this sits next to, the pilot has no edge to measure against and no obvious place to live.

Narrow wins. The most successful first features I have shipped did one small thing reliably. The failures tried to be a platform on day one.

### 2. What does "good enough to ship" actually mean, in a number?

This is the question that separates pilots that ship from pilots that drift. Before the build, you decide the bar. Ninety percent of invoices parsed with zero field errors. Tier-one tickets resolved without escalation 70 percent of the time. Whatever it is, write it down as a number, and build the small evaluation set that measures it.

If you skip this, "is it good enough" becomes a matter of opinion, and opinion never converges. I wrote about how to build that measurement in [evaluating an LLM feature without guessing](/en/blog/llm-evaluation-production-continuous-eval). Do it before the build, not after the first complaint.

### 3. What does a wrong answer cost?

A chatbot that suggests the wrong help article costs almost nothing. An AI that approves a refund, files a legal clause, or tells a patient something about their medication costs a great deal. The cost of being wrong decides how much of the rest of this checklist you need, and whether a human has to sit in the loop.

Teams routinely scope a pilot as if a wrong answer is free, then discover during launch review that it is not. Have that conversation in week one.

### 4. Where is the human, and what do they see?

Almost every shippable first feature has a human in the loop somewhere. The clerk who confirms the extracted fields. The agent who approves the drafted reply before it sends. The question is not whether to have one, it is where they sit and what you show them.

Show the human the confidence, the source, and an easy way to correct it. A correction is not a failure, it is your best training signal and your cheapest insurance. Designing the human step well is often more important than the model choice.

### 5. What is the smallest model that clears the bar?

Teams reach for the biggest, most expensive frontier model because it is the safest demo choice. In production that decision shows up every month on the bill, and the bill is bigger than anyone expects. I broke down [what a production LLM feature really costs](/en/blog/cost-of-production-llm-2026), and the model tier is a real lever inside it.

Set your quality bar first (question two), then find the smallest, cheapest model that clears it. Sometimes that is a frontier model. Often it is a mid-tier one with a good prompt and a bit of structure around it. You only know once you can measure.

### 6. What happens on the unhappy path?

The demo only ever shows the happy path. Production is mostly unhappy paths. The empty input. The vendor rate limit at 9am Monday. The malformed output that breaks the next step. The question that should go to a human and does not.

If your pilot has no answer for these, it is not a pilot, it is a screenshot. I covered the failure modes in detail in [what actually breaks when AI hits production](/en/blog/what-breaks-in-ai-production). Scope the unhappy path now, because it is where most of the real engineering lives.

## A worked example

A mid-sized Dutch logistics company wanted to "use AI to handle customer email". That is a platform, not a pilot, and it would have died like the others.

We scoped it down. One workflow: incoming delivery-status questions, which were 40 percent of their inbox. Good enough: a correct, sourced answer 85 percent of the time, measured on 150 real past emails. Cost of wrong: low, because a human reviewed every draft before it sent in the first phase. Human in the loop: the existing support agent, who saw the draft and the order it was based on, and clicked send or edited. Smallest model: a mid-tier one cleared the bar once we gave it structured access to the order system. Unhappy path: anything not about delivery status, or below a confidence threshold, was routed straight to a human untouched.

That shipped. Not because the model was special, but because every one of those decisions was made on purpose, before the build, instead of discovered in production.

## What to do this week

If you have a pilot stuck behind a flag, do not rebuild it. Take it through the six questions above and you will usually find the blocker is one missing answer, not the model. Most often it is question two, no agreed definition of good enough, which means nobody can sign off because there is nothing to sign off against.

If you are about to start a pilot, run the checklist before the build. It costs an afternoon and saves the six-month drift.

Scoping a pilot so it actually reaches production is most of what I do in an [AI feature build](/en/services). The deliverable is not a demo. It is a feature your team can turn on and leave on.

