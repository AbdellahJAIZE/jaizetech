---
title: "Waarom je AI-feature uitrolplan belangrijker is dan de launch"
description: "Een AI-feature uitrolplan voorkomt stille storingen: kies de uitrolvorm, bouw poorten per stap, en zorg dat uitzetten binnen zestig seconden werkt."
published: "2026-10-19"
tags: ["AI-uitrol", "feature flags", "staged rollout", "AI in productie", "LLM observability"]
ogImage: "/images/blog/ai-feature-rollout-plan/cover.jpg"
primaryService: "ai-features"
---
Week elf van een build is meestal de rustigste week. De feature werkt end to end, de evals zijn groen, het opleverdocument heeft een inhoudsopgave, en het enige openstaande punt op het bord is een datum. Dan vraagt iemand "dus donderdag zetten we hem aan?" en niemand spreekt dat tegen, want op dat punt in een project wil niemand nog werk toevoegen. Dat is het moment waarop een AI-feature uitrolplan er wel of niet is, en het verschil zie je twee weken later in een kostenrapport of een supportwachtrij.

De asymmetrie maakt dit erger voor AI-features dan voor gewone features. Een kapotte afrekenknop op 100% van het verkeer is luid: errors schieten omhoog, iemand wordt gepaged, je rolt in zes minuten terug en schrijft een excuusmail. Een retrievalpad dat stil niets teruggeeft voor tenants met meer dan vijftigduizend documenten levert een 200-response op, een plausibel klinkend antwoord zonder grounding, en geen enkele alert. Gebruikers lezen het, sommigen handelen ernaar, en het eerste signaal dat jouw team bereikt is een vage klacht die bij een supportmedewerker belandt onder "algemene feedback".

De go-live moet dus gebouwd worden, net zoals de retrievallaag gebouwd is. Hieronder staat de sequentie die ik in de laatste twee weken van een build gebruik: kies de vorm, laat de flag meer besturen dan zichtbaarheid, definieer de poorten vóór elk percentage, zorg dat "uit" snel iets betekent, en kijk daarna naar de handvol signalen die je uptime-dashboard nooit naar boven brengt.

## Kies de vorm van de uitrol voordat je flagcode schrijft

Er zijn drie vormen die het overwegen waard zijn, en de keuze hangt af van waar je onzeker over bent. Teams slaan deze stap over en vallen terug op een percentage-ramp, wat misschien in de helft van de gevallen het juiste antwoord is.

Een **percentage-ramp** past als je vooral over volume inzit: kosten per request, rate limits, latency onder concurrency, queue depth. Het geeft je een knop die je terug kunt draaien. Het past slecht als je verkeer heterogeen is, want 5% willekeurige gebruikers kan prima elke edge case missen die telt.

Een **cohort-uitrol** past als het risico in de data zit en niet in de load. Als je assistent klantdocumenten leest, is het ding dat hem breekt één tenant met een gescand contract van 400 pagina's in het Nederlands, niet duizend tenants met schone PDF's. Kies cohorten bewust: twee interne teams, dan drie meewerkende accounts die je werkelijke dataverdeling dekken, dan de staart. Ik heb een build een ramp van 10% schoon zien doorkomen en vervolgens op dag één van 25% zien omvallen, omdat de eerste grote enterprise-tenant in die bucket viel.

**Shadow traffic** gaat vooraan als de output consequenties heeft en je iets hebt om tegen af te zetten. Je draait het nieuwe pad op echte requests, logt het resultaat en laat de gebruiker niets zien. Het kost echt geld in tokens en het koopt je een gescoorde steekproef voordat één gebruiker eraan blootstaat. Dat is dezelfde redenering als achter een [afgetopte canary bij een modelmigratie](/blog/llm-model-migration-canary-test), nu toegepast op een feature die nog helemaal geen productiegeschiedenis heeft.

De meeste echte launches combineren ze: drie dagen shadow, dan een intern cohort, dan een percentage-ramp binnen de overige accounts. Schrijf die sequentie met datums op voordat iemand het flagframework aanraakt, want de vorm bepaalt wat de flag moet kunnen uitdrukken.

## Wat een AI-feature uitrolplan moet besturen behalve aan en uit

De standaard opzet voor een feature flag AI launch is een boolean die bepaalt of een gebruiker een knop ziet. Dat is niet genoeg, want als er halverwege de uitrol iets misgaat, is de vraag bijna nooit "moet deze gebruiker de feature zien". De vraag is "kan ik dit goedkoper, langzamer, voorzichtiger of smaller maken zonder het helemaal uit te zetten".

![Waarom je AI-feature uitrolplan belangrijker is dan de launch](/images/blog/ai-feature-rollout-plan/1.jpg)

Een flag die alleen een boolean is geeft je twee toestanden: kapot en afwezig. Wat je wil is een configobject dat de uitrol tijdens runtime kan hervormen zonder deploy. In de praktijk komt dat hier dichtbij:

yaml
ai_assistant:
  enabled_for: { internal: true, cohort: ["acct_18", "acct_44"], percent: 10 }
  model: "primary"              # primary | fallback | off
  max_tokens_out: 800
  retrieval:
    top_k: 8
    require_citations: true     # blokkeer antwoorden zonder opgehaalde chunks
  tools_enabled: ["search", "summarize"]   # schrijfacties uitgesloten bij launch
  max_tool_calls: 6
  daily_cost_ceiling_eur: 400
  fallback_on_failure: "deterministic_template"

Elke regel daar is een knop die ik tijdens een staged rollout AI feature daadwerkelijk nodig heb gehad. Tokenplafonds begrenzen de kosten van gebruikers die hele documenten in het invoerveld plakken. `require_citations` verandert een hallucinatierisico in een zichtbare lege state. Schrijfbare tools buiten de eerste week houden betekent dat het slechtste geval een verkeerd antwoord is in plaats van een verkeerd record in iemands CRM, en je kunt ze op 25% aanzetten zodra je de loop vertrouwt. Een kostenplafond per dag is degene die teams vergeten en degene die de maandagochtendfactuur voorkomt die niemand heeft goedgekeurd.

Eén regel: deze waarden staan in een store die je binnen seconden kunt wijzigen, en elke wijziging wordt gelogd met wie hem deed. Een flag die je moet redeployen om aan te passen is geen uitrolcontrole. Dat is een langzamere deploy.

## De percentages, en de poort vóór elke stap

Over percentages kun je eindeloos discussiëren en ze zijn grotendeels arbitrair. Wat telt is dat elke stap een poort heeft: een voorwaarde die moet gelden voordat de volgende stap opengaat, vooraf afgesproken, met een naam erbij van wie het controleert. Zonder die poort is een ramp alleen een langzamere manier om bij 100% te komen, wat de data ook zegt.

De ladder waar ik steeds op terugkom:

- **Shadow, 3 dagen.** Poort: een mens heeft minstens 100 gelogde outputs gescoord tegen je eval-rubriek en de pass rate zit binnen een paar punten van wat je in staging meette. Kun je ze niet scoren, dan heb je geen uitrol maar een hoop.
- **Alleen intern.** Poort: een volle dag zonder onafgehandelde exception in het AI-pad, en de kosten per geslaagde request zitten binnen het getal uit je business case. Hier vang je de integratiefouten die evals nooit raken, zoals de assistent die correct antwoordt maar naar de audit log van de verkeerde tenant schrijft.
- **10% van extern verkeer.** Poort: p95 end-to-end latency onder je gestelde doel, parse failure rate op gestructureerde output onder 1%, en minstens één bewuste rollback-oefening afgerond. Ja, oefen de rollback op 10%, als het je niets kost.
- **25%, daarna 50%.** Poort bij elke stap: 48 uur geen nieuwe foutcategorie in de logs. Niet "geen fouten", dat is onrealistisch. Geen nieuwe *soorten* fouten. Een bekende fout met een stabiel percentage is een backlog-item. Een fouttype dat je nooit eerder zag is een stopbord.
- **100%.** Poort: alles uit de sign-off-sectie hieronder.

Geef elke stap een minimumduur en weiger die in te korten voor een launchdatum. Vierentwintig uur op 10% dekt één dagcyclus van gebruikersgedrag, en veel AI-problemen hebben een vorm in de tijd: de batchjob om 02:00, de maandagochtendrush op rapportages, de belasting aan het eind van de maand wanneer elke accountmanager het ding tegelijk openzet. Vijf stappen doorlopen in één middag vertelt je niets, behalve dat je servers overeind bleven.

## "Uitzetten" moet binnen zestig seconden iets betekenen

Vraag het team hoe ze de feature nú zouden uitzetten en klok het antwoord. Als er een pull request, een CI-run en een deploy bij komen kijken, is je echte hersteltijd op een goede dag twintig minuten, en de on-call engineer twijfelt voordat hij begint, omdat een deploy terugdraaien als een grotere beslissing voelt dan een waarde omzetten.

Een AI feature kill switch heeft drie eigenschappen nodig. Het moet een configwijziging zijn zonder buildstap. Het moet afbouwen naar een gedefinieerde toestand in plaats van naar een error, en daarom staat `fallback_on_failure` in de config hierboven: de UI toont de oude handmatige flow, of een template, of een duidelijke "niet beschikbaar, gebruik X"-melding, nooit een spinner die nooit stopt. En meer dan één persoon moet eraan kunnen trekken. Als alleen de engineer die het bouwde het kan uitzetten, werkt de switch niet op vrijdagavond.

Schrijf op wie eraan mag trekken en maak die lijst langer dan comfortabel voelt: on-call engineering, de supportlead, de product owner. Maak daarna het culturele deel expliciet, want dat is het deel dat in de praktijk sneuvelt. De switch omzetten is nooit verkeerd. Niemand evalueert achteraf of het gerechtvaardigd was. Een team dat de kill switch als schuldbekentenis behandelt, discussieert veertig minuten in plaats van hem om te zetten, en die discussie is het eigenlijke incident.

## De signalen die uptime en error rate je niet laten zien

Je standaarddashboard staat op groen door bijna elke AI-storing die werkelijk telt. Dit zijn de signalen die het waard zijn om tijdens de ramp op een scherm te hebben, en de meeste hebben instrumentatie nodig die je tijdens de build toevoegt, niet erna. Bestaat hier nog niets van, dan is [monitoring van je AI in productie](/blog/llm-observability-production-monitoring) de voorwaarde, geen vervolgticket.

- **Kosten per request als verdeling, niet als gemiddelde.** Het gemiddelde verbergt de p99-gebruiker die een document van 90 pagina's plakt. Kijk naar het hoogste percentiel en naar het dagtotaal tegen het plafond.
- **Leeg-maar-toch-geantwoord bij retrieval.** Hoe vaak produceerde het model een antwoord met nul of irrelevante opgehaalde context. Deze ene metric voorspelt hallucinatieklachten beter dan wat ik ook meet.
- **Parse failures en stille reparaties op gestructureerde output.** Tel de retries en de velden die je fallback-parser stil op null heeft gezet.
- **Weiger- en hedgepercentage.** Een plotselinge stijging van "ik heb niet genoeg informatie" betekent meestal een regressie in retrieval of permissies, niet een voorzichtig model.
- **Hoe vaak het fallback-pad geraakt wordt.** Als 8% van de requests op het gedegradeerde pad landt, is de feature half kapot en volledig groen op je statuspagina.
- **Afwijzing aan gebruikerszijde.** Clicks op regenereren, de edit distance tussen de gegenereerde concepttekst en wat de gebruiker uiteindelijk verstuurde, en het aandeel outputs dat niemand kopieert of opslaat. Dit is het dichtste bij een kwaliteitssignaal dat je gratis krijgt.

Zet voor elk van deze een drempel en een eigenaar vast voordat de eerste externe gebruiker arriveert. Een metric zonder drempel is een grafiek waar iemand af en toe naar kijkt.

## Wat aftekenen voor general availability echt vraagt

De general availability checklist is kort, en bijna niets ervan staat op een dashboard. Naar 100% gaan betekent dat iemand doorlopende verantwoordelijkheid accepteert, dus de sign-off hoort een gesprek te zijn met concrete antwoorden.

De eval-suite draait op een schema tegen steekproeven uit productieverkeer, niet alleen in CI, en een mens kijkt wekelijks naar het resultaat. De flag en al zijn knoppen blijven minstens een maand na GA in de codebase staan, want de reden dat je ze nodig hebt is vaker een wijziging aan providerkant dan je eigen code. De rollback is één keer echt uitgevoerd. De latency, de kosten per request en de kwaliteitscijfers van de 50%-stap staan opgeschreven, want dat is je baseline om in februari drift te herkennen. En één persoon met naam is eigenaar van de feature, met een helder antwoord op [wie hem in maand vier nog beheert](/blog/ai-feature-maintenance-after-handover). "Het team" is geen antwoord.

Als die lijst leest als je [acceptatiecriteria](/blog/ai-feature-definition-of-done) met vier regels extra, dan is dat precies goed. Het uitrolplan is de brug tussen een feature die af is en een feature die live is, en het is het goedkoopste werk van twee dagen in een build van twaalf weken.

Een Full Build loopt zes tot twaalf weken en omvat de deploy en de walkthrough bij oplevering, wat in mijn werk betekent dat de flagconfig, de poorten, de kill switch en het dashboard bestaan en al een keer gebruikt zijn voordat de eerste externe gebruiker iets ziet. Ga je de launchweek in met een feature die werkt en zonder plan voor hoe die live gaat, dan staat de scope op de [dienstenpagina](/services) en is [contact](/contact) de snellere route.
