import fs from 'fs';
import { plugin, verc, data, config } from '../../api/api.js';
import {
  Add_灵石,
  Add_源石,
  Add_修为,
  Add_血气,
  ForwardMsg,
  Add_HP,
  Read_player,
  Add_najie_thing,
  Write_player,
  bigNumberTransform,
  Harm,
  zd_battle,
} from '../../model/xiuxian.js';

let WorldBOSSBattleCD = []; //CD
let WorldBOSSBattleLock = 0; //BOSS战斗锁，防止打架频率过高造成奖励多发
let WorldBOSSBattleUnLockTimer = 0; //防止战斗锁因意外锁死

export class BOSS4 extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_修仙_BOSS4',
      dsc: '天骄讨伐模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#开启天骄$',
          fnc: 'CreateWorldBoss2',
        },
        {
          reg: '^#关闭天骄$',
          fnc: 'DeleteWorldBoss2',
        },
        {
          reg: '^#天骄状态(?:\\s+(.*))?$',
          fnc: 'LookUpWorldBossStatus2',
        },
        {
          reg: '^#天骄贡献榜(?:\\s+(.*))?$',
          fnc: 'ShowDamageList2',
        },
        {
          reg: '^#讨伐天骄\\s+(.*)$',
          fnc: 'WorldBossBattle2',
        },
        {
          reg: '^#天骄列表$',
          fnc: 'ShowTianjiaoList',
        },
      ],
    });

    this.userCooldownMs = 30 * 60 * 1000; // 30分钟个人冷却
    this.tianjiaoRefreshMs = 18 * 60 * 60 * 1000; // 18小时天骄刷新时间

    // 地点映射表
    this.LOCATION_MAP = {
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
  }

  // 显示天骄列表
  async ShowTianjiaoList(e) {
    if (!verc({ e })) return false;

    let msg = ['****位面天骄列表****'];
    for (const tianjiao of data.weimiantianjiao_list) {
      msg.push(`名号: ${tianjiao.名号}`);
      msg.push(`境界: ${tianjiao.境界}`);
      msg.push(`位面: ${this.getLocationName(tianjiao.位面)}`);
      msg.push('-------------------');
    }

    await ForwardMsg(e, msg);
    return false;
  }

  // 获取位面名称
  getLocationName(locationId) {
    for (const [name, id] of Object.entries(this.LOCATION_MAP)) {
      if (id === locationId) return name;
    }
    return `未知位面(${locationId})`;
  }

  // 开启天骄
  async CreateWorldBoss2(e) {
    if (!e || e.isMaster) {
      await InitWorldBoss(e);
      return false;
    }
  }

  // 关闭天骄
  async DeleteWorldBoss2(e) {
    if (!verc({ e })) return false;
    if (e.isMaster) {
      if (await BossIsAlive()) {
        await redis.del('Xiuxian:WorldBossStatus2');
        await redis.del('zhutianxiuxian1.0Record2');

        // 删除所有天骄的复活CD和贡献榜
        for (const tianjiao of data.weimiantianjiao_list) {
          await redis.del(`tianjiao:global:revive:${tianjiao.名号}`);
          await redis.del(`tianjiao:damage:${tianjiao.名号}`);
        }

        e.reply('天骄挑战关闭！');
      } else e.reply('天骄未开启');
    } else return false;
  }

  // 天骄状态
  async LookUpWorldBossStatus2(e) {
    if (!verc({ e })) return false;

    // 获取天骄名称
    const match = e.msg.match(/^#天骄状态(?:\s+(.*))?$/);
    const tianjiaoName = match[1] ? match[1].trim() : '';

    if (!tianjiaoName) {
      // 如果没有指定天骄名称，显示所有天骄状态
      let allStatus = ['****所有天骄状态****'];

      for (const tianjiao of data.weimiantianjiao_list) {
        const statusKey = `tianjiao:status:${tianjiao.名号}`;
        let status = await redis.get(statusKey);
        status = JSON.parse(status || '{}');

        // 检查全局复活CD
        const globalReviveKey = `tianjiao:global:revive:${tianjiao.名号}`;
        const globalReviveTime = await redis.get(globalReviveKey);

        // 初始化天骄状态
        if (!status.currentHP || status.currentHP <= 0) {
          status.currentHP = 100;
          status.isAlive = true;
          await redis.set(statusKey, JSON.stringify(status));
        }

        // 如果有全局复活CD，优先使用
        if (globalReviveTime && Date.now() < parseInt(globalReviveTime)) {
          const remainingMs = parseInt(globalReviveTime) - Date.now();
          const hours = Math.floor(remainingMs / (60 * 60 * 1000));
          const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

          allStatus.push(
            `名号: ${tianjiao.名号}`,
            `境界: ${tianjiao.境界}`,
            `位面: ${this.getLocationName(tianjiao.位面)}`,
            `状态: 已击败，${hours}小时${minutes}分钟后刷新`,
            '-------------------'
          );
        } else {
          allStatus.push(
            `名号: ${tianjiao.名号}`,
            `境界: ${tianjiao.境界}`,
            `位面: ${this.getLocationName(tianjiao.位面)}`,
            `血量: ${status.currentHP}%`,
            `状态: ${status.isAlive ? '存活' : '已击败'}`,
            '-------------------'
          );
        }
      }

      e.reply(allStatus.join('\n'));
      return false;
    }

    // 检查天骄是否存在
    const tianjiaoData = data.weimiantianjiao_list.find(tj => tj.名号 === tianjiaoName);
    if (!tianjiaoData) {
      e.reply(`未找到名为「${tianjiaoName}」的天骄`);
      return false;
    }

    // 检查全局复活CD
    const globalReviveKey = `tianjiao:global:revive:${tianjiaoName}`;
    const globalReviveTime = await redis.get(globalReviveKey);

    if (globalReviveTime && Date.now() < parseInt(globalReviveTime)) {
      const remainingMs = parseInt(globalReviveTime) - Date.now();
      const hours = Math.floor(remainingMs / (60 * 60 * 1000));
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      e.reply(`${tianjiaoName}已被击败，将在${hours}小时${minutes}分钟后刷新`);
      return false;
    }

    // 获取天骄状态
    const statusKey = `tianjiao:status:${tianjiaoName}`;
    let status = await redis.get(statusKey);
    status = JSON.parse(status || '{}');

    // 初始化天骄状态
    if (!status.currentHP || status.currentHP <= 0) {
      status.currentHP = 100; // 百分比血量，初始100%
      status.isAlive = true;
      await redis.set(statusKey, JSON.stringify(status));
    }

    // 正常状态
    let ReplyMsg = [
      `----${tianjiaoName}状态----`,
      `境界: ${tianjiaoData.境界}`,
      `位面: ${this.getLocationName(tianjiaoData.位面)}`,
      `当前血量: ${status.currentHP}%`,
      `状态: ${status.isAlive ? '存活' : '已击败'}`
    ];

    e.reply(ReplyMsg.join('\n'));
    return false;
  }

  // 更新贡献值 - 支持大数字
  async updateDamageContribution(damageKey, usr_qq, damageDealt) {
    try {
      // 获取当前值（字符串形式）
      let currentDamage = await redis.hGet(damageKey, usr_qq);

      // 如果不存在或不是有效数字，设为0
      if (!currentDamage || isNaN(BigInt(currentDamage))) {
        currentDamage = '0';
      }

      // 使用BigInt进行计算
      const currentBig = BigInt(currentDamage);
      const incrementBig = BigInt(damageDealt);
      const newValue = (currentBig + incrementBig).toString();

      // 存储为字符串
      await redis.hSet(damageKey, usr_qq, newValue);

      return true;
    } catch (error) {
      console.error('更新贡献值失败:', error);
      // 保底方案：直接设置新值
      await redis.hSet(damageKey, usr_qq, damageDealt.toString());
      return false;
    }
  }

  // 读取贡献榜 - 支持大数字
  async getDamageRankings(damageKey) {
    const damageData = await redis.hGetAll(damageKey);
    const contributors = [];

    for (const [qq, damageStr] of Object.entries(damageData)) {
      try {
        const damageBig = BigInt(damageStr);
        contributors.push({
          qq,
          damage: damageBig,
          damageStr: damageStr // 保留原始字符串用于显示
        });
      } catch (error) {
        // 处理无效数据
        console.warn(`无效的贡献值: QQ=${qq}, damage=${damageStr}`);
        // 重置为0
        await redis.hSet(damageKey, qq, '0');
      }
    }

    // 排序（BigInt可以直接比较）
    contributors.sort((a, b) => {
      if (a.damage > b.damage) return -1;
      if (a.damage < b.damage) return 1;
      return 0;
    });

    return contributors;
  }

  // 支持BigInt的大数字转换函数
  bigNumberTransformBigInt(value) {
    try {
      // 转换为BigInt
      const num = typeof value === 'bigint' ? value : BigInt(value.toString());

      // 如果小于1万，直接返回字符串
      if (num < 10000n) {
        return num.toString();
      }

      // 中文数字单位（可扩展到恒河沙级别）
      const units = [
        '', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟',
        '涧', '正', '载', '极', '恒河沙', '阿僧祇', '那由他',
        '不可思议', '无量', '大数'
      ];

      let result = num;
      let unitIndex = 0;

      while (result >= 10000n && unitIndex < units.length - 1) {
        result = result / 10000n;
        unitIndex++;
      }

      // 计算小数部分
      const divisor = 10000n ** BigInt(unitIndex);
      const remainder = num % divisor;

      if (remainder === 0n) {
        return result.toString() + units[unitIndex];
      } else {
        // 计算2位小数
        const decimalValue = (remainder * 100n) / divisor;
        const decimalStr = decimalValue.toString().padStart(2, '0');

        // 去掉末尾的0
        let formattedDecimal = decimalStr;
        while (formattedDecimal.length > 0 && formattedDecimal.endsWith('0')) {
          formattedDecimal = formattedDecimal.slice(0, -1);
        }

        if (formattedDecimal.length === 0) {
          return result.toString() + units[unitIndex];
        } else {
          return `${result.toString()}.${formattedDecimal}${units[unitIndex]}`;
        }
      }
    } catch (error) {
      console.error('大数字转换错误:', error, value);
      return typeof value === 'string' ? value : value.toString();
    }
  }

  async WorldBossBattle2(e) {
    if (!verc({ e })) return false;
    if (e.isPrivate) return false;

    // 获取天骄名称
    const match = e.msg.match(/^#讨伐天骄\s+(.*)$/);
    if (!match || !match[1]) {
      e.reply('请指定要讨伐的天骄名称，例如: #讨伐天骄 猪咪岁岁');
      return false;
    }

    const tianjiaoName = match[1].trim();
    const usr_qq = e.user_id.toString();
    // 获取玩家数据
    const player = await Read_player(usr_qq);
    // 检查天骄是否存在
    const tianjiaoData = data.weimiantianjiao_list.find(tj => tj.名号 === tianjiaoName);
    if (!tianjiaoData) {
      e.reply(`未找到名为「${tianjiaoName}」的天骄`);
      return false;
    }

    // 检查全局复活CD
    const globalReviveKey = `tianjiao:global:revive:${tianjiaoName}`;
    const globalReviveTime = await redis.get(globalReviveKey);

    if (globalReviveTime && Date.now() < parseInt(globalReviveTime)) {
      const remainingMs = parseInt(globalReviveTime) - Date.now();
      const hours = Math.floor(remainingMs / (60 * 60 * 1000));
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      e.reply(`${tianjiaoName}已被击败，将在${hours}小时${minutes}分钟后刷新`);
      return false;
    }

    // 检查CD时间（30分钟） - 使用全局CD
    const now_Time = new Date().getTime();
    const last_time = await redis.get(`xiuxian:player:${usr_qq}:BOSSCD`);
    const userCooldownMs = this.userCooldownMs; // 30分钟

    if (player.id != "2283096140" && last_time && now_Time < parseInt(last_time) + userCooldownMs) {
      const remainingMs = parseInt(last_time) + userCooldownMs - now_Time;
      const minutes = Math.floor(remainingMs / (60 * 1000));
      const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
      e.reply(`讨伐天骄冷却中，剩余时间: ${minutes}分${seconds}秒`);
      return false;
    }

    // 创建A_player变量表示玩家角色
    const A_player = {
      ...player, // 复制玩家所有属性
      名号: player.名号,
      攻击: player.攻击,
      防御: player.防御,
      当前血量: player.当前血量,
      血量上限: player.血量上限,
      暴击率: player.暴击率,
      暴击伤害: player.暴击伤害,
      灵根: player.灵根,
      法球倍率: player.灵根?.法球倍率 || 1,
      学习的功法: player.学习的功法 || [],
    };

    // 检查玩家状态
    if (A_player.level_id < 32) {
      e.reply('你的练气境界至少达到法身境才能讨伐天骄');
      return false;
    }

    // 检查玩家位面（必须与天骄相同）
    if (A_player.power_place !== tianjiaoData.位面) {
      e.reply(`你当前不在「${this.getLocationName(tianjiaoData.位面)}」，无法挑战${tianjiaoName}`);
      return false;
    }

    // 检查玩家状态
    if (A_player.当前血量 <= A_player.血量上限 * 0.1) {
      e.reply('还是先疗伤吧，别急着参战了');
      return false;
    }

    // 获取天骄状态
    const statusKey = `tianjiao:status:${tianjiaoName}`;
    let status = await redis.get(statusKey);
    status = JSON.parse(status || '{}');

    // 初始化天骄状态
    if (!status.currentHP || status.currentHP <= 0) {
      status.currentHP = 100; // 百分比血量，初始100%
      status.isAlive = true;
    }

    // 根据玩家境界调整天骄属性
    let attributeMultiplier = 10;
    if (tianjiaoData.名号 === "猪咪岁岁") {
      // 猪咪岁岁天骄的规则
      if (A_player.level_id > 41) {
        return e.reply(`成仙者不得以大欺小，请让后辈弟子来讨伐！`);
      } else {
        attributeMultiplier = 5;
        e.reply(`${tianjiaoName}:雪豹闭嘴！`);
      }
    } else {
      // 其他天骄的规则
      if (A_player.mijinglevel_id >= 12 || A_player.xiangulevel_id >= 10) {
        attributeMultiplier = 5;
        e.reply(`检测到玩家已成就圣人/天神境，${tianjiaoName}将不再压制境界，以全部实力应战！`);
      } else if (A_player.mijinglevel_id < 9 && A_player.xiangulevel_id < 7) {
        player.道伤 += 1;
        player.当前血量 = 0;
        await Write_player(usr_qq, player);
        e.reply(`你连仙台境/尊者境都未达到，${tianjiaoName}根本不想浪费时间在你这只蝼蚁身上，直接将你一巴掌拍死！(道伤+1)`);
        return; // 直接返回，不再继续战斗
      } else {
        attributeMultiplier = 3;
        e.reply(`${tianjiaoName}压制境界与你一战！`);
      }
    }

    // 基于玩家属性生成天骄战斗属性
    const B_player = {
      名号: `${tianjiaoName}${attributeMultiplier > 1 ? '(全力状态)' : '(压制境界)'}`,
      攻击: parseInt(A_player.攻击 * attributeMultiplier),
      防御: parseInt(A_player.防御 * attributeMultiplier),
      当前血量: parseInt(A_player.血量上限 * attributeMultiplier),
      血量上限: parseInt(A_player.血量上限 * attributeMultiplier),
      暴击率: tianjiaoData.暴击率, // 使用天骄自身的暴击率
      暴击伤害: tianjiaoData.暴击伤害, // 使用天骄自身的暴击伤害
      灵根: tianjiaoData.灵根?.name || "普通灵根", // 使用天骄自身的灵根
      法球倍率: tianjiaoData.灵根?.法球倍率 || 1, // 使用天骄自身的法球倍率
      学习的功法: tianjiaoData.学习的功法 || [], // 使用天骄自身的功法
    };

    // 进行战斗
    const result = await zd_battle(A_player, B_player);
    let msg = result.msg;
      if (msg.length <= 30) await ForwardMsg(e, msg);
      else {
        let msgg = JSON.parse(JSON.stringify(msg));
        msgg.length = 30;
        await ForwardMsg(e, msgg);
        e.reply('战斗过长，仅展示部分内容');
      }

    // 判断战斗结果 - 使用明确的胜利标志
    const playerWinStr = `${A_player.名号}击败了${B_player.名号}`;
    const tianjiaoWinStr = `${B_player.名号}击败了${A_player.名号}`;

    // 更新贡献值
    const damageKey = `tianjiao:damage:${tianjiaoName}`;
    let isWin = false;
    if (msg.find(item => item === playerWinStr)) {
      const damageDealt = Math.floor(A_player.血量上限 * attributeMultiplier);
      await this.updateDamageContribution(damageKey, usr_qq, damageDealt);
      isWin = true;
    } else if (msg.find(item => item === tianjiaoWinStr)) {
      const damageDealt = Math.floor(A_player.血量上限 * attributeMultiplier * 0.1);
      await this.updateDamageContribution(damageKey, usr_qq, damageDealt);
      isWin = false;
    } else {
      e.reply(`战斗过程出错，无法判断胜负`);
      return;
    }

    // 更新天骄状态
    if (isWin) {
      // 胜利扣除20%血量
      status.currentHP = Math.max(0, status.currentHP - 20);
      e.reply(`恭喜你战胜${tianjiaoName}！天骄血量减少20%，当前剩余${status.currentHP}%`);
    } else {
      // 失败扣除1%血量
      status.currentHP = Math.max(0, status.currentHP - 1);
      e.reply(`你未能战胜${tianjiaoName}，天骄血量减少1%，当前剩余${status.currentHP}%`);
    }

    // 计算奖励
    let reward = isWin ? 10000 : 10;
    let zuizhong = (A_player.mijinglevel_id + A_player.xiangulevel_id) * A_player.level_id * A_player.Physique_id * reward;

    // 发放奖励
    if (isWin) {
      // 胜利奖励
      await Add_灵石(usr_qq, 15000000); // 1000万灵石
      await Add_源石(usr_qq, 5000000); // 500万灵石
      await Add_修为(usr_qq, zuizhong);
      await Add_血气(usr_qq, zuizhong);

      let rewardMsg = [
        `成功战胜${tianjiaoName}！获得奖励：`,
        `灵石：1500万`,
        `源石：500万`,
        `修为：${bigNumberTransform(zuizhong)}`,
        `血气：${bigNumberTransform(zuizhong)}`
      ];

      // 斗字秘学习功法功能
      if (player.学习的功法.includes("斗字秘") && Math.random() < 0.01) {
        // 确保玩家功法列表存在
        player.学习的功法 = player.学习的功法 || [];

        // 获取玩家当前已学习的功法
        const playerLearnedSkills = player.学习的功法;

        // 获取天骄可学习的功法（排除玩家已学习的）
        const learnableSkills = tianjiaoData.学习的功法.filter(skill =>
          !playerLearnedSkills.includes(skill)
        );

        if (learnableSkills.length > 0) {
          // 随机选择一个功法
          const randomIndex = Math.floor(Math.random() * learnableSkills.length);
          const newSkill = learnableSkills[randomIndex];

          // 添加新功法
          player.学习的功法.push(newSkill);
          await Write_player(usr_qq, player);

          // 根据功法类型生成不同的遮天风格文案
          let skillDescription = "";

          if (newSkill.includes("拳") || newSkill.includes("掌")) {
            skillDescription = `拳掌交锋间，斗字秘运转到极致，演化出${newSkill}的无上奥义！`;
          } else if (newSkill.includes("剑") || newSkill.includes("刀")) {
            skillDescription = `兵器碰撞的刹那，斗字秘捕捉到${newSkill}的剑意道痕，将其烙印在识海！`;
          } else if (newSkill.includes("秘") || newSkill.includes("诀")) {
            skillDescription = `斗字秘推演万法，在生死搏杀中洞悉${newSkill}的运转轨迹！`;
          } else if (newSkill.includes("经") || newSkill.includes("法")) {
            skillDescription = `古经轰鸣，道音阵阵，斗字秘逆推${newSkill}的完整传承！`;
          } else {
            skillDescription = `斗战圣法演化到极致，在战斗中领悟${newSkill}的真谛！`;
          }

          // 完整的遮天风格文案
          const douziMiMsg = [
            "【斗字秘】触发",
            "九秘之【斗字秘】运转，斗战圣法演化诸天万法！",
            "",
            skillDescription,
            "",
            `领悟功法：${newSkill}`,
            "【斗字秘】不愧为战斗第一圣法，可演化一切攻伐之术！",
            "在生死搏杀中，你的战斗经验与道行同步精进！"
          ].join('\n');

          rewardMsg.push(douziMiMsg);

        } else {
          const douziMiMsg = [
            "【斗字秘】触发",
            "九秘之【斗字秘】运转，斗战圣法演化诸天万法！",
            "",
            `在与${tianjiaoName}的激战中，【斗字秘】推演其所有功法，`,
            `然你已尽数掌握${tianjiaoName}的传承，无法再演化新的功法。`,
            "",
            "【斗字秘】虽未演化出新法，但战斗经验与道行依旧精进！",
            "万法归宗，殊途同归，你的战斗技艺已达化境！"
          ].join('\n');

          rewardMsg.push(douziMiMsg);
        }
      }

      // 检查天骄是否被击败
      if (status.currentHP <= 0) {
        status.isAlive = false;

        // 设置全局复活CD（18小时）
        const reviveTime = Date.now() + this.tianjiaoRefreshMs;
        await redis.set(globalReviveKey, reviveTime.toString());

        rewardMsg.push(`${tianjiaoName}已被彻底击败，18小时后将重新出现！`);

        // 发放击败奖励
        if (tianjiaoData.掉落物) {
          for (const item of tianjiaoData.掉落物) {
            if (Math.random() < item.概率) {
              await Add_najie_thing(usr_qq, item.name, item.class, item.数量);
              rewardMsg.push(`${item.name} x${item.数量}`);
            }
          }
        }

        // 特殊掉落
        if (tianjiaoData.特殊掉落) {
          for (const special of tianjiaoData.特殊掉落) {
            if (Math.random() < special.概率) {
              await Add_najie_thing(usr_qq, special.name, special.class, special.数量);
              rewardMsg.push(`特殊掉落：${special.name} x${special.数量}`);
              if (special.效果) {
                rewardMsg.push(`（${special.效果}）`);
              }
            }
          }
        }

        // 发放贡献榜奖励 - 确保所有有贡献的玩家都能获得奖励
        await this.distributeContributionRewards(e, tianjiaoName, tianjiaoData, usr_qq);
      }

      e.reply(rewardMsg.join('\n'));
    } else {
      // 失败奖励
      await Add_源石(usr_qq, 1000000); // 100万源石
      await Add_灵石(usr_qq, 3000000); // 300万灵石
      await Add_修为(usr_qq, zuizhong);
      await Add_血气(usr_qq, zuizhong);

      e.reply([
        `你与${tianjiaoName}激战一番，获得奖励：`,
        `灵石：300万`,
        `源石：100万`,
        `修为：${bigNumberTransform(zuizhong)}`,
        `血气：${bigNumberTransform(zuizhong)}`
      ].join('\n'));
    }

    // 保存天骄状态
    await redis.set(statusKey, JSON.stringify(status));

    // 设置全局CD（30分钟）
    await redis.set(`xiuxian:player:${usr_qq}:BOSSCD`, now_Time.toString());

    return true;
  }

  // 分发贡献榜奖励
  async distributeContributionRewards(e, tianjiaoName, tianjiaoData, killerQQ) {
    const damageKey = `tianjiao:damage:${tianjiaoName}`;
    const contributors = await this.getDamageRankings(damageKey);

    if (contributors.length === 0) {
      return;
    }

    // 发放奖励
    const rewardMessages = [`****${tianjiaoName}贡献榜奖励****`];

    for (let i = 0; i < contributors.length; i++) {
      const contributor = contributors[i];
      let rewardCount = 1; // 默认1样物品

      // 根据排名调整奖励数量
      if (i === 0) {
        // 第一名：3-5样物品
        rewardCount = 3 + Math.floor(Math.random() * 3);
      } else if (i >= 1 && i <= 4) {
        // 第二到第五名：2-4样物品
        rewardCount = 2 + Math.floor(Math.random() * 3);
      } else if (i <= 9) {
        // 第六到第十名：1-3样物品
        rewardCount = 1 + Math.floor(Math.random() * 3);
      }
      // 十名以后保持1样物品

      // 发放奖励
      const rewards = await this.giveRandomItems(contributor.qq, tianjiaoData, rewardCount);

      // 显示奖励信息
      const playerName = await this.getPlayerName(contributor.qq);
      const damageDisplay = this.bigNumberTransformBigInt(contributor.damageStr || contributor.damage.toString());
      rewardMessages.push(`${i + 1}. ${playerName} - 伤害: ${damageDisplay}`);

      if (rewards.length > 0) {
        rewardMessages.push(`   获得 ${rewards.length} 样物品: ${rewards.join('、')}`);
      } else {
        // 理论上不会走到这里，因为有保底机制
        rewardMessages.push(`   获得基础奖励`);
      }
    }

    // 发放击杀者额外奖励（50%概率获得1-3样物品）
    if (Math.random() < 0.5) {
      const extraRewardCount = 1 + Math.floor(Math.random() * 3); // 1-3样物品
      const extraRewards = await this.giveRandomItems(killerQQ, tianjiaoData, extraRewardCount);

      if (extraRewards.length > 0) {
        const killerName = await this.getPlayerName(killerQQ);
        rewardMessages.push(`击杀者${killerName}获得额外奖励: ${extraRewards.join('、')}`);
      }
    }

    // 发送奖励信息
    if (rewardMessages.length > 1) {
      await ForwardMsg(e, rewardMessages);
    }

    // 清空贡献榜
    await redis.del(damageKey);
  }

  // 发放随机物品
  async giveRandomItems(qq, tianjiaoData, count) {
    const rewards = [];

    if (!tianjiaoData.掉落物 || tianjiaoData.掉落物.length === 0) {
      return rewards;
    }

    // 将物品按概率分类：基础物品（概率≥0.5）和稀有物品（概率<0.5）
    const baseItems = tianjiaoData.掉落物.filter(item => item.概率 >= 0.5);
    const rareItems = tianjiaoData.掉落物.filter(item => item.概率 < 0.5);

    // 确保至少有一个基础物品作为保底
    let hasDropped = false;

    for (let i = 0; i < count; i++) {
      // 优先尝试掉落稀有物品（70%概率尝试稀有，30%概率尝试基础）
      let itemPool = Math.random() < 0.7 ? rareItems : baseItems;

      // 如果稀有物品池为空，则使用基础物品池
      if (itemPool.length === 0) {
        itemPool = baseItems;
      }

      // 随机选择一件物品
      const randomIndex = Math.floor(Math.random() * itemPool.length);
      const item = itemPool[randomIndex];

      // 对于基础物品（概率≥0.5），实际掉落概率为100%
      // 对于稀有物品，使用原概率
      const actualProbability = item.概率 >= 0.5 ? 1.0 : item.概率;

      if (Math.random() < actualProbability) {
        await Add_najie_thing(qq, item.name, item.class, item.数量);
        rewards.push(`${item.name}x${item.数量}`);
        hasDropped = true;
      }
    }

    // 保底机制：如果没有任何物品掉落，强制掉落一个基础物品
    if (!hasDropped && baseItems.length > 0) {
      const fallbackIndex = Math.floor(Math.random() * baseItems.length);
      const fallbackItem = baseItems[fallbackIndex];
      await Add_najie_thing(qq, fallbackItem.name, fallbackItem.class, fallbackItem.数量);
      rewards.push(`${fallbackItem.name}x${fallbackItem.数量}（保底奖励）`);
    }

    return rewards;
  }

  // 获取玩家名称
  async getPlayerName(qq) {
    try {
      const player = await Read_player(qq);
      return player.名号 || `玩家${qq}`;
    } catch (error) {
      return `玩家${qq}`;
    }
  }

  // 天骄伤害贡献榜
  async ShowDamageList2(e) {
    if (!verc({ e })) return false;

    // 获取天骄名称
    const match = e.msg.match(/^#天骄贡献榜(?:\s+(.*))?$/);
    const tianjiaoName = match[1] ? match[1].trim() : '';

    if (!tianjiaoName) {
      e.reply('请指定要查看的天骄名称，例如: #天骄贡献榜 猪咪岁岁');
      return false;
    }

    // 检查天骄是否存在
    const tianjiaoData = data.weimiantianjiao_list.find(tj => tj.名号 === tianjiaoName);
    if (!tianjiaoData) {
      e.reply(`未找到名为「${tianjiaoName}」的天骄`);
      return false;
    }

    // 检查全局复活CD
    const globalReviveKey = `tianjiao:global:revive:${tianjiaoName}`;
    const globalReviveTime = await redis.get(globalReviveKey);

    if (globalReviveTime && Date.now() < parseInt(globalReviveTime)) {
      e.reply(`${tianjiaoName}已被击败，暂无贡献数据`);
      return false;
    }

    // 获取天骄状态
    const statusKey = `tianjiao:status:${tianjiaoName}`;
    let status = await redis.get(statusKey);
    status = JSON.parse(status || '{}');

    if (!status.isAlive) {
      e.reply(`${tianjiaoName}已被击败，暂无贡献数据`);
      return false;
    }

    // 获取贡献榜数据
    const damageKey = `tianjiao:damage:${tianjiaoName}`;
    const contributors = await this.getDamageRankings(damageKey);

    if (contributors.length === 0) {
      e.reply(`${tianjiaoName}暂无贡献数据`);
      return false;
    }

    // 构建贡献榜消息
    const msg = [`****${tianjiaoName}贡献榜****`];
    for (let i = 0; i < Math.min(contributors.length, 10); i++) {
      const contributor = contributors[i];
      const playerName = await this.getPlayerName(contributor.qq);
      const damageDisplay = this.bigNumberTransformBigInt(contributor.damageStr || contributor.damage.toString());
      msg.push(`${i + 1}. ${playerName} - 伤害: ${damageDisplay}`);
    }

    if (contributors.length > 10) {
      msg.push(`...等${contributors.length}位修士`);
    }

    msg.push(`天骄当前血量: ${status.currentHP}%`);

    e.reply(msg.join('\n'));
    return false;
  }
}

// 初始化天骄
async function InitWorldBoss(e) {
  // 初始化所有天骄状态
  for (const tianjiao of data.weimiantianjiao_list) {
    const statusKey = `tianjiao:status:${tianjiao.名号}`;
    const status = {
      currentHP: 100, // 百分比血量
      isAlive: true,
    };
    await redis.set(statusKey, JSON.stringify(status));

    // 清除全局复活CD和贡献榜
    await redis.del(`tianjiao:global:revive:${tianjiao.名号}`);
    await redis.del(`tianjiao:damage:${tianjiao.名号}`);
  }

  if (e && e.reply) {
    e.reply('所有天骄已初始化，可以开始挑战！');
  }

  return false;
}

// 获取天骄是否已开启
async function BossIsAlive() {
  // 检查是否有天骄存活
  for (const tianjiao of data.weimiantianjiao_list) {
    const statusKey = `tianjiao:status:${tianjiao.名号}`;
    const status = await redis.get(statusKey);
    if (status) {
      const statusObj = JSON.parse(status);
      if (statusObj.isAlive) return true;
    }
  }
  return false;
}

// 排序玩家
async function SortPlayer(PlayerRecordJSON) {
  if (PlayerRecordJSON) {
    let Temp0 = JSON.parse(JSON.stringify(PlayerRecordJSON));
    let Temp = Temp0.TotalDamage;
    let SortResult = [];
    Temp.sort(function (a, b) {
      return b - a;
    });
    for (let i = 0; i < PlayerRecordJSON.TotalDamage.length; i++) {
      for (let s = 0; s < PlayerRecordJSON.TotalDamage.length; s++) {
        if (Temp[i] == PlayerRecordJSON.TotalDamage[s]) {
          SortResult[i] = s;
          break;
        }
      }
    }
    return SortResult;
  }
}

// 设置防止锁卡死的计时器
async function SetWorldBOSSBattleUnLockTimer(e) {
  WorldBOSSBattleUnLockTimer = setTimeout(() => {
    if (WorldBOSSBattleLock == 1) {
      WorldBOSSBattleLock = 0;
      e.reply('检测到战斗锁卡死，已自动修复');
      return false;
    }
  }, 30000);
}

// sleep函数
async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}