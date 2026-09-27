'use client';

import React from 'react';
import { UserCheck, CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { HumanApprovalItem } from '@/lib/types';

interface ApprovalsViewProps {
  approvals: HumanApprovalItem[];
  onDecision: (id: string, decision: 'APPROVE' | 'REJECT') => void;
}

export function ApprovalsView({ approvals, onDecision }: ApprovalsViewProps) {
  const pendingApprovals = approvals.filter(a => a.status === 'PENDING');

  return (
    <div className="glass-panel" style={{ padding: '18px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={18} color="#fbbf24" />
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
            Human Review Queue
          </h3>
        </div>
        <span className={`badge ${pendingApprovals.length > 0 ? 'badge-review' : 'badge-neutral'}`} style={{ fontSize: '11px' }}>
          {pendingApprovals.length} Pending Actions
        </span>
      </div>

      {pendingApprovals.length === 0 ? (
        <div style={{
          background: 'rgba(30, 41, 59, 0.2)',
          border: '1px dashed var(--border-color)',
          borderRadius: '8px',
          padding: '28px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px',
        }}>
          <CheckCircle2 size={24} color="#34d399" style={{ margin: '0 auto 8px auto', opacity: 0.8 }} />
          <div>Approval queue is currently clear.</div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>
            Trigger Scenario 2 (Anomalous Order) to escalate high-exposure operations here.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
          {pendingApprovals.map(item => (
            <div
              key={item.id}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '8px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-review" style={{ fontSize: '10px' }}>
                  Risk: {item.risk} • Anomaly: {item.anomalyScore.toFixed(2)}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ID: {item.requestId}
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {item.quantity}x {item.product} ({item.sku})
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Supplier: <strong style={{ color: 'var(--text-primary)' }}>{item.supplier}</strong> • Amount: <strong style={{ color: '#38bdf8' }}>{item.amountTND.toLocaleString()} TND</strong>
              </div>

              <p style={{ fontSize: '11px', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 8px', borderRadius: '4px', marginBottom: '10px' }}>
                {item.reason}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => onDecision(item.id, 'REJECT')}
                  className="btn-danger"
                  style={{ padding: '5px 12px', fontSize: '11px' }}
                >
                  <XCircle size={12} /> Reject
                </button>
                <button
                  onClick={() => onDecision(item.id, 'APPROVE')}
                  className="btn-success"
                  style={{ padding: '5px 12px', fontSize: '11px' }}
                >
                  <CheckCircle2 size={12} /> Approve & Transmit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
