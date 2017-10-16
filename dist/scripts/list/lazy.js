'use strict';

!(function (win, doc, undefined) {

  if (typeof IntersectionObserver !== 'function') {
    var isInSight;
    var checkImgs;

    (function () {
      isInSight = function isInSight(el) {
        var bound = el.getBoundingClientRect();
        var clientHeight = window.innerHeight;
        return bound.top <= clientHeight + 100;
      };

      var index = 0;

      checkImgs = function checkImgs() {
        var imgs = document.getElementsByTagName('img'); //document.querySelectorAll('.my-photo');
        for (var i = index; i < imgs.length; i++) {
          if (isInSight(imgs[i])) {
            loadImg(imgs[i]);
            index = i;
          }
        }
      };
    })();
  } else {
    var checkImgs = function checkImgs() {
      var imgs = Array.from(document.getElementsByTagName('img'));
      imgs.forEach(function (item) {
        io.observe(item);
      });
    };
    /**
     * callback的参数是一个数组，每个数组都是一个IntersectionObserverEntry对象，包括以下属性：
     * time	可见性发生变化的时间，单位为毫秒
        rootBounds	与getBoundingClientRect()方法的返回值一样
        boundingClientRect	目标元素的矩形区域的信息
        intersectionRect	目标元素与视口（或根元素）的交叉区域的信息
        intersectionRatio	目标元素的可见比例，即intersectionRect占boundingClientRect的比例，完全可见时为1，完全不可见时小于等于0
        target	被观察的目标元素，是一个 DOM 节点对象
     */

    var io = new IntersectionObserver(function (ioes) {
      console.info(ioes);
      ioes.forEach(function (ioe) {
        var el = ioe.target;
        //   console.log(el)
        var intersectionRatio = ioe.intersectionRatio;
        // console.log(intersectionRatio)
        if (intersectionRatio > 0 && intersectionRatio) {
          // 在可视区域内 (完全可见时为1，完全不可见时小于等于0)
          io.unobserve(el);
          loadImg(el);
        }
      });
    });
  }

  function loadImg(el) {
    // if (!el.src) {
    var source = el.getAttribute("lazy-src"); // el.dataset.src;
    el.src = source;
    // }
  }

  function throttle(fn) {
    var mustRun = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];

    var timer = null;
    var previous = null;
    return function () {
      var now = new Date();
      var context = this;
      var args = arguments;
      if (!previous) {
        previous = now;
      }
      var remaining = now - previous;
      if (mustRun && remaining >= mustRun) {
        fn.apply(context, args);
        previous = now;
      }
    };
  }

  window.onload = checkImgs;
  window.onscroll = throttle(checkImgs);
})(undefined || window, document);