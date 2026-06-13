import { useState } from 'react';
import { budgetTruth } from '../api';
import { DollarSign, AlertTriangle } from 'lucide-react';

export default function BudgetTruth() {
  const [form, setForm] = useState({ destination: '', days: 7, people: 1, style: 'mid-range' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!form.destination.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await budgetTruth(form);
      setResult(res.data);
    } catch (e) { } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="stamp mb-4">💸 Budget Truth Bomb</p>
          <h1 className="font-display text-4xl font-bold text-sand-50 mb-3">The Real Cost of Travel</h1>
          <p className="font-body text-sand-400">No sponsored blog numbers. Just honest reality from Roamly.</p>
        </div>

        <div className="card-warm p-6 rounded-2xl mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sand-400 text-xs font-mono mb-2">DESTINATION</label>
              <input className="input-vintage" placeholder="e.g. Bali, Indonesia"
                value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
            </div>
            <div>
              <label className="block text-sand-400 text-xs font-mono mb-2">DAYS</label>
              <input type="number" min="1" max="60" className="input-vintage"
                value={form.days} onChange={e => setForm({...form, days: +e.target.value})} />
            </div>
            <div>
              <label className="block text-sand-400 text-xs font-mono mb-2">PEOPLE</label>
              <input type="number" min="1" max="10" className="input-vintage"
                value={form.people} onChange={e => setForm({...form, people: +e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sand-400 text-xs font-mono mb-2">TRAVEL STYLE</label>
              <select className="input-vintage" value={form.style} onChange={e => setForm({...form, style: e.target.value})}>
                {['budget backpacker', 'mid-range', 'comfortable', 'luxury'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={calculate} disabled={loading || !form.destination.trim()}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3">
            <DollarSign size={18} />
            {loading ? 'Calculating real costs...' : 'Drop the Truth Bomb 💣'}
          </button>
        </div>

        {result && (
          <div className="space-y-4">
            {/* Reality check */}
            <div className="card-warm p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(22,27,39,0.95))' }}>
              <p className="text-xs font-mono text-sand-500 mb-1">WHAT BLOGS CLAIM</p>
              <p className="font-body text-red-400 line-through mb-3">{result.blogClaims}</p>
              <p className="text-xs font-mono text-sand-500 mb-1">WHAT IT ACTUALLY COSTS</p>
              <p className="font-display text-2xl font-bold text-sand-50">{result.realityCheck}</p>
            </div>

            {/* Three tiers */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Minimum', val: result.totalMinimum, color: '#4ade80' },
                { label: 'Comfortable', val: result.totalComfortable, color: '#dca042' },
                { label: 'Luxury', val: result.totalLuxury, color: '#c084fc' },
              ].map(t => (
                <div key={t.label} className="card-warm p-4 rounded-xl text-center">
                  <p className="text-xs font-mono text-sand-500 mb-1">{t.label.toUpperCase()}</p>
                  <p className="font-display font-bold text-lg" style={{ color: t.color }}>{t.val}</p>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            {result.breakdown && (
              <div className="card-warm p-6 rounded-2xl">
                <h3 className="font-display font-semibold text-sand-100 mb-4">Reality vs. Blog Claims</h3>
                {Object.entries(result.breakdown).filter(([k]) => k !== 'hidden').map(([key, val]) => (
                  <div key={key} className="py-3 border-b border-white/5 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-body font-medium text-sand-200 capitalize">{key}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-red-400 text-xs">Blog: {val.blogSays}</span>
                      <span className="text-green-400 text-xs">Real: {val.realityIs}</span>
                    </div>
                    <p className="text-sand-500 text-xs mt-1">{val.whyDifference}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden costs */}
            {result.breakdown?.hidden?.length > 0 && (
              <div className="card-warm p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-sand-400" />
                  <p className="text-xs font-mono text-sand-400">HIDDEN COSTS NOBODY MENTIONS</p>
                </div>
                {result.breakdown.hidden.map((h, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="font-body text-sand-300 text-sm">{h.cost}</span>
                    <span className="font-mono text-sand-400 text-sm">{h.amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Verdict */}
            <div className="card-warm p-6 rounded-2xl">
              <p className="font-body text-sand-300 leading-relaxed">{result.verdict}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
