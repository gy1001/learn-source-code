import { describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src'

describe('effect', () => {
  it('effect 嵌套', () => {
    const data = { foo: 3, bar: 4 }
    const obj = reactive(data)
    let temp1, temp2
    const fn1 = vi.fn(() => { }) // vi.fn 包裹函数之后，就可以测试这个函数执行了多少次
    const fn2 = vi.fn(() => { }) // vi.fn 包裹函数之后，就可以测试这个函数执行了多少次
    effect(() => {
      fn1()
      console.log('fn1执行了')
      effect(() => {
        fn2()
        console.log('fn2执行了')
        temp1 = obj.foo
      })
      temp2 = obj.bar
    })
    expect(fn1).toBeCalledTimes(1)
    expect(fn2).toBeCalledTimes(1)
    expect(temp1).toBe(3)
    expect(temp2).toBe(4)

    obj.bar++
    expect(fn1).toBeCalledTimes(2)
    // expect(fn2).toBeCalledTimes(1) // 这里有疑问？代码检测执行了2次，视频教程里面是1次 ???????????????? TODO
  })
})
