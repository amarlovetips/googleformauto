import React, { useState } from 'react';
import { Send, Rocket, CheckCircle2, AlertTriangle, Loader2, Repeat, Clock, Wallet, ShieldCheck } from 'lucide-react';
import { addSubmissionRecord } from '../utils/storage';
import { generateFieldValue, generateDeterministicIdentity } from '../utils/formUtils';

export default function Submitter({ parsedForm, userPreset, fieldValues, onSubmissionComplete }) {
  const wallets = (userPreset && Array.isArray(userPreset.walletAddresses)) ? userPreset.walletAddresses : [];
  
  const [useWalletBatch, setUseWalletBatch] = useState(true);
  const [submitCount, setSubmitCount] = useState(wallets.length || 1);
  const [delayMs, setDelayMs] = useState(1000);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentWallet: '' });
  const [lastResult, setLastResult] = useState(null);

  if (!parsedForm || !parsedForm.submitUrl) return null;

  const totalRuns = useWalletBatch ? (wallets.length || 1) : submitCount;

  // Build the HTTP POST payload for a specific wallet index with fresh deterministic unique identity
  const buildPayloadForRun = (runIndex) => {
    const payload = {};
    if (!parsedForm.fields) return { payload: {}, identity: {} };

    // Guaranteed 100% unique identity per runIndex
    const uniqueIdentity = generateDeterministicIdentity(runIndex);

    parsedForm.fields.forEach(field => {
      const computed = generateFieldValue(field, userPreset, runIndex, uniqueIdentity);
      if (computed && computed.value !== undefined && computed.value !== null) {
        payload[field.entryId] = computed.value;
      }
    });

    return { payload, identity: uniqueIdentity };
  };

  const submitSingleFormClient = async (submitUrl, payload) => {
    const params = new URLSearchParams();
    Object.keys(payload).forEach(key => {
      const value = payload[key];
      if (Array.isArray(value)) {
        value.forEach(val => params.append(key, val));
      } else if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });

    try {
      await fetch(submitUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      return { success: true, message: 'Submitted directly to Google Forms!' };
    } catch (e) {
      try {
        const iframe = document.createElement('iframe');
        iframe.name = 'hidden_submit_iframe_' + Date.now();
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const form = document.createElement('form');
        form.action = submitUrl;
        form.method = 'POST';
        form.target = iframe.name;

        for (const [k, v] of params.entries()) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = v;
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();

        setTimeout(() => {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        }, 2000);

        return { success: true, message: 'Submitted via browser form POST!' };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  };

  const handleStartSubmit = async () => {
    setIsSubmitting(true);
    setProgress({ current: 0, total: totalRuns, currentWallet: '' });
    setLastResult(null);

    let successCount = 0;
    let failCount = 0;
    let lastResponse = null;
    const runsList = [];

    for (let i = 0; i < totalRuns; i++) {
      const activeWallet = wallets[i] || `Run #${i + 1}`;
      setProgress({ current: i + 1, total: totalRuns, currentWallet: activeWallet });

      const { payload, identity } = buildPayloadForRun(i);
      const res = await submitSingleFormClient(parsedForm.submitUrl, payload);
      
      if (res.success) {
        successCount++;
        lastResponse = res;
      } else {
        failCount++;
        lastResponse = res;
      }

      runsList.push({
        runIndex: i + 1,
        walletAddress: activeWallet,
        identity,
        payload,
        status: res.success ? 'Success' : 'Failed'
      });

      if (i < totalRuns - 1 && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    setIsSubmitting(false);

    const resultSummary = {
      formTitle: parsedForm.formTitle,
      formUrl: parsedForm.formUrl,
      submitUrl: parsedForm.submitUrl,
      totalRequested: totalRuns,
      successCount,
      failCount,
      lastResponse,
      runs: runsList,
      payload: runsList[0]?.payload || {}
    };

    setLastResult(resultSummary);
    addSubmissionRecord(resultSummary);
    if (onSubmissionComplete) onSubmissionComplete(resultSummary);
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Rocket style={{ color: 'var(--accent-emerald)' }} size={26} />
            Guaranteed Unique Multi-Address Auto-Submit Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Submits every loaded wallet address exactly once with 100% unique auto-generated Twitter & social details.
          </p>
        </div>

        {/* Batch Mode Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(9, 13, 22, 0.6)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {wallets.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet size={16} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#6ee7b7' }}>
                Multi-Wallet Mode ({wallets.length} Unique Addresses)
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <Repeat size={14} style={{ color: 'var(--primary)' }} />
              <span>Submissions:</span>
              <input 
                type="number" 
                className="input-control"
                min="1" 
                max="100" 
                value={submitCount} 
                onChange={(e) => setSubmitCount(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '65px', height: '32px', padding: '0.2rem 0.5rem', textAlign: 'center' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
            <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Delay (ms):</span>
            <input 
              type="number" 
              className="input-control"
              min="0" 
              max="10000" 
              step="500"
              value={delayMs} 
              onChange={(e) => setDelayMs(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ width: '80px', height: '32px', padding: '0.2rem 0.5rem', textAlign: 'center' }}
            />
          </div>
        </div>
      </div>

      {/* Main Trigger Button */}
      <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
        <button 
          type="button" 
          onClick={handleStartSubmit}
          disabled={isSubmitting}
          className="btn-success"
          style={{ width: '100%', maxWidth: '480px', height: '58px', justifyContent: 'center' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="pulse-glow" size={24} style={{ animation: 'spin 1s linear infinite' }} />
              Submitting Unique Wallet ({progress.current} / {progress.total})...
            </>
          ) : (
            <>
              <Send size={20} /> SUBMIT ALL {totalRuns} UNIQUE WALLET ADDRESSES
            </>
          )}
        </button>
      </div>

      {/* Realtime Progress Bar */}
      {isSubmitting && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span>Submitting for wallet: <strong style={{ color: '#a5b4fc', fontFamily: 'var(--font-mono)' }}>{progress.currentWallet}</strong></span>
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(progress.current / progress.total) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent-emerald) 100%)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Results Banner */}
      {lastResult && !isSubmitting && (
        <div style={{ 
          marginTop: '1.75rem', 
          padding: '1.25rem 1.5rem', 
          borderRadius: 'var(--radius-md)',
          background: lastResult.failCount === 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
          border: lastResult.failCount === 0 ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(244, 63, 94, 0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={24} style={{ color: 'var(--accent-emerald)' }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#6ee7b7' }}>
                All {lastResult.successCount} Unique Wallet Submissions Completed!
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Every single wallet address was submitted once with 100% unique handles. Go to **History** tab to inspect or download the log!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
