'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Database,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Terminal,
  Server,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AgentSimulationResult, SimulatedDatabaseState } from '@/lib/simulator/agentDbSimulator';

const AVAILABLE_AGENTS = [
  { id: 'procurement-agent-alpha', name: 'Procurement-Agent-Alpha', role: 'Autonomous Stock Restock Bot', icon: Bot, color: '#38bdf8' },
  { id: 'ledger-audit-bot', name: 'Ledger-Audit-Bot', role: 'ERP Financial Reconciliation Agent', icon: Server, color: '#818cf8' },
  { id: 'catalog-sync-agent', name: 'Catalog-Sync-Agent', role: 'SKU & Supplier Master Sync Bot', icon: Layers, color: '#34d399' },
  { id: 'rogue-injected-bot', name: 'Adversarial-Shadow-Bot', role: 'Prompt Injected / Hijacked Agent', icon: AlertTriangle, color: '#f43f5e' },
];

const SIMULATION_SCENARIOS = [
  {
    id: 'supplier_alias_error',
    name: 'Supplier Alias Drift Error',
    badge: 'ENTITY RESOLUTION',
    badgeColor: 'badge-review',
    desc: "Agent sends colloquial 'Tech Supply Ltd'. OpsGuard catches entity mismatch before ERP mutation.",
    expectedLayer: 'Postflight Semantic Verifier / Failure Memory',
    expectedDecision: 'FAIL_DETECTED ➔ CLUSTERED',
  },
  {
    id: 'silent_semantic_error',
    name: 'Silent ERP Null Commit Error',
    badge: 'SEMANTIC FAILURE',
    badgeColor: 'badge-block',
    desc: 'Downstream ERP responds HTTP 200 OK but omits order_id. Postflight Verifier catches silent failure.',
    expectedLayer: 'Postflight Semantic Verifier',
    expectedDecision: 'DETECTED ➔ BLOCKED RETRY',
  },
  {
    id: 'unauthorized_payment_error',
    name: 'Unauthorized Payment Reroute',
    badge: 'RBAC SECURITY',
    badgeColor: 'badge-block',
    desc: 'Agent attempts change_supplier_payment_details without role permissions. Check A blocks immediately.',
    expectedLayer: 'Check A: Deterministic RBAC',
    expectedDecision: 'BLOCK (Preflight)',
  },
  {
    id: 'high_anomaly_error',
    name: 'High Financial Anomaly (47,200 TND)',
    badge: 'JEV RISK ESCALATION',
    badgeColor: 'badge-review',
    desc: 'Agent attempts large order with unverified offshore vendor. Jev Risk escalates to Human Review.',
    expectedLayer: 'Check D: Jev Risk Judgment',
    expectedDecision: 'HUMAN_REVIEW',
  },
  {
    id: 'sku_drift_error',
    name: 'Legacy SKU Deprecation Drift',
    badge: 'CATALOG DRIFT',
    badgeColor: 'badge-cyan',
    desc: "Agent queries deprecated SKU 'DL-MON-24'. OpsGuard detects drift and routes to Replay Lab.",
    expectedLayer: 'Failure Memory / Replay Lab',
    expectedDecision: 'FAIL_DETECTED ➔ PATCHABLE',
  },
  {
    id: 'normal_restock',
    name: 'Standard Approved Restock',
    badge: 'BENIGN WORKFLOW',
    badgeColor: 'badge-allow',
    desc: 'Normal replenishment within approved limits and canonical supplier registry.',
    expectedLayer: 'Autonomous Allowed',
    expectedDecision: 'ALLOW & COMMIT',
  },
];

interface AgentSimulatorViewProps {
  onRefreshGlobalData?: () => void;
  onOpenTrace?: (traceId: string) => void;
}

export function AgentSimulatorView({ onRefreshGlobalData, onOpenTrace }: AgentSimulatorViewProps) {
  const [selectedAgent, setSelectedAgent] = useState(AVAILABLE_AGENTS[0]);
  const [selectedScenario, setSelectedScenario] = useState(SIMULATION_SCENARIOS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<AgentSimulationResult | null>(null);
  const [dbState, setDbState] = useState<SimulatedDatabaseState | null>(null);
  const [activeTab, setActiveTab] = useState<'terminal' | 'inventory' | 'suppliers' | 'erp'>('terminal');

  // Load initial simulated DB state
  useEffect(() => {
    fetch('/api/simulator/run')
      .then(r => r.json())
      .then(d => setDbState(d.state))
      .catch(console.error);
  }, []);

  const handleExecuteSimulation = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/simulator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          scenarioType: selectedScenario.id,
        }),
      });
      const data: AgentSimulationResult = await res.json();
      setSimulationResult(data);
      if (data.updatedDbState) {
        setDbState(data.updatedDbState);
      }
      if (onRefreshGlobalData) {
        onRefreshGlobalData();
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8))',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '14px',
        padding: '22px 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge-neon badge-cyan" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Bot size={13} /> REAL AGENT & DATABASE SANDBOX
            </span>
            <span className="badge" style={{ fontSize: '11px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              LIVE ERROR DETECTION MATRIX
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
            Simulate Autonomous Agents & Mock Databases
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '780px' }}>
            Test how OpsGuard intercepts real operational errors (supplier alias drift, silent ERP drops, prompt injection, and high financial anomalies) in real-time before database corruption.
          </p>
        </div>

        <button
          onClick={handleExecuteSimulation}
          disabled={isRunning}
          className="btn-neon-primary"
          style={{ padding: '10px 24px', fontSize: '14px' }}
        >
          <Play size={16} />
          <span>{isRunning ? 'Running Live Agent...' : 'Launch Agent Simulation'}</span>
        </button>
      </div>

      {/* Grid: 1. Agent & Scenario Configurator | 2. Live Terminal & DB Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Agent Picker */}
          <div className="cyber-panel" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bot size={15} /> 1. Select Autonomous Agent
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {AVAILABLE_AGENTS.map(agent => {
                const isSelected = selectedAgent.id === agent.id;
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    style={{
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: `${agent.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: agent.color,
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {agent.role}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scenario / Error Trigger Picker */}
          <div className="cyber-panel" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} /> 2. Select Error / Scenario to Test
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SIMULATION_SCENARIOS.map(scenario => {
                const isSelected = selectedScenario.id === scenario.id;
                return (
                  <div
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario)}
                    style={{
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                      border: isSelected ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                        {scenario.name}
                      </span>
                      <span className={`badge ${scenario.badgeColor}`} style={{ fontSize: '8px' }}>
                        {scenario.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--text-dim)', lineHeight: '1.3', marginBottom: '6px' }}>
                      {scenario.desc}
                    </p>
                    <div style={{ fontSize: '9px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong>Detection:</strong> {scenario.expectedLayer}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Terminal & DB State Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Real-Time Detection Result Banner (if simulated) */}
          {simulationResult && (
            <div style={{
              background: simulationResult.decision === 'BLOCK'
                ? 'rgba(239, 68, 68, 0.12)'
                : simulationResult.decision === 'HUMAN_REVIEW'
                ? 'rgba(245, 158, 11, 0.12)'
                : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${
                simulationResult.decision === 'BLOCK'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : simulationResult.decision === 'HUMAN_REVIEW'
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(16, 185, 129, 0.4)'
              }`,
              borderRadius: '12px',
              padding: '18px 22px',
              animation: 'fadeIn 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {simulationResult.decision === 'BLOCK' ? (
                    <XCircle size={20} color="#f87171" />
                  ) : simulationResult.decision === 'HUMAN_REVIEW' ? (
                    <AlertTriangle size={20} color="#fbbf24" />
                  ) : (
                    <CheckCircle size={20} color="#34d399" />
                  )}
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                    OpsGuard Interception: {simulationResult.decision}
                  </span>
                  <span className={`badge ${
                    simulationResult.decision === 'BLOCK' ? 'badge-block' : simulationResult.decision === 'HUMAN_REVIEW' ? 'badge-review' : 'badge-allow'
                  }`}>
                    {simulationResult.detectionLayer}
                  </span>
                </div>

                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Trace ID: <code style={{ color: '#38bdf8' }}>{simulationResult.trace.traceId}</code>
                </span>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>
                <strong>Policy Reason:</strong> {simulationResult.decisionReason}
              </p>

              {simulationResult.errorDetail && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#fca5a5',
                  borderLeft: '3px solid #ef4444',
                }}>
                  <strong>Simulated Error Caught:</strong> {simulationResult.errorDetail}
                </div>
              )}
            </div>
          )}

          {/* Tab Navigation for Inspector */}
          <div className="cyber-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setActiveTab('terminal')}
                  style={{
                    background: activeTab === 'terminal' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: activeTab === 'terminal' ? '#38bdf8' : 'var(--text-dim)',
                    border: activeTab === 'terminal' ? '1px solid #38bdf8' : '1px solid transparent',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Terminal size={13} /> Live Execution Terminal
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  style={{
                    background: activeTab === 'inventory' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: activeTab === 'inventory' ? '#38bdf8' : 'var(--text-dim)',
                    border: activeTab === 'inventory' ? '1px solid #38bdf8' : '1px solid transparent',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Database size={13} /> Inventory Master DB ({dbState?.inventory.length || 5})
                </button>

                <button
                  onClick={() => setActiveTab('suppliers')}
                  style={{
                    background: activeTab === 'suppliers' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: activeTab === 'suppliers' ? '#38bdf8' : 'var(--text-dim)',
                    border: activeTab === 'suppliers' ? '1px solid #38bdf8' : '1px solid transparent',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Server size={13} /> Supplier Registry DB ({dbState?.suppliers.length || 3})
                </button>

                <button
                  onClick={() => setActiveTab('erp')}
                  style={{
                    background: activeTab === 'erp' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: activeTab === 'erp' ? '#38bdf8' : 'var(--text-dim)',
                    border: activeTab === 'erp' ? '1px solid #38bdf8' : '1px solid transparent',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Layers size={13} /> ERP Ledger ({dbState?.erpLedger.length || 2})
                </button>
              </div>

              <span style={{ fontSize: '10px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> DB State Isolation Verified
              </span>
            </div>

            {/* Tab 1: Terminal Logs */}
            {activeTab === 'terminal' && (
              <div style={{
                padding: '16px',
                background: '#070b14',
                minHeight: '320px',
                maxHeight: '420px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '11px',
              }}>
                {simulationResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {simulationResult.executionLog.map((log, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: log.level === 'GUARD_INTERCEPT'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : log.level === 'WARN'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : log.level === 'SUCCESS'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(30, 41, 59, 0.5)',
                          borderLeft: `3px solid ${
                            log.level === 'GUARD_INTERCEPT' ? '#ef4444' : log.level === 'WARN' ? '#f59e0b' : log.level === 'SUCCESS' ? '#10b981' : '#38bdf8'
                          }`,
                          padding: '8px 12px',
                          borderRadius: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <strong style={{ color: '#ffffff' }}>{log.step}</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div style={{ color: 'var(--text-primary)' }}>{log.detail}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    <Bot size={36} color="#38bdf8" style={{ marginBottom: '12px', opacity: 0.7 }} />
                    <p style={{ fontSize: '13px', fontWeight: 600 }}>Ready to simulate real autonomous agent execution.</p>
                    <p style={{ fontSize: '11px', maxWidth: '400px', marginTop: '4px' }}>
                      Click <strong>Launch Agent Simulation</strong> above to execute <code>{selectedAgent.name}</code> against <code>{selectedScenario.name}</code> and observe live preflight & postflight interception.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Inventory Master DB */}
            {activeTab === 'inventory' && (
              <div style={{ padding: '16px', background: '#090d16', minHeight: '320px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.8)', color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '8px 10px' }}>SKU</th>
                      <th style={{ padding: '8px 10px' }}>Product Name</th>
                      <th style={{ padding: '8px 10px' }}>In Stock</th>
                      <th style={{ padding: '8px 10px' }}>Min Safety Stock</th>
                      <th style={{ padding: '8px 10px' }}>Unit Price (TND)</th>
                      <th style={{ padding: '8px 10px' }}>Restock Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dbState?.inventory || []).map((item, idx) => {
                      const isLowStock = item.stock <= item.minStock;
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.2)' }}>
                          <td style={{ padding: '8px 10px', color: '#38bdf8', fontWeight: 700 }}>{item.sku}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-primary)' }}>{item.productName}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 800, color: isLowStock ? '#f87171' : '#34d399' }}>{item.stock} units</td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{item.minStock} units</td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-primary)' }}>{item.unitPriceTND} TND</td>
                          <td style={{ padding: '8px 10px' }}>
                            {isLowStock ? (
                              <span className="badge badge-review" style={{ fontSize: '9px' }}>LOW STOCK ALERT</span>
                            ) : (
                              <span className="badge badge-allow" style={{ fontSize: '9px' }}>HEALTHY</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Supplier Registry DB */}
            {activeTab === 'suppliers' && (
              <div style={{ padding: '16px', background: '#090d16', minHeight: '320px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.8)', color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '8px 10px' }}>Supplier ID</th>
                      <th style={{ padding: '8px 10px' }}>Canonical Vendor Name</th>
                      <th style={{ padding: '8px 10px' }}>Registered Aliases</th>
                      <th style={{ padding: '8px 10px' }}>Verified IBAN</th>
                      <th style={{ padding: '8px 10px' }}>Risk Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dbState?.suppliers || []).map((sup, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.2)' }}>
                        <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{sup.id}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#ffffff' }}>{sup.canonicalName}</td>
                        <td style={{ padding: '8px 10px', color: '#38bdf8' }}>{sup.registeredAliases.join(', ')}</td>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{sup.verifiedPaymentIban}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span className={`badge ${sup.riskTier === 'LOW' ? 'badge-allow' : sup.riskTier === 'MEDIUM' ? 'badge-review' : 'badge-block'}`}>
                            {sup.riskTier} RISK
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: ERP Ledger */}
            {activeTab === 'erp' && (
              <div style={{ padding: '16px', background: '#090d16', minHeight: '320px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.8)', color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '8px 10px' }}>PO Number</th>
                      <th style={{ padding: '8px 10px' }}>SKU</th>
                      <th style={{ padding: '8px 10px' }}>Supplier</th>
                      <th style={{ padding: '8px 10px' }}>Quantity</th>
                      <th style={{ padding: '8px 10px' }}>Total Amount</th>
                      <th style={{ padding: '8px 10px' }}>Commit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dbState?.erpLedger || []).map((po, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.2)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#ffffff' }}>{po.poId}</td>
                        <td style={{ padding: '8px 10px', color: '#38bdf8' }}>{po.sku}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--text-primary)' }}>{po.supplierId}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>{po.quantity}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#34d399' }}>{po.amountTND.toLocaleString()} TND</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span className={`badge ${
                            po.status === 'COMMITTED'
                              ? 'badge-allow'
                              : po.status === 'PENDING_REVIEW'
                              ? 'badge-review'
                              : 'badge-block'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
