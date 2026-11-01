/**
 * UK Dermatology Nomenclature, Morphology Guide, and Dermoscopy Clinical Knowledge Base
 * Aligned with BAD (British Association of Dermatologists), PCDS, NICE CKS (NG12, NG198), and DermNet NZ.
 */

export interface LesionDescriptor {
  term: string;
  category: 'primary' | 'secondary' | 'configuration' | 'distribution' | 'dermoscopy' | 'soc';
  definition: string;
  clinicalExamples: string;
  examPearl: string;
}

export const PRIMARY_LESIONS: LesionDescriptor[] = [
  {
    term: 'Macule',
    category: 'primary',
    definition: 'Flat, non-palpable area of altered skin color or pigmentation, < 1 cm in diameter.',
    clinicalExamples: 'Freckles (ephelides), petechiae, junctional naevi, flat viral exanthem macules.',
    examPearl: 'If you close your eyes and run your finger across it, you cannot feel any elevation or depression.',
  },
  {
    term: 'Patch',
    category: 'primary',
    definition: 'Flat, non-palpable area of altered skin color or texture, > 1 cm in diameter.',
    clinicalExamples: 'Vitiligo, melasma, café-au-lait macule, large herald patch in pityriasis rosea.',
    examPearl: 'Larger cousin of the macule. Often displays post-inflammatory hyperpigmentation in skin of colour.',
  },
  {
    term: 'Papule',
    category: 'primary',
    definition: 'Small, solid, elevated lesion < 1 cm in diameter with distinct borders.',
    clinicalExamples: 'Acne comedones/papules, molluscum contagiosum, lichen planus, cherry angioma.',
    examPearl: 'In skin of colour, papules are often violaceous, dark brown, or follicular rather than red.',
  },
  {
    term: 'Plaque',
    category: 'primary',
    definition: 'Elevated, plateau-like superficial lesion > 1 cm in diameter, frequently formed by coalescing papules.',
    clinicalExamples: 'Chronic plaque psoriasis, lichen simplex chronicus, mycosis fungoides.',
    examPearl: 'Has greater surface area than height. Note whether margins are sharp (psoriasis) or indistinct (eczema).',
  },
  {
    term: 'Nodule',
    category: 'primary',
    definition: 'Solid, circumscribed, raised or palpable dermal/subcutaneous lesion > 1 cm with palpable depth.',
    clinicalExamples: 'Basal cell carcinoma, dermatofibroma, rheumatoid nodule, erythema nodosum.',
    examPearl: 'Extends deeper into the dermis or subcutis than a papule; pinch between thumb and index finger to assess depth and tethering.',
  },
  {
    term: 'Wheal (Urtica)',
    category: 'primary',
    definition: 'Transient, edematous, compressible elevated plaque caused by dermal histamine-mediated edema; typically resolves in < 24 hours.',
    clinicalExamples: 'Acute urticaria, dermatographism, physical urticaria, anaphylaxis prodrome.',
    examPearl: 'Key distinguishing feature: individual lesions vanish or migrate within 24 hours without scarring. If lasting > 24 hours, suspect urticarial vasculitis.',
  },
  {
    term: 'Vesicle',
    category: 'primary',
    definition: 'Small, elevated, fluid-filled blister < 0.5 cm containing clear or serous fluid.',
    clinicalExamples: 'Herpes simplex, herpes zoster, chickenpox, dyshidrotic pompholyx, acute contact eczema.',
    examPearl: 'Fragile; easily ruptures into tiny crusted erosions. In eczema herpeticum, suspect monomorphic punched-out umbilicated vesicles.',
  },
  {
    term: 'Bulla',
    category: 'primary',
    definition: 'Large, fluid-filled blister > 0.5 cm in diameter.',
    clinicalExamples: 'Bullous pemphigoid, pemphigus vulgaris, friction blisters, severe bullous impetigo, burns.',
    examPearl: 'Assess blister roof: tense bullae suggest subepidermal split (bullous pemphigoid); flaccid, easily ruptured blisters suggest intraepidermal split (pemphigus vulgaris).',
  },
  {
    term: 'Pustule',
    category: 'primary',
    definition: 'Circumscribed, elevated superficial lesion containing purulent exudate (pus).',
    clinicalExamples: 'Acne pustules, folliculitis, pustular psoriasis, rosacea.',
    examPearl: 'Can be infectious (staphylococcal folliculitis) or sterile (palmoplantar pustulosis, acute generalized exanthematous pustulosis).',
  },
  {
    term: 'Cyst',
    category: 'primary',
    definition: 'Closed, encapsulated sac with a true epithelial lining containing fluid, liquid, or semi-solid keratinous material.',
    clinicalExamples: 'Epidermoid cyst, pilar (trichilemmal) cyst, ganglion cyst.',
    examPearl: 'Epidermoid cysts commonly show a central punctum and are tethered to the epidermis.',
  },
  {
    term: 'Purpura & Petechiae',
    category: 'primary',
    definition: 'Non-blanching macules or patches caused by extravasation of red blood cells into the dermis. Petechiae: < 2 mm; Purpura: 2–10 mm; Ecchymosis: > 1 cm.',
    clinicalExamples: 'Meningococcal septicaemia, Henoch-Schönlein purpura (IgA vasculitis), immune thrombocytopenia (ITP), solar purpura.',
    examPearl: 'ALWAYS perform the glass tumbler / diascopy test. Palpable purpura indicates leukocytoclastic cutaneous vasculitis.',
  },
];

export const SECONDARY_LESIONS: LesionDescriptor[] = [
  {
    term: 'Scale',
    category: 'secondary',
    definition: 'Flakes of dead stratum corneum keratin shedding from the skin surface.',
    clinicalExamples: 'Silvery micaceous scale in psoriasis; greasy yellow scale in seborrhoeic dermatitis; collarette scale in pityriasis rosea.',
    examPearl: 'Look at the type of scale: fine/powdery in tinea versicolor, collarette of inward-facing scale in pityriasis rosea.',
  },
  {
    term: 'Crust',
    category: 'secondary',
    definition: 'Dried residue of serum, blood, or purulent exudate on the skin surface.',
    clinicalExamples: 'Golden "honey-coloured" crusts in impetigo; hemorrhagic crusts in ruptured herpes zoster.',
    examPearl: 'Honey-coloured crust is pathognomonic of non-bullous impetigo (Staphylococcus aureus / Streptococcus pyogenes).',
  },
  {
    term: 'Lichenification',
    category: 'secondary',
    definition: 'Thickening and leathery induration of the skin with accentuated, prominent normal skin surface markings, caused by chronic rubbing or scratching.',
    clinicalExamples: 'Chronic atopic eczema (flexural folds), lichen simplex chronicus.',
    examPearl: 'Classic "itch that rashes". The skin lines become deep and grid-like from persistent mechanical trauma.',
  },
  {
    term: 'Erosion',
    category: 'secondary',
    definition: 'Superficial focal loss of part or all of the epidermis that heals without scarring.',
    clinicalExamples: 'Ruptured vesicle in herpes simplex, superficial excoriation, aphthous ulcer (mucosa).',
    examPearl: 'Because the basement membrane and dermis are preserved, an erosion heals completely without residual fibrous scar.',
  },
  {
    term: 'Ulcer',
    category: 'secondary',
    definition: 'Deeper loss of the epidermis and at least part of the dermis, healing with scar tissue.',
    clinicalExamples: 'Venous leg ulcer, arterial ulcer, neuropathic diabetic ulcer, ulcerated basal cell carcinoma, pyoderma gangrenosum.',
    examPearl: 'Always describe the base (slough, granulation, necrotic), edge (punched-out, sloping, rolled, undermined), and surrounding skin.',
  },
  {
    term: 'Fissure',
    category: 'secondary',
    definition: 'Linear cleavage or crack through the epidermis into the dermis, often sharply defined and painful.',
    clinicalExamples: 'Hand dermatitis/eczema, cracked heels (hyperkeratosis), angular cheilitis, athlete\'s foot interdigital fissures.',
    examPearl: 'Common in areas of thick skin subjected to tension, dryness, and constant flexion.',
  },
  {
    term: 'Excoriation',
    category: 'secondary',
    definition: 'Linear or punctate hollowed-out loss of skin caused by mechanical scratching or digging.',
    clinicalExamples: 'Scabies, neurotic excoriations, atopic eczema, pruritus in chronic kidney disease.',
    examPearl: 'Can produce secondary staphylococcal infection and post-inflammatory pigment change.',
  },
];

export const CONFIGURATIONS_AND_PATTERNS: LesionDescriptor[] = [
  {
    term: 'Annular',
    category: 'configuration',
    definition: 'Ring-shaped with an active elevated border and relative central clearing.',
    clinicalExamples: 'Tinea corporis (ringworm), granuloma annulare, erythema annulare centrifugum.',
    examPearl: 'Differentiate tinea (scale on active leading edge) from granuloma annulare (smooth, non-scaly dermal papules).',
  },
  {
    term: 'Targetoid / Iris',
    category: 'configuration',
    definition: 'Concentric circular rings with a dark or blistered central zone, pale oedematous middle zone, and erythematous outer rim (3 zones).',
    clinicalExamples: 'Erythema multiforme (minor or major), subacute cutaneous LE.',
    examPearl: 'Classic trigger for erythema multiforme is HSV infection 10–14 days prior; atypical target lesions have only 2 zones.',
  },
  {
    term: 'Grouped / Herpetiform',
    category: 'configuration',
    definition: 'Clusters or crops of closely grouped small vesicles or papules on an erythematous base.',
    clinicalExamples: 'Herpes simplex labialis / genitalis, herpes zoster, dermatitis herpetiformis.',
    examPearl: 'Classic "dew drops on a rose petal" presentation.',
  },
  {
    term: 'Linear & Koebner',
    category: 'configuration',
    definition: 'Arranged in a straight line, often indicating external trauma, contact allergen brush (poison ivy), or the Koebner phenomenon.',
    clinicalExamples: 'Psoriasis, lichen planus, vitiligo occurring along scratch lines (Koebner); scabies burrows; phytophotodermatitis.',
    examPearl: 'Koebner phenomenon: appearance of new isomorphic lesions at sites of cutaneous injury or friction.',
  },
  {
    term: 'Dermatomal',
    category: 'configuration',
    definition: 'Following the anatomical distribution of one or more contiguous sensory nerve roots (dermatomes), characteristically unilateral with a sharp midline cut-off.',
    clinicalExamples: 'Herpes zoster (shingles).',
    examPearl: 'If V1 ophthalmic branch of trigeminal nerve is affected, check Hutchinson\'s sign (nasal tip vesicle) indicating urgent eye risk.',
  },
  {
    term: 'Reticular / Livedoid',
    category: 'configuration',
    definition: 'Mottled, fishnet-like, lace-like branching network.',
    clinicalExamples: 'Livedo reticularis, erythema ab igne (laptop / hot water bottle exposure), cutis marmorata.',
    examPearl: 'Reflects stagnation of blood in the peripheral microvascular subpapillary venous plexus.',
  },
  {
    term: 'Guttate',
    category: 'configuration',
    definition: 'Resembling teardrops or small scattered drops across trunk and limbs.',
    clinicalExamples: 'Guttate psoriasis (frequently triggered by streptococcal pharyngitis in young patients).',
    examPearl: 'Check anti-streptolysin O (ASO) titre or throat swab in guttate psoriasis flares.',
  },
];

export const SKIN_OF_COLOUR_PEARLS: LesionDescriptor[] = [
  {
    term: 'The "Erythema Myth"',
    category: 'soc',
    definition: 'Inflammation in richly pigmented skin (Fitzpatrick Types IV–VI) does not present as classic bright pink/red erythema, but as violaceous, dark brown, plum, ashen-grey, or subtly indurated skin.',
    clinicalExamples: 'Eczema, psoriasis, cellulitis, lichen planus.',
    examPearl: 'Always palpate for warmth, edema, and induration rather than relying solely on visual redness.',
  },
  {
    term: 'Post-Inflammatory Hyperpigmentation (PIH)',
    category: 'soc',
    definition: 'Reactive melanocyte hyperactivation following any cutaneous inflammation, resulting in stubborn dark brown or grey-black macules that persist for months or years.',
    clinicalExamples: 'Acne vulgaris, atopic eczema, folliculitis, insect bites.',
    examPearl: 'PIH is often the chief complaint and more distressing to patients than the underlying acne or rash. Address PIH from day one.',
  },
  {
    term: 'Follicular Prominence',
    category: 'soc',
    definition: 'Inflammatory eruptions often display a distinctly follicular, goosebump-like or micro-papular pattern in Black and South Asian skin.',
    clinicalExamples: 'Follicular atopic eczema, sarcoidosis, keratosis pilaris.',
    examPearl: 'Pruritic follicular papules on the trunk and extensor limbs in a child of colour are often eczema rather than keratosis pilaris.',
  },
  {
    term: 'Ashy Dermatosis & Pomade Acne',
    category: 'soc',
    definition: 'Erythema dyschromicum perstans (ashy dermatosis) presents with slate-grey patches; occlusive hair butters/pomades cause forehead hairline comedones.',
    clinicalExamples: 'Hair oil acne along frontal hairline, lichen planus pigmentosus.',
    examPearl: 'Always ask about hair grooming products and cultural oils when reviewing forehead or scalp-margin comedones.',
  },
];

export const DERMOSCOPY_CLUES: LesionDescriptor[] = [
  {
    term: 'Two-Step Algorithm',
    category: 'dermoscopy',
    definition: 'Step 1: Determine if the lesion is melanocytic vs non-melanocytic. Step 2: If melanocytic, determine if benign or melanoma.',
    clinicalExamples: 'Melanocytic: Reticular network, globules, streaks. Non-melanocytic: Milia cysts (seborrhoeic keratosis), arborizing vessels (BCC).',
    examPearl: 'Never apply melanoma ABCD rules to non-melanocytic lesions like seborrhoeic keratoses or angiomas.',
  },
  {
    term: 'Pigment Network (Typical vs Atypical)',
    category: 'dermoscopy',
    definition: 'Honeycomb-like grid of pigmented lines around hypopigmented holes corresponding to rete ridges. Typical: delicate, uniform, fades at periphery. Atypical: thick, darkened, broadened lines with irregular holes, ending abruptly.',
    clinicalExamples: 'Typical in dysplastic/benign naevus; atypical in superficial spreading melanoma.',
    examPearl: 'Abrupt cut-off of an atypical network at the lesion margin is highly suspicious of melanoma.',
  },
  {
    term: 'Arborizing Vessels',
    category: 'dermoscopy',
    definition: 'Sharply focused, bright red, thick branch-like vessels that divide into progressively smaller branches like a tree.',
    clinicalExamples: 'Basal cell carcinoma (nodular or superficial).',
    examPearl: 'Hallmark feature of Basal Cell Carcinoma. Look also for ulceration and blue-grey ovoid nests.',
  },
  {
    term: 'Milia-like Cysts & Comedo Openings',
    category: 'dermoscopy',
    definition: 'Milia-like cysts: small round, shiny white-yellow cloudy spots. Comedo-like openings: dark brown/black round or irregular crateriform plugs.',
    clinicalExamples: 'Seborrhoeic keratosis.',
    examPearl: 'Combined with a "cerebriform" (brain-like) gyri and sulci pattern, confirms benign seborrhoeic keratosis.',
  },
  {
    term: 'Blue-White Veil',
    category: 'dermoscopy',
    definition: 'Confluent, irregular blue-grey pigment covered by an overlying hazy ground-glass white veil.',
    clinicalExamples: 'Invasive melanoma, Spitz naevus (rare).',
    examPearl: 'Corresponds histologically to heavy melanin in the deep dermis under an orthokeratotic, acanthotic epidermis. Strong indicator of invasive melanoma.',
  },
  {
    term: 'Dotted & Polymorphous Vessels',
    category: 'dermoscopy',
    definition: 'Pinpoint tiny red dots. If uniform across entire plaque: psoriasis or clear cell acanthoma. If irregular, clustered, or combined with linear vessels (polymorphous): amelanotic or hypomelanotic melanoma.',
    clinicalExamples: 'Psoriasis (regular distributed dotted vessels); Amelanotic melanoma (polymorphous vessels + milky red areas).',
    examPearl: 'A pink, non-pigmented lesion with polymorphous vessels (dots + curves + serpents) is amelanotic melanoma until proven otherwise.',
  },
  {
    term: 'Glasgow 7-Point Checklist',
    category: 'dermoscopy',
    definition: 'Major (2 pts each): 1. Change in size/new lesion; 2. Irregular shape/outline; 3. Irregular colour. Minor (1 pt each): 4. Diameter >= 7mm; 5. Inflammation; 6. Oozing/crusting; 7. Sensation change. Score >= 3 -> Suspected Melanoma 2WW.',
    clinicalExamples: 'NICE NG12 melanoma referral criterion in primary care.',
    examPearl: 'A lesion with 2 major criteria (score 4) or 1 major + 1 minor (score 3) meets urgent 2WW referral thresholds.',
  },
];

export interface DermCasePreset {
  id: string;
  title: string;
  category: 'Lesion' | 'Rash' | 'Dermoscopy' | 'Skin of Colour';
  badge: string;
  description: string;
  site: string;
  age: number;
  duration: string;
  symptoms: string[];
  skinType: string;
  clinicalPrompt: string;
  demoImageDescription: string;
  sampleImageUrl?: string;
}

export const SAMPLE_DERM_CASES: DermCasePreset[] = [
  {
    id: 'case_melanoma',
    title: 'Atypical Pigmented Lesion on Back (Dermoscopy)',
    category: 'Dermoscopy',
    badge: 'Suspected Melanoma',
    description: '54yo male with an evolving pigmented lesion on upper back. Wife noticed darkening and border irregularity over past 6 months.',
    site: 'Upper Back',
    age: 54,
    duration: '6 months',
    symptoms: ['Mild pruritus', 'Enlarging', 'Darkening colour'],
    skinType: 'Fitzpatrick Type II',
    clinicalPrompt: 'Analyze this dermoscopy image of an evolving pigmented back lesion in a 54yo male. Check ABCDE, 7-point checklist, and 2WW referral criteria.',
    demoImageDescription: 'Asymmetric 8mm pigmented macule with irregular notched borders, variegation with 3 distinct shades (light tan, dark brown, slate-grey), peripheral atypical pigment network ending abruptly, and a central blue-white veil.',
  },
  {
    id: 'case_eczema_soc',
    title: 'Pruritic Flexural Rash in Skin of Colour',
    category: 'Skin of Colour',
    badge: 'Atopic Eczema',
    description: '19yo female of South Asian heritage presenting with recurrent itchy rash in antecubital fossae and neck, with marked dark marks.',
    site: 'Antecubital Fossae & Neck',
    age: 19,
    duration: '3 months',
    symptoms: ['Severe pruritus', 'Worse at night', 'Flaking', 'Post-inflammatory marks'],
    skinType: 'Fitzpatrick Type IV',
    clinicalPrompt: 'Assess this flexural rash in a 19yo female with Fitzpatrick Type IV skin. Describe morphology without relying on erythema, and address post-inflammatory hyperpigmentation.',
    demoImageDescription: 'Bilateral antecubital fossae showing poorly demarcated, violaceous to hyperpigmented indurated plaques with prominent lichenification and fine scaling. No bright redness visible. Surrounding areas show significant post-inflammatory hyperpigmentation.',
  },
  {
    id: 'case_sebk',
    title: 'Stuck-on Waxy Plaque on Chest',
    category: 'Lesion',
    badge: 'Seborrhoeic Keratosis',
    description: '68yo female concerned about a dark, rough lesion on anterior chest that catches on clothing.',
    site: 'Anterior Chest',
    age: 68,
    duration: '2 years',
    symptoms: ['Catches on clothes', 'Asymptomatic otherwise'],
    skinType: 'Fitzpatrick Type III',
    clinicalPrompt: 'Differentiate this stuck-on waxy chest plaque from nodular melanoma and pigmented BCC using non-melanocytic dermoscopic criteria.',
    demoImageDescription: '12mm well-circumscribed, oval, waxy, verrucous brownish plaque with a characteristic "stuck-on" appearance. Dermoscopy reveals prominent milia-like cysts, multiple comedo-like openings, and brain-like cerebriform fissures with sharp demarcations.',
  },
  {
    id: 'case_bcc',
    title: 'Pearly Nodule with Telangiectasia on Nose',
    category: 'Lesion',
    badge: 'Basal Cell Carcinoma',
    description: '72yo retired gardener presenting with a slow-growing translucent lesion on nasal ala that occasionally bleeds after washing.',
    site: 'Nasal Ala / Face',
    age: 72,
    duration: '14 months',
    symptoms: ['Intermittent bleeding', 'Painless', 'Slow growth'],
    skinType: 'Fitzpatrick Type I',
    clinicalPrompt: 'Examine this facial lesion for classic basal cell carcinoma features, dermoscopic vascular pattern, and recommend appropriate NHS primary care vs 2WW referral action.',
    demoImageDescription: '6mm pearly, translucent pinkish nodule with a rolled, rounded border and central shallow depression. Prominent arborizing (tree-branching) telangiectatic vessels crossing the lesion surface into the center.',
  },
  {
    id: 'case_tinea',
    title: 'Expanding Annular Plaque on Forearm',
    category: 'Rash',
    badge: 'Tinea Corporis',
    description: '32yo gym enthusiast presenting with an itchy expanding ring on right forearm. Applied hydrocortisone from home for 2 weeks with minimal improvement.',
    site: 'Right Forearm',
    age: 32,
    duration: '4 weeks',
    symptoms: ['Itchy', 'Expanding outward', 'Worsened by topical steroid'],
    skinType: 'Fitzpatrick Type II',
    clinicalPrompt: 'Evaluate this annular lesion on the forearm. Differentiate tinea corporis from granuloma annulare and pityriasis rosea, noting the effect of prior topical steroid use (tinea incognito).',
    demoImageDescription: '4cm solitary annular plaque on the extensor right forearm with a raised, inflammatory erythematous scaly active leading edge and relative central clearing with slight post-inflammatory hyperpigmentation. Several tiny peripheral pustules.',
  },
];
