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
            }
        }, {
            key: 'init',
            value: function init() {
                this.addEvent();
                var lb = new LoadingBar();
                window.onload = function () {
                    lb.setWidth(100);
                };
            }
        }]);

        return Page;
    })();

    new Page().init();
})(undefined || window, document);