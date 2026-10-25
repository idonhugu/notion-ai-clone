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

const remainingPresentations = [
  {
    letter: 'B',
    title: 'Bloating & Abdominal Distension',
    icon: '🎈',
    history: [
      'Onset and pattern: diurnal variation (worse in evening, flat in morning suggests IBS) vs constant progressive distension',
      'Persistent vs intermittent; associated pain, change in bowel habit (constipation/diarrhoea)',
      'RED FLAGS (Ovarian Cancer Screen in women ≥ 50 — NICE CG122): persistent bloating (> 12 times per month), early satiety, pelvic pain, increased urinary urgency',
      'Other red flags: unexplained weight loss, rectal bleeding, postmenopausal bleeding, family history of ovarian/colorectal/breast cancer',
      'Dietary factors: high FODMAP foods, lactose, carbonated drinks, artificial sweeteners',
    ],
    examination: [
      'Abdominal inspection: visible distension, symmetry, everted umbilicus (ascites)',
      'Palpation: masses, tenderness, organomegaly (hepatosplenomegaly), guarding',
      'Percussion: generalised tympany (gas) vs shifting dullness / fluid thrill (ascites)',
      'Pelvic / Bimanual examination in women if ovarian pathology or mass suspected',
      'Groin hernia examination; digital rectal examination if lower GI symptoms',
    ],
    investigations: [
      'CA125 (Serum Cancer Antigen 125): mandatory in women ≥ 50 with persistent bloating (if CA125 ≥ 35 IU/mL, arrange urgent ultrasound of abdomen and pelvis within 2 weeks)',
      'Full Blood Count (anaemia), Ferritin, ESR/CRP',
      'Coeliac serology (anti-tTG IgA) — essential before diagnosing IBS',
      'Faecal Calprotectin (if age < 45 to differentiate IBS from IBD)',
      'Faecal Immunochemical Test (FIT) for suspected colorectal cancer',
      'Pelvic & Abdominal Ultrasound if ascites, pelvic mass, or raised CA125',
    ],
    differentials: [
      'Irritable Bowel Syndrome (IBS)',
      'Ovarian Cancer / Epithelial malignancy',
      'Small Intestinal Bacterial Overgrowth (SIBO)',
      'Coeliac disease / Lactose intolerance',
      'Ascites (Cirrhosis, Heart failure, Peritoneal carcinomatosis)',
      'Chronic constipation / faecal loading',
      'Colorectal carcinoma',
    ],
    rare: [
      'Epithelial Ovarian Carcinoma / Fallopian tube malignancy',
      'Peritoneal carcinomatosis / Mesothelioma',
      'Abdominal / Pelvic lymphoma',
      'Intestinal pseudo-obstruction (Ogilvie syndrome)',
    ],
    plan: [
      'If red flags excluded and IBS suspected: dietary advice, low FODMAP diet trial with dietitian, soluble fibre (ispaghula), antispasmodics (mebeverine / hyoscine)',
      'Manage constipation if present with macrogol (osmotic laxatives); avoid lactulose (causes more gas/bloating)',
      'Ascites management: sodium restriction, spironolactone / furosemide, refer for diagnostic paracentesis',
    ],
    safetynetting: [
      'Urgent review if constant worsening distension, difficulty eating, vomiting, jaundice, or rapid weight loss occurs',
    ],
    followup: [
      'Review in 4–6 weeks to re-evaluate symptoms and check blood/imaging results',
    ],
    referral: [
      'Urgent 2-Week-Wait Gynaecological Cancer Pathway: CA125 ≥ 35 with ultrasound showing complex ovarian mass / ascites, or pelvic mass on examination',
      'Urgent 2-Week-Wait Colorectal Pathway: positive FIT test or palpable rectal/abdominal mass',
      'Gastroenterology: unexplained ascites, abnormal calprotectin, suspected SIBO',
    ],
  },
  {
    letter: 'B',
    title: 'Breast Pain (Mastalgia)',
    icon: '🍈',
    history: [
      'Pattern: Cyclical (varies with menstrual cycle, bilateral, upper outer quadrants, dull ache) vs Non-cyclical (constant/intermittent, unilateral, localized, sharp/burning)',
      'Duration, relationship to menses, hormonal contraception, HRT, or pregnancy',
      'Exclusion of red flags: absence of palpable breast mass, skin dimpling, nipple retraction, or blood-stained nipple discharge',
      'Medications: oral contraceptives, HRT, SSRIs, spironolactone, digoxin',
      'Musculoskeletal triggers: costochondritis, chest wall trauma, strenuous upper body exercise, heavy lifting',
    ],
    examination: [
      'Chaperone present and documented',
      'Systematic breast examination (sitting and supine across all 4 quadrants and axillary tails): confirm absence of any palpable breast lump, skin tethering, or lymphadenopathy',
      'Chest wall examination: palpate costochondral junctions and pectoralis major (reproduction of pain indicates musculoskeletal origin / Tietze syndrome)',
    ],
    investigations: [
      'Isolated breast pain without a discrete lump is rarely a symptom of breast cancer (< 1–2% risk); routine imaging NOT required in women < 40 if normal clinical exam',
      'Bilateral mammography ± ultrasound only if age ≥ 40 or localized persistent non-cyclical pain with clinical concern',
    ],
    differentials: [
      'Cyclical Mastalgia (physiological hormonal response)',
      'Non-cyclical breast pain (duct ectasia, cysts, periductal mastitis)',
      'Costochondritis / Musculoskeletal chest wall pain (Tietze syndrome)',
      'Cervical radiculopathy radiating to chest wall',
      'Breast abscess / Acute mastitis (lactational or non-lactational)',
      'Invasive Breast Cancer (rarely presents as pain alone)',
    ],
    rare: [
      'Inflammatory Breast Cancer (rapidly progressive redness, oedema, peau d’orange mimicking infection)',
      'Underlying chest wall sarcoma or rib metastasis',
    ],
    plan: [
      'Reassurance: explaining that isolated mastalgia without a lump is not a symptom of cancer relieves anxiety in > 80% of women',
      'Properly fitted supportive bra / sports bra during the day and exercise',
      'Topical NSAID gel (e.g. Ibuprofen or Diclofenac gel applied directly to painful area TDS) — first-line evidence-based pharmacotherapy',
      'Paracetamol or oral NSAIDs during painful peak days',
      'Review hormonal contraception / HRT dose; lifestyle reduction of caffeine and dietary saturated fats',
    ],
    safetynetting: [
      'Advise patient to return immediately if they detect any new lump, skin dimpling, nipple inversion, or nipple discharge',
    ],
    followup: [
      'Maintain a breast pain symptom diary for 2 menstrual cycles; review if refractory after 3 months',
    ],
    referral: [
      'Urgent 2-Week-Wait Breast Pathway: any breast pain accompanied by a discrete palpable lump, skin dimpling, or unilateral blood-stained discharge',
      'Routine Breast Clinic: severe intractable non-cyclical mastalgia unresponsive to conservative management',
    ],
  },
  {
    letter: 'B',
    title: 'Breathlessness / Dyspnoea',
    icon: '💨',
    history: [
      'Onset speed: hyperacute/minutes (pulmonary embolism, tension pneumothorax, anaphylaxis, acute pulmonary oedema) vs subacute/days (pneumonia, asthma/COPD flare, pleurisy) vs chronic/months (heart failure, COPD, anaemia, interstitial lung disease)',
      'Exertional tolerance (mMRC scale 0–4), orthopnoea, paroxysmal nocturnal dyspnoea (PND)',
      'Associated symptoms: chest pain, cough, haemoptysis, wheeze, fever, ankle swelling, palpitations, weight loss',
      'VTE risk factors: immobility, active malignancy, surgery, travel, OCP/HRT',
      'Smoking pack-years, occupational exposures (asbestos, silica, birds/moulds)',
    ],
    examination: [
      'Vitals: HR, BP, RR (tachypnoea ≥ 20/min is a sensitive sign of illness), SpO2 on room air, temperature',
      'Cardiovascular: elevated JVP, third heart sound, displaced apex beat, heart murmurs, bilateral pedal oedema',
      'Respiratory: work of breathing, accessory muscle use, chest expansion, percussion (stony dullness in effusion, hyper-resonant in pneumothorax), auscultation (crackles, wheeze, silent chest)',
      'Legs: unilateral calf swelling and tenderness (DVT)',
      'Hands: finger clubbing, tremor, cyanosis',
    ],
    investigations: [
      'Urgent in-clinic 12-lead ECG: ischaemia, strain, S1Q3T3 (PE), tachycardia, arrhythmias',
      'Pulse oximetry (SpO2)',
      'Chest X-ray: consolidation, cardiomegaly, pulmonary oedema, pleural effusion, pneumothorax, mass',
      'Bloods: FBC (anaemia/infection), U&E, NT-proBNP (heart failure rule-out), D-dimer (if Wells score intermediate/low for PE), Thyroid function (TSH)',
      'Spirometry with bronchodilator reversibility (asthma, COPD)',
    ],
    differentials: [
      'Congestive Heart Failure / Acute Pulmonary Oedema',
      'Acute Exacerbation of Asthma / COPD',
      'Pulmonary Embolism (PE)',
      'Pneumonia / Lower Respiratory Tract Infection',
      'Pneumothorax',
      'Severe Anaemia',
      'Interstitial Lung Disease (Pulmonary Fibrosis)',
      'Panic attack / Hyperventilation syndrome',
    ],
    rare: [
      'Tension Pneumothorax (tracheal deviation, hypotension — immediate needle thoracostomy!)',
      'Massive PE with circulatory collapse',
      'Cardiac Tamponade (muffled heart sounds, distended neck veins, hypotension)',
      'Upper Airway Obstruction / Epiglottitis / Foreign Body',
    ],
    plan: [
      'Immediate resuscitation for acute red flags: high-flow oxygen, call 999',
      'Acute heart failure: furosemide 40mg stat, arrange urgent hospital assessment',
      'Bronchospasm: nebulised salbutamol + oral prednisolone',
      'Pneumonia: oral amoxicillin / doxycycline if mild community CRB-65 = 0',
      'Chronic breathlessness: multidisciplinary management, pulmonary rehab, smoking cessation',
    ],
    safetynetting: [
      'Instruct patient to call 999 immediately if breathlessness worsens rapidly, if chest pain develops, or if lips/fingers turn blue',
    ],
    followup: [
      'Review acute presentations within 24–48 hours; review chronic dyspnoea once bloods/CXR are available',
    ],
    referral: [
      'Immediate 999 Emergency Admission: severe acute respiratory distress, SpO2 < 92%, suspected PE, pneumothorax, pulmonary oedema',
      'Urgent Cardiology (within 2 weeks): NT-proBNP > 2000 ng/L',
      'Urgent 2-Week-Wait Lung Cancer: suspicious CXR mass or unexplained haemoptysis',
    ],
  },
  {
    letter: 'C',
    title: 'Calf Pain / Suspected DVT',
    icon: '🦵',
    history: [
      'Unilateral calf pain, tenderness, swelling, tightness, warmth, or erythema (typically gradual onset over days)',
      'Two-level DVT Wells Score assessment:',
      '  - Active cancer (treatment ongoing or within 6 months) (+1)',
      '  - Paralysis, paresis, or recent plaster immobilisation of lower limb (+1)',
      '  - Recently bedridden > 3 days or major surgery within 12 weeks (+1)',
      '  - Localized tenderness along deep venous system (+1)',
      '  - Entire leg swollen (+1)',
      '  - Calf swelling ≥ 3 cm compared to asymptomatic side (measured 10 cm below tibial tuberosity) (+1)',
      '  - Pitting oedema confined to symptomatic leg (+1)',
      '  - Collateral non-varicose superficial veins (+1)',
      '  - Previous documented DVT/PE (+1)',
      '  - Alternative diagnosis at least as likely as DVT (-2)',
      'Review chest symptoms (exclude Pulmonary Embolism!): pleuritic chest pain, dyspnoea, haemoptysis, presyncope',
    ],
    examination: [
      'Bilateral calf circumference measurement: measured 10 cm below the tibial tuberosity (difference ≥ 3 cm is significant)',
      'Palpate along deep venous system: popliteal fossa, posterior calf, femoral canal for localized cord/tenderness',
      'Assess superficial skin warmth, pitting oedema, collateral superficial veins',
      'Vital signs: SpO2, HR, BP, RR (screen for tachycardia/hypoxia from PE)',
      'Homans sign (calf pain on dorsiflexion) is unreliable and NOT recommended',
    ],
    investigations: [
      'Two-Level DVT Wells Score calculation:',
      '  - DVT Likely (score ≥ 2): Arrange urgent proximal leg vein ultrasound within 4 hours (if delayed, give interim dose of DOAC e.g. Apixaban or Rivaroxaban, then ultrasound within 24 hours)',
      '  - DVT Unlikely (score < 2): Quantitative D-dimer test (if negative, DVT excluded; if positive, arrange ultrasound scan within 4–24 hours)',
    ],
    differentials: [
      'Ruptured Baker Cyst (popliteal cyst dissecting into calf — sudden onset post knee flexion)',
      'Cellulitis (intense superficial heat, bright erythema with sharp margin, fever)',
      'Calf muscle tear / Gastrocnemius strain ("tennis leg")',
      'Superficial thrombophlebitis',
      'Chronic venous insufficiency / stasis',
      'Peripheral oedema from heart failure / calcium channel blockers',
    ],
    rare: [
      'Phlegmasia Cerulea Dolens (massive extensive thrombosis causing severe cyanosis, ischaemia, and compartment syndrome — limb-threatening surgical emergency!)',
      'Massive fatal pulmonary embolism',
      'Occult pelvic malignancy compressing iliac veins (May-Thurner syndrome)',
    ],
    plan: [
      'Confirmed DVT Anticoagulation (NICE NG158):',
      '  - First-line: Direct Oral Anticoagulant (DOAC) — Apixaban (10mg BD for 7 days then 5mg BD) OR Rivaroxaban (15mg BD for 21 days then 20mg OD)',
      '  - Minimum duration: 3 months for provoked DVT with transient risk factor; at least 3–6 months (or lifelong) for unprovoked DVT or active cancer',
      '  - Low molecular weight heparin (LMWH) if pregnant or severe renal impairment (eGFR < 15)',
      'Encourage regular walking once anticoagulation initiated; leg elevation when sitting',
    ],
    safetynetting: [
      'Call 999 immediately if experiencing shortness of breath, sharp chest pain when breathing in, coughing up blood, or fainting',
      'Report signs of major bleeding: melaena, severe haematoma, gross haematuria',
    ],
    followup: [
      'Review at 3 months: assess for post-thrombotic syndrome (swelling, pain, ulcers) and decide on anticoagulation continuation vs cessation',
    ],
    referral: [
      'Same-day Emergency Ambulatory DVT Assessment Unit: all patients with Wells score ≥ 2 or positive D-dimer',
      'Immediate Emergency Admission: suspected PE, phlegmasia, or severe bleeding complication',
    ],
  },
  {
    letter: 'C',
    title: 'Carpal Tunnel Syndrome',
    icon: '🚇',
    history: [
      'Numbness, tingling (paraesthesia), burning, and pain in the median nerve distribution: thumb, index, middle finger, and radial half of ring finger',
      'Classic nocturnal symptoms: patient wakes at night shaking or flicking their hands for relief ("flick sign")',
      'Pain may radiate proximally up forearm to elbow and shoulder',
      'Loss of manual dexterity: dropping cups, difficulty buttoning shirts, difficulty opening jars',
      'Risk factors: repetitive wrist flexion/extension, female gender, pregnancy (third trimester fluid retention), obesity, hypothyroidism, diabetes, rheumatoid arthritis, wrist fracture history',
    ],
    examination: [
      'Inspection: thenar muscle wasting (late/severe sign — flattened thenar eminence)',
      'Sensory testing: decreased light touch / two-point discrimination over palmar aspect of thumb, index, and middle finger (sparing thenar eminence skin, which is innervated by the palmar cutaneous branch)',
      'Motor testing: weak thumb abductor pollicis brevis (APB) — test resisted thumb abduction perpendicular to palm',
      'Provocative tests:',
      '  - Phalen test: wrist held in maximal unforced flexion for 60 seconds (reproduces numbness/paresthesia)',
      '  - Tinel sign: light percussion over flexor retinaculum at wrist reproduces electric shock / tingling in median fingers',
      '  - Durkan carpal compression test: direct thumb pressure over carpal tunnel for 30s',
    ],
    investigations: [
      'Clinical diagnosis in mild to moderate cases',
      'Nerve Conduction Studies (EMG / NCS): gold standard — confirms delayed sensory and motor median conduction velocity across carpal tunnel; essential before surgical decompression',
      'Bloods (if secondary causes suspected): Thyroid function (TSH), HbA1c, Rheumatoid factor',
    ],
    differentials: [
      'Cervical radiculopathy (C6 / C7 nerve root compression — neck pain radiating past elbow, dermatomal pattern)',
      'Pronator teres syndrome (proximal median nerve compression in forearm; thenar eminence sensation reduced)',
      'Tenosynovitis of flexor tendons',
      'De Quervain tenosynovitis (thumb radial pain; positive Finkelstein test)',
      'Peripheral diabetic polyneuropathy (bilateral stocking-glove distribution)',
      'Thumb carpometacarpal (CMC) osteoarthritis',
    ],
    rare: [
      'Severe irreversible thenar muscle atrophy with permanent sensory loss',
      'Carpal tunnel syndrome secondary to amyloidosis, acromegaly, or multiple myeloma',
    ],
    plan: [
      'Mild to Moderate Symptoms (Conservative Management):',
      '  - 1st-line: Neutral wrist splints worn at night for at least 4–6 weeks',
      '  - Activity modification: ergonomic keyboard, avoiding prolonged extreme wrist flexion',
      '  - Short-course oral NSAIDs for transient pain relief',
      '  - Local Corticosteroid Injection into carpal tunnel: provides significant relief for 3–6 months (especially useful in pregnancy or awaiting surgery)',
      'Severe Symptoms / Failed Conservative:',
      '  - Carpal Tunnel Decompression Surgery (open or endoscopic division of transverse carpal ligament)',
    ],
    safetynetting: [
      'Advise patient to report any visible muscle wasting of the thumb pad or constant permanent numbness without tingling (indicates axonal nerve damage)',
    ],
    followup: [
      'Review at 6–8 weeks to assess response to night splints or injection',
    ],
    referral: [
      'Urgent Orthopaedic / Plastic Hand Surgery: severe CTS with thenar wasting, constant numbness, or motor weakness',
      'Routine Surgical Referral: failure of night splints and steroid injection after 3 months',
    ],
  },
  {
    letter: 'C',
    title: 'Cervical Screening Abnormality',
    icon: '📋',
    history: [
      'NHS Cervical Screening Programme result review: High-Risk Human Papillomavirus (hrHPV) status and Cytology results',
      'Previous screening history: past HPV positivity, abnormal cytology, previous colposcopy, LLETZ / cone biopsy',
      'Gynaecological symptoms screen: post-coital bleeding (PCB), intermenstrual bleeding (IMB), postmenopausal bleeding (PMB), unexplained foul-smelling or blood-stained discharge, deep dyspareunia, pelvic pain',
      'Immunosuppression status (HIV, organ transplant — requires annual screening!)',
      'Smoking status (smoking significantly impairs HPV clearance and doubles cervical cancer risk)',
      'Vaccination status (HPV vaccine / Gardasil)',
    ],
    examination: [
      'Speculum Examination (if patient presents with abnormal bleeding or discharge):',
      '  - Inspect cervix under good illumination for visible exophytic mass, ulceration, friability, bleeding on contact, or hard induration',
      '  - Note: do NOT perform cervical screening if patient has abnormal bleeding — refer directly to colposcopy / 2WW gynaecology!',
      'Bimanual vaginal examination: check for pelvic mass or cervical fixity',
    ],
    investigations: [
      'NHS Primary HPV Screening Pathway Algorithm:',
      '  - hrHPV Negative: return to routine recall (3-yearly age 25–49; 5-yearly age 50–64)',
      '  - hrHPV Positive + Cytology Normal: repeat screening in 12 months',
      '  - hrHPV Positive + Cytology Abnormal (borderline, low-grade, high-grade dyskaryosis): direct referral to Colposcopy',
      '  - hrHPV Positive for 2 consecutive 12-month screens (even if cytology normal): direct referral to Colposcopy',
      'Colposcopy with acetic acid (acetowhite changes) and Lugol iodine (Schiller test); cervical punch biopsy or LLETZ (Large Loop Excision of Transformation Zone)',
    ],
    differentials: [
      'Cervical Intraepithelial Neoplasia (CIN 1, CIN 2, CIN 3 / High-grade squamous intraepithelial lesion)',
      'Invasive Cervical Carcinoma (Squamous Cell ~80%, Adenocarcinoma ~20%)',
      'Benign cervical ectropion / erosion (common on OCP/pregnancy; causes PCB)',
      'Cervical polyp',
      'Cervicitis / Chlamydia / Gonorrhoea',
    ],
    rare: [
      'Invasive Squamous Cell Carcinoma or Endocervical Adenocarcinoma',
      'Neuroendocrine cervical carcinoma',
    ],
    plan: [
      'Patient Education & Reassurance: explain clearly that hrHPV is an extremely common virus (~80% of adults get it) and HPV positivity or abnormal cytology does NOT mean cancer',
      'Ensure automatic electronic or direct colposcopy referral is made as per national guidelines',
      'Smoking cessation counselling to boost immune clearance of HPV',
      'Safe sex advice (condoms reduce viral load and transmission)',
    ],
    safetynetting: [
      'Instruct patient to contact surgery immediately if any abnormal bleeding (post-coital, intermenstrual, or postmenopausal) occurs',
    ],
    followup: [
      'Post-treatment "Test of Cure" (hrHPV test at 6 months post-LLETZ): if negative, return to 3-year recall',
    ],
    referral: [
      'Urgent 2-Week-Wait Suspected Gynaecological Cancer: visible suspicious cervical mass or ulcer on speculum examination',
      'Routine Colposcopy (within 2–6 weeks): hrHPV positive with abnormal cytology or persistent HPV positivity at 24 months',
    ],
  },
  {
    letter: 'C',
    title: 'Constipation (Adult)',
    icon: '🚽',
    history: [
      'Defecation frequency (< 3 bowel motions per week), stool consistency (Bristol Stool Form Scale Types 1–2: hard separate lumps / sausage-shaped lumpy)',
      'Symptoms: straining, painful evacuation, feeling of incomplete evacuation, abdominal bloating, sensation of anorectal blockage',
      'Duration (acute sudden change vs chronic lifelong)',
      'RED FLAGS (NICE NG12 Colorectal Cancer Screen):',
      '  - Aged ≥ 50 with unexplained change in bowel habit to looser or harder stools',
      '  - Unexplained rectal bleeding / melaena',
      '  - Unexplained iron deficiency anaemia',
      '  - Unexplained weight loss',
      '  - Palpable abdominal or rectal mass',
      'Medications: opioids (codeine, morphine — notorious!), anticholinergics, tricyclic antidepressants, calcium channel blockers, iron supplements, antacids',
      'Lifestyle: dietary fibre intake, daily fluid volume, physical mobility',
    ],
    examination: [
      'Abdominal examination: inspect for distension, palpate for faecal masses (typically palpable in left iliac fossa / sigmoid colon), tenderness, exclude organomegaly or guarding',
      'Digital Rectal Examination (DRE): assess perianal skin (fissures, haemorrhoids), anal tone, empty rectum vs hard impacted faecal mass (faecal impaction / overflow diarrhoea)',
    ],
    investigations: [
      'Faecal Immunochemical Test (FIT): mandatory in primary care for patients meeting NG12 cancer triage criteria',
      'Bloods (if new-onset, severe, or elderly): FBC (anaemia), Ferritin, U&E, Serum Calcium (hypercalcaemia causes severe constipation!), Thyroid function (TSH — hypothyroidism)',
      'Plain abdominal X-ray is NOT routinely indicated in adults unless suspecting acute bowel obstruction or megacolon',
      'Colonoscopy if red flags or positive FIT test',
    ],
    differentials: [
      'Functional / Primary Chronic Constipation (normal transit, slow transit, pelvic floor dyssynergia)',
      'Irritable Bowel Syndrome with Constipation (IBS-C: pain relieved by defecation)',
      'Colorectal Carcinoma / Pelvic malignancy',
      'Medication-induced constipation',
      'Endocrine / Metabolic (Hypothyroidism, Hypercalcaemia, Diabetes)',
      'Neurological disorders (Parkinson disease, Multiple Sclerosis, spinal cord lesion)',
      'Anal fissure (causing voluntary stool withholding due to severe pain)',
    ],
    rare: [
      'Acute mechanical bowel obstruction / volvulus (sigmoid or caecal)',
      'Faecal impaction with overflow diarrhoea (frequently misdiagnosed as acute diarrhoea in elderly!)',
      'Stercoral perforation of the colon (due to impacted faecaloma)',
    ],
    plan: [
      '1. Lifestyle First-line: gradually increase dietary fibre (whole grains, fruit, vegetables — 30g/day), fluid intake (at least 1.5–2 L/day), regular physical activity, proper toilet posture (footstool to elevate knees above hips)',
      '2. Stepwise Laxative Pharmacotherapy (NICE CKS):',
      '  - Step 1: Bulk-forming laxative (Ispaghula husk / Fybogel) — ensure adequate fluid intake',
      '  - Step 2: Add or switch to Osmotic laxative (Macrogol / Movicol / Laxido preferred; lactulose alternative)',
      '  - Step 3: Add Stimulant laxative (Senna or Bisacodyl) if stools remain soft but difficult to evacuate',
      '  - For Opioid-induced constipation: Osmotic (macrogol) + Stimulant (senna) combination; bulk-forming laxatives are CONTRAINDICATED with opioids!',
      '  - For Faecal Impaction: high-dose Macrogol regimen (up to 8 sachets daily dissolved in 1 litre water over 6 hours for 3 days), or phosphate enema',
    ],
    safetynetting: [
      'Instruct patient to seek emergency care if developing severe abdominal pain, vomiting, inability to pass wind or stool (obstruction), or rectal bleeding',
    ],
    followup: [
      'Review at 4 weeks to evaluate response; once regular soft bowel motions established, taper laxatives gradually over several months',
    ],
    referral: [
      'Urgent 2-Week-Wait Colorectal Pathway: positive FIT test, palpable rectal or abdominal mass, or unexplained iron deficiency anaemia',
      'Same-day Emergency Admission: acute mechanical bowel obstruction, peritonism, severe faecal impaction failing treatment',
    ],
  },
  {
    letter: 'D',
    title: 'Dermatitis (Atopic Eczema)',
    icon: '🧴',
    history: [
      'Intensely pruritic, dry, erythematous skin; "the itch that rashes" (scratching leads to excoriation and lichenification)',
      'Distribution according to age:',
      '  - Infants: face, cheeks, scalp, extensor surfaces of limbs (diaper area typically spared)',
      '  - Children & Adults: flexural folds (antecubital and popliteal fossae, neck, wrists, ankles)',
      'Personal or family history of atopic triad: asthma, allergic rhinitis (hay fever), atopic eczema',
      'Sleep disturbance, school/work impact, quality of life (DLQI / POEM score)',
      'Trigger factors: soaps, detergents, fragranced products, sudden temperature changes, wool clothing, emotional stress, secondary infection',
    ],
    examination: [
      'Skin inspection: xerosis (generalised dry skin), erythema, scaling, excoriations, lichenification (skin thickening from chronic rubbing)',
      'Assess for complications — SECONDARY INFECTION:',
      '  - Bacterial infection (Staph. aureus): weeping, honey-coloured crusting, pustules, cellulitis',
      '  - Eczema Herpeticum (HSV infection): clustered monomorphic punched-out umbilicated blisters/crusts, painful skin, systemic fever — DERMATOLOGICAL EMERGENCY!',
    ],
    investigations: [
      'Clinical diagnosis (UK Working Party Diagnostic Criteria)',
      'Skin swab for bacterial culture and viral PCR ONLY if secondary infection suspected or failure of standard therapy',
      'Routine allergy tests (skin prick / IgE) are NOT recommended for uncomplicated atopic eczema',
    ],
    differentials: [
      'Contact Dermatitis (Allergic or Irritant — localized to exposure site)',
      'Seborrhoeic Dermatitis (greasy scale on scalp, eyebrows, nasolabial folds)',
      'Scabies (intense nocturnal pruritus, burrows on webs of fingers/wrists, household contacts affected)',
      'Psoriasis (well-demarcated extensor plaques, silvery scale, nail pitting)',
      'Cutaneous T-cell Lymphoma (Mycosis fungoides in older adults with refractory eczema)',
    ],
    rare: [
      'Eczema Herpeticum (widespread HSV dissemination across atopic skin — risk of keratitis and fatal viraemia!)',
      'Erythroderma (> 90% body surface area affected; fluid/temperature loss)',
      'Staphylococcal Scalded Skin Syndrome (SSSS)',
    ],
    plan: [
      '1. Emollient Therapy (CORNERSTONE OF ALL ECZEMA TREATMENT):',
      '  - Prescribe generous quantities (adults need 500g/week; children 250g/week); apply liberally and frequently (at least 2–3 times daily) in direction of hair growth',
      '  - Soap substitute: avoid all standard soaps/shower gels; wash with an emollient wash',
      '2. Topical Corticosteroids for Flares (Stepped approach based on severity and site):',
      '  - Mild (Hydrocortisone 1%): face, neck, flexures, diaper area',
      '  - Moderate (Betnovate-RD, Eumovate): trunk and limbs in children, mild adult flares',
      '  - Potent (Betnovate, Elocon): severe trunk and limb flares in adults',
      '  - Apply once daily to active areas only until flare resolves (typically 7–14 days); leave 20–30 min gap between emollient and steroid',
      '3. Secondary Bacterial Infection: Oral Flucloxacillin (or Clarithromycin) for 7 days',
      '4. Severe/Refractory: Topical Calcineurin Inhibitors (Tacrolimus / Pimecrolimus) as steroid-sparing agents',
    ],
    safetynetting: [
      'EMERGENCY WARNING: seek immediate same-day hospital review if skin develops clustered painful blisters, punched-out sores, eye swelling, or fever (Eczema Herpeticum!)',
    ],
    followup: [
      'Review at 4 weeks to evaluate control, check emollient volume used, and monitor for topical steroid side effects (skin atrophy, striae)',
    ],
    referral: [
      'Same-day Emergency Admission: suspected Eczema Herpeticum, severe erythroderma, severe secondary bacterial sepsis',
      'Dermatology Referral: diagnostic uncertainty, severe eczema unresponsive to potent topical corticosteroids, frequent infections, consideration of phototherapy or systemic therapy (dupilumab, methotrexate)',
    ],
  },
  {
    letter: 'D',
    title: 'Diarrhoea (Acute & Chronic)',
    icon: '🌊',
    history: [
      'Duration: Acute (< 14 days), Persistent (14–28 days), Chronic (> 28 days)',
      'Stool characteristics: watery vs bloody vs mucus vs greasy/foul-smelling/floating (steatorrhoea)',
      'Associated symptoms: crampy abdominal pain, fever, nausea, vomiting, tenesmus, weight loss',
      'RED FLAGS (NICE NG12): unexplained change in bowel habit to looser stools for ≥ 6 weeks in patients ≥ 60, rectal bleeding, nocturnal diarrhoea waking patient, unintentional weight loss, anaemia',
      'Epidemiology / Exposure: recent foreign travel, food history (poultry, seafood, unpasteurised milk), untreated water, outbreak contacts',
      'Medications: recent antibiotics within past 3 months (Clostridioides difficile!), PPIs, NSAIDs, metformin',
    ],
    examination: [
      'Assessment of Hydration & Circulatory Status: postural blood pressure, heart rate, capillary refill, mucous membranes, skin turgor',
      'Abdominal examination: distension, tenderness, guarding, rebound, bowel sounds (hyperactive vs absent/peritonitic)',
      'Digital Rectal Examination (DRE): check for rectal masses, faecal impaction (overflow diarrhoea), or visible blood/melaena',
    ],
    investigations: [
      'Acute Diarrhoea (> 7 days, severe, bloody, or systemically unwell): Stool culture (Campylobacter, Salmonella, Shigella, E. coli O157) and Stool PCR; C. difficile toxin assay if recent antibiotics',
      'Chronic Diarrhoea (> 4 weeks):',
      '  - Bloods: FBC (anaemia, infection), Ferritin, U&E, LFT, CRP, ESR',
      '  - Coeliac serology (anti-tTG IgA)',
      '  - Faecal Calprotectin (rules out IBD in patients < 45 with chronic diarrhoea)',
      '  - Faecal Immunochemical Test (FIT) for suspected colorectal cancer',
      '  - Thyroid function (TSH — hyperthyroidism)',
    ],
    differentials: [
      'Acute Gastroenteritis (viral: Norovirus, Rotavirus; bacterial: Campylobacter, Salmonella; parasitic: Giardia)',
      'Irritable Bowel Syndrome with Diarrhoea (IBS-D)',
      'Inflammatory Bowel Disease (Crohn disease / Ulcerative colitis)',
      'Coeliac Disease',
      'Colorectal Carcinoma',
      'Clostridioides difficile colitis',
      'Microscopic Colitis (middle-aged/elderly women, watery diarrhoea, normal endoscopy, biopsy positive)',
      'Bile Acid Malabsorption (BAM post-cholecystectomy / ileal resection)',
      'Overflow diarrhoea secondary to faecal impaction',
    ],
    rare: [
      'Haemolytic Uraemic Syndrome (HUS — triad of microangiopathic haemolytic anaemia, thrombocytopenia, and AKI following E. coli O157:H7; antibiotics contraindicated!)',
      'Toxic Megacolon (complication of severe C. diff or ulcerative colitis)',
      'Neuroendocrine Tumour (Carcinoid syndrome, VIPoma)',
    ],
    plan: [
      'Acute Diarrhoea: Oral Rehydration Salts (ORS); maintain oral fluids; self-limiting within 5–7 days; loperamide (2mg PRN) may be used for mild watery diarrhea ONLY if no blood or high fever',
      'Antibiotics are NOT routinely indicated for acute gastroenteritis unless severe Campylobacter (<3 days onset: clarithromycin) or confirmed C. diff (oral Vancomycin 125mg QDS for 10 days)',
      'Chronic Diarrhoea: treat underlying cause (gluten-free diet for coeliac; colestyramine for bile acid diarrhoea; budesonide for microscopic colitis)',
    ],
    safetynetting: [
      'Emergency advice: seek immediate care if blood in stool, severe worsening abdominal pain, inability to keep fluids down, high fever, or dizziness on standing',
    ],
    followup: [
      'Review acute diarrhoea if not resolved after 7–10 days; review chronic diarrhoea once investigation results available',
    ],
    referral: [
      'Immediate Emergency Admission: severe dehydration / shock, suspected toxic megacolon, HUS, or acute peritonism',
      'Urgent 2-Week-Wait Colorectal Pathway: age ≥ 60 with unexplained diarrhoea ≥ 6 weeks, positive FIT test, or palpable rectal/abdominal mass',
      'Gastroenterology: elevated faecal calprotectin (> 100 mcg/g), suspected IBD, or refractory chronic diarrhoea',
    ],
  },
  {
    letter: 'E',
    title: 'Ear Pain (Otalgia)',
    icon: '👂',
    history: [
      'Primary otalgia (ear pathology) vs Secondary / Referred otalgia (shared cranial nerves V, VII, IX, X):',
      '  - Primary: otalgia accompanied by otorrhoea (ear discharge), hearing loss, itching, aural fullness, tinnitus, recent swimming/water exposure, cotton bud trauma',
      '  - Secondary / Referred: ear feels completely normal on otoscopy; pain referred from teeth, TMJ joint, pharynx, tonsils, cervical spine, or larynx (head and neck cancer!)',
      'Duration, severity, fever, systemic illness',
      'Red flags: persistent unilateral referred otalgia in older adults / smokers / alcohol users (rule out oropharyngeal / laryngeal carcinoma!), facial weakness, mastoid swelling',
    ],
    examination: [
      'Systematic Otoscopy (examine unaffected ear first):',
      '  - Pinna and external auditory canal: erythema, oedema, purulent debris, furuncle (Otitis Externa); tragal tenderness (pain on pushing tragus or pulling pinna strongly indicates otitis externa)',
      '  - Tympanic membrane: dull, bulging, erythematous, loss of light reflex, fluid level, perforation (Acute Otitis Media); attic retraction / pearly white flakes (Cholesteatoma)',
      'Mastoid process inspection and palpation: erythema, tenderness, fluctuance, loss of postauricular crease, proptosis of pinna (Mastoiditis!)',
      'Cranial nerve examination: especially facial nerve (CN VII)',
      'Oral cavity, oropharynx, teeth, and TMJ joint examination (palpate TMJ for tenderness/clicking on jaw opening)',
      'Neck palpation for cervical lymphadenopathy',
    ],
    investigations: [
      'Clinical diagnosis on otoscopy in primary care',
      'Ear swab for microscopy, culture & sensitivity ONLY if otitis externa is recurrent, severe, or fails first-line topical therapy',
      'Urgent CT / MRI Temporal bones / Brain if mastoiditis, necrotising (malignant) otitis externa, or intracranial complication suspected',
    ],
    differentials: [
      'Acute Otitis Externa ("swimmer’s ear")',
      'Acute Otitis Media (AOM)',
      'Otitis Media with Effusion ("glue ear")',
      'Temporomandibular Joint (TMJ) Dysfunction',
      'Dental abscess / impacted wisdom tooth (CN V3)',
      'Tonsillitis / Pharyngitis / Peritonsillar abscess (Quinsy — CN IX)',
      'Herpes Zoster Oticus (Ramsay Hunt syndrome)',
      'Head and Neck Squamous Cell Carcinoma (CN IX/X referred pain)',
      'Cervical spine osteoarthritis (C2/C3)',
    ],
    rare: [
      'Acute Mastoiditis (bacterial spread to mastoid air cells — surgical emergency!)',
      'Necrotising (Malignant) Otitis Externa (Pseudomonas osteomyelitis of skull base in elderly diabetics/immunosuppressed; severe nocturnal deep otalgia, granulation tissue at canal floor, cranial nerve palsies)',
      'Hypopharyngeal or Laryngeal Carcinoma presenting as persistent referred ear pain',
    ],
    plan: [
      'Acute Otitis Externa: topical antibiotic + corticosteroid ear drops (e.g. Neomycin + Dexamethasone / Otomize spray) TDS for 7 days; dry ear precautions',
      'Acute Otitis Media: analgesia (paracetamol / ibuprofen); antibiotics delayed/withheld in most mild cases (give 5-day Amoxicillin 500mg TDS only if systemically unwell, otorrhoea, bilateral in under-2s, or > 4 days)',
      'TMJ Dysfunction: soft diet, warm compresses, NSAIDs, nocturnal occlusal splint',
      'Secondary referred pain: treat underlying cause (dental, pharyngeal)',
    ],
    safetynetting: [
      'Seek emergency hospital review immediately if postauricular redness, tender swelling behind ear, facial drooping/weakness, or high fever with confusion develops',
    ],
    followup: [
      'Review at 7–10 days if otitis externa fails to resolve or if discharge persists',
    ],
    referral: [
      'Immediate Emergency Admission: suspected acute mastoiditis, necrotising otitis externa, or intracranial spread',
      'Urgent 2-Week-Wait Head & Neck Cancer Pathway: unexplained persistent unilateral referred otalgia with normal otoscopy in patients > 40 with smoking/alcohol history',
      'Routine ENT: cholesteatoma, recurrent refractory otitis externa, persistent TM perforation',
    ],
  },
  {
    letter: 'G',
    title: 'Goitre & Thyroid Nodules',
    icon: '🦋',
    history: [
      'Thyroid enlargement: diffuse vs multinodular vs solitary discrete nodule',
      'Rate of growth: rapid enlargement over weeks (anaplastic thyroid cancer / thyroid lymphoma) vs slow over months/years',
      'Compressive symptoms (Red flags): dysphagia (difficulty swallowing), dyspnoea (stridor, breathing difficulty especially lying flat), dysphonia / hoarseness (recurrent laryngeal nerve invasion)',
      'Thyroid functional status:',
      '  - Hyperthyroidism symptoms: heat intolerance, palpitations, weight loss, tremor, anxiety, diarrhoea, oligomenorrhoea',
      '  - Hypothyroidism symptoms: cold intolerance, fatigue, weight gain, constipation, dry skin, menorrhagia',
      'Risk factors: head and neck irradiation in childhood, family history of thyroid carcinoma or MEN syndromes (MEN 2a/2b)',
    ],
    examination: [
      'Systematic Thyroid Examination from front and behind patient:',
      '  - Inspect: symmetry, visible mass moves upward on swallowing (thyroid gland moves with pretracheal fascia; thyroglossal cyst moves on swallowing AND tongue protrusion!)',
      '  - Palpate: size, consistency (soft, smooth, multinodular vs stony hard, fixed), single vs multiple nodules, tenderness (subacute thyroiditis)',
      '  - Pemberton sign: raise both arms above head for 1 minute; facial flushing and respiratory distress indicates retrosternal goitre thoracic inlet obstruction!',
      'Auscultate thyroid gland for thyroid bruit (Graves disease)',
      'Cervical lymph node palpation for firm, fixed metastatic lymphadenopathy',
    ],
    investigations: [
      'Serum TSH (Thyroid-Stimulating Hormone): initial test to assess function:',
      '  - Suppressed TSH: check FT4/FT3 (toxic nodule / toxic multinodular goitre / Graves; low malignancy risk)',
      '  - Normal or Elevated TSH: warrants urgent ultrasound and fine needle aspiration (higher malignancy risk in solitary nodule)',
      'Thyroid Ultrasound (high-resolution): stratifies malignancy risk using British Thyroid Association (BTA) U-score (U1 normal to U5 malignant)',
      'Fine Needle Aspiration Cytology (FNAC) under ultrasound guidance for U3–U5 nodules (Bethesda classification)',
      'CT Thorax / Neck (without contrast) for retrosternal goitre or airway compression',
    ],
    differentials: [
      'Colloid goitre / Simple non-toxic multinodular goitre',
      'Hashimoto Thyroiditis (chronic lymphocytic thyroiditis)',
      'Graves Disease (diffuse toxic goitre + thyroid eye signs)',
      'Toxic Multinodular Goitre / Toxic Adenoma (Plummer disease)',
      'Thyroid Carcinoma (Papillary ~70%, Follicular ~15%, Medullary ~5%, Anaplastic ~2%)',
      'Subacute (De Quervain) thyroiditis (painful, tender goitre post-viral)',
      'Thyroglossal duct cyst / Branchial cleft cyst',
    ],
    rare: [
      'Anaplastic Thyroid Carcinoma (extremely aggressive, rapid neck mass in elderly, highly fatal)',
      'Retrosternal goitre causing acute tracheomalacia or upper airway obstruction',
      'Thyrotoxic crisis (Thyroid storm)',
    ],
    plan: [
      'Thyroid function abnormal: treat according to guidelines (carbimazole for hyperthyroidism; levothyroxine for hypothyroidism)',
      'Euthyroid asymptomatic multinodular goitre with benign ultrasound (U2): clinical observation; repeat ultrasound if enlargement occurs',
      'Surgical thyroidectomy / lobectomy indicated for compressive symptoms, retrosternal extension, or indeterminate/malignant cytology (Bethesda III–VI)',
    ],
    safetynetting: [
      'Urgent review if breathing difficulty, stridor, swallowing difficulty, new hoarse voice, or rapid enlargement develops',
    ],
    followup: [
      'Annual clinical and biochemical review for stable benign goitres',
    ],
    referral: [
      'Urgent 2-Week-Wait Suspected Thyroid Cancer: thyroid nodule with rapid enlargement, unexplained hoarseness, associated cervical lymphadenopathy, or suspicious ultrasound/FNAC',
      'Immediate Emergency Admission: acute airway compression or stridor from retrosternal goitre',
      'Endocrinology: toxic adenoma, Graves disease, or compressive benign goitre for surgery',
    ],
  },
  {
    letter: 'G',
    title: 'Gynaecomastia',
    icon: '👤',
    history: [
      'Benign enlargement of male breast glandular tissue: unilateral vs bilateral; tenderness / pain (indicates recent active glandular proliferation)',
      'Age and timing: trimodal physiological distribution:',
      '  - Neonatal (maternal oestrogens — resolves within weeks)',
      '  - Pubertal (peak age 13–14 — resolves spontaneously in 75–90% within 1–2 years)',
      '  - Elderly / Senescent (decreased testosterone, increased aromatisation)',
      'Drug and substance history (> 25% of cases!): spironolactone, finasteride/dutasteride, bicalutamide, anabolic steroids, cannabis, alcohol, cimetidine, amiodarone, tricyclic antidepressants',
      'Symptoms of hypogonadism: decreased libido, erectile dysfunction, loss of body hair, muscle weakness',
      'Symptoms of testicular or systemic disease: testicular lump/pain, hyperthyroidism, liver disease, chronic renal failure',
    ],
    examination: [
      'CRITICAL DISTINCTION: True Gynaecomastia vs Pseudogynaecomastia (adipomastia):',
      '  - True Gynaecomastia: palpate with thumb and forefinger moving from periphery toward nipple; a firm, rubbery, concentric disc of mobile glandular tissue is felt directly beneath the areolar complex',
      '  - Pseudogynaecomastia: diffuse, soft, non-tender fatty tissue without a discrete subareolar glandular disc (common in obesity)',
      'Examine for Male Breast Cancer Red Flags: eccentric or unilateral hard, irregular, fixed mass, skin tethering, nipple retraction, or serosanguinous nipple discharge',
      'Systematic Testicular Examination: mandatory — palpate both testes for lumps (Leydig/Sertoli cell tumour, germ cell tumour producing hCG) or testicular atrophy (Klinefelter syndrome: small firm testes < 4 mL)',
      'Inspect for signs of chronic liver disease (spider naevi, palmar erythema) or thyroid disease',
    ],
    investigations: [
      'Pubertal gynaecomastia with normal examination: clinical diagnosis, no routine tests required',
      'Adult onset / Rapidly progressive / Pathological gynaecomastia workup:',
      '  - Serum Total Testosterone, LH, FSH, Oestradiol (E2)',
      '  - Serum beta-hCG and Alpha-Fetoprotein (AFP) — essential to exclude testicular / germ cell tumours!',
      '  - Thyroid function (TSH/FT4), LFTs, U&E, Prolactin',
      'Testicular Ultrasound if testicular mass or elevated hCG/oestradiol',
      'Mammography ± Ultrasound if eccentric, hard, fixed mass suspicious of male breast cancer',
    ],
    differentials: [
      'Pseudogynaecomastia (adipose deposition due to obesity)',
      'Male Breast Carcinoma (< 1% of all breast cancers, but higher risk in BRCA2 / Klinefelter)',
      'Testicular germ cell tumour or Leydig cell tumour',
      'Hypogonadism (Primary: Klinefelter 47,XXY; Secondary: pituitary adenoma)',
      'Cirrhosis / Alcohol-induced liver disease',
      'Medication / Anabolic steroid-induced gynaecomastia',
    ],
    rare: [
      'Invasive Male Breast Carcinoma',
      'Malignant hCG-secreting testicular choriocarcinoma or bronchogenic carcinoma',
      'Adrenal feminising neoplasm',
    ],
    plan: [
      'Pubertal gynaecomastia: reassurance that it is completely physiological and self-limiting; active monitoring; 80% resolve within 12–24 months',
      'Drug-induced: identify and discontinue culprit medication if safe (e.g. switch spironolactone to eplerenone)',
      'Treat underlying endocrine, hepatic, or renal disease',
      'Painful active glandular proliferation (< 6 months): trial of selective oestrogen receptor modulator (Tamoxifen 10–20mg daily) under specialist endocrine guidance',
      'Cosmetic surgery / reduction mammaplasty: rarely funded on NHS unless severe psychological distress meeting exceptional funding criteria',
    ],
    safetynetting: [
      'Instruct patient to return immediately if they detect any hard lump off-center from the nipple, skin dimpling, or nipple bleeding',
    ],
    followup: [
      'Review pubertal boys every 6 months until resolution',
    ],
    referral: [
      'Urgent 2-Week-Wait Breast Pathway: any eccentric, hard, fixed breast mass, skin dimpling, or nipple retraction (suspected male breast cancer)',
      'Urgent 2-Week-Wait Urology: any discrete testicular lump or elevated beta-hCG / AFP',
      'Endocrinology: abnormal hormone profile, suspected Klinefelter syndrome, or hypogonadism',
    ],
  },
  {
    letter: 'I',
    title: 'Impetigo',
    icon: '🩹',
    history: [
      'Superficial bacterial skin infection, highly contagious (rapid transmission in schools, nurseries, household contacts)',
      'Onset: thin-walled vesicles or pustules that rupture rapidly leaving characteristic exudative golden-yellow "honey-coloured" crusts on an erythematous base',
      'Common locations: perioral, perinasal, face, extremities, flexures',
      'Forms: Non-bullous impetigo (~70% — Staph. aureus or Strep. pyogenes) vs Bullous impetigo (~30% — Staph. aureus producing epidermolytic toxin A, large flaccid blisters, common in infants)',
      'Pruritus, mild discomfort; absence of significant systemic upset (unless bullous in neonates)',
      'Underlying skin condition: pre-existing atopic eczema, scabies, lice, or insect bites',
    ],
    examination: [
      'Inspect skin lesions: classic golden-brown stuck-on crusts with surrounding erythema (non-bullous); or flaccid fluid-filled bullae with yellow fluid and collarette of scale upon rupture (bullous)',
      'Check for local spread, satellite lesions, or ascending lymphangitis',
      'Regional lymphadenopathy (common in cervical/submandibular nodes)',
      'Assess for complications: deep ulcerative punched-out lesions (Ecthyma), widespread skin peeling (Staphylococcal Scalded Skin Syndrome)',
    ],
    investigations: [
      'Clinical diagnosis based on characteristic appearance',
      'Wound swab for microscopy, culture & sensitivity ONLY if: recurrent episodes, treatment failure, widespread lesions, or MRSA suspected',
    ],
    differentials: [
      'Herpes simplex virus (cold sores / clustered vesicles on erythematous base)',
      'Atopic eczema with secondary impetiginisation',
      'Contact dermatitis',
      'Tinea faciei / barbae',
      'Insect bite reactions',
      'Bullous pemphigoid (older adults, tense subepidermal bullae)',
    ],
    rare: [
      'Post-Streptococcal Glomerulonephritis (PSGN — occurs 2–3 weeks after Strep. pyogenes impetigo: haematuria, hypertension, oedema)',
      'Staphylococcal Scalded Skin Syndrome (SSSS in neonates/infants — positive Nikolsky sign, systemic toxaemia)',
      'Ecthyma (deep ulcerative impetigo extending into dermis, heals with scarring)',
    ],
    plan: [
      '1. General Hygiene & Infection Control (CRITICAL):',
      '  - Strict handwashing, separate towels and flannels',
      '  - Soak and gently wash crusts off with warm soapy water before applying topical treatment',
      '  - SCHOOL / NURSERY EXCLUSION: child must stay off school/nursery until lesions have completely crusted over, or 48 hours after starting antibiotic treatment',
      '2. Localised Non-bullous Impetigo (NICE NG153):',
      '  - 1st-line: Topical Hydrogen Peroxide 1% cream (Crystacide) applied BD to TDS for 5 days (effective, avoids antibiotic resistance)',
      '  - If unsuitable or unresponsive: Topical Fusidic acid 2% cream TDS for 5 days (short course to prevent resistance)',
      '3. Widespread, Bullous, or Systemically Unwell Impetigo:',
      '  - Oral Flucloxacillin (age-appropriate liquid/capsules QDS) for 5 days',
      '  - Penicillin allergy: Oral Clarithromycin for 5 days',
    ],
    safetynetting: [
      'Instruct parents to seek urgent medical care if child becomes systemically unwell, develops high fever, poor feeding, lethargy, or widespread skin redness/peeling',
      'Report any dark/frothy urine or facial puffiness occurring 2–3 weeks later (PSGN)',
    ],
    followup: [
      'Review in 5–7 days if lesions have not resolved or continue to spread',
    ],
    referral: [
      'Same-day Emergency Paediatric Admission: neonates with impetigo/blisters, suspected Staphylococcal Scalded Skin Syndrome, or signs of systemic sepsis',
      'Dermatology: chronic recurrent impetigo with suspected household colonization (swab nares of family for Staph aureus decolonisation)',
    ],
  },
  {
    letter: 'O',
    title: 'Otitis Media (Acute)',
    icon: '🦠',
    history: [
      'Acute onset (< 48 hours) of ear pain (otalgia), fever, irritability, ear tugging/rubbing (infants), hearing loss',
      'Preceding viral upper respiratory tract infection (rhinovirus, RSV, adenovirus, influenza)',
      'Sudden relief of severe ear pain followed by purulent otorrhoea (indicates spontaneous tympanic membrane perforation)',
      'Systemic symptoms in young children: poor feeding, vomiting, lethargy, crying',
      'Recurrent AOM history (≥ 3 episodes in 6 months or ≥ 4 in 12 months)',
    ],
    examination: [
      'Systematic Otoscopy:',
      '  - Tympanic membrane: distinct bulging, fiery erythema, loss of normal landmarks (handle of malleus obscure), loss of light reflex, cloudiness/opacity',
      '  - Perforation: purulent discharge in canal with visible pulsatile discharge through perforation site',
      'Assess for MASTOIDITIS (CRITICAL): inspect and palpate mastoid bone behind ear — look for redness, swelling, tenderness, and pushing forward of the pinna',
      'Assess general paediatric vital signs (temperature, HR, RR, alertness/AVPU)',
    ],
    investigations: [
      'Clinical diagnosis based on acute history and otoscopic findings',
      'Ear swab for culture ONLY if tympanic membrane perforated and infection is recurrent or failing treatment',
    ],
    differentials: [
      'Otitis Media with Effusion (OME / "glue ear" — dull retracted TM, fluid level, NO acute inflammation/pain)',
      'Otitis Externa (tragal tenderness, swollen canal; TM may be normal)',
      'Referred otalgia (pharyngitis, tonsillitis, teething)',
      'Foreign body in ear canal',
    ],
    rare: [
      'Acute Mastoiditis (bacterial infection of mastoid air cells — emergency hospital admission!)',
      'Intracranial complications (meningitis, brain abscess, lateral sinus thrombosis)',
      'Facial nerve palsy (compression of CN VII within facial canal)',
      'Labyrinthitis with acute vertigo and severe sensorineural hearing loss',
    ],
    plan: [
      '1. Analgesia (FIRST-LINE FOR ALL PATIENTS): regular Paracetamol and/or Ibuprofen at age-appropriate therapeutic doses',
      '2. Antibiotic Strategy (NICE NG91):',
      '  - Most AOM is viral or self-limiting; > 60% of children improve within 24 hours without antibiotics',
      '  - Routine antibiotics are NOT needed for mild/uncomplicated cases; offer delayed back-pocket prescription (to use only if no improvement after 48–72 hours)',
      '  - IMMEDIATE ANTIBIOTICS indicated if:',
      '    - Systemically unwell or high risk of complications',
      '    - Otorrhoea (perforated TM)',
      '    - Child under 2 years old with bilateral AOM',
      '  - First-line Antibiotic: Oral Amoxicillin for 5 to 7 days',
      '  - Penicillin allergy: Oral Clarithromycin or Erythromycin',
    ],
    safetynetting: [
      'Instruct parents to seek emergency medical help immediately if child develops swelling or redness behind the ear, high persistent fever, extreme lethargy, stiff neck, or vomiting',
      'Reassure that a perforated TM typically heals spontaneously within 2–6 weeks',
    ],
    followup: [
      'Review in 48–72 hours if symptoms worsen or fail to improve',
      'Routine review at 6–8 weeks if perforation occurred to confirm complete TM healing',
    ],
    referral: [
      'Immediate Emergency Admission: suspected mastoiditis, neurological signs, facial weakness, severe systemic sepsis',
      'Routine ENT: recurrent AOM (for grommet / ventilation tube consideration), persistent perforation > 3 months',
    ],
  },
  {
    letter: 'W',
    title: 'Wheeze (Adult & Paediatric)',
    icon: '🌬️',
    history: [
      'Continuous, high-pitched musical sound heard during breathing (predominantly expiratory)',
      'Onset and pattern: sudden acute onset (asthma flare, foreign body, anaphylaxis) vs episodic recurrent (asthma) vs chronic progressive (COPD, heart failure)',
      'Paediatric specific history:',
      '  - Viral-induced wheeze (VIW: episodic, occurs only during viral colds, completely well between episodes)',
      '  - Multi-trigger wheeze / Asthma (wheezing with viral colds AND interval triggers: exercise, cold air, pets, laughter)',
      '  - Bronchiolitis in infants < 1 year: coryza followed by tachypnoea, poor feeding, subcostal recession',
      'Associated symptoms: cough, breathlessness, stridor (warning: inspiratory harsh noise indicates upper airway obstruction, NOT wheeze!), chest tightness',
      'Feeding, hydration, wet nappies in children',
    ],
    examination: [
      'Assess Work of Breathing & Severity (British Thoracic Society Paediatric / Adult criteria):',
      '  - Respiratory rate, oxygen saturations (SpO2 on room air)',
      '  - Paediatric distress signs: tracheal tug, intercostal and subcostal recession, nasal flaring, grunting, exhaustion',
      'Auscultation: polyphonic expiratory wheeze (widespread throughout chest); monophonic localized wheeze (warning: suggests fixed airway obstruction, inhaled foreign body, or bronchial tumour!)',
      'Silent chest: absence of audible wheeze with severe distress indicates life-threatening respiratory fatigue!',
    ],
    investigations: [
      'Pulse oximetry (SpO2) — mandatory in all wheezing patients',
      'Peak Expiratory Flow (PEF) in adults and older children (> 5 years)',
      'Chest X-ray: indicated if suspected pneumonia, pneumothorax, foreign body inhalation, or failure to respond to bronchodilators',
    ],
    differentials: [
      'Viral-Induced Wheeze (VIW) in preschool children',
      'Asthma',
      'Acute Bronchiolitis (infants < 12 months — wheeze + fine inspiratory crackles)',
      'COPD Exacerbation in older adults',
      'Anaphylaxis (accompanied by urticaria, angioedema, hypotension)',
      'Foreign body aspiration (sudden onset choking followed by unilateral monophonic wheeze)',
      'Acute pulmonary oedema ("cardiac asthma")',
    ],
    rare: [
      'Inhaled foreign body in young child / vulnerable adult',
      'Life-threatening severe acute asthma attack with silent chest',
      'Tracheal / Bronchial neoplasm causing localized monophonic wheeze',
      'Vascular ring compressing trachea in infants',
    ],
    plan: [
      '1. Acute Wheeze Management with Inhaled SABA (Salbutamol):',
      '  - Preschool child with VIW / Asthma: Salbutamol 100mcg via spacer with mask (2 to 10 puffs, 1 puff every 30–60 seconds, assess response)',
      '  - Adults: Salbutamol 4–10 puffs via spacer OR nebulised 5mg salbutamol',
      '2. Systemic Corticosteroids: Oral Prednisolone (or soluble prednisolone for children) indicated for acute moderate-to-severe asthma attacks; NOT routinely indicated for mild preschool viral wheeze',
      '3. Rehydration and supportive care',
    ],
    safetynetting: [
      'Emergency advice: call 999 immediately if breathing rate is very fast, chest is sucking in deeply, child is too breathless to talk/feed, lips are pale/blue, or reliever lasts < 3 hours',
    ],
    followup: [
      'Review within 48 hours following an acute wheezing episode',
    ],
    referral: [
      'Immediate 999 Blue Light Emergency Transfer: SpO2 < 92%, severe work of breathing, silent chest, exhaustion, poor response to 10 puffs of salbutamol',
      'Routine Paediatric / Respiratory Referral: frequent recurrent wheeze, diagnostic doubt, interval symptoms',
    ],
  },
];

async function main() {
  console.log('--- Starting Population of All Remaining Presentations ---');
  console.log(`Supabase URL: ${url}`);
  console.log(`Parent Hub ID: ${PARENT_HUB_ID}`);

  // Fetch existing subpages
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
  console.log(`Currently ${existingDocs.length} subpages exist under hub.`);

  // Insert or update all remaining presentations
  for (const pres of remainingPresentations) {
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

  // Fetch all child docs under the hub to rebuild the entire Index cleanly
  console.log('\nFetching all child documents under hub...');
  const allChildrenRes = await fetch(
    `${url}/rest/v1/documents?parent_id=eq.${PARENT_HUB_ID}&select=id,title,icon&order=title.asc`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    }
  );
  const allChildren = await allChildrenRes.json();
  console.log(`Total active presentation subpages now: ${allChildren.length}`);

  // Build the clean alphabetized Hub Index blocks
  const hubBlocks = [];
  const groups = {};

  for (const child of allChildren) {
    const cleanTitle = child.title.trim();
    const firstChar = cleanTitle.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstChar) ? firstChar : 'A';
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(child);
  }

  const sortedLetters = Object.keys(groups).sort();

  for (const letter of sortedLetters) {
    hubBlocks.push(makeHeading(letter, 2));
    groups[letter].sort((a, b) => a.title.localeCompare(b.title));
    for (const item of groups[letter]) {
      hubBlocks.push(makeLinkParagraph(item.icon || '📄', item.title, item.id));
    }
  }

  console.log(`Rebuilt Hub Index with ${hubBlocks.length} total blocks.`);

  // Update the Hub Document
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
  console.log('ALL PRESENTATIONS ARE NOW REAL ACTIVE LINKS WITH COMPLETE DETAILS!');
}

main().catch(console.error);
