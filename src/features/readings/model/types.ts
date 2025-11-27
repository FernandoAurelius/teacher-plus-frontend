import type { ContentBlockBase } from "@/entities/content-block"

export interface ReadingItem extends ContentBlockBase {
  estimateMinutes?: number
  content?: string
  favorite?: boolean
}
