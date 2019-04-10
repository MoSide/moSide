import {TypeProvider} from './type-provider.interface'
import {logger} from '../utils/logger'
import {IParameter} from './parameter.interface'
import {CtrFunc} from './ctr-func'

export class FunctionInjector {

  THROW_ERROR: boolean = true
  private params: Map<any, any> = new Map()
  private parent: FunctionInjector

  protected constructor() {
  }

  static create(providers: TypeProvider[], throwError: boolean = true): FunctionInjector {
    const fun = new FunctionInjector()
    fun.THROW_ERROR = throwError
    fun.push([{type: FunctionInjector, useValue: this}, ...providers])
    return fun
  }

  createChild(providers?: TypeProvider[]): FunctionInjector {
    const injector = FunctionInjector.create(providers || [], this.THROW_ERROR)
    injector.parent = this
    return injector
  }

  push(providers: TypeProvider[]) {
    providers.forEach(({type, useValue}) => {
      // todo 此处应抛出错误？
      if (type === null || type === undefined) {
        return logger.debug(`a provider hasn't prop 'type' or 'useValue`)
      }

      if (useValue === undefined) {
        return logger.debug(`a provider hasn't prop 'type' or 'useValue`)
      }

      this.params.set(type, useValue)
    })
  }

  get(type: any | any[]): any {
    if (Array.isArray(type)) {
      return type.map(t => {
        return this.getParam(t) || null
      })
    } else {
      return this.getParam(type)
    }
  }

  async resolveAndApply(target: CtrFunc | CtrFunc[]): Promise<any | any[]> {
    if (Array.isArray(target)) {
      const result: any = []
      for (const cFunc of target) {
        result.push(
          await this._resolveAndApply(cFunc)
        )
      }
    } else {
      return this._resolveAndApply(target)
    }
  }

  async _resolveAndApply(func: CtrFunc): Promise<any> {
    return await func.apply(
      this.resolve(func)
    )
  }

  resolve(cFunc: CtrFunc): any[] {
    const cFunParams: IParameter[] = cFunc.parameters

    return cFunParams.map(parameter => {
      const type = parameter.target || parameter.type
      const param = this.getParam(type)

      if (param === void 0) {
        throw new Error(
          `${cFunc.targetType.name}(${cFunc.prop}) -> ${parameter.type.name || parameter.type} has no provider`
        )
      }

      return param || null
    })
  }

  private getParam(type: any) {
    if (this.params.has(type)) {
      return this.params.get(type)
    } else {
      if (this.parent) {
        return this.parent.getParam(type)
      } else {
        return void 0
      }
    }
  }
}