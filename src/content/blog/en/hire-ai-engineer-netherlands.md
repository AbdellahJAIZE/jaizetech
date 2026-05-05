---
title: "How to hire an AI engineer in the Netherlands"
description: "Three options to get senior AI engineering into a Dutch scale-up in 2026. The real cost of each, when each fits, and the red flags to avoid."
published: "2026-04-15"
tags: ["hiring", "fractional CTO", "Netherlands", "AI engineering"]
ogImage: "/og-image.png"
primaryService: "fractional-cto"
---

You need AI engineering in your product. The board wants a roadmap by Q3, your competitors are shipping features that look like magic, and the one engineer on your team who reads the OpenAI changelog has now become "the AI person" by accident. So you open LinkedIn Recruiter and start the search.

Six months later you have paid a recruiter, hired someone with a great CV, watched them build an internal demo nobody uses, and you are back where you started. I have seen this pattern in Dutch scale-ups often enough that it deserves a post.

There are three real ways to get senior AI engineering into a 5 to 50 person company in the Netherlands in 2026. Full-time hire, agency engagement, or fractional advisor. Most teams default to option one without comparing the other two. Here is what each actually costs, when each fits, and how to avoid the wrong one.

## The three options, with honest market numbers

**Full-time hire.** A mid-to-senior AI engineer in the Netherlands lands somewhere between 75k and 110k base, with senior specialists in Amsterdam pushing past 130k once you add the schaarstetoeslag pressure on AI roles. Add 30 percent for employer costs (pension, holiday pay, vakantiegeld, sick leave reserves) and you are paying 100k to 170k all-in. Add a recruiter fee of 15 to 25 percent of first-year salary and you are out another 15k to 30k before the person writes a line of code.

**Agency engagement.** Dutch AI consultancies bill anywhere from 950 to 1500 euro per day for a senior, more for the named-partner shops in the Zuidas. A typical scope (one feature, end to end, eight to twelve weeks) lands between 60k and 130k. You get speed and a team behind one person. You also get someone whose incentive is to keep the engagement running.

**Fractional CTO or AI advisor.** Two to three days a week, embedded in your team, usually 800 to 1400 per day depending on seniority and scope. Monthly burn lands between 6k and 20k. No recruiter fee, no severance exposure, no onboarding ramp. The arrangement ends when you do not need it anymore. I am biased here because this is what I will be offering from June 2026, but the math is the math.

You can read more about how I structure these on my [services page](/services). The honest version is that all three options have a place. The mistake is choosing without doing the math.

## The hidden cost of a wrong full-time hire

The published salary is the smallest part of the bill.

A senior engineer in the Netherlands needs roughly 8 months to be fully productive in a non-trivial codebase. That is not a slow-onboarding problem, that is a normal problem. Half-productive for the first 4 months, three-quarters productive by month 6, fully shipping by month 8. If you hired the wrong person, you usually do not know it until month 5 or 6. By then they have written code your team will maintain for years.

Run the numbers on a wrong hire at 95k base.

Recruiter fee at 20 percent. 19k.
Employer overhead for 8 months. Around 50k.
Salary for 8 months. Around 63k.
Severance under Dutch law (transitievergoeding plus negotiated exit). 5k to 15k for someone under two years.
Opportunity cost of the roadmap that did not ship. This is the big one and nobody puts it in the spreadsheet.

You are at 140k to 160k of cash spent and a team that is now skeptical of the next AI hire. If your runway is 18 months, you just spent 7 percent of it on a hire that did not work.

This is not an argument against hiring full-time. Once you have two or more active AI projects, a clear product direction, and an existing engineer who can mentor, full-time is correct. The argument is against defaulting to it.

## When fractional beats full-time

Fractional fits when at least three of these are true.

You need less than 30 hours a week of senior AI attention. You have one or two AI projects, not five. You do not yet have a team of AI engineers to manage, just one or two engineers who could grow into it with the right guidance. You are still in the exploration phase, deciding what to build before you commit to a year of building it. Your CTO is strong on backend or product but has never shipped a model to production.

Fractional does NOT fit when you are shipping a launch in under three months and need someone making daily product decisions inside the team Slack at 9am. It also does not fit when the work is genuinely full-time, like rebuilding a recommendation system from scratch with a team of four. At that point you need a full-time tech lead, not an advisor.

The signal I look for: are you trying to figure out *what* to build, or are you trying to *build* a thing that is already specified? Fractional is excellent for the first. Full-time or agency wins the second.

## What a good AI engineering interview looks like

Most Dutch tech interviews still over-index on academic ML. The candidate gets asked to derive backpropagation, explain attention from scratch, or solve a leetcode hard. None of this predicts whether they can ship a RAG system that does not hallucinate in production.

Here is what works better.

**System design on your actual problem.** Forty-five minutes. Bring a real problem your team is stuck on. Watch how they think. Do they ask about your data first, or do they jump to model selection? Do they cost out the inference, or do they assume GPT-4 for everything? Do they think about evals before they think about the model? Strong candidates ask boring infrastructure questions early.

**Code review of your existing AI feature.** Show them 200 lines of your own code (sanitised). Ask what they would change. This is the single best signal you can get. Senior engineers will spot the prompt injection risk, the missing retry logic, the silent token budget overrun. Junior engineers will compliment your variable naming.

**The broken-thing question.** "What was the last AI thing you shipped that broke in production, and how did you fix it?" If they cannot answer this with a specific story, they have not actually shipped. They have built demos. There is a difference. Real engineers tell you about the embedding model that returned NaN for empty strings, the Pinecone index that hit its quota at 3am, the LLM call that started returning JSON with a leading newline after a model update.

**Cost trade-off question.** "Walk me through how you would decide between fine-tuning, RAG, and a longer prompt for this problem." Listen for whether they reach for evals, dollars, and latency, or just say "RAG is more flexible".

If your interview is two coding rounds and a culture chat, you are filtering for the wrong thing. You can read more about how I think about this on my [about page](/about), where I lay out my own production background.

## Red flags in CVs and agency pitches

Some patterns that should slow you down.

**Buzzword salad.** A CV that lists LangChain, RAG, AI Agents, LLM, Vector DB, Multi-Modal, Fine-Tuning, RLHF, and MLOps but does not link to a single live URL or production credit. Anyone can list these. Few have shipped them.

**No production credentials.** "Built an AI assistant" with no link, no company name, no user count, no uptime story. The person may be brilliant. They may also have never had a real user complain at 11pm.

**Never been on-call.** AI features fail in interesting ways. Models drift, prompts regress after vendor updates, vector indexes get corrupted, third-party APIs throttle without warning. If your candidate has never been woken up by a production AI bug, they have not learned the lessons that matter.

**Cannot articulate cost.** Ask any senior AI engineer what their last system cost to run per 1000 requests. They should know within an order of magnitude. If they shrug, they have been working in environments where someone else paid the bill.

**Demo-quality portfolio with no live URLs.** Beautiful Streamlit apps, screenshots of impressive notebooks, a Medium post per month. No live system you can hit. This is the most common pattern in 2026 because LLMs make demos cheap. Production is still hard.

The agency version of these red flags looks like: a deck with logos of clients they did discovery work for but never shipped to production, case studies that describe the problem in detail and the outcome in vague percentages, and a refusal to name the specific engineer who will do your work.

For the fractional version, the red flag is someone who has only ever consulted, never had a payroll job. They may be a great consultant. They probably do not know what it feels like to maintain code for three years.

## A practical checklist before you sign anything

Five questions to ask any AI engineering hire, agency, or fractional before you commit. Use them in the final conversation, not the first.

1. **Show me a system you shipped that is still running.** Not a demo. A live URL or a customer login. If they cannot produce one, stop here.

2. **What is the most expensive AI mistake you have made in production, and what did it cost?** You want a specific dollar figure or a specific incident. Vague answers mean they have not had skin in the game.

3. **Walk me through your evals strategy for a RAG system.** Listen for whether they talk about golden datasets, regression suites, and human-in-the-loop review, or just "we test it manually".

4. **What would you NOT use an LLM for in our product?** Strong candidates have a list. Weak candidates think LLMs solve everything.

5. **How do you handle a model vendor changing behaviour overnight?** This happened twice in 2025 and once already in 2026. Their answer tells you whether they have lived through it.

6. **What is your stop-loss?** When would you tell us this engagement is not working and we should stop? A senior engineer or advisor who cannot answer this is selling you a permanent retainer.

7. **Who else is on this with you?** For agencies, get the named engineer on the call. For fractional, ask what happens if they get sick for two weeks. For full-time, ask who they would call for help if they got stuck on something outside their expertise.

## The short version

A wrong full-time AI hire in the Netherlands costs you 140k and 8 months. A right one is the best money you can spend, but only when the work is genuinely full-time and the direction is set. An agency is good for delivering a defined scope on a deadline. A fractional advisor is good for figuring out what to hire, what to build, and what to stop building, before you spend the 140k.

Most Dutch scale-ups I see right now are in the third bucket and hiring as if they were in the first.

If you are weighing one of these three options for your team, a 15-minute call is usually the fastest way to know which one fits your situation. You can [book one here](/contact). No pitch, just a straight read on which path makes sense for where you are.

## Related reading

- [Build vs buy AI features: math for your CTO](/blog/build-vs-buy-ai-features). Before you hire, decide whether to build at all.
- [EU AI Act checklist for Dutch software teams](/blog/eu-ai-act-checklist-dutch-software-teams). The compliance work your new hire will need to handle.
