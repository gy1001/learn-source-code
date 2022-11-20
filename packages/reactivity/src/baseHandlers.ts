import { isObject } from '@gy/utils/src'
import { ReactiveFlags } from './reactive'
import { reactive, track, trigger } from './index'

function createGetter (isShadow: Boolean) {
  return function get (target, key, receiver) {
    // 收集依赖关系
    // const value = target[key]
    // track(target, 'get', key)
    // return isObject(value) ? reactive(value) : value
    if (key === ReactiveFlags.IS_REACTIVE)
      return true
    // 使用 reflect
    const value = Reflect.get(target, key, receiver)
    track(target, 'get', key)
    if (isObject(value))
      return isShadow ? value : reactive(value)
    return value
  }
}

function setterFunc (target, key, val, reciever) {
  // 使用标准的 Reflect 来进行处理
  // 修改数据，执行副作用函数
  const result = Reflect.set(target, key, val, reciever)
  trigger(target, 'set', key)
  return result

  // 如果使用 普通的 target[key] 来进行处理呢，两者某些情况下是有区别的，可以解除注释来进行观察
  // target[key] = val
  // trigger(target, 'set', key)
  // return true
}

function deletePropertyFunc (target, key) {
  // 使用代理方式
  const result = Reflect.deleteProperty(target, key)
  trigger(target, 'delete', key)
  return result
  // 不使用 reflect 代理方式
  // delete target[key]
  // return true
}

export const baseHandlers = {
  get: createGetter(false),
  set: setterFunc,
  //  等等还有很多其他方法，如 deleteProperty ，delete obj.count 会触发
  deleteProperty: deletePropertyFunc,
}

export const shadowReactiveHandlers = {
  get: createGetter(true),
  set: setterFunc,
  deleteProperty: deletePropertyFunc,
}
