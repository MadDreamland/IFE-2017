/**
 * Created by 10399 on 2017/4/6.
 */

phantom.outputEncoding = 'gb2312';      //为了能正确地显示汉字，采用 GB2312 编码

var page = require('webpage').create();
var system = require('system');
var word = encodeURI(system.args[1]);
var t = Date.now();
var result = {
    code: 1, //返回状态码，1为成功，0为失败
    msg: '抓取成功', //返回的信息
    word: system.args[1], //抓取的关键字
    time: '2000ms', //任务的时间
    dataList:[   //抓取结果列表
        // {
        //     title: 'xx',  //结果条目的标题
        //     info: '', //摘要
        //     link: '', //链接
        //     pic: '' //缩略图地址
        // }
    ]
};

page.open('https://www.baidu.com/s?wd=' + word, function (status) {
    if (status === 'success') {
        result.code = 1;
        result.msg = '抓取成功';
        result.dataList = page.evaluate(function () {
            var dataList = [];
            var $search = document.querySelector('#content_left');
            var $list = $search.querySelectorAll('.result, .result-op');    //搜索结果列表
            for (var i = 0, item; item = $list[i++];) {
                var $a = item.querySelector('a');
                var $pic = item.querySelector('.c-img');
                var $info = item.querySelector('.c-abstract') ||    //普通摘要
                    (item.querySelector('.c-span-last p')) ||   //百度百科摘要
                    item.querySelector('.op_dict_text2') ||   //百度词典摘要
                    item.querySelector('.op-tieba-general-subtitle');       //百度贴吧某个吧的摘要
                dataList.push({
                    title: $a && $a.innerText,
                    info: $info && $info.innerText,
                    link: $a && $a.href,
                    pic: $pic && $pic.src
                });
            }
            return dataList;
        });
        result.time = (Date.now() - t) + 'ms';
    }
    else {
        result.code = 0;
        result.msg = '抓取失败';
        result.time = (Date.now() - t) + 'ms';
    }
    console.log(JSON.stringify(result, undefined, 4));
    return result;
    phantom.exit();
});
