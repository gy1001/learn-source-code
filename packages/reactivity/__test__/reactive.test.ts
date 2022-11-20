import { describe, expect, it, vi } from 'vitest'
import { effect, isReactive, isRef, reactive, ref, shadowReactive } from '../src/index'

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

describe('浅层响应式', () => {
  it('shadowReactive', () => {
    const obj = shadowReactive({ count: 1, info: { name: '孙悟空' } })
    let val1, val2
    effect(() => {
      val1 = obj.info.name
    })
    effect(() => {
      val2 = obj.count
    })
    expect(val1).toBe('孙悟空')
    expect(val2).toBe(1)
    obj.info.name = '猪八戒'
    obj.count++
    expect(val1).toBe('孙悟空') // 深层次的没有响应式
    expect(val2).toBe(2)
  })
})

describe('工具函数测试', () => {
  it('isRef', () => {
    const obj = ref(1)
    expect(isRef(obj)).toBe(true)
  })
  it('isReactive', () => {
    const obj1 = reactive({ name: '孙悟空' })
    const obj2 = shadowReactive({ age: 300 })
    expect(isReactive(obj1)).toBe(true)
    expect(isReactive(obj2)).toBe(true)
  })
})
