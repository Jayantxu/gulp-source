'use strict';

var initial = require('array-initial');
var last = require('array-last');
var asyncDone = require('async-done');
var nowAndLater = require('now-and-later');

var helpers = require('./helpers');

function iterator(fn, key, cb) {
  return asyncDone(fn, cb);
}

function buildSeries() {
  var args = helpers.verifyArguments(arguments);

  var extensions = helpers.getExtensions(last(args));

  if (extensions) {
    args = initial(args);
  }

  function series(done) {
    // 与parallel不同的只是nowAndLater调用的接口,此处是mapSeries
    nowAndLater.mapSeries(args, iterator, extensions, done);
  }

  return series;
}

module.exports = buildSeries;
