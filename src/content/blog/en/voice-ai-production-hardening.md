---
title: "5 Voice AI Production Mistakes That Break Real Calls"
description: "Hard lessons from voice AI production incidents: endpointing delay, barge-in failures, latency budgets, and monitoring gaps that text-LLM checklists miss."
published: "2026-10-04"
tags: ["voice AI", "production hardening", "latency", "LiveKit", "observability"]
ogImage: "/images/blog/voice-ai-production-hardening/cover.jpg"
primaryService: "hardening"
---
Human conversation runs on a gap of roughly 200 milliseconds between one speaker stopping and the next starting. That figure comes from conversation-analysis research, holds up across languages, and is why the industry settled on 800ms (end of caller speech to first audio out) as the target. It is a sensible target. In most of the voice AI production incidents I get pulled into, it is also not the number that was actually broken.

The number nobody measures is how long the system waits before deciding the caller has finished speaking. Endpointing delay sits inside that 800ms budget, it is usually configured once and forgotten, and when it is wrong every other optimisation is cosmetic. A 700ms silence threshold means a caller who pauses to read a reference number off a screen gets cut off by the agent. A 1.5s threshold means every turn feels sluggish even though your dashboard proudly reports 320ms time to first token.

Below are the mistakes I keep finding when a voice demo that worked beautifully in test calls meets actual callers. Each fix takes days rather than months, and all of them are cheaper before go-live than after a week of call recordings nobody wants to listen to.

## Mistake 1: treating voice AI production like text LLM hardening with speakers attached

Most voice hardening checklists I am shown are a text-LLM checklist with "voice" written in the title. Prompt versioning, eval suite, token budgets, retries, observability. All of it necessary. None of it touches the parts that break.

A text user types, hits enter, and waits. That single act hands you a clean turn boundary for free, and almost every assumption in an LLM stack quietly rests on it. Voice gives you none of that. You get a continuous audio stream with no enter key, and your system has to guess, several times per second, whether the human is done. Then it has to survive the cases where it guessed wrong: the caller starts talking while audio is still playing, a dog barks and trips voice activity detection, the caller says "uhh" for 1.2 seconds, the SIP trunk drops 4% of packets and the transcript arrives as half a sentence.

So what I have written about [finding the real latency bottleneck in an LLM feature](/en/blog/llm-latency-audit-production) and about [observability that catches silent degradation](/en/blog/llm-observability-production-monitoring) still applies here. It is necessary and it is not sufficient. Voice adds an audio pipeline with its own failure modes, its own clock, and a cost model driven by wall-clock seconds rather than tokens. Harden the LLM layer alone and you ship something that produces excellent answers at the wrong moment.

The fix is to treat the audio path as a first-class component with its own tests, metrics and owner. If your stack is LiveKit Agents plus a realtime model, someone on the team should be able to say what the VAD threshold is set to, why, and what happens on a bad line. If nobody can answer that, you do not have a voice system yet. You have an LLM with a microphone attached.

## Mistake 2: no real barge-in handling, so callers get talked over

This is the most common gap and the fastest to diagnose. Call your own agent, let it start a long answer, and interrupt it mid-sentence the way an impatient human does. Three things can happen.

![5 Voice AI Production Mistakes That Break Real Calls](/images/blog/voice-ai-production-hardening/1.jpg)

The agent keeps talking over you until its sentence finishes. Or the agent stops, but your interruption was never transcribed, so it answers the previous question again. Or the agent stops, hears you, and its context still contains the full text of the answer it was speaking, including the two sentences the caller never heard.

That third case is the one teams miss, and it poisons the rest of the call. The model believes it told the caller the opening hours. The caller believes it said nothing. Every later turn is built on a transcript that does not match what happened on the line.

Proper barge-in handling has four parts, and partial implementations are everywhere:

- **Detect** speech while TTS is playing, with a threshold tuned so breathing and background chatter do not trigger it.
- **Stop** playback immediately, including whatever is already buffered in the client or the SIP leg. Killing the generator but not the jitter buffer buys you nothing.
- **Truncate** conversation history to what was actually spoken. OpenAI's Realtime API exposes this through item truncation with an audio-end offset, so use it. On a cascaded STT plus LLM plus TTS pipeline you have to track playback position yourself and cut the assistant message at that point.
- **Re-arm** so the agent does not immediately barge into the caller's new sentence.

Then test it with hostile input. A caller on speakerphone in a warehouse. A caller who says "yeah" and "mhm" while the agent talks, which should not count as an interruption. A caller who starts a question, stops, and restarts. Those three behaviours, in my experience, account for most of the "the bot is broken" feedback that arrives with no reproducible example attached.

## Mistake 3: monitoring transcripts instead of the audio pipeline

When a voice call goes wrong, the transcript is the last place the evidence lives. It shows the output of a pipeline whose failure happened upstream. If STT dropped the first word, the transcript reads as a slightly odd but plausible sentence, and your LLM eval scores it as fine.

Voice AI monitoring needs metrics the text world never required. What I instrument before go-live:

- **Time to first audio byte**, measured from end of caller speech, at p50 and p95. Not time to first token. The caller hears audio, not tokens.
- **Endpointing delay** as its own series, separate from model latency, so you can see when it is eating the budget.
- **Interruption rate and interruption outcome**: how often callers barge in, and how often the system handled it cleanly.
- **Silence events**: gaps over two seconds where neither party spoke. That is where callers hang up.
- **STT confidence distribution** per call, plus word error indicators wherever you have ground truth. A sudden shift usually means a codec or trunk change rather than a model change.
- **Packet loss and jitter** on the media leg, tagged by carrier. Telephony audio at 8kHz µ-law is a different input distribution from the 24kHz WebRTC audio you tested with, and models degrade differently on it.
- **Hang-up position** in the call flow. Clusters tell you more than any eval score.

Then listen to calls. Not transcripts, audio. Twenty full recordings in your first production week, chosen by sampling the tail of the latency distribution rather than at random. I have never run that exercise without finding something no dashboard surfaced, usually a TTS pronunciation failure on a product name or three seconds of dead air during a tool call.

## Mistake 4: one latency number instead of a budget per stage

"Our voice AI latency is around 900ms" is not an engineering statement. It is an average across a pipeline with five or six serial stages, any of which can be the problem, and averages hide precisely the calls that make people hang up.

Write the budget down per stage and hold each stage to a p95. A cascaded stack looks roughly like this:
caller stops speaking
  ├─ endpointing decision      ~250-500 ms   (tunable, often the biggest slice)
  ├─ final STT transcript       ~50-150 ms   (streaming; mostly already done)
  ├─ LLM time to first token   ~200-400 ms   (model + prompt size)
  ├─ TTS time to first audio    ~80-200 ms   (streaming TTS only)
  └─ network + jitter buffer    ~50-150 ms   (carrier dependent)
                                ----------
                          target  < 800 ms   p95, not mean

Those ranges are what I plan around, not a benchmark. Measure your own. The value of writing it out is that it tells you where to spend a week. If endpointing sits at 500ms and time to first token at 250ms, tuning the model is the wrong project. And if a tool call lands in the middle of a turn, that stage needs its own budget plus almost certainly a filler phrase, because 1.8 seconds of silence while you query a CRM reads to a human as a dropped call.

Speech-to-speech models collapse several of these stages, which is why they feel faster. They also give you less visibility into which part is slow and less control over each piece. I compared those trade-offs across LiveKit, OpenAI Realtime, AssemblyAI and Cartesia with cost and latency numbers in [the voice stack benchmark post](/en/blog/voice-ai-b2b-livekit-openai-realtime-benchmarks). Read that one if you are still choosing. This one assumes you chose already and now have to survive callers.

## Mistake 5: letting call duration drive cost instead of capping it

Token-based cost control does not transfer. Realtime audio models bill per minute of audio in and out, so your unit of spend is wall-clock seconds, and wall-clock seconds belong to the caller, not to you. Someone who rambles for nine minutes costs three times someone who gets an answer in three, for the same business outcome. Nothing in your prompt budget notices.

The failure mode that genuinely hurts is the stuck call. An agent loops, a caller puts the handset down without hanging up, a hold-music stream keeps the session alive. I have seen a single session run past forty minutes because nothing in the stack had an opinion about maximum call length. Voice AI cost control starts with having that opinion:

- **Hard session cap** (I usually start at 10 minutes) with a graceful close and a handoff, enforced server-side rather than in the prompt.
- **Silence timeout**: no caller speech for 20 to 30 seconds, confirm once, then end the call.
- **Loop detection** on repeated assistant turns. Three near-identical responses means escalate, not continue.
- **Cost per completed call** as the headline metric, with p95 next to the mean and a breakdown by call outcome. Mean cost per call is the number that lets a long-tail problem hide for a month.
- **A daily spend ceiling** on the realtime account. A misrouted campaign or a dialler bug is a very real way to lose a budget overnight.

Long calls degrade quality as well as margins. Context grows, latency drifts upward, and models get measurably worse at tracking what was already said somewhere around the twentieth turn. Capping duration is a quality control, not only a finance one.

## What "hardened" means before you take real traffic

The list I want green before a voice agent answers a real customer number:

1. Barge-in tested with hostile input, including history truncation to spoken audio.
2. Per-stage latency budget written down, instrumented, and held to p95.
3. Audio-pipeline metrics shipping to the same place as your LLM metrics, with alerts on silence events and STT confidence drops.
4. Session duration cap, silence timeout and loop detection enforced in code.
5. Cost per completed call tracked by outcome, with a daily ceiling.
6. A tested fallback to a human or a callback when any of the above trips.
7. An eval set built from real call audio rather than text transcripts, run on every prompt or model change. The [continuous eval loop](/en/blog/llm-evaluation-production-continuous-eval) counts for more here than in text, because voice regressions stay invisible until somebody listens.

Most teams I meet are missing items 1 and 7 entirely, with item 3 half-built. Closing those gaps is three to six weeks of work, which is the shape of a [Production Hardening](/en/services) engagement: barge-in and endpointing tuning, the per-stage latency budget, audio-pipeline monitoring, duration and cost controls, and a hardened deploy you can hand to your own team. If your voice demo is about to meet real callers, [get in touch](/en/contact) and we can start with your call recordings.
