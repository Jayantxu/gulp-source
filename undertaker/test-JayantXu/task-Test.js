var task = require('../lib/task');
task('uglify', function(){
  console.log('Test-Jayant-task')
});

/*
将会打印出 => 
name: uglify, fn: function (){
  console.log('Test-Jayant-task')
}
*/