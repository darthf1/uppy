import UIPlugin from '../UIPlugin.ts'

export default class InvalidPluginWithoutName extends UIPlugin<any, any, any> {
  public type: string

  public name: string

  constructor(uppy, opts) {
    super(uppy, opts)
    this.type = 'acquirer'
    this.name = this.constructor.name
  }

  run(results) {
    this.uppy.log({
      class: this.constructor.name,
      method: 'run',
      results,
    })

    return Promise.resolve('success')
  }
}
