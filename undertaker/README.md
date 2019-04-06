
## undertaker模块文件分析

我们从上一篇的入口文件分析可以得知，**Gulp**进行task、series、parallel等任务时，所执行的方法入口其实来源于*undertaker*模块

因此我们也进入相应的*undertaker*模块一探究竟

## 一、undertaker-index.js

undertaker模块下的index.js方法 =>

```
// Node工具函数中的继承
var inherits = require('util').inherits;
// Node中的事件触发器
var EventEmitter = require('events').EventEmitter;

var DefaultRegistry = require('undertaker-registry');
var tree = require('./lib/tree');
var task = require('./lib/task');
var series = require('./lib/series');
var lastRun = require('./lib/last-run');
var parallel = require('./lib/parallel');
var registry = require('./lib/registry');
var _getTask = require('./lib/get-task');
var _setTask = require('./lib/set-task');

```

```

inherits(Undertaker, EventEmitter);

// 然后继续看一下其他模块方法的具体作用
Undertaker.prototype.tree = tree;

Undertaker.prototype.task = task;

Undertaker.prototype.series = series;

Undertaker.prototype.lastRun = lastRun;

Undertaker.prototype.parallel = parallel;

Undertaker.prototype.registry = registry;

Undertaker.prototype._getTask = _getTask;

Undertaker.prototype._setTask = _setTask;

```

依旧采用核心工具函数的inherits方法进行构造函数的继承

inherits(Undertaker, EventEmitter); 此处使得**Undertake**r构造函数继承自**Node**核心模块**EventEmitter** 的原型链上方法，以及将EventEmitter的构造函数绑定在Undertaker构造函数的**super_**上。

并且将我们在开始部分所require进来的方法函数添加至原始链prototype上，以便调用

<font color="ffff00">*接下来我们来看一下其中还有一个主方法，当中又实现了什么呢 => ?*</font>


```
function Undertaker(customRegistry) {

  EventEmitter.call(this);

  /*
  我们来看一下DefaultRegistry(undertaker-registry)都干了什么
  */
  this._registry = new DefaultRegistry();

  // 允许用户自定义的寄存器任务
  if (customRegistry) {
    this.registry(customRegistry);
  }

  // process.env => 包含对用户环境信息的 对象
  this._settle = (process.env.UNDERTAKER_SETTLE === 'true');
}
```

EventEmitter.call(this); 将EventEmitter执行函数的this绑定

this._registry = new DefaultRegistry(); new了一个DefaultRegistry的实例赋予this._registry属性

// 后两句我们稍后处理


*DefaultRegistry*来源于*undertaker-registry*


好的，那让我们现在来看一下，**undertaker-registry** 都将干些什么事。

## 二、undertaker-registry - index.js

```

// 提供了形如get、set的接口,充当寄存器的作用存放着那些任务队列

function DefaultRegistry() {

  if (this instanceof DefaultRegistry === false) {
    return new DefaultRegistry();
  }

  this._tasks = {};
}

// 可能是初始化的作用
DefaultRegistry.prototype.init = function init(taker) {};

// 从上边的_tasks对象中去key=name的那个
DefaultRegistry.prototype.get = function get(name) {
  return this._tasks[name];
};

// set的时候,针对传入的name作为key,存放相应的处理方法fn
DefaultRegistry.prototype.set = function set(name, fn) {
  return this._tasks[name] = fn;
};

DefaultRegistry.prototype.tasks = function tasks() {
  var self = this;
  // 接收一个函数作为累加器->扩展->reduce()的用法
  return Object.keys(this._tasks).reduce(function(tasks, name) {
    tasks[name] = self.get(name);
    return tasks;
  }, {});
  // {}将作为tasks的初始值->也就是=> 相当于令一开始的  tasks={},  最终返回
};

module.exports = DefaultRegistry;

```

undertaker-registry方法，增加在其构造函数中创建一个空对象_tasks = {}

并且在其原型链上提供了四个方法

- init
- get
- set
- tasks

也就是定义了一个内部属性_registry作为寄存器**注册/寄存器模式的实现，提供统一接口来存储和读取 tasks**


### 回到undertaker-index.js

```
// 允许用户自定义的寄存器任务
  if (customRegistry) {
    this.registry(customRegistry);
  }
```
接下来的这一句：

是根据前部引入的来实现的，那么它具体实现了什么功能呢？
```
var registry = require('./lib/registry');
```

我们接下来看一下 => 

## 三、 ./lib/registry

```
function setTasks(inst, task, name) {
  inst.set(name, task);
  return inst;
}

function registry(newRegistry) {
  if (!newRegistry) {
    return this._registry;
  }

  //验证是否有效，主要判断是否带有 .get/.set/.tasks/.init 接口，若不符合则抛出错误
  validateRegistry(newRegistry);

  var tasks = this._registry.tasks();

  //将现有 tasks 拷贝到新的寄存器上
  this._registry = reduce(tasks, setTasks, newRegistry);
  //调用初始化接口（无论是否需要，寄存器务必带有一个init接口）
  this._registry.init(this);
}

module.exports = registry;
```


至此，将来逐步分析其余各任务方法模块的作用

其中包括

Undertaker.prototype.tree = tree; 

Undertaker.prototype.task = task; 

Undertaker.prototype.series = series;

Undertaker.prototype.lastRun = lastRun;

Undertaker.prototype.parallel = parallel;

Undertaker.prototype.registry = registry;

Undertaker.prototype._getTask = _getTask;

Undertaker.prototype._setTask = _setTask;


将按以下顺序进行 => 

**/lib/set-task**

**/lib/get-task**

**/lib/last-run**

**/lib/task**

**/lib/tree**

**/lib/series**

**/lib/parallel**


## 四、./lib/set-task

set-task

```
'use strict';

var assert = require('assert');

var metadata = require('./helpers/metadata');

/*
var WM = require('es6-weak-map');
var metadata = new WM();
=>ES6中的WeakMap新类型,在其中引用的对象不计入垃圾回收机制,例如书中讲可用于存放一些DOM相关对象
=>此处为什么用WeakMap不用Map,可能是方便任务执行结束,有效清理内存
提供get、set等方法
*/

// set方法采用了map(WeakMap)的数据类型进行存放



// 暴露了一个set方法
function set(name, fn) {

  // 其中对task第一个参数的name进行类型判断=>错误则报
  assert(name, 'Task name must be specified');
  assert(typeof name === 'string', 'Task name must be a string');
  assert(typeof fn === 'function', 'Task function must be specified');

  
  // 绑定this, 在this中使用参数 fn 对象的方法以及参数
  // 因为WeakMap中要求的key对象不能被引用过
  function taskWrapper() {
    // 返回一个新包装this后的函数
    return fn.apply(this, arguments);
  }

  function unwrap() {
    // 返回原本的fn函数方法
    return fn;
  }

  // 将name、fn包装
  taskWrapper.unwrap = unwrap;
  taskWrapper.displayName = name;
  
  // 打印一下输出是什么 => 
  console.log(`taskWrapper： ${taskWrapper}`)


  var meta = metadata.get(fn) || {};

  // 打印一下输出是什么 => 
  console.log(`meta: ${meta}`)

  var nodes = [];
  if (meta.branch) {
    nodes.push(meta.tree);
  }

  var task = this._registry.set(name, taskWrapper) || taskWrapper;

  // 打印一下输出是什么 => 
  console.log(`task: ${task}`)

  // 存入WeakMap对象
  metadata.set(task, {
    name: name,
    orig: fn,
    tree: {
      label: name,
      type: 'task',
      nodes: nodes,
    },
  });

  // 打印一下输出是什么 => 
  console.log(`metadata: ${metadata.get(task)}`)
}

module.exports = set;


```

## 五、./lib/get-task

get-task方法模块代码很简单

```
'use strict';

// 也就是对undertaker-registry中的get方法提取
function get(name) {
  // 从_registry寄存器中get
  return this._registry.get(name);
}

module.exports = get;

```

## 六、./lib/last-run

用来记录和获取针对某个方法的执行前/后时间

```
'use strict';

// npm中其介绍的功能为,记录函数的时间点 => 对metadata对象的属性一顿操作
var retrieveLastRun = require('last-run');

var metadata = require('./helpers/metadata');


function lastRun(task, timeResolution) {
  if (timeResolution == null) {
    timeResolution = process.env.UNDERTAKER_TIME_RESOLUTION;
  }

  var fn = task;
  if (typeof task === 'string') {
    fn = this._getTask(task);
  }

  var meta = metadata.get(fn);

  if (meta) {
    fn = meta.orig || fn;
  }

  return retrieveLastRun(fn, timeResolution);
}

module.exports = lastRun;

```

## 七、./lib/tree

通过遍历metadata，获取当前注册过的所有任务的metadata

```
'use strict';

var defaults = require('object.defaults');
var map = require('collection-map');

var metadata = require('./helpers/metadata');

// 可用于获取当前注册过的所有任务的metadata-WeakMap
// 也就是说,可以获取到当前我们定义了那些任务,对应方法,任务间依赖等关系

function tree(opts) {

  // 此方法会覆盖判断是否存在opts,并覆盖其中的{deep: false}
  opts = defaults(opts || {}, {
    deep: false,
  });

  // 获取寄存器中的tasks
  var tasks = this._registry.tasks();
  
  // 遍历tasks并且返回WeakMap(metadata)的“任务数组” 
  var nodes = map(tasks, function(task) {

    
    var meta = metadata.get(task);

    if (opts.deep) {
      return meta.tree;
    }

    return meta.tree.label;
  });

  return {
    label: 'Tasks',
    nodes: nodes,
  };
}

module.exports = tree;


/*
var undertaker = require('undertaker');
ut = new undertaker();

ut.task('taskA', function(cb){console.log('A'); cb()});
ut.task('taskB', function(cb){console.log('B'); cb()});
ut.task('taskC', function(cb){console.log('C'); cb()});
ut.task('taskD', function(cb){console.log('D'); cb()});
ut.task('taskE', function(cb){console.log('E'); cb()});

ut.task('taskC', ut.series('taskA', 'taskB'));
ut.task('taskE', ut.parallel('taskC', 'taskD'));

var tree = ut.tree();
console.log(tree);
*/
```

## 八、./lib/task
使用举例：

```

gulp.task('css_comm', function() {
  return gulp.src(['1.css','2.css'])
      .pipe(concat('common.css'))
      .pipe(gulp.dest('./build/css'))
});

```

```

'use strict';

function task(name, fn) {

  // 此处 if判断 写法为处理“新”打包写法
  /*
  function uglify(){
    return gulp.src(['src/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
  }
  gulp.task(uglify);
  */
  if (typeof name === 'function') {
    fn = name;
    name = fn.displayName || fn.name;
  }

  // 当第二个参数为为空不存在时，即是对相应任务的获取----配合上一段  if 一起看
  /*
    gulp.task('css_comm', function() {
    });
  */
  if (!fn) {
    return this._getTask(name);
  }

  // 调整好关系,再次存入task
  this._setTask(name, fn);
  // console.log(`name: ${name}, fn: ${fn}`)

  /*此两处的_getTask和_setTask=>可以看一下,类似于一开始DefaultRegistry中对tasks中
    任务的操作(get\set)
  */

}

module.exports = task;

```

## 九、./lib/parallel

this.parallel的使用 =>

```

var undertaker = require('undertaker');
ut = new undertaker();

  ut.task('taskA', function(){});
  ut.task('taskB', function(){});
  ut.task('taskC', function(){});
  ut.task('taskD', function(){});

// taskD 需要在 'taskA', 'taskB', 'taskC' 执行完毕后才开始执行，
// 其中 'taskA', 'taskB', 'taskC' 的执行是异步的
ut.task('taskD', ut.parallel('taskA', 'taskB', 'taskC'));

```

**那让我们来看一下parallel中分别实现了些什么吧！**

```
'use strict';

var bach = require('bach');

var metadata = require('./helpers/metadata');
var buildTree = require('./helpers/buildTree');
var normalizeArgs = require('./helpers/normalizeArgs');
var createExtensions = require('./helpers/createExtensions');

function parallel() {
  var create = this._settle ? bach.settleParallel : bach.parallel;

  // 根据“任务”数组从寄存器中获取展开的任务数组
  var args = normalizeArgs(this._registry, arguments);
  // 为对象扩展新“”对象
  var extensions = createExtensions(this);
  // 将参数与扩展的对象(after,before,create,error)做关联
  // 所以我们来看一下它具体实现了些什么 => 
  
  // bach.settleParallel+
  
  (args, extensions) : bach.parallel(args, extensions)
  var fn = create(args, extensions);

  fn.displayName = '<parallel>';

  metadata.set(fn, {
    name: fn.displayName,
    branch: true,
    tree: {
      label: fn.displayName,
      type: 'function',
      branch: true,
      nodes: buildTree(args),
    },
  });
  return fn;
}

module.exports = parallel;

```
让我们从上到下的分析一下

```
// 根据“任务”数组从寄存器中获取展开的任务数组
var args = normalizeArgs(this._registry, arguments);
```
**normalizeArgs** 方法是来源于模块 **./helpers/normalizeArgs**

那让我们转向来看一下此模块

### 九(1)、normalizeArgs

```
'use strict';

// nODE的断言测试
var assert = require('assert');

// 类似于Array.map()的改进版本=>最终返回的也是数组
/*
:npm中的讲解
map(['a', 'b', 'c'], function(ele, i) {
  return i + ele;
});
//=> ['0a', '1b', '2c']
*/
var map = require('arr-map');

// 将数组展开为平面数组,解除嵌套
/*
flatten(['a', ['b', ['c']], 'd', ['e']]);
//=> ['a', 'b', 'c', 'd', 'e']*/
var flatten = require('arr-flatten');

// 接收到寄存器以及相应的“任务数组”
function normalizeArgs(registry, args) {

  // 传递入一个一个的“任务”方法
  function getFunction(task) {

    // task类型判断
    if (typeof task === 'function') {
      return task;
    }

    // 从我们寄存器中找到有没有这个key的function,因为存在旧的写法----不知是否有理解错
    /*
    gulp.task('uglify', function(){
        return gulp.src(['src/*.js'])
            .pipe(uglify())
            .pipe(gulp.dest('dist'));
    });
    gulp.task('default', ['uglify']);
    =>上面的一开始给registry传入的是一个uglify的key
    */
    var fn = registry.get(task);
    // 错误处理
    assert(fn, 'Task never defined: ' + task);
    // 回
    return fn;
  }
  // “任务数组”展开
  var flattenArgs = flatten(args);
  // 根据长度,判断是否写空了
  assert(flattenArgs.length, 'One or more tasks should be combined using series or parallel');

  // 对“任务数组”的任务进行方法的遍历
  return map(flattenArgs, getFunction);
}

module.exports = normalizeArgs;

```


//通过参数获取存在寄存器（registry）中的 taskFunctions（数组形式）
var args = normalizeArgs(this._registry, arguments);

**接下来我们继续阅读下一句：**
var extensions = createExtensions(this);

而**createExtensions**是来源于模块**helpers/createExtensions**

那么我们看一下其中实现了什么 = ?

### 九(2)、createExtensions

```
'use strict';

// 使用某函数,并记录捕获当前时间戳或者传入时间戳
var captureLastRun = require('last-run').capture;

// 获取一个function并删除最后一次运行时时间戳
var releaseLastRun = require('last-run').release;

var metadata = require('./metadata');

var uid = 0;

function Storage(fn) {
  var meta = metadata.get(fn);

  this.fn = meta.orig || fn;
  this.uid = uid++;
  this.name = meta.name;
  this.branch = meta.branch || false;
  this.captureTime = Date.now();
  this.startHr = [];
}

Storage.prototype.capture = function() {
  captureLastRun(this.fn, this.captureTime);
};

Storage.prototype.release = function() {
  releaseLastRun(this.fn);
};

function createExtensions(ee) {
  return {
    create: function(fn) {
      // 调用create时候,记录一下相关信息,并返回
      return new Storage(fn);
    },
    before: function(storage) {
      // Node获取相对于过去某一刻的时间
      storage.startHr = process.hrtime();
      // Node触发start事件,后面为参数
      ee.emit('start', {
        uid: storage.uid,
        name: storage.name,
        branch: storage.branch,
        time: Date.now(),
      });
    },
    after: function(result, storage) {
      // 调用时判断是否有错,有则爆
      if (result && result.state === 'error') {
        return this.error(result.value, storage);
      }
      // 记录当前时间戳
      storage.capture();
      // Node触发stop事件
      ee.emit('stop', {
        uid: storage.uid,
        name: storage.name,
        branch: storage.branch,
        duration: process.hrtime(storage.startHr),
        time: Date.now(),
      });
    },
    error: function(error, storage) {
      if (Array.isArray(error)) {
        error = error[0];
      }
      // 删除出错的此次执行时间戳
      storage.release();
      ee.emit('error', {
        uid: storage.uid,
        name: storage.name,
        branch: storage.branch,
        error: error,
        duration: process.hrtime(storage.startHr),
        time: Date.now(),
      });
    },
  };
}

module.exports = createExtensions;

```
此方法扩展，为变量新增拥有**create**、**before**、**after**、**error**等方法的一个对象

最终期望将扩展出来的对象与我们的“任务”task关联

**接着我们来看下一句:**

var fn = create(args, extensions);

create => var create = this._settle ? bach.settleParallel : bach.parallel;

**bach**模块来源于**bach**

接下来我们再来看一下bach模块实现了些什么 => ?

### 九(3)、bach

```
module.exports = {
  series: require('./lib/series'),
  parallel: require('./lib/parallel'),
  settleSeries: require('./lib/settleSeries'),
  settleParallel: require('./lib/settleParallel'),
};
```

而我们所需要用的的parallel是来源于**lib/parallel**

而**lib/parallel**具体代码如下:

```
'use strict';

// 对数组取值操作,取第一及最后一个
var initial = require('array-initial');
var last = require('array-last');
// 用于异步化函数
var asyncDone = require('async-done');

var nowAndLater = require('now-and-later');

var helpers = require('./helpers');

function iterator(fn, key, cb) {
  // 那asyncDone又是做什么的呢 => ?
  // 传入一个方法与回调
  return asyncDone(fn, cb);
}

function buildParallel() {
  // 校验传入参数(arguments的合法性)
  var args = helpers.verifyArguments(arguments);

  // 取到最后一个参数,即传入时的extensions,然后执行此方法
  // 如果最后一个参数!==function则return 回
  var extensions = helpers.getExtensions(last(args));

  if (extensions) {
    // 如果扩展对象存在,取第一个参数
    args = initial(args);
  }

  // 我们具体来看一下nowAndLater.map做了什么 => 
  function parallel(done) {

    /*
    传入了四个值(args, function iterator(fn, key, cb) {return asyncDone(fn, cb);}, 扩展的对象, done)
    */
    nowAndLater.map(args, iterator, extensions, done);
    //遍历tasks数组，将其生命周期和extensions属性关联起来,且将每个task异步化，且并发执行
  }

  return parallel;
}

module.exports = buildParallel;

```

这一段代码中所用的的重要方法函数有这些：

```
function iterator(fn, key, cb) {
  return asyncDone(fn, cb);
}

/*...省略*/
function parallel(done) {

  nowAndLater.map(args, iterator, extensions, done);
}
```

首先可以让我们来看一下**async-Done**分别做了什么 => ？


### 九(4)async-Done

它可以把一个普通函数（传入的第一个参数）异步化

```
//demo1
var asyncDone = require('async-done');

asyncDone(function(done){
    console.log('测试AsyncDone---1--开始');
    done(null, '测试AsyncDone---1--结束')
}, function(err, data){
  //  成功执行第一个函数时，``error`将为null。
  //  `result`将是第一个函数的结果。
    console.log(data)
});

asyncDone(function(done){
    console.log('测试AsyncDone---2--开始');
    setTimeout( done.bind(this, null, '测试AsyncDone---2--结束'), 1000 )

}, function(err, data){
    console.log(data)
});

asyncDone(function(done){
    console.log('测试AsyncDone---3--开始');
    done(null, '测试AsyncDone---3--结束')
}, function(err, data){
    console.log(data)
});
```

**执行的结果 :**

- 测试AsyncDone---1--开始
- 测试AsyncDone---1--结束
- 测试AsyncDone---2--开始
- 测试AsyncDone---3--开始
- 测试AsyncDone---3--结束
- 测试AsyncDone---2--结束

其中第一个参数方法中的done将会提醒第二个参数(callback)去执行相关回调


**接下来我们我们再来看一下parallel的重要部分 :**

```
function parallel(done) {
nowAndLater.map(args, iterator, extensions, done);
}
```

而nowAndLater的模块接口来源于**now-and-later**

那我们再来看一下**now-and-later**实现了些什么呢?

### 九(5)、now-and-later

```
var once = require('once');
var helpers = require('./helpers');

function map(values, iterator, extensions, done) {
    if (typeof extensions === 'function') {
        done = extensions;
        extensions = {};
    }

    if (typeof done !== 'function') {
        done = helpers.noop;  //没有传入done则赋予一个空函数
    }

    //让 done 函数只执行一次
    done = once(done);

    var keys = Object.keys(values);
    var length = keys.length;
    var count = length;
    var idx = 0;

    // 初始化一个空的、和values等长的数组
    var results = helpers.initializeResults(values);

    /**
     * helpers.defaultExtensions(extensions) 返回如下对象：
     *  {
            create: extensions.create || defaultExts.create,
            before: extensions.before || defaultExts.before,
            after: extensions.after || defaultExts.after,
            error: extensions.error || defaultExts.error,
        }
     */
    var exts = helpers.defaultExtensions(extensions);

    for (idx = 0; idx < length; idx++) {
        var key = keys[idx];
        next(key);
    }

    function next(key) {
        var value = values[key];
        //创建一个 Storage 实例
        var storage = exts.create(value, key) || {};
        //触发'start'事件
        exts.before(storage);
        //利用 async-done 将 taskFunction 转为异步方法并执行
        iterator(value, once(handler));

        function handler(err, result) {
            if (err) {
                //触发'error'事件
                exts.error(err, storage);
                return done(err, results);
            }
            //触发'stop'事件
            exts.after(result, storage);
            results[key] = result;
            if (--count === 0) {
                done(err, results);
            }
        }
    }
}

module.exports = map;

```

在这段代码的 map 方法中，通过 for 循环遍历了每个传入 parallel 接口的 taskFunction，然后使用 iterator（async-done）将 taskFunction 异步化并执行（执行完毕会触发 hadler），并将 extensions 的各方法和 task 的生命周期关联起来（比如在任务开始时执行“start”事件、任务出错时执行“error”事件）。 ------[引用自vaoy博客说明]


## 十、./lib/series

series接口的使用:

```
ut.task('taskA', function(){/*略*/});
  ut.task('taskB', function(){/*略*/});
  ut.task('taskC', function(){/*略*/});
  ut.task('taskD', function(){/*略*/});

// taskD 需要在 'taskA', 'taskB', 'taskC' 执行完毕后才开始执行，
// 其中 'taskA', 'taskB', 'taskC' 的执行必须是按顺序一个接一个的
  ut.task('taskD', ut.series('taskA', 'taskB', 'taskC'));
```

其实现和parallel是基本一致的，但在series中使用的是nowAndlater的mapSeries接口

```
next(key);

    function next(key) {
        var value = values[key];

        var storage = exts.create(value, key) || {};

        exts.before(storage);
        iterator(value, once(handler));

        function handler(err, result) {
            if (err) {
                exts.error(err, storage);
                return done(err, results); //有任务出错，故所有任务应停止调用
            }

            exts.after(result, storage);
            results[key] = result;

            if (++idx >= length) {
                done(err, results); //全部任务已经结束了
            } else {
                next(keys[idx]);  //next不在是放在外面的循环里，而是在任务的回调里
            }
        }
    }
```

此处在series接口中通过改动 next 的位置，可以很好地要求传入的任务必须一个接一个去执行（后一个任务在前一个任务执行完毕的回调里才会开始执行）。

