import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { buildItinerary } from '../api';


const STYLES = ['Cultural', 'Adventure', 'Relaxation', 'Foodie', 'Backpacker', 'Luxury'];
const BUDGETS = ['Budget ($30-50/day)', 'Mid-range ($80-150/day)', 'Luxury ($200+/day)'];

const TRANSPORT_TABS = [
  { key: 'flight', label: 'Flight', emoji: '✈️' },
  { key: 'train', label: 'Train', emoji: '🚂' },
  { key: 'bus', label: 'Bus', emoji: '🚌' },
  { key: 'car', label: 'Car', emoji: '🚗' },
];

export default function Itinerary() {
  const location = useLocation();
  const incoming = location.state;

  const [form, setForm] = useState({
    destination: incoming?.prefill?.destination || '',
    days: incoming?.prefill?.days || 5,
    budget: incoming?.prefill?.budget || 'Mid-range ($80-150/day)',
    style: incoming?.prefill?.style || 'Cultural',
    interests: incoming?.prefill?.interests || '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(0);
  const [activeTransport, setActiveTransport] = useState('flight');
  const [showForm, setShowForm] = useState(!incoming?.autoGenerate);

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (incoming?.autoGenerate && incoming?.prefill?.destination) {
      generate(incoming.prefill);
    }
  }, []);

  const generate = async (overrideForm) => {
    const data = overrideForm || form;
    if (!data.destination.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setActiveDay(0);
    setActiveTransport('flight');
    try {
      const res = await buildItinerary(data);
      setResult(res.data);
      setShowForm(false);
    } catch {
      setError('Failed to generate itinerary. Please try again.');
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const getTransportOptions = () => {
    if (!result?.transportOptions) return null;
    return result.transportOptions[activeTransport] || null;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="stamp mb-3">AI Trip Planner</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sand-50 mb-3">
            Build Your Itinerary
          </h1>
          <p className="font-body text-sand-400 text-lg">Day-by-day plans with transport options & hotel estimates</p>
        </div>

        {/* Auto-generating banner */}
        {incoming?.autoGenerate && loading && (
          <div className="card-warm p-4 rounded-2xl mb-6 border border-amber-500/20 flex items-center gap-3"
            style={{ background: 'rgba(200,136,42,0.06)' }}>
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-body text-sand-100 text-sm font-medium">Building your trip from Agent plan...</p>
              <p className="font-body text-sand-400 text-xs">Destination: {form.destination} · {form.days} days · {form.style}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="card-warm p-8 rounded-3xl mb-8">
            {incoming?.prefill && (
              <div className="mb-6 p-3 rounded-xl border border-amber-500/20 flex items-center gap-2"
                style={{ background: 'rgba(200,136,42,0.06)' }}>
                <span>🤖</span>
                <p className="text-xs font-body text-sand-300">
                  Pre-filled from your Agent plan — fill in any missing details and generate!
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-sand-400 mb-2">DESTINATION</label>
                <input className="input-vintage w-full text-base" placeholder="e.g. Tokyo, Japan"
                  value={form.destination} onChange={e => handle('destination', e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-mono text-sand-400 mb-2">DURATION — {form.days} DAYS</label>
                <input type="range" min={2} max={21} value={form.days}
                  onChange={e => handle('days', parseInt(e.target.value))}
                  className="w-full accent-amber-500" />
                <div className="flex justify-between text-xs font-mono text-sand-500 mt-1">
                  <span>2</span><span>7</span><span>14</span><span>21</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-sand-400 mb-2">BUDGET LEVEL</label>
                <div className="flex flex-col gap-2">
                  {BUDGETS.map(b => (
                    <button key={b} onClick={() => handle('budget', b)}
                      className={`text-left px-3 py-2 rounded-xl text-sm font-body border transition-all
                        ${form.budget === b ? 'border-amber-500/50 bg-amber-500/10 text-sand-100' : 'border-white/10 text-sand-400 hover:border-white/20'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-sand-400 mb-2">TRAVEL STYLE</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(s => (
                    <button key={s} onClick={() => handle('style', s)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-body border transition-all
                        ${form.style === s ? 'border-amber-500/50 bg-amber-500/10 text-sand-100' : 'border-white/10 text-sand-400 hover:border-white/20'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-sand-400 mb-2">INTERESTS (optional)</label>
                <input className="input-vintage w-full"
                  placeholder="e.g. street food, temples, photography"
                  value={form.interests} onChange={e => handle('interests', e.target.value)} />
              </div>
            </div>

            <button onClick={() => generate()} disabled={loading || !form.destination.trim()}
              className="btn-gold w-full mt-6 py-4 text-base font-bold disabled:opacity-40">
              {loading ? '✨ Building your perfect trip...' : '🗺️ Generate Itinerary + Transport + Hotels'}
            </button>
          </div>
        )}

        {/* Edit toggle */}
        {result && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="mb-6 text-xs font-body text-sand-400 border border-white/10 hover:border-sand-400/30 px-4 py-2 rounded-xl transition-all">
            ✏️ Edit trip details
          </button>
        )}

        {error && <p className="text-center text-red-400 font-body mb-6">{error}</p>}

        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="card-warm h-24 shimmer rounded-2xl" />)}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 animate-in">

            {/* Trip header */}
            <div className="card-warm p-6 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.1), rgba(22,27,39,0.95))' }}>
              <p className="stamp mb-2">{result.days} Days · {form.style}</p>
              <h2 className="font-display text-2xl font-bold text-sand-50 mb-1">{result.theme}</h2>
              <p className="font-body text-sand-300">{result.intro}</p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div>
                  <p className="text-xs font-mono text-sand-500">TOTAL ESTIMATE</p>
                  <p className="font-display text-lg font-bold text-amber-400">{result.totalEstimate}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-sand-500">BEST STAY</p>
                  <p className="font-body text-sand-200 text-sm">{result.bestNeighborhood}</p>
                </div>
              </div>
            </div>

            

            {/* Transport Selector */}
            {result.transportOptions && (
              <div className="card-warm p-6 rounded-2xl">
                <h3 className="font-display text-lg font-semibold text-sand-100 mb-2">🚦 How are you travelling?</h3>
                <p className="text-xs font-mono text-sand-500 mb-4">Select a transport mode to see options & prices</p>
                <div className="flex gap-2 flex-wrap mb-5">
                  {TRANSPORT_TABS.map(tab => {
                    const hasData = result.transportOptions[tab.key]?.length > 0;
                    return (
                      <button key={tab.key} onClick={() => setActiveTransport(tab.key)} disabled={!hasData}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body border transition-all
                          ${activeTransport === tab.key
                            ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                            : hasData
                              ? 'border-white/10 text-sand-400 hover:border-white/20 hover:text-sand-200'
                              : 'border-white/5 text-sand-600 cursor-not-allowed opacity-40'}`}>
                        <span>{tab.emoji}</span>
                        <span>{tab.label}</span>
                        {hasData && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                            {result.transportOptions[tab.key].length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {getTransportOptions()?.length > 0 ? (
                  <div className="space-y-3">
                    {getTransportOptions().map((option, i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/5"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-body text-sand-100 font-medium text-sm">{option.name}</span>
                              {option.type && (
                                <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-sand-500 font-mono">
                                  {option.type}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-mono text-sand-500 mb-1">📍 {option.from} → {option.to}</p>
                            <div className="flex flex-wrap gap-3 text-xs font-mono text-sand-500 mt-2">
                              {option.duration && <span>⏱ {option.duration}</span>}
                              {option.frequency && <span>🔄 {option.frequency}</span>}
                              {option.bookingTip && <span className="text-sand-400 italic">💡 {option.bookingTip}</span>}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-display text-amber-400 font-bold text-sm">{option.price}</p>
                            {option.bestClass && <p className="text-xs text-sand-500 mt-0.5">{option.bestClass}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-body text-sand-500 text-center py-4">
                    No {activeTransport} options available for this route.
                  </p>
                )}

                {/* Booking links */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs font-mono text-sand-500 mb-3">🔗 BOOK ON REAL SITES</p>
                  <div className="flex flex-wrap gap-2">
                    {activeTransport === 'flight' && <>
                      <a href={`https://www.google.com/travel/flights/search?q=flights+to+${encodeURIComponent(form.destination)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-body border border-white/10 text-sand-300 hover:border-amber-500/30 hover:text-amber-300 transition-all">
                        ✈️ Google Flights
                      </a>
                      <a href="https://www.makemytrip.com/flights/" target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-body border border-white/10 text-sand-300 hover:border-amber-500/30 hover:text-amber-300 transition-all">
                        🎫 MakeMyTrip
                      </a>
                      <a href="https://www.skyscanner.co.in/" target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-body border border-white/10 text-sand-300 hover:border-amber-500/30 hover:text-amber-300 transition-all">
                        🔍 Skyscanner
                      </a>
                    </>}
                    {activeTransport === 'train' && <>
                      <a href="https://www.irctc.co.in/" target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-body border border-white/10 text-sand-300 hover:border-amber-500/30 hover:text-amber-300 transition-all">
                        🚂 IRCTC
                      </a>
                      <a href="https://www.confirmtkt.com/" target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-body border border-white/10 text-sand-300 hover:border-amber-500/30 hover:text-amber-300 transition-all">
                        🎫 ConfirmTkt
                      </a>
                    </>}
                    {activeTransport === 'bus' && <>
                      <a href="https://www.redbus.in/" target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-body border border-white/10 text-sand-300 hover:border-amber-500/30 hover:text-amber-300 transition-all">
                        🚌 RedBus
                      </a>
                      <a href="https://www.abhibus.com/" target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-body border border-white/10 text-sand-300 hover:border-amber-500/30 hover:text-amber-300 transition-all">
                        🚌 AbhiBus
                      </a>
                    </>}
                    {activeTransport === 'car' && <>
                      <a href="https://www.olacabs.com/" target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-body border border-white/10 text-sand-300 hover:border-amber-500/30 hover:text-amber-300 transition-all">
                        🚗 Ola
                      </a>
                      <a href="https://www.uber.com/in/en/" target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-body border border-white/10 text-sand-300 hover:border-amber-500/30 hover:text-amber-300 transition-all">
                        🚗 Uber
                      </a>
                      <a href="https://www.zoomcar.com/" target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-body border border-white/10 text-sand-300 hover:border-amber-500/30 hover:text-amber-300 transition-all">
                        🚗 Zoomcar
                      </a>
                    </>}
                  </div>
                  <p className="text-xs font-mono text-sand-600 mt-2">* AI estimates only — verify real prices before booking</p>
                </div>
              </div>
            )}

            {/* Hotel Recommendations */}
            {result.hotelRecommendations && (
              <div className="card-warm p-6 rounded-2xl">
                <h3 className="font-display text-lg font-semibold text-sand-100 mb-4 flex items-center gap-2">
                  🏨 Hotel Recommendations
                  <span className="text-xs font-mono text-sand-500 font-normal">(based on your budget & style)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {result.hotelRecommendations.map((h, i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/5"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="stamp text-xs">{h.type}</span>
                        <span className="font-display text-amber-400 font-bold text-sm">{h.pricePerNight}/night</span>
                      </div>
                      <h4 className="font-body text-sand-100 font-medium mb-1">{h.name}</h4>
                      <p className="text-xs font-mono text-sand-500 mb-2">📍 {h.neighborhood}</p>
                      <p className="text-xs font-body text-sand-400">{h.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day tabs */}
            <div>
              <div className="flex gap-2 flex-wrap mb-4">
                {result.itinerary?.map((day, i) => (
                  <button key={i} onClick={() => setActiveDay(i)}
                    className={`px-4 py-2 rounded-xl text-sm font-body transition-all
                      ${activeDay === i ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-sand-400 border border-white/10 hover:border-white/20'}`}>
                    Day {day.day}
                  </button>
                ))}
              </div>

              {result.itinerary?.[activeDay] && (() => {
                const day = result.itinerary[activeDay];
                return (
                  <div className="card-warm p-6 rounded-2xl">
                    <h3 className="font-display text-xl font-bold text-sand-50 mb-4">
                      Day {day.day} — {day.title}
                    </h3>
                    <div className="space-y-4">
                      {['morning', 'afternoon', 'evening'].map(time => day[time] && (
                        <div key={time} className="flex gap-4">
                          <div className="w-20 text-xs font-mono text-sand-500 uppercase pt-1 flex-shrink-0">
                            {time === 'morning' ? '🌅' : time === 'afternoon' ? '☀️' : '🌙'} {time}
                          </div>
                          <div className="flex-1 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <p className="font-body text-sand-200 font-medium">{day[time].activity}</p>
                            <p className="text-xs font-mono text-sand-500 mt-1">📍 {day[time].place} · ⏱ {day[time].duration}</p>
                            {day[time].tip && <p className="text-xs font-body text-sand-400 mt-1 italic">💡 {day[time].tip}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {day.eat && (
                      <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(200,136,42,0.05)', border: '1px solid rgba(200,136,42,0.1)' }}>
                        <p className="text-xs font-mono text-sand-400 mb-2">🍽️ WHERE TO EAT</p>
                        <div className="flex flex-wrap gap-4 text-sm font-body text-sand-300">
                          {day.eat.breakfast && <span>🌅 {day.eat.breakfast}</span>}
                          {day.eat.lunch && <span>☀️ {day.eat.lunch}</span>}
                          {day.eat.dinner && <span>🌙 {day.eat.dinner}</span>}
                        </div>
                      </div>
                    )}
                    {day.insiderSecret && (
                      <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(58,144,174,0.06)', border: '1px solid rgba(58,144,174,0.12)' }}>
                        <p className="text-xs font-body text-sand-300 italic">🃏 Insider: {day.insiderSecret}</p>
                      </div>
                    )}
                    <div className="mt-4">
                      <p className="text-xs font-mono text-sand-500">Daily budget: <span className="text-amber-400">{day.budget}</span></p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Packing + Cultural tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.packingEssentials?.length > 0 && (
                <div className="card-warm p-5 rounded-2xl">
                  <p className="text-xs font-mono text-sand-400 mb-3">🎒 PACKING ESSENTIALS</p>
                  <div className="flex flex-wrap gap-2">
                    {result.packingEssentials.map((item, i) => (
                      <span key={i} className="stamp text-xs">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.culturalTips?.length > 0 && (
                <div className="card-warm p-5 rounded-2xl">
                  <p className="text-xs font-mono text-sand-400 mb-3">🎭 CULTURAL TIPS</p>
                  <ul className="space-y-1">
                    {result.culturalTips.map((tip, i) => (
                      <li key={i} className="text-sm font-body text-sand-300 flex gap-2">
                        <span className="text-amber-500 flex-shrink-0">•</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}