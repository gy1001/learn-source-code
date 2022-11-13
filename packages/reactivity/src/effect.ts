let activeEffect
const targetMap = new WeakMap() // 依赖收集器，使用 weaakmap 性能会有优势，回收机制好 对象 => {  }

export function effect (fn) {
  activeEffect = fn
  fn() // 内部会触发 proxy 的 get 方法 ，执行 track, 执行完重置
  activeEffect = null
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
  if (depsValue)
    depsValue.forEach(depEffect => depEffect())
}
