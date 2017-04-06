/**
 * Created by 10399 on 2017/4/6.
 */
var word = '前端';
var page = require('webpage').create();
// page.includeJs('library/jquery-3.2.0.min.js', )
var time = Date.now();
page.open('https://www.baidu.com/s?wd=' + word, function (status) {
    console.log(status);
    var code = (status === 'success') ? 1 : 0;
    var content = page.evaluate(function () {
        return document.querySelector('#content_left');
    });console.log(content);
    var list = content.querySelectorAll('[class~=result]');
    var dataList = [];
    for (var i = 0, item; item = list[i++];) {
        dataList.push({
            title: item.querySelector('a').innerText,
            info: item.querySelector('.c-abstract').innerText,
            link: item.querySelector('a').href,
            pic: item.querySelector('.c-img').src
        });
    }
    console.log(dataList[0].title);
    var time = (Date.now() - time) + 'sec';
    console.log(time);
    phantom.exit();
});
