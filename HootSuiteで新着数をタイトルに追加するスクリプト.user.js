// ==UserScript==
// @name           HootSuiteで新着数をタイトルに追加するスクリプト
// @version        0.0.1
// @description    Add number of new tweet to title on hootsuite.com
// @include        http://hootsuite.com/dashboard*
// ==/UserScript==

(function(){

//更新間隔
var INTERVAL = 10 * 1000;  //30s

setInterval(function(){
	var count;

	try{
	
		var streamMes = document.getElementsByClassName('_streamMessage')[0];
		count = streamMes.innerHTML.match(/(\d+\+?)\u4ef6/)[1];
		
	}catch(e){
		var newCounter = document.getElementsByClassName('_newCount')[0];
		
		if(!newCounter || !newCounter.firstChild){
			count = 0;
		}else{
			count = newCounter.firstChild.nodeValue;
		}
		
	}
	
	var newTitle = count ? document.title.replace(/^(\(\d+\+?\))?\s?Hoot/, '(' + count + ') Hoot') : 'HootSuite';
	
	document.getElementsByTagName('title')[0].innerHTML = newTitle;
	document.title = newTitle;
	
}, INTERVAL);

})();