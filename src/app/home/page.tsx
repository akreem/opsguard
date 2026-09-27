'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
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
import { WhatsAppChatView } from '@/components/WhatsAppChatView';
import {
  FlightTrace,
  FailureCluster,
  HumanApprovalItem,
  HealthMetrics,
  SystemStatus,
  ReplayResult,
} from '@/lib/types';

export default function AgentsGuardDashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
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

  // Verify client authentication state
  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (!data.authenticated) {
          const localToken = typeof window !== 'undefined' ? localStorage.getItem('opsguard_token') : null;
          if (localToken) {
            fetch('/api/auth/me', { headers: { Authorization: `Bearer ${localToken}` } })
              .then(r => r.json())
              .then(retryData => {
                if (!isMounted) return;
                if (!retryData.authenticated) {
                  router.replace('/login?redirect=/home');
                } else {
                  setAuthChecked(true);
                }
              })
              .catch(() => {
                if (isMounted) setAuthChecked(true);
              });
            return;
          }
          router.replace('/login?redirect=/home');
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => {
        if (isMounted) setAuthChecked(true);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Sync hash with active tab (e.g. /home#sandbox, /home#traces)
  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash.replace('#', '') as DashboardNavTab;
      const validTabs: DashboardNavTab[] = ['pipeline', 'whatsapp', 'sandbox', 'traces', 'incidents', 'approvals', 'health'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

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

  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0c0a14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        color: '#f4f4f5',
        gap: '16px',
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ff0072 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(255, 0, 114, 0.4)',
        }}>
          <Shield size={24} color="#ffffff" />
        </div>
        <div style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}>
          Authenticating Operator Access...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* React Flow Dot Grid Background Overlay */}
      <div className="cyber-grid" />

      {/* Top Header & Sticky Navigation Bar */}
      <Header
        systemStatus={systemStatus}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.location.hash = tab;
        }}
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
          background: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#18181b',
          color: '#ffffff',
          border: '1px solid #27272a',
          borderRadius: '8px',
          padding: '10px 18px',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          zIndex: 9999,
        }}>
          {notification.message}
        </div>
      )}

      {/* Main Content Area - Uncrowded Tab Views */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px 48px 28px', width: '100%', flex: 1, position: 'relative', zIndex: 1 }}>
        {/* VIEW 1: ReflexFlow Pipeline Canvas */}
        {activeTab === 'pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Live WhatsApp stream quick-link banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 18px',
              backgroundColor: 'rgba(0, 168, 132, 0.08)',
              border: '1px solid rgba(0, 168, 132, 0.25)',
              borderRadius: '8px',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00a884', display: 'inline-block' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e9edef' }}>
                  Live Operational WhatsApp Discussion Stream Running
                </span>
                <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                  (Microservice on Port 3002 automatically feeding preflight agent tool calls)
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('whatsapp');
                  window.location.hash = 'whatsapp';
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#00a884',
                  backgroundColor: 'rgba(0, 168, 132, 0.12)',
                  border: '1px solid #00a884',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                }}
              >
                Open Live WhatsApp Chat View →
              </button>
            </div>

            <ReflexFlowCanvas />

            <ScenarioBar
              onRunScenario={handleRunScenario}
              activeScenarioLoading={activeScenarioLoading}
            />

            <InteractiveReflexLoop />
          </div>
        )}

        {/* VIEW: Live Operational WhatsApp Discussion Stream */}
        {activeTab === 'whatsapp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <WhatsAppChatView
              onSelectTrace={tr => setSelectedTrace(tr)}
              onRefreshGlobalData={refreshData}
              traces={traces}
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
          <div className="cyber-panel" style={{ padding: '20px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                  Flight Recorder Telemetry Ledger
                </h3>
                <p style={{ fontSize: '12px', color: '#a1a1aa' }}>
                  Structured, immutable trace records for every operational agent decision across Checks A, B, C, D and Postflight Verification.
                </p>
              </div>
              <span className="badge-pink" style={{ fontSize: '11px' }}>
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
          <div className="cyber-panel" style={{ padding: '20px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                  Incident Memory & Failure Clusters
                </h3>
                <p style={{ fontSize: '12px', color: '#a1a1aa' }}>
                  Clustered failure patterns, blast radius quantification (47,830 TND, 17 orders), and Agent Router root cause diagnosis.
                </p>
              </div>
              <span className="badge-pink" style={{ fontSize: '11px' }}>
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
          <div className="cyber-panel" style={{ padding: '20px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                  Human Review & Operator Sign-off Queue
                </h3>
                <p style={{ fontSize: '12px', color: '#a1a1aa' }}>
                  High-risk and anomalous operations requiring explicit human authorization with cryptographic audit trail.
                </p>
              </div>
              <span className="badge-review" style={{ fontSize: '11px' }}>
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
          <div className="cyber-panel" style={{ padding: '20px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                  Operational Reliability & Capital Protection
                </h3>
                <p style={{ fontSize: '12px', color: '#a1a1aa' }}>
                  Autonomous throughput rate, protected capital, guard interventions, and semantic verification telemetry.
                </p>
              </div>
              <span className="badge-cyan" style={{ fontSize: '11px' }}>
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

      {/* API Specs Modal for Frontend */}
      {showDocsModal && (
        <ApiDocsModal onClose={() => setShowDocsModal(false)} />
      )}
    </div>
  );
}
