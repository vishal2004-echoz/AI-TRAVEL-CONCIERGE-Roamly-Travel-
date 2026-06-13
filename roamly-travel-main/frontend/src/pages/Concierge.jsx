import { useState, useRef, useEffect } from 'react';
import { Send, Compass, RotateCcw } from 'lucide-react';
import { chat } from '../api';
import { useAuth } from '../context/AuthContext';

const STARTERS = [
  "I want to feel small and ancient. Where should I go?",
  "What's a destination that changed people's lives?",
  "I have 10 days and $2000. Where should I go?",
  "What's the most underrated destination right now?",
  "Is Bali still worth visiting?",
];

export default function Concierge() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{
    role: 'model',
content: `Hey ${user?.name?.split(' ')[0] || 'there'} 👋 I'm Compass — Roamly's travel brain. Got a destination in mind, or want me to surprise you?`  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.slice(1, -1).map(m => ({ role: m.role, content: m.content }));
      const res = await chat({ message: msg, history });
      setMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "I lost my train of thought. Could you repeat that?" }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([{
    role: 'model',
    content: `Fresh start! Where to next, ${user?.name?.split(' ')[0] || 'traveler'}? 🌍`
  }]);

  return (
    <div className="min-h-screen pt-20 flex flex-col max-h-screen">
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 px-4 pb-4">

        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c8882a, #dca042)' }}>
              <Compass size={18} className="text-dusk-900" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sand-50">Roamly</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-sand-500">Roamly — Online</span>
              </div>
            </div>
          </div>
          <button onClick={reset} className="flex items-center gap-2 text-sand-400 hover:text-sand-200 text-sm font-body transition-all">
            <RotateCcw size={14} /> New chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg, #c8882a, #dca042)' }}>
                  <Compass size={14} className="text-dusk-900" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 font-body text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai text-sand-200'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 mt-1"
                style={{ background: 'linear-gradient(135deg, #c8882a, #dca042)' }}>
                <Compass size={14} className="text-dusk-900" />
              </div>
              <div className="bubble-ai px-4 py-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-sand-400"
                      style={{ animation: `bounce 1s infinite ${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starters (show only on first message) */}
        {messages.length === 1 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {STARTERS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                className="text-xs font-body text-sand-400 border border-white/10 rounded-xl px-3 py-2 hover:border-sand-400/30 hover:text-sand-200 transition-all text-left">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-3 pt-3 border-t border-white/5">
          <input className="input-vintage flex-1 text-sm"
            placeholder="Ask Roamly anything about travel..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="btn-gold px-4 py-3 disabled:opacity-40">
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
