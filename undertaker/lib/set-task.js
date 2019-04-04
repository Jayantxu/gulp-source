'use strict';

var assert = require('assert');

var metadata = require('./helpers/metadata');

/*
var WM = require('es6-weak-map');
var metadata = new WM();
=>ES6中的WeakMap新类型,在其中引用的对象不计入垃圾回收机制,例如书中讲可用于存放一些DOM相关对象
=>此处为什么用WeakMap不用Map,可能是方便任务执行结束,有效清理内存
提供get、set等方法
*/

// set方法采用了map(WeakMap)的数据类型进行存放



// 暴露了一个set方法
function set(name, fn) {

  // 其中对task第一个参数的name进行类型判断=>错误则报
  assert(name, 'Task name must be specified');
  assert(typeof name === 'string', 'Task name must be a string');
  assert(typeof fn === 'function', 'Task function must be specified');

  
  // 绑定this, 在this中使用参数 fn 对象的方法以及参数
  function taskWrapper() {
    // 返回一个新包装this后的函数
    return fn.apply(this, arguments);
  }

  function unwrap() {
    // 返回原本的fn函数方法
    return fn;
  }

  // 将name、fn包装
  taskWrapper.unwrap = unwrap;
  taskWrapper.displayName = name;
  
  // 打印一下输出是什么 => 
  console.log(`taskWrapper： ${taskWrapper}`)


  var meta = metadata.get(fn) || {};

  // 打印一下输出是什么 => 
  console.log(`meta: ${meta}`)

  var nodes = [];
  if (meta.branch) {
    nodes.push(meta.tree);
  }

  var task = this._registry.set(name, taskWrapper) || taskWrapper;

  // 打印一下输出是什么 => 
  console.log(`task: ${task}`)

  // 存入WeakMap对象
  metadata.set(task, {
    name: name,
    orig: fn,
    tree: {
      label: name,
      type: 'task',
      nodes: nodes,
    },
  });

  // 打印一下输出是什么 => 
  console.log(`metadata: ${metadata.get(task)}`)
}

module.exports = set;
