'use strict';
/*
dest主要作用是根据src接口接收透过来的输出流，并生成文件于指定文件夹
*/
// 将流信息转为
var lead = require('lead');
// 结合流的阵列成使用单个双工流泵和duplexify
// 如果其中一个流关闭/错误，管道中的所有流都将被销毁。
var pumpify = require('pumpify');
// 在写入文件前确认目标文件夹存在
var mkdirpStream = require('fs-mkdirp-stream');
// 配置选项的解析
var createResolver = require('resolve-options');
// 配置
var config = require('./options');
// 用于比较
var prepare = require('./prepare');
// 生成sourcemap
var sourcemap = require('./sourcemap');
var writeContents = require('./write-contents');

var folderConfig = {
  outFolder: {
    type: 'string',
  },
};

function dest(outFolder, opt) {
  // 如果目标outFolder为空--->报错
  if (!outFolder) {
    throw new Error('Invalid dest() folder argument.' +
      ' Please specify a non-empty string or a function.');
  }
  // 配置与用户传入配置的解析
  var optResolver = createResolver(config, opt);
  // 文件路径的配置解析---地址
  var folderResolver = createResolver(folderConfig, { outFolder: outFolder });
  // 
  function dirpath(file, callback) {
    var dirMode = optResolver.resolve('dirMode', file);

    callback(null, file.dirname, dirMode);
  }
  // 流
  var saveStream = pumpify.obj(
    // 提取以及校验流信息
    prepare(folderResolver, optResolver),
    // 生成sourcemap地图
    sourcemap(optResolver),
    // 传入解析dirMode的以下方法，...
    mkdirpStream.obj(dirpath),
    // 想合后的相应配置传入writeContents，然后写入相应文件
    writeContents(optResolver)
  );

  // Sink the output stream to start flowing
  // 流沉淀为文件
  return lead(saveStream);
}

module.exports = dest;
