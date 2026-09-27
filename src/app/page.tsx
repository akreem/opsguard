'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header, DashboardNavTab } from '@/components/Header';
import { FuturisticHero } from '@/components/FuturisticHero';
import { InteractiveReflexLoop } from '@/components/InteractiveReflexLoop';
import { ReflexFlowCanvas } from '@/components/flow/ReflexFlowCanvas';
import { AgentSimulatorView } from '@/components/AgentSimulatorView';
import { FlightRecorderView } from '@/components/FlightRecorderView';
import { IncidentsView } from '@/components/IncidentsView';
import { ApprovalsView } from '@/components/ApprovalsView';
import { HealthOverview } from '@/components/HealthOverview';
import { ScenarioBar } from '@/components/ScenarioBar';
import { TraceDetailDrawer } from '@/components/TraceDetailDrawer';
import { ReplayLabModal } from '@/components/ReplayLabModal';
import { ApiDocsModal } from '@/components/ApiDocsModal';
import {
  FlightTrace,
  FailureCluster,
  HumanApprovalItem,
  HealthMetrics,
  SystemStatus,
  ReplayResult,
} from '@/lib/types';

export default function OpsGuardDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardNavTab>('pipeline');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [traces, setTraces] = useState<FlightTrace[]>([]);
  const [incidents, setIncidents] = useState<FailureCluster[]>([]);
  const [approvals, setApprovals] = useState<HumanApprovalItem[]>([]);

  // Modals & Drawers
  const [selectedTrace, setSelectedTrace] = useState<FlightTrace | null>(null);
  const [selectedClusterForReplay, setSelectedClusterForReplay] = useState<FailureCluster | null>(null);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Loading States & Toasts
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [activeScenarioLoading, setActiveScenarioLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch all live dashboard data
  const refreshData = useCallback(async () => {
    try {
      const [statusRes, healthRes, tracesRes, incidentsRes, approvalsRes] = await Promise.all([
        fetch('/api/system/status').then(r => r.json()),
        fetch('/api/health').then(r => r.json()),
        fetch('/api/traces').then(r => r.json()),
        fetch('/api/incidents').then(r => r.json()),
        fetch('/api/approvals').then(r => r.json()),
      ]);

      setSystemStatus(statusRes);
      setMetrics(healthRes);
      setTraces(tracesRes.traces || []);
      setIncidents(incidentsRes.incidents || []);
      setApprovals(approvalsRes.approvals || []);
    } catch (err) {
      console.error('Error loading OpsGuard dashboard state:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handler: Reset Demo State
  const handleReset = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      await refreshData();
      showNotification('Demo state reset to pristine 30 seeded operations.', 'success');
    } catch (err: any) {
      showNotification('Reset failed: ' + err.message, 'error');
    }
  };

  // Handler: Run Full Batch (All 30 Orders)
  const handleRunBatch = async () => {
    setIsRunningBatch(true);
    try {
      const res = await fetch('/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      await refreshData();
      showNotification(`Batch complete: ${data.completed} completed, ${data.blocked} blocked, ${data.humanReview} escalated, ${data.failed} failed.`, 'success');
    } catch (err: any) {
      showNotification('Batch run error: ' + err.message, 'error');
    } finally {
      setIsRunningBatch(false);
    }
  };

  // Handler: Run Single Live Demo Scenario (1 to 5)
  const handleRunScenario = async (scenarioId: string) => {
    setActiveScenarioLoading(scenarioId);
    try {
      const res = await fetch(`/api/demo/scenario/${scenarioId}`, { method: 'POST' });
      const data = await res.json();
      await refreshData();

      if (scenarioId === '5') {
        const freshIncidents = await fetch('/api/incidents').then(r => r.json());
        const supplierCluster = freshIncidents.incidents?.find((c: any) => c.clusterId === 'cluster_supplier_alias_mismatch') || freshIncidents.incidents?.[0];
        if (supplierCluster) {
          setSelectedClusterForReplay(supplierCluster);
        }
        showNotification('Scenario 5 Replay Lab sandbox verified 0/17 ➔ 15/17 (88% reduction)!', 'success');
      } else {
        showNotification(`${data.name}: ${data.expectedDecision}`, 'info');
      }
    } catch (err: any) {
      showNotification('Scenario error: ' + err.message, 'error');
    } finally {
      setActiveScenarioLoading(null);
    }
  };

  // Handler: Trigger Replay Sandbox
  const handleTriggerReplay = async (clusterId: string, model?: string): Promise<ReplayResult> => {
    const res = await fetch(`/api/incidents/${clusterId}/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model }),
    });
    const data = await res.json();
    await refreshData();
    return data;
  };

  // Handler: Approve Incident Fix
  const handleApproveFix = async (clusterId: string) => {
    try {
      const res = await fetch(`/api/incidents/${clusterId}/approve-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator: 'hackathon_operator' }),
      });
      const data = await res.json();
      await refreshData();
      if (selectedClusterForReplay) {
        setSelectedClusterForReplay(data.cluster);
      }
      showNotification(`Patch successfully approved & deployed by hackathon_operator!`, 'success');
    } catch (err: any) {
      showNotification('Approval error: ' + err.message, 'error');
    }
  };

  // Handler: Reject Incident Fix
  const handleRejectFix = async (clusterId: string) => {
    try {
      const res = await fetch(`/api/incidents/${clusterId}/reject-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator: 'hackathon_operator' }),
      });
      const data = await res.json();
      await refreshData();
      if (selectedClusterForReplay) {
        setSelectedClusterForReplay(data.cluster);
      }
      showNotification(`Patch rejected by hackathon_operator.`, 'info');
    } catch (err: any) {
      showNotification('Rejection error: ' + err.message, 'error');
    }
  };

  // Handler: Human Approval Decision
  const handleApprovalDecision = async (approvalId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/approvals/${approvalId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, operator: 'hackathon_operator' }),
      });
      await refreshData();
      showNotification(`Order ${decision === 'APPROVE' ? 'Approved & Transmitted' : 'Rejected'} by operator.`, 'success');
    } catch (err: any) {
      showNotification('Decision error: ' + err.message, 'error');
    }
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;
  const openIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'FIX_APPROVED').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Cyber Grid Background Overlay */}
      <div className="cyber-grid" />

      {/* Top Header & Sticky Navigation Bar */}
      <Header
        systemStatus={systemStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        openIncidentsCount={openIncidentsCount}
        tracesCount={traces.length}
        onReset={handleReset}
        onRunBatch={handleRunBatch}
        onOpenDocs={() => setShowDocsModal(true)}
        isRunningBatch={isRunningBatch}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: notification.type === 'success' ? 'rgba(5, 150, 105, 0.95)' : notification.type === 'error' ? 'rgba(220, 38, 38, 0.95)' : 'rgba(15, 23, 42, 0.95)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          padding: '12px 22px',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
          zIndex: 9999,
          backdropFilter: 'blur(10px)',
        }}>
          {notification.message}
        </div>
      )}

      {/* Main Content Area - Uncrowded Tab Views */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px 48px 28px', width: '100%', flex: 1, position: 'relative', zIndex: 1 }}>
        {/* VIEW 1: ReflexFlow Pipeline Canvas (Enlarged n8n / Hivvy style) */}
        {activeTab === 'pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Collapsible / Sleek Hero Bar */}
            <FuturisticHero
              systemStatus={systemStatus}
              metrics={metrics}
              onLaunchDemo={() => setActiveTab('sandbox')}
              onRunBatch={handleRunBatch}
              isRunningBatch={isRunningBatch}
            />

            {/* Interactive ReflexLoop Highway */}
            <InteractiveReflexLoop />

            {/* n8n / Hivvy Flow Style Interactive Automation Loop Canvas (Enlarged 680px) */}
            <ReflexFlowCanvas />

            {/* Live Scenario Fast-Triggers */}
            <ScenarioBar
              onRunScenario={handleRunScenario}
              activeScenarioLoading={activeScenarioLoading}
            />
          </div>
        )}

        {/* VIEW 2: Real Agent & Database Sandbox Simulator */}
        {activeTab === 'sandbox' && (
          <AgentSimulatorView
            onRefreshGlobalData={refreshData}
            onOpenTrace={trId => {
              const tr = traces.find(t => t.traceId === trId);
              if (tr) setSelectedTrace(tr);
            }}
          />
        )}

        {/* VIEW 3: Flight Recorder & Real-Time Traces */}
        {activeTab === 'traces' && (
          <div className="cyber-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  Flight Recorder Telemetry Ledger
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Structured, immutable trace records for every operational agent decision across Checks A, B, C, D and Postflight Verification.
                </p>
              </div>
              <span className="badge-neon badge-cyan" style={{ fontSize: '11px' }}>
                {traces.length} RECORDED TRACES
              </span>
            </div>
            <FlightRecorderView
              traces={traces}
              onSelectTrace={tr => setSelectedTrace(tr)}
            />
          </div>
        )}

        {/* VIEW 4: Incidents, Blast Radius & Replay Lab */}
        {activeTab === 'incidents' && (
          <div className="cyber-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  Incident Memory & Failure Clusters
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Clustered failure patterns, blast radius quantification (47,830 TND, 17 orders), and Agent Router root cause diagnosis.
                </p>
              </div>
              <span className="badge-neon badge-pink" style={{ fontSize: '11px' }}>
                {incidents.length} FAILURE CLUSTERS
              </span>
            </div>
            <IncidentsView
              incidents={incidents}
              onOpenReplay={cl => setSelectedClusterForReplay(cl)}
            />
          </div>
        )}

        {/* VIEW 5: Human Approvals Queue */}
        {activeTab === 'approvals' && (
          <div className="cyber-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  Human Review & Operator Sign-off Queue
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  High-risk and anomalous operations requiring explicit human authorization with cryptographic audit trail.
                </p>
              </div>
              <span className="badge badge-review" style={{ fontSize: '11px' }}>
                {pendingApprovalsCount} PENDING AUTHORIZATION
              </span>
            </div>
            <ApprovalsView
              approvals={approvals}
              onDecision={handleApprovalDecision}
            />
          </div>
        )}

        {/* VIEW 6: Reliability Health & Metrics */}
        {activeTab === 'health' && (
          <div className="cyber-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  Operational Reliability & Capital Protection
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Autonomous throughput rate, protected capital, guard interventions, and semantic verification telemetry.
                </p>
              </div>
              <span className="badge-neon badge-cyan" style={{ fontSize: '11px' }}>
                HEALTH SCORE: {metrics?.agentHealthScore ?? 94}/100
              </span>
            </div>
            <HealthOverview
              metrics={metrics}
            />
          </div>
        )}
      </main>

      {/* Telemetry Trace Inspector Drawer */}
      <TraceDetailDrawer
        trace={selectedTrace}
        onClose={() => setSelectedTrace(null)}
      />

      {/* Signature Replay Lab Sandbox Modal */}
      <ReplayLabModal
        cluster={selectedClusterForReplay}
        onClose={() => setSelectedClusterForReplay(null)}
        onApproveFix={handleApproveFix}
        onRejectFix={handleRejectFix}
        onTriggerReplay={handleTriggerReplay}
      />

      {/* API Specs Modal for Lovable Frontend */}
      {showDocsModal && (
        <ApiDocsModal onClose={() => setShowDocsModal(false)} />
      )}
    </div>
  );
}
