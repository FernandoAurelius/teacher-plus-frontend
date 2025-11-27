export type ContentBlockStatus =
  | "new"
  | "in_progress"
  | "done"
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
  in_progress: { label: "Em andamento", tone: "info" },
  review: { label: "Revisar", tone: "warning" },
  done: { label: "Concluido", tone: "success" },
  blocked: { label: "Bloqueado", tone: "danger" },
}

export const getContentBlockMeta = (status: ContentBlockStatus): ContentBlockMeta =>
  statusMetaMap[status]
