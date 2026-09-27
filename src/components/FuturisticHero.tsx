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
      padding: '40px 0 32px 0',
      textAlign: 'center',
      overflow: 'hidden',
    }}>
      {/* React Flow Top Pill Banner */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: '#18181b',
        border: '1px solid #27272a',
        padding: '6px 14px',
        borderRadius: '9999px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
        marginBottom: '20px',
      }}>
        <span className="pulse-dot pulse-blue" />
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          color: '#ff6080',
        }}>
          AI Control & Reliability Plane • ReflexLoop™ Core
        </span>
      </div>

      {/* Main Hero Headline */}
      <h1 style={{
        fontSize: 'clamp(32px, 5vw, 56px)',
        fontWeight: 900,
        lineHeight: '1.1',
        letterSpacing: '-1.5px',
        marginBottom: '16px',
        color: '#ffffff',
      }}>
        AI agents shouldn&apos;t <br />
        <span className="gradient-text-hero">
          fail silently.
        </span>
      </h1>

      {/* Sub-headline Pitch */}
      <p style={{
        fontSize: 'clamp(14px, 1.6vw, 17px)',
        color: '#a1a1aa',
        maxWidth: '800px',
        margin: '0 auto 28px auto',
        lineHeight: '1.6',
        fontWeight: 400,
      }}>
        AgentsGuard sits between autonomous agents and operational tools. It <strong style={{ color: '#ff0072' }}>guards</strong> every action before execution, <strong style={{ color: '#34d399' }}>verifies</strong> outcomes afterward, <strong style={{ color: '#ff6080' }}>learns</strong> from recurring failure patterns, and <strong style={{ color: '#fbbf24' }}>proves fixes</strong> in a replay sandbox before human sign-off.
      </p>

      {/* Call to Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '36px',
      }}>
        <button
          onClick={onLaunchDemo}
          className="btn-neon-primary"
          style={{ padding: '10px 22px', fontSize: '13px' }}
        >
          <Zap size={15} />
          <span>Interactive Demo Console</span>
          <ArrowRight size={15} />
        </button>

        <button
          onClick={onRunBatch}
          disabled={isRunningBatch}
          className="btn-neon-ghost"
          style={{ padding: '10px 22px', fontSize: '13px', opacity: isRunningBatch ? 0.7 : 1 }}
        >
          <Play size={15} />
          <span>{isRunningBatch ? 'Simulating 30 Orders...' : 'Run Full Batch (30 Seeded Requests)'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <div className="cyber-panel" style={{ padding: '14px 18px', textAlign: 'left', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
              Deterministic Preflight
            </span>
            <Lock size={14} color="#ff0072" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
            4 Gateway Checks
          </div>
          <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
            RBAC + Heuristics + Intent + Jev
          </div>
        </div>

        <div className="cyber-panel" style={{ padding: '14px 18px', textAlign: 'left', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
              Semantic Outcome Verifier
            </span>
            <Activity size={14} color="#34d399" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#34d399' }}>
            100% Deep Catch
          </div>
          <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
            Detects HTTP 200 silent null IDs
          </div>
        </div>

        <div className="cyber-panel" style={{ padding: '14px 18px', textAlign: 'left', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
              Signature Replay Sandbox
            </span>
            <Sparkles size={14} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fbbf24' }}>
            88% Proven Recovery
          </div>
          <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
            0/17 ➔ 15/17 historical success
          </div>
        </div>

        <div className="cyber-panel" style={{ padding: '14px 18px', textAlign: 'left', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
              Protected Capital
            </span>
            <Shield size={14} color="#ff6080" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
            {(metrics?.totalTNDProtected ?? 72800).toLocaleString()} <span style={{ fontSize: '12px', color: '#ff6080' }}>TND</span>
          </div>
          <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
            Unauthorized & anomalous spend
          </div>
        </div>
      </div>
    </section>
  );
}
