'use client';

import React from 'react';
import { ArrowRight, Bot, ShieldCheck, Cpu, CheckSquare, Database, BrainCircuit, RotateCcw, UserCheck } from 'lucide-react';

const STEPS = [
  { key: 'PROPOSE', label: 'Propose', icon: Bot, desc: 'LLM Agent Action', color: '#94a3b8' },
  { key: 'GUARD', label: 'Guard', icon: ShieldCheck, desc: 'Gateway 4 Checks', color: '#ff0072' },
  { key: 'EXECUTE', label: 'Execute', icon: Cpu, desc: 'Deterministic Tool', color: '#818cf8' },
  { key: 'VERIFY', label: 'Verify', icon: CheckSquare, desc: 'Semantic Outcome', color: '#34d399' },
  { key: 'RECORD', label: 'Record', icon: Database, desc: 'Flight Trace', color: '#a78bfa' },
  { key: 'LEARN', label: 'Learn', icon: BrainCircuit, desc: 'Failure Fingerprint', color: '#ff6080' },
  { key: 'REPLAY', label: 'Replay', icon: RotateCcw, desc: 'Sandbox Fix Test', color: '#fbbf24' },
  { key: 'APPROVE', label: 'Approve', icon: UserCheck, desc: 'Human Sign-off', color: '#10b981' },
];

export function ReflexLoopBar() {
  return (
    <div className="glass-panel" style={{ padding: '12px 18px', marginBottom: '18px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
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
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#141416',
                border: '1px solid #27272a',
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '5px',
                  background: '#222226',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={13} color={step.color} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: step.color, letterSpacing: '0.3px' }}>
                    {idx + 1}. {step.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#71717a' }}>
                    {step.desc}
                  </div>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <ArrowRight size={13} color="#52525b" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
