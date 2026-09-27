'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      // Store in localStorage for fast client-side presence check
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
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
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
          radial-gradient(circle at 80% 80%, rgba(255, 0, 114, 0.1) 0%, transparent 50%),
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
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#ff2d78', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
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
          maxWidth: '440px',
          background: '#131020',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '14px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(124, 58, 237, 0.1)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
              marginBottom: '12px',
            }}>
              <Zap size={11} />
              <span>Control Plane Access</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              Sign in to AgentsGuard
            </h1>
            <p style={{ fontSize: '13px', color: '#a1a1aa' }}>
              Monitor, guard, and verify autonomous agents in real-time
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
              marginBottom: '20px',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@agentsguard.io"
                  style={{
                    width: '100%',
                    background: '#0c0a14',
                    border: '1px solid #272238',
                    borderRadius: '8px',
                    padding: '10px 14px 10px 38px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#ff2d78'}
                  onBlur={e => e.target.style.borderColor = '#272238'}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#d4d4d8' }}>
                  Password
                </label>
                <span style={{ fontSize: '11px', color: '#ff6080', cursor: 'pointer' }} onClick={() => fillDemoAccount('admin@agentsguard.io', 'admin123')}>
                  Use default password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: '#0c0a14',
                    border: '1px solid #272238',
                    borderRadius: '8px',
                    padding: '10px 38px 10px 38px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#ff2d78'}
                  onBlur={e => e.target.style.borderColor = '#272238'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#71717a',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
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
                transition: 'all 0.15s ease',
              }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #272238' }}>
            <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px', textAlign: 'center' }}>
              Instant Demo Access (1-Click)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@agentsguard.io', 'admin123')}
                style={{
                  background: '#181428',
                  border: '1px solid #272238',
                  color: '#e4e4e7',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <strong style={{ color: '#ff6080' }}>Lead Operator</strong>
                <span style={{ color: '#71717a', fontSize: '10px' }}>admin@agentsguard.io</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('developer@agentsguard.io', 'dev123')}
                style={{
                  background: '#181428',
                  border: '1px solid #272238',
                  color: '#e4e4e7',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <strong style={{ color: '#38bdf8' }}>AI Engineer</strong>
                <span style={{ color: '#71717a', fontSize: '10px' }}>developer@agentsguard.io</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
