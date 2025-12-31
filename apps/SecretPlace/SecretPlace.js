import { plugin, verc, data, config } from '../../api/api.js';

import {
  Read_player,
  existplayer,
  isNotNull,
  sleep,
  exist_najie_thing,
  Add_najie_thing,

} from '../../model/xiuxian.js';

import {
  Add_灵石,
  Add_修为,
   Add_血气,
   Add_寿元,
  exist_hunyin,
  find_qinmidu,
  add_qinmidu,
  Goweizhi,
  Write_player,
  xunbaoweizhi,
  Go,
  channel,
  Read_renwu,
  Write_renwu,
  find_renwu,
} from '../../model/xiuxian.js';
import Show from "../../model/show.js";
import puppeteer from "../../../../lib/puppeteer/puppeteer.js";
export class SecretPlace extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_SecretPlace',
      dsc: '修仙模块',
      event: 'message',
      priority: 600,
      rule: [
        {
  reg: '^#去$',
  fnc: 'quickReplay',
},
        {
          reg: '^#修仙状态|#状态$',
          fnc: 'Xiuxianstate',
        },
        {
          reg: '^#秘境$',
          fnc: 'Secretplace',
        },
        {
          reg: '^#降临秘境.*$',
          fnc: 'Gosecretplace',
        },
        {
          reg: '^#禁地$',
          fnc: 'Forbiddenarea',
        },
        {
          reg: '^#前往禁地.*$',
          fnc: 'Goforbiddenarea',
        },
        {
          reg: '^#仙府$',
          fnc: 'Timeplace',
        },
        {
          reg: '^#探索仙府$',
          fnc: 'GoTimeplace',
        },
        {
          reg: '^#仙境$',
          fnc: 'Fairyrealm',
        },
        {
          reg: '^#镇守仙境.*$',
          fnc: 'Gofairyrealm',
        },
        {
          reg: '^#逃离',
          fnc: 'Giveup',
        },
        {
          reg: '^#寻宝$',
          fnc: 'xunbao',
        },
          {
          reg: '^#遮天位面',
          fnc: 'zhetian',
        },
        {
          reg: '^#前往遮天位面.*$',
          fnc: 'Gozhetian',
        },
          {
          reg: '^#上苍之上',
          fnc: 'shangcang',
        },
          {
          reg: '^#下界八域',
          fnc: 'xiajie',
        },
        {
          reg: '^#前往下界八域.*$',
          fnc: 'Goxiajie',
        },
                     {
          reg: '^#九天十地',
          fnc: 'jiutianshidi',
        },
                {
          reg: '^#前往九天十地.*$',
          fnc: 'Gojiutianshidi',
        },
           {
          reg: '^#界海',
          fnc: 'jiehai',
        },
          {
          reg: '^#探索界海.*$',
          fnc: 'Gojiehaiplace',
        },
         {
          reg: '^#激活五色祭坛',
          fnc: 'wusejitan',
        },
                 {
          reg: '^#副本掉落\s*',
          fnc: 'handleDungeonDrop',
        },
       {
  reg: '^#穿梭(凡间|仙界|下界八域|仙域|遮天位面|九天十地|界海|时间长河|永恒未知之地)$',
  fnc: 'goToLocation'
},
{
  reg: '^#接引',
  fnc: 'jieyinPlayer'
},
{
  reg: '^#送往',
  fnc: 'sendPlayerToLocation'
}
      ],
    });
  }
async goToLocation(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
     usr_qq = await channel(usr_qq);
    const player = await Read_player(usr_qq);
    
    // 解析目标地点
    const location = e.msg.match(/^#穿梭(凡间|仙界|下界八域|九天十地|遮天位面|界海|时间长河|永恒未知之地|仙域)$/)[1];
    
    // 地点映射表
    const LOCATION_MAP = {
        '凡间': 0,
        '仙界': 1, 
        '下界八域': 1.5,
        '遮天位面': 2,
        '九天十地': 2.5,
        '界海': 3,
        '时间长河': 4,
        '永恒未知之地': 5,
        '仙域': 6
    };
    
    // 检查是否有效地点
    if (!LOCATION_MAP.hasOwnProperty(location)) {
        return e.reply(`无效地点：${location}\n可用地点：凡间、仙界、下界八域、遮天位面、九天十地、仙域、界海、时间长河、永恒未知之地`);
    }
    
    const targetLocation = LOCATION_MAP[location];
    if (player.level_id < 42||player.Physique_id < 42) {
        // 辰东风格文案
        const messages = [
            `你必须成就地仙，肉身成圣后才能承受住穿梭空间的能量风暴`,
        ];
        
         e.reply(messages);
        return;
    }
    // 检查是否已在目标地点
    if (player.power_place === targetLocation) {
        return e.reply(`你已经在${location}了`);
    }
    
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
    
    // 检查是否拥有位面传送次数
    const hasTeleportToken = player.位面传送次数 > 0;
    const isSpecialLocation = ['仙域', '时间长河', '永恒未知之地'].includes(location);
    
    // 如果有传送次数且不是特殊地点，可以无视条件
    if (hasTeleportToken && !isSpecialLocation) {
        // 构建传送消息
        const teleportMsg = [
            `【位面传送阵·破碎虚空】`,
            `你祭出场域宗师刻写的传送阵纹，`,
            `阵图瞬间迸发亿万缕空间道则：`,
            `「嗡——」虚空震颤，阵纹交织成星空古路`,
            `五色祭坛虚影浮现，洒落漫天星辉`,
            `周围空间如水波般荡漾，星辰在脚下流转`,
            `你感受到时空法则的撕扯，肉身几近崩裂`,
            `「横渡虚空，非大能不可为！」`,
            `阵纹中传出场域宗师的烙印低语：`,
            `"此阵乃摹刻五色祭坛道纹所制，仅能使用一次"`,
            `星空古路尽头，${location}逐渐清晰`,
            `你成功跨越无尽星域，抵达彼岸`,
            `阵纹耗尽最后一丝神能，化作光雨消散`,
            `※ 位面传送次数 -1（剩余：${player.位面传送次数 - 1}次）`
        ].join('\n');
        
        // 扣除传送次数
        player.位面传送次数 -= 1;
        player.power_place = targetLocation;
        await Write_player(usr_qq, player);
        return e.reply(teleportMsg);
    }
    
    // 以下是常规传送逻辑（没有使用传送次数或前往特殊地点）
    
    // 特殊地点检查
    if (location === '时间长河') {
        if (player.mijinglevel_id < 20 && player.xiangulevel_id < 20) {
            return e.reply([
                `【时间长河·境界不足】`,
                `时间长河乃万古岁月汇聚之地，`,
                `唯有准仙帝级强者方可踏足！`,
                `你当前境界不足，无法进入。`,
            ].join('\n'));
        }
    }
    
    if (location === '永恒未知之地') {
        if (player.mijinglevel_id < 21 && player.xiangulevel_id < 21) {
            return e.reply([
                `【永恒未知之地·境界不足】`,
                `永恒未知之地乃超脱诸天之外的存在，`,
                `唯有仙帝级强者方可踏足！`,
                `你当前境界不足，无法进入。`,
            ].join('\n'));
        }
    }

    const now_level_id = data.Level_list.find(
        item => item.level_id == player.level_id
    ).level_id;
    
    // 境界不足检查
    if (location === '仙界' && now_level_id < 42 && player.lunhui == 0) {
        return e.reply([
            `【轮回未启】`,
            `仙境乃仙人之地，非成仙者不可入！`,
            `道友当前并未成仙，无法踏足仙境。`,
        ].join('\n'));
    }
    
    // 遮天位面传送条件检查
    if (location === '遮天位面') {
        if (player.mijinglevel_id < 12 && player.xiangulevel_id <= 10) {
            if (player.五色祭坛激活 !== 1) {
                return e.reply([
                    `【遮天宇宙·前路未明】`,
                    `北斗星域遥在无尽星海之外，非圣人/天神级别的强者难以肉身横渡星海！`,
                    `你立于星空古路前，眸中神光闪烁，试图洞穿虚空：`,
                    `"茫茫宇宙，何处是北斗？"`,
                    ``,
                    `忽闻一声叹息自虚空传来：`,
                    `"不成圣，终为蝼蚁！不化天神，难渡星海！欲往遮天，当寻五色祭坛！"`,
                    ``,
                    `你忆起古籍记载：`,
                    `- 五色祭坛乃上古先民所筑，可接引九龙拉棺`,
                    `- 九龙拉棺乃横渡星域之无上法器（听闻凡间秘境荧惑古星可以寻到五色祭坛的踪迹）`,
                    `- 唯此方可抵达那荒古禁地所在的北斗星域`,
                    ``,
                    `你当前：`,
                    `秘境体系：${player.mijinglevel_id}级（未成圣人）`,
                    `仙古今世法：${player.xiangulevel_id}级（未成天神）`,
                    `五色祭坛：${player.五色祭坛 === 1 ? '已寻得' : '未寻得'}`,
                    `激活状态：${player.五色祭坛激活 === 1 ? '已激活' : '未激活'}`,
                    ``,
                    `需踏遍诸天，寻得五色祭坛，并且激活方可启程！`
                ].join('\n'));
            }
        }
    }
    
    // 在特殊地点检查部分添加仙域条件
    if (location === '仙域') {
        if (player.mijinglevel_id < 18 && player.xiangulevel_id < 16) {
            return e.reply([
                `【仙域壁垒·境界不足】`,
                `仙域乃诸天至高净土，非仙王者不可入！`,
                `你立于仙域壁垒前，感受到无上威压：`,
                ``,
                `- 仙域界壁流淌着原始真解之力`,
                `- 唯有凝聚出完整王印者方可叩关`,
                `- 仙域法则排斥一切未达仙王境的生灵`,
                ``,
                `「不成仙王，终是蝼蚁...」`,
                `界壁后传来冷漠的道音`
            ].join('\n'));
        }
    }

    // 凡间特殊检查（如果是仙帝以上境界）
    if (location === '凡间' && (player.mijinglevel_id > 20 || player.xiangulevel_id > 20)) {
        return e.reply([
            `【仙帝下凡·天地不容】`,
            `你身为仙帝级强者，帝威浩荡！`,
            `凡间世界无法承受你的存在，`,
            `强行下凡将导致位面崩溃！`,
            `请收敛气息或压制境界后再尝试。`
        ].join('\n'));
    }
    
    // 计算传送消耗（每差1级增加1000万修为和1500万血气）
    const distance = Math.abs(player.power_place - targetLocation);
    const xiuweiCost = distance * 10000000;
    const qixueCost = distance * 15000000;
    const shouyuanCost = distance * 10000;
    
    // 计算传送时间（每差1级增加5分钟，最低5分钟）
    let travelTime = Math.max(5, distance * 5); // 至少5分钟
    let timeReduction = 0;
    let allMsgs = [];

    // ==== 鲲鹏宝术检查 ====
    if (player.学习的功法.includes('鲲鹏宝术')) {
        let kunpengReduction = 3;
        const kunpengTexts = [
            `【鲲鹏极速·扶摇九天】`,
            `你背后浮现鲲鹏虚影，羽翼遮天蔽日！`,
            `施展鲲鹏宝术中的极速奥义：`,
            `- 鲲入海，水击三千里`,
            `- 鹏展翅，扶摇九万里`,
            `- 阴阳二气流转，虚空为之震颤`
        ];

        // 根据境界增强效果
        if (player.mijinglevel_id >= 15 || player.xiangulevel_id >= 13) { // 至尊境以上
            kunpengReduction += 1;
            kunpengTexts.push(`鲲鹏真羽显化，撕裂虚空而行`);
        }
        if (player.mijinglevel_id >= 18 || player.xiangulevel_id >= 16) { // 真仙以上
            kunpengReduction += 1;
            kunpengTexts.push(`时间长河浮现，展翅间横渡万古`);
        }

        kunpengTexts.push(
            `"鹏啸震古今，翼展覆苍茫！"`,
            `时间大幅减少${kunpengReduction}分钟`
        );
        
        timeReduction += kunpengReduction;
        allMsgs.push(kunpengTexts.join('\n'));
    }

    // 应用时间减少（确保不低于1分钟）
    travelTime = Math.max(1, travelTime - timeReduction);
    
    // 检查修为和血气是否足够
    if (player.修为 < xiuweiCost) {
        return e.reply([
            `【破碎虚空·修为不足】`,
            `位面穿梭需要消耗大量修为！`,
            `当前修为：${player.修为}`,
            `所需修为：${xiuweiCost}`,
            `修为不足，无法完成传送`
        ].join('\n'));
    }
    
    if (player.血气 < qixueCost) {
        return e.reply([
            `【破碎虚空·血气不足】`,
            `位面穿梭需要消耗大量血气！`,
            `当前血气：${player.血气}`,
            `所需血气：${qixueCost}`,
            `血气不足，无法完成传送`
        ].join('\n'));
    }
    
    if (player.寿元 < shouyuanCost) {
        return e.reply([
            `【破碎虚空·寿元不足】`,
            `位面穿梭需要消耗大量寿元！`,
            `当前寿元：${player.寿元}`,
            `所需寿元：${shouyuanCost}`,
            `寿元不足，无法完成传送`
        ].join('\n'));
    }

    // 根据不同地点构建不同传送描述
    const fromLocation = Object.keys(LOCATION_MAP).find(key => LOCATION_MAP[key] === player.power_place);
    let startMsg = [];
    let travelMsg = [];

    switch (true) {
        case player.power_place === 0 && targetLocation === 1: // 凡间→仙界
            startMsg = [
                `你祭出飞剑，化作一道流光直冲云霄`,
                `消耗${xiuweiCost}修为与${qixueCost}血气以及${shouyuanCost}寿元`,
                `穿越九天罡风层，向仙界之门进发`,
                `预计需要${travelTime}分钟抵达仙界`
            ];
            travelMsg = [
                `飞剑破开云层，仙气逐渐浓郁`,
                `前方出现巍峨的南天门，金光万丈`,
                `仙界守卫远远望见你的身影，肃然起敬`
            ];
            break;
            
        case targetLocation === 6: // 前往仙域
            if (player.power_place === 3) { // 从界海→仙域
                startMsg = [
                    `你祭出帝兵，轰开界海尽头的混沌雾霭`,
                    `消耗${xiuweiCost}修为与${qixueCost}血气以及${shouyuanCost}寿元`,
                    `仙域接引古殿在虚空中显化，金光大道铺展`,
                    `预计需要${travelTime}分钟横渡最后的天堑`
                ];
                travelMsg = [
                    `接引古殿发出轰鸣，仙道规则化作虹桥`,
                    `你踏着金光大道前行，脚下是沉浮的残破古界`,
                    `前方混沌气散开，露出仙域的一角`
                ];
            } 
            else if (player.power_place === 4) { // 从时间长河→仙域
                startMsg = [
                    `你逆溯时间长河，寻找仙域在乱古的坐标`,
                    `消耗${xiuweiCost}修为与${qixueCost}血气以及${shouyuanCost}寿元`,
                    `掌指间绽放轮回之力，击穿时空壁垒`,
                    `预计需要${travelTime}分钟抵达仙域`
                ];
                travelMsg = [
                    `你在光阴碎片中看到仙域昔日的辉煌`,
                    `天庭遗址浮现，石昊的虚影在时光中显化`,
                    `「后来者，这就是你要找的仙域...」`
                ];
            }
            else { // 默认情况
                startMsg = [
                    `你凝聚至高法则，构建通往仙域的时空之门`,
                    `消耗${xiuweiCost}修为与${qixueCost}血气以及${shouyuanCost}寿元`,
                    `周身环绕原始真解符文，抵御界壁反噬`,
                    `预计需要${travelTime}分钟完成穿梭`
                ];
                travelMsg = [
                    `仙域法则如天刀般斩来，被你一掌击碎`,
                    `前方出现真仙跪拜的虚影，仙禽瑞兽飞舞`,
                    `浓郁的仙气几乎凝成液体，目的地将至`
                ];
            }
            break;
            
        case player.power_place === 1 && targetLocation === 0: // 仙界→凡间
            startMsg = [
                `你收敛仙气，化作凡人模样`,
                `消耗${xiuweiCost}修为与${qixueCost}血气以及${shouyuanCost}寿元`,
                `脚踏祥云缓缓向凡间降落`,
                `预计需要${travelTime}分钟抵达凡间`
            ];
            travelMsg = [
                `仙气逐渐稀薄，人间烟火气息扑面而来`,
                `下方城池轮廓渐渐清晰，市井喧嚣可闻`,
                `你轻轻落地，不惊起一丝尘埃`
            ];
            break;
            
        case player.power_place === 1 && targetLocation === 2: // 仙界→遮天位面
            startMsg = [
                `你激活五色祭坛，九龙拉棺破空而至`,
                `消耗${xiuweiCost}修为与${qixueCost}血气以及${shouyuanCost}寿元`,
                `踏上青铜古棺，准备横渡虚空`,
                `预计需要${travelTime}分钟抵达遮天位面`
            ];
            travelMsg = [
                `九龙拉棺在星空中穿梭，星辰如流光般倒退`,
                `前方出现一片荒古气息弥漫的星域`,
                `青铜棺椁震动，即将抵达目的地`
            ];
            break;
            
        case player.power_place === 2 && targetLocation === 3: // 遮天位面→界海
            startMsg = [
                `你撕裂虚空，踏足界海堤坝`,
                `消耗${xiuweiCost}修为与${qixueCost}血气以及${shouyuanCost}寿元`,
                `亿万宇宙沉浮，浪花中映照诸天万界`,
                `预计需要${travelTime}分钟横渡界海`
            ];
            travelMsg = [
                `界海无边，波涛汹涌，每一步都跨越无数宇宙`,
                `黑暗中有点点光芒，那是残破的古界在沉浮`,
                `前方出现一片相对平静的海域，目的地将至`
            ];
            break;
            
        case player.power_place === 3 && targetLocation === 4: // 界海→时间长河
            startMsg = [
                `你以无上伟力击穿时空壁垒`,
                `消耗${xiuweiCost}修为与${qixueCost}血气以及${shouyuanCost}寿元`,
                `脚踏光阴碎片，准备逆流而上`,
                `预计需要${travelTime}分钟抵达时间长河`
            ];
            travelMsg = [
                `时间长河奔涌，万古景象在身侧流转`,
                `你看到上古大战的残影，仙王喋血的悲壮`,
                `前方河段愈发湍急，时空波动剧烈`
            ];
            break;
            
        case player.power_place === 4 && targetLocation === 5: // 时间长河→永恒未知之地
            startMsg = [
                `你超脱诸天万界，向永恒未知之地进发`,
                `消耗${xiuweiCost}修为与${qixueCost}血气以及${shouyuanCost}寿元`,
                `周身道则崩解又重组，万法不侵`,
                `预计需要${travelTime}分钟抵达永恒未知之地`
            ];
            travelMsg = [
                `这里连时间都不存在，只有绝对的虚无`,
                `你的存在本身就在改写周围的规则`,
                `前方出现一片绝对寂静的领域，目的地将至`
            ];
            break;
            
        default:
            startMsg = [
                `你施展破碎虚空之术`,
                `消耗${xiuweiCost}修为与${qixueCost}血气以及${shouyuanCost}寿元`,
                `从${fromLocation}向${location}进发`,
                `预计需要${travelTime}分钟抵达`
            ];
            travelMsg = [
                `虚空穿梭中，周围景象飞速变换`,
                `位面壁垒在身后逐渐闭合`,
                `前方目的地的气息越来越清晰`
            ];
            break;
    }
    
    // 扣除修为和血气
    player.修为 -= xiuweiCost;
    player.血气 -= qixueCost;
    player.寿元 -= shouyuanCost;
    await Write_player(usr_qq, player);
    
    // 设置传送行动
    const travelAction = {
        action: '位面传送',
        start_time: new Date().getTime(),
        end_time: new Date().getTime() + travelTime * 60 * 1000,
        from_location: player.power_place,
        to_location: targetLocation,
        from_name: fromLocation,
        to_name: location,
        travel_time: travelTime,
        xiuwei_cost: xiuweiCost,
        qixue_cost: qixueCost,
        shouyuan_cost: shouyuanCost,
        travel_msg: travelMsg,
        player_name: player.名号,
        player_qq: usr_qq,
        group_id: e.isGroup ? e.group_id : null,
        used_token: false // 标记未使用传送次数
    };
    
    // 保存到Redis
    await redis.set(`xiuxian:travel_task:${usr_qq}`, JSON.stringify(travelAction));
    await redis.set(`xiuxian:player:${usr_qq}:action`, JSON.stringify(travelAction));
    
    // 发送开始传送消息
    e.reply([
        `【破碎虚空·位面穿梭】`,
        `${player.名号}施展无上神通，`,
        ...startMsg,
        ...allMsgs,
        `请耐心等待传送完成...`
    ].join('\n'));
    
    return true;
}
      async wusejitan(e) {
      let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
     let player = await Read_player(usr_qq);
          //不开放私聊功能
          if (!e.isGroup) {
              e.reply('修仙游戏请在群聊中游玩');
              return;
          }
               if ( player.五色祭坛 !== 1) {
              e.reply('你并没有找到五色祭坛');
              return;
          }
if (player.五色祭坛激活 !== 1) {
        const xiuweiCost =  10000000;
        const qixueCost =  15000000;

        // 检查修为和血气是否足够
        if (player.修为 < xiuweiCost) {
            return e.reply([
                `【修为不足】`,
                `当前修为：${player.修为}`,
                `所需修为：${(xiuweiCost)}`,
            ].join('\n'));
        }
        
        if (player.血气 < qixueCost) {
            return e.reply([
                `【血气不足】`,
                `当前血气：${player.血气}`,
                `所需血气：${qixueCost}`,
            ].join('\n'));
        }

        e.reply([
            `【五色祭坛激活】`,
            `你以无上法力激活五色祭坛，祭坛绽放璀璨神光`,
            `消耗修为：${xiuweiCost}`,
            `消耗血气：${qixueCost}`,
        ].join('\n'));
        player.五色祭坛激活 = 1
        await Write_player(usr_qq, player);
        return;
    }
}


async Xiuxianstate(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    const player = await Read_player(usr_qq);
    
    // 定义位置状态映射
    const PLACE_STATES = {
        0: "凡间",
        1: "仙界",
        1.5:'下界八域',
        2: "遮天位面",
        2.5: "九天十地",
        3: "界海",
        4: "时间长河",
        5: "永恒未知之地",
        6: "仙域"
    };
    
    // 获取真身位置
    const truePlace = PLACE_STATES[player.power_place] || "未知之地";
    
    let replyMsg = [
        `【${player.名号}状态】`,
        `真身位置：${truePlace}`,
    ];
    
    // 法身状态
    if (player.法身 === 1) {
        const fashanPlace = PLACE_STATES[player.法身位置] || "未知之地";
        const fashanAction = player.法身行动 || "待命中";
        const fashanStatus = player.法身状态 || "未知";
        
        replyMsg.push(
            `法身位置：${fashanPlace}`
        );
    }
const daoshang = player.道伤 || 0;
if (daoshang > 0) {
    // 将道伤值转换为保留一位小数的字符串
    const formattedDaoshang = parseFloat(daoshang).toFixed(1);
    replyMsg.push(`身披道伤：${formattedDaoshang}`);
}
if (player.火星圣体道痕) {
    replyMsg.push(`身负火星圣体道痕`);
}
// ----- 五色祭坛 -----
replyMsg.push(
    `五色祭坛：${player.五色祭坛 === 1 ? '已寻得' : '未寻得'}`,
    `激活状态：${player.五色祭坛激活 === 1 ? '已激活' : '未激活'}`
);
    // 查询当前行动 - 真身行动
    let trueBodyAction = await redis.get('xiuxian:player:' + usr_qq + ':action');
    if (trueBodyAction) {
        trueBodyAction = JSON.parse(trueBodyAction);
        const now_time = new Date().getTime();
        
        // ==== 修改点：适应新的状态定义 ====
        if (trueBodyAction.Place_actionplus === '0') {
            // 沉迷状态
            const totalEndTime = trueBodyAction.start_time + (trueBodyAction.total_time * 60 * 1000);
            
            if (now_time <= totalEndTime) {
                // 计算整个沉迷的剩余时间
                const remainingMs = totalEndTime - now_time;
                const m = Math.floor(remainingMs / (1000 * 60));
                const s = Math.floor((remainingMs % (1000 * 60)) / 1000);
                
                // 计算进度
                const progress = Math.round((trueBodyAction.settled_count / trueBodyAction.total_count) * 100);
                
                replyMsg.push(
                    `真身正在沉迷【${trueBodyAction.Place_address.name}】`,
                    `进度：${progress}% (${trueBodyAction.settled_count}/${trueBodyAction.total_count})`,
                    `剩余时间：${m}分${s}秒`,
                    `下次结算：${formatTime(trueBodyAction.next_settle_time - now_time)}后`
                );
            } else {
                replyMsg.push(`真身沉迷行动已结束`);
            }
        } else if (now_time <= trueBodyAction.end_time) {
            // 其他行动（闭关、渡劫等）
            const m = Math.floor((trueBodyAction.end_time - now_time) / (1000 * 60));
            const s = Math.floor(((trueBodyAction.end_time - now_time) % (1000 * 60)) / 1000);
            replyMsg.push(
                `真身正在${trueBodyAction.action}中`,
                `剩余时间：${m}分${s}秒`
            );
        } else {
            replyMsg.push(`真身行动已结束`);
        }
    } else {
        replyMsg.push(`真身空闲中`);
    }
    
    // 查询当前行动 - 法身行动
    let fashanAction = await redis.get('xiuxian:player:' + usr_qq + ':action:fashan');
    if (fashanAction) {
        fashanAction = JSON.parse(fashanAction);
        const now_time = new Date().getTime();
        
        if (now_time <= fashanAction.end_time) {
            const m = Math.floor((fashanAction.end_time - now_time) / (1000 * 60));
            const s = Math.floor(((fashanAction.end_time - now_time) % (1000 * 60)) / 1000);
            replyMsg.push(
                `法身正在${fashanAction.action}中`,
                `剩余时间：${m}分${s}秒`
            );
        } else {
            replyMsg.push(`法身行动已结束`);
        }
    } else if (player.法身 === 1) {
        replyMsg.push(`法身空闲中`);
    }
    
    e.reply(replyMsg.join("\n"));
    return false;
}



  //秘境地点
  async Secretplace(e) {
    if (!verc({ e })) return false;
    let addres = '秘境';
    let weizhi = data.didian_list;
    let img=await Goweizhi(e, weizhi, addres);
    e.reply(img)
  }
    async jiutianshidi(e) {
    if (!verc({ e })) return false;
    let addres = '九天十地';
    let weizhi = data.jiutianshidi_list;
    let img=await shangjieweizhi(e, weizhi, addres);
    e.reply(img)
  }
async xunbao(e) {
    if (!verc({ e })) return false;
    
    try {
        // 获取所有寻宝地点数据
        const xunbaoData = data.xunbao_list;
        
        // 获取所有地点名称
        const allPlaceNames = [];
        for (const category in xunbaoData.mapCategories) {
            allPlaceNames.push(...xunbaoData.mapCategories[category]);
        }
        
        // 去重
        const uniquePlaceNames = [...new Set(allPlaceNames)];
        
        // 调用显示函数
        const img = await xunbaoweizhi(e, uniquePlaceNames, "全部寻宝地点");
        
        // 发送图片
        return e.reply(img);
    } catch (error) {
        console.error('显示全部寻宝地点错误:', error);
        return e.reply('❌ 寻宝信息生成失败，请稍后重试');
    }
}
     //遮天位面地点
   async zhetian(e) {
        if (!verc({ e })) return false;
        let addres = "遮天位面";
        let weizhi = data.zhetian_list;
        let img=await zhetianweizhi(e, weizhi, addres);
       e.reply(img)
    }
         //上苍之上
   async shangcang(e) {
        if (!verc({ e })) return false;
        let addres = "上苍之上";
        let weizhi = data.shangcang_list;
        let img=await shangcangweizhi(e, weizhi, addres);
       e.reply(img)
    }
             //上苍之上
   async xiajie(e) {
        if (!verc({ e })) return false;
        let addres = "下界八域";
        let weizhi = data.xiajie_list;
        let img=await xiajieweizhi(e, weizhi, addres);
       e.reply(img)
    }
  //禁地
  async Forbiddenarea(e) {
    if (!verc({ e })) return false;
    let addres = '禁地';
    let weizhi = data.forbiddenarea_list;
    let img=await jindiweizhi(e, weizhi, addres);
    e.reply(img)
  }

  //限定仙府
  async Timeplace(e) {
    if (!verc({ e })) return false;
    e.reply('仙府乃民间传说之地,请自行探索');
  }
  // 界海
async jiehai(e) {
    if (!verc({ e })) return false;
    e.reply("警告：界海！万古诸天以来最凶险之地！曾有帝落时代的准仙帝横渡过去也身陨道消，此后从未有先贤能横渡界海，踏足那里记录！道友若要探索界海请三思！");
}

  //仙境
  async Fairyrealm(e) {
    if (!verc({ e })) return false;
    let addres = '仙境';
    let weizhi = data.Fairyrealm_list;
    let img=await xianjingweizhi(e, weizhi, addres);
    e.reply(img)
  }

async Gojiehaiplace(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
     const player = await Read_player(usr_qq);
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
      // 检查是否已在目标地点
    if (player.power_place != 3) {
        return e.reply(`你不在界海`);
    }

    
    // 解析指令，获取玩家选择的地点
    const msg = e.msg.replace('#探索界海', '').trim();
    const didian = msg; // 玩家输入的地点
    
    // 检查地点是否存在
    const weizhi = data.jiehai_list .find(item => item.name == didian);
    if (!weizhi) {
        e.reply(`未知的界海地点：${didian}`);
        return false;
    }
    
    // 检查地点境界要求
    if (didian === "接引古殿" && player.mijinglevel_id < 18) {
        e.reply([
            `【境界不足】`,
            `接引古殿乃界海禁地，凶险异常！`,
            `殿内囚禁着仙王元神，回荡着让诸天颤栗的悲鸣！`,
            `以道友目前修为，踏足接引古殿顷刻间便会：`,
            `- 肉身崩解！元神寂灭！真灵永堕！`,
            `待你成就仙王果位，再来探寻这万古大秘！`,
        ].join('\n'));
        return false;
    }
    
    if (didian === "终极古地" && player.mijinglevel_id < 21) {
        e.reply([
            `【境界不足】`,
            `终极古地乃界海最深处，葬着仙帝尸骸！`,
            `黑暗风暴肆虐，诡异低语穿透万古时空！`,
            `以道友目前修为，踏足终极古地顷刻间便会：`,
            `- 肉身崩解！元神寂灭！真灵永堕！`,
            `待你成就仙帝果位，再来探寻这万古大秘！`,
        ].join('\n'));
        return false;
    }
    
    const Price = weizhi.Price;
    
    // 检查灵石是否足够
    if (player.灵石 < Price) {
        e.reply(`没有灵石寸步难行，请道友攒到${Price}灵石才够哦~`);
        return false;
    }
        // 添加破王成帝消息（如果有）
    if (player.破王成帝) {
        player.破王成帝 -= 1;
        e.reply("你破王成帝的桎梏正在松动");
        await Write_player(usr_qq, player);
    }
    player.lastDungeonType = '界海';
    player.lastDungeonName = didian;
    await Write_player(usr_qq, player);
    // 扣除灵石
    await Add_灵石(usr_qq, -Price);
    
    const cf = config.getConfig('xiuxian', 'xiuxian');
    let time = 30; // 基础时间（分钟）

    const allMsgs = []; // 收集所有消息
    // 添加前往界海消息
    allMsgs.push(`你沿着帝落时代的无名准仙帝在堤坝留下的脚印前往界海，目标：${didian}`);
     // 调用统一方法计算时间缩减
    const { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
    
    // 应用时间减少
    time -= timeReduction;
    
    // 添加时间减少汇总
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            `剩余时间：${time}分钟`,
        ].join('\n'));
    }
    
    const action_time = 60000 * time; // 持续时间，单位毫秒
    const arr = {
        action: `探索界海`,
        end_time: new Date().getTime() + action_time,
        time: action_time,
        shutup: '1',
        working: '1',
        Place_action: '0',
        Place_actionplus: '1',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    // 更新任务记录
    const A = await channel(e.user_id);
    const renwu = await Read_renwu();
    const i = await found(A);
    if (renwu[i]?.wancheng3 == 1) {
        renwu[i].jilu3 += 1;
        await Write_renwu(renwu);
    }
    
    // 使用原键名存储真身行动
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // 构建主文案
    const playerLevel = player.mijinglevel_id;
    let finalMsg = '';
    
    // 准仙帝文案 (境界20)
    if (playerLevel === 20) {
        if (didian === "接引古殿") {
            finalMsg = [
                `【准仙帝临世·接引古殿】`,
                `你脚踏万道，横渡界海！`,
                `一道压万道，万法皆臣服！`,
                `接引古殿散发诡异黑雾，殿门刻着帝落时代的符文。`,
                `你祭出开创的修炼体系，一道压万道，轰开殿门！`,
                `黑暗物质侵蚀而来，却被你的道则磨灭！`,
                `殿内囚禁着仙王元神，回荡着让诸天颤栗的悲鸣！`,
                `此乃道祖之威！`,
                `${time}分钟后归来！`
            ].join('\n');
        } else {
            finalMsg = [
                `【准仙帝临世·终极古地】`,
                `你横渡界海，万道相随！`,
                `前方浮现终极古地，漂浮着仙帝尸骸，黑暗风暴撕裂诸天！`,
                `你开创的全新体系绽放神光，硬抗黑暗物质侵蚀！`,
                `顶着让仙王颤栗的威压，强势闯入古地深处！`,
                `此地葬着乱古纪元的秘密，此乃道祖之威！`,
                `${time}分钟后见分晓！`
            ].join('\n');
        }
    }
    // 仙帝文案 (境界21)
    else if (playerLevel === 21) {
        if (didian === "接引古殿") {
            finalMsg = [
                `【仙帝临九天·接引古殿】`,
                `你踏足界海，万界共尊！`,
                `眸光开阖间，时空长河为之改道！`,
                `接引古殿散发诡异黑雾，却在你帝威下寸寸崩解！`,
                `你一念花开，万界生灭！`,
                `黑暗物质尚未近身便已湮灭！`,
                `殿内囚禁的仙王元神，在你帝威下瑟瑟发抖！`,
                `此乃仙帝之威！`,
                `${time}分钟后归来！`
            ].join('\n');
        } else {
            finalMsg = [
                `【仙帝临九天·终极古地】`,
                `你横渡界海，诸天共尊！`,
                `前方终极古地，黑暗风暴肆虐，却在你的帝威下平息！`,
                `你眸光所至，仙帝尸骸复苏，却被你一指镇压！`,
                `诡异低语穿透万古，却被你一声冷哼震散！`,
                `此乃路尽级生灵之威！`,
                `${time}分钟后归来！`
            ].join('\n');
        }
    }
    // 祭道及以上文案 (境界>=22)
    else if (playerLevel >= 22) {
        if (didian === "接引古殿") {
            finalMsg = [ 
                `【祭道领域·接引古殿】`,
                `你踏足界海，焚尽规则！`,
                `接引古殿散发诡异黑雾，`,
                `却被你祭掉的大道磨灭！`,
                `你眸光开合，古殿寸寸崩解！`,
                `囚禁的仙王元神在你面前，如蝼蚁般瑟瑟发抖！`,
                `万般因果不加身，古今未来唯你独尊！`,
                `此乃祭道之威！`,
                `${time}分钟后归来！`
            ].join('\n');
        } else {
            finalMsg = [
                `【祭道领域·终极古地】`,
                `你踏足界海，超脱永恒！`,
                `终极古地黑暗风暴肆虐，却被你一个呼吸吹散！`,
                `仙帝尸骸复苏，却被你一念镇压！`,
                `诡异源头低语，却被你一声冷哼震散！`,
                `你凌驾诸天之上，界海亦在你脚下臣服！`,
                `此乃祭道之威！`,
                `${time}分钟后归来！`
            ].join('\n');
        }
    }
    // 默认文案（仙王及以下）
    else {
        if (didian === "接引古殿") {
            finalMsg = [
                `你横渡界海，踏着仙王尸骨前行！`,
                `前方浮现一座残破古殿，散发着诡异黑雾。`,
                `殿门刻着"接引"二字，仿佛在召唤万灵。`,
                `你以无上法力轰开殿门，却被黑暗物质侵蚀，仙体崩裂！元神震荡！`,
                `消耗十万年修为才逼出黑暗物质，终于闯入传说中的接引古殿！`,
                `殿内漂浮着帝落时代的残兵，沉睡着让仙王都颤栗的古老存在！`,
                `此去凶险，望君珍重！`,
                `${time}分钟后归来！`
            ].join('\n');
        } else {
            finalMsg = [
                `你横渡界海，历经万劫！`,
                `踏碎无数残破宇宙，终于抵达终极古地！`,
                `此地漂浮着仙帝尸骸，黑暗风暴肆虐，诡异低语穿透万古时空！`,
                `你燃烧十万年修为，硬抗黑暗物质侵蚀，`,
                `顶着让准仙帝都颤栗的威压，终于闯入古地深处！`,
                `此去九死一生，望君归来！`,
                `${time}分钟后见分晓！`
            ].join('\n');
        }
    }
    
    // 添加主文案
    allMsgs.push(finalMsg);
    

    // 一次性发送所有消息
    e.reply(allMsgs.join('\n\n'));
    return true;
}

async Gosecretplace(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
     const player = await Read_player(usr_qq);
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
      // 检查是否已在目标地点
    if (player.power_place != 0) {
        return e.reply(`你不在凡间`);
    }

    const didian = e.msg.replace('#降临秘境', '').trim();
    const weizhi = data.didian_list.find(item => item.name == didian);
    
    // 检查地点是否存在
    if (!weizhi) {
        e.reply(`未知的秘境：${didian}`);
        return false;
    }
    
    // 获取玩家当前境界
    const now_level_id = data.Level_list.find(
        item => item.level_id == player.level_id
    ).level_id;
    
    // 特殊地点境界检查
    if (didian === "永恒海" && now_level_id < 55) {
        e.reply('没有达到万界道祖之前还是不要去了');
        return false;
    }
    if (didian === "永恒海尽头" && now_level_id < 63) {
        e.reply('没有达到永恒境之前还是不要去了');
        return false;
    }
    
    // 检查资源是否足够
    if (player.灵石 < weizhi.Price) {
        e.reply(`没有灵石寸步难行，攒到${weizhi.Price}灵石才够哦~`);
        return false;
    }
    if (player.寿元 < weizhi.shouyuan) {
        e.reply('道友这点寿元就不要去了吧，免得原地坐化了');
        return false;
    }
    
    // 桃花岛特殊检查
    if (didian === '桃花岛') {
        const exist_B = await exist_hunyin(usr_qq);
        if (!exist_B) {
            e.reply(`还请少侠找到道侣之后再来探索吧`);
            return false;
        }
        const qinmidu = await find_qinmidu(usr_qq, exist_B);
        if (qinmidu < 550) {
            e.reply('少侠还是先和道侣再联络联络感情吧');
            return false;
        }
        await add_qinmidu(usr_qq, exist_B, -50);
    }
    
    // 更新任务记录
    const A = await channel(e.user_id);
    const renwu = await Read_renwu();
    const i = await found(A);
    if (renwu[i]?.wancheng3 === 1) {
        renwu[i].jilu3 += 1;
        await Write_renwu(renwu);
    }
            player.lastDungeonType = '秘境';
    player.lastDungeonName = didian;
    await Write_player(usr_qq, player);
    // 扣除资源
    await Add_寿元(usr_qq, -weizhi.shouyuan);
    await Add_灵石(usr_qq, -weizhi.Price);
    
    // 获取基础时间
    const cf = config.getConfig('xiuxian', 'xiuxian');
    let baseTime = cf.CD.forbiddenarea; // 基础时间（分钟）

    const allMsgs = []; // 收集所有消息
  // 调用统一方法计算时间缩减
    const { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
    
    // 添加时间减少汇总
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            // 注意：此时还没有计算最终时间，所以不显示剩余时间
        ].join('\n'));
    }
    
     // ==== 法身系统检查 ====
    if (player.法身 === 1) {
        // 检查法身状态是否为"空闲中"
        if (player.法身状态 === "空闲中") {
            // 法身空闲，使用法身探索
            const time = baseTime - timeReduction; // 法身实际时间
            
            // 更新法身状态
            player.法身位置 = 1; // 秘境位置编号
            player.法身行动 = `探索${didian}`;
            player.法身状态 = `行动中`;
            await Write_player(usr_qq, player);
            
            // 构建法身消息
            const fashanMsg = [
                `【法身代行】`,
                `${player.名号}盘坐永恒未知之地，万古不动，`,
                `一缕法身降临${didian}，代真身探索秘境！`,
                `法身行动：${time}分钟后归来`,
            ];
            allMsgs.push(fashanMsg.join('\n'));
            
            // 设置法身行动状态
            const action_time = 60000 * time; // 持续时间，单位毫秒
            const arr = {
                action: '秘境探索',
                isFashan: true,
                end_time: new Date().getTime() + action_time,
                time: action_time,
                shutup: '1',
                working: '1',
                Place_action: '0',
                Place_actionplus: '1',
                power_up: '1',
                mojie: '1',
                xijie: '1',
                plant: '1',
                mine: '1',
                Place_address: weizhi,
            };
            
            if (e.isGroup) {
                arr.group_id = e.group_id;
            }
            
            await redis.set('xiuxian:player:' + usr_qq + ':action:fashan', JSON.stringify(arr));
            
            // 发送消息
            e.reply(allMsgs.join('\n\n'));
            return true;
        } else {
            // 法身忙碌，显示状态
            const currentAction = await redis.get('xiuxian:player:' + usr_qq + ':action:fashan');
            if (currentAction) {
                const parsedAction = JSON.parse(currentAction);
                if (parsedAction.isFashan && parsedAction.end_time > new Date().getTime()) {
                    const m = parseInt((parsedAction.end_time - new Date().getTime()) / 1000 / 60);
                    const s = parseInt((parsedAction.end_time - new Date().getTime() - m * 60 * 1000) / 1000);
                    e.reply(`法身正在${parsedAction.action}中，剩余时间：${m}分${s}秒`);
                }
            }
            // 注意：这里不返回，继续执行真身逻辑
        }
    }
    
   
    
    // 真身探索的最终时间 = 基础时间 + 位置变化增加的时间 - 减少时间
    const time = baseTime  - timeReduction;
    
    // 添加时间减少汇总中的剩余时间（现在可以计算了）
    if (timeReduction > 0) {
        // 由于前面已经添加了时间减少汇总，我们更新一下，加上剩余时间
        // 但是前面已经添加到allMsgs了，我们可以修改最后一条消息，或者重新构建
        // 为了简单，我们这里直接添加一条剩余时间的消息
        allMsgs.push(`剩余时间：${time}分钟`);
    }
    
    // 添加消耗信息
    allMsgs.push(`${player.名号}消耗了${weizhi.shouyuan}寿元和${weizhi.Price}灵石`);
    
    // 添加主消息
    allMsgs.push(`开始降临${didian}，${time}分钟后归来！`);
    
    // 设置动作状态
    const action_time = 60000 * time; // 持续时间，单位毫秒
    const arr = {
        action: '秘境历练',
        end_time: new Date().getTime() + action_time,
        time: action_time,
        shutup: '1',
        working: '1',
        Place_action: '0',
        Place_actionplus: '1',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));

    // 一次性发送所有消息
    e.reply(allMsgs.join('\n\n'));
    return true;
}
async Goxiajie(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
     const player = await Read_player(usr_qq);
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
      // 检查是否已在目标地点
    if (player.power_place != 1.5) {
        return e.reply(`你不在下界八域`);
    }

    const didian = e.msg.replace('#前往下界八域', '').trim();
    const weizhi = data.xiajie_list.find(item => item.name == didian);
    
    // 检查地点是否存在
    if (!weizhi) {
        e.reply(`未知的秘境：${didian}`);
        return false;
    }
    
    
    // 特殊地点境界检查
    if (didian === "鲲鹏巢" && player.xiangulevel_id > 4) {
        e.reply('北海鲲鹏巢只有化灵境及以下的修士才能前往');
        return false;
    }
    if (didian === "百断山脉" && player.xiangulevel_id > 3) {
        e.reply('百断山脉只有洞天境及以下的修士才能前往');
        return false;
    }
    
    // 检查资源是否足够
    if (player.灵石 < weizhi.Price) {
        e.reply(`没有灵石寸步难行，攒到${weizhi.Price}灵石才够哦~`);
        return false;
    }
    if (player.寿元 < weizhi.shouyuan) {
        e.reply('道友这点寿元就不要去了吧，免得原地坐化了');
        return false;
    }
    if (player.修为 < weizhi.experience) {
        e.reply('道友的修为不足以前往');
        return false;
    }
    if (player.血气 < weizhi.experience) {
        e.reply('道友的血气不足以前往');
        return false;
    }
    
    // 更新任务记录
    const A = await channel(e.user_id);
    const renwu = await Read_renwu();
    const i = await found(A);
    if (renwu[i]?.wancheng3 === 1) {
        renwu[i].jilu3 += 1;
        await Write_renwu(renwu);
    }
            player.lastDungeonType = '下界八域';
    player.lastDungeonName = didian;
    await Write_player(usr_qq, player);
    // 扣除资源
    await Add_寿元(usr_qq, -weizhi.shouyuan);
    await Add_灵石(usr_qq, -weizhi.Price);
    await Add_修为(usr_qq, -weizhi.experience);
    await Add_血气(usr_qq, -weizhi.experience);
    // 获取基础时间
    const cf = config.getConfig('xiuxian', 'xiuxian');
    let baseTime = cf.CD.xiajie; // 基础时间（分钟）

    const allMsgs = []; // 收集所有消息
  // 调用统一方法计算时间缩减
    const { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
    
    // 添加时间减少汇总
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            // 注意：此时还没有计算最终时间，所以不显示剩余时间
        ].join('\n'));
    }
    
    // 真身探索的最终时间 = 基础时间 + 位置变化增加的时间 - 减少时间
    const time = baseTime  - timeReduction;
    
    // 添加时间减少汇总中的剩余时间（现在可以计算了）
    if (timeReduction > 0) {
        allMsgs.push(`剩余时间：${time}分钟`);
    }
    
    // 添加消耗信息
    allMsgs.push(`${player.名号}消耗了${weizhi.shouyuan}寿元和${weizhi.Price}灵石以及${weizhi.experience}修为与血气`);
    
    // 添加主消息
    allMsgs.push(`开始前往${didian}，${time}分钟后归来！`);
    
    // 设置动作状态
    const action_time = 60000 * time; // 持续时间，单位毫秒
    const arr = {
        action: '下界八域历练',
        end_time: new Date().getTime() + action_time,
        time: action_time,
        shutup: '1',
        working: '1',
        Place_action: '0',
        Place_actionplus: '1',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));

    // 一次性发送所有消息
    e.reply(allMsgs.join('\n\n'));
    return true;
}
async Gojiutianshidi(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
     const player = await Read_player(usr_qq);
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
      // 检查是否已在目标地点
    if (player.power_place != 2.5) {
        return e.reply(`你不在九天十地`);
    }

    const didian = e.msg.replace('#前往九天十地', '').trim();
    const weizhi = data.jiutianshidi_list.find(item => item.name == didian);
    
    // 检查地点是否存在
    if (!weizhi) {
        e.reply(`未知的秘境：${didian}`);
        return false;
    }
    
    // 特殊地点境界检查
    if (didian === "元天秘境" && player.xiangulevel_id > 7) {
        e.reply('元天秘境只有尊者境及以下的修士才能前往');
        return false;
    }
    
    // 检查资源是否足够
    if (player.灵石 < weizhi.Price) {
        e.reply(`没有灵石寸步难行，攒到${weizhi.Price}灵石才够哦~`);
        return false;
    }
    if (player.寿元 < weizhi.shouyuan) {
        e.reply('道友这点寿元就不要去了吧，免得原地坐化了');
        return false;
    }
    if (player.修为 < weizhi.experience) {
        e.reply('道友的修为不足以前往');
        return false;
    }
    if (player.血气 < weizhi.experience) {
        e.reply('道友的血气不足以前往');
        return false;
    }
    
    // 更新任务记录
    const A = await channel(e.user_id);
    const renwu = await Read_renwu();
    const i = await found(A);
    if (renwu[i]?.wancheng3 === 1) {
        renwu[i].jilu3 += 1;
        await Write_renwu(renwu);
    }
            player.lastDungeonType = '九天十地';
    player.lastDungeonName = didian;
    await Write_player(usr_qq, player);
    // 扣除资源
    await Add_寿元(usr_qq, -weizhi.shouyuan);
    await Add_灵石(usr_qq, -weizhi.Price);
    await Add_修为(usr_qq, -weizhi.experience);
    await Add_血气(usr_qq, -weizhi.experience);
    // 获取基础时间
    const cf = config.getConfig('xiuxian', 'xiuxian');
    let baseTime = cf.CD.xiajie; // 基础时间（分钟）

    const allMsgs = []; // 收集所有消息
  // 调用统一方法计算时间缩减
    const { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
    
    // 添加时间减少汇总
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            // 注意：此时还没有计算最终时间，所以不显示剩余时间
        ].join('\n'));
    }
    
    // 真身探索的最终时间 = 基础时间 + 位置变化增加的时间 - 减少时间
    const time = baseTime  - timeReduction;
    
    // 添加时间减少汇总中的剩余时间（现在可以计算了）
    if (timeReduction > 0) {
        allMsgs.push(`剩余时间：${time}分钟`);
    }
    
    // 添加消耗信息
    allMsgs.push(`${player.名号}消耗了${weizhi.shouyuan}寿元和${weizhi.Price}灵石以及${weizhi.experience}修为与血气`);
    
    // 添加主消息
    allMsgs.push(`开始前往${didian}，${time}分钟后归来！`);
    
    // 设置动作状态
    const action_time = 60000 * time; // 持续时间，单位毫秒
    const arr = {
        action: '九天十地历练',
        end_time: new Date().getTime() + action_time,
        time: action_time,
        shutup: '1',
        working: '1',
        Place_action: '0',
        Place_actionplus: '1',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));

    // 一次性发送所有消息
    e.reply(allMsgs.join('\n\n'));
    return true;
}
async Gozhetian(e) {
    // ==== 初始化部分 ====
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    const player = await Read_player(usr_qq);
    const allMsgs = []; // 消息收集器（修复点：提前初始化）

    // ==== 基础检查 ====
    const flag = await Go(e);
    if (!flag) return false;

    if (player.power_place != 2) {
        allMsgs.push(`你不在遮天位面`);
        return e.reply(allMsgs.join('\n'));
    }

    // ==== 法身系统检查 ====
    if (player.法身 === 1) {
        const nowTime = new Date().getTime();
        
        // 检查法身恢复状态
        if (player.法身恢复时间 && player.法身恢复时间 > nowTime) {
            const remainMinutes = Math.ceil((player.法身恢复时间 - nowTime) / 60000);
            allMsgs.push(`法身正在恢复中，还需${remainMinutes}分钟`);
        } else {
            // 检查法身行动状态
            let isFashanBusy = false;
            const fashanAction = await redis.get('xiuxian:player:' + usr_qq + ':action:fashan');
            
            if (fashanAction) {
                const parsedAction = JSON.parse(fashanAction);
                if (parsedAction.end_time > nowTime) {
                    isFashanBusy = true;
                    const m = parseInt((parsedAction.end_time - nowTime) / 1000 / 60);
                    const s = parseInt((parsedAction.end_time - nowTime - m * 60 * 1000) / 1000);
                    allMsgs.push(`法身正在${parsedAction.action}中，剩余时间：${m}分${s}秒`);
                } else {
                    await redis.del('xiuxian:player:' + usr_qq + ':action:fashan');
                }
            }
            
            // 法身可用时的处理
            if (!isFashanBusy) {
                const didian = e.msg.replace('#前往遮天位面', '').trim();
                const weizhi = data.zhetian_list.find(item => item.name == didian);
                
                if (!weizhi) {
                    allMsgs.push(`未找到地点：${didian}`);
                    return e.reply(allMsgs.join('\n'));
                }
                
                // ==== 时间计算 ====
                let time = 12; // 基础时间（分钟）

              // 调用统一方法计算时间缩减
    const { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
                
                // 灵根效果
                switch (player.灵根.type) {
                    case "大成圣体":
                    case "圣体道胎":
                        timeReduction += 2;
                        break;
                }
                
                // 天帝特权
                if (player.di_wei == "天帝") {
                    timeReduction += 2;
                }
                
                time -= timeReduction;
                
                // ==== 更新法身状态 ====
                player.法身位置 = 2;
                player.法身行动 = `探索遮天·${didian}`;
                player.法身状态 = `行动中`;
                await Write_player(usr_qq, player);
                
                // ==== 构建法身消息 ====
                const fashanMsg = [
                    `【法身代行】`,
                    `${player.名号}盘坐永恒未知之地，万古不动，`,
                    `一缕法身降临遮天位面，代真身探索${didian}！`,
                    `法身行动：${time}分钟后归来`
                ];
                allMsgs.push(fashanMsg.join('\n'));
                
                // ==== 设置法身行动 ====
                const action_time = 60000 * time;
                const arr = {
                    action: '法身探索遮天位面',
                    isFashan: true,
                    end_time: nowTime + action_time,
                    time: action_time,
                    shutup: '1',
                    working: '1',
                    Place_action: '0',
                    Place_actionplus: '1',
                    power_up: '1',
                    mojie: '1',
                    xijie: '1',
                    plant: '1',
                    mine: '1',
                    Place_address: weizhi,
                };
                
                if (e.isGroup) {
                    arr.group_id = e.group_id;
                }
                
                await redis.set('xiuxian:player:' + usr_qq + ':action:fashan', JSON.stringify(arr));
                return e.reply(allMsgs.join('\n\n'));
            }
        }
    }

    // ==== 真身探索逻辑 ====
    const didian = e.msg.replace('#前往遮天位面', '').trim();
    const weizhi = data.zhetian_list.find(item => item.name == didian);
    
    if (!weizhi) {
        allMsgs.push(`未找到地点：${didian}`);
        return e.reply(allMsgs.join('\n'));
    }
    

    
    // ==== 资源检查 ====
    let weizhiPrice = weizhi.Price;
    if (player.di_wei == "天帝") {
        weizhiPrice = 0;
        allMsgs.push([
            `【天帝巡视·万道臣服】`,
            `你为诸天共尊的天帝，此刻巡视寰宇！`,
            `万道臣服，邪祟避退，举世无人可阻！`,
        ].join('\n'));
    }
    
    if (player.灵石 < weizhiPrice) {
        allMsgs.push(`没有灵石寸步难行，攒到${weizhiPrice}灵石才够哦~`);
        return e.reply(allMsgs.join('\n'));
    }
    
    if (player.寿元 < weizhi.shouyuan) {
        allMsgs.push('道友这点寿元就不要去了吧，免得原地坐化了');
        return e.reply(allMsgs.join('\n'));
    }
    
    // ==== 星域境界检查 ====
    if (weizhi.Grade === "星域" && player.mijinglevel_id < 12) {
        allMsgs.push(`你的秘境体系尚未达到圣人境，不具备星海遨游之力！`);
        return e.reply(allMsgs.join('\n'));
    }
    
    // ==== 时间计算 ====
    const baseTime = 12;
    let time = baseTime;

    let weizhiExperience = 0;
    // 调用统一方法计算时间缩减
    let { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
    
    // ==== 生命禁区特殊处理 ====
    if (weizhi.Grade === "生命禁区") {
        weizhiExperience = weizhi.experience;
        let adjustMsg = "";
        
        switch (player.灵根.type) {
            case "大成圣体":
                weizhiExperience = 0;
                timeReduction+=2;
                adjustMsg = "你为大成圣体，气吞山河君临天下，万邪不侵！";
                break;
            case "大成霸体":
                weizhiExperience = 0;  
                timeReduction+=2; 
                adjustMsg = "你为大成霸体，气吞山河君临天下，万邪不侵！";
                break;    
            case "小成圣体":
                weizhiExperience = Math.ceil(weizhiExperience / 2);
                adjustMsg = "你为小成圣体，血气如龙，堪比古之圣人！";
                break;
            case "圣体":
                weizhiExperience = Math.ceil(weizhiExperience * 0.77);
                adjustMsg = "你为人族圣体，拥有超越常人的体魄！";
                break;
            case "命运":
            case "天魔":
                weizhiExperience = 0;
                adjustMsg = "你为超脱者，三界六道皆在掌控！";
                break;
            case "圣体道胎":
                weizhiExperience = 0;
                timeReduction+=3;
                adjustMsg = "万道共鸣！圣体道胎先天立于不败之地！";
                break;
            case "混沌圣体道胎":
                weizhiExperience = 0;
                timeReduction+=4;
                adjustMsg = "混沌初开，万道共鸣！圣体道胎先天立于不败之地！";
                break;    
            case "大道体":
                weizhiExperience = Math.ceil(weizhiExperience * 0.3);
                timeReduction+=1;
                adjustMsg = "身与道合，言出法随！大道体血脉中流淌着大道印记！";
                break;
            default:
                adjustMsg = "作为普通体质，你需以修为血气为代价！";
        }
        
        
        allMsgs.push(adjustMsg);
        
        // 不死神泉效果
        if (await exist_najie_thing(usr_qq, "不死神泉", "道具")) {
            weizhiExperience = Math.ceil(weizhiExperience * 0.8);
            allMsgs.push("饮下不死神泉，生命禁区的诅咒与道则压制大幅减弱！");
            await Add_najie_thing(usr_qq, "不死神泉", "道具", -1);
        }
        
        // 检查修为和血气
        if (player.修为 < weizhiExperience) {
            allMsgs.push(`你需要积累${weizhiExperience}修为，才能抵抗生命禁区！`);
            return e.reply(allMsgs.join('\n'));
        }
        if (player.血气 < weizhiExperience) {
            allMsgs.push(`你需要积累${weizhiExperience}血气，才能抵抗生命禁区！`);
            return e.reply(allMsgs.join('\n'));
        }
    player.lastDungeonType = '遮天位面';
    player.lastDungeonName = didian;
    await Write_player(usr_qq, player);
        // 扣除资源
        await Add_灵石(usr_qq, -weizhiPrice);
        await Add_修为(usr_qq, -weizhiExperience);
        await Add_血气(usr_qq, -weizhiExperience);
    } else {
            player.lastDungeonType = '遮天位面';
    player.lastDungeonName = didian;
    await Write_player(usr_qq, player);
        await Add_灵石(usr_qq, -weizhiPrice);
        await Add_修为(usr_qq, -weizhiExperience);
        await Add_血气(usr_qq, -weizhiExperience);
    }
    

    
    // ==== 应用时间减少 ====
    time -= timeReduction;
    
    // ==== 时间信息 ====
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            `剩余时间：${time}分钟`,
        ].join('\n'));
    }
    

    
    // ==== 地点描述 ====
    let locationDesc = "";
    if (weizhi.Grade === "生命禁区") {
        switch (didian) {
            case "荒古禁地":
                locationDesc = "警告：此地蕴含无尽诅咒，万古以来无数强者陨落于此！";
                break;
            case "青铜仙殿":
                locationDesc = "青铜仙殿神秘莫测，传闻其中有成仙之秘！";
                break;
            case "太初古矿":
                locationDesc = "太初古矿中神源遍地，但也危机四伏！";
                break;
            case "北斗星紫山":
                locationDesc = "紫山之中有无始大帝的传承，但也封印着太古生物！";
                break;
        }
    } else if (didian === "紫薇星域") {
        locationDesc = "紫薇星域浩瀚无垠，蕴含无尽机缘！";
    }
    
    if (locationDesc) {
        allMsgs.push(locationDesc);
    }
    
    // ==== 任务记录 ====
    const A = await channel(e.user_id);
    const renwu = await Read_renwu();
    const i = await found(A);
    if (renwu[i]?.wancheng3 === 1) {
        renwu[i].jilu3 += 1;
        await Write_renwu(renwu);
    }
    
    // ==== 扣除寿元 ====
    await Add_寿元(usr_qq, -weizhi.shouyuan);
    
    // ==== 设置行动状态 ====
    const action_time = 60000 * time;
    const arr = {
        action: '遮天位面历练',
        end_time: new Date().getTime() + action_time,
        time: action_time,
        shutup: '1',
        working: '1',
        Place_action: '0',
        Place_actionplus: '1',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // ==== 最终消息 ====
    allMsgs.push(`开始前往${didian}，${time}分钟后归来！`);

    // ==== 发送所有消息 ====
    return e.reply(allMsgs.join('\n\n'));
}
async Goforbiddenarea(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
    
    const player = await Read_player(usr_qq);
    
    // ==== 法身系统检查 ====
    if (player.法身 === 1) {
        // 检查法身是否可行动
        const nowTime = new Date().getTime();
        if (player.法身恢复时间 && player.法身恢复时间 > nowTime) {
            const remainMinutes = Math.ceil((player.法身恢复时间 - nowTime) / 60000);
            e.reply(`法身正在恢复中，还需${remainMinutes}分钟`);
            return false;
        }
        
        // 检查法身是否已经在行动中
        let isFashanBusy = false;
        let parsedAction = null;
        
        const fashanAction = await redis.get('xiuxian:player:' + usr_qq + ':action:fashan');
        if (fashanAction) {
            parsedAction = JSON.parse(fashanAction);
            if (parsedAction.end_time > nowTime) {
                isFashanBusy = true;
                const m = parseInt((parsedAction.end_time - nowTime) / 1000 / 60);
                const s = parseInt((parsedAction.end_time - nowTime - m * 60 * 1000) / 1000);
                e.reply(`法身正在${parsedAction.action}中，剩余时间：${m}分${s}秒`);
            } else {
                // 法身行动已结束但未清除
                await redis.del('xiuxian:player:' + usr_qq + ':action:fashan');
            }
        }
        
        // 如果法身不忙碌，则使用法身
        if (!isFashanBusy) {
            // 法身代行
            const didian = e.msg.replace('#前往禁地', '').trim();
            const weizhi = data.forbiddenarea_list.find(item => item.name == didian);
            if (!weizhi) {
                return e.reply(`未找到禁地：${didian}`);
            }
            
            // ===== 添加法身时间减少计算 =====
            let time = 30; // 基础时间（分钟）
            // 调用统一方法计算时间缩减
    const { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
            
            // 应用时间减少
            time -= timeReduction;
            // ===== 结束时间减少计算 =====
            
            // 更新法身状态
            player.法身位置 = 4; // 禁地位置
            player.法身行动 = `探索禁地·${didian}`;
            player.法身状态 = `行动中`;
            
            // 保存玩家数据
            await Write_player(usr_qq, player);
            
            // 构建法身消息
            const fashanMsg = [
                `【法身代行】`,
                `${player.名号}盘坐永恒未知之地，万古不动，`,
                `一缕法身降临禁地，代真身探索${didian}！`,
                `法身行动：${time}分钟后归来`
            ].join("\n");
            
            // 设置法身行动状态
            const action_time = 60000 * time; // 使用计算后的时间
            const arr = {
                action: '法身探索禁地',
                isFashan: true, // 标记为法身行动
                end_time: new Date().getTime() + action_time,
                time: action_time,
                shutup: '1',
                working: '1',
                Place_action: '0',
                Place_actionplus: '1',
                power_up: '1',
                mojie: '1',
                xijie: '1',
                plant: '1',
                mine: '1',
                Place_address: weizhi,
            };
            
            if (e.isGroup) {
                arr.group_id = e.group_id;
            }
            
            // 使用专用键存储法身行动
            await redis.set('xiuxian:player:' + usr_qq + ':action:fashan', JSON.stringify(arr));
            
            e.reply(fashanMsg);
            return true;
        }
    }
    
    // ==== 真身探索逻辑 ====
    const didian = e.msg.replace('#前往禁地', '').trim();
    const weizhi = data.forbiddenarea_list.find(item => item.name == didian);
    
    // 检查地点是否存在
    if (!weizhi) {
        return e.reply(`未找到禁地：${didian}`);
    }
    
    // 获取玩家当前境界
    const now_level_id = data.Level_list.find(
        item => item.level_id == player.level_id
    ).level_id;
    
    // 检查境界要求
    if (now_level_id < 22) {
        return e.reply('没有达到化神之前还是不要去了');
    }
    if (didian == '诸神黄昏·旧神界' && now_level_id < 46) {
        return e.reply('没有达到金仙之前还是不要去了');
    }
    if (didian == '始源·混沌初开之地' && now_level_id < 64) {
        return e.reply('没有达到无境之前还是不要去了');
    }
    
    // 收集所有消息
    const allMsgs = [];

    
    // 特殊玩家处理
    const isSpecialPlayer = usr_qq == '4909071520328015562';
    if (isSpecialPlayer) {
        allMsgs.push([
            `【无上存在·巡视禁地】`,
            `${player.名号}为诸天共尊的无上存在，`,
            `此刻巡视禁地，万道臣服，邪祟避退！`,
        ].join('\n'));
    }
    
    // 检查资源是否足够
    if (!isSpecialPlayer) {
        if (player.灵石 < weizhi.Price) {
            return e.reply(`没有灵石寸步难行，攒到${weizhi.Price}灵石才够哦~`);
        }
        if (player.修为 < weizhi.experience) {
            return e.reply(`你需要积累${weizhi.experience}修为，才能抵抗禁地魔气！`);
        }
    }
    
    if (player.寿元 < weizhi.shouyuan) {
        return e.reply('道友这点寿元就不要去了吧，免得原地坐化了');
    }
    
    // 调用统一方法计算时间缩减
    const { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
            player.lastDungeonType = '禁地';
    player.lastDungeonName = didian;
    await Write_player(usr_qq, player);
    // 扣除资源
    await Add_寿元(usr_qq, -weizhi.shouyuan);
    if (!isSpecialPlayer) {
        await Add_灵石(usr_qq, -weizhi.Price);
        await Add_修为(usr_qq, -weizhi.experience); 
    }
    
    // 添加消耗信息
    let costInfo = `消耗：${weizhi.shouyuan}寿元`;
    if (!isSpecialPlayer) {
        costInfo += `，${weizhi.Price}灵石，${weizhi.experience}修为`;
    }
    allMsgs.push(`${player.名号}${costInfo}`);
    
    // 获取基础时间
    const cf = config.getConfig('xiuxian', 'xiuxian');
    let time = cf.CD.forbiddenarea; // 基础时间（分钟）
    

    
    // 应用时间减少
    time -= timeReduction;
    
    // 添加时间减少信息
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            `剩余时间：${time}分钟`,
        ].join('\n'));
    }
    
    // 设置动作状态
    const action_time = 60000 * time; // 持续时间，单位毫秒
    const arr = {
        action: '禁地历练',
        end_time: new Date().getTime() + action_time,
        time: action_time,
        shutup: '1',
        working: '1',
        Place_action: '0',
        Place_actionplus: '1',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    // 使用原键名存储真身行动
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // 根据禁地类型添加特殊描述
    let locationDesc = "";
    switch (didian) {
        case "诸神黄昏·旧神界":
            locationDesc = [
                `【诸神黄昏·旧神界】`,
                `此地曾是神界战场，神血染红大地，神骨铺就道路，`,
                `空气中弥漫着神魔陨落的哀鸣。`,
                `你踏足这片被遗忘的战场，`,
                `感受到远古神魔的怨念在低语，`,
                `破碎的神则碎片在虚空中闪烁。`,
            ].join('\n');
            break;
        case "始源·混沌初开之地":
            locationDesc = [
                `【始源·混沌初开之地】`,
                `混沌初开之地，万物起源之所，`,
                `大道法则在此交织碰撞，形成无数奇观异象。`,
                `你踏入这片混沌未分的领域，`,
                `感受到最原始的大道本源在涌动，`,
                `仿佛回到了开天辟地之初。`,
            ].join('\n');
            break;
        case "幽冥血海":
            locationDesc = [
                `【幽冥血海】`,
                `血海无边，怨魂哀嚎，`,
                `此地汇聚了世间最深的怨念与诅咒。`,
                `你踏入这片血色领域，`,
                `感受到无数怨魂的哀嚎冲击心神，`,
                `血浪翻涌，仿佛要吞噬一切生灵。`,
            ].join('\n');
            break;
        case "九幽魔渊":
            locationDesc = [
                `【九幽魔渊】`,
                `魔气滔天，万魔蛰伏，`,
                `此地是魔道修士的圣地，也是正道修士的噩梦。`,
                `你踏入这片魔气弥漫的深渊，`,
                `感受到无数魔物在黑暗中窥视，`,
                `魔气侵蚀着你的护体神光。`,
            ].join('\n');
            break;
        default:
            locationDesc = [
                `【${didian}】`,
                `禁地之中危机四伏，但也蕴藏着无尽机缘。`,
                `你踏入这片未知的禁地，`,
                `感受到古老而强大的气息在弥漫，`,
                `每一步都需谨慎，每一刻都充满挑战。`,
            ].join('\n');
    }
    
    allMsgs.push(locationDesc);
    
    // 添加主要行动信息
    allMsgs.push(`开始探索${didian}，${time}分钟后归来！`);

    // 一次性发送所有消息
    e.reply(allMsgs.join('\n\n'));
    return true;
}
async GoTimeplace(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
    
    const player = await Read_player(usr_qq);
    
    // ==== 法身系统检查 ====
    if (player.法身 === 1) {
        // 检查法身是否可行动
        const nowTime = new Date().getTime();
        if (player.法身恢复时间 && player.法身恢复时间 > nowTime) {
            const remainMinutes = Math.ceil((player.法身恢复时间 - nowTime) / 60000);
            e.reply(`法身正在恢复中，还需${remainMinutes}分钟`);
            return false;
        }
        
        // 检查法身是否已经在行动中
        let isFashanBusy = false;
        let parsedAction = null;
        
        const fashanAction = await redis.get('xiuxian:player:' + usr_qq + ':action:fashan');
        if (fashanAction) {
            parsedAction = JSON.parse(fashanAction);
            if (parsedAction.end_time > nowTime) {
                isFashanBusy = true;
                const m = parseInt((parsedAction.end_time - nowTime) / 1000 / 60);
                const s = parseInt((parsedAction.end_time - nowTime - m * 60 * 1000) / 1000);
                e.reply(`法身正在${parsedAction.action}中，剩余时间：${m}分${s}秒`);
            } else {
                // 法身行动已结束但未清除
                await redis.del('xiuxian:player:' + usr_qq + ':action:fashan');
            }
        }
        
        // 如果法身不忙碌，则使用法身
        if (!isFashanBusy) {
            // 法身代行
            const didianlist = ['无欲天仙', '仙遗之地'];
            const suiji = Math.round(Math.random()); // 随机一个地方
            const didian = didianlist[suiji]; // 赋值
            const weizhi = data.timeplace_list.find(item => item.name == didian);
            
            if (!weizhi) {
                return e.reply(`未找到仙府：${didian}`);
            }
            
            // ===== 添加法身时间减少计算 =====
            const cf = config.getConfig('xiuxian', 'xiuxian');
            let time = cf.CD.timeplace; // 基础时间（分钟）
            // 调用统一方法计算时间缩减
    const { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
            
            // 应用时间减少
            time -= timeReduction;
            // ===== 结束时间减少计算 =====
            
            // 更新法身状态
            player.法身位置 = 5; // 仙府位置
            player.法身行动 = `探索仙府·${didian}`;
            player.法身状态 = `行动中`;
            
            // 保存玩家数据
            await Write_player(usr_qq, player);
            
            // 构建法身消息
            const fashanMsg = [
                `【法身代行】`,
                `${player.名号}盘坐永恒未知之地，万古不动，`,
                `一缕法身降临仙府，代真身探索${didian}！`,
                `法身行动：${time}分钟后归来`
            ].join("\n");
            
            // 设置法身行动状态
            const action_time = 60000 * time; // 使用计算后的时间
            const arr = {
                action: '法身探索仙府',
                isFashan: true, // 标记为法身行动
                end_time: new Date().getTime() + action_time,
                time: action_time,
                shutup: '1',
                working: '1',
                Place_action: '0',
                Place_actionplus: '1',
                power_up: '1',
                mojie: '1',
                xijie: '1',
                plant: '1',
                mine: '1',
                Place_address: weizhi,
            };
            
            if (e.isGroup) {
                arr.group_id = e.group_id;
            }
            
            // 使用专用键存储法身行动
            await redis.set('xiuxian:player:' + usr_qq + ':action:fashan', JSON.stringify(arr));
            
            e.reply(fashanMsg);
            return true;
        }
    }
    
    // ==== 真身探索逻辑 ====
    const didianlist = ['无欲天仙', '仙遗之地'];
    const suiji = Math.round(Math.random()); // 随机一个地方
    const yunqi = Math.random(); // 运气随机数
    await sleep(1000);
    e.reply('你在冲水堂发现有人上架了一份仙府地图');
    const didian = didianlist[suiji]; // 赋值
    
    if (!isNotNull(player.level_id)) {
        e.reply('请先#同步信息');
        return false;
    }
    
    await sleep(1000);
    if (yunqi > 0.9) {
        // 10%寄
        if (player.灵石 < 50000) {
            e.reply('还没看两眼就被看堂的打手撵了出去说:"哪来的穷小子,不买别看"');
            return false;
        }
        
        e.reply(
            '价格为5w,你觉得特别特别便宜,赶紧全款拿下了,历经九九八十天,到了后发现居然是仙湖游乐场！'
        );
        await Add_灵石(usr_qq, -50000);
        return false;
    }
    
    const now_level_id = data.Level_list.find(
        item => item.level_id == player.level_id
    ).level_id;
    
    if (now_level_id < 21) {
        e.reply('到了地图上的地点，结果你发现,你尚未达到化神,无法抵御灵气压制');
        return false;
    }
    
    const weizhi = data.timeplace_list.find(item => item.name == didian);
    if (!weizhi) {
        e.reply('报错！地点错误，请找群主反馈');
        return false;
    }
    
    if (player.灵石 < weizhi.Price) {
        e.reply('你发现标价是' + weizhi.Price + ',你买不起赶紧溜了');
        return false;
    }
    
    if (player.修为 < 100000) {
        e.reply(
            '到了地图上的地点，发现洞府前有一句前人留下的遗言:"至少有10w修为才能抵御仙威！"'
        );
        return false;
    }
    
    let dazhe = 1;
    if (
        (await exist_najie_thing(usr_qq, '仙府通行证', '道具')) &&
        player.魔道值 < 1 &&
        (player.灵根.type == '转生' || player.level_id > 41)
    ) {
        dazhe = 0;
        e.reply(player.名号 + '使用了道具仙府通行证,本次仙府免费');
        await Add_najie_thing(usr_qq, '仙府通行证', '道具', -1);
    }
    
    const Price = weizhi.Price * dazhe;
            player.lastDungeonType = '仙府';
    player.lastDungeonName = didian;
    await Write_player(usr_qq, player);
    await Add_灵石(usr_qq, -Price);
    await Add_修为(usr_qq, -100000);
    
    const cf = config.getConfig('xiuxian', 'xiuxian');
    let time = cf.CD.timeplace; // 时间（分钟）
     // 调用统一方法计算时间缩减
    const { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
    // 应用时间减少
    time -= timeReduction;
    
    const action_time = 60000 * time; // 持续时间，单位毫秒
    const arr = {
        action: '探索仙府', // 动作
        end_time: new Date().getTime() + action_time,
        time: action_time,
        shutup: '1',
        working: '1',
        Place_action: '0',
        Place_actionplus: '1',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    // 更新任务记录
    const A = await channel(e.user_id);
    const renwu = await Read_renwu();
    const i = await found(A);
    if (renwu[i]?.wancheng3 === 1) {
        renwu[i].jilu3 += 1;
        await Write_renwu(renwu);
    }
    
    // 使用原键名存储真身行动
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // 构建回复消息
    let replyMsg = '';
    if (suiji === 0) {
        replyMsg = '你买下了那份地图,历经九九八十一天,终于到达了地图上的仙府,洞府上模糊得刻着[' +
            weizhi.name +
            '仙府]你兴奋地冲进去探索机缘,被强大的仙气压制，消耗了100000修为成功突破封锁闯了进去' +
            time +
            '分钟后归来!';
    } else {
        replyMsg = '你买下了那份地图,历经九九八十一天,终于到达了地图上的地点,这座洞府仿佛是上个末法时代某个仙人留下的遗迹,你兴奋地冲进去探索机缘,被强大的仙气压制，消耗了100000修为成功突破封锁闯了进去' +
            time +
            '分钟后归来!';
    }

    e.reply(replyMsg);
    return false;
}

async Gofairyrealm(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    const player = await Read_player(usr_qq);
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
     // 检查是否已在目标地点
    if (player.power_place != 1) {
        return e.reply(`你不在仙界`);
    }
    
    const didian = e.msg.replace('#镇守仙境', '').trim();
    
    // 获取仙境信息
    const weizhi = data.Fairyrealm_list.find(item => item.name == didian);
    if (!weizhi) {
        return e.reply(`未找到仙境：${didian}`);
    }
    
    // 收集所有消息
    const allMsgs = [];
    
    // ==== 原有判断条件保持不变 ====
    // 检查等级要求
    const now_level_id = data.Level_list.find(
        item => item.level_id == player.level_id
    ).level_id;
    
    // 境界不足检查
    if (now_level_id < 42 && player.lunhui == 0) {
        return e.reply([
            `【轮回未启】`,
            `仙境乃仙人之地，非成仙者不可入！`,
            `道友当前并未成仙，无法踏足仙境。`,
        ].join('\n'));
    }
    
    if (didian == "杀神崖" && now_level_id < 50) {
        return e.reply([
            `【境界不足】`,
            `杀神崖乃仙王喋血之地，`,
            `非究极仙王不可踏足！`,
            `道友当前境界不足，请谨慎行事。`,
        ].join('\n'));
    }
    
    // 特殊仙境检查
    if (didian == "诸天") {
        if (player.灵根.name !== "九转轮回体" && player.灵根.name !== "命运神道体"&& player.灵根.type !== "神魔体") {
            return e.reply([
                `【轮回者专属】`,
                `诸天乃轮回之地，`,
                `只有真正圆满的轮回者方可踏足！`,
                `道友轮回未达圆满，无法进入。`,
            ].join('\n'));
        }
    }
    
    if (didian == "真魔殿") {
        if (player.灵根.name !== "九重魔功" && player.灵根.name !== "极道天魔"&& player.灵根.type !== "神魔体") {
            return e.reply([
                `【真魔专属】`,
                `真魔殿乃万魔朝圣之地，`,
                `只有真正极致之魔才能踏足！`,
                `道友魔中巨擘，无法进入。`,
            ].join('\n'));
        }
    }
        if (didian == "光阴之外") {
        if (player.灵根.type !== "命运" && player.灵根.type !== "天魔"&& player.灵根.type !== "神魔体") {
            return e.reply([
                `【超脱者专属】`,
                `光阴之外乃超越极限之地，`,
                `只有真正的超脱者才能踏足！`,
                `道友非超脱者，无法进入。`,
            ].join('\n'));
        }
    }
    // 检查资源是否足够
    if (player.灵石 < weizhi.Price) {
        return e.reply(`没有灵石寸步难行，攒到${weizhi.Price}灵石才够哦~`);
    }
    if (player.寿元 < weizhi.shouyuan) {
        return e.reply('道友这点寿元就不要去了吧，免得原地坐化了');
    }
    
    // 特殊仙境处理
let specialMsg = "";
if (didian === "往世星海") {
    const shenyu = await exist_najie_thing(usr_qq, "群星秘钥", "道具");
    if (!shenyu || shenyu < 1) {
        return e.reply("群星秘钥缺失，星海之门拒绝开启。");
    }
    if (player.level_id <= 54) {
        return e.reply("万界道祖方可踏入星海，当前境界不足。");
    }
    await Add_najie_thing(usr_qq, "群星秘钥", "道具", -1);
    specialMsg = [
        `【星海归航】`,
        `你以群星秘钥叩响天穹，亿万星辉垂落，`,
        `混沌海分开一条璀璨光道，直指星海核心。`,
        `刹那之间，神魂超脱万界，抵达往世星海！`
    ].join('\n');
    allMsgs.push(specialMsg);
}

    if (didian === "神域星宫") {
        const shenyu = await exist_najie_thing(usr_qq, "神域令牌", "道具");
        if (!shenyu || shenyu < 1) {
            return e.reply("你需要神域令牌才能前往神域星宫");
        }
        if (player.level_id <= 54) {
            return e.reply("只有万界道祖级强者才能前往天外天");
        }
        await Add_najie_thing(usr_qq, "神域令牌", "道具", -1);
        specialMsg = [
            `【神域感召】`,
            `${player.名号}消耗了1个神域令牌，`,
            `神魂受到神域主宰感召指引，`,
            `脱离万界遨游混沌海前往神域星宫！`,
        ].join('\n');
        allMsgs.push(specialMsg);
    }
    
    if (didian === "瑞泽云海") {
        const xianzhou = await exist_najie_thing(usr_qq, "仙舟", "道具");
        if (!xianzhou || xianzhou < 1) {
            return e.reply("你需要仙舟才能前往瑞泽云海");
        }
        await Add_najie_thing(usr_qq, "仙舟", "道具", -1);
        specialMsg = [
            `【仙舟渡海】`,
            `${player.名号}乘坐仙舟，`,
            `穿越云海，寻找仙兽们留下的福泽！`,
        ].join('\n');
        allMsgs.push(specialMsg);
    }
    
    // 折扣处理
    let dazhe = 1; // 默认无折扣
    let discountMsg = "";
    
    if (didian === '杀神崖') {
        if (await exist_najie_thing(usr_qq, '杀神崖通行证', '道具') && 
            player.魔道值 < 1 && 
            (player.灵根.type == '转生' || player.level_id > 41)) {
            dazhe = 0;
            discountMsg = [
                `【通行证特权】`,
                `${player.名号}使用了杀神崖通行证，`,
                `本次镇守免费！`,
            ].join('\n');
            await Add_najie_thing(usr_qq, '杀神崖通行证', '道具', -1);
        }
    } else {
        if (await exist_najie_thing(usr_qq, '仙境优惠券', '道具') && 
            player.魔道值 < 1 && 
            (player.灵根.type == '转生' || player.level_id > 41)) {
            dazhe = 0.5;
            discountMsg = [
                `【优惠券特权】`,
                `${player.名号}使用了仙境优惠券，`,
                `本次消耗减少50%！`,
            ].join('\n');
            await Add_najie_thing(usr_qq, '仙境优惠券', '道具', -1);
        }
    }
    
    if (discountMsg) {
        allMsgs.push(discountMsg);
    }
    
    // 调用统一方法计算时间缩减
    const { timeReduction, msgs } = await calculateTimeReduction(player);
    allMsgs.push(...msgs);
    
    // 计算实际消耗
    let Price = Math.floor(weizhi.Price * dazhe);
    let shouyuan = weizhi.shouyuan;
            player.lastDungeonType = '仙境';
    player.lastDungeonName = didian;
    await Write_player(usr_qq, player);
    // 扣除资源
    await Add_灵石(usr_qq, -Price);
    await Add_寿元(usr_qq, -shouyuan);
    
    // 收集消耗信息
    let costInfo = `消耗：${shouyuan}寿元`;
    if (Price > 0) {
        costInfo += `，${Price}灵石`;
    }
    allMsgs.push(`${player.名号}${costInfo}`);
    
    // 更新任务记录
    const A = await channel(e.user_id);
    const renwu = await Read_renwu();
    const i = await found(A);
    if (renwu[i]?.wancheng3 === 1) {
        renwu[i].jilu3 += 1;
        await Write_renwu(renwu);
    }
    
    // 获取基础时间
    const cf = config.getConfig('xiuxian', 'xiuxian');
    let time = cf.CD.secretplace; // 基础时间（分钟）

    
    // ==== 法身系统检查 ====
    if (player.法身 === 1) {
        // 检查法身是否可行动
        const nowTime = new Date().getTime();
        if (player.法身恢复时间 && player.法身恢复时间 > nowTime) {
            const remainMinutes = Math.ceil((player.法身恢复时间 - nowTime) / 60000);
            e.reply(`法身正在恢复中，还需${remainMinutes}分钟`);
            // 不返回，继续执行真身逻辑
        } else {
            // 检查法身是否已经在行动中
            let isFashanBusy = false;
            let parsedAction = null;
            
            const fashanAction = await redis.get('xiuxian:player:' + usr_qq + ':action:fashan');
            if (fashanAction) {
                parsedAction = JSON.parse(fashanAction);
                if (parsedAction.end_time > nowTime) {
                    isFashanBusy = true;
                    const m = parseInt((parsedAction.end_time - nowTime) / 1000 / 60);
                    const s = parseInt((parsedAction.end_time - nowTime - m * 60 * 1000) / 1000);
                    e.reply(`法身正在${parsedAction.action}中，剩余时间：${m}分${s}秒`);
                } else {
                    // 法身行动已结束但未清除
                    await redis.del('xiuxian:player:' + usr_qq + ':action:fashan');
                }
            }
            
            // 如果法身不忙碌，则使用法身
            if (!isFashanBusy) {
                // 法身代行
                const fashanTime = time - timeReduction; // 法身实际时间
                
                // 更新法身状态
                player.法身位置 = 0; // 仙境位置编号
                player.法身行动 = `镇守仙境·${didian}`;
                player.法身状态 = `行动中`;
                
                // 保存玩家数据
                await Write_player(usr_qq, player);
                
                // 构建法身消息
                const fashanMsg = [
                    `【法身代行】`,
                    `${player.名号}盘坐永恒未知之地，万古不动，`,
                    `一缕法身降临仙境，代真身镇守${didian}！`,
                    `法身行动：${fashanTime}分钟后归来`
                ].join("\n");
                allMsgs.push(fashanMsg);
                
                // 设置法身行动状态
                const action_time = 60000 * fashanTime; // 持续时间，单位毫秒
                const arr = {
                    action: '法身镇守仙境',
                    isFashan: true,
                    end_time: new Date().getTime() + action_time,
                    time: action_time,
                    shutup: '1',
                    working: '1',
                    Place_action: '0',
                    Place_actionplus: '1',
                    power_up: '1',
                    mojie: '1',
                    xijie: '1',
                    plant: '1',
                    mine: '1',
                    Place_address: weizhi,
                };
                
                if (e.isGroup) {
                    arr.group_id = e.group_id;
                }
                
                await redis.set('xiuxian:player:' + usr_qq + ':action:fashan', JSON.stringify(arr));
                
                // 发送消息
                e.reply(allMsgs.join('\n\n'));
                return true;
            }
        }
    }
    
 
    
    // 应用时间减少
    time = time  - timeReduction;
    
    // 添加时间减少汇总
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            `剩余时间：${time}分钟`,
        ].join('\n'));
    }
    
    // 设置行动状态
    const action_time = 60000 * time; // 持续时间，单位毫秒
    const arr = {
        action: '镇守仙境',
        end_time: new Date().getTime() + action_time,
        time: action_time,
        shutup: '1',
        working: '1',
        Place_action: '0',
        Place_actionplus: '1',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    // 使用原键名存储真身行动
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // 根据仙境类型添加特殊描述
    let locationDesc = "";
    switch (didian) {
        case "神域星宫":
            locationDesc = [
                `【神域星宫·混沌之巅】`,
                `神域星宫悬浮于混沌海之上，`,
                `是诸天万界至高无上的存在！`,
                `镇守此地可获得神域主宰的恩赐，`,
                `沐浴混沌神光，感悟无上大道！`,
            ].join('\n');
            break;
        case "瑞泽云海":
            locationDesc = [
                `【瑞泽云海·仙兽福地】`,
                `瑞泽云海祥云缭绕，瑞气千条，`,
                `曾是仙兽栖息之地！`,
                `镇守此地可寻得仙兽遗留的福泽，`,
                `沐浴祥瑞之气，感悟生命真谛！`,
            ].join('\n');
            break;
        case "瑶池仙境":
            locationDesc = [
                `【瑶池仙境·仙家福地】`,
                `瑶池仙境仙气缭绕，琼楼玉宇，`,
                `蟠桃仙树遍地，灵泉涌动！`,
                `镇守此地可沐浴仙光，洗涤凡尘，`,
                `延年益寿，感悟长生之道！`,
            ].join('\n');
            break;
        case "蓬莱仙岛":
            locationDesc = [
                `【蓬莱仙岛·长生秘境】`,
                `蓬莱仙岛隐于东海，仙草遍地，`,
                `灵泉涌动，仙鹤翱翔！`,
                `镇守此地可感悟长生之道，`,
                `采仙草，饮灵泉，逍遥自在！`,
            ].join('\n');
            break;
        case "杀神崖":
            locationDesc = [
                `【杀神崖·仙王喋血】`,
                `杀神崖上，仙王喋血，神骨铺路！`,
                `此地弥漫着无尽杀伐之气！`,
                `镇守此地可感悟杀伐之道，`,
                `磨砺意志，淬炼神魂！`,
            ].join('\n');
            break;
        default:
            locationDesc = [
                `【仙境镇守】`,
                `仙境之中灵气充沛，`,
                `是修行悟道的绝佳之地！`,
                `镇守此地可感悟天地大道，`,
                `提升修为，淬炼道心！`,
            ].join('\n');
    }
    
    allMsgs.push(locationDesc);
    
    // 添加主要行动信息
    allMsgs.push(`开始镇守${didian}，${time}分钟后归来！`);

    // 一次性发送所有消息
    e.reply(allMsgs.join('\n\n'));
    return true;
}

  async Giveup(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
      e.reply('没存档你逃个锤子!');
      return false;
    }
      // 读取玩家数据
    const player = await Read_player(usr_qq);
    
   
    //获取游戏状态
    let game_action = await redis.get(
      'xiuxian:player:' + usr_qq + ':game_action'
    );
    //防止继续其他娱乐行为
    if (game_action == 0) {
      e.reply('修仙：游戏进行中...');
      return false;
    }
    // 查询redis中的人物动作
let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
action = JSON.parse(action);

// 不为空，有状态
if (action != null) {
            if (action.action === '探索界海') {
            const weizhi = action.Place_address;
            const now_time = new Date().getTime();
           const remaining_time = action.end_time - now_time; // 剩余毫秒数
    const remaining_minutes = Math.floor(remaining_time / (1000 * 60));
    const remaining_seconds = Math.floor((remaining_time % (1000 * 60)) / 1000);
    
    e.reply([
        `【界海·无路可退】`,
        `你身处界海深处，前有黑暗风暴肆虐，后有诡异低语回荡！`,
        `界海浩瀚无垠，时空错乱，一旦踏入便无回头之路！`,
        ``,
        `黑暗物质如潮水般涌来，诡异源头在低语：`,
        `"既入界海，便为祭品！"`,
        ``,
        `你已前行${elapsed_minutes}分${elapsed_seconds}秒，但退路早已被时空乱流吞噬！`,
        `界海堤坝上，帝落时代的脚印已被黑暗潮汐抹去！`,
        ``,
        `此刻，唯有前行！`,
        `待探索完成（${remaining_minutes}分${remaining_seconds}秒后），方有归途！`,
        ``,
        `界海凶险，万古皆寂！`,
        `准仙帝踏入亦九死一生，仙王骸骨铺就前路！`,
        `既已踏足，唯有血战到底！`,
    ].join('\n'));
    return false;}
    // 处理传送任务（位面传送）的取消
    if (action.action === '位面传送') {
        // 删除传送任务
        await redis.del(`xiuxian:travel_task:${usr_qq}`);
        
        // 清除行动状态
        await redis.del(`xiuxian:player:${usr_qq}:action`);
        
        // 计算已消耗的时间比例
        const now = Date.now();
        const elapsed = now - action.start_time;
        const totalTime = action.end_time - action.start_time;
        const progress = Math.min(1, elapsed / totalTime);
        
        // 部分返还资源（根据进度）
        const xiuweiRefund = Math.floor(action.xiuwei_cost * (1 - progress) * 0.5); // 返还50%的剩余资源
        const qixueRefund = Math.floor(action.qixue_cost * (1 - progress) * 0.5);
        const shouyuanRefund = Math.floor(action.shouyuan_cost * (1 - progress) * 0.5);
        // 更新玩家资源
        const player = await Read_player(usr_qq);
        player.修为 += xiuweiRefund;
        player.血气 += qixueRefund;
         player.寿元 += shouyuanRefund;
        await Write_player(usr_qq, player);
        
        // 构建消息
        const refundMsg = [];
        if (xiuweiRefund > 0) {
            refundMsg.push(`返还修为：${xiuweiRefund}`);
        }
        if (qixueRefund > 0) {
            refundMsg.push(`返还血气：${qixueRefund}`);
        }
        if (shouyuanRefund > 0) {
            refundMsg.push(`返还寿元：${shouyuanRefund}`);
        }
        e.reply([
            `【强行中断·位面穿梭】`,
            `你强行中断了从${action.from_name}到${action.to_name}的传送！`,
            `空间通道崩塌，你被甩出虚空乱流`,
            ...refundMsg,
            `警告：强行中断传送可能导致修为受损，请谨慎使用！`
        ].join('\n'));
        
        return false;
    }
    
    // 处理秘境状态的取消（原有逻辑）
    if (
        action.Place_action == '0' ||
        action.Place_actionplus == '0' ||
        action.mojie == '0'
    ) {
        // 把状态都关了
        let arr = action;
        arr.is_jiesuan = 1; // 结算状态
        arr.shutup = 1; // 闭关状态
        arr.working = 1; // 降妖状态
        arr.power_up = 1; // 渡劫状态
        arr.Place_action = 1; // 秘境
        arr.Place_actionplus = 1; // 状态
        arr.mojie = 1;
        arr.end_time = new Date().getTime(); // 结束的时间也修改为当前时间
        delete arr.group_id; // 结算完去除group_id
        
        await redis.set(
            'xiuxian:player:' + usr_qq + ':action',
            JSON.stringify(arr)
        );
        
        e.reply('你已逃离秘境！');
        return false;
    }
}
    return false;
  }
  async quickReplay(e) {
  if (!verc({ e })) return false;

    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
  const player = await Read_player(usr_qq);

  // 读玩家自身记录的快捷副本
  const { lastDungeonType: type, lastDungeonName: place } = player;
  if (!type || !place) {
    return e.reply('你还没有下过任何副本，请先使用完整指令（如#降临秘境灵墟洞天）');
  }

  // 拼出完整指令
  const cmdMap = {
    秘境:     `#降临秘境${place}`,
    禁地:     `#前往禁地${place}`,
    遮天位面: `#前往遮天位面${place}`,
    下界八域: `#前往下界八域${place}`,
    九天十地: `#前往九天十地${place}`,
    仙境:     `#镇守仙境${place}`,
    界海:     `#探索界海${place}`,
    仙府:     `#探索仙府`,      // 仙府本身不带地名
  };
  const fullCmd = cmdMap[type];
  if (!fullCmd) return e.reply('记录的副本类型异常，请重新使用完整指令');

  // 直接复用原逻辑
  e.msg = fullCmd;

  // 重新分发
  if (type === '秘境')     return this.Gosecretplace(e);
  if (type === '禁地')     return this.Goforbiddenarea(e);
  if (type === '遮天位面') return this.Gozhetian(e);
  if (type === '下界八域') return this.Goxiajie(e);
  if (type === '九天十地') return this.Gojiutianshidi(e);
  if (type === '仙境')     return this.Gofairyrealm(e);
  if (type === '界海')     return this.Gojiehaiplace(e);
  if (type === '仙府')     return this.GoTimeplace(e);
}
// 接引玩家功能
async jieyinPlayer(e) {
  // 群聊限定
  if (!e.isGroup) {
    e.reply('修仙游戏请在群聊中游玩');
    return;
  }
  
  // 获取操作者信息
  const usr_qq = e.user_id;
  const player = await Read_player(usr_qq);
  
  // 检查操作者境界
  if (player.mijinglevel_id < 18) {
    return e.reply([
      `【接引失败·境界不足】`,
      `唯有仙王级强者方可施展接引神通！`,
      `你当前秘境等级：${player.mijinglevel_id}级`,
      `需达到18级（仙王）方可接引其他道友。`
    ].join('\n'));
  }
  
  // 检查是否有艾特信息
  const atItems = e.message.filter(item => item.type === "at");
  if (atItems.length === 0) {
    return e.reply("请艾特需要接引的玩家");
  }
  
  // 获取目标玩家QQ
  const targetQQ = atItems[0].qq;
  
  // 验证目标玩家
  if (!await existplayer(targetQQ)) {
    return e.reply("目标玩家不存在，请先创建角色");
  }
  
  const targetPlayer = await Read_player(targetQQ);
  
  
  // 地点映射表
  const LOCATION_MAP = {
    '凡间': 0,
    '仙界': 1, 
    '下界八域': 1.5,
    '遮天位面': 2,
    '九天十地': 2.5,
    '界海': 3,
    '时间长河': 4,
    '永恒未知之地': 5,
    '仙域': 6
  };
  
  // 接引到接引者当前位面
  const currentLocation = Object.keys(LOCATION_MAP).find(key => LOCATION_MAP[key] === player.power_place) || '未知位面';
  
  // 执行接引
  targetPlayer.power_place = player.power_place;
  await Write_player(targetQQ, targetPlayer);
  
  // 构建回复消息
  const message = [
    `【仙王神通·接引道友】`,
    `${player.名号}施展仙王级接引神通，`,
    `将道友${targetPlayer.名号 || targetQQ}接引至${currentLocation}！`,
    ``,
    `【接引效果】`,
    `- 目标位面：${currentLocation}`,
    `- 被接引者：${targetPlayer.名号 || targetQQ}`,
    `- 接引者：${player.名号 || usr_qq}`,
    ``,
    `仙王神通，横渡虚空，不过弹指之间！`
  ].join("\n");
  
  return e.reply(message);
}



// 送往玩家功能
async sendPlayerToLocation(e) {
  // 群聊限定
  if (!e.isGroup) {
    e.reply('修仙游戏请在群聊中游玩');
    return;
  }
  
  // 获取操作者信息
  const usr_qq = e.user_id;
  const player = await Read_player(usr_qq);
  
  // 检查操作者境界
  if (player.mijinglevel_id < 18) {
    return e.reply([
      `【传送失败·境界不足】`,
      `唯有仙王级强者方可施展传送神通！`,
      `你当前秘境等级：${player.mijinglevel_id}级`,
      `需达到18级（仙王）方可传送其他道友。`
    ].join('\n'));
  }
  
  // 检查是否有艾特信息
  const atItems = e.message.filter(item => item.type === "at");
  if (atItems.length === 0) {
    return e.reply("请艾特需要传送的玩家");
  }
  
  // 获取目标玩家QQ
  const targetQQ = atItems[0].qq;
  
  // 处理消息内容：去掉指令前缀和所有艾特
  let content = e.msg.replace(/^#送往\s*/, '');
  content = content.replace(/\[CQ:at,qq=\d+\]\s*/g, '');
  const location = content.trim();
  
  // 如果没有提取到地点名称，提示用户输入
  if (!location) {
    return e.reply("请指定要传送的目标地点，例如：#送往 @QQ号 凡间");
  }
  
  // 地点映射表
  const LOCATION_MAP = {
    '凡间': 0,
    '仙界': 1, 
    '下界八域': 1.5,
    '遮天位面': 2,
    '九天十地': 2.5,
    '界海': 3,
    '时间长河': 4,
    '永恒未知之地': 5,
    '仙域': 6
  };
  
  // 检查是否有效地点
  if (!LOCATION_MAP.hasOwnProperty(location)) {
    return e.reply(`无效地点：${location}\n可用地点：凡间、仙界、下界八域、遮天位面、九天十地、仙域、界海、时间长河、永恒未知之地`);
  }
  
  // 验证目标玩家
  if (!await existplayer(targetQQ)) {
    return e.reply("目标玩家不存在，请先创建角色");
  }
  
  const targetPlayer = await Read_player(targetQQ);
  
  
  // 特殊地点的境界要求检查
  if (location === '时间长河') {
    // 检查发送者境界
    if (player.mijinglevel_id < 20 && player.xiangulevel_id < 20) {
      return e.reply([
        `【时间长河·境界不足】`,
        `时间长河乃万古岁月汇聚之地，`,
        `唯有准仙帝级强者方可传送他人前往！`,
        `你当前境界不足，无法施展此等神通。`
      ].join('\n'));
    }
    
    // 检查被传送者境界
    if (targetPlayer.mijinglevel_id < 20 && targetPlayer.xiangulevel_id < 20) {
      return e.reply([
        `【时间长河·因果反噬】`,
        `该道友境界不足，无法承受时间长河的因果！`,
        `强行传送可能导致其道基崩溃，`,
        `需准仙帝级强者方可踏足时间长河。`
      ].join('\n'));
    }
  }
  
  if (location === '永恒未知之地') {
    // 检查发送者境界
    if (player.mijinglevel_id < 21 && player.xiangulevel_id < 21) {
      return e.reply([
        `【永恒未知之地·境界不足】`,
        `永恒未知之地乃超脱诸天之外的存在，`,
        `唯有仙帝级强者方可传送他人前往！`,
        `你当前境界不足，无法施展此等神通。`
      ].join('\n'));
    }
    
    // 检查被传送者境界
    if (targetPlayer.mijinglevel_id < 21 && targetPlayer.xiangulevel_id < 21) {
      return e.reply([
        `【永恒未知之地·因果反噬】`,
        `该道友境界不足，无法承受永恒未知之地的因果！`,
        `强行传送可能导致其形神俱灭，`,
        `需仙帝级强者方可踏足永恒未知之地。`
      ].join('\n'));
    }
  }
  
  // 执行传送
  const targetLocation = LOCATION_MAP[location];
  targetPlayer.power_place = targetLocation;
  await Write_player(targetQQ, targetPlayer);
  
  // 构建回复消息
  const message = [
    `【仙王神通·传送道友】`,
    `${player.名号}施展仙王级传送神通，`,
    `将道友${targetPlayer.名号 || targetQQ}送往${location}！`,
    ``,
    `【传送效果】`,
    `- 目标地点：${location}`,
    `- 被传送者：${targetPlayer.名号 || targetQQ}`,
    `- 传送者：${player.名号 || usr_qq}`,
    ``,
    `仙王神通，跨越位面，不过弹指之间！`
  ].join("\n");
  
  return e.reply(message);
}

// 副本掉落指令处理
async handleDungeonDrop(e) {
    // 1. 解析指令（提取地点名）
    const msg = e.msg.replace(/^#副本掉落\s*/, "").trim();
    if (!msg) {
        return e.reply("❌ 指令格式错误！请使用：#副本掉落[地点名]（如#副本掉落灵墟洞天）");
    }
    const placeName = msg;

    // 2. 定义所有可能的地图数据源
    const allAtlasLists = [
        { name: "遮天位面", list: data.zhetian_list },
        { name: "上苍之上", list: data.shangcang_list },
        { name: "下界八域", list: data.xiajie_list },
        { name: "禁地", list: data.forbiddenarea_list },
        { name: "仙境", list: data.Fairyrealm_list },
        { name: "秘境", list: data.didian_list },
        { name: "九天十地", list: data.jiutianshidi_list },
        { name: "仙府", list: data.timeplace_list },
        { name: "宗门秘境", list: data.guildSecrets_list },
    ];

    // 3. 在所有地图中查找指定地点
    let foundPlace = null;
    let placeType = "未知类型";
    
    for (const atlas of allAtlasLists) {
        if (atlas.list && Array.isArray(atlas.list)) {
            foundPlace = atlas.list.find(item => item.name === placeName);
            if (foundPlace) {
                placeType = atlas.name;
                break;
            }
        }
    }

    // 4. 校验地点是否存在
    if (!foundPlace) {
        return e.reply(`未找到地点：${placeName}`);
    }

    // 5. 准备渲染数据（包含所有掉落等级）
    const renderData = {
        title: `${placeType}·${foundPlace.name}`,
        placeData: {
            Grade: foundPlace.Grade || "未知等级",
            name: foundPlace.name,
            Best: foundPlace.Best || [],
            Price: foundPlace.Price || 0,
            experience: foundPlace.experience || 0,
            shouyuan: foundPlace.shouyuan || 0,
            // 包含所有四个等级的掉落物品
            one: foundPlace.one || [],
            two: foundPlace.two || [],
            three: foundPlace.three || [],
            four: foundPlace.four || []
        }
    };

    try {
        // 6. 调用图片生成方法
        const imgBuffer = await get_dungeon_drop_img(e, renderData);
        return e.reply(imgBuffer);
    } catch (err) {
        console.error("生成副本掉落图片失败:", err);
        return e.reply("生成副本掉落图片失败，请稍后再试");
    }
}


}
// 获取掉落图片（复用现有get_diaoluo_img）
export async function get_dungeon_drop_img(e, renderData) {
    // 准备模板数据
    const templateData = {
        title: renderData.title,
        placeData: renderData.placeData,
        user_id: e.user_id,
        pluResPath: e.pluResPath
    };

    // 使用Show类处理模板
    const renderedData = await new Show(e).get_dungeon_drop_template(templateData);

    // 生成图片
    return await puppeteer.screenshot('dungeon_drop', {
        ...renderedData,
        userId: e.user_id,
        playerName: e.player?.名号 || "未知修士"
    });
}
/**
 * 我的任务
 * @return image
 */

export async function get_renwu_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  let player = await Read_player(usr_qq);
  let user_A;
  let A = e.user_id;
  user_A = A;
  let renwu11 = await Read_renwu();
  let x = await found(user_A);
  let shifu = await find_renwu(A);
  //无存档
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
      return;
  }
  //判断对方有没有存档
  if (shifu == 0) {
      e.reply('你还没有收过徒弟');
      return;
  }

  let action = await find_renwu(A);
  if (action == false) {
      await fstadd_renwu(A);
  }
  let newaction = await Read_renwu();
  let i;
  for (i = 0; i < newaction.length; i++) {
      if (newaction[i].player == A) {
          //这里是显示
          let dengji = renwu11[x].等级
          let xuyao1 = (dengji * 5 + player.level_id + player.Physique_id) * 20000
          let xuyao2 = (dengji * 5 + player.level_id + player.Physique_id) * 20000
          let xuyao3 = dengji + 1
          let ass;
          ass = newaction[i].经验;
          let renwu1 = '当前没有任务';
          let renwu2 = '当前没有任务';
          let renwu3 = '当前没有任务';
          if (renwu11[x].wancheng1 == 1) {
              renwu1 = `消耗${xuyao1}灵石(每次提交任务时才会刷新)`
          }
          if (renwu11[x].wancheng2 == 1) {
              renwu2 = `获取${xuyao2}灵石(每次提交任务时才会刷新)`
          }
          if (renwu11[x].wancheng3 == 1) {
              renwu3 = `前往${xuyao3}次秘境(沉迷不计入)`
          }
          let wc1;
          let wc2;
          let wc3;
          let rw1 = renwu11[x].jilu1;
          let rw2 = renwu11[x].jilu2;
          let rw3 = renwu11[x].jilu3;
          let wcrw1 = xuyao1;
          let wcrw2 = xuyao2;
          let wcrw3 = xuyao3;
          let new1 = newaction[x].等级;
          let shengji = (dengji * 2200 + 1000) * 10 + 2333
          let need = shengji;
          let need1 = Strand(ass, need);
          let renwu = `还有任务没完成哦~`;
          if (renwu11[x].renwu == 1) {
              renwu = `未领取,输入"#领取每日奖励"领取哦~`
          } else if (renwu11[x].renwu == 2) {
              renwu = `已领取`
          }
          if (renwu11[x].wancheng1 == 0) {
              wc1 = '(未接取)';
          } else if (renwu11[x].wancheng1 == 1) {
              wc1 = '(未完成)';
          } else if (renwu11[x].wancheng1 == 2) {
              wc1 = '(已完成)';
          }
          if (renwu11[x].wancheng2 == 0) {
              wc2 = '(未接取)';
          } else if (renwu11[x].wancheng2 == 1) {
              wc2 = '(未完成)';
          } else if (renwu11[x].wancheng2 == 2) {
              wc2 = '(已完成)';
          }
          if (renwu11[x].wancheng3 == 0) {
              wc3 = '(未接取)';
          } else if (renwu11[x].wancheng3 == 1) {
              wc3 = '(未完成)';
          } else if (renwu11[x].wancheng3 == 2) {
              wc3 = '(已完成)';
          }
          let renwu_data = {
              user_id: usr_qq,
              minghao: player.名号,
              jingyan: ass,
              dengji: new1,
              xuyao: need,
              baifenbixuyao: need1,
              rw1: renwu1,
              rw2: renwu2,
              rw3: renwu3,
              wancheng1: wc1,
              wancheng2: wc2,
              wancheng3: wc3,
              zhuangtai: renwu,
              wc1: rw1,
              wc2: rw2,
              wc3: rw3,
              xuyao1: wcrw1,
              xuyao2: wcrw2,
              xuyao3: wcrw3,
          };
          const data1 = await new Show(e).get_renwuData(renwu_data);
          return await puppeteer.screenshot('renwu', {
              ...data1,
          });
      }
  }
}


/**
* @description: 进度条渲染
* @param {Number} res 百分比小数
* @return {*} css样式
*/

async function found(A) {
  let renwu = await Read_renwu();
  let i;
  for (i = 0; i < renwu.length; i++) {
      if (renwu[i].player == A) {
          break;
      }
  }
  return i;
}

function Strand(now, max) {
  let num = (now / max * 100).toFixed(0);
  let mini
  if (num > 100) {
      mini = 100
  } else {
      mini = num
  }
  let strand = {
      style: `style=width:${mini}%`,
      num: num
  };
  return strand
}
/**
 * 计算时间缩减效果并生成对应消息
 * @param {Object} player 玩家对象
 * @returns {Object} 包含时间缩减值和消息数组的对象
 */
async function calculateTimeReduction(player) {
    let timeReduction = 0;
    const msgs = [];
    
    // 检查玩家是否拥有行字秘
    const hasXingziMi = player.学习的功法.includes('行字秘');
    
    // 检查玩家是否拥有天璇步法（且没有行字秘）
    const hasTianxuanBufa = !hasXingziMi && player.学习的功法.includes('天璇步法');

    // 行字秘效果（优先级最高）
    if (hasXingziMi) {
        let xingziReduction = 2;
        const xingziTexts = [
            `【行字秘·极速奥义】`,
            `你足下道纹流转，身形如电，`,
            `施展行字秘，速度骤增！`,
            `行字秘运转间：`,
            `- 步伐玄妙，缩地成寸`,
            `- 身形飘忽，难觅踪迹`
        ];

        // 根据境界增强效果
        if (player.mijinglevel_id >= 9) {
            xingziReduction += 1;
            xingziTexts.push(`脚下金莲隐现，速度更上一层`);
        }
        if (player.mijinglevel_id >= 16) {
            xingziReduction += 1;
            xingziTexts.push(`时光碎片缭绕，触及时间领域`);
        }

        xingziTexts.push(
            `"天下极速，唯我行字！"`,
            `时间减少${xingziReduction}分钟`
        );
        timeReduction += xingziReduction;
        msgs.push(xingziTexts.join('\n'));
    }
    // 天璇步法效果（只在没有行字秘时触发）
    else if (hasTianxuanBufa) {
        const tianxuanTexts = [
            `【天璇步法·残篇奥义】`,
            `足下道纹流转，身形如烟似幻，`,
            `天璇步法展动间：`,
            `- 缩地成寸，山河倒转如浮光掠影`,
            `- 残影留空，十步之外难辨真身`,
            `"步罡踏斗，天璇遗韵！"`,
            `时间减少1分钟（残缺秘法，未达极速真谛）`
        ];
        timeReduction += 1;
        msgs.push(tianxuanTexts.join('\n'));
    }

    // 道法仙术效果（独立触发）
    if (player.daofaxianshu == 2) {
        timeReduction += 2;
        msgs.push('受到道法仙术加持，历练时间减少2分钟');
    }

    return { timeReduction, msgs };
}
export async function zhetianweizhi(e, weizhi, addres) {
    let get_data = {
        didian_list: weizhi,
        addres: addres
    }
    const data1 = await new Show(e).get_zhetian_placeData(get_data);
    return await puppeteer.screenshot('get_zhetian_placeData', {
        ...data1,
    });
}
export async function shangcangweizhi(e, weizhi, addres) {
    let get_data = {
        didian_list: weizhi,
        addres: addres
    }
    const data1 = await new Show(e).get_shangcang_placeData(get_data);
    return await puppeteer.screenshot('get_shangcang_placeData', {
        ...data1,
    });
}
export async function xiajieweizhi(e, weizhi, addres) {
    let get_data = {
        didian_list: weizhi,
        addres: addres
    }
    const data1 = await new Show(e).get_xiajie_placeData(get_data);
    return await puppeteer.screenshot('get_xiajie_placeData', {
        ...data1,
    });
}
export async function shangjieweizhi(e, weizhi, addres) {
    let get_data = {
        didian_list: weizhi,
        addres: addres
    }
    const data1 = await new Show(e).get_shangjie_placeData(get_data);
    return await puppeteer.screenshot('get_shangjie_placeData', {
        ...data1,
    });
}
export async function xianjingweizhi(e, weizhi, addres) {
    let get_data = {
        didian_list: weizhi,
        addres: addres
    }
    const data1 = await new Show(e).get_xianjing_placeData(get_data);
    return await puppeteer.screenshot('get_xianjing_placeData', {
        ...data1,
    });
}
export async function jindiweizhi(e, weizhi, addres) {
    let get_data = {
        didian_list: weizhi,
        addres: addres
    }
    const data1 = await new Show(e).get_jindi_placeData(get_data);
    return await puppeteer.screenshot('get_jindi_placeData', {
        ...data1,
    });
}
// 时间格式化函数
function formatTime(ms) {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}分${seconds}秒`;
}

