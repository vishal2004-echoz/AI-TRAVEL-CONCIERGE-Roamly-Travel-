import { useState } from 'react';
import { ArrowRight, Brain, Briefcase, Coins, Compass, Map, Sparkles, Swords, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  analyzeDNA,
  budgetTruth,
  cultureCoach,
  destinationBattle,
  packingList,
  tripRoast,
  vibeSearch,
  whatIfSimulator,
} from '../api';
import PageHeader from '../components/PageHeader';

const TOOLS = [
  {
    icon: Sparkles,
    title: 'Vibe Search',
    badge: 'Discovery',
    route: '/explore',
    placeholder: 'cozy mountain town with hot springs and great food',
    run: (value) => vibeSearch(value),
    desc: 'Describe a feeling, not a place. Roamly translates mood into destinations.',
  },
  {
    icon: Swords,
    title: 'Destination Battle',
    badge: 'Compare',
    route: '/battle',
    placeholder: 'Japan vs South Korea for a 10-day first trip',
    run: (value) => {
      const [optionA, optionB] = value.split(' vs ').map((item) => item?.trim()).filter(Boolean);
      return destinationBattle({ optionA: optionA || value, optionB: optionB || 'Italy' });
    },
    desc: 'Put two destinations head-to-head and let AI argue both sides.',
  },
  {
    icon: Briefcase,
    title: 'Trip Roast',
    badge: 'Critique',
    route: '/roast',
    placeholder: 'Day 1: Land in Paris at 8am, Louvre, Versailles, Eiffel Tower...',
    run: (value) => tripRoast(value),
    desc: 'Paste your itinerary and get brutally honest feedback before reality does.',
  },
  {
    icon: Coins,
    title: 'Budget Truth',
    badge: 'Reality Check',
    route: '/budget',
    placeholder: '7 days in Bali, flights booked, budget is $1200',
    run: (value) => budgetTruth({ plan: value, details: value }),
    desc: 'Find the hidden costs, weak assumptions, and better tradeoffs in your budget.',
  },
  {
    icon: Brain,
    title: 'Travel DNA',
    badge: 'Personalized',
    route: '/dna',
    placeholder: 'I like slow travel, local cafes, train journeys, and moderate budgets',
    run: (value) => analyzeDNA([value]),
    desc: 'Turn preferences into a travel profile that improves every recommendation.',
  },
  {
    icon: Wand2,
    title: 'What If Simulator',
    badge: 'Scenario',
    route: '/what-if',
    placeholder: 'What if I travel Europe for 3 months after graduation?',
    run: (value) => whatIfSimulator(value),
    desc: 'Test alternate plans, timelines, and risky ideas before you commit.',
  },
  {
    icon: Compass,
    title: 'Culture Coach',
    badge: 'Confidence',
    route: '/concierge',
    placeholder: 'Japan, first-time traveler, business + leisure mix',
    run: (value) => cultureCoach(value),
    desc: 'Get local etiquette, expectations, and cultural context before you arrive.',
  },
  {
    icon: Map,
    title: 'Packing List AI',
    badge: 'Practical',
    route: '/itinerary',
    placeholder: '2 weeks in Vietnam during monsoon season, backpacking',
    run: (value) => packingList({ destination: value, details: value }),
    desc: 'Generate a smarter packing list from weather, duration, style, and activities.',
  },
];

function extractResult(data) {
  if (typeof data === 'string') return data;
  if (!data || typeof data !== 'object') return 'No response returned.';

  return (
    data.result ||
    data.response ||
    data.message ||
    data.summary ||
    data.analysis ||
    JSON.stringify(data, null, 2)
  );
}

function ToolModal({ tool, onClose }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const submit = async () => {
    if (!value.trim()) return;

    setLoading(true);
    setResult('');

    try {
      const response = await tool.run(value.trim());
      setResult(extractResult(response?.data));
    } catch (error) {
      setResult(error?.response?.data?.detail || 'The tool could not reach the backend. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="card-warm max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[28px] p-8" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="stamp mb-4">{tool.badge}</div>
            <h3 className="font-display text-3xl font-bold text-sand-50">{tool.title}</h3>
            <p className="mt-3 font-body leading-7 text-sand-400">{tool.desc}</p>
          </div>
          <button className="btn-ghost px-4 py-2" onClick={onClose}>Close</button>
        </div>

        <div className="mt-8">
          <textarea
            className="input-vintage min-h-36 resize-y"
            placeholder={tool.placeholder}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button className="btn-gold" onClick={submit} disabled={loading}>
              {loading ? 'Running...' : `Run ${tool.title}`}
            </button>
            <Link to={tool.route} className="btn-ghost inline-flex items-center justify-center gap-2">
              Open full page
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {result ? (
          <div className="mt-6 rounded-3xl border border-sand-200/10 bg-dusk-900/70 p-6">
            <div className="stamp mb-4">Result</div>
            <pre className="whitespace-pre-wrap font-body text-sm leading-7 text-sand-200">{result}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Features() {
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Roamly AI Tools"
        eyebrow="Your Toolkit"
        description="This is the stronger design layer merged into your app: a more polished feature showcase that still connects to your real backend."
      />

      <section className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="card-warm rounded-[28px] p-8 md:p-10">
              <div className="stamp mb-4">Built For Real Trips</div>
              <h2 className="font-display text-3xl font-bold text-sand-50 md:text-4xl">
                Inspiration, planning, and honest feedback in one place.
              </h2>
              <p className="mt-5 max-w-2xl font-body leading-8 text-sand-300">
                Your friend’s design had a strong marketing feel. This page keeps that energy, but now it is wired into the tools your project already exposes.
              </p>
            </div>

            <div className="card-warm rounded-[28px] p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="font-display text-3xl font-bold text-sand-50">8</div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-sand-500">AI tools surfaced</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-sand-50">1</div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-sand-500">unified experience</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;

              return (
                <button
                  key={tool.title}
                  type="button"
                  className="card-warm rounded-[24px] p-6 text-left transition-transform duration-300 hover:-translate-y-1"
                  onClick={() => setActiveTool(tool)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-500/10 text-sand-200">
                      <Icon size={22} />
                    </div>
                    <span className="stamp text-[10px]">{tool.badge}</span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-sand-100">{tool.title}</h3>
                  <p className="mt-3 font-body leading-7 text-sand-400">{tool.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-2 font-body text-sm text-sand-300">
                    Quick try
                    <ArrowRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {activeTool ? <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} /> : null}
    </div>
  );
}
