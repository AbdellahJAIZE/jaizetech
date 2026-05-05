---
title: "EU AI Act checklist for Dutch software teams"
description: "Most Dutch SaaS teams overestimate their risk tier under the EU AI Act. A working engineer's checklist for the August 2026 deadline. Not legal advice."
published: "2026-04-22"
tags: ["EU AI Act", "compliance", "Netherlands", "regulation"]
ogImage: "/og-image.png"
primaryService: "ai-audit"
---

The August 2026 deadline is three months away, and every Dutch CTO I talk to has the same look on their face. They have read three checklists from compliance vendors, sat through a webinar, and come out of it more confused than before. The vendors want to sell them a platform. The lawyers want a retainer. Nobody wants to just say what a normal 20-person SaaS team needs to do on a Tuesday morning.

So that is what this post tries to do. It is written from the perspective of a working engineer who reads regulation because he has to ship features that touch it, not because he enjoys it. **This is not legal advice.** If you are a high-risk provider, you need a real lawyer. If you are not, you probably need an afternoon and a good checklist. Most of you are the second group, and you do not know it yet.

## Are you even in scope?

Before you panic about conformity assessments and EU databases, find out which tier you are in. Most Dutch B2B SaaS teams I have talked to think they are high-risk because they "use AI". They are not. The Act is more specific than that.

### What counts as an "AI system"

The Act defines an AI system in Article 3(1). The short version is that it has to be a machine-based system that infers, from the input it receives, how to generate outputs like predictions, recommendations, or decisions, with some degree of autonomy and adaptiveness.

In plain language. If you have a rules engine that says `if customer.country == "NL" then show_dutch_terms`, that is not AI under the Act. If you have a regex that pulls invoice numbers out of PDFs, also not AI. If you have a logistic regression that predicts churn, that is AI. If you wrap GPT-4 to summarise tickets, that is AI.

The line that matters. Inference and adaptiveness. A deterministic rule is not in scope. A learned model is.

### Provider, deployer, or general-purpose AI

Once you know you have an AI system, figure out what role you play. The Act splits this three ways and your obligations are very different for each.

A **provider** is whoever puts the AI system on the market under their own name. If you train a model and ship it inside your product, you are the provider of that system.

A **deployer** is whoever uses an AI system in a professional context. If you call the OpenAI API to summarise support tickets, you are a deployer of OpenAI's model and a provider of the support-summarisation feature you built on top.

A **general-purpose AI (GPAI) model provider** is OpenAI, Anthropic, Mistral, Meta. Not you. Unless you are training foundation models, this category is not your problem directly. You inherit some obligations through your provider contracts.

Most Dutch SaaS teams are deployers of GPAI models and providers of small task-specific systems built on top. That puts you in a reasonable place.

### The four risk tiers

The Act sorts AI systems into four buckets.

**Prohibited.** Social scoring, real-time biometric ID in public spaces (with narrow exceptions), emotion recognition in workplaces and schools, manipulative dark patterns that exploit vulnerabilities. If you are doing any of this, stop. The ban took effect February 2, 2025. Penalties go up to 35 million euro or 7 percent of global turnover.

**High-risk.** Listed in Annex III. We will get into specifics in the next section. These come with the heavy obligations everyone is scared of.

**Limited-risk.** Mostly transparency obligations. Tell users they are talking to AI. Label AI-generated content. That is most of it.

**Minimal-risk.** No specific obligations under the Act, beyond general product safety and existing laws. Think spam filters, recommendation engines for movies, in-game NPCs.

My honest take. Around 80 to 90 percent of Dutch B2B SaaS teams I have looked at land in limited-risk or minimal-risk. The transparency stuff is genuinely easy to implement. A weekend, maybe two. The high-risk obligations are a different conversation entirely, and if you are actually high-risk you should know it by now.

## What "high-risk" actually means in 2026

Annex III lists the use cases. If your product touches one of these, you are high-risk and the August 2, 2026 deadline applies to you in full force.

### The Annex III categories that matter for Dutch SaaS

**Employment, workers management, and access to self-employment.** AI used to recruit, screen CVs, evaluate candidates, allocate tasks, monitor performance, or terminate contracts. If you are building HR tech with any kind of scoring or ranking, you are in.

**Education and vocational training.** AI that determines access to education, evaluates learning outcomes, assigns people to programmes, or detects exam cheating. Edtech with grading or admissions decisions, in scope.

**Access to essential private and public services.** AI used for credit scoring, life and health insurance pricing, eligibility for public benefits, and emergency dispatch. Fintech doing creditworthiness, in scope. A buy-now-pay-later flow that uses ML to decide approval, in scope.

**Law enforcement, migration, asylum, border control, justice.** Probably not your product unless you sell to government. If you do, you know.

**Biometric categorisation and emotion recognition** (outside the prohibited contexts). Limited use cases, but in scope.

**Critical infrastructure management.** Energy grid, water, gas, traffic, digital infrastructure. If your AI helps run any of these, in scope.

**Safety components of regulated products.** Medical devices, vehicles, machinery. If your model is part of a CE-marked safety chain, in scope.

### What is NOT high-risk under Annex III

This is the part nobody emphasises. Customer support automation. Sales agents and SDRs. Internal RAG over company docs. Marketing copy generation. Translation. Code completion. Meeting summarisation. Sentiment analysis on reviews. Internal analytics dashboards with predictive features. Fraud detection on payments (this is more nuanced, but generally yes, not Annex III).

Most B2B SaaS in the Netherlands is in this second list. You have transparency obligations. You do not have a conformity assessment to file.

## The five things you need documented before August 2026

Assume you are limited-risk or general-purpose. Here is the practical checklist.

### 1. A transparency notice when users interact with AI

Article 50 says when a person interacts with an AI system, they must be informed of that, unless it is obvious. A chatbot has to tell the user it is a chatbot. An AI voice agent has to disclose it is AI. The disclosure has to be at the start of the interaction.

What this looks like in your product. The first message in your chat widget says something like "Hi, I'm an AI assistant. I can help with X, Y, Z. For anything else I will hand you to a human." That is enough. You do not need a 2000-word policy. You need one sentence in the right place.

### 2. AI-generated content labelling

Same article. If your system generates synthetic audio, image, video, or text that looks like real content, that output has to be machine-readable as AI-generated. For text, the obligation kicks in when the text is published to inform the public on matters of public interest, with some exceptions.

Practical version for most SaaS. If you generate marketing copy or summaries that stay inside the user's account, low priority. If you publish AI-generated content to the public web on behalf of users, you need watermarking or metadata tags. C2PA is the emerging standard. Most major model providers are adding this at the API level.

### 3. Data governance basics

Write down, in one document. What data trains or fine-tunes your models. Where it comes from. Whether users can opt out. How long you keep it. Whether it goes to a third-party model provider and under what terms.

This is not a 50-page policy. It is one page. If you cannot write it on one page, you do not understand your own data flows, which is a different problem.

### 4. Provider information

If you use OpenAI, Anthropic, Mistral, or any other GPAI provider, document which models you use, link to their model cards or system cards, and note your contract terms around data usage. When auditors or customers ask "what AI is in this product", you should have a one-page answer ready.

### 5. An internal AI use register

A simple table. Where AI runs in your product. What model. What it does. Who owns it internally. When it was last reviewed. This is not required by the Act in this specific form for limited-risk systems, but it makes everything else easier and your enterprise customers will start asking for it in their procurement questionnaires from late 2026.

### For high-risk systems, add

If you are actually in Annex III, you also need.

A risk management system, documented and maintained across the model's lifecycle (Article 9). Data governance with quality criteria for training, validation, and test sets (Article 10). Technical documentation that lets a regulator understand how the system works (Article 11). Automatic logging of events while the system is in use (Article 12). Transparency and instructions for use for the deployer (Article 13). Human oversight measures, the famous Article 14. Accuracy, robustness, and cybersecurity baselines (Article 15). A conformity assessment before going to market. Registration in the EU AI database. Post-market monitoring once deployed.

This is real work. If you are high-risk and have not started, you are late. Talk to a lawyer this week.

## What changes in your CI/CD if you ship a high-risk system

Assume you are in Annex III and have to actually do all of the above. Here is what it looks like in code, not in a policy PDF.

### Risk assessment artefacts in the repo

Your risk management documentation lives in the repo, version-controlled, next to the code. Not in Confluence. Not in Notion. In Git. Every model release has a corresponding risk assessment update, reviewed in the PR. If the model changes meaningfully, the risk doc changes with it.

A reasonable folder layout.

```
/compliance
  /models
    /ticket-classifier-v2.3
      model_card.md
      risk_assessment.md
      data_governance.md
      eval_results.json
      training_data_summary.md
```

### Model cards as build artefacts

Every model your CI builds also produces a model card. Auto-generated where possible (intended use, training data summary, eval metrics, known limitations). Human-edited for the parts that need judgement. The model card ships alongside the model weights. It is not an afterthought.

### Transparency notices rendered automatically

Any UI element that is touched by AI gets a marker. In React, this might be a `<AIBadge reason="..." />` component that wraps any AI-generated content. The component is not optional. If a backend response comes back with a flag indicating AI-generated content and the frontend forgets to render the badge, a lint rule or visual regression test catches it. You do not want a sales engineer demoing your product to a German auditor without the disclosure rendering.

### Audit logs that survive deletion

Article 12 logging. Inputs, outputs, decisions, timestamps, model version. Stored in append-only storage. Even if a customer deletes their data under GDPR, the high-risk system logging requirement may require you to retain certain technical logs for a defined period. This tension between GDPR and the AI Act is real. Get a lawyer involved on retention policy.

### Article 14 human-in-the-loop checkpoints

For high-risk systems, a human must be able to intervene, override, or stop the system. In code, this means. No fully automated decisions on high-risk paths without an explicit human approval step. The approval step is logged. The human's identity is logged. The override option is always visible in the UI, not hidden behind three menus.

### A pre-deployment checklist as a CI gate

Before a model can be promoted to production, the pipeline checks. Model card present and updated. Risk assessment within the last X months. Eval metrics above threshold. Data governance doc reviewed in the last release. If any of these fail, the deployment is blocked. This sounds like overhead. It is overhead. It is also the entire point of the Act.

## When you need a lawyer vs. when you need an engineer who reads regulation

This is the question I get most often, and I want to be direct about it.

A lawyer interprets your specific liability exposure. They look at your contracts, your customer base, the jurisdictions you sell into, the worst-case scenarios for your specific product, and they tell you what your legal risk looks like. They do not write your model cards. They do not refactor your CI pipeline.

An engineer who reads regulation translates the Act into shipped code. They figure out where the transparency notice goes in the React component tree. They write the audit log schema. They set up the CI gate. They do not interpret your liability exposure.

For limited-risk systems, you mostly need the engineer side. The legal interpretation is straightforward enough that any decent privacy lawyer can sign off in an hour.

For high-risk systems, you need both. A lawyer to scope your obligations and exposure, plus engineering work to actually meet them. Skipping either is expensive.

**To repeat. This post is engineer's guidance. It is not legal advice.** I am a software engineer, not a lawyer. I read the Act because I ship AI features and I need to know what I am building against. If your case is anything other than vanilla limited-risk, talk to a real lawyer.

You can read more about my background on the [about page](/about). The short version is five years of production engineering, two and a half on a Dutch agritech computer vision platform, and a stack that lives close to the AI parts of the Act. Not a law degree.

## A copy-paste compliance starter

Take this to your next standup. One sprint of work for a 20-person team that is not in Annex III.

1. Map every place AI runs in your product. One row in a spreadsheet per place. Model name, what it does, owner. (Half a day.)
2. For each row, decide. Is this user-facing? If yes, does the user know they are interacting with AI? If no, add a disclosure. (One day to spec, one day to ship.)
3. If your product generates content that gets published outside your platform, add C2PA metadata at the generation step. (One to three days depending on stack.)
4. Write your data governance one-pager. Sources of training data, retention, opt-out, third-party providers. (Half a day if you know your system, two days if you do not.)
5. List your model providers and link their system cards. (One hour.)
6. Decide which Annex III categories your roadmap might touch in the next 12 months. If any, escalate to leadership now, because the lead time for high-risk compliance is months, not weeks.
7. Add a paragraph to your terms of service and your privacy policy that mentions AI use. Run it past a privacy lawyer. (One to two weeks of back and forth.)
8. Brief your sales team on what to say when enterprise prospects ask about AI Act compliance. They will ask. The answer "we are limited-risk under the Act and our transparency obligations are met, here is our one-pager" is a lot more reassuring than a blank stare.

For Annex III high-risk systems, this list is the start of the work, not the finish. You are also looking at a conformity assessment, EU database registration, formal risk management documentation, and a post-market monitoring plan. That is a multi-month engagement with both legal and engineering involved.

## The dates you actually need to remember

Pinned to your wall.

- **August 1, 2024.** The Act entered into force.
- **February 2, 2025.** Prohibited practices banned. (Past.)
- **May 2, 2025.** Codes of practice for general-purpose AI. (Past.)
- **August 2, 2025.** Rules for general-purpose AI models. (Past.)
- **August 2, 2026.** Most other rules including high-risk system requirements. (This is the big one. Three months away.)
- **August 2, 2027.** Deadline for high-risk systems already on the market before August 2026 to come into compliance.

Penalties. Up to 35 million euro or 7 percent of global turnover for prohibited practices. Up to 15 million euro or 3 percent for most other violations. Smaller fines for supplying incorrect information to authorities. Member states get some discretion on enforcement, and the Dutch authorities have signalled a pragmatic approach for SMEs that show good faith effort, but do not bet your company on regulator goodwill.

## Where most teams are right now

Honest snapshot of what I see in Dutch SaaS in May 2026.

A few teams have done the work. Their model cards are in Git. Their disclosures render automatically. They sleep fine.

Most teams know the deadline is coming and have not started. They are hoping their existing privacy and security work covers it. Some of it does. The transparency obligations do not get done by accident.

A small number of teams are genuinely high-risk and either know it (and are scrambling) or do not know it (and will find out the hard way when an enterprise customer asks for their conformity assessment in Q4).

If you are not sure which group you are in, that uncertainty is the actual problem to solve. The Act is annoying but not actually that complicated for most products. The expensive mistake is treating it as either irrelevant or as a four-quarter compliance project when it is neither.

## A short closing

If you want a working engineer to walk through the Act with your team and figure out which tier you are actually in, a fifteen minute call usually narrows it down. From there, a half-day [audit](/services) tells you exactly what to ship before August. [Book a call](/contact) and we can take a look.

**One last time. This post is engineer's guidance, not legal advice.** For anything beyond vanilla limited-risk, talk to a lawyer who knows the Act. Then talk to an engineer who can build against it. You need both.

## Related reading

- [How to hire an AI engineer in the Netherlands](/blog/hire-ai-engineer-netherlands) — who to bring in to handle the August 2026 deadline
- [Build vs buy AI features: math for your CTO](/blog/build-vs-buy-ai-features) — compliance changes which side of the line you fall on
