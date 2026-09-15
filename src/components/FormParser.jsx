import React, { useState } from 'react';
import { Link2, Sparkles, AlertCircle, ArrowRight, Loader2, Code2, HelpCircle } from 'lucide-react';

export default function FormParser({ onParseSuccess, isLoading, error }) {
  const [formUrl, setFormUrl] = useState('');
  const [showManualHelp, setShowManualHelp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formUrl.trim()) return;
    onParseSuccess(formUrl.trim());
  };

  return (
    <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="badge badge-indigo" style={{ marginBottom: '1rem' }}>
          <Sparkles size={12} /> Google Form Auto-Submitter & Filler
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: '1.2' }}>
          Paste Any <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Google Form Link</span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Paste your Google Form URL, Pre-filled link, or Page Source Code below to parse all questions & entry IDs.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Link2 style={{ position: 'absolute', left: '1.25rem', color: 'var(--primary)' }} size={20} />
            <input 
              type="text" 
              className="input-control" 
              style={{ paddingLeft: '3.25rem', paddingRight: '1rem', height: '54px', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
              placeholder="Paste Google Form URL (e.g. https://docs.google.com/forms/d/e/.../viewform)"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading || !formUrl.trim()}
            style={{ height: '54px', justifyContent: 'center', fontSize: '1.05rem', borderRadius: 'var(--radius-md)' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="pulse-glow" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing Google Form Structure...
              </>
            ) : (
              <>
                Analyze & Auto-Fill Form <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {error && (
          <div style={{ 
            marginTop: '1.25rem', 
            padding: '1.25rem', 
            background: 'rgba(244, 63, 94, 0.1)', 
            border: '1px solid rgba(244, 63, 94, 0.3)', 
            borderRadius: 'var(--radius-sm)',
            color: '#fda4af',
            textAlign: 'left',
            fontSize: '0.88rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '700', marginBottom: '0.4rem', color: '#f87171' }}>
              <AlertCircle size={20} /> Unable to Fetch Form directly via Public Proxies
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
              This usually happens if the Google Form requires logging into a private Google account or blocks public CORS proxies.
            </p>

            <div style={{ padding: '0.75rem', background: 'rgba(9, 13, 22, 0.6)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <strong style={{ color: '#a5b4fc', display: 'block', marginBottom: '0.3rem' }}>💡 How to solve in 5 seconds:</strong>
              <ol style={{ marginLeft: '1.2rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                <li>Open the Google Form link in your browser.</li>
                <li>Right-click anywhere on the page &rarr; select <strong>View Page Source</strong> (or press Ctrl+U).</li>
                <li>Copy all text and paste it directly into the box above &rarr; click <strong>Analyze & Auto-Fill Form</strong>!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
