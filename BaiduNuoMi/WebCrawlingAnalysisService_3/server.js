/**
 * Created by 10399 on 2017/4/8.
 */
const http = require("http");
const exec = require('child_process').exec;
const url = require('url');
const mongoose = require('mongoose');
http.createServer(function(request, response) {
    //当前当前请求是在请求网页图标，则不执行
    if (request.url === '/favicon.ico') {
        return;
    }
    console.log('request received');
    var queryObj = url.parse(request.url, true).query;
    var cmdStr = 'phantomjs task.js ' + queryObj.word + ' ' + queryObj.device;
    exec(cmdStr, function (err, stdout, stderr) {
        if (err) {
            console.log('exec error: ' + err);
        } else {
            //连接数据库
            mongoose.connect('mongodb://localhost/local');
            var db = mongoose.connection;
            //添加数据库连接失败和打开时的回调
            db.on('error', console.error.bind(console, 'connection error: '));
            db.once('open', function () {
                console.log('mongoose connected!')
            });
            //定义一个 Schema
            var resultSchema = new mongoose.Schema({
                code: Number,
                msg: String,
                word: String,
                device: String,
                time: Number,
                dataList: [{
                    info: String,
                    link: String,
                    pic: String,
                    title: String
                }]
            });
            //编译定义好的 Schema
            var Result = mongoose.model('Result', resultSchema);
            //新建一个文档
            try {
                JSON.parse(stdout);
            } catch (err) {
                response.writeHead(200, {'Content-Type': 'application/json'});
                return response.end(JSON.stringify({code: 0, msg: '查询参数错误'}));
            }
            var result = new Result(JSON.parse(stdout));
            //将文档保存到数据库
            result.save(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
            });
            response.writeHead(200, {"Content-Type": "text/plain;charset=UTF-8"});
            console.log(stdout);
            if (stderr) {
                console.log(stderr);
            }
            response.write(stdout);
            response.end();
        }
    });
}).listen(8888);
console.log('server started');