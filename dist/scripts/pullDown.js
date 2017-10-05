/**
 * 下拉刷新
 */

'use strict';

;
!(function ($, win, doc, undefined) {

    var data = {},
        el = $('#loading'),
        maxY = 40;

    $('body').on({
        touchstart: function touchstart(event) {
            var events = event.targetTouches[0] || event;
            data.startY = events.pageY;

            data.touching = true;
            data.markY = -1;
        },
        touchmove: function touchmove(event) {
            if (!data.touching) return;

            var events = event.targetTouches[0] || event,
                nowY = events.pageY,
                distanceY = nowY - data.startY;

            data.distanceY = distanceY;
            // console.log(distanceY)

            // 页面到顶部, 并且下拉           
            if ($(window).scrollTop() == 0 && distanceY > 0) {

                // 判断默认行为是否已经被禁用   新版chrome passive
                if (event.cancelable && !event.defaultPrevented) event.preventDefault();

                if (data.markY === -1) {
                    // 1. 先设置标志量，此标志量只有在touch释放到时候才变更
                    // 同时记忆现在滚动到位置
                    data.markY = distanceY;
                }

                el.css({
                    height: damping(distanceY),
                    //  height: distanceY,
                    // borderBottomWidth: borderBottomWidth,
                    transition: 'none'
                });
            }
        },
        touchend: function touchend() {
            if (!data.touching) return;

            if (data.markY > 0) {
                if (data.distanceY > maxY) {
                    el.css({
                        transition: '',
                        borderBottomWidth: 0,
                        height: maxY
                    });

                    setTimeout(function () {
                        el.css({
                            transition: '',
                            borderBottomWidth: 0,
                            height: 0
                        }).data('loading', false);

                        fnCreateList();
                    }, 1200);
                } else {
                    el.css({
                        transition: '',
                        borderBottomWidth: 0,
                        height: 0
                    });
                }
            }

            data.touching = false;
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
})($, window, document);