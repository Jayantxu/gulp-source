'use strict';

// 提供了形如get、set的接口,充当寄存器的作用存放着那些任务队列

function DefaultRegistry() {

  if (this instanceof DefaultRegistry === false) {
    return new DefaultRegistry();
  }

  this._tasks = {};
}

// 可能是初始化的作用
DefaultRegistry.prototype.init = function init(taker) {};

// 从上边的_tasks对象中去key=name的那个
DefaultRegistry.prototype.get = function get(name) {
  return this._tasks[name];
};

// set的时候,针对传入的name作为key,存放相应的处理方法fn
DefaultRegistry.prototype.set = function set(name, fn) {
  return this._tasks[name] = fn;
};

DefaultRegistry.prototype.tasks = function tasks() {
  var self = this;
  // 接收一个函数作为累加器->扩展->reduce()的用法
  return Object.keys(this._tasks).reduce(function(tasks, name) {
    tasks[name] = self.get(name);
    return tasks;
  }, {});
  // {}将作为tasks的初始值->也就是=> 相当于令一开始的  tasks={},  最终返回
};

module.exports = DefaultRegistry;
