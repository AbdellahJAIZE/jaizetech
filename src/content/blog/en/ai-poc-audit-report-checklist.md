---
title: "AI POC Audit Report: What a Real One Actually Contains"
description: "A buyer's guide to the AI POC audit report: what belongs in it, what the 90-day plan needs, and five signs the audit is theater."
published: "2026-09-16"
tags: ["AI audit", "AI POC", "production readiness", "AI engineering", "technical due diligence"]
ogImage: "/images/blog/ai-poc-audit-report-checklist/cover.jpg"
primaryService: "ai-audit"
---
You have a demo that works. Someone has quoted you for an "AI audit" before it goes to production, or your own lead engineer has asked for a week to do one. Either way you are about to spend money on a document, and you have no way of knowing whether that document will be the most useful thing you read this quarter or a nicely formatted PDF that says "consider adding monitoring".

I run these audits as a one-week sprint, and I have read a fair number produced by other people. The difference between a real AI POC audit report and a rubber stamp is not the page count or the design. It is whether every claim in it comes with a number, a reproduction, an owner, and a date.

This post is the buyer's guide I wish more people had before signing. What the report should contain, section by section. What the 90-day plan needs to look like to actually be executed. What the readout call is for. Five signs the audit is theater. And a checklist you can run yourself this afternoon for free, whether or not you hire anyone.

## The moment you're staring at a quote and can't tell what you're buying

The quote usually says something like "assessment of production readiness", "architecture review", "best-practice recommendations". Two pages. A day rate or a fixed fee. Nothing in it tells you what you will hold in your hands on Friday.

That is the core problem with buying an audit: it is a knowledge product, and you cannot inspect it before you pay. With a feature you can look at the repo. With an audit you get a promise that someone will look at your repo and tell you something useful.

So define "useful" before you sign. In my experience a POC audit exists to answer exactly three questions:

- **What breaks first** when real users, real data volume and real cost hit this thing?
- **What is the evidence** for that, so my engineers do not have to take someone's word for it?
- **In what order do we fix it**, by whom, by when, and how do we know when each fix is done?

Everything else is a tour. If the quote does not commit to a written answer to those three questions, you are buying a tour. I wrote about the technical side of what an audit typically finds in [the audit before you get budget](/en/blog/ai-demo-to-production-audit); this piece is about judging the engagement itself.

## What a real AI POC audit report contains, section by section

A report I would put my name on has eight parts, and the order matters because it is the order in which your CTO will read it: scope first, evidence second, plan last.

![AI POC Audit Report: What a Real One Actually Contains](/images/blog/ai-poc-audit-report-checklist/1.jpg)

**1. Scope: what was actually examined.** The commit hash. The environment (laptop, staging, whatever it was). The data that was used. And, more important, what was *not* looked at. An honest report says "the ingestion pipeline was out of scope; I looked at the query path only". A report with no exclusions looked at nothing deeply.

**2. Findings, one per page, in a fixed format.** Every finding gets the same fields: severity (blocks launch / degrades at scale / cleanup), the evidence, the blast radius, an effort estimate in days, and a named owner. The evidence field is the whole report. Compare:

- "Latency may become a concern under load." Worthless.
- "At 20 concurrent users, p95 latency is 14.2 s against a 3 s target. The bottleneck is a synchronous embedding call per request. Reproduced with the k6 script in appendix B." Actionable.

**3. Load numbers.** Somebody has to put concurrent traffic on the system. Concurrency ceiling before errors, p50 and p95 latency at three load levels, error rate, and what fails first (rate limits, database connections, memory). If no load test was run, the audit did not audit production readiness; it audited code style.

**4. Unit economics.** Tokens per request, split into prompt and completion. Cost per 1,000 requests at today's model prices. Cost at ten times your expected volume. Where the tokens go (a 6,000-token system prompt repeated on every call is the classic one). This section is the one that changes budgets, so it needs to be arithmetic, not adjectives.

**5. Data and security surface.** Every external endpoint your data touches, and which vendor sits behind each. Whether a DPA exists. Where secrets live. The prompt injection surface: which user-controlled text reaches the model, and what the model can do with tools once it is there. For Dutch and EU companies this section also states whether anything here touches EU AI Act risk categories, in one paragraph, not ten.

**6. An eval baseline.** A set of 50 to 100 representative inputs with expected outputs, run against the current system, with the score. Without this, "it hallucinates sometimes" is an anecdote and any future improvement is unmeasurable. The eval set is left in your repo. It is the most reusable artefact of the week.

**7. Architecture verdict per component.** Keep, refactor, or rebuild, with one paragraph of reasoning each. Not a diagram of the ideal system. A verdict on the system you have.

**8. Appendix: scripts and raw numbers.** The load script, the eval runner, the token counting notebook. Your engineers must be able to re-run every number in the report without the auditor.

Fifteen to thirty pages is normal. Eighty pages is padding.

## The 90-day plan: what "fix this first" needs to look like on paper

The findings are the diagnosis. The plan is the reason you paid. And most plans I see fail the same way: they are a sorted list, not a schedule.

A usable plan has three horizons. Weeks 1 to 2: unblock, the things without which nothing else is measurable, usually the eval set and basic observability. Weeks 3 to 6: the launch blockers, in dependency order. Weeks 7 to 12: the degrades-at-scale items and the cleanup. Each item looks like this:

text
Item 4 — Move embedding to async batch job
Why:        Finding F-02 (p95 14.2 s at 20 users)
Owner:      backend lead (named)
Effort:     3 days
Depends on: Item 1 (load script in CI)
Done when:  p95 < 3 s at 20 concurrent users, verified by k6 run in CI
Not before: Item 2, or you will optimise the wrong path

Three things in that block separate a plan from a wish list. A named owner, not "the team". A measurable definition of done, not "improve latency". And explicit dependencies, because the most common way a 90-day plan dies is that the team starts with the most interesting item instead of the one that unblocks the rest.

A good plan also contains decision points: "At day 30, if the eval score is still below 80 percent on the retrieval set, stop tuning chunking and switch to a hybrid search; do not spend week 5 on prompt edits." That sentence saves more money than any finding, because it stops the team from doing the thing teams always do, which is iterate on the prompt for a month. The scoping logic behind these checkpoints is the same one I described in [how to scope a pilot that ships](/en/blog/ai-pilot-to-production-scoping).

And a plan says what *not* to do yet. No agents, no fine-tuning, no second vector store until the baseline is stable. Half of the value of an outside audit is permission to leave things alone.

## Why the 60-minute readout call matters more than the PDF

The readout is where you find out if the findings belong to the auditor or to a template. A PDF cannot be cross-examined. A person can.

Who should be in the room: the CTO or founder who owns the budget, the engineer who built the demo, and whoever will own the plan. Not a wider audience. The engineer who built the demo will be defensive, which is fine; it is the fastest way to find out which findings are real. When they say "that only happens on my laptop", the auditor should be able to say "here is the run on staging".

Questions I would ask any auditor, including me:

- "Which finding did you almost miss?" A real audit has one. A template does not.
- "If this were your company, what would you do on Monday?" The answer should match item 1 of the plan. If it does not, the plan was written for the document, not for you.
- "Which of these would you *not* fix?" Anyone who has done this work has a list of findings that look serious and are not worth the days.
- "What did you not have time to look at?" Silence here is a bad sign.

Record the call. The thing you will replay three weeks later is not the slide, it is the sentence where the auditor explains why finding F-02 blocks launch and F-07 does not.

If the readout is someone reading the PDF aloud, you have bought a PDF.

## Five red flags that mean the audit is theater

I have seen all five of these in reports that companies paid real money for.

1. **Findings without numbers.** "Latency could be a problem", "costs may scale non-linearly", "consider adding evaluation". If a finding cannot be reproduced, it is an opinion, and you did not need to pay for an opinion.
2. **No load test was run.** Ask directly: what concurrency did you test at, and with which tool? If the answer is "we reviewed the architecture", nobody found the concurrency ceiling, which means the first person to find it will be a customer.
3. **No owner per fix.** "The team should implement monitoring." Which person, how many days, done when? A plan where every item is owned by "the team" is owned by nobody.
4. **A plan with no dates and no order.** A priority-sorted list is not a plan. If items 1 through 12 can be done in any order, the auditor did not think about dependencies, which means they did not think about your system.
5. **The recommendation is the vendor's own platform.** If the report concludes that the fix is a rebuild on the auditor's stack, or their managed service, the audit was a sales call with an invoice. An honest audit recommends the smallest change that makes the system safe, and often that change is boring.

A sixth, subtler one: swap your company name for another and the report still reads correctly. Generic reports come from generic work.

## What you can check yourself before paying anyone

You can produce roughly a fifth of a real audit in an afternoon, and doing so tells you exactly what to demand from whoever does the rest. None of this needs an AI specialist.

- **Load it.** Write a ten-line k6 or Locust script that fires 20 concurrent requests at your demo endpoint for five minutes. Write down p50, p95, and the error rate. Most demos I see start failing somewhere between 5 and 15 concurrent users, usually on the LLM provider's rate limit or a database connection pool.
- **Count the tokens.** Log the prompt and completion token counts for 50 real requests. Multiply by the provider's current per-token price. Multiply by your expected daily volume. If the number surprises you, that is finding number one.
- **Write 30 test cases.** Thirty real questions with the answer you would accept. Run them today and count the passes. That number is your baseline, and it is the number the audit must improve.
- **List every outbound call.** Grep the codebase for external hosts. Every one of those is a data flow your legal team needs to know about.
- **Check the git log for the prompt.** If the system prompt is not in version control with history, you have no way to know what changed when behaviour changes.
- **Ask one question of whoever built it:** "What happens when the model API returns a 429?" The answer tells you whether anyone thought about failure at all.

If you do this and get numbers, two things happen. You now know whether you need an outside audit or just a hardening sprint. And any auditor you do hire has to beat your baseline, which keeps them honest. If the afternoon convinces you the gap is a person rather than a report, [hiring an AI engineer in the Netherlands](/en/blog/hire-ai-engineer-netherlands) is the next decision, and [the build-versus-buy math](/en/blog/build-vs-buy-ai-features) is the one after that.

## What "done" looks like for a POC audit engagement

A real one-week audit has a shape. Day one is access and interviews: repo, environments, the builder's own worries, which are usually correct. Days two and three are running the system, not reading about it: load, evals, token accounting, tracing the data. Day four is writing. Day five is the readout, and the afternoon after it is the auditor answering the questions the readout raised.

"Done" means four things exist in your hands. The written report with numbered, reproducible findings. The 90-day plan with owners, dependencies, and definitions of done. The readout, recorded. And the scripts, left in your repository, so every number can be re-run by your team next month without calling anyone.

The real test of done is simpler: could your team execute the plan if the auditor disappeared? If the answer is no, the audit created a dependency instead of removing one. The best audit I can deliver is one that makes me unnecessary for the next ninety days, and that is how the [POC Audit is scoped on the services page](/en/services).

## Where this becomes an engagement

If you have a working demo and a quote in front of you, the POC Audit is a one-week sprint that ends with exactly the deliverables above: a written report on what breaks at scale, a prioritised 90-day plan to ship, and a readout call to defend every finding in it. The scope is on the [services page](/en/services). If you want to compare it against whatever quote you are holding, [get in touch](/en/contact) and we will tell you honestly whether you need it.
