import React, { useState, useEffect } from 'react';
import { Wallet, Save, Trash2, CheckCircle2, ShieldCheck, ListChecks, Sparkles } from 'lucide-react';
import { saveUserPreset } from '../utils/storage';

export default function UserPreset({ preset, onUpdatePreset }) {
  const [walletText, setWalletText] = useState((preset.walletAddresses || []).join('\n'));
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    if (preset && Array.isArray(preset.walletAddresses)) {
      setWalletText(preset.walletAddresses.join('\n'));
    }
  }, [preset]);

  // Helper to parse wallet list text into clean array
  const parseWallets = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    return Array.from(new Set(lines)); // Deduplicate
  };

  const currentWallets = parseWallets(walletText);

  const handleSave = (e) => {
    e.preventDefault();
    const cleanWallets = parseWallets(walletText);
    const updated = { walletAddresses: cleanWallets };
    
    saveUserPreset(updated);
    onUpdatePreset(updated);
    
    setWalletText(cleanWallets.join('\n'));
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const handleClearList = () => {
    if (window.confirm('Clear all wallet addresses from list?')) {
      const updated = { walletAddresses: [] };
      setWalletText('');
      saveUserPreset(updated);
      onUpdatePreset(updated);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2500);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Wallet style={{ color: 'var(--primary)' }} size={26} />
              Wallet Addresses List Manager
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Paste or edit any list of wallet addresses. All other fields (Twitter, Telegram, Name, Email) are auto-generated dynamically!
            </p>
          </div>
          
          {walletText.trim() && (
            <button 
              type="button" 
              onClick={handleClearList}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', color: 'var(--accent-rose)' }}
            >
              <Trash2 size={14} /> Clear List
            </button>
          )}
        </div>

        <form onSubmit={handleSave}>
          
          {/* Main Wallet Editor Box */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListChecks size={18} style={{ color: 'var(--accent-emerald)' }} />
                Loaded Addresses ({currentWallets.length})
              </h3>

              <span className="badge badge-emerald" style={{ fontSize: '0.8rem' }}>
                {currentWallets.length} Address(es) Ready
              </span>
            </div>

            <textarea
              className="input-control"
              rows={12}
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.9rem', 
                lineHeight: '1.7',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)'
              }}
              placeholder={`Paste your EVM / Solana / Wallet addresses here (one address per line)...`}
              value={walletText}
              onChange={(e) => setWalletText(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <span>Blank lines and duplicates are automatically cleaned upon saving.</span>
              {currentWallets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setWalletText(currentWallets.join('\n'))}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Clean & Format List
                </button>
              )}
            </div>
          </div>

          {/* Banner explaining 100% Auto Social Handles */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.85rem',
            color: '#67e8f9'
          }}>
            <Sparkles size={20} style={{ flexShrink: 0, color: 'var(--accent-cyan)' }} />
            <div>
              <strong>100% Automatic Social Handles:</strong> Twitter/X handles, Tweet URLs, Telegram usernames, Discord IDs, Names, and Emails do not need manual typing. They are automatically generated with matching, realistic formats during each submission run!
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} /> Saved safely in your local browser storage.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {savedStatus && (
                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={16} /> Saved Successfully!
                </span>
              )}
              <button type="submit" className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                <Save size={18} /> Save Wallet Addresses List
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
