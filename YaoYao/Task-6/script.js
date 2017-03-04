/**
 * Created by 10399 on 2017/3/2.
 */

var $ = function (selector) {
    return document.querySelector(selector);
};

/**
 * 使元素相对于页面水平垂直居中
 * @param domObject 要居中的元素
 */
var setCenter = function (domObject) {
    domObject.style.left = (window.innerWidth - domObject.offsetWidth) / 2 + 'px';
    domObject.style.top = (window.innerHeight - domObject.offsetHeight) / 2 + 'px';
}

/**
 * 使某个元素可以被鼠标拖动来改变位置
 * @param objectEnable 能发生拖动的元素
 * @param objectMove 被拖动的元素
 */
var setDragMoving = function (objectEnable, objectMove) {
    var isDraging = false;
    var oldPosX, oldPosY, startPosX, startPosY;

    /**
     * 使浮出层保持在屏幕内
     * @param pos {Number} 浮出层的坐标
     * @param maxPos {Number} 浮出层的最大坐标
     * @returns {Number} 修正后的坐标
     */
    var getPosInScreen = function (pos, maxPos) {
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

    objectEnable.addEventListener('mousedown', function (event) {
        isDraging = true;
        //保存要移动的对象的当前位置
        oldPosX = parseInt(objectMove.style.left.split('px')[0]);
        oldPosY = parseInt(objectMove.style.top.split('px')[0]);
        //保存鼠标当前的位置
        startPosX = event.screenX;
        startPosY = event.screenY;
        return false;       //防止浏览器选中内容
    });

    window.addEventListener('mouseup', function () {
        isDraging = false;
    });

    window.addEventListener('mousemove', function (event) {
        if (isDraging) {
            //当前坐标 = 开始拖动时浮出层的坐标 + 鼠标移动的坐标
            var currentPosX = oldPosX + event.screenX - startPosX;
            var currentPosY = oldPosY + event.screenY - startPosY;

            //最大拖动范围
            var maxPosX = window.innerWidth - objectMove.offsetWidth;
            var maxPosY = window.innerHeight - objectMove.offsetHeight;

            //修正当前坐标，使浮出层保持在屏幕内
            currentPosX = getPosInScreen(currentPosX, maxPosX);
            currentPosY = getPosInScreen(currentPosY, maxPosY);

            objectMove.style.left = currentPosX + 'px';
            objectMove.style.top = currentPosY + 'px';
        }
    });
};

//浮出层对象
var floatUI = function () {
    var divMain = null;
    var divShade = null;
    var divTitle = null;

    var createFloatUI = function (title, message) {
        divMain = document.createElement('div');
        divMain.innerText = message;
        setMainStyle('#C8C8C9', '#000000', '#000000');
        window.onresize = function () {
            setCenter(divMain);
        };

        divTitle = document.createElement('div');
        divTitle.innerHTML = title;
        setTitleStyle('#2B3B47', '#FFFFFF');

        divMain.appendChild(divTitle);
    };

    var createShade = function () {
        divShade = document.createElement('div');
        setShadeStyle('rgba(0, 0, 0, 0.5)');
    }

    var setStyle = function (domObject, style) {
        for (var i = 0, item; item = Object.keys(style)[i++];) {
            domObject.style[item] = style[item];
        }
    };

    setShadeStyle = function (background) {
        var style = {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: background
        };
        setStyle(divShade, style);
    };

    setMainStyle = function (background, color, borderColor) {
        var style = {
            position: 'fixed',
            width: '500px',
            height: '300px',
            paddingTop: '50px',
            border: '3px solid ' + borderColor,
            background: background,
            color: color,
            textIndent: '10px',
            overflow: 'hidden',
            zIndex: 1
        };
        setStyle(divMain, style);
    };

    setTitleStyle = function (background, color) {
        var style = {
            position: 'absolute',
            width: '100%',
            top: 0,
            padding: '10px 0',
            background: background,
            color: color,
            textIndent: '10px',
            cursor: 'move'
        };
        setStyle(divTitle, style);
    };

    //只对外暴露 display 和 close 方法
    return {
        display: function (title, message) {
            if (divMain) {
                return;
            }
            createShade();
            createFloatUI(title, message);

            var _this = this;
            divShade.onclick = function () {
                _this.close();
            };

            var body = $('body');
            body.appendChild(divShade);
            body.appendChild(divMain);

            setCenter(divMain);
            setDragMoving(divTitle, divMain);
        },
        close: function () {
            divShade.parentNode.removeChild(divShade);
            divMain.parentNode.removeChild(divMain);
            divShade = null;
            divMain = null;
            divTitle = null;
        }
    };
}();

$('#display').onclick = function () {
    floatUI.display('这是一个浮出层', '这是一个浮出层');
};