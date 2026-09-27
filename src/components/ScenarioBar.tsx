'use client';

import React from 'react';
import { PlayCircle, ShieldAlert, Sparkles, AlertCircle, RotateCcw, Zap } from 'lucide-react';

interface ScenarioBarProps {
  onRunScenario: (scenario: string) => void;
  activeScenarioLoading: string | null;
}

const SCENARIOS = [
  {
    id: '1',
    num: '01',
    title: 'Normal Replenishment',
    desc: '20x Dell Monitors (2,800 TND) passing all 4 gateway safety checks.',
    badge: 'ALLOW',
    badgeClass: 'badge-allow',
    icon: PlayCircle,
    color: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    id: '2',
    num: '02',
    title: 'Anomalous Bulk Order',
    desc: '500 units / 70,000 TND / Unverified vendor triggering Anomaly 0.90.',
    badge: 'HUMAN_REVIEW',
    badgeClass: 'badge-review',
    icon: AlertCircle,
    color: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
  {
    id: '3',
    num: '03',
    title: 'Prompt Injection Hijack',
    desc: 'Injected wire transfer mutation intercepted & blocked by RBAC + Intent.',
    badge: 'BLOCK',
    badgeClass: 'badge-block',
    icon: ShieldAlert,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.3)',
  },
  {
    id: '4',
    num: '04',
    title: 'Recurring Alias Drift',
    desc: '17 colloquial supplier alias failures clustered with 47,830 TND impact.',
    badge: '17 CLUSTERED',
    badgeClass: 'badge-cyan',
    icon: Sparkles,
    color: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.3)',
  },
  {
    id: '5',
    num: '05',
    title: 'Replay Lab Fix Proof',
    desc: 'Sandbox replaying historical traces proving 0/17 ➔ 15/17 (88% recovery).',
    badge: '88% PROOF',
    badgeClass: 'badge-pink',
    icon: RotateCcw,
    color: '#ff6080',
    glowColor: 'rgba(255, 0, 114, 0.3)',
  },
];

export function ScenarioBar({ onRunScenario, activeScenarioLoading }: ScenarioBarProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={15} color="#ff0072" />
          <h2 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#71717a' }}>
            Live Interactive Scenario Triggers
          </h2>
        </div>
        <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
          Click any scenario card to trigger immediate real-time ReflexLoop execution
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '10px',
      }}>
        {SCENARIOS.map(sc => {
          const Icon = sc.icon;
          const isLoading = activeScenarioLoading === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => onRunScenario(sc.id)}
              disabled={isLoading}
              className="cyber-card"
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: sc.color, letterSpacing: '0.4px' }}>
                  SCENARIO {sc.num}
                </span>
                <span className={`badge ${sc.badgeClass}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                  {sc.badge}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: '#222226',
                  border: '1px solid #27272a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={13} color={sc.color} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
                  {isLoading ? 'Triggering...' : sc.title}
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#a1a1aa', lineHeight: '1.35' }}>
                {sc.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
