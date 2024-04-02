function deepClone(target) {
  // WeakMap作为记录对象Hash表（用于防止循环引用）
  const hash = new WeakMap()

  // 判断是否为object类型的辅助函数，减少重复代码
  function isObject(target) {
    return (typeof target === 'object' && target) || typeof target === 'function'
  }

  function clone(data) {
    // 基础类型直接返回值
    if (!isObject(data)) {
      return data
    }

    // 日期或者正则对象则直接构造一个新的对象返回
    if ([Date, RegExp].includes(data.constructor)) {
      return new data.constructor(data)
    }

    if (typeof data === 'function') {
      return new Function('return ' + data.toString())()
    }

    // 如果该对象已存在，则直接返回该对象
    const exist = hash.get(data)
    if (exist) {
      return exist
    }

    // 处理Map对象
    if (data instanceof Map) {
      const result = new Map()
      hash.set(data, result)

      data.forEach((val, key) => {
        if (isObject(val)) {
          result.set(key, clone(val))
        } else {
          result.set(key, val)
        }
      })

      return result
    }

    // 处理Set对象
    if (data instanceof Set) {
      const result = new Set()
      hash.set(data, result)

      data.forEach((val) => {
        if (isObject(val)) {
          result.add(clone(val))
        } else {
          result.add(val)
        }
      })

      return result
    }

    // 收集键名（考虑了以Symbol作为key以及不可枚举的属性）
    const keys = Reflect.ownKeys(data)

    // 利用 Object 的 getOwnPropertyDescriptors 方法可以获得对象的所有属性以及对应的属性描述
    const allDesc = Object.getOwnPropertyDescriptors(data)

    // 结合 Object 的 create 方法创建一个新对象，并继承传入原对象的原型链， 这里得到的result是对data的浅拷贝
    const result = Object.create(Object.getPrototypeOf(data), allDesc)

    // 新对象加入到map中，进行记录
    hash.set(data, result)

    // Object.create()是浅拷贝，所以要判断并递归执行深拷贝
    keys.forEach((key) => {
      const val = data[key]

      // 属性值为 对象类型 或 函数对象 的话也需要进行深拷贝
      if (isObject(val)) {
        result[key] = clone(val)
      } else {
        result[key] = val
      }
    })

    return result
  }

  return clone(target)
}
