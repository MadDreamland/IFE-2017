/**
 * Created by 10399 on 2017/3/6.
 */

var $ = function (selector) {
    return document.querySelector(selector);
};

/**
 * 获取网页元素的相对位置（该元素左上角相对于浏览器窗口左上角的坐标）
 * @param element 要获取位置的元素
 * @returns {number} 网页元素相对浏览器左部的距离
 */
function getElementViewLeft (element) {
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    if (document.compatMode == "BackCompat") {
        var elementScrollLeft = document.body.scrollLeft;
    } else {
        var elementScrollLeft = document.documentElement.scrollLeft;
    }
    return actualLeft - elementScrollLeft;
}

/**
 * 获取网页元素的相对位置（该元素左上角相对于浏览器窗口左上角的坐标）
 * @param element 要获取位置的元素
 * @returns {number} 网页元素相对浏览器顶部的距离
 */
function getElementViewTop (element) {
    var actualTop = element.offsetTop;
    var current = element.offsetParent;
    while (current !== null) {
        actualTop += current. offsetTop;
        current = current.offsetParent;
    }
    if (document.compatMode == "BackCompat") {
        var elementScrollTop = document.body.scrollTop;
    } else {
        var elementScrollTop = document.documentElement.scrollTop;
    }
    return actualTop - elementScrollTop;
}

var bindClickAndDragEvent = function (areaObject, moveObject, func) {
    var isDraging = false;

    /**
     * 修正坐标，使坐标保持在0与最大范围之间
     * @param pos {Number} 要修正的坐标
     * @param maxPos {Number} 坐标的最大值
     * @returns {Number} 修正后的坐标
     */
    var getPosInRange= function (pos, maxPos) {
        if (pos < 0) {
            return 0;
        }
        else if (pos > maxPos) {
            return maxPos;
        }
        else {
            return pos;
        }
    };

    /**
     * 获取某坐标相对于某元素的相对坐标（且已经过范围修正）
     * @param x {Number} 坐标的X值
     * @param y {Number} 坐标的Y值
     * @returns {[Number, Number]} 相对坐标
     */
    var getRelativePos = function (x, y) {
        var top = getElementViewTop(areaObject);
        var left = getElementViewLeft(areaObject);
        var rX = x - left;
        var rY = y - top;
        rX = getPosInRange(rX, areaObject.offsetWidth);
        rY = getPosInRange(rY, areaObject.offsetHeight);
        return [rX, rY];
    };

    var mousedown = function (event) {
        isDraging = true;
        var pos = getRelativePos(event.clientX, event.clientY);
        func(pos[0], pos[1]);
        return false;       //防止拖动鼠标时选中网页内容
    };

    moveObject.addEventListener('mousedown', mousedown);

    areaObject.addEventListener('mousedown', mousedown);
    
    window.addEventListener('mouseup', function () {
        isDraging = false;
        return false;
    });

    window.addEventListener('mousemove', function (event) {
        if (isDraging) {
            var pos = getRelativePos(event.clientX, event.clientY);
            func(pos[0], pos[1]);
        }
    });
};

/**
 * 颜色选择器对象
 * @type {{display}}
 */
var colorPicker = function () {
    var details;        //颜色详细选择区域（左侧矩形区域）
    var hue;        //色相选择区域
    var contextMain;        //颜色详细选择区域（左侧矩形区域）2D上下文
    var contextHue;     //色相选择区域2D上下文
    //RGB输入框对象
    var inpRGB = {
        r: $('[name="r"]'),
        g: $('[name="g"]'),
        b: $('[name="b"]')
    };
    //HSL输入框对象
    var inpHSL = {
        h: $('[name="h"]'),
        s: $('[name="s"]'),
        l: $('[name="l"]')
    };
    //16进制颜色输入框对象
    var inpHex = $('[name="hex"]');

    /**
     * 刷新输入框颜色值
     * @param h
     * @param s
     * @param l
     */
    var refreshInp = function (h, s, l) {
        inpHSL.h.value = h;
        inpHSL.s.value = s;
        inpHSL.l.value = l;

        var rgb = color.HSLtoRGB(h / 360, s / 100, l / 100);
        inpRGB.r.value = rgb[0];
        inpRGB.g.value = rgb[1];
        inpRGB.b.value = rgb[2];
        inpHex.value = ('rgb(' + rgb.join(',') + ')').colorHex();
    };

    /**
     * 给颜色输入框绑定事件，使其结果能够显示在页面上
     */
    var bindInpSetColor = function () {
        /**
         * 修复输入框的值
         * @param obj 输入框父对象（inpHSL 或 inpRGB）
         * @param item 输入框父对象当前属性
         */
        var fixValue = function (obj, item) {
            var value = obj[item].value;
            if (value < 0) {
                obj[item].value = 0;
            }
            else {
                if ((obj === inpRGB) && (value > 255)) {
                    obj[item].value = 255;
                }
                else if ((item === 'h') && (value > 360)) {
                    obj[item].value = 360;
                }
                else if ((item === 's' || item === 'l') && (value > 100)) {
                    obj[item].value = 100;
                }
            }
        };

        /**
         * 给输入框绑定内容改变事件
         * @param obj 输入框父对象（inpHSL 或 inpRGB）
         * @param func 内容改变时调用的函数
         */
        var bindOnInput = function (obj, func) {
            for (var i = 0, item; item = Object.keys(obj)[i++];) {
                obj[item].oninput = function (item) {
                    return function () {
                        fixValue(obj, item);
                        func();
                    };
                }(item);
            }
        };

        bindOnInput(inpHSL, function () {
            setColor(inpHSL.h.value, inpHSL.s.value, inpHSL.l.value);
        });

        bindOnInput(inpRGB, function () {
            var hsl = color.RGBtoHSL(inpRGB.r.value, inpRGB.g.value, inpRGB.b.value);
            setColor(hsl[0] * 360, hsl[1] * 100, hsl[2] * 100);
        });

        //给16进制颜色输入框绑定内容改变事件
        inpHex.onchange = function () {
            var rgb = inpHex.value.colorRgb();
            if (rgb) {
                var hsl = color.RGBtoHSL(rgb[0], rgb[1], rgb[2]);
                setColor(hsl[0] * 360, hsl[1] * 100, hsl[2] * 100);
            }
            else {
                alert('格式不正确！');
            }
        };
    };

    /**
     * 设定当前要显示的颜色
     * @param h
     * @param s
     * @param l
     */
    var setColor = function (h, s, l) {
        $('.pointer').style.top = (h / 360 * 300 - 5) + 'px';
        var picker = $('.picker');
        picker.style.left = (s / 100 * 300 - 5) + 'px';
        picker.style.top = ((100 - l) / 100 * 300 - 5) + 'px';
        renderDetail(h);
        refreshInp(h, s, l);
    };

    /**\
     * 填充单行渐变
     * @param context 2D上下文
     * @param hue 色相
     * @param lightness 亮度
     * @param height 要填充的高度
     */
    var fillGradient = function (context, hue, lightness, height) {
        var gradient = context.createLinearGradient(0, 0, 300, 0);
        var saturationMin = color.HSLtoRGB(hue / 360, 0, lightness / 100);
        saturationMin = 'rgb(' + saturationMin.join(',') + ')';
        var saturationMax = color.HSLtoRGB(hue / 360, 1, lightness / 100);
        saturationMax = 'rgb(' + saturationMax.join(',') + ')';
        gradient.addColorStop(0, saturationMin);
        gradient.addColorStop(1, saturationMax);
        contextMain.fillStyle = gradient;
        contextMain.fillRect(0, (100 - lightness) * height, 300, height);
    };

    /**
     * 填充详细区域（左边矩形）
     * @param hue 色相
     */
    var renderDetail = function (hue) {
        var context = details.getContext('2d');
        contextMain.clearRect(0, 0, 300, 300);
        for (var i = 0; i <= 100; i++) {
            fillGradient(context, hue, i, details.offsetHeight / 100);
        }
        contextMain.strokeStyle = '#000000';
        contextMain.strokeRect(0, 0, 300, 300);
    };

    /**
     * 创建色相条
     * @param startX
     * @param startY
     * @param width
     * @param height
     */
    var createHueBar = function (startX, startY, width, height) {
        hue = $('.hue');
        if (hue) {
            contextHue = hue.getContext('2d');
        }
        var gradient = contextHue.createLinearGradient(startX, startY, startX, height);
        var color = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'];

        for (var i = 0; i <= 6; i++) {
            gradient.addColorStop(i / 6, color[i]);
        }

        contextHue.fillStyle = gradient;
        contextHue.strokeStyle = '#000000';
        contextHue.fillRect(startX, startY, width, height);
        contextHue.strokeRect(startX, startY, width, height);
    };

    //初始化
    var init = function () {
        details = $('.details');

        if (details) {
            contextMain = details.getContext('2d');
        }
        createHueBar(0, 0, 30, 300);
        bindClickAndDragEvent(hue, $('.pointer'), function (x, y) {
            var h = Math.round(360 * y / 300);
            setColor(h, inpHSL.s.value, inpHSL.l.value);
        });
        renderDetail(0);

        bindClickAndDragEvent(details, $('.picker'), function (x, y) {
            var s = Math.round(x / 300 * 100);
            var l = Math.round(100 - y / 300 * 100);
            setColor(inpHSL.h.value, s, l);
        });
        bindInpSetColor();
    };
    
    return {
        display: function () {
            init();
        }
    };
}();

colorPicker.display();