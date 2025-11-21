import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { client } from '@/shared/api/client'
import { mapUserContext } from '../lib/mapUserContext'
import {
  defaultWizardValues,
  type WizardFormValues,
  type WizardStepId,
} from '../lib/validation'

const stepOrder: WizardStepId[] = ['profile', 'routine', 'background', 'tech', 'review']

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
      await client.updateUserContext(mapUserContext(data.value))
      submittedAt.value = new Date()
      return true
    } catch (error) {
      console.error('Erro ao salvar contexto', error)
      submitError.value = 'Não foi possível salvar seu perfil agora. Tente novamente.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

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
    goToStep,
    nextStep,
    prevStep,
    submit,
    stepOrder,
  }
})
