export function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded — silently fail
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(key)
}

export interface WfhEntry {
  date: string // YYYY-MM-DD
  hours: number
  notes: string
}

const KEYS = {
  wfhLog: "taxmate-wfh-log",
  checklistAnswers: "taxmate-checklist-answers",
  wfhRate: "taxmate-wfh-rate",
  byokConfig: "taxmate-byok-config",
} as const

export function getWfhLog(): WfhEntry[] {
  return getStorageItem<WfhEntry[]>(KEYS.wfhLog, [])
}

export function setWfhLog(entries: WfhEntry[]): void {
  setStorageItem(KEYS.wfhLog, entries)
}

export function addWfhEntry(entry: WfhEntry): WfhEntry[] {
  const log = getWfhLog()
  log.push(entry)
  setWfhLog(log)
  return log
}

export function removeWfhEntry(date: string): WfhEntry[] {
  const log = getWfhLog().filter((e) => e.date !== date)
  setWfhLog(log)
  return log
}

export function importWfhCsv(csv: string): WfhEntry[] {
  const lines = csv.trim().split("\n")
  const entries: WfhEntry[] = []
  for (const line of lines) {
    const parts = line.split(",")
    if (parts.length >= 2) {
      const date = parts[0].trim()
      const hours = parseFloat(parts[1].trim())
      let notes = parts.slice(2).join(",").trim()
      // strip surrounding quotes and unescape
      if (notes.startsWith('"') && notes.endsWith('"')) {
        notes = notes.slice(1, -1).replace(/""/g, '"')
      }
      if (date && !isNaN(hours)) {
        entries.push({ date, hours, notes })
      }
    }
  }
  const existing = getWfhLog()
  const merged = [...existing]
  for (const e of entries) {
    const idx = merged.findIndex((m) => m.date === e.date)
    if (idx >= 0) merged[idx] = e
    else merged.push(e)
  }
  setWfhLog(merged)
  return merged
}

export function exportWfhCsv(): string {
  const log = getWfhLog()
  const sorted = [...log].sort((a, b) => a.date.localeCompare(b.date))
  const header = "date,hours,notes"
  const rows = sorted.map((e) => `${e.date},${e.hours},"${e.notes.replace(/"/g, '""')}"`)
  return [header, ...rows].join("\n")
}

export function getWfhRate(): number {
  return getStorageItem<number>(KEYS.wfhRate, 0.67)
}

export function setWfhRate(rate: number): void {
  setStorageItem(KEYS.wfhRate, rate)
}

export interface WfhLogSummary {
  totalDays: number
  totalHours: number
  uniqueWeeks: number
}

export function getWfhLogSummary(): WfhLogSummary {
  const log = getWfhLog()
  if (log.length === 0) return { totalDays: 0, totalHours: 0, uniqueWeeks: 0 }

  const totalHours = log.reduce((sum, e) => sum + e.hours, 0)

  // Calculate unique ISO weeks from entries
  const weeks = new Set<string>()
  for (const entry of log) {
    const [y, m, d] = entry.date.split("-").map(Number)
    const date = new Date(y, m - 1, d)
    // ISO week number: move to Thursday then count weeks from year start
    const dayNum = date.getDay() || 7
    date.setDate(date.getDate() + 4 - dayNum)
    const yearStart = new Date(date.getFullYear(), 0, 1)
    const weekNum = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
    weeks.add(`${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`)
  }

  return {
    totalDays: log.length,
    totalHours,
    uniqueWeeks: weeks.size,
  }
}

export interface CsvReportInput {
  jobLabel: string
  wfhHours: number | null
  wfhWeeks: number
  wfhClaim: number
  deductions: { id: string; label: string; maxClaim?: string }[]
}

export function generateCsvReport(input: CsvReportInput): string {
  const rows: string[][] = []
  const push = (cells: string[]) => rows.push(cells.map((c) => `"${c.replace(/"/g, '""')}"`))

  // Header
  push(["TaxMate Deduction Report", ""])
  push(["Generated", new Date().toLocaleDateString("en-AU")])
  push([""])

  // Job & WFH
  push(["Job type", input.jobLabel])
  push(["WFH hours per week", String(input.wfhHours ?? 0)])
  push(["Weeks worked from home", String(input.wfhWeeks)])
  push(["WFH estimated claim", `$${input.wfhClaim.toFixed(2)}`])
  push([""])

  // Deductions table
  push(["Deduction", "Max claim"])
  for (const d of input.deductions) {
    push([d.label, d.maxClaim ?? "Varies"])
  }
  push([""])
  push(["Report prepared for tax purposes — verify with your tax agent.", ""])

  return rows.map((r) => r.join(",")).join("\n")
}

export interface ByokConfig {
  baseUrl: string
  apiKey: string
  model: string
}

export function getByokConfig(): ByokConfig {
  return getStorageItem<ByokConfig>(KEYS.byokConfig, {
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-4o-mini",
  })
}

export function setByokConfig(config: ByokConfig): void {
  setStorageItem(KEYS.byokConfig, config)
}

export function clearByokConfig(): void {
  removeStorageItem(KEYS.byokConfig)
}
