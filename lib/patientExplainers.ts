export interface PatientExplainerTopic {
  id: string;
  title: string;
  category: 'ENT' | 'Musculoskeletal' | 'Rheumatology' | 'Dermatology' | 'Respiratory' | 'Infection' | 'Cardiology';
  icon: string;
  subtitle: string;
  analogy: {
    title: string;
    tagline: string;
    description: string;
    emoji: string;
  };
  diagramType:
    | 'eustachian_tube'
    | 'lumbar_radiculopathy'
    | 'osteo_vs_rheumatoid'
    | 'gout_crystals'
    | 'eczema_barrier'
    | 'asthma_airway'
    | 'viral_vs_bacterial'
    | 'hypertension_vessel';
  anatomyCallouts: {
    part: string;
    normal: string;
    pathology: string;
  }[];
  whyIntuitiveTreatmentFails: {
    treatment: string;
    misconception: string;
    medicalReality: string;
  };
  homeActionPlan: {
    title: string;
    detail: string;
    icon: string;
  }[];
  safetyNetting: string[];
  smsSummary: string;
  pilTitle: string;
  pilUrl: string;
  consultationNoteSnippet: string;
}

export const PATIENT_EXPLAINER_TOPICS: PatientExplainerTopic[] = [
  {
    id: 'eustachian_glue_ear',
    title: 'Eustachian Tube Dysfunction & Glue Ear',
    category: 'ENT',
    icon: '👂',
    subtitle: 'Explaining why antibiotics cannot drain fluid trapped behind the eardrum',
    analogy: {
      title: 'The Blocked Straw / Pipette Effect',
      tagline: 'Water trapped in a drinking straw when your finger covers the top',
      description:
        'Think of your middle ear as a sealed room with one ventilation pipe (the Eustachian tube) leading to the back of your throat. If this pipe gets blocked or swollen from a cold or allergies, air cannot get in. A gentle vacuum forms that pulls clear fluid out of the tissues. Like holding a straw full of water with your finger on top, the fluid is trapped by suction behind a completely closed eardrum—not by active bacteria!',
      emoji: '🥤',
    },
    diagramType: 'eustachian_tube',
    anatomyCallouts: [
      {
        part: 'Ear Canal (Outer Ear)',
        normal: 'Open to the outside air, clear passage.',
        pathology: 'Normal and dry; drops placed here cannot cross an intact eardrum.',
      },
      {
        part: 'Eardrum (Tympanic Membrane)',
        normal: 'Thin, pearl-grey translucent drum that vibrates with sound waves.',
        pathology: 'Intact but dull or retracted inward, amber fluid level or air bubbles visible behind it.',
      },
      {
        part: 'Middle Ear Cavity',
        normal: 'Air-filled cavity where three tiny hearing bones (ossicles) vibrate freely.',
        pathology: 'Filled with thick, sterile mucus/fluid ("glue ear") that dampens bone vibration like listening underwater.',
      },
      {
        part: 'Eustachian Tube Ventilation Pipe',
        normal: 'Opens every time you swallow or yawn to equalize pressure.',
        pathology: 'Swollen shut or congested, preventing air from entering and fluid from draining down to the throat.',
      },
    ],
    whyIntuitiveTreatmentFails: {
      treatment: 'Oral or Topical Antibiotics',
      misconception: '"My ear feels full and muffled, so there must be an infection that needs an antibiotic."',
      medicalReality:
        'Antibiotics kill living bacteria. Glue ear is sterile fluid trapped by negative pressure and physical suction—there are no bacteria for antibiotics to kill. Taking antibiotics will not clear the fluid and can cause diarrhea, thrush, and antibiotic resistance.',
    },
    homeActionPlan: [
      {
        title: 'Equalise the Pressure (Otovent Balloon / Valsalva)',
        detail: 'Gently inflating a specialised nasal balloon (Otovent) or pinching your nose and swallowing forces air up the ventilation tube to break the vacuum.',
        icon: '🎈',
      },
      {
        title: 'Active Chewing & Yawning',
        detail: 'Chewing gum or swallowing frequently activates the tiny palate muscles that pull the Eustachian tube open.',
        icon: '🫧',
      },
      {
        title: 'Give it Time (Watchful Waiting)',
        detail: 'Over 80% of middle ear effusions resolve completely on their own within 10 to 12 weeks as the swelling settles.',
        icon: '⏳',
      },
    ],
    safetyNetting: [
      'Severe or worsening ear pain, fever, or swelling/redness behind the ear.',
      'Discharge (pus or blood) coming out of the ear canal.',
      'Hearing loss persisting beyond 3 months (triggers ENT referral for grommets / hearing assessment).',
    ],
    smsSummary:
      'Hi [Patient], here is the guide on Glue Ear / Eustachian Tube Dysfunction we discussed. The fluid behind your eardrum is trapped by suction (like water in a straw), which is why antibiotics will not drain it. Chewing gum and Otovent balloon inflation help open the tube. Verified NHS info: https://www.nhs.uk/conditions/glue-ear/ - Dr Laksha',
    pilTitle: 'NHS Overview: Glue Ear & Middle Ear Effusion',
    pilUrl: 'https://www.nhs.uk/conditions/glue-ear/',
    consultationNoteSnippet:
      'Turned screen to patient; demonstrated Eustachian tube anatomy and middle ear vacuum mechanism using interactive visual explainer. Explained non-bacterial nature of fluid effusion and rationale against antibiotic prescription. Advised autoinflation techniques and 3-month watchful waiting with red flag safety netting.',
  },
  {
    id: 'sciatica_radiculopathy',
    title: 'Lumbar Radiculopathy (Sciatica) vs Mechanical Back Pain',
    category: 'Musculoskeletal',
    icon: '⚡',
    subtitle: 'Showing disc bulge compressing the L5/S1 nerve root & why bed rest is harmful',
    analogy: {
      title: 'The Pinched Telephone Wire & The Hydrated Sponge',
      tagline: 'The problem is in the lower back, but the signal alarm goes off in the foot',
      description:
        'Your spinal disc is like a jelly doughnut between two bones. If the jelly bulges slightly, it can touch and chemically irritate the thick nerve root running down your leg. Like pinching a telephone wire, the message gets scrambled at the hip, calf, or toes even though the wire is pinched in your lower spine! Furthermore, your discs are like wet sponges: they have no direct blood vessels and ONLY get healing nutrients when you move and walk ("pumping action"). Bed rest dries out the disc and stiffens the nerve.',
      emoji: '🍩',
    },
    diagramType: 'lumbar_radiculopathy',
    anatomyCallouts: [
      {
        part: 'Intervertebral Disc (L4/L5 & L5/S1)',
        normal: 'Flexible shock-absorbing pad with tough outer ring (annulus) and soft gel center (nucleus).',
        pathology: 'Gel pushes through a minor tear (herniation), releasing inflammatory chemicals.',
      },
      {
        part: 'Exiting Spinal Nerve Root',
        normal: 'Smooth nerve trunk exiting freely through the spinal foraminal opening.',
        pathology: 'Compressed or inflamed by the adjacent disc bulge, firing shooting electric pain down the sciatic nerve.',
      },
      {
        part: 'Sciatic Nerve Track (Buttock to Foot)',
        normal: 'Transmits sensation and muscle commands cleanly without interference.',
        pathology: 'Feels sharp, burning, or pins-and-needles down the back of the thigh, calf, and sole of the foot.',
      },
      {
        part: 'Surrounding Paraspinal Muscles',
        normal: 'Relaxed and coordinated core support.',
        pathology: 'Go into protective reflex spasm, creating additional mechanical ache.',
      },
    ],
    whyIntuitiveTreatmentFails: {
      treatment: 'Strict Bed Rest',
      misconception: '"My back and leg hurt so severely when I move, so lying flat in bed for a week will heal it faster."',
      medicalReality:
        'Strict bed rest weakens stabilizing core muscles, increases disc stiffness, delays nerve desensitisation, and increases the risk of blood clots. Clinical trials consistently show that staying gently active leads to significantly faster recovery and less chronic pain.',
    },
    homeActionPlan: [
      {
        title: 'Stay Gently Mobile (Little and Often)',
        detail: 'Take short 5-to-10 minute walks on flat ground every few hours. Gentle walking pumps oxygen and nutrients into the disc space.',
        icon: '🚶',
      },
      {
        title: 'Strategic Analgesia for Function',
        detail: 'Take regular paracetamol or short-course anti-inflammatories (if kidney/stomach safe) not to numb all pain, but to allow gentle movement.',
        icon: '💊',
      },
      {
        title: 'Ice or Heat Therapy',
        detail: 'Apply an ice pack wrapped in a tea towel to the lower back for 15 minutes to reduce acute nerve root inflammation, or heat for muscular spasm.',
        icon: '🧊',
      },
    ],
    safetyNetting: [
      '🚨 EMERGENCY RED FLAGS (Go to A&E immediately):',
      'Numbness or altered sensation around your groin, genitals, or anus (the "saddle" area when you wipe).',
      'Loss of bowel control or bladder retention (unable to pass urine, or leaking without feeling it).',
      'Progressive weakness in both legs, or stumbling / "foot drop" (unable to walk on your heels).',
    ],
    smsSummary:
      'Hi [Patient], here is the visual recovery guide on Sciatica and lower back pain we went through. Remember: gentle movement acts like a pump for your spinal discs, while strict bed rest delays recovery. Cauda Equina Warning: Go to A&E immediately if you notice numbness in your groin/saddle area, loss of bowel/bladder control, or progressive leg weakness. NHS Leaflet: https://www.nhs.uk/conditions/sciatica/ - Dr Laksha',
    pilTitle: 'NHS Overview: Sciatica Causes and Recovery',
    pilUrl: 'https://www.nhs.uk/conditions/sciatica/',
    consultationNoteSnippet:
      'Turned screen to patient; demonstrated L5/S1 disc herniation and sciatic nerve root path with visual explainer. Explained disc nutrition mechanism and emphasized staying gently active over bed rest. Fully safety-netted on Cauda Equina Syndrome red flags (saddle anesthesia, bowel/bladder incontinence) with written safety netting leaflet sent.',
  },
  {
    id: 'oa_vs_ra',
    title: 'Osteoarthritis vs Rheumatoid Arthritis',
    category: 'Rheumatology',
    icon: '🦴',
    subtitle: 'Demystifying "wear and tear": living cartilage, motion is lotion, vs autoimmune pannus',
    analogy: {
      title: 'Motion is Lotion & Living Cartilage',
      tagline: 'Your joint is not a car tire wearing out; it is a living tissue that repairs with movement',
      description:
        'People often hear "wear and tear" and imagine their joint is like a car tire with tread being ground away forever. That is completely untrue! Joint cartilage is a living, resilient tissue. When you walk and move, your joint squeezes out waste and absorbs synovial fluid like a self-lubricating sponge ("motion is lotion"). In Osteoarthritis, the joint is actively repairing, but bones can adapt with small protective spurs (osteophytes). In Rheumatoid Arthritis, the immune system mistakenly attacks the lining of the joint (the synovium), requiring targeted immune-calming medicines.',
      emoji: '⚙️',
    },
    diagramType: 'osteo_vs_rheumatoid',
    anatomyCallouts: [
      {
        part: 'Articular Cartilage',
        normal: 'Smooth, glossy shock-absorbing coating over the bone ends with low friction.',
        pathology: 'OA: Surface micro-fraying and thinning with healthy living repair attempts. RA: Destroyed by autoimmune enzymes.',
      },
      {
        part: 'Joint Capsule & Synovium',
        normal: 'Thin, delicate lubricating envelope producing clear synovial fluid.',
        pathology: 'OA: Mild intermittent irritation. RA: Highly swollen, fiery thick lining (pannus) packed with immune cells.',
      },
      {
        part: 'Subchondral Bone & Margins',
        normal: 'Smooth bone contours underneath the cartilage.',
        pathology: 'OA: Bone strengthens and forms small smooth spurs (osteophytes) to spread the load. RA: Bone erosions.',
      },
      {
        part: 'Morning Stiffness Duration',
        normal: 'Less than 5 minutes on waking.',
        pathology: 'OA: Brief morning stiffness (< 30 mins) that eases with movement. RA: Prolonged stiffness (> 60 mins), symmetrical small joints.',
      },
    ],
    whyIntuitiveTreatmentFails: {
      treatment: 'Resting the Joint to "Save Cartilage"',
      misconception: '"If my joint has wear and tear, using it will wear it down faster, so I should stop walking and exercise."',
      medicalReality:
        'Cartilage has no blood supply and completely starves without movement! Exercise stimulates joint fluid production, strengthens shock-absorbing muscles, and actually reduces joint pain by up to 40%. Stopping exercise leads to muscle wasting and increases pressure on the bone.',
    },
    homeActionPlan: [
      {
        title: 'Low-Impact Strengthening ("Motion is Lotion")',
        detail: 'Swimming, cycling, and targeted quadriceps/gluteal exercises build muscular shock-absorbers around the joint.',
        icon: '🚴',
      },
      {
        title: 'Lighten the Joint Load',
        detail: 'Losing just 1 kg of body weight takes up to 4 kg of physical force off your knees with every single step you take.',
        icon: '⚖️',
      },
      {
        title: 'First-Line Topical Relief',
        detail: 'Topical NSAID gel (e.g. Ibuprofen/Voltarol gel) applied directly over the joint gives effective local pain relief without stomach or kidney side effects.',
        icon: '🧴',
      },
    ],
    safetyNetting: [
      'A suddenly hot, intensely red, exquisitely swollen joint with fever (requires ruling out septic arthritis).',
      'Inability to bear any weight on the leg after minor trauma.',
      'Prolonged morning joint stiffness lasting hours with swollen knuckles in both hands (requires rheumatoid bloods / early arthritis referral).',
    ],
    smsSummary:
      'Hi [Patient], here is the visual explainer on Osteoarthritis we went through. Remember: cartilage relies on movement for its natural lubrication ("motion is lotion"), so gentle strengthening and daily walking protect the joint. Topical anti-inflammatory gel and muscle-building exercises are first-line. NHS Leaflet: https://www.nhs.uk/conditions/osteoarthritis/ - Dr Laksha',
    pilTitle: 'NHS Overview: Osteoarthritis Management & Exercise',
    pilUrl: 'https://www.nhs.uk/conditions/osteoarthritis/',
    consultationNoteSnippet:
      'Turned screen to patient; demonstrated joint anatomy comparing OA cartilage remodeling vs RA synovial inflammation. Addressed "wear and tear" anxiety; explained synovial fluid lubrication and the "motion is lotion" principle. Emphasized muscle strengthening, weight-bearing exercise, and topical NSAIDs. Red flags for septic arthritis provided.',
  },
  {
    id: 'gout_crystals',
    title: 'Gout & Urate Crystals: The "Sugar Bowl" Analogy',
    category: 'Rheumatology',
    icon: '💎',
    subtitle: 'Why Allopurinol dissolves the crystal pool over months rather than acting as a fast painkiller',
    analogy: {
      title: 'The Sugar Bowl in Cold Tea & The Melting Snowdrift',
      tagline: 'Colchicine puts out the fire today; Allopurinol turns on the central heating to melt the snowbank over months',
      description:
        'Imagine adding sugar to a cup of cold tea: at first it dissolves, but once the liquid is saturated, solid sugar crystals drop out and pile up at the bottom! That is uric acid forming microscopic needle-shaped crystals in your joints. During an acute attack, white blood cells attack the crystals like stepping on glass splinters, causing agony. Acute painkillers (NSAIDs/Colchicine) are like putting up an umbrella in the rain—they stop the storm, but the pile of crystals is still there! Allopurinol is the central heating that slowly dissolves the snowbank over 6 to 12 months. That is why Allopurinol must be taken every single day, not just during attacks!',
      emoji: '🏔️',
    },
    diagramType: 'gout_crystals',
    anatomyCallouts: [
      {
        part: 'Blood Uric Acid Level',
        normal: 'Below 360 µmol/L (or < 300 µmol/L in severe gout), fully dissolved in blood.',
        pathology: 'High saturation (> 380–420 µmol/L); crystals precipitate out of solution into cooler extremities (big toe, ankles, knees).',
      },
      {
        part: 'Joint Cavity & Cartilage',
        normal: 'Smooth surfaces bathed in clear fluid.',
        pathology: 'Coated with sharp needle-shaped monosodium urate crystals that trigger sudden immune attacks.',
      },
      {
        part: 'Acute Attack (Podagra)',
        normal: 'No inflammation.',
        pathology: 'White blood cells engulf crystals and burst, releasing powerful inflammatory cytokines causing redness, heat, and extreme tenderness.',
      },
      {
        part: 'Long-term Tophi Deposits',
        normal: 'No deposits in skin or tendons.',
        pathology: 'Chalky white nodules (tophi) formed in earlobes, fingers, or Achilles tendons from years of untreated crystal build-up.',
      },
    ],
    whyIntuitiveTreatmentFails: {
      treatment: 'Taking Allopurinol Only During an Attack, or Stopping it When Pain Stops',
      misconception: '"I will take Allopurinol when my toe hurts, and stop taking it once the pain goes away."',
      medicalReality:
        'Allopurinol has ZERO painkilling effect! It works by lowering the uric acid level so crystals can dissolve back into the blood. Starting or stopping it suddenly changes the crystal surface, which can actually trigger a flare. It must be taken continuously for life with flare-prevention coverage (like low-dose colchicine) during the first 6 months.',
    },
    homeActionPlan: [
      {
        title: 'Target Serum Urate < 360 µmol/L (or < 300)',
        detail: 'We will check a blood test every 4 weeks while gradually titrating Allopurinol until your uric acid drops into the "melting zone".',
        icon: '🎯',
      },
      {
        title: 'Flare Prevention Shield (Colchicine Cover)',
        detail: 'Take low-dose colchicine (500mcg once or twice daily) alongside Allopurinol for the first 3 to 6 months to prevent crystal-shift flares.',
        icon: '🛡️',
      },
      {
        title: 'Hydration & Dietary Balance',
        detail: 'Drink 2 liters of water daily to help kidneys flush uric acid. Limit high-purine foods (offal, seafood), sugary drinks, and beer/spirits.',
        icon: '💧',
      },
    ],
    safetyNetting: [
      'High fever, rigors (shaking chills), or a spreading red skin infection (cellulitis) around the joint.',
      'Severe skin rash, mouth ulcers, or peeling skin after starting Allopurinol (stop medicine immediately and contact GP/A&E).',
      'Joint pain that does not improve after 5 to 7 days of maximum acute treatment.',
    ],
    smsSummary:
      'Hi [Patient], here is the visual guide on Gout and Urate Crystals we discussed. Remember the Snowdrift analogy: Colchicine stops today’s flare, but Allopurinol is the central heating that slowly dissolves the crystals over 6-12 months. It must be taken continuously every day even when you have no pain. Target uric acid: < 360 µmol/L. NHS Leaflet: https://www.nhs.uk/conditions/gout/ - Dr Laksha',
    pilTitle: 'NHS Overview: Gout Treatment & Allopurinol Prevention',
    pilUrl: 'https://www.nhs.uk/conditions/gout/',
    consultationNoteSnippet:
      'Turned screen to patient; demonstrated monosodium urate crystal precipitation and dissolution using interactive visual explainer. Emphasized the "sugar bowl/snowdrift" analogy to clarify why Allopurinol is a crystal-lowering preventive therapy rather than an acute painkiller. Discussed treat-to-target urate (< 360 µmol/L) and flare prophylaxis with colchicine. Written safety netting provided.',
  },
  {
    id: 'eczema_skin_barrier',
    title: 'Eczema & The "Brick Wall" Skin Barrier',
    category: 'Dermatology',
    icon: '🧴',
    subtitle: 'Why topical steroids extinguish the fire and generous emollients rebuild the mortar',
    analogy: {
      title: 'The Leaky Brick Wall & The Campfire',
      tagline: 'Steroids put out the flames; moisturisers rebuild the cement between the bricks',
      description:
        'Think of healthy skin like a sturdy brick wall: your skin cells are the bricks, and natural oils/lipids are the mortar holding them tightly together. In eczema, the mortar is missing or broken. Moisture leaks out (causing dryness and cracking), and outside irritants, soaps, and allergens leak in. When irritants get in, an immune "campfire" lights up (itching, redness, scratching). Topical steroids are the water hose that extinguishes the flames. Emollients are the cement that rebuilds the mortar so the fire cannot reignite!',
      emoji: '🧱',
    },
    diagramType: 'eczema_barrier',
    anatomyCallouts: [
      {
        part: 'Stratum Corneum (Outer Skin Layer)',
        normal: 'Tightly sealed brick-and-mortar structure holding hydration in.',
        pathology: 'Gaps between cells due to filaggrin deficiency; water escapes rapidly (transepidermal water loss).',
      },
      {
        part: 'Lipid Mortar (Ceramides & Oils)',
        normal: 'Rich hydrophobic barrier blocking environmental antigens.',
        pathology: 'Depleted; soaps, fragrances, and house dust mites penetrate deep into the dermis.',
      },
      {
        part: 'Dermal Nerves & Immune Cells',
        normal: 'Calm, quiescent surveillance.',
        pathology: 'Hyper-activated; releases histamine and cytokines triggering the intense itch-scratch cycle.',
      },
    ],
    whyIntuitiveTreatmentFails: {
      treatment: 'Stopping Steroid Too Early or Applying Emollient Sparingly',
      misconception: '"Steroids thin the skin, so I should stop as soon as the redness fades after 2 days, and only use a small dab of cream."',
      medicalReality:
        'Short bursts of appropriate-strength topical steroid (1-2 weeks) completely extinguish deep inflammation without skin thinning. Stopping after 2 days leaves the underlying fire smouldering, causing rapid flares! Emollients must be smoothed on generously in the direction of hair growth, never rubbed in circles.',
    },
    homeActionPlan: [
      {
        title: 'Smooth On Generous Emollient (500g / week)',
        detail: 'Apply thick ointment or cream 2 to 3 times daily. Smooth downwards along the direction of hair growth; do not rub vigorously.',
        icon: '🧴',
      },
      {
        title: 'The 30-Minute Rule',
        detail: 'Apply your topical steroid first to the red/itchy patches. Wait 20 to 30 minutes for it to absorb before applying your all-over moisturiser.',
        icon: '⏱️',
      },
      {
        title: 'Soap Substitute Always',
        detail: 'Never use bar soap, bubble bath, or standard shower gels—they strip away the precious lipid mortar. Wash with an emollient wash.',
        icon: '🧼',
      },
    ],
    safetyNetting: [
      'Clusters of painful, punched-out blisters, cold sores, or crusted weeping lesions with fever (eczema herpeticum - emergency!).',
      'Spreading cellulitis (hot, rapidly expanding redness with chills).',
      'Eczema failing to improve after 2 weeks of prescribed topical treatment.',
    ],
    smsSummary:
      'Hi [Patient], here is the visual explainer on Eczema & the Brick Wall skin barrier we reviewed. Remember: steroid cream puts out the fire (use once daily for 1-2 weeks), and generous emollient rebuilds the mortar between skin cells. Smooth emollients downwards in the direction of hair growth. NHS Leaflet: https://www.nhs.uk/conditions/atopic-eczema/ - Dr Laksha',
    pilTitle: 'NHS Overview: Atopic Eczema Management & Emollients',
    pilUrl: 'https://www.nhs.uk/conditions/atopic-eczema/',
    consultationNoteSnippet:
      'Turned screen to patient; demonstrated skin barrier "brick wall" analogy using interactive visual explainer. Emphasized correct topical steroid application (Fingertip Units, completing prescribed course) and generous emollient maintenance (500g/week, downwards stroke). Safety-netted for eczema herpeticum and secondary infection.',
  },
  {
    id: 'asthma_airway',
    title: 'Asthma: Preventer vs Reliever (Fireproofing vs Fire Extinguisher)',
    category: 'Respiratory',
    icon: '🫁',
    subtitle: 'Understanding why the brown/orange inhaler must be taken every day when feeling well',
    analogy: {
      title: 'Fireproofing the House vs The Emergency Extinguisher',
      tagline: 'The blue inhaler opens tight muscles for 4 hours; the steroid inhaler cures the underlying swelling',
      description:
        'Your airway has two problems in asthma: 1) Muscular spasm (the muscle bands outside the breathing pipe clamp tight), and 2) Internal swelling and sticky mucus (the pipe lining gets inflamed). The blue inhaler (Salbutamol) is like a fire extinguisher: it instantly relaxes the tight muscle for 4 hours, but DOES NOTHING for the swelling. The brown/purple/orange preventer inhaler contains a micro-dose of steroid: it is like fireproofing the walls so a fire never starts in the first place! It must be used every single day to keep the swelling flat.',
      emoji: '🚒',
    },
    diagramType: 'asthma_airway',
    anatomyCallouts: [
      {
        part: 'Bronchial Smooth Muscle Bands',
        normal: 'Relaxed, open circular muscles around the airway.',
        pathology: 'Constricted and twitchy in bronchospasm (relieved temporarily by Salbutamol).',
      },
      {
        part: 'Airway Mucous Lining',
        normal: 'Thin, moist, wide-open lumen for easy airflow.',
        pathology: 'Swollen, red, and oedematous with thick mucus plugs (cured only by daily inhaled steroid).',
      },
    ],
    whyIntuitiveTreatmentFails: {
      treatment: 'Relying Solely on the Blue Reliever Inhaler',
      misconception: '"I only need my inhaler when I feel wheezy, so I just puff my blue inhaler whenever I get tight."',
      medicalReality:
        'Using 3 or more blue canisters a year increases the risk of severe, life-threatening asthma attacks! The blue inhaler masks the symptoms while airway inflammation quietly worsens. Daily preventer inhalers treat the true root cause.',
    },
    homeActionPlan: [
      {
        title: 'Daily Preventer Inhaler (Morning & Night)',
        detail: 'Take your prescribed preventer steroid inhaler every single day, even when your breathing feels 100% normal.',
        icon: '🌅',
      },
      {
        title: 'Always Use a Spacer Device',
        detail: 'Using a spacer increases the amount of medicine reaching deep into your lungs from 15% to over 50%, while preventing mouth thrush.',
        icon: '🌬️',
      },
      {
        title: 'Rinse and Spit',
        detail: 'Rinse your mouth with water or brush your teeth after using your steroid inhaler to prevent oral hoarseness or candidiasis.',
        icon: '🚰',
      },
    ],
    safetyNetting: [
      '🚨 RED FLAG ASTHMA ATTACK: Needing your blue inhaler more often than every 4 hours, too breathless to speak in full sentences, or chest/ribs pulling in.',
      'Take 1 puff of your blue inhaler via spacer every 30 to 60 seconds (up to 10 puffs). If not improving, dial 999 immediately.',
    ],
    smsSummary:
      'Hi [Patient], here is your Asthma visual action plan. Remember: your preventer inhaler acts like fireproofing (take it every day even when well), while your blue inhaler is your emergency fire extinguisher. Always use your spacer device. NHS Leaflet: https://www.nhs.uk/conditions/asthma/ - Dr Laksha',
    pilTitle: 'NHS Overview: Asthma Inhaler Technique & Action Plan',
    pilUrl: 'https://www.nhs.uk/conditions/asthma/',
    consultationNoteSnippet:
      'Turned screen to patient; demonstrated airway bronchospasm vs mucosal oedema using interactive visual explainer. Emphasized the "fireproofing vs fire extinguisher" analogy for preventer vs reliever adherence. Checked spacer technique and issued personalized Asthma Action Plan with 999 red flag thresholds.',
  },
  {
    id: 'viral_vs_bacterial',
    title: 'Viral vs Bacterial Illness: Why Antibiotics Won’t Cure a Cold or Flu',
    category: 'Infection',
    icon: '🦠',
    subtitle: 'Why antibiotics only target bacterial cell walls and cannot kill intracellular viruses',
    analogy: {
      title: 'Software Bugs vs Broken Screws',
      tagline: 'You cannot fix a software virus in your phone with a screwdriver',
      description:
        'Bacteria and viruses are completely different biological entities. Bacteria are independent living creatures with their own cell walls and machinery. Antibiotics work like molecular monkey wrenches that smash bacterial cell walls. Viruses, on the other hand, are microscopic strands of genetic code that hijack the inside of your own human cells. An antibiotic has zero effect on a virus—it is like trying to fix a software bug in your phone using a screwdriver! Your immune system produces bespoke antibodies that destroy the virus over 7 to 14 days.',
      emoji: '🛡️',
    },
    diagramType: 'viral_vs_bacterial',
    anatomyCallouts: [
      {
        part: 'Viral Infection (Cold, Flu, Bronchitis, Sinusitis)',
        normal: 'Healthy human respiratory epithelial cells.',
        pathology: 'Viruses enter inside host cells to replicate; cleared by T-cells and interferon over 1 to 3 weeks.',
      },
      {
        part: 'Bacterial Infection (e.g. Strep Throat, Lobar Pneumonia)',
        normal: 'Sterile or balanced flora.',
        pathology: 'Bacteria multiply in extracellular tissue with purulent exudate; susceptible to antibiotic wall disruption.',
      },
    ],
    whyIntuitiveTreatmentFails: {
      treatment: 'Demanding Antibiotics for Green Mucus or Cough',
      misconception: '"My phlegm is green and I have had a cough for 10 days, so it must have turned into a bacterial chest infection requiring amoxicillin."',
      medicalReality:
        'Green phlegm is caused by myeloperoxidase, a harmless green enzyme released by your own white blood cells as they successfully clear a viral cold! It is a sign of your immune system working, not a bacterial infection. The average viral cough lasts 18 to 21 days.',
    },
    homeActionPlan: [
      {
        title: 'Rest & Abundant Fluids',
        detail: 'Hydration thins respiratory secretions and helps kidneys clear viral breakdown products.',
        icon: '🍵',
      },
      {
        title: 'Targeted Symptom Relief',
        detail: 'Paracetamol or ibuprofen for fever and muscle aches; saline nasal sprays or honey and lemon for soothing coughs.',
        icon: '🍯',
      },
      {
        title: 'Allow the Natural Timeframe',
        detail: 'Viral colds peak at day 3-5 and take 10-14 days to clear. Viral bronchitis cough commonly lasts up to 3 weeks.',
        icon: '📅',
      },
    ],
    safetyNetting: [
      'Difficulty breathing, persistent rapid breathing, or coughing up significant fresh blood.',
      'A fever lasting longer than 5 continuous days, or a new fever appearing after you were already getting better.',
      'New chest pain that is sharp when you breathe in (pleuritic pain).',
    ],
    smsSummary:
      'Hi [Patient], here is the visual guide on Viral vs Bacterial infections we discussed. Green mucus is simply your white blood cells fighting a virus, not a sign of bacterial infection. Antibiotics cannot kill viruses and cause side effects. Rest, fluids, and paracetamol are key. The average viral cough lasts 2-3 weeks. NHS Leaflet: https://www.nhs.uk/conditions/common-cold/ - Dr Laksha',
    pilTitle: 'NHS Overview: Common Cold & Why Antibiotics Don’t Work',
    pilUrl: 'https://www.nhs.uk/conditions/common-cold/',
    consultationNoteSnippet:
      'Turned screen to patient; demonstrated virus intracellular invasion vs bacterial structure using visual explainer. Demystified green sputum (neutrophil myeloperoxidase) and shared expected natural timeframe for acute viral bronchitis (18-21 days). Reassured patient and agreed on supportive self-care without antibiotic prescription. Safety net triggers provided.',
  },
];
