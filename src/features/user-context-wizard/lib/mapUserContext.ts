import type { WizardFormValues } from './validation'
import type { WizardFormValues } from './validation'
import { schemas } from '@/shared/api/schemas'

type UserContextPayload = typeof schemas.UserContext._type

const safeString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value.trim() : fallback

const safeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function mapUserContext(values: Partial<WizardFormValues>): UserContextPayload {
  const weeklyHoursRaw = safeNumber(values.weekly_time_hours, 0)
  const weeklyHours = Math.min(Math.max(weeklyHoursRaw, 0), 60)

  const sanitizeStringArray = (input?: string[]) =>
    (input ?? []).map((item) => item.trim()).filter(Boolean)

  console.log('[wizard] mapUserContext input', values)

  return {
    persona: safeString(values.persona),
    goal: safeString(values.goal),
    deadline: safeString(values.deadline),
    weekly_time_hours: weeklyHours,
    study_routine: safeString(values.study_routine),
    background_level: safeString(values.background_level),
    background_institution_type: safeString(values.background_institution_type),
    self_assessment: undefined,
    diagnostic_status: 'pending',
    diagnostic_snapshot: undefined,
    interests: sanitizeStringArray(values.interests),
    preferences_formats: sanitizeStringArray(values.preferences_formats),
    preferences_language: safeString(values.preferences_language, 'pt-BR') || 'pt-BR',
    preferences_accessibility: sanitizeStringArray(values.preferences_accessibility),
    tech_device: safeString(values.tech_device),
    tech_connectivity: safeString(values.tech_connectivity),
    notifications: safeString(values.notifications),
    consent_lgpd: Boolean(values.consent_lgpd),
    materials: undefined,
  }
}
