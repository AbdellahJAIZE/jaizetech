---
title: "Build vs buy AI features: math for your CTO"
description: "Three real patterns for the build vs buy AI decision, with rough numbers and a two-hour team exercise. The one question that resolves 80% of debates."
published: "2026-05-02"
tags: ["build vs buy", "AI strategy", "CTO", "product"]
ogImage: "/og-image.png"
primaryService: "ai-audit"
---

Most articles on build vs buy AI features read like they were written by someone who has never had to ship one. You get a 2x2 matrix, a few bullet points about "core competency," and zero numbers you can actually defend in a planning meeting. So you walk back to your team with the same question you started with, just dressed up nicer.

This post is the version I wish I had read before my first big call on this. Three real patterns with rough numbers, the one question that ends most debates in your head before they reach the team, the vendor lock-in trap that hits SaaS shops about eighteen months in, and a two-hour exercise you can run before the next planning meeting. I have built production AI both ways, custom and vendor-wrapped, so I will be honest about what each side actually costs you.

## The one question that resolves 80% of build vs buy debates

Before you spreadsheet anything, ask yourself this. Is this AI feature your product's defensibility, or is it table stakes?

Table stakes means the market expects it, customers will not pay extra for it, and three of your competitors already have a version of it. Think a chat summarizer in a CRM, a "draft this email" button in a help desk tool, smart tagging for uploaded files. None of that is what people choose your product for. It is what they would notice missing.

Defensibility means it is the reason customers stay, or the reason they would switch to you. Your retrieval over ten years of proprietary technical documentation. A fine-tuned model that scores leads using your specific historical conversion data. A computer-vision pipeline trained on a dataset only you have because you spent five years collecting it. This is the moat.

If it is table stakes, buy. Wrap a vendor API, ship in two weeks, move on. The maintenance cost of a custom build will eat the team that should be working on your moat.

If it is defensibility, build. Accept that you are signing up for ongoing maintenance, evals, retraining, and on-call for a system that does not behave deterministically. You are not buying a feature, you are starting a small product inside your product.

Most teams get this exactly backwards. They build the chat summarizer (table stakes) because it feels like real engineering, then they buy a generic vendor for the part that should have been their moat because the vendor demo was slick. Two years later they have a maintenance burden on the wrong feature and a "me too" version of the part customers actually compare on.

That one question kills about 80% of the debates I see. The remaining 20% are genuinely hard, and that is where the math earns its keep.

## Three common patterns with the math

Here are three patterns I see often. Numbers are rough market ranges, not invoices from real projects, but they are close enough to defend in front of a finance person.

### Pattern 1: BUY. The support inbox classifier

You have 200 customer support tickets per day. You want to auto-tag them by urgency and route to the right queue. Classic, useful, not a moat.

Vendor route. An OpenAI or Anthropic API call per ticket, with a structured-output prompt and four or five categories. At current prices, 200 tickets per day with a small prompt and short response is somewhere around 20 to 40 euros per month in API spend. Integration is two to three engineering days if your support tool has a webhook (which it does). Ongoing maintenance is basically zero, you watch the eval numbers once a month and adjust the prompt if accuracy drifts.

Build route. Collect a labeled dataset (or pay someone to label it), fine-tune a small open-source classifier, deploy it behind your own inference service, set up monitoring, retrain when categories drift. Realistic upfront cost in the Dutch market is 15k to 25k euros of engineering time, plus 200 to 500 euros per month in compute and someone's attention every time the support team adds a new ticket category.

Don't build. The vendor wins on every axis, including accuracy, because their model is bigger than anything you would train. The only reason to build here is if you have a hard data-residency requirement that rules out US APIs, in which case you are not really choosing on cost, you are choosing on compliance.

### Pattern 2: BUILD. RAG over your proprietary corpus

You sell into a regulated industry. You have ten years of internal technical documentation, customer case files, and engineering reports. Your competitors do not have this corpus. Customers buy you partly because your product surfaces the right answer from this body of knowledge faster than anyone else can.

Vendor route. You point a generic RAG-as-a-service product at your documents. It chunks them with default settings, embeds them with a default model, retrieves with default top-k. The answers are okay. They are also exactly as good as what your competitor would get if they fed their (worse) corpus to the same vendor. You have just commoditized your own moat.

Build route. You design the chunking strategy around how your documents are actually structured (sections, tables, diagrams with captions). You pick or fine-tune an embedding model that knows your domain vocabulary. You build a retrieval layer that uses metadata filters specific to how your customers ask questions. You add evals that measure quality on your hardest real questions, not generic benchmarks. Realistic upfront cost is 25k to 50k euros depending on corpus complexity. Ongoing maintenance is one to two days per month plus inference costs.

Build. The whole point is that the tuning work is the product. If a vendor could do it as well, it was not your moat to begin with.

### Pattern 3: HYBRID. The AI agent

Most B2B AI products in 2026 land here, and for good reason. You build an agent that helps your users do something specific in your product. It needs to reason (call an LLM), retrieve (your data), and take actions (your APIs and your customer's connected tools).

Buy the model layer. Use GPT-class or Claude-class models through their APIs. You will not out-train OpenAI or Anthropic on general reasoning, and the price per token keeps dropping anyway. Wrapping your own LLM here is almost always a mistake unless you have a very specific privacy or cost-at-scale reason.

Build the orchestration. The tool definitions, the retrieval, the guardrails, the eval harness, the human-in-the-loop fallbacks, the way the agent decides when to ask the user for confirmation. This is where your product personality lives. This is also where vendor "agent platforms" tend to lock you in for capabilities you could have built in two sprints.

Realistic numbers vary wildly here based on how many tools the agent calls and how strict your eval bar is, but a usable v1 of a focused agent in a B2B product is typically 40k to 80k euros of engineering, plus model inference costs that scale with usage. Plan for ongoing work, agents need eval and tuning attention forever, not just at launch.

Hybrid is the default answer for any AI feature that sits at the center of your product. Buy what is commoditized (the base model). Build what differentiates you (everything around it).

## The vendor lock-in trap nobody warns SaaS teams about

Here is the part the vendor sales deck does not cover.

When your AI feature depends on a single LLM provider, you have signed a contract with three terms you cannot read. The price (which they can change). The model (which they can deprecate, sometimes with 90 days of notice, sometimes less). The rate limits (which they can lower if their capacity gets tight, and you will find out at 2am).

I have watched teams discover this the hard way. Their entire product feature breaks because a model version they pinned to gets retired. Or their unit economics go sideways because a price change of 30% on the model they use turns a profitable feature into a money loser. Or they cannot ship to a big new customer because the vendor's regional availability does not match the customer's compliance requirements.

The fix is not to avoid vendors. The fix is to abstract them.

From day one of any AI feature, build your own thin interface in front of the model call. Not a heavy framework, just a function in your codebase that takes (prompt, context) and returns (response). Behind that interface, support at least two providers in development even if only one runs in production. The cost of doing this on day one is maybe half a day of engineering. The cost of doing it later, after you have 80 prompt-engineered call sites scattered through your codebase, is weeks.

Same logic for embeddings (your vector store should not care which embedding model produced the vectors, beyond a version tag). Same logic for fine-tuning (if you fine-tune on a vendor, keep the training data and the eval set, not just the resulting model checkpoint).

This is plain old hexagonal architecture applied to AI. The fact that the AI ecosystem moves fast is exactly why you want the abstraction, not a reason to skip it.

## The two-hour exercise your team can run before the next planning meeting

Block two hours. Get the tech lead, the PM, and one senior engineer in a room (or a call). Pick the AI feature you are debating. Answer these four questions on a shared doc. Time-box each one to 25 minutes.

**Question 1. Can a vendor do this 80% as well as we could?**

Be honest. Demo the top two vendors against your real use case, not their canned demo. If the answer is yes, the burden of proof is on whoever wants to build. If the answer is no, write down exactly why not. "Our data is private" is not enough, vendors handle that. "Our domain vocabulary breaks generic models" is a real reason. "Our retrieval needs to filter by customer-specific metadata that would leak across tenants in a generic vendor" is a real reason.

**Question 2. Will our customers care if it is a wrapper?**

Some customers absolutely will. Enterprise buyers in regulated industries will ask which model you use, where it runs, and how you guarantee the data does not train it. Consumer-facing products typically will not care as long as it works. SMB B2B customers are in the middle, they care if a competitor markets "our own AI, your data stays with us" and you do not have an answer.

If the answer is "they will not care," buy. If the answer is "yes, and we will lose deals over it," that is a real input to the build case.

**Question 3. What does failure cost us if we use a vendor?**

Map the worst case. Vendor goes down for four hours. Vendor leaks data through a logging bug (it has happened to every major one). Vendor changes their content policy and now refuses prompts that worked yesterday. For a non-critical feature, you eat it and move on. For a feature on the critical path of a regulated workflow, you cannot.

Write the failure cost in money or in customers lost. If it is small, the buy case gets stronger. If it is "we lose our biggest customer and the SLA penalty is six figures," you need at least multi-vendor and probably a build path for the most sensitive part.

**Question 4. What is the maintenance cost honestly going to be over 24 months?**

This is the question teams lie to themselves about. Custom AI is not "build it and forget it." It is evals, retraining when data drifts, on-call when the model behaves weirdly in production, and rebuilding pieces when the underlying open-source library makes a breaking change. Budget at minimum 20% of the initial build cost per year as ongoing maintenance, often more.

If you cannot honestly afford that ongoing cost, you cannot afford to build, even if the upfront math looks fine. Buy and revisit in a year.

After the four questions, you will have a one-page document with a defensible answer. If three of the four point the same direction, you have your call. If they split, you have a real decision to make and at least now you are making it on inputs instead of vibes.

## When to bring in someone like me to make the call

Sometimes the four questions split and your team has been arguing about it for two months. Sometimes you do not have an engineer in-house who has shipped both custom AI and vendor wrappers in production, and the team is choosing based on what they have seen, not what fits the problem. Sometimes the CTO knows the answer but needs an outside voice to confirm it so the rest of the leadership team will move.

That is the kind of work I do. An outside engineer who has built both ways can usually get to a defensible answer in a one-week sprint, with the math written down, the architecture sketched, and a build-or-buy recommendation that will hold up to a board question. You can see the kind of production AI work I have done at [/work](/work), and the engagement formats at [/services](/services).

If your team is stuck on a specific build vs buy call right now, a fifteen-minute conversation usually unsticks it for free. Book one at [/contact](/contact). I would rather you make the right call quickly than the wrong one with a fancy framework.

## Related reading

- [RAG vs fine-tuning: a 20-minute decision](/blog/rag-vs-fine-tuning-decision-flowchart). When build means tuning a model vs retrieving over your own data.
- [EU AI Act checklist for Dutch software teams](/blog/eu-ai-act-checklist-dutch-software-teams). How compliance affects the build vs buy decision.
