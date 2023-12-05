import getSpeed from './getSpeed.ts'
import getBytesRemaining from './getBytesRemaining.ts'
import type { FileProgress } from './FileProgress.ts'

type NonNullableFileProgress = Omit<
  FileProgress,
  | 'preprocess'
  | 'postprocess'
  | 'bytesTotal'
  | 'bytesUploaded'
  | 'uploadStarted'
> & {
  bytesTotal: number
  bytesUploaded: number
  uploadStarted: number
}

export default function getETA(fileProgress: NonNullableFileProgress): number {
  if (!fileProgress.bytesUploaded) return 0

  const uploadSpeed = getSpeed(fileProgress)
  const bytesRemaining = getBytesRemaining(fileProgress)
  const secondsRemaining = Math.round((bytesRemaining / uploadSpeed) * 10) / 10

  return secondsRemaining
}
