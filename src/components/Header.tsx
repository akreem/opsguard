'use client';

import React from 'react';
import { Shield, RefreshCw, Play, BookOpen, Lock, Activity, Sparkles, Terminal } from 'lucide-react';
import { SystemStatus } from '@/lib/types';

interface HeaderProps {
  systemStatus: SystemStatus | null;
  onReset: () => void;
  onRunBatch: () => void;
  onOpenDocs: () => void;
  isRunningBatch: boolean;
}

export function Header({
  systemStatus,
  onReset,
  onRunBatch,
  onOpenDocs,
  isRunningBatch,
}: HeaderProps) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(20px)',
      padding: '14px 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Logo and Futuristic Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '19px', fontWeight: 900, letterSpacing: '-0.5px', color: '#ffffff' }}>
                OpsGuard
              </span>
              <span style={{
                background: 'linear-gradient(90deg, #38bdf8, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '2px 8px',
                borderRadius: '6px',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.15)',
              }}>
                ReflexLoop™
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Real-time control & reliability layer for agentic AI
            </p>
          </div>
        </div>

        {/* Live System Status HUD Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
          }}>
            <span className="pulse-dot pulse-green" />
            <span style={{ color: 'var(--text-muted)' }}>Gateway:</span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>ACTIVE</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
          }}>
            <span className="pulse-dot pulse-blue" />
            <span style={{ color: 'var(--text-muted)' }}>Jev Risk:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>
              {systemStatus?.jev || 'FIXTURE'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
          }}>
            <span className="pulse-dot pulse-amber" />
            <span style={{ color: 'var(--text-muted)' }}>Replay Sandbox:</span>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>READY</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenDocs}
            className="btn-neon-ghost"
            title="View API schemas and endpoints for Lovable frontend integration"
          >
            <BookOpen size={14} color="#38bdf8" />
            <span>API Specs</span>
          </button>

          <button
            onClick={onReset}
            className="btn-neon-ghost"
            title="Reset database to 30 seeded operations"
          >
            <RefreshCw size={14} />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={onRunBatch}
            disabled={isRunningBatch}
            className="btn-neon-primary"
            style={{ opacity: isRunningBatch ? 0.7 : 1 }}
          >
            <Play size={14} />
            <span>{isRunningBatch ? 'Processing...' : 'Run All (30 Orders)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
