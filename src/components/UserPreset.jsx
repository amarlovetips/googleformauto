import React, { useState, useEffect } from 'react';
import { Wallet, Save, Trash2, CheckCircle2, ShieldCheck, ListChecks, Sparkles, ToggleLeft, ToggleRight, Twitter, Send, Mail, User, CheckSquare, Square } from 'lucide-react';
import { saveUserPreset } from '../utils/storage';

export default function UserPreset({ preset, onUpdatePreset }) {
  // Preset state
  const [walletList, setWalletList] = useState([]);
  const [walletText, setWalletText] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Optional fixed handles
  const [fixedTwitter, setFixedTwitter] = useState(preset.fixedTwitter || '');
  const [fixedTelegram, setFixedTelegram] = useState(preset.fixedTelegram || '');
  const [fixedEmail, setFixedEmail] = useState(preset.fixedEmail || '');
  const [fixedName, setFixedName] = useState(preset.fixedName || '');

  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    if (preset && Array.isArray(preset.walletList) && preset.walletList.length > 0) {
      setWalletList(preset.walletList);
      setWalletText(preset.walletList.map(w => w.address).join('\n'));
    } else if (preset && Array.isArray(preset.walletAddresses) && preset.walletAddresses.length > 0) {
      const formatted = preset.walletAddresses.map(addr => ({ address: addr, enabled: true }));
      setWalletList(formatted);
      setWalletText(preset.walletAddresses.join('\n'));
    }
    if (preset) {
      setFixedTwitter(preset.fixedTwitter || '');
      setFixedTelegram(preset.fixedTelegram || '');
      setFixedEmail(preset.fixedEmail || '');
      setFixedName(preset.fixedName || '');
    }
  }, [preset]);

  // Toggle single wallet address active/hidden state
  const toggleWalletStatus = (index) => {
    const updated = walletList.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item);
    setWalletList(updated);
  };

  // Toggle all wallets
  const setAllWalletsStatus = (status) => {
    const updated = walletList.map(item => ({ ...item, enabled: status }));
    setWalletList(updated);
  };

  // Parse text area into walletList objects
  const parseTextToWallets = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const uniqueLines = Array.from(new Set(lines));
    
    // Preserve existing enabled states
    const existingMap = new Map(walletList.map(w => [w.address.toLowerCase(), w.enabled]));
    return uniqueLines.map(addr => ({
      address: addr,
      enabled: existingMap.has(addr.toLowerCase()) ? existingMap.get(addr.toLowerCase()) : true
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const finalWallets = isEditMode ? parseTextToWallets(walletText) : walletList;
    setWalletList(finalWallets);
    setWalletText(finalWallets.map(w => w.address).join('\n'));

    const updatedPreset = {
      walletList: finalWallets,
      fixedTwitter: fixedTwitter.trim(),
      fixedTelegram: fixedTelegram.trim(),
      fixedEmail: fixedEmail.trim(),
      fixedName: fixedName.trim()
    };

    saveUserPreset(updatedPreset);
    onUpdatePreset(updatedPreset);
    setIsEditMode(false);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const activeCount = walletList.filter(w => w.enabled).length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Wallet style={{ color: 'var(--primary)' }} size={26} />
              My Details & Multi-Address Manager
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Manage active wallet addresses and set your optional fixed handles (or leave blank to auto-generate!).
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className="btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            {isEditMode ? 'Switch to List View' : 'Paste / Bulk Edit Text'}
          </button>
        </div>

        <form onSubmit={handleSave}>
          
          {/* Wallet Address Manager Card */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListChecks size={18} style={{ color: 'var(--accent-emerald)' }} />
                Wallet Addresses ({activeCount} Active / {walletList.length} Total)
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAllWalletsStatus(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                >
                  Enable All
                </button>
                <span style={{ color: 'var(--text-dim)' }}>|</span>
                <button
                  type="button"
                  onClick={() => setAllWalletsStatus(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                >
                  Disable All
                </button>
              </div>
            </div>

            {/* List View with Enable/Disable Toggles */}
            {!isEditMode ? (
              <div>
                {walletList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {walletList.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleWalletStatus(idx)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: item.enabled ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-color)',
                          background: item.enabled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(9, 13, 22, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {item.enabled ? (
                            <CheckSquare size={18} style={{ color: 'var(--accent-emerald)' }} />
                          ) : (
                            <Square size={18} style={{ color: 'var(--text-dim)' }} />
                          )}
                          <span style={{ 
                            fontSize: '0.85rem', 
                            fontFamily: 'var(--font-mono)', 
                            fontWeight: '600',
                            color: item.enabled ? '#fff' : 'var(--text-dim)',
                            textDecoration: item.enabled ? 'none' : 'line-through'
                          }}>
                            #{idx + 1}: {item.address}
                          </span>
                        </div>

                        <span className={`badge ${item.enabled ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                          {item.enabled ? 'ACTIVE (SUBMIT)' : 'HIDDEN (SKIP)'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    No wallet addresses added yet. Click "Paste / Bulk Edit Text" above to paste your addresses.
                  </div>
                )}
              </div>
            ) : (
              /* Bulk Edit Textarea */
              <div>
                <textarea
                  className="input-control"
                  rows={10}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '1.7', padding: '1rem' }}
                  placeholder="Paste your EVM / Solana / Wallet addresses here (one address per line)..."
                  value={walletText}
                  onChange={(e) => setWalletText(e.target.value)}
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Clicking "Save Profile & Settings" below will update the list with all parsed addresses.
                </div>
              </div>
            )}
          </div>

          {/* Optional Fixed Handles Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
              Optional Fixed Handles (Auto-Gen Fallback if Left Blank)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              If you want to use your OWN fixed X username, Telegram handle, or Email, type them below. If left blank, realistic unique handles will be generated automatically!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {/* Twitter / X Handle */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  <Twitter size={14} style={{ display: 'inline', marginRight: '4px', color: '#818cf8' }} /> Fixed Twitter/X Handle (Optional)
                </label>
                <input 
                  type="text" 
                  className="input-control" 
                  value={fixedTwitter} 
                  onChange={(e) => setFixedTwitter(e.target.value)}
                  placeholder="e.g. @my_twitter_handle (or leave blank)"
                />
              </div>

              {/* Telegram Username */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  <Send size={14} style={{ display: 'inline', marginRight: '4px', color: '#38bdf8' }} /> Fixed Telegram Username (Optional)
                </label>
                <input 
                  type="text" 
                  className="input-control" 
                  value={fixedTelegram} 
                  onChange={(e) => setFixedTelegram(e.target.value)}
                  placeholder="e.g. @my_telegram_user (or leave blank)"
                />
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  <Mail size={14} style={{ display: 'inline', marginRight: '4px', color: '#34d399' }} /> Fixed Gmail / Email Address (Optional)
                </label>
                <input 
                  type="email" 
                  className="input-control" 
                  value={fixedEmail} 
                  onChange={(e) => setFixedEmail(e.target.value)}
                  placeholder="e.g. myemail@gmail.com (or leave blank)"
                />
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  <User size={14} style={{ display: 'inline', marginRight: '4px', color: '#f472b6' }} /> Fixed Full Name (Optional)
                </label>
                <input 
                  type="text" 
                  className="input-control" 
                  value={fixedName} 
                  onChange={(e) => setFixedName(e.target.value)}
                  placeholder="e.g. John Doe (or leave blank)"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} /> Saved safely in your local browser storage.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {savedStatus && (
                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={16} /> Settings Saved!
                </span>
              )}
              <button type="submit" className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                <Save size={18} /> Save Profile & Settings
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
