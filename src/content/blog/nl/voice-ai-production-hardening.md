---
title: "Voice AI productie: 5 fouten die je demo laten crashen"
description: "Hoe voice AI productie misgaat bij echte bellers: endpointing, barge-in, monitoring en kostencontrole die vóór go-live geregeld moeten zijn."
published: "2026-10-04"
tags: ["voice AI", "productie", "latency", "LLM", "spraaktechnologie"]
ogImage: "/images/blog/voice-ai-production-hardening/cover.jpg"
primaryService: "hardening"
---
Een menselijk gesprek loopt op een gat van ongeveer 200 milliseconden tussen de ene spreker die stopt en de volgende die begint. Dat cijfer komt uit gespreksanalyse-onderzoek, houdt over talen heen stand, en is de reden dat de industrie 800 ms (einde spraak van de beller tot de eerste audio terug) als norm voor **voice AI productie** heeft gekozen. Het is een verstandig doel. Het is ook, in de meeste incidenten waar ik bij word gehaald, niet het getal dat daadwerkelijk stuk was.

Het getal dat niemand meet is hoe lang het systeem wacht voordat het besluit dat de beller klaar is met praten. Die endpointing-vertraging zit binnen dat 800 ms-budget, wordt doorgaans één keer geconfigureerd en daarna vergeten, en als hij verkeerd staat is elke andere optimalisatie cosmetica. Een stiltedrempel van 700 ms betekent dat een beller die even pauzeert om een referentienummer van zijn scherm te lezen, door de agent wordt onderbroken. Een drempel van 1,5 seconde betekent dat elke beurt traag aanvoelt, terwijl je dashboard netjes 320 ms time-to-first-token laat zien.

Hieronder staan de fouten die ik blijf vinden wanneer een voice-demo die in testgesprekken prachtig werkte, echte bellers tegenkomt. Elke fout heeft een fix die dagen kost, geen maanden, en allemaal zijn ze goedkoper vóór go-live dan na een eerste week opnames waar niemand naar wil luisteren.

## Fout 1: voice AI productie behandelen als tekst-LLM hardening met speakers eraan

De meeste voice-hardeningchecklists die ik zie zijn een tekst-LLM-checklist met "voice" in de titel. Promptversiebeheer, evalsuite, tokenbudgetten, retries, observability. Allemaal nodig. Niets ervan raakt de onderdelen die daadwerkelijk breken.

Een tekstgebruiker typt, drukt op enter en wacht. Die ene handeling geeft je gratis een schone beurtgrens, en vrijwel elke aanname in een LLM-stack leunt daarop. Voice geeft je daar niets van. Je krijgt een continue audiostroom zonder entertoets, en je systeem moet een paar keer per seconde gokken of de mens klaar is. Daarna moet het de gevallen opvangen waarin het verkeerd gokte: de beller begint te praten terwijl de audio nog loopt, een hond blaft en triggert de voice activity detection, de beller zegt 1,2 seconde lang "eeh", de SIP-trunk laat 4% van de pakketten vallen en het transcript komt terug als een halve zin.

De stukken die ik eerder schreef over [de echte latency-bottleneck vinden in een LLM-feature](/blog/llm-latency-audit-production) en over [monitoring die stille degradatie opvangt](/blog/llm-observability-production-monitoring) gelden hier dus nog. Ze zijn noodzakelijk en ze zijn niet voldoende. Voice voegt een audiopijplijn toe met eigen faalmodi, een eigen klok, en een kostenmodel dat op wandklok-seconden draait in plaats van tokens. Harden je alleen de LLM-laag, dan lever je iets op dat uitstekende antwoorden op het verkeerde moment produceert.

De fix is de audiopijplijn behandelen als een volwaardig component, met eigen tests, eigen metrics en een eigenaar. Draai je LiveKit Agents met een realtime model, dan betekent dat concreet: iemand in het team kan vertellen op welke waarde de VAD-drempel staat, waarom, en wat er gebeurt op een slechte lijn. Kan niemand dat, dan heb je nog geen voice-systeem. Dan heb je een LLM met een microfoon eraan.

## Fout 2: geen echte barge-in handling, dus bellers worden overstemd

Dit is de meest voorkomende fout en tegelijk de snelst te diagnosticeren. Bel je eigen agent, laat hem aan een lang antwoord beginnen en onderbreek hem midden in de zin zoals een ongeduldig mens dat doet. Er kunnen drie dingen gebeuren.

![Voice AI productie: 5 fouten die je demo laten crashen](/images/blog/voice-ai-production-hardening/1.jpg)

De agent praat over je heen tot zijn zin af is. De agent stopt, maar jouw onderbreking is nooit getranscribeerd, dus hij beantwoordt de vorige vraag opnieuw. Of: de agent stopt, hoort je, maar de context van het model bevat nog de volledige tekst van het antwoord dat hij aan het uitspreken was, inclusief de twee zinnen die de beller nooit heeft gehoord.

Dat derde geval is het geval dat teams missen, en het vergiftigt de rest van het gesprek. Het model gelooft dat het de openingstijden heeft doorgegeven. De beller gelooft dat er niets is gezegd. Elke volgende beurt wordt gebouwd op een transcript dat niet overeenkomt met wat er op de lijn gebeurde.

Goede barge-in handling bestaat uit vier delen, en halve implementaties zijn de regel:

- **Detecteren** van spraak terwijl de TTS speelt, met een drempel die zo is afgesteld dat ademhaling en achtergrondgesprekken hem niet triggeren.
- **Stoppen** van de weergave, inclusief het leegmaken van wat al gebufferd staat in de client of de SIP-leg. De generator stoppen zonder de jitterbuffer te flushen levert je niets op.
- **Afkappen** van de gespreksgeschiedenis tot wat daadwerkelijk is uitgesproken. De Realtime API van OpenAI biedt dit via item truncation met een audio-end offset: gebruik het. Draai je een cascaded pijplijn met losse STT, LLM en TTS, dan moet je de weergavepositie zelf bijhouden en het assistantbericht daar afkappen.
- **Opnieuw klaarzetten**, zodat de agent niet onmiddellijk door de nieuwe zin van de beller heen gaat praten.

Test het daarna met vijandige input. Een beller op speakerphone in een loods. Een beller die "ja" en "mhm" zegt terwijl de agent praat, wat géén onderbreking mag zijn. Een beller die een vraag begint, stopt en opnieuw begint. Die drie gedragingen verklaren in mijn ervaring het grootste deel van de feedback in de categorie "de bot doet het niet" die binnenkomt zonder reproduceerbaar voorbeeld.

## Fout 3: transcripten monitoren in plaats van de audiopijplijn

Als een voicegesprek misgaat, is het transcript de laatste plek waar het bewijs nog ligt. Het toont de output van een pijplijn waarvan de fouten stroomopwaarts gebeurden. Heeft de STT het eerste woord laten vallen, dan ziet het transcript uit als een ietwat rare maar plausibele zin, en je LLM-eval beoordeelt hem als prima.

Voice AI monitoring vraagt metrics die de tekstwereld niet heeft. Dit is de set die ik vóór go-live instrumenteer:

- **Time to first audio byte**, gemeten vanaf het einde van de spraak van de beller, op p50 en p95. Niet time to first token. De beller hoort audio, geen tokens.
- **Endpointing-vertraging** als eigen tijdreeks, los van modellatency, zodat je ziet wanneer die het budget opeet.
- **Onderbrekingsratio en -uitkomst**: hoe vaak bellers erdoorheen praten, en hoe vaak het systeem dat netjes afhandelde.
- **Stiltegebeurtenissen**: gaten van meer dan twee seconden waarin geen van beide partijen sprak. Daar haken bellers af.
- **Verdeling van STT-confidence** per gesprek, plus word error-indicatoren waar je ground truth hebt. Een plotselinge verschuiving betekent meestal een wijziging in codec of trunk, niet in het model.
- **Packet loss en jitter** op de media-leg, getagd per carrier. Telefonie-audio op 8 kHz µ-law is een andere inputverdeling dan de 24 kHz WebRTC-audio waarmee je hebt getest, en modellen degraderen er anders op.
- **Positie van het ophangen**: waar in de flow mensen weglopen. Clusters zeggen je meer dan welke evalscore ook.

En luister dan naar gesprekken. Niet naar transcripten, naar audio. Twintig volledige opnames in je eerste productieweek, geselecteerd uit de staart van de latencyverdeling in plaats van willekeurig. Ik heb deze oefening nog nooit gedaan zonder iets te vinden dat geen enkel dashboard liet zien, meestal een TTS die een productnaam verkeerd uitspreekt of drie seconden dode lucht tijdens een tool call.

## Fout 4: één latencygetal in plaats van een budget per stap

"Onze voice AI latency zit rond de 900 ms" is geen engineering-uitspraak. Het is een gemiddelde over een pijplijn met vijf of zes seriële stappen waarvan elke stap het probleem kan zijn, en gemiddelden verbergen precies de gesprekken waardoor mensen ophangen.

Schrijf het budget per stap op en hou elke stap aan een p95. Een cascaded stack ziet er ruwweg zo uit:
beller stopt met praten
  ├─ endpointing-besluit       ~250-500 ms   (instelbaar, vaak de grootste hap)
  ├─ definitief STT-transcript  ~50-150 ms   (streaming; grotendeels al klaar)
  ├─ LLM time to first token   ~200-400 ms   (model + promptgrootte)
  ├─ TTS tot eerste audio       ~80-200 ms   (alleen bij streaming TTS)
  └─ netwerk + jitterbuffer     ~50-150 ms   (carrier-afhankelijk)
                               ----------
                        doel     < 800 ms    p95, niet het gemiddelde

Die ranges zijn waar ik mee plan, geen benchmark: meet je eigen cijfers. Het nut van zo'n budget is dat het je vertelt waar je een week aan moet besteden. Staat endpointing op 500 ms en TTF-token op 250 ms, dan is het model tunen het verkeerde project. Zit er een tool call midden in een beurt, dan heeft die stap een eigen budget nodig en vrijwel zeker een filler-zin, want 1,8 seconde stilte terwijl je een CRM bevraagt leest voor een mens als een weggevallen verbinding.

Speech-to-speech modellen klappen een paar van deze stappen in elkaar, en dat is precies waarom ze sneller voelen. Ze geven je ook minder zicht op welk deel traag is en minder controle per onderdeel. De praktische afwegingen tussen LiveKit, OpenAI Realtime, AssemblyAI en Cartesia heb ik met cost- en latencycijfers naast elkaar gezet in [de voice AI stackbenchmark](/blog/voice-ai-b2b-livekit-openai-realtime-benchmarks). Dat is het stuk als je nog aan het kiezen bent. Dit stuk gaat ervan uit dat je gekozen hebt en nu bellers moet overleven.

## Fout 5: gespreksduur je kosten laten bepalen in plaats van die te cappen

Kostenbeheersing op tokens is hier niet overdraagbaar. Realtime audiomodellen rekenen per minuut audio in en uit, dus je kosteneenheid is wandkloktijd, en wandkloktijd wordt bepaald door de beller, niet door jou. Een beller die negen minuten uitweidt kost drie keer zoveel als iemand die in drie minuten een antwoord krijgt, voor dezelfde zakelijke uitkomst. Niets in je promptbudget ziet dat.

De faalmodus die echt pijn doet is het vastgelopen gesprek. Een agent die loopt, een beller die de telefoon neerlegt zonder op te hangen, een wachtmuziekstroom die de sessie openhoudt. Ik heb één sessie veertig minuten zien doorlopen omdat niets in de stack een mening had over maximale gesprekslengte. Voice AI cost control begint met die mening:

- **Harde sessielimiet** (ik begin meestal op 10 minuten) met een nette afsluiting en een overdracht, server-side afgedwongen, niet in de prompt.
- **Stilte-timeout**: geen spraak van de beller gedurende 20 tot 30 seconden? Eén keer checken, dan het gesprek beëindigen.
- **Loopdetectie** op herhaalde assistant-beurten. Drie bijna identieke antwoorden betekent escaleren, niet doorgaan.
- **Kosten per afgerond gesprek** als hoofdmetric, met p95 naast het gemiddelde, uitgesplitst naar gespreksuitkomst. Gemiddelde kosten per gesprek is het getal waarachter een long-tail probleem een maand lang kan schuilen.
- **Een dagelijks spendplafond** op het realtime-account, want een verkeerd gerouteerde campagne of een bug in de dialer is een reële manier om in één nacht een budget kwijt te raken.

Lange gesprekken drukken trouwens niet alleen de marge, ze drukken ook de kwaliteit. De context groeit, de latency kruipt omhoog, en modellen worden merkbaar slechter in het bijhouden van wat al gezegd is rond de twintigste beurt. Duur cappen is dus net zo goed kwaliteitscontrole als kostenbeheersing.

## Wat "hardened" concreet betekent voordat je echt verkeer aanneemt

De checklist die ik groen wil hebben voordat een voice-agent een echt klantnummer opneemt:

1. Barge-in getest met vijandige input, inclusief het afkappen van de historie tot de daadwerkelijk uitgesproken audio.
2. Latencybudget per stap opgeschreven, geïnstrumenteerd en aangehouden op p95.
3. Audiopijplijn-metrics die naar dezelfde plek gaan als je LLM-metrics, met alerts op stiltegebeurtenissen en dalende STT-confidence.
4. Sessieduurlimiet, stilte-timeout en loopdetectie afgedwongen in code.
5. Kosten per afgerond gesprek, gevolgd per uitkomst, met een dagplafond.
6. Een getest terugvalpad naar een mens of een callback zodra één van bovenstaande afgaat.
7. Een evalset van échte gespreksaudio, geen tekstuele transcripten, die draait bij elke prompt- of modelwijziging. De [continuous eval loop](/blog/llm-evaluation-production-continuous-eval) weegt hier zwaarder dan bij tekst, omdat voice-regressies onzichtbaar blijven tot iemand luistert.

Bij de meeste teams die ik zie ontbreken punt 1 en 7 volledig en is punt 3 halfbakken. Die gaten dichten is drie tot zes weken werk, en dat is precies de vorm van een [Production Hardening](/services)-traject: barge-in en endpointing afstemmen, het latencybudget per stap, monitoring op de audiopijplijn, duur- en kostencontroles, en een gehardende deployment die je aan je eigen team kunt overdragen. Staat jouw voice-demo op het punt echte bellers te ontmoeten en wil je dat iemand die dit eerder heeft gedaan die ronde met je doet? [Neem contact op](/contact), dan kijken we eerst samen naar je gespreksopnames.
