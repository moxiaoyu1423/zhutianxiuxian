import { plugin, common, data } from '../../api/api.js';
import fs from 'fs';
import {
  Read_player,
  isNotNull,
  Add_najie_thing,
  Add_修为,
  Add_炼体,
  Add_练气,
  Add_血气,
  Add_HP,
  Write_player,
  Read_equipment,
  ForwardMsg,
  Write_equipment,
  Add_寿元,
  Read_danyao,
  Write_danyao,
  bigNumberTransform,
  zd_battle,
  get_log_img,
  Read_najie,
  exist_najie_thing
} from '../../model/xiuxian.js';
import { AppName } from '../../app.config.js';

export class ShijianChangheTask extends plugin {
  constructor() {
    super({
      name: '时间长河定时任务',
      dsc: '处理遨游时间长河的定时任务',
      event: 'message',
      priority: 1000,
      rule: [],
    });
    
    this.task = {
      cron: '0 */1 * * * *', // 每1分钟执行一次
      name: 'ShijianChangheTask',
      fnc: () => this.checkTimeRiverActions(),
    };
    
    // 纪元积累上限
    this.MAX_ERA_ACCUMULATION = 100;
  }
  
async checkTimeRiverActions() {
  const currentTime = Date.now();
  
  // 获取活动玩家列表
  const activePlayers = await redis.get('xiuxian:time_river:active_players') || '[]';
  const playersList = JSON.parse(activePlayers);
  
  for (const usr_qq of playersList) {
    try {
      // 1. 先获取玩家动作状态
      const actionData = await redis.get(`xiuxian:player:${usr_qq}:action`);
      if (!actionData) continue;
      
      const action = JSON.parse(actionData);

      // 2. 检查道果崩解状态
      if (action.action === '道果崩解') {
        if (action.end_time <= currentTime) {
          await redis.del(`xiuxian:player:${usr_qq}:action`);
          await Bot.sendPrivateMsg(usr_qq, "【道果重组】经过30分钟调息，你的道果已重新凝聚！");
        }
        continue; // 道果崩解状态玩家不处理其他逻辑
      }

      // 3. 只处理遨游时间长河动作
      if (action.action !== '遨游时间长河') continue;

      // 4. 检查结束时间
      const endTime = await redis.get(`xiuxian:time_river:end_time:${usr_qq}`);
      if (!endTime || parseInt(endTime) > currentTime) continue;

      // 5. 处理探索结束
      await this.handleTimeRiverCompletion(usr_qq, action);

      // 6. 清理数据
      const updatedPlayers = playersList.filter(id => id !== usr_qq);
      await redis.set('xiuxian:time_river:active_players', JSON.stringify(updatedPlayers));
      await redis.del(`xiuxian:time_river:end_time:${usr_qq}`);

    } catch (err) {
      console.error(`处理玩家${usr_qq}时出错:`, err);
    }
  }
}
  
  async handleTimeRiverCompletion(usr_qq, action) {
    // 读取玩家数据
    const player = await Read_player(usr_qq);
    
    // 初始化纪元积累（如果不存在）
    if (player.纪元积累 === undefined) {
      player.纪元积累 = 0;
    }

    // 构建玩家战斗数据
    const A_player = {
      名号: player.名号,
      攻击: player.攻击,
      防御: player.防御,
      当前血量: player.当前血量,
      暴击率: player.暴击率,
      灵根: player.灵根,
      法球倍率: player.灵根.法球倍率,
      学习的功法: player.学习的功法,
      仙宠: player.仙宠,
      mijinglevel_id: player.mijinglevel_id
    };
    
    // 随机选择敌人
    const enemyIndex = Math.floor(Math.random() * data.shijianchanghe_list.length);
    const enemyTemplate = data.shijianchanghe_list[enemyIndex];
    
    // 计算缩放因子
    const scaleFactor = this.calculateScaleFactor(player.mijinglevel_id);
    
    // 构建战斗角色
    const B_player = {
      名号: enemyTemplate.name,
      攻击: parseInt(enemyTemplate.attack * scaleFactor),
      防御: parseInt(enemyTemplate.defense * scaleFactor),
      当前血量: parseInt(enemyTemplate.hp * scaleFactor),
      暴击率: enemyTemplate.criticalRate,
      灵根: enemyTemplate.灵根,
      法球倍率: enemyTemplate.灵根.法球倍率,
      学习的功法: enemyTemplate.special,
      era: enemyTemplate.era
    };
    
    // 生成遭遇文案
    const encounterMessage = this.generateEncounterMessage(B_player);
    
    // 发送遭遇消息
    await this.sendEncounterMessage(usr_qq, action, encounterMessage);
    
    // 进行战斗
    const battleResult = await zd_battle(A_player, B_player);
    
    // 调整战斗结果解析
    const playerHp = battleResult.B_xue;
    const enemyHp = battleResult.A_xue;
    
    // 确定战斗结果
    let outcome;
    let specialEvents = {};
    if (enemyHp <= 0) {
      outcome = 'victory';
       // 99%概率触发厄土仙帝推演惩罚 (只针对仙帝以下玩家)
      if (Math.random() < 0.35 && player.mijinglevel_id < 21) {
        specialEvents.pastBodyExposed = true;
              const suppressionTime = 30 * 60 * 1000;
  const endTime = Date.now() + suppressionTime;
 // 设置玩家动作状态
   await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify({
    action: "道果崩解",
    start_time: Date.now(),
    end_time: endTime,
    group_id: action.group_id
  }));
       const { player: updatedPlayer } = await this.handlePastBodyExposed(usr_qq);
  Object.assign(player, updatedPlayer); // 同步修改
  
      }
    } else if (playerHp <= 0) {
      outcome = 'defeat';
      
      // 30%概率触发厄土仙帝推演惩罚 (只针对仙帝以下玩家)
      if (Math.random() < 0.8 && player.mijinglevel_id < 21) {
        specialEvents.pastBodyExposed = true;
              const suppressionTime = 30 * 60 * 1000;
  const endTime = Date.now() + suppressionTime;
 // 设置玩家动作状态
   await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify({
    action: "道果崩解",
    start_time: Date.now(),
    end_time: endTime,
    group_id: action.group_id
  }));
               const { player: updatedPlayer } = await this.handlePastBodyExposed(usr_qq);
  Object.assign(player, updatedPlayer); // 同步修改
      }

      // 黑暗准仙帝镇压（特定敌人）
      if (B_player.名号 === "苍帝"||B_player.名号 === "羽帝"||B_player.名号 === "鸿帝"||B_player.名号 === "灭世老人"||B_player.名号 === "未来准仙帝"
        ||B_player.名号 === "尸骸仙帝"
      ) {
        specialEvents.darkSuppression = true;
      }
    } else {
      outcome = 'draw';
    }
    
    // ==== 纪元积累系统 ====
    let eraAccumulationChange = 0;
    if (outcome === 'victory') {
      eraAccumulationChange = 2;
    } else if (outcome === 'draw') {
      eraAccumulationChange = 1;
    } else {
      eraAccumulationChange = -1;
    }
    
    // 时代影响系数
    const eraMultiplier = {
      0: 1.5, // 神话时代
      1: 1.2, // 太古时代
      4: 0.8  // 绝灵时代
    };
    eraAccumulationChange = Math.floor(eraAccumulationChange * (eraMultiplier[B_player.era] || 1));
    
    // 特殊敌人额外奖励
    if (B_player.名号 === "荒天帝") {
      eraAccumulationChange += 2;
    }
    
    // 应用纪元积累变化（不超过上限）
    player.纪元积累 = Math.min(
      player.纪元积累 + eraAccumulationChange,
      this.MAX_ERA_ACCUMULATION
    );
    
    // ==== 处理特殊事件 ====
    let penalties = {};
// 在handleTimeRiverCompletion中添加
if (specialEvents.pastBodyExposed && specialEvents.darkSuppression) {
  // 黑暗镇压优先级更高
  delete specialEvents.pastBodyExposed;
  penalties.darkSuppression = await this.handleDarkSuppression(usr_qq, action);
} else if (specialEvents.pastBodyExposed) {
  penalties.pastBodyExposed = await this.handlePastBodyExposed(usr_qq);
}
    
    // ==== 处理战斗结果 ====
    const resultMessage = this.generateResultMessage(
      player, 
      B_player, 
      { 
        ...battleResult,
        outcome,
        specialEvents,
        penalties,
        eraAccumulationChange,
        newEraAccumulation: player.纪元积累
      }
    );
    

    
    // 保存玩家数据（包含纪元积累更新）
    await Write_player(usr_qq, player);
        let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
    // 清除动作状态
    await redis.del(`xiuxian:player:${usr_qq}:action`);
    
    // 发送结果消息
    await this.sendResultMessage(usr_qq, action, resultMessage);
  }
  
  /** 处理被厄土仙帝推演出过去身的惩罚 */

async handlePastBodyExposed(usr_qq) {
  try {
    const player = await Read_player(usr_qq);
    const najie = await Read_najie(usr_qq);
    
    // 惩罚1: 丢失纳戒物品
    let lostItems = [];
    const itemCategories = ["丹药", "道具", "功法", "草药", "材料", "食材", "盒子"];
    
    // 随机选择1-4个分类
    const affectedCategories = itemCategories
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 1);
    
    // 处理每个受影响分类
    for (const category of affectedCategories) {
      if (!najie[category]?.length) continue;
      
      const itemsToAffect = najie[category]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);
      
      for (const item of itemsToAffect) {
        const currentQuantity = await exist_najie_thing(usr_qq, item.name, category);
        if (currentQuantity <= 0) continue;
        
        const lostAmount = Math.max(1, Math.floor(currentQuantity * (0.1 + Math.random() * 0.4)));
        const actualLost = Math.min(lostAmount, currentQuantity);
        
        await Add_najie_thing(usr_qq, item.name, category, -actualLost);
        lostItems.push({
          name: item.name,
          quantity: actualLost,
          category
        });
      }
    }
    
    // 直接修改等级
    const levelPenalty = Math.floor(Math.random() * 5) + 1;
    const physiquePenalty = Math.floor(Math.random() * 5) + 1;
    player.level_id = Math.max(0, player.level_id - levelPenalty);
    player.Physique_id = Math.max(0, player.Physique_id - physiquePenalty);

    return {
      player, // 返回修改后的 player 对象
      lostItems,
      reductionLvl: {
        originalLevel: player.level_id + levelPenalty,
        originalPhysique: player.Physique_id + physiquePenalty,
        newLevel: player.level_id,
        newPhysique: player.Physique_id,
        penalties: { levelPenalty, physiquePenalty }
      }
    };
  } catch (e) {
    console.error("处理过去身暴露失败:", e);
    const player = await Read_player(usr_qq).catch(() => ({ 
      level_id: 0, 
      Physique_id: 0 
    }));
    return { 
      player,
      lostItems: [], 
      reductionLvl: {
        originalLevel: player.level_id,
        originalPhysique: player.Physique_id,
        newLevel: player.level_id,
        newPhysique: player.Physique_id,
        penalties: { levelPenalty: 0, physiquePenalty: 0 }
      }
    };
  }
}
  /** 处理被黑暗准仙帝镇压 */
async handleDarkSuppression(usr_qq, action) {
  // 设置镇压时间（60分钟）
  const player = await Read_player(usr_qq);
  const suppressionTime = 60 * 60 * 1000;
  const endTime = Date.now() + suppressionTime;
  
  // 记录镇压状态（不再使用setTimeout）
  await redis.set(`xiuxian:dark_suppression:${usr_qq}`, "true");
  await redis.set(`xiuxian:player:${usr_qq}:suppression_end`, endTime);
  await redis.set(`xiuxian:player:${usr_qq}:suppression_data`, JSON.stringify({
    group_id: action.group_id,
    original_level: player.mijinglevel_id
  }));
  
  // 设置玩家动作状态
  await redis.set(`xiuxian:player:${usr_qq}:action`, JSON.stringify({
    action: "被镇压炼化元神",
    start_time: Date.now(),
    end_time: endTime,
    group_id: action.group_id
  }));
  
  return { 
    suppressionTime,
    endTime,
    message: "你已被黑暗准仙帝镇压，60分钟后将解除镇压并跌落一层境界"
  };
}
  
  // 生成遭遇文案
  generateEncounterMessage(enemy) {
    const encounterMessages = {
      "苍帝": [
        `【时间长河遭遇·黑暗天庭】`,
        `你逆流而上，踏足界海尽头，`,
        `前方浮现一座残破的黑暗天庭！`,
        `殿宇坍塌，仙宫倾颓，断壁残垣间弥漫着万古不散的黑暗物质。`,
        `帝血染红了天阶，仙王尸骸堆积如山，`,
        `整片天地都笼罩在令人窒息的压抑中！`,
        `忽然，一道贯穿古今未来的声音响起，`,
        `带着俯瞰万古的无敌气息，震得时间长河都在颤抖：`,
        `"遇帝不拜，真命已失！"`,
        `"轮回碑上有汝名！"`,
        `"一步一叩首，往生路上罪削半，护你真灵！"`,
        `你抬眼望去，只见黑暗天庭深处：`,
        `- 虔诚的朝圣者自海的那一端而来，一步一叩首，`,
        `- 他们的额头染血，眼中却满是狂热的虔诚，`,
        `- 只为觐见那端坐于天庭废墟之巅的无上存在！`,
        `苍帝缓缓睁开双眸，眸光开阖间映照诸天沉沦！`,
        `他周身环绕大道符文，透发出一股睥睨天下，唯我无敌的气势！`,
        `帝威浩荡，让整片苍茫大地都在颤栗！`,
        `"万古以来，朝圣者皆虔诚而真挚，"`,
        `苍帝的声音冰冷如万古寒渊，带着俯瞰众生的威严：`,
        `"自海的那一端而来，一步一叩首，只为觐见本座。"`,
        `"而你..."`,
        `"为何带着杀意而至？"`,
        `话音未落，天地变色！`,
        `- 仅是一道目光，便让虚空寸寸崩裂！`,
        `- 口诵真言，便有绝世仙王化作飞灰，踏上往生路！`,
        `- 帝威如狱，万灵在其一念间形神俱灭，化为齑粉！`,
        `苍帝立于天庭废墟之巅，声音森寒冷漠，带着一股藐视：`,
        `"纵横古今，天上地下无敌，渴求一败而不能，这时你却出现了，但也终究只是一个献祭者！"`,
        `一场恐怖的帝战即将爆发！`
      ],
      "荒天帝": [
        `【时间长河遭遇】`,
        `你逆流而上，在乱古纪元的战场遭遇了独断万古的荒天帝！`,
        `他周身环绕着恐怖的气息，一剑斩断时间长河！`,
        `荒天帝施展他化自在法，瞬间化出三道分身！`,
        `- 一道分身施展草字剑诀，剑气纵横三万里！`,
        `- 一道分身施展鲲鹏宝术，扶摇直上九重天！`,
        `- 一道分身施展雷帝宝术，雷霆万钧震九霄！`,
        `一场跨越时空的巅峰对决即将展开！`
      ],
      "叶天帝": [
        `【时间长河遭遇】`,
        `你在后荒古时代的长河中，遭遇了红尘成仙的叶天帝！`,
        `他拳镇山河，脚踏万道，气势如虹！`,
        `叶天帝施展天帝拳，拳意贯穿古今未来！`,
        `- 斗字秘演化诸天万法，变化无穷！`,
        `- 六道轮回拳打破生死界限，轮回不息！`,
        `- 行字秘踏破时空，快如闪电！`,
        `一场跨越纪元的大战一触即发！`
      ],
      "狠人": [
        `【时间长河遭遇】`,
        `你在荒古时代的岁月长河中，遭遇了才情冠绝古今的狠人大帝！`,
        `她白衣胜雪，面具遮颜，周身环绕飞仙之光！`,
        `狠人大帝施展一念花开，君临天下！`,
        `- 万朵仙葩绽放，每一朵都蕴含绝世杀机！`,
        `- 飞仙诀化作漫天光雨，撕裂时空！`,
        `- 不灭天功运转，万法不侵！`,
        `一场跨越时空的绝世对决即将展开！`
      ],
      "无始": [
        `【时间长河遭遇】`,
        `你在神话时代的尽头，遭遇了仙路尽头的无始大帝！`,
        `他背对众生，无始钟震荡万古！`,
        `无始大帝施展无始无终，时空为之凝固！`,
        `- 无始钟声波震荡，粉碎星辰！`,
        `- 时间法则逆转，过去未来交织！`,
        `- 先天道图镇压诸天！`,
        `一场震撼古今的巅峰对决即将开始！`
      ],
    };
    
    return encounterMessages[enemy.名号] || [
      `【时间长河遭遇】`,
      `你在${enemy.era}的长河中，遭遇了${enemy.名号}！`,
      `他展现无上威能，向你袭来！`,
      `一场跨越时空的巅峰对决即将展开！`
    ];
  }
  
  // 发送遭遇消息  // 修改后的发送遭遇消息方法

async sendEncounterMessage(usr_qq, action, message) {
  try {
    const fullMessage = Array.isArray(message) ? message.join('\n') : message;
    
    // 构建消息数组
    const msgArray = [
      segment.at(usr_qq),
      '【时间长河遭遇】',
      fullMessage
    ];
    
    // 创建模拟事件对象
    const mockEvent = {
      reply: async (content) => {
        if (action.group_id) {
          await Bot.pickGroup(action.group_id).sendMsg(content);
        } else {
          await Bot.sendPrivateMsg(usr_qq, content);
        }
      },
      group_id: action.group_id,
      user_id: usr_qq
    };
    
    // 使用 ForwardMsg 发送图片
    await ForwardMsg(mockEvent, msgArray);
    
    // 等待3秒再继续战斗
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error) {
    console.error('发送遭遇消息失败:', error);
    
    // 备用方案：私聊发送文本
    const fallbackMessage = [
      '【时间长河遭遇】',
      Array.isArray(message) ? message.join('\n') : message
    ].join('\n');
    
    await Bot.sendPrivateMsg(usr_qq, fallbackMessage);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}
  calculateScaleFactor(playerLevel) {
    // 基础缩放因子
    let factor = 1.0;
    
    // 境界加成
    if (playerLevel >= 20) {
      factor += (playerLevel - 19) * 0.1;
    }
    
    return factor;
  }
  
  generateResultMessage(player, enemy, battleResult) {
    let message = [];
    
    // 添加战斗过程摘要
    message.push(`【战斗结果】`);
    message.push(`战斗过程：`);
    
    // 添加战斗关键回合
    if (battleResult.msg && battleResult.msg.length > 35) {
      message = message.concat(battleResult.msg.slice(0, 3), battleResult.msg.slice(-2));
    } else if (battleResult.msg) {
      message = message.concat(battleResult.msg);
    }
    
    // 添加结果
    if (battleResult.outcome === 'victory') {
      message.push(this.getVictoryMessage(enemy));
    } else if (battleResult.outcome === 'defeat') {
      if (battleResult.specialEvents.darkSuppression) {
        message.push(...this.getDarkSuppressionMessage());
      } else if (battleResult.specialEvents.pastBodyExposed) {
        message.push(...this.getPastBodyExposedMessage());
      } else {
        message.push(this.getDefeatMessage(enemy));
      }

      // 仙帝豁免提示
      if (player.mijinglevel_id >= 21) {
        message.push('【仙帝之威】');
        message.push('你身为诸天至高的路尽级仙帝，早已超越永恒凌驾诸世间，一证永证，统御了自身所有的时间线');
        message.push('厄土仙帝根本无法探寻你的跟脚，更谈何推演并打灭你的过去身呢？');
      }
    } else {
      message.push(this.getDrawMessage(enemy));
    }
    
    // 添加特殊事件详细描述
if (battleResult.specialEvents.pastBodyExposed && battleResult.penalties.pastBodyExposed) {
  const { lostItems, reductionLvl } = battleResult.penalties.pastBodyExposed;
  
  message.push(`【厄土仙帝推演】`);
  message.push(`厄土仙帝锁定到你的气机推演出你的过去身，一缕眸光跨越万古斩来！`);
  message.push(`你的过去身被灭杀，导致：`);
  message.push(`- 炼气等级: ${reductionLvl.originalLevel} → ${reductionLvl.newLevel} (扣除 ${reductionLvl.penalties.levelPenalty}级)`);
  message.push(`- 炼体等级: ${reductionLvl.originalPhysique} → ${reductionLvl.newPhysique} (扣除 ${reductionLvl.penalties.physiquePenalty}级)`);
  
  if (lostItems.length > 0) {
    message.push(`- 丢失纳戒物品: ${lostItems.map(item => `${item.name} x${item.quantity}`).join(", ")}`);
  } else {
    message.push(`- 幸运的是，你的纳戒未受损失！`);
  }
}
    
    if (battleResult.specialEvents.darkSuppression) {
      message.push(`【黑暗镇压】`);
      message.push(`苍帝将你的元神拘禁镇压，开始炼化你的道果！`);
      message.push(`此过程将持续60分钟！`);
      message.push(`60分钟后解除镇压，但你的境界将跌落一层！`);
      message.push(`在此期间你将无法进行其他行动！`);
    }
    
    // 添加纪元积累信息
    message.push(`【纪元积累】`);
    if (battleResult.eraAccumulationChange > 0) {
      message.push(`你在时间长河中的感悟加深，纪元积累 +${battleResult.eraAccumulationChange}`);
      
      // 特殊敌人额外奖励提示
      if (enemy.名号 === "荒天帝") {
        message.push(` 战胜绝世强者荒天帝，额外获得2点纪元积累！`);
      }
    }
    message.push(`当前纪元积累：${battleResult.newEraAccumulation}/${this.MAX_ERA_ACCUMULATION}`);
    
    // 时代加成提示
    if (enemy.era === 0 || enemy.era === 1) {
      message.push(`（${enemy.era === 0 ? '神话' : '太古'}时代感悟效率提升）`);
    } else if (enemy.era === 4) {
      message.push(`（绝灵时代感悟效率降低）`);
    }

    return message.join('\n');
  }
  
  /** 黑暗镇压消息 */
  getDarkSuppressionMessage() {
    return [
      `【黑暗准仙帝之威】`,
      `你败给了苍帝，肉身炸开，元神想要遁逃！`,
      `苍帝眸中寒光一闪，`,
      `只见他抬手间：`,
      `- 黑暗符文交织，化作不朽牢笼`,
      `- 准仙帝伟力镇压而下，禁锢你的元神`,
      `- 时间长河被截断，逃无可逃！`,
      `苍帝将你的元神拘禁镇压，`,
      `以恐怖的准仙帝伟力炼化你的道果！`,
      `你一身苦修的通天修为被不断炼化，道果在黑暗中枯萎...`,
      `此乃黑暗准仙帝之威！`,
      `【系统警告】`,
      `你的元神被镇压，将在60分钟后解除！`,
      `解除后你的境界将跌落一层！`
    ];
  }
  
  /** 过去身暴露消息 */
  getPastBodyExposedMessage() {
    return [
      `【万古推演·过去身暴露】`,
      `战斗败北之际，一缕恐怖的眸光跨越时间长河投来！`,
      `厄土仙帝端坐黑暗尽头，冷冷开口：`,
      `"你逃得掉今日，却逃不过过去！"`,
      `"推演万古，斩你过去身！"`,
      `帝念扫过时间长河上游，定位了你的过去身！`,
      `- 一缕眸光斩断时空因果`,
      `- 你弱小时的过去身瞬间被击杀`,
      `厄土仙帝隔着万古出手，`,
      `此战虽未直接伤你性命，但导致你：`,
      `- 部分纳戒物品遗失（被过去身携带）`,
      `- 道基受损，炼气炼体境界跌落`,
      `【系统提示】`,
      `厄土仙帝已推演出你的过去身，造成严重惩罚！`
    ];
  }
  
  getVictoryMessage(enemy) {
    const victoryMessages = [
      `你与${enemy.名号}在时间长河中激战三天三夜，最终险胜！`,
      `跨越时空的对决中，你以微弱优势战胜了${enemy.名号}！`,
      `在${enemy.era}的战场上，你成功击败了${enemy.名号}的投影！`,
      `时间长河见证了你与${enemy.名号}的巅峰对决，最终你技高一筹！`,
      `面对${enemy.名号}的无上威能，你爆发潜力，险胜一筹！`
    ];
    return victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
  }

  getDefeatMessage(enemy) {
    const defeatMessages = [
      `面对${enemy.名号}的无上威能，你终究不敌！`,
      `在时间长河的激流中，你被${enemy.名号}的强大力量击退！`,
      `跨越时空的对决，你未能战胜${enemy.名号}的威名！`,
      `时间长河见证了你与${enemy.名号}的巅峰对决，最终你惜败！`,
      `面对${enemy.名号}的绝世神通，你虽败犹荣！`
    ];
    return defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
  }

  getDrawMessage(enemy) {
    const drawMessages = [
      `你与${enemy.名号}战至时间长河尽头，不分胜负！`,
      `跨越时空的对决以平局收场，双方都未能在对方身上取得优势！`,
      `在时间长河的见证下，你与${enemy.名号}平分秋色！`,
      `时间长河奔流不息，你与${enemy.名号}的战斗难分高下！`,
      `这场跨越时空的对决最终以平局收场，双方都展现了无上风采！`
    ];
    return drawMessages[Math.floor(Math.random() * drawMessages.length)];
  }
  

  
  calculateLevelBonus(playerLevel) {
    // 基础加成
    let bonus = 1.0;
    
    // 境界加成
    if (playerLevel >= 20) {
      bonus += (playerLevel - 19) * 0.05;
    }
    
    return bonus;
  }
  

  // 修改后的发送结果消息方法
async sendResultMessage(usr_qq, action, resultMessage) {
  try {
    // 构建消息数组
    const msgArray = [
      segment.at(usr_qq),
      '【时间长河探索结果】',
      resultMessage
    ];
    
    // 创建模拟事件对象
    const mockEvent = {
      reply: async (content) => {
        if (action.group_id) {
          await Bot.pickGroup(action.group_id).sendMsg(content);
        } else {
          await Bot.sendPrivateMsg(usr_qq, content);
        }
      },
      group_id: action.group_id,
      user_id: usr_qq
    };
    
    // 使用 ForwardMsg 发送图片
    await ForwardMsg(mockEvent, msgArray);
  } catch (error) {
    console.error('发送结果消息失败:', error);
    
    // 备用方案：私聊发送文本
    const fallbackMessage = [
      '【时间长河探索结果】',
      resultMessage
    ].join('\n');
    
    await Bot.sendPrivateMsg(usr_qq, fallbackMessage);
  }
}

}