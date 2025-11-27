import type { WizardFormValues } from './validation'
import { schemas } from '@/shared/api/schemas'

type UserContextPayload = typeof schemas.UserContext._type

export function mapUserContext(values: WizardFormValues): UserContextPayload {
  const weeklyHours = Number.isFinite(Number(values.weekly_time_hours))
    ? Math.min(Math.max(Number(values.weekly_time_hours), 0), 60)
    : 0

  const sanitizeStringArray = (input?: string[]) =>
    (input ?? []).map((item) => item.trim()).filter(Boolean)

  console.log('[wizard] mapUserContext input', values)

  return {
    persona: values.persona.trim(),
    goal: values.goal.trim(),
    deadline: values.deadline.trim(),
    weekly_time_hours: weeklyHours,
    study_routine: values.study_routine.trim(),
    background_level: values.background_level.trim(),
    background_institution_type: values.background_institution_type.trim(),
    self_assessment: undefined,
    diagnostic_status: 'pending',
    diagnostic_snapshot: undefined,
    interests: sanitizeStringArray(values.interests),
    preferences_formats: sanitizeStringArray(values.preferences_formats),
    preferences_language: values.preferences_language || 'pt-BR',
    preferences_accessibility: sanitizeStringArray(values.preferences_accessibility),
    tech_device: values.tech_device.trim(),
    tech_connectivity: values.tech_connectivity.trim(),
    notifications: values.notifications.trim(),
    consent_lgpd: values.consent_lgpd,
    materials: undefined,
  }
}
