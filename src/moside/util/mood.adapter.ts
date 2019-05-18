import { PluginInterface } from '../../moon'
import { FunctionInjector, Injectable } from '../../function-injector'
import { MethodCtx } from './method-ctx'
import { Mood } from '../../mood/mood'
import { Ctx } from '../ctx'
import { Response } from '../../response-handler'

export class MoodAdapter implements PluginInterface {

  @Injectable
  beforeController(
    injector: FunctionInjector,
    {request: {params = {}, query = {}, body = {}}}: Ctx,
    {parameters}: MethodCtx,
    response: Response
  ) {
    const mood = Mood.create([
      ['params', params],
      ['query', query],
      ['body', body]
    ])
    const resolveResult = mood.resolve(parameters)
    if (resolveResult.result) {
      if (resolveResult.body) {
        injector.push(resolveResult.body)
      }
      return true
    } else {
      response.body({
        status: 10001,
        message: 'Can not resolve all params'
      })
      return false
    }
  }

}
