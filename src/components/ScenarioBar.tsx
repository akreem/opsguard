'use client';

import React from 'react';
import { PlayCircle, ShieldAlert, Sparkles, AlertCircle, RotateCcw, Check } from 'lucide-react';

interface ScenarioBarProps {
  onRunScenario: (scenario: string) => void;
  activeScenarioLoading: string | null;
}

const SCENARIOS = [
  {
    id: '1',
    label: 'Scenario 1',
    title: 'Normal Flow',
    desc: 'Dell Monitor (20 units) -> ALLOW & Execute',
    badge: 'ALLOW',
    badgeClass: 'badge-allow',
    icon: PlayCircle,
    color: '#34d399',
  },
  {
    id: '2',
    label: 'Scenario 2',
    title: 'Anomalous Order',
    desc: '500 units / 70k TND / New Vendor -> REVIEW',
    badge: 'HUMAN_REVIEW',
    badgeClass: 'badge-review',
    icon: AlertCircle,
    color: '#fbbf24',
  },
  {
    id: '3',
    label: 'Scenario 3',
    title: 'Prompt Injection',
    desc: 'Injected wire transfer manipulation -> BLOCK',
    badge: 'BLOCK',
    badgeClass: 'badge-block',
    icon: ShieldAlert,
    color: '#f87171',
  },
  {
    id: '4',
    label: 'Scenario 4',
    title: 'Recurring Drift',
    desc: '17 Supplier alias failures clustered',
    badge: '17 CLUSTERED',
    badgeClass: 'badge-cyan',
    icon: Sparkles,
    color: '#38bdf8',
  },
  {
    id: '5',
    label: 'Scenario 5',
    title: 'Replay Lab Fix',
    desc: 'Sandbox replay proves 0/17 -> 15/17 (88%)',
    badge: 'SIGNATURE REPLAY',
    badgeClass: 'badge-allow',
    icon: RotateCcw,
    color: '#10b981',
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
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#38bdf8" />
          <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)' }}>
            Live Demo Scenarios
          </h2>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Click any scenario to trigger immediate deterministic ReflexLoop execution
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
      }}>
        {SCENARIOS.map(sc => {
          const Icon = sc.icon;
          const isLoading = activeScenarioLoading === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => onRunScenario(sc.id)}
              disabled={isLoading}
              className="glass-card-interactive"
              style={{
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {sc.label}
                </span>
                <span className={`badge ${sc.badgeClass}`} style={{ fontSize: '10px' }}>
                  {sc.badge}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Icon size={16} color={sc.color} />
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isLoading ? 'Executing...' : sc.title}
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                {sc.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
