import {PluginInterface} from "../../moon/plugin.interface";
import {FunctionInjector} from "../../function-injector/function-injector";
import {MethodCtx} from "./method-ctx";
import {Mood} from "../../mood/mood";
import {Ctx} from "../ctx";
import {Injectable} from "../../function-injector/Injectable.decorator";

export class MoodAdapter implements PluginInterface {

  @Injectable
  beforeController(
    injector: FunctionInjector,
    {request: {param = {}, query = {}, body = {}}}: Ctx,
    {parameters}: MethodCtx
  ) {
    const mood = Mood.create([
      ['param', param],
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
      return false
    }
  }

}