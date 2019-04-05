
## 一

### gulp入口文件介绍：

可以在本文件目录下寻找到index.js，接下来让我们看一下其中都有什么内容 =>

```
'use strict';

var util = require('util'); 
var Undertaker = require('undertaker');

var vfs = require('vinyl-fs');var watch = require('glob-watcher');

function Gulp() {
  Undertaker.call(this);

  // Bind the functions for destructuring
  this.watch = this.watch.bind(this);
  this.task = this.task.bind(this);
  this.series = this.series.bind(this);
  this.parallel = this.parallel.bind(this);
  this.registry = this.registry.bind(this);
  this.tree = this.tree.bind(this);
  this.lastRun = this.lastRun.bind(this);
}
util.inherits(Gulp, Undertaker);

Gulp.prototype.src = vfs.src;
Gulp.prototype.dest = vfs.dest;
Gulp.prototype.symlink = vfs.symlink;
Gulp.prototype.watch = function(glob, opt, task) {
};

// Let people use this class from our instance
Gulp.prototype.Gulp = Gulp;

var inst = new Gulp();
module.exports = inst;

```


## 二

让我们由上到下的看一遍：


其中，声明了所需要加载的依赖包

```
// Node内部util模块，是Node中一个核心的工具函数模块
var util = require('util'); 

// 执行任务管理有关的逻辑,---> gulp.task()

var Undertaker = require('undertaker');

// vinyl-fs模块: src/dest/symlink
var vfs = require('vinyl-fs');

// npm中介绍为 ： 观察全局并在更改时执行功能，具有用于去抖动和排队的智能默认值。
var watch = require('glob-watcher');
```

## 三

我们接下去看一下**Gulp**这个方法中实现了什么功能

```
function Gulp() {
  // 转this,将Undertaker的方法绑定到this中
  Undertaker.call(this);

  // 绑定函数为解构
  this.watch = this.watch.bind(this);
  this.task = this.task.bind(this);
  this.series = this.series.bind(this);
  this.parallel = this.parallel.bind(this);
  this.registry = this.registry.bind(this);
  this.tree = this.tree.bind(this);
  this.lastRun = this.lastRun.bind(this);
}
```

我们可以在此看到我们所用到的gulp.task\gulp.series等方法都是来源于<font color="ff0000">**undertaker**</font>这个模块

## 四

```
// 继承,(构造函数,父类构造函数)
util.inherits(Gulp, Undertaker);

```

util是Node中的核心工具函数模块，其中的inherits是实现继承的一种方法

[Node-Api-util.inherits](http://nodejs.cn/api/util.html#util_util_inherits_constructor_superconstructor)

其中传入的参数为(子类构造函数, 父类构造函数)

## 五

```
Gulp.prototype.src = vfs.src;
Gulp.prototype.dest = vfs.dest;
Gulp.prototype.symlink = vfs.symlink;
Gulp.prototype.watch = function(glob, opt, task) {
  // 省略些许代码---后续涉及此部分将再提及
};

// Let people use this class from our instance
Gulp.prototype.Gulp = Gulp;
```

第五部分的代码既是将在Gulp的原型peototype上增加部分方法，且来源于<font color="ff0000">**vinyl-fs**</font>这个模块


## 六

```
var inst = new Gulp();
module.exports = inst;
```
最后一块即是new一个Gulp的实例，并将其暴露出来供调用使用


## 七

由此

我们可以知道我们需要了解gulp的内部执行机制以及流程，我们需要关注于

```
undertaker、
vinyl-fs、
glob-watcher
```
这三模块分别都将实现什么功能。

---

#### 题外->

##### util.inherits实现了什么？

```
var util = require('util'); 
function Base() { 
    this.name = 'base'; 
    this.base = 1991; 
    this.sayHello = function() { 
    console.log('Hello ' + this.name); 
    }; 
} 
Base.prototype.showName = function() { 
    console.log(this.name);
}; 
function Sub() { 
    this.name = 'sub'; 
} 
util.inherits(Sub, Base); 
var objBase = new Base(); 
objBase.showName();  // base
objBase.sayHello(); // Hello base
console.log(objBase);  // Base()
var objSub = new Sub(); 
objSub.showName();  // sub
// objSub.sayHello();  // is not a function
console.log(objSub);
```

在网上寻找的测试，inherits是通过将父类构造函数的原型链复制到子类的原型链上，进而实现的继承，因此我们也只能继承到相应原型链上的方法

```
exports.inherits = function(ctor, superCtor) {
  // 一些参数的合法性判断，略……

  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

同时继承的子类也可以通过super_访问到父类的构造函数

console.log(Sub.super_ === Base) // true

```
