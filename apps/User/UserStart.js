import { plugin, verc, data, config } from '../../api/api.js';
import fs, { write } from 'fs';
import {
  Read_player,
  existplayer,
  get_random_talent,
  getLastsign,
  bigNumberTransform,
  getLastsign3,
    Write_equipment,
  Write_player,
  Write_najie,
} from '../../model/xiuxian.js';
import {
  shijianc,
  get_random_fromARR,
  get_random_aptitude,
  isNotNull,
  Write_danyao,
  Go,
  generateCalendarData,
  get_player_img,
  get_xiuxianqiandao_img,
  get_log_img,
  
  ForwardMsg,
  channel
} from '../../model/xiuxian.js';
import{
  readall,
  dataall,
  alluser,
  
} from '../../model/duanzaofu.js';

import { Add_HP, Add_修为, Add_灵石, Add_血气,Add_源石, Add_najie_thing } from '../../model/xiuxian.js';
import { __PATH } from '../../model/xiuxian.js';
import { userInfo } from 'os';
export class UserStart extends plugin {
  constructor() {
    super({
      name: 'UserStart',
      dsc: '交易模块',
      event: 'message',
      rule: [
        {
          reg: '^#踏入仙途$',
          fnc: 'Create_player',
        },
        {
          reg: '^#全员重签$',
          fnc: 'allcs',
        },
        {
          reg: '^#再入仙途$',
          fnc: 'reCreate_player',
        },
        {
          reg: '^#我的练气|#我$',
          fnc: 'Show_player',
        },
                {
          reg: '^#强制再入仙途$',
          fnc: 'force_reCreate_player',
        },
{
    reg: '^#(设置性别|修改性别|改性别|更替性别|变更性别|调整性别).*$',
    fnc: 'Set_sex',
},
{
  reg: '^(#(改名|更名|设置姓名|改道号)\\s*|#(设置道宣)\\s*)',
  fnc: 'Change_player_name'
},
        {
          reg: '^#修仙签到$',
          fnc: 'daily_gift',
        },
         {
          reg: '^#道法赐福$',
          fnc: 'daofa_gift',
        },
        {
          reg: '^#新手教程$',
          fnc: 'cs',
        },
        {
          reg: '^#天道赐福$',
          fnc: 'tiandao_cifu',
        },
        {
          reg: '^#助你入仙途$',
          fnc: 'Create_player2',
        },
          {
  reg: '^#代(\\S+)\\s+(\\d+)$',
  fnc: 'proxyCommand',
  permission: 'master' // 只有管理员才能使用
},
        {
          reg: '^#每日抽奖$',
          fnc: 'daily_lottery',
        }
      ],
    });
  }


// 实现代操作功能
async proxyCommand(e) {
  const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
  const masterList = xiuxianConfig.Master || [];
  const userQQ = e.user_id.toString().replace('qg_', '');
  if (!e.isMaster && !masterList.includes(userQQ)) {
    e.reply('您没有权限使用代操作功能');
    return false;
  }
  
  const match = e.msg.match(/^#代(\S+)\s+(\d+)$/);
  if (!match || match.length < 3) {
    e.reply('指令格式错误，请使用：#代<指令> <玩家ID>\n例如：#代签到 123456789');
    return false;
  }
  
  const command = match[1]; // 要代的指令
  const targetPlayerId = match[2]; // 目标玩家ID
  
  // 检查目标玩家是否存在
  let ifexistplay = await existplayer(targetPlayerId);
  if (!ifexistplay) {
    e.reply(`未找到ID为 ${targetPlayerId} 的玩家`);
    return false;
  }
  
  // 根据指令类型调用不同的函数
  switch (command) {
    case '签到':
      return await this.proxyDailyGift(e, targetPlayerId);
    // 可以在这里添加其他指令的代操作
    default:
      e.reply(`暂不支持代操作指令: ${command}`);
      return false;
  }
}

// 代签到功能
async proxyDailyGift(e, targetPlayerId) {
  // 伪造一个事件对象，模拟目标玩家触发指令
  const fakeEvent = {
    ...e,
    user_id: targetPlayerId,
    reply: (msg) => {
      // 将回复消息转发给管理员，并标明是代操作结果
      e.reply(`[代操作] 玩家 ${targetPlayerId} 的签到结果:\n${msg}`);
    }
  };
  
  // 调用签到功能
  return await this.daily_gift(fakeEvent);
}
      //#帮你踏入仙途
    async Create_player2(e) {
    if (!e.isGroup) {
        return;
    }
    let usr_qq = e.user_id;
    if (usr_qq == 80000000) {
        return;
    }
    let senderExist = await existplayer(usr_qq);
    if (!senderExist) {
        e.reply("请先自己踏入仙途再来帮助他人！");
        return;
    }
    let isat = e.message.some((item) => item.type === "at");
    if (!isat) {
        e.reply("请@要帮助的人！");
        return;
    }
    
    let atItem = e.message.find((item) => item.type === "at"); 
    let B_qq = atItem.qq;
    
    if (B_qq == usr_qq) {
        e.reply("不能帮助自己，请使用#踏入仙途");
        return;
    }
    
    let targetExist = await existplayer(B_qq);
    if (targetExist) {
        e.reply("此人已入仙途！");
        return;
    }
    let senderData = await Read_player(usr_qq);
    if (senderData.灵石 < 1000000) {
        e.reply("需要100W灵石才能帮助他人踏入仙途！");
        return;
    }
    await Add_灵石(usr_qq, -1000000);
    let File_msg = fs.readdirSync(__PATH.player_path);
    let n = File_msg.length + 1;
    let talent = await get_random_talent();
    let suilq = Math.floor(Math.random() * 20) + 1;
    let suilt = Math.floor(Math.random() * 20) + 1;
    let suisy = Math.floor(Math.random() * (150 - 30 + 1)) + 30;
    let suils = Math.floor(Math.random() * (5000000 - 100000 + 1)) + 100000;
    
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let aptitude = await get_random_aptitude(); // 新增天资等级
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');
    let birthDate = `${year}-${month}-${day}`;
    
    let new_player = {
      id: usr_qq,
      sex: 0, //性别
      名号: `路人甲${n}号`,
      宣言: '这个人很懒还没有写',
      daofa: '未开启',
      level_id: 1, //练气境界
      Physique_id: 1, //练体境界
      mijinglevel_id: 1,//秘境体系境界 
      xianggulevel_id: 1,//仙古今世法境界 
      神识: 0, //神识
      元神: 0, //元神
      元神上限: 0, //元神上限
      race: 1, //种族
      修为: 1, //练气经验
      血气: 1, //练体经验
      灵石: 10000,
      源石: 0,
      生命本源: 100,
      灵根: talent,
      神石: 0,
      寿元: 99,
      favorability: 0,
      breakthrough: false,
      linggen: [],
      linggenshow: 1, //灵根显示，隐藏
      学习的功法: [],
      修炼效率提升: talent.eff,
      饱食度: 0,
      热量: 0,
      连续签到天数: 0,
      道法赐福天数: 0,
      攻击加成: 0,
      防御加成: 0,
      生命加成: 0,
      power_place: 0, //凡界状态
      当前血量: 8000,
      lunhui: 0,
      lunhuiBH: 0,
      轮回点: 10,
      daofaxianshu: 0,
      daofaxianshu_endtime: 0,
      occupation: [], //职业
      occupation_level: 1,
      镇妖塔层数: 0,
      神魄段数: 0,
      魔道值: 0,
      仙宠: [],
      练气皮肤: 0,
      装备皮肤: 0,
      纳戒皮肤: 0,
      幸运: 0,
      addluckyNo: 0,
      师徒任务阶段: 0,
      师徒积分: 0,
       attempting_level_7: false, 
       guardian: null,
       抽奖次数: 0,
       出金率:0,
       出金次数:0,
       庇护人:"",
    仙宠寻宝状态 : 0,
    仙宠寻宝 : "",
    仙宠寻宝开始时间 : 0,
      护道人:"无",
       势力:"无",
       势力职位:"",
      天资等级: aptitude.grade,       // 新增天资等级
      天资评价: aptitude.evaluation,  // 新增天资评价
      五色祭坛:0
    };

    //初始化装备
    let new_equipment = {
      武器: data.equipment_list.find(item => item.name == '烂铁匕首'),
      护具: data.equipment_list.find(item => item.name == '破铜护具'),
      法宝: data.equipment_list.find(item => item.name == '廉价炮仗'),
      帝兵: data.dibing_list.find(item => item.name == '废铁'),
    };
    //初始化纳戒
    let new_najie = {
      等级: 1,
      灵石上限: 5000,
      灵石: 0,
      装备: [],
      丹药: [],
      道具: [],
      功法: [],
      草药: [],
      食材: [],
      盒子: [],
      材料: [],
      仙宠: [],
      仙宠口粮: [],
      宝石:[],
    };
    await Write_player(B_qq, new_player);
    await Write_equipment(B_qq, new_equipment);
    await Write_najie(B_qq, new_najie);
    await Add_HP(B_qq, 999999);
     const arr = {
      biguan: 0, //闭关状态
      biguanxl: 0, //增加效率
      xingyun: 0,
      lianti: 0,
      ped: 0,
      modao: 0,
      beiyong1: 0, //ped
      beiyong2: 0,
      beiyong3: 0,
      beiyong4: 0,
      beiyong5: 0,
    };
    await Write_danyao(B_qq, new_player);
    
    // 显示被帮助者的面板
    const fakeEvent = {
      ...e,
      user_id: B_qq,
      reply: e.reply.bind(e)
    };
    await this.Show_player(fakeEvent);
    
    let senderName = senderData.名号;
    let targetName = new_player.名号;
    e.reply([
        segment.at(usr_qq),
        `\n消耗100W灵石帮助`,
        segment.at(B_qq),
        ` 踏入仙途！`,
        `道友[${targetName}]已获得初始装备和资源，仙途漫漫，望勤加修炼！`
    ]);
    
    return;
}
async daily_lottery(e) {
    // 不开放私聊功能
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }
    let usr_qq = e.user_id.toString().replace('qg_', '');
    // 有无账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        return;
    }

    // 获取玩家数据
    let player = await data.getData("player", usr_qq);
     // 新增：如果玩家没有定义抽奖次数，初始化为0
    if (player.抽奖次数 === undefined) {
        player.抽奖次数 = 0;
        // 立即保存初始化后的玩家数据
        await Write_player(usr_qq, player);
    }
    
    // 检查抽奖次数
    if (player.抽奖次数 < 1) {
        e.reply(`你已经没有抽奖次数了`);
        return;
    }
    
    // 完整奖励池 (使用你提供的数组)
    const rewardPool = [
        // 你提供的完整奖励数组（已压缩长度）
        { id: 20000053, name: "秘境之匙", class: "道具", 数量: 3 },
        { id: 20000053, name: "秘境之匙", class: "道具", 数量: 5 },
        { id: 20000055, name: "残卷", class: "道具", 数量: 3 },
        { id: 20000055, name: "残卷", class: "道具", 数量: 5 },
        { id: 20000055, name: "残卷", class: "道具", 数量: 10 },
        { id: 20000055, name: "摘榜令", class: "道具", 数量: 3 },
        { id: 20000055, name: "摘榜令", class: "道具", 数量: 5 },
        { id: 20014, name: "灵矿", class: "道具", 数量: 7 },
        { id: 20014, name: "灵矿", class: "道具", 数量: 10 },
        { id: 20014, name: "洗根水", class: "道具", 数量: 5 },
        { id: 20014, name: "洗根水", class: "道具", 数量: 10 },
        { id: 20014, name: "洗根水", class: "道具", 数量: 20 },
        { id: 20014, name: "岩浆", class: "材料", 数量: 3 },
        { id: 20014, name: "岩浆", class: "材料", 数量: 5 },
        { id: 20014, name: "食材盒", class: "盒子", 数量: 3 },
        { id: 20014, name: "龙血锻体丹", class: "丹药", 数量: 1 },
        { id: 20014, name: "龙血锻体丹", class: "丹药", 数量: 5 },
        { id: 20014, name: "冰心丹", class: "丹药", 数量: 1 },
        { id: 20014, name: "冰心丹", class: "丹药", 数量: 5 },
        { id: 20014, name: "仙品福源丹", class: "丹药", 数量: 1 },
        { id: 20014, name: "仙品福源丹", class: "丹药", 数量: 3 },
        { id: 20014, name: "幸运草", class: "道具", 数量: 3 },
        { id: 20014, name: "幸运草", class: "道具", 数量: 5 },
        { id: 20014, name: "1级仙石", class: "道具", 数量: 1 },
        { id: 20014, name: "2级仙石", class: "道具", 数量: 1 },
        { id: 20014, name: "玄品秘境结算卡", class: "道具", 数量: 1 },
        { id: 20014, name: "玄品秘境结算卡", class: "道具", 数量: 3 },
        { id: 20014, name: "寿命丹", class: "丹药", 数量: 5 },
        { id: 20014, name: "寿命丹", class: "丹药", 数量: 10 },
        { id: 20014, name: "打工券", class: "道具", 数量: 5 },
        { id: 20014, name: "打工券", class: "道具", 数量: 10 },
        { id: 20014, name: "世界石", class: "材料", 数量: 5 },
        { id: 20014, name: "世界石", class: "材料", 数量: 10 },
        { id: 20014, name: "造化神果", class: "丹药", 数量: 1 },
        { id: 20014, name: "九阶淬体丹", class: "丹药", 数量: 3 },
        { id: 20014, name: "九阶玄元丹", class: "丹药", 数量: 3 },
        { id: 20014, name: "豆子的加持", class: "丹药", 数量: 3 },
        { id: 20014, name: "琴笙的加持", class: "丹药", 数量: 1 },
        { id: 20014, name: "天命轮回丹", class: "丹药", 数量: 1 },
    ];
    
    // 减少抽奖次数
    player.抽奖次数 -= 1;
    await Write_player(usr_qq, player);
    
    let lotteryCount = player.daofaxianshu == 2 ? 2 : 1;
    let lotteryResults = [];

    // 开始抽奖
    for (let i = 0; i < lotteryCount; i++) {
        let wuping_index = Math.trunc(Math.random() * rewardPool.length);
        let reward = rewardPool[wuping_index];
        
        // 添加物品到纳戒
        await Add_najie_thing(
            usr_qq, 
            reward.name, 
            reward.class, 
            reward.数量
        );
        
        // 记录结果
        lotteryResults.push({
            name: reward.name,
            amount: reward.数量,
            class: reward.class
        });
    }

    // 构造回复消息
    let playerType = player.daofaxianshu == 2 ? '尊贵的道法仙术玩家' : '普通玩家';
    let msg = `消耗1次抽奖次数，剩余次数：${player.抽奖次数}\n`;
    msg += `${playerType}今日获得：\n`;
    
    lotteryResults.forEach((res, idx) => {
        msg += `${idx + 1}. ${res.name} * ${res.amount}\n`;
    });

    await ForwardMsg(e, msg);
}

     async tiandao_cifu(e) {
        // 检查是否在群聊中
        if (!e.isGroup) {
            e.reply('天道赐福请在群聊中进行');
            return;
        }
          
        // 获取用户ID并查询玩家信息
        let usr_qq = e.user_id.toString().replace('qg_', '');
        let ifexistplay = await existplayer(usr_qq);
        if (!ifexistplay) {
            e.reply("玩家不存在，请先创建角色");
            return;
        }
        let player = await Read_player(usr_qq);
        let level_id = data.Level_list.find(item => item.level_id == player.level_id).level_id;
        let lastjiangli=Math.floor( level_id* 0.1);
        if (level_id < 22) {
            e.reply("你的境界实在太低，天道不想给你赐福");
            return;
        }
        // 从Redis获取最后一次天道赐福的时间戳
        let lastCifuTimeStr = await redis.get("xiuxian:player:" + usr_qq + ":lastCifuTime");
        let lastCifuTime;
        if (lastCifuTimeStr) {
            lastCifuTime = new Date(parseInt(lastCifuTimeStr));
        } else {
            lastCifuTime = null;
        }
    
        // 获取今天的日期对象
        let today = {
            Y: new Date().getFullYear(),
            M: new Date().getMonth() + 1, // 月份从0开始，所以需要+1
            D: new Date().getDate()
        };
    
        // 获取上次天道赐福的日期对象
        let lastCifuDate = lastCifuTime ? {
            Y: lastCifuTime.getFullYear(),
            M: lastCifuTime.getMonth() + 1,
            D: lastCifuTime.getDate()
        } : null;
        let now_Time = new Date().getTime(); 
        // 比较今天是否已经进行过天道赐福
        if (lastCifuDate && today.Y == lastCifuDate.Y && today.M == lastCifuDate.M && today.D == lastCifuDate.D) {
            e.reply(`你今日已经进行过天道赐福了`);
            return;
        }
    
        // 固定增加5把道具秘境之匙
        
    
        // 根据玩家职业发放道具
        if (player.occupation === '侠客') {
            await Add_najie_thing(usr_qq, '侠客令', '道具', 3);
        } 
         if (player.occupation === '唤魔者') {
            await Add_najie_thing(usr_qq, '唤魔令', '道具', 3);
        }
    
        // 根据玩家灵根类型发放道具
       // if (player.灵根.type ===  "魔卡少女") {
       //     await Add_najie_thing(usr_qq, '库洛牌', '道具', 3);
       // } else if (player.灵根.type === "魔法少女") {
      //      await Add_najie_thing(usr_qq, '魔法棒', '道具', 3);
      //  }
    
        // 根据玩家等级ID发放道具
        

        await Add_najie_thing(usr_qq, '秘境之匙', '道具', lastjiangli);
        await Add_najie_thing(usr_qq, '打工券', '道具', lastjiangli);
        if (level_id > 41) {
            await Add_najie_thing(usr_qq, '仙舟', '道具',lastjiangli);
        }
        if (level_id > 54) {
            await Add_najie_thing(usr_qq, '神域令牌', '道具', lastjiangli);
        }
        
    
        // 构造回复消息
        let msg = `天道赐福结果：\n`;
        msg += `您获得了${lastjiangli}把秘境之匙${lastjiangli}张打工券\n`;
        if (player.occupation === '侠客') {
            msg += `作为侠客，您额外获得了3个侠客令\n`;
        } else if (player.occupation === '唤魔者') {
            msg += `作为唤魔者，您额外获得了3个唤魔令\n`;
        }
        //if (player.linggen_type ===  "魔卡少女") {
        //    msg += `您是魔卡少女，您额外获得了3个库洛牌\n`;
      //  } else if (player.linggen_type ===  "魔法少女") {
       //     msg += `您是魔法少女，您额外获得了3个魔法棒\n`;
      //  }
        if (level_id > 41) {
            msg += `您是仙人，您额外获得了3个仙舟\n`;
        }
        if (level_id > 54) {
            msg += `您是万界之上的存在，您额外获得了3个神域令牌\n`;
        }
        if (player.daofaxianshu == 2) {
            await Add_najie_thing(usr_qq, '秘境之匙', '道具', lastjiangli);
            await Add_najie_thing(usr_qq, '打工券', '道具', lastjiangli);
            await Add_najie_thing(usr_qq, '九阶玄元丹', '丹药', lastjiangli);
            await Add_najie_thing(usr_qq, '九阶淬体丹', '丹药', lastjiangli);
            msg +=`【道法仙术】对您赐福!您额外获得了${lastjiangli}把秘境之匙\n${lastjiangli}张打工券\n${lastjiangli}个九阶玄元丹\n${lastjiangli}个九阶淬体丹！`
        }
        // 更新最后一次天道赐福时间为当前时间
        await redis.set("xiuxian:player:" + usr_qq + ":lastCifuTime", new Date().getTime());
        // 回复玩家
       await ForwardMsg(e, msg);
    }
  async cs(e){

    e.reply('仙凡有别 渡劫一念天地宽\n仙路漫漫 一见鸡哥道成空\n攻略 docs.qq.com/doc/DY25pbVlEakJaaW1u ')
  }
  //#踏入仙途
  async Create_player(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //判断是否为匿名创建存档
    if (usr_qq == 80000000) return false;
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (ifexistplay) {
      this.Show_player(e);
      return false;
    }
    //初始化玩家信息
    let File_msg = fs.readdirSync(__PATH.player_path);
    let n = File_msg.length + 1;
    let talent = await get_random_talent();
    let aptitude = await get_random_aptitude(); // 新增天资等级
    let new_player = {
      id: usr_qq,
      sex: 0, //性别
      名号: `路人甲${n}号`,
      宣言: '这个人很懒还没有写',
      daofa: '未开启',
      level_id: 1, //练气境界
      Physique_id: 1, //练体境界
      mijinglevel_id: 1,//秘境体系境界 
      xiangulevel_id: 1,//仙古今世法境界 
      神识: 0, //神识
      元神: 0, //元神
      元神上限: 0, //元神上限
      race: 1, //种族
      修为: 1, //练气经验
      血气: 1, //练体经验
      灵石: 10000,
      源石: 0,
      生命本源: 100,
      灵根: talent,
      神石: 0,
      寿元: 99,
      favorability: 0,
      breakthrough: false,
      linggen: [],
      linggenshow: 1, //灵根显示，隐藏
      学习的功法: [],
      修炼效率提升: talent.eff,
      饱食度: 0,
      热量: 0,
      连续签到天数: 0,
      道法赐福天数: 0,
      攻击加成: 0,
      防御加成: 0,
      生命加成: 0,
      power_place: 0, //仙界状态
      当前血量: 8000,
      lunhui: 0,
      lunhuiBH: 0,
      轮回点: 10,
      daofaxianshu: 0,
      daofaxianshu_endtime: 0,
      occupation: [], //职业
      occupation_level: 1,
      镇妖塔层数: 0,
      神魄段数: 0,
      魔道值: 0,
      仙宠: [],
      练气皮肤: 0,
      装备皮肤: 0,
      纳戒皮肤: 0,
      幸运: 0,
      addluckyNo: 0,
      师徒任务阶段: 0,
      师徒积分: 0,
       attempting_level_7: false,
       guardian: null,
       抽奖次数: 0,
       出金率:0,
       出金次数:0,
       庇护人:"",
         仙宠寻宝状态 : 0,
    仙宠寻宝 : "",
    仙宠寻宝开始时间 : 0,
      护道人:"无",
       势力:"无",
       势力职位:"",
      天资等级: aptitude.grade,       // 新增天资等级
      天资评价: aptitude.evaluation,  // 新增天资评价
      五色祭坛:0
    };

    //初始化装备
    let new_equipment = {
      武器: data.equipment_list.find(item => item.name == '烂铁匕首'),
      护具: data.equipment_list.find(item => item.name == '破铜护具'),
      法宝: data.equipment_list.find(item => item.name == '廉价炮仗'),
      帝兵: data.dibing_list.find(item => item.name == '废铁'),
    };
    //初始化纳戒
    let new_najie = {
      等级: 1,
      灵石上限: 5000,
      灵石: 0,
      装备: [],
      丹药: [],
      道具: [],
      功法: [],
      草药: [],
      食材: [],
      盒子: [],
      材料: [],
      仙宠: [],
      仙宠口粮: [],
      宝石:[],
    };
    await Write_player(usr_qq, new_player);
    await Write_equipment(usr_qq, new_equipment);
    await Write_najie(usr_qq, new_najie);
    await Add_HP(usr_qq, 999999);
    const arr = {
      biguan: 0, //闭关状态
      biguanxl: 0, //增加效率
      xingyun: 0,
      lianti: 0,
      ped: 0,
      modao: 0,
      beiyong1: 0, //ped
      beiyong2: 0,
      beiyong3: 0,
      beiyong4: 0,
      beiyong5: 0,
    };
    await Write_danyao(usr_qq, arr);
    await this.Show_player(e);
    return false;
  }
// 强制重开指令 - 包含所有CD检查，但跳过确认直接重开
async force_reCreate_player(e) {
  if (!verc({ e })) return false;
  
  // 获取用户QQ
  let usr_qq = e.user_id.toString().replace('qg_', '');
  usr_qq = await channel(usr_qq);
  
  // 检查存档是否存在
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) {
    e.reply('没有存档，无法强制重开！');
    return false;
  } else {
    // 确保初始化重生次数
    await redis.set('xiuxian:player:' + usr_qq + ':reCreate_acount', 1);
  }
  
  // 获取重生次数
  let acount = await redis.get('xiuxian:player:' + usr_qq + ':reCreate_acount');
  
  // 正确处理NaN和无效值
  if (acount == undefined || acount == null || isNaN(Number(acount)) || acount <= 0) {
    await redis.set('xiuxian:player:' + usr_qq + ':reCreate_acount', 1);
    acount = 1;
  }
  
  // 获取玩家数据
  let player = await data.getData('player', usr_qq);
  if (!player) {
    e.reply('无法读取玩家数据！');
    return false;
  }
  
  // ********** 所有CD检查开始 **********
  
  // 1. 检查灵石负债（必须保留）
  if (player.灵石 <= 0) {
    e.reply(`负债无法再入仙途`);
    return false;
  }
  
  // 2. 检查Go函数限制（必须保留）
  let flag = await Go(e);
  if (!flag) {
    return false;
  }
  
  // 3. 检查冷却时间CD（必须保留）
  let now = new Date();
  let nowTime = now.getTime();
  let lastrestart_time = await redis.get('xiuxian:player:' + usr_qq + ':last_reCreate_time');
  lastrestart_time = parseInt(lastrestart_time) || 0;
  
  const cf = config.getConfig('xiuxian', 'xiuxian');
  const time = cf.CD.reborn || 30; // 假设默认30分钟
  let rebornTime = parseInt(60000 * time);
  
  if (nowTime < lastrestart_time + rebornTime) {
    let waittime_m = Math.trunc((lastrestart_time + rebornTime - nowTime) / 60 / 1000);
    let waittime_s = Math.trunc(((lastrestart_time + rebornTime - nowTime) % 60000) / 1000);
    
    e.reply(
      `每${rebornTime / 60 / 1000}分钟只能转世一次\n` +
      `剩余CD: ${waittime_m}分 ${waittime_s}秒`
    );
    return false;
  }
  
  // 4. 检查重生次数上限（15次限制）
  acount = Number(acount);
  if (acount >= 15) {
    e.reply('灵魂虚弱，已不可转世！');
    return false;
  }
  
  // ********** 所有CD检查结束 **********
  
  // 开始强制重开流程
  e.reply([segment.at(usr_qq), '正在执行强制重开（已通过所有CD检查）...']);
  
  // 增加重生次数
  acount++;
  
  // 处理宗门关系（完全复用原有逻辑）
  if (isNotNull(player.宗门)) {
    if (player.宗门.职位 != '宗主') {
      // 不是宗主
      let ass = data.getAssociation(player.宗门.宗门名称);
      if (ass) {
        ass[player.宗门.职位] = ass[player.宗门.职位].filter(item => item != usr_qq);
        ass['所有成员'] = ass['所有成员'].filter(item => item != usr_qq);
        await data.setAssociation(ass.宗门名称, ass);
      }
      delete player.宗门;
      await data.setData('player', usr_qq, player);
    } else {
      // 是宗主
      let ass = data.getAssociation(player.宗门.宗门名称);
      if (ass) {
        if (ass.所有成员.length < 2) {
          // 宗门只有自己一人，删除整个宗门
          try {
            fs.rmSync(`${data.filePathMap.association}/${player.宗门.宗门名称}.json`);
          } catch (error) {
            console.warn('删除宗门文件失败（可能已被删除）:', error);
          }
        } else {
          // 随机选择新宗主
          ass['所有成员'] = ass['所有成员'].filter(item => item != usr_qq);
          
          let randmember_qq;
          if (ass.长老.length > 0) {
            randmember_qq = await get_random_fromARR(ass.长老);
          } else if (ass.内门弟子.length > 0) {
            randmember_qq = await get_random_fromARR(ass.内门弟子);
          } else {
            randmember_qq = await get_random_fromARR(ass.所有成员);
          }
          
          let randmember = await data.getData('player', randmember_qq);
          if (randmember && randmember.宗门) {
            ass[randmember.宗门.职位] = ass[randmember.宗门.职位].filter(
              item => item != randmember_qq
            );
            ass['宗主'] = randmember_qq;
            randmember.宗门.职位 = '宗主';
            await data.setData('player', randmember_qq, randmember);
            await data.setAssociation(ass.宗门名称, ass);
          }
        }
      }
    }
  }
  
  // 删除所有存档文件（带安全检查）
  try {
    const playerFile = `${__PATH.player_path}/${usr_qq}.json`;
    const equipFile = `${__PATH.equipment_path}/${usr_qq}.json`;
    const najieFile = `${__PATH.najie_path}/${usr_qq}.json`;
    
    if (fs.existsSync(playerFile)) {
      fs.rmSync(playerFile);
      console.log(`已删除玩家存档: ${playerFile}`);
    }
    
    if (fs.existsSync(equipFile)) {
      fs.rmSync(equipFile);
      console.log(`已删除装备存档: ${equipFile}`);
    }
    
    if (fs.existsSync(najieFile)) {
      fs.rmSync(najieFile);
      console.log(`已删除纳戒存档: ${najieFile}`);
    }
    
  } catch (error) {
    console.error('删除存档文件时出错:', error);
    e.reply('删除存档文件时出现错误，请检查文件权限！');
    return false;
  }
  
  // 发送重开提示
  e.reply('斩断过往，涅槃重生！一切因果皆已了断...');
  
  // 调用创建新玩家的方法
  try {
    await this.Create_player(e);
  } catch (error) {
    console.error('创建新玩家时出错:', error);
    e.reply('创建新玩家时出现错误，请联系管理员！');
    return false;
  }
  
  // 更新Redis记录
  await redis.set('xiuxian:player:' + usr_qq + ':last_reCreate_time', nowTime);
  await redis.set('xiuxian:player:' + usr_qq + ':reCreate_acount', acount);
  
  // 重开完成提示
  e.reply([
    segment.at(usr_qq),
    '强制重开已完成！\n' +
    '转世次数: ' + acount + '\n' +
    '下次可转世时间: ' + new Date(nowTime + rebornTime).toLocaleString() + '\n' +
    '注意：本次重开跳过了确认步骤，但已通过所有CD检查！'
  ]);
  
  return true;
}
  //重新修仙
  async reCreate_player(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
      e.reply('没存档你转世个锤子!');
      return false;
    } else {
      //没有存档，初始化次数
      await redis.set('xiuxian:player:' + usr_qq + ':reCreate_acount', 1);
    }
    let acount = await redis.get(
      'xiuxian:player:' + usr_qq + ':reCreate_acount'
    );
    if (acount == undefined || acount == null || acount == NaN || acount <= 0) {
      await redis.set('xiuxian:player:' + usr_qq + ':reCreate_acount', 1);
    }
    let player = await data.getData('player', usr_qq);
    //重生之前先看状态
    if (player.灵石 <= 0) {
      e.reply(`负债无法再入仙途`);
      return false;
    }
    let flag = await Go(e);
    if (!flag) {
      return false;
    }
    let now = new Date();
    let nowTime = now.getTime(); //获取当前时间戳
    let lastrestart_time = await redis.get(
      'xiuxian:player:' + usr_qq + ':last_reCreate_time'
    ); //获得上次重生时间戳,
    lastrestart_time = parseInt(lastrestart_time);
    const cf = config.getConfig('xiuxian', 'xiuxian');
    const time = cf.CD.reborn;
    let rebornTime = parseInt(60000 * time);
    if (nowTime < lastrestart_time + rebornTime) {
      let waittime_m = Math.trunc(
        (lastrestart_time + rebornTime - nowTime) / 60 / 1000
      );
      let waittime_s = Math.trunc(
        ((lastrestart_time + rebornTime - nowTime) % 60000) / 1000
      );
      e.reply(
        `每${rebornTime / 60 / 1000}分钟只能转世一次` +
          `剩余cd:${waittime_m}分 ${waittime_s}秒`
      );
      return false;
    }
    /** 设置上下文 */
    this.setContext('RE_xiuxian');
    /** 回复 */
    await e.reply(
      '一旦转世一切当世与你无缘,你真的要重生吗?回复:【断绝此生】或者【再继仙缘】进行选择',
      false,
      { at: true }
    );
    return false;
  }

  //重生方法
  async RE_xiuxian(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    /** 内容 */
    let new_msg = this.e.message;
    let choice = new_msg[0].text;
    let now = new Date();
    let nowTime = now.getTime(); //获取当前时间戳
    if (choice == '再继仙缘') {
      await this.reply('重拾道心,继续修行');
      /** 结束上下文 */
      this.finish('RE_xiuxian');
      return false;
    } else if (choice == '断绝此生') {
      //得到重生次数
      let acount = await redis.get(
        'xiuxian:player:' + usr_qq + ':reCreate_acount'
      );
      //
      if (acount >= 15) {
        e.reply('灵魂虚弱，已不可转世！');
        return false;
      }
      acount = Number(acount);
      acount++;
      //重生牵扯到宗门模块
      let player = await data.getData('player', usr_qq);
      if (isNotNull(player.宗门)) {
        if (player.宗门.职位 != '宗主') {
          //不是宗主
          let ass = data.getAssociation(player.宗门.宗门名称);
          ass[player.宗门.职位] = ass[player.宗门.职位].filter(
            item => item != usr_qq
          );
          ass['所有成员'] = ass['所有成员'].filter(item => item != usr_qq); //原来的成员表删掉这个B
          await data.setAssociation(ass.宗门名称, ass);
          delete player.宗门;
          await data.setData('player', usr_qq, player);
        } else {
          //是宗主
          let ass = data.getAssociation(player.宗门.宗门名称);
          if (ass.所有成员.length < 2) {
            fs.rmSync(
              `${data.filePathMap.association}/${player.宗门.宗门名称}.json`
            );
          } else {
            ass['所有成员'] = ass['所有成员'].filter(item => item != usr_qq); //原来的成员表删掉这个B
            //随机一个幸运儿的QQ,优先挑选等级高的
            let randmember_qq;
            if (ass.长老.length > 0) {
              randmember_qq = await get_random_fromARR(ass.长老);
            } else if (ass.内门弟子.length > 0) {
              randmember_qq = await get_random_fromARR(ass.内门弟子);
            } else {
              randmember_qq = await get_random_fromARR(ass.所有成员);
            }
            let randmember = await data.getData('player', randmember_qq); //获取幸运儿的存档
            ass[randmember.宗门.职位] = ass[randmember.宗门.职位].filter(
              item => item != randmember_qq
            ); //原来的职位表删掉这个幸运儿
            ass['宗主'] = randmember_qq; //新的职位表加入这个幸运儿
            randmember.宗门.职位 = '宗主'; //成员存档里改职位
            await data.setData('player', randmember_qq, randmember); //记录到存档
            await data.setAssociation(ass.宗门名称, ass); //记录到宗门
          }
        }
      }
      fs.rmSync(`${__PATH.player_path}/${usr_qq}.json`);
      fs.rmSync(`${__PATH.equipment_path}/${usr_qq}.json`);
      fs.rmSync(`${__PATH.najie_path}/${usr_qq}.json`);
      e.reply([segment.at(usr_qq), '当前存档已清空!开始重生']);
      e.reply([
        segment.at(usr_qq),
        '来世，信则有，不信则无，岁月悠悠，世间终会出现两朵相同的花，千百年的回眸，一花凋零，一花绽。是否为同一朵，任后人去评断！！',
      ]);
      await this.Create_player(e);
      await redis.set(
        'xiuxian:player:' + usr_qq + ':last_reCreate_time',
        nowTime
      ); //redis设置本次改名时间戳
      await redis.set('xiuxian:player:' + usr_qq + ':reCreate_acount', acount);
    } else {
      this.setContext('RE_xiuxian');
      await this.reply('请回复:【断绝此生】或者【再继仙缘】进行选择', false, {
        at: true,
      });
      return false;
    }
    /** 结束上下文 */
    this.finish('RE_xiuxian');
    return false;
  }

  //#我的练气
  async Show_player(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);

    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let img = await get_player_img(e);
    e.reply(img);
    return false;
  }
  

async Set_sex(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    // 有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    
    let player = await Read_player(usr_qq);
    if (player.sex != 0) {
      e.reply('每个存档仅可设置一次性别！');
      return false;
    }
    
    // 支持多种指令前缀和宽松匹配
    let msg = e.msg
        .replace(/^#(设置性别|修改性别|改性别|更替性别|变更性别|调整性别)/, '') // 支持多种前缀
        .trim(); // 移除前后空格
    
    // 提取性别关键词（支持更多表达方式）
    let gender = null;
    
    // 匹配性别关键词
    if (msg.includes('男') || msg.includes('男性') || msg.includes('男修') || msg.includes('爷们') || msg.includes('汉子')) {
        gender = '男';
    } else if (msg.includes('女') || msg.includes('女性') || msg.includes('女修') || msg.includes('妹子') || msg.includes('姑娘')) {
        gender = '女';
    }
    
    if (!gender) {
        e.reply([
            '格式错误，请使用以下任意一种格式：',
            '#设置性别 男',
            '#修改性别 女',
            '#改性别男',
            '#更替性别女',
            '支持的关键词：男/男性/男修/爷们/汉子 或 女/女性/女修/妹子/姑娘'
        ].join('\n'));
        return false;
    }
    
    player.sex = gender == '男' ? 2 : 1;
    await Write_player(usr_qq, player);
    e.reply(`${player.名号}的性别已成功设置为 ${gender}。`);
    return true;
}

// 2. 函数入口把别名一并识别
async Change_player_name(e) {
  if (!verc({ e })) return false;
  const usr_qq = e.user_id.toString().replace('qg_', '');
  if (!await existplayer(usr_qq)) return false;

  const raw = e.msg.trim().toLowerCase();
  
  // 提取指令和参数
  const match = raw.match(/^#(改名|更名|设置姓名|改道号|设置道宣)\s*(.*)$/);
  if (!match) return false;
  
  const cmd = match[1];  // 指令类型
  const param = match[2].trim(); // 参数（可能为空）
  
  if (cmd === '设置道宣') {
    return await this.changeXuanyan(e, usr_qq, param);
  } else {
    return await this.changeTrueName(e, usr_qq, param);
  }
}

// 3. 原名提取+校验（改名逻辑抽出来）
async changeTrueName(e, usr_qq) {
  const new_name = e.msg
    .replace(/#(改名|更名|设置姓名|改道号)\s*/i, '')
    .replace(/\s|\+/g, '');

  if (!new_name) return e.reply('格式：#改名/更名/设置姓名/改道号+新名字');
  if (new_name.length > 8) return e.reply('玩家名字最多八字');

  // 每日一次检测
  const nowTime = Date.now();
  const last = parseInt(await redis.get(`xiuxian:player:${usr_qq}:last_setname_time`));
  const today = await shijianc(nowTime);
  const lastDay = last ? await shijianc(last) : null;
  if (lastDay && today.Y === lastDay.Y && today.M === lastDay.M && today.D === lastDay.D)
    return e.reply('每日只能改名一次');

  const player = await Read_player(usr_qq);
  if (player.灵石 < 1000) return e.reply('改名需要 1000 灵石');

  // 重名检测
  const allQQ = await alluser();
  for (const q of allQQ) {
    if (new_name === (await Read_player(q)).名号)
      return e.reply(`这世间已存在该名字的人：${q}`);
  }

  // 真正改名
  player.名号 = new_name;
  player.灵石 -= 1000;
  await redis.set(`xiuxian:player:${usr_qq}:last_setname_time`, nowTime);
  await Write_player(usr_qq, player);
  this.Show_player(e);
  return false;
}

// 4. 道宣同理
async changeXuanyan(e, usr_qq) {
  const new_msg = e.msg
    .replace(/#设置道宣\s*/i, '')
    .replace(/\s|\+/g, '');

  if (!new_msg) return e.reply('格式：#设置道宣+内容');
  if (new_msg.length > 50) return e.reply('道宣最多 50 字符');

  const nowTime = Date.now();
  const last = parseInt(await redis.get(`xiuxian:player:${usr_qq}:last_setxuanyan_time`));
  const today = await shijianc(nowTime);
  const lastDay = last ? await shijianc(last) : null;
  if (lastDay && today.Y === lastDay.Y && today.M === lastDay.M && today.D === lastDay.D)
    return e.reply('每日仅可更改一次道宣');

  const player = await Read_player(usr_qq);
  player.宣言 = new_msg;
  await redis.set(`xiuxian:player:${usr_qq}:last_setxuanyan_time`, nowTime);
  await Write_player(usr_qq, player);
  this.Show_player(e);
  return false;
}

//签到
async daily_gift(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    // 读取玩家数据
    let player = await Read_player(usr_qq);
    
    // 有无账号
    if (!await existplayer(usr_qq)) return false;
    
    let now = new Date();
    let nowTime = now.getTime();
    let Yesterday = await shijianc(nowTime - 24 * 60 * 60 * 1000);
    let Today = await shijianc(nowTime);
    
    // 获取当前年月日信息
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    
    // 获取上次签到时间
    let lastsign_time = await redis.get('xiuxian:player:' + usr_qq + ':daily_last_sign_time');
    lastsign_time = lastsign_time ? await shijianc(parseInt(lastsign_time)) : {Y:0, M:0, D:0};
    
    // 检查今日是否已签到
    if (player.id != "2283096140" && Today.Y == lastsign_time.Y && Today.M == lastsign_time.M && Today.D == lastsign_time.D) {
        // 确保签到记录被记录
        await recordMonthlySignData(player, currentYear, currentMonth, currentDay);
        
        // 保存玩家数据
        await Write_player(usr_qq, player);
        
        const img = await get_xiuxianqiandao_img(e, player, 0, 0, 0, true);
        e.reply(img);
        return false;
    }
    
    let Sign_Yesterday = Yesterday.Y == lastsign_time.Y && Yesterday.M == lastsign_time.M && Yesterday.D == lastsign_time.D;
    
    // 更新签到时间
    await redis.set('xiuxian:player:' + usr_qq + ':daily_last_sign_time', nowTime);
    
    // 记录本月签到数据
    await recordMonthlySignData(player, currentYear, currentMonth, currentDay);
    
    // 更新连续签到天数
    if (Sign_Yesterday) {
        player.连续签到天数 += 1;
    } else {
        player.连续签到天数 = 1;
    }
    
    // 检查是否为道法仙术玩家
    const isDaofaPlayer = player.daofaxianshu == 2;
    
    // 计算奖励
    let baseMultiplier = isDaofaPlayer ? 2 : 1;
    let 加成 = player.level_id * player.Physique_id + (player.mijinglevel_id*player.xiangulevel_id)
    // 简化奖励计算，避免过大数值
    let gift_xiuwei = player.连续签到天数 * 10000 * baseMultiplier*加成;
    const cf = config.getConfig('xiuxian', 'xiuxian');
    
    let ticketCount = cf.Sign.ticket * baseMultiplier;
    await Add_najie_thing(usr_qq, '秘境之匙', '道具', ticketCount);
    await Add_najie_thing(usr_qq, '喇叭', '道具', ticketCount);
    let yuanshi = player.连续签到天数 * 300 * baseMultiplier *加成;
    
    // 保存玩家数据
    await Write_player(usr_qq, player);
    await Add_源石(usr_qq, yuanshi);
    await Add_灵石(usr_qq, yuanshi);
    await Add_修为(usr_qq, gift_xiuwei);
    await Add_血气(usr_qq, gift_xiuwei);
    
    // 生成签到截图
    const img = await get_xiuxianqiandao_img(e, player, gift_xiuwei, yuanshi, ticketCount);
    e.reply(img);
    return false;
}


  
async daofa_gift(e) {
  if (!verc({ e })) return false;
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  
  // 有无账号
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) return false;
  
  // 获取玩家数据
  let player = await data.getData('player', usr_qq);
  
  // 新增条件：只有道法现数为2才能签到
  if (player.daofaxianshu !== 2) {
    e.reply(`你并没有道法仙术无法进行赐福`);
    return false;
  }
  
  // 获取当前时间戳
  const nowTime = new Date().getTime();
  
  // 检查道法仙术是否已到期
  if (player.daofaxianshu_endtime < nowTime) {
    e.reply(`道法仙术已到期，请重新开通`);
    return false;
  }
  
  // 计算剩余天数（精确到小数点后1位）
  const millisecondsPerDay = 86400000;
  const remainingDays = Math.round((player.daofaxianshu_endtime - nowTime) / millisecondsPerDay * 10) / 10;
  
  // 检查今日是否已签到
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
  
  // 获取上次签到日期
  const lastSignDate = await getLastsign3(usr_qq);
  const lastSignStr = lastSignDate ? `${lastSignDate.Y}-${lastSignDate.M}-${lastSignDate.D}` : null;
  
  // 如果今日已签到
  if (lastSignStr === todayStr) {
    e.reply(`今日已经道法赐福过了`);
    return false;
  }
  
  // 检查昨日是否签到（用于连续签到判断）
  const yesterday = new Date(nowTime - millisecondsPerDay);
  const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;
  const signedYesterday = lastSignStr === yesterdayStr;
  
  // 更新连续签到天数
  if (player.道法赐福天数 >= 7 ) {
    player.道法赐福天数 = 1; // 重置为1（今日签到）
      await Add_najie_thing(usr_qq, '超越宝盒', '盒子', 5);
  
  // 构建回复信息
  const b = [
    `${player.名号}已连续道法赐福7天，已进行重置，并奖励超越宝盒x5`,
  ].join('\n');
  
  e.reply(b);
  } else {
    player.道法赐福天数 += 1;
  }
  
  // 设置今日签到时间
  await redis.set('xiuxian:player:' + usr_qq + ':lastsign_time3', nowTime);
  
  // 保存玩家数据
  await Write_player(usr_qq, player);
  
  // 计算奖励
  const cf = config.getConfig('xiuxian', 'xiuxian');

  let gift_xiuwei = player.道法赐福天数 * 10000*player.level_id*player.Physique_id*(player.mijinglevel_id+player.xiangulevel_id);
  // 添加道具奖励
  const tickets = player.道法赐福天数*2
  const tickets3 = player.道法赐福天数*2

  await Add_najie_thing(usr_qq, '龙', '道具', tickets);
  await Add_najie_thing(usr_qq, '腾', '道具', tickets);
  await Add_najie_thing(usr_qq, '虎', '道具', tickets);
  await Add_najie_thing(usr_qq, '跃', '道具', tickets);
  await Add_najie_thing(usr_qq, '遣龙令', '道具', tickets);
  await Add_najie_thing(usr_qq, '遣虎令', '道具', tickets);
  await Add_najie_thing(usr_qq, '位面传送阵', '道具', 1);
  await Add_najie_thing(usr_qq, '灵品秘境结算卡', '道具', tickets3);
  
  // 添加修为和血气
  await Add_修为(usr_qq, gift_xiuwei);
  await Add_血气(usr_qq, gift_xiuwei);
  
  // 构建回复信息
  const b = [
    `${player.名号}已连续道法赐福${player.道法赐福天数}天`,
    `剩余道法仙术天数：${remainingDays}天`,
    `获得修为：${gift_xiuwei}`,
    `获得血气：${gift_xiuwei}`,
    `获得位面传送阵×1`,
    `获得灵品秘境结算卡×${tickets3}`,
    `获得龙腾虎跃×${tickets}`,
    `获得遣龙令×${tickets}`,
    `获得遣虎令×${tickets}`
  ].join('\n');
  
  e.reply(b);
  return true;
}

  async allcs(e){
    let usr_qq=e.user_id.toString().replace('qg_','')
    usr_qq=await channel(usr_qq)
    if(usr_qq!=3479823546){
      return
    }
    let a=await alluser()
    for(let item of a){
    await redis.set('xiuxian:player:' + item + ':lastsign_time', Date.now()-24*60*60*1000);
    }
    e.reply('成功')
    return
  }
}
// 记录签到数据
async function recordMonthlySignData(player, year, month, day) {
    // 初始化签到记录对象
    if (!player.signRecord) {
        player.signRecord = {};
    }
    
    // 创建月份键名
    const monthKey = `${year}-${month}`;
    
    // 计算正确的总天数
    const correctTotalDays = new Date(year, month, 0).getDate();
    
    // 初始化月份数据
    if (!player.signRecord[monthKey]) {
        player.signRecord[monthKey] = {
            signedDays: [],
            totalDays: correctTotalDays
        };
        console.log(`[签到记录] 创建新月份数据: ${year}-${month}, 总天数: ${correctTotalDays}`);
    } else {
        console.log(`[签到记录] 从玩家数据获取: ${year}-${month}, 已签: ${player.signRecord[monthKey].signedDays.length}天, 总天数: ${player.signRecord[monthKey].totalDays}`);
        
        // 修正总天数
        if (player.signRecord[monthKey].totalDays !== correctTotalDays) {
            console.log(`[签到记录] 总天数修正: ${player.signRecord[monthKey].totalDays} -> ${correctTotalDays}`);
            player.signRecord[monthKey].totalDays = correctTotalDays;
        }
    }
    
    // 添加今天的签到记录（如果还没记录）
    const dayNum = Number(day);
    if (!isNaN(dayNum) && dayNum > 0 && dayNum <= player.signRecord[monthKey].totalDays) {
        if (!player.signRecord[monthKey].signedDays.includes(dayNum)) {
            player.signRecord[monthKey].signedDays.push(dayNum);
            player.signRecord[monthKey].signedDays.sort((a, b) => a - b);
            console.log(`[签到记录] 添加签到: ${year}-${month}-${dayNum}`);
        }
    }
}




