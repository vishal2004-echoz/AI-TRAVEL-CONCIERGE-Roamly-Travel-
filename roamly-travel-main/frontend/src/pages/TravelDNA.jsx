import { useState } from 'react';
import { analyzeDNA } from '../api';
import { useAuth } from '../context/AuthContext';
import { Dna, ArrowRight } from 'lucide-react';

const QUESTIONS = [
  { id: 'pace', q: 'Your ideal travel pace?', options: ['One city deep-dive', 'Two or three stops', 'New place every day', 'I follow my mood'] },
  { id: 'accommodation', q: 'Where do you sleep best?', options: ['5-star hotel', 'Boutique guesthouse', 'Hostel with strangers', 'Airbnb in a neighborhood'] },
  { id: 'food', q: 'Your food philosophy?', options: ['Michelin-starred only', 'Popular local spots', 'Street food everywhere', 'Whatever is cheapest'] },
  { id: 'planning', q: 'How do you plan?', options: ['Every hour booked', 'Key things, rest flexible', 'First night only', 'Never plan, just go'] },
  { id: 'motivation', q: 'Why do you travel?', options: ['History & culture', 'Food & drink', 'Nature & adventure', 'To feel lost somewhere'] },
  { id: 'crowd', q: 'Tourist spots?', options: ['Love the classics', 'Mix of both', 'Mostly off the beaten path', 'Avoid tourists at all costs'] },
  { id: 'budget', q: 'Your honest budget?', options: ['Money is no object', 'Comfortable mid-range', 'Budget-conscious', 'Shoestring always'] },
  { id: 'social', q: 'Travel social life?', options: ['Complete solitude', 'Meet people occasionally', 'Love meeting locals', 'Non-stop social'] },
];

export default function TravelDNA() {
  const { user, setUser } = useAuth();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const allAnswered = QUESTIONS.every(q => answers[q.id]);

  const analyze = async () => {
    if (!allAnswered) return;
    setLoading(true);
    try {
      const res = await analyzeDNA(answers);
      setResult(res.data);
    } catch (e) { } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="stamp mb-4">🧬 Travel DNA</p>
          <h1 className="font-display text-4xl font-bold text-sand-50 mb-3">Discover Your Travel Personality</h1>
          <p className="font-body text-sand-400">8 questions. Roamly builds your traveler profile forever.</p>
        </div>

        {!result ? (
          <div className="space-y-4">
            {QUESTIONS.map((q, i) => (
              <div key={q.id} className="card-warm p-5 rounded-2xl">
                <p className="font-body font-medium text-sand-200 mb-3">
                  <span className="font-mono text-sand-500 text-sm mr-2">{i+1}.</span>
                  {q.q}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map(opt => (
                    <button key={opt} onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                      className={`p-3 rounded-xl text-sm font-body text-left transition-all border
                        ${answers[q.id] === opt
                          ? 'text-sand-900 border-sand-400/50'
                          : 'text-sand-300 border-white/8 hover:border-sand-400/20 hover:text-sand-100'}`}
                      style={answers[q.id] === opt ? { background: 'linear-gradient(135deg, #c8882a, #dca042)', borderColor: 'transparent' } : { background: 'rgba(255,255,255,0.03)' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={analyze} disabled={!allAnswered || loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-40">
              <Dna size={20} />
              {loading ? 'Analyzing your travel soul...' : 'Reveal My Travel DNA'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Personality card */}
            <div className="card-warm p-8 rounded-2xl text-center"
              style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.12), rgba(22,27,39,0.95))' }}>
              <div className="text-6xl mb-4">🧬</div>
              <h2 className="font-display text-2xl font-bold text-sand-50 mb-2">{result.travelPersonality}</h2>
              <p className="font-body text-sand-300 leading-relaxed mb-4">{result.description}</p>
              {result.travelQuote && (
                <p className="font-display italic text-sand-400 text-sm">"{result.travelQuote}"</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Adventure Level', val: `${result.adventureLevel}/10` },
                { label: 'Style', val: result.travelStyle },
                { label: 'Budget', val: result.budgetRange },
              ].map(s => (
                <div key={s.label} className="card-warm p-4 rounded-xl text-center">
                  <p className="text-xs font-mono text-sand-500 mb-1">{s.label.toUpperCase()}</p>
                  <p className="font-body font-semibold text-sand-100 capitalize">{s.val}</p>
                </div>
              ))}
            </div>

            {/* Perfect destinations */}
            {result.perfectDestinations?.length > 0 && (
              <div className="card-warm p-6 rounded-2xl">
                <p className="text-xs font-mono text-sand-400 mb-3">YOUR PERFECT DESTINATIONS</p>
                <div className="flex flex-wrap gap-2">
                  {result.perfectDestinations.map(d => <span key={d} className="stamp">{d}</span>)}
                </div>
              </div>
            )}

            {/* Interests */}
            {result.topInterests?.length > 0 && (
              <div className="card-warm p-6 rounded-2xl">
                <p className="text-xs font-mono text-sand-400 mb-3">YOU'RE DRIVEN BY</p>
                <div className="flex flex-wrap gap-2">
                  {result.topInterests.map(i => <span key={i} className="stamp capitalize">{i}</span>)}
                </div>
              </div>
            )}

            <button onClick={() => { setResult(null); setAnswers({}); }}
              className="btn-ghost w-full flex items-center justify-center gap-2 py-3">
              Retake Quiz <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
