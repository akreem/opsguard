'use client';

import React from 'react';
import { Activity, ShieldCheck, CheckCircle2, ShieldBan, TrendingUp, DollarSign } from 'lucide-react';
import { HealthMetrics } from '@/lib/types';

interface HealthOverviewProps {
  metrics: HealthMetrics | null;
}

export function HealthOverview({ metrics }: HealthOverviewProps) {
  const healthScore = metrics?.agentHealthScore ?? 85;
  const scoreColor = healthScore >= 80 ? '#34d399' : healthScore >= 50 ? '#fbbf24' : '#f87171';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px',
      marginBottom: '24px',
    }}>
      {/* 1. Agent Health Score Gauge Card */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: `4px solid ${scoreColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '18px',
          color: scoreColor,
          background: `${scoreColor}15`,
          boxShadow: `0 0 16px ${scoreColor}30`,
          flexShrink: 0,
        }}>
          {healthScore}
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Agent Health Score
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {healthScore >= 80 ? 'Reliable / Protected' : 'Degraded Under Review'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            Formula: 40% Sem + 30% Auto + 20% Rec
          </div>
        </div>
      </div>

      {/* 2. Autonomous Completion Rate */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Autonomous Completion
          </span>
          <CheckCircle2 size={16} color="#38bdf8" />
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8' }}>
          {metrics?.autonomousCompletionPercent ?? 0}%
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {metrics?.completedOrders ?? 0} of {metrics?.totalRequests ?? 30} orders verified
        </div>
      </div>

      {/* 3. Guard Interventions (Blocked + Review) */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Guard Interventions
          </span>
          <ShieldBan size={16} color="#fbbf24" />
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#fbbf24' }}>
          {metrics?.guardInterventions ?? 0}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {metrics?.blockedActions ?? 0} blocked • {(metrics?.guardInterventions ?? 0) - (metrics?.blockedActions ?? 0)} in review
        </div>
      </div>

      {/* 4. Semantic Success Rate */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Semantic Success
          </span>
          <Activity size={16} color="#34d399" />
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#34d399' }}>
          {metrics?.semanticSuccessRate ?? 100}%
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Postflight payload verification
        </div>
      </div>

      {/* 5. Patch Recovery Rate */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Patch Recovery Rate
          </span>
          <TrendingUp size={16} color="#a78bfa" />
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#a78bfa' }}>
          {metrics?.recoveryRate ?? 0}%
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {metrics?.openIncidents ?? 0} active failure clusters
        </div>
      </div>

      {/* 6. Total TND Protected */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Protected Capital
          </span>
          <DollarSign size={16} color="#38bdf8" />
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
          {(metrics?.totalTNDProtected ?? 72800).toLocaleString()} <span style={{ fontSize: '12px', color: '#38bdf8' }}>TND</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Unauthorized spend intercepted
        </div>
      </div>
    </div>
  );
}
