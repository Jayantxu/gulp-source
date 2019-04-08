'use strict';
// Node流相关
var through = require('through2');
// read-contents中
var readDir = require('./read-dir');
var readStream = require('./read-stream');
var readBuffer = require('./read-buffer');
var readSymbolicLink = require('./read-symbolic-link');

function readContents(optResolver) {

  function readFile(file, enc, callback) {

    // Skip reading contents if read option says so
    // 多个配置选项上的read为false的话，不进行
    var read = optResolver.resolve('read', file);
    if (!read) {
      return callback(null, file);
    }

    // Don't fail to read a directory
    // 如果可以读取目录则执行
    if (file.isDirectory()) {
      /* readDir中封装了如下：
        function readDir(file, optResolver, onRead) {
          // Do nothing for now
          onRead();
        }
        所以也只是执行了onRead()，= >
        callback回来了;
        function onRead(readErr) {
          if (readErr) {
            return callback(readErr);
          }
          return callback(null, file);
        }
      */
      return readDir(file, optResolver, onRead);
    }

    // Process symbolic links included with `resolveSymlinks` option
    // 
    if (file.stat && file.stat.isSymbolicLink()) {

      return readSymbolicLink(file, optResolver, onRead);
    }

    // Read and pass full contents
    // 读取oprResolver的buffer值
    var buffer = optResolver.resolve('buffer', file);
    if (buffer) {
      // 以Buffer读取，内部运用了readFile
      return readBuffer(file, optResolver, onRead);
    }

    // Don't buffer anything - just pass streams
    // 如果以上的if()都不符合，则将会readStream此流
    return readStream(file, optResolver, onRead);

    // This is invoked by the various readXxx modules when they've finished
    // reading the contents.
    function onRead(readErr) {
      if (readErr) {
        return callback(readErr);
      }
      return callback(null, file);
    }
  }

  return through.obj(readFile);
}

module.exports = readContents;
