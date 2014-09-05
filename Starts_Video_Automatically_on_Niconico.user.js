// ==UserScript==
// @name           ニコニコ動画 自動再生+α
// @description    無料会員でもニコニコ動画で動画を自動再生できるようにします
// @version        0.0.4.2
// @author         nodaguti
// @license        MIT License
// @namespace      http://nodaguti.usamimi.info/
// @include        http://www.nicovideo.jp/watch/*
// @updateURL      https://raw.githubusercontent.com/nodaguti/Greasemonkey/master/Starts_Video_Automatically_on_Niconico.user.js
// ==/UserScript==

(function(_window){

//----config----
//自動再生を試行する間隔 (ms)
var INTERVAL = 250;
//----/config----


function playVideo(){
    try{
        if(!_window.WatchApp.namespace.model.player.NicoPlayerConnector.isPrepared)
            return void(setTimeout(arguments.callee, INTERVAL));

        _window.WatchApp.namespace.model.player.NicoPlayerConnector.playVideo();
    }catch(e){
        setTimeout(arguments.callee, INTERVAL);
    }
}

playVideo();

})(unsafeWindow);
