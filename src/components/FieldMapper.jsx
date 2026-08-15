import React, { useState } from 'react';
import { Check, User, Sparkles, Sliders, RefreshCcw, Wallet, ListFilter, CheckSquare } from 'lucide-react';
import { generateFieldValue, generateRealisticIdentity } from '../utils/formUtils';

export default function FieldMapper({ parsedForm, userPreset, onFieldValueChange }) {
  const [selectedWalletIdx, setSelectedWalletIdx] = useState(0);
  const [overrideMap, setOverrideMap] = useState({}); // Stores user manual overrides per wallet run

  if (!parsedForm || !parsedForm.fields) return null;

  const { formTitle, formDescription, fields } = parsedForm;
  const wallets = (userPreset && Array.isArray(userPreset.walletAddresses)) ? userPreset.walletAddresses : [];

  // Generate identity for selected wallet index
  const freshIdentity = generateRealisticIdentity();

  // Compute field state for currently selected wallet index
  const getFieldState = (field) => {
    const overrideKey = `${selectedWalletIdx}_${field.entryId}`;
    if (overrideMap[overrideKey] !== undefined) {
      return overrideMap[overrideKey];
    }
    return generateFieldValue(field, userPreset, selectedWalletIdx, freshIdentity);
  };

  const handleValueEdit = (field, newTargetVal) => {
    const overrideKey = `${selectedWalletIdx}_${field.entryId}`;
    setOverrideMap(prev => ({
      ...prev,
      [overrideKey]: {
        value: newTargetVal,
        isPreset: false,
        source: 'User Manual Override'
      }
    }));
    if (onFieldValueChange) {
      onFieldValueChange(field.entryId, newTargetVal);
    }
  };

  const renderInputForField = (field) => {
    const fieldState = getFieldState(field);
    const val = fieldState.value;

    switch (field.type) {
      case 'radio':
      case 'dropdown':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <select
              className="input-control"
              value={val}
              onChange={(e) => handleValueEdit(field, e.target.value)}
            >
              {field.choices && field.choices.length > 0 ? (
                field.choices.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))
              ) : (
                <option value={val}>{val}</option>
              )}
            </select>
            {field.choices && field.choices.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {field.choices.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleValueEdit(field, c)}
                    style={{
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: val === c ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: val === c ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: val === c ? '#a5b4fc' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        const selectedArr = Array.isArray(val) ? val : (val ? [val] : []);
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {field.choices && field.choices.length > 0 ? (
              field.choices.map((c, idx) => {
                const checked = selectedArr.includes(c);
                const toggleCheck = () => {
                  const newArr = checked 
                    ? selectedArr.filter(x => x !== c)
                    : [...selectedArr, c];
                  handleValueEdit(field, newArr);
                };
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={toggleCheck}
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: checked ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                      background: checked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: checked ? '#6ee7b7' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <CheckSquare size={14} style={{ color: checked ? 'var(--accent-emerald)' : 'var(--text-dim)' }} />
                    {c}
                  </button>
                );
              })
            ) : (
              <input
                type="text"
                className="input-control"
                value={Array.isArray(val) ? val.join(', ') : val}
                onChange={(e) => handleValueEdit(field, e.target.value)}
              />
            )}
          </div>
        );

      case 'paragraph':
        return (
          <textarea
            className="input-control"
            rows={3}
            value={val}
            onChange={(e) => handleValueEdit(field, e.target.value)}
          />
        );

      case 'scale':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {field.choices && field.choices.length > 0 ? (
              field.choices.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleValueEdit(field, c)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: val === String(c) ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    background: val === String(c) ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: val === String(c) ? '#67e8f9' : 'var(--text-muted)',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))
            ) : (
              <input
                type="text"
                className="input-control"
                value={val}
                onChange={(e) => handleValueEdit(field, e.target.value)}
              />
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            className="input-control"
            value={val}
            onChange={(e) => handleValueEdit(field, e.target.value)}
          />
        );
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Form Metadata Banner */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
              <Check size={12} /> Form Schema Loaded ({fields.length} Fields)
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>{formTitle}</h2>
            {formDescription && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                {formDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Wallet Inspector Selector Bar */}
      {wallets.length > 0 && (
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(6, 182, 212, 0.4)', background: 'rgba(15, 23, 42, 0.7)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#67e8f9', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wallet size={16} /> Inspect Form Data For All {wallets.length} Wallet Submissions:
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Select any wallet address below to preview its exact wallet address + auto-generated Twitter handle and proof URL!
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Wallet Run:</span>
              <select
                className="input-control"
                style={{ width: 'auto', minWidth: '220px', fontWeight: '600', color: '#a5b4fc', fontFamily: 'var(--font-mono)' }}
                value={selectedWalletIdx}
                onChange={(e) => setSelectedWalletIdx(parseInt(e.target.value) || 0)}
              >
                {wallets.map((w, idx) => (
                  <option key={idx} value={idx}>
                    #{idx + 1}: {w.substring(0, 10)}...{w.substring(w.length - 6)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Wallet Run Quick Info Badge */}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
              Active Preview Wallet: <strong>{wallets[selectedWalletIdx] || 'N/A'}</strong>
            </span>
            <span style={{ color: 'var(--text-dim)' }}>
              Showing Run #{selectedWalletIdx + 1} of {wallets.length} Total Submissions
            </span>
          </div>
        </div>
      )}

      {/* Field Inspection Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} style={{ color: 'var(--primary)' }} />
          Form Questions & Auto-Generated Answers Preview
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing data for Wallet Run #{selectedWalletIdx + 1}
        </span>
      </div>

      {/* Fields Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {fields.map((field, idx) => {
          const state = getFieldState(field);

          return (
            <div 
              key={field.entryId + '_' + idx} 
              className="glass-card"
              style={{ 
                padding: '1.25rem 1.5rem', 
                borderLeft: state.isPreset ? '4px solid var(--primary)' : '4px solid var(--accent-cyan)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {idx + 1}. {field.title}
                  </span>
                  {field.required && (
                    <span style={{ color: 'var(--accent-rose)', marginLeft: '6px', fontWeight: '700' }}>*</span>
                  )}
                  {field.description && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {field.description}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {state.isPreset ? (
                    <span className="badge badge-indigo">
                      <User size={10} /> {state.source}
                    </span>
                  ) : (
                    <span className="badge badge-cyan">
                      <Sparkles size={10} /> {state.source}
                    </span>
                  )}
                </div>
              </div>

              {/* Input rendering */}
              <div style={{ marginTop: '0.75rem' }}>
                {renderInputForField(field)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
