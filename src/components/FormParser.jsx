import React, { useState } from 'react';
import { Link2, Sparkles, AlertCircle, ArrowRight, Loader2, FileText, CheckCircle2 } from 'lucide-react';

export default function FormParser({ onParseSuccess, isLoading, error }) {
  const [formUrl, setFormUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formUrl.trim()) return;
    onParseSuccess(formUrl.trim());
  };

  // Demo forms for instant testing
  const handlePasteDemo = (url) => {
    setFormUrl(url);
    onParseSuccess(url);
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

      <div style={{ maxWidth: '650px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="badge badge-indigo" style={{ marginBottom: '1rem' }}>
          <Sparkles size={12} /> Google Form Auto-Submitter & Filler
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: '1.2' }}>
          Paste Any <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Google Form Link</span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>
          Auto-populate your pre-set profile details, generate missing answers, and submit with one click.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Link2 style={{ position: 'absolute', left: '1.25rem', color: 'var(--primary)' }} size={20} />
            <input 
              type="text" 
              className="input-control" 
              style={{ paddingLeft: '3.25rem', paddingRight: '1rem', height: '54px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
              placeholder="Paste Google Form link (e.g. https://docs.google.com/forms/d/e/.../viewform)"
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
                Fetching & Analyzing Google Form...
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
            padding: '1rem', 
            background: 'rgba(244, 63, 94, 0.1)', 
            border: '1px solid rgba(244, 63, 94, 0.3)', 
            borderRadius: 'var(--radius-sm)',
            color: '#fda4af',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'left',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Parse Error:</strong> {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
