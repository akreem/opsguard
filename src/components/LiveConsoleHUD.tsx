'use client';

import React, { useState } from 'react';
import {
  Database,
  BrainCircuit,
  RotateCcw,
  UserCheck,
  Activity,
  Code2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { FlightTrace, FailureCluster, HumanApprovalItem, HealthMetrics } from '@/lib/types';
import { FlightRecorderView } from './FlightRecorderView';
import { IncidentsView } from './IncidentsView';
import { ApprovalsView } from './ApprovalsView';
import { HealthOverview } from './HealthOverview';

interface LiveConsoleHUDProps {
  traces: FlightTrace[];
  incidents: FailureCluster[];
  approvals: HumanApprovalItem[];
  metrics: HealthMetrics | null;
  onSelectTrace: (trace: FlightTrace) => void;
  onOpenReplay: (cluster: FailureCluster) => void;
  onApprovalDecision: (id: string, decision: 'APPROVE' | 'REJECT') => void;
  onOpenDocs: () => void;
}

export function LiveConsoleHUD({
  traces,
  incidents,
  approvals,
  metrics,
  onSelectTrace,
  onOpenReplay,
  onApprovalDecision,
  onOpenDocs,
}: LiveConsoleHUDProps) {
  const [activeTab, setActiveTab] = useState<'TRACES' | 'FAILURES' | 'REPLAY' | 'APPROVALS' | 'ANALYTICS'>('TRACES');

  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;
  const supplierCluster = incidents.find(c => c.clusterId === 'cluster_supplier_alias_mismatch') || incidents[0];

  return (
    <div className="cyber-panel" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Top Console Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.9)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '8px 16px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('TRACES')}
            style={{
              background: activeTab === 'TRACES' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTab === 'TRACES' ? '#38bdf8' : 'var(--text-dim)',
              border: activeTab === 'TRACES' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Database size={15} />
            <span>Flight Recorder ({traces.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FAILURES')}
            style={{
              background: activeTab === 'FAILURES' ? 'rgba(244, 114, 182, 0.2)' : 'transparent',
              color: activeTab === 'FAILURES' ? '#f472b6' : 'var(--text-dim)',
              border: activeTab === 'FAILURES' ? '1px solid rgba(244, 114, 182, 0.5)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <BrainCircuit size={15} />
            <span>Failure Memory ({incidents.length} Clusters)</span>
          </button>

          <button
            onClick={() => setActiveTab('REPLAY')}
            style={{
              background: activeTab === 'REPLAY' ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
              color: activeTab === 'REPLAY' ? '#fbbf24' : 'var(--text-dim)',
              border: activeTab === 'REPLAY' ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={15} />
            <span>Replay Sandbox Prover</span>
            <span className="badge badge-allow" style={{ fontSize: '9px', padding: '1px 5px' }}>88% FIX</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVALS')}
            style={{
              background: activeTab === 'APPROVALS' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeTab === 'APPROVALS' ? '#fbbf24' : 'var(--text-dim)',
              border: activeTab === 'APPROVALS' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <UserCheck size={15} />
            <span>Human Review Queue</span>
            {pendingApprovalsCount > 0 && (
              <span className="badge badge-review" style={{ fontSize: '9px', padding: '1px 5px' }}>
                {pendingApprovalsCount} PENDING
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            style={{
              background: activeTab === 'ANALYTICS' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'ANALYTICS' ? '#34d399' : 'var(--text-dim)',
              border: activeTab === 'ANALYTICS' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Activity size={15} />
            <span>Health & Reliability Radar</span>
          </button>
        </div>

        {/* Action Button to Open API Docs */}
        <button
          onClick={onOpenDocs}
          className="btn-neon-ghost"
          style={{ padding: '6px 14px', fontSize: '11px' }}
        >
          <Code2 size={14} color="#38bdf8" />
          <span>Lovable API Specs</span>
        </button>
      </div>

      {/* Main Console Tab Body */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'TRACES' && (
          <FlightRecorderView
            traces={traces}
            onSelectTrace={onSelectTrace}
          />
        )}

        {activeTab === 'FAILURES' && (
          <IncidentsView
            incidents={incidents}
            onOpenReplay={onOpenReplay}
          />
        )}

        {activeTab === 'REPLAY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-cyan">SIGNATURE FEATURE</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
                    Replay Lab Sandbox Prover
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', maxWidth: '640px', lineHeight: '1.4' }}>
                  OpsGuard discovers recurring operational failure clusters, generates algorithmic patches, and simulates candidate fixes against exact historical failing traces before operator approval.
                </p>
              </div>

              {supplierCluster && (
                <button
                  onClick={() => onOpenReplay(supplierCluster)}
                  className="btn-neon-primary"
                  style={{ padding: '12px 24px', fontSize: '13px' }}
                >
                  <RotateCcw size={16} />
                  <span>Launch Interactive Sandbox (17 Traces)</span>
                </button>
              )}
            </div>

            {/* Quick Overview of Failure Clusters */}
            <IncidentsView
              incidents={incidents}
              onOpenReplay={onOpenReplay}
            />
          </div>
        )}

        {activeTab === 'APPROVALS' && (
          <ApprovalsView
            approvals={approvals}
            onDecision={onApprovalDecision}
          />
        )}

        {activeTab === 'ANALYTICS' && (
          <div>
            <HealthOverview metrics={metrics} />
          </div>
        )}
      </div>
    </div>
  );
}
