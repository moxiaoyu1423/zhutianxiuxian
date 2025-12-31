import { plugin, verc, data, config } from '../../api/api.js';
import fs from 'fs';
import {
  __PATH,
  Add_灵石,
  ForwardMsg,
  Add_HP,
  Write_player,
  Harm,
  zd_battle,
  channel, Add_najie_thing ,bigNumberTransform
} from '../../model/xiuxian.js';

let WorldBOSSBattleCD = []; //CD
let WorldBOSSBattleLock = 0; //BOSS战斗锁，防止打架频率过高造成奖励多发
let WorldBOSSBattleUnLockTimer = 0; //防止战斗锁因意外锁死
let bossAutoCloseTimer = null; // 全局定时器变量

export class BOSS3 extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_修仙_BOSS',
      dsc: 'BOSS模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#开启诡异大祭万界$',
          fnc: 'CreateWorldBoss',
        },
        {
          reg: '^#关闭诡异大祭万界$',
          fnc: 'DeleteWorldBoss',
        },
        {
          reg: '^#诡异始祖状态$',
          fnc: 'LookUpWorldBossStatus',
        },
        {
          reg: '^#扫平厄土高原贡献榜$',
          fnc: 'ShowDamageList',
        },
        {
          reg: '^#迎战厄土高原$',
          fnc: 'WorldBossBattle',
        },
      ],
    });
    this.set = config.getConfig('task', 'task');
    this.task = {
      cron: this.set.BossTask3,
      name: 'BossTask3',
      fnc: () => this.CreateWorldBoss({ 
        isMaster: true, // 模拟管理员权限
        reply: (msg) => console.log(`[大祭现世开启！] ${msg}`) // 日志输出
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
          Bot.pickGroup(group_id).sendMsg("始祖在黑暗铜棺中感到心悸，提前复苏！推演出诸天万界出现变数，故要提前大祭现世万界，打灭一切变数，从古史中彻底抹除一切痕迹，现世万界陷入浩劫！");
        }
      }
      return true;
    } else {
      console.log('[大祭现世] 大祭现世已经开启');
      return true;
    }
  }
        if (e.isMaster) {
            if (!await BossIsAlive()) {
                if (await InitWorldBoss(e) == 0)
                    e.reply("似乎有什么东西干预了岁月，让高原始祖有所预感，提前出世要大祭诸世间，整片现世将要陷入末日！");
                return true;
            }
            else {
                e.reply("高原始祖早已复苏");
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
      const WorldBossStatusStr = await redis.get('guiyishizu');
      if (WorldBossStatusStr) {
        const WorldBossStatus = JSON.parse(WorldBossStatusStr);
        
      if (bossAutoCloseTimer) {
        clearTimeout(bossAutoCloseTimer);
        bossAutoCloseTimer = null;
      }}
      
      await redis.del('guiyishizu');
      await redis.del('gaoyuan');
       e.reply("恐怖的大祭万界气息惊扰到了如梦道祖，只见他睁眼望向诸天万界，眸光照耀永恒无垠的黑暗宇宙，划破了一切既定未定，截断了整片黑暗动乱的时空，将这段历史从古史的源头中直接抹去了，世间万灵都对这段过往失去了记忆！");
      } else e.reply('大祭万界早已结束');
    } else return false;
  }
// 黑暗动乱状态指令
async LookUpWorldBossStatus(e) {
    if (!verc({ e })) return false;
    
    // 检查黑暗动乱是否开启
    if (await BossIsAlive()) {
        let WorldBossStatusStr = await redis.get('guiyishizu');
        let WorldBossStatus = JSON.parse(WorldBossStatusStr);
        
        if (WorldBossStatusStr) {
            // 检查是否在开放时间
            const now = new Date();
            const currentHour = now.getHours();
            
            // 诡异始祖状态描述
            let statusMsg = [
                `【诡异始祖·厄土高原】`,
                `黑雾翻涌，诸天颤栗！`,
                `诡异始祖盘坐于高原之上，周身缭绕不祥气息，`,
                `祭道符文沉浮，映照诸世破灭！`,
            ];
            
            // 血量描述
            const healthPercent = (WorldBossStatus.Health / WorldBossStatus.Healthmax * 100).toFixed(1);
            statusMsg.push(`黑暗本源：${healthPercent}%`);
            statusMsg.push(`（${bigNumberTransform(WorldBossStatus.Health)}/${bigNumberTransform(WorldBossStatus.Healthmax)}）`);
            
            // 攻击防御描述
            let BOSSCurrentAttack = WorldBossStatus.isAngry 
                ? Math.trunc(WorldBossStatus.Attack * 1.8) 
                : WorldBossStatus.isWeak 
                    ? Math.trunc(WorldBossStatus.Attack * 0.6) 
                    : WorldBossStatus.Attack;
            
            let BOSSCurrentDefence = WorldBossStatus.isWeak 
                ? Math.trunc(WorldBossStatus.Defence * 0.6) 
                : WorldBossStatus.Defence;
            
            statusMsg.push(`祭道之力：${bigNumberTransform(BOSSCurrentAttack)}`);
            statusMsg.push(`不朽之躯：${bigNumberTransform(BOSSCurrentDefence)}`);
            
            // 状态描述
            if (WorldBossStatus.isWeak) {
                statusMsg.push(`「高原震荡，黑血逆流！」`);
                statusMsg.push(`诡异始祖本源受损，气息衰弱`);
                statusMsg.push(`剩余时间：${WorldBossStatus.isWeak}个纪元`);
            } else if (WorldBossStatus.isAngry) {
                statusMsg.push(`「诸天为祭，万灵为牲！」`);
                statusMsg.push(`诡异始祖暴怒，祭道符文燃烧，威压撼动古今未来`);
                statusMsg.push(`剩余时间：${WorldBossStatus.isAngry}个纪元`);
            } else {
                statusMsg.push(`「超越永恒，凌驾诸世！」`);
                statusMsg.push(`诡异始祖处于全盛状态，祭道无缺`);
            }
            
            
            e.reply(statusMsg.join("\n"));
        }
    } else {
        // 黑暗动乱未开启时的提示
        const now = new Date();
        const currentHour = now.getHours();
        
        // 根据时间给出不同提示
        if (currentHour < 20 || currentHour >= 21) {
            const hoursLeft = 20 - currentHour;
            const minutesLeft = hoursLeft > 0 ? 0 : 60 - now.getMinutes();
            
            const timeMsg = [
                `【诸天静默】`,
                `高原沉寂，黑雾消散，`,
                `诡异始祖蛰伏于高原深处，静待大祭时刻！`,
                `距离诡异大祭降临还有：`,
                `${hoursLeft > 0 ? hoursLeft + '时' : ''}${minutesLeft}分`,
            ];
            
            e.reply(timeMsg.join("\n"));
        } else {
            // 检查冷却时间
            const WorldBossStatusStr = await redis.get('guiyishizu');
            if (WorldBossStatusStr) {
                const WorldBossStatus = JSON.parse(WorldBossStatusStr);
                
                if (WorldBossStatus.KilledTime !== -1) {
                    const lastKilledTime = new Date(WorldBossStatus.KilledTime);
                    const nextOpenTime = new Date(lastKilledTime.getTime() + 86400000);
                    
                    const hours = nextOpenTime.getHours();
                    const minutes = nextOpenTime.getMinutes().toString().padStart(2, '0');
                    
                    const coolDownMsg = [
                        `【大祭余波】`,
                        `诡异大祭已被终结，诸天万界重归安宁！`,
                        `诡异始祖受创，正在高原深处疗伤，`,
                        `黑血染红高原，祭道符文崩碎！`,
                        `下次诡异大祭降临：${hours}:${minutes}`,
                    ];
                    
                    e.reply(coolDownMsg.join("\n"));
                    return false;
                }
            }
            
            // 默认提示
            e.reply([
                `【高原沉寂】`,
                `此刻正是诡异大祭降临之时（20:00-21:00），`,
                `但诡异始祖尚未苏醒，高原之门未开！`,
            ].join("\n"));
        }
    }
    
    return false;
}
  //黑暗动乱伤害贡献榜
    async ShowDamageList(e) {
        if (await BossIsAlive()) {
            let PlayerRecord = await redis.get("gaoyuan");
            let WorldBossStatusStr = await redis.get("Xiuxian:WorldBossStatus");
            let WorldBossStatus = JSON.parse(WorldBossStatusStr);
            if (WorldBossStatus == undefined) {
                e.reply("WorldBossStatus Error");
                return true;
            }
            if (PlayerRecord == 0) {
                e.reply("此刻还没有诸天至高强者挺身而出守护现世万界");
                return true;
            }
            let PlayerRecordJSON = JSON.parse(PlayerRecord);
            let PlayerList = await SortPlayer(PlayerRecordJSON);
            if (!PlayerRecordJSON?.Name) {
                e.reply("大祭万界早已被至高存在平定");
                return true;
            }
            let CurrentQQ;
            let TotalDamage = 0;
            for (let i = 0; i < (PlayerList.length <= 20 ? PlayerList.length : 20); i++)
                TotalDamage += PlayerRecordJSON.TotalDamage[PlayerList[i]];
            let msg = [
                "****扫平厄土高原贡献排行榜****"
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
                e.reply(`你在扫平厄土高原贡献排行榜中排名第${CurrentQQ}，对诡异始祖造成伤害${PlayerRecordJSON.TotalDamage[PlayerList[CurrentQQ - 1]]}，再接再厉！`);
        }
        else e.reply("诡异大祭现世万界还未到来！");
        return true;
    }

  async WorldBossBattle(e) {
    if (!verc({ e })) return false;
    if (e.isPrivate) return false;
        let WorldBossStatusStr = await redis.get('guiyishizu');
    let PlayerRecord = await redis.get('gaoyuan');
    let WorldBossStatus = JSON.parse(WorldBossStatusStr);
    if (!(await BossIsAlive())) {
      e.reply('诡异大祭万界还未到来！');
      return false;
    }
    WorldBossStatus.LastActivityTime = new Date().getTime();
// ==== 重置自动关闭定时器 ====
  if (bossAutoCloseTimer) {
    clearTimeout(bossAutoCloseTimer);
    bossAutoCloseTimer = null;
  }
 // 设置新定时器
  bossAutoCloseTimer = setTimeout(() => {
    checkAndCloseInactiveBoss().catch(err => {
      console.error('自动关闭黑暗动乱失败:', err);
    });
  }, 24 * 60 * 60 * 1000);
  // 保存状态
  await redis.set('guiyishizu', JSON.stringify(WorldBossStatus));

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
      if (player.mijinglevel_id < 21) {
        e.reply('你连路尽级仙帝都没有达到，根本无法超脱出现世之外与始祖抗衡，哪怕是对抗始祖的勇气都生不起来！');
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
        e.reply('你的生命早已如风中残烛，先疗伤吧，别急着参战平定厄土高原了');
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

  
    
// ==== 新增的拦截逻辑 ====
// 获取当前时间
const now = new Date();
const currentHour = now.getHours();

// 检查是否在开放时间（20:00-21:00）
//if (currentHour < 20 || currentHour >= 21) {
 //   e.reply([
 //       `【高原沉寂】`,
  //      `此刻未到高原之门打开之时，诡异始祖还在蛰伏，`,
  //      `诡异大祭将在每日20:00-21:00开启`,
  //  ].join("\n"));
  //  return false;
//}

// 检查冷却时间（24小时）
if (WorldBossStatus.KilledTime !== -1) {
    const lastKilledTime = new Date(WorldBossStatus.KilledTime);
    const nextOpenTime = new Date(lastKilledTime.getTime() + 86400000);
    
    if (now < nextOpenTime) {
        const hours = nextOpenTime.getHours();
        const minutes = nextOpenTime.getMinutes().toString().padStart(2, '0');
        
        e.reply([
            `【大祭余波】`,
            `诡异大祭刚刚被终结，高原黑血尚未干涸，`,
            `诡异始祖正在高原深处疗伤，恢复本源！`,
            `下次诡异大祭降临时间: ${hours}:${minutes}`,
        ].join("\n"));
        return false;
    }
}

// 如果诡异大祭未开启，尝试初始化
if (WorldBossStatus.KilledTime !== -1) {
    const initResult = await InitWorldBoss(e);
    if (initResult === 0) {
        // 重新获取状态
        WorldBossStatusStr = await redis.get('guiyishizu');
        WorldBossStatus = JSON.parse(WorldBossStatusStr);
        
    } else {
        e.reply([
            `【高原异动】`,
            `开启诡异大祭失败，高原之门未开！`,
            `请稍后再试或联系管理员`,
        ].join("\n"));
        return false;
    }
} let PlayerRecordJSON, Userid;
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
        名号: '诡异始祖',
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
          '好像有至高存在正在与诡异始祖大战，现在去怕是有未知的凶险，还是等等吧！'
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
          `${player.名号}击败了[${Boss.名号}],重创[诡异始祖],造成伤害${TotalDamage}`
        );
      } else if (msg.find(item => item == B_win)) {
        TotalDamage = Math.trunc(
          WorldBossStatus.Healthmax * 0.04 +
            Harm(player.攻击 * 0.85, Boss.防御) * 6
        );
        WorldBossStatus.Health -= TotalDamage;
        e.reply(
          `${player.名号}被[${Boss.名号}]击败了,只对[诡异始祖]造成了${TotalDamage}伤害`
        );
        player.当前血量 = 0 ;
        await Write_player(usr_qq, player);
      }
    await sleep(1000);
let BOSSCurrentAttack = WorldBossStatus.isAngry 
    ? Math.trunc(WorldBossStatus.Attack * 1.8) 
    : WorldBossStatus.isWeak 
        ? Math.trunc(WorldBossStatus.Attack * 0.7) 
        : WorldBossStatus.Attack;

let BOSSCurrentDefence = WorldBossStatus.isWeak 
    ? Math.trunc(WorldBossStatus.Defence * 0.7) 
    : WorldBossStatus.Defence;

let random = Math.random();

// 重创诡异始祖触发狂暴状态
if (TotalDamage >= 0.1 * WorldBossStatus.OriginHealth && 
    !WorldBossStatus.isWeak && 
    !WorldBossStatus.isAngry) {
    
    WorldBossStatus.isAngry = 30;
    e.reply([
        "▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂",
        "【始祖暴怒】",
        "这场战斗重创了诡异始祖，但也令其彻底暴怒！",
        "高原震动，黑血沸腾，祭道符文燃烧！",
        "「诸天为祭，万灵为牲！」",
        "诡异始祖极尽升华，恢复巅峰战力！",
        "持续30个纪元！",
        "▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂"
    ].join("\n"));
}

// 虚弱状态下触发复苏
if (TotalDamage >= 0.15 * WorldBossStatus.OriginHealth && 
    WorldBossStatus.isWeak && 
    random < 0.2) {
    
    e.reply([
        "▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂",
        "【高原复苏】",
        "诡异始祖引动高原本源，黑血倒流！",
        "「高原不灭，始祖不死！」",
        "不惜代价施展诡异复苏，生命本源恢复30%！",
        "▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂"
    ].join("\n"));
    
    WorldBossStatus.Health += Math.trunc(WorldBossStatus.Healthmax * 0.3);
}

// 玩家失败时的各种情况
if (player.当前血量 == 0) {
    e.reply("很可惜您未能击败诡异始祖，反而自身重伤，再接再厉！");
    
    if (random < 0.45) {
        let ExpFormBOSS = 1000000 + data.Level_list.find(item => item.level_id === CurrentPlayerAttributes.level_id).level_id * 21000;
        e.reply([
            "▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂",
            "【生死顿悟】",
            `你在与诡异始祖的生死大战中，`,
            `于绝境中窥见祭道真谛，`,
            `修为提升${ExpFormBOSS}，血气提升${ExpFormBOSS}！`,
            "▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂"
        ].join("\n"));
        
        CurrentPlayerAttributes.修为 += ExpFormBOSS;
        CurrentPlayerAttributes.血气 += ExpFormBOSS;
    }
    
    
    if (random < 0.1) {
    // 计算伤害
    const damage = Math.trunc(WorldBossStatus.Health * 0.35);
    TotalDamage += damage;
    WorldBossStatus.Health -= damage;
    
 e.reply([
    "【大长老的呼唤】",
    "诸世成墟，万界崩碎！",
    "大长老孟天正立于破碎的界骸之上，满身是血，",
    "帝躯残破，眼中带着无尽的悲凉：",
    "「侵我故土，杀我子弟，搅起血与火还有乱！」",
    "「诡异灭之不尽吗？我们虽然还活着，",
    "可到了这一世来，依旧没有解决大患」",
    "他以帝血为引，在虚空中镌刻染血经篇，",
    "经文燃烧，化作不灭仙光，贯穿时空长河：",
    "「孩子，你在哪里？荒，你听到了吗？」",
    "「我在呼唤你的名，你为什么还不归来？！」",
    "整片世间都寂静了瞬间！",
    "九道一也仰天悲吼：",
    "「荒天帝，你回来啊！」",
    "孟祖师声音低沉，带着无尽悲怆：",
    "「孩子，荒，你在哪里，听到我的呼唤了吗？」",
    "「在，我一直都在！」",
    "一道声音自万古前传来，震彻诸天万界！",
    "诸世外最黑暗的区域骤然灿烂，",
    "光芒穿透永恒黑暗，映照得诸天近乎透明！",
    "时空长河沸腾，一道身影踏着岁月而来，",
    "「谁在称无敌？哪个敢言不败？」",
    "「他化自在，他化万古！」",
    "荒天帝暴喝一声，施展他化自在法，登时间古今未来都断裂了，到处都是荒天帝的身影",
    "手持荒剑，剑光映照诸世生灭，",
    "一剑斩出，煌煌剑光贯穿古今未来，让过去现在未来的修士都看到了这至高一剑",
    "剑光所过之处，黑暗物质如冰雪消融！",
    `对【诡异始祖】造成${damage}点本源道伤！`,
    `【诡异始祖】身躯与元神刹那间炸开，尽管借助高原的力量复活了，但身影也虚淡了很多！`,
].join("\n"));
}
    if (random > 0.1 && random < 0.3) {
       TotalDamage += Math.trunc(WorldBossStatus.Health * 0.25);
        WorldBossStatus.Health -= Math.trunc(WorldBossStatus.Health * 0.25);
        
        e.reply([
            "【叶天帝降临】",
            "就在这危及时刻，一道拳光贯穿古今未来！",
            "「我为天帝，当镇杀世间一切敌！」",
            "叶天帝横跨诸天而来，一拳轰向诡异始祖！",
            `对【诡异始祖】造成${Math.trunc(WorldBossStatus.Health * 0.25)}伤害！`,
            `【诡异始祖】剩余${WorldBossStatus.Health}生命本源！`,
        ].join("\n"));
    } 
}

// 状态回合减少
WorldBossStatus.isAngry ? --WorldBossStatus.isAngry : 0;
WorldBossStatus.isWeak ? --WorldBossStatus.isWeak : 0;

// 状态结束后恢复基础属性
if (!WorldBossStatus.isAngry && BOSSCurrentAttack > WorldBossStatus.Attack) {
    BOSSCurrentAttack = WorldBossStatus.Attack;
}
if (!WorldBossStatus.isWeak && BOSSCurrentDefence < WorldBossStatus.Defence) {
    BOSSCurrentDefence = WorldBossStatus.Defence;
}

await sleep(1000);
PlayerRecordJSON.TotalDamage[Userid] += TotalDamage;
redis.set('gaoyuan', JSON.stringify(PlayerRecordJSON));
redis.set('guiyishizu', JSON.stringify(WorldBossStatus));
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
    `【终结大祭】`,
    `你彻底永寂诡异始祖，终结了这场席卷诸天的诡异大祭！`,
    `黑雾散尽，万界重光，芸芸众生得以重见天日！`,
    `天道有感，降下无量福泽：`,
    `获得灵石：10000000`,
    `修为提升：10000000`,
    `血气提升：10000000`,
    `在破碎的厄土高原中，你寻得以下神物：`,
    `${killerItemsMsg}`,
].join("\n"));
    
    // 更新玩家属性
    let killerPlayer = await data.getData("player", killerId);
    killerPlayer.灵石 += 10000000;
    killerPlayer.修为 += 10000000;
    killerPlayer.血气 += 10000000;
    data.setData("player", killerId, killerPlayer);
    
    // 保存击杀记录
    WorldBossStatus.KilledTime = new Date().getTime();
    redis.set('guiyishizu', JSON.stringify(WorldBossStatus));
    
    // 处理贡献排行榜奖励
    let PlayerList = await SortPlayer(PlayerRecordJSON);
    let Show_MAX = Math.min(PlayerList.length, 20); // 最多显示20名玩家
    
    let TotalDamage = PlayerList.reduce((sum, index) => sum + PlayerRecordJSON.TotalDamage[index], 0);
    
    let Rewardmsg = ["****扫平厄土高原贡献排行榜****"];
    
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
            
            let rewardMsg = `你是扫平厄土高原贡献榜第${i+1}名玩家，获得了以下物品: ${itemNames}`;
            
            
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


async function InitWorldBoss(e) {
  let AverageDamageStruct = await GetAverageDamage(e);
  let player_quantity = parseInt(AverageDamageStruct.player_quantity);
  let AverageDamage = parseInt(AverageDamageStruct.AverageDamage);
  let Reward = 6000000;
  WorldBOSSBattleLock = 0;
  
  if (player_quantity == 0) {
    e.reply("你们甚至没有仙帝以上的高手，迎战诡异始祖不是你们能参与的，继续努力再来吧！");
    return -1;
  }
  
  if (player_quantity < 5) Reward = 3000000;
  
  let X = AverageDamage * 0.2;
  e.reply(`[诡异始祖] 仙帝玩家总数：${player_quantity}`);
  e.reply(`[诡异始祖] 生成基数:${X}`);
  
  let Health = Math.trunc(X * 15000000 * player_quantity * 2);
  let Attack = Math.trunc(X * 2200000 * player_quantity * 2);
  let Defence = Math.trunc(X * 2200000 * player_quantity * 2);
  
  // ==== 修复：不要将定时器存储在状态对象中 ====
  let WorldBossStatus = {
    Health: Health,
    Healthmax: Health,
    OriginHealth: Health,
    isAngry: 0,
    isWeak: 0,
    Attack: Attack,
    Defence: Defence,
    KilledTime: -1,
    Reward: Reward * 5,
    LastActivityTime: new Date().getTime(), // 最后活动时间
  };
  
  // ==== 修复：使用全局变量管理定时器 ====
  // 清除旧定时器
  if (bossAutoCloseTimer) {
    clearTimeout(bossAutoCloseTimer);
    bossAutoCloseTimer = null;
  }
  
  // 设置新定时器
  bossAutoCloseTimer = setTimeout(async () => {
    // 检查是否还有人挑战
    const PlayerRecord = await redis.get('gaoyuan');
    if (PlayerRecord === "0") { // 没有人挑战
      await redis.del('guiyishizu');
      await redis.del('gaoyuan');
      
      // 广播关闭消息
      const groupList = await redis.sMembers('xiuxian:AuctionofficialTask_GroupList');
      for (const group_id of groupList) {
        Bot.pickGroup(group_id).sendMsg([
          "【高原沉寂】",
          "因为没有任何至高强者守护诸天,",
          "诡异始祖将诸世外界都给祭掉了，",
          "它感到无趣，重新沉入高原深处，厄土仙帝跟随始祖离去前对着现世来了一记天意一刀，将天地大道和众生万灵都针对了",
          "天地迎来了至暗的时代，黑暗大祭暂时平息，绝灵时代到来..."
        ].join("\n"));
      }
    }
  }, 24 * 60 * 60 * 1000); // 24小时
  
  let PlayerRecord = 0;
  await redis.set('guiyishizu', JSON.stringify(WorldBossStatus));
  await redis.set('gaoyuan', JSON.stringify(PlayerRecord));
  
  let msg = ' 【诸天万界公告】天地剧变！万道哀鸣！厄土高原传来不祥低语，黑色雾霭笼罩诸天！诸天为祭品，万灵为薪柴，诡异始祖自沉睡中苏醒，发动了针对诸天万界的诡异大祭！亿万宇宙化为尘埃，无数古界沦为死域！黑暗物质侵蚀时间长河，命运长河断流！仙帝染血，祭道陨落，诸天陷入至暗时刻！唯有达到仙帝境界的强者，方可踏上高原，参与这场终极决战！';
  const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';
  const groupList = await redis.sMembers(redisGlKey);
  
  // 发送广播消息
  //for (const group_id of groupList) {
  //  Bot.pickGroup(group_id).sendMsg(msg).catch(console.error);
 // }
  
  return 0;
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
    (await redis.get('guiyishizu')) &&
      (await redis.get('gaoyuan'))
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

async function GetAverageDamage(e) {
    let File = fs.readdirSync(data.filePathMap.player);
    File = File.filter(file => file.endsWith('.json'));
    let temp = [];
    let TotalPlayer = 0;
    for (var i = 0; i < File.length; i++) {
        let this_qq = File[i].replace('.json', '');
        let player = await data.getData('player', this_qq);
        
        // 添加诡异始祖条件
        if (player.mijinglevel_id > 21 && player.mijinglevel_id <= 23 ) {
            temp[TotalPlayer] = parseInt(player.攻击);
            e.reply(`[诡异始祖] ${this_qq}玩家攻击:${temp[TotalPlayer]}`);
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
async function checkAndCloseInactiveBoss() {
  if (!await BossIsAlive()) return;

  const WorldBossStatusStr = await redis.get('guiyishizu');
  if (!WorldBossStatusStr) return;

  const WorldBossStatus = JSON.parse(WorldBossStatusStr);
  const now = new Date().getTime();

  // 检查最后活动时间是否超过24小时
  if (now - WorldBossStatus.LastActivityTime > 24 * 60 * 60 * 1000) {
    // 清除全局定时器
    if (bossAutoCloseTimer) {
      clearTimeout(bossAutoCloseTimer);
      bossAutoCloseTimer = null;
    }

    await redis.del('guiyishizu');
    await redis.del('gaoyuan');

    // 触发绝灵时代惩罚 ====
    await applyJueLingEraPenalty();
    
    // 广播关闭消息
    const groupList = await redis.sMembers('xiuxian:AuctionofficialTask_GroupList');
    for (const group_id of groupList) {
      Bot.pickGroup(group_id).sendMsg([
        "【高原沉寂】",
        "因为没有任何至高强者守护诸天,",
        "诡异始祖将诸世万界都给祭掉了，",
        "它感到无趣，重新沉眠入高原深处，厄土仙帝跟随始祖离去前对着现世来了一记天意一刀，将天地大道和众生万灵都针对了",
        "天地迎来了至暗的时代，黑暗大祭暂时平息，绝灵时代到来...",
        "天地大道残缺，灵气枯竭！",
        "所有仙帝以下境界的修士境界跌落！",
        "仙路断绝，大道难求！"
      ].join("\n"));
    }
  }
}

// 绝灵时代惩罚函数
async function applyJueLingEraPenalty() {
  try {
    // 获取所有玩家文件
    const playerFiles = fs.readdirSync(data.filePathMap.player);
    const jsonFiles = playerFiles.filter(file => file.endsWith('.json'));
    
    let affectedPlayers = 0;
    
    for (const file of jsonFiles) {
      const qq = file.replace('.json', '');
      const player = await Read_player(qq);
      
      // 检查境界是否低于仙帝（mijinglevel_id < 21）
      if (player.mijinglevel_id < 21) {
        // 降低境界（确保不低于1）
        player.mijinglevel_id = Math.max(1, player.mijinglevel_id - 1);
        player.level_id = Math.max(1, player.level_id - 1);
        player.Physique_id = Math.max(1, player.Physique_id - 1);
        
        // 保存玩家数据
        await Write_player(qq, player);
        affectedPlayers++;
      }
    }
    
    console.log(`[绝灵时代] ${affectedPlayers}位玩家境界跌落`);
    return affectedPlayers;
  } catch (err) {
    console.error('应用绝灵时代惩罚失败:', err);
    return 0;
  }
}

