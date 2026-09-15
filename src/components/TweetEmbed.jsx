import React, { useEffect } from 'react';
import { Twitter, Heart, MessageCircle, Repeat, ExternalLink, Sparkles } from 'lucide-react';

export default function TweetEmbed() {
  useEffect(() => {
    // Load Twitter platform widgets script dynamically
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    document.body.appendChild(script);

    return () => {
      // Cleanup script if needed
      try {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const tweetUrl = 'https://x.com/EarntapOfficial/status/2099739846332031334';

  return (
    <div className="glass-card" style={{ 
      padding: '1.25rem', 
      margin: '1.25rem auto 0', 
      maxWidth: '520px', 
      width: '100%',
      borderColor: 'rgba(99, 102, 241, 0.4)',
      background: 'rgba(15, 23, 42, 0.85)',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#a5b4fc' }}>
          <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
          Official Access Code Announcement Tweet
        </div>

        <a 
          href={tweetUrl} 
          target="_blank" 
          rel="noreferrer"
          style={{ fontSize: '0.78rem', color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}
        >
          <Twitter size={12} /> View on X <ExternalLink size={10} />
        </a>
      </div>

      {/* Official Twitter Widget Embed Container */}
      <div style={{ display: 'flex', justifyContent: 'center', minHeight: '120px' }}>
        <blockquote className="twitter-tweet" data-theme="dark" data-conversation="none">
          <p lang="en" dir="ltr">
            🔑 Access Code for FormPulse AI: <strong>I love Earntap</strong>
            <br />
            Like, RT &amp; Comment on this post to get updates!
          </p>
          &mdash; Earntap (@EarntapOfficial){' '}
          <a href={tweetUrl}>September 15, 2026</a>
        </blockquote>
      </div>

      {/* Direct Interactive Action Bar */}
      <div style={{ 
        marginTop: '0.75rem', 
        paddingTop: '0.65rem', 
        borderTop: '1px solid rgba(255,255,255,0.08)', 
        display: 'flex', 
        justify: 'space-around', 
        alignItems: 'center' 
      }}>
        <a 
          href={tweetUrl} 
          target="_blank" 
          rel="noreferrer" 
          style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <MessageCircle size={15} style={{ color: '#38bdf8' }} /> Comment
        </a>
        <a 
          href={tweetUrl} 
          target="_blank" 
          rel="noreferrer" 
          style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <Repeat size={15} style={{ color: '#34d399' }} /> Retweet
        </a>
        <a 
          href={tweetUrl} 
          target="_blank" 
          rel="noreferrer" 
          style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <Heart size={15} style={{ color: '#f472b6' }} /> Like
        </a>
      </div>
    </div>
  );
}
