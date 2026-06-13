import { useState } from 'react';
import { destinationBattle } from '../api';
import { Swords, Trophy, AlertCircle } from 'lucide-react';

export default function Battle() {
  const [dest1, setDest1] = useState('');
  const [dest2, setDest2] = useState('');
  const [style, setStyle] = useState('general');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fight = async () => {
    if (!dest1.trim() || !dest2.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await destinationBattle({ destination1: dest1, destination2: dest2, travelStyle: style });
      setResult(res.data);
    } catch (e) { } finally { setLoading(false); }
  };

  const ScoreBar = ({ score, name, winner }) => (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-body text-sm text-sand-300">{name}</span>
        <span className="font-mono text-sm text-sand-400">{score}/100</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="score-bar h-full rounded-full transition-all duration-1000"
          style={{ width: `${score}%`, background: winner ? 'linear-gradient(90deg, #c8882a, #dca042)' : 'linear-gradient(90deg, #3a90ae, #6ab4cb)' }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="stamp mb-4">⚔️ Destination Battle</p>
          <h1 className="font-display text-4xl font-bold text-sand-50 mb-3">Which Destination Wins?</h1>
          <p className="font-body text-sand-400">Roamly argues both sides. You decide.</p>
        </div>

        <div className="card-warm p-6 rounded-2xl mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sand-400 text-xs font-mono mb-2">DESTINATION 1</label>
              <input className="input-vintage" placeholder="e.g. Bali" value={dest1} onChange={e => setDest1(e.target.value)} />
            </div>
            <div>
              <label className="block text-sand-400 text-xs font-mono mb-2">DESTINATION 2</label>
              <input className="input-vintage" placeholder="e.g. Thailand" value={dest2} onChange={e => setDest2(e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sand-400 text-xs font-mono mb-2">TRAVEL STYLE</label>
            <select className="input-vintage" value={style} onChange={e => setStyle(e.target.value)}>
              {['general', 'solo', 'couple', 'family', 'backpacker', 'luxury', 'foodie', 'adventure'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <button onClick={fight} disabled={loading || !dest1.trim() || !dest2.trim()}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3">
            <Swords size={18} />
            {loading ? 'Roamly is judging...' : 'FIGHT! ⚔️'}
          </button>
        </div>

        {result && (
          <div className="space-y-4">
            {/* Winner */}
            <div className="card-warm p-6 rounded-2xl text-center"
              style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.12), rgba(22,27,39,0.95))' }}>
              <Trophy size={32} className="mx-auto mb-2" style={{ color: '#dca042' }} />
              <p className="font-mono text-sand-400 text-xs mb-1">ROAMLY'S VERDICT</p>
              <h2 className="font-display text-2xl font-bold text-sand-50 mb-2">🏆 {result.winner}</h2>
              <p className="font-body text-sand-300 text-sm">{result.winReason}</p>
            </div>

            {/* Score comparison */}
            <div className="card-warm p-6 rounded-2xl space-y-4">
              <ScoreBar score={result.dest1?.score} name={result.dest1?.name} winner={result.winner === result.dest1?.name} />
              <ScoreBar score={result.dest2?.score} name={result.dest2?.name} winner={result.winner === result.dest2?.name} />
            </div>

            {/* Side by side */}
            <div className="grid grid-cols-2 gap-4">
              {[result.dest1, result.dest2].map((d, i) => d && (
                <div key={i} className="card-warm p-5 rounded-2xl">
                  <h3 className="font-display font-semibold text-sand-100 mb-1">{d.name}</h3>
                  <p className="text-xs font-mono text-sand-500 mb-3">{d.bestFor}</p>
                  <div className="mb-3">
                    <p className="text-xs font-mono text-green-400 mb-1">STRENGTHS</p>
                    {d.strengths?.map((s, j) => <p key={j} className="text-sand-300 text-xs font-body">✓ {s}</p>)}
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-mono text-red-400 mb-1">WEAKNESSES</p>
                    {d.weaknesses?.map((w, j) => <p key={j} className="text-sand-400 text-xs font-body">✗ {w}</p>)}
                  </div>
                  <p className="text-xs font-mono text-sand-500 mb-1">SECRET WEAPON</p>
                  <p className="text-sand-300 text-xs font-body italic">✨ {d.secretWeapon}</p>
                </div>
              ))}
            </div>

            {/* Surprise */}
            {result.surprise && (
              <div className="card-warm p-5 rounded-2xl" style={{ background: 'rgba(58,144,174,0.06)' }}>
                <p className="text-xs font-mono text-ocean-400 mb-2">🃏 WILD CARD — CONSIDER THIS INSTEAD</p>
                <p className="font-body text-sand-300">{result.surprise}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
