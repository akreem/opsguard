'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';

interface ReflexFlowCanvasProps {
  initialFullscreen?: boolean;
}

export function ReflexFlowCanvas({ initialFullscreen = false }: ReflexFlowCanvasProps) {
  const [currentDomain, setCurrentDomain] = useState<string>('procurement');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);

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

  // Listen to Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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
    <div
      className={isFullscreen ? '' : 'cyber-panel'}
      style={
        isFullscreen
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              width: '100vw',
              height: '100vh',
              background: '#111111',
              display: 'flex',
              flexDirection: 'column',
            }
          : {
              padding: '0',
              overflow: 'hidden',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 200px)',
              minHeight: '740px',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
            }
      }
    >
      {/* Top Workflow Editor Header - React Flow Pro Style */}
      <div style={{
        background: '#18181b',
        borderBottom: '1px solid #27272a',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0,
      }}>
        {/* Domain Title & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #ff0072, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Layers size={17} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                ReflexLoop™ Workflow Automation Canvas
              </h3>
              <span className="badge-pink" style={{ fontSize: '9px' }}>
                React Flow Pro
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#71717a' }}>
              Interactive node graph • Pan, drag, inspect & customize pipelines by customer domain
            </p>
          </div>
        </div>

        {/* Domain Selector Tabs & Fullscreen Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', marginRight: '4px' }}>
            Domain Preset:
          </span>
          {Object.values(DOMAIN_PRESETS).map(dom => {
            const isActive = currentDomain === dom.id;
            return (
              <button
                key={dom.id}
                onClick={() => handleDomainChange(dom.id)}
                style={{
                  background: isActive ? '#27272a' : '#18181b',
                  color: isActive ? '#ffffff' : '#a1a1aa',
                  border: isActive ? '1px solid #ff0072' : '1px solid #27272a',
                  padding: '5px 11px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 1px 4px rgba(255, 0, 114, 0.2)' : 'none',
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
            <Play size={12} />
            <span>{isSimulating ? 'Tracing ReflexLoop...' : 'Simulate Loop Execution'}</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              background: isFullscreen ? 'rgba(255, 0, 114, 0.15)' : '#18181b',
              border: isFullscreen ? '1px solid #ff0072' : '1px solid #27272a',
              color: isFullscreen ? '#ff6080' : '#a1a1aa',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '4px',
              transition: 'all 0.15s ease',
            }}
            title={isFullscreen ? 'Exit Full Screen (ESC)' : 'Open Full Screen Workspace'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
          </button>
        </div>
      </div>

      {/* Domain Summary Bar */}
      <div style={{
        background: '#141416',
        borderBottom: '1px solid #27272a',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#a1a1aa',
        flexWrap: 'wrap',
        gap: '8px',
        flexShrink: 0,
      }}>
        <div>
          <strong style={{ color: domainConfig.color }}>{domainConfig.name}:</strong> {domainConfig.description}
        </div>
        <div style={{ color: '#ff6080', fontWeight: 600 }}>
          {domainConfig.scenarioHighlight}
        </div>
      </div>

      {/* React Flow Canvas - Clean React Flow Dark Dot Grid */}
      <div style={{ flex: 1, width: '100%', position: 'relative', background: '#111111', minHeight: '550px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={customNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background color="#27272a" gap={20} size={1} />
          <Controls style={{ background: '#18181b', border: '1px solid #27272a', fill: '#a1a1aa', borderRadius: '8px' }} />
          <MiniMap
            nodeColor={n => {
              if (n.type === 'agentNode') return '#38bdf8';
              if (n.type === 'gatewayNode') return '#ff0072';
              if (n.type === 'arbiterNode') return '#818cf8';
              if (n.type === 'blockNode') return '#ef4444';
              if (n.type === 'humanReviewNode') return '#f59e0b';
              if (n.type === 'toolNode') return '#10b981';
              if (n.type === 'verifierNode') return '#34d399';
              if (n.type === 'recorderNode') return '#a78bfa';
              if (n.type === 'failureMemoryNode') return '#ff6080';
              if (n.type === 'replayNode') return '#fbbf24';
              return '#10b981';
            }}
            style={{ background: '#141416', border: '1px solid #27272a', borderRadius: '8px' }}
          />
        </ReactFlow>

        {/* Selected Node Property Drawer Overlay */}
        {selectedNode && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '320px',
            background: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            zIndex: 10,
            animation: 'fadeIn 0.15s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="badge-pink" style={{ fontSize: '10px' }}>
                {selectedNode.data.category || 'PIPELINE STAGE'}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '15px' }}
              >
                ✕
              </button>
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
              {selectedNode.data.label}
            </h4>
            <p style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: '1.45', marginBottom: '12px' }}>
              {selectedNode.data.description}
            </p>
            <div style={{
              fontSize: '11px',
              color: '#f4f4f5',
              background: '#222226',
              border: '1px solid #27272a',
              padding: '8px 10px',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div><strong style={{ color: '#a1a1aa' }}>Node ID:</strong> <code style={{ color: '#ff6080' }}>{selectedNode.id}</code></div>
              <div><strong style={{ color: '#a1a1aa' }}>State:</strong> <span style={{ color: '#34d399', fontWeight: 600 }}>ACTIVE_ISOLATED</span></div>
              <div><strong style={{ color: '#a1a1aa' }}>Latency Budget:</strong> &lt; 250ms</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
