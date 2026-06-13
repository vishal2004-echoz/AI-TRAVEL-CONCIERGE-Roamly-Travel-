import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSavedTrips, deleteTrip } from '../api';
import { User, Map, Heart, Trash2, Compass, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    getSavedTrips()
      .then(res => setTrips(res.data.trips || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteTrip = async (id) => {
    await deleteTrip(id);
    setTrips(trips.filter(t => t._id !== id));
  };

  const dna = user?.travelDNA;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Profile header */}
        <div className="card-warm p-8 rounded-3xl mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.08), rgba(22,27,39,0.95))' }}>
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #c8882a, #dca042)', color: '#0d1117' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-sand-50">{user?.name}</h1>
              <p className="font-body text-sand-400">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {dna?.travelStyle && <span className="stamp capitalize">{dna.travelStyle}</span>}
                {dna?.budgetRange && <span className="stamp capitalize">{dna.budgetRange}</span>}
                {dna?.adventureLevel && <span className="stamp">Adventure {dna.adventureLevel}/10</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['overview', 'trips', 'wishlist'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-body capitalize transition-all
                ${activeTab === tab ? 'bg-sand-500/20 text-sand-200 border border-sand-400/30' : 'text-sand-400 hover:text-sand-200'}`}>
              {tab}
            </button>
          ))}

          {/* My Stats button */}
          <Link to="/analytics"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body text-sand-400 hover:text-sand-200 transition-all"
            style={{ border: '1px solid rgba(200,136,42,0.3)', background: 'rgba(200,136,42,0.08)' }}>
            <BarChart2 size={14} className="text-amber-400" />
            My Stats
          </Link>

          {/* Admin button — only visible to admins */}
          {user?.isAdmin && (
            <Link to="/admin/analytics"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body text-sand-400 hover:text-sand-200 transition-all"
              style={{ border: '1px solid rgba(200,136,42,0.3)', background: 'rgba(200,136,42,0.08)' }}>
              <BarChart2 size={14} className="text-amber-400" />
              Admin
            </Link>
          )}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-warm p-6 rounded-2xl">
              <p className="text-xs font-mono text-sand-400 mb-3">TRAVEL INTERESTS</p>
              <div className="flex flex-wrap gap-2">
                {dna?.topInterests?.length > 0
                  ? dna.topInterests.map(i => <span key={i} className="stamp capitalize">{i}</span>)
                  : <p className="text-sand-500 text-sm font-body">Take the Travel DNA quiz to unlock this!</p>}
              </div>
            </div>
            <div className="card-warm p-6 rounded-2xl">
              <p className="text-xs font-mono text-sand-400 mb-3">VISITED DESTINATIONS</p>
              {dna?.visitedDestinations?.length > 0
                ? <div className="flex flex-wrap gap-2">{dna.visitedDestinations.map(d => <span key={d} className="stamp">{d}</span>)}</div>
                : <p className="text-sand-500 text-sm font-body">No destinations recorded yet.</p>}
            </div>
            <div className="card-warm p-6 rounded-2xl col-span-full">
              <p className="text-xs font-mono text-sand-400 mb-4">QUICK ACTIONS</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/dna" className="btn-ghost flex items-center gap-2 text-sm py-2"><Compass size={15} /> Take Travel DNA Quiz</Link>
                <Link to="/explore" className="btn-ghost flex items-center gap-2 text-sm py-2"><Map size={15} /> Explore Destinations</Link>
                <Link to="/concierge" className="btn-ghost flex items-center gap-2 text-sm py-2"><User size={15} /> Chat with Roamly</Link>
              </div>
            </div>
          </div>
        )}

        {/* Trips tab */}
        {activeTab === 'trips' && (
          <div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="card-warm h-20 shimmer rounded-2xl" />)}
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🗺️</div>
                <p className="font-display text-sand-300 text-xl mb-2">No saved trips yet</p>
                <p className="font-body text-sand-500 mb-6">Build your first itinerary with Roamly</p>
                <Link to="/concierge" className="btn-gold inline-flex items-center gap-2">Start Planning</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {trips.map(trip => (
                  <div key={trip._id} className="card-warm p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-sand-100">{trip.destination}</h3>
                      <p className="font-body text-sand-400 text-sm">{trip.duration} days · {new Date(trip.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDeleteTrip(trip._id)}
                      className="text-sand-500 hover:text-red-400 transition-colors p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist tab */}
        {activeTab === 'wishlist' && (
          <div>
            {user?.travelDNA?.wishlistDestinations?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {user.travelDNA.wishlistDestinations.map(d => (
                  <div key={d} className="card-warm p-4 rounded-xl flex items-center gap-3">
                    <Heart size={16} className="text-red-400" fill="currentColor" />
                    <span className="font-body text-sand-200">{d}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">💝</div>
                <p className="font-display text-sand-300 text-xl mb-2">Wishlist is empty</p>
                <p className="font-body text-sand-500">Add destinations while exploring!</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}