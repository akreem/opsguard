'use client';

import React, { useState } from 'react';
import { Database, Eye, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { FlightTrace } from '@/lib/types';

interface FlightRecorderViewProps {
  traces: FlightTrace[];
  onSelectTrace: (trace: FlightTrace) => void;
}

export function FlightRecorderView({ traces, onSelectTrace }: FlightRecorderViewProps) {
  const [filter, setFilter] = useState<'ALL' | 'ALLOW' | 'HUMAN_REVIEW' | 'BLOCK' | 'FAILURES'>('ALL');

  const filteredTraces = traces.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'ALLOW') return t.policyDecision === 'ALLOW';
    if (filter === 'HUMAN_REVIEW') return t.policyDecision === 'HUMAN_REVIEW';
    if (filter === 'BLOCK') return t.policyDecision === 'BLOCK';
    if (filter === 'FAILURES') return !t.semanticSuccess || t.failureFamily !== null;
    return true;
  });

  return (
    <div className="glass-panel" style={{ padding: '18px', height: '100%', display: 'flex', flexDirection: 'column', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
      {/* Header & Filter Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} color="#ff0072" />
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
            Flight Recorder Trace Feed
          </h3>
          <span className="badge-neutral" style={{ fontSize: '11px' }}>
            {filteredTraces.length} Traces
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          {(['ALL', 'ALLOW', 'HUMAN_REVIEW', 'BLOCK', 'FAILURES'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#27272a' : '#18181b',
                color: filter === f ? '#ffffff' : '#a1a1aa',
                border: filter === f ? '1px solid #ff0072' : '1px solid #27272a',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Traces List Table */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '480px',
        borderRadius: '6px',
        border: '1px solid #27272a',
        background: '#111113',
      }}>
        {filteredTraces.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#71717a' }}>
            No flight traces recorded yet. Click a scenario button or &apos;Run All&apos; above to generate execution traces.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{
                background: '#18181b',
                color: '#a1a1aa',
                textAlign: 'left',
                borderBottom: '1px solid #27272a',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}>
                <th style={{ padding: '8px 12px' }}>Decision</th>
                <th style={{ padding: '8px 12px' }}>Proposed Tool</th>
                <th style={{ padding: '8px 12px' }}>Intent / Outcome</th>
                <th style={{ padding: '8px 12px' }}>Semantic Verify</th>
                <th style={{ padding: '8px 12px' }}>Source</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Telemetry</th>
              </tr>
            </thead>
            <tbody>
              {filteredTraces.map((trace, idx) => {
                const isAllow = trace.policyDecision === 'ALLOW';
                const isReview = trace.policyDecision === 'HUMAN_REVIEW';
                const isBlock = trace.policyDecision === 'BLOCK';

                const badgeClass = isAllow ? 'badge-allow' : isReview ? 'badge-review' : 'badge-block';

                return (
                  <tr
                    key={trace.traceId || idx}
                    onClick={() => onSelectTrace(trace)}
                    style={{
                      borderBottom: '1px solid #27272a',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1c1c20'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Decision Badge */}
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                      <span className={`badge ${badgeClass}`}>
                        {trace.policyDecision}
                      </span>
                    </td>

                    {/* Proposed Tool */}
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#ff6080', whiteSpace: 'nowrap' }}>
                      <code>{trace.proposedTool}</code>
                    </td>

                    {/* Intent / Reason */}
                    <td style={{ padding: '8px 12px', color: '#a1a1aa', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {trace.policyReason || trace.businessIntent}
                    </td>

                    {/* Semantic Verify Indicator */}
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                      {isBlock ? (
                        <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                          <XCircle size={13} /> Guard Blocked
                        </span>
                      ) : isReview ? (
                        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                          <AlertTriangle size={13} /> Queued Review
                        </span>
                      ) : trace.semanticSuccess ? (
                        <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                          <CheckCircle size={13} /> Semantic OK
                        </span>
                      ) : (
                        <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
                          <XCircle size={13} /> {trace.failureFamily || 'FAILED'}
                        </span>
                      )}
                    </td>

                    {/* Source */}
                    <td style={{ padding: '8px 12px', color: '#71717a', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {trace.decisionSource}
                    </td>

                    {/* Inspect Link */}
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <button
                        onClick={e => { e.stopPropagation(); onSelectTrace(trace); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff6080',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        <Eye size={13} /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
