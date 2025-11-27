import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { client } from '@/shared/api/client'
import { mapUserContext } from '../lib/mapUserContext'
import {
  defaultWizardValues,
  type WizardFormValues,
  type WizardStepId,
} from '../lib/validation'

const stepOrder: WizardStepId[] = ['profile', 'routine', 'background', 'tech', 'review']
const DRAFT_STORAGE_KEY = 'tp_user_context_wizard'
const DRAFT_TTL_MS = 1000 * 60 * 60 * 24

export const useUserContextWizardStore = defineStore('userContextWizard', () => {
  const data = ref<WizardFormValues>({ ...defaultWizardValues })
  const currentStep = ref<WizardStepId>(stepOrder[0])
  const isSubmitting = ref(false)
  const submitError = ref('')
  const submittedAt = ref<Date | null>(null)

  const stepIndex = computed(() => stepOrder.indexOf(currentStep.value))
  const isLastStep = computed(() => stepIndex.value === stepOrder.length - 1)

  const setField = <K extends keyof WizardFormValues>(key: K, value: WizardFormValues[K]) => {
    data.value = { ...data.value, [key]: value }
  }

  const mergeValues = (values: Partial<WizardFormValues>) => {
    data.value = { ...data.value, ...values }
    // Debug: track merges to ensure fields are arriving
    console.log('[wizard] mergeValues', values, { next: data.value })
  }

  const persistDraft = () => {
    if (typeof window === 'undefined') return
    const payload = { data: data.value, savedAt: Date.now() }
    console.log('[wizard] persistDraft', payload)
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload))
  }

  const clearDraft = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(DRAFT_STORAGE_KEY)
  }

  const hydrateFromDraft = () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (!raw) return
      console.log('[wizard] hydrateFromDraft raw', raw)
      const parsed = JSON.parse(raw) as { data?: WizardFormValues; savedAt?: number }
      const isExpired = parsed?.savedAt && Date.now() - parsed.savedAt > DRAFT_TTL_MS
      if (isExpired) {
        localStorage.removeItem(DRAFT_STORAGE_KEY)
        return
      }
      if (parsed?.data) {
        console.log('[wizard] hydrateFromDraft parsed', parsed.data)
        mergeValues(parsed.data)
      }
    } catch (error) {
      console.warn('Não foi possível ler o rascunho do wizard', error)
    }
  }

  const goToStep = (id: WizardStepId) => {
    if (stepOrder.includes(id)) {
      currentStep.value = id
    }
  }

  const nextStep = () => {
    const next = stepOrder[stepIndex.value + 1]
    if (next) currentStep.value = next
  }

  const prevStep = () => {
    const prev = stepOrder[stepIndex.value - 1]
    if (prev) currentStep.value = prev
  }

  const submit = async (values?: Partial<WizardFormValues>) => {
    submitError.value = ''
    isSubmitting.value = true
    if (values) mergeValues(values)
    try {
      const payload = mapUserContext(data.value)
      console.log('[wizard] submit payload', payload)
      await client.updateUserContext(payload)
      submittedAt.value = new Date()
      clearDraft()
      return true
    } catch (error) {
      console.error('Erro ao salvar contexto', error)
      submitError.value = 'Não foi possível salvar seu perfil agora. Tente novamente.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  watch(
    data,
    () => {
      persistDraft()
    },
    { deep: true },
  )

  return {
    data,
    currentStep,
    stepIndex,
    isLastStep,
    isSubmitting,
    submitError,
    submittedAt,
    setField,
    mergeValues,
    persistDraft,
    hydrateFromDraft,
    clearDraft,
    goToStep,
    nextStep,
    prevStep,
    submit,
    stepOrder,
  }
})
