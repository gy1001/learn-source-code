import { COL_KEY } from './collectionHandlers'

let activeEffect
const effectStack: any = []
const targetMap = new WeakMap() // 依赖收集器，使用 weaakmap 性能会有优势，回收机制好 对象 => {  }

// effect 函数 依赖的 key ，以及 key 依赖的 effect
export function effect (fn) {
  const effectFn = () => {
    let result
    try {
      activeEffect = effectFn
      effectStack.push(activeEffect)
      cleanUp(activeEffect) // 先进行清理在重新收集
      result = fn() // 内部会触发 proxy 的 get 方法 ，执行 track, 执行完重置, 执行依赖收集
    }
    finally {
      // 如果 fn 内部还有 effect ， 这里就需要进行特殊处理
      effectStack.pop()
      // 恢复为上一个嵌套数组的值
      activeEffect = effectStack[effectStack.length - 1]
    }
    return result
  }
  effectFn.deps = []
  effectFn()
  return effectFn
}

// 清理所有的 funciton 依赖
function cleanUp (effectFn) {
  // 这里会进行全部清理，然后 track 的时候在重新收集，有一定的性格损耗 vue3.2 中进行了优化，利用了位运算
  for (let index = 0; index < effectFn.deps.length; index++)
    effectFn.deps[index].delete(effectFn)
  effectFn.deps.length = 0
}

export function track (obj, type, key) {
  if (!activeEffect)
    return
  let depsMap = targetMap.get(obj)
  if (!depsMap)
    targetMap.set(obj, (depsMap = new Map()))
  let deps = depsMap.get(key)
  if (!deps)
    depsMap.set(key, (deps = new Set())) // 使用 set 集合，可以自动去重
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

export function trigger (obj, type, key) {
  const targetValue = targetMap.get(obj)
  if (!targetValue)
    return
  if (type === 'collection-add' || type === 'collection-delete')
    key = COL_KEY
  const depsValue = targetValue.get(key)
  if (depsValue) {
    const depsToRun = new Set(depsValue) // 这里可以参考测试用例中的 ES6 set 的缺陷
    depsToRun.forEach((depEffect: any) => {
      depEffect()
    })
  }
}
