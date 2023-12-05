export default function getBytesRemaining(fileProgress: {
  bytesTotal: number
  bytesUploaded: number
}): number {
  return fileProgress.bytesTotal - fileProgress.bytesUploaded
}
