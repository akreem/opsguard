'use client';

import React from 'react';
import { Shield, Sparkles, ArrowRight, Zap, Play, Terminal, Lock, Activity } from 'lucide-react';
import { SystemStatus, HealthMetrics } from '@/lib/types';

interface FuturisticHeroProps {
  systemStatus: SystemStatus | null;
  metrics: HealthMetrics | null;
  onLaunchDemo: () => void;
  onRunBatch: () => void;
  isRunningBatch: boolean;
}

export function FuturisticHero({
  systemStatus,
  metrics,
  onLaunchDemo,
  onRunBatch,
  isRunningBatch,
}: FuturisticHeroProps) {
  return (
    <section style={{
      position: 'relative',
      padding: '48px 0 36px 0',
      textAlign: 'center',
      overflow: 'hidden',
    }}>
      {/* Laser Top Accent */}
      <div className="laser-line" />

      {/* Futuristic Pill Banner */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        padding: '6px 16px',
        borderRadius: '9999px',
        boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
        marginBottom: '24px',
      }}>
        <span className="pulse-dot pulse-blue" />
        <span style={{
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          background: 'linear-gradient(90deg, #38bdf8, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          AI Control & Reliability Plane • ReflexLoop™ Core
        </span>
      </div>

      {/* Main Massive Hero Headline */}
      <h1 style={{
        fontSize: 'clamp(36px, 5.5vw, 64px)',
        fontWeight: 900,
        lineHeight: '1.1',
        letterSpacing: '-1.5px',
        marginBottom: '20px',
      }}>
        AI agents shouldn&apos;t <br />
        <span className="gradient-text-hero">
          fail silently.
        </span>
      </h1>

      {/* Sub-headline Pitch */}
      <p style={{
        fontSize: 'clamp(15px, 1.8vw, 19px)',
        color: 'var(--text-dim)',
        maxWidth: '820px',
        margin: '0 auto 32px auto',
        lineHeight: '1.6',
        fontWeight: 400,
      }}>
        OpsGuard sits between autonomous agents and operational tools. It <strong style={{ color: '#38bdf8' }}>guards</strong> every action before execution, <strong style={{ color: '#34d399' }}>verifies</strong> outcomes afterward, <strong style={{ color: '#f472b6' }}>learns</strong> from recurring failure patterns, and <strong style={{ color: '#fbbf24' }}>proves fixes</strong> in a replay sandbox before human sign-off.
      </p>

      {/* Call to Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '40px',
      }}>
        <button
          onClick={onLaunchDemo}
          className="btn-neon-primary"
          style={{ padding: '12px 24px', fontSize: '14px' }}
        >
          <Zap size={16} />
          <span>Interactive Demo Console</span>
          <ArrowRight size={16} />
        </button>

        <button
          onClick={onRunBatch}
          disabled={isRunningBatch}
          className="btn-neon-purple"
          style={{ padding: '12px 24px', fontSize: '14px', opacity: isRunningBatch ? 0.7 : 1 }}
        >
          <Play size={16} />
          <span>{isRunningBatch ? 'Simulating 30 Orders...' : 'Run Full Batch (30 Seeded Requests)'}</span>
        </button>
      </div>

      {/* Holographic KPI HUD Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <div className="cyber-panel" style={{ padding: '16px 20px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Deterministic Preflight
            </span>
            <Lock size={15} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8' }}>
            4 Gateway Checks
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            RBAC + Heuristics + Intent + Jev
          </div>
        </div>

        <div className="cyber-panel" style={{ padding: '16px 20px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Semantic Outcome Verifier
            </span>
            <Activity size={15} color="#34d399" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#34d399' }}>
            100% Deep Catch
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            Detects HTTP 200 silent null IDs
          </div>
        </div>

        <div className="cyber-panel" style={{ padding: '16px 20px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Signature Replay Sandbox
            </span>
            <Sparkles size={15} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fbbf24' }}>
            88% Proven Recovery
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            0/17 $\rightarrow$ 15/17 historical success
          </div>
        </div>

        <div className="cyber-panel" style={{ padding: '16px 20px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Protected Capital
            </span>
            <Shield size={15} color="#a855f7" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#a855f7' }}>
            {(metrics?.totalTNDProtected ?? 72800).toLocaleString()} <span style={{ fontSize: '13px' }}>TND</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
            Unauthorized & anomalous spend
          </div>
        </div>
      </div>
    </section>
  );
}
