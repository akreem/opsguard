'use client';

import React, { useState } from 'react';
import { X, Code2, Copy, Check } from 'lucide-react';

interface ApiDocsModalProps {
  onClose: () => void;
}

const ENDPOINTS = [
  { method: 'POST', path: '/api/demo/reset', desc: 'Resets database to 30 seeded operations with baseline metrics.' },
  { method: 'POST', path: '/api/run', desc: 'Executes the full seeded batch or single operation through ReflexLoop.' },
  { method: 'GET', path: '/api/run/:id', desc: 'Fetches batch execution summary and generated trace count.' },
  { method: 'GET', path: '/api/operations', desc: 'Retrieves all 30 purchase requests with status and scenario filters.' },
  { method: 'GET', path: '/api/operations/:id', desc: 'Retrieves single operation with its associated flight recorder traces.' },
  { method: 'GET', path: '/api/traces/:id', desc: 'Fetches immutable flight trace telemetry and 4-check breakdown.' },
  { method: 'GET', path: '/api/health', desc: 'Calculates real health metrics: Agent Health Score (0-100), autonomous rate, blocked spend.' },
  { method: 'GET', path: '/api/incidents', desc: 'Fetches failure clusters, business blast radius, and root cause diagnosis.' },
  { method: 'GET', path: '/api/incidents/:id', desc: 'Fetches single failure cluster details.' },
  { method: 'POST', path: '/api/incidents/:id/replay', desc: 'Runs isolated Replay Lab sandbox on historical cases (0/17 -> 15/17 = 88%).' },
  { method: 'POST', path: '/api/incidents/:id/approve-fix', desc: 'Deploys proposed patch into active policy engine; logs human operator.' },
  { method: 'POST', path: '/api/incidents/:id/reject-fix', desc: 'Rejects proposed patch; logs operator audit record.' },
  { method: 'GET', path: '/api/approvals', desc: 'Fetches pending human review queue items.' },
  { method: 'POST', path: '/api/approvals/:id/decision', desc: 'Submits APPROVE or REJECT decision; resumes execution if approved.' },
  { method: 'POST', path: '/api/demo/scenario/:scenario', desc: 'Triggers live demo scenario (1, 2, 3, 4, 5).' },
  { method: 'GET', path: '/api/system/status', desc: 'Returns provider status (Jev, Nvidia/Fixture, Policy Engine, Replay Sandbox).' },
];

export function ApiDocsModal({ onClose }: ApiDocsModalProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '90%',
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={22} color="#38bdf8" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>OpsGuard REST API Contract</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                CORS-enabled endpoints ready for Lovable frontend consumption.
              </p>
            </div>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ENDPOINTS.map((ep, idx) => {
            const isPost = ep.method === 'POST';
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      background: isPost ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: isPost ? '#38bdf8' : '#34d399',
                      border: `1px solid ${isPost ? 'rgba(56, 189, 248, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      minWidth: '46px',
                      textAlign: 'center',
                    }}
                  >
                    {ep.method}
                  </span>
                  <div>
                    <code style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {ep.path}
                    </code>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {ep.desc}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(`curl -X ${ep.method} http://localhost:3000${ep.path.replace(/:id/g, '1')}`, idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title="Copy curl command"
                >
                  {copiedIdx === idx ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">
            Close API Docs
          </button>
        </div>
      </div>
    </div>
  );
}
