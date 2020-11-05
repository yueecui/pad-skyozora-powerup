// ==UserScript==
// @name         PAD战友网内容扩展-首页关卡信息
// @namespace    https://github.com/yueecui/pad_skyozora_powerup
// @version      0.0.1
// @description  在首页关卡信息旁增加降临BOSS用途（主要是兑换成什么希石）
// @icon         https://pad.skyozora.com/images/egg.ico
// @author       Yuee
// @match        *://pad.skyozora.com
// @grant        none
// ==/UserScript==
/* globals jQuery, $ */

(function() {
    'use strict';

    let stage_note = {};

    const addStyle = (css) => {
        const style = document.createElement('style');
        style.innerText = css;
        document.head.appendChild(style);
    }

    addStyle(`
        .daily-stage-info {width: 100%;}
        .drop-icon{position:relative;display:inline-block;}
        .drop-icon span{position:absolute;right:2px;bottom:1px;z-index:10;width:100%;text-shadow:0 1px #000,1px 0 #000;}
        .drop-icon+.drop-icon {margin-left: 2px;}
    `);


    const stage_drop_map = {
        'ニムエ降臨！': [
            {n:'聖湖乙女・妮姆薇', i:'6087', t:''},
            {n:'水聖劍・王者之劍', i:'6088', t:''},
        ],
        'ソール＆マーニ降臨！': [
            {n:'光華之星運神・蘇爾＆瑪尼', i:'4744', t:''},
            {n:'光華之星運神・蘇爾＆瑪尼的希石', i:'5075', t:'装备'},
        ],
        'ヨルムンガンド降臨！': [
            {n:'神脅的毒蛇・耶夢加得的希石', i:'4520', t:''},
        ],
        '極限デビルラッシュ！': [
            {n:'忘卻的死神・庫利沙爾的希石', i:'4899', t:''},
        ],
        'ヘパイストス降臨！': [
            {n:'火之希石【大】', i:'4463', t:'需进化'},
        ],
        'レジェロンテ降臨！': [
            {n:'水之希石【大】', i:'4464', t:'稀有'},
        ],
        'ドラゴンゾンビ降臨！': [
            {n:'夜行的屍靈龍・喪屍的希石', i:'4568', t:'需究进'},
        ],
        '協力！牛魔王降臨！': [
            {n:'牛魔王', i:'6577', t:''},
        ],
        'ワダツミ降臨！': [
            {n:'水之希石【中】', i:'4459', t:'需进化'},
        ],
        'トト＆ソティス降臨！': [
            {n:'光之希石【中】', i:'4461', t:'需进化'},
            {n:'暗之希石【中】', i:'4462', t:'需进化'},
        ],
        'パズドラクロス・アナ降臨！': [
            {n:'可憐的龍喚士・安娜的希石', i:'4538', t:''},
        ],
        'ハヌマーン降臨！': [
            {n:'忠心的白猿臣・哈奴曼的希石', i:'4521', t:''},
        ],
        'レイワ降臨！': [
            {n:'激動的監視者・令和', i:'5302', t:''},
        ],
        'ブラフマー降臨！': [
            {n:'金掌之創壞神・梵天的希石', i:'5484', t:''},
        ],
        'ガイノウト降臨！': [
            {n:'雷天之頑龍王・蓋洛多的希石', i:'4473', t:''},
        ],
        '協力！エルメ降臨！': [
            {n:'靜眼的骸龍契士・艾爾薇＝固', i:'3740', t:''},
        ],
        'リントヴルム降臨！': [
            {n:'冥爪之海蛇龍・林德蟲的希石', i:'5073', t:''},
        ],
        '関銀屏参上！': [
            {n:'火之希石【中】', i:'4458', t:'需进化'},
        ],
        'ガイア降臨！': [
            {n:'木之希石【中】', i:'4460', t:'需进化'},
            {n:'斷決之起源神・蓋婭的希石', i:'4508', t:''},
        ],
        'エイル降臨！': [
            {n:'冥刀之醫女神・埃爾', i:'4635', t:''},
            {n:'點陣圖・影刀之醫女神・埃爾', i:'6336', t:''},
        ],
        '超極限ドラゴンラッシュ！': [
            {n:'黑天之幻龍王・塞洛古∞的希石', i:'4557', t:''},
        ],
        'イザナミ降臨！': [
            {n:'光之希石【中】', i:'4461', t:'需进化'},
            {n:'萬象之皇妃神・伊邪那美的希石', i:'4529', t:''},
            {n:'暗之希石【中】', i:'4462', t:'需进化'},
            {n:'平定之黃泉神・伊邪那美的希石', i:'4553', t:''},
        ],
        'ビッグフット降臨！': [
            {n:'輝山之魔原獣・大腳怪的希石', i:'4550', t:''},
        ],
        '協力！ドロシー降臨！': [
            {n:'桃樂絲的銀靴', i:'5391', t:''},
            {n:'魔旅行者・桃樂西的希石', i:'5424', t:''},
        ],
        'ボーマ降臨！': [
            {n:'火之精靈王・波曼的希石', i:'4484', t:''},
        ],

        'スカアハ降臨！': [
            {n:'斯卡塔赫', i:'6474', t:''},
        ],
        'カネツグ降臨！': [
            {n:'光之希石【大】', i:'4466', t:'需进化'},
        ],
        'ヘラ・ベオーク降臨！': [
            {n:'木之希石【中】', i:'4460', t:'需进化'},
            {n:'彩王妃・赫拉・帕奧古的希石', i:'4507', t:''},
        ],
        'ゼウス・マーキュリー降臨！': [
            {n:'水之希石【中】', i:'4459', t:'需进化'},
            {n:'超覺醒宙斯・墨丘利的希石', i:'4488', t:''},
        ],
        'ノルディス降臨！': [
            {n:'解放的騎龍王・諾爾狄斯的希石', i:'4534', t:''},
        ],
        'ケプリ降臨！': [
            {n:'曉天的蒼空神・凱布利的希石', i:'4497', t:''},
        ],
        'ヘル降臨！': [
            {n:'暗之希石【大】', i:'4467', t:'需进化'},
        ],
        '協力！ガイノウト降臨！': [
            {n:'雷天之頑龍王・蓋洛多的希石', i:'4473', t:''},
        ],
        'コスモクルセイダー降臨！': [
            {n:'閃機帝・另一宇宙十字軍', i:'3157', t:''},
            {n:'閃機王・宇宙十字軍的希石', i:'4541', t:''},
        ],
        '超極限マシンラッシュ！': [
            {n:'暗之星壞機・死亡法里昂', i:'3598', t:''},
        ],
        '特殊降臨ラッシュ！': [
            {n:'黑天之幻龍王・塞洛古∞的希石', i:'4557', t:''},
        ],
        'シェヘラザード降臨！': [
            {n:'靜夜的訴說者・雪赫拉莎德的希石', i:'5174', t:''},
        ],
        'エリス降臨！': [
            {n:'厄莉絲的黃金蘋果', i:'5319', t:''},
            {n:'惑亂之狂女神・厄莉絲', i:'5318', t:''},
        ],
        'ベレト降臨！': [
            {n:'鬥爭之昂魔王・貝雷特的希石', i:'6144', t:''},
        ],
        'クンプー降臨！': [
            {n:'薫風的寵物晶片', i:'5176', t:''},
        ],
        'ヘパイストス＝ドラゴン降臨！': [
            {n:'鍛煉神・赫淮斯托斯龍的希石', i:'4474', t:''},
        ],
        'ヘラ＝ドラゴン降臨！': [
            {n:'暗黑神・赫拉龍的希石', i:'4558', t:''},
        ],

        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
        // '0000': [
        //     {n:'0000', i:'0000', t:''},
        // ],
    }

    const get_stage_list = () =>{
        let $a_groups;
        let stage_list = [];

        // 降临时间表
        $a_groups = $('.item').eq(0).find('table').eq(1).find('tr').eq(2).children('td').eq(1).find('a');

        for (let i = 0;i<$a_groups.length;i++){
            let $stage = $a_groups.eq(i);
            let stage_name = $stage.attr('title');
            stage_list.push({
                name: stage_name,
                url: $stage.attr('href'),
                img_url: $stage.find('img').attr('src'),
            });
        }

        // 突入活动
        $a_groups = $('.item').eq(0).find('table').eq(1).find('tr:nth-of-type(n+4)').find('a');
        let added_stage = {};

        for (let i = 0;i<$a_groups.length;i++){
            let $stage = $a_groups.eq(i);
            let stage_name = $stage.attr('title');
            if (stage_drop_map[stage_name] && !added_stage[stage_name]){
                stage_list.push({
                    name: stage_name,
                    url: $stage.attr('href'),
                    img_url: $stage.find('img').attr('src'),
                });
                added_stage[stage_name] = true;
            }
        }

        return stage_list;
    }

    const update_stage_info = () =>{
        let stage_list = get_stage_list();
        let $base_td = $('.item').eq(0).find('table').eq(1).find('tr').eq(2).children('td').eq(1);
        $base_td.empty();

        let $data_table = $('<table class="daily-stage-info" cellspacing="0"></table>').appendTo($base_td);

        for (let i = 0;i<stage_list.length;i++){
            let stage_info = stage_list[i];
            let $tr = $('<tr></tr>').appendTo($data_table);
            $('<td></td>').append('<a href="'+stage_info.url+'"><img src="'+stage_info.img_url+'" class="i40"> '+stage_info.name+'</a>').appendTo($tr);

            let $td = $('<td style="text-align:right;"></td>').appendTo($tr);
            if (stage_drop_map[stage_info.name]){
                let stage_drop_list = stage_drop_map[stage_info.name];
                for (let j=0;j<stage_drop_list.length;j++){
                    let info = stage_drop_list[j];
                    $td.append('<a class="drop-icon" href="/pets/'+info.i+'" title="'+info.n+'"><img src="images/pets/'+info.i+'.png" class="i40">'+(info.t ? '<span>'+info.t+'</span>' : '')+'</a>');
                }
            }else{
                $td.html('&nbsp;');
            }
        }

    }

    const main = () => {
        update_stage_info();
    }

    main();
})();