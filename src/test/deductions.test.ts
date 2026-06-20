import { describe, it, expect } from "vitest"
import {
  JOB_TYPES,
  DEDUCTION_CATEGORIES,
  getDeductionsForJobType,
  estimateWfhClaim,
  getTotalWfhHours,
  calculateRefundImpact,
  getAverageWeeklyHours,
  TAX_BRACKETS,
  ATO_THREE_WAY_TEST,
} from "@/data/deductions"

describe("JOB_TYPES", () => {
  it("has 5 job types", () => {
    expect(JOB_TYPES).toHaveLength(5)
  })

  it("each job type has an id, label, icon, and deductions", () => {
    for (const job of JOB_TYPES) {
      expect(job.id).toBeTruthy()
      expect(job.label).toBeTruthy()
      expect(job.icon).toBeTruthy()
      expect(Array.isArray(job.deductions)).toBe(true)
    }
  })

  it("each job type's deductions reference valid category ids", () => {
    const validIds = new Set(DEDUCTION_CATEGORIES.map((d) => d.id))
    for (const job of JOB_TYPES) {
      for (const d of job.deductions) {
        expect(validIds.has(d)).toBe(true)
      }
    }
  })
})

describe("DEDUCTION_CATEGORIES", () => {
  it("each category has required fields", () => {
    for (const d of DEDUCTION_CATEGORIES) {
      expect(d.id).toBeTruthy()
      expect(d.label).toBeTruthy()
      expect(d.description).toBeTruthy()
      expect(Array.isArray(d.commonFor)).toBe(true)
    }
  })

  it("includes universal categories: donations, tax agent fees, and super contributions", () => {
    const donations = DEDUCTION_CATEGORIES.find((d) => d.id === "donations")
    expect(donations).toBeDefined()
    expect(donations!.label).toBeTruthy()
    expect(donations!.description).toMatch(/donation|DGR|charity/i)

    const taxAgent = DEDUCTION_CATEGORIES.find((d) => d.id === "tax-agent-fees")
    expect(taxAgent).toBeDefined()
    expect(taxAgent!.label).toBeTruthy()

    const superCat = DEDUCTION_CATEGORIES.find((d) => d.id === "super-contributions")
    expect(superCat).toBeDefined()
    expect(superCat!.label).toMatch(/super|contribution/i)
    expect(superCat!.complianceNote).toMatch(/intent|contribution/i)
  })

  it("universal categories apply to all 5 job types", () => {
    const donations = DEDUCTION_CATEGORIES.find((d) => d.id === "donations")!
    expect(donations.commonFor).toHaveLength(5)

    const taxAgent = DEDUCTION_CATEGORIES.find((d) => d.id === "tax-agent-fees")!
    expect(taxAgent.commonFor).toHaveLength(5)
  })
})

describe("getDeductionsForJobType", () => {
  it("returns deductions for office job", () => {
    const deps = getDeductionsForJobType("office")
    expect(deps.length).toBeGreaterThan(0)
    expect(deps.some((d) => d.id === "wfh")).toBe(true)
  })

  it("returns deductions for tradesperson", () => {
    const deps = getDeductionsForJobType("trades")
    expect(deps.some((d) => d.id === "tools-equipment")).toBe(true)
    expect(deps.some((d) => d.id === "vehicle")).toBe(true)
  })

  it("returns empty array for unknown job type", () => {
    expect(getDeductionsForJobType("unknown-job")).toEqual([])
  })
})

describe("estimateWfhClaim", () => {
  it("calculates claim correctly at default 48 weeks", () => {
    // 10 hrs/wk * 48 wks * $0.67 = $321.60 → rounds to $322
    expect(estimateWfhClaim(10)).toBe(322)
  })

  it("returns 0 for 0 hours", () => {
    expect(estimateWfhClaim(0)).toBe(0)
  })

  it("accepts custom weeks", () => {
    // 5 hrs/wk * 12 wks * $0.67 = $40.20 → $40
    expect(estimateWfhClaim(5, 12)).toBe(40)
  })

  it("handles fractional hours", () => {
    // 7.5 hrs/wk * 48 wks * $0.67 = $241.20 → $241
    expect(estimateWfhClaim(7.5)).toBe(241)
  })
})

describe("getTotalWfhHours", () => {
  it("returns 0 for empty array", () => {
    expect(getTotalWfhHours([])).toBe(0)
  })

  it("sums hours from entries", () => {
    const entries = [
      { date: "2026-06-01", hours: 8, notes: "" },
      { date: "2026-06-02", hours: 7.5, notes: "" },
      { date: "2026-06-03", hours: 8, notes: "" },
    ]
    expect(getTotalWfhHours(entries)).toBe(23.5)
  })

  it("handles single entry", () => {
    const entries = [{ date: "2026-06-01", hours: 4, notes: "" }]
    expect(getTotalWfhHours(entries)).toBe(4)
  })

  it("handles fractional hours", () => {
    const entries = [
      { date: "2026-06-01", hours: 0.5, notes: "" },
      { date: "2026-06-02", hours: 1.25, notes: "" },
    ]
    expect(getTotalWfhHours(entries)).toBe(1.75)
  })
})

describe("calculateRefundImpact", () => {
  it("calculates refund boost from total deduction at 32.5% bracket", () => {
    // $1000 deduction * 32.5% = $325
    expect(calculateRefundImpact(1000, 0.325)).toBe(325)
  })

  it("returns 0 for zero deduction", () => {
    expect(calculateRefundImpact(0, 0.325)).toBe(0)
  })

  it("handles 45% top bracket", () => {
    expect(calculateRefundImpact(2000, 0.45)).toBe(900)
  })

  it("handles tax-free threshold (0%)", () => {
    expect(calculateRefundImpact(5000, 0)).toBe(0)
  })

  it("handles large deduction amounts", () => {
    expect(calculateRefundImpact(15000, 0.37)).toBe(5550)
  })
})

describe("getAverageWeeklyHours", () => {
  it("returns 0 for empty entries", () => {
    expect(getAverageWeeklyHours([])).toBe(0)
  })

  it("calculates average from single entry", () => {
    const entries = [{ date: "2026-06-01", hours: 8, notes: "" }]
    // 1 week span → 8 / 1 = 8
    expect(getAverageWeeklyHours(entries)).toBe(8)
  })

  it("calculates across multiple weeks", () => {
    const entries = [
      { date: "2026-06-01", hours: 40, notes: "" },  // Mon of week 1
      { date: "2026-06-08", hours: 36, notes: "" },  // Mon of week 2
    ]
    // 2 weeks span, 76 total hours → 76 / 2 = 38
    expect(getAverageWeeklyHours(entries)).toBe(38)
  })

  it("handles entries crossing year boundary", () => {
    const entries = [
      { date: "2026-12-28", hours: 40, notes: "" },
      { date: "2027-01-04", hours: 40, notes: "" },
    ]
    expect(getAverageWeeklyHours(entries)).toBe(40)
  })

  it("returns 0 for entries all with 0 hours", () => {
    const entries = [
      { date: "2026-06-01", hours: 0, notes: "" },
      { date: "2026-06-02", hours: 0, notes: "" },
    ]
    expect(getAverageWeeklyHours(entries)).toBe(0)
  })
})

describe("TAX_BRACKETS", () => {
  it("has 5 brackets", () => {
    expect(TAX_BRACKETS).toHaveLength(5)
  })

  it("each bracket has label, rate, and range", () => {
    for (const b of TAX_BRACKETS) {
      expect(b.label).toBeTruthy()
      expect(typeof b.rate).toBe("number")
      expect(b.range).toBeTruthy()
    }
  })

  it("brackets ascend from 0% to 45%", () => {
    for (let i = 1; i < TAX_BRACKETS.length; i++) {
      expect(TAX_BRACKETS[i].rate).toBeGreaterThan(TAX_BRACKETS[i - 1].rate)
    }
  })

  it("first bracket is tax-free", () => {
    expect(TAX_BRACKETS[0].rate).toBe(0)
  })

  it("last bracket is top marginal rate", () => {
    expect(TAX_BRACKETS[TAX_BRACKETS.length - 1].rate).toBe(0.45)
  })
})

describe("ATO three-way test compliance", () => {
  it("ATO_THREE_WAY_TEST has 3 rules", () => {
    expect(ATO_THREE_WAY_TEST).toHaveLength(3)
  })

  it("each rule has title and description", () => {
    for (const rule of ATO_THREE_WAY_TEST) {
      expect(rule.title).toBeTruthy()
      expect(rule.description).toBeTruthy()
    }
  })

  it("every deduction category has a complianceNote", () => {
    for (const d of DEDUCTION_CATEGORIES) {
      expect(d.complianceNote).toBeTruthy()
    }
  })

  it("compliance notes are unique per category", () => {
    const notes = DEDUCTION_CATEGORIES.map((d) => d.complianceNote)
    expect(new Set(notes).size).toBe(notes.length)
  })
})
