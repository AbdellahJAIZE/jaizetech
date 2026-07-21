---
title: "Computer vision on the factory floor: what changes between the demo and the line"
description: "A vision model that hits 98 percent on a clean test set can be useless on a real production line. The gap is lighting, timing, drift, and the cost of a wrong call. Here is what actually changes when the camera moves to the floor."
published: "2026-06-02"
tags: ["computer vision", "industrial AI", "production AI", "quality control"]
ogImage: "/og-image.png"
primaryService: "cv"
---

A vision model that scores 98 percent on a clean test set tells you almost nothing about whether it will work on a production line. I have watched a model with beautiful validation numbers fall apart the day it was bolted above a real conveyor, and I have watched a plainer model with worse paper numbers run for years. The difference was never the architecture. It was everything around the camera.

I spent more than two years building computer vision for an industrial setting, a Dutch agritech company running visual quality control on a high-throughput line. This post is what I wish someone had told me before the first install. If you are about to take a vision prototype onto a factory floor, read this first.

## The test set is a laboratory. The line is not.

Your test set was probably collected in good conditions. Decent light, clean lens, products presented one at a time, photographed by someone who cared. The line is the opposite of all of that, and each difference quietly eats accuracy.

### Lighting moves, and your model feels it

This is the single biggest source of production drift I have seen. Sunlight through a roof window at 3pm in June is not the same as the same line at 8am in December. A lamp ages and shifts colour. Someone installs a new fixture across the hall. None of this is visible to a human operator, who adapts without noticing. Your model does not adapt. It was trained on the light it saw, and a different light is a different distribution.

The fix is boring and it works. Control the light. Enclose the inspection zone, use consistent industrial lighting, and treat the lighting rig as part of the model, because it is. A model plus a controlled light box is a system. A model plus whatever the building happens to be doing is a gamble.

### Timing is now part of the problem

In a notebook, inference time is a number you glance at. On a line moving at several items per second, it is a hard constraint. If the line does six items a second, you have well under 166 milliseconds per item including capture, transfer, inference, and the decision, or you start dropping items or slowing the line. Neither is acceptable to the people who run the line.

This is why the biggest model rarely wins on the floor. A model that is 0.5 percent more accurate but twice as slow can be the wrong choice when slow means a physical queue backing up. You optimise for accuracy-within-the-time-budget, which is a different target than accuracy alone.

### Products arrive in poses you never photographed

On the line, the object is rotated, partly occluded by the one behind it, sometimes two stuck together, sometimes wet, sometimes covered in the dust of the thing being processed. Your clean test set had none of this. The model meets it for the first time in production, which is the worst place to meet anything.

You cannot photograph every pose in advance, but you can stop pretending the clean set is representative. Augment aggressively for rotation, occlusion, and lighting. Then collect hard cases from the live line continuously, because the line will always invent something your augmentation did not.

## A wrong call costs something specific, and you need to know what

In a demo, a false positive and a false negative feel symmetric. On a line they almost never are, and the asymmetry should drive the whole design.

Think about what each error actually does. A false reject throws away a good product, which is waste, measurable in euros per unit. A false accept lets a bad product through to a customer, which can be a complaint, a recall, or a safety issue, often far more expensive than the waste. Those two numbers are rarely equal, so the threshold that balances them is rarely 0.5.

I have set thresholds deliberately to over-reject because a false accept on that particular line was twenty times more expensive than throwing away a good unit. That is not a model decision, it is a business decision the model has to serve. Have it explicitly, with the real cost of each error type, before you pick an operating point.

## The model will drift, so plan to catch it

A line model is not a thing you ship once. The world it watches changes. New supplier, slightly different product. Season changes the light. A camera is nudged during maintenance. Each of these moves the input distribution, and accuracy decays quietly, without an error in the logs.

The mistake is shipping with no way to see this happen. You need a feedback loop. Log a sample of decisions with their images. Have an operator confirm or correct a slice of them. Track the confirmed accuracy over weeks, not the validation accuracy from training day. When the live number sags, you retrain or recalibrate before it becomes a quality incident instead of after. Most of the failure modes here are the same operational gaps I described in [what actually breaks when AI hits production](/en/blog/what-breaks-in-ai-production), just pointed at a camera instead of an API.

## Operators are part of the system, not an obstacle

The people running the line know things your model does not. They know that this batch is always borderline, that the camera on station three has been flaky since the maintenance, that the model gets twitchy when the morning sun hits. Treat them as sensors and as the human-in-the-loop, not as users to be designed around.

Give them a simple way to flag a wrong call and to see why the model decided what it did. That flag is your cheapest and most relevant training data, collected from exactly the distribution you care about. A model that operators trust gets used. A model that overrules them without explanation gets switched off the first quiet week, and then you have an expensive camera doing nothing.

## What to check before the first install

If you are moving a vision prototype to a real line, walk this list before you mount anything.

- Is the lighting controlled and enclosed, or are you at the mercy of the building?
- Do you have a hard time budget per item, and does your model clear it with margin?
- Do you know the euro cost of a false accept and a false reject, and is your threshold set to that, not to 0.5?
- Is there a feedback loop that measures confirmed accuracy on the live line over time?
- Can an operator flag a wrong decision in one action, and does that flag come back to you?

If you cannot answer these, the prototype is not ready for the floor, however good the test numbers look. I went deeper on the engineering lessons in [seven things I learned shipping industrial computer vision](/en/blog/production-computer-vision-industrial-7-lessons).

Taking a vision model from a promising prototype to something a plant manager trusts on a live line is specific work, and it is part of what I do as a [computer vision engineer](/en/services). The win is not a better score on your test set. It is a system the line can run without watching it.

