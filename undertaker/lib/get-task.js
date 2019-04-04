'use strict';

// 也就是对undertaker-registry中的get方法做一个提取?
function get(name) {
  // 从_registry寄存器中get
  return this._registry.get(name);
}

module.exports = get;
