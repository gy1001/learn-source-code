export function isObject (value: any) {
  return typeof value === 'object' && value !== null
}

export function isOn (key: string) {
  return key[0] === 'o' && key[1] === 'n'
}
