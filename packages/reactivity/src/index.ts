// TODO
// VUE 的响应式实现

import { isObject } from '@gy/utils'

export const result = isObject({})

export { effect, trigger, track } from './effect'
export { reactive, shadowReactive } from './reactive'
export { ref } from './ref'

// 在真正的项目中，
// createApp(组件)
//   创建组件(组件内部的数据，reactive 一下，script setup 中直接调用 ref 或者 reactive)
//     effect(() => { 组件的更新逻辑 })
//   组件 mount
