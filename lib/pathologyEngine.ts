/**
 * UK Primary Care Pathology & Blood Results Engine
 * Aligned with BSG 2020, NICE NG12, NICE NG203, NICE NG145, and BSH guidelines.
 */

// ============================================================================
// 1. ABNORMAL LFTS & FIB-4 (BSG 2020)
// ============================================================================

export interface LftInputs {
  alt?: number;
  ast?: number;
  alp?: number;
  ggt?: number;
  bilirubin?: number;
  albumin?: number;
  platelets?: number;
  age?: number;
  alcoholUnitsPerWeek?: number;
  bmi?: number;
  isStatinUser?: boolean;
  hasRecentAntibiotics?: boolean; // e.g. Co-amoxiclav, flucloxacillin
}

export interface Fib4Result {
  score: number;
  riskCategory: 'low' | 'indeterminate' | 'high';
  interpretation: string;
  action: string;
}

export interface LftAnalysisResult {
  pattern: 'normal' | 'hepatitic' | 'cholestatic' | 'mixed' | 'isolated_hyperbilirubinaemia';
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  title: string;
  differentialDiagnoses: string[];
  recommendedInvestigations: string[];
  clinicalAdvice: string[];
  redFlags: string[];
  fib4?: Fib4Result;
  filingText: string;
  accurxTemplateSuggestion?: string;
}

export function calculateFib4(age: number, ast: number, alt: number, platelets: number): Fib4Result | null {
  if (!age || !ast || !alt || !platelets || platelets <= 0 || alt <= 0) {
    return null;
  }

  // Formula: (Age * AST) / (Platelets * sqrt(ALT))
  const score = parseFloat(((age * ast) / (platelets * Math.sqrt(alt))).toFixed(2));

  // Age-adjusted cutoff per BSG / EASL (for age >= 65, lower cutoff is 2.0 instead of 1.30)
  const lowCutoff = age >= 65 ? 2.0 : 1.30;
  const highCutoff = 2.67;

  if (score < lowCutoff) {
    return {
      score,
      riskCategory: 'low',
      interpretation: `FIB-4 = ${score} (< ${lowCutoff}): Low risk of advanced liver fibrosis (F3/F4). High negative predictive value (>90%).`,
      action: 'Manage in primary care with lifestyle modifications (diet, exercise, alcohol reduction). Re-assess FIB-4 in 2–3 years.',
    };
  } else if (score <= highCutoff) {
    return {
      score,
      riskCategory: 'indeterminate',
      interpretation: `FIB-4 = ${score} (${lowCutoff}–${highCutoff}): Indeterminate risk of advanced liver fibrosis.`,
      action: 'Second-tier testing recommended: Request Enhanced Liver Fibrosis (ELF) blood test if locally commissioned, or refer for transient elastography (FibroScan).',
    };
  } else {
    return {
      score,
      riskCategory: 'high',
      interpretation: `FIB-4 = ${score} (> ${highCutoff}): High risk of advanced fibrosis or cirrhosis.`,
      action: 'Secondary care Gastroenterology / Hepatology referral recommended for formal staging and liver specialist assessment.',
    };
  }
}

export function analyzeLfts(inputs: LftInputs): LftAnalysisResult {
  const {
    alt = 0,
    ast = 0,
    alp = 0,
    ggt = 0,
    bilirubin = 0,
    albumin = 0,
    platelets = 0,
    age = 0,
    alcoholUnitsPerWeek = 0,
    hasRecentAntibiotics = false,
  } = inputs;

  const upperLimitAlt = 35; // typical UK upper limit
  const upperLimitAst = 35;
  const upperLimitAlp = 130;
  const upperLimitGgt = 50;
  const upperLimitBili = 21;

  const isAltElevated = alt > upperLimitAlt;
  const isAstElevated = ast > upperLimitAst;
  const isAlpElevated = alp > upperLimitAlp;
  const isGgtElevated = ggt > upperLimitGgt;
  const isBiliElevated = bilirubin > upperLimitBili;

  // Multiples of upper limit of normal
  const altRatio = alt / upperLimitAlt;
  const alpRatio = alp / upperLimitAlp;

  let pattern: LftAnalysisResult['pattern'] = 'normal';
  let severity: LftAnalysisResult['severity'] = 'normal';

  if (!isAltElevated && !isAstElevated && !isAlpElevated && !isGgtElevated && !isBiliElevated) {
    pattern = 'normal';
    severity = 'normal';
  } else if (isBiliElevated && !isAltElevated && !isAstElevated && !isAlpElevated) {
    pattern = 'isolated_hyperbilirubinaemia';
    severity = bilirubin > 50 ? 'moderate' : 'mild';
  } else if ((isAltElevated || isAstElevated) && !isAlpElevated) {
    pattern = 'hepatitic';
    severity = altRatio > 5 ? 'severe' : altRatio > 2 ? 'moderate' : 'mild';
  } else if (isAlpElevated && !isAltElevated && !isAstElevated) {
    pattern = 'cholestatic';
    severity = alpRatio > 3 ? 'severe' : alpRatio > 1.5 ? 'moderate' : 'mild';
  } else if ((isAltElevated || isAstElevated) && isAlpElevated) {
    // Determine R value: (ALT / ULN) / (ALP / ULN)
    const rValue = altRatio / (alpRatio || 1);
    if (rValue >= 5) {
      pattern = 'hepatitic';
      severity = 'moderate';
    } else if (rValue <= 2) {
      pattern = 'cholestatic';
      severity = 'moderate';
    } else {
      pattern = 'mixed';
      severity = 'moderate';
    }
  } else if (isGgtElevated && !isAltElevated && !isAstElevated && !isAlpElevated) {
    pattern = 'cholestatic';
    severity = 'mild';
  }

  // Calculate FIB-4 if sufficient data
  const fib4 = age && ast && alt && platelets ? calculateFib4(age, ast, alt, platelets) || undefined : undefined;

  const differentialDiagnoses: string[] = [];
  const recommendedInvestigations: string[] = [];
  const clinicalAdvice: string[] = [];
  const redFlags: string[] = [];

  // Red flag checks
  if (bilirubin > 50 && (isAlpElevated || isAltElevated)) {
    redFlags.push('Painless jaundice or progressive jaundice (NICE NG12 2WW pancreatic / biliary cancer referral check).');
  }
  if (alt > 1000 || ast > 1000) {
    redFlags.push('Severe acute hepatocellular injury (ALT/AST > 1000 U/L) – Check paracetamol overdose, ischaemic hepatitis, or acute viral hepatitis. Consider same-day acute admission if encephalopathy, jaundice, or INR elevated.');
  }
  if (albumin > 0 && albumin < 30) {
    redFlags.push('Hypoalbuminaemia (< 30 g/L) suggests synthetic liver dysfunction, severe sepsis, nephrotic syndrome, or malnutrition.');
  }

  if (pattern === 'hepatitic') {
    differentialDiagnoses.push('Metabolic dysfunction-associated steatotic liver disease (MASLD / NAFLD)');
    differentialDiagnoses.push('Alcohol-related liver disease (ArLD)');
    differentialDiagnoses.push('Medication-induced liver injury (Statins, NSAIDs, Methotrexate, Nitrofurantoin)');
    differentialDiagnoses.push('Viral Hepatitis (Hepatitis B, Hepatitis C, EBV, CMV)');
    differentialDiagnoses.push('Autoimmune Hepatitis (AIH)');
    differentialDiagnoses.push('Haemochromatosis / Iron overload');

    recommendedInvestigations.push('Hepatitis B Surface Antigen (HBsAg) & Hepatitis C Antibody');
    recommendedInvestigations.push('Ferritin and Transferrin Saturation (iron overload screening)');
    recommendedInvestigations.push('Autoimmune liver screen: Antinuclear antibodies (ANA), Smooth Muscle antibodies (SMA), Liver-Kidney Microsomal (LKM), IgG');
    recommendedInvestigations.push('Liver ultrasound (assess steatosis, parenchymal echogenicity, portal vein flow, focal lesions)');
    if (age && alt && ast && platelets) {
      recommendedInvestigations.push('FIB-4 score calculation (already integrated below)');
    }

    if (alcoholUnitsPerWeek > 14) {
      clinicalAdvice.push(`Alcohol intake (${alcoholUnitsPerWeek} units/week) exceeds UK CMO guidance of 14 units. Structured brief advice and alcohol reduction advised.`);
    }
    clinicalAdvice.push('Review prescription and OTC medications for hepatotoxic agents.');
    clinicalAdvice.push('If mild ALT elevation (< 2x ULN) and patient asymptomatic: repeat LFTs with full liver aetiology screen in 3 months.');
  } else if (pattern === 'cholestatic') {
    differentialDiagnoses.push('Biliary obstruction (choledocholithiasis, biliary stricture, extrinsic compression)');
    differentialDiagnoses.push('Drug-induced cholestasis (Co-amoxiclav, Flucloxacillin, Chlorpromazine, Anabolic steroids)');
    differentialDiagnoses.push('Primary Biliary Cholangitis (PBC - especially if female, elevated ALP with Antimitochondrial Antibodies)');
    differentialDiagnoses.push('Primary Sclerosing Cholangitis (PSC - strongly associated with Ulcerative Colitis)');
    if (!isGgtElevated && isAlpElevated) {
      differentialDiagnoses.push('Isolated bone origin (Paget’s disease, fracture, bony metastases, osteomalacia / severe Vitamin D deficiency)');
    }

    if (!isGgtElevated && isAlpElevated) {
      recommendedInvestigations.push('Normal GGT with elevated ALP suggests BONE source: check Calcium, Phosphate, Vitamin D, and consider bone scan / isotope imaging if localised pain.');
    } else {
      recommendedInvestigations.push('Urgent transabdominal liver and biliary ultrasound scan (assess for common bile duct dilatation and gallstones)');
      recommendedInvestigations.push('Antimitochondrial Antibodies (AMA) and IgM level (Primary Biliary Cholangitis screen)');
    }

    if (hasRecentAntibiotics) {
      clinicalAdvice.push('Note: Cholestatic drug reactions (e.g. Co-amoxiclav) can present up to 6–8 weeks after completing the antibiotic course and take 3–6 months to resolve.');
    }
  } else if (pattern === 'isolated_hyperbilirubinaemia') {
    differentialDiagnoses.push('Gilbert’s syndrome (benign, autosomal recessive UDP-glucuronosyltransferase deficiency, affecting 5–10% of population)');
    differentialDiagnoses.push('Haemolysis (autoimmune haemolytic anaemia, G6PD deficiency, hereditary spherocytosis)');

    recommendedInvestigations.push('Full Blood Count & Reticulocyte count (rule out haemolysis)');
    recommendedInvestigations.push('Blood film and LDH (if anaemia or haemolysis suspected)');
    recommendedInvestigations.push('Direct (conjugated) vs Indirect (unconjugated) Bilirubin split if available');

    clinicalAdvice.push('Gilbert’s Syndrome criteria: Isolated unconjugated hyperbilirubinaemia (< 80 umol/L) with completely normal AST, ALT, ALP, albumin, and normal FBC/reticulocytes. Bilirubin typically fluctuates higher during viral illness, fasting, dehydration, or strenuous exertion.');
    clinicalAdvice.push('Reassure patient: Gilbert’s syndrome is benign, non-progressive, and requires no treatment or ongoing surveillance.');
  }

  // Construct standardized filing note for EMIS / SystmOne
  let filingText = '';
  if (pattern === 'hepatitic') {
    filingText = `Abnormal LFTs (Hepatitic pattern): ALT ${alt} U/L, AST ${ast} U/L. Synthetic function preserved (Bilirubin ${bilirubin || 'normal'}, Albumin ${albumin || 'normal'}). ${
      fib4 ? `FIB-4 score = ${fib4.score} (${fib4.riskCategory} risk). ` : ''
    }Plan: Liver aetiology screen requested (Hep B/C, Ferritin, Autoimmune screen) + non-urgent US Abdomen. Advised alcohol reduction & lifestyle. Repeat LFTs in 3 months. No red flags.`;
  } else if (pattern === 'cholestatic') {
    filingText = `Abnormal LFTs (Cholestatic pattern): ALP ${alp} U/L, GGT ${ggt} U/L. Plan: Transabdominal ultrasound requested to assess biliary tree + AMA screen. Review medications for cholestatic precipitants. Advised return if jaundice or dark urine/pale stools.`;
  } else if (pattern === 'isolated_hyperbilirubinaemia') {
    filingText = `Isolated hyperbilirubinaemia (${bilirubin} umol/L) with normal transaminases (ALT ${alt}) and normal ALP. Haemolysis excluded on FBC. Features fully consistent with benign Gilbert's syndrome. Reassurance provided; no further follow-up required.`;
  } else {
    filingText = `LFTs reviewed: ALT ${alt}, AST ${ast}, ALP ${alp}, Bili ${bilirubin}, Alb ${albumin}. No clinically significant hepatic abnormality identified. Filed as satisfactory.`;
  }

  const accurxTemplateSuggestion =
    pattern === 'isolated_hyperbilirubinaemia'
      ? 'Your recent blood test showed a mild, isolated elevation in your bilirubin level. Your liver transaminases and blood count are completely normal. This is typical of a common, harmless condition called Gilbert’s syndrome, which causes no liver damage and requires no treatment. Full NHS leaflet: https://www.nhs.uk/conditions/gilberts-syndrome/'
      : pattern === 'hepatitic' && fib4?.riskCategory === 'low'
      ? 'Your recent liver blood tests showed a slight elevation in liver enzymes (ALT). The calculated liver health score (FIB-4) confirms you are at low risk of significant liver scarring. We recommend maintaining a balanced diet, regular exercise, and keeping alcohol within 14 units a week. We will arrange a routine repeat blood test in 3 months.'
      : undefined;

  return {
    pattern,
    severity,
    title:
      pattern === 'hepatitic'
        ? `Hepatitic Pattern (ALT ${alt} U/L)`
        : pattern === 'cholestatic'
        ? `Cholestatic Pattern (ALP ${alp} U/L, GGT ${ggt} U/L)`
        : pattern === 'isolated_hyperbilirubinaemia'
        ? `Isolated Hyperbilirubinaemia (${bilirubin} µmol/L)`
        : pattern === 'mixed'
        ? `Mixed Hepatitic/Cholestatic LFT Elevation`
        : 'Normal Liver Function Profile',
    differentialDiagnoses,
    recommendedInvestigations,
    clinicalAdvice,
    redFlags,
    fib4,
    filingText,
    accurxTemplateSuggestion,
  };
}

// ============================================================================
// 2. HAEMATINICS & IRON DEFICIENCY (NICE NG12 / BSH)
// ============================================================================

export interface HaematinicsInputs {
  hb: number;
  mcv: number;
  ferritin?: number;
  tfs?: number; // Transferrin Saturation %
  rbc?: number; // 10^12/L for Mentzer index
  age?: number;
  sex?: 'male' | 'female';
  isPostMenopausal?: boolean;
  hasRedFlagGiSymptoms?: boolean;
}

export interface HaematinicsResult {
  classification: string;
  isAbsoluteIronDeficiency: boolean;
  isFunctionalIronDeficiency: boolean;
  mentzerIndex?: {
    value: number;
    interpretation: string;
  };
  twoWeekWaitCheck: {
    qualifies: boolean;
    reason: string;
  };
  treatmentRecommendation: string;
  recommendedTests: string[];
  filingText: string;
  accurxTemplateSuggestion?: string;
}

export function analyzeHaematinics(inputs: HaematinicsInputs): HaematinicsResult {
  const {
    hb = 130,
    mcv = 85,
    ferritin = 40,
    tfs = 25,
    rbc = 4.5,
    age = 50,
    sex = 'female',
    isPostMenopausal = false,
    hasRedFlagGiSymptoms = false,
  } = inputs;

  const isAnaemic = (sex === 'male' && hb < 130) || (sex === 'female' && hb < 120);
  const isMicrocytic = mcv < 80;
  const isAbsoluteIronDeficiency = ferritin < 30;
  const isFunctionalIronDeficiency = ferritin >= 30 && tfs > 0 && tfs < 20;

  // Mentzer Index = MCV / RBC
  let mentzerIndex: HaematinicsResult['mentzerIndex'] = undefined;
  if (isMicrocytic && rbc > 0) {
    const val = parseFloat((mcv / rbc).toFixed(1));
    mentzerIndex = {
      value: val,
      interpretation:
        val < 13
          ? `Mentzer Index = ${val} (< 13): Strongly suggests Thalassaemia Trait / Haemoglobinopathy (disproportionately high RBC count for MCV). Request Haemoglobin Electrophoresis.`
          : `Mentzer Index = ${val} (> 13): Favours Iron Deficiency Anaemia over haemoglobinopathy.`,
    };
  }

  // NICE NG12 2WW Criteria check
  // Men & post-menopausal women with unexplained IDA -> Urgent 2WW lower & upper GI referral
  let qualifies2ww = false;
  let reason2ww = 'Does not automatically meet NG12 2WW criteria on age/sex alone.';

  if (isAnaemic && isAbsoluteIronDeficiency) {
    if (sex === 'male' || isPostMenopausal || age >= 55) {
      qualifies2ww = true;
      reason2ww = `Meets NICE NG12 2WW Fast-Track Referral Criteria: ${
        sex === 'male' ? 'Men of any age' : 'Post-menopausal women'
      } with confirmed Iron Deficiency Anaemia (Hb ${hb}, Ferritin ${ferritin}) require urgent lower & upper GI endoscopy referral.`;
    } else if (hasRedFlagGiSymptoms) {
      qualifies2ww = true;
      reason2ww = 'Meets NICE NG12 2WW Criteria: Iron deficiency anaemia with concurrent gastrointestinal red flag symptoms (rectal bleeding, altered bowel habit, weight loss).';
    }
  }

  let classification = 'Normal Haematinics';
  if (isAnaemic && isAbsoluteIronDeficiency) {
    classification = 'Absolute Iron Deficiency Anaemia (IDA)';
  } else if (!isAnaemic && isAbsoluteIronDeficiency) {
    classification = 'Non-Anaemic Iron Deficiency (Ferritin < 30)';
  } else if (isAnaemic && isFunctionalIronDeficiency) {
    classification = 'Functional Iron Deficiency / Anaemia of Chronic Disease (Normal Ferritin, TfS < 20%)';
  } else if (isAnaemic && !isAbsoluteIronDeficiency && isMicrocytic && mentzerIndex && mentzerIndex.value < 13) {
    classification = 'Microcytic Anaemia – Suspected Thalassaemia Trait';
  } else if (isAnaemic) {
    classification = 'Anaemia (Normocytic / Non-Iron Deficient)';
  }

  const recommendedTests: string[] = [];
  if (isAbsoluteIronDeficiency || isAnaemic) {
    recommendedTests.push('Coeliac Disease Serology (Anti-TTG IgA + total IgA) prior to commencing oral iron');
    recommendedTests.push('Urine dipstick / microscopy (exclude microscopic haematuria / renal tract loss)');
    if (ferritin >= 30 && tfs === 25) {
      recommendedTests.push('Transferrin Saturation (TfS) to exclude functional iron deficiency masked by acute phase reaction');
    }
    if (mentzerIndex && mentzerIndex.value < 13) {
      recommendedTests.push('Haemoglobin Electrophoresis / HPLC (thalassaemia screen)');
    }
  }

  let treatmentRecommendation = 'No iron replacement indicated.';
  if (isAbsoluteIronDeficiency || isFunctionalIronDeficiency) {
    treatmentRecommendation =
      'Commence oral iron: Ferrous Fumarate 210mg OD (or alternate-day dosing, e.g. Mon/Wed/Fri, to minimise hepcidin surge and reduce GI side effects). Re-check FBC in 4 weeks (expect Hb rise > 10 g/L in 2–4 weeks). Continue oral iron for 3 months after Hb normalises to replenish marrow stores.';
  }

  let filingText = '';
  if (isAnaemic && isAbsoluteIronDeficiency) {
    filingText = `Iron Deficiency Anaemia: Hb ${hb} g/L, MCV ${mcv} fL, Ferritin ${ferritin} ug/L. Coeliac screen (TTG) requested. Commenced oral Ferrous Fumarate 210mg OD. ${
      qualifies2ww ? 'Action: Urgent 2WW Colorectal / Upper GI referral initiated per NICE NG12. ' : 'Menstrual history reviewed. '
    }FBC repeat planned in 4 weeks.`;
  } else if (!isAnaemic && isAbsoluteIronDeficiency) {
    filingText = `Non-anaemic iron deficiency: Hb normal (${hb} g/L), Ferritin low (${ferritin} ug/L). Plan: Dietary iron advice sent via Accurx + Ferrous Fumarate 210mg OD for 3 months. TTG sent.`;
  } else {
    filingText = `Haematinics reviewed: Hb ${hb}, MCV ${mcv}, Ferritin ${ferritin}. No evidence of absolute iron deficiency. ${classification}.`;
  }

  const accurxTemplateSuggestion =
    isAbsoluteIronDeficiency
      ? 'Your recent blood tests confirm an iron deficiency (ferritin is low at ' +
        ferritin +
        ' ug/L). We have prescribed an iron supplement (Ferrous Fumarate) to restore your levels. Please take it once a day on an empty stomach or with Vitamin C (e.g. orange juice), and avoid taking it with tea, coffee, or milk. We will arrange a repeat blood test in 4 weeks. Full NHS leaflet on iron deficiency: https://www.nhs.uk/conditions/iron-deficiency-anaemia/'
      : undefined;

  return {
    classification,
    isAbsoluteIronDeficiency,
    isFunctionalIronDeficiency,
    mentzerIndex,
    twoWeekWaitCheck: {
      qualifies: qualifies2ww,
      reason: reason2ww,
    },
    treatmentRecommendation,
    recommendedTests,
    filingText,
    accurxTemplateSuggestion,
  };
}

// ============================================================================
// 3. CKD & PROTEINURIA MATRIX (NICE NG203)
// ============================================================================

export interface CkdInputs {
  egfrCurrent: number;
  egfrPrevious?: number; // eGFR from 12 months ago
  acr: number; // Urine Albumin:Creatinine Ratio in mg/mmol
  hasDiabetes?: boolean;
  hasHeartFailure?: boolean;
  hasHaematuria?: boolean;
  currentSystolicBp?: number;
  currentDiastolicBp?: number;
}

export interface CkdResult {
  stageG: string; // e.g. G3a
  stageA: string; // e.g. A2
  combinedStage: string; // e.g. CKD Stage G3a A2
  isAcceleratedProgression: boolean;
  progressionNote: string;
  aceiArbIndicated: boolean;
  sglt2iIndicated: boolean;
  bpTarget: string;
  nephrologyReferralNeeded: boolean;
  referralCriteria: string[];
  managementPlan: string[];
  filingText: string;
  accurxTemplateSuggestion?: string;
}

export function analyzeCkd(inputs: CkdInputs): CkdResult {
  const {
    egfrCurrent = 60,
    egfrPrevious,
    acr = 1.0,
    hasDiabetes = false,
    hasHeartFailure = false,
    hasHaematuria = false,
    currentSystolicBp = 135,
    currentDiastolicBp = 82,
  } = inputs;

  // Staging: G1 to G5
  let stageG = 'G1';
  if (egfrCurrent >= 90) stageG = 'G1';
  else if (egfrCurrent >= 60) stageG = 'G2';
  else if (egfrCurrent >= 45) stageG = 'G3a';
  else if (egfrCurrent >= 30) stageG = 'G3b';
  else if (egfrCurrent >= 15) stageG = 'G4';
  else stageG = 'G5';

  // ACR Staging: A1 to A3
  let stageA = 'A1';
  if (acr < 3) stageA = 'A1';
  else if (acr <= 30) stageA = 'A2';
  else stageA = 'A3';

  const combinedStage = `CKD Stage ${stageG} ${stageA}`;

  // Accelerated progression check per NICE NG203:
  // Defined as sustained decrease in eGFR of 25% or more and a change in CKD category within 12 months,
  // OR a sustained decrease in eGFR of 15 ml/min/1.73m2 or more per year.
  let isAcceleratedProgression = false;
  let progressionNote = 'Stable renal function over 12 months.';
  if (egfrPrevious && egfrPrevious > 0) {
    const dropAbsolute = egfrPrevious - egfrCurrent;
    const dropPercentage = (dropAbsolute / egfrPrevious) * 100;

    if (dropAbsolute >= 15 || dropPercentage >= 25) {
      isAcceleratedProgression = true;
      progressionNote = `Accelerated eGFR decline flagged: Drop of ${dropAbsolute.toFixed(
        1
      )} ml/min (${dropPercentage.toFixed(1)}% drop in 12m). Exclude AKI, check recent ACEi/ARB titration, review NSAIDs, and repeat U&E in 2 weeks.`;
    } else {
      progressionNote = `Non-accelerated progression: Change is ${dropAbsolute > 0 ? `-${dropAbsolute.toFixed(1)}` : `+${Math.abs(dropAbsolute).toFixed(1)}`} ml/min over 12 months.`;
    }
  }

  // ACEi / ARB indication:
  // Indicated if ACR >= 3 with diabetes, OR ACR >= 30 regardless of diabetes
  const aceiArbIndicated = (hasDiabetes && acr >= 3) || acr >= 30;

  // SGLT2 inhibitor indication (NICE TA775 / NG203):
  // Indicated if eGFR 25-75 with ACR >= 22.6 mg/mmol, OR if T2D with ACR >= 3, OR Heart Failure
  const sglt2iIndicated =
    (egfrCurrent >= 20 && egfrCurrent <= 75 && acr >= 22.6) ||
    (hasDiabetes && egfrCurrent >= 20 && acr >= 3) ||
    hasHeartFailure;

  // BP Target per NICE NG203:
  // Target < 130/80 if ACR >= 70 mg/mmol (or ACR >= 30 with diabetes). Otherwise < 140/90.
  const strictBpRequired = acr >= 70 || (hasDiabetes && acr >= 30);
  const bpTarget = strictBpRequired
    ? 'Strict BP target < 130/80 mmHg (indicated due to clinically significant proteinuria/diabetes).'
    : 'Standard BP target < 140/90 mmHg (or < 150/90 if age >= 80).';

  // Nephrology Referral Criteria per NICE NG203:
  const referralCriteria: string[] = [];
  let nephrologyReferralNeeded = false;

  if (egfrCurrent < 30) {
    nephrologyReferralNeeded = true;
    referralCriteria.push('eGFR < 30 ml/min/1.73m2 (CKD Stage G4/G5) requires secondary care nephrology referral.');
  }
  if (acr >= 70 && !hasDiabetes) {
    nephrologyReferralNeeded = true;
    referralCriteria.push('Very high proteinuria (ACR >= 70 mg/mmol) without diabetes requires nephrology referral.');
  }
  if (acr >= 30 && hasHaematuria) {
    nephrologyReferralNeeded = true;
    referralCriteria.push('Proteinuria (ACR >= 30) combined with persistent non-visible haematuria requires nephrology evaluation.');
  }
  if (isAcceleratedProgression) {
    referralCriteria.push('Accelerated progression (>25% eGFR decline in 12m) should prompt nephrology discussion if persistent after medication review.');
  }

  const managementPlan: string[] = [];
  managementPlan.push(bpTarget);
  if (aceiArbIndicated) {
    managementPlan.push('Initiate or titrate ACE inhibitor / ARB to maximum tolerated dose (monitor U&E at 1-2 weeks).');
  }
  if (sglt2iIndicated) {
    managementPlan.push('SGLT2 inhibitor indicated (e.g. Dapagliflozin 10mg OD per NICE TA775) to slow CKD progression and reduce cardiovascular risk.');
  }
  managementPlan.push('Cardiovascular risk reduction: Offer Atorvastatin 20mg for primary prevention in CKD.');
  managementPlan.push('Sick day rules: Advise temporary pause of ACEi/ARB, SGLT2i, Metformin, Diuretics, and NSAIDs during acute dehydrating illness.');

  const filingText = `${combinedStage} (eGFR ${egfrCurrent}, ACR ${acr} mg/mmol). ${progressionNote} BP currently ${currentSystolicBp}/${currentDiastolicBp}. ${
    aceiArbIndicated ? 'ACEi/ARB therapy active/titrated. ' : ''
  }${sglt2iIndicated ? 'SGLT2i criteria met (NICE TA775). ' : ''}${
    nephrologyReferralNeeded ? 'Secondary care nephrology referral criteria met. ' : 'Primary care monitoring plan in place. '
  }Routine renal surveillance scheduled.`;

  return {
    stageG,
    stageA,
    combinedStage,
    isAcceleratedProgression,
    progressionNote,
    aceiArbIndicated,
    sglt2iIndicated,
    bpTarget,
    nephrologyReferralNeeded,
    referralCriteria,
    managementPlan,
    filingText,
    accurxTemplateSuggestion:
      'Your latest kidney health test (eGFR ' +
      egfrCurrent +
      ', Urine protein ACR ' +
      acr +
      ') shows your kidneys are stable. To keep your kidneys working well long-term, it is vital to keep blood pressure well controlled and stay hydrated. Full NHS information on kidney health: https://www.nhs.uk/conditions/kidney-disease/',
  };
}

// ============================================================================
// 4. THYROID FUNCTION (TFT) QUICK RULES (NICE NG145)
// ============================================================================

export interface TftInputs {
  tsh: number; // mU/L
  freeT4?: number; // pmol/L
  freeT3?: number; // pmol/L
  tpoAntibodiesPositive?: boolean;
  isPregnantOrPlanning?: boolean;
  isSymptomatic?: boolean;
  age?: number;
  isHospitalDischargeOrAcuteIllness?: boolean;
}

export interface TftResult {
  category:
    | 'euthyroid'
    | 'subclinical_hypothyroidism'
    | 'overt_hypothyroidism'
    | 'subclinical_hyperthyroidism'
    | 'overt_hyperthyroidism'
    | 'sick_euthyroid';
  title: string;
  levothyroxineTrialIndicated: boolean;
  startingDoseGuidance: string;
  monitoringPlan: string;
  clinicalNotes: string[];
  filingText: string;
  accurxTemplateSuggestion?: string;
}

export function analyzeTft(inputs: TftInputs): TftResult {
  const {
    tsh = 2.5,
    freeT4 = 15.0,
    freeT3 = 4.8,
    tpoAntibodiesPositive = false,
    isPregnantOrPlanning = false,
    isSymptomatic = false,
    age = 50,
    isHospitalDischargeOrAcuteIllness = false,
  } = inputs;

  const tshUpper = 4.5;
  const tshLower = 0.4;
  const ft4Lower = 10.0;
  const ft4Upper = 22.0;

  // Sick euthyroid check
  if (isHospitalDischargeOrAcuteIllness && (freeT4 < ft4Lower || freeT3 < 3.5) && tsh >= tshLower && tsh <= 10) {
    return {
      category: 'sick_euthyroid',
      title: 'Non-Thyroidal Illness / Sick Euthyroid Syndrome',
      levothyroxineTrialIndicated: false,
      startingDoseGuidance: 'Do NOT start thyroid hormone replacement in acute non-thyroidal illness.',
      monitoringPlan: 'Repeat TFTs 6–8 weeks after full clinical recovery from the acute illness.',
      clinicalNotes: [
        'Acute physiological stress suppresses peripheral T4 to T3 conversion and alters pituitary TSH release.',
        'Levothyroxine in this setting does not confer benefit and can be harmful.',
      ],
      filingText: `TFTs: Low FT4 (${freeT4}) with non-elevated TSH in context of recent acute illness/hospital stay. Consistent with Non-Thyroidal Illness (sick euthyroid). No levothyroxine indicated. Plan: Repeat TFTs in 6-8 weeks post-recovery.`,
    };
  }

  // Subclinical Hypothyroidism: TSH elevated, Free T4 normal
  if (tsh > tshUpper && freeT4 >= ft4Lower && freeT4 <= ft4Upper) {
    const isTshAbove10 = tsh >= 10.0;
    const shouldTreat =
      isTshAbove10 ||
      isPregnantOrPlanning ||
      (tsh > tshUpper && isSymptomatic && age < 65) ||
      (tsh > tshUpper && tpoAntibodiesPositive && isSymptomatic);

    let dose = 'None currently indicated.';
    if (shouldTreat) {
      dose =
        age >= 65
          ? 'Start Levothyroxine 25–50 mcg OD (lower dose in elderly or cardiac disease). Re-check TSH in 6–8 weeks.'
          : 'Start Levothyroxine 50 mcg OD (or weight-based ~1.6 mcg/kg). Re-check TSH in 6–8 weeks.';
    }

    const notes: string[] = [];
    if (isPregnantOrPlanning) {
      notes.push('PREGNANCY / CONCEPTION: Treat promptly. Target TSH is < 2.5 mU/L in first trimester to prevent neurocognitive developmental deficits.');
    } else if (tsh < 10) {
      notes.push('NICE NG145: For TSH 4.5–10 mU/L with normal FT4, up to 50% normalize spontaneously. Confirm with 3-month repeat + TPO antibodies before committing to lifelong thyroxine.');
      if (!isSymptomatic) {
        notes.push('Asymptomatic older adults (age >= 65) with TSH < 10 mU/L should NOT be treated (TRUST trial demonstrated no cognitive or functional benefit).');
      }
    } else {
      notes.push('NICE NG145: TSH >= 10 mU/L on two separate occasions warrants a trial of levothyroxine even if asymptomatic.');
    }

    return {
      category: 'subclinical_hypothyroidism',
      title: `Subclinical Hypothyroidism (TSH ${tsh} mU/L, FT4 ${freeT4} pmol/L)`,
      levothyroxineTrialIndicated: shouldTreat,
      startingDoseGuidance: dose,
      monitoringPlan: shouldTreat
        ? 'Repeat TSH in 6–8 weeks and titrate by 25–50 mcg until TSH normalised in reference range.'
        : 'Repeat TSH and FT4 in 3 months with Thyroid Peroxidase (TPO) antibodies.',
      clinicalNotes: notes,
      filingText: `Subclinical hypothyroidism: TSH ${tsh} mU/L, FT4 ${freeT4} pmol/L. ${
        shouldTreat
          ? `Commenced trial of Levothyroxine (${dose}). Repeat TSH in 6-8 weeks.`
          : 'Asymptomatic / TSH < 10. No levothyroxine indicated currently per NICE NG145. Planned 3-month repeat TFTs + TPO antibodies.'
      }`,
      accurxTemplateSuggestion:
        'Your recent blood test showed a slightly raised TSH level (' +
        tsh +
        ' mU/L), but your actual thyroid hormone level (Free T4) is completely normal. In most patients this returns to normal on its own. We will arrange a repeat blood test in 3 months to monitor this. Full NHS thyroid leaflet: https://www.nhs.uk/conditions/underactive-thyroid-hypothyroidism/',
    };
  }

  // Overt Hypothyroidism: TSH elevated, Free T4 low
  if (tsh > tshUpper && freeT4 < ft4Lower) {
    const dose =
      age >= 65
        ? 'Start Levothyroxine 25–50 mcg OD (titrate slowly if ischaemic heart disease).'
        : 'Start Levothyroxine 1.6 mcg/kg OD (typically 50–100 mcg OD).';

    return {
      category: 'overt_hypothyroidism',
      title: `Overt Primary Hypothyroidism (TSH ${tsh} mU/L, Low FT4 ${freeT4} pmol/L)`,
      levothyroxineTrialIndicated: true,
      startingDoseGuidance: dose,
      monitoringPlan: 'Repeat TSH and FT4 in 6–8 weeks. Target is TSH within reference range (0.4–4.0 mU/L).',
      clinicalNotes: [
        'Confirmed primary hypothyroidism: Start levothyroxine therapy.',
        'Take on empty stomach with water, 30–60 minutes before breakfast.',
        'Separate by at least 4 hours from iron tablets, calcium supplements, or antacids.',
      ],
      filingText: `Overt primary hypothyroidism confirmed: TSH ${tsh} mU/L, FT4 ${freeT4} pmol/L. Commenced Levothyroxine ${dose}. Patient educated on administration (fasting, separate from iron/calcium). Repeat TFTs booked in 6-8 weeks.`,
    };
  }

  // Subclinical Hyperthyroidism: TSH low, FT4 normal
  if (tsh < tshLower && freeT4 >= ft4Lower && freeT4 <= ft4Upper) {
    const isSeverelySuppressed = tsh < 0.1;
    return {
      category: 'subclinical_hyperthyroidism',
      title: `Subclinical Hyperthyroidism (Suppressed TSH ${tsh} mU/L, Normal FT4)`,
      levothyroxineTrialIndicated: false,
      startingDoseGuidance: 'No replacement indicated.',
      monitoringPlan: 'Repeat TFTs in 6–8 weeks to confirm persistence.',
      clinicalNotes: [
        isSeverelySuppressed
          ? 'TSH < 0.1 mU/L: Associated with increased risk of atrial fibrillation, all-cause mortality, and accelerated osteoporosis (especially post-menopausal women). Check ECG and consider endocrine referral.'
          : 'TSH 0.1–0.4 mU/L: Mild suppression; monitor TFTs every 3–6 months.',
      ],
      filingText: `Subclinical hyperthyroidism: TSH ${tsh} mU/L (suppressed), FT4 normal (${freeT4} pmol/L). ${
        isSeverelySuppressed ? 'Baseline ECG reviewed for AF. ' : ''
      }Repeat TFTs arranged in 6-8 weeks to check for spontaneous resolution vs autonomous nodule/Graves.`,
    };
  }

  return {
    category: 'euthyroid',
    title: `Euthyroid Profile (TSH ${tsh} mU/L, FT4 ${freeT4} pmol/L)`,
    levothyroxineTrialIndicated: false,
    startingDoseGuidance: 'Thyroid function is completely normal.',
    monitoringPlan: 'No routine monitoring indicated unless new clinical features emerge.',
    clinicalNotes: ['TSH and peripheral hormone levels within target UK reference ranges.'],
    filingText: `TFTs satisfactory: TSH ${tsh} mU/L, FT4 ${freeT4} pmol/L. Normal euthyroid status.`,
  };
}

// ============================================================================
// 5. COMMON INCIDENTAL LAB FINDINGS (Eosinophils, MGUS, Neutropenia)
// ============================================================================

export interface IncidentalFindingsInputs {
  findingType: 'eosinophilia' | 'mgus' | 'neutropenia';
  eosinophilCount?: number; // x10^9/L (normal 0.0 - 0.4)
  paraproteinLevel?: number; // g/L
  paraproteinType?: 'IgG' | 'IgA' | 'IgM' | 'IgD' | 'IgE';
  freeLightChainRatio?: number; // normal 0.26 - 1.65
  hasCrabSymptoms?: boolean; // Calcium, Renal, Anaemia, Bone pain
  neutrophilCount?: number; // x10^9/L (normal 2.0 - 7.5)
  ethnicity?: 'african_caribbean_middle_east' | 'other';
  isTakingCarbimazoleOrMethotrexate?: boolean;
  hasRecentViralIllness?: boolean;
}

export interface IncidentalFindingsResult {
  title: string;
  riskCategory: 'low' | 'moderate' | 'high_red_flag';
  differentialDiagnoses: string[];
  immediateActions: string[];
  referralCriteria: string;
  filingText: string;
}

export function analyzeIncidentalFindings(inputs: IncidentalFindingsInputs): IncidentalFindingsResult {
  const {
    findingType,
    eosinophilCount = 0.8,
    paraproteinLevel = 8,
    paraproteinType = 'IgG',
    freeLightChainRatio = 1.0,
    hasCrabSymptoms = false,
    neutrophilCount = 1.4,
    ethnicity = 'other',
    isTakingCarbimazoleOrMethotrexate = false,
    hasRecentViralIllness = false,
  } = inputs;

  if (findingType === 'eosinophilia') {
    const isMild = eosinophilCount >= 0.5 && eosinophilCount <= 1.5;
    const isModerateOrSevere = eosinophilCount > 1.5;

    return {
      title: `Eosinophilia (${eosinophilCount} × 10⁹/L)`,
      riskCategory: isModerateOrSevere ? 'high_red_flag' : 'moderate',
      differentialDiagnoses: [
        'Allergic / Atopic disease (asthma, eczema, allergic rhinitis - commonest UK primary care cause)',
        'Drug hypersensitivity (Antibiotics, NSAIDs, Allopurinol, Anticonvulsants)',
        'Parasitic infection (Strongyloidiasis, Schistosomiasis - especially if travel to tropics/sub-tropics)',
        'Haematological / Hypereosinophilic syndrome (HES) or systemic vasculitis (EGPA / Churg-Strauss)',
      ],
      immediateActions: [
        'Review atopic history and recent medications for new triggers.',
        'If foreign travel history (especially sub-Saharan Africa, South America, Asia): request Stool for Ova, Cysts & Parasites + Strongyloides and Schistosoma serology.',
        isMild
          ? 'If asymptomatic and mild (< 1.5): review medications, treat atopy, and repeat FBC in 4–6 weeks.'
          : 'Marked eosinophilia (> 1.5 × 10⁹/L): Screen for end-organ damage (troponin, ECG, chest X-ray, renal function). Urgent haematology referral if persistent > 3 months or systemic symptoms.',
      ],
      referralCriteria:
        'Urgent Haematology referral if eosinophils > 1.5 × 10⁹/L persistent on repeat, or concurrent systemic symptoms (fever, weight loss, organomegaly, rash, cardiopulmonary symptoms).',
      filingText: `Eosinophilia noted (${eosinophilCount} x10^9/L). Atopic and travel history reviewed. Medication list audited. Planned repeat FBC in 4-6 weeks to assess persistence. Safety netting advice provided for systemic red flags.`,
    };
  }

  if (findingType === 'mgus') {
    const isHighRisk =
      hasCrabSymptoms ||
      (paraproteinType === 'IgG' && paraproteinLevel >= 15) ||
      (paraproteinType !== 'IgG' && paraproteinLevel >= 10) ||
      paraproteinType === 'IgD' ||
      paraproteinType === 'IgE' ||
      (freeLightChainRatio && (freeLightChainRatio < 0.26 || freeLightChainRatio > 1.65));

    return {
      title: `Monoclonal Gammopathy Triage (${paraproteinType} ${paraproteinLevel} g/L)`,
      riskCategory: isHighRisk ? 'high_red_flag' : 'low',
      differentialDiagnoses: [
        'Monoclonal Gammopathy of Undetermined Significance (MGUS - 3% of adults > 50yo)',
        'Multiple Myeloma / Smouldering Myeloma',
        'AL Amyloidosis',
        'Waldenström Macroglobulinaemia (if IgM paraprotein)',
      ],
      immediateActions: [
        'Screen for CRAB features: Calcium (hypercalcaemia), Renal function (AKI/CKD), Anaemia (normocytic normochromic), Bone pain (especially back/rib pain or pathological fractures).',
        'Check Urine Bence Jones protein / Serum Free Light Chain ratio.',
        isHighRisk
          ? 'HIGH RISK CRITERIA MET: Urgent 2WW Haematology referral for suspected myeloma.'
          : 'LOW RISK MGUS: Repeat paraprotein, FBC, Calcium, and U&E in 3–4 months. If stable, transition to annual primary care surveillance.',
      ],
      referralCriteria:
        'Refer via 2WW if: CRAB symptoms present, paraprotein >= 15 g/L (IgG) or >= 10 g/L (IgA/IgM), abnormal Free Light Chain ratio, or progressive increase on monitoring.',
      filingText: `Paraprotein band identified: ${paraproteinType} ${paraproteinLevel} g/L. FLC ratio = ${freeLightChainRatio}. CRAB symptoms screened: Calcium normal, Renal stable, Hb normal, no bony pain. ${
        isHighRisk
          ? 'Meets criteria for Haematology 2WW review.'
          : 'Consistent with low-risk MGUS. Plan: 3-month surveillance bloods (FBC, U&E, Bone profile, Paraprotein).'
      }`,
    };
  }

  if (findingType === 'neutropenia') {
    const isSevere = neutrophilCount < 1.0;
    const isBenignEthnic =
      ethnicity === 'african_caribbean_middle_east' &&
      neutrophilCount >= 1.0 &&
      neutrophilCount <= 1.8;

    return {
      title: `Neutropenia Triage (${neutrophilCount} × 10⁹/L)`,
      riskCategory: isSevere || isTakingCarbimazoleOrMethotrexate ? 'high_red_flag' : 'moderate',
      differentialDiagnoses: [
        'Benign Ethnic Neutropenia (BEN / Duffy-null phenotype) - completely normal physiological variant',
        'Drug-induced neutropenia (Carbimazole, Methotrexate, Sulfasalazine, Clozapine, Chemotherapy)',
        'Post-viral bone marrow suppression (EBV, CMV, COVID, Viral hepatitis)',
        'Autoimmune neutropenia / Felty’s syndrome',
        'Haematological malignancy / Myelodysplasia',
      ],
      immediateActions: [
        isTakingCarbimazoleOrMethotrexate
          ? 'CRITICAL ALERT: Patient taking Carbimazole / Methotrexate with neutropenia. STOP DRUG IMMEDIATELY. Urgent same-day clinical assessment; warn patient regarding fever, sore throat, or sepsis symptoms.'
          : isBenignEthnic
          ? 'Benign Ethnic Neutropenia: If Hb, platelets, and blood film are normal and patient has no recurrent severe bacterial infections, this is a physiological variant. Avoid unnecessary haematology referrals.'
          : hasRecentViralIllness
          ? 'Transient post-viral neutropenia: Repeat FBC in 4–6 weeks to verify marrow recovery.'
          : 'Repeat FBC with peripheral blood film in 2–4 weeks.',
      ],
      referralCriteria:
        'Urgent Haematology review if: Neutrophils < 1.0 × 10⁹/L, concurrent cytopenias (bicytopenia / pancytopenia), lymphadenopathy, splenomegaly, or unexplained constitutional symptoms.',
      filingText: `Marginal neutropenia (${neutrophilCount} x10^9/L). ${
        isBenignEthnic
          ? 'African/Caribbean/Middle Eastern heritage: consistent with Benign Ethnic Neutropenia. Other cell lines normal. No recurrent infections.'
          : hasRecentViralIllness
          ? 'Recent viral illness: likely transient marrow suppression. Planned 4-week FBC repeat.'
          : 'Medication list checked for bone marrow suppressants. FBC repeat booked in 2-4 weeks.'
      } Patient warned to seek urgent emergency care if fever, rigors, or sore throat develop.`,
    };
  }

  return {
    title: 'Incidental Lab Finding',
    riskCategory: 'low',
    differentialDiagnoses: [],
    immediateActions: [],
    referralCriteria: '',
    filingText: 'Blood result reviewed and filed as satisfactory.',
  };
}
