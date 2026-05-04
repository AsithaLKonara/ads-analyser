import React, { useState, useEffect } from 'react';
import { Search, Zap, TrendingUp, Filter, AlertCircle, Clock, ExternalLink } from 'lucide-react';

const App = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isDelayed, setIsDelayed] = useState(false);
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState(null);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setIsDelayed(true);
      }, 15000);
    } else {
      setIsDelayed(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(keyword)}`);
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCopy = async () => {
    if (!data || !data.strategy) return;
    setGeneratingCopy(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: data.intent, strategy: data.strategy })
      });
      const result = await response.json();
      setGeneratedCopy(result);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingCopy(false);
    }
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Ads Analyzer
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Real-time Facebook Ads Intelligence for Sri Lanka
        </p>
        
        <form onSubmit={handleSearch} className="search-bar fade-in" style={{ marginTop: '3rem' }}>
          <Search size={20} color="#94a3b8" style={{ marginLeft: '1.5rem' }} />
          <input 
            type="text" 
            placeholder="Describe your goal (e.g., 'sell a cheap AWS course for beginners in Sri Lanka')" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className={`btn-primary ${loading ? 'pulse' : ''}`} disabled={loading} style={{ position: 'relative' }}>
            {loading ? (isDelayed ? 'Deep Scanning...' : 'Analyzing...') : 'Analyze'}
          </button>
        </form>
        {loading && isDelayed && (
          <p className="fade-in pulse" style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem', marginTop: '-1rem' }}>
            Meta Ad Library is taking a moment to respond. Still searching...
          </p>
        )}
      </header>

      {error && (
        <div className="glass-card" style={{ borderColor: '#ef4444', color: '#ef4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {data && (
        <main className="fade-in">
          {data.strategy && (
            <div className="glass-card" style={{ marginBottom: '3rem', border: '1px solid var(--accent-primary)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-primary)' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent-primary)', margin: 0 }}>
                  <Zap size={20} fill="var(--accent-primary)" /> AI Strategy: {data.strategy.strategy_name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Market Saturation:</span>
                  <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: data.strategy.saturation_level === 'Low' ? '30%' : data.strategy.saturation_level === 'Medium' ? '60%' : '100%', 
                      height: '100%', 
                      background: data.strategy.saturation_level === 'Low' ? '#22c55e' : data.strategy.saturation_level === 'Medium' ? '#eab308' : '#ef4444' 
                    }}></div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{data.strategy.saturation_level}</span>
                </div>
              </div>
              
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>Winning Hook</label>
                  <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{data.strategy.recommended_hook}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>Target Audience</label>
                  <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{data.strategy.target_audience_summary}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>Price Point</label>
                  <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{data.strategy.price_strategy}</p>
                </div>
              </div>

              <div style={{ padding: '1.2rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px dashed rgba(139, 92, 246, 0.2)', fontSize: '0.95rem', lineHeight: '1.6', color: '#cbd5e1', marginBottom: '1.5rem' }}>
                <strong style={{ color: 'var(--accent-primary)' }}>AI Insight:</strong> {data.strategy.why_this_works}
              </div>

              <button 
                onClick={handleGenerateCopy}
                disabled={generatingCopy}
                className="tag" 
                style={{ width: '100%', padding: '1rem', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: '700', cursor: 'pointer', background: 'transparent' }}
              >
                {generatingCopy ? 'AI is writing...' : '✨ Generate Winning Ad Copy for this Strategy'}
              </button>

              {generatedCopy && (
                <div className="fade-in" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Suggested Ad Copy</h4>
                  <p style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{generatedCopy.headline}</p>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{generatedCopy.body}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="tag">{generatedCopy.cta}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Angle: {generatedCopy.hook_type}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Insights Panel */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <TrendingUp color="#8b5cf6" />
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>TOTAL ADS FOUND</h3>
              </div>
              <p style={{ fontSize: '2.5rem', fontWeight: '700' }}>{data.count}</p>
            </div>
            
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Zap color="#facc15" />
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>TRENDING HOOKS</h3>
              </div>
              <div className="tag-container">
                {data.insights.trendingHooks.map(hook => (
                  <span key={hook} className="badge badge-warning">{hook}</span>
                ))}
              </div>
            </div>
            
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Filter color="#ec4899" />
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>TOP CATEGORIES</h3>
              </div>
              <div className="tag-container">
                {data.insights.commonCategories.map(cat => (
                  <span key={cat} className="tag">{cat}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Ad Grid */}
          <h2 style={{ marginBottom: '2rem' }}>Currently Active Ads</h2>
          <div className="grid">
            {data.ads.map(ad => (
              <div key={ad.id} className="glass-card" style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {ad.advertiser[0]}
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{ad.advertiser}</h4>
                </div>

                {ad.imageUrl && <img src={ad.imageUrl} alt="Ad Creative" className="ad-image" />}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <span className={`badge ${ad.status === 'Probably Profitable' ? 'badge-success' : 'badge-warning'}`}>
                    {ad.status}
                  </span>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {ad.platforms.map(p => (
                      <span key={p} className="tag" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>{p}</span>
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#cbd5e1', marginBottom: '1.5rem', height: '80px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: '4', WebkitBoxOrient: 'vertical' }}>
                  {ad.text}
                </p>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <Clock size={12} />
                    {ad.startDate}
                  </div>
                  <button className="tag" style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    {ad.cta} <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
