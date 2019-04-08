'use strict';
// 观察watch

var chokidar = require('chokidar');
var debounce = require('just-debounce');
var asyncDone = require('async-done');
var defaults = require('object.defaults/immutable');
var isNegatedGlob = require('is-negated-glob');
var anymatch = require('anymatch');

var defaultOpts = {
  delay: 200,
  events: ['add', 'change', 'unlink'],
  ignored: [],
  ignoreInitial: true,
  queue: true,
};

function listenerCount(ee, evtName) {
  if (typeof ee.listenerCount === 'function') {
    return ee.listenerCount(evtName);
  }

  return ee.listeners(evtName).length;
}

function hasErrorListener(ee) {
  return listenerCount(ee, 'error') !== 0;
}

function exists(val) {
  return val != null;
}

function watch(glob, options, cb) {
  // 配置与方法的对调
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  // 类似对对象的参数配置替换
  var opt = defaults(options, defaultOpts);
  // 转为数组，如果是opt.events是非数组的前提下
  if (!Array.isArray(opt.events)) {
    opt.events = [opt.events];
  }
  // 转数组
  if (Array.isArray(glob)) {
    // We slice so we don't mutate the passed globs array
    glob = glob.slice();
  } else {
    // 转为数组，可能是为了方便之后遍历
    glob = [glob];
  }
  var queued = false;
  var running = false;
  // These use sparse arrays to keep track of the index in the
  // original globs array
  // 新增两个某长度的数组
  var positives = new Array(glob.length);
  var negatives = new Array(glob.length);

  // Reverse the glob here so we don't end up with a positive
  // and negative glob in position 0 after a reverse
  glob.reverse().forEach(sortGlobs);
  function sortGlobs(globString, index) {
    // blobString是遍历的那个value值
    var result = isNegatedGlob(globString);
    //
    if (result.negated) {
      negatives[index] = result.pattern;
    } else {
      positives[index] = result.pattern;
    }
  }

  function shouldBeIgnored(path) {
    var positiveMatch = anymatch(positives, path, true);
    var negativeMatch = anymatch(negatives, path, true);
    // If negativeMatch is -1, that means it was never negated
    if (negativeMatch === -1) {
      return false;
    }

    // If the negative is "less than" the positive, that means
    // it came later in the glob array before we reversed them
    return negativeMatch < positiveMatch;
  }

  var toWatch = positives.filter(exists);

  // We only do add our custom `ignored` if there are some negative globs
  // TODO: I'm not sure how to test this
  if (negatives.some(exists)) {
    opt.ignored = [].concat(opt.ignored, shouldBeIgnored);
  }
  var watcher = chokidar.watch(toWatch, opt);

  function runComplete(err) {
    running = false;

    if (err && hasErrorListener(watcher)) {
      watcher.emit('error', err);
    }

    // If we have a run queued, start onChange again
    if (queued) {
      queued = false;
      onChange();
    }
  }

  function onChange() {
    if (running) {
      if (opt.queue) {
        queued = true;
      }
      return;
    }

    running = true;
    asyncDone(cb, runComplete);
  }

  var fn;
  if (typeof cb === 'function') {
    fn = debounce(onChange, opt.delay);
  }

  function watchEvent(eventName) {
    watcher.on(eventName, fn);
  }

  if (fn) {
    opt.events.forEach(watchEvent);
  }

  return watcher;
}

module.exports = watch;
