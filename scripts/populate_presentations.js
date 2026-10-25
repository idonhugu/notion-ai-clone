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

function buildClinicalPageBlocks(data) {
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

  for (const sec of sections) {
    if (data[sec.key] && data[sec.key].length > 0) {
      blocks.push(makeHeading(sec.heading, 2));
      for (const item of data[sec.key]) {
        blocks.push(makeBullet(item));
      }
    }
  }

  // Quote footer block matching Screenshot 2
  blocks.push(
    makeQuote(
      data.footer ||
        '🇬🇧 NICE CKS-style · RCGP — Clinical Practice / Managing Complexity'
    )
  );

  return blocks;
}

const presentations = [
  // 1. Abdominal Pain (Exact text from Screenshot 2)
  {
    letter: 'A',
    title: 'Abdominal Pain',
    icon: '🤕',
    history: [
      'Site, onset, duration, character, radiation, severity, progression',
      'Associated symptoms: vomiting, diarrhoea, constipation, urinary symptoms, fever, appetite change',
      'Red flags: weight loss, GI bleeding, persistent vomiting, collapse, severe worsening pain',
      'Gynae/sexual history where relevant: LMP, pregnancy possibility, discharge, bleeding, pelvic pain',
      'PMH/medications: NSAIDs, anticoagulants, alcohol, abdominal surgery, IBD, stones',
    ],
    examination: [
      'Observations: temperature, HR, BP, RR, oxygen saturations',
      'Hydration status and general appearance',
      'Abdominal inspection, palpation, percussion, auscultation',
      'Guarding, rebound, percussion tenderness, masses, organomegaly, hernias',
      'Consider pelvic, testicular, rectal examination where clinically appropriate',
    ],
    investigations: [
      'Urine dip and pregnancy test where relevant',
      'FBC, U&E, LFT, CRP, amylase/lipase if indicated',
      'Stool sample if prolonged diarrhoea, blood, travel, or public health concern',
      'Imaging depending on suspected cause: ultrasound, CT, AXR only if indicated',
      'ECG/troponin if upper abdominal pain could be cardiac',
    ],
    differentials: [
      'Gastroenteritis',
      'Constipation / IBS',
      'Dyspepsia / GORD',
      'UTI / pyelonephritis',
      'Appendicitis',
      'Gallbladder disease',
      'Diverticulitis',
      'Renal colic',
      'Gynaecological causes: ectopic pregnancy, PID, ovarian cyst/torsion, endometriosis',
    ],
    rare: [
      'Ectopic pregnancy',
      'Appendicitis with perforation',
      'Bowel obstruction',
      'Peritonitis / sepsis',
      'Abdominal aortic aneurysm',
      'Mesenteric ischaemia',
      'Pancreatitis',
      'Testicular torsion presenting as abdominal pain',
      'Ovarian torsion',
      'Malignancy, especially with weight loss, anaemia, or change in bowel habit',
    ],
    plan: [
      'Analgesia, antiemetic, hydration advice, and treat likely cause where safe',
      'Avoid masking risk: reassess if severe, progressive, or unexplained pain',
      'Manage constipation, dyspepsia, UTI, gastroenteritis, or IBS only when red flags excluded',
      'Use local same-day surgical/gynae/medical pathways when diagnosis uncertain or risk is high',
    ],
    safetynetting: [
      'Seek urgent help for worsening pain, fainting/collapse, persistent vomiting, blood in stool/vomit, fever/rigors, black stools, pregnancy with pain/bleeding, or new severe testicular/pelvic pain',
      'Return if symptoms do not improve as expected or diagnosis remains unclear',
    ],
    followup: [
      'Same day if red flags or diagnostic uncertainty',
      '24–48 hours if mild but evolving symptoms',
      'Routine follow-up for persistent/recurrent symptoms or abnormal tests',
    ],
    referral: [
      'Emergency/same-day: peritonitis, sepsis, severe/worsening pain, haemodynamic instability, suspected ectopic pregnancy, GI bleeding, bowel obstruction, AAA, ovarian/testicular torsion',
      'Urgent suspected cancer pathway if persistent unexplained symptoms with red flags, weight loss, anaemia, mass, or change in bowel habit',
    ],
  },

  // 2. Abdominal Pain (Child)
  {
    letter: 'A',
    title: 'Abdominal Pain (Child)',
    icon: '👶',
    history: [
      'Age, onset, duration, location (periumbilical vs localised), episodic vs continuous, severity',
      'Associated symptoms: fever, vomiting (bilious/green vs non-bilious), diarrhoea, constipation, dysuria, rash, limp',
      'Red flags: bilious vomiting, severe localised pain (e.g. RIF), inconsolable crying/drawing up legs, blood in stool (redcurrant jelly), fever in infant < 3 months, testicular pain',
      'Feeding/hydration, wet nappies, recent viral illness, medication, travel history',
    ],
    examination: [
      'Paediatric observations: HR, RR, temp, CRT, oxygen saturations, alertness (AVPU)',
      'Hydration status, fontanelle, mucosal moisture, skin turgor',
      'Abdominal palpation (distension, guarding, rebound, Rovsing sign, mass, organomegaly, groin hernias, genitalia/testes in boys)',
      'Ear, nose, throat and chest examination (mesenteric adenitis, lower lobe pneumonia)',
    ],
    investigations: [
      'Urine dipstick and microscopy/culture (UTI)',
      'Stool culture if persistent diarrhoea, mucus, or blood',
      'Bloods (FBC, CRP, U&E, LFT, amylase) if considering hospital assessment',
      'Ultrasound (suspected appendicitis, intussusception, ovarian pathology)',
    ],
    differentials: [
      'Gastroenteritis',
      'Constipation',
      'Mesenteric adenitis (recent URTI)',
      'UTI / Pyelonephritis',
      'Appendicitis',
      'Functional abdominal pain / abdominal migraine',
    ],
    rare: [
      'Appendicitis (especially perforation)',
      'Intussusception (infants 3-24 months, paroxysmal colic, redcurrant jelly stool)',
      'Incarcerated inguinal hernia',
      'Testicular torsion (always examine scrotum in boys with abdo pain!)',
      'Malrotation with volvulus',
      'Diabetic ketoacidosis (DKA presenting as acute abdo pain)',
      'Haemolytic Uraemic Syndrome (HUS)',
      'Non-accidental injury (NAI)',
    ],
    plan: [
      'Supportive hydration, oral rehydration solution (ORS), age-appropriate paracetamol/ibuprofen',
      'Manage constipation if confirmed (macrogol/osmotic laxatives)',
      'Reassurance for simple functional/viral mesenteric adenitis once red flags excluded',
    ],
    safetynetting: [
      'Urgent emergency review if: green/bilious vomit, worsening focal pain, child becomes lethargic/unresponsive, bloody stools, high persistent fever, or scrotal swelling/pain',
    ],
    followup: [
      'Review within 24 hours if uncertain or symptoms evolve',
      'Routine review in 2-4 weeks if recurrent functional symptoms',
    ],
    referral: [
      'Immediate paediatric emergency: suspected acute surgical abdomen, bilious vomiting, peritonism, suspected testicular torsion, signs of sepsis or shock, DKA',
      'Outpatient paediatric referral: chronic unresolving pain, weight faltering, systemic symptoms',
    ],
  },

  // 3. Acne Vulgaris
  {
    letter: 'A',
    title: 'Acne Vulgaris',
    icon: '🧴',
    history: [
      'Duration, severity, distribution (face, chest, back), psychological impact (DLQI / CADI)',
      'Previous treatments tried, duration of use, adherence, side effects',
      'Skincare routine, use of comedogenic oils/cosmetics',
      'Female patients: menstrual cycle regularity, hirsutism, alopecia, PCOS symptoms, contraception, pregnancy planning (teratogenicity risk!)',
    ],
    examination: [
      'Skin lesion morphology: open/closed comedones, inflammatory papules, pustules, nodules, pseudocysts',
      'Severity grading: mild (comedonal/few papules), moderate (widespread inflammatory), severe (nodulocystic, scarring)',
      'Presence of post-inflammatory erythema, hyperpigmentation, or scarring (ice-pick, boxcar, keloid)',
      'Signs of hyperandrogenism in females: hirsutism, central obesity, acanthosis nigricans',
    ],
    investigations: [
      'Usually clinical diagnosis; no routine swabs needed unless suspecting Gram-negative folliculitis (treatment failure)',
      'Hormonal profile (Free androgen index, testosterone, LH, FSH, SHBG) in women with irregular periods or virilisation',
      'Pregnancy test before starting systemic retinoids or oral tetracyclines',
    ],
    differentials: [
      'Acne rosacea (erythema/telangiectasia, no comedones, older age group)',
      'Folliculitis (Malassezia or bacterial)',
      'Perioral dermatitis',
      'Pseudofolliculitis barbae',
      'Drug-induced acne (corticosteroids, lithium, anabolic steroids)',
    ],
    rare: [
      'Acne fulminans (severe ulcerating nodular acne with systemic fever, arthralgias, leukocytosis)',
      'Acne conglobata (deep burrowing interconnected abscesses)',
      'Severe psychological distress / body dysmorphic disorder / suicidal ideation',
      'PCOS or androgen-secreting adrenal/ovarian tumour',
    ],
    plan: [
      'Mild: 1st line topical fixed combination (e.g. adapalene + benzoyl peroxide, or clindamycin + benzoyl peroxide, or tretinoin + clindamycin)',
      'Moderate: Topical combination + oral antibiotic (lymecycline 408mg OD or doxycycline 100mg OD for max 12 weeks; always co-prescribe with topical BPO to prevent resistance)',
      'Hormonal: Consider combined oral contraceptive pill (e.g. containing drospirenone or co-cyprindiol) in suitable women',
      'Patient education: takes 6–8 weeks to notice improvement; avoid over-cleansing; apply sparingly',
    ],
    safetynetting: [
      'Advise on photosensitivity, skin irritation; advise immediate cessation and urgent review if systemic symptoms or severe psychological distress',
      'Strict avoidance of tetracyclines/retinoids during pregnancy',
    ],
    followup: [
      'Review at 8–12 weeks to assess therapeutic response and compliance',
    ],
    referral: [
      'Urgent referral: suspected acne fulminans',
      'Routine dermatology referral: severe nodulocystic/scarring acne, treatment failure after 2 full courses of oral antibiotics, severe psychological impact, diagnostic doubt',
    ],
  },

  // 4. Acne Rosacea
  {
    letter: 'A',
    title: 'Acne Rosacea',
    icon: '🌹',
    history: [
      'Flushing, persistent facial erythema, papules/pustules, telangiectasia; absence of comedones',
      'Triggers: temperature changes, sun exposure, alcohol, spicy food, emotional stress, hot drinks',
      'Ocular symptoms: gritty/dry eyes, blepharitis, photophobia, foreign body sensation',
      'Skin sensitivity to cosmetics, previous topical steroid use (steroid-induced rosacea)',
    ],
    examination: [
      'Centrosymmetric facial distribution: cheeks, nose, chin, forehead (sparing periocular area)',
      'Subtypes: erythematotelangiectatic, papulopustular, phymatous (rhinophyma), ocular',
      'Skin dryness, burning, stinging; look for absence of blackheads/whiteheads',
      'Slit-lamp / penlight exam for conjunctival injection, chalazion, blepharitis, corneal ulceration',
    ],
    investigations: [
      'Clinical diagnosis; no routine blood tests',
      'Skin swab if secondary infection suspected or failure of standard therapy',
    ],
    differentials: [
      'Acne vulgaris (distinguished by comedones)',
      'Seborrhoeic dermatitis (greasy scaling in nasolabial folds/eyebrows)',
      'Systemic lupus erythematosus (malar rash sparing nasolabial folds, photosensitivity)',
      'Contact dermatitis',
      'Carcinoid syndrome (episodic flushing without papules/pustules)',
    ],
    rare: [
      'Ocular rosacea with corneal keratitis or ulceration (risk of visual loss!)',
      'Severe rhinophyma with airway obstruction',
      'SLE / autoimmune connective tissue disease',
    ],
    plan: [
      'General: Avoid known triggers, daily high-factor broad-spectrum sunscreen (SPF 30-50), gentle soap-free cleansers',
      'Mild/Moderate Papulopustular: Topical ivermectin 1% once daily (most effective), or topical metronidazole 0.75%, or azelaic acid 15%',
      'Moderate/Severe Papulopustular: Oral doxycycline 40mg modified release (anti-inflammatory dose) or lymecycline 408mg OD for 8-12 weeks',
      'Persistent Erythema: Topical brimonidine gel (caution: rebound flushing)',
      'Ocular: Lid hygiene, artificial tears, oral doxycycline if blepharitis/meibomian disease',
    ],
    safetynetting: [
      'Urgent same-day ophthalmic assessment if eye pain, redness, blurred vision, or photophobia develop',
    ],
    followup: [
      'Review at 6–8 weeks to monitor response and manage tapering',
    ],
    referral: [
      'Same-day ophthalmology: suspected ocular keratitis / corneal ulceration',
      'Dermatology: severe or refractory rosacea, diagnostic uncertainty, severe rhinophyma for surgical/laser ablation',
    ],
  },

  // 5. Alcohol Misuse
  {
    letter: 'A',
    title: 'Alcohol Misuse',
    icon: '🍺',
    history: [
      'Alcohol intake quantification: units per week, pattern of drinking (binge vs continuous)',
      'Screening tools: AUDIT or AUDIT-C score, CAGE questionnaire',
      'Symptoms of dependence: morning drinking, tremors, sweating, cravings, loss of control, tolerance',
      'Complications: withdrawal seizures, DTs, blackouts, falls, head injuries, GI bleed, jaundice, memory loss',
      'Social impact: employment, relationships, driving, domestic violence, safeguarding children',
    ],
    examination: [
      'Vitals: BP (hypertension), HR, temperature, oxygen saturation',
      'General: smell of alcohol, nutritional status, spider naevi, palmar erythema, gynaecomastia, Dupuytren contracture',
      'Abdominal: hepatomegaly, splenomegaly, ascites, caput medusae',
      'Neurological: peripheral neuropathy, ataxia, tremor, nystagmus/ophthalmoplegia (Wernicke-Korsakoff!)',
      'Mental state: cognitive impairment, depression, suicidal ideation',
    ],
    investigations: [
      'Bloods: FBC (macrocytosis / raised MCV, thrombocytopenia), LFTs (elevated GGT, AST/ALT ratio > 2), U&E, bone profile, INR/clotting, blood glucose',
      'Liver ultrasound if abnormal LFTs or suspected cirrhosis/portal hypertension',
      'Non-invasive liver fibrosis staging (FIB-4 score, ELF test, FibroScan)',
    ],
    differentials: [
      'Non-alcoholic fatty liver disease (NAFLD/MASLD)',
      'Viral hepatitis (B, C)',
      'Drug-induced liver injury',
      'Other causes of macrocytosis (B12/folate deficiency, hypothyroidism)',
      'Primary psychiatric disorder (bipolar, anxiety, major depression)',
    ],
    rare: [
      'Delirium tremens (DTs: confusion, visual hallucinations, autonomic hyperactivity, seizures)',
      'Wernicke encephalopathy (triad: confusion, ataxia, ophthalmoplegia — medical emergency!)',
      'Acute variceal haemorrhage (haematemesis / melaena)',
      'Spontaneous bacterial peritonitis (SBP) in ascites',
      'Subdural haematoma following unwitnessed head trauma',
    ],
    plan: [
      'Low/Hazardous drinking: Brief intervention, FRAMES model, harm reduction advice',
      'High risk / Dependence: Do NOT advise abrupt cessation if physically dependent (risk of fatal withdrawal); refer to community alcohol team',
      'Pharmacotherapy for maintenance of abstinence: Acamprosate, oral naltrexone, or disulfiram (initiated under specialist guidance)',
      'Nutritional support: Oral thiamine (vitamin B1) and vitamin B compound strong to prevent Wernicke encephalopathy',
    ],
    safetynetting: [
      'Explain symptoms of severe withdrawal (hallucinations, severe shaking, confusion, seizures); advise calling 999 immediately',
      'DVLA rules: notify DVLA if alcohol dependent or persistent misuse',
    ],
    followup: [
      'Review in 2–4 weeks for monitoring, repeat bloods, and liaison with community drug & alcohol services',
    ],
    referral: [
      'Emergency admission: suspected Wernicke encephalopathy (urgent IV Pabrinex), delirium tremens, alcohol withdrawal seizures, acute decompensated liver failure, variceal bleeding',
      'Referral to local community addiction service for structured detoxification',
    ],
  },

  // 6. Allergic Rhinitis
  {
    letter: 'A',
    title: 'Allergic Rhinitis',
    icon: '🌿',
    history: [
      'Symptoms: sneezing, rhinorrhoea (clear), nasal congestion, itchy nose, palate, eyes, ears',
      'Timing/Pattern: Seasonal (hay fever — tree, grass, weed pollen) vs Perennial (house dust mites, pets, moulds) vs Occupational',
      'Trigger exposures, home environment (carpets, pets, dampness)',
      'Impact: sleep disturbance, daytime fatigue, school/work performance, asthma co-morbidity',
      'Family or personal history of atopy (asthma, eczema)',
    ],
    examination: [
      'Nasal inspection: pale, boggy, bluish, oedematous nasal turbinates; clear secretions; nasal polyps',
      'Eyes: allergic shiners, Dennie-Morgan folds, conjunctival injection, chemosis',
      'Throat: cobblestone appearance of posterior pharynx due to post-nasal drip',
      'Chest: auscultate for wheeze (screen for co-existing asthma)',
    ],
    investigations: [
      'Usually clinical diagnosis based on history and examination',
      'Specific IgE testing (RAST) or skin prick testing if diagnosis unclear or allergen immunotherapy considered',
      'Nasal endoscopy only if unilateral symptoms, bleeding, or suspicious mass',
    ],
    differentials: [
      'Non-allergic rhinitis (vasomotor, hormonal, drug-induced e.g. ACEi, beta-blockers)',
      'Rhinitis medicamentosa (rebound congestion from overuse of topical decongestants > 7 days)',
      'Chronic rhinosinusitis with or without nasal polyps',
      'Foreign body (especially in children with unilateral purulent discharge)',
      'CSF rhinorrhoea (unilateral clear salty fluid post-trauma)',
    ],
    rare: [
      'Unilateral nasal symptoms, blood-stained discharge, or facial pain (nasal/sinonasal malignancy)',
      'CSF leak (clear rhinorrhoea that increases on leaning forward)',
      'Wegener granulomatosis (GPA) / systemic vasculitis',
      'Anaphylaxis risk if combined with systemic allergy/food allergy',
    ],
    plan: [
      'Allergen avoidance: pollen counts, barrier balms, sunglasses, dust mite mattress covers',
      'Mild intermittent: Oral non-sedating antihistamine (cetirizine 10mg, fexofenadine 120mg, or loratadine 10mg) or intranasal antihistamine (azelastine)',
      'Moderate/Severe or persistent: Intranasal corticosteroid spray (mometasone or fluticasone, used daily and technique taught)',
      'Co-formulated nasal spray: Olopatadine/fluticasone or azelastine/fluticasone for rapid and potent dual action',
      'Nasal saline douching/irrigation as adjunct',
    ],
    safetynetting: [
      'Warn against prolonged use of OTC decongestant sprays (> 5-7 days)',
      'Return if unilateral obstruction, bleeding, visual changes, or persistent facial pain develop',
    ],
    followup: [
      'Review in 4–6 weeks to assess symptom control and compliance',
    ],
    referral: [
      'Urgent 2-week wait ENT: persistent unilateral symptoms, blood-stained discharge, recurrent epistaxis, facial deformity',
      'Routine Allergy/ENT: severe uncontrolled symptoms despite dual maximal medical therapy, consideration of sublingual/subcutaneous allergen immunotherapy (desensitisation)',
    ],
  },

  // 7. Alopecia / Hair Loss
  {
    letter: 'A',
    title: 'Alopecia / Hair Loss',
    icon: '🧑‍🦲',
    history: [
      'Pattern of hair loss: focal patches vs diffuse shedding vs receding hairline',
      'Onset, duration, rate of progression; shedding while brushing/washing',
      'Associated scalp symptoms: pruritus, burning, pain, scaling, erythema, pustules',
      'Triggers: severe illness, surgery, childbirth 2–4 months prior (telogen effluvium), rapid weight loss, crash dieting',
      'Drug history: retinoids, beta-blockers, chemotherapy, anticoagulants, oral contraceptive changes',
      'Family history of male/female pattern baldness or autoimmune conditions',
    ],
    examination: [
      'Scalp inspection: cicatricial (scarring — loss of follicular ostia) vs non-cicatricial (preserved follicular ostia)',
      'Hair pull test (gentle traction on ~50 hairs; >6 hairs indicates active shedding)',
      'Scalp skin: erythema, scale, pustules, follicular keratosis, scarring, atrophy',
      'Dermoscopy/Trichoscopy: exclamation mark hairs, yellow dots (alopecia areata), miniaturised hairs (androgenetic)',
      'Other body hair: eyebrows, eyelashes, beard, nail changes (pitting in alopecia areata)',
    ],
    investigations: [
      'Bloods: FBC, Ferritin, Thyroid function (TSH/FT4), Vitamin D, Zinc',
      'In women with hirsutism/acne: Total testosterone, SHBG, free androgen index, LH/FSH',
      'Scalp skin scrapings / hair plucks for fungal mycology if tinea capitis suspected',
      'Scalp biopsy (punch biopsy) if cicatricial/scarring alopecia is suspected',
    ],
    differentials: [
      'Alopecia areata (well-demarcated circular smooth patches, exclamation mark hairs)',
      'Androgenetic alopecia (male: bitemporal recession/vertex thinning; female: Ludwig crown widening)',
      'Telogen effluvium (diffuse shedding 2–4 months post physiological stressor)',
      'Tinea capitis (scaly patch, broken hairs, lymphadenopathy, especially children)',
      'Traction alopecia (mechanical stress along hairline)',
      'Scarring alopecias (lichen planopilaris, frontal fibrosing alopecia, discoid lupus)',
    ],
    rare: [
      'Cicatricial (scarring) alopecia: permanent follicular destruction — urgent referral needed to halt irreversible hair loss!',
      'Tinea capitis / Kerion (inflammatory fungal boggy mass requiring systemic antifungals)',
      'Secondary syphilis (moth-eaten alopecia)',
      'Scalp angiosarcoma or cutaneous metastasis',
    ],
    plan: [
      'Alopecia areata: Potent topical corticosteroid (clobetasol or betamethasone) or intralesional triamcinolone injections; 80% spontaneous regrowth in mild cases',
      'Androgenetic: Topical minoxidil 5% solution/foam; oral finasteride 1mg OD for men (discuss sexual dysfunction risk)',
      'Telogen effluvium: Reassurance, address underlying iron/thyroid deficiency, natural recovery over 6–12 months',
      'Correct underlying nutritional deficiencies (iron, vitamin D)',
    ],
    safetynetting: [
      'Warn regarding slow response (hair growth takes 3–6 months to become visible)',
      'Seek urgent review if scalp becomes tender, inflamed, scarred, or rapidly spreads',
    ],
    followup: [
      'Review at 3–6 months to assess hair regrowth and compliance',
    ],
    referral: [
      'Urgent dermatology: rapidly progressive scarring alopecia (loss of follicular ostia, scalp pain/redness), kerion',
      'Routine dermatology: extensive alopecia areata (>50% scalp), treatment-resistant hair loss, severe psychological distress',
    ],
  },

  // 8. Anaemia (B12 / Folate)
  {
    letter: 'A',
    title: 'Anaemia (B12 / Folate)',
    icon: '🥣',
    history: [
      'Symptoms of anaemia: fatigue, lethargy, dyspnoea, palpitations, lightheadedness, pallor',
      'Neurological symptoms (B12): peripheral paraesthesia, numbness, ataxia, weakness, memory loss, mood changes',
      'Dietary history: strict vegan/vegetarian (low B12), poor diet, excessive alcohol, malnutrition (low folate)',
      'GI symptoms: glossitis (beefy sore tongue), mouth ulcers, diarrhoea, previous gastric bypass or ileal resection',
      'Medications: metformin, PPIs, methotrexate, trimethoprim, anticonvulsants, hydroxycarbamide',
    ],
    examination: [
      'General: pallor, mild lemon-yellow tint (combination of pallor and mild jaundice from ineffective erythropoiesis)',
      'Oral: smooth beefy red glossitis, angular stomatitis, aphthous ulcers',
      'Neurological exam: peripheral sensation (vibration sense and proprioception affected first), Romberg sign, tendon reflexes (absent ankle jerks with extensor plantars — subacute combined degeneration of the spinal cord!)',
      'Mental state: cognitive impairment, depression, delirium',
    ],
    investigations: [
      'Full Blood Count (FBC): macrocytic anaemia (elevated MCV > 100 fL, often > 115 fL), blood film (hypersegmented neutrophils, oval macrocytes), reticulocyte count (low)',
      'Serum Vitamin B12 and Serum Folate (or red cell folate)',
      'Anti-Intrinsic Factor antibodies (highly specific for Pernicious Anaemia; anti-gastric parietal cell antibodies sensitive but less specific)',
      'Coeliac serology (anti-tTG IgA), U&E, LFT (mildly elevated unconjugated bilirubin, high LDH)',
    ],
    differentials: [
      'Other causes of macrocytosis: alcohol excess, liver disease, reticulocytosis, hypothyroidism, myelodysplasia, drug-induced',
      'Normocytic anaemia with mixed iron deficiency + B12/folate deficiency',
      'Multiple myeloma',
    ],
    rare: [
      'Subacute Combined Degeneration of the Spinal Cord (SCDSC): dorsal and lateral column degeneration — irreversible if untreated!',
      'Never administer folic acid alone before checking and treating B12 deficiency (folate precipitates or worsens subacute combined degeneration!)',
      'Severe symptomatic anaemia causing high-output heart failure or myocardial ischaemia',
      'Pernicious anaemia associated with increased risk of gastric adenocarcinoma and neuroendocrine tumours',
    ],
    plan: [
      'B12 Deficiency with Neurological Symptoms: Hydroxocobalamin 1mg IM on alternate days until no further improvement, then 1mg IM every 2 months for life',
      'B12 Deficiency without Neurological Symptoms: Hydroxocobalamin 1mg IM three times a week for 2 weeks, then 1mg IM every 3 months for life (if pernicious anaemia/malabsorption) or oral cyanocobalamin/dietary advice if nutritional',
      'Folate Deficiency: Oral Folic acid 5mg daily for 4 months (ensure B12 treatment is started first or confirmed normal!)',
      'Dietary advice on fortified foods, dairy, eggs, or B12 supplements for vegans',
    ],
    safetynetting: [
      'Urgent emergency review if chest pain, severe shortness of breath, sudden numbness, weakness, or worsening difficulty walking',
    ],
    followup: [
      'FBC and reticulocyte response at 7–10 days (brisk reticulocytosis confirms diagnosis); repeat FBC at 8–12 weeks',
    ],
    referral: [
      'Same-day medical admission: severe symptomatic anaemia (decompensation, angina), acute progressive neurological deficits (SCDSC)',
      'Gastroenterology: suspected malabsorption, coeliac disease, or persistent unexplained deficiency',
      'Haematology: diagnostic uncertainty, suspected myelodysplastic syndrome or leukaemia',
    ],
  },

  // 9. Anaemia (Iron Deficiency)
  {
    letter: 'A',
    title: 'Anaemia (Iron Deficiency)',
    icon: '🩸',
    history: [
      'Symptoms: fatigue, lethargy, dyspnoea on exertion, dizziness, palpitations, headaches, cold intolerance, pica (craving ice/clay), restless legs',
      'Blood loss screening:',
      '  - GI: melaena, rectal bleeding, change in bowel habit, dyspepsia, NSAID or aspirin use',
      '  - Gynae: heavy menstrual bleeding (menorrhagia), post-menopausal bleeding (PMB — red flag!), intermenstrual bleeding',
      '  - Renal: visible haematuria',
      'Dietary intake: vegetarian/vegan, poor dietary iron intake',
      'Malabsorption: coeliac disease, inflammatory bowel disease, previous bariatric/gastric surgery',
    ],
    examination: [
      'Vitals: tachycardia, postural hypotension, flow murmur',
      'Pallor: conjunctival pallor, palmar crease pallor, mucosal pallor',
      'Chronic iron deficiency signs: koilonychia (spoon nails), angular cheilitis, atrophic glossitis, brittle hair',
      'Abdominal examination: masses, organomegaly, tenderness; digital rectal examination (DRE) if GI symptoms',
    ],
    investigations: [
      'Full Blood Count (FBC): microcytic hypochromic anaemia (low Hb, low MCV < 80 fL, low MCH)',
      'Serum Ferritin: < 30 mcg/L diagnostic of iron deficiency; if CRP is elevated (ferritin is an acute phase reactant), transferrin saturation (< 20%) confirms iron deficiency',
      'Coeliac screen: Anti-tTG IgA with total IgA',
      'Urinalysis: check for microscopic haematuria',
      'Faecal Immunochemical Test (FIT): mandatory in primary care for suspected colorectal cancer triage',
    ],
    differentials: [
      'Anaemia of chronic disease / inflammation (normal or high ferritin, low iron, low transferrin)',
      'Thalassaemia trait (very low MCV with normal/borderline Hb and normal/high ferritin; Mentzer index < 13)',
      'Sideroblastic anaemia',
      'Lead poisoning',
    ],
    rare: [
      'Gastrointestinal malignancy (colorectal cancer, gastric cancer) — any unexplained IDA in men and post-menopausal women requires urgent investigation!',
      'Post-menopausal vaginal bleeding (endometrial carcinoma)',
      'Coeliac disease / malabsorption',
      'Severe symptomatic cardiovascular instability / angina precipitate',
    ],
    plan: [
      'Oral iron replacement: Ferrous fumarate 210mg or ferrous sulfate 200mg once daily (or alternate-day dosing to reduce hepcidin levels and gastrointestinal side effects like constipation/nausea)',
      'Continue iron for 3 months after Hb normalises to replenish marrow stores',
      'Dietary counselling: red meat, pulses, dark green leafy vegetables; vitamin C enhances absorption; avoid tea/coffee with meals',
      'IV iron infusion: consider if oral iron intolerant, severe malabsorption (IBD, bariatric), or urgent pre-op/late pregnancy requirement',
    ],
    safetynetting: [
      'Warn patient that stools will turn harmlessly black',
      'Advise urgent return if melaena, haematemesis, syncope, or severe dyspnoea occurs',
    ],
    followup: [
      'Repeat FBC at 2–4 weeks (expected Hb rise of ~10–20 g/L every 2–4 weeks); recheck ferritin at 3 months',
    ],
    referral: [
      'Urgent 2-Week-Wait (2WW) GI pathway: all men and post-menopausal women with unexplained IDA (NICE NG12), or positive FIT test',
      'Urgent 2WW Gynaecology: post-menopausal bleeding',
      'Same-day medical admission: severe symptomatic anaemia (Hb < 70 g/L or cardiovascular compromise)',
    ],
  },

  // 10. Anaphylaxis
  {
    letter: 'A',
    title: 'Anaphylaxis',
    icon: '🧨',
    history: [
      'Sudden onset and rapid progression of symptoms (usually within minutes of exposure)',
      'Known triggers: food (peanuts, tree nuts, shellfish, milk, eggs), insect venom (wasp/bee stings), drugs (antibiotics, NSAIDs, ACEi), latex, contrast media',
      'Previous allergic reactions, asthma co-morbidity (major risk factor for fatal outcome!)',
      'ABC symptoms: Airway (hoarse voice, stridor, throat swelling), Breathing (dyspnoea, wheeze), Circulation (dizziness, collapse, hypotension), Skin/Mucosa (urticaria, angioedema)',
    ],
    examination: [
      'ABCDE Emergency Assessment:',
      '  - Airway: swelling of lips, tongue, uvula; inspiratory stridor',
      '  - Breathing: tachypnoea, audible expiratory wheeze, intercostal recession, silent chest, cyanosis',
      '  - Circulation: tachycardia, weak central pulses, profound hypotension, capillary refill > 3s',
      '  - Disability: confusion, lethargy, loss of consciousness (hypoxia/hypotension)',
      '  - Exposure: generalised urticarial wheals, flushing, conjunctival oedema',
    ],
    investigations: [
      'Acute diagnosis is CLINICAL — DO NOT DELAY ADRENALINE FOR ANY TEST!',
      'Serial Mast Cell Tryptase: 1st sample as soon as patient stable, 2nd sample at 1–2 hours post-onset, 3rd baseline sample at >24 hours',
      'Post-recovery: Specific IgE / skin prick allergy testing under specialist allergy supervision',
    ],
    differentials: [
      'Vasovagal syncope (pallor, bradycardia, no urticaria/stridor, rapid recovery on lying flat)',
      'Severe acute asthma (wheeze without urticaria or upper airway angioedema)',
      'Panic attack / vocal cord dysfunction (stridor-like noise, tachypnoea, tingling fingers, normal sats)',
      'Scombroid fish poisoning (histamine toxicity from spoiled fish)',
      'Hereditary angioedema (angioedema without urticaria or pruritus)',
    ],
    rare: [
      'Biphasic anaphylaxis: recurrence of severe symptoms 1–72 hours later in up to 20% of cases!',
      'Refractory anaphylaxis: failure to respond to repeated doses of IM adrenaline',
      'Concomitant beta-blocker therapy (blunts response to adrenaline; may require glucagon)',
      'Fatal asphyxia from laryngeal oedema',
    ],
    plan: [
      'IMMEDIATE ACTIONS (ABCDE):',
      '1. Call 999 / Resus Crash Call immediately!',
      '2. Remove trigger if present (stop drug infusion, remove insect stinger without squeezing)',
      '3. Lie patient flat with legs elevated (do NOT stand up!); if breathing difficult, allow sitting propped up',
      '4. Intramuscular (IM) ADRENALINE 1:1000 (1 mg/mL) into anterolateral mid-thigh: Adult/Child >12y: 500 mcg (0.5 mL); Child 6-12y: 300 mcg; Child 6m-6y: 150 mcg',
      '5. High-flow oxygen (15 L/min via non-rebreathe mask)',
      '6. IV fluid challenge (500–1000 mL crystalloid stat in adults; 10 mL/kg in children)',
      '7. REPEAT IM ADRENALINE every 5 minutes if no improvement!',
    ],
    safetynetting: [
      'Must be observed in hospital for at least 6–8 hours (or 12–24 hours if high-risk / biphasic risk)',
      'Provide 2 x Adrenaline Auto-Injectors (AAIs — e.g. EpiPen / Jext) on discharge with hands-on training',
      'Comprehensive written allergy management plan',
    ],
    followup: [
      'Routine primary care review within 1–2 weeks of discharge: verify AAI technique, check expiry dates, review asthma control',
    ],
    referral: [
      'IMMEDIATE 999 blue light hospital admission for every suspected case of anaphylaxis!',
      'Referral to specialist allergy clinic is mandatory following any confirmed or suspected anaphylaxis',
    ],
  },

  // 11. Ankle Pain / Sprain
  {
    letter: 'A',
    title: 'Ankle Pain / Sprain',
    icon: '🦶',
    history: [
      'Mechanism of injury: inversion (most common — lateral ligament complex), eversion (deltoid ligament, syndesmosis), axial load, direct blow',
      'Immediate ability to bear weight (4 steps immediately post-injury and in clinic)',
      'Onset of swelling: immediate rapid swelling (haemarthrosis / fracture) vs gradual onset over hours',
      'Audible pop or snap at the time of injury; past history of ankle instability or sprains',
    ],
    examination: [
      'Visual inspection: swelling, ecchymosis, gross deformity, skin integrity / open wounds',
      'Palpation — Ottawa Ankle Rules: bone tenderness along distal 6 cm posterior edge/tip of malleoli, base of 5th metatarsal, navicular bone',
      'High ankle examination: squeeze test (syndesmotic injury), proximal fibula palpation (Maisonneuve fracture!)',
      'Achilles tendon integrity: Simmonds-Thompson squeeze test, palpable gap',
      'Neurovascular status: dorsalis pedis and posterior tibial pulses, sensation',
    ],
    investigations: [
      'Ankle X-rays (AP, lateral, mortise) if Ottawa Ankle Rules criteria met: bone tenderness along distal 6 cm of malleoli OR inability to bear weight 4 steps',
      'Foot X-rays if tenderness at base of 5th metatarsal or navicular',
      'Ultrasound or MRI if chronic instability, persistent pain > 6 weeks, or suspected tendon rupture',
    ],
    differentials: [
      'Lateral ligament sprain (ATFL, CFL, PTFL)',
      'Syndesmotic sprain ("high ankle sprain")',
      'Ankle fracture (bimalleolar, trimalleolar, Weber A/B/C)',
      'Base of 5th metatarsal fracture (Jones / avulsion)',
      'Maisonneuve fracture (spiral fracture of proximal fibula with syndesmosis rupture)',
      'Achilles tendon rupture',
      'Peroneal tendon subluxation or tear',
    ],
    rare: [
      'Open fracture or dislocation (orthopaedic emergency)',
      'Maisonneuve fracture (missed if proximal fibula not examined!)',
      'Complete Achilles tendon rupture (often misdiagnosed as ankle sprain)',
      'Compartment syndrome of the leg or foot',
      'Neurovascular compromise',
    ],
    plan: [
      'Acute Sprain Management: P.O.L.I.C.E. (Protection, Optimal Loading, Ice, Compression, Elevation) — avoid prolonged complete immobilisation',
      'Early protected weight-bearing and functional support (lace-up ankle brace or tubular bandage)',
      'Analgesia: Paracetamol; short-course NSAIDs (ibuprofen / naproxen) after first 48 hours',
      'Early rehabilitation: range of motion, calf stretching, proprioceptive balance exercises',
    ],
    safetynetting: [
      'Return immediately if inability to weight bear, severe numbness, cold pale toes, or uncontrollable pain',
      'Review at 2–3 weeks if no progressive improvement',
    ],
    followup: [
      'Routine review in 10–14 days for persistent symptoms; physiotherapy referral if moderate-to-severe grade II/III sprain',
    ],
    referral: [
      'Same-day A&E / Fracture Clinic: fracture on X-ray, positive Ottawa rules with severe trauma, gross deformity, neurovascular compromise, high ankle syndesmosis diastasis, Achilles tendon rupture',
      'Outpatient Orthopaedics / Physio: mechanical instability, osteochondral lesion of talus, persistent pain > 6–8 weeks',
    ],
  },

  // 12. Anxiety (Generalised)
  {
    letter: 'A',
    title: 'Anxiety (Generalised)',
    icon: '😰',
    history: [
      'Nature of anxiety: excessive, uncontrollable worry about multiple everyday issues on more days than not for ≥ 6 months',
      'Associated somatic symptoms: restlessness, feeling on edge, muscle tension, fatigability, irritability, sleep disturbance, tension headaches, palpitations, tremulousness',
      'Assessment tools: GAD-7 questionnaire (mild 5-9, moderate 10-14, severe 15-21)',
      'Screening for panic attacks, agoraphobia, OCD, social anxiety, PTSD, depression (PHQ-9)',
      'Substance/medication use: caffeine excess, alcohol misuse, recreational drugs, steroids, bronchodilators',
      'Risk assessment: self-harm, suicidal ideation, ability to care for self/dependents',
    ],
    examination: [
      'General appearance: motor restlessness, fidgeting, hyperventilation, tremors, diaphoresis',
      'Cardiovascular: tachycardia, elevated blood pressure',
      'Thyroid examination: goitre, lid lag, exophthalmos',
      'Mental state examination: anxious affect, racing thoughts, worry, preserved reality testing',
    ],
    investigations: [
      'Exclude organic causes: Thyroid function tests (TSH/FT4 to rule out hyperthyroidism)',
      'FBC (anaemia), Fasting blood glucose or HbA1c (hypoglycaemia episodes)',
      'U&E, Calcium',
      'ECG if palpitations or starting psychotropic medications that prolong QTc',
    ],
    differentials: [
      'Panic disorder',
      'Major depressive disorder with anxious distress',
      'Obsessive-compulsive disorder (OCD)',
      'Hyperthyroidism / thyrotoxicosis',
      'Phaeochromocytoma',
      'Cardiac arrhythmias (SVT, AF)',
      'Substance withdrawal (alcohol, benzodiazepines) or caffeine intoxication',
    ],
    rare: [
      'High risk of suicide or self-harm (always ask directly and document!)',
      'Phaeochromocytoma (paroxysmal headache, sweating, palpitations, hypertension)',
      'Medication-induced akathisia',
      'Severe self-neglect or vulnerability',
    ],
    plan: [
      'Step 1: Identification, assessment, psychoeducation, active monitoring, sleep hygiene, caffeine reduction, lifestyle/exercise',
      'Step 2 (Mild-to-moderate): Low-intensity psychological interventions (guided self-help, digital CBT)',
      'Step 3 (Moderate-to-severe / unresponsive to Step 2): High-intensity CBT or 1st line SSRI (sertraline is NICE 1st choice; fluoxetine or citalopram alternative)',
      'Advise that SSRIs take 2–4 weeks for effect and anxiety may temporarily increase in first 1–2 weeks',
      'DO NOT offer benzodiazepines for long-term management (risk of tolerance/dependence; use only for short-term crisis ≤ 2 weeks)',
    ],
    safetynetting: [
      'Crisis contact numbers (local mental health crisis team, NHS 111, Samaritans 116 123)',
      'Advise patient to contact GP immediately if suicidal thoughts, severe restlessness, or worsening distress occur',
    ],
    followup: [
      'Review at 2 weeks after starting antidepressant (or 1 week if patient < 30 years old), then at 4, 8, 12 weeks',
      'Continue successful treatment for at least 6 months after full remission',
    ],
    referral: [
      'Same-day Emergency Mental Health Crisis Team / A&E: imminent risk of suicide, severe self-harm, self-neglect, or psychotic features',
      'Secondary Mental Health / CMHT: severe, complex, refractory GAD failing multiple NICE-recommended therapies',
    ],
  },

  // 13. Assault
  {
    letter: 'A',
    title: 'Assault',
    icon: '🚨',
    history: [
      'Clinical priority: immediate medical stabilisation, physical safety, safeguarding, and trauma-informed care',
      'Nature of assault: physical blunt trauma, weapon involved (knife, bottle, firearm), strangulation/choking, sexual assault, head injury with loss of consciousness',
      'Timing and location of incident; relationship to perpetrator (intimate partner violence / domestic abuse, stranger, known acquaintance)',
      'Current safety: is the perpetrator present or waiting outside? Are children or vulnerable adults at risk?',
      'Symptoms: loss of consciousness, amnesia, headache, neck pain, breathing difficulty, visual changes, dental injury, genital bleeding/pain',
      'Tetanus status, previous medical history, substance involvement',
    ],
    examination: [
      'Chaperone should always be present; consent obtained and documented carefully',
      'Vital signs: GCS score, BP, HR, RR, SpO2, temperature',
      'Detailed systematic head-to-toe examination: scalp lacerations, periorbital haematoma, mastoid ecchymosis, CSF rhinorrhoea/otorrhoea, facial bone step-offs, dental trauma, neck ligature marks/petechiae',
      'Forensic Documentation: precise objective anatomical documentation (body map), measure wound size (cm), colour, shape; avoid speculative statements on age or weapon',
    ],
    investigations: [
      'Based on clinical findings: urgent CT Head / C-spine (NICE head injury criteria)',
      'X-rays (facial bones, chest, extremities)',
      'Urine pregnancy test and STI screening if sexual assault',
      'Forensic samples: refer directly to Sexual Assault Referral Centre (SARC) before showering or cleaning wounds if within 7 days',
    ],
    differentials: [
      'Accidental trauma / fall',
      'Self-harm',
      'Intimate partner violence vs stranger assault',
      'Pathological fracture',
      'Coagulation disorder causing spontaneous bruising',
    ],
    rare: [
      'Intracranial haemorrhage (extradural, subdural, subarachnoid)',
      'Occult cervical spine injury',
      'Non-fatal strangulation: high risk of delayed stroke (carotid dissection) or acute airway compromise from laryngeal fracture!',
      'Ongoing domestic homicide risk (use DASH risk assessment)',
      'Immediate safeguarding risk to children in the household (mandatory notification)',
    ],
    plan: [
      'Immediate medical treatment: wound cleaning, suture/closure, analgesia, tetanus toxoid/immunoglobulin booster',
      'Non-fatal strangulation: requires emergency hospital assessment even if initially asymptomatic',
      'Emergency contraception (oral levonorgestrel or ulipristal, or copper IUD) and HIV PEP (within 72 hours) / Hepatitis B prophylaxis if sexual assault',
      'Provide contact numbers for National Domestic Abuse Helpline (0808 2000 247), local IDVA, SARC',
      'Complete DASH risk assessment and MARAC referral if high risk',
    ],
    safetynetting: [
      'Red flag discharge advice: worsening headache, vomiting, neck swelling, hoarseness, dizziness, neurological deficit',
      'Safe exit plan: provide discreet contact details, emergency police 999 (silent solution: press 55)',
    ],
    followup: [
      'Clinical review in 48–72 hours for wound check and reassessment of safety/psychological wellbeing',
    ],
    referral: [
      'Immediate 999 / Emergency Department: severe head injury, loss of consciousness, neck strangulation, penetrating trauma, fractures, acute haemorrhage',
      'Immediate SARC referral for acute forensic examination and crisis support following sexual assault',
      'Children’s / Adult Social Care safeguarding referral if children or vulnerable dependents involved',
    ],
  },

  // 14. Asthma (Acute Exacerbation)
  {
    letter: 'A',
    title: 'Asthma (Acute Exacerbation)',
    icon: '𫠒',
    history: [
      'Speed of onset and duration of worsening breathlessness, wheeze, cough, chest tightness',
      'Response to inhaled bronchodilators (frequency of SABA / blue inhaler use in past 24 hours)',
      'Trigger: viral URTI, allergen exposure, cold air, exercise, NSAIDs, non-adherence to preventer ICS',
      'High-risk history: previous ICU/HDU admission or intubation, hospitalisation in past year, brittle asthma, frequent oral steroid courses, psychosocial vulnerability',
      'Measure Peak Expiratory Flow (PEF) and compare with patient’s best or predicted value',
    ],
    examination: [
      'Assess severity category (Moderate vs Severe vs Life-threatening):',
      '  - Moderate: SpO2 ≥ 92%, PEF 50–75% best/predicted, talking in sentences, HR < 110, RR < 25',
      '  - Severe: PEF 33–50% best/predicted, cannot complete sentences in one breath, RR ≥ 25/min, HR ≥ 110/min, accessory muscle use',
      '  - Life-threatening: PEF < 33% best/predicted, SpO2 < 92%, silent chest, cyanosis, poor respiratory effort, bradycardia/arrhythmia, exhaustion, confusion/coma',
      'Auscultation: widespread polyphonic expiratory wheeze (or ominous silent chest in life-threatening collapse)',
    ],
    investigations: [
      'Peak Expiratory Flow (PEF) — essential before and after bronchodilator treatment',
      'Pulse oximetry (SpO2)',
      'Blood gas (ABG/VBG) in hospital if severe/life-threatening (normal or elevated PaCO2 indicates impending respiratory arrest!)',
      'Chest X-ray only if suspected pneumothorax, consolidation, or failure to respond to treatment',
    ],
    differentials: [
      'Acute COPD exacerbation',
      'Anaphylaxis',
      'Foreign body inhalation (especially children)',
      'Acute pulmonary oedema / heart failure ("cardiac asthma")',
      'Pulmonary embolism',
      'Pneumothorax',
      'Hyperventilation / panic attack',
    ],
    rare: [
      'Life-threatening asthma: silent chest, exhaustion, cyanosis, bradycardia — medical emergency!',
      'Tension pneumothorax complicating acute asthma',
      'Impending respiratory arrest (normal or high PaCO2 on blood gas)',
      'Near-fatal asthma attack',
    ],
    plan: [
      'Immediate Management (Primary Care):',
      '  - High-flow oxygen if life-threatening or severe with SpO2 < 92% (target 94–98%)',
      '  - SABA Bronchodilator: Salbutamol 100 mcg via spacer (4–10 puffs, 1 puff every 30–60 seconds, repeated every 10–20 mins) OR oxygen-driven nebulised salbutamol 5 mg',
      '  - Add nebulised Ipratropium bromide 0.5 mg if severe or life-threatening',
      '  - Systemic Corticosteroids: Oral Prednisolone 40–50 mg daily for at least 5 days (or until recovery), OR IV hydrocortisone 100 mg if unable to swallow',
      'If Life-Threatening: Give immediate IM Adrenaline (0.5 mg 1:1000) if any suspicion of anaphylaxis or shock, and call 999 IMMEDIATELY!',
    ],
    safetynetting: [
      'Advise patient to use inhaler via spacer, continue prednisolone course',
      'Clear written asthma action plan: seek emergency help immediately if PEF falls below 50%, breathless at rest, or reliever lasts < 4 hours',
    ],
    followup: [
      'Mandatory review within 48 hours of an acute attack',
      'Review at 2–4 weeks: check inhaler technique, check compliance with preventer (ICS or ICS-formoterol MART), check triggers',
    ],
    referral: [
      'Immediate 999 Blue Light transfer: any life-threatening features, severe asthma failing to respond promptly to nebuliser/spacer within 15–30 mins, persistent PEF < 50%',
      'Routine respiratory referral: frequent exacerbations, unclear diagnosis, suspected severe refractory asthma for biologic therapy',
    ],
  },

  // 15. Back Pain (Low Back Pain)
  {
    letter: 'B',
    title: 'Back Pain (Low Back Pain)',
    icon: '🦴',
    history: [
      'Onset, duration, mechanical vs inflammatory features (morning stiffness > 30 mins improving with exercise suggests axial SpA)',
      'Radiation down legs, dermatomal distribution (sciatica / radicular pain)',
      'RED FLAGS (Cauda Equina Syndrome): bilateral sciatica, saddle anaesthesia, bladder dysfunction (urinary retention or incontinence), faecal incontinence, severe progressive neurological deficit',
      'Other red flags: thoracic back pain, history of cancer, unexplained weight loss, fever/IVDU (spinal infection), trauma/osteoporosis (fracture)',
    ],
    examination: [
      'Gait, spinal posture, tenderness to percussion (vertebral body fracture or discitis)',
      'Range of spinal movement (flexion, extension, lateral rotation)',
      'Neurological examination of lower limbs: L4 (knee jerk, medial leg sensation), L5 (great toe extension, lateral calf sensation), S1 (ankle jerk, plantarflexion, lateral foot sensation)',
      'Straight leg raise test (positive for nerve root irritation if radicular pain reproduced between 30–70 degrees)',
      'Digital rectal exam (anal tone) and perianal pinprick sensation if cauda equina suspected',
    ],
    investigations: [
      'Routine imaging is NOT recommended for non-specific low back pain without red flags (NICE NG59)',
      'Emergency MRI Spine (same day): suspected cauda equina syndrome, spinal cord compression, spinal epidural abscess',
      'Urgent MRI Spine (within 2-4 weeks): suspected spinal malignancy, axial spondyloarthritis',
      'Bloods (ESR, CRP, FBC, bone profile, myeloma screen) if inflammatory, infectious, or malignant causes suspected',
    ],
    differentials: [
      'Non-specific mechanical low back pain (musculoskeletal / facet joint)',
      'Lumbar radiculopathy / sciatica (herniated disc, spinal stenosis)',
      'Axial Spondyloarthritis / Ankylosing spondylitis',
      'Osteoporotic vertebral compression fracture',
      'Abdominal aortic aneurysm (AAA — tearing pain radiating to back)',
      'Renal pathology (pyelonephritis, renal colic)',
    ],
    rare: [
      'Cauda Equina Syndrome (CES — surgical emergency within hours to prevent permanent bladder/bowel paralysis!)',
      'Spinal epidural abscess / discitis',
      'Spinal metastasis / myeloma / cord compression',
      'Ruptured abdominal aortic aneurysm (AAA)',
    ],
    plan: [
      'Active management: encourage remaining physically active, avoid prolonged bed rest',
      'First-line oral analgesia: oral NSAIDs at lowest effective dose (e.g. naproxen 500mg BD + PPI co-prescription); avoid paracetamol alone or long-term opioids (NICE NG59)',
      'Consider short course weak opioid (codeine) only if NSAIDs contraindicated or insufficient',
      'Non-pharmacological: group exercise programmes, physiotherapy, manual therapy',
      'Neuropathic pain for radiculopathy: consider trial of amitriptyline, duloxetine, or gabapentin/pregabalin',
    ],
    safetynetting: [
      'Provide Cauda Equina warning card: seek immediate emergency medical care (A&E / 999) if numbness around buttocks/genitals, difficulty passing urine, loss of bowel control, or bilateral leg weakness',
    ],
    followup: [
      'Review in 4–6 weeks if pain persists or fails to improve as expected',
    ],
    referral: [
      'Immediate Emergency Transfer (A&E): suspected cauda equina syndrome or spinal cord compression',
      'Urgent 2-Week-Wait pathway: suspected spinal malignancy or metastasis',
      'Routine specialist referral (orthopaedics/neurosurgery/pain team): persistent radicular pain > 6-12 weeks failing conservative therapy',
    ],
  },

  // 16. Chest Pain
  {
    letter: 'C',
    title: 'Chest Pain',
    icon: '💔',
    history: [
      'SOCRATES analysis: Site (central, retrosternal, epigastric), Onset (sudden, exertion, at rest), Character (crushing, heavy, sharp, tearing, pleuritic), Radiation (left arm, jaw, neck, back), Associated symptoms (dyspnoea, diaphoresis, nausea, presyncope), Timing/Duration, Exacerbating/Relieving (exertion, GTN, breathing, posture), Severity',
      'Cardiovascular risk factors: smoking, diabetes, hypertension, dyslipidaemia, family history of premature CAD (<55m, <65f)',
      'VTE risk factors: immobility, malignancy, recent surgery, previous DVT/PE, travel, OCP/HRT',
    ],
    examination: [
      'Vital signs: HR, BP (check both arms if aortic dissection suspected!), RR, SpO2, temperature',
      'Cardiovascular: heart sounds, new murmurs (aortic regurgitation in dissection), elevated JVP, peripheral oedema',
      'Respiratory: bilateral breath sounds, focal crackles, wheeze, absent breath sounds (pneumothorax)',
      'Chest wall palpation: focal costochondral tenderness (reproduction of pain does not entirely exclude ACS, but suggests costochondritis)',
      'Legs: unilateral calf swelling, erythema, tenderness (DVT)',
    ],
    investigations: [
      'Immediate 12-lead ECG in primary care: look for ST elevation (STEMI), ST depression, T wave inversion, path Q waves, new LBBB, S1Q3T3 (PE), pericarditis (diffuse saddle ST elevation)',
      'High-sensitivity Troponin (in hospital / emergency setting; repeat at 1-3 hours depending on assay)',
      'Chest X-ray: cardiomegaly, mediastinal widening (dissection), pneumothorax, pneumonia',
      'CT Pulmonary Angiogram (CTPA) if PE suspected; CT Aorta if dissection suspected',
    ],
    differentials: [
      'Acute Coronary Syndrome (STEMI, NSTEMI, Unstable Angina)',
      'Stable Angina Pectoris',
      'Pulmonary Embolism (PE)',
      'Aortic Dissection',
      'Pericarditis / Myocarditis',
      'Pneumothorax (spontaneous or tension)',
      'Gastro-oesophageal reflux disease (GORD) / Oesophageal spasm',
      'Costochondritis / Musculoskeletal chest wall pain',
      'Panic attack / anxiety',
    ],
    rare: [
      'Acute myocardial infarction (STEMI / NSTEMI)',
      'Acute aortic dissection (tearing chest pain radiating to interscapular back, pulse deficit, BP asymmetry > 20 mmHg)',
      'Tension pneumothorax (tracheal deviation, hypotension, unilateral absent breath sounds)',
      'Massive pulmonary embolism (hypotension, right heart strain, syncope)',
      'Boerhaave syndrome (spontaneous oesophageal rupture post vomiting)',
      'Cardiac tamponade (Beck triad: hypotension, muffled heart sounds, distended neck veins)',
    ],
    plan: [
      'Immediate Emergency Management for Suspected ACS in Primary Care:',
      '  - Call 999 for emergency ambulance immediately',
      '  - Aspirin 300 mg chewed stat',
      '  - Sublingual GTN spray 1-2 puffs (caution if hypotensive or taken PDE5 inhibitors in past 24h)',
      '  - Supplemental oxygen ONLY if SpO2 < 94% (or < 88% in COPD hypercapnic risk)',
      '  - Pain relief: IV diamorphine or morphine 2.5-5 mg if paramedic / stocked',
      'For stable, non-acute chest pain: structured clinical assessment (NICE CG95); refer to Rapid Access Chest Pain Clinic (RACPC) for CT coronary angiography',
    ],
    safetynetting: [
      'If non-cardiac chest pain diagnosed: instruct patient to call 999 immediately if pain becomes crushing, radiates to jaw/arm, or accompanied by sweating, shortness of breath, or dizziness',
    ],
    followup: [
      'Post-discharge ACS follow-up: cardiac rehabilitation, secondary prevention titration (ACEi, beta-blocker, dual antiplatelets, high-intensity statin)',
      'Routine review for musculoskeletal chest pain in 2–3 weeks',
    ],
    referral: [
      'Immediate 999 Emergency Blue Light transfer: suspected ACS, acute pulmonary embolism, aortic dissection, pneumothorax',
      'Urgent RACPC referral (within 2 weeks): suspected new-onset stable angina',
    ],
  },

  // 17. Cough
  {
    letter: 'C',
    title: 'Cough (Acute & Chronic)',
    icon: '🗣️',
    history: [
      'Duration: Acute (< 3 weeks), Subacute (3–8 weeks), Chronic (> 8 weeks)',
      'Character: dry/tickly vs productive (purulent green/yellow, clear, frothy)',
      'HAEMOPTYSIS: quantity, frequency, duration (major red flag!)',
      'Associated symptoms: fever, chills, breathlessness, wheeze, chest pain, weight loss, night sweats, heartburn/acid regurgitation, hoarseness, post-nasal drip',
      'Smoking history (pack-years), occupational exposures (asbestos, silica, dusts)',
      'Drug history: ACE inhibitors (causes persistent dry cough in up to 15% of patients due to bradykinin accumulation!)',
    ],
    examination: [
      'Vitals: temp, HR, RR, SpO2, BP',
      'Upper airway: pharyngeal cobblestoning (post-nasal drip), nasal mucosa, tonsils, cervical lymphadenopathy',
      'Respiratory examination: chest expansion, percussion (dullness in consolidation/effusion), auscultation (crackles, wheeze, bronchial breathing, pleural rub)',
      'Cardiovascular: signs of heart failure (elevated JVP, basal crackles, peripheral oedema)',
      'Finger clubbing: bronchiectasis, lung cancer, idiopathic pulmonary fibrosis, thoracic empyema',
    ],
    investigations: [
      'Urgent Chest X-ray (within 2 weeks) for persistent unexplained cough > 3 weeks in smokers or patients ≥ 40 years old (NICE NG12)',
      'Spirometry with bronchodilator reversibility (asthma, COPD)',
      'Sputum microscopy, culture & sensitivity (if recurrent or severe purulent sputum)',
      'FBC, CRP, Ferritin; sweat chloride test or CT thorax if bronchiectasis suspected',
    ],
    differentials: [
      'Acute viral upper respiratory tract infection (URTI)',
      'Acute bronchitis / Pneumonia',
      'Asthma (cough-variant asthma)',
      'Chronic Obstructive Pulmonary Disease (COPD)',
      'Gastro-oesophageal reflux disease (GORD)',
      'Upper Airway Cough Syndrome (post-nasal drip / rhinosinusitis)',
      'ACE-inhibitor-induced cough',
      'Bronchiectasis',
    ],
    rare: [
      'Bronchogenic lung carcinoma / pleural mesothelioma',
      'Tuberculosis (TB — night sweats, weight loss, haemoptysis, endemic travel)',
      'Inhaled foreign body',
      'Pertussis (Whooping cough — paroxysmal coughing fits ending with inspiratory whoop or post-tussive vomiting)',
      'Interstitial lung disease (idiopathic pulmonary fibrosis — bibasal fine Velcro inspiratory crackles)',
    ],
    plan: [
      'Acute viral cough: reassurance (median duration of acute cough is 18–21 days!); hydration, honey (>1 year), simple linctus, pelargonium; avoid routine antibiotics',
      'Pneumonia (CRB-65 = 0 in primary care): Amoxicillin 500mg TDS for 5 days (or doxycycline 200mg stat then 100mg OD for 5 days)',
      'ACEi cough: stop ACEi and switch to ARB (e.g. losartan); cough resolves within 1–4 weeks',
      'GORD cough: lifestyle measures + trial of PPI (omeprazole 20mg BD) for 8 weeks',
      'Asthma cough: trial of inhaled corticosteroid (ICS) or ICS-formoterol',
    ],
    safetynetting: [
      'Seek urgent emergency review if haemoptysis, new shortness of breath, pleuritic chest pain, confusion, or cyanosis occurs',
      'Return if cough lasts > 3–4 weeks or constitutional symptoms (unexplained weight loss, night sweats) develop',
    ],
    followup: [
      'Review at 6 weeks post-pneumonia with follow-up CXR to confirm radiological resolution and exclude underlying endobronchial malignancy',
      'Review at 4–8 weeks for chronic cough targeted therapy trial',
    ],
    referral: [
      'Urgent 2-Week-Wait Suspected Lung Cancer Pathway (NICE NG12): CXR findings suspicious of lung cancer, or aged ≥40 with unexplained haemoptysis',
      'Immediate hospital admission: severe pneumonia (CRB-65 ≥ 1-2, SpO2 < 92%), massive haemoptysis, respiratory failure',
      'Routine respiratory referral: chronic unexplained cough failing empirical trials',
    ],
  },

  // 18. Depression
  {
    letter: 'D',
    title: 'Depression',
    icon: '🌧️',
    history: [
      'Core DSM-5 / ICD-11 symptoms (at least 2 weeks duration): persistent low mood / sadness, anhedonia (loss of interest/pleasure), fatigue / low energy',
      'Biological symptoms: sleep disturbance (early morning waking), diurnal mood variation (worse in morning), appetite/weight change, psychomotor agitation or retardation, loss of libido, poor concentration',
      'Standardised tools: PHQ-9 score (0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 severe)',
      'Screening for bipolar disorder (episodes of hypomania/mania, grandiosity, reduced need for sleep)',
      'Substance misuse, psychosocial stressors, bereavement, domestic abuse',
      'DIRECT SUICIDE & SELF-HARM RISK ASSESSMENT: suicidal thoughts, plans, intent, past attempts, protective factors, access to lethal means',
    ],
    examination: [
      'General appearance: unkempt, poor eye contact, flattened or blunted affect, tearfulness, psychomotor retardation, slowed speech',
      'Cognitive assessment: mini-mental exam if elderly (depressive pseudodementia)',
      'Thyroid / physical examination if somatic signs of organic illness',
    ],
    investigations: [
      'Exclude organic mimics: Thyroid function tests (TSH/FT4 — rule out hypothyroidism)',
      'FBC (anaemia), Serum B12 & Folate, Vitamin D',
      'U&E, LFT, Bone profile (hypercalcaemia can cause depression)',
      'HbA1c / fasting glucose, toxicology screen if indicated',
    ],
    differentials: [
      'Bipolar affective disorder (crucial: antidepressants can precipitate manic switch!)',
      'Adjustment disorder with depressed mood',
      'Hypothyroidism',
      'Dementia / early cognitive decline in older adults',
      'Persistent depressive disorder (dysthymia)',
      'Bereavement / normal grief reaction',
      'Substance-induced depressive disorder',
    ],
    rare: [
      'High suicide risk with active intent and plan (emergency psychiatric intervention)',
      'Psychotic depression (mood-congruent auditory hallucinations, nihilistic/delusional guilt e.g. Cotard syndrome)',
      'Severe catatonia / stupor',
      'Severe depressive pseudodementia mimicking Alzheimer disease',
    ],
    plan: [
      'Step 1 (Mild depression): Psychoeducation, sleep hygiene, physical exercise, active monitoring; low-intensity psychological interventions (guided self-help, digital CBT)',
      'Step 2 / Step 3 (Moderate to Severe depression):',
      '  - Combination of high-intensity psychotherapy (CBT) and pharmacotherapy',
      '  - 1st-line Antidepressant: SSRI (Sertraline 50mg OD is NICE 1st line; Citalopram 20mg OD or Fluoxetine 20mg OD)',
      '  - For cardiac patients: Sertraline is preferred (safest post-MI / cardiovascular disease)',
      '  - For insomnia/weight loss: Mirtazapine 15–30mg at bedtime',
      '  - Duration: continue antidepressant for at least 6 months after full symptom remission (or 2 years if recurrent depression)',
    ],
    safetynetting: [
      'Warn patient: SSRIs take 2–4 weeks to show therapeutic benefits; initial increase in anxiety or agitation may occur',
      'Provide 24/7 crisis contacts: NHS 111 mental health option, local crisis resolution team, Samaritans 116 123, Text SHOUT to 85258',
    ],
    followup: [
      'Review at 1–2 weeks after starting antidepressant (mandatory at 1 week if <30 years old due to higher suicide risk)',
      'Follow-up at 4, 8, 12 weeks to monitor response, titration, and side effects',
    ],
    referral: [
      'Immediate Emergency Mental Health Crisis Team / A&E: active suicidal intent, plans, severe self-harm, psychotic features, or severe self-neglect',
      'Secondary Mental Health Services (CMHT): treatment-resistant depression (failed 2 distinct antidepressant classes), bipolar disorder suspicion, complex co-morbidities',
    ],
  },

  // 19. Dizziness & Vertigo
  {
    letter: 'D',
    title: 'Dizziness & Vertigo',
    icon: '💫',
    history: [
      'Clarify the symptom type: True Vertigo (illusion of spinning motion) vs Presyncope (lightheadedness, feeling faint) vs Disequilibrium (unsteadiness, balance issue) vs Non-specific dizziness',
      'Timing and triggers: episodic with head movement (BPPV — lasts seconds), spontaneous attacks lasting hours (Ménière disease), constant continuous vertigo for days (vestibular neuritis / labyrinthitis)',
      'Auditory symptoms: hearing loss, tinnitus, aural fullness (labyrinthitis, Ménière disease, acoustic neuroma)',
      'Neurological red flags: diplopia, dysarthria, dysphagia, dysmetria, motor/sensory weakness (posterior circulation stroke!)',
      'Medications: antihypertensives, sedatives, anticonvulsants, aminoglycosides',
    ],
    examination: [
      'Vitals: Lying and standing blood pressure (check for postural hypotension: drop of ≥20 mmHg systolic or ≥10 mmHg diastolic after 3 mins standing)',
      'Otoscopy: examine tympanic membranes (otitis media, cholesteatoma, vesicles in Ramsay Hunt)',
      'Cranial nerves and cerebellar testing: finger-nose test, heel-shin test, dysdiadochokinesia, gait',
      'Dix-Hallpike manoeuvre (confirmatory for posterior canal BPPV: reproduces vertigo and torsional geotropic nystagmus with latency and fatiguability)',
      'HINTS Exam for Acute Vestibular Syndrome (Head Impulse, Nystagmus, Test of Skew) — more sensitive than early MRI for posterior circulation stroke!',
    ],
    investigations: [
      'Usually clinical diagnosis in primary care',
      'Pure-tone audiometry if hearing loss or asymmetrical tinnitus',
      'MRI Brain with IACs (Internal Auditory Canals) for asymmetrical sensorineural hearing loss (rule out vestibular schwannoma / acoustic neuroma)',
      'Urgent CT / MRI Brain if central neurological signs or abnormal HINTS exam',
    ],
    differentials: [
      'Benign Paroxysmal Positional Vertigo (BPPV — most common)',
      'Vestibular Neuritis (acute prolonged vertigo, preserved hearing)',
      'Labyrinthitis (acute prolonged vertigo WITH hearing loss / tinnitus)',
      'Ménière disease (triad: episodic vertigo 20m–12h, fluctuating hearing loss, tinnitus/aural fullness)',
      'Vestibular Migraine',
      'Postural orthostatic hypotension',
      'Cardiac arrhythmia / aortic stenosis (presyncope)',
      'Medication-induced dizziness',
    ],
    rare: [
      'Posterior circulation cerebellar / brainstem stroke (Wallenberg syndrome)',
      'Vestibular schwannoma (acoustic neuroma)',
      'Vertebrobasilar insufficiency / dissection',
      'Multiple sclerosis (demyelinating plaque in brainstem)',
      'Ramsay Hunt syndrome (herpes zoster oticus — facial palsy, vesicles in ear canal, vertigo)',
    ],
    plan: [
      'BPPV: Epley manoeuvre performed in clinic (resolves up to 80-90% of cases on 1st attempt); Brandt-Daroff home exercises if refractory; do NOT prescribe vestibular sedatives',
      'Vestibular Neuritis / Labyrinthitis: short-term vestibular sedatives (prochlorperazine 5mg TDS or cinnarizine 15mg TDS) for MAX 3 days only (prolonged use delays central vestibular compensation); early vestibular rehabilitation',
      'Ménière disease: salt restriction, betahistine 16mg TDS titration',
      'Postural hypotension: medication review, hydration, compression stockings',
    ],
    safetynetting: [
      'Seek emergency care immediately if sudden difficulty speaking, double vision, facial droop, limb weakness, severe headache, or inability to walk/stand unsupported',
      'DVLA advice: stop driving if vertigo is sudden, unprovoked, or disabling',
    ],
    followup: [
      'Review in 1–2 weeks to verify resolution or repeat Epley manoeuvre',
    ],
    referral: [
      'Immediate Emergency Transfer (999 / Stroke Pathway): acute central neurological deficit, abnormal HINTS exam, new acute ataxia / inability to stand',
      'Routine ENT / Audiology referral: persistent unilateral tinnitus, asymmetrical hearing loss, failure of Epley manoeuvre, suspected Ménière disease',
    ],
  },

  // 20. Headache
  {
    letter: 'H',
    title: 'Headache',
    icon: '⚡',
    history: [
      'Onset and speed: "thunderclap" (reaching peak severity within seconds to minutes — subarachnoid haemorrhage!) vs gradual',
      'Location: unilateral (migraine, cluster), band-like bilateral (tension), temporal/scalp (giant cell arteritis), retro-orbital (cluster, glaucoma)',
      'Character: pulsating/throbbing (migraine), dull pressing (tension), piercing/stabbing (cluster), electric shock (trigeminal neuralgia)',
      'Associated symptoms: nausea, vomiting, photophobia, phonophobia, visual aura, cranial autonomic symptoms (lacrimation, nasal congestion, ptosis in cluster)',
      'RED FLAGS: SNOOP mnemonic (Systemic symptoms/fever/weight loss, Neurological deficits, Onset sudden/thunderclap, Older age > 50 with new headache, Papilloedema / Postural / Prior headache change)',
      'Medication overuse history: analgesics/triptans taken ≥ 10–15 days per month for > 3 months (Medication Overuse Headache — MOH)',
    ],
    examination: [
      'Vital signs: BP, temperature',
      'Neurological examination: GCS, cranial nerves, visual fields, pupillary reflexes, limb tone, power, reflexes, coordination',
      'Fundoscopy: assess optic discs for papilloedema (raised ICP)',
      'Head and neck examination: temporal artery tenderness, thickening, or reduced pulsation in patients > 50 years; neck stiffness, Kernig/Brudzinski signs (meningism)',
      'Sinus and scalp tenderness, jaw claudication assessment',
    ],
    investigations: [
      'Urgent ESR and CRP in patients aged ≥ 50 presenting with new headache (suspected Giant Cell Arteritis — GCA)',
      'Immediate non-contrast CT Head within 6 hours of onset for suspected thunderclap headache (SAH); lumbar puncture if CT normal but clinical suspicion high',
      'MRI Brain / Venogram for suspected intracranial hypertension, venous sinus thrombosis, or space-occupying lesion',
    ],
    differentials: [
      'Tension-type headache (most common)',
      'Migraine with or without aura',
      'Medication overuse headache (MOH)',
      'Cluster headache',
      'Giant cell arteritis (temporal arteritis)',
      'Cervicogenic headache',
      'Acute sinusitis',
      'Temporomandibular joint (TMJ) dysfunction',
    ],
    rare: [
      'Subarachnoid haemorrhage (SAH — thunderclap headache, peak < 5 mins)',
      'Giant Cell Arteritis (GCA — risk of permanent bilateral blindness!)',
      'Acute Angle-Closure Glaucoma (severe eye/headache, hazy cornea, fixed mid-dilated pupil, halos)',
      'Meningitis / Encephalitis (fever, purpuric rash, photophobia, neck stiffness)',
      'Intracranial space-occupying lesion (tumour, subdural haematoma, abscess)',
      'Cerebral venous sinus thrombosis (CVST)',
      'Idiopathic intracranial hypertension (IIH — young overweight females, pulsatile tinnitus, papilloedema)',
      'Carotid or vertebral artery dissection (head/neck pain with Horner syndrome)',
    ],
    plan: [
      'Migraine Acute Treatment: Combination therapy of Oral Triptan (e.g. Sumatriptan 50–100mg) + NSAID (Naproxen 500mg or Ibuprofen 400mg) + Antiemetic (Metoclopramide 10mg); take at onset of headache phase, not during aura',
      'Migraine Prophylaxis (≥ 2 attacks per month with disability): Propranolol 80–160mg daily, Topiramate 50–100mg daily (teratogenic — strict pregnancy prevention!), or Candesartan / Amitriptyline; CGRP inhibitors for refractory cases',
      'Tension Headache: Simple analgesia (aspirin, paracetamol, ibuprofen); avoid opioids/triptans; stress reduction',
      'Cluster Headache: Subcutaneous sumatriptan 6mg or nasal zolmitriptan 5mg + 100% High-flow Oxygen (12–15 L/min via non-rebreathe mask); verapamil for prophylaxis',
      'Suspected GCA: Start Oral Prednisolone 60mg immediately (do not delay for biopsy!) to protect vision',
    ],
    safetynetting: [
      'Advise emergency care (999/A&E) if sudden explosive onset ("thunderclap"), new weakness, speech difficulty, visual loss, rash, or persistent vomiting occurs',
    ],
    followup: [
      'Maintain a 4-week headache diary tracking frequency, duration, severity, and medication use',
      'Review at 4–8 weeks to assess prophylactic medication efficacy',
    ],
    referral: [
      'Immediate Emergency Admission (A&E): thunderclap headache, meningism, acute neurological deficits, suspected acute glaucoma, new papilloedema',
      'Same-day Ophthalmology / Rheumatology: suspected Giant Cell Arteritis for urgent temporal artery ultrasound / biopsy',
      'Urgent 2-Week-Wait Suspected Brain Tumour Pathway: headache with signs of raised ICP, new persistent neurological deficit, or new cognitive change',
    ],
  },

  // 21. Urinary Tract Infection (UTI)
  {
    letter: 'U',
    title: 'Urinary Tract Infection (UTI / Cystitis)',
    icon: '🚽',
    history: [
      'Lower urinary tract symptoms: dysuria (burning on micturition), frequency, urgency, suprapubic pain/tenderness, nocturia, haematuria, offensive/cloudy urine',
      'Upper urinary tract symptoms (Pyelonephritis): loin / flank pain, fevers, rigors, nausea, vomiting, lethargy',
      'Vaginal symptoms in women: vaginal discharge, pruritus, dyspareunia (suggests vaginitis/STI rather than UTI)',
      'Sexually active men / young adults: screen for urethritis / STI (urethral discharge, penile pain)',
      'Catheter presence, pregnancy status (asymptomatic bacteriuria requires treatment in pregnancy!)',
      'Recurrent UTI history (≥ 2 in 6 months or ≥ 3 in 12 months)',
    ],
    examination: [
      'Vitals: temperature, HR, BP, RR (screen for sepsis / NEWS2 score)',
      'Abdominal examination: suprapubic tenderness (cystitis), renal angle tenderness / costovertebral tenderness (pyelonephritis)',
      'External genitalia / pelvic examination if vaginal symptoms, urethral discharge, or recurrent infections',
      'Digital rectal exam (DRE) in men if acute prostatitis suspected (tender, boggy prostate)',
    ],
    investigations: [
      'Non-pregnant women < 65 with ≥ 2 key symptoms (dysuria, frequency, urgency) and no vaginal discharge: CLINICAL DIAGNOSIS — dipstick not required (NICE NG109)',
      'Urine Dipstick (nitrites and leucocytes): nitrites highly specific for Enterobacteriaceae; negative nitrites + leucocytes makes UTI unlikely',
      'Urine Mid-Stream Culture (MSU) INDICATION CRITERIA: pregnant women, men, children, suspected pyelonephritis, recurrent UTI, failed treatment, catheterised patients',
      'Serum bloods (FBC, CRP, U&E, blood cultures) if pyelonephritis or systemic sepsis suspected',
    ],
    differentials: [
      'Sexually transmitted infection (Chlamydia, Gonorrhoea, Trichomonas)',
      'Candida vulvovaginitis / Bacterial vaginosis',
      'Overactive bladder syndrome',
      'Genitourinary syndrome of menopause (atrophic vaginitis)',
      'Interstitial cystitis / Painful bladder syndrome',
      'Renal colic / nephrolithiasis',
      'Acute prostatitis in men',
    ],
    rare: [
      'Urosepsis (hypotension, tachypnoea, fever, confusion — life-threatening emergency!)',
      'Acute pyelonephritis with perinephric abscess or emphysematous pyelonephritis',
      'Bladder cancer (painless visible haematuria in patients ≥ 45 years)',
      'Fournier gangrene (necrotising fasciitis of the perineum in diabetics/immunosuppressed)',
    ],
    plan: [
      'Non-pregnant women with uncomplicated lower UTI (NICE NG109):',
      '  - 1st-line: Nitrofurantoin 100mg modified release BD for 3 days (avoid if eGFR < 45 mL/min)',
      '  - Alternative: Trimethoprim 200mg BD for 3 days (if local resistance < 20% or known sensitivity)',
      '  - 2nd-line: Fosfomycin 3g single sachet dose or Pivmecillinam 400mg initial then 200mg TDS for 3 days',
      'UTI in Men: 7 days of Nitrofurantoin 100mg BD or Trimethoprim 200mg BD; always send MSU',
      'Acute Pyelonephritis (Community): Ciprofloxacin 500mg BD for 7 days or Co-amoxiclav 500/125mg TDS for 14 days; send MSU',
      'Symptomatic advice: hydration, regular bladder emptying, paracetamol/ibuprofen for pain',
    ],
    safetynetting: [
      'Seek urgent medical help if developing fever, rigors, flank pain, persistent vomiting, or worsening symptoms despite 48h of antibiotics',
      'Advise that blood in urine should be reported if it persists after infection clears',
    ],
    followup: [
      'Review in 48–72 hours if symptoms fail to resolve or deteriorate',
      'MSU test of cure at 7 days only for pregnant women',
    ],
    referral: [
      'Immediate Emergency Admission: suspected urosepsis, acute pyelonephritis unable to tolerate oral fluids/medications, acute urinary retention',
      'Urgent 2-Week-Wait Urology Pathway: visible haematuria (painless or persistent after treatment of infection) in age ≥ 45, or persistent non-visible haematuria in age ≥ 60 (NICE NG12)',
      'Urology / Urogynaecology referral: recurrent UTIs with structural or functional abnormalities',
    ],
  },
];

async function main() {
  console.log('--- Starting Clinical Presentations Populator ---');
  console.log(`Supabase URL: ${url}`);
  console.log(`Parent Hub Doc ID: ${PARENT_HUB_ID}`);

  // 1. Fetch or create subpages
  const createdSubpages = [];

  for (const pres of presentations) {
    console.log(`Processing presentation: ${pres.title} (${pres.icon})...`);
    const blocks = buildClinicalPageBlocks(pres);

    // Check if doc already exists under parent with this title
    const checkRes = await fetch(
      `${url}/rest/v1/documents?parent_id=eq.${PARENT_HUB_ID}&title=eq.${encodeURIComponent(
        pres.title
      )}&select=id`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      }
    );
    const existing = await checkRes.json();

    let docId;
    if (Array.isArray(existing) && existing.length > 0) {
      docId = existing[0].id;
      console.log(`  Updating existing document ${docId}...`);
      await fetch(`${url}/rest/v1/documents?id=eq.${docId}`, {
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
      docId = crypto.randomUUID();
      console.log(`  Creating new document ${docId}...`);
      await fetch(`${url}/rest/v1/documents`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
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
    }

    createdSubpages.push({
      id: docId,
      title: pres.title,
      icon: pres.icon,
      letter: pres.letter,
    });
  }

  console.log(`\nSuccessfully created/updated ${createdSubpages.length} clinical presentation pages!`);

  // 2. Build the Hub Index Page (Matching Screenshot 1)
  console.log('\nBuilding Hub Index Content...');
  const hubBlocks = [];

  // Group subpages by letter
  const groups = {};
  for (const item of createdSubpages) {
    if (!groups[item.letter]) groups[item.letter] = [];
    groups[item.letter].push(item);
  }

  const sortedLetters = Object.keys(groups).sort();

  for (const letter of sortedLetters) {
    // Letter Heading: 'A', 'B', etc.
    hubBlocks.push(makeHeading(letter, 2));

    // Items under this letter
    for (const item of groups[letter]) {
      hubBlocks.push(makeLinkParagraph(item.icon, item.title, item.id));
    }
  }

  // Update the Hub Document
  console.log(`Updating Parent Hub Doc ${PARENT_HUB_ID}...`);
  const updateHubRes = await fetch(`${url}/rest/v1/documents?id=eq.${PARENT_HUB_ID}`, {
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

  const updatedDoc = await updateHubRes.json();
  console.log('Parent Hub Document Updated successfully:', updatedDoc[0]?.title);
  console.log('All done!');
}

main().catch(console.error);
