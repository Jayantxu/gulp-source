'use strict';

var File = require('vinyl');
// Node流的一个包装，rhrough2基于readable-stream接口进行了封装
// through2 会为你生成 Transform Streams（貌似旧版本是 Duplex Streams）来处理任意你想使用的流 —— 如前文介绍，相比其它流，Transform 流处理起数据会更加灵活方便。
var through = require('through2');

function wrapVinyl() {

  function wrapFile(globFile, enc, callback) {

    var file = new File(globFile);

    callback(null, file);
  }

  return through.obj(wrapFile);
}

module.exports = wrapVinyl;
