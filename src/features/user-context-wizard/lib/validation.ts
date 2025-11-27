import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

const profileStepSchema = z.object({
  persona: z
    .string()
    .trim()
    .min(2, 'Descreva rapidamente sua persona')
    .max(20, 'Use menos de 20 caracteres'),
  goal: z
    .string()
    .trim()
    .min(5, 'Objetivo muito curto')
    .max(100, 'Objetivo muito longo'),
  deadline: z.string().trim().min(3, 'Informe um prazo ou período'),
  weekly_time_hours: z
    .coerce.number()
    .int()
    .min(0, 'Minimo 0h')
    .max(60, 'Limite de 60h'),
})

const routineStepSchema = z.object({
  study_routine: z.string().trim().min(10, 'Conte como costuma estudar'),
  preferences_formats: z.array(z.string()).default([]),
  notifications: z.enum(['email', 'push', 'whatsapp'], {
    errorMap: () => ({ message: 'Selecione um canal' }),
  }),
})

const backgroundStepSchema = z.object({
  background_level: z.string().trim().min(2, 'Escolha seu nível'),
  background_institution_type: z.string().trim().min(2, 'Informe o tipo de instituição'),
  interests: z.array(z.string()).default([]),
})

const techStepSchema = z.object({
  tech_device: z.string().trim().min(2, 'Qual dispositivo você usa?'),
  tech_connectivity: z.string().trim().min(2, 'Informe a sua conexão'),
  preferences_language: z.string().trim().min(2, 'Escolha o idioma'),
  preferences_accessibility: z.array(z.string()).default([]),
})

const reviewStepSchema = z.object({
  consent_lgpd: z.literal(true, { errorMap: () => ({ message: 'Aceite para continuar' }) }),
})

export const wizardFullSchema = profileStepSchema
  .merge(routineStepSchema)
  .merge(backgroundStepSchema)
  .merge(techStepSchema)
  .merge(reviewStepSchema)

export type WizardFormValues = z.infer<typeof wizardFullSchema>

export type WizardStepId = 'profile' | 'routine' | 'background' | 'tech' | 'review'

export const stepSchemas = {
  profile: toTypedSchema(profileStepSchema),
  routine: toTypedSchema(routineStepSchema),
  background: toTypedSchema(backgroundStepSchema),
  tech: toTypedSchema(techStepSchema),
  review: toTypedSchema(reviewStepSchema),
} satisfies Record<WizardStepId, ReturnType<typeof toTypedSchema>>

export const defaultWizardValues: WizardFormValues = {
  persona: '',
  goal: '',
  deadline: '',
  weekly_time_hours: 3,
  study_routine: '',
  preferences_formats: [],
  notifications: '',
  background_level: '',
  background_institution_type: '',
  interests: [],
  tech_device: '',
  tech_connectivity: '',
  preferences_language: 'pt-BR',
  preferences_accessibility: [],
  consent_lgpd: false,
}
