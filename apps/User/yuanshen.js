/* ==========================================
 * zhengdaotixi.js  —— 元神体系（完整版）
 * ========================================== */
import { plugin, data } from '../../api/api.js';
import fs from 'fs';
import path from 'path';
import {
  existplayer,
  Read_player,
  Write_player,
  bigNumberTransform,
  __PATH
} from '../../model/xiuxian.js';

/* 1. 功法配置表（全局） */
const YUANSHEN_SKILLS = {
  '前字秘':            { cd: 240, ratio: 0.10 },
  '涅槃法门·残缺':     { cd: 360, ratio: 0.01 },
  '太一凝神诀':        { cd: 180, ratio: 0.08 },
  // 以后继续加
};

export class yuanshentixi extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_yuanshentixi',
      dsc:  '元神体系模块',
      event: 'message',
      priority: 600,
      rule: [
        { reg: '^#开启内景地$',          fnc: 'neijing' },
        { reg: '^#进入内景地$',          fnc: 'jinruneijing' },
        { reg: '^#内景地修炼(\\*(\\d+))?$', fnc: 'neijingBatch' },
        { reg: '^#凝练元神$',            fnc: 'ninglianyuanshen' },
        { reg: '^#我的元神$',            fnc: 'yuanshen' },
        { reg: '^以\\S+修炼元神$',       fnc: 'xiulianyuanshen' }
      ]
    });
  }

  /* =========================================================
   * 以 xxx 修炼元神
   * ========================================================= */
  async xiulianyuanshen(e) {
    if (!e.isGroup) return e.reply('修仙游戏请在群聊中游玩');

    const usr_qq = e.user_id.toString().replace('qg_', '');
    if (!await existplayer(usr_qq))
      return e.reply('玩家不存在，请先创建角色');

    const player = await Read_player(usr_qq);
    if (player.yuanshenlevel_id == null)
      return e.reply('你尚未凝练元神，无法修炼元神');

    /* 解析功法名 */
    const msg = e.msg.replace(/\s/g, '');          // 去所有空白
    const m = msg.match(/^以(\S+)修炼元神$/);
    if (!m) return;                                // 不匹配放行
    const skillName = m[1];

    if (!player.学习的功法.includes(skillName))
      return e.reply(`你尚未掌握【${skillName}】，无法以此修炼元神`);

    const cfg = YUANSHEN_SKILLS[skillName];
    if (!cfg)
      return e.reply(`【${skillName}】暂无元神修炼法门`);

    const 上限 = player.元神上限 || 0;
    if (上限 <= 0) return e.reply('元神上限异常，请先凝练元神');

    /* CD 检查 */
    const now = Date.now();
    const cdKey = `xiulian_${skillName}_${usr_qq}`;
    const cdMs  = cfg.cd * 60 * 1000;
    const last  = await redis.get(cdKey);
    if (last && now - last < cdMs) {
      const remainMin = Math.ceil((cdMs - (now - last)) / 1000 / 60);
      const h = Math.floor(remainMin / 60);
      const m = remainMin % 60;
      const str = h > 0 ? `${h}小时${m}分钟` : `${m}分钟`;
      return e.reply(`【${skillName}】尚在冷却，还需 ${str}`);
    }

    /* 恢复 & 写回 */
    const add = Math.ceil(上限 * cfg.ratio);
    player.元神 = (player.元神 || 0) + add;
    await Write_player(usr_qq, player);
    await redis.set(cdKey, now);

    return e.reply(
      `你运转【${skillName}】，元神恢复 ${bigNumberTransform(add)}（当前：${bigNumberTransform(player.元神)}/${bigNumberTransform(上限)}）`
    );
  }

async yuanshen(e) {
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('玩家不存在，请先创建角色');
        return;
    }
    
    let player = await Read_player(usr_qq);
    
    // ==== 新增：元神状态检查 ====
    let 元神状态 = "尚未凝练";
    let 元神等级名称 = "无";
    
    // 检查元神等级是否已凝练
    if (player.yuanshenlevel_id === undefined || player.yuanshenlevel_id === null) {
        元神状态 = "你还没有凝练元神";
    } else {
        // 查找元神等级数据
        const 元神等级数据 = data.Levelyuanshen_list.find(
            item => item.level_id == player.yuanshenlevel_id
        );
        
        // 检查是否找到对应等级
        if (!元神等级数据) {
            元神状态 = "元神等级数据异常，请重新凝练";
        } else {
            元神等级名称 = 元神等级数据.level;
            元神状态 = "已凝练";
        }
    }
    
    // ==== 构建回复信息 ====
    let 回复信息 = [
        `【${player.名号}元神状态】`,
        `元神强度：${player.元神 || 0}/${player.元神上限 || 0}`,
        `元神等级：${元神等级名称}`,
        `神识强度：${player.神识 || 0}点`,
        `状态：${元神状态}`
    ];
    
    e.reply(回复信息.join("\n"));
}
    async neijing(e) {
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('玩家不存在，请先创建角色');
        return;
    }
    
    let player = await Read_player(usr_qq);
       if (player.内景地 == 1 ) {
    e.reply(`你的内景地已然开启`);
    return;
}
    if (player.yuanshenlevel_id === undefined) {
   return e.reply(`你连元神都没有凝练是无法开启内景地的`);
  }
    let 要求 = 15000000 * (player.mijinglevel_id+player.xiangulevel_id)
    let 相差 = 要求-player.元神
   if (player.元神 <= 要求) {
    e.reply(`你的元神并不足以开启内景地，开启内景地需要${bigNumberTransform(要求)}，你只有${bigNumberTransform(player.元神)}，还差${bigNumberTransform(相差)}`);
    return;
}

// 计算成功概率（基础10% + 元神等级*10%）
const baseProbability = 0.1;
const successProbability = baseProbability + player.yuanshenlevel_id * 0.1; 
let 开启概率 = successProbability * 100 ;
let 元神加成 = (player.yuanshenlevel_id * 0.1) * 100 ;
// 生成随机数决定成败
const random = Math.random();
const isSuccess = random <= successProbability;

// 无论成败都扣除元神
player.元神 -= 要求;

if (isSuccess) {
    // 成功开启内景地
    player.内景地 = 1;
    await Write_player(usr_qq, player);
    
    // 成功文案（道家意境）
    e.reply([
        `紫府洞开，黄庭初现！`,
        `你的思感超越了物质界限，进入「致虚极，守静笃」的境界,开启了道家黄庭内景地！`,
        `泥丸宫中显化三寸灵台，识海化作无垠星空`,
    ].join("\n"));
} else {
    // 失败处理
    await Write_player(usr_qq, player);
    
    // 失败文案（带道家修炼术语）
    e.reply([
        `你欲打坐入定，进入那种『玄妙之极』的境界`,
        `然玄关紧闭，神火将熄！`,
        `冲关瞬间灵台蒙尘，三尸神躁动反噬`,
        `终究未能开启内景`,
        `总开启概率:${开启概率}%`,
        `基础概率10%,元神等级加成${元神加成}%`,
    ].join("\n"));
}}
    async ninglianyuanshen(e) {
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('玩家不存在，请先创建角色');
        return;
    }
    
    let player = await Read_player(usr_qq);

      if (player.凝练次数 === undefined) {
    player.凝练次数 = 1;
  }
    let cishu = player.凝练次数;
    let baseexp= 15000000*cishu
 let 秘境等级 = data.Levelmijing_list.find(
    item => item.level_id == player.mijinglevel_id
  ).level;
   let 仙古等级 = data.xiangujinshi_list.find(
    item => item.level_id == player.xiangulevel_id
  ).level;
    if (player.元神 < baseexp) {
        e.reply([
                `当前元神强度：${bigNumberTransform(player.元神)}/${bigNumberTransform(baseexp)}`,
                `你的元神不够强大，难以将元神凝练变得更加强大！`,
                `你需要获取修炼元神的法门或去精神宇宙摘取天药让元神壮大。`,
            ].join("\n"));
        return;
    }
    if (player.yuanshenlevel_id === undefined) {
    player.元神 -=baseexp;
    player.凝练次数 +=1;
    player.yuanshenlevel_id = 0;
       let 元神等级 = data.Levelyuanshen_list.find(
    item => item.level_id == player.yuanshenlevel_id
  ).level;
    await Write_player(usr_qq, player);
   return e.reply(`你成功凝练了元神，你目前的元神级别是${元神等级}！`);
  }
       if (player.yuanshenlevel_id >= 0) {
         if (player.xiangulevel_id == 1 && player.mijinglevel_id == 1) { 
        return e.reply(`你尚未开始修炼人体秘境体系或仙古今世法无法再继续凝练元神！`);}
    let 秘境要求 = 10 + player.yuanshenlevel_id;

  if (player.mijinglevel_id > 1 && player.mijinglevel_id < 秘境要求) {
    // 查找目标秘境等级名称，即秘境要求对应的等级
    let 目标秘境等级数据 = data.Levelmijing_list.find(item => item.level_id == 秘境要求);
    if (目标秘境等级数据) {
        return e.reply(`你的秘境体系道果不够强大，需先达到${目标秘境等级数据.level}！`);
    } else {
        // 如果找不到对应的等级，则使用等级ID
        return e.reply(`你的秘境体系道果不够强大，需先达到秘境等级${秘境要求}！`);
    }
}}
 if (player.yuanshenlevel_id >= 0) {
    let 仙古要求 = 8 + player.yuanshenlevel_id;
  if (player.xiangulevel_id > 1 && player.xiangulevel_id < 仙古要求) {
    // 查找目标秘境等级名称，即秘境要求对应的等级
    let 目标仙古今世法等级数据 = data.xiangujinshi_list.find(item => item.level_id == 仙古要求);
    if (目标仙古今世法等级数据) {
        return e.reply(`你的仙古今世法道果不够强大，需先达到${目标仙古今世法等级数据.level}！`);
    } else {
        // 如果找不到对应的等级，则使用等级ID
        return e.reply(`你的仙古今世法道果不够强大，需先达到仙古今世法等级${秘境要求}！`);
    }
}
}
    player.元神 -=baseexp;
    player.凝练次数 +=1;
    player.yuanshenlevel_id += 1;
       let 元神等级 = data.Levelyuanshen_list.find(
    item => item.level_id == player.yuanshenlevel_id
  ).level;
    await Write_player(usr_qq, player);
   return e.reply(`你成功凝练了元神，你目前的元神级别是${元神等级}！`);
}
   async jinruneijing(e) {
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('玩家不存在，请先创建角色');
        return;
    }
    
    let player = await Read_player(usr_qq);
    // ==== 高境界拦截 ====
    if (player.mijinglevel_id > 19||player.xiangulevel_id> 19) {
        const eraNames = ["神话时代", "乱古纪元", "仙古纪元", "末法时代"];
        const randomEra = eraNames[Math.floor(Math.random() * eraNames.length)];
        
        return e.reply([
            `${player.名号}眼眸开阖间有星河幻灭：`,
            `「自${randomEra}至今...」`,
            `「本座的道躯早已自成宇宙」`,
            `内景地飘落的道源粒子触体即散`,
            `化作点点星辉融入周天星辰`
        ].join('\n'));
    }
      // ==== 内景地状态检查 ====
    if (player.内景地 === undefined || player.内景地 !== 1) {
        return e.reply([
            '「内景未开，道门紧闭」',
            `${player.名号}周身道纹明灭不定`,
            `需先使用 #开启内景地 方能进入`,
            `（当前内景状态：${player.内景地 ?? "未觉醒"}）`
        ].join('\n'));
    }
    let reward = 500000;
    let zuizhong = (player.mijinglevel_id +player.xiangulevel_id)* player.level_id * player.Physique_id * reward;
    player.修为 += zuizhong;
    player.血气 += zuizhong;
    player.神识 += zuizhong;
     let zuizhong2 = 0.1*player.mijinglevel_id +player.xiangulevel_id;
    player.道伤 = Math.max(0, player.道伤 - zuizhong2);
    player.内景地 = 0;
    await Write_player(usr_qq, player);
     return e.reply([
        `【内景悟道·时溯千年】`,
        `${player.名号}盘坐内景地中，`,
        `见：`,
        `鹅毛大雪般的道源粒子飘落`,
        `时间长河在此流速缓慢`,
        `三魂七魄与大道共鸣`,
        `修炼成果：`,
        `一定程度消解生命之轮的道伤`,
        `修为淬炼 +${zuizhong}`,
        `血气升华 +${zuizhong}`,
        `神识蜕变 +${zuizhong}`,
        `「内景一瞬，外界千年」道音回荡`
    ].join('\n'));
}
async neijingBatch(e) {
    if (!e.isGroup) return e.reply('修仙游戏请在群聊中游玩');

    const usr_qq = e.user_id.toString().replace('qg_', '');
    if (!await existplayer(usr_qq)) return e.reply('玩家不存在，请先创建角色');

    const player = await Read_player(usr_qq);
    if (player.yuanshenlevel_id === undefined)
        return e.reply('你连元神都未凝练，谈何内景地？');

    // 解析次数
    const match = e.msg.match(/^#内景地修炼(?:\*(\d+))?$/);
    let times = 1;
    if (match && match[1]) times = Math.min(parseInt(match[1], 10), 50); // 单次上限50
    if (times <= 0) return e.reply('次数必须≥1');

    let successCnt = 0, failCnt = 0, totalCost = 0;
    const msgs = [];
    // ==== 高境界拦截 ====
    if (player.mijinglevel_id > 19||player.xiangulevel_id> 19) {
        const eraNames = ["神话时代", "乱古纪元", "仙古纪元", "末法时代"];
        const randomEra = eraNames[Math.floor(Math.random() * eraNames.length)];
        
        return e.reply([
            `${player.名号}眼眸开阖间有星河幻灭：`,
            `「自${randomEra}至今...」`,
            `「本座的道躯早已自成宇宙」`,
            `内景地飘落的道源粒子触体即散`,
            `化作点点星辉融入周天星辰`
        ].join('\n'));
    }
    for (let i = 0; i < times; i++) {
        // 每次重新读档，防止中途被别的指令改数据
        await Write_player(usr_qq, player);
        const 要求 = 15000000 * (player.mijinglevel_id + player.xiangulevel_id);
        if (player.元神 < 要求) {
            msgs.push(`【中止】第${i + 1}次：元神不足（需${bigNumberTransform(要求)}，仅剩${bigNumberTransform(player.元神)}）`);
            msgs.push(`剩余未执行：${times - i} 次`);
            break;
        }

        // 概率同原版
        const prob = 0.1 + player.yuanshenlevel_id * 0.1;
        const isWin = Math.random() <= prob;

        player.元神 -= 要求;
        totalCost += 要求;

        if (isWin) {
            successCnt++;
            player.内景地 = 1;               // 标记已开启
            await Write_player(usr_qq, player);

            // ===== 立即“进入”领奖励 =====
            const reward = 500000;
            const zuizhong = (player.mijinglevel_id + player.xiangulevel_id) * player.level_id * player.Physique_id * reward;
            player.修为 += zuizhong;
            player.血气 += zuizhong;
            player.神识 += zuizhong;
            const zuizhong2 = 0.1 * (player.mijinglevel_id + player.xiangulevel_id);
            player.道伤 = Math.max(0, player.道伤 - zuizhong2);
            player.内景地 = 0;               // 进入后关闭
            msgs.push(`第${i + 1}次：开启成功，已进入内景地，获得修为/血气/神识 +${bigNumberTransform(zuizhong)}，道伤 -${zuizhong2.toFixed(1)}`);
        } else {
            failCnt++;
            msgs.push(`第${i + 1}次：开启失败，损失元神 ${bigNumberTransform(要求)}`);
        }
    }

    // 最终存档
    await Write_player(usr_qq, player);

    // 汇总
    const summary = [
        `内景地批量修炼完成！`,
        `计划次数：${times} 次`,
        `实际执行：${successCnt + failCnt} 次`,
        `成功开启：${successCnt} 次`,
        `失败次数：${failCnt} 次`,
        `累计消耗元神：${bigNumberTransform(totalCost)}`,
        `剩余元神：${bigNumberTransform(player.元神)}`
    ].join('\n');

    e.reply(summary);
    if (msgs.length) await ForwardMsg(e, msgs); // 太长可转合并转发
}
}