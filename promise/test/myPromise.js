function myPromise(executor) {
  var PENDING = 'pending' // 待定
  var FULFILLED = 'fulfilled' // 已完成
  var REJECTED = 'rejected' // 已拒绝
  var state = PENDING // 状态
  var value = undefined // 返回值
  var reason = undefined // 失败时的原因
  var onFulfilledCallbacks = [] // 存储成功态的回调函数
  var onRejectedCallbacks = [] // 存储失败态的回调函数

  function resolve(newValue) {
    if (state === PENDING) {
      state = FULFILLED // 状态转为成功态
      value = newValue // 保存成功的返回值
      for (var i = 0; i < onFulfilledCallbacks.length; i++) {
        onFulfilledCallbacks[i](value) // 依次执行成功态的回调函数
      }
    }
  }

  function reject(newReason) {
    if (state === PENDING) {
      state = REJECTED // 状态转为失败态
      reason = newReason // 保存失败的原因
      for (var i = 0; i < onRejectedCallbacks.length; i++) {
        onRejectedCallbacks[i](reason) // 依次执行失败态的回调函数
      }
    }
  }

  try {
    executor(resolve, reject) // 执行传入的执行器函数
  } catch (error) {
    reject(error) // 如果执行器函数出错，将 myPromise 状态置为 rejected
  }

  function then(onFulfilled, onRejected) {
    return new myPromise(function (resolve, reject) {
      if (state === FULFILLED) {
        try {
          var result = onFulfilled(value) // 执行成功态的回调函数
          resolve(result) // 将新 myPromise 置为成功态
        } catch (error) {
          reject(error) // 如果执行成功态的回调函数时出错，将新 myPromise 置为失败态
        }
      }
      if (state === REJECTED) {
        try {
          var result = onRejected(reason) // 执行失败态的回调函数
          resolve(result) // 将新 myPromise 置为成功态
        } catch (error) {
          reject(error) // 如果执行失败态的回调函数时出错，将新 myPromise 置为失败态
        }
      }
      if (state === PENDING) {
        onFulfilledCallbacks.push(function (val) {
          try {
            if (typeof onFulfilled !== 'function') {
              resolve(val)
              return
            }
            var result = onFulfilled(val) // 执行成功态的回调函数
            resolve(result) // 将新 myPromise 置为成功态
          } catch (error) {
            reject(error) // 如果执行成功态的回调函数时出错，将新 myPromise 置为失败态
          }
        })
        onRejectedCallbacks.push(function (res) {
          try {
            if (typeof onRejected !== 'function') {
              resolve(val)
              return
            }
            var result = onRejected(res) // 执行失败态的回调函数
            resolve(result) // 将新 myPromise 置为成功态
          } catch (error) {
            reject(error) // 如果执行失败态的回调函数时出错，将新 myPromise 置为失败态
          }
        })
      }
    })
  }

  function catchMethod(onRejected) {
    return then(null, onRejected) // 捕获失败态的回调函数
  }

  function finallyMethod(onFinally) {
    return then(
      function (val) {
        return myPromise.resolve(onFinally()).then(function () {
          return val
        })
      },
      function (res) {
        return myPromise.resolve(onFinally()).then(function () {
          throw res
        })
      }
    )
  }

  function all(promises) {
    return new myPromise(function (resolve, reject) {
      var results = []
      var counter = 0
      for (var i = 0; i < promises.length; i++) {
        promises[i]
          .then(function (value) {
            results[i] = value
            counter++
            if (counter === promises.length) {
              resolve(results)
            }
          })
          .catch(function (reason) {
            reject(reason)
          })
      }
    })
  }

  function race(promises) {
    return new myPromise(function (resolve, reject) {
      for (var i = 0; i < promises.length; i++) {
        promises[i]
          .then(function (value) {
            resolve(value)
          })
          .catch(function (reason) {
            reject(reason)
          })
      }
    })
  }

  return {
    state: state,
    then: then,
    catch: catchMethod,
    finally: finallyMethod,
    all: all,
    race: race,
  }
}

myPromise.resolve = function (value) {
  return new myPromise(function (resolve) {
    resolve(value)
  })
}

myPromise.reject = function (reason) {
  return new myPromise(function (resolve, reject) {
    reject(reason)
  })
}

if (typeof module === 'object' && module.exports) {
  module.exports = myPromise
}
