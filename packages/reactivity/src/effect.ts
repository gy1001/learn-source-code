let activeEffect
const effectStack: any = []
const targetMap = new WeakMap() // 依赖收集器，使用 weaakmap 性能会有优势，回收机制好 对象 => {  }

export function effect (fn) {
  activeEffect = fn
  effectStack.push(activeEffect)
  fn() // 内部会触发 proxy 的 get 方法 ，执行 track, 执行完重置
  // 如果  fn 内部还有 effect ， 这里就需要进行特殊处理
  effectStack.pop()
  // 恢复为上一个嵌套数组的值
  activeEffect = effectStack[effectStack.length - 1]
}

export function track (obj, type, key) {
  if (!activeEffect)
    return
  let depsMap = targetMap.get(obj)
  if (!depsMap)
    targetMap.set(obj, (depsMap = new Map()))
  let deps = depsMap.get(key)
  if (!deps)
    depsMap.set(key, (deps = new Set()))
  deps.add(activeEffect)
}

export function trigger (obj, type, key) {
  const targetValue = targetMap.get(obj)
  if (!targetValue)
    return
  const depsValue = targetValue.get(key)
  if (depsValue) {
    depsValue.forEach((depEffect) => {
      depEffect()
    })
  }
}
