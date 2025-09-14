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
const SearchResult = z.object({ text: z.string(), score: z.number() }).passthrough()
const Login = z.object({ username: z.string(), password: z.string() }).passthrough()
const LoginResponse = z.object({ detail: z.string() }).passthrough()
const RefreshResponse = z.object({ detail: z.string() }).passthrough()
const UserContext = z
  .object({
    persona: z.string().max(20),
    goal: z.string().max(100),
    deadline: z.string(),
    weekly_time_hours: z.number().int().gte(-2147483648).lte(2147483647),
    study_routine: z.string(),
    background_level: z.string().max(100),
    background_institution_type: z.string().max(20),
    self_assessment: z.unknown().optional(),
    diagnostic_status: z.string().max(20),
    diagnostic_snapshot: z.unknown().optional(),
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
const User = z
  .object({
    id: z.string().uuid(),
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
  SearchResult,
  Login,
  LoginResponse,
  RefreshResponse,
  UserContext,
  User,
}

export const endpoints = makeApi([
  {
    method: 'post',
    path: '/api/ai/chat/',
    alias: 'chatWithAI',
    description: `Sends a chat message and receives a response.`,
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
    description: `Establishes a Server-Sent Events (SSE) connection for streaming chat responses.`,
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
    response: z.object({ detail: z.string() }).passthrough(),
    errors: [
      {
        status: 401,
        schema: z.object({ detail: z.string() }).passthrough(),
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
    method: 'post',
    path: '/api/user-context/',
    alias: 'updateUserContext',
    description: `Updates or creates user context information.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: UserContext,
      },
    ],
    response: UserContext,
    errors: [
      {
        status: 400,
        schema: UserContext,
      },
    ],
  },
  {
    method: 'get',
    path: '/api/users/',
    alias: 'listUsers',
    description: `Retrieves a list of all users.`,
    requestFormat: 'json',
    response: z.array(User),
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
        schema: User,
      },
    ],
    response: User,
    errors: [
      {
        status: 400,
        schema: User,
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
    response: User,
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
        schema: User,
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: User,
    errors: [
      {
        status: 400,
        schema: User,
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
