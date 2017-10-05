
/**
 *  use -> loadMod -> loadjs(绑定 onload 和 onerror 事件) onload事件中 有依赖时,继续调用use
 */
'use strict';

;(function (global, doc, undefined) {
    'use strict';

    var toString = ({}).toString,
        slice = [].slice;

    var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement,
        docCharset = doc.charset,
        docUrl = location.href.split('?')[0],
        baseUrl = getCurSrc() || docUrl;

    var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        interactiveScript = null,
        currentlyAddingScript = null,
        curExecModName = null;

    var modMap = [];
    var moduleMap = [];

    var ts = new Date().getTime();

    var o = {};

    var gid = 0;
    function getGid() {
        return gid++;
    }

    function getType(x) {
        if (x === null) return 'null';

        var t = typeof x;
        if (t !== 'object') return t;

        var c = toString.call(x).slice(8, -1).toLowerCase();
        if (c !== 'object') return c;

        if (x.constructor == Object) return c;

        return 'unkonw';
    }
    function isArr(arr) {
        return Array.isArray ? Array.isArray(arr) : getType(arr) === 'array';
    }
    function isObj(obj) {
        return getType(obj) === 'object';
    }
    function isFn(fn) {
        return getType(fn) === 'function';
    }
    function extendDeep() {
        var target = arguments[0] || {};
        var arrs = slice.call(arguments, 1);
        var len = arrs.length;
        var copyIsArr;
        var clone;

        for (var i = 0; i < len; i++) {
            var arr = arrs[i];
            for (var name in arr) {
                var src = target[name];
                var copy = arr[name];

                //避免无限循环
                if (target === copy) {
                    continue;
                }

                if (copy && (isObj(copy) || (copyIsArr = isArr(copy)))) {
                    if (copyIsArr) {
                        copyIsArr = false;
                        clone = src && isArr(src) ? src : [];
                    } else {
                        clone = src && isObj(src) ? src : {};
                    }
                    target[name] = extendDeep(clone, copy);
                } else if (typeof copy !== 'undefined') {
                    target[name] = copy;
                }
            }
        }

        return target;
    }

    function loadjs(src, success, error, option) {
        var d = extendDeep({
            charset: docCharset,
            cache: o.cache
        }, option);

        if (d.cache) {
            src += '?t=' + ts;
        }
        var node = doc.createElement('script');
        node.src = src;
        node.id = 'lodjs-js-' + getGid();
        node.charset = d.charset;
        if ('onload' in node) {
            node.onload = success;
            node.onerror = error;
        } else {
            node.onreadystatechange = function () {
                if (/loaded|complete/.test(node.readyState)) {
                    success();
                }
            };
        }
        currentlyAddingScript = node;
        head.appendChild(node);
        currentlyAddingScript = null;
    }

    // 获取当前执行的js 全路径
    function getCurSrc() {
        if (doc.currentScript) {
            return doc.currentScript.src;
        }
        if (currentlyAddingScript) {
            return currentlyAddingScript.src;
        }

        var scripts = head.getElementsByTagName("script");
        for (var i = scripts.length - 1; i >= 0; i--) {
            var script = scripts[i];
            if (script.readyState === "interactive") {
                interactiveScript = script;
                return interactiveScript.src;
            }
        }
        return null;
    }

    function isUrl(url) {
        return url.search(/^(http:\/\/|https:\/\/|\/\/)/) !== -1;
    }

    function fixUrl(url) {
        return url.replace(/([^:])\/+/g, '$1/'); // 去除 多余 '//' => '/'
    }

    function getUrl(path, url) {
        //绝对网址
        if (isUrl(path)) {
            return fixUrl(path);
        }

        var rootUrl;
        //修复url
        if (rootUrl = url.match(/[^\/]*\/\/[^\/]*\//)) {
            //http://aa.com/abc
            url = url.slice(0, url.lastIndexOf('/') + 1);
            rootUrl = rootUrl[0];
        } else {
            //http://aa.com
            rootUrl = url = url + '/';
        }

        // /开头
        if (path.search(/^\//) !== -1) {
            return fixUrl(rootUrl + path);
        }

        // ../开头
        if (path.search(/^\.\.\//) !== -1) {
            while (path.search(/^\.\.\//) !== -1) {
                if (url.lastIndexOf('/', url.length - 2) !== -1) {
                    path = path.slice(3);
                    url = url.slice(0, url.lastIndexOf('/', url.length - 2) + 1);
                } else {
                    throw new Error('lodjs geturl error, cannot find path in url');
                }
            }

            return fixUrl(url + path);
        }
        // ./
        path = path.search(/^\.\//) !== -1 ? path.slice(2) : path;

        return fixUrl(url + path);
    }

    function fixSuffix(url, suffix) {
        var reg = new RegExp('\\.' + suffix + '$', 'i');
        return url.search(reg) !== -1 ? url : url + '.' + suffix;
    }

    function replacePath(id) {
        var ids = id.split('/');
        // id中不包含路径 或 查找路径失败
        if (ids.length < 2 || !(ids[0] in o.path)) {
            return id;
        }
        ids[0] = o.path[ids[0]];
        return ids.join('/');
    }

    function getDepUrl(id, url) {
        var pathId = replacePath(id);
        //找到path 基于baseUrl
        if (pathId !== id) {
            url = o.baseUrl;
        }
        return fixSuffix(getUrl(pathId, url || o.baseUrl), 'js');
    }

    function getIdUrl(id) {
        //没有id的情况
        if (!id) {
            return getCurSrc();
        }
        //id不能为相对路径,amd规定此处也不能带后缀，此处放宽限制。
        if (id.search(/^\./) !== -1) {
            throw new Error('lodjs define id' + id + 'must absolute');
        }
        return fixSuffix(getUrl(id, o.baseUrl), 'js');
    }

    function require(id, url) {
        var url = getDepUrl(id, url || curExecModName);
        return moduleMap[url] && moduleMap[url].exports;
    }

    function fixPath(path) {
        //path是网址
        if (isUrl(path)) {
            return getUrl('./', path).slice(0, -1);
        }
        return path;
    }

    function config(option) {
        if (!isObj(option)) {
            return extendDeep({}, o);
        }

        //处理baseUrl
        if (option.baseUrl) {
            option.baseUrl = getUrl(option.baseUrl, docUrl);
        }

        //处理path
        if (isObj(option.path)) {
            for (var key in option.path) {
                option.path[key] = fixPath(option.path[key]);
            }
        }
        o = extendDeep(o, option);

        //fix keywords
        o.path.BASEURL = fixPath(option.baseUrl || o.baseUrl);
        o.path.DOCURL = fixPath(docUrl);
        return extendDeep({}, o);
    }

    function execMod(modName, callback, params) {
        //判断定义的是函数还是非函数
        if (!params) {
            moduleMap[modName].exports = modMap[modName].callback;
        } else {
            curExecModName = modName;
            //commonjs
            var exp = modMap[modName].callback.apply(null, params);
            curExecModName = null;
            //amd和返回值的commonjs
            if (exp) {
                moduleMap[modName].exports = exp;
            }
        }
        //执行回调函数
        callback(moduleMap[modName].exports);

        //执行complete队列
        execComplete(modName);
    }

    function execComplete(modName) {
        //模块定义完毕 执行load函数,当加载失败时，会不存在module
        var tmp;
        for (var i = 0; i < modMap[modName].oncomplete.length; i++) {
            tmp = moduleMap[modName] && moduleMap[modName].exports;
            modMap[modName].oncomplete[i](tmp);
        }
        //释放内存
        modMap[modName].oncomplete = [];
    }

    function loadMod(id, callback, option) {
        var cb = callback;
        //commonjs
        if (id === 'require') {
            cb(require);
            return -1;
        }
        if (id === 'exports') {
            var exports = moduleMap[option.baseUrl].exports = {};
            cb(exports);
            return -2;
        }
        if (id === 'module') {
            cb(moduleMap[option.baseUrl]);
            return -3;
        }

        var modName = getDepUrl(id, option.baseUrl);
        //未加载
        if (!modMap[modName]) {
            modMap[modName] = {
                status: 'loading',
                oncomplete: []
            };
            loadjs(modName, function () {
                // onload 回调
                //如果define的不是函数
                if (!isFn(modMap[modName].callback)) {
                    execMod(modName, cb);
                    return 0;
                }

                //define的是函数
                use(modMap[modName].deps, function () {
                    execMod(modName, cb, slice.call(arguments, 0));
                }, { baseUrl: modName });
                return 1;
            }, function () {
                // onerror 回调
                modMap[modName].status === 'error';
                cb();
                execComplete(modName); //加载失败执行队列
            });
            return 0;
        }

        //加载失败
        if (modMap[modName].status === 'error') {
            cb();
            return 1;
        }
        //正在加载
        if (modMap[modName].status === 'loading') {
            modMap[modName].oncomplete.push(cb);
            return 1;
        }

        //加载完成
        //尚未执行完成
        if (!moduleMap[modName].exports) {
            //如果define的不是函数
            if (!isFn(modMap[modName].callback)) {
                execMod(modName, cb);
                return 2;
            }

            //define的是函数
            use(modMap[modName].deps, function () {
                execMod(modName, cb, slice.call(arguments, 0));
            }, { baseUrl: modName });
            return 3;
        }

        //已经执行过
        callback(moduleMap[modName].exports);
        return 4;
    }

    function use(deps, callback, option) {
        if (arguments.length < 2) {
            throw new Error('lodjs.use arguments miss');
            return 0;
        }

        if (typeof deps === 'string') {
            deps = [deps];
        }

        if (!isArr(deps) || !isFn(callback)) {
            throw new Error('lodjs.use arguments type error');
            return 1;
        }
        //默认为当前脚本的路径或baseurl
        if (!isObj(option)) {
            option = {};
        }
        option.baseUrl = option.baseUrl || o.baseUrl;

        if (deps.length === 0) {
            callback();
            return 2;
        }
        var depsCount = deps.length;
        var params = [];
        for (var i = 0; i < deps.length; i++) {
            (function (j) {
                loadMod(deps[j], function (param) {
                    depsCount--;
                    params[j] = param;
                    if (depsCount === 0) {
                        callback.apply(null, params);
                    }
                }, option);
            })(i);
        }

        return 3;
    }

    function define(name, deps, callback) {
        //省略模块名
        if (typeof name !== 'string') {
            callback = deps;
            deps = name;
            name = null;
        }

        //无依赖
        if (!isArr(deps)) {
            callback = deps;
            deps = [];
        }

        //支持commonjs
        // if (deps.length === 0 && isFn(callback) && callback.length) { // 无依赖 回调有参数
        //     callback
        //         .toString()
        //         .replace(commentRegExp, '')
        //         .replace(cjsRequireRegExp, function (match, dep) {
        //             deps.push(dep);
        //         });
        //     var arr = ['require'];
        //     if (callback.length > 1) {
        //         arr.push('exports');
        //     }
        //     if (callback.length > 2) {
        //         arr.push('module');
        //     }
        //     deps = arr.concat(deps);
        // }

        var modName = getIdUrl(name).split('?')[0]; //fix 后缀
        modMap[modName] = modMap[modName] || {};
        modMap[modName].deps = deps;
        modMap[modName].callback = callback;
        modMap[modName].status = 'loaded';
        modMap[modName].oncomplete = modMap[modName].oncomplete || [];
        moduleMap[modName] = {};

        return 0;
    }

    function debug() {
        console.log(modMap, moduleMap);
    }
    var lodjs = {
        use: use,
        loadjs: loadjs,
        config: config,
        define: define,
        require: require,
        debug: debug
    };

    lodjs.config({
        baseUrl: baseUrl,
        path: {},
        cache: false
    });

    global.define = define;
    global.lod = lodjs;
})(undefined || window, document);