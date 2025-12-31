import {
  plugin,
  puppeteer,
  verc,
  data,
  config,
  Show,
} from '../../api/api.js';
import {
  Read_player,
  existplayer,
  Write_player,
  Write_linggen,
  isNotNull,
  add_qinmidu,
  fstadd_qinmidu,
  Add_najie_thing,
  find_qinmidu,
  exist_hunyin,
  exist_najie_thing,
  Go,
  setu,
  channel
} from '../../model/xiuxian.js';
import { Add_灵石, Add_修为 } from '../../model/xiuxian.js';
let gane_key_user = []; //怡红院限制
var yazhu = []; //投入
let gametime = []; //临时游戏CD
export class Games extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_Games',
      dsc: '修仙模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#怡红院$',
          fnc: 'Xiuianplay',
        },
        // {
        //   reg: '^#金银坊$',
        //   fnc: 'Moneynumber',
        // },
        // {
        //   reg: '^#(梭哈)|(投入.*)$',
        //   fnc: 'Moneycheck',
        // },
        {
          reg: '^(大|小)$',
          fnc: 'Moneycheckguess',
        },
        // {
        //   reg: '^#金银坊记录$',
        //   fnc: 'Moneyrecord',
        // },
        {
          reg: '^双修$',
          fnc: 'Couple',
        },
        {
          reg: '^#源石坊$',
          fnc: 'StoneMarket',
        },
        {
          reg: '^#源石坊记录$',
          fnc: 'StoneRecord',
        },
        {
          reg: "^(1|2|3)$",
          fnc: "StoneChoice",
          log: false
        },
        {
          reg: '^#拒绝双修$',
          fnc: 'Refusecouple',
        },
        {
          reg: '^#允许双修$',
          fnc: 'Allowcouple',
        },
        {
          reg: '^#召唤如梦道祖$',
          fnc: 'rumeng',
        },
        {
          reg: '^(请教修行|求取道法|论道古今)$',
          fnc: 'rumengChoice',
        },
      ],
    });
  }

async rumeng(e) {
    if (!verc({ e })) return false;
    
    // 处理QQ号
    const rawQQ = e.user_id.toString().replace('qg_', '');
    const usr_qq = (await channel(rawQQ)).toString();
    
    // 检查玩家是否存在
    if (!await existplayer(usr_qq)) {
        return e.reply('玩家数据不存在');
    }
    
    // 检查如梦道痕
    const rumengCount = await exist_najie_thing(usr_qq, '如梦道痕', '道具');
    
    if (!rumengCount || rumengCount < 1) {
        return e.reply([
            `【道痕缺失】`,
            `你欲联系如梦道祖，却寻不见如梦道痕！`,
            `虚空传来道音：`,
            `"无如梦道痕者，不得扰本祖清修！"`,
            `提示：`,
            `- 需持有「如梦道痕」方可联系道祖`,
            `- 可通过特殊机缘获得此物`
        ].join('\n'));
    }
    
    // 扣除道痕
    await Add_najie_thing(usr_qq, '如梦道痕', '道具', -1);
    
    // 构建道祖回应
    const daozuText = [
        `【如梦道祖】`,
        `虚空泛起涟漪，一道朦胧身影显化！`,
        `如梦道祖眸光如星海流转：`,
        `"小友何事寻我？"`,
        `提示：`,
        `- 可向道祖请教修行疑难`,
        `- 或求取如梦道法传承`,
        `回复选项：`,
        `请教修行`,
        `求取道法`,
        `论道古今`,
    ].join('\n');
    
    // 设置道祖对话状态
    const player = await Read_player(usr_qq);
    player.如梦道祖对话 = true;
    await Write_player(usr_qq, player);
    
    return e.reply(daozuText);
}
// 处理道祖对话选择
 async rumengChoice(e) {
    if (!verc({ e })) return false;
    
    const rawQQ = e.user_id.toString().replace('qg_', '');
    const usr_qq = (await channel(rawQQ)).toString();
    
    // 检查玩家是否存在
    if (!await existplayer(usr_qq)) {
        return e.reply('玩家数据不存在');
    }
    
    const player = await Read_player(usr_qq);
    const choice = e.msg.trim();
    
    if (!player.如梦道祖对话) {
        return true; // 不是道祖对话状态，交给其他插件处理
    }
    
    // 清除状态避免重复触发
    player.如梦道祖对话 = false;
    await Write_player(usr_qq, player);
    
    // 处理不同选择
    switch(choice) {
        case '请教修行':
            return this.handleCultivation(e, usr_qq);
        case '求取道法':
            return this.handleRequestTechnique(e, usr_qq);
        case '论道古今':
            return this.handleDiscussDao(e, usr_qq);
        default:
            return e.reply('请选择有效选项：请教修行、求取道法、论道古今');
    }
  }

  // 处理请教修行
  async handleCultivation(e, usr_qq) {
    const player = await Read_player(usr_qq);
    

    const gain = Math.floor(Math.random() * 1000000000) + 1500000;
    
    player.修为 += gain;
    player.血气 += Math.floor(gain * 0.8);
    await Write_player(usr_qq, player);
    
    return e.reply([
        `【道祖点化】`,
        `如梦道祖一指轻点，一道九彩流光融入你识海！`,
        `你神游太虚，见证星河生灭，顿悟修行至理`,
        `体内灵力奔腾如江海，境界壁垒轰然破碎`,
        `修为暴涨：${gain.toLocaleString()}`,
        `血气增强：${Math.floor(gain * 0.8).toLocaleString()}`,
        `道祖言："修行之路，贵在明心见性"`,
        `"望你勤修不辍，早日证得大道！"`
    ].join('\n'));
  }

  // 处理求取道法
  async handleRequestTechnique(e, usr_qq) {
    const daofaList = [
        {name: '如梦令',class: '功法',  type: '道与法', desc: '可编织梦境，化虚为实'},
        {name: '大梦千秋',class: '功法', type: '道与法', desc: '一梦千年，感悟大道真谛'},
        {name: '浮生若梦',class: '功法', type: '道与法', desc: '虚实转换，幻化万千'},
    ];
    
    const randomIndex = Math.floor(Math.random() * daofaList.length);
    const technique = daofaList[randomIndex];
    
    await Add_najie_thing(usr_qq, technique.name, technique.class, 1);
    
    return e.reply([
        `【道法传承】`,
        `如梦道祖袖中飞出一卷道书，`,
        `书页无风自动，浮现玄奥道纹`,
        `道祖言："此乃《${technique.name}》，`,
        `为我早年所创，今日便传于你"`,
        `获得：【${technique.name}】`,
        `类型：${technique.type}`,
        `描述：${technique.desc}`,
        `提示：可在纳戒中查看并使用`
    ].join('\n'));
  }

  // 处理论道古今
  async handleDiscussDao(e, usr_qq) {
    const loreTexts = [
        `"梦非梦，醒非醒，真作假时假亦真，无为有处有还无！"`,
        `"世间万物，皆如梦幻泡影，唯道永恒！"`,
        `"一花一世界，一梦一轮回，你怎知此刻非梦中？"`,
        `"修行千年，方知大梦一场，然梦中亦可证道！"`,
        `"昔年我观庄周梦蝶，顿悟虚实大道，创如梦仙诀"`
    ];
    
    const insights = [
        '你心有所悟，道心更加通透',
        '你识海中道音回荡，境界隐隐松动',
        '你感悟到时空真谛，遁法有所精进',
        '你对虚实之道的理解更加深刻',
        '你神魂凝练，神识范围扩大三成'
    ];
    
    const randomText = loreTexts[Math.floor(Math.random() * loreTexts.length)];
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    
    // 随机增加少量修为
    const gain = Math.floor(Math.random() * 10000000000) + 1500000;
    await Add_修为(usr_qq, gain);
    
    return e.reply([
        `【论道古今】`,
        `你与如梦道祖对坐论道，`,
        `四周演化星河生灭、世界轮回之景`,
        `三日三夜，不觉时光流逝`,
        `道祖言：`,
        `${randomText}`,
        `${randomInsight}`,
        `修为增加：${gain.toLocaleString()}`,
        `道祖身影渐淡："缘起缘灭，好自为之..."`
    ].join('\n'));
  }

// 源石坊功能
async StoneMarket(e) {
  if (!verc({ e })) return false;
  const cf = config.getConfig('xiuxian', 'xiuxian');
  
  // 源石坊开关
  let stoneSwitch = cf.switch.StoneMarket;
  if (!stoneSwitch) return false;
  
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  
  // 检查玩家是否被禁止进入
  const banTime = await redis.get(`xiuxian:player:${usr_qq}:stone_ban_time`);
  if (banTime && Date.now() < parseInt(banTime)) {
    const remain = parseInt(banTime) - Date.now();
    const hours = Math.floor(remain / 3600000);
    const minutes = Math.floor((remain % 3600000) / 60000);
    e.reply(`源石坊老板：你切出太多宝物，本店要破产了！请${hours}小时${minutes}分钟后再来`);
    return false;
  }
  
  // 检查玩家状态
  let flag = await Go(e);
  if (!flag) return false;
  
  // 获取玩家信息
  let player = data.getData('player', usr_qq);
  let now_time = new Date().getTime();
  
  // 源石坊CD检查
  let last_stone_time = await redis.get(`xiuxian:player:${usr_qq}:last_stone_time`);
  last_stone_time = parseInt(last_stone_time) || 0;
  
  const stoneCD = cf.CD.stone_market * 60000; // 分钟转毫秒
  if (now_time < last_stone_time + stoneCD) {
    const remain = last_stone_time + stoneCD - now_time;
    const minutes = Math.floor(remain / 60000);
    const seconds = Math.floor((remain % 60000) / 1000);
    e.reply(`源石坊切石需调息养神，请${minutes}分${seconds}秒后再来`);
    return false;
  }
  
  // 源石等级和价格配置
  const stoneLevels = cf.stone_levels || [
    { name: "普通源石", price: 50000, quality: 1 },
    { name: "精品源石", price: 200000, quality: 2 },
    { name: "神源石", price: 1000000, quality: 3 }
  ];
  
  // 检查灵石是否足够购买最便宜的源石
  const minPrice = Math.min(...stoneLevels.map(l => l.price));
  if (player.灵石 < minPrice) {
    e.reply(`源石坊管事：区区${player.灵石}灵石也想赌石？至少需要${minPrice}灵石！`);
    return false;
  }
  
  // 生成选择菜单
  let menu = "源石坊管事：请选择源石等级（回复编号）：\n";
  stoneLevels.forEach((level, index) => {
    menu += `${index + 1}. ${level.name} - ${level.price}灵石\n`;
  });
  
  e.reply(menu);
  
  // 记录玩家进入源石坊状态
  await redis.set(`xiuxian:player:${usr_qq}:stone_action`, "choosing");
  await redis.set(`xiuxian:player:${usr_qq}:last_stone_time`, now_time);
  
  return true;
}

async StoneChoice(e) {
  if (!verc({ e })) return false;
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  
  // 检查玩家状态
  const action = await redis.get(`xiuxian:player:${usr_qq}:stone_action`);
  if (action !== "choosing") return false;
  
  // 获取配置
  const cf = config.getConfig('xiuxian', 'xiuxian');
  // 使用默认配置防止undefined
  const stoneLevels = cf.stone_levels || [
    { name: "普通源石", price: 50000, quality: 1 },
    { name: "精品源石", price: 200000, quality: 2 },
    { name: "神源石", price: 1000000, quality: 3 }
  ];
  
  const choice = parseInt(e.msg);
  
  if (isNaN(choice) || choice < 1 || choice > stoneLevels.length) {
    e.reply("请选择有效的源石编号");
    return false;
  }
  
  const selectedStone = stoneLevels[choice - 1];
  const player = data.getData('player', usr_qq);
  
  // 检查灵石是否足够
  if (player.灵石 < selectedStone.price) {
    e.reply(`灵石不足！购买${selectedStone.name}需要${selectedStone.price}灵石`);
    await redis.del(`xiuxian:player:${usr_qq}:stone_action`);
    return false;
  }
  
  // 扣除灵石
  player.灵石 -= selectedStone.price;
  data.setData('player', usr_qq, player);
  
  // 进行赌石
  const result = await cutStone(selectedStone, player, usr_qq);

  // 发送结果
  e.reply(result.message);
  await Write_player(usr_qq, player);
  // 更新玩家记录
  if (result.win) {
    player.源石坊胜场 = (player.源石坊胜场 || 0) + 1;
    player.源石坊收入 = (player.源石坊收入 || 0) + result.value;
    
    // 记录高级奖励次数
    if (result.isHighReward) {
      const highRewardCount = (player.源石坊高级奖励次数 || 0) + 1;
      player.源石坊高级奖励次数 = highRewardCount;
      
      // 如果连续获得3次高级奖励，禁止进入24小时
      if (highRewardCount >= 3) {
        const banTime = Date.now() + 24 * 3600000; // 24小时
        await redis.set(`xiuxian:player:${usr_qq}:stone_ban_time`, banTime);
        e.reply("\n源石坊老板：你切出太多宝物，本店要破产了！请24小时后再来");
        player.源石坊高级奖励次数 = 0; // 重置计数
      }
    } else {
      // 非高级奖励时重置计数
      player.源石坊高级奖励次数 = 0;
    }
  } else {
    player.源石坊败场 = (player.源石坊败场 || 0) + 1;
    player.源石坊支出 = (player.源石坊支出 || 0) + selectedStone.price;
    // 失败时重置高级奖励计数
    player.源石坊高级奖励次数 = 0;
  }
  
  data.setData('player', usr_qq, player);
  await redis.del(`xiuxian:player:${usr_qq}:stone_action`);
  
  return true;
}



// 源石坊记录查询
async StoneRecord(e) {
  if (!verc({ e })) return false;
  let qq = e.user_id.toString().replace('qg_','');
  qq = await channel(qq);
  
  const player = data.getData('player', qq);
  const win = player.源石坊胜场 || 0;
  const lose = player.源石坊败场 || 0;
  const income = player.源石坊收入 || 0;
  const expend = player.源石坊支出 || 0;
  const highRewards = player.源石坊高级奖励次数 || 0;
  
  const total = win + lose;
  const winRate = total > 0 ? ((win / total) * 100).toFixed(2) : 0;
  const profit = income - expend;
  
  const recordMsg = [
    `【${player.名号}源石坊战绩】`,
    `职业：${player.occupation || "无"}`,
    `切石次数：${total}次`,
    `胜场：${win}次`,
    `败场：${lose}次`,
    `胜率：${winRate}%`,
    `高级奖励次数：${highRewards}次`,
    `总收入：${income}灵石`,
    `总支出：${expend}灵石`,
    `净收益：${profit}灵石`
  ].join("\n");
  
  e.reply(recordMsg);
  return true;
}
  async Refusecouple(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let player = await Read_player(usr_qq);
    await redis.set('xiuxian:player:' + usr_qq + ':couple', 1);
    e.reply(player.名号 + '开启了拒绝模式');
    return false;
  }

  async Allowcouple(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let player = await Read_player(usr_qq);
    await redis.set('xiuxian:player:' + usr_qq + ':couple', 0);
    e.reply(player.名号 + '开启了允许模式');
    return false;
  }

  //怡红院
  async Xiuianplay(e) {
    if (!verc({ e })) return false;
    const cf = config.getConfig('xiuxian', 'xiuxian');
    let switchgame = cf.switch.play;
    if (switchgame != true) {
      return false;
    }
    //统一用户ID名
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //全局状态判断
    //得到用户信息
    let player = await Read_player(usr_qq);
    let now_level_id;
    if (!isNotNull(player.level_id)) {
      e.reply('请先#同步信息');
      return false;
    }
    let flag = await Go(e);
    if (!flag) {
      return false;
    }
    now_level_id = data.Level_list.find(
      item => item.level_id == player.level_id
    ).level_id;
    //用id当作收益用
    //收益用
    var money = now_level_id * 1000;
    //如果是渡劫期。大概收益用为33*1000=3.3w
    //为防止丹药修为报废，这个收益要成曲线下降
    //得到的修为
    //先是1:1的收益
    var addlevel;
    //到了结丹中期收益变低
    //都不是凡人了，还天天祸害人间？
    if (now_level_id < 10) {
      addlevel = money;
    } else {
      addlevel = (9 / now_level_id) * money;
    }
    //随机数
    var rand = Math.random();
    var ql1 =
      "门口的大汉粗鲁的将你赶出来:'哪来的野小子,没钱还敢来学人家公子爷寻欢作乐?' 被人看出你囊中羞涩,攒到";
    var ql2 = '灵石再来吧！';
    if (player.灵石 < money) {
      e.reply(ql1 + money + ql2);
      return false;
    }
    //加修为
    if (rand < 0.5) {
      let randexp = 90 + parseInt(Math.random() * 20);
      e.reply(
        '花费了' +
          money +
          '灵石,你好好放肆了一番,奇怪的修为增加了' +
          randexp +
          '!在鱼水之欢中你顿悟了,修为增加了' +
          addlevel +
          '!'
      );
      await Add_修为(usr_qq, addlevel);
      await Add_灵石(usr_qq, -money);
      let gameswitch = cf.switch.Xiuianplay_key;
      if (gameswitch == true) {
        setu(e);
      }
      return false;
    }
    //被教训
    else if (rand > 0.7) {
      await Add_灵石(usr_qq, -money);
      ql1 = '花了';
      ql2 =
        '灵石,本想好好放肆一番,却赶上了扫黄,无奈在衙门被教育了一晚上,最终大彻大悟,下次还来！';
      e.reply([segment.at(usr_qq), ql1 + money + ql2]);
      return false;
    }
    //被坑了
    else {
      await Add_灵石(usr_qq, -money);
      ql1 =
        '这一次，你进了一个奇怪的小巷子，那里衣衫褴褛的漂亮姐姐说要找你玩点有刺激的，你想都没想就进屋了。\n';
      ql2 =
        '没想到进屋后不多时遍昏睡过去。醒来发现自己被脱光扔在郊外,浑身上下只剩一条裤衩子了。仰天长啸：也不过是从头再来！';
      e.reply([segment.at(usr_qq), ql1 + ql2]);
      return false;
    }
  }

  //金银坊
  async Moneynumber(e) {
    if (!verc({ e })) return false;
    const cf = config.getConfig('xiuxian', 'xiuxian');
    //金银坊开关
    let gameswitch = cf.switch.Moneynumber;
    if (gameswitch != true) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let flag = await Go(e);
    if (!flag) return false;
    //用户信息查询
    let player = data.getData('player', usr_qq);
    let now_time = new Date().getTime();
    var money = 10000;
    //判断灵石
    if (player.灵石 < money) {
      //直接清除，并记录
      //重新记录本次时间
      await redis.set('xiuxian:player:' + usr_qq + ':last_game_time', now_time); //存入缓存
      //清除游戏状态
      await redis.set('xiuxian:player:' + usr_qq + ':game_action', 1);
      //清除未投入判断
      //清除金额
      yazhu[usr_qq] = 0;
      //清除游戏定时检测CD
      clearTimeout(gametime[usr_qq]);
      e.reply('媚娘：钱不够也想玩？');
      return false;
    }
    //设置
    var time = cf.CD.gambling; //
    //获取当前时间
    //最后的游戏时间
    //last_game_time
    //获得时间戳
    let last_game_time = await redis.get(
      'xiuxian:player:' + usr_qq + ':last_game_time'
    );
    last_game_time = parseInt(last_game_time);
    let transferTimeout = parseInt(60000 * time);
    if (now_time < last_game_time + transferTimeout) {
      let game_m = Math.trunc(
        (last_game_time + transferTimeout - now_time) / 60 / 1000
      );
      let game_s = Math.trunc(
        ((last_game_time + transferTimeout - now_time) % 60000) / 1000
      );
      e.reply(
        `每${transferTimeout / 1000 / 60}分钟游玩一次。` +
          `cd: ${game_m}分${game_s}秒`
      );
      //存在CD。直接返回
      return false;
    }
    //记录本次执行时间
    await redis.set('xiuxian:player:' + usr_qq + ':last_game_time', now_time);
    //判断是否已经在进行
    let game_action = await redis.get(
      'xiuxian:player:' + usr_qq + ':game_action'
    );
    //为0，就是在进行了
    if (game_action == 0) {
      //在进行
      e.reply(`媚娘：猜大小正在进行哦!`);
      return false;
    }
    //不为0   没有参与投入和梭哈
    e.reply(`媚娘：发送[#投入+数字]或[#梭哈]`, true);
    //写入游戏状态为真-在进行了
    await redis.set('xiuxian:player:' + usr_qq + ':game_action', 0);
    return false;
  }

  //这里冲突了，拆函数！
  //梭哈|投入999
  async Moneycheck(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //获取当前时间戳
    let now_time = new Date().getTime();
    //文档
    let ifexistplay = await existplayer(usr_qq);
    //得到此人的状态
    //判断是否是投入用户
    let game_action = await redis.get(
      'xiuxian:player:' + usr_qq + ':game_action'
    );
    if (!ifexistplay || game_action == 1) {
      //不是就返回
      return false;
    }
    //梭哈|投入999。如果是投入。就留下999
    let es = e.msg.replace('#投入', '').trim();
    //去掉投入，发现得到的是梭哈
    //梭哈，全部灵石
    if (es == '#梭哈') {
      let player = await Read_player(usr_qq);
      //得到投入金额
      yazhu[usr_qq] = player.灵石 - 1;
      e.reply('媚娘：梭哈完成,发送[大]或[小]');
      return false;
    }
    //不是梭哈，看看是不是数字
    //判断是不是输了个数字，看看投入多少
    if (parseInt(es) == parseInt(es)) {
      let player = await Read_player(usr_qq);
      //判断灵石
      if (player.灵石 >= parseInt(es)) {
        //得到投入数
        yazhu[usr_qq] = parseInt(es);
        //这里限制一下，至少押1w
        var money = 10000;
        //如果投入的数大于0
        if (yazhu[usr_qq] >= money) {
          //如果押的钱不够
          //值未真。并记录此人信息
          gane_key_user[usr_qq];
          e.reply('媚娘：投入完成,发送[大]或[小]');
          return false;
        } else {
          //直接清除，并记录
          //重新记录本次时间
          await redis.set(
            'xiuxian:player:' + usr_qq + ':last_game_time',
            now_time
          ); //存入缓存
          //清除游戏状态
          await redis.set('xiuxian:player:' + usr_qq + ':game_action', 1);
          //清除未投入判断
          //清除金额
          yazhu[usr_qq] = 0;
          //清除游戏定时检测CD
          clearTimeout(gametime[usr_qq]);
          e.reply('媚娘：钱不够也想玩？');
          return false;
        }
      }
    }
    return false;
  }

  //大|小
  async Moneycheckguess(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //获取当前时间戳
    let now_time = new Date().getTime();
    //文档
    let ifexistplay = await existplayer(usr_qq);
    //得到此人的状态
    //判断是否是投入用户
    let game_action = await redis.get(
      'xiuxian:player:' + usr_qq + ':game_action'
    );
    if (!ifexistplay || game_action == 1) {
      //不是就返回
      return false;
    }
    if (isNaN(yazhu[usr_qq])) {
      return false;
    }
    //判断是否投入金额
    //是对应的投入用户。
    //检查此人是否已经投入
    if (!gane_key_user) {
      e.reply('媚娘：公子，你还没投入呢');
      return false;
    }
    let player = await Read_player(usr_qq);
    let es = e.msg;
    //随机数并取整【1，7）
    let randtime = Math.trunc(Math.random() * 6) + 1;
    //点子
    let touzi;
    var n;
    //防止娶不到整，我们自己取
    for (n = 1; n <= randtime; n++) {
      //是1.111就取1 --是2.0就取到2。没有7.0是不可能取到7的。也就是得到6
      //随机并取整
      touzi = n;
    }
    //发送固定点数的touzi
    e.reply(segment.dice(touzi));
    const cf = config.getConfig('xiuxian', 'xiuxian');
    //你说大，touzi是大。赢了
    if ((es == '大' && touzi > 3) || (es == '小' && touzi < 4)) {
      //赢了
      //获奖倍率
      var x = cf.percentage.Moneynumber;
      var y = 1;
      var z = cf.size.Money * 10000;
      //增加金银坊投资记录
      //投入大于一百万
      if (yazhu[usr_qq] >= z) {
        //扣一半的投入
        x = cf.percentage.punishment;
        //并提示这是被扣了一半
        y = 0;
      }
      yazhu[usr_qq] = Math.trunc(yazhu[usr_qq] * x);
      //金库
      //获得灵石超过100w
      //积累
      if (isNotNull(player.金银坊胜场)) {
        player.金银坊胜场 = parseInt(player.金银坊胜场) + 1;
        player.金银坊收入 =
          parseInt(player.金银坊收入) + parseInt(yazhu[usr_qq]);
      } else {
        player.金银坊胜场 = 1;
        player.金银坊收入 = parseInt(yazhu[usr_qq]);
      }
      //把记录写入
      data.setData('player', usr_qq, player);
      //得到的
      Add_灵石(usr_qq, yazhu[usr_qq]);
      if (y == 1) {
        e.reply([
          segment.at(usr_qq),
          `骰子最终为 ${touzi} 你猜对了！`,
          '\n',
          `现在拥有灵石:${player.灵石 + yazhu[usr_qq]}`,
        ]);
      } else {
        e.reply([
          segment.at(usr_qq),
          `骰子最终为 ${touzi} 你虽然猜对了，但是金银坊怀疑你出老千，准备打断你的腿的时候，你选择破财消灾。`,
          '\n',
          `现在拥有灵石:${player.灵石 + yazhu[usr_qq]}`,
        ]);
      }
      //重新记录本次时间
      await redis.set('xiuxian:player:' + usr_qq + ':last_game_time', now_time); //存入缓存
      //清除游戏状态
      await redis.set('xiuxian:player:' + usr_qq + ':game_action', 1);
      //清除未投入判断
      //清除金额
      yazhu[usr_qq] = 0;
      //清除游戏CD
      clearTimeout(gametime[usr_qq]);
      return false;
    }
    //你说大，但是touzi<4,是输了
    else if ((es == '大' && touzi < 4) || (es == '小' && touzi > 3)) {
      //输了
      //增加金银坊投资记录
      if (isNotNull(player.金银坊败场)) {
        player.金银坊败场 = parseInt(player.金银坊败场) + 1;
        player.金银坊支出 =
          parseInt(player.金银坊支出) + parseInt(yazhu[usr_qq]);
      } else {
        player.金银坊败场 = 1;
        player.金银坊支出 = parseInt(yazhu[usr_qq]);
      }
      //把记录写入
      data.setData('player', usr_qq, player);
      //只要花灵石的地方就要查看是否存在游戏状态
      Add_灵石(usr_qq, -yazhu[usr_qq]);
      let msg = [
        segment.at(usr_qq),
        `骰子最终为 ${touzi} 你猜错了！`,
        '\n',
        `现在拥有灵石:${player.灵石 - yazhu[usr_qq]}`,
      ];
      let now_money = player.灵石 - yazhu[usr_qq];
      //重新记录本次时间
      await redis.set('xiuxian:player:' + usr_qq + ':last_game_time', now_time); //存入缓存
      //清除游戏状态
      await redis.set('xiuxian:player:' + usr_qq + ':game_action', 1);
      //清除未投入判断
      //清除金额
      yazhu[usr_qq] = 0;
      //清除游戏CD
      clearTimeout(gametime[usr_qq]);
      //如果扣了之后，钱被扣光了，就提示
      if (now_money <= 0) {
        msg.push(
          '\n媚娘：没钱了也想跟老娘耍？\n你已经裤衩都输光了...快去降妖赚钱吧！'
        );
      }
      e.reply(msg);
      return false;
    }
  }

  async Moneyrecord(e) {
    if (!verc({ e })) return false;
    let qq = e.user_id.toString().replace('qg_','');
    qq=await channel(qq)
    let shenglv;
    //获取人物信息
    let player_data = data.getData('player', qq);
    let victory = isNotNull(player_data.金银坊胜场)
      ? player_data.金银坊胜场
      : 0;
    let victory_num = isNotNull(player_data.金银坊收入)
      ? player_data.金银坊收入
      : 0;
    let defeated = isNotNull(player_data.金银坊败场)
      ? player_data.金银坊败场
      : 0;
    let defeated_num = isNotNull(player_data.金银坊支出)
      ? player_data.金银坊支出
      : 0;
    if (parseInt(victory) + parseInt(defeated) == 0) {
      shenglv = 0;
    } else {
      shenglv = ((victory / (victory + defeated)) * 100).toFixed(2);
    }
    const data1 = await new Show(e).get_jinyin({
      user_qq: qq,
      victory,
      victory_num,
      defeated,
      defeated_num,
    });
    let img = await puppeteer.screenshot('moneyCheck', {
      ...data1,
    });
    e.reply(img);
  }

// ==========  双修  ==========
async Couple(e) {
    if (!verc({ e })) return false;
    const cf = config.getConfig('xiuxian', 'xiuxian');
    let gameswitch = cf.switch.couple;
    if (gameswitch != true) return false;

    let A = e.user_id.toString().replace('qg_', '');
    A = await channel(A);

    let isat = e.message.some(item => item.type === 'at');
    if (!isat) return false;
    let atItem = e.message.filter(item => item.type === 'at');
    let B = atItem[0].qq.toString().replace('qg_', '');
    B = await channel(B);
    if (A == B) {
        e.reply('你咋这么爱撸自己呢?');
        return false;
    }

    const FUSION_GUARANTEE = 20;               // ★保底次数
    async function getFailCnt(qq) {            // 工具：读失败次数
        return parseInt(await redis.get(`xiuxian:player:${qq}:fusion_fail`) || 0);
    }
    async function setFailCnt(qq, val) {       // 工具：写失败次数
        await redis.set(`xiuxian:player:${qq}:fusion_fail`, val);
    }

    var Time = cf.CD.couple;
    let shuangxiuTimeout = parseInt(60000 * Time);
    let now_Time = new Date().getTime();

    let last_timeA = parseInt(await redis.get('xiuxian:player:' + A + ':last_shuangxiu_time') || 0);
    if (now_Time < last_timeA + shuangxiuTimeout) {
        let Couple_m = Math.trunc((last_timeA + shuangxiuTimeout - now_Time) / 60 / 1000);
        let Couple_s = Math.trunc(((last_timeA + shuangxiuTimeout - now_Time) % 60000) / 1000);
        e.reply(`双修冷却: ${Couple_m}分 ${Couple_s}秒`);
        return false;
    }
    let last_timeB = parseInt(await redis.get('xiuxian:player:' + B + ':last_shuangxiu_time') || 0);
    if (now_Time < last_timeB + shuangxiuTimeout) {
        let Couple_m = Math.trunc((last_timeB + shuangxiuTimeout - now_Time) / 60 / 1000);
        let Couple_s = Math.trunc(((last_timeB + shuangxiuTimeout - now_Time) % 60000) / 1000);
        e.reply(`对方双修冷却: ${Couple_m}分 ${Couple_s}秒`);
        return false;
    }

    let ifexistplay_B = await existplayer(B);
    if (!ifexistplay_B) {
        e.reply('修仙者不可对凡人出手!');
        return false;
    }
    let couple = await redis.get('xiuxian:player:' + B + ':couple');
    if (couple != 0) {
        e.reply('哎哟，你干嘛...');
        return false;
    }

    let pd = await find_qinmidu(A, B);
    let marryA = await exist_hunyin(A), marryB = await exist_hunyin(B);
    if ((marryA && marryA !== B) || (marryB && marryB !== A)) {
        e.reply(`力争纯爱！禁止贴贴！！`);
        return false;
    }
    if (pd == false) await fstadd_qinmidu(A, B);

    let playerA = await Read_player(A);
    let playerB = await Read_player(B);

    // ========  融合检测变量  ========
    let isShenDao = playerA.灵根.name === "命运神道体";
    let isJiDao = playerB.灵根.name === "极道天魔";
    let isShenDaoB = playerB.灵根.name === "命运神道体";
    let isJiDaoA = playerA.灵根.name === "极道天魔";
    let istaiyang = playerA.灵根.name === "太阳之体";
    let istaiyin = playerB.灵根.name === "太阴之体";
    let istaiyangB = playerB.灵根.name === "太阳之体";
    let istaiyinA = playerA.灵根.name === "太阴之体";
    let isShengti = playerA.灵根.name === "大成·荒古圣体";
    let isDaotai = playerB.灵根.name === "先天道胎";
    let isShengtiB = playerB.灵根.name === "大成·荒古圣体";
    let isDaotaiA = playerA.灵根.name === "先天道胎";
    let isHundunA = playerA.灵根.name === "混沌体";
    let isxiantianShengtiB = playerB.灵根.name === "先天圣体道胎";
    let isHundunB = playerB.灵根.name === "混沌体";
    let isxiantianShengtiA = playerA.灵根.name === "先天圣体道胎";

    let fusionHit = false;   // 是否已触发融合

    // ==========  随机融合  ==========
    if ((isShengti && isDaotai) || (isShengtiB && isDaotaiA)) {
        if (Math.random() < 0.05) {                       // 5%
            const lg = {"id": 7010014, "name": "先天圣体道胎", "type": "圣体道胎", "归类": "遮天位面", "eff": 300, "法球倍率": 2.1, "攻击": 10, "防御": 10, "生命": 10, "生命本源": 500};
            playerA.灵根 = playerB.灵根 = lg; fusionHit = true;
            await Write_linggen(A, playerA); await Write_linggen(B, playerB);
            await Write_player(A, playerA); await Write_player(B, playerB);
            e.reply([`【圣体道胎交融】`, `荒古圣体与先天道胎相遇，引动万古异象！`, `「先天圣体道胎」诞生！`, `圣体不灭，道胎永恒，万古无双！`].join("\n"));
        }
    } else if ((isShenDao && isJiDao) || (isShenDaoB && isJiDaoA)) {
        if (Math.random() < 0.01) {                       // 1%
            const lg = {"id": 7010015, "name": "终焉神魔体", "type": "神魔体", "归类": "神魔", "eff": 300, "法球倍率": 3, "攻击": 7, "防御": 6, "生命": 5, "生命本源": 100};
            playerA.灵根 = playerB.灵根 = lg; fusionHit = true;
            await Write_linggen(A, playerA); await Write_linggen(B, playerB);
            await Write_player(A, playerA); await Write_player(B, playerB);
            e.reply([`【命运与天魔交融】`, `时空长河倒卷，混沌重开！`, `「终焉神魔体」诞生！`, `神魔同体，再造混沌！`].join("\n"));
        }
    } else if ((istaiyang && istaiyin) || (istaiyinA && istaiyangB)) {
        if (Math.random() < 0.01) {
            const lg = {"id": 70051, "name": "混沌体", "type": "混沌体", "归类": "遮天位面", "eff": 72, "法球倍率": 1.45, "攻击": 5, "防御": 5, "生命": 5, "生命本源": 200};
            playerA.灵根 = playerB.灵根 = lg; fusionHit = true;
            await Write_linggen(A, playerA); await Write_linggen(B, playerB);
            await Write_player(A, playerA); await Write_player(B, playerB);
            e.reply([`【太阴太阳交融】`, `阴阳二气交织，混沌初开！`, `「混沌体」诞生！`, `阴阳合一，混沌初成！`].join("\n"));
        }
    } else if ((isHundunA && isxiantianShengtiB) || (isHundunB && isxiantianShengtiA)) {
        if (Math.random() < 0.01) {
            const lg = {"id": 70051, "name": "先天混沌圣体道胎", "type": "混沌圣体道胎", "归类": "遮天位面", "eff": 572, "法球倍率": 4, "攻击": 15, "防御": 15, "生命": 15, "生命本源": 800};
            playerA.灵根 = playerB.灵根 = lg; fusionHit = true;
            await Write_linggen(A, playerA); await Write_linggen(B, playerB);
            await Write_player(A, playerA); await Write_player(B, playerB);
            e.reply([`【混沌与圣体道胎交融】`, `天地初开，混沌重演！`, `「先天混沌圣体道胎」诞生！`, `混沌圣体，道胎天成！`].join("\n"));
        }
    }

    let failA = await getFailCnt(A), failB = await getFailCnt(B);
    let maxFail = Math.max(failA, failB);

    // ==========  保底融合  ==========
    if (!fusionHit && maxFail >= FUSION_GUARANTEE) {
        let guaLg = null, guaMsg = null;
        if ((isShengti && isDaotai) || (isShengtiB && isDaotaiA)) {
            guaLg = {"id": 7010014, "name": "先天圣体道胎", "type": "圣体道胎", "归类": "遮天位面", "eff": 300, "法球倍率": 2.1, "攻击": 10, "防御": 10, "生命": 10, "生命本源": 500};
            guaMsg = [`【圣体道胎·保底融合】`, `荒古圣体与先天道胎历经千锤百炼，终得天地认可！`, `「先天圣体道胎」保底诞生！`, `圣体不灭，道胎永恒，万古无双！`];
        } else if ((isShenDao && isJiDao) || (isShenDaoB && isJiDaoA)) {
            guaLg = {"id": 7010015, "name": "终焉神魔体", "type": "神魔体", "归类": "神魔", "eff": 300, "法球倍率": 3, "攻击": 7, "防御": 6, "生命": 5, "生命本源": 100};
            guaMsg = [`【终焉神魔体·保底融合】`, `命运与天魔在无数次擦肩后终将交汇！`, `「终焉神魔体」保底诞生！`, `神魔同体，再造混沌！`];
        } else if ((istaiyang && istaiyin) || (istaiyinA && istaiyangB)) {
            guaLg = {"id": 70051, "name": "混沌体", "type": "混沌体", "归类": "遮天位面", "eff": 72, "法球倍率": 1.45, "攻击": 5, "防御": 5, "生命": 5, "生命本源": 200};
            guaMsg = [`【混沌体·保底融合】`, `太阴太阳在二十次轮回后终得阴阳合一！`, `「混沌体」保底诞生！`, `阴阳合一，混沌初成！`];
        } else if ((isHundunA && isxiantianShengtiB) || (isHundunB && isxiantianShengtiA)) {
            guaLg = {"id": 70051, "name": "先天混沌圣体道胎", "type": "混沌圣体道胎", "归类": "遮天位面", "eff": 572, "法球倍率": 4, "攻击": 15, "防御": 15, "生命": 15, "生命本源": 800};
            guaMsg = [`【先天混沌圣体道胎·保底融合】`, `混沌与圣体道胎历经二十次磨合，终得宇宙认可！`, `「先天混沌圣体道胎」保底诞生！`, `混沌圣体，道胎天成！`];
        }
        if (guaLg) {
            playerA.灵根 = playerB.灵根 = guaLg; fusionHit = true;
            await Write_linggen(A, playerA); await Write_linggen(B, playerB);
            await Write_player(A, playerA); await Write_player(B, playerB);
            e.reply(guaMsg.join("\n"));
            await setFailCnt(A, 0); await setFailCnt(B, 0);
        }else {e.reply(`两种凡体历经二十次磨合，仍无缘蜕变，大道难成……\n【${'▱'.repeat(width)}】20/20（无契合路线）`);
  }
    }

// ==========  融合失败则累加计数 + 专属文案 ==========
if (!fusionHit) {
    await setFailCnt(A, failA + 1);
    await setFailCnt(B, failB + 1);

    const next = Math.min(failA + 1, FUSION_GUARANTEE);   //  当前失败次数
    const width = 10;                      // 进度条总长
    const filled = Math.min(Math.floor((next / FUSION_GUARANTEE) * width), width);
    const empty  = width - filled;
    const bar    = '▰'.repeat(filled) + '▱'.repeat(empty);

    /* ——————  各组合专属失败文案 —————— */
    let failText = '';

    // ① 先天道胎 ⇄ 荒古圣体
    if ((isShengti && isDaotai) || (isShengtiB && isDaotaiA)) {
        failText = `圣体与道胎擦肩而过，未能共鸣……\n` +
                   `荒古血气与先天道光微微触碰，便又归于寂静。\n` +
                   `进度 [${bar}] ${next}/20（圣体·道胎交融）`;
    }
    // ② 命运神道体 ⇄ 极道天魔
    else if ((isShenDao && isJiDao) || (isShenDaoB && isJiDaoA)) {
        failText = `神性与魔息彼此吞噬，却终究泾渭分明……\n` +
                   `命运长河与万魔渊壑短暂重叠，随后各自退去。\n` +
                   `进度 [${bar}] ${next}/20（神魔同体）`;
    }
    // ③ 太阳 ⇄ 太阴
    else if ((istaiyang && istaiyin) || (istaiyinA && istaiyangB)) {
        failText = `太阴与太阳交汇一线，却未能真正合一……\n` +
                   `日辉月华交错即逝，混沌未开。\n` +
                   `进度 [${bar}] ${next}/20（阴阳合一）`;
    }
    // ④ 混沌体 ⇄ 先天圣体道胎
    else if ((isHundunA && isxiantianShengtiB) || (isHundunB && isxiantianShengtiA)) {
        failText = `混沌雾霭与圣体道光微微交融，又被天道法则强行抚平……\n` +
                   `进度 [${bar}] ${next}/20（混沌·圣体道胎）`;
    }
    // ⑤ 其余未列出的稀有组合（预留）
    else {
        failText = `两种无上体质互相吸引，却终究欠缺一丝契机……\n` +
                   `进度 [${bar}] ${next}/20（未知交融）`;
    }

    e.reply(failText);
}



    if (fusionHit) return false;                // 已融合直接结束
    // ==========  双修时间 & 普通修为增长  ==========
    await redis.set('xiuxian:player:' + A + ':last_shuangxiu_time', now_Time);
    await redis.set('xiuxian:player:' + B + ':last_shuangxiu_time', now_Time);
    // ----------  以下为原普通双修  ----------
    let option = Math.random(), xiuwei = Math.random(), x = 0, y = 0;
    if (option > 0 && option <= 0.5) {
        x = 28000; y = Math.trunc(xiuwei * x);
        await Add_修为(A, y); await Add_修为(B, y); await add_qinmidu(A, B, 30);
        e.reply(`你们双方情意相通，缠绵一晚，都增加了${y}修为，亲密度+30`);
    } else if (option > 0.5 && option <= 0.6) {
        x = 21000; y = Math.trunc(xiuwei * x);
        await Add_修为(A, y); await Add_修为(B, y); await add_qinmidu(A, B, 20);
        e.reply(`你们双方交心交神，努力修炼，都增加了${y}修为，亲密度+20`);
    } else if (option > 0.6 && option <= 0.7) {
        x = 14000; y = Math.trunc(xiuwei * x);
        await Add_修为(A, y); await Add_修为(B, y); await add_qinmidu(A, B, 15);
        e.reply(`你们双方共同修炼，过程平稳，都增加了${y}修为，亲密度+15`);
    } else if (option > 0.7 && option <= 0.9) {
        x = 520; y = Math.trunc(xiuwei * x);
        await Add_修为(A, y); await Add_修为(B, y); await add_qinmidu(A, B, 10);
        e.reply(`你们双方努力修炼，但是并进不了状态，都增加了${y}修为，亲密度+10`);
    } else {
        e.reply('你们双修时心神合一，但是不知道哪来的小孩，惊断了状态');
    }
    return false;
}
}
async function cutStone(stone, player, usr_qq) {  // 添加 usr_qq 参数
  const quality = stone.quality;
  let winRate = quality * 0.2; // 基础胜率随品质提升
  
  // 源师/源天师特殊能力
  const isStoneMaster = player.occupation === "源师" || player.occupation === "源天师";
  let masterBonus = 0;
  
  if (isStoneMaster) {
    // 源师/源天师能看透神源
    masterBonus = 0.3 + (player.occupation === "源天师" ? 0.2 : 0);
    winRate += masterBonus;
    
    // 神源石额外加成
    if (stone.quality === 3) {
      winRate += 0.2;
    }
  }
  
  // 随机结果
  const isWin = Math.random() < winRate;
  let message = `「${stone.name}」切石结果：\n`;
  
 if (isWin) {
    // 获胜奖励
    const rewards = [
      { name: "纯净源", value: stone.price * 2, isHigh: false },
      { name: "异种源", value: stone.price * 5, isHigh: true },
      { name: "神源", value: stone.price * 10, isHigh: true },
      { name: "古药王", value: stone.price * 20, isHigh: true },
      { name: "帝经残页", value: stone.price * 100, isHigh: true }
    ];
    
    // 源师/源天师获得高级奖励概率更高
    let rewardPool = rewards;
    if (isStoneMaster) {
      // 源师/源天师过滤掉普通奖励
      rewardPool = rewards.filter(r => r.isHigh);
    }
    
    // 选择奖励
    const selectedReward = rewardPool[Math.floor(Math.random() * rewardPool.length)];
    let sourceStoneAmount = 0;
    let spiritStoneAmount = 0;
    
    // ==== 修复：所有玩家都获得奖励 ====
    // 无论职业，只要切出物品都应该获得奖励
    sourceStoneAmount = Math.floor(selectedReward.value / 10);
    spiritStoneAmount = Math.floor(selectedReward.value / 15);
    
    player.源石 += sourceStoneAmount;
    player.灵石 += spiritStoneAmount;
    
    message += `✨神光冲天！切出${selectedReward.name}！\n`;
    message += `获得 ${sourceStoneAmount} 源石\n`;
    message += `获得 ${spiritStoneAmount} 灵石`;
    
    // 源师/源天师特殊提示
    if (isStoneMaster) {
      message += `\n（${player.occupation}慧眼识源，看透了这块神石）`;
    }
    
    // 稀有物品全服公告
    if (selectedReward.value >= stone.price * 20) {
      const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';
      const groupList = await redis.sMembers(redisGlKey);
      
      const broadcastMsg = `【源石坊异象】${player.名号}切出${selectedReward.name}，引动天地异象！`;
      
      for (const group_id of groupList) {
        await pushInfo(group_id, true, broadcastMsg);
      }
    }
    
    return { 
      win: true, 
      value: selectedReward.value, 
      isHighReward: selectedReward.isHigh,
      message 
    };
  } else  {
    // 失败结果
    const failures = [
      "源石内部空空如也",
      "只有少量杂质源",
      "切出毒源，反噬受伤",
      "源石内封有太古生物残骸"
    ];
    
    const failureMsg = failures[Math.floor(Math.random() * failures.length)];
    message += `💢 ${failureMsg}，血本无归！`;
    
    // 源师/源天师失败的特殊提示
    if (isStoneMaster) {
      message += `（即使是${player.occupation}也有看走眼的时候）`;
    }
    
    return { win: false, value: 0, isHighReward: false, message };
  }
}
async function pushInfo(id, is_group, msg) {
  try {
    if (is_group) {
      await Bot.pickGroup(id).sendMsg(msg);
    } else {
      // 假设common.relpyPrivate是用于私聊的函数
      await common.relpyPrivate(id, msg);
    }
  } catch (err) {
    // 这里改为日志输出，避免使用未定义的e
    console.error(`推送消息失败：${err.message}`);
  }
}