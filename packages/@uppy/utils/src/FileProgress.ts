export type FileProgress = {
  progress?: number
  uploadComplete: boolean
  percentage: number
  bytesTotal: number | null
  uploadStarted: number | null
  bytesUploaded: number | null
  preprocess?: { mode: string; message?: string; value?: number }
  postprocess?: { mode: string; message?: string; value?: number }
}
