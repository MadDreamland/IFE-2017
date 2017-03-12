/**
 * Created by 10399 on 2017/3/9.
 */

Array.prototype.forEach = function(callback) {
    for (var i = 0; i < this.length; i++) {
        if (callback) {
            callback(this[i], i);
        }
    }
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

var createTagClound = function (data) {
    var radius = 200;       //默认半径为 300 px
    var padding = radius * 0.4;      //边距
    var maxFontSize;        //最大字体大小
    var minFontSize;        //最小字体大小
    var minOpacity = 0.3;       //最小透明度
    var tags = [];      //标签列表
    var speedX = 0;     //绕 X 轴的旋转速度
    var speedY = 0;     //绕 Y 轴的旋转速度
    var fps = 15;       //标签云刷新的帧速率

    /**
     * 使每个标签的坐标绕X轴旋转（未刷新DOM）
     * @param angle {Number} 要旋转的角度（弧度）
     */
    var rotateX = function (angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle);
        tags.forEach(function(tag) {
            var y = tag.y * cos - tag.z * sin,
                z = tag.z * cos + tag.y * sin;
            tag.y = y;
            tag.z = z;
        });
    };

    /**
     * 使每个标签的坐标绕Y轴旋转（未刷新DOM）
     * @param angle {Number} 要旋转的角度（弧度）
     */
    var rotateY = function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle);
        tags.forEach(function(tag) {
            var x = tag.x * cos - tag.z * sin,
                z = tag.z * cos + tag.x * sin;
            tag.x = x;
            tag.z = z;
        });
    };

    /**
     * 刷新某个标签当前的坐标到DOM
     * @param tag {Object} 要刷新的标签
     */
    var refreshTag = function (tag) {
        var target = tag.domObj;
        //设置X方向
        var left = tag.x + radius - target.offsetWidth / 2;
        target.style.left = (left + padding / 2) + 'px';
        //设置Y方向
        var top = tag.y + radius - target.offsetHeight / 2;
        target.style.top = (top + padding / 2) + 'px';
        //设置Z方向
        target.style.zIndex = tag.z;
        //设置Z方向透明度及大小
        var ratio = (tag.z + radius) / (2 * radius);
        target.style.opacity = minOpacity + (1 - minOpacity) * ratio;
        // target.style.transform = 'scale(' + (0.2 + 0.8 * ratio) + ')';
        var fontSizeRange = maxFontSize - minFontSize;
        target.style.fontSize = (minFontSize + fontSizeRange * ratio) + 'px';
    };

    /**
     * 创建一个标签
     * @param text {String} 标签的文本内容
     * @param link {String} 标签指向的链接
     * @param x {Number} 标签的X坐标
     * @param y {Number} 标签的Y坐标
     * @param z {Number} 标签的Z坐标
     * @returns {Object} 标签对象
     */
    var createTag = function (text, link, x, y, z) {
        var tag = {};
        tag.domObj= document.createElement('a');
        tags.push(tag);
        tag.domObj.innerText = text;
        tag.domObj.href = link;
        var color = Math.round(Math.random() * 0xffffff).toString(16);
        tag.domObj.style.color = '#' + color;       //给每个标签设置随机颜色
        tag.domObj.style.textDecoration = 'none';
        tag.domObj.style.position = 'absolute';
        // tag.domObj.style.transition = 'left 1s, top 1s';
        tag.x = x;
        tag.y = y;
        tag.z = z;
        refreshTag(tag);
        return tag;
    };

    /**
     * 旋转所有标签并更新到DOM
     */
    var rotate = function () {
        setInterval(function () {
            rotateX(speedX / fps);
            rotateY(speedY / fps);
            tags.forEach(function (item) {
                refreshTag(item);
            });
        }, 1000 / fps);
    };

    /**
     * 创建容纳所有标签的容器
     * @returns {Element} 容器DOM节点
     */
    var createContainer = function () {
        var container = document.createElement('div');
        container.style.width = (radius * 2 + padding) + 'px';
        container.style.height = (radius * 2 + padding) + 'px';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        return container;
    };

    /**
     * 设置速度
     * @param pos {Number} 相对球心的坐标
     * @param maxSpeed {Number} 最大速度
     * @param minSpeed {Number} 最小速度
     * @returns {*} {Number} 计算后的速度
     */
    var setSpeed = function (pos, maxSpeed, minSpeed) {
        var speedRange = maxSpeed - minSpeed;
        var speed = minSpeed + Math.abs(pos) / radius * speedRange;
        if (pos < 0) {
            speed *= -1;
        }
        return speed;
    };

    /**
     * 初始化标签
     * @param container {Element} 容器节点
     */
    var initTag = function (container) {
        var dataLen = data.length;
        data.forEach(function (item, index) {
            //设置平均分配的坐标
            var alpha = Math.acos((2 * (index + 1) - 1) / dataLen - 1),      // θ = arccos(((2*(i+1))-1)/len - 1)
                beta = alpha * Math.sqrt(dataLen * Math.PI),     // Φ = θ*sqrt(length * π)
                x = radius * Math.sin(alpha) * Math.cos(beta),       // x轴坐标: x=r*sinθ*cosΦ
                y = radius * Math.sin(alpha) * Math.sin(beta),       // y轴坐标: x=r*sinθ*cosΦ
                z = radius * Math.cos(alpha);        // z轴坐标: z=r*cosθ

            var tag = createTag(item.text, item.link, x, y, z);
            container.appendChild(tag.domObj);
        });
    };

    /**
     * 给标签云添加动画
     * @param container {Element} 容器节点
     * @param maxSpeed {Number} 最大滚动速度
     * @param minSpeed {Number} 最小滚动速度
     */
    var addAnimation = function (container, maxSpeed, minSpeed) {
        container.onmousemove = function (event) {
            // isOver = true;
            //计算球心位置
            var x0 = getElementViewLeft(this) + this.offsetWidth / 2;
            var y0 = getElementViewTop(this) + this.offsetHeight / 2;
            //计算鼠标坐标相对于球心的偏移量
            var x = event.clientX - x0;
            var y = event.clientY - y0;
            //设置速度
            speedX = setSpeed(y, maxSpeed, minSpeed);
            speedY = setSpeed(x, maxSpeed, minSpeed);
        };
        container.onmouseout = function () {
            speedX = speedY = minSpeed;
        };
        rotate();
    };

    return {
        container: null,        //容器节点
        minSpeed: 0.05,        //最小滚动速度（弧度/秒）
        maxSpeed: 0.8,       //最大滚动速度（弧度/秒）
        /**
         * 设置标签云半径
         * @param _radius {Number} 云标签半径
         */
        setRadius: function (_radius) {
            radius = _radius;
            if (this.container == null) {
                return;
            }
            var parentNode = this.container.parentNode;
            parentNode.removeChild(this.container);
            this.display(parentNode);
        },
        /**
         * 显示云标签到页面上
         * @param parentNode {Element} 指定云标签的父节点
         */
        display: function (parentNode) {
            this.container = createContainer();

            maxFontSize = radius / data.length * 6;
            minFontSize = maxFontSize / 5;
            speedX = speedY = this.minSpeed;

            initTag(this.container);
            addAnimation(this.container, this.maxSpeed, this.minSpeed);
            parentNode.appendChild(this.container);
        }
    };
};

//云标签的数据
var data = [
    {text: 'JavaScript', link: '#'},
    {text: 'Java', link: '#'},
    {text: 'C#', link: '#'},
    {text: 'C', link: '#'},
    {text: 'C++', link: '#'},
    {text: 'Python', link: '#'},
    {text: 'Go', link: '#'},
    {text: 'Ruby', link: '#'},
    {text: 'html', link: '#'},
    {text: 'css', link: '#'},
    {text: '前端', link: '#'},
    {text: '设计模式', link: '#'},
    {text: '程序员', link: '#'},
    {text: 'IT行业', link: '#'},
    {text: '互联网', link: '#'},
    {text: '求职', link: '#'},
    {text: '招聘信息', link: '#'},
    {text: '面试', link: '#'},
    {text: '闭包', link: '#'},
    {text: '原型', link: '#'},
    {text: '作用域链', link: '#'},
    {text: '柯里化', link: '#'},
    {text: '函数式编程', link: '#'},
    {text: '瀑布流模型', link: '#'},
    {text: 'UI设计', link: '#'},
    {text: 'UX设计', link: '#'},
    {text: '交互设计', link: '#'},
    {text: '百度', link: '#'},
    {text: '腾讯', link: '#'},
    {text: '阿里巴巴', link: '#'},
    {text: '蚂蚁金服', link: '#'},
    {text: 'Windows', link: '#'},
    {text: 'Win 7', link: '#'},
    {text: 'Win 10', link: '#'},
    {text: 'Win 8.1', link: '#'},
    {text: 'Win 8', link: '#'},
    {text: 'WinPhone', link: '#'},
    {text: 'WindowsMobile', link: '#'},
    {text: 'Android', link: '#'},
    {text: 'IOS', link: '#'},
    {text: 'MTK', link: '#'},
    {text: '塞班', link: '#'}
];

/**
 * 使某元素居中
 * @param ele {Element} 要居中的元素
 */
var setCenter = function (ele) {
    ele.style.position = 'absolute';
    ele.style.left = '50%';
    ele.style.top = '50%';
    ele.style.marginLeft = (-1 * ele.offsetWidth / 2) + 'px';
    ele.style.marginTop = (-1 * ele.offsetHeight / 2) + 'px';
};

var tagCloud = createTagClound(data);
tagCloud.display(document.body);
setCenter(tagCloud.container);