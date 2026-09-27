'use client';

import React from 'react';
import { Shield, RefreshCw, Play, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
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
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      padding: '16px 24px',
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
        {/* Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
          }}>
            <Shield size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                OpsGuard
              </h1>
              <span style={{
                background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}>
                ReflexLoop™ Core
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Real-time control & reliability layer for agentic AI
            </p>
          </div>
        </div>

        {/* System Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
          }}>
            <span className="pulse-dot pulse-green" />
            <span style={{ color: 'var(--text-secondary)' }}>Gateway:</span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>ACTIVE</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
          }}>
            <span className="pulse-dot pulse-blue" />
            <span style={{ color: 'var(--text-secondary)' }}>Jev Provider:</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>
              {systemStatus?.jev || 'FIXTURE (DEMO)'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
          }}>
            <span className="pulse-dot pulse-amber" />
            <span style={{ color: 'var(--text-secondary)' }}>Replay Sandbox:</span>
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>READY</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenDocs}
            className="btn-secondary"
            title="View API schemas and endpoints for Lovable frontend integration"
          >
            <BookOpen size={14} />
            <span>API Docs</span>
          </button>

          <button
            onClick={onReset}
            className="btn-secondary"
            title="Reset database to 30 seeded operations"
          >
            <RefreshCw size={14} />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={onRunBatch}
            disabled={isRunningBatch}
            className="btn-primary"
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
