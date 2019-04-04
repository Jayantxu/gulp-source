'use strict';

// 提供了形如get、set的接口,充当寄存器的作用存放着那些任务队列

function DefaultRegistry() {
  if (this instanceof DefaultRegistry === false) {
    return new DefaultRegistry();
  }

  this._tasks = {};
}

DefaultRegistry.prototype.init = function init(taker) {};

DefaultRegistry.prototype.get = function get(name) {
  return this._tasks[name];
};

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
  // {}将作为tasks的初始值->也就是=> 相当于令一开始的tasks={},最终返回
};

module.exports = DefaultRegistry;
