"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!(function (global, doc) {

    function Directive(el, mvvm, attr, elementValue) {
        this.el = el;
        this.mvvm = mvvm;
        this.attr = attr;
        this.el[this.attr] = this.elementValue = elementValue;
    }

    function set(target, key, value, receiver) {
        var result = Reflect.set(target, key, value, receiver);

        var dataSet = receiver || target;
        dataSet.__bindings[key].forEach(function (item) {
            item.el[item.attr] = item.elementValue = value;
        });

        return result;
    }

    var mvvm = (function () {
        function mvvm(configs) {
            _classCallCheck(this, mvvm);

            this.root = this.el = document.querySelector(configs.el);
            this._data = configs.data;
            this._data.__bindings = {};

            this.data = new Proxy(this._data, { set: set });
            this.methods = configs.methods;

            this._compile(this.root);
        }

        _createClass(mvvm, [{
            key: "_compile",
            value: function _compile(root) {
                var _this = this;

                var nodes = root.children;
                var bindDataTester = new RegExp("{{(.*?)}}", "ig");

                var node = undefined,
                    matches = undefined,
                    newMatches = undefined,
                    splitTextNodes = undefined,
                    txt = undefined;
                for (var i = 0; i < nodes.length; i++) {
                    node = nodes[i];

                    if (node.children.length) {
                        _this._compile(node);
                    }

                    matches = node.innerHTML.match(bindDataTester);
                    if (matches) {
                        splitTextNodes = node.innerHTML.split(/{{.*?}}/);
                        node.innerHTML = null;
                        if (splitTextNodes[0]) {
                            txt = document.createTextNode(splitTextNodes[0]);
                            node.appendChild(txt);
                        }

                        newMatches = matches.map(function (item) {
                            return item.replace(/{{(.*?)}}/, "$1");
                        });
                        for (var j = 0; j < newMatches.length; j++) {
                            var el = document.createTextNode("");
                            node.appendChild(el);
                            if (splitTextNodes[j + 1]) {
                                node.appendChild(document.createTextNode(splitTextNodes[j + 1]));
                            }

                            var tmp2 = new Directive(el, this, "nodeValue", this.data[newMatches[j]]);

                            if (this._data.__bindings[newMatches[j]]) {
                                this._data.__bindings[newMatches[j]].push(tmp2);
                            } else {
                                this._data.__bindings[newMatches[j]] = [tmp2];
                            }
                        }
                    }

                    // input / textarea
                    if (node.hasAttribute('p-model') && node.tagName.toUpperCase() === 'INPUT' || node.tagName.toUpperCase() === 'TEXTAREA') {
                        node.addEventListener('input', (function () {
                            var attributeValue = node.getAttribute('p-model');
                            var tmp = new Directive(node, _this, "value", _this.data[attributeValue]);

                            if (_this._data.__bindings[attributeValue]) {
                                _this._data.__bindings[attributeValue].push(tmp);
                            } else {
                                _this._data.__bindings[attributeValue] = [tmp];
                            }

                            return function (event) {
                                _this.data[attributeValue] = event.target.value;
                            };
                        })());
                    }

                    if (node.hasAttribute('p-click')) {
                        node.addEventListener('click', (function () {

                            var attributeValue = node.getAttribute('p-click');
                            var args = /\(.*\)/.exec(attributeValue);
                            if (args) {
                                args = args[0];
                                attributeValue = attributeValue.replace(args, '');
                                args = args.replace(/[\(\)\'\"]/g, '').split(',');
                            } else {
                                args = [];
                            }

                            return function (event) {
                                _this.methods[attributeValue].apply(_this, [event].concat(_toConsumableArray(args)));
                            };
                        })());
                    }
                }
            }
        }]);

        return mvvm;
    })();

    global.mvvm = mvvm;
})(undefined || window, document);