---
title: "AI Agent Loop Guardrails: Stopping the 340-Call Ticket"
description: "A production playbook for AI agent loop guardrails: iteration, time, and budget caps, loop detection, human escalation, and termination tests."
published: "2026-10-09"
tags: ["AI agents", "LLM observability", "productie betrouwbaarheid", "kostenbeheer", "agent frameworks"]
ogImage: "/images/blog/ai-agent-loop-guardrails-production/cover.jpg"
primaryService: "hardening"
---
A support agent I was asked to look at ran 340 tool calls on a single ticket before anyone noticed. It was trying to find an order number. The lookup tool returned an empty result, the agent decided the format must be wrong, reformatted it, and called the same tool again. Nothing crashed, no alert fired, and the token spend on that one conversation was roughly what a hundred normal tickets cost. That is the gap **AI agent loop guardrails** fill.

An agent that errors out is visible. An agent that keeps working is not, and the default behaviour of every framework I have used is to keep working until something external stops it. Each iteration carried the full growing message history, so the cost per step climbed as it went. The ticket just sat in "in progress" for nine minutes.

Below is the workflow I use to make an agent provably stop: where the loop decisions live, which caps actually bind, how to spot a loop before a cap has to fire, when to hand off to a human, and how to test the whole thing.

## It doesn't crash, it just keeps going

Runaway agents are expensive for a boring structural reason. The thing that makes an agent an agent is a loop whose exit condition is decided by the model. A chain has a fixed number of steps. An agent asks, after every step, "am I done?" and the answer comes from the same component that just failed to solve the problem.

So when a tool returns something the model does not expect (empty result, malformed JSON, a 500, a timeout, a permission error phrased as prose), the model very often concludes that it approached the task wrong rather than that the task cannot be completed. That is a reasonable inference once. It is a disaster twelve times in a row with an expanding context window.

Two things hide it. First, the per-request cost looks fine; it is the per-task cost that explodes, and most teams meter requests. I wrote about this pattern in [the five causes behind an LLM cost spike](/en/blog/llm-cost-spike-production), where uncapped agent loops sit alongside retrieval bloat and retry storms. Second, loops often resolve eventually, so they show up as "that ticket was a bit slow" rather than as an incident.

## Three places an agent decides to go again

Before you add caps, be clear on which loop you are capping, because teams usually cap one of these and leave the other two open.

![AI Agent Loop Guardrails: Stopping the 340-Call Ticket](/images/blog/ai-agent-loop-guardrails-production/1.jpg)

**The reasoning loop.** The main agent cycle: think, call a tool, observe, decide whether to continue. This is the one frameworks expose a limit for (`recursion_limit` in LangGraph, `max_iterations` in older LangChain agents, `max_iter` per CrewAI agent). It is also the only one most teams set.

**The retry loop inside a single step.** Your HTTP client retries the provider three times. Your tool wrapper retries the downstream API twice. Your structured-output parser retries with a repair prompt when validation fails. None of these increment the iteration counter, so an agent with a limit of 15 can easily make 90 model calls. [Structured output repair loops](/en/blog/llm-structured-output-failures-production) are particularly good at this, because the repair prompt includes the failed output and the schema, making each retry more expensive than the original call.

**The delegation loop.** In multi-agent setups, agent A asks agent B, B needs clarification, asks A, A re-delegates with more context. Each sub-agent may have its own iteration budget, and the budgets multiply. A supervisor with 10 iterations over four workers with 10 each is a 400-step ceiling that nobody wrote down. This is one of the real reasons to move toward [an explicit graph rather than implicit delegation](/en/blog/crewai-to-langgraph-migration-playbook): the edges you can draw are the loops you can count.

Write the ceiling down as arithmetic before you touch code. Multiply the nesting, multiply by your worst-case tokens per step, multiply by your price per million. If that number makes you uncomfortable, you have found your first hardening task.

## The AI agent loop guardrails that actually stop it: iteration, time, budget

Three caps, and you need all three, because each one fails to catch what the others catch.

An **agent iteration limit** is the easiest and the weakest. It stops infinite loops but says nothing about cost, because iteration 14 with 80k tokens of accumulated history costs far more than iteration 2. Set it anyway, and set it low. For most single-purpose agents I start at 8 to 12 and look hard at any task that legitimately needs more. If your p99 task uses 11 of 12 iterations, your limit is not a guardrail, it is a cliff edge you are standing on.

A **wall-clock deadline** catches what iteration counts miss: a single tool call hanging for 90 seconds, a provider degrading, a retry chain with exponential backoff that technically completes. Set the deadline once at the entry point, pass it down as an absolute timestamp, and check it before every tool call and every model call rather than only between iterations. Per-call timeouts are not a substitute; four 30-second timeouts in sequence is a two-minute task.

A **token or cost budget** per task is the cap that matters commercially and the one I see least often. It is also simple: accumulate prompt plus completion tokens across every model call in the task, including retries and sub-agents, and refuse to make the next call if the projected cost would cross the ceiling. The projection part matters. Checking after the call means the expensive call already happened.

python
class TaskBudget:
    def __init__(self, max_tokens, deadline_ts, max_steps):
        self.max_tokens = max_tokens
        self.deadline_ts = deadline_ts
        self.max_steps = max_steps
        self.tokens = 0
        self.steps = 0

    def check(self, projected_tokens):
        if time.time() > self.deadline_ts:
            raise Terminated("deadline")
        if self.steps >= self.max_steps:
            raise Terminated("step_limit")
        if self.tokens + projected_tokens > self.max_tokens:
            raise Terminated("budget")

    def record(self, usage):
        self.tokens += usage.prompt_tokens + usage.completion_tokens
        self.steps += 1

One object, created at task entry, threaded through every model call and every tool wrapper including nested agents. The important design choice is that sub-agents share the parent budget instead of getting their own. Shared budgets do not multiply.

The other half of real **LLM agent cost control** is what happens when a cap fires. Raising an exception into a stack trace that becomes a 500 is a bad outcome for the user and a worse one for your support queue. Terminate into a defined state: a partial result with the work done so far, a reason code, and a next action (escalate, queue for retry with different parameters, or return to the user with an honest "I could not complete this"). A cap that fires should produce a usable artifact, not a void.

## Catching a loop before the cap fires: repetition and no-progress signals

Caps are the floor. Good **agent loop detection** notices the pathology at step four instead of step twelve, which is the difference between a cheap stop and an expensive one.

Two signals do most of the work.

**Repetition.** Hash each tool call as (tool name, normalised arguments) and keep a counter per task. The same tool with the same arguments twice is often legitimate, for instance a retry after a transient failure. Three times is almost never productive. Normalising arguments matters, because the interesting case is the agent that changes the input cosmetically: `ORD-10432`, `ord 10432`, `10432`. Lowercase, strip whitespace and punctuation, then hash. If the normalised call repeats, stop and tell the model explicitly that it already tried that and got that result. Sometimes that single injected observation breaks the loop, because the model needs the repetition to be visible in the context, not just in your metrics.

**No progress.** Harder, and worth it. Define progress for your agent concretely rather than abstractly: new facts added to a scratchpad, a required field in the output schema filled in, a document retrieved that was not retrieved before, a state transition in your own workflow. Then count iterations since the last progress event. Two or three with nothing new is a loop regardless of how varied the tool calls look. An agent cycling through five different tools, all returning nothing useful, passes a repetition check and fails this one.

A third, cheaper signal: context growth without state change. If the message history grew by 6k tokens and your structured task state is byte-identical, the agent is talking to itself.

Put all of this in traces. Tool-call sequence, iteration count, cumulative tokens, and termination reason per task, aggregated so you can see the distribution rather than individual bad days. Without that, you cannot set an iteration limit honestly, because you do not know what your p95 task actually needs. This is where [LLM observability stops being a dashboard and starts being a design input](/en/blog/llm-observability-production-monitoring).

## When the agent should stop and ask a human instead of retrying

Retrying is the model's default response to almost everything. For a decent fraction of real failures, retrying is the wrong move and escalation is the right one, and the agent cannot usually tell the difference by itself. So decide outside the model.

Escalate, do not retry, when:

- A tool returns a permission or auth error. No amount of rephrasing fixes a missing scope.
- A required input is genuinely absent or ambiguous. The agent guessing an order number is worse than asking.
- The action is irreversible and confidence is low: refunds, emails to customers, writes to a system of record. Ask for approval instead of re-deriving.
- Two different tools disagree about a fact the task depends on. That is a data problem, not a reasoning problem.
- A repetition or no-progress signal has fired once already.

In practice that means your tool wrappers return typed failures (`retryable`, `terminal`, `needs_human`) rather than strings, and the orchestration layer routes on that type before the model ever sees the result. The model should never be the thing that decides whether an auth failure is worth another attempt.

Escalation needs a destination that exists: a queue someone reads, with the partial result, the trace, and a specific question. Escalating into nowhere is just a slower timeout.

## Proving termination: how to test that your agent actually stops

This is the part that gets skipped, and it is the only part that turns the rest into a guarantee.

Test termination the way you test failure handling anywhere else: force the conditions. Build a fixture harness where tools are stubs you control, then write cases specifically designed to make an agent spin.

- **The always-empty tool.** Every lookup returns no results. Assert the task terminates within the iteration limit with reason `no_progress` or `step_limit`, and never exceeds the token budget.
- **The always-failing tool.** Returns a 500 every time. Assert total model calls stay under your computed ceiling, including HTTP-level retries. This is the case that exposes multiplied retry layers.
- **The slow tool.** Sleeps past the deadline. Assert the deadline fires mid-call, not after.
- **The oscillating tool.** Returns A, then B, then A for identical inputs. Classic infinite loop fuel, and a good test of the repetition hash.
- **The permission error.** Assert the run escalates on the first occurrence and makes zero further model calls.
- **The expensive-context case.** Feed a large document so each iteration carries 20k tokens. Assert the budget cap fires before the iteration cap, with a usable partial result.

Run these in CI on every prompt and framework change. Prompt changes alter loop behaviour; a new "be thorough and verify your work" instruction can double average iterations without changing a single line of code, which is one more argument for [versioning prompts and regression-testing them](/en/blog/prompt-versioning-regression-testing).

Then assert on cost in your test suite, not just on correctness. Record max tokens per task per scenario and fail the build when it regresses more than, say, 20%. It is the only cost control that works before deployment rather than after the invoice.

## What to check before you hand it more autonomy

If you are about to give an agent more traffic, more tools, or permission to write to a real system, these are the questions I would want answered first:

- What is the maximum number of model calls one task can make, counting retries and sub-agents, and have you verified it by test rather than by reading the code?
- What is the maximum cost of one task, and who gets paged if the p99 crosses it?
- Do all nested agents share one budget object, or does each have its own?
- Does a cap firing produce a partial result and a reason code, or a stack trace?
- Which failures escalate instead of retrying, and is that decision made outside the model?
- Can you see, for last week, the distribution of iterations per task rather than just the average?

Most teams can answer two or three of those. The gap is not usually skill. These questions only become urgent after the first expensive week, and by then the agent already has traffic. The design work itself is modest: a budget object, typed tool failures, two detection signals, six test fixtures. A few days of work that caps an open-ended liability is a good trade in any quarter.

## Common questions

**What is a reasonable agent iteration limit?**
Lower than you think. For single-purpose agents (lookup, extraction, routing) 8 to 12 covers nearly everything. For research or multi-tool agents, look at your trace data: take the p95 iteration count for successful tasks and add a small margin. If you cannot get that number, you are guessing, and guessing high is how a 340-call ticket happens.

**Does a token budget per task actually prevent cost spikes?**
It prevents the unbounded kind, which is the one that produces a surprising invoice. It does not help with a steady increase in traffic or with prompts that got quietly longer. Treat the per-task budget as a ceiling on worst-case damage and keep separate monitoring on aggregate spend; the [causes behind a cost spike](/en/blog/llm-cost-spike-production) are usually several things at once.

**How do I detect an agent loop without slowing the agent down?**
Both main signals are cheap. Hashing a normalised tool call is microseconds, and tracking progress is a counter you increment when your own state changes. Neither needs a model call. Avoid the temptation to use an LLM judge to detect loops in real time: you are adding cost and latency to a path that exists to control cost and latency.

**Can framework defaults handle this for me?**
Partly. LangGraph's recursion limit and CrewAI's `max_iter` cover the reasoning loop, which is one of the three. No framework I have used tracks a shared cost budget across nested agents, projects cost before a call, or distinguishes retryable from terminal tool failures for you. That part is yours, whichever framework you picked. I went through what else survives contact with production in [agent frameworks in 2026](/en/blog/agent-frameworks-2026-what-survives-production).

**Should the agent itself know about its budget?**
Telling the model it has a limited budget can help it prioritise, and it can also make it anxious and sloppy, cutting work short to "save" tokens. I prefer to keep the budget in the orchestration layer and inject only specific observations, like "you already called this tool with these arguments and got an empty result".

Capping an agent that already works in production is exactly the shape of a Production Hardening engagement: three to six weeks to add iteration, time, and shared budget ceilings, loop detection on repetition and no-progress, typed escalation paths, and a termination test suite that runs in CI, so the agent can take more traffic without taking more risk. The scope of that work is on the [services page](/en/services), and if you want a second pair of eyes on your current agent loop before you widen its permissions, the [contact page](/en/contact) is the fastest route.
