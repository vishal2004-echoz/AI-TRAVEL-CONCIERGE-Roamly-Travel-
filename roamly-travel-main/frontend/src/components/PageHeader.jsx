import { Link } from 'react-router-dom';

export default function PageHeader({ title, eyebrow, description }) {
  return (
    <section className="relative overflow-hidden px-6 pb-10 pt-32">
      <div className="absolute inset-0 bg-animated opacity-70" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at top, rgba(200,136,42,0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(58,144,174,0.12), transparent 30%)',
        }}
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="stamp mb-5">{eyebrow || 'Roamly'}</div>
        <h1 className="font-display text-4xl font-bold text-sand-50 md:text-6xl">{title}</h1>
        {description ? (
          <p className="mt-5 max-w-3xl font-body text-lg leading-8 text-sand-300">{description}</p>
        ) : null}
        <div className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-sand-500">
          <Link to="/" className="transition-colors hover:text-sand-200">
            Home
          </Link>
          <span>/</span>
          <span className="text-sand-300">{title}</span>
        </div>
      </div>
    </section>
  );
}
