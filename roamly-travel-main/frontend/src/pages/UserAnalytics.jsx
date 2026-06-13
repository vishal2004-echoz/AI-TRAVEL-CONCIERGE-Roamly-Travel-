import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSavedTrips, getChatHistory } from '../api';
import {
  BarChart2, Globe, Heart, MessageCircle, Map, Compass,
  TrendingUp, Clock, Star, Award, Zap, Calendar
} from 'lucide-react';

// ── Mini bar chart component ──────────────────────────────────────
function MiniBar({ label, value, max, color = '#c8882a' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="font-body text-sm text-sand-300 w-28 truncate shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }}
        />
      </div>
      <span className="font-mono text-xs text-sand-400 w-6 text-right">{value}</span>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <div
      className="card-warm p-5 rounded-2xl flex flex-col gap-2"
      style={accent ? { borderColor: 'rgba(200,136,42,0.4)', background: 'linear-gradient(135deg, rgba(200,136,42,0.10), rgba(22,27,39,0.95))' } : {}}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: accent ? 'rgba(200,136,42,0.25)' : 'rgba(255,255,255,0.07)' }}
        >
          <Icon size={16} style={{ color: accent ? '#dca042' : '#a09070' }} />
        </div>
        {accent && <span className="text-xs font-mono text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">top</span>}
      </div>
      <p className="font-display text-2xl font-bold text-sand-50">{value}</p>
      <p className="font-body text-sm text-sand-400 leading-snug">{label}</p>
      {sub && <p className="font-mono text-xs text-sand-500">{sub}</p>}
    </div>
  );
}

// ── Activity timeline dot ─────────────────────────────────────────
function TimelineDot({ label, time, type }) {
  const colors = { trip: '#c8882a', chat: '#6ea8d4', wish: '#7ec8a4' };
  const icons = { trip: Map, chat: MessageCircle, wish: Heart };
  const Icon = icons[type] || Compass;
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center mt-0.5 shrink-0"
        style={{ background: `${colors[type]}22`, border: `1px solid ${colors[type]}55` }}
      >
        <Icon size={13} style={{ color: colors[type] }} />
      </div>
      <div className="flex-1 pb-4 border-b border-white/5">
        <p className="font-body text-sm text-sand-200">{label}</p>
        <p className="font-mono text-xs text-sand-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ── Main component ────────────────────────────────────────────────
export default function UserAnalytics() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSavedTrips().then(r => setTrips(r.data.trips || [])).catch(() => {}),
      getChatHistory().then(r => setHistory(r.data.history || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const dna = user?.travelDNA || {};
  const wishlist = dna.wishlistDestinations || [];
  const visited = dna.visitedDestinations || [];
  const autopsies = user?.tripAutopsies || [];
  const interests = dna.topInterests || [];

  // Derive destination frequency from saved trips
  const destFreq = trips.reduce((acc, t) => {
    if (t.destination) acc[t.destination] = (acc[t.destination] || 0) + 1;
    return acc;
  }, {});
  const topDests = Object.entries(destFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxFreq = topDests[0]?.[1] || 1;

  // Chat stats
  const userMsgs = history.filter(m => m.role === 'user').length;
  const chatDays = history.length > 0
    ? Math.ceil((new Date(history.at(-1)?.timestamp) - new Date(history[0]?.timestamp)) / 86400000) + 1
    : 0;

  // Recent activity feed
  const feed = [
    ...trips.slice(-3).map(t => ({ label: `Saved trip to ${t.destination || 'unknown'}`, time: relativeTime(t.createdAt), type: 'trip' })),
    ...wishlist.slice(-2).map(d => ({ label: `Added ${d} to wishlist`, time: '', type: 'wish' })),
    ...history.slice(-2).map(m => ({ label: `Asked: "${m.content?.slice(0, 50)}…"`, time: relativeTime(m.timestamp), type: 'chat' })),
  ].slice(0, 8);

  // Rating avg
  const avgRating = autopsies.length
    ? (autopsies.reduce((s, a) => s + (a.rating || 0), 0) / autopsies.filter(a => a.rating).length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c8882a, #dca042)' }}
            >
              <BarChart2 size={18} color="#0d1117" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-sand-50">Your Travel Stats</h1>
              <p className="font-body text-sm text-sand-400">A snapshot of your Roamly journey, {user?.name?.split(' ')[0] || 'traveller'}</p>
            </div>
          </div>
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, rgba(200,136,42,0.4), transparent)' }} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="text-4xl animate-spin mb-3">🧭</div>
              <p className="font-body text-sand-400">Crunching your travel data…</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <StatCard icon={Map} label="Saved trips" value={trips.length} accent />
              <StatCard icon={Heart} label="Wishlist" value={wishlist.length} />
              <StatCard icon={Globe} label="Visited" value={visited.length} />
              <StatCard icon={MessageCircle} label="AI chats" value={userMsgs} />
              <StatCard icon={Star} label="Avg trip rating" value={avgRating} />
              <StatCard icon={Zap} label="Adventure level" value={`${dna.adventureLevel || 0}/10`} />
            </div>

            {/* Main grid: destinations + activity */}
            <div className="grid lg:grid-cols-3 gap-4 mb-4">

              {/* Top destinations */}
              <div className="lg:col-span-2 card-warm p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={15} className="text-amber-400" />
                  <h2 className="font-display text-base font-semibold text-sand-100">Most Planned Destinations</h2>
                </div>
                {topDests.length > 0 ? (
                  topDests.map(([dest, count]) => (
                    <MiniBar key={dest} label={dest} value={count} max={maxFreq} />
                  ))
                ) : (
                  <p className="font-body text-sm text-sand-500 italic">No trips saved yet — start planning!</p>
                )}
              </div>

              {/* Travel DNA quick view */}
              <div className="card-warm p-6 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.07), rgba(22,27,39,0.97))' }}>
                <div className="flex items-center gap-2 mb-5">
                  <Compass size={15} className="text-amber-400" />
                  <h2 className="font-display text-base font-semibold text-sand-100">Travel DNA</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Style', value: dna.travelStyle || '—' },
                    { label: 'Budget', value: dna.budgetRange || '—' },
                    { label: 'Climate', value: dna.preferredClimate || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="font-body text-xs text-sand-500 uppercase tracking-wider">{label}</span>
                      <span className="font-body text-sm text-sand-200 capitalize">{value}</span>
                    </div>
                  ))}
                  {interests.length > 0 && (
                    <div className="pt-2 border-t border-white/5">
                      <p className="font-body text-xs text-sand-500 uppercase tracking-wider mb-2">Interests</p>
                      <div className="flex flex-wrap gap-1.5">
                        {interests.slice(0, 5).map(i => (
                          <span key={i} className="stamp text-xs capitalize">{i}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Second row: engagement + recent activity */}
            <div className="grid lg:grid-cols-3 gap-4">

              {/* Engagement stats */}
              <div className="card-warm p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={15} className="text-amber-400" />
                  <h2 className="font-display text-base font-semibold text-sand-100">Engagement</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Calendar, label: 'Active days', value: chatDays },
                    { icon: MessageCircle, label: 'Messages sent', value: userMsgs },
                    { icon: Award, label: 'Trip reviews', value: autopsies.length },
                    { icon: Heart, label: 'Wish + visited', value: wishlist.length + visited.length },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-sand-500" />
                        <span className="font-body text-sm text-sand-300">{label}</span>
                      </div>
                      <span className="font-mono text-sm text-sand-200 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="lg:col-span-2 card-warm p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <Zap size={15} className="text-amber-400" />
                  <h2 className="font-display text-base font-semibold text-sand-100">Recent Activity</h2>
                </div>
                {feed.length > 0 ? (
                  <div>
                    {feed.map((item, i) => (
                      <TimelineDot key={i} {...item} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Globe size={32} className="text-sand-600 mb-3" />
                    <p className="font-body text-sm text-sand-500">Nothing yet — explore a destination to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}