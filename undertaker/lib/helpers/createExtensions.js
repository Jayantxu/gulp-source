'use strict';

// 使用某函数,并记录捕获当前时间戳或者传入时间戳
var captureLastRun = require('last-run').capture;

// 获取一个function并删除最后一次运行时时间戳
var releaseLastRun = require('last-run').release;

var metadata = require('./metadata');

var uid = 0;

function Storage(fn) {
  var meta = metadata.get(fn);

  this.fn = meta.orig || fn;
  this.uid = uid++;
  this.name = meta.name;
  this.branch = meta.branch || false;
  this.captureTime = Date.now();
  this.startHr = [];
}

Storage.prototype.capture = function() {
  captureLastRun(this.fn, this.captureTime);
};

Storage.prototype.release = function() {
  releaseLastRun(this.fn);
};

function createExtensions(ee) {
  return {
    create: function(fn) {
      // 调用create时候,记录一下相关信息,并返回
      return new Storage(fn);
    },
    before: function(storage) {
      // Node获取相对于过去某一刻的时间
      storage.startHr = process.hrtime();
      // Node触发start事件,后面为参数
      ee.emit('start', {
        uid: storage.uid,
        name: storage.name,
        branch: storage.branch,
        time: Date.now(),
      });
    },
    after: function(result, storage) {
      // 调用时判断是否有错,有则爆
      if (result && result.state === 'error') {
        return this.error(result.value, storage);
      }
      // 记录当前时间戳
      storage.capture();
      // Node触发stop事件
      ee.emit('stop', {
        uid: storage.uid,
        name: storage.name,
        branch: storage.branch,
        duration: process.hrtime(storage.startHr),
        time: Date.now(),
      });
    },
    error: function(error, storage) {
      if (Array.isArray(error)) {
        error = error[0];
      }
      // 删除出错的此次执行时间戳
      storage.release();
      ee.emit('error', {
        uid: storage.uid,
        name: storage.name,
        branch: storage.branch,
        error: error,
        duration: process.hrtime(storage.startHr),
        time: Date.now(),
      });
    },
  };
}

module.exports = createExtensions;
