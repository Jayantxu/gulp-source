var tick = require('process-nextick-args');

// 可以将参数传递给下一个进程
tick(TestNext, 'step', 3,  'profit', '2')

function TestNext() {
  var args = arguments
  for(let i of args) {
    console.log(i)
  }
}