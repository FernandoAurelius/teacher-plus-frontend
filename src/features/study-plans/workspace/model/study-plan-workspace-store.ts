import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { client } from '@/shared/api/client'
import { useJobMonitor } from '@/shared/lib/jobs/useJobMonitor'
import { groupDaysByWeek, parseTaskContent } from '@/entities/study-plan'
import type { StudyPlan, StudyDay, StudyTask } from '@/entities/study-plan'

const STORAGE_KEY = 'tp.portal.currentPlanId'

export const useStudyPlanWorkspaceStore = defineStore('studyPlanWorkspace', () => {
  const plan = ref<StudyPlan | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')
  const activeWeekIndex = ref<number | null>(null)
  const activeDayId = ref<string | null>(null)
  const extendingDayId = ref<string | null>(null)
  const uploadingMaterial = ref(false)
  const uploadMessage = ref('')

  const jobMonitor = useJobMonitor({
    onSuccess: async () => {
      if (plan.value?.id) {
        await loadPlan(plan.value.id)
      }
    },
  })

  const planId = computed(() => plan.value?.id ?? localStorage.getItem(STORAGE_KEY) ?? null)
  const weeks = computed(() => {
    if (plan.value?.weeks?.length) {
      return plan.value.weeks.map((week) => ({
        weekIndex: week.week_index,
        title: week.title ?? `Semana ${week.week_index}`,
        status: week.status,
        summary: week.summary,
        days: week.days,
      }))
    }
    return groupDaysByWeek(plan.value?.days ?? [])
  })
  const days = computed(() => plan.value?.days ?? [])
  const activeWeek = computed(() =>
    weeks.value.find((week) => week.weekIndex === (activeWeekIndex.value ?? weeks.value[0]?.weekIndex)),
  )
  const activeDay = computed(() =>
    days.value.find((day) => day.id === (activeDayId.value ?? activeWeek.value?.days[0]?.id)),
  )

  const planRequiresJob = (current: StudyPlan | null) => {
    if (!current) return false
    const genStatus = current.generation_status
    const isPendingStatus = genStatus === 'pending' || genStatus === 'running'
    const isDraft = current.status === 'draft'
    return (isPendingStatus || isDraft) && !!current.job_id
  }

  const setPlan = (nextPlan: StudyPlan) => {
    plan.value = nextPlan
    localStorage.setItem(STORAGE_KEY, nextPlan.id)
    const firstWeek = nextPlan.weeks?.[0]
    activeWeekIndex.value = firstWeek?.week_index ?? nextPlan.days?.[0]?.week_index ?? 1
    activeDayId.value = nextPlan.days?.[0]?.id ?? null
    if (planRequiresJob(nextPlan)) {
      jobMonitor.start(nextPlan.job_id ?? undefined)
    } else {
      jobMonitor.stop()
    }
  }

  const reset = () => {
    plan.value = null
    errorMessage.value = ''
    activeWeekIndex.value = null
    activeDayId.value = null
  }

  const loadPlan = async (id?: string) => {
    const targetId = id ?? planId.value
    if (!targetId) {
      errorMessage.value = 'Nenhum plano selecionado.'
      return
    }
    loading.value = true
    errorMessage.value = ''
    try {
      const fetched = await client.getStudyPlan({ params: { plan_id: targetId } })
      setPlan(fetched)
    } catch (error) {
      console.error('Erro ao carregar plano', error)
      errorMessage.value = 'Não conseguimos carregar o plano agora.'
    } finally {
      loading.value = false
    }
  }

  const selectWeek = (weekIndex: number) => {
    activeWeekIndex.value = weekIndex
    const week = weeks.value.find((current) => current.weekIndex === weekIndex)
    if (week?.days.length) {
      activeDayId.value = week.days[0].id
    }
  }

  const selectDay = (dayId: string) => {
    activeDayId.value = dayId
    const day = days.value.find((current) => current.id === dayId)
    if (day) {
      const weekIndexValue =
        typeof day.week_index === 'number'
          ? day.week_index
          : Number.parseInt(day.week_index ?? '', 10)
      if (!Number.isNaN(weekIndexValue)) {
        activeWeekIndex.value = weekIndexValue
      }
    }
  }

  const extendDay = async (day: StudyDay) => {
    if (!planId.value) return
    extendingDayId.value = day.id
    try {
      const response = await client.generateSectionTasks(
        { section_id: day.section_id },
        { params: { plan_id: planId.value } },
      )
      if (response.job_id) {
        jobMonitor.start(response.job_id)
      }
      toast.success('Solicitamos novas tarefas', {
        description: 'Atualizaremos o plano quando a IA concluir.',
      })
    } catch (error) {
      console.error('Erro ao gerar tarefas extras', error)
      toast.error('Não conseguimos gerar tarefas agora.')
    } finally {
      extendingDayId.value = null
    }
  }

  const uploadMaterial = async (formData: FormData) => {
    if (!planId.value) return
    uploadingMaterial.value = true
    uploadMessage.value = ''
    try {
      const response = await client.uploadStudyPlanMaterial(formData, { params: { plan_id: planId.value } })
      uploadMessage.value = 'Processando material...'
      jobMonitor.start(response.job_id)
    } catch (error) {
      console.error('Erro ao enviar material', error)
      uploadMessage.value = 'Não conseguimos processar o arquivo.'
      toast.error('Falha no upload', { description: uploadMessage.value })
    } finally {
      uploadingMaterial.value = false
    }
  }

  const taskContent = (task: StudyTask) => parseTaskContent(task)
  const isPlanGenerating = computed(() => planRequiresJob(plan.value))

  const clearPlan = () => {
    reset()
    localStorage.removeItem(STORAGE_KEY)
    jobMonitor.stop()
  }

  return {
    plan,
    weeks,
    days,
    activeWeekIndex,
    activeDayId,
    activeWeek,
    activeDay,
    extendingDayId,
    uploadingMaterial,
    uploadMessage,
    jobState: jobMonitor.state,
    isPlanGenerating,
    loading,
    errorMessage,
    loadPlan,
    selectWeek,
    selectDay,
    extendDay,
    uploadMaterial,
    taskContent,
    clearPlan,
    refreshJob: jobMonitor.refresh,
  }
})
