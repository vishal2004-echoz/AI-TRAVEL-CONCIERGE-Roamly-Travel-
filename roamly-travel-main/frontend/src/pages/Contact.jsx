import { Mail, MapPin, MessageSquareText, Phone } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Contact Roamly"
        eyebrow="Talk To Us"
        description="Questions, feedback, design ideas, or product thoughts. Send them over and we'll point you in the right direction."
      />

      <section className="px-6 py-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card-warm rounded-[28px] p-8">
            <div className="stamp mb-5">Contact Info</div>
            <div className="space-y-6 font-body text-sand-300">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 text-sand-400" size={20} />
                <div>
                  <h3 className="font-display text-xl text-sand-100">Location</h3>
                  <p className="mt-1 text-sand-400">Remote · Built for the world 🌍</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="mt-1 text-sand-400" size={20} />
                <div>
                  <h3 className="font-display text-xl text-sand-100">Email</h3>
                  <p className="mt-1 text-sand-400">hello@roamly.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="mt-1 text-sand-400" size={20} />
                <div>
                  <h3 className="font-display text-xl text-sand-100">Support</h3>
                  <p className="mt-1 text-sand-400">Use the in-app concierge for faster travel questions.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-warm rounded-[28px] p-8 md:p-10">
            {sent ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sand-500/10 text-sand-200">
                  <MessageSquareText size={28} />
                </div>
                <h2 className="font-display text-3xl font-bold text-sand-50">Message received</h2>
                <p className="mt-4 font-body text-sand-400">Thanks for reaching out! I'll get back to you at the earliest.</p>
              </div>
            ) : (
              <>
                <div className="stamp mb-5">Send A Message</div>
                <h2 className="font-display text-3xl font-bold text-sand-50">Tell us what you want to improve</h2>
                <p className="mt-4 font-body text-sand-400">
                  Whether it's UX feedback, a feature request, or a travel-planning idea, drop a message and I'll get back to you.
                </p>
                <form className="mt-8 space-y-4" onSubmit={submit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input className="input-vintage" name="name" placeholder="Your name" value={form.name} onChange={update} required />
                    <input className="input-vintage" name="email" type="email" placeholder="Email address" value={form.email} onChange={update} required />
                  </div>
                  <input className="input-vintage" name="subject" placeholder="Subject" value={form.subject} onChange={update} required />
                  <textarea
                    className="input-vintage min-h-40 resize-y"
                    name="message"
                    placeholder="Tell us what's on your mind"
                    value={form.message}
                    onChange={update}
                    required
                  />
                  <button type="submit" className="btn-gold">
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}