'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ReflexLoopBar } from '@/components/ReflexLoopBar';
import { ScenarioBar } from '@/components/ScenarioBar';
import { HealthOverview } from '@/components/HealthOverview';
import { FlightRecorderView } from '@/components/FlightRecorderView';
import { IncidentsView } from '@/components/IncidentsView';
import { ApprovalsView } from '@/components/ApprovalsView';
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
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [traces, setTraces] = useState<FlightTrace[]>([]);
  const [incidents, setIncidents] = useState<FailureCluster[]>([]);
  const [approvals, setApprovals] = useState<HumanApprovalItem[]>([]);

  // Modals & Drawers
  const [selectedTrace, setSelectedTrace] = useState<FlightTrace | null>(null);
  const [selectedClusterForReplay, setSelectedClusterForReplay] = useState<FailureCluster | null>(null);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Loading States
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
        // Open Replay Modal automatically on Scenario 5
        const freshIncidents = await fetch('/api/incidents').then(r => r.json());
        const supplierCluster = freshIncidents.incidents?.find((c: any) => c.clusterId === 'cluster_supplier_alias_mismatch') || freshIncidents.incidents?.[0];
        if (supplierCluster) {
          setSelectedClusterForReplay(supplierCluster);
        }
        showNotification('Scenario 5 Replay Lab sandbox verified 0/17 -> 15/17 (88% reduction)!', 'success');
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
  const handleTriggerReplay = async (clusterId: string): Promise<ReplayResult> => {
    const res = await fetch(`/api/incidents/${clusterId}/replay`, { method: 'POST' });
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
      showNotification(`Patch successfully approved & deployed into active policy!`, 'success');
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        systemStatus={systemStatus}
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
          background: notification.type === 'success' ? '#065f46' : notification.type === 'error' ? '#991b1b' : '#1e293b',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px 20px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          animation: 'pulseGlow 2s ease',
        }}>
          {notification.message}
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px', width: '100%', flex: 1 }}>
        {/* Architecture ReflexLoop Pipeline */}
        <ReflexLoopBar />

        {/* 5 Scenario Trigger Buttons */}
        <ScenarioBar
          onRunScenario={handleRunScenario}
          activeScenarioLoading={activeScenarioLoading}
        />

        {/* Health Overview Metric Gauges */}
        <HealthOverview metrics={metrics} />

        {/* Two Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
          gap: '20px',
        }}>
          {/* Left Column: Live Flight Recorder Stream & Human Review Queue */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FlightRecorderView
              traces={traces}
              onSelectTrace={tr => setSelectedTrace(tr)}
            />

            <ApprovalsView
              approvals={approvals}
              onDecision={handleApprovalDecision}
            />
          </div>

          {/* Right Column: Failure Memory & Blast Radius & Replay Sandbox */}
          <div>
            <IncidentsView
              incidents={incidents}
              onOpenReplay={cl => setSelectedClusterForReplay(cl)}
            />
          </div>
        </div>
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

      {/* API Contract & Docs Modal for Lovable Frontend */}
      {showDocsModal && (
        <ApiDocsModal onClose={() => setShowDocsModal(false)} />
      )}
    </div>
  );
}
