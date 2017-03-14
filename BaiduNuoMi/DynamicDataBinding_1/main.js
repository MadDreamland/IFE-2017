/**
 * Created by 10399 on 2017/3/14.
 */
function Observer(data) {
    this.data = data;
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

Observer.prototype.convert = function (key) {
    let value = this.data[key];
    Object.defineProperty(this.data, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            console.log('你访问了' + key);
            return value;
        },
        set: function (newValue) {
            console.log('你重新设置了' + key + '为' + newValue);
            value = newValue;
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
test.data.man = 'faphonac';
alert(test.data.run);