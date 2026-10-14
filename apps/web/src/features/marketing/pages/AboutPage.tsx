import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import { BACKEND_URL } from '../../../config/env';

const API_BASE_URL = `${BACKEND_URL}/api`;

/* ─── Animation ─────────────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const Section = ({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref} id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ─── India Scenes — layered vector illustrations with subtle motion ─── */

const Skin = '#C68E5E';
const SkinShade = '#A8714A';
const Hair = '#1C1511';

// Shared motion styles (disabled for reduced-motion users)
const SceneStyles = () => (
  <style>{`
    @keyframes xs-drift { from { transform: translateX(-30px); } to { transform: translateX(40px); } }
    @keyframes xs-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    @keyframes xs-twinkle { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
    @keyframes xs-rise { 0% { transform: translateY(0); opacity: 0; } 25% { opacity: .7; } 100% { transform: translateY(-16px); opacity: 0; } }
    @keyframes xs-glow { 0%,100% { opacity: .85; } 50% { opacity: 1; } }
    @keyframes xs-sway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
    @keyframes xs-shoot { 0% { transform: translate(0,0); opacity: 0; } 4% { opacity: 1; } 14% { transform: translate(-110px,60px); opacity: 0; } 100% { opacity: 0; } }
    @keyframes xs-flutter { 0%,100% { transform: translate(0,0); } 25% { transform: translate(8px,-6px); } 50% { transform: translate(-4px,-10px); } 75% { transform: translate(-9px,-2px); } }
    .xs-drift { animation: xs-drift 18s ease-in-out infinite alternate; }
    .xs-drift2 { animation: xs-drift 24s ease-in-out infinite alternate-reverse; }
    .xs-bob { animation: xs-bob 4s ease-in-out infinite; }
    .xs-twinkle { animation: xs-twinkle 3s ease-in-out infinite; }
    .xs-rise { animation: xs-rise 3s ease-out infinite; }
    .xs-glow { animation: xs-glow 5s ease-in-out infinite; }
    .xs-sway { animation: xs-sway 5s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 0; }
    .xs-shoot { animation: xs-shoot 14s linear infinite; }
    .xs-flutter { animation: xs-flutter 4s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .xs-drift,.xs-drift2,.xs-bob,.xs-twinkle,.xs-rise,.xs-glow,.xs-sway,.xs-shoot,.xs-flutter { animation: none !important; }
    }
  `}</style>
);

const Grain = ({ id }: { id: string }) => (
  <>
    <defs>
      <radialGradient id={`${id}-vig`} cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.6" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity="0.22"/>
      </radialGradient>
    </defs>
    <rect width="600" height="300" fill={`url(#${id}-vig)`} pointerEvents="none"/>
  </>
);

// A reusable face: neck, head, ear, nose hint, eyes, smile
const Face = ({ r = 19, mood = 1, brow = true }: { r?: number; mood?: number; brow?: boolean }) => (
  <g>
    <rect x={-r * 0.28} y={r * 0.7} width={r * 0.56} height={r * 0.7} fill={SkinShade}/>
    <circle cx={-r} cy="1" r={r * 0.2} fill={SkinShade}/><circle cx={r} cy="1" r={r * 0.2} fill={SkinShade}/>
    <circle cx="0" cy="0" r={r} fill={Skin}/>
    <path d={`M${-r * 0.1} ${r * 0.05} q${r * 0.12} ${r * 0.3} ${r * 0.0} ${r * 0.34}`} stroke={SkinShade} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    <circle cx={-r * 0.38} cy={-r * 0.05} r={r * 0.09} fill="#1B120D"/><circle cx={r * 0.38} cy={-r * 0.05} r={r * 0.09} fill="#1B120D"/>
    {brow && <path d={`M${-r * 0.55} ${-r * 0.3} q${r * 0.17} ${-r * 0.12} ${r * 0.34} 0 M${r * 0.21} ${-r * 0.3} q${r * 0.17} ${-r * 0.12} ${r * 0.34} 0`} stroke={Hair} strokeWidth="1.6" strokeLinecap="round" fill="none"/>}
    <path d={`M${-r * 0.32} ${r * 0.42} q${r * 0.32} ${r * 0.28 * mood} ${r * 0.64} 0`} stroke="#6B3E22" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
  </g>
);

// Scene 1 — Farmer at sunrise: terraced fields, bullock cart, village, drifting birds
const FarmerScene = () => (
  <svg viewBox="0 0 600 300" fill="none" className="w-full block" role="img" aria-label="A farmer working in terraced fields at sunrise, a village and bullock cart behind him">
    <SceneStyles/>
    <defs>
      <linearGradient id="fs-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F4B97A"/><stop offset="0.35" stopColor="#F9D6A0"/><stop offset="0.7" stopColor="#FCEBC8"/><stop offset="1" stopColor="#FFF7E6"/>
      </linearGradient>
      <radialGradient id="fs-sun" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#FFF6D8"/><stop offset="0.35" stopColor="#FBD27A" stopOpacity="0.9"/><stop offset="1" stopColor="#F6C76A" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="fs-ray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF2C9" stopOpacity="0.45"/><stop offset="1" stopColor="#FFF2C9" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="fs-f1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6DB28B"/><stop offset="1" stopColor="#4E9B73"/></linearGradient>
      <linearGradient id="fs-f2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3F9068"/><stop offset="1" stopColor="#2E7A58"/></linearGradient>
      <linearGradient id="fs-f3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16A34A"/><stop offset="1" stopColor="#0A5D40"/></linearGradient>
    </defs>
    <rect width="600" height="300" fill="url(#fs-sky)"/>
    <g className="xs-glow"><circle cx="455" cy="118" r="130" fill="url(#fs-sun)"/></g>
    <circle cx="455" cy="118" r="28" fill="#FFE7A8"/>
    {/* god rays */}
    <g opacity="0.8">
      <path d="M455 118 L300 300 L360 300Z" fill="url(#fs-ray)"/><path d="M455 118 L420 300 L480 300Z" fill="url(#fs-ray)"/><path d="M455 118 L540 300 L600 300Z" fill="url(#fs-ray)"/>
    </g>
    {/* clouds */}
    <g className="xs-drift2" fill="#FFF8EA" opacity="0.85">
      <ellipse cx="130" cy="58" rx="46" ry="10"/><ellipse cx="160" cy="50" rx="30" ry="9"/>
    </g>
    <g className="xs-drift" fill="#FFF8EA" opacity="0.7"><ellipse cx="330" cy="40" rx="38" ry="8"/><ellipse cx="352" cy="34" rx="24" ry="7"/></g>
    {/* far hills (hazy) */}
    <path d="M0 170 L70 128 L150 162 L240 112 L330 158 L420 126 L510 160 L600 132 L600 300 L0 300Z" fill="#D9C7B0" opacity="0.55"/>
    <path d="M0 188 L100 148 L200 182 L320 138 L430 184 L520 156 L600 180 L600 300 L0 300Z" fill="#B7CFB8" opacity="0.85"/>
    {/* village: temple + houses + trees */}
    <g transform="translate(60 168)">
      <rect x="0" y="14" width="20" height="14" fill="#E9D3B0"/><path d="M-3 14 L10 4 L23 14Z" fill="#B8553A"/>
      <rect x="26" y="8" width="26" height="20" fill="#F2E3C6"/><path d="M23 8 L39 -4 L55 8Z" fill="#B8553A"/>
      <rect x="60" y="2" width="14" height="26" fill="#EFD9B4"/><path d="M58 2 L67 -22 L76 2Z" fill="#E1B06B"/><circle cx="67" cy="-24" r="2" fill="#C7363B"/>
    </g>
    <g fill="#5C9A74"><circle cx="170" cy="186" r="13"/><circle cx="184" cy="190" r="10"/><circle cx="520" cy="178" r="14"/><circle cx="538" cy="184" r="11"/></g>
    <g fill="#4A7F5F"><rect x="168" y="190" width="4" height="12"/><rect x="518" y="184" width="4" height="12"/></g>
    {/* terraces */}
    <path d="M0 214 Q150 192 300 210 T600 200 L600 300 L0 300Z" fill="url(#fs-f1)"/>
    <path d="M0 236 Q150 218 300 234 T600 226 L600 300 L0 300Z" fill="url(#fs-f2)"/>
    <path d="M0 262 Q150 246 300 262 T600 252 L600 300 L0 300Z" fill="url(#fs-f3)"/>
    {/* crop rows */}
    {[0,1,2].map(r => (
      <g key={r} stroke="#0B5A3E" strokeWidth="1.4" opacity={0.32 - r * 0.06}>
        {Array.from({length: 26}).map((_, i) => <line key={i} x1={14 + i * 24 + r * 8} y1={220 + r * 24} x2={8 + i * 24 + r * 8} y2={232 + r * 24 + 14}/>)}
      </g>
    ))}
    {/* bullock cart in distance */}
    <g transform="translate(395 205)">
      <ellipse cx="14" cy="22" rx="30" ry="3" fill="#0B4F38" opacity="0.3"/>
      <rect x="2" y="8" width="30" height="8" rx="1.5" fill="#8A5A34"/><circle cx="16" cy="19" r="7" fill="none" stroke="#5A3A20" strokeWidth="2"/><path d="M16 12 V26 M9 19 H23" stroke="#5A3A20" strokeWidth="1"/>
      <path d="M-20 16 Q-14 4 -6 6 L2 12 L0 20 L-18 22Z" fill="#E8E2D4"/><path d="M-22 10 q-3 -5 0 -8" stroke="#C9C2B0" strokeWidth="2" strokeLinecap="round"/>
      <path d="M-4 12 L4 12" stroke="#5A3A20" strokeWidth="2"/>
    </g>
    {/* farmer + plough */}
    <g transform="translate(200 160)">
      <ellipse cx="6" cy="98" rx="38" ry="6" fill="#0B4F38" opacity="0.4"/>
      <path d="M-10 52 L-14 96 L-4 96 L0 66 L4 96 L14 96 L10 52Z" fill="#EDE8DA"/>
      <path d="M-14 96 h11 v3 h-11z M4 96 h11 v3 h-11z" fill="#6A4B30"/>
      <path d="M-13 12 Q0 4 13 12 L12 54 L-12 54Z" fill="#F4F0E4"/>
      <path d="M-12 14 L-3 54 L-12 54Z" fill="#E2DCCB"/><path d="M5 20 L10 50" stroke="#DCD5C2" strokeWidth="1.3"/>
      <path d="M-12 50 H12" stroke="#C7363B" strokeWidth="3"/>
      <path d="M7 16 L32 32" stroke={Skin} strokeWidth="6" strokeLinecap="round"/><circle cx="33" cy="33" r="3.8" fill={Skin}/>
      <path d="M-7 16 L-24 30" stroke={SkinShade} strokeWidth="6" strokeLinecap="round"/><circle cx="-25" cy="31" r="3.8" fill={SkinShade}/>
      <g transform="translate(0 -8)">
        <Face r={11} mood={1}/>
        <path d="M-16 -4 Q-17 -22 0 -22 Q17 -22 16 -4 Q8 -11 0 -11 Q-8 -11 -16 -4Z" fill="#D9453B"/>
        <path d="M-16 -4 Q-24 2 -19 8 Q-18 0 -12 -3Z" fill="#B8352C"/>
        <path d="M-12 -14 Q0 -20 12 -14" stroke="#F3C26A" strokeWidth="1.6" fill="none"/>
      </g>
      <path d="M33 33 L80 88" stroke="#6B4A2B" strokeWidth="4" strokeLinecap="round"/>
      <path d="M72 82 L96 90 L76 98Z" fill="#8A929C"/><path d="M72 82 L96 90" stroke="#C9CED6" strokeWidth="1.4"/>
      {/* dust */}
      <g fill="#CBA878" opacity="0.5"><circle cx="86" cy="96" r="2.2"/><circle cx="96" cy="99" r="1.6"/><circle cx="104" cy="94" r="1.3"/></g>
    </g>
    {/* foreground crops */}
    {[22, 70, 118, 470, 520, 568].map((x, i) => (
      <g key={x} transform={`translate(${x} ${286 - (i % 2) * 6})`}>
        <path d="M0 0 V-20" stroke="#0B5A3E" strokeWidth="2"/><path d="M0 -8 q-8 -4 -10 -12 M0 -12 q8 -4 10 -12" stroke="#2F9C70" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <ellipse cx="0" cy="-24" rx="2.6" ry="6" fill="#E3B341"/>
      </g>
    ))}
    {/* birds */}
    <g className="xs-drift" stroke="#4B3C2B" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6">
      <path d="M92 74 q6 -7 12 0 q6 -7 12 0"/><path d="M138 56 q5 -6 10 0 q5 -6 10 0"/><path d="M112 94 q4 -5 8 0 q4 -5 8 0"/>
    </g>
    <Grain id="fs"/>
  </svg>
);

// Scene 2 — Family in the kitchen, evening
const FamilyScene = () => (
  <svg viewBox="0 0 600 300" fill="none" className="w-full block" role="img" aria-label="A family sitting around the kitchen table in the evening, discussing household finances">
    <SceneStyles/>
    <defs>
      <linearGradient id="fm-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2DFBE"/><stop offset="1" stopColor="#E7CB9C"/></linearGradient>
      <radialGradient id="fm-lamp" cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#FFE6A0" stopOpacity="0.9"/><stop offset="0.6" stopColor="#FFE6A0" stopOpacity="0.25"/><stop offset="1" stopColor="#FFE6A0" stopOpacity="0"/></radialGradient>
      <linearGradient id="fm-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F9B87A"/><stop offset="0.6" stopColor="#E8C7D4"/><stop offset="1" stopColor="#9DB6D6"/></linearGradient>
      <pattern id="fm-rug" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M8 0 L16 8 L8 16 L0 8Z" fill="none" stroke="#E9B44C" strokeWidth="1" opacity="0.7"/></pattern>
    </defs>
    <rect width="600" height="300" fill="url(#fm-wall)"/>
    {/* wainscot */}
    <rect y="176" width="600" height="60" fill="#DDBE8C"/><rect y="174" width="600" height="4" fill="#C9A56C"/>
    {/* floor */}
    <rect y="236" width="600" height="64" fill="#A97B4B"/>
    {Array.from({length: 10}).map((_, i) => <path key={i} d={`M${i*66} 236 L${i*66 - 20} 300`} stroke="#936A3F" strokeWidth="1.3" opacity="0.6"/>)}
    <ellipse cx="300" cy="268" rx="210" ry="22" fill="#B2413E"/><ellipse cx="300" cy="268" rx="210" ry="22" fill="url(#fm-rug)"/>
    <ellipse cx="300" cy="268" rx="210" ry="22" stroke="#E9B44C" strokeWidth="2" opacity="0.8"/>
    {/* window at dusk */}
    <rect x="58" y="46" width="112" height="100" rx="3" fill="url(#fm-win)"/>
    <path d="M62 140 L100 104 L128 130 L150 112 L168 128 V142 H62Z" fill="#6C8DA8" opacity="0.7"/>
    <circle cx="140" cy="76" r="9" fill="#FFF3CF" opacity="0.9"/>
    <rect x="58" y="46" width="112" height="100" rx="3" stroke="#8C6A43" strokeWidth="5"/><path d="M114 46 V146 M58 96 H170" stroke="#8C6A43" strokeWidth="3"/>
    <path d="M48 40 H70 V150 Q58 140 48 150Z" fill="#16A34A" opacity="0.85"/><path d="M180 40 H158 V150 Q170 140 180 150Z" fill="#16A34A" opacity="0.85"/>
    {/* wall clock */}
    <circle cx="235" cy="70" r="20" fill="#FFFDF8" stroke="#8C6A43" strokeWidth="3.5"/>
    <path d="M235 70 V56 M235 70 L245 76" stroke="#3A2A1B" strokeWidth="2" strokeLinecap="round"/><circle cx="235" cy="70" r="2" fill="#C7363B"/>
    {/* framed family photo + marigold garland */}
    <rect x="340" y="52" width="46" height="38" rx="2" fill="#FFFDF8" stroke="#8C6A43" strokeWidth="3"/>
    <circle cx="354" cy="68" r="5" fill={Skin}/><circle cx="368" cy="66" r="5" fill={Skin}/><path d="M348 84 q6 -10 12 0 M362 84 q6 -10 12 0" stroke="#16A34A" strokeWidth="3" fill="none"/>
    <path d="M326 46 Q363 62 400 46" stroke="#E9A23C" strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round"/><path d="M326 46 Q363 62 400 46" stroke="#F3C26A" strokeWidth="1.5" strokeDasharray="1 5" strokeLinecap="round"/>
    {/* wall calendar */}
    <rect x="450" y="50" width="62" height="78" rx="3" fill="#FFFDF8" stroke="#D2BF98"/>
    <rect x="450" y="50" width="62" height="17" rx="3" fill="#C7363B"/><circle cx="462" cy="50" r="2" fill="#8F2A2F"/><circle cx="500" cy="50" r="2" fill="#8F2A2F"/>
    {Array.from({length: 15}).map((_, i) => <rect key={i} x={457 + (i % 5) * 10} y={74 + Math.floor(i / 5) * 14} width="7" height="9" rx="1" fill={i === 7 ? '#16A34A' : '#DCCFB2'}/>)}
    {/* shelf with jars */}
    <rect x="510" y="150" width="80" height="5" fill="#7A5230"/>
    <g><rect x="518" y="128" width="16" height="22" rx="3" fill="#E9B44C"/><rect x="540" y="134" width="14" height="16" rx="3" fill="#C7363B"/><rect x="560" y="124" width="18" height="26" rx="3" fill="#F2EEE4" stroke="#CFC8B4"/></g>
    {/* hanging lamp */}
    <path d="M300 0 V44" stroke="#5A3F26" strokeWidth="2"/>
    <path d="M270 82 Q300 30 330 82Z" fill="#16A34A"/><path d="M270 82 H330" stroke="#0B5A3E" strokeWidth="2"/>
    <g className="xs-glow"><ellipse cx="300" cy="190" rx="210" ry="170" fill="url(#fm-lamp)"/><circle cx="300" cy="86" r="7" fill="#FFF3C9"/></g>
    {/* father (left) */}
    <g transform="translate(200 128)">
      <path d="M-36 110 V48 Q-36 26 -12 26 H12 Q36 26 36 48 V110Z" fill="#35527F"/>
      <path d="M-36 110 V64 Q-36 52 -28 48 L-22 110Z" fill="#2C4469"/>
      <path d="M-9 26 L0 44 L9 26Z" fill="#F2EEE4"/><path d="M0 44 V110" stroke="#2C4469" strokeWidth="1.5"/>
      <path d="M24 48 L52 80" stroke="#35527F" strokeWidth="14" strokeLinecap="round"/><circle cx="56" cy="84" r="6" fill={Skin}/>
      <Face r={19} mood={1}/>
      <path d="M-20 -4 Q-20 -24 0 -24 Q20 -24 20 -4 Q12 -14 0 -14 Q-12 -14 -20 -4Z" fill={Hair}/>
      <path d="M-12 14 Q0 22 12 14 Q0 28 -12 14Z" fill={Hair} opacity="0.35"/>
    </g>
    {/* mother (right) */}
    <g transform="translate(400 128)">
      <path d="M-36 110 V48 Q-36 26 -12 26 H12 Q36 26 36 48 V110Z" fill="#16A34A"/>
      <path d="M-36 110 V64 Q-36 52 -28 48 L-22 110Z" fill="#0E6B4A"/>
      <path d="M-34 38 Q-46 80 -30 108 L-18 108 Q-30 72 -22 32Z" fill="#E9B44C"/><path d="M-34 38 Q-46 80 -30 108" stroke="#C48A1D" strokeWidth="2" fill="none"/>
      <path d="M-24 48 L-52 80" stroke="#16A34A" strokeWidth="14" strokeLinecap="round"/><circle cx="-56" cy="84" r="6" fill={Skin}/>
      <path d="M-58 80 v8 M-54 80 v8" stroke="#E9B44C" strokeWidth="1.5"/>
      <Face r={18} mood={1}/>
      <path d="M-19 -2 Q-21 -26 0 -26 Q21 -26 19 -2 Q18 -15 0 -15 Q-18 -15 -19 -2Z" fill={Hair}/>
      <path d="M-4 -20 Q0 -14 4 -20" stroke="#C7363B" strokeWidth="1.8" fill="none"/><circle cx="0" cy="-9" r="2.2" fill="#C7363B"/>
      <circle cx="-18" cy="6" r="2" fill="#E9B44C"/><circle cx="18" cy="6" r="2" fill="#E9B44C"/>
    </g>
    {/* child (centre) */}
    <g transform="translate(300 158)">
      <path d="M-26 90 V44 Q-26 28 -10 28 H10 Q26 28 26 44 V90Z" fill="#E9B44C"/>
      <path d="M-26 90 V54 Q-26 44 -20 42 L-16 90Z" fill="#D49A28"/>
      <Face r={15} mood={1.2}/>
      <path d="M-16 -2 Q-17 -20 0 -20 Q17 -20 16 -2 Q9 -11 0 -11 Q-9 -11 -16 -2Z" fill={Hair}/>
      <circle cx="-9" cy="-19" r="4" fill={Hair}/><circle cx="9" cy="-19" r="4" fill={Hair}/>
    </g>
    {/* table */}
    <rect x="110" y="198" width="380" height="13" rx="3" fill="#7A5230"/><rect x="110" y="198" width="380" height="4" rx="2" fill="#9A6F43"/>
    <rect x="140" y="211" width="10" height="62" fill="#66432A"/><rect x="450" y="211" width="10" height="62" fill="#66432A"/>
    <rect x="110" y="211" width="380" height="5" fill="#000" opacity="0.12"/>
    {/* items on table */}
    <rect x="218" y="182" width="56" height="17" rx="1.5" fill="#FFFDF8" transform="rotate(-4 218 182)"/>
    <path d="M226 188 h38 M226 193 h28" stroke="#B6AE9C" strokeWidth="1.2" strokeLinecap="round" transform="rotate(-4 218 182)"/>
    <rect x="284" y="184" width="48" height="15" rx="2" fill="#F3FBF7" stroke="#16A34A" strokeWidth="1"/>
    <path d="M291 194 l8 -5 l7 3 l9 -7 l9 2" stroke="#16A34A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="344" y="184" width="22" height="15" rx="2.5" fill="#2F3540"/><rect x="347" y="186" width="16" height="4" rx="1" fill="#7BD8B0"/>
    <g fill="#8A929C"><rect x="348" y="192" width="4" height="2"/><rect x="354" y="192" width="4" height="2"/><rect x="360" y="192" width="3" height="2"/></g>
    <path d="M384 199 h22 l-3 -15 h-16z" fill="#FFFDF8"/><path d="M385 189 h20" stroke="#E9B44C" strokeWidth="2"/>
    <g className="xs-rise" stroke="#C9BFA9" strokeWidth="1.4" strokeLinecap="round" fill="none"><path d="M391 180 q-3 -6 1 -11"/></g>
    <g className="xs-rise" style={{ animationDelay: '1.2s' }} stroke="#C9BFA9" strokeWidth="1.4" strokeLinecap="round" fill="none"><path d="M399 180 q-3 -6 1 -11"/></g>
    {/* potted plant */}
    <g transform="translate(34 220)"><path d="M0 0 h26 l-4 34 h-18z" fill="#B8553A"/><path d="M13 0 q-14 -22 -4 -36 q4 14 4 36 M13 0 q10 -20 20 -24 q-2 14 -20 24 M13 0 q-2 -24 6 -38 q4 18 -6 38" fill="#2F9C70"/></g>
    <Grain id="fm"/>
  </svg>
);

// Scene 3 — Student under a streetlight at night
const StudentScene = () => (
  <svg viewBox="0 0 600 300" fill="none" className="w-full block" role="img" aria-label="A student studying under a streetlight at night in a small town">
    <SceneStyles/>
    <defs>
      <linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070E24"/><stop offset="0.6" stopColor="#13264A"/><stop offset="1" stopColor="#25406E"/></linearGradient>
      <linearGradient id="st-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE7A3" stopOpacity="0.6"/><stop offset="1" stopColor="#FFE7A3" stopOpacity="0.05"/></linearGradient>
      <radialGradient id="st-halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF0BE" stopOpacity="0.9"/><stop offset="1" stopColor="#FFF0BE" stopOpacity="0"/></radialGradient>
      <linearGradient id="st-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14213F"/><stop offset="1" stopColor="#0A1228"/></linearGradient>
    </defs>
    <rect width="600" height="300" fill="url(#st-sky)"/>
    {/* milky way band */}
    <path d="M0 120 Q200 40 400 70 T600 20" stroke="#8FA8E0" strokeWidth="46" opacity="0.07" strokeLinecap="round"/>
    {[[48,36],[118,84],[196,26],[262,60],[372,40],[430,92],[528,34],[566,104],[84,128],[470,22],[318,104],[238,112],[150,48],[498,70]].map(([x, y], i) => (
      <circle key={i} className="xs-twinkle" style={{ animationDelay: `${(i % 6) * 0.5}s` }} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.2} fill="#FFFFFF"/>
    ))}
    <g className="xs-shoot"><path d="M470 26 l26 -10" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9"/></g>
    <circle cx="526" cy="68" r="22" fill="#F7EDCF"/><circle cx="537" cy="61" r="20" fill="#13264A"/>
    <circle cx="526" cy="68" r="60" fill="url(#st-halo)" opacity="0.12"/>
    {/* skyline + water tank + temple spire */}
    <g fill="#10204A">
      <rect x="14" y="196" width="44" height="76"/><rect x="64" y="172" width="36" height="100"/><rect x="106" y="204" width="52" height="68"/>
      <rect x="448" y="186" width="46" height="86"/><rect x="498" y="162" width="40" height="110"/><rect x="544" y="198" width="52" height="74"/>
      <rect x="78" y="156" width="10" height="16"/><rect x="72" y="146" width="22" height="10" rx="2"/>
      <path d="M170 272 V214 L178 192 L186 214 V272Z"/>
    </g>
    <g fill="#F6D27A">
      {[[24,208],[38,226],[74,184],[86,208],[114,214],[130,236],[458,200],[472,222],[508,176],[522,200],[554,214],[570,236]].map(([x, y], i) => (
        <rect key={i} className="xs-twinkle" style={{ animationDelay: `${i * 0.37}s` }} x={x} y={y} width="6" height="8" opacity="0.8"/>
      ))}
    </g>
    {/* tea stall silhouette */}
    <g transform="translate(176 232)"><rect x="0" y="12" width="50" height="28" fill="#0C1836"/><path d="M-4 12 L25 0 L54 12Z" fill="#0A1430"/><rect x="8" y="20" width="14" height="10" fill="#F6C860" opacity="0.7"/></g>
    {/* road */}
    <rect y="264" width="600" height="36" fill="url(#st-road)"/><rect y="264" width="600" height="2" fill="#2E4A7C"/>
    <path d="M0 286 H600" stroke="#2E4A7C" strokeWidth="2" strokeDasharray="22 18" opacity="0.5"/>
    {/* streetlight */}
    <path d="M414 264 V86 Q414 66 394 66 H364" stroke="#3E5075" strokeWidth="7" strokeLinecap="round"/>
    <rect x="408" y="236" width="12" height="28" fill="#33456B"/>
    <path d="M344 72 Q364 56 384 72 L378 80 H350Z" fill="#506388"/>
    <path d="M352 80 L240 264 H488 L376 80Z" fill="url(#st-cone)"/>
    <g className="xs-glow"><circle cx="364" cy="82" r="48" fill="url(#st-halo)"/></g>
    <circle cx="364" cy="81" r="5.5" fill="#FFF5D2"/>
    <ellipse cx="364" cy="266" rx="124" ry="9" fill="#FFE7A3" opacity="0.2"/>
    {/* moths */}
    <g className="xs-flutter" fill="#FFF0BE"><circle cx="352" cy="96" r="1.6"/></g>
    <g className="xs-flutter" style={{ animationDelay: '1.3s' }} fill="#FFF0BE"><circle cx="378" cy="104" r="1.4"/></g>
    <g className="xs-flutter" style={{ animationDelay: '2.1s' }} fill="#FFF0BE"><circle cx="368" cy="90" r="1.2"/></g>
    {/* stray dog */}
    <g transform="translate(250 252)"><ellipse cx="14" cy="14" rx="20" ry="3" fill="#000" opacity="0.35"/><path d="M0 12 Q2 0 14 0 Q22 -4 28 2 L32 -4 L34 4 Q30 10 26 12 L26 14 H4Z" fill="#8A6A48"/><circle cx="31" cy="1" r="1" fill="#1A1008"/></g>
    {/* student */}
    <g transform="translate(332 166)">
      <ellipse cx="0" cy="98" rx="52" ry="7" fill="#000" opacity="0.4"/>
      <path d="M-44 96 Q-38 74 -12 70 L26 70 Q48 74 44 96Z" fill="#26406E"/>
      <path d="M-44 96 Q-38 78 -22 74 L-18 96Z" fill="#1D3358"/>
      <path d="M-24 74 Q-26 42 -12 30 H12 Q26 42 24 74Z" fill="#E8A33D"/>
      <path d="M-24 74 Q-26 50 -18 38 L-10 74Z" fill="#CF8A25"/>
      <path d="M-8 30 L0 44 L8 30Z" fill="#F2EEE4"/>
      <g transform="translate(0 10)"><Face r={17} mood={0.6}/></g>
      <path d="M-18 8 Q-22 -14 0 -14 Q22 -14 18 8 Q16 -4 6 -6 Q-8 0 -18 8Z" fill={Hair}/>
      <path d="M-16 24 Q-34 18 -30 0 Q-28 -8 -22 -4 Q-24 10 -14 18Z" fill={Hair}/>
      {/* book + hands */}
      <path d="M-30 56 L0 66 L30 56 L30 84 L0 94 L-30 84Z" fill="#FFFDF8"/><path d="M-30 56 L0 66 V94 L-30 84Z" fill="#F0ECE0"/>
      <path d="M0 66 V94" stroke="#B9BECB" strokeWidth="1.6"/>
      <path d="M-23 63 L-5 69 M-23 70 L-5 76 M-23 77 L-5 83 M5 69 L23 63 M5 76 L23 70 M5 83 L23 77" stroke="#9AA3B5" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="-30" cy="72" r="4.5" fill={Skin}/><circle cx="30" cy="72" r="4.5" fill={SkinShade}/>
      {/* pencil behind ear */}
      <path d="M-18 6 l-6 -10" stroke="#E9B44C" strokeWidth="2" strokeLinecap="round"/>
    </g>
    {/* bag + books + chai glass */}
    <path d="M264 264 Q258 230 278 222 H298 Q316 230 308 264Z" fill="#C7363B"/><path d="M264 264 Q258 236 268 228 L276 264Z" fill="#9E2A2F"/>
    <rect x="276" y="238" width="24" height="10" rx="2" fill="#8F2A2F"/><path d="M278 222 q10 -12 20 0" stroke="#7A2226" strokeWidth="3" fill="none"/>
    <rect x="206" y="256" width="36" height="8" rx="1.5" fill="#16A34A"/><rect x="209" y="248" width="31" height="8" rx="1.5" fill="#5A77AA"/><rect x="212" y="240" width="27" height="8" rx="1.5" fill="#E9B44C"/>
    <rect x="438" y="252" width="8" height="12" rx="1.5" fill="#E8C98A" opacity="0.9"/><g className="xs-rise"><path d="M442 248 q-3 -6 0 -11" stroke="#BFC8DD" strokeWidth="1.3" strokeLinecap="round" fill="none"/></g>
    <Grain id="st"/>
  </svg>
);

// Scene 4 — Kirana shopkeeper
const ShopkeeperScene = () => (
  <svg viewBox="0 0 600 300" fill="none" className="w-full block" role="img" aria-label="A shopkeeper behind the counter of a small-town neighbourhood store">
    <SceneStyles/>
    <defs>
      <linearGradient id="sk-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FCEFD2"/><stop offset="1" stopColor="#EFD8A8"/></linearGradient>
      <radialGradient id="sk-bulb" cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#FFE9A8" stopOpacity="0.85"/><stop offset="1" stopColor="#FFE9A8" stopOpacity="0"/></radialGradient>
    </defs>
    <rect width="600" height="300" fill="url(#sk-bg)"/>
    {/* back wall */}
    <rect x="70" y="84" width="460" height="152" fill="#E7C98F"/><rect x="70" y="84" width="460" height="152" fill="#000" opacity="0.04"/>
    {/* awning */}
    {Array.from({length: 12}).map((_, i) => <path key={i} d={`M${60 + i * 40} 26 h40 v36 q-20 15 -40 0Z`} fill={i % 2 ? '#FFFDF8' : '#C7363B'}/>)}
    <rect x="60" y="18" width="480" height="11" fill="#8F2A2F"/>
    <path d="M60 62 q20 15 40 0 q20 15 40 0 q20 15 40 0 q20 15 40 0 q20 15 40 0 q20 15 40 0 q20 15 40 0 q20 15 40 0 q20 15 40 0 q20 15 40 0 q20 15 40 0 q20 15 40 0" stroke="#000" strokeOpacity="0.12" strokeWidth="2" fill="none"/>
    {/* shelves with goods */}
    {[116, 164, 212].map((y, r) => (
      <g key={y}>
        {Array.from({length: 10}).map((_, i) => {
          const c = ['#16A34A', '#E9B44C', '#C7363B', '#5A77AA', '#F2EEE4', '#8F6FC4'][(i + r * 2) % 6];
          const h = 22 + ((i * 7 + r * 5) % 3) * 6;
          return (
            <g key={i}>
              {i % 4 === 1
                ? <g><rect x={92 + i * 42} y={y - 28} width="28" height="28" rx="5" fill="#F4EAD2" stroke="#CDB98C"/><rect x={90 + i * 42} y={y - 32} width="32" height="6" rx="2" fill="#8A6238"/><rect x={96 + i * 42} y={y - 20} width="20" height="8" fill={c} opacity="0.8"/></g>
                : <g><rect x={96 + i * 42} y={y - h} width="26" height={h} rx="3" fill={c}/><rect x={96 + i * 42} y={y - h} width="26" height="5" rx="2" fill="#000" opacity="0.12"/><rect x={101 + i * 42} y={y - h + 9} width="16" height="6" rx="1" fill="#FFFDF8" opacity="0.7"/></g>}
            </g>
          );
        })}
        <rect x="70" y={y} width="460" height="6" fill="#8A6238"/><rect x="70" y={y + 6} width="460" height="2" fill="#000" opacity="0.12"/>
      </g>
    ))}
    {/* hanging bananas + bulb */}
    <g className="xs-sway" style={{ transformOrigin: '90px 84px' }}><path d="M90 84 V104" stroke="#6B4A2B" strokeWidth="1.5"/><path d="M82 104 q8 22 18 0 q-4 10 -9 12 q-5 -2 -9 -12z" fill="#F0C23B"/><path d="M84 106 q6 16 14 0" stroke="#C59A1C" strokeWidth="1" fill="none"/></g>
    <path d="M300 62 V90" stroke="#5A3F26" strokeWidth="1.5"/><g className="xs-glow"><ellipse cx="300" cy="170" rx="170" ry="120" fill="url(#sk-bulb)"/></g><circle cx="300" cy="94" r="6" fill="#FFF3C9"/>
    {/* hanging sign */}
    <rect x="228" y="72" width="144" height="26" rx="4" fill="#FFFDF8" stroke="#8A6238" strokeWidth="2.5"/>
    <path d="M244 85 h112" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" opacity="0.55"/><circle cx="238" cy="85" r="2" fill="#C7363B"/><circle cx="362" cy="85" r="2" fill="#C7363B"/>
    {/* shopkeeper */}
    <g transform="translate(300 146)">
      <path d="M-38 110 V56 Q-38 32 -14 32 H14 Q38 32 38 56 V110Z" fill="#F2EEE4"/>
      <path d="M-38 110 V70 Q-38 58 -28 54 L-22 110Z" fill="#E0DAC8"/><path d="M0 34 V110" stroke="#D3CCB8" strokeWidth="1.5"/>
      <path d="M-10 32 L0 50 L10 32Z" fill="#CFC8B4"/>
      <circle cx="-4" cy="64" r="1.6" fill="#C7B88F"/><circle cx="-4" cy="80" r="1.6" fill="#C7B88F"/>
      <path d="M-26 52 L-46 86" stroke="#F2EEE4" strokeWidth="13" strokeLinecap="round"/><circle cx="-49" cy="90" r="6" fill={Skin}/>
      <path d="M26 52 L40 80" stroke="#F2EEE4" strokeWidth="13" strokeLinecap="round"/><circle cx="42" cy="84" r="6" fill={SkinShade}/>
      <Face r={21} mood={1.2}/>
      <path d="M-24 -4 Q-24 -22 0 -22 Q24 -22 24 -4 Q12 -10 0 -10 Q-12 -10 -24 -4Z" fill="#FFFDF8" stroke="#D8D0BC" strokeWidth="1"/>
      <path d="M-26 -2 Q0 -14 26 -2 L24 -12 Q0 -28 -24 -12Z" fill="#FFFDF8" stroke="#D8D0BC" strokeWidth="1.2"/>
      <path d="M-20 -10 Q0 -20 20 -10" stroke="#E9DFC6" strokeWidth="1.2" fill="none"/>
      <path d="M-13 12 Q-16 24 -6 26 Q0 28 6 26 Q16 24 13 12 Q6 20 0 20 Q-6 20 -13 12Z" fill="#2A1810" opacity="0.55"/>
      <path d="M-17 -2 q3 -2 6 0 M11 -2 q3 -2 6 0" stroke="#2A1810" strokeWidth="0" fill="none"/>
      <circle cx="-8" cy="-2" r="6.5" stroke="#5A3A20" strokeWidth="1.3"/><circle cx="8" cy="-2" r="6.5" stroke="#5A3A20" strokeWidth="1.3"/><path d="M-1.5 -2 h3" stroke="#5A3A20" strokeWidth="1.3"/>
    </g>
    {/* counter */}
    <rect x="56" y="224" width="488" height="14" rx="3" fill="#7A5230"/><rect x="56" y="224" width="488" height="4" rx="2" fill="#9A6F43"/>
    <rect x="56" y="238" width="488" height="62" fill="#9C6C3E"/>
    {Array.from({length: 8}).map((_, i) => <rect key={i} x={62 + i * 60} y="246" width="52" height="44" rx="2" fill="none" stroke="#7A5230" strokeWidth="2" opacity="0.7"/>)}
    {/* counter items: ledger, calculator, notes, cash box, scale, jars */}
    <rect x="132" y="206" width="66" height="18" rx="2" fill="#B63A3A"/><rect x="136" y="202" width="58" height="18" rx="2" fill="#FFFDF8"/>
    <path d="M144 209 h42 M144 214 h30" stroke="#9AA3B5" strokeWidth="1.4" strokeLinecap="round"/>
    <rect x="216" y="204" width="32" height="20" rx="3" fill="#2F3540"/><rect x="220" y="207" width="24" height="6" rx="1" fill="#7BD8B0"/>
    <g fill="#8A929C">{[0,1,2,3,4,5].map(i => <rect key={i} x={220 + (i % 3) * 8} y={216 + Math.floor(i / 3) * 4} width="5" height="2.4"/>)}</g>
    <g stroke="#16A34A" strokeWidth="1"><rect x="356" y="208" width="36" height="14" rx="1.5" fill="#E7F6EE" transform="rotate(-7 356 208)"/><rect x="370" y="205" width="36" height="14" rx="1.5" fill="#D7F0E3"/></g>
    <circle cx="388" cy="212" r="3.5" stroke="#16A34A" fill="none"/>
    <rect x="428" y="200" width="52" height="24" rx="3" fill="#6B4627"/><rect x="428" y="200" width="52" height="7" rx="3" fill="#8A6238"/><rect x="450" y="206" width="8" height="6" fill="#E9B44C"/>
    <g transform="translate(496 196)"><path d="M0 28 h24" stroke="#5A3A20" strokeWidth="3"/><path d="M12 28 V6 M2 10 h20" stroke="#8A929C" strokeWidth="2"/><path d="M-2 10 q4 6 8 0 M18 10 q4 6 8 0" stroke="#8A929C" strokeWidth="1.5" fill="none"/></g>
    <Grain id="sk"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   ABOUT PAGE — Pure Storytelling, No Selling
   ═══════════════════════════════════════════════════════════ */
const AboutPage = () => {
  const [showContactModal, setShowContactModal] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'About Xtin Capital',
    'description': 'Xtin Capital is building India\'s second freedom movement — financial freedom. Making India wealthy, not just rich.',
    'url': 'https://www.xtincapital.com/about',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'XTIN SERVICES LLP',
      'legalName': 'XTIN SERVICES LLP',
      'alternateName': 'Xtin Capital',
      'foundingDate': '2025',
      'taxID': 'ACR-9371',
      'address': { '@type': 'PostalAddress', 'streetAddress': 'Fl No 705 Building B, Shilp Residency, Vesu', 'addressLocality': 'Surat', 'addressRegion': 'Gujarat', 'postalCode': '395007', 'addressCountry': 'IN' },
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/help/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: null,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save your message');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to send. Please email us directly.');
    }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <SEO
        title="About Us - Our Mission, Vision & Journey"
        description="Xtin Capital is building India's second freedom movement — financial freedom. Making India wealthy, not just rich."
        keywords="about Xtin Capital, financial freedom India, making India wealthy, financial advisory, Xtin Services LLP"
        canonicalUrl="/about"
        structuredData={structuredData}
      />
      <Navbar />

      {/* ═══════════════ CHAPTER 1: THE OPENING ═══════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none bg-brand-soft" />

        <div className="relative max-w-3xl mx-auto px-6 pt-40 pb-20 md:pt-48 md:pb-28 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
            
            <motion.p variants={fadeUp} className="text-brand dark:text-brand font-medium text-sm uppercase tracking-[0.2em] mb-8">
              Our Story
            </motion.p>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-display font-bold leading-[1.08] tracking-[-0.025em] mb-8">
              Making India{' '}
              <span className="text-brand">wealthy</span>,
              <br />
              not just rich.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl md:text-2xl text-gray-400 dark:text-slate-500 leading-relaxed font-light max-w-2xl mx-auto">
              This is not a company story. This is a story about India.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CHAPTER 2: THE FARMER ═══════════════ */}
      <Section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="mb-10 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800">
            <FarmerScene />
          </motion.div>
          
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 leading-relaxed font-light">
              A farmer in Maharashtra works 14 hours a day. He feeds a nation. But nobody ever taught him what to do with the money he earns.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed">
              He doesn't know what a SIP is. He doesn't know that compound interest works while he sleeps. He doesn't know that ₹500 a month, invested wisely, could change his grandchildren's story.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed italic">
              Not because he's not smart enough. Because nobody ever explained it in his language.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ CHAPTER 3: THE FAMILY ═══════════════ */}
      <Section className="py-16 md:py-24 px-6 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="mb-10 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800">
            <FamilyScene />
          </motion.div>
          
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 leading-relaxed font-light">
              A middle-class family in Surat sits around the kitchen table. The father earns ₹40,000 a month. The mother manages every rupee. They argue about school fees, medical bills, and the rising price of dal.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed">
              They have a savings account. That's it. They don't know about EPF calculators, tax-saving ELSS funds, or how to plan for retirement. They're not poor — they're <span className="text-gray-700 dark:text-slate-300 font-medium">under-informed</span>.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed italic">
              The gap between them and financial security isn't money. It's knowledge.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ CHAPTER 4: THE STUDENT ═══════════════ */}
      <Section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="mb-10 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800">
            <StudentScene />
          </motion.div>
          
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 leading-relaxed font-light">
              A college student in a small town studies under a streetlight. She tops her class in engineering. But her college never taught her a single chapter about money.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed">
              She'll graduate, get a job, earn a salary — and still won't know the difference between a fixed deposit and a mutual fund. She'll trust a random YouTube "guru" because that's all she has access to.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed italic">
              India produces millions of brilliant minds every year. We just don't teach them about money.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ CHAPTER 5: THE SHOPKEEPER ═══════════════ */}
      <Section className="py-16 md:py-24 px-6 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="mb-10 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800">
            <ShopkeeperScene />
          </motion.div>
          
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 leading-relaxed font-light">
              A shopkeeper in Varanasi keeps his savings in cash — under the mattress. His father did it. His grandfather did it. Three generations of hard work, eaten by inflation.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed">
              92% of Indians don't invest in the stock market. Not because they can't — because nobody built a bridge between their world and the world of finance.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ THE TURNING POINT ═══════════════ */}
      <Section className="py-24 md:py-32 px-6">
        <motion.div variants={fadeUp} className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-0.5 bg-brand-fill dark:bg-brand-fill mx-auto mb-12 opacity-40" />
          
          <p className="text-sm text-brand dark:text-brand font-medium uppercase tracking-[0.2em] mb-8">The Turning Point</p>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-8 tracking-[-0.025em]">
            India achieved political freedom in 1947.
            <br />
            <span className="text-gray-400 dark:text-slate-500 font-light">The second freedom movement is</span>
            <br />
            <span className="text-brand">financial freedom.</span>
          </h2>
          
          <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto mb-6">
            And that movement won't be led by banks or brokers. It'll be led by education. By clarity. By honesty. By giving every Indian — from the farmer to the engineer to the shopkeeper — the tools and knowledge to take control of their financial future.
          </p>
          
          <p className="text-xl text-gray-700 dark:text-slate-300 font-medium">
            That's why Xtin Capital exists.
          </p>
          
          <div className="w-16 h-0.5 bg-brand-fill dark:bg-brand-fill mx-auto mt-12 opacity-40" />
        </motion.div>
      </Section>

      {/* ═══════════════ OUR BELIEF ═══════════════ */}
      <Section className="py-20 px-6 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center space-y-10">
            <p className="text-sm text-brand dark:text-brand font-medium uppercase tracking-[0.2em]">What We Believe</p>

            <div className="space-y-8">
              {[
                'Finance should be understood, not feared.',
                'Education should never be a luxury.',
                'Technology should serve people, not confuse them.',
                'Wealth is not just about money — it\'s about understanding.',
                'Every Indian deserves access to honest financial guidance.',
              ].map((belief, i) => (
                <motion.p key={i} variants={fadeUp} custom={i} className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 font-light leading-relaxed">
                  "{belief}"
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ WHO WE ARE ═══════════════ */}
      <Section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-sm text-brand dark:text-brand font-medium uppercase tracking-[0.2em] mb-4">Who We Are</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-[-0.025em]">The People Behind This</h2>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-6 text-center">
            <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              We started as a small research desk in Surat — a group of people frustrated by how complicated the financial world made simple things.
            </p>
            <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              We saw brilliant algorithms locked behind expensive subscriptions. We saw financial education sold as ₹50,000 courses. We saw families making decisions based on tips from WhatsApp groups.
            </p>
            <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              So we decided to build something different. A platform where education is free. Where calculators don't need a login. Where algorithms are transparent. Where advisory is honest.
            </p>
            <p className="text-xl text-gray-700 dark:text-slate-300 font-medium mt-8">
              Not because it's a good business model.
              <br />
              <span className="text-brand dark:text-brand">Because it's the right thing to do.</span>
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ THE JOURNEY ═══════════════ */}
      <Section className="py-20 px-6 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-sm text-brand dark:text-brand font-medium uppercase tracking-[0.2em] mb-4">Our Journey</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-[-0.025em]">From an idea to a movement</h2>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-brand-soft dark:bg-brand-fill/40" />

            {[
              {
                marker: 'The Spark',
                text: 'Born out of a simple observation — most people lose money not because of lack of opportunity, but because of lack of understanding. What if we could change that?',
              },
              {
                marker: '2025',
                text: 'XTIN SERVICES LLP was incorporated on 10th October, 2025. What started as a small research desk became real. We built our first algorithms, our first courses, our first calculators.',
              },
              {
                marker: 'The Build',
                text: 'We built everything we wished existed when we started — free courses that actually teach, calculators that actually work with Indian tax rules, algorithms that are transparent about their logic.',
              },
              {
                marker: 'Today',
                text: 'We\'re still small. We\'re still building. But every person who uses our free calculator, every student who completes a course, every family that makes a better financial decision — that\'s the movement growing.',
              },
            ].map((item, i) => (
              <motion.div key={item.marker} variants={fadeUp} custom={i} className="relative pl-16 md:pl-20 mb-12 last:mb-0">
                <div className="absolute left-3.5 md:left-5.5 top-1.5 w-5 h-5 rounded-full bg-brand-fill dark:bg-brand-fill border-4 border-white dark:border-slate-950 z-10">
                  <div className="w-1 h-1 rounded-full bg-white mx-auto mt-1" />
                </div>
                <span className="text-sm font-bold text-brand dark:text-brand block mb-2">{item.marker}</span>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════ COMPANY DETAILS ═══════════════ */}
      <Section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-sm text-brand dark:text-brand font-medium uppercase tracking-[0.2em] mb-4">Registered Entity</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-[-0.025em]">Company Details</h2>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800/60 rounded-2xl p-8 border border-gray-100 dark:border-slate-700/50">
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { label: 'Registered Name', value: 'XTIN SERVICES LLP' },
                { label: 'LLP Identification', value: 'ACR-9371' },
                { label: 'Incorporated', value: '10th October, 2025' },
                { label: 'Status', value: 'Active', green: true },
              ].map((d) => (
                <div key={d.label}>
                  <div className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">{d.label}</div>
                  <div className={`text-lg font-bold ${d.green ? 'text-brand dark:text-brand' : ''}`}>{d.value}</div>
                </div>
              ))}
              <div className="sm:col-span-2">
                <div className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Registered Office</div>
                <div className="text-gray-600 dark:text-slate-400">Fl No 705 Building B, Shilp Residency, Vesu, Surat, Gujarat, India — 395007</div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700/50">
              <p className="text-xs text-gray-400 dark:text-slate-500">Registered at Registrar of Companies (ROC), RoC-Ahmedabad under Ministry of Corporate Affairs (MCA), Government of India.</p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ CLOSING ═══════════════ */}
      <Section className="py-24 md:py-32 px-6 bg-gray-50/50 dark:bg-slate-900/30">
        <motion.div variants={fadeUp} className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-0.5 bg-brand-fill dark:bg-brand-fill mx-auto mb-12 opacity-40" />
          
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 leading-tight tracking-[-0.025em]">
            We're not building a product.
            <br />
            <span className="text-brand">We're building a bridge.</span>
          </h2>
          
          <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto mb-8">
            Between the India that works hard and the India that works smart. Between earning money and understanding money. Between being rich and being wealthy.
          </p>
          
          <p className="text-xl text-gray-700 dark:text-slate-300 font-medium mb-12">
            Join us. Not as a customer. As a part of the movement.
          </p>

          <button
            onClick={() => setShowContactModal(true)} 
            className="inline-flex items-center justify-center gap-2 bg-brand-fill hover:bg-brand-hover text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-brand/20 hover:-translate-y-0.5"
          >
            Write to Us
          </button>
        </motion.div>
      </Section>

      {/* ─────────── CONTACT MODAL ─────────── */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 brand-on-dark">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Write to Us</h2>
              <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors" onClick={() => setShowContactModal(false)}>×</button>
            </div>
            <div className="p-6">
              {submitStatus === 'success' && (
                <div className="mb-4 p-4 bg-brand-soft dark:bg-brand-soft border border-brand-line dark:border-brand-line rounded-xl text-brand dark:text-brand text-sm">Message sent!</div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-xl text-red-800 dark:text-red-300 text-sm">{errorMessage || 'Failed to send. Please email us directly.'}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'Name', name: 'name', type: 'text', placeholder: 'Your name', minLength: 2 },
                  { label: 'Email', name: 'email', type: 'email', placeholder: 'your.email@example.com' },
                  { label: 'Subject', name: 'subject', type: 'text', placeholder: 'What\'s on your mind?', minLength: 5 },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{f.label}</label>
                    <input type={f.type} name={f.name} value={formData[f.name]} onChange={handleInputChange} required minLength={f.minLength} className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand dark:bg-slate-700 dark:text-slate-100" placeholder={f.placeholder} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Message</label>
                  <textarea rows={4} name="message" value={formData.message} onChange={handleInputChange} required minLength={10} className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand dark:bg-slate-700 dark:text-slate-100" placeholder="Tell us your story..." />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-brand-fill hover:bg-brand-hover text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">{isSubmitting ? 'Sending...' : 'Send'}</button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AboutPage;
