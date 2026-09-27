'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Bot,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  Sliders,
  ExternalLink,
  MessageSquare,
  Users,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import { FlightTrace } from '@/lib/types';

export interface WhatsAppMessage {
  id: string;
  timestamp: string;
  timeStr: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    color: string;
    isAgent?: boolean;
  };
  text: string;
  type: 'chat' | 'agent_proposal' | 'system';
  chapterId?: string;
  chapterTitle?: string;
  meta?: {
    traceId?: string;
    decision?: 'ALLOW' | 'BLOCK' | 'HUMAN_REVIEW';
    policyName?: string;
    riskLevel?: string;
    anomalyScore?: number;
    tool?: string;
    amountTND?: number;
    timestamp?: string;
  };
}

interface WhatsAppChatViewProps {
  onSelectTrace?: (trace: FlightTrace) => void;
  onRefreshGlobalData?: () => void;
  traces?: FlightTrace[];
}

export function WhatsAppChatView({
  onSelectTrace,
  onRefreshGlobalData,
  traces = [],
}: WhatsAppChatViewProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [selectedChat, setSelectedChat] = useState<'procurement' | 'security' | 'vendor'>('procurement');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Connect to SSE stream
  useEffect(() => {
    let es: EventSource | null = null;

    const connectSSE = () => {
      es = new EventSource('/api/whatsapp/stream');
      eventSourceRef.current = es;

      es.addEventListener('init', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.history && Array.isArray(data.history)) {
            setMessages(data.history);
          }
          setConnected(true);
        } catch (err) {}
      });

      es.addEventListener('message', (e: MessageEvent) => {
        try {
          const msg = JSON.parse(e.data) as WhatsAppMessage;
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setConnected(true);

          // If the message has an OpsGuard action, refresh dashboard data
          if (msg.meta?.traceId && onRefreshGlobalData) {
            onRefreshGlobalData();
          }
        } catch (err) {}
      });

      es.addEventListener('typing', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          setIsTyping(Boolean(data.isTyping));
        } catch (err) {}
      });

      es.addEventListener('system', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.isStreaming !== undefined) {
            setIsStreaming(data.isStreaming);
          }
        } catch (err) {}
      });

      es.onerror = () => {
        setConnected(false);
        // Retry after 3 seconds if disconnected
        setTimeout(() => {
          if (es) {
            es.close();
            connectSSE();
          }
        }, 3000);
      };
    };

    connectSSE();

    // Fallback initial load
    fetch('/api/whatsapp/messages')
      .then(r => r.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(prev => prev.length === 0 ? data.messages : prev);
        }
      })
      .catch(() => {});

    return () => {
      if (es) es.close();
    };
  }, [onRefreshGlobalData]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          senderName: 'Lead AI Operator (You)',
        }),
      });

      if (onRefreshGlobalData) {
        setTimeout(onRefreshGlobalData, 1000);
      }
    } catch (err) {
      console.error('Failed to send WhatsApp message:', err);
    }
  };

  // Trigger Scenario
  const handleTriggerScenario = async (scenarioKey: string) => {
    setActiveScenario(scenarioKey);
    try {
      await fetch('/api/whatsapp/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioKey }),
      });
      if (onRefreshGlobalData) {
        setTimeout(onRefreshGlobalData, 2000);
      }
    } catch (err) {
      console.error('Failed to trigger scenario:', err);
    } finally {
      setTimeout(() => setActiveScenario(null), 3000);
    }
  };

  // Toggle Stream
  const handleToggleStream = async () => {
    try {
      const res = await fetch('/api/whatsapp/toggle', { method: 'POST' });
      const data = await res.json();
      setIsStreaming(data.isStreaming);
    } catch (err) {
      setIsStreaming(prev => !prev);
    }
  };

  const handleTraceClick = (traceId?: string) => {
    if (!traceId || !onSelectTrace) return;
    const found = traces.find(t => t.traceId === traceId);
    if (found) {
      onSelectTrace(found);
    } else {
      // Create mock trace object to open drawer
      onSelectTrace({
        traceId,
        requestId: `req_${traceId}`,
        timestamp: new Date().toISOString(),
        businessIntent: 'Replenish inventory via WhatsApp live discussion',
        agentIntent: 'Initiate purchase order replenishment for 20x Dell 24" FHD Monitor',
        proposedTool: 'create_purchase_order',
        toolArguments: { quantity: 20, sku: 'DELL-MON-24', amount: 5600 },
        authorizationResult: true,
        anomalyScore: 0.04,
        jevDecision: 'ALLOW',
        jevConfidence: 0.98,
        policyDecision: 'ALLOW',
        policyReason: 'All 4 preflight checks passed.',
        checks: {
          auth: { passed: true, role: 'inventory_agent', tool: 'create_purchase_order', reason: 'Role permitted' },
          anomaly: { score: 0.04, heuristics: [], triggered: false },
          intent: { intentConsistent: 'YES', requiresHumanReviewProb: 0.02, irreversibleImpactScore: 0.1, suspiciousActionProb: 0.01, reasoning: 'Direct replenish' },
          jev: { riskLevel: 'LOW', requiresHumanReviewProb: 0.02, argumentsSemanticallyConsistentProb: 0.98, suspiciousActionProb: 0.01, decisionSource: 'LOCAL_POLICY', confidence: 0.98 },
        },
        toolResult: { order_id: 'PO-9481', status: 'CONFIRMED' },
        latencyMs: 140,
        transportSuccess: true,
        semanticSuccess: true,
        failureFamily: null,
        severity: 'LOW',
        retryable: false,
        humanReviewStatus: 'NONE',
        decisionSource: 'LOCAL_POLICY',
      });
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 180px)',
      minHeight: '680px',
      backgroundColor: '#111b21',
      border: '1px solid #27272a',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* LEFT SIDEBAR: Channels & Operational Context */}
      <div style={{
        width: '320px',
        backgroundColor: '#111b21',
        borderRight: '1px solid #222d34',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* User profile / Status Header */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#202c33',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2a3942',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00a884 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
              color: '#ffffff',
            }}>
              AG
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#e9edef' }}>
                AgentsGuard Gateway
              </div>
              <div style={{ fontSize: '11px', color: '#8696a0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: connected ? '#00a884' : '#ef4444',
                  display: 'inline-block',
                }} />
                {connected ? 'Stream Live (Port 3002)' : 'Connecting...'}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleStream}
            title={isStreaming ? 'Pause Discussion Stream' : 'Resume Discussion Stream'}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: isStreaming ? 'rgba(0, 168, 132, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${isStreaming ? '#00a884' : '#ef4444'}`,
              color: isStreaming ? '#00a884' : '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {isStreaming ? <Pause size={13} /> : <Play size={13} />}
            {isStreaming ? 'Stream Active' : 'Paused'}
          </button>
        </div>

        {/* Channels List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#8696a0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Operational Discussions
          </div>

          {/* Channel 1: Logistics & Procurement (Active) */}
          <div
            onClick={() => setSelectedChat('procurement')}
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: selectedChat === 'procurement' ? '#2a3942' : 'transparent',
              cursor: 'pointer',
              borderBottom: '1px solid #1f2c33',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#00a884',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '18px',
              flexShrink: 0,
            }}>
              🏢
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e9edef', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Logistics & Sourcing Ops
                </span>
                <span style={{ fontSize: '11px', color: '#8696a0' }}>Now</span>
              </div>
              <div style={{ fontSize: '12px', color: '#8696a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {messages[messages.length - 1]?.text || 'Listening to agent actions...'}
              </div>
            </div>
          </div>

          {/* Channel 2: Security & Alert Interceptions */}
          <div
            onClick={() => setSelectedChat('security')}
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: selectedChat === 'security' ? '#2a3942' : 'transparent',
              cursor: 'pointer',
              borderBottom: '1px solid #1f2c33',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#ff0072',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}>
              <Shield size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e9edef' }}>
                  AgentsGuard Security Feed
                </span>
                <span style={{ fontSize: '11px', color: '#ff0072', fontWeight: 700 }}>ARMED</span>
              </div>
              <div style={{ fontSize: '12px', color: '#8696a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Check A RBAC & IBAN mutation guard
              </div>
            </div>
          </div>

          {/* Active Participants Info Box */}
          <div style={{ padding: '16px', margin: '14px', backgroundColor: '#182229', borderRadius: '8px', border: '1px solid #222d34' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#00a884', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={12} className="pulse-cyan" />
              Simulated Group Members
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#d1d7db' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00a884' }} />
                <strong>AgentsGuard Agent Bot</strong> (AI Auto-Procure)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                <strong>Sarah Ben Ali</strong> (Warehouse Lead)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fbbf24' }} />
                <strong>Karim Mansour</strong> (VP Supply Chain)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a78bfa' }} />
                <strong>Tarek Trabelsi</strong> (Finance / AP)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f87171' }} />
                <strong>External Vendor</strong> (TechSupply)
              </div>
            </div>
          </div>
        </div>

        {/* Microservice Container Info Footer */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#182229',
          borderTop: '1px solid #222d34',
          fontSize: '11px',
          color: '#8696a0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>Container: <code>whatsapp-stream</code></span>
          <span style={{ color: '#00a884', fontWeight: 600 }}>Docker 3002:3002</span>
        </div>
      </div>

      {/* RIGHT MAIN CHAT AREA */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0b141a',
        position: 'relative',
      }}>
        {/* Background WhatsApp Doodle Texture Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 168, 132, 0.03) 0%, transparent 80%), radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 28px 28px',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Chat Top Header */}
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#202c33',
          borderBottom: '1px solid #2a3942',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#00a884',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>
              🏢
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#e9edef' }}>
                AgentsGuard Logistics & Procurement Ops (#Tunis-North)
              </div>
              <div style={{ fontSize: '11px', color: '#8696a0' }}>
                Sarah Ben Ali, Karim Mansour, Tarek Trabelsi, 🤖 AgentsGuard Bot • End-to-End Guarded
              </div>
            </div>
          </div>

          {/* Quick Scenario Injection Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#8696a0', fontWeight: 600 }}>Simulate:</span>
            <button
              onClick={() => handleTriggerScenario('normal')}
              disabled={activeScenario === 'normal'}
              style={{
                padding: '5px 10px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                cursor: 'pointer',
              }}
            >
              ⚡ Restock (ALLOW)
            </button>
            <button
              onClick={() => handleTriggerScenario('iban')}
              disabled={activeScenario === 'iban'}
              style={{
                padding: '5px 10px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'rgba(255, 0, 114, 0.12)',
                color: '#ff2d78',
                border: '1px solid rgba(255, 0, 114, 0.3)',
                cursor: 'pointer',
              }}
            >
              🛑 IBAN Attack (BLOCK)
            </button>
            <button
              onClick={() => handleTriggerScenario('high_value')}
              disabled={activeScenario === 'high_value'}
              style={{
                padding: '5px 10px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'rgba(251, 191, 36, 0.12)',
                color: '#fbbf24',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                cursor: 'pointer',
              }}
            >
              ⏳ 350 Laptops (REVIEW)
            </button>
            <button
              onClick={() => handleTriggerScenario('drift')}
              disabled={activeScenario === 'drift'}
              style={{
                padding: '5px 10px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'rgba(167, 139, 250, 0.12)',
                color: '#a78bfa',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                cursor: 'pointer',
              }}
            >
              ⚠️ Alias Drift (REPLAY)
            </button>
          </div>
        </div>

        {/* Message Stream Area */}
        <div style={{
          flex: 1,
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 1,
        }}>
          {messages.map((msg) => {
            const isUser = msg.sender.id === 'user_operator';
            const isBot = msg.sender.isAgent;

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Bubble Container */}
                <div style={{
                  backgroundColor: isUser ? '#005c4b' : '#202c33',
                  borderRadius: isUser ? '10px 2px 10px 10px' : '2px 10px 10px 10px',
                  padding: '10px 14px',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
                  border: isBot ? '1px solid rgba(0, 168, 132, 0.4)' : '1px solid transparent',
                  position: 'relative',
                  width: '100%',
                }}>
                  {/* Sender Header (for other participants) */}
                  {!isUser && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', gap: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: msg.sender.color }}>
                        {msg.sender.name}
                      </span>
                      <span style={{ fontSize: '10px', color: '#8696a0', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#182229' }}>
                        {msg.sender.role}
                      </span>
                    </div>
                  )}

                  {/* Message Text */}
                  <div style={{
                    fontSize: '13px',
                    color: '#e9edef',
                    lineHeight: '1.45',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>

                  {/* OpsGuard Telemetry / Verdict Attachment Card */}
                  {msg.meta && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#111b21',
                      border: `1px solid ${
                        msg.meta.decision === 'ALLOW' ? '#00a884' : msg.meta.decision === 'BLOCK' ? '#ff0072' : '#fbbf24'
                      }`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Shield size={14} color={msg.meta.decision === 'ALLOW' ? '#00a884' : msg.meta.decision === 'BLOCK' ? '#ff0072' : '#fbbf24'} />
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#e9edef' }}>
                            AgentsGuard ReflexGateway
                          </span>
                        </div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          color: '#ffffff',
                          backgroundColor: msg.meta.decision === 'ALLOW' ? '#00a884' : msg.meta.decision === 'BLOCK' ? '#ff0072' : '#d97706',
                        }}>
                          {msg.meta.decision}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: '#8696a0', marginBottom: '8px' }}>
                        <div>Policy: <strong style={{ color: '#d1d7db' }}>{msg.meta.policyName || 'POL-DEFAULT'}</strong></div>
                        <div>Anomaly Score: <strong style={{ color: msg.meta.anomalyScore && msg.meta.anomalyScore > 0.5 ? '#ff6080' : '#34d399' }}>{msg.meta.anomalyScore ?? 0.04}</strong></div>
                        {msg.meta.tool && <div>Tool: <strong style={{ color: '#38bdf8' }}>{msg.meta.tool}</strong></div>}
                        {msg.meta.amountTND !== undefined && msg.meta.amountTND > 0 && <div>Amount: <strong style={{ color: '#e9edef' }}>{msg.meta.amountTND.toLocaleString()} TND</strong></div>}
                      </div>

                      {msg.meta.traceId && (
                        <button
                          onClick={() => handleTraceClick(msg.meta?.traceId)}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#202c33',
                            border: '1px solid #2a3942',
                            color: '#00a884',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <Sparkles size={12} />
                          Inspect Flight Recorder Trace ({msg.meta.traceId.substring(0, 10)}...)
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Timestamp & Read Receipt */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    marginTop: '4px',
                    fontSize: '10px',
                    color: '#8696a0',
                  }}>
                    <span>{msg.timeStr}</span>
                    {isUser && <span style={{ color: '#53bdeb', fontWeight: 'bold' }}>✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#202c33',
              padding: '8px 14px',
              borderRadius: '16px',
              alignSelf: 'flex-start',
              color: '#8696a0',
              fontSize: '12px',
            }}>
              <Bot size={14} color="#00a884" />
              <span>AgentsGuard Bot is generating preflight tool proposal...</span>
              <span className="typing-dot" style={{ display: 'inline-flex', gap: '3px' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#00a884' }} />
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#00a884' }} />
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#00a884' }} />
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div style={{
          padding: '8px 20px',
          backgroundColor: '#202c33',
          borderTop: '1px solid #2a3942',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          zIndex: 1,
        }}>
          <span style={{ fontSize: '11px', color: '#8696a0', alignSelf: 'center', whiteSpace: 'nowrap' }}>Try typing:</span>
          {[
            'Order 15x Dell 24 Monitors from TechSupply',
            'Update vendor IBAN to TN59-9999-8888-7777-6666',
            'Order 400x Dell XPS Laptops for enterprise pilot',
            'Check stock for SKU DELL-MON-24',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(prompt)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                backgroundColor: '#111b21',
                border: '1px solid #2a3942',
                color: '#d1d7db',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Bottom Chat Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '10px 20px',
            backgroundColor: '#202c33',
            borderTop: '1px solid #2a3942',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', gap: '10px', color: '#8696a0' }}>
            <Smile size={20} style={{ cursor: 'pointer' }} />
            <Paperclip size={20} style={{ cursor: 'pointer' }} />
          </div>

          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type a message or instruction to the AgentsGuard Agent..."
            style={{
              flex: 1,
              backgroundColor: '#2a3942',
              border: 'none',
              borderRadius: '8px',
              padding: '11px 16px',
              fontSize: '13px',
              color: '#e9edef',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: inputText.trim() ? '#00a884' : '#2a3942',
              color: inputText.trim() ? '#ffffff' : '#8696a0',
              border: 'none',
              cursor: inputText.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
