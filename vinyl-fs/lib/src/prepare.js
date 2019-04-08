'use strict';

var through = require('through2');

function prepareRead(optResolver) {

  function normalize(file, enc, callback) {

    // 提取配置选项中的since值
    var since = optResolver.resolve('since', file);

    // Skip this file if since option is set and current file is too old
    // 如果已经设置过文件选项(stat)或当前文件已经太旧，则跳过
    if (file.stat && file.stat.mtime <= since) {
      return callback();
    }

    return callback(null, file);
  }

  return through.obj(normalize);
}

module.exports = prepareRead;
