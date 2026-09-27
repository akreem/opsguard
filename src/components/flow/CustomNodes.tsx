'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Bot,
  ShieldCheck,
  Cpu,
  ShieldAlert,
  UserCheck,
  Terminal,
  CheckSquare,
  Database,
  BrainCircuit,
  RotateCcw,
  CheckCircle2,
  Lock,
  Activity,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface NodeData {
  label: string;
  category: string;
  description: string;
  statusText?: string;
  statusType?: 'active' | 'success' | 'warning' | 'danger' | 'info';
  details?: Record<string, any>;
  icon?: any;
  accentColor?: string;
  isExecuting?: boolean;
}

const BaseNode = ({ data, children, icon: Icon, color, isExecuting }: {
  data: NodeData;
  children?: React.ReactNode;
  icon: any;
  color: string;
  isExecuting?: boolean;
}) => {
  return (
    <div style={{
      background: '#18181b',
      border: isExecuting ? '2px solid #ff0072' : '1px solid #27272a',
      borderRadius: '8px',
      padding: '12px 14px',
      minWidth: '220px',
      maxWidth: '280px',
      boxShadow: isExecuting
        ? '0 0 0 1px #ff0072, 0 8px 20px rgba(255, 0, 114, 0.25)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
      position: 'relative',
      transition: 'all 0.15s ease',
    }}>
      {isExecuting && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '10px',
          background: '#ff0072',
          color: '#ffffff',
          fontSize: '9px',
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          boxShadow: '0 2px 6px rgba(255, 0, 114, 0.4)',
        }}>
          ACTIVE
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: '#222226',
          border: '1px solid #27272a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={15} color={color} />
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {data.category}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
            {data.label}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#a1a1aa', lineHeight: '1.4', marginBottom: children ? '8px' : '0' }}>
        {data.description}
      </p>

      {children}
    </div>
  );
};

export const AgentNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <BaseNode data={data} icon={Bot} color="#38bdf8" isExecuting={data.isExecuting}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '10px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '3px 6px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <Zap size={11} /> <span>Proposes tool & parameters</span>
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#38bdf8', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
AgentNode.displayName = 'AgentNode';

export const GatewayNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#ff0072', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <BaseNode data={data} icon={ShieldCheck} color="#ff0072" isExecuting={data.isExecuting}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '8px', fontSize: '9px' }}>
        <span style={{ background: '#222226', border: '1px solid #27272a', padding: '2px 5px', borderRadius: '4px', color: '#34d399' }}>✓ Check A: RBAC</span>
        <span style={{ background: '#222226', border: '1px solid #27272a', padding: '2px 5px', borderRadius: '4px', color: '#fbbf24' }}>✓ Check B: Anomaly</span>
        <span style={{ background: '#222226', border: '1px solid #27272a', padding: '2px 5px', borderRadius: '4px', color: '#38bdf8' }}>✓ Check C: Intent</span>
        <span style={{ background: '#222226', border: '1px solid #27272a', padding: '2px 5px', borderRadius: '4px', color: '#a78bfa' }}>✓ Check D: Jev Risk</span>
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#ff0072', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
GatewayNode.displayName = 'GatewayNode';

export const ArbiterNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#818cf8', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <BaseNode data={data} icon={Cpu} color="#818cf8" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#cbd5e1', background: '#222226', border: '1px solid #27272a', padding: '4px 6px', borderRadius: '4px', marginTop: '6px' }}>
        Deterministic Policy Decision Tree
      </div>
    </BaseNode>
    {/* 3 Output Handles for Branching */}
    <Handle id="allow" type="source" position={Position.Right} style={{ top: '25%', background: '#10b981', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <Handle id="review" type="source" position={Position.Right} style={{ top: '50%', background: '#f59e0b', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <Handle id="block" type="source" position={Position.Right} style={{ top: '75%', background: '#ef4444', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
ArbiterNode.displayName = 'ArbiterNode';

export const BlockNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#ef4444', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <BaseNode data={data} icon={ShieldAlert} color="#ef4444" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#f87171', fontWeight: 600, marginTop: '6px' }}>
        Interception: Prevents destructive action
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#ef4444', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
BlockNode.displayName = 'BlockNode';

export const HumanReviewNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#f59e0b', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <BaseNode data={data} icon={UserCheck} color="#f59e0b" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#fbbf24', marginTop: '6px' }}>
        Escalation Queue: Manual sign-off required
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#f59e0b', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
HumanReviewNode.displayName = 'HumanReviewNode';

export const ToolNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#10b981', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <BaseNode data={data} icon={Terminal} color="#10b981" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#34d399', marginTop: '6px' }}>
        ERP / API / Master Inventory Tool Call
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#10b981', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
ToolNode.displayName = 'ToolNode';

export const VerifierNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#34d399', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <BaseNode data={data} icon={CheckSquare} color="#34d399" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#6ee7b7', marginTop: '6px' }}>
        Deep Catch: Transport (200) vs Semantic Outcome
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#34d399', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
VerifierNode.displayName = 'VerifierNode';

export const RecorderNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#a78bfa', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <BaseNode data={data} icon={Database} color="#a78bfa" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#c4b5fd', marginTop: '6px' }}>
        Flight Trace: Immutable structured ledger
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#a78bfa', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
RecorderNode.displayName = 'RecorderNode';

export const FailureMemoryNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#ff6080', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <BaseNode data={data} icon={BrainCircuit} color="#ff6080" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#ff6080', marginTop: '6px' }}>
        Fingerprint & Blast Radius Clustering
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#ff6080', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
FailureMemoryNode.displayName = 'FailureMemoryNode';

export const ReplayNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#fbbf24', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <BaseNode data={data} icon={RotateCcw} color="#fbbf24" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#fde68a', fontWeight: 600, marginTop: '6px' }}>
        Sandbox Prover: 0/17 ➔ 15/17 (88% Fix)
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#fbbf24', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
ReplayNode.displayName = 'ReplayNode';

export const PolicyUpdateNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#10b981', width: '8px', height: '8px', border: '2px solid #18181b' }} />
    <BaseNode data={data} icon={CheckCircle2} color="#10b981" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#34d399', fontWeight: 600, marginTop: '6px' }}>
        Human Sign-off: Updates active policy loop
      </div>
    </BaseNode>
    {/* Loop-back Source Handle */}
    <Handle id="loopback" type="source" position={Position.Top} style={{ background: '#10b981', width: '8px', height: '8px', border: '2px solid #18181b' }} />
  </div>
));
PolicyUpdateNode.displayName = 'PolicyUpdateNode';

export const customNodeTypes = {
  agentNode: AgentNode,
  gatewayNode: GatewayNode,
  arbiterNode: ArbiterNode,
  blockNode: BlockNode,
  humanReviewNode: HumanReviewNode,
  toolNode: ToolNode,
  verifierNode: VerifierNode,
  recorderNode: RecorderNode,
  failureMemoryNode: FailureMemoryNode,
  replayNode: ReplayNode,
  policyUpdateNode: PolicyUpdateNode,
};
