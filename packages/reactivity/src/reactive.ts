import { toRawType } from '@gy/utils/src'
import { baseHandlers, shadowReactiveHandlers } from './baseHandlers'
import { collectionHandlers } from './collectionHandlers'

// 这里对于每一种数据类型，处理为响应式方式自然是不一样的
// 对于 {}  [] 使用 proxy 的 set get等方式
// 对于 number string 使用 ref方式
// 而对于 map set weakmap weakset 方式 依然用 proxy 但是会有特殊处理，
// 对于普通对象 let obj = { name: '孙悟空' }， 调用 obj.name 触发 get 操作，obj.name = "猪八戒" 触发 set 操作， 但是 key 是 name
// 对于 let set = new Set([1])  set.add(2), 触发的也是 get 操作，但是 key 是 add

const enum TargetType {
  INVALID = 0,
  COMMON = 1, // 普通对象
  COLLECTION = 2, // set map + weakxxx
}

function targetTypeMap (type: string) {
  switch (type) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}

export function reactive (obj): any {
  const handlders = targetTypeMap(toRawType(obj)) === TargetType.COMMON ? baseHandlers : collectionHandlers
  return new Proxy(obj, handlders)
}

export function shadowReactive (obj) {
  const handlders = targetTypeMap(toRawType(obj)) === TargetType.COMMON ? shadowReactiveHandlers : collectionHandlers
  return new Proxy(obj, handlders)
}
