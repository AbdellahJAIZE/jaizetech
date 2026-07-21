---
title: "Voice AI voor B2B in 2026: LiveKit, OpenAI Realtime, AssemblyAI en Cartesia vergeleken met echte cost- en latency-cijfers"
description: "Hands-on benchmarks voor de vier hoofdcomponenten van een productie voice AI-stack. Kosten per minuut, end-to-end latency, taalondersteuning en de tradeoffs die je pas ziet na het lanceren."
published: "2026-05-06"
tags: ["voice AI", "LiveKit", "OpenAI Realtime", "AssemblyAI", "Cartesia", "productie-AI"]
ogImage: "/og-image.png"
primaryService: "ai-features"
---

Voice AI in 2026 is eindelijk werkbaar voor B2B use cases. Twee jaar geleden had elke demo een seconde pauze tussen het einde van gebruikersspraak en het begin van AI-spraak, en de stem zelf was robotisch genoeg om vertrouwen te breken. Nu kun je een voice-gedreven productflow shippen die je niet schaamt voor een klant.

Ik heb het afgelopen jaar voice-integraties gebouwd in een B2B-product. Deze post is wat ik geleerd heb over de vier hoofdcategorieën vendors in de productie voice-stack: de orchestratielaag (LiveKit), de LLM met native voice (OpenAI Realtime), de speech-to-text (AssemblyAI) en de text-to-speech (Cartesia). Kosten, latency, taalondersteuning en de tradeoffs die je pas ziet als je shipt.

Als je in 2026 een voice AI-build evalueert, dit moet je een paar weken aan vendor-demo's besparen.

## De voice AI-stack in 2026

Een productie voice AI-systeem heeft vier lagen:

1. **Orchestratie**: verbindt gebruikersaudio met de AI, regelt turn-taking, beheert de sessie. LiveKit Agents is de dominante keuze. Pipecat is het open-source alternatief.
2. **Speech-to-text (STT)**: zet gebruikersaudio om in tekst. AssemblyAI, Deepgram, OpenAI Whisper als service.
3. **Taalmodel**: regelt de conversatielogica. Of een reguliere LLM aangeroepen met het STT-transcript, of een native voice-model zoals OpenAI Realtime.
4. **Text-to-speech (TTS)**: zet AI-tekst terug om in spraak. Cartesia, ElevenLabs, OpenAI TTS.

Je kunt ook een enkel gebundeld model gebruiken dat STT-LLM-TTS in één pass doet (OpenAI Realtime, Google's Gemini Live). De tradeoff is tussen integratie-eenvoud (bundel) en vendorflexibiliteit (aparte componenten).

## Kosten en latency per component

Ik draaide deze benchmarks op een typisch B2B voice agent-scenario: 5-minuten conversatie, Engelse audio, gemengde zinslengtes, geen muziek of achtergrondgeluid.

### Orchestratie: LiveKit Agents

- Kosten: 0,001 tot 0,005 euro per deelnemer-minuut voor LiveKit Cloud
- Self-hosted is gratis voor de orchestratie zelf, je betaalt alleen voor compute
- Latency-overhead door orchestratie: <50ms in EU-regio's
- Turn detector (multilingual, contextueel bewust) inbegrepen

LiveKit is dé keuze. Er is geen echte tweede plek in 2026 voor productie voice-orchestratie. Pipecat is prima voor prototypes maar mist de operationele tooling die LiveKit meelevert.

### STT: AssemblyAI

- Kosten: ~0,37 euro per audio-uur voor real-time Engels
- Kosten: ~0,45 euro per audio-uur voor niet-Engels (inclusief Frans, Duits, Nederlands)
- Latency voor partiële transcripts: 200 tot 400ms typisch, kan dalen naar 150ms met low-latency mode
- Final transcript latency: 400 tot 700ms na sprekerstop

AssemblyAI is momenteel best-in-class voor accuratesse in 2026, vooral op multilingual of accented Engels. Deepgram is sneller maar iets minder accuraat. OpenAI Whisper als service is goedkoper maar langzamer.

Opvallend: AssemblyAI's Nederlandse transcriptie is redelijk maar niet geweldig. Als je product Nederlands als eerste-klas taal nodig heeft, test tegen je daadwerkelijke audiokwaliteit voordat je je vastlegt.

### LLM: OpenAI Realtime vs gpt-4o + Cartesia

Dit is de grote architecturale keuze. Twee paden:

**Pad A: OpenAI Realtime API (gebundeld)**

- Kosten: ~0,06 euro per audio-minuut input + ~0,24 euro per audio-minuut output
- Gecombineerd voor een 5-minuten conversatie met gebalanceerde user/AI spreektijd: ~0,75 euro
- Latency: 250 tot 600ms van user-stop tot eerste audioframe
- Stemmen: 6 tot 10 OpenAI-stemmen, Engels-sterk, multilingual redelijk

**Pad B: AssemblyAI STT + gpt-4o + Cartesia TTS (apart)**

- AssemblyAI: ~0,37 euro per audio-uur input = ~0,015 euro voor 5-min conversatie (vooral user-audio)
- gpt-4o calls: hangt af van conversatielengte, typisch 8 tot 20 LLM-calls per 5-min conversatie, ~0,05 tot 0,15 euro totaal
- Cartesia: ~0,04 euro per minuut gegenereerde audio = ~0,10 euro voor 5-min conversatie (vooral AI-audio)
- Gecombineerd: **~0,20 euro per 5-min conversatie**
- Latency: 500 tot 900ms van user-stop tot eerste audioframe

Het gebundelde OpenAI Realtime-pad is ~4x duurder maar ~2x lagere latency. De moeite waard voor use cases waar conversationele responsiviteit toedoet (consumer-facing, demo-heavy). Niet de moeite waard voor use cases waar 800ms prima is (B2B back-office automatisering, voice-menu's).

### TTS: Cartesia

- Kosten: ~0,04 euro per minuut gegenereerde audio
- Latency: 80 tot 150ms tot eerste audio-byte
- Stemmen: 100+ in Engels, ~30 in grote Europese talen, Nederlandse dekking beperkt
- Streaming: ja, audio speelt af terwijl het genereert

Cartesia is de beste TTS in 2026 voor productie voice agents. ElevenLabs heeft marginaal betere stemkwaliteit maar ~2x de kosten en langzamere latency. OpenAI TTS is goedkoper maar heeft duidelijkere AI-stem signalen.

Voor Nederlands specifiek: Cartesia's Nederlandse stemmen zijn beperkt. Als je natuurlijke Nederlandse TTS nodig hebt, evalueer Acapela of lokale aanbieders als aanvullingen. Er is nog geen schone winnaar voor productie-grade Nederlandse TTS.

## End-to-end latency budget

Voor een B2B voice agent die niet laggy aanvoelt, wil je sub-1-seconde totaal turn-around (gebruiker stopt met praten → AI begint met praten). Hier is hoe het budget uitbreekt op het aparte-componenten pad:

| Component | Latency (typisch) | Budget |
|---|---|---|
| STT partieel transcript | 200-400ms | 300ms |
| LLM first-token tijd | 200-500ms | 350ms |
| TTS first byte | 80-150ms | 100ms |
| Audio-playback start | 30-80ms | 50ms |
| Netwerk round trips | 50-150ms | 100ms |
| **Totaal budget** | | **~900ms** |

Dat is het budget voor "voelt goed". Een budget van 600-700ms voelt uitstekend. Boven 1,2 seconde voelt kapot.

Ter vergelijking, OpenAI Realtime brengt je naar 250-600ms totaal, wat onder de perceptiedrempel voor de meeste gebruikers ligt.

## De tradeoffs die je pas ziet na lanceren

Dingen die ik op de moeilijke manier geleerd heb:

### 1. Multilingual gebruikers breken dingen

Een gebruiker begint in Engels, schakelt midden in een zin over naar Nederlands, dan terug. Je STT stond op Engels. Het Nederlands klinkt als verwarde ruis. Je LLM reageert op verwarde ruis. De gebruiker geeft op.

Fix: code-switch detectie op de STT-laag. AssemblyAI en Deepgram ondersteunen dit nu allebei maar je moet het expliciet inschakelen. Default config is enkele taal.

### 2. Achtergrondgeluid vernietigt transcriptie-accuratesse

Een echte klantomgeving heeft toetsenborden, HVAC, zijgesprekken, honden. Je demo-omgeving niet. Productie-transcriptie-accuratesse is 10-20 procentpunt lager dan je laptop-demo.

Fix: LiveKit levert background voice cancellation. Gebruik het. Ook: vertel gebruikers om koptelefoons of push-to-talk te gebruiken als accuratesse er echt toedoet.

### 3. Lange pauzes verwarren turn detection

Een gebruiker denkt twee seconden na voordat hij verdergaat. De AI denkt dat de gebruiker klaar is, springt erin, praat erover heen. De gebruiker raakt geïrriteerd.

Fix: tune de silence-drempel van het turn-detection model. LiveKit's turn detector is context-bewust (hij weet of een zin grammaticaal compleet is) en is veel beter dan een simpele silence-gebaseerde VAD. Gebruik het.

### 4. Latency-variantie is erger dan gemiddelde latency

Als je latency meestal 600ms is maar incidenteel piekt naar 3 seconden, herinneren gebruikers de pieken. Ze vormen hun mening over het systeem op basis van de slechtste ervaring, niet de mediaan.

Fix: monitor p95 en p99 latency, niet gemiddelde. Zet alerts op p99. De fixes gaan meestal over queue-management op een van de lagen, vaak de LLM-call.

### 5. Voice-kosten stapelen sneller op dan chat-kosten

Voice is ~3 tot 10x duurder per equivalente interactie dan chat. Een 5-minuten voice-conversatie kost 0,20 tot 0,75 euro afhankelijk van de stack. Een 5-minuten chat-equivalent (misschien 30 berichten) kost 0,01 tot 0,05 euro.

De implicatie: voice AI werkt voor high-value B2B use cases (sales calls, customer support escalaties, recruitment-interviews). Het is moeilijker te rechtvaardigen voor high-volume low-value flows (FAQ-vervanging, status-updates). Kies voice voor use cases waar de conversationele dynamiek daadwerkelijk toedoet, niet alleen omdat voice cool klinkt.

## Mijn aanbeveling voor B2B voice in 2026

Voor een B2B voice agent die professioneel moet aanvoelen, hier is de stack die ik vandaag zou bouwen:

- **Orchestratie**: LiveKit Cloud (of self-hosted als je GPU-ops capaciteit hebt)
- **STT**: AssemblyAI met code-switch ingeschakeld, low-latency mode
- **LLM**: gpt-4o-mini met function calling, terugvallen op gpt-4o voor complexe turns. Sla OpenAI Realtime over tenzij latency kritisch is.
- **TTS**: Cartesia voor Engels-primair, evalueer per taal voor andere
- **VAD / turn detection**: LiveKit's ingebouwde turn detector
- **Achtergrondgeluid**: LiveKit's noise cancellation ingeschakeld

Totale kosten: ruwweg 0,20 tot 0,30 euro per 5-min conversatie. Totale latency: 700-900ms end-to-end. Multilingual: werkbaar voor Engels/Frans/Duits/Spaans, beperkt voor Nederlands.

Als je een voice AI-build evalueert en een geschreven analyse wilt van welke stack bij jouw specifieke latency-, kosten- en taaleisen past, dat is het soort werk dat ik doe in een [POC sprint](/services). De output is een werkend prototype op jouw stack van keuze plus een benchmark tegen alternatieven.

Verwante leesstof: [wat een productie-LLM-feature in 2026 echt kost](/blog/cost-of-production-llm-2026) dekt het volledige kostenplaatje voor de LLM-kant van elke voice-integratie.
