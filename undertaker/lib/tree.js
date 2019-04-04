'use strict';

var defaults = require('object.defaults');
var map = require('collection-map');

var metadata = require('./helpers/metadata');

// 可用于获取当前注册过的所有任务的metadata-WeakMap
// 也就是说,可以获取到当前我们定义了那些任务,对应方法,任务间依赖等关系

function tree(opts) {

  // 此方法会覆盖判断是否存在opts,并覆盖其中的{deep: false}
  opts = defaults(opts || {}, {
    deep: false,
  });

  // 获取寄存器中的tasks
  var tasks = this._registry.tasks();
  
  // 遍历tasks并且返回WeakMap(metadata)的“任务数组” 
  var nodes = map(tasks, function(task) {

    
    var meta = metadata.get(task);

    if (opts.deep) {
      return meta.tree;
    }

    return meta.tree.label;
  });

  return {
    label: 'Tasks',
    nodes: nodes,
  };
}

module.exports = tree;


/*
var undertaker = require('undertaker');
ut = new undertaker();

ut.task('taskA', function(cb){console.log('A'); cb()});
ut.task('taskB', function(cb){console.log('B'); cb()});
ut.task('taskC', function(cb){console.log('C'); cb()});
ut.task('taskD', function(cb){console.log('D'); cb()});
ut.task('taskE', function(cb){console.log('E'); cb()});

ut.task('taskC', ut.series('taskA', 'taskB'));
ut.task('taskE', ut.parallel('taskC', 'taskD'));

var tree = ut.tree();
console.log(tree);
*/