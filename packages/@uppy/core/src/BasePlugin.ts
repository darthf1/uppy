/* eslint-disable @typescript-eslint/no-empty-function */

/**
 * Core plugin logic that all plugins share.
 *
 * BasePlugin does not contain DOM rendering so it can be used for plugins
 * without a user interface.
 *
 * See `Plugin` for the extended version with Preact rendering for interfaces.
 */

import Translator from '@uppy/utils/lib/Translator'
import type { I18n } from '@uppy/utils/src/Translator'
import type { Uppy } from '.'

export default class BasePlugin<Opts extends Record<string, unknown>> {
  uppy: Uppy

  opts: Opts

  id: string

  defaultLocale: Translator.Locale

  i18n: I18n

  i18nArray: Translator['translateArray']

  constructor(uppy: Uppy, opts: Opts) {
    this.uppy = uppy
    this.opts = opts ?? {}
  }

  getPluginState<T extends Record<string, unknown>>(): T {
    const { plugins } = this.uppy.getState()
    return plugins[this.id] || {}
  }

  setPluginState(update: unknown): void {
    if (!update) return
    const { plugins } = this.uppy.getState()

    this.uppy.setState({
      plugins: {
        ...plugins,
        [this.id]: {
          ...plugins[this.id],
          ...update,
        },
      },
    })
  }

  setOptions(newOpts: Partial<Opts>): void {
    this.opts = { ...this.opts, ...newOpts }
    this.setPluginState(undefined) // so that UI re-renders with new options
    this.i18nInit()
  }

  i18nInit () {
    const onMissingKey = (key) => this.uppy.log(`Missing i18n string: ${key}`, 'error')
    const translator = new Translator([this.defaultLocale, this.uppy.locale, this.opts.locale], { onMissingKey })
    this.i18n = translator.translate.bind(translator)
    this.i18nArray = translator.translateArray.bind(translator)
    this.setPluginState(undefined) // so that UI re-renders and we see the updated locale
  }

  /**
   * Extendable methods
   * ==================
   * These methods are here to serve as an overview of the extendable methods as well as
   * making them not conditional in use, such as `if (this.afterUpdate)`.
   */

  // eslint-disable-next-line class-methods-use-this
  addTarget(): void {
    throw new Error(
      "Extend the addTarget method to add your plugin to another plugin's target",
    )
  }

  // eslint-disable-next-line class-methods-use-this
  install(): void {}

  // eslint-disable-next-line class-methods-use-this
  uninstall(): void {}

  /**
   * Called when plugin is mounted, whether in DOM or into another plugin.
   * Needed because sometimes plugins are mounted separately/after `install`,
   * so this.el and this.parent might not be available in `install`.
   * This is the case with @uppy/react plugins, for example.
   */
  render(): void {
    throw new Error(
      'Extend the render method to add your plugin to a DOM element',
    )
  }

  // eslint-disable-next-line class-methods-use-this
  update(): void {}

  // Called after every state update, after everything's mounted. Debounced.
  // eslint-disable-next-line class-methods-use-this
  afterUpdate(): void {}
}
