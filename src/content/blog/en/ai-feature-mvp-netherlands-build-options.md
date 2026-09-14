---
title: "AI Feature MVP Netherlands: Agency vs Freelancer vs Full Build"
description: "Comparing an AI feature MVP in the Netherlands: agency, freelancer, or fractional senior engineer, with real price bands and a spec checklist for quotes."
published: "2026-09-14"
tags: ["AI feature MVP", "Netherlands", "AI development", "MVP pricing", "AI consultancy"]
ogImage: "/images/blog/ai-feature-mvp-netherlands-build-options/cover.jpg"
primaryService: "ai-features"
---
Most of what you find when you search "AI feature MVP Netherlands" is a framework comparison. LangGraph versus something else, which vector database, which model. That is the wrong page for the decision you are making this month. You have a demo or a spreadsheet that proves the idea has signal. The question is not which tool. It is who builds the real thing, and what it will honestly cost.

I have sat on every side of this. I have been the freelancer on the marketplace, I have subcontracted for agencies, and for the last few years I have been the single senior engineer who takes an AI feature from empty repo to production and stays accountable for it. The three options are not three prices for the same thing. They are three different products, and each is structurally bad at something the others do well.

This post lays out those three routes with the price bands I actually see in the Dutch and EU market, what each one cannot do no matter how good the people are, and a spec checklist that lets a non-technical founder get quotes that can be put side by side. It ends with one six-week feature, staffed and priced all three ways.

## Why "build an MVP" means three very different engagements

When a founder says "we need an MVP of the AI feature", three people hear three things.

An agency hears a project: discovery, design, build, handover, a Jira board and a weekly steering call. A marketplace freelancer hears a ticket stream: give me the tasks, I close them at my hourly rate. A senior independent doing a full build hears an outcome: this thing is in production, real users are on it, and I am the one you call when it misbehaves.

The reason the difference matters for AI specifically is that an AI feature has two halves most software MVPs do not. There is the product half (backend, UI, auth, deploy) and the model half (prompts, retrieval, evals, cost controls, failure handling). A normal web MVP is ninety percent product half. An AI feature is closer to fifty-fifty, and the model half is the part most teams have never shipped before.

I covered the timelines in [how long it takes to build an AI feature](/en/blog/how-long-to-build-an-ai-feature); the short version is that the model half does not compress the way the product half does, because you cannot know the feature is good enough until you have measured it on real inputs. Whoever you hire has to own that measurement. If nobody owns it, you get a demo with a login page and call it an MVP.

## Three ways to build an AI feature MVP in the Netherlands, with real price bands

These are ranges from quotes I have seen, invoices I have sent or subcontracted under, and founders who showed me what they paid. Treat them as "in my experience roughly", not as a market report.

![AI Feature MVP Netherlands: Agency vs Freelancer vs Full Build](/images/blog/ai-feature-mvp-netherlands-build-options/1.jpg)

**Route one: a digital agency or AI consultancy.** A team of three to five: project lead, designer, one or two developers, sometimes a data scientist who joins for the model half. Dutch agencies bill blended day rates that in my experience land between 900 and 1,400 euros per person-day, with the larger consultancies well above that. A six-to-eight-week AI feature MVP with a two-week discovery phase in front typically quotes at 80,000 to 160,000 euros. What you buy: a process, a company behind the contract, design included, and a team that can absorb someone going on holiday.

**Route two: a freelancer or contractor from a marketplace.** One developer, found through a platform or recruiter, working on your tickets. Dutch and EU rates for someone who can credibly do LLM work run roughly 70 to 120 euros per hour, with the genuinely senior ones above that. Six weeks full-time is 17,000 to 30,000 euros. What you buy: hands. Cheap, fast to start, and entirely dependent on what you feed them.

**Route three: a fractional senior engineer doing a full build.** One person who has shipped this kind of feature before, who takes the spec, argues with it, builds the whole thing including the deploy and the evals, and stays on the hook for it. Rates sit between the freelancer band and the agency's blended rate; you pay for one person instead of a team, and the person you talk to is the person writing the code. Six to twelve weeks is the realistic window for a feature that ends in production rather than in a demo.

The honest summary: the agency costs three to five times the freelancer, the senior independent lands in between, and the number that matters is none of those. It is the cost of the version that never ships. I have seen more 25,000-euro freelancer builds get thrown away than 120,000-euro agency builds, and I have seen agency builds where the model half was so thin the client paid a second time to make it work.

## What agencies are structurally bad at, and why it is not their fault

I have subcontracted for good agencies. The people are competent and the process is real. The problems are structural.

**The model half gets staffed last.** An agency's bench is designers and web developers, because that is what ninety percent of their work needs. The person who has actually run evals on a RAG pipeline or debugged a tool-calling agent under load is either a subcontractor (often me) or a junior with a notebook. Discovery and design happen before that person is in the room, so the spec gets written around what the UI should look like rather than what the model can reliably do.

**The margin structure punishes iteration.** An AI feature is good after the fourth prompt rewrite and the second retrieval redesign, not the first. Fixed-price contracts make those rewrites a change request. Time-and-materials contracts make them a budget conversation. Either way, the iteration the feature needs is what the commercial model resists.

**Handover is the end of accountability.** The MVP goes live, the team rolls to the next client, and the first hallucination complaint lands with your own developers who did not build it. Support contracts exist, but support is not ownership; the person who knows why the prompt is shaped that way is gone.

**Discovery becomes a product.** Two weeks of workshops is billable, and the output is a deck. For an AI feature the useful discovery is thirty examples of real input and a definition of "correct", which I covered in [how to scope an AI pilot that ships](/en/blog/ai-pilot-to-production-scoping). That takes two days with the right person, not two weeks with a room.

None of this means never hire an agency. If the product half is the bulk of the work (a new customer-facing app where the AI is one screen), an agency is often the right call. It means do not expect the agency to own the model half.

## What a freelancer or marketplace hire is structurally bad at

The freelancer route is the one founders reach for when the agency quote comes back. It is cheap and it starts on Monday. Here is what it cannot do.

**Nobody is writing the spec.** A marketplace hire executes tickets. The spec has to come from you, and if you could write a good spec for an AI feature you probably would not be reading this. The freelancer builds what they understand from the ticket, which is the happy path, and the edge cases that decide whether the feature is usable never get a ticket.

**The deploy is somebody else's problem.** The build runs on their laptop against a personal API key. Getting it into your infrastructure with secrets management, rate-limit handling, a fallback for provider incidents, and a cost cap so a retry loop cannot burn 3,000 euros overnight: all "not in scope" unless you wrote them down.

**There is no eval loop.** The feature works on the twenty examples the freelancer tested. Whether it works on the two thousand your users will send is unknown, and nobody's job is to find out. This is the most common reason I get called in to rescue a freelancer build: the code is fine, the measurement does not exist.

**Seniority is unverifiable at the point of hire.** Every profile says "LLM" now. I wrote about how to test for it in [how to hire an AI engineer in the Netherlands](/en/blog/hire-ai-engineer-netherlands); if you cannot run that interview yourself, the marketplace is a lottery.

The freelancer route works when you already have a technical lead in-house who owns the spec, the deploy, and the evals, and just needs hands. If that person does not exist, you are not buying an MVP; you are buying a codebase you will pay someone else to understand.

## The spec checklist that makes quotes comparable

Agency and freelancer quotes are impossible to compare because they are quoting different things. Fix the spec and the quotes line up. This is what I ask a founder to fill in before I put a number on anything, and any vendor worth hiring will want the same answers.

- **The one job.** One sentence: "A user uploads X and gets Y." If it needs "and", it is two features. Pick one.
- **Thirty real inputs.** Actual documents, questions, images, from actual users. Not synthetic, not cleaned. The single highest-leverage thing you can do before talking to anyone.
- **What correct looks like.** For ten of those thirty, write down the answer a good employee would give. This is your first eval set, and the thing every vendor will otherwise skip.
- **Where the data lives and who may see it.** Which system, what format, whether it can leave the EU, whether it can go to a US model provider at all. This decides half the architecture.
- **Where it runs.** Your cloud account, your Kubernetes, a managed platform, on-prem. "We will figure that out later" is how deploys become a second project.
- **Who uses it and how many.** Ten internal users or ten thousand customers changes the cost model and latency budget by an order of magnitude.
- **The failure path.** What happens when the model is unsure or wrong: a confidence threshold and a human in the loop, a "could not process" state, an escalation. Every vendor should quote this; most do not unless asked.
- **The definition of done.** Not "it works" but "in our production environment, on real traffic, with a dashboard we can read, and the eval set scores above N."

Send that one page to all three routes. An agency will now quote the build instead of the discovery. A freelancer will see the deploy and evals and either price them or admit they are out of their depth. A senior independent will argue with your one-sentence job, which is usually the most useful thing in the whole process. And if the AI is one screen in a much bigger app, read [build versus buy for AI features](/en/blog/build-vs-buy-ai-features) first, because the right answer may be a vendor API and a week of integration.

## A worked example: one six-week AI feature MVP, priced three ways

A feature I have built variants of several times. A B2B logistics company receives supplier documents (delivery notes, invoices, customs forms) as PDF and email attachments. The feature: extract the fifteen fields planners retype by hand today, show them in a review screen with the source highlighted, push confirmed records into the ERP. Two hundred documents a day, twelve internal users, data stays in the EU.

**Agency.** Two-week discovery, six-week build. Project lead at 40 percent, designer for three weeks, two developers, a subcontracted data scientist for the extraction pipeline. Quote in the 110,000 to 140,000-euro range. You get a polished review screen, a documented handover, and a pipeline that in my experience scores well on the demo set and has not been run at two hundred a day. Deploy to your environment is often a separate line. Realistic time to real users: ten to twelve weeks including handover.

**Freelancer.** One developer, six weeks at roughly 95 euros per hour, about 23,000 euros. You write the spec, or you do not. You get a working extraction script and a basic review screen on their laptop or a personal cloud account. No eval set unless you provided one. ERP integration lands in week five and is where the schedule breaks, because the ERP's API was not what the ticket assumed. Realistic time to real users: six weeks plus however long your team needs to deploy, secure, and understand it. In my experience roughly half get there.

**Fractional senior engineer, full build.** One person, six to eight weeks. Week one: the thirty documents and the eval set, an argument about which of the fifteen fields actually matter, and a decision on OCR-plus-LLM versus a vision model for the harder document types. Weeks two to five: pipeline, review screen, ERP push, all in your cloud account from day one. Week six: evals on a fortnight of real documents, cost per document measured and capped, monitoring on the two failure modes that showed up, planners on it. Price lands between the other two, and the person who scoped it is the person who deployed it and the person on the phone in week nine. Realistic time to real users: the six to eight weeks, because "in production" was the definition of done from the start.

Same feature in all three columns. What differs is who owns the model half, who owns the deploy, and who is still around when it misbehaves.

## What "done" should mean before you pay the final invoice

Whichever route you take, do not accept "it works" as done. This is what I put in my own contracts as acceptance criteria, and what I would ask any vendor to sign up to.

- It runs in your environment, under your accounts, with secrets you control. Not a demo URL.
- An eval set of at least fifty real inputs with expected outputs, and a script anyone can run that scores the current version. The score is written down.
- Cost per request measured on real traffic, not estimated, with a hard cap that stops a runaway loop.
- A dashboard, or at least a log query, showing volume, latency, error rate, and the fraction of requests hitting the failure path. Someone on your team has opened it.
- Prompts and retrieval config versioned in your repo, with a note on why the current version looks the way it does.
- The failure path has been triggered on purpose and does what the spec said.
- Real users have used it for a week and their complaints have been read.

If a vendor cannot deliver that list, they are delivering a demo, and you should price it as one. If you want a second opinion on a build already underway, the [services page](/en/services) describes how I look at those.

## Where this becomes an engagement

The Full Build is the third route above: I take the AI feature and the product around it from spec to production in six to twelve weeks as the single accountable owner, from backend and model pipeline to evals, monitoring, and the deploy in your environment. The scope is on the [services page](/en/services). If you have the one-page spec, or want help writing it, [get in touch](/en/contact) and we can put a real number on it.
