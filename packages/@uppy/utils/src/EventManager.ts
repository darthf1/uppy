import type { Uppy } from '@uppy/core'
import type { Meta, Body, UppyFile } from './UppyFile'
/**
 * Create a wrapper around an event emitter with a `remove` method to remove
 * all events that were added using the wrapped emitter.
 */
export default class EventManager<M extends Meta, B extends Body> {
  #uppy: Uppy<M, B>

  #events: any[] = []

  constructor(uppy: Uppy<M, B>) {
    this.#uppy = uppy
  }

  on(event: string, fn: (...args: any[]) => void): Uppy<M, B> {
    this.#events.push([event, fn])
    // @ts-expect-error string is fine
    return this.#uppy.on(event, fn)
  }

  remove(): void {
    for (const [event, fn] of this.#events.splice(0)) {
      this.#uppy.off(event, fn)
    }
  }

  onFilePause(
    fileID: UppyFile<M, B>['id'],
    cb: (isPaused: boolean) => void,
  ): void {
    this.on('upload-pause', (targetFileID, isPaused) => {
      if (fileID === targetFileID) {
        cb(isPaused)
      }
    })
  }

  onFileRemove(
    fileID: UppyFile<M, B>['id'],
    cb: (isPaused: UppyFile<M, B>['id']) => void,
  ): void {
    this.on('file-removed', (file) => {
      if (fileID === file.id) cb(file.id)
    })
  }

  onPause(fileID: UppyFile<M, B>['id'], cb: (isPaused: boolean) => void): void {
    this.on('upload-pause', (targetFileID, isPaused) => {
      if (fileID === targetFileID) {
        // const isPaused = this.#uppy.pauseResume(fileID)
        cb(isPaused)
      }
    })
  }

  onRetry(fileID: UppyFile<M, B>['id'], cb: () => void): void {
    this.on('upload-retry', (targetFileID) => {
      if (fileID === targetFileID) {
        cb()
      }
    })
  }

  onRetryAll(fileID: UppyFile<M, B>['id'], cb: () => void): void {
    this.on('retry-all', () => {
      if (!this.#uppy.getFile(fileID)) return
      cb()
    })
  }

  onPauseAll(fileID: UppyFile<M, B>['id'], cb: () => void): void {
    this.on('pause-all', () => {
      if (!this.#uppy.getFile(fileID)) return
      cb()
    })
  }

  onCancelAll(
    fileID: UppyFile<M, B>['id'],
    eventHandler: (...args: any[]) => void,
  ): void {
    this.on('cancel-all', (...args) => {
      if (!this.#uppy.getFile(fileID)) return
      eventHandler(...args)
    })
  }

  onResumeAll(fileID: UppyFile<M, B>['id'], cb: () => void): void {
    this.on('resume-all', () => {
      if (!this.#uppy.getFile(fileID)) return
      cb()
    })
  }
}
