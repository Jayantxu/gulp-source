'use strict';

// 对数组取值操作,取第一及最后一个
var initial = require('array-initial');
var last = require('array-last');
// 用于异步化函数
var asyncDone = require('async-done');

var nowAndLater = require('now-and-later');

var helpers = require('./helpers');

function iterator(fn, key, cb) {
  // 那asyncDone又是做什么的呢 => ?
  // 传入一个方法与回调
  return asyncDone(fn, cb);
}

function buildParallel() {
  // 校验传入参数(arguments的合法性)
  var args = helpers.verifyArguments(arguments);

  // 取到最后一个参数,即传入时的extensions,然后执行此方法
  // 如果最后一个参数!==function则return 回
  var extensions = helpers.getExtensions(last(args));

  if (extensions) {
    // 如果扩展对象存在,取第一个参数
    args = initial(args);
  }

  // 我们具体来看一下nowAndLater.map做了什么 => 
  function parallel(done) {

    /*
    传入了四个值(args, function iterator(fn, key, cb) {return asyncDone(fn, cb);}, 扩展的对象, done)
    */
    nowAndLater.map(args, iterator, extensions, done);
    //遍历tasks数组，将其生命周期和extensions属性关联起来,且将每个task异步化，且并发执行
  }

  return parallel;
}

module.exports = buildParallel;
