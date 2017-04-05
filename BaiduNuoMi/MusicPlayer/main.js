/**
 * Created by 10399 on 2017/3/27.
 */

var $ = function (selector) {
    return document.querySelector(selector);
};

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
    var element = {
        audio: $('.music-player audio'),
        playList: $('.music-player .player-list'),
        title: $('.music-player .title'),
        artist: $('.music-player .artist'),
        cover: $('.music-player .cover'),
        remainTime: $('.music-player .remain-time'),
        muted: $('.music-player .muted'),
        rangeVolume: $('.music-player .volume'),
        displayList: $('.music-player .display-list'),
        download: $('.music-player .download'),
        realDownload: $('.music-player .real-download'),
        playStrategy: $('.music-player .play-strategy'),
        add: $('.music-player .add'),
        realAdd: $('.music-player .real-add'),
        progress: $('.music-player .progress'),
        favor: $('.music-player .favor'),
        delete: $('.music-player .delete'),
        pause: $('.music-player .pause'),
        next: $('.music-player .next')
    };
    var musics = [];
    var icon = {
        play: 'glyphicon glyphicon-play',
        pause: 'glyphicon glyphicon-pause',
        favor: 'glyphicon glyphicon-heart',
        notFavor: 'glyphicon glyphicon-heart-empty',
        volumeHeight: 'muted glyphicon glyphicon-volume-up',
        volumeLow: 'muted glyphicon glyphicon-volume-down',
        muted: 'glyphicon glyphicon-volume-off',
        delete: 'glyphicon glyphicon-trash',
        sequence: 'glyphicon glyphicon-sort-by-attributes',
        loop: 'glyphicon glyphicon-retweet',
        random: 'glyphicon glyphicon-random'
    };


    var player = function () {
        var volume = 60;
        var currentMusicId = 0;
        //播放策略（顺序播放、循环播放、随机播放）
        var FSM = {
            sequence: {
                next: function (_this, callback) {
                    if (currentMusicId < (musics.length - 1)) {
                        callback.call(_this, ++currentMusicId);
                    }
                },
                switch: function () {
                    currentPlayStrategy = FSM.loop;
                    element.playStrategy.className = 'play-strategy ' + icon.loop;
                    element.playStrategy.title = '列表循环';
                }
            },
            loop: {
                next: function (_this, callback) {
                    currentMusicId++;
                    if (currentMusicId > (musics.length - 1)) {
                        currentMusicId = 0;
                    }
                    callback.call(_this, currentMusicId);
                },
                switch: function () {
                    currentPlayStrategy = FSM.random;
                    element.playStrategy.className = 'play-strategy ' + icon.random;
                    element.playStrategy.title = '随机播放';
                }
            },
            random: {
                next: function (_this, callback) {
                    var oldMusicId = currentMusicId;
                    //如果随机到的下一首歌曲仍然是此歌曲，再次随机，直到不是本歌曲为止
                    do {
                        currentMusicId = Math.floor(Math.random() * musics.length);
                    } while (currentMusicId === oldMusicId);
                    callback.call(_this, currentMusicId);
                },
                switch: function () {
                    currentPlayStrategy = FSM.sequence;
                    element.playStrategy.className = 'play-strategy ' + icon.sequence;
                    element.playStrategy.title = '顺序播放';
                }
            }
        };
        var currentPlayStrategy = FSM.sequence;

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

        function setVolumeIcon() {
            var volume = element.rangeVolume.value;
            element.muted.className = volume >= 50 ? icon.volumeHeight : icon.volumeLow;
        }

        return {
            getCurrentMusicId: function () {
                return currentMusicId;
            },
            /**
             * 播放某首歌曲
             * @param musicId {Number} 要播放的歌曲 ID，若无则播放当前歌曲
             * @returns 无
             */
            play: function (musicId) {
                if (musics.length === 0) {
                    return this.empty();
                }

                if (isNaN(musicId)) {
                    element.audio.play();
                    element.pause.className = 'pause ' + icon.pause;
                    return true;
                }
                currentMusicId = musicId;
                var music = musics[currentMusicId];

                //如果当前歌曲无资源地址，继续播放下一歌曲
                if (!(music && music.src)) {
                    return this.next();
                }

                element.audio.src = music.src;
                music.getCover();
                this.updatePlayInfo(musicId);
                setPlayPosition();
                var newClass = music.isFavor ? icon.favor : icon.notFavor;
                element.favor.className = 'favor ' + newClass;
                if (element.pause.className === 'pause ' + icon.play) {
                    element.pause.className = 'pause ' + icon.pause;
                }
            },
            /**
             * 暂停当前的播放
             */
            pause: function () {
                element.audio.pause();
                if (element.pause.className === 'pause ' + icon.pause) {
                    element.pause.className = 'pause ' + icon.play;
                }
            },
            next: function () {
                currentPlayStrategy.next(this, this.play);
                element.progress.value = 0;
                element.progress.style.background = 'linear-gradient(to right,' +
                    ' #62bb7b, #62bb7b ' + 0 +
                    '%, #dadada ' + 0 +
                    '%, #dadada 100%)';
            },
            /**
             * 设置播放器音量
             * @param value {Number} 要设置的音量值
             */
            setVolume: function (value) {
                if (value != volume) {
                    volume = value;
                    element.rangeVolume.style.background = 'linear-gradient(to right, #6e6e6e, #6e6e6e ' + value +
                        '%, #dadada ' + value +
                        '%, #dadada 100%)';
                    element.audio.volume = value / 100;
                    if (element.audio.muted === true) {
                        element.audio.muted = false;
                    }
                    setVolumeIcon();
                }
            },
            /**
             * 改变播放器静音状态（在“静音”与“非静音”之间切换）
             */
            changeMuted: function () {
                if (element.audio.muted === false) {
                    element.audio.muted = true;
                    element.muted.className = 'muted ' + icon.muted;
                }
                else {
                    element.audio.muted = false;
                    setVolumeIcon();
                }
            },
            changePlayStrategy: function () {
                currentPlayStrategy.switch();
            },
            updateProgress: function () {
                var remainTime = element.audio.duration - element.audio.currentTime;
                var percent = element.audio.currentTime / element.audio.duration * 100;
                var remainMin = Math.floor(remainTime / 60);
                var remainSec = Math.floor(remainTime % 60);

                if (remainSec.toString().length < 2) {
                    remainSec = '0' + remainSec;
                }
                if (isNaN(remainSec)) {
                    remainSec = remainMin = '--';
                }
                element.remainTime.innerText = '-' + remainMin + ':' + remainSec;
                element.progress.style.background = 'linear-gradient(to right,' +
                    ' #62bb7b, #62bb7b ' + percent +
                    '%, #dadada ' + percent +
                    '%, #dadada 100%)';
            },
            /**
             * 刷新播放器播放的当前歌曲的信息（在 ID3 获取歌曲信息并回调时用到）
             */
            updatePlayInfo: function () {
                var music = musics[currentMusicId];
                element.title.innerText = music.title;
                element.artist.innerText = music.artist;
                element.cover.src = music.cover;
                element.realDownload.href = music.src;
            },
            /**
             * 刷新播放列表某行的歌曲信息
             * @param id {Number} 要刷新的播放列表行数
             */
            updatePlayList: function (id) {
                musics[id].playListRow.tdTitle.innerText = musics[id].title;
                musics[id].playListRow.tdArtist.innerText = musics[id].artist;
            },
            /**
             * 设置播放器为空，禁用大部分按钮（当播放列表为空时调用）
             */
            empty: function () {
                currentMusicId = -1;
                element.audio.src = '';
                element.title.innerText = '无歌曲';
                element.artist.innerText = '无歌曲';
                element.cover.src = 'image/cover.png';
                var disableList = [element.displayList,
                    element.download,
                    element.playStrategy,
                    element.progress,
                    element.favor,
                    element.delete,
                    element.pause,
                    element.next
                ];
                disableList.forEach(function (item) {
                    if (item.disabled === false) {
                        item.disabled = true;
                    }
                });
            },
            /**
             * 启用播放器
             */
            enable: function () {
                var elements = Object.keys(element);
                elements.forEach(function (item) {
                    if (element[item].disabled === true) {
                        element[item].disabled = false;
                    }
                });
            }
        };
    }();

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
        this.playListRow = null;

        var _this = this;
        ID3.loadTags(src, function () {
            var tags = ID3.getAllTags(src);
            var id = musics.indexOf(_this);
            if (id === -1) {
                return;
            }
            _this.title = tags.title;
            _this.artist = tags.artist;
            if (player.getCurrentMusicId() === id) {
                player.updatePlayInfo();
            }
            player.updatePlayList(id);
        });
        createmusicsRow(this);
    }

    //从播放列表中删除此歌曲
    Music.prototype.delete = function () {
        var id = musics.indexOf(this);
        var tr = musics[id].playListRow.tr;
        tr.parentNode.removeChild(tr);
        musics.splice(id, 1);
        //如果要删除的音乐正在播放，则播放删除后同位置的歌曲
        var currentMusicId = player.getCurrentMusicId();
        if (currentMusicId === id) {
            if (currentMusicId > musics.length - 1) {
                currentMusicId = musics.length - 1;
            }
            player.play(currentMusicId);
        }
    };

    //把歌曲设为“喜爱”
    Music.prototype.favor = function () {
        this.isFavor = !this.isFavor;
        var id = musics.indexOf(this);
        var newClass = this.isFavor ? icon.favor : icon.notFavor;
        musics[id].playListRow.btnFavor.className = newClass;
        if (player.getCurrentMusicId() === id) {
            $('.favor').className = 'favor ' + newClass;
        }
    };

    //获取歌曲封面
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
                if (player.getCurrentMusicId() === id) {
                    player.updatePlayInfo();
                }
            }
        }, {
            tags: ["picture"]
        });
    };

    /**
     * 在播放列表表格中创建一行
     * @param music {Music} 歌曲对象
     */
    function createmusicsRow(music) {
        //创建播放列表表格行
        var tr = document.createElement('tr');
        tr.onclick = function () {
            var id = musics.indexOf(music);
            player.play(id);
        };

        //播放位置标识
        var tdPlayPosFlag = document.createElement('td');

        //歌曲名称
        var tdTitle = document.createElement('td');
        tdTitle.innerText = music.title;

        //歌手
        var tdArtist = document.createElement('td');
        tdArtist.innerText = music.artist;

        var tdOperation = document.createElement('td');

        //设为“喜爱”按钮
        var btnFavor = document.createElement('button');
        btnFavor.className = music.isFavor ? icon.favor : icon.notFavor;
        btnFavor.onclick = function (event) {
            music.favor();
            stopBubble(event);
        };

        //删除按钮
        var btnDelete = document.createElement('button');
        btnDelete.className = icon.delete;
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
        element.playList.querySelector('table').appendChild(tr);

        //把将来需要进行改动的元素保存到 music 对象的 playListRow 属性，方便以后操作
        music.playListRow = {
            tr: tr,
            tdTitle: tdTitle,
            tdArtist: tdArtist,
            tdPlayPosFlag: tdPlayPosFlag,
            btnFavor: btnFavor
        };
    }

    function bindEvent() {
        element.audio.onended = function () {
            player.next();
        };

        element.rangeVolume.oninput = function () {
            player.setVolume(this.value);
        };

        element.muted.onclick = function () {
            player.changeMuted();
        };

        element.displayList.onclick = function () {
            if (element.playList.style.maxHeight === '500px') {
                element.playList.style.maxHeight = '0px';
            } else {
                element.playList.style.maxHeight = '500px';
            }
        };

        element.download.onclick = function () {
            element.realDownload.click();
        };

        element.playStrategy.onclick = function () {
            player.changePlayStrategy();
        };

        element.add.onclick = function () {
            element.realAdd.click();
        };

        element.realAdd.onchange = function () {
            if (this.value) {
                musics.push(new Music(this.src));
                player.enable();
            }
        };

        element.favor.onclick = function () {
            musics[player.getCurrentMusicId()].favor();
        };

        element.delete.onclick = function () {
            musics[player.getCurrentMusicId()].delete();
        };

       element.pause.onclick = function () {
            if (element.audio.paused) {
                player.play();
            } else {
                player.pause();
            }
        };

        element.next.onclick = function () {
            player.next();
        };

        element.audio.oncanplay = function () {
            element.progress.max = this.duration;
        };

        element.audio.ontimeupdate = function () {
            var remainMin = Math.floor((this.duration - this.currentTime) / 60);
            var remainSec = Math.floor((this.duration - this.currentTime) % 60);
            if (remainSec.toString().length < 2) {
                remainSec = '0' + remainSec;
            }
            player.updateProgress();
            if (isNaN(remainSec)) {
                remainSec = remainMin = '--';
            }
            element.remainTime.innerText = '-' + remainMin + ':' + remainSec;
            element.progress.value = element.audio.currentTime;
        };

        element.progress.oninput = function () {
            element.audio.currentTime = this.value;
            this.value = element.audio.currentTime;
            player.updateProgress();
        };
    }

    (function init() {
        musicList.forEach(function (item) {
            musics.push(new Music(item.src));
        });
        bindEvent();
        player.play(0);
    })();
}

createPlayer(musicList);

