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