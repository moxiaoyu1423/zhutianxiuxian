import { plugin, config } from '../../api/api.js';
import xiuxianData from '../../model/XiuxianData.js';
import {
    Read_player,
    existplayer,
    Write_player,
    Add_灵石,
    Add_源石,
    Add_修为,
    Add_血气,
    ForwardMsg,
    bigNumberTransform,
    Add_najie_thing,
    channel
} from '../../model/xiuxian.js';
import schedule from 'node-schedule';

/**
 * 自动每日任务系统
 * 为道法仙术玩家自动执行：签到、领取俸禄、天道赐福、道法赐福
 */
export class AutoDailyTask extends plugin {
    constructor() {
        super({
            name: 'AutoDailyTask',
            dsc: '自动每日任务系统',
            event: 'message',
            priority: 1000, // 高优先级确保先初始化
            rule: [
                {
                    reg: '^#测试自动任务$',
                    fnc: 'testAutoTask',
                    permission: 'master'
                },
                {
                    reg: '^#查看领取记录$',
                    fnc: 'viewClaimRecords'
                },
                {
                    reg: '^#重置全体签到记录$',
                    fnc: 'resetAllSignRecords',
                    permission: 'master'
                },
                {
                    reg: '^#开启自动任务$',
                    fnc: 'enableAutoTask'
                },
                {
                    reg: '^#关闭自动任务$',
                    fnc: 'disableAutoTask'
                },
                {
                    reg: '^#自动任务状态$',
                    fnc: 'checkAutoTaskStatus'
                }
            ]
        });
        
        // 读取配置
        this.set = config.getConfig('xiuxian', 'xiuxian');
        
        // 初始化定时任务
        this.initAutoTask();
    }

    /**
     * 初始化自动任务
     */
    initAutoTask() {
        // 每天00:05执行（避免与道法仙术扣减任务冲突）
        schedule.scheduleJob('0 5 0 * * *', async () => {
            console.log('开始执行自动每日任务');
            await this.executeAutoTask();
            console.log('自动每日任务执行完成');
        });
        
        console.log('自动每日任务定时器已设置 - 每天00:05执行');
    }

    /**
     * 执行自动任务
     */
    async executeAutoTask() {
        try {
            // 获取所有道法仙术玩家
            const daofaList = xiuxianData.getDaofaList();
            const playerQQs = Object.keys(daofaList);
            
            if (playerQQs.length === 0) {
                console.log('当前无道法仙术玩家，跳过自动任务');
                return;
            }

            console.log(`发现${playerQQs.length}位道法仙术玩家，开始执行自动任务`);

            let successCount = 0;
            let failCount = 0;
            
            // 统计各项任务的成功次数
            const taskStats = {
                sign: 0,
                salary: 0,
                tiandao: 0,
                daofa: 0,
                vein: 0,
                beast: 0
            };

            for (const qq of playerQQs) {
                try {
                    const stats = await this.processPlayer(qq);
                    if (stats) {
                        successCount++;
                        taskStats.sign += stats.sign || 0;
                        taskStats.salary += stats.salary || 0;
                        taskStats.tiandao += stats.tiandao || 0;
                        taskStats.daofa += stats.daofa || 0;
                        taskStats.vein += stats.vein || 0;
                        taskStats.beast += stats.beast || 0;
                    }
                } catch (error) {
                    console.error(`处理玩家 ${qq} 时出错:`, error);
                    failCount++;
                }
            }

            console.log(`自动任务完成 - 成功: ${successCount}, 失败: ${failCount}`);
            console.log(`任务统计 - 签到: ${taskStats.sign}, 俸禄: ${taskStats.salary}, 天道赐福: ${taskStats.tiandao}, 道法赐福: ${taskStats.daofa}, 开采灵脉: ${taskStats.vein}, 神兽赐福: ${taskStats.beast}`);

            // 发送群消息推送
            await this.sendTaskNotification(successCount, taskStats);
            
        } catch (error) {
            console.error('执行自动任务时发生严重错误:', error);
        }
    }

/**
 * 处理单个玩家的自动任务 - 修复版
 */
async processPlayer(qq) {
    // 转换QQ号格式
    const usr_qq = await channel(qq.toString().replace('qg_', ''));
    
    // 检查玩家是否存在
    if (!await existplayer(usr_qq)) {
        console.log(`玩家 ${usr_qq} 不存在，跳过`);
        return null;
    }

    // 读取玩家数据
    const player = await Read_player(usr_qq);
    
    // 检查是否为道法仙术玩家
    if (player.daofaxianshu !== 2) {
        console.log(`玩家 ${usr_qq} 道法仙术状态异常，跳过`);
        return null;
    }

    // 检查是否过期
    const nowTime = new Date().getTime();
    if (!player.daofaxianshu_endtime || player.daofaxianshu_endtime <= nowTime) {
        console.log(`玩家 ${usr_qq} 道法仙术已过期，跳过`);
        return null;
    }

    console.log(`开始为玩家 ${player.名号 || usr_qq} 执行自动任务`);

    // 统计各项任务执行情况
    const stats = {
        sign: 0,
        salary: 0,
        tiandao: 0,
        daofa: 0,
        vein: 0,
        beast: 0
    };

    // 检查是否开启自动任务
    const autoTaskEnabled = await this.isAutoTaskEnabled(usr_qq);
    
    if (!autoTaskEnabled) {
        console.log(`玩家 ${usr_qq} 已关闭自动任务，跳过所有任务`);
        return stats; // 返回空的统计，但不返回null
    }

    // 只有自动任务开启时才执行以下任务
    try {
        // 1. 自动签到
        const signResult = await this.autoSign(usr_qq, player);
        if (signResult) stats.sign = 1;
        
        // 2. 自动领取势力俸禄
        const salaryResult = await this.autoClaimSalary(usr_qq, player);
        if (salaryResult) stats.salary = 1;
        
        // 3. 自动天道赐福
        const tiandaoResult = await this.autoTiandaoCifu(usr_qq, player);
        if (tiandaoResult) stats.tiandao = 1;
        
        // 4. 自动道法赐福
        const daofaResult = await this.autoDaofaCifu(usr_qq, player);
        if (daofaResult) stats.daofa = 1;
        
        // 5. 自动开采宗门灵脉
        const veinResult = await this.autoExploitVein(usr_qq, player);
        if (veinResult) stats.vein = 1;
        
        // 6. 自动神兽赐福
        const beastResult = await this.autoBeastBonus(usr_qq, player);
        if (beastResult) stats.beast = 1;

        console.log(`玩家 ${player.名号 || usr_qq} 自动任务执行完成`);
        return stats;
    } catch (error) {
        console.error(`处理玩家 ${usr_qq} 自动任务时出错:`, error);
        return stats; // 返回已执行的任务统计
    }
}

/**
 * 检查玩家是否开启了自动任务
 */
async isAutoTaskEnabled(usr_qq) {
    try {
        const enabled = await redis.get(`xiuxian:player:${usr_qq}:auto_task_enabled`);
        return enabled === 'true';
    } catch (error) {
        console.error(`检查玩家 ${usr_qq} 自动任务状态失败:`, error);
        return true; // 默认开启，因为道法仙术玩家应该享受自动任务
    }
}

/**
 * 检查玩家是否开启了自动签到（已存在的方法，保持兼容）
 */
async isAutoSignEnabled(usr_qq) {
    try {
        const enabled = await redis.get(`xiuxian:player:${usr_qq}:auto_sign_enabled`);
        return enabled === 'true';
    } catch (error) {
        console.error(`检查玩家 ${usr_qq} 自动签到状态失败:`, error);
        return true; // 默认开启
    }
}

    /**
     * 自动签到
     */
    async autoSign(usr_qq, player) {
        try {
            // 检查今日是否已签到
            let today = new Date();
            const todayStr = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
            

            const lastSignTime = await redis.get(`xiuxian:player:${usr_qq}:lastsign_time`);
            
            if (lastSignTime) {
                const lastSignDate = new Date(parseInt(lastSignTime));
                const lastSignStr = `${lastSignDate.getFullYear()}-${lastSignDate.getMonth()+1}-${lastSignDate.getDate()}`;
                
                if (lastSignStr === todayStr) {
                    console.log(`玩家 ${usr_qq} 今日已签到，跳过`);
                    return false;
                }
            }

            // 更新连续签到天数（先更新再计算奖励）
            const yesterday = new Date(today.getTime() - 86400000);
            const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;
            
            if (lastSignTime) {
                const lastSignDate = new Date(parseInt(lastSignTime));
                const lastSignDateStr = `${lastSignDate.getFullYear()}-${lastSignDate.getMonth()+1}-${lastSignDate.getDate()}`;
                
                if (lastSignDateStr === yesterdayStr) {
                    player.连续签到天数 = (player.连续签到天数 || 0) + 1;
                } else {
                    player.连续签到天数 = 1;
                }
            } else {
                player.连续签到天数 = 1;
            }

            // 执行签到逻辑（简化版）
            const isDaofaPlayer = player.daofaxianshu == 2;
            let baseMultiplier = isDaofaPlayer ? 2 : 1;
            
            // 确保所有属性都有默认值
            const levelId = player.level_id || 1;
            const physiqueId = player.Physique_id || 1;
            const mijinLevelId = player.mijinglevel_id || 1;
            const xiangulevelId = player.xiangulevel_id || 1;
            
            let 加成 = levelId * physiqueId + (mijinLevelId * xiangulevelId);
            
            let gift_xiuwei = player.连续签到天数 * 10000 * baseMultiplier * 加成;
            let ticketCount = 5 * baseMultiplier;
            let yuanshi = player.连续签到天数 * 300 * baseMultiplier * 加成;

            // 发放奖励
            await Add_najie_thing(usr_qq, '秘境之匙', '道具', ticketCount);
            await Add_najie_thing(usr_qq, '喇叭', '道具', ticketCount);
            await Add_源石(usr_qq, yuanshi);
            await Add_灵石(usr_qq, yuanshi);
            await Add_修为(usr_qq, gift_xiuwei);
            await Add_血气(usr_qq, gift_xiuwei);

            // 记录签到消息文本
             today = new Date().toISOString().split('T')[0];
            const signMsg = `每日签到成功：\n` +
                `您获得了${this.formatNumber(gift_xiuwei)}修为与血气\n` +
                `${this.formatNumber(yuanshi)}源石\n` +
                `${this.formatNumber(yuanshi)}灵石\n` +
                `${ticketCount}把秘境之匙\n` +
                `${ticketCount}个喇叭\n` +
                `连续签到${player.连续签到天数}天`;
            
            await redis.set(`xiuxian:player:${usr_qq}:sign_msg:${today}`, signMsg);

            // 保存数据
            await Write_player(usr_qq, player);
            await redis.set(`xiuxian:player:${usr_qq}:lastsign_time`, new Date().getTime());

            console.log(`玩家 ${usr_qq} 自动签到完成`);
            return true;
        } catch (error) {
            console.error(`玩家 ${usr_qq} 自动签到失败:`, error);
            return false;
        }
    }

    /**
     * 自动领取势力俸禄
     */
    async autoClaimSalary(usr_qq, player) {
        try {
            if (!player.势力) {
                console.log(`玩家 ${usr_qq} 未加入势力，跳过俸禄领取`);
                return false;
            }

            let success = false;

            // 处理瑶池和摇光圣地的俸禄
            if (player.势力 === "瑶池" || player.势力 === "摇光圣地") {
                const today = new Date().toISOString().split('T')[0];
                
                // 检查今日是否已领取
                let redisKey;
                if (player.势力 === "瑶池") {
                    redisKey = `xiuxian:player:${usr_qq}:yaochi_salary_date`;
                } else if (player.势力 === "摇光圣地") {
                    redisKey = `xiuxian:player:${usr_qq}:yaoguang_salary_date`;
                }

                const lastClaimDate = await redis.get(redisKey);
                if (lastClaimDate !== today) {
                    // 计算俸禄
                    let salary = 0;
                    const position = player.势力职位 || "记名弟子";

                    if (player.势力 === "瑶池") {
                        const salaryTable = {
                            "记名女弟子": 100000,
                            "正式女弟子": 500000,
                            "亲传女弟子": 2000000,
                            "真传女弟子": 5000000,
                            "圣女": 12000000
                        };
                        salary = salaryTable[position] || 0;
                    } else if (player.势力 === "摇光圣地") {
                        const salaryTable = {
                            "记名弟子": 100000,
                            "外门弟子": 500000,
                            "内门弟子": 2000000,
                            "核心弟子": 5000000,
                            "真传弟子": 8000000,
                            "圣子": 12000000,
                            "圣女": 12000000
                        };
                        salary = salaryTable[position] || 0;
                    }

                    if (salary > 0) {
                        // 道法仙术玩家俸禄翻倍
                        if (player.daofaxianshu === 2) {
                            salary *= 2;
                        }
                        
                        player.源石 += salary;
                        await Write_player(usr_qq, player);
                        await redis.set(redisKey, today);

                        console.log(`玩家 ${usr_qq} 自动领取${player.势力}俸禄 ${salary} 源石`);
                        success = true;
                    }
                }
            }

            // 处理剑云海秘库
            if (player.势力 === "剑云海") {
                const jianyunhaiResult = await this.autoOpenJianyunhai(usr_qq, player);
                if (jianyunhaiResult) {
                    success = true;
                }
            }

            return success;
        } catch (error) {
            console.error(`玩家 ${usr_qq} 自动领取俸禄失败:`, error);
            return false;
        }
    }

    /**
     * 自动开启剑云海秘库
     */
    async autoOpenJianyunhai(usr_qq, player) {
        try {
            // 获取当前日期（基于本地时间的0点）
            const now = new Date();
            const today = now.getDate(); // 获取当月日期数字（1-31）
            
            // 获取上次开启的日期
            const lastOpenDay = await redis.get(`xiuxian:player:${usr_qq}:jianyunhai_open_day`);
            
            // 检查今日是否已开启秘库（比较日期数字）
            if (lastOpenDay && parseInt(lastOpenDay) === today) {
                console.log(`玩家 ${usr_qq} 今日已开启剑云海秘库，跳过`);
                return false;
            }

            // 基础奖励：3000万源石
            player.源石 += 30000000;
            
            // 随机决定仙品或圣品秘境结算卡
            const isXianpin = Math.random() < 0.5;
            const settlementCard = isXianpin ? "仙品秘境结算卡" : "圣品秘境结算卡";
            
            // 定义三组奖励物品
            const rewardGroups = [
                ["众生仙钓", "道具"],
                ["剑云海圣药", "丹药"],
                [settlementCard, "道具"]
            ];
            
            // 随机决定奖励档次
            const random = Math.random();
            let rewardMultiplier = 1;
            let extraRewards = "";
            
            if (random < 0.7) {
                // 70%概率：每组3个物品
                rewardMultiplier = 3;
            } else if (random < 0.9) {
                // 20%概率：每组5个物品
                rewardMultiplier = 5;
            } else {
                // 10%概率：每组5个物品 + 10个超越宝盒
                rewardMultiplier = 5;
                extraRewards += "10个超越宝盒、";
            }
            
            // 发放奖励
            for (const [itemName, itemType] of rewardGroups) {
                await Add_najie_thing(usr_qq, itemName, itemType, rewardMultiplier);
            }
            
            if (extraRewards) {
                await Add_najie_thing(usr_qq, "超越宝盒", "盒子", 10);
            }
            
            // 记录开启日期（存储日期数字）
            await redis.set(`xiuxian:player:${usr_qq}:jianyunhai_open_day`, today);
            
            // 保存玩家数据（源石增加）
            await Write_player(usr_qq, player);

            // 记录剑云海秘库消息文本
            const todayStr = new Date().toISOString().split('T')[0];
            let jianyunhaiMsg = `剑云海秘库开启成功：\n` +
                `您获得了3000万源石供奉\n` +
                `${rewardMultiplier}个众生仙钓\n` +
                `${rewardMultiplier}个剑云海圣药\n` +
                `${rewardMultiplier}个${isXianpin ? "仙品" : "圣品"}秘境结算卡\n`;
            
            if (extraRewards) {
                jianyunhaiMsg += `${extraRewards}\n`;
            }

            await redis.set(`xiuxian:player:${usr_qq}:jianyunhai_msg:${todayStr}`, jianyunhaiMsg);

            console.log(`玩家 ${usr_qq} 自动开启剑云海秘库完成`);
            return true;
        } catch (error) {
            console.error(`玩家 ${usr_qq} 自动开启剑云海秘库失败:`, error);
            return false;
        }
    }

    /**
     * 自动天道赐福
     */
    async autoTiandaoCifu(usr_qq, player) {
        try {
            // 检查境界要求
            if (player.level_id < 22) {
                console.log(`玩家 ${usr_qq} 境界不足，跳过天道赐福`);
                return false;
            }

            let today = new Date();
            const todayStr = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;

            // 检查今日是否已赐福
            const lastCifuTimeStr = await redis.get(`xiuxian:player:${usr_qq}:lastCifuTime`);
            if (lastCifuTimeStr) {
                const lastCifuTime = new Date(parseInt(lastCifuTimeStr));
                const lastCifuStr = `${lastCifuTime.getFullYear()}-${lastCifuTime.getMonth()+1}-${lastCifuTime.getDate()}`;
                
                if (lastCifuStr === todayStr) {
                    console.log(`玩家 ${usr_qq} 今日已天道赐福，跳过`);
                    return false;
                }
            }

            // 计算奖励
            let lastjiangli = Math.floor(player.level_id * 0.1);
            if (player.daofaxianshu === 2) {
                lastjiangli *= 2; // 道法仙术翻倍
            }

            // 发放基础奖励
            await Add_najie_thing(usr_qq, '秘境之匙', '道具', lastjiangli);
            await Add_najie_thing(usr_qq, '打工券', '道具', lastjiangli);

            // 职业额外奖励
            if (player.occupation === '侠客') {
                await Add_najie_thing(usr_qq, '侠客令', '道具', 3);
            } else if (player.occupation === '唤魔者') {
                await Add_najie_thing(usr_qq, '唤魔令', '道具', 3);
            }

            // 等级额外奖励
            if (player.level_id > 41) {
                await Add_najie_thing(usr_qq, '仙舟', '道具', lastjiangli);
            }
            if (player.level_id > 54) {
                await Add_najie_thing(usr_qq, '神域令牌', '道具', lastjiangli);
            }

            // 道法仙术额外奖励
            if (player.daofaxianshu === 2) {
                await Add_najie_thing(usr_qq, '九阶玄元丹', '丹药', lastjiangli);
                await Add_najie_thing(usr_qq, '九阶淬体丹', '丹药', lastjiangli);
            }

            // 记录天道赐福消息文本
             today = new Date().toISOString().split('T')[0];
            let tiandaoMsg = `天道赐福成功：\n` +
                `您获得了${lastjiangli}把秘境之匙${lastjiangli}张打工券\n`;
            
            // 职业额外奖励
            if (player.occupation === '侠客') {
                tiandaoMsg += `作为侠客，您额外获得了3个侠客令\n`;
            } else if (player.occupation === '唤魔者') {
                tiandaoMsg += `作为唤魔者，您额外获得了3个唤魔令\n`;
            }

            // 等级额外奖励
            if (player.level_id > 41) {
                tiandaoMsg += `您是仙人，您额外获得了${lastjiangli}个仙舟\n`;
            }
            if (player.level_id > 54) {
                tiandaoMsg += `您是万界之上的存在，您额外获得了${lastjiangli}个神域令牌\n`;
            }

            // 道法仙术额外奖励
            if (player.daofaxianshu === 2) {
                tiandaoMsg += `【道法仙术】对您赐福！您额外获得了${lastjiangli}把秘境之匙\n` +
                    `${lastjiangli}张打工券\n` +
                    `${lastjiangli}个九阶玄元丹\n` +
                    `${lastjiangli}个九阶淬体丹！`;
            }

            await redis.set(`xiuxian:player:${usr_qq}:tiandao_msg:${today}`, tiandaoMsg);

            // 记录时间
            await redis.set(`xiuxian:player:${usr_qq}:lastCifuTime`, new Date().getTime());

            console.log(`玩家 ${usr_qq} 自动天道赐福完成`);
            return true;
        } catch (error) {
            console.error(`玩家 ${usr_qq} 自动天道赐福失败:`, error);
            return false;
        }
    }

    /**
     * 自动道法赐福
     */
    async autoDaofaCifu(usr_qq, player) {
        try {
            let today = new Date();
            const todayStr = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;

            // 检查今日是否已赐福
            const lastSignTime = await redis.get(`xiuxian:player:${usr_qq}:lastsign_time3`);
            if (lastSignTime) {
                const lastSignDate = new Date(parseInt(lastSignTime));
                const lastSignStr = `${lastSignDate.getFullYear()}-${lastSignDate.getMonth()+1}-${lastSignDate.getDate()}`;
                
                if (lastSignStr === todayStr) {
                    console.log(`玩家 ${usr_qq} 今日已道法赐福，跳过`);
                    return false;
                }
            }

            // 更新连续赐福天数
            const yesterday = new Date(today.getTime() - 86400000);
            const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;
            
            if (lastSignTime) {
                const lastSignDate = new Date(parseInt(lastSignTime));
                const lastSignDateStr = `${lastSignDate.getFullYear()}-${lastSignDate.getMonth()+1}-${lastSignDate.getDate()}`;
                
                if (lastSignDateStr === yesterdayStr) {
                    player.道法赐福天数 += 1;
                } else {
                    player.道法赐福天数 = 1;
                }
            } else {
                player.道法赐福天数 = 1;
    }

            // 连续7天重置奖励
            if (player.道法赐福天数 >= 7) {
                player.道法赐福天数 = 1;
                await Add_najie_thing(usr_qq, '超越宝盒', '盒子', 5);
            }

            // 计算奖励
            let gift_xiuwei = player.道法赐福天数 * 10000 * player.level_id * player.Physique_id * (player.mijinglevel_id + player.xiangulevel_id);
            const tickets = player.道法赐福天数 * 2;

            // 发放奖励
            await Add_najie_thing(usr_qq, '龙', '道具', tickets);
            await Add_najie_thing(usr_qq, '腾', '道具', tickets);
            await Add_najie_thing(usr_qq, '虎', '道具', tickets);
            await Add_najie_thing(usr_qq, '跃', '道具', tickets);
            await Add_najie_thing(usr_qq, '遣龙令', '道具', tickets);
            await Add_najie_thing(usr_qq, '遣虎令', '道具', tickets);
            await Add_najie_thing(usr_qq, '位面传送阵', '道具', 1);
            await Add_najie_thing(usr_qq, '灵品秘境结算卡', '道具', tickets);
            
            await Add_修为(usr_qq, gift_xiuwei);
            await Add_血气(usr_qq, gift_xiuwei);

            // 记录道法赐福消息文本
             today = new Date().toISOString().split('T')[0];
            let daofaMsg = `道法赐福成功：\n` +
                `您获得了${bigNumberTransform(gift_xiuwei)}修为\n` +
                `${bigNumberTransform(gift_xiuwei)}血气\n` +
                `${tickets}个龙\n` +
                `${tickets}个腾\n` +
                `${tickets}个虎\n` +
                `${tickets}个跃\n` +
                `${tickets}个遣龙令\n` +
                `${tickets}个遣虎令\n` +
                `1个位面传送阵\n` +
                `${tickets}张灵品秘境结算卡`;

            // 连续7天重置奖励
            if (player.道法赐福天数 >= 7) {
                daofaMsg += `\n5个超越宝盒`;
            }

            await redis.set(`xiuxian:player:${usr_qq}:daofa_msg:${today}`, daofaMsg);

            // 保存数据
            await Write_player(usr_qq, player);
            await redis.set(`xiuxian:player:${usr_qq}:lastsign_time3`, new Date().getTime());

            console.log(`玩家 ${usr_qq} 自动道法赐福完成`);
            return true;
        } catch (error) {
            console.error(`玩家 ${usr_qq} 自动道法赐福失败:`, error);
            return false;
        }
    }

    /**
     * 自动开采宗门灵脉
     */
    async autoExploitVein(usr_qq, player) {
        try {
            // 检查玩家是否有宗门
            if (!player.宗门) {
                console.log(`玩家 ${usr_qq} 未加入宗门，跳过开采灵脉`);
                return false;
            }

            // 获取宗门信息
            const { data } = await import('../../api/api.js');
            const ass = data.getAssociation(player.宗门.宗门名称);
            
            // 检查宗门是否有驻地
            if (!ass.宗门驻地) {
                console.log(`玩家 ${usr_qq} 的宗门没有驻地，跳过开采灵脉`);
                return false;
            }

            // 检查今日是否已开采
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
            
            const lastExploitTime = await redis.get(`xiuxian:player:${usr_qq}:getLastsign_Explor`);
            if (lastExploitTime) {
                const lastExploitDate = new Date(parseInt(lastExploitTime));
                const lastExploitStr = `${lastExploitDate.getFullYear()}-${lastExploitDate.getMonth()+1}-${lastExploitDate.getDate()}`;
                
                if (lastExploitStr === todayStr) {
                    console.log(`玩家 ${usr_qq} 今日已开采灵脉，跳过`);
                    return false;
                }
            }

            // 执行开采逻辑
            const 宗门灵石池上限 = [
                2000000, 5000000, 8000000, 11000000, 15000000, 20000000,
            ];
            
            // 获取洞天福地信息
            const dongTan = await data.bless_list.find(item => item.name == ass.宗门驻地) || 
                           await data.bless_list.find(item => item.name == '昆仑山');
            
            // 计算奖励
            let gift_lingshi = 0;
            if (ass.宗门神兽 == '麒麟') {
                gift_lingshi = (1200 * (dongTan.level + 1) * player.level_id) / 2;
            } else {
                gift_lingshi = (1200 * dongTan.level * player.level_id) / 2;
            }
            gift_lingshi *= 2;
            
            let xf = 1;
            if (ass.power == 1) {
                xf = 10;
            }
            
            let num = Math.trunc(gift_lingshi);
            if (ass.灵石池 + num > 宗门灵石池上限[ass.宗门等级 - 1] * xf) {
                ass.灵石池 = 宗门灵石池上限[ass.宗门等级 - 1] * xf;
            } else {
                ass.灵石池 += num;
            }
            
            // 发放奖励
            await Add_灵石(usr_qq, num);
            await data.setAssociation(ass.宗门名称, ass);
            
            // 记录开采时间
            await redis.set(`xiuxian:player:${usr_qq}:getLastsign_Explor`, now.getTime());
            
            // 记录开采消息
            const veinMsg = `自动开采灵脉成功：\n` +
                `本次开采灵脉获得${gift_lingshi * 2}灵石，上交一半给宗门，最后获得${num}灵石`;
            await redis.set(`xiuxian:player:${usr_qq}:vein_msg:${todayStr}`, veinMsg);

            console.log(`玩家 ${usr_qq} 自动开采灵脉完成`);
            return true;
        } catch (error) {
            console.error(`玩家 ${usr_qq} 自动开采灵脉失败:`, error);
            return false;
        }
    }

    /**
     * 自动神兽赐福
     */
    async autoBeastBonus(usr_qq, player) {
        try {
            // 检查玩家是否有宗门
            if (!player.宗门) {
                console.log(`玩家 ${usr_qq} 未加入宗门，跳过神兽赐福`);
                return false;
            }

            // 获取宗门信息
            const { data } = await import('../../api/api.js');
            const ass = data.getAssociation(player.宗门.宗门名称);
            
            // 检查宗门是否有神兽
            if (!ass.宗门神兽) {
                console.log(`玩家 ${usr_qq} 的宗门没有神兽，跳过神兽赐福`);
                return false;
            }

            // 检查今日是否已赐福
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
            
            const lastBonusTime = await redis.get(`xiuxian:player:${usr_qq}:getLastsign_Bonus`);
            if (lastBonusTime) {
                const lastBonusDate = new Date(parseInt(lastBonusTime));
                const lastBonusStr = `${lastBonusDate.getFullYear()}-${lastBonusDate.getMonth()+1}-${lastBonusDate.getDate()}`;
                
                if (lastBonusStr === todayStr) {
                    console.log(`玩家 ${usr_qq} 今日已接受神兽赐福，跳过`);
                    return false;
                }
            }

            // 执行赐福逻辑
            let random = Math.random();
            let flag = 0.5;
            
            // 根据好感度获取概率
            const { Read_danyao, Write_danyao } = await import('../../model/xiuxian.js');
            let dy = await Read_danyao(usr_qq);
            if (dy.beiyong2 > 0) {
                dy.beiyong2--;
            }
            random += dy.beiyong3;
            if (dy.beiyong2 == 0) {
                dy.beiyong3 = 0;
            }
            await Write_danyao(usr_qq, dy);
            
            if (random > 0.7) {
                let location;
                let item_name;
                let item_class;
                
                // 获得奖励
                let randomB = Math.random();
                if (ass.宗门神兽 == '麒麟') {
                    if (randomB > 0.9) {
                        location = Math.floor(Math.random() * data.qilin.length);
                        item_name = data.qilin[location].name;
                        item_class = data.qilin[location].class;
                    } else {
                        location = Math.floor(Math.random() * data.danyao_list.length);
                        item_name = data.danyao_list[location].name;
                        item_class = data.danyao_list[location].class;
                    }
                    await Add_najie_thing(usr_qq, item_name, item_class, 1);
                } else if (ass.宗门神兽 == '青龙') {
                    // 给功法，赐福加修为
                    if (randomB > 0.9) {
                        location = Math.floor(Math.random() * data.qinlong.length);
                        item_name = data.qinlong[location].name;
                        item_class = data.qinlong[location].class;
                    } else {
                        location = Math.floor(Math.random() * data.gongfa_list.length);
                        item_name = data.gongfa_list[location].name;
                        item_class = data.gongfa_list[location].class;
                    }
                    await Add_najie_thing(usr_qq, item_name, item_class, 1);
                } else if (ass.宗门神兽 == '玄武') {
                    // 给护具，赐福加气血
                    if (randomB > 0.9) {
                        location = Math.floor(Math.random() * data.xuanwu.length);
                        item_name = data.xuanwu[location].name;
                        item_class = data.xuanwu[location].class;
                    } else {
                        location = Math.floor(Math.random() * data.equipment_list.length);
                        item_name = data.equipment_list[location].name;
                        item_class = data.equipment_list[location].class;
                    }
                    await Add_najie_thing(usr_qq, item_name, item_class, 1);
                } else if (ass.宗门神兽 == '朱雀') {
                    // 给法宝，赐福加修
                    if (randomB > 0.9) {
                        location = Math.floor(Math.random() * data.xuanwu.length);
                        item_name = data.xuanwu[location].name;
                        item_class = data.xuanwu[location].class;
                    } else {
                        location = Math.floor(Math.random() * data.equipment_list.length);
                        item_name = data.equipment_list[location].name;
                        item_class = data.equipment_list[location].class;
                    }
                    await Add_najie_thing(usr_qq, item_name, item_class, 1);
                } else {
                    // 白虎给武器 赐福加气血
                    if (randomB > 0.9) {
                        location = Math.floor(Math.random() * data.xuanwu.length);
                        item_name = data.xuanwu[location].name;
                        item_class = data.xuanwu[location].class;
                    } else {
                        location = Math.floor(Math.random() * data.equipment_list.length);
                        item_name = data.equipment_list[location].name;
                        item_class = data.equipment_list[location].class;
                    }
                    await Add_najie_thing(usr_qq, item_name, item_class, 1);
                }
                
                // 记录赐福时间
                await redis.set(`xiuxian:player:${usr_qq}:getLastsign_Bonus`, now.getTime());
                
                // 记录赐福消息
                let beastMsg;
                if (randomB > 0.9) {
                    beastMsg = `自动神兽赐福成功：\n` +
                        `看见你来了,${ass.宗门神兽}很高兴，仔细挑选了${item_name}给你`;
                } else {
                    beastMsg = `自动神兽赐福成功：\n` +
                        `${ass.宗门神兽}今天心情不错，随手丢给了你${item_name}`;
                }
                await redis.set(`xiuxian:player:${usr_qq}:beast_msg:${todayStr}`, beastMsg);
                
                console.log(`玩家 ${usr_qq} 自动神兽赐福完成，获得${item_name}`);
                return true;
            } else {
                // 记录赐福时间（即使未获得奖励也要记录，防止重复尝试）
                await redis.set(`xiuxian:player:${usr_qq}:getLastsign_Bonus`, now.getTime());
                
                // 记录赐福消息
                const beastMsg = `自动神兽赐福：\n` +
                    `${ass.宗门神兽}闭上了眼睛，表示今天不想理你`;
                await redis.set(`xiuxian:player:${usr_qq}:beast_msg:${todayStr}`, beastMsg);
                
                console.log(`玩家 ${usr_qq} 自动神兽赐福未获得奖励`);
                return true;
            }
        } catch (error) {
            console.error(`玩家 ${usr_qq} 自动神兽赐福失败:`, error);
            return false;
        }
    }

    /**
     * 测试自动任务（仅管理员可用）
     */
    async testAutoTask(e) {
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
        const masterList = xiuxianConfig.Master || [];
        const userQQ = e.user_id.toString().replace('qg_', '');
        if (!e.isMaster && !masterList.includes(userQQ)) {
            return false;
        }

        // 广播消息到所有配置的群组
        await this.broadcastMessage('开始测试自动任务...');
        
        console.log('测试模式：开始执行自动任务');
        await this.executeAutoTask();
        console.log('测试模式：自动任务执行完成');
        
        await this.broadcastMessage('自动任务测试完成，请查看控制台日志');
        return true;
    }

    /**
     * 发送任务完成通知
     */
    async sendTaskNotification(successCount, taskStats) {
        try {
            if (successCount === 0) {
                return; // 没有成功处理的玩家，不发送通知
            }

            const message = `道法仙术自动任务完成！\n（部分玩家可能已关闭）\n为${successCount}位道法仙术玩家执行了自动任务：\n` +
                `  自动签到：${taskStats.sign}位\n` +
                `  领取势力俸禄：${taskStats.salary}位\n` +
                `  天道赐福：${taskStats.tiandao}位\n` +
                `  道法赐福：${taskStats.daofa}位\n` +
                `  开采灵脉：${taskStats.vein}位\n` +
                `  神兽赐福：${taskStats.beast}位\n` +
                `\n详细请发#查看领取记录`;

            await this.broadcastMessage(message);
        } catch (error) {
            console.error('发送任务通知失败:', error);
        }
    }

    /**
     * 广播消息到所有配置的群组
     */
    async broadcastMessage(msg) {
        try {
            const groups = this.set.Era.notifyGroups || [];
            for (const groupId of groups) {
                await Bot.sendGroupMsg(groupId, msg);
                console.log(`[自动任务广播] 群 ${groupId}: ${msg}`);
            }
        } catch (e) {
            console.error("广播消息失败:", e);
        }
    }

    /**
     * 重置全体签到记录（仅管理员可用）
     * 重置内容包括：修仙签到、天道赐福、领取势力俸禄、道法赐福
     */
    async resetAllSignRecords(e) {
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
        const masterList = xiuxianConfig.Master || [];
        const userQQ = e.user_id.toString().replace('qg_', '');
        if (!e.isMaster && !masterList.includes(userQQ)) {
            return false;
        }

        try {
            // 获取所有道法仙术玩家
            const daofaList = xiuxianData.getDaofaList();
            const playerQQs = Object.keys(daofaList);
            
            if (playerQQs.length === 0) {
                await this.broadcastMessage('当前无道法仙术玩家，无需重置签到记录');
                return true;
            }

            let resetCount = 0;
            let errorCount = 0;
            const resetDetails = {
                sign: 0,
                salary: 0,
                tiandao: 0,
                daofa: 0,
                vein: 0,
                beast: 0
            };

            // 遍历所有玩家，重置各种记录
            for (const qq of playerQQs) {
                try {
                    const usr_qq = await channel(qq.toString().replace('qg_', ''));
                    console.log(`正在重置玩家: ${qq} -> ${usr_qq}`);
                    
                    // 1. 重置修仙签到记录
                    await this.resetPlayerSignRecords(usr_qq);
                    resetDetails.sign++;
                    
                    // 2. 重置势力俸禄记录
                    await this.resetPlayerSalaryRecords(usr_qq);
                    resetDetails.salary++;
                    
                    // 3. 重置天道赐福记录
                    await this.resetPlayerTiandaoRecords(usr_qq);
                    resetDetails.tiandao++;
                    
                    // 4. 重置道法赐福记录
                    await this.resetPlayerDaofaRecords(usr_qq);
                    resetDetails.daofa++;
                    
                    // 5. 重置开采灵脉记录
                    await this.resetPlayerVeinRecords(usr_qq);
                    resetDetails.vein++;
                    
                    // 6. 重置神兽赐福记录
                    await this.resetPlayerBeastRecords(usr_qq);
                    resetDetails.beast++;
                    
                    resetCount++;
                    console.log(`已重置玩家 ${usr_qq} 的所有记录`);
                } catch (error) {
                    console.error(`重置玩家 ${qq} 记录时出错:`, error);
                    console.error(`错误详情:`, error.stack);
                    errorCount++;
                }
            }

            const message = `全体记录重置完成！\n成功重置: ${resetCount}人\n失败: ${errorCount}人\n\n重置详情:\n 修仙签到: ${resetDetails.sign}人\n 势力俸禄: ${resetDetails.salary}人\n 天道赐福: ${resetDetails.tiandao}人\n 道法赐福: ${resetDetails.daofa}人\n 开采灵脉: ${resetDetails.vein}人\n 神兽赐福: ${resetDetails.beast}人`;
            await this.broadcastMessage(message);
            console.log(`[重置记录] ${message}`);
            
            return true;
        } catch (error) {
            console.error('重置全体记录时发生严重错误:', error);
            await this.broadcastMessage('重置全体记录失败，请查看控制台日志');
            return false;
        }
    }

    /**
     * 重置单个玩家的修仙签到记录
     */
    async resetPlayerSignRecords(usr_qq) {
        try {
            // 删除签到时间记录
            await redis.del(`xiuxian:player:${usr_qq}:lastsign_time`);
            
            // 删除今日签到奖励记录
            const today = new Date().toISOString().split('T')[0];
            await redis.del(`xiuxian:player:${usr_qq}:sign_reward:${today}`);
            await redis.del(`xiuxian:player:${usr_qq}:sign_msg:${today}`);
            
            // 重置玩家连续签到天数
            const player = await Read_player(usr_qq);
            if (player && typeof player === 'object' && player.连续签到天数 !== undefined) {
                player.连续签到天数 = 0;
                await Write_player(usr_qq, player);
            }
        } catch (error) {
            console.error(`重置玩家 ${usr_qq} 签到记录失败:`, error);
            throw error;
        }
    }

    /**
     * 重置单个玩家的势力俸禄记录
     */
    async resetPlayerSalaryRecords(usr_qq) {
        try {
            // 删除瑶池俸禄记录
            await redis.del(`xiuxian:player:${usr_qq}:yaochi_salary_date`);
            
            // 删除摇光圣地俸禄记录
            await redis.del(`xiuxian:player:${usr_qq}:yaoguang_salary_date`);
            
            // 删除剑云海秘库记录
            await redis.del(`xiuxian:player:${usr_qq}:jianyunhai_open_day`);
            const today = new Date().toISOString().split('T')[0];
            await redis.del(`xiuxian:player:${usr_qq}:jianyunhai_msg:${today}`);
        } catch (error) {
            console.error(`重置玩家 ${usr_qq} 俸禄记录失败:`, error);
            throw error;
        }
    }

    /**
     * 重置单个玩家的天道赐福记录
     */
    async resetPlayerTiandaoRecords(usr_qq) {
        try {
            // 删除天道赐福时间记录
            await redis.del(`xiuxian:player:${usr_qq}:lastCifuTime`);
            
            // 删除天道赐福奖励记录（如果有）
            const today = new Date().toISOString().split('T')[0];
            await redis.del(`xiuxian:player:${usr_qq}:tiandao_cifu:${today}`);
            await redis.del(`xiuxian:player:${usr_qq}:tiandao_msg:${today}`);
        } catch (error) {
            console.error(`重置玩家 ${usr_qq} 天道赐福记录失败:`, error);
            throw error;
        }
    }

    /**
     * 重置单个玩家的道法赐福记录
     */
    async resetPlayerDaofaRecords(usr_qq) {
        try {
            // 删除道法赐福时间记录
            await redis.del(`xiuxian:player:${usr_qq}:lastsign_time3`);
            
            // 重置玩家道法赐福天数
            const player = await Read_player(usr_qq);
            if (player && typeof player === 'object' && player.道法赐福天数 !== undefined) {
                player.道法赐福天数 = 0;
                await Write_player(usr_qq, player);
            }
            
            // 删除道法赐福奖励记录（如果有）
            const today = new Date().toISOString().split('T')[0];
            await redis.del(`xiuxian:player:${usr_qq}:daofa_cifu:${today}`);
            await redis.del(`xiuxian:player:${usr_qq}:daofa_msg:${today}`);
        } catch (error) {
            console.error(`重置玩家 ${usr_qq} 道法赐福记录失败:`, error);
            throw error;
        }
    }

    /**
     * 重置单个玩家的开采灵脉记录
     */
    async resetPlayerVeinRecords(usr_qq) {
        try {
            // 删除开采灵脉时间记录
            await redis.del(`xiuxian:player:${usr_qq}:getLastsign_Explor`);
            
            // 删除开采灵脉奖励记录
            const today = new Date().toISOString().split('T')[0];
            await redis.del(`xiuxian:player:${usr_qq}:vein_msg:${today}`);
        } catch (error) {
            console.error(`重置玩家 ${usr_qq} 开采灵脉记录失败:`, error);
            throw error;
        }
    }

    /**
     * 重置单个玩家的神兽赐福记录
     */
    async resetPlayerBeastRecords(usr_qq) {
        try {
            // 删除神兽赐福时间记录
            await redis.del(`xiuxian:player:${usr_qq}:getLastsign_Bonus`);
            
            // 删除神兽赐福奖励记录
            const today = new Date().toISOString().split('T')[0];
            await redis.del(`xiuxian:player:${usr_qq}:beast_msg:${today}`);
        } catch (error) {
            console.error(`重置玩家 ${usr_qq} 神兽赐福记录失败:`, error);
            throw error;
        }
    }

    /**
     * 查看领取记录
     */
    async viewClaimRecords(e) {
        try {
            // 转换QQ号格式
            const usr_qq = await channel(e.user_id.toString().replace('qg_', ''));
            
            // 检查玩家是否存在
            if (!await existplayer(usr_qq)) {
                e.reply('您还未开始修仙，请先#开始修仙');
                return false;
            }

            // 读取玩家数据
            const player = await Read_player(usr_qq);
            
            // 检查是否为道法仙术玩家
            if (player.daofaxianshu !== 2) {
                e.reply('您还不是道法仙术玩家，无法查看领取记录');
                return false;
            }

            const now = new Date();
            const messages = [];
            
            // 获取最近三天的日期
            for (let i = 0; i < 3; i++) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                
                // 获取当天的所有消息记录
                const dayMessages = await this.getDayClaimMessages(usr_qq, dateStr);
                if (dayMessages.length > 0) {
                    messages.push(...dayMessages);
                }
            }

            if (messages.length === 0) {
                e.reply('最近三天暂无领取记录');
                return false;
            }

            // 构建消息内容
            let msg = `【${player.名号 || usr_qq}的领取记录】\n最近三天领取情况：\n\n`;
            
            // 直接显示所有消息
            messages.forEach(message => {
                msg += message + '\n\n';
            });

            // 使用ForwardMsg发送消息
            await ForwardMsg(e, msg);
            return true;

        } catch (error) {
            console.error('查看领取记录失败:', error);
            e.reply('查看领取记录失败，请稍后再试');
            return false;
        }
    }

    /**
     * 获取指定日期的领取消息
     */
    async getDayClaimMessages(usr_qq, dateStr) {
        const messages = [];
        
        try {
            // 1. 检查签到记录
            const lastSignTime = await redis.get(`xiuxian:player:${usr_qq}:lastsign_time`);
            if (lastSignTime) {
                const signDate = new Date(parseInt(lastSignTime));
                const signDateStr = `${signDate.getFullYear()}-${(signDate.getMonth() + 1).toString().padStart(2, '0')}-${signDate.getDate().toString().padStart(2, '0')}`;
                
                if (signDateStr === dateStr) {
                    // 获取签到消息
                    const signMsg = await redis.get(`xiuxian:player:${usr_qq}:sign_msg:${dateStr}`);
                    if (signMsg) {
                        messages.push(`${dateStr}\n${signMsg}`);
                    }
                }
            }

            // 2. 检查势力俸禄记录
            const salaryKeys = [
                `xiuxian:player:${usr_qq}:yaochi_salary_date`,
                `xiuxian:player:${usr_qq}:yaoguang_salary_date`
            ];
            
            for (const key of salaryKeys) {
                const lastClaimDate = await redis.get(key);
                if (lastClaimDate === dateStr) {
                    const shiliName = key.includes('yaochi') ? '瑶池' : '摇光圣地';
                    messages.push(`${dateStr}\n势力俸禄领取成功：\n您自动领取了${shiliName}俸禄`);
                    break; // 每天只能领取一次俸禄
                }
            }

            // 2.5. 检查剑云海秘库记录
            const lastJianyunhaiDay = await redis.get(`xiuxian:player:${usr_qq}:jianyunhai_open_day`);
            if (lastJianyunhaiDay) {
                // 剑云海使用的是日期数字，需要转换为完整日期进行比较
                const targetDate = new Date(dateStr);
                const targetDay = targetDate.getDate();
                
                if (parseInt(lastJianyunhaiDay) === targetDay) {
                    // 获取剑云海秘库消息
                    const jianyunhaiMsg = await redis.get(`xiuxian:player:${usr_qq}:jianyunhai_msg:${dateStr}`);
                    if (jianyunhaiMsg) {
                        messages.push(`${dateStr}\\n${jianyunhaiMsg}`);
                    } else {
                        // 如果没有详细消息，提供默认消息
                        messages.push(`${dateStr}\\n剑云海秘库开启成功：\\n您自动开启了剑云海秘库`);
                    }
                }
            }

            // 3. 检查天道赐福记录
            const lastTiandaoTime = await redis.get(`xiuxian:player:${usr_qq}:lastCifuTime`);
            if (lastTiandaoTime) {
                const cifuDate = new Date(parseInt(lastTiandaoTime));
                const cifuDateStr = `${cifuDate.getFullYear()}-${(cifuDate.getMonth() + 1).toString().padStart(2, '0')}-${cifuDate.getDate().toString().padStart(2, '0')}`;
                
                if (cifuDateStr === dateStr) {
                    // 获取天道赐福消息
                    const tiandaoMsg = await redis.get(`xiuxian:player:${usr_qq}:tiandao_msg:${dateStr}`);
                    if (tiandaoMsg) {
                        messages.push(`${dateStr}\n${tiandaoMsg}`);
                    }
                }
            }

            // 4. 检查道法赐福记录
            const lastDaofaTime = await redis.get(`xiuxian:player:${usr_qq}:lastsign_time3`);
            if (lastDaofaTime) {
                const daofaDate = new Date(parseInt(lastDaofaTime));
                const daofaDateStr = `${daofaDate.getFullYear()}-${(daofaDate.getMonth() + 1).toString().padStart(2, '0')}-${daofaDate.getDate().toString().padStart(2, '0')}`;
                
                if (daofaDateStr === dateStr) {
                    // 获取道法赐福消息
                    const daofaMsg = await redis.get(`xiuxian:player:${usr_qq}:daofa_msg:${dateStr}`);
                    if (daofaMsg) {
                        messages.push(`${dateStr}\n${daofaMsg}`);
                    }
                }
            }
            
            // 5. 检查开采灵脉记录
            const lastVeinTime = await redis.get(`xiuxian:player:${usr_qq}:getLastsign_Explor`);
            if (lastVeinTime) {
                const veinDate = new Date(parseInt(lastVeinTime));
                const veinDateStr = `${veinDate.getFullYear()}-${(veinDate.getMonth() + 1).toString().padStart(2, '0')}-${veinDate.getDate().toString().padStart(2, '0')}`;
                
                if (veinDateStr === dateStr) {
                    // 获取开采灵脉消息
                    const veinMsg = await redis.get(`xiuxian:player:${usr_qq}:vein_msg:${dateStr}`);
                    if (veinMsg) {
                        messages.push(`${dateStr}\n${veinMsg}`);
                    }
                }
            }
            
            // 6. 检查神兽赐福记录
            const lastBeastTime = await redis.get(`xiuxian:player:${usr_qq}:getLastsign_Bonus`);
            if (lastBeastTime) {
                const beastDate = new Date(parseInt(lastBeastTime));
                const beastDateStr = `${beastDate.getFullYear()}-${(beastDate.getMonth() + 1).toString().padStart(2, '0')}-${beastDate.getDate().toString().padStart(2, '0')}`;
                
                if (beastDateStr === dateStr) {
                    // 获取神兽赐福消息
                    const beastMsg = await redis.get(`xiuxian:player:${usr_qq}:beast_msg:${dateStr}`);
                    if (beastMsg) {
                        messages.push(`${dateStr}\n${beastMsg}`);
                    }
                }
            }

        } catch (error) {
            console.error(`获取${dateStr}领取消息失败:`, error);
        }

        return messages;
    }

    /**
     * 格式化数字显示
     */
    formatNumber(num) {
        if (num >= 100000000) {
            return (num / 100000000).toFixed(1) + '亿';
        } else if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        } else {
            return num.toString();
        }
    }

/**
 * 开启自动任务
 */
async enableAutoTask(e) {
    try {
        // 转换QQ号格式
        const usr_qq = await channel(e.user_id.toString().replace('qg_', ''));
        
        // 检查玩家是否存在
        if (!await existplayer(usr_qq)) {
            e.reply('您还未开始修仙，请先#开始修仙');
            return false;
        }

        // 读取玩家数据
        const player = await Read_player(usr_qq);
        
        // 检查是否为道法仙术玩家
        if (player.daofaxianshu !== 2) {
            e.reply('您还不是道法仙术玩家，无法使用此功能');
            return false;
        }

        // 检查是否过期
        const nowTime = new Date().getTime();
        if (!player.daofaxianshu_endtime || player.daofaxianshu_endtime <= nowTime) {
            e.reply('您的道法仙术已过期，无法使用此功能');
            return false;
        }

        // 设置自动任务开启状态
        await redis.set(`xiuxian:player:${usr_qq}:auto_task_enabled`, 'true');
        
        e.reply([
            '【自动任务设置】',
            '自动任务已开启',
            '系统将在每日00:05自动为您执行以下任务：',
            '• 自动签到',
            '• 自动领取势力俸禄', 
            '• 自动天道赐福',
            '• 自动道法赐福',
            '• 自动开采宗门灵脉',
            '• 自动神兽赐福',
            '',
            '您可以通过 #关闭自动任务 来关闭此功能',
            '通过 #自动任务状态 查看当前设置'
        ].join('\n'));
        
        console.log(`玩家 ${usr_qq} 已开启自动任务`);
        return true;
    } catch (error) {
        console.error('开启自动任务失败:', error);
        e.reply('开启自动任务失败，请稍后再试');
        return false;
    }
}

/**
 * 关闭自动任务
 */
async disableAutoTask(e) {
    try {
        // 转换QQ号格式
        const usr_qq = await channel(e.user_id.toString().replace('qg_', ''));
        
        // 检查玩家是否存在
        if (!await existplayer(usr_qq)) {
            e.reply('您还未开始修仙，请先#开始修仙');
            return false;
        }

        // 读取玩家数据
        const player = await Read_player(usr_qq);
        
        // 检查是否为道法仙术玩家
        if (player.daofaxianshu !== 2) {
            e.reply('您还不是道法仙术玩家，无法使用此功能');
            return false;
        }

        // 删除自动任务开启状态
        await redis.del(`xiuxian:player:${usr_qq}:auto_task_enabled`);
        
        e.reply([
            '【自动任务设置】',
            '自动任务已关闭',
            '系统将不再自动为您执行以下任务：',
            '• 自动签到',
            '• 自动领取势力俸禄',
            '• 自动天道赐福', 
            '• 自动道法赐福',
            '• 自动开采宗门灵脉',
            '• 自动神兽赐福',
            '',
            '您可以通过 #开启自动任务 来重新开启此功能',
            '通过 #自动任务状态 查看当前设置'
        ].join('\n'));
        
        console.log(`玩家 ${usr_qq} 已关闭自动任务`);
        return true;
    } catch (error) {
        console.error('关闭自动任务失败:', error);
        e.reply('关闭自动任务失败，请稍后再试');
        return false;
    }
}

    /**
     * 检查自动任务状态
     */
    async checkAutoTaskStatus(e) {
        try {
            // 转换QQ号格式
            const usr_qq = await channel(e.user_id.toString().replace('qg_', ''));
            
            // 检查玩家是否存在
            if (!await existplayer(usr_qq)) {
                e.reply('您还未开始修仙，请先#开始修仙');
                return false;
            }

            // 读取玩家数据
            const player = await Read_player(usr_qq);
            
            // 检查是否为道法仙术玩家
            if (player.daofaxianshu !== 2) {
                e.reply('您还不是道法仙术玩家，无法使用此功能');
                return false;
            }

            // 检查自动任务状态
            const isEnabled = await this.isAutoTaskEnabled(usr_qq);
            
            const statusText = isEnabled ? ' 已开启' : ' 已关闭';
            const statusDetail = isEnabled ? 
                '系统将在每日00:05自动为您执行任务' : 
                '系统不会自动为您执行任务，您需要手动执行签到';
            
            e.reply([
                '【自动签到状态】',
                `当前状态：${statusText}`,
                '',
                statusDetail,
                '',
                '操作说明：',
                '#开启自动任务 - 开启自动任务功能',
                '#关闭自动任务 - 关闭自动任务功能'
            ].join('\n'));
            
            return true;
        } catch (error) {
            console.error('检查自动任务状态失败:', error);
            e.reply('检查自动任务状态失败，请稍后再试');
            return false;
        }
    }

    /**
     * 检查玩家是否开启了自动签到
     */
    async isAutoSignEnabled(usr_qq) {
        try {
            const enabled = await redis.get(`xiuxian:player:${usr_qq}:auto_sign_enabled`);
            return enabled === 'true';
        } catch (error) {
            console.error(`检查玩家 ${usr_qq} 自动签到状态失败:`, error);
            return false; // 默认关闭
        }
    }
}