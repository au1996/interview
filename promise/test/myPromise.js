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
          resolvePromise(newPromise, x, resolve, reject)
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
          resolvePromise(newPromise, x, resolve, reject)
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
            resolvePromise(newPromise, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      })

      self.onRejectedCallbacks.push(function (reason) {
        setTimeout(function () {
          try {
            var x = onRejected(reason)
            resolvePromise(newPromise, x, resolve, reject)
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

// 解决 Promise 的 then 方法中返回的 Promise 与当前 Promise 相互引用导致的循环引用问题
function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    reject(new TypeError('Chaining cycle detected for promise'))
    return
  }

  if (x && (typeof x === 'object' || typeof x === 'function')) {
    var called = false

    try {
      var then = x.then

      if (typeof then === 'function') {
        then.call(
          x,
          function (y) {
            if (called) return
            called = true
            resolvePromise(promise, y, resolve, reject)
          },
          function (r) {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (error) {
      if (called) return
      called = true
      reject(error)
    }
  } else {
    resolve(x)
  }
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

if (typeof module === 'object' && module.exports) {
  module.exports = MyPromise
}
