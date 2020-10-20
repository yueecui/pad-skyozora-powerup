// ==UserScript==
// @name         PAD战友网内容优化
// @namespace    https://github.com/yueecui/pad_skyozora_powerup
// @version      0.0.2
// @description  优化PAD战友网
// @icon         https://pad.skyozora.com/images/egg.ico
// @author       Yuee
// @match        *://pad.skyozora.com/stage/*
// @grant        none
// ==/UserScript==
/* globals jQuery, $, waitForKeyElements */

(function() {
    'use strict';

    const stage_note = {
        '美周郎 超地獄級 - 周瑜参上！': {
            note: '测试文字测试文字',
            skill: ['防云'],
        },
        '可憐な龍喚士 クロス級 - パズドラクロス・アナ降臨！': {
            note: '使劲！使劲！再使劲！',
            skill: ['防云'],
        }
    }

    const player_skill_map = {
        '解锁': '<img src="images/skill/skill-60.png" width="20">',
        '追击': '<img src="images/skill/skill-45.png" width="20">',
        '防绑': '<img src="images/skill/skill-52.png" width="20">',
        '防云': '<img src="images/skill/skill-54.png" width="20">',
        '防贴条': '<img src="images/skill/skill-55.png" width="20">',
        '防黑': '<img src="images/skill/skill-68.png" width="20">',
        '防废': '<img src="images/skill/skill-69.png" width="20">',
        '防毒': '<img src="images/skill/skill-70.png" width="20">',
        '破无效': '<img src="images/skill/skill-48.png" width="20">',
        '防封技': '<img src="images/skill/skill-28.png" width="20">',
        '防坐': '<img src="images/skill/skill2-11.png" width="20">',
        '火': '<img src="images/drops/Fire.png" width="20">',
        '水': '<img src="images/drops/Water.png" width="20">',
        '木': '<img src="images/drops/Wood.png" width="20">',
        '光': '<img src="images/drops/Light.png" width="20">',
        '暗': '<img src="images/drops/Dark.png" width="20">',
    }

    const addStyle = (css) => {
        const style = document.createElement('style');
        style.innerText = css;
        document.head.appendChild(style);
    }

    addStyle(`
        .stage-information, .monster-detail-block {text-align:left;}
        .monster-detail-block.sticky-on {position: sticky;top: 10px;}
        .normal-hide .normal-skill {display:none;}
        .sub-title {border-left:9px solid #ccffff; border-bottom:1px solid #ccffff; border-top:1px solid #ccffff; border-right:1px solid #ccffff; padding:.6em .8em; font-size:18px; font-weight:900;position: relative;}
        .normal-switch{position:absolute;top:12px;right:12px;padding:1px 4px;border:1px solid #7f11af;background:#2e1d4a;color:#fff;font-weight:400;font-size:12px;cursor:pointer;}
        .normal-switch::before {content: "全部";}
        .normal-switch:hover{border-color:#ffeb00;}
        .normal-hide .normal-switch{border-color:#99e8ff;background:#2e373a;color:#99e8ff;}
        .normal-hide .normal-switch::before {content: "先制";}

        .sticky-switch{position:absolute;top:12px;right:56px;padding:1px 4px;border:1px solid #7f11af;background:#2e1d4a;color:#fff;font-weight:400;font-size:12px;cursor:pointer;}
        .sticky-switch::before {content: "固定";}
        .sticky-switch:hover{border-color:#ffeb00;}
        .sticky-on .sticky-switch{border-color:#99e8ff;background:#2e373a;color:#99e8ff;}
        .sticky-on .sticky-switch::before {content: "悬浮";}

        .monster-detail{width:100%;font-size:14px;}
        .monster-detail td{padding:4px 0;border-bottom:1px solid #444;}
        .monster-detail tr td:nth-of-type(1){width:50px;text-align:center;}
        .stage-note {width:100%;font-size:14px}
        .stage-note th{padding:4px 0;border-bottom:1px solid #444}
        .stage-note td{padding: 5px 0 15px;}
        .stage-note img+img {margin-left: 3px;}
        .stage-summary {width:100%;font-size:14px}
        .stage-summary th{padding:4px 0;border-bottom:1px solid #444}
        .stage-summary td{padding:4px 0;border-bottom:1px solid #444}
        .stage-summary img+img {margin-left: 3px;}

    `);

    const skill_detail_map = [
        {t: 'indexOf', find: '隨機生成<img src="images/drops/Poison.png" width="20">', action: 'flagOn', flag: '转毒'},
        {t: 'indexOf', find: '寶珠變成<img src="images/drops/Poison.png" width="20">', action: 'flagOn', flag: '转毒'},
        {t: 'indexOf', find: '<img src="images/change.gif"> <img src="images/drops/Poison.png" width="20">', action: 'flagOn', flag: '转毒'},
        {t: 'RegExp', re: /所有寶珠變為.*?<img src="images\/drops\/Poison\.png" width="20">/, action: 'flagOn', flag: '转毒'},

        {t: 'indexOf', find: '隨機生成<img src="images/drops/Poison+.png" width="20">', action: 'flagOn', flag: '转强毒'},
        {t: 'indexOf', find: '寶珠變成<img src="images/drops/Poison+.png" width="20">', action: 'flagOn', flag: '转强毒'},
        {t: 'indexOf', find: '<img src="images/change.gif"> <img src="images/drops/Poison+.png" width="20">', action: 'flagOn', flag: '转强毒'},
        {t: 'RegExp', re: /所有寶珠變為.*?<img src="images\/drops\/Poison\+\.png" width="20">/, action: 'flagOn', flag: '转强毒'},

        {t: 'RegExp', re: /所有寶珠變為.*?<img src="images\/drops\/Dead\.png" width="20">/, action: 'flagOn', flag: '转废'},
        {t: 'indexOf', find: '隨機生成<img src="images/drops/Dead.png" width="20">', action: 'flagOn', flag: '转废'},
        {t: 'indexOf', find: '寶珠變成<img src="images/drops/Dead.png" width="20">', action: 'flagOn', flag: '转废'},
        {t: 'indexOf', find: '<img src="images/change.gif"> <img src="images/drops/Dead.png" width="20">', action: 'flagOn', flag: '转废'},

        {t: 'indexOf', find: '隨機生成<img src="images/drops/Bomb.png" width="20">', action: 'flagOn', flag: '转炸弹'},
        {t: 'indexOf', find: '寶珠變成<img src="images/drops/Bomb.png" width="20">', action: 'flagOn', flag: '转炸弹'},
        {t: 'indexOf', find: '<img src="images/change.gif"> <img src="images/drops/Bomb.png" width="20">', action: 'flagOn', flag: '转炸弹'},

        {t: 'indexOf', find: '隨機生成<img src="images/drops/Bomb_Lock.png" width="20">', action: 'flagOn', flag: '转锁炸弹'},
        {t: 'indexOf', find: '寶珠變成<img src="images/drops/Bomb_Lock.png" width="20">', action: 'flagOn', flag: '转锁炸弹'},
        {t: 'indexOf', find: '<img src="images/change.gif"> <img src="images/drops/Bomb_Lock.png" width="20">', action: 'flagOn', flag: '转锁炸弹'},

        {t: 'RegExp', re: /所有寶珠變為(.+?)(?:，.*)?(?:\s<.*)?$/, action: 'setValue', flag: '洗版'},

        {t: 'RegExp', re: /(\d+)回合內，.*?<img src="images\/drops\/Poison\.png" width="20"\s?\/?>.*?的掉落機率提升(\d+)%/, action: 'setValue', flag: '毒珠掉率'},
        {t: 'RegExp', re: /(\d+)回合內，.*?<img src="images\/drops\/Poison\+\.png" width="20"\s?\/?>.*?的掉落機率提升(\d+)%/, action: 'setValue', flag: '强毒珠掉率'},
        {t: 'RegExp', re: /(\d+)回合內，.*?<img src="images\/drops\/Dead\.png" width="20"\s?\/?>.*?的掉落機率提升(\d+)%/, action: 'setValue', flag: '废珠掉率'},

        {t: 'RegExp', re: /(\d+)回合內，有(\d+)%機率隨機鎖定掉落的寶珠/, action: 'setValue', flag: '锁珠掉率'},
        {t: 'RegExp', re: /(\d+)回合內，有(\d+)%機率掉落超暗闇寶珠/, action: 'setValue', flag: '超暗珠掉率'},

        {t: 'RegExp', re: /(\d+)回合內，所有寶珠會以鎖定狀態掉落/, action: 'setValue', flag: '必掉落锁珠'},

        {t: 'RegExp', re: /封鎖(.+)寵物(\d+~?\d?)回合/, action: 'setValue', flag: '封锁'},
        {t: 'RegExp', re: /(\d+)回合內，隨機將1個隊員換成隊長/, action: 'setValue', flag: '换队长'},
        {t: 'RegExp', re: /(\d+)回合內，覺醒技能無效化/, action: 'setValue', flag: '觉醒无效'},

        {t: 'RegExp', re: /(\d+~?\d?)回合內，無法發動任何主動技能/, action: 'setValue', flag: '封技'},
        {t: 'RegExp', re: /當前所有技能的冷卻時間增加 (\d+~?\d?) 回合/, action: 'setValue', flag: '坐下'},
        {t: 'RegExp', re: /(\d+)回合內，寶珠移動時間減少(\d+)秒/, action: 'setValue', flag: '转珠时间减少'},
        {t: 'RegExp', re: /(\d+)回合內，寶珠移動時間變成原來的(\d+)%/, action: 'setValue', flag: '转珠时间减少%'},
        {t: 'RegExp', re: /(\d+)回合內，攻擊力變成原來的(\d+)%/, action: 'setValue', flag: '攻击力减少%'},
        {t: 'RegExp', re: /(\d+)回合內，回復力變成原來的(\d+)%/, action: 'setValue', flag: '回复力减少%'},

        {t: 'indexOf', find: '隱藏全畫面的寶珠', action: 'flagOn', flag: '全黑'},
        {t: 'RegExp', re: /(\d+)回合內，(.+)變成超暗闇狀態/, action: 'setValue', flag: '超暗'},

        {t: 'RegExp', re: /(\d+)回合內，(.+)無法被消除/, action: 'setValue', flag: '无法消除'},
        {t: 'RegExp', re: /(\d+)回合內，盤面上出現大小為 (.+) 的雲遮擋寶珠/, action: 'setValue', flag: '云雾'},
        {t: 'RegExp', re: /(\d+)回合內，(.+?)上的寶珠每隔(\d+)秒不斷轉換/, action: 'setValue', flag: '宝珠变换'},

        {t: 'RegExp', re: /將(.+?)鎖定/, action: 'setValue', flag: '宝珠锁定'},
        {t: 'RegExp', re: /(\d+)回合內，無法移動(.+)的寶珠/, action: 'setValue', flag: '贴条'},

        {t: 'RegExp', re: /造成玩家目前HP(\d+)%的傷害/, action: 'setValue', flag: '重力'},

        {t: 'RegExp', re: /(\d+)回合內異常狀態（如毒、威嚇、破防）無效化/, action: 'setValue', flag: '状态无效'},
        {t: 'RegExp', re: /(\d+)回合內，將受到的(.+)屬性傷害轉換成自己的生命值/, action: 'setValue', flag: '属吸'},

        {t: 'RegExp', re: /HP在上限(\d+)%或以上的話，受到致命傷害時，將會以1點HP生還/, action: 'setValue', flag: '根性'},
        {t: 'RegExp', re: /HP在上限(\d+)%或以上的話，受到致命傷害時，將會以(\d+)%HP生還/, action: 'setValue', flag: '高回血根性'},
        
        {t: 'RegExp', re: /(\d+)回合內，受到的屬性傷害減少(\d+)%/, action: 'setValue', flag: '减伤盾'},
        {t: 'RegExp', re: /受到的(.+)屬性傷害減少(\d+)%/, action: 'setValue', flag: '属性减伤盾'},
        {t: 'RegExp', re: /由(.+)類寵物造成的傷害減少(\d+)%/, action: 'setValue', flag: '类型减伤盾'},

        {t: 'RegExp', re: /(\d+)回合內，將 (\d+)COMBO 或以下時所造成的傷害全部吸收/, action: 'setValue', flag: '连击盾'},
        {t: 'RegExp', re: /(\d+)回合內，單一傷害值在 (.+) 點以上的傷害無效化/, action: 'setValue', flag: '伤害无效盾'},
        {t: 'RegExp', re: /(\d+)回合內，將單一傷害值在 (.+) 點以上的傷害吸收/, action: 'setValue', flag: '伤害吸收盾'},
    ]

    const flag_show_html = {
        '转毒': {a: 'text', t: '<img src="images/skill/skill-70.png" width="20"> 转换出<img src="images/drops/Poison.png" width="20">', sk: '防毒'},
        '转强毒': {a: 'text', t: '<img src="images/skill/skill-70.png" width="20"> 转换出<img src="images/drops/Poison+.png" width="20">', sk: '防毒'},
        '转废': {a: 'text', t: '<img src="images/skill/skill-69.png" width="20"> 转换出<img src="images/drops/Dead.png" width="20">', sk: '防废'},
        '转炸弹': {a: 'text', t: '<img src="images/skill/skill-69.png" width="20"> 转换出<img src="images/drops/Bomb.png" width="20">', sk: '防废'},
        '转锁炸弹': {a: 'text', t: '<img src="images/skill/skill-69.png" width="20"> 转换出<img src="images/drops/Bomb_Lock.png" width="20">', sk: '防废'},

        '洗版': {a: 'replace', t: '洗版(<value.0>)'},

        '毒珠掉率': {a: 'replace', t: '<img src="images/drops/Poison.png" width="20">掉率提升(<value.1>%)(<value.0>回合)'},
        '强毒珠掉率': {a: 'replace', t: '<img src="images/drops/Poison+.png" width="20">掉率提升(<value.1>%)(<value.0>回合)'},
        '废珠掉率': {a: 'replace', t: '<img src="images/drops/Dead.png" width="20">掉率提升(<value.1>%)(<value.0>回合)'},
        '锁珠掉率': {a: 'replace', t: '锁珠掉率提升(<value.1>%)(<value.0>回合)'},
        '超暗珠掉率': {a: 'replace', t: '超暗珠掉率提升(<value.1>%)(<value.0>回合)'},
        
        '必掉落锁珠': {a: 'replace', t: '必掉落锁珠(<value.0>回合)'},

        '封锁': {a: 'replace', t: '<img src="images/skill/skill-52.png" width="20"> 封锁<value.0>宠物(<value.1>回合)', sk: '防绑'},
        '换队长': {a: 'replace', t: '换队长(随机队员)(<value.0>回合)', text: '换队长'},
        '觉醒无效': {a: 'replace', t: '觉醒无效(<value.0>回合)', text: '觉醒无效'},

        '封技': {a: 'replace', t: '<img src="images/skill/skill-28.png" width="20"> 封技(<value.0>回合)', sk: '防封技'},
        '坐下': {a: 'replace', t: '<img src="images/skill/skill2-11.png" width="20"> 坐下(<value.0>回合)', sk: '防坐'},
        '转珠时间减少': {a: 'replace', t: '转珠时间减少<value.1>秒(<value.0>回合)'},
        '转珠时间减少%': {a: 'replace', t: '转珠时间变为<value.1>%(<value.0>回合)'},
        '攻击力减少%': {a: 'replace', t: '<img src="images/skill/skill-66.png" width="20"> 攻击力变为<value.1>%(<value.0>回合)'},
        '回复力减少%': {a: 'replace', t: '<img src="images/skill/skill-67.png" width="20"> 回复力变为<value.1>%(<value.0>回合)'},

        '全黑': {a: 'text', t: '<img src="images/skill/skill-68.png" width="20"> 宝珠全黑', sk: '防黑'},
        '超暗': {a: 'replace', t: '<img src="images/skill/skill-68.png" width="20"> 宝珠变超暗(<value.1>)(<value.0>回合)', sk: '防黑'},

        '无法消除': {a: 'replace', t: '<value.1>无法被消除(<value.0>回合)'},
        '云雾': {a: 'replace', t: '<img src="images/skill/skill-54.png" width="20"> 出现 <value.1> 云雾(<value.0>回合)', sk: '防云'},
        '宝珠变换': {a: 'replace', t: '宝珠变换(<value.1>)(间隔<value.2>秒/<value.0>回合)'},
        '宝珠锁定': {a: 'replace', t: '<img src="images/skill/skill-60.png" width="20"> 宝珠锁定(<value.0>)', sk: '解锁'},
        '贴条': {a: 'replace', t: '<img src="images/skill/skill-55.png" width="20"> 贴条(<value.1>)(<value.0>回合)', sk: '防贴条'},

        '重力': {a: 'replace', t: '重力(<value.0>%)'},

        '状态无效': {a: 'replace', t: '状态无效(<value.0>回合)'},
        '属吸': {a: 'replace', t: '<value.1>属性吸收(<value.0>回合)', ab: 1},
        '根性': {a: 'replace', t: '<img src="images/skill/skill-45.png" width="20"> 根性(<value.0>%)', sk: '追击'},
        '高回血根性': {a: 'replace', t: '黄根性(<value.0>%发动/<value.1>%回复)'},
        '减伤盾': {a: 'replace', t: '减伤盾(<value.1>%)(<value.0>回合)'},
        '属性减伤盾': {a: 'replace', t: '<value.0>属性减伤盾(<value.1>%)'},
        '类型减伤盾': {a: 'replace', t: '<value.0>类减伤盾(<value.1>%)'},
        '连击盾': {a: 'replace', t: '<value.1>C连击盾(<value.0>回合)', combo: 1},
        '伤害无效盾': {a: 'replace', t: '<img src="images/skill/skill-48.png" width="20"> 伤害<span style="color:#ffff00">无效</span>盾(<value.1>以上)(<value.0>回合)', sk: '破无效'},
        '伤害吸收盾': {a: 'replace', t: '伤害<span style="color:#99ef88">吸收</span>盾(<value.1>以上)(<value.0>回合)', text: '伤害吸收盾'},
    }


    const update_monster_flag = (monster_info, skill_info, detail, value) => {
        monster_info.has_flag = true;
        switch(detail.action){
            case 'flagOn':
                monster_info.flag[skill_info.type].push({f: detail.flag});
                break;
            case 'setValue':
                monster_info.flag[skill_info.type].push({f: detail.flag, v: value});
            default:
                break;
        }
    }

    const update_skill_detail = monster_info =>{
        for (let skill_info of monster_info.skill){
            let found_detail = false;
            for (let detail of skill_detail_map){
                switch (detail.t){
                    case 'indexOf':
                        if (skill_info.desc.indexOf(detail.find) > -1){
                            update_monster_flag(monster_info, skill_info, detail);
                        }
                        break;
                    case 'RegExp':
                        let test_re = detail.re.exec(skill_info.desc);
                        if (test_re){
                            update_monster_flag(monster_info, skill_info, detail, test_re.slice(1));
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // type: 0=固有特性, 1=先制使用, 2=普通, 3=死亡时是呀，-1=未知类型
    const check_skill_line = skill_line => {
        let skill_info = {
            name: '',
            type: 2,
            desc: '',
        };

        let skill_split = skill_line.split('：');
        if (skill_split.length == 1){
            if (skill_line.indexOf('[固有特性]') > -1){
                skill_info.type = 0;
                skill_info.desc = $('<div></div>').append(skill_line).text().replace('[固有特性]', '').trim();
            }else{
                return null;
            }
        }else if (skill_split.length == 2){
            let $skill_name_part = $('<div></div>').append(skill_split[0]).find('span');

            if ($skill_name_part.length == 1){
                skill_info.name = $skill_name_part.text();
            }else if ($skill_name_part.length == 2){
                skill_info.name = $skill_name_part.eq(1).text();
                let skill_type = $skill_name_part.eq(0).text();
                switch(skill_type){
                    case '[固有特性]':
                        skill_info.type = 0;
                        break;
                    case '[先制使用]':
                        skill_info.type = 1;
                        break;
                    case '[死亡時使用]':
                        skill_info.type = 3;
                        break;
                    case '':
                        break;
                    default:
                        console.error('错误的skill_part：', $skill_name_part);
                        skill_info.type = -1;                    
                }
            }
            skill_info.desc = skill_split[1];

        }else{
            console.error('意料外的skill_split长度：', skill_split);
            return null;
        }

        return skill_info;
    }

    const find_all_monster_info = () => {
        let all_monster_info = [];

        let $all_tr = $('#StageInfo>table>').eq(1).children('tbody>tr');
        let stage_info_db = {}

        for (let i=1;i<$all_tr.length;i++){
            let tr_base = $all_tr.eq(i);
            let $title = tr_base.find('a').eq(0);
            if ($title.attr('href') == undefined){
                $title = tr_base.find('a').eq(1);
            }

            let title = $title.attr('title');

            if (title == undefined){
                continue;
            }else{
                i = i + 1;
            }

            let monster_info = {
                id: '',
                name: '',
                skill: [],
                flag: {
                    0: [],
                    1: [],
                    2: [],
                    3: [],
                },
                has_flag: false,
            };
            [monster_info.id, monster_info.name] = title.split(' - ');

            let td_skill = $all_tr.eq(i).children('td');
            if (td_skill.length != 1){
                console.error('需要检查的单元格：', td_skill);
            }

            let skill_lines = td_skill.html().split('<br>');
            for (let j=0;j<skill_lines.length;j++){
                let skill_info = check_skill_line(skill_lines[j]);
                if (!skill_info) {continue;}
                monster_info.skill.push(skill_info);
            }

            update_skill_detail(monster_info);

            all_monster_info.push(monster_info);
        }

        return all_monster_info;
    }

    const get_prevent_detail = (all_monster_info) => {
        let prevent_detail = {
            absorb: {
                '火': false,
                '水': false,
                '木': false,
                '光': false,
                '暗': false,
            },
            has_absorb: false,

            first: {},
            has_first: false,
            normal: {},
            has_normal: false,

            text: [],
            max_combo: 0,
        };

        let has_text = {};
        let normal_count = 0;

        for (let monster_info of all_monster_info){
            for (let flag_type of [0, 1, 2, 3]){
                for (let flag_info of monster_info.flag[flag_type]){
                    let flag_setting = flag_show_html[flag_info.f];
                    if (flag_setting.sk){
                        switch(flag_type){
                            case 0:
                            case 1:
                                prevent_detail.first[flag_setting.sk] = true;
                                if (prevent_detail.normal[flag_setting.sk]){
                                    prevent_detail.normal[flag_setting.sk] = false;
                                    normal_count -= 1;
                                }
                                prevent_detail.has_first = true;
                                break;
                            case 2:
                                if (!prevent_detail.first[flag_setting.sk]){
                                    prevent_detail.normal[flag_setting.sk] = true;
                                    normal_count += 1;
                                }
                        }
                    }else if (flag_setting.ab){
                        prevent_detail.has_absorb = true;
                        for (let element of flag_info.v[flag_setting.ab].split('、')){
                            prevent_detail.absorb[element] = true;
                        }
                    }else if (flag_setting.combo){
                        let max_combo = parseInt(flag_info.v[flag_setting.combo]);
                        prevent_detail.max_combo = max_combo > prevent_detail.max_combo ? max_combo : prevent_detail.max_combo;
                    }else if (flag_setting.text){
                        if (!has_text[flag_setting.text]){
                            prevent_detail.text.push(flag_setting.text);
                            has_text[flag_setting.text] = true;
                        }
                    }
                }
            }
        }

        prevent_detail.has_normal = normal_count > 0;

        return prevent_detail;
    }

    const create_stage_summary_block = (all_monster_info) =>{
        let $base = $('#wrapper>table:nth-of-type(3)>tbody>tr>td:nth-of-type(3)')
        if (all_monster_info.length == 0){ return; }
        let stage_name = $('head>title').text().replace('- Puzzle & Dragons 戰友系統及資訊網', '').trim();
        let $top = $('.stage-information');
        if ($top.length == 1){
            $top.empty();
        }else{
            $top = $('<div class="stage-information"></div>').appendTo($base);
        }
        let $monster_detail = $('.monster-detail-block');
        if ($monster_detail.length == 1){
            $monster_detail.empty();
        }else{
            $monster_detail = $('<div class="monster-detail-block sticky-on normal-hide"></div>').appendTo($base);
        }

        let $stage_note_block = $('<div class="stage-note-block"></div>').appendTo($top);
        // 手工笔记
        if (stage_note[stage_name]){
            $stage_note_block.append('<div class="sub-title">笔记</div>');
            let $note_table = $('<table class="stage-note" cellspacing="0"></table>').appendTo($stage_note_block);
            if (stage_note[stage_name].note != ''){
                $note_table.append('<tr><th>说明</td></tr>');
                $note_table.append('<tr><td>'+stage_note[stage_name].note+'</td></tr>');
            }
            if (stage_note[stage_name].skill && stage_note[stage_name].skill.length > 0){
                $note_table.append('<tr><th>推荐技能</td></tr>');
                let $td = $('<td></td>').appendTo($('<tr></tr>').appendTo($note_table));
                for (let skill of stage_note[stage_name].skill){
                    $td.append(player_skill_map[skill]);
                }
            }
        }

        // 预防技能总结
        let prevent_detail = get_prevent_detail(all_monster_info);
        // console.log(prevent_detail);
        if (prevent_detail.has_first || prevent_detail.has_normal){
            $stage_note_block.append('<div class="sub-title">总结</div>');
            let $note_table = $('<table class="stage-summary" cellspacing="0"></table>').appendTo($stage_note_block);
            let $tr, $td;
            if (prevent_detail.has_first){
                $tr = $('<tr></tr>').appendTo($note_table);
                $tr.append('<th>先制应对</td>');
                $td = $('<td></td>').appendTo($tr);
                for (let skill_name of Object.keys(player_skill_map)){
                    if (prevent_detail.first[skill_name]){
                        $td.append(player_skill_map[skill_name]);
                    }
                }
            }
            if (prevent_detail.has_normal){
                $tr = $('<tr></tr>').appendTo($note_table);
                $tr.append('<th>后续应对</td>');
                $td = $('<td></td>').appendTo($tr);
                for (let skill_name of Object.keys(player_skill_map)){
                    if (prevent_detail.normal[skill_name]){
                        $td.append(player_skill_map[skill_name]);
                    }
                }
            }
            if (prevent_detail.has_absorb){
                $tr = $('<tr></tr>').appendTo($note_table);
                $tr.append('<th>属性吸收</td>');
                $td = $('<td></td>').appendTo($tr);
                for (let elemnet_name of Object.keys(prevent_detail.absorb)){
                    if (prevent_detail.absorb[elemnet_name]){
                        $td.append(player_skill_map[elemnet_name]);
                    }
                }
            }
            if (prevent_detail.max_combo > 0 || prevent_detail.text.length > 0){
                let text_list = [];
                if (prevent_detail.max_combo > 0){text_list.push(prevent_detail.max_combo+'C连击盾');}
                text_list = text_list.concat(prevent_detail.text);
                $tr = $('<tr></tr>').appendTo($note_table);
                $tr.append('<th>其他特效</td>');
                $td = $('<td>'+text_list.join('，')+'</td>').appendTo($tr);
            }
        }

        $monster_detail.append('<div class="sub-title">简要技能信息<div class="normal-switch"></div><div class="sticky-switch"></div></div>');
        let $table = $('<table class="monster-detail" cellspacing="0"></table>').appendTo($monster_detail);
        $table.append('<tr><td>敌人</td><td>特性</td></tr>');

        for (let monster_info of all_monster_info){
            if (!monster_info.has_flag) {continue;}
            let $tr = $('<tr></tr>').appendTo($table);
            $tr.append('<td><a href="pets/'+monster_info.id+'" class="tooltip" title="'+monster_info.id+' - '+monster_info.name+'"><img src="images/pets/'+monster_info.id+'.png" width="25"></a></td>')

            let $td = $('<td></td>').appendTo($tr);
            let only_normal_skill = true;
            for (let type of [0, 1, 3, 2]){
                for (let flag_info of monster_info.flag[type]){
                    if ($td.text().length > 0){
                        if (type == 2){
                            $td.append('<br class="normal-skill">');
                        }else{
                            $td.append('<br>');
                        }
                    }
                    let show_info = flag_show_html[flag_info.f];
                    let show_text = show_info.t;
                    switch(show_info.a){
                        case 'replace':
                            for (let index=0;index<flag_info.v.length;index++){
                                show_text = show_text.replace('<value.'+index+'>', flag_info.v[index]);
                            }
                            break;
                    }
                    switch(type){
                        case 0:
                            show_text = '<span class="skill" style="color:#99e8ff">[固有] ' + show_text + '</span>';
                            only_normal_skill = false;
                            break;
                        case 1:
                            show_text = '<span class="skill" style="color:#99e8ff">[先制] ' + show_text + '</span>';
                            only_normal_skill = false;
                            break;
                        case 2:
                            show_text = '<span class="skill normal-skill">' + show_text + '</span>';
                            break;
                        case 3:
                            show_text = '<span class="skill" style="color:#99e8ff">[死亡] ' + show_text + '</span>';
                            only_normal_skill = false;
                            break;
                    }
                    $td.append(show_text);
                }
            }
            if (only_normal_skill) {
                $tr.addClass('normal-skill');
            }
        }
    }

    $('body').on('mousedown', '.normal-switch', function(){
        let $stage = $(this).parents('.monster-detail-block');
        if ($($stage).hasClass('normal-hide')){
            $($stage).removeClass('normal-hide');
        }else{
            $($stage).addClass('normal-hide');
        }
    });
    $('body').on('mousedown', '.sticky-switch', function(){
        let $stage = $(this).parents('.monster-detail-block');
        if ($($stage).hasClass('sticky-on')){
            $($stage).removeClass('sticky-on');
        }else{
            $($stage).addClass('sticky-on');
        }
    });

    console.log(find_all_monster_info());
    create_stage_summary_block(find_all_monster_info());
})();