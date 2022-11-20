// number.value 只会 访问 value 这个属性，我们不需要 proxy

import { isObject } from '@gy/utils/src'
import { track, trigger } from './effect'
import { reactive } from './reactive'
// 利用 class 的 getter 和 setter 即可
export function ref (val) {
  return new RefImp(val)
}

class RefImp {
  isRef: boolean
  _val: any
  constructor(val) {
    this.isRef = true
    this._val = covert(val)
  }

  get value () {
    track(this, 'ref-get', 'value')
    return this._val
  }

  set value (newVal) {
    if (newVal !== this._val) {
      this._val = newVal
      trigger(this, 'ref-set', 'value')
    }
  }
}

function covert (val) {
  return isObject(val) ? reactive(val) : val
}

export function isRef (val): boolean {
  return val.isRef
}
