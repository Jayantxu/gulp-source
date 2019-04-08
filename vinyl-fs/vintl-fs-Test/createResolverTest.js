var createResolver = require('resolve-options');
var config = {
  cwd: {
    type: 'string',
    default: process.cwd
  },
  sourcemaps: {
    type: 'boolean',
    default: false
  },
  since: {
    type: ['date', 'number']
  },
  read: {
    type: 'boolean'
  },
  resolveSymlinks: {
    type: 'boolean',
    default: true,
  }
};
 
var options = {
  sourcemaps: true,
  since: Date.now(),
  read: function(file) {
    return (file.extname !== '.mp4');
  },
  // resolveSymlinks: false
};
var resolverT = createResolver(config, options)
console.log(resolverT)
var cwd = resolverT.resolve('sourcemaps')
console.log(cwd)  //true
console.log(resolverT.resolve('resolveSymlinks')) // false
