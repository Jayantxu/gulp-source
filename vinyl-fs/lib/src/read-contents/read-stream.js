'use strict';

// fs增强版
var fs = require('graceful-fs');

// 返回through2将删除BOM 的流，前提是数据是UTF8缓冲区，其开头是BOM。
// 如果数据不是UTF8或没有BOM，则数据不会更改，这将成为正常的直通流。
var removeBomStream = require('remove-bom-stream');
// 懒惰的流
var lazystream = require('lazystream');
// 根据配置解析选项对象
var createResolver = require('resolve-options');

function streamFile(file, optResolver, onRead) {
  
  if (typeof optResolver === 'function') {
    onRead = optResolver;
    optResolver = createResolver();
  }
  // 文件路径
  var filePath = file.path;
  // 获取optResolver中的removeBOM值
  var removeBOM = optResolver.resolve('removeBOM', file);

  // 创建一个可读流
  file.contents = new lazystream.Readable(function() {
    var contents = fs.createReadStream(filePath);

    // 在返回前进行UTF-8的BOM流，则在返回时会删除BOM流
    if (removeBOM) {
      return contents.pipe(removeBomStream());
    }

    return contents;
  });

  onRead();
}

module.exports = streamFile;
