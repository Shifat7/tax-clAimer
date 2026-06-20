"use client"

import Link from "next/link"

function Nav() {
  return (
    <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-taxmate-600 text-white text-sm font-bold">T</span>
        <span className="text-lg font-bold tracking-tight">TaxMate</span>
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link
          href="/checklist"
          className="rounded-lg bg-taxmate-600 px-5 py-2.5 font-medium text-white hover:bg-taxmate-700 transition shadow-sm"
        >
          Start deduction finder
        </Link>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="px-6 pt-16 pb-8 text-center">
      <div className="max-w-3xl mx-auto">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-taxmate-100 text-taxmate-700 mb-6">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.1]">
          File your taxes<br />
          <span className="text-taxmate-600">like a pro</span>
        </h1>
        <p className="mt-5 text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Deduction finder, WFH log, MyGov walkthrough, AI assistant, and audit guide — everything
          a salaried Australian needs for tax time.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/checklist"
            className="inline-flex items-center gap-2 rounded-xl bg-taxmate-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-taxmate-700 transition shadow-lg"
          >
            Start deduction finder
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/wfh-log"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-200 bg-white px-8 py-3.5 text-base font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition"
          >
            Track WFH days
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeatureCards() {
  const features = [
    {
      icon: "📋",
      label: "Deduction finder",
      desc: "Answer a few questions to see every deduction you're entitled to — with ATO rules and rate limits.",
      link: "/checklist",
      color: "bg-blue-50 border-blue-200",
    },
    {
      icon: "🏠",
      label: "WFH log",
      desc: "Track your work-from-home days with a simple log. Export CSV for your tax agent. ATO-compliant.",
      link: "/wfh-log",
      color: "bg-emerald-50 border-emerald-200",
    },
    {
      icon: "📄",
      label: "MyGov walkthrough",
      desc: "Step-by-step guide to lodging your return on MyGov. No guesswork, just follow the steps.",
      link: "/mygov-checklist",
      color: "bg-violet-50 border-violet-200",
    },
    {
      icon: "🛡️",
      label: "Audit guide",
      desc: "What records to keep, what triggers an ATO review, and how to handle it if you're audited.",
      link: "/audit-guide",
      color: "bg-amber-50 border-amber-200",
    },
  ]

  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <div className="grid gap-5 sm:grid-cols-2">
        {features.map((f) => (
          <Link
            key={f.label}
            href={f.link}
            className={`rounded-2xl border ${f.color} bg-white p-7 hover:shadow-lg transition`}
          >
            <span className="text-3xl">{f.icon}</span>
            <p className="mt-3 font-bold text-lg text-neutral-900">{f.label}</p>
            <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function AiCard() {
  return (
    <section className="px-6 pb-16 max-w-5xl mx-auto">
      <Link
        href="/ai"
        className="block rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-7 hover:shadow-lg transition"
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl shrink-0">🤖</span>
          <div>
            <p className="font-bold text-lg text-neutral-900">AI Assistant</p>
            <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
              Ask tax questions and get answers powered by your own LLM provider. Bring your own API key — it stays on your device.
            </p>
          </div>
          <svg className="w-5 h-5 shrink-0 text-neutral-300 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </Link>
    </section>
  )
}

function Cta() {
  return (
    <section className="px-6 py-16 text-center">
      <div className="max-w-lg mx-auto rounded-2xl bg-white border border-neutral-200 p-10 shadow-xl">
        <p className="text-3xl font-extrabold tracking-tight text-neutral-900">Free for everyone</p>
        <p className="mt-2 text-neutral-500">No purchase needed. All features included.</p>
        <div className="mt-6 space-y-3 text-sm text-left">
          {["Deduction finder with ATO rules", "WFH log with CSV export", "MyGov step-by-step guide", "Audit support and record-keeping"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-taxmate-100 text-taxmate-700 text-xs font-bold">✓</span>
              {item}
            </div>
          ))}
        </div>
        <Link
          href="/checklist"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-taxmate-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-taxmate-700 transition shadow-lg"
        >
          Find your deductions
        </Link>
        <p className="mt-3 text-xs text-neutral-400">Instant access. No account needed. Your data stays on your device.</p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200 px-6 py-10 text-center text-sm text-neutral-400">
      <p>TaxMate provides educational guidance only. Always verify with the ATO or a registered tax agent.</p>
    </footer>
  )
}

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <FeatureCards />
      <AiCard />
      <Cta />
      <Footer />
    </>
  )
}