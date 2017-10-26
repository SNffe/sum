// loadingBar
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

!(function (win, doc, undefined) {
    var LoadingBar = (function () {
        function LoadingBar() {
            _classCallCheck(this, LoadingBar);

            this.width = 0;
            this.oLoadDiv = null;
            this.init();
        }

        _createClass(LoadingBar, [{
            key: 'init',
            value: function init() {
                this.creatStyle();
                this.creatLoadDiv();
            }
        }, {
            key: 'creatLoadDiv',
            value: function creatLoadDiv() {
                var div = doc.createElement('div');
                div.id = '_loadingBar';
                doc.body.appendChild(div);
                this.oLoadDiv = doc.getElementById('_loadingBar');
            }
        }, {
            key: 'over',
            value: function over(dom) {
                setTimeout(function () {
                    dom.style.display = 'none';
                    dom.style.width = 0;
                }, 1100);
            }
        }, {
            key: 'creatStyle',
            value: function creatStyle() {
                var nod = doc.createElement('style'),
                    str = '#_loadingBar{transition:all 1s;\n                -webkit-transition:all 1s;\n                background-color:#f90;\n                height: 3px;width:0; \n                position: fixed;\n                top: 0;\n                z-index: 99999;left: 0;font-size: 0;}\n            .animation_paused{-webkit-animation-play-state:paused;\n                animation-play-state:paused;};';
                nod.type = 'text/css';
                nod.styleSheet ? nod.styleSheet.cssText = str : nod.innerHTML = str;
                doc.getElementsByTagName('head')[0].appendChild(nod);
            }
        }, {
            key: 'setWidth',
            value: function setWidth(w) {
                if (!this.oLoadDiv) {
                    this.init();
                }
                var oLoadDiv = this.oLoadDiv,
                    width = Number(w) || 100;
                oLoadDiv.style.display = 'block';
                /*防止后面写入的width小于前面写入的width*/
                // (width<this.width) ? width=this.width : this.width = width
                oLoadDiv.className = 'animation_paused';
                oLoadDiv.style.width = width + '%';
                oLoadDiv.className = '';

                if (width === 100) {
                    this.over(oLoadDiv);
                }
            }
        }]);

        return LoadingBar;
    })();

    window.LoadingBar = LoadingBar;
})(undefined || window, document);

!(function (win, doc, undefined) {

    var LISTDATA = [{
        name: 'mvvm',
        url: './list/mvvm.html'
    }, {
        name: '简易virtualDom实现',
        url: './list/virtualdom.html'
    }, {
        name: '下拉加载',
        url: './list/pulldown.html'
    }, {
        name: 'AMD loadjs',
        url: './list/amd.html'
    }, {
        name: '图片懒加载 (new IntersectionObserver(cb, option))',
        url: './list/lazy.html'
    }, {
        name: 'console',
        url: './list/console.html'
    }, {
        name: '常用居中方式',
        url: './list/align-center.html'
    }, {
        name: 'footer 底部固定',
        url: './list/footer.html'
    }, {
        name: 'border-handle (wap 1px border)',
        url: './list/border-handle.html'
    }, {
        name: 'css3 Loading',
        url: './list/css3loading.html'
    }];

    var Page = (function () {
        function Page() {
            _classCallCheck(this, Page);
        }

        _createClass(Page, [{
            key: 'addEvent',
            value: function addEvent() {
                document.querySelectorAll('[data-href]').forEach(function (item, i) {
                    item.addEventListener('click', function () {
                        if (!!item.getAttribute('data-href')) {
                            win.location.href = item.getAttribute('data-href');
                        }
                    });
                });
                return this;
            }
        }, {
            key: 'pageinit',
            value: function pageinit() {

                var len = LISTDATA.length,
                    html = "",
                    i = -1,
                    name = undefined,
                    url = undefined;
                while (++i < len) {
                    name = LISTDATA[i].name;
                    url = LISTDATA[i].url;
                    html += '<p class="p-tit border-handle" data-href="' + url + '">' + name + '</p>';
                }
                doc.getElementById('index-content').innerHTML = html;
                return this;
            }
        }, {
            key: 'init',
            value: function init() {
                this.pageinit().addEvent();
                var lb = new LoadingBar();
                window.onload = function () {
                    lb.setWidth(100);
                };
            }
        }]);

        return Page;
    })();

    new Page().init();

    function getJsonp(options) {

        var callbackName = options.callbackName;
        var url = options.url;

        var scriptElem = document.createElement('script');
        scriptElem.setAttribute('src', url + '?callback=' + callbackName);

        scriptElem.onload = function (e) {
            delete window[callbackName];
            this.parentNode.removeChild(this);
        };

        scriptElem.onerror = function (e) {
            console.log(e, 'load error');

            delete window[callbackName];
            this.parentNode.removeChild(this);
        };

        window[callbackName] = options.success;

        // 调用
        document.querySelector('head').appendChild(scriptElem);
    }

    function curry(fn) {
        var args = [];
        return function cb() {
            if (arguments.length === 0) {
                return fn.apply(this, args);
            }
            [].push.apply(args, [].slice.call(arguments));
            return cb;
        };
    }

    function add() {
        var sum = 0;
        [].slice.call(arguments).forEach(function (value) {
            sum += value;
        });
        return sum;
    }
    var tmp = curry(add);
    var res = tmp(22, 33)(3);
    console.log(res());

    // console.log( add1(1)(2)(3)() )

    /**
     * 快速排序
     * 先拿出第一个元素 作比对  分别求出leftArr 和 rightArr, 调用自身继续
     * 
     * 性能：
          时间复杂度：平均时间复杂度O(nlogn)，只有在特殊情况下会是O(n^2)，不过这种情况非常少
        空间复杂度：辅助空间是logn，所以空间复杂度为O(logn)
     */
    // var arr = [30, 32, 6, 24, 37];

    function quickSort(arr) {
        if (arr.length <= 1) {
            return arr;
        }
        var temp = arr[0];
        var minArr = [];
        var maxArr = [];

        for (var i = 1; i < arr.length; i++) {
            if (arr[i] > temp) {
                maxArr.push(arr[i]);
            } else {
                minArr.push(arr[i]);
            }
        }

        var minsort = quickSort(minArr);
        var maxsort = quickSort(maxArr);
        var resArr = minsort.concat([temp], maxsort);
        return resArr;
    }

    // console.log(quickSort(arr));

    var arr = [1, 20, 10, 88, 12, 100, 50];

    function bubbleSort(arr) {
        var tmp;
        for (var i = 0; i < arr.length - 1; i++) {
            for (var j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    // swap(arr, j, j+1);
                    tmp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = tmp;
                }
            }
        }
        return arr;
    }

    // function swap(arr, i, j){
    //   let temp = arr[i];
    //   arr[i] = arr[j];
    //   arr[j] = temp;
    // }
    // console.log(bubbleSort(arr));
})(undefined || window, document);