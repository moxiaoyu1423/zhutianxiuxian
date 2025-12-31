import {plugin, verc, data, config} from '../../api/api.js';
import common from '../../../../lib/common/common.js';
import fs from 'fs';
import {
  Read_player,
  existplayer,
  Read_najie,
  Write_najie,
  exist_najie_thing,
  Add_灵石,
  Write_player,
  Add_najie_thing,
  __PATH,
  Add_player_学习功法,
  Go,
  get_najie_img,
  get_najie_category_img,
  get_najie_chouchou_img,
  channel
} from '../../model/xiuxian.js';
export class shilitixi extends plugin {
  constructor() {
    super({
      name: 'shilitixi',
      dsc: '势力模块',
      event: 'message',
      priority: 600,
      rule: [
{
    reg: '^#造访剑云海$',
    fnc: 'jianyunhai'
},
{
    reg: '^#剑云海选择\\s*([123])$',
    fnc: 'jianyunhaiChoice'
},
{
    reg: '^#加入瑶池$',
    fnc: 'yaochi'
},
{
    reg: '^#加入摇光$',
    fnc: 'yaoguang'
},
{
    reg: '^#职位晋升$',
    fnc: 'zhiweijinsheng'
},
{
    reg: '^#领取瑶池俸禄$',
    fnc: 'lingquYaochiSalary'
},
{
    reg: '^#领取摇光俸禄$',
    fnc: 'lingquYaoguangSalary'
},
{
    reg: '^#开启剑云海秘库$',
    fnc: 'lingqujianyunhai'
}
      ],
    });
  }

async  lingquYaochiSalary(e) {
    if (!verc({ e })) return false;
    const usr_qq = (await channel(e.user_id.toString().replace('qg_',''))).toString();
    if (!await existplayer(usr_qq)) return false;
    
    const player = await Read_player(usr_qq);
    
    // 检查是否加入瑶池势力
    if (player.势力 !== "瑶池") {
        return e.reply([
            `【非瑶池弟子】`,
            `你尚未加入瑶池势力，无法领取俸禄！`,
            `加入瑶池指令：#加入瑶池`
        ].join('\n'));
    }
    
    // 检查职位
    const position = player.势力职位 || "记名女弟子";
    
    // 职位俸禄表
    const salaryTable = {
        "记名女弟子": 100000,
        "正式女弟子": 500000,
        "亲传女弟子": 2000000,
        "真传女弟子": 5000000,
        "圣女": 12000000
    };
    
    // 检查今日是否已领取俸禄
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastClaimDate = await redis.get(`xiuxian:player:${usr_qq}:yaochi_salary_date`);
    
    if (lastClaimDate === today) {
        return e.reply([
            `【俸禄已领】`,
            `今日俸禄已领取，请明日再来！`,
            `瑶池俸禄每日仅可领取一次`
        ].join('\n'));
    }
    
    // 计算俸禄
    const salary = salaryTable[position];
    
    // 发放俸禄
    player.源石 += salary;
    await Write_player(usr_qq, player);
    
    // 记录领取日期
    await redis.set(`xiuxian:player:${usr_qq}:yaochi_salary_date`, today);
    
    // 构建回复文案
    const positionDesc = {
        "记名女弟子": "瑶池记名女弟子",
        "正式女弟子": "瑶池正式女弟子",
        "亲传女弟子": "瑶池亲传女弟子",
        "真传女弟子": "瑶池真传女弟子",
        "圣女": "瑶池圣女"
    };
    
    return e.reply([
        `【瑶池俸禄】`,
        `身份：${positionDesc[position]}`,
        `俸禄：${salary.toLocaleString()}源石`,
        `已存入你的纳戒中`,
        `当前源石：${player.源石.toLocaleString()}`,
        `明日可再次领取`
    ].join('\n'));
}
async lingquYaoguangSalary(e) {
    if (!verc({ e })) return false;
    const usr_qq = (await channel(e.user_id.toString().replace('qg_',''))).toString();
    if (!await existplayer(usr_qq)) return false;
    
    const player = await Read_player(usr_qq);
    
    // 检查是否加入摇光圣地势力
    if (player.势力 !== "摇光圣地") {
        return e.reply([
            `【非摇光弟子】`,
            `你尚未加入摇光圣地，无法领取俸禄！`,
            `加入摇光指令：#加入摇光`
        ].join('\n'));
    }
    
    // 检查职位
    const position = player.势力职位 || "记名弟子";
    
    // 摇光圣地职位俸禄表（根据原著设定调整）[6,7](@ref)
    const salaryTable = {
        "记名弟子": 100000,       // 10万源石
        "外门弟子": 500000,       // 50万源石
        "内门弟子": 2000000,      // 200万源石
        "核心弟子": 5000000,      // 500万源石
        "真传弟子": 8000000,      // 800万源石
        "圣子": 12000000,         // 1200万源石
        "圣女": 12000000          // 1200万源石
    };
    
    // 检查今日是否已领取俸禄
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastClaimDate = await redis.get(`xiuxian:player:${usr_qq}:yaoguang_salary_date`);
    
    if (lastClaimDate === today) {
        return e.reply([
            `【俸禄已领】`,
            `今日俸禄已领取，请明日再来！`,
            `摇光圣地俸禄每日仅可领取一次`
        ].join('\n'));
    }
    
    // 计算俸禄（如果职位不存在于表中，使用记名弟子作为默认）
    const salary = salaryTable[position] || salaryTable["记名弟子"];
    
    // 发放俸禄
    player.源石 += salary;
    await Write_player(usr_qq, player);
    
    // 记录领取日期
    await redis.set(`xiuxian:player:${usr_qq}:yaoguang_salary_date`, today);
    
    // 构建职位描述
    const positionDesc = {
        "记名弟子": "摇光圣地记名弟子",
        "外门弟子": "摇光圣地外门弟子",
        "内门弟子": "摇光圣地内门弟子", 
        "核心弟子": "摇光圣地核心弟子",
        "真传弟子": "摇光圣地真传弟子",
        "圣子": "摇光圣地圣子",
        "圣女": "摇光圣地圣女"
    };
    
    // 构建回复文案
    return e.reply([
        `【摇光俸禄】`,
        `龙纹黑金鼎微光流转，${positionDesc[position]}俸禄发放完成！`,
        `职位：${positionDesc[position]}`,
        `本月俸禄：${salary.toLocaleString()}源石`,
        `已存入你的纳戒中`,
        `当前源石总额：${player.源石.toLocaleString()}源石`,
        `提示：俸禄每日可领取一次，勤修圣光术，早日晋升更高职位！`
    ].join('\n'));
}

async lingqujianyunhai(e) {
    if (!verc({ e })) return false;
    const usr_qq = (await channel(e.user_id.toString().replace('qg_',''))).toString();
    if (!await existplayer(usr_qq)) return false;
    
    const player = await Read_player(usr_qq);
    
    // 检查是否加入剑云海势力
    if (player.势力 !== "剑云海") {
        return e.reply([
            `【剑云海禁地】`,
            `非我宗门弟子，不得擅入秘库。`,
        ].join('\n'));
    }
    
    // 获取当前日期（基于本地时间的0点）
    const now = new Date();
    const today = now.getDate(); // 获取当月日期数字（1-31）
    
    // 获取上次开启的日期
    const lastOpenDay = await redis.get(`xiuxian:player:${usr_qq}:jianyunhai_open_day`);
    
    // 检查今日是否已开启秘库（比较日期数字）
    if (lastOpenDay && parseInt(lastOpenDay) === today) {
        return e.reply([
            `【剑云海秘库禁令】`,
            `今日秘库已为尊驾开启。`,
            `剑云海秘库法则：每日仅限一次，望尊驾明日再来。`
        ].join('\n'));
    }
    
    // 基础奖励：5000万源石
    player.源石 +=30000000;
    let rewardMsg = "【剑云海秘库·开启】";
    rewardMsg += ` 作为剑云海传人，您获得3000万源石供奉\n`;
    
    // 随机决定仙品或圣品秘境结算卡
    const isXianpin = Math.random() < 0.5;
    const settlementCard = isXianpin ? "仙品秘境结算卡" : "圣品秘境结算卡";
    const cardDesc = isXianpin ? 
        "仙品秘境结算卡：可缩减秘境探索时间" : 
        "圣品秘境结算卡：可大幅缩减秘境探索时间";
    
    // 定义三组奖励物品
    const rewardGroups = [
        ["众生仙钓", "道具", "诸天仙宝，可垂钓众生"],
        ["剑云海圣药", "丹药", "宗门秘传圣药，可增进修为血气"],
        [settlementCard, "道具", cardDesc]
    ];
    
    // 随机决定奖励档次
    const random = Math.random();
    let rewardLevel = "";
    let rewardMultiplier = 1;
    
    if (random < 0.7) {
        // 70%概率：每组3个物品
        rewardLevel = "【基础赏赐】";
        rewardMultiplier = 3;
    } else if (random < 0.9) {
        // 20%概率：每组5个物品
        rewardLevel = "【鸿运嘉赏】";
        rewardMultiplier = 5;
    } else {
        // 10%概率：每组5个物品 + 10个超越宝盒
        rewardLevel = "【天选厚赐】";
        rewardMultiplier = 5;
    }
    
    // 发放奖励
    for (const [itemName, itemType] of rewardGroups) {
        await Add_najie_thing(usr_qq, itemName, itemType, rewardMultiplier);
    }
    
    if (rewardLevel === "【天选厚赐】") {
        await Add_najie_thing(usr_qq, "超越宝盒", "盒子", 10);
    }
    
    // 构建奖励详情
    rewardMsg += ` 奖励等级：${rewardLevel}\n`;
    for (const [itemName, , desc] of rewardGroups) {
        rewardMsg += ` - ${itemName} x${rewardMultiplier}：${desc}\n`;
    }
    
    if (rewardLevel === "【天选厚赐】") {
        rewardMsg += ` - 超越宝盒 x10：蕴含无上道机的秘宝\n`;
    }
    
    // 添加结算卡备注
    rewardMsg += `\n 本次秘库开启，随机赐予${isXianpin ? "仙品" : "圣品"}秘境结算卡`;
    
    // 记录开启日期（存储日期数字）
    await redis.set(`xiuxian:player:${usr_qq}:jianyunhai_open_day`, today);
    
    // 保存玩家数据（源石增加）
    await Write_player(usr_qq, player);
    
    // 添加宗门律令
    rewardMsg += `\n\n【剑云海律令】真传弟子每日可开启一次秘库，以彰宗门恩典。`;
    
    e.reply(rewardMsg);
    return true;
}
async yaochi(e) {
    if (!verc({ e })) return false;
    const usr_qq = (await channel(e.user_id.toString().replace('qg_',''))).toString();
    if (!await existplayer(usr_qq)) return false;
    const player = await Read_player(usr_qq);
    
    // 检查是否在遮天位面
    if (player.power_place != 2) {
        return e.reply(`你不在遮天位面，如何寻得到那隐于云雾间的瑶池圣地？`);
    }
    
    // 瑶池只招收女性弟子
    if (player.sex != 1) {
        return e.reply(`瑶池圣地自古只招收女修，仙规森严，恕不接待男客。`);
    }
    
    // 检查是否已加入其他势力
    if (player.势力 && player.势力 !== "无") {
        return e.reply(`你已投身${player.势力}，心有所属，大道已定，与瑶池仙境无缘。`);
    }
    
    // 定义天资等级序列
    const aptitudeSequence = [
        '天弃之人', '先天不足', '平庸之资', '超凡资质', 
        '天纵之资', '旷世奇才', '绝世天骄', '万古无双', '无演无尽'
    ];
    const currentAptitudeIndex = aptitudeSequence.indexOf(player.天资等级);
    
    // 瑶池入门基础资质要求：至少平庸之资
    if (currentAptitudeIndex < 2) {
        return e.reply([
            `【仙缘未至】`,
            `瑶池圣地乃西皇母所创无上道统，收徒标准甚严。`,
            `需至少「平庸之资」方可感应接引仙光。`,
            `你当前资质：「${player.天资等级}」，尚需历练。`,
            `提示：可寻访古迹，或求取圣药，改善根骨。`
        ].join('\n'));
    }
    
    // 瑶池重视潜力与心性，对高境界者反而不易接纳 
    if (player.mijinglevel_id && player.mijinglevel_id > 6) { // 道宫秘境以上
        return e.reply([
            `【道基已固】`,
            `瑶池讲究从基础循序渐进地培养弟子。`,
            `你当前境界过高，道途已定，恐难融入瑶池传承体系。`,
            `提示：瑶池更看重修士的可塑性与未来发展潜力。`
        ].join('\n'));
    }
    
    // 模拟瑶池入门考核：心性测试 (根据原著中瑶池重视稳定传承与弟子心性的特点
    const heartTest = Math.random();
    if (heartTest < 0.3) { // 30%几率心性不足
        return e.reply([
            `【心境未臻】`,
            `瑶池仙镜映照之下，你心念繁杂，未能通过考核。`,
            `仙使婉言：仙子尘缘未了，心有挂碍，非瑶池清净之道。`,
            `提示：他日心境澄明之时，可再来一试。`
        ].join('\n'));
    }
    
    // 加入瑶池
    player.势力 = "瑶池";
    player.势力职位 = "记名女弟子";
    
    // 根据资质和境界给予差异化入门奖励 (瑶池会根据弟子潜力给予不同资源
    let extraReward = "";
    if (currentAptitudeIndex >= 5) { // 旷世奇才以上
        await Add_najie_thing(usr_qq, '太阴缚灵诀', '功法', 1);
        await Add_najie_thing(usr_qq, '百草液', '道具', 10);
        extraReward = "因你资质出众，赐下瑶池无上功法《太阴缚灵诀》与百草液十瓶。";
    } else if (currentAptitudeIndex >= 3) { // 超凡资质以上
        await Add_najie_thing(usr_qq, '瑶池筑基丹', '丹药', 3);
        await Add_najie_thing(usr_qq, '百草液', '道具', 5);
        extraReward = "赐予瑶池筑基丹三枚与百草液五瓶，助你巩固道基。";
    }
    
    // 所有入门弟子皆可获得的基础资源
    await Add_najie_thing(usr_qq, '西皇经·轮海卷', '功法', 1);
    await Add_najie_thing(usr_qq, '下品源石', '道具', 100);
    
    await Write_player(usr_qq, player);
    
    // 构建入门描述
    const aptitudeDesc = {
        2: "虽资质平凡，但瑶池亦愿给你一份仙缘，望你好生珍惜。",
        3: "资质尚可，望你勤加修炼，不负瑶池之名。",
        4: "天资聪颖，甚好，望你潜心修行，早日堪破大道。",
        5: "旷世奇才！我瑶池此世振兴有望！",
        6: "绝世天骄！西皇母道统必将因你而重现辉煌！",
        7: "万古无双之资！此世帝路，当有你一席之地！",
        8: "无演无尽！未来大帝，今日入我瑶池！"
    };
    
    return e.reply([
        `【仙缘已定】`,
        `蟠桃树下，仙泪绿金塔微光流转，你通过考验，正式拜入瑶池圣地。`,
        `现任西王母颔首微笑：“${aptitudeDesc[currentAptitudeIndex] || '善，入我瑶池，当守清净，勤修道法。'}”`,
        `当前职位：记名女弟子`,
        `入门赐福：`,
        `- 《西皇经·轮海卷》x1`,
        `- 下品源石 x100`,
        extraReward,
        `瑶池仙规：需潜心修炼，稳固道基，方可参与圣女选拔或晋升更高职位。`
    ].join('\n'));
}
async yaoguang(e) {
    if (!verc({ e })) return false;
    const usr_qq = (await channel(e.user_id.toString().replace('qg_',''))).toString();
    if (!await existplayer(usr_qq)) return false;
    const player = await Read_player(usr_qq);
    
    // 检查是否在遮天位面
    if (player.power_place != 2) {
        return e.reply(
            `你不在遮天位面，无法感应到摇光圣地的接引神虹。`,
        );
    }
    
    // 检查是否已加入其他势力
    if (player.势力 && player.势力 !== "无") {
        return e.reply(
            `你已加入${player.势力}，需先脱离当前势力才能拜入摇光圣地。`,
        );
    }
    
    // 定义天资等级序列
    const aptitudeSequence = [
        '天弃之人',
        '先天不足',
        '平庸之资',
        '超凡资质',
        '天纵之资',
        '旷世奇才',
        '绝世天骄',
        '万古无双',
        '无演无尽'
    ];
    
    // 获取玩家当前天资等级索引
    const currentAptitudeIndex = aptitudeSequence.indexOf(player.天资等级);
    
    // 摇光圣地入门资质要求：至少超凡资质（根据原著设定，摇光重视弟子天赋）
    if (currentAptitudeIndex < 3) {
        return e.reply([
            `【资质不足】`,
            `摇光圣地乃东荒顶级势力，收徒标准严苛！`,
            `需至少「超凡资质」方可参加入门测试。`,
            `你当前资质：${player.天资等级}`,
            `提示：可通过奇遇或服用圣药提升资质`
        ].join('\n'));
    }
    
    // 检查境界（摇光圣地偏好有潜力的低境界弟子）
    if (player.mijinglevel_id && player.mijinglevel_id > 5) {
        return e.reply([
            `【境界过高】`,
            `摇光圣地更倾向培养轮海秘境弟子！`,
            `你当前境界过高，建议寻找更适合的势力。`,
            `提示：摇光圣地注重基础培养和潜力挖掘`
        ].join('\n'));
    }
    
    // 加入摇光圣地
    player.势力 = "摇光圣地";
    player.势力职位 = "记名弟子";
    
    // --- 所有弟子均获得的基础奖励 ---
    await Add_najie_thing(usr_qq, '摇光经·轮海卷', '功法', 1);
    await Add_najie_thing(usr_qq, '下品源石', '道具', 100); 
    let baseRewardDesc = `- 《摇光经·轮海卷》x1\n- 下品源石 x100`;
    
    // --- 根据天资等级给予差异化额外奖励 ---
    let extraRewardDesc = "";
 if (currentAptitudeIndex >= 5) { // 旷世奇才
        await Add_najie_thing(usr_qq, '中品源石', '道具', 50);
        await Add_najie_thing(usr_qq, '百草液', '道具', 5);
        extraRewardDesc = `因你资质不凡，圣地重点栽培：
- 百草液 x5（固本培元）        
- 中品源石 x50（更精纯的修炼资源）`;

    } else if (currentAptitudeIndex >= 4) { // 天纵之资
        await Add_najie_thing(usr_qq, '百草液', '道具', 3); // 数量提升至10
        extraRewardDesc = `因你资质优异，赐下：
- 百草液 x3（固本培元）`;
    } else if (currentAptitudeIndex >= 3) { // 超凡资质
        await Add_najie_thing(usr_qq, '百草液', '药剂', 1);
        extraRewardDesc = `赐予入门资源：
- 百草液 x1（固本培元）`;
    }
    
    await Write_player(usr_qq, player);
    
    // 构建回复消息
    return e.reply([
        `【拜入摇光】`,
        `龙纹黑金鼎微微震动，你通过化龙镜检测，正式成为摇光圣地记名弟子！`,
        `当前职位：记名弟子`,
        `入门赐福：`,
        baseRewardDesc,
        extraRewardDesc ? `\n额外嘉奖：\n${extraRewardDesc}` : ``,
        `\n提示：摇光圣地竞争激烈，需努力提升实力，早日晋升！`
    ].join('\n'));
}
async zhiweijinsheng(e) {
    if (!verc({ e })) return false;
    const usr_qq = (await channel(e.user_id.toString().replace('qg_',''))).toString();
    if (!await existplayer(usr_qq)) return false;
    
    const player = await Read_player(usr_qq);
    
    // 检查是否加入势力
    if (player.势力 === "无" || !player.势力) {
        return e.reply([
            `【无门无派】`,
            `你尚未加入任何势力，无法晋升职位！`,
            `目前可加入势力：`,
            `- 瑶池（#加入瑶池）`,
            `- 摇光圣地（#加入摇光）`,
        ].join('\n'));
    }
    
    // 定义天资等级序列
    const aptitudeSequence = [
        '天弃之人',
        '先天不足',
        '平庸之资',
        '超凡资质',
        '天纵之资',
        '旷世奇才',
        '绝世天骄',
        '万古无双',
        '无演无尽'
    ];
    
    // 定义所有势力的职位晋升体系
    const factionPositions = {
        "瑶池": {
            positions: {
                "记名女弟子": {
                    next: "正式女弟子",
                    cost: 500000,
                    level_required: 2,
                    aptitude_required: 2,
                    desc: "需达到轮海秘境-苦海境界，天资至少平庸之资"
                },
                "正式女弟子": {
                    next: "亲传女弟子",
                    cost: 1000000,
                    level_required: 3,
                    aptitude_required: 3,
                    desc: "需达到轮海秘境-命泉境界，天资至少超凡资质"
                },
                "亲传女弟子": {
                    next: "真传女弟子",
                    cost: 5000000,
                    level_required: 5,
                    aptitude_required: 4,
                    desc: "需达到轮海秘境-彼岸境界，天资至少天纵之资"
                },
                "真传女弟子": {
                    next: "圣女",
                    cost: 20000000,
                    level_required: 6,
                    aptitude_required: 5,
                    desc: "需达到道宫秘境境界，天资至少旷世奇才"
                },
                "圣女": {
                    next: null,
                    level_required: 8,
                    aptitude_required: 6,
                    desc: "已是瑶池最高职位"
                }
            },
            rewards: {
                "正式女弟子": [
                    { name: "西皇经·道宫卷", type: "功法", count: 1, desc: "获得《西皇经·道宫卷》x1" }
                ],
                "亲传女弟子": [
                    { name: "蟠桃仙种", type: "草药", count: 3, desc: "获得蟠桃仙种×3" }
                ],
                "真传女弟子": [
                    { name: "西皇经", type: "功法", count: 1, desc: "获得《西皇经》×1" }
                ],
                "圣女": [
                    { name: "瑶池仙令", type: "道具", count: 1, desc: "获得瑶池仙令×1" }
                ]
            },
            messages: {
                "正式女弟子": [
                    `【瑶池初成】`,
                    `你通过瑶池初试，正式成为瑶池弟子！`,
                    `瑶池长老为你赐下：`,
                    `- 瑶池玉牌（身份象征）`,
                    `- 《西皇经·道宫卷》`,
                ],
                "亲传女弟子": [
                    `【亲传之荣】`,
                    `你被瑶池长老收为亲传弟子！`,
                    `赐予：`,
                    `- 亲传弟子玉簪`,
                    `- 蟠桃仙种三枚`,
                    `- 可入瑶池秘境修炼`,
                ],
                "真传女弟子": [
                    `【真传之位】`,
                    `你晋升为瑶池真传弟子！`,
                    `西王母亲自赐下：`,
                    `- 真传弟子仙衣`,
                    `- 《西皇经》`,
                    `- 可参悟瑶池帝经`,
                ],
                "圣女": [
                    `【圣女加冕】`,
                    `瑶池钟鸣九响，西王母为你加冕！`,
                    `你成为新一代瑶池圣女：`,
                    `- 执掌瑶池仙令`,
                    `- 可调动瑶池底蕴`,
                    `- 位同副掌教`,
                    `蟠桃园中，三千瑶池弟子齐声恭贺：`,
                    `"恭迎圣女！"`,
                ]
            }
        },
        "摇光圣地": {
            positions: {
                "记名弟子": {
                    next: "外门弟子",
                    cost: 300000,
                    level_required: 2,
                    aptitude_required: 3,
                    desc: "需达到轮海秘境-苦海境界，天资至少超凡资质",
                    test: "通过基础圣光术考核",
                    hasExam: true
                },
                "外门弟子": {
                    next: "内门弟子",
                    cost: 800000,
                    level_required: 3,
                    aptitude_required: 3,
                    desc: "需达到轮海秘境-命泉境界，天资至少超凡资质",
                    test: "完成宗门任务并掌握混元圣光术基础",
                    hasExam: true
                },
                "内门弟子": {
                    next: "核心弟子",
                    cost: 2000000,
                    level_required: 4,
                    aptitude_required: 4,
                    desc: "需达到轮海秘境-神桥境界，天资至少天纵之资",
                    test: "通过圣光塔三层试炼",
                    hasExam: true
                },
                "核心弟子": {
                    next: "真传弟子",
                    cost: 5000000,
                    level_required: 5,
                    aptitude_required: 5,
                    desc: "需达到轮海秘境-彼岸境界，天资至少旷世奇才",
                    test: "获得至少三位长老认可",
                    hasExam: true
                },
                "真传弟子": {
                    next: (player) => player.sex === 1 ? "圣女" : "圣子",
                    cost: 15000000,
                    level_required: 6,
                    aptitude_required: 6,
                    desc: "需达到道宫秘境境界，天资至少绝世天骄",
                    test: "通过龙纹黑金鼎的认可",
                    hasExam: true
                },
                "圣子": {
                    next: null,
                    level_required: 8,
                    aptitude_required: 7,
                    desc: "需达到化龙秘境境界，天资至少万古无双",
                    test: "击败当代其他圣子候选人"
                },
                "圣女": {
                    next: null,
                    level_required: 8,
                    aptitude_required: 7,
                    desc: "需达到化龙秘境境界，天资至少万古无双",
                    test: "击败当代其他圣女候选人"
                }
            },
            rewards: {
                "外门弟子": [
                    { name: "摇光经·道宫卷", type: "功法", count: 1, desc: "获得《摇光经·道宫卷》x1" }
                ],
                "内门弟子": [
                    { name: "中品源石", type: "道具", count: 100, desc: "获得中品源石×100" }
                ],
                "核心弟子": [
                    { name: "混元圣光术", type: "功法", count: 1, desc: "获得《混元圣光术》x1" }
                ],
                "真传弟子": [
                    { name: "摇光圣典", type: "功法", count: 1, desc: "获得《摇光圣典》x1" },
                    { name: "上品源石", type: "道具", count: 50, desc: "获得上品源石×50" }
                ],
                "圣子": [
                    { name: "圣子令", type: "道具", count: 1, desc: "获得圣子令x1" },
                    { name: "超品源石", type: "道具", count: 20, desc: "获得超品源石×20" },
                    { name: "龙纹黑金鼎仿品", type: "帝兵", count: 1, desc: "获得龙纹黑金鼎仿品x1" }
                ],
                "圣女": [
                    { name: "圣女令", type: "道具", count: 1, desc: "获得圣女令x1" },
                    { name: "超品源石", type: "道具", count: 20, desc: "获得超品源石×20" },
                    { name: "龙纹黑金鼎仿品", type: "帝兵", count: 1, desc: "获得龙纹黑金鼎仿品x1" }
                ]
            },
            messages: {
                "外门弟子": [
                    `【圣光初显】`,
                    `你通过基础考核，正式成为摇光圣地外门弟子！`,
                    `执事长老为你赐下：`,
                    `- 外门弟子服饰`,
                    `- 《摇光经·道宫卷》`,
                    `- 可修习更高级的圣光术`,
                ],
                "内门弟子": [
                    `【内门之荣】`,
                    `你成功晋升为内门弟子，圣光护体！`,
                    `赐予：`,
                    `- 中品源石百枚`,
                    `- 可进入圣光塔修炼`,
                ],
                "核心弟子": [
                    `【核心之位】`,
                    `你成为摇光圣地核心弟子，得传更高深法门！`,
                    `长老亲自赐下：`,
                    `- 《混元圣光术·进阶篇》`,
                    `- 可参与宗门决策`,
                ],
                "真传弟子": [
                    `【真传之尊】`,
                    `龙纹黑金鼎微鸣，你晋升为真传弟子！`,
                    `圣主赐下：`,
                    `- 《摇光圣典》`,
                    `- 上品源石五十枚`,
                    `- 可参悟极道帝兵奥秘`,
                ],
                "圣子": [
                    `【圣子加冕】`,
                    `摇光钟响，圣光冲天，你加冕为摇光圣子！`,
                    `东荒震动，年轻一代至尊诞生：`,
                    `- 执掌圣子令，可调动圣地资源`,
                    `- 获得龙纹黑金鼎仿品`,
                    `- 位同副圣主，万修敬仰`,
                    `摇光弟子齐声恭贺："恭迎圣子！"`,
                ],
                "圣女": [
                    `【圣女加冕】`,
                    `摇光钟响，圣光普照，你加冕为摇光圣女！`,
                    `东荒瞩目，一代仙子临世：`,
                    `- 执掌圣女令，地位尊崇`,
                    `- 获得龙纹黑金鼎仿品`,
                    `- 位同副圣主，众生朝拜`,
                    `摇光弟子齐声恭贺："恭迎圣女！"`,
                ]
            }
        }
    };
    
    // 检查玩家势力是否支持职位晋升
    const factionConfig = factionPositions[player.势力];
    if (!factionConfig) {
        return e.reply(`你所在的势力${player.势力}暂无职位晋升体系`);
    }
    
    // 获取当前职位信息
    const currentPosition = player.势力职位 || (player.势力 === "瑶池" ? "记名女弟子" : "记名弟子");
    let positionInfo = factionConfig.positions[currentPosition];
    
    // 处理动态next（摇光圣地的真传弟子晋升）
    if (positionInfo && typeof positionInfo.next === 'function') {
        positionInfo = {
            ...positionInfo,
            next: positionInfo.next(player)
        };
    }
    
    // 检查是否最高职位
    if (!positionInfo || !positionInfo.next) {
        return e.reply([
            `【已达巅峰】`,
            `你已是${player.势力}${currentPosition}，位高权重！`,
            player.势力 === "瑶池" ? `西王母之下，万仙之上！` : `龙纹黑金鼎为你而鸣，圣光普照东荒！`,
        ].join('\n'));
    }
    
    // 获取玩家当前天资等级索引
    const currentAptitudeIndex = aptitudeSequence.indexOf(player.天资等级);
    
    // 检查境界是否足够
    if (!player.mijinglevel_id || player.mijinglevel_id < positionInfo.level_required) {
        const levelNames = {
            2: "轮海秘境-苦海",
            3: "轮海秘境-命泉",
            4: "轮海秘境-神桥",
            5: "轮海秘境-彼岸",
            6: "道宫秘境",
            7: "四极秘境",
            8: "化龙秘境",
            9: "仙台秘境-半步大能",
            10: "仙台秘境-大能",
            11: "仙台秘境-斩道王者",
            12: "仙台秘境-圣人",
            13: "仙台秘境-圣人王",
            14: "仙台秘境-大圣",
            15: "仙台秘境-准帝",
            16: "仙台秘境-大帝"
        };
        
        return e.reply([
            `【境界不足】`,
            `晋升${positionInfo.next}需要达到${levelNames[positionInfo.level_required]}境界！`,
            `你当前境界：${levelNames[player.mijinglevel_id] || "未知"}`,
            positionInfo.test ? `考核要求：${positionInfo.test}` : "",
            `提示：${positionInfo.desc}`
        ].filter(Boolean).join('\n'));
    }
    
    // 检查天资是否足够
    if (currentAptitudeIndex < positionInfo.aptitude_required) {
        return e.reply([
            `【天资不足】`,
            `晋升${positionInfo.next}需要天资达到${aptitudeSequence[positionInfo.aptitude_required]}！`,
            `你当前天资：${player.天资等级}`,
            positionInfo.test ? `考核要求：${positionInfo.test}` : "",
            `提示：${positionInfo.desc}`
        ].filter(Boolean).join('\n'));
    }
    
    // 检查源石是否足够
    if (player.源石 < positionInfo.cost) {
        return e.reply([
            `【资源不足】`,
            `晋升${positionInfo.next}需要${positionInfo.cost.toLocaleString()}源石！`,
            `你当前仅有：${player.源石.toLocaleString()}源石`,
            positionInfo.test ? `考核要求：${positionInfo.test}` : "",
            `提示：${positionInfo.desc}`
        ].filter(Boolean).join('\n'));
    }
    
    // 摇光圣地晋升考核（瑶池没有考核）
    if (player.势力 === "摇光圣地" && positionInfo.hasExam) {
        const promotionTest = Math.random();
        let testPassRate = 0.7; // 基础通过率70%
        
        // 天资越高，通过率越高
        testPassRate += (currentAptitudeIndex - 3) * 0.05;
        testPassRate = Math.min(testPassRate, 0.95); // 最高95%通过率
        
        if (promotionTest > testPassRate) {
            return e.reply([
                `【考核失败】`,
                `晋升${positionInfo.next}的考核未能通过！`,
                `${positionInfo.test}未能圆满完成。`,
                `消耗源石：${Math.floor(positionInfo.cost * 0.1).toLocaleString()}（考核费用）`,
                `提示：勤加修炼，提升实力后可再次尝试`
            ].join('\n'));
        }
    }
    
    // 晋升职位
    player.源石 -= positionInfo.cost;
    player.势力职位 = positionInfo.next;
    
    // 发放奖励
    let extraReward = "";
    const nextPositionRewards = factionConfig.rewards[positionInfo.next];
    if (nextPositionRewards) {
        for (const reward of nextPositionRewards) {
            await Add_najie_thing(usr_qq, reward.name, reward.type, reward.count);
            if (reward.desc) {
                extraReward += (extraReward ? "\n" : "") + reward.desc;
            }
        }
    }
    
    await Write_player(usr_qq, player);
    
    // 构建晋升文案
    const positionMessages = factionConfig.messages[positionInfo.next] || [
        `【晋升成功】`,
        `你成功晋升为${positionInfo.next}！`,
        `${player.势力}为你骄傲！`
    ];
    
    return e.reply([
        ...positionMessages,
        `消耗源石：${positionInfo.cost.toLocaleString()}`,
        extraReward ? `额外奖励：${extraReward}` : "",
        `当前职位：${positionInfo.next}`
    ].filter(Boolean).join('\n'));
}
async jianyunhai(e) {
    // 处理QQ号
const usr_qq = (await channel(e.user_id.toString().replace('qg_',''))).toString();
     const player = await Read_player(usr_qq);
    // 检查玩家
    if (!await existplayer(usr_qq)) {
        return e.reply('玩家数据不存在，请先创建角色');
    }
    
    // 检查令牌
    const tokenCount = await exist_najie_thing(usr_qq, '剑云海令牌', '道具');
    if (player.level_id < 42) {
        return e.reply(
            `你并没有成仙无法造访剑云海！`);
    }
 // 检查玩家是否已经完成过剑云海选择
    if (player.剑云海已选择) {
        return e.reply('你已然获得过剑魔帝主的机缘，无法再次进入剑云海！');
    }
    
    // 检查玩家是否正在选择中
    if (player.剑云海选择中) {
        return e.reply('你正在剑云海中，请先完成选择！');
    }
    if (!tokenCount || tokenCount < 1) {
        return e.reply([
            `【剑道无缘】`,
            `你来到剑云海入口，却被通天剑阵阻挡！`,
            `守山剑侍眸光如电：`,
            `"无剑云海令牌者，不得入内！"`,
            `需持有「剑云海令牌」方可进入`,
        ].join('\n'));
    }
    

    
    // 构建回复消息
    const encounterText = [
        `【剑云海】`,
        `你持令牌踏入剑云海，`,
        `只见云海翻涌，万剑悬空！`,
        `一位白衣青年负手而立，`,
        `其气息如深渊瀚海，眸中似有星河幻灭。`,
        `剑魔帝主淡然道：`,
        `"持令而来，可允你一愿，但说无妨。"`,
        `请选择：`,
        `1. 求取修炼资源`,
        `2. 拜师成为剑云海传人`,
        `3. 求得帝主庇护`,
        `回复【#剑云海选择1】或【#剑云海选择2】或【#剑云海选择3】`,
    ].join('\n');

  player.剑云海选择中 = true;
      // 消耗令牌
    await Add_najie_thing(usr_qq, '剑云海令牌', '道具', -1);
    await Write_player(usr_qq, player);
    
    return e.reply(encounterText);
}
async jianyunhaiChoice(e) {
    const usr_qq = (await channel(e.user_id.toString().replace('qg_',''))).toString();
    
    if (!await existplayer(usr_qq)) return false;
    
    const player = await Read_player(usr_qq);
    
    // 检查是否在剑云海选择状态
    if (!player.剑云海选择中) {
        return e.reply('请先使用【#剑云海】进入剑云海');
    }
    
    // 获取选择
    const choice = e.msg.replace('#剑云海选择', '').trim();
    
    // 处理选择
    switch(choice) {
        case '1': // 修炼资源
            await Add_灵石(usr_qq, 150000000); // 1亿5千万灵石
            await Add_najie_thing(usr_qq, '剑云海圣药', '丹药', 3);
            
            // 标记为已完成选择
            player.剑云海选择中 = false;
            player.剑云海已选择 = true;
            await Write_player(usr_qq, player);
            
            return e.reply([
                `【修炼资源】`,
                `剑魔帝主袖袍一挥，`,
                `一座灵石山和一瓶神药落在你面前：`,
                `获得：`,
                `- 灵石x1亿五千万`,
                `- 剑云海圣药x3`,
                `剑魔帝主："勤加修炼，莫负此缘！"`,
            ].join('\n'));
            
        case '2': // 成为传人
            // 检查服务器中是否已有剑云海传人
            const hasChuanren = await this.checkJianyunhaiChuanren();
            if (hasChuanren) {
                // 如果已有传人，返还令牌并重置选择状态
                await Add_najie_thing(usr_qq, '剑云海令牌', '道具', 1);
                player.剑云海选择中 = false; // 重置选择状态，允许玩家重新选择
                await Write_player(usr_qq, player);
                
                return e.reply([
                    `【传人已定】`,
                    `剑魔帝主摇头：`,
                    `"剑云海已有传人，此位不可再授！"`,
                    `提示：`,
                    `- 剑云海传人具有唯一性`,
                    `- 当前世界线已有传人存在`,
                    `- 你的令牌已返还，请重新选择其他奖励`,
                    `- 使用 #剑云海 重新进入选择`
                ].join('\n'));
            }
            
            // 如果没有传人，则继续执行
            player.学习的功法.push('永恒终极剑道');
            player.势力 = "剑云海";
            player.势力职位 = "传人";
            
            // 标记为已完成选择
            player.剑云海选择中 = false;
            player.剑云海已选择 = true;
            await Write_player(usr_qq, player);
            
            return e.reply([
                `【剑云海传人】`,
                `白衣青年眸光如电：`,
                `"跪下，拜师！"`,
                `你三叩九拜，行拜师大礼！`,
                `剑魔帝主指尖一点，`,
                `《永恒终极剑道》化作流光融入你识海！`,
                `获得:永恒终极剑道x1`,
                `从此你便是剑云海传人，`,
                `未来可继承整座剑云海！`,
            ].join('\n'));
            
        case '3': // 帝主庇护
            player.剑云海庇护 = {
                黑暗牢笼: 5, // 免受黑暗牢笼5次
                副本奖励: 5  // 副本5倍奖励5次
            };
            
            // 标记为已完成选择
            player.剑云海选择中 = false;
            player.剑云海已选择 = true;
            await Write_player(usr_qq, player);
            
            return e.reply([
                `【帝主庇护】`,
                `剑魔帝主取出一枚剑符：`,
                `"此符蕴含本帝三道剑气，可护你周全！"`,
                `获得：`,
                `- 免受黑暗牢笼接引 ×5次`,
                `- 副本奖励五倍 ×5次`,
                `剑魔帝主："好自为之，莫要辱没我的威名！"`,
            ].join('\n'));
            
        default:
            return e.reply('请选择有效选项：1、2或3');
    }
}

// 检查剑云海是否已有传人
async checkJianyunhaiChuanren() {
    try {
        // 获取所有玩家文件
        const playerFiles = fs.readdirSync('./plugins/zhutianxiuxian1.0/resources/data/xiuxian_player')
            .filter(file => file.endsWith('.json'));
        
        for (let file of playerFiles) {
            const playerId = file.replace('.json', '');
            const playerData = await Read_player(playerId);
            
            // 检查是否是剑云海传人
            if (playerData.势力 === "剑云海" && playerData.势力职位 === "传人") {
                return true; // 已存在传人
            }
        }
        return false; // 没有传人
    } catch (error) {
        console.error('检查剑云海传人时出错:', error);
        return false; // 出错时默认没有传人
    }
}






  // 检查服务器中是否已有剑云海传人
async  checkJianyunhaiChuanren() {
    const playerFiles = fs.readdirSync(__PATH.player_path);
    const jsonFiles = playerFiles.filter(file => file.endsWith(".json"));
    
    for (const file of jsonFiles) {
        const playerId = file.replace(".json", '');
        const playerData = await Read_player(playerId);
        
        // 检查玩家势力是否为剑云海且职位为传人
        if (playerData.势力 === "剑云海" && playerData.势力职位 === "传人") {
            return true; // 已存在传人
        }
    }
    return false; // 没有传人
}

}
