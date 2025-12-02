import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core'
import { z } from 'zod'

const RoleEnum = z.enum(['user', 'assistant', 'system'])
const ChatMessage = z.object({ role: RoleEnum, content: z.string() }).passthrough()
const ChatRequest = z
  .object({ messages: z.array(ChatMessage), stream: z.boolean().optional().default(false) })
  .passthrough()
const ChatResponse = z.object({ reply: z.string() }).passthrough()
const DocumentIngest = z
  .object({ id: z.string().uuid().optional(), title: z.string().max(255), text: z.string() })
  .passthrough()
const DocumentIngestResponse = z
  .object({ document_id: z.string().uuid(), chunks: z.number().int() })
  .passthrough()
const JobStatus = z
  .object({
    job_id: z.string(),
    status: z.string(),
    result: z.object({}).partial().passthrough().nullish(),
    error: z.string().optional(),
  })
  .passthrough()
const SearchResult = z.object({ text: z.string(), score: z.number() }).passthrough()
const StudyPlanSummary = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    status: z.string(),
    generation_status: z.string(),
    last_error: z.string(),
    job_id: z.string().nullable(),
    summary: z.string(),
    total_days: z.number().int(),
    current_week: z.string(),
    generated_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough()
const StudyTask = z
  .object({
    id: z.string().uuid(),
    day: z.string().uuid(),
    order: z.number().int(),
    task_type: z.string(),
    status: z.string(),
    title: z.string(),
    description: z.string(),
    duration_minutes: z.number().int(),
    resources: z.array(z.object({}).partial().passthrough()),
    section_id: z.string().nullable(),
    difficulty: z.number().int().nullable(),
    research_needed: z.boolean().nullable(),
    content_type: z.string().nullable(),
    content: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough(),
  })
  .passthrough()
const StudyDay = z
  .object({
    id: z.string().uuid(),
    day_index: z.number().int(),
    scheduled_date: z.string().nullable(),
    title: z.string(),
    focus: z.string(),
    target_minutes: z.number().int(),
    status: z.string(),
    section_id: z.string().nullable(),
    prerequisites: z.array(z.string()),
    week_index: z.number().int().nullable(),
    tasks: z.array(StudyTask),
    metadata: z.object({}).partial().passthrough(),
    generation_status: z.string().nullable(),
    job_id: z.string().nullable(),
    last_error: z.string().nullable(),
  })
  .passthrough()
const StudyWeek = z
  .object({
    id: z.string().uuid(),
    week_index: z.number().int(),
    title: z.string(),
    focus: z.string(),
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
    status: z.string(),
    metadata: z.object({}).partial().passthrough(),
    days: z.array(StudyDay),
  })
  .passthrough()
const StudyPlan = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    summary: z.string(),
    status: z.string(),
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
    total_days: z.number().int(),
    metadata: z.object({}).partial().passthrough(),
    weeks: z.array(StudyWeek),
    days: z.array(StudyDay),
    rag_document_ids: z.array(z.string().uuid()),
    generation_status: z.string(),
    last_error: z.string(),
    job_id: z.string().nullable(),
  })
  .passthrough()
const CreateStudyDayRequest = z
  .object({
    week_id: z.string().uuid().nullable(),
    scheduled_date: z.string().nullable(),
    title: z.string(),
    focus: z.string(),
    target_minutes: z.number().int().gte(0),
    goal_override: z.string(),
    context_snapshot: z.object({}).partial().passthrough(),
    metadata: z.object({}).partial().passthrough(),
    auto_generate: z.boolean().default(true),
    reset_existing: z.boolean().default(true),
  })
  .partial()
  .passthrough()
const CreateStudyDayResponse = z
  .object({ plan_id: z.string().uuid(), job_id: z.string().nullish(), day: StudyDay })
  .passthrough()
const GenerateDayRequest = z
  .object({ reset_existing: z.boolean().default(true) })
  .partial()
  .passthrough()
const StatusEnum = z.enum(['pending', 'ready', 'in_progress', 'completed'])
const StudyDayResult = z
  .object({
    status: StatusEnum,
    minutes_spent: z.number().int().gte(0),
    score: z.number(),
    notes: z.string(),
    payload: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough()
const PlanMaterialUpload = z
  .object({ title: z.string().optional(), file: z.string().url() })
  .passthrough()
const PlanMaterialUploadResponse = z
  .object({ document_id: z.string().uuid(), chunks: z.number().int(), file_id: z.string().uuid() })
  .passthrough()
const GenerateTasksRequest = z.object({ section_id: z.string() }).passthrough()
const StudyPlanWeekOverview = z
  .object({ plan_id: z.string().uuid(), weeks: z.array(StudyWeek) })
  .passthrough()
const GeneratePlanRequest = z
  .object({ title: z.string(), goal_override: z.string() })
  .partial()
  .passthrough()
const TaskProgressRequest = z
  .object({
    status: StatusEnum,
    minutes_spent: z.number().int().gte(0).optional().default(0),
    notes: z.string().nullish(),
    payload: z.object({}).partial().passthrough().optional(),
  })
  .passthrough()
const Login = z.object({ username: z.string(), password: z.string() }).passthrough()
const LoginResponse = z.object({ detail: z.string(), has_user_context: z.boolean() }).passthrough()
const UserRead = z
  .object({
    id: z.string().uuid(),
    username: z
      .string()
      .max(150)
      .regex(/^[\w.@+-]+$/),
    email: z.string().max(254).email().optional(),
    first_name: z.string().max(150).optional(),
    last_name: z.string().max(150).optional(),
  })
  .passthrough()
const RefreshResponse = z.object({ detail: z.string() }).passthrough()
const StudyContext = z
  .object({
    plan_label: z.string().max(120).optional(),
    start_date: z.string().nullish(),
    end_date: z.string().nullish(),
    persona: z.string().max(20),
    goal: z.string().max(100),
    deadline: z.string(),
    weekly_time_hours: z.number().int().gte(-2147483648).lte(2147483647),
    study_routine: z.string(),
    background_level: z.string().max(2000),
    self_assessment: z.unknown().nullish(),
    diagnostic_status: z.string().max(20).nullish(),
    diagnostic_snapshot: z.unknown().nullish(),
    interests: z.unknown().optional(),
    preferences_formats: z.unknown().optional(),
    preferences_language: z.string().max(50),
    preferences_accessibility: z.unknown().optional(),
    tech_device: z.string().max(100),
    tech_connectivity: z.string().max(100),
    notifications: z.string().max(100),
    consent_lgpd: z.boolean().optional(),
    materials: z.array(z.string().uuid()).optional(),
  })
  .passthrough()
const UserWrite = z
  .object({
    username: z
      .string()
      .max(150)
      .regex(/^[\w.@+-]+$/),
    email: z.string().max(254).email().optional(),
    first_name: z.string().max(150).optional(),
    last_name: z.string().max(150).optional(),
    password: z.string(),
  })
  .passthrough()

export const schemas = {
  RoleEnum,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  DocumentIngest,
  DocumentIngestResponse,
  JobStatus,
  SearchResult,
  StudyPlanSummary,
  StudyTask,
  StudyDay,
  StudyWeek,
  StudyPlan,
  CreateStudyDayRequest,
  CreateStudyDayResponse,
  GenerateDayRequest,
  StatusEnum,
  StudyDayResult,
  PlanMaterialUpload,
  PlanMaterialUploadResponse,
  GenerateTasksRequest,
  StudyPlanWeekOverview,
  GeneratePlanRequest,
  TaskProgressRequest,
  Login,
  LoginResponse,
  UserRead,
  RefreshResponse,
  StudyContext,
  UserWrite,
}
 
export const endpoints = makeApi([
  {
    method: 'post',
    path: '/api/ai/chat/',
    alias: 'chatWithAI',
    description: `
        Envia uma mensagem de chat e recebe uma resposta completa (não-streaming).

        **Uso**: Para respostas rápidas ou quando streaming não é necessário.
        **Limitações**: Não suporta tool calls interativos ou geração de plano de estudos.
        **Alternativa**: Use /api/ai/chat/sse/ para funcionalidades completas com streaming.
        `,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ChatRequest,
      },
    ],
    response: z.object({ reply: z.string() }).passthrough(),
    errors: [
      {
        status: 400,
        schema: ChatRequest,
      },
    ],
  },
  {
    method: 'post',
    path: '/api/ai/chat/stream/',
    alias: 'streamChatWithAI',
    description: `
        Estabelece uma conexão Server-Sent Events (SSE) para streaming de respostas de chat.

        **Funcionalidades**:
        - Streaming em tempo real com eventos estruturados
        - Suporte a tool calls (ex: commit_user_context para onboarding)
        - Geração automática de plano de estudos após commit
        - Controle de sessão com meta-eventos

        **Eventos SSE**:
        - &#x60;meta&#x60;: Controle da sessão (started, committed, finished)
        - &#x60;token&#x60;: Fragmentos de texto gerado
        - &#x60;heartbeat&#x60;: Progresso durante tool calls
        - &#x60;error&#x60;: Tratamento de erros

        **Fluxo típico**: session_started → tokens (assistant_response) → [tool calls] → [plan generation] → session_finished
        `,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ChatRequest,
      },
    ],
    response: z.unknown(),
  },
  {
    method: 'post',
    path: '/api/ai/index/',
    alias: 'indexDocument',
    description: `Ingests a document, chunks it, embeds the chunks, and stores them.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: DocumentIngest,
      },
    ],
    response: DocumentIngestResponse,
    errors: [
      {
        status: 400,
        schema: DocumentIngest,
      },
    ],
  },
  {
    method: 'get',
    path: '/api/ai/jobs/:job_id/',
    alias: 'jobStatus',
    description: `Consulta status de um job Celery.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'job_id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: JobStatus,
  },
  {
    method: 'get',
    path: '/api/ai/jobs/stream/',
    alias: 'jobStatusStream',
    description: `SSE que streama mudancas de status de um job Celery.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'job_id',
        type: 'Query',
        schema: z.string(),
      },
    ],
    response: z.unknown(),
  },
  {
    method: 'get',
    path: '/api/ai/search/',
    alias: 'searchDocuments',
    description: `Performs a semantic search based on the query.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'k',
        type: 'Query',
        schema: z.number().int().optional().default(5),
      },
      {
        name: 'q',
        type: 'Query',
        schema: z.string(),
      },
    ],
    response: z.array(SearchResult),
    errors: [
      {
        status: 400,
        schema: z.unknown(),
      },
    ],
  },
  {
    method: 'get',
    path: '/api/ai/study-plans/',
    alias: 'listStudyPlans',
    description: `Lista os planos de estudo do usuario autenticado.`,
    requestFormat: 'json',
    response: z.array(StudyPlanSummary),
  },
  {
    method: 'get',
    path: '/api/ai/study-plans/:plan_id/',
    alias: 'getStudyPlan',
    description: `Retorna um plano de estudo com secoes e tarefas.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'plan_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: StudyPlan,
  },
  {
    method: 'post',
    path: '/api/ai/study-plans/:plan_id/days/',
    alias: 'createStudyPlanDay',
    description: `Cria um novo dia no plano e opcionalmente aciona a IA para gerar tarefas sob demanda.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: CreateStudyDayRequest,
      },
      {
        name: 'plan_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: CreateStudyDayResponse,
  },
  {
    method: 'post',
    path: '/api/ai/study-plans/:plan_id/days/:day_id/generate/',
    alias: 'generateStudyDay',
    description: `Gera ou regenera as tarefas de um dia especifico do plano de forma assincrona.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z
          .object({ reset_existing: z.boolean().default(true) })
          .partial()
          .passthrough(),
      },
      {
        name: 'day_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'plan_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({ job_id: z.string(), plan_id: z.string(), day_id: z.string() })
      .partial()
      .passthrough(),
  },
  {
    method: 'post',
    path: '/api/ai/study-plans/:plan_id/days/:day_id/results/',
    alias: 'recordStudyDayResult',
    description: `Persiste resultados agregados de um dia (status, notas, minutos, score).`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: StudyDayResult,
      },
      {
        name: 'day_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'plan_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: StudyDay,
  },
  {
    method: 'post',
    path: '/api/ai/study-plans/:plan_id/materials/',
    alias: 'uploadStudyPlanMaterial',
    description: `Faz upload de arquivo, associa ao plano e o ingere no RAG (Document + chunks).`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: PlanMaterialUpload,
      },
      {
        name: 'plan_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: PlanMaterialUploadResponse,
  },
  {
    method: 'post',
    path: '/api/ai/study-plans/:plan_id/tasks/',
    alias: 'generateSectionTasks',
    description: `Gera e persiste novas tarefas para uma secao especifica do plano.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ section_id: z.string() }).passthrough(),
      },
      {
        name: 'plan_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.array(StudyTask),
  },
  {
    method: 'get',
    path: '/api/ai/study-plans/:plan_id/weeks/',
    alias: 'listStudyPlanWeeks',
    description: `Retorna apenas o esqueleto semanal (foco/status/dias) de um plano de estudos.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'plan_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: StudyPlanWeekOverview,
  },
  {
    method: 'post',
    path: '/api/ai/study-plans/generate/',
    alias: 'generateStudyPlan',
    description: `Gera um plano de estudo + tarefas iniciais via IA, persistindo secoes e tarefas.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: GeneratePlanRequest,
      },
    ],
    response: StudyPlan,
  },
  {
    method: 'post',
    path: '/api/ai/study-tasks/:task_id/progress/',
    alias: 'updateStudyTaskProgress',
    description: `Atualiza status/progresso de uma tarefa (flashcards, quiz, leitura, etc.) e recalcula o status do dia.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: TaskProgressRequest,
      },
      {
        name: 'task_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z
      .object({
        task_id: z.string(),
        plan_id: z.string(),
        day_id: z.string(),
        status: z.string(),
        day_status: z.string(),
        metadata: z.object({}).partial().passthrough(),
      })
      .partial()
      .passthrough(),
  },
  {
    method: 'post',
    path: '/api/login/',
    alias: 'loginUser',
    description: `Authenticates a user and sets access and refresh tokens as cookies.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Login,
      },
    ],
    response: LoginResponse,
    errors: [
      {
        status: 401,
        schema: LoginResponse,
      },
    ],
  },
  {
    method: 'post',
    path: '/api/logout/',
    alias: 'logoutUser',
    description: `Logs out the user by deleting access and refresh token cookies.`,
    requestFormat: 'json',
    response: z.unknown(),
  },
  {
    method: 'get',
    path: '/api/me/',
    alias: 'getCurrentUser',
    description: `Retrieves the current authenticated user&#x27;s data.`,
    requestFormat: 'json',
    response: UserRead,
  },
  {
    method: 'post',
    path: '/api/refresh/',
    alias: 'refreshUserToken',
    description: `Refreshes the access token using the refresh token from cookies.`,
    requestFormat: 'json',
    response: z.object({ detail: z.string() }).passthrough(),
    errors: [
      {
        status: 401,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/api/study-context/',
    alias: 'getStudyContext',
    description: `Retrieves the current authenticated user&#x27;s context if it exists.`,
    requestFormat: 'json',
    response: StudyContext,
    errors: [
      {
        status: 404,
        schema: z.unknown(),
      },
    ],
  },
  {
    method: 'post',
    path: '/api/study-context/',
    alias: 'upsertStudyContext',
    description: `Updates or creates user context information.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: StudyContext,
      },
    ],
    response: StudyContext,
    errors: [
      {
        status: 400,
        schema: StudyContext,
      },
    ],
  },
  {
    method: 'get',
    path: '/api/user-context/',
    alias: 'getStudyContext_2',
    description: `Retrieves the current authenticated user&#x27;s context if it exists.`,
    requestFormat: 'json',
    response: StudyContext,
    errors: [
      {
        status: 404,
        schema: z.unknown(),
      },
    ],
  },
  {
    method: 'post',
    path: '/api/user-context/',
    alias: 'upsertStudyContext_2',
    description: `Updates or creates user context information.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: StudyContext,
      },
    ],
    response: StudyContext,
    errors: [
      {
        status: 400,
        schema: StudyContext,
      },
    ],
  },
  {
    method: 'get',
    path: '/api/users/',
    alias: 'listUsers',
    description: `Retrieves a list of all users.`,
    requestFormat: 'json',
    response: z.array(UserRead),
  },
  {
    method: 'post',
    path: '/api/users/',
    alias: 'createUser',
    description: `Creates a new user.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: UserWrite,
      },
    ],
    response: UserRead,
    errors: [
      {
        status: 400,
        schema: UserWrite,
      },
    ],
  },
  {
    method: 'get',
    path: '/api/users/:id/',
    alias: 'retrieveUser',
    description: `Retrieves details of a specific user.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: UserRead,
  },
  {
    method: 'put',
    path: '/api/users/:id/',
    alias: 'updateUser',
    description: `Updates details of a specific user.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: UserWrite,
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: UserRead,
    errors: [
      {
        status: 400,
        schema: UserWrite,
      },
    ],
  },
  {
    method: 'delete',
    path: '/api/users/:id/',
    alias: 'deleteUser',
    description: `Deletes a specific user.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.unknown(),
  },
])

export const api = new Zodios(endpoints)

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options)
}
