import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { client } from '@/shared/api/client'
import { schemas } from '@/shared/api/schemas'
import type { z } from 'zod'
import { useJobMonitor } from '@/shared/lib/jobs/useJobMonitor'
import { groupDaysByWeek, parseTaskContent } from '@/entities/study-plan'
import type { StudyPlan, StudyDay, StudyTask, StudyWeek } from '@/entities/study-plan'

const STORAGE_KEY = 'tp.portal.currentPlanId'

export const useStudyPlanWorkspaceStore = defineStore('studyPlanWorkspace', () => {
  const plan = ref<StudyPlan | null>(null)
  const loading = ref(false)
  const loadingWeeks = ref(false)
  const errorMessage = ref('')
  const activeWeekIndex = ref<number | null>(null)
  const activeDayId = ref<string | null>(null)
  const activeTaskId = ref<string | null>(null)
  const weekOverview = ref<StudyWeek[]>([])
  const extendingDayId = ref<string | null>(null)
  const generatingDayId = ref<string | null>(null)
  const creatingDay = ref(false)
  const updatingTaskId = ref<string | null>(null)
  const uploadingMaterial = ref(false)
  const uploadMessage = ref('')

  const jobMonitor = useJobMonitor({
    onSuccess: async () => {
      if (plan.value?.id) {
        await Promise.all([loadPlan(plan.value.id), loadWeekOverview(plan.value.id)])
      }
    },
  })

  const planId = computed(() => plan.value?.id ?? localStorage.getItem(STORAGE_KEY) ?? null)

  const requirePlanId = () => {
    const id = planId.value
    if (!id) {
      errorMessage.value = 'Nenhum plano selecionado.'
      toast.error('Nenhum plano selecionado. Abra um plano e tente novamente.')
      return null
    }
    return id
  }
  const weeks = computed(() => {
    if (plan.value?.weeks?.length) {
      return mapWeeks(plan.value.weeks)
    }
    if (weekOverview.value.length) return weekOverview.value
    return groupDaysByWeek(plan.value?.days ?? [])
  })
  const days = computed(() => plan.value?.days ?? [])
  const activeWeek = computed(() =>
    weeks.value.find((week) => week.weekIndex === (activeWeekIndex.value ?? weeks.value[0]?.weekIndex)),
  )
  const activeDay = computed(() =>
    days.value.find((day) => day.id === (activeDayId.value ?? activeWeek.value?.days[0]?.id)),
  )
  const activeTasks = computed(() => activeDay.value?.tasks ?? [])

  watch(
    () => activeDay.value?.id,
    () => {
      activeTaskId.value = activeDay.value?.tasks?.[0]?.id ?? null
    },
    { immediate: true },
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
    weekOverview.value = nextPlan.weeks?.length ? mapWeeks(nextPlan.weeks) : weekOverview.value
    const firstWeek = weekOverview.value[0] ?? nextPlan.weeks?.[0]
    activeWeekIndex.value = (firstWeek as any)?.weekIndex ?? nextPlan.days?.[0]?.week_index ?? 1
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
    weekOverview.value = []
    activeTaskId.value = null
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
      await loadWeekOverview(targetId)
    } catch (error) {
      console.error('Erro ao carregar plano', error)
      errorMessage.value = 'Nao conseguimos carregar o plano agora.'
    } finally {
      loading.value = false
    }
  }

  async function loadWeekOverview(id?: string) {
    const targetId = id ?? planId.value
    if (!targetId) return
    loadingWeeks.value = true
    try {
      const overview = await client.listStudyPlanWeeks({ params: { plan_id: targetId } })
      weekOverview.value = mapWeeks(overview.weeks)
    } catch (error) {
      console.error('Erro ao carregar resumo semanal', error)
    } finally {
      loadingWeeks.value = false
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

  const loadDay = async (planIdValue: string, dayId: string) => {
    await loadPlan(planIdValue)
    const targetDay = days.value.find((current) => current.id === dayId)
    if (targetDay) {
      selectDay(dayId)
      return targetDay
    }
    errorMessage.value = 'Dia nao encontrado para este plano.'
    return null
  }

  const setActiveTask = (taskId: string | null) => {
    activeTaskId.value = taskId
  }

  const extendDay = async (day: StudyDay) => {
    const id = requirePlanId()
    if (!id) return
    extendingDayId.value = day.id
    try {
      const response = await client.generateSectionTasks(
        { section_id: day.section_id },
        { params: { plan_id: id } },
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

  const generateDay = async (dayId: string) => {
    const id = requirePlanId()
    if (!id) return
    generatingDayId.value = dayId
    try {
      const response = await client.generateStudyDay(
        { reset_existing: false },
        { params: { plan_id: id, day_id: dayId } }
      )
      if (response.job_id) {
        jobMonitor.start(response.job_id)
      }
      toast.success('Solicitamos a geracao do dia', {
        description: 'Atualizaremos quando a IA concluir.',
      })
    } catch (error) {
      console.error('Erro ao gerar dia', error)
      toast.error('Nao foi possivel gerar este dia.')
    } finally {
      generatingDayId.value = null
    }
  }

  const createDay = async (weekId?: string | null) => {
    const id = requirePlanId()
    if (!id) return
    creatingDay.value = true
    try {
      const response = await client.createStudyPlanDay(
        { week_id: weekId ?? null, auto_generate: true }, { params: { plan_id: id } },
      )
      toast.success('Gerando dia sob demanda', {
        description: 'Atualizaremos assim que as tarefas ficarem prontas.',
      })
      activeDayId.value = response.day.id
      await Promise.all([loadPlan(id), loadWeekOverview(id)])
      return response.day
    } catch (error) {
      console.error('Erro ao gerar novo dia', error)
      toast.error('Nao conseguimos gerar um novo dia agora.')
      return null
    } finally {
      creatingDay.value = false
    }
  }

  type TaskProgressPayload = z.input<typeof schemas.TaskProgressRequest>

  const updateTaskProgress = async (
    taskId: string,
    payload: TaskProgressPayload | Partial<TaskProgressPayload>,
  ) => {
    updatingTaskId.value = taskId
    try {
      const status = (payload as TaskProgressPayload)?.status
      if (!status) {
        console.error('updateTaskProgress: status ausente', payload)
        toast.error('Status da tarefa ausente, tente novamente.')
        return null
      }
      const body: TaskProgressPayload = {
        status: status as TaskProgressPayload["status"],
        minutes_spent: payload.minutes_spent ?? 0,
        notes: payload.notes,
        payload: payload.payload,
      }
      console.log('Atualizando tarefa', taskId, body)
      const response = await client.updateStudyTaskProgress(body,
        { params: { task_id: taskId } },
      )
      toast.success('Tarefa atualizada', {
        description: 'Sincronizamos o status com o plano.',
      })
      await loadPlan(plan.value?.id ?? undefined)
      return response
    } catch (error) {
      console.error('Erro ao atualizar tarefa', error)
      toast.error('Nao foi possivel salvar o progresso.')
      return null
    } finally {
      updatingTaskId.value = null
    }
  }

  const uploadMaterial = async (formData: FormData) => {
    if (!planId.value) return
    uploadingMaterial.value = true
    uploadMessage.value = ''
    try {
      // usa axios direto para multipart, mantendo baseURL e credenciais do client
      const http = (client as any).axiosInstance ?? client
      const { data } = await http.post(`/api/ai/study-plans/${planId.value}/materials/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      uploadMessage.value = 'Processando material...'
      const jobId = (data as any)?.job_id
      if (jobId) jobMonitor.start(jobId)
    } catch (error) {
      console.error('Erro ao enviar material', error)
      uploadMessage.value = 'Nao conseguimos processar o arquivo.'
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
    generatingDayId,
    creatingDay,
    updatingTaskId,
    uploadingMaterial,
    uploadMessage,
    jobState: jobMonitor.state,
    isPlanGenerating,
    loading,
    loadingWeeks,
    errorMessage,
    loadPlan,
    loadWeekOverview,
    selectWeek,
    selectDay,
    loadDay,
    extendDay,
    generateDay,
    createDay,
    updateTaskProgress,
    uploadMaterial,
    taskContent,
    activeTaskId,
    activeTasks,
    setActiveTask,
    clearPlan,
    refreshJob: jobMonitor.refresh,
  }
})

function mapWeeks(weeks: StudyPlan["weeks"]): StudyWeek[] {
  return weeks.map((week) => ({
    id: (week as any).id ?? null,
    weekIndex: week.week_index,
    title: week.title ?? `Semana ${week.week_index}`,
    status: (week as any).status ?? 'pending',
    summary: (week as any).summary ?? week.focus ?? '',
    startDate: (week as any).start_date ?? null,
    endDate: (week as any).end_date ?? null,
    days: week.days ?? [],
  }))
}
