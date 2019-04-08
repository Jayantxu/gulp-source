'use strict';

var path = require('path');

var fs = require('graceful-fs');
var Vinyl = require('vinyl');
var through = require('through2');

function prepareWrite(folderResolver, optResolver) {
  // 配置中是否目标路径为空
  if (!folderResolver) {
    throw new Error('Invalid output folder');
  }

  function normalize(file, enc, cb) {
    // 系统中文件的虚拟数据对象---
    if (!Vinyl.isVinyl(file)) {
      return cb(new Error('Received a non-Vinyl object in `dest()`'));
    }

    // TODO: Remove this after people upgrade vinyl/transition from gulp-util
    if (typeof file.isSymbolic !== 'function') {
      file = new Vinyl(file);
    }

    // 解析出输出的文件路径
    var outFolderPath = folderResolver.resolve('outFolder', file);
    // 是否有效
    if (!outFolderPath) {
      return cb(new Error('Invalid output folder'));
    }
    // 以下三个均是解析相应的信息参数
    var cwd = path.resolve(optResolver.resolve('cwd', file));
    var basePath = path.resolve(cwd, outFolderPath);
    var writePath = path.resolve(basePath, file.relative);

    // Wire up new properties，为新的文件写入新参数
    file.cwd = cwd;
    file.base = basePath;
    file.path = writePath;
    if (!file.isSymbolic()) {
      var mode = optResolver.resolve('mode', file);
      file.stat = (file.stat || new fs.Stats());
      file.stat.mode = mode;
    }

    cb(null, file);
  }

  return through.obj(normalize);
}

module.exports = prepareWrite;
