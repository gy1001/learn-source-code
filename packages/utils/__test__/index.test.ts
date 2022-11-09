import { describe, expect, it } from 'vitest'
import { isObject, isOn } from '../src'

describe('测试工具库', () => {
  it('测试isObject', () => {
    expect(1 + 2).toBe(3)
    expect(isObject({})).toBe(true)
    expect(isObject(1)).toBe(false)
    expect(isObject(null)).toBe(false)
  })

  it('测试isOn函数', () => {
    expect(isOn('onClick')).toBe(true)
    //  这里 ts 类型会报错
    // expect(isOn(1)).toBe(false)
  })
})
