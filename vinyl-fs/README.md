# vinyl-fs部分

当我们进入vinyl-fs的根目录index.js下，我们可以看到vinyl-fs所实现的src、dest接口是被分属于了几个外部模块 => 
```
'use strict';

// 让我们来看一下各自所属的文件
module.exports = {
  // 文件的处理上
  src: require('./lib/src'),
  dest: require('./lib/dest'),
  symlink: require('./lib/symlink'),
};

```
## 一、glob

在进入相应的模块方法分析之前，我们先来看一下什么是glob；

node的glob是指允许你使用一些正则表达式，用于匹配对应规则的文件，

类似于我们通常在gulp打包配置中所写的一样：
```

gulp.src(['./lib/images/*', './lib/images/*/*'])

```

而这其中即是我们的glob模式，也是如此我们可以匹配我们相应的传入文件。


**接下来，我们将陆续的来看一下
**src** 、 **dest** 的具体实现。**

## 二、src

我们进入 ./lib/src/index.js 中查看相应的入口文件

```
'use strict';

var gs = require('glob-stream');
// 结合流的阵列成使用单个双工流泵和duplexify
// 如果其中一个流关闭/错误，管道中的所有流都将被销毁。
var pumpify = require('pumpify');
// 在transformStream中包装ReadableStream
var toThrough = require('to-through');
var isValidGlob = require('is-valid-glob');
var createResolver = require('resolve-options');

// 以下各导入模块可以进入相应文件中查看注释分析
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
    // 传入上述的解析配置，创建一个vinly文件对象
    wrapVinyl(optResolver),
    // glob的stat为symlink的情况下，转为硬链接
    resolveSymlinks(optResolver),
    // 进行文件stat以及与optResolver配置选项上进行时间的比较
    prepare(optResolver),
    // 对流进行操作，获取文件内容，写入file.content属性
    // 预设为Buffer是通过readBuffer获取
    // 否则则通过readStream获取
    readContents(optResolver),
    // 对文件的映射，是否开启 sourcemap
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

```

至此，简单的将即是我们的gulp.src便是使用于将匹配的文件转换为流的形式进而通过各项处理

**接下来，让我们看一下dest中对stream的处理**

## 三、dest

我们依旧进入相应的 ./lib/dest/index.js 中查看其入口文件

```
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

```

依据着相应的模块指示，我们也可以大致的清楚了gulp进行打包操作的流程
