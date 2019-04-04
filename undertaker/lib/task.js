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
