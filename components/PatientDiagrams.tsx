'use client';

import React, { useState } from 'react';

interface DiagramProps {
  type: string;
  isTurnScreenFullscreen?: boolean;
}

export function PatientDiagram({ type, isTurnScreenFullscreen = false }: DiagramProps) {
  const [toggleState, setToggleState] = useState<'normal' | 'pathology'>('pathology');

  switch (type) {
    case 'eustachian_tube':
      return <EustachianTubeDiagram toggleState={toggleState} onToggle={setToggleState} isFullscreen={isTurnScreenFullscreen} />;
    case 'lumbar_radiculopathy':
      return <LumbarRadiculopathyDiagram toggleState={toggleState} onToggle={setToggleState} isFullscreen={isTurnScreenFullscreen} />;
    case 'osteo_vs_rheumatoid':
      return <OsteoVsRheumatoidDiagram toggleState={toggleState} onToggle={setToggleState} isFullscreen={isTurnScreenFullscreen} />;
    case 'gout_crystals':
      return <GoutCrystalsDiagram toggleState={toggleState} onToggle={setToggleState} isFullscreen={isTurnScreenFullscreen} />;
    case 'eczema_barrier':
      return <EczemaBarrierDiagram toggleState={toggleState} onToggle={setToggleState} isFullscreen={isTurnScreenFullscreen} />;
    case 'asthma_airway':
      return <AsthmaAirwayDiagram toggleState={toggleState} onToggle={setToggleState} isFullscreen={isTurnScreenFullscreen} />;
    case 'viral_vs_bacterial':
      return <ViralVsBacterialDiagram toggleState={toggleState} onToggle={setToggleState} isFullscreen={isTurnScreenFullscreen} />;
    default:
      return null;
  }
}

// 1. EUSTACHIAN TUBE & MIDDLE EAR EFFUSION DIAGRAM
function EustachianTubeDiagram({
  toggleState,
  onToggle,
  isFullscreen,
}: {
  toggleState: 'normal' | 'pathology';
  onToggle: (state: 'normal' | 'pathology') => void;
  isFullscreen: boolean;
}) {
  const isEffusion = toggleState === 'pathology';

  return (
    <div className="flex flex-col items-center w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
      {/* Interactive Toggle Pill */}
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Interactive Ear Anatomy
          </span>
        </div>
        <div className="inline-flex rounded-lg p-1 bg-slate-800 border border-slate-700">
          <button
            type="button"
            onClick={() => onToggle('normal')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              !isEffusion ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Healthy Ventilated Ear
          </button>
          <button
            type="button"
            onClick={() => onToggle('pathology')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              isEffusion ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Glue Ear (Trapped Fluid)
          </button>
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div className={`relative w-full ${isFullscreen ? 'h-[360px]' : 'h-[280px]'} flex items-center justify-center`}>
        <svg viewBox="0 0 700 360" className="w-full h-full max-h-full drop-shadow-lg">
          <defs>
            <linearGradient id="fluidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.85" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Outline: Outer Ear Canal */}
          <path
            d="M 50 140 C 130 145, 180 150, 240 150 L 240 230 C 180 230, 130 235, 50 240"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="4"
          />
          <text x="90" y="190" fill="#94a3b8" fontSize="13" fontWeight="bold">
            Outer Ear Canal (Open air)
          </text>

          {/* Tympanic Membrane (Eardrum) */}
          <line
            x1="240"
            y1="140"
            x2="240"
            y2="240"
            stroke={isEffusion ? '#f59e0b' : '#38bdf8'}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {isEffusion && (
            <path
              d="M 240 140 Q 255 190 240 240"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="4"
              strokeDasharray="4 4"
            />
          )}

          {/* Middle Ear Cavity (Box) */}
          <rect
            x="240"
            y="120"
            width="200"
            height="140"
            rx="16"
            fill={isEffusion ? 'url(#fluidGrad)' : '#0f172a'}
            stroke={isEffusion ? '#f59e0b' : '#38bdf8'}
            strokeWidth="4"
          />

          {/* 3 Ossicles (Hearing Bones) */}
          <g stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" fill="none">
            {/* Malleus (Hammer) */}
            <line x1="244" y1="180" x2="280" y2="160" />
            {/* Incus (Anvil) */}
            <line x1="280" y1="160" x2="320" y2="165" />
            {/* Stapes (Stirrup) */}
            <line x1="320" y1="165" x2="350" y2="185" />
            <circle cx="350" cy="185" r="7" fill="#cbd5e1" />
          </g>

          {/* Eustachian Tube (Slanted pipe going down to throat) */}
          <path
            d="M 400 240 C 430 270, 480 300, 560 320"
            fill="none"
            stroke={isEffusion ? '#ef4444' : '#10b981'}
            strokeWidth={isEffusion ? '6' : '12'}
            strokeLinecap="round"
          />
          {/* Constriction indicator if effusion */}
          {isEffusion && (
            <g>
              <line x1="465" y1="270" x2="485" y2="295" stroke="#ef4444" strokeWidth="5" />
              <line x1="485" y1="270" x2="465" y2="295" stroke="#ef4444" strokeWidth="5" />
              <text x="495" y="290" fill="#f87171" fontSize="12" fontWeight="bold">
                BLOCKED VENTILATION TUBE
              </text>
            </g>
          )}

          {/* Fluid bubbles if glue ear */}
          {isEffusion && (
            <g fill="#fef08a" opacity="0.8">
              <circle cx="280" cy="230" r="8" />
              <circle cx="315" cy="240" r="5" />
              <circle cx="360" cy="235" r="10" />
              <circle cx="390" cy="225" r="6" />
              <circle cx="265" cy="210" r="4" />
              <text x="260" y="215" fill="#18181b" fontSize="11" fontWeight="extrabold">
                TRAPPED GLUE FLUID
              </text>
            </g>
          )}

          {/* Inner Ear (Cochlea - snail shape) */}
          <path
            d="M 440 170 Q 480 150 510 180 Q 520 210 490 220 Q 470 215 480 190 Q 490 185 495 195"
            fill="none"
            stroke="#a855f7"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <text x="525" y="195" fill="#d8b4fe" fontSize="12" fontWeight="bold">
            Inner Ear (Cochlea to Brain)
          </text>

          {/* Text Labels & Callouts */}
          <text x="180" y="115" fill={isEffusion ? '#f59e0b' : '#38bdf8'} fontSize="13" fontWeight="bold">
            Eardrum (Intact Door)
          </text>
          <text x="265" y="145" fill="#f8fafc" fontSize="12" fontWeight="semibold">
            {isEffusion ? 'Vacuum Suction' : 'Free Air Cavity'}
          </text>
          <text x="470" y="340" fill="#94a3b8" fontSize="12">
            Back of Throat / Nasopharynx
          </text>
        </svg>
      </div>

      {/* Visual Analogy Explainer Bar */}
      <div className="w-full mt-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">🥤</span>
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-amber-400 text-sm block mb-0.5">
            Why Antibiotics Won&apos;t Drain This:
          </strong>
          The fluid is trapped behind an intact, unbroken eardrum by physical suction (like your thumb covering a drinking straw). It is not an active bacterial infection. Taking antibiotics will not break the vacuum! Chewing, yawning, and time allow the ventilation pipe to open.
        </div>
      </div>
    </div>
  );
}

// 2. LUMBAR RADICULOPATHY (SCIATICA) DIAGRAM
function LumbarRadiculopathyDiagram({
  toggleState,
  onToggle,
  isFullscreen,
}: {
  toggleState: 'normal' | 'pathology';
  onToggle: (state: 'normal' | 'pathology') => void;
  isFullscreen: boolean;
}) {
  const isHerniated = toggleState === 'pathology';

  return (
    <div className="flex flex-col items-center w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            L4/L5 & L5/S1 Spine & Nerve Root
          </span>
        </div>
        <div className="inline-flex rounded-lg p-1 bg-slate-800 border border-slate-700">
          <button
            type="button"
            onClick={() => onToggle('normal')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              !isHerniated ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Healthy Disc & Free Nerve
          </button>
          <button
            type="button"
            onClick={() => onToggle('pathology')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              isHerniated ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Disc Herniation & Pinched Nerve
          </button>
        </div>
      </div>

      <div className={`relative w-full ${isFullscreen ? 'h-[360px]' : 'h-[280px]'} flex items-center justify-center`}>
        <svg viewBox="0 0 700 360" className="w-full h-full max-h-full drop-shadow-lg">
          {/* L4 Vertebra Body */}
          <rect x="180" y="40" width="160" height="60" rx="10" fill="#334155" stroke="#64748b" strokeWidth="4" />
          <text x="235" y="75" fill="#f8fafc" fontSize="15" fontWeight="bold">L4 Bone</text>

          {/* Intervertebral Disc Pad */}
          <rect
            x="180"
            y="110"
            width={isHerniated ? "195" : "160"}
            height="50"
            rx="12"
            fill={isHerniated ? "#be123c" : "#0284c7"}
            stroke={isHerniated ? "#f43f5e" : "#38bdf8"}
            strokeWidth="4"
          />
          <text x="220" y="140" fill="#ffffff" fontSize="13" fontWeight="bold">
            {isHerniated ? "Bulging Jelly Disc" : "Healthy Disc (Cushion)"}
          </text>

          {/* Herniation Bud pushing into nerve space */}
          {isHerniated && (
            <path
              d="M 340 120 C 375 125, 385 145, 340 155 Z"
              fill="#f43f5e"
              stroke="#fb7185"
              strokeWidth="3"
            />
          )}

          {/* L5 Vertebra Body */}
          <rect x="180" y="170" width="160" height="60" rx="10" fill="#334155" stroke="#64748b" strokeWidth="4" />
          <text x="235" y="205" fill="#f8fafc" fontSize="15" fontWeight="bold">L5 Bone</text>

          {/* Spinal Cord / Thecal Sac (Central yellow column) */}
          <rect x="375" y="30" width="40" height="230" rx="8" fill="#eab308" opacity="0.3" stroke="#facc15" strokeWidth="3" />
          <text x="382" y="20" fill="#fef08a" fontSize="11" fontWeight="bold">Spinal Canal</text>

          {/* Exiting Sciatic Nerve Root */}
          <path
            d={isHerniated ? "M 380 125 C 385 135, 410 145, 430 180 C 460 230, 480 320, 520 350" : "M 390 125 C 415 140, 440 180, 470 240 C 490 280, 500 320, 520 350"}
            fill="none"
            stroke={isHerniated ? "#f43f5e" : "#facc15"}
            strokeWidth={isHerniated ? "8" : "6"}
            strokeLinecap="round"
          />

          {/* Pinched / Inflamed Flash on Nerve */}
          {isHerniated && (
            <g>
              <circle cx="380" cy="138" r="14" fill="#ef4444" opacity="0.75" />
              <text x="410" y="125" fill="#f87171" fontSize="12" fontWeight="extrabold">
                ⚡ PINCHED NERVE ROOT
              </text>
              <text x="430" y="142" fill="#fda4af" fontSize="10">
                (Chemical irritation & pressure)
              </text>
            </g>
          )}

          {/* Sciatic Nerve Radiating to Leg Annotation */}
          <path d="M 470 250 L 580 250" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" />
          <text x="500" y="240" fill={isHerniated ? "#fca5a5" : "#fef08a"} fontSize="12" fontWeight="bold">
            Sciatic Track to Buttock,
          </text>
          <text x="500" y="258" fill={isHerniated ? "#fca5a5" : "#fef08a"} fontSize="12" fontWeight="bold">
            Calf & Sole of Foot ⚡
          </text>

          {/* Sponge Nutrition Arrow */}
          <g>
            <path d="M 120 135 L 165 135" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrow)" />
            <text x="60" y="130" fill="#7dd3fc" fontSize="11" fontWeight="bold">
              Walking Pumps
            </text>
            <text x="60" y="145" fill="#7dd3fc" fontSize="11" fontWeight="bold">
              Water In (Imbibition)
            </text>
          </g>
        </svg>
      </div>

      <div className="w-full mt-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">🚶</span>
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-purple-400 text-sm block mb-0.5">
            Why Bed Rest is Harmful:
          </strong>
          Spinal discs have no direct blood supply—they act like living sponges that ONLY absorb healing nutrients and water when you walk and gently move (&quot;sponge pumping&quot;). Strict bed rest dries out the disc, weakens core stabilizing muscles, and increases nerve sensitivity.
        </div>
      </div>
    </div>
  );
}

// 3. OSTEOARTHRITIS VS RHEUMATOID ARTHRITIS DIAGRAM
function OsteoVsRheumatoidDiagram({
  toggleState,
  onToggle,
  isFullscreen,
}: {
  toggleState: 'normal' | 'pathology';
  onToggle: (state: 'normal' | 'pathology') => void;
  isFullscreen: boolean;
}) {
  const [activeType, setActiveType] = useState<'oa' | 'ra'>('oa');

  return (
    <div className="flex flex-col items-center w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Joint Cartilage & Synovium Comparison
          </span>
        </div>
        <div className="inline-flex rounded-lg p-1 bg-slate-800 border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveType('oa')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              activeType === 'oa' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Osteoarthritis (Active Repair)
          </button>
          <button
            type="button"
            onClick={() => setActiveType('ra')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              activeType === 'ra' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rheumatoid (Immune Synovitis)
          </button>
        </div>
      </div>

      <div className={`relative w-full ${isFullscreen ? 'h-[360px]' : 'h-[280px]'} flex items-center justify-center`}>
        <svg viewBox="0 0 700 360" className="w-full h-full max-h-full drop-shadow-lg">
          {/* Normal Joint on Left */}
          <g>
            <text x="80" y="30" fill="#38bdf8" fontSize="14" fontWeight="bold">
              HEALTHY JOINT
            </text>
            {/* Top Bone */}
            <path d="M 90 50 L 170 50 L 180 120 C 180 135, 80 135, 80 120 Z" fill="#334155" stroke="#64748b" strokeWidth="3" />
            {/* Thick Blue Articular Cartilage */}
            <path d="M 80 120 C 80 135, 180 135, 180 120 L 180 135 C 180 150, 80 150, 80 135 Z" fill="#38bdf8" />
            <text x="45" y="145" fill="#7dd3fc" fontSize="10" fontWeight="bold">
              Thick Cartilage (Shock absorber)
            </text>

            {/* Clear Joint Space */}
            <rect x="70" y="152" width="120" height="20" fill="#0284c7" opacity="0.2" rx="4" />
            <text x="85" y="167" fill="#bae6fd" fontSize="11">
              Synovial Fluid (&quot;Lotion&quot;)
            </text>

            {/* Bottom Bone Cartilage */}
            <path d="M 80 190 C 80 175, 180 175, 180 190 L 180 175 C 180 160, 80 160, 80 175 Z" fill="#38bdf8" />
            {/* Bottom Bone */}
            <path d="M 80 190 C 80 175, 180 175, 180 190 L 170 260 L 90 260 Z" fill="#334155" stroke="#64748b" strokeWidth="3" />
          </g>

          {/* Vertical Separator */}
          <line x1="320" y1="20" x2="320" y2="340" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Condition Joint on Right (OA vs RA) */}
          <g>
            <text x="400" y="30" fill={activeType === 'oa' ? '#fbbf24' : '#f87171'} fontSize="14" fontWeight="bold">
              {activeType === 'oa' ? 'OSTEOARTHRITIS (Living Repair)' : 'RHEUMATOID ARTHRITIS (Immune Attack)'}
            </text>

            {/* Top Bone with osteophytes if OA */}
            {activeType === 'oa' ? (
              <path
                d="M 440 50 L 520 50 L 530 115 C 555 125, 540 135, 530 130 C 510 132, 450 132, 430 130 C 420 135, 405 125, 430 115 Z"
                fill="#334155"
                stroke="#d97706"
                strokeWidth="3"
              />
            ) : (
              <path
                d="M 440 50 L 520 50 L 525 110 C 535 120, 520 130, 515 125 L 445 125 Z"
                fill="#334155"
                stroke="#e11d48"
                strokeWidth="3"
              />
            )}

            {/* Cartilage: Thin & frayed in OA, eroded in RA */}
            {activeType === 'oa' ? (
              <path d="M 435 130 C 460 133, 500 133, 525 130 L 520 138 C 490 139, 470 139, 440 138 Z" fill="#f59e0b" />
            ) : (
              <path d="M 450 125 C 470 128, 490 128, 510 125 Z" fill="#ef4444" opacity="0.6" />
            )}

            {/* Bone spur annotation for OA */}
            {activeType === 'oa' && (
              <g>
                <text x="545" y="125" fill="#fbbf24" fontSize="11" fontWeight="bold">
                  ⚡ Osteophyte (Bone Spur)
                </text>
                <text x="545" y="140" fill="#fde68a" fontSize="10">
                  Bone widens to spread weight
                </text>
              </g>
            )}

            {/* Pannus & Synovial Swelling for RA */}
            {activeType === 'ra' && (
              <g fill="#ef4444" opacity="0.85">
                {/* Thick red inflamed pannus lining */}
                <ellipse cx="420" cy="155" rx="14" ry="25" />
                <ellipse cx="540" cy="155" rx="14" ry="25" />
                <text x="558" y="155" fill="#fca5a5" fontSize="11" fontWeight="bold">
                  🔥 Inflamed Pannus
                </text>
                <text x="558" y="170" fill="#fca5a5" fontSize="10">
                  Autoimmune synovial swelling
                </text>
              </g>
            )}

            {/* Narrowed joint space in OA */}
            <rect x="440" y="140" width="80" height={activeType === 'oa' ? "6" : "26"} fill={activeType === 'oa' ? "#78350f" : "#be123c"} opacity="0.5" />

            {/* Bottom Bone */}
            <path d="M 440 170 L 450 240 L 510 240 L 520 170 Z" fill="#334155" stroke={activeType === 'oa' ? '#d97706' : '#e11d48'} strokeWidth="3" />
          </g>
        </svg>
      </div>

      <div className="w-full mt-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">⚙️</span>
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-amber-400 text-sm block mb-0.5">
            Motion is Lotion (Demystifying &quot;Wear &amp; Tear&quot;):
          </strong>
          Your joint is not a car tire grinding down; cartilage is living tissue that feeds on movement. Walking squeezes in synovial fluid like oil in an engine. Losing 1kg of weight takes 4kg of load off your knees. Strengthening the thigh and hip muscles provides shock absorption for the joint!
        </div>
      </div>
    </div>
  );
}

// 4. GOUT & URATE CRYSTALS DIAGRAM
function GoutCrystalsDiagram({
  toggleState,
  onToggle,
  isFullscreen,
}: {
  toggleState: 'normal' | 'pathology';
  onToggle: (state: 'normal' | 'pathology') => void;
  isFullscreen: boolean;
}) {
  const isDissolving = toggleState === 'normal';

  return (
    <div className="flex flex-col items-center w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Joint Urate Crystal Pool & Allopurinol
          </span>
        </div>
        <div className="inline-flex rounded-lg p-1 bg-slate-800 border border-slate-700">
          <button
            type="button"
            onClick={() => onToggle('pathology')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              !isDissolving ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Crystal Buildup & Acute Flare
          </button>
          <button
            type="button"
            onClick={() => onToggle('normal')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              isDissolving ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Allopurinol Dissolving Over Months
          </button>
        </div>
      </div>

      <div className={`relative w-full ${isFullscreen ? 'h-[360px]' : 'h-[280px]'} flex items-center justify-center`}>
        <svg viewBox="0 0 700 360" className="w-full h-full max-h-full drop-shadow-lg">
          {/* Big Toe / Joint Cavity Outline */}
          <path
            d="M 120 180 C 140 100, 260 90, 350 140 C 440 90, 560 100, 580 180 C 560 260, 440 270, 350 220 C 260 270, 140 260, 120 180 Z"
            fill={!isDissolving ? "#881337" : "#0f172a"}
            stroke={!isDissolving ? "#e11d48" : "#0284c7"}
            strokeWidth="4"
          />

          {/* Blood Uric Acid Saturation Meter */}
          <rect x="60" y="30" width="220" height="30" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <rect
            x="62"
            y="32"
            width={!isDissolving ? "200" : "80"}
            height="26"
            rx="6"
            fill={!isDissolving ? "#ef4444" : "#10b981"}
          />
          <text x="75" y="50" fill="#ffffff" fontSize="12" fontWeight="bold">
            {!isDissolving ? "Serum Urate: 450 µmol/L (Overfilled)" : "Target Urate: < 300 µmol/L (Melting Zone)"}
          </text>

          {/* Needle-shaped Urate Crystals */}
          <g stroke={!isDissolving ? "#fef08a" : "#7dd3fc"} strokeWidth={!isDissolving ? "3.5" : "1.5"} opacity={!isDissolving ? "1" : "0.3"}>
            {/* Needles in joint space */}
            <line x1="320" y1="160" x2="360" y2="180" />
            <line x1="335" y1="185" x2="375" y2="165" />
            <line x1="310" y1="190" x2="350" y2="195" />
            <line x1="360" y1="150" x2="380" y2="200" />
            <line x1="290" y1="170" x2="320" y2="185" />
            <line x1="370" y1="180" x2="410" y2="175" />
            <line x1="340" y1="210" x2="370" y2="195" />
          </g>

          {/* White blood cells attacking crystals if flare */}
          {!isDissolving ? (
            <g>
              <circle cx="340" cy="175" r="30" fill="#f43f5e" opacity="0.35" />
              <circle cx="360" cy="185" r="25" fill="#f43f5e" opacity="0.35" />
              <text x="350" y="270" fill="#fda4af" fontSize="14" fontWeight="extrabold" textAnchor="middle">
                🔥 ACUTE INFLAMMATORY FLARE (Neutrophils attacking crystals)
              </text>
            </g>
          ) : (
            <g>
              <text x="350" y="270" fill="#67e8f9" fontSize="13" fontWeight="bold" textAnchor="middle">
                ❄️ Crystals dissolving into blood stream like snow in spring
              </text>
            </g>
          )}

          {/* Central Heating Analogy Callout */}
          <g>
            <rect x="420" y="30" width="240" height="60" rx="10" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            <text x="435" y="52" fill="#38bdf8" fontSize="12" fontWeight="bold">
              Allopurinol / Febuxostat:
            </text>
            <text x="435" y="70" fill="#94a3b8" fontSize="11">
              Acts like central heating melting
            </text>
            <text x="435" y="84" fill="#94a3b8" fontSize="11">
              the snowdrift over 6 to 12 months.
            </text>
          </g>
        </svg>
      </div>

      <div className="w-full mt-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">💎</span>
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-amber-400 text-sm block mb-0.5">
            The Snowdrift &amp; Sugar Bowl Rule:
          </strong>
          Painkillers (Colchicine, NSAIDs) put up an umbrella to stop the pain today, but the crystals are still in the joint! Allopurinol lowers uric acid so the crystal snowbank melts over months. It has no painkilling effect and must be taken continuously for life—never stop during an attack!
        </div>
      </div>
    </div>
  );
}

// 5. ECZEMA BARRIER DIAGRAM
function EczemaBarrierDiagram({
  toggleState,
  onToggle,
  isFullscreen,
}: {
  toggleState: 'normal' | 'pathology';
  onToggle: (state: 'normal' | 'pathology') => void;
  isFullscreen: boolean;
}) {
  const isEczema = toggleState === 'pathology';

  return (
    <div className="flex flex-col items-center w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Skin Barrier: The Brick Wall Analogy
          </span>
        </div>
        <div className="inline-flex rounded-lg p-1 bg-slate-800 border border-slate-700">
          <button
            type="button"
            onClick={() => onToggle('normal')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              !isEczema ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Healthy Sealed Brick Wall
          </button>
          <button
            type="button"
            onClick={() => onToggle('pathology')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              isEczema ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Eczema: Leaky Wall &amp; Fire
          </button>
        </div>
      </div>

      <div className={`relative w-full ${isFullscreen ? 'h-[360px]' : 'h-[280px]'} flex items-center justify-center`}>
        <svg viewBox="0 0 700 360" className="w-full h-full max-h-full drop-shadow-lg">
          {/* Bricks Layer 1 */}
          <g fill="#ea580c" stroke="#fed7aa" strokeWidth="2">
            <rect x="80" y="80" width="100" height="30" rx="4" />
            <rect x="190" y="80" width={isEczema ? "80" : "100"} height="30" rx="4" />
            <rect x={isEczema ? "290" : "300"} y="80" width="100" height="30" rx="4" />
            <rect x={isEczema ? "410" : "410"} y="80" width="100" height="30" rx="4" />
            <rect x={isEczema ? "530" : "520"} y="80" width="90" height="30" rx="4" />
          </g>

          {/* Bricks Layer 2 (Staggered) */}
          <g fill="#ea580c" stroke="#fed7aa" strokeWidth="2">
            <rect x="130" y="120" width="100" height="30" rx="4" />
            <rect x={isEczema ? "250" : "240"} y="120" width={isEczema ? "80" : "100"} height="30" rx="4" />
            <rect x={isEczema ? "350" : "350"} y="120" width="100" height="30" rx="4" />
            <rect x={isEczema ? "470" : "460"} y="120" width="100" height="30" rx="4" />
          </g>

          {/* Bricks Layer 3 */}
          <g fill="#ea580c" stroke="#fed7aa" strokeWidth="2">
            <rect x="80" y="160" width="100" height="30" rx="4" />
            <rect x="190" y="160" width={isEczema ? "85" : "100"} height="30" rx="4" />
            <rect x={isEczema ? "295" : "300"} y="160" width="100" height="30" rx="4" />
            <rect x={isEczema ? "415" : "410"} y="160" width="100" height="30" rx="4" />
            <rect x={isEczema ? "535" : "520"} y="160" width="85" height="30" rx="4" />
          </g>

          {/* Mortar (Lipid fill between bricks) */}
          {!isEczema ? (
            <g>
              <rect x="70" y="70" width="560" height="130" fill="#38bdf8" opacity="0.25" rx="8" />
              <text x="350" y="45" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
                💧 Water Trapped Safely In · 🛡️ Irritants &amp; Soaps Blocked Outside
              </text>
            </g>
          ) : (
            <g>
              {/* Leaking Water Out */}
              <path d="M 275 80 L 275 40" stroke="#38bdf8" strokeWidth="4" strokeDasharray="3 3" />
              <text x="240" y="30" fill="#7dd3fc" fontSize="11" fontWeight="bold">
                Water Leaks Out 💧
              </text>

              {/* Irritants & Soaps leaking in */}
              <path d="M 390 40 L 390 80" stroke="#ef4444" strokeWidth="4" />
              <text x="360" y="30" fill="#f87171" fontSize="11" fontWeight="bold">
                Irritants Leak In 🦠
              </text>

              {/* Fire in Dermis */}
              <rect x="70" y="210" width="560" height="100" fill="#991b1b" opacity="0.4" rx="8" />
              <text x="350" y="250" fill="#fca5a5" fontSize="15" fontWeight="extrabold" textAnchor="middle">
                🔥 IMMUNE INFLAMMATION &amp; ITCH-SCRATCH FIRE
              </text>
              <text x="350" y="275" fill="#fecaca" fontSize="12" textAnchor="middle">
                Topical Steroid puts out the fire; generous Emollient fills in the gaps to rebuild the mortar.
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="w-full mt-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">🧱</span>
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-emerald-400 text-sm block mb-0.5">
            The Two Rules of Eczema Care:
          </strong>
          1. <strong>Steroid cream</strong> is the fire extinguisher (use once daily for 1 to 2 weeks until skin is completely smooth). 2. <strong>Moisturiser (Emollient)</strong> is the cement that repairs the brick wall so the fire cannot restart. Smooth on downwards in the direction of hair growth!
        </div>
      </div>
    </div>
  );
}

// 6. ASTHMA AIRWAY DIAGRAM
function AsthmaAirwayDiagram({
  toggleState,
  onToggle,
  isFullscreen,
}: {
  toggleState: 'normal' | 'pathology';
  onToggle: (state: 'normal' | 'pathology') => void;
  isFullscreen: boolean;
}) {
  const isAsthma = toggleState === 'pathology';

  return (
    <div className="flex flex-col items-center w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Airway Cross-Section: Preventer vs Reliever
          </span>
        </div>
        <div className="inline-flex rounded-lg p-1 bg-slate-800 border border-slate-700">
          <button
            type="button"
            onClick={() => onToggle('normal')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              !isAsthma ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Clear Open Airway
          </button>
          <button
            type="button"
            onClick={() => onToggle('pathology')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              isAsthma ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Asthma (Spasm + Swelling)
          </button>
        </div>
      </div>

      <div className={`relative w-full ${isFullscreen ? 'h-[360px]' : 'h-[280px]'} flex items-center justify-center`}>
        <svg viewBox="0 0 700 360" className="w-full h-full max-h-full drop-shadow-lg">
          {/* Outer Smooth Muscle Ring */}
          <circle cx="350" cy="180" r="140" fill="#334155" stroke={isAsthma ? "#dc2626" : "#64748b"} strokeWidth={isAsthma ? "14" : "6"} />

          {/* Submucosal Layer (Swollen in asthma) */}
          <circle cx="350" cy="180" r="115" fill={isAsthma ? "#f87171" : "#1e293b"} opacity={isAsthma ? "0.9" : "1"} />

          {/* Open Air Lumen */}
          <circle cx="350" cy="180" r={isAsthma ? "45" : "95"} fill="#0284c7" opacity="0.35" stroke="#38bdf8" strokeWidth="4" />

          {/* Mucus plug if asthma */}
          {isAsthma && (
            <path
              d="M 330 150 Q 370 170 340 210 Q 380 200 350 150"
              fill="#fef08a"
              opacity="0.8"
            />
          )}

          {/* Annotations */}
          <text x="350" y="185" fill="#ffffff" fontSize={isAsthma ? "12" : "16"} fontWeight="bold" textAnchor="middle">
            {isAsthma ? "Restricted Airway" : "Wide Open Breathing Pipe"}
          </text>

          {/* Callout Left: Muscle Spasm */}
          <line x1="160" y1="120" x2="230" y2="150" stroke="#f87171" strokeWidth="2" />
          <text x="60" y="105" fill="#fca5a5" fontSize="12" fontWeight="bold">
            1. Tight Muscle Ring (Spasm)
          </text>
          <text x="60" y="122" fill="#cbd5e1" fontSize="10">
            Blue Inhaler relaxes this for 4 hours
          </text>

          {/* Callout Right: Internal Swelling */}
          <line x1="540" y1="120" x2="445" y2="155" stroke="#f87171" strokeWidth="2" />
          <text x="470" y="105" fill="#fbbf24" fontSize="12" fontWeight="bold">
            2. Red Swelling &amp; Sticky Mucus
          </text>
          <text x="470" y="122" fill="#cbd5e1" fontSize="10">
            Preventer Steroid cures this root cause
          </text>
        </svg>
      </div>

      <div className="w-full mt-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">🚒</span>
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-amber-400 text-sm block mb-0.5">
            Fireproofing vs The Fire Extinguisher:
          </strong>
          The <strong>blue inhaler</strong> only opens the clamped muscles like a quick fire extinguisher. The <strong>steroid preventer</strong> is the fireproofing that stops the internal lining from swelling. It must be taken every day even when you feel completely well!
        </div>
      </div>
    </div>
  );
}

// 7. VIRAL VS BACTERIAL ILLNESS DIAGRAM
function ViralVsBacterialDiagram({
  toggleState,
  onToggle,
  isFullscreen,
}: {
  toggleState: 'normal' | 'pathology';
  onToggle: (state: 'normal' | 'pathology') => void;
  isFullscreen: boolean;
}) {
  return (
    <div className="flex flex-col items-center w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Biology of Infection: Why Antibiotics Won&apos;t Cure Viruses
          </span>
        </div>
      </div>

      <div className={`relative w-full ${isFullscreen ? 'h-[360px]' : 'h-[280px]'} flex items-center justify-center`}>
        <svg viewBox="0 0 700 360" className="w-full h-full max-h-full drop-shadow-lg">
          {/* Left: Bacterium with targetable wall */}
          <g>
            <text x="140" y="40" fill="#38bdf8" fontSize="15" fontWeight="bold">
              BACTERIA (e.g. Strep, UTI)
            </text>
            {/* Thick Cell Wall */}
            <rect x="90" y="80" width="180" height="110" rx="40" fill="#0369a1" stroke="#38bdf8" strokeWidth="8" />
            <text x="110" y="140" fill="#ffffff" fontSize="13" fontWeight="bold">
              External Cell Wall
            </text>
            {/* Antibiotic target hammer */}
            <g>
              <line x1="270" y1="100" x2="230" y2="120" stroke="#f59e0b" strokeWidth="6" markerEnd="url(#arrow)" />
              <text x="280" y="105" fill="#fbbf24" fontSize="12" fontWeight="extrabold">
                💊 Antibiotic breaks cell wall!
              </text>
            </g>
          </g>

          {/* Right: Virus inside human cell */}
          <g>
            <text x="430" y="40" fill="#f87171" fontSize="15" fontWeight="bold">
              VIRUS (Cold, Flu, Bronchitis)
            </text>
            {/* Big Human Host Cell */}
            <circle cx="520" cy="170" r="90" fill="#4c0519" opacity="0.6" stroke="#f43f5e" strokeWidth="4" />
            <text x="480" y="110" fill="#fca5a5" fontSize="12" fontWeight="bold">
              Human Body Cell
            </text>
            {/* Tiny virus inside */}
            <circle cx="510" cy="170" r="14" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="540" cy="180" r="10" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="520" cy="200" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <text x="460" y="235" fill="#fef08a" fontSize="11" fontWeight="extrabold">
              Microscopic virus inside cell!
            </text>
            {/* Antibiotic bouncing off */}
            <g>
              <path d="M 390 180 L 420 180" stroke="#f87171" strokeWidth="4" />
              <text x="350" y="165" fill="#f87171" fontSize="11" fontWeight="bold">
                💊 Antibiotic
              </text>
              <text x="350" y="195" fill="#f87171" fontSize="11" fontWeight="bold">
                Bounces off! 🚫
              </text>
            </g>
          </g>
        </svg>
      </div>

      <div className="w-full mt-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">🦠</span>
        <div className="text-xs leading-relaxed text-slate-200">
          <strong className="text-rose-400 text-sm block mb-0.5">
            Software Bugs vs Broken Screws:
          </strong>
          Antibiotics only break external bacterial walls. Viruses live inside your own cells, so antibiotics have zero effect on them—like trying to fix a phone software glitch with a screwdriver! Green mucus is your own white blood cells working, not an antibiotic indicator.
        </div>
      </div>
    </div>
  );
}
