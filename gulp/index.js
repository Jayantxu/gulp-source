'use strict';

// Node内部util模块，是Node中一个核心的工具函数模块
var util = require('util'); 
// 任务管理
var Undertaker = require('undertaker');
// vinyl-fs模块: src/dest/symlink
var vfs = require('vinyl-fs');
// 观察全局并在更改时执行功能,watch功能
var watch = require('glob-watcher');

function Gulp() {
  // 转this,将Undertaker的方法运用到this中
  Undertaker.call(this);

  // Bind the functions for destructuring
  this.watch = this.watch.bind(this);
  this.task = this.task.bind(this);
  this.series = this.series.bind(this);
  this.parallel = this.parallel.bind(this);
  this.registry = this.registry.bind(this);
  this.tree = this.tree.bind(this);
  this.lastRun = this.lastRun.bind(this);
}
// 继承,(构造函数,父类构造函数)
util.inherits(Gulp, Undertaker);

Gulp.prototype.src = vfs.src;
Gulp.prototype.dest = vfs.dest;
Gulp.prototype.symlink = vfs.symlink;
Gulp.prototype.watch = function(glob, opt, task) {
  if (typeof opt === 'string' || typeof task === 'string' ||
    Array.isArray(opt) || Array.isArray(task)) {
    throw new Error('watching ' + glob + ': watch task has to be ' +
      'a function (optionally generated by using gulp.parallel ' +
      'or gulp.series)');
  }

  if (typeof opt === 'function') {
    task = opt;
    opt = {};
  }

  opt = opt || {};

  var fn;
  if (typeof task === 'function') {
    fn = this.parallel(task);
  }

  return watch(glob, opt, fn);
};

// Let people use this class from our instance
Gulp.prototype.Gulp = Gulp;

var inst = new Gulp();
module.exports = inst;


/*
我们主要就将来看：
undertaker、
vinyl-fs、
glob-watcher
都将分别实现什么功能
*/