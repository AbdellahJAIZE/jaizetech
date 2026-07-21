---
title: "On-prem LLM-hosting in Nederland: wanneer, waarom en wat het in 2026 daadwerkelijk kost"
description: "Privacy, AVG, EU AI Act en kosten. Wanneer on-prem LLM-hosting zinvol is voor Nederlandse bedrijven, en de echte cijfers achter een vLLM- of Ollama-deployment vergeleken met AWS Bedrock of OpenAI."
published: "2026-04-26"
tags: ["LLM-infrastructuur", "on-prem AI", "AVG", "AI Act", "Nederland"]
ogImage: "/og-image.png"
primaryService: "infrastructure"
---

Elk Nederlands bedrijf dat ik de afgelopen zes maanden geadviseerd heb, heeft een variant van dezelfde vraag gesteld. Kunnen we deze LLM zelf hosten? Ze vragen het niet uit nieuwsgierigheid. Ze vragen het omdat hun juridische team AVG-zorgen heeft aangekaart, of hun klantdata gevoelig is, of de AI Act ze nerveus maakt over US-vendors.

Het eerlijke antwoord is ja, dat kan. Het moeilijkere antwoord is of het moet. Deze post is het framework dat ik gebruik om Nederlandse teams te helpen beslissen, met het daadwerkelijke kostenrekenwerk voor een paar veelvoorkomende deployment-vormen.

## De vier redenen waarom Nederlandse bedrijven daadwerkelijk on-prem willen

Er zijn goede en slechte redenen om on-prem te gaan met je LLM. Ze eerlijk uit elkaar halen bespaart veel geld.

### 1. Klantdata mag het gebouw niet verlaten

Zorg, financiële dienstverlening, juridisch en overheid-IT hebben legitieme redenen om data binnen hun infrastructuur te houden. Patiëntendossiers, banktransacties of cliëntdocumenten naar de US-datacenters van OpenAI sturen is niet altijd een werkbaar antwoord voor je CISO. Zelfs met EU-data-residency creëert de US Cloud Act blootstelling die sommige Nederlandse afnemers niet accepteren.

Dit is de sterkste reden voor on-prem. Het is ook de reden die de kost het schoonst rechtvaardigt.

### 2. AI Act compliance is makkelijker als je de stack controleert

De EU AI Act trad in golven in werking van 2024 tot 2026. Voor high-risk AI-toepassingen (HR-beslissingen, medisch, kredietscoring, enz.) heb je transparantie, documentatie en de mogelijkheid nodig om te auditeren wat het model daadwerkelijk gedaan heeft. Met een third-party model ben je deels afhankelijk van de documentatie van de vendor. Met een on-prem deployment controleer je de model card, de inference-logs, de evaluatie-artefacten en de versiehistorie end-to-end.

Goed te weten: de AI Act vereist niet dat je zelf host. Maar zelf hosten maakt sommig compliance-werk merkbaar makkelijker.

### 3. Voorspelbare kost op schaal

Per-token vendorprijzen zijn geweldig totdat je verkeer echt groot is. Als je 50 miljoen tokens per dag of meer verwerkt, begint de rekenkunde GPU-capaciteit kopen te verkiezen boven per-call huren.

Het break-even punt varieert per use case, maar als ruwe heuristiek: onder 5 miljoen tokens per dag winnen vendor-API's. Tussen 5 en 50 miljoen is het dichtbij. Boven 50 miljoen is on-prem meestal goedkoper als je de GPU's op hoge bezetting kunt draaien.

De meeste Nederlandse teams waar ik mee praat zitten nergens in de buurt van 5 miljoen tokens per dag. Ze noemen kosten als reden voor on-prem terwijl het eigenlijk privacy is.

### 4. Angst voor vendor lock-in

Deze is meer emotioneel dan rationeel. De hyperscalers en frontier model providers oefenen wel lock-in druk uit (proprietary fine-tuning, ecosysteemintegraties, prijsmacht). On-prem vermindert dat. Open-weights modellen zoals Llama, Mistral, Qwen en DeepSeek geven je echte portabiliteit.

Of dit ertoe doet hangt af van je tijdshorizon. Voor een vijfjaars strategische bet is vendorportabiliteit een echte zorg. Voor een MVP van zes maanden is het theater.

## Wat "on-prem" in 2026 daadwerkelijk betekent

De term doet veel werk. Vier smaken on-prem met heel verschillende kostprofielen.

### Smaak A: Self-hosted op je eigen datacenter-GPU

De klassieke on-prem. Koop GPU's, rack ze, draai ze. NVIDIA H100s, A100s, L40S, of de nieuwere kaarten.

- Capex: 25.000 tot 50.000 euro per H100, 8.000 tot 12.000 euro per L40S
- Opex: stroom, koeling, datacenter-ruimte, ops-team
- Realistisch voor teams met bestaande on-prem infrastructuur. Pijnlijk voor teams die een decennium cloud-native zijn geweest.

### Smaak B: GPU-huur in een colocation of soevereine cloud

NL-gebaseerde aanbieders (Leaseweb, NorthC, Greenhouse Datacenters) en EU-gebaseerde soevereine clouds (OVHcloud, Scaleway, Hetzner).

- Kosten: 1,5 tot 4 euro per H100-uur, 0,4 tot 1,2 euro per L40S-uur
- Je beheert nog steeds de softwarestack
- Sneller te starten dan hardware kopen. Langzamer dan cloud-API's. De middenweg.

### Smaak C: Hyperscaler met EU-data-residency

AWS Bedrock met EU-regio, Azure OpenAI Service met EU-regio, Google Vertex AI met EU-regio.

- Kosten: 0,5 tot 2 euro per miljoen tokens voor mid-tier modellen
- Data blijft in EU maar de onderliggende service wordt geopereerd door een US-bedrijf
- Makkelijker te verkopen aan engineering dan self-hosted. Moeilijker te verkopen aan legal dan echte on-prem.

### Smaak D: Open-weights model op managed inference

Together AI, Anyscale, Fireworks, Replicate. Open-weights modellen geserveerd door een third party.

- Kosten: 0,1 tot 0,7 euro per miljoen tokens voor mid-tier open modellen
- US-geopereerd default, sommige hebben EU-opties die online komen
- Goedkoop en snel maar niet echt "on-prem". Vaak verward met on-prem in gesprekken.

## Echte kostenrekenkunde voor drie deployment-vormen

Om dit concreet te maken, hier wat elk eruitziet voor een mid-tier Nederlands SaaS-bedrijf op gematigde schaal (10 miljoen tokens per dag, 300 miljoen per maand).

### Vendor-API (OpenAI gpt-4o-mini equivalent)

- 300 miljoen tokens tegen 0,15 euro per miljoen = 45 euro per maand
- Plus operationele overhead (monitoring, retries, eval runs), reken op 200 euro
- **Totaal: ~245 euro per maand**

Bijna niets op deze schaal. Dit is waarom de meeste teams vendor-API's gebruiken.

### Hyperscaler met EU-residency (AWS Bedrock met Llama 3.1 70B equivalent)

- 300 miljoen tokens tegen 0,8 euro per miljoen = 240 euro per maand
- Plus operationele overhead, reken op 300 euro
- **Totaal: ~540 euro per maand**

Duurder dan de vendor-route, maar data blijft in EU.

### Self-hosted vLLM op gehuurde L40S-GPU's (open-weights Llama 3.1 8B of 70B)

- 2 L40S-GPU's tegen 0,8 euro per uur, 24/7, draaiend op 60 procent bezetting = 1.150 euro per maand
- Plus engineering ops (deployment, monitoring, modelupdates), reken op 1.000 euro per maand
- **Totaal: ~2.150 euro per maand**

Veel duurder op deze schaal. De rekenkunde begint pas te verkiezen boven ~50 miljoen tokens per dag, waar de marginale kost per token op eigen capaciteit nul nadert.

### Self-hosted op eigen H100s (high-volume scenario, 100 miljoen tokens per dag)

- 4 H100s gekocht tegen 35.000 euro elk = 140.000 euro capex, geamortiseerd over 36 maanden = ~3.900 euro per maand
- Stroom, koeling, colocation = ~600 euro per maand
- Engineering ops = ~1.500 euro per maand
- **Totaal: ~6.000 euro per maand voor 3 miljard tokens per maand**

Dat is 2 euro per miljoen tokens, wat de meeste vendor-API's verslaat voor mid-tier modellen. Maar je krijgt dit break-even alleen op aanhoudend hoge bezetting. Als je verkeer bursty is, gaat je effectieve kost per token omhoog omdat GPU's idle staan.

## Wanneer on-prem daadwerkelijk zinvol is

Op basis van de rekenkunde en de echte redenen:

| Situatie | Aanbevolen pad |
|---|---|
| Je verwerkt gevoelige data (zorg, juridisch, financiën, overheid) en hebt strikte residency nodig | Self-hosted (gehuurd of bezeten) op EU-infrastructuur |
| Je bent AI-Act-high-risk en hebt volledige audit trail-controle nodig | Self-hosted, met geversioneerde modelartefacten en inference-logs |
| Je verwerkt >50M tokens per dag aanhoudend | Self-hosted op eigen hardware, mogelijk hybride met vendor-API voor burst |
| Je verwerkt <5M tokens per dag en hebt geen strikte residency-eis | Blijf op vendor-API's |
| Je wilt minder vendor lock-in maar kosten doen ertoe | Open-weights model op EU-gebaseerde managed inference (Smaak D met EU-optie) |

Het verkeerde antwoord is "on-prem omdat we serieus willen lijken over privacy". Dat signaleert aan een afnemer of auditor dat je security-theater doet, geen echte privacy-engineering. Als je on-prem gaat, doe het om een echte reden en documenteer het dreigingsmodel dat het rechtvaardigt.

## Wat het operationeel vergt

Self-hosted LLM in 2026 is significant makkelijker dan twee jaar geleden, maar het is nog steeds geen druk-op-de-knop. Je hebt nodig:

- vLLM, TGI of Ollama als serveerlaag
- Een modelregister (MLflow, custom, of gewoon een gedeelde object store)
- Monitoring stack (Prometheus + Grafana, of commercieel)
- Een eval-pipeline die je op je serveerstack kunt draaien net als op die van een vendor
- Een deployment-proces voor modelupdates (open-weights modellen updaten ook)
- Iemand die GPU-ops kent en CUDA OOM-fouten om 2 uur 's nachts kan debuggen

De meeste Nederlandse teams die ik hierin geadviseerd heb vinden dat de ops-kant de kostendrijver is, niet de GPU-huur of hardware. Reken op minimaal 0,5 tot 1 FTE aan engineering voor het eerste jaar van elke serieuze on-prem deployment.

## Mijn aanbeveling voor de meeste Nederlandse teams in 2026

Tenzij je een harde residency-eis hebt of je serieus volume verwerkt, **blijf voorlopig op vendor-API's met EU-data-residency**. Het kostenverschil is klein op typische schaal, de operationele last is veel lager en het vendor-ecosysteem beweegt sneller dan je team kan.

Als je een van deze lijnen overschrijdt, herzie:
- Aanhoudend verkeer boven 50M tokens per dag
- Een specifieke compliance- of contractuele eis die on-prem voorschrijft
- Een echte vendor-portabiliteit zorg over een 3-plus jaar horizon

Als je een geschreven analyse wilt van welk pad bij jouw specifieke use case past, dat is het soort werk dat ik doe in een [AI-infrastructuur-audit](/services). De output is een aanbeveling met het kostenrekenwerk getoond voor jouw verkeersprofiel en dreigingsmodel, zodat je de beslissing tegelijk kunt verdedigen tegenover je CFO en je CISO.

Verwante leesstof: [wat een productie-LLM-feature in 2026 echt kost](/blog/cost-of-production-llm-2026) dekt het volledige kostenplaatje voorbij alleen hosting. [EU AI Act checklist voor Nederlandse softwareteams](/blog/eu-ai-act-checklist-dutch-software-teams) dekt de compliance-kant.
