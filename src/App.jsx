import React, { useState, useEffect } from 'react';
import { Sparkles, User, History, Zap, FormInput, Plus, Trash2, Sliders, CheckCircle2 } from 'lucide-react';

import FormParser from './components/FormParser';
import UserPreset from './components/UserPreset';
import FieldMapper from './components/FieldMapper';
import Submitter from './components/Submitter';
import HistoryLog from './components/HistoryLog';

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

  // Helper to re-populate all fields based on current preset and parsed form schema
  const fillFieldsForSchema = (schema, preset) => {
    if (!schema || !schema.fields) return {};
    const newValues = {};
    schema.fields.forEach(field => {
      newValues[field.entryId] = generateFieldValue(field, preset);
    });
    return newValues;
  };

  // Called when user inputs/pastes a Google Form URL
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

  // Handle individual field value edits by user
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

  // Re-run auto fill for all fields
  const handleRegenerateAll = () => {
    if (parsedForm) {
      setFieldValues(fillFieldsForSchema(parsedForm, userPreset));
    }
  };

  // When user updates preset profile
  const handleUpdatePreset = (newPreset) => {
    setUserPreset(newPreset);
    if (parsedForm) {
      setFieldValues(fillFieldsForSchema(parsedForm, newPreset));
    }
  };

  // Clear history handler
  const handleClearHistory = () => {
    if (window.confirm('Clear all submission history logs?')) {
      const updated = clearSubmissionHistory();
      setHistoryList(updated);
    }
  };

  // Called after a submission completes
  const handleSubmissionComplete = () => {
    setHistoryList(loadSubmissionHistory());
  };

  // Create manual form schema if URL fetch fails or user wants custom entries
  const handleCreateManualForm = () => {
    const manualSchema = {
      formTitle: 'Custom Google Form',
      formDescription: 'Manually specified entry fields',
      formUrl: '',
      submitUrl: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse',
      formId: 'YOUR_FORM_ID',
      fields: [
        {
          id: '1',
          entryId: 'entry.1000001',
          title: 'Full Name',
          description: '',
          type: 'short_text',
          required: true,
          choices: []
        },
        {
          id: '2',
          entryId: 'entry.1000002',
          title: 'Email Address',
          description: '',
          type: 'short_text',
          required: true,
          choices: []
        }
      ]
    };
    setParsedForm(manualSchema);
    setFieldValues(fillFieldsForSchema(manualSchema, userPreset));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Glass Navigation Bar */}
      <header className="glass-header">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
              <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FormPulse AI
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginLeft: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CLIENT ONLY
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className={`tab-btn ${activeTab === 'auto-submit' ? 'active' : ''}`}
              onClick={() => setActiveTab('auto-submit')}
            >
              <FormInput size={18} /> Auto-Submitter
            </button>
            <button 
              className={`tab-btn ${activeTab === 'preset' ? 'active' : ''}`}
              onClick={() => setActiveTab('preset')}
            >
              <User size={18} /> My Details Preset
            </button>
            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={18} /> History ({historyList.length})
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

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
        FormPulse AI Auto-Submitter &bull; Pre-set personal details priority auto-filler &bull; 100% Client-Side
      </footer>
    </div>
  );
}
