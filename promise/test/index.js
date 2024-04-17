const promisesAplusTests = require('promises-aplus-tests')
const myPromise = require('./myPromise')

const adapter = {
  resolved: (value) => myPromise.resolve(value),
  rejected: (reason) => myPromise.reject(reason),
  deferred: () => {
    let resolve, reject
    const promise = new myPromise((res, rej) => {
      resolve = res
      reject = rej
    })
    return {
      promise,
      resolve,
      reject,
    }
  },
}

promisesAplusTests(adapter, function (err) {
  // 当测试完成时的回调函数
  if (err) {
    console.error('Test failed:', err)
  } else {
    console.log('All tests passed!')
  }
})
