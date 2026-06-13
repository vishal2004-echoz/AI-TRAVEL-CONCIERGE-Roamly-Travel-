import { useState } from 'react';
import { whatIfSimulator } from '../api';
import { Sparkles } from 'lucide-react';

const EXAMPLES = [
  "I quit my job and travel Southeast Asia for 3 months on $5000",
  "I work remotely and slow-travel Europe for 6 months",
  "I do a round-the-world trip in 12 months on $20,000",
  "I spend a full month living like a local in Japan",
];

export default function WhatIf() {
  const [scenario, setScenario] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const simulate = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await whatIfSimulator(scenario);
      setResult(res.data);
    } catch (e) { } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="stamp mb-4">🤔 What If Simulator</p>
          <h1 className="font-display text-4xl font-bold text-sand-50 mb-3">Simulate Your Dream Trip</h1>
          <p className="font-body text-sand-400">Describe your "what if" scenario. Roamly simulates what life would actually look like.</p>
        </div>

        <div className="card-warm p-6 rounded-2xl mb-6">
          <textarea className="input-vintage w-full h-28 resize-none text-sm mb-3"
            placeholder="What if I quit my job and traveled South America for 4 months on $8000?"
            value={scenario} onChange={e => setScenario(e.target.value)} />
          <div className="flex flex-wrap gap-2 mb-4">
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setScenario(ex)}
                className="text-xs font-body text-sand-500 border border-white/10 rounded-lg px-2 py-1 hover:text-sand-300 hover:border-sand-400/20 transition-all">
                {ex.slice(0, 40)}...
              </button>
            ))}
          </div>
          <button onClick={simulate} disabled={loading || !scenario.trim()}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3">
            <Sparkles size={18} />
            {loading ? 'Simulating your adventure...' : 'Simulate It 🌍'}
          </button>
        </div>

        {result && (
          <div className="space-y-4">
            {/* Header */}
            <div className="card-warm p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.08), rgba(22,27,39,0.95))' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl font-bold text-sand-50">{result.title}</h2>
                <div className="text-center">
                  <div className="text-2xl font-display font-bold" style={{ color: result.feasibility > 70 ? '#4ade80' : result.feasibility > 40 ? '#dca042' : '#f87171' }}>
                    {result.feasibility}%
                  </div>
                  <p className="text-xs font-mono text-sand-500">FEASIBLE</p>
                </div>
              </div>
              <p className="font-body text-sand-300">{result.summary}</p>
            </div>

            {/* Timeline */}
            {result.timeline?.length > 0 && (
              <div className="card-warm p-6 rounded-2xl">
                <h3 className="font-display font-semibold text-sand-100 mb-4">Month by Month</h3>
                <div className="space-y-4">
                  {result.timeline.map((t, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                          style={{ background: 'rgba(200,136,42,0.2)', color: '#dca042', border: '1px solid rgba(200,136,42,0.3)' }}>
                          {i+1}
                        </div>
                        {i < result.timeline.length - 1 && <div className="w-px flex-1 mt-2" style={{ background: 'rgba(200,136,42,0.15)' }} />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-display font-semibold text-sand-100">{t.month} — {t.location}</span>
                          <span className="stamp">{t.budget}</span>
                        </div>
                        <p className="text-sand-300 text-sm font-body mb-2">{t.experience}</p>
                        <p className="text-red-400 text-xs font-body">⚠ {t.challenge}</p>
                        <p className="text-green-400 text-xs font-body">✨ {t.highlight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget */}
            {result.totalBudget && (
              <div className="card-warm p-6 rounded-2xl">
                <h3 className="font-display font-semibold text-sand-100 mb-4">Real Budget Breakdown</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Minimum', val: result.totalBudget.minimum },
                    { label: 'Comfortable', val: result.totalBudget.comfortable },
                    { label: 'Breakdown', val: null },
                  ].filter(b => b.val).map(b => (
                    <div key={b.label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-xs font-mono text-sand-500 mb-1">{b.label}</p>
                      <p className="font-display font-bold text-sand-100">{b.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verdict */}
            <div className="card-warm p-6 rounded-2xl">
              <p className="text-xs font-mono text-sand-400 mb-3">🧭 ROAMLY'S VERDICT</p>
              <p className="font-body text-sand-200 leading-relaxed">{result.verdict}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
