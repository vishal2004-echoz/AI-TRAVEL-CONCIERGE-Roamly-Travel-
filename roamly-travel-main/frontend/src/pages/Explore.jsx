import { useState } from 'react';
import { Search, MapPin, Sparkles, TrendingUp, Heart, Clock, Zap } from 'lucide-react';
import { exploreDestination, addToWishlist } from '../api';
import { Link } from 'react-router-dom';

const SUGGESTIONS = ['Tokyo', 'Lisbon', 'Marrakech', 'Bali', 'Cape Town', 'Kyoto', 'Buenos Aires', 'Istanbul'];

const TRENDING = [
  { name: 'Tokyo', country: 'Japan', emoji: '🗾', tag: 'Food & Culture', color: 'rgba(220,160,66,0.08)' },
  { name: 'Bali', country: 'Indonesia', emoji: '🌴', tag: 'Beach & Zen', color: 'rgba(58,144,100,0.08)' },
  { name: 'Paris', country: 'France', emoji: '🗼', tag: 'Romance', color: 'rgba(174,100,144,0.08)' },
  { name: 'Marrakech', country: 'Morocco', emoji: '🕌', tag: 'Adventure', color: 'rgba(200,100,42,0.08)' },
  { name: 'Kyoto', country: 'Japan', emoji: '⛩️', tag: 'History', color: 'rgba(100,144,58,0.08)' },
  { name: 'Cape Town', country: 'South Africa', emoji: '🏔️', tag: 'Nature', color: 'rgba(58,100,174,0.08)' },
];

const QUICK_ACTIONS = [
  { emoji: '🤖', label: 'Plan with Agent', desc: 'Full AI trip planner', to: '/agent' },
  { emoji: '🗺️', label: 'Build Itinerary', desc: 'Day-by-day plan', to: '/itinerary' },
  { emoji: '💸', label: 'Budget Truth', desc: 'Real cost breakdown', to: '/budget' },
  { emoji: '🎭', label: 'Culture Coach', desc: 'Dos & don\'ts', to: '/features' },
];

export default function Explore() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wishlisted, setWishlisted] = useState(false);

  const search = async (dest) => {
    const d = dest || query;
    if (!d.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    setWishlisted(false);
    try {
      const res = await exploreDestination({ destination: d });
      setData(res.data);
    } catch (err) {
      setError('Could not load destination. Try another name.');
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!data) return;
    await addToWishlist(data.destination.name);
    setWishlisted(true);
  };

  

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="stamp mb-3">Destination Intelligence</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sand-50 mb-3">
            Explore Anywhere
          </h1>
          <p className="font-body text-sand-400">Search a destination — get nearby gems, similar vibes, and honest intel.</p>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-400" />
              <input className="input-vintage pl-11 text-base" placeholder="Search any destination..."
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()} />
            </div>
            <button onClick={() => search()} disabled={loading} className="btn-gold px-6">
              {loading ? '...' : 'Explore'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQuery(s); search(s); }}
                className="px-3 py-1 rounded-full text-xs font-body text-sand-400 border border-white/10 hover:border-sand-400/30 hover:text-sand-200 transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-center text-red-400 font-body mb-8">{error}</p>}

        {loading && (
          <div className="max-w-2xl mx-auto space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card-warm p-6 shimmer h-24 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Default state */}
        {!data && !loading && (
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={18} className="text-sand-400" />
                <h2 className="font-display text-xl font-semibold text-sand-100">Trending Right Now</h2>
                <span className="text-sand-500 text-sm font-body">Click to explore instantly</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {TRENDING.map((dest, i) => (
                  <button key={i} onClick={() => { setQuery(dest.name); search(dest.name); }}
                    className="card-warm p-4 rounded-2xl text-left hover:border-sand-400/20 transition-all group"
                    style={{ background: dest.color }}>
                    <div className="text-3xl mb-2">{dest.emoji}</div>
                    <h3 className="font-display font-semibold text-sand-100 text-sm group-hover:text-sand-50">{dest.name}</h3>
                    <p className="font-mono text-sand-500 text-xs">{dest.country}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-body text-sand-400 border border-white/10">
                      {dest.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <Zap size={18} className="text-sand-400" />
                <h2 className="font-display text-xl font-semibold text-sand-100">What do you want to do?</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {QUICK_ACTIONS.map((action, i) => (
                  <Link key={i} to={action.to}
                    className="card-warm p-5 rounded-2xl flex flex-col gap-2 hover:border-sand-400/20 transition-all group">
                    <span className="text-3xl">{action.emoji}</span>
                    <h3 className="font-display font-semibold text-sand-100 text-sm group-hover:text-sand-50">{action.label}</h3>
                    <p className="font-body text-sand-500 text-xs">{action.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card-warm p-6 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.06), rgba(22,27,39,0.95))' }}>
              <p className="text-xs font-mono text-sand-500 mb-2">🧭 COMPASS TIP</p>
              <p className="font-body text-sand-300 text-sm">
                Don't just search famous cities — try searching <span className="text-sand-100 font-medium">"Tbilisi"</span>, <span className="text-sand-100 font-medium">"Kotor"</span>, or <span className="text-sand-100 font-medium">"Luang Prabang"</span> for hidden gems that will completely surprise you.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-8 animate-in">

            {/* Main destination card */}
            <div className="card-warm p-8 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.08), rgba(22,27,39,0.95))' }}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin size={20} className="text-sand-400" />
                    <span className="font-mono text-sand-400 text-sm">{data.destination.country}</span>
                    <span className="stamp">Safety {data.destination.safetyRating}/10</span>
                    <span className="stamp">{data.destination.crowdLevel} crowds</span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-sand-50 mb-2">
                    {data.destination.name}
                  </h2>
                  <p className="font-display italic text-sand-400 text-lg mb-4">{data.destination.tagline}</p>
                  <p className="font-body text-sand-300 leading-relaxed mb-6">{data.destination.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Budget/day', val: data.destination.budgetPerDay?.budget },
                      { label: 'Mid-range', val: data.destination.budgetPerDay?.midRange },
                      { label: 'Currency', val: data.destination.currency },
                      { label: 'Language', val: data.destination.language },
                    ].map(({ label, val }) => (
                      <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-sand-500 text-xs font-mono mb-1">{label}</p>
                        <p className="text-sand-100 font-body text-sm font-medium">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 min-w-fit">
                  <button onClick={handleWishlist}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body transition-all border
                      ${wishlisted ? 'text-red-400 border-red-400/30 bg-red-500/10' : 'text-sand-300 border-white/10 hover:border-sand-400/30'}`}>
                    <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
                    {wishlisted ? 'Wishlisted!' : 'Add to Wishlist'}
                  </button>
                </div>
              </div>

              {/* Best/avoid months */}
              <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-6">
                <div>
                  <p className="text-sand-500 text-xs font-mono mb-2 flex items-center gap-1"><Clock size={11} /> BEST TIME</p>
                  <div className="flex flex-wrap gap-1">
                    {data.destination.bestMonths?.map(m => <span key={m} className="stamp">{m}</span>)}
                  </div>
                </div>
                <div>
                  <p className="text-sand-500 text-xs font-mono mb-2">AVOID</p>
                  <div className="flex flex-wrap gap-1">
                    {data.destination.avoidMonths?.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded-full text-xs font-mono text-red-400 border border-red-400/20 bg-red-500/5">{m}</span>
                    ))}
                  </div>
                </div>
              </div>

              {data.unpopularOpinion && (
                <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(200,136,42,0.06)', border: '1px solid rgba(200,136,42,0.15)' }}>
                  <p className="text-sand-500 text-xs font-mono mb-1">🌶️ ROAMLY'S UNPOPULAR OPINION</p>
                  <p className="font-body text-sand-300 text-sm italic">{data.unpopularOpinion}</p>
                </div>
              )}
              {/* Photo Gallery */}
{data.photos?.length > 0 && (
  <div>
    <p className="text-sand-500 text-xs font-mono mb-3">📸 PHOTOS</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {data.photos.slice(0, 8).map((url, i) => (
        <div key={i} className="rounded-2xl overflow-hidden aspect-square">
          <img
            src={url}
            alt={`${data.destination.name} ${i + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  </div>
)}
            </div>

           

            {/* Nearby destinations */}
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link to={`/itinerary`}
                className="card-warm p-5 rounded-2xl flex items-center gap-4 hover:border-sand-400/20 transition-all"
                style={{ background: 'rgba(200,136,42,0.06)' }}>
                <span className="text-3xl">🗺️</span>
                <div>
                  <p className="font-display font-semibold text-sand-100">Plan a Trip Here</p>
                  <p className="text-xs font-body text-sand-400">Build full itinerary with transport</p>
                </div>
              </Link>
              <div className="card-warm p-5 rounded-2xl flex items-center gap-4"
                style={{ background: 'rgba(58,144,174,0.06)' }}>
                <span className="text-3xl">💰</span>
                <div>
                  <p className="font-display font-semibold text-sand-100">Budget: {data.destination.budgetPerDay?.budget}</p>
                  <p className="text-xs font-body text-sand-400">Per day on budget travel</p>
                </div>
              </div>
              <div className="card-warm p-5 rounded-2xl flex items-center gap-4"
                style={{ background: 'rgba(100,144,58,0.06)' }}>
                <span className="text-3xl">📅</span>
                <div>
                  <p className="font-display font-semibold text-sand-100">Best: {data.destination.bestMonths?.[0]}</p>
                  <p className="text-xs font-body text-sand-400">Ideal month to visit</p>
                </div>
              </div>
            </div>

            {/* Nearby destinations */}
            {data.nearby?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <MapPin size={18} className="text-sand-400" />
                  <h3 className="font-display text-xl font-semibold text-sand-100">Nearby — Worth the Detour</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.nearby.map((place, i) => (
                    <div key={i} className="card-warm p-5 rounded-2xl cursor-pointer"
                      onClick={() => { setQuery(place.name); search(place.name); }}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-display font-semibold text-sand-100">{place.name}</h4>
                        <span className="text-xs font-mono text-sand-500">{place.distance}</span>
                      </div>
                      <p className="font-body text-sand-400 text-sm mb-3">{place.why}</p>
                      <p className="font-body text-sand-300 text-xs italic">{place.uniqueThing}</p>
                      <div className="mt-3 flex items-center gap-1 text-sand-500 text-xs">
                        <span>{place.travelMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar vibes */}
            {data.similar?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={18} className="text-sand-400" />
                  <h3 className="font-display text-xl font-semibold text-sand-100">Same Vibe — Different World</h3>
                  <span className="text-sand-500 text-sm font-body">If you love this, you'll love these</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.similar.map((place, i) => (
                    <div key={i} className="card-warm p-5 rounded-2xl cursor-pointer"
                      onClick={() => { setQuery(place.name); search(place.name); }}>
                      <div className="stamp text-xs mb-3">{place.similarity}</div>
                      <h4 className="font-display font-semibold text-sand-100 mb-2">{place.name}</h4>
                      <p className="font-body text-sand-400 text-sm mb-2">{place.why}</p>
                      <p className="font-body text-sand-300 text-xs" style={{ color: '#dca042' }}>✨ {place.butBetter}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden gem */}
            {data.hiddenGem && (
              <div className="card-warm p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(58,144,174,0.08), rgba(22,27,39,0.95))' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🃏</span>
                  <div>
                    <p className="text-sand-500 text-xs font-mono">HIDDEN GEM — ALMOST NOBODY GOES HERE</p>
                    <h4 className="font-display font-semibold text-sand-100 text-lg">{data.hiddenGem.name}</h4>
                  </div>
                </div>
                <p className="font-body text-sand-300 mb-3">{data.hiddenGem.why}</p>
                <p className="font-body text-sand-400 text-sm italic">💡 {data.hiddenGem.insiderTip}</p>
              </div>
            )}

            {/* Smart route */}
            {data.smartRoute && (
              <div className="card-warm p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-sand-400" />
                  <h3 className="font-display text-lg font-semibold text-sand-100">{data.smartRoute.title}</h3>
                  <span className="stamp">{data.smartRoute.days} days</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {data.smartRoute.stops.map((stop, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <span className="font-body text-sand-200 text-sm">{stop}</span>
                      {i < data.smartRoute.stops.length - 1 && <span className="text-sand-500">→</span>}
                    </span>
                  ))}
                </div>
                <p className="font-body text-sand-400 text-sm">{data.smartRoute.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}