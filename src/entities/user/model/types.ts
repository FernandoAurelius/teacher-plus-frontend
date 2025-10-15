import { z } from 'zod'
import { schemas } from '@/shared/api/schemas'

export type UserRead = z.infer<typeof schemas.UserRead>
export type UserWrite = z.infer<typeof schemas.UserWrite>
export type UserContext = z.infer<typeof schemas.UserContext>
