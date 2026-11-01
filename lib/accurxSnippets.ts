/**
 * Accurx / SMS Snippet Library
 * Curated, verified UK GP communication templates with official NHS.uk
 * and Patient.info Patient Information Leaflet (PIL) links.
 */

export interface AccurxSnippet {
  id: string;
  title: string;
  category:
    | 'Respiratory & ENT'
    | 'Dermatology'
    | 'Cardiovascular & Metabolic'
    | 'Mental Health'
    | 'Musculoskeletal'
    | 'Gastrointestinal'
    | 'Women & Paediatrics'
    | 'Admin & Results';
  smsTemplate: string;
  pilTitle: string;
  pilUrl: string;
  tags: string[];
  safetyNetting: string;
  suggestedConsultationNote: string;
}

export const ACCURX_CATEGORIES = [
  'All',
  'Respiratory & ENT',
  'Dermatology',
  'Cardiovascular & Metabolic',
  'Mental Health',
  'Musculoskeletal',
  'Gastrointestinal',
  'Women & Paediatrics',
  'Admin & Results',
] as const;

export const ACCURX_SNIPPETS: AccurxSnippet[] = [
  // ==========================================
  // 1. RESPIRATORY & ENT
  // ==========================================
  {
    id: 'resp-viral-cough',
    title: 'Viral Cough / URTI (No Antibiotics Needed)',
    category: 'Respiratory & ENT',
    smsTemplate:
      'Dear [Patient], thank you for speaking with the surgery today. Your symptoms are consistent with a viral cough/cold which typically lasts 2 to 3 weeks. Antibiotics do not work against viruses and are not indicated. Please rest, drink plenty of fluids, and take paracetamol/ibuprofen as needed. A spoonful of honey can also help soothe a cough. Read NHS guidance here: https://www.nhs.uk/conditions/cough/ . If you develop chest pain, difficulty breathing, coughing up blood, or your fever lasts over 5 days, please contact the surgery or call 111/999 in an emergency. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Coughs & Viral Self-Care',
    pilUrl: 'https://www.nhs.uk/conditions/cough/',
    tags: ['cough', 'cold', 'urti', 'viral', 'respiratory', 'chest', 'infection'],
    safetyNetting: 'Chest pain, dyspnoea, haemoptysis, persistent fever >5 days.',
    suggestedConsultationNote:
      'Accurx SMS sent: Reassured regarding viral URTI/cough. Advised on paracetamol/hydration/honey. NHS cough PIL link provided. Safety netted regarding breathlessness, chest pain, and red flags.',
  },
  {
    id: 'resp-sore-throat-delayed-abx',
    title: 'Sore Throat / Tonsillitis & Delayed Antibiotics',
    category: 'Respiratory & ENT',
    smsTemplate:
      'Dear [Patient], as discussed, most sore throats are viral and resolve within 7 days without antibiotics. Use regular paracetamol, ibuprofen, and warm salt water gargles. We have issued a delayed prescription for antibiotics: please ONLY collect and start this if your symptoms do not start improving after 48 hours, or if you feel significantly worse. NHS advice: https://www.nhs.uk/conditions/sore-throat/ . If you develop difficulty swallowing fluids or saliva, difficulty breathing, or severe neck stiffness, seek urgent medical care immediately. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Sore Throat Advice',
    pilUrl: 'https://www.nhs.uk/conditions/sore-throat/',
    tags: ['sore throat', 'tonsillitis', 'pharyngitis', 'delayed prescription', 'antibiotics'],
    safetyNetting: 'Stridor, drooling, inability to swallow fluids, severe trismus, peritonsillar abscess.',
    suggestedConsultationNote:
      'Accurx SMS sent: Sore throat self-care advice + delayed antibiotic prescription instructions (start only if no improvement after 48h). NHS sore throat PIL link sent. Red flag safety netting given.',
  },
  {
    id: 'resp-asthma-inhaler-action',
    title: 'Asthma Flare & Inhaler Technique Guide',
    category: 'Respiratory & ENT',
    smsTemplate:
      'Dear [Patient], following our asthma review today, please continue your regular preventer inhaler as prescribed. If you experience worsening breathlessness or wheeze, use your blue reliever (Salbutamol) 2-4 puffs via a spacer, repeatable every 4 hours. Watch this NHS inhaler technique video to ensure full dose delivery: https://www.nhs.uk/conditions/asthma/inhaler-technique/ . If you need more than 6-8 puffs of your blue inhaler within 4 hours, or are struggling to speak in full sentences, seek immediate medical attention or call 999. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Inhaler Technique & Asthma Action',
    pilUrl: 'https://www.nhs.uk/conditions/asthma/inhaler-technique/',
    tags: ['asthma', 'inhaler', 'salbutamol', 'spacer', 'wheeze', 'breathless'],
    safetyNetting: 'Reliever needed >every 4h, inability to speak full sentences, silent chest, severe distress.',
    suggestedConsultationNote:
      'Accurx SMS sent: Asthma flare self-management plan and NHS inhaler technique video link sent. Safety netted regarding acute exacerbation red flags and 999 thresholds.',
  },
  {
    id: 'resp-sinusitis',
    title: 'Acute Sinusitis Self-Care & Nasal Rinse',
    category: 'Respiratory & ENT',
    smsTemplate:
      'Dear [Patient], acute sinusitis usually lasts 2 to 3 weeks and is usually viral. Antibiotics are rarely needed. You can relieve symptoms with warm face compresses, nasal saline rinses/sprays (e.g. Sterimar), paracetamol/ibuprofen, and steam inhalation. Decongestant nasal sprays can be used for a MAXIMUM of 5 to 7 days only to avoid rebound congestion. NHS guidance: https://www.nhs.uk/conditions/sinusitis/ . Contact us if symptoms worsen after 10 days or you develop swelling around your eyes or double vision. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Sinusitis Management',
    pilUrl: 'https://www.nhs.uk/conditions/sinusitis/',
    tags: ['sinusitis', 'sinus', 'congestion', 'nasal spray', 'facial pain', 'headache'],
    safetyNetting: 'Periorbital swelling, visual disturbance, severe unilateral headache, meningism.',
    suggestedConsultationNote:
      'Accurx SMS sent: Acute sinusitis guidance sent with NHS PIL link. Advised on saline nasal rinses and max 7-day decongestant limit. Red flags for periorbital cellulitis explained.',
  },
  {
    id: 'resp-otitis-media-child',
    title: 'Earache & Acute Otitis Media in Children',
    category: 'Respiratory & ENT',
    smsTemplate:
      'Dear Parent, ear infections in children usually clear up on their own in about 3 to 7 days. Give regular paracetamol and/or ibuprofen syrup at the correct dose for their weight/age to relieve pain. Keep the ear dry and avoid inserting cotton buds. Read full NHS advice here: https://www.nhs.uk/conditions/earache/ . Please seek urgent medical help if your child develops swelling/redness behind the ear, high fever with severe lethargy, fluid/discharge from both ears, or neck stiffness. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Earache in Children',
    pilUrl: 'https://www.nhs.uk/conditions/earache/',
    tags: ['earache', 'otitis media', 'child', 'paediatric', 'fever', 'ear infection'],
    safetyNetting: 'Post-auricular swelling/erythema (mastoiditis), lethargy, meningism, bilateral discharge.',
    suggestedConsultationNote:
      'Accurx SMS sent: Earache guidance for child sent to parent with NHS earache PIL link. Weight-based analgesia advised. Red flags for mastoiditis and systemic illness safety netted.',
  },

  // ==========================================
  // 2. DERMATOLOGY
  // ==========================================
  {
    id: 'derm-eczema-flare-steroids',
    title: 'Eczema Flare: Emollients & Steroid Fingertip Units',
    category: 'Dermatology',
    smsTemplate:
      'Dear [Patient], for your eczema flare, apply your prescribed steroid cream once daily for [Interval, e.g. 7-14 days] until the inflammation settles, then stop or step down. Use the Fingertip Unit (FTU) rule: one fingertip amount covers an area the size of two adult hands. Continue applying your moisturiser (emollient) generously throughout the day, waiting 20-30 minutes after applying steroid cream. NHS eczema guide: https://www.nhs.uk/conditions/atopic-eczema/ . If the skin becomes weepy with golden crusts, or develops painful clustered blisters, contact us promptly. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Atopic Eczema & Steroid Use',
    pilUrl: 'https://www.nhs.uk/conditions/atopic-eczema/',
    tags: ['eczema', 'atopic dermatitis', 'steroid cream', 'emollient', 'fingertip unit', 'rash', 'itch'],
    safetyNetting: 'Eczema herpeticum (painful clustered blisters), secondary impetiginisation (golden crusts).',
    suggestedConsultationNote:
      'Accurx SMS sent: Eczema flare treatment plan sent. FTU rule, emollient liberal use, and steroid weaning explained. NHS eczema PIL link provided. Eczema herpeticum red flags safety netted.',
  },
  {
    id: 'derm-acne-topicals',
    title: 'Acne Vulgaris: Retinoids & Benzoyl Peroxide Guide',
    category: 'Dermatology',
    smsTemplate:
      'Dear [Patient], topical acne treatments (such as benzoyl peroxide or retinoids like adapalene) take 8 to 12 weeks of consistent daily use to show clear improvement. Apply a pea-sized amount to the whole affected area at night, not just spots. It is normal to experience mild dryness, redness, or peeling in the first 2-3 weeks; if this happens, reduce to alternate nights until your skin adapts. Use an oil-free, non-comedogenic moisturiser. NHS acne advice: https://www.nhs.uk/conditions/acne/ . Best wishes, [Dr Name]',
    pilTitle: 'NHS: Acne Vulgaris Treatment',
    pilUrl: 'https://www.nhs.uk/conditions/acne/',
    tags: ['acne', 'spots', 'retinoid', 'benzoyl peroxide', 'differin', 'epiduo', 'skin'],
    safetyNetting: 'Severe cystic flares, significant psychological distress, scarring.',
    suggestedConsultationNote:
      'Accurx SMS sent: Acne topical regimen advice sent. Realistic 8-12 week timeframe and management of initial retinoid irritation explained. NHS acne PIL link provided.',
  },
  {
    id: 'derm-fungal-ringworm',
    title: 'Fungal Infection / Ringworm / Athlete’s Foot',
    category: 'Dermatology',
    smsTemplate:
      'Dear [Patient], for fungal skin infections (such as ringworm, jock itch, or athlete’s foot), apply your antifungal cream twice daily to the rash and 2cm of surrounding skin. IMPORTANT: Continue applying the cream for 1 to 2 weeks AFTER the rash has completely vanished to prevent it returning. Keep the area clean and dry, use a separate towel, and wash socks/towels at 60°C. NHS guidance: https://www.nhs.uk/conditions/ringworm/ . Contact us if there is no improvement after 2 weeks. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Ringworm & Fungal Skin Infections',
    pilUrl: 'https://www.nhs.uk/conditions/ringworm/',
    tags: ['fungal', 'ringworm', 'tinea', 'athletes foot', 'itch', 'antifungal', 'clotrimazole'],
    safetyNetting: 'Spreading cellulitis, secondary bacterial infection, no response to topical antifungal.',
    suggestedConsultationNote:
      'Accurx SMS sent: Antifungal treatment instructions provided, emphasizing continuing for 1-2 weeks post-resolution. Hygiene precautions and NHS ringworm PIL link sent.',
  },
  {
    id: 'derm-hives-urticaria',
    title: 'Urticaria (Hives) & Antihistamine Advice',
    category: 'Dermatology',
    smsTemplate:
      'Dear [Patient], urticaria (hives or nettle rash) causes raised, itchy welts that usually move around and fade within 24 hours. A non-drowsy antihistamine (such as Cetirizine, Loratadine, or Fexofenadine) is the main treatment. Avoid hot baths, tight clothing, and known triggers. NHS guide: https://www.nhs.uk/conditions/hives/ . RED FLAGS: If you develop swelling of your lips, tongue, throat, voice hoarseness, or difficulty breathing, call 999 or attend A&E immediately as this could be anaphylaxis. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Hives (Urticaria) & Allergy Advice',
    pilUrl: 'https://www.nhs.uk/conditions/hives/',
    tags: ['hives', 'urticaria', 'nettle rash', 'antihistamine', 'allergy', 'itch', 'anaphylaxis'],
    safetyNetting: 'Anaphylaxis (angioedema of lips/tongue/throat, wheeze, stridor, collapse) - 999 advice.',
    suggestedConsultationNote:
      'Accurx SMS sent: Urticaria guidance and non-sedating antihistamine advice sent. NHS hives PIL link provided. Anaphylaxis emergency warning signs clearly safety netted.',
  },
  {
    id: 'derm-pityriasis-rosea',
    title: 'Pityriasis Rosea Reassurance & Self-Care',
    category: 'Dermatology',
    smsTemplate:
      'Dear [Patient], as discussed, your rash is pityriasis rosea. This begins with a single larger oval "herald patch" followed by smaller oval patches often in a "Christmas tree" pattern across the chest and back. It is harmless, non-contagious, and clears on its own without scarring, though it can take 6 to 12 weeks. Use mild unperfumed moisturisers and a non-drowsy antihistamine if itchy. NHS guidance: https://www.nhs.uk/conditions/pityriasis-rosea/ . Contact us if the rash has not cleared after 12 weeks. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Pityriasis Rosea',
    pilUrl: 'https://www.nhs.uk/conditions/pityriasis-rosea/',
    tags: ['pityriasis rosea', 'herald patch', 'christmas tree', 'rash', 'oval', 'itch'],
    safetyNetting: 'Rash persisting beyond 12 weeks, atypical morphology, mucosal involvement.',
    suggestedConsultationNote:
      'Accurx SMS sent: Reassured regarding benign self-limiting nature of pityriasis rosea (6-12w expected duration). NHS PIL link sent. Advice on emollients and antihistamines for pruritus.',
  },

  // ==========================================
  // 3. CARDIOVASCULAR & METABOLIC
  // ==========================================
  {
    id: 'cv-home-bp-monitoring',
    title: 'Home Blood Pressure Monitoring (HBPM) Protocol',
    category: 'Cardiovascular & Metabolic',
    smsTemplate:
      'Dear [Patient], please monitor your blood pressure at home for 7 consecutive days. Take 2 readings in the morning and 2 in the evening (seated, resting for 5 mins beforehand). Record all numbers on a chart. Discard Day 1 readings; we will calculate the average of Days 2 to 7. Please reply with your readings or drop your chart off at reception. NHS blood pressure guide: https://www.nhs.uk/conditions/high-blood-pressure-hypertension/ . If your BP is consistently over 180/110 with headache or chest pain, seek urgent medical advice. Best wishes, [Dr Name]',
    pilTitle: 'NHS: High Blood Pressure & Home Monitoring',
    pilUrl: 'https://www.nhs.uk/conditions/high-blood-pressure-hypertension/',
    tags: ['hypertension', 'blood pressure', 'hbpm', 'readings', 'monitor', 'cardio'],
    safetyNetting: 'Severe hypertension >180/110 with acute symptoms (chest pain, shortness of breath, neurological signs).',
    suggestedConsultationNote:
      'Accurx SMS sent: 7-day home BP monitoring protocol instructions sent with NHS hypertension link. Clear instructions to discard day 1 and submit 6-day average.',
  },
  {
    id: 'cv-ramipril-acei-start',
    title: 'Starting ACE Inhibitor (Ramipril) & Bloods in 2 Weeks',
    category: 'Cardiovascular & Metabolic',
    smsTemplate:
      'Dear [Patient], you have been started on Ramipril to help manage your blood pressure / protect your heart and kidneys. Take your tablet once daily, preferably at the same time each morning. A routine kidney function (U&E) blood test is required in 1 to 2 weeks time to monitor your body’s response. Please contact reception to book this blood test. NHS medicine guide: https://www.nhs.uk/medicines/ramipril/ . Please let us know if you develop a persistent dry tickly cough, dizziness when standing, or lip swelling. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Ramipril Patient Guide',
    pilUrl: 'https://www.nhs.uk/medicines/ramipril/',
    tags: ['ramipril', 'ace inhibitor', 'hypertension', 'blood test', 'u&e', 'kidney'],
    safetyNetting: 'Persistent ACEI cough, postural hypotension, angioedema (swollen lips/tongue).',
    suggestedConsultationNote:
      'Accurx SMS sent: Ramipril initiation instructions sent. Requested repeat U&E blood test in 1-2 weeks. Advised on postural dizziness, dry cough, and angioedema symptoms.',
  },
  {
    id: 'cv-statin-initiation',
    title: 'Starting Atorvastatin (Cholesterol & Heart Protection)',
    category: 'Cardiovascular & Metabolic',
    smsTemplate:
      'Dear [Patient], you have been prescribed Atorvastatin to reduce your cholesterol and protect your cardiovascular health. Take one tablet once daily at night. Statins are safe and well-tolerated by the vast majority of patients. We will arrange a routine follow-up blood test in 3 months to check your cholesterol and liver enzymes. NHS statin guide: https://www.nhs.uk/medicines/atorvastatin/ . If you experience severe, unexplained muscle pain, tenderness, or weakness, please contact the surgery. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Atorvastatin & Statin Facts',
    pilUrl: 'https://www.nhs.uk/medicines/atorvastatin/',
    tags: ['statin', 'atorvastatin', 'cholesterol', 'qrisk', 'lipids', 'cardiovascular'],
    safetyNetting: 'Unexplained persistent severe muscle pain, dark urine (rhabdomyolysis warning).',
    suggestedConsultationNote:
      'Accurx SMS sent: Atorvastatin initiation information sent. Addressed common concerns, requested routine 3-month LFT/lipid check. Safety netted regarding unexplained muscle pain.',
  },
  {
    id: 'cv-prediabetes-ndpp',
    title: 'Prediabetes (Borderline Blood Sugar) & NHS Programme',
    category: 'Cardiovascular & Metabolic',
    smsTemplate:
      'Dear [Patient], your recent HbA1c blood test showed prediabetes (borderline raised blood sugar). The good news is that with healthy dietary adjustments, weight management, and regular physical activity, prediabetes can often be reversed before turning into Type 2 Diabetes. You are eligible for the free NHS Diabetes Prevention Programme (NDPP). Read NHS advice here: https://www.nhs.uk/conditions/type-2-diabetes/preventing-type-2-diabetes/ . We will repeat your HbA1c blood test in 12 months. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Preventing Type 2 Diabetes',
    pilUrl: 'https://www.nhs.uk/conditions/type-2-diabetes/preventing-type-2-diabetes/',
    tags: ['prediabetes', 'diabetes', 'hba1c', 'ndpp', 'lifestyle', 'diet', 'metabolic'],
    safetyNetting: 'Classic diabetic symptoms: polyuria, polydipsia, unexplained weight loss.',
    suggestedConsultationNote:
      'Accurx SMS sent: Prediabetes diagnosis communicated with encouraging lifestyle advice and NHS NDPP information link. Annual repeat HbA1c flagged.',
  },

  // ==========================================
  // 4. MENTAL HEALTH
  // ==========================================
  {
    id: 'mh-iapt-self-referral',
    title: 'Anxiety / Depression: NHS Talking Therapies (IAPT)',
    category: 'Mental Health',
    smsTemplate:
      'Dear [Patient], thank you for sharing how you have been feeling today. You can self-refer directly to free NHS Talking Therapies (counselling & CBT) without needing a GP referral. Please use this secure NHS link to register with your local service: https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/nhs-talking-therapies/ . If you feel unable to cope or have thoughts of harming yourself, call 111, contact Samaritans free on 116 123 (available 24/7), or text SHOUT to 85258. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Find an NHS Talking Therapies Service',
    pilUrl:
      'https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/nhs-talking-therapies/',
    tags: ['mental health', 'anxiety', 'depression', 'counselling', 'cbt', 'iapt', 'talking therapies', 'crisis'],
    safetyNetting: 'Crisis support: 111 mental health option, Samaritans 116 123, Shout 85258, A&E.',
    suggestedConsultationNote:
      'Accurx SMS sent: NHS Talking Therapies self-referral link provided. Crisis safety net contacts (Samaritans 116 123, Shout 85258, NHS 111) sent and documented.',
  },
  {
    id: 'mh-ssri-sertraline-start',
    title: 'Starting SSRI Antidepressant (Sertraline / Citalopram)',
    category: 'Mental Health',
    smsTemplate:
      'Dear [Patient], you have been prescribed Sertraline for your mood/anxiety. Take one tablet each morning with food. Please note: antidepressants typically take 2 to 4 weeks before you notice significant benefit. You might experience mild nausea, headache, or slight initial increase in anxiety during the first 1-2 weeks; this usually settles. Do not stop taking your medication suddenly. NHS guide: https://www.nhs.uk/medicines/sertraline/ . If you experience distressing thoughts, please contact the surgery, ring 111, or call Samaritans on 116 123. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Sertraline Patient Information',
    pilUrl: 'https://www.nhs.uk/medicines/sertraline/',
    tags: ['sertraline', 'citalopram', 'ssri', 'antidepressant', 'anxiety', 'depression'],
    safetyNetting: 'Paradoxical anxiety in week 1, suicidal ideation, serotonin syndrome, abrupt cessation.',
    suggestedConsultationNote:
      'Accurx SMS sent: Sertraline initiation leaflet sent. Realistic 2-4 week onset of action and transient early side effects explained. Crisis lines and GP review in 2-4 weeks booked.',
  },
  {
    id: 'mh-sleep-hygiene',
    title: 'Insomnia & Healthy Sleep Hygiene Rules',
    category: 'Mental Health',
    smsTemplate:
      'Dear [Patient], to help rebuild healthy natural sleep patterns, practice good sleep hygiene: 1) Go to bed and wake up at the exact same time every day, including weekends. 2) Avoid screens/phones for 1 hour before sleep. 3) If awake after 20 minutes in bed, get up, sit in dim light, and do something relaxing until sleepy. 4) Avoid caffeine after 12pm. Sleeping tablets are not recommended as they disrupt deep sleep and cause rapid dependence. NHS sleep guide: https://www.nhs.uk/conditions/insomnia/ . Best wishes, [Dr Name]',
    pilTitle: 'NHS: Sleep & Insomnia Advice',
    pilUrl: 'https://www.nhs.uk/conditions/insomnia/',
    tags: ['insomnia', 'sleep', 'tired', 'sleep hygiene', 'sedatives', 'wellbeing'],
    safetyNetting: 'Underlying sleep apnoea, chronic insomnia refractory to CBT-I.',
    suggestedConsultationNote:
      'Accurx SMS sent: Sleep hygiene guidelines sent with NHS insomnia leaflet. Explained rationale against hypnotic/sedative prescribing.',
  },

  // ==========================================
  // 5. MUSCULOSKELETAL (MSK)
  // ==========================================
  {
    id: 'msk-back-pain-cauda-equina',
    title: 'Acute Low Back Pain & Cauda Equina Red Flags',
    category: 'Musculoskeletal',
    smsTemplate:
      'Dear [Patient], for acute low back pain, the most effective treatment is staying gently active and avoiding prolonged bed rest. Take paracetamol or ibuprofen regularly for comfort and apply a warm heat pack. NHS back pain exercises: https://www.nhs.uk/conditions/back-pain/ . RED FLAGS: Go to A&E immediately or call 999 if you develop numbness around your genitals/buttocks, loss of bladder control, inability to pass urine, loss of bowel control, or severe weakness in both legs (Cauda Equina warning signs). Best wishes, [Dr Name]',
    pilTitle: 'NHS: Back Pain Exercises & Emergency Red Flags',
    pilUrl: 'https://www.nhs.uk/conditions/back-pain/',
    tags: ['back pain', 'sciatica', 'lumbar', 'cauda equina', 'spine', 'physio'],
    safetyNetting: 'Cauda Equina Syndrome: saddle anaesthesia, bowel/bladder incontinence, bilateral motor deficit.',
    suggestedConsultationNote:
      'Accurx SMS sent: Low back pain self-management and mobility exercises sent. Cauda Equina syndrome emergency red flags explicitly safety netted.',
  },
  {
    id: 'msk-plantar-fasciitis',
    title: 'Plantar Fasciitis (Heel Pain) Exercises & Footwear',
    category: 'Musculoskeletal',
    smsTemplate:
      'Dear [Patient], plantar fasciitis causes sharp heel pain that is worst with first steps in the morning. Key steps for recovery: 1) Gentle calf and plantar fascia stretches before stepping out of bed. 2) Roll the arch of your foot over a cold water bottle for 5 mins twice daily. 3) Wear supportive, cushioned footwear with a slight heel (avoid walking barefoot or in flat slip-on shoes). 4) Use cushioned heel cups. Read NHS advice: https://www.nhs.uk/conditions/plantar-fasciitis/ . It can take several months to fully settle. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Plantar Fasciitis Management',
    pilUrl: 'https://www.nhs.uk/conditions/plantar-fasciitis/',
    tags: ['heel pain', 'plantar fasciitis', 'foot', 'stretches', 'exercises', 'msk'],
    safetyNetting: 'Inability to weight-bear, suspicion of calcaneal stress fracture, neuropathic pain.',
    suggestedConsultationNote:
      'Accurx SMS sent: Plantar fasciitis stretches, footwear advice, and ice massage instructions sent with NHS PIL link.',
  },
  {
    id: 'msk-physio-self-referral',
    title: 'NHS Musculoskeletal (MSK) Physiotherapy Self-Referral',
    category: 'Musculoskeletal',
    smsTemplate:
      'Dear [Patient], you can self-refer directly to your local NHS Physiotherapy service without waiting for a doctor’s appointment. Physiotherapists are specialists in joint, muscle, and ligament injuries and can provide targeted exercise rehabilitation plans. Learn more about NHS physiotherapy services here: https://www.nhs.uk/conditions/physiotherapy/ . Please visit your local NHS Trust/ICB website to submit your self-referral form. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Physiotherapy Self-Referral Guide',
    pilUrl: 'https://www.nhs.uk/conditions/physiotherapy/',
    tags: ['physio', 'physiotherapy', 'joint', 'knee', 'shoulder', 'rehab', 'exercise'],
    safetyNetting: 'Hot swollen joint, systemic signs, trauma with inability to weight-bear.',
    suggestedConsultationNote:
      'Accurx SMS sent: NHS physiotherapy self-referral link and information sent for joint/muscle rehabilitation.',
  },

  // ==========================================
  // 6. GASTROINTESTINAL
  // ==========================================
  {
    id: 'gi-gastroenteritis-norovirus',
    title: 'Gastroenteritis (D&V) & 48h Isolation Rule',
    category: 'Gastrointestinal',
    smsTemplate:
      'Dear [Patient], for stomach bugs with diarrhoea and vomiting, stay at home and take small, frequent sips of fluid or oral rehydration salts (Dioralyte) to prevent dehydration. Eat plain foods (toast, rice, crackers) when feeling able. IMPORTANT: Stay off work or school until you have been free of diarrhoea and vomiting for at least 48 continuous hours to avoid spreading infection. NHS guidance: https://www.nhs.uk/conditions/diarrhoea-and-vomiting/ . Contact 111 or the surgery if you cannot keep fluids down for 24h, have blood in your vomit/stool, or develop severe stomach pain. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Diarrhoea & Vomiting (Norovirus)',
    pilUrl: 'https://www.nhs.uk/conditions/diarrhoea-and-vomiting/',
    tags: ['diarrhoea', 'vomiting', 'gastroenteritis', 'norovirus', 'stomach bug', 'dehydration'],
    safetyNetting: 'Dehydration, haematemesis, melaena, peritonism, persistent high fever.',
    suggestedConsultationNote:
      'Accurx SMS sent: Gastroenteritis self-care, ORS rehydration, and mandatory 48-hour exclusion rule communicated with NHS link. Red flags safety netted.',
  },
  {
    id: 'gi-gerd-acid-reflux',
    title: 'Heartburn / Acid Reflux & PPI Instructions',
    category: 'Gastrointestinal',
    smsTemplate:
      'Dear [Patient], for heartburn and acid reflux: 1) Take your prescribed stomach medication (e.g. Omeprazole/Lansoprazole) 30 to 60 minutes BEFORE breakfast with a glass of water. 2) Avoid eating within 3 hours of going to bed. 3) Reduce trigger foods like caffeine, alcohol, fatty foods, and citrus. 4) Raise the head of your bed by 10-15cm. Read NHS guidance: https://www.nhs.uk/conditions/heartburn-and-acid-reflux/ . Contact us urgently if you experience food sticking in your throat, difficulty swallowing, or unexplained weight loss. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Acid Reflux & Heartburn',
    pilUrl: 'https://www.nhs.uk/conditions/heartburn-and-acid-reflux/',
    tags: ['reflux', 'heartburn', 'gerd', 'gord', 'omeprazole', 'lansoprazole', 'stomach'],
    safetyNetting: 'Dysphagia (food sticking), odynophagia, unexplained weight loss, persistent vomiting.',
    suggestedConsultationNote:
      'Accurx SMS sent: Acid reflux lifestyle measures and proper PPI timing (30m pre-breakfast) explained. NHS PIL link sent. Dysphagia 2WW red flags safety netted.',
  },
  {
    id: 'gi-constipation-laxatives',
    title: 'Constipation & Laxative Titration Advice',
    category: 'Gastrointestinal',
    smsTemplate:
      'Dear [Patient], to help relieve constipation: 1) Drink at least 1.5 to 2 litres of water daily. 2) Gradually increase dietary fibre (oats, beans, fruit, vegetables). 3) If taking Macrogol (Laxido/Cosmocol), dissolve each sachet in 125ml water; you can adjust between 1 to 3 sachets daily until stools are soft and easy to pass. NHS advice: https://www.nhs.uk/conditions/constipation/ . Contact us if you develop severe abdominal swelling/pain, vomiting, or blood mixed in your stool. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Constipation Relief & Laxatives',
    pilUrl: 'https://www.nhs.uk/conditions/constipation/',
    tags: ['constipation', 'laxative', 'laxido', 'cosmocol', 'fibre', 'bowels'],
    safetyNetting: 'Bowel obstruction (vomiting, colic, distension), melaena, rectal bleeding, tenesmus.',
    suggestedConsultationNote:
      'Accurx SMS sent: Dietary fibre, fluid targets, and macrogol titration guidance provided with NHS constipation PIL link.',
  },

  // ==========================================
  // 7. WOMEN & PAEDIATRICS
  // ==========================================
  {
    id: 'wp-uti-cystitis-women',
    title: 'Uncomplicated UTI (Cystitis) & Pyelonephritis Red Flags',
    category: 'Women & Paediatrics',
    smsTemplate:
      'Dear [Patient], for your urinary tract infection (cystitis), please take your prescribed antibiotic course exactly as directed and complete all tablets. Drink plenty of water to help flush bacteria out, take paracetamol for pelvic discomfort, and avoid sex until cleared. Read NHS cystitis guidance: https://www.nhs.uk/conditions/urinary-tract-infections-utis/ . RED FLAGS: If you develop high shivering chills, severe lower back or loin pain, nausea, or vomiting, contact the surgery or call 111 immediately as this could indicate an ascending kidney infection. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Urinary Tract Infections (UTIs)',
    pilUrl: 'https://www.nhs.uk/conditions/urinary-tract-infections-utis/',
    tags: ['uti', 'cystitis', 'urine', 'nitrofurantoin', 'antibiotics', 'water infection'],
    safetyNetting: 'Pyelonephritis red flags: loin/flank pain, rigors, vomiting, high fever.',
    suggestedConsultationNote:
      'Accurx SMS sent: Cystitis antibiotic advice, hydration, and NHS UTI PIL link sent. Upper UTI (pyelonephritis) warning signs clearly safety netted.',
  },
  {
    id: 'wp-child-fever-traffic-light',
    title: 'Child Fever & NICE Traffic Light Safety Net',
    category: 'Women & Paediatrics',
    smsTemplate:
      'Dear Parent, fever is a normal response by the body fighting infection. Keep your child lightly dressed, encourage small frequent fluids (breast milk, water, diluted squash), and give paracetamol or ibuprofen syrup if they seem distressed or uncomfortable by the fever. NHS child fever guide: https://www.nhs.uk/conditions/fever-in-children/ . URGENT RED FLAGS: Call 999 or attend A&E immediately if your child develops a rash that does not fade under a glass, rapid breathing or grunting, floppy/unresponsive behaviour, or a seizure. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Fever in Children & Warning Signs',
    pilUrl: 'https://www.nhs.uk/conditions/fever-in-children/',
    tags: ['fever', 'child', 'paediatric', 'temperature', 'calpol', 'glass test', 'sepsis'],
    safetyNetting: 'NICE Traffic Light RED: non-blanching rash, grunting, tachypnoea, CRT >3s, floppy/inconsolable.',
    suggestedConsultationNote:
      'Accurx SMS sent: Paediatric fever self-care sent to parent. Analgesia dosing and hydration advised. NICE amber/red flag safety netting (meningitis/sepsis signs) documented.',
  },
  {
    id: 'wp-hrt-initiation-bleeding',
    title: 'HRT Initiation & Expected Bleeding Changes',
    category: 'Women & Paediatrics',
    smsTemplate:
      'Dear [Patient], starting Hormone Replacement Therapy (HRT) can significantly improve menopausal symptoms like hot flushes, mood changes, and sleep. Please note: it is very common to experience irregular spotting, light bleeding, or breast tenderness in the first 3 to 6 months while your body adapts to the hormones. NHS HRT guide: https://www.nhs.uk/conditions/menopause/treatment/ . We will arrange a review in 3 months. If bleeding becomes very heavy or continues past 6 months, please let us know. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Hormone Replacement Therapy (HRT)',
    pilUrl: 'https://www.nhs.uk/conditions/menopause/treatment/',
    tags: ['hrt', 'menopause', 'bleeding', 'estrogen', 'progesterone', 'hot flushes'],
    safetyNetting: 'Persistent bleeding >6 months, post-menopausal bleeding after period of amenorrhoea.',
    suggestedConsultationNote:
      'Accurx SMS sent: HRT initiation information sent. Reassured regarding benign breakthrough bleeding in first 3-6 months. NHS menopause link provided.',
  },

  // ==========================================
  // 8. ADMIN & RESULTS
  // ==========================================
  {
    id: 'admin-bloods-normal',
    title: 'Blood Test Results Normal & Reassuring',
    category: 'Admin & Results',
    smsTemplate:
      'Dear [Patient], your recent blood test results have been reviewed by a GP and are all within normal limits. No further action or follow-up is needed for these tests. If your original symptoms persist, change, or you have ongoing concerns, please do not hesitate to contact the surgery. Best wishes, [Surgery Name]',
    pilTitle: 'NHS App: Viewing Health Records',
    pilUrl: 'https://www.nhs.uk/nhs-app/',
    tags: ['blood test', 'results', 'normal', 'reassurance', 'admin', 'labs'],
    safetyNetting: 'Persistent symptoms require re-evaluation regardless of normal bloods.',
    suggestedConsultationNote:
      'Accurx SMS sent: Patient notified that recent blood test results are completely normal and reassuring. Advised to recontact if symptoms persist.',
  },
  {
    id: 'admin-bloods-routine-recall',
    title: 'Non-Urgent Blood Test Repeat / Review Request',
    category: 'Admin & Results',
    smsTemplate:
      'Dear [Patient], your recent blood test results have been reviewed by a GP. A routine non-urgent repeat blood test or review is recommended in [Interval, e.g. 4 to 6 weeks]. There is no cause for alarm. Please contact reception or use our online consultation service to book this test at your convenience. Best wishes, [Surgery Name]',
    pilTitle: 'NHS: Blood Tests Explained',
    pilUrl: 'https://www.nhs.uk/conditions/blood-tests/',
    tags: ['blood test', 'repeat', 'routine', 'non-urgent', 'recall', 'admin'],
    safetyNetting: 'Non-urgent recall. Patient advised to contact reception to schedule.',
    suggestedConsultationNote:
      'Accurx SMS sent: Routine non-urgent repeat blood test requested. Reassured patient that recall is non-urgent.',
  },
  {
    id: 'admin-fit-note-issued',
    title: 'Fit Note (Med3 / Sick Note) Ready / Issued',
    category: 'Admin & Results',
    smsTemplate:
      'Dear [Patient], your Statement of Fitness for Work (Fit Note / Med3) has been signed by the doctor for the period [Start Date] to [End Date]. You can download this securely from the link provided or collect a paper copy from reception. Self-certification guidance and fit note rules: https://www.gov.uk/taking-sick-leave . Please contact us before this expires if you feel unable to return to work. Best wishes, [Surgery Name]',
    pilTitle: 'GOV.UK: Fit Note & Sick Leave Rules',
    pilUrl: 'https://www.gov.uk/taking-sick-leave',
    tags: ['fit note', 'med3', 'sick note', 'work', 'off work', 'admin'],
    safetyNetting: 'Patient instructed to contact surgery prior to expiry if ongoing incapacity.',
    suggestedConsultationNote:
      'Accurx SMS sent: Fit note (Med3) issued and link sent to patient with return-to-work advice.',
  },
  {
    id: 'admin-hospital-referral-ers',
    title: 'Hospital Referral Submitted & e-Referral Tracking',
    category: 'Admin & Results',
    smsTemplate:
      'Dear [Patient], as discussed, we have submitted a referral for you to [Hospital Specialty / Clinic]. You will receive a letter, SMS, or email with booking instructions via the NHS e-Referral Service. You can also view and manage your referral on the NHS App: https://www.nhs.uk/nhs-app/ . If you do not hear anything within 4 weeks, please contact the hospital booking office or the surgery. Best wishes, [Surgery Name]',
    pilTitle: 'NHS: NHS e-Referral Service & Waiting Times',
    pilUrl: 'https://www.nhs.uk/nhs-services/hospitals/referrals-for-specialist-care/',
    tags: ['referral', 'hospital', 'ers', 'specialist', 'clinic', 'admin'],
    safetyNetting: 'Chasing threshold 4 weeks. Red flags to report if symptoms deteriorate.',
    suggestedConsultationNote:
      'Accurx SMS sent: Routine referral submitted to specialist. Tracking guidance via NHS App provided.',
  },
];
