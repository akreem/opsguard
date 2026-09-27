'use client';

import React, { useState } from 'react';
import {
  Bot,
  ShieldCheck,
  Cpu,
  CheckSquare,
  Database,
  BrainCircuit,
  RotateCcw,
  UserCheck,
  ArrowRight,
  Info,
  ChevronDown,
} from 'lucide-react';

const STEPS = [
  {
    key: 'PROPOSE',
    num: '01',
    label: 'Propose',
    icon: Bot,
    color: '#38bdf8',
    summary: 'Autonomous agent determines operational tool & arguments.',
    details: 'The operational LLM agent queries stock levels (e.g. Dell Monitor low stock) and drafts tool calls: inventory_lookup, supplier_search, or create_purchase_order.',
  },
  {
    key: 'GUARD',
    num: '02',
    label: 'Guard',
    icon: ShieldCheck,
    color: '#ff0072',
    summary: '4 Real-time Gateway Safety Checks (RBAC, Anomaly, Intent, Jev).',
    details: 'Check A (pure deterministic RBAC) + Check B (heuristic anomaly score 0-1.0) + Check C (intent consistency) + Check D (Jev risk judgment) feed into deterministic Policy Arbiter (ALLOW / REVIEW / BLOCK).',
  },
  {
    key: 'EXECUTE',
    num: '03',
    label: 'Execute',
    icon: Cpu,
    color: '#818cf8',
    summary: 'Deterministic tool invocation with controlled failure handling.',
    details: 'When ALLOWED, tools execute deterministically. Controlled failure scenarios (supplier alias drift, SKU drift, network timeouts) are simulated reliably.',
  },
  {
    key: 'VERIFY',
    num: '04',
    label: 'Verify',
    icon: CheckSquare,
    color: '#34d399',
    summary: 'Postflight verification separates transport from semantic success.',
    details: 'Detects silent semantic drops (e.g. ERP HTTP 200 returned with null order_id) that standard monitors miss, marking failure_family=SEMANTIC_FAILURE.',
  },
  {
    key: 'RECORD',
    num: '05',
    label: 'Record',
    icon: Database,
    color: '#a78bfa',
    summary: 'Flight Recorder stores structured immutable telemetry traces.',
    details: 'Emits full telemetry: 4-check results, anomaly score, transport vs semantic success, latencies, and decision sources (LIVE_JEV, FIXTURE, LOCAL_POLICY).',
  },
  {
    key: 'LEARN',
    num: '06',
    label: 'Learn',
    icon: BrainCircuit,
    color: '#ff6080',
    summary: 'Failure Memory groups recurring fingerprints & blast radius.',
    details: 'Clusters recurring failures (e.g. Tech Supply vs TechSupply Corp alias drift across 17 orders totaling 47,830 TND) and runs generative root cause diagnosis.',
  },
  {
    key: 'REPLAY',
    num: '07',
    label: 'Replay',
    icon: RotateCcw,
    color: '#fbbf24',
    summary: 'Signature Sandbox Replay tests proposed patch on historical failures.',
    details: 'Proves patch improvement before production deployment: 17 historical failures replayed in isolated sandbox (0/17 BEFORE ➔ 15/17 AFTER = 88% recovery).',
  },
  {
    key: 'APPROVE',
    num: '08',
    label: 'Approve',
    icon: UserCheck,
    color: '#10b981',
    summary: 'Human-in-the-loop operator sign-off activates versioned policy.',
    details: 'Human operator (hackathon_operator) reviews sandbox proof and signs off, safely deploying the patch into the active policy engine.',
  },
];

export function InteractiveReflexLoop() {
  const [activeStep, setActiveStep] = useState<string>('GUARD');

  const currentStep = STEPS.find(s => s.key === activeStep) || STEPS[1];
  const CurrentIcon = currentStep.icon;

  return (
    <div className="cyber-panel" style={{ padding: '20px', marginBottom: '24px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge-pink">ReflexLoop™ Architecture</span>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
            The 8-Stage Autonomous Reliability Highway
          </h2>
        </div>
        <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
          Click any step node below to inspect its inner control mechanisms
        </span>
      </div>

      {/* 8-Step Interactive Node Highway */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
        marginBottom: '16px',
      }}>
        {STEPS.map(step => {
          const Icon = step.icon;
          const isSelected = activeStep === step.key;

          return (
            <button
              key={step.key}
              onClick={() => setActiveStep(step.key)}
              style={{
                background: isSelected ? '#222226' : '#18181b',
                border: isSelected ? '1px solid #ff0072' : '1px solid #27272a',
                borderRadius: '8px',
                padding: '10px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 1px 4px rgba(255, 0, 114, 0.2)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: step.color }}>
                  {step.num}
                </span>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '5px',
                  background: '#27272a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={12} color={step.color} />
                </div>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#ffffff' : '#f4f4f5', marginBottom: '2px' }}>
                {step.label}
              </div>
              <div style={{ fontSize: '10px', color: '#71717a', lineHeight: '1.2' }}>
                {step.summary.split(' ')[0]} {step.summary.split(' ')[1]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Step Deep Dive Callout */}
      <div style={{
        background: '#141416',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: '#18181b',
          border: '1px solid #27272a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <CurrentIcon size={18} color={currentStep.color} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: currentStep.color, textTransform: 'uppercase' }}>
              Stage {currentStep.num} Execution Mechanics
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
              — {currentStep.label}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: '1.5' }}>
            {currentStep.details}
          </p>
        </div>
      </div>
    </div>
  );
}
