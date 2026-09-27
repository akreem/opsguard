'use client';

import React from 'react';
import { ArrowRight, Bot, ShieldCheck, Cpu, CheckSquare, Database, BrainCircuit, RotateCcw, UserCheck } from 'lucide-react';

const STEPS = [
  { key: 'PROPOSE', label: 'Propose', icon: Bot, desc: 'LLM Agent Action', color: '#94a3b8' },
  { key: 'GUARD', label: 'Guard', icon: ShieldCheck, desc: 'Gateway 4 Checks', color: '#38bdf8' },
  { key: 'EXECUTE', label: 'Execute', icon: Cpu, desc: 'Deterministic Tool', color: '#818cf8' },
  { key: 'VERIFY', label: 'Verify', icon: CheckSquare, desc: 'Semantic Outcome', color: '#34d399' },
  { key: 'RECORD', label: 'Record', icon: Database, desc: 'Flight Trace', color: '#a78bfa' },
  { key: 'LEARN', label: 'Learn', icon: BrainCircuit, desc: 'Failure Fingerprint', color: '#f472b6' },
  { key: 'REPLAY', label: 'Replay', icon: RotateCcw, desc: 'Sandbox Fix Test', color: '#fbbf24' },
  { key: 'APPROVE', label: 'Approve', icon: UserCheck, desc: 'Human Sign-off', color: '#10b981' },
];

export function ReflexLoopBar() {
  return (
    <div className="glass-panel" style={{ padding: '14px 20px', marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.key}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.4)',
                border: `1px solid rgba(255, 255, 255, 0.05)`,
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: `${step.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={14} color={step.color} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: step.color, letterSpacing: '0.5px' }}>
                    {idx + 1}. {step.label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {step.desc}
                  </div>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <ArrowRight size={14} color="#475569" style={{ opacity: 0.7 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
