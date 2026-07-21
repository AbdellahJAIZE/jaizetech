---
title: "On-prem LLM hosting in the Netherlands: when, why, and what it actually costs in 2026"
description: "Privacy, GDPR, EU AI Act, and cost. When on-prem LLM hosting makes sense for Dutch companies, and the real numbers behind a vLLM or Ollama deployment compared to AWS Bedrock or OpenAI."
published: "2026-04-26"
tags: ["LLM infrastructure", "on-prem AI", "GDPR", "AI Act", "Netherlands"]
ogImage: "/og-image.png"
primaryService: "infrastructure"
---

Every Dutch company I have advised in the last six months has asked some version of the same question. Can we host this LLM ourselves? They are not asking out of curiosity. They are asking because their legal team has flagged GDPR concerns, or their customer data is sensitive, or the AI Act is making them nervous about US vendors.

The honest answer is yes, you can. The harder answer is whether you should. This post is the framework I use to help Dutch teams decide, with the actual cost math for a few common deployment shapes.

## The four reasons Dutch companies actually want on-prem

There are good and bad reasons to go on-prem with your LLM. Sorting them honestly saves a lot of money.

### 1. Customer data cannot leave the building

Healthcare, financial services, legal, and government IT have legitimate reasons to keep data inside their infrastructure. Sending patient records, banking transactions, or client documents to OpenAI's US datacentres is not always a workable answer to your CISO. Even with EU data residency, the US Cloud Act creates exposure that some Dutch buyers will not accept.

This is the strongest reason for on-prem. It is also the reason that justifies the cost most cleanly.

### 2. AI Act compliance is easier when you control the stack

The EU AI Act came into effect in waves through 2024-2026. For high-risk AI uses (HR decisions, medical, credit scoring, etc.), you need transparency, documentation, and the ability to audit what the model actually did. With a third-party model, you are partly dependent on the vendor's documentation. With an on-prem deployment, you control the model card, the inference logs, the evaluation artefacts, and the version history end to end.

Useful to note: the AI Act does not require you to self-host. But self-hosting makes some compliance work meaningfully simpler.

### 3. Predictable cost at scale

Per-token vendor pricing is great until your traffic is genuinely large. If you are processing 50 million tokens a day or more, the math starts to favour buying your own GPU capacity rather than renting per call.

The break-even point varies by use case, but as a rough heuristic: under 5 million tokens a day, vendor APIs win. Between 5 and 50 million, it is close. Above 50 million, on-prem is usually cheaper if you can run the GPUs at high utilisation.

Most Dutch teams I talk to are nowhere near 5 million tokens a day yet. They cite cost as a reason for on-prem when it is actually privacy.

### 4. Vendor lock-in fear

This one is more emotional than rational. The hyperscalers and frontier model providers do exert lock-in pressure (proprietary fine-tuning, ecosystem integrations, pricing power). On-prem reduces that. Open-weights models like Llama, Mistral, Qwen, and DeepSeek give you genuine portability.

Whether this matters depends on your time horizon. For a five-year strategic bet, vendor portability is a real concern. For a six-month MVP, it is theatre.

## What "on-prem" actually means in 2026

The term is doing a lot of work. Four flavours of on-prem with very different cost profiles.

### Flavour A: Self-hosted on your own datacentre GPU

The classic on-prem. Buy GPUs, rack them, run them. NVIDIA H100s, A100s, L40S, or the newer cards.

- Capex: 25,000 to 50,000 euro per H100, 8,000 to 12,000 euro per L40S
- Opex: power, cooling, datacentre space, ops team
- Realistic for teams with existing on-prem infrastructure. Painful for teams that have been cloud-native for a decade.

### Flavour B: GPU rental in a colocation or sovereign cloud

NL-based providers (Leaseweb, NorthC, Greenhouse Datacenters) and EU-based sovereign clouds (OVHcloud, Scaleway, Hetzner).

- Cost: 1.5 to 4 euro per H100 hour, 0.4 to 1.2 euro per L40S hour
- You still operate the software stack
- Faster to start than buying hardware. Slower than cloud APIs. The middle ground.

### Flavour C: Hyperscaler with EU data residency

AWS Bedrock with EU region, Azure OpenAI Service with EU region, Google Vertex AI with EU region.

- Cost: 0.5 to 2 euro per million tokens for mid-tier models
- Data stays in EU but the underlying service is operated by a US company
- Easier sell to engineering than self-hosted. Harder sell to legal than true on-prem.

### Flavour D: Open-weights model on managed inference

Together AI, Anyscale, Fireworks, Replicate. Open-weights models served by a third party.

- Cost: 0.1 to 0.7 euro per million tokens for mid-tier open models
- US-operated by default, some have EU options coming online
- Cheap and fast but not really "on-prem". Often confused with on-prem in conversations.

## Real cost math for three deployment shapes

To make this concrete, here is what each looks like for a mid-tier Dutch SaaS company at moderate scale (10 million tokens a day, 300 million a month).

### Vendor API (OpenAI gpt-4o-mini equivalent)

- 300 million tokens at 0.15 euro per million = 45 euro per month
- Plus operational overhead (monitoring, retries, eval reruns), call it 200 euro
- **Total: ~245 euro per month**

Almost nothing at this scale. This is why most teams use vendor APIs.

### Hyperscaler with EU residency (AWS Bedrock with Llama 3.1 70B equivalent)

- 300 million tokens at 0.8 euro per million = 240 euro per month
- Plus operational overhead, call it 300 euro
- **Total: ~540 euro per month**

More expensive than the vendor route, but data stays in EU.

### Self-hosted vLLM on rented L40S GPUs (open-weights Llama 3.1 8B or 70B)

- 2 L40S GPUs at 0.8 euro per hour, 24/7, running at 60 percent utilisation = 1,150 euro per month
- Plus engineering ops (deployment, monitoring, model updates), call it 1,000 euro per month
- **Total: ~2,150 euro per month**

Way more expensive at this scale. The math only starts to favour this above ~50 million tokens per day, where the marginal cost per token approaches zero on owned capacity.

### Self-hosted on owned H100s (high-volume scenario, 100 million tokens per day)

- 4 H100s purchased at 35,000 euro each = 140,000 euro capex, amortised over 36 months = ~3,900 euro per month
- Power, cooling, colocation = ~600 euro per month
- Engineering ops = ~1,500 euro per month
- **Total: ~6,000 euro per month for 3 billion tokens per month**

That is 2 euro per million tokens, which beats most vendor APIs for mid-tier models. But you only get this break-even at sustained high utilisation. If your traffic is bursty, your effective cost per token goes up because GPUs sit idle.

## When on-prem actually makes sense

Based on the math and the real-world reasons:

| Situation | Recommended path |
|---|---|
| You handle sensitive data (health, legal, finance, gov) and need strict residency | Self-hosted (rented or owned) on EU infrastructure |
| You are AI-Act-high-risk and need full audit trail control | Self-hosted, with versioned model artefacts and inference logs |
| You process >50M tokens per day sustained | Self-hosted on owned hardware, possibly hybrid with vendor API for burst |
| You process <5M tokens per day and have no strict residency need | Stay on vendor APIs |
| You want lower vendor lock-in but cost matters | Open-weights model on EU-based managed inference (Flavour D with EU option) |

The wrong answer is "on-prem because we want to look serious about privacy". That signals to a buyer or auditor that you are doing security theatre, not actual privacy engineering. If you are going on-prem, do it for a real reason and document the threat model that justifies it.

## What it takes operationally

Self-hosted LLM in 2026 is significantly easier than it was two years ago, but it is still not push-button. You need:

- vLLM, TGI, or Ollama as the serving layer
- A model registry (MLflow, custom, or just a shared object store)
- Monitoring stack (Prometheus + Grafana, or commercial)
- An eval pipeline you can run on your serving stack as well as a vendor's
- A deployment process for model updates (open-weights models update too)
- Someone who knows GPU ops and can debug CUDA OOM errors at 2am

Most Dutch teams I have advised through this find the ops side is the cost driver, not the GPU rental or hardware. Budget at least 0.5 to 1 FTE of engineering for the first year of any serious on-prem deployment.

## My recommendation for most Dutch teams in 2026

Unless you have a hard residency requirement or you are processing serious volume, **stay on vendor APIs with EU data residency for now**. The cost difference is small at typical scale, the operational burden is much lower, and the vendor ecosystem moves faster than your team can.

When you cross one of these lines, revisit:
- Sustained traffic above 50M tokens per day
- A specific compliance or contractual requirement that mandates on-prem
- A genuine vendor-portability concern over a 3-plus year horizon

If you want a written analysis of which path makes sense for your specific use case, that is the kind of work I do in an [AI infrastructure audit](/services). The output is a recommendation with the cost math shown for your traffic profile and threat model, so you can defend the decision to your CFO and your CISO at the same time.

Related reading: [what it really costs to run a production LLM feature in 2026](/blog/cost-of-production-llm-2026) covers the full cost picture beyond just hosting. [EU AI Act checklist for Dutch software teams](/blog/eu-ai-act-checklist-dutch-software-teams) covers the compliance angle.
