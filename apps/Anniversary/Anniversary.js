import plugin from '../../../../lib/plugins/plugin.js'
import data from '../../model/XiuxianData.js'
import config from "../../model/Config.js"
import axios from 'axios';
import fs from "fs"
import path from 'path';
import { Read_player, existplayer,sleep,exist_najie_thing, Add_修为,Add_血气, getxinghailastsign_time,getLastsign2 } from '../../model/xiuxian.js'
import {  Write_player,  } from '../../model/xiuxian.js'
import { shijianc,  isNotNull,ForwardMsg } from '../../model/xiuxian.js'
import { Add_灵石,  Add_najie_thing,channel} from '../../model/xiuxian.js'

import { segment } from "oicq"
import { __PATH } from '../../model/xiuxian.js'
import Show from '../../model/show.js';
import puppeteer from '../../../../lib/puppeteer/puppeteer.js';
import { InitWorldBoss } from '../TeamBoss/TeamBoss.js'
/**
 * 全局
 */
let allaction = false;//全局状态判断

/**
 * 新年系统
 */

export class Anniversary extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'GuessLanternRiddles',
            /** 功能描述 */
            dsc: '猜灯谜模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                // {
                //     reg: '^#出题吧$',
                //     fnc: 'Set_question'
                // },
                // {
                //     reg: '^#酿制.*$',
                //     fnc: 'B'
                // },
                // {
                //     reg: '^#赠与巴巴托斯.*$',
                //     fnc: 'A'
                // },
                // {
                //     reg: '^#酿酒配方$',
                //     fnc: 'C'
                // },
                {
                    reg: '^#百遣(虎|龙)$',
                    fnc: 'skhundred'
                },
                {
                    reg: '^#集齐四符,龙腾虎跃！$',
                    fnc: 'D'
                },
                {
                    reg: '^#周年签到$',
                    fnc: 'daily_gift2'
                },
                {
                    reg: '^#星海之缘签到$',
                    fnc: 'daily_gift3'
                },
                {
                    reg: '^#召唤爱莉希雅$',
                    fnc: 'zhaohuanailixiya'
                },
                {
                    reg: '^#疯狂召唤爱莉希雅$',
                    fnc: 'yijianzhaohuan'
                },
                {
                    reg: '^#遣(虎|龙)$',
                    fnc: 'sk'
                },
                {
                    reg: '^#十遣(虎|龙)$',
                    fnc: 'skten'
                },
               
                 {
                     reg: '^#自选存档皮肤.*$',
                     fnc: 'cundan_pifu'
                 },
                 {
    reg: '^#上传练气皮肤\\s+\\w+$', 
    fnc: 'upload_pifu'
},

                 {
    reg: '^#预览练气皮肤\\s+\\w+$', // 匹配格式：#预览练气皮肤 皮肤ID
    fnc: 'preview_pifu'
},
            ]
        })
        this.xiuxianConfigData = config.getConfig("xiuxian", "xiuxian");
    }
// 在类中实现preview_pifu方法
async preview_pifu(e) {
    // 仅限群聊使用
    if (!e.isGroup) {
        e.reply("此功能仅在群聊中可用");
        return true;
    }
    
    // 解析指令格式 #预览练气皮肤 <皮肤ID>
    const commandParts = e.msg.split(/\s+/);
    if (commandParts.length < 2) {
        e.reply("指令格式错误，请使用#预览练气皮肤 <皮肤ID>\n示例：#预览练气皮肤 85");
        return true;
    }
    
    const skinId = commandParts[1].trim();
    if (!skinId) {
        e.reply("请指定皮肤ID，例如：#预览练气皮肤 85");
        return true;
    }
    
    // 检查ID格式（只允许字母、数字和下划线）
    if (!/^[a-zA-Z0-9_]+$/.test(skinId)) {
        e.reply("皮肤ID只能包含字母、数字和下划线");
        return true;
    }
    
    // 确定目录和文件路径
    const dirPath = __PATH.player_pifu_path;
    const fileName = `${skinId}.jpg`;
    const filePath = path.join(dirPath, fileName);
    
    try {
        // 检查皮肤文件是否存在
        if (!fs.existsSync(filePath)) {
            e.reply(`皮肤ID ${skinId} 不存在，请检查ID是否正确`);
            return true;
        }
        
        // 直接发送皮肤图片预览
        e.reply([
            ` 练气皮肤预览 [ID: ${skinId}]`,
            segment.image(`file://${filePath}`)
        ]);
        
    } catch (err) {
        console.error("预览皮肤失败:", err);
        e.reply("预览皮肤失败，请稍后重试或联系管理员");
    }
    
    return true;
}
        //星海之缘签到
        async daily_gift3(e) {
            //不开放私聊功能
            if (!e.isGroup) {
                return;
            }
            let usr_qq = e.user_id.toString().replace('qg_','');
            usr_qq = await channel(usr_qq);
            //有无账号
            let ifexistplay = await existplayer(usr_qq);
            if (!ifexistplay) {
                return;
            }
            let now = new Date();
            let nowTime = now.getTime(); //获取当前日期的时间戳
            let Yesterday = await shijianc(nowTime - 24 * 60 * 60 * 1000);//获得昨天日期
            let Today = await shijianc(nowTime);
            let lastsign_time = await getxinghailastsign_time(usr_qq);//获得上次签到日期
            if (Today.Y == lastsign_time.Y && Today.M == lastsign_time.M && Today.D == lastsign_time.D) {
                e.reply(`今日已经签到过了`);
                return;
            }
            let Sign_Yesterday;        //昨日日是否签到
            if (Yesterday.Y == lastsign_time.Y && Yesterday.M == lastsign_time.M && Yesterday.D == lastsign_time.D) {
                Sign_Yesterday = true;
            }
            else {
                Sign_Yesterday = false;
            }
            await redis.set("xiuxian:player:" + usr_qq + ":xinghailastsign_time", nowTime);//redis设置签到时间
            let player = await data.getData("player", usr_qq);
            if(!isNotNull(player.星海之缘签到天数)){
                player.周年签到天数=0
            }
            if(player.周年签到天数==999){
                e.reply("您已领取过四周目礼包了,不能再领取了")
                return
            }
            if(!Sign_Yesterday){//昨天没有签到,连续签到天数清零
                player.星海之缘签到天数=0
            }
            player.星海之缘签到天数 += 1;
            data.setData("player", usr_qq, player);
            if (player.星海之缘签到天数 == 7) {
                await Add_灵石(usr_qq,200000)
                await Add_najie_thing(usr_qq, "秘境之匙", "道具", 5);
                await Add_najie_thing(usr_qq,"真我宝盒","盒子",1);
                await Add_najie_thing(usr_qq, "魔君讨伐令", "道具", 3);
                await Add_najie_thing(usr_qq, "群星秘钥", "道具", 5);
                player.星海之缘签到天数 = 999;
                e.reply("您已连续签到七天,成功领取四周目福利礼包("+thing_name+"灵石x20w,群星秘钥x5,秘境之匙x5,魔君讨伐令x3,真我宝盒x1)")
                return
            }

            //给奖励
            let gift_xiuwei = player.星海之缘签到天数 * 100000;
            await Add_najie_thing(usr_qq, "秘境之匙", "道具", this.xiuxianConfigData.Sign.ticket);
            await Add_najie_thing(usr_qq, "群星秘钥", "道具", 1);
            await Add_修为(usr_qq, gift_xiuwei);
            await Add_血气(usr_qq, gift_xiuwei);
            player.爱莉希雅召唤次数 = (player.爱莉希雅召唤次数 || 0) + 1;
            data.setData("player", usr_qq, player);
            let msg = [
                segment.at(usr_qq),
                `星海之缘签到成功,已经连续签到${player.星海之缘签到天数}天了，获得了${gift_xiuwei}修为与血气,群星秘钥x1,秘境之匙x${this.xiuxianConfigData.Sign.ticket}，爱莉希雅召唤次数剩余${player.爱莉希雅召唤次数}次`
            ]
            await Write_player(usr_qq,player)
            e.reply(msg);
            return;
        }
async zhaohuanailixiya(e) {
    if (!e.isGroup) {
        return;
    }
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    // 有无账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        return;
    }
    let player = await data.getData("player", usr_qq);
    // 初始化召唤次数检查
    if (!player.爱莉希雅召唤次数 || player.爱莉希雅召唤次数 <= 0) {
        e.reply("您没有爱莉希雅小姐的召唤次数了，无法进行召唤。");
        return;
    }

    // 消耗召唤次数
    player.爱莉希雅召唤次数 -= 1;

    // 天资等级序列与评价
    const aptitudeSequence = [
        '天弃之人', '先天不足', '平庸之资', '超凡资质', 
        '天纵之资', '旷世奇才', '绝世天骄', '万古无双', '无演无尽'
    ];
    const aptitudeDescriptions = {
        '无演无尽': '亘古绝今从未有，演尽诸天万界，此等天资已超脱天道束缚',
        '万古无双': '横推古今未来无对手，为修道而生，为应劫而至，永恒无敌',
        '绝世天骄': '惊才绝艳，具备帝姿，注定为一个时代的天地主角',
        '旷世奇才': '万年难遇，此等资质放眼九天十地也是难寻',
        '天纵之资': '天赋异禀，媲美上古大教的天才',
        '超凡资质': '资质超凡，注定异于常人',
        '平庸之资': '资质平平，勉勉强强',
        '先天不足': '先天有缺，修炼事倍功半',
        '天弃之人': '被天道抛弃，修炼必遭反噬'
    };

    let random = Math.random();
    let replyMessage = []; // 用于存储回复消息的数组


    if (random > 0.2) {
        const currentAptitudeIndex = aptitudeSequence.indexOf(player.天资等级);
        let oldAptitude = player.天资等级;
        let oldDescription = player.天资评价;
        let newAptitude = oldAptitude;
        let newDescription = oldDescription;
        let aptitudeBoost = false;

        if (Math.random() < 0.1 && currentAptitudeIndex < 7) {
            const newAptitudeIndex = Math.min(currentAptitudeIndex + 1, 7); // 上限为万古无双（索引7）
            newAptitude = aptitudeSequence[newAptitudeIndex];
            newDescription = aptitudeDescriptions[newAptitude];
            player.天资等级 = newAptitude;
            player.天资评价 = newDescription;
            aptitudeBoost = true;
        }

        // --- 道具奖励概率系统 ---
        let rewardRandom = Math.random();
        let obtainedItems = []; // 记录获得的道具

        if (rewardRandom < 0.2) {
            // 20%概率：1个真我宝盒 + 随机2个无瑕水晶花或誓约之证
            await Add_najie_thing(usr_qq, "真我宝盒", "盒子", 1);
            obtainedItems.push("真我宝盒×1");

            let materialOptions = ["无瑕水晶花", "誓约之证"];
            for (let i = 0; i < 2; i++) {
                let material = materialOptions[Math.floor(Math.random() * materialOptions.length)];
                await Add_najie_thing(usr_qq, material, "道具", 1);
                obtainedItems.push(material);
            }
        } else if (rewardRandom < 0.5) {
            // 30%概率：10个遣龙令或遣虎令
            let tokenOptions = ["遣龙令", "遣虎令"];
            let token = tokenOptions[Math.floor(Math.random() * tokenOptions.length)];
            await Add_najie_thing(usr_qq, token, "道具", 10);
            obtainedItems.push(`${token}×10`);
        } else {
            // 50%概率：1个众生仙钓 + 5个仙品秘境结算卡 + 2000万修为血气
            await Add_najie_thing(usr_qq, "众生仙钓", "道具", 1);
            await Add_najie_thing(usr_qq, "仙品秘境结算卡", "道具", 5);
            await Add_修为(usr_qq, 20000000);
            await Add_血气(usr_qq, 20000000);
            obtainedItems.push("众生仙钓×1", "仙品秘境结算卡×5", "修为+2000万", "血气+2000万");
        }

        // --- 构建成功召唤的回复消息 ---
        replyMessage.push(
            ` 你虔诚地念动咒文，粉色的水晶花在身边绽放：「嗨♪想我了吗？」`,
            ` 爱莉希雅的身影随光华显现，如飞花般美丽轻盈！`
        );

        if (aptitudeBoost) {
            replyMessage.push(
                ` 她轻笑一声，指尖轻点你的额头：「要好好记住我现在的样子哦？」`,
                ` 真我的光芒融入你的灵魂，天资获得洗礼！`,
                ` 天资提升：${oldAptitude} → **${newAptitude}**`,
                ` 天资评价：${newDescription}`
            );
        } else {
            replyMessage.push(
                ` 爱莉希雅的身影轻轻环绕，但天资并未突破。`
            );
        }

        replyMessage.push(
            ` 爱莉希雅送你一份礼物：${obtainedItems.join('、')}`,
            ` 「要带着我的祝福，继续为美好而战哦~♪」`
        );

    } else {

        replyMessage.push(
            ` 你尝试召唤那位如飞花般的少女...`,
            ` 粉色的光芒闪烁了几下，却渐渐消散。`,
            ` 耳边仿佛传来俏皮的低语：「哎呀，可爱的访客♪今天似乎不是最好的见面时机呢～」`,
            ` 天资等级未发生改变。`,
            `「下次，再一起来玩吧♪」`
        );
    }

    // 保存玩家数据
    await Write_player(usr_qq, player);

    // 发送回复
    e.reply(replyMessage.join('\n'));
}
async yijianzhaohuan(e) {
    if (!e.isGroup) {
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 检查是否有账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply("您尚未创建角色，无法进行召唤。");
        return;
    }
    
    let player = await data.getData("player", usr_qq);
    
    // 检查召唤次数
    if (!player.爱莉希雅召唤次数 || player.爱莉希雅召唤次数 <= 0) {
        e.reply("您当前没有爱莉希雅小姐的召唤次数，无法进行召唤哦～♪");
        return;
    }
    
    const totalSummons = player.爱莉希雅召唤次数;
    let replyMessage = [`【一键召唤·往世乐土】`];
    
    // 天资等级序列与评价
    const aptitudeSequence = [
        '天弃之人', '先天不足', '平庸之资', '超凡资质', 
        '天纵之资', '旷世奇才', '绝世天骄', '万古无双', '无演无尽'
    ];
    const aptitudeDescriptions = {
        '无演无尽': '亘古绝今从未有，演尽诸天万界，此等天资已超脱天道束缚',
        '万古无双': '横推古今未来无对手，为修道而生，为应劫而至，永恒无敌',
        '绝世天骄': '惊才绝艳，具备帝姿，注定为一个时代的天地主角',
        '旷世奇才': '万年难遇，此等资质放眼九天十地也是难寻',
        '天纵之资': '天赋异禀，媲美上古大教的天才',
        '超凡资质': '资质超凡，注定异于常人',
        '平庸之资': '资质平平，勉勉强强',
        '先天不足': '先天有缺，修炼事倍功半',
        '天弃之人': '被天道抛弃，修炼必遭反噬'
    };
    
    // 统计变量
    let originalAptitude = player.天资等级;
    let currentAptitudeIndex = aptitudeSequence.indexOf(originalAptitude);
    let aptitudeUpgrades = 0;
    let highestAptitudeReached = originalAptitude;
    let itemsObtained = {
        "真我宝盒": 0,
        "无瑕水晶花": 0,
        "誓约之证": 0,
        "遣龙令": 0,
        "遣虎令": 0,
        "众生仙钓": 0,
        "仙品秘境结算卡": 0,
        "修为": 0,
        "血气": 0
    };
    let successfulSummons = 0;
    let failedSummons = 0;
    
    replyMessage.push(`开始进行${totalSummons}次连续召唤，水晶花园为您绽放～♪`);
    
    // 执行连续召唤
    for (let i = 1; i <= totalSummons; i++) {
        let random = Math.random();
        let currentAptitude = player.天资等级;
        let currentIndex = aptitudeSequence.indexOf(currentAptitude);
        
        if (random > 0.2) { // 80%成功率
            successfulSummons++;
            
            // 天资提升判定（10%概率提升）
            if (Math.random() < 0.1 && currentIndex < 7) {
                const newAptitudeIndex = Math.min(currentIndex + 1, 7);
                const newAptitude = aptitudeSequence[newAptitudeIndex];
                player.天资等级 = newAptitude;
                player.天资评价 = aptitudeDescriptions[newAptitude];
                aptitudeUpgrades++;
                currentAptitudeIndex = newAptitudeIndex;
                
                if (aptitudeSequence.indexOf(newAptitude) > aptitudeSequence.indexOf(highestAptitudeReached)) {
                    highestAptitudeReached = newAptitude;
                }
            }
            
            // 道具奖励判定
            let rewardRandom = Math.random();
            if (rewardRandom < 0.2) {
                // 20%概率：真我宝盒 + 随机材料
                await Add_najie_thing(usr_qq, "真我宝盒", "盒子", 1);
                itemsObtained["真我宝盒"]++;
                
                let materialOptions = ["无瑕水晶花", "誓约之证"];
                for (let j = 0; j < 2; j++) {
                    let material = materialOptions[Math.floor(Math.random() * materialOptions.length)];
                    await Add_najie_thing(usr_qq, material, "道具", 1);
                    itemsObtained[material]++;
                }
            } else if (rewardRandom < 0.5) {
                // 30%概率：10个遣龙令或遣虎令
                let tokenOptions = ["遣龙令", "遣虎令"];
                let token = tokenOptions[Math.floor(Math.random() * tokenOptions.length)];
                await Add_najie_thing(usr_qq, token, "道具", 10);
                itemsObtained[token] += 10;
            } else {
                // 50%概率：众生仙钓 + 仙品秘境结算卡 + 修为血气
                await Add_najie_thing(usr_qq, "众生仙钓", "道具", 1);
                await Add_najie_thing(usr_qq, "仙品秘境结算卡", "道具", 5);
                await Add_修为(usr_qq, 20000000);
                await Add_血气(usr_qq, 20000000);
                itemsObtained["众生仙钓"]++;
                itemsObtained["仙品秘境结算卡"] += 5;
                itemsObtained["修为"] += 20000000;
                itemsObtained["血气"] += 20000000;
            }
        } else {
            failedSummons++;
        }
        
        // 消耗召唤次数
        player.爱莉希雅召唤次数--;
    }
    
    // 构建详细结果报告
    replyMessage.push("", "✨召唤结果汇总✨");
    replyMessage.push(`成功召唤：${successfulSummons}次`);
    replyMessage.push(`召唤失败：${failedSummons}次`);
    replyMessage.push(`天资提升：${aptitudeUpgrades}次`);
    
    if (originalAptitude !== highestAptitudeReached) {
        replyMessage.push(`天资变化：${originalAptitude} → ${highestAptitudeReached}`);
    } else {
        replyMessage.push(`天资等级：${highestAptitudeReached}（未发生变化）`);
    }
    
    // 道具获得详情
    replyMessage.push("", "获得道具：");
    let itemDetails = [];
    if (itemsObtained["真我宝盒"] > 0) itemDetails.push(`真我宝盒×${itemsObtained["真我宝盒"]}`);
    if (itemsObtained["无瑕水晶花"] > 0) itemDetails.push(`无瑕水晶花×${itemsObtained["无瑕水晶花"]}`);
    if (itemsObtained["誓约之证"] > 0) itemDetails.push(`誓约之证×${itemsObtained["誓约之证"]}`);
    if (itemsObtained["遣龙令"] > 0) itemDetails.push(`遣龙令×${itemsObtained["遣龙令"]}`);
    if (itemsObtained["遣虎令"] > 0) itemDetails.push(`遣虎令×${itemsObtained["遣虎令"]}`);
    if (itemsObtained["众生仙钓"] > 0) itemDetails.push(`众生仙钓×${itemsObtained["众生仙钓"]}`);
    if (itemsObtained["仙品秘境结算卡"] > 0) itemDetails.push(`仙品秘境结算卡×${itemsObtained["仙品秘境结算卡"]}`);
    if (itemsObtained["修为"] > 0) itemDetails.push(`修为+${itemsObtained["修为"].toLocaleString()}`);
    if (itemsObtained["血气"] > 0) itemDetails.push(`血气+${itemsObtained["血气"].toLocaleString()}`);
    
    if (itemDetails.length > 0) {
        replyMessage.push(itemDetails.join('、'));
    } else {
        replyMessage.push("本次未获得道具");
    }
    
    // 爱莉希雅风格的结束语
    const endingMessages = [
        "「哎呀～这么喜欢和我见面吗？要好好珍惜这份缘分哦♪」",
        "「每一次心跳都是新的开始，要带着我的祝福继续前进呀～♪」",
        "「飞花绽放的时刻虽然短暂，但美好的回忆会永远留在心中呢♪」",
        "「要记住哦～无论何时何地，爱莉希雅都会回应你的期待♪」"
    ];
    
    const randomEnding = endingMessages[Math.floor(Math.random() * endingMessages.length)];
    replyMessage.push("", randomEnding);
    
    // 保存玩家数据
    await Write_player(usr_qq, player);
    
    // 发送结果
    e.reply(replyMessage.join('\n'));
}
        //新年签到
        async daily_gift2(e) {
            //不开放私聊功能
            if (!e.isGroup) {
                return;
            }
            let usr_qq = e.user_id.toString().replace('qg_','');
            usr_qq = await channel(usr_qq);
            //有无账号
            let ifexistplay = await existplayer(usr_qq);
            if (!ifexistplay) {
                return;
            }
            let now = new Date();
            let nowTime = now.getTime(); //获取当前日期的时间戳
            let Yesterday = await shijianc(nowTime - 24 * 60 * 60 * 1000);//获得昨天日期
            let Today = await shijianc(nowTime);
            let lastsign_time = await getLastsign2(usr_qq);//获得上次签到日期
            if (Today.Y == lastsign_time.Y && Today.M == lastsign_time.M && Today.D == lastsign_time.D) {
                e.reply(`今日已经签到过了`);
                return;
            }
            let Sign_Yesterday;        //昨日日是否签到
            if (Yesterday.Y == lastsign_time.Y && Yesterday.M == lastsign_time.M && Yesterday.D == lastsign_time.D) {
                Sign_Yesterday = true;
            }
            else {
                Sign_Yesterday = false;
            }
            await redis.set("xiuxian:player:" + usr_qq + ":lastsign_time2", nowTime);//redis设置签到时间
            let player = await data.getData("player", usr_qq);
            if(!isNotNull(player.新年签到天数)){
                player.周年签到天数=0
            }
            if(player.周年签到天数==999){
                e.reply("您已领取过新年礼包了,不能再领取了")
                return
            }
            if(!Sign_Yesterday){//昨天没有签到,连续签到天数清零
                player.新年签到天数=0
            }
            player.新年签到天数 += 1;
            data.setData("player", usr_qq, player);
            if (player.新年签到天数 == 7) {
                let random=Math.random()
                let thing_name=""
                if(random>0.8){
                    let character=["龙","腾","虎","跃"]
                    let random2=Math.floor(Math.random()*character.length)
                    await Add_najie_thing(usr_qq,character[random2],"道具",1)
                    thing_name=character[random2]
                }
                await Add_灵石(usr_qq,200000)
                await Add_najie_thing(usr_qq, "秘境之匙", "道具", 3)
                await Add_najie_thing(usr_qq,"遣虎令","道具",1)
                player.新年签到天数 = 999;
                e.reply("您已连续签到七天,成功领取周年庆福利礼包("+thing_name+"灵石x20w,秘境之匙x3,遣虎令x1)")
                return
            }

            //给奖励
            let gift_xiuwei = player.新年签到天数 * 3000;
            await Add_najie_thing(usr_qq, "秘境之匙", "道具", this.xiuxianConfigData.Sign.ticket);
            await Add_血气(usr_qq, gift_xiuwei);
            let msg = [
                segment.at(usr_qq),
                `周年签到成功,已经连续签到${player.新年签到天数}天了，获得了${gift_xiuwei}血气,秘境之匙x${this.xiuxianConfigData.Sign.ticket}`
            ]
            await Write_player(usr_qq,player)
            e.reply(msg);
            return;
        }

async skhundred(e) {
    if (!e.isGroup) {
        return;
    }
    
    // 获取用户ID
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    // 检查是否为匿名用户
    if (usr_qq == 80000000) {
        return;
    }
    
    // 检查玩家是否存在
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        return;
    }
    
    // 解析命令类型
    let thing = e.msg.replace("#百遣", '');
    thing = thing.trim();
    
    // 处理百遣虎
    if (thing === "虎") {
        return await this.processHundredDispatch(e, usr_qq, "遣虎令", data.changzhu);
    }
    // 处理百遣龙
    else if (thing === "龙") {
        return await this.processHundredDispatch(e, usr_qq, "遣龙令", data.xianding);
    }
    
    return false;
}

// 处理百次派遣
async processHundredDispatch(e, usr_qq, tokenName, rewardPool) {
    // 检查令牌数量
    const tokenCount = await exist_najie_thing(usr_qq, tokenName, "道具");
    if (!tokenCount || tokenCount < 100) {
        e.reply(`你没有足够的【${tokenName}】，需要100个`);
        return;
    }
    
    // 收集所有消息
    const allMessages = [];
    e.reply(`百道金光从天而降，天地为之变色！`);
    
    // 收集所有奖励
    const rewardSummary = {};
    
    for (let i = 0; i < 100; i++) {
        const rewardIndex = Math.floor(Math.random() * rewardPool.length);
        const reward = rewardPool[rewardIndex];
        
        // 添加到纳戒
        await Add_najie_thing(
            usr_qq, 
            reward.name, 
            reward.class, 
            reward.数量
        );
        
        // 更新奖励汇总
        if (!rewardSummary[reward.name]) {
            rewardSummary[reward.name] = {
                quantity: reward.数量,
                class: reward.class
            };
        } else {
            rewardSummary[reward.name].quantity += reward.数量;
        }
        
        // 每10次添加一条进度消息
        if ((i + 1) % 10 === 0) {
            allMessages.push(`金光如雨，已降临${i + 1}道！`);
        }
    }
    
    // 扣除令牌
    await Add_najie_thing(usr_qq, tokenName, "道具", -100);
    
    // 构建奖励汇总消息
    allMessages.push(`百道金光降临完毕！`);
    allMessages.push(`消耗了100个【${tokenName}】，获得以下奖励：`);
    
    // 添加奖励详情
    for (const [name, info] of Object.entries(rewardSummary)) {
        allMessages.push(`【${name}】x${info.quantity} (${info.class})`);
    }
    
    // 添加特殊奖励提示
    const hasSpecialReward = Object.keys(rewardSummary).some(name => 
        name.includes("仙器") || name.includes("神物")
    );
    
    if (hasSpecialReward) {
        allMessages.push(` 天降祥瑞！你获得了稀世珍宝！`);
    }
    
    // 使用ForwardMsg发送所有消息
    await ForwardMsg(e, allMessages);
    return true;
}
async lianqipifu(e) {
    if (!e.isGroup) {
        return;
    }
      const image = await get_lianqipifu_img(e);
    e.reply(image);
}
 async cundan_pifu(e) {
    if (!e.isGroup) {
        return;
    }
    
    const usr_qq = e.user_id;
    const command = e.msg.replace('#自选存档皮肤', '').trim();
    
    // 解析命令
    const parts = command.split("*");
    if (parts.length < 2) {
        e.reply("命令格式错误，请使用#自选存档皮肤<皮肤ID>*<类型>");
        return;
    }
    
    const skinId = parts[0].trim();
    const skinType = parts[1].trim();
    
    // 验证类型
    const validTypes = ["练气", "装备"];
    if (!validTypes.includes(skinType)) {
        e.reply(`无效的类型：${skinType}，请使用"练气"或"装备"`);
        return;
    }
    
    // 确定目录
    let dirPath;
    if (skinType === "练气") {
        dirPath = __PATH.player_pifu_path;
    } else {
        dirPath = __PATH.equipment_pifu_path;
    }
    
    // 检查目录是否存在
    if (!fs.existsSync(dirPath)) {
        e.reply("皮肤目录不存在，请联系管理员");
        return;
    }
    
    // 读取目录文件
    let files;
    try {
        files = fs.readdirSync(dirPath);
    } catch (err) {
        e.reply(`读取皮肤目录失败：${err.message}`);
        return;
    }
    
    // 过滤jpg文件
    const jpgFiles = files.filter(file => file.endsWith(".jpg"));
    
    // 检查皮肤是否存在
    const skinFile = jpgFiles.find(file => file.replace(".jpg", "") === skinId);
    if (!skinFile) {
        e.reply(`皮肤ID ${skinId} 不存在`);
        return;
    }
    
    // 更新玩家皮肤
    try {
        const player = await Read_player(usr_qq);
        
        if (skinType === "练气") {
            player.练气皮肤 = skinId;
        } else {
            player.装备皮肤 = skinId;
        }
        
        await Write_player(usr_qq, player);
        e.reply(`成功设置${skinType}皮肤为：${skinId}`);
    } catch (err) {
        e.reply(`保存皮肤设置失败：${err.message}`);
    }
}
async upload_pifu(e) {
    // 仅限群聊使用
    if (!e.isGroup) {
        e.reply("此功能仅在群聊中可用");
        return true;
    }
    
    const usr_qq = e.user_id;
    
    // 解析指令格式 #上传练气皮肤 <皮肤ID>
    const commandParts = e.msg.split(/\s+/);
    if (commandParts.length < 2) {
        e.reply("指令格式错误，请使用#上传练气皮肤 <皮肤ID>");
        return true;
    }
    
    const skinId = commandParts[1].trim();
    if (!skinId) {
        e.reply("请指定皮肤ID，例如：#上传练气皮肤 85");
        return true;
    }
    
    // 检查ID格式（只允许字母、数字和下划线）
    if (!/^[a-zA-Z0-9_]+$/.test(skinId)) {
        e.reply("皮肤ID只能包含字母、数字和下划线");
        return true;
    }
    
    // 检查消息中是否包含图片
    let imageUrl = null;
    if (e.message && Array.isArray(e.message)) {
        for (const item of e.message) {
            if (item.type === 'image') {
                imageUrl = item.url;
                break;
            }
        }
    }
    
    if (!imageUrl) {
        e.reply("请发送一张JPG图片进行上传");
        return true;
    }
    
    // 确定目录
    const dirPath = __PATH.player_pifu_path;
    
    // 检查目录是否存在，不存在则创建
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
        } catch (err) {
            e.reply("创建皮肤目录失败，请联系管理员");
            return true;
        }
    }
    
    // 检查皮肤ID是否已存在
    const fileName = `${skinId}.jpg`;
    const filePath = path.join(dirPath, fileName);
    
    if (fs.existsSync(filePath)) {
        e.reply(`皮肤ID ${skinId} 已被使用，请选择其他ID`);
        return true;
    }
    
    try {
        // 下载图片
        e.reply("正在上传皮肤图片，请稍候...");
        
        // 使用axios下载图片
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream'
        });
        
        // 创建写入流
        const writer = fs.createWriteStream(filePath);
        
        // 管道传输数据
        response.data.pipe(writer);
        
        // 等待下载完成
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        
        // 更新玩家皮肤
        const player = await Read_player(usr_qq);
        player.练气皮肤 = skinId;
        await Write_player(usr_qq, player);
        
        e.reply([
            `成功上传并设置练气皮肤为：${skinId}`,
            segment.image(`file://${filePath}`) // 显示上传的皮肤图片
        ]);
        
    } catch (err) {
        console.error("上传皮肤失败:", err);
        e.reply("上传皮肤失败，请稍后重试或联系管理员");
    }
    
    return true;
}


        async skten(e) {
            if (!e.isGroup) {
                return;
            }
            //固定写法
            let usr_qq = e.user_id.toString().replace('qg_','');
            usr_qq = await channel(usr_qq);
            //判断是否为匿名创建存档
            if (usr_qq == 80000000) {
                return;
            }
            //有无存档
            let ifexistplay = await existplayer(usr_qq);
            if (!ifexistplay) {
                return;
            }
            let thing = e.msg.replace("#", '');
            thing = thing.replace("十遣", '');
            if (thing == "虎") {
                let x = await exist_najie_thing(usr_qq, "遣虎令", "道具")
                if (!x) {
                    e.reply("你没有【遣虎令】")
                    return
                }
                if (x < 10) {
                    e.reply("你没有足够的【遣虎令】")
                    return
                }
                e.reply("十道金光从天而降")
                let msg = []
                let all = []
                await sleep(5000)
                for (var i = 0; 10 > i; i++) {
                    let tianluoRandom = Math.floor(Math.random() * (data.changzhu.length));

                    msg.push("一道金光掉落在地上，走近一看是【" +data.changzhu[tianluoRandom].name+"】")
                    await Add_najie_thing(usr_qq, data.changzhu[tianluoRandom].name,data.changzhu[tianluoRandom].class, data.changzhu[tianluoRandom].数量)
                    all.push("【" + data.changzhu[tianluoRandom].name + "x+"+data.changzhu[tianluoRandom].数量+"个】")
                }
                await Add_najie_thing(usr_qq, "遣虎令", "道具", -10)
                await ForwardMsg(e, msg)
                e.reply("恭喜获得\n" + all)
            }
            if (thing == "龙") {
                let x = await exist_najie_thing(usr_qq, "遣龙令", "道具")
                if (!x) {
                    e.reply("你没有【遣龙令】")
                    return
                }
                if (x < 10) {
                    e.reply("你没有足够的【遣龙令】")
                    return
                }
                e.reply("十道金光从天而降")
                let msg = []
                let all = []
                await sleep(5000)
                for (var i = 0; 10 > i; i++) {
                    let tianluoRandom = Math.floor(Math.random() * (data.xianding.length));

                    msg.push("一道金光掉落在地上，走近一看是【" +data.xianding[tianluoRandom].name+"】")
                    await Add_najie_thing(usr_qq, data.xianding[tianluoRandom].name,data.xianding[tianluoRandom].class, data.xianding[tianluoRandom].数量)
                    all.push("【" + data.xianding[tianluoRandom].name + "x+"+data.xianding[tianluoRandom].数量+"个】")
                }
                await Add_najie_thing(usr_qq, "遣龙令", "道具", -10)
                await ForwardMsg(e, msg)
                e.reply("恭喜获得\n" + all)
            }
        }
    
        async sk(e) {
            if (!e.isGroup) {
                return;
            }
            //固定写法
            let usr_qq = e.user_id.toString().replace('qg_','');
            usr_qq = await channel(usr_qq);
            //判断是否为匿名创建存档
            if (usr_qq == 80000000) {
                return;
            }
            //有无存档
            let ifexistplay = await existplayer(usr_qq);
            if (!ifexistplay) {
                return;
            }
            let thing = e.msg.replace("#", '');
            thing = thing.replace("遣", '');
            if (thing == "虎") {
                let x = await exist_najie_thing(usr_qq, "遣虎令", "道具")
                if (!x) {
                    e.reply("你没有【遣虎令】")
                    return
                }
                e.reply("一道金光从天而降")
                let tianluoRandom = Math.floor(Math.random() * (data.changzhu.length));
                await Add_najie_thing(usr_qq, data.changzhu[tianluoRandom].name,data.changzhu[tianluoRandom].class, data.changzhu[tianluoRandom].数量)
                await Add_najie_thing(usr_qq, "遣虎令", "道具", -1)
                await sleep(5000)
                e.reply("一道金光掉落在地上，走近一看是【" +data.changzhu[tianluoRandom].name+ "x+"+data.changzhu[tianluoRandom].数量+"个】")
            }
            if (thing == "龙") {
                let x = await exist_najie_thing(usr_qq, "遣龙令", "道具")
                if (!x) {
                    e.reply("你没有【遣龙令】")
                    return
                }
                e.reply("一道金光从天而降")
                let tianluoRandom = Math.floor(Math.random() * (data.xianding.length));
                await Add_najie_thing(usr_qq, data.xianding[tianluoRandom].name,data.xianding[tianluoRandom].class, data.xianding[tianluoRandom].数量)
                await Add_najie_thing(usr_qq, "遣龙令", "道具", -1)
                await sleep(5000)
                e.reply("一道金光掉落在地上，走近一看是【" +data.xianding[tianluoRandom].name+ "x+"+data.xianding[tianluoRandom].数量+"个】")
            }
        }
   
    async D(e){
        //不开放私聊功能
        if (!e.isGroup) {
            return;
        }
        let usr_qq = e.user_id.toString().replace('qg_','');
        usr_qq = await channel(usr_qq);
        //有无存档
        let ifexistplay = await existplayer(usr_qq);
        if (!ifexistplay) {
            return;
        }
        await Go(e);
        if (allaction) {
            console.log(allaction);
        }
        else {
            return;
        }
        allaction = false;
        let peifang=["龙","腾","虎","跃"]
        for(var i=0;i<peifang.length;i++){
            let thing_quantity = await exist_najie_thing(usr_qq, peifang[i], "道具");
            if (!thing_quantity) {//没有
                e.reply(`你没有【${peifang[i]}】字符,召唤失败`);
                return;
            }
            await Add_najie_thing(usr_qq,peifang[i],"道具",-1)
        }

        //刷新若陀
        await InitWorldBoss(e.user_id,e)
        e.reply("千年的封印再次被破开,天地剧烈抖动,岩之神明所创之物:[若陀龙王]再现人世");

    }


}
/**
 * 状态
 */
 export async function Go(e) {
    let usr_qq = e.user_id;
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        return;
    }
    //获取游戏状态
    let game_action = await redis.get("xiuxian:player:" + usr_qq + ":game_action");
    //防止继续其他娱乐行为
    if (game_action == 0) {
        e.reply("修仙：游戏进行中...");
        return;
    }
    //查询redis中的人物动作
    let action = await redis.get("xiuxian:player:" + usr_qq + ":action");
    action = JSON.parse(action);
    if (action != null) {
        //人物有动作查询动作结束时间
        let action_end_time = action.end_time;
        let now_time = new Date().getTime();
        if (now_time <= action_end_time) {
            let m = parseInt((action_end_time - now_time) / 1000 / 60);
            let s = parseInt(((action_end_time - now_time) - m * 60 * 1000) / 1000);
            e.reply("正在" + action.action + "中,剩余时间:" + m + "分" + s + "秒");
            return;
        }
    }
    allaction = true;
    return;
}

