'use strict';

// npm中其介绍的功能为,记录函数的时间点 => 对metadata对象的属性一顿操作
var retrieveLastRun = require('last-run');

var metadata = require('./helpers/metadata');


function lastRun(task, timeResolution) {
  if (timeResolution == null) {
    timeResolution = process.env.UNDERTAKER_TIME_RESOLUTION;
  }

  var fn = task;
  if (typeof task === 'string') {
    fn = this._getTask(task);
  }

  var meta = metadata.get(fn);

  if (meta) {
    fn = meta.orig || fn;
  }

  return retrieveLastRun(fn, timeResolution);
}

module.exports = lastRun;
