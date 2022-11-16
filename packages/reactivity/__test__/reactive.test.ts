import { describe, expect, it, vi } from 'vitest'

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

  // 处理边缘 case
  it('reactive支持嵌套', () => {
    const obj = reactive({ count: 1, info: { usename: '孙悟空' } })
    let value
    effect(() => {
      value = obj.info.usename
    })
    expect(value).toBe('孙悟空')
    obj.info.usename = '唐僧'
    expect(value).toBe('唐僧')
  })

  it('删除属性的响应式', () => {
    const obj = reactive({ name: '孙悟空', age: 500 })
    let val
    effect(() => {
      val = obj.name
    })
    expect(val).toBe('孙悟空')
    delete obj.name
    expect(val).toBeUndefined()
  })
  it('why do we use reflect', () => {
    const obj = {
      _count: 1,
      get count () {
        return this._count
      },
    }
    const result = reactive(obj)
    const fn = vi.fn((arg) => { return arg })
    effect(() => {
      fn(result.count) //  触发的是 count 函数内部的 this._count
    })
    expect(fn).toBeCalledTimes(1)
    result._count++ // 这里更改后 如果不使用 reflect，普通的更新是无法被监听到的
    expect(fn).toBeCalledTimes(2)
  })

  it('支持set/map', () => {
    const set = reactive(new Set([1]))
    let val
    effect(() => {
      val = set.size
    })
    expect(val).toBe(1)
    set.add(2)
    expect(val).toBe(2)
  })

  it('set的删除', () => {
    const set = reactive(new Set([1, 2]))
    let val
    effect(() => {
      val = set.size
    })
    expect(val).toBe(2)
    set.delete(2)
    expect(val).toBe(1)
  })

  it('set的has', () => {
    const set = reactive(new Set([1, 2]))
    expect(set.has(1)).toBe(true)
    set.delete(1)
    expect(set.has(1)).toBe(false)
  })
})
