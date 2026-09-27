'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { FuturisticHero } from '@/components/FuturisticHero';
import { InteractiveReflexLoop } from '@/components/InteractiveReflexLoop';
import { ScenarioBar } from '@/components/ScenarioBar';
import { LiveConsoleHUD } from '@/components/LiveConsoleHUD';
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

  // Loading States & Toasts
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [activeScenarioLoading, setActiveScenarioLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const consoleRef = useRef<HTMLDivElement>(null);

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

  const scrollToConsole = () => {
    if (consoleRef.current) {
      consoleRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Cyber Grid Background Overlay */}
      <div className="cyber-grid" />

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

      {/* Main Content Area */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 28px 48px 28px', width: '100%', flex: 1, position: 'relative', zIndex: 1 }}>
        {/* Futuristic Hero Section */}
        <FuturisticHero
          systemStatus={systemStatus}
          metrics={metrics}
          onLaunchDemo={scrollToConsole}
          onRunBatch={handleRunBatch}
          isRunningBatch={isRunningBatch}
        />

        {/* Interactive ReflexLoop Highway */}
        <InteractiveReflexLoop />

        {/* Live Scenario Fast-Triggers */}
        <ScenarioBar
          onRunScenario={handleRunScenario}
          activeScenarioLoading={activeScenarioLoading}
        />

        {/* Mission Control Live Console HUD */}
        <div ref={consoleRef} style={{ scrollMarginTop: '90px' }}>
          <LiveConsoleHUD
            traces={traces}
            incidents={incidents}
            approvals={approvals}
            metrics={metrics}
            onSelectTrace={tr => setSelectedTrace(tr)}
            onOpenReplay={cl => setSelectedClusterForReplay(cl)}
            onApprovalDecision={handleApprovalDecision}
            onOpenDocs={() => setShowDocsModal(true)}
          />
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

      {/* API Specs Modal for Lovable Frontend */}
      {showDocsModal && (
        <ApiDocsModal onClose={() => setShowDocsModal(false)} />
      )}
    </div>
  );
}
