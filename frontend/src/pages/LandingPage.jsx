import { Link } from "react-router-dom";

const LandingPage = () => {
  const highlights = [
    { label: "Centralized Library", text: "One verified place for past papers across faculties and departments." },
    { label: "Smart Academic Filters", text: "Find papers by faculty, department, level, semester, and course code." },
    { label: "Peer Quality Signals", text: "Use ratings and comments to quickly identify useful and reliable papers." },
  ];

  const roleCards = [
    {
      title: "For Students",
      description:
        "Search faster, preview papers in-browser, download PDF copies, and collaborate through comments and ratings.",
      bullets: [
        "Topic-focused search for exam revision",
        "Instant PDF preview and download",
        "Community feedback before download",
      ],
    },
    {
      title: "For Admins",
      description:
        "Keep quality high with structured upload, approval workflows, moderation tools, and activity analytics.",
      bullets: [
        "Upload papers with complete metadata",
        "Approve or reject submissions",
        "Track users and upload statistics",
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-glass md:p-10">
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-12 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 animate-floatIn">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
              Designed for University Exam Success
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
              Past Question Paper Finder System
            </h1>
            <p className="max-w-2xl text-lg text-slate-700">
              A centralized academic platform where students can discover, preview, and download trusted past examination papers
              without relying on scattered chats, outdated file drives, or random social media links.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Access</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-900">24/7</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Format</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-900">PDF</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Search</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-900">Smart</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/search"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-teal-800"
              >
                Start Searching
              </Link>
              <Link
                to="/register"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold uppercase tracking-wide text-slate-800"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="space-y-4 animate-floatIn [animation-delay:120ms]">
            {highlights.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="font-display text-lg font-bold text-slate-900">{item.label}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {roleCards.map((card, index) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-floatIn"
            style={{ animationDelay: `${180 + index * 120}ms` }}
          >
            <h3 className="font-display text-2xl font-bold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-slate-600">{card.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {card.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-600" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white md:p-8">
        <h3 className="font-display text-2xl font-bold">How It Works</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-amber-300">Step 1</p>
            <h4 className="mt-1 font-display text-lg font-bold">Register and Sign In</h4>
            <p className="mt-2 text-sm text-slate-200">Create an account to access paper interactions and personalized usage.</p>
          </article>
          <article className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-amber-300">Step 2</p>
            <h4 className="mt-1 font-display text-lg font-bold">Search by Academic Filters</h4>
            <p className="mt-2 text-sm text-slate-200">Narrow results quickly using faculty, department, level, semester, or course code.</p>
          </article>
          <article className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-amber-300">Step 3</p>
            <h4 className="mt-1 font-display text-lg font-bold">Preview, Download, and Review</h4>
            <p className="mt-2 text-sm text-slate-200">Open PDFs in-browser, download copies, and leave ratings/comments to guide others.</p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
