import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

const DESTINATIONS = ['Kyoto', 'Marrakech', 'Patagonia', 'Santorini', 'Varanasi', 'Havana', 'Cappadocia', 'Luang Prabang', 'Tirupathi', 'Goa'];

const FEATURES = [
  { icon: '🔮', title: 'Vibe Search', desc: 'Type feelings, not place names. "I want to feel ancient and overwhelmed."', to: '/features' },
  { icon: '😂', title: 'Trip Roast', desc: 'AI brutally reviews your itinerary and fixes it.', to: '/roast' },
  { icon: '⚔️', title: 'Destination Battle', desc: 'Bali vs Thailand — AI argues both sides. You pick.', to: '/battle' },
  { icon: '💸', title: 'Budget Truth Bomb', desc: 'The real cost. Not what travel blogs claim.', to: '/budget' },
  { icon: '🤔', title: 'What If Simulator', desc: 'Simulate "What if I quit and traveled Asia for 3 months?"', to: '/what-if' },
  { icon: '🧬', title: 'Travel DNA', desc: 'Your personal travel personality, built by AI.', to: '/dna' },
  { icon: '🗺️', title: 'Trip Planner', desc: 'Day-by-day itinerary with flight & hotel estimates.', to: '/itinerary' },
  { icon: '🤖', title: 'AI Agent', desc: 'Give a goal — Agent researches and plans everything for you.', to: '/agent' },
  { icon: '💬', title: 'Roamly Chat', desc: 'An AI with real opinions. Your most well-traveled friend.', to: '/concierge' },
];

const STATS = [
  { value: '10+', label: 'AI Travel Tools' },
  { value: '500+', label: 'Destinations' },
  { value: '100%', label: 'Free to Use' },
  { value: '0', label: 'Ads or Booking Fees' },
];

const STEPS = [
  { step: '01', emoji: '🔐', title: 'Create your account', desc: 'Sign up free in 30 seconds. No credit card needed.' },
  { step: '02', emoji: '🧬', title: 'Build your Travel DNA', desc: 'Tell Roamly your style, budget and interests. It remembers you.' },
  { step: '03', emoji: '🚀', title: 'Start exploring', desc: 'Use any of the 10+ AI tools to plan, explore and discover.' },
];

export default function Home() {
  const [destIndex, setDestIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setDestIndex(i => (i + 1) % DESTINATIONS.length);
        setVisible(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-animated" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(200,136,42,0.08) 0%, transparent 70%)'
        }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #c8882a, transparent)', filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #3a90ae, transparent)', filter: 'blur(40px)', animation: 'float 10s ease-in-out infinite reverse' }} />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border text-xs font-mono"
            style={{ background: 'rgba(200,136,42,0.1)', borderColor: 'rgba(200,136,42,0.3)', color: '#dca042' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Roamly is online — AI Travel Concierge
          </div>

          <h1 className="font-display font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', color: '#f5f0eb' }}>
            The only travel guide<br />
            <span className="italic" style={{ color: '#c8882a', textShadow: '0 0 40px rgba(200,136,42,0.3)' }}>
              with opinions.
            </span>
          </h1>

          <div className="mb-8 h-12 flex items-center justify-center">
            <p className="font-body text-xl text-sand-300">
              Right now, someone is planning{' '}
              <span className={`font-display italic font-semibold transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                style={{ display: 'inline-block', color: '#dca042' }}>
                {DESTINATIONS[destIndex]}
              </span>
            </p>
          </div>

          <p className="font-body text-sand-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Roamly is your AI travel companion with genuine opinions, honest advice, and the wisdom of a friend who's been everywhere. No booking. No ads. Just truth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-gold flex items-center gap-2 text-base px-8 py-4">
              Start Exploring Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost flex items-center gap-2 text-base px-8 py-4">
              Sign In
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sand-500 text-sm font-body">
            {['Free to use', 'No booking fees', 'AI-powered', 'Honest opinions'].map(t => (
              <span key={t} className="flex items-center gap-2">
                <Star size={12} className="text-sand-400" fill="currentColor" /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-sand-500 text-xs font-mono animate-bounce">
          <span>scroll</span>
          <div className="w-px h-8" style={{ background: 'linear-gradient(180deg, #c8882a, transparent)' }} />
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5"
        style={{ background: 'rgba(200,136,42,0.03)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold mb-1" style={{ color: '#dca042' }}>{stat.value}</p>
              <p className="font-mono text-sand-500 text-xs uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="stamp mb-4">Simple as it gets</p>
            <h2 className="font-display text-4xl font-bold text-sand-50">
              How Roamly works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="card-warm p-8 rounded-2xl text-center relative">
                <div className="text-5xl mb-4">{step.emoji}</div>
                <div className="font-mono text-xs mb-3" style={{ color: 'rgba(200,136,42,0.5)' }}>{step.step}</div>
                <h3 className="font-display font-semibold text-sand-100 text-lg mb-2">{step.title}</h3>
                <p className="font-body text-sand-400 text-sm leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-sand-600 text-xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="stamp mb-4">What Roamly can do</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-sand-50 mb-4">
            Every travel tool you need,<br /><span className="italic text-sand-400">finally done right.</span>
          </h2>
          <div className="divider-gold max-w-xs mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Link key={i} to={f.to}
              className="card-warm p-6 rounded-2xl group hover:border-sand-400/20 transition-all">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-display font-semibold text-sand-100 text-lg mb-2 group-hover:text-sand-50">{f.title}</h3>
              <p className="font-body text-sand-400 text-sm leading-relaxed">{f.desc}</p>
              <div className="flex items-center gap-1 mt-4 text-sand-500 text-xs font-body group-hover:text-sand-300 transition-all">
                Try it <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="card-warm p-12 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.08), rgba(22,27,39,0.9))' }}>
            <div className="text-6xl mb-6">🧭</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-sand-50 mb-4">
              Ready to travel smarter?
            </h2>
            <p className="font-body text-sand-400 mb-8">
              Your AI travel brain is ready. No booking fees, no ads, no BS — just honest travel intelligence.
            </p>
            <Link to="/signup" className="btn-gold inline-flex items-center gap-2 text-base px-10 py-4">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}