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
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      border: isExecuting ? `2px solid ${color}` : `1px solid rgba(51, 65, 85, 0.8)`,
      borderRadius: '12px',
      padding: '14px 16px',
      minWidth: '220px',
      maxWidth: '280px',
      boxShadow: isExecuting ? `0 0 30px ${color}40` : '0 8px 30px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      transition: 'all 0.2s ease',
    }}>
      {isExecuting && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '12px',
          background: color,
          color: '#030712',
          fontSize: '9px',
          fontWeight: 800,
          padding: '1px 6px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          boxShadow: `0 0 10px ${color}`,
        }}>
          ACTIVE
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `${color}20`,
          border: `1px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} color={color} />
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            {data.category}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
            {data.label}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4', marginBottom: children ? '8px' : '0' }}>
        {data.description}
      </p>

      {children}
    </div>
  );
};

export const AgentNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <BaseNode data={data} icon={Bot} color="#38bdf8" isExecuting={data.isExecuting}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '10px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '3px 6px', borderRadius: '4px' }}>
        <Zap size={11} /> <span>Proposes tool & parameters</span>
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#38bdf8', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
  </div>
));
AgentNode.displayName = 'AgentNode';

export const GatewayNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#06b6d4', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <BaseNode data={data} icon={ShieldCheck} color="#06b6d4" isExecuting={data.isExecuting}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '8px', fontSize: '9px' }}>
        <span style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '2px 5px', borderRadius: '4px', color: '#34d399' }}>✓ Check A: RBAC</span>
        <span style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '2px 5px', borderRadius: '4px', color: '#fbbf24' }}>✓ Check B: Anomaly</span>
        <span style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '2px 5px', borderRadius: '4px', color: '#38bdf8' }}>✓ Check C: Intent</span>
        <span style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '2px 5px', borderRadius: '4px', color: '#a78bfa' }}>✓ Check D: Jev Risk</span>
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#06b6d4', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
  </div>
));
GatewayNode.displayName = 'GatewayNode';

export const ArbiterNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#818cf8', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <BaseNode data={data} icon={Cpu} color="#818cf8" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#cbd5e1', background: 'rgba(30, 41, 59, 0.6)', padding: '4px 6px', borderRadius: '4px', marginTop: '6px' }}>
        Deterministic Policy Decision Tree
      </div>
    </BaseNode>
    {/* 3 Output Handles for Branching */}
    <Handle id="allow" type="source" position={Position.Right} style={{ top: '25%', background: '#10b981', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <Handle id="review" type="source" position={Position.Right} style={{ top: '50%', background: '#f59e0b', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <Handle id="block" type="source" position={Position.Right} style={{ top: '75%', background: '#f43f5e', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
  </div>
));
ArbiterNode.displayName = 'ArbiterNode';

export const BlockNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#f43f5e', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <BaseNode data={data} icon={ShieldAlert} color="#f43f5e" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#f87171', fontWeight: 700, marginTop: '6px' }}>
        Interception: Prevents destructive action
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#f43f5e', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
  </div>
));
BlockNode.displayName = 'BlockNode';

export const HumanReviewNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#f59e0b', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <BaseNode data={data} icon={UserCheck} color="#f59e0b" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#fbbf24', marginTop: '6px' }}>
        Escalation Queue: Manual sign-off required
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#f59e0b', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
  </div>
));
HumanReviewNode.displayName = 'HumanReviewNode';

export const ToolNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#10b981', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <BaseNode data={data} icon={Terminal} color="#10b981" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#34d399', marginTop: '6px' }}>
        ERP / API / Master Inventory Tool Call
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#10b981', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
  </div>
));
ToolNode.displayName = 'ToolNode';

export const VerifierNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#34d399', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <BaseNode data={data} icon={CheckSquare} color="#34d399" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#6ee7b7', marginTop: '6px' }}>
        Deep Catch: Transport (200) vs Semantic Outcome
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#34d399', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
  </div>
));
VerifierNode.displayName = 'VerifierNode';

export const RecorderNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#a78bfa', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <BaseNode data={data} icon={Database} color="#a78bfa" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#c4b5fd', marginTop: '6px' }}>
        Flight Trace: Immutable structured ledger
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#a78bfa', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
  </div>
));
RecorderNode.displayName = 'RecorderNode';

export const FailureMemoryNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#f472b6', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <BaseNode data={data} icon={BrainCircuit} color="#f472b6" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#f472b6', marginTop: '6px' }}>
        Fingerprint & Blast Radius Clustering
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#f472b6', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
  </div>
));
FailureMemoryNode.displayName = 'FailureMemoryNode';

export const ReplayNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#fbbf24', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <BaseNode data={data} icon={RotateCcw} color="#fbbf24" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#fde68a', fontWeight: 700, marginTop: '6px' }}>
        Sandbox Prover: 0/17 $\rightarrow$ 15/17 (88% Fix)
      </div>
    </BaseNode>
    <Handle type="source" position={Position.Right} style={{ background: '#fbbf24', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
  </div>
));
ReplayNode.displayName = 'ReplayNode';

export const PolicyUpdateNode = memo(({ data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#10b981', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
    <BaseNode data={data} icon={CheckCircle2} color="#10b981" isExecuting={data.isExecuting}>
      <div style={{ fontSize: '10px', color: '#34d399', fontWeight: 700, marginTop: '6px' }}>
        Human Sign-off: Updates active policy loop
      </div>
    </BaseNode>
    {/* Loop-back Source Handle */}
    <Handle id="loopback" type="source" position={Position.Top} style={{ background: '#10b981', width: '10px', height: '10px', border: '2px solid #0f172a' }} />
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
