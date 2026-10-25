export const HONEYPOT_FIELD: string
export const STARTED_FIELD: string
export const MIN_FILL_MS: number
export function looksGibberish(text: unknown): boolean
export function areaCode(phone: unknown): string
export function validUsPhone(phone: unknown): boolean
export function gmailDotCount(email: unknown): number
export function normalizeEmail(email: unknown): string
export function checkLead(
  fields: Record<string, unknown>,
  opts?: { cityExpected?: boolean },
): { spam: boolean; reasons: string[]; flags: string[]; normalizedEmail: string }
