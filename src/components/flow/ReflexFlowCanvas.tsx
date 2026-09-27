'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { customNodeTypes } from './CustomNodes';
import { DOMAIN_PRESETS, DomainConfig } from './domainPresets';
import {
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
  ChevronRight,
  Shield,
  Zap,
  Info,
} from 'lucide-react';

export function ReflexFlowCanvas() {
  const [currentDomain, setCurrentDomain] = useState<string>('procurement');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const domainConfig: DomainConfig = DOMAIN_PRESETS[currentDomain] || DOMAIN_PRESETS.procurement;

  const [nodes, setNodes, onNodesChange] = useNodesState(domainConfig.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(domainConfig.edges);

  // Switch domain preset
  const handleDomainChange = (domainKey: string) => {
    setCurrentDomain(domainKey);
    const newConfig = DOMAIN_PRESETS[domainKey];
    if (newConfig) {
      setNodes(newConfig.nodes);
      setEdges(newConfig.edges);
      setSelectedNode(null);
    }
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Step-by-step Live Highway Simulation
  const handleRunSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    const simulationSteps = [
      'agent-1',
      'gateway-1',
      'arbiter-1',
      'tool-1',
      'verifier-1',
      'recorder-1',
      'failure-1',
      'replay-1',
      'policy-1',
      'gateway-1', // closes the loop!
    ];

    for (let i = 0; i < simulationSteps.length; i++) {
      setActiveStepIndex(i);
      const activeNodeId = simulationSteps[i];

      setNodes(nds =>
        nds.map(n => ({
          ...n,
          data: {
            ...n.data,
            isExecuting: n.id === activeNodeId,
          },
        }))
      );

      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Reset executing state
    setNodes(nds =>
      nds.map(n => ({
        ...n,
        data: {
          ...n.data,
          isExecuting: false,
        },
      }))
    );

    setActiveStepIndex(null);
    setIsSimulating(false);
  };

  return (
    <div className="cyber-panel" style={{ padding: '0', overflow: 'hidden', marginBottom: '32px' }}>
      {/* Top Workflow Editor Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Domain Title & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.35)',
          }}>
            <Layers size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                ReflexLoop™ Workflow Automation Canvas
              </h3>
              <span className="badge-neon badge-cyan" style={{ fontSize: '9px' }}>
                n8n / Hivvy Flow Style
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Interactive node graph • Pan, drag, inspect & customize pipelines by customer domain
            </p>
          </div>
        </div>

        {/* Domain Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
            Domain Preset:
          </span>
          {Object.values(DOMAIN_PRESETS).map(dom => {
            const isActive = currentDomain === dom.id;
            return (
              <button
                key={dom.id}
                onClick={() => handleDomainChange(dom.id)}
                style={{
                  background: isActive ? `${dom.color}25` : 'rgba(30, 41, 59, 0.6)',
                  color: isActive ? dom.color : 'var(--text-dim)',
                  border: isActive ? `1px solid ${dom.color}` : '1px solid var(--border-subtle)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? `0 0 12px ${dom.color}30` : 'none',
                }}
              >
                {dom.name.split(' ')[0]} {dom.name.split(' ')[1]}
              </button>
            );
          })}

          {/* Simulate Live Particle Flow Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="btn-neon-primary"
            style={{ padding: '6px 14px', fontSize: '11px', marginLeft: '6px' }}
          >
            <Play size={13} />
            <span>{isSimulating ? 'Tracing ReflexLoop...' : 'Simulate Loop Execution'}</span>
          </button>
        </div>
      </div>

      {/* Domain Summary Bar */}
      <div style={{
        background: 'rgba(3, 7, 18, 0.6)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--text-dim)',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div>
          <strong style={{ color: domainConfig.color }}>{domainConfig.name}:</strong> {domainConfig.description}
        </div>
        <div style={{ color: '#38bdf8', fontWeight: 600 }}>
          {domainConfig.scenarioHighlight}
        </div>
      </div>

      {/* React Flow Canvas - Enlarged Expansive Workspace */}
      <div style={{ height: '680px', width: '100%', position: 'relative', background: '#050811' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={customNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.25}
          maxZoom={1.6}
        >
          <Background color="#1e293b" gap={24} size={1.2} />
          <Controls style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', fill: '#94a3b8', borderRadius: '8px' }} />
          <MiniMap
            nodeColor={n => {
              if (n.type === 'agentNode') return '#38bdf8';
              if (n.type === 'gatewayNode') return '#06b6d4';
              if (n.type === 'arbiterNode') return '#818cf8';
              if (n.type === 'blockNode') return '#f43f5e';
              if (n.type === 'humanReviewNode') return '#f59e0b';
              if (n.type === 'toolNode') return '#10b981';
              if (n.type === 'verifierNode') return '#34d399';
              if (n.type === 'recorderNode') return '#a78bfa';
              if (n.type === 'failureMemoryNode') return '#f472b6';
              if (n.type === 'replayNode') return '#fbbf24';
              return '#10b981';
            }}
            style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}
          />
        </ReactFlow>

        {/* Selected Node Property Drawer Overlay */}
        {selectedNode && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '320px',
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '12px',
            padding: '18px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(16px)',
            zIndex: 10,
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="badge-neon badge-cyan" style={{ fontSize: '10px' }}>
                {selectedNode.data.category || 'PIPELINE STAGE'}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '15px' }}
              >
                ✕
              </button>
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
              {selectedNode.data.label}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.45', marginBottom: '12px' }}>
              {selectedNode.data.description}
            </p>
            <div style={{
              fontSize: '11px',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '8px 10px',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div><strong>Node ID:</strong> <code>{selectedNode.id}</code></div>
              <div><strong>State:</strong> <span style={{ color: '#34d399', fontWeight: 700 }}>ACTIVE_ISOLATED</span></div>
              <div><strong>Latency Budget:</strong> &lt; 250ms</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
