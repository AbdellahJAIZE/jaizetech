---
title: "Agent frameworks in 2026: what actually survives production"
description: "LangGraph, CrewAI, the new SDKs. Which agent abstractions hold up under real load, which ones you rip out at month three, and when you should skip the framework entirely."
published: "2026-07-16"
tags: ["AI agents", "LangGraph", "agent frameworks", "production AI"]
ogImage: "/og-image.png"
primaryService: "ai-agent"
---

Every few months there is a new agent framework that promises to make the last one look primitive. I have now shipped and maintained agents built on several of them, and the pattern is boringly consistent: the demo is always great, and the framework you love in week one is the one you are fighting in month three.

So here is the honest field report. Not which framework is "best," but what actually survives contact with production, and when you should not reach for a framework at all.

## The demo is not the hard part

Agent frameworks are optimised for the demo: wire up three tools, add a planner, watch it reason. That part is easy now, in every framework. The hard part starts after the demo, and no framework saves you from it:

- **Determinism when you need it.** Real workflows have steps that must happen exactly once, in order, with a clear audit trail. An agent that "usually" calls the right tool is not good enough for anything touching money or records.
- **Failure handling.** What happens when a tool times out, a model returns garbage, or step four contradicts step two? This is 80% of the real work, and it is the part the demos skip.
- **Cost and latency under load.** A reasoning loop that makes six model calls per request is fine for one user and ruinous for a thousand.

If a framework does not make these three easier, its nice planner abstraction is decoration.

## What survives

The abstractions that hold up in production are the unglamorous ones. **Explicit graphs of steps** survive, because you can read them, test them, and reason about failure at each node. **Typed tool interfaces** survive, because they turn a class of runtime disasters into compile-time errors. **A hard boundary between the deterministic parts and the model calls** survives, because it lets you unit-test the logic and keep the LLM where it actually adds value.

What does not survive is the fully autonomous, "give it a goal and let it figure everything out" loop. It is a great demo and a terrible production system. Every serious agent I have shipped ended up looking less like an autonomous agent and more like a normal program that calls a model at a few well-chosen points.

## When to skip the framework entirely

A lot of what gets called an "agent" is a workflow with two model calls and an if-statement. You do not need a graph framework for that. You need a function.

My rule of thumb: if you can draw the whole flow on a napkin and it has fewer than five steps, write it as plain code that calls the model where needed. Reach for a framework when the flow is genuinely dynamic, when the set of steps depends on the model's output in ways you cannot enumerate in advance, and when you will maintain it for long enough that the structure pays for itself.

## The 2026 take

The frameworks have converged. They mostly offer the same primitives now, and the differences that matter are operational: observability, how easy it is to test a single node, how gracefully it degrades when a step fails. Pick the one whose failure story you understand, keep your deterministic logic out of the model, and do not let the word "agent" talk you into building an autonomous system where a script would have been more reliable and a tenth of the cost.

If you are staring at an agent that works in the demo and misbehaves in production, that is the exact gap we help teams close.
