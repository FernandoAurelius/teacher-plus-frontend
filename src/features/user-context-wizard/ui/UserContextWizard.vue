<script setup lang="ts">
import { computed, onMounted, toRaw, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import Button from '@/shared/ui/button/Button.vue'
import Progress from '@/shared/ui/progress/Progress.vue'
import { useUserContextWizardStore } from '../model/userContextStore'
import { stepSchemas, type WizardStepId } from '../lib/validation'
import StepProfileGoal from './steps/StepProfileGoal.vue'
import StepRoutineAvailability from './steps/StepRoutineAvailability.vue'
import StepBackground from './steps/StepBackground.vue'
import StepTechAccess from './steps/StepTechAccess.vue'
import StepReview from './steps/StepReview.vue'

const router = useRouter()
const store = useUserContextWizardStore()

const steps: { id: WizardStepId; title: string; description: string; component: any }[] = [
  { id: 'profile', title: 'Perfil', description: 'Persona e objetivo', component: StepProfileGoal },
  { id: 'routine', title: 'Rotina', description: 'Disponibilidade e notificações', component: StepRoutineAvailability },
  { id: 'background', title: 'Background', description: 'Nível e interesses', component: StepBackground },
  { id: 'tech', title: 'Tecnologia', description: 'Dispositivo e idioma', component: StepTechAccess },
  { id: 'review', title: 'Revisão', description: 'Confirme e envie', component: StepReview },
]

const currentSchema = computed(() => stepSchemas[store.currentStep])
const currentStepComponent = computed(
  () => steps.find((step) => step.id === store.currentStep)?.component ?? StepProfileGoal,
)
const progressValue = computed(
  () => Math.round(((store.stepIndex + 1) / steps.length) * 100),
)
const stepProps = computed(() =>
  store.currentStep === 'review' ? { values: form.values } : {},
)

const form = useForm({
  validationSchema: currentSchema,
  initialValues: store.data,
  keepValuesOnUnmount: true,
})

watch(
  form.values,
  (values) => {
    console.log('[wizard] form.values changed', values)
    store.mergeValues(toRaw(values))
  },
  { deep: true },
)

const handleSubmit = form.handleSubmit(async (values) => {
  store.submitError = ''
  const snapshot = structuredClone(values)
  console.log('[wizard] submit handler snapshot', snapshot)
  store.mergeValues(snapshot)
  if (store.isLastStep) {
  const ok = await store.submit(snapshot)
  if (ok) {
    toast.success('Perfil salvo', { description: 'Personalizamos seu plano a partir de agora.' })
    router.push('/portal')
  } else if (store.submitError) {
    toast.error(store.submitError)
  }
    return
  }
  store.nextStep()
})

const goToStep = (stepId: WizardStepId) => {
  if (store.stepOrder.indexOf(stepId) <= store.stepIndex) {
    store.goToStep(stepId)
  }
}

const goBack = () => {
  if (store.stepIndex > 0 && !store.isSubmitting) {
    store.prevStep()
  }
}

onMounted(() => {
  store.hydrateFromDraft()
  form.setValues({ ...toRaw(store.data) })
})
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm font-medium text-primary">Onboarding</p>
      <h1 class="text-3xl font-semibold tracking-tight">Monte seu perfil rápido</h1>
      <p class="text-muted-foreground">
        São 5 passos com validação automática. Você pode voltar a qualquer momento.
      </p>
    </header>

    <div class="rounded-2xl border border-border/60 bg-card/60 shadow-md">
      <div class="border-b border-border/60 px-6 py-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-medium">{{ steps[store.stepIndex]?.title }}</p>
            <p class="text-xs text-muted-foreground">{{ steps[store.stepIndex]?.description }}</p>
          </div>
          <span class="text-xs font-medium text-muted-foreground">
            Passo {{ store.stepIndex + 1 }} / {{ steps.length }}
          </span>
        </div>
        <div class="mt-3">
          <Progress :model-value="progressValue" />
        </div>
      </div>

      <div class="px-6 py-5">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="step in steps"
            :key="step.id"
            type="button"
            class="rounded-full border px-3 py-1 text-xs transition"
            :class="[
              store.currentStep === step.id
                ? 'border-primary/80 bg-primary/10 text-primary'
                : store.stepOrder.indexOf(step.id) < store.stepIndex
                  ? 'border-border/80 bg-muted/50 text-foreground hover:border-primary/60'
                  : 'border-border/50 bg-transparent text-muted-foreground cursor-not-allowed',
            ]"
            :disabled="store.stepOrder.indexOf(step.id) > store.stepIndex"
            @click="goToStep(step.id)"
          >
            {{ step.title }}
          </button>
        </div>

        <form class="mt-6 grid gap-6" @submit.prevent="handleSubmit">
          <Transition
            name="fade"
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-3"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
            mode="out-in"
          >
            <component :is="currentStepComponent" :key="store.currentStep" v-bind="stepProps" />
          </Transition>

          <div v-if="store.submitError" class="text-sm text-destructive">
            {{ store.submitError }}
          </div>

          <div class="flex flex-col gap-3 border-t border-border/60 pt-4 md:flex-row md:items-center md:justify-between">
            <Button
              type="button"
              variant="secondary"
              class="w-full md:w-auto"
              :disabled="store.stepIndex === 0 || store.isSubmitting"
              @click="goBack"
            >
              Voltar
            </Button>
            <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
              <p class="text-xs text-muted-foreground md:text-right">
                Avance para validar cada bloco antes de enviar.
              </p>
              <Button type="submit" class="w-full md:w-auto" :disabled="store.isSubmitting">
                {{ store.isLastStep ? 'Enviar e personalizar' : 'Próximo passo' }}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
