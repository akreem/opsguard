'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  Sparkles,
  User as UserIcon,
  LogOut,
  MessageSquare,
  ChevronDown,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { SystemStatus } from '@/lib/types';

export type DashboardNavTab = 'pipeline' | 'whatsapp' | 'sandbox' | 'traces' | 'incidents' | 'approvals' | 'health';

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
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setShowProfileModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('opsguard_user') : null;
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (e) {}
    }

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('opsguard_user', JSON.stringify(data.user));
          }
        } else {
          setCurrentUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('opsguard_user');
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('opsguard_user');
    }
    window.location.href = '/login';
  };
  const navItems: { id: DashboardNavTab; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { id: 'pipeline', label: 'ReflexFlow Canvas', icon: Layers },
    { id: 'whatsapp', label: 'Live WhatsApp Ops', icon: MessageSquare, badge: 'STREAM', badgeColor: '#00a884' },
    { id: 'sandbox', label: 'Agent & DB Sandbox', icon: Bot, badge: 'LIVE', badgeColor: '#34d399' },
    { id: 'traces', label: 'Flight Recorder', icon: Database, badge: tracesCount },
    { id: 'incidents', label: 'Incident Memory', icon: AlertTriangle, badge: openIncidentsCount, badgeColor: '#ff6080' },
    { id: 'approvals', label: 'Human Approvals', icon: UserCheck, badge: pendingApprovalsCount, badgeColor: '#fbbf24' },
    { id: 'health', label: 'Reliability Health', icon: Activity },
  ];

  return (
    <header style={{
      borderBottom: '1px solid #27272a',
      background: 'rgba(17, 17, 17, 0.92)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
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
        {/* Logo and React Flow Style Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #ff0072 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(255, 0, 114, 0.35)',
          }}>
            <Shield size={19} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff' }}>
                AgentsGuard
              </span>
              <span style={{
                background: 'rgba(255, 0, 114, 0.1)',
                color: '#ff6080',
                border: '1px solid rgba(255, 0, 114, 0.3)',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: '6px',
              }}>
                ReflexLoop™
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#71717a' }}>
              Real-time control & reliability layer for agentic AI
            </p>
          </div>
        </div>

        {/* Right Up Corner Container: Live Status HUD + User Circle & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Live System Status HUD Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#18181b',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #27272a',
              fontSize: '11px',
            }}>
              <span className="pulse-dot pulse-green" />
              <span style={{ color: '#71717a' }}>Gateway:</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>ACTIVE</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#18181b',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #27272a',
              fontSize: '11px',
            }}>
              <span className="pulse-dot pulse-blue" />
              <span style={{ color: '#71717a' }}>AI Provider:</span>
              <span style={{ color: '#ff6080', fontWeight: 600 }}>AGENT ROUTER</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#18181b',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #27272a',
              fontSize: '11px',
            }}>
              <span className="pulse-dot pulse-amber" />
              <span style={{ color: '#71717a' }}>Replay Sandbox:</span>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>DOCKER ISOLATED</span>
            </div>
          </div>

          {/* User Profile in Right Up Corner with Dropdown */}
          {currentUser ? (
            <div ref={dropdownRef} style={{ position: 'relative', paddingLeft: '14px', borderLeft: '1px solid #27272a' }}>
              {/* Clickable Name, Role Badge, Circle Avatar, and Chevron */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(prev => !prev)}
                title="Account menu"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isDropdownOpen ? 'rgba(255, 0, 114, 0.08)' : 'rgba(24, 24, 27, 0.7)',
                  border: `1px solid ${isDropdownOpen ? '#ff0072' : '#27272a'}`,
                  borderRadius: '24px',
                  padding: '4px 8px 4px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                }}
                onMouseEnter={e => {
                  if (!isDropdownOpen) {
                    e.currentTarget.style.borderColor = '#3f3f46';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isDropdownOpen) {
                    e.currentTarget.style.borderColor = '#27272a';
                    e.currentTarget.style.background = 'rgba(24, 24, 27, 0.7)';
                  }
                }}
              >
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700, letterSpacing: '-0.2px' }}>
                  {currentUser.name}
                </span>
                <span style={{
                  fontSize: '9px',
                  color: '#ff6080',
                  background: 'rgba(255, 0, 114, 0.12)',
                  border: '1px solid rgba(255, 0, 114, 0.35)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}>
                  {currentUser.role}
                </span>

                {/* User Circle */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff0072 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(255, 0, 114, 0.35)',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                  flexShrink: 0,
                }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <ChevronDown size={13} color="#a1a1aa" style={{
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                }} />
              </button>

              {/* Dropdown Menu Popup */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '250px',
                  background: '#121118',
                  border: '1px solid #27272a',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(255, 0, 114, 0.1)',
                  backdropFilter: 'blur(20px)',
                  zIndex: 1000,
                }}>
                  {/* User Profile Header in Menu */}
                  <div style={{
                    padding: '8px 10px 10px 10px',
                    borderBottom: '1px solid #27272a',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff0072 0%, #7c3aed 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div style={{ overflow: 'hidden', minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.email}
                      </div>
                    </div>
                  </div>

                  {/* List of URLs / Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setShowProfileModal(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#e4e4e7',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1e1c29')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <UserIcon size={14} color="#ff6080" />
                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenDocs();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#e4e4e7',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1e1c29')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Key size={14} color="#38bdf8" />
                      <span>API Credentials & Specs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onTabChange('traces');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#e4e4e7',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1e1c29')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Database size={14} color="#fbbf24" />
                      <span>Flight Recorder Logs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onTabChange('health');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#e4e4e7',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1e1c29')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Activity size={14} color="#34d399" />
                      <span>Reliability Health & SLA</span>
                    </button>

                    <div style={{ height: '1px', background: '#27272a', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#f87171',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.12s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#f87171';
                      }}
                    >
                      <LogOut size={14} color="#ef4444" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-neon-ghost"
              style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none', color: '#a1a1aa' }}
              title="Sign in to AgentsGuard"
            >
              <UserIcon size={13} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Row 2: Action Controls Bar (Clean and Uncluttered) */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 28px 12px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={onOpenDocs}
          className="btn-neon-ghost"
          style={{ padding: '6px 12px', fontSize: '12px' }}
          title="View API schemas and endpoints for frontend integration"
        >
          <BookOpen size={13} color="#a1a1aa" />
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

      {/* Secondary Primary Navigation Bar (React Flow Pro style) */}
      <div style={{
        background: '#141416',
        borderTop: '1px solid #27272a',
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
                  borderBottom: isActive ? '2px solid #ff0072' : '2px solid transparent',
                  color: isActive ? '#ffffff' : '#a1a1aa',
                  padding: '11px 16px',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={isActive ? '#ff0072' : '#71717a'} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      background: item.badgeColor ? `${item.badgeColor}15` : 'rgba(255, 0, 114, 0.12)',
                      color: item.badgeColor || '#ff6080',
                      border: `1px solid ${item.badgeColor ? `${item.badgeColor}30` : 'rgba(255, 0, 114, 0.3)'}`,
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

      {/* User Profile Modal */}
      {showProfileModal && currentUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            style={{
              background: '#13111c',
              border: '1px solid #272238',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(255, 0, 114, 0.15)',
              overflow: 'hidden',
              animation: 'fadeIn 0.18s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid #272238',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, rgba(255, 0, 114, 0.08) 0%, transparent 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff0072 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ShieldCheck size={18} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    User Security Profile
                  </h3>
                  <span style={{ fontSize: '11px', color: '#a1a1aa' }}>AgentsGuard Access Control</span>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px' }}>
              {/* Identity Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                background: '#0d0b14',
                border: '1px solid #272238',
                borderRadius: '10px',
                marginBottom: '18px',
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff0072 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#ffffff',
                  boxShadow: '0 4px 16px rgba(255, 0, 114, 0.4)',
                  flexShrink: 0,
                }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{currentUser.email}</div>
                  <div style={{ marginTop: '5px' }}>
                    <span style={{
                      fontSize: '10px',
                      color: '#ff6080',
                      background: 'rgba(255, 0, 114, 0.12)',
                      border: '1px solid rgba(255, 0, 114, 0.35)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.4px',
                    }}>
                      Role: {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Permissions & Security details */}
              <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                Cryptographic Privileges & Scope
              </div>
              <div style={{
                background: '#0d0b14',
                border: '1px solid #272238',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>Preflight Interception Override</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>AUTHORIZED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>Human-in-the-Loop Sign Off</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>ENABLED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>Replay Sandbox Audit Execution</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>DOCKER ROOTLESS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>Session Token ID</span>
                  <span style={{ color: '#71717a', fontFamily: 'monospace' }}>sec_{currentUser.id.substring(0, 8)}...</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="btn-neon-ghost"
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    handleLogout();
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
