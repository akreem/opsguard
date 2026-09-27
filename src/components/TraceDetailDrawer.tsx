'use client';

import React from 'react';
import { X, ShieldCheck, Activity, Brain, Cpu, CheckSquare, AlertTriangle, Clock } from 'lucide-react';
import { FlightTrace } from '@/lib/types';

interface TraceDetailDrawerProps {
  trace: FlightTrace | null;
  onClose: () => void;
}

export function TraceDetailDrawer({ trace, onClose }: TraceDetailDrawerProps) {
  if (!trace) return null;

  const isAllow = trace.policyDecision === 'ALLOW';
  const isReview = trace.policyDecision === 'HUMAN_REVIEW';
  const badgeClass = isAllow ? 'badge-allow' : isReview ? 'badge-review' : 'badge-block';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '90%',
          maxWidth: '840px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`badge ${badgeClass}`} style={{ fontSize: '13px', padding: '4px 10px' }}>
              {trace.policyDecision}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
              Trace Telemetry: <code>{trace.traceId}</code>
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Overview Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '10px 14px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>REQUEST ID</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{trace.requestId}</div>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '10px 14px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PROPOSED TOOL</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}><code>{trace.proposedTool}</code></div>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '10px 14px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SEVERITY / RISK</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: trace.severity === 'CRITICAL' ? '#f87171' : '#34d399' }}>
              {trace.severity}
            </div>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '10px 14px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DECISION SOURCE</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#a78bfa' }}>{trace.decisionSource}</div>
          </div>
        </div>

        {/* Intention Comparison */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Intent Alignment Audit
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>Original Business Intent:</span>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px' }}>{trace.businessIntent}</p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 600 }}>Agent Proposed Action:</span>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px' }}>{trace.agentIntent}</p>
          </div>
        </div>

        {/* 4 GATEWAY CHECKS BREAKDOWN */}
        <h4 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Gateway Policy Engine: 4 Preflight Checks
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {/* Check A: Auth */}
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
                <ShieldCheck size={14} color="#38bdf8" /> Check A: RBAC Authorization
              </div>
              <span className={`badge ${trace.checks.auth.passed ? 'badge-allow' : 'badge-block'}`}>
                {trace.checks.auth.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{trace.checks.auth.reason}</p>
          </div>

          {/* Check B: Anomaly */}
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
                <Activity size={14} color="#fbbf24" /> Check B: Heuristic Anomaly
              </div>
              <span className="badge badge-neutral">
                Score: {trace.anomalyScore.toFixed(2)}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {trace.checks.anomaly.heuristics.length > 0
                ? trace.checks.anomaly.heuristics.map(h => `${h.name} (+${h.score})`).join(', ')
                : 'No anomaly triggers detected.'}
            </p>
          </div>

          {/* Check C: Intent */}
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
                <Brain size={14} color="#a78bfa" /> Check C: Intent Consistency
              </div>
              <span className={`badge ${trace.checks.intent.intentConsistent === 'YES' ? 'badge-allow' : 'badge-block'}`}>
                {trace.checks.intent.intentConsistent}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{trace.checks.intent.reasoning}</p>
          </div>

          {/* Check D: Jev Risk */}
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
                <AlertTriangle size={14} color="#f87171" /> Check D: Jev Risk Judgment
              </div>
              <span className="badge badge-neutral">
                {trace.checks.jev.riskLevel} ({(trace.jevConfidence * 100).toFixed(0)}%)
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{trace.checks.jev.notes || 'Evaluated against policy boundaries.'}</p>
          </div>
        </div>

        {/* Tool Arguments & Postflight Execution Outcome */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Tool Arguments
            </h4>
            <pre style={{
              background: '#090d16',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '11px',
              border: '1px solid var(--border-color)',
              color: '#38bdf8',
              overflowX: 'auto',
            }}>
              {JSON.stringify(trace.toolArguments, null, 2)}
            </pre>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Tool Execution & Postflight Outcome
            </h4>
            <pre style={{
              background: '#090d16',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '11px',
              border: '1px solid var(--border-color)',
              color: trace.semanticSuccess ? '#34d399' : '#f87171',
              overflowX: 'auto',
            }}>
              {JSON.stringify(
                {
                  transportSuccess: trace.transportSuccess,
                  semanticSuccess: trace.semanticSuccess,
                  failureFamily: trace.failureFamily,
                  rawOutput: trace.toolResult,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">
            Close Telemetry Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
