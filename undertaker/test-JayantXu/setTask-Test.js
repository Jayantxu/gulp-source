var setTasks = require('../lib/set-task');

// assert报错 --- 1 => AssertionError: Task name must be a string

// setTasks(1, function() {
//   console.log('对setTask的执行进行测试!')
// })

setTasks('testSetTask', function() {
  console.log('对setTask的执行进行测试!')
})

// console.log((process.env.UNDERTAKER_SETTLE === 'true'))