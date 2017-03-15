/**
 * Created by 10399 on 2017/3/14.
 */
function Observer(data) {
    this.data = data;
    this.callbackList = {};
    this.walk();
}

Observer.prototype.walk = function () {
    for (key in this.data) {
        if (this.data.hasOwnProperty(key)) {
            if (typeof this.data[key] === 'object') {
                new Object(key);
            }
            this.convert(key);
        }
    }
};

Observer.prototype.$watch = function (key, callback) {
    this.callbackList[key] = this.callbackList[key] || [];
    this.callbackList[key].push(callback);
};

Observer.prototype.callback = function (key, value) {
    for (var i = 0, item; item = this.callbackList[key][i++];) {
        item(value);
    }
};

Observer.prototype.convert = function (key) {
    let value = this.data[key];
    let _this = this;
    Object.defineProperty(this.data, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            console.log('你访问了' + key);
            return value;
        },
        set: function (newValue) {
            value = newValue;
            console.log('你重新设置了' + key + '为' + newValue);
            if (_this.callbackList[key]) {
                _this.callback(key, value);
            }
            if (typeof value === 'object') {
                new Observer(value);
            }
        }
    });
};

var obj = {
    man: {
        name: 'beninola',
        job: 'teacher'
    },
    run: 'running'
};

var test = new Observer(obj);
test.$watch('run', function (value) {
    console.log('run改为了' + value);
});
test.data.man = 'faphonac';
test.data.run = {
    start: 0,
    end: 100
};
test.data.run.start;
test.data.run.start = 30;