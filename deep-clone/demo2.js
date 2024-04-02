function deepClone(target) {
  if (typeof target === 'object' && target) {
    let cloneObj = target.constructor === Array ? [] : {}

    for (const key in target) {
      cloneObj[key] = deepClone(target[key])
    }
    return cloneObj
  } else {
    return target
  }
}

// 只考虑了Object和Array对象
// Date对象、RegExp对象、Map对象、Set对象都变成了Object对象，且值也不正确。
// 丢失了属性名为Symbol类型的属性
// 丢失了不可枚举的属性
// 原型上的属性也被添加到拷贝的对象中
// 不能处理循环引用
