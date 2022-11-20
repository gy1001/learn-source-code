import { track, trigger } from './index'

export const COL_KEY = Symbol('collection')

export const ReactiveFlags = {
  RAW: '__v_raw',
}

export const collectionActions = {
  add (key) {
    const target = this[ReactiveFlags.RAW]
    const result = target.add(key)
    trigger(target, 'collection-add', key)
    return result
  },
  delete (key) {
    const target = this[ReactiveFlags.RAW]
    const result = target.delete(key)
    trigger(target, 'collection-delete', key)
    return result
  },
  has (key) {
    const target = this[ReactiveFlags.RAW]
    const result = target.has(key)
    trigger(target, 'collection-has', key)
    return result
  },
}

export const collectionHandlers = {
  get (target, key) {
    if (key === ReactiveFlags.RAW)
      return target
    if (key === 'size') {
      track(target, 'collection-size', COL_KEY)
      return Reflect.get(target, key)
    }
    // // set.add  set.delete set.has 等等
    return collectionActions[key]
  },
}
