/**
 * Stockley's Drug Interactions Evaluator & Knowledge Base
 * Standard: MedicinesComplete / Pharmaceutical Press / British National Formulary (BNF)
 * Purpose: Instant primary care interaction checking, severity hazard classification,
 * mechanism breakdown (PK/PD), actionable GP prescribing advice, and EHR snippet generation.
 */

export type InteractionSeverity = 'contraindicated' | 'severe' | 'moderate' | 'minor' | 'none';

export interface StockleyInteraction {
  id: string;
  drugGroupA: string[]; // Generic / class members
  drugGroupB: string[]; // Generic / class members
  drugGroupC?: string[]; // Optional 3rd group for triple interactions (e.g. Triple Whammy)
  severity: InteractionSeverity;
  severityLabel: string;
  hazardIcon: string;
  title: string;
  summary: string;
  mechanism: {
    type: 'pharmacokinetic' | 'pharmacodynamic' | 'mixed';
    details: string;
    pathways: string[];
  };
  clinicalAction: string;
  monitoring: string;
  alternatives: string[];
  emisSnippet: string;
  references: string[];
}

// Brand name to generic mapping for UK primary care
export const UK_BRAND_TO_GENERIC: Record<string, string> = {
  lipitor: 'atorvastatin',
  zocor: 'simvastatin',
  crestor: 'rosuvastatin',
  lescol: 'fluvastatin',
  klacid: 'clarithromycin',
  erythrocin: 'erythromycin',
  erythroped: 'erythromycin',
  ciprobay: 'ciprofloxacin',
  augmentin: 'co-amoxiclav',
  amoxil: 'amoxicillin',
  septrin: 'co-trimoxazole',
  monotrim: 'trimethoprim',
  macrobid: 'nitrofurantoin',
  macrodantin: 'nitrofurantoin',
  voltarol: 'diclofenac',
  brufen: 'ibuprofen',
  nurofen: 'ibuprofen',
  naprosyn: 'naproxen',
  flanax: 'naproxen',
  mobiflex: 'meloxicam',
  celebrex: 'celecoxib',
  arcoxia: 'etoricoxib',
  istone: 'amlodipine',
  istin: 'amlodipine',
  tildiem: 'diltiazem',
  slozem: 'diltiazem',
  adizem: 'diltiazem',
  verapress: 'verapamil',
  cordilox: 'verapamil',
  tritace: 'ramipril',
  innovace: 'enalapril',
  zestril: 'lisinopril',
  cozaar: 'losartan',
  amias: 'candesartan',
  micardis: 'telmisartan',
  aldactone: 'spironolactone',
  inspra: 'eplerenone',
  lasix: 'furosemide',
  burinex: 'bumetanide',
  apridol: 'indapamide',
  natrilix: 'indapamide',
  cipramil: 'citalopram',
  cipralex: 'escitalopram',
  lustral: 'sertraline',
  prozac: 'fluoxetine',
  seroxat: 'paroxetine',
  efexor: 'venlafaxine',
  cymbalta: 'duloxetine',
  zamadol: 'tramadol',
  zydol: 'tramadol',
  tramake: 'tramadol',
  imigran: 'sumatriptan',
  zomig: 'zolmitriptan',
  maxalt: 'rizatriptan',
  eliquis: 'apixaban',
  xarelto: 'rivaroxaban',
  lixiana: 'edoxaban',
  pradaxa: 'dabigatran',
  marevan: 'warfarin',
  plavix: 'clopidogrel',
  brilique: 'ticagrelor',
  lanoxin: 'digoxin',
  cordarone: 'amiodarone',
  'slo-phyllin': 'theophylline',
  uniphyllin: 'theophylline',
  tegretol: 'carbamazepine',
  epilim: 'sodium valproate',
  depakote: 'sodium valproate',
  eutirox: 'levothyroxine',
  synthroid: 'levothyroxine',
  viagra: 'sildenafil',
  cialis: 'tadalafil',
  levitra: 'vardenafil',
  imuran: 'azathioprine',
  purinethol: 'mercaptopurine',
  zyloric: 'allopurinol',
  tenormin: 'atenolol',
  cardicor: 'bisoprolol',
  inderal: 'propranolol',
  nolvadex: 'tamoxifen',
  zantac: 'famotidine',
  losec: 'omeprazole',
  zoton: 'lansoprazole',
  protium: 'pantoprazole',
  nexium: 'esomeprazole',
};

// Comprehensive pre-compiled Stockley's Primary Care Interactions database
export const STOCKLEYS_INTERACTIONS_DB: StockleyInteraction[] = [
  {
    id: 'simvastatin_macrolide',
    drugGroupA: ['simvastatin', 'atorvastatin'],
    drugGroupB: ['clarithromycin', 'erythromycin', 'telithromycin'],
    severity: 'contraindicated',
    severityLabel: 'Contraindicated / Severe Hazard',
    hazardIcon: '🔴',
    title: 'Statin + Macrolide Antibiotic (Potent CYP3A4 Inhibition)',
    summary:
      'Clarithromycin and erythromycin are potent CYP3A4 inhibitors that increase simvastatin serum concentrations up to 10-fold to 12-fold, carrying an extreme risk of severe rhabdomyolysis and acute kidney injury.',
    mechanism: {
      type: 'pharmacokinetic',
      details:
        'Clarithromycin and erythromycin irreversibly inhibit hepatic cytochrome P450 3A4 (CYP3A4) and OATP1B1 hepatic uptake transporters, blocking first-pass and systemic clearance of CYP3A4-dependent statins.',
      pathways: ['CYP3A4 Inhibition', 'OATP1B1 Transporter Blockade'],
    },
    clinicalAction:
      'DO NOT CO-PRESCRIBE. Withhold simvastatin or atorvastatin during the entire course of macrolide treatment and resume 7 days after the last antibiotic dose. If continuous statin therapy is critical, switch antibiotic to an agent that does not inhibit CYP3A4 (e.g. Amoxicillin, Doxycycline, or Cefalexin).',
    monitoring:
      'Counsel patient to seek immediate medical attention for unexplained muscle pain, tenderness, weakness, or dark/cola-coloured urine. Check serum Creatine Kinase (CK) and renal profile (U&Es) if muscle symptoms occur.',
    alternatives: [
      'Antibiotic alternative: Amoxicillin or Doxycycline 100mg (non-interacting)',
      'Pause statin: Withhold simvastatin/atorvastatin during macrolide course and restart 7 days post-treatment',
      'Alternative statin: Rosuvastatin or Pravastatin (metabolised via CYP2C9/sulfation, minimal CYP3A4 reliance, though caution still advised)',
    ],
    emisSnippet:
      'Rx Safety Alert: Macrolide + CYP3A4 statin. Clarithromycin prescribed; advised patient to WITHHOLD Simvastatin/Atorvastatin for duration of antibiotic course + 7 days post-completion. Safety-netted re muscle pain, weakness, and dark urine.',
    references: [
      'MedicinesComplete: Stockley\'s Drug Interactions — Statins + Macrolides',
      'MHRA Drug Safety Update: Statins and risk of rhabdomyolysis with CYP3A4 inhibitors',
      'BNF Simvastatin / Clarithromycin Interaction monograph',
    ],
  },
  {
    id: 'methotrexate_trimethoprim',
    drugGroupA: ['methotrexate'],
    drugGroupB: ['trimethoprim', 'co-trimoxazole', 'septrin'],
    severity: 'contraindicated',
    severityLabel: 'Contraindicated / Fatal Hazard',
    hazardIcon: '🔴',
    title: 'Methotrexate + Trimethoprim / Co-trimoxazole (Haematological Toxicity)',
    summary:
      'Both drugs are antifolate agents (dihydrofolate reductase inhibitors). In addition, trimethoprim competes for renal tubular secretion of methotrexate, precipitating catastrophic bone marrow aplasia and pancytopenia.',
    mechanism: {
      type: 'mixed',
      details:
        'Synergistic inhibition of dihydrofolate reductase (DHFR) combined with competitive inhibition of renal tubular organic anion transporters (OAT3), resulting in toxic methotrexate accumulation and sudden cessation of haematopoiesis.',
      pathways: ['Additive Antifolate Toxicity', 'OAT3 Renal Clearance Inhibition'],
    },
    clinicalAction:
      'ABSOLUTE CONTRAINDICATION. Never prescribe trimethoprim or co-trimoxazole to any patient taking oral or subcutaneous methotrexate. Fatalities have occurred after just a few doses.',
    monitoring:
      'If inadvertently co-administered, immediately stop both agents, admit urgently for high-dose Calcium Folinate (Leucovorin rescue), and monitor urgent FBC and serum methotrexate levels.',
    alternatives: [
      'For lower UTI: Nitrofurantoin 100mg m/r BD (if eGFR >45) or Pivmecillinam 400mg TDS',
      'For chest infection: Amoxicillin 500mg TDS or Doxycycline 200mg stat then 100mg OD',
    ],
    emisSnippet:
      'Rx Safety Alert: Trimethoprim/Co-trimoxazole CONTRAINDICATED in patient on Methotrexate due to fatal pancytopenia risk. Prescribed safe alternative (Nitrofurantoin/Amoxicillin). Methotrexate therapy unchanged.',
    references: [
      'MedicinesComplete: Stockley\'s Drug Interactions — Methotrexate + Trimethoprim',
      'NICE CKS: Methotrexate monitoring and antifolate precautions',
      'MHRA Drug Safety Update: Trimethoprim and methotrexate fatal interaction',
    ],
  },
  {
    id: 'triple_whammy_renal',
    drugGroupA: ['ramipril', 'enalapril', 'lisinopril', 'perindopril', 'losartan', 'candesartan', 'valsartan', 'irbesartan'],
    drugGroupB: ['bendroflumethiazide', 'indapamide', 'furosemide', 'bumetanide', 'chlortalidone'],
    drugGroupC: ['ibuprofen', 'naproxen', 'diclofenac', 'meloxicam', 'celecoxib', 'etoricoxib', 'mefenamic acid'],
    severity: 'severe',
    severityLabel: 'Severe Hazard (Triple Whammy AKI)',
    hazardIcon: '🟠',
    title: '"Triple Whammy": ACEi/ARB + Diuretic + NSAID (Severe Acute Kidney Injury)',
    summary:
      'Co-administration of an ACEi/ARB, a diuretic, and a systemic NSAID cripples renal autoregulation. The triad carries a dramatic 300% increased risk of acute kidney injury (AKI) requiring emergency hospitalisation.',
    mechanism: {
      type: 'pharmacodynamic',
      details:
        'NSAIDs inhibit prostaglandin synthesis causing vasoconstriction of the afferent arteriole; ACEi/ARBs prevent angiotensin II-mediated vasoconstriction of the efferent arteriole causing efferent vasodilation; diuretics reduce circulating volume and renal perfusion. Glomerular capillary filtration pressure collapses.',
      pathways: ['Afferent Arteriole Constriction', 'Efferent Arteriole Dilation', 'Volume Depletion'],
    },
    clinicalAction:
      'AVOID THE TRIPLE WHAMMY COMBINATION. Do not prescribe oral NSAIDs to patients taking an ACEi/ARB and a diuretic. If acute anti-inflammatory analgesia is indispensable, consider temporary withholding of the diuretic or ACEi, maintain strict hydration, and perform baseline and 5-day U&Es.',
    monitoring:
      'Check U&Es (creatinine and potassium) prior to and 5-7 days after introducing any NSAID. Instruct patient on "sick day rules" (stop ACEi/diuretic during diarrhoeal illness/dehydration).',
    alternatives: [
      'Analgesia alternative: Paracetamol 1g QDS regularly +/- Codeine Phosphate 30mg QDS',
      'Topical alternative: Topical Voltarol / Ibuprofen gel (minimal systemic absorption, significantly safer)',
      'Joint pain: Consider intra-articular steroid injection or short course weak opioid',
    ],
    emisSnippet:
      'Triple Whammy Risk: Patient taking ACEi/ARB + Diuretic. Oral NSAID avoided to prevent catastrophic AKI. Advised Paracetamol 1g QDS + topical NSAID gel. Reinforced sick day guidance for ACEi/diuretic.',
    references: [
      'Stockley\'s Drug Interactions: ACE inhibitors + Diuretics + NSAIDs ("Triple Whammy")',
      'British Medical Journal (BMJ): The triple whammy — acute kidney injury in primary care',
      'NICE Guideline NG148: Acute kidney injury prevention and management',
    ],
  },
  {
    id: 'acei_potassium_sparing',
    drugGroupA: ['ramipril', 'enalapril', 'lisinopril', 'perindopril', 'losartan', 'candesartan'],
    drugGroupB: ['spironolactone', 'eplerenone', 'amiloride', 'triamterene'],
    severity: 'severe',
    severityLabel: 'Severe Hazard (Life-Threatening Hyperkalaemia)',
    hazardIcon: '🟠',
    title: 'ACEi/ARB + Potassium-Sparing Diuretic / Aldosterone Antagonist',
    summary:
      'Dual inhibition of the renin-angiotensin-aldosterone axis significantly reduces renal potassium excretion, leading to rapid, life-threatening hyperkalaemia and fatal ventricular dysrhythmias.',
    mechanism: {
      type: 'pharmacodynamic',
      details:
        'ACE inhibitors and ARBs decrease aldosterone secretion from the adrenal cortex, while spironolactone/eplerenone competitively block aldosterone receptors in the cortical collecting duct, shutting down potassium secretion into urine.',
      pathways: ['Additive Aldosterone Suppression', 'Distal Tubule K+ Retention'],
    },
    clinicalAction:
      'May be co-prescribed in Heart Failure with Reduced Ejection Fraction (HFrEF) under specialist guidance, but requires strict baseline and ongoing potassium and renal monitoring. Avoid potassium supplements and salt substitutes containing potassium chloride.',
    monitoring:
      'Check U&Es and serum potassium before initiation, at 1 week, 4 weeks, 8 weeks, 12 weeks, and 6-monthly thereafter. Withhold or halve dose if potassium >5.5 mmol/L; stop immediately and refer if K+ >6.0 mmol/L.',
    alternatives: [
      'Heart failure guideline optimization: Ensure eGFR >30 mL/min and baseline K+ <5.0 mmol/L before initiating',
      'If hyperkalaemia occurs: Switch to SGLT2 inhibitor (Dapagliflozin 10mg OD) which has neutral/mild potassium-lowering effect',
    ],
    emisSnippet:
      'Prescribed ACEi + Spironolactone for HFrEF. Baseline U&Es checked (K+: <5.0, eGFR: >30). Counseled to avoid potassium salt substitutes (LoSalt). Planned repeat U&Es in 7 days.',
    references: [
      'Stockley\'s Drug Interactions: ACE inhibitors + Potassium-sparing diuretics',
      'NICE NG106: Chronic heart failure in adults — diagnosis and management',
    ],
  },
  {
    id: 'anticoagulant_nsaid',
    drugGroupA: ['apixaban', 'rivaroxaban', 'edoxaban', 'dabigatran', 'warfarin'],
    drugGroupB: ['ibuprofen', 'naproxen', 'diclofenac', 'meloxicam', 'celecoxib', 'aspirin'],
    severity: 'severe',
    severityLabel: 'Severe Hazard (Major Haemorrhage)',
    hazardIcon: '🟠',
    title: 'Anticoagulant (DOAC / Warfarin) + NSAID / Aspirin',
    summary:
      'Profound synergistic bleeding risk. NSAIDs induce gastrointestinal mucosal erosions and impair platelet aggregation, which co-administered with systemic anticoagulation multiplies major gastrointestinal and intracranial bleed risk 4-fold.',
    mechanism: {
      type: 'pharmacodynamic',
      details:
        'COX-1 inhibition by NSAIDs prevents thromboxane A2 production leading to reversible or irreversible platelet dysfunction, while simultaneously inhibiting protective gastric prostaglandins. Systemic anticoagulation prevents fibrin clot formation at ulceration sites.',
      pathways: ['Additive Antihaemostatic Toxicity', 'Gastric Mucosal Prostaglandin Depletion'],
    },
    clinicalAction:
      'AVOID CONCURRENT USE. Co-prescribing should generally be avoided unless specifically indicated (e.g. triple/dual therapy post-PCI under cardiology directive). If an NSAID is deemed clinically unavoidable, always co-prescribe a gastroprotective PPI (Lansoprazole 30mg OD or Omeprazole 20mg OD) and use the minimum effective dose for shortest possible duration (e.g. max 3-5 days).',
    monitoring:
      'Educate patient on warning signs of occult GI bleeding: melaena (black tarry stools), haematemesis (coffee-ground vomit), sudden pallor, weakness, or unexplained bruising.',
    alternatives: [
      'First-line pain relief: Paracetamol 1g QDS regularly',
      'Topical relief: Topical NSAID (e.g. Voltarol gel) applied sparingly away from large body areas',
      'Severe acute pain: Short course weak opioid (Codeine 30mg or Dihydrocodeine 30mg) with laxative',
    ],
    emisSnippet:
      'Rx Safety Alert: NSAID avoided due to active DOAC/Warfarin anticoagulation. Patient counseled on elevated GI bleed risk. Prescribed Paracetamol 1g QDS + topical NSAID gel. Red flags discussed (melaena, bruising).',
    references: [
      'Stockley\'s Drug Interactions: Anticoagulants + NSAIDs',
      'MHRA Drug Safety Update: DOACs and risk of major bleeding with antiplatelets/NSAIDs',
      'NICE CKS: Anticoagulation oral therapy',
    ],
  },
  {
    id: 'ssri_tramadol_triptan',
    drugGroupA: ['citalopram', 'escitalopram', 'sertraline', 'fluoxetine', 'paroxetine', 'venlafaxine', 'duloxetine'],
    drugGroupB: ['tramadol', 'sumatriptan', 'zolmitriptan', 'rizatriptan', 'linezolid', 'rasagiline', 'selegiline'],
    severity: 'severe',
    severityLabel: 'Severe Hazard (Serotonin Syndrome)',
    hazardIcon: '🟠',
    title: 'SSRI / SNRI + Tramadol / Triptan (Serotonin Syndrome)',
    summary:
      'Additive serotonergic neurotransmission in the CNS and periphery. Combination can trigger Serotonin Syndrome, characterized by neuromuscular hyperactivity, autonomic instability, and altered mental state.',
    mechanism: {
      type: 'pharmacodynamic',
      details:
        'SSRIs/SNRIs block reuptake of 5-HT at the presynaptic cleft, while tramadol inhibits 5-HT reuptake and stimulates release. Triptans are direct 5-HT1B/1D receptor agonists. The resulting overstimulation of 5-HT2A receptors causes neuromuscular irritability.',
      pathways: ['Additive Central 5-HT Accumulation', '5-HT2A Receptor Hyperstimulation'],
    },
    clinicalAction:
      'Avoid combination where alternatives exist. If Tramadol or a Triptan must be used in a patient taking an SSRI/SNRI, use the lowest effective dose, monitor closely during initiation, and educate the patient on Hunter Serotonin Toxicity Criteria red flags.',
    monitoring:
      'Warn patient to seek emergency care if experiencing: clonus (involuntary muscle jerks), ocular clonus, hyperreflexia, shivering, diaphoresis (profuse sweating), agitation, or fever.',
    alternatives: [
      'Analgesia alternative: Paracetamol 1g QDS + Codeine Phosphate 30mg (Codeine does not inhibit serotonin reuptake)',
      'Migraine alternative: High-dose Paracetamol 1g + Prochlorperazine 5mg / Metoclopramide 10mg, or consider CGRP antagonist (Rimegepant)',
    ],
    emisSnippet:
      'Rx Safety Alert: Tramadol avoided due to concurrent SSRI/SNRI and Serotonin Syndrome risk. Prescribed Codeine + Paracetamol for acute analgesia. Safety-netting re neuromuscular excitability provided.',
    references: [
      'Stockley\'s Drug Interactions: SSRIs + Serotonergic Analgesics',
      'MHRA Drug Safety Update: Serotonin syndrome with combined serotonergic medicines',
      'Hunter Serotonin Toxicity Criteria',
    ],
  },
  {
    id: 'citalopram_omeprazole',
    drugGroupA: ['citalopram', 'escitalopram'],
    drugGroupB: ['omeprazole', 'esomeprazole'],
    severity: 'moderate',
    severityLabel: 'Moderate Hazard (QTc Prolongation & Dose Cap)',
    hazardIcon: '🟡',
    title: 'Citalopram / Escitalopram + Omeprazole (CYP2C19 Inhibition & QTc)',
    summary:
      'Omeprazole is a CYP2C19 inhibitor that increases plasma concentrations of citalopram by approximately 50% to 100%, causing concentration-dependent prolongation of the cardiac QT interval and risk of Torsades de Pointes.',
    mechanism: {
      type: 'pharmacokinetic',
      details:
        'Citalopram is metabolised in part by CYP2C19 to desmethylcitalopram. Competitive inhibition of CYP2C19 by omeprazole/esomeprazole elevates parent citalopram AUC, directly blocking cardiac hERG potassium channels and delaying ventricular repolarisation.',
      pathways: ['CYP2C19 Inhibition', 'Cardiac hERG Potassium Channel Blockade'],
    },
    clinicalAction:
      'DOSE CAP MANDATED: When co-administered with omeprazole or esomeprazole, the maximum dose of Citalopram is 20mg daily (10mg in the elderly). For Escitalopram, the maximum dose is 10mg daily (5mg in the elderly). Alternatively, switch to an alternative PPI that has minimal CYP2C19 interaction.',
    monitoring:
      'Review baseline ECG and calculate QTc interval in patients with underlying cardiac risk factors, bradycardia, or electrolyte imbalance. Check magnesium and potassium.',
    alternatives: [
      'Switch PPI: Lansoprazole 15-30mg or Pantoprazole 20-40mg (significantly lower affinity for CYP2C19)',
      'Switch H2RA: Famotidine 20-40mg daily',
      'Switch Antidepressant: Sertraline 50mg OD (minimal QTc risk compared to citalopram)',
    ],
    emisSnippet:
      'Citalopram + Omeprazole co-prescribing reviewed. Patient maintained on Citalopram 20mg (compliant with MHRA max 20mg dose cap when co-prescribed with omeprazole to mitigate QTc prolongation risk).',
    references: [
      'MedicinesComplete: Stockley\'s Drug Interactions — Citalopram + Omeprazole',
      'MHRA Drug Safety Update: Citalopram and escitalopram — QT interval prolongation',
    ],
  },
  {
    id: 'levothyroxine_iron_calcium',
    drugGroupA: ['levothyroxine'],
    drugGroupB: ['ferrous sulfate', 'ferrous fumarate', 'ferrous gluconate', 'calcium carbonate', 'adcal-d3', 'calcichew', 'gaviscon', 'alucol'],
    severity: 'moderate',
    severityLabel: 'Moderate Hazard (Chelation / Absorption Impairment)',
    hazardIcon: '🟡',
    title: 'Levothyroxine + Oral Iron / Calcium / Antacids (Absorption Chelation)',
    summary:
      'Multivalent cations (Fe2+, Ca2+, Al3+, Mg2+) bind levothyroxine in the gastrointestinal tract forming an insoluble, non-absorbable chelate complex, drastically lowering T4 bioavailability and precipitating clinical hypothyroidism.',
    mechanism: {
      type: 'pharmacokinetic',
      details:
        'Divalent and trivalent metal cations form a coordination complex with the phenolic hydroxyl and amino groups of thyroxine in gastric acid, preventing absorption in the duodenum and jejunum.',
      pathways: ['GI Chelation Complexation', 'Reduced Bioavailability'],
    },
    clinicalAction:
      'SEPARATE DOSING BY AT LEAST 4 HOURS. Instruct patient to take Levothyroxine first thing in the morning on an empty stomach with a full glass of water, and take oral Iron, Calcium, or Antacids at lunchtime or evening, separated by at least 4 hours.',
    monitoring:
      'Repeat serum TSH in 6 to 8 weeks after instituting or modifying the dosing separation schedule.',
    alternatives: [
      'Timing adjustment: Levothyroxine upon waking (e.g. 07:00), Iron or Calcium at lunch/evening (e.g. 13:00 / 19:00)',
      'Alternate day iron: Ferrous fumarate 210mg taken once every alternate day at lunchtime to reduce GI side effects and maximize hepcidin clearance',
    ],
    emisSnippet:
      'Medication Counseling: Levothyroxine + Iron/Calcium. Instructed patient to separate administration by at least 4 hours (Thyroxine 7am fasting, Iron/Calcium 1pm) to prevent absorption chelation. TSH scheduled in 8 weeks.',
    references: [
      'Stockley\'s Drug Interactions: Thyroid hormones + Multivalent cations',
      'NICE CKS: Hypothyroidism — Levothyroxine administration and interactions',
    ],
  },
  {
    id: 'simvastatin_amlodipine_diltiazem',
    drugGroupA: ['simvastatin'],
    drugGroupB: ['amlodipine', 'diltiazem', 'verapamil'],
    severity: 'moderate',
    severityLabel: 'Moderate Hazard (CYP3A4 Myopathy Risk / Dose Cap)',
    hazardIcon: '🟡',
    title: 'Simvastatin + Amlodipine / Diltiazem / Verapamil (Dose Cap 20mg)',
    summary:
      'Calcium channel blockers moderately inhibit CYP3A4-mediated metabolism of simvastatin, doubling simvastatin blood concentration and significantly elevating the incidence of myalgia, myopathy, and rhabdomyolysis.',
    mechanism: {
      type: 'pharmacokinetic',
      details:
        'Amlodipine and diltiazem act as weak-to-moderate competitive inhibitors of cytochrome P450 3A4, reducing hepatic clearance and increasing simvastatin AUC by approximately 77% to 100%.',
      pathways: ['CYP3A4 Inhibition', 'Elevated Simvastatin AUC'],
    },
    clinicalAction:
      'DOSE CAP MANDATED: Simvastatin dose must NOT exceed 20mg daily when co-prescribed with Amlodipine, Diltiazem, or Verapamil. If the patient requires higher intensity lipid lowering (e.g. secondary prevention QRISK >10%), switch to Atorvastatin 20-80mg daily, which does not require a dose cap with amlodipine.',
    monitoring:
      'Advise patient to report any unexplained muscle aches, pain, or weakness. Routine LFTs and lipid profile as per NICE lipid modification guidelines.',
    alternatives: [
      'Switch Statin: Atorvastatin 20mg, 40mg, or 80mg daily (NICE CG181 first-line recommended statin, safe with amlodipine)',
      'Alternative Statin: Rosuvastatin 5mg to 20mg daily (metabolised via CYP2C9)',
    ],
    emisSnippet:
      'Simvastatin + Amlodipine interaction noted. Switched from Simvastatin to Atorvastatin 20mg OD (NICE first line, avoids MHRA 20mg dose restriction required with amlodipine co-prescription).',
    references: [
      'MedicinesComplete: Stockley\'s Drug Interactions — Statins + Calcium channel blockers',
      'MHRA Drug Safety Update: Simvastatin — dose caps with amlodipine and diltiazem',
      'NICE CG181: Cardiovascular disease — risk assessment and reduction including lipid modification',
    ],
  },
  {
    id: 'lithium_acei_nsaid_thiazide',
    drugGroupA: ['lithium', 'priadel', 'camcolit'],
    drugGroupB: ['ramipril', 'lisinopril', 'losartan', 'candesartan', 'bendroflumethiazide', 'indapamide', 'ibuprofen', 'naproxen', 'diclofenac'],
    severity: 'severe',
    severityLabel: 'Severe Hazard (Lithium Toxicity)',
    hazardIcon: '🟠',
    title: 'Lithium + ACEi / ARB / NSAID / Thiazide (Severe Toxicity)',
    summary:
      'ACE inhibitors, ARBs, thiazide diuretics, and NSAIDs diminish renal clearance of lithium, rapidly pushing serum lithium into the toxic window (>1.2 mmol/L), causing tremor, ataxia, confusion, and irreversible renal damage.',
    mechanism: {
      type: 'pharmacokinetic',
      details:
        'Thiazide diuretics cause sodium and water depletion, stimulating proximal tubular reabsorption of sodium and lithium in tandem. ACEi/ARBs decrease GFR. NSAIDs inhibit renal synthesis of vasodilatory prostaglandins, decreasing renal blood flow and lithium filtration.',
      pathways: ['Reduced Renal Lithium Clearance', 'Proximal Tubule Reabsorption'],
    },
    clinicalAction:
      'AVOID CONCURRENT USE WHERE POSSIBLE. If an NSAID is required, substitute with Paracetamol. If an antihypertensive is required, prefer a Calcium Channel Blocker (Amlodipine) or Beta-blocker under specialist consultation. If co-prescribing is mandatory, reduce lithium dose by 25-50% and monitor lithium levels every 3 to 5 days until stable.',
    monitoring:
      'Urgent serum lithium level, U&Es, and eGFR. Counsel on lithium toxicity signs: coarse hand tremor, vomiting, diarrhoea, muscle weakness, slurred speech, ataxia, and drowsiness.',
    alternatives: [
      'Analgesia alternative: Paracetamol 1g QDS or short course weak opioid',
      'Antihypertensive alternative: Amlodipine 5-10mg OD or Bisoprolol 2.5-5mg OD (less effect on lithium clearance)',
    ],
    emisSnippet:
      'Rx Safety Alert: NSAID/ACEi avoided due to Priadel (Lithium) therapy. Patient advised on severe toxicity risk with OTC ibuprofen. Prescribed Paracetamol 1g QDS. Lithium level documented within target (0.6-0.8 mmol/L).',
    references: [
      'Stockley\'s Drug Interactions: Lithium + ACE inhibitors / NSAIDs / Diuretics',
      'NICE CG185: Bipolar disorder — assessment and management (Lithium monitoring)',
    ],
  },
  {
    id: 'allopurinol_azathioprine',
    drugGroupA: ['allopurinol', 'febuxostat'],
    drugGroupB: ['azathioprine', 'mercaptopurine', '6-mercaptopurine', 'imuran'],
    severity: 'contraindicated',
    severityLabel: 'Contraindicated / Fatal Hazard (Bone Marrow Suppression)',
    hazardIcon: '🔴',
    title: 'Allopurinol + Azathioprine / Mercaptopurine (Fatal Pancytopenia)',
    summary:
      'Allopurinol blocks xanthine oxidase, the primary enzyme responsible for catabolising 6-mercaptopurine (the active metabolite of azathioprine). This causes catastrophic accumulation of active 6-thioguanine nucleotides and fatal pancytopenia.',
    mechanism: {
      type: 'pharmacokinetic',
      details:
        'Azathioprine is converted to 6-MP. Xanthine oxidase converts 6-MP to inactive 6-thiouric acid. Inhibition of xanthine oxidase shunts metabolites into the TPMT and HPRT pathways, exponentially elevating cytotoxic 6-thioguanine nucleotides (6-TGN).',
      pathways: ['Xanthine Oxidase Inhibition', 'Toxic 6-Thioguanine Accumulation'],
    },
    clinicalAction:
      'AVOID COMBINATION IN PRIMARY CARE. If co-administration is coordinated under specialized rheumatology/gastroenterology protocols, the Azathioprine dose MUST BE REDUCED TO 25% (one quarter) of the standard dose, accompanied by intensive weekly full blood count monitoring.',
    monitoring:
      'Weekly FBC and LFTs for the first 8 weeks, then fortnightly. Urgent presentation for sore throat, mouth ulcers, unexplained fever, or bleeding/bruising.',
    alternatives: [
      'Gout management alternative: Colchicine 500mcg BD or low-dose oral steroid for flare; avoid xanthine oxidase inhibitors',
      'Rheumatology liaison: Contact specialist before altering either drug',
    ],
    emisSnippet:
      'CRITICAL SAFETY ALERT: Allopurinol withheld due to concurrent Azathioprine therapy. High risk of fatal myelosuppression from xanthine oxidase inhibition. Contacted rheumatology team for alternative gout regimen.',
    references: [
      'MedicinesComplete: Stockley\'s Drug Interactions — Allopurinol + Azathioprine',
      'BNF Azathioprine interaction monograph',
      'British Society for Rheumatology (BSR) DMARD monitoring guidelines',
    ],
  },
  {
    id: 'sildenafil_nitrates',
    drugGroupA: ['sildenafil', 'tadalafil', 'vardenafil', 'avanafil'],
    drugGroupB: ['glyceryl trinitrate', 'gtn', 'isosorbide mononitrate', 'isosorbide dinitrate', 'nicorandil'],
    severity: 'contraindicated',
    severityLabel: 'Contraindicated / Fatal Hazard (Refractory Hypotension)',
    hazardIcon: '🔴',
    title: 'PDE5 Inhibitor + Nitrate / Nicorandil (Severe Refractory Hypotension)',
    summary:
      'Profound synergistic vasodilatation and cGMP accumulation. Co-administration can cause precipitous, life-threatening hypotension, syncope, acute coronary ischaemia, and death.',
    mechanism: {
      type: 'pharmacodynamic',
      details:
        'Nitrates act as nitric oxide (NO) donors, activating guanylate cyclase to produce cyclic GMP (cGMP). Phosphodiesterase type 5 (PDE5) inhibitors prevent breakdown of cGMP. Extreme accumulation of cGMP causes massive vascular smooth muscle relaxation.',
      pathways: ['Synergistic cGMP Accumulation', 'Profound Systemic Vasodilation'],
    },
    clinicalAction:
      'ABSOLUTE CONTRAINDICATION. Do not prescribe any PDE5 inhibitor (Sildenafil, Tadalafil, Vardenafil) to any patient using sublingual or transdermal GTN, Isosorbide Mononitrate, or Nicorandil. If a patient on a PDE5 inhibitor develops acute chest pain, nitrates must NOT be administered for at least 24 hours (48 hours for tadalafil).',
    monitoring:
      'Warn patient never to take friends\' or OTC sildenafil/viagra if using a GTN spray. Emphasize emergency services 999 if chest pain occurs.',
    alternatives: [
      'Erectile dysfunction alternative: Vacuum erection device (VED) or topical/intraurethral alprostadil (with caution under specialist)',
      'Angina alternative: Optimize Beta-blocker, Calcium channel blocker (Amlodipine), or Ranolazine',
    ],
    emisSnippet:
      'Erectile dysfunction consultation: PDE5 inhibitor (Sildenafil/Tadalafil) CONTRAINDICATED due to regular Isosorbide Mononitrate / GTN spray for stable angina. Advised non-pharmacological options (vacuum device).',
    references: [
      'MedicinesComplete: Stockley\'s Drug Interactions — PDE5 Inhibitors + Nitrates',
      'MHRA Drug Safety: Sildenafil and cardiovascular safety',
    ],
  },
  {
    id: 'clopidogrel_omeprazole',
    drugGroupA: ['clopidogrel'],
    drugGroupB: ['omeprazole', 'esomeprazole'],
    severity: 'moderate',
    severityLabel: 'Moderate Hazard (Reduced Antiplatelet Bioactivation)',
    hazardIcon: '🟡',
    title: 'Clopidogrel + Omeprazole / Esomeprazole (Reduced Bioactivation)',
    summary:
      'Omeprazole inhibits CYP2C19, which is required to convert the prodrug clopidogrel into its active antiplatelet metabolite, potentially reducing antiplatelet efficacy and increasing ischaemic event risk.',
    mechanism: {
      type: 'pharmacokinetic',
      details:
        'Clopidogrel requires two-step hepatic bioactivation involving CYP2C19, CYP3A4, and CYP1A2. Strong inhibition of CYP2C19 by omeprazole significantly lowers circulating levels of active thiol metabolite and decreases platelet inhibition.',
      pathways: ['CYP2C19 Prodrug Bioactivation Blockade'],
    },
    clinicalAction:
      'AVOID OMEPRAZOLE / ESOMEPRAZOLE. When gastroprotection is required in a patient taking clopidogrel, switch to Lansoprazole (15-30mg) or Pantoprazole (20-40mg), or an H2RA such as Famotidine (20-40mg), which show substantially less CYP2C19 inhibition.',
    monitoring:
      'Ensure compliance with antiplatelet therapy. Check for symptoms of recurrent ischaemic events or GI discomfort.',
    alternatives: [
      'Switch PPI: Lansoprazole 30mg OD or Pantoprazole 20mg OD (MHRA approved alternatives with clopidogrel)',
      'Switch to H2RA: Famotidine 20-40mg OD',
    ],
    emisSnippet:
      'Prescribed Lansoprazole 30mg for gastroprotection in patient taking Clopidogrel. Omeprazole explicitly avoided to preserve CYP2C19-mediated clopidogrel antiplatelet activation.',
    references: [
      'MedicinesComplete: Stockley\'s Drug Interactions — Clopidogrel + Proton pump inhibitors',
      'MHRA Drug Safety Update: Clopidogrel and omeprazole — interaction warning',
    ],
  },
  {
    id: 'beta_blocker_verapamil_diltiazem',
    drugGroupA: ['bisoprolol', 'atenolol', 'propranolol', 'metoprolol', 'carvedilol', 'nebivolol'],
    drugGroupB: ['verapamil', 'diltiazem'],
    severity: 'severe',
    severityLabel: 'Severe Hazard (Severe Bradycardia / Complete Heart Block)',
    hazardIcon: '🟠',
    title: 'Beta-Blocker + Non-Dihydropyridine CCB (Verapamil / Diltiazem)',
    summary:
      'Additive negative inotropic and negative chronotropic effects on the Sinoatrial (SA) and Atrioventricular (AV) nodes. The combination can induce profound bradycardia, complete heart block, and cardiogenic shock.',
    mechanism: {
      type: 'pharmacodynamic',
      details:
        'Beta-blockers antagonize beta-1 adrenergic receptors, reducing calcium influx and cAMP. Verapamil/diltiazem directly block L-type calcium channels. Combined suppression of nodal conduction and myocardial contractility creates severe synergistic depression.',
      pathways: ['Additive AV Nodal Conduction Suppression', 'Negative Inotropy'],
    },
    clinicalAction:
      'DO NOT CO-PRESCRIBE. Verapamil with a beta-blocker is contraindicated. Diltiazem with a beta-blocker should generally be avoided in primary care. If rate-control or dual antihypertensive therapy is needed, combine the beta-blocker with a dihydropyridine CCB (Amlodipine or Felodipine) instead.',
    monitoring:
      'If inadvertently combined, perform immediate 12-lead ECG, monitor pulse rate and blood pressure, and prepare for urgent secondary care transfer if symptomatic.',
    alternatives: [
      'Antihypertensive alternative: Amlodipine 5-10mg OD (dihydropyridine CCB, does not suppress AV node)',
      'Rate-control alternative in AF: Digoxin added to beta-blocker under cardiology advice',
    ],
    emisSnippet:
      'Rx Review: Avoided co-prescribing Verapamil/Diltiazem with Bisoprolol due to extreme risk of complete AV block and severe bradycardia. Prescribed Amlodipine 5mg OD as safe calcium channel blocker alternative.',
    references: [
      'MedicinesComplete: Stockley\'s Drug Interactions — Beta-blockers + Calcium channel blockers',
      'BNF Beta-adrenoceptor blocking drugs monograph',
    ],
  },
  {
    id: 'quinolone_theophylline',
    drugGroupA: ['ciprofloxacin', 'norfloxacin'],
    drugGroupB: ['theophylline', 'aminophylline', 'uniphyllin', 'slo-phyllin'],
    severity: 'severe',
    severityLabel: 'Severe Hazard (Theophylline Neurotoxicity / Seizures)',
    hazardIcon: '🟠',
    title: 'Ciprofloxacin + Theophylline (Potent CYP1A2 Inhibition & Seizures)',
    summary:
      'Ciprofloxacin is a potent CYP1A2 inhibitor that decreases theophylline clearance by up to 60%, precipitating rapid theophylline toxicity: nausea, intractable vomiting, cardiac dysrhythmias, and status epilepticus.',
    mechanism: {
      type: 'pharmacokinetic',
      details:
        'Ciprofloxacin binds and inactivates CYP1A2, the primary hepatic isozyme clearing theophylline. Theophylline has a narrow therapeutic index (10-20 mg/L); elevated serum levels trigger CNS adenosine receptor blockade and phosphodiesterase inhibition.',
      pathways: ['CYP1A2 Inhibition', 'Narrow Therapeutic Index Toxicity'],
    },
    clinicalAction:
      'AVOID COMBINATION. Do not prescribe ciprofloxacin to patients taking theophylline or aminophylline. Select an alternative antibiotic class (e.g. Amoxicillin, Doxycycline, Cefalexin). If ciprofloxacin cannot be avoided, halve the theophylline dose and perform daily theophylline level monitoring.',
    monitoring:
      'Check serum theophylline level. Advise patient to immediately report nausea, agitation, palpitations, or muscle twitching.',
    alternatives: [
      'Antibiotic alternative for UTI: Nitrofurantoin 100mg BD or Pivmecillinam 400mg TDS',
      'Antibiotic alternative for respiratory: Amoxicillin 500mg TDS or Doxycycline 100mg OD',
    ],
    emisSnippet:
      'Rx Safety Alert: Ciprofloxacin avoided in patient on Theophylline due to potent CYP1A2 inhibition and severe seizure risk. Prescribed safe alternative antibiotic. Theophylline therapeutic range maintained.',
    references: [
      'Stockley\'s Drug Interactions: Fluoroquinolones + Theophylline',
      'BNF Ciprofloxacin / Theophylline interaction',
    ],
  },
];

/**
 * Normalizes user drug input string to lower case, removes dosage/forms, and maps UK brands to generic.
 */
export function normalizeDrugName(rawInput: string): string {
  if (!rawInput) return '';
  let cleaned = rawInput
    .toLowerCase()
    .trim()
    .replace(/\b(\d+(\.\d+)?\s*(mg|mcg|micrograms?|g|ml|tabs?|caps?|m\/r|sr|xl|modified release))\b/gi, '')
    .replace(/[^\w\s-]/g, '')
    .trim();

  // Check UK brand dictionary
  if (UK_BRAND_TO_GENERIC[cleaned]) {
    return UK_BRAND_TO_GENERIC[cleaned];
  }

  // Check partial brand names (e.g. "klacid 500mg" -> "klacid" -> "clarithromycin")
  for (const [brand, generic] of Object.entries(UK_BRAND_TO_GENERIC)) {
    if (cleaned.includes(brand)) {
      return generic;
    }
  }

  return cleaned;
}

/**
 * Evaluates a list of drugs against the pre-compiled Stockley's Knowledge Base.
 * Supports pairwise and triple interactions (like the "Triple Whammy").
 */
export function checkStockleysInteractions(rawDrugList: string[]): StockleyInteraction[] {
  if (!rawDrugList || rawDrugList.length < 2) return [];

  const normalizedList = rawDrugList
    .map(normalizeDrugName)
    .filter(Boolean);

  const matchedInteractions: StockleyInteraction[] = [];
  const matchedIds = new Set<string>();

  for (const interaction of STOCKLEYS_INTERACTIONS_DB) {
    // Check triple interaction (e.g. Triple Whammy)
    if (interaction.drugGroupC && interaction.drugGroupC.length > 0) {
      const matchA = normalizedList.some((drug) =>
        interaction.drugGroupA.some((target) => drug.includes(target) || target.includes(drug))
      );
      const matchB = normalizedList.some((drug) =>
        interaction.drugGroupB.some((target) => drug.includes(target) || target.includes(drug))
      );
      const matchC = normalizedList.some((drug) =>
        interaction.drugGroupC!.some((target) => drug.includes(target) || target.includes(drug))
      );

      if (matchA && matchB && matchC && !matchedIds.has(interaction.id)) {
        matchedInteractions.push(interaction);
        matchedIds.add(interaction.id);
      }
    } else {
      // Check pairwise interaction
      const matchA = normalizedList.some((drug) =>
        interaction.drugGroupA.some((target) => drug.includes(target) || target.includes(drug))
      );
      const matchB = normalizedList.some((drug) =>
        interaction.drugGroupB.some((target) => drug.includes(target) || target.includes(drug))
      );

      if (matchA && matchB && !matchedIds.has(interaction.id)) {
        matchedInteractions.push(interaction);
        matchedIds.add(interaction.id);
      }
    }
  }

  // Sort by severity: contraindicated > severe > moderate > minor
  const severityRank: Record<InteractionSeverity, number> = {
    contraindicated: 4,
    severe: 3,
    moderate: 2,
    minor: 1,
    none: 0,
  };

  return matchedInteractions.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
}
