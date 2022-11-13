import { describe, expect, it } from 'vitest'

import { effect, reactive, ref } from '../src/index'

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

  it('ref基本功能', () => {
    const number = ref(1)
    let value
    effect(() => {
      value = number.value
    })
    expect(value).toBe(1)
    number.value++
    expect(value).toBe(2)
  })

  it('ref支持复杂数据类型', () => {
    const number = ref({ count: 1 })
    let value
    effect(() => {
      value = number.value.count
    })
    expect(value).toBe(1)
    number.value.count++
    expect(value).toBe(2)
  })
})
