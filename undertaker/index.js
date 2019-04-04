'use strict';
// Node工具函数中的继承
var inherits = require('util').inherits;
// Node中的事件触发器
var EventEmitter = require('events').EventEmitter;

var DefaultRegistry = require('undertaker-registry');

var tree = require('./lib/tree');
var task = require('./lib/task');
var series = require('./lib/series');
var lastRun = require('./lib/last-run');
var parallel = require('./lib/parallel');
var registry = require('./lib/registry');
var _getTask = require('./lib/get-task');
var _setTask = require('./lib/set-task');

function Undertaker(customRegistry) {
  EventEmitter.call(this);

  /*
  我们来看一下DefaultRegistry(undertaker-registry)都干了什么
  */
  this._registry = new DefaultRegistry();
  // 允许用户自定义的寄存器任务
  if (customRegistry) {
    this.registry(customRegistry);
  }

  this._settle = (process.env.UNDERTAKER_SETTLE === 'true');
}

inherits(Undertaker, EventEmitter);


Undertaker.prototype.tree = tree;

Undertaker.prototype.task = task;

Undertaker.prototype.series = series;

Undertaker.prototype.lastRun = lastRun;

Undertaker.prototype.parallel = parallel;

Undertaker.prototype.registry = registry;

Undertaker.prototype._getTask = _getTask;

Undertaker.prototype._setTask = _setTask;

module.exports = Undertaker;
