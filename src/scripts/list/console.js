
/**
 * url最后添加 ?console=show 调出eruda控制台
 */
!function (win, doc, undefined) {
    
    'use strict'

    function _getErudaJs() {
        var _hostName = doc.location.hostname, src;
        if (_hostName.indexOf('pre') !== -1 || _hostName.indexOf('sit') !== -1) {
            src = '//respaypre.suning.com/epwm/scripts/loginsms/lib/eruda.min.js'
        } else {
            src = '//respay.suning.com/epwm/scripts/loginsms/lib/eruda.min.js'
        }
        return src
    }
    
    function getParameter(n) {
        var m = win.location.hash.match(
            new RegExp("(?:#|&)" + n + "=([^&]*)(&|$)")
        ),
            result = !m ? "" : decodeURIComponent(m[1]);
        return result || getParameterByName(n);
    }
    
    function getParameterByName(name, url) {
        if (!url) url = win.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url); // 只有指定为全局匹配，才能够按照从左往右依次去匹配
        if (!results) return null;
        if (!results[2]) return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function noop() {}

    function loadScript(url, callback) {
        var s, h, r = false, callback = callback || noop;
        s = document.createElement('script')
        s.type = 'text/javascript'
        s.src = url
        s.onload = s.onreadystatechange = function () {
            if (!r && ( !this.readyState || this.readyState == 'complete')) {
                r = true
                callback()
            }
        }
        h = document.getElementsByTagName('head')[0]
        h.appendChild(s)
    }

    var vConsole = (function () {
        return {
            show: function () {
                loadScript(_getErudaJs(), function () {
                    (typeof eruda === 'object') &&
                        (typeof eruda.init === 'function') &&
                        eruda.init()
                })
            }
        }
    })()
    
    var param = getParameter("console")
    if (param === "show") {
        vConsole.show()
    }
    
}(this || window, document);