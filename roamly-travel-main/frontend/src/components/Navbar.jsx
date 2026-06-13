import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../api';
import { useAuth } from '../context/AuthContext';
import { Compass, Info, LogOut, Mail, Map, Menu, MessageCircle, Sparkles, User, X, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const appLinks = [
    { to: '/explore', label: 'Explore', icon: Map },
    { to: '/concierge', label: 'Roamly Chat', icon: MessageCircle },
    { to: '/agent', label: 'AI Agent', icon: Zap },
    { to: '/itinerary', label: 'Trip Planner', icon: Compass },
    { to: '/features', label: 'Tools', icon: Sparkles },
  ];

  const publicLinks = [
    { to: '/', label: 'Home', icon: Compass },
    { to: '/about', label: 'About', icon: Info },
    { to: '/features', label: 'AI Tools', icon: Sparkles },
    { to: '/contact', label: 'Contact', icon: Mail },
  ];

  const links = user ? appLinks : publicLinks;

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Ignore logout API failures and clear local auth state anyway.
    }

    logoutUser();
    navigate('/');
  };

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 px-6 py-4"
      style={{ background: 'linear-gradient(180deg, rgba(13,17,23,0.95) 0%, transparent 100%)', backdropFilter: 'blur(12px)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all group-hover:rotate-12"
            style={{ background: 'linear-gradient(135deg, #c8882a, #dca042)' }}
          >
            <Compass size={18} className="text-dusk-950" />
          </div>
          <div>
            <span className="font-display text-xl font-bold text-sand-50">ROAMLY</span>
            <span className="hidden sm:block -mt-1 text-xs font-mono text-sand-300">AI Travel Concierge</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-body transition-all duration-200 ${
                isActive(to)
                  ? 'border border-sand-400/30 bg-sand-500/20 text-sand-200'
                  : 'text-sand-300 hover:bg-white/5 hover:text-sand-100'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/profile" className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2 transition-all hover:bg-white/5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #c8882a, #dca042)', color: '#0d1117' }}
                >
                  {user.name?.[0]?.toUpperCase() || 'R'}
                </div>
                <span className="text-sm font-body text-sand-200">{user.name?.split(' ')[0] || 'Profile'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-sand-400 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex btn-ghost px-4 py-2 text-sm">Login</Link>
              <Link to="/signup" className="hidden sm:inline-flex btn-gold px-4 py-2 text-sm">Get Started</Link>
            </>
          )}

          <button onClick={() => setMenuOpen((open) => !open)} className="text-sand-300 md:hidden">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mx-auto mt-4 max-w-7xl rounded-2xl card-warm p-4 md:hidden">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sand-200 transition-all hover:bg-white/5"
            >
              <Icon size={16} className="text-sand-400" />
              {label}
            </Link>
          ))}

          <div className="divider-gold my-2" />

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sand-200 transition-all hover:bg-white/5"
              >
                <User size={16} className="text-sand-400" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-400 transition-all hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sand-200 transition-all hover:bg-white/5"
              >
                <User size={16} className="text-sand-400" />
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sand-200 transition-all hover:bg-white/5"
              >
                <Sparkles size={16} className="text-sand-400" />
                Get Started
              </Link>
            </>
          )}
        </div>
      ) : null}
    </nav>
  );
}
