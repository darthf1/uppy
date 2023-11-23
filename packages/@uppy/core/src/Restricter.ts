/* eslint-disable max-classes-per-file, class-methods-use-this */
// @ts-expect-error untyped
import prettierBytes from '@transloadit/prettier-bytes'
// @ts-expect-error untyped
import match from 'mime-match'
import Translator from '@uppy/utils/lib/Translator'
import type { UppyFile } from '@uppy/utils/lib/UppyFile'
import type { I18n } from '@uppy/utils/lib/Translator'
import type { UppyOptions } from '../types'

export type Restrictions = {
  maxFileSize: number | null
  minFileSize: number | null
  maxTotalFileSize: number | null
  maxNumberOfFiles: number | null
  minNumberOfFiles: number | null
  allowedFileTypes: string[] | null
  requiredMetaFields: string[]
}

const defaultOptions = {
  maxFileSize: null,
  minFileSize: null,
  maxTotalFileSize: null,
  maxNumberOfFiles: null,
  minNumberOfFiles: null,
  allowedFileTypes: null,
  requiredMetaFields: [],
}

class RestrictionError extends Error {
  isUserFacing: boolean

  file: UppyFile

  constructor(
    message: string,
    opts?: { isUserFacing?: boolean; file: UppyFile },
  ) {
    super(message)
    this.isUserFacing = opts?.isUserFacing ?? false
    if (opts?.file) {
      this.file = opts.file // only some restriction errors are related to a particular file
    }
  }

  isRestriction = true
}

class Restricter {
  i18n: Translator['translate']

  getOpts: () => UppyOptions

  constructor(getOpts: () => UppyOptions, i18n: I18n) {
    this.i18n = i18n
    this.getOpts = (): UppyOptions => {
      const opts = getOpts()

      if (
        opts.restrictions?.allowedFileTypes != null &&
        !Array.isArray(opts.restrictions.allowedFileTypes)
      ) {
        throw new TypeError('`restrictions.allowedFileTypes` must be an array')
      }
      return opts
    }
  }

  // Because these operations are slow, we cannot run them for every file (if we are adding multiple files)
  validateAggregateRestrictions(
    existingFiles: UppyFile[],
    addingFiles: UppyFile[],
  ): void {
    const { maxTotalFileSize, maxNumberOfFiles } = this.getOpts().restrictions

    if (maxNumberOfFiles) {
      const nonGhostFiles = existingFiles.filter((f) => !f.isGhost)
      if (nonGhostFiles.length + addingFiles.length > maxNumberOfFiles) {
        throw new RestrictionError(
          `${this.i18n('youCanOnlyUploadX', {
            smart_count: maxNumberOfFiles,
          })}`,
        )
      }
    }

    if (maxTotalFileSize) {
      let totalFilesSize = existingFiles.reduce((total, f) => total + f.size, 0)

      for (const addingFile of addingFiles) {
        if (addingFile.size != null) {
          // We can't check maxTotalFileSize if the size is unknown.
          totalFilesSize += addingFile.size

          if (totalFilesSize > maxTotalFileSize) {
            throw new RestrictionError(
              this.i18n('exceedsSize', {
                size: prettierBytes(maxTotalFileSize),
                file: addingFile.name,
              }),
            )
          }
        }
      }
    }
  }

  validateSingleFile(file: UppyFile): void {
    const { maxFileSize, minFileSize, allowedFileTypes } =
      this.getOpts().restrictions

    if (allowedFileTypes) {
      const isCorrectFileType = allowedFileTypes.some((type) => {
        // check if this is a mime-type
        if (type.includes('/')) {
          if (!file.type) return false
          return match(file.type.replace(/;.*?$/, ''), type)
        }

        // otherwise this is likely an extension
        if (type[0] === '.' && file.extension) {
          return file.extension.toLowerCase() === type.slice(1).toLowerCase()
        }
        return false
      })

      if (!isCorrectFileType) {
        const allowedFileTypesString = allowedFileTypes.join(', ')
        throw new RestrictionError(
          this.i18n('youCanOnlyUploadFileTypes', {
            types: allowedFileTypesString,
          }),
          { file },
        )
      }
    }

    // We can't check maxFileSize if the size is unknown.
    if (maxFileSize && file.size != null && file.size > maxFileSize) {
      throw new RestrictionError(
        this.i18n('exceedsSize', {
          size: prettierBytes(maxFileSize),
          file: file.name,
        }),
        { file },
      )
    }

    // We can't check minFileSize if the size is unknown.
    if (minFileSize && file.size != null && file.size < minFileSize) {
      throw new RestrictionError(
        this.i18n('inferiorSize', {
          size: prettierBytes(minFileSize),
        }),
        { file },
      )
    }
  }

  validate(existingFiles: UppyFile[], addingFiles: UppyFile[]): void {
    addingFiles.forEach((addingFile) => {
      this.validateSingleFile(addingFile)
    })
    this.validateAggregateRestrictions(existingFiles, addingFiles)
  }

  validateMinNumberOfFiles(files: UppyFile[]): void {
    const { minNumberOfFiles } = this.getOpts().restrictions
    if (minNumberOfFiles && Object.keys(files).length < minNumberOfFiles) {
      throw new RestrictionError(
        this.i18n('youHaveToAtLeastSelectX', { smart_count: minNumberOfFiles }),
      )
    }
  }

  getMissingRequiredMetaFields(file: UppyFile): {
    missingFields: string[]
    error: InstanceType<typeof RestrictionError>
  } | null {
    const error = new RestrictionError(
      this.i18n('missingRequiredMetaFieldOnFile', { fileName: file.name }),
    )
    const { requiredMetaFields } = this.getOpts().restrictions
    const missingFields = []

    for (const field of requiredMetaFields) {
      if (!Object.hasOwn(file.meta, field) || file.meta[field] === '') {
        missingFields.push(field)
      }
    }

    return { missingFields, error }
  }
}

export { Restricter, defaultOptions, RestrictionError }
