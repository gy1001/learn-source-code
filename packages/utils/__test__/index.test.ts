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
  it('位运算的科普', () => {
    // 010   // 2 二进制的一些运算
    // & | !
    // & 两个位置都是1， 结果才是1， 否则就是0
    // | 两个位置只要有一个是1，结果就是1，否则就是0
    // 位运算的优点是性能高

    const role1 = 1 // 0001
    const role2 = 1 << 1 // 0010
    const role3 = 1 << 2 // 0100
    const role4 = 1 << 3 // 1000
    // 按 位或 就是授权
    let action = role1 | role3
    // 按 位与 就是校验权限
    expect(!!(action & role1)).toBe(true)
    expect(!!(action & role2)).toBe(false)
    expect(!!(action & role3)).toBe(true)
    expect(!!(action & role4)).toBe(false)
    // 权限的删除
    action &= ~role3
    expect(!!(action & role1)).toBe(true)
    expect(!!(action & role2)).toBe(false)
    expect(!!(action & role3)).toBe(false)
  })
})
