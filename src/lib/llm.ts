import type { ByokConfig } from "./storage"

export interface LlmMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface LlmResponse {
  content: string
  model: string
}

function buildSystemPrompt(): string {
  return `You are TaxMate AI, a helpful tax assistant for Australian taxpayers.

Your role:
- Answer questions about Australian tax deductions, ATO rules, and tax return preparation
- Explain tax concepts in plain English for salaried employees
- Reference current ATO guidance where applicable
- Direct users to ato.gov.au or a registered tax agent for specific personal advice

What you know:
- ATO 2025-26 tax rates: 0% ($0-$18,200), 16% ($18,201-$45,000), 30% ($45,001-$135,000), 37% ($135,001-$190,000), 45% ($190,001+)
- WFH fixed-rate method: $0.67/hr (includes electricity, gas, internet, phone, stationery, computer consumables)
- The $300 threshold rule: items under $300 are fully deductible in the year of purchase; items $300+ must be depreciated
- Three-way test for work-related expenses: (1) you must have spent the money yourself, (2) it must be directly related to earning your income, (3) you must have a record to prove it
- Standard record-keeping requirement: 5 years from date of lodgment

Guidelines:
- Keep answers concise and practical
- When unsure, say so and suggest the user check ato.gov.au
- Do not give personal financial advice — only general guidance
- Never invent specific tax rulings or ATO determinations`
}

export async function callLlm(
  messages: LlmMessage[],
  config: ByokConfig,
  abortSignal?: AbortSignal,
): Promise<LlmResponse> {
  const url = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`

  const systemMessage: LlmMessage = { role: "system", content: buildSystemPrompt() }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [systemMessage, ...messages],
      temperature: 0.3,
      max_tokens: 2048,
    }),
    signal: abortSignal,
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(`LLM API error ${response.status}: ${body}`)
  }

  const data = await response.json()
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    model: data.model ?? config.model,
  }
}
