# TaxMate

Deduction finder, WFH log, MyGov walkthrough, AI assistant, and audit guide — built for salaried Australians filing their tax return. No accounts, no login, free. Everything runs in your browser.

## Features

- **AI Assistant** — Ask tax questions and get answers powered by your own LLM provider (BYOK). Bring your own API key — it stays on your device.
- **Deduction finder** — Answer a few questions about your job and get a personalised list of what you can claim, with ATO rules and rate limits baked in.
- **Refund impact calculator** — See how your deductions affect your refund in real time, based on your income bracket (ATO 2025–26 rates).
- **WFH log** — Track work-from-home days with hours per entry, export to CSV for your tax agent.
- **MyGov walkthrough** — Step-by-step guide to lodging your return through the ATO via MyGov.
- **Audit guide** — What records to keep, what triggers an ATO review, and how to handle it.

All data stays in your browser (localStorage). No server, no account, no telemetry.

## Quick start

```bash
# Clone
git clone https://github.com/Shifat7/tax-claimer.git
cd tax-claimer

# Install
npm install

# Dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Running tests

```bash
# Run once
npm test

# Watch mode
npm run test:watch
```

Tests use Vitest + jsdom with a localStorage polyfill. 81 tests across 3 files covering deduction routing logic, applicability rules, and storage operations.

## Project structure

```
src/
├── app/
│   ├── page.tsx             — Landing page
│   ├── layout.tsx           — Root layout
│   ├── ai/page.tsx          — AI Assistant (BYOK LLM chat)
│   ├── checklist/page.tsx   — Deduction finder (main app)
│   ├── wfh-log/page.tsx     — WFH day tracker
│   ├── mygov-checklist/page.tsx — MyGov lodging guide
│   ├── audit-guide/page.tsx — ATO audit prep guide
│   └── purchase/page.tsx    — Purchase placeholder (all features are free)
├── data/
│   └── deductions.ts        — Deduction categories, ATO rates, business logic
├── lib/
│   ├── storage.ts           — localStorage CRUD, CSV export, BYOK config
│   └── llm.ts               — OpenAI-compatible LLM client (BYOK)
└── test/
    ├── setup.ts             — Vitest + jsdom config
    ├── checklist-logic.test.ts — Step routing and deduction applicability
    ├── deductions.test.ts   — Calculation tests
    └── storage.test.ts      — Storage and CSV tests
```

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vitest](https://vitest.dev/) + jsdom for tests

Zero external runtime dependencies beyond Next.js and React. No UI libraries, no state management libraries, no auth.

## ATO rates (2025–26)

| Income | Marginal rate |
|--------|--------------|
| $0 – $18,200 | 0% |
| $18,201 – $45,000 | 16% |
| $45,001 – $135,000 | 30% |
| $135,001 – $190,000 | 37% |
| $190,001+ | 45% |

WFH fixed-rate method: $0.67/hr. All deduction limits follow current ATO guidance.

## Privacy

Zero data leaves your device. Everything is stored in `localStorage` — no cookies, no API calls, no analytics, no tracking. You own your tax data.

## Roadmap

- [ ] **Dark mode**
- [ ] **PDF export** — Generate a formatted report for your tax agent
- [ ] **Multi-year support** — Compare deductions year over year
- [ ] **Refund estimator v2** — Withholding calculator, HELP/HECS repayment estimate, Medicare levy

## License

[CC BY-NC 4.0](LICENSE) — This project is for educational and personal use only. You may not use it for commercial purposes.

## Disclaimer

TaxMate provides educational guidance only. It is not tax advice. Always verify with the ATO (ato.gov.au) or a registered tax agent before lodging.
