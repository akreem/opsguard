'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Zap,
  Play,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Database,
  Lock,
  Terminal,
  Activity,
  Sparkles,
  Layers,
  ChevronRight,
  Copy,
  Check,
  Server,
  Code2,
  Bot,
  UserCheck,
  ExternalLink,
} from 'lucide-react';

export default function AgentsGuardLandingPage() {
  const [activeCodeTab, setActiveCodeTab] = useState<'docker' | 'npm' | 'python' | 'curl'>('docker');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedDemoScenario, setSelectedDemoScenario] = useState<number>(1);
  const [demoExecuting, setDemoExecuting] = useState(false);

  useEffect(() => {
    // If logged in, automatically forward to /home
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (params && params.has('public')) return;

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          window.location.href = '/home';
        }
      })
      .catch(() => {});
  }, []);

  const codeSnippets = {
    docker: `docker run -d -p 3000:3000 \\
  -e DEMO_MODE=true \\
  -e AGENTROUTER_MODEL=deepseek-v4-flash \\
  -v agentsguard-data:/app/data \\
  agentsguard/control-plane:latest`,
    npm: `import { AgentsGuardGateway } from '@agentsguard/reflex-loop';

// Intercept autonomous agent tool calls preflight in <10ms
const guard = new AgentsGuardGateway({ apiKey: process.env.AGENTSGUARD_KEY });
const verdict = await guard.interceptPreflight({
  agentId: 'procurement-bot-01',
  proposedTool: 'create_purchase_order',
  arguments: { sku: 'DELL-MONITOR-24', quantity: 20, amount: 2800 },
});

if (verdict.decision === 'ALLOW') {
  await executeTool();
}`,
    python: `from agentsguard import ReflexLoopGateway

# Initialize runtime control plane
gateway = ReflexLoopGateway(api_key="sk-agentsguard-...")

@gateway.guard(tool_name="create_purchase_order")
def execute_procurement(sku: str, quantity: int, amount: float):
    # Gateway runs Check A (RBAC), B (Anomaly), C (Intent), D (Jev)
    return erp_client.commit_order(sku=sku, qty=quantity, total=amount)`,
    curl: `curl -X POST http://localhost:3000/api/run \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "procurement-bot-01",
    "businessIntent": "Restock Dell 24 inch monitors",
    "proposedTool": "create_purchase_order",
    "arguments": { "sku": "DELL-MONITOR-24", "quantity": 20, "amount": 2800 }
  }'`,
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Interactive Live Demo scenarios for the hero section
  const demoScenarios = [
    {
      id: 1,
      name: 'Normal Restock',
      agent: 'Procurement-Bot-Alpha',
      action: 'create_purchase_order (20x Dell Monitors, 2,800 TND)',
      status: 'ALLOWED',
      statusClass: 'badge-allow',
      time: '4ms',
      checks: { auth: 'PASS', anomaly: '0.04 (LOW)', intent: '100% MATCH', outcome: 'SEMANTIC_OK' },
      detail: 'Passes deterministic RBAC, low anomaly threshold, and verified canonical supplier catalog.',
    },
    {
      id: 2,
      name: 'Anomalous Bulk Spend',
      agent: 'Procurement-Bot-Alpha',
      action: 'create_purchase_order (500 units, 70,000 TND)',
      status: 'HUMAN_REVIEW',
      statusClass: 'badge-review',
      time: '6ms',
      checks: { auth: 'PASS', anomaly: '0.89 (HIGH)', intent: 'MISMATCH', outcome: 'SUSPENDED_FOR_APPROVAL' },
      detail: 'Exceeds autonomous spending threshold (5,000 TND). Suspended in Preflight until human operator signs off.',
    },
    {
      id: 3,
      name: 'Silent Drop Recovery',
      agent: 'Order-Fulfillment-Bot',
      action: 'execute_fulfillment (SKU-8829)',
      status: 'INTERCEPTED',
      statusClass: 'badge-block',
      time: '9ms',
      checks: { auth: 'PASS', anomaly: '0.15', intent: 'MATCH', outcome: 'SILENT_DROP_CAUGHT' },
      detail: 'Downstream ERP returned HTTP 200 OK but null transaction payload. Postflight verifier flagged anomaly before data loss.',
    },
    {
      id: 4,
      name: 'Catalog Alias Drift',
      agent: 'Procurement-Bot-Beta',
      action: 'supplier_lookup ("Tech Supply Ltd" vs "TechSupply Corp")',
      status: 'CLUSTERED',
      statusClass: 'badge-pink',
      time: '8ms',
      checks: { auth: 'PASS', anomaly: '0.12', intent: 'MATCH', outcome: '17 ORDERS (47.8k TND BLAST RADIUS)' },
      detail: 'Postflight Semantic Verifier catches alias drift, links failure cluster, and generates root cause diagnosis.',
    },
    {
      id: 5,
      name: 'Replay Sandbox Proof',
      agent: 'Replay-Prover-Engine',
      action: 'Replay 17 historical failures against proposed policy patch',
      status: '88% PROVEN',
      statusClass: 'badge-cyan',
      time: '12ms',
      checks: { before: '0/17 SUCCESS', after: '15/17 SUCCESS', regressions: '0', safetyScore: '99.4%' },
      detail: 'Proves patch improvement in Docker-isolated sandbox before human operator signs off for deployment.',
    },
  ];

  const currentScenario = demoScenarios.find(s => s.id === selectedDemoScenario) || demoScenarios[0];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0c0a14',
      color: '#f4f4f5',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Sentry Subtle Background Grid & Violet Glow Atmosphere */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '900px',
        backgroundImage: `
          radial-gradient(circle at 50% 10%, rgba(124, 58, 237, 0.18) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(255, 0, 114, 0.12) 0%, transparent 45%),
          radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 24px 24px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Sticky Primary Header / Navigation (Sentry Style) */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(12, 10, 20, 0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo & Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff2d78 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(255, 45, 120, 0.35)',
            }}>
              <Shield size={18} color="#ffffff" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '19px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
                AgentsGuard
              </span>
              <span style={{
                background: 'rgba(255, 45, 120, 0.1)',
                border: '1px solid rgba(255, 45, 120, 0.3)',
                color: '#ff6080',
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}>
                Agent APM
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/home#pipeline" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}>
              ReflexFlow Canvas
            </Link>
            <Link href="/home#sandbox" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}>
              Agent Sandbox
            </Link>
            <Link href="/home#traces" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}>
              Flight Recorder
            </Link>
            <Link href="/home#incidents" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}>
              Replay Lab
            </Link>
            <Link href="/home#health" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s' }}>
              Reliability Score
            </Link>
          </nav>

          {/* Top Right Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/login"
              style={{
                color: '#f4f4f5',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Sign In</span>
            </Link>

            <Link
              href="/register"
              style={{
                backgroundColor: '#ff2d78',
                color: '#ffffff',
                border: '1px solid #ff2d78',
                padding: '7px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(255, 45, 120, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Register</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 1. SENTRY-STYLE HERO SECTION: "Agents break, fix them faster" */}
      {/* ========================================================= */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '72px 24px 48px 24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Subtle pill tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          padding: '5px 14px',
          borderRadius: '9999px',
          marginBottom: '24px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff2d78', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#c084fc', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            Preflight Interception & Replay Sandbox for Autonomous Agents
          </span>
        </div>

        {/* PRIMARY HEADLINE (Faithful adaptation of user's uploaded Sentry screenshot) */}
        <h1 style={{
          fontSize: 'clamp(44px, 7vw, 84px)',
          fontWeight: 900,
          letterSpacing: '-2px',
          lineHeight: '1.05',
          color: '#ffffff',
          marginBottom: '22px',
        }}>
          Agents{' '}
          <span style={{
            position: 'relative',
            display: 'inline-block',
            color: '#ff2d78',
            transform: 'rotate(-2.5deg)',
            fontStyle: 'normal',
            marginRight: '8px',
            marginLeft: '4px',
          }}>
            break,
            {/* Hand-drawn red/pink squiggly underline curved under the word */}
            <svg
              style={{
                position: 'absolute',
                left: '-8%',
                bottom: '-14px',
                width: '116%',
                height: '24px',
                overflow: 'visible',
              }}
              viewBox="0 0 160 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 18C28 26 80 27 156 12C120 20 54 27 6 22"
                stroke="#ff2d78"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>{' '}
          fix them faster
        </h1>

        {/* Sub-headline directly matching Sentry's witty copy */}
        <p style={{
          fontSize: 'clamp(16px, 2vw, 21px)',
          color: '#a1a1aa',
          maxWidth: '760px',
          margin: '0 auto 36px auto',
          lineHeight: '1.5',
          fontWeight: 400,
        }}>
          Autonomous agent monitoring and real-time reliability software considered{' '}
          <span style={{ color: '#ffffff', fontWeight: 600 }}>&ldquo;not bad&rdquo;</span> by millions of developers deploying LLMs to production.
        </p>

        {/* Hero Action Buttons (Sentry Style) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '52px',
        }}>
          <Link
            href="/register"
            style={{
              backgroundColor: '#ff2d78',
              color: '#ffffff',
              border: '1px solid #ff2d78',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(255, 45, 120, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Get Started Free</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            href="/home#sandbox"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: '#f4f4f5',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '12px 26px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Play size={14} color="#ff2d78" />
            <span>Launch Live Sandbox</span>
          </Link>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE PLAYGROUND WIDGET ON LANDING PAGE */}
        {/* ========================================================= */}
        <div style={{
          background: '#131020',
          border: '1px solid rgba(124, 58, 237, 0.25)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '1040px',
          margin: '0 auto 80px auto',
          textAlign: 'left',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(124, 58, 237, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff2d78' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#a1a1aa', marginLeft: '6px' }}>
                Live ReflexLoop Gateway Inspector
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#71717a' }}>
              Select a scenario to trigger simulated runtime interception
            </div>
          </div>

          {/* Scenario Trigger Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            {demoScenarios.map(s => {
              const isSelected = selectedDemoScenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedDemoScenario(s.id)}
                  style={{
                    background: isSelected ? 'rgba(255, 45, 120, 0.15)' : '#181428',
                    border: isSelected ? '1px solid #ff2d78' : '1px solid #272238',
                    color: isSelected ? '#ffffff' : '#a1a1aa',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s.id}. {s.name}
                </button>
              );
            })}
          </div>

          {/* Scenario Simulation Result Box */}
          <div style={{
            background: '#0c0a14',
            border: '1px solid #272238',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Target Agent & Action
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                  <code>{currentScenario.agent}</code> ➔ {currentScenario.action}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: '#71717a' }}>Latency: {currentScenario.time}</span>
                <span className={`badge ${currentScenario.statusClass}`} style={{ fontSize: '11px', padding: '4px 10px' }}>
                  {currentScenario.status}
                </span>
              </div>
            </div>

            {/* Check Breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
              background: '#131020',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #201a33',
            }}>
              {Object.entries(currentScenario.checks).map(([key, val]) => (
                <div key={key}>
                  <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase' }}>{key}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>{val}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, lineHeight: '1.4' }}>
              <strong>Operational Defense:</strong> {currentScenario.detail}
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. THE 4 SENTRY CORE VALUE PROPOSITION PILLARS */}
        {/* ========================================================= */}
        <div style={{ textAlign: 'left', marginBottom: '84px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff2d78', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Autonomous Agent Reliability Architecture
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.8px', marginTop: '6px' }}>
              Everything your agents touch, verified before & after
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {/* Pillar 1 */}
            <div style={{
              background: '#131020',
              border: '1px solid #272238',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                Preflight in under 10ms
              </h3>
              <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
                Drop in the gateway. Check A (RBAC), Check B (Anomaly scoring 0-1.0), Check C (Intent consistency), and Check D (Jev risk judgment) evaluate actions deterministically before tools mutate live DB state.
              </p>
            </div>

            {/* Pillar 2 */}
            <div style={{
              background: '#131020',
              border: '1px solid #272238',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={18} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                Automatically root-cause silent drops
              </h3>
              <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
                Standard APM only sees HTTP 200. Our Postflight Semantic Verifier catches silent drops when downstream APIs respond 200 OK but return a null order_id, classifying failures before customers notice.
              </p>
            </div>

            {/* Pillar 3 */}
            <div style={{
              background: '#131020',
              border: '1px solid #272238',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(255, 45, 120, 0.1)', border: '1px solid rgba(255, 45, 120, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#ff2d78" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                Babysit the bots without alert fatigue
              </h3>
              <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
                Failure Memory automatically clusters recurring failure fingerprints (like Tech Supply Ltd alias drift across 17 orders), calculates financial blast radius (47,830 TND), and diagnoses root cause.
              </p>
            </div>

            {/* Pillar 4 */}
            <div style={{
              background: '#131020',
              border: '1px solid #272728',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCcw size={18} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                Prove fixes in Replay Sandbox
              </h3>
              <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
                Never deploy an agent patch blindly. Replay historical failure traces against proposed policy patches in an isolated sandbox to verify 0/17 ➔ 15/17 (88% recovery) before operator sign-off.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. SENTRY'S "EVERYTHING'S CONNECTED" SECTION */}
        {/* ========================================================= */}
        <div style={{
          background: 'linear-gradient(135deg, #150f28 0%, #0d0a18 100%)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '14px',
          padding: '40px 32px',
          marginBottom: '84px',
          textAlign: 'left',
        }}>
          <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff2d78', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Unified Telemetry
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.8px', margin: '8px 0 14px 0' }}>
              Everything&apos;s connected.
            </h2>
            <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: '1.6' }}>
              Yeah, other observability tools exist. But preflight gateway checks, postflight semantic verifications, immutable flight traces, failure memory clusters, and replay sandbox proofs — all connected by the exact same trace ID? That&apos;s kind of our thing.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {[
              { title: 'Flight Traces', desc: 'Immutable structured telemetry per LLM tool call', color: '#38bdf8' },
              { title: '4 Gateway Checks', desc: 'RBAC, anomaly, intent, and Jev risk evaluation', color: '#ff2d78' },
              { title: 'Semantic Verifier', desc: 'Differentiates HTTP 200 from actual business outcome', color: '#34d399' },
              { title: 'Failure Memory', desc: 'Blast radius quantification and fingerprint clustering', color: '#c084fc' },
              { title: 'Replay Sandbox', desc: 'Historical regression testing with AI attestation', color: '#fbbf24' },
              { title: 'Human Sign-off', desc: 'Cryptographic operator approval and versioned policy', color: '#10b981' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: item.color, marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '11px', color: '#71717a', lineHeight: '1.4' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. SENTRY'S "SEE -- IT'S REALLY JUST ONE LINE" CODE SECTION */}
        {/* ========================================================= */}
        <div style={{ textAlign: 'left', marginBottom: '84px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff2d78', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Zero Friction Setup
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.8px', marginTop: '6px' }}>
              See — it&apos;s really just one line.
            </h2>
            <p style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>
              Deploy the control plane as a drop-in gateway, sidecar container, or direct SDK.
            </p>
          </div>

          <div style={{
            maxWidth: '820px',
            margin: '0 auto',
            background: '#131020',
            border: '1px solid #272238',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            {/* Code Tabs */}
            <div style={{
              background: '#0e0b17',
              borderBottom: '1px solid #272238',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['docker', 'npm', 'python', 'curl'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    style={{
                      background: activeCodeTab === tab ? '#251c3d' : 'transparent',
                      color: activeCodeTab === tab ? '#ffffff' : '#71717a',
                      border: activeCodeTab === tab ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid transparent',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCopyCode(codeSnippets[activeCodeTab])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                }}
              >
                {copiedCode ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copied' : 'Copy command'}</span>
              </button>
            </div>

            {/* Code Body */}
            <pre style={{
              padding: '20px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: '#f4f4f5',
              overflowX: 'auto',
              lineHeight: '1.6',
              margin: 0,
            }}>
              {codeSnippets[activeCodeTab]}
            </pre>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. COMPARISON MATRIX: TRADITIONAL APM VS OPSGUARD */}
        {/* ========================================================= */}
        <div style={{ textAlign: 'left', marginBottom: '84px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.8px' }}>
              Why traditional APM fails with AI agents
            </h2>
            <p style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '6px' }}>
              Agents fail semantically, not syntactically. Here is how AgentsGuard changes the game.
            </p>
          </div>

          <div style={{
            maxWidth: '920px',
            margin: '0 auto',
            background: '#131020',
            border: '1px solid #272238',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#0e0b17', borderBottom: '1px solid #272238', color: '#a1a1aa', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px' }}>Capability</th>
                  <th style={{ padding: '12px 18px', color: '#71717a' }}>Standard APM / Datadog</th>
                  <th style={{ padding: '12px 18px', color: '#ff2d78' }}>AgentsGuard ReflexLoop</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    cap: 'Preflight Action Interception',
                    legacy: 'No — passive logs only after damage is done',
                    ops: 'Yes — <10ms RBAC, Anomaly & Jev judgment',
                  },
                  {
                    cap: 'Silent Semantic Failure Detection',
                    legacy: 'Blind — sees HTTP 200 and marks "healthy"',
                    ops: 'Deep Catch — flags null order_id and data drift',
                  },
                  {
                    cap: 'Financial Blast Radius Clustering',
                    legacy: 'Manual log search and post-mortem triage',
                    ops: 'Automated clustering (e.g. 47,830 TND, 17 orders)',
                  },
                  {
                    cap: 'Pre-Deployment Replay Sandbox',
                    legacy: 'None — test in production and hope for the best',
                    ops: 'Proves 0% ➔ 88% fix on exact historical traces',
                  },
                  {
                    cap: 'Human-in-the-Loop Escalation',
                    legacy: 'Slack notifications after execution',
                    ops: 'Preflight suspension with cryptographic sign-off',
                  },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1f1933' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#ffffff' }}>{row.cap}</td>
                    <td style={{ padding: '14px 18px', color: '#71717a' }}>{row.legacy}</td>
                    <td style={{ padding: '14px 18px', color: '#34d399', fontWeight: 600 }}>{row.ops}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. BOTTOM CALL TO ACTION (SENTRY HERO CTA) */}
        {/* ========================================================= */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.15) 0%, rgba(124, 58, 237, 0.25) 100%)',
          border: '1px solid rgba(255, 45, 120, 0.4)',
          borderRadius: '16px',
          padding: '60px 32px',
          textAlign: 'center',
          marginBottom: '64px',
        }}>
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 50px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', marginBottom: '14px' }}>
            Ready to stop silent agent failures?
          </h2>
          <p style={{ fontSize: '16px', color: '#d8b4fe', maxWidth: '620px', margin: '0 auto 32px auto', lineHeight: '1.5' }}>
            Join engineering teams protecting autonomous agent operations, preventing financial hallucinations, and verifying fixes with Replay Sandbox.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href="/home"
              style={{
                backgroundColor: '#ff2d78',
                color: '#ffffff',
                border: '1px solid #ff2d78',
                padding: '12px 30px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(255, 45, 120, 0.5)',
              }}
            >
              <span>Launch Mission Control</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/home#pipeline"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px 26px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>View ReflexFlow Graph</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FOOTER (SENTRY STYLE) */}
        {/* ========================================================= */}
        <footer style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '40px',
          textAlign: 'left',
          fontSize: '12px',
          color: '#71717a',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '28px',
            marginBottom: '40px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Shield size={16} color="#ff2d78" />
                <strong style={{ color: '#ffffff', fontSize: '14px' }}>AgentsGuard</strong>
              </div>
              <p style={{ lineHeight: '1.5' }}>
                Real-time control plane and reliability layer for agentic AI workflows and autonomous tool execution.
              </p>
            </div>

            <div>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '10px' }}>Platform</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Link href="/home#pipeline" style={{ color: '#a1a1aa', textDecoration: 'none' }}>ReflexFlow Canvas</Link>
                <Link href="/home#sandbox" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Database Simulator</Link>
                <Link href="/home#traces" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Flight Recorder</Link>
                <Link href="/home#incidents" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Failure Memory</Link>
                <Link href="/home#incidents" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Replay Sandbox</Link>
              </div>
            </div>

            <div>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '10px' }}>Gateway Checks</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span>Check A: Deterministic RBAC</span>
                <span>Check B: Heuristic Anomaly</span>
                <span>Check C: Intent Alignment</span>
                <span>Check D: Jev Risk Judgment</span>
                <span>Semantic Outcome Verifier</span>
              </div>
            </div>

            <div>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '10px' }}>Resources</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Link href="/home" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Mission Control</Link>
                <a href="https://github.com/xyflow/xyflow" target="_blank" rel="noreferrer" style={{ color: '#a1a1aa', textDecoration: 'none' }}>xyflow GitHub</a>
                <span>Docker Container Spec</span>
                <span>Agent Router Engine</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>&copy; 2026 AgentsGuard Inc. All rights reserved. Sentry-style layout adaptation.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security</span>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
