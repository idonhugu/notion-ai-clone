const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.resolve(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const PARENT_HUB_ID = '74ae5917-c661-4e8e-b993-d9aa5052185f';

function makeHeading(text, level = 2) {
  return {
    id: crypto.randomUUID(),
    type: 'heading',
    props: {
      level,
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
      isToggleable: false,
    },
    content: [{ type: 'text', text, styles: {} }],
    children: [],
  };
}

function makeBullet(text) {
  return {
    id: crypto.randomUUID(),
    type: 'bulletListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [{ type: 'text', text, styles: {} }],
    children: [],
  };
}

function makeQuote(text) {
  return {
    id: crypto.randomUUID(),
    type: 'quote',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
    },
    content: [{ type: 'text', text, styles: {} }],
    children: [],
  };
}

function makeLinkParagraph(emoji, title, docId) {
  return {
    id: crypto.randomUUID(),
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      { type: 'text', text: `${emoji} `, styles: {} },
      {
        type: 'link',
        href: `/doc/${docId}`,
        content: [{ type: 'text', text: title, styles: { underline: true } }],
      },
    ],
    children: [],
  };
}

function buildClinicalBlocks(data) {
  const blocks = [];
  const sections = [
    { key: 'history', heading: '📋 History' },
    { key: 'examination', heading: '🩺 Examination' },
    { key: 'investigations', heading: '🔬 Investigations' },
    { key: 'differentials', heading: '🔀 Differentials' },
    { key: 'rare', heading: '🚩 Rare / not to miss' },
    { key: 'plan', heading: '💊 Plan' },
    { key: 'safetynetting', heading: '🔒 Safety-netting' },
    { key: 'followup', heading: '📅 Follow-up' },
    { key: 'referral', heading: '🚑 When to Refer' },
  ];

  for (const s of sections) {
    if (data[s.key] && data[s.key].length > 0) {
      blocks.push(makeHeading(s.heading, 2));
      for (const item of data[s.key]) {
        blocks.push(makeBullet(item));
      }
    }
  }

  blocks.push(
    makeQuote(
      data.footer ||
        '🇬🇧 NICE CKS-style · RCGP — Clinical Practice / Managing Complexity'
    )
  );

  return blocks;
}

// Full clinical dataset for all unlinked presentations
const newPresentations = [
  {
    letter: 'A',
    title: 'Actinic Keratosis',
    icon: '☀️',
    history: [
      'Chronic sun-exposed sites (face, scalp, forearms, dorsum of hands)',
      'Rough, scaly, sandpaper-like texture; intermittent flaking or tenderness',
      'Cumulative lifetime ultraviolet exposure, sunbed use, outdoor occupations',
      'Immunosuppression status (organ transplant recipients have ~250x increased SCC risk!)',
      'Personal or family history of skin malignancies (BCC, SCC, melanoma)',
    ],
    examination: [
      'Visual: erythematous, dry, rough, adherent hyperkeratotic or yellowish scaly macules/papules',
      'Palpation: often felt better than seen ("sandpaper" sensation)',
      'Assess for red flags of transformation to invasive Squamous Cell Carcinoma (SCC): induration, thickening, ulceration, bleeding, rapid growth, pain, diameter > 1cm',
      'Regional lymph node examination if lesion has suspicious induration',
    ],
    investigations: [
      'Clinical diagnosis with dermoscopy (rosette signs, strawberry pattern)',
      'Diagnostic skin punch or shave biopsy if suspicion of invasive Squamous Cell Carcinoma (SCC)',
    ],
    differentials: [
      'Invasive Squamous Cell Carcinoma (SCC) / Bowen disease (SCC in situ)',
      'Basal Cell Carcinoma (superficial / nodular)',
      'Seborrhoeic keratosis (stuck-on appearance, greasy scale)',
      'Discoid lupus erythematosus (follicular plugging, scarring)',
      'Viral warts',
    ],
    rare: [
      'Progression to invasive Cutaneous Squamous Cell Carcinoma (cSCC) with metastatic potential',
      'High-risk aggressive SCC in immunosuppressed patients',
      'Cutaneous horn overlying invasive malignancy',
    ],
    plan: [
      'Primary prevention: strict sun protection (SPF 50+, wide-brimmed hat, UV avoidance)',
      'Solitary / Few discrete lesions: Cryotherapy with liquid nitrogen (single freeze-thaw cycle 5–10s)',
      'Field change / Multiple lesions: Topical field therapy:',
      '  - Fluorouracil 5% cream (Efudix) OD/BD for 3–4 weeks (warn regarding inflammatory reaction)',
      '  - Fluorouracil 0.5% + salicylic acid 10% (Actikerall) OD for up to 12 weeks',
      '  - Imiquimod 3.75% or 5% cream (3 times weekly for 4 weeks)',
      '  - Diclofenac 3% gel in hyaluronate BD for 60–90 days (milder, well-tolerated)',
    ],
    safetynetting: [
      'Instruct patient to return immediately if any lesion grows rapidly, hardens, bleeds, ulcerates, or becomes persistently painful',
    ],
    followup: [
      'Review at 8–12 weeks post-treatment to evaluate clearance and assess for residual or recurrent lesions',
    ],
    referral: [
      'Urgent 2-Week-Wait Suspected Skin Cancer: lesion with induration, ulceration, rapid enlargement, or pain (suspected SCC)',
      'Routine Dermatology: extensive field change, organ transplant recipients, diagnostic uncertainty, failure of multiple topical therapies',
    ],
  },
  {
    letter: 'A',
    title: 'Ankle Oedema',
    icon: '💧',
    history: [
      'Onset and duration: sudden unilateral (DVT, cellulitis) vs bilateral gradual (systemic cause)',
      'Associated cardiovascular symptoms: dyspnoea on exertion, orthopnoea, PND, chest pain',
      'Associated systemic symptoms: jaundice, ascites, abdominal distension, frothy urine, weight gain',
      'Medication review: calcium channel blockers (amlodipine — classic cause!), NSAIDs, corticosteroids, pioglitazone, pregabalin/gabapentin',
      'VTE risk assessment: immobility, active cancer, recent surgery, long-haul flight',
    ],
    examination: [
      'Assess pitting vs non-pitting oedema; extent (ankles, mid-calf, thighs, sacrum)',
      'Unilateral vs bilateral symmetry; calf circumference measurement (> 3cm difference suggests DVT)',
      'Cardiovascular: elevated JVP, third heart sound, displaced apex beat, lung crackles',
      'Skin changes: stasis dermatitis, haemosiderin staining, lipodermatosclerosis, venous ulcers',
      'Signs of chronic liver disease (spider naevi, palmar erythema) or nephrotic syndrome',
    ],
    investigations: [
      'Urine dipstick: check for heavy proteinuria (nephrotic syndrome)',
      'Bloods: NT-proBNP (heart failure), U&E, eGFR (renal failure), LFTs, Albumin (< 25 g/L in nephrotic/liver), Thyroid function (hypothyroidism)',
      'D-dimer (if Wells score indicates DVT suspected)',
      'Compressive venous ultrasound (Doppler) for suspected unilateral DVT',
      'Echocardiogram if NT-proBNP elevated or clinical heart failure',
    ],
    differentials: [
      'Chronic venous insufficiency / venous stasis',
      'Congestive Heart Failure',
      'Drug-induced peripheral oedema (e.g. Amlodipine)',
      'Deep Vein Thrombosis (DVT)',
      'Cirrhosis / Hypoalbuminaemia',
      'Nephrotic Syndrome / Chronic Kidney Disease',
      'Lymphoedema (non-pitting, Stemmer sign positive)',
      'Myxoedema / severe hypothyroidism',
    ],
    rare: [
      'Acute massive iliofemoral DVT / Phlegmasia cerulea dolens',
      'Pelvic malignancy obstructing venous/lymphatic drainage',
      'Constrictive pericarditis',
      'Severe acute heart failure decompensation',
    ],
    plan: [
      'Drug-induced: switch amlodipine to ACEi/ARB or add low-dose ACEi (reduces precapillary dilation)',
      'Heart failure: loop diuretic (furosemide 20–40mg OD), refer to heart failure clinic',
      'Venous insufficiency: leg elevation above heart level when resting, graduated compression hosiery (class 1 or 2, provided ABPI > 0.8 confirmed)',
      'Weight reduction, regular walking, avoid prolonged static standing',
    ],
    safetynetting: [
      'Urgent medical review if sudden worsening breathlessness, chest pain, rapid unilateral calf swelling, severe redness, or skin breakdown occurs',
    ],
    followup: [
      'Review in 2–4 weeks after medication adjustment or diuretic initiation to recheck renal function and electrolytes',
    ],
    referral: [
      'Same-day Emergency: suspected acute DVT, acute decompensated heart failure, phlegmasia',
      'Urgent Outpatient Cardiology: elevated NT-proBNP (> 2000 ng/L within 2 weeks; 400-2000 within 6 weeks)',
      'Nephrology: persistent heavy proteinuria / suspected nephrotic syndrome',
    ],
  },
  {
    letter: 'A',
    title: 'Aphthous Mouth Ulcers',
    icon: '👄',
    history: [
      'Duration, recurrence frequency, number and size of ulcers; pain on eating/drinking',
      'Red flag duration: any solitary oral ulcer persisting > 3 weeks (rule out oral cancer!)',
      'Systemic symptoms: genital ulcers (Behçet disease), ocular inflammation, skin lesions (erythema nodosum), chronic diarrhoea / weight loss (IBD, coeliac)',
      'Triggers: mucosal trauma (sharp teeth/braces), stress, lack of sleep, hormonal changes, stopping smoking',
      'Medication: NSAIDs, nicorandil (notorious for intractable deep ulcers!), beta-blockers, methotrexate',
    ],
    examination: [
      'Careful inspection of entire oral cavity: lips, buccal mucosa, tongue, floor of mouth, palate, tonsils',
      'Morphology: minor aphthae (<10mm, round, yellow-grey floor, red halo, heals 7–14 days without scarring); major aphthae (>10mm, deep, ragged border, takes weeks to heal, scars); herpetiform (crops of tiny pinhead ulcers)',
      'Palpate ulcer base: check for induration, fixity, rolled everted edges (malignancy red flags)',
      'Cervical lymph node palpation for persistent or hard lymphadenopathy',
    ],
    investigations: [
      'Persistent or recurrent severe ulcers: FBC (anaemia/neutropenia), Serum Ferritin, B12, Folate',
      'Coeliac screen (anti-tTG IgA)',
      'ESR/CRP if systemic disease suspected',
      'Urgent incisional biopsy if ulcer persists > 3 weeks without healing',
    ],
    differentials: [
      'Recurrent Aphthous Stomatitis (RAS — idiopathic)',
      'Oral Squamous Cell Carcinoma (SCC)',
      'Nicorandil-induced ulceration',
      'Inflammatory Bowel Disease (Crohn disease / Ulcerative colitis)',
      'Coeliac disease',
      'Behçet disease (orogenital ulceration + uveitis)',
      'Herpes simplex virus (primary gingivostomatitis)',
      'Erythema multiforme / Pemphigus vulgaris',
    ],
    rare: [
      'Oral cavity squamous cell carcinoma',
      'Behçet disease with retinal vasculitis or neurological involvement',
      'Agranulocytosis / acute leukaemia presenting as necrotic mouth ulcers',
    ],
    plan: [
      'Symptomatic relief: antimicrobial mouthwash (Chlorhexidine 0.2% BD) to reduce secondary infection',
      'Topical analgesics: Benzydamine (Difflam) oral spray or mouthwash',
      'Topical corticosteroids: Hydrocortisone buccal tablets (Pellets) 2.5mg QDS dissolved against ulcer, or betamethasone soluble tablet 500mcg mouthwash',
      'Address predisposing factors: correct iron/B12/folate deficiencies, dental smoothing, SLS-free toothpaste',
      'Stop culprit drugs (e.g. switch nicorandil under cardiology guidance)',
    ],
    safetynetting: [
      'Advise patient to return immediately if ulcer fails to heal completely within 3 weeks, if an ulcer becomes indurated/hard, or if difficulty swallowing occurs',
    ],
    followup: [
      'Review in 3 weeks to verify complete healing of unexplained ulcers',
    ],
    referral: [
      'Urgent 2-Week-Wait Head & Neck Cancer Pathway: any unexplained solitary oral ulcer lasting > 3 weeks',
      'Oral Medicine / Rheumatology: severe major aphthous ulcers, or suspected Behçet disease / systemic vasculitis',
    ],
  },
  {
    letter: 'A',
    title: 'Asthma (Chronic Management)',
    icon: '🌬️',
    history: [
      'Symptom frequency: daytime symptoms, nighttime waking with wheeze/cough, limitation of daily activities, exercise-induced asthma',
      'Reliever use: how many times per week is the SABA (blue inhaler) needed? (> 2 times/week indicates poor control!)',
      'Exacerbation history: courses of oral steroids or hospital admissions in the past 12 months',
      'Inhaler technique and treatment adherence review (up to 70% of poor control is due to poor technique!)',
      'Triggers and environmental factors: smoking/vaping, pets, occupational dusts/chemicals, NSAID sensitivity, rhinitis, GORD, cold air',
    ],
    examination: [
      'Chest auscultation: normal at rest between attacks, or polyphonic expiratory wheeze',
      'Upper respiratory tract: allergic rhinitis, nasal polyps (Samter triad: asthma, nasal polyps, aspirin sensitivity)',
      'Observe patient’s inhaler technique directly using their own device and spacer',
    ],
    investigations: [
      'Peak Expiratory Flow (PEF): measure in clinic; assess diurnal variability on home PEF diary (> 20% variability supports asthma)',
      'Fractional Exhaled Nitric Oxide (FeNO): ≥ 40 ppb in adults supports eosinophilic airway inflammation (NICE NG80)',
      'Spirometry with bronchodilator reversibility: FEV1/FVC < 70% with improvement of ≥ 12% and ≥ 200 mL post-bronchodilator',
    ],
    differentials: [
      'Chronic Obstructive Pulmonary Disease (COPD / Asthma-COPD Overlap)',
      'Inducible laryngeal obstruction (vocal cord dysfunction)',
      'Bronchiectasis',
      'Gastro-oesophageal reflux disease (GORD)',
      'Heart failure / cardiac asthma',
      'Chronic persistent cough / allergic rhinitis',
    ],
    rare: [
      'Allergic Bronchopulmonary Aspergillosis (ABPA)',
      'Eosinophilic Granulomatosis with Polyangiitis (EGPA / Churg-Strauss)',
      'Tracheobronchial tumour or foreign body',
    ],
    plan: [
      'Stepwise Management (NICE & BTS/SIGN guidelines):',
      '  - Step 1: Low-dose Inhaled Corticosteroid (ICS) + SABA as needed (or MART regimen)',
      '  - Step 2: Add Leukotriene Receptor Antagonist (LTRA — montelukast 10mg OD) to low-dose ICS',
      '  - Step 3: Add Long-Acting Beta Agonist (LABA) in combination inhaler; consider MART (Maintenance and Reliever Therapy e.g. Fostair / Symbicort)',
      '  - Step 4: Increase ICS to moderate dose, or add LAMA (tiotropium)',
      'Provide personalised Written Asthma Action Plan (PAAP)',
      'Annual influenza vaccination and COVID boosters; smoking cessation support',
    ],
    safetynetting: [
      'Recognise worsening asthma: increased reliever use, waking at night, PEF falling below 75%; seek urgent emergency medical attention (999) if breathless at rest, unable to speak, or PEF < 50%',
    ],
    followup: [
      'Review at 4–8 weeks after any treatment initiation or step-change',
      'Routine annual asthma review with practice nurse for all stable patients',
    ],
    referral: [
      'Severe / Difficult Asthma Clinic: diagnostic doubt, persistently poorly controlled asthma at Step 4/5 for consideration of biologic therapy (mepolizumab, benralizumab, dupilumab)',
      'Occupational Health: suspected occupational asthma (symptoms improve when away from work)',
    ],
  },
  {
    letter: 'A',
    title: 'Atrial Fibrillation',
    icon: '❤️',
    history: [
      'Presentation: asymptomatic (incidental irregular pulse) vs symptomatic (palpitations, fatigue, breathlessness, dizziness, chest discomfort, syncope)',
      'Pattern: Paroxysmal (self-terminating < 7 days), Persistent (> 7 days or requires cardioversion), Permanent (accepted rhythm)',
      'Precipitating triggers: alcohol ("holiday heart"), acute infection/sepsis, caffeine, hyperthyroidism, sleep apnoea, pulmonary embolism',
      'Comorbidities: hypertension, ischaemic heart disease, heart failure, valvular heart disease, diabetes, previous stroke/TIA',
    ],
    examination: [
      'Radial pulse: irregularly irregular rhythm and pulse deficit (difference between apical HR and peripheral pulse)',
      'Vital signs: heart rate, blood pressure, respiratory rate, SpO2',
      'Signs of heart failure: elevated JVP, pulmonary crackles, hepatomegaly, ankle oedema',
      'Heart murmurs: especially mitral stenosis or regurgitation (valvular AF)',
      'Thyroid examination: goitre, tremor, exophthalmos',
    ],
    investigations: [
      '12-lead ECG: mandatory — absence of P waves, irregular RR intervals, fine fibrillatory baseline',
      'Bloods: Thyroid function tests (TSH/FT4), FBC, U&E, eGFR, LFTs, HbA1c',
      'Transthoracic Echocardiogram (TTE): assess left atrial enlargement, left ventricular function, and valvular heart disease',
      'Calculate Stroke Risk: CHA2DS2-VASc score',
      'Calculate Bleeding Risk: ORBIT score (NICE preferred) or HAS-BLED score',
    ],
    differentials: [
      'Atrial Flutter with variable conduction',
      'Multiple ventricular or atrial ectopics (extrasystoles)',
      'Sinus arrhythmia',
      'Multifocal atrial tachycardia (MAT)',
      'Supraventricular tachycardia (SVT)',
    ],
    rare: [
      'Acute cardioembolic ischemic stroke / TIA (AF increases stroke risk 5-fold!)',
      'Tachycardia-induced cardiomyopathy',
      'Pre-excited AF with accessory pathway (Wolff-Parkinson-White syndrome — AV nodal blockers contraindicated!)',
      'Underlying atrial myxoma or thyrotoxic crisis',
    ],
    plan: [
      '1. Anticoagulation (Stroke Prevention):',
      '  - Offer DOAC (Apixaban, Rivaroxaban, Edoxaban, or Dabigatran) if CHA2DS2-VASc ≥ 2 in men or ≥ 3 in women (consider if score = 1 in men)',
      '  - Warfarin is mandatory ONLY if mechanical heart valve or moderate-severe mitral stenosis',
      '2. Rate Control (First-line for most stable patients):',
      '  - Standard monotherapy: Beta-blocker (bisoprolol 2.5–10mg OD) OR rate-limiting calcium channel blocker (diltiazem or verapamil)',
      '  - Digoxin preferred only in sedentary patients or combined with beta-blocker in heart failure',
      '3. Rhythm Control (Cardioversion / Antiarrhythmic):',
      '  - Indicated if new-onset AF < 48 hours, young, highly symptomatic despite rate control, or heart failure precipitated by AF',
    ],
    safetynetting: [
      'FAST stroke symptoms advice (Face, Arms, Speech, Time); seek emergency 999 care immediately',
      'Bleeding precautions on anticoagulation: report black tarry stools, unusual bruising, haematuria, or major trauma',
    ],
    followup: [
      'Review at 1–2 weeks to verify rate control (target resting HR < 100–110 bpm) and DOAC tolerability',
      'Annual review of renal function, CHA2DS2-VASc, and bleeding risk scores',
    ],
    referral: [
      'Same-day Emergency Admission: haemodynamically unstable AF (hypotension, pulmonary oedema, syncope, acute chest pain), or acute stroke',
      'Cardiology Referral: new AF suitable for rhythm control/cardioversion, structural/valvular heart disease, failure of rate control, catheter ablation consideration',
    ],
  },
  {
    letter: 'B',
    title: 'Bell’s Palsy',
    icon: '⚡',
    history: [
      'Sudden onset (typically reaches peak within 72 hours) unilateral facial muscle weakness',
      'Inability to close eye, drooping mouth, drooling, flattened nasolabial fold',
      'Associated symptoms: retroauricular pain / ache behind ear, hyperacusis (loud noise sensitivity from stapedius palsy), loss of taste on anterior 2/3 of tongue, altered sensation (heaviness)',
      'Red flag exclusions: spared forehead wrinkling (indicates Upper Motor Neuron / stroke lesion!), other cranial neuropathies, limb weakness, gradual onset over weeks, facial numbness, ear vesicles',
    ],
    examination: [
      'Cranial Nerve VII Motor Exam: raise eyebrows/wrinkle forehead, close eyes tightly against resistance, show teeth, puff out cheeks, whistle',
      'CRITICAL DISTINCTION: Bell’s palsy is Lower Motor Neuron (LMN) — complete forehead paralysis. Stroke is Upper Motor Neuron (UMN) — forehead is spared due to bilateral cortical innervation!',
      'Bell phenomenon: upward and outward eye roll on attempted eyelid closure',
      'Otoscopy: examine external ear canal and tympanic membrane for vesicles (Ramsay Hunt syndrome / herpes zoster oticus)',
      'Parotid gland palpation (exclude parotid tumour compressive facial palsy)',
      'Complete neurological exam: other cranial nerves, limb power and speech must be completely normal',
    ],
    investigations: [
      'Clinical diagnosis if typical acute unilateral LMN facial palsy without other neurological signs',
      'Check blood glucose / HbA1c (higher incidence in diabetics)',
      'Lyme disease serology if endemic area or history of tick bite',
      'MRI Brain / Internal Auditory Meatus if progressive weakness > 3 weeks, no recovery at 6–8 weeks, or atypical features',
    ],
    differentials: [
      'Stroke / Transient Ischaemic Attack (UMN: forehead spared, limb weakness, speech disturbance)',
      'Ramsay Hunt syndrome (Herpes Zoster Oticus: severe ear pain, vesicles in canal/pinna, sensorineural hearing loss)',
      'Lyme disease (Borreliosis — may cause bilateral facial palsy)',
      'Parotid gland malignancy',
      'Acoustic neuroma / Cholesteatoma',
      'Multiple sclerosis',
      'Sarcoidosis (Heerfordt syndrome: uveoparotid fever)',
    ],
    rare: [
      'Severe corneal ulceration / exposure keratitis due to incomplete eye closure (risk of permanent visual loss!)',
      'Parotid carcinoma infiltrating facial nerve',
      'Guillain-Barré syndrome (Miller Fisher variant)',
    ],
    plan: [
      '1. Oral Corticosteroids (NICE & SIGN):',
      '  - Prescribe within 72 hours of symptom onset: Oral Prednisolone 50mg daily for 10 days (or 60mg for 5 days then tapered by 10mg/day)',
      '  - Routine addition of antivirals is not recommended for simple Bell’s palsy (unless Ramsay Hunt suspected: oral valaciclovir 1g TDS + prednisolone)',
      '2. Eye Care (PARAMOUNT TO PREVENT BLINDNESS):',
      '  - Preservative-free lubricating eye drops (artificial tears) hourly during the day',
      '  - Lubricating ointment (e.g. Lacri-Lube or simple eye ointment) at bedtime',
      '  - Tape eyelid closed with micropore tape at night; sunglasses outside',
    ],
    safetynetting: [
      'Urgent same-day eye review if eye becomes painful, red, photophobic, or vision becomes blurred',
      'Return immediately if new limb weakness, numbness, speech difficulties, or confusion occurs',
    ],
    followup: [
      'Review at 1 week to inspect cornea and verify eye protection compliance',
      'Review at 3–4 weeks to monitor recovery (70–80% achieve full spontaneous recovery within 3–9 months)',
    ],
    referral: [
      'Immediate Emergency / Stroke Pathway: any forehead sparing, limb weakness, dysarthria, or ataxia',
      'Same-day Ophthalmology: corneal exposure keratitis or severe lagophthalmos',
      'ENT / Neurology Referral: no sign of recovery after 6–8 weeks, recurrent palsy, or diagnostic doubt',
    ],
  },
  {
    letter: 'B',
    title: 'Benign Prostatic Hyperplasia (BPH / LUTS)',
    icon: '💧',
    history: [
      'Lower Urinary Tract Symptoms (LUTS):',
      '  - Voiding / Obstructive: hesitancy, weak stream, intermittency, straining, terminal dribbling',
      '  - Storage / Irritative: frequency, urgency, nocturia (≥ 2 times/night), urge incontinence',
      '  - Post-micturition: sensation of incomplete bladder emptying',
      'Symptom scoring: International Prostate Symptom Score (IPSS) and Quality of Life impact',
      'Fluid intake pattern, caffeine, alcohol, evening fluid consumption',
      'Red flags: visible haematuria, recurrent UTIs, bone/back pain, palpable bladder, unexplained weight loss',
    ],
    examination: [
      'Abdominal examination: palpate and percuss for palpable distended urinary bladder (chronic retention)',
      'Digital Rectal Examination (DRE): size, contour, consistency, symmetry; smooth firm enlarged prostate vs hard, craggy, nodular, asymmetrical prostate (suspected prostate cancer)',
      'External genitalia inspection: meatal stenosis, phimosis',
    ],
    investigations: [
      'Urinalysis (dipstick): exclude infection, glycosuria, and microscopic haematuria',
      'Serum PSA (Prostate-Specific Antigen): counsel on pros/cons before testing (avoid if active UTI, ejaculation < 48h, catheter, vigorous cycling)',
      'Serum Creatinine / eGFR: check renal function if chronic retention or hydronephrosis suspected',
      'Frequency-Volume Chart (Bladder diary) for at least 3 days',
      'Post-void residual bladder scan if available in community',
    ],
    differentials: [
      'Prostate Cancer (adenocarcinoma)',
      'Urinary Tract Infection (UTI) / Acute or chronic prostatitis',
      'Overactive Bladder (OAB)',
      'Urethral stricture',
      'Neurogenic bladder (diabetic autonomic neuropathy, cord compression)',
      'Nocturnal polyuria (congestive heart failure, obstructive sleep apnoea)',
    ],
    rare: [
      'Acute urinary retention (sudden painful inability to void — requires emergency catheterisation)',
      'Chronic high-pressure urinary retention causing bilateral hydronephrosis and renal failure',
      'Advanced metastatic prostate cancer presenting with spinal cord compression',
    ],
    plan: [
      'Conservative / Lifestyle: fluid management, reduce evening drinks, cut caffeine and alcohol, bladder retraining, double voiding',
      'Moderate to Severe Voiding Symptoms:',
      '  - 1st-line: Alpha-1 blocker (Tamsulosin 400mcg OD or Alfuzosin 10mg OD) — rapid onset (days); warn about postural hypotension and floppy iris syndrome during cataract surgery',
      'Enlarged Prostate (> 30g / PSA > 1.4 ng/mL) or High Progression Risk:',
      '  - 5-alpha reductase inhibitor (Finasteride 5mg OD or Dutasteride 0.5mg OD) — takes 6 months to shrink prostate by 20–30%; halves PSA level; discuss sexual side effects',
      'Combination therapy (Tamsulosin + Finasteride) for severe symptoms and enlarged gland',
      'Persistent storage / urgency symptoms: add bladder anticholinergic (solifenacin) or beta-3 agonist (mirabegron) once post-void residual < 100mL',
    ],
    safetynetting: [
      'Seek urgent emergency care if sudden complete inability to pass urine (acute urinary retention), severe lower abdominal pain, high fever, or visible blood in urine occurs',
    ],
    followup: [
      'Review at 4–6 weeks after starting alpha-blocker; review at 3–6 months for 5-ARI therapy',
      'Annual review of IPSS score and PSA monitoring',
    ],
    referral: [
      'Urgent 2-Week-Wait Urology: elevated age-specific PSA or hard/nodular prostate on DRE',
      'Same-day Emergency: acute urinary retention, or chronic retention with renal impairment (creatinine rise)',
      'Routine Urology: refractory LUTS despite combination medical therapy, bladder stones, recurrent UTIs',
    ],
  },
  {
    letter: 'B',
    title: 'Breast Lump',
    icon: '🍈',
    history: [
      'Onset, duration, rapid growth vs stable; relationship to menstrual cycle (cyclical changes suggest fibroadenoma/cysts)',
      'Associated symptoms: nipple discharge (spontaneous, unilateral, blood-stained vs bilateral milky/clear), nipple retraction or inversion, skin tethering/dimpling, localized breast pain',
      'Risk factors: age (incidence rises steeply > 50 years), personal history of breast cancer or benign disease, family history (first-degree relatives, BRCA1/2, young age < 50 at diagnosis)',
      'Reproductive / Hormonal: early menarche, late menopause, nulliparity, older age at first live birth, HRT or oral contraceptive use',
    ],
    examination: [
      'Chaperone must be present and documented',
      'Inspection: sitting with arms at sides, arms raised above head, and hands pressed on hips:',
      '  - Symmetry, contour contour deformities, visible lump, skin dimpling (peau d’orange), erythema, nipple retraction, Paget disease of nipple (eczematous changes)',
      'Palpation: patient supine with ipsilateral hand behind head; systematically palpate all 4 quadrants, axillary tail (Spence), and retroareolar tissue with pads of fingers:',
      '  - Size, shape, consistency (hard, firm, rubbery, soft), mobility (fixed to skin or underlying pectoralis muscle), tenderness',
      'Lymph node assessment: bilateral axillary, supraclavicular, and infraclavicular nodes',
    ],
    investigations: [
      'Triple Assessment (gold standard in Rapid Access Breast Clinic):',
      '  1. Clinical examination',
      '  2. Imaging: Mammography (women ≥ 40 years) and/or Ultrasound (women < 40 years or dense breast tissue)',
      '  3. Pathology: Core needle biopsy or fine needle aspiration (FNA)',
    ],
    differentials: [
      'Fibroadenoma ("breast mouse" — firm, smooth, highly mobile, nontender, typically women < 30)',
      'Breast Cyst (smooth, fluctuant, tender, often perimenopausal)',
      'Fibrocystic change (lumpy, bilateral, cyclical breast tenderness)',
      'Invasive Breast Carcinoma (Ductal / Lobular)',
      'Fat necrosis (history of trauma, surgery, or radiotherapy)',
      'Breast abscess / mastitis (erythema, warmth, systemic fever, lactation)',
      'Lipoma / Galactocele',
    ],
    rare: [
      'Inflammatory Breast Cancer (rapidly spreading erythema, oedema, peau d’orange mimicking mastitis, without distinct lump)',
      'Paget disease of the nipple (persistent unilateral eczema-like crusted lesion of nipple/areola representing underlying DCIS)',
      'Phyllodes tumour (large, rapidly growing fibroepithelial tumour with malignant potential)',
    ],
    plan: [
      'All unexplained breast lumps in patients aged ≥ 30 require immediate referral to a specialist One-Stop Breast Clinic under NICE guidelines',
      'Reassure young women (< 30) only if classic cyclical lumpy breast tissue; re-examine post-menses',
      'Do not aspirate breast cysts in primary care unless specialist trained and cytology pathway established',
    ],
    safetynetting: [
      'Advise patient regarding urgent 2WW appointment timeframe (usually within 14 days); instruct to contact surgery if appointment letter is not received within 1 week',
      'Advise to report any new skin tethering, nipple retraction, or bleeding immediately',
    ],
    followup: [
      'Review in practice after specialist clinic appointment to review histology results, support patient, and ensure treatment plan is clear',
    ],
    referral: [
      'Urgent 2-Week-Wait Suspected Breast Cancer Pathway (NICE NG12):',
      '  - Aged ≥ 30 with unexplained breast lump with or without pain',
      '  - Aged ≥ 50 with unilateral nipple discharge, retraction, or changes of concern',
      '  - Skin changes suggestive of breast cancer (dimpling, peau d’orange)',
      '  - Aged ≥ 40 with unexplained axillary lymphadenopathy',
    ],
  },
  {
    letter: 'B',
    title: 'Burns (Minor)',
    icon: '🔥',
    history: [
      'Mechanism of burn: thermal (scald, contact, flame), chemical (acid, alkali), electrical, friction, or radiation/sunburn',
      'Time elapsed since injury; immediate first-aid applied (cold water duration)',
      'Enclosed space exposure, smoke inhalation, loss of consciousness (inhalation injury risk)',
      'Tetanus vaccination status, medical comorbidities (diabetes, peripheral vascular disease)',
      'Vulnerable patients / safeguarding: children, elderly, non-accidental injury signs (scald immersion lines, cigarette burns, delay in presentation)',
    ],
    examination: [
      'Estimate Burn Depth (Jackson burn wound zones):',
      '  - Superficial (1st degree): erythema, dry, painful, no blisters (e.g. sunburn); capillary refill brisk',
      '  - Superficial Partial-Thickness (superficial dermal): pale pink, moist, blisters, very painful; brisk capillary refill',
      '  - Deep Partial-Thickness (deep dermal): blotchy red/white, dry, reduced sensation; sluggish/absent refill',
      '  - Full Thickness (3rd degree): leathery, white/charred/brown, dry, completely painless; absent refill',
      'Estimate Total Body Surface Area (% TBSA): use Rule of Nines or Patient’s Palmar Surface (= ~1% TBSA including fingers)',
      'Critical Anatomical Locations: face, neck, hands, feet, perineum, genitalia, or over major flexural joints',
      'Circumferential burns of limbs, chest, or neck (risk of compartment syndrome / respiratory compromise!)',
    ],
    investigations: [
      'Clinical assessment for minor burns in primary care',
      'Wound swab for microscopy, culture & sensitivity ONLY if clinical signs of secondary infection (purulence, cellulitis, malodour)',
    ],
    differentials: [
      'Scalded skin syndrome (Staphylococcal SSS)',
      'Toxic Epidermal Necrolysis (TEN) / Stevens-Johnson syndrome (SJS)',
      'Contact dermatitis / Chemical burn',
      'Bullous pemphigoid',
      'Child physical abuse / non-accidental injury',
    ],
    rare: [
      'Inhalation injury / acute upper airway oedema from thermal burn or smoke',
      'Burn sepsis / toxic shock syndrome',
      'Circumferential burn with limb ischemia (requires urgent escharotomy)',
      'Hypovolaemic burn shock (>10% TBSA in children, >15% in adults)',
    ],
    plan: [
      'Immediate First Aid: cool running tap water for 20 minutes (effective up to 3 hours post-burn); keep patient warm (prevent hypothermia!)',
      'Analgesia: Paracetamol, Ibuprofen, or oral weak opioid (Codeine) 30 minutes before dressing',
      'Blister management: de-roof thin, tense, or large blisters (> 1cm) or over joints under aseptic technique; leave small intact blisters alone',
      'Dressing: non-adherent silicone/foam dressing (e.g. Mepitel, UrgoTul) covered with absorbent gauze, or paraffin gauze (Jelonet); cling film (applied longitudinally, NOT wrapped circumferentially) for initial transfer',
      'Tetanus booster if indicated; routine prophylactic antibiotics are NOT indicated',
    ],
    safetynetting: [
      'Advise patient to seek urgent care if burn develops expanding redness, severe increasing pain, purulent discharge, bad odour, fever, or red streaks',
    ],
    followup: [
      'Wound check and redressing at 48 hours, then every 3–5 days until healed (minor superficial burns should heal within 10–14 days)',
    ],
    referral: [
      'Immediate Transfer to Burns Centre / A&E:',
      '  - Suspected airway or inhalation injury',
      '  - All deep partial-thickness or full-thickness burns',
      '  - Superficial dermal burns > 3% TBSA in children, or > 5% in adults',
      '  - Burns involving face, hands, feet, perineum, or flexural joints',
      '  - Circumferential burns',
      '  - Chemical or high-voltage electrical burns',
      '  - Suspicion of non-accidental injury',
    ],
  },
  {
    letter: 'C',
    title: 'Cellulitis',
    icon: '🦠',
    history: [
      'Rapidly spreading localized skin erythema, warmth, oedema, and tenderness (typically unilateral, lower limb most common)',
      'Systemic symptoms: fever, chills, rigors, malaise, nausea, confusion (screen for SEPSIS!)',
      'Portal of entry: tinea pedis (athlete’s foot between toes — crucial to examine!), skin laceration, insect bite, leg ulcer, eczema',
      'Predisposing risk factors: chronic lymphoedema, obesity, diabetes mellitus, peripheral vascular disease, previous cellulitis episodes',
    ],
    examination: [
      'Vital signs: temperature, HR, BP, RR, SpO2 (calculate NEWS2 score)',
      'Skin inspection: demarcated erythema, warmth, swelling, induration; mark the advancing edge with a surgical pen to monitor progression',
      'Assess for complications: blistering, bullae, skin necrosis, crepitus (gas in tissues), fluctuance (abscess)',
      'Web-space inspection between toes for fungal maceration / tinea pedis',
      'Regional lymphadenopathy and ascending lymphangitic streaking',
    ],
    investigations: [
      'Clinical diagnosis in primary care; routine wound swabs or blood tests not required for mild community cellulitis',
      'FBC, CRP, U&E, blood cultures if systemically unwell or admitted',
      'Venous duplex ultrasound if deep vein thrombosis cannot be differentiated',
    ],
    differentials: [
      'Deep Vein Thrombosis (DVT — calf pain, swelling, lack of intense superficial heat/demarcated redness)',
      'Stasis dermatitis / bilateral chronic venous eczema (bilateral, chronic, non-tender, afebrile)',
      'Superficial thrombophlebitis (palpable cord-like tender vein)',
      'Contact dermatitis / Insect bite reaction',
      'Gout (joint-centered, exquisitely painful)',
      'Erythema nodosum (tender pretibial nodules)',
    ],
    rare: [
      'Necrotising Fasciitis (surgical emergency: pain out of proportion to exam findings, rapid progression, dusky purple discoloration, crepitus, blistering, bullae, shock)',
      'Severe systemic sepsis / Septic shock',
      'Orbital cellulitis (in periorbital cases: proptosis, ophthalmoplegia, visual reduction)',
    ],
    plan: [
      'Antibiotic Treatment for Mild Uncomplicated Community Cellulitis (NICE NG141):',
      '  - 1st-line: Oral Flucloxacillin 500mg to 1g QDS for 5 to 7 days',
      '  - Penicillin allergy (mild/non-severe): Oral Clarithromycin 500mg BD for 5 to 7 days, or Doxycycline 100mg BD',
      '  - Penicillin allergy (severe/anaphylaxis): Oral Clarithromycin or Erythromycin',
      'Leg elevation above hip level when resting to facilitate lymphatic drainage',
      'Treat underlying portal of entry (e.g. topical terbinafine 1% cream for interdigital tinea pedis)',
      'Analgesia (paracetamol / ibuprofen); continue treatment for full duration',
    ],
    safetynetting: [
      'Warn patient: redness may continue to expand slightly during the first 24–48 hours before receding',
      'Seek emergency hospital care immediately if redness spreads rapidly past marked lines, blistering/blackening of skin occurs, severe worsening pain develops, or fever/shaking/confusion starts',
    ],
    followup: [
      'Clinical review in 48 hours if not improving or if diagnosis uncertain',
    ],
    referral: [
      'Same-day Emergency Hospital Admission:',
      '  - Signs of sepsis (tachycardia, tachypnoea, hypotension, rigors, confusion)',
      '  - Suspicion of necrotising fasciitis (pain out of proportion, purple skin, crepitus)',
      '  - Facial or orbital cellulitis',
      '  - Rapidly spreading infection failing oral antibiotic therapy',
      '  - Vulnerable / immunosuppressed patients or inability to tolerate oral fluids/medications',
    ],
  },
  {
    letter: 'C',
    title: 'Chronic Kidney Disease (CKD)',
    icon: '𫘘',
    history: [
      'Often completely asymptomatic in early stages (Stages 1–3); detected on routine blood monitoring',
      'Advanced uraemic symptoms (Stages 4–5): fatigue, lethargy, anorexia, nausea, metallic taste, pruritus, restless legs, dyspnoea, peripheral oedema, nocturia',
      'Underlying risk factors: hypertension, diabetes mellitus, cardiovascular disease, family history of end-stage renal disease, recurrent AKI episodes',
      'Medication history: nephrotoxic drugs (NSAIDs — crucial to review!), aminoglycosides, lithium, calcineurin inhibitors, proton pump inhibitors',
    ],
    examination: [
      'Blood pressure: target < 140/90 mmHg (or < 130/80 mmHg if ACR ≥ 70 mg/mmol or in diabetes)',
      'Fluid volume status: peripheral ankle oedema, sacral oedema, elevated JVP, pulmonary crackles (fluid overload)',
      'Skin: uraemic pallor, pruritic excoriations, bruising',
      'Cardiovascular exam: heart murmurs, signs of left ventricular hypertrophy',
      'Fundoscopy: hypertensive or diabetic retinopathy',
      'Palpate abdomen: enlarged polycystic kidneys, palpable bladder (obstructive uropathy)',
    ],
    investigations: [
      'eGFR (estimated Glomerular Filtration Rate from serum creatinine): confirmed CKD requires 2 separate tests at least 3 months apart showing eGFR < 60 mL/min/1.73m²',
      'Urine Albumin:Creatinine Ratio (ACR) on early morning specimen:',
      '  - A1: Normal to mildly increased (< 3 mg/mmol)',
      '  - A2: Moderately increased (3–30 mg/mmol — microalbuminuria)',
      '  - A3: Severely increased (> 30 mg/mmol — macroalbuminuria / high renal risk)',
      'Renal tract ultrasound: assess kidney size, symmetry, echogenicity, rule out urinary tract obstruction',
      'Bloods: FBC (normocytic anaemia of renal disease), Serum Calcium, Phosphate, Alkaline Phosphatase, PTH (renal bone disease), HbA1c',
    ],
    differentials: [
      'Acute Kidney Injury (AKI) or AKI superimposed on CKD',
      'Diabetic Nephropathy',
      'Hypertensive Nephrosclerosis',
      'Glomerulonephritis (IgA nephropathy, membranous, minimal change)',
      'Autosomal Dominant Polycystic Kidney Disease (ADPKD)',
      'Chronic tubulointerstitial nephritis / analgesic nephropathy',
      'Obstructive uropathy (prostate enlargement, pelvic mass)',
    ],
    rare: [
      'Rapidly Progressive Glomerulonephritis (RPGN / ANCA vasculitis / anti-GBM Goodpasture disease)',
      'Myeloma cast nephropathy (multiple myeloma presenting as unexplained acute/subacute renal failure)',
      'Severe hyperkalaemia (K+ > 6.5 mmol/L) with fatal cardiac arrhythmias',
    ],
    plan: [
      '1. Renoprotection & Blood Pressure Control (NICE NG203):',
      '  - First-line: ACE inhibitor (e.g. Ramipril) or ARB (e.g. Losartan) titrated to maximum tolerated dose if ACR ≥ 30 mg/mmol (or ACR ≥ 3 in diabetes)',
      '  - SGLT2 Inhibitor (Dapagliflozin 10mg OD or Empagliflozin 10mg OD): offers marked renal and cardiovascular protection in patients with CKD and ACR ≥ 22.6 mg/mmol (NICE TA775)',
      '2. Cardiovascular Risk Reduction: Atorvastatin 20mg OD for primary prevention (CKD is an independent CV risk equivalent); target BP < 130/80',
      '3. Lifestyle: smoking cessation, dietary sodium restriction (< 2g/day), weight management',
      '4. Medication safety: avoid NSAIDs; advise "Sick Day Rules" (temporarily withhold ACEi/ARB, diuretics, SGLT2i, metformin, NSAIDs during dehydrating illness)',
    ],
    safetynetting: [
      'Emergency advice: seek immediate medical care if severe shortness of breath, chest pain, confusion, vomiting, or muscle weakness develops',
    ],
    followup: [
      'Recheck eGFR and Potassium at 1–2 weeks after starting or up-titrating an ACEi/ARB (an eGFR drop up to 25–30% or serum creatinine rise up to 30% is acceptable)',
      'Routine monitoring: Stage G3: 6-monthly; Stage G4: 3-monthly; Stage G5: monthly to 6-weekly',
    ],
    referral: [
      'Same-day Emergency Admission: severe hyperkalaemia (K+ ≥ 6.5), pulmonary oedema, symptomatic severe uraemia',
      'Urgent Nephrology Referral:',
      '  - eGFR < 30 mL/min/1.73m² (Stage G4 or G5)',
      '  - Accelerated CKD progression (sustained decrease in eGFR ≥ 25% or ≥ 15 mL/min within 12 months)',
      '  - Persistent significant proteinuria (ACR ≥ 70 mg/mmol) unless known diabetic under established care',
      '  - Resistant hypertension on 4 antihypertensive agents',
      '  - Suspected systemic disease or glomerulonephritis (haematuria + proteinuria)',
    ],
  },
  {
    letter: 'C',
    title: 'Coeliac Disease',
    icon: '🍞',
    history: [
      'Gastrointestinal symptoms: chronic or intermittent diarrhoea, steatorrhoea, abdominal cramping, bloating, nausea, flatulence, altered bowel habit (sometimes constipation)',
      'Systemic features: chronic unexplained fatigue, profound lethargy, unintended weight loss, mouth ulcers, iron deficiency anaemia unresponsive to oral iron',
      'Associated autoimmune conditions: Type 1 diabetes, autoimmune thyroiditis, Down syndrome, Turner syndrome',
      'Family history: first-degree relative with coeliac disease (1 in 10 risk!)',
      'Crucial dietary check: patient MUST BE ON A GLUTEN-CONTAINING DIET (at least 1 meal containing gluten daily for 6 weeks) before diagnostic testing, otherwise antibodies will be falsely negative!',
    ],
    examination: [
      'General nutritional status: body mass index, muscle wasting, subcutaneous fat loss',
      'Pallor (iron or folate deficiency anaemia), glossitis, angular stomatitis, aphthous mouth ulcers',
      'Abdominal examination: distension, borborygmi, tympany on percussion, diffuse mild tenderness',
      'Skin examination: Dermatitis Herpetiformis (intensely pruritic symmetrical papulovesicular eruption over elbows, knees, buttocks, and scalp)',
    ],
    investigations: [
      'First-line serology: Total serum IgA AND IgA Tissue Transglutaminase antibody (anti-tTG IgA)',
      'If Total IgA is deficient: test IgG tissue transglutaminase (anti-tTG IgG) or IgG deamidated gliadin peptide (DGP IgG)',
      'FBC (microcytic or macrocytic anaemia), Ferritin, B12, Folate, U&E, LFT, Bone profile, Vitamin D, Thyroid function',
      'Confirmatory test: Oesophagogastroduodenoscopy (OGD) with multiple duodenal biopsies (showing villous atrophy, crypt hyperplasia, intraepithelial lymphocytosis — Marsh classification)',
    ],
    differentials: [
      'Irritable Bowel Syndrome (IBS — coeliac must be screened for before diagnosing IBS!)',
      'Inflammatory Bowel Disease (Crohn disease / Ulcerative colitis)',
      'Lactose intolerance / secondary disaccharidase deficiency',
      'Non-coeliac gluten sensitivity (antibodies and biopsies negative)',
      'Small Intestinal Bacterial Overgrowth (SIBO)',
      'Microscopic colitis / Giardiasis',
    ],
    rare: [
      'Enteropathy-Associated T-Cell Lymphoma (EATL — aggressive malignancy complicating refractory coeliac disease)',
      'Refractory Coeliac Disease (persistent villous atrophy despite strict gluten-free diet > 12 months)',
      'Hyposplenism (Howell-Jolly bodies on blood film; increased risk of encapsulated bacterial sepsis)',
      'Severe osteoporosis with pathological fractures due to malabsorption of calcium and vitamin D',
    ],
    plan: [
      'Lifelong strict Gluten-Free Diet (avoid wheat, barley, rye, and contaminated oats) — the only effective treatment',
      'Referral to specialist Coeliac Dietitian for structured education, food labelling advice, and prescription gluten-free staple foods',
      'Correct nutritional deficiencies: oral iron, folic acid, vitamin B12, calcium and vitamin D supplementation',
      'Immunisation: offer pneumococcal polysaccharide vaccine (due to functional hyposplenism) and annual influenza vaccine',
      'Bone mineral density scan (DEXA) at diagnosis to assess for osteopenia / osteoporosis',
    ],
    safetynetting: [
      'DO NOT start a gluten-free diet before duodenal biopsy is performed',
      'Seek urgent medical review if developing persistent fever, night sweats, rapid unexplained weight loss, or persistent abdominal pain',
    ],
    followup: [
      'Review at 6 months and annually: verify symptom resolution, adherence to gluten-free diet, repeat anti-tTG (should decline toward normal), repeat FBC/ferritin',
    ],
    referral: [
      'Gastroenterology Referral: all positive coeliac serology for confirmatory endoscopic duodenal biopsy',
      'Urgent 2-Week-Wait GI: suspected malignancy, persistent severe weight loss, or refractory symptoms on strict gluten-free diet',
      'Dermatology: suspected Dermatitis Herpetiformis for direct immunofluorescence skin biopsy',
    ],
  },
  {
    letter: 'C',
    title: 'COPD (Chronic Management)',
    icon: '𫠁',
    history: [
      'Cardinal symptoms: exertional breathlessness (progressive, persistent), chronic cough, regular sputum production, frequent winter chest infections',
      'Symptom assessment: mMRC dyspnoea scale (0–4) and CAT score (COPD Assessment Test)',
      'Smoking history: pack-years (> 20 pack-years typical); current smoking status',
      'Environmental / occupational risk: biomass smoke, dusts, fumes, chemicals',
      'Exacerbation history: number of treated exacerbations (oral steroids / antibiotics) in past 12 months; hospital admissions',
    ],
    examination: [
      'Inspection: tachypnoea, pursed-lip breathing, use of accessory muscles, barrel chest (hyperinflation), central cyanosis, peripheral oedema',
      'Chest: reduced chest expansion, hyper-resonant percussion, quiet breath sounds, prolonged expiratory phase, coarse wheeze or crackles',
      'Signs of Cor Pulmonale: elevated JVP, right ventricular heave, loud P2, peripheral pitting ankle oedema',
      'Finger clubbing: NOT a feature of COPD! (Clubbing indicates underlying bronchiectasis, lung cancer, or fibrosis!)',
    ],
    investigations: [
      'Post-bronchodilator Spirometry: mandatory for diagnosis — post-bronchodilator FEV1/FVC < 0.70 confirms airflow limitation that is not fully reversible',
      'Severity grading (based on post-bronchodilator FEV1 % predicted):',
      '  - Stage 1 (Mild): ≥ 80%',
      '  - Stage 2 (Moderate): 50–79%',
      '  - Stage 3 (Severe): 30–49%',
      '  - Stage 4 (Very Severe): < 30%',
      'Chest X-ray: hyperinflated lung fields, flattened diaphragms, exclude lung cancer or bullae',
      'FBC: check for polycythaemia (chronic hypoxia) or anaemia; eosinophil count (guides ICS therapy)',
    ],
    differentials: [
      'Asthma (variable symptoms, diurnal variability, nocturnal waking, atopic history, normal spirometry between attacks)',
      'Congestive Heart Failure',
      'Bronchiectasis (copious purulent daily sputum, finger clubbing, coarse crackles)',
      'Lung Cancer',
      'Idiopathic Pulmonary Fibrosis',
      'Tuberculosis',
    ],
    rare: [
      'Alpha-1 Antitrypsin Deficiency (consider in young patients < 45 years, non-smokers, or basilar panacinar emphysema)',
      'Spontaneous secondary pneumothorax from ruptured emphysematous bulla',
      'Acute Cor Pulmonale / Pulmonary hypertension',
    ],
    plan: [
      '1. SMOKING CESSATION: the single most effective intervention to halt accelerated decline in lung function; offer NRT / varenicline / behavioural support',
      '2. Inhaled Pharmacotherapy (NICE NG115):',
      '  - Initial: SABA (salbutamol) or SAMA (ipratropium) as needed',
      '  - If breathless or limited despite SABA:',
      '    - No asthmatic features / low eosinophils: Dual bronchodilator LABA + LAMA (e.g. tiotropium + olodaterol, or umeclidinium + vilanterol)',
      '    - Asthmatic features (history of atopy, high blood eosinophils ≥ 300/mcL, diurnal variation): LABA + ICS (e.g. Relvar Ellipta)',
      '    - Persistent exacerbations on dual therapy: Triple therapy LABA + LAMA + ICS (e.g. Trelegy Ellipta, Trimbow)',
      '3. Pulmonary Rehabilitation: refer all patients with mMRC score ≥ 2 (evidence-based improvement in exercise capacity and quality of life)',
      '4. Vaccinations: Annual influenza, one-off pneumococcal (PCV/PPV), COVID boosters',
    ],
    safetynetting: [
      'Recognise an acute exacerbation: increased breathlessness, increased sputum volume, sputum purulence (green/yellow); advise on rescue pack use and when to call 999',
    ],
    followup: [
      'Review at 4–8 weeks after any change in maintenance inhaler therapy; check inhaler technique using placebo device',
      'Annual structured COPD review with practice nurse (spirometry, CAT score, mMRC, inhaler technique, exacerbation history)',
    ],
    referral: [
      'Respiratory Specialist Referral: diagnostic uncertainty, severe COPD (FEV1 < 30%), frequent exacerbations (≥ 2/year on triple therapy), cor pulmonale, consideration of home oxygen (LTOT assessment if SpO2 ≤ 92% at rest)',
    ],
  },
  {
    letter: 'D',
    title: 'Diabetes Type 2 (Management)',
    icon: '🩸',
    history: [
      'Diagnosis confirmed by: HbA1c ≥ 48 mmol/mol (6.5%), or fasting plasma glucose ≥ 7.0 mmol/L, or random glucose ≥ 11.1 mmol/L with symptoms (polyuria, polydipsia, weight loss, lethargy, recurrent candidiasis)',
      'Cardiovascular risk factors: hypertension, dyslipidaemia, smoking, family history, obesity, stroke/ischaemic heart disease',
      'Microvascular complications screening: visual blurring (retinopathy), numbness/paresthesia (neuropathy), frothy urine (nephropathy), erectile dysfunction',
      'Hypoglycaemic episode history (if on sulfonylureas or insulin)',
      'Lifestyle review: dietary habits, carbohydrate intake, physical activity levels, alcohol consumption',
    ],
    examination: [
      'Body Mass Index (BMI) and waist circumference',
      'Blood pressure measurement (target < 140/90 mmHg, or < 130/80 if established CKD or ACR ≥ 3 mg/mmol)',
      'Comprehensive diabetic foot examination: 10g monofilament test (loss of protective sensation), peripheral pedal pulses (dorsalis pedis, posterior tibial), skin integrity, calluses, fungal infection, foot deformities (Charcot arthropathy)',
      'Injection site inspection (if on insulin / GLP-1 analogues for lipohypertrophy)',
    ],
    investigations: [
      'HbA1c monitoring: every 3–6 months until stable, then 6-monthly',
      'Urine Albumin:Creatinine Ratio (ACR) on early morning sample annually',
      'Serum Creatinine & eGFR (renal function)',
      'Lipid profile: Total cholesterol, HDL, Non-HDL, Triglycerides',
      'Annual Digital Retinal Photography screening',
    ],
    differentials: [
      'Latent Autoimmune Diabetes in Adults (LADA / Type 1.5 diabetes — lean patient, rapid oral medication failure, positive anti-GAD antibodies)',
      'Type 1 Diabetes Mellitus (ketosis-prone, younger age, rapid weight loss)',
      'Steroid-induced diabetes / Secondary diabetes (Cushing syndrome, acromegaly, pancreatitis)',
      'Maturity Onset Diabetes of the Young (MODY — autosomal dominant, strong young family history)',
    ],
    rare: [
      'Hyperosmolar Hyperglycaemic State (HHS: profound dehydration, glucose > 30 mmol/L, osmolality > 320 mOsm/kg, without significant ketosis — medical emergency!)',
      'Diabetic Ketoacidosis (DKA — can occur in T2DM during severe sepsis or with SGLT2 inhibitors as "euglycaemic DKA")',
      'Malignant diabetic foot ulcer / necrotising fasciitis',
    ],
    plan: [
      '1. Lifestyle & Structured Education: referral to DESMOND / X-PERT programme; dietary modification, weight reduction target ≥ 5–10%',
      '2. Glycaemic Targets: Individualised HbA1c target 48 mmol/mol (lifestyle / metformin monotherapy) or 53 mmol/mol (on drugs that cause hypoglycemia e.g. sulfonylureas)',
      '3. Pharmacotherapy Algorithm (NICE NG28):',
      '  - First-line: Metformin (titrate from 500mg OD to 1g BD with meals to minimize GI side effects)',
      '  - High CV risk / Established CVD / Heart Failure / CKD (ACR ≥ 3): Add SGLT2 inhibitor (Empagliflozin, Dapagliflozin) early regardless of baseline HbA1c',
      '  - Dual / Triple therapy options: DPP-4 inhibitor (Linagliptin, Sitagliptin), SGLT2i, GLP-1 receptor agonist (Semaglutide, Dulaglutide), or Sulfonylurea (Gliclazide)',
      '4. Cardiovascular Protection: Atorvastatin 20mg OD for primary prevention (QRISK2/3 ≥ 10% or age > 40); ACEi/ARB for hypertension or microalbuminuria',
    ],
    safetynetting: [
      'Sick day guidance: withhold metformin and SGLT2 inhibitors during acute dehydrating illness (risk of lactic acidosis and euglycaemic DKA)',
      'DVLA rules: notify DVLA if on insulin or persistent disabling hypoglycemia',
      'Immediate emergency review if vomiting, fruity breath, confusion, or non-healing foot wound',
    ],
    followup: [
      'Review HbA1c every 3 months when adjusting medications, then 6-monthly once stable',
      'Comprehensive annual diabetic review (the "9 key care processes")',
    ],
    referral: [
      'Same-day Emergency: Diabetic ketoacidosis, hyperosmolar hyperglycaemic state, severe diabetic foot infection / gangrene',
      'Multidisciplinary Foot Clinic (within 24 hours): new diabetic foot ulcer or acute Charcot joint',
      'Specialist Diabetes Team: complex refractory glycaemia, starting multi-dose insulin, or suspected LADA/MODY',
    ],
  },
  {
    letter: 'D',
    title: 'Dyspepsia / Heartburn / GORD',
    icon: '🩹',
    history: [
      'Upper abdominal discomfort, epigastric burning/pain, retrosternal heartburn, acid regurgitation, belching, water brash, bloating, early satiety',
      'Relationship to meals: postprandial (GORD, gastric ulcer) vs relieved by food/worse 2–3h later/at night (duodenal ulcer)',
      'RED FLAGS (ALARM symptoms):',
      '  - Age ≥ 55 with new-onset persistent dyspepsia',
      '  - Progressive dysphagia (difficulty swallowing — immediate 2WW referral!)',
      '  - Unexplained weight loss',
      '  - Epigastric mass / palpable abdominal mass',
      '  - Persistent vomiting',
      '  - Evidence of gastrointestinal bleeding (melaena, haematemesis, iron deficiency anaemia)',
      'Medications: NSAIDs, aspirin, steroids, bisphosphonates, calcium channel blockers, nitrates',
      'Lifestyle: alcohol, smoking, coffee, obesity, late-night heavy meals',
    ],
    examination: [
      'Vitals: HR, BP, temperature',
      'Abdominal examination: epigastric tenderness, palpate for masses, hepatosplenomegaly, ascites',
      'Lymph nodes: examine left supraclavicular fossa (Troisier sign / Virchow node — gastric cancer metastasis!)',
      'Pallor (conjunctival / palmar) for iron deficiency anaemia',
    ],
    investigations: [
      'Urgent direct access upper GI endoscopy for patients meeting NICE NG12 cancer criteria',
      'Helicobacter pylori testing (Stool Antigen Test or 13C Urea Breath Test): patient must be off PPIs for at least 2 weeks and off antibiotics for 4 weeks before testing',
      'Full Blood Count (FBC) to check for occult microcytic anaemia',
    ],
    differentials: [
      'Gastro-oesophageal reflux disease (GORD / reflux oesophagitis)',
      'Peptic Ulcer Disease (Gastric or Duodenal ulcer)',
      'Functional (Non-ulcer) Dyspepsia',
      'Oesophageal / Gastric Malignancy',
      'Biliary colic / Cholecystitis',
      'Chronic Pancreatitis / Pancreatic cancer',
      'Atypical Angina / Acute Coronary Syndrome (always consider in patients with cardiac risk factors!)',
      'Medication-induced dyspepsia',
    ],
    rare: [
      'Gastric adenocarcinoma or oesophageal cancer',
      'Perforated peptic ulcer (sudden peritonism, board-like abdomen, erect CXR shows pneumoperitoneum)',
      'Severe upper gastrointestinal haemorrhage (bleeding ulcer, Boerhaave syndrome)',
      'Barrett oesophagus with high-grade dysplasia',
    ],
    plan: [
      '1. Lifestyle modifications: weight loss, smoking cessation, avoid eating within 3 hours of bed, raise head of bed by 10–15 cm, reduce caffeine and alcohol',
      '2. Review and stop culprit medications (especially NSAIDs)',
      '3. In patients without red flags:',
      '  - Initial empirical trial of Full-dose Proton Pump Inhibitor (PPI — Omeprazole 20mg OD or Lansoprazole 30mg OD) for 4 to 8 weeks',
      '  - Test-and-treat for Helicobacter pylori: if positive, 7-day first-line eradication therapy (PPI BD + Amoxicillin 1g BD + Clarithromycin 500mg BD; or Metronidazole if penicillin-allergic)',
      '4. If symptoms recur post-treatment: step down to lowest effective dose as-needed (PRN)',
    ],
    safetynetting: [
      'Instruct patient to seek urgent medical attention if new difficulty swallowing (food sticking), unexplained weight loss, vomiting blood, black sticky tarry stools, or persistent severe pain occurs',
    ],
    followup: [
      'Review at 4–8 weeks after starting empirical PPI therapy',
      'Do not routinely re-test for H. pylori cure unless persistent symptoms, gastric ulcer, or MALT lymphoma',
    ],
    referral: [
      'Urgent 2-Week-Wait Suspected Upper GI Cancer Pathway (NICE NG12):',
      '  - Any patient with dysphagia (difficulty swallowing) at any age',
      '  - Aged ≥ 55 with weight loss AND upper abdominal pain / reflux / dyspepsia',
      '  - Upper abdominal mass',
      'Same-day Emergency Admission: haematemesis, melaena, peritonitis, severe intractable pain',
    ],
  },
  {
    letter: 'D',
    title: 'Dysphagia',
    icon: '🍽️',
    history: [
      'Difficulty swallowing: precise anatomical level (high/cervical: food sticks in throat vs low/retrosternal: food sticks in chest)',
      'Solids vs Liquids:',
      '  - Progressive (solids first, then progressing to liquids): strongly suggests mechanical obstruction (oesophageal carcinoma / stricture)',
      '  - Intermittent / Simultaneous for solids and liquids from onset: suggests neuromuscular motility disorder (achalasia, diffuse spasm)',
      'Onset and progression: rapid over weeks (malignancy) vs long-standing over years (benign stricture, motility)',
      'Associated symptoms: odynophagia (painful swallowing — candida, herpes, ulceration), regurgitation of undigested food, cough/choking on swallowing, hoarseness (recurrent laryngeal nerve invasion), weight loss',
      'History of chronic GORD, neurological disease (stroke, Parkinson, MND, myasthenia gravis)',
    ],
    examination: [
      'General condition: cachexia, dehydration, malnutrition, pallor',
      'Oral cavity & pharynx: examine cranial nerves IX, X, XII; inspect tongue, uvula, gag reflex; observe water swallow test',
      'Neck examination: palpable cervical/supraclavicular lymphadenopathy (Troisier sign), thyroid enlargement, pharyngeal pouch (gurgling lump)',
      'Chest and abdominal exam: epigastric mass, hepatomegaly',
    ],
    investigations: [
      'Urgent upper gastrointestinal endoscopy (OGD): primary investigation for mechanical dysphagia',
      'Barium swallow / Videofluoroscopy: optimal for high oropharyngeal dysphagia or suspected achalasia / pharyngeal pouch',
      'High-resolution oesophageal manometry if endoscopy is normal (confirms achalasia)',
      'CT Thorax/Abdomen if malignancy diagnosed on biopsy',
      'FBC (anaemia), U&E, LFT, Albumin',
    ],
    differentials: [
      'Oesophageal Carcinoma (Adenocarcinoma or Squamous Cell)',
      'Benign peptic stricture (complication of severe GORD)',
      'Achalasia (failure of lower oesophageal sphincter relaxation)',
      'Eosinophilic Oesophagitis (young atopic adults, recurrent food impaction)',
      'Neurological dysphagia (post-stroke, Parkinson, Motor Neurone Disease, Myasthenia Gravis)',
      'Pharyngeal Pouch (Zenker diverticulum: halitosis, regurgitation)',
      'Infective oesophagitis (Candida in immunosuppressed)',
      'Extrinsic compression (lung cancer, retrosternal goitre, vascular anomaly)',
    ],
    rare: [
      'Complete acute oesophageal food bolus obstruction (saliva drooling, inability to swallow liquids — emergency OGD required!)',
      'Oesophageal perforation post-endoscopy or spontaneous (Boerhaave syndrome)',
      'Motor Neurone Disease presenting as isolated bulbar palsy',
    ],
    plan: [
      'ANY NEW-ONSET UNEXPLAINED DYSPHAGIA IS A RED FLAG REQUIRING URGENT INVESTIGATION',
      'Immediate referral on Urgent 2-Week-Wait Cancer Pathway',
      'Dietary texture modification (pureed/soft diet) while awaiting urgent endoscopy',
      'Speech and Language Therapy (SALT) assessment for neurogenic oropharyngeal dysphagia',
    ],
    safetynetting: [
      'Instruct patient to attend A&E immediately if complete inability to swallow liquids/saliva occurs (acute food bolus obstruction), or if fever, chest pain, or haematemesis develops',
    ],
    followup: [
      'Track 2WW referral closely; contact endoscopy unit if appointment is not confirmed within 7–14 days',
    ],
    referral: [
      'Urgent 2-Week-Wait Endoscopy / Upper GI Cancer Pathway: mandatory for all patients with unexplained dysphagia (NICE NG12)',
      'Immediate Emergency Admission: acute foreign body or food bolus obstruction with inability to manage secretions, aspiration pneumonia',
    ],
  },
  {
    letter: 'G',
    title: 'Gout (Acute & Chronic)',
    icon: '🦶',
    history: [
      'Acute Gout Attack: sudden onset, explosive severe joint pain reaching peak within 6–12 hours, extreme tenderness (cannot tolerate bedsheet on joint!), erythema, swelling',
      'Location: 1st metatarsophalangeal joint (podagra — ~70% of first attacks); other common sites: ankle, knee, wrist, fingers',
      'Precipitating triggers: high-purine foods (red meat, seafood), alcohol excess (especially beer), dehydration, trauma/surgery, acute systemic illness, starting/changing urate-lowering therapy',
      'Medications: loop/thiazide diuretics (classic cause!), low-dose aspirin, ciclosporin',
      'Chronic Gout: frequency of recurrent attacks, joint stiffness, visible chalky subcutaneous tophi (ears, fingers, elbows)',
      'Cardiovascular & renal comorbidities: hypertension, CKD, diabetes, hyperlipidaemia',
    ],
    examination: [
      'Affected joint: intensely erythematous, hot, swollen, shiny skin, exquisitely tender to light touch; desquamation/peeling of overlying skin during resolution',
      'Systemic: low-grade fever may accompany acute monoarthritis',
      'Inspect for Gouty Tophi: firm, painless or tender yellowish-white nodular chalky deposits (helix of pinna, olecranon bursa, Achilles tendon, interphalangeal joints)',
      'Assess for alternative septic arthritis signs: open skin lesions, inability to weight-bear, high spiking fevers',
    ],
    investigations: [
      'Gold standard: Synovial fluid aspiration and polarized light microscopy (negatively birefringent needle-shaped monosodium urate crystals; excludes septic arthritis with microscopy/culture)',
      'Serum Urate: measure 4–6 weeks AFTER an acute attack has resolved (urate levels often drop into normal range during an acute attack due to systemic cytokine excretion!)',
      'FBC, CRP, ESR (marked acute phase response)',
      'U&E, eGFR (renal function is vital for guiding NSAID and allopurinol dosing)',
      'Plain radiograph of joint: typically normal in early disease; "punched-out" periarticular erosions with sclerotic overhanging edges in chronic tophaceous gout',
    ],
    differentials: [
      'Septic Arthritis (CRITICAL: must rule out! Hot swollen joint with high fever is septic until proven otherwise!)',
      'Pseudogout (Calcium Pyrophosphate Dihydrate — rhomboid positively birefringent crystals, older adults, knee/wrist)',
      'Cellulitis of overlying skin',
      'Haemarthrosis',
      'Reactive arthritis',
      'Psoriatic arthritis / Rheumatoid arthritis',
    ],
    rare: [
      'Concomitant Septic Arthritis and Gout (they can co-exist!)',
      'Acute uric acid nephropathy / Urate nephrolithiasis',
      'Severe polyarticular gout mimicking septic shock',
    ],
    plan: [
      '1. Acute Attack Management (NICE NG219):',
      '  - Start treatment as early as possible within 24 hours:',
      '  - Option A: Oral NSAID at maximum dose (e.g. Naproxen 500mg BD or Etoricoxib 60–120mg OD) + PPI co-prescription; avoid in renal impairment / heart failure / active peptic ulcer',
      '  - Option B: Oral Colchicine 500mcg BD to TDS until symptoms relieve (max 6mg/course; reduce dose in renal impairment; common GI side effects like diarrhoea)',
      '  - Option C: Oral Prednisolone 30–35mg daily for 5 days (preferred in renal impairment or when NSAIDs/colchicine contraindicated)',
      '  - Rest, ice packs, joint elevation',
      '2. Long-term Urate-Lowering Therapy (ULT — treat-to-target approach):',
      '  - Offer ULT to all patients after their first attack of gout (NICE NG219); start 2–4 weeks after acute flare has resolved (or during flare provided acute anti-inflammatory is on board)',
      '  - 1st-line: Allopurinol 100mg daily (titrate up by 100mg every 4 weeks to achieve target serum urate < 300 or < 360 mcmol/L; max 900mg)',
      '  - 2nd-line: Febuxostat 80–120mg daily (if allopurinol not tolerated or target not achieved)',
      '  - Mandatory Flare Prophylaxis: co-prescribe low-dose Colchicine 500mcg OD/BD or low-dose NSAID for the first 6 months of initiating ULT to prevent paradoxical mobilization flares',
    ],
    safetynetting: [
      'Seek emergency hospital review immediately if joint becomes increasingly red, hot, or swollen accompanied by high fever, chills, or inability to move the joint (rule out septic arthritis)',
      'Warn patient: allopurinol must NOT be stopped if a flare occurs while taking it',
    ],
    followup: [
      'Check serum urate every 4 weeks during allopurinol titration until target level (< 300 or < 360 mcmol/L) is reached, then annually',
    ],
    referral: [
      'Immediate Emergency (A&E / Orthopaedics): suspected septic arthritis (urgent joint aspiration required before starting antibiotics)',
      'Rheumatology Referral: diagnostic uncertainty, refractory gout failing allopurinol and febuxostat, severe tophaceous gout, severe renal impairment (eGFR < 30)',
    ],
  },
  {
    letter: 'H',
    title: 'Heart Murmur',
    icon: '💓',
    history: [
      'Incidental finding vs symptomatic: exertional breathlessness, reduced exercise tolerance, chest pain/angina, presyncope or syncope on exertion, fatigue, orthopnoea, PND, peripheral oedema',
      'History of rheumatic fever (mitral stenosis), congenital heart disease, intravenous drug use (tricuspid endocarditis), recent dental/surgical procedures',
      'Systemic symptoms: fever, night sweats, weight loss, joint pains (infective endocarditis red flags!)',
      'Past medical history: hypertension, Marfan syndrome, bicuspid aortic valve, coronary artery disease',
    ],
    examination: [
      'Precise Auscultation of Murmur (using diaphragm and bell across all 4 cardiac areas):',
      '  - Timing: Systolic (Ejection Systolic vs Pansystolic) vs Diastolic (Early vs Mid-diastolic — ALL diastolic murmurs are pathological!)',
      '  - Pitch, quality, grade (Levine scale 1 to 6; thrill present if ≥ Grade 4)',
      '  - Radiation: Aortic Stenosis radiates to carotids; Mitral Regurgitation radiates to left axilla',
      '  - Dynamic manoeuvres: expiration (left-sided murmurs louder), inspiration (right-sided murmurs louder — Carvallo sign)',
      'Pulse: slow-rising, plateau pulse (pulsus parvus et tardus in severe AS); collapsing water-hammer pulse (Aortic Regurgitation)',
      'Blood pressure: narrow pulse pressure in AS; wide pulse pressure in AR',
      'Stigmata of Infective Endocarditis: fever, splinter haemorrhages, Osler nodes, Janeway lesions, Roth spots',
    ],
    investigations: [
      'Transthoracic Echocardiogram (TTE): definitive investigation to assess valve morphology, regurgitation/stenosis severity, pressure gradients, and ejection fraction',
      '12-lead ECG: signs of left ventricular hypertrophy (voltage criteria, strain pattern in AS), left atrial enlargement (P mitrale), bundle branch blocks, or atrial fibrillation',
      'Chest X-ray: cardiomegaly, calcified aortic valve, pulmonary venous congestion',
      'Bloods: FBC, CRP, ESR, multiple blood cultures (if suspected infective endocarditis)',
    ],
    differentials: [
      'Aortic Stenosis (ejection systolic, crescendo-decrescendo, radiating to carotids, soft S2)',
      'Mitral Regurgitation (pansystolic, blowing, apex radiating to axilla, loud S3)',
      'Aortic Regurgitation (early diastolic, high-pitched, left sternal edge on expiration leaning forward)',
      'Mitral Stenosis (low-pitched rumbling mid-diastolic, tapping apex, opening snap)',
      'Innocent / Physiological flow murmur (young, asymptomatic, soft systolic < Grade 3, no radiation, normal pulses)',
      'Hypertrophic Cardiomyopathy (HOCM — systolic murmur louder with Valsalva)',
    ],
    rare: [
      'Infective Endocarditis with acute severe valvular destruction and pulmonary oedema',
      'Critical Aortic Stenosis (valve area < 1.0 cm²) presenting with syncope or sudden cardiac arrest',
      'Acute chordal rupture causing flail mitral leaflet',
    ],
    plan: [
      'Asymptomatic soft systolic murmur with normal examination in healthy young adults: observe as likely innocent flow murmur',
      'All newly detected symptomatic murmurs or murmurs with pathological features (diastolic, holosystolic, loud, radiates) require Echocardiography',
      'Avoid heavy competitive isometric exertion in patients with suspected severe aortic stenosis pending echo',
      'Antibiotic prophylaxis for dental procedures is NOT routinely recommended by NICE CG64 (emphasize meticulous dental hygiene instead)',
    ],
    safetynetting: [
      'Advise patient to seek immediate emergency care (999) if experiencing chest pain, fainting / blackout, severe sudden shortness of breath, or palpitations',
    ],
    followup: [
      'Stable mild/moderate valvular disease: periodic clinical review and serial echocardiograms (every 1–3 years depending on severity)',
    ],
    referral: [
      'Same-day Emergency Admission: murmur with acute pulmonary oedema, syncope, shock, or suspected acute endocarditis with sepsis',
      'Urgent Cardiology Outpatient (within 2–4 weeks): murmur with exertional symptoms (angina, dyspnoea, presyncope), or severe stenosis on echo for valve replacement (TAVI / SAVR) assessment',
      'Routine Cardiology: asymptomatic significant murmur confirmed on echocardiography',
    ],
  },
  {
    letter: 'M',
    title: 'Ménière’s Disease',
    icon: '🌀',
    history: [
      'Classic clinical triad: Episodic true vertigo + Fluctuating sensorineural hearing loss + Tinnitus with aural fullness/pressure (unilateral in early stages)',
      'Duration of attacks: spontaneous vertigo episodes typically last 20 minutes to 12 hours (rarely up to 24 hours)',
      'Associated autonomic symptoms during attacks: intense nausea, vomiting, diaphoresis, pallor, unsteadiness',
      'Tumarkin otolithic crisis (drop attacks): sudden unprovoked falls without loss of consciousness in advanced disease',
      'Natural history: fluctuating symptoms initially; over years, low-frequency sensorineural hearing loss becomes permanent and bilateral in up to 30–50% of patients',
    ],
    examination: [
      'During acute attack: horizontal or torsional spontaneous nystagmus (fast phase beats away from affected ear)',
      'Otoscopy: completely normal tympanic membrane and ear canal (essential to rule out otitis media or cholesteatoma)',
      'Cranial nerves & Cerebellar examination: normal (vital to rule out acoustic neuroma or posterior circulation stroke)',
      'Weber and Rinne tuning fork tests: sensorineural hearing loss pattern (Rinne positive bilaterally, Weber lateralises to normal ear)',
    ],
    investigations: [
      'Pure-tone Audiometry: mandatory — demonstrates characteristic low-frequency sensorineural hearing loss in early disease',
      'MRI Brain with Internal Auditory Meatus (IAM): essential to exclude vestibular schwannoma (acoustic neuroma) which can present with identical unilateral hearing loss and tinnitus',
      'Vestibular evoked myogenic potentials (VEMP) / electrocochleography in specialist ENT clinic',
    ],
    differentials: [
      'Vestibular Migraine (often lacks true low-frequency hearing loss, headache/photophobia present)',
      'Benign Paroxysmal Positional Vertigo (BPPV — lasts seconds, triggered by head movement)',
      'Vestibular Neuritis (single prolonged vertigo episode lasting days without auditory symptoms)',
      'Labyrinthitis (single acute prolonged episode with hearing loss, post-viral)',
      'Acoustic Neuroma / Vestibular Schwannoma (insidious progressive hearing loss)',
      'Cerebrovascular event / TIA',
    ],
    rare: [
      'Tumarkin drop attacks causing serious physical trauma/fractures',
      'Progressive bilateral deafness',
      'Intracranial space-occupying lesion mimicking Ménière’s',
    ],
    plan: [
      '1. Acute Attack Management:',
      '  - Buccal Prochlorperazine (Stemetil) 3–6mg BD or oral 5–10mg TDS (or IM cyclizine 50mg if vomiting) — use for maximum 48–72 hours only to avoid blunting central vestibular compensation',
      '  - Bed rest in a quiet, darkened room until acute spinning subsides',
      '2. Prophylaxis & Long-term Maintenance:',
      '  - Lifestyle: low-salt diet (< 2g sodium/day), restrict caffeine, alcohol, and nicotine; manage stress',
      '  - Pharmacotherapy: Oral Betahistine 16mg TDS titrated up to 48mg TDS if needed to reduce attack frequency',
      '3. DVLA Notification: mandatory — patient must stop driving until symptoms are satisfactorily controlled',
    ],
    safetynetting: [
      'Seek emergency medical care if acute neurological symptoms occur (diplopia, dysarthria, limb weakness, severe headache, inability to walk unsupported)',
    ],
    followup: [
      'Review at 6–8 weeks to assess betahistine tolerability and attack frequency reduction',
    ],
    referral: [
      'Routine ENT Referral: all suspected cases for audiometry, specialist confirmation, and exclusion of acoustic neuroma on MRI',
      'Specialist Interventions for Refractory Disease: intratympanic dexamethasone, intratympanic gentamicin, endolymphatic sac surgery, vestibular rehabilitation',
    ],
  },
  {
    letter: 'P',
    title: 'Psoriasis',
    icon: '🧴',
    history: [
      'Chronic inflammatory skin condition: well-demarcated erythematous plaques covered with silvery-white adherent scales',
      'Common sites: extensor surfaces (elbows, knees), scalp, sacrum, umbilicus, natal cleft; flexural/inverse in skin folds',
      'Subtypes: Plaque psoriasis (most common, ~80%), Guttate psoriasis (crops of small "drop-like" plaques post-streptococcal throat infection), Pustular psoriasis, Erythrodermic psoriasis',
      'Systemic symptoms: joint pain, morning stiffness > 30 minutes, dactylitis ("sausage digit"), enthesitis (Achilles tendonitis) — screen for Psoriatic Arthritis (PEST tool)!',
      'Triggers: streptococcal pharyngitis, skin trauma (Koebner phenomenon), stress, smoking, alcohol, medications (beta-blockers, lithium, antimalarials, abrupt oral steroid withdrawal)',
      'Psychological and quality of life impact (DLQI score)',
    ],
    examination: [
      'Plaque morphology: salmon-pink to violaceous well-demarcated plaques with coarse silvery scaling; Auspitz sign (pinpoint bleeding when scale is gently scraped off)',
      'Nail examination (in up to 50% of patients): pitting, onycholysis (separation of nail from bed), subungual hyperkeratosis, "oil drop" / salmon patches',
      'Musculoskeletal examination: peripheral joints, axial spine, entheses, dactylitis',
      'Assess total body surface area (BSA) and severity',
    ],
    investigations: [
      'Clinical diagnosis based on classic appearance and distribution',
      'Throat swab (ASO titer) if guttate psoriasis suspected',
      'Screen for metabolic syndrome and cardiovascular disease (Lipid profile, HbA1c, BP — psoriasis is an independent CV risk factor!)',
      'Rheumatology bloods (RF usually negative in PsA; HLA-B27, CRP/ESR)',
    ],
    differentials: [
      'Atopic Eczema (flexural, poorly demarcated, intense pruritus, excoriations)',
      'Seborrhoeic Dermatitis (greasy yellowish scales on scalp, eyebrows, nasolabial folds)',
      'Pityriasis Rosea (herald patch, Christmas-tree distribution on trunk, self-limiting)',
      'Tinea Corporis (annular, active scaly advancing border with central clearing)',
      'Secondary Syphilis (copper-red macules on palms/soles, lymphadenopathy)',
      'Cutaneous T-cell lymphoma (Mycosis fungoides)',
    ],
    rare: [
      'Erythrodermic Psoriasis (> 90% body surface area affected, systemic hypothermia, fluid loss, high-output cardiac failure — life-threatening emergency!)',
      'Generalized Pustular Psoriasis (von Zumbusch — widespread sterile pustules with high fever and toxaemia)',
      'Severe destructive Psoriatic Arthritis (Arthritis Mutilans)',
    ],
    plan: [
      '1. General Skin Care: regular, liberal bland emollients to soften scale and reduce irritation',
      '2. First-line Topical Therapy for Plaque Psoriasis (NICE CG153):',
      '  - Potent topical corticosteroid + Vitamin D analogue once daily (e.g. Calcipotriol + Betamethasone dipropionate ointment/gel / Dovobet) for up to 4 weeks',
      '  - Second-line: Vitamin D analogue alone (calcipotriol BD) or coal tar preparations',
      '  - Scalp Psoriasis: potent topical steroid gel/lotion + salicylic acid / coconut compound ointment to descale',
      '  - Facial / Flexural Psoriasis: mild or moderate potency topical steroid (Hydrocortisone 1% or Eumovate) for max 1–2 weeks, or topical calcineurin inhibitor (Tacrolimus ointment)',
      '3. NEVER prescribe systemic oral corticosteroids for psoriasis (risk of fatal generalized pustular or erythrodermic rebound on withdrawal!)',
    ],
    safetynetting: [
      'Instruct patient to seek emergency medical care immediately if widespread generalized redness covers the body (erythroderma), or if widespread pustules and high fevers develop',
    ],
    followup: [
      'Review at 4 weeks after starting topical treatment to assess response, adverse effects, and plan a steroid-sparing maintenance regimen',
      'Annual review of cardiovascular risk factors and PEST psoriatic arthritis screening',
    ],
    referral: [
      'Same-day Emergency: Erythrodermic psoriasis or generalized pustular psoriasis',
      'Urgent Rheumatology Referral: suspected Psoriatic Arthritis (PEST score ≥ 3, joint swelling, dactylitis)',
      'Dermatology Referral: extensive disease (> 10% BSA), failure of first-line topical therapy for phototherapy (narrowband UVB) or systemic biologics (methotrexate, adalimumab, ustekinumab), severe nail/scalp involvement, severe psychological impact',
    ],
  },
  {
    letter: 'W',
    title: 'Weight Loss (Unexplained)',
    icon: '⚖️',
    history: [
      'Quantify the loss: clinically significant weight loss is defined as unintended loss of > 5% of baseline body weight over 6–12 months',
      'Timeframe and trajectory (steady progressive decline vs fluctuating)',
      'Appetite status: decreased appetite (malignancy, chronic infection, depression, liver disease) vs increased appetite with weight loss (hyperthyroidism, uncontrolled diabetes mellitus, malabsorption/coeliac)',
      'Review of Systems (Systematic Malignancy Screen):',
      '  - GI: dysphagia, dyspepsia, change in bowel habit, rectal bleeding, abdominal pain/mass',
      '  - Respiratory: persistent cough, haemoptysis, dyspnoea, hoarseness, smoking history',
      '  - Gynae/Urology: haematuria, testicular lump, postmenopausal bleeding',
      '  - B-symptoms: drenching night sweats, persistent fevers, pruritus (lymphoma/TB)',
      'Psychological screen: major depressive disorder, severe anxiety, anorexia nervosa, dementia, alcohol or substance misuse',
      'Medications: metformin, GLP-1 agonists, levothyroxine, topiramate, stimulants, laxative abuse',
    ],
    examination: [
      'Measure accurate weight and calculate BMI; compare with documented historical records',
      'General inspection: temporal wasting, sunken eyes, loose clothing, pallor, jaundice, cachexia',
      'Lymph node survey: cervical, supraclavicular (Virchow node), axillary, and inguinal nodes',
      'Oral cavity: mucosal ulcers, candidiasis, dental disease, poor dentition',
      'Cardiorespiratory: heart murmurs, focal chest signs',
      'Abdominal examination: hepatomegaly, splenomegaly, palpable masses, ascites, DRE (rectal mass / melaena)',
      'Thyroid examination: goitre, bruit, tremor, lid lag',
      'Breasts and external genitalia examination',
    ],
    investigations: [
      'Comprehensive Primary Care Diagnostic Workup (NICE NG12):',
      '  - Full Blood Count (anaemia, leukocytosis, thrombocytosis — marker of occult cancer!)',
      '  - Inflammatory markers (ESR, CRP — markedly raised in occult malignancy, vasculitis, myeloma)',
      '  - U&E, eGFR, LFTs (elevated ALP/bilirubin), Bone Profile (hypercalcaemia)',
      '  - Thyroid Function Tests (TSH/FT4 — rule out apathetic thyrotoxicosis in elderly)',
      '  - HbA1c / Fasting blood glucose (new-onset diabetes)',
      '  - Serum Protein Electrophoresis / Serum Free Light Chains (Multiple Myeloma)',
      '  - Coeliac serology (anti-tTG IgA)',
      '  - Urine dipstick (protein, blood, glucose)',
      '  - Faecal Immunochemical Test (FIT — triage for colorectal malignancy)',
      'Chest X-ray (mandatory in all patients with unexplained weight loss)',
      'Abdominal / Pelvic Ultrasound or Urgent CT Thorax-Abdomen-Pelvis if initial screen unrevealing',
    ],
    differentials: [
      'Occult Malignancy (~25–35% of cases: GI, lung, lymphoma, renal, myeloma)',
      'Gastrointestinal disease (Coeliac, IBD, chronic pancreatitis, malabsorption)',
      'Endocrine disorders (Hyperthyroidism, Type 1/2 Diabetes, Addison disease)',
      'Chronic infections (Tuberculosis, HIV, infective endocarditis)',
      'Psychiatric illness (Major depression, dementia, eating disorders)',
      'Severe organ failure (Heart failure cardiac cachexia, advanced CKD, cirrhosis)',
      'Social vulnerability / Food poverty / Elder neglect / Poor dentition',
    ],
    rare: [
      'Primary Adrenal Insufficiency (Addison disease: hyperpigmentation, postural hypotension, hyponatraemia, hyperkalaemia)',
      'Systemic Vasculitis / Giant Cell Arteritis',
      'Occult haematological malignancy (Multiple Myeloma, Occult Lymphoma)',
    ],
    plan: [
      'If specific organ-based red flags identified: refer directly to corresponding 2-Week-Wait site-specific cancer pathway',
      'If no localising signs but persistent unexplained weight loss > 5%: refer to Rapid Diagnostic Centre (RDC) / Non-Specific Symptoms Cancer Pathway',
      'Nutritional support: dietary fortification, high-protein snacks, oral nutritional supplements if malnourished',
      'Address dental problems, depression, or social isolation/food insecurity',
    ],
    safetynetting: [
      'Instruct patient to contact surgery immediately if developing haemoptysis, rectal bleeding, dysphagia, severe vomiting, or new lumps',
    ],
    followup: [
      'Repeat clinical weight check and review in 2–4 weeks; if weight continues to fall and initial investigations are normal, escalate to CT imaging or Rapid Diagnostic Centre',
    ],
    referral: [
      'Urgent 2-Week-Wait Site-Specific Cancer Pathway if organ-specific symptoms present (e.g. Lung, Colorectal, Upper GI, Urology)',
      'Urgent Non-Specific Symptoms / Rapid Diagnostic Clinic (RDC) if unexplained weight loss without localising symptoms',
      'Same-day Emergency Admission: severe cachexia with electrolyte derangement, acute adrenal crisis, severe hypercalcaemia',
    ],
  },
];

async function main() {
  console.log('--- Starting Population of All Unlinked Presentations ---');
  console.log(`Supabase URL: ${url}`);
  console.log(`Parent Hub ID: ${PARENT_HUB_ID}`);

  // 1. Fetch current subpages under the hub
  const existingRes = await fetch(
    `${url}/rest/v1/documents?parent_id=eq.${PARENT_HUB_ID}&select=id,title,icon`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    }
  );
  const existingDocs = await existingRes.json();
  const docMap = new Map();
  for (const d of existingDocs) {
    docMap.set(d.title.trim().toLowerCase(), d);
  }
  console.log(`Found ${existingDocs.length} existing subpages under hub.`);

  // 2. Insert or update each presentation in newPresentations
  for (const pres of newPresentations) {
    const keyTitle = pres.title.trim().toLowerCase();
    const blocks = buildClinicalBlocks(pres);

    if (docMap.has(keyTitle)) {
      const existing = docMap.get(keyTitle);
      console.log(`Updating existing doc: ${pres.title} (${existing.id})...`);
      await fetch(`${url}/rest/v1/documents?id=eq.${existing.id}`, {
        method: 'PATCH',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: pres.title,
          icon: pres.icon,
          content: blocks,
          updated_at: new Date().toISOString(),
        }),
      });
    } else {
      const docId = crypto.randomUUID();
      console.log(`Creating new doc: ${pres.title} (${docId})...`);
      const createRes = await fetch(`${url}/rest/v1/documents`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          id: docId,
          user_id: 'admin-user',
          title: pres.title,
          parent_id: PARENT_HUB_ID,
          icon: pres.icon,
          content: blocks,
          attachments: [],
          is_archived: false,
          is_favorite: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      const created = await createRes.json();
      if (created?.[0]) {
        docMap.set(keyTitle, created[0]);
      }
    }
  }

  // 3. Now re-fetch all child documents under the hub to rebuild the entire Index
  console.log('\nFetching all child documents under hub...');
  const allChildrenRes = await fetch(
    `${url}/rest/v1/documents?parent_id=eq.${PARENT_HUB_ID}&select=id,title,icon&order=title.asc`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    }
  );
  const allChildren = await allChildrenRes.json();
  console.log(`Total active presentation subpages: ${allChildren.length}`);

  // 4. Build the clean alphabetized Hub Index blocks
  const hubBlocks = [];
  const groups = {};

  for (const child of allChildren) {
    const cleanTitle = child.title.trim();
    // Get starting letter
    const firstChar = cleanTitle.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstChar) ? firstChar : 'A';
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(child);
  }

  const sortedLetters = Object.keys(groups).sort();

  for (const letter of sortedLetters) {
    hubBlocks.push(makeHeading(letter, 2));
    // Sort items within this letter
    groups[letter].sort((a, b) => a.title.localeCompare(b.title));
    for (const item of groups[letter]) {
      hubBlocks.push(makeLinkParagraph(item.icon || '📄', item.title, item.id));
    }
  }

  console.log(`Rebuilt Hub Index with ${hubBlocks.length} total blocks.`);

  // 5. Update the Hub Document
  console.log(`Updating Parent Hub Document ${PARENT_HUB_ID}...`);
  const updateHub = await fetch(`${url}/rest/v1/documents?id=eq.${PARENT_HUB_ID}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      title: 'GP Common Presentations (NICE CKS / RCGP-style)',
      icon: '🩺',
      content: hubBlocks,
      updated_at: new Date().toISOString(),
    }),
  });

  const updatedDoc = await updateHub.json();
  console.log('Hub doc updated successfully:', updatedDoc[0]?.title);
  console.log('All unlinked text replaced with active links!');
}

main().catch(console.error);
