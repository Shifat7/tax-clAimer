import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "TaxMate — File your taxes like a pro",
  description:
    "Deduction checklist, WFH log, MyGov guide, and audit support. Everything a salaried Australian needs for tax time.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-gradient-to-b from-white via-taxmate-50/30 to-white text-neutral-900 antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
