export interface CalculatorCriteria {
  id: string;
  label: string;
  points: number;
  description?: string;
}

export interface ClinicalCalculator {
  id: string;
  name: string;
  guideline: string;
  guidelineUrl: string;
  category: 'Cardiovascular' | 'Respiratory' | 'Infection' | 'Oncology' | 'Thromboembolism';
  description: string;
  criteria: CalculatorCriteria[];
  interpret: (score: number, selectedIds: string[]) => {
    risk: 'Low Risk' | 'Intermediate Risk' | 'High Risk';
    color: string;
    action: string;
    details: string[];
    evidenceCite: string;
  };
}

export const CLINICAL_CALCULATORS: ClinicalCalculator[] = [
  {
    id: 'wells_dvt',
    name: 'Wells Score for DVT',
    guideline: 'NICE NG158 (2020)',
    guidelineUrl: 'https://www.nice.org.uk/guidance/ng158',
    category: 'Thromboembolism',
    description: 'Calculates clinical probability of Deep Vein Thrombosis (DVT) in primary care.',
    criteria: [
      { id: 'cancer', label: 'Active cancer (treatment ongoing, within 6 months, or palliative)', points: 1 },
      { id: 'paralysis', label: 'Paralysis, paresis, or recent plaster immobilisation of lower limbs', points: 1 },
      { id: 'bedridden', label: 'Recently bedridden for > 3 days or major surgery within past 12 weeks', points: 1 },
      { id: 'tenderness', label: 'Localised tenderness along the distribution of the deep venous system', points: 1 },
      { id: 'swollen_leg', label: 'Entire leg is swollen', points: 1 },
      { id: 'calf_swelling', label: 'Calf swelling > 3 cm compared to asymptomatic side (measured 10 cm below tibial tuberosity)', points: 1 },
      { id: 'pitting_edema', label: 'Pitting oedema confined to the symptomatic leg', points: 1 },
      { id: 'collateral_veins', label: 'Collateral superficial veins (non-varicose)', points: 1 },
      { id: 'previous_dvt', label: 'Previously documented DVT', points: 1 },
      { id: 'alternative_dx', label: 'Alternative diagnosis is at least as likely as DVT', points: -2 },
    ],
    interpret: (score) => {
      if (score >= 2) {
        return {
          risk: 'High Risk',
          color: 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
          action: 'DVT Likely (Score ≥ 2): Arrange immediate proximal leg vein ultrasound scan within 4 hours.',
          details: [
            'If ultrasound cannot be obtained within 4 hours: give interim therapeutic anticoagulation (DOAC e.g., Apixaban 10mg BD or Rivaroxaban 15mg BD) and arrange scan within 24 hours.',
            'Perform baseline FBC, U&Es, LFTs, and coagulation screen before starting anticoagulation.',
            'If ultrasound is negative but D-dimer is positive, repeat ultrasound in 6–8 days.',
          ],
          evidenceCite: 'NICE NG158: Venous thromboembolic diseases (2020)',
        };
      }
      return {
        risk: 'Low Risk',
        color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        action: 'DVT Unlikely (Score < 2): Perform quantitative D-dimer test.',
        details: [
          'If D-dimer is NEGATIVE: DVT is excluded. Do not anticoagulate; investigate alternative causes (cellulitis, ruptured Baker cyst, calf muscle strain).',
          'If D-dimer is POSITIVE: Arrange urgent proximal leg vein ultrasound scan within 4 hours (or give interim DOAC if delay > 4h).',
          'Advise patient on red flag symptoms: worsening swelling, acute shortness of breath, pleuritic chest pain.',
        ],
        evidenceCite: 'NICE NG158 (2020)',
      };
    },
  },

  {
    id: 'wells_pe',
    name: 'Wells Score for Pulmonary Embolism (PE)',
    guideline: 'NICE NG158 & BTS Guidelines',
    guidelineUrl: 'https://www.nice.org.uk/guidance/ng158',
    category: 'Thromboembolism',
    description: 'Assesses the clinical probability of Pulmonary Embolism in patients with acute dyspnoea or chest pain.',
    criteria: [
      { id: 'dvt_signs', label: 'Clinical signs and symptoms of DVT (minimum leg swelling and pain with palpation)', points: 3 },
      { id: 'pe_most_likely', label: 'PE is the most likely diagnosis or equally likely as alternatives', points: 3 },
      { id: 'hr_over_100', label: 'Heart rate > 100 beats per minute', points: 1.5 },
      { id: 'immobility', label: 'Immobilisation (bedridden ≥ 3 days) or surgery within the last 4 weeks', points: 1.5 },
      { id: 'previous_pe', label: 'Previous documented DVT or PE', points: 1.5 },
      { id: 'hemoptysis', label: 'Haemoptysis', points: 1 },
      { id: 'malignancy', label: 'Malignancy (undergoing treatment, treated within last 6 months, or palliative)', points: 1 },
    ],
    interpret: (score) => {
      if (score > 4) {
        return {
          risk: 'High Risk',
          color: 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
          action: 'PE Likely (Score > 4): Arrange immediate emergency Computed Tomography Pulmonary Angiogram (CTPA).',
          details: [
            'Immediate hospital admission / Same Day Emergency Care (SDEC) referral.',
            'If CTPA delay expected (> 1-2 hours), administer immediate interim therapeutic dose DOAC (Apixaban 10mg BD or Rivaroxaban 15mg BD) unless contraindicated.',
            'Assess haemodynamic stability: if SBP < 90 mmHg or cardiac arrest, immediate resuscitation and thrombolysis alert.',
          ],
          evidenceCite: 'NICE NG158: Diagnosis of PE (2020)',
        };
      }
      return {
        risk: 'Low Risk',
        color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        action: 'PE Unlikely (Score ≤ 4): Perform immediate quantitative D-dimer test.',
        details: [
          'If D-dimer is NEGATIVE: PE is safely ruled out. Consider alternative diagnoses (musculoskeletal, asthma, anxiety, pneumonia).',
          'If D-dimer is POSITIVE: Proceed immediately to urgent CTPA (or V/Q SPECT scan if severe renal failure or contrast allergy).',
        ],
        evidenceCite: 'NICE NG158 (2020)',
      };
    },
  },

  {
    id: 'centor_feverpain',
    name: 'Centor & FeverPAIN (Acute Sore Throat)',
    guideline: 'NICE NG84 (2018) & CKS',
    guidelineUrl: 'https://cks.nice.org.uk/topics/sore-throat-acute/',
    category: 'Infection',
    description: 'Predicts probability of Group A beta-haemolytic streptococcal pharyngitis and guides antibiotic prescription.',
    criteria: [
      { id: 'fever_24h', label: 'Fever in the past 24 hours (or temperature > 38°C during exam)', points: 1 },
      { id: 'tonsil_exudate', label: 'Purulence / exudate on tonsils', points: 1 },
      { id: 'rapid_onset', label: 'Severe attendance within 3 days of symptom onset', points: 1 },
      { id: 'inflamed_tonsils', label: 'Severely inflamed tonsils (marked erythema / swelling)', points: 1 },
      { id: 'no_cough', label: 'Absence of cough or coryza (no runny nose / sneezing)', points: 1 },
      { id: 'tender_nodes', label: 'Tender anterior cervical lymphadenopathy', points: 1 },
    ],
    interpret: (score) => {
      if (score >= 4) {
        return {
          risk: 'High Risk',
          color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
          action: 'High probability of Group A Strep (Score 4–6): Consider immediate antibiotic prescription or backup delayed script.',
          details: [
            'First-line: Phenoxymethylpenicillin (Penicillin V) 500mg QDS (or 1000mg BD) orally for 5 to 10 days.',
            'Penicillin allergy (true allergy): Clarithromycin 250mg to 500mg BD for 5 days, or Erythromycin 250–500mg QDS for 5 days.',
            'Analgesia: Regular Paracetamol 1g QDS and Ibuprofen 400mg TDS with food.',
            'Safety netting: Advise return if unable to swallow saliva, trismus, unilateral swelling (Quinsy/peritonsillar abscess), or stridor.',
          ],
          evidenceCite: 'NICE NG84: Sore throat (acute): antimicrobial prescribing',
        };
      }
      return {
        risk: 'Low Risk',
        color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        action: 'Viral aetiology likely (Score 0–3): Antibiotics NOT recommended; advise self-care and safety net.',
        details: [
          'Advise that viral sore throats take on average 1 week to resolve.',
          'Optimize analgesia: soluble paracetamol gargle or ibuprofen.',
          'Offer delayed / back-up prescription only if patient is at increased risk of complications (immunosuppression, asplenia).',
          'Red flags: difficulty breathing, drooling, neck stiffness, systemic sepsis.',
        ],
        evidenceCite: 'NICE NG84 (2018) & CKS',
      };
    },
  },

  {
    id: 'curb65',
    name: 'CURB-65 (Community-Acquired Pneumonia)',
    guideline: 'NICE CG191 & BTS Guidelines',
    guidelineUrl: 'https://cks.nice.org.uk/topics/chest-infections-adult-ca-pneumonia/',
    category: 'Respiratory',
    description: 'Mortality risk stratification tool determining home vs hospital management for pneumonia.',
    criteria: [
      { id: 'confusion', label: 'Confusion: Abbreviated Mental Test Score (AMTS) ≤ 8, or new disorientation', points: 1 },
      { id: 'urea', label: 'Urea > 7.0 mmol/L (if bloods available; omit for CRB-65 in primary care)', points: 1 },
      { id: 'respiratory_rate', label: 'Respiratory rate ≥ 30 breaths/min', points: 1 },
      { id: 'blood_pressure', label: 'Blood pressure: Systolic < 90 mmHg or Diastolic ≤ 60 mmHg', points: 1 },
      { id: 'age_65', label: 'Age ≥ 65 years', points: 1 },
    ],
    interpret: (score) => {
      if (score >= 3) {
        return {
          risk: 'High Risk',
          color: 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
          action: 'Severe Pneumonia (Score 3–5, mortality 15–40%): Emergency 999 hospital admission.',
          details: [
            'Immediate hospital transfer via emergency ambulance.',
            'Give immediate single dose of parenteral antibiotic (e.g. Benzylpenicillin 1.2g IV/IM) if transfer delayed.',
            'Give high-flow oxygen to maintain SpO2 94–98% (or 88–92% in hypercapnic respiratory failure risk).',
          ],
          evidenceCite: 'NICE CG191: Pneumonia in adults (diagnosis and management)',
        };
      }
      if (score === 2) {
        return {
          risk: 'Intermediate Risk',
          color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
          action: 'Moderate Pneumonia (Score 2, mortality ~9%): Consider hospital assessment / Same Day Emergency Care.',
          details: [
            'Hospital assessment usually indicated, or closely monitored outpatient treatment if social support is robust.',
            'Dual antibiotic coverage: Amoxicillin 500mg TDS PLUS Clarithromycin 500mg BD for 5 days.',
            'Penicillin allergy: Doxycycline 200mg stat then 100mg OD for 5 days, or Levofloxacin 500mg OD.',
          ],
          evidenceCite: 'NICE CG191 & BTS Guidelines',
        };
      }
      return {
        risk: 'Low Risk',
        color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        action: 'Low Risk Pneumonia (Score 0–1, mortality < 2%): Suitable for primary care home treatment.',
        details: [
          'First-line: Amoxicillin 500mg TDS for 5 days.',
          'Penicillin allergy: Doxycycline 200mg on day 1, then 100mg once daily for 4 days (total 5 days); OR Clarithromycin 500mg BD for 5 days.',
          'Review in 48 hours or sooner if deterioration.',
          'Advise CXR at 6 weeks post-infection for smokers or patients > 50 years to exclude underlying bronchial carcinoma.',
        ],
        evidenceCite: 'NICE CG191 (2014, updated 2023)',
      };
    },
  },

  {
    id: 'cha2ds2_vasc',
    name: 'CHA₂DS₂-VASc (AF Stroke Risk)',
    guideline: 'NICE NG196 (2021) & ESC',
    guidelineUrl: 'https://www.nice.org.uk/guidance/ng196',
    category: 'Cardiovascular',
    description: 'Calculates stroke risk for patients with non-valvular Atrial Fibrillation to guide anticoagulation.',
    criteria: [
      { id: 'chf', label: 'Congestive Heart Failure / LV dysfunction (LVEF ≤ 40%)', points: 1 },
      { id: 'htn', label: 'Hypertension (resting BP > 140/90 or treated with antihypertensives)', points: 1 },
      { id: 'age_75', label: 'Age ≥ 75 years', points: 2 },
      { id: 'diabetes', label: 'Diabetes mellitus (fasting glucose > 7 or on oral hypoglycaemics/insulin)', points: 1 },
      { id: 'stroke', label: 'Prior Stroke / TIA / thromboembolism', points: 2 },
      { id: 'vascular', label: 'Vascular disease (prior MI, peripheral artery disease, or aortic plaque)', points: 1 },
      { id: 'age_65_74', label: 'Age 65 to 74 years', points: 1 },
      { id: 'female', label: 'Sex category: Female (only counts if ≥ 1 other risk factor present)', points: 1 },
    ],
    interpret: (score) => {
      if (score >= 2) {
        return {
          risk: 'High Risk',
          color: 'text-purple-700 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
          action: 'Anticoagulation STRONGLY Recommended (Score ≥ 2): Offer DOAC to reduce annual stroke risk.',
          details: [
            'First-line: Direct Oral Anticoagulants (DOACs): Apixaban 5mg BD, Edoxaban 60mg OD, Rivaroxaban 20mg OD, or Dabigatran 150mg BD.',
            'Dose reduction criteria: Check age, weight (≤ 60kg), and renal function (CrCl Cockcroft-Gault). E.g. Apixaban 2.5mg BD if ≥ 2 of: age ≥ 80, weight ≤ 60kg, creatinine ≥ 133.',
            'Calculate HAS-BLED bleeding risk score to address modifiable bleeding risks (BP control, NSAIDs, alcohol) — high bleeding risk is NOT a reason to withhold DOAC.',
            'NICE recommendation: Do NOT offer aspirin monotherapy solely for stroke prevention in AF.',
          ],
          evidenceCite: 'NICE NG196: Atrial fibrillation: diagnosis and management (2021)',
        };
      }
      if (score === 1) {
        return {
          risk: 'Intermediate Risk',
          color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
          action: 'Consider Anticoagulation (Score 1 in males): Discuss individual balance of stroke vs bleeding risk.',
          details: [
            'NICE guidance: In males with score = 1, consider anticoagulation taking into account bleeding risk and patient preference.',
            'Note: Female gender alone without other risk factors (score = 1) does NOT confer excess stroke risk; anticoagulation not indicated for isolated female sex.',
          ],
          evidenceCite: 'NICE NG196 (2021)',
        };
      }
      return {
        risk: 'Low Risk',
        color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        action: 'Low Stroke Risk (Score 0 in men, Score 1 in women): Anticoagulation is NOT indicated.',
        details: [
          'No antithrombotic therapy required.',
          'Re-evaluate stroke risk annually or whenever a new cardiovascular event or risk factor develops (age threshold reached, hypertension diagnosed).',
        ],
        evidenceCite: 'NICE NG196 (2021)',
      };
    },
  },
];
