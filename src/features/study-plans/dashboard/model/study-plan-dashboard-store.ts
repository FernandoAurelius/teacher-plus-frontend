import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { client } from '@/shared/api/client'
import { useJobMonitor } from '@/shared/lib/jobs/useJobMonitor'
import type { StudyPlanSummary } from '@/entities/study-plan'
import type { z } from 'zod'
import { schemas } from '@/shared/api/schemas'

type GeneratePlanPayload = z.infer<typeof schemas.GeneratePlanRequest>
type StatusFilter = 'all' | 'active' | 'draft' | 'archived' | 'failed'

export const useStudyPlanDashboardStore = defineStore('studyPlanDashboard', () => {
  const plans = ref<StudyPlanSummary[]>([])
  const loading = ref(false)
  const creating = ref(false)
  const searchTerm = ref('')
  const statusFilter = ref<StatusFilter>('all')
  const errorMessage = ref('')

  const jobMonitor = useJobMonitor({
    onSuccess: async () => {
      await loadPlans()
    },
  })

  const filteredPlans = computed(() => {
    const query = searchTerm.value.trim().toLowerCase()
    return plans.value.filter((plan) => {
      const matchText =
        !query ||
        plan.title.toLowerCase().includes(query) ||
        plan.summary.toLowerCase().includes(query)
      const matchStatus =
        statusFilter.value === 'all'
          ? true
          : statusFilter.value === 'failed'
            ? plan.generation_status === 'failed'
            : plan.status === statusFilter.value
      return matchText && matchStatus
    })
  })

  const resetState = () => {
    errorMessage.value = ''
  }

  const loadPlans = async () => {
    loading.value = true
    resetState()
    try {
      const response = await client.listStudyPlans()
      plans.value = response
    } catch (error) {
      console.error('Erro ao listar planos', error)
      errorMessage.value = 'Não foi possível carregar os planos.'
    } finally {
      loading.value = false
    }
  }

  const createPlan = async (payload: GeneratePlanPayload) => {
    creating.value = true
    resetState()
    try {
      const plan = await client.generateStudyPlan(payload)
      await loadPlans()
      toast.success('Plano solicitado', {
        description: 'Atualizaremos a lista quando a IA concluir.',
      })
      if (plan.job_id) {
        jobMonitor.start(plan.job_id)
      }
      return plan.id
    } catch (error) {
      console.error('Erro ao gerar plano', error)
      errorMessage.value = 'Não foi possível gerar o plano agora.'
      toast.error('Erro ao acionar IA', { description: errorMessage.value })
      return null
    } finally {
      creating.value = false
    }
  }

  return {
    plans,
    loading,
    creating,
    searchTerm,
    statusFilter,
    errorMessage,
    filteredPlans,
    jobState: jobMonitor.state,
    loadPlans,
    createPlan,
  }
})
