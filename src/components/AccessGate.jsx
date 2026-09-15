import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ArrowRight, ShieldAlert, Sparkles, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import TweetEmbed from './TweetEmbed';

const ACCESS_CODE_TARGET = 'I love Earntap';
const AUTH_STORAGE_KEY = 'formpulse_access_code';

export default function AccessGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if access code is already stored in browser
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored && stored.trim().toLowerCase() === ACCESS_CODE_TARGET.toLowerCase()) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    if (inputCode.trim().toLowerCase() === ACCESS_CODE_TARGET.toLowerCase()) {
      localStorage.setItem(AUTH_STORAGE_KEY, ACCESS_CODE_TARGET);
      setIsAuthenticated(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Invalid Access Code! Please enter the correct code to enter.');
    }
  };

  if (isChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verifying Security Access...</div>
      </div>
    );
  }

  // Render Lock Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem 1.5rem',
        background: 'var(--bg-dark)',
        backgroundImage: 'radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.2) 0px, transparent 60%)'
      }}>
        <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          
          {/* Glowing Lock Icon Header */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)'
          }}>
            <LockKeyhole size={32} style={{ color: '#fff' }} />
          </div>

          <div className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
            <Sparkles size={12} /> Protected Application
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            FormPulse Security Gate
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Please enter your Access Code to unlock the site. Check out the announcement tweet below to like, comment &amp; get the code!
          </p>

          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <KeyRound style={{ position: 'absolute', left: '1rem', color: 'var(--primary)' }} size={18} />
              
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem', height: '48px', fontSize: '0.95rem' }}
                placeholder="Enter Access Code..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                autoFocus
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ height: '48px', justifyContent: 'center', fontSize: '1rem' }}
            >
              UNLOCK WEBSITE <ArrowRight size={18} />
            </button>
          </form>

          {errorMsg && (
            <div style={{ 
              marginTop: '1.25rem', 
              padding: '0.85rem', 
              background: 'rgba(244, 63, 94, 0.12)', 
              border: '1px solid rgba(244, 63, 94, 0.35)', 
              borderRadius: 'var(--radius-sm)',
              color: '#fda4af',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textAlign: 'left'
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, color: 'var(--accent-rose)' }} />
              <div>{errorMsg}</div>
            </div>
          )}
        </div>

        {/* Access Code Tweet Widget Embed (Visible during Lock state) */}
        <TweetEmbed />
      </div>
    );
  }

  return children;
}
