import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, 
  Plus, 
  RotateCcw,
  Compass
} from 'lucide-react';
import GlassCard from './GlassCard';

interface TerrariumProps {
  xp: number;
  onXpChange?: (newXp: number) => void;
}

interface TerrariumPropDetail {
  title: string;
  description: string;
  unlockedAt: string;
  impact: string;
  category: 'Environmental' | 'Social' | 'Governance';
}

export const Terrarium: React.FC<TerrariumProps> = ({ xp, onXpChange }) => {
  const [selectedProp, setSelectedProp] = useState<TerrariumPropDetail | null>(null);

  // Determine current stage based on XP
  // Stage 1: Seedling (0 - 100 XP)
  // Stage 2: Sapling (101 - 300 XP)
  // Stage 3: Solar Ecosystem (301 - 600 XP)
  // Stage 4: Carbon-Neutral Haven (601+ XP)
  let stage = 1;
  let stageName = 'Seedling Dome';
  let stageDesc = 'Your ESG journey has begun. A tiny sprout grows in rich soil.';

  if (xp > 600) {
    stage = 4;
    stageName = 'Carbon-Neutral Haven';
    stageDesc = 'A fully mature living biome, featuring solar & wind energy assets.';
  } else if (xp > 300) {
    stage = 3;
    stageName = 'Solar Oasis';
    stageDesc = 'Lush flowers bloom, insects thrive, and clean solar panels capture energy.';
  } else if (xp > 100) {
    stage = 2;
    stageName = 'Flourishing Sapling';
    stageDesc = 'The sprout grows into a strong sapling, nourished by clean sunlight.';
  }

  // Prop definitions for the click modal
  const propDetails: Record<string, TerrariumPropDetail> = {
    soil: {
      title: 'Rich Organic Soil',
      description: 'The foundation of any healthy ecosystem. Represents the base compliance and core ethical standards of EcoSphere.',
      unlockedAt: 'Level 1 (0 XP)',
      impact: 'Establishes ESG benchmark logging',
      category: 'Governance'
    },
    sprout: {
      title: 'Green Sprout',
      description: 'A delicate organic shoot. Represents your first green steps and reduction of basic office waste.',
      unlockedAt: 'Level 1 (0 XP)',
      impact: 'Reduces landfill waste footprint',
      category: 'Environmental'
    },
    sapling: {
      title: 'Sapling Tree',
      description: 'A growing green tree showing trunk strength and branching leaves. Represents community growth.',
      unlockedAt: 'Level 2 (100 XP)',
      impact: 'Offsets 5kg of CO2 equivalent per month',
      category: 'Environmental'
    },
    sun: {
      title: 'Renewable Solar Glow',
      description: 'A warm light illuminating the dome. Represents social transparency and workplace diversity awareness.',
      unlockedAt: 'Level 2 (150 XP)',
      impact: 'Boosts department morale scores by 8%',
      category: 'Social'
    },
    solarPanel: {
      title: 'Micro Solar Array',
      description: 'Clean energy generation prop. Unlocked by participating in carbon auditing challenges.',
      unlockedAt: 'Level 3 (300 XP)',
      impact: 'Saves 150kWh of green electricity annually',
      category: 'Environmental'
    },
    flowers: {
      title: 'Blooming Social Flora',
      description: 'Bright red and yellow blossoms. Unlocked by completing social volunteering and D&I challenges.',
      unlockedAt: 'Level 3 (450 XP)',
      impact: 'Improves community outreach rating (+12%)',
      category: 'Social'
    },
    windTurbine: {
      title: 'Micro Wind Turbine',
      description: 'A spinning clean energy generator. Represents corporate policy compliance and ethical leadership.',
      unlockedAt: 'Level 4 (600 XP)',
      impact: 'Drives office net-zero goals forward',
      category: 'Governance'
    },
    butterflies: {
      title: 'Golden Monarchs',
      description: 'Sleek butterflies floating inside the biome. Signifies an advanced self-sustaining corporate ecosystem.',
      unlockedAt: 'Level 4 (700 XP)',
      impact: 'Maximized ecosystem employee engagement (+20%)',
      category: 'Social'
    }
  };

  const handlePropClick = (propKey: string) => {
    if (propDetails[propKey]) {
      setSelectedProp(propDetails[propKey]);
    }
  };

  return (
    <GlassCard className="flex flex-col h-full justify-between" glowColor="env">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Living ESG Terrarium
            </span>
            <h3 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
              {stageName}
              <span className="text-xs text-brand-textMuted font-normal">(Stage {stage}/4)</span>
            </h3>
            <p className="text-xs text-brand-textMuted mt-1 max-w-sm">
              {stageDesc}
            </p>
          </div>
          {onXpChange && (
            <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              <button 
                onClick={() => onXpChange(xp + 50)} 
                title="Earn +50 XP"
                className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 hover:scale-105 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => onXpChange(Math.max(0, xp - 50))} 
                title="Subtract -50 XP"
                className="p-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 hover:scale-105 transition-all"
              >
                <span className="text-xs font-bold leading-none">-50</span>
              </button>
              <button 
                onClick={() => onXpChange(150)} 
                title="Reset to Stage 2 (150 XP)"
                className="p-1.5 rounded bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 border border-white/5 hover:scale-105 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* The SVG Terrarium Container */}
        <div className="relative w-full h-[290px] flex items-center justify-center bg-slate-950/40 rounded-2xl border border-white/5 overflow-hidden">
          
          {/* Neon backglow light behind the terrarium */}
          <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl -z-10 animate-pulse-slow" />
          
          <svg viewBox="0 0 320 380" className="w-full h-full max-h-[280px]">
            {/* Definitions for Gradients */}
            <defs>
              <linearGradient id="domeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
                <stop offset="40%" stopColor="rgba(255, 255, 255, 0.02)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
              </linearGradient>
              <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#452c20" />
                <stop offset="100%" stopColor="#1e130e" />
              </linearGradient>
              <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" stopOpacity="0.8"/>
                <stop offset="20%" stopColor="rgba(255,255,255,0.05)" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0)" stopOpacity="0"/>
              </linearGradient>
            </defs>

            {/* Base Stand */}
            <path 
              d="M 60 340 L 260 340 L 240 360 L 80 360 Z" 
              fill="#181e2b" 
              stroke="#2e374a" 
              strokeWidth="2"
            />
            
            {/* Rich Organic Soil (Always Visible) */}
            <ellipse 
              cx="160" 
              cy="330" 
              rx="90" 
              ry="25" 
              fill="url(#soilGrad)" 
              stroke="#583e32" 
              strokeWidth="2.5" 
              className="cursor-pointer hover:brightness-110 transition-all"
              onClick={() => handlePropClick('soil')}
            />

            {/* --- Level 1 Elements --- */}
            {stage === 1 && (
              <g className="cursor-pointer" onClick={() => handlePropClick('sprout')}>
                {/* Sprout Stem */}
                <path 
                  d="M 160 325 C 160 310, 165 300, 172 290" 
                  fill="none" 
                  stroke="#34d399" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  className="animate-sway origin-bottom"
                />
                {/* Leaf Left */}
                <path 
                  d="M 162 308 C 150 305, 145 295, 155 295 C 160 295, 162 305, 162 308" 
                  fill="#10b981" 
                  className="animate-sway"
                />
                {/* Leaf Right */}
                <path 
                  d="M 168 296 C 180 292, 185 282, 175 282 C 170 282, 168 292, 168 296" 
                  fill="#10b981" 
                  className="animate-sway"
                />
              </g>
            )}

            {/* --- Level 2+ Elements --- */}
            {stage >= 2 && (
              <>
                {/* Grass Clusters */}
                <path d="M 90 328 L 85 320 L 92 328 L 96 318 L 98 328" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 220 326 L 217 318 L 222 326 L 226 316 L 229 326" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Growing Tree/Sapling */}
                <g className="cursor-pointer" onClick={() => handlePropClick('sapling')}>
                  {/* Trunk */}
                  <path 
                    d="M 160 328 C 158 300, 152 270, 165 240" 
                    fill="none" 
                    stroke="#854d0e" 
                    strokeWidth="7" 
                    strokeLinecap="round"
                  />
                  {/* Branches */}
                  <path 
                    d="M 160 275 C 145 265, 135 255, 138 245" 
                    fill="none" 
                    stroke="#854d0e" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 162 260 C 175 250, 185 242, 180 232" 
                    fill="none" 
                    stroke="#854d0e" 
                    strokeWidth="4.5" 
                    strokeLinecap="round"
                  />

                  {/* Leaf Canopy (Green Circles with Hover glow) */}
                  <circle cx="165" cy="225" r="24" fill="#047857" opacity="0.9" />
                  <circle cx="138" cy="240" r="16" fill="#10b981" opacity="0.9" />
                  <circle cx="180" cy="228" r="18" fill="#34d399" opacity="0.9" />
                  <circle cx="162" cy="210" r="15" fill="#059669" opacity="0.9" />
                </g>

                {/* Sun Glow */}
                <g className="cursor-pointer" onClick={() => handlePropClick('sun')}>
                  <circle cx="230" cy="90" r="16" fill="rgba(245, 158, 11, 0.2)" className="animate-pulse-slow" />
                  <circle cx="230" cy="90" r="10" fill="#f59e0b" />
                </g>
              </>
            )}

            {/* --- Level 3+ Elements --- */}
            {stage >= 3 && (
              <>
                {/* Solar Panel Prop (Left of soil) */}
                <g 
                  className="cursor-pointer hover:brightness-125 transition-all" 
                  onClick={() => handlePropClick('solarPanel')}
                  transform="translate(85, 305)"
                >
                  {/* Base Stand */}
                  <line x1="15" y1="10" x2="15" y2="22" stroke="#64748b" strokeWidth="3" />
                  {/* Panel Rect */}
                  <polygon points="0,10 30,10 25,0 -5,0" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                  {/* Grid Lines */}
                  <line x1="5" y1="5" x2="20" y2="5" stroke="#38bdf8" strokeWidth="0.8" opacity="0.8" />
                  <line x1="10" y1="0" x2="15" y2="10" stroke="#38bdf8" strokeWidth="0.8" opacity="0.8" />
                </g>

                {/* Blooming Flowers (Right side of soil) */}
                <g className="cursor-pointer animate-sway origin-bottom" onClick={() => handlePropClick('flowers')}>
                  {/* Stem Left */}
                  <path d="M 195 328 Q 192 315 198 308" fill="none" stroke="#059669" strokeWidth="2" />
                  {/* Red Flower */}
                  <circle cx="198" cy="305" r="4.5" fill="#f43f5e" />
                  <circle cx="194" cy="305" r="3" fill="#fda4af" />
                  <circle cx="202" cy="305" r="3" fill="#fda4af" />
                  <circle cx="198" cy="301" r="3" fill="#fda4af" />
                  <circle cx="198" cy="309" r="3" fill="#fda4af" />

                  {/* Stem Right */}
                  <path d="M 206 329 Q 212 318 209 312" fill="none" stroke="#059669" strokeWidth="2" />
                  {/* Amber Flower */}
                  <circle cx="209" cy="310" r="4" fill="#fbbf24" />
                  <circle cx="209" cy="310" r="1.5" fill="#ffffff" />
                </g>
              </>
            )}

            {/* --- Level 4 Elements --- */}
            {stage === 4 && (
              <>
                {/* Micro Wind Turbine (Right background) */}
                <g 
                  className="cursor-pointer" 
                  onClick={() => handlePropClick('windTurbine')}
                  transform="translate(215, 235)"
                >
                  {/* Tower */}
                  <line x1="15" y1="10" x2="15" y2="90" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                  <polygon points="12,90 18,90 22,96 8,96" fill="#64748b" />
                  
                  {/* Spinning Blades Group */}
                  <g className="animate-spin-slow origin-center" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                    <circle cx="15" cy="10" r="3.5" fill="#ffffff" stroke="#475569" strokeWidth="1" />
                    {/* Blade 1 */}
                    <path d="M 15 10 L 15 -22 L 18 -22 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                    {/* Blade 2 */}
                    <path d="M 15 10 L 42 22 L 40 26 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                    {/* Blade 3 */}
                    <path d="M 15 10 L -12 22 L -10 26 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                  </g>
                </g>

                {/* Flying Butterflies (Floating) */}
                <g 
                  className="cursor-pointer animate-float-slow" 
                  onClick={() => handlePropClick('butterflies')}
                >
                  {/* Butterfly 1 */}
                  <g transform="translate(100, 140)">
                    <ellipse cx="0" cy="0" rx="2" ry="6" fill="#ffffff" />
                    <path d="M -2 -3 C -10 -12, -15 -2, -2 2" fill="#e0f2fe" opacity="0.8" stroke="#38bdf8" strokeWidth="0.5"/>
                    <path d="M 2 -3 C 10 -12, 15 -2, 2 2" fill="#e0f2fe" opacity="0.8" stroke="#38bdf8" strokeWidth="0.5"/>
                  </g>
                  {/* Butterfly 2 */}
                  <g transform="translate(205, 120) scale(0.8) rotate(-20)">
                    <ellipse cx="0" cy="0" rx="2" ry="6" fill="#ffffff" />
                    <path d="M -2 -3 C -10 -12, -15 -2, -2 2" fill="#fef3c7" opacity="0.8" stroke="#f59e0b" strokeWidth="0.5"/>
                    <path d="M 2 -3 C 10 -12, 15 -2, 2 2" fill="#fef3c7" opacity="0.8" stroke="#f59e0b" strokeWidth="0.5"/>
                  </g>
                </g>

                {/* Ivy Vines Climbing Glass (Left inside wall) */}
                <path 
                  d="M 68 280 Q 72 230 68 180 T 73 100" 
                  fill="none" 
                  stroke="#047857" 
                  strokeWidth="2.5" 
                  opacity="0.8" 
                  strokeLinecap="round"
                />
                <circle cx="70" cy="240" r="3.5" fill="#10b981" opacity="0.8" />
                <circle cx="67" cy="200" r="3.5" fill="#34d399" opacity="0.8" />
                <circle cx="72" cy="150" r="3.5" fill="#059669" opacity="0.8" />
                <circle cx="69" cy="115" r="3.5" fill="#10b981" opacity="0.8" />
              </>
            )}

            {/* Glowing Particles (Floating up, active based on level) */}
            <g opacity="0.75" className="animate-float">
              <circle cx="110" cy="200" r="1.5" fill="#38bdf8" />
              <circle cx="210" cy="180" r="2" fill="#fbbf24" className="animate-pulse" />
              <circle cx="150" cy="140" r="1.5" fill="#34d399" />
              <circle cx="180" cy="250" r="2" fill="#8b5cf6" />
            </g>

            {/* Glass Dome (Always Overlaid to give glass effect) */}
            <path 
              d="M 70 330 C 70 140, 250 140, 250 330" 
              fill="url(#domeGrad)" 
              stroke="rgba(255, 255, 255, 0.15)" 
              strokeWidth="2.5" 
              pointerEvents="none"
            />

            {/* Sleek Glass Dome Reflection Line */}
            <path 
              d="M 85 300 C 85 160, 235 160, 235 300" 
              fill="none" 
              stroke="url(#glassReflection)" 
              strokeWidth="6" 
              strokeLinecap="round"
              pointerEvents="none"
            />
          </svg>

          {/* Prompt indicating interactive clicking */}
          <div className="absolute bottom-2.5 text-[10px] text-slate-500 flex items-center gap-1 pointer-events-none select-none">
            <Info className="w-3 h-3 text-slate-500" /> Click elements inside the dome to view ESG origins
          </div>
        </div>
      </div>

      {/* Prop Detail Description Drawer / Card Popover */}
      <div className="mt-4 min-h-[92px]">
        <AnimatePresence mode="wait">
          {selectedProp ? (
            <motion.div
              key={selectedProp.title}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-white">{selectedProp.title}</span>
                <span className={`text-[9px] uppercase tracking-widest font-bold ${
                  selectedProp.category === 'Environmental' ? 'text-emerald-400' :
                  selectedProp.category === 'Social' ? 'text-violet-400' : 'text-amber-400'
                }`}>
                  {selectedProp.category}
                </span>
              </div>
              <p className="text-[11px] text-brand-textMuted mt-1 leading-normal">
                {selectedProp.description}
              </p>
              <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-between text-[10px] text-brand-textMuted font-medium">
                <span>Rule: <span className="text-slate-300">{selectedProp.unlockedAt}</span></span>
                <span>Impact: <span className="text-emerald-400">{selectedProp.impact}</span></span>
              </div>
            </motion.div>
          ) : (
            <div className="border border-dashed border-white/5 rounded-xl p-4.5 flex flex-col items-center justify-center text-center h-[92px]">
              <Compass className="w-5 h-5 text-slate-600 mb-1" />
              <span className="text-xs text-slate-500">
                Click any asset (soil, tree, turbine, panel) to view its ESG metadata and real-world compliance impact.
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};
export default Terrarium;
