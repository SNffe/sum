/**
 * 下拉刷新
 */

'use strict';

;
!(function ($, win, doc, undefined) {

    var start,
        end,
        el = $('#loading'),
        offset = 40,
        // 最小距离
    isLock = false,
        //是否锁定整个操作
    isCanDo = false; //是否移动滑块

    $('body').on({
        touchstart: function touchstart(event) {
            if ($(win).scrollTop() <= 0 && !isLock) {
                var events = event.targetTouches[0] || event;
                start = events.pageY;
                isLock = true;
                isCanDo = true;
            }
            return false;
        },

        touchmove: function touchmove(event) {

            if ($(win).scrollTop() <= 0 && isCanDo) {
                // 页面到顶部, 并且下拉         
                var events = event.targetTouches[0] || event;
                end = events.pageY;
                var distanceY = end - start;

                if (distanceY > 0) {
                    if (event.cancelable && !event.defaultPrevented) event.preventDefault(); // 判断默认行为是否已经被禁用   新版chrome passive
                    el.css({
                        height: damping(distanceY),
                        //  height: distanceY,
                        // borderBottomWidth: borderBottomWidth,
                        transition: 'none'
                    });
                }
            }
        },

        touchend: function touchend() {
            if (isCanDo) {
                isCanDo = false;
                if (end - start >= offset) {
                    el.css({
                        transition: '',
                        borderBottomWidth: 0,
                        height: offset
                    });

                    setTimeout(function () {
                        el.css({
                            transition: '',
                            borderBottomWidth: 0,
                            height: 0
                        });

                        fnCreateList(5);

                        isLock = false;
                    }, 1200);
                } else {
                    el.css({
                        transition: '',
                        borderBottomWidth: 0,
                        height: 0
                    });
                    isLock = false;
                }
            }
        }
    });

    /**
     * '阻尼' 函数
     */
    function damping(value) {
        var step = [20, 40, 60, 80, 100],
            rate = [0.6, 0.5, 0.4, 0.3, 0.2],
            scaleedValue = value,
            valueStepIndex = step.length;

        while (valueStepIndex--) {
            if (value > step[valueStepIndex]) {
                scaleedValue = (value - step[valueStepIndex]) * rate[valueStepIndex];
                for (var i = valueStepIndex; i > 0; i--) {
                    scaleedValue += (step[i] - step[i - 1]) * rate[i - 1];
                }
                scaleedValue += step[0] * 1;
                break;
            }
        }

        return scaleedValue;
    }
})($, undefined || window, document);