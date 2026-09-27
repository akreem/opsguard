'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Zap,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'operator' | 'developer' | 'security' | 'admin'>('operator');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        if (data.authenticated) {
          const params = new URLSearchParams(window.location.search);
          const raw = params.get('redirect');
          const dest = (raw && !raw.startsWith('/login') && !raw.startsWith('/register')) ? raw : '/home';
          window.location.href = dest;
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      if (data.user) {
        localStorage.setItem('opsguard_user', JSON.stringify(data.user));
      }
      if (data.token) {
        localStorage.setItem('opsguard_token', data.token);
      }

      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const raw = params ? params.get('redirect') : null;
      const targetUrl = (raw && !raw.startsWith('/login') && !raw.startsWith('/register')) ? raw : '/home';
      window.location.href = targetUrl;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0c0a14',
      color: '#f4f4f5',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow atmosphere */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        backgroundImage: `
          radial-gradient(circle at 50% 15%, rgba(124, 58, 237, 0.18) 0%, transparent 60%),
          radial-gradient(circle at 20% 80%, rgba(255, 0, 114, 0.1) 0%, transparent 50%),
          radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 24px 24px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Top minimal bar */}
      <header style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #ff2d78 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(255, 45, 120, 0.35)',
          }}>
            <Shield size={17} color="#ffffff" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
            AgentsGuard
          </span>
        </Link>

        <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#ff2d78', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Register Card */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          background: '#131020',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '14px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(124, 58, 237, 0.1)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 45, 120, 0.1)',
              border: '1px solid rgba(255, 45, 120, 0.3)',
              color: '#ff6080',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}>
              <Zap size={11} />
              <span>Get Started</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              Create your AgentsGuard account
            </h1>
            <p style={{ fontSize: '13px', color: '#a1a1aa' }}>
              Deploy real-time guardrails for autonomous LLM agents
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#f87171',
              fontSize: '13px',
              marginBottom: '18px',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Sarah Connor"
                  style={{
                    width: '100%',
                    background: '#0c0a14',
                    border: '1px solid #272238',
                    borderRadius: '8px',
                    padding: '10px 14px 10px 38px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                Work Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sarah@company.com"
                  style={{
                    width: '100%',
                    background: '#0c0a14',
                    border: '1px solid #272238',
                    borderRadius: '8px',
                    padding: '10px 14px 10px 38px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                Team Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'operator', label: 'Operator', desc: 'Sign-off' },
                  { id: 'developer', label: 'AI Engineer', desc: 'Integration' },
                  { id: 'security', label: 'Security Lead', desc: 'Policy' },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as any)}
                    style={{
                      background: role === r.id ? 'rgba(255, 45, 120, 0.15)' : '#0c0a14',
                      border: role === r.id ? '1px solid #ff2d78' : '1px solid #272238',
                      color: role === r.id ? '#ffffff' : '#a1a1aa',
                      borderRadius: '6px',
                      padding: '8px 6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    <div>{r.label}</div>
                    <div style={{ fontSize: '9px', color: '#71717a' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#71717a" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    style={{
                      width: '100%',
                      background: '#0c0a14',
                      border: '1px solid #272238',
                      borderRadius: '8px',
                      padding: '10px 10px 10px 32px',
                      color: '#ffffff',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                  Confirm
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#71717a" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      background: '#0c0a14',
                      border: '1px solid #272238',
                      borderRadius: '8px',
                      padding: '10px 10px 10px 32px',
                      color: '#ffffff',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '10px',
                background: '#ff2d78',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(255, 45, 120, 0.4)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
