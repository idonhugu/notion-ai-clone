/**
 * Accurx / SMS Snippet Library
 * Curated, verified UK GP communication templates with official specialist college
 * leaflets (BAD, RCOG, Versus Arthritis, Asthma + Lung UK) and official NHS.uk links.
 */

export type LeafletAuthority =
  | 'BAD' // British Association of Dermatologists (Skin Health Info)
  | 'RCOG' // Royal College of Obstetricians and Gynaecologists
  | 'Versus Arthritis' // British Society for Rheumatology / Arthritis UK
  | 'Asthma + Lung UK' // Asthma and Lung UK
  | 'NHS'; // NHS.uk / UK Gov

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
  authority?: LeafletAuthority;
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

export const ACCURX_AUTHORITIES = [
  'All Authorities',
  'BAD (Dermatology)',
  'RCOG (Women\'s Health)',
  'Versus Arthritis',
  'Asthma + Lung UK',
  'NHS UK',
] as const;

export const ACCURX_SNIPPETS: AccurxSnippet[] = [
  // ==========================================
  // 1. RESPIRATORY & ENT
  // ==========================================
  {
    id: 'resp-viral-cough',
    title: 'Viral Cough / URTI (No Antibiotics Needed)',
    category: 'Respiratory & ENT',
    authority: 'NHS',
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
    authority: 'NHS',
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
    authority: 'Asthma + Lung UK',
    smsTemplate:
      'Dear [Patient], following our asthma review today, please continue your regular preventer inhaler daily as prescribed. If you experience worsening breathlessness or wheeze, take your blue reliever (Salbutamol) 2-4 puffs via a spacer, repeatable every 4 hours. Watch this Asthma + Lung UK inhaler technique video to ensure full lung delivery: https://www.asthmaandlung.org.uk/conditions/asthma . If you need more than 6-8 puffs of your blue inhaler within 4 hours, or are struggling to speak in full sentences, call 999 or attend A&E immediately. Best wishes, [Dr Name]',
    pilTitle: 'Asthma + Lung UK: Inhaler Technique & Action Plan',
    pilUrl: 'https://www.asthmaandlung.org.uk/conditions/asthma',
    tags: ['asthma', 'inhaler', 'salbutamol', 'spacer', 'wheeze', 'breathless', 'asthma + lung uk'],
    safetyNetting: 'Reliever needed >every 4h, inability to speak full sentences, silent chest, severe distress.',
    suggestedConsultationNote:
      'Accurx SMS sent: Asthma flare self-management plan and Asthma + Lung UK inhaler technique link sent. Safety netted regarding acute exacerbation red flags and 999 thresholds.',
  },
  {
    id: 'resp-sinusitis',
    title: 'Acute Sinusitis Self-Care & Nasal Rinse',
    category: 'Respiratory & ENT',
    authority: 'NHS',
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
    authority: 'NHS',
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
  // 2. DERMATOLOGY (BAD - British Association of Dermatologists)
  // ==========================================
  {
    id: 'derm-eczema-bad',
    title: 'Eczema Flare: Emollients & Steroids (BAD Leaflet)',
    category: 'Dermatology',
    authority: 'BAD',
    smsTemplate:
      'Dear [Patient], for your eczema flare, apply your prescribed steroid cream once daily until inflammation settles, then taper off. Use the Fingertip Unit (FTU) rule: one fingertip amount covers an area the size of two adult hands. Continue applying your moisturiser (emollient) generously throughout the day, waiting 20-30 mins after applying steroid cream. Official British Association of Dermatologists (BAD) leaflet: https://www.skinhealthinfo.org.uk/condition/atopic-eczema/ . If skin becomes weepy with golden crusts or painful clustered blisters, contact us promptly. Best wishes, [Dr Name]',
    pilTitle: 'BAD: Atopic Eczema Patient Leaflet',
    pilUrl: 'https://www.skinhealthinfo.org.uk/condition/atopic-eczema/',
    tags: ['eczema', 'atopic dermatitis', 'steroid cream', 'emollient', 'fingertip unit', 'rash', 'itch', 'bad'],
    safetyNetting: 'Eczema herpeticum (painful clustered blisters), secondary impetiginisation (golden crusts).',
    suggestedConsultationNote:
      'Accurx SMS sent: Eczema flare treatment plan sent with official British Association of Dermatologists (BAD) leaflet link. FTU rule, emollient liberal use, and eczema herpeticum red flags documented.',
  },
  {
    id: 'derm-steroids-ftu-bad',
    title: 'Topical Steroids & Fingertip Units Guide (BAD Leaflet)',
    category: 'Dermatology',
    authority: 'BAD',
    smsTemplate:
      'Dear [Patient], as discussed, topical steroid creams are very safe and effective when used correctly for prescribed intervals. Use the Fingertip Unit (FTU) rule: 1 FTU (cream from index finger crease to tip) covers two adult handprints. Apply thinly once daily to inflamed skin only. Official British Association of Dermatologists (BAD) steroid guide: https://www.skinhealthinfo.org.uk/condition/topical-corticosteroids/ . Always leave 20-30 mins between steroid and your regular emollient moisturiser. Best wishes, [Dr Name]',
    pilTitle: 'BAD: Topical Corticosteroids Guide',
    pilUrl: 'https://www.skinhealthinfo.org.uk/condition/topical-corticosteroids/',
    tags: ['steroids', 'topical corticosteroids', 'ftu', 'fingertip unit', 'hydrocortisone', 'betnovate', 'bad'],
    safetyNetting: 'Skin thinning, lack of improvement after 2-3 weeks, secondary infection.',
    suggestedConsultationNote:
      'Accurx SMS sent: Topical corticosteroid safety advice sent with official British Association of Dermatologists (BAD) guide. FTU dosage and spacing from emollients explained.',
  },
  {
    id: 'derm-acne-bad',
    title: 'Acne Vulgaris: Retinoids & Topicals Guide (BAD Leaflet)',
    category: 'Dermatology',
    authority: 'BAD',
    smsTemplate:
      'Dear [Patient], topical acne treatments (such as benzoyl peroxide or retinoids like adapalene) take 8 to 12 weeks of consistent daily use to show clear improvement. Apply a pea-sized amount to the whole affected area at night, not just spots. It is normal to experience mild dryness, redness, or peeling in the first 2-3 weeks; if this happens, reduce to alternate nights until your skin adapts. Read the British Association of Dermatologists (BAD) acne guide: https://www.skinhealthinfo.org.uk/condition/acne/ . Best wishes, [Dr Name]',
    pilTitle: 'BAD: Acne Vulgaris Patient Leaflet',
    pilUrl: 'https://www.skinhealthinfo.org.uk/condition/acne/',
    tags: ['acne', 'spots', 'retinoid', 'benzoyl peroxide', 'differin', 'epiduo', 'skin', 'bad'],
    safetyNetting: 'Severe cystic flares, significant psychological distress, scarring.',
    suggestedConsultationNote:
      'Accurx SMS sent: Acne topical regimen advice sent with official British Association of Dermatologists (BAD) leaflet. Realistic 8-12 week timeframe and management of initial retinoid irritation explained.',
  },
  {
    id: 'derm-psoriasis-bad',
    title: 'Psoriasis Overview & Topical Management (BAD Leaflet)',
    category: 'Dermatology',
    authority: 'BAD',
    smsTemplate:
      'Dear [Patient], for your psoriasis, please apply your prescribed topical treatment (such as calcipotriol or steroid combination) once daily to the scaly plaques. Regular daily emollient moisturisers help soften scaling and soothe itchiness. Read the official British Association of Dermatologists (BAD) psoriasis guide: https://www.skinhealthinfo.org.uk/condition/psoriasis/ . Please let us know if your joints become stiff or swollen, or if plaques spread rapidly across your body. Best wishes, [Dr Name]',
    pilTitle: 'BAD: Psoriasis Patient Information Leaflet',
    pilUrl: 'https://www.skinhealthinfo.org.uk/condition/psoriasis/',
    tags: ['psoriasis', 'plaques', 'calcipotriol', 'dovobet', 'scalp', 'bad'],
    safetyNetting: 'Psoriatic arthritis (morning stiffness >30m, swollen fingers/toes), erythrodermic flare.',
    suggestedConsultationNote:
      'Accurx SMS sent: Psoriasis management and official British Association of Dermatologists (BAD) PIL link sent. Advised on topical treatment adherence and screened for psoriatic arthropathy.',
  },
  {
    id: 'derm-urticaria-bad',
    title: 'Urticaria (Hives) & Antihistamines (BAD Leaflet)',
    category: 'Dermatology',
    authority: 'BAD',
    smsTemplate:
      'Dear [Patient], urticaria (hives or nettle rash) causes raised, intensely itchy welts that typically move around and fade within 24 hours. A non-drowsy antihistamine (such as Cetirizine or Fexofenadine) is the primary treatment. Official British Association of Dermatologists (BAD) leaflet: https://www.skinhealthinfo.org.uk/condition/urticaria-and-angioedema/ . RED FLAGS: If you develop swelling of your lips, tongue, or throat, difficulty swallowing or breathing, call 999 or attend A&E immediately. Best wishes, [Dr Name]',
    pilTitle: 'BAD: Urticaria and Angioedema Leaflet',
    pilUrl: 'https://www.skinhealthinfo.org.uk/condition/urticaria-and-angioedema/',
    tags: ['hives', 'urticaria', 'nettle rash', 'antihistamine', 'allergy', 'itch', 'anaphylaxis', 'bad'],
    safetyNetting: 'Anaphylaxis (angioedema of lips/tongue/throat, wheeze, stridor, collapse) - 999 advice.',
    suggestedConsultationNote:
      'Accurx SMS sent: Urticaria guidance and non-sedating antihistamine advice sent with official British Association of Dermatologists (BAD) leaflet. Anaphylaxis emergency warning signs clearly safety netted.',
  },
  {
    id: 'derm-scabies-bad',
    title: 'Scabies Permethrin Regimen & Household Contacts (BAD)',
    category: 'Dermatology',
    authority: 'BAD',
    smsTemplate:
      'Dear [Patient], for scabies, ALL household contacts must be treated simultaneously on the same evening, even if they have no itch. Apply Permethrin 5% cream to your entire body from the neck down (including under nails, soles of feet, and genitals). Leave on for 8-12 hours before washing off. Repeat the treatment exactly 7 days later. Wash all bedding and clothing at 60°C on Day 1. Official British Association of Dermatologists (BAD) guide: https://www.skinhealthinfo.org.uk/condition/scabies/ . Itching can take 2-4 weeks to settle after mites are eradicated. Best wishes, [Dr Name]',
    pilTitle: 'BAD: Scabies Patient Information Leaflet',
    pilUrl: 'https://www.skinhealthinfo.org.uk/condition/scabies/',
    tags: ['scabies', 'permethrin', 'itch', 'mites', 'burrows', 'household', 'bad'],
    safetyNetting: 'Secondary bacterial infection (cellulitis, impetigo), persistent symptoms >4 weeks.',
    suggestedConsultationNote:
      'Accurx SMS sent: Scabies treatment instructions sent with official British Association of Dermatologists (BAD) leaflet. Simultaneous household contact treatment and Day 7 repeat emphasized.',
  },
  {
    id: 'derm-rosacea-bad',
    title: 'Rosacea Management & Trigger Avoidance (BAD Leaflet)',
    category: 'Dermatology',
    authority: 'BAD',
    smsTemplate:
      'Dear [Patient], rosacea causes facial redness, flushing, and small spots. Apply your prescribed cream (e.g. Soolantra / Ivermectin or Metronidazole) once daily at night. Use a broad-spectrum daily SPF 30-50 sunscreen, as UV light is a major trigger. Avoid common triggers like hot spicy foods, alcohol, and harsh facial scrubs. Official British Association of Dermatologists (BAD) leaflet: https://www.skinhealthinfo.org.uk/condition/rosacea/ . If you experience gritty, painful, or red eyes, please let us know. Best wishes, [Dr Name]',
    pilTitle: 'BAD: Rosacea Patient Information Leaflet',
    pilUrl: 'https://www.skinhealthinfo.org.uk/condition/rosacea/',
    tags: ['rosacea', 'flushing', 'soolantra', 'metronidazole', 'sunscreen', 'bad'],
    safetyNetting: 'Ocular rosacea (eye pain, redness, photophobia, foreign body sensation).',
    suggestedConsultationNote:
      'Accurx SMS sent: Rosacea skin care and trigger avoidance advice sent with official British Association of Dermatologists (BAD) leaflet. SPF protection and ocular rosacea red flags explained.',
  },
  {
    id: 'derm-actinic-keratosis-bad',
    title: 'Actinic Keratosis (Sun Damage) & Topicals (BAD Leaflet)',
    category: 'Dermatology',
    authority: 'BAD',
    smsTemplate:
      'Dear [Patient], actinic keratoses are rough, scaly patches on sun-exposed skin caused by cumulative UV damage over many years. Apply your prescribed topical cream (e.g. Efudix / fluorouracil) exactly as directed. It is expected that the skin will become very red, sore, and crusty during treatment as sun-damaged cells are removed. Use high-factor SPF 50 sunscreen daily and wear a wide-brimmed hat. Official British Association of Dermatologists (BAD) guide: https://www.skinhealthinfo.org.uk/condition/actinic-keratoses/ . Contact us if any lesion becomes rapidly growing, painful, or bleeds spontaneously. Best wishes, [Dr Name]',
    pilTitle: 'BAD: Actinic Keratoses Patient Information Leaflet',
    pilUrl: 'https://www.skinhealthinfo.org.uk/condition/actinic-keratoses/',
    tags: ['actinic keratosis', 'solar keratosis', 'efudix', 'sun damage', 'skin cancer prevention', 'bad'],
    safetyNetting: 'Malignant transformation to squamous cell carcinoma: rapid growth, pain, ulceration, bleeding.',
    suggestedConsultationNote:
      'Accurx SMS sent: Actinic keratosis management plan and expected inflammatory response to topical therapy explained with official British Association of Dermatologists (BAD) leaflet.',
  },
  {
    id: 'derm-bcc-bad',
    title: 'Basal Cell Carcinoma (BCC) Diagnosis & Referral (BAD)',
    category: 'Dermatology',
    authority: 'BAD',
    smsTemplate:
      'Dear [Patient], following our examination of your skin lesion, we suspect a Basal Cell Carcinoma (BCC). Please be reassured: BCC is the most common form of skin cancer, grows very slowly over months to years, and almost never spreads to other parts of the body. We have referred you to the Dermatology team for removal or biopsy. Read the official British Association of Dermatologists (BAD) BCC guide: https://www.skinhealthinfo.org.uk/condition/basal-cell-carcinoma/ . Protect your skin from sun exposure in the meantime. Best wishes, [Dr Name]',
    pilTitle: 'BAD: Basal Cell Carcinoma (BCC) Leaflet',
    pilUrl: 'https://www.skinhealthinfo.org.uk/condition/basal-cell-carcinoma/',
    tags: ['bcc', 'basal cell carcinoma', 'skin cancer', 'rodent ulcer', 'dermatology referral', 'bad'],
    safetyNetting: 'Rapid enlargement, pain, significant bleeding, changes in adjacent skin.',
    suggestedConsultationNote:
      'Accurx SMS sent: Reassured patient regarding benign prognosis and lack of metastatic potential of Basal Cell Carcinoma. Sent official British Association of Dermatologists (BAD) leaflet and referral info.',
  },
  {
    id: 'derm-melanoma-warning-bad',
    title: '2WW Urgent Skin Referral (ABCDE & Melanoma) (BAD)',
    category: 'Dermatology',
    authority: 'BAD',
    smsTemplate:
      'Dear [Patient], we have referred you for an urgent 2-Week Wait (2WW) appointment with a hospital skin specialist to carefully examine your mole/skin lesion. Most people seen at these clinics do NOT have skin cancer, but prompt review is essential for peace of mind. Please ensure you attend this appointment. Read the official British Association of Dermatologists (BAD) guide on moles and melanoma: https://www.skinhealthinfo.org.uk/condition/melanoma/ . If you have not heard from the hospital within 7 days, please contact the surgery. Best wishes, [Dr Name]',
    pilTitle: 'BAD: Melanoma & Moles Patient Information Leaflet',
    pilUrl: 'https://www.skinhealthinfo.org.uk/condition/melanoma/',
    tags: ['melanoma', 'mole', '2ww', 'skin cancer', 'abcde', 'urgent referral', 'bad'],
    safetyNetting: 'Patient instructed to contact GP surgery if hospital appointment not received within 7 days.',
    suggestedConsultationNote:
      'Accurx SMS sent: 2WW urgent dermatology cancer pathway referral explained. Reassured that majority are benign. Official British Association of Dermatologists (BAD) leaflet link provided.',
  },

  // ==========================================
  // 3. WOMEN & GYNAECOLOGY (RCOG - Royal College of Obstetricians & Gynaecologists)
  // ==========================================
  {
    id: 'wp-endometriosis-rcog',
    title: 'Endometriosis Symptoms & Management (RCOG Leaflet)',
    category: 'Women & Paediatrics',
    authority: 'RCOG',
    smsTemplate:
      'Dear [Patient], as discussed regarding your pelvic pain and period symptoms, here is the official Royal College of Obstetricians and Gynaecologists (RCOG) patient information leaflet on Endometriosis: https://www.rcog.org.uk/for-the-public/browse-our-patient-information/endometriosis/ . It explains what endometriosis is, diagnostic pathways (ultrasound & laparoscopy), and medical options like hormonal therapies (COCP, progestogens, Mirena coil) and pain relief. Please let us know if your symptoms worsen or if you would like to discuss a specialist gynaecology referral. Best wishes, [Dr Name]',
    pilTitle: 'RCOG: Endometriosis Patient Information Leaflet',
    pilUrl: 'https://www.rcog.org.uk/for-the-public/browse-our-patient-information/endometriosis/',
    tags: ['endometriosis', 'pelvic pain', 'dysmenorrhoea', 'gynaecology', 'rcog', 'mirena', 'periods'],
    safetyNetting: 'Acute severe pelvic pain, high fever, peritonism, suspected ovarian cyst torsion or PID.',
    suggestedConsultationNote:
      'Accurx SMS sent: Discussed suspected endometriosis and treatment options. Sent official Royal College of Obstetricians and Gynaecologists (RCOG) patient leaflet link. Advised on analgesia and hormonal therapy options.',
  },
  {
    id: 'wp-pcos-rcog',
    title: 'Polycystic Ovary Syndrome (PCOS) & Health (RCOG Leaflet)',
    category: 'Women & Paediatrics',
    authority: 'RCOG',
    smsTemplate:
      'Dear [Patient], following our consultation regarding Polycystic Ovary Syndrome (PCOS), here is the official Royal College of Obstetricians and Gynaecologists (RCOG) patient information leaflet: https://www.rcog.org.uk/for-the-public/browse-our-patient-information/polycystic-ovary-syndrome-pcos-what-it-means-for-your-long-term-health/ . It explains how hormone imbalances cause irregular periods and skin/hair changes, and how maintaining a healthy lifestyle and normal weight protects against long-term risks like diabetes. Please contact us if you wish to discuss fertility or period regulation. Best wishes, [Dr Name]',
    pilTitle: 'RCOG: PCOS - What It Means For Your Long-Term Health',
    pilUrl:
      'https://www.rcog.org.uk/for-the-public/browse-our-patient-information/polycystic-ovary-syndrome-pcos-what-it-means-for-your-long-term-health/',
    tags: ['pcos', 'polycystic ovary', 'irregular periods', 'hirsutism', 'fertility', 'rcog', 'metabolic'],
    safetyNetting: 'Prolonged amenorrhoea >3-4 months without withdrawal bleed (endometrial protection advice).',
    suggestedConsultationNote:
      'Accurx SMS sent: PCOS diagnosis, lifestyle management, and period regulation discussed. Official Royal College of Obstetricians and Gynaecologists (RCOG) patient leaflet link provided.',
  },
  {
    id: 'wp-hrt-menopause-rcog',
    title: 'Menopause Symptoms & HRT Choices (RCOG Leaflet)',
    category: 'Women & Paediatrics',
    authority: 'RCOG',
    smsTemplate:
      'Dear [Patient], Hormone Replacement Therapy (HRT) can significantly improve menopausal symptoms like hot flushes, night sweats, brain fog, and sleep disturbance. Light spotting or breakthrough bleeding is common in the first 3 to 6 months while your body adjusts to the hormones. Read the official Royal College of Obstetricians and Gynaecologists (RCOG) guide on treatments for menopause: https://www.rcog.org.uk/for-the-public/browse-our-patient-information/treatment-for-symptoms-of-the-menopause/ . We will review your progress in 3 months. If bleeding becomes very heavy or continues past 6 months, please let us know. Best wishes, [Dr Name]',
    pilTitle: 'RCOG: Treatment for Symptoms of the Menopause',
    pilUrl: 'https://www.rcog.org.uk/for-the-public/browse-our-patient-information/treatment-for-symptoms-of-the-menopause/',
    tags: ['hrt', 'menopause', 'perimenopause', 'hot flushes', 'estrogen', 'rcog', 'bleeding'],
    safetyNetting: 'Persistent unscheduled bleeding >6 months, postmenopausal bleeding, breast lump, DVT signs.',
    suggestedConsultationNote:
      'Accurx SMS sent: HRT initiation and side-effect expectations discussed with official Royal College of Obstetricians and Gynaecologists (RCOG) guide. Reassured on early breakthrough bleeding.',
  },
  {
    id: 'wp-early-miscarriage-rcog',
    title: 'Early Miscarriage Support & Guidance (RCOG Leaflet)',
    category: 'Women & Paediatrics',
    authority: 'RCOG',
    smsTemplate:
      'Dear [Patient], we are deeply sorry for your loss. Coping with an early miscarriage is physically and emotionally challenging. Please read the official Royal College of Obstetricians and Gynaecologists (RCOG) patient guide for compassionate information on what to expect, recovery, and emotional support: https://www.rcog.org.uk/for-the-public/browse-our-patient-information/early-miscarriage/ . Support is also available through the Miscarriage Association (01924 200799). RED FLAGS: If you develop severe pain, heavy bleeding soaking >2 pads/hour, high fever, or smelly vaginal discharge, seek urgent medical help immediately. Best wishes, [Dr Name]',
    pilTitle: 'RCOG: Early Miscarriage Patient Information Leaflet',
    pilUrl: 'https://www.rcog.org.uk/for-the-public/browse-our-patient-information/early-miscarriage/',
    tags: ['miscarriage', 'early pregnancy', 'bleeding', 'epau', 'gynaecology', 'rcog', 'bereavement'],
    safetyNetting: 'Haemorrhage (>2 pads/h), severe unremitting pain, sepsis signs (fever, purulent discharge).',
    suggestedConsultationNote:
      'Accurx SMS sent: Compassionate early miscarriage advice sent with official Royal College of Obstetricians and Gynaecologists (RCOG) leaflet and Miscarriage Association details. Haemorrhage and sepsis red flags documented.',
  },
  {
    id: 'wp-hysteroscopy-rcog',
    title: 'Outpatient Hysteroscopy (Abnormal Bleeding) (RCOG)',
    category: 'Women & Paediatrics',
    authority: 'RCOG',
    smsTemplate:
      'Dear [Patient], we have referred you for an outpatient hysteroscopy to gently examine the inside of your womb (uterus) and check the lining for the cause of your bleeding or polyps. Take simple painkillers like paracetamol or ibuprofen 1 hour before your appointment for comfort. Read the official Royal College of Obstetricians and Gynaecologists (RCOG) guide: https://www.rcog.org.uk/for-the-public/browse-our-patient-information/outpatient-hysteroscopy/ . You can bring a friend or relative for support. Best wishes, [Dr Name]',
    pilTitle: 'RCOG: Outpatient Hysteroscopy Patient Leaflet',
    pilUrl: 'https://www.rcog.org.uk/for-the-public/browse-our-patient-information/outpatient-hysteroscopy/',
    tags: ['hysteroscopy', 'bleeding', 'polyps', 'biopsy', 'rcog', 'gynaecology', 'clinic'],
    safetyNetting: 'Post-procedure: severe abdominal pain, persistent heavy bleeding, offensive discharge, fever.',
    suggestedConsultationNote:
      'Accurx SMS sent: Outpatient hysteroscopy referral information provided with official Royal College of Obstetricians and Gynaecologists (RCOG) leaflet. Pre-procedure analgesia advised.',
  },
  {
    id: 'wp-prolapse-rcog',
    title: 'Pelvic Organ Prolapse & Pelvic Floor Exercises (RCOG)',
    category: 'Women & Paediatrics',
    authority: 'RCOG',
    smsTemplate:
      'Dear [Patient], for your pelvic organ prolapse, conservative management is very effective: 1) Practice regular daily pelvic floor muscle exercises (Kegels). 2) Avoid heavy lifting and treat constipation promptly to prevent straining. 3) Maintain a healthy weight. Read the official Royal College of Obstetricians and Gynaecologists (RCOG) prolapse guide: https://www.rcog.org.uk/for-the-public/browse-our-patient-information/pelvic-organ-prolapse/ . We can also discuss a supportive vaginal ring pessary if you would like symptom relief without surgery. Best wishes, [Dr Name]',
    pilTitle: 'RCOG: Pelvic Organ Prolapse Patient Leaflet',
    pilUrl: 'https://www.rcog.org.uk/for-the-public/browse-our-patient-information/pelvic-organ-prolapse/',
    tags: ['prolapse', 'pelvic floor', 'kegel', 'pessary', 'gynaecology', 'rcog', 'cystocele'],
    safetyNetting: 'Urinary retention (inability to pass urine), severe ulceration/bleeding of prolapsed tissue.',
    suggestedConsultationNote:
      'Accurx SMS sent: Pelvic organ prolapse conservative advice and pelvic floor exercises sent with official Royal College of Obstetricians and Gynaecologists (RCOG) leaflet. Pessary options discussed.',
  },
  {
    id: 'wp-hmb-nice-rcog',
    title: 'Heavy Menstrual Bleeding (Tranexamic Acid / Mirena)',
    category: 'Women & Paediatrics',
    authority: 'RCOG',
    smsTemplate:
      'Dear [Patient], for your heavy menstrual bleeding, we have discussed medical options: Tranexamic acid (taken during heavy bleeding days only) or the Mirena intrauterine coil (which reduces bleeding by up to 90%). Read verified guidance developed by NICE and the Royal College of Obstetricians and Gynaecologists (RCOG): https://www.nice.org.uk/guidance/ng88/informationforpublic . Please contact us if you feel faint, unusually breathless, or pass clots larger than a 50p coin. Best wishes, [Dr Name]',
    pilTitle: 'RCOG / NICE: Heavy Menstrual Bleeding Guidance',
    pilUrl: 'https://www.nice.org.uk/guidance/ng88/informationforpublic',
    tags: ['heavy periods', 'menorrhagia', 'tranexamic acid', 'mirena', 'iron deficiency', 'rcog', 'ng88'],
    safetyNetting: 'Severe haemorrhage, postural syncope, severe anaemia symptoms (angina, dyspnoea).',
    suggestedConsultationNote:
      'Accurx SMS sent: Heavy menstrual bleeding treatment pathway and RCOG/NICE public guidance link sent. Advised on tranexamic acid dosing and Mirena coil benefits.',
  },

  // ==========================================
  // 4. MUSCULOSKELETAL & RHEUMATOLOGY (Versus Arthritis)
  // ==========================================
  {
    id: 'msk-osteoarthritis-va',
    title: 'Osteoarthritis: "Motion is Lotion" & Exercise (Versus Arthritis)',
    category: 'Musculoskeletal',
    authority: 'Versus Arthritis',
    smsTemplate:
      'Dear [Patient], for osteoarthritis, staying active is the best medicine: cartilage is living tissue and walking/cycling helps pump essential nutrients into the joint ("motion is lotion"). Take paracetamol or topical NSAID gel (e.g. Voltarol) for pain, and try low-impact strengthening exercises. Read the official Versus Arthritis guide: https://www.arthritis-uk.org/information-and-support/understanding-arthritis/conditions/osteoarthritis/ . Avoid complete rest, as weak muscles increase stress on the joint. Best wishes, [Dr Name]',
    pilTitle: 'Versus Arthritis: Osteoarthritis Patient Guide',
    pilUrl: 'https://www.arthritis-uk.org/information-and-support/understanding-arthritis/conditions/osteoarthritis/',
    tags: ['osteoarthritis', 'knee pain', 'hip pain', 'wear and tear', 'versus arthritis', 'exercise', 'joint'],
    safetyNetting: 'Hot, red, acutely swollen joint (suspected septic arthritis), sudden inability to weight-bear.',
    suggestedConsultationNote:
      'Accurx SMS sent: Osteoarthritis exercise and joint preservation advice sent with official Versus Arthritis guide. Demystified "wear and tear" and septic arthritis red flags safety netted.',
  },
  {
    id: 'msk-gout-allopurinol-va',
    title: 'Gout & Allopurinol: "Melting the Snowdrift" (Versus Arthritis)',
    category: 'Musculoskeletal',
    authority: 'Versus Arthritis',
    smsTemplate:
      'Dear [Patient], for your gout: 1) For active flare pain, take your prescribed anti-inflammatory (e.g. Colchicine or Naproxen). 2) Allopurinol is our long-term preventative medication—it acts like "central heating", gradually melting the crystal pool in your joints over months so attacks stop completely. Read the official Versus Arthritis guide on gout: https://www.arthritis-uk.org/information-and-support/understanding-arthritis/conditions/gout/ . Stay well hydrated and reduce high-purine foods (alcohol, red meat, seafood). Best wishes, [Dr Name]',
    pilTitle: 'Versus Arthritis: Gout & Treatment Leaflet',
    pilUrl: 'https://www.arthritis-uk.org/information-and-support/understanding-arthritis/conditions/gout/',
    tags: ['gout', 'allopurinol', 'colchicine', 'uric acid', 'urate', 'versus arthritis', 'joint pain'],
    safetyNetting: 'Septic arthritis red flags: systemic fever, rigors, erythema spreading beyond the joint.',
    suggestedConsultationNote:
      'Accurx SMS sent: Gout flare vs long-term urate lowering therapy (Allopurinol) explained with official Versus Arthritis guide. Addressed why Allopurinol is lifelong prevention rather than acute painkiller.',
  },
  {
    id: 'msk-back-pain-cauda-equina',
    title: 'Acute Low Back Pain & Cauda Equina Red Flags',
    category: 'Musculoskeletal',
    authority: 'Versus Arthritis',
    smsTemplate:
      'Dear [Patient], for acute low back pain, the most effective treatment is staying gently active and avoiding bed rest. Take paracetamol or ibuprofen regularly for comfort and apply a warm heat pack. Read the Versus Arthritis back pain guide: https://www.arthritis-uk.org/information-and-support/understanding-arthritis/conditions/back-pain/ . RED FLAGS: Go to A&E immediately or call 999 if you develop numbness around your genitals/buttocks, loss of bladder control, inability to pass urine, loss of bowel control, or severe weakness in both legs (Cauda Equina warning signs). Best wishes, [Dr Name]',
    pilTitle: 'Versus Arthritis: Back Pain & Sciatica Guide',
    pilUrl: 'https://www.arthritis-uk.org/information-and-support/understanding-arthritis/conditions/back-pain/',
    tags: ['back pain', 'sciatica', 'lumbar', 'cauda equina', 'spine', 'physio', 'versus arthritis'],
    safetyNetting: 'Cauda Equina Syndrome: saddle anaesthesia, bowel/bladder incontinence, bilateral motor deficit.',
    suggestedConsultationNote:
      'Accurx SMS sent: Low back pain self-management and mobility exercises sent with Versus Arthritis link. Cauda Equina syndrome emergency red flags explicitly safety netted.',
  },
  {
    id: 'msk-plantar-fasciitis',
    title: 'Plantar Fasciitis (Heel Pain) Exercises & Footwear',
    category: 'Musculoskeletal',
    authority: 'NHS',
    smsTemplate:
      'Dear [Patient], plantar fasciitis causes sharp heel pain that is worst with first steps in the morning. Key steps for recovery: 1) Gentle calf and plantar fascia stretches before stepping out of bed. 2) Roll the arch of your foot over a cold water bottle for 5 mins twice daily. 3) Wear supportive, cushioned footwear with a slight heel (avoid walking barefoot or in flat slip-on shoes). 4) Use cushioned heel cups. Read NHS advice: https://www.nhs.uk/conditions/plantar-fasciitis/ . It can take several months to fully settle. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Plantar Fasciitis Management',
    pilUrl: 'https://www.nhs.uk/conditions/plantar-fasciitis/',
    tags: ['heel pain', 'plantar fasciitis', 'foot', 'stretches', 'exercises', 'msk'],
    safetyNetting: 'Inability to weight-bear, suspicion of calcaneal stress fracture, neuropathic pain.',
    suggestedConsultationNote:
      'Accurx SMS sent: Plantar fasciitis stretches, footwear advice, and ice massage instructions sent with NHS PIL link.',
  },

  // ==========================================
  // 5. CARDIOVASCULAR & METABOLIC
  // ==========================================
  {
    id: 'cv-home-bp-monitoring',
    title: 'Home Blood Pressure Monitoring (HBPM) Protocol',
    category: 'Cardiovascular & Metabolic',
    authority: 'NHS',
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
    authority: 'NHS',
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
    authority: 'NHS',
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
    authority: 'NHS',
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
  // 6. MENTAL HEALTH
  // ==========================================
  {
    id: 'mh-iapt-self-referral',
    title: 'Anxiety / Depression: NHS Talking Therapies (IAPT)',
    category: 'Mental Health',
    authority: 'NHS',
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
    authority: 'NHS',
    smsTemplate:
      'Dear [Patient], you have been prescribed Sertraline for your mood/anxiety. Take one tablet each morning with food. Please note: antidepressants typically take 2 to 4 weeks before you notice significant benefit. You might experience mild nausea, headache, or slight initial increase in anxiety during the first 1-2 weeks; this usually settles. Do not stop taking your medication suddenly. NHS guide: https://www.nhs.uk/medicines/sertraline/ . If you experience distressing thoughts, please contact the surgery, ring 111, or call Samaritans on 116 123. Best wishes, [Dr Name]',
    pilTitle: 'NHS: Sertraline Patient Information',
    pilUrl: 'https://www.nhs.uk/medicines/sertraline/',
    tags: ['sertraline', 'citalopram', 'ssri', 'antidepressant', 'anxiety', 'depression'],
    safetyNetting: 'Paradoxical anxiety in week 1, suicidal ideation, serotonin syndrome, abrupt cessation.',
    suggestedConsultationNote:
      'Accurx SMS sent: Sertraline initiation leaflet sent. Realistic 2-4 week onset of action and transient early side effects explained. Crisis lines and GP review in 2-4 weeks booked.',
  },

  // ==========================================
  // 7. GASTROINTESTINAL
  // ==========================================
  {
    id: 'gi-gastroenteritis-norovirus',
    title: 'Gastroenteritis (D&V) & 48h Isolation Rule',
    category: 'Gastrointestinal',
    authority: 'NHS',
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
    authority: 'NHS',
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
    authority: 'NHS',
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
  // 8. ADMIN & RESULTS
  // ==========================================
  {
    id: 'admin-bloods-normal',
    title: 'Blood Test Results Normal & Reassuring',
    category: 'Admin & Results',
    authority: 'NHS',
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
    id: 'admin-hospital-referral-ers',
    title: 'Hospital Routine Outpatient Referral Issued (e-RS)',
    category: 'Admin & Results',
    authority: 'NHS',
    smsTemplate:
      'Dear [Patient], your routine hospital outpatient referral for [Specialty] has been processed through the NHS e-Referral Service (e-RS). You will receive booking instructions and your reference number by post or SMS from the hospital booking team. You can manage and track your referral online via the NHS App: https://www.nhs.uk/nhs-app/ . Please contact the hospital outpatient booking office if you have not received appointment details within 4 to 6 weeks. Best wishes, [Surgery Name]',
    pilTitle: 'NHS: e-Referral Service Guide',
    pilUrl: 'https://www.nhs.uk/nhs-services/hospitals/referrals-for-specialist-care/',
    tags: ['referral', 'hospital', 'ers', 'outpatient', 'booking', 'admin'],
    safetyNetting: 'Patient instructed on escalation if symptoms red flag or appointment delayed >6 weeks.',
    suggestedConsultationNote:
      'Accurx SMS sent: Routine e-Referral confirmed. Tracking via NHS App explained with hospital booking contact timeframe.',
  },
];
