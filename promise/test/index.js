const promisesAplusTests = require('promises-aplus-tests')
const MyPromise = require('./MyPromise')

const adapter = {
  resolved: (value) => MyPromise.resolve(value),
  rejected: (reason) => MyPromise.reject(reason),
  deferred: () => {
    let resolve, reject
    const promise = new MyPromise((res, rej) => {
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
