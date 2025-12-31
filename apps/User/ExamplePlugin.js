import { plugin, verc, data } from '../../api/api.js';
import path from 'path';
import xiuxianData from '../../model/XiuxianData.js';
import fs from 'fs';
import {
  Read_player,
  existplayer,
  exist_najie_thing,
  instead_equipment,
  player_efficiency,
  Read_najie,
  getPinjiName,
  Write_linggen,
  get_random_aptitude,
  get_random_talent,
  Write_player,
  sleep,
  Add_血气,
  Add_职业经验,
  Add_灵石,
  Add_源石,
  Add_热量,
  Add_饱食度,
  Add_najie_thing,
  Add_HP,
  Add_修为,
  Add_寿元,
  Add_魔道值,
  Read_danyao,
  Write_danyao,
  Go,
  Add_仙宠,
  Add_player_学习功法,
  Reduse_player_学习功法,
  Add_najie_灵石,
  isNotNull,
  Read_equipment,
  Write_equipment,
  foundthing,
  convert2integer,
  get_equipment_img,
  channel
} from '../../model/xiuxian.js';
import {__PATH} from '../../model/xiuxian.js';
import { AppName } from '../../app.config.js';
import { readall } from '../../model/duanzaofu.js';
import { bigNumberTransform } from '../Help/TopList.js';

// 柳神关系等级定义
const LIUSHEN_RELATIONSHIPS = {
  1: { name: "赏识", desc: "柳神对你的天赋表示认可，愿意给予指点" },
  2: { name: "友善", desc: "柳神将你视为可造之材，时常与你交流论道" },
  3: { name: "道友", desc: "柳神视你为平等道友，愿意分享上古秘辛和大道感悟" },
  4: { name: "传承", desc: "柳神将你视为亲近之人，倾囊相授无保留" },
  5: { name: "护道者", desc: "柳神视你为仙路同行者，愿为你护道，共探长生之路" }
};

/**
 * 全局变量
 */
let allaction = false;//全局状态判断
export class ExamplePlugin extends plugin {
  constructor() {
    super({
      name: 'ExamplePlugin',
      dsc: '剧情角色模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#(柳神论道|柳神交流|柳神请教)',
          fnc: 'liuShenInteraction'
        },
        {
          reg: '^#(张五爷请教|交流|张五爷论源)',
          fnc: 'zhangWuYeInteraction'
        },
        {
          reg: '^#柳神奖励补发$',
          fnc: 'issueLiuShenRewards'
        }
      ],
    });
  }

  // 柳神交流指令
  async liuShenInteraction(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    const player = await Read_player(usr_qq);
    
    // 检查是否已解锁柳神
    let liuShenData = null;
    if (player.剧情人物 && Array.isArray(player.剧情人物)) {
      liuShenData = player.剧情人物.find(np => np.柳神);
    }
    
    if (!liuShenData) {
      e.reply("你尚未获得柳神赏识，需达到搬血极境并在石村触发相关剧情");
      return true;
    }

    // 检查冷却时间（每天最多交流3次）
    const now = Date.now();
    const lastInteraction = liuShenData.lastInteraction || 0;
    let interactionCount = liuShenData.todayInteractions || 0;

    // 获取今天的00:00时间戳
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartTimestamp = todayStart.getTime();

    // 如果最后一次交互是在今天之前，重置计数
    if (lastInteraction < todayStartTimestamp) {
      interactionCount = 0;
      liuShenData.todayInteractions = 0; // 重置计数
    }

    // 检查是否超过每日限制
    if (interactionCount >= 3) {
      // 计算距离明天的时间
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      const timeLeft = tomorrowStart.getTime() - now;
      
      // 格式化为小时和分钟
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      e.reply([
        `【交流限制】`,
        `今日与柳神交流次数已用完（3/3）`,
        `请${hours}小时${minutes}分钟后再来`,
        `（每日交流次数将在凌晨重置）`
      ].join('\n'));
      return true;
    }

    // 解析指令类型
    const match = e.msg.match(/^#(柳神论道|柳神交流|柳神请教)(?:\s+(.*))?$/);
    if (!match) return false;
    
    const actionType = match[1];
    const question = match[2] || "";
    
    let replyMsg = "";
    let 好感增加 = 0;
    let 修为增加 = 0;
    let 血气增加 = 0;
    let 额外奖励 = null;
    
    // 根据关系等级和指令类型生成不同内容
    const relationLevel = Math.min(4, Math.floor(liuShenData.好感度 / 120) + 1);
    
    switch (actionType) {
      case "柳神论道":
        // 论道内容
        const topics = [
          "天地大道", "肉身极境", "元神修炼", "法则感悟", 
          "上古秘辛", "仙古纪元", "异域起源", "成仙之路"
        ];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        
        replyMsg = `你与柳神论及「${topic}」，`;
        
        // 根据关系等级生成不同深度的论道内容
        if (relationLevel >= 4) {
          replyMsg += "柳神毫无保留，将自身对大道本源的理解倾囊相授。";
          好感增加 = 15 + Math.floor(Math.random() * 10);
          
          // 修为和血气都增加
          let reward = 10000;
          let zuizhong = player.xiangulevel_id * player.level_id * player.Physique_id * reward;
          修为增加 = zuizhong;
          血气增加 = zuizhong;
          
          // 关系4级有几率获得柳神法残篇（材料）
          if (Math.random() < 0.4) {
            额外奖励 = { type: "材料", value: "柳神法残篇" };
            await Add_najie_thing(usr_qq, "柳神法残篇", "材料", 1);
          }
        } else if (relationLevel >= 3) {
          replyMsg += "柳神深入浅出，为你解析大道奥秘。";
          好感增加 = 10 + Math.floor(Math.random() * 8);
          
          // 修为和血气都增加
          let reward = 8000;
          let zuizhong = player.xiangulevel_id * player.level_id * player.Physique_id * reward;
          修为增加 = zuizhong;
          血气增加 = zuizhong;
        } else {
          replyMsg += "柳神点拨一二，你获益匪浅。";
          好感增加 = 5 + Math.floor(Math.random() * 5);
          
          // 修为和血气都增加
          let reward = 5000;
          let zuizhong = player.xiangulevel_id * player.level_id * player.Physique_id * reward;
          修为增加 = zuizhong;
          血气增加 = zuizhong;
        }
        break;
        
      case "柳神交流":
        // 日常交流
        replyMsg = "你与柳神闲谈交流，";
        
        if (relationLevel >= 4) {
          replyMsg += "柳神谈及自身历劫经历和重生感悟，你深感震撼。";
          好感增加 = 12 + Math.floor(Math.random() * 8);
          
          // 修为和血气都增加
          let reward = 8000;
          let zuizhong = player.xiangulevel_id * player.level_id * player.Physique_id * reward;
          修为增加 = zuizhong;
          血气增加 = zuizhong;
          
          // 关系4级有几率获得柳神法残篇（材料）
          if (Math.random() < 0.3) {
            额外奖励 = { type: "材料", value: "柳神法残篇" };
            await Add_najie_thing(usr_qq, "柳神法残篇", "材料", 1);
          }
        } else if (relationLevel >= 3) {
          replyMsg += "柳神讲述上古轶事和修炼心得，你收获良多。";
          好感增加 = 8 + Math.floor(Math.random() * 6);
          
          // 修为和血气都增加
          let reward = 6000;
          let zuizhong = player.xiangulevel_id * player.level_id * player.Physique_id * reward;
          修为增加 = zuizhong;
          血气增加 = zuizhong;
        } else {
          replyMsg += "柳神给予一些修炼上的建议。";
          好感增加 = 5 + Math.floor(Math.random() * 4);
          
          // 修为和血气都增加
          let reward = 4000;
          let zuizhong = player.xiangulevel_id * player.level_id * player.Physique_id * reward;
          修为增加 = zuizhong;
          血气增加 = zuizhong;
        }
        break;
        
      case "柳神请教":
        // 请教特定问题
        if (!question) {
          e.reply("请指明请教的内容，例如：#柳神请教 肉身修炼");
          return true;
        }
        
        replyMsg = `你向柳神请教「${question}」，`;
        
        if (relationLevel >= 4) {
          replyMsg += "柳神详细解答，并亲自演示相关法门。";
          好感增加 = 18 + Math.floor(Math.random() * 12);
          
          // 修为和血气都增加
          let reward = 12000;
          let zuizhong = player.xiangulevel_id * player.level_id * player.Physique_id * reward;
          修为增加 = zuizhong;
          血气增加 = zuizhong;
          
          // 关系4级有几率获得柳神法残篇（材料）
          if (Math.random() < 0.5) {
            额外奖励 = { type: "材料", value: "柳神法残篇" };
            await Add_najie_thing(usr_qq, "柳神法残篇", "材料", 1);
          }
        } else if (relationLevel >= 3) {
          replyMsg += "柳神耐心解答，你茅塞顿开。";
          好感增加 = 12 + Math.floor(Math.random() * 8);
          
          // 修为和血气都增加
          let reward = 9000;
          let zuizhong = player.xiangulevel_id * player.level_id * player.Physique_id * reward;
          修为增加 = zuizhong;
          血气增加 = zuizhong;
        } else {
          replyMsg += "柳神简要回答，你略有收获。";
          好感增加 = 8 + Math.floor(Math.random() * 6);
          
          // 修为和血气都增加
          let reward = 6000;
          let zuizhong = player.xiangulevel_id * player.level_id * player.Physique_id * reward;
          修为增加 = zuizhong;
          血气增加 = zuizhong;
        }
        break;
    }
    
    // 更新好感度
    const oldRelationLevel = Math.min(4, Math.floor(liuShenData.好感度 / 120) + 1);
    liuShenData.好感度 += 好感增加;
    const newRelationLevel = Math.min(4, Math.floor(liuShenData.好感度 / 120) + 1);
    
    // 更新互动次数和时间
    liuShenData.todayInteractions = (liuShenData.todayInteractions || 0) + 1;
    liuShenData.lastInteraction = now;
    
    // 记录互动事件
    if (!liuShenData.事件记录) liuShenData.事件记录 = [];
    liuShenData.事件记录.push(`${actionType} - ${new Date().toLocaleDateString()}`);
    
    // 增加修为和血气
    if (修为增加 > 0) {
      player.修为 += 修为增加;
      player.血气 += 血气增加;
      replyMsg += `\n修为增加: ${bigNumberTransform(修为增加)}`;
      replyMsg += `\n血气增加: ${bigNumberTransform(血气增加)}`;
    }
    
    // 处理关系升级
    if (newRelationLevel > oldRelationLevel) {
      liuShenData.关系 = newRelationLevel;
      replyMsg += `\n\n【关系提升】与柳神的关系提升至「${LIUSHEN_RELATIONSHIPS[newRelationLevel].name}」！`;
      replyMsg += `\n${LIUSHEN_RELATIONSHIPS[newRelationLevel].desc}`;
      
      // 关系提升特殊奖励
      if (newRelationLevel === 2) {
        replyMsg += "\n\n柳神赠你一块原始宝骨，上面刻有神秘符文！";
        replyMsg += "\n你发现这块宝骨记载着原始真解神引篇，蕴含无上大道奥秘！";
        player.神引篇 = true;
        // 添加到玩家物品
        await Add_najie_thing(usr_qq, "原始宝骨", "道具", 1);
      } else if (newRelationLevel === 3) {
        replyMsg += "\n\n柳神赠你一缕本命柳枝与本命本源，蕴含无上生命法则！";
        player.柳神本命枝 = true;
        player.柳神本源 = true;
        // 添加到玩家物品
        await Add_najie_thing(usr_qq, "柳神本命枝", "道具", 1);
        await Add_najie_thing(usr_qq, "柳神本源", "道具", 1);
      }
    }
    
    // 添加额外奖励信息
    if (额外奖励) {
      replyMsg += `\n获得额外奖励: ${额外奖励.value} x1`;
    }
    
    // 添加当前关系信息
    replyMsg += `\n\n当前关系: ${LIUSHEN_RELATIONSHIPS[newRelationLevel].name} (${liuShenData.好感度}好感度)`;
    replyMsg += `\n今日交流次数: ${liuShenData.todayInteractions}/3`;
    
    // 保存玩家数据
    await Write_player(usr_qq, player);
    
    e.reply(replyMsg);
    return true;
  }

  /**
   * 补发柳神奖励函数
   * 用于处理玩家好感度达到要求但未正确标记奖励的情况
   * @param {number} usr_qq - 用户QQ号
   * @returns {string} 补发奖励的提示信息
   */
  async checkAndIssueLiuShenRewards(usr_qq) {
    try {
      // 读取玩家数据
      const player = await Read_player(usr_qq);
      if (!player) {
        return "未找到玩家数据，请确认玩家存在";
      }

      // 检查是否已解锁柳神
      let liuShenData = null;
      if (player.剧情人物 && Array.isArray(player.剧情人物)) {
        liuShenData = player.剧情人物.find(np => np.柳神);
      }

      if (!liuShenData) {
        return "该玩家尚未解锁柳神，无法补发奖励";
      }

      // 计算当前关系等级
      const currentRelationLevel = Math.min(4, Math.floor(liuShenData.好感度 / 120) + 1);
      let rewardMessages = [];
      let hasNewRewards = false;

      // 检查2级关系奖励（原始宝骨和神引篇）
      if (currentRelationLevel >= 2) {
        const hasOriginalBone = await exist_najie_thing(usr_qq, "原始宝骨", "道具");
        const hasShenYinPian = player.神引篇;

        if (!hasOriginalBone || !hasShenYinPian) {
          hasNewRewards = true;
          rewardMessages.push("【2级关系奖励补发】");
          
          if (!hasOriginalBone) {
            await Add_najie_thing(usr_qq, "原始宝骨", "道具", 1);
            rewardMessages.push("✓ 补发原始宝骨 x1");
          }
          
          if (!hasShenYinPian) {
            player.神引篇 = true;
            rewardMessages.push("✓ 解锁原始真解神引篇");
          }
          
          rewardMessages.push("原始宝骨记载着原始真解神引篇，蕴含无上大道奥秘！");
        }
      }

      // 检查3级关系奖励（柳神本命枝和柳神本源）
      if (currentRelationLevel >= 3) {
        const hasLiuShenBranch = await exist_najie_thing(usr_qq, "柳神本命枝", "道具");
        const hasLiuShenSource = await exist_najie_thing(usr_qq, "柳神本源", "道具");
        const hasBranchMark = player.柳神本命枝;
        const hasSourceMark = player.柳神本源;

        if (!hasLiuShenBranch || !hasLiuShenSource || !hasBranchMark || !hasSourceMark) {
          hasNewRewards = true;
          rewardMessages.push("【3级关系奖励补发】");
          
          if (!hasLiuShenBranch || !hasBranchMark) {
            await Add_najie_thing(usr_qq, "柳神本命枝", "道具", 1);
            player.柳神本命枝 = true;
            rewardMessages.push("✓ 补发柳神本命枝 x1");
          }
          
          if (!hasLiuShenSource || !hasSourceMark) {
            await Add_najie_thing(usr_qq, "柳神本源", "道具", 1);
            player.柳神本源 = true;
            rewardMessages.push("✓ 补发柳神本源 x1");
          }
          
          rewardMessages.push("柳神本命枝与本源蕴含无上生命法则！");
        }
      }

      // 保存玩家数据（如果有更新）
      if (hasNewRewards) {
        await Write_player(usr_qq, player);
        
        const finalMessage = [
          `【柳神奖励补发完成】`,
          `玩家：${player.name || usr_qq}`,
          `当前关系等级：${LIUSHEN_RELATIONSHIPS[currentRelationLevel].name} (Lv.${currentRelationLevel})`,
          `好感度：${liuShenData.好感度}`,
          ...rewardMessages,
          `补发操作已完成，请检查道具栏和角色状态。`
        ].join("\n");
        
        return finalMessage;
      } else {
        return [
          `【柳神奖励检查】`,
          `玩家：${player.name || usr_qq}`,
          `当前关系等级：${LIUSHEN_RELATIONSHIPS[currentRelationLevel].name} (Lv.${currentRelationLevel})`,
          `好感度：${liuShenData.好感度}`,
          `✓ 所有应得奖励均已正确发放，无需补发。`
        ].join("\n");
      }

    } catch (error) {
      console.error('补发柳神奖励时发生错误:', error);
      return `补发奖励时发生错误：${error.message}`;
    }
  }

  async zhangWuYeInteraction(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    const player = await Read_player(usr_qq);
    
    // 检查是否已解锁张五爷
    let zhangWuYeData = null;
    if (player.剧情人物 && Array.isArray(player.剧情人物)) {
        zhangWuYeData = player.剧情人物.find(np => np.张五爷);
    }
    
    if (!zhangWuYeData) {
        e.reply("你尚未遇到张五爷，请先在荒古禁地探索以触发相关剧情");
        return true;
    }

    // 检查冷却时间（每天最多交流3次）
    const now = Date.now();
    const lastInteraction = zhangWuYeData.lastInteraction || 0;
    let interactionCount = zhangWuYeData.todayInteractions || 0;

    // 获取今天的00:00时间戳
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartTimestamp = todayStart.getTime();

    // 如果最后一次交互是在今天之前，重置计数
    if (lastInteraction < todayStartTimestamp) {
        interactionCount = 0;
        zhangWuYeData.todayInteractions = 0; // 重置计数
    }

    // 检查是否超过每日限制
    if (interactionCount >= 3) {
        // 计算距离明天的时间
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        const timeLeft = tomorrowStart.getTime() - now;
        
        // 格式化为小时和分钟
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        e.reply([
            `【交流限制】`,
            `今日与张五爷交流次数已用完（3/3）`,
            `请${hours}小时${minutes}分钟后再来`,
            `（每日交流次数将在凌晨重置）`
        ].join('\n'));
        return true;
    }

    // 解析指令类型
    const match = e.msg.match(/^#(张五爷请教|张五爷交流|张五爷论源)(?:\s+(.*))?$/);
    if (!match) return false;
    
    const actionType = match[1];
    const question = match[2] || "";
    
    let replyMsg = "";
    let 好感增加 = 0;
    let 源石增加 = 0;
    let 额外奖励 = null;
    
    // 根据关系等级生成不同内容
    const relationLevel = zhangWuYeData.关系 || 1;
    
    switch (actionType) {
        case "张五爷请教":
            // 请教源术相关问题
            if (!question) {
                e.reply("请指明请教的内容，例如：#张五爷请教 源石辨识");
                return true;
            }
            
            replyMsg = `你向张五爷请教「${question}」，`;
            
            if (relationLevel >= 3) {
                replyMsg += "张五爷倾囊相授，详细讲解源术精要。";
                好感增加 = 12 + Math.floor(Math.random() * 8);
                源石增加 = 500000 + Math.floor(Math.random() * 500000);
                
                // 高关系有几率获得源天书残页
                if (Math.random() < 0.3) {
                    额外奖励 = { type: "功法", value: "源天神觉" };
                    await Add_najie_thing(usr_qq, "源天神觉", "功法", 1);
                }
            } else {
                replyMsg += "张五爷简要回答，你略有收获。";
                好感增加 = 6 + Math.floor(Math.random() * 4);
                源石增加 = 200000 + Math.floor(Math.random() * 300000);
            }
            break;
            
        case "张五爷交流":
            // 日常交流
            replyMsg = "你与张五爷闲谈交流，";
            
            if (relationLevel >= 2) {
                replyMsg += "张五爷讲述源天师一脉的传奇历史和寻源趣事。";
                好感增加 = 8 + Math.floor(Math.random() * 6);
                源石增加 = 300000 + Math.floor(Math.random() * 400000);
                
                // 概率获得普通源石
                if (Math.random() < 0.4) {
                    额外奖励 = { type: "道具", value: "超品源石" };
                    await Add_najie_thing(usr_qq, "超品源石", "道具", 1 + Math.floor(Math.random() * 3));
                }
            } else {
                replyMsg += "张五爷分享一些寻源的基本技巧和经验。";
                好感增加 = 4 + Math.floor(Math.random() * 3);
                源石增加 = 100000 + Math.floor(Math.random() * 200000);
            }
            break;
            
        case "张五爷论源":
            // 论及源术大道
            replyMsg = "你与张五爷论及源术大道，";
            
            if (relationLevel >= 4) {
                replyMsg += "张五爷毫无保留，将源天师一脉的核心秘传倾囊相授。";
                好感增加 = 15 + Math.floor(Math.random() * 10);
                源石增加 = 800000 + Math.floor(Math.random() * 700000);
                
                // 高概率获得稀有源石
                if (Math.random() < 0.6) {
                    额外奖励 = { type: "道具", value: "超品神源石" };
                    await Add_najie_thing(usr_qq, "超品神源石", "道具", 1);
                }
            } else if (relationLevel >= 3) {
                replyMsg += "张五爷深入讲解源术的精妙之处，你获益匪浅。";
                好感增加 = 10 + Math.floor(Math.random() * 8);
                源石增加 = 500000 + Math.floor(Math.random() * 500000);
            } else {
                replyMsg += "张五爷讲解源术基础，你有所领悟。";
                好感增加 = 7 + Math.floor(Math.random() * 5);
                源石增加 = 300000 + Math.floor(Math.random() * 400000);
            }
            break;
    }
    
    // 更新好感度
    zhangWuYeData.好感度 = (zhangWuYeData.好感度 || 0) + 好感增加;
    
    // 更新互动次数和时间
    zhangWuYeData.todayInteractions = (zhangWuYeData.todayInteractions || 0) + 1;
    zhangWuYeData.lastInteraction = now;
    
    // 记录互动事件
    if (!zhangWuYeData.事件记录) zhangWuYeData.事件记录 = [];
    zhangWuYeData.事件记录.push(`${actionType} - ${new Date().toLocaleDateString()}`);
    
    // 增加源石
    if (源石增加 > 0) {
        await Add_源石(usr_qq, 源石增加);
        replyMsg += `\n获得源石: ${bigNumberTransform(源石增加)}`;
    }
    
    // 添加额外奖励信息
    if (额外奖励) {
        replyMsg += `\n获得额外奖励: ${额外奖励.value}`;
    }
    
    // 添加当前关系信息
    replyMsg += `\n\n当前关系: ${this.getZhangWuYeRelationName(relationLevel)} (${zhangWuYeData.好感度 || 0}好感度)`;
    replyMsg += `\n今日交流次数: ${zhangWuYeData.todayInteractions}/3`;
    
    // 保存玩家数据
    await Write_player(usr_qq, player);
    
    e.reply(replyMsg);
    return true;
}

  // 获取张五爷关系名称
  getZhangWuYeRelationName(level) {
    const relations = {
      1: "初识",
      2: "熟络", 
      3: "赏识",
      4: "传承"
    };
    return relations[level] || "未知";
  }

  /**
   * 处理柳神奖励补发指令
   * @param {Object} e - 消息事件对象
   * @returns {boolean} 处理结果
   */
  async issueLiuShenRewards(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    
    try {
      // 调用补发奖励函数
      const result = await this.checkAndIssueLiuShenRewards(usr_qq);
      
      // 发送结果消息
      e.reply(result);
      
    } catch (error) {
      console.error('处理柳神奖励补发指令时发生错误:', error);
      e.reply(`补发奖励时发生错误：${error.message}`);
    }
    
    return true;
  }
}