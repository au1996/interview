function deepClone(target) {
  if (typeof target === 'object' && target !== null) {
    return JSON.parse(JSON.stringify(target))
  } else {
    return target
  }
}

// 类型被转换：Date引用类型会变成字符串
// 键值会消失：当值为Function、Undefined、Symbol 这几种类型
// 键值变成空对象：当值为Map、Set、RegExp这几种类型
// 无法拷贝：不可枚举属性、对象的原型链属性
// 如果存在BigInt类型：执行会报错
// 如果设置循环引用：执行会报错
// 补充：其他更详细的内容请查看官方文档：JSON.stringify()
