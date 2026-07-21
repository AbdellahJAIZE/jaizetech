---
title: "Productie computer vision in industriële omgevingen: 7 dingen die academische papers nooit vertellen"
description: "Lessen uit het 24/7 draaien van een CV-systeem dat producten gradeert op een lopende sorteerband. Annotatiekosten, label-ruis, het research-naar-productie gat en wat daadwerkelijk verschil maakt."
published: "2026-04-19"
tags: ["computer vision", "industriële AI", "productie-ML", "agritech"]
ogImage: "/og-image.png"
primaryService: "cv"
---

Het meeste computer vision-onderzoek is gebouwd op ImageNet, COCO of een van de medische of wetenschappelijke benchmarks. Gecureerde beelden. Schone labels. Eén score per beeld. Echte industriële computer vision is geen van die dingen.

Ik ben tweeënhalf jaar verantwoordelijk geweest voor de modellering van een productie-CV-systeem dat agrarische producten beoordeelt op een lopende band. Echte klanten, echt geld, echte gevolgen als het model fout zit. Deze post is de zeven lessen waar ik op terug blijf komen. Geen ervan zat in de papers die ik aan het begin las. Allemaal zijn ze achteraf voor de hand liggend.

Als je in 2026 industriële CV bouwt en je komt uit een onderzoeksachtergrond, deze post bespaart je maanden.

## 1. Annotatiekosten vormen je architectuur, niet andersom

De schoonste architectuur in een paper is "joint multi-task training across all defect categories with uncertainty-weighted loss balancing". Mooi in principe. Onmogelijk als elke categorie annoteren op elk beeld 4 minuten per beeld kost en je 50.000 beelden moet labelen.

In de praktijk eindig je met een tweetraps flow: een joint multi-output base getraind op de volledige taxonomie (langzaam te annoteren), daarna per-anomaly fine-tuning op goedkopere één-categorie-tegelijk annotaties (snel te produceren). Je kwam hier niet vanuit theorie. Je kwam hier omdat dat de vorm van data was die je economisch kon produceren.

Het diepere punt is dat **labelling-economie je modelarchitectuur meer vormt dan je modelarchitectuur je labelling vormt**. Als je de architectuur leidend laat zijn, verhonger je hem qua data. Als je de labelling leidend laat zijn, krijg je een architectuur die past bij de datastroom.

## 2. Crop-kwaliteit begrenst stroomafwaartse score-kwaliteit

Als je classifier faalt, kijk stroomopwaarts. We hadden een regressor die productdefecten scoorde. De scores waren ruizig. We hebben weken besteed aan het tunen van de regressor. De daadwerkelijke bug was dat onze YOLO crop-stage 5 tot 10 pixels achtergrond rond elk object liet. De regressor leerde de kleur van de bandrollen en de randen van naburige objecten als defectsignaal.

We hebben de YOLO-trainingsset opnieuw geannoteerd met strakkere boxes. Crop-kwaliteit verbeterde. Stroomafwaartse regressor-scores verbeterden. We hebben het regressiemodel nooit aangeraakt.

De algemene regel: **in een meertrappige pipeline werkt stroomopwaartse slordigheid stroomafwaarts door**. Check altijd de makkelijker-te-fixen stroomopwaartse stage voordat je de moeilijkere stroomafwaartse aanraakt.

## 3. Robuuste losses doen veel meer dan backbones als je labels ruizig zijn

We schakelden over van MSE naar SmoothL1 (Huber-loss) op de regression head. Drie dingen verbeterden: voorspellingen stopten met perfect matchen van duidelijk-foute annotator-labels, distributieplots toonden schonere scheiding tussen bedoelde populaties, edge cases werden eerlijker.

De tekstboekreden was duidelijk. Het kwadratisch-dan-lineaire regime van Huber begrenst de gradient op extreme fouten, dus één misgelabeld outlier kan de gewichten maar zoveel trekken. De tekstboekreden was niet wat ons deed overstappen. Een model zien dat een duidelijk verkeerd gelabeld beeld perfect zag fitten op validatie deed ons overstappen.

In industriële settings waar annotator-overeenstemming rond 80 procent zit en je het je niet kunt veroorloven om de meningsverschillen weg te gooien, **doen robuuste losses meer werk dan welke backbone-wijziging je ook zult maken**. ResNet-50 met SmoothL1 verslaat een mooiere backbone met MSE op echte label-ruis. Elke keer.

## 4. Inter-annotator consistentie is moeilijker dan de literatuur suggereert

De literatuur over multi-rater annotatie veronderstelt dat je veel beoordelaars hebt, dat ze enigszins van mening verschillen en dat je statistische consensus kunt berekenen (Dawid-Skene, confident learning). In een echte industriële deployment met een klein team van domeinexperts heb je geen veel beoordelaars. Je hebt er drie of vier. Hun meningsverschillen zijn geen statistische ruis. Het zijn echte verschillen in hoe elke expert ambigue gevallen leest.

We probeerden multi-rater consensus. Het model getraind op consensus presteerde slechter dan het model getraind op de labels van één ervaren reviewer. De reden is dat consensus juist het expert-oordeel uitmiddelde dat we het model wilden laten leren. Dus accepteerden we het perspectief van één expert als ground truth en het model werd die expert, inclusief zijn biases.

**Dit is een bewuste tradeoff, geen best practice**. Het werkt als de expert echt de beste persoon is om ground truth te definiëren en je begrijpt dat je zijn biases erft. Het faalt als je experts wisselt en het model het nieuwe perspectief vanaf nul opnieuw moet leren.

## 5. Het research-naar-productie gat is maanden breed en dat is normaal

Ik zie academische papers in twee tot vier weken in productie geshipt worden. Ik zie goede papers drie tot zes maanden ongeship blijven. Het verschil zit zelden in het model. Het zit in de validatie-overhead, de integratie in de deployment-stack, het risicobudget van het ops-team en de kosten van testen op echte productiedata.

In ons geval kunnen een recent training-experiment en het momenteel uitgerolde model drie of vier kwartalen uit elkaar liggen. Dat gat is geen langzaamheid. Het is de kost van verantwoordelijk zijn over wat tegen betalende klanten draait.

De implicatie voor academische lezers: **het meest gepubliceerde model is zelden het meest uitgerolde**. Het uitgerolde model is dat wat de validatie-gauntlet overleefd heeft. Vaak betekent dat een oudere architectuur met geharde training en inference, niet de nieuwste paper.

## 6. Foundation models transferren nog steeds niet schoon naar industriële CV

We probeerden DINO. We probeerden CLIP. We probeerden SigLIP. Geen ervan presteerde beter dan een fine-tuned ResNet op onze specifieke defect-gradeertaak. De transfer van web-schaal natuurlijke beelden naar beperkte industriële foto's (gecontroleerde belichting, enkel object, top-down view, herhaalbare achtergronden) is niet automatisch.

Waarom? Industriële beelden breken de aannames waarop foundation models getraind zijn. De features die een hoge-ernst defect onderscheiden van een lage-ernst zijn op textuurniveau, niet op semantisch niveau. Web-pretrained features weten "dit is een aardappel" maar weten niet "dit is een aardappel met oppervlakte-scheuren graad 3". Het semantische gat is ondiep. Het textuurgat is breed.

De belofte van foundation models in industriële CV is echt maar ongerealiseerd. De onderzoeksrichting waarop ik zou duwen als ik onbeperkte bandbreedte had is **domein-adaptieve self-supervised pretraining op industriële beelden** voor supervised fine-tuning. Niemand heeft dit overtuigend geshipt voor industrieel sorteren, voor zover ik weet.

## 7. Per-product specialisatie schaalt niet voor altijd

We onderhouden één model per product (één voor aardappels, één voor uien, één voor de volgende productsoort). Elk nieuw product dat erbij komt heeft zijn eigen trainingsset nodig, eigen training runs, eigen evaluatiewerk, eigen deployment-artefact. De economie breekt rond het 8-tot-12-product punt.

Wat dit zou fixen is een foundation model dat schoon transfert over producten. Dat hebben we nog niet. Dus de operationele kost groeit ruwweg lineair met het aantal producten, en op een gegeven moment is je engineering-team gewoon modelvarianten aan het onderhouden in plaats van nieuwe dingen te bouwen.

Als je industriële CV op schaal bouwt, **plan je foundation-model strategie voordat je 10 producten in productie hebt**, niet erna. Architectonische beslissingen genomen bij drie producten in productie zitten ingebakken bij tien.

## Wat dit betekent voor je team

Als je in 2026 begint met industriële computer vision, de volgorde van handelingen is:

1. **Besteed de eerste maand aan annotatie-infrastructuur**, niet aan modellen. De labelling-pipeline drijft alles stroomafwaarts.
2. **Kies een robuuste loss vanaf dag één**. MSE of pure cross-entropy met ruizige industriële labels is de faal van morgen lenen voor het gemak van vandaag.
3. **Log stroomopwaartse metrics, niet alleen end-to-end**. Crop-kwaliteit, annotatie-throughput, reviewer-meningsverschilrate. Deze voorspellen de fouten die je over drie maanden zult zien.
4. **Plan je foundation-model adaptatie-experiment voor maand zes**, niet later. Tegen maand twaalf zul je willen dat je het gedaan had.
5. **Reken op het research-naar-productie gat**. Een model dat werkt in een notebook is niet klaar. Het is 60 procent klaar.

De systemen die shippen en geshipt blijven zijn niet die met de mooiste architecturen. Het zijn die waar de labelling-, training-, deployment- en operationele loops allemaal strak zijn en het team geïnternaliseerd heeft dat elk van die loops meer toedoet dan de modelarchitectuur.

Als je een gestructureerde lezing wilt op een industrieel CV-systeem dat je bouwt of draait, het [AI-integratie-audit](/services) format werkt hier goed voor. Het is een geschreven rapport over wat waarschijnlijk gaat breken en wat het meeste verschil zou maken.

Verwante leesstof: [wat er echt breekt als AI in productie komt](/blog/what-breaks-in-ai-production) dekt het bredere productie-faallandschap, waarvan veel ook geldt voor CV-deployments.
