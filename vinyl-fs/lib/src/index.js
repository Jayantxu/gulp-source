'use strict';

var gs = require('glob-stream');
// 结合流的阵列成使用单个双工流泵和duplexify
// 如果其中一个流关闭/错误，管道中的所有流都将被销毁。
var pumpify = require('pumpify');
// 在transformStream中包装ReadableStream
var toThrough = require('to-through');
var isValidGlob = require('is-valid-glob');
var createResolver = require('resolve-options');

var config = require('./options');
var prepare = require('./prepare');
var wrapVinyl = require('./wrap-vinyl');
var sourcemap = require('./sourcemap');
var readContents = require('./read-contents');
var resolveSymlinks = require('./resolve-symlinks');

function src(glob, opt) {
  // 此处进行默认的配置与传入的配置进行解析配置，详情可见vintl-fs-Test\createResolverTest.js
  // 类似合并默认配置项与用户传入配置项
  var optResolver = createResolver(config, opt);

  // 判断是否有效的glob(简化的正则表达式)
  if (!isValidGlob(glob)) {
    throw new Error('Invalid glob argument: ' + glob);
  }


  var streams = [
    // 使用了glob-stream模块，传入一个(简化的正则表达式)做为第一个参数，opt对象作为第二个参数，
    // 返回创建glob流
    gs(glob, opt),
    // 传入上述的解析配置，
    wrapVinyl(optResolver),
    // 
    resolveSymlinks(optResolver),
    // 进行文件stat以及与optResolver配置选项上进行时间的比较
    prepare(optResolver),
    // 对流进行操作，buffer，stream，
    readContents(optResolver),
    // 对文件的映射？
    sourcemap(optResolver),
    /*
    一步步的加工成streams
    传于pumpify
    */
  ];

  var outputStream = pumpify.obj(streams);
  // 返回outputStream作为参数的toThrough流
  return toThrough(outputStream);
}


module.exports = src;
