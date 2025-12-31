import plugin from '../../../../lib/plugins/plugin.js';
import config from '../../model/Config.js'; // 使用配置文件
import path from 'path';
import fs from 'fs';
import {__PATH} from '../../model/xiuxian.js';
import {
  Read_player,
  existplayer,
  get_random_talent,
  getLastsign,
  Write_equipment,
  Write_player,
  Write_najie,
} from '../../model/xiuxian.js';

export class EraStatusPlugin extends plugin {
  constructor() {
    super({
      name: '时代状态查询',
      dsc: '查询当前修仙世界的时代和年份',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#?(查看)?(当前)?(时代|纪元)$',
          fnc: 'queryEraStatus'
        },
        {
          reg: '^#?突破模拟$',
          fnc: 'simulateBreakthrough'
        },
         {
          reg: '^#重塑古今未来\\s*(\\d+)\\s*(\\d+)\\s*(\\d+)$',
          fnc: 'reshapeEra',
        },
        {
          reg: '^#重塑天地大道\\s*(\\d+(?:\\.\\d+)?)\\s*(\\d+(?:\\.\\d+)?)\\s*(\\d+(?:\\.\\d+)?)$',
          fnc: 'reshapeSecretPlace',
        }
      ]
    });
    
    // 完整的时代定义 - 包含两种修炼体系的消耗和成功率
    this.eras = [
      { 
        name: "神话时代", 
        desc: "天地初开，神灵显化。灵药遍地，异兽横行。大道法则清晰可见，凡人亦可感悟天道至理。",
        icon: "✨",
        breakthrough: { 
          qiSuccessRate: 25,    // 练气成功率
          bodySuccessRate: 10,  // 破体成功率
          qiCostFactor: 0.4,    // 练气消耗系数
          bodyCostFactor: 0.3   // 炼体消耗系数
        }
      },
      { 
        name: "太古时代", 
        desc: "神魔大战，万族并起。武道昌盛，血脉之力如江河奔涌。顶级修士可掌阴阳五行，移山填海。",
        icon: "⚔️",
        breakthrough: { 
          qiSuccessRate: 10,
          bodySuccessRate: 25,
          qiCostFactor: 0.6,
          bodyCostFactor: 0.5
        }
      },
      { 
        name: "天命时代", 
        desc: "天命既明，规则既定。各族鼎立，宗门林立。灵气平稳有序，强者辈出。",
        icon: "🌌",
        breakthrough: { 
          qiSuccessRate: 0,
          bodySuccessRate: 0,
          qiCostFactor: 1.0,
          bodyCostFactor: 0.9
        }
      },
      { 
        name: "末法时代", 
        desc: "天道倾斜，灵气枯竭。规则崩坏，修行之途日渐艰难。仙路渐闭，凡人武道崛起。",
        icon: "🌑",
        breakthrough: { 
          qiSuccessRate: -10,
          bodySuccessRate: 15,
          qiCostFactor: 1.8,
          bodyCostFactor: 1.6
        }
      },
      { 
        name: "绝灵时代", 
        desc: "天地寂灭，灵气断绝。末法终结，万物归凡。曾经的修仙之道已成传说。",
        icon: "💀",
        breakthrough: { 
          qiSuccessRate: -30,
          bodySuccessRate: -35,
          qiCostFactor: 3.0,
          bodyCostFactor: 2.8
        }
      }
    ];
  }
  
  /** 重塑古今未来 - 仙帝级指令 */
  async reshapeEra(e) {
    // 检查玩家境界
    const usr_qq = e.user_id;
    const player = await Read_player(usr_qq);
    
    // 只有仙帝级玩家才能使用
    if (player.mijinglevel_id < 21) {
      return e.reply("你尚未达到仙帝境界，无法重塑古今未来！");
    }
    
    // 解析参数
    const match = e.msg.match(/^#重塑古今未来\s*(\d+)\s*(\d+)\s*(\d+)$/);
    if (!match) {
      return e.reply("指令格式错误！正确格式：#重塑古今未来 [时代索引] [年份] [纪元]");
    }
    
    const eraIndex = parseInt(match[1]);
    const years = parseInt(match[2]);
    const epoch = parseInt(match[3]);
    
    // 验证参数
    if (isNaN(eraIndex) || eraIndex < 0 || eraIndex >= this.eras.length) {
      return e.reply(`时代索引无效！有效范围：0-${this.eras.length - 1}`);
    }
    
    if (isNaN(years) || years < 0 || years > 10000) {
      return e.reply("年份无效！有效范围：0-10000");
    }
    
    if (isNaN(epoch) || epoch < 1) {
      return e.reply("纪元无效！必须大于等于1");
    }
    
    // 获取当前配置
    const set = config.getConfig('xiuxian', 'xiuxian');
    
    // 记录旧时代信息
    const oldEraIndex = set.Era?.current?.index || 0;
    const oldEra = this.eras[oldEraIndex];
    const oldYears = set.Era?.current?.years || 0;
    const oldEpoch = set.Era?.current?.epoch || 1;
    
    // 更新时代配置
    set.Era.current = { index: eraIndex, years, epoch };
    config.setConfig('xiuxian', 'xiuxian', set);
    
    // 获取新时代信息
    const newEra = this.eras[eraIndex];
    
    // 重置所有玩家的天心印记
    const resetCount = await this.resetHeavenHeartMark();
    
    // ==== 新增：如果进入绝灵时代，触发寿元压制提示 ====
    let suppressMsg = "";
    if (eraIndex === 4) {
      suppressMsg = [
        `【绝灵降临·寿元压制】`,
        `天地寂灭，灵气断绝！绝灵时代降临，天道法则发生剧变！`,
        `所有仙王以下境界修士的寿元被压制至9999年`,
      ].join("\n");
    }
    
    // 构建回复消息
    const message = [
      `【仙帝伟力·重塑古今】`,
      `${player.名号}施展无上仙帝伟力，逆转时间长河！`,
      `旧纪元: 第${oldEpoch}纪元`,
      `旧时代: ${oldEra.name} ${oldEra.icon} (${oldYears}年)`,
      `新纪元: 第${epoch}纪元`,
      `新时代: ${newEra.name} ${newEra.icon} (${years}年)`,
      `${newEra.desc}`,
      suppressMsg, // 添加压制提示
      `天地法则已更迭，古今未来已重塑！`,
      `【天心印记重置】`,
      `所有大帝的天心印记已被重置`,
      `新时代将诞生新的大帝！`,
      `重置数量：${resetCount}位大帝`
    ].filter(Boolean).join("\n"); // 过滤空值
    
    // 广播时代变更
    await this.broadcastEraChange(oldEra, oldEpoch, newEra, epoch, years);
    
    return e.reply(message);
  }

  // 新增：重置天心印记的方法
  async resetHeavenHeartMark() {
    try {
        // 获取所有玩家文件
        const playerFiles = fs.readdirSync(__PATH.player_path);
        const jsonFiles = playerFiles.filter(file => file.endsWith(".json"));
        
        let resetCount = 0;
        
        for (const file of jsonFiles) {
            const qq = file.replace(".json", "");
            const player = await Read_player(qq);
            
            // 检查并重置天心印记
            if (player.天心印记 && player.天心印记 > 0) {
                player.天心印记 = 0;
                await Write_player(qq, player);
                resetCount++;
            }
        }
        
        return resetCount;
        
    } catch (e) {
        console.error("重置天心印记失败:", e);
        return 0;
    }
  }
  
  /** 广播时代变更 */
  async broadcastEraChange(oldEra, oldEpoch, newEra, newEpoch, years) {
    // ==== 新增：绝灵时代特殊提示 ====
    let suppressInfo = "";
    if (newEra.name === "绝灵时代") {
      suppressInfo = [
        `【绝灵降临·寿元压制】`,
        `天地寂灭，灵气断绝！绝灵时代降临，天道法则发生剧变！`,
        `所有仙王以下境界修士的寿元被压制至9999年`,
      ].join("\n");
    }
    
    const message = [
      `【天地巨变·古今重塑】`,
      `有至高仙帝施展伟力，逆转时间长河！`,
      `旧纪元: 第${oldEpoch}纪元`,
      `旧时代: ${oldEra.name} ${oldEra.icon}`,
      `新纪元: 第${newEpoch}纪元`,
      `新时代: ${newEra.name} ${newEra.icon} (${years}年)`,
      `${newEra.desc}`,
      suppressInfo, // 添加压制提示
      `所有修士请适应新的天地法则！`
    ].filter(Boolean).join("\n"); // 过滤空值
    
    // 这里需要根据您的框架实现群发功能
    // 示例: await this.broadcastToAllGroups(message);
    console.log(`[时代变更广播] ${message}`);
  }
  
  /** 查询当前时代状态 */
  async queryEraStatus(e) {
    try {
      // 从配置获取时代信息
      const set = config.getConfig('xiuxian', 'xiuxian');
      const currentEra = set.Era?.current || { index: 0, years: 0, epoch: 1 };
      
      const era = this.eras[currentEra.index];
      const nextEraIndex = (currentEra.index + 1) % this.eras.length;
      const progress = Math.round((currentEra.years / 10000) * 100);
      
      // ==== 新增：绝灵时代寿元压制提示 ====
      let suppressInfo = "";
      if (currentEra.index === 4) { // 4是绝灵时代索引
        suppressInfo = [
          `【绝灵时代·寿元压制】`,
          `在绝灵时代，所有仙王以下境界修士的寿元被压制至9999年`,
          `离开此时代后将恢复原始寿元`,
        ].join("\n");
      }
      
      const message = [
        `📜 纪元信息`,
        `当前纪元: 第${currentEra.epoch}纪元`,
        `${era.icon} 当前时代: ${era.name}`,
        ` ${era.desc}`,
        ` 年份: ${currentEra.years}/10000 年`,
        ` 进度: ${this.createProgressBar(currentEra.years)} ${progress}%`,
        ` 下个时代: ${this.eras[nextEraIndex].name} (距 ${10000 - currentEra.years} 年)`,
        `修炼系统影响:`,
        `  练气成功率: +${era.breakthrough.qiSuccessRate}%`,
        `  炼体成功率: +${era.breakthrough.bodySuccessRate}%`,
        `  练气消耗: ${this.calcCostLevel(era.breakthrough.qiCostFactor)}`,
        `  炼体消耗: ${this.calcCostLevel(era.breakthrough.bodyCostFactor)}`,
        suppressInfo, // 添加压制提示
        `当完成所有时代后，将进入第${currentEra.epoch + 1}纪元`
      ].filter(Boolean).join("\n"); // 过滤空值
      
      await e.reply(message);
    } catch (e) {
      await e.reply("获取时代信息失败，请稍后再试");
      console.error("查询时代状态失败:", e);
    }
  }

  /** 模拟突破逻辑 */
  async simulateBreakthrough(e) {
    const set = config.getConfig('xiuxian', 'xiuxian');
    const currentEra = set.Era?.current || { index: 0, years: 0, epoch: 1 };
    const eraData = this.eras[currentEra.index].breakthrough;
    
    // 模拟突破结果
    const qiSuccess = Math.random() * 100 < eraData.qiSuccessRate;
    const bodySuccess = Math.random() * 100 < eraData.bodySuccessRate;
    
    // ==== 新增：绝灵时代寿元压制模拟 ====
    let suppressInfo = "";
    if (currentEra.index === 4) {
      suppressInfo = [
        `【绝灵时代·寿元压制】`,
        `在绝灵时代，所有仙王以下境界修士的寿元被压制至9999年`,
      ].join("\n");
    }
    
    await e.reply([
      `正在模拟突破...`,
      `纪元: 第${currentEra.epoch}纪元`,
      `时代：${this.eras[currentEra.index].name}（${this.eras[currentEra.index].icon}）`,
      `练气突破：`,
      `  成功率：${eraData.qiSuccessRate}%`,
      `  消耗等级：${this.calcCostLevel(eraData.qiCostFactor)}`,
      `  结果：${qiSuccess ? '成功' : '失败'}`,
      `炼体突破：`,
      `  成功率：${eraData.bodySuccessRate}%`,
      `  消耗等级：${this.calcCostLevel(eraData.bodyCostFactor)}`,
      `  结果：${bodySuccess ? '成功' : '失败'}`,
      suppressInfo, // 添加压制提示
      qiSuccess ? "练气突破成功，境界提升！" : "练气突破失败，根基受损...",
      bodySuccess ? "炼体突破成功，肉身升华！" : "炼体突破失败，气血逆冲...",
      `时代建议：${this.getEraAdvice(currentEra.index)}`
    ].filter(Boolean).join("\n")); // 过滤空值
  }

  /** 计算消耗等级描述 */
  calcCostLevel(factor) {
    if (factor < 0.5) return "微乎其微";
    if (factor < 0.8) return "颇为轻松";
    if (factor < 1.2) return "寻常所需";
    if (factor < 2.0) return "消耗甚大";
    return "难以承受";
  }
  
  /** 获取时代修炼建议 */
  getEraAdvice(eraIndex) {
    const era = this.eras[eraIndex];
    
    // 计算两个体系的综合优势
    const qiAdvantage = era.breakthrough.qiSuccessRate - era.breakthrough.qiCostFactor * 10;
    const bodyAdvantage = era.breakthrough.bodySuccessRate - era.breakthrough.bodyCostFactor * 10;
    
    if (qiAdvantage - bodyAdvantage > 15) return "此时代适宜专注练气之道";
    if (bodyAdvantage - qiAdvantage > 15) return "此时代适宜专注炼体之道";
    if (qiAdvantage > 40 && bodyAdvantage > 40) return "双修并进，大道可期";
    return "修行之路维艰，需谨慎选择";
  }

  /** 创建进度条 */
  createProgressBar(years) {
    const width = 10;
    const progress = Math.min(100, Math.floor(years / 100));
    const filled = Math.floor(progress / (100 / width));
    const empty = width - filled;
    
    return `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
  }

  /** 重塑天地大道 - 准仙帝级指令 */
  async reshapeSecretPlace(e) {
    // 检查玩家境界
    const usr_qq = e.user_id;
    const player = await Read_player(usr_qq);
    
    // 只有准仙帝级玩家才能使用
    if (player.mijinglevel_id <= 19) {
      return e.reply("你尚未达到准仙帝境界，无法重塑天地大道！");
    }
    
    // 解析参数
    const match = e.msg.match(/^#重塑天地大道\s*(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)$/);
    if (!match) {
      return e.reply("指令格式错误！正确格式：#重塑天地大道 [低级概率] [中级概率] [高级概率]");
    }
    
    const lowRate = parseFloat(match[1]);
    const midRate = parseFloat(match[2]);
    const highRate = parseFloat(match[3]);
    
    // 验证参数范围
    if (isNaN(lowRate) || lowRate < 0 || lowRate > 1) {
      return e.reply("低级概率无效！有效范围：0-1");
    }
    
    if (isNaN(midRate) || midRate < 0 || midRate > 1) {
      return e.reply("中级概率无效！有效范围：0-1");
    }
    
    if (isNaN(highRate) || highRate < 0 || highRate > 1) {
      return e.reply("高级概率无效！有效范围：0-1");
    }
    
    // 获取当前配置
    const set = config.getConfig('xiuxian', 'xiuxian');
    
    // 记录旧的概率设置
    const oldOne = set.SecretPlace?.one || 0.99;
    const oldTwo = set.SecretPlace?.two || 0.5;
    const oldThree = set.SecretPlace?.three || 0.25;
    
    // 更新秘境概率配置
    if (!set.SecretPlace) {
      set.SecretPlace = {};
    }
    set.SecretPlace.one = lowRate;
    set.SecretPlace.two = midRate;
    set.SecretPlace.three = highRate;
    
    // 保存配置
    config.setConfig('xiuxian', 'xiuxian', set);
    
    // 构建回复消息
    const message = [
      `【准仙帝伟力·重塑天地大道】`,
      `${player.名号}施展准仙帝伟力，重塑天地大道法则！`,
      ``,
      `【秘境概率重塑】`,
      `低级秘境概率：${oldOne} → ${lowRate}`,
      `中级秘境概率：${oldTwo} → ${midRate}`,
      `高级秘境概率：${oldThree} → ${highRate}`,
      ``,
      `天地大道已重塑，秘境出金法则发生剧变！`,
      `所有秘境的奖励概率已按你的意志重新设定！`,
      ``,
      `【准仙帝威能】`,
      `你以准仙帝之力强行改变天地法则，`,
      `此等伟力足以让万古诸天为之震颤！`,
      ``,
      `注：概率设置已保存，立即生效`
    ].join("\n");
    
    return e.reply(message);
  }
}