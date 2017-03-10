/**
 * Created by 10399 on 2017/3/9.
 */
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

var createTagClound = function (data) {
    var createMain = function (width, height) {
        var Main = document.createElement('div');
        Main.style.width = width + 'px';
        Main.style.height = height + 'px';
        Main.style.position = 'relative';
    };

    return {
        textColor: '#293e5d',       //标签云文本颜色
        staticSpeed: 2,     //鼠标静止在中央位置时的滚动速度（像素/秒）
        scrollingSpeed: 5,      //每秒滚动速度（像素/秒）
        display: function () {
            //
        },
    }
};