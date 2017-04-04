/**
 * Created by 10399 on 2017/3/27.
 */


var $ = function (selector) {
    return document.querySelector(selector);
};

//音乐资源列表，做成对象以增强其扩展性
var musicList = [
    {
        src: 'music/Ina - I wanted you.mp3'
    },
    {
        src: 'music/Colbie Caillat - Try.mp3'
    },
    {
        src: 'music/Darin - What If.mp3'
    },
    {
        src: 'music/Matt Pokora - Juste une photo de toi.mp3'
    },
    {
        src: 'music/Ronald Jenkees - Guitar Sound.mp3'
    }
];

function createPlayer(musicList) {
    var musics = [];
    var audio = $('audio');
    var rangeVolume = $('.volume');
    var volume = 60;
    var currentMusicId = 0;
    var currentStrategyOfPlay = 'sequence';
    var musics = [];
    var icon = {
        favor: 'glyphicon glyphicon-heart',
        notFavor: 'glyphicon glyphicon-heart-empty',
        volumeHeight: 'muted glyphicon glyphicon-volume-up',
        volumeLow: 'muted glyphicon glyphicon-volume-down',
        delete: 'glyphicon glyphicon-trash',
        sequence: 'glyphicon glyphicon-sort-by-attributes',
        loop: 'glyphicon glyphicon-retweet',
        random: 'glyphicon glyphicon-random'
    };
    //播放策略（顺序播放、循环播放、随机播放
    var strategyOfPlay = {
        sequence: function () {
            if (currentMusicId >= (musics.length - 1)) {
                return;
            }
            else {
                play(++currentMusicId);
            }
        },
        loop: function () {
            currentMusicId++;
            if (currentMusicId > (musics.length - 1)) {
                currentMusicId = 0;
            }
            play(currentMusicId);
        },
        random: function () {
            var oldMusicId = currentMusicId;
            do {
                currentMusicId = Math.floor(Math.random() * musics.length);
            } while (currentMusicId === oldMusicId);
            play(currentMusicId);
        }
    };

    /**
     * Music 对象构造函数
     * @param id {Number} 歌曲 ID
     * @param src {String} 歌曲资源地址
     * @constructor
     */
    function Music(src) {
        this.src = src;
        this.title = '未知歌曲';
        this.artist = '未知歌手';
        this.cover = 'image/cover.png';

        var _this = this;
        ID3.loadTags(src, function () {
            var tags = ID3.getAllTags(src);
            var id = musics.indexOf(_this);
            if (id === -1) {
                return;
            }
            _this.title = tags.title;
            _this.artist = tags.artist;
            if (currentMusicId === id) {
                refreshPlayInfo();
            }
            refreshPlayList(id);
        });
        createmusicsRow(this);
    }
    
    Music.prototype.delete = function () {
        var id = musics.indexOf(this);
        var tr = musics[id].playListRow.tr;
        tr.parentNode.removeChild(tr);
        musics.splice(id, 1);
        //如果要删除的音乐正在播放，则播放删除后同位置的歌曲
        if (currentMusicId === id) {
            if (currentMusicId > musics.length - 1) {
                currentMusicId = musics.length - 1;
            }
            play(currentMusicId);
        }
    };
    
    Music.prototype.favor = function () {
        this.isFavor = !this.isFavor;
        var id = musics.indexOf(this);
        var newClass = this.isFavor ? icon.favor : icon.notFavor;
        musics[id].playListRow.btnFavor.className = newClass;
        if (currentMusicId === id) {
            $('.favor').className = 'favor ' + newClass;
        }
    };

    Music.prototype.getCover = function () {
        var _this = this;
        ID3.loadTags(_this.src, function () {
            var id = musics.indexOf(_this);
            if (id === -1) {
                return;
            }
            var image = ID3.getAllTags(_this.src).picture;
            if (image) {
                var base64String = "";
                for (var i = 0; i < image.data.length; i++) {
                    base64String += String.fromCharCode(image.data[i]);
                }
                var base64 = "data:" + image.format + ";base64," +
                    window.btoa(base64String);
                _this.cover = base64;
                if (currentMusicId === id) {
                    refreshPlayInfo();
                }
            }
        }, {
            tags: ["picture"]
        });
    };

    function refreshPlayInfo() {
        var music = musics[currentMusicId];
        $('.title').innerText = music.title;
        $('.artist').innerText = music.artist;
        $('.cover').src = music.cover;
        $('.download-true').href = music.src;
    }

    function refreshPlayList(id) {
        musics[id].playListRow.tdTitle.innerText = musics[id].title;
        musics[id].playListRow.tdArtist.innerText = musics[id].artist;
    }

    function play(musicId) {
        if (musics.length === 0) {
            currentMusicId = -1;
            audio.src = '';
            disable(['.list', '.download', '.play-strategy', '.favor', '.delete', '.pause', '.next']);
            $('.title').innerText = '无歌曲';
            $('.artist').innerText = '无歌曲';
            $('.cover').src = 'image/cover.png';
            return;
        }
        enable(['.list', '.download', '.play-strategy', '.favor', '.delete', '.pause', '.next']);

        currentMusicId = musicId;
        var music = musics[currentMusicId];
        if (!(music && music.src)) {
            return next();
        }
        audio.src = music.src;
        music.getCover();
        refreshPlayInfo(musicId);
        setPlayPosition();
        var newClass = music.isFavor ? icon.favor : icon.notFavor;
        $('.favor').className = 'favor ' + newClass;
        if ($('.pause').className === 'pause glyphicon glyphicon-play') {
            $('.pause').className = 'pause glyphicon glyphicon-pause';
        }
    }

    /**
     * 在播放列表表格中创建一行
     * @param music {Music} 歌曲对象
     */
    function createmusicsRow(music) {
        /**
         * 阻止事件冒泡
         * @param event 事件对象
         */
        function stopBubble(event) {
            // 如果提供了事件对象，则这是一个非 IE 浏览器
            if ( event && event.stopPropagation )
            // 因此它支持 W3C 的 stopPropagation() 方法
                event.stopPropagation();
            else
            // 否则，我们需要使用 IE 的方式来取消事件冒泡
                window.event.cancelBubble = true;
        }
        var tr = document.createElement('tr');
        var tdPlayPosFlag = document.createElement('td');
        var tdTitle = document.createElement('td');
        var tdArtist = document.createElement('td');
        var tdOperation = document.createElement('td');
        var btnFavor = document.createElement('button');
        var btnDelete = document.createElement('button');
        tr.onclick = function () {
            var id = musics.indexOf(music);
            play(id);
        };
        tdTitle.innerText = music.title;
        tdArtist.innerText = music.artist;
        btnFavor.className = music.isFavor ? icon.favor : icon.notFavor;
        btnDelete.className = icon.delete;
        btnFavor.onclick = function (event) {
            music.favor();
            stopBubble(event);
        };
        btnDelete.onclick = function (event) {
            music.delete();
            stopBubble(event);
        };
        tdOperation.appendChild(btnFavor);
        tdOperation.appendChild(btnDelete);
        tr.appendChild(tdPlayPosFlag);
        tr.appendChild(tdTitle);
        tr.appendChild(tdArtist);
        tr.appendChild(tdOperation);
        $('.player-list').querySelector('table').appendChild(tr);
        music.playListRow = {
            tr: tr,
            tdTitle: tdTitle,
            tdArtist: tdArtist,
            tdPlayPosFlag: tdPlayPosFlag,
            btnFavor: btnFavor,
            btnDelete: btnDelete
        };
    };

    /**
     * 设置当前播放位置标记
     */
    function setPlayPosition() {
        //清空旧的播放标记
        musics.forEach(function (item) {
            if (item.playListRow.tr.className != '') {
                item.playListRow.tr.className = '';
            }
        });
        //放置新的播放标记
        musics[currentMusicId].playListRow.tr.className = 'current';
    }

    function disable(selectorArray) {
        selectorArray.forEach(function (item) {
            $(item).disabled = true;
        });
    }
    function enable(selectorArray) {
        selectorArray.forEach(function (item) {
            $(item).disabled = false;
        });
    }

    function setVolumeIcon() {
        var volume = rangeVolume.value;
        $('.muted').className = volume >= 50 ? icon.volumeHeight : icon.volumeLow;
    }

    function setVolume(value) {
        if (value == volume) {
            return;
        }
        else {
            volume = value;
            rangeVolume.style.background = 'linear-gradient(to right, #6e6e6e, #6e6e6e ' + value +
                '%, #dadada ' + value +
                '%, #dadada 100%)';
            audio.volume = value / 100;
            if (audio.muted === true) {
                audio.muted = false;
            }
            setVolumeIcon();
        }
    }

    function next() {
        strategyOfPlay[currentStrategyOfPlay]();
    }

    function refeshProgress() {
        var percent = audio.currentTime / audio.duration * 100;
        $('.progress').style.background = 'linear-gradient(to right, #62bb7b, #62bb7b ' + percent +
            '%, #dadada ' + percent +
            '%, #dadada 100%)';
    }

    function bindEvent() {
        audio.onended = function () {
            next();
        }

        rangeVolume.oninput = function () {
            setVolume(this.value);
        };

        $('.muted').onclick = function () {
            if (audio.muted) {
                audio.muted = false;
                setVolumeIcon();
            } else {
                this.className = 'muted glyphicon glyphicon-volume-off';
                audio.muted = true;
            }
        };

        $('.list').onclick = function () {
            var playerList = $('.player-list');
            if (playerList.style.maxHeight === '0px') {
                playerList.style.maxHeight = '500px';
            } else {
                playerList.style.maxHeight = '0px';
            }
        };

        $('.play-strategy').onclick = function () {

        };

        $('.download').onclick = function () {
            $('.download-true').click();
        };

        $('.play-strategy').onclick = function () {
            switch (currentStrategyOfPlay) {
                case 'sequence':
                    currentStrategyOfPlay= 'loop';
                    this.className = 'play-strategy ' + icon.loop;
                    break;
                case 'loop':
                    currentStrategyOfPlay = 'random';
                    this.className = 'play-strategy ' + icon.random;
                    break;
                case 'random':
                    currentStrategyOfPlay = 'sequence';
                    this.className = 'play-strategy ' + icon.sequence;
                    break;
            }
        };

        $('.add').onclick = function () {
            $('.file').click();
        };

        $('.file').onchange = function () {
            if (this.value) {
                musics.push(new Music(this.src));
            }
        };

        $('.favor').onclick = function () {
            musics[currentMusicId].favor();
        };

        $('.delete').onclick = function () {
            musics[currentMusicId].delete();
        }

        $('.pause').onclick = function () {
            if (this.className === 'pause glyphicon glyphicon-pause') {
                audio.pause();
                this.className = 'pause glyphicon glyphicon-play';
            } else {
                audio.play();
                this.className = 'pause glyphicon glyphicon-pause';
            }
        };

        $('.next').onclick = function () {
            next();
            if ($('.pause').className === 'pause glyphicon glyphicon-play') {
                $('.pause').className = 'pause glyphicon glyphicon-pause';
            }
        };

        audio.oncanplay = function () {
            $('.progress').max = this.duration;
            setInterval(function () {
                console.log(audio.seekable.end(0));
            }, 1000);

        }

        audio.ontimeupdate = function () {
            var remainMin = Math.floor((this.duration - this.currentTime) / 60);
            var remainSec = Math.floor((this.duration - this.currentTime) % 60);
            if (remainSec.toString().length < 2) {
                remainSec = '0' + remainSec;
            }
            refeshProgress();
            if (isNaN(remainSec)) {
                remainSec = remainMin = '--';
            }
            $('.remain-time').innerText = '-' + remainMin + ':' + remainSec;
        };

        $('.progress').oninput = function () {
            audio.currentTime = this.value;
            refeshProgress();
        };
    }

    (function init() {
        musicList.forEach(function (item) {
            musics.push(new Music(item.src));
        });
        bindEvent();
        play(0);
    })();
}

createPlayer(musicList);

