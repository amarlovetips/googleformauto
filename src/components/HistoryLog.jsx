import React, { useState } from 'react';
import { History, Trash2, CheckCircle2, AlertCircle, ExternalLink, Code2, Clock, Download, FileText, ChevronDown, ChevronUp, Wallet, Send } from 'lucide-react';

export default function HistoryLog({ historyList, onClearHistory }) {
  const [selectedPayload, setSelectedPayload] = useState(null);

  if (!historyList || historyList.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <History size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>No Submission History Yet</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
          When you submit Google Forms, activity records listing every wallet address and its auto-generated details will appear here.
        </p>
      </div>
    );
  }

  // Generates and downloads plain text log file
  const downloadLogAsTxt = (item) => {
    const lines = [];
    lines.push('================================================================');
    lines.push('FORMPULSE AI - GOOGLE FORM SUBMISSION ACTIVITY LOG');
    lines.push(`Form Title: ${item.formTitle || 'Google Form'}`);
    lines.push(`Timestamp: ${new Date(item.timestamp).toLocaleString()}`);
    lines.push(`Total Unique Wallet Submissions: ${item.totalRequested}`);
    lines.push(`Successful: ${item.successCount}`);
    lines.push(`Form URL: ${item.formUrl || 'N/A'}`);
    lines.push('================================================================\n');

    if (item.runs && item.runs.length > 0) {
      item.runs.forEach((run, idx) => {
        lines.push(`--- SUBMISSION #${run.runIndex || (idx + 1)} ---`);
        lines.push(`Wallet Address  : ${run.walletAddress || 'N/A'}`);
        if (run.identity) {
          lines.push(`Full Name       : ${run.identity.fullName || 'N/A'}`);
          lines.push(`Email Address   : ${run.identity.email || 'N/A'}`);
          lines.push(`Twitter Handle  : ${run.identity.twitterHandle || 'N/A'}`);
          lines.push(`Tweet URL       : ${run.identity.tweetUrl || 'N/A'}`);
          lines.push(`Telegram Handle : ${run.identity.telegramHandle || 'N/A'}`);
          lines.push(`Telegram Post   : ${run.identity.telegramPostUrl || 'N/A'}`);
          lines.push(`Discord ID      : ${run.identity.discord || 'N/A'}`);
          lines.push(`Tx Hash         : ${run.identity.txHash || 'N/A'}`);
        }
        lines.push('Full Entry Payload Data:');
        if (run.payload) {
          Object.keys(run.payload).forEach(k => {
            lines.push(`  ${k}: ${JSON.stringify(run.payload[k])}`);
          });
        }
        lines.push('\n');
      });
    } else {
      lines.push('Payload Data:');
      lines.push(JSON.stringify(item.payload, null, 2));
    }

    const textContent = lines.join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const sanitizedTitle = (item.formTitle || 'form_submission').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `submission_log_${sanitizedTitle}_${Date.now()}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <History style={{ color: 'var(--accent-cyan)' }} size={24} />
              Submission Activity Log ({historyList.length} Batches)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Complete record of all submitted wallet addresses and their auto-generated Twitter & social proof details.
            </p>
          </div>

          <button 
            type="button" 
            onClick={onClearHistory}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', color: 'var(--accent-rose)' }}
          >
            <Trash2 size={14} /> Clear History
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {historyList.map((item) => {
            const isExpanded = selectedPayload === item.id;
            return (
              <div 
                key={item.id}
                style={{
                  background: 'rgba(9, 13, 22, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span className="badge badge-emerald"><CheckCircle2 size={10} /> {item.successCount} Unique Wallet Submissions</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={12} /> {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                      {item.formTitle || 'Google Form'}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => downloadLogAsTxt(item)}
                      className="btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                    >
                      <Download size={14} /> Download Log (.TXT)
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPayload(isExpanded ? null : item.id)}
                      className="btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                    >
                      <Code2 size={14} /> {isExpanded ? 'Hide All Submitted Data' : `View All (${item.runs ? item.runs.length : 1}) Wallet Data`}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Multi-Wallet Runs Table */}
                {isExpanded && (
                  <div style={{ 
                    marginTop: '1.25rem', 
                    padding: '1.25rem', 
                    background: 'rgba(5, 7, 12, 0.95)', 
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Wallet size={16} style={{ color: 'var(--primary)' }} /> List of Submitted Wallet Addresses & Unique Auto-Data:
                      </span>
                      <button
                        type="button"
                        onClick={() => downloadLogAsTxt(item)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'underline' }}
                      >
                        Download TXT Log File
                      </button>
                    </div>

                    {item.runs && item.runs.length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', borderBottom: '1px solid var(--border-color)' }}>
                              <th style={{ padding: '0.6rem 0.75rem' }}>#</th>
                              <th style={{ padding: '0.6rem 0.75rem' }}>Submitted Wallet Address</th>
                              <th style={{ padding: '0.6rem 0.75rem' }}>Twitter Handle</th>
                              <th style={{ padding: '0.6rem 0.75rem' }}>Tweet Link Proof</th>
                              <th style={{ padding: '0.6rem 0.75rem' }}>Telegram</th>
                              <th style={{ padding: '0.6rem 0.75rem' }}>Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.runs.map((run, rIdx) => (
                              <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: 'var(--accent-emerald)' }}>#{run.runIndex || (rIdx + 1)}</td>
                                <td style={{ padding: '0.6rem 0.75rem', color: '#fff', fontWeight: '600' }}>{run.walletAddress}</td>
                                <td style={{ padding: '0.6rem 0.75rem', color: '#67e8f9' }}>{run.identity?.twitterHandle || 'N/A'}</td>
                                <td style={{ padding: '0.6rem 0.75rem' }}>
                                  {run.identity?.tweetUrl ? (
                                    <a href={run.identity.tweetUrl} target="_blank" rel="noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>
                                      View Tweet &rarr;
                                    </a>
                                  ) : 'N/A'}
                                </td>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{run.identity?.telegramHandle || 'N/A'}</td>
                                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{run.identity?.email || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <pre style={{ color: '#a5b4fc', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                        {JSON.stringify(item.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
