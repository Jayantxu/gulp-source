gulp.task('css_comm', function() {
  return gulp.src(['1.css','2.css'])
      .pipe(concat('common.css'))
      .pipe(gulp.dest('./build/css'))
});