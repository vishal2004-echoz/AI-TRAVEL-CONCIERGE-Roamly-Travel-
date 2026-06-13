import { useState } from 'react';
import { tripRoast } from '../api';
import { Flame, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

export default function TripRoast() {
  const [itinerary, setItinerary] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoast = async () => {
    if (!itinerary.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await tripRoast(itinerary);
      setResult(res.data);
    } catch (err) {
      setError('Roamly is catching their breath. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="stamp mb-4">😂 Trip Roast</p>
          <h1 className="font-display text-4xl font-bold text-sand-50 mb-3">
            Let Roamly Roast Your Itinerary
          </h1>
          <p className="font-body text-sand-400">Paste your travel plan. Brace yourself. Then get the improved version.</p>
        </div>

        <div className="card-warm p-6 rounded-2xl mb-6">
          <label className="block text-sand-300 text-sm font-body mb-3">Your planned itinerary:</label>
          <textarea className="input-vintage w-full h-40 resize-none text-sm"
            placeholder="Day 1: Fly to Rome at 6am. Then visit Colosseum, Vatican, Trevi Fountain, Pantheon, Borghese Gallery, and 4 restaurants all before 9pm..."
            value={itinerary} onChange={e => setItinerary(e.target.value)} />
          <button onClick={handleRoast} disabled={loading || !itinerary.trim()}
            className="btn-gold w-full mt-4 flex items-center justify-center gap-2 py-3">
            <Flame size={18} />
            {loading ? 'Roamly is reading this disaster...' : 'Roast My Trip 🔥'}
          </button>
        </div>

        {error && <p className="text-red-400 text-center font-body mb-6">{error}</p>}

        {result && (
          <div className="space-y-4 animate-in">
            {/* Score header */}
            <div className="card-warm p-6 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(22,27,39,0.95))' }}>
              <div className="text-6xl font-display font-bold mb-2" style={{ color: result.roastScore > 70 ? '#4ade80' : result.roastScore > 40 ? '#dca042' : '#f87171' }}>
                {result.roastScore}/100
              </div>
              <h2 className="font-display text-xl text-sand-100 mb-1">{result.roastTitle}</h2>
            </div>

            {/* Roasts */}
            <div className="space-y-3">
              {result.roasts?.map((r, i) => (
                <div key={i} className="card-warm p-5 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-body font-medium text-sand-200 mb-1">{r.issue}</p>
                      <p className="font-body text-red-300 text-sm italic mb-2">"{r.roast}"</p>
                      <div className="flex items-start gap-2">
                        <Wrench size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="font-body text-green-300 text-xs">{r.fix}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Verdict */}
            <div className="card-warm p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.08), rgba(22,27,39,0.95))' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-green-400" />
                <p className="font-mono text-sand-400 text-xs">ROAMLY'S VERDICT</p>
              </div>
              <p className="font-body text-sand-300 italic">{result.verdict}</p>
              {result.bestPart && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs font-mono text-sand-500 mb-1">ONE THING YOU GOT RIGHT ✓</p>
                  <p className="font-body text-sand-300 text-sm">{result.bestPart}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
