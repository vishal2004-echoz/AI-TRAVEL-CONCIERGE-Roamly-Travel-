import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EXAMPLE_GOALS = [
  "Plan my 7-day trip to Tokyo on a mid-range budget, I love food and history",
  "I want a 5-day romantic trip to Paris in April, surprise me with hidden gems",
  "Compare Bali vs Thailand for a solo adventure backpacker trip of 10 days",
  "What if I quit my job and travel Southeast Asia for 3 months on $2000?",
  "Plan a 4-day budget trip to Rome including packing list and cultural tips",
];

const TOOL_ICONS = {
  vibe_search: "🔍", get_weather: "🌤️", get_country_info: "🌍",
  build_itinerary: "🗺️", budget_truth: "💰", packing_list: "🎒",
  culture_coach: "🎭", destination_intel: "🧭", what_if: "🤔", trip_roast: "🔥",
};

const TOOL_LABELS = {
  vibe_search: "Searching destinations by vibe",
  get_weather: "Checking weather & best time to visit",
  get_country_info: "Fetching country info & visa details",
  build_itinerary: "Building day-by-day itinerary",
  budget_truth: "Calculating real honest budget",
  packing_list: "Creating smart packing list",
  culture_coach: "Gathering cultural tips & etiquette",
  destination_intel: "Deep diving destination intel",
  what_if: "Simulating travel scenario",
  trip_roast: "Roasting & improving your plan",
};

function parseAnswerSections(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const sections = [];
  let current = null;
  for (const line of lines) {
    const isHeader = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s+.+/u.test(line.trim()) && line.trim().length < 80;
    if (isHeader) {
      if (current) sections.push(current);
      current = { title: line.trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      if (!sections[0]?.isIntro) sections.unshift({ isIntro: true, lines: [] });
      sections[0].lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.filter(s => s.title || s.lines.some(l => l.trim()));
}

function renderLine(line, i) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
    return (
      <div key={i} className="flex gap-2 text-sm font-body text-sand-300">
        <span className="text-amber-500 flex-shrink-0">•</span>
        <span>{trimmed.replace(/^[-•]\s*/, "")}</span>
      </div>
    );
  }
  return <p key={i} className="text-sm font-body text-sand-300">{trimmed}</p>;
}

function OverviewCard({ data }) {
  return (
    <div className="card-warm p-6 rounded-2xl"
      style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.1), rgba(22,27,39,0.95))' }}>
      <div className="mb-3">
        <p className="stamp mb-1">{data.overview?.bestFor || 'All travelers'}</p>
        <h2 className="font-display text-2xl font-bold text-sand-50">{data.title}</h2>
        <p className="font-body text-sand-400 text-sm mt-1 italic">"{data.verdict}"</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {[
          { label: 'Best Time', val: data.overview?.bestTime },
          { label: 'Daily Budget', val: data.overview?.budget },
          { label: 'Safety', val: data.overview?.safety || null },
          { label: 'Language', val: data.overview?.language },
          { label: 'Currency', val: data.overview?.currency },
        ].filter(i => i.val).map(({ label, val }) => (
          <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs font-mono text-sand-500 mb-1">{label}</p>
            <p className="text-sm font-body text-sand-100 font-medium">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HighlightsCard({ highlights }) {
  if (!highlights?.length) return null;
  return (
    <div className="card-warm p-6 rounded-2xl">
      <p className="text-xs font-mono text-sand-400 mb-4">✨ TOP HIGHLIGHTS</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {highlights.map((h, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-2xl flex-shrink-0">{h.emoji || '📍'}</span>
            <div>
              <p className="font-body text-sand-100 font-medium text-sm">{h.title}</p>
              <p className="font-body text-sand-400 text-xs mt-0.5">{h.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItineraryCard({ itinerary }) {
  const [activeDay, setActiveDay] = useState(0);
  if (!itinerary?.length) return null;
  const day = itinerary[activeDay];
  return (
    <div className="card-warm p-6 rounded-2xl">
      <p className="text-xs font-mono text-sand-400 mb-4">📅 DAY-BY-DAY ITINERARY</p>
      <div className="flex gap-2 flex-wrap mb-4">
        {itinerary.map((d, i) => (
          <button key={i} onClick={() => setActiveDay(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-body border transition-all
              ${activeDay === i ? 'border-amber-500/50 bg-amber-500/15 text-amber-300' : 'border-white/10 text-sand-400 hover:border-white/20'}`}>
            Day {d.day}
          </button>
        ))}
      </div>
      {day && (
        <div>
          <h4 className="font-display font-semibold text-sand-100 mb-3">{day.title}</h4>
          <div className="space-y-2">
            {[
              { time: '🌅 Morning', val: day.morning },
              { time: '☀️ Afternoon', val: day.afternoon },
              { time: '🌙 Evening', val: day.evening },
            ].filter(t => t.val).map(({ time, val }) => (
              <div key={time} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-xs font-mono text-sand-500 w-24 flex-shrink-0 pt-0.5">{time}</span>
                <p className="text-sm font-body text-sand-300">{val}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            {day.eat && <p className="text-xs font-body text-sand-400">🍽️ {day.eat}</p>}
            {day.budget && <p className="text-xs font-mono text-amber-400">{day.budget}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetCard({ budget }) {
  if (!budget) return null;
  const items = [
    { label: '🏨 Accommodation', val: budget.accommodation },
    { label: '🍜 Food', val: budget.food },
    { label: '🚌 Transport', val: budget.transport },
    { label: '🎭 Activities', val: budget.activities },
  ].filter(i => i.val);
  return (
    <div className="card-warm p-6 rounded-2xl">
      <p className="text-xs font-mono text-sand-400 mb-4">💰 BUDGET BREAKDOWN</p>
      <div className="space-y-2 mb-4">
        {items.map(({ label, val }) => (
          <div key={label} className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-sm font-body text-sand-300">{label}</span>
            <span className="text-sm font-mono text-amber-400 font-medium">{val}</span>
          </div>
        ))}
      </div>
      {budget.total && (
        <div className="p-3 rounded-xl border border-amber-500/20"
          style={{ background: 'rgba(200,136,42,0.08)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-body text-sand-200 font-medium">Total Estimate</span>
            <span className="font-display text-amber-400 font-bold">{budget.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MustEatCard({ mustEat }) {
  if (!mustEat?.length) return null;
  return (
    <div className="card-warm p-6 rounded-2xl">
      <p className="text-xs font-mono text-sand-400 mb-4">🍜 MUST EAT</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mustEat.map((item, i) => (
          <div key={i} className="p-3 rounded-xl border border-white/5"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-body text-sand-100 font-medium text-sm">{item.dish}</p>
              {item.price && <span className="text-xs font-mono text-amber-400">{item.price}</span>}
            </div>
            {item.where && <p className="text-xs font-body text-sand-500">📍 {item.where}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CultureCard({ tips }) {
  if (!tips?.length) return null;
  const dos = tips.filter(t => t.type === 'do');
  const donts = tips.filter(t => t.type === 'dont');
  return (
    <div className="card-warm p-6 rounded-2xl">
      <p className="text-xs font-mono text-sand-400 mb-4">🎭 CULTURAL TIPS</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dos.length > 0 && (
          <div>
            <p className="text-xs font-mono text-green-400 mb-2">✅ DO THIS</p>
            <div className="space-y-1">
              {dos.map((t, i) => (
                <div key={i} className="flex gap-2 text-sm font-body text-sand-300">
                  <span className="text-green-500 flex-shrink-0">•</span>
                  <span>{t.tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {donts.length > 0 && (
          <div>
            <p className="text-xs font-mono text-red-400 mb-2">❌ NEVER DO</p>
            <div className="space-y-1">
              {donts.map((t, i) => (
                <div key={i} className="flex gap-2 text-sm font-body text-sand-300">
                  <span className="text-red-500 flex-shrink-0">•</span>
                  <span>{t.tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PackingCard({ items }) {
  if (!items?.length) return null;
  return (
    <div className="card-warm p-5 rounded-2xl">
      <p className="text-xs font-mono text-sand-400 mb-3">🎒 PACKING ESSENTIALS</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="stamp text-xs">{item}</span>
        ))}
      </div>
    </div>
  );
}

function HiddenGemCard({ gem, warnings }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {gem && (
        <div className="card-warm p-5 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(58,144,174,0.08), rgba(22,27,39,0.95))' }}>
          <p className="text-xs font-mono text-sand-400 mb-2">🃏 HIDDEN GEM</p>
          <p className="text-sm font-body text-sand-300 italic">{gem}</p>
        </div>
      )}
      {warnings?.length > 0 && (
        <div className="card-warm p-5 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(22,27,39,0.95))' }}>
          <p className="text-xs font-mono text-red-400 mb-2">⚠️ WATCH OUT</p>
          <div className="space-y-1">
            {warnings.map((w, i) => (
              <div key={i} className="flex gap-2 text-xs font-body text-sand-400">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Extract itinerary params from agent goal & data ───────────────
function extractItineraryParams(goal, data) {
  const params = {
    destination: data?.destination || '',
    days: 7,
    budget: 'Mid-range ($80-150/day)',
    style: 'Cultural',
    interests: '',
  };

  // Extract days from goal
  const daysMatch = goal.match(/(\d+)[\s-]*day/i);
  if (daysMatch) params.days = parseInt(daysMatch[1]);

  // Extract budget from goal
  if (/budget|cheap|backpacker/i.test(goal)) params.budget = 'Budget ($30-50/day)';
  else if (/luxury|high.end|premium/i.test(goal)) params.budget = 'Luxury ($200+/day)';
  else if (/mid.range|moderate/i.test(goal)) params.budget = 'Mid-range ($80-150/day)';

  // Extract style from goal
  if (/food|foodie|eat|cuisine/i.test(goal)) params.style = 'Foodie';
  else if (/adventure|trek|hike|outdoor/i.test(goal)) params.style = 'Adventure';
  else if (/relax|beach|spa|peaceful/i.test(goal)) params.style = 'Relaxation';
  else if (/culture|history|temple|museum/i.test(goal)) params.style = 'Cultural';
  else if (/backpack|hostel|solo/i.test(goal)) params.style = 'Backpacker';
  else if (/luxury|premium|fine/i.test(goal)) params.style = 'Luxury';

  // Extract interests from goal
  const interestKeywords = goal.replace(/plan|trip|day|budget|mid-range|luxury/gi, '').trim();
  params.interests = interestKeywords.slice(0, 100);

  return params;
}

// ── Main Component ────────────────────────────────────────────────
export default function Agent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('roamly_token');
  const [goal, setGoal]         = useState("");
  const [running, setRunning]   = useState(false);
  const [activeSteps, setActiveSteps] = useState([]);
  const [result, setResult]     = useState(null);
  const [status, setStatus]     = useState("idle");
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSteps, result]);

  const runAgent = async () => {
    if (!goal.trim() || running) return;
    setRunning(true);
    setActiveSteps([]);
    setResult(null);
    setStatus("running");

    try {
      const res = await fetch(`${API}/api/ai/agent/run-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: goal }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data.steps?.length > 0) {
        for (const step of data.steps) {
          setActiveSteps(s => [...s, step]);
          await new Promise(r => setTimeout(r, 400));
        }
      }

      setResult(data);
      setStatus("done");

    } catch (err) {
      setStatus("error");
      setActiveSteps(s => [...s, { type: "error", message: err.message }]);
    } finally {
      setRunning(false);
    }
  };

  const handleMakeTrip = () => {
    const d = result?.structured ? result.data : null;
    const params = extractItineraryParams(goal, d);

    // Check if we have enough info to auto-generate
    const hasDestination = !!params.destination;
    const hasDays = !!params.days;

    navigate('/itinerary', {
      state: {
        prefill: params,
        autoGenerate: hasDestination && hasDays,
      }
    });
  };

  const d = result?.structured ? result.data : null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="stamp mb-3">AI Travel Agent</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sand-50 mb-3">🤖 Roamly Agent</h1>
          <p className="font-body text-sand-400 text-lg max-w-xl mx-auto">
            Give me a travel goal — I'll use multiple AI tools to build your perfect trip.
          </p>
        </div>

        {/* Input */}
        <div className="card-warm p-6 rounded-2xl mb-6">
          <label className="block text-xs font-mono text-sand-400 mb-2">🎯 YOUR TRAVEL GOAL</label>
          <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={3}
            placeholder="e.g. Plan my 7-day trip to Tokyo on a mid-range budget, I love food and history..."
            className="input-vintage w-full resize-none text-sm" />
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_GOALS.map((eg, i) => (
              <button key={i} onClick={() => setGoal(eg)}
                className="text-xs text-sand-400 border border-white/10 hover:border-sand-400/30 hover:text-sand-200 px-3 py-1 rounded-full transition font-body">
                {eg.slice(0, 45)}…
              </button>
            ))}
          </div>
          <button onClick={runAgent} disabled={running || !goal.trim()}
            className="btn-gold w-full mt-4 py-3 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed">
            {running ? "🧠 Agent is working..." : "🚀 Run AI Agent"}
          </button>
        </div>

        {/* Running */}
        {running && (
          <div className="flex items-center gap-3 text-sand-400 text-sm py-3 font-body">
            {[0, 0.15, 0.3].map((d, i) => (
              <div key={i} className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
            ))}
            <span>Agent is researching your trip...</span>
          </div>
        )}

        {/* Live tool steps */}
        {activeSteps.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-mono text-sand-500 mb-3">⚡ TOOLS USED</p>
            <div className="flex flex-wrap gap-2">
              {activeSteps.map((step, i) => (
                step.type === "tool_use" ? (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-green-700/30 bg-green-900/10 text-xs font-body text-sand-300">
                    <span>{TOOL_ICONS[step.tool] || "⚙️"}</span>
                    <span>{TOOL_LABELS[step.tool] || step.tool}</span>
                    <span className="text-green-400">✓</span>
                  </div>
                ) : step.type === "error" ? (
                  <div key={i} className="px-3 py-1.5 rounded-xl border border-red-700/30 bg-red-900/10 text-xs text-red-300">
                    ❌ {step.message}
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && status === "done" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">✅</span>
              <div>
                <h2 className="font-display text-xl font-bold text-sand-50">Mission Complete!</h2>
                <p className="text-xs font-mono text-sand-500">{activeSteps.length} tools used · Full travel plan below</p>
              </div>
            </div>

            {d ? (
              <div className="space-y-4">
                <OverviewCard data={d} />
                <HighlightsCard highlights={d.highlights} />
                <ItineraryCard itinerary={d.itinerary} />
                <BudgetCard budget={d.budget} />
                <MustEatCard mustEat={d.mustEat} />
                <CultureCard tips={d.culturalTips} />
                <PackingCard items={d.packingEssentials} />
                <HiddenGemCard gem={d.hiddenGem} warnings={d.warnings} />
              </div>
            ) : (
              <div className="space-y-3">
                {parseAnswerSections(result.answer).map((section, i) => (
                  <div key={i} className="card-warm rounded-2xl p-5">
                    {section.title && <h3 className="font-display font-semibold text-sand-100 text-base mb-3">{section.title}</h3>}
                    <div className="space-y-1.5">
                      {section.lines.map((line, j) => renderLine(line, j))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 🗺️ Make a Trip CTA */}
            <div className="mt-6 card-warm p-6 rounded-2xl border border-amber-500/20"
              style={{ background: 'linear-gradient(135deg, rgba(200,136,42,0.08), rgba(22,27,39,0.95))' }}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-sand-50">Ready to make it official? 🎒</h3>
                  <p className="font-body text-sand-400 text-sm mt-1">
                    Turn this plan into a full day-by-day itinerary with transport options and hotel recommendations.
                  </p>
                </div>
                <button onClick={handleMakeTrip}
                  className="btn-gold px-8 py-3 text-base font-bold flex-shrink-0 flex items-center gap-2">
                  🗺️ Make a Trip
                </button>
              </div>
            </div>
          </div>
        )}

        {status === "error" && !running && (
          <p className="mt-4 text-center text-red-400 text-sm font-body">Something went wrong. Please try again.</p>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}