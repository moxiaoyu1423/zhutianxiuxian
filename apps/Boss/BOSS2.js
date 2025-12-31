import { plugin, verc, data, config } from '../../api/api.js';
import fs from 'fs';
import {
  Add_灵石,
  ForwardMsg,
  Add_HP,
  Write_player,
  Harm,
  zd_battle,
  channel, Add_najie_thing 
} from '../../model/xiuxian.js';
let WorldBOSSBattleCD = []; //CD
let WorldBOSSBattleLock = 0; //BOSS战斗锁，防止打架频率过高造成奖励多发
let WorldBOSSBattleUnLockTimer = 0; //防止战斗锁因意外锁死
export class BOSS2 extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_修仙_BOSS',
      dsc: 'BOSS模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#开启黑暗动乱$',
          fnc: 'CreateWorldBoss',
        },
        {
          reg: '^#关闭黑暗动乱$',
          fnc: 'DeleteWorldBoss',
        },
        {
          reg: '^#禁区至尊状态$',
          fnc: 'LookUpWorldBossStatus',
        },
        {
          reg: '^#黑暗动乱帝战贡献榜$',
          fnc: 'ShowDamageList',
        },
        {
          reg: '^#平定黑暗动乱$',
          fnc: 'WorldBossBattle',
        },
      ],
    });
    this.set = config.getConfig('task', 'task');
   this.task = {
  cron: this.set.BossTask2,
  name: 'BossTask2',
  fnc: () => this.CreateWorldBoss({ 
    isMaster: true, // 模拟管理员权限
    reply: (msg) => console.log(`[黑暗动乱开启！] ${msg}`) // 日志输出
  }),
};
  }
  //黑暗动乱开启指令
    async CreateWorldBoss(e) {
      if (!e) {
    // 可以在这里记录日志或者使用 Bot 发送消息
    console.log('[黑暗动乱] 定时任务触发，准备开启黑暗动乱');
    if (!await BossIsAlive()) {
      if (await InitWorldBoss(e) == 0) {
        // 发送群消息通知
        const groupList = await redis.sMembers('xiuxian:AuctionofficialTask_GroupList');
        for (const group_id of groupList) {
          Bot.pickGroup(group_id).sendMsg("禁区至尊感应到天地异变，提前苏醒！黑暗动乱已降临，诸天万界陷入浩劫！\n若有强者想要守护众生请输入 #平定黑暗动乱 参与帝战！");
        }
      }
      return true;
    } else {
      console.log('[黑暗动乱] 黑暗动乱已经开启');
      return true;
    }
  }
        if (e.isMaster) {
            if (!await BossIsAlive()) {
                if (await InitWorldBoss(e) == 0)
                    e.reply("似乎有什么东西干预了岁月，让禁区至尊有所预感，提前出世要收割万灵生命展开帝战打开成仙之门，恐怖的黑暗动乱开启！");
                return true;
            }
            else {
                e.reply("各大禁区至尊早已出世");
                return true;
            }
        }
        else return;
    }
  //黑暗动乱结束指令
  async DeleteWorldBoss(e) {
    if (!verc({ e })) return false;
    if (e.isMaster) {
      if (await BossIsAlive()) {
        await redis.del('Xiuxian:WorldBossStatus2');
        await redis.del('zhutianxiuxian1.0Record2');
       e.reply("恐怖的黑暗动乱气息惊扰到了如梦道祖，只见他睁眼望向诸天万界，眸光照耀永恒无垠的黑暗宇宙，划破了一切既定未定，截断了整片黑暗动乱的时空，将这段历史从古史的源头中直接抹去了，世间万灵都对这段过往失去了记忆！");
      } else e.reply('黑暗动乱早已结束');
    } else return false;
  }
  //黑暗动乱状态指令
  async LookUpWorldBossStatus(e) {
    if (!verc({ e })) return false;
    if (await BossIsAlive()) {
      let WorldBossStatusStr = await redis.get('Xiuxian:WorldBossStatus2');
      let WorldBossStatus = JSON.parse(WorldBossStatusStr);
      if (WorldBossStatusStr) {
        WorldBossStatusStr = JSON.parse(WorldBossStatusStr);
        if (new Date().getTime() - WorldBossStatusStr.KilledTime < 86400000) {
          e.reply(`此刻未到仙域之门打开之时，禁区至尊还在蛰伏`);
          return false;
        } else if (WorldBossStatusStr.KilledTime != -1) {
          if ((await InitWorldBoss(e)) == 0) await this.LookUpWorldBossStatus(e);
          return false;
        }
        let BOSSCurrentAttack = WorldBossStatus.isAngry ? Math.trunc(WorldBossStatus.Attack * 1.8) : WorldBossStatus.isWeak ? Math.trunc(WorldBossStatus.Attack * 0.6) : WorldBossStatus.Attack;
                    let BOSSCurrentDefence = WorldBossStatus.isWeak ? Math.trunc(WorldBossStatus.Defence * 0.6) : WorldBossStatus.Defence;
        let ReplyMsg = [`----长生天尊状态----\n血量:${WorldBossStatus.Health}\n基础攻击:${WorldBossStatus.Attack}\n基础防御:${WorldBossStatus.Defence}\n当前攻击:${BOSSCurrentAttack}\n当前防御:${BOSSCurrentDefence}\n当前状态:`];
                    if (WorldBossStatus.isWeak) ReplyMsg.push(`虚弱(还剩${WorldBossStatus.isWeak}回合)\n温馨提示:给长生天尊最后一击的人可以随机获得八个物品`);
                    else if (WorldBossStatus.isAngry) ReplyMsg.push(`狂暴(还剩${WorldBossStatus.isAngry}回合)\n温馨提示:给长生天尊最后一击的人可以随机获得八个物品`);
                    else ReplyMsg.push("正常\n温馨提示:给长生天尊最后一击的人可以随机获得八个物品");
        e.reply(ReplyMsg);
      }
    } else e.reply('金角大王未开启！');
    return false;
  }

  //黑暗动乱伤害贡献榜
    async ShowDamageList(e) {
        if (await BossIsAlive()) {
            let PlayerRecord = await redis.get("zhutianxiuxian1.0Record2");
            let WorldBossStatusStr = await redis.get("Xiuxian:WorldBossStatus");
            let WorldBossStatus = JSON.parse(WorldBossStatusStr);
            if (WorldBossStatus == undefined) {
                e.reply("WorldBossStatus Error");
                return true;
            }
            if (PlayerRecord == 0) {
                e.reply("此刻还没有人族强者挺身而出守护诸天");
                return true;
            }
            let PlayerRecordJSON = JSON.parse(PlayerRecord);
            let PlayerList = await SortPlayer(PlayerRecordJSON);
            if (!PlayerRecordJSON?.Name) {
                e.reply("黑暗动乱早已被人族强者平定");
                return true;
            }
            let CurrentQQ;
            let TotalDamage = 0;
            for (let i = 0; i < (PlayerList.length <= 20 ? PlayerList.length : 20); i++)
                TotalDamage += PlayerRecordJSON.TotalDamage[PlayerList[i]];
            let msg = [
                "****黑暗动乱帝战贡献排行榜****"
            ];
            for (var i = 0; i < PlayerList.length; i++) {
                if (i < 20) {
                    let Reward = Math.trunc((PlayerRecordJSON.TotalDamage[PlayerList[i]] / TotalDamage) * WorldBossStatus.Reward);
                    Reward = Reward < 10000 ? 10000 : Reward;
                    if (Reward > 1000000) {
                        Reward = 1000000
                    }
                    msg.push("第" + `${i + 1}` + "名:\n" + `名号:${PlayerRecordJSON.Name[PlayerList[i]]}` + '\n' + `总伤害:${PlayerRecordJSON.TotalDamage[PlayerList[i]]}` + `\n${WorldBossStatus.Health == 0 ? `已得到灵石` : `预计得到灵石`}:${Reward}`);
                }
                if (PlayerRecordJSON.QQ[PlayerList[i]] == e.user_id) CurrentQQ = i + 1;
            }
            await ForwardMsg(e, msg);
            await sleep(1000);
            if (CurrentQQ != undefined)
                e.reply(`你在黑暗动乱帝战贡献排行榜中排名第${CurrentQQ}，对禁区至尊造成伤害${PlayerRecordJSON.TotalDamage[PlayerList[CurrentQQ - 1]]}，再接再厉！`);
        }
        else e.reply("黑暗动乱还未到来！");
        return true;
    }
  //与金角大王战斗
  async WorldBossBattle(e) {
    if (!verc({ e })) return false;
    if (e.isPrivate) return false;

    if (!(await BossIsAlive())) {
      e.reply('黑暗动乱还未到来！');
      return false;
    }
    let usr_qq=e.user_id.toString().replace("qg_","")
    usr_qq=await channel(usr_qq)
    var Time = 5;
    let now_Time = new Date().getTime(); //获取当前时间戳
    Time = parseInt(60000 * Time);
    let last_time = await redis.get('xiuxian:player:' + usr_qq + 'BOSSCD'); //获得上次的时间戳,
    last_time = parseInt(last_time);
    if (now_Time < last_time + Time) {
      let Couple_m = Math.trunc((last_time + Time - now_Time) / 60 / 1000);
      let Couple_s = Math.trunc(((last_time + Time - now_Time) % 60000) / 1000);
      e.reply('正在CD中，' + `剩余cd:  ${Couple_m}分 ${Couple_s}秒`);
      return false;
    }
    await data.existData("player", e.user_id)
    let CurrentPlayerAttributes = await data.getData("player", e.user_id);
    if (data.existData('player', usr_qq)) {
      let player = await data.getData('player', usr_qq);
      if (player.mijinglevel_id < 12) {
        e.reply('秘境体系至少达到圣人才能参与挑战');
        return false;
      }
      let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
      action = JSON.parse(action);
      if (action != null) {
        let action_end_time = action.end_time;
        let now_time = new Date().getTime();
        if (now_time <= action_end_time) {
          let m = parseInt((action_end_time - now_time) / 1000 / 60);
          let s = parseInt((action_end_time - now_time - m * 60 * 1000) / 1000);
          e.reply(
            '正在' + action.action + '中,剩余时间:' + m + '分' + s + '秒'
          );
          return false;
        }
      }
      if (player.当前血量 <= player.血量上限 * 0.1) {
        e.reply('你的生命早已如风中残烛，先疗伤吧，别急着参战平定黑暗动乱了');
        return false;
      }
      if (WorldBOSSBattleCD[usr_qq]) {
        let Seconds = Math.trunc(
          (300000 - (new Date().getTime() - WorldBOSSBattleCD[usr_qq])) / 1000
        );
        if (Seconds <= 300 && Seconds >= 0) {
          e.reply(
            `刚刚一战消耗了太多法力，还是先歇息一会儿吧~(剩余${Seconds}秒)`
          );
          return false;
        }
      }

          let WorldBossStatusStr = await redis.get('Xiuxian:WorldBossStatus2');
    let PlayerRecord = await redis.get('zhutianxiuxian1.0Record2');
    let WorldBossStatus = JSON.parse(WorldBossStatusStr);
    
    // ==== 新增的拦截逻辑 ====
    // 获取当前时间
    const now = new Date();
    const currentHour = now.getHours();
    
    // 检查是否在开放时间（20:00-21:00）
   // if (currentHour < 20 || currentHour >= 21) {
    //    e.reply(`此刻未到成仙路打开之时，禁区至尊还在蛰伏，成仙路将在每日20:00-21:00开启`);
    //    return false;
   // }
    
    // 检查冷却时间（24小时）
    if (WorldBossStatus.KilledTime !== -1) {
        const lastKilledTime = new Date(WorldBossStatus.KilledTime);
        const nextOpenTime = new Date(lastKilledTime.getTime() + 86400000);
        
        if (now < nextOpenTime) {
            const hours = nextOpenTime.getHours();
            const minutes = nextOpenTime.getMinutes().toString().padStart(2, '0');
            e.reply(`黑暗动乱刚刚被平定，禁区至尊还在恢复元气，下次开启时间: ${hours}:${minutes}`);
            return false;
        }
    }
    
    // 如果黑暗动乱未开启，尝试初始化
    if (WorldBossStatus.KilledTime !== -1) {
        const initResult = await InitWorldBoss(e);
        if (initResult === 0) {
            // 重新获取状态
            WorldBossStatusStr = await redis.get('Xiuxian:WorldBossStatus2');
            WorldBossStatus = JSON.parse(WorldBossStatusStr);
        } else {
            e.reply('开启黑暗动乱失败，请稍后再试');
            return false;
        }
    }
      let PlayerRecordJSON, Userid;
      if (PlayerRecord == 0) {
        let QQGroup = [],
          DamageGroup = [],
          Name = [];
        QQGroup[0] = usr_qq;
        DamageGroup[0] = 0;
        Name[0] = player.名号;
        PlayerRecordJSON = {
          QQ: QQGroup,
          TotalDamage: DamageGroup,
          Name: Name,
        };
        Userid = 0;
      } else {
        PlayerRecordJSON = JSON.parse(PlayerRecord);
        let i;
        for (i = 0; i < PlayerRecordJSON.QQ.length; i++) {
          if (PlayerRecordJSON.QQ[i] == usr_qq) {
            Userid = i;
            break;
          }
        }
        if (!Userid && Userid != 0) {
          PlayerRecordJSON.QQ[i] = usr_qq;
          PlayerRecordJSON.Name[i] = player.名号;
          PlayerRecordJSON.TotalDamage[i] = 0;
          Userid = i;
        }
      }
      let TotalDamage = 0;
      let Boss = {
        名号: '长生天尊',
        攻击: parseInt(player.攻击 * (0.8 + 0.4 * Math.random())),
        防御: parseInt(player.防御 * (0.8 + 0.4 * Math.random())),
        当前血量: parseInt(player.血量上限 * (0.8 + 400000 * Math.random())),
        暴击率: player.暴击率,
        灵根: player.灵根,
        法球倍率: player.灵根.法球倍率,
      };
      player.法球倍率 = player.灵根.法球倍率;
      if (WorldBOSSBattleUnLockTimer) clearTimeout(WorldBOSSBattleUnLockTimer);
      SetWorldBOSSBattleUnLockTimer(e);
      if (WorldBOSSBattleLock != 0) {
        e.reply(
          '好像有人族强者正在与禁区至尊大战，现在去怕是有未知的凶险，还是等等吧！'
        );
        return false;
      }
      WorldBOSSBattleLock = 1;
      let Data_battle = await zd_battle(player, Boss);
      let msg = Data_battle.msg;
      let A_win = `${player.名号}击败了${Boss.名号}`;
      let B_win = `${Boss.名号}击败了${player.名号}`;
      if (msg.length <= 60) await ForwardMsg(e, msg);
      else {
        let msgg = JSON.parse(JSON.stringify(msg));
        msgg.length = 60;
        await ForwardMsg(e, msgg);
        e.reply('战斗过长，仅展示部分内容');
      }
      await sleep(1000);
      if (!WorldBossStatus.Healthmax) {
        e.reply('请联系管理员重新开启!');
        return false;
      }
      if (msg.find(item => item == A_win)) {
        TotalDamage = Math.trunc(
          WorldBossStatus.Healthmax * 0.76 +
            Harm(player.攻击 * 0.85, Boss.防御) * 10
        );
        WorldBossStatus.Health -= TotalDamage;
        e.reply(
          `${player.名号}击败了[${Boss.名号}],重创[长生天尊],造成伤害${TotalDamage}`
        );
      } else if (msg.find(item => item == B_win)) {
        TotalDamage = Math.trunc(
          WorldBossStatus.Healthmax * 0.04 +
            Harm(player.攻击 * 0.85, Boss.防御) * 6
        );
        WorldBossStatus.Health -= TotalDamage;
        e.reply(
          `${player.名号}被[${Boss.名号}]击败了,只对[长生天尊]造成了${TotalDamage}伤害`
        );
        player.当前血量 = 0 ;
        await Write_player(usr_qq, player);
      }
      await sleep(1000);
       let BOSSCurrentAttack = WorldBossStatus.isAngry ? Math.trunc(WorldBossStatus.Attack * 1.8) : WorldBossStatus.isWeak ? Math.trunc(WorldBossStatus.Attack * 0.7) : WorldBossStatus.Attack;
            let BOSSCurrentDefence = WorldBossStatus.isWeak ? Math.trunc(WorldBossStatus.Defence * 0.7) : WorldBossStatus.Defence;
      let random = Math.random();
       if (TotalDamage >= 0.1 * WorldBossStatus.OriginHealth && !WorldBossStatus.isWeak && !WorldBossStatus.isAngry) {
                WorldBossStatus.isAngry = 30;
                e.reply("这场战斗重创了长生天尊，但也令其暴怒不再留手并且极尽升华！\n长生天尊已经彻底恢复昔日极道至尊的实力，持续30回合");
            }
            if ( TotalDamage >= 0.15 * WorldBossStatus.OriginHealth && WorldBossStatus.isWeak && random <0.2) {
                e.reply('长生天尊不惜一切代价施展出了者字秘,超越了极限，血量回复了30%');
                WorldBossStatus.Health += Math.trunc(WorldBossStatus.Healthmax * 0.3);
            }
      if (player.当前血量 == 0) {
                e.reply("很可惜您未能击败长生天尊，反而自身重伤，再接再厉！");
                if (random < 0.45) {
                    let ExpFormBOSS = 1000000 + data.Level_list.find(item => item.level_id === CurrentPlayerAttributes.level_id).level_id * 21000;
                    e.reply(`你在与长生天尊的生死大战中忽然领悟到了大道真谛，修为提升${ExpFormBOSS}，血气提升${ExpFormBOSS}`);
                    CurrentPlayerAttributes.修为 += ExpFormBOSS;
                    CurrentPlayerAttributes.血气 += ExpFormBOSS;
                }
                if (random >0.1&&random < 0.35) {
                    let HPFormBOSS = 5000 + CurrentPlayerAttributes.血量上限 * 0.2;
                    if (HPFormBOSS > CurrentPlayerAttributes.血量上限) HPFormBOSS = CurrentPlayerAttributes.血量上限 - CurrentPlayerAttributes.当前血量;
                    HPFormBOSS = Math.trunc(HPFormBOSS);
                    e.reply(`你在帝战中被打的几乎身魂消散，就在这即将陨落之际，虚空大帝分心为你渡入一道本源精气，将你强行救活，并且生命恢复${HPFormBOSS}点，但他也因此被禁区至尊重创了`);
                    CurrentPlayerAttributes.当前血量 += HPFormBOSS;
                }
                if ( random  <0.1 ) {
                    TotalDamage+= Math.trunc(WorldBossStatus.Health * 0.25);
            WorldBossStatus.Health -= Math.trunc(WorldBossStatus.Health * 0.25);
            e.reply(
              `就在这危及时刻,一位【大成圣体】出现，极尽升华后与长生天尊大战对【长生天尊】造成${Math.trunc(WorldBossStatus.Health * 0.25)}伤害，【长生天尊】剩余${WorldBossStatus.Health}，使长生天尊本源都受到了重创，战力大减似乎要跌落大帝果位，但那位大成圣体在下一刻消失了`);
                }
                if (random >0.1&& random <  0.3) {
                    TotalDamage += Math.trunc(WorldBossStatus.Health * 0.15);
            WorldBossStatus.Health -= Math.trunc(WorldBossStatus.Health * 0.15);
            e.reply(
              `帝战的可怕打爆了无数大星，宇宙各处都洒落帝血，整片天地尸山血海茫茫黑暗，就在这绝望之时，【太阳圣皇】的一缕真灵感应到众生的悲惨恸哭与呼唤，以一张人皮再现持极道帝兵【太阳石塔】对【长生天尊】造成${Math.trunc(WorldBossStatus.Health * 0.15)}伤害，【长生天尊】剩余${WorldBossStatus.Health}，但同时他交手上了光暗至尊，不宜分心，无力再插手诸天这边的战场`);
                }
            }
             WorldBossStatus.isAngry ? --WorldBossStatus.isAngry : 0;
                    WorldBossStatus.isWeak ? --WorldBossStatus.isWeak : 0;
                    if (!WorldBossStatus.isAngry && BOSSCurrentAttack > WorldBossStatus.Attack) BOSSCurrentAttack = WorldBossStatus.Attack;
                    if (!WorldBossStatus.isWeak && BOSSCurrentDefence < WorldBossStatus.Defence) BOSSCurrentDefence = WorldBossStatus.Defence;
      await sleep(1000);
      PlayerRecordJSON.TotalDamage[Userid] += TotalDamage;
      redis.set('zhutianxiuxian1.0Record2', JSON.stringify(PlayerRecordJSON));
      redis.set('Xiuxian:WorldBossStatus2', JSON.stringify(WorldBossStatus));
// 修改后的物品选择函数（使用物品池中的数量）
function getRandomItems(items, count) {
  let selectedItems = [];
  
  // 确保 items 是数组且不为空
  if (!Array.isArray(items) || items.length === 0) {
    console.error("物品池为空或无效");
    return selectedItems;
  }
  
  // 复制物品池（不修改原始数据）
  const itemPool = [...items];
  
  for (let i = 0; i < count; i++) {
    if (itemPool.length === 0) break;
    
    // 随机选择一个物品
    const randomIndex = Math.floor(Math.random() * itemPool.length);
    const item = itemPool[randomIndex];
    
    // 确保物品有效且有数量属性
    if (item && typeof item === 'object' && '数量' in item) {
      const rewardQuantity = item.数量;
      
      selectedItems.push({
        name: item.name,
        class: item.class,
        quantity: rewardQuantity
      });
      
      // 从池中移除已选物品
      itemPool.splice(randomIndex, 1);
    } else {
      console.warn("无效的物品:", item);
    }
  }
  
  return selectedItems;
}

async function addItemsToNajie(playerId, items) {
  if (!Array.isArray(items) || items.length === 0) {
    console.warn("没有物品可添加");
    return;
  }
  
  for (let item of items) {
    // 确保物品有效
    if (item && item.name && item.class && item.quantity !== undefined) {
      try {
        // 使用 item.quantity 作为添加物品的数量
        await Add_najie_thing(playerId, item.name, item.class, item.quantity);
      } catch (e) {
        console.error(`添加物品失败: ${item.name}`, e);
      }
    } else {
      console.warn("无效的物品对象:", item);
    }
  }
}    // 分配奖励给击杀者（最后一击的玩家）
// 分配奖励给击杀者（最后一击的玩家）
if (WorldBossStatus.Health <= 0) {
    // 记录击杀者
    const killerId = e.user_id;
    
    // 为击杀者分配特殊奖励
    let killerItems = getRandomItems(data.heiandongluandizhan, 2);
    await addItemsToNajie(killerId, killerItems);
    
    // 构建击杀者获得的物品消息
    let killerItemsMsg = killerItems.map(item => `${item.name}×${item.quantity}`).join(', ');
    
    e.reply([
        segment.at(killerId),
        `\n你终结了长生天尊的性命，平定了黑暗动乱，保护了诸天万界的芸芸众生，受到天道青睐，天地降下福泽你获得了10000000灵石与修为血气奖励！并且在还未破碎的帝战战场中找到了以下物品: ${killerItemsMsg}`
    ]);
    
    // 更新玩家属性
    let killerPlayer = await data.getData("player", killerId);
    killerPlayer.灵石 += 10000000;
    killerPlayer.修为 += 10000000;
    killerPlayer.血气 += 10000000;
    data.setData("player", killerId, killerPlayer);
    
    // 保存击杀记录
    WorldBossStatus.KilledTime = new Date().getTime();
    redis.set('Xiuxian:WorldBossStatus2', JSON.stringify(WorldBossStatus));
    
    // 处理贡献排行榜奖励
    let PlayerList = await SortPlayer(PlayerRecordJSON);
    let Show_MAX = Math.min(PlayerList.length, 20); // 最多显示20名玩家
    
    let TotalDamage = PlayerList.reduce((sum, index) => sum + PlayerRecordJSON.TotalDamage[index], 0);
    
    let Rewardmsg = ["****黑暗动乱帝战贡献排行榜****"];
    
    for (let i = 0; i < Show_MAX; i++) {
        let playerId = PlayerRecordJSON.QQ[PlayerList[i]];
        let playerName = PlayerRecordJSON.Name[PlayerList[i]];
        let damage = PlayerRecordJSON.TotalDamage[PlayerList[i]];
        
        // 计算灵石奖励（基于伤害占比）
        let rewardMoney = Math.trunc((damage / TotalDamage) * WorldBossStatus.Reward);
        rewardMoney = Math.max(1500, Math.min(rewardMoney, 1000000)); // 限制在1500-1000000之间
        
        // 更新玩家灵石
        let playerData = await data.getData("player", playerId);
        playerData.灵石 += rewardMoney;
        data.setData("player", playerId, playerData);
        
        // 根据排名分配物品
        let itemsCount = 0;
        if (i === 0) { // 伤害贡献第一名
            itemsCount = 5;
        } else if (i === 1) { // 第二名
            itemsCount = 4;
        } else if (i === 2) { // 第三名
            itemsCount = 3;
        } else if (i >= 3 && i <= 4) { // 第四、五名
            itemsCount = 2;
        } else if (i >= 5 && i <= 9) { // 第六到十名
            itemsCount = 1;
        }
        

        // 添加物品奖励
        if (itemsCount > 0) {
            let rankItems = getRandomItems(data.heiandongluandizhan, itemsCount);
            await addItemsToNajie(playerId, rankItems);
            
            const itemNames = rankItems.map(item => `${item.name}×${item.quantity}`).join(', ');
            
            let rewardMsg = `你是黑暗动乱帝战贡献榜第${i+1}名玩家，获得了以下物品: ${itemNames}`;
            
            
            e.reply([segment.at(playerId), `\n${rewardMsg}`]);
        }
        
        // 添加到排行榜消息
        Rewardmsg.push(`第${i+1}名: ${playerName} - 伤害:${damage} - 获得灵石:${rewardMoney}`);
    }
    
    // 发送排行榜消息
    await ForwardMsg(e, Rewardmsg);
}
        }
    }
}


//初始化长生天尊
async function InitWorldBoss(e) {
  let AverageDamageStruct = await GetAverageDamage(e);
  let player_quantity = parseInt(AverageDamageStruct.player_quantity);
  let AverageDamage = parseInt(AverageDamageStruct.AverageDamage);
  let Reward = 6000000;
  WorldBOSSBattleLock = 0;
  if (player_quantity == 0) {
    e.reply("你们甚至没有斩道王者以上的高手，平定黑暗动乱不是你们能参与的，继续努力再来吧！");
    return - 1;
  }
  if (player_quantity < 5) Reward = 3000000;
  let X = AverageDamage * 0.01;
  e.reply(`[长生天尊] 圣人玩家总数：${player_quantity}`);
  e.reply(`[长生天尊] 生成基数:${X}`);
  let Health = Math.trunc(X * 150 * player_quantity * 2); //血量要根据人数来
  let random1 = Math.random() + 1
    let Attack = Math.trunc(X *220*player_quantity * 2);
    let Defence = Math.trunc(X * 220*player_quantity * 2);
  let WorldBossStatus = {
    Health: Health,
    Healthmax: Health, // 初始血量最大值
    OriginHealth: Health, // 原始血量，用于计算伤害比例
    isAngry: 0,
    isWeak: 0,
    Attack: Attack,
    Defence: Defence,
    KilledTime: -1,
    Reward: Reward * 5,
};
  let PlayerRecord = 0;
  await redis.set('Xiuxian:WorldBossStatus2', JSON.stringify(WorldBossStatus));
  await redis.set('zhutianxiuxian1.0Record2', JSON.stringify(PlayerRecord));
  let msg = '【诸天位面公告】各大禁区至尊已经出世，发动了黑暗动乱，收割诸天万灵生命补充血气冲击成仙路，平定黑暗动乱的玩家会有天道赐予奖励';
  const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';
  const groupList = await redis.sMembers(redisGlKey);
    for (const group_id of groupList) {
        await pushInfo(group_id, true, msg);
    }
    return false;
}

async function pushInfo(id, is_group, msg) {
  if (is_group) {
    await Bot.pickGroup(id)
      .sendMsg(msg)
      .catch(err => {
        e.reply(err);
      });
  } else {
    await common.relpyPrivate(id, msg);
  }
}

//获取黑暗动乱是否已开启
async function BossIsAlive() {
  return (
    (await redis.get('Xiuxian:WorldBossStatus2')) &&
      (await redis.get('zhutianxiuxian1.0Record2'))
  );
}

//排序
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
//设置防止锁卡死的计时器
async function SetWorldBOSSBattleUnLockTimer(e) {
  WorldBOSSBattleUnLockTimer = setTimeout(() => {
    if (WorldBOSSBattleLock == 1) {
      WorldBOSSBattleLock = 0;
      e.reply('检测到战斗锁卡死，已自动修复');
      return false;
    }
  }, 30000);
}

//sleep
async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

//获取玩家平均实力和渡劫期以上人数
async function GetAverageDamage(e) {
  let File = fs.readdirSync(data.filePathMap.player);
  File = File.filter(file => file.endsWith('.json'));
  let temp = [];
  let TotalPlayer = 0;
  for (var i = 0; i < File.length; i++) {
    let this_qq = File[i].replace('.json', '');

    let player = await data.getData('player', this_qq);
    if (player.mijinglevel_id > 12 && player.mijinglevel_id < 23 && player.lunhui == 0) {
      temp[TotalPlayer] = parseInt(player.攻击);
      e.reply(`[长生天尊] ${this_qq}玩家攻击:${temp[TotalPlayer]}`);
      TotalPlayer++;
    }
  }
  //排序
  temp.sort(function (a, b) {
    return b - a;
  });
  let AverageDamage = 0;
  if (TotalPlayer > 15)
    for (let i = 2; i < temp.length - 4; i++) AverageDamage += temp[i];
  else for (let i = 0; i < temp.length; i++) AverageDamage += temp[i];
  AverageDamage =
    TotalPlayer > 15
      ? AverageDamage / (temp.length - 6)
      : temp.length == 0
      ? 0
      : AverageDamage / temp.length;
  let res = {
    AverageDamage: AverageDamage,
    player_quantity: TotalPlayer,
  };
  return res;
}
