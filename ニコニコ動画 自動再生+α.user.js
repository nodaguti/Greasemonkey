// ==UserScript==
// @name           ニコニコ動画 自動再生+α
// @namespace      http://nodaguti.usamimi.info/
// @description    自動再生機能などを追加します
// @version        0.0.3.3
// @include        http://www.nicovideo.jp/watch/*
// ==/UserScript==

(function(){

//======自動再生======
if(!document.getElementById("video_controls")) return;

location.href = <><![CDATA[javascript:(function(){
   var flvplayer = document.getElementById("flvplayer");
   var interval = 250;

   if(!flvplayer || typeof flvplayer.ext_getStatus != 'function') return void(setTimeout(arguments.callee, interval));

   flvplayer.ext_play(1);
   if(flvplayer.ext_getStatus().indexOf('playing') < 0) return void(setTimeout(arguments.callee, interval));
})();]]></>;

})();