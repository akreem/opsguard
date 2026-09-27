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
      marginBottom: '20px',
    }}>
      {/* 1. Agent Health Score Gauge Card */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: `3px solid ${scoreColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '17px',
          color: scoreColor,
          background: `${scoreColor}15`,
          flexShrink: 0,
        }}>
          {healthScore}
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
            Agent Health Score
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
            {healthScore >= 80 ? 'Reliable / Protected' : 'Degraded Under Review'}
          </div>
          <div style={{ fontSize: '10px', color: '#a1a1aa' }}>
            Formula: 40% Sem + 30% Auto + 20% Rec
          </div>
        </div>
      </div>

      {/* 2. Autonomous Completion Rate */}
      <div className="glass-panel" style={{ padding: '16px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
            Autonomous Completion
          </span>
          <CheckCircle2 size={15} color="#ff0072" />
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
          {metrics?.autonomousCompletionPercent ?? 0}%
        </div>
        <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
          {metrics?.completedOrders ?? 0} of {metrics?.totalRequests ?? 30} orders verified
        </div>
      </div>

      {/* 3. Guard Interventions (Blocked + Review) */}
      <div className="glass-panel" style={{ padding: '16px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
            Guard Interventions
          </span>
          <ShieldBan size={15} color="#fbbf24" />
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24' }}>
          {metrics?.guardInterventions ?? 0}
        </div>
        <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
          {metrics?.blockedActions ?? 0} blocked • {(metrics?.guardInterventions ?? 0) - (metrics?.blockedActions ?? 0)} in review
        </div>
      </div>

      {/* 4. Semantic Success Rate */}
      <div className="glass-panel" style={{ padding: '16px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
            Semantic Success
          </span>
          <Activity size={15} color="#34d399" />
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399' }}>
          {metrics?.semanticSuccessRate ?? 100}%
        </div>
        <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
          Postflight payload verification
        </div>
      </div>

      {/* 5. Patch Recovery Rate */}
      <div className="glass-panel" style={{ padding: '16px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
            Patch Recovery Rate
          </span>
          <TrendingUp size={15} color="#a78bfa" />
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#a78bfa' }}>
          {metrics?.recoveryRate ?? 0}%
        </div>
        <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
          {metrics?.openIncidents ?? 0} active failure clusters
        </div>
      </div>

      {/* 6. Total TND Protected */}
      <div className="glass-panel" style={{ padding: '16px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
            Protected Capital
          </span>
          <DollarSign size={15} color="#38bdf8" />
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
          {(metrics?.totalTNDProtected ?? 72800).toLocaleString()} <span style={{ fontSize: '11px', color: '#ff6080' }}>TND</span>
        </div>
        <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
          Unauthorized spend intercepted
        </div>
      </div>
    </div>
  );
}
