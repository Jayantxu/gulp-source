'use strict';

// nODE的断言测试
var assert = require('assert');

// 类似于Array.map()的改进版本=>最终返回的也是数组
/*
:npm中的讲解
map(['a', 'b', 'c'], function(ele, i) {
  return i + ele;
});
//=> ['0a', '1b', '2c']
*/
var map = require('arr-map');

// 将数组展开为平面数组,解除嵌套
/*
flatten(['a', ['b', ['c']], 'd', ['e']]);
//=> ['a', 'b', 'c', 'd', 'e']*/
var flatten = require('arr-flatten');

// 接收到寄存器以及相应的“任务数组”
function normalizeArgs(registry, args) {

  // 传递入一个一个的“任务”方法
  function getFunction(task) {

    // task类型判断
    if (typeof task === 'function') {
      return task;
    }

    // 从我们寄存器中找到有没有这个key的function,因为存在旧的写法----不知是否有理解错
    /*
    gulp.task('uglify', function(){
        return gulp.src(['src/*.js'])
            .pipe(uglify())
            .pipe(gulp.dest('dist'));
    });
    gulp.task('default', ['uglify']);
    =>上面的一开始给registry传入的是一个uglify的key
    */
    var fn = registry.get(task);
    // 错误处理
    assert(fn, 'Task never defined: ' + task);
    // 回
    return fn;
  }
  // “任务数组”展开
  var flattenArgs = flatten(args);
  // 根据长度,判断是否写空了
  assert(flattenArgs.length, 'One or more tasks should be combined using series or parallel');

  // 对“任务数组”的任务进行方法的遍历
  return map(flattenArgs, getFunction);
}

module.exports = normalizeArgs;
