'use strict';

var bach = require('bach');

var metadata = require('./helpers/metadata');
var buildTree = require('./helpers/buildTree');
var normalizeArgs = require('./helpers/normalizeArgs');
var createExtensions = require('./helpers/createExtensions');

function parallel() {
  var create = this._settle ? bach.settleParallel : bach.parallel;

  // 根据“任务”数组从寄存器中获取展开的任务数组
  var args = normalizeArgs(this._registry, arguments);
  // 为extensions变量扩展新“”对象
  var extensions = createExtensions(this);
  // 将参数与扩展的对象(after,before,create,error)做关联
  // 所以我们来看一下它具体实现了些什么 => 
  
  // bach.settleParallel+
  
  (args, extensions) : bach.parallel(args, extensions)
  var fn = create(args, extensions);

  fn.displayName = '<parallel>';

  metadata.set(fn, {
    name: fn.displayName,
    branch: true,
    tree: {
      label: fn.displayName,
      type: 'function',
      branch: true,
      nodes: buildTree(args),
    },
  });
  return fn;
}

module.exports = parallel;


/*
var undertaker = require('undertaker');
ut = new undertaker();

  ut.task('taskA', function(){});
  ut.task('taskB', function(){});
  ut.task('taskC', function(){});
  ut.task('taskD', function(){});

// taskD 需要在 'taskA', 'taskB', 'taskC' 执行完毕后才开始执行，
// 其中 'taskA', 'taskB', 'taskC' 的执行是异步的
ut.task('taskD', ut.parallel('taskA', 'taskB', 'taskC'));
*/
