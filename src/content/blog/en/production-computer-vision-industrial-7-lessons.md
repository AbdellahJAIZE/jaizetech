---
title: "Production computer vision in industrial settings: 7 things academic papers never tell you"
description: "Lessons from running a graded-severity CV system 24/7 on a sorting conveyor. Annotation cost, label noise, the research-to-production gap, and what actually moves the needle."
published: "2026-04-19"
tags: ["computer vision", "industrial AI", "production ML", "agritech"]
ogImage: "/og-image.png"
primaryService: "cv"
---

Most computer vision research is built on ImageNet, COCO, or one of the medical or scientific benchmarks. Curated images. Clean labels. One score per image. Real industrial computer vision is none of those things.

I spent two and a half years owning the modelling on a production CV system that grades agricultural produce on a conveyor belt. Real customers, real money, real consequences when the model is wrong. This post is the seven lessons I keep coming back to. None of them are in the papers I read at the start. All of them are obvious in hindsight.

If you are building industrial CV in 2026 and you came from a research background, this post will save you months.

## 1. Annotation cost shapes your architecture, not the other way around

The cleanest architecture in a paper is "joint multi-task training across all defect categories with uncertainty-weighted loss balancing". Beautiful in principle. Impossible if annotating every category on every image takes 4 minutes per image and you have 50,000 images to label.

In practice you end up with a two-stage flow: a joint multi-output base trained on the full taxonomy (slow to annotate), then per-anomaly fine-tuning on cheaper one-category-at-a-time annotations (fast to produce). You did not arrive at this from theory. You arrived at it because that is the shape of data you could economically produce.

The deeper point is that **labelling economics drive your model architecture more than your model architecture drives your labelling**. If you let the architecture lead, you starve it of data. If you let the labelling lead, you get an architecture that fits the data flow.

## 2. Crop quality bounds downstream score quality

When your classifier is failing, look upstream. We had a regressor that scored produce defects. The scores were noisy. We spent weeks tuning the regressor. The actual bug was that our YOLO crop stage was leaving 5 to 10 pixels of background around each object. The regressor was learning the colour of the conveyor rolls and the edges of neighbouring objects as defect signal.

We re-annotated the YOLO training set with tighter boxes. Crop quality improved. Downstream regressor scores improved. We never touched the regression model.

The general rule: **in a multi-stage pipeline, upstream sloppiness compounds downstream**. Always check the easier-to-fix upstream stage before you touch the harder downstream one.

## 3. Robust losses matter way more than backbones when your labels are noisy

We switched from MSE to SmoothL1 (Huber loss) on the regression head. Three things improved: predictions stopped perfectly matching obviously-wrong annotator labels, distributional plots showed cleaner separation between intended populations, edge cases became more honest.

The textbook reason was obvious. Huber's quadratic-then-linear regime caps the gradient on extreme errors, so a single mislabelled outlier can only pull the weights so far. The textbook reason did not make us switch. Watching a model perfectly fit an obviously-mislabelled image on validation made us switch.

In industrial settings where annotator agreement is around 80 percent and you cannot afford to throw away the disagreements, **robust losses do more work than any backbone change you will make**. ResNet-50 with SmoothL1 outperforms a fancier backbone with MSE on real label noise. Every time.

## 4. Inter-annotator consistency is harder than the literature suggests

The literature on multi-rater annotation assumes you have many raters, they disagree somewhat, and you can compute statistical consensus (Dawid-Skene, confident learning). In a real industrial deployment with a small team of domain experts, you do not have many raters. You have three or four. Their disagreements are not statistical noise. They are real differences in how each expert reads ambiguous cases.

We tried multi-rater consensus. The model trained on consensus performed worse than the model trained on a single experienced reviewer's labels. The reason is that consensus averaged out the very expert judgment we needed the model to learn. So we accepted one expert's perspective as ground truth and the model became that expert, including their biases.

**This is a deliberate tradeoff, not a best practice**. It works when the expert is genuinely the best person to define ground truth and you understand you are inheriting their biases. It fails when you swap experts and the model has to re-learn the new perspective from scratch.

## 5. The research-to-production gap is months wide and that is normal

I see academic papers shipped to production in two to four weeks. I see good papers languish unshipped for three to six months. The difference is rarely the model. It is the validation overhead, the integration into the deployment stack, the risk budget of the operations team, and the cost of testing on real production data.

In our case, a recent training experiment and the currently deployed model can be three or four quarters apart. That gap is not slowness. It is the cost of being responsible about what runs against paying customers.

The implication for academic readers: **the most published model is rarely the most deployed one**. The deployed model is the one that survived the validation gauntlet. Often that means an older architecture with hardened training and inference, not the latest paper.

## 6. Foundation models still do not transfer cleanly to industrial CV

We tried DINO. We tried CLIP. We tried SigLIP. None of them outperformed a fine-tuned ResNet on our specific defect-grading task. The transfer from web-scale natural images to constrained industrial photographs (controlled lighting, single-object, top-down views, repeatable backgrounds) is not automatic.

Why? Industrial images break the assumptions foundation models were trained on. The features that distinguish a high-severity defect from a low-severity one are at the texture level, not at the semantic level. Web-pretrained features know "this is a potato" but do not know "this is a potato with surface cracking grade 3". The semantic gap is shallow. The texture gap is wide.

The promise of foundation models in industrial CV is real but unrealised. The research direction I would push on if I had unlimited bandwidth is **domain-adaptive self-supervised pretraining on industrial images** before supervised fine-tuning. Nobody has shipped this convincingly for industrial sorting yet, that I am aware of.

## 7. Per-product specialisation does not scale forever

We maintain one model per product (one for potatoes, one for onions, one for the next thing). Every new product onboarded needs its own training set, its own training runs, its own evaluation work, its own deployment artefact. The economics break around the 8-to-12-product mark.

What would fix this is a foundation model that transfers cleanly across products. We do not have one yet. So the operational cost grows roughly linearly with product count, and at some point your engineering team is just maintaining model variants instead of building new things.

If you are building industrial CV at scale, **plan your foundation-model strategy before you have 10 products in production**, not after. Architectural decisions made at product count 3 are baked in by product count 10.

## What this means for your team

If you are starting on industrial computer vision in 2026, the order of operations is:

1. **Spend the first month on annotation infrastructure**, not on models. The labelling pipeline drives everything downstream.
2. **Pick a robust loss from day one**. MSE or pure cross-entropy with noisy industrial labels is borrowing tomorrow's failure for today's convenience.
3. **Log upstream metrics, not just end-to-end**. Crop quality, annotation throughput, reviewer disagreement rate. These predict the failures you will see in three months.
4. **Plan your foundation-model adaptation experiment for month six**, not later. By month twelve you will wish you had.
5. **Budget for the research-to-production gap**. A model that works in a notebook is not done. It is 60 percent done.

The systems that ship and stay shipped are not the ones with the fanciest architectures. They are the ones where the labelling, training, deployment, and operational loops are all tight and the team has internalised that each of those loops matters more than the model architecture does.

If you want a structured read on an industrial CV system you are building or running, the [AI integration audit](/services) format works well for this. It is a written report on what is likely to break and what would move the needle most.

Related reading: [what actually breaks when AI hits production](/blog/what-breaks-in-ai-production) covers the broader production failure landscape, much of which applies to CV deployments too.
