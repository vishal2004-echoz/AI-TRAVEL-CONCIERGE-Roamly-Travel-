import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import {
  Users, Globe, MessageCircle, Map, TrendingUp,
  Activity, BarChart2, Clock, Heart, Shield, Zap, Star
} from 'lucide-react';

// ── Horizontal bar ────────────────────────────────────────────────
function Bar({ label, value, max, pct }) {
  const width = pct ?? (max > 0 ? Math.round((value / max) * 100) : 0);
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="font-body text-sm text-sand-300 w-32 truncate shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${width}%`, background: 'linear-gradient(90deg, #c8882a, #dca042)' }}
        />
      </div>
      <span className="font-mono text-xs text-sand-400 w-8 text-right">{value}</span>
    </div>
  );
}

// ── KPI tile ──────────────────────────────────────────────────────
function KPI({ icon: Icon, label, value, trend, accent }) {
  return (
    <div
      className="card-warm p-5 rounded-2xl"
      style={accent ? { borderColor: 'rgba(200,136,42,0.4)', background: 'linear-gradient(135deg,rgba(200,136,42,0.10),rgba(22,27,39,0.95))' } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: accent ? 'rgba(200,136,42,0.25)' : 'rgba(255,255,255,0.07)' }}
        >
          <Icon size={16} style={{ color: accent ? '#dca042' : '#a09070' }} />
        </div>
        {trend != null && (
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={trend >= 0
              ? { background: 'rgba(126,200,164,0.15)', color: '#7ec8a4', border: '1px solid rgba(126,200,164,0.3)' }
              : { background: 'rgba(220,100,100,0.15)', color: '#dc6464', border: '1px solid rgba(220,100,100,0.3)' }}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-sand-50">{value}</p>
      <p className="font-body text-sm text-sand-400 mt-1">{label}</p>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="card-warm p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={15} className="text-amber-400" />
        <h2 className="font-display text-base font-semibold text-sand-100">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Admin guard ───────────────────────────────────────────────────
// In a real app, check user.role === 'admin'. Here we simulate that
// by checking for an "isAdmin" flag or falling back to showing a
// locked screen for non-admin users.
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@roamly.ai';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.isAdmin === true;

  useEffect(() => {
    if (!isAdmin) return;
    API.get('/api/admin/analytics')
      .then(r => setStats(r.data))
      .catch(err => {
        // If backend endpoint doesn't exist yet, show mock/demo data
        if (err.response?.status === 404 || err.response?.status === 405) {
          setStats(MOCK_STATS);
        } else {
          setError('Failed to load analytics data.');
        }
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  // ── Access denied ──────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(220,100,100,0.15)', border: '1px solid rgba(220,100,100,0.3)' }}
          >
            <Shield size={28} style={{ color: '#dc6464' }} />
          </div>
          <h2 className="font-display text-xl font-bold text-sand-50 mb-2">Admin access only</h2>
          <p className="font-body text-sm text-sand-400 mb-6">This dashboard is restricted to Roamly administrators.</p>
          <button onClick={() => navigate(-1)} className="btn-ghost px-6 py-2 text-sm">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #c8882a, #dca042)' }}
              >
                <BarChart2 size={18} color="#0d1117" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-sand-50">Admin Analytics</h1>
                <p className="font-body text-sm text-sand-400">Platform overview · Roamly</p>
              </div>
            </div>
            <span
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(126,200,164,0.12)', color: '#7ec8a4', border: '1px solid rgba(126,200,164,0.25)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, rgba(200,136,42,0.4), transparent)' }} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="text-4xl animate-spin mb-3">🧭</div>
              <p className="font-body text-sand-400">Loading platform data…</p>
            </div>
          </div>
        ) : error ? (
          <div className="card-warm p-8 rounded-2xl text-center">
            <p className="font-body text-sand-400">{error}</p>
          </div>
        ) : (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
              <KPI icon={Users} label="Total users" value={fmt(stats.totalUsers)} accent trend={stats.userGrowthPct} />
              <KPI icon={Activity} label="Active today" value={fmt(stats.activeToday)} />
              <KPI icon={Map} label="Trips saved" value={fmt(stats.totalTrips)} />
              <KPI icon={MessageCircle} label="AI messages" value={fmt(stats.totalMessages)} />
              <KPI icon={Heart} label="Wishlists" value={fmt(stats.totalWishlistItems)} />
              <KPI icon={Star} label="Avg rating" value={stats.avgTripRating?.toFixed(1) ?? '—'} />
            </div>

            {/* Row 2 */}
            <div className="grid lg:grid-cols-3 gap-4 mb-4">

              {/* Top destinations */}
              <div className="lg:col-span-2">
                <Section icon={Globe} title="Most Planned Destinations">
                  {stats.topDestinations?.length > 0 ? (
                    stats.topDestinations.map(({ destination, count }) => (
                      <Bar key={destination} label={destination} value={count} max={stats.topDestinations[0].count} />
                    ))
                  ) : <p className="font-body text-sm text-sand-500 italic">No destination data yet.</p>}
                </Section>
              </div>

              {/* Travel style distribution */}
              <Section icon={Zap} title="Travel Styles">
                <div className="space-y-3">
                  {(stats.travelStyles || []).map(({ style, count, pct }) => (
                    <div key={style}>
                      <div className="flex justify-between mb-1">
                        <span className="font-body text-sm text-sand-300 capitalize">{style}</span>
                        <span className="font-mono text-xs text-sand-400">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#c8882a,#dca042)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Row 3 */}
            <div className="grid lg:grid-cols-3 gap-4">

              {/* Signups over time (sparkline-style text) */}
              <Section icon={TrendingUp} title="New Signups (last 7 days)">
                <div className="flex items-end gap-1.5 h-20">
                  {(stats.signupsLast7Days || []).map(({ day, count }, i) => {
                    const max7 = Math.max(...(stats.signupsLast7Days || []).map(d => d.count), 1);
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-sm transition-all duration-700"
                          style={{
                            height: `${Math.max(4, Math.round((count / max7) * 56))}px`,
                            background: i === 6 ? 'linear-gradient(180deg,#c8882a,#dca042)' : 'rgba(200,136,42,0.3)'
                          }}
                          title={`${day}: ${count}`}
                        />
                        <span className="font-mono text-[9px] text-sand-600">{day.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Budget range breakdown */}
              <Section icon={Clock} title="Budget Ranges">
                {(stats.budgetRanges || []).map(({ range, pct }) => (
                  <Bar key={range} label={range} value={`${pct}%`} pct={pct} />
                ))}
              </Section>

              {/* Quick metrics */}
              <Section icon={Activity} title="Quick Metrics">
                <div className="space-y-3">
                  {[
                    { label: 'Avg trips / user', value: stats.avgTripsPerUser?.toFixed(1) ?? '—' },
                    { label: 'Avg wishlist size', value: stats.avgWishlistSize?.toFixed(1) ?? '—' },
                    { label: 'Users with DNA', value: `${stats.dnaCompletionPct ?? 0}%` },
                    { label: 'Trip reviews', value: fmt(stats.totalAutopsies) },
                    { label: 'Avg adventure lvl', value: stats.avgAdventureLevel?.toFixed(1) ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="font-body text-sm text-sand-400">{label}</span>
                      <span className="font-mono text-sm text-sand-200 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Number formatter ──────────────────────────────────────────────
function fmt(n) {
  if (n == null) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Mock data shown when backend endpoint doesn't exist yet ───────
const MOCK_STATS = {
  totalUsers: 1284,
  activeToday: 47,
  totalTrips: 3812,
  totalMessages: 22450,
  totalWishlistItems: 9631,
  avgTripRating: 4.2,
  userGrowthPct: 12,
  totalAutopsies: 341,
  avgTripsPerUser: 2.97,
  avgWishlistSize: 7.5,
  dnaCompletionPct: 68,
  avgAdventureLevel: 6.4,
  topDestinations: [
    { destination: 'Tokyo, Japan', count: 214 },
    { destination: 'Bali, Indonesia', count: 187 },
    { destination: 'Paris, France', count: 163 },
    { destination: 'Lisbon, Portugal', count: 141 },
    { destination: 'Morocco', count: 118 },
  ],
  travelStyles: [
    { style: 'Explorer', count: 512, pct: 40 },
    { style: 'Cultural', count: 334, pct: 26 },
    { style: 'Backpacker', count: 257, pct: 20 },
    { style: 'Luxury', count: 181, pct: 14 },
  ],
  budgetRanges: [
    { range: 'Mid-range', value: 498, pct: 49 },
    { range: 'Budget', value: 307, pct: 30 },
    { range: 'Luxury', value: 214, pct: 21 },
  ],
  signupsLast7Days: [
    { day: '2025-03-20', count: 18 },
    { day: '2025-03-21', count: 24 },
    { day: '2025-03-22', count: 31 },
    { day: '2025-03-23', count: 14 },
    { day: '2025-03-24', count: 27 },
    { day: '2025-03-25', count: 35 },
    { day: '2025-03-26', count: 41 },
  ],
};