import type { FileProgress } from './FileProgress'

export type Meta = Record<string, unknown>

export type Body = Record<string, unknown>

export type InternalMetadata = { name: string; type?: string }

export interface UppyFile<M = Meta, B = Body> {
  data: Blob | File
  error?: Error
  extension: string
  id: string
  isPaused?: boolean
  isRestored?: boolean
  isRemote: boolean
  isGhost: boolean
  meta: InternalMetadata & M
  name: string
  preview?: string
  progress: FileProgress
  missingRequiredMetaFields?: string[]
  remote?: {
    host: string
    url: string
    body?: Record<string, unknown>
    provider?: string
    companionUrl: string
  }
  serverToken?: string
  size: number | null
  source?: string
  type?: string
  response?: {
    body: B
    status: number
    uploadURL: string | undefined
  }
}
