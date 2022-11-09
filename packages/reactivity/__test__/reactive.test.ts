import { describe, expect, it } from 'vitest'

import { effect, reactive } from '../src/index'

describe('响应式', () => {
  it('reactive基本功能', () => {
    const obj = reactive({ count: 1 })
    let value
    effect(() => {
      value = obj.count
    })
    expect(value).toBe(1)
    obj.count++
    expect(value).toBe(2) // effect 副作用执行了
  })
})
