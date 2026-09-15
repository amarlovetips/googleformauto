import React, { useState, useEffect } from 'react';
import { Sparkles, User, History, Zap, FormInput, Lock, Twitter, Send, ExternalLink, Heart, ShieldCheck } from 'lucide-react';

import FormParser from './components/FormParser';
import UserPreset from './components/UserPreset';
import FieldMapper from './components/FieldMapper';
import Submitter from './components/Submitter';
import HistoryLog from './components/HistoryLog';
import AccessGate from './components/AccessGate';

import { loadUserPreset, loadSubmissionHistory, clearSubmissionHistory, DEFAULT_PRESET } from './utils/storage';
import { generateFieldValue } from './utils/formUtils';
import { fetchAndParseGoogleForm } from './utils/formParser';

export default function App() {
  const [activeTab, setActiveTab] = useState('auto-submit'); // 'auto-submit' | 'preset' | 'history'
  const [userPreset, setUserPreset] = useState(DEFAULT_PRESET);
  const [historyList, setHistoryList] = useState([]);
  
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [parseError, setParseError] = useState(null);
  
  const [parsedForm, setParsedForm] = useState(null);
  const [fieldValues, setFieldValues] = useState({});

  useEffect(() => {
    setUserPreset(loadUserPreset());
    setHistoryList(loadSubmissionHistory());
  }, []);

  const fillFieldsForSchema = (schema, preset) => {
    if (!schema || !schema.fields) return {};
    const newValues = {};
    schema.fields.forEach(field => {
      newValues[field.entryId] = generateFieldValue(field, preset);
    });
    return newValues;
  };

  const handleParseForm = async (formUrl) => {
    setIsLoadingForm(true);
    setParseError(null);

    try {
      const schema = await fetchAndParseGoogleForm(formUrl);
      setParsedForm(schema);
      const mappedValues = fillFieldsForSchema(schema, userPreset);
      setFieldValues(mappedValues);
    } catch (err) {
      setParseError(err.message || 'Error fetching Google Form schema. Please check the link.');
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleFieldValueChange = (entryId, newValue) => {
    setFieldValues(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        value: newValue,
        isPreset: prev[entryId]?.isPreset ?? false,
        source: 'User Manual Override'
      }
    }));
  };

  const handleRegenerateAll = () => {
    if (parsedForm) {
      setFieldValues(fillFieldsForSchema(parsedForm, userPreset));
    }
  };

  const handleUpdatePreset = (newPreset) => {
    setUserPreset(newPreset);
    if (parsedForm) {
      setFieldValues(fillFieldsForSchema(parsedForm, newPreset));
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all submission history logs?')) {
      const updated = clearSubmissionHistory();
      setHistoryList(updated);
    }
  };

  const handleSubmissionComplete = () => {
    setHistoryList(loadSubmissionHistory());
  };

  const handleLockOut = () => {
    if (window.confirm('Lock site and remove saved access code from this browser?')) {
      localStorage.removeItem('formpulse_access_code');
      window.location.reload();
    }
  };

  return (
    <AccessGate>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Glass Navigation Bar */}
        <header className="glass-header">
          <div className="header-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* Left Brand & Credit Badges */}
            <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: 'var(--radius-sm)', 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
              }}>
                <Zap size={22} style={{ color: '#fff' }} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    FormPulse AI
                  </span>
                  <span className="badge badge-indigo" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                    Earntap x A4Studio Dev
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.1rem' }}>
                  {/* Twitter Link */}
                  <a 
                    href="https://x.com/earntapofficial" 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: '#818cf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}
                  >
                    <Twitter size={11} /> @earntapofficial
                  </a>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>&bull;</span>
                  {/* Telegram Link */}
                  <a 
                    href="https://t.me/earntap" 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}
                  >
                    <Send size={11} /> @earntap
                  </a>
                </div>
              </div>
            </div>

            {/* Right Nav Tabs */}
            <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className={`tab-btn ${activeTab === 'auto-submit' ? 'active' : ''}`}
                onClick={() => setActiveTab('auto-submit')}
              >
                <FormInput size={17} /> Auto-Submitter
              </button>
              <button 
                className={`tab-btn ${activeTab === 'preset' ? 'active' : ''}`}
                onClick={() => setActiveTab('preset')}
              >
                <User size={17} /> My Details Preset
              </button>
              <button 
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <History size={17} /> History ({historyList.length})
              </button>

              <button
                type="button"
                onClick={handleLockOut}
                title="Lock Site Security"
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-rose)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  marginLeft: '0.4rem'
                }}
              >
                <Lock size={14} /> Lock Site
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
          
          {activeTab === 'auto-submit' && (
            <div>
              {/* Form Link Input Hero */}
              <FormParser 
                onParseSuccess={handleParseForm} 
                isLoading={isLoadingForm}
                error={parseError}
              />

              {/* Parsed Fields Inspection & Auto-Fill Grid */}
              {parsedForm && (
                <>
                  <FieldMapper 
                    parsedForm={parsedForm}
                    userPreset={userPreset}
                    fieldValues={fieldValues}
                    onFieldValueChange={handleFieldValueChange}
                    onRegenerate={handleRegenerateAll}
                  />

                  {/* Submitter Action Bar */}
                  <Submitter 
                    parsedForm={parsedForm}
                    userPreset={userPreset}
                    fieldValues={fieldValues}
                    onSubmissionComplete={handleSubmissionComplete}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'preset' && (
            <UserPreset 
              preset={userPreset} 
              onUpdatePreset={handleUpdatePreset} 
            />
          )}

          {activeTab === 'history' && (
            <HistoryLog 
              historyList={historyList} 
              onClearHistory={handleClearHistory} 
            />
          )}
        </main>

        {/* Footer with Full Credits & Social Links */}
        <footer style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(9, 13, 22, 0.95)', padding: '2rem 1.5rem' }}>
          <div className="footer-container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            
            {/* Footer Credits */}
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                FormPulse AI &bull; Created by <span style={{ color: '#818cf8' }}>Earntap</span> & <span style={{ color: '#c084fc' }}>A4Studio Dev</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Automated Google Form Submitter & Multi-Wallet Filler &bull; 100% Protected Client-Side
              </p>
            </div>

            {/* Footer Social Buttons */}
            <div className="footer-socials" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a 
                href="https://x.com/earntapofficial" 
                target="_blank" 
                rel="noreferrer"
                className="social-link-btn"
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Twitter size={14} style={{ color: '#818cf8' }} /> Twitter: @earntapofficial <ExternalLink size={12} />
              </a>

              <a 
                href="https://t.me/earntap" 
                target="_blank" 
                rel="noreferrer"
                className="social-link-btn"
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#67e8f9',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Send size={14} style={{ color: '#38bdf8' }} /> Telegram: @earntap <ExternalLink size={12} />
              </a>
            </div>

          </div>

          <div style={{ maxWidth: '1100px', margin: '1.25rem auto 0', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            &copy; 2026 <strong>Earntap</strong> &amp; <strong>A4Studio Dev</strong>. All rights reserved.
          </div>
        </footer>
      </div>
    </AccessGate>
  );
}
