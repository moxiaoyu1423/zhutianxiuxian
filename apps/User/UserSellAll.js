import { plugin, verc, data,config} from '../../api/api.js';
import fs from 'fs';
import {
  Read_player,
  existplayer,
  exist_najie_thing,
  foundthing,
  re_najie_thing,
  Write_najie,
   Read_danyao,
   Write_danyao,
  sleep,
  synchronization,
  Synchronization_ASS,
  Add_灵石,
  Add_najie_thing,
  Add_修为,
   Add_饱食度,
  Add_寿元,
  Add_player_学习功法,
  Add_血气,
   Add_HP,
  __PATH,
  zd_battle,
  Read_equipment,
  instead_equipment,
  Read_najie,
  get_equipment_img,
  get_log_img,
  getMonsterByLocation,
  isNotNull,
  Write_player,
  channel
} from '../../model/xiuxian.js';
import { AppName } from '../../app.config.js';
import {
  dataall,
  readall,
  allwupin,
  alluser
} from '../../model/duanzaofu.js';
export class UserSellAll extends plugin {
  constructor() {
    super({
      name: 'UserSellAll',
      dsc: '修仙模块',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: '^#一键出售(.*)$',
          fnc: 'Sell_all_comodities',
        },
        {
          reg: '^#一键服用修为丹$',
          fnc: 'all_xiuweidan',
        },
        {
          reg: '^#一键服用血气丹$',
          fnc: 'all_xueqidan',
        },
                {
          reg: '^#一键服用天药$',
          fnc: 'all_yuanshen',
        },
        {
          reg: '^#一键学习$',
          fnc: 'all_learn',
        },
        {
          reg: '^#一键同步$',
          fnc: 'all_tongbu',
        },
        {
          reg: '^#(锁定|解锁).*$',
          fnc: 'locked',
        },
        {
          reg: '^#一键回收(.*)$',
          fnc: 'Sell_all_huishou',
        },
        {
          reg: '^#一键赠送(.*)$',
          fnc: 'all_give',
        },
        {
          reg: '^#一键锁定(.*)$',
          fnc: 'all_locked',
        },
        {
          reg: '^#一键解锁(.*)$',
          fnc: 'all_unlocked',
        },
        {
          reg: '^#一键装备$',
          fnc: 'all_zhuangbei',
        },
        {
          reg: '^#物品升级',
          fnc: 'upall',
        },
         {
           reg: '^#练气皮肤同步',
           fnc: 'ul',
         },
          {
                    reg: '^#一键服用神药$',
                    fnc: 'all_shenyao'
                },
                 {   reg: '^#一键卖矿石$',
                    fnc: 'sellMineral'
                },
                {   reg: '^#一键卖钞票$',
                    fnc: 'sellchaopiao'
                },
                 {   reg: '^#一键服用食材$',
                    fnc: 'all_food'
                },
                {   reg: '^#一键服用寿命丹$',
                    fnc: 'all_shouyuan'
                },
             {   reg: '^#一键回血$',
                    fnc: 'all_huixue'
                },
                          {
            reg:"^#秘境结算|副本结算$",
            fnc:'regression',
          },
                {
    reg: '^#一键消耗结算卡$',
    fnc: 'quickSettleDungeon'
}
      ],
    });

  }
async quickSettleDungeon(e) {
    if (!verc({ e })) return false;
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const processed_qq = await channel(usr_qq);
    
    // 检查玩家是否存在
    if (!await existplayer(processed_qq)) {
        e.reply("当前位面无存档");
        return false;
    }
    
    // 检查玩家是否有进行中的探索
    let action = await redis.get('xiuxian:player:' + processed_qq + ':action');
    if (!action) {
        e.reply("没有进行中的副本探索");
        return false;
    }
    
    action = JSON.parse(action);
    const now_time = new Date().getTime();
    
    // 检查是否在探索状态
    const inAction = action.Place_action === '0' || action.Place_actionplus === '0';
    if (!inAction) {
        e.reply("当前不在副本探索中，无法结算");
        return false;
    }
    
    // 确定结束时间
    let end_time;
    if (action.end_time) {
        // 普通副本（禁地历练）结构
        end_time = action.end_time;
    } else if (action.Place_actionplus === '0' && action.start_time && action.total_time) {
        // 沉迷副本（秘境历练）结构
        end_time = action.start_time + action.total_time * 60 * 1000;
    } else {
        console.error("无法确定结束时间:", action);
        e.reply("探索状态异常，无法结算");
        return false;
    }
    
    // 确保结束时间是有效数字
    if (isNaN(end_time)) {
        console.error("无效的结束时间:", end_time);
        e.reply("探索状态异常，无法结算");
        return false;
    }
    
    // 检查探索是否已结束
    if (now_time >= end_time) {
        e.reply("副本探索已结束，无需结算");
        return false;
    }
    
    // 计算剩余时间（毫秒）
    const remainingTime = end_time - now_time;
    
    // 确保剩余时间是有效数字
    if (isNaN(remainingTime) || remainingTime <= 0) {
        console.error("无效的剩余时间:", remainingTime);
        e.reply("探索状态异常，无法结算");
        return false;
    }
    
    // 定义结算卡映射表（按价值从低到高排序）
    const settlementCards = [
        {name: "凡品秘境结算卡", value: 30000},       // 0.5分钟
        {name: "玄品秘境结算卡", value: 60000},       // 1分钟
        {name: "灵品秘境结算卡", value: 180000},      // 3分钟
        {name: "仙品秘境结算卡", value: 300000},      // 5分钟
        {name: "圣品秘境结算卡", value: 600000},      // 10分钟
        {name: "帝品秘境结算卡", value: 1800000}      // 30分钟
    ];
    
    let totalReduce = 0;
    let usedCards = {};
    let remaining = remainingTime;
    
    // 智能使用结算卡 - 优先使用低价值卡片
    for (const card of settlementCards) {
        if (remaining <= 0) break; // 剩余时间为0，停止使用卡片
        
        try {
            // 获取该卡片在背包中的数量
            const cardCount = await exist_najie_thing(processed_qq, card.name, "道具");
            
            // 确保卡片数量是有效数字
            const validCardCount = safeNumber(cardCount);
            if (validCardCount <= 0) continue;
            
            // 确保卡片价值是有效数字
            if (isNaN(card.value) || card.value <= 0) {
                console.error(`无效的卡片价值: ${card.name} = ${card.value}`);
                continue;
            }
            
            // 计算需要使用的卡片数量
            const cardsNeeded = Math.min(
                validCardCount, // 背包中有的数量
                Math.floor(remaining / card.value) // 需要覆盖剩余时间的数量
            );
            
            // 如果没有需要使用的卡片，跳过
            if (cardsNeeded <= 0) continue;
            
            // 计算实际减少的时间
            const cardReduce = Math.min(remaining, cardsNeeded * card.value);
            
            // 更新剩余时间
            remaining -= cardReduce;
            totalReduce += cardReduce;
            
            // 记录使用的卡片
            usedCards[card.name] = cardsNeeded;
            
            // 消耗卡片
            await Add_najie_thing(processed_qq, card.name, "道具", -cardsNeeded);
        } catch (err) {
            console.error(`处理卡片 ${card.name} 时出错:`, err);
        }
    }
    
    // 如果没有使用任何结算卡
    if (totalReduce === 0) {
        e.reply("背包中没有可用的秘境结算卡");
        return false;
    }
    
    // 确保减少的时间是有效数字
    if (isNaN(totalReduce) || totalReduce <= 0) {
        console.error("无效的减少时间:", totalReduce);
        e.reply("结算失败，请重试");
        return false;
    }
    
    // 根据副本类型处理时间减少
    if (action.Place_actionplus === '0') {
        // 沉迷副本：减少总时间（分钟）
        const reduceMinutes = totalReduce / (60 * 1000);
        action.total_time -= reduceMinutes;
        
        // 重新计算结束时间
        end_time = action.start_time + action.total_time * 60 * 1000;
        
        // 重新计算下一次结算时间
        if (action.next_settle_time) {
            // 确保结算间隔不低于1分钟
            const minInterval = 60 * 1000; // 1分钟
            const calculatedInterval = action.total_time * 60 * 1000 / action.total_count;
            const interval = Math.max(minInterval, calculatedInterval);
            
            action.interval = interval;
            action.next_settle_time = now_time + interval;
        }
        
        // 添加惩罚计数器，用于统计结算时的惩罚次数
        action.penalty_count = 0;
    } else {
        // 普通副本：直接减少结束时间
        action.end_time -= totalReduce;
        end_time = action.end_time;
    }
    
    // 更新Redis
    await redis.set('xiuxian:player:' + processed_qq + ':action', JSON.stringify(action));
    
    // 计算减少的时间（分钟）
    const reduceMinutes = (totalReduce / 60000).toFixed(1);
    
    // 构建回复消息
    let msg = "【秘境结算·仙力催动】\n";
    msg += "你祭出秘境结算卡，引发时空波动，加速副本探索！\n\n";
    
    // 列出使用的卡片
    if (Object.keys(usedCards).length > 0) {
        msg += " 使用结算卡：\n";
        for (const [cardName, quantity] of Object.entries(usedCards)) {
            // 确保数量是有效数字
            const validQuantity = safeNumber(quantity);
            if (validQuantity > 0) {
                msg += `▸ ${cardName} x${validQuantity}\n`;
            }
        }
    }
    
    // 添加时间减少信息
    msg += `\n 时间加速：${reduceMinutes}分钟`;
    
    // 添加剩余时间
    const newRemaining = end_time - now_time;
    const formattedTime = formatTime(newRemaining);
    
    msg += `\n\n 剩余探索时间：${formattedTime}`;
    
    // 仙侠风格提示
    if (totalReduce >= remainingTime) {
        msg += `\n\n 仙力浩荡！副本探索已完成！`;
    } else if (totalReduce / remainingTime > 0.7) {
        msg += `\n\n 仙力澎湃！副本探索进程已大幅推进！`;
    } else if (totalReduce / remainingTime > 0.3) {
        msg += `\n\n 仙力流转！副本探索进程稳步推进！`;
    } else {
        msg += `\n\n 时空涟漪荡漾，秘境探索加速进行`;
    }
    
    // 如果完全结算完成，显示惩罚次数并清除计数器
    if (totalReduce >= remainingTime && action.penalty_count !== undefined) {
        const penaltyCount = action.penalty_count;
        delete action.penalty_count;
        await redis.set('xiuxian:player:' + processed_qq + ':action', JSON.stringify(action));
        
        // 如果有惩罚次数，添加到消息中
        if (penaltyCount > 0) {
            msg += `

 ⚠️ 结算期间触发古地府惩罚 ${penaltyCount} 次`;
        }
    }
    
    e.reply(msg);
    return true;
}








  async all_food(e) {
    if (!verc({ e })) return false;
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const processed_qq = await channel(usr_qq);
    
    // 检查玩家是否存在
    if (!await existplayer(processed_qq)) {
        e.reply("当前位面无存档");
        return false;
    }
    
    // 获取玩家纳戒数据
    const najie = await data.getData('najie', processed_qq);
    
    // 定义食材饱食度映射表
    const foodSatietyMap = {
        "生肉": 2,
        "熟肉": 4,
        "鱼肉": 2,
        "烤鱼": 4,
        "苹果": 2,
        "西瓜": 1,
        "土豆": 1,
        "烤土豆": 3,
        "胡萝卜": 2,
        "面包": 3,
        "紫颂果": 150,
        "灵橘": 10,
        "仙馐果": 10
    };
    
    // 特殊食材处理（如腐肉）
    const specialFoodMap = {
        "腐肉": {
            satiety: 2,
            effect: async (quantity, player) => {
                await Add_HP(processed_qq, -500000 * quantity);
                return `，但腐肉有毒，血量减少${500000 * quantity}点`;
            }
        }
    };
    
    let totalSatiety = 0;
    let consumedItems = [];
    let specialEffects = [];
    
    // 遍历纳戒中的食材
    for (const item of najie.食材) {
        const foodName = item.name;
        
        // 检查是否是有效食材
        if (foodSatietyMap[foodName] || specialFoodMap[foodName]) {
            // 获取食材数量
            const quantity = await exist_najie_thing(processed_qq, foodName, "食材");
            
            if (quantity > 0) {
                // 计算饱食度增加值
                let satietyValue = 0;
                
                if (foodSatietyMap[foodName]) {
                    satietyValue = foodSatietyMap[foodName] * quantity;
                } else if (specialFoodMap[foodName]) {
                    satietyValue = specialFoodMap[foodName].satiety * quantity;
                }
                
                totalSatiety += satietyValue;
                
                // 处理特殊效果
                if (specialFoodMap[foodName]) {
                    const player = await Read_player(processed_qq);
                    const effectMsg = await specialFoodMap[foodName].effect(quantity, player);
                    specialEffects.push(`- ${foodName} x${quantity}${effectMsg}`);
                } else {
                    consumedItems.push(`- ${foodName} x${quantity}`);
                }
                
                // 消耗食材
                await Add_najie_thing(processed_qq, foodName, "食材", -quantity);
            }
        }
    }
    
    // 如果没有消耗任何食材
    if (totalSatiety === 0) {
        e.reply("纳戒中没有可服用的食材");
        return false;
    }
    
    // 增加饱食度
    await Add_饱食度(processed_qq, totalSatiety);
    
    // 构建回复消息
    let msg = "【一键服用食材】\n";
    msg += " 你大快朵颐，服用了以下食材：\n";
    
    if (consumedItems.length > 0) {
        msg += consumedItems.join("\n") + "\n";
    }
    
    if (specialEffects.length > 0) {
        msg += specialEffects.join("\n") + "\n";
    }
    
    msg += `\n 饱食度增加：${totalSatiety}点`;
    
    e.reply(msg);
    return true;
}
  //#(装备|服用|使用)物品*数量
  async all_xueqidan(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    //检索方法
    let najie = await data.getData('najie', usr_qq);
    let xueqi = 0;
     if (player.mijinglevel_id>19 && player.xiangulevel_id > 19) {
        e.reply(`「自荒古岁月至今...」
「本座早已不需要这等外物了」`);
        return false;
      }
    for (var l of najie.丹药) {
      if (l.type == '血气') {
        //纳戒中的数量
        let quantity = await exist_najie_thing(usr_qq, l.name, l.class);
        await Add_najie_thing(usr_qq, l.name, l.class, -quantity);
        xueqi = xueqi + l.xueqi * quantity;
      }
    }
    await Add_血气(usr_qq, xueqi);
    e.reply(`服用成功,血气增加${xueqi}`);
    return false;
  }

  async all_shouyuan(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    
    //检索方法
    let najie = await data.getData('najie', usr_qq);
    let totalShouyuan = 0;
    let consumedItems = [];
    
    // 遍历所有寿命类丹药
    for (var l of najie.丹药) {
      if (l.type == '寿命') {
        //纳戒中的数量
        let quantity = await exist_najie_thing(usr_qq, l.name, l.class);
        if (quantity > 0) {
          await Add_najie_thing(usr_qq, l.name, l.class, -quantity);
          let addedShouyuan = (l.shouyuan || 0) * quantity;
          totalShouyuan += addedShouyuan;
          consumedItems.push(`${l.name}×${quantity} (增加${addedShouyuan}年)`);
        }
      }
    }
    
    if (totalShouyuan === 0) {
      e.reply("纳戒中没有可服用的寿命丹");
      return false;
    }
    
    // 增加寿元
    await Add_寿元(usr_qq, totalShouyuan);
    
    // 构建回复消息
    let msg = "【一键服用寿命丹】";
    msg += " 你服用了以下寿命丹：";
    msg += consumedItems.join("\n") + "\n";
    msg += `寿元总共增加：${totalShouyuan}年`;
    
    e.reply(msg);
    return false;
  }
   async all_huixue(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id.toString().replace('qg_', '');
    if (!await existplayer(usr_qq)) return;
    
    const player = await Read_player(usr_qq);
    const needHP = player.血量上限 - player.当前血量;
    
    if (needHP <= 0) {
        e.reply(`当前气血充盈，无需回血`);
        return false;
    }
    
    const najie = await data.getData("najie", usr_qq);
    let bestPill = null;
    let bestEfficiency = 0; // 效率=单颗回复量/丹药价值
    
    // 遍历所有回血丹药，选择性价比最高的
    for (const pill of najie.丹药) {
        if (pill.type === '血量') {
            // 计算单颗实际回复量（与单独服用逻辑一致）
            const singleRecover = Math.min(
                player.血量上限 * (pill.HPp || 0) + (pill.HP || 0),
                player.血量上限 - player.当前血量
            );
            
            // 计算效率（回复量/价值）
            const efficiency = singleRecover / (pill.出售价 || 1);
            
            if (efficiency > bestEfficiency) {
                bestEfficiency = efficiency;
                bestPill = pill;
            }
        }
    }
    
    if (!bestPill) {
        e.reply(`纳戒中无回血丹药`);
        return false;
    }
    
    // 计算单颗实际回复量
    const singleRecover = Math.min(
        player.血量上限 * (bestPill.HPp || 0) + (bestPill.HP || 0),
        player.血量上限 - player.当前血量
    );
    
    // 计算需要数量
    let quantity = Math.ceil(needHP / singleRecover);
    const available = await exist_najie_thing(usr_qq, bestPill.name, bestPill.class);
    
    if (quantity > available) {
        quantity = available;
    }
    
    // 实际回复量（不超过需要量）
    const recoverHP = Math.min(quantity * singleRecover, needHP);
    
    // 更新数据
    await Add_najie_thing(usr_qq, bestPill.name, bestPill.class, -quantity);
    await Add_HP(usr_qq, recoverHP);
    
    // 获取更新后的玩家数据
    const updatedPlayer = await Read_player(usr_qq);
    const hpPercent = (updatedPlayer.当前血量 / updatedPlayer.血量上限 * 100).toFixed(1);
    
    e.reply([
        `【丹药回元·气血归真】`,
        `服用 ${bestPill.name} ×${quantity}`,
        `气血回复：+${recoverHP.toLocaleString()}`,
        `当前气血：${updatedPlayer.当前血量.toLocaleString()}/${updatedPlayer.血量上限.toLocaleString()} (${hpPercent}%)`,
    ].join("\n"));
    
    return false;
}
        
async all_shenyao(e) {
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return;
    
    let player = await Read_player(usr_qq);
    let najie = await data.getData("najie", usr_qq);
    
    let xiuwei = 0;
    let xueqi = 0;
    let shouyuanAdd = 0;             
    let actualShouyuanAdd = 0;       
    let suppressedShouyuanAdd = 0;   
    
    // 新增道伤修复相关变量
    let daoshangMsg = "";         // 道伤修复消息
    let usedXiuwei = 0;           // 用于修复道伤的修为
    let usedXueqi = 0;            // 用于修复道伤的血气
    let repairAmount = 0;         // 本次修复的道伤量
    
    // 临时存储需要消耗的神药
    let consumeList = [];
    
    // 高境界检查
    if (player.mijinglevel_id > 19 || player.xiangulevel_id > 19) {
        e.reply(`「自荒古岁月至今...」
「本座早已不需要这等外物了」`);
        return false;
    }
    
    // 遍历所有神药并计算效果
    for (let l of najie.丹药) {
        if (l.type === '神药') {
            let quantity = await exist_najie_thing(usr_qq, l.name, l.class);
            if (quantity <= 0) continue;
            
            // 添加消耗项
            consumeList.push({name: l.name, class: l.class, quantity});
            
            // 计算修为和血气
            xiuwei += l.exp * quantity;
            xueqi += l.xueqi * quantity;
            
            // 计算理论寿元增加
            shouyuanAdd += l.exp / 10000 * quantity;
        }
    }
    
    // ==== 道伤修复逻辑 ====
    if (player.道伤 && player.道伤 > 0) {
        // 计算修复道伤所需的总资源
        const levelSum = player.mijinglevel_id * player.xiangulevel_id;
        const requiredPerLevel = 950000000; // 每级需要1500万修为/血气
        const totalRequired = levelSum * requiredPerLevel;
        
        // 初始化道伤修复度（如果不存在）
        if (!player.道伤修复度) {
            player.道伤修复度 = 0;
        }
        
        // 计算还需要多少资源来完全修复道伤
        const remainingRequired = totalRequired - player.道伤修复度;
        
        if (remainingRequired > 0) {
            // 计算本次可以用于修复的资源
            const availableXiuwei = Math.min(xiuwei, remainingRequired);
            const availableXueqi = Math.min(xueqi, remainingRequired);
            
            // 实际使用的资源（取两者中较小的，确保平衡使用）
            usedXiuwei = Math.min(availableXiuwei, availableXueqi);
            usedXueqi = usedXiuwei;
            
            // 更新道伤修复度
            player.道伤修复度 += usedXiuwei + usedXueqi;
            repairAmount = usedXiuwei + usedXueqi;
            
            // 检查是否完全修复
            if (player.道伤修复度 >= totalRequired) {
                player.道伤 = 0; // 清除道伤
                delete player.道伤修复度; // 删除修复度属性
                daoshangMsg = `\n道伤已完全修复！`;
            } else {
                const repairPercent = Math.floor((player.道伤修复度 / totalRequired) * 100);
                daoshangMsg = `\n道伤修复进度: ${repairPercent}% (${player.道伤修复度.toLocaleString()}/${totalRequired.toLocaleString()})`;
            }
        }
    }
    // ==== 道伤修复结束 ====
    
    // 处理寿元增加逻辑
    let suppressMsg = "";
    if (shouyuanAdd > 0) {
        if (player.压制寿元) {
            // 压制状态下：
            const currentShouyuan = player.寿元 || 0;
            const availableCapacity = 9999 - currentShouyuan;
            
            if (shouyuanAdd > availableCapacity) {
                actualShouyuanAdd = availableCapacity;
            } else {
                actualShouyuanAdd = shouyuanAdd;
            }
            
            suppressedShouyuanAdd = shouyuanAdd;
            player.寿元 = Math.min(9999, currentShouyuan + actualShouyuanAdd);
            
            if (actualShouyuanAdd < shouyuanAdd) {
                suppressMsg = `\n【寿元压制】处于绝灵时代，寿命上限9999年。本次增加${actualShouyuanAdd}年（理论${shouyuanAdd}年）`;
            } else {
                suppressMsg = `\n【寿元压制】处于绝灵时代，寿命上限9999年。本次增加${shouyuanAdd}年`;
            }
        } else {
            if (player.寿元 >= 20000000) {
                actualShouyuanAdd = 0;
                suppressMsg = `\n你的寿元已足够漫长，神药的延寿效果已经对你不起作用`;
            } else {
                actualShouyuanAdd = shouyuanAdd;
                player.寿元 += shouyuanAdd;
            }
        }
    }
    
    // 应用增加效果
    let msg = "服用神药效果:\n";
    
    // 增加修为（扣除用于修复道伤的部分）
    const remainingXiuwei = xiuwei - usedXiuwei;
    if (remainingXiuwei > 0) {
        player.修为 += remainingXiuwei;
        msg += `修为增加: ${remainingXiuwei.toLocaleString()}\n`;
    }
    
    // 增加血气（扣除用于修复道伤的部分）
    const remainingXueqi = xueqi - usedXueqi;
    if (remainingXueqi > 0) {
        player.血气 += remainingXueqi;
        msg += `血气增加: ${remainingXueqi.toLocaleString()}\n`;
    }
    
    // 增加寿元
    if (actualShouyuanAdd > 0) {
        msg += `寿元增加: ${actualShouyuanAdd}年\n`;
    }
    
    // 添加道伤修复信息
    if (daoshangMsg) {
        msg += daoshangMsg;
        if (repairAmount > 0) {
            msg += `\n消耗修为修复道伤: ${usedXiuwei.toLocaleString()}`;
            msg += `\n消耗血气修复道伤: ${usedXueqi.toLocaleString()}`;
        }
    }
    
    // 保存玩家数据
    await Write_player(usr_qq, player);
    
    // 处理没有效果的情况
    if (remainingXiuwei === 0 && remainingXueqi === 0 && actualShouyuanAdd === 0 && !daoshangMsg) {
        e.reply("没有可服用的神药或药效无法生效");
        return;
    }
    
    // 消耗神药
    for (let item of consumeList) {
        await Add_najie_thing(usr_qq, item.name, item.class, -item.quantity);
    }
    
    // 添加压制提示
    if (suppressMsg) {
        msg += suppressMsg;
    }
    
    e.reply(msg);
    return;
}
   async sellchaopiao(e) {
        if (!verc({ e })) return false;
         let usr_qq = e.user_id.toString().replace('qg_', '');
        // 有无存档
        let ifexistplay = await existplayer(usr_qq);
        if (!ifexistplay) return false;
    
        // 获取纳戒中的数据
        let najie = await data.getData('najie', usr_qq);
        let minerals = ['1k', '5k', '1w', '2w', '10w']; // 指定的矿石名称
        let commodities_price = 0;
    
        // 遍历纳戒中的道具类别
        for (let l of najie['道具']) {
            if (l && l.islockd == 0 && minerals.includes(l.name)) { // 检查是否是指定的矿石名称
                let quantity = l.数量;
                commodities_price += l.出售价 * quantity; // 计算总价
                await Add_najie_thing(usr_qq, l.name, l.class, -quantity, l.pinji); // 从纳戒中减去矿石
            }
        }
    
        // 增加灵石
        if (commodities_price > 0) {
            await Add_灵石(usr_qq, commodities_price);
            e.reply(`一键卖钞票成功！共获得${commodities_price}灵石`);
        } else {
            e.reply('纳戒中没有钞票可以出售');
        }
    }
    
    async sellMineral(e) {
        if (!verc({ e })) return false;
        let usr_qq = e.user_id.toString().replace('qg_', '');
        // 有无存档
        let ifexistplay = await existplayer(usr_qq);
        if (!ifexistplay) return false;
    
        // 获取纳戒中的数据
        let najie = await data.getData('najie', usr_qq);
        let minerals = ['矿渣', '碎矿', '小矿', '金矿', '仙晶矿', '灵矿']; // 指定的矿石名称
        let commodities_price = 0;
    
        // 遍历纳戒中的道具类别
        for (let l of najie['道具']) {
            if (l && l.islockd == 0 && minerals.includes(l.name)) { // 检查是否是指定的矿石名称
                let quantity = l.数量;
                commodities_price += l.出售价 * quantity; // 计算总价
                await Add_najie_thing(usr_qq, l.name, l.class, -quantity, l.pinji); // 从纳戒中减去矿石
            }
        }
    
        // 增加灵石
        if (commodities_price > 0) {
            await Add_灵石(usr_qq, commodities_price);
            e.reply(`一键卖矿石成功！共获得${commodities_price}灵石`);
        } else {
            e.reply('纳戒中没有矿石可以出售');
        }
    }
  async ul(e){
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) return false;
    let player=await alluser()
    for(let i=0;i<player.length;i++){
      let player2=await Read_player(player[i])
        player2.练气皮肤=0
        player2.头像框皮肤=0
        player2.纳杰皮肤=undefined
        player2.纳戒皮肤=0
        await Write_player(player[i],player2)
    }
  }
  // async upall(e) {
  //   let thing =await allwupin()

  //   for(let item of thing){
  //    let A= await readall(item)
  //     for(let all of A){
  //       all.稀有度=0;
  //     }
  //    await dataall(A,item)
  //   }
  //   return;
  // }
 async all_zhuangbei(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    
    // 获取玩家数据
    let najie = await data.getData('najie', usr_qq);
    let player = await Read_player(usr_qq);
    
    // ==== 新增：检查是否满足终古剑之主装备条件 ====
    const hasEternalSwordDao = player.学习的功法.includes("永恒终极剑道");
    const isJianyunhaiChuanren = player.势力职位 === "传人";
    // ==== 新增结束 ====
    
    let sanwei = [];
    sanwei[0] =
      data.Level_list.find(item => item.level_id == player.level_id).基础攻击 +
      player.攻击加成 +
      data.LevelMax_list.find(item => item.level_id == player.Physique_id)
        .基础攻击;
    sanwei[1] =
      data.Level_list.find(item => item.level_id == player.level_id).基础防御 +
      player.防御加成 +
      data.LevelMax_list.find(item => item.level_id == player.Physique_id)
        .基础防御;
    sanwei[2] =
      data.Level_list.find(item => item.level_id == player.level_id).基础血量 +
      player.生命加成 +
      data.LevelMax_list.find(item => item.level_id == player.Physique_id)
        .基础血量;
    
    let equipment = await data.getData('equipment', usr_qq);
    
    // 智能选择装备
    let type = ['武器', '护具', '法宝'];
    for (let j of type) {
      let max;
      let max_equ;
      if (
        equipment[j].atk < 10 &&
        equipment[j].def < 10 &&
        equipment[j].HP < 10
      )
        max =
          equipment[j].atk * sanwei[0] * 0.43 +
          equipment[j].def * sanwei[1] * 0.16 +
          equipment[j].HP * sanwei[2] * 0.41;
      else
        max =
          equipment[j].atk * 0.43 +
          equipment[j].def * 0.16 +
          equipment[j].HP * 0.41;
      
      for (let i of najie['装备']) {
        // ==== 新增：终古剑之主特殊检查 ====
        if (i.name === "终古剑之主") {
            // 检查是否满足装备条件
            if (!hasEternalSwordDao || !isJianyunhaiChuanren) {
                // 不满足条件，跳过该装备
                continue;
            }
        }
        // ==== 新增结束 ====
        
        // 先判断装备存不存在
        let thing_exist = await foundthing(i.name);
        if (!thing_exist) {
          continue;
        }
        
        if (i.type == j) {
          let temp;
          // 再判断装备数值类型
          if (i.atk < 10 && i.def < 10 && i.HP < 10)
            temp =
              i.atk * sanwei[0] * 0.43 +
              i.def * sanwei[1] * 0.16 +
              i.HP * sanwei[2] * 0.41;
          else temp = i.atk * 0.43 + i.def * 0.16 + i.HP * 0.41;
          
          // 选出最佳装备
          if (max < temp) {
            max = temp;
            max_equ = i;
          }
        }
      }
      
      if (max_equ) await instead_equipment(usr_qq, max_equ);
    }
    
    // ==== 新增：如果终古剑之主被跳过，添加提示 ====
    if (!hasEternalSwordDao || !isJianyunhaiChuanren) {
        const hasZhongguJian = najie['装备'].some(i => i.name === "终古剑之主");
        
        if (hasZhongguJian) {
            let message = [
                `【终古剑之主·剑器通灵】`,
                `剑匣剧烈震颤，一道恐怖剑意冲天而起！`,
                `终古剑之主发出震天剑鸣：`,
                `"非永恒终极剑道修炼者，不配执掌吾身！"`
            ];
            
            if (!hasEternalSwordDao) {
                message.push(`你尚未领悟永恒终极剑道真谛`);
                message.push(`此剑乃剑魔帝主王旭的证道之器，蕴含无上剑道法则`);
                message.push(`唯有参透永恒终极剑道者方可驾驭`);
            }
            
            if (!isJianyunhaiChuanren) {
                message.push(`你非剑云海传人`);
                message.push(`此剑只认剑云海一脉传人为主`);
                message.push(`若无传人身份，纵是仙帝亦难降服`);
            }
            
            message.push(`终古剑之主化作一道剑光，重回剑匣`);
            message.push(`剑匣上浮现古老铭文：`);
            message.push(`"永恒剑道，传人方证"`);
            
            // 在装备图片前添加提示
            const img = await get_equipment_img(e);
            e.reply([message.join("\n"), img].join("\n\n"));
            return false;
        }
    }
    // ==== 新增结束 ====
    
    let img = await get_equipment_img(e);
    e.reply(img);
    return false;
}

  async all_locked(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let najie = await data.getData('najie', usr_qq);
    let wupin = [
      '装备',
      '丹药',
      '道具',
      '功法',
      '草药',
      '食材',
      '材料',
      '仙宠',
      '仙宠口粮',
    ];
    let wupin1 = [];
    if (e.msg != '#一键锁定') {
      let thing = e.msg.replace('#一键锁定', '');
      for (var i of wupin) {
        if (thing == i) {
          wupin1.push(i);
          thing = thing.replace(i, '');
        }
      }
      if (thing.length == 0) {
        wupin = wupin1;
      } else {
        return false;
      }
    }
    for (var i of wupin) {
      for (let l of najie[i]) {
        //纳戒中的数量
        l.islockd = 1;
      }
    }
    await Write_najie(usr_qq, najie);
    e.reply(`一键锁定完成`);
    return false;
  }

  async all_unlocked(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let najie = await data.getData('najie', usr_qq);
    let wupin = [
      '装备',
      '丹药',
      '道具',
      '功法',
      '食材',
      '草药',
      '材料',
      '仙宠',
      '仙宠口粮',
    ];
    let wupin1 = [];
    if (e.msg != '#一键解锁') {
      let thing = e.msg.replace('#一键解锁', '');
      for (var i of wupin) {
        if (thing == i) {
          wupin1.push(i);
          thing = thing.replace(i, '');
        }
      }
      if (thing.length == 0) {
        wupin = wupin1;
      } else {
        return false;
      }
    }
    for (var i of wupin) {
      for (let l of najie[i]) {
        //纳戒中的数量
        l.islockd = 0;
      }
    }
    await Write_najie(usr_qq, najie);
    e.reply(`一键解锁完成`);
    return false;
  }

  async all_give(e) {
    if (!verc({ e })) return false;
    //这是自己的
    let A_qq = e.user_id.toString().replace('qg_','');
    A_qq=await channel(A_qq)
    //自己没存档
    let ifexistplay = await existplayer(A_qq);
    if (!ifexistplay) return false;
    //对方
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) return false;
    let atItem = e.message.filter(item => item.type === 'at'); //获取at信息
    let B_qq = atItem[0].qq//对方qq
    B_qq = B_qq.toString().replace('qg_', '');
    B_qq=await channel(B_qq)
    //对方没存档
    ifexistplay = await existplayer(B_qq);
    if (!ifexistplay) {
      e.reply(`此人尚未踏入仙途`);
      return false;
    }
    let A_najie = await data.getData('najie', A_qq);
    let wupin = [
      '装备',
      '丹药',
      '道具',
      '功法',
      '盒子',
      '草药',
      '食材',
      '材料',
      '仙宠',
      '仙宠口粮',
    ];
    let wupin1 = [];
    if (e.msg != '#一键赠送') {
      let thing = e.msg.replace('#一键赠送', '');
      for (var i of wupin) {
        if (thing == i) {
          wupin1.push(i);
          thing = thing.replace(i, '');
        }
      }
      if (thing.length == 0) {
        wupin = wupin1;
      } else {
        return false;
      }
    }
    for (var i of wupin) {
      for (let l of A_najie[i]) {
        if (l && l.islockd == 0) {
          let quantity = l.数量;
          //纳戒中的数量
          if (i == '装备' || i == '仙宠') {
            await Add_najie_thing(B_qq, l, l.class, quantity, l.pinji);
            await Add_najie_thing(A_qq, l, l.class, -quantity, l.pinji);
            let najie = await Read_najie(B_qq);
            for(let item of najie.装备){
              if(item==l){
                item.islockd=1
              }
            }
            for(let item of najie.仙宠){
              if(item==l){
                item.islockd=1
              }
            }
            continue;
          }
          await Add_najie_thing(A_qq, l.name, l.class, -quantity);
          await Add_najie_thing(B_qq, l.name, l.class, quantity);
        }
      }
    }
    e.reply(`一键赠送完成`);
    return false;
  }
  async Sell_all_huishou(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let najie = await data.getData('najie', usr_qq);
    let lingshi = 0;
    let wupin = [
      '装备',
      '丹药',
      '道具',
      '功法',
      '草药',
       '食材',
      '材料',
      '仙宠',
      '仙宠口粮',
    ];
    let wupin1 = [];
    if (e.msg != '#一键回收') {
      let thing = e.msg.replace('#一键回收', '');
      for (var i of wupin) {
        if (thing == i) {
          wupin1.push(i);
          thing = thing.replace(i, '');
        }
      }
      if (thing.length == 0) {
        wupin = wupin1;
      } else {
        return false;
      }
    }
    for (var i of wupin) {
      for (let l of najie[i]) {
        //纳戒中的数量
        let thing_exist = await foundthing(l.name);
        if (thing_exist) {
          continue;
        }
        await Add_najie_thing(usr_qq, l.name, l.class, -l.数量, l.pinji);
        if (l.class == '材料' || l.class == '草药') {
          lingshi += l.出售价 * l.数量;
        } else {
          lingshi += l.出售价 * l.数量 * 2;
        }
      }
    }
    await Add_灵石(usr_qq, lingshi);
    e.reply(`回收成功!  获得${lingshi}灵石 `);
    return false;
  }
  async locked(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    //命令判断
    let msg = e.msg.replace('#', '');
    let un_lock = msg.substr(0, 2);
    let thing = msg.substr(2).split('*');
    let thing_name = thing[0];
    let najie = await Read_najie(usr_qq);
    thing[0] = parseInt(thing[0]);
    let thing_pinji;
    //装备优化
    if (thing[0]) {
      if (thing[0] > 1000) {
        try {
          thing_name = najie.仙宠[thing[0] - 1001].name;
        } catch {
          e.reply('仙宠代号输入有误!');
          return false;
        }
      } else if (thing[0] > 500) {
        try {
          thing_name = najie.装备[thing[0] - 500].name;
          thing[1] = najie.装备[thing[0] - 500].pinji;
        } catch {
          e.reply('装备代号输入有误!');
          return false;
        }
      }
    }
    let thing_exist = await foundthing(thing_name);
    if (!thing_exist) {
      e.reply(`你瓦特了吧，这方世界没有这样的东西:${thing_name}`);
      return false;
    }
    let pj = {
      劣: 0,
      普: 1,
      优: 2,
      精: 3,
      极: 4,
      绝: 5,
      顶: 6,
    };
    thing_pinji = pj[thing[1]];
    let ifexist;
    if (un_lock == '锁定') {
      ifexist = await re_najie_thing(
        usr_qq,
        thing_name,
        thing_exist.class,
        thing_pinji,
        1
      );
      if (ifexist) {
        e.reply(`${thing_exist.class}:${thing_name}已锁定`);
        return false;
      }
    } else if (un_lock == '解锁') {
      ifexist = await re_najie_thing(
        usr_qq,
        thing_name,
        thing_exist.class,
        thing_pinji,
        0
      );
      if (ifexist) {
        e.reply(`${thing_exist.class}:${thing_name}已解锁`);
        return false;
      }
    }
    e.reply(`你没有【${thing_name}】这样的${thing_exist.class}`);
    return false;
  }

  async all_tongbu(e) {
    if (!verc({ e })) return false;
    await synchronization(e);
    await Synchronization_ASS(e);
    return false;
  }
//一键出售
async Sell_all_comodities(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    // 检查存档是否存在
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    
    let commodities_price = 0;
    let najie = await data.getData('najie', usr_qq);
    let wupin = [
        '装备','丹药','道具','功法','草药',
        '食材','材料','仙宠','盒子','仙宠口粮'
    ];
    
    let wupin1 = [];
    let protectedWeapons = []; // 存储被保护的帝兵信息
    
    /* ======== 指定类别出售 ======== */
    if (e.msg != '#一键出售') {
        let thing = e.msg.replace('#一键出售', '').trim();
        
        // 验证类别
        for (let i of wupin) {
            if (thing == i) { wupin1.push(i); break; }
        }
        if (wupin1.length === 0) {
            return e.reply(`无效的物品类别: ${thing}`);
        }
        wupin = wupin1;
        
        for (let category of wupin) {
            if (!Array.isArray(najie[category])) continue;
            for (let item of najie[category]) {
                if (!item || item.islockd != 0) continue;
                
                // 帝兵保护
                if (category === '装备' && item.type === '帝兵' && item.author_name) {
                    protectedWeapons.push(item.name);
                    continue;
                }
                let quantity = item.数量;
                // 设置默认价格：如果没有出售价字段，默认12000灵石[1,2](@ref)
                let unitPrice = item.出售价 ?? 12000;
                
                /* ****** 删掉 200W 特殊价 ****** */
                await Add_najie_thing(usr_qq, item.name, item.class, -quantity, item.pinji);
                commodities_price += unitPrice * quantity;
            }
        }
        
        await Add_灵石(usr_qq, commodities_price);
        let replyMsg = `出售成功! 获得${commodities_price}灵石`;
        if (protectedWeapons.length > 0) {
            replyMsg += `\n【帝兵保护】以下本命帝兵未出售：${protectedWeapons.join('、')}`;
        }
        e.reply(await get_log_img(replyMsg));
        return false;
    }
    
    /* ======== 全品类预览 ======== */
    let goodsNum = 0;
    let tableData = [];
    let totalValue = 0;
    
    for (let category of wupin) {
        if (!Array.isArray(najie[category])) continue;
        for (let item of najie[category]) {
            if (!item || item.islockd != 0) continue;
            
            // 帝兵保护
            if (category === '装备' && item.type === '帝兵' && item.author_name) continue;
            
            let quantity   = item.数量;
            // 设置默认价格：如果没有出售价字段，默认12000灵石[1,2](@ref)
            let unitPrice = item.出售价 ?? 12000;
            let itemValue  = unitPrice * quantity;   /* ****** 删掉 200W 特殊价 ****** */
            totalValue    += itemValue;
            
            tableData.push({
                名称: item.name,
                数量: quantity,
                单价: unitPrice,
                总价: itemValue,
                类别: category
            });
            goodsNum++;
        }
    }
    
    if (goodsNum == 0) {
        e.reply('没有东西可以出售', false, { at: true });
        return false;
    }
    
    // 按类别分组
    let categories = {};
    tableData.forEach(item => {
        if (!categories[item.类别]) categories[item.类别] = [];
        categories[item.类别].push(item);
    });
    
    // 构造预览文本
    let formattedMsg = [
        `【诸天万界·一键出售清单】`,
        `共计 ${goodsNum} 件物品，预估总价值: ${this.formatNumber(totalValue)} 灵石`
    ];
    
    for (let cate in categories) {
        formattedMsg.push(`\n【${cate}】`);
        formattedMsg.push('─'.repeat(40));
        categories[cate].forEach(it => {
            formattedMsg.push(
                `${this.padRight(it.名称,16)}`,
                `数量: ${this.padLeft(it.数量,4)}`,
                `单价: ${this.padLeft(this.formatNumber(it.单价),12)}`,
                `总价: ${this.padLeft(this.formatNumber(it.总价),15)}`,
                '─'.repeat(40)
            );
        });
        const sub = categories[cate].reduce((s, v) => s + v.总价, 0);
        formattedMsg.push(`小计: ${this.formatNumber(sub)} 灵石`);
    }
    
    formattedMsg.push(`总价值: ${this.formatNumber(totalValue)} 灵石`);
    formattedMsg.push(`回复[1]确认出售，回复[0]取消`);
    
    e.reply(await get_log_img(formattedMsg.join('\n')));
    
    // 设置上下文等待确认
    this.setContext('noticeSellAllGoods');
    return false;
}


// 数字格式化
formatNumber(num) {
    if (typeof num === 'string') {
        // 如果是字符串（如"200万"），直接返回
        return num;
    }
    if (num >= 100000000) {
        return (num / 100000000).toFixed(2) + '亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(2) + '万';
    }
    return num.toString();
}

// 字符串对齐
padRight(str, length) {
    str = str.toString();
    if (str.length >= length) return str.substring(0, length);
    return str + ' '.repeat(length - str.length);
}

padLeft(str, length) {
    str = str.toString();
    if (str.length >= length) return str.substring(0, length);
    return ' '.repeat(length - str.length) + str;
}
  async noticeSellAllGoods(e) {
    if (!verc({ e })) return false;
    let reg = new RegExp(/^1$/);
    let new_msg = this.e.msg;
    let difficulty = reg.exec(new_msg);
    if (!difficulty) {
      e.reply('已取消出售', false, { at: true });
      /** 结束上下文 */
      this.finish('noticeSellAllGoods');
      return false;
    }
    /** 结束上下文 */
    this.finish('noticeSellAllGoods');
    /**出售*/

    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let najie = await data.getData('najie', usr_qq);
    let commodities_price = 0;
    let wupin = [
      '装备',
      '丹药',
      '道具',
      '功法',
      '草药',
       '食材',
      '材料',
      '盒子',
      '仙宠',
      '仙宠口粮',
    ];
    for (let i of wupin) {
      for (let l of najie[i]) {
        if (l && l.islockd == 0) {
          console.log(await foundthing(l.name).出售价)
          //纳戒中的数量
          let quantity = l.数量;
          if(l.name!="秘境之匙"){
            await Add_najie_thing(usr_qq, l.name, l.class, -quantity, l.pinji);
            commodities_price = commodities_price + l.出售价 * quantity;
          }else{
            await Add_najie_thing(usr_qq, l.name, l.class, -quantity, l.pinji);
            commodities_price = commodities_price + 2000000 * quantity;
          }
        }
      }
    }
    await Add_灵石(usr_qq, commodities_price);
    e.reply(await get_log_img(`出售成功!  获得${commodities_price}灵石 `))
    return false;
  }

  //#(装备|服用|使用)物品*数量
  async all_xiuweidan(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    //检索方法
    let najie = await data.getData('najie', usr_qq);
    let xiuwei = 0;
          if (player.mijinglevel_id>19 && player.xiangulevel_id > 19) {
        e.reply(`「自荒古岁月至今...」
「本座早已不需要这等外物了」`);
        return false;
      }
    for (var l of najie.丹药) {
      if (l.type == '修为') {
        //纳戒中的数量
        let quantity = await exist_najie_thing(usr_qq, l.name, l.class);
        await Add_najie_thing(usr_qq, l.name, l.class, -quantity);
        xiuwei = xiuwei + l.exp * quantity;
      }
    }
    await Add_修为(usr_qq, xiuwei);
    e.reply(`服用成功,修为增加${xiuwei}`);
    return false;
  }
  //#(装备|服用|使用)物品*数量
 async all_yuanshen(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let player = await Read_player(usr_qq);
  
    // 有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;

    // 检索方法
    let najie = await data.getData('najie', usr_qq);
    let totalYuanshen = 0; // 用于累计所有天药提供的元神值

    for (var l of najie.丹药) {
      if (l.type == '天药') {
        // 纳戒中的数量
        let quantity = await exist_najie_thing(usr_qq, l.name, l.class);
        // 累加这种天药提供的元神值
        totalYuanshen += l.yuanshen * quantity;
        // 消耗丹药
        await Add_najie_thing(usr_qq, l.name, l.class, -quantity);
      }
    }

    // 更新玩家元神和元神上限
    player.元神 += totalYuanshen;
    player.元神上限 += totalYuanshen;
    await Write_player(usr_qq, player);
    e.reply(`服用成功,元神与元神上限增加${totalYuanshen}`);
    return false;
}

 async all_learn(e) {
  if (!verc({ e })) return false;
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  
  // 有无存档
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) return false;
  
  // 检索方法
  let najie = await data.getData('najie', usr_qq);
  let player = await Read_player(usr_qq);
  
const gongfaHierarchy = {
  "神慧者": 8,
  "仙帝法": 7,
  "仙王法": 6,
  "十凶宝术": 6,
  "帝经": 5,
  "九秘": 5,
  "盖世杀术": 4,
  "道与法": 3,
  "宝术": 3,
  "天魔法": 2,
  "命运法": 2,
  "修炼功法": 1,
  "炼器": 1,
  "炼丹": 1,
  "武学": 1
};

// 定义天资等级映射（数字越大表示天资越高）
const aptitudeLevels = {
  "无演无尽": 8,
  "万古无双": 7,
  "绝世天骄": 6,
  "旷世奇才": 5,
  "天纵之资": 4,
  "超凡资质": 3,
  "平庸之资": 2,
  "先天不足": 1,
  "天弃之人": 0
};
  
 // 获取玩家的天资等级
const aptitudeLevel = player.天资等级;

// 获取玩家天资层级（数字越大越好）
const playerAptitudeLevel = aptitudeLevels[aptitudeLevel] || 0; // 默认为天赋层级
  
  let learnedGongfa = []; // 成功学习的功法
  let skippedGongfa = []; // 因条件不符跳过的功法
  let failedGongfa = [];  // 因特殊条件失败的功法
  
  for (var l of najie.功法) {
    // 检查是否已学习
    if (player.学习的功法.includes(l.name)) {
      skippedGongfa.push(`${l.name}(已学习)`);
      continue;
    }
       // 特殊功法检查 - 自然大道
    if (l.name == '自然大道') {
        // 允许学习的资质类型
        const allowedAptitudes = ["平庸之资", "先天不足", "天弃之人"];
        
        if (!allowedAptitudes.includes(aptitudeLevel)) {
            failedGongfa.push(`${l.name}(资质【${aptitudeLevel}】过于聪慧，大道拒斥)`);
            continue;
        }
    }
    // 特殊功法检查（神慧者）
    if (l.type == '神慧者' && player.灵根.type != "神慧者") {
      failedGongfa.push(`${l.name}(需要神慧者灵根)`);
      continue;
    }
    // 特殊功法检查（先天圣体道胎）
    if (l.name == '无始经' && (player.灵根.name != "先天圣体道胎"&& player.灵根.name != "混沌圣体道胎")) {
      failedGongfa.push(`${l.name}(需要先天圣体道胎灵根)`);
      continue;
    }
    // 特殊功法检查（道胎）
    if (l.name == '西皇经' && (player.灵根.type != "道胎"&&player.灵根.type != "圣体道胎"&& player.灵根.name != "混沌圣体道胎")) {
      failedGongfa.push(`${l.name}(需要拥有先天道胎)`);
      continue;
    }
     // 特殊功法检查（妖体）
    if (l.name == '妖帝古经' && (player.灵根.type != "妖体"&& player.灵根.name != "小成妖体"&& player.灵根.name != "大成妖体")) {
      failedGongfa.push(`${l.name}(妖族古皇的帝经非妖体不可学)`);
      continue;
    }
      // 特殊功法检查（妖体）
    if (l.name == '万龙古经' && (player.灵根.type != "妖体"&& player.灵根.name != "小成妖体"&& player.灵根.name != "大成妖体")) {
      failedGongfa.push(`${l.name}(妖族古皇的帝经非妖体不可学)`);
      continue;
    }
    // 获取功法的层级
   const gongfaLevel = gongfaHierarchy[l.type] || 8; // 默认为修炼功法层级
    
   // 学习条件：玩家天资层级 >= 功法层级 才能学习
  if (playerAptitudeLevel < gongfaLevel) {
    skippedGongfa.push(`${l.name}(天资不足)`);
    continue;
  }
    
    // 学习功法
    await Add_najie_thing(usr_qq, l.name, '功法', -1);
    await Add_player_学习功法(usr_qq, l.name);
    learnedGongfa.push(l.name);
  }
  
  // 构建回复消息
  let replyMsg = '';
  
  if (learnedGongfa.length > 0) {
    replyMsg += `你学会了${learnedGongfa.join('、')}\n`;
  }
  
  if (skippedGongfa.length > 0) {
    replyMsg += `跳过学习：${skippedGongfa.join('、')}\n`;
  }
  
  if (failedGongfa.length > 0) {
    replyMsg += `无法学习：${failedGongfa.join('、')}\n`;
  }
  
  if (learnedGongfa.length === 0 && skippedGongfa.length === 0 && failedGongfa.length === 0) {
    replyMsg = '无新功法可学习';
  } else {
    replyMsg += '可以在【#我的炼体】中查看已学功法';
  }
  
  e.reply(replyMsg);
  return false;
}
    async regression(e){
      let player_id=e.user_id.toString().replace('qg_','')
      let ifexistplay = await existplayer(player_id);
      if (!ifexistplay){;
          e.reply("当前位面无存档")
          return false
        }
        let action = await redis.get('xiuxian:player:' + player_id + ':action');
        action = await JSON.parse(action);
  
      //不为空，存在动作
      if (action != null) {
        //最后发送的消息
        let msg = [];
       
        //动作结束时间
        let end_time = action.end_time;
        //现在的时间
        let now_time = new Date().getTime();
         let usr_qq = player_id; //
        //用户信息
        let player = await Read_player(player_id);
        //有秘境状态:这个直接结算即可
        if (action.Place_action == '0') {//降临
          //这里改一改,要在结束时间的前两分钟提前结算
     end_time = end_time - 60000 * 1;
     
          //时间过了
          if (now_time > end_time 
            || player_id=='4909071520328015562') {
            let weizhi = action.Place_address;
          let xf = -1;
        
            let A_player = {
              名号: player.名号,
              攻击: player.攻击,
              防御: player.防御,
              当前血量: player.当前血量,
              暴击率: player.暴击率,
              法球倍率: player.灵根.法球倍率,
              仙宠: player.仙宠,
            };
            let buff = 1;
            let monster = getMonsterByLocation(weizhi, xf);
            let B_player = {
              名号: monster.名号,
              攻击: parseInt(monster.攻击),
              防御: parseInt(monster.防御),
              当前血量: parseInt(monster.当前血量),
              暴击率: monster.暴击率,
              法球倍率: 0.1,
            };
            let Data_battle = await zd_battle(A_player, B_player);
            let msgg = Data_battle.msg;
            let A_win = `${A_player.名号}击败了${B_player.名号}`;
            let B_win = `${B_player.名号}击败了${A_player.名号}`;
            var thing_name;
            var thing_class;
            const cf = config.getConfig('xiuxian', 'xiuxian');
            var x = cf.SecretPlace.one;
            let random1 = Math.random();
            var y = cf.SecretPlace.two;
            let random2 = Math.random();
            var z = cf.SecretPlace.three;
            let random3 = Math.random();
            let random4;
            var m = '';
            let fyd_msg = '';
            //查找秘境
            let t1;
            let t2;
            var n = 1;
            let last_msg = '';
               if (player.出金次数 >0 ) {
            player.出金次数 -= 1;
             if (player.出金次数 != 0) {
                  x = 1
                    y = 1; 
                    z+= player.出金率 / 100;       
      let 最终出金 = Math.round(z * 100) ;
            last_msg += `本次出金率提升${player.出金率}%,高级奖励概率为${最终出金}%,丹药加持效果剩余${player.出金次数}次 `;
                } else {
                  fyd_msg = `   本次探索后，丹药的加持效果已失效 `;
                   z += player.出金 / 100; 
                  player.出金率 = 0;
                }
             await Write_player(usr_qq, player);
          }
                if (player.灵根.type === "魔法少女" ) {
            random1 = Math.max(0.1, random1 - 0.15);
            z += 0.5;
            last_msg += '你是魔法少女，晓美焰不断轮回重启世界线叠加的因果使你能够在秘境中出金率提升 ';
          }
               if (player.灵根.type === "圆环之理" ) {
            y+=0.5
            last_msg += '你是超越宇宙法则的存在，圆环之理的秩序力量能使你看透秘境。';
          }
            if (random1 <= x) {
              if (random2 <= y) {
                if (random3 <= z) {
                  random4 = Math.floor(Math.random() * weizhi.three.length);
                  thing_name = weizhi.three[random4].name;
                  thing_class = weizhi.three[random4].class;
          // 检查副本奖励庇护
if (player["player.剑云海庇护"] && player["player.剑云海庇护"].副本奖励 > 0) {
    n *= 5;
    m = `抬头一看，金光一闪！以剑云海庇护之力把握造化机缘，捡到了[${thing_name}]`;
    // 消耗一次副本奖励庇护
    player["player.剑云海庇护"].副本奖励--;
    await Write_player(usr_qq, player);
}
                    if (player.灵根.type === "神慧者") {
                  n *= 10;
                  m = '抬头一看，金光一闪！以神慧之光洞察天地大道，把握一切造化机缘，拿到到了[' + thing_name;
                }
                  m = `抬头一看，金光一闪！有什么东西从天而降，定睛一看，原来是：[${thing_name}`;
                 if (player.天地气运&& Math.random()<0.5) {
                  n *= 2;
                  m = '抬头一看，金光一闪！受到天地气运加持，拿到了[' + thing_name;
                }

                  t1 = 2 + Math.random();
                  t2 = 2 + Math.random();
                } else {
                  random4 = Math.floor(Math.random() * weizhi.two.length);
                  thing_name = weizhi.two[random4].name;
                  thing_class = weizhi.two[random4].class;
                  m = `在洞穴中拿到[${thing_name}`;
                  t1 = 1 + Math.random();
                  t2 = 1 + Math.random();
                  if (weizhi.name == '太极之阳' || weizhi.name == '太极之阴') {
                    n = 5;
                    m = '捡到了[' + thing_name;
                  }
                      if (weizhi.name == '须弥') {
                  n *= 40;
                  m = '捡到了[' + thing_name;
                }
         // 检查副本奖励庇护
if (player["player.剑云海庇护"] && player["player.剑云海庇护"].副本奖励 > 0) {
    n *= 5;
    m = `以剑云海庇护之力把握造化机缘，捡到了[${thing_name}]`;
    // 消耗一次副本奖励庇护
    player["player.剑云海庇护"].副本奖励--;
    await Write_player(usr_qq, player);
}

                 if (player.灵根.type === "神慧者") {
                  n *= 10;
                  m = '以神慧之光洞察天地大道，把握一切造化机缘，找寻到了[' + thing_name;
                }
                   if (player.天地气运&& Math.random()<0.5) {
                  n *= 2;
                  m = '受到天地气运加持，拿到了[' + thing_name;
                }


                }
              } else {
                random4 = Math.floor(Math.random() * weizhi.one.length);
                thing_name = weizhi.one[random4].name;
                thing_class = weizhi.one[random4].class;
                m = `捡到了[${thing_name}`;
                t1 = 0.5 + Math.random() * 0.5;
                t2 = 0.5 + Math.random() * 0.5;
                if (weizhi.name == '诸神黄昏·旧神界') {
                  n = 1;
                  if (thing_name == '洗根水') n = 130;
                  if (thing_name == '冰心丹') n = 80;
                  if (thing_name == '大力丸') n = 80;
                  if (thing_name == '七彩墨树') n = 5;
                  m = '捡到了[' + thing_name;
                }
                  if (weizhi.name == '诸天'|| weizhi.name == '真魔殿') {
                  n = 1;
                  if (thing_name == '圣品福源丹') n = 10;
                  if (thing_name == '圣品仙缘丹') n = 10;
                  m = '捡到了[' + thing_name;
                }
                if (weizhi.name == '太极之阳' || weizhi.name == '太极之阴') {
                  n = 5;
                  m = '捡到了[' + thing_name;
                }
                  if (weizhi.name == '须弥') {
                  n *= 40;
                  m = '捡到了[' + thing_name;
                }
                 // 检查副本奖励庇护
if (player["player.剑云海庇护"] && player["player.剑云海庇护"].副本奖励 > 0) {
    n *= 5;
    m = `以剑云海庇护之力把握造化机缘，捡到了[${thing_name}]`;
    // 消耗一次副本奖励庇护
    player["player.剑云海庇护"].副本奖励--;
    await Write_player(usr_qq, player);
}
                 if (player.灵根.type === "神慧者") {
                  n *= 10;
                  m = '以神慧之光洞察天地大道，把握一切造化机缘，找寻到了[' + thing_name;
                }
                   if (player.天地气运&& Math.random()<0.5) {
                  n *= 2;
                  m = '受到天地气运加持，拿到了[' + thing_name;
                }

   
              }
            } else {
              m = '走在路上看见了一只蚂蚁！蚂蚁大仙送了你[起死回生丹';
              await Add_najie_thing(player_id, '起死回生丹', '丹药', 1);
              t1 = 0.5 + Math.random() * 0.5;
              t2 = 0.5 + Math.random() * 0.5;
            }
    if (player.灵根.type === "许愿化身") {
    const oneReward = weizhi.one[Math.floor(Math.random() * weizhi.one.length)];
    await Add_najie_thing(player_id, oneReward.name, oneReward.class, 3);
    last_msg += `额外获得[${oneReward.name}]x3`;
  } 
    if (player.灵根.type === "希望化身") {
    const oneReward = weizhi.one[Math.floor(Math.random() * weizhi.one.length)];
    const twoReward = weizhi.two[Math.floor(Math.random() * weizhi.two.length)];
    
    await Add_najie_thing(player_id, oneReward.name, oneReward.class, 6);
    await Add_najie_thing(player_id, twoReward.name, twoReward.class, 6);
    last_msg += `额外获得[${oneReward.name}][${twoReward.name}]x6`;
  }            
    if (player.灵根.type === "圆环之理") {
    const oneReward = weizhi.one[Math.floor(Math.random() * weizhi.one.length)];
    const twoReward = weizhi.two[Math.floor(Math.random() * weizhi.two.length)];
    const threeReward = weizhi.three[Math.floor(Math.random() * weizhi.three.length)];
    await Add_najie_thing(player_id, oneReward.name, oneReward.class, 9);
    await Add_najie_thing(player_id, twoReward.name, twoReward.class, 9);
    await Add_najie_thing(player_id, threeReward.name, threeReward.class, 9);
    last_msg += `额外获得[${oneReward.name}][${twoReward.name}][${threeReward.name}]x9`;
  }
        if (player.power_place == 2 && player.古地府 && player.灵根.type === "圣体" && Math.random() < 0.3 && player.mijinglevel_id < 14) {
            try {
                let penaltyMsg = [
                    '【古地府惊魂·圣体劫难】',
                    '你不小心勿入古地府深处，阴风骤起！',
                    '黄泉路上阴兵列阵，鬼门关开：',
                    '"圣体余孽，当诛！"',
                    '地府判官挥动生死簿：',
                    '"圣体一脉，地府不容！"',
                    '牛头马面手持锁魂链扑来：',
                    '「咔嚓！」锁链贯穿圣体道躯',
                    '你催动圣体金血抵抗：',
                    '"轰！"圣血染黄泉，激起地府震动',
                    '判官冷笑："圣体余孽，也敢猖狂！"',
                    '生死簿上射出道道幽冥神光：',
                    '圣体金身寸寸崩裂，金色圣血染红地府',
                    '你被镇压在黄泉河底：',
                    '"圣体一脉，永世不得超生！"',
                    '三日后，你挣扎爬出黄泉：',
                    '圣体本源受损（当前血量=0）',
                    '纳戒被洗劫'
                ];
                
                // 将当前血量设为0
                player.当前血量 = 0;
                
                // 抢走纳戒物品（特别针对圣体资源）
                const najie = await Read_najie(usr_qq);
                let stolenItems = [];
                const itemCategories = ["丹药", "道具", "盒子", "仙宠口粮", "功法", "草药", "材料"];
                
                // 优先抢走圣体相关资源
                const saintItems = najie.材料?.filter(item => 
                    item.name.includes("圣血") || 
                    item.name.includes("金身") ||
                    item.name.includes("圣骨")
                ) || [];
                
                if (saintItems.length > 0) {
                    // 抢走所有圣体相关资源
                    for (const item of saintItems) {
                        const currentQuantity = await exist_najie_thing(usr_qq, item.name, "材料");
                        if (currentQuantity > 0) {
                            await Add_najie_thing(usr_qq, item.name, "材料", -currentQuantity);
                            stolenItems.push({
                                name: item.name,
                                quantity: currentQuantity,
                                category: "材料"
                            });
                        }
                    }
                    penaltyMsg.push('地府夺走资源：');
                } else {
                    // 随机抢走其他资源
                    const affectedCategories = [...itemCategories]
                        .sort(() => Math.random() - 0.5)
                        .slice(0, Math.floor(Math.random() * 3) + 2);
                    
                    for (const category of affectedCategories) {
                        const categoryItems = najie[category] || [];
                        if (!categoryItems.length) continue;
                        
                        const itemsToSteal = [...categoryItems]
                            .sort(() => Math.random() - 0.5)
                            .slice(0, Math.floor(Math.random() * 3) + 1);
                        
                        for (const item of itemsToSteal) {
                            const currentQuantity = await exist_najie_thing(usr_qq, item.name, category);
                            if (currentQuantity <= 0) continue;
                            
                            const stealAmount = Math.max(1, Math.floor(
                                currentQuantity * (0.3 + Math.random() * 0.5)
                            ));
                            const actualStolen = Math.min(stealAmount, currentQuantity);
                            
                            await Add_najie_thing(usr_qq, item.name, category, -actualStolen);
                            stolenItems.push({
                                name: item.name,
                                quantity: actualStolen,
                                category
                            });
                        }
                    }
                    penaltyMsg.push('被抢物品：');
                }
                
                // 添加被抢物品到消息
                if (stolenItems.length > 0) {
                    penaltyMsg.push(
                        ...stolenItems.map(item => `• ${item.name} ×${item.quantity}`)
                    );
                } else {
                    penaltyMsg.push('※ 纳戒中无值钱物品，地府不屑');
                }
                
                penaltyMsg.push(
                    '你拖着残躯逃出地府，耳边回荡：',
                    '"圣体一脉，永世为奴！"'
                );
                
                // 保存玩家数据
                await Write_player(usr_qq, player);
                
                // 发送消息
                if (action.group_id) {
                    await Bot.pickGroup(action.group_id).sendMsg([
                        segment.at(usr_qq),
                        penaltyMsg.join('\n')
                    ]);
                } else {
                    await common.relpyPrivate(usr_qq, penaltyMsg.join('\n'));
                }
                
            } catch (err) {
                console.error("古地府事件处理失败:", err);
                await common.reply(e, "地府阴气扰乱天机！事件处理失败");
            }
        }
if (player.power_place == 2 && Math.random() < 0.01) {
    try {
        // 检查是否已经解锁张五爷
        let hasZhangwuye = false;
        if (player.剧情人物 && Array.isArray(player.剧情人物)) {
            hasZhangwuye = player.剧情人物.some(np => np.张五爷);
        }
        
        // 只有未解锁张五爷时才触发事件
        if (!hasZhangwuye) {
            let eventMsg = [];
            
            eventMsg.push('【荒古禁地·偶遇源天师后人】');
            eventMsg.push('你在荒古禁地边缘探索时，发现一位须发皆白的老者正在勘测地势。');
            eventMsg.push('老者手持罗盘，口中念念有词："龙脉潜行，源气汇聚，此地必有大源！"');
            eventMsg.push('你上前询问，老者抬头打量你一番：');
            eventMsg.push('"老夫张五，源天师一脉传人。观小友气运不凡，可愿听老夫一言？"');
            eventMsg.push('你点头应允，张五爷便开始讲解源术奥秘。');
            
            // 给予源师转职凭证
            await Add_najie_thing(usr_qq, "源师转职凭证", "道具", 1);
            eventMsg.push('张五爷赠你「源师转职凭证」："持此凭证可前往源术世家转职为源师。"');
            
            // 初始化张五爷关系
            if (!player.剧情人物) {
                player.剧情人物 = [];
            }
            player.剧情人物.push({
                "张五爷": 1,
                "关系": 1, // 1表示初识关系
                "好感度": 0,
                "解锁时间": new Date().getTime(),
                "事件记录": ["荒古禁地初遇"]
            });
            
            // 保存玩家数据
            await Write_player(usr_qq, player);
            
            // 发送消息
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    eventMsg.join('\n')
                ]);
            } else {
                await common.relpyPrivate(usr_qq, eventMsg.join('\n'));
            }
        }
        
    } catch (err) {
        console.error("源天师事件处理失败:", err);
        await common.reply(e, "源气紊乱，天机不显！事件处理失败");
    }
}
                // 太玄门探索事件
                if (weizhi.name === "太玄门") {
                    let random = Math.random();
                    // 根据玩家的幸运值调整概率
                    let putizi = await exist_najie_thing(usr_qq, "菩提子", "道具");
                    
                    if (!putizi || putizi < 1) {
                        last_msg += '你登临拙峰绝顶，见山石斑驳，古木苍苍。九秘道痕隐于天地，然凡胎肉眼难窥真谛，终是大道如青天，我独不得出。';
                    }else{                
                    if (random < 0.05) {
                        // 检查全服是否已有人习得皆字秘
                        const isLearned = await checkGongfaInServer('皆字秘');
                        
                        if (isLearned) {
                            last_msg += '菩提子引动拙峰道痕，九秘真义如星河倒灌！然天地间道痕已散，皆字秘真谛已被他人参透，万古机缘唯此一次！';
                        } else {
                            last_msg += '菩提子于掌心绽放清辉，引动拙峰沉寂万古的道痕。刹那间，九秘真义如星河倒灌，皆字秘奥义烙印神魂——战天斗地，十倍战力！';
                                         player.学习的功法 = player.学习的功法 || [];
                    player.学习的功法.push('皆字秘');
                    await Write_player(usr_qq, player);
                        }
                    } else {
                        last_msg += '菩提道韵勾动天地，拙峰石壁显化荒古道图。然九秘真义如镜花水月，指尖触及刹那崩散，唯留道痕余韵在苦海沉浮。';
                    }
                }
              }
                // 瑶池旧址探索事件
                if (weizhi.name === "瑶池旧址") {
                    let random = Math.random();
                    let putizi = await exist_najie_thing(usr_qq, "菩提子", "道具");
                    
                    if (!putizi || putizi < 1) {
                        last_msg += '你立于残破仙池畔，见断壁残垣间道痕隐现。西皇母遗刻如雾里看花，纵有千般玄妙，终是仙缘未至，大道如渊不可渡。';
    
                    }else{ 
                    if (random < 0.05) {
                        // 检查全服是否已有人习得西皇经·道宫卷
                        const isLearned = await checkGongfaInServer('西皇经·道宫卷');
                        
                        if (isLearned) {
                            last_msg += '菩提道韵勾动仙池古壁，西皇母虚影显化！然道宫真义已被他人参透，虚影拈花而叹："大道唯一，不可复得"！';
                        } else {
                            last_msg += '菩提子绽混沌清辉，引动仙池古壁嗡鸣！刹那间，道宫五神藏显化虚空：心之神藏燃离火，肺之神藏凝庚金...西皇经真义如天河倒卷，尽归汝身！';                   
                    player.学习的功法 = player.学习的功法 || [];
                    player.学习的功法.push('西皇经·道宫卷');
                    await Write_player(usr_qq, player);
                        }
                    } else {
                        last_msg += '菩提道韵勾动残碑，仙泪绿金映照万古道痕。忽有冥雾翻涌，西皇母虚影拈花而叹："遍访成仙路，唯见血与骨！"道宫真义随雾霭消散，唯留道心震颤。';
                    }
                }}
                            // 火域探索事件 - 恒宇经获取
                if (weizhi.name === "火域") {
                    let random = Math.random();
                    let huoyu_jing = await exist_najie_thing(usr_qq, "七彩火晶", "道具");
                    
                    if (!huoyu_jing || huoyu_jing < 1) {
                        last_msg += '你立于九重火域边缘，混沌火焰焚天煮海。石壁刻痕如龙蛇游走，恒宇大道真义隐于火海深处，然神火滔天，无引路之物难窥真容。';
                    } else { 
                        if (random < 0.05) {
                            // 检查全服是否已有人习得恒宇经·四极卷
                            const isLearned = await checkGongfaInServer('恒宇经·四极卷');
                            
                            if (isLearned) {
                                last_msg += '七彩火晶映照石壁，恒宇虚影显化！帝影抚炉轻叹："道火唯一，不可复燃"，壁刻经文在烈焰中化为飞灰！';
                            } else {
                                last_msg += '七彩火晶迸发神光，引动混沌火共鸣！石壁浮现恒宇大帝虚影，四极道图铺展天地：左臂青龙啸，右臂白虎踞...帝经真义如熔岩贯体！';
                                player.学习的功法 = player.学习的功法 || [];
                    player.学习的功法.push('恒宇经·四极卷');
                    await Write_player(usr_qq, player);
                            }
                            // 消耗七彩火晶
                            await Add_najie_thing(usr_qq, "七彩火晶", "道具", -1);
                        } else {
                            last_msg += '七彩火晶与混沌火共鸣，石壁浮现四极道图！然帝影突然睁目："非我血脉，也敢窃经？"一道帝火将你震出火域核心！';
                        }
                    }
                }
                
                // 大夏祖庙探索事件 - 太皇经获取
                if (weizhi.name === "大夏祖庙") {
                    let random = Math.random();
                    let longjin = await exist_najie_thing(usr_qq, "龙纹黑金残块", "材料");
                    
                    if (!longjin || longjin < 1) {
                        last_msg += '你踏入阴森祖庙，太皇剑意如龙蛰伏。壁画中化龙九变的道痕游走，然无龙气媒介，皇道经文如镜花水月。';
                    } else { 
                        if (random < 0.05) {
                            // 检查全服是否已有人习得太皇经·化龙卷
                            const isLearned = await checkGongfaInServer('太皇经·化龙卷');
                            
                            if (isLearned) {
                                last_msg += '龙纹黑金引动剑鸣，太皇虚影显化！帝剑横空："皇道龙气已尽归他人"，祖庙壁画寸寸龟裂！';
                            } else {
                                last_msg += '龙纹黑金与祖庙共鸣，太皇剑影破壁而出！脊柱大龙应声长吟：尾闾起，仙台落，九节龙骨绽放皇道龙气！';
                    player.学习的功法 = player.学习的功法 || [];
                    player.学习的功法.push('太皇经·化龙卷');
                    await Write_player(usr_qq, player);
                            }
                            // 消耗龙纹黑金
                            await Add_najie_thing(usr_qq, "龙纹黑金残块", "材料", -1);
                        } else {
                            last_msg += '龙纹黑金引动皇道龙气，脊柱大龙昂首欲腾！忽闻太皇怒喝："非我血脉，也敢化龙？"一道剑意斩断龙气连接！';
                        }
                    }
                }
// 紫薇星域八景宫事件 - 一气化三清获取
if (weizhi.name === "紫薇星域") {
    try {
        // 前置条件检查
        const daoDeJing = await exist_najie_thing(usr_qq, "道德经残页", "道具");
        const hasDaoDeJing = daoDeJing >= 1;
        const isGongfaLearned = await checkGongfaInServer('一气化三清');
        const successRate = 0.05; // 5%成功概率

        // 无道德经残页的通用剧情[5](@ref)
        const noEntryMsg = ` 
【八景宫禁地｜紫气东来三万里】
老子西出函谷关，踏五色祭坛降临紫薇星域，于此留下道痕。
你立于玄都洞前，但见：
  - 宫门混沌雾霭缭绕，地脉道纹暗合周天星辰
  - 青铜古炉沉寂，炉火已熄万载，炉壁隐现阴阳二气
  - 殿前石碑刻「道可道，非常道」，道韵如天河倒悬

老子道痕显化虚空：
  “玄都非俗地，八景自洞天。非持经悟道者，不入此门！”
`;

        // 有残页但未触发传承的分支
        const failedEntryMsg = ` 
【道痕反噬｜阴阳逆乱】
道德经残页引动宫门阵纹，八景宫门裂开一线！
骤变突生：
  - 炼丹炉阴阳二气化太极图，镇断时空长河
  - 老子道音如雷：“道不可轻传，法不授二主！”
  - 逆转之力将你推出玄都洞天，宫门闭合刹那...
    炉壁「一气化三清」五字道文如星湮灭
`;

        // 功法已被习得的剧情[4](@ref)
        const gongfaTakenMsg = ` 
【道韵已逝｜传承有主】
道德经残页绽放清光，宫门轰然洞开！
殿内景象：
  - 紫气氤氲中，老子炼丹炉道纹黯淡
  - 炉壁「一气化三清」刻痕正化为飞灰
  - 虚空传来叹息：
    “后来者...此术已择主，大道唯一，不可复刻矣！”
`;

        // 成功获取功法的剧情[3,4](@ref)
        const successMsg = ` 
【道衍三生｜一气贯鸿蒙】
道德经残页化作流光，八景宫阵眼洞开！
老子炼丹炉轰鸣震动，炉壁《道德经》全文显化洪荒星图：
  ■ 一道清气破炉而出，分化三尊道身：
    玉清执拂尘，演化开天辟地之象
    上清持经卷，阐述宇宙生灭至理
    太清握古剑，斩断时空命运长河
  ■ 三道身影结印长吟：
    “道生一，一生二，二生三，三生万物！”

清气贯入你紫府道基，周天星辰为之共鸣...
▶ 无上秘术【一气化三清】已烙印神魂！
`;

        // 逻辑分支重组
        let eventMsg = [];
        if (!hasDaoDeJing) {
            eventMsg.push(noEntryMsg);
        } else {
            if (isGongfaLearned) {
                eventMsg.push(gongfaTakenMsg);
            } else if (Math.random() < successRate) {
                eventMsg.push(successMsg);
                // 添加功法并公告
                player.学习的功法.push('一气化三清');
                await e.reply(`【紫气浩荡·道衍诸天】${player.name}于八景宫得老子传承，周天星辰共贺！`);
            } else {
                eventMsg.push(failedEntryMsg);
            }
            // 统一消耗道具[7](@ref)
            await Add_najie_thing(usr_qq, "道德经残页", "道具", -1);
            eventMsg.push(`> 消耗「道德经残页」×1`);
        }

        // 保存数据并发送消息
        await Write_player(usr_qq, player);
        const finalMsg = eventMsg.join('\n');
        if (action.group_id) {
            await Bot.pickGroup(action.group_id).sendMsg([segment.at(usr_qq), finalMsg]);
        } else {
            await common.relpyPrivate(usr_qq, finalMsg);
        }

    } catch (err) {
        console.error("八景宫事件异常:", err);
        await common.reply(e, "周天星辰紊乱！推演中断");
    }
}
               // 万龙巢探索事件 - 万龙古经与龙皇印获取
    if (weizhi.name === "万龙巢") {
        // 检查玩家是否为妖体
        if (player.灵根.type === "妖体") {
            let random = Math.random();
            
            if (random < 0.05) { // 15%概率获得万龙古经
                // 检查全服是否已有人习得万龙古经
                const isLearned = await checkGongfaInServer('万龙古经');
                
                if (isLearned) {
                    last_msg += '万龙巢深处，太古王族的威压如渊似海。你体内妖血沸腾，引动龙气共鸣。忽闻一声龙吟："皇经已归真龙主，妖血何敢窥天机？"万道龙气化作枷锁将你震退！';
                } else {
                    last_msg += '万龙巢中龙气翻涌，你体内妖血与太古龙气共鸣！虚空裂开，一道混沌龙影显化："妖血通玄，可承吾道！"万道龙纹化作《万龙古经》没入你识海！';
                    
                    // 直接学习功法
                    player.学习的功法 = player.学习的功法 || [];
                    if (!player.学习的功法.includes('万龙古经')) {
                        player.学习的功法.push('万龙古经');
                        await Write_player(usr_qq, player);
                    }
                }
            } else if (random < 0.3) { // 15%概率获得龙皇印
                last_msg += '万龙巢深处，太古龙皇虚影显化！龙目如日月："妖体通灵，可传吾术！"一道龙皇印记烙入你眉心，龙皇印秘术已成！';
                
                // 直接学习功法
                player.学习的功法 = player.学习的功法 || [];
                if (!player.学习的功法.includes('龙皇印')) {
                    player.学习的功法.push('龙皇印');
                    await Write_player(usr_qq, player);
                }
            } else {
                // 70%概率触发其他事件
                const events = [
                    `龙巢深处，太古王族的气息如渊似海。你体内妖血翻涌，引动万龙共鸣！一道苍老龙吟响彻："妖体未纯，难承皇道！"龙气化作天刀斩落，你吐血倒飞！`,
                    `万龙巢中混沌气弥漫，你妖体发光，试图沟通太古龙皇道痕。忽闻一声冷哼："区区小妖，也敢觊觎皇术？"一道龙尾虚影将你抽飞！`,
                    `你盘坐龙气泉眼，妖血与龙气交融。虚空突然裂开，一只龙爪探出："妖血通玄，赐你造化！"三滴真龙精血没入你体内！`,
                    `万龙巢震动，太古王族即将苏醒！你妖体发光，化作一道血光遁走，身后传来震天龙吟："妖血小辈，下次必取你神魂祭旗！"`
                ];
                last_msg += events[Math.floor(Math.random() * events.length)];
                
                // 30%概率获得真龙精血
                if (Math.random() < 0.3) {
                    await Add_najie_thing(player_id, '真龙精血', '神药', 1);
                }
            }
        } else {
            // 非妖体玩家
            last_msg += '万龙巢龙气冲天，太古王族的威压令你寸步难行！一道苍老龙吟响彻："人族蝼蚁，也敢窥视龙皇道统？"你被龙威震得口吐鲜血！';
        }
    }
            if ((player.灵根.type === "圆环之理" ||player.灵根.type === "圣体道胎" ||player.灵根.type === "圣体" || player.灵根.type === "小成圣体" || player.灵根.type === "大成圣体"||player.灵根.type === "神慧者") && weizhi.name === "荒古禁地") {
              let random = Math.random();
              // 根据玩家的幸运值调整概率
              let adjustedProbability = random < player.幸运 ? random * player.幸运 : random;
          
              // 不死神泉的概率判断
              if (adjustedProbability < 0.005) {
                last_msg += ' 你在五色祭坛处发现了九条散发着恐怖气息的真龙遗骸拖着一副巨大的铜棺，你艰难的将它们身上的龙血取了出来，并拿走了铜棺。';
                await Add_najie_thing(player_id, '三世铜棺', '道具', 1);
                await Add_najie_thing(player_id, '真龙之血', '丹药', 1);
              }
                // 不死神泉的概率判断
               if (adjustedProbability < 0.015) {
                last_msg += ' 你偶然发现了一株悟道古茶树幼苗，它成熟后的茶叶能够帮助修士悟道。';
                await Add_najie_thing(player_id, '悟道古茶树幼苗', '草药', 1);
              }
              // 悟道古茶树的概率判断
              if (adjustedProbability < 0.025 && adjustedProbability >= 0.02) {
                last_msg += ' 在一片神秘的圣山之中，你摘得了一枚圣山神果，它蕴含着强大的力量，似乎服用后能令人脱胎换骨。';
                await Add_najie_thing(player_id, '圣山神果', '丹药', 1);
              }
          
              // 圣山神果的概率判断
              if (adjustedProbability < 0.035 && adjustedProbability >= 0.03) {
                last_msg += ' 在荒古禁地的深处，你发现了传说中的不死神泉，它赋予了你无尽的生机，能够生死人肉白骨，甚至可以些微抵抗生命禁区的岁月侵蚀。';
                await Add_najie_thing(player_id, '不死神泉', '道具', 1);
              }
          }
                 if ((player.灵根.type === "圆环之理" ||player.灵根.type === "圣体道胎" ||player.灵根.type === "圣体" || player.灵根.type === "小成圣体" || player.灵根.type === "大成圣体"||player.灵根.type === "神慧者") && weizhi.name === "北斗星紫山") {
            let random = Math.random();
            // 根据玩家的幸运值调整概率
            let adjustedProbability = random;
            if (adjustedProbability < 0.05) {
              last_msg += ' 你无意间在紫山内部触发禁制，被传送到了一处神秘质地，在那里找到了源天师一脉最为重要的传承源天书，这本书早已在世上遗失多年，今日却被你机缘巧合下所得。';
              await Add_najie_thing(player_id, '源天书', '道具', 1);
            }
           if (adjustedProbability < 0.001) {
                  // 检查全服是否已有人习得斗字秘
                  const isLearned = await checkGongfaInServer('斗字秘');
                  
                  if (isLearned) {
                      last_msg += ' 你在紫山深处找到了几千年前被困在此地快要油尽灯枯的神王姜太虚。他感知到斗字秘真谛已被他人参透，长叹一声："九秘归源，唯此一道..."';
                  } else {
                      last_msg += ' 你在紫山深处找到了几千年前被困在此地快要油尽灯枯的神王姜太虚，奈何此处的禁制太过可怕，你有心想救出这位神王却也无奈，他不忍心斗字秘在自己手上失传，于是化出神念传授于你。';
                      player.学习的功法 = player.学习的功法 || [];
                                  player.学习的功法.push('斗字秘');
                                  await Write_player(usr_qq, player);
                  }
              }
          }
           // 在荒古禁地探索事件中添加行字秘唯一性检查和天资要求
                if (player.power_place == 2) {
                    let random = Math.random();
                    // 根据玩家的幸运值调整概率
                    let adjustedProbability = random ;
                    
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
                    // 最低要求天资等级索引（天纵之资，索引4）
                    const minAptitudeIndex = 4;
                     const tianxuanbufa = await checkGongfaInServer('天璇步法');
                             // 只有天资达到天纵之资及以上才可能触发
                    if (currentAptitudeIndex >= minAptitudeIndex&&!tianxuanbufa) {
                        // 概率调整：天资越高，概率越大
                        const aptitudeBonus = (currentAptitudeIndex - 3) * 0.025;
                        const finalProbability = 0.002 + aptitudeBonus; // 基础概率0.001 + 天资加成
                        
                        if (adjustedProbability < finalProbability) {
                            // 检查全服是否已有人习得行字秘
                            const isLearned = await checkGongfaInServer('天璇步法');
                           
 
                            if (isLearned) {
                                last_msg += ' 你在荒古禁地深处遇见一位疯疯癫癫的老人，他步履蹒跚却一步踏出便横跨万里。';
                                last_msg += ' 你欲上前请教，他却摇头叹息："天璇步法已传他人，此道残缺，九秘归一..."';
                                last_msg += ' 言罢，他身形一晃，化作一道流光消失在宇宙深处，只留下你独自怅然。';
                            } else {
                                last_msg += ' 你在荒古禁地深处遇见一位疯疯癫癫的老人，他步履蹒跚却一步踏出便横跨万里。';
                                
                                // 根据天资等级显示不同文案
                                if (currentAptitudeIndex >= 7) { // 万古无双及以上
                                    last_msg += ' 老疯子浑浊的眸子突然清明："万古岁月，竟有如此天资！此秘术当传于你！"';
                                    last_msg += ' 他一步踏出，时空扭曲，直接出现在你面前，一指轻点你的眉心。';
                                } else if (currentAptitudeIndex >= 5) { // 旷世奇才及以上
                                    last_msg += ' 老疯子停下脚步，眼中闪过一丝惊讶："如此天资，倒也有资格承我衣钵..."';
                                    last_msg += ' 他隔空一指，一道神光没入你的识海。';
                                } else { // 天纵之资
                                    last_msg += ' 老疯子突然停下脚步，浑浊的眸子中闪过一丝清明："岁月悠悠，大道独行...此秘术当传于有缘人！"';
                                    last_msg += ' 他伸出一指，点向你的眉心。';
                                }
                                
                                last_msg += ' 刹那间，残缺的九秘真谛涌入识海！';
                                last_msg += ' 「天璇步法」——脱胎自行字秘的无上极速残篇，踏光阴、缩山河，一步踏出星月倒转！';
                                last_msg += ' 待你回神，老人已化流光遁入宇宙，唯留残缺行字秘之道韵在神魂中流转不息。';
                               player.学习的功法.push('天璇步法');
                                await Write_player(usr_qq, player);
                            }
                        }
                    } else {
                        // 天资不足的提示 - 当索引小于4时显示
                        if (adjustedProbability < 0.01) { // 较低概率提示
                         last_msg += ' 你感知到一缕涉及时空的残缺道韵，似为某位存在遗留的步法痕迹...';
                         last_msg += ' 然其玄奥远超你当前境界，天资不足难以参透。（需「天纵之资」以上方可领悟天璇步法）';
                        }
                    }
                }
                if (weizhi.name == '荧惑古星' && Math.random()< 0.1 && player.火星圣体道痕 !== 1) {
                    player.火星圣体道痕 = 1;
                    await Write_player(usr_qq, player);
                    last_msg += ' 你在荧惑古星的残骸深处，踏足一座尘封的五色祭坛。祭坛斑驳，铭刻着太古的星图，中央一道微弱的火星圣体道痕苏醒，没入你的苦海，低语着圣体一脉的宿命与终极法门的召唤。';
                }
                if (weizhi.name === "霸体祖星") {
    // 检查触发条件
    const isMinorBati = player.灵根.type === "小成霸体";
    const hasNotBeenBaptized = !player.霸体祖星洗礼;
    
    if (isMinorBati && hasNotBeenBaptized) {
        // 构建辰东风格文案
        let eventMsg = [];
        
        // ==== 事件开篇 ====
        eventMsg.push(` 紫气东来三万里，霸星横亘星河间！`);
        eventMsg.push(`你踏上霸体祖星，顿时感到血脉沸腾，紫色血气不受控制地冲天而起，`);
        eventMsg.push(`与整颗古星共鸣，惊动了沉睡在祖地深处的古老存在...`);
        eventMsg.push(``);
        
        // ==== 年迈霸体现身 ====
        eventMsg.push(` 祖地深处，一道枯槁身影缓缓走出，虽气血衰败如残烛，`);
        eventMsg.push(`但那双眸子却如紫色星辰般璀璨，透出睥睨天下的霸气！`);
        eventMsg.push(`"多少万年了...终于等到一个像样的后辈..."苍老的声音震动虚空，`);
        eventMsg.push(`"吾乃霸体一脉第七代传人，苟延残喘至今，只为守护祖地传承..."`);
        eventMsg.push(``);
        
        // ==== 传功过程 ====
        eventMsg.push(` 老者突然出手，一指洞穿虚空，紫色血气化作九条真龙，`);
        eventMsg.push(`直贯你的仙台！"接吾最后一滴霸血精华！"`);
        eventMsg.push(`刹那间，你体内霸血沸腾如海，紫色神光冲破云霄，`);
        eventMsg.push(`整颗霸体祖星都在震颤，万道法则哀鸣！`);
        eventMsg.push(``);
        eventMsg.push(` 苦海中紫浪滔天，轮海秘境自主演化，`);
        eventMsg.push(`道宫五脏齐鸣，四极通天彻地，化龙脊柱铮铮作响！`);
        eventMsg.push(`"这便是...真正的霸体本源么？"你感受到前所未有的力量在体内奔涌。`);
        eventMsg.push(``);
        
        // ==== 祖地洗礼指引 ====
        eventMsg.push(` 老者身形愈发虚幻，却目光如炬："这点精华只够引路，`);
        eventMsg.push(`真正的造化在祖地最深处——霸血祖池！"`);
        eventMsg.push(`他指向星空中一条紫色古路："踏上这条先祖血路，`);
        eventMsg.push(`接受万古霸血的洗礼，方成真正的大成霸体！"`);
        eventMsg.push(``);
        eventMsg.push(` 话音未落，老者身影化作点点紫光消散，`);
        eventMsg.push(`唯留一道神念烙印在你识海："莫负霸体之名...护我人族星域..."`);
        eventMsg.push(``);
        
        // ==== 洗礼完成 ====
        eventMsg.push(` 你遵循指引，踏上紫色古路，来到霸血祖池前。`);
        eventMsg.push(`池中紫色神液沸腾，万古霸血精华凝聚，`);
        eventMsg.push(`你一踏入其中，顿时感到浑身血肉重组，骨骼重塑！`);
        eventMsg.push(``);
        eventMsg.push(` 紫色血气化作真龙、神凰、麒麟等九大异象，`);
        eventMsg.push(`环绕祖池飞舞，整片星空都被映照成紫色！`);
        eventMsg.push(`"啊——"你忍不住长啸，声震九霄，`);
        eventMsg.push(`霸体本源在这一刻彻底觉醒，真正的小成霸体就此诞生！`);
        eventMsg.push(``);
        
        // ==== 结局 ====
        eventMsg.push(` 【霸体祖星洗礼完成】`);
        eventMsg.push(`你感受到体内流淌着最纯粹的霸血，`);
        eventMsg.push(`举手投足间可碎星辰，紫色血气贯穿古今未来！`);
        eventMsg.push(`那位逝去的先祖，将他最后的精华与期望，都传承给了你...`);
        
        // 更新玩家状态
        player.霸体祖星洗礼 = 1;
        player.攻击加成 += 5000000000; 
        player.防御加成 += 5000000000; 
        player.生命加成 += 5000000000; 
        player.修为 += 50000000; // 增加修为
        player.血气 += 50000000; // 增加修为
        player.道伤 = 0;
        // 解锁霸体专属能力
        if (!player.学习的功法.includes("苍穹霸印")) {
            player.学习的功法.push("苍穹霸印");
        }
        if (!player.学习的功法.includes("霸血焚天诀")) {
            player.学习的功法.push("霸血焚天诀");
        }
        
        // 保存玩家数据
        await Write_player(usr_qq, player);
        
        // 合并消息数组为字符串
        const finalMsg = eventMsg.join('\n');
        
        // ==== 消息推送 ====
        if (e.isGroup) {
            // 群聊消息
            await Bot.pickGroup(e.group_id).sendMsg([
                segment.at(usr_qq),
                finalMsg
            ]);
        } else {
            // 私聊消息
            await common.relpyPrivate(usr_qq, finalMsg);
        }
    } else if (!isMinorBati) {
        last_msg += ' 你来霸体祖星深处，忽然法则轰鸣，紫色血气如天渊般将你拒之门外：非霸体血脉，不得入内！';
    } else if (player.霸体祖星洗礼) {
        last_msg += ' 你已接受过霸血祖池洗礼，祖地深处只余那位先祖的淡淡回音：莫负霸体之名...!';
    }
}
                if (weizhi.name === "圣崖") {
                    // 严苛的前置条件检查
                    const isMatureSaintBody = ["小成圣体", "大成圣体"].includes(player.灵根.type);
                    const hasMarsAltar =  player.火星圣体道痕 == 1;// 前置引子：已触发荧惑古星事件
                    
                    const hasPutiSeed = await exist_najie_thing(usr_qq, "菩提子", "道具");
                
                    // 全服唯一性检查
                    const isUltimateTechniqueLearned = await checkGongfaInServer('终极圣体秘术');
                
                    if (isMatureSaintBody && hasMarsAltar  && hasPutiSeed && !isUltimateTechniqueLearned) {
                        let random = Math.random();

                        if (random < 0.95) { // 基础概率极低，彰显珍贵
                let shengtimsg ="";
                // ==== 辰东风格传承文案（精简版）====
                shengtimsg += `圣崖之巅，终极传承现！你苦海中的火星圣体道痕与山巅大成圣体残尸共鸣，引动封神榜剧震，帝威如海！`;
                shengtimsg += `东荒天道交感，垂落无尽秩序神链集纳于虚空。四灵显化，铺就横贯星域的金光大道！火星圣体神祇念借来前世道果，再现君临天下的无上风采！`;
                shengtimsg += `"圣体传承断绝了吗？"悲怆道音跨越时空传来。"横扫了九天十地，逆转了天地轮回，无敌天上地下又如何？看故友红颜尽化黄土，唯我独存不朽..."神祇念黯然叹息。`;
                shengtimsg += `"此乃圣体一脉真正的无敌资本，莫令蒙尘。"他一指洞穿虚空，将《终极圣体秘术》打入你的仙台！`;
                shengtimsg += `无数奥义如星河倒卷，冲刷你的神识。待你回神，那道悲凉身影已一步迈出，径直朝着生命禁区而去，继续未尽的征战...`;
                            // 学习功法
                            player.学习的功法.push('终极圣体秘术');
                            await Write_player(usr_qq, player);
                                       // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    shengtimsg
                ]);
            } else {
                await common.relpyPrivate(usr_qq, shengtimsg);
            }
                        } else {
                            // 概率触发但未获得的感悟
                            last_msg += ` 你手握菩提子，隐约感应到圣崖之巅与荧惑古星间存在着一条由圣血铺就的无形古路，一道悲凉的目光似乎跨越星海注视着你...（机缘未至，或可尝试提升天资以加深感应）`;
                        }
                    } else if (isMatureSaintBody && !isUltimateTechniqueLearned) {
                        // 条件不足的提示
                        if (!hasMarsAltar) {
                            last_msg += ` 你感到圣崖的大成圣体残尸内蕴藏着惊天奥秘，却缺乏关键引子，难以窥其门径。（提示：或与荧惑古星的秘密有关）`;
                        } else if (!hasPutiSeed) {
                            last_msg += ` 圣血轰鸣，道痕隐现，然仙台混沌，灵光难明。（需「菩提子」助你悟道，沟通火星圣体道痕）`;
                        } else if (isUltimateTechniqueLearned) {
                            last_msg += ` 你触及圣崖奥秘的瞬间，一道威严的道音震响：“大道唯一，此法已择主，后来者止步！” 终极圣体秘术的传承已被人捷足先登。`;
                        }
                    }
                }
                // 圣崖探索事件 - 菩提子感悟行字秘
 if (weizhi.name === "圣崖") {
     let putizi = await exist_najie_thing(usr_qq, "菩提子", "道具");
     
     if (putizi && putizi >= 1) { // 持有菩提子方可触发
         let random = Math.random();
         // 天资越高触发概率越大（万古无双+5%，旷世奇才+3%）
         const aptitudeBonus = player.天资等级 === "万古无双" ? 0.05 : 
                              player.天资等级 === "旷世奇才" ? 0.03 : 0;
         const baseProbability = 0.02; // 基础概率2%
         
         if (random < baseProbability + aptitudeBonus) {
             // 检查全服是否已有人习得行字秘
             const isLearned = await checkGongfaInServer('行字秘');
             
             // ==== 辰东风格文案 - 分三层意境构建 ====
             last_msg += '圣崖之巅，封神榜金光刺破九重冥雾，映照出山体上干涸的圣血。';
             
             if (isLearned) {
                 last_msg += '你掌中菩提子忽生感应，引动崖顶帝阵轰鸣！一道跨越时空的叹息响彻云霄：';
                 last_msg += '"行字秘踏光阴逆岁月，然大道唯一...此路已绝！"';
                 last_msg += '封神榜骤然迸发亿万缕帝威，将时空道痕彻底碾碎！';
             } else {
                 last_msg += '菩提子突绽混沌清辉，与山巅圣血共鸣！封神榜隆隆作响，竟显化出一条金光大道直通虚空。';
                 
                 // 天资分级文案
                 if (player.天资等级 === "万古无双") {
                     last_msg += '大成圣体残念自血痕中复苏："菩提明心，圣血为引...此子当承极速真谛！"';
                     last_msg += '枯寂的圣崖骤然浮现光阴长河，他脚踏星骸而来，一指洞穿时空！';
                 } else if (player.天资等级 === "旷世奇才") {
                     last_msg += '虚空裂开，老疯子身影踏光阴而至："菩提照前路，可窥行秘一角！"';
                     last_msg += '他双手撕开无始阵纹，将镇压万古的时空道痕接引入你识海！';
                 } else {
                     last_msg += '菩提道韵勾动圣尸棺椁，绿毛古棺剧震！棺盖缝隙迸射仙光，残缺的九秘真义如天河倒卷。';
                 }
                 
                 last_msg += '霎时天地失色！';
                 last_msg += '「行」字秘奥义化作光阴洪流冲霄而起：';
                 last_msg += '一步踏出，山河倒转；二步踏出，星月成灰；三步踏出，万古皆在脚下！';
                 last_msg += '待神光散尽，唯见菩提子表面多了一道横跨星域的刻痕...';
                 
                 // 功法学习（唯一性）
                  await Reduse_player_学习功法(player_id, '天璇步法');
                               player.学习的功法.push('行字秘');
                                await Write_player(usr_qq, player);
             }
         } else {
             // 未触发时的道韵感悟
             last_msg += '菩提子映照封神榜金光，隐约窥见一道身影脚踏星骸、逆溯光阴长河。';
             last_msg += '然无始阵纹骤然轰鸣，将时空道痕彻底封锁！唯留一句道喝回荡：';
             last_msg += '"未历圣血染苍穹，何谈极速破万古？"';
         }
     } else {
         // 无菩提子提示
         last_msg += '圣崖之巅，封神榜垂落亿万缕帝威。';
         last_msg += '你隐约感知到棺椁中蕴藏着涉及时空的奥义，却如雾里看花终隔一层。';
         last_msg += '（需「菩提子」为引方有机会参悟）';
     }
 }
 if (weizhi.name === "圣崖") {
    if (player.mijinglevel_id < 12 && player.xiangulevel_id < 12 && Math.random() < 0.4) {
        try {
            // ==== 辰东风格文案 - 分三层意境 ====
            let penaltyMsg = [
                '【大帝阵纹·圣崖惊变】',
                '你踏入圣崖核心区域，忽感天地倒悬！',
                '封神榜骤然迸发亿万缕帝威，',
                '山体上无始大帝刻下的阵纹复苏：',
                '一道金光扫过，护体法宝尽碎',
                '二道帝纹绞杀，肉身龟裂血染圣崖',
                '三道封神榜垂落，元神几近崩散',
                '「大帝阵纹，非圣不可触！」',
                '虚空中响起无始大帝的道喝：',
                '"圣崖葬圣躯，岂容凡躯亵渎！"',
                '你燃烧精血施展禁忌遁术：',
                '折损三件秘宝（随机丢失三样纳戒物品）',
                '自斩三成道基（修为血气减少30%）',
                '仍被一缕帝威侵入紫府，留下大道暗伤（道伤+1）',
                '劫后余生的你回望圣崖：',
                '封神榜猎猎作响，圣血在阵纹中流淌',
                '山巅传来大成圣体残念的叹息：',
                '"未成圣...莫踏帝阵..."'
            ].join('\n');

            // 执行基础惩罚
            player.道伤 += 1;
            player.修为 *= 0.7;
            player.血气 *= 0.7;
            // 检查道伤是否加剧
            let daoShangMsg = ''; // 单独存储道伤加剧的消息
            if (player.道伤 > 1) {
                daoShangMsg = [
                    '\n\n【道伤加剧·道基崩解】',
                    '你原本的道伤在帝威冲击下骤然恶化！',
                    '紫府中大道根基寸寸崩裂，',
                    '体内道则秩序链纷纷断裂：',
                    '「噗——」一口道血喷出，染红圣崖石壁',
                    '境界跌落！肉身衰败！秘境崩塌！仙古道痕消散！',
                    '虚空中回荡着无始大帝的叹息：',
                    '"道基崩解，仙路已断..."',
                    '你以残存道力护住本源，',
                    '勉强保住最后一丝根基（等级不会低于1级）',
                    '但道伤已深入骨髓，仙路艰难...'
                ].join('\n');
                
                // 定义需要惩罚的属性列表
                const levelProperties = [
                    'level_id', 
                    'Physique_id', 
                    'mijinglevel_id', 
                    'xiangulevel_id'
                ];
                
                // 对每个属性随机扣除1-3级（不低于1级）
                levelProperties.forEach(prop => {
                    if (player[prop] > 1) {
                        const reduction = Math.floor(Math.random() * 3) + 1; // 随机1-3
                        const newLevel = Math.max(1, player[prop] - reduction);
                        daoShangMsg += `\n${getPropertyName(prop)}: ${player[prop]} → ${newLevel} (跌落${reduction}级)`;
                        player[prop] = newLevel;
                    }
                });
            } else {
                // 基础惩罚（每个等级扣除1级，不低于1级）
                player.level_id = Math.max(1, player.level_id - 1);
                player.Physique_id = Math.max(1, player.Physique_id - 1);
                player.mijinglevel_id = Math.max(1, player.mijinglevel_id - 1);
                player.xiangulevel_id = Math.max(1, player.xiangulevel_id - 1);
            }
            
            // 合并消息
            penaltyMsg += daoShangMsg;
            
            await Write_player(usr_qq, player);
            // ==== 纳戒物品损失逻辑（基于过去身暴露事件优化）====
            const najie = await Read_najie(usr_qq);
            let lostItems = [];
            const itemCategories = ["丹药", "道具","盒子","仙宠口粮", "功法", "草药", "材料"];

            // 随机选择1-4个受影响分类（增强随机性）
            const affectedCategories = [...itemCategories]
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 4) + 1);

            // 处理每个受影响分类
            for (const category of affectedCategories) {
                const categoryItems = najie[category] || [];
                if (!categoryItems.length) continue;

                // 随机选择1-3件物品
                const itemsToAffect = [...categoryItems]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, Math.floor(Math.random() * 3) + 1);

                for (const item of itemsToAffect) {
                    const currentQuantity = await exist_najie_thing(usr_qq, item.name, category);
                    if (currentQuantity <= 0) continue;

                    // 损失比例10%-50%（至少1个）
                    const lostAmount = Math.max(1, Math.floor(
                        currentQuantity * (0.1 + Math.random() * 0.4)
                    ));
                    const actualLost = Math.min(lostAmount, currentQuantity);

                    await Add_najie_thing(usr_qq, item.name, category, -actualLost);
                    lostItems.push({
                        name: item.name,
                        quantity: actualLost,
                        category
                    });
                }
            }

            // 添加损失物品到消息
            if (lostItems.length > 0) {
                penaltyMsg += `\n损失物品：${
                    lostItems.map(item => `${item.name} x${item.quantity}`).join('，')
                }`;
            } else {
                penaltyMsg += `\n※ 纳戒空间震荡但未丢失物品`;
            }

            // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg);
            }
            
        } catch (err) {
            console.error("圣崖事件处理失败:", err);
            // 错误处理（避免崩溃）
            await common.relpyPrivate(usr_qq, "帝阵反噬过强，天机紊乱！请稍后再试");
        }
    }
}
if (weizhi.name === "北斗星紫山") {
    if (player.mijinglevel_id < 12 && player.xiangulevel_id < 12&& Math.random() < 0.4) {
        try {
            // 三重惩罚
            player.当前血量 *= 0.5; // 血量减半
            player.修为 *= 0.7;    // 修为损失30%
            player.道伤 += 2;      // 双重道伤

            // 文案
            const penaltyMsg = [
                '【紫山·帝阵绞杀】',
                '你靠近紫山，封神榜骤然绽放仙光！',
                '无始钟声震碎山河：',
                '"咚——"',
                '帝阵复苏，一道仙光削去你半条性命',
                '太古王族的诅咒侵入道基：',
                '「呃啊！」七窍流血，修为暴跌',
                '山体裂开缝隙，伸出苍白巨手：',
                '"人族...成为我等血食..."',
                '你祭出禁器自爆才挣脱束缚',
                '逃出百里回望：',
                '紫山云雾缭绕，钟声余韵未绝',
                '（道伤+2，精血亏损）'
            ].join('\n');



            await Write_player(usr_qq, player);
            // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg);
            }
            
        } catch (err) {
            console.error("紫山事件处理失败:", err);
            await common.reply(e, "无始钟波扰乱天机！推演失败");
        }
    }
}

if (weizhi.name === "荒古禁地") {
    if (player.mijinglevel_id < 12&& player.xiangulevel_id < 12 && Math.random() < 0.4) {
        try {
            // 基础惩罚
            const ageIncrease =  Math.floor(Math.random() * player.寿元); // 增加10-30岁
            player.寿元 -= ageIncrease;
            player.level_id = Math.max(1, player.level_id - 1); // 境界跌落1级

            // 文案
            let penaltyMsg = [
                '【荒古禁地·时间牢笼】',
                '你踏入禁地外围，瞬间被时间之力笼罩！',
                '青丝变白发，容颜顷刻衰老：',
                `寿元削减${ageIncrease}载！`,
                '一道白衣荒奴从深渊浮现，',
                '抬手间削去你一层境界！',
                '你祭出法宝抵挡，道器在时间侵蚀下化为飞灰',
                '燃烧本源精血才逃出禁地...',
                '回望深渊，九座圣山在雾霭中若隐若现'
            ].join('\n');

            // 30%概率重伤（道伤+1）
            if (Math.random() < 0.3) {
                player.道伤 += 1;
                penaltyMsg += '\n道躯被时间道则侵蚀（道伤+1）';
            }

            await Write_player(usr_qq, player);
            // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg);
            }
            
        } catch (err) {
            console.error("荒古禁地事件处理失败:", err);
            await common.reply(e, "时间道则反噬！推演中断");
        }
    }
}
if (weizhi.name === "太初古矿") {
    if (player.mijinglevel_id < 12&& player.xiangulevel_id < 12&& Math.random() < 0.4) {
        try {
            // 基础惩罚
            const lostPercent = 0.4 + Math.random() * 0.3; // 流失40%-70%修为和血气
            player.修为 *= (1 - lostPercent);
            player.血气 *= (1 - lostPercent);
            player.道伤 += 1;

            // 文案
            let penaltyMsg = [
                '【太初古矿·生命禁区】',
                '你踏入太初古矿边缘，忽觉天地倒转！',
                '矿脉中弥漫的混沌雾气吞噬你的生命精气：',
                '「呃啊——」你感到修为飞速流逝',
                '太古生物的低语在矿洞中回荡：',
                '"人族...血食..."',
                '一道黑影掠过，利爪撕裂你的道躯：',
                `修为流失${(lostPercent*100).toFixed(0)}%，血气枯竭`,
                '道基受损（道伤+1）',
                '你燃烧精血逃出古矿，回望时：',
                '矿洞深处亮起无数猩红眼眸...'
            ].join('\n');

            // 随机丢失物品（30%概率）
            if (Math.random() < 0.3) {
                const najie = await Read_najie(usr_qq);
                const categories = Object.keys(najie).filter(cat => najie[cat]?.length > 0);
                if (categories.length > 0) {
                    const randCat = categories[Math.floor(Math.random() * categories.length)];
                    const items = najie[randCat];
                    const lostItem = items[Math.floor(Math.random() * items.length)];
                    const lostQty = Math.min(lostItem.数量, Math.floor(Math.random() * 5) + 1);
                    
                    await Add_najie_thing(usr_qq, lostItem.name, randCat, -lostQty);
                    penaltyMsg += `\n逃遁中遗失：${lostItem.name}×${lostQty}`;
                }
            }

            await Write_player(usr_qq, player);
             // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg);
            }
            
        } catch (err) {
            console.error("太初古矿事件处理失败:", err);
            await common.reply(e, "太初之气紊乱！推演失败");
        }
    }
}
if (weizhi.name === "石国皇都") {
    if (player.mijinglevel_id < 12 && player.xiangulevel_id < 12 && Math.random() < 0.4) {
        try {
            let penaltyMsg = [];
            let obtainedBone = false;
            
            // 基础惩罚
            const lostPercent = 0.3 + Math.random() * 0.3; // 流失30%-60%修为和血气
            player.修为 *= (1 - lostPercent);
            player.血气 *= (1 - lostPercent);
            player.道伤 += 1;

            // 10%概率获得万灵图残骨一
            if (Math.random() < 0.1) {
                await Add_najie_thing(usr_qq, "万灵图残骨一", "材料", 1);
                obtainedBone = true;
            }

            // 文案
            penaltyMsg.push(
                '【皇都风云·拍卖风波】',
                '你踏入石国皇都拍卖场，欲竞拍万灵图残骨一',
            );
            
            if (obtainedBone) {
                penaltyMsg.push(
                    '竞价至白热化时，你灵机一动：',
                    '暗中施展秘术替换了拍卖品！',
                    '成功获取万灵图残骨一！',
                    '但被武王府强者察觉：',
                    '"大胆贼子！竟敢在皇都行窃！"',
                    '一道皇道龙气击中后背：',
                    `修为流失${(lostPercent*100).toFixed(0)}%，血气枯竭`,
                    '道基受损（道伤+1）',
                    '你燃烧精血遁出皇都，怀中紧握残骨',
                    '石昊在城头带着赞许的眼神望着你："有点意思..."'
                );
            } else {
                penaltyMsg.push(
                    '竞价至白热化时，一股恐怖威压降临：',
                    '"哼！区区蝼蚁也敢觊觎人皇秘宝？"',
                    '武王府强者现身，一掌拍碎拍卖台：',
                    '「噗——」你被皇道龙气震飞，口吐鲜血',
                    `修为流失${(lostPercent*100).toFixed(0)}%，血气枯竭`,
                    '石皇虚影浮现，声如洪钟：',
                    '"皇都重地，岂容宵小放肆！"',
                    '一道人皇印余波扫过，道基受损（道伤+1）',
                    '你仓皇逃出皇都，回望城楼：',
                    '武王府旌旗猎猎，混乱中你瞥见石昊的身影，他正若有所思地看着这场闹剧'
                );
            }

            await Write_player(usr_qq, player);
            // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg.join('\n')
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg.join('\n'));
            }
            
        } catch (err) {
            console.error("石国皇都事件处理失败:", err);
            await common.reply(e, "人皇威压扰乱天机！推演失败");
        }
    }
}
if (weizhi.name === "西陵界") {
    if (player.mijinglevel_id < 12 && player.xiangulevel_id < 12 && Math.random() < 0.4) {
        try {
            let penaltyMsg = [];
            let obtainedBone = false;
            
            // 基础惩罚
            const hpLoss = player.当前血量 * (0.4 + Math.random() * 0.3); // 损失40%-70%血量
            player.当前血量 -= hpLoss;
            player.道伤 += 2; // 双重道伤

            // 15%概率获得万灵图残骨三（西陵界更危险但机会更大）
            if (Math.random() < 0.15) {
                await Add_najie_thing(usr_qq, "万灵图残骨三", "材料", 1);
                obtainedBone = true;
            }

            // 文案
            penaltyMsg.push(
                '【西陵惊魂·葬士苏醒】',
                '你潜入西陵界深处，欲寻万灵图残骨三',
            );
            
            if (obtainedBone) {
                penaltyMsg.push(
                    '在葬土深处，你发现万灵图残骨三！',
                    '但触碰瞬间，葬士苏醒：',
                    '"亵渎葬地者，永世为奴！"',
                    '枯爪撕裂虚空，你拼死抵抗：',
                    `生命精气流失${hpLoss.toFixed(0)}点！`,
                    '双重死亡诅咒侵入道基（道伤+2）',
                    '燃烧本源精血逃出葬地，',
                    '怀中紧握万灵图残骨三！',
                    '葬士在深渊咆哮："吾必上穷碧落下黄泉将你诛杀！"'
                );
            } else {
                penaltyMsg.push(
                    '阴风骤起，葬土翻涌：',
                    '"擅闯葬地者，永世为奴！"',
                    '上古葬士从棺椁中苏醒，',
                    '枯爪撕裂虚空，死亡道则侵蚀：',
                    `生命精气流失${hpLoss.toFixed(0)}点！`,
                    '你祭出法宝抵挡：',
                    '「咔嚓！」道器在葬气中化为飞灰',
                    '葬士吟诵古老葬经：',
                    '"以汝之血，祭奠诸天！"',
                    '双重死亡诅咒侵入道基（道伤+2）',
                    '燃烧精血逃出葬地，回望时：',
                    '万灵图残骨三在葬土深处闪烁幽光'
                );
            }

  

            await Write_player(usr_qq, player);
            // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg.join('\n')
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg.join('\n'));
            }
            
        } catch (err) {
            console.error("西陵界事件处理失败:", err);
            await common.reply(e, "葬地死气扰乱天机！推演失败");
        }
    }
}
if (weizhi.name === "石村") {
    // 检查是否达到搬血极境
    if (player.极境 && player.极境.includes("2")) {
        // 检查是否已经获得柳神赏识
        let hasLiushang = false;
        if (player.剧情人物 && Array.isArray(player.剧情人物)) {
            hasLiushang = player.剧情人物.some(np => np.柳神);
        }
        
        if (!hasLiushang) {
            // 首次触发柳神赏识事件
            last_msg += '你重返石村，周身血气如龙，十万八千斤神力内蕴而不发。';
            last_msg += '村口焦黑的柳树桩忽生异象，一抹嫩绿新芽破桩而出，散发出浩瀚生命精气！';
            last_msg += '虚空颤动，一道朦胧身影自柳树中显化，眸若星辰，俯瞰苍生：';
            last_msg += '"搬血极境，肉身成圣...想不到在这荒僻之地，竟有如此根基之人。"';
            last_msg += '"吾乃柳神，曾历大劫，蛰伏于此。汝既达极境，可愿承吾之道统？"';
            
            // 初始化柳神关系
            if (!player.剧情人物) {
                player.剧情人物 = [];
            }
            player.剧情人物.push({
                "柳神": 1,
                "关系": 1, // 1表示赏识关系
                "好感度": 0,
                "解锁时间": new Date().getTime(),
                "事件记录": ["搬血极境得赏识"]
            });
            
            // 额外奖励（根据原著柳神赐福）
            const rewardExp = Math.floor(player.修为 * 0.1); // 修为提升10%
            await Add_修为(usr_qq, rewardExp);
            
            last_msg += '柳神指尖轻点，一缕生命精气没入你体内，修为暴涨！';
            last_msg += `获得修为：${bigNumberTransform(rewardExp)}`;
            last_msg += '剧情人物「柳神」关系已建立，好感度：0';
            
            // 保存玩家数据
            await Write_player(usr_qq, player);
        } else {
            // 已建立关系后的互动
            const liuShen = player.剧情人物.find(np => np.柳神);
            const randomEvent = Math.random();
            
            if (randomEvent < 0.3) {
                // 柳神指点修行
                last_msg += '你于柳树下静坐，柳神虚影再现："极境非终点，大道在前方..."';
                last_msg += '柳枝轻拂，道韵流转，你对修行的理解更加深刻了';
                
                // 增加好感度
                liuShen.好感度 += 5;
                 if (liuShen.好感度>=120) {
                 const newRelationLevel = Math.min(3, Math.floor(liuShen.好感度 / 120) + 1);
                  liuShen.关系 = newRelationLevel;
                  }
                await Write_player(usr_qq, player);
            } else if (randomEvent < 0.6) {
                // 柳神讲述上古秘辛
                last_msg += '柳神声音缥缈："上古年间，大劫起于界海，仙王喋血，天地崩裂..."';
                last_msg += '你聆听上古秘辛，道心更加坚定';
                
                // 增加好感度
                liuShen.好感度 += 3;
                 if (liuShen.好感度>=120) {
                 const newRelationLevel = Math.min(3, Math.floor(liuShen.好感度 / 120) + 1);
                  liuShen.关系 = newRelationLevel;
                  }
                await Write_player(usr_qq, player);
            } else {
                // 普通问候
                last_msg += '柳树嫩芽轻轻摇曳，散发出温和的生命气息，滋养你的肉身';
            }
        }
    } else {
        // 未达搬血极境的普通石村事件
        last_msg += '石村宁静祥和，村口焦黑的柳树桩毫无生机，村民们过着朴实的生活。';
        last_msg += '老族长看着你感叹道："孩子，若你能达到传说中的极境，或许能唤醒柳神大人的一丝灵识..."';
    }
}
            if (weizhi.name != '诸神黄昏·旧神界') {
              //判断是不是旧神界
              let random = Math.random();
               if (player.灵根.type === "魔卡少女" ) {
              n += 1;
              last_msg += '你是魔卡少女，集天地万千宠爱于一身，所以在本次探索中额外获得一件奖励 ';
            }
if (player.灵根.type === "魔卡少女·觉醒") {
  n *= 2;
  last_msg += '「星之力啊，请赐予我光辉！」 ';
  last_msg += '星之杖闪耀着璀璨光芒，小樱牌的力量完全解放，奖励翻倍 ';
}

if (player.灵根.type === "魔卡少女·完全") {
  n *= 5;
  last_msg += '「所有的心，成为我的力量！」 ';
  last_msg += '梦之杖绽放出彩虹般的光辉，透明牌的力量让奖励获得五倍加成 ';
}
              if (random < player.幸运) {
                if (random < player.addluckyNo) {
                  last_msg += '福源丹生效，所以在';
                } else if (player.仙宠.type == '幸运') {
                  last_msg += '仙宠使你在探索中欧气满满，所以在';
                }
                n *= 2;
                last_msg += '本次探索中获得赐福加成 ';
              }
              if (player.islucky > 0) {
                player.islucky--;
                if (player.islucky != 0) {
                  fyd_msg = `   福源丹的效力将在${player.islucky}次探索后失效 `;
                } else {
                  fyd_msg = `   本次探索后，福源丹已失效 `;
                  player.幸运 -= player.addluckyNo;
                  player.addluckyNo = 0;
                }
                data.setData('player', player_id, player);
              }
            }
            // 条件：玩家境界>42，炼体>42，秘境<21，仙古<21，33%概率
if (player.level_id > 42 && player.Physique_id > 42 && 
    player.mijinglevel_id < 14 && player.xiangulevel_id < 14 && 
    Math.random() < 0.33) {
    
    // 计算被夺走的数量（向下取整，确保是整数）
    let jianshao = Math.floor(n * 0.5);
    
    // 确保至少保留1个
    if (n - jianshao < 1) {
        jianshao = n - 1; // 如果夺走一半后不足1个，就只保留1个
    }
    
    const stolenAmount = jianshao;
    n = n - jianshao; // 玩家实际获得的数量
    // 构建夺宝消息
    last_msg += `虚空裂开，一道黑影如鬼魅般降临！诸天道贼显化，气息如渊似狱，压得你动弹不得！`;
    last_msg += `蝼蚁也配染指此等神物？本座便替你保管了！`;
    last_msg += `黑影袖袍一卷，将你探索所得的[${stolenAmount}个${thing_name}]夺走！`;
    last_msg += `你拼死抵抗，最终保住了[${n}个${thing_name}]。`;
}
 m += `]×${n}个。`;
            let xiuwei = 0;
            //默认结算装备数
            let now_level_id;
            let now_physique_id;
            now_level_id = player.level_id;
            now_physique_id = player.Physique_id;
            //结算
            let qixue = 0;
            if (msgg.find(item => item == A_win)) {
              xiuwei = Math.trunc(
                2000 + (100 * now_level_id * now_level_id * t1 * 0.1) / 5
              );
              qixue = Math.trunc(
                2000 + 100 * now_physique_id * now_physique_id * t2 * 0.1
              );
              if (thing_name) {
                await Add_najie_thing(player_id, thing_name, thing_class, n);
              }
              last_msg += `${m},不巧撞见[${
                B_player.名号
              }],经过一番战斗，击败对手,获得修为${xiuwei},气血${qixue},剩余血量${
                A_player.当前血量 + Data_battle.A_xue
              }`;

             let random = Math.random();
                            if ( weizhi.name == '荧惑古星' && random <0.1&& player.五色祭坛 !== 1) {
          player.五色祭坛 = 1
          await Write_player(usr_qq, player);
            last_msg += '你在荧惑古星找到了一处五色祭坛，五色祭坛散发着神秘光芒，似乎可以通往其他位面';
          }
                        // 定义特殊灵根类型数组
const specialLinggenTypes = ["转生", "魔头", "命运", "天魔", "神魔体"];

// 检查玩家是否拥有特殊灵根
const hasSpecialLinggen = specialLinggenTypes.includes(player.灵根.type);
              if (random < 0.1 && hasSpecialLinggen)  {
              last_msg += `无意卷入时空漩涡，见到了初入旧神界的叶箫！他告诉你整个凡俗和修仙界是邪神设立的囚牢，现世大道已经被其污染，一定要想办法超脱出去并给了你【旧神印章】*1`;
              await Add_najie_thing(player_id, '旧神印章', '材料', 1);
              }
              if (random < 0.15 && random >= 0.1&&hasSpecialLinggen) {
              last_msg += `忽然天地摇晃，遭遇恐怖大能跨越时间长河要将你扼杀摇篮之中！关键时刻，一道巨大的拳印出现，将他打的灰飞烟灭，你暗道虚惊一场，刚要离开却发现了【仙王残魂】*1`;
              await Add_najie_thing(player_id, '仙王残魂', '材料', 1);
              }
              if ( random < 0.2 && random >= 0.16&&hasSpecialLinggen) {
             last_msg += `你仿佛梦回仙古，在仙古中你与那个时代的无数绝世天骄争雄，与他们结交，相互论道，其乐融融，但好景不长，恐怖的邪神入侵仙古，将仙古打的支离破碎，你的好友全都牺牲在那场大战中，你无力扭转这一切，心中有万般痛苦和愤怒也随着这场大梦苏醒而忘却，手中多了一道【轮回印】*1`;
             await Add_najie_thing(player_id, '轮回印', '材料', 1);
             }
              let newrandom = 0.995;
              let dy = await Read_danyao(player_id);
              newrandom -= dy.beiyong1;
              if (dy.ped > 0) {
                dy.ped--;
              } else {
                dy.beiyong1 = 0;
                dy.ped = 0;
              }
              await Write_danyao(player_id, dy);
              if (random > newrandom) {
                let length = data.xianchonkouliang.length;
                let index = Math.trunc(Math.random() * length);
                let kouliang = data.xianchonkouliang[index];
                last_msg +=
                  ' 七彩流光的神奇仙谷[' +
                  kouliang.name +
                  ']深埋在土壤中，是仙兽们的最爱。';
                await Add_najie_thing(player_id, kouliang.name, '仙宠口粮', 1);
              }
              let random_pifu= Math.random()
              if(random_pifu>0.999999){
                if(najie_random>0.5){
                  let length_najie=data.kamian.length
                  let index_najie=Math.trunc(Math.random() * length_najie);
                  let Get_najie=data.kamian[index_najie]
                  last_msg +=
                  ' 历经九九八十一难，在历练中练就出了一道玄影[' +
                  Get_najie.name +
                  ']';
                  await Add_najie_thing(player_id, Get_najie.name, '道具', 1);
                }else{
                  let length_lianqi=data.kamian3.length
                  let index_lianqi=Math.trunc(Math.random() * length_lianqi);
                  let Get_lianqi=data.kamian3[index_lianqi]
                  last_msg +=
                  ' 历经九九八十一难，在历练中练就出了一道玄影[' +
                  Get_lianqi.name +
                  ']';
                  await Add_najie_thing(player_id, Get_lianqi.name, '道具', 1);
                }
              }
                if (random < 0.001) {
    // 天资等级序列（与洗炼相同）
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
    
    // 获取当前天资位置
    const currentIndex = aptitudeSequence.indexOf(player.天资等级);
    
    // 最高提升到万古无双（限制在索引7）
    let newIndex = Math.min(currentIndex + 1, 7);
    
    // 如果已经是万古无双或更高，则不再提升
    if (currentIndex >= 7) {
        last_msg += `${B_player.名号}倒下后，你转身瞧见一位仙风道骨的老者。他目光如渊，仿佛能洞穿万古时空："小友资质已臻至境，老朽亦无可指点。"话音未落，身影已如梦幻泡影般消散。`;
        return;
    }
    
    let newAptitude = aptitudeSequence[newIndex];
    
    // 天资评价库
    const aptitudeEvaluations = {
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
    
 
last_msg += `
${B_player.名号}倒下后，你转身瞧见一位仙风道骨的老者。
他目光如渊，仿佛能洞穿万古时空："小友根骨尚可，却未脱樊笼。老朽观你与道有缘，便助你一臂之力。"
只见老者袖袍轻拂，九天星河倒悬，鸿蒙紫气自虚空裂缝奔涌而出，将你笼罩其中。
你感到浑身经脉如被重塑，识海中浮现无尽道韵，仿佛经历了万世轮回。
待光华散尽，老者身影已如梦幻泡影般消散，只余一缕道音回荡：
"万古弹指间，大梦几千秋。他日若得道，莫忘此日缘..."
天资蜕变：
原资质：『${player.天资等级}』→ 新资质：『${newAptitude}』
${aptitudeEvaluations[newAptitude]}
获得【如梦道痕】*1
`;
    
    // 更新玩家天资
    player.天资等级 = newAptitude;
    player.天资评价 = aptitudeEvaluations[newAptitude];
    await Write_player(usr_qq, player);
    
    // 添加特殊道具
    await Add_najie_thing(player_id, '如梦道痕', '道具', 1);
   
}
              if (random > 0.1 && random < 0.1002) {
                last_msg +=
                  ' ' +
                  B_player.名号 +
                  '倒下后,你正准备离开此地，看见路边草丛里有个长相奇怪的石头，顺手放进了纳戒。';
                await Add_najie_thing(player_id, '长相奇怪的小石头', '道具', 1);
              }
       if ( random < 0.005&& !player.剑云海奇遇) {
    last_msg += [
        `${B_player.名号}倒下后，你正欲离去，`,
        `忽见九天云海翻涌，一道白衣身影踏空而至！`,
        `来人剑眉星目，神姿卓绝，周身道韵流转，气息悠远如亘古星河。`,
        `他负手立于虚空，眸中带着一丝欣赏：道友天赋异禀，日后可持此令来剑云海寻我。`,
        `话音未落，一块令牌破空而来，入手温润如玉,`,
        `正面刻有"剑云海"三个道文，背面则是一柄贯穿九天的神剑图案！`,
    ].join(' ');
    player.剑云海奇遇 = true;
    await Write_player(usr_qq, player);
    await Add_najie_thing(player_id, '剑云海令牌', '道具', 1);
}
                let random2 = Math.random();
            let caoyao = '';
            if (A_player.职业 == '采药师') {
              if (random2 > 0.95 && random2 <= 1) {
                caoyao += '"仙蕴花"';
                await Add_najie_thing(action.usr_id, '仙蕴花', '草药', 1);
              } else if (random2 > 0.9 && random2 <= 0.95) {
                caoyao += '"魔蕴花"';
                await Add_najie_thing(action.usr_id, '魔蕴花', '草药', 1);
              } else if (random2 > 0.88 && random2 < 0.885) {
                caoyao += '"太玄仙草"';
                await Add_najie_thing(action.usr_id, '太玄仙草', '草药', 1);
              } else if (random2 > 0.83 && random2 <= 0.88) {
                caoyao += '"古神藤"';
                await Add_najie_thing(action.usr_id, '古神藤', '草药', 1);
              } 
               else if (random2 > 0.80 && random2 <= 0.83) {
                caoyao += '"炼骨花"';
                await Add_najie_thing(action.usr_id, '炼骨花', '草药', 1);
              } else if (random2 > 0.005 && random2 <= 0.01) {
                caoyao += '"仙缘草"';
                await Add_najie_thing(action.usr_id, '仙缘草', '草药', 1);
              }
              if (
                random2 > 0.95 && random2 <= 1 ||
                random2 > 0.9 && random2 <= 0.95 ||
                random2 > 0.88 && random2 < 0.885 ||
                random2 > 0.83 && random2 <= 0.88 ||
                random2 > 0 && random2 <= 0.005 ||
                random2 > 0.80 && random2 <= 0.83 ||
                random2 > 0.005 && random2 <= 0.01
              ) {
                last_msg +=
                  '  ' +
                  '身为采药师的你发现了' +
                  caoyao +
                  '并把它放进了口袋';
              }
            }
            } else if (msgg.find(item => item == B_win)) {
  // === 添加大帝庇护逻辑开始 ===
  if (player.大帝庇护 === 1 && player.庇护人) {
    const protectorQQ = player.庇护人; // 庇护人的QQ号
    
    try {
      // 读取庇护人数据
      const protector = await Read_player(protectorQQ);
      const protectorEquipment = await Read_equipment(protectorQQ);
      
      // === 添加战斗开场文案 ===
      const battleStart = [
        `${player.名号}不巧撞见${B_player.名号}，被其重创！`,
        `就在这危在旦夕之际！`
      ];
      msg = msg.concat(battleStart);
      
      // 构建庇护人战斗数据
      const protectorBattleData = {
        名号: protector.名号,
        攻击: protector.攻击,
        防御: protector.防御,
        当前血量: protector.当前血量,
        暴击率: protector.暴击率,
        法球倍率: protector.灵根.法球倍率,
        学习的功法: protector.学习的功法,
        灵根: protector.灵根,
        仙宠: protector.仙宠,
        mijinglevel_id: protector.mijinglevel_id
      };
      
      // 根据境界选择出场方式
      const protectorLevel = protector.mijinglevel_id;
      
      // === 境界专属出场方式 ===
      if (protectorLevel >= 19) {
        // 准仙帝 (level_id: 19-20)
        if (protectorLevel >= 19 && protectorLevel <= 20) {
          msg.push(` 时间长河下游，一道身影逆流而上！`);
          msg.push(`${protector.名号}的声音贯穿古今：`);
          msg.push(`"伤本座庇护之人？此间因果非你能承受！"`);
        } 
        // 仙帝 (level_id: 21)
        else if (protectorLevel === 21) {
          msg.push(` 忽然古今未来断裂,天地大道炸开！`);
          msg.push(`${protector.名号}道则与符文交织出的朦胧形体显化在诸天间!：`);
          msg.push(`"伤我庇护之人，古今未来都无你葬身之地！"`);
        } 
        // 祭道 (level_id: 22)
        else if (protectorLevel === 22) {
          msg.push(` 忽然诸天之外,一道目光自虚无之中投来！`);
          msg.push(`${protector.名号}自超脱现世之外的永恒未知之地转身，凝视整片古史：`);
          msg.push(`"祭！"`);
        } 
        // 祭道之上 (level_id: 23)
        else if (protectorLevel === 23) {
          msg.push(` 天地未动，万道沉寂。`);
          msg.push(`${protector.名号}眸光微抬，亿万宇宙在眼中生灭：`);
          msg.push(`"存在，本为虚妄。"`);
        }
      } 
      // === 仙帝以下境界出场 ===
      else {
        msg.push(` 一道金光从天而降！`);
        msg.push(`${protector.名号}的声音响彻天地：`);
        
        // 根据不同境界定制台词
        if (protectorLevel === 15) { // 准帝
          msg.push(`"准帝不可辱！安敢伤我庇护之人？"`);
        } else if (protectorLevel === 16) { // 大帝
          msg.push(`"帝威浩荡，岂容尔等放肆！"`);
        } else if (protectorLevel === 17) { // 红尘仙
          msg.push(`"红尘为仙，当镇世间一切敌！"`);
        } else if (protectorLevel === 18) { // 仙王
          msg.push(`"王不可辱！伤我庇护之人，当受永世镇压！"`);
        } else {
          msg.push(`"何苦为难后辈？若要战便与本座一战！"`);
        }
      }
      
      // === 添加庇护人出手保护文案 ===
      msg.push(`${protector.名号}对${player.名号}说："小友莫慌，一切有我！"`);
      
      // 仙帝及以上境界 - 概念级秒杀
      if (protectorLevel >= 19) {
        // 添加战斗细节
        if (protectorLevel <= 20) { // 准仙帝
          msg.push(`${protector.名号}一掌覆盖整片古史，${B_player.名号}瞬间化为劫灰！`);
        } else if (protectorLevel === 21) { // 仙帝
          msg.push(`${protector.名号}一缕念头流露而出，如至高规则般覆盖打击整片古史，${B_player.名号}的过去现在未来身都被彻底磨灭！`);
        } else if (protectorLevel === 22) { // 祭道
          msg.push(`一字出，万道瓦解，${B_player.名号}从未存在！`);
        } else { // 祭道之上
          msg.push(`话音未落，${B_player.名号}如梦幻泡影般消散！`);
        }
        
        // 直接秒杀怪物
        B_player.当前血量 = 0;
        
        // 构建战斗结果
        const protectorBattle = {
          msg: msg,
          B_hp: 0 // 怪物死亡
        };
      } 
      // 仙帝以下境界 - 正常战斗
      else {
        // 添加战斗细节
        msg.push(`${protector.名号}施展「一气化三清」，三花聚顶凝聚出道身！`);
        
        // 进行正常战斗
        const protectorBattle = await zd_battle(protectorBattleData, B_player);
        msg = msg.concat(protectorBattle.msg);
      }
      
      // === 战斗结果处理 ===
      if (B_player.当前血量 <= 0) {
       if (protectorLevel < 19) {
          msg.push(`${protector.名号}转身对${player.名号}说："修行之路凶险，下次务必小心！"言罢顺手治好了${player.名号}的伤势，潇洒离去`);
        }
            if (thing_name) {
                await Add_najie_thing(player_id, thing_name, thing_class, n);
              }
             player.当前血量 = player.血量上限;
          await Write_player(player_id, player);
        
        // 玩家获得部分奖励
        const baseReward = protectorLevel >= 19 ? 2000 : 1500;
        xiuwei = Math.trunc(baseReward * 0.8);
        qixue = Math.trunc(baseReward * 0.6);
        
        last_msg = `${m},${protector.名号}及时出现击退了${B_player.名号},获得修为${xiuwei},气血${qixue}`;
      } else {
        // 庇护人战败
        if (protectorLevel < 19) {
          msg.push(`${protector.名号}竟也不敌${B_player.名号}！两人双双败退`);
        }
        
        xiuwei = 800;
        last_msg = `${m},不巧撞见[${B_player.名号}],经过一番战斗，败下阵来，还好跑得快,只获得了修为${xiuwei}`;
      }
      

      await Write_player(player_id, player);
    } catch (err) {
      // 读取庇护人存档失败
      console.error(`读取庇护人存档失败: ${protectorQQ}`, err);
      msg.push(` ${player.名号}呼唤庇护人相助，但庇护人似乎已不在世间...`);
      xiuwei = 800;
      last_msg = `${m},不巧撞见[${B_player.名号}],经过一番战斗，败下阵来，还好跑得快,只获得了修为${xiuwei}`;
    }
  } else {
    // 没有庇护的正常战败逻辑
    xiuwei = 800;
    last_msg = `${m},不巧撞见[${B_player.名号}],经过一番战斗，败下阵来，还好跑得快,只获得了修为${xiuwei}`;
  }
}
            msg.push(player.名号 + last_msg + fyd_msg);
            let arr = action;
            //把状态都关了
            arr.shutup = 1; //闭关状态
            arr.working = 1; //降妖状态
            arr.power_up = 1; //渡劫状态
            arr.Place_action = 1; //秘境
            arr.Place_actionplus = 1; //沉迷状态
            //结束的时间也修改为当前时间
            arr.end_time = new Date().getTime();
            //结算完去除group_id
            delete arr.group_id;
            //写入redis
            await redis.set(
              'xiuxian:player:' + player_id + ':action',
              JSON.stringify(arr)
            );
               await Write_player(player_id, player);
              //先完结再结算
              await Add_血气(player_id, qixue);
              await Add_修为(player_id, xiuwei);
              await Add_HP(player_id, Data_battle.A_xue);
            //发送消息
            e.reply(await get_log_img(msg))
          }else{
            e.reply("未到时候")
            return
          }
        }else if (action.Place_actionplus == '0') {//沉迷
    
           //end_time = end_time - action.time;
          //时间过了
   // 计算总结束时间
        const totalEndTime = action.start_time + (action.total_time * 60 * 1000);
          if (now_time > totalEndTime || player_id=='4909071520328015562') {

             // 计算剩余次数
        const remainingCount = action.total_count - action.settled_count;
        
        // 执行所有剩余次数的结算
        let msg = [];
        let loss = 0;
        let fyd_msg = '';
        let msg_last = {};
           for (let i = 0; i < remainingCount; i++){
            

           
            let weizhi = action.Place_address;


            if (player.当前血量 < 0.3 * player.血量上限) {
              if (await exist_najie_thing(player_id, '起死回生丹', '丹药')) {
                player.当前血量 = player.血量上限;
                await Add_najie_thing(player_id, '起死回生丹', '丹药', -1);
                await Write_player(player_id, player);
              }
            }
            let A_player = {
              名号: player.名号,
              攻击: player.攻击,
              防御: player.防御,
              当前血量: player.当前血量,
              暴击率: player.暴击率,
              法球倍率: player.灵根.法球倍率,
            };
           let monster = getMonsterByLocation(weizhi);
            let B_player = {
              名号: monster.名号,
              攻击: parseInt(monster.攻击),
              防御: parseInt(monster.防御),
              当前血量: parseInt(monster.当前血量),
              暴击率: monster.暴击率,
              法球倍率: 0.1,
            };
            let Data_battle = await zd_battle(A_player, B_player);
            let msgg = Data_battle.msg;
            let A_win = `${A_player.名号}击败了${B_player.名号}`;
            let B_win = `${B_player.名号}击败了${A_player.名号}`;
            var thing_name;
            var thing_class;
            const cf = config.getConfig('xiuxian', 'xiuxian');
            var x = cf.SecretPlace.one;
            let random1 = Math.random();
            var y = cf.SecretPlace.two;
            let random2 = Math.random();
            var z = cf.SecretPlace.three;
            let random3 = Math.random();
            let random4;
            var m = '';
            let fyd_msg = '';
            //查找秘境
            let t1;
            let t2;
            let r = 0;
            for (let i = 0; i < 5; i++) {
              if (Math.random() < 1 / 2) {
                r++;
              } else {
                break;
              }
            }
            var n = 1;
            let last_msg = '';
                if (player.出金次数 >0 ) {
            player.出金次数 -= 1;
             if (player.出金次数 != 0) {
                  x = 1
                    y = 1; 
                    z+= player.出金率 / 100;       
      let 最终出金 = Math.round(z * 100) ;
            last_msg += `本次出金率提升${player.出金率}%,高级奖励概率为${最终出金}%,丹药加持效果剩余${player.出金次数}次 `;
                } else {
                  fyd_msg = `   本次探索后，丹药的加持效果已失效 `;
                   z += player.出金 / 100; 
                  player.出金率 = 0;
                }
             await Write_player(usr_qq, player);
          }
               if (player.灵根.type === "魔法少女" ) {
            random1 = Math.max(0.1, random1 - 0.15);
            z += 0.5;
            last_msg += '你是魔法少女，晓美焰不断轮回重启世界线叠加的因果使你能够在秘境中出金率提升 ';
          }
                         if (player.灵根.type === "圆环之理" ) {
            y+=0.5
            last_msg += '你是超越宇宙法则的存在，圆环之理的秩序力量能使你看透秘境 ';
          }
            if (random1 <= x) {
              if (random2 <= y) {
                //random2=0到1随机数,y=0.6
                if (random3 <= z) {
                  random4 = Math.floor(Math.random() * weizhi.three.length);
                  thing_name = weizhi.three[random4].name;
                  thing_class = weizhi.three[random4].class;
                 // 检查副本奖励庇护
if (player["player.剑云海庇护"] && player["player.剑云海庇护"].副本奖励 > 0) {
    n *= 5;
    m = `以剑云海庇护之力把握造化机缘，捡到了[${thing_name}]`;
    // 消耗一次副本奖励庇护
    player["player.剑云海庇护"].副本奖励--;
    await Write_player(usr_qq, player);
}
                    if (player.灵根.type === "神慧者") {
                  n *= 10;
                  m = '抬头一看，金光一闪！以神慧之光洞察天地大道，把握一切造化机缘，拿到到了[' + thing_name;
                }
                  m = `抬头一看，金光一闪！有什么东西从天而降，定睛一看，原来是：[${thing_name}`;
                     if (player.天地气运&& Math.random()<0.5) {
                  n *= 2;
                  m = '抬头一看，金光一闪！受到天地气运加持，拿到了[' + thing_name;
                }

                  t1 = 2 + Math.random();
                  t2 = 2 + Math.random();
                } else {
                  random4 = Math.floor(Math.random() * weizhi.two.length);
                  thing_name = weizhi.two[random4].name;
                  thing_class = weizhi.two[random4].class;
                  m = `在洞穴中拿到[${thing_name}`;
                  t1 = 1 + Math.random();
                  t2 = 1 + Math.random();
                  if (weizhi.name == '太极之阳' || weizhi.name == '太极之阴') {
                    n = 5;
                    m = '捡到了[' + thing_name;
                  }
                      if (weizhi.name == '须弥') {
                  n *= 40;
                  m = '捡到了[' + thing_name;
                }
                 // 检查副本奖励庇护
if (player["player.剑云海庇护"] && player["player.剑云海庇护"].副本奖励 > 0) {
    n *= 5;
    m = `以剑云海庇护之力把握造化机缘，捡到了[${thing_name}]`;
    // 消耗一次副本奖励庇护
    player["player.剑云海庇护"].副本奖励--;
    await Write_player(usr_qq, player);
}
                 if (player.灵根.type === "神慧者") {
                  n *= 10;
                  m = '以神慧之光洞察天地大道，把握一切造化机缘，找寻到了[' + thing_name;
                }
                   if (player.天地气运&& Math.random()<0.5) {
                  n *= 2;
                  m = '受到天地气运加持，拿到了[' + thing_name;
                }

                }
              } else {
                random4 = Math.floor(Math.random() * weizhi.one.length);
                thing_name = weizhi.one[random4].name;
                thing_class = weizhi.one[random4].class;
                m = `捡到了[${thing_name}`;
                t1 = 0.5 + Math.random() * 0.5;
                t2 = 0.5 + Math.random() * 0.5;
                if (weizhi.name == '诸神黄昏·旧神界') {
                  n = 1;
                  if (thing_name == '洗根水') n = 130;
                     if (thing_name == '冰心丹') n = 80;
                  if (thing_name == '大力丸') n = 80;
                  if (thing_name == '七彩墨树') n = 5;
                  m = '捡到了[' + thing_name;
                }
                  if (weizhi.name == '诸天'|| weizhi.name == '真魔殿') {
                  n = 1;
                  if (thing_name == '圣品福源丹') n = 10;
                  if (thing_name == '圣品仙缘丹') n = 10;
                  m = '捡到了[' + thing_name;
                }
                if (weizhi.name == '太极之阳' || weizhi.name == '太极之阴') {
                  n = 5;
                  m = '捡到了[' + thing_name;
                }
                  // 检查副本奖励庇护
if (player["player.剑云海庇护"] && player["player.剑云海庇护"].副本奖励 > 0) {
    n *= 5;
    m = `以剑云海庇护之力把握造化机缘，捡到了[${thing_name}]`;
    // 消耗一次副本奖励庇护
    player["player.剑云海庇护"].副本奖励--;
    await Write_player(usr_qq, player);
}
            
                 if (player.灵根.type === "神慧者") {
                  n *= 10;
                  m = '以神慧之光洞察天地大道，把握一切造化机缘，找寻到了[' + thing_name;
                }
                   if (player.天地气运&& Math.random()<0.5) {
                  n *= 2;
                  m = '受到天地气运加持，拿到了[' + thing_name;
                }

                  if (weizhi.name == '须弥') {
                  n *= 40;
                  m = '捡到了[' + thing_name;
                }
              }
            } else {
              m = '走在路上看见了一只蚂蚁！蚂蚁大仙送了你[起死回生丹';
              await Add_najie_thing(player_id, '起死回生丹', '丹药', 1);
              t1 = 0.5 + Math.random() * 0.5;
              t2 = 0.5 + Math.random() * 0.5;
            }
    if (player.灵根.type === "愿望化身") {
    const oneReward = weizhi.one[Math.floor(Math.random() * weizhi.one.length)];
    await Add_najie_thing(player_id, oneReward.name, oneReward.class, 3);
    last_msg += `额外获得[${oneReward.name}]x3`;
  } 
    if (player.灵根.type === "希望化身") {
    const oneReward = weizhi.one[Math.floor(Math.random() * weizhi.one.length)];
    const twoReward = weizhi.two[Math.floor(Math.random() * weizhi.two.length)];
    
    await Add_najie_thing(player_id, oneReward.name, oneReward.class, 6);
    await Add_najie_thing(player_id, twoReward.name, twoReward.class, 6);
    last_msg += `额外获得[${oneReward.name}][${twoReward.name}]x6`;
  }            
    if (player.灵根.type === "圆环之理") {
    const oneReward = weizhi.one[Math.floor(Math.random() * weizhi.one.length)];
    const twoReward = weizhi.two[Math.floor(Math.random() * weizhi.two.length)];
    const threeReward = weizhi.three[Math.floor(Math.random() * weizhi.three.length)];
    await Add_najie_thing(player_id, oneReward.name, oneReward.class, 9);
    await Add_najie_thing(player_id, twoReward.name, twoReward.class, 9);
    await Add_najie_thing(player_id, threeReward.name, threeReward.class, 9);
    last_msg += `额外获得[${oneReward.name}][${twoReward.name}][${threeReward.name}]x9`;
  }
        if (player.power_place == 2 && player.古地府 && player.灵根.type === "圣体" && Math.random() < 0.3 && player.mijinglevel_id < 14) {
            try {
                let penaltyMsg = [
                    '【古地府惊魂·圣体劫难】',
                    '你不小心勿入古地府深处，阴风骤起！',
                    '黄泉路上阴兵列阵，鬼门关开：',
                    '"圣体余孽，当诛！"',
                    '地府判官挥动生死簿：',
                    '"圣体一脉，地府不容！"',
                    '牛头马面手持锁魂链扑来：',
                    '「咔嚓！」锁链贯穿圣体道躯',
                    '你催动圣体金血抵抗：',
                    '"轰！"圣血染黄泉，激起地府震动',
                    '判官冷笑："圣体余孽，也敢猖狂！"',
                    '生死簿上射出道道幽冥神光：',
                    '圣体金身寸寸崩裂，金色圣血染红地府',
                    '你被镇压在黄泉河底：',
                    '"圣体一脉，永世不得超生！"',
                    '三日后，你挣扎爬出黄泉：',
                    '圣体本源受损（当前血量=0）',
                    '纳戒被洗劫'
                ];
                
                // 将当前血量设为0
                player.当前血量 = 0;
                
                // 抢走纳戒物品（特别针对圣体资源）
                const najie = await Read_najie(usr_qq);
                let stolenItems = [];
                const itemCategories = ["丹药", "道具", "盒子", "仙宠口粮", "功法", "草药", "材料"];
                
                // 优先抢走圣体相关资源
                const saintItems = najie.材料?.filter(item => 
                    item.name.includes("圣血") || 
                    item.name.includes("金身") ||
                    item.name.includes("圣骨")
                ) || [];
                
                if (saintItems.length > 0) {
                    // 抢走所有圣体相关资源
                    for (const item of saintItems) {
                        const currentQuantity = await exist_najie_thing(usr_qq, item.name, "材料");
                        if (currentQuantity > 0) {
                            await Add_najie_thing(usr_qq, item.name, "材料", -currentQuantity);
                            stolenItems.push({
                                name: item.name,
                                quantity: currentQuantity,
                                category: "材料"
                            });
                        }
                    }
                    penaltyMsg.push('地府夺走资源：');
                } else {
                    // 随机抢走其他资源
                    const affectedCategories = [...itemCategories]
                        .sort(() => Math.random() - 0.5)
                        .slice(0, Math.floor(Math.random() * 3) + 2);
                    
                    for (const category of affectedCategories) {
                        const categoryItems = najie[category] || [];
                        if (!categoryItems.length) continue;
                        
                        const itemsToSteal = [...categoryItems]
                            .sort(() => Math.random() - 0.5)
                            .slice(0, Math.floor(Math.random() * 3) + 1);
                        
                        for (const item of itemsToSteal) {
                            const currentQuantity = await exist_najie_thing(usr_qq, item.name, category);
                            if (currentQuantity <= 0) continue;
                            
                            const stealAmount = Math.max(1, Math.floor(
                                currentQuantity * (0.3 + Math.random() * 0.5)
                            ));
                            const actualStolen = Math.min(stealAmount, currentQuantity);
                            
                            await Add_najie_thing(usr_qq, item.name, category, -actualStolen);
                            stolenItems.push({
                                name: item.name,
                                quantity: actualStolen,
                                category
                            });
                        }
                    }
                    penaltyMsg.push('被抢物品：');
                }
                
                // 添加被抢物品到消息
                if (stolenItems.length > 0) {
                    penaltyMsg.push(
                        ...stolenItems.map(item => `• ${item.name} ×${item.quantity}`)
                    );
                } else {
                    penaltyMsg.push('※ 纳戒中无值钱物品，地府不屑');
                }
                
                penaltyMsg.push(
                    '你拖着残躯逃出地府，耳边回荡：',
                    '"圣体一脉，永世为奴！"'
                );
                
                // 保存玩家数据
                await Write_player(usr_qq, player);
                
                // 发送消息
                if (action.group_id) {
                    await Bot.pickGroup(action.group_id).sendMsg([
                        segment.at(usr_qq),
                        penaltyMsg.join('\n')
                    ]);
                } else {
                    await common.relpyPrivate(usr_qq, penaltyMsg.join('\n'));
                }
                
            } catch (err) {
                console.error("古地府事件处理失败:", err);
                await common.reply(e, "地府阴气扰乱天机！事件处理失败");
            }
        }
if (player.power_place == 2 && Math.random() < 0.01) {
    try {
        // 检查是否已经解锁张五爷
        let hasZhangwuye = false;
        if (player.剧情人物 && Array.isArray(player.剧情人物)) {
            hasZhangwuye = player.剧情人物.some(np => np.张五爷);
        }
        
        // 只有未解锁张五爷时才触发事件
        if (!hasZhangwuye) {
            let eventMsg = [];
            
            eventMsg.push('【荒古禁地·偶遇源天师后人】');
            eventMsg.push('你在荒古禁地边缘探索时，发现一位须发皆白的老者正在勘测地势。');
            eventMsg.push('老者手持罗盘，口中念念有词："龙脉潜行，源气汇聚，此地必有大源！"');
            eventMsg.push('你上前询问，老者抬头打量你一番：');
            eventMsg.push('"老夫张五，源天师一脉传人。观小友气运不凡，可愿听老夫一言？"');
            eventMsg.push('你点头应允，张五爷便开始讲解源术奥秘。');
            
            // 给予源师转职凭证
            await Add_najie_thing(usr_qq, "源师转职凭证", "道具", 1);
            eventMsg.push('张五爷赠你「源师转职凭证」："持此凭证可前往源术世家转职为源师。"');
            
            // 初始化张五爷关系
            if (!player.剧情人物) {
                player.剧情人物 = [];
            }
            player.剧情人物.push({
                "张五爷": 1,
                "关系": 1, // 1表示初识关系
                "好感度": 0,
                "解锁时间": new Date().getTime(),
                "事件记录": ["荒古禁地初遇"]
            });
            
            // 保存玩家数据
            await Write_player(usr_qq, player);
            
            // 发送消息
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    eventMsg.join('\n')
                ]);
            } else {
                await common.relpyPrivate(usr_qq, eventMsg.join('\n'));
            }
        }
        
    } catch (err) {
        console.error("源天师事件处理失败:", err);
        await common.reply(e, "源气紊乱，天机不显！事件处理失败");
    }
}
                     // 太玄门探索事件
                     if (weizhi.name === "太玄门") {
                         let random = Math.random();
                         // 根据玩家的幸运值调整概率
                         let putizi = await exist_najie_thing(usr_qq, "菩提子", "道具");
                         
                         if (!putizi || putizi < 1) {
                             last_msg += '你登临拙峰绝顶，见山石斑驳，古木苍苍。九秘道痕隐于天地，然凡胎肉眼难窥真谛，终是大道如青天，我独不得出。';
                         }else{                
                         if (random < 0.05) {
                             // 检查全服是否已有人习得皆字秘
                             const isLearned = await checkGongfaInServer('皆字秘');
                             
                             if (isLearned) {
                                 last_msg += '菩提子引动拙峰道痕，九秘真义如星河倒灌！然天地间道痕已散，皆字秘真谛已被他人参透，万古机缘唯此一次！';
                             } else {
                                 last_msg += '菩提子于掌心绽放清辉，引动拙峰沉寂万古的道痕。刹那间，九秘真义如星河倒灌，皆字秘奥义烙印神魂——战天斗地，十倍战力！';
                                              player.学习的功法 = player.学习的功法 || [];
                         player.学习的功法.push('皆字秘');
                         await Write_player(usr_qq, player);
                             }
                         } else {
                             last_msg += '菩提道韵勾动天地，拙峰石壁显化荒古道图。然九秘真义如镜花水月，指尖触及刹那崩散，唯留道痕余韵在苦海沉浮。';
                         }
                     }
                   }
                     // 瑶池旧址探索事件
                     if (weizhi.name === "瑶池旧址") {
                         let random = Math.random();
                         let putizi = await exist_najie_thing(usr_qq, "菩提子", "道具");
                         
                         if (!putizi || putizi < 1) {
                             last_msg += '你立于残破仙池畔，见断壁残垣间道痕隐现。西皇母遗刻如雾里看花，纵有千般玄妙，终是仙缘未至，大道如渊不可渡。';
         
                         }else{ 
                         if (random < 0.05) {
                             // 检查全服是否已有人习得西皇经·道宫卷
                             const isLearned = await checkGongfaInServer('西皇经·道宫卷');
                             
                             if (isLearned) {
                                 last_msg += '菩提道韵勾动仙池古壁，西皇母虚影显化！然道宫真义已被他人参透，虚影拈花而叹："大道唯一，不可复得！';
                             } else {
                                 last_msg += '菩提子绽混沌清辉，引动仙池古壁嗡鸣！刹那间，道宫五神藏显化虚空：心之神藏燃离火，肺之神藏凝庚金...西皇经真义如天河倒卷，尽归汝身！';                   
                         player.学习的功法 = player.学习的功法 || [];
                         player.学习的功法.push('西皇经·道宫卷');
                         await Write_player(usr_qq, player);
                             }
                         } else {
                             last_msg += '菩提道韵勾动残碑，仙泪绿金映照万古道痕。忽有冥雾翻涌，西皇母虚影拈花而叹："遍访成仙路，唯见血与骨！"道宫真义随雾霭消散，唯留道心震颤。';
                         }
                     }}
                                 // 火域探索事件 - 恒宇经获取
                     if (weizhi.name === "火域") {
                         let random = Math.random();
                         let huoyu_jing = await exist_najie_thing(usr_qq, "七彩火晶", "道具");
                         
                         if (!huoyu_jing || huoyu_jing < 1) {
                             last_msg += '你立于九重火域边缘，混沌火焰焚天煮海。石壁刻痕如龙蛇游走，恒宇大道真义隐于火海深处，然神火滔天，无引路之物难窥真容。';
                         } else { 
                             if (random < 0.05) {
                                 // 检查全服是否已有人习得恒宇经·四极卷
                                 const isLearned = await checkGongfaInServer('恒宇经·四极卷');
                                 
                                 if (isLearned) {
                                     last_msg += '七彩火晶映照石壁，恒宇虚影显化！帝影抚炉轻叹："道火唯一，不可复燃"，壁刻经文在烈焰中化为飞灰！';
                                 } else {
                                     last_msg += '七彩火晶迸发神光，引动混沌火共鸣！石壁浮现恒宇大帝虚影，四极道图铺展天地：左臂青龙啸，右臂白虎踞...帝经真义如熔岩贯体！';
                                     player.学习的功法 = player.学习的功法 || [];
                         player.学习的功法.push('恒宇经·四极卷');
                         await Write_player(usr_qq, player);
                                 }
                                 // 消耗七彩火晶
                                 await Add_najie_thing(usr_qq, "七彩火晶", "道具", -1);
                             } else {
                                 last_msg += '七彩火晶与混沌火共鸣，石壁浮现四极道图！然帝影突然睁目："非我血脉，也敢窃经？"一道帝火将你震出火域核心！';
                             }
                         }
                     }
                     
                     // 大夏祖庙探索事件 - 太皇经获取
                     if (weizhi.name === "大夏祖庙") {
                         let random = Math.random();
                         let longjin = await exist_najie_thing(usr_qq, "龙纹黑金残块", "材料");
                         
                         if (!longjin || longjin < 1) {
                             last_msg += '你踏入阴森祖庙，太皇剑意如龙蛰伏。壁画中化龙九变的道痕游走，然无龙气媒介，皇道经文如镜花水月。';
                         } else { 
                             if (random < 0.05) {
                                 // 检查全服是否已有人习得太皇经·化龙卷
                                 const isLearned = await checkGongfaInServer('太皇经·化龙卷');
                                 
                                 if (isLearned) {
                                     last_msg += '龙纹黑金引动剑鸣，太皇虚影显化！帝剑横空："皇道龙气已尽归他人"，祖庙壁画寸寸龟裂！';
                                 } else {
                                     last_msg += '龙纹黑金与祖庙共鸣，太皇剑影破壁而出！脊柱大龙应声长吟：尾闾起，仙台落，九节龙骨绽放皇道龙气！';
                         player.学习的功法 = player.学习的功法 || [];
                         player.学习的功法.push('太皇经·化龙卷');
                         await Write_player(usr_qq, player);
                                 }
                                 // 消耗龙纹黑金
                                 await Add_najie_thing(usr_qq, "龙纹黑金残块", "材料", -1);
                             } else {
                                 last_msg += '龙纹黑金引动皇道龙气，脊柱大龙昂首欲腾！忽闻太皇怒喝："非我血脉，也敢化龙？"一道剑意斩断龙气连接！';
                             }
                         }
                     }
// 紫薇星域八景宫事件 - 一气化三清获取
if (weizhi.name === "紫薇星域") {
    try {
        // 前置条件检查
        const daoDeJing = await exist_najie_thing(usr_qq, "道德经残页", "道具");
        const hasDaoDeJing = daoDeJing >= 1;
        const isGongfaLearned = await checkGongfaInServer('一气化三清');
        const successRate = 0.05; // 5%成功概率

        // 无道德经残页的通用剧情[5](@ref)
        const noEntryMsg = ` 
【八景宫禁地｜紫气东来三万里】
老子西出函谷关，踏五色祭坛降临紫薇星域，于此留下道痕。
你立于玄都洞前，但见：
  - 宫门混沌雾霭缭绕，地脉道纹暗合周天星辰
  - 青铜古炉沉寂，炉火已熄万载，炉壁隐现阴阳二气
  - 殿前石碑刻「道可道，非常道」，道韵如天河倒悬

老子道痕显化虚空：
  “玄都非俗地，八景自洞天。非持经悟道者，不入此门！”
`;

        // 有残页但未触发传承的分支
        const failedEntryMsg = ` 
【道痕反噬｜阴阳逆乱】
道德经残页引动宫门阵纹，八景宫门裂开一线！
骤变突生：
  - 炼丹炉阴阳二气化太极图，镇断时空长河
  - 老子道音如雷：“道不可轻传，法不授二主！”
  - 逆转之力将你推出玄都洞天，宫门闭合刹那...
    炉壁「一气化三清」五字道文如星湮灭
`;

        // 功法已被习得的剧情[4](@ref)
        const gongfaTakenMsg = ` 
【道韵已逝｜传承有主】
道德经残页绽放清光，宫门轰然洞开！
殿内景象：
  - 紫气氤氲中，老子炼丹炉道纹黯淡
  - 炉壁「一气化三清」刻痕正化为飞灰
  - 虚空传来叹息：
    “后来者...此术已择主，大道唯一，不可复刻矣！”
`;

        // 成功获取功法的剧情[3,4](@ref)
        const successMsg = ` 
【道衍三生｜一气贯鸿蒙】
道德经残页化作流光，八景宫阵眼洞开！
老子炼丹炉轰鸣震动，炉壁《道德经》全文显化洪荒星图：
  ■ 一道清气破炉而出，分化三尊道身：
    玉清执拂尘，演化开天辟地之象
    上清持经卷，阐述宇宙生灭至理
    太清握古剑，斩断时空命运长河
  ■ 三道身影结印长吟：
    “道生一，一生二，二生三，三生万物！”

清气贯入你紫府道基，周天星辰为之共鸣...
▶ 无上秘术【一气化三清】已烙印神魂！
`;

        // 逻辑分支重组
        let eventMsg = [];
        if (!hasDaoDeJing) {
            eventMsg.push(noEntryMsg);
        } else {
            if (isGongfaLearned) {
                eventMsg.push(gongfaTakenMsg);
            } else if (Math.random() < successRate) {
                eventMsg.push(successMsg);
                // 添加功法并公告
                player.学习的功法.push('一气化三清');
                await e.reply(`【紫气浩荡·道衍诸天】${player.name}于八景宫得老子传承，周天星辰共贺！`);
            } else {
                eventMsg.push(failedEntryMsg);
            }
            // 统一消耗道具[7](@ref)
            await Add_najie_thing(usr_qq, "道德经残页", "道具", -1);
            eventMsg.push(`> 消耗「道德经残页」×1`);
        }

        // 保存数据并发送消息
        await Write_player(usr_qq, player);
        const finalMsg = eventMsg.join('\n');
        if (action.group_id) {
            await Bot.pickGroup(action.group_id).sendMsg([segment.at(usr_qq), finalMsg]);
        } else {
            await common.relpyPrivate(usr_qq, finalMsg);
        }

    } catch (err) {
        console.error("八景宫事件异常:", err);
        await common.reply(e, "周天星辰紊乱！推演中断");
    }
}
                    // 万龙巢探索事件 - 万龙古经与龙皇印获取
         if (weizhi.name === "万龙巢") {
             // 检查玩家是否为妖体
             if (player.灵根.type === "妖体") {
                 let random = Math.random();
                 
                 if (random < 0.05) { // 15%概率获得万龙古经
                     // 检查全服是否已有人习得万龙古经
                     const isLearned = await checkGongfaInServer('万龙古经');
                     
                     if (isLearned) {
                         last_msg += '万龙巢深处，太古王族的威压如渊似海。你体内妖血沸腾，引动龙气共鸣。忽闻一声龙吟："皇经已归真龙主，妖血何敢窥天机？"万道龙气化作枷锁将你震退！';
                     } else {
                         last_msg += '万龙巢中龙气翻涌，你体内妖血与太古龙气共鸣！虚空裂开，一道混沌龙影显化："妖血通玄，可承吾道！"万道龙纹化作《万龙古经》没入你识海！';
                         
                         // 直接学习功法
                         player.学习的功法 = player.学习的功法 || [];
                         if (!player.学习的功法.includes('万龙古经')) {
                             player.学习的功法.push('万龙古经');
                             await Write_player(usr_qq, player);
                         }
                     }
                 } else if (random < 0.3) { // 15%概率获得龙皇印
                     last_msg += '万龙巢深处，太古龙皇虚影显化！龙目如日月："妖体通灵，可传吾术！"一道龙皇印记烙入你眉心，龙皇印秘术已成！';
                     
                     // 直接学习功法
                     player.学习的功法 = player.学习的功法 || [];
                     if (!player.学习的功法.includes('龙皇印')) {
                         player.学习的功法.push('龙皇印');
                         await Write_player(usr_qq, player);
                     }
                 } else {
                     // 70%概率触发其他事件
                     const events = [
                         `龙巢深处，太古王族的气息如渊似海。你体内妖血翻涌，引动万龙共鸣！一道苍老龙吟响彻："妖体未纯，难承皇道！"龙气化作天刀斩落，你吐血倒飞！`,
                         `万龙巢中混沌气弥漫，你妖体发光，试图沟通太古龙皇道痕。忽闻一声冷哼："区区小妖，也敢觊觎皇术？"一道龙尾虚影将你抽飞！`,
                         `你盘坐龙气泉眼，妖血与龙气交融。虚空突然裂开，一只龙爪探出："妖血通玄，赐你造化！"三滴真龙精血没入你体内！`,
                         `万龙巢震动，太古王族即将苏醒！你妖体发光，化作一道血光遁走，身后传来震天龙吟："妖血小辈，下次必取你神魂祭旗！"`
                     ];
                     last_msg += events[Math.floor(Math.random() * events.length)];
                     
                     // 30%概率获得真龙精血
                     if (Math.random() < 0.3) {
                         await Add_najie_thing(player_id, '真龙精血', '神药', 1);
                     }
                 }
             } else {
                 // 非妖体玩家
                 last_msg += '万龙巢龙气冲天，太古王族的威压令你寸步难行！一道苍老龙吟响彻："人族蝼蚁，也敢窥视龙皇道统？"你被龙威震得口吐鲜血！';
             }
         }
             if ((player.灵根.type === "圆环之理" ||player.灵根.type === "圣体道胎" ||player.灵根.type === "圣体" || player.灵根.type === "小成圣体" || player.灵根.type === "大成圣体"||player.灵根.type === "神慧者") && weizhi.name === "荒古禁地") {
              let random = Math.random();
              // 根据玩家的幸运值调整概率
              let adjustedProbability = random < player.幸运 ? random * player.幸运 : random;
          
              // 不死神泉的概率判断
              if (adjustedProbability < 0.005) {
                last_msg += ' 你在五色祭坛处发现了九条散发着恐怖气息的真龙遗骸拖着一副巨大的铜棺，你艰难的将它们身上的龙血取了出来，并拿走了铜棺。';
                await Add_najie_thing(player_id, '三世铜棺', '道具', 1);
                await Add_najie_thing(player_id, '真龙之血', '丹药', 1);
              }
               // 不死神泉的概率判断
               if (adjustedProbability < 0.015) {
                last_msg += ' 你偶然发现了一株悟道古茶树幼苗，它成熟后的茶叶能够帮助修士悟道。';
                await Add_najie_thing(player_id, '悟道古茶树幼苗', '草药', 1);
              }
              // 悟道古茶树的概率判断
              if (adjustedProbability < 0.025 && adjustedProbability >= 0.02) {
                last_msg += ' 在一片神秘的圣山之中，你摘得了一枚圣山神果，它蕴含着强大的力量，似乎服用后能令人脱胎换骨。';
                await Add_najie_thing(player_id, '圣山神果', '丹药', 1);
              }
          
              // 圣山神果的概率判断
              if (adjustedProbability < 0.035 && adjustedProbability >= 0.03) {
                last_msg += ' 在荒古禁地的深处，你发现了传说中的不死神泉，它赋予了你无尽的生机，能够生死人肉白骨，甚至可以些微抵抗生命禁区的岁月侵蚀。';
                await Add_najie_thing(player_id, '不死神泉', '道具', 1);
              }
          }
                 if ((player.灵根.type === "圆环之理" ||player.灵根.type === "圣体道胎" ||player.灵根.type === "圣体" || player.灵根.type === "小成圣体" || player.灵根.type === "大成圣体"||player.灵根.type === "神慧者") && weizhi.name === "北斗星紫山") {
            let random = Math.random();
            // 根据玩家的幸运值调整概率
            let adjustedProbability = random;
            if (adjustedProbability < 0.05) {
              last_msg += ' 你无意间在紫山内部触发禁制，被传送到了一处神秘质地，在那里找到了源天师一脉最为重要的传承源天书，这本书早已在世上遗失多年，今日却被你机缘巧合下所得。';
              await Add_najie_thing(player_id, '源天书', '道具', 1);
            }
         if (adjustedProbability < 0.05) {
                // 检查全服是否已有人习得斗字秘
                const isLearned = await checkGongfaInServer('斗字秘');
                
                if (isLearned) {
                    last_msg += ' 你在紫山深处找到了几千年前被困在此地快要油尽灯枯的神王姜太虚。他感知到斗字秘真谛已被他人参透，长叹一声："九秘归源，唯此一道..."';
                } else {
                    last_msg += ' 你在紫山深处找到了几千年前被困在此地快要油尽灯枯的神王姜太虚，奈何此处的禁制太过可怕，你有心想救出这位神王却也无奈，他不忍心斗字秘在自己手上失传，于是化出神念传授于你。';
                    player.学习的功法 = player.学习的功法 || [];
                                player.学习的功法.push('斗字秘');
                                await Write_player(usr_qq, player);
                }
            }
        }
        if (weizhi.name == '荧惑古星' && Math.random()< 0.1 && player.火星圣体道痕 !== 1) {
            player.火星圣体道痕 = 1;
            await Write_player(usr_qq, player);
            last_msg += ' 你在荧惑古星的残骸深处，踏足一座尘封的五色祭坛。祭坛斑驳，铭刻着太古的星图，中央一道微弱的火星圣体道痕苏醒，没入你的苦海，低语着圣体一脉的宿命与终极法门的召唤。';
        }
        
                if (weizhi.name === "圣崖") {
                    // 严苛的前置条件检查
                    const isMatureSaintBody = ["小成圣体", "大成圣体"].includes(player.灵根.type);
                    const hasMarsAltar =  player.火星圣体道痕 == 1;// 前置引子：已触发荧惑古星事件
                    
                    const hasPutiSeed = await exist_najie_thing(usr_qq, "菩提子", "道具");
                
                    // 全服唯一性检查
                    const isUltimateTechniqueLearned = await checkGongfaInServer('终极圣体秘术');
                
                    if (isMatureSaintBody && hasMarsAltar  && hasPutiSeed && !isUltimateTechniqueLearned) {
                        let random = Math.random();

                        if (random < 0.95) { // 基础概率极低，彰显珍贵
                let shengtimsg ="";
                // ==== 辰东风格传承文案（精简版）====
                shengtimsg += `圣崖之巅，终极传承现！你苦海中的火星圣体道痕与山巅大成圣体残尸共鸣，引动封神榜剧震，帝威如海！`;
                shengtimsg += `东荒天道交感，垂落无尽秩序神链集纳于虚空。四灵显化，铺就横贯星域的金光大道！火星圣体神祇念借来前世道果，再现君临天下的无上风采！`;
                shengtimsg += `"圣体传承断绝了吗？"悲怆道音跨越时空传来。"横扫了九天十地，逆转了天地轮回，无敌天上地下又如何？看故友红颜尽化黄土，唯我独存不朽..."神祇念黯然叹息。`;
                shengtimsg += `"此乃圣体一脉真正的无敌资本，莫令蒙尘。"他一指洞穿虚空，将《终极圣体秘术》打入你的仙台！`;
                shengtimsg += `无数奥义如星河倒卷，冲刷你的神识。待你回神，那道悲凉身影已一步迈出，径直朝着生命禁区而去，继续未尽的征战...`;
                            // 学习功法
                            player.学习的功法.push('终极圣体秘术');
                            await Write_player(usr_qq, player);
                                       // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    shengtimsg
                ]);
            } else {
                await common.relpyPrivate(usr_qq, shengtimsg);
            }
                        } else {
                            // 概率触发但未获得的感悟
                            last_msg += ` 你手握菩提子，隐约感应到圣崖之巅与荧惑古星间存在着一条由圣血铺就的无形古路，一道悲凉的目光似乎跨越星海注视着你...（机缘未至，或可尝试提升天资以加深感应）`;
                        }
                    } else if (isMatureSaintBody && !isUltimateTechniqueLearned) {
                        // 条件不足的提示
                        if (!hasMarsAltar) {
                            last_msg += ` 你感到圣崖的大成圣体残尸内蕴藏着惊天奥秘，却缺乏关键引子，难以窥其门径。（提示：或与荧惑古星的秘密有关）`;
                        } else if (!hasPutiSeed) {
                            last_msg += ` 圣血轰鸣，道痕隐现，然仙台混沌，灵光难明。（需「菩提子」助你悟道，沟通火星圣体道痕）`;
                        } else if (isUltimateTechniqueLearned) {
                            last_msg += ` 你触及圣崖奥秘的瞬间，一道威严的道音震响：“大道唯一，此法已择主，后来者止步！” 终极圣体秘术的传承已被人捷足先登。`;
                        }
                    }
                }
                // 在荒古禁地探索事件中添加行字秘唯一性检查和天资要求
                     if (player.power_place == 2) {
                         let random = Math.random();
                         // 根据玩家的幸运值调整概率
                         let adjustedProbability = random ;
                         
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
                         // 最低要求天资等级索引（天纵之资，索引4）
                    const minAptitudeIndex = 4;
                     const tianxuanbufa = await checkGongfaInServer('天璇步法');
                             // 只有天资达到天纵之资及以上才可能触发
                    if (currentAptitudeIndex >= minAptitudeIndex&&!tianxuanbufa) {
                             // 概率调整：天资越高，概率越大
                             const aptitudeBonus = (currentAptitudeIndex - 3) * 0.025;
                             const finalProbability = 0.002 + aptitudeBonus; // 基础概率0.001 + 天资加成
                             
                             if (adjustedProbability < finalProbability) {
                                 // 检查全服是否已有人习得行字秘
                                 const isLearned = await checkGongfaInServer('天璇步法');
                                
      
                                 if (isLearned) {
                                     last_msg += ' 你在荒古禁地深处遇见一位疯疯癫癫的老人，他步履蹒跚却一步踏出便横跨万里。';
                                     last_msg += ' 你欲上前请教，他却摇头叹息："天璇步法已传他人，此道残缺，九秘归一..."';
                                     last_msg += ' 言罢，他身形一晃，化作一道流光消失在宇宙深处，只留下你独自怅然。';
                                 } else {
                                     last_msg += ' 你在荒古禁地深处遇见一位疯疯癫癫的老人，他步履蹒跚却一步踏出便横跨万里。';
                                     
                                     // 根据天资等级显示不同文案
                                     if (currentAptitudeIndex >= 7) { // 万古无双及以上
                                         last_msg += ' 老疯子浑浊的眸子突然清明："万古岁月，竟有如此天资！此秘术当传于你！"';
                                         last_msg += ' 他一步踏出，时空扭曲，直接出现在你面前，一指轻点你的眉心。';
                                     } else if (currentAptitudeIndex >= 5) { // 旷世奇才及以上
                                         last_msg += ' 老疯子停下脚步，眼中闪过一丝惊讶："如此天资，倒也有资格承我衣钵..."';
                                         last_msg += ' 他隔空一指，一道神光没入你的识海。';
                                     } else { // 天纵之资
                                         last_msg += ' 老疯子突然停下脚步，浑浊的眸子中闪过一丝清明："岁月悠悠，大道独行...此秘术当传于有缘人！"';
                                         last_msg += ' 他伸出一指，点向你的眉心。';
                                     }
                                     
                                     last_msg += ' 刹那间，残缺的九秘真谛涌入识海！';
                                     last_msg += ' 「天璇步法」——脱胎自行字秘的无上极速残篇，踏光阴、缩山河，一步踏出星月倒转！';
                                     last_msg += ' 待你回神，老人已化流光遁入宇宙，唯留残缺行字秘之道韵在神魂中流转不息。';
                                            player.学习的功法.push('天璇步法');
                                await Write_player(usr_qq, player);
                                 }
                             }
                         } else {
                             // 天资不足的提示 - 当索引小于4时显示
                             if (adjustedProbability < 0.01) { // 较低概率提示
                              last_msg += ' 你感知到一缕涉及时空的残缺道韵，似为某位存在遗留的步法痕迹...';
                              last_msg += ' 然其玄奥远超你当前境界，天资不足难以参透。（需「天纵之资」以上方可领悟天璇步法）';
                             }
                         }
                     }
                     // 圣崖探索事件 - 菩提子感悟行字秘
      if (weizhi.name === "圣崖") {
          let putizi = await exist_najie_thing(usr_qq, "菩提子", "道具");
          
          if (putizi && putizi >= 1) { // 持有菩提子方可触发
              let random = Math.random();
              // 天资越高触发概率越大（万古无双+5%，旷世奇才+3%）
              const aptitudeBonus = player.天资等级 === "万古无双" ? 0.05 : 
                                   player.天资等级 === "旷世奇才" ? 0.03 : 0;
              const baseProbability = 0.02; // 基础概率2%
              
              if (random < baseProbability + aptitudeBonus) {
                  // 检查全服是否已有人习得行字秘
                  const isLearned = await checkGongfaInServer('行字秘');
                  
                  // ==== 辰东风格文案 - 分三层意境构建 ====
                  last_msg += '圣崖之巅，封神榜金光刺破九重冥雾，映照出山体上干涸的圣血。';
                  
                  if (isLearned) {
                      last_msg += '你掌中菩提子忽生感应，引动崖顶帝阵轰鸣！一道跨越时空的叹息响彻云霄：';
                      last_msg += '"行字秘踏光阴逆岁月，然大道唯一...此路已绝！"';
                      last_msg += '封神榜骤然迸发亿万缕帝威，将时空道痕彻底碾碎！';
                  } else {
                      last_msg += '菩提子突绽混沌清辉，与山巅圣血共鸣！封神榜隆隆作响，竟显化出一条金光大道直通虚空。';
                      
                      // 天资分级文案
                      if (player.天资等级 === "万古无双") {
                          last_msg += '大成圣体残念自血痕中复苏："菩提明心，圣血为引...此子当承极速真谛！"';
                          last_msg += '枯寂的圣崖骤然浮现光阴长河，他脚踏星骸而来，一指洞穿时空！';
                      } else if (player.天资等级 === "旷世奇才") {
                          last_msg += '虚空裂开，老疯子身影踏光阴而至："菩提照前路，可窥行秘一角！"';
                          last_msg += '他双手撕开无始阵纹，将镇压万古的时空道痕接引入你识海！';
                      } else {
                          last_msg += '菩提道韵勾动圣尸棺椁，绿毛古棺剧震！棺盖缝隙迸射仙光，残缺的九秘真义如天河倒卷。';
                      }
                      
                      last_msg += '霎时天地失色！';
                      last_msg += '「行」字秘奥义化作光阴洪流冲霄而起：';
                      last_msg += '一步踏出，山河倒转；二步踏出，星月成灰；三步踏出，万古皆在脚下！';
                      last_msg += '待神光散尽，唯见菩提子表面多了一道横跨星域的刻痕...';
                      
                      // 功法学习（唯一性）
                       await Reduse_player_学习功法(player_id, '天璇步法');
                                                     player.学习的功法.push('行字秘');
                                await Write_player(usr_qq, player);
                  }
              } else {
                  // 未触发时的道韵感悟
                  last_msg += '菩提子映照封神榜金光，隐约窥见一道身影脚踏星骸、逆溯光阴长河。';
                  last_msg += '然无始阵纹骤然轰鸣，将时空道痕彻底封锁！唯留一句道喝回荡：';
                  last_msg += '"未历圣血染苍穹，何谈极速破万古？"';
              }
          } else {
              // 无菩提子提示
              last_msg += '圣崖之巅，封神榜垂落亿万缕帝威。';
              last_msg += '你隐约感知到棺椁中蕴藏着涉及时空的奥义，却如雾里看花终隔一层。';
              last_msg += '（需「菩提子」为引方有机会参悟）';
          }
      }
      if (weizhi.name === "霸体祖星") {
          // 检查触发条件
          const isMinorBati = player.灵根.type === "小成霸体";
          const hasNotBeenBaptized = !player.霸体祖星洗礼;
          
          if (isMinorBati && hasNotBeenBaptized) {
              // 构建辰东风格文案
              let eventMsg = [];
              
              // ==== 事件开篇 ====
              eventMsg.push(` 紫气东来三万里，霸星横亘星河间！`);
              eventMsg.push(`你踏上霸体祖星，顿时感到血脉沸腾，紫色血气不受控制地冲天而起，`);
              eventMsg.push(`与整颗古星共鸣，惊动了沉睡在祖地深处的古老存在...`);
              eventMsg.push(``);
              
              // ==== 年迈霸体现身 ====
              eventMsg.push(` 祖地深处，一道枯槁身影缓缓走出，虽气血衰败如残烛，`);
              eventMsg.push(`但那双眸子却如紫色星辰般璀璨，透出睥睨天下的霸气！`);
              eventMsg.push(`"多少万年了...终于等到一个像样的后辈..."苍老的声音震动虚空，`);
              eventMsg.push(`"吾乃霸体一脉第七代传人，苟延残喘至今，只为守护祖地传承..."`);
              eventMsg.push(``);
              
              // ==== 传功过程 ====
              eventMsg.push(` 老者突然出手，一指洞穿虚空，紫色血气化作九条真龙，`);
              eventMsg.push(`直贯你的仙台！"接吾最后一滴霸血精华！"`);
              eventMsg.push(`刹那间，你体内霸血沸腾如海，紫色神光冲破云霄，`);
              eventMsg.push(`整颗霸体祖星都在震颤，万道法则哀鸣！`);
              eventMsg.push(``);
              eventMsg.push(` 苦海中紫浪滔天，轮海秘境自主演化，`);
              eventMsg.push(`道宫五脏齐鸣，四极通天彻地，化龙脊柱铮铮作响！`);
              eventMsg.push(`"这便是...真正的霸体本源么？"你感受到前所未有的力量在体内奔涌。`);
              eventMsg.push(``);
              
              // ==== 祖地洗礼指引 ====
              eventMsg.push(` 老者身形愈发虚幻，却目光如炬："这点精华只够引路，`);
              eventMsg.push(`真正的造化在祖地最深处——霸血祖池！"`);
              eventMsg.push(`他指向星空中一条紫色古路："踏上这条先祖血路，`);
              eventMsg.push(`接受万古霸血的洗礼，方成真正的大成霸体！"`);
              eventMsg.push(``);
              eventMsg.push(` 话音未落，老者身影化作点点紫光消散，`);
              eventMsg.push(`唯留一道神念烙印在你识海："莫负霸体之名...护我人族星域..."`);
              eventMsg.push(``);
              
              // ==== 洗礼完成 ====
              eventMsg.push(` 你遵循指引，踏上紫色古路，来到霸血祖池前。`);
              eventMsg.push(`池中紫色神液沸腾，万古霸血精华凝聚，`);
              eventMsg.push(`你一踏入其中，顿时感到浑身血肉重组，骨骼重塑！`);
              eventMsg.push(``);
              eventMsg.push(` 紫色血气化作真龙、神凰、麒麟等九大异象，`);
              eventMsg.push(`环绕祖池飞舞，整片星空都被映照成紫色！`);
              eventMsg.push(`"啊——"你忍不住长啸，声震九霄，`);
              eventMsg.push(`霸体本源在这一刻彻底觉醒，真正的小成霸体就此诞生！`);
              eventMsg.push(``);
              
              // ==== 结局 ====
              eventMsg.push(` 【霸体祖星洗礼完成】`);
              eventMsg.push(`你感受到体内流淌着最纯粹的霸血，`);
              eventMsg.push(`举手投足间可碎星辰，紫色血气贯穿古今未来！`);
              eventMsg.push(`那位逝去的先祖，将他最后的精华与期望，都传承给了你...`);
              
              // 更新玩家状态
              player.霸体祖星洗礼 = 1;
              player.攻击加成 += 5000000000; 
              player.防御加成 += 5000000000; 
              player.生命加成 += 5000000000; 
              player.修为 += 50000000; // 增加修为
              player.血气 += 50000000; // 增加修为
              player.道伤 = 0;
              // 解锁霸体专属能力
              if (!player.学习的功法.includes("苍穹霸印")) {
                  player.学习的功法.push("苍穹霸印");
              }
              if (!player.学习的功法.includes("霸血焚天诀")) {
                  player.学习的功法.push("霸血焚天诀");
              }
              
              // 保存玩家数据
              await Write_player(usr_qq, player);
              
              // 合并消息数组为字符串
              const finalMsg = eventMsg.join('\n');
              
              // ==== 消息推送 ====
              if (e.isGroup) {
                  // 群聊消息
                  await Bot.pickGroup(e.group_id).sendMsg([
                      segment.at(usr_qq),
                      finalMsg
                  ]);
              } else {
                  // 私聊消息
                  await common.relpyPrivate(usr_qq, finalMsg);
              }
          } else if (!isMinorBati) {
              last_msg += ' 你来霸体祖星深处，忽然法则轰鸣，紫色血气如天渊般将你拒之门外：非霸体血脉，不得入内！';
          } else if (player.霸体祖星洗礼) {
              last_msg += ' 你已接受过霸血祖池洗礼，祖地深处只余那位先祖的淡淡回音：莫负霸体之名...!';
          }
      }
 if (weizhi.name === "圣崖") {
    if (player.mijinglevel_id < 12 && player.xiangulevel_id < 12 && Math.random() < 0.4) {
        try {
            // ==== 辰东风格文案 - 分三层意境 ====
            let penaltyMsg = [
                '【大帝阵纹·圣崖惊变】',
                '你踏入圣崖核心区域，忽感天地倒悬！',
                '封神榜骤然迸发亿万缕帝威，',
                '山体上无始大帝刻下的阵纹复苏：',
                '一道金光扫过，护体法宝尽碎',
                '二道帝纹绞杀，肉身龟裂血染圣崖',
                '三道封神榜垂落，元神几近崩散',
                '「大帝阵纹，非圣不可触！」',
                '虚空中响起无始大帝的道喝：',
                '"圣崖葬圣躯，岂容凡躯亵渎！"',
                '你燃烧精血施展禁忌遁术：',
                '折损三件秘宝（随机丢失三样纳戒物品）',
                '自斩三成道基（修为血气减少30%）',
                '仍被一缕帝威侵入紫府，留下大道暗伤（道伤+1）',
                '劫后余生的你回望圣崖：',
                '封神榜猎猎作响，圣血在阵纹中流淌',
                '山巅传来大成圣体残念的叹息：',
                '"未成圣...莫踏帝阵..."'
            ].join('\n');

            // 执行基础惩罚
            player.道伤 += 1;
            player.修为 *= 0.7;
            player.血气 *= 0.7;
            // 检查道伤是否加剧
            let daoShangMsg = ''; // 单独存储道伤加剧的消息
            if (player.道伤 > 1) {
                daoShangMsg = [
                    '\n\n【道伤加剧·道基崩解】',
                    '你原本的道伤在帝威冲击下骤然恶化！',
                    '紫府中大道根基寸寸崩裂，',
                    '体内道则秩序链纷纷断裂：',
                    '「噗——」一口道血喷出，染红圣崖石壁',
                    '境界跌落！肉身衰败！秘境崩塌！仙古道痕消散！',
                    '虚空中回荡着无始大帝的叹息：',
                    '"道基崩解，仙路已断..."',
                    '你以残存道力护住本源，',
                    '勉强保住最后一丝根基（等级不会低于1级）',
                    '但道伤已深入骨髓，仙路艰难...'
                ].join('\n');
                
                // 定义需要惩罚的属性列表
                const levelProperties = [
                    'level_id', 
                    'Physique_id', 
                    'mijinglevel_id', 
                    'xiangulevel_id'
                ];
                
                // 对每个属性随机扣除1-3级（不低于1级）
                levelProperties.forEach(prop => {
                    if (player[prop] > 1) {
                        const reduction = Math.floor(Math.random() * 3) + 1; // 随机1-3
                        const newLevel = Math.max(1, player[prop] - reduction);
                        daoShangMsg += `\n${getPropertyName(prop)}: ${player[prop]} → ${newLevel} (跌落${reduction}级)`;
                        player[prop] = newLevel;
                    }
                });
            } else {
                // 基础惩罚（每个等级扣除1级，不低于1级）
                player.level_id = Math.max(1, player.level_id - 1);
                player.Physique_id = Math.max(1, player.Physique_id - 1);
                player.mijinglevel_id = Math.max(1, player.mijinglevel_id - 1);
                player.xiangulevel_id = Math.max(1, player.xiangulevel_id - 1);
            }
            
            // 合并消息
            penaltyMsg += daoShangMsg;
            
            await Write_player(usr_qq, player);
            // ==== 纳戒物品损失逻辑（基于过去身暴露事件优化）====
            const najie = await Read_najie(usr_qq);
            let lostItems = [];
            const itemCategories = ["丹药", "道具","盒子","仙宠口粮", "功法", "草药", "材料"];

            // 随机选择1-4个受影响分类（增强随机性）
            const affectedCategories = [...itemCategories]
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 4) + 1);

            // 处理每个受影响分类
            for (const category of affectedCategories) {
                const categoryItems = najie[category] || [];
                if (!categoryItems.length) continue;

                // 随机选择1-3件物品
                const itemsToAffect = [...categoryItems]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, Math.floor(Math.random() * 3) + 1);

                for (const item of itemsToAffect) {
                    const currentQuantity = await exist_najie_thing(usr_qq, item.name, category);
                    if (currentQuantity <= 0) continue;

                    // 损失比例10%-50%（至少1个）
                    const lostAmount = Math.max(1, Math.floor(
                        currentQuantity * (0.1 + Math.random() * 0.4)
                    ));
                    const actualLost = Math.min(lostAmount, currentQuantity);

                    await Add_najie_thing(usr_qq, item.name, category, -actualLost);
                    lostItems.push({
                        name: item.name,
                        quantity: actualLost,
                        category
                    });
                }
            }

            // 添加损失物品到消息
            if (lostItems.length > 0) {
                penaltyMsg += `\n损失物品：${
                    lostItems.map(item => `${item.name} x${item.quantity}`).join('，')
                }`;
            } else {
                penaltyMsg += `\n※ 纳戒空间震荡但未丢失物品`;
            }

            // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg);
            }
            
        } catch (err) {
            console.error("圣崖事件处理失败:", err);
            // 错误处理（避免崩溃）
            await common.relpyPrivate(usr_qq, "帝阵反噬过强，天机紊乱！请稍后再试");
        }
    }
}
if (weizhi.name === "北斗星紫山") {
    if (player.mijinglevel_id < 12 && player.xiangulevel_id < 12&& Math.random() < 0.4) {
        try {
            // 三重惩罚
            player.当前血量 *= 0.5; // 血量减半
            player.修为 *= 0.7;    // 修为损失30%
            player.道伤 += 2;      // 双重道伤

            // 文案
            const penaltyMsg = [
                '【紫山·帝阵绞杀】',
                '你靠近紫山，封神榜骤然绽放仙光！',
                '无始钟声震碎山河：',
                '"咚——"',
                '帝阵复苏，一道仙光削去你半条性命',
                '太古王族的诅咒侵入道基：',
                '「呃啊！」七窍流血，修为暴跌',
                '山体裂开缝隙，伸出苍白巨手：',
                '"人族...成为我等血食..."',
                '你祭出禁器自爆才挣脱束缚',
                '逃出百里回望：',
                '紫山云雾缭绕，钟声余韵未绝',
                '（道伤+2，精血亏损）'
            ].join('\n');



            await Write_player(usr_qq, player);
            // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg);
            }
            
        } catch (err) {
            console.error("紫山事件处理失败:", err);
            await common.reply(e, "无始钟波扰乱天机！推演失败");
        }
    }
}

if (weizhi.name === "荒古禁地") {
    if (player.mijinglevel_id < 12&& player.xiangulevel_id < 12 && Math.random() < 0.4) {
        try {
            // 基础惩罚
            const ageIncrease =  Math.floor(Math.random() * player.寿元); // 增加10-30岁
            player.寿元 -= ageIncrease;
            player.level_id = Math.max(1, player.level_id - 1); // 境界跌落1级

            // 文案
            let penaltyMsg = [
                '【荒古禁地·时间牢笼】',
                '你踏入禁地外围，瞬间被时间之力笼罩！',
                '青丝变白发，容颜顷刻衰老：',
                `寿元削减${ageIncrease}载！`,
                '一道白衣荒奴从深渊浮现，',
                '抬手间削去你一层境界！',
                '你祭出法宝抵挡，道器在时间侵蚀下化为飞灰',
                '燃烧本源精血才逃出禁地...',
                '回望深渊，九座圣山在雾霭中若隐若现'
            ].join('\n');

            // 30%概率重伤（道伤+1）
            if (Math.random() < 0.3) {
                player.道伤 += 1;
                penaltyMsg += '\n道躯被时间道则侵蚀（道伤+1）';
            }

            await Write_player(usr_qq, player);
            // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg);
            }
            
        } catch (err) {
            console.error("荒古禁地事件处理失败:", err);
            await common.reply(e, "时间道则反噬！推演中断");
        }
    }
}
if (weizhi.name === "太初古矿") {
    if (player.mijinglevel_id < 12&& player.xiangulevel_id < 12&& Math.random() < 0.4) {
        try {
            // 基础惩罚
            const lostPercent = 0.4 + Math.random() * 0.3; // 流失40%-70%修为和血气
            player.修为 *= (1 - lostPercent);
            player.血气 *= (1 - lostPercent);
            player.道伤 += 1;

            // 文案
            let penaltyMsg = [
                '【太初古矿·生命禁区】',
                '你踏入太初古矿边缘，忽觉天地倒转！',
                '矿脉中弥漫的混沌雾气吞噬你的生命精气：',
                '「呃啊——」你感到修为飞速流逝',
                '太古生物的低语在矿洞中回荡：',
                '"人族...血食..."',
                '一道黑影掠过，利爪撕裂你的道躯：',
                `修为流失${(lostPercent*100).toFixed(0)}%，血气枯竭`,
                '道基受损（道伤+1）',
                '你燃烧精血逃出古矿，回望时：',
                '矿洞深处亮起无数猩红眼眸...'
            ].join('\n');

            // 随机丢失物品（30%概率）
            if (Math.random() < 0.3) {
                const najie = await Read_najie(usr_qq);
                const categories = Object.keys(najie).filter(cat => najie[cat]?.length > 0);
                if (categories.length > 0) {
                    const randCat = categories[Math.floor(Math.random() * categories.length)];
                    const items = najie[randCat];
                    const lostItem = items[Math.floor(Math.random() * items.length)];
                    const lostQty = Math.min(lostItem.数量, Math.floor(Math.random() * 5) + 1);
                    
                    await Add_najie_thing(usr_qq, lostItem.name, randCat, -lostQty);
                    penaltyMsg += `\n逃遁中遗失：${lostItem.name}×${lostQty}`;
                }
            }

            await Write_player(usr_qq, player);
             // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg);
            }
            
        } catch (err) {
            console.error("太初古矿事件处理失败:", err);
            await common.reply(e, "太初之气紊乱！推演失败");
        }
    }
}
if (weizhi.name === "石国皇都") {
    if (player.mijinglevel_id < 12 && player.xiangulevel_id < 12 && Math.random() < 0.4) {
        try {
            let penaltyMsg = [];
            let obtainedBone = false;
            
            // 基础惩罚
            const lostPercent = 0.3 + Math.random() * 0.3; // 流失30%-60%修为和血气
            player.修为 *= (1 - lostPercent);
            player.血气 *= (1 - lostPercent);
            player.道伤 += 1;

            // 10%概率获得万灵图残骨一
            if (Math.random() < 0.1) {
                await Add_najie_thing(usr_qq, "万灵图残骨一", "材料", 1);
                obtainedBone = true;
            }

            // 文案
            penaltyMsg.push(
                '【皇都风云·拍卖风波】',
                '你踏入石国皇都拍卖场，欲竞拍万灵图残骨一',
            );
            
            if (obtainedBone) {
                penaltyMsg.push(
                    '竞价至白热化时，你灵机一动：',
                    '暗中施展秘术替换了拍卖品！',
                    '成功获取万灵图残骨一！',
                    '但被武王府强者察觉：',
                    '"大胆贼子！竟敢在皇都行窃！"',
                    '一道皇道龙气击中后背：',
                    `修为流失${(lostPercent*100).toFixed(0)}%，血气枯竭`,
                    '道基受损（道伤+1）',
                    '你燃烧精血遁出皇都，怀中紧握残骨',
                    '石昊在城头带着赞许的眼神望着你："有点意思..."'
                );
            } else {
                penaltyMsg.push(
                    '竞价至白热化时，一股恐怖威压降临：',
                    '"哼！区区蝼蚁也敢觊觎人皇秘宝？"',
                    '武王府强者现身，一掌拍碎拍卖台：',
                    '「噗——」你被皇道龙气震飞，口吐鲜血',
                    `修为流失${(lostPercent*100).toFixed(0)}%，血气枯竭`,
                    '石皇虚影浮现，声如洪钟：',
                    '"皇都重地，岂容宵小放肆！"',
                    '一道人皇印余波扫过，道基受损（道伤+1）',
                    '你仓皇逃出皇都，回望城楼：',
                    '武王府旌旗猎猎，混乱中你瞥见石昊的身影，他正若有所思地看着这场闹剧'
                );
            }

            await Write_player(usr_qq, player);
            // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg.join('\n')
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg.join('\n'));
            }
            
        } catch (err) {
            console.error("石国皇都事件处理失败:", err);
            await common.reply(e, "人皇威压扰乱天机！推演失败");
        }
    }
}
if (weizhi.name === "西陵界") {
    if (player.mijinglevel_id < 12 && player.xiangulevel_id < 12 && Math.random() < 0.4) {
        try {
            let penaltyMsg = [];
            let obtainedBone = false;
            
            // 基础惩罚
            const hpLoss = player.当前血量 * (0.4 + Math.random() * 0.3); // 损失40%-70%血量
            player.当前血量 -= hpLoss;
            player.道伤 += 2; // 双重道伤

            // 15%概率获得万灵图残骨三（西陵界更危险但机会更大）
            if (Math.random() < 0.15) {
                await Add_najie_thing(usr_qq, "万灵图残骨三", "材料", 1);
                obtainedBone = true;
            }

            // 文案
            penaltyMsg.push(
                '【西陵惊魂·葬士苏醒】',
                '你潜入西陵界深处，欲寻万灵图残骨三',
            );
            
            if (obtainedBone) {
                penaltyMsg.push(
                    '在葬土深处，你发现万灵图残骨三！',
                    '但触碰瞬间，葬士苏醒：',
                    '"亵渎葬地者，永世为奴！"',
                    '枯爪撕裂虚空，你拼死抵抗：',
                    `生命精气流失${hpLoss.toFixed(0)}点！`,
                    '双重死亡诅咒侵入道基（道伤+2）',
                    '燃烧本源精血逃出葬地，',
                    '怀中紧握万灵图残骨三！',
                    '葬士在深渊咆哮："吾必上穷碧落下黄泉将你诛杀！"'
                );
            } else {
                penaltyMsg.push(
                    '阴风骤起，葬土翻涌：',
                    '"擅闯葬地者，永世为奴！"',
                    '上古葬士从棺椁中苏醒，',
                    '枯爪撕裂虚空，死亡道则侵蚀：',
                    `生命精气流失${hpLoss.toFixed(0)}点！`,
                    '你祭出法宝抵挡：',
                    '「咔嚓！」道器在葬气中化为飞灰',
                    '葬士吟诵古老葬经：',
                    '"以汝之血，祭奠诸天！"',
                    '双重死亡诅咒侵入道基（道伤+2）',
                    '燃烧精血逃出葬地，回望时：',
                    '万灵图残骨三在葬土深处闪烁幽光'
                );
            }

  

            await Write_player(usr_qq, player);
            // ==== 消息推送 ====
            if (action.group_id) {
                await Bot.pickGroup(action.group_id).sendMsg([
                    segment.at(usr_qq),
                    penaltyMsg.join('\n')
                ]);
            } else {
                await common.relpyPrivate(usr_qq, penaltyMsg.join('\n'));
            }
            
        } catch (err) {
            console.error("西陵界事件处理失败:", err);
            await common.reply(e, "葬地死气扰乱天机！推演失败");
        }
    }
}
if (weizhi.name === "石村") {
    // 检查是否达到搬血极境
    if (player.极境 && player.极境.includes("2")) {
        // 检查是否已经获得柳神赏识
        let hasLiushang = false;
        if (player.剧情人物 && Array.isArray(player.剧情人物)) {
            hasLiushang = player.剧情人物.some(np => np.柳神);
        }
        
        if (!hasLiushang) {
            // 首次触发柳神赏识事件
            last_msg += '你重返石村，周身血气如龙，十万八千斤神力内蕴而不发。';
            last_msg += '村口焦黑的柳树桩忽生异象，一抹嫩绿新芽破桩而出，散发出浩瀚生命精气！';
            last_msg += '虚空颤动，一道朦胧身影自柳树中显化，眸若星辰，俯瞰苍生：';
            last_msg += '"搬血极境，肉身成圣...想不到在这荒僻之地，竟有如此根基之人。"';
            last_msg += '"吾乃柳神，曾历大劫，蛰伏于此。汝既达极境，可愿承吾之道统？"';
            
            // 初始化柳神关系
            if (!player.剧情人物) {
                player.剧情人物 = [];
            }
            player.剧情人物.push({
                "柳神": 1,
                "关系": 1, // 1表示赏识关系
                "好感度": 0,
                "解锁时间": new Date().getTime(),
                "事件记录": ["搬血极境得赏识"]
            });
            
            // 额外奖励（根据原著柳神赐福）
            const rewardExp = Math.floor(player.修为 * 0.1); // 修为提升10%
            await Add_修为(usr_qq, rewardExp);
            
            last_msg += '柳神指尖轻点，一缕生命精气没入你体内，修为暴涨！';
            last_msg += `获得修为：${bigNumberTransform(rewardExp)}`;
            last_msg += '剧情人物「柳神」关系已建立，好感度：0';
            
            // 保存玩家数据
            await Write_player(usr_qq, player);
        } else {
            // 已建立关系后的互动
            const liuShen = player.剧情人物.find(np => np.柳神);
            const randomEvent = Math.random();
            
            if (randomEvent < 0.3) {
                // 柳神指点修行
                last_msg += '你于柳树下静坐，柳神虚影再现："极境非终点，大道在前方..."';
                last_msg += '柳枝轻拂，道韵流转，你对修行的理解更加深刻了';
                
                // 增加好感度
                liuShen.好感度 += 5;
                 if (liuShen.好感度>=120) {
                 const newRelationLevel = Math.min(3, Math.floor(liuShen.好感度 / 120) + 1);
                  liuShen.关系 = newRelationLevel;
                  }
                await Write_player(usr_qq, player);
            } else if (randomEvent < 0.6) {
                // 柳神讲述上古秘辛
                last_msg += '柳神声音缥缈："上古年间，大劫起于界海，仙王喋血，天地崩裂..."';
                last_msg += '你聆听上古秘辛，道心更加坚定';
                
                // 增加好感度
                liuShen.好感度 += 3;
                 if (liuShen.好感度>=120) {
                 const newRelationLevel = Math.min(3, Math.floor(liuShen.好感度 / 120) + 1);
                  liuShen.关系 = newRelationLevel;
                  }
                await Write_player(usr_qq, player);
            } else {
                // 普通问候
                last_msg += '柳树嫩芽轻轻摇曳，散发出温和的生命气息，滋养你的肉身';
            }
        }
    } else {
        // 未达搬血极境的普通石村事件
        last_msg += '石村宁静祥和，村口焦黑的柳树桩毫无生机，村民们过着朴实的生活。';
        last_msg += '老族长看着你感叹道："孩子，若你能达到传说中的极境，或许能唤醒柳神大人的一丝灵识..."';
    }
}
            if (weizhi.name != '诸神黄昏·旧神界') {
              //判断是不是旧神界
              let random = Math.random();
               if (player.灵根.type === "魔卡少女" ) {
              n += 1;
              last_msg += '你是魔卡少女，集天地万千宠爱于一身，所以在本次探索中额外获得一件奖励 ';
            }
if (player.灵根.type === "魔卡少女·觉醒") {
  n *= 2;
  last_msg += '「星之力啊，请赐予我光辉！」 ';
  last_msg += '星之杖闪耀着璀璨光芒，小樱牌的力量完全解放，奖励翻倍 ';
}

if (player.灵根.type === "魔卡少女·完全") {
  n *= 5;
  last_msg += '「所有的心，成为我的力量！」 ';
  last_msg += '梦之杖绽放出彩虹般的光辉，透明牌的力量让奖励获得五倍加成 ';
}
              if (random < player.幸运) {
                if (random < player.addluckyNo) {
                  last_msg += '福源丹生效，所以在';
                } else if (player.仙宠.type == '幸运') {
                  last_msg += '仙宠使你在探索中欧气满满，所以在';
                }
                n *= 2;
                last_msg +=
                  '探索过程中意外发现了两份机缘,最终获取机缘数量将翻倍 ';
              }
              if (player.islucky > 0) {
                player.islucky--;
                if (player.islucky != 0) {
                  fyd_msg = `   福源丹的效力将在${player.islucky}次探索后失效 `;
                } else {
                  fyd_msg = `   本次探索后，福源丹已失效 `;
                  player.幸运 -= player.addluckyNo;
                  player.addluckyNo = 0;
                }
                data.setData('player', player_id, player);
              }
            }
            // 条件：玩家境界>42，炼体>42，秘境<21，仙古<21，33%概率
if (player.level_id > 42 && player.Physique_id > 42 && 
    player.mijinglevel_id < 14 && player.xiangulevel_id < 14 && 
    Math.random() < 0.33) {
    
    // 计算被夺走的数量（向下取整，确保是整数）
    let jianshao = Math.floor(n * 0.5);
    
    // 确保至少保留1个
    if (n - jianshao < 1) {
        jianshao = n - 1; // 如果夺走一半后不足1个，就只保留1个
    }
    
    const stolenAmount = jianshao;
    n = n - jianshao; // 玩家实际获得的数量
    // 构建夺宝消息
    last_msg += `虚空裂开，一道黑影如鬼魅般降临！诸天道贼显化，气息如渊似狱，压得你动弹不得！`;
    last_msg += `蝼蚁也配染指此等神物？本座便替你保管了！`;
    last_msg += `黑影袖袍一卷，将你探索所得的[${stolenAmount}个${thing_name}]夺走！`;
    last_msg += `你拼死抵抗，最终保住了[${n}个${thing_name}]。`;
}
 m += `]×${n}个。`;
            let xiuwei = 0;
            //默认结算装备数
            let now_level_id;
            let now_physique_id;
            now_level_id = player.level_id;
            now_physique_id = player.Physique_id;
            //结算
            let qixue = 0;
            if (msgg.find(item => item == A_win)) {
              xiuwei = Math.trunc(
                2000 + (100 * now_level_id * now_level_id * t1 * 0.1) / 5
              );
              qixue = Math.trunc(
                2000 + 100 * now_physique_id * now_physique_id * t2 * 0.1
              );
              if (thing_name) {


                if(isNotNull(msg_last[thing_name])){
                  msg_last[thing_name]+=n
                }else{
                  msg_last[thing_name]=n
                }
                
                await Add_najie_thing(player_id, thing_name, thing_class, n);
              }
             
              last_msg += `${m},不巧撞见[${
                B_player.名号
              }],经过一番战斗，击败对手,获得修为${xiuwei},气血${qixue},剩余血量${
                A_player.当前血量 + Data_battle.A_xue
              },剩余次数${action.cishu - 1}`;
                let random = Math.random();
                  if ( weizhi.name == '荧惑古星' && random <0.1&& player.五色祭坛 !== 1) {
          player.五色祭坛 = 1
          await Write_player(usr_qq, player);
            last_msg += '你在荧惑古星找到了一处五色祭坛，五色祭坛散发着神秘光芒，似乎可以通往其他位面';
          }
                        // 定义特殊灵根类型数组
const specialLinggenTypes = ["转生", "魔头", "命运", "天魔", "神魔体"];

// 检查玩家是否拥有特殊灵根
const hasSpecialLinggen = specialLinggenTypes.includes(player.灵根.type);
              if (random < 0.1 && hasSpecialLinggen)  {
              last_msg += `无意卷入时空漩涡，见到了初入旧神界的叶箫！他告诉你整个凡俗和修仙界是邪神设立的囚牢，现世大道已经被其污染，一定要想办法超脱出去并给了你【旧神印章】*1`;
              await Add_najie_thing(player_id, '旧神印章', '材料', 1);
              }
              if (random < 0.15 && random >= 0.1&&hasSpecialLinggen) {
              last_msg += `忽然天地摇晃，遭遇恐怖大能跨越时间长河要将你扼杀摇篮之中！关键时刻，一道巨大的拳印出现，将他打的灰飞烟灭，你暗道虚惊一场，刚要离开却发现了【仙王残魂】*1`;
              await Add_najie_thing(player_id, '仙王残魂', '材料', 1);
              }
              if ( random < 0.2 && random >= 0.16&&hasSpecialLinggen) {
             last_msg += `你仿佛梦回仙古，在仙古中你与那个时代的无数绝世天骄争雄，与他们结交，相互论道，其乐融融，但好景不长，恐怖的邪神入侵仙古，将仙古打的支离破碎，你的好友全都牺牲在那场大战中，你无力扭转这一切，心中有万般痛苦和愤怒也随着这场大梦苏醒而忘却，手中多了一道【轮回印】*1`;
             await Add_najie_thing(player_id, '轮回印', '材料', 1);
             }
              
              let newrandom = 0.995;
              let dy = await Read_danyao(player_id);
              newrandom -= dy.beiyong1;
              if (dy.ped > 0) {
                dy.ped--;
              } else {
                dy.beiyong1 = 0;
                dy.ped = 0;
              }
              await Write_danyao(player_id, dy);
              if (random > newrandom) {
                let length = data.xianchonkouliang.length;
                let index = Math.trunc(Math.random() * length);
                let kouliang = data.xianchonkouliang[index];
                fyd_msg +=
                  ' 七彩流光的神奇仙谷[' +
                  kouliang.name +
                  ']深埋在土壤中，是仙兽们的最爱。';
                await Add_najie_thing(player_id, kouliang.name, '仙宠口粮', 1);
              }
              let random_pifu= Math.random()
              if(random_pifu>0.999999){
                if(najie_random>0.5){
                  let length_najie=data.kamian.length
                  let index_najie=Math.trunc(Math.random() * length_najie);
                  let Get_najie=data.kamian[index_najie]
                  fyd_msg +=
                  ' 历经九九八十一难，在历练中练就出了一道玄影[' +
                  Get_najie.name +
                  ']';
                  await Add_najie_thing(player_id, Get_najie.name, '道具', 1);
                }else{
                  let length_lianqi=data.kamian3.length
                  let index_lianqi=Math.trunc(Math.random() * length_lianqi);
                  let Get_lianqi=data.kamian3[index_lianqi]
                  fyd_msg +=
                  ' 历经九九八十一难，在历练中练就出了一道玄影[' +
                  Get_lianqi.name +
                  ']';
                  await Add_najie_thing(player_id, Get_lianqi.name, '道具', 1);
                }
              }
               if (random < 0.001) {
    // 天资等级序列（与洗炼相同）
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
    
    // 获取当前天资位置
    const currentIndex = aptitudeSequence.indexOf(player.天资等级);
    
    // 最高提升到万古无双（限制在索引7）
    let newIndex = Math.min(currentIndex + 1, 7);
    
    // 如果已经是万古无双或更高，则不再提升
    if (currentIndex >= 7) {
        last_msg += `${B_player.名号}倒下后，你转身瞧见一位仙风道骨的老者。他目光如渊，仿佛能洞穿万古时空："小友资质已臻至境，老朽亦无可指点。"话音未落，身影已如梦幻泡影般消散。`;
        return;
    }
    
    let newAptitude = aptitudeSequence[newIndex];
    
    // 天资评价库
    const aptitudeEvaluations = {
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
    
 
last_msg += `
${B_player.名号}倒下后，你转身瞧见一位仙风道骨的老者。
他目光如渊，仿佛能洞穿万古时空："小友根骨尚可，却未脱樊笼。老朽观你与道有缘，便助你一臂之力。"
只见老者袖袍轻拂，九天星河倒悬，鸿蒙紫气自虚空裂缝奔涌而出，将你笼罩其中。
你感到浑身经脉如被重塑，识海中浮现无尽道韵，仿佛经历了万世轮回。
待光华散尽，老者身影已如梦幻泡影般消散，只余一缕道音回荡：
"万古弹指间，大梦几千秋。他日若得道，莫忘此日缘..."
天资蜕变：
原资质：『${player.天资等级}』→ 新资质：『${newAptitude}』
${aptitudeEvaluations[newAptitude]}
获得【如梦道痕】*1
`;
    
    // 更新玩家天资
    player.天资等级 = newAptitude;
    player.天资评价 = aptitudeEvaluations[newAptitude];
    await Write_player(usr_qq, player);
    
    // 添加特殊道具
    await Add_najie_thing(player_id, '如梦道痕', '道具', 1);
   
}
              if (random > 0.1 && random < 0.1002) {
                fyd_msg +=
                  ' ' +
                  B_player.名号 +
                  '倒下后,你正准备离开此地，看见路边草丛里有个长相奇怪的石头，顺手放进了纳戒。';
                await Add_najie_thing(player_id, '长相奇怪的小石头', '道具', 1);
              }
       if ( random < 0.005&& !player.剑云海奇遇) {
    last_msg += [
        `${B_player.名号}倒下后，你正欲离去，`,
        `忽见九天云海翻涌，一道白衣身影踏空而至！`,
        `来人剑眉星目，神姿卓绝，周身道韵流转，气息悠远如亘古星河。`,
        `他负手立于虚空，眸中带着一丝欣赏：道友天赋异禀，日后可持此令来剑云海寻我。`,
        `话音未落，一块令牌破空而来，入手温润如玉,`,
        `正面刻有"剑云海"三个道文，背面则是一柄贯穿九天的神剑图案！`,
    ].join(' ');
    player.剑云海奇遇 = true;
    await Write_player(usr_qq, player);
    await Add_najie_thing(player_id, '剑云海令牌', '道具', 1);
}
                let random2 = Math.random();
            let caoyao = '';
            if (A_player.职业 == '采药师') {
              if (random2 > 0.95 && random2 <= 1) {
                caoyao += '"仙蕴花"';
                await Add_najie_thing(action.usr_id, '仙蕴花', '草药', 1);
              } else if (random2 > 0.9 && random2 <= 0.95) {
                caoyao += '"魔蕴花"';
                await Add_najie_thing(action.usr_id, '魔蕴花', '草药', 1);
              } else if (random2 > 0.88 && random2 < 0.885) {
                caoyao += '"太玄仙草"';
                await Add_najie_thing(action.usr_id, '太玄仙草', '草药', 1);
              } else if (random2 > 0.83 && random2 <= 0.88) {
                caoyao += '"古神藤"';
                await Add_najie_thing(action.usr_id, '古神藤', '草药', 1);
              } 
               else if (random2 > 0.80 && random2 <= 0.83) {
                caoyao += '"炼骨花"';
                await Add_najie_thing(action.usr_id, '炼骨花', '草药', 1);
              } else if (random2 > 0.005 && random2 <= 0.01) {
                caoyao += '"仙缘草"';
                await Add_najie_thing(action.usr_id, '仙缘草', '草药', 1);
              }
              if (
                random2 > 0.95 && random2 <= 1 ||
                random2 > 0.9 && random2 <= 0.95 ||
                random2 > 0.88 && random2 < 0.885 ||
                random2 > 0.83 && random2 <= 0.88 ||
                random2 > 0 && random2 <= 0.005 ||
                random2 > 0.80 && random2 <= 0.83 ||
                random2 > 0.005 && random2 <= 0.01
              ) {
                last_msg +=
                  '  ' +
                  '身为采药师的你发现了' +
                  caoyao +
                  '并把它放进了口袋';
              }
            }
            }else if (msgg.find(item => item == B_win)) {
  // === 添加大帝庇护逻辑开始 ===
  if (player.大帝庇护 === 1 && player.庇护人) {
    const protectorQQ = player.庇护人; // 庇护人的QQ号
    
    try {
      // 读取庇护人数据
      const protector = await Read_player(protectorQQ);
      const protectorEquipment = await Read_equipment(protectorQQ);
      
      // === 添加战斗开场文案 ===
      const battleStart = [
        `${player.名号}不巧撞见${B_player.名号}，被其重创！`,
        `就在这危在旦夕之际！`
      ];
      msg = msg.concat(battleStart);
      
      // 构建庇护人战斗数据
      const protectorBattleData = {
        名号: protector.名号,
        攻击: protector.攻击,
        防御: protector.防御,
        当前血量: protector.当前血量,
        暴击率: protector.暴击率,
        法球倍率: protector.灵根.法球倍率,
        学习的功法: protector.学习的功法,
        灵根: protector.灵根,
        仙宠: protector.仙宠,
        mijinglevel_id: protector.mijinglevel_id
      };
      
      // 根据境界选择出场方式
      const protectorLevel = protector.mijinglevel_id;
      
      // === 境界专属出场方式 ===
      if (protectorLevel >= 19) {
        // 准仙帝 (level_id: 19-20)
        if (protectorLevel >= 19 && protectorLevel <= 20) {
          msg.push(` 时间长河下游，一道身影逆流而上！`);
          msg.push(`${protector.名号}的声音贯穿古今：`);
          msg.push(`"伤本座庇护之人？此间因果非你能承受！"`);
        } 
        // 仙帝 (level_id: 21)
        else if (protectorLevel === 21) {
          msg.push(` 忽然古今未来断裂,天地大道炸开！`);
          msg.push(`${protector.名号}道则与符文交织出的朦胧形体显化在诸天间!：`);
          msg.push(`"伤我庇护之人，古今未来都无你葬身之地！"`);
        } 
        // 祭道 (level_id: 22)
        else if (protectorLevel === 22) {
          msg.push(` 忽然诸天之外,一道目光自虚无之中投来！`);
          msg.push(`${protector.名号}自超脱现世之外的永恒未知之地转身，凝视整片古史：`);
          msg.push(`"祭！"`);
        } 
        // 祭道之上 (level_id: 23)
        else if (protectorLevel === 23) {
          msg.push(` 天地未动，万道沉寂。`);
          msg.push(`${protector.名号}眸光微抬，亿万宇宙在眼中生灭：`);
          msg.push(`"存在，本为虚妄。"`);
        }
      } 
      // === 仙帝以下境界出场 ===
      else {
        msg.push(` 一道金光从天而降！`);
        msg.push(`${protector.名号}的声音响彻天地：`);
        
        // 根据不同境界定制台词
        if (protectorLevel === 15) { // 准帝
          msg.push(`"准帝不可辱！安敢伤我庇护之人？"`);
        } else if (protectorLevel === 16) { // 大帝
          msg.push(`"帝威浩荡，岂容尔等放肆！"`);
        } else if (protectorLevel === 17) { // 红尘仙
          msg.push(`"红尘为仙，当镇世间一切敌！"`);
        } else if (protectorLevel === 18) { // 仙王
          msg.push(`"王不可辱！伤我庇护之人，当受永世镇压！"`);
        } else {
          msg.push(`"何苦为难后辈？若要战便与本座一战！"`);
        }
      }
      
      // === 添加庇护人出手保护文案 ===
      msg.push(`${protector.名号}对${player.名号}说："小友莫慌，一切有我！"`);
      
      // 仙帝及以上境界 - 概念级秒杀
      if (protectorLevel >= 19) {
        // 添加战斗细节
        if (protectorLevel <= 20) { // 准仙帝
          msg.push(`${protector.名号}一掌覆盖整片古史，${B_player.名号}瞬间化为劫灰！`);
        } else if (protectorLevel === 21) { // 仙帝
          msg.push(`${protector.名号}一缕念头流露而出，如至高规则般覆盖打击整片古史，${B_player.名号}的过去现在未来身都被彻底磨灭！`);
        } else if (protectorLevel === 22) { // 祭道
          msg.push(`一字出，万道瓦解，${B_player.名号}从未存在！`);
        } else { // 祭道之上
          msg.push(`话音未落，${B_player.名号}如梦幻泡影般消散！`);
        }
        
        // 直接秒杀怪物
        B_player.当前血量 = 0;
        
        // 构建战斗结果
        const protectorBattle = {
          msg: msg,
          B_hp: 0 // 怪物死亡
        };
      } 
      // 仙帝以下境界 - 正常战斗
      else {
        // 添加战斗细节
        msg.push(`${protector.名号}施展「一气化三清」，三花聚顶凝聚出道身！`);
        
        // 进行正常战斗
        const protectorBattle = await zd_battle(protectorBattleData, B_player);
        msg = msg.concat(protectorBattle.msg);
      }
      
      // === 战斗结果处理 ===
      if (B_player.当前血量 <= 0) {
       if (protectorLevel < 19) {
          msg.push(`${protector.名号}转身对${player.名号}说："修行之路凶险，下次务必小心！"言罢顺手治好了${player.名号}的伤势，潇洒离去`);
        }
            if (thing_name) {
                await Add_najie_thing(player_id, thing_name, thing_class, n);
              }
             player.当前血量 = player.血量上限;
          await Write_player(player_id, player);
        
        // 玩家获得部分奖励
        const baseReward = protectorLevel >= 19 ? 2000 : 1500;
        xiuwei = Math.trunc(baseReward * 0.8);
        qixue = Math.trunc(baseReward * 0.6);
        
        last_msg = `${m},${protector.名号}及时出现击退了${B_player.名号},获得修为${xiuwei},气血${qixue}`;
      } else {
        // 庇护人战败
        if (protectorLevel < 19) {
          msg.push(`${protector.名号}竟也不敌${B_player.名号}！两人双双败退`);
        }
        
        xiuwei = 800;
        last_msg = `${m},不巧撞见[${B_player.名号}]经过一番战斗，败下阵来，还好跑得快,只获得了修为${xiuwei}`;
      }
      

      await Write_player(player_id, player);
    } catch (err) {
      // 读取庇护人存档失败
      console.error(`读取庇护人存档失败: ${protectorQQ}`, err);
      msg.push(` ${player.名号}呼唤庇护人相助，但庇护人似乎已不在世间...`);
      xiuwei = 800;
      last_msg = `${m},不巧撞见[${B_player.名号}],经过一番战斗，败下阵来，还好跑得快,只获得了修为${xiuwei}`;
       loss = +1;
    }
  } else {
    // 没有庇护的正常战败逻辑
    xiuwei = 800;
    last_msg = `${m},不巧撞见[${B_player.名号}],经过一番战斗，败下阵来，还好跑得快,只获得了修为${xiuwei}`;
    loss = +1;
  }
}      

               await Write_player(player_id, player);
              //先完结再结算
              await Add_血气(player_id, qixue);
              await Add_修为(player_id, xiuwei);
              await Add_HP(player_id, Data_battle.A_xue);
           // 每次结算后，更新已结算次数
    action.settled_count++;
}
let arr = action;
              //把状态都关了
              arr.shutup = 1; //闭关状态
              arr.working = 1; //降妖状态
              arr.power_up = 1; //渡劫状态
              arr.Place_action = 1; //秘境
              arr.Place_actionplus = 1; //沉迷状态
        delete action.group_id;
        
        // 保存更新后的动作状态
        await redis.set(
            'xiuxian:player:' + player_id + ':action',
            JSON.stringify(action)
        );
        

        await Write_player(player_id, player);
        
        // 构建最终消息
        let msg_last_2 = [];
        for (let i in msg_last) {
            msg_last_2.push(`[${i}]×${msg_last[i]}个。`);
        }
        
        let loss_msg = '';
        if (loss != 0) {
            loss_msg = `探索秘境中遇到不是对手的怪物${loss}次，还好跑得快，只获得了800修为`;
        }
        
        msg.push(`${player.名号}在${remainingCount}次探索中获得了:`);
        msg.push(msg_last_2 + fyd_msg + loss_msg);
        e.reply(await get_log_img(msg));
    




            
          }else{
            e.reply("未到时候")
            return
          }
        
        }else{
          e.reply("无状态")
          return
        }
      }else{
        e.reply("无状态")
        return
      }
    }

  /**
   * 推送消息，群消息推送群，或者推送私人
   * @param id
   * @param is_group
   * @return  falses {Promise<void>}
   */
  async pushInfo(id, is_group, msg) {
    if (is_group) {
      await Bot.pickGroup(id)
        .sendMsg(msg)
        .catch(err => {
          Bot.logger.mark(err);
        });
    } else {
      await common.relpyPrivate(id, msg);
    }
  }
}
// 安全数值获取函数
function safeNumber(value, defaultValue = 0) {
    // 如果是有效数字，直接返回
    if (typeof value === 'number' && !isNaN(value)) {
        return value;
    }
    
    // 如果是字符串，尝试转换
    if (typeof value === 'string') {
        // 移除可能的逗号或其他非数字字符
        const cleanValue = value.replace(/[^0-9.]/g, '');
        const num = parseFloat(cleanValue);
        return isNaN(num) ? defaultValue : num;
    }
    
    // 其他类型返回默认值
    return defaultValue;
}

// 时间格式化函数
function formatTime(ms) {
    // 确保ms是有效数字
    if (isNaN(ms) || ms <= 0) {
        return "0秒";
    }
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0 && seconds > 0) {
        return `${minutes}分${seconds}秒`;
    } else if (minutes > 0) {
        return `${minutes}分`;
    } else {
        return `${seconds}秒`;
    }
}
 async function checkGongfaInServer(gongfaName) {
                let File = fs.readdirSync(__PATH.player_path);
                File = File.filter(file => file.endsWith(".json"));
                
                for (let i = 0; i < File.length; i++) {
                    let this_qq = File[i].replace(".json", '');
                    let otherPlayer = await Read_player(this_qq);
                    
                    // 检查其他玩家是否已习得该功法
                    if (otherPlayer.学习的功法 && otherPlayer.学习的功法.includes(gongfaName)) {
                        return true; // 功法已被他人习得
                    }
                }
                return false; // 功法未被习得
            }

// 辅助函数：获取属性名称
function getPropertyName(prop) {
    const names = {
        'level_id': '练气',
        'Physique_id': '炼体',
        'mijinglevel_id': '人体秘境体系',
        'xiangulevel_id': '仙古今世法'
    };
    return names[prop] || prop;
}