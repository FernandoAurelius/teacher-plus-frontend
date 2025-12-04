export type ContentBlockStatus =
  | "new"
  | "ready"
  | "in_progress"
  | "done"
  | "completed"
  | "review"
  | "blocked"

export interface ContentBlockBase {
  id: string
  title: string
  status: ContentBlockStatus
  summary?: string
  tags?: string[]
  favorite?: boolean
  estimateMinutes?: number
  updatedAt?: string
}

export interface ContentBlockMeta {
  label: string
  tone: "info" | "success" | "warning" | "danger" | "muted"
}

const statusMetaMap: Record<ContentBlockStatus, ContentBlockMeta> = {
  new: { label: "Novo", tone: "info" },
  ready: { label: "Pronto", tone: "info" },
  in_progress: { label: "Em andamento", tone: "info" },
  review: { label: "Revisar", tone: "warning" },
  done: { label: "Concluído", tone: "success" },
  completed: { label: "Concluído", tone: "success" },
  blocked: { label: "Bloqueado", tone: "danger" },
}

const defaultMeta: ContentBlockMeta = { label: "Em progresso", tone: "info" }

export const getContentBlockMeta = (status: ContentBlockStatus | string | undefined): ContentBlockMeta =>
  statusMetaMap[(status as ContentBlockStatus) ?? "new"] ?? defaultMeta
