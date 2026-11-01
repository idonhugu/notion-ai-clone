'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Plus,
  Loader2,
  Stethoscope,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Eye,
  FileText,
  Search,
  ChevronRight,
  Info,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  FolderSync,
} from 'lucide-react';
import {
  PRIMARY_LESIONS,
  SECONDARY_LESIONS,
  CONFIGURATIONS_AND_PATTERNS,
  SKIN_OF_COLOUR_PEARLS,
  DERMOSCOPY_CLUES,
  SAMPLE_DERM_CASES,
  DermCasePreset,
  LesionDescriptor,
} from '@/lib/dermDescriptors';
import { updateDocument, fetchDocumentById, fetchAllDocuments } from '@/lib/api/documents';

interface DermEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocId?: string;
  currentDocTitle?: string;
  currentDocContext?: string;
  onInsertIntoPage?: (markdown: string) => void;
}

const COMMON_SITES = [
  'Face / Nasal Ala',
  'Scalp / Hairline',
  'Neck / Submandibular',
  'Upper Back / Trunk',
  'Anterior Chest / Abdomen',
  'Antecubital / Flexural Folds',
  'Extensor Forearms / Elbows',
  'Palms / Dorsal Hands',
  'Groin / Intertriginous',
  'Lower Legs / Shins',
  'Feet / Soles / Toes',
];

const SYMPTOM_OPTIONS = [
  'Severe Itch (Pruritus)',
  'Mild / Intermittent Itch',
  'Painful / Tender',
  'Bleeding / Fragile',
  'Oozing / Weeping / Crusting',
  'Rapidly Enlarging',
  'Changes in Shape or Color',
  'Completely Asymptomatic',
];

export function DermEvidenceModal({
  isOpen,
  onClose,
  currentDocId,
  currentDocTitle,
  currentDocContext = '',
  onInsertIntoPage,
}: DermEvidenceModalProps) {
  const [activeTab, setActiveTab] = useState<'ai_lens' | 'how_to_describe' | 'dermoscopy'>('ai_lens');

  // Input states
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; label: string }[]>([]);
  const [lesionType, setLesionType] = useState<'lesion' | 'rash' | 'dermoscopy'>('lesion');
  const [anatomicalSite, setAnatomicalSite] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [skinType, setSkinType] = useState('Fitzpatrick Type II');
  const [clinicianNotes, setClinicianNotes] = useState('');
  const [activePreset, setActivePreset] = useState<DermCasePreset | null>(null);

  // Analysis states
  const [isLoading, setIsLoading] = useState(false);
  const [streamedAnalysis, setStreamedAnalysis] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const [insertedToDoc, setInsertedToDoc] = useState(false);
  const [syncedToPres, setSyncedToPres] = useState(false);

  // How to describe search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [nomenclatureCategory, setNomenclatureCategory] = useState<'all' | 'primary' | 'secondary' | 'configuration' | 'soc'>('all');

  // Interactive Glasgow 7-Point Checklist Calculator
  const [sevenPointState, setSevenPointState] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImageUpload = (files: FileList | null, defaultLabel: string = 'Close-up') => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImages((prev) => [
            ...prev,
            {
              id: 'img_' + Math.random().toString(36).substring(2, 9),
              url: e.target!.result as string,
              label: prev.length === 0 ? 'Macro Overview' : defaultLabel,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleApplyPreset = (preset: DermCasePreset) => {
    setActivePreset(preset);
    setAnatomicalSite(preset.site);
    setPatientAge(String(preset.age));
    setDuration(preset.duration);
    setSelectedSymptoms(preset.symptoms);
    setSkinType(preset.skinType);
    setClinicianNotes(preset.clinicalPrompt);

    if (preset.category === 'Dermoscopy') {
      setLesionType('dermoscopy');
    } else if (preset.category === 'Rash') {
      setLesionType('rash');
    } else {
      setLesionType('lesion');
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleStartAnalysis = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setStreamedAnalysis('');
    setCopiedSnippet(false);
    setCopiedFull(false);
    setInsertedToDoc(false);
    setSyncedToPres(false);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const payloadImages = uploadedImages.map((img) => img.url);

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_derm_photo',
          images: payloadImages,
          clinicalData: {
            site: anatomicalSite,
            patientAge,
            duration,
            symptoms: selectedSymptoms,
            skinType,
            lesionType,
            userNotes: clinicianNotes,
            isSampleCase: !!activePreset,
            sampleImageDescription: activePreset ? activePreset.demoImageDescription : undefined,
          },
          context: currentDocContext ? `Active Document: ${currentDocTitle}\n${currentDocContext.substring(0, 1000)}` : '',
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`Derm analysis failed with status ${res.status}`);
      }

      if (!res.body) throw new Error('No streaming body returned');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedAnalysis(accumulated);
      }

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Derm analysis error:', err);
        setStreamedAnalysis(
          `> ⚠️ **Clinical Vision Analysis Notice:** ${err.message || 'Unable to connect to analysis engine. Please try again.'}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyConsultationSnippet = () => {
    if (!streamedAnalysis) return;
    const match = streamedAnalysis.match(/```text\n([\s\S]*?)\n```/);
    const textToCopy = match ? match[1].trim() : streamedAnalysis;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyFullEvidence = () => {
    if (!streamedAnalysis) return;
    navigator.clipboard.writeText(streamedAnalysis);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleInsertToNote = () => {
    if (!streamedAnalysis || !onInsertIntoPage) return;
    onInsertIntoPage(streamedAnalysis);
    setInsertedToDoc(true);
    setTimeout(() => setInsertedToDoc(false), 2000);
  };

  const handleSyncToCommonPresentation = async () => {
    if (!streamedAnalysis) return;
    try {
      const docs = await fetchAllDocuments();
      const commonDocs = docs.filter((d: any) => d.parent_id === '74ae5917-c661-4e8e-b993-d9aa5052185f');

      // Try matching based on impression
      const impressionMatch = streamedAnalysis.match(/### 🎯 Executive Clinical Impression & Triage[\s\S]*?\*\*Primary Clinical Impression:\*\*\s*([^\n]+)/);
      const impressionText = impressionMatch ? impressionMatch[1].toLowerCase() : '';

      let targetDoc = commonDocs.find((d: any) => {
        const t = d.title.toLowerCase();
        return impressionText.includes(t) || t.split(' / ').some((part: string) => impressionText.includes(part));
      });

      // Default to Alopecia, Acne, or Dermatitis if no direct match
      if (!targetDoc) {
        targetDoc = commonDocs.find((d: any) =>
          d.title.toLowerCase().includes('acne') ||
          d.title.toLowerCase().includes('alopecia') ||
          d.title.toLowerCase().includes('dermatitis')
        );
      }

      if (targetDoc) {
        const { document: fullDoc } = await fetchDocumentById(targetDoc.id);
        const existingBlocks = Array.isArray(fullDoc?.content) ? fullDoc.content : [];

        const newBlock = {
          id: typeof crypto !== 'undefined' ? crypto.randomUUID() : 'b-' + Date.now(),
          type: 'bulletListItem',
          props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
          content: [
            { type: 'text', text: `[Derm AI ${new Date().toLocaleDateString('en-GB')}]: `, styles: { bold: true } },
            { type: 'text', text: impressionText ? `${impressionText.substring(0, 180)}...` : 'Dermatology analysis record', styles: {} },
          ],
          children: [],
        };

        await updateDocument(targetDoc.id, {
          content: [...existingBlocks, newBlock],
          updated_at: new Date().toISOString(),
        });

        setSyncedToPres(true);
        setTimeout(() => setSyncedToPres(false), 2500);
      }
    } catch (err) {
      console.error('Failed to sync to common presentation:', err);
    }
  };

  // Glasgow 7-point checklist calculation
  const GLASGOW_CRITERIA = [
    { id: 'size', label: '1. Change in size or new lesion', type: 'major', points: 2 },
    { id: 'shape', label: '2. Irregular shape or outline', type: 'major', points: 2 },
    { id: 'color', label: '3. Irregular colour or variegation', type: 'major', points: 2 },
    { id: 'diameter', label: '4. Largest diameter ≥ 7mm', type: 'minor', points: 1 },
    { id: 'inflammation', label: '5. Inflammation or erythema', type: 'minor', points: 1 },
    { id: 'oozing', label: '6. Oozing, crusting, or bleeding', type: 'minor', points: 1 },
    { id: 'sensation', label: '7. Change in sensation (itch, pain, tingling)', type: 'minor', points: 1 },
  ];

  const toggleGlasgow = (id: string) => {
    setSevenPointState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const glasgowScore = GLASGOW_CRITERIA.reduce((acc, curr) => (sevenPointState[curr.id] ? acc + curr.points : acc), 0);
  const is2WWThreshold = glasgowScore >= 3;

  // Filter descriptors
  const allDescriptors: LesionDescriptor[] = [
    ...PRIMARY_LESIONS,
    ...SECONDARY_LESIONS,
    ...CONFIGURATIONS_AND_PATTERNS,
    ...SKIN_OF_COLOUR_PEARLS,
  ];

  const filteredDescriptors = allDescriptors.filter((item) => {
    if (nomenclatureCategory !== 'all' && item.category !== nomenclatureCategory) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.term.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q) ||
      item.clinicalExamples.toLowerCase().includes(q) ||
      item.examPearl.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  Derm Evidence & Photo Analysis
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50">
                  BAD &bull; PCDS &bull; NICE CKS &bull; 2WW
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Evidence-based lesion & rash analysis, dermoscopy patterns, and standard morphology guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center bg-neutral-200/60 dark:bg-neutral-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('ai_lens')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium ${
                  activeTab === 'ai_lens'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-rose-500" />
                <span>Derm AI Lens</span>
              </button>

              <button
                onClick={() => setActiveTab('how_to_describe')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium ${
                  activeTab === 'how_to_describe'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span className="hidden sm:inline">How to Describe</span>
                <span className="sm:hidden">Describe</span>
              </button>

              <button
                onClick={() => setActiveTab('dermoscopy')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium ${
                  activeTab === 'dermoscopy'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Dermoscopy & 7-Point</span>
                <span className="sm:hidden">7-Point</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: DERM AI LENS */}
          {activeTab === 'ai_lens' && (
            <div className="space-y-6">
              
              {/* Top Banner: Clinical Presets Picker */}
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                      Sample Dermatology Cases & Dermoscopy Demonstrations
                    </span>
                  </div>
                  <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                    Click to load verified clinical scenarios
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SAMPLE_DERM_CASES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`text-left text-xs px-2.5 py-1.5 rounded-lg border transition flex items-center gap-2 ${
                        activePreset?.id === preset.id
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-rose-300 dark:hover:border-rose-700'
                      }`}
                    >
                      <span className="font-semibold text-[11px]">{preset.badge}</span>
                      <span className="opacity-75 text-[10px] hidden md:inline">({preset.site})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Dropzone & Multi-view Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Image Dropzone Area */}
                <div className="md:col-span-6 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-rose-500" />
                      <span>Clinical Images (Overview / Close-up / Dermatoscope)</span>
                    </label>
                    <span className="text-[11px] text-neutral-400">Multiple photos supported</span>
                  </div>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleImageUpload(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-rose-400 dark:hover:border-rose-600 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-neutral-50/50 dark:bg-neutral-900/30 transition min-h-[170px]"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                    </div>

                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Drag & drop dermatology photos, or click to browse
                    </p>
                    <p className="text-[11px] text-neutral-400 mb-3 max-w-xs">
                      Best practice: 1 macro overview photo + 1 close-up + 1 dermatoscope view
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
                      >
                        Choose File
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Capture Photo</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files)}
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files, 'Camera Capture')}
                      />
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 mt-3">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="relative group w-20 h-20 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700 shadow-xs"
                        >
                          <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => removeImage(img.id)}
                              className="p-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
                              title="Remove image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white px-1 py-0.5 truncate text-center">
                            {img.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clinical Context & Presentation Inputs */}
                <div className="md:col-span-6 space-y-3.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Lesion Type */}
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Presentation Format
                      </label>
                      <select
                        value={lesionType}
                        onChange={(e) => setLesionType(e.target.value as any)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="lesion">Solitary / Discrete Lesion</option>
                        <option value="rash">Widespread / Regional Rash</option>
                        <option value="dermoscopy">Dermatoscope (Dermoscopy) View</option>
                      </select>
                    </div>

                    {/* Skin Type */}
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Fitzpatrick Skin Phototype
                      </label>
                      <select
                        value={skinType}
                        onChange={(e) => setSkinType(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Fitzpatrick Type I">Type I (Pale white, always burns)</option>
                        <option value="Fitzpatrick Type II">Type II (Fair, usually burns)</option>
                        <option value="Fitzpatrick Type III">Type III (Medium, sometimes burns)</option>
                        <option value="Fitzpatrick Type IV">Type IV (Olive / Mediterranean / Asian)</option>
                        <option value="Fitzpatrick Type V">Type V (Brown, skin of colour)</option>
                        <option value="Fitzpatrick Type VI">Type VI (Dark brown / Black)</option>
                      </select>
                    </div>
                  </div>

                  {/* Anatomical Site */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Anatomical Location
                    </label>
                    <input
                      type="text"
                      list="sites-list"
                      placeholder="e.g. Upper Back, Right Forearm, Flexural Neck..."
                      value={anatomicalSite}
                      onChange={(e) => setAnatomicalSite(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    />
                    <datalist id="sites-list">
                      {COMMON_SITES.map((site) => (
                        <option key={site} value={site} />
                      ))}
                    </datalist>
                  </div>

                  {/* Age and Duration */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Patient Age (years)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 54"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Duration & Evolution
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 6 months, expanding"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  {/* Symptoms Multi-Chips */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Symptoms & Clinical Features
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SYMPTOM_OPTIONS.map((sym) => {
                        const isSelected = selectedSymptoms.includes(sym);
                        return (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => toggleSymptom(sym)}
                            className={`text-[11px] px-2 py-0.5 rounded-md border transition ${
                              isSelected
                                ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-semibold'
                                : 'bg-neutral-100 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                            }`}
                          >
                            {sym}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clinician's Notes / Free Text */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Clinician Notes / Specific Question
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rule out melanoma vs seborrhoeic keratosis; check 2WW criteria"
                      value={clinicianNotes}
                      onChange={(e) => setClinicianNotes(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Trigger Button */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-200/80 dark:border-neutral-800">
                <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Calibrated to UK BAD, PCDS, and NICE NG12 clinical guidelines</span>
                </div>

                <div className="flex items-center gap-2">
                  {isLoading && (
                    <button
                      type="button"
                      onClick={() => abortControllerRef.current?.abort()}
                      className="px-3 py-1.5 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    >
                      Stop
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStartAnalysis}
                    disabled={isLoading || (uploadedImages.length === 0 && !activePreset && !clinicianNotes)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-600/20 transition cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing with Clinical Vision...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Lesion / Rash with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Streaming Results Container */}
              {(streamedAnalysis || isLoading) && (
                <div ref={resultsRef} className="space-y-4 pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
                  
                  {/* Results Action Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-100/80 dark:bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        Clinical Analysis & Nomenclature Output
                      </span>
                      {isLoading && (
                        <span className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 animate-pulse font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Generating...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Copy e-RS Consultation Note */}
                      <button
                        onClick={handleCopyConsultationSnippet}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
                        title="Copy consultation & e-RS referral note"
                      >
                        {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSnippet ? 'Copied e-RS Note' : 'Copy e-RS Note'}</span>
                      </button>

                      {/* Copy Full Evidence */}
                      <button
                        onClick={handleCopyFullEvidence}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
                        title="Copy full clinical report"
                      >
                        {copiedFull ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Full Report</span>
                      </button>

                      {/* Insert to Current Note */}
                      {onInsertIntoPage && (
                        <button
                          onClick={handleInsertToNote}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition border border-rose-200/60 dark:border-rose-900/60"
                          title="Append into active note canvas"
                        >
                          {insertedToDoc ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{insertedToDoc ? 'Inserted!' : 'Insert to Note'}</span>
                        </button>
                      )}

                      {/* Sync into Common Presentation */}
                      <button
                        onClick={handleSyncToCommonPresentation}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 transition border border-purple-200/60 dark:border-purple-900/60"
                        title="Update matching Common Presentation in workspace"
                      >
                        {syncedToPres ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FolderSync className="w-3.5 h-3.5" />}
                        <span>{syncedToPres ? 'Saved to Pres!' : 'Sync to Pres'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Rendered Markdown Body */}
                  <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 prose prose-sm dark:prose-invert max-w-none space-y-3 leading-relaxed text-xs sm:text-sm">
                    {streamedAnalysis ? (
                      <div className="whitespace-pre-wrap font-sans space-y-2">
                        {streamedAnalysis}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-neutral-400 animate-pulse">
                        Examining image morphology, pigment network, and clinical guideline rules...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HOW TO DESCRIBE RASHES & LESIONS (NOMENCLATURE GUIDE) */}
          {activeTab === 'how_to_describe' && (
            <div className="space-y-6">
              
              {/* Educational Intro Banner */}
              <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-purple-950 dark:text-purple-200 mb-1">
                      Standard UK Dermatology Morphology & Nomenclature Guide
                    </h3>
                    <p className="text-xs text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
                      Accurate dermatological description is essential for General Practice consultations, SCA / MRCGP examinations, and e-Referral Service (e-RS) Teledermatology Advice & Guidance. Use this reference to describe primary lesions, secondary changes, configurations, and skin of colour presentations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg text-xs w-full sm:w-auto">
                  <button
                    onClick={() => setNomenclatureCategory('all')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      nomenclatureCategory === 'all'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    All ({allDescriptors.length})
                  </button>
                  <button
                    onClick={() => setNomenclatureCategory('primary')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      nomenclatureCategory === 'primary'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Primary Lesions
                  </button>
                  <button
                    onClick={() => setNomenclatureCategory('secondary')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      nomenclatureCategory === 'secondary'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Secondary
                  </button>
                  <button
                    onClick={() => setNomenclatureCategory('configuration')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      nomenclatureCategory === 'configuration'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Patterns
                  </button>
                  <button
                    onClick={() => setNomenclatureCategory('soc')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      nomenclatureCategory === 'soc'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Skin of Colour
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search morphology terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Grid of Descriptors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredDescriptors.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-900/60 hover:border-purple-300 dark:hover:border-purple-800 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {item.term}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {item.definition}
                    </p>

                    <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-lg p-2.5 text-[11px] space-y-1 border border-neutral-200/50 dark:border-neutral-700/50">
                      <div>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">Examples: </span>
                        <span className="text-neutral-600 dark:text-neutral-400">{item.clinicalExamples}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-purple-700 dark:text-purple-400">Exam Pearl: </span>
                        <span className="text-neutral-600 dark:text-neutral-400">{item.examPearl}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DERMOSCOPY CHEATSHEET & GLASGOW 7-POINT CALCULATOR */}
          {activeTab === 'dermoscopy' && (
            <div className="space-y-6">
              
              {/* Interactive Glasgow 7-Point Calculator Card */}
              <div className="border border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                        Glasgow 7-Point Checklist (NICE NG12 Melanoma Screening)
                      </h3>
                      <p className="text-[11px] text-amber-900/80 dark:text-amber-400/80">
                        Check criteria present on clinical exam or dermoscopy
                      </p>
                    </div>
                  </div>

                  {/* Calculated Score Pill */}
                  <div className="text-right">
                    <div
                      className={`text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${
                        is2WWThreshold
                          ? 'bg-red-600 text-white shadow-xs animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      <span>Score: {glasgowScore} / 10</span>
                      {is2WWThreshold ? '• 2WW REFERRAL' : '• Routine / Monitor'}
                    </div>
                  </div>
                </div>

                {/* Criteria Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                  {GLASGOW_CRITERIA.map((crit) => {
                    const isChecked = !!sevenPointState[crit.id];
                    return (
                      <button
                        key={crit.id}
                        type="button"
                        onClick={() => toggleGlasgow(crit.id)}
                        className={`text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition cursor-pointer ${
                          isChecked
                            ? 'bg-amber-100/80 dark:bg-amber-900/40 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-100 font-semibold'
                            : 'bg-white dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                              isChecked
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'border-neutral-400 dark:border-neutral-600'
                            }`}
                          >
                            {isChecked && '✓'}
                          </div>
                          <span>{crit.label}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-medium">
                          +{crit.points} {crit.type}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Score Clinical Action Message */}
                <div
                  className={`p-3 rounded-lg text-xs border flex items-center justify-between ${
                    is2WWThreshold
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {is2WWThreshold ? (
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                    <span>
                      {is2WWThreshold
                        ? 'Score ≥ 3: Suspicion of Malignant Melanoma. Qualifies for urgent 2-Week Wait (2WW) referral under NICE NG12.'
                        : 'Score < 3: Low suspicion of melanoma. Continue routine clinical monitoring or manage benign features.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const summary = `Glasgow 7-Point Checklist: Score ${glasgowScore}/10 (${
                        is2WWThreshold ? '2WW Suspected Melanoma' : 'Low Suspicion'
                      }) | Criteria: ${
                        GLASGOW_CRITERIA.filter((c) => sevenPointState[c.id])
                          .map((c) => c.label)
                          .join('; ') || 'None'
                      }`;
                      navigator.clipboard.writeText(summary);
                    }}
                    className="px-2.5 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-[11px] font-medium hover:bg-neutral-50 transition flex items-center gap-1 flex-shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Score</span>
                  </button>
                </div>
              </div>

              {/* Dermoscopy 2-Step Algorithm & Features Glossary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-rose-500" />
                  <span>Dermoscopy 2-Step Algorithm & Key Clues Dictionary</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {DERMOSCOPY_CLUES.map((clue, idx) => (
                    <div
                      key={idx}
                      className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-900/60 hover:border-amber-300 dark:hover:border-amber-800 transition space-y-2"
                    >
                      <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                        <span>{clue.term}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Dermoscopy
                        </span>
                      </h5>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {clue.definition}
                      </p>
                      <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-lg p-2.5 text-[11px] space-y-1 border border-neutral-200/50 dark:border-neutral-700/50">
                        <div>
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">Examples: </span>
                          <span className="text-neutral-600 dark:text-neutral-400">{clue.clinicalExamples}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-700 dark:text-amber-400">Exam Pearl: </span>
                          <span className="text-neutral-600 dark:text-neutral-400">{clue.examPearl}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
