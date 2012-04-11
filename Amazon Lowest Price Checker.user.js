// ==UserScript==
// @name           Amazon Lowest Price Checker
// @namespace      http://gigi-net.net
// @include        http://www.amazon.co.jp/*
// @version        20100805/mod4 型番取得率の向上
// ==/UserScript==
// @version        20100608/mod3 型番を取得できなかった場合に、キーワード検索を試みるようにした
// @version        20100426/mod2 画像の埋め込みと、処理の簡略化
// @version        20100426/mod 価格.com API変更への対応と、型番取得率の向上

(function(){

// https://ssl.kakaku.com/WebAPI/Auth/Entry.aspx にて、APIアクセスキーの取得を行い、
// 取得したキーを以下にコピペして下さい。
var accessKey = "";

//-----------ここから本体----------------

//商品ページじゃなければ処理中止
if(!document.getElementById("btAsinTitle")) return;


//価格を3ケタ区切りにする関数
function SetPrice(price){
	var num = new String(price).replace(/,/g, "");
	while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
	return num;
}

//APIURL
var api_url ="http://api.kakaku.com/WebAPI/ItemSearch/Ver1.0/ItemSearch.aspx";

//読み込み中の画像データ
var loadingImageData = 'data:image/gif;base64,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';

//escape to shift jis
//----------ここから
// Escape Codec Library: ecl.js (Ver.041208)
// Copyright (C) http://nurucom-archives.hp.infoseek.co.jp/digital/
EscapeSJIS=function(str){
	return str.replace(/[^*+.-9A-Z_a-z-]/g,function(s){
		var c=s.charCodeAt(0),m;
		return c<128?(c<16?"%0":"%")+c.toString(16).toUpperCase():65376<c&&c<65440?"%"+(c-65216).toString(16).toUpperCase():(c=JCT11280.indexOf(s))<0?"%81E":"%"+((m=((c<8272?c:(c=JCT11280.lastIndexOf(s)))-(c%=188))/188)<31?m+129:m+193).toString(16).toUpperCase()+(64<(c+=c<63?64:65)&&c<91||95==c||96<c&&c<123?String.fromCharCode(c):"%"+c.toString(16).toUpperCase())
	})
};
JCT11280=Function('var a="zKV33~jZ4zN=~ji36XazM93y!{~k2y!o~k0ZlW6zN?3Wz3W?{EKzK[33[`y|;-~j^YOTz$!~kNy|L1$353~jV3zKk3~k-4P4zK_2+~jY4y!xYHR~jlz$_~jk4z$e3X5He<0y!wy|X3[:~l|VU[F3VZ056Hy!nz/m1XD61+1XY1E1=1y|bzKiz!H034zKj~mEz#c5ZA3-3X$1~mBz$$3~lyz#,4YN5~mEz#{ZKZ3V%7Y}!J3X-YEX_J(3~mAz =V;kE0/y|F3y!}~m>z/U~mI~j_2+~mA~jp2;~m@~k32;~m>V}2u~mEX#2x~mBy+x2242(~mBy,;2242(~may->2&XkG2;~mIy-_2&NXd2;~mGz,{4<6:.:B*B:XC4>6:.>B*BBXSA+A:X]E&E<~r#z+625z s2+zN=`HXI@YMXIAXZYUM8X4K/:Q!Z&33 3YWX[~mB`{zKt4z (zV/z 3zRw2%Wd39]S11z$PAXH5Xb;ZQWU1ZgWP%3~o@{Dgl#gd}T){Uo{y5_d{e@}C(} WU9|cB{w}bzvV|)[} H|zT}d||0~{]Q|(l{|x{iv{dw}(5}[Z|kuZ }cq{{y|ij}.I{idbof%cu^d}Rj^y|-M{ESYGYfYsZslS`?ZdYO__gLYRZ&fvb4oKfhSf^d<Yeasc1f&a=hnYG{QY{D`Bsa|u,}Dl|_Q{C%xK|Aq}C>|c#ryW=}eY{L+`)][YF_Ub^h4}[X|?r|u_ex}TL@YR]j{SrXgo*|Gv|rK}B#mu{R1}hs|dP{C7|^Qt3|@P{YVV |8&}#D}ef{e/{Rl|>Hni}R1{Z#{D[}CQlQ||E}[s{SG_+i8eplY[=[|ec[$YXn#`hcm}YR|{Ci(_[ql|?8p3]-}^t{wy}4la&pc|3e{Rp{LqiJ],] `kc(]@chYnrM`O^,ZLYhZB]ywyfGY~aex!_Qww{a!|)*lHrM{N+n&YYj~Z b c#e_[hZSon|rOt`}hBXa^i{lh|<0||r{KJ{kni)|x,|0auY{D!^Sce{w;|@S|cA}Xn{C1h${E]Z-XgZ*XPbp]^_qbH^e[`YM|a||+=]!Lc}]vdBc=j-YSZD]YmyYLYKZ9Z>Xcczc2{Yh}9Fc#Z.l{}(D{G{{mRhC|L3b#|xK[Bepj#ut`H[,{E9Yr}1b{[e]{ZFk7[ZYbZ0XL]}Ye[(`d}c!|*y`Dg=b;gR]Hm=hJho}R-[n}9;{N![7k_{UbmN]rf#pTe[x8}!Qcs_rs[m`|>N}^V})7{^r|/E}),}HH{OYe2{Skx)e<_.cj.cjoMhc^d}0uYZd!^J_@g,[[[?{i@][|3S}Yl3|!1|eZ|5IYw|1D}e7|Cv{OHbnx-`wvb[6[4} =g+k:{C:}ed{S]|2M]-}WZ|/q{LF|dYu^}Gs^c{Z=}h>|/i|{W]:|ip{N:|zt|S<{DH[p_tvD{N<[8Axo{X4a.^o^X>Yfa59`#ZBYgY~_t^9`jZHZn`>G[oajZ;X,i)Z.^~YJe ZiZF^{][[#Zt^|]Fjx]&_5dddW]P0C[-]}]d|y {C_jUql] |OpaA[Z{lp|rz}:Mu#]_Yf6{Ep?f5`$[6^D][^u[$[6^.Z8]]ePc2U/=]K^_+^M{q*|9tYuZ,s(dS{i=|bNbB{uG}0jZOa:[-]dYtu3]:]<{DJ_SZIqr_`l=Yt`gkTnXb3d@kiq0a`Z{|!B|}e}Ww{Sp,^Z|0>_Z}36|]A|-t}lt{R6pi|v8hPu#{C>YOZHYmg/Z4nicK[}hF_Bg|YRZ7c|crkzYZY}_iXcZ.|)U|L5{R~qi^Uga@Y[xb}&qdbd6h5|Btw[}c<{Ds53[Y7]?Z<|e0{L[ZK]mXKZ#Z2^tavf0`PE[OSOaP`4gi`qjdYMgys/?[nc,}EEb,eL]g[n{E_b/vcvgb.{kcwi`~v%|0:|iK{Jh_vf5lb}KL|(oi=LrzhhY_^@`zgf[~g)[J_0fk_V{T)}I_{D&_/d9W/|MU[)f$xW}?$xr4<{Lb{y4}&u{XJ|cm{Iu{jQ}CMkD{CX|7A}G~{kt)nB|d5|<-}WJ}@||d@|Iy}Ts|iL|/^|no|0;}L6{Pm]7}$zf:|r2}?C_k{R(}-w|`G{Gy[g]bVje=_0|PT{^Y^yjtT[[[l!Ye_`ZN]@[n_)j3nEgMa]YtYpZy].d-Y_cjb~Y~[nc~sCi3|zg}B0}do{O^{|$`_|D{}U&|0+{J3|8*]iayx{a{xJ_9|,c{Ee]QXlYb]$[%YMc*]w[aafe]aVYi[fZEii[xq2YQZHg]Y~h#|Y:thre^@^|_F^CbTbG_1^qf7{L-`VFx Zr|@EZ;gkZ@slgko`[e}T:{Cu^pddZ_`yav^Ea+[#ZBbSbO`elQfLui}.F|txYcbQ`XehcGe~fc^RlV{D_0ZAej[l&jShxG[ipB_=u:eU}3e8[=j|{D(}dO{Do[BYUZ0/]AYE]ALYhZcYlYP/^-^{Yt_1_-;YT`P4BZG=IOZ&]H[e]YYd[9^F[1YdZxZ?Z{Z<]Ba2[5Yb[0Z4l?]d_;_)a?YGEYiYv`_XmZs4ZjY^Zb]6gqGaX^9Y}dXZr[g|]Y}K aFZp^k^F]M`^{O1Ys]ZCgCv4|E>}8eb7}l`{L5[Z_faQ|c2}Fj}hw^#|Ng|B||w2|Sh{v+[G}aB|MY}A{|8o}X~{E8paZ:]i^Njq]new)`-Z>haounWhN}c#{DfZ|fK]KqGZ=:u|fqoqcv}2ssm}.r{]{nIfV{JW)[K|,Z{Uxc|]l_KdCb%]cfobya3`p}G^|LZiSC]U|(X|kBlVg[kNo({O:g:|-N|qT}9?{MBiL}Sq{`P|3a|u.{Uaq:{_o|^S}jX{Fob0`;|#y_@[V[K|cw[<_ }KU|0F}d3|et{Q7{LuZttsmf^kYZ`Af`}$x}U`|Ww}d]| >}K,r&|XI|*e{C/a-bmr1fId4[;b>tQ_:]hk{b-pMge]gfpo.|(w[jgV{EC1Z,YhaY^q,_G[c_g[J0YX]`[h^hYK^_Yib,` {i6vf@YM^hdOKZZn(jgZ>bzSDc^Z%[[o9[2=/YHZ(_/Gu_`*|8z{DUZxYt^vuvZjhi^lc&gUd4|<UiA`z]$b/Z?l}YI^jaHxe|;F}l${sQ}5g}hA|e4}?o{ih}Uz{C)jPe4]H^J[Eg[|AMZMlc}:,{iz}#*|gc{Iq|/:|zK{l&}#u|myd{{M&v~nV};L|(g|I]ogddb0xsd7^V})$uQ{HzazsgxtsO^l}F>ZB]r|{7{j@cU^{{CbiYoHlng]f+nQ[bkTn/}<-d9q {KXadZYo+n|l[|lc}V2{[a{S4Zam~Za^`{HH{xx_SvF|ak=c^[v^7_rYT`ld@]:_ub%[$[m](Shu}G2{E.ZU_L_R{tz`vj(f?^}hswz}GdZ}{S:h`aD|?W|`dgG|if{a8|J1{N,}-Ao3{H#{mfsP|[ bzn+}_Q{MT{u4kHcj_q`eZj[8o0jy{p7}C|[}l){MuYY{|Ff!Ykn3{rT|m,^R|,R}$~Ykgx{P!]>iXh6[l[/}Jgcg{JYZ.^qYfYIZl[gZ#Xj[Pc7YyZD^+Yt;4;`e8YyZVbQ7YzZxXja.7SYl[s]2^/Ha$[6ZGYrb%XiYdf2]H]kZkZ*ZQ[ZYS^HZXcCc%Z|[(bVZ]]:OJQ_DZCg<[,]%Zaa [g{C00HY[c%[ChyZ,Z_`PbXa+eh`^&jPi0a[ggvhlekL]w{Yp^v}[e{~;k%a&k^|nR_z_Qng}[E}*Wq:{k^{FJZpXRhmh3^p>de^=_7`|ZbaAZtdhZ?n4ZL]u`9ZNc3g%[6b=e.ZVfC[ZZ^^^hD{E(9c(kyZ=bb|Sq{k`|vmr>izlH[u|e`}49}Y%}FT{[z{Rk}Bz{TCc/lMiAqkf(m$hDc;qooi[}^o:c^|Qm}a_{mrZ(pA`,}<2sY| adf_%|}`}Y5U;}/4|D>|$X{jw{C<|F.hK|*A{MRZ8Zsm?imZm_?brYWZrYx`yVZc3a@f?aK^ojEd {bN}/3ZH]/$YZhm^&j 9|(S|b]mF}UI{q&aM]LcrZ5^.|[j`T_V_Gak}9J[ ZCZD|^h{N9{~&[6Zd{}B}2O|cv]K}3s}Uy|l,fihW{EG`j_QOp~Z$F^zexS`dcISfhZBXP|.vn|_HYQ|)9|cr]<`&Z6]m_(ZhPcSg>`Z]5`~1`0Xcb4k1{O!bz|CN_T{LR|a/gFcD|j<{Z._[f)mPc:1`WtIaT1cgYkZOaVZOYFrEe[}T$}Ch}mk{K-^@]fH{Hdi`c*Z&|Kt{if[C{Q;{xYB`dYIX:ZB[}]*[{{p9|4GYRh2ao{DS|V+[zd$`F[ZXKadb*A] Ys]Maif~a/Z2bmclb8{Jro_rz|x9cHojbZ{GzZx_)]:{wAayeDlx}<=`g{H1{l#}9i|)=|lP{Qq}.({La|!Y{i2EZfp=c*}Cc{EDvVB|;g}2t{W4av^Bn=]ri,|y?|3+}T*ckZ*{Ffr5e%|sB{lx^0]eZb]9[SgAjS_D|uHZx]dive[c.YPkcq/}db{EQh&hQ|eg}G!ljil|BO]X{Qr_GkGl~YiYWu=c3eb}29v3|D|}4i||.{Mv})V{SP1{FX}CZW6{cm|vO{pS|e#}A~|1i}81|Mw}es|5[}3w{C`h9aL]o{}p[G`>i%a1Z@`Ln2bD[$_h`}ZOjhdTrH{[j_:k~kv[Sdu]CtL}41{I |[[{]Zp$]XjxjHt_eThoa#h>sSt8|gK|TVi[Y{t=}Bs|b7Zpr%{gt|Yo{CS[/{iteva|cf^hgn}($_c^wmb^Wm+|55jrbF|{9^ q6{C&c+ZKdJkq_xOYqZYSYXYl`8]-cxZAq/b%b*_Vsa[/Ybjac/OaGZ4fza|a)gY{P?| I|Y |,pi1n7}9bm9ad|=d{aV|2@[(}B`d&|Uz}B}{`q|/H|!JkM{FU|CB|.{}Az}#P|lk}K{|2rk7{^8^?`/|k>|Ka{Sq}Gz}io{DxZh[yK_#}9<{TRdgc]`~Z>JYmYJ]|`!ZKZ]gUcx|^E[rZCd`f9oQ[NcD_$ZlZ;Zr}mX|=!|$6ZPZYtIo%fj}CpcN|B,{VDw~gb}@hZg`Q{LcmA[(bo`<|@$|o1|Ss}9Z_}tC|G`{F/|9nd}i=}V-{L8aaeST]daRbujh^xlpq8|}zs4bj[S`J|]?G{P#{rD{]I`OlH{Hm]VYuSYUbRc*6[j`8]pZ[bt_/^Jc*[<Z?YE|Xb|?_Z^Vcas]h{t9|Uwd)_(=0^6Zb{Nc} E[qZAeX[a]P^|_J>e8`W^j_Y}R{{Jp__]Ee#e:iWb9q_wKbujrbR}CY`,{mJ}gz{Q^{t~N|? gSga`V_||:#mi}3t|/I`X{N*|ct|2g{km}gi|{={jC}F;|E}{ZZjYf*frmu}8Tdroi{T[|+~}HG{cJ}DM{Lp{Ctd&}$hi3|FZ| m}Kr|38}^c|m_|Tr{Qv|36}?Up>|;S{DV{k_as}BK{P}}9p|t`jR{sAm4{D=b4pWa[}Xi{EjwEkI}3S|E?u=X0{jf} S|NM|JC{qo^3cm]-|JUx/{Cj{s>{Crt[UXuv|D~|j|d{YXZR}Aq}0r}(_{pJfi_z}0b|-vi)Z mFe,{f4|q`b{}^Z{HM{rbeHZ|^x_o|XM|L%|uFXm}@C_{{Hhp%a7|0p[Xp+^K}9U{bP}: tT}B|}+$|b2|[^|~h{FAby[`{}xgygrt~h1[li`c4vz|,7p~b(|mviN}^pg[{N/|g3|^0c,gE|f%|7N{q[|tc|TKA{LU}I@|AZp(}G-sz{F |qZ{}F|f-}RGn6{Z]_5})B}UJ{FFb2]4ZI@v=k,]t_Dg5Bj]Z-]L]vrpdvdGlk|gF}G]|IW}Y0[G| /bo|Te^,_B}#n^^{QHYI[?hxg{[`]D^IYRYTb&kJ[cri[g_9]Ud~^_]<p@_e_XdNm-^/|5)|h_{J;{kacVopf!q;asqd}n)|.m|bf{QW|U)}b+{tL|w``N|to{t ZO|T]jF}CB|0Q{e5Zw|k |We}5:{HO{tPwf_uajjBfX}-V_C_{{r~gg|Ude;s+}KNXH}! `K}eW{Upwbk%ogaW}9EYN}YY|&v|SL{C3[5s.]Y]I]u{M6{pYZ`^,`ZbCYR[1mNg>rsk0Ym[jrE]RYiZTr*YJ{Ge|%-lf|y(`=[t}E6{k!|3)}Zk} ][G{E~cF{u3U.rJ|a9p#o#ZE|?|{sYc#vv{E=|LC}cu{N8`/`3`9rt[4|He{cq|iSYxY`}V |(Q|t4{C?]k_Vlvk)BZ^r<{CL}#h}R+[<|i=}X|{KAo]|W<`K{NW|Zx}#;|fe{IMr<|K~tJ_x}AyLZ?{GvbLnRgN}X&{H7|x~}Jm{]-| GpNu0}.ok>|c4{PYisrDZ|fwh9|hfo@{H~XSbO]Odv]%`N]b1Y]]|eIZ}_-ZA]aj,>eFn+j[aQ_+]h[J_m_g]%_wf.`%k1e#Z?{CvYu_B^|gk`Xfh^M3`afGZ-Z|[m{L}|k3cp[it ^>YUi~d>{T*}YJ{Q5{Jxa$hg|%4`}|LAgvb }G}{P=|<;Ux{_skR{cV|-*|s-{Mp|XP|$G|_J}c6cM{_=_D|*9^$ec{V;|4S{qO|w_|.7}d0|/D}e}|0G{Dq]Kdp{}dfDi>}B%{Gd|nl}lf{C-{y}|ANZr}#={T~|-(}c&{pI|ft{lsVP}){|@u}!W|bcmB{d?|iW|:dxj{PSkO|Hl]Li:}VYk@|2={fnWt{M3`cZ6|)}|Xj}BYa?vo{e4|L7|B7{L7|1W|lvYO}W8nJ|$Vih|{T{d*_1|:-n2dblk``fT{Ky|-%}m!|Xy|-a{Pz}[l{kFjz|iH}9N{WE{x,|jz}R {P|{D)c=nX|Kq|si}Ge{sh|[X{RF{t`|jsr*fYf,rK|/9}$}}Nf{y!1|<Std}4Wez{W${Fd_/^O[ooqaw_z[L`Nbv[;l7V[ii3_PeM}.h^viqYjZ*j1}+3{bt{DR[;UG}3Og,rS{JO{qw{d<_zbAh<R[1_r`iZTbv^^a}c{iEgQZ<exZFg.^Rb+`Uj{a+{z<[~r!]`[[|rZYR|?F|qppp]L|-d|}K}YZUM|=Y|ktm*}F]{D;g{uI|7kg^}%?Z%ca{N[_<q4xC]i|PqZC]n}.bDrnh0Wq{tr|OMn6tM|!6|T`{O`|>!]ji+]_bTeU}Tq|ds}n|{Gm{z,f)}&s{DPYJ`%{CGd5v4tvb*hUh~bf]z`jajiFqAii]bfy^U{Or|m+{I)cS|.9k:e3`^|xN}@Dnlis`B|Qo{`W|>||kA}Y}{ERYuYx`%[exd`]|OyiHtb}HofUYbFo![5|+]gD{NIZR|Go}.T{rh^4]S|C9_}xO^i`vfQ}C)bK{TL}cQ|79iu}9a];sj{P.o!f[Y]pM``Jda^Wc9ZarteBZClxtM{LW}l9|a.mU}KX}4@{I+f1}37|8u}9c|v${xGlz}jP{Dd1}e:}31}%3X$|22i<v+r@~mf{sN{C67G97855F4YL5}8f{DT|xy{sO{DXB334@55J1)4.G9A#JDYtXTYM4, YQD9;XbXm9SX]IB^4UN=Xn<5(;(F3YW@XkH-X_VM[DYM:5XP!T&Y`6|,^{IS-*D.H>:LXjYQ0I3XhAF:9:(==.F*3F1189K/7163D,:@|e2{LS36D4hq{Lw/84443@4.933:0307::6D7}&l{Mx657;89;,K5678H&93D(H<&<>0B90X^I;}Ag1{P%3A+>><975}[S{PZE453?4|T2{Q+5187;>447:81{C=hL6{Me^:=7ii{R=.=F<81;48?|h8}Uh{SE|,VxL{ST,7?9Y_5Xk3A#:$%YSYdXeKXOD8+TXh7(@>(YdXYHXl9J6X_5IXaL0N?3YK7Xh!1?XgYz9YEXhXaYPXhC3X`-YLY_XfVf[EGXZ5L8BXL9YHX]SYTXjLXdJ: YcXbQXg1PX]Yx4|Jr{Ys4.8YU+XIY`0N,<H%-H;:0@,74/:8546I=9177154870UC]d<C3HXl7ALYzXFXWP<<?E!88E5@03YYXJ?YJ@6YxX-YdXhYG|9o{`iXjY_>YVXe>AYFX[/(I@0841?):-B=14337:8=|14{c&93788|di{cW-0>0<097/A;N{FqYpugAFT%X/Yo3Yn,#=XlCYHYNX[Xk3YN:YRT4?)-YH%A5XlYF3C1=NWyY}>:74-C673<69545v {iT85YED=64=.F4..9878/D4378?48B3:7:7/1VX[f4{D,{l<5E75{dAbRB-8-@+;DBF/$ZfW8S<4YhXA.(5@*11YV8./S95C/0R-A4AXQYI7?68167B95HA1*<M3?1/@;/=54XbYP36}lc{qzSS38:19?,/39193574/66878Yw1X-87E6=;964X`T734:>86>1/=0;(I-1::7ALYGXhF+Xk[@W%TYbX7)KXdYEXi,H-XhYMRXfYK?XgXj.9HX_SX]YL1XmYJ>Y}WwIXiI-3-GXcYyXUYJ$X`Vs[7;XnYEZ;XF! 3;%8;PXX(N3Y[)Xi1YE&/ :;74YQ6X`33C;-(>Xm0(TYF/!YGXg8 9L5P01YPXO-5%C|qd{{/K/E6,=0144:361:955;6443@?B7*7:F89&F35YaX-CYf,XiFYRXE_e{}sF 0*7XRYPYfXa5YXXY8Xf8Y~XmA[9VjYj*#YMXIYOXk,HHX40YxYMXU8OXe;YFXLYuPXP?EB[QV0CXfY{:9XV[FWE0D6X^YVP*$4%OXiYQ(|xp|%c3{}V`1>Y`XH00:8/M6XhQ1:;3414|TE|&o@1*=81G8<3}6<|(f6>>>5-5:8;093B^3U*+*^*UT30XgYU&7*O1953)5@E78--F7YF*B&0:%P68W9Zn5974J9::3}Vk|-,C)=)1AJ4+<3YGXfY[XQXmT1M-XcYTYZXCYZXEYXXMYN,17>XIG*SaS|/eYJXbI?XdNZ+WRYP<F:R PXf;0Xg`$|1GX9YdXjLYxWX!ZIXGYaXNYm6X9YMX?9EXmZ&XZ#XQ>YeXRXfAY[4 ;0X!Zz0XdN$XhYL XIY^XGNXUYS/1YFXhYk.TXn4DXjB{jg|4DEX]:XcZMW=A.+QYL<LKXc[vV$+&PX*Z3XMYIXUQ:ZvW< YSXFZ,XBYeXMM)?Xa XiZ4/EXcP3%}&-|6~:1(-+YT$@XIYRBC<}&,|7aJ6}bp|8)K1|Xg|8C}[T|8Q.89;-964I38361<=/;883651467<7:>?1:.}le|:Z=39;1Y^)?:J=?XfLXbXi=Q0YVYOXaXiLXmJXO5?.SFXiCYW}-;|=u&D-X`N0X^,YzYRXO(QX_YW9`I|>hZ:N&X)DQXP@YH#XmNXi$YWX^=!G6YbYdX>XjY|XlX^XdYkX>YnXUXPYF)FXT[EVTMYmYJXmYSXmNXi#GXmT3X8HOX[ZiXN]IU2>8YdX1YbX<YfWuZ8XSXcZU%0;1XnXkZ_WTG,XZYX5YSX Yp 05G?XcYW(IXg6K/XlYP4XnI @XnO1W4Zp-9C@%QDYX+OYeX9>--YSXkD.YR%Q/Yo YUX].Xi<HYEZ2WdCE6YMXa7F)=,D>-@9/8@5=?7164;35387?N<618=6>7D+C50<6B03J0{Hj|N9$D,9I-,.KB3}m |NzE0::/81YqXjMXl7YG; [.W=Z0X4XQY]:MXiR,XgM?9$9>:?E;YE77VS[Y564760391?14941:0=:8B:;/1DXjFA-564=0B3XlH1+D85:0Q!B#:-6&N/:9<-R3/7Xn<*3J4.H:+334B.=>30H.;3833/76464665755:/83H6633:=;.>5645}&E|Y)?1/YG-,93&N3AE@5 <L1-G/8A0D858/30>8<549=@B8] V0[uVQYlXeD(P#ID&7T&7;Xi0;7T-$YE)E=1:E1GR):--0YI7=E<}n9|aT6783A>D7&4YG7=391W;Zx<5+>F#J39}o/|cc;6=A050EQXg8A1-}D-|d^5548083563695D?-.YOXd37I$@LYLWeYlX<Yd+YR A$;3-4YQ-9XmA0!9/XLY_YT(=5XdDI>YJ5XP1ZAW{9>X_6R(XhYO65&J%DA)C-!B:97#A9;@?F;&;(9=11/=657/H,<8}bz|j^5446>.L+&Y^8Xb6?(CYOXb*YF(8X`FYR(XPYVXmPQ%&DD(XmZXW??YOXZXfCYJ79,O)XnYF7K0!QXmXi4IYFRXS,6<%-:YO(+:-3Q!1E1:W,Zo}Am|n~;3580534*?3Zc4=9334361693:30C<6/717:<1/;>59&:4}6!|rS36=1?75<8}[B|s809983579I.A.>84758=108564741H*9E{L{|u%YQ<%6XfH.YUXe4YL@,>N}Tv|ve*G0X)Z;/)3@A74(4P&A1X:YVH97;,754*A66:1 D739E3553545558E4?-?K17/770843XAYf838A7K%N!YW4.$T19Z`WJ*0XdYJXTYOXNZ 1XaN1A+I&Xi.Xk3Z3GB&5%WhZ1+5#Y[X<4YMXhQYoQXVXbYQ8XSYUX4YXBXWDMG0WxZA[8V+Z8X;D],Va$%YeX?FXfX[XeYf<X:Z[WsYz8X_Y]%XmQ(!7BXIZFX]&YE3F$(1XgYgYE& +[+W!<YMYFXc;+PXCYI9YrWxGXY9DY[!GXiI7::)OC;*$.>N*HA@{C|}&k=:<TB83X`3YL+G4XiK]i}(fYK<=5$.FYE%4*5*H*6XkCYL=*6Xi6!Yi1KXR4YHXbC8Xj,B9ZbWx/XbYON#5B}Ue}+QKXnF1&YV5XmYQ0!*3IXBYb71?1B75XmF;0B976;H/RXU:YZX;BG-NXj;XjI>A#D3B636N;,*%<D:0;YRXY973H5)-4FXOYf0:0;/7759774;7;:/855:543L43<?6=E,.A4:C=L)%4YV!1(YE/4YF+ F3%;S;&JC:%/?YEXJ4GXf/YS-EXEYW,9;E}X$}547EXiK=51-?71C%?57;5>463553Zg90;6447?<>4:9.7538XgN{|!}9K/E&3-:D+YE1)YE/3;37/:05}n<}:UX8Yj4Yt864@JYK..G=.(A Q3%6K>3(P3#AYE$-6H/456*C=.XHY[#S.<780191;057C)=6HXj?955B:K1 E>-B/9,;5.!L?:0>/.@//:;7833YZ56<4:YE=/:7Z_WGC%3I6>XkC*&NA16X=Yz2$X:Y^&J48<99k8}CyB-61<18K946YO4{|N}E)YIB9K0L>4=46<1K0+R;6-=1883:478;4,S+3YJX`GJXh.Yp+Xm6MXcYpX(>7Yo,/:X=Z;Xi0YTYHXjYmXiXj;*;I-8S6N#XgY}.3XfYGO3C/$XjL$*NYX,1 6;YH&<XkK9C#I74.>}Hd`A748X[T450[n75<4439:18A107>|ET}Rf<1;14876/Yb983E<5.YNXd4149>,S=/4E/<306443G/06}0&}UkYSXFYF=44=-5095=88;63844,9E6644{PL}WA8:>)7+>763>>0/B3A545CCnT}Xm|dv}Xq1L/YNXk/H8;;.R63351YY747@15YE4J8;46;.38.>4A369.=-83,;Ye3?:3@YE.4-+N353;/;@(X[YYD>@/05-I*@.:551741Yf5>6A443<3535;.58/86=D4753442$635D1>0359NQ @73:3:>><Xn?;43C14 ?Y|X611YG1&<+,4<*,YLXl<1/AIXjF*N89A4Z576K1XbJ5YF.ZOWN.YGXO/YQ01:4G38Xl1;KI0YFXB=R<7;D/,/4>;$I,YGXm94@O35Yz66695385.>:6A#5}W7n^4336:4157597434433<3|XA}m`>=D>:4A.337370?-6Q96{`E|4A}C`|Qs{Mk|J+~r>|o,wHv>Vw}!c{H!|Gb|*Ca5}J||,U{t+{CN[!M65YXOY_*B,Y[Z9XaX[QYJYLXPYuZ%XcZ8LY[SYPYKZM<LMYG9OYqSQYM~[e{UJXmQYyZM_)>YjN1~[f3{aXFY|Yk:48YdH^NZ0|T){jVFYTZNFY^YTYN~[h{nPYMYn3I]`EYUYsYIZEYJ7Yw)YnXPQYH+Z.ZAZY]^Z1Y`YSZFZyGYHXLYG 8Yd#4~[i|+)YH9D?Y^F~Y7|-eYxZ^WHYdYfZQ~[j|3>~[k|3oYmYqY^XYYO=Z*4[]Z/OYLXhZ1YLZIXgYIHYEYK,<Y`YEXIGZI[3YOYcB4SZ!YHZ*&Y{Xi3~[l|JSY`Zz?Z,~[m|O=Yi>??XnYWXmYS617YVYIHZ(Z4[~L4/=~[n|Yu{P)|];YOHHZ}~[o33|a>~[r|aE]DH~[s|e$Zz~[t|kZFY~XhYXZB[`Y}~[u|{SZ&OYkYQYuZ2Zf8D~[v}% ~[w3},Q[X]+YGYeYPIS~[y}4aZ!YN^!6PZ*~[z}?E~[{3}CnZ=~[}}EdDZz/9A3(3S<,YR8.D=*XgYPYcXN3Z5 4)~[~}JW=$Yu.XX~] }KDX`PXdZ4XfYpTJLY[F5]X~[2Yp}U+DZJ::<446[m@~]#3}]1~]%}^LZwZQ5Z`/OT<Yh^ -~]&}jx[ ~m<z!%2+~ly4VY-~o>}p62yz!%2+Xf2+~ly4VY-zQ`z (=] 2z~o2",C={" ":0,"!":1},c=34,i=2,p,s="",u=String.fromCharCode,t=u(12539);while(++c<127)C[u(c)]=c^39&&c^92?i++:0;i=0;while(0<=(c=C[a.charAt(i++)]))if(16==c)if((c=C[a.charAt(i++)])<87){if(86==c)c=1879;while(c--)s+=u(++p)}else s+=s.substr(8272,360);else if(c<86)s+=u(p+=c<51?c-16:(c-55)*92+C[a.charAt(i++)]);else if((c=((c-86)*92+C[a.charAt(i++)])*92+C[a.charAt(i++)])<49152)s+=u(p=c<40960?c:c|57344);else{c&=511;while(c--)s+=t;p=12539}return s')();
//----------ここまで


//ロード中メッセージ表示
var title = document.getElementsByTagName("h1");
var check_lowest = document.createElement("div");
check_lowest.innerHTML = "<img src='"+loadingImageData+"' style='vertical-align:middle'>価格.comから最低価格を読み込んでいます。";
title[0].parentNode.appendChild(check_lowest);


//製品型番を取得
var kataban = "",dom_kataban;
if(dom_kataban = document.getElementById("productDetailsDiv")){
	//productDetailsDivがある場合
	dom_kataban = dom_kataban.childNodes[0];
	for(var i=0;i<dom_kataban.childNodes.length;i++)
		if(dom_kataban.childNodes[i].innerHTML.indexOf("型番") !=-1)
			kataban = dom_kataban.childNodes[i].innerHTML.replace(/<.*>/,"").replace(/\s{2,}/g,'');
}else if(dom_kataban = document.getElementById("detail-bullets_feature_div")){
	//productDetailsしかない場合
	dom_kataban = dom_kataban.getElementsByTagName("table")[0];
	var lis = dom_kataban.getElementsByTagName('li');
	for(var i=0;i<lis.length;i++)
		if(lis[i].innerHTML.indexOf("型番") != -1)
			kataban = lis[i].innerHTML.replace(/<b.*b>/,"").replace(/\s{2,}/g,'');
}else if(dom_kataban = document.getElementById("productDetails")){
	//productDetailsがあるが、detail-bullets(ryがない場合
	var i=0;
	while(dom_kataban.nodeName.toLowerCase() != 'table' && i<5){
		dom_kataban = dom_kataban.nextSibling;
		i++;
	}
	var lis = dom_kataban.getElementsByTagName('li');
	for(var i=0;i<lis.length;i++)
		if(lis[i].innerHTML.indexOf("型番") != -1)
			kataban = lis[i].innerHTML.replace(/<b.*b>/,"").replace(/\s{2,}/g,'');

}

//商品名から検索ワードの抽出を試みる
var keyword = document.getElementById("btAsinTitle").textContent.replace(/\[.*?\]/g,'').replace(/【.*?】/g,'').replace(/\(.*?\)/g,'').replace(/\s{2,}/g,'');


//Amazon.comの価格を取得
var ap = 0;
if(document.getElementById("buyboxPriceBlock")){
	ap = document.getElementsByClassName('price')[0].textContent.replace(/\D+/g,"");
}else if(document.getElementById("priceBlock")){
	ap = document.getElementsByClassName('priceLarge')[0].textContent.replace(/\D+/g,"");
}


//価格.com APIを用いて型番から最安値を取得,表示する。
var xml_url = api_url + "?Keyword=" + EscapeSJIS(kataban?kataban:keyword).replace('%20', '+', 'g') + "&CategoryGroup=ALL&SortOrder=pricerank&HitNum=5&ApiKey=" + accessKey;

GM_xmlhttpRequest({
	method: "GET", 
	url: xml_url,
	onload: function(x){
		var parser = new DOMParser();
		var xml = parser.parseFromString( x.responseText, "text/xml" );
		if(xml.childNodes[0].nodeName =="Error"){
			check_lowest.innerHTML = '<b>API Search Error:</b> '+xml.childNodes[0].childNodes[0].textContent+' - キーワード検索を試行します(キーワード: '+keyword+')<br>';

			//通常web検索での価格取得を試みる
			var pageurl = 'http://kakaku.com/search_results/?query=' + EscapeSJIS(keyword).replace('%20', '+', 'g') + '&act=Input&l=l&sort=priceb';
			GM_xmlhttpRequest({
				method: 'GET',
				url: pageurl,
				onload: function(y){
					var parser2 = document.createElement('div');
					parser2.innerHTML = y.responseText;
					var prices = parser2.getElementsByClassName('price');
					parser2 = null;
					if(!prices[0]) return check_lowest.innerHTML +="<b>Keyword Search Error:</b> 価格.comで商品が見つかりませんでした。 <span style='font-size:12px;'><a target='_blank' href="+pageurl+">価格.comを見る</a></span>";

					var price = prices[0].textContent.replace(/\D+/g,'');
					check_lowest.innerHTML += "<span style='font-size:15px'><b>価格.com 最低価格：<span class='priceLarge'> &yen;  "+SetPrice(price)+"</span></b></span>";

					var sa = ap - price;
					if(sa>0 && sa<100000){
						check_lowest.innerHTML += " Amazonより<span class='priceLarge'> &yen; "+SetPrice(sa)+"</span> 安く買えます。";
					}
					check_lowest.innerHTML +=" <span style='font-size:12px;'><a target='_blank' href="+pageurl+">価格.comを見る</a></span>";
				}
			});
		}else{
			var dom_price = xml.getElementsByTagName("ProductInfo")[0].getElementsByTagName("Item")[0].getElementsByTagName("LowestPrice");
			var pageurl = xml.getElementsByTagName("ProductInfo")[0].getElementsByTagName("Item")[0].getElementsByTagName("ItemPageUrl");
			var price = dom_price[0].textContent;
			check_lowest.innerHTML = "<span style='font-size:15px'><b>価格.com 最低価格：<span class='priceLarge'> &yen;  "+SetPrice(price)+"</span></b></span>";

			var sa = ap - price;
			if(sa>0 && sa<100000){
				check_lowest.innerHTML += " Amazonより<span class='priceLarge'> &yen; "+SetPrice(sa)+"</span> 安く買えます。";
			}

			check_lowest.innerHTML +=" <a target='_blank' href="+pageurl[0].textContent+">価格.comを見る</a>";
		}
	}
});

})();