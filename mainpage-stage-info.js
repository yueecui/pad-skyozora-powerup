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

    const get_stage_list = ($base) =>{
        let $a_groups = $base.find('a');
        let stage_list = [];

        for (let i = 0;i<$a_groups.length;i++){
            let $stage = $a_groups.eq(i);
            let stage_info = {
                name: $stage.attr('title'),
                url: $stage.attr('href'),
                img_url: $stage.find('img').attr('src'),
            }
            stage_list.push(stage_info);
        }
        return stage_list;
    }

    const update_stage_info = () =>{
        const $base_td = $('.item').eq(0).find('table').eq(1).find('tr').eq(2).children('td').eq(1);
        let stage_list = get_stage_list($base_td);
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