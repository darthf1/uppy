import type { FileProgress } from './FileProgress'

export type IndexedObject<T> = Record<string, T>

export type InternalMetadata = { name: string; type?: string }

export interface UppyFile<
  TMeta = IndexedObject<any>,
  TBody = IndexedObject<any>,
> {
  data: Blob | File
  error?: Error
  extension: string
  id: string
  isPaused?: boolean
  isRestored?: boolean
  isRemote: boolean
  isGhost: boolean
  meta: InternalMetadata & TMeta
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
    body: TBody
    status: number
    uploadURL: string | undefined
  }
}
