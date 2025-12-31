import { plugin, verc, config, data } from '../../api/api.js';
import fs from 'fs';
import path from 'path';
import {
  existplayer,
  Write_player,
  Write_equipment,
  isNotNull,
  player_efficiency,
  get_random_fromARR,
  Read_player,
  foundthing,
  Read_equipment,
  Add_HP,
  zd_battle,
  exist_najie_thing,
  Add_修为,
  Add_player_学习功法,
  bigNumberTransform,
  Add_血气,
  __PATH,
  Add_寿元,
  Add_najie_thing,
  dujie,
  LevelTask,
  get_log_img,
  channel
} from '../../model/xiuxian.js';

export class xiangujinshi extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_xiangujinshi',
      dsc: '仙古今世法模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#冲关(极境)?$',
          fnc: 'chongguan'
        }
      ],
    });
  }

  async chongguan(e) {
    if (!e.isGroup) {
      e.reply('修仙游戏请在群聊中游玩');
      return;
    }
    
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
      e.reply('玩家不存在，请先创建角色');
      return;
    }
    
    const game_action = await redis.get("xiuxian:player:" + usr_qq + ":game_action");
    if (game_action == 0) {
      e.reply("修仙：游戏进行中...");
      return;
    }
    
    const player = await Read_player(usr_qq);
    if (!isNotNull(player.Physique_id)) {
      e.reply("请先#刷新信息");
      return;
    }
             if (player.level_id < 42||player.Physique_id < 42) {
        // 辰东风格文案
        const messages = [
            `你必须成就地仙，肉身成圣后才能修炼额外体系`,
        ];
        
         e.reply(messages);
        return;
    }
     if (player.mijinglevel_id > 1) {
        // 辰东风格文案
        const messages = [
            `仙古今世法与人体秘境体系不可兼修！`,
        ];
         e.reply(messages);
        return;
    }
    // 读取位面数据
    let weimianData = {};
    try {
      const weimianPath = data.filePathMap.weimianList;
      if (fs.existsSync(weimianPath)) {
        const rawData = fs.readFileSync(weimianPath, 'utf8');
        weimianData = JSON.parse(rawData);
      } else {
        e.reply('位面数据文件不存在，无法进行祭道');
        return;
      }
    } catch (err) {
      console.error('读取位面数据失败:', err);
      e.reply('读取位面数据失败，无法进行祭道');
      return;
    }
    
    // 检查位面等级
    const weimianLevel = weimianData["诸天位面"] || 10;
    const weimianyazhi = 10 - weimianLevel;
    if (player.xiangulevel_id + 1 > 19 - weimianyazhi) {
      const messages = [
        `诸天破碎，万界凋零！`,
        `时空长河断流，大道根基崩坏！`,
        `眼前所见，尽是残破的宇宙碎片，枯寂的星骸漂浮在虚无之中。`,
        `曾经辉煌的仙域已成废墟，不朽的神土化为焦土！`,
        `天地灵气枯竭，大道法则残缺不全！`,
        `在这片破败的诸天万界中（当前位面等级：${weimianLevel})`,
        `魂河和古地府等通道皆被黑暗物质侵蚀`,
        `「天地有缺，大道不全，何以承载至高强者？」`,
        `「唯有诸天复苏，万界重铸，洗尽污染，方有成就至高强者之机！」`
      ];
      e.reply(messages);
      return;
    }
   
    const next_level_id = data.xiangujinshi_list.find(item => item.level_id == (Number(player.xiangulevel_id) + 1));
    if (!next_level_id) {
      e.reply(`你已破关至最高境界`);
      return;
    }

    const isExtreme = e.msg.includes("极境");
if (!player.极境 || !Array.isArray(player.极境)) {
    player.极境 = [];
}
    // 搬血境突破逻辑
    if (player.xiangulevel_id === 1) {

 await this.breakthroughNormalBloodRealm(e, usr_qq, player);
      
    }
     // 搬血极境突破逻辑
    if (player.xiangulevel_id === 2) {
      if (isExtreme) {
        // 检查是否已突破搬血极境
        if (player.极境.includes("2")) {
          return e.reply("你已成就搬血极境，无需再次突破");
        }
        return await this.breakthroughExtremeBloodRealm(e, usr_qq, player);
      } else {
        return await this.breakthroughNormalDongtianRealm(e, usr_qq, player);
      }
    }
    // 洞天境突破判断
    if (player.xiangulevel_id === 3) {
      if (isExtreme) {
        // 检查是否已突破洞天极境
        if (player.极境.includes("3")) {
          return e.reply("你已成就洞天极境，无需再次突破");
        }
        return await this.breakthroughExtremeDongtianRealm(e, usr_qq, player);
      } else {
        return await this.breakthroughNormalhualingRealm(e, usr_qq, player);
      }
    }

if (player.xiangulevel_id === 4) { 
        if (isExtreme) {
            if (player.极境.includes("4")) {
                return e.reply("你已成就化灵极境，无需再次突破");
            }
            return await this.breakthroughExtremeHualingRealm(e, usr_qq, player);
        } else {
            // 普通突破到铭纹境
            return await this.breakthroughNormalMingwenRealm(e, usr_qq, player);
        }
    }
        if (player.xiangulevel_id === 5) { 
        if (isExtreme) {
            if (player.极境.includes("5")) {
                return e.reply("你已成就铭文极境，无需再次突破");
            }
            return await this.breakthroughExtremeMingwenRealm(e, usr_qq, player);
        } else {
            // 普通突破到列阵境
            return await this.breakthroughNormalLiezhenRealm(e, usr_qq, player);
        }
    }
        if (player.xiangulevel_id === 6) { 
        if (isExtreme) {
            if (player.极境.includes("6")) {
                return e.reply("你已成就列阵极境，无需再次突破");
            }
            return await this.breakthroughExtremeLiezhenRealm(e, usr_qq, player);
        } else {
            // 普通突破到尊者境
            return await this.breakthroughZunzheRealm(e, usr_qq, player);
        }
    }
     if (player.xiangulevel_id === 7) { 
        if (isExtreme) {
            if (player.极境.includes("7")) {
                return e.reply("你已成就尊者极境，无需再次突破");
            }
            return await this.breakthroughExtremeZunzheRealm(e, usr_qq, player);
        } else {
           return e.reply("后续内容还在更新");
        }
    }
   return e.reply("后续内容还在更新");
  }

  // 普通搬血境突破
  async breakthroughNormalBloodRealm(e, usr_qq, player) {
    const baseBloodNeed = 500000;
    const actualBloodNeed = this.calculateActualCost(baseBloodNeed);

    if (player.血气 < actualBloodNeed) {
      const missingBlood = actualBloodNeed - player.血气;
      return e.reply([
        `【血气未足·搬血难成】`,
        `你盘坐大荒山巅，尝试引动全身精血`,
        `体内血气如溪流潺潺，未能形成海啸之势`,
        `搬血境需血气如龙，奔腾若雷鸣！`,
        `尚需${bigNumberTransform(missingBlood)}点血气`,
        `可猎杀凶兽、服用宝药积累血气`,
      ].join("\n"));
    }

    const beastBloodTypes = ["朱厌真血", "螭龙真血", "饕餮真血", "穷奇真血"];
    if (!await this.hasAtLeastOneBloodType(usr_qq, beastBloodTypes)) {
      return e.reply([
        `【根基不稳·难承大道】`,
        `你欲冲击搬血境，却感肉身孱弱`,
        `搬血境需以凶兽真血洗礼，熬炼肉身`,
        `如那石村孩童，自幼以朱厌、螭龙真血淬体`,
        `需寻得太古遗种真血（如${beastBloodTypes.join("、")}）`,
        `方可铸就无敌根基！`,
      ].join("\n"));
    }

    if (!this.hasRequiredGongfa(player, "搬血")) {
      const requiredBaoshu = ["青鳞鹰宝术", "狻猊宝术", "朱雀宝术"];
      const gongfaName = this.getRequiredGongfaName(player, "搬血");
      
      return e.reply([
        `【符文未明·神曦难生】`,
        `你尝试熔炼骨文于血，却茫然无措`,
        `搬血境需领悟原始骨文，引动血气化神曦`,
        `如那${requiredBaoshu.join("、")}等宝术`,
        `或至高无上的《原始真解》`,
        `当前可习宝术：${gongfaName}`,
      ].join("\n"));
    }

    // 消耗资源
    await Add_血气(usr_qq, -actualBloodNeed);
    await this.consumeOneBloodType(usr_qq, beastBloodTypes);

    const bloodTypeUsed = await this.getConsumedBloodType(usr_qq, beastBloodTypes);
    const gongfaName = this.getRequiredGongfaName(player, "搬血");
    const isSaintBody = ["荒古圣体", "天生至尊"].includes(player.Physique_id);

    e.reply([
      `【搬血大成·神曦冲霄】`,
      `你盘坐大荒祭坛，以${bloodTypeUsed}沐浴己身`,
      `运转《${gongfaName}》，熔炼原始骨文于血脉之中`,
      `轰！！！`,
      `${isSaintBody ? "一道金色血气狼烟冲天而起，震动苍穹" : "周身霞光万道，瑞彩千条"}`,
      `血液奔涌如雷鸣，又似洪荒凶兽咆哮`,
      `每一滴血都孕育神曦，${isSaintBody ? "金色圣血" : "赤红宝血"}中符文闪烁`,
      `单臂一晃，${isSaintBody ? "十万斤" : "八万斤"}神力自成！`,
      `搬血境——成！`,
    ].join("\n"));

    player.xiangulevel_id = 2;
    await Write_player(usr_qq, player);
     let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
  }

  // 搬血极境突破
  async breakthroughExtremeBloodRealm(e, usr_qq, player) {
    const extremeConditions = await this.checkExtremeConditions(usr_qq, player);
    if (!extremeConditions.canBreakthrough) {
      return this.showExtremeRequirements(e, extremeConditions);
    }

    await this.consumeExtremeResources(usr_qq);
    const breakthroughResult = await this.processExtremeBreakthrough(player);
    await this.updatePlayerForExtreme(usr_qq, player, breakthroughResult);
    return this.showExtremeResult(e, breakthroughResult);
  }

  // 普通境界突破
  async normalBreakthrough(e, usr_qq, player) {
    const baseNeedExp = this.calculateBaseNeedExp(player);
    const actualNeedExp = this.calculateActualCost(baseNeedExp);
    
    if (player.血气 < actualNeedExp || player.修为 < actualNeedExp) {
      return e.reply([
        `突破所需资源不足！`,
        `需要血气：${bigNumberTransform(actualNeedExp)}`,
        `需要修为：${bigNumberTransform(actualNeedExp)}`,
        `当前血气：${bigNumberTransform(player.血气)}`,
        `当前修为：${bigNumberTransform(player.修为)}`
      ].join("\n"));
    }

    player.xiangulevel_id += 1;
    player.血气 -= actualNeedExp;
    player.修为 -= actualNeedExp;
    
    const level = data.xiangujinshi_list.find(item => item.level_id == player.xiangulevel_id).level;
    await Write_player(usr_qq, player);
    
    e.reply([
      `冲关成功！`,
      `消耗血气：${bigNumberTransform(actualNeedExp)}`,
      `消耗修为：${bigNumberTransform(actualNeedExp)}`,
      `当前境界：${level}`,
    ].join("\n"));
  }

  // ========== 工具函数 ==========
  async checkExtremeConditions(usr_qq, player) {
    const isSpecialPhysique = ["荒古圣体", "天生至尊"].includes(player.Physique_id);
    const hasEnoughBloodEnergy = player.血气 >= 1000000;
    const hasThreeBloodTypes = await this.hasAtLeastThreeBloodTypes(usr_qq);

    return {
      canBreakthrough: isSpecialPhysique ? hasThreeBloodTypes : 
                      (hasEnoughBloodEnergy  && hasThreeBloodTypes),
      isSpecialPhysique,
      hasEnoughBloodEnergy,
      hasThreeBloodTypes,
      missingResources: {
        blood: Math.max(0, 1000000 - player.血气),

        bloodTypes: !hasThreeBloodTypes
      }
    };
  }

  async showExtremeRequirements(e, conditions) {
    const messages = [
      `【极境之路·条件未足】`,
      `欲达搬血极境，需满足以下条件：`,
    ];

    if (!conditions.isSpecialPhysique) {
      messages.push(
        `血气如海：${conditions.missingResources.blood > 0 ? 
          `尚缺${bigNumberTransform(conditions.missingResources.blood)}点` : '已满足'}`,
      );
    }

    messages.push(
      `三种太古遗种真血：${conditions.missingResources.bloodTypes ? '未满足' : '已满足'}`,
      `特殊体质（圣体/至尊）可减免部分要求`,
      `但必须收集至少三种太古遗种真血！`,
    );

    return e.reply(messages.join("\n"));
  }

  async consumeExtremeResources(usr_qq) {
    // 消耗血气
    await Add_血气(usr_qq, -1000000);

    // 消耗三种真血
    const beastBloodTypes = ["朱雀真血", "狻猊真血", "饕餮真血","真龙真血", "真凰真血", "鲲鹏真血", "雷帝真血", "朱厌真血", "螭龙真血"];
    let consumedCount = 0;
    for (const bloodType of beastBloodTypes) {
      if (consumedCount >= 3) break;
      if (await exist_najie_thing(usr_qq, bloodType, "道具")) {
        await Add_najie_thing(usr_qq, bloodType, "道具", -1);
        consumedCount++;
      }
    }
  }

  async processExtremeBreakthrough(player) {
    const isSaintBody = player.灵根.name === "荒古圣体";
    const isBornEmperor = player.灵根.name === "天生至尊";
    const bloodType = isSaintBody ? "金色圣血" : isBornEmperor ? "紫晶帝血" : "赤红宝血";
    
    // 随机突破加成
    const extraPower = Math.floor(Math.random() * 8000) + 2000; // 2000-10000额外力量
    const totalPower = 100000 + extraPower;

    return {
      bloodType,
      extraPower,
      totalPower,
      isSaintBody,
      isBornEmperor
    };
  }

  async updatePlayerForExtreme(usr_qq, player, result) {
    player.xiangulevel_id = 2;
        if (!player.极境.includes("2")) {
      player.极境.push("2");
    }
    player.攻击加成 += 300000 ;
    player.防御加成 += 300000 ;
    player.生命加成 += 300000 ;
    if (result.isSaintBody) {
      player.圣体异象 = "血气狼烟";
    }
    if (result.isBornEmperor) {
      player.至尊骨 = "初现";
    }
    
    await Write_player(usr_qq, player);
     let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
  }

  async showExtremeResult(e, result) {
    const messages = [
      `【搬血极境·十万八千斤】`,
      `你盘坐混沌中，引动${result.bloodType}沸腾`,
      `轰！！！天地震颤，虚空崩裂！`,
      `${result.isSaintBody ? "金色血气如真龙腾空，贯穿霄汉" : 
        result.isBornEmperor ? "紫气东来三万里，帝血映照诸天" : "赤霞漫天，瑞彩千条"}`,
      `每一滴血都孕育神曦，原始符文烙印虚空`,
      `单臂一晃，十万八千斤神力自成！`,
      `打破极境，成就无敌身！`,
      `获得额外属性：`,
      `攻击+${bigNumberTransform(300000 )}`,
      `防御+${bigNumberTransform(300000 )}`,
      `生命+${bigNumberTransform(300000 )}`,
      `${result.isSaintBody ? "√ 圣体异象觉醒" : ""}`,
      `${result.isBornEmperor ? "√ 至尊骨初现" : ""}`,
    ].filter(Boolean).join("\n");
    
    return e.reply(messages);
  }
// 洞天境普通突破
async breakthroughNormalDongtianRealm(e, usr_qq, player) {
    // 突破所需资源
    const requiredResources = [
        { name: "猴儿酒", class: "丹药", quantity: 10 },
        { name: "不老泉", class: "丹药", quantity: 1 },
        { name: "太一真水", class: "道具", quantity: 1 },
        { name: "金翅大鹏鸟血肉", class: "道具", quantity: 1 } // 以斤为单位
    ];
    
    // 能量要求（参考原著十洞天突破）
    const baseEnergyNeed = this.calculateBaseNeedExp(player);
    const actualEnergyNeed = this.calculateActualCost(baseEnergyNeed);

       // ==== 资源检查拦截（新增详细物品缺失提示）====
    const missingItems = [];
    for (const res of requiredResources) {
        const currentQuantity = await exist_najie_thing(usr_qq, res.name, res.class);
        if (currentQuantity < res.quantity) {
            missingItems.push({
                name: res.name,
                required: res.quantity,
                current: currentQuantity,
                deficit: res.quantity - currentQuantity
            });
        }
    }

    // 资源不足拦截
    if (missingItems.length > 0) {
        const reportLines = missingItems.map(item => 
            ` ${item.name}：需${item.required}个，缺${item.deficit}个`
        );
        
        return e.reply([
            `【资源不足·洞天难开】`,
            `开辟十洞天需以下珍稀资源：`,
            ...reportLines,
        ].join("\n"));
    }

    // 检查能量是否足够
    if (player.修为 < actualEnergyNeed || player.血气 < actualEnergyNeed) {
        return e.reply([
            `【洞天未开·神精不足】`,
            `欲开辟十口洞天，需磅礴神精支撑`,
            `尚缺修为：${bigNumberTransform(Math.max(0, actualEnergyNeed - player.修为))}`,
            `尚缺血气：${bigNumberTransform(Math.max(0, actualEnergyNeed - player.血气))}`,
            missingResources.length > 0 ? `需准备：${missingResources.join("、")}` : ""
        ].join("\n"));
    }

    // 检查是否具备原始真解（参考石昊突破关键）
    if (!player.学习的功法.includes("原始真解神引篇")) {
        return e.reply([
            `【符文未悟·洞天难筑】`,
            `十洞天需熔炼原始骨文于虚空`,
            `如石昊般参悟《原始真解神引篇》方能源源不断汲取神精`,
        ].join("\n"));
    }

    // 消耗资源
    await Add_血气(usr_qq, -actualEnergyNeed);
    await Add_修为(usr_qq, -actualEnergyNeed);
    for (const res of requiredResources) {
        await Add_najie_thing(usr_qq, res.name, res.class, -res.quantity);
    }

    // 突破成功
    player.xiangulevel_id = 3; // 洞天境ID
    player.dongtian_count = 10; // 记录十口洞天
    await Write_player(usr_qq, player);
     let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);

    // 突破特效（参考原著石昊十洞天异象）
    const isSaintBody = ["荒古圣体", "天生至尊"].includes(player.Physique_id);
    e.reply([
        `【十洞天开·震动八荒】`,
        `你吞服${requiredResources.map(r => r.name).join("、")}，盘坐虚神界废墟`,
        `运转《原始真解神引篇》，十口洞天如神阳横空`,
        `${isSaintBody ? "金色血气化作真龙" : "赤霞如潮"}涌入洞天`,
        `轰隆！天地震颤，虚空浮现十轮神日`,
        `每口洞天喷薄瑞彩，吞吐日月精华`,
        `如石昊当年，十洞天共鸣，威压震慑百兽`,
        `洞天境——成！`
    ].join("\n"));
}
// 洞天极境突破
async breakthroughExtremeDongtianRealm(e, usr_qq, player) {
    // 前置检查：必须已开辟十洞天
    if (player.dongtian_count !== 10) {
        return e.reply([
            `【根基未固·极境难求】`,
            `欲达洞天极境，需先开辟十口洞天`,
            `当前洞天数量：${player.dongtian_count || 0}`,
            `请先完成普通洞天突破`
        ].join("\n"));
    }



    // 能量要求（十倍于普通突破）
    const baseEnergyNeed = this.calculateBaseNeedExp(player);
    const actualEnergyNeed = this.calculateActualCost(baseEnergyNeed);

     // 检查柳神本源
    const willowEssenceQty = await exist_najie_thing(usr_qq, "柳神本源", "道具");
    if (willowEssenceQty < 1) {
        return e.reply([
            `【神物缺失·极境无门】`,
            ` 柳神本源：需1份，现有${willowEssenceQty}份`,
        ].join("\n"));
    }

    // 能量检查
    if (player.修为 < actualEnergyNeed || player.血气 < actualEnergyNeed) {
        return e.reply([
            `【神精枯竭·极境难成】`,
            `重塑洞天需海量神精支撑`,
            `尚缺修为：${bigNumberTransform(actualEnergyNeed - player.修为)}`,
            `尚缺血气：${bigNumberTransform(actualEnergyNeed - player.血气)}`,
            `需准备：${extremeResources.map(r => `${r.name}×${r.quantity}`).join("、")}`
        ].join("\n"));
    }

    // 消耗资源
    await Add_血气(usr_qq, -actualEnergyNeed);
    await Add_修为(usr_qq, -actualEnergyNeed);

        await Add_najie_thing(usr_qq, "柳神本源", "道具", -1);
    

    // 突破过程（参考石昊极境突破）
    const breakthroughResult = {
        hasFleshDongtian: true, // 肉身洞天
        dongtianState: "唯一洞天", // 洞天神环
        extraPower: Math.floor(Math.random() * 100000) + 50000
    };

    // 更新玩家数据
       if (!player.极境.includes("3")) {
      player.极境.push("3");
    }
    player.攻击加成 += 650000;
    player.防御加成 += 650000;
    player.生命加成 += 650000;
    await Write_player(usr_qq, player);
 let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
    // 突破特效（参考原著唯一洞天异象）
    e.reply([
        `【洞天极境·洞天神环】`,
        `你引动柳神本源，十洞天轰然碰撞！`,
        `虚空扭曲，神环初现，如石昊当年重塑洞天`,
        `骨文蔓延，滋养体内新生洞天`,
        `轰！！！十洞天熔炼为不朽神环`,
        `胸口至尊骨处开辟第十一口肉身洞天`,
        `万法不侵，磨灭符文，镇压虚空`,
        `获得极境属性：`,
        ` 攻击+${bigNumberTransform(650000)}`,
        ` 防御+${bigNumberTransform(650000)}`,
        ` 生命+${bigNumberTransform(650000)}`,
        ` 洞天神环（万法不侵）`,
        ` 肉身洞天（持续滋养肉身）`
    ].join("\n"));
}
async breakthroughNormalhualingRealm(e, usr_qq, player) {
    // 三阶段总能量需求（洞天境的5倍）
    const baseEnergyNeed = this.calculateBaseNeedExp(player);
    const actualEnergyNeed = this.calculateActualCost(baseEnergyNeed);

    // 检查前置境界极境（参考石昊根基）[3,7](@ref)
    if (!player.极境.includes("2") || !player.极境.includes("3")) { 
        return e.reply([
            `【道基有缺·灵性难生】`,
            `化灵境需完美根基支撑：`,
            `搬血极境：${player.极境.includes("2") ? '✓' : '✗'}`,
            `洞天极境：${player.极境.includes("3") ? '✓' : '✗'}`,
            `未达极境者，终生无望肉身成灵！`
        ].join("\n"));
    }

    // 能量检查（血气+修为双重消耗）
    if (player.血气 < actualEnergyNeed || player.修为 < actualEnergyNeed) {
        const missingBlood = Math.max(0, actualEnergyNeed - player.血气);
        const missingCultivation = Math.max(0, actualEnergyNeed - player.修为);
        return e.reply([
            `【神精枯竭·灵胎难塑】`,
            `化灵三阶段需海量本源滋养：`,
            `尚缺血气：${bigNumberTransform(missingBlood)}`,
            `缺修为：${bigNumberTransform(missingCultivation)}`,
        ].join("\n"));
    }

    // 消耗资源并突破
    await Add_血气(usr_qq, -actualEnergyNeed);
    await Add_修为(usr_qq, -actualEnergyNeed);
    player.xiangulevel_id = 4; // 进入化灵境
    player.hualing_stage = 3;  // 直接完成三阶段（因根基完美）

    // 突破特效（阴阳交汇意象）[9](@ref)
    e.reply([
        `【肉身成灵·先天神胎】`,
        `血气化神曦奔涌，洞天喷薄混沌气！`,
        `周身毛孔吞吐霞光，符文熔炼入血肉`,
        `精神真我重塑`,
        `识海清明照见本源，斩尽尘劳锁链`,
        `洞天养灵终成`,
        `十洞天轰鸣，孕育先天真灵虚影`,
        `生命层次跃迁——后天返先天！`
    ].join("\n"));
    await Write_player(usr_qq, player);
     let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
}

// 化灵极境突破（阴阳熬炼版）
async breakthroughExtremeHualingRealm(e, usr_qq, player) {
    // 能量需求（普通突破的20倍）[7](@ref)
    const baseEnergyNeed = this.calculateBaseNeedExp(player);
    const actualEnergyNeed = this.calculateActualCost(baseEnergyNeed);

    // 前置检查
    if (player.hualing_stage !== 3) return e.reply("需先完成化灵三阶段修行");
    if (player.极境.includes("4")) return e.reply("已臻至化灵极境");

    // 能量检查
    if (player.血气 < actualEnergyNeed || player.修为 < actualEnergyNeed) {
        return e.reply(`需储备${bigNumberTransform(actualEnergyNeed)}点血气/修为`);
    }
      // 检查柳神本源
    const kunpeng = await exist_najie_thing(usr_qq, "鲲鹏神液", "道具");
    if (kunpeng < 5) {
        return e.reply([
            `【神物缺失·极境无门】`,
            ` 鲲鹏神液：需5份，现有${kunpeng}份`,
            `太古鲲鹏精血所化，阴阳调和之圣物`,
            `极境突破，非此不可！`
        ].join("\n"));
    }
     await Add_najie_thing(usr_qq, "鲲鹏神液", "道具", -5);
    // 阴阳熬炼过程（参考用户文案）
    const yangDamage = Math.floor(player.血量上限 * 0.3); // 阳极洞灼伤30%生命
    const yinDamage = Math.floor(player.血量上限 * 0.2);  // 玄冰渊冻结20%生命
    await Add_HP(usr_qq, -yangDamage, "阳极洞焚身");
    await Add_HP(usr_qq, -yinDamage, "玄冰渊冻魂");

    // 消耗资源突破
    await Add_血气(usr_qq, -actualEnergyNeed);
    await Add_修为(usr_qq, -actualEnergyNeed);
    player.极境.push("4");
    
    // 属性加成（侧重精神与洞天）
    player.攻击加成 += 1650000;
    player.防御加成 += 1650000; // 新增精神属性
    player.生命加成 += 1650000; // 洞天养灵强化


    const spiritWeapons = [
        { name: "剑", desc: "斩断因果，破灭虚妄" },
        { name: "鼎", desc: "镇压乾坤，熔炼阴阳" },
        { name: "钟", desc: "震荡时空，唤醒真我" },
        { name: "塔", desc: "九层天阙，登临极境" },
        { name: "镜", desc: "照见本源，映现大道" }
    ];
    const selectedWeapon = spiritWeapons[Math.floor(Math.random() * spiritWeapons.length)];
     // 优化后的突破文案
    const breakthroughText = [
        `【阴阳熬炼·神曦化形】`,
        `🌞 阳极洞中·焚身炼神`,
        `太阳精火如瀑倾泻，血肉碳化又重生`,
        `符文在烈焰中淬炼，宛若仙金铸就道基`,
        `玄冰渊底·冻魂明心`,
        `万载玄冰封冻神魂，识海冻结复归清明`,
        `真我超脱虚妄束缚，道心澄澈如镜`,
        `阴阳交汇·涅槃重生`,
        `九渡生死交界，精神涅槃脱胎换骨`,
        `鲲鹏神液调和阴阳，混沌母气滋养洞天`,
        `洞天养灵·极境大成`,
        `十口洞天喷薄混沌，神曦化${selectedWeapon.name}横空`,
        `${selectedWeapon.desc}，斩灭大道枷锁！`,
        `突破成果：`,
        `• 攻击加成：+1,650,000`,
        `• 防御加成：+1,650,000`,
        `• 生命加成：+1,650,000`,
        `• 神曦化形：${selectedWeapon.name}（${selectedWeapon.desc}）`,
        `💫 化灵极境——圆满功成！`
    ].join('\n');
    await Write_player(usr_qq, player);
     let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
     return e.reply(breakthroughText);
}
// 普通铭文境突破（从化灵境突破）
async breakthroughNormalMingwenRealm(e, usr_qq, player) {
    // 能量需求（化灵境的8倍）
    const baseEnergyNeed = this.calculateBaseNeedExp(player);
    const actualEnergyNeed = this.calculateActualCost(baseEnergyNeed);

    // 前置检查：必须完成化灵极境
    if (!player.极境.includes("4")) {
        return e.reply([
            `【符文未明·铭刻无门】`,
            `铭文境需先达化灵极境，神曦化形为基`,
            `当前化灵境界：${player.hualing_stage >= 3 ? "三阶段完成" : "未完成"}`,
            `极境状态：${player.极境.includes("4") ? "已达成" : "未达成"}`,
            `需先完成化灵极境突破！`
        ].join("\n"));
    }

    // 检查功法储备（需至少掌握3种强大宝术）
    const powerfulBaoshu = ["鲲鹏宝术", "真龙宝术", "雷帝宝术", "饕餮宝术", "朱雀宝术",  "青天鹏宝术"];
    const userBaoshu = player.学习的功法.filter(gongfa => powerfulBaoshu.includes(gongfa));
    
    if (userBaoshu.length < 3) {
        return e.reply([
            `【底蕴不足·万符难铭】`,
            `铭文境需熔炼万千符文于己身`,
            `当前掌握强大宝术：${userBaoshu.join("、") || "无"}`,
            `需至少掌握3种强大宝术`,
        ].join("\n"));
    }

    // 能量检查
    if (player.血气 < actualEnergyNeed || player.修为 < actualEnergyNeed) {
        const missingBlood = Math.max(0, actualEnergyNeed - player.血气);
        const missingCultivation = Math.max(0, actualEnergyNeed - player.修为);
        return e.reply([
            `【神精枯竭·符光黯淡】`,
            `铭刻万符需浩瀚本源支撑：`,
            `尚缺血气：${bigNumberTransform(missingBlood)}`,
            `缺修为：${bigNumberTransform(missingCultivation)}`,
            `（需汲取天地精华或炼化神物补充）`
        ].join("\n"));
    }

    // 消耗资源并突破
    await Add_血气(usr_qq, -actualEnergyNeed);
    await Add_修为(usr_qq, -actualEnergyNeed);
    player.xiangulevel_id = 5; // 进入铭文境
    player.mingwen_count = userBaoshu.length; // 记录铭刻宝术数量

    // 突破特效（万符绕体）
    e.reply([
        `【万符铭身·宝术自成】`,
        `你盘坐混沌中，引动${userBaoshu.join("、")}本源符文`,
        `轰！十洞天齐鸣，喷薄混沌气`,
        `万千原始符文如星河环绕，逐一烙印血肉骨骼`,
        `${player.神曦化形 ? player.神曦化形 + "形态神曦沸腾" : "周身神曦沸腾"}`,
        `符文化海`,
        `血液中符文流淌，骨骼上道纹自生`,
        `举手投足间宝术自成，威力暴增`,
        `铭文境——成！`,
        `当前铭刻宝术：${userBaoshu.length}种`,
    ].join("\n"));
    await Write_player(usr_qq, player);
     let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
}
// 铭文极境突破（需原始真解神引篇）
async breakthroughExtremeMingwenRealm(e, usr_qq, player) {
    // 能量需求（普通铭文境的25倍）
    const baseEnergyNeed = this.calculateBaseNeedExp(player);
    const actualEnergyNeed = this.calculateActualCost(baseEnergyNeed);

    // 前置检查
    if (player.xiangulevel_id !== 5) return e.reply("需先突破至铭文境");
    if (player.极境.includes("5")) return e.reply("已臻至铭文极境");

    // 核心检查：必须掌握原始真解神引篇
    if (!player.学习的功法.includes("原始真解神引篇")) {
        return e.reply([
            `【大道未明·真符难炼】`,
            `铭文极境需参透万符本源，融会贯通`,
            `唯有《原始真解神引篇》可解析万符奥秘`,
            `当前掌握：${player.学习的功法.includes("原始真解神引篇") ? "已掌握" : "未掌握"}`,
        ].join("\n"));
    }


    // 能量检查
    if (player.血气 < actualEnergyNeed || player.修为 < actualEnergyNeed) {
        return e.reply(`需储备${bigNumberTransform(actualEnergyNeed)}点血气/修为引动雷劫`);
    }

    // 引动雷劫（消耗生命值模拟天罚）
    const thunderDamage = Math.floor(player.生命加成 * 0.6); // 雷劫造成60%生命伤害
    await Add_HP(usr_qq, -thunderDamage, "铭文极境雷劫");

    // 消耗资源突破
    await Add_血气(usr_qq, -actualEnergyNeed);
    await Add_修为(usr_qq, -actualEnergyNeed);
    player.极境.push("5");
    
    // 属性加成（侧重符文与全能）
    player.攻击加成 += 1800000;
    player.防御加成 += 1500000;
    player.生命加成 += 2000000;
    player.符文掌握 = "万符归一"; // 特殊属性

    // 随机生成至尊符文形态
    const supremeSymbols = ["鲲鹏", "真龙", "雷帝", "草剑", "轮回"];
    const supremeSymbol = supremeSymbols[Math.floor(Math.random() * supremeSymbols.length)];

    // 突破文案（原始真解引导万符归一）
    e.reply([
        `【真解导引·万法归一】`,
        `你运转《原始真解神引篇》，解析万符本源奥秘`,
        `神引篇·符文解析`,
        `原始真解发光，分解万千符文至最本源状态`,
        `神引篇·大道重组`,
        `以真解为引，重构符文体系，融会贯通`,
        `神引篇·万符归一`,
        `万千符文熔炼为一`,
        `轰！天地震颤，铭文极境雷劫降临！`,
        `九重雷劫过后，至尊符文化作永恒烙印`,
        `铭文极境——成！`,
    ].join("\n"));
    await Write_player(usr_qq, player);
     let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
}
// 普通列阵境突破（从铭文境突破）
async breakthroughNormalLiezhenRealm(e, usr_qq, player) {
    // ==== 阵纹配置 ====
    const userFormations = [
        "混沌杀阵",
        "阴阳困阵",
        "四象守护阵",
        "五行聚灵阵"
    ];
    
    const baseEnergyNeed = this.calculateBaseNeedExp(player);
    const actualEnergyNeed = this.calculateActualCost(baseEnergyNeed);

    // ==== 功法检查 ====
    if (!player.学习的功法.includes("原始真解神引篇")) {
        return e.reply([
            `【阵道无基·列阵无门】`,
            `列阵境需以原始真解解析阵道本质`,
            `《原始真解神引篇》阐释符文起源，是体内刻阵的根基`,
            `当前掌握：${player.学习的功法.includes("原始真解神引篇") ? "已掌握" : "未掌握"}`,
            `需先参悟神引篇方可构筑阵纹`
        ].join("\n"));
    }

    // ==== 极境检查 ====
    if (!player.极境.includes("5")) {
        return e.reply([
            `【符文未固·阵基难成】`,
            `列阵境需先达铭文极境，以至尊符文为阵眼`,
            `极境状态：${player.极境.includes("5") ? "已达成" : "未达成"}`,
            `（铭文极境是刻阵的能量核心）`
        ].join("\n"));
    }

    // ==== 资源检查 ====
    if (player.血气 < actualEnergyNeed || player.修为 < actualEnergyNeed) {
        const missingBlood = Math.max(0, actualEnergyNeed - player.血气);
        const missingCultivation = Math.max(0, actualEnergyNeed - player.修为);
        return e.reply([
            `【阵源枯竭·阵纹难刻】`,
            `刻阵需磅礴本源支撑：`,
            `尚缺血气：${bigNumberTransform(missingBlood)}`,
            `缺修为：${bigNumberTransform(missingCultivation)}`,
            `（可炼化灵脉补充）`
        ].join("\n"));
    }

    // ==== 突破处理 ====
    await Add_血气(usr_qq, -actualEnergyNeed);
    await Add_修为(usr_qq, -actualEnergyNeed);
    player.xiangulevel_id = 6; // 进入列阵境
    player.liezhen_type = "原始阵纹";

    // ==== 突破特效 ====
    const formationsDesc = userFormations.map(f => `${f}阵纹`).join(" + ");
    await e.reply([
        `【神引为基·万阵初成】`,
        `你运转《原始真解神引篇》，解析世间阵法本质`,
        `神引篇·阵纹拆解 → ${formationsDesc}`,
        `原始符文分解阵法本源，显化最古朴的阵道轨迹`,
        `神引篇·阵基重铸`,
        `以至尊符文为阵眼，骨骼为阵台，血脉为阵源`,
        `原始阵纹·列阵初开`,
        `胸腹间浮现混沌阵图，吞吐日月精华`,
        `一念起，杀伐困守诸阵自生！`,
        `列阵境——成！`,
    ].join("\n"));
    
    await Write_player(usr_qq, player);
     let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
}
// 列阵极境突破（需要万灵图）
async breakthroughExtremeLiezhenRealm(e, usr_qq, player) {
    const baseEnergyNeed = this.calculateBaseNeedExp(player);
    const actualEnergyNeed = this.calculateActualCost(baseEnergyNeed);

    // 前置检查
    if (player.xiangulevel_id !== 6) return e.reply("需先突破至列阵境");
    if (player.极境.includes("6")) return e.reply("已臻至列阵极境");

    // 核心检查：必须拥有万灵图
    const wanlingtuQty = await exist_najie_thing(usr_qq, "万灵图", "道具");
    if (wanlingtuQty < 1) {
        return e.reply([
            `【神物缺失·极境无门】`,
            `列阵极境需参透万灵图，演化诸天阵法`,
            `万灵图：需1份，现有${wanlingtuQty}份`,
        ].join("\n"));
    }


    // 能量检查
    if (player.血气 < actualEnergyNeed || player.修为 < actualEnergyNeed) {
        return e.reply(`需储备${bigNumberTransform(actualEnergyNeed)}点血气/修为演化诸天阵法`);
    }

    // 消耗资源突破
    await Add_血气(usr_qq, -actualEnergyNeed);
    await Add_修为(usr_qq, -actualEnergyNeed);

    
    player.极境.push("6");
    
    // 属性加成（侧重阵法与领域）
    player.攻击加成 += 2950000;
    player.防御加成 += 2950000;
    player.生命加成 += 2950000;
    player.阵法掌握 = "诸天阵道"; // 特殊属性


    // 突破文案（万灵图演化诸天阵法）
    e.reply([
        `【万灵衍阵·诸天臣服】`,
        `你展开万灵图，图中万灵演化诸天阵法奥秘`,
        `万灵图·阵法推演`,
        `图中飞禽走兽、山川河流皆化阵纹`,
        `万灵图·阵道本源`,
        `悟透阵法本质，天地万物皆可为阵`,
        `万灵图·极境成就`,
        `体内万千阵法融合归一，化作诸天阵道`,
        `周身自成阵法世界，一念成阵，万物为棋`,
        `列阵极境——成！`,
    ].join("\n"));
    await Write_player(usr_qq, player);
     let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
}
async breakthroughZunzheRealm(e, usr_qq, player) {
    // 能量需求（列阵境的15倍）
    const baseEnergyNeed = this.calculateBaseNeedExp(player);
    const actualEnergyNeed = this.calculateActualCost(baseEnergyNeed) * 15;

    // 检查前置境界（必须完成列阵极境）
    if (!player.极境.includes("6")) {
        return e.reply([
            `【阵基未固·尊者难成】`,
            `尊者境需先达列阵极境，演化诸天阵法为基`,
            `极境状态：${player.极境.includes("6") ? '✓' : '✗'}`,
            `未达极境者，无法承载尊者威能！`
        ].join("\n"));
    }

    // 检查功法（必须学习药神秘典）
    if (!player.学习的功法.includes("药神秘典")) {
        return e.reply([
            `【丹道未通·涅槃无门】`,
            `炼制小涅槃丹需精通药神秘典`,
            `当前掌握：${player.学习的功法.includes("药神秘典") ? "已掌握" : "未掌握"}`,
            `需先寻得药神秘典并参悟`
        ].join("\n"));
    }

    // 检查炼丹材料
    const requiredMaterials = [
        { name: "白玉骨鼎", class: "道具", quantity: 1 },
        { name: "地脉灵焰", class: "道具", quantity: 1 },
        { name: "黄泉竹", class: "草药", quantity: 1 },
        { name: "龟叶兰", class: "草药", quantity: 1 },
        { name: "血凰藤", class: "草药", quantity: 1 },
        { name: "黄金草", class: "草药", quantity: 1 },
        { name: "紫星兰", class: "草药", quantity: 1 }
    ];

    // 检查材料是否足够
    const missingMaterials = [];
    for (const material of requiredMaterials) {
        const currentQty = await exist_najie_thing(usr_qq, material.name, material.class);
        if (currentQty < material.quantity) {
            missingMaterials.push({
                name: material.name,
                required: material.quantity,
                current: currentQty
            });
        }
    }

    if (missingMaterials.length > 0) {
        const materialList = missingMaterials.map(m => 
            `${m.name}：需${m.required}，现有${m.current}`
        ).join("\n");
        
        return e.reply([
            `【材料不足·丹难成】`,
            `炼制小涅槃丹需以下材料：`,
            materialList
        ].join("\n"));
    }

    // 检查能量是否足够
    if (player.血气 < actualEnergyNeed || player.修为 < actualEnergyNeed) {
        const missingBlood = Math.max(0, actualEnergyNeed - player.血气);
        const missingCultivation = Math.max(0, actualEnergyNeed - player.修为);
        return e.reply([
            `【灵力不足·丹火难继】`,
            `炼制小涅槃丹需磅礴灵力支撑：`,
            `尚缺血气：${bigNumberTransform(missingBlood)}`,
            `缺修为：${bigNumberTransform(missingCultivation)}`
        ].join("\n"));
    }

    // 消耗材料和能量
    await Add_血气(usr_qq, -actualEnergyNeed);
    await Add_修为(usr_qq, -actualEnergyNeed);
    
    for (const material of requiredMaterials) {
        await Add_najie_thing(usr_qq, material.name, material.class, -material.quantity);
    }

    // 突破过程（炼制小涅槃丹）
    let danChengRate = Math.random(); // 炼丹成功率随机因素
   if (player.occupation == '炼丹师') {
       let  加成 =  player.occupation_level*0.01;
        danChengRate +=  player.occupation_level*0.01;

      e.reply(`你以${player.occupation_level}级炼丹师之能，引动丹道法则，成丹率提升${加成*100}%`);
    }
    if (danChengRate < 0.75) {
        // 10%几率炼丹失败
        return e.reply([
            `【丹炉炸裂·功亏一篑】`,
            `你引动地脉灵焰，投入诸般神材`,
            `黄泉竹化幽冥气，血凰藤燃涅槃火`,
            `忽闻轰隆巨响，丹炉剧烈震动`,
            `药力冲突难以调和，炉鼎炸裂！`,
            `所有材料尽毁，需重新收集`,
            `当前成功率${danChengRate}`,
            `（炼丹失败，请提升炼丹师等级后重新尝试）`
        ].join("\n"));
    }

    // 炼丹成功，突破到尊者境
    player.xiangulevel_id = 7; // 进入尊者境
    await Write_player(usr_qq, player);
 let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
    // 突破成功文案
    e.reply([
        `【丹成九转·尊者临世】`,
        `你盘坐虚空，引动地脉灵焰化鼎炉`,
        `按药神秘典之法，投入黄泉竹、龟叶兰诸般神材`,
        `黄泉竹化幽冥气，血凰藤燃涅槃火，黄金草镇五行，紫星兰调阴阳`,
        `九转炼丹·涅槃重生`,
        `丹炉中霞光万道，瑞彩千条，异香弥漫三千里`,
        `一枚小涅槃丹终于成型，散发不朽神辉`,
        `服丹突破·尊者威压`,
        `丹药入腹，化作滚滚洪流冲刷四肢百骸`,
        `周身道则轰鸣，诸天阵法自行运转`,
        `一股尊者威压自然散发，震慑八荒`,
        `尊者境——成！`,
    ].join("\n"));
}
// 在breakthroughExtremeLiezhenRealm方法后添加尊者极境突破方法
async breakthroughExtremeZunzheRealm(e, usr_qq, player) {
    // 能量需求（普通尊者境的30倍）
    const baseEnergyNeed = this.calculateBaseNeedExp(player);
    const actualEnergyNeed = this.calculateActualCost(baseEnergyNeed) * 30;

    // 前置检查
    if (player.xiangulevel_id !== 7) return e.reply("需先突破至尊者境");
    if (player.极境.includes("7")) return e.reply("已臻至尊者极境");

    // 核心检查1：必须学习五行涅槃法
    if (!player.学习的功法.includes("五行涅槃法")) {
        return e.reply([
            `【涅槃未成·极境无门】`,
            `尊者极境需以五行涅槃法重塑根基，补全缺陷`,
            `当前掌握：${player.学习的功法.includes("五行涅槃法") ? "已掌握" : "未掌握"}`,
            `需先寻得五行涅槃法并参悟，方可重修境界`
        ].join("\n"));
    }

    // 核心检查2：位面必须是九天十地（power_place等于2.5）
    if (player.power_place !== 2.5) {
        return e.reply([
            `【天地有缺·大道不全】`,
            `当前位面：${this.getPlaceName(player.power_place)}`,
            `天地法则残缺，无法承载境界重修之路`,
            `唯有九天十地方可成就尊者极境`,
            `请先前往九天十地再尝试突破`
        ].join("\n"));
    }

    // 检查渡劫资源
    const thunderResources = [
        { name: "雷劫液", class: "道具", quantity: 3 },
        { name: "血魂草", class: "草药", quantity: 1 },
        { name: "五行本源", class: "道具", quantity: 5 }
    ];

    const missingResources = [];
    for (const resource of thunderResources) {
        const currentQty = await exist_najie_thing(usr_qq, resource.name, resource.class);
        if (currentQty < resource.quantity) {
            missingResources.push({
                name: resource.name,
                required: resource.quantity,
                current: currentQty
            });
        }
    }

    if (missingResources.length > 0) {
        const resourceList = missingResources.map(r => 
            `${r.name}：需${r.required}，现有${r.current}`
        ).join("\n");
        
        return e.reply([
            `【资源不足·雷劫难渡】`,
            `渡最强雷劫需以下资源：`,
            resourceList,
            `（雷劫液可减轻雷劫伤害，血魂草激发潜能，五行本源稳固根基）`
        ].join("\n"));
    }

    // 检查能量是否足够
    if (player.血气 < actualEnergyNeed || player.修为 < actualEnergyNeed) {
        const missingBlood = Math.max(0, actualEnergyNeed - player.血气);
        const missingCultivation = Math.max(0, actualEnergyNeed - player.修为);
        return e.reply([
            `【本源不足·涅槃难继】`,
            `五行涅槃需海量本源支撑：`,
            `尚缺血气：${bigNumberTransform(missingBlood)}`,
            `缺修为：${bigNumberTransform(missingCultivation)}`
        ].join("\n"));
    }

    // 开始渡劫过程
    e.reply([
        `【五行涅槃·雷劫降临】`,
        `你运转五行涅槃法，引动五行本源重塑道基`,
        `金木水火土五行轮回，补全昔日缺陷`,
        `轰！！！九天雷劫感应而至，万里黑云压境`,
        `九重灭世神雷降临，显化真龙、仙凰、雷帝虚影`,
        `第一重雷劫：五行雷罚`
    ].join("\n"));

    // 模拟雷劫伤害（分阶段）
    const thunderStages = [
        { name: "五行雷罚", damage: 0.3, desc: "五行神雷轰击，肉身几近崩解" },
        { name: "仙道虚影", damage: 0.4, desc: "真龙、仙凰、雷帝虚影联手攻伐" },
        { name: "心魔劫", damage: 0.2, desc: "内心魔障显现，道心震颤" },
        { name: "终极雷海", damage: 0.5, desc: "雷海淹没天地，万物俱灭" }
    ];

    let survive = true;
    let thunderPower = 0;

    for (const stage of thunderStages) {
        // 消耗雷劫液减轻伤害
        const thunderLiquidQty = await exist_najie_thing(usr_qq, "雷劫液", "道具");
        const damageReduction = Math.min(0.5, thunderLiquidQty * 0.1); // 每滴雷劫液减少10%伤害，最多50%
        
        const actualDamage = stage.damage * (1 - damageReduction);
        const damageAmount = Math.floor(player.血量上限 * actualDamage);
        
        // 应用伤害
        const currentHP = await Add_HP(usr_qq, -damageAmount, `${stage.name}伤害`);
        
        // 消耗雷劫液
        if (thunderLiquidQty > 0) {
            const usedLiquid = Math.min(thunderLiquidQty, 5); // 最多使用5滴
            await Add_najie_thing(usr_qq, "雷劫液", "道具", -usedLiquid);
        }

        // 血魂草激发潜能（只在生命低于30%时触发）
        if (currentHP / player.血量上限 < 0.3) {
            const bloodGrassQty = await exist_najie_thing(usr_qq, "血魂草", "草药");
            if (bloodGrassQty > 0) {
                await Add_najie_thing(usr_qq, "血魂草", "草药", -1);
                const recoverAmount = Math.floor(player.血量上限 * 0.4);
                await Add_HP(usr_qq, recoverAmount, "血魂草激发潜能");
                e.reply(`血魂草激发潜能，恢复${bigNumberTransform(recoverAmount)}点生命值`);
            }
        }

        thunderPower += actualDamage;
        
        e.reply([
            `${stage.desc}`,
            `造成${bigNumberTransform(damageAmount)}点伤害`,
            currentHP <= 0 ? "生命垂危！" : `当前生命：${bigNumberTransform(currentHP)}/${bigNumberTransform(player.血量上限)}`
        ].join("\n"));

        // 检查是否死亡
        if (currentHP <= 0) {
            survive = false;
            break;
        }

        // 阶段之间间隔
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 渡劫结果处理
    if (!survive) {
        // 渡劫失败，重伤并损失资源
        await Add_HP(usr_qq, -player.血量上限, "雷劫失败重伤");
        
        // 随机损失一种功法境界
        if (player.学习的功法.length > 0) {
            const lostSkill = player.学习的功法[Math.floor(Math.random() * player.学习的功法.length)];
            player.学习的功法 = player.学习的功法.filter(skill => skill !== lostSkill);
            
            e.reply([
                `【渡劫失败·道基受损】`,
                `你在雷劫中重伤垂死，侥幸保得性命`,
                `但道基受损，失去了对《${lostSkill}》的领悟`,
                `所有渡劫资源已消耗，需重新准备后再尝试`
            ].join("\n"));
        }
        
        await Write_player(usr_qq, player);
        return;
    }

    // 渡劫成功，消耗资源
    await Add_血气(usr_qq, -actualEnergyNeed);
    await Add_修为(usr_qq, -actualEnergyNeed);
    
    for (const resource of thunderResources) {
        await Add_najie_thing(usr_qq, resource.name, resource.class, -resource.quantity);
    }

    // 突破成功，获得极境加成
    player.极境.push("7");
    
    // 五行涅槃法带来的全面加成
    player.攻击加成 += 5000000;
    player.防御加成 += 4500000;
    player.生命加成 += 6000000;
    player.五行抗性 = "圆满"; // 获得五行抗性
    player.法力免疫 = "初级"; // 获得短暂法力免疫能力

    // 随机获得一种五行神通
    const fiveElementsPowers = [
        "庚金剑气", "乙木回春", "玄水真罡", "离火神焰", "戊土圣盾"
    ];
    const acquiredPower = fiveElementsPowers[Math.floor(Math.random() * fiveElementsPowers.length)];
    player.五行神通 = acquiredPower;

    await Write_player(usr_qq, player);

    // 突破成功文案
    e.reply([
        `【极境成就·万古唯一】`,
        `你熬过九重雷劫，五行涅槃法圆满功成`,
        `肉身无瑕，道基完美，远超古人定义的极境`,
        `血液中符文自生，每一滴血都孕育神曦`,
        `获得尊者极境属性：`,
        `攻击+${bigNumberTransform(5000000)}`,
        `防御+${bigNumberTransform(4500000)}`,
        `生命+${bigNumberTransform(6000000)}`,
        `五行抗性：圆满（免疫50%五行伤害）`,
        `法力免疫：初级（短暂无视同阶法术）`,
        `五行神通：${acquiredPower}`,
        `尊者极境——打破极限，成就万古最强尊者！`
    ].join("\n"));
}
getPlaceName(power_place) {
    const placeMap = {
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
    return placeMap[power_place] || `未知位面(${power_place})`;
}
  // ========== 辅助工具函数 ==========
  async hasAtLeastOneBloodType(usr_qq, bloodTypes) {
    for (const bloodType of bloodTypes) {
      if (await exist_najie_thing(usr_qq, bloodType, "道具")) {
        return true;
      }
    }
    return false;
  }

  async hasAtLeastThreeBloodTypes(usr_qq) {
    const beastBloodTypes = ["朱雀真血", "狻猊真血", "饕餮真血", "雷帝真血", "朱厌真血", "螭龙真血"];
    let count = 0;
    for (const bloodType of beastBloodTypes) {
      if (await exist_najie_thing(usr_qq, bloodType, "道具")) {
        count++;
        if (count >= 3) return true;
      }
    }
    return false;
  }

  async consumeOneBloodType(usr_qq, bloodTypes) {
    for (const bloodType of bloodTypes) {
      if (await exist_najie_thing(usr_qq, bloodType, "道具")) {
        await Add_najie_thing(usr_qq, bloodType, "道具", -1);
        return bloodType;
      }
    }
    return null;
  }

  async getConsumedBloodType(usr_qq, bloodTypes) {
    for (const bloodType of bloodTypes) {
      if (!await exist_najie_thing(usr_qq, bloodType, "道具")) {
        return bloodType;
      }
    }
    return bloodTypes[0];
  }

  calculateBaseNeedExp(player) {
    // 根据玩家当前等级计算基础需求
    return 500000 * Math.pow(2, player.xiangulevel_id - 1);
  }

  calculateActualCost(baseCost) {
    // 考虑各种修正因素后的实际消耗
    return baseCost;
  }

  hasRequiredGongfa(player, realm) {
    if (realm === "搬血") {
      const bloodRealmBaoshu = [
        "青鳞鹰宝术", "狻猊宝术", "朱雀宝术",
        "饕餮宝术", "穷奇宝术", "朱厌宝术"
      ];
      
      const fullAncientScriptures = [
        "原始真解", "鲲鹏宝术", "真凰宝术", "雷帝宝术",
        "草字剑诀", "六道轮回天功", "柳神法"
      ];

      for (const gongfa of player.学习的功法 || []) {
        if (bloodRealmBaoshu.includes(gongfa) || fullAncientScriptures.includes(gongfa)) {
          return true;
        }
      }
      return false;
    }
    return true;
  }

  getRequiredGongfaName(player, realm) {
    if (realm === "搬血") {
      const fullAncientScriptures = [
        "原始真解", "鲲鹏宝术", "真凰宝术", "雷帝宝术"
      ];
      
      for (const gongfa of player.学习的功法 || []) {
        if (fullAncientScriptures.includes(gongfa)) {
          return gongfa;
        }
      }

      const bloodRealmBaoshu = [
        "青鳞鹰宝术", "狻猊宝术", "朱雀宝术"
      ];
      
      for (const gongfa of player.学习的功法 || []) {
        if (bloodRealmBaoshu.includes(gongfa)) {
          return gongfa;
        }
      }
      
      return "青鳞鹰宝术";
    }
    return "未知功法";
  }
}