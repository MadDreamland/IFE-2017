//修改至张鑫旭的博客
// by zhangxinxu welcome to visit my personal website http://www.zhangxinxu.com/
// 2010-03-12 v1.0.0

var color = function () {
    //十六进制颜色值的正则表达式
    var reg = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

    /**
     * RGB颜色转换为16进制
     * @this {String} RGB字符串格式：RGB(23, 245, 56)
     * @returns {String} 颜色的16进制值（带#号），如 17f538，格式不对返回false
     */
    String.prototype.colorHex = function(){
        var that = this;
        if(/^(rgb|RGB)/.test(that)){
            var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
            var strHex = "";
            for(var i=0; i<aColor.length; i++){
                var hex = Number(aColor[i]).toString(16);
                if(hex.length < 2){
                    hex = '0' + hex;
                }
                strHex += hex;
            }
            // if(strHex.length !== 7){
            //     strHex = that;
            // }
            return strHex;
        } else if (reg.test(that)) {
            var aNum = that.replace(/#/,"").split("");
            if (aNum.length === 6) {
                return that;
            } else if (aNum.length === 3) {
                var numHex = "";
                for (var i = 0; i < aNum.length; i++) {
                    numHex += (aNum[i] + aNum[i]);
                }
                return numHex;
            }
        } else {
            return false;
        }
    };

    /**
     * 16进制颜色转为RGB格式
     * @this {String} 16进制字符串格式（如 34538b）
     * @returns {string} RGB格式颜色（如 RGB(52,83,139))，格式不对返回false
     */
    String.prototype.colorRgb = function() {
        var sColor = this.toLowerCase();
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 3){
                var sColorNew = "";
                for (var i=0; i<3; i++) {
                    sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            var sColorChange = [];
            for (var i=0; i<6; i+=2) {
                sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));
            }
            // return "RGB(" + sColorChange.join(",") + ")";
            return sColorChange;
        } else {
            return false;
        }
    };

    /**
     * HSL颜色值转换为RGB.
     * 换算公式改编自 http://en.wikipedia.org/wiki/HSL_color_space.
     * h, s, 和 l 设定在 [0, 1] 之间
     * 返回的 r, g, 和 b 在 [0, 255]之间
     *
     * @param   Number  h       色相
     * @param   Number  s       饱和度
     * @param   Number  l       亮度
     * @return  Array           RGB色值数值
     */
    function HSLToRGB(h, s, l) {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * RGB 颜色值转换为 HSL.
     * 转换公式参考自 http://en.wikipedia.org/wiki/HSL_color_space.
     * r, g, 和 b 需要在 [0, 255] 范围内
     * 返回的 h, s, 和 l 在 [0, 1] 之间
     *
     * @param   Number  r       红色色值
     * @param   Number  g       绿色色值
     * @param   Number  b       蓝色色值
     * @return  Array           HSL各值数组
     */
    function RGBToHSL(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    return {
        HSLtoRGB: HSLToRGB,
        RGBtoHSL: RGBToHSL
    };
}();