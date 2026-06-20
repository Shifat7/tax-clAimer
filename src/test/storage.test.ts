import { describe, it, expect, beforeEach } from "vitest"
import {
  addWfhEntry,
  getWfhLog,
  removeWfhEntry,
  importWfhCsv,
  exportWfhCsv,
  getWfhRate,
  setWfhRate,
  getWfhLogSummary,
  type WfhEntry,
  generateCsvReport,
} from "@/lib/storage"

beforeEach(() => {
  localStorage.clear()
})

describe("WFH log", () => {
  it("returns empty array for empty log", () => {
    expect(getWfhLog()).toEqual([])
  })

  it("adds a WFH entry", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: "Normal day" })
    const log = getWfhLog()
    expect(log).toHaveLength(1)
    expect(log[0]).toEqual({ date: "2026-06-01", hours: 8, notes: "Normal day" })
  })

  it("adds multiple entries", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: "" })
    addWfhEntry({ date: "2026-06-02", hours: 7.5, notes: "Left early" })
    expect(getWfhLog()).toHaveLength(2)
  })

  it("removes entry by date", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: "" })
    addWfhEntry({ date: "2026-06-02", hours: 8, notes: "" })
    removeWfhEntry("2026-06-01")
    const log = getWfhLog()
    expect(log).toHaveLength(1)
    expect(log[0].date).toBe("2026-06-02")
  })

  it("removing non-existent date does nothing", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: "" })
    removeWfhEntry("2099-01-01")
    expect(getWfhLog()).toHaveLength(1)
  })

  it("export produces valid CSV header", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: "Office day" })
    const csv = exportWfhCsv()
    const lines = csv.trim().split("\n")
    expect(lines[0]).toBe("date,hours,notes")
  })

  it("export includes correct data rows", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: "Normal day" })
    const csv = exportWfhCsv()
    expect(csv).toContain('2026-06-01,8,"Normal day"')
  })

  it("export escapes quotes in notes", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: '8" monitor' })
    const csv = exportWfhCsv()
    expect(csv).toContain('"8"" monitor"')
  })

  it("import merges CSV entries", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: "Existing" })
    const csv = "date,hours,notes\n2026-06-02,7.5,New entry"
    const merged = importWfhCsv(csv)
    expect(merged).toHaveLength(2)
  })

  it("import overwrites existing entry for same date", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: "Old" })
    const csv = "date,hours,notes\n2026-06-01,7,\"Updated\""
    const merged = importWfhCsv(csv)
    const entry = merged.find((e) => e.date === "2026-06-01")
    expect(entry?.hours).toBe(7)
    expect(entry?.notes).toBe("Updated")
  })

  it("import handles unescaped quotes in notes field", () => {
    const csv = 'date,hours,notes\n2026-06-01,8,"Left at 5"" to pick up kids"'
    const merged = importWfhCsv(csv)
    expect(merged[0].notes).toBe('Left at 5" to pick up kids')
  })
})

describe("WFH rate", () => {
  it("defaults to 0.67", () => {
    expect(getWfhRate()).toBe(0.67)
  })

  it("persists custom rate", () => {
    setWfhRate(0.80)
    expect(getWfhRate()).toBe(0.80)
  })
})

describe("getWfhLogSummary", () => {
  it("returns zeros for empty log", () => {
    const summary = getWfhLogSummary()
    expect(summary.totalDays).toBe(0)
    expect(summary.totalHours).toBe(0)
    expect(summary.uniqueWeeks).toBe(0)
  })

  it("summarises single entry", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: "" })
    const summary = getWfhLogSummary()
    expect(summary.totalDays).toBe(1)
    expect(summary.totalHours).toBe(8)
    expect(summary.uniqueWeeks).toBe(1)
  })

  it("summarises multiple entries across weeks", () => {
    addWfhEntry({ date: "2026-06-01", hours: 8, notes: "" })  // Monday week 1
    addWfhEntry({ date: "2026-06-02", hours: 7, notes: "" })  // Tuesday week 1
    addWfhEntry({ date: "2026-06-08", hours: 8, notes: "" })  // Monday week 2
    const summary = getWfhLogSummary()
    expect(summary.totalDays).toBe(3)
    expect(summary.totalHours).toBe(23)
    expect(summary.uniqueWeeks).toBeGreaterThanOrEqual(2)
  })

  it("summarises entries with fractional hours", () => {
    addWfhEntry({ date: "2026-06-01", hours: 4.5, notes: "" })
    addWfhEntry({ date: "2026-06-02", hours: 6.25, notes: "" })
    const summary = getWfhLogSummary()
    expect(summary.totalHours).toBeCloseTo(10.75)
    expect(summary.totalDays).toBe(2)
  })
})

describe("CSV report", () => {
  it("generates a report with job type, WFH details, and deductions", () => {
    const report = generateCsvReport({
      jobLabel: "Office / IT",
      wfhHours: 8,
      wfhWeeks: 48,
      wfhClaim: 257.28,
      deductions: [
        { id: "wfh", label: "Work-from-home expenses", maxClaim: "Fixed rate: $0.67/hr (2025-26) or actual costs" },
        { id: "donations", label: "Donations & gifts", maxClaim: "Keep your receipt — no $ limit, but must be to a DGR" },
      ],
    })

    expect(report).toContain("Office / IT")
    expect(report).toContain("8")
    expect(report).toContain("48")
    expect(report).toContain("257.28")
    expect(report).toContain("Work-from-home expenses")
    expect(report).toContain("Donations & gifts")
    expect(report).toContain("Fixed rate: $0.67/hr")
  })
})
