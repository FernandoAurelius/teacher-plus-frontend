import type { WizardFormValues } from './validation'
import { schemas } from '@/shared/api/schemas'

type UserContextPayload = typeof schemas.UserContext._type

export function mapUserContext(values: WizardFormValues): UserContextPayload {
  return {
    persona: values.persona.trim(),
    goal: values.goal.trim(),
    deadline: values.deadline,
    weekly_time_hours: Number(values.weekly_time_hours) || 0,
    study_routine: values.study_routine.trim(),
    background_level: values.background_level,
    background_institution_type: values.background_institution_type,
    self_assessment: undefined,
    diagnostic_status: 'completed',
    diagnostic_snapshot: undefined,
    interests: values.interests ?? [],
    preferences_formats: values.preferences_formats ?? [],
    preferences_language: values.preferences_language || 'pt-BR',
    preferences_accessibility: values.preferences_accessibility?.trim(),
    tech_device: values.tech_device,
    tech_connectivity: values.tech_connectivity,
    notifications: values.notifications,
    consent_lgpd: values.consent_lgpd,
    materials: undefined,
  }
}
