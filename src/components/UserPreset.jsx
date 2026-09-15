import React, { useState, useEffect } from 'react';
import { Wallet, Save, Trash2, CheckCircle2, ShieldCheck, ListChecks, Sparkles, Twitter, Send, Mail, User, CheckSquare, Square, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { saveUserPreset } from '../utils/storage';

export default function UserPreset({ preset, onUpdatePreset }) {
  // Preset state
  const [walletList, setWalletList] = useState([]);
  const [walletText, setWalletText] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    if (preset && Array.isArray(preset.walletList) && preset.walletList.length > 0) {
      setWalletList(preset.walletList);
      setWalletText(preset.walletList.map(w => w.address).join('\n'));
    } else if (preset && Array.isArray(preset.walletAddresses) && preset.walletAddresses.length > 0) {
      const formatted = preset.walletAddresses.map(addr => ({ 
        address: addr, 
        enabled: true,
        twitter: '',
        telegram: '',
        email: '',
        name: ''
      }));
      setWalletList(formatted);
      setWalletText(preset.walletAddresses.join('\n'));
    }
  }, [preset]);

  // Toggle single wallet address active/hidden state
  const toggleWalletStatus = (index) => {
    const updated = walletList.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item);
    setWalletList(updated);
  };

  // Update custom detail for specific wallet
  const handleWalletDetailChange = (index, field, val) => {
    const updated = walletList.map((item, i) => i === index ? { ...item, [field]: val } : item);
    setWalletList(updated);
  };

  // Toggle all wallets
  const setAllWalletsStatus = (status) => {
    const updated = walletList.map(item => ({ ...item, enabled: status }));
    setWalletList(updated);
  };

  // Parse text area into walletList objects preserving existing custom details
  const parseTextToWallets = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const uniqueLines = Array.from(new Set(lines));
    
    const existingMap = new Map(walletList.map(w => [w.address.toLowerCase(), w]));
    return uniqueLines.map(addr => {
      const existing = existingMap.get(addr.toLowerCase());
      return {
        address: addr,
        enabled: existing ? existing.enabled : true,
        twitter: existing ? (existing.twitter || '') : '',
        telegram: existing ? (existing.telegram || '') : '',
        email: existing ? (existing.email || '') : '',
        name: existing ? (existing.name || '') : ''
      };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const finalWallets = isEditMode ? parseTextToWallets(walletText) : walletList;
    setWalletList(finalWallets);
    setWalletText(finalWallets.map(w => w.address).join('\n'));

    const updatedPreset = {
      walletList: finalWallets
    };

    saveUserPreset(updatedPreset);
    onUpdatePreset(updatedPreset);
    setIsEditMode(false);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const activeCount = walletList.filter(w => w.enabled).length;

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Wallet style={{ color: 'var(--primary)' }} size={26} />
              Per-Wallet Custom Details & Address Manager
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Add specific Twitter, Telegram, or Email for each wallet! Blank fields are auto-generated dynamically.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className="btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            {isEditMode ? 'Switch to Per-Wallet Details View' : 'Paste / Bulk Edit Text'}
          </button>
        </div>

        <form onSubmit={handleSave}>
          
          {/* Wallet Address Manager Card */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListChecks size={18} style={{ color: 'var(--accent-emerald)' }} />
                Loaded Wallets ({activeCount} Active / {walletList.length} Total)
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

            {/* Per-Wallet Interactive Cards List */}
            {!isEditMode ? (
              <div>
                {walletList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {walletList.map((item, idx) => {
                      const isExpanded = expandedIndex === idx;
                      const hasCustom = item.twitter || item.telegram || item.email || item.name;

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            border: item.enabled ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--border-color)',
                            background: item.enabled ? 'rgba(17, 24, 39, 0.75)' : 'rgba(9, 13, 22, 0.4)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div 
                              onClick={() => toggleWalletStatus(idx)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1 }}
                            >
                              {item.enabled ? (
                                <CheckSquare size={18} style={{ color: 'var(--accent-emerald)' }} />
                              ) : (
                                <Square size={18} style={{ color: 'var(--text-dim)' }} />
                              )}
                              <span style={{ 
                                fontSize: '0.88rem', 
                                fontFamily: 'var(--font-mono)', 
                                fontWeight: '700',
                                color: item.enabled ? '#fff' : 'var(--text-dim)',
                                textDecoration: item.enabled ? 'none' : 'line-through'
                              }}>
                                #{idx + 1}: {item.address}
                              </span>
                              {hasCustom && (
                                <span className="badge badge-indigo" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                                  Custom Handles Set
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span className={`badge ${item.enabled ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                                {item.enabled ? 'ACTIVE' : 'HIDDEN'}
                              </span>

                              <button
                                type="button"
                                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                                className="btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                              >
                                <Edit3 size={12} /> {isExpanded ? 'Hide Custom Fields' : 'Custom Handles'}
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            </div>
                          </div>

                          {/* Per-Wallet Custom Details Inputs */}
                          {isExpanded && (
                            <div style={{ 
                              marginTop: '0.85rem', 
                              paddingTop: '0.85rem', 
                              borderTop: '1px solid rgba(255,255,255,0.08)',
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                              gap: '0.75rem' 
                            }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                  <Twitter size={12} style={{ display: 'inline', marginRight: '3px', color: '#818cf8' }} /> Twitter/X Handle (Optional)
                                </label>
                                <input
                                  type="text"
                                  className="input-control"
                                  style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
                                  placeholder="e.g. @user_x1 (blank -> Auto)"
                                  value={item.twitter || ''}
                                  onChange={(e) => handleWalletDetailChange(idx, 'twitter', e.target.value)}
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                  <Send size={12} style={{ display: 'inline', marginRight: '3px', color: '#38bdf8' }} /> Telegram Username (Optional)
                                </label>
                                <input
                                  type="text"
                                  className="input-control"
                                  style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
                                  placeholder="e.g. @user_tg1 (blank -> Auto)"
                                  value={item.telegram || ''}
                                  onChange={(e) => handleWalletDetailChange(idx, 'telegram', e.target.value)}
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                  <Mail size={12} style={{ display: 'inline', marginRight: '3px', color: '#34d399' }} /> Email Address (Optional)
                                </label>
                                <input
                                  type="email"
                                  className="input-control"
                                  style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
                                  placeholder="e.g. email1@gmail.com (blank -> Auto)"
                                  value={item.email || ''}
                                  onChange={(e) => handleWalletDetailChange(idx, 'email', e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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

          {/* Banner explaining Auto-Gen Fallback */}
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
              <strong>Per-Wallet Fallback Guarantee:</strong> You can type specific Twitter, Telegram, or Email handles for any specific wallet address. Any field left blank will automatically generate unique, realistic details for that wallet run!
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
                  <CheckCircle2 size={16} /> Per-Wallet Settings Saved!
                </span>
              )}
              <button type="submit" className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                <Save size={18} /> Save Per-Wallet Settings
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
