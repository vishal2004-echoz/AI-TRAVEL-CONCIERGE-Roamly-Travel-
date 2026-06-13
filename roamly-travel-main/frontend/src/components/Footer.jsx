import { Compass, Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { label: 'About', to: '/about' },
  { label: 'AI Tools', to: '/features' },
  { label: 'Explore', to: '/explore' },
  { label: 'Travel DNA', to: '/dna' },
  { label: 'Contact', to: '/contact' },
];

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="mt-24 border-t border-sand-200/10 bg-dusk-950/90">
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card-warm rounded-[28px] p-8 md:p-10">
            <div className="stamp mb-4">Stay In Orbit</div>
            <h2 className="font-display text-3xl font-bold text-sand-50 md:text-4xl">
              Travel ideas, AI upgrades, and smarter itineraries.
            </h2>
            <p className="mt-4 max-w-2xl font-body text-sand-400">
              Roamly is built for travelers who want fewer generic tips and more useful signal.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!user && (
                <Link to="/signup" className="btn-gold inline-flex items-center justify-center gap-2">
                  Create Free Account
                  <Sparkles size={16} />
                </Link>
              )}
              <Link to="/features" className="btn-ghost inline-flex items-center justify-center gap-2">
                Explore Tools
                <Send size={16} />
              </Link>
            </div>
          </div>

          <div className="card-warm rounded-[28px] p-8">
            <div className="stamp mb-4">Contact</div>
            <div className="space-y-4 font-body text-sand-300">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 text-sand-400" />
                <span>Built for travelers everywhere, from spontaneous weekends to full-scale escape plans.</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-sand-400" />
                <span>hello@roamly.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-sand-400" />
                <span>AI concierge support built into the app</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-sand-200/10 px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #c8882a, #dca042)' }}
              >
                <Compass size={20} className="text-dusk-950" />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-sand-50">ROAMLY</div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-sand-500">Travel Intelligence</div>
              </div>
            </Link>
            <p className="mt-4 max-w-sm font-body text-sm leading-7 text-sand-400">
              Your AI-powered travel companion for ideas, planning, comparisons, itineraries, and brutally honest advice.
            </p>
          </div>

          <div>
            <div className="font-display text-lg font-semibold text-sand-100">Explore</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-body text-sand-400">
              {LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="transition-colors hover:text-sand-100">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-display text-lg font-semibold text-sand-100">What Roamly does</div>
            <div className="mt-4 space-y-2 font-body text-sm text-sand-400">
              <p>Vibe search for places that match your mood.</p>
              <p>Trip planning with budgets, weather, and local context.</p>
              <p>AI agents that research and organize your next move.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-sand-200/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-sand-500 md:flex-row md:items-center md:justify-between">
          <p>Roamly. All rights reserved.</p>
          <p>Designed for curious travelers who want honest signal over noise.</p>
        </div>
      </section>
    </footer>
  );
}