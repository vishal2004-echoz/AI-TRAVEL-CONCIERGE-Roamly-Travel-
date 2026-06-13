import { Compass, Globe2, ShieldCheck, Sparkles, Stars, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const VALUES = [
  {
    icon: Sparkles,
    title: 'AI with personality',
    desc: 'Roamly is meant to feel opinionated, useful, and human instead of generic and vague.',
  },
  {
    icon: Globe2,
    title: 'Real travel context',
    desc: 'We combine inspiration with planning tools so ideas can turn into actual trips.',
  },
  {
    icon: ShieldCheck,
    title: 'Honest guidance',
    desc: 'Budget reality, tradeoffs, rough edges, and smarter alternatives are part of the product.',
  },
];

const GUIDES = [
  { icon: Compass, name: 'Atlas', role: 'Adventure strategist' },
  { icon: Stars, name: 'Luna', role: 'Culture and curiosity expert' },
  { icon: Users2, name: 'Marco', role: 'Budget and practical planning lead' },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="About Roamly"
        eyebrow="Why We Built This"
        description="Roamly exists to make travel planning feel less like admin and more like discovery, without losing the useful details."
      />

      <section className="px-6 py-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-warm rounded-[28px] p-8 md:p-10">
            <h2 className="font-display text-3xl font-bold text-sand-50">The travel app with actual opinions.</h2>
            <p className="mt-5 font-body leading-8 text-sand-300">
              Most travel tools either stop at inspiration or drown you in options. Roamly tries to do the harder thing:
              understand your style, challenge weak plans, and help build trips that fit your budget, mood, and timing.
            </p>
            <p className="mt-4 font-body leading-8 text-sand-400">
              That means better exploration, sharper itineraries, more realistic budgets, and AI tools that feel like they
              are helping rather than filling space.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/features" className="btn-gold">
                Explore AI Tools
              </Link>
              <Link to="/signup" className="btn-ghost">
                Join Roamly
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-warm rounded-[24px] p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-500/10 text-sand-300">
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-xl font-semibold text-sand-100">{title}</h3>
                <p className="mt-3 font-body leading-7 text-sand-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="stamp mb-4">Meet The Crew</div>
            <h2 className="font-display text-3xl font-bold text-sand-50 md:text-4xl">Your AI travel specialists</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {GUIDES.map(({ icon: Icon, name, role }) => (
              <div key={name} className="card-warm rounded-[24px] p-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sand-500/10 text-sand-200">
                  <Icon size={28} />
                </div>
                <h3 className="font-display text-2xl font-semibold text-sand-100">{name}</h3>
                <p className="mt-2 font-body text-sand-400">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
