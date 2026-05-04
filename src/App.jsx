import React, { useState, useEffect } from 'react';
import { Search, Zap, TrendingUp, Filter, AlertCircle, Clock, ExternalLink } from 'lucide-react';

const App = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

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
            placeholder="Search keywords (e.g., AWS course, IT training, Ecommerce...)" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </header>

      {error && (
        <div className="glass-card" style={{ borderColor: '#ef4444', color: '#ef4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {data && (
        <main className="fade-in">
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
