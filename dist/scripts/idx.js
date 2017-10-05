'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
            }
        }]);

        return Page;
    })();

    new Page().init();
})(undefined || window, document);