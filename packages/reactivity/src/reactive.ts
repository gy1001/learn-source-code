import { isObject } from '@gy/utils/src'
import { track, trigger } from './effect'

export function reactive (obj): any {
  return new Proxy(obj, {
    get (target, key) {
      // 收集依赖关系
      const value = target[key]
      track(target, 'get', key)
      return isObject(value) ? reactive(value) : value
    },
    set (target, key, val, reciever) {
      // 使用标准的 Reflect 来进行处理
      // 修改数据，执行副作用函数
      // const result = Reflect.set(target, key, val, reciever)
      // trigger(target, 'set', key)
      // return result

      // 如果使用 普通的 target[key] 来来进行处理呢，两者某些情况下是有区别的，可以解除注释来进行观察
      target[key] = val
      trigger(target, 'set', key)
      return true
    },
    //  等等还有很多其他方法，如 deleteProperty ，delete obj.count 会触发
  })
}
