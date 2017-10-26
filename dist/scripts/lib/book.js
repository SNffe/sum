"use strict";

var Class = function Class(parent) {
  var kclass = function kclass() {
    this.init.apply(this, arguments);
  };

  if (parent) {
    var subclass = function subclass() {};
    subclass.prototype = parent.prototype;
    kclass.prototype = new subclass();
  }

  kclass.prototype.init = function () {};
  kclass.fn = kclass.prototype;
  kclass.fn.parent = kclass;

  kclass.extend = function (obj) {
    //复制到类中
    var extended = obj.extended;
    for (var i in obj) {
      kclass[i] = obj[i];
    }
    if (extended) extended(kclass);
  };

  kclass.include = function (obj) {
    // 复制到类原型中
    var included = obj.included;
    for (var i in obj) {
      kclass.fn[i] = obj[i];
    }
    if (included) included(kclass);
  };

  kclass.proxy = function (func) {
    var self = this;
    return function () {
      return func.apply(self, arguments);
    };
  };

  return kclass;
};

var Person = new Class();
Person.extend({
  find: function find() {},
  exists: function exists() {}
});

var person = Person.find(1);

var PubSub = {
  subscribe: function subscribe(ev, callback) {
    var calls = this._callbacks || (this._callbacks = {})(this._callbacks[ev] || (this._callbacks[ev] = [])).push(callback);
    return this;
  },
  publish: function publish() {
    var args = [].slice.call(arguments, 0);
    var ev = args.shift();

    var list, calls, i, list;
    if (!(calls = this._callbacks)) return this;
    if (!(list = this._callbacks[ev])) return this;

    for (i = 0, l = list.length; i < l; i++) {
      list[i].apply(this, args);
    }

    return this;
  }
};