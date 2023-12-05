import UIPlugin from '../UIPlugin.ts'

export default class InvalidPluginWithoutType extends UIPlugin<any, any, any> {
  public id: string

  public name: string

  constructor(uppy, opts) {
    super(uppy, opts)
    this.id = 'InvalidPluginWithoutType'
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
