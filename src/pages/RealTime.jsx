import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Tldraw, useEditor, createShapeId,
  BaseBoxShapeUtil, HTMLContainer, T,
} from 'tldraw'
import 'tldraw/tldraw.css'

import { CS_DEFS, CS_TEMPLATES, CS_VOICE_ALIASES } from './CsDiagramComponents'

// ─── GEMINI CONFIG ────────────────────────────────────────────────────
// const GEMINI_API_KEY = ""
const GEMINI_MODEL   = "gemini-2.5-flash"
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

// ─── SVG PRIMITIVES ──────────────────────────────────────────────────
const PIN = ({ cx, cy }) => <circle cx={cx} cy={cy} r={3.5} fill="#6366f1" stroke="#fff" strokeWidth={1} />
const LBL = ({ x, y, children }) => (
  <text x={x} y={y} textAnchor="middle" fontSize={10} fontWeight="700" fill="#1e293b" fontFamily="monospace">{children}</text>
)
const VAL = ({ x, y, children }) => (
  <text x={x} y={y} textAnchor="middle" fontSize={9} fill="#64748b" fontFamily="monospace">{children}</text>
)

// ─── ELECTRONICS SVG RENDERERS ───────────────────────────────────────
const ResistorSVG = ({ w, h, label, value }) => {
  const m = h / 2, bx = 22, bw = w - 44
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={bx} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={bx + bw} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <rect x={bx} y={m - 11} width={bw} height={22} rx={3} fill="#fef3c7" stroke="#92400e" strokeWidth={1.5} />
    <LBL x={w / 2} y={m - 17}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const CapacitorSVG = ({ w, h, label, value }) => {
  const m = h / 2, cx = w / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={cx - 8} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 8} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx - 8} y1={m - 14} x2={cx - 8} y2={m + 14} stroke="#1d4ed8" strokeWidth={3} strokeLinecap="round" />
    <line x1={cx + 8} y1={m - 14} x2={cx + 8} y2={m + 14} stroke="#1d4ed8" strokeWidth={3} strokeLinecap="round" />
    <LBL x={w / 2} y={m - 20}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const InductorSVG = ({ w, h, label, value }) => {
  const m = h / 2, bx = 20, bw = w - 40, loops = 4
  const lw = bw / loops
  let d = `M ${bx},${m}`
  for (let i = 0; i < loops; i++) {
    const x0 = bx + i * lw
    d += ` C ${x0 + lw * 0.1},${m - 14} ${x0 + lw * 0.9},${m - 14} ${x0 + lw},${m}`
  }
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={bx} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={bx + bw} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <path d={d} fill="none" stroke="#059669" strokeWidth={2} strokeLinecap="round" />
    <LBL x={w / 2} y={m - 20}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const BatterySVG = ({ w, h, label, value }) => {
  const m = h / 2, cx = w / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={cx - 18} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 18} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx - 18} y1={m - 16} x2={cx - 18} y2={m + 16} stroke="#dc2626" strokeWidth={4} strokeLinecap="round" />
    <line x1={cx - 6} y1={m - 10} x2={cx - 6} y2={m + 10} stroke="#64748b" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 6} y1={m - 16} x2={cx + 6} y2={m + 16} stroke="#dc2626" strokeWidth={4} strokeLinecap="round" />
    <line x1={cx + 18} y1={m - 10} x2={cx + 18} y2={m + 10} stroke="#64748b" strokeWidth={2} strokeLinecap="round" />
    <text x={cx - 12} y={m - 20} fontSize={10} fill="#dc2626" fontWeight="700" fontFamily="monospace">+</text>
    <LBL x={w / 2} y={m - 26}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const VoltageSourceSVG = ({ w, h, label, value }) => {
  const m = h / 2, cx = w / 2, r = 20
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={cx - r} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + r} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <circle cx={cx} cy={m} r={r} fill="#fef3c7" stroke="#d97706" strokeWidth={1.5} />
    <text x={cx} y={m + 4} textAnchor="middle" fontSize={14} fill="#d97706" fontWeight="bold">~</text>
    <LBL x={w / 2} y={m - 28}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const GroundSVG = ({ w, h }) => {
  const cx = w / 2, ty = 8
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={cx} y1={0} x2={cx} y2={ty} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx - 18} y1={ty} x2={cx + 18} y2={ty} stroke="#334155" strokeWidth={2.5} strokeLinecap="round" />
    <line x1={cx - 12} y1={ty + 7} x2={cx + 12} y2={ty + 7} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx - 6} y1={ty + 14} x2={cx + 6} y2={ty + 14} stroke="#334155" strokeWidth={1.5} strokeLinecap="round" />
    <PIN cx={cx} cy={0} />
  </svg>
}
const LEDSVG = ({ w, h, label, value }) => {
  const m = h / 2, cx = w / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={cx - 16} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 16} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <polygon points={`${cx - 14},${m - 13} ${cx - 14},${m + 13} ${cx + 14},${m}`} fill="#4ade80" stroke="#16a34a" strokeWidth={1.5} />
    <line x1={cx + 14} y1={m - 13} x2={cx + 14} y2={m + 13} stroke="#16a34a" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 18} y1={m - 12} x2={cx + 24} y2={m - 18} stroke="#86efac" strokeWidth={1.5} strokeLinecap="round" />
    <line x1={cx + 22} y1={m - 6} x2={cx + 28} y2={m - 12} stroke="#86efac" strokeWidth={1.5} strokeLinecap="round" />
    <LBL x={w / 2} y={m - 20}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const DiodeSVG = ({ w, h, label, value }) => {
  const m = h / 2, cx = w / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={cx - 14} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 14} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <polygon points={`${cx - 14},${m - 12} ${cx - 14},${m + 12} ${cx + 12},${m}`} fill="#fbbf24" stroke="#d97706" strokeWidth={1.5} />
    <line x1={cx + 12} y1={m - 12} x2={cx + 12} y2={m + 12} stroke="#d97706" strokeWidth={2.5} strokeLinecap="round" />
    <LBL x={w / 2} y={m - 20}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const ZenerSVG = ({ w, h, label, value }) => {
  const m = h / 2, cx = w / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={cx - 14} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 14} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <polygon points={`${cx - 14},${m - 12} ${cx - 14},${m + 12} ${cx + 12},${m}`} fill="#c4b5fd" stroke="#7c3aed" strokeWidth={1.5} />
    <line x1={cx + 12} y1={m - 12} x2={cx + 18} y2={m - 18} stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 12} y1={m + 12} x2={cx + 6} y2={m + 18} stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" />
    <LBL x={w / 2} y={m - 24}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const NPN_BJT_SVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <circle cx={cx} cy={cy} r={28} fill="#f1f5f9" stroke="#475569" strokeWidth={1.5} />
    <line x1={cx - 20} y1={cy} x2={cx - 8} y2={cy} stroke="#334155" strokeWidth={2} />
    <line x1={cx - 8} y1={cy - 18} x2={cx - 8} y2={cy + 18} stroke="#334155" strokeWidth={2.5} />
    <line x1={cx - 8} y1={cy - 12} x2={cx + 16} y2={cy - 24} stroke="#334155" strokeWidth={2} />
    <line x1={cx - 8} y1={cy + 12} x2={cx + 16} y2={cy + 24} stroke="#334155" strokeWidth={2} />
    <polygon points={`${cx + 8},${cy + 18} ${cx + 16},${cy + 24} ${cx + 10},${cy + 26}`} fill="#334155" />
    <line x1={0} y1={cy} x2={cx - 20} y2={cy} stroke="#334155" strokeWidth={2} />
    <line x1={cx + 16} y1={cy - 24} x2={w} y2={cy - 24} stroke="#334155" strokeWidth={2} />
    <line x1={cx + 16} y1={cy + 24} x2={w} y2={cy + 24} stroke="#334155" strokeWidth={2} />
    <LBL x={w / 2} y={-8}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy - 24} /><PIN cx={w} cy={cy + 24} />
  </svg>
}
const PNP_BJT_SVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <circle cx={cx} cy={cy} r={28} fill="#f1f5f9" stroke="#475569" strokeWidth={1.5} />
    <line x1={cx - 20} y1={cy} x2={cx - 8} y2={cy} stroke="#334155" strokeWidth={2} />
    <line x1={cx - 8} y1={cy - 18} x2={cx - 8} y2={cy + 18} stroke="#334155" strokeWidth={2.5} />
    <line x1={cx - 8} y1={cy - 12} x2={cx + 16} y2={cy - 24} stroke="#334155" strokeWidth={2} />
    <line x1={cx - 8} y1={cy + 12} x2={cx + 16} y2={cy + 24} stroke="#334155" strokeWidth={2} />
    <polygon points={`${cx - 2},${cy - 8} ${cx - 8},${cy - 12} ${cx + 2},${cy - 14}`} fill="#334155" />
    <line x1={0} y1={cy} x2={cx - 20} y2={cy} stroke="#334155" strokeWidth={2} />
    <line x1={cx + 16} y1={cy - 24} x2={w} y2={cy - 24} stroke="#334155" strokeWidth={2} />
    <line x1={cx + 16} y1={cy + 24} x2={w} y2={cy + 24} stroke="#334155" strokeWidth={2} />
    <LBL x={w / 2} y={-8}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy - 24} /><PIN cx={w} cy={cy + 24} />
  </svg>
}
const NMOS_SVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <circle cx={cx} cy={cy} r={28} fill="#f1f5f9" stroke="#475569" strokeWidth={1.5} />
    <line x1={cx - 20} y1={cy} x2={cx - 10} y2={cy} stroke="#334155" strokeWidth={2} />
    <line x1={cx - 10} y1={cy - 16} x2={cx - 10} y2={cy + 16} stroke="#334155" strokeWidth={2.5} />
    <line x1={cx - 6} y1={cy - 12} x2={cx - 6} y2={cy - 4} stroke="#334155" strokeWidth={2.5} />
    <line x1={cx - 6} y1={cy + 4} x2={cx - 6} y2={cy + 12} stroke="#334155" strokeWidth={2.5} />
    <line x1={cx - 6} y1={cy - 8} x2={cx + 14} y2={cy - 20} stroke="#334155" strokeWidth={2} />
    <line x1={cx - 6} y1={cy + 8} x2={cx + 14} y2={cy + 20} stroke="#334155" strokeWidth={2} />
    <polygon points={`${cx + 6},${cy + 8} ${cx - 6},${cy + 8} ${cx + 2},${cy + 14}`} fill="#334155" />
    <line x1={0} y1={cy} x2={cx - 20} y2={cy} stroke="#334155" strokeWidth={2} />
    <line x1={cx + 14} y1={cy - 20} x2={w} y2={cy - 20} stroke="#334155" strokeWidth={2} />
    <line x1={cx + 14} y1={cy + 20} x2={w} y2={cy + 20} stroke="#334155" strokeWidth={2} />
    <LBL x={w / 2} y={-8}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy - 20} /><PIN cx={w} cy={cy + 20} />
  </svg>
}
const PMOS_SVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <circle cx={cx} cy={cy} r={28} fill="#fdf4ff" stroke="#7c3aed" strokeWidth={1.5} />
    <line x1={cx - 20} y1={cy} x2={cx - 10} y2={cy} stroke="#7c3aed" strokeWidth={2} />
    <line x1={cx - 10} y1={cy - 16} x2={cx - 10} y2={cy + 16} stroke="#7c3aed" strokeWidth={2.5} />
    <line x1={cx - 6} y1={cy - 12} x2={cx - 6} y2={cy - 4} stroke="#7c3aed" strokeWidth={2.5} />
    <line x1={cx - 6} y1={cy + 4} x2={cx - 6} y2={cy + 12} stroke="#7c3aed" strokeWidth={2.5} />
    <line x1={cx - 6} y1={cy - 8} x2={cx + 14} y2={cy - 20} stroke="#7c3aed" strokeWidth={2} />
    <line x1={cx - 6} y1={cy + 8} x2={cx + 14} y2={cy + 20} stroke="#7c3aed" strokeWidth={2} />
    <polygon points={`${cx + 6},${cy - 8} ${cx - 6},${cy - 8} ${cx + 2},${cy - 14}`} fill="#7c3aed" />
    <circle cx={cx - 14} cy={cy} r={4} fill="none" stroke="#7c3aed" strokeWidth={1.5} />
    <line x1={0} y1={cy} x2={cx - 18} y2={cy} stroke="#7c3aed" strokeWidth={2} />
    <line x1={cx + 14} y1={cy - 20} x2={w} y2={cy - 20} stroke="#7c3aed" strokeWidth={2} />
    <line x1={cx + 14} y1={cy + 20} x2={w} y2={cy + 20} stroke="#7c3aed" strokeWidth={2} />
    <LBL x={w / 2} y={-8}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy - 20} /><PIN cx={w} cy={cy + 20} />
  </svg>
}
const OpAmpSVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <polygon points={`${cx - 28},${cy - 24} ${cx - 28},${cy + 24} ${cx + 28},${cy}`} fill="#eff6ff" stroke="#1d4ed8" strokeWidth={1.5} />
    <line x1={0} y1={cy - 12} x2={cx - 28} y2={cy - 12} stroke="#334155" strokeWidth={2} />
    <line x1={0} y1={cy + 12} x2={cx - 28} y2={cy + 12} stroke="#334155" strokeWidth={2} />
    <line x1={cx + 28} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} />
    <text x={cx - 20} y={cy - 8} fontSize={10} fill="#1d4ed8" fontWeight="700">−</text>
    <text x={cx - 20} y={cy + 16} fontSize={10} fill="#1d4ed8" fontWeight="700">+</text>
    <LBL x={w / 2} y={cy - 32}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy - 12} /><PIN cx={0} cy={cy + 12} /><PIN cx={w} cy={cy} />
  </svg>
}
const SwitchSVG = ({ w, h, label, value }) => {
  const m = h / 2, cx = w / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={cx - 22} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 22} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <circle cx={cx - 22} cy={m} r={4} fill="none" stroke="#334155" strokeWidth={1.5} />
    <circle cx={cx + 22} cy={m} r={4} fill="none" stroke="#334155" strokeWidth={1.5} />
    <line x1={cx - 18} y1={m} x2={cx + 14} y2={m - 14} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <LBL x={w / 2} y={m - 22}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const FuseSVG = ({ w, h, label, value }) => {
  const m = h / 2, bx = 22, bw = w - 44
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={bx} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={bx + bw} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <rect x={bx} y={m - 10} width={bw} height={20} rx={3} fill="#fff" stroke="#ef4444" strokeWidth={1.5} />
    <path d={`M ${bx + 4},${m} Q ${bx + bw / 2},${m - 8} ${bx + bw - 4},${m}`} fill="none" stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round" />
    <LBL x={w / 2} y={m - 16}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const TransformerSVG = ({ w, h, label, value }) => {
  const m = h / 2, rx = w / 2 + 10
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m - 10} x2={w / 2 - 40} y2={m - 10} stroke="#334155" strokeWidth={2} />
    <line x1={0} y1={m + 10} x2={w / 2 - 40} y2={m + 10} stroke="#334155" strokeWidth={2} />
    <path d={`M ${w / 2 - 40},${m - 10} C ${w / 2 - 30},${m - 22} ${w / 2 - 12},${m - 22} ${w / 2 - 12},${m - 10} C ${w / 2 - 12},${m} ${w / 2 - 30},${m} ${w / 2 - 40},${m + 10} C ${w / 2 - 30},${m + 22} ${w / 2 - 12},${m + 22} ${w / 2 - 12},${m + 10}`} fill="none" stroke="#059669" strokeWidth={2} />
    <path d={`M ${rx},${m - 10} C ${rx + 10},${m - 22} ${rx + 28},${m - 22} ${rx + 28},${m - 10} C ${rx + 28},${m} ${rx + 10},${m} ${rx},${m + 10} C ${rx + 10},${m + 22} ${rx + 28},${m + 22} ${rx + 28},${m + 10}`} fill="none" stroke="#059669" strokeWidth={2} />
    <line x1={w / 2 - 2} y1={m - 20} x2={w / 2 - 2} y2={m + 20} stroke="#475569" strokeWidth={2} strokeDasharray="3,2" />
    <line x1={w / 2 + 2} y1={m - 20} x2={w / 2 + 2} y2={m + 20} stroke="#475569" strokeWidth={2} strokeDasharray="3,2" />
    <line x1={rx + 28} y1={m - 10} x2={w} y2={m - 10} stroke="#334155" strokeWidth={2} />
    <line x1={rx + 28} y1={m + 10} x2={w} y2={m + 10} stroke="#334155" strokeWidth={2} />
    <LBL x={w / 2} y={m - 28}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m - 10} /><PIN cx={0} cy={m + 10} /><PIN cx={w} cy={m - 10} /><PIN cx={w} cy={m + 10} />
  </svg>
}
const CrystalSVG = ({ w, h, label, value }) => {
  const m = h / 2, cx = w / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={cx - 20} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 20} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx - 20} y1={m - 14} x2={cx - 20} y2={m + 14} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <rect x={cx - 14} y={m - 11} width={28} height={22} rx={2} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.5} />
    <line x1={cx + 14} y1={m - 14} x2={cx + 14} y2={m + 14} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <LBL x={w / 2} y={m - 20}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const PhotoresistorSVG = ({ w, h, label, value }) => {
  const m = h / 2, bx = 22, bw = w - 44
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={bx} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={bx + bw} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <rect x={bx} y={m - 11} width={bw} height={22} rx={3} fill="#fef9c3" stroke="#ca8a04" strokeWidth={1.5} />
    <text x={bx + 6} y={m - 16} fontSize={12}>☀</text>
    <text x={bx + 16} y={m - 16} fontSize={12}>☀</text>
    <LBL x={w / 2} y={m - 28}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const ThermistorSVG = ({ w, h, label, value }) => {
  const m = h / 2, bx = 22, bw = w - 44
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={bx} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={bx + bw} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <rect x={bx} y={m - 11} width={bw} height={22} rx={3} fill="#fee2e2" stroke="#dc2626" strokeWidth={1.5} />
    <text x={w / 2 - 8} y={m + 4} fontSize={11} fill="#dc2626">T°</text>
    <line x1={bx + bw - 12} y1={m - 8} x2={bx + bw} y2={m + 8} stroke="#dc2626" strokeWidth={1.5} />
    <LBL x={w / 2} y={m - 17}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const RelayCoilSVG = ({ w, h, label, value }) => {
  const m = h / 2, bx = 16, bw = w - 32
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={bx} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={bx + bw} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <rect x={bx} y={m - 12} width={bw} height={24} rx={4} fill="#f5f3ff" stroke="#7c3aed" strokeWidth={1.5} />
    <text x={w / 2} y={m + 4} textAnchor="middle" fontSize={9} fill="#7c3aed" fontWeight="700">RELAY</text>
    <LBL x={w / 2} y={m - 18}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const VoltmeterSVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2, r = 22
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={cy} x2={cx - r} y2={cy} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + r} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={r} fill="#f0fdf4" stroke="#16a34a" strokeWidth={1.5} />
    <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fill="#16a34a" fontWeight="700">V</text>
    <LBL x={w / 2} y={cy - 30}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy} />
  </svg>
}
const AmmeterSVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2, r = 22
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={cy} x2={cx - r} y2={cy} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + r} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={r} fill="#fff7ed" stroke="#ea580c" strokeWidth={1.5} />
    <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fill="#ea580c" fontWeight="700">A</text>
    <LBL x={w / 2} y={cy - 30}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy} />
  </svg>
}
const SpeakerSVG = ({ w, h, label, value }) => {
  const cy = h / 2, bx = 14
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={cy - 8} x2={bx} y2={cy - 8} stroke="#334155" strokeWidth={2} />
    <line x1={0} y1={cy + 8} x2={bx} y2={cy + 8} stroke="#334155" strokeWidth={2} />
    <rect x={bx} y={cy - 10} width={12} height={20} fill="#e2e8f0" stroke="#334155" strokeWidth={1.5} />
    <polygon points={`${bx + 12},${cy - 10} ${bx + 12},${cy + 10} ${bx + 36},${cy + 22} ${bx + 36},${cy - 22}`} fill="#cbd5e1" stroke="#334155" strokeWidth={1.5} />
    <path d={`M ${bx + 42},${cy - 12} Q ${bx + 52},${cy} ${bx + 42},${cy + 12}`} fill="none" stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <path d={`M ${bx + 48},${cy - 18} Q ${bx + 62},${cy} ${bx + 48},${cy + 18}`} fill="none" stroke="#334155" strokeWidth={1.5} strokeLinecap="round" />
    <LBL x={w / 2} y={cy - 30}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy - 8} /><PIN cx={0} cy={cy + 8} />
  </svg>
}
const MicrophoneSVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={cy} x2={cx - 18} y2={cy} stroke="#334155" strokeWidth={2} />
    <line x1={cx + 18} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} />
    <rect x={cx - 10} y={cy - 18} width={20} height={28} rx={10} fill="#f1f5f9" stroke="#64748b" strokeWidth={1.5} />
    <line x1={cx} y1={cy + 10} x2={cx} y2={cy + 22} stroke="#64748b" strokeWidth={1.5} />
    <line x1={cx - 8} y1={cy + 22} x2={cx + 8} y2={cy + 22} stroke="#64748b" strokeWidth={1.5} />
    <LBL x={w / 2} y={cy - 28}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy} />
  </svg>
}
const MotorSVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2, r = 24
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={cy} x2={cx - r} y2={cy} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + r} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={r} fill="#fdf4ff" stroke="#a21caf" strokeWidth={1.5} />
    <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fill="#a21caf" fontWeight="700">M</text>
    <LBL x={w / 2} y={cy - 32}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy} />
  </svg>
}
const LampSVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2, r = 20
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={cy} x2={cx - r} y2={cy} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + r} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={r} fill="#fef9c3" stroke="#ca8a04" strokeWidth={1.5} />
    <line x1={cx - 10} y1={cy - 10} x2={cx + 10} y2={cy + 10} stroke="#ca8a04" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 10} y1={cy - 10} x2={cx - 10} y2={cy + 10} stroke="#ca8a04" strokeWidth={2} strokeLinecap="round" />
    <LBL x={w / 2} y={cy - 28}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy} />
  </svg>
}
const PotentiometerSVG = ({ w, h, label, value }) => {
  const m = h / 2, bx = 22, bw = w - 44
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={bx} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={bx + bw} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <rect x={bx} y={m - 11} width={bw} height={22} rx={3} fill="#fef3c7" stroke="#92400e" strokeWidth={1.5} />
    <line x1={w / 2} y1={m} x2={w / 2 + 6} y2={m - 18} stroke="#334155" strokeWidth={1.5} strokeLinecap="round" />
    <polygon points={`${w / 2 + 4},${m - 18} ${w / 2 + 8},${m - 18} ${w / 2 + 6},${m - 14}`} fill="#334155" />
    <LBL x={w / 2} y={m - 30}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const VccSVG = ({ w, h, value }) => {
  const cx = w / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={cx} y1={h - 10} x2={cx} y2={h} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx - 16} y1={h - 10} x2={cx + 16} y2={h - 10} stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round" />
    <text x={cx} y={h - 16} textAnchor="middle" fontSize={10} fill="#dc2626" fontWeight="700">{value || 'VCC'}</text>
    <PIN cx={cx} cy={h} />
  </svg>
}
const CurrentSourceSVG = ({ w, h, label, value }) => {
  const cx = w / 2, cy = h / 2, r = 20
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={cy} x2={cx - r} y2={cy} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + r} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={r} fill="#f0f9ff" stroke="#0369a1" strokeWidth={1.5} />
    <line x1={cx - 10} y1={cy} x2={cx + 6} y2={cy} stroke="#0369a1" strokeWidth={1.5} strokeLinecap="round" />
    <polygon points={`${cx + 6},${cy - 5} ${cx + 6},${cy + 5} ${cx + 13},${cy}`} fill="#0369a1" />
    <LBL x={w / 2} y={cy - 28}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy} />
  </svg>
}
const SCR_SVG = ({ w, h, label, value }) => {
  const m = h / 2, cx = w / 2
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={cx - 14} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={cx + 14} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <polygon points={`${cx - 14},${m - 12} ${cx - 14},${m + 12} ${cx + 12},${m}`} fill="#fde68a" stroke="#d97706" strokeWidth={1.5} />
    <line x1={cx + 12} y1={m - 12} x2={cx + 12} y2={m + 12} stroke="#d97706" strokeWidth={2.5} strokeLinecap="round" />
    <line x1={cx + 12} y1={m} x2={cx + 20} y2={m + 14} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <LBL x={w / 2} y={m - 20}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}
const AndGateSVG = ({ w, h, label }) => {
  const cy = h / 2, x0 = 10, x1 = w - 10
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <path d={`M ${x0},${cy - 22} L ${x0 + 30},${cy - 22} Q ${x1},${cy - 22} ${x1},${cy} Q ${x1},${cy + 22} ${x0 + 30},${cy + 22} L ${x0},${cy + 22} Z`} fill="#e0f2fe" stroke="#0369a1" strokeWidth={1.5} />
    <line x1={0} y1={cy - 12} x2={x0} y2={cy - 12} stroke="#334155" strokeWidth={2} />
    <line x1={0} y1={cy + 12} x2={x0} y2={cy + 12} stroke="#334155" strokeWidth={2} />
    <line x1={x1} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} />
    <text x={w / 2 - 8} y={cy + 5} fontSize={9} fill="#0369a1" fontWeight="700">&amp;</text>
    <LBL x={w / 2} y={cy - 30}>{label}</LBL>
    <PIN cx={0} cy={cy - 12} /><PIN cx={0} cy={cy + 12} /><PIN cx={w} cy={cy} />
  </svg>
}
const OrGateSVG = ({ w, h, label }) => {
  const cy = h / 2, x0 = 10, x1 = w - 10
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <path d={`M ${x0},${cy - 22} Q ${x0 + 20},${cy - 22} ${x1},${cy} Q ${x0 + 20},${cy + 22} ${x0},${cy + 22} Q ${x0 + 16},${cy} ${x0},${cy - 22} Z`} fill="#f0fdf4" stroke="#16a34a" strokeWidth={1.5} />
    <line x1={0} y1={cy - 12} x2={x0 + 6} y2={cy - 12} stroke="#334155" strokeWidth={2} />
    <line x1={0} y1={cy + 12} x2={x0 + 6} y2={cy + 12} stroke="#334155" strokeWidth={2} />
    <line x1={x1} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} />
    <text x={w / 2 - 6} y={cy + 5} fontSize={9} fill="#16a34a" fontWeight="700">≥1</text>
    <LBL x={w / 2} y={cy - 30}>{label}</LBL>
    <PIN cx={0} cy={cy - 12} /><PIN cx={0} cy={cy + 12} /><PIN cx={w} cy={cy} />
  </svg>
}
const NotGateSVG = ({ w, h, label }) => {
  const cy = h / 2, x0 = 10, x1 = w - 18
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <polygon points={`${x0},${cy - 18} ${x0},${cy + 18} ${x1},${cy}`} fill="#fff7ed" stroke="#ea580c" strokeWidth={1.5} />
    <circle cx={x1 + 5} cy={cy} r={5} fill="#fff7ed" stroke="#ea580c" strokeWidth={1.5} />
    <line x1={0} y1={cy} x2={x0} y2={cy} stroke="#334155" strokeWidth={2} />
    <line x1={x1 + 10} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} />
    <text x={x0 + 14} y={cy + 5} fontSize={9} fill="#ea580c" fontWeight="700">1</text>
    <LBL x={w / 2} y={cy - 28}>{label}</LBL>
    <PIN cx={0} cy={cy} /><PIN cx={w} cy={cy} />
  </svg>
}
const XorGateSVG = ({ w, h, label }) => {
  const cy = h / 2, x0 = 14, x1 = w - 10
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <path d={`M ${x0},${cy - 22} Q ${x0 + 20},${cy - 22} ${x1},${cy} Q ${x0 + 20},${cy + 22} ${x0},${cy + 22} Q ${x0 + 16},${cy} ${x0},${cy - 22} Z`} fill="#fdf4ff" stroke="#a21caf" strokeWidth={1.5} />
    <path d={`M ${x0 - 6},${cy - 22} Q ${x0 + 10},${cy} ${x0 - 6},${cy + 22}`} fill="none" stroke="#a21caf" strokeWidth={1.5} />
    <line x1={0} y1={cy - 12} x2={x0 + 4} y2={cy - 12} stroke="#334155" strokeWidth={2} />
    <line x1={0} y1={cy + 12} x2={x0 + 4} y2={cy + 12} stroke="#334155" strokeWidth={2} />
    <line x1={x1} y1={cy} x2={w} y2={cy} stroke="#334155" strokeWidth={2} />
    <text x={w / 2 - 6} y={cy + 5} fontSize={9} fill="#a21caf" fontWeight="700">=1</text>
    <LBL x={w / 2} y={cy - 30}>{label}</LBL>
    <PIN cx={0} cy={cy - 12} /><PIN cx={0} cy={cy + 12} /><PIN cx={w} cy={cy} />
  </svg>
}
const MuxSVG = ({ w, h, label, value }) => (
  <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <polygon points={`10,8 10,${h - 8} ${w - 10},${h - 18} ${w - 10},18`} fill="#eff6ff" stroke="#1d4ed8" strokeWidth={1.5} />
    <line x1={0} y1={20} x2={10} y2={20} stroke="#334155" strokeWidth={2} />
    <line x1={0} y1={h / 2} x2={10} y2={h / 2} stroke="#334155" strokeWidth={2} />
    <line x1={0} y1={h - 20} x2={10} y2={h - 20} stroke="#334155" strokeWidth={2} />
    <line x1={w - 10} y1={h / 2} x2={w} y2={h / 2} stroke="#334155" strokeWidth={2} />
    <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontSize={9} fill="#1d4ed8" fontWeight="700">MUX</text>
    <LBL x={w / 2} y={-2}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={20} /><PIN cx={0} cy={h / 2} /><PIN cx={0} cy={h - 20} /><PIN cx={w} cy={h / 2} />
  </svg>
)
const FlipFlopSVG = ({ w, h, label, value }) => (
  <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <rect x={10} y={5} width={w - 20} height={h - 10} rx={4} fill="#f5f3ff" stroke="#7c3aed" strokeWidth={1.5} />
    <line x1={0} y1={22} x2={10} y2={22} stroke="#334155" strokeWidth={2} />
    <line x1={0} y1={h - 22} x2={10} y2={h - 22} stroke="#334155" strokeWidth={2} />
    <line x1={w - 10} y1={22} x2={w} y2={22} stroke="#334155" strokeWidth={2} />
    <line x1={w - 10} y1={h - 22} x2={w} y2={h - 22} stroke="#334155" strokeWidth={2} />
    <text x={12} y={26} fontSize={9} fill="#7c3aed" fontWeight="700">D</text>
    <text x={12} y={h - 17} fontSize={9} fill="#7c3aed" fontWeight="700">CLK</text>
    <text x={w - 26} y={26} fontSize={9} fill="#7c3aed" fontWeight="700">Q</text>
    <text x={w - 26} y={h - 17} fontSize={9} fill="#7c3aed" fontWeight="700">Q̄</text>
    <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontSize={9} fill="#475569">D-FF</text>
    <LBL x={w / 2} y={-2}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={22} /><PIN cx={0} cy={h - 22} /><PIN cx={w} cy={22} /><PIN cx={w} cy={h - 22} />
  </svg>
)
const Ic555SVG = ({ w, h, label }) => (
  <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <rect x={10} y={5} width={w - 20} height={h - 10} rx={4} fill="#fef3c7" stroke="#92400e" strokeWidth={1.5} />
    {[['GND', 15], ['TRIG', 30], ['OUT', 45], ['RST', 60]].map(([n, y]) => (
      <g key={n}>
        <line x1={0} y1={y} x2={10} y2={y} stroke="#334155" strokeWidth={2} />
        <text x={13} y={y + 4} fontSize={8} fill="#92400e" fontWeight="700">{n}</text>
        <PIN cx={0} cy={y} />
      </g>
    ))}
    {[['VCC', 15], ['DIS', 30], ['THR', 45], ['CV', 60]].map(([n, y]) => (
      <g key={n}>
        <line x1={w - 10} y1={y} x2={w} y2={y} stroke="#334155" strokeWidth={2} />
        <text x={w - 12} y={y + 4} fontSize={8} fill="#92400e" fontWeight="700" textAnchor="end">{n}</text>
        <PIN cx={w} cy={y} />
      </g>
    ))}
    <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontSize={12} fill="#92400e" fontWeight="800">555</text>
    <LBL x={w / 2} y={-2}>{label}</LBL>
  </svg>
)
const Ic741SVG = ({ w, h, label }) => (
  <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <rect x={10} y={5} width={w - 20} height={h - 10} rx={4} fill="#eff6ff" stroke="#1d4ed8" strokeWidth={1.5} />
    {[['-IN', 20], ['+IN', 38], ['V-', 56]].map(([n, y]) => (
      <g key={n}>
        <line x1={0} y1={y} x2={10} y2={y} stroke="#334155" strokeWidth={2} />
        <text x={13} y={y + 4} fontSize={8} fill="#1d4ed8" fontWeight="700">{n}</text>
        <PIN cx={0} cy={y} />
      </g>
    ))}
    {[['OUT', 20], ['V+', 38], ['OS', 56]].map(([n, y]) => (
      <g key={n}>
        <line x1={w - 10} y1={y} x2={w} y2={y} stroke="#334155" strokeWidth={2} />
        <text x={w - 12} y={y + 4} fontSize={8} fill="#1d4ed8" fontWeight="700" textAnchor="end">{n}</text>
        <PIN cx={w} cy={y} />
      </g>
    ))}
    <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontSize={10} fill="#1d4ed8" fontWeight="800">741</text>
    <LBL x={w / 2} y={-2}>{label}</LBL>
  </svg>
)
const ArduinoSVG = ({ w, h, label, value }) => (
  <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <rect x={8} y={4} width={w - 16} height={h - 8} rx={6} fill="#e0f2fe" stroke="#0284c7" strokeWidth={2} />
    <text x={w / 2} y={h / 2 - 4} textAnchor="middle" fontSize={10} fill="#0284c7" fontWeight="800">ARDUINO</text>
    <text x={w / 2} y={h / 2 + 10} textAnchor="middle" fontSize={8} fill="#0369a1">{value}</text>
    {[0, 1, 2, 3].map(i => (
      <g key={i}>
        <line x1={20 + i * 22} y1={4} x2={20 + i * 22} y2={0} stroke="#334155" strokeWidth={2} />
        <PIN cx={20 + i * 22} cy={0} />
      </g>
    ))}
    {[0, 1, 2, 3].map(i => (
      <g key={i}>
        <line x1={20 + i * 22} y1={h - 4} x2={20 + i * 22} y2={h} stroke="#334155" strokeWidth={2} />
        <PIN cx={20 + i * 22} cy={h} />
      </g>
    ))}
    <LBL x={w / 2} y={-8}>{label}</LBL>
  </svg>
)
const VarResistorSVG = ({ w, h, label, value }) => {
  const m = h / 2, bx = 22, bw = w - 44
  return <svg width={w} height={h} style={{ overflow: 'visible' }}>
    <line x1={0} y1={m} x2={bx} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <line x1={bx + bw} y1={m} x2={w} y2={m} stroke="#334155" strokeWidth={2} strokeLinecap="round" />
    <rect x={bx} y={m - 11} width={bw} height={22} rx={3} fill="#fef3c7" stroke="#92400e" strokeWidth={1.5} />
    <line x1={bx + 4} y1={m + 18} x2={bx + bw - 4} y2={m - 18} stroke="#334155" strokeWidth={1.5} strokeLinecap="round" />
    <polygon points={`${bx + bw - 4},${m - 18} ${bx + bw - 9},${m - 14} ${bx + bw},${m - 14}`} fill="#334155" />
    <LBL x={w / 2} y={m - 24}>{label}</LBL>
    <VAL x={w / 2} y={h + 13}>{value}</VAL>
    <PIN cx={0} cy={m} /><PIN cx={w} cy={m} />
  </svg>
}

// ─── ELECTRONICS COMPONENT DEFS ───────────────────────────────────────
const CIRCUIT_DEFS = {
  battery:       { label:'Battery',       cat:'Sources',     prefix:'BT',  val:'9V',       w:160, h:60,  Svg:BatterySVG,       icon:'🔋', desc:'DC voltage source' },
  voltagesource: { label:'AC Source',     cat:'Sources',     prefix:'VS',  val:'120VAC',   w:140, h:60,  Svg:VoltageSourceSVG, icon:'⚡', desc:'AC voltage source' },
  currentsource: { label:'Current Src',   cat:'Sources',     prefix:'IS',  val:'1A',       w:140, h:60,  Svg:CurrentSourceSVG, icon:'→',  desc:'Ideal current source' },
  vcc:           { label:'VCC Rail',      cat:'Sources',     prefix:'VCC', val:'+5V',      w:60,  h:50,  Svg:VccSVG,           icon:'+',  desc:'Power supply rail' },
  ground:        { label:'Ground',        cat:'Sources',     prefix:'GND', val:'GND',      w:60,  h:50,  Svg:GroundSVG,        icon:'⏚', desc:'Circuit ground' },
  resistor:      { label:'Resistor',      cat:'Passives',    prefix:'R',   val:'1kΩ',      w:140, h:55,  Svg:ResistorSVG,      icon:'▬', desc:'Fixed resistor' },
  varresistor:   { label:'Var Resistor',  cat:'Passives',    prefix:'RV',  val:'10kΩ',     w:140, h:55,  Svg:VarResistorSVG,   icon:'▬', desc:'Variable resistor' },
  potentiometer: { label:'Potentiometer', cat:'Passives',    prefix:'P',   val:'10kΩ',     w:140, h:55,  Svg:PotentiometerSVG, icon:'⊙', desc:'3-terminal pot' },
  capacitor:     { label:'Capacitor',     cat:'Passives',    prefix:'C',   val:'100µF',    w:120, h:65,  Svg:CapacitorSVG,     icon:'⊢⊣',desc:'Capacitor' },
  inductor:      { label:'Inductor',      cat:'Passives',    prefix:'L',   val:'10mH',     w:140, h:55,  Svg:InductorSVG,      icon:'⌒', desc:'Coil/inductor' },
  transformer:   { label:'Transformer',   cat:'Passives',    prefix:'T',   val:'1:1',      w:200, h:70,  Svg:TransformerSVG,   icon:'⇄', desc:'Coupled inductors' },
  fuse:          { label:'Fuse',          cat:'Passives',    prefix:'F',   val:'1A',       w:140, h:55,  Svg:FuseSVG,          icon:'🔌', desc:'Overcurrent protection' },
  crystal:       { label:'Crystal',       cat:'Passives',    prefix:'Y',   val:'16MHz',    w:140, h:70,  Svg:CrystalSVG,       icon:'◇', desc:'Quartz crystal' },
  led:           { label:'LED',           cat:'Diodes',      prefix:'D',   val:'2V fwd',   w:150, h:65,  Svg:LEDSVG,           icon:'💡', desc:'Light emitting diode' },
  diode:         { label:'Diode',         cat:'Diodes',      prefix:'D',   val:'1N4007',   w:140, h:55,  Svg:DiodeSVG,         icon:'▷|', desc:'Rectifier diode' },
  zener:         { label:'Zener',         cat:'Diodes',      prefix:'ZD',  val:'5.1V',     w:140, h:55,  Svg:ZenerSVG,         icon:'⊲z', desc:'Voltage regulation' },
  scr:           { label:'SCR',           cat:'Diodes',      prefix:'SCR', val:'C106',     w:140, h:55,  Svg:SCR_SVG,          icon:'▷|g',desc:'Silicon controlled rectifier' },
  npn:           { label:'NPN BJT',       cat:'Transistors', prefix:'Q',   val:'2N2222',   w:80,  h:80,  Svg:NPN_BJT_SVG,      icon:'⊿n', desc:'NPN transistor' },
  pnp:           { label:'PNP BJT',       cat:'Transistors', prefix:'Q',   val:'2N3906',   w:80,  h:80,  Svg:PNP_BJT_SVG,      icon:'⊿p', desc:'PNP transistor' },
  nmos:          { label:'NMOS FET',      cat:'Transistors', prefix:'M',   val:'IRF540',   w:80,  h:80,  Svg:NMOS_SVG,         icon:'⊡n', desc:'N-channel MOSFET' },
  pmos:          { label:'PMOS FET',      cat:'Transistors', prefix:'M',   val:'BS250',    w:80,  h:80,  Svg:PMOS_SVG,         icon:'⊡p', desc:'P-channel MOSFET' },
  opamp:         { label:'Op-Amp',        cat:'Active ICs',  prefix:'U',   val:'LM741',    w:160, h:75,  Svg:OpAmpSVG,         icon:'▷', desc:'Operational amplifier' },
  ic555:         { label:'555 Timer',     cat:'Active ICs',  prefix:'U',   val:'NE555',    w:100, h:80,  Svg:Ic555SVG,         icon:'⏱', desc:'555 timer IC' },
  ic741:         { label:'741 Op-Amp',    cat:'Active ICs',  prefix:'U',   val:'LM741',    w:100, h:75,  Svg:Ic741SVG,         icon:'△', desc:'741 op-amp IC' },
  relaycoil:     { label:'Relay Coil',    cat:'Active ICs',  prefix:'K',   val:'5V coil',  w:150, h:60,  Svg:RelayCoilSVG,     icon:'○', desc:'Electromagnetic relay' },
  arduino:       { label:'Arduino',       cat:'Active ICs',  prefix:'MCU', val:'Uno',      w:120, h:80,  Svg:ArduinoSVG,       icon:'🤖', desc:'Arduino microcontroller' },
  andgate:       { label:'AND Gate',      cat:'Logic Gates', prefix:'G',   val:'7408',     w:120, h:70,  Svg:AndGateSVG,       icon:'&', desc:'AND logic gate' },
  orgate:        { label:'OR Gate',       cat:'Logic Gates', prefix:'G',   val:'7432',     w:120, h:70,  Svg:OrGateSVG,        icon:'≥1', desc:'OR logic gate' },
  notgate:       { label:'NOT Gate',      cat:'Logic Gates', prefix:'G',   val:'7404',     w:100, h:60,  Svg:NotGateSVG,       icon:'¬', desc:'Inverter/NOT gate' },
  xorgate:       { label:'XOR Gate',      cat:'Logic Gates', prefix:'G',   val:'7486',     w:120, h:70,  Svg:XorGateSVG,       icon:'⊕', desc:'XOR logic gate' },
  mux:           { label:'Multiplexer',   cat:'Logic Gates', prefix:'MX',  val:'4:1 MUX',  w:100, h:80,  Svg:MuxSVG,           icon:'⋈', desc:'4:1 multiplexer' },
  flipflop:      { label:'D Flip-Flop',   cat:'Logic Gates', prefix:'FF',  val:'7474',     w:100, h:80,  Svg:FlipFlopSVG,      icon:'FF', desc:'D-type flip-flop' },
  photoresistor: { label:'Photoresistor', cat:'Sensors',     prefix:'LDR', val:'10kΩ',     w:150, h:65,  Svg:PhotoresistorSVG, icon:'☀', desc:'Light-dependent resistor' },
  thermistor:    { label:'Thermistor',    cat:'Sensors',     prefix:'RT',  val:'10kΩ NTC', w:150, h:60,  Svg:ThermistorSVG,    icon:'🌡', desc:'Temperature sensor' },
  switch:        { label:'Switch',        cat:'Switches',    prefix:'SW',  val:'SPST',     w:120, h:55,  Svg:SwitchSVG,        icon:'⊙', desc:'Single-pole switch' },
  voltmeter:     { label:'Voltmeter',     cat:'Meters',      prefix:'VM',  val:'DC',       w:130, h:70,  Svg:VoltmeterSVG,     icon:'V', desc:'Voltage measurement' },
  ammeter:       { label:'Ammeter',       cat:'Meters',      prefix:'AM',  val:'DC',       w:130, h:70,  Svg:AmmeterSVG,       icon:'A', desc:'Current measurement' },
  lamp:          { label:'Lamp',          cat:'Output',      prefix:'LP',  val:'60W',      w:120, h:60,  Svg:LampSVG,          icon:'💡', desc:'Incandescent lamp' },
  speaker:       { label:'Speaker',       cat:'Output',      prefix:'LS',  val:'8Ω',       w:110, h:65,  Svg:SpeakerSVG,       icon:'🔊', desc:'Audio speaker' },
  motor:         { label:'DC Motor',      cat:'Output',      prefix:'M',   val:'12V DC',   w:120, h:70,  Svg:MotorSVG,         icon:'⚙', desc:'DC electric motor' },
  microphone:    { label:'Microphone',    cat:'Output',      prefix:'MIC', val:'Dynamic',  w:120, h:65,  Svg:MicrophoneSVG,    icon:'🎤', desc:'Audio microphone' },
}

const ALL_DEFS      = { ...CIRCUIT_DEFS, ...CS_DEFS }
const CATEGORIES    = [...new Set(Object.values(CIRCUIT_DEFS).map(d => d.cat))]
const CS_CATEGORIES = [...new Set(Object.values(CS_DEFS).map(d => d.cat))]

function isCsType(type) { return type && type.startsWith('cs_') }

// ─── CS NODE STYLES ───────────────────────────────────────────────────
const CS_NODE_STYLE = {
  cs_user:{color:'blue',fill:'semi',geo:'ellipse'},        cs_browser:{color:'green',fill:'semi',geo:'rectangle'},
  cs_mobile:{color:'orange',fill:'semi',geo:'rectangle'},  cs_iot:{color:'violet',fill:'semi',geo:'rectangle'},
  cs_server:{color:'violet',fill:'solid',geo:'rectangle'}, cs_api:{color:'blue',fill:'solid',geo:'rectangle'},
  cs_auth_server:{color:'red',fill:'solid',geo:'rectangle'},cs_microservice:{color:'green',fill:'semi',geo:'rectangle'},
  cs_gateway:{color:'yellow',fill:'solid',geo:'rectangle'},cs_lb:{color:'green',fill:'solid',geo:'rectangle'},
  cs_cdn:{color:'light-blue',fill:'semi',geo:'rectangle'}, cs_webhook:{color:'orange',fill:'semi',geo:'rectangle'},
  cs_database:{color:'blue',fill:'semi',geo:'ellipse'},    cs_nosql:{color:'green',fill:'semi',geo:'ellipse'},
  cs_redis:{color:'red',fill:'semi',geo:'ellipse'},        cs_blob:{color:'orange',fill:'semi',geo:'ellipse'},
  cs_search:{color:'violet',fill:'semi',geo:'ellipse'},    cs_data_warehouse:{color:'blue',fill:'solid',geo:'ellipse'},
  cs_queue:{color:'yellow',fill:'semi',geo:'rectangle'},   cs_kafka:{color:'violet',fill:'solid',geo:'rectangle'},
  cs_pubsub:{color:'green',fill:'semi',geo:'rectangle'},   cs_jwt:{color:'yellow',fill:'semi',geo:'rectangle'},
  cs_oauth:{color:'red',fill:'semi',geo:'rectangle'},      cs_session:{color:'orange',fill:'semi',geo:'rectangle'},
  cs_firewall:{color:'red',fill:'solid',geo:'rectangle'},  cs_mfa:{color:'violet',fill:'semi',geo:'rectangle'},
  cs_ldap:{color:'blue',fill:'semi',geo:'rectangle'},      cs_cloud:{color:'light-blue',fill:'semi',geo:'cloud'},
  cs_k8s:{color:'blue',fill:'semi',geo:'rectangle'},       cs_docker:{color:'light-blue',fill:'semi',geo:'rectangle'},
  cs_lambda:{color:'orange',fill:'semi',geo:'rectangle'},  cs_internet:{color:'green',fill:'semi',geo:'cloud'},
  cs_process:{color:'grey',fill:'semi',geo:'rectangle'},   cs_decision:{color:'yellow',fill:'semi',geo:'diamond'},
  cs_start:{color:'green',fill:'solid',geo:'rectangle'},   cs_end:{color:'red',fill:'solid',geo:'rectangle'},
  cs_monitor:{color:'green',fill:'semi',geo:'rectangle'},  cs_logger:{color:'yellow',fill:'semi',geo:'rectangle'},
  cs_ci_cd:{color:'violet',fill:'semi',geo:'rectangle'},
}
const CS_ICONS = {
  cs_user:'👤',cs_browser:'🌐',cs_mobile:'📱',cs_iot:'📡',
  cs_server:'🖥️',cs_api:'⚡',cs_auth_server:'🔐',cs_microservice:'🧩',
  cs_gateway:'🚪',cs_lb:'⚖️',cs_cdn:'🌍',cs_webhook:'🪝',
  cs_database:'🗄️',cs_nosql:'🍃',cs_redis:'⚡',cs_blob:'🪣',
  cs_search:'🔍',cs_data_warehouse:'🏭',cs_queue:'📨',cs_kafka:'🌊',
  cs_pubsub:'📢',cs_jwt:'🎫',cs_oauth:'🔑',cs_session:'🍪',
  cs_firewall:'🛡️',cs_mfa:'📲',cs_ldap:'🏢',cs_cloud:'☁️',
  cs_k8s:'☸️',cs_docker:'🐳',cs_lambda:'⚡',cs_internet:'🌐',
  cs_process:'⬜',cs_decision:'◇',cs_start:'▶',cs_end:'⏹',
  cs_monitor:'📊',cs_logger:'📜',cs_ci_cd:'🔄',
}

// ─── ELECTRONICS TEMPLATES ────────────────────────────────────────────
const ELECTRONICS_TEMPLATES = {
  led_blink: {
    title: 'LED Blinker (555 Timer)',
    keywords: ['blink','led blink','flasher','flash','555 blink','astable','led flasher'],
    components: [
      {type:'battery',   label:'BT1',value:'9V',    x:60,  y:280},
      {type:'ic555',     label:'U1', value:'NE555', x:280, y:240},
      {type:'resistor',  label:'R1', value:'47kΩ',  x:170, y:180},
      {type:'resistor',  label:'R2', value:'47kΩ',  x:170, y:320},
      {type:'capacitor', label:'C1', value:'10µF',  x:440, y:340},
      {type:'capacitor', label:'C2', value:'10nF',  x:170, y:440},
      {type:'resistor',  label:'R3', value:'470Ω',  x:600, y:240},
      {type:'led',       label:'D1', value:'RED',   x:740, y:240},
      {type:'ground',    label:'GND',value:'GND',   x:440, y:520},
    ],
  },
  power_supply: {
    title: 'Regulated Power Supply',
    keywords: ['power supply','psu','regulator','regulated','5v supply','12v supply','lm7805','7805'],
    components: [
      {type:'voltagesource',label:'AC1',value:'230VAC',x:60,  y:280},
      {type:'transformer',  label:'T1', value:'12V 1A',x:220, y:260},
      {type:'diode',        label:'D1', value:'1N4007',x:420, y:200},
      {type:'diode',        label:'D2', value:'1N4007',x:420, y:340},
      {type:'diode',        label:'D3', value:'1N4007',x:560, y:200},
      {type:'diode',        label:'D4', value:'1N4007',x:560, y:340},
      {type:'capacitor',    label:'C1', value:'2200µF',x:680, y:280},
      {type:'resistor',     label:'R1', value:'1kΩ',   x:830, y:280},
      {type:'capacitor',    label:'C2', value:'100µF', x:980, y:280},
      {type:'led',          label:'D5', value:'PWR',   x:1100,y:200},
      {type:'ground',       label:'GND',value:'GND',   x:980, y:480},
    ],
  },
  amplifier: {
    title: 'Audio Amplifier',
    keywords: ['amplifier','audio amp','op amp circuit','non inverting','inverting amp','gain'],
    components: [
      {type:'battery',   label:'BT1',value:'+15V',  x:60,  y:200},
      {type:'battery',   label:'BT2',value:'-15V',  x:60,  y:370},
      {type:'resistor',  label:'R1', value:'10kΩ',  x:220, y:280},
      {type:'capacitor', label:'C1', value:'10µF',  x:220, y:400},
      {type:'opamp',     label:'U1', value:'LM741', x:420, y:260},
      {type:'resistor',  label:'Rf', value:'100kΩ', x:560, y:180},
      {type:'resistor',  label:'Ri', value:'10kΩ',  x:320, y:340},
      {type:'capacitor', label:'C2', value:'10µF',  x:700, y:280},
      {type:'resistor',  label:'RL', value:'8Ω',    x:860, y:280},
      {type:'speaker',   label:'LS1',value:'8Ω',    x:990, y:260},
      {type:'ground',    label:'GND',value:'GND',   x:580, y:480},
    ],
  },
  motor_driver: {
    title: 'DC Motor Driver (H-Bridge)',
    keywords: ['motor driver','h bridge','hbridge','motor control','dc motor circuit'],
    components: [
      {type:'battery', label:'BT1',value:'12V',    x:60, y:280},
      {type:'npn',     label:'Q1', value:'2N2222', x:260,y:180},
      {type:'npn',     label:'Q2', value:'2N2222', x:260,y:380},
      {type:'npn',     label:'Q3', value:'2N2222', x:560,y:180},
      {type:'npn',     label:'Q4', value:'2N2222', x:560,y:380},
      {type:'diode',   label:'D1', value:'1N4007', x:380,y:180},
      {type:'diode',   label:'D2', value:'1N4007', x:380,y:380},
      {type:'diode',   label:'D3', value:'1N4007', x:680,y:180},
      {type:'diode',   label:'D4', value:'1N4007', x:680,y:380},
      {type:'motor',   label:'M1', value:'12V DC', x:840,y:280},
      {type:'resistor',label:'R1', value:'1kΩ',    x:160,y:200},
      {type:'resistor',label:'R2', value:'1kΩ',    x:160,y:360},
      {type:'ground',  label:'GND',value:'GND',    x:560,y:520},
    ],
  },
  rc_filter: {
    title: 'RC Low-Pass Filter',
    keywords: ['rc filter','low pass','high pass','band pass','filter circuit','lc filter'],
    components: [
      {type:'voltagesource',label:'V1',  value:'1kHz',  x:60,  y:280},
      {type:'resistor',     label:'R1',  value:'1kΩ',   x:240, y:280},
      {type:'capacitor',    label:'C1',  value:'100nF', x:420, y:280},
      {type:'resistor',     label:'R2',  value:'10kΩ',  x:580, y:280},
      {type:'voltmeter',    label:'VM',  value:'Vout',  x:740, y:280},
      {type:'ground',       label:'GND1',value:'GND',   x:160, y:440},
      {type:'ground',       label:'GND2',value:'GND',   x:420, y:440},
      {type:'ground',       label:'GND3',value:'GND',   x:740, y:440},
    ],
  },
  arduino_sensor: {
    title: 'Arduino Sensor Circuit',
    keywords: ['arduino circuit','arduino sensor','arduino led','microcontroller circuit','arduino project'],
    components: [
      {type:'arduino',      label:'MCU',value:'Uno',   x:340,y:250},
      {type:'vcc',          label:'VCC',value:'+5V',   x:200,y:160},
      {type:'resistor',     label:'R1', value:'10kΩ',  x:160,y:300},
      {type:'switch',       label:'SW1',value:'BTN',   x:160,y:420},
      {type:'photoresistor',label:'LDR',value:'10kΩ',  x:160,y:520},
      {type:'resistor',     label:'R2', value:'330Ω',  x:640,y:220},
      {type:'led',          label:'D1', value:'GREEN', x:800,y:220},
      {type:'resistor',     label:'R3', value:'330Ω',  x:640,y:340},
      {type:'led',          label:'D2', value:'RED',   x:800,y:340},
      {type:'motor',        label:'M1', value:'5V DC', x:960,y:440},
      {type:'ground',       label:'GND',value:'GND',   x:340,y:560},
    ],
  },
}

const ALL_TEMPLATES = { ...ELECTRONICS_TEMPLATES, ...CS_TEMPLATES }

// ─── DYNAMIC COMPONENTS ───────────────────────────────────────────────
const DYNAMIC_COMPONENTS = {}

function DynamicComponentSVG({ w, h, label, value, svgTemplate }) {
  const filled = (svgTemplate || '')
    .replace(/\{\{w\}\}/g, w).replace(/\{\{h\}\}/g, h)
    .replace(/\{\{label\}\}/g, label || '').replace(/\{\{value\}\}/g, value || '')
  return <svg width={w} height={h} style={{ overflow: 'visible' }} dangerouslySetInnerHTML={{ __html: filled }} />
}

// ─── GEMINI API ────────────────────────────────────────────────────────
async function callGemini(prompt, opts = {}) {
  const { retries = 3, parseJson = false, temperature = 0.15 } = opts
  let lastErr
  for (let i = 0; i < retries; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 1500 * i))
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: 2048 },
        }),
      })
      if (res.status === 503 || res.status === 429) { lastErr = new Error(`Gemini ${res.status}`); continue }
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(`Gemini ${res.status}: ${errBody?.error?.message || 'API error'}`)
      }
      const data = await res.json()
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      text = text.replace(/```json\n?|```\n?/g, '').trim()
      if (!text) throw new Error('Empty Gemini response')
      if (parseJson) {
        const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
        if (m) { try { return JSON.parse(m[0]) } catch { /* fall */ } }
        try { return JSON.parse(text) } catch { throw new Error(`Bad JSON: ${text.slice(0, 120)}`) }
      }
      return text
    } catch (e) {
      lastErr = e
      if (!e.message.includes('503') && !e.message.includes('429')) throw e
    }
  }
  throw lastErr || new Error('Gemini unavailable')
}

// ─── VOICE ALIASES ────────────────────────────────────────────────────
const VOICE_ALIASES = {
  'battery':'battery','cell':'battery','ac source':'voltagesource','voltage source':'voltagesource',
  'current source':'currentsource','vcc':'vcc','ground':'ground','gnd':'ground',
  'resistor':'resistor','resistance':'resistor','variable resistor':'varresistor','rheostat':'varresistor',
  'potentiometer':'potentiometer','pot':'potentiometer','capacitor':'capacitor','cap':'capacitor',
  'inductor':'inductor','coil':'inductor','transformer':'transformer','fuse':'fuse',
  'crystal':'crystal','quartz':'crystal','led':'led','light emitting diode':'led',
  'diode':'diode','rectifier':'diode','zener':'zener','zener diode':'zener',
  'scr':'scr','thyristor':'scr','npn':'npn','npn transistor':'npn','bjt':'npn',
  'pnp':'pnp','pnp transistor':'pnp','transistor':'npn','nmos':'nmos','n channel mosfet':'nmos',
  'pmos':'pmos','p channel mosfet':'pmos','mosfet':'nmos','fet':'nmos',
  'op amp':'opamp','opamp':'opamp','operational amplifier':'opamp',
  '555 timer':'ic555','555':'ic555','ne555':'ic555','741':'ic741','lm741':'ic741',
  'relay':'relaycoil','relay coil':'relaycoil','arduino':'arduino','microcontroller':'arduino',
  'and gate':'andgate','or gate':'orgate','not gate':'notgate','inverter':'notgate',
  'xor gate':'xorgate','multiplexer':'mux','mux':'mux','flip flop':'flipflop','d flip flop':'flipflop',
  'photoresistor':'photoresistor','ldr':'photoresistor','thermistor':'thermistor',
  'switch':'switch','voltmeter':'voltmeter','ammeter':'ammeter',
  'lamp':'lamp','bulb':'lamp','speaker':'speaker','motor':'motor','dc motor':'motor',
  'microphone':'microphone','mic':'microphone',
  ...CS_VOICE_ALIASES,
}

// ─── CANVAS HELPERS ───────────────────────────────────────────────────
function clearCanvas(editor) {
  const all = editor.getCurrentPageShapes()
  if (all.length > 0) {
    editor.selectAll()
    editor.deleteShapes(editor.getSelectedShapeIds())
  }
}
function extractShapeText(shape) {
  if (!shape) return ''
  const p = shape.props || {}
  if (typeof p.text === 'string' && p.text.trim()) return p.text.trim()
  if (typeof p.label === 'string' && p.label.trim()) return p.label.trim()
  return ''
}

// ─── TLDRAW HELPERS ───────────────────────────────────────────────────
function placeTldrawNode(editor, comp, offsetX, offsetY) {
  const def = ALL_DEFS[comp.type] || { w: 180, h: 100 }
  const id  = createShapeId()
  try {
    editor.createShape({
      id, type: 'electrical',
      x: comp.x + offsetX - def.w / 2,
      y: comp.y + offsetY - def.h / 2,
      props: { componentType: comp.type, label: comp.label, value: comp.value || '', w: def.w, h: def.h },
    })
  } catch (e) { console.warn('placeTldrawNode failed:', comp.type, e.message) }
  return id
}

// FIX: removed `type:'point'` from start/end — tldraw v2 uses plain {x,y}
function placeTldrawArrow(editor, fromId, toId, label, color) {
  const fromShape = editor.getShape(fromId)
  const toShape   = editor.getShape(toId)
  if (!fromShape || !toShape) return null
  const fx = fromShape.x + (fromShape.props.w || 160) / 2
  const fy = fromShape.y + (fromShape.props.h || 100) / 2
  const tx = toShape.x  + (toShape.props.w  || 160) / 2
  const ty = toShape.y  + (toShape.props.h  || 100) / 2
  const id = createShapeId()
  try {
    editor.createShape({
      id, type: 'arrow', x: 0, y: 0,
      props: {
        color: color || 'grey', size: 'm', dash: 'draw', fill: 'none',
        arrowheadEnd: 'arrow', arrowheadStart: 'none', bend: 0,
        text: label || '', font: 'draw',
        start: { x: fx, y: fy },   // plain {x,y} — no type field
        end:   { x: tx, y: ty },
      },
    })
  } catch (e) { console.warn('placeTldrawArrow failed:', e.message) }
  return id
}

function placeTldrawTitle(editor, text, x, y) {
  const id = createShapeId()
  try {
    editor.createShape({
      id, type: 'text', x, y,
      props: { text, color: 'violet', size: 'xl', font: 'draw', align: 'middle', w: 700, autoSize: false },
    })
  } catch (e) { console.warn('placeTldrawTitle failed:', e.message) }
  return id
}

async function placeTldrawDiagram(editor, layout) {
  clearCanvas(editor)
  const vp = editor.getViewportPageBounds()
  const xs = layout.components.map(c => c.x)
  const ys = layout.components.map(c => c.y)
  const tmplCx  = (Math.min(...xs) + Math.max(...xs)) / 2
  const tmplCy  = (Math.min(...ys) + Math.max(...ys)) / 2
  const offsetX = (vp.x + vp.w / 2) - tmplCx
  const offsetY = (vp.y + vp.h / 2) - tmplCy

  placeTldrawTitle(editor, layout.title || '', vp.x + vp.w / 2 - 350, Math.min(...ys) + offsetY - 100)

  const nodeMap = {}
  for (const comp of layout.components) {
    const id = placeTldrawNode(editor, comp, offsetX, offsetY)
    nodeMap[comp.label] = id
    await new Promise(r => setTimeout(r, 18))
  }

  const arrows = layout.connections || []
  if (arrows.length > 0) {
    for (const conn of arrows) {
      const fId = nodeMap[conn.from], tId = nodeMap[conn.to]
      if (fId && tId) {
        placeTldrawArrow(editor, fId, tId, conn.label || '', conn.color || 'grey')
        await new Promise(r => setTimeout(r, 12))
      }
    }
  } else {
    const sorted = [...layout.components].sort((a, b) => a.x - b.x)
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i + 1]
      if (Math.abs(a.y - b.y) < 180) {
        const fId = nodeMap[a.label], tId = nodeMap[b.label]
        if (fId && tId) placeTldrawArrow(editor, fId, tId, '', 'grey')
      }
    }
  }
  editor.zoomToFit({ animation: { duration: 300 } })
}

// ─── AI DIAGRAM GENERATOR ─────────────────────────────────────────────
async function generateAIDiagram(editor, description, onStatus) {
  onStatus({ phase: 'ai', message: `🧠 Designing "${description}"...` })
  const csKeys   = Object.keys(CS_NODE_STYLE).join(', ')
  const elecKeys = Object.keys(CIRCUIT_DEFS).join(', ')
  const prompt   = `Design a system diagram for: "${description}"

CS/software node types: [${csKeys}]
Electronics types: [${elecKeys}]

Return ONLY a JSON object (no markdown, no explanation):
{"title":"Name","type":"cs","components":[{"type":"cs_user","label":"Client","value":"Browser","x":100,"y":300},{"type":"cs_gateway","label":"GW","value":"API Gateway","x":350,"y":300}],"connections":[{"from":"Client","to":"GW","label":"HTTPS","color":"blue"}]}

Rules:
- Auth/login/session/security → cs_ types
- Cloud/infra/API/microservice → cs_ types
- Electronics/hardware/circuit → electronics types
- X: 80-1100, Y: 80-580, space nodes 200-250px apart
- 6-14 nodes, always include connections
- connections.from/to must exactly match component labels`

  const data = await callGemini(prompt, { retries: 3, parseJson: true, temperature: 0.2 })
  if (!data?.components?.length) throw new Error('No components in AI response')

  const isCS = data.type !== 'electronics' && data.components.some(c => isCsType(c.type))
  onStatus({ phase: 'placing', message: `⚡ Drawing ${data.components.length} nodes...` })

  if (isCS) {
    await placeTldrawDiagram(editor, data)
  } else {
    clearCanvas(editor)
    for (const comp of data.components) {
      const def = CIRCUIT_DEFS[comp.type]
      if (!def) { console.warn('Unknown AI type:', comp.type); continue }
      try {
        editor.createShape({
          id: createShapeId(), type: 'electrical', x: comp.x, y: comp.y,
          props: { componentType: comp.type, label: comp.label, value: comp.value || def.val, w: def.w, h: def.h },
        })
      } catch (e) { console.warn('shape failed:', comp.type, e.message) }
      await new Promise(r => setTimeout(r, 25))
    }
    editor.zoomToFit({ animation: { duration: 300 } })
  }
  return { success: true, message: `✅ "${data.title}" — ${data.components.length} nodes drawn` }
}

async function placeSystemDiagram(editor, text, onStatus) {
  const template = matchTemplate(text)
  if (template) {
    onStatus({ phase: 'placing', message: `⚡ Building "${template.title}"...` })
    if (template.components.some(c => isCsType(c.type))) {
      await placeTldrawDiagram(editor, template)
    } else {
      clearCanvas(editor)
      for (const comp of template.components) {
        const def = CIRCUIT_DEFS[comp.type]
        if (!def) continue
        try {
          editor.createShape({
            id: createShapeId(), type: 'electrical', x: comp.x, y: comp.y,
            props: { componentType: comp.type, label: comp.label, value: comp.value, w: def.w, h: def.h },
          })
        } catch (e) { console.warn('template shape failed:', e.message) }
        await new Promise(r => setTimeout(r, 25))
      }
      editor.zoomToFit({ animation: { duration: 300 } })
    }
    return { success: true, message: `✅ "${template.title}" — ${template.components.length} nodes placed` }
  }
  return await generateAIDiagram(editor, text, onStatus)
}

function matchTemplate(text) {
  const t = text.toLowerCase()
  for (const [, tmpl] of Object.entries(ALL_TEMPLATES)) {
    if (tmpl.keywords && tmpl.keywords.some(kw => t.includes(kw))) return tmpl
  }
  return null
}

function isSystemDiagramRequest(text) {
  const t = text.toLowerCase()
  if (matchTemplate(t)) return true
  return /\b(diagram|circuit|schematic|design|layout|system|flow|architecture)\b/.test(t) &&
         /\b(build|create|make|generate|draw|show|design)\b/.test(t)
}

// ─── DYNAMIC COMPONENT BUILDER ────────────────────────────────────────
function generateFallbackSVG({ componentName = 'Component', shape = 'ic', pinCount = 2 }) {
  const name  = (componentName || 'Component').slice(0, 12)
  const w     = (shape === 'transistor' || shape === 'circle') ? 80 : 140
  const h     = (shape === 'transistor' || shape === 'circle') ? 80 : 60
  const cx = w / 2, cy = h / 2
  const colorMap = { ic:['#e0f2fe','#0284c7'], box:['#fef3c7','#d97706'], circle:['#fdf4ff','#a21caf'], diode:['#fef9c3','#ca8a04'], transistor:['#f1f5f9','#475569'] }
  const [fill, stroke] = colorMap[shape] || colorMap.ic
  const pins = Math.min(Math.max(pinCount, 2), 8), left = Math.ceil(pins / 2), right = Math.floor(pins / 2)
  let pinHTML = ''
  for (let i = 0; i < left; i++) { const y = Math.round(10 + i * ((h - 20) / Math.max(left - 1, 1))); pinHTML += `<line x1="0" y1="${y}" x2="10" y2="${y}" stroke="#334155" strokeWidth="2"/><circle cx="0" cy="${y}" r="3.5" fill="#6366f1" stroke="#fff" strokeWidth="1"/>` }
  for (let i = 0; i < right; i++) { const y = Math.round(10 + i * ((h - 20) / Math.max(right - 1, 1))); pinHTML += `<line x1="${w - 10}" y1="${y}" x2="${w}" y2="${y}" stroke="#334155" strokeWidth="2"/><circle cx="${w}" cy="${y}" r="3.5" fill="#6366f1" stroke="#fff" strokeWidth="1"/>` }
  const inner = `<rect x="10" y="5" width="${w - 20}" height="${h - 10}" rx="4" fill="${fill}" stroke="${stroke}" strokeWidth="1.5"/>${pinHTML}<text x="${cx}" y="${cy + 4}" textAnchor="middle" fontSize="8" fill="${stroke}" fontWeight="700" fontFamily="monospace">${name}</text><text x="${cx}" y="-8" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b" fontFamily="monospace">{{label}}</text><text x="${cx}" y="${h + 14}" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">{{value}}</text>`
  return { svgInnerContent: inner, w, h }
}

async function buildDynamicComponent(parsed) {
  const { componentKey, componentName, componentDescription, typicalValue, prefix, pinCount = 2, shape = 'ic' } = parsed
  const prompt = `Generate SVG for: "${componentName}" (${componentDescription || ''}). Return ONLY JSON: {"svgInnerContent":"...","w":140,"h":60,"typicalValue":"${typicalValue || 'std'}"}`
  try {
    const data = await callGemini(prompt, { retries: 2, parseJson: true, temperature: 0.1 })
    return { key: componentKey, label: componentName, cat: parsed.category || 'Discovered', prefix: prefix || componentName.replace(/\s+/g, '').slice(0, 3).toUpperCase(), val: data.typicalValue || typicalValue || 'std', w: data.w || 140, h: data.h || 60, desc: componentDescription || componentName, icon: '🔲', svgTemplate: data.svgInnerContent || '', isDynamic: true }
  } catch {
    const fb = generateFallbackSVG(parsed)
    return { key: componentKey, label: componentName, cat: parsed.category || 'Discovered', prefix: prefix || componentName.slice(0, 2).toUpperCase(), val: typicalValue || 'std', w: fb.w, h: fb.h, desc: componentDescription || componentName, icon: '🔲', svgTemplate: fb.svgInnerContent, isDynamic: true }
  }
}

function placeComponent(editor, key, def, qty = 1) {
  const center = editor.getViewportPageBounds().center
  const count  = Math.min(qty, 6)
  const placed = []
  for (let i = 0; i < count; i++) {
    const id      = createShapeId()
    const cols    = Math.min(count, 3)
    const offsetX = (i % cols - (Math.min(count, 3) - 1) / 2) * (def.w + 50)
    const offsetY = Math.floor(i / cols) * (def.h + 60)
    const existing = editor.getCurrentPageShapes().filter(s => s.type === 'electrical' && s.props.componentType === key).length
    try {
      editor.createShape({
        id, type: 'electrical',
        x: center.x - def.w / 2 + offsetX,
        y: center.y - def.h / 2 + offsetY,
        props: { componentType: key, label: `${def.prefix}${existing + i + 1}`, value: def.val, w: def.w, h: def.h, ...(def.isDynamic ? { svgTemplate: def.svgTemplate } : {}) },
      })
      placed.push(id)
    } catch (e) { console.warn('placeComponent failed:', key, e.message) }
  }
  if (placed.length > 0) editor.select(...placed)
  return { success: true, message: `Added ${placed.length}× ${def.label}`, componentKey: key, isDynamic: def.isDynamic }
}

// ─── COMMAND MATCHER ──────────────────────────────────────────────────
function localCommandMatch(text) {
  const t = text.toLowerCase().trim()
  if (/\b(clear|delete all|erase all|remove all|wipe|reset canvas|clear canvas|clear everything)\b/.test(t)) return { type: 'CLEAR' }
  if (/\b(undo)\b/.test(t)) return { type: 'UNDO' }
  if (/\bredo\b/.test(t)) return { type: 'REDO' }
  if (/\bselect all\b/.test(t)) return { type: 'SELECT_ALL' }
  if (/\b(delete|remove|erase)\b.*\b(selected|this|it)\b/.test(t)) return { type: 'DELETE_SELECTED' }
  if (/zoom\s+in/.test(t)) return { type: 'ZOOM', direction: 'in' }
  if (/zoom\s+out/.test(t)) return { type: 'ZOOM', direction: 'out' }
  if (/zoom.*fit|fit.*view|zoom to fit|fit all/.test(t)) return { type: 'ZOOM', direction: 'fit' }

  const numWords = { a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6 }
  let searchText = t.replace(/^(add|place|insert|put|draw|create|drop|give me|show me)\s+/i, '')
  let qty = 1
  const qm = searchText.match(/^(\d+|a|an|one|two|three|four|five|six)\s+/)
  if (qm) { qty = parseInt(numWords[qm[1]] || qm[1]) || 1; searchText = searchText.slice(qm[0].length) }

  const sorted = Object.keys(VOICE_ALIASES).sort((a, b) => b.length - a.length)
  for (const alias of sorted) {
    if (searchText.includes(alias) || t.includes(alias)) {
      const key = VOICE_ALIASES[alias]
      if (ALL_DEFS[key]) return { type: 'ADD_KNOWN', componentKey: key, qty }
    }
  }

  if (/(rectangle|box|rect|square)/.test(t) && /\b(draw|add|place|create|make)\b/.test(t))
    return { type: 'TLDRAW_SHAPE', geo: 'rectangle', color: /red/.test(t) ? 'red' : /blue/.test(t) ? 'blue' : /green/.test(t) ? 'green' : 'violet', fill: /filled|solid/.test(t) ? 'solid' : 'semi' }
  if (/(circle|ellipse|oval)/.test(t) && /\b(draw|add|place|create|make)\b/.test(t))
    return { type: 'TLDRAW_SHAPE', geo: 'ellipse', color: 'blue', fill: 'semi' }
  if (/(diamond|decision)/.test(t) && /\b(draw|add|place|create|make)\b/.test(t))
    return { type: 'TLDRAW_SHAPE', geo: 'diamond', color: 'yellow', fill: 'semi' }
  if (/\b(cloud)\b/.test(t) && /\b(draw|add|place|create|make)\b/.test(t))
    return { type: 'TLDRAW_SHAPE', geo: 'cloud', color: 'light-blue', fill: 'semi' }
  if (/\b(arrow|line|connection|connect)\b/.test(t) && /\b(draw|add|place|create|make)\b/.test(t))
    return { type: 'TLDRAW_ARROW' }
  if (/\b(text|label|note|write)\b/.test(t) && /\b(add|place|create|make|write)\b/.test(t)) {
    const match = t.match(/(?:text|label|note|write)[:\s]+["']?(.+?)["']?$/)
    return { type: 'TLDRAW_TEXT', text: match?.[1] || 'Label' }
  }
  if (/\bsticky\b|\bnote\b/.test(t) && /\b(add|place|create|make)\b/.test(t))
    return { type: 'TLDRAW_STICKY' }
  return null
}

async function aiParseCommand(transcript) {
  const knownKeys = [...Object.keys(CIRCUIT_DEFS), ...Object.keys(CS_DEFS)].join(', ')
  const prompt = `Parse this voice command for a circuit/diagram app. Return ONLY valid JSON.
Voice: "${transcript}"
Known keys: [${knownKeys}]
Return ONE of:
{"action":"ADD","componentKey":"resistor","qty":1,"isKnown":true}
{"action":"ADD","componentKey":"hall_sensor","qty":1,"isKnown":false,"componentName":"Hall Sensor","componentDescription":"Magnetic sensor","typicalValue":"SS49E","prefix":"HS","category":"Sensors","pinCount":3,"shape":"ic"}
{"action":"CLEAR"} {"action":"UNDO"} {"action":"REDO"} {"action":"SELECT_ALL"} {"action":"DELETE_SELECTED"}
{"action":"ZOOM","direction":"in"} {"action":"ZOOM","direction":"out"} {"action":"ZOOM","direction":"fit"}
{"action":"UNKNOWN","message":"reason"}`
  return await callGemini(prompt, { retries: 3, parseJson: true, temperature: 0.1 })
}

function executeLocalCommand(editor, cmd) {
  switch (cmd.type) {
    case 'CLEAR':          clearCanvas(editor); return { success: true, message: 'Canvas cleared' }
    case 'UNDO':           editor.undo();       return { success: true, message: 'Undo' }
    case 'REDO':           editor.redo();       return { success: true, message: 'Redo' }
    case 'SELECT_ALL':     editor.selectAll();  return { success: true, message: 'Selected all' }
    case 'DELETE_SELECTED': {
      const ids = editor.getSelectedShapeIds()
      if (ids.length > 0) editor.deleteShapes(ids)
      return { success: true, message: `Deleted ${ids.length} shape(s)` }
    }
    case 'ZOOM':
      if (cmd.direction === 'in') editor.zoomIn()
      else if (cmd.direction === 'out') editor.zoomOut()
      else editor.zoomToFit()
      return { success: true, message: `Zoomed ${cmd.direction}` }
    case 'ADD_KNOWN': {
      const def = ALL_DEFS[cmd.componentKey]
      if (!def) return { success: false, message: `Unknown: ${cmd.componentKey}` }
      return placeComponent(editor, cmd.componentKey, def, cmd.qty || 1)
    }
    case 'TLDRAW_SHAPE': {
      const vp = editor.getViewportPageBounds()
      const cx = vp.x + vp.w / 2, cy = vp.y + vp.h / 2
      const id = createShapeId()
      try {
        editor.createShape({ id, type: 'geo', x: cx - 80, y: cy - 50, props: { geo: cmd.geo, w: 160, h: 100, color: cmd.color, fill: cmd.fill, dash: 'draw', size: 'm' } })
        editor.select(id)
      } catch (e) { console.warn('geo shape failed:', e.message) }
      return { success: true, message: 'Shape placed' }
    }
    case 'TLDRAW_ARROW': {
      const vp = editor.getViewportPageBounds()
      const cx = vp.x + vp.w / 2, cy = vp.y + vp.h / 2
      const id = createShapeId()
      try {
        editor.createShape({ id, type: 'arrow', x: 0, y: 0, props: { color: 'grey', size: 'm', dash: 'draw', fill: 'none', arrowheadEnd: 'arrow', arrowheadStart: 'none', bend: 0, text: '', font: 'draw', start: { x: cx - 80, y: cy }, end: { x: cx + 80, y: cy } } })
        editor.select(id)
      } catch (e) { console.warn('arrow failed:', e.message) }
      return { success: true, message: 'Drew arrow — drag endpoints to connect shapes' }
    }
    case 'TLDRAW_TEXT': {
      const vp = editor.getViewportPageBounds()
      const id = createShapeId()
      try {
        editor.createShape({ id, type: 'text', x: vp.x + vp.w / 2 - 100 + (Math.random() - .5) * 120, y: vp.y + vp.h / 2 + (Math.random() - .5) * 120, props: { text: cmd.text || 'Label', color: 'violet', size: 'l', font: 'draw', align: 'middle', w: 220, autoSize: true } })
        editor.select(id)
      } catch (e) { console.warn('text failed:', e.message) }
      return { success: true, message: `Added text: "${cmd.text}"` }
    }
    case 'TLDRAW_STICKY': {
      const vp = editor.getViewportPageBounds()
      const id = createShapeId()
      try {
        editor.createShape({ id, type: 'note', x: vp.x + vp.w / 2 - 100 + (Math.random() - .5) * 160, y: vp.y + vp.h / 2 - 100 + (Math.random() - .5) * 160, props: { color: 'yellow', size: 'm', font: 'draw', text: 'Note', align: 'middle' } })
        editor.select(id)
      } catch (e) { console.warn('note failed:', e.message) }
      return { success: true, message: 'Added sticky note' }
    }
    default: return { success: false, message: `Unknown command: ${cmd.type}` }
  }
}

// FIX: Removed stray 幕 character that caused syntax crash
async function smartExecuteVoiceCommand(editor, transcript, onStatus) {
  const text = transcript.trim()
  onStatus({ phase: 'local', message: `"${text}"` })

  if (isSystemDiagramRequest(text)) {
    try { return await placeSystemDiagram(editor, text, onStatus) }
    catch (e) { onStatus({ phase: 'error', message: `Diagram failed: ${e.message}` }) }
  }

  const local = localCommandMatch(text)
  if (local) return executeLocalCommand(editor, local)

  onStatus({ phase: 'ai', message: '🧠 Understanding command...' })
  let parsed
  try { parsed = await aiParseCommand(text) }
  catch (e) { return { success: false, message: `Could not process: "${text}". Try: "add [component]" or "[flow type] flow"` } }

  if (!parsed || parsed.action === 'UNKNOWN') return { success: false, message: parsed?.message || `Not understood. Try: "add redis" or "authentication flow"` }
  if (parsed.action !== 'ADD') return executeLocalCommand(editor, { type: parsed.action, direction: parsed.direction })
  if (parsed.isKnown && ALL_DEFS[parsed.componentKey]) return placeComponent(editor, parsed.componentKey, ALL_DEFS[parsed.componentKey], parsed.qty || 1)
  if (DYNAMIC_COMPONENTS[parsed.componentKey]) return placeComponent(editor, parsed.componentKey, DYNAMIC_COMPONENTS[parsed.componentKey], parsed.qty || 1)

  onStatus({ phase: 'search', message: `🔧 Building symbol for "${parsed.componentName}"...` })
  const dynDef = await buildDynamicComponent(parsed)
  DYNAMIC_COMPONENTS[dynDef.key] = dynDef
  return placeComponent(editor, dynDef.key, dynDef, parsed.qty || 1)
}

// ─── ELECTRICAL SHAPE UTIL ────────────────────────────────────────────
class ElectricalShapeUtil extends BaseBoxShapeUtil {
  static type  = 'electrical'
  static props = {
    w:             T.number,
    h:             T.number,
    componentType: T.string,
    label:         T.string,
    value:         T.string,
    svgTemplate:   T.optional(T.string),
  }

  getDefaultProps() {
    return { w: 140, h: 55, componentType: 'resistor', label: 'R1', value: '1kΩ', svgTemplate: undefined }
  }

  component(shape) {
    const { componentType, label, value, w, h, svgTemplate } = shape.props
    if (svgTemplate) {
      return <HTMLContainer style={{ pointerEvents: 'none', width: w, height: h, overflow: 'visible' }}>
        <DynamicComponentSVG w={w} h={h} label={label} value={value} svgTemplate={svgTemplate} />
      </HTMLContainer>
    }
    const def  = ALL_DEFS[componentType] || CIRCUIT_DEFS.resistor
    const Comp = def.Svg
    return <HTMLContainer style={{ pointerEvents: 'none', width: w, height: h, overflow: 'visible' }}>
      <Comp w={w} h={h} label={label} value={value} />
    </HTMLContainer>
  }

  // ADD THIS — required by newer tldraw versions
  getIndicatorPath(shape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }

  // KEEP THIS as legacy fallback
  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />
  }
}

const SHAPE_UTILS = [ElectricalShapeUtil]

// ─── AI CIRCUIT GENERATOR MODAL ───────────────────────────────────────
function AiCircuitGenerator({ isOpen, onClose }) {
  const editor = useEditor()
  const [prompt,  setPrompt]  = useState('')
  const [loading, setLoading] = useState(false)
  const [status,  setStatus]  = useState('')
  const [error,   setError]   = useState('')

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true); setError(''); setStatus('🧠 Asking Gemini AI...')
    const allKeys      = [...Object.keys(CIRCUIT_DEFS), ...Object.keys(CS_DEFS)].join(', ')
    const systemPrompt = `You are an expert system architect and electronics engineer.
Given a description, output ONLY a valid JSON object — no markdown, no explanation.
Available component keys: [${allKeys}]
JSON shape:
{"title":"Name","description":"Brief","type":"cs","components":[{"type":"cs_user","label":"Client","value":"Browser","x":200,"y":300}],"connections":[{"from":"Client","to":"GW","label":"HTTPS","color":"blue"}]}
Rules:
- Software/auth/cloud/API → cs_ prefixed types
- Hardware/circuit        → electronics types
- X: 50-1100, Y: 80-700, 4-14 nodes
- connections[].from/to must exactly match a component label`

    try {
      const data = await callGemini(`${systemPrompt}\n\nRequest: "${prompt}"`, { retries: 3, parseJson: true, temperature: 0.3 })
      if (!data?.components?.length) throw new Error('AI returned no components')

      setStatus(`✅ Placing ${data.components.length} components...`)
      const hasCS = data.components.some(c => isCsType(c.type))
      if (hasCS) {
        await placeTldrawDiagram(editor, data)
      } else {
        clearCanvas(editor)
        for (const comp of data.components) {
          const def = CIRCUIT_DEFS[comp.type]
          if (!def) { console.warn('Unknown type from AI:', comp.type); continue }
          try {
            editor.createShape({
              id: createShapeId(), type: 'electrical', x: comp.x || 200, y: comp.y || 300,
              props: { componentType: comp.type, label: comp.label || def.prefix, value: comp.value || def.val, w: def.w, h: def.h },
            })
          } catch (e) { console.warn('shape failed:', comp.type, e.message) }
          await new Promise(r => setTimeout(r, 50))
        }
        editor.zoomToFit({ animation: { duration: 300 } })
      }
      setStatus(`🎉 "${data.title}" generated!`)
      setTimeout(() => { onClose(); setStatus(''); setPrompt('') }, 2000)
    } catch (err) {
      setError('AI Error: ' + err.message); setStatus('')
    } finally { setLoading(false) }
  }

  if (!isOpen) return null
  const F = "'JetBrains Mono','Courier New',monospace"
  const examples = [
    'Authentication flow with JWT and MFA',
    'Microservices with Kafka event bus',
    'AWS cloud architecture with CDN',
    'CI/CD pipeline with Docker and K8s',
    'LED flasher with 555 timer',
    'Audio amplifier with op-amp',
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: 540, background: '#0f172a', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.3)', fontFamily: F, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#e0e7ff', fontWeight: 700, fontSize: 15, letterSpacing: '0.04em' }}>AI Diagram Generator</div>
            <div style={{ color: '#818cf8', fontSize: 10, marginTop: 2 }}> · Electronics + CS Diagrams</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94a3b8', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Describe your diagram or circuit</div>
          <textarea
            value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. Authentication flow with OAuth2, JWT tokens, MFA, and Redis session cache..."
            rows={3}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(15,23,42,0.8)', color: '#e0e7ff', fontSize: 11, fontFamily: F, resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) generate() }}
          />
          <div style={{ fontSize: 9, color: '#334155', marginTop: 6 }}>Ctrl+Enter to generate</div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Quick Examples</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {examples.map(ex => (
                <button key={ex} onClick={() => setPrompt(ex)} style={{ padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 9, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', fontFamily: F }}>{ex}</button>
              ))}
            </div>
          </div>
          {status && <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 10, color: '#6ee7b7' }}>{status}</div>}
          {error  && <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)',  border: '1px solid rgba(239,68,68,0.25)',  fontSize: 10, color: '#fca5a5' }}>⚠ {error}</div>}
          <button
            onClick={generate} disabled={loading || !prompt.trim()}
            style={{ width: '100%', marginTop: 18, padding: '13px', borderRadius: 11, border: 'none', cursor: loading || !prompt.trim() ? 'default' : 'pointer', background: loading || !prompt.trim() ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', opacity: !prompt.trim() ? 0.5 : 1, fontFamily: F }}
          >
            {loading ? '⏳ Generating...' : '✨ Generate with AI'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AI ASSISTANT PANEL ───────────────────────────────────────────────
function AiAssistant() {
  const editor = useEditor()
  const [loading,       setLoading]       = useState(false)
  const [suggestions,   setSuggestions]   = useState([])
  const [answer,        setAnswer]        = useState('')
  const [reason,        setReason]        = useState('')
  const [error,         setError]         = useState(null)
  const [selectedText,  setSelectedText]  = useState(null)
  const [isTextMode,    setIsTextMode]    = useState(false)
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // FIX: debounced listener prevents re-render storms
  useEffect(() => {
    let debounce = null
    const unsub = editor.store.listen(() => {
      clearTimeout(debounce)
      debounce = setTimeout(() => {
        if (!mountedRef.current) return
        try {
          const ids = editor.getSelectedShapeIds()
          if (ids.length === 1) {
            const shape = editor.getShape(ids[0])
            if (shape && shape.type !== 'electrical') {
              const txt = extractShapeText(shape)
              if (txt.length > 0) { setSelectedText(txt); setIsTextMode(true); return }
            }
          }
          setSelectedText(null); setIsTextMode(false)
        } catch (_) { /* ignore */ }
      }, 120)
    }, { source: 'all', scope: 'document' })
    return () => { clearTimeout(debounce); unsub() }
  }, [editor])

  const analyze = async () => {
    if (!mountedRef.current) return
    setLoading(true); setError(null); setAnswer(''); setSuggestions([]); setReason('')

    const allShapes = editor.getCurrentPageShapes()
    const comps     = allShapes.filter(s => s.type === 'electrical').map(s => ({ type: s.props.componentType, label: s.props.label, value: s.props.value }))
    const allKeys   = [...Object.keys(CIRCUIT_DEFS), ...Object.keys(CS_DEFS)].join(', ')

    let prompt = ''
    if (isTextMode && selectedText) {
      prompt = `You are an electronics/CS expert. The user selected: "${selectedText}".
Give 1-2 sentence insight and suggest exactly 3 relevant component keys from [${allKeys}].
Return ONLY valid JSON: {"answer":"insight","suggestions":["k1","k2","k3"],"reason":"why"}`
    } else {
      if (comps.length === 0) { setError('Add components to the canvas first.'); setLoading(false); return }
      prompt = `You are an electronics/CS expert. Canvas components: ${JSON.stringify(comps)}.
Give 1-2 sentence insight and suggest 2-3 missing component keys from [${allKeys}].
Return ONLY valid JSON: {"answer":"insight","suggestions":["k1","k2"],"reason":"why"}`
    }

    try {
      const parsed = await callGemini(prompt, { retries: 3, parseJson: true, temperature: 0.2 })
      if (!mountedRef.current) return
      setAnswer(parsed.answer || '')
      setReason(parsed.reason || '')
      setSuggestions((parsed.suggestions || []).filter(k => ALL_DEFS[k]).slice(0, 4))
    } catch (err) {
      if (!mountedRef.current) return
      setError('AI Error: ' + err.message)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  // FIX: always use 'electrical' type — avoids tldraw geo schema crash for CS nodes
  const addSuggested = useCallback((type) => {
    const def = ALL_DEFS[type]
    if (!def) return
    const center = editor.getViewportPageBounds().center
    const jitter = () => (Math.random() - 0.5) * 80
    try {
      editor.createShape({
        id: createShapeId(), type: 'electrical',
        x: center.x - (def.w || 140) / 2 + jitter(),
        y: center.y - (def.h || 60)  / 2 + jitter(),
        props: { componentType: type, label: `AI_${def.prefix || type.slice(0, 3).toUpperCase()}`, value: def.val || '', w: def.w || 140, h: def.h || 60 },
      })
    } catch (e) { console.warn('addSuggested failed:', e.message) }
    setSuggestions(s => s.filter(i => i !== type))
  }, [editor])

  const F = "'JetBrains Mono','Courier New',monospace"

  return (
    <>
      <AiCircuitGenerator isOpen={generatorOpen} onClose={() => setGeneratorOpen(false)} />
      <div style={{ position: 'fixed', bottom: 100, right: 24, zIndex: 999, width: 296, background: '#0f172a', borderRadius: 18, boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.25)', fontFamily: F, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🧠</div>
            <div>
              <div style={{ color: '#e0e7ff', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em' }}>CIRCUIT + CS AI</div>
              <div style={{ color: '#818cf8', fontSize: 9, marginTop: 2 }}>{isTextMode ? 'Text Mode' : 'Canvas Mode'} · </div>
            </div>
          </div>
          <button onClick={() => setGeneratorOpen(true)} style={{ width: '100%', padding: '9px', borderRadius: 9, border: '1px solid rgba(251,191,36,0.4)', cursor: 'pointer', background: 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(245,158,11,0.1))', color: '#fbbf24', fontWeight: 700, fontSize: 10, letterSpacing: '0.05em', fontFamily: F }}>
            ✨ Text → Diagram Generator
          </button>
        </div>
        <div style={{ padding: '14px' }}>
          {isTextMode && selectedText && (
            <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 10, padding: '8px 10px', marginBottom: 12 }}>
              <div style={{ color: '#6366f1', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Selected Text</div>
              <div style={{ color: '#cbd5e1', fontSize: 10, fontStyle: 'italic', wordBreak: 'break-word', lineHeight: 1.5 }}>"{selectedText.length > 100 ? selectedText.slice(0, 100) + '…' : selectedText}"</div>
            </div>
          )}
          {answer && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
              <div style={{ color: '#34d399', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>⚡ Insight</div>
              <div style={{ color: '#6ee7b7', fontSize: 10, lineHeight: 1.6 }}>{answer}</div>
            </div>
          )}
          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '8px 10px', fontSize: 10, color: '#fca5a5', marginBottom: 10 }}>⚠ {error}</div>}
          <button
            onClick={analyze} disabled={loading}
            style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', cursor: loading ? 'default' : 'pointer', background: loading ? '#1e293b' : isTextMode ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', opacity: loading ? 0.6 : 1, marginBottom: 12, fontFamily: F }}
          >
            {loading ? '⏳ Analyzing...' : isTextMode ? '✦ Analyze Selected Text' : '⚡ Analyze Canvas'}
          </button>
          {suggestions.length > 0 && (
            <div>
              {reason && <div style={{ fontSize: 9, color: '#475569', marginBottom: 8, lineHeight: 1.5 }}>{reason}</div>}
              <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>◆ Suggested</div>
              {suggestions.map(type => {
                const def = ALL_DEFS[type]; if (!def) return null
                return (
                  <button key={type} onClick={() => addSuggested(type)} style={{ width: '100%', marginBottom: 6, padding: '9px 12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: F }}>
                    <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{def.icon || '🔲'}</span>
                    <div style={{ flex: 1, textAlign: 'left' }}><div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc' }}>{def.label}</div><div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{def.desc}</div></div>
                    <span style={{ fontSize: 15, color: '#6366f1', fontWeight: 700 }}>+</span>
                  </button>
                )
              })}
              <button onClick={() => { setSuggestions([]); setAnswer(''); setReason('') }} style={{ width: '100%', padding: '5px', fontSize: 9, color: '#334155', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F }}>CLEAR</button>
            </div>
          )}
          {!isTextMode && suggestions.length === 0 && !answer && !loading && (
            <div style={{ fontSize: 9, color: '#334155', textAlign: 'center', lineHeight: 1.7 }}>
              Select a <span style={{ color: '#6366f1' }}>text box</span> for text AI<br />
              or click analyze for <span style={{ color: '#0ea5e9' }}>canvas insights</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── LIBRARY PANEL ────────────────────────────────────────────────────
function LibraryPanel() {
  const editor = useEditor()
  const countersRef = useRef({})
  const [open,        setOpen]       = useState(false)
  const [search,      setSearch]     = useState('')
  const [activeTab,   setActiveTab]  = useState('electronics')
  const [activeCat,   setActiveCat]  = useState(CATEGORIES[0])
  const [activeCsCAT, setActiveCSCat]= useState(CS_CATEGORIES[0])
  const panelRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const addElectronics = useCallback((type) => {
    const def   = CIRCUIT_DEFS[type]
    const count = (countersRef.current[def.prefix] || 0) + 1
    countersRef.current[def.prefix] = count
    const center = editor.getViewportPageBounds().center
    try {
      editor.createShape({ id: createShapeId(), type: 'electrical', x: center.x - def.w / 2 + Math.random() * 60 - 30, y: center.y - def.h / 2 + Math.random() * 60 - 30, props: { componentType: type, label: `${def.prefix}${count}`, value: def.val, w: def.w, h: def.h } })
    } catch (e) { console.warn('addElectronics failed:', e.message) }
  }, [editor])

  const addCSNode = useCallback((type) => {
    const def    = CS_DEFS[type]
    const center = editor.getViewportPageBounds().center
    try {
      editor.createShape({ id: createShapeId(), type: 'electrical', x: center.x - def.w / 2 + (Math.random() * 60 - 30), y: center.y - def.h / 2 + (Math.random() * 60 - 30), props: { componentType: type, label: def.prefix, value: def.val, w: def.w, h: def.h } })
    } catch (e) { console.warn('addCSNode failed:', e.message) }
  }, [editor])

  const q          = search.toLowerCase()
  const elecFiltered = Object.entries(CIRCUIT_DEFS).filter(([key, def]) => !q || def.label.toLowerCase().includes(q) || def.desc.toLowerCase().includes(q) || key.toLowerCase().includes(q))
  const csFiltered   = Object.entries(CS_DEFS).filter(([key, def]) => !q || def.label.toLowerCase().includes(q) || def.desc.toLowerCase().includes(q) || key.toLowerCase().includes(q))
  const elecInCat    = q ? elecFiltered : elecFiltered.filter(([, d]) => d.cat === activeCat)
  const csInCat      = q ? csFiltered   : csFiltered.filter(([, d]) => d.cat === activeCsCAT)

  const F = "'JetBrains Mono','Courier New',monospace"
  return (
    <div ref={panelRef} style={{ position: 'fixed', top: 16, left: 16, zIndex: 999 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: open ? 'linear-gradient(135deg,#312e81,#1e1b4b)' : '#0f172a', border: '1px solid rgba(99,102,241,0.35)', borderRadius: open ? '14px 14px 0 0' : 14, cursor: 'pointer', fontFamily: F, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ color: '#e0e7ff', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em' }}>COMPONENT LIBRARY</div>
          <div style={{ color: '#6366f1', fontSize: 9, marginTop: 1 }}>{Object.keys(CIRCUIT_DEFS).length} Electronics · {Object.keys(CS_DEFS).length} CS Nodes</div>
        </div>
        <span style={{ color: '#475569', fontSize: 12, marginLeft: 4, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
      </button>

      {open && (
        <div style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.2)', borderTop: 'none', borderRadius: '0 14px 14px 14px', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', width: 620, maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: F }}>
          <div style={{ padding: '12px 14px 0', borderBottom: '1px solid rgba(99,102,241,0.1)', flexShrink: 0 }}>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#475569' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all components and CS nodes..." autoFocus
                style={{ width: '100%', padding: '8px 28px 8px 28px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(15,23,42,0.9)', color: '#e0e7ff', fontSize: 10, outline: 'none', boxSizing: 'border-box', fontFamily: F }}
              />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 11, padding: 0 }}>✕</button>}
            </div>
            {!q && (
              <div style={{ display: 'flex', gap: 2, marginBottom: 0 }}>
                <button onClick={() => setActiveTab('electronics')} style={{ padding: '7px 16px', border: 'none', cursor: 'pointer', background: activeTab === 'electronics' ? 'rgba(99,102,241,0.3)' : 'transparent', borderBottom: activeTab === 'electronics' ? '2px solid #6366f1' : '2px solid transparent', borderRadius: '8px 8px 0 0', color: activeTab === 'electronics' ? '#a5b4fc' : '#475569', fontSize: 10, fontWeight: activeTab === 'electronics' ? 700 : 400, fontFamily: F }}>⚡ Electronics</button>
                <button onClick={() => setActiveTab('cs')} style={{ padding: '7px 16px', border: 'none', cursor: 'pointer', background: activeTab === 'cs' ? 'rgba(52,211,153,0.2)' : 'transparent', borderBottom: activeTab === 'cs' ? '2px solid #34d399' : '2px solid transparent', borderRadius: '8px 8px 0 0', color: activeTab === 'cs' ? '#6ee7b7' : '#475569', fontSize: 10, fontWeight: activeTab === 'cs' ? 700 : 400, fontFamily: F }}>🖥️ CS Nodes</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {!q && (
              <div style={{ width: 130, borderRight: '1px solid rgba(99,102,241,0.1)', overflowY: 'auto', flexShrink: 0, padding: '8px 0' }}>
                {(activeTab === 'electronics' ? CATEGORIES : CS_CATEGORIES).map(cat => {
                  const isActive = activeTab === 'electronics' ? (cat === activeCat) : (cat === activeCsCAT)
                  const setActive = activeTab === 'electronics' ? setActiveCat : setActiveCSCat
                  return (
                    <button key={cat} onClick={() => setActive(cat)} style={{ width: '100%', padding: '8px 12px', background: isActive ? 'rgba(99,102,241,0.18)' : 'none', border: 'none', borderLeft: `3px solid ${isActive ? '#6366f1' : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: F }}>
                      <span style={{ fontSize: 9, color: isActive ? '#a5b4fc' : '#64748b', fontWeight: isActive ? 700 : 400, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3 }}>{cat.replace('CS: ', '')}</span>
                    </button>
                  )
                })}
              </div>
            )}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
              {q && <div style={{ fontSize: 9, color: '#475569', marginBottom: 8 }}>{elecFiltered.length + csFiltered.length} results for "{q}"</div>}
              {(q || activeTab === 'electronics') && (
                <>
                  {q && <div style={{ fontSize: 9, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>⚡ Electronics ({elecFiltered.length})</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6, marginBottom: 12 }}>
                    {elecInCat.map(([key, def]) => (
                      <button key={key} onClick={() => addElectronics(key)} style={{ padding: '10px 12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, fontFamily: F, textAlign: 'left' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)' }}>
                        <span style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 }}>{def.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{def.label}</div><div style={{ fontSize: 9, color: '#475569', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{def.desc}</div></div>
                        <span style={{ fontSize: 16, color: '#4f46e5', fontWeight: 700, flexShrink: 0 }}>+</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {(q || activeTab === 'cs') && (
                <>
                  {q && <div style={{ fontSize: 9, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>🖥️ CS Nodes ({csFiltered.length})</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
                    {csInCat.map(([key, def]) => (
                      <button key={key} onClick={() => addCSNode(key)} style={{ padding: '10px 12px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, fontFamily: F, textAlign: 'left' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.05)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.15)' }}>
                        <span style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 }}>{def.icon || '🔲'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{def.label}</div><div style={{ fontSize: 9, color: '#475569', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{def.desc}</div></div>
                        <span style={{ fontSize: 16, color: '#34d399', fontWeight: 700, flexShrink: 0 }}>+</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(99,102,241,0.1)', flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: '#334155', textAlign: 'center' }}>Click any item to place · {Object.keys(CIRCUIT_DEFS).length} electronics + {Object.keys(CS_DEFS).length} CS nodes</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DISCOVERED PANEL ─────────────────────────────────────────────────
function DiscoveredPanel() {
  const [open, setOpen] = useState(false)
  const editor = useEditor()
  const [, forceRender] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => { if (Object.keys(DYNAMIC_COMPONENTS).length > 0) forceRender(n => n + 1) }, 1500)
    return () => clearInterval(interval)
  }, [])
  const keys = Object.keys(DYNAMIC_COMPONENTS)
  if (keys.length === 0) return null
  const F = "'JetBrains Mono','Courier New',monospace"
  return (
    <div style={{ position: 'fixed', top: 16, right: 24, zIndex: 999, fontFamily: F }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#0f172a', border: '1px solid rgba(52,211,153,0.4)', borderRadius: open ? '12px 12px 0 0' : 12, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <span style={{ fontSize: 14 }}>🔍</span>
        <div><div style={{ color: '#34d399', fontWeight: 700, fontSize: 11 }}>DISCOVERED</div><div style={{ color: '#059669', fontSize: 9 }}>{keys.length} new component{keys.length !== 1 ? 's' : ''}</div></div>
        <span style={{ color: '#475569', fontSize: 11, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>
      {open && (
        <div style={{ background: '#0f172a', border: '1px solid rgba(52,211,153,0.2)', borderTop: 'none', borderRadius: '0 0 12px 12px', width: 260, maxHeight: 320, overflowY: 'auto', boxShadow: '0 16px 40px rgba(0,0,0,0.6)', padding: '8px' }}>
          {keys.map(key => { const def = DYNAMIC_COMPONENTS[key]; return (
            <button key={key} onClick={() => placeComponent(editor, key, def, 1)} style={{ width: '100%', padding: '9px 10px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, fontFamily: F, textAlign: 'left' }}>
              <span style={{ fontSize: 16 }}>{def.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#6ee7b7' }}>{def.label}</div><div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{def.desc}</div></div>
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: 15 }}>+</span>
            </button>
          )})}
        </div>
      )}
    </div>
  )
}

// ─── VOICE MIC BUTTON ─────────────────────────────────────────────────
function VoiceMicButton({ onCommandAsync }) {
  const [listening,   setListening]   = useState(false)
  const [status,      setStatus]      = useState(null)
  const [processing,  setProcessing]  = useState(false)
  const [lastResult,  setLastResult]  = useState(null)
  const recognitionRef = useRef(null)
  const timeoutRef     = useRef(null)
  const isSupported    = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const phaseColors = { local:'#a5b4fc', ai:'#fbbf24', search:'#34d399', placing:'#6ee7b7', done:'#6ee7b7', error:'#fca5a5' }
  const phaseIcons  = { local:'🎤', ai:'🧠', search:'🔍', placing:'⚡', done:'✅', error:'⚠️' }

  const clearStatus = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => { setStatus(null); setLastResult(null) }, 4000)
  }

  const startListening = useCallback(() => {
    if (!isSupported) { setStatus({ phase: 'error', message: 'Voice not supported' }); return }
    setStatus(null); setLastResult(null)
    const SR          = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.continuous      = false
    recognition.interimResults  = true
    recognition.lang            = 'en-US'
    recognition.maxAlternatives = 3

    recognition.onstart = () => setListening(true)
    recognition.onresult = async (event) => {
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript
      }
      if (finalText) {
        setStatus({ phase: 'local', message: `"${finalText}"` }); setProcessing(true)
        try {
          const result = await onCommandAsync(finalText, s => setStatus(s))
          setLastResult(result)
          setStatus({ phase: result.success ? 'done' : 'error', message: result.message })
          clearStatus()
        } catch (e) { setStatus({ phase: 'error', message: e.message }); clearStatus() }
        finally { setProcessing(false) }
      }
    }
    recognition.onerror = (e) => { if (e.error !== 'aborted') setStatus({ phase: 'error', message: e.error === 'not-allowed' ? 'Mic denied' : e.error }); setListening(false) }
    recognition.onend   = () => setListening(false)
    recognition.start()
  }, [isSupported, onCommandAsync])

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setListening(false) }, [])
  useEffect(() => () => { recognitionRef.current?.abort(); clearTimeout(timeoutRef.current) }, [])

  if (!isSupported) return null
  const color = status ? (phaseColors[status.phase] || '#94a3b8') : '#6366f1'
  const icon  = status ? (phaseIcons[status.phase]  || '🎤')     : '🎤'

  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, fontFamily: "'JetBrains Mono','Courier New',monospace", pointerEvents: 'none' }}>
      <style>{`@keyframes voicePulse{0%,100%{box-shadow:0 0 0 4px rgba(239,68,68,0.25),0 8px 30px rgba(0,0,0,0.5)}50%{box-shadow:0 0 0 14px rgba(239,68,68,0.1),0 8px 30px rgba(0,0,0,0.5)}}@keyframes processPulse{0%,100%{box-shadow:0 0 0 4px rgba(251,191,36,0.25),0 8px 30px rgba(0,0,0,0.5)}50%{box-shadow:0 0 0 14px rgba(251,191,36,0.1),0 8px 30px rgba(0,0,0,0.5)}}`}</style>
      {status && (
        <div style={{ background: 'rgba(10,14,26,0.97)', border: `1px solid ${color}44`, borderRadius: 12, padding: '9px 16px', fontSize: 11, color, maxWidth: 380, textAlign: 'center', lineHeight: 1.5, pointerEvents: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
          <span style={{ marginRight: 6 }}>{icon}</span>{status.message}
          {lastResult?.isDynamic && <div style={{ marginTop: 4, fontSize: 9, color: '#34d399' }}>✦ NEW COMPONENT CACHED</div>}
        </div>
      )}
      <button
        onClick={listening ? stopListening : startListening} disabled={processing}
        style={{ width: 58, height: 58, borderRadius: '50%', pointerEvents: 'all', background: listening ? 'linear-gradient(135deg,#ef4444,#dc2626)' : processing ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', cursor: processing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: listening ? 'voicePulse 1.6s infinite' : processing ? 'processPulse 1s infinite' : 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {listening
            ? <rect x="7" y="7" width="10" height="10" rx="2" fill="#fff" />
            : processing
              ? <circle cx="12" cy="12" r="5" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8 4"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" /></circle>
              : <><rect x="9" y="2" width="6" height="11" rx="3" fill="#fff" /><path d="M5 10a7 7 0 0 0 14 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /><line x1="12" y1="17" x2="12" y2="21" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><line x1="8.5" y1="21" x2="15.5" y2="21" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></>
          }
        </svg>
      </button>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: listening ? '#ef4444' : processing ? '#fbbf24' : '#6366f1', textShadow: '0 1px 6px rgba(0,0,0,0.8)', pointerEvents: 'none' }}>
        {listening ? '● REC' : processing ? '⏳ THINKING' : '🎤 VOICE AI'}
      </div>
    </div>
  )
}

function VoiceLayer() {
  const editor = useEditor()
  const handleCommandAsync = useCallback(async (transcript, onStatus) => smartExecuteVoiceCommand(editor, transcript, onStatus), [editor])
  return <><VoiceMicButton onCommandAsync={handleCommandAsync} /><DiscoveredPanel /></>
}

// ─── VOICE HELP ───────────────────────────────────────────────────────
function VoiceHelp() {
  const [open, setOpen] = useState(false)
  const [tab,  setTab]  = useState('cs')
  const TABS = [
    { id:'cs',      icon:'🖥️', label:'CS Diagrams' },
    { id:'circuits',icon:'⚡', label:'Electronics' },
    { id:'shapes',  icon:'✏️', label:'Shapes' },
    { id:'canvas',  icon:'🎛️', label:'Canvas' },
  ]
  const CONTENT = {
    cs:[
      { heading:'🗺️ System Diagram Commands', color:'#34d399', tip:'Say these → full diagram placed automatically', items:[
        { say:'authentication flow',     gets:'WAF → Gateway → Auth Server → JWT → MFA → Redis' },
        { say:'microservices architecture',gets:'LB → Gateway → Services → Kafka → DBs' },
        { say:'ci cd pipeline',          gets:'Git → CI → Docker → Registry → K8s → Prod' },
        { say:'cloud architecture',      gets:'CDN → WAF → LB → K8s → RDS + Redis + S3' },
        { say:'event driven architecture',gets:'Producers → Kafka → Consumers → EventStore' },
        { say:'real time system',        gets:'Browser → WebSocket GW → RT Server → Redis' },
        { say:'database design',         gets:'App → Caches → Primary → Replica → DW' },
      ]},
      { heading:'🧩 Add CS Nodes', color:'#818cf8', tip:'"add [node]"', items:[
        { say:'add api gateway',   gets:'🚪 API Gateway node' },
        { say:'add database',      gets:'🗄️ SQL Database' },
        { say:'add redis',         gets:'⚡ Redis Cache' },
        { say:'add kafka',         gets:'🌊 Kafka broker' },
        { say:'add kubernetes',    gets:'☸️ K8s cluster' },
        { say:'add firewall',      gets:'🛡️ WAF/Firewall' },
        { say:'add auth server',   gets:'🔐 Auth server' },
        { say:'add load balancer', gets:'⚖️ Load balancer' },
      ]},
    ],
    circuits:[
      { heading:'🔌 Full Circuit Commands', color:'#f9a8d4', tip:'Full schematic placed automatically', items:[
        { say:'LED blink circuit',      gets:'555 timer + RC + LED' },
        { say:'power supply circuit',   gets:'Bridge rectifier + regulator' },
        { say:'motor driver circuit',   gets:'H-bridge with 4 transistors' },
        { say:'audio amplifier circuit',gets:'Op-amp + gain + speaker' },
        { say:'arduino sensor circuit', gets:'Arduino + sensors + LEDs + motor' },
        { say:'rc filter circuit',      gets:'RC low-pass filter + voltmeter' },
      ]},
      { heading:'🔧 Add Components', color:'#fcd34d', tip:'"add [component]"', items:[
        { say:'add resistor',    gets:'▬ Resistor' },
        { say:'add 3 LEDs',      gets:'💡💡💡 Three LEDs' },
        { say:'add 555 timer',   gets:'⏱ 555 IC' },
        { say:'add arduino',     gets:'🤖 Arduino board' },
        { say:'add transistor',  gets:'⊿ NPN BJT' },
        { say:'add op amp',      gets:'▷ Operational amplifier' },
      ]},
    ],
    shapes:[
      { heading:'✏️ Draw Native Shapes', color:'#fbbf24', tip:'tldraw shapes — resizable & connectable', items:[
        { say:'draw a rectangle',   gets:'Violet rectangle' },
        { say:'draw a blue rectangle',gets:'Blue rectangle' },
        { say:'draw a red circle',  gets:'Red ellipse' },
        { say:'draw a diamond',     gets:'Decision diamond' },
        { say:'draw a cloud',       gets:'Cloud shape' },
        { say:'draw an arrow',      gets:'Connectable arrow' },
        { say:'add text Hello',     gets:'Text label' },
        { say:'add sticky note',    gets:'Yellow sticky note' },
      ]},
    ],
    canvas:[
      { heading:'🎛️ Canvas Control', color:'#fbbf24', tip:'Instant — no AI needed', items:[
        { say:'clear',       gets:'Delete everything' },
        { say:'undo',        gets:'Undo last action' },
        { say:'redo',        gets:'Redo action' },
        { say:'select all',  gets:'Select all shapes' },
        { say:'zoom in',     gets:'Zoom in' },
        { say:'zoom out',    gets:'Zoom out' },
        { say:'zoom fit',    gets:'Fit all on screen' },
      ]},
    ],
  }

  const F = "'JetBrains Mono','Courier New',monospace"
  return (
    <>
      <div style={{ position: 'fixed', bottom: 108, left: '50%', transform: 'translateX(-50%)', zIndex: 1001, fontFamily: F }}>
        <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', background: open ? 'linear-gradient(135deg,#312e81,#1e1b4b)' : 'rgba(15,23,42,0.92)', border: `1px solid ${open ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.25)'}`, borderRadius: 20, cursor: 'pointer', color: open ? '#a5b4fc' : '#6366f1', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: F }}>
          <span style={{ fontSize: 13 }}>{open ? '✕' : '❓'}</span>
          {open ? 'CLOSE GUIDE' : 'VOICE COMMANDS'}
        </button>
      </div>
      {open && (
        <div style={{ position: 'fixed', bottom: 150, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: 600, maxHeight: 'calc(100vh - 180px)', background: '#0a0e1a', borderRadius: 18, border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', fontFamily: F, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '14px 20px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>🎤</span>
              <div>
                <div style={{ color: '#e0e7ff', fontWeight: 700, fontSize: 13 }}>VOICE COMMAND GUIDE</div>
                <div style={{ color: '#818cf8', fontSize: 9, marginTop: 2 }}>Electronics + CS Diagrams · Click mic → speak → canvas reacts</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '7px 14px', border: 'none', cursor: 'pointer', background: tab === t.id ? 'rgba(99,102,241,0.3)' : 'transparent', borderBottom: tab === t.id ? '2px solid #6366f1' : '2px solid transparent', borderRadius: '8px 8px 0 0', color: tab === t.id ? '#a5b4fc' : '#475569', fontSize: 10, fontWeight: tab === t.id ? 700 : 400, fontFamily: F }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1 }}>
            {(CONTENT[tab] || []).map((section, si) => (
              <div key={si} style={{ marginBottom: 20 }}>
                <div style={{ color: section.color, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>{section.heading}</div>
                {section.tip && <div style={{ color: '#334155', fontSize: 9, marginBottom: 8, padding: '4px 8px', background: 'rgba(99,102,241,0.06)', borderRadius: 6, borderLeft: `2px solid ${section.color}44` }}>{section.tip}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {section.items.map((item, ii) => (
                    <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ flexShrink: 0, width: 250 }}>
                        <span style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 5, padding: '2px 7px', color: '#a5b4fc', fontSize: 10, fontWeight: 700 }}>🎤 "{item.say}"</span>
                      </div>
                      <div style={{ color: '#334155', fontSize: 10, marginTop: 2 }}>→</div>
                      <div style={{ color: '#64748b', fontSize: 9, lineHeight: 1.5, flex: 1, marginTop: 2 }}>{item.gets}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────
export default function CircuitLab() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:4px}
      `}</style>
      <Tldraw shapeUtils={SHAPE_UTILS} persistenceKey="circuitlab-v7">
        <LibraryPanel />
        <AiAssistant />
        <VoiceLayer />
      </Tldraw>
      <VoiceHelp />
    </div>
  )
}