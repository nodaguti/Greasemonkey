// ==UserScript==
// @name           AxfcRetry（改）
// @version        0.1.20080603+mod
// @description    Automatically retry in Axfc ***このスクリプトはhttp://wktklabs.blog98.fc2.com/blog-entry-16.htmlを参考にさせていただきました***
// @include        http://www*.axfc.net/uploader/*/dl.cgi
// @include        http://www*.axfc.net/uploader/*/retry.cgi
// @include        http://www*.axfc.net/uploader/*/so/dl.cgi
// @include        http://www*.axfc.net/uploader/*/so/retry.cgi
// @include        http://www*.axfc.net/uploader/*/dl.pl
// @exclude
// ==/UserScript==



// Thanks for AxfcRetry - Axfc Uploader 自動リトライGreasemonkey（http://wktklabs.blog98.fc2.com/blog-entry-16.html）

(function(){

/*-- 設定ここから --*/

//var max = 5000;  //現在時刻がダウンロード可能時間を過ぎていたときの最大待ち時間(ミリ秒)
//var min = 1000;  //（同上）最小待ち時間(ミリ秒)

var actTime = 100;  //次のダウンロード可能時間の何ミリ秒前からリロードを開始するか
var isSelectionAlert = true;  //偶数奇数、正しい数字を選択させるボタンがでたときに、アラートを表示するか
var isSuccessAlert = false;   //リトライに成功したときにアラートを表示するか

//var offPrefix = "Img|Flv|Flash|File|Mb|He|Ne";

/*-- 設定ここまで --*/


var title = document.title;
var html = "";

//偶数奇数、正しい数字選択ボタンがあったらリロードしない。
if(document.body.innerHTML.indexOf("正しいボタン") > -1){
	if(isSelectionAlert) alert("正しいボタンを選択してください");
	//ログ表示
	html = "Select the correct button.";
	outDiv(html);
	return;
}

//AxfcRetryを動作させないファイル名接頭辞のとき、動作させない
if (!/(Img|Flv|Flash|File|Mb|He|Ne)_\d+/.test(title)) {

	if (document.forms[0]) {

		//リロード画面

		//次のダウンロード可能時間取得
		var nextTimeNode = document.getElementsByTagName("b")[0].innerHTML;
		var timeData = nextTimeNode.match(/\d+/g);
		var nextTime = new Date(timeData[0], timeData[1]-1, timeData[2], timeData[3], timeData[4], timeData[5], 0);

		//今の時刻
//		var nowTime = 
		var nowTime = new Date();
		var count = nextTime.getTime() - nowTime.getTime();

		//リロード予約
		var reload_timer = setTimeout(function(){document.getElementsByTagName('form')[0].submit();}, count-actTime);


		//ログ表示
		html = "AxfcRetry is enable. It'll retry in "+((count-actTime)/1000)+" seconds.";
		outDiv(html);
		document.body.innerHTML += '<input type="button" value="リロード停止" onclick="if(reload_timer) clearTimeout(reload_timer);">';

	}else if (!document.forms[0] && document.getElementsByTagName("body")[0].innerHTML.match(/ダウンロードする/)) {

		//ダウンロード画面
		if(isSuccessAlert) alert("ダウンロードが可能な状態になりました");
		html = 'Download enabled.';
		outDiv(html);

	} else {
		//エラー！
		html = 'Error happened.';
		outDiv(html);
	}
}

function outDiv(htmls){
	var div = document.createElement("div");
	div.style.backgroundColor = "#cccccc";
	div.style.padding = "10px 20px";
	div.style.color = "black";
	div.style.fontSize = "12px";
	div.innerHTML = htmls;
	document.getElementsByTagName("body")[0].appendChild(div);
}

})();