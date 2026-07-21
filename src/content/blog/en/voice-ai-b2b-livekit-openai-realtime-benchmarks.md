---
title: "Voice AI for B2B in 2026: LiveKit, OpenAI Realtime, AssemblyAI, and Cartesia compared with real cost and latency numbers"
description: "Hands-on benchmarks for the four main components of a production voice AI stack. Cost per minute, end-to-end latency, language support, and the tradeoffs you only see after shipping."
published: "2026-05-06"
tags: ["voice AI", "LiveKit", "OpenAI Realtime", "AssemblyAI", "Cartesia", "production AI"]
ogImage: "/og-image.png"
primaryService: "ai-features"
---

Voice AI in 2026 is finally workable for B2B use cases. Two years ago every demo had a one-second pause between user speech ending and AI speech starting, and the voice itself was robotic enough to break trust. Now you can ship a voice-driven product flow that does not embarrass you in front of a customer.

I have been building voice integrations into a B2B product over the last year. This post is what I learned about the four main vendor categories in the production voice stack: the orchestration layer (LiveKit), the LLM with native voice (OpenAI Realtime), the speech-to-text (AssemblyAI), and the text-to-speech (Cartesia). Costs, latencies, language support, and the tradeoffs you do not see until you ship.

If you are evaluating a voice AI build in 2026, this should save you a couple of weeks of vendor demos.

## The voice AI stack in 2026

A production voice AI system has four layers:

1. **Orchestration**: connects user audio to the AI, handles turn-taking, manages the session. LiveKit Agents is the dominant choice. Pipecat is the open-source alternative.
2. **Speech-to-text (STT)**: turns user audio into text. AssemblyAI, Deepgram, OpenAI Whisper as a service.
3. **Language model**: handles the conversation logic. Either a regular LLM called with the STT transcript, or a native voice model like OpenAI Realtime.
4. **Text-to-speech (TTS)**: turns AI text back into speech. Cartesia, ElevenLabs, OpenAI TTS.

You can also use a single bundled model that does STT-LLM-TTS in one pass (OpenAI Realtime, Google's Gemini Live). The tradeoff is between integration simplicity (bundle) and vendor flexibility (separate components).

## Cost and latency by component

I ran these benchmarks on a typical B2B voice agent scenario: 5-minute conversation, English audio, mixed sentence lengths, no music or background noise.

### Orchestration: LiveKit Agents

- Cost: 0.001 to 0.005 euro per participant-minute for LiveKit Cloud
- Self-hosted is free for the orchestration itself, you pay only for compute
- Latency overhead added by orchestration: <50ms in EU regions
- Turn detector (multilingual, contextually aware) is included

LiveKit is the choice. There is no real second place in 2026 for production voice orchestration. Pipecat is fine for prototypes but lacks the operational tooling LiveKit ships with.

### STT: AssemblyAI

- Cost: ~0.37 euro per audio hour for real-time English
- Cost: ~0.45 euro per audio hour for non-English (including French, German, Dutch)
- Latency for partial transcripts: 200 to 400ms typical, can drop to 150ms with low-latency mode
- Final transcript latency: 400 to 700ms after speaker stops

AssemblyAI is currently best-in-class for accuracy in 2026, especially on multilingual or accented English. Deepgram is faster but slightly less accurate. OpenAI Whisper as a service is cheaper but laggier.

Notable: AssemblyAI's Dutch transcription is reasonable but not great. If your product needs Dutch as a first-class language, test against your actual audio quality before committing.

### LLM: OpenAI Realtime vs gpt-4o + Cartesia

This is the big architectural choice. Two paths:

**Path A: OpenAI Realtime API (bundled)**

- Cost: ~0.06 euro per audio minute input + ~0.24 euro per audio minute output
- Combined for a 5-minute conversation with balanced user/AI talk time: ~0.75 euro
- Latency: 250 to 600ms from user-stop to first audio frame
- Voices: 6 to 10 OpenAI voices, English-strong, multilingual decent

**Path B: AssemblyAI STT + gpt-4o + Cartesia TTS (separate)**

- AssemblyAI: ~0.37 euro per audio hour input = ~0.015 euro for 5-min conversation (mostly user audio)
- gpt-4o calls: depends on conversation length, typically 8 to 20 LLM calls per 5-min conversation, ~0.05 to 0.15 euro total
- Cartesia: ~0.04 euro per minute of generated audio = ~0.10 euro for 5-min conversation (mostly AI audio)
- Combined: **~0.20 euro per 5-min conversation**
- Latency: 500 to 900ms from user-stop to first audio frame

The bundled OpenAI Realtime path is ~4x more expensive but ~2x lower latency. Worth it for use cases where conversational responsiveness matters (consumer-facing, demo-heavy). Not worth it for use cases where 800ms is fine (B2B back-office automation, voice menus).

### TTS: Cartesia

- Cost: ~0.04 euro per minute of generated audio
- Latency: 80 to 150ms to first audio byte
- Voices: 100+ in English, ~30 in major European languages, Dutch coverage limited
- Streaming: yes, audio plays as it generates

Cartesia is the best TTS in 2026 for production voice agents. ElevenLabs has marginally better voice quality but ~2x the cost and slower latency. OpenAI TTS is cheaper but has more obvious AI-voice tells.

For Dutch specifically: Cartesia's Dutch voices are limited. If you need natural Dutch TTS, evaluate Acapela or local providers as additions. There is no clean winner for production-grade Dutch TTS yet.

## End-to-end latency budget

For a B2B voice agent that does not feel laggy, you want sub-1-second total turn-around (user stops speaking → AI starts speaking). Here is how the budget breaks down on the separate-components path:

| Component | Latency (typical) | Budget |
|---|---|---|
| STT partial transcript | 200-400ms | 300ms |
| LLM first-token time | 200-500ms | 350ms |
| TTS first byte | 80-150ms | 100ms |
| Audio playback start | 30-80ms | 50ms |
| Network round trips | 50-150ms | 100ms |
| **Total budget** | | **~900ms** |

That is the budget for "feels good". A budget of 600-700ms feels excellent. Above 1.2 seconds feels broken.

For comparison, OpenAI Realtime gets you to 250-600ms total, which is below the perception threshold for most users.

## The tradeoffs you only see after shipping

Things I learned the hard way:

### 1. Multilingual users break things

A user starts in English, switches mid-sentence to Dutch, then back. Your STT was set for English. The Dutch sounds like garbled noise. Your LLM responds to garbled noise. The user gives up.

Fix: code-switch detection at the STT layer. AssemblyAI and Deepgram both support it now but you have to enable it explicitly. Default config is single-language.

### 2. Background noise destroys transcription accuracy

A real customer environment has keyboards, HVAC, side conversations, dogs. Your demo environment did not. Production transcription accuracy is 10-20 percentage points lower than your laptop demo.

Fix: LiveKit ships with background voice cancellation. Use it. Also: tell users to use headphones or push-to-talk if accuracy really matters.

### 3. Long pauses confuse turn detection

A user thinks for two seconds before continuing. The AI thinks the user is done, jumps in, talks over them. The user gets annoyed.

Fix: tune the turn-detection model's silence threshold. LiveKit's turn detector is context-aware (it knows if a sentence is grammatically complete) and is much better than a simple silence-based VAD. Use it.

### 4. Latency variance is worse than average latency

If your latency is usually 600ms but occasionally spikes to 3 seconds, users remember the spikes. They form their opinion of the system based on the worst experience, not the median.

Fix: monitor p95 and p99 latency, not average. Set alerts on p99. The fixes are usually about queue management at one of the layers, often the LLM call.

### 5. Voice cost adds up faster than chat cost

Voice is ~3 to 10x more expensive per equivalent interaction than chat. A 5-minute voice conversation costs 0.20 to 0.75 euro depending on stack. A 5-minute chat equivalent (maybe 30 messages) costs 0.01 to 0.05 euro.

The implication: voice AI works for high-value B2B use cases (sales calls, customer support escalations, recruitment interviews). It is harder to justify for high-volume low-value flows (FAQ replacement, status updates). Pick voice for use cases where the conversational dynamic actually matters, not just because voice sounds cool.

## My recommendation for B2B voice in 2026

For a B2B voice agent that needs to feel professional, here is the stack I would build today:

- **Orchestration**: LiveKit Cloud (or self-hosted if you have GPU ops capacity)
- **STT**: AssemblyAI with code-switch enabled, low-latency mode
- **LLM**: gpt-4o-mini with function calling, falling back to gpt-4o for complex turns. Skip OpenAI Realtime unless latency is critical.
- **TTS**: Cartesia for English-primary, evaluate per-language for others
- **VAD / turn detection**: LiveKit's built-in turn detector
- **Background noise**: LiveKit's noise cancellation enabled

Total cost: roughly 0.20 to 0.30 euro per 5-min conversation. Total latency: 700-900ms end-to-end. Multilingual: workable for English/French/German/Spanish, limited for Dutch.

If you are evaluating a voice AI build and want a written analysis of which stack fits your specific latency, cost, and language requirements, that is the kind of work I do in a [POC sprint](/services). The output is a working prototype on your stack of choice plus a benchmark against alternatives.

Related reading: [what it really costs to run a production LLM feature in 2026](/blog/cost-of-production-llm-2026) covers the full cost picture for the LLM side of any voice integration.
