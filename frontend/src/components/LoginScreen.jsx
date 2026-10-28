import React, { useEffect, useState } from 'react';
import { Radio, ShieldAlert, Lock } from 'lucide-react';
import { api, setAuthToken } from '../services/api';
import { supabase } from '../services/supabase';

export default function LoginScreen({ onLoginSuccess }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Verifying permissions...');

  // Automatically handle Supabase Google OAuth redirect on page load
  useEffect(() => {
    let isHandled = false;

    const verifySession = async (session) => {
      if (!session?.access_token || isHandled) return;
      isHandled = true;
      setLoading(true);
      setLoadingMsg(`Verifying authorization for ${session.user?.email || 'account'}...`);

      try {
        const data = await api.googleLogin({ supabaseToken: session.access_token });
        setAuthToken(data.token);
        onLoginSuccess(data.user);
      } catch (err) {
        console.error('OAuth exchange error:', err);
        setError(
          err.data?.error ||
          err.message ||
          'Access denied: This Gmail is not authorized.'
        );
        await supabase.auth.signOut().catch(() => { });
      } finally {
        setLoading(false);
      }
    };

    // 1. Check existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) verifySession(session);
    });

    // 2. Listen for SIGNED_IN event (triggered upon return from OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        verifySession(session);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [onLoginSuccess]);

  // Supabase Google Login Trigger
  const handleSupabaseGoogleLogin = async () => {
    setLoading(true);
    setLoadingMsg('Redirecting to Google...');
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google OAuth error:', err);
      setError(err.message || 'Failed to start Google sign-in.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blurred background orbs */}
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%)',
        top: '12%',
        left: '20%',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.18) 0%, transparent 70%)',
        bottom: '12%',
        right: '20%',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '42px 32px',
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)'
      }}>
        {/* App Logo */}


        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          lazy<span className="gradient-text">Panda</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Welcome back!
        </p>

        {/* Security Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          color: '#a5b4fc',
          fontWeight: 600,
          marginBottom: '28px'
        }}>
          <Lock size={14} />
          Authorized Gmails Only • No Public Registration
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            marginBottom: '24px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-danger)' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>Access Denied</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Supabase Google Login */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          margin: '10px 0 10px'
        }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '16px 0' }}>
              <div className="spin" style={{ width: '22px', height: '22px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
              <span>{loadingMsg}</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSupabaseGoogleLogin}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '13px 24px',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign in with Google
              </button>


            </>
          )}
        </div>
      </div>
    </div>
  );
}
