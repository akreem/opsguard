'use client';

import React from 'react';
import { Sparkles, BrainCircuit, RotateCcw, AlertTriangle, ShieldCheck, DollarSign, Package } from 'lucide-react';
import { FailureCluster } from '@/lib/types';

interface IncidentsViewProps {
  incidents: FailureCluster[];
  onOpenReplay: (cluster: FailureCluster) => void;
}

export function IncidentsView({ incidents, onOpenReplay }: IncidentsViewProps) {
  return (
    <div className="glass-panel" style={{ padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrainCircuit size={18} color="#f472b6" />
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
            Failure Memory & Blast Radius
          </h3>
        </div>
        <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
          {incidents.length} Recurring Clusters
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {incidents.map(cluster => {
          const isApproved = cluster.status === 'FIX_APPROVED';
          const isTested = cluster.status === 'FIX_TESTED';

          return (
            <div
              key={cluster.clusterId}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: isApproved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '16px',
                position: 'relative',
              }}
            >
              {/* Cluster Title and Status Badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                      {cluster.failureFamily}
                    </span>
                    <span className={`badge ${isApproved ? 'badge-allow' : isTested ? 'badge-review' : 'badge-block'}`} style={{ fontSize: '10px' }}>
                      {cluster.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {cluster.title}
                  </h4>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Fingerprint: <code>{cluster.fingerprint}</code>
                  </div>
                </div>

                <button
                  onClick={() => onOpenReplay(cluster)}
                  className={isApproved ? 'btn-secondary' : 'btn-primary'}
                  style={{ fontSize: '12px', padding: '6px 14px', flexShrink: 0 }}
                >
                  <RotateCcw size={13} />
                  <span>{isApproved ? 'View Replay Proof' : 'Test Fix in Replay Lab'}</span>
                </button>
              </div>

              {/* BLAST RADIUS CARD */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                background: 'rgba(30, 41, 59, 0.4)',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '12px',
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Affected Orders</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#f87171' }}>
                    {cluster.affectedOrders} orders
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Suppliers</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24' }}>
                    {cluster.affectedSuppliers.length} vendors
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Capital Exposed</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8' }}>
                    {cluster.businessValueAffected.toLocaleString()} TND
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stock-out Risk</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#a78bfa' }}>
                    {cluster.unitsExposedToStockOut} units
                  </div>
                </div>
              </div>

              {/* Generative Root Cause Diagnosis */}
              {cluster.rootCauseDiagnosis && (
                <div style={{
                  background: 'rgba(9, 13, 22, 0.7)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '11px',
                  lineHeight: '1.4',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Sparkles size={12} color="#38bdf8" />
                    <strong style={{ color: '#38bdf8' }}>Root Cause Diagnosis ({cluster.rootCauseDiagnosis.provider}):</strong>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {cluster.rootCauseDiagnosis.root_cause}
                  </p>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                    <strong>Recommended Fix:</strong> {cluster.proposedPatch?.description}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
