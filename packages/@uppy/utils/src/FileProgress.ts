export type FileProgress = {
  progress: number
  uploadComplete: boolean
  percentage: number
  bytesTotal: number | null
  uploadStarted: number | null
  bytesUploaded: number
  preprocess?: number
  postprocess?: number
}
