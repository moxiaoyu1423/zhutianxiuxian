import { plugin, puppeteer, verc, data, Show } from '../../api/api.js';
import {  __PATH } from '../../model/xiuxian.js';
import config from "../../model/Config.js"
import fs from "fs"
import {
    Read_player,
    existplayer,
    sleep,
    ForwardMsg,
     Write_player,
     bigNumberTransform,
     Read_equipment,
    channel
} from '../../model/xiuxian.js';
import { Add_灵石, Add_修为, Add_血气, Add_najie_thing } from '../../model/xiuxian.js';




/**
 * 作者：老王
 */

export class chengjiu extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'chengjiu',
            /** 功能描述 */
            dsc: '成就系统模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: '^#验证自身成就$',
                    fnc: 'chengjiu1',
                },
                             {
                    reg: '^#修仙助手$',
                    fnc: 'xiuxianzhushou',
                }
            ],
        });
      
    }
async  xiuxianzhushou(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    // 检查是否有账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('请先创建角色');
        return;
    }
    
    let player = await Read_player(usr_qq);
    let msg = [];
    
    // 构建修仙助手界面
    msg.push(`【修仙助手】${player.名号}的修仙之路`);
    
    // 1. 基本信息
    let 练气 = data.Level_list.find(item => item.level_id == player.level_id);
    let 炼体 = data.LevelMax_list.find(item => item.level_id == player.Physique_id);
    let 秘境体系 = data.Levelmijing_list.find(item => item.level_id == player.mijinglevel_id);
    let 仙古今世法 = data.xiangujinshi_list.find(item => item.level_id == player.xiangulevel_id);
    
    msg.push(`练气：${练气.level || 练气.level_name || "未知"}`);
    msg.push(`炼体：${炼体.level || 炼体.level_name || "未知"}`);
    msg.push(`人体秘境体系：${秘境体系.level || "未知"}`);
    msg.push(`仙古今世法：${仙古今世法.level || "未知"}`);
    msg.push(`生命：${bigNumberTransform(player.当前血量)}/${bigNumberTransform(player.血量上限)}`);
    msg.push(`攻击：${bigNumberTransform(player.攻击)}`);
    msg.push(`防御：${bigNumberTransform(player.防御)}`);
    
    // 2. 已解锁功能
    msg.push(`已解锁功能：`);
    
    // 检查并显示已解锁的功能
    const unlockedFeatures = [];
    
    if (player.level_id > 22) {
        unlockedFeatures.push("天道赐福：秘境之钥，打工券(沉迷打工本)");
    }
    if (player.level_id >= 32) {
        unlockedFeatures.push("凝练元神，开启内景地(修炼之道)");
    }
    if (player.occupation == "侠客") {
        unlockedFeatures.push("天道赐福：额外获得侠客令*3(额外消灭恶人)");
    }
    if (player.occupation == "唤魔者") {
        unlockedFeatures.push("天道赐福：额外获得唤魔令*3(额外劫掠村庄)");
    }
    if (player.level_id > 41) {
        unlockedFeatures.push("天道赐福：额外获得仙舟*3(前往瑞泽云海)");
        unlockedFeatures.push("开辟小世界：开辟属于自己的小世界，额外获得挂机收益，具体看#小世界帮助");
    }
    if (player.level_id > 41 && player.Physique_id > 41) {
        unlockedFeatures.push("穿梭凡间|仙界|下界八域|九天十地：穿梭位面（天地虽大，何处不可去）");
        unlockedFeatures.push("证道，冲关:可以选择人体秘境体系/仙古今世法作为自身额外修炼体系");
    }
    if (player.五色祭坛 == 1) {
        unlockedFeatures.push("激活五色祭坛，穿梭遮天位面：穿梭位面（九龙拉棺，启程北斗）");
    }
    if (player.level_id >= 54) {
        unlockedFeatures.push("天道赐福：额外获得神域令牌*3(前往神域星宫)");
    }
    if (player.mijinglevel_id >= 12 || player.xaingulevel_id >= 10) {
        unlockedFeatures.push("传授功法，传授全部功法:可以传授给他人功法");
    }
    
    // 显示已解锁功能
    if (unlockedFeatures.length > 0) {
        for (const feature of unlockedFeatures) {
            msg.push(`  ${feature}`);
        }
    } else {
        msg.push(`  尚未解锁任何特殊功能`);
    }
    
    
    // 3. 即将解锁功能
    msg.push(`即将解锁功能：`);
    
    // 检查即将解锁的功能
    const upcomingFeatures = [];
    
    if (player.level_id <= 22) {
        upcomingFeatures.push("境界突破22级后解锁：天道赐福：秘境之钥，打工券(沉迷打工本)");
    }
    if (player.level_id < 32) {
        upcomingFeatures.push("境界突破32级后解锁：凝练元神，开启内景地(修炼之道)");
    }
    if (player.level_id <= 41) {
        upcomingFeatures.push("练气突破41级后解锁：天道赐福：额外获得仙舟*3(前往瑞泽云海)");
        upcomingFeatures.push("练气突破41级后解锁：开辟小世界：开辟属于自己的小世界，额外获得挂机收益");
    }
    if (player.level_id <= 41 || player.Physique_id <= 41) {
        upcomingFeatures.push("成就地仙肉身成圣后解锁：穿梭凡间|仙界|下界八域|九天十地：穿梭位面（天地虽大，何处不可去）");
        upcomingFeatures.push("成就地仙肉身成圣后解锁：证道，冲关:可以选择人体秘境体系/仙古今世法作为自身额外修炼体系");
    }
    if (player.level_id < 54) {
        upcomingFeatures.push("境界突破54级后解锁：天道赐福：额外获得神域令牌*3(前往神域星宫)");
    }
    if (player.五色祭坛 != 1) {
        upcomingFeatures.push("激活五色祭坛后解锁：穿梭遮天位面：穿梭位面（九龙拉棺，启程北斗）");
    }
    if (player.mijinglevel_id < 12 || player.xaingulevel_id < 10) {
        upcomingFeatures.push("人体秘境体系达到圣人或仙古今世法达到天神境后解锁：传授功法，传授全部功法");
    }
    
    // 显示即将解锁功能
    if (upcomingFeatures.length > 0) {
        // 最多显示3个即将解锁功能
        const maxDisplay = Math.min(3, upcomingFeatures.length);
        for (let i = 0; i < maxDisplay; i++) {
            msg.push(`  ${upcomingFeatures[i]}`);
        }
        
        if (upcomingFeatures.length > maxDisplay) {
            msg.push(`  ...还有${upcomingFeatures.length - maxDisplay}个功能待解锁`);
        }
    } else {
        msg.push(`  已解锁所有功能`);
    }
    
    
    // 4. 修仙提示
    const tips = [
        "每日修仙签到可稳步提升修为",
        "境界突破需要积累足够的修为",
        "秘境探索可能获得珍稀宝物",
        "参悟高阶功法可大幅提升斗法能力",
        "灵根觉醒可激活特殊能力",
        "开辟小世界可获得额外收益"
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    msg.push(`修仙小贴士：${randomTip}`);
    
    await ForwardMsg(e, msg);
}
async chengjiu1(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    // 不开放私聊功能
    if (!e.isGroup) {
        e.reply('成就功能请在群聊中使用');
        return;
    }
    
    // 检查是否有账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('请先创建角色');
        return;
    }
    
    let player = await Read_player(usr_qq);
    
    // 初始化成就数组
    if (!player.成就 || player.成就 === 'undefined') {
        player.成就 = [];
        e.reply('初始化成就系统中...');
        await Write_player(usr_qq, player);
    }
    
    // 获取成就列表
    const chengjiuItems = data.chengjiu_list;
    let newAchievements = []; // 记录新获得的成就
    let unlockedAchievements = []; // 记录已解锁的成就
    
    // 遍历成就列表
    for (const item of chengjiuItems) {
        // 检查是否已拥有该成就
        const alreadyUnlocked = player.成就.includes(item.id.toString());
        
        if (alreadyUnlocked) {
            unlockedAchievements.push(item);
            continue;
        }
        
        // 检查成就条件
        let conditionMet = false;
        
        switch (item.id) {
            case 1: // 初来乍到
                conditionMet = player.level_id > 7;
                break;
            case 2: // 锤炼肉身
                conditionMet = player.Physique_id > 7;
                break;
            case 3: // 初入职场
                conditionMet = player.occupation && player.occupation.length > 0;
                break;
            case 4: // 灵根初显
                conditionMet = player.linggenshow == 0;
                break;
            case 5: // 飞升成仙
                conditionMet = player.level_id > 41;
                break;
            case 6: // 肉身成圣
                conditionMet = player.Physique_id > 41;
                break;
            case 7: // 茫茫诸天何处是北斗
                conditionMet = player.power_place == 2;
                break;
            case 8: // 大荒中崛起
                conditionMet = player.power_place == 1.5;
                break;
            case 9: // 诸法加身
                conditionMet = player.mijinglevel_id > 1 || player.xiangulevel_id > 1;
                break;
            case 10: // 宇宙共尊
                conditionMet = player.mijinglevel_id > 15 || player.xiangulevel_id > 13;
                break;
            case 11: // 红尘为仙
                conditionMet = player.mijinglevel_id > 16 || player.xiangulevel_id > 14;
                break;
            case 12: // 天难葬地难灭
                conditionMet = player.mijinglevel_id > 17 || player.xiangulevel_id > 15;
                break;
            case 13: // 诸天终极生命体
                conditionMet = player.mijinglevel_id > 19 || player.xiangulevel_id > 19;
                break;
            case 14: // 诸天至高
                conditionMet = player.mijinglevel_id > 20 || player.xiangulevel_id > 20;
                break;
            case 15: // 超越永恒与终极
                conditionMet = player.mijinglevel_id > 21 || player.xiangulevel_id > 21;
                break;
            case 16: // 超脱一切者
                conditionMet = player.mijinglevel_id > 22 || player.xiangulevel_id > 22;
                break;
            case 22: // 轮回诸天
                conditionMet = player.使用过诸天镜 === true;
                break;
            case 34: // 铸我道器
                const equipment = await Read_equipment(usr_qq);
                conditionMet = equipment.帝兵 && equipment.帝兵.author_name === player.id;
                break;
            case 35: // 极道帝兵
                const equipment2 = await Read_equipment(usr_qq);
                conditionMet = equipment2.帝兵 && equipment2.帝兵.品阶 === "极道帝兵";
                break;
            // 可以继续添加其他成就的条件判断
            default:
                // 对于没有特别定义的成就，默认不满足条件
                conditionMet = false;
        }
        
        // 如果条件满足，添加成就
        if (conditionMet) {
            player.成就.push(item.id.toString());
            newAchievements.push(item);
        }
    }
    
    // 保存玩家数据
    await Write_player(usr_qq, player);
    
    // 构建回复消息
    let replyMsg = "";
    
    // 显示新获得的成就
    if (newAchievements.length > 0) {
        replyMsg += "恭喜获得新成就：\n";
        for (const achievement of newAchievements) {
            replyMsg += `【${achievement.name}】- ${achievement.desc}\n`;
        }
        replyMsg += "\n";
    }
    
    // 显示已解锁的成就总数
    const totalUnlocked = player.成就.length;
    const totalAchievements = chengjiuItems.length;
    replyMsg += `成就进度: ${totalUnlocked}/${totalAchievements} (${Math.round(totalUnlocked/totalAchievements*100)}%)\n\n`;
    
    // 按分类显示成就
    const categorized = {};
    for (const item of chengjiuItems) {
        const category = item.type || "其他";
        if (!categorized[category]) {
            categorized[category] = { unlocked: 0, total: 0 };
        }
        categorized[category].total++;
        
        if (player.成就.includes(item.id.toString())) {
            categorized[category].unlocked++;
        }
    }
    
    // 添加分类进度
    for (const [category, data] of Object.entries(categorized)) {
        replyMsg += `【${category}】: ${data.unlocked}/${data.total}\n`;
    }
    
    e.reply(replyMsg);
}
}
