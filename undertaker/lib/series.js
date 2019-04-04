'use strict';

// 可以优雅容易的将异步函数串行或并行运行
var bach = require('bach');

var metadata = require('./helpers/metadata');
var buildTree = require('./helpers/buildTree');
var normalizeArgs = require('./helpers/normalizeArgs');
var createExtensions = require('./helpers/createExtensions');

// 与parallel相对应,为串行任务接口
/*
用法：
ut.task('taskA', function(){});
ut.task('taskB', function(){});
ut.task('taskC', function(){});
ut.task('taskD', function(){});
// taskD 需要在 'taskA', 'taskB', 'taskC' 执行完毕后才开始执行，
// 其中 'taskA', 'taskB', 'taskC' 的执行必须是按顺序一个接一个的
ut.task('taskD', ut.series('taskA', 'taskB', 'taskC'));
*/

// 所以关键在于如何知道this._settle的值受到什么影响, 以及bach做了什么事情


function series() {
  // bach模块中两种不同的异步行为
  var create = this._settle ? bach.settleSeries : bach.series;

  /* 我们来看一下它们分别干了什么*/

  // 将寄存器,与arguments中可能的任务传于normalizeArgs=>进入这个方法=>返回解析后的“任务数组”
  var args = normalizeArgs(this._registry, arguments);

  // 为this扩展对象,包括create、before、after、error
  var extensions = createExtensions(this);

  // 根据bach的行为
  /*
  即是： bach.settleSeries(args, extensions) 或 bach.series(args, extensions)
  */
  var fn = create(args, extensions);

  fn.displayName = '<series>';


  // 然后再将它们推入metadata的“任务Map”中
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

module.exports = series;
