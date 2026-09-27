'use client';

import React from 'react';
import {
  Shield,
  RefreshCw,
  Play,
  BookOpen,
  Layers,
  Bot,
  Database,
  AlertTriangle,
  UserCheck,
  Activity,
  Cpu,
} from 'lucide-react';
import { SystemStatus } from '@/lib/types';

export type DashboardNavTab = 'pipeline' | 'sandbox' | 'traces' | 'incidents' | 'approvals' | 'health';

interface HeaderProps {
  systemStatus: SystemStatus | null;
  activeTab: DashboardNavTab;
  onTabChange: (tab: DashboardNavTab) => void;
  pendingApprovalsCount: number;
  openIncidentsCount: number;
  tracesCount: number;
  onReset: () => void;
  onRunBatch: () => void;
  onOpenDocs: () => void;
  isRunningBatch: boolean;
}

export function Header({
  systemStatus,
  activeTab,
  onTabChange,
  pendingApprovalsCount,
  openIncidentsCount,
  tracesCount,
  onReset,
  onRunBatch,
  onOpenDocs,
  isRunningBatch,
}: HeaderProps) {
  const navItems: { id: DashboardNavTab; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { id: 'pipeline', label: 'ReflexFlow Canvas', icon: Layers },
    { id: 'sandbox', label: 'Agent & DB Sandbox', icon: Bot, badge: 'LIVE', badgeColor: '#34d399' },
    { id: 'traces', label: 'Flight Recorder', icon: Database, badge: tracesCount },
    { id: 'incidents', label: 'Incident Memory', icon: AlertTriangle, badge: openIncidentsCount, badgeColor: '#f472b6' },
    { id: 'approvals', label: 'Human Approvals', icon: UserCheck, badge: pendingApprovalsCount, badgeColor: '#f59e0b' },
    { id: 'health', label: 'Reliability Health', icon: Activity },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(3, 7, 18, 0.92)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      {/* Top Main Row */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        {/* Logo and Futuristic Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
          }}>
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px', color: '#ffffff' }}>
                OpsGuard
              </span>
              <span style={{
                background: 'linear-gradient(90deg, #38bdf8, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '2px 7px',
                borderRadius: '5px',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.15)',
              }}>
                ReflexLoop™
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Real-time control & reliability layer for agentic AI
            </p>
          </div>
        </div>

        {/* Live System Status HUD Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            fontSize: '11px',
          }}>
            <span className="pulse-dot pulse-green" />
            <span style={{ color: 'var(--text-muted)' }}>Gateway:</span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>ACTIVE</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            fontSize: '11px',
          }}>
            <span className="pulse-dot pulse-blue" />
            <span style={{ color: 'var(--text-muted)' }}>AI Provider:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>AGENT ROUTER</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
          }}>
            <span className="pulse-dot pulse-amber" />
            <span style={{ color: 'var(--text-muted)' }}>Replay Sandbox:</span>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>DOCKER ISOLATED</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenDocs}
            className="btn-neon-ghost"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            title="View API schemas and endpoints for frontend integration"
          >
            <BookOpen size={13} color="#38bdf8" />
            <span>API Specs</span>
          </button>

          <button
            onClick={onReset}
            className="btn-neon-ghost"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            title="Reset database to 30 seeded operations"
          >
            <RefreshCw size={13} />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={onRunBatch}
            disabled={isRunningBatch}
            className="btn-neon-primary"
            style={{ padding: '6px 14px', fontSize: '12px', opacity: isRunningBatch ? 0.7 : 1 }}
          >
            <Play size={13} />
            <span>{isRunningBatch ? 'Processing...' : 'Run All (30 Orders)'}</span>
          </button>
        </div>
      </div>

      {/* Secondary Primary Navigation Bar (Uncrowded Tabs) */}
      <div style={{
        background: 'rgba(10, 15, 29, 0.95)',
        borderTop: '1px solid rgba(56, 189, 248, 0.15)',
        padding: '0 28px',
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflowX: 'auto',
        }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-dim)',
                  padding: '12px 16px',
                  fontSize: '12px',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={isActive ? '#38bdf8' : 'var(--text-muted)'} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      background: item.badgeColor ? `${item.badgeColor}25` : 'rgba(56, 189, 248, 0.2)',
                      color: item.badgeColor || '#38bdf8',
                      border: `1px solid ${item.badgeColor || 'rgba(56, 189, 248, 0.4)'}`,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
