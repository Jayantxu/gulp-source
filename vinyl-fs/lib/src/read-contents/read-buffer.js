'use strict';

// 对文件系统的fs模块上进行了改进
var fs = require('graceful-fs');
var removeBomBuffer = require('remove-bom-buffer');

function bufferFile(file, optResolver, onRead) {
  fs.readFile(file.path, onReadFile);

  function onReadFile(readErr, data) {
    if (readErr) {
      return onRead(readErr);
    }

    var removeBOM = optResolver.resolve('removeBOM', file);
    if (removeBOM) {
      file.contents = removeBomBuffer(data);
    } else {
      file.contents = data;
    }

    onRead();
  }
}

module.exports = bufferFile;
