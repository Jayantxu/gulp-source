'use strict';

var through = require('through2');
var sourcemap = require('vinyl-sourcemap');

function sourcemapStream(optResolver) {

  function addSourcemap(file, enc, callback) {
    var srcMap = optResolver.resolve('sourcemaps', file);

    if (!srcMap) {
      return callback(null, file);
    }

    // 解析内联源映射,根据onAdd的方法，updatedFile将具有sourceMap的属性
    sourcemap.add(file, onAdd);

    function onAdd(sourcemapErr, updatedFile) {
      if (sourcemapErr) {
        return callback(sourcemapErr);
      }

      callback(null, updatedFile);
    }
  }

  return through.obj(addSourcemap);
}

module.exports = sourcemapStream;
