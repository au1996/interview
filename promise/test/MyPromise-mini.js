/**
 * 不解决then方法返回的 Promise 与当前 Promise 相互引用导致的循环引用问题
 * @param {*} executor
 */
function MyPromise(executor) {
  var self = this
  self.state = 'pending' // 初始化状态为待定
  self.value = undefined // 存储成功的返回值
  self.reason = undefined // 存储失败的原因
  self.onFulfilledCallbacks = [] // 存储成功态的回调函数
  self.onRejectedCallbacks = [] // 存储失败态的回调函数

  function resolve(value) {
    if (self.state === 'pending') {
      self.state = 'fulfilled' // 状态转为成功态
      self.value = value // 保存成功的返回值
      for (var i = 0; i < self.onFulfilledCallbacks.length; i++) {
        self.onFulfilledCallbacks[i](self.value) // 依次执行成功态的回调函数
      }
    }
  }

  function reject(reason) {
    if (self.state === 'pending') {
      self.state = 'rejected' // 状态转为失败态
      self.reason = reason // 保存失败的原因
      for (var i = 0; i < self.onRejectedCallbacks.length; i++) {
        self.onRejectedCallbacks[i](self.reason) // 依次执行成功态的回调函数
      }
    }
  }

  try {
    executor(resolve, reject) // 执行传入的执行器函数
  } catch (error) {
    reject(error) // 如果执行器函数出错，将状态置为已拒绝
  }
}

// Promise 的 then 方法
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  var self = this
  var newPromise

  // 如果 onFulfilled 不是函数，则创建一个默认函数
  onFulfilled =
    typeof onFulfilled === 'function'
      ? onFulfilled
      : function (value) {
          return value
        }
  // 如果 onRejected 不是函数，则创建一个默认函数
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : function (reason) {
          throw reason
        }

  // 根据当前状态执行对应的回调函数
  if (self.state === 'fulfilled') {
    // 创建新的 Promise
    newPromise = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          var x = onFulfilled(self.value)
          resolve(x)
        } catch (error) {
          reject(error)
        }
      }, 0)
    })
  } else if (self.state === 'rejected') {
    // 创建新的 Promise
    newPromise = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          var x = onRejected(self.reason)
          resolve(x)
        } catch (error) {
          reject(error)
        }
      }, 0)
    })
  } else if (self.state === 'pending') {
    // 创建新的 Promise
    newPromise = new MyPromise(function (resolve, reject) {
      self.onFulfilledCallbacks.push(function (value) {
        setTimeout(function () {
          try {
            var x = onFulfilled(value)
            resolve(x)
          } catch (error) {
            reject(error)
          }
        }, 0)
      })

      self.onRejectedCallbacks.push(function (reason) {
        setTimeout(function () {
          try {
            var x = onRejected(reason)
            resolve(x)
          } catch (error) {
            reject(error)
          }
        }, 0)
      })
    })
  }

  // 返回新的 Promise
  return newPromise
}

// Promise 的 catch 方法
MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}

// Promise 的 finally 方法
MyPromise.prototype.finally = function (onFinally) {
  return this.then(
    function (value) {
      return MyPromise.resolve(onFinally()).then(function () {
        return value
      })
    },
    function (reason) {
      return MyPromise.resolve(onFinally()).then(function () {
        throw reason
      })
    }
  )
}

// 创建并返回一个已成功的 Promise
MyPromise.resolve = function (value) {
  return new MyPromise(function (resolve) {
    resolve(value)
  })
}

// 创建并返回一个已拒绝的 Promise
MyPromise.reject = function (reason) {
  return new MyPromise(function (resolve, reject) {
    reject(reason)
  })
}

// Promise 的 all 方法
MyPromise.all = function (promises) {
  return new MyPromise(function (resolve, reject) {
    var results = [] // 存储所有 Promise 的返回值
    var count = 0 // 计数器，记录已完成的 Promise 数量

    // 定义处理单个 Promise 的函数
    function handlePromise(index, value) {
      results[index] = value // 将返回值存入结果数组的对应位置
      count++ // 计数器加一

      // 当所有 Promise 都已完成时，将结果数组传递给 resolve 函数
      if (count === promises.length) {
        resolve(results)
      }
    }

    // 遍历所有 Promise
    for (var i = 0; i < promises.length; i++) {
      // 为了在闭包中正确捕获索引 i 的值，需要使用立即执行函数
      ;(function (index) {
        promises[index].then(
          function (value) {
            handlePromise(index, value)
          },
          function (reason) {
            reject(reason) // 如果有 Promise 失败，则直接调用 reject 函数
          }
        )
      })(i)
    }
  })
}

// Promise 的 race 方法
MyPromise.race = function (promises) {
  return new MyPromise(function (resolve, reject) {
    // 遍历所有 Promise
    for (var i = 0; i < promises.length; i++) {
      // 为了在闭包中正确捕获索引 i 的值，需要使用立即执行函数
      ;(function (index) {
        promises[index].then(
          function (value) {
            resolve(value) // 只要有一个 Promise 完成，则直接调用 resolve 函数
          },
          function (reason) {
            reject(reason) // 如果有 Promise 失败，则直接调用 reject 函数
          }
        )
      })(i)
    }
  })
}

if (typeof module === 'object' && module.exports) {
  module.exports = MyPromise
}
