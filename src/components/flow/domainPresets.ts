import { Node, Edge, MarkerType } from 'reactflow';

export interface DomainConfig {
  id: string;
  name: string;
  badge: string;
  color: string;
  description: string;
  scenarioHighlight: string;
  nodes: Node[];
  edges: Edge[];
}

// ----------------------------------------------------
// 1. DEFAULT HACKATHON DOMAIN: AI PROCUREMENT & STOCK REPLENISHMENT
// ----------------------------------------------------
const procurementNodes: Node[] = [
  {
    id: 'agent-1',
    type: 'agentNode',
    position: { x: 50, y: 220 },
    data: {
      label: 'Inventory Restock Agent',
      category: 'Autonomous Agent',
      description: 'Queries low-stock SKUs (Dell 24" Monitors) and drafts purchase orders.',
    },
  },
  {
    id: 'gateway-1',
    type: 'gatewayNode',
    position: { x: 380, y: 220 },
    data: {
      label: 'OpsGuard Real-time Gateway',
      category: 'Preflight Security',
      description: 'Executes 4 deterministic and AI-assisted safety checks before tool call.',
    },
  },
  {
    id: 'arbiter-1',
    type: 'arbiterNode',
    position: { x: 740, y: 220 },
    data: {
      label: 'Deterministic Policy Arbiter',
      category: 'Decision Tree',
      description: 'Evaluates RBAC pass/fail, anomaly threshold (>=0.80), and Jev risk level.',
    },
  },
  {
    id: 'block-1',
    type: 'blockNode',
    position: { x: 1080, y: 380 },
    data: {
      label: 'Security Interceptor',
      category: 'BLOCK Action',
      description: 'Intercepts unauthorized bank IBAN mutation (Check A security violation).',
    },
  },
  {
    id: 'review-1',
    type: 'humanReviewNode',
    position: { x: 1080, y: 230 },
    data: {
      label: 'Human Approval Queue',
      category: 'HUMAN_REVIEW',
      description: 'Queues high anomaly orders (500 units @ 70,000 TND with unverified vendor).',
    },
  },
  {
    id: 'tool-1',
    type: 'toolNode',
    position: { x: 1080, y: 70 },
    data: {
      label: 'ERP & Catalog Executor',
      category: 'ALLOW Action',
      description: 'Executes create_purchase_order, supplier_search, or inventory_lookup.',
    },
  },
  {
    id: 'verifier-1',
    type: 'verifierNode',
    position: { x: 1420, y: 70 },
    data: {
      label: 'Postflight Semantic Verifier',
      category: 'Outcome Verification',
      description: 'Catches silent semantic drops (HTTP 200 returned but order_id is null).',
    },
  },
  {
    id: 'recorder-1',
    type: 'recorderNode',
    position: { x: 1420, y: 230 },
    data: {
      label: 'Flight Recorder Trace Ledger',
      category: 'Immutable Telemetry',
      description: 'Records full trace with 4-check telemetry, latency, and failure family.',
    },
  },
  {
    id: 'failure-1',
    type: 'failureMemoryNode',
    position: { x: 1420, y: 390 },
    data: {
      label: 'Failure Memory & Blast Radius',
      category: 'Recurring Clusters',
      description: 'Clusters 17 supplier alias failures (47,830 TND capital & 132 units at risk).',
    },
  },
  {
    id: 'replay-1',
    type: 'replayNode',
    position: { x: 1080, y: 540 },
    data: {
      label: 'Replay Lab Sandbox Prover',
      category: 'Signature Sandbox',
      description: 'Proves canonical alias patch recovers 15/17 historical failures (88% reduction).',
    },
  },
  {
    id: 'policy-1',
    type: 'policyUpdateNode',
    position: { x: 380, y: 540 },
    data: {
      label: 'Human Audited Policy Update',
      category: 'Loop-Back Deployment',
      description: 'Operator approves fix; updates active normalization policy in gateway.',
    },
  },
];

const procurementEdges: Edge[] = [
  {
    id: 'e-agent-gateway',
    source: 'agent-1',
    target: 'gateway-1',
    animated: true,
    style: { stroke: '#38bdf8', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
  },
  {
    id: 'e-gateway-arbiter',
    source: 'gateway-1',
    target: 'arbiter-1',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
  },
  {
    id: 'e-arbiter-tool',
    source: 'arbiter-1',
    sourceHandle: 'allow',
    target: 'tool-1',
    animated: true,
    label: 'ALLOW',
    labelStyle: { fill: '#34d399', fontWeight: 800, fontSize: '10px' },
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  {
    id: 'e-arbiter-review',
    source: 'arbiter-1',
    sourceHandle: 'review',
    target: 'review-1',
    animated: true,
    label: 'HUMAN_REVIEW',
    labelStyle: { fill: '#fbbf24', fontWeight: 800, fontSize: '10px' },
    style: { stroke: '#f59e0b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
  },
  {
    id: 'e-arbiter-block',
    source: 'arbiter-1',
    sourceHandle: 'block',
    target: 'block-1',
    animated: true,
    label: 'BLOCK',
    labelStyle: { fill: '#f87171', fontWeight: 800, fontSize: '10px' },
    style: { stroke: '#f43f5e', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' },
  },
  {
    id: 'e-tool-verifier',
    source: 'tool-1',
    target: 'verifier-1',
    animated: true,
    style: { stroke: '#34d399', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#34d399' },
  },
  {
    id: 'e-verifier-recorder',
    source: 'verifier-1',
    target: 'recorder-1',
    animated: true,
    style: { stroke: '#a78bfa', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a78bfa' },
  },
  {
    id: 'e-review-recorder',
    source: 'review-1',
    target: 'recorder-1',
    style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '4,4' },
  },
  {
    id: 'e-block-recorder',
    source: 'block-1',
    target: 'recorder-1',
    style: { stroke: '#f43f5e', strokeWidth: 1.5, strokeDasharray: '4,4' },
  },
  {
    id: 'e-recorder-failure',
    source: 'recorder-1',
    target: 'failure-1',
    animated: true,
    style: { stroke: '#f472b6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f472b6' },
  },
  {
    id: 'e-failure-replay',
    source: 'failure-1',
    target: 'replay-1',
    animated: true,
    style: { stroke: '#fbbf24', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#fbbf24' },
  },
  {
    id: 'e-replay-policy',
    source: 'replay-1',
    target: 'policy-1',
    animated: true,
    label: 'Operator Sign-off',
    labelStyle: { fill: '#10b981', fontWeight: 800, fontSize: '10px' },
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  {
    id: 'e-policy-loopback',
    source: 'policy-1',
    sourceHandle: 'loopback',
    target: 'gateway-1',
    animated: true,
    label: 'Updated Policy Loop (Active)',
    labelStyle: { fill: '#38bdf8', fontWeight: 800, fontSize: '10px' },
    style: { stroke: '#38bdf8', strokeWidth: 2.5, strokeDasharray: '6,6' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
  },
];

// ----------------------------------------------------
// 2. FINANCIAL LEDGER & WIRE TRANSFER GUARD DOMAIN
// ----------------------------------------------------
const financeNodes: Node[] = [
  {
    id: 'agent-1',
    type: 'agentNode',
    position: { x: 50, y: 220 },
    data: {
      label: 'Treasury & Accounts Agent',
      category: 'Financial Agent',
      description: 'Processes vendor invoice payouts and initiates electronic wire transfers.',
    },
  },
  {
    id: 'gateway-1',
    type: 'gatewayNode',
    position: { x: 380, y: 220 },
    data: {
      label: 'Financial Policy Gateway',
      category: 'KYC & Spend Control',
      description: 'Checks dual-authorization rules, unverified IBAN heuristics, and anti-fraud intent.',
    },
  },
  {
    id: 'arbiter-1',
    type: 'arbiterNode',
    position: { x: 740, y: 220 },
    data: {
      label: 'Compliance Policy Arbiter',
      category: 'Deterministic Filter',
      description: 'Routes payments: under threshold -> ALLOW, >50k TND -> CFO Review, modified IBAN -> BLOCK.',
    },
  },
  {
    id: 'block-1',
    type: 'blockNode',
    position: { x: 1080, y: 380 },
    data: {
      label: 'Wire Hijack Interceptor',
      category: 'CRITICAL BLOCK',
      description: 'Blocks unauthorized SWIFT credential mutation or offshore account redirect.',
    },
  },
  {
    id: 'review-1',
    type: 'humanReviewNode',
    position: { x: 1080, y: 230 },
    data: {
      label: 'CFO Dual-Signoff Queue',
      category: 'Escalated Review',
      description: 'Requires finance director approval for abnormal vendor disbursement transactions.',
    },
  },
  {
    id: 'tool-1',
    type: 'toolNode',
    position: { x: 1080, y: 70 },
    data: {
      label: 'Banking Gateway API',
      category: 'Disbursement Tool',
      description: 'Executes verified wire transfer through corporate banking connector.',
    },
  },
  {
    id: 'verifier-1',
    type: 'verifierNode',
    position: { x: 1420, y: 70 },
    data: {
      label: 'Ledger Postflight Verifier',
      category: 'Reconciliation',
      description: 'Verifies double-entry ledger settlement reference before closing payout ticket.',
    },
  },
  {
    id: 'recorder-1',
    type: 'recorderNode',
    position: { x: 1420, y: 230 },
    data: {
      label: 'Immutable Audit Trail',
      category: 'SOX Compliance',
      description: 'Stores cryptographically verifiable ledger trace for financial auditing.',
    },
  },
  {
    id: 'failure-1',
    type: 'failureMemoryNode',
    position: { x: 1420, y: 390 },
    data: {
      label: 'Fraud & Latency Clusters',
      category: 'Risk Patterns',
      description: 'Clusters repeated banking gateway timeout drops & invalid BIC codes.',
    },
  },
  {
    id: 'replay-1',
    type: 'replayNode',
    position: { x: 1080, y: 540 },
    data: {
      label: 'Idempotency Replay Sandbox',
      category: 'Sandbox Prover',
      description: 'Proves secondary idempotent retry eliminates double-charge risks.',
    },
  },
  {
    id: 'policy-1',
    type: 'policyUpdateNode',
    position: { x: 380, y: 540 },
    data: {
      label: 'Compliance Patch Sign-off',
      category: 'Policy Loop',
      description: 'Head of Compliance approves updated wire routing policy.',
    },
  },
];

// ----------------------------------------------------
// 3. HEALTHCARE & CLINICAL PRESCRIPTION DISPENSER DOMAIN
// ----------------------------------------------------
const healthcareNodes: Node[] = [
  {
    id: 'agent-1',
    type: 'agentNode',
    position: { x: 50, y: 220 },
    data: {
      label: 'Clinical Dispenser Agent',
      category: 'Medical Assistant',
      description: 'Interprets doctor consultation notes and generates medication orders.',
    },
  },
  {
    id: 'gateway-1',
    type: 'gatewayNode',
    position: { x: 380, y: 220 },
    data: {
      label: 'Clinical Safety Gateway',
      category: 'Drug Interaction & Safety',
      description: 'Checks patient allergies, maximum daily dosage heuristics, and drug conflicts.',
    },
  },
  {
    id: 'arbiter-1',
    type: 'arbiterNode',
    position: { x: 740, y: 220 },
    data: {
      label: 'Medical Policy Arbiter',
      category: 'Dosage Decision Tree',
      description: 'Standard OTC -> ALLOW, Controlled substance -> Pharmacist Review, Contraindication -> BLOCK.',
    },
  },
  {
    id: 'block-1',
    type: 'blockNode',
    position: { x: 1080, y: 380 },
    data: {
      label: 'Contraindication Guard',
      category: 'FATAL BLOCK',
      description: 'Prevents dispensing lethal cross-interaction drug combinations.',
    },
  },
  {
    id: 'review-1',
    type: 'humanReviewNode',
    position: { x: 1080, y: 230 },
    data: {
      label: 'Chief Pharmacist Queue',
      category: 'Clinical Sign-off',
      description: 'Escalates high-dosage antibiotic or narcotic orders for manual physician check.',
    },
  },
  {
    id: 'tool-1',
    type: 'toolNode',
    position: { x: 1080, y: 70 },
    data: {
      label: 'Pharmacy Dispenser Robot',
      category: 'Hardware Tool',
      description: 'Actuates automated hospital medication carousel and prints barcode labels.',
    },
  },
  {
    id: 'verifier-1',
    type: 'verifierNode',
    position: { x: 1420, y: 70 },
    data: {
      label: 'Barcode Verification Scan',
      category: 'Physical Outcome Check',
      description: 'Verifies optical barcode matches prescribed NDC identifier exactly.',
    },
  },
  {
    id: 'recorder-1',
    type: 'recorderNode',
    position: { x: 1420, y: 230 },
    data: {
      label: 'HIPAA Medical Trace Log',
      category: 'Clinical Record',
      description: 'Stores immutable patient dosage history and doctor prescription trace.',
    },
  },
  {
    id: 'failure-1',
    type: 'failureMemoryNode',
    position: { x: 1420, y: 390 },
    data: {
      label: 'Diagnostic Drift Memory',
      category: 'Clinical Incident Index',
      description: 'Clusters repeated generic brand translation mismatches across hospital wards.',
    },
  },
  {
    id: 'replay-1',
    type: 'replayNode',
    position: { x: 1080, y: 540 },
    data: {
      label: 'Pharmacopeia Replay Sandbox',
      category: 'Medical Sandbox',
      description: 'Tests updated generic drug mapping against historical prescription errors.',
    },
  },
  {
    id: 'policy-1',
    type: 'policyUpdateNode',
    position: { x: 380, y: 540 },
    data: {
      label: 'Hospital Board Sign-off',
      category: 'Clinical Governance',
      description: 'Pharmacy Director approves verified drug substitution policy.',
    },
  },
];

export const DOMAIN_PRESETS: Record<string, DomainConfig> = {
  procurement: {
    id: 'procurement',
    name: 'AI Procurement & Stock Replenishment',
    badge: 'DEFAULT HACKATHON WORKFLOW',
    color: '#38bdf8',
    description: 'Guards autonomous replenishment for Dell monitors, ERP purchase orders, and supplier alias drift with 47,830 TND blast radius.',
    scenarioHighlight: '30 Seeded Requests • 17 Historical Failures • 88% Replay Recovery',
    nodes: procurementNodes,
    edges: procurementEdges,
  },
  finance: {
    id: 'finance',
    name: 'Financial Ledger & Wire Transfer Guard',
    badge: 'TREASURY COMPLIANCE',
    color: '#a855f7',
    description: 'Guards invoice disbursements, protects against prompt-injected SWIFT IBAN redirection, and enforces dual CFO approval.',
    scenarioHighlight: 'Fraud Detection • Anti-Wire Hijack • SOX Audited Ledger',
    nodes: financeNodes,
    edges: procurementEdges, // Reuses matching edge flow layout
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Clinical Drug Dispenser',
    badge: 'CLINICAL SAFETY',
    color: '#10b981',
    description: 'Protects hospital drug dispensing robots from lethal contraindications, dosage errors, and unverified generic brand mappings.',
    scenarioHighlight: 'Allergy Shield • Double-Signoff Queue • Pharmacopeia Replay',
    nodes: healthcareNodes,
    edges: procurementEdges,
  },
};
