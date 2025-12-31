import { plugin, verc, config, data } from '../../api/api.js';
import fs from 'fs';
import {
  existplayer,
  Write_player,
  Write_equipment,
  isNotNull,
  player_efficiency,
  get_random_fromARR,
  getWeimianLevel,
  Read_player,
  Read_equipment,
  Add_HP,
   zd_battle,
    mortal_tribulation,
    spirit_tribulation,
  exist_najie_thing,
  Add_修为,
  Add_血气,
  __PATH,
  Add_寿元,
  Add_najie_thing,
  dujie,
  LevelTask,
  get_log_img,
  channel,
  ForwardMsg,
  dj,
  dj_players
} from '../../model/xiuxian.js';
import { clearInterval } from 'timers';
export class Level extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_Level',
      dsc: '修仙模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#突破$',
          fnc: 'Level_up_normal',
        },
        {
          reg: '^#幸运突破$',
          fnc: 'Level_up_luck',
        },
        {
          reg: '^#破体$',
          fnc: 'LevelMax_up_normal',
        },
        {
          reg: '^#幸运破体$',
          fnc: 'LevelMax_up_luck',
        },
        {
          reg: '^#渡劫$',
          fnc: 'fate_up',
        },
        {
          reg: '^#服用$',
          fnc: 'Useitems',
        },
        {
          reg: '^#登仙$',
          fnc: 'Level_up_Max',
        },
        {
          reg: '^#自动突破$',
          fnc: 'auto_up',
        },
{ reg: '^#一键(幸运)?突破$', fnc: 'OneKeyLevelUp' },
{ reg: '^#一键(幸运)?破体$', fnc: 'OneKeyMaxUp' },
         {
                    reg: '^#证道$',
                    fnc: 'zhengdao'
                },

                 {
                    reg: '^#庇护应劫$',
                    fnc: 'hudao'
                },
                {
                    reg: '^#悟道$',
                    fnc: 'wudao'
                },
                {
                  reg:'^#打散雷劫$',
                  fnc:'command_dasan'
                },
            
                 {
                  reg:'^#逆活九世$',
                  fnc:'nihuojiushi'
                },
   {
  reg: '^#为其护道$',
  fnc: 'giveEmperorProtection'
},
{
    reg: '^#自封帝号(.*)$', 
    fnc: 'customize_emperor_title'
  },
{
    reg: '^#极尽升华$',
    fnc: 'jijinshenghua'
}
      ],
    });
    
  }
   // 定义getEraInfo方法
  getEraInfo() {
    const set = config.getConfig('xiuxian', 'xiuxian');
    const currentEra = set.Era?.current || { index: 0, years: 0 };
    
    // 时代消耗系数映射
    const eraCostRates = [
      0.75, // 神话时代：消耗减少25%
      0.8,  // 太古时代：消耗减少20%
      1.0,  // 天命时代：标准消耗
      2.0,  // 末法时代：消耗增加100%
      3.0   // 绝灵时代：消耗增加200%
    ];
    
    const eraNames = ["神话时代", "太古时代", "天命时代", "末法时代", "绝灵时代"];
    
    return {
      costRate: eraCostRates[currentEra.index],
      eraName: eraNames[currentEra.index],
      eraIndex: currentEra.index
    };
  }

  

 // 自封帝号核心逻辑
async customize_emperor_title(e) {
  if (!verc({ e })) return false;
  
  const usr_qq = e.user_id.toString().replace('qg_', '');
  const player = await Read_player(usr_qq);
  
  // 1. 前置校验：需成就帝位
  if (player.di_wei !== "天帝") {
    await e.reply(`帝威震荡！天道警示：唯有登临天帝之位者方可自封帝号`);
    return false;
  }
  // 2. 提取新帝号（过滤特殊字符）
  const newTitle = e.msg.replace('#自封帝号', '').trim().substring(0,  12);
  if (!newTitle) {
    await e.reply("请填写帝号！示例：#自封帝号 焚天武帝");
    return false;
  }
   // 新增：帝号重复封号判定 [6,8](@ref)
  if (player.帝号 && player.帝号.trim() !== "") {
      // 5. 执行更名（带天地异象）
  player.帝号 = newTitle;
  await Write_player(usr_qq, player);
    await e.reply(`🜂 天道敕令·帝号更易 🜂\n天帝「${player.名号}」帝号重定为：◈${newTitle}◈\n（道果加持仅限初封!）`);
    return false;  // 直接返回不执行后续逻辑
  }
  // 3. 帝号规范性校验
  const forbiddenWords = ["玉皇", "始皇帝", "天道", "系统"];
  if (
    forbiddenWords.some(word => newTitle.includes(word)) || 
    /[0-9\\!@#$%^&*]/.test(newTitle)
  ) {
    await e.reply(`〖天道反噬〗帝号“${newTitle}”触及禁忌，请重拟！`);
    return false;
  }
  
  // 4. NPC谏言系统
  const advisors = [
    { name: "白发谋圣", dialog: `帝号当显道之本源，如“${player.名号.slice(0,1)}墟帝”承地脉之气` },
    { name: "天机老人", dialog: "建议融入法则意象：混沌、轮回、太初等字" }
  ];
  const advisor = advisors[Math.floor(Math.random() * advisors.length)];
  
  // 5. 执行更名（带天地异象）
  player.帝号 = newTitle;
  await Write_player(usr_qq, player);
  
  const announceMsg = [
    `🜂 天道帝诏·寰宇敕令 🜂`,
    `极道帝威仙经转，宇宙浩渺跪真皇！`,
    `天帝「${player.名号}」自封帝号：`,
    `═══════ ◈${newTitle}◈ ═══════`,
    `帝威所至，纪元更迭！`,
    `宇宙共尊，万灵膜拜！`,
  ];
  await e.reply(announceMsg.join('\n')); 
  
  // 6. 仅首次封号获得道果加持 [8](@ref)
  const titlePower = 100
  player.攻击加成 += titlePower * 1e7;
  player.防御加成 += titlePower * 1e7;
  await Write_player(usr_qq, player);
  await e.reply(`天帝道果初临！获得${titlePower}亿本源属性加持`);

  return true;
}
async nihuojiushi(e) {
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }
    
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const player = await Read_player(usr_qq);
    
    // 获取当前时代信息
    const set = config.getConfig('xiuxian', 'xiuxian');
    const currentEra = set.Era?.current || { index: 0, years: 0, epoch: 1 };
    const eraNames = ["神话时代", "太古时代", "天命时代", "末法时代", "绝灵时代"];
    
    // 前置检查
    if (player.mijinglevel_id < 16) {
        const requiredLevel = data.Levelmijing_list.find(l => l.level_id === 16).level;
        e.reply(`只有达到${requiredLevel}才能尝试逆活九世`);
        return;
    }
    
    if (player.mijinglevel_id >= 17) {
        e.reply(`你已成就红尘仙，无需再行逆活`);
        return;
    }
    
    // 时间间隔限制（五千年冷却）
    // 计算当前总年份：(纪元数 - 1) * 50000 + (时代索引 * 10000) + 当前年份
    const currentTotalYears = (currentEra.epoch - 1) * 50000 + (currentEra.index * 10000) + currentEra.years;
    const lastNihuoTime = player.last_nihuo_time || 0;
    const yearsPassed = currentTotalYears - lastNihuoTime;
    
    if (yearsPassed < 5000) {
        const remainingYears = 5000 - yearsPassed;
        e.reply([
            `【岁月积淀不足】`,
            `逆活九世需沉淀五千年道基！`,
            `距上次逆活仅过去 ${yearsPassed} 年`,
            `还需等待 ${remainingYears} 年方可再次尝试`,
            `「五千年积淀，方得一世新生」`
        ].join("\n"));
        return;
    }
    
    // 时代难度系数（0-4对应神话到绝灵）
    const eraDifficulty = [0.6, 0.8, 1.0, 1.5, 2.0]; 
    const difficulty = eraDifficulty[currentEra.index];
    
    // 当前处于第几世
    const currentLife = player.nihuo_count || 1;
    
    // 计算消耗资源
    const baseExpCost = 1500000000 * Math.pow(2, currentLife-1);
    const actualExpCost = Math.ceil(baseExpCost * difficulty);
    
    // 资源检查
    if (player.修为 < actualExpCost || player.血气 < actualExpCost) {
        const expDeficit = Math.max(0, actualExpCost - player.修为, actualExpCost - player.血气);
        e.reply([
            `第${currentLife}世逆活资源不足！`,
            `时代影响：${eraNames[currentEra.index]}（难度系数×${difficulty}）`,
            `需求修为/血气：${actualExpCost.toLocaleString()}`,
            `缺口：${expDeficit.toLocaleString()}`,
            currentLife === 9 ? '最后一世需大圆满' : `需沉淀更深道基`
        ].join("\n"));
        return;
    }
    
    // 开始逆活过程
    player.修为 -= actualExpCost;
    player.血气 -= actualExpCost;
    
    // 记录本次逆活时间
    player.last_nihuo_time = currentTotalYears;
    
    // 天道惩罚概率
    const tribulationChance = Math.min(90, 10 * currentLife); // 第1世10%，第9世90%
    const eraPenalty = [0, 5, 10, 20, 30][currentEra.index]; // 不同时代额外天罚概率
    
    // 创建九世心魔
    const demons = [
        { name: "旧我执念", power: 0.5, desc: "过往自我不愿消亡" },
        { name: "道心裂痕", power: 0.7, desc: "修行之路所有遗憾" },
        { name: "红尘羁绊", power: 0.8, desc: "未了情缘牵绊道途" },
        { name: "业火焚身", power: 1.0, desc: "因果业力化形索命" },
        { name: "岁月长河", power: 1.2, desc: "时间长河逆流冲击" },
        { name: "大道反噬", power: 1.5, desc: "天地法则排斥逆者" },
        { name: "黑暗源头", power: 1.8, desc: "不详物质趁机入侵" },
        { name: "真我质疑", power: 2.0, desc: "存在意义终极拷问" },
        { name: "天地牢笼", power: 3.0, desc: "天道降下最终枷锁" }
    ];
    
    const demon = demons[currentLife-1];
    const demonPower = Math.round(demon.power * 10000000 * difficulty);
    
    await e.reply([
        `第${currentLife}世逆活开启！`,
        `时代背景：${eraNames[currentEra.index]}`,
        `消耗修为/血气：${actualExpCost.toLocaleString()}`,
        `难度系数：${difficulty}×`,
        `面对心魔：${demon.name}`,
        `「${demon.desc}」`,
        `心魔威能：${bigNumberTransform(demonPower)}`
    ].join("\n"));
    
    await sleep(3000);
    
    // 心魔对战
    const battleResult = await battleDemon(player, demonPower);
    if (!battleResult.success) {
        // 心魔对抗失败
        const penaltyRate = difficulty * currentLife * 0.1;
        const lostHp = Math.round(player.当前血量 * penaltyRate);
        player.当前血量 = Math.max(1, player.当前血量 - lostHp);
        
        await Write_player(usr_qq, player);
        
        e.reply([
            `逆活失败！道痕破碎`,
            `失去气血：${bigNumberTransform(lostHp)}`,
            `境界动摇：${currentLife}世道痕消散`,
            `心魔低语："你逃不过最终的寂灭"`
        ].join("\n"));
        return;
    }
    
    // 天道惩罚判定
    const totalTribulationChance = Math.min(95, tribulationChance + eraPenalty);
    const hasTribulation = Math.random() * 100 < totalTribulationChance;
    
    if (hasTribulation) {
        // 天道惩罚
        const tribulationType = currentLife >= 7 ? "仙道法则" : "天道雷劫";
        await e.reply([
            `天道预警！`,
            `${tribulationType}锁定逆天者！`,
            `需以肉身硬抗${Math.min(9, currentLife)}重天罚`
        ].join("\n"));
        await sleep(2000);
        
        // 抵挡天罚
        const tribulationSuccess = Math.random() * 100 < (player.境界 * 5 - currentLife * 3);
        if (!tribulationSuccess) {
            const penaltyMulti = difficulty * (currentLife >= 7 ? 2 : 1);
            player.攻击加成 = Math.max(0, player.攻击加成 * (1 - 0.1 * penaltyMulti));
            player.防御加成 = Math.max(0, player.防御加成 * (1 - 0.1 * penaltyMulti));
            
            await Write_player(usr_qq, player);
            
            e.reply([
                `${tribulationType}重创仙体！`,
                `攻击减损：${bigNumberTransform(player.攻击加成 * 0.1 * penaltyMulti)}`,
                `防御减损：${bigNumberTransform(player.防御加成 * 0.1 * penaltyMulti)}`,
                currentEra.index >= 3 ? `【${eraNames[currentEra.index]}天罚】伤害增强${eraPenalty}%` : ""
            ].join("\n"));
        } else {
            await e.reply([
                `抗劫成功！`,
                `体悟${tribulationType}真意`,
                `道体更近圆满`
            ].join("\n"));
        }
    }
    
    // 逆活成功
    player.nihuo_count = currentLife + 1;
    
    // 属性增强
    const powerGain = Math.round(30 * difficulty * Math.sqrt(currentLife)*500000000);
    const powerGain2 = Math.round(30 * difficulty * Math.sqrt(currentLife)*500000000);
    const powerGain3 = Math.round(30 * difficulty * Math.sqrt(currentLife)*500000000);
    player.攻击加成 += powerGain;
    player.防御加成 += powerGain2;
    player.生命加成 += powerGain3;
    
    // 第九世成就红尘仙
    if (currentLife === 9) {
        player.mijinglevel_id = 17;
        player.境界称号 = "红尘仙";
        
        // 红尘仙特性
        player.长生特性 = true;
        const items = ['羽化', '太上', '虚空'];
        const randomWord = items[Math.floor(Math.random() * items.length)];

        await e.reply([
            `九世圆满！红尘为仙！`,
            `跳出生死轮回，超脱岁月长河`,
            `掌缘生灭，万古长存`,
            `《葬仙纪元》记载：`,
           `「${player.名号}历九世轮回，于${eraNames[currentEra.index]}超脱红尘，成就不灭仙基」`
        ].join("\n"));
    } else {
        await e.reply([
            `第${currentLife}世逆活成功！`,
            `获得仙道感悟：`,
            `  攻击 +${bigNumberTransform(powerGain)}`,
            `  防御 +${bigNumberTransform(powerGain)}`,
            `  生命 +${bigNumberTransform(powerGain)}`,
            `距红尘仙还需：${9 - currentLife}世轮回`,
            `当前仙基：${currentLife}/9`,
            `下次逆活需等待：5000年后`
        ].join("\n"));
    }
    
    await Write_player(usr_qq, player);
}
async zhengdao(e) {
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
    
    let game_action = await redis.get("xiuxian:player:" + usr_qq + ":game_action");
    if (game_action == 0) {
        e.reply("修仙：游戏进行中...");
        return;
    }
    
    let player = await Read_player(usr_qq);
    if (!isNotNull(player.Physique_id)) {
        e.reply("请先#刷新信息");
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
    let weimianyazhi = 10 - weimianLevel 
         if (player.level_id < 32||player.Physique_id < 42) {
        // 辰东风格文案
        const messages = [
            `你必须成就地仙，肉身成圣后才能修炼额外体系`,
        ];
        
         e.reply(messages);
        return;
    }
     if (player.xiangulevel_id > 1) {
        // 辰东风格文案
        const messages = [
            `仙古今世法与人体秘境体系不可兼修！`,
        ];
        
         e.reply(messages);
        return;
    }
     if (player.mijinglevel_id+1 > 21-weimianyazhi) {
        // 辰东风格文案
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
      // ==== 新增：红尘仙之上境界检查 ====
    const targetLevel = player.mijinglevel_id + 1;
    
    if (targetLevel >= 18&&targetLevel < 20) {
        // 检查是否在仙域（power_place=6）
        if (player.power_place !== 6) {
            return e.reply([
                `【诸天有缺·仙路难行】`,
                `${player.名号}盘坐星空，欲突破至${data.Levelmijing_list.find(l => l.level_id === targetLevel)?.level || "更高境界"}，`,
                `然天地剧震，万道哀鸣！`,
                `整片宇宙都在剧烈颤抖，仿佛要崩碎开来！`,
                `「此界大道残缺，规则不全！」`,
                `「踏入仙道领域，需仙域完整法则承载！」`,
                `你感到体内道则紊乱，仙台欲裂，`,
                `仿佛下一刻就要被残缺的天地法则反噬！`,
                `唯有仙域，那片被仙道法则完整覆盖的古地，`,
                `方能承载仙道领域的无上道果！`,
            ].join('\n'));
        }
    }
    let next_level_id = data.Levelmijing_list.find(item => item.level_id == (Number(player.mijinglevel_id) + 1));
       
    if (!next_level_id) {
        e.reply(`你已证道至最高境界`);
        return;
    }
    // 检查是否正在经历劫罚
    if (player.attempting_level_7 === true) {
        e.reply('天道正在降下劫罚，此时非常危险，就别再继续证道了吧！');
        return;
    }
 
// 轮海秘境突破（苦海）
if (player.mijinglevel_id === 1) {
    // 检查百草液
    const baicaoyeCount = await exist_najie_thing(usr_qq, "百草液", "道具");
    if (!baicaoyeCount || baicaoyeCount < 10) {
        const needCount = 10 - (baicaoyeCount || 0);
        return e.reply([
            `【苦海未开】`,
            `你盘坐山巅，尝试引动生命精气冲击苦海`,
            `然体内生命之轮沉寂如渊，苦海坚如神铁`,
            `需以百草液温养肉身，方可撼动生命之轮`,
            `尚缺${needCount}瓶百草液！`,
        ].join("\n"));
    }
    
    // 检查功法
    if (!hasRequiredGongfa(player, "轮海")) {
        const gongfaName = getRequiredGongfaName(player, "轮海");
        return e.reply([
            `【大道未明】`,
            `你欲开辟苦海，却茫然无措`,
            `苦海如渊，若无古经指引，`,
            `纵有百草液亦如盲人摸象，难撼生命之轮`,
            `需寻得《${gongfaName}》或完整帝经，`,
            `方知苦海真谛！`,
        ].join("\n"));
    }
    
    // 所有条件满足，开始突破
    await Add_najie_thing(usr_qq, "百草液", "道具", -10);
const gongfaName = getRequiredGongfaName(player, "轮海");
    // 开辟苦海成功
    e.reply([
        `【苦海初开·神虹贯体】`,
        `你盘坐山巅，运转《${gongfaName}》玄法`,
        `十瓶百草液化作磅礴生命精气，如蛟龙入海！`,
        `轰！！！`,
        `生命之轮震动，苦海崩开一线！`,
        `一道${player.灵根.name === "荒古圣体" ? "金色" : "青色"}神虹自苦海冲天而起，`,
        `轮海秘境——成！`,
    ].join("\n"));
    
    // 境界提升
    player.mijinglevel_id = 2;
    await Write_player(usr_qq, player);
    return;
}

// 道宫秘境突破
if (player.mijinglevel_id === 5) {
    const openingText = [
        `【道宫未开·神藏未启】`,
        `你盘坐云巅，五气朝元，欲开道宫神藏`,
        `《西皇经》云：道宫五神藏，需海量源石精气冲刷`,
        `古史曾记载叶凡破境时，百万斤源石堆砌如山！`,
    ].join("\n");
    
    // 检查源石
    const requiredSource = 1000000;
    if (player.源石 < requiredSource) {
        const missingSource = requiredSource - player.源石;
        return e.reply([
            openingText,
            `源石不足！尚需${bigNumberTransform(missingSource)}斤`,
            `「寻源或源石坊赌石可获海量源石」`,
        ].join("\n"));
    }
    
    // 检查功法
    if (!hasRequiredGongfa(player, "道宫")) {
       const gongfaName = getRequiredGongfaName(player, "道宫");
        return e.reply([
            openingText,
            `道宫如混沌，若无帝经指引，`,
            `纵有源山亦难开人体神藏`,
            `需寻得《${gongfaName}》或完整帝经，`,
            `方知五神藏真谛！`,
            `「瑶池旧址或有残卷」`,
        ].join("\n"));
    }
    
    // 所有条件满足，开始突破
    player.源石 -= requiredSource;
const gongfaName = getRequiredGongfaName(player, "道宫");
    // 发送初始突破消息
    e.reply([
        `【道宫初开·五神朝天】`,
        `${player.名号}盘坐源山之巅，运转《${gongfaName}》`,
        `${bigNumberTransform(requiredSource)}斤源石堆砌成山，`,
        `海量源气如天河倒灌！`,
        `虚空中响起阵阵蝉唱，`,
        `祭祀之音缭绕未央宫阙！`,
    ].join("\n"));


    
    // 最终突破消息
    const finalMsg = [
        `【道宫大成·五神朝天】`,
        `道宫五神藏齐开，五大神祇诵经，`,
        `逝我、道我、今我共鸣！`,
    ];

    
    finalMsg.push(
        `从此秘境称尊！`,
    );

    e.reply(finalMsg.join("\n"));

    // 境界提升
    player.mijinglevel_id = 6;
    await Write_player(usr_qq, player);
    return;
}



// 化龙秘境突破
if (player.mijinglevel_id === 7) {
    const openingText = [
        `【脊柱未醒·化龙未明】`,
        `你盘坐龙脉，欲唤醒脊柱大龙`,
        `《太皇经》云：化龙秘境需龙髓滋养`,
        `古史记载叶凡破境时，九天神玉棺盛装梦幻龙髓！`,
    ].join("\n");
    
    // 检查龙髓
    const requiredLongsui = 9;
    const longsuiCount = await exist_najie_thing(usr_qq, "龙髓", "丹药");
    if (!longsuiCount || longsuiCount < requiredLongsui) {
        const missingLongsui = requiredLongsui - (longsuiCount || 0);
        return e.reply([
            openingText,
            `龙髓不足！尚需${missingLongsui}节`,
            `「万龙巢可寻龙髓」`,
        ].join("\n"));
    }
    
    // 检查功法
    if (!hasRequiredGongfa(player, "化龙")) {
       const gongfaName = getRequiredGongfaName(player, "化龙");
        return e.reply([
            openingText,
            `脊柱如死龙，若无帝经指引，`,
            `纵有龙髓亦难唤醒脊柱大龙`,
            `需寻得《${gongfaName}》或完整帝经，`,
            `方知化龙真谛！`,
            `「大夏祖庙或有传承」`,
        ].join("\n"));
    }
    
    // 所有条件满足，开始突破
    await Add_najie_thing(usr_qq, "龙髓", "丹药", -requiredLongsui);
const gongfaName = getRequiredGongfaName(player, "化龙");
    // 发送突破消息
    e.reply([
        `【化龙九变·脊柱通天】`,
        `${player.名号}盘坐龙脉，运转《${gongfaName}》`,
        `九节梦幻龙髓融入脊柱，`,
        `如九天神玉滋润大龙！`,
    ].join("\n"));

    
    // 最终突破消息
    const finalMsg = [
        `【化龙圆满·脊柱通天】`,
        `脊柱如大龙腾空，直冲仙台秘境，`,
        `九次蜕变，龙吟震彻紫府！`,
    ];

    
    finalMsg.push(
        `从此脊椎如龙，神力滔天！`,
    );

    e.reply(finalMsg.join("\n"));

    // 境界提升
    player.mijinglevel_id = 8;
    await Write_player(usr_qq, player);
    return;
}
       // 检查是否正在尝试突破ID22境界
           if (player.mijinglevel_id  >= 8) {
         // 检查功法
    if (!hasRequiredGongfa(player, "仙台")) {
        const gongfaName = getRequiredGongfaName(player, "仙台");
        return e.reply([
            `仙台如虚影，若无帝经指引，`,
            `纵有逆天资质亦难筑道基`,
            `需寻得《${gongfaName}》或完整帝经，`,
            `方知仙台真谛！`,
            `「紫薇古星或有传承」`,
        ].join("\n"));
    }
    }
    if (player.mijinglevel_id  === 10) {
        e.reply('你已到达仙台秘境大能，若要更进一步必须面对斩道之劫！');
        return;
    }
    if (player.mijinglevel_id  === 11) {
        e.reply('你已到达仙台秘境斩道王者，若要更进一步必须面对圣人雷劫！');
        return;
    }
     if (player.mijinglevel_id  === 12) {
        e.reply('你已到达仙台秘境圣人，若要更进一步必须面对圣人王雷劫！');
        return;
    }
    if (player.mijinglevel_id  === 13) {
        e.reply('你已到达仙台秘境圣人王，若要更进一步必须面对大圣雷劫！');
        return;
    }
    if (player.mijinglevel_id  === 14) {
        e.reply('你已到达仙台秘境大圣，若要更进一步必须面对准帝雷劫！');
        return;
    }
        // 检查是否正在尝试突破ID22境界
    if (player.mijinglevel_id  === 15) {
        e.reply('你已到达准帝九重天，想要再更进一步唯有打破天地桎梏，融合天心印记，成就无上道果，执掌乾坤，镇压万道！');
        return;
    }
     if (player.mijinglevel_id === 16) {
    e.reply([
        `大帝绝巅，俯瞰万古！`,
        ``,
        `你已登临人道极境，掌乾坤，握阴阳，一念间星河倒转，万道哀鸣！`,
        `然此界大道有缺，仙路断阻，天地如牢笼，禁锢万灵长生梦。`,
        ``,
        `欲破桎梏，唯有：九世轮回，方能在红尘中争渡，`,
        `于不可能中开辟仙路，`,
        `成就万古未有的红尘仙果位！`,
        ``,
        `路漫漫其修远兮，愿道友踏破轮回，证道永恒！`
    ].join('\n'));
    return;
}
if (player.mijinglevel_id + 1 === 20) {
   if (typeof player.破王成帝 === 'undefined') {
        player.破王成帝 = 10; // 初始化为10个步骤
        await Write_player(usr_qq, player);  // 保存玩家数据
    }
    
    e.reply([
        `【仙王绝巅·帝路难行】`,
        ``,
        `你已登临仙王巨头之境，俯瞰纪元沉浮，一念间星河崩灭，万道臣服！`,
        `然帝路已断万古，界海尽头黑雾翻涌，黑暗源头蛰伏，`,
        `欲更进一步，需：`,
        ``,
        `踏遍界海亿万残界，寻找破王成帝的契机`,
        `此路九死无生，古来天骄皆埋骨帝路：`,
        `唯有无敌信念可破桎梏！`,
    ].join('\n'));
    return;
}
if (player.mijinglevel_id+ 1 == 21 ) {
    // 初始化纪元积累
    if (typeof player.纪元积累 === 'undefined') {
        player.纪元积累 = 0;
        await Write_player(usr_qq, player);
    }
       if (player.纪元积累 < 100) {
    // 计算剩余纪元
    const remainingEpochs = 100 - player.纪元积累;
    
   // 构建文案
const message = [
    `【帝路漫漫·纪元为阶】`,
    `${player.名号}屹立准仙帝绝巅，帝威浩荡，压盖诸天！`,
    `眸光开阖间，纪元生灭，万道成空！`,
    `然仙帝之路，超脱一切，自身胜道！`,
    `你已积累：${player.纪元积累}个纪元积累`,
    `尚需：${remainingEpochs}个纪元的终极蜕变`,
    `帝路明悟：`,
    `"秩序如同路边的花，绽放了又枯萎"`,
    `"唯自身永恒，一道压万道，诸天共尊！"`,
    `"路尽见真我，一念花开，一念界灭"`,
    `待你成就仙帝果位时：`,
    `- 眸光所至，万古时空皆为画卷`,
    `- 呼吸间，亿万宇宙生灭轮回`,
    `- 踏出那一步，自身便是道，超越一切法`,
    `- 诸天至高，路尽级生灵，俯瞰纪元沉浮`,
    `仙帝特质：`,
    ` 一道压万道，诸天规则如掌中纹路`,
    ` 言出即法，一念创世`,
    ` 路尽级进化，真正的不死不灭`,
    ` 眸光映照古今未来，看遍纪元轮回`,
    `此乃：`,
    `「自身胜道，万道成空」`,
    `「诸天至高，路尽见真」`,
    `这一世，你能否：`,
    `踏出那终极一跃，成就路尽级生灵？`,
    `让诸天共颂你的真名！`
].join('\n');
    
    e.reply(message);
    return;
}}
    // 检查是否正在尝试突破ID22境界
    if (player.mijinglevel_id + 1 === 22) {
        e.reply('仙帝已然超越诸天极限，一证永证，万道成空，自身胜道，超脱无尽诸天与古史，随意颠覆古今未来，天地万物也难以磨灭其本质，即使自身陨落了只要有人念想，就会化作道标接引再次归来，若想更进一步，须焚烧至高大道，祭掉所有一切，极尽升华，博一线可能！');
        return;
    }
    // 检查是否正在尝试突破ID24境界
if (player.mijinglevel_id + 1 === 24) {
e.reply('唯一道之上，已是诸天尽头，万古空寂。此境超脱一切有形无形，超越道与理，凌驾因果命运之上，自身即是虚无，亦是永恒。然欲更进一步，须斩尽最后一丝‘我’念，焚尽真灵烙印，让‘存在’本身归于寂灭，于‘无’中极尽一跃，方有可能触及那不可言、不可想、不可名状的‘超脱之上’——那是连‘道’都无法定义的领域，是真正意义上的‘无上无下，无前无后，无因无果’，是超越一切概念与逻辑的终极之境。万古以来，纵有祭道者踏足此境，亦终成空幻，因‘超脱之上’本就不存‘得见’之说，唯有‘无我无道，方见真无’……');
return;
}
    // 获取当前时代信息
    const set = config.getConfig('xiuxian', 'xiuxian');
    const currentEra = set.Era?.current || { index: 0, years: 0 };
    
    // 时代消耗系数映射（与时代状态插件一致）
    const eraCostRates = [
        0.75, // 神话时代：消耗减少25%
        0.8,  // 太古时代：消耗减少20%
        1.0,  // 天命时代：标准消耗
        2.0,  // 末法时代：消耗增加100%
        3.0   // 绝灵时代：消耗增加200%
    ];
    
    const eraNames = ["神话时代", "太古时代", "天命时代", "末法时代", "绝灵时代"];
    
    // 计算当前实际消耗率
    const costRate = eraCostRates[currentEra.index];
    const eraName = eraNames[currentEra.index];
    const costModifier = costRate !== 1.0 ? `(×${costRate})` : "";
    
    // 计算基础和经验值并应用时代系数
    const base_need_exp = Math.pow(2, player.mijinglevel_id) * 250000;
    const actual_need_exp = Math.ceil(base_need_exp * costRate);
    
    // 假设player.修为和player.血气都是数值类型
    let now_exp_xiuwei = player.修为; 
    let now_exp_xueqi = player.血气;
    
    // 检查修为和血气是否都足够
    if (now_exp_xiuwei < actual_need_exp || now_exp_xueqi < actual_need_exp) {
        // 如果修为或血气不足，计算还需要多少修为和血气
        let need_xiuwei = now_exp_xiuwei < actual_need_exp ? actual_need_exp - now_exp_xiuwei : 0;
        let need_xueqi = now_exp_xueqi < actual_need_exp ? actual_need_exp - now_exp_xueqi : 0;
        
        // 添加时代信息
        const eraInfo = `当前时代: ${eraName} ${costRate !== 1.0 ? `(消耗${costRate > 1 ? '增加' : '减少'}${Math.abs(100 - costRate*100)}%)` : ''}`;
        
        e.reply([
            `证道失败！资源不足`,
            eraInfo,
            `基础需求: ${base_need_exp.toLocaleString()}`,
            `实际需求: ${actual_need_exp.toLocaleString()} ${costModifier}`,
            `修为差: ${need_xiuwei.toLocaleString()}`,
            `血气差: ${need_xueqi.toLocaleString()}`
        ].join("\n"));
        return;
    }
    // 四极秘境突破
if (player.mijinglevel_id === 6) {
    const openingText = [
        `【四极未通·大道未明】`,
        `你盘坐虚空，欲沟通天地四极`,
        `《恒宇经》云：四极秘境需海量源石精气滋养`,
        `古史记载叶凡破境时，千万斤源石堆砌成山！`,
    ].join("\n");
    
    // 检查源石
    const requiredShenyuan = 10000000;
    if (player.源石 < requiredShenyuan) {
        const missingShenyuan = requiredShenyuan - player.源石;
        return e.reply([
            openingText,
            `源石不足！尚需${bigNumberTransform(missingShenyuan)}斤`,
            `「寻源或源石坊赌石可获源石」`,
        ].join("\n"));
    }
    
    // 检查功法
    if (!hasRequiredGongfa(player, "四极")) {
        const gongfaName = getRequiredGongfaName(player, "四极");
        return e.reply([
            openingText,
            `四极如混沌，若无帝经指引，`,
            `纵有源石亦难通天地四极`,
            `需寻得《${gongfaName}》或完整帝经，`,
            `方知四极真谛！`,
            `「火域或有传承」`,
        ].join("\n"));
    }
    
    // 所有条件满足，开始突破
    player.源石 -= requiredShenyuan;
    
    // 获取实际使用的功法名称
   const gongfaName = getRequiredGongfaName(player, "四极");

    // 检查是否是荒古圣体突破到四极秘境
    if (player.灵根.name === "荒古圣体") {
        // 计算突破消耗（修为和血气）
        const base_need_exp = 1000000;
        const { costRate, eraName } = this.getEraInfo(); // 获取当前时代信息
        const actual_need_exp = Math.floor(base_need_exp * costRate);
        
        // 构建时代信息字符串
        const eraInfo = costRate !== 1.0 
            ? `【${eraName}影响】消耗${costRate > 1 ? '增加' : '减少'}${Math.abs(100 - costRate*100)}%`
            : "";
        
        // 发送警告消息
        e.reply([
            `【圣体天劫·四极断路】`,
            `${player.名号}盘坐源石山巅，运转《${gongfaName}》`,
            `${bigNumberTransform(requiredShenyuan)}斤源石化作混沌气，`,
            `如天河倒灌入四肢百骸！`,
        ].join("\n"));
        
        e.reply([
            `天道警告！当前时代：${eraName}`,
            `基础消耗: ${base_need_exp.toLocaleString()}`,
            `实际消耗: ${actual_need_exp.toLocaleString()} ${eraInfo}`,
            `天道将要降下恐怖劫罚，若无强者为庇护应劫，你必将身魂消散！`,
            `你的生命只剩下60息的时间！`
        ].join("\n"));
        
        // 存储实际消耗用于后续处理
        player.breakthrough_cost = actual_need_exp;
        player.attempting_level_7 = true;
        await Write_player(usr_qq, player); 
        
        setTimeout(async () => {
            let player = await Read_player(usr_qq);
            if (player.guardian === "have") {
                // 成功突破
                player.mijinglevel_id = 7; // 晋升至四极秘境
                player.血气 -= player.breakthrough_cost;
                player.修为 -= player.breakthrough_cost;
                player.guardian = null;
                player.attempting_level_7 = false;
                delete player.breakthrough_cost; // 清除临时存储
                
                let level = data.Levelmijing_list.find(item => item.level_id == player.mijinglevel_id).level;
                await Write_player(usr_qq, player);
                let equipment = await Read_equipment(usr_qq);
                await Write_equipment(usr_qq, equipment);
                await Add_HP(usr_qq, 99999999);
                
                e.reply([
                    `【圣体破咒·四极通天】`,
                    `你的肉身与神魂渡过了九重雷劫与混沌雷劫`,
                    `天地间短暂的风平浪静了一瞬`,
                    `然而下一刻圣体诅咒发生了！`,
                    `天地降下恐怖的先天道图要磨灭你的肉身与神魂`,
                    `你咬牙拼尽全力抗争，然一切终究徒劳`,
                    `就在你绝望之际，一位强大的高人出现`,
                    `不惜一切代价替你破灭了先天道图`,
                    `以人力接续了你的修行断路`,
                    `打破了圣体无法成就四极的诅咒！`,
                    `从此能够正常修行，但那位高人也留下了严重的道伤`,
                    `证道成功至 ${level} [消耗: ${player.breakthrough_cost.toLocaleString()}]`,
                ].join("\n"));
                
        
            } else {
                // 失败处理（扣除固定值，不受时代影响）
                player.血气 -= 9999999;
                player.修为 -= 9999999;
                player.当前血量 = 1;
                player.mijinglevel_id = 1; // 跌落到轮海秘境
                player.attempting_level_7 = false;
                delete player.breakthrough_cost;
                
                await Write_player(usr_qq, player);
                let equipment = await Read_equipment(usr_qq);
                await Write_equipment(usr_qq, equipment);
                
                e.reply([
                    `【圣体天劫·道基崩毁】`,
                    `你克服艰难险阻到达四极秘境关隘`,
                    `然圣体诅咒发生，天地降下恐怖先天道图`,
                    `要磨灭你的肉身与神魂`,
                    `你拼尽全力抗争，然一切终究徒劳`,
                    `最终被镇压的奄奄一息`,
                ].join("\n"));
                
                e.reply([
                    `【圣体天劫·道基崩毁】`,
                    `在这弥留之际你不免心生绝望和不甘`,
                    `身体诅咒仍能破开，可这方天地不认同圣体`,
                    `又怎能逆天而为？`,
                    `最终你被先天道图镇压而死`,
                    `你被神秘力量复活，但修行道基被磨灭，苦修的秘境力量消散了`,
                    `损失9999999点修为与血气`,
                ].join("\n"));
            }
        }, 60000); // 60秒后执行
        
        return;
    }
    
   
    e.reply([
        `【四极通天·道法自然】`,
        `${player.名号}盘坐源石山巅，运转《${gongfaName}》`,
        `${bigNumberTransform(requiredShenyuan)}斤源石化作混沌气，`,
        `如天河倒灌入四肢百骸！`,
    ].join("\n"));

    // 四极开启过程
    const limbs = [
        {name: "左臂", beast: "青龙", element: "木"},
        {name: "右臂", beast: "白虎", element: "金"},
        {name: "左足", beast: "玄武", element: "水"},
        {name: "右足", beast: "朱雀", element: "火"}
    ];

    for (const limb of limbs) {
        const limbMsg = [
            `【${limb.name}通天】`,
            `${limb.beast}虚影显化，${limb.element}气冲霄！`,
            `四肢如撑天支柱，沟通天地大道，`,
            `道则符文烙印骨骼之上！`
        ];
        
        if (player.灵根.type === "混沌体") {
            limbMsg.push(`混沌气弥漫，万道符文缠绕${limb.name}！`);
        } else if (player.灵根.type.includes(limb.element)) {
            limbMsg.push(`本命${limb.element}气冲霄，引动大道共鸣！`);
        } else {
            limbMsg.push(`${limb.name}神光绽放，道音缭绕！`);
        }
        
        limbMsg.push(
            `虚空震动，大道和鸣，`,
            `如上古神兽复苏，威压九天！`,
        );
        
        e.reply(limbMsg.join("\n"));
        await sleep(2000);
    }

    // 最终突破消息
    const finalMsg = [
        `【四极圆满·通天彻地】`,
        `四肢通天，勾动天地大道，`,
        `举手投足间道则相随！`,
    ];

    if (player.灵根.type === "混沌体") {
        finalMsg.push(
            `【混沌异象·万道共鸣】`,
            `混沌气弥漫，万道符文烙印四肢`
        );
    }
    
    finalMsg.push(
        `从此肉身通灵，可勾动天地道则！`,
    );

    e.reply(finalMsg.join("\n"));

    // 境界提升
    player.mijinglevel_id = 7;
    await Write_player(usr_qq, player);
    return;
}
    // 命泉突破
if (player.mijinglevel_id === 2) {
    const gongfaName = getRequiredGongfaName(player, "轮海");
    e.reply([
        `【命泉·神力源泉】`,
        `你盘坐苦海之上，运转《${gongfaName}》玄法`,
        `苦海翻涌，中央区域神光璀璨`,
        `轰隆！`,
        `一道璀璨的泉眼自苦海深处涌现，汩汩而涌，`,
        `生命精气化为实质的神力源泉，流淌不息`,
        `命泉境——成！神力自此可离体施展！`,
    ].join("\n"));
}

// 神桥突破
if (player.mijinglevel_id === 3) {
    e.reply([
        `【神桥·架海通天】`,
        `命泉喷薄神力，滋养整片苦海`,
        `于混沌雾霭与神力波涛中，`,
        `一道璀璨的神虹自命泉升起，贯穿苦海，`,
        `直指那朦胧未知的彼岸`,
        `神桥境——成！踏虹而行，可离地飞升！`,
    ].join("\n"));
}

// 彼岸突破
if (player.mijinglevel_id === 4) {
    e.reply([
        `【彼岸·超脱苦海】`,
        `你踏神桥而行，穿越苦海迷雾`,
        `历经磨难，肉身与神识经受洗礼`,
        `最终抵达彼岸，苦海化作力量源泉`,
        `肉身蜕变，生命层次跃迁`,
        `彼岸境——成！轮海秘境圆满！`,
    ].join("\n"));
}
if (player.mijinglevel_id === 20) { // 路尽级仙帝境界
    e.reply([
        `【诸天至高】`,
        `诸天万界在颤抖，时间长河在倒悬！`,
        `你屹立在岁月长河之上，脚踏万古青天，`,
        `眸光开阖间，映照诸世生灭，轮回更迭！`,
        `大道在哀鸣，规则在重组！`,
        `你体内每一滴血都在沸腾，化作璀璨仙光，`,
        `照亮了古今未来，贯通了永恒未知！`,
        `「轰——」`,
        `一道永恒仙光自你天灵冲霄而起，`,
        `击穿万古时空，崩断因果长河！`,
        `诸天万域都在共鸣，亿万生灵叩首朝拜！`,
        `你一步踏出，脚下浮现：`,
        `- 开天辟地的混沌景象`,
        `- 纪元终结的末世劫光`,
        `- 永恒不灭的仙帝符文`,
        `「吾道已成，当为——」`,
        `「路尽级仙帝！」`,
        `此刻，你：`,
        `- 超脱诸世外，不在古史中`,
        `- 一念可映照诸天，弹指可重开纪元`,
        `- 眸光所至，万道成空！`,
        `路尽见真我，仙帝踏永恒！`,
        `从此岁月不加身，因果不沾体！`,
        `真正做到了：`,
        `「古今未来，唯我独尊！」`,
    ].join("\n"));
    e.reply([
        `【法身凝聚】`,
        `你盘坐永恒未知之地，万古不动，`,
        `一缕神念自天灵冲出，化作与真身无异的法身！`,
        `法身可代行诸天，遨游万界！`,
        `真身则继续盘坐于永恒未知之地阻击诡异！`,
    ].join("\n"));
    player.纪元积累 -= 100
      // 添加法身系统
    player.法身 = 1; // 法身状态：1表示已凝聚
    player.法身位置 = 0; // 法身位置（默认为仙界）
    player.法身行动 = null; // 法身当前行动
    player.power_place = 5;
    await Write_player(usr_qq, player);
}
if (player.mijinglevel_id > 10 && player.mijinglevel_id < 18) {
    let prob = 0.7 - player.mijinglevel_id / 100;
    let rand = Math.random();
    // 检查是否在黑暗牢笼状态
  // 检查是否在黑暗牢笼状态
    const actionData = await redis.get('xiuxian:player:' + usr_qq + ':action');
    if (actionData) {
        const now_time = new Date().getTime();
        const actionObj = JSON.parse(actionData);
        
        // 检查是否是黑暗牢笼状态且已到期
        if (actionObj.heianlaolong === '1' && now_time >= actionObj.end_time) { // 修正这里
            // 清除黑暗牢笼状态
            await redis.del(`xiuxian:player:${usr_qq}:action`);
            
            
            // 保存玩家数据
            await Write_player(usr_qq, player);
            
            // 构建回复消息
            const replyMsg = [
                `【黑暗牢笼】`,
                `经过漫长的煎熬，你终于挣脱了黑暗枷锁！`,
                `元神从永恒的沉沦中归来，重见天日！`,
            ];
            
            e.reply(replyMsg.join("\n"));
        }
    }
    
    // 再次检查当前是否在黑暗牢笼状态
    const currentActionData = await redis.get('xiuxian:player:' + usr_qq + ':action');
    if (currentActionData) {
        const actionObj = JSON.parse(currentActionData);
        if (actionObj.heianlaolong === '1') {
            // 计算剩余时间
            const now_time = new Date().getTime();
            const remaining = actionObj.end_time - now_time;
            const minutes = Math.floor(remaining / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            
            // 构建回复消息
            const replyMsg = [
                `【元神囚禁】`,
                `${player.名号}的元神被囚禁在黑暗牢笼中！`,
                `冰冷的秩序锁链贯穿元神，`,
                `粘稠的黑暗物质侵蚀着你的生命印记。`,
                `接引古殿的青铜巨门隔绝了所有光明，`,
                `你的意识在无尽的黑暗中沉沦...`,
                `剩余刑期：${minutes}分${seconds}秒`,
                `无法证道！`
            ];
            
            e.reply(replyMsg.join('\n'));
            return;
        }
    }
    if (rand > prob) {
        if (player.莫晓羽庇护 === 1) {
        e.reply([
            `【天外来援】`,
        `${player.名号}盘坐于星空深处，周身道则轰鸣，血气如亿万星河奔腾！`,
        `就在元神即将超脱的刹那，`,
        `无尽黑雾自虚空裂缝中汹涌而出！`,
        `亿万条冰冷的秩序锁链缠绕元神，`,
        `接引古殿虚影显化，欲将其拖入永恒的沉沦！`,
            `就在危急关头，忽然九天之上一只晶莹如玉的手掌压落，无量神辉驱散永恒黑暗！`,
            `一位超然身影踏着岁月长河而来！`,
            `他英姿伟岸，黑发如瀑，眸光开阖间有亿万宇宙生灭的景象浮现，浑身透发着睥睨万古的无敌气魄。`,
            `神慧之光缭绕其身，每一步踏出，天地都在颤栗，大道都在哀鸣！`,
            `举手投足间，命运洪流为之凝滞，万道法则为之俯首！`,
            `不必害怕，一切有我！`,
            `青年声如洪钟大吕，震得接引古殿剧烈摇晃，青铜巨门寸寸龟裂！`,
            `其音波化作实质的金色符文，将缠绕${player.名号}的黑暗锁链尽数震碎！`,
            `无尽黑暗中，他如永恒神阳普照十方，`,
            `黑暗物质触其神辉如冰雪消融，接引古殿在其威压下哀鸣解体！`,
            `青年眸光一转，岁月长河被截断，万古前的恐怖存在在时间长河中显化身影却不敢踏出！`,
            `有本座庇护，诸天万界无人可动你分毫！`,
            `声震万古星河，永恒不朽的气息弥漫苍茫宇宙！`,
            `黑暗牢笼在此威压下彻底崩灭，化作虚无！`
        ].join('\n'));
         // 普通突破逻辑
    player.mijinglevel_id += 1;
    player.血气 -= actual_need_exp;
    player.修为 -= actual_need_exp;
    
    let level = data.Levelmijing_list.find(item => item.level_id == player.mijinglevel_id).level;
    await Write_player(usr_qq, player);
    let equipment = await Read_equipment(usr_qq);
    await Write_equipment(usr_qq, equipment);
    await Add_HP(usr_qq, 99999999);
    
    // 添加时代信息
    const eraInfo = costRate !== 1.0 
        ? `【${eraName}影响】消耗${costRate > 1 ? '增加' : '减少'}${Math.abs(100 - costRate*100)}%`
        : "";
    
    e.reply([
        `证道成功！当前时代：${eraName}`,
        `基础消耗：${base_need_exp.toLocaleString()}`,
        `实际消耗：${actual_need_exp.toLocaleString()} ${costModifier}`,
        eraInfo,
        `证道体系境界：${level}`
    ].join("\n"));
    return;
    }
        // 检查剑云海庇护
      if (player["player.剑云海庇护"] && player["player.剑云海庇护"].黑暗牢笼 > 0) {
    // 消耗一次庇护
    player["player.剑云海庇护"].黑暗牢笼--;
    await Write_player(usr_qq, player);
            
    return e.reply([
        `【帝主护道】`,
        `${player.名号}盘坐于星空深处，周身道则轰鸣，血气如亿万星河奔腾！`,
        `就在元神即将超脱的刹那，`,
        `无尽黑雾自虚空裂缝中汹涌而出！`,
        `亿万条冰冷的秩序锁链缠绕元神，`,
        `接引古殿虚影显化，欲将其拖入永恒的沉沦！`,
        `突然！`,
        `一道贯穿古今的剑光撕裂黑暗！`,
        `"区区接引古殿，也敢动我剑云海之人？"`,
        `剑魔帝主的声音震碎万古虚空！`,
        `三道帝级剑气：`,
        `- 一道斩断秩序锁链`,
        `- 一道劈开青铜巨门`,
        `- 一道贯穿接引古殿！`,
        `黑暗物质如潮水般退去，`,
        `剑魔帝主虚影护住${player.名号}元神：`,
        `剩余庇护次数：${player["player.剑云海庇护"].黑暗牢笼}次`  // 修改这里
    ].join('\n'));
} else {
// 无庇护，正常触发黑暗牢笼
e.reply([
    `${player.名号}盘坐星空，道则轰鸣，欲冲击境界壁垒。`,
    `元神即将超脱时，大道反噬骤起！黑雾化作秩序锁链缠绕元神。`,
    `"黑暗侵袭！接引古殿的召唤！" ${player.名号} 瞬间明悟。`,
    `虚空裂开，青铜巨殿显化——接引古殿镇压万古轮回。`,
    `元神被黑暗神链贯穿，意识在冰冷中沉沦。`,
    `肉身因元神剥离而崩解，元神被关入永无天日的黑暗牢笼。`,
    `等待的是永恒放逐，最终化为黑暗源头的一部分。`
].join("\n"));
             
            // 设置关押黑暗牢笼状态
            let arr = {
                action: '被关押黑暗牢笼',
                end_time: new Date().getTime() + 90 * 60000, 
                time: 90 * 60000,
                shutup: '1',
                working: '1',
                Place_action: '1',
                Place_actionplus: '1',
                power_up: '1',
                mojie: '1',
                xijie: '1',
                plant: '1',
                mine: '1',
                heianlaolong: '1' // 黑暗牢笼标记
            };
            player.血气 =player.血气* 0.3;
            player.修为 = player.修为* 0.3;
            await Write_player(usr_qq, player);
            await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
            return false;
        }
    }
}
  if (player.mijinglevel_id ==17) {
    // 仙王突破文案
    const messages = [
        `【仙王临九天·万界共尊】`,
        `${player.名号}立于仙域中央，`,
        `周身仙道符文交织，演化诸天万界！`,
        `头顶三花聚顶，胸中五气朝元，`,
        `仙域法则共鸣，降下无量功德，`,
        `铸就仙王不朽身！`,
        `从此：`,
        `- 掌缘生灭，操控因果`,
        `- 俯瞰纪元沉浮，坐看沧海桑田`,
        `- 一滴血可复活重生，一道念可镇压诸天`,
        `仙王果位——成！`
    ];
    
    e.reply(messages.join('\n'));
}
if (player.mijinglevel_id == 18) {
    // 仙王巨头突破文案 - 举头三尺有神明
    const messages = [
        `【仙王巨头·举头三尺有神明】`,
        `${player.名号}屹立仙域之巅，`,
        `万道轰鸣，诸天星辰为之震颤！`,
       
        `头顶三花绽放不朽光辉，胸中五气演化混沌初开！`,
        `元神极尽升华，超脱天地束缚，`,
        `于举头三尺处凝聚无上神明异象！`,
       
        `那神明：`,
        `- 眸含日月，发丝垂落星河`,
        `- 掌托轮回，呼吸间纪元更迭`,
        `- 周身缭绕原始真解符文，演绎仙古终极奥秘`,
       
        `此乃仙王巨头之证！`,
        `神明异象显化间：`,
        `- 言出法随，一语定乾坤`,
        `- 眸光开阖，洞穿万古时空`,
        `- 一念起，天塌地陷，轮回颠覆`,
       
        `从此：`,
        `- 俯瞰仙王如蝼蚁，横推纪元无敌手`,
        `- 一滴血可湮灭星海，一道念可重开天地`,
        `- 纵是黑暗动乱，亦能只手镇压`,
       
        `仙域共尊，万界来朝——`,
        `仙王巨头，成！`
    ];
    
    e.reply(messages.join('\n'));
}
    // 普通突破逻辑
    player.mijinglevel_id += 1;
    player.血气 -= actual_need_exp;
    player.修为 -= actual_need_exp;
    
    let level = data.Levelmijing_list.find(item => item.level_id == player.mijinglevel_id).level;
    await Write_player(usr_qq, player);
    let equipment = await Read_equipment(usr_qq);
    await Write_equipment(usr_qq, equipment);
    await Add_HP(usr_qq, 99999999);
    
    // 添加时代信息
    const eraInfo = costRate !== 1.0 
        ? `【${eraName}影响】消耗${costRate > 1 ? '增加' : '减少'}${Math.abs(100 - costRate*100)}%`
        : "";
    
    e.reply([
        `证道成功！当前时代：${eraName}`,
        
        `基础消耗：${base_need_exp.toLocaleString()}`,
        `实际消耗：${actual_need_exp.toLocaleString()} ${costModifier}`,
        eraInfo,
        
        `证道体系境界：${level}`
    ].join("\n"));
    return;
}

async giveEmperorProtection(e) {
  if (!e.isGroup) {
    e.reply('请在群聊中使用此命令');
    return true;
  }

  // 检查是否有艾特信息
  const atItems = e.message.filter(item => item.type === "at");
  if (atItems.length === 0) {
    e.reply('请艾特需要护道的玩家');
    return true;
  }

  const giverQQ = e.user_id; // 给予者QQ
  const receiverQQ = atItems[0].qq; // 接收者QQ
 // 读取被艾特玩家的数据
    
  // 检查接收者是否存在
  if (!await existplayer(receiverQQ)) {
    e.reply('目标玩家不存在');
    return true;
  }
 
  // 读取接收者数据
  const receiver = await Read_player(receiverQQ);
  const att = await Read_player(giverQQ);
   // 检查接收者是否存在
  if (att.mijinglevel_id <11&&att.mijinglevel_id <9) {
    e.reply('只有秘境体系达到斩道王者或仙古今世法达到真神境才有能力做别人的护道人！');
    return true;
  }
// // 检查接收者是否存在
//   if (receiver.mijinglevel_id >att.mijinglevel_id) {
//     e.reply('那位道友在秘境体系的造诣上比你更强，不需要你的护道');
//     return true;
//   }
  // 检查是否已有大帝庇护
  if (receiver.大帝庇护 === 1) {
    e.reply('该玩家已有庇护');
    return true;
  }
 // 获取给予者信息
  const giver = await Read_player(giverQQ);
  // 设置大帝庇护
  receiver.大帝庇护 = 1;
  receiver.庇护人 = giverQQ; // 存储给予者的QQ号
  receiver.护道人 = giver.名号; // 存储给予者的名号

  // 保存数据
  await Write_player(receiverQQ, receiver);

 

  e.reply([
    `已为${receiver.名号}标记神念烙印为其护道！`,
    `护道人：${giver.名号}`,
    `当${receiver.名号}在秘境中遭遇生死危险时，${giver.名号}将会出手相助！`
  ].join('\n'));

  return true;
}

async hudao(e) {
    // 不开放私聊功能
    if (!e.isGroup) {
      e.reply('修仙游戏请在群聊中游玩');
      return;
    }
  
    // 检查是否有艾特信息
    let isAt = e.message.some((item) => item.type === "at");
    if (!isAt) {
      e.reply('请艾特需要庇护的玩家');
      return;
    }
  
    // 获取艾特信息
    let atItem = e.message.filter((item) => item.type === "at");
    let targetPlayerQQ = atItem[0].qq; // 被庇护玩家的QQ号
  
    // 获取发起庇护操作的玩家ID
    let usr_qq = e.user_id;
  
    // 检查发起庇护操作的玩家是否存在
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
      e.reply('发起庇护的玩家不存在，请先创建角色');
      return;
    }
  
    // 读取被艾特玩家的数据
    let targetPlayer = await Read_player(targetPlayerQQ);
    if (!targetPlayer) {
      e.reply('被庇护玩家不存在');
      return;
    }
  
    // 检查被艾特玩家是否正在尝试突破ID7
    if (targetPlayer.mijinglevel_id + 1 === 7 && targetPlayer.guardian === null) {
      // 检查发起庇护操作的玩家的修为和血气是否足够
      let player = await Read_player(usr_qq);
      if (player.血气 >= 20000000 && player.修为 >= 20000000) {
        // 消耗发起庇护操作的玩家的修为和血气
        player.血气 -= 20000000;
        player.修为 -= 20000000;
        // 更新发起护道操作的玩家的数据
        await Write_player(usr_qq, player);
  
        // 标记被艾特玩家已有庇护
        targetPlayer.guardian = "have";
        await Write_player(targetPlayerQQ, targetPlayer);
  

        e.reply(`你成功为QQ号${targetPlayerQQ}的玩家庇护，消耗了2000万修为和血气。`);
      } else {
        e.reply(`你的修为或血气不足，无法为他人庇护。`);
      }
    } else {
      e.reply(`玩家QQ号${targetPlayerQQ}当前不需要庇护或已经被庇护中。`);
    }
  }
  async wudao(e) {
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
      let game_action = await redis.get("xiuxian:player:" + usr_qq + ":game_action");
      if (game_action == 0) {
        e.reply("修仙：游戏进行中...");
        return;
      }
      let player = await Read_player(usr_qq);
      if (!isNotNull(player.Physique_id)) {
        e.reply("请先#刷新信息");
        return;
      }
      
     // 检查纳戒中是否有悟道古茶树道具
     if (await exist_najie_thing(usr_qq, "悟道古茶树", "道具")) {
        // 读取玩家数据
        let player = await Read_player(usr_qq);

        // 计算增加的修为和血气值
        let increaseValue;
        if (player.mijinglevel_id < 11) {
            increaseValue = player.mijinglevel_id * 5000000 * 1.5;
        } else {
            increaseValue = player.mijinglevel_id * 50000000 * 3.5;
        }

        // 计算悟道成功率
        let baseSuccessRate = 0.20; // 初始成功率20%
        let additionalRatePerLevel = 0.025; // 每级增加2.5%
        let successRateIncrease = player.mijinglevel_id * additionalRatePerLevel;
        let totalSuccessRate = baseSuccessRate + successRateIncrease;

        // 判断悟道是否成功
        if (Math.random() < totalSuccessRate) {
            // 增加修为和血气
            player.修为 += increaseValue;
            player.血气 += increaseValue;

            // 增加全属性
            let 全属性增加值;
            if (player.mijinglevel_id < 11) {
                全属性增加值 = 5000000;
            } else {
                全属性增加值 = 1500000000; // 固定增加1500万
            }

            // 检查全属性是否已达上限
            let 全属性上限 = 15000000000000;
            let 全属性总和 = player.攻击加成 + player.生命加成 + player.防御加成;
            if (全属性总和 >= 全属性上限) {
                e.reply(`你的全属性已经到达顶点，无法再增加。`);
            } else {
                // 更新全属性
                player.攻击加成 += 全属性增加值;
                player.攻击 += 全属性增加值;
                player.生命加成 += 全属性增加值;
                player.血量上限 += 全属性增加值;
                player.当前血量 += 全属性增加值;
                player.防御加成 += 全属性增加值;
                player.防御 += 全属性增加值;
                // 确保全属性不超过上限
                player.攻击加成 = Math.min(player.攻击加成, 全属性上限);
                player.生命加成 = Math.min(player.生命加成, 全属性上限);
                player.防御加成 = Math.min(player.防御加成, 全属性上限);
            }

            // 更新玩家数据
            await Write_player(usr_qq, player);

            // 减少悟道古茶树道具数量
            await Add_najie_thing(usr_qq, "悟道古茶树", "道具", -1);

            // 通知玩家悟道成功
            let message = `你静下心来体悟悟道古茶树上每一片叶子所蕴含的道韵`;
            if (player.mijinglevel_id < 11) {
                message += `然而你并没有开创出属于自身的道，无法领悟悟道古茶树的大道至理，最终你的修为和血气只增加了${increaseValue}点`;
            } else {
                message += `悟道古茶树叶片上的道韵与你自身所修行开创出的道交相印证，其上似乎有昔日古之大帝创法时的烙印，你观摩它们的帝法很快便踏入了悟道境，天地间恍然光华大盛，绽开金莲朵朵，仙音袅袅，天地众生都心有所感，那些金莲每一朵都蕴含着大道至理，完善你的道与法，你的修为和血气各增加了${increaseValue}点`;
            }
            if (全属性总和 < 全属性上限) {
                message += `，全属性增加了${全属性增加值}点`;
            }
            message += `。`;
            e.reply(message);
        } else {
            e.reply(`悟道失败，你的悟道古茶树未能发挥作用。`);
        }
    } else {
        e.reply(`你的纳戒中没有悟道古茶树道具。`);
    }
}

async jijinshenghua(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 检查玩家存在
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    
    // 检查是否正在渡劫
    if (dj_players[usr_qq]) {
        e.reply('渡劫期间无法极尽升华！');
        return false;
    }
    
    let player = await Read_player(usr_qq);
    
      // 检查境界是否足够
    if (player.mijinglevel_id < 16) {
        e.reply([
            `【极尽升华·境界不足】`,
           
            `你的境界尚未达到要求，无法极尽升华。`,
            `只有达到仙台六层天以上的强者，`,
            `才有资格点燃元神之光，进行终极一跃。`,
           
            `当前境界：${player.mijinglevel_id}级`,
            `最低要求：16级`
        ].join('\n'));
        return true;
    }
    
    // 检查是否已在极尽升华状态
    let isJijin = await redis.get(`xiuxian:player:${usr_qq}:jijinshenghua`);
    if (isJijin) {
        e.reply('你已处于极尽升华状态！');
        return false;
    }
    
     // 检查是否有足够的精气神
    if (player.当前血量 < player.血量上限 * 0.3 || player.修为 < player.修为上限 * 0.3) {
        e.reply([
            `【极尽升华·精气不足】`,
           
            `你的精气神不足，无法支撑极尽升华的消耗。`,
            `当前血量和修为必须保持在30%以上`,
            `才能进行终极一跃。`,
           
            `当前血量：${(player.当前血量/player.血量上限*100).toFixed(1)}%`,
            `当前修为：${(player.修为/player.修为上限*100).toFixed(1)}%`
        ].join('\n'));
        return true;
    }
    
      e.reply([
        `【极尽升华·终极一跃】`,
       
        `你确定要极尽升华吗？这将带来以下效果：`,
        `攻击、防御、生命值提升300%`,
        `全属性临时提升至巅峰状态`,
        `但你的境界将永久下降1级`,
        `效果持续30秒`,
       
        `回复[1]确认极尽升华，回复[0]取消`
    ].join('\n'));
    
    // 设置上下文（关键修改点）
    this.setContext('noticeJijinShenghua');
    return false;
}

/**
 * 确认处理方法（完全参照一键出售模式）
 */
async noticeJijinShenghua(e) {
    if (!verc({ e })) return false;
    
    // 使用与一键出售完全相同的确认逻辑
    let reg = new RegExp(/^1$/);
    let new_msg = this.e.msg;
    let confirm = reg.exec(new_msg);
    if (!confirm) {
        e.reply('已取消极尽升华');
        this.finish('noticeJijinShenghua');
        return false;
    }
    
    this.finish('noticeJijinShenghua');
    
    // ==== 执行极尽升华逻辑 ====
    let usr_qq = e.user_id.toString().replace('qg_', '');
    let player = await Read_player(usr_qq);
    
    // 记录原始属性
    let original = {
        attack: player.攻击,
        defense: player.防御,
        maxHP: player.血量上限,
        hp: player.当前血量,
        level: player.mijinglevel_id
    };
    
    // 提升属性
    player.攻击 *= 3;
    player.防御 *= 3;
    player.血量上限 *= 3;
    player.当前血量 = Math.min(player.当前血量 * 3, player.血量上限);
    
    // 降低境界
    player.mijinglevel_id -= 1;
    
    await Write_player(usr_qq, player);
    
    // 存储状态（30秒）
    await redis.set(`xiuxian:jijin:${usr_qq}`, JSON.stringify(original), 'EX', 30);
    await redis.set(`xiuxian:player:${usr_qq}:jijinshenghua`, '1', 'EX', 30);
    
    // 极尽升华文案
        let message = [
            `【极尽升华·终极一跃】`,
           
            `你长啸一声，体内血气沸腾，元神之光熊熊燃烧！`,
            `"这一世，我为仙！"`,
            `你的身体开始发光，每一寸血肉都在燃烧，`,
            `释放出无尽潜能，重回巅峰状态！`,
            `天地间大道轰鸣，万道法则为你让路，`,
            `这一刻，你仿佛触摸到了仙道领域！`,
           
            `攻击、防御、生命值提升300%！`,
            `全属性临时提升至巅峰状态！`,
           
            `然而，极尽升华的代价是沉重的...`,
            `你的境界降至${player.mijinglevel_id}级`,
            `这种状态只能维持30秒`,
           
            `"纵使跌落境界，也要战至最后一刻！"`
        ].join('\n');
    
    e.reply(message);
    
    // 30秒后自动恢复
    setTimeout(async () => {
        let current = await Read_player(usr_qq);
        let data = await redis.get(`xiuxian:jijin:${usr_qq}`);
        
        if (data) {
            let origin = JSON.parse(data);
            current.攻击 = origin.attack;
            current.防御 = origin.defense;
            current.血量上限 = origin.maxHP;
            current.当前血量 = origin.hp;
            await Write_player(usr_qq, current);
            await redis.del(`xiuxian:jijin:${usr_qq}`);
            await redis.del(`xiuxian:player:${usr_qq}:jijinshenghua`);
              // 通知玩家状态结束
            let endMessage = [
                `【极尽升华结束】`,
               
                `你的极尽升华状态已结束`,
                `"终究...还是未能成仙..."`,
                `你的属性已恢复正常`,
                `但境界的跌落已成事实`,
               
                `"这一世，我败了..."`
            ].join('\n');
             e.reply(endMessage);
        }
    }, 30000);
    
    return false;
}
  

 
 async tryAddPet(e, usr_qq, level_id) {
    let petMsg = "";
    let petName = "";
    
    if (level_id < 42) {
        let random = Math.random();
        let prob = (level_id / 60) * 0.1;
        if (random < prob && data.tupoxianchon.length > 0) {
            let randomIndex = Math.floor(Math.random() * data.tupoxianchon.length);
            let pet = data.tupoxianchon[randomIndex];
            petMsg = `修仙本是逆天而行,神明愿意降下自己的恩泽.这只[${pet.name}],将伴随与你,愿你修仙路上不再独身一人.`;
            petName = pet.name; // 保存仙宠名称
            await Add_najie_thing(usr_qq, pet.name, '仙宠', 1);
        }
    } else {
        let random = Math.random();
        let prob = (level_id / 60) * 0.5;
        if (random < prob && data.tupoxianchon.length > 0) {
            let randomIndex = Math.floor(Math.random() * data.tupoxianchon.length);
            let pet = data.tupoxianchon[randomIndex];
            petMsg = `修仙本是逆天而行,神明愿意降下自己的恩泽.这只[${pet.name}],将伴随与你,愿你修仙路上不再独身一人.`;
            petName = pet.name; // 保存仙宠名称
            await Add_najie_thing(usr_qq, pet.name, '仙宠', 1);
        }
    }
    
    return { message: petMsg, name: petName };
  }
// =================== 一键幸运破体 / 普通破体 ===================
async OneKeyMaxUp(e) {
    if (!e.isGroup) return e.reply('修仙游戏请在群聊中游玩');

    const usr_qq = await channel(e.user_id.toString().replace('qg_', ''));
    if (!await existplayer(usr_qq)) return e.reply('玩家不存在，请先创建角色');

    if (await redis.get("xiuxian:player:" + usr_qq + ":game_action") == 0)
        return e.reply("修仙：游戏进行中...");
    const luck = e.msg.includes('幸运');
    /* ---------- 1. 幸运草预检 ---------- */
    let luckGrassCount = 0;
    if (luck) {
        luckGrassCount = await exist_najie_thing(usr_qq, '幸运草', '道具');
        if (luckGrassCount <= 0) return e.reply('背包中没有幸运草，无法进行幸运破体！');
    }

    /** ========== 时代/体质/位面数据 ========== */
    const set = config.getConfig('xiuxian', 'xiuxian');
    const currentEra = set.Era?.current || { index: 0, years: 0 };
    const eras = [
        { name: "神话时代", breakthrough: { bodySuccessRate: 25, bodyCostFactor: 0.4 }},
        { name: "太古时代", breakthrough: { bodySuccessRate: 10, bodyCostFactor: 0.6 }},
        { name: "天命时代", breakthrough: { bodySuccessRate: 0, bodyCostFactor: 1.0 }},
        { name: "末法时代", breakthrough: { bodySuccessRate: -10, bodyCostFactor: 1.8 }},
        { name: "绝灵时代", breakthrough: { bodySuccessRate: -30, bodyCostFactor: 3.0 }}
    ];
    const era = eras[currentEra.index];

    const player = await Read_player(usr_qq);
    const startLevelInfo = data.LevelMax_list.find(i => i.level_id === player.Physique_id); // ←补上
    const talent = this.getTalentBreakthroughInfo(player);

    const maxLv = 63 - (10 - (await getWeimianLevel()));   // 位面压制
    const msg = [
        luck ? "开启一键幸运破体..." : "开启一键破体...",
        `当前时代：${era.name}`,
        `- 时代特性: 突破成功率 ${era.breakthrough.bodySuccessRate}%，消耗系数 ${era.breakthrough.bodyCostFactor}`
    ];
    let totalCost = 0, fail = 0, addShou = 0, pets = [];

    e.reply(luck ? "一键幸运破体开始，正在积蓄气血..." : "一键破体开始，正在积蓄气血...");

    const initialLevel = player.Physique_id;
    const hasSpecialTalent = talent.costReduction !== 1.0;

    /* =================== 主循环 =================== */
    while (player.Physique_id < maxLv) {
        /* 每轮先查幸运草库存 —— 用完立即停 */
        if (luck && luckGrassCount <= 0) {
            msg.push('幸运草已用完，停止破体');
            break;
        }

        const nowInfo = data.LevelMax_list.find(i => i.level_id === player.Physique_id);
        const nextInfo = data.LevelMax_list.find(i => i.level_id === player.Physique_id + 1);
        if (!nextInfo) break;

        /* 消耗 & 概率 */
        const base = parseInt(nowInfo.exp);
        const afterTalent = Math.round(base * talent.costReduction);
        const cost = Math.ceil(afterTalent * era.breakthrough.bodyCostFactor);
        if (player.血气 < cost) {
            msg.push(`气血不足！需 ${cost}，当前 ${player.血气}`);
            break;
        }

        const baseProb = Math.max(0.01, 1 - player.Physique_id / 60);
        let prob = baseProb + era.breakthrough.bodySuccessRate / 100 + talent.probBonus;
        if (prob < 0.01) prob = 0.01;

        msg.push(`突破：${nowInfo.level} → ${nextInfo.level}`);
        msg.push(`基础消耗: ${base} → 体质后: ${afterTalent} → 时代后: ${cost} (×${era.breakthrough.bodyCostFactor})`);
        msg.push(`突破成功率: ${Math.round(prob * 100)}%（基础:${Math.round(baseProb * 100)}% +时代:${Math.round(era.breakthrough.bodySuccessRate)}% +体质:${Math.round(talent.probBonus * 100)}%）`);

        /* 使用幸运草 */
        if (luck) {
            const originalProb = prob;
            prob = prob + (1 - prob) * 0.5;
            await Add_najie_thing(usr_qq, '幸运草', '道具', -1);
            luckGrassCount--;
            msg.push(`使用幸运草：成功率从${Math.round(originalProb * 100)}%提升至${Math.round(prob * 100)}%`);
        }

        /* 特殊体质特效 */
        if (hasSpecialTalent && (nextInfo.level_id % 10 === 0 || nextInfo.level_id - initialLevel >= 5) && talent.effectDesc) {
            msg.push(talent.effectDesc);
        }

        /* 成败判定 */
        if (Math.random() > prob) { // 失败
            const lost = cost * [0.4, 0.2, 0.1, 0.05, 0][Math.floor(Math.random() * 5)];
            player.血气 -= lost;
            totalCost += lost;
            fail++;
            msg.push(`突破失败！损失气血 ${lost}`);
        } else { // 成功
            player.Physique_id++;
            player.血气 -= cost;
            totalCost += cost;
            const sy = calculateShouyuan(player.Physique_id);
            let actualShouyuanAdd = sy, suppressMsg = "";
            if (currentEra.index === 4 && player.mijinglevel_id < 18) {
                const current = player.寿元;
                const potential = current + sy;
                if (potential > 9999) {
                    actualShouyuanAdd = 9999 - current;
                    suppressMsg = `【寿元压制】处于绝灵时代，寿元被压制至9999年，实际增加${actualShouyuanAdd}年`;
                } else {
                    suppressMsg = `【寿元压制】处于绝灵时代，但增加后未超过9999年`;
                }
                if (!player.压制寿元) player.压制寿元 = current;
                player.压制寿元 += actualShouyuanAdd;
            }
            player.寿元 += actualShouyuanAdd;
            addShou += actualShouyuanAdd;
            msg.push(`${nowInfo.level} → ${nextInfo.level} 成功！寿元 +${actualShouyuanAdd}年`);
            if (suppressMsg) msg.push(suppressMsg);

            /* 仙宠 */
            if (Math.random() < (player.Physique_id < 42 ? 0.1 : 0.5) * player.Physique_id / 60) {
                const pet = data.tupoxianchon[Math.floor(Math.random() * data.tupoxianchon.length)];
                await Add_najie_thing(usr_qq, pet.name, '仙宠', 1);
                pets.push(pet.name);
                msg.push(`获得仙宠：${pet.name}`);
            }
        }
        await Write_player(usr_qq, player);
        let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
        await Add_HP(usr_qq, 99999999);
    }

    /* =================== 收尾 =================== */
    await redis.set("xiuxian:player:" + usr_qq + ":last_Levelup_time", Date.now());
    const finalLevel = data.LevelMax_list.find(i => i.level_id === player.Physique_id).level;
    let resultMsg = [
        `破体结果：`,
        `破体类型：${luck ? "幸运破体" : "普通破体"}`,
        `初始境界：${startLevelInfo.level}`,
        `最终境界：${finalLevel}`,
        `时代影响：${era.name}`,
        `- 成功率：${era.breakthrough.bodySuccessRate}%`,
        `- 消耗系数：${era.breakthrough.bodyCostFactor}`,
        `失败次数：${fail}`,
        `总消耗气血：${bigNumberTransform(totalCost)}`,
        `总增加寿元：${bigNumberTransform(addShou)}年`,
    ].join('\n');
    if (pets.length) resultMsg += `\n获得仙宠：${pets.join('、')}`;
    resultMsg += luck ? `\n使用幸运草：${luckGrassCount === 0 ? '全部' : '部分'}` : '';
    if (currentEra.index >= 3) resultMsg += `\n在${era.name}破体极为艰难，请耐心沉淀`;
    else if (currentEra.index === 0) resultMsg += `\n神话时代加持，大道与你共鸣！`;

    e.reply(resultMsg);
    await ForwardMsg(e, msg);
}




// =================== 一键幸运突破 / 普通突破 ===================
async OneKeyLevelUp(e) {
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }

    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);

    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('玩家不存在，请先创建角色');
        return;
    }

    let game_action = await redis.get("xiuxian:player:" + usr_qq + ":game_action");
    if (game_action == 0) {
        e.reply("修仙：游戏进行中...");
        return;
    }
const luck = e.msg.includes('幸运');
    /* ---------- 1. 幸运草预检 ---------- */
    let luckGrassCount = 0;
    if (luck) {
        luckGrassCount = await exist_najie_thing(usr_qq, '幸运草', '道具');
        if (luckGrassCount <= 0) {
            e.reply('背包中没有幸运草，无法进行幸运突破！');
            return;
        }
    }

    /** ========== 获取当前时代信息 ========== */
    const set = config.getConfig('xiuxian', 'xiuxian');
    const currentEra = set.Era?.current || { index: 0, years: 0 };

    const eras = [
        { name: "神话时代", breakthrough: { qiSuccessRate: 25, qiCostFactor: 0.4 }},
        { name: "太古时代", breakthrough: { qiSuccessRate: 10, qiCostFactor: 0.6 }},
        { name: "天命时代", breakthrough: { qiSuccessRate: 0, qiCostFactor: 1.0 }},
        { name: "末法时代", breakthrough: { qiSuccessRate: -10, qiCostFactor: 1.8 }},
        { name: "绝灵时代", breakthrough: { qiSuccessRate: -30, qiCostFactor: 3.0 }}
    ];

    const currentEraData = eras[currentEra.index];
    const eraRateMessage = currentEraData.breakthrough.qiCostFactor !== 1.0 
        ? `(×${currentEraData.breakthrough.qiCostFactor})` 
        : "";
    /** ========== 时代信息获取结束 ========== */

    let player = await Read_player(usr_qq);

    // 创建消息数组
    let msg = [luck ? "开启一键幸运突破..." : "开启一键突破..."];
    msg.push(`当前时代：${currentEraData.name}`);
    msg.push(`- 时代特性: 突破成功率 ${currentEraData.breakthrough.qiSuccessRate}%，消耗系数 ${currentEraData.breakthrough.qiCostFactor}`);

    let allResults = [];
    let petsObtained = [];
    let totalDeductedExp = 0;
    let failCount = 0;
    let totalAddShouyuan = 0;
    let luckGrassUsed = 0; // 记录使用的幸运草数量

    // 获取当前境界信息
    const startLevelId = player.level_id;
    let startLevelInfo = data.Level_list.find(item => item.level_id == startLevelId);
    let startLevelName = startLevelInfo ? startLevelInfo.level : "未知境界";

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

    let weimianyazhi = 10;
    const weimianLevel = weimianData["诸天位面"] || 10;
    weimianyazhi = 10 - weimianLevel;

    // 检查最高境界
    if (player.level_id >= 64 - weimianyazhi) {
        e.reply(`诸天万界破碎，天地大道残缺，已经难以诞生至高强者，你的境界再难有所寸进`);
        return false;
    }

    // 获取体质突破信息
    const talentInfo = await this.getTalentBreakthroughInfo(player);
    const costReduction = talentInfo.costReduction;
    const probBonus = talentInfo.probBonus;
    const effectDesc = talentInfo.effectDesc;

    if (talentInfo.talentDesc) msg.push(talentInfo.talentDesc);

    e.reply(luck ? "一键幸运突破开始，正在积蓄真元..." : "一键突破开始，正在积蓄真元...");

    const maxLevelId = 64;
    const initialLevel = player.level_id;
    const hasSpecialTalent = talentInfo.costReduction !== 1.0;

    /* =================== 主循环 =================== */
    while (player.level_id < maxLevelId) {
        /* 每轮先查幸运草库存 —— 用完立即停 */
        if (luck && luckGrassCount <= 0) {
            msg.push('幸运草已用完，停止突破');
            break;
        }

        let now_level_info = data.Level_list.find(item => item.level_id == player.level_id);
        if (!now_level_info) {
            msg.push("境界数据异常");
            break;
        }

        let nextLevelId = player.level_id + 1;
        let next_level_info = data.Level_list.find(item => item.level_id == nextLevelId);
        if (!next_level_info) {
            msg.push(`${now_level_info.level} → 已达最高境界`);
            break;
        }
        if (nextLevelId == 42) {
            msg.push(`已达渡劫期，需要先渡劫才能继续突破`);
            break;
        }

        /* 消耗计算 */
        const base_exp = parseInt(now_level_info.exp);
        const talentReducedExp = Math.round(base_exp * costReduction);
        const actual_need_exp = Math.ceil(talentReducedExp * currentEraData.breakthrough.qiCostFactor);

        if (player.修为 < actual_need_exp) {
            msg.push(`修为不足！需要 ${actual_need_exp}，当前 ${player.修为}`);
            break;
        }

        const baseProb = Math.max(0.01, 1 - player.level_id / 60);
        const eraBaseProb = currentEraData.breakthrough.qiSuccessRate / 100;
        let prob = baseProb + eraBaseProb + probBonus;
        if (prob < 0.01) prob = 0.01;

        msg.push(`突破目标：${now_level_info.level} → ${next_level_info.level}`);
        msg.push(`基础消耗: ${base_exp} → 体质后: ${talentReducedExp} → 时代后: ${actual_need_exp} ${eraRateMessage}`);
        msg.push(`☆ 突破成功率: ${Math.round(prob * 100)}%（基础:${Math.round(baseProb * 100)}% +时代:${Math.round(eraBaseProb * 100)}% +体质:${Math.round(probBonus * 100)}%）`);

        /* 使用幸运草 */
        if (luck) {
            const originalProb = prob;
            prob = prob + (1 - prob) * 0.5;
            await Add_najie_thing(usr_qq, "幸运草", "道具", -1);
            luckGrassCount--;
            luckGrassUsed++;
            msg.push(`使用幸运草：成功率从${Math.round(originalProb * 100)}%提升至${Math.round(prob * 100)}%`);
        }

        /* 特殊体质特效 */
        if (hasSpecialTalent && (nextLevelId % 10 === 0 || nextLevelId - initialLevel >= 5) && effectDesc) {
            msg.push(effectDesc);
        }

        /* 成败判定 */
        if (Math.random() > prob) { // 失败
            const lost = actual_need_exp * [0.4, 0.2, 0.1, 0.05, 0][Math.floor(Math.random() * 5)];
            player.修为 -= lost;
            totalDeductedExp += actual_need_exp + lost;
            failCount++;
            msg.push(`突破失败！损失修为 ${actual_need_exp + lost}`);
            await Write_player(usr_qq, player);
            continue;
        }

        /* 成功 */
        player.level_id = nextLevelId;
        player.修为 -= actual_need_exp;
        totalDeductedExp += actual_need_exp;

        const addShouyuan = calculateShouyuan(player.level_id, currentEra.index, player.mijinglevel_id);
        let actualShouyuanAdd = addShouyuan, suppressMsg = "";
        if (currentEra.index === 4 && player.mijinglevel_id < 18) {
            const currentShouyuan = player.寿元;
            const potential = currentShouyuan + addShouyuan;
            if (potential > 9999) {
                actualShouyuanAdd = 9999 - currentShouyuan;
                suppressMsg = `【寿元压制】处于绝灵时代，寿元被压制至9999年，实际增加${actualShouyuanAdd}年`;
            } else {
                suppressMsg = `【寿元压制】处于绝灵时代，但增加后未超过9999年`;
            }
            if (!player.压制寿元) player.压制寿元 = currentShouyuan;
            player.压制寿元 += actualShouyuanAdd;
        }
        player.寿元 += actualShouyuanAdd;
        totalAddShouyuan += actualShouyuanAdd;

        msg.push(`${now_level_info.level} → ${next_level_info.level} 成功！寿元 +${actualShouyuanAdd}年`);
        if (suppressMsg) msg.push(suppressMsg);
        allResults.push(`${now_level_info.level} → ${next_level_info.level}`);

        /* 仙宠 */
        if (Math.random() < (player.level_id < 42 ? 0.1 : 0.5) * player.level_id / 60) {
            const pet = data.tupoxianchon[Math.floor(Math.random() * data.tupoxianchon.length)];
            await Add_najie_thing(usr_qq, pet.name, '仙宠', 1);
            petsObtained.push(pet.name);
            msg.push(`获得仙宠：${pet.name}`);
        }

        await Write_player(usr_qq, player);
        let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
        await Add_HP(usr_qq, 99999999);
    }

    /* =================== 收尾 =================== */
    await redis.set("xiuxian:player:" + usr_qq + ":last_Levelup_time", Date.now());
    const finalLevel = data.Level_list.find(item => item.level_id == player.level_id).level;
    let resultMsg = [
        `突破结果：`,
        `突破类型：${luck ? "幸运突破" : "普通突破"}`,
        `初始境界：${startLevelName}`,
        `最终境界：${finalLevel}`,
        `时代影响：${currentEraData.name}`,
        `- 成功率：${currentEraData.breakthrough.qiSuccessRate}%`,
        `- 消耗系数：${currentEraData.breakthrough.qiCostFactor}`,
        `失败次数：${failCount}`,
        `总消耗修为：${bigNumberTransform(totalDeductedExp)}`,
        `总增加寿元：${bigNumberTransform(totalAddShouyuan)}年`,
    ].join("\n");
    if (petsObtained.length) resultMsg += `\n获得仙宠：${petsObtained.join('、')}`;
    if (luckGrassUsed) resultMsg += `\n使用幸运草：${luckGrassUsed}个`;
    if (currentEra.index >= 3) resultMsg += `\n在${currentEraData.name}突破极为艰难，请耐心沉淀`;
    else if (currentEra.index === 0) resultMsg += `\n神话时代加持，大道与你共鸣！`;

    await e.reply(resultMsg);
    await ForwardMsg(e, msg);
}


/**
 * 获取特殊体质的突破加成和特效信息
 * @param {Object} player 玩家对象
 * @returns {Object} 包含加成效果和特效文案的对象
 */
 getTalentBreakthroughInfo(player) {
    const talentType = player.灵根?.type || "";
    const talentName = player.灵根?.name || "";
    
    // 默认值（无特殊体质）
    let result = {
        costReduction: 1.0,   // 消耗系数（1.0表示无折扣）
        probBonus: 0,         // 成功率加成（0表示无加成）
        talentDesc: "",       // 体质特性描述（突破开始时显示）
        effectDesc: ""        // 突破特效描述（突破成功时显示）
    };
    
    // 根据体质类型设置加成和特效
    switch(talentName) {
        case "大成·荒古圣体":
            result.costReduction = 0.75;
            result.probBonus = 0.25;
            result.talentDesc = `【大成圣体】体质觉醒：混沌初开，万道共鸣！突破消耗减少25%，成功率提升25%！`;
            result.effectDesc = `【大成圣体异象】\n苦海翻腾黄金光，仙台轮转阴阳图！金色血气贯穿九天十地，\n大道仙音响彻虚空，混沌青莲在身后绽放，万道法则皆俯首！`;
            break;
            
        case "混沌体":
            result.costReduction = 0.85;
            result.probBonus = 0.15;
            result.talentDesc = `【混沌体】道则显化：身与道合，言出法随！突破消耗减少15%，成功率提升15%！`;
            result.effectDesc = `【混沌体异象】\n紫气东来三万里，道经梵音震寰宇！星辰为珠，银河为链，\n身后浮现三千大道化身，每一道目光都映照一个古老宇宙！`;
            break;
            
        case "先天混沌圣体道胎":
            result.costReduction = 0.65;
            result.probBonus = 0.35;
            result.talentDesc = `【先天混沌圣体道胎】混沌初开，鸿蒙始判！突破消耗减少35%，成功率提升35%！`;
            result.effectDesc = `【先天混沌圣体道胎异象】\n混沌初开，鸿蒙始判！周身混沌气弥漫，演化开天辟地之景，\n大道符文在体内交织成永恒神链，仙王虚影在混沌中叩拜！`;
            break;
            
        case "大成·神王体":
            result.costReduction = 0.80;
            result.probBonus = 0.20;
            result.talentDesc = `【神王体】神王净土展开，万道神光垂落！突破消耗减少20%，成功率提升20%！`;
            result.effectDesc = `【神王体异象】\n神王净土展开，万道神光垂落！九天神王虚影降临，脚踏星河，\n眸射乾坤，诸天法则为之臣服，万界生灵齐声诵唱神王之名！`;
            break;
            
        case "天妖体":
            result.costReduction = 0.90;
            result.probBonus = 0.10;
            result.talentDesc = `【天妖体】妖气冲霄，万兽朝拜！突破消耗减少10%，成功率提升10%！`;
            result.effectDesc = `【天妖体异象】\n妖气冲霄，万兽朝拜！太古妖神虚影显化，背负日月，掌托星辰，\n九幽黄泉在脚下流淌，九天仙宫在头顶沉浮，妖道法则镇压诸天！`;
            break;
            
        case "道胎":
            result.costReduction = 0.95;
            result.probBonus = 0.05;
            result.talentDesc = `【道胎】道法自然，胎息天地！突破消耗减少5%，成功率提升5%！`;
            result.effectDesc = `【道胎异象】\n道法自然，胎息天地！周身道韵流转，与天地大道共鸣，\n万法不侵，诸邪避退，身后浮现大道宝瓶，吞吐日月精华！`;
            break;
            
        case "小成·荒古圣体":
            result.costReduction = 0.70;
            result.probBonus = 0.30;
            result.talentDesc = `【荒古圣体】金色血气冲霄汉，圣体异象压诸天！突破消耗减少30%，成功率提升30%！`;
            result.effectDesc = `【荒古圣体异象】\n金色血气冲霄汉，圣体异象压诸天！锦绣山河、阴阳生死图、\n仙王临九天、混沌种青莲四大异象齐出，镇压万古青天！`;
            break;
            
        case "苍天霸体":
            result.costReduction = 0.75;
            result.probBonus = 0.25;
            result.talentDesc = `【苍天霸体】紫血沸腾，霸体无敌！突破消耗减少25%，成功率提升25%！`;
            result.effectDesc = `【苍天霸体异象】\n紫血沸腾，霸体无敌！紫色血气化作九天真龙，环绕周身，\n霸钟长鸣震碎虚空，霸戟横空撕裂苍穹，霸者之气睥睨万界！`;
            break;
            
        case "重瞳":
            result.costReduction = 0.85;
            result.probBonus = 0.15;
            result.talentDesc = `【重瞳】眸开天地，重瞳破虚！突破消耗减少15%，成功率提升15%！`;
            result.effectDesc = `【重瞳异象】\n眸开天地，重瞳破虚！左眼演化开天辟地，右眼映照诸天寂灭，\n眸光所至，时空凝固，大道法则在瞳孔中交织成不朽神图！`;
            break;
            
        case "先天圣体道胎":
            result.costReduction = 0.60;
            result.probBonus = 0.40;
            result.talentDesc = `【先天圣体道胎】圣体与道胎合一，先天立于不败！突破消耗减少40%，成功率提升40%！`;
            result.effectDesc = `【先天圣体道胎异象】\n圣体与道胎合一，先天立于不败！混沌青莲在脚下绽放，\n仙王虚影在身后叩首，大道宝瓶悬浮头顶，吞吐日月星辰！`;
            break;
            
        case "彼岸·命运神道体":
            result.costReduction = 0.50;
            result.probBonus = 0.50;
            result.talentDesc = `【彼岸·命运神道体】命运长河显化，彼岸花开！突破消耗减少50%，成功率提升50%！`;
            result.effectDesc = `【彼岸·命运神道体异象】\n命运长河显化，彼岸花开！诸天命运轮盘在身后转动，\n过去现在未来三身合一，超脱彼岸，掌缘生灭！`;
            break;
            
        default:
            // 根据体质名称补充特殊体质
            if (talentName.includes("魔胎")) {
                result.costReduction = 0.90;
                result.probBonus = 0.10;
                result.talentDesc = `【魔胎】魔气滔天，万魔朝拜！突破消耗减少10%，成功率提升10%！`;
                result.effectDesc = `【魔胎异象】\n魔气滔天，万魔朝拜！太古魔渊在脚下开启，亿万魔影叩首，\n魔主虚影显化，魔道法则镇压诸天！`;
            }
            else if (talentName.includes("仙体")) {
                result.costReduction = 0.85;
                result.probBonus = 0.15;
                result.talentDesc = `【仙体】仙光璀璨，道韵天成！突破消耗减少15%，成功率提升15%！`;
                result.effectDesc = `【仙体异象】\n仙光璀璨，道韵天成！九重仙宫在头顶浮现，仙王讲道，仙女散花，\n仙道法则化作神链环绕周身！`;
            }
            else {
                // 普通体质无加成
                result.costReduction = 1.0;
                result.probBonus = 0.0;
                result.talentDesc = "";
                result.effectDesc = "";
            }
    }
    
    return result;
}
// 破体函数（单次破体）
async LevelMax_up(e, luck) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    // 有无账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    
    // 获取游戏状态
    let game_action = await redis.get('xiuxian:player:' + usr_qq + ':game_action');
    if (game_action == 0) {
        e.reply('修仙：游戏进行中...');
        return false;
    }
    
    /** ========== 获取当前时代信息 ========== */
    const cf = config.getConfig('xiuxian', 'xiuxian');
    const currentEra = cf.Era?.current || { index: 0, years: 0 };
    
    // 时代定义
    const eras = [
        { name: "神话时代", breakthrough: { bodySuccessRate: 25, bodyCostFactor: 0.4 } },
        { name: "太古时代", breakthrough: { bodySuccessRate: 10, bodyCostFactor: 0.6 } },
        { name: "天命时代", breakthrough: { bodySuccessRate: 0, bodyCostFactor: 1.0 } },
        { name: "末法时代", breakthrough: { bodySuccessRate: -10, bodyCostFactor: 1.8 } },
        { name: "绝灵时代", breakthrough: { bodySuccessRate: -30, bodyCostFactor: 3.0 } }
    ];
    
    const currentEraData = eras[currentEra.index];
    const eraRateMessage = currentEraData.breakthrough.bodyCostFactor !== 1.0 
        ? `(×${currentEraData.breakthrough.bodyCostFactor})` 
        : "";
    /** ========== 时代信息获取结束 ========== */
    
    // 读取玩家信息
    let player = await Read_player(usr_qq);
    
    // 使用体质突破信息函数获取加成和特效
    const talentInfo = await this.getTalentBreakthroughInfo(player);
    const costReduction = talentInfo.costReduction;
    const probBonus = talentInfo.probBonus;
    const talentDesc = talentInfo.talentDesc;
    const effectDesc = talentInfo.effectDesc;
    
    // 如果有体质特性描述，则显示
    if (talentDesc) {
        e.reply(talentDesc);
    }
    
    // 创建消息数组
    let msg = [luck ? "幸运破体..." : "破体..."];
    msg.push(`当前时代：${currentEraData.name}`);
    msg.push(`- 时代特性: 突破成功率 ${currentEraData.breakthrough.bodySuccessRate}%，消耗系数 ${currentEraData.breakthrough.bodyCostFactor}`);
    
    // 获取当前境界信息
    const startLevelId = player.Physique_id;
    let startLevelInfo = data.LevelMax_list.find(item => item.level_id == startLevelId);
    let startLevelName = startLevelInfo ? startLevelInfo.level : "未知境界";
    
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
    
    let weimianyazhi = 10;
    // 检查位面等级
    const weimianLevel = weimianData["诸天位面"] || 10;
    weimianyazhi = 10 - weimianLevel;
    
    // 检查最高境界
    if (player.Physique_id >= 63 - weimianyazhi) {
        e.reply(`诸天万界破碎，天地大道残缺，已经难以诞生至高强者，你的境界再难有所寸进`);
        return false;
    }

    // 最高境界设置为63
    const maxLevelId = 63;

    // 记录突破的初始境界（用于特殊体质突破特效）
    const initialLevel = player.Physique_id;
    const hasSpecialTalent = talentInfo.costReduction !== 1.0; // 是否有特殊体质

    // 只尝试突破下一个境界
    let now_level_info = data.LevelMax_list.find(item => item.level_id == player.Physique_id);
    if (!now_level_info) {
        e.reply("境界数据异常");
        return false;
    }
  
    // 确定下一境界信息
    let nextLevelId = player.Physique_id + 1;
    let next_level_info = data.LevelMax_list.find(item => item.level_id == nextLevelId);
    
    // 检查最高境界
    if (nextLevelId > 63 - weimianyazhi) {
        e.reply(`诸天万界破碎，天地大道残缺，已经难以诞生至高强者，你的境界再难有所寸进`);
        return false;
    }
    
    if (!next_level_info) {
        e.reply(`${now_level_info.level} → 已达最高境界`);
        return false;
    }
    
    // ========== 应用体质消耗减少 ==========
    let base_need_exp = parseInt(now_level_info.exp);
    let talentReducedExp = Math.round(base_need_exp * costReduction);
    
    // ========== 应用时代消耗系数 ==========
    let actual_need_exp = Math.ceil(talentReducedExp * currentEraData.breakthrough.bodyCostFactor);
    
    // 加入境界信息到消息列表
    msg.push(`突破：${now_level_info.level} → ${next_level_info.level}`);
    msg.push(`基础消耗: ${base_need_exp} → 体质后: ${talentReducedExp} → 时代后: ${actual_need_exp} ${eraRateMessage}`);
    
    if (player.血气 < actual_need_exp) {
        e.reply(`气血不足！需要 ${actual_need_exp}，当前 ${player.血气}`);
        return false;
    }
    
    // ========== 应用时代成功率和体质加成 ==========
    // 计算基础成功率（基于当前境界）
    const baseProb = Math.max(0.01, 1 - player.Physique_id / 60);
    
    // 计算突破概率（时代基础成功率 + 体质加成）
    const eraBaseProb = currentEraData.breakthrough.bodySuccessRate / 100;
    let prob = baseProb + eraBaseProb + probBonus;
    
    if (prob < 0.01) prob = 0.01; // 下限1%
    
    msg.push(`突破成功率: ${Math.round(prob * 100)}%（基础境界成功率：${Math.round(baseProb * 100)}% + 时代基础:${Math.round(eraBaseProb * 100)}% + 体质加成:${Math.round(probBonus * 100)}%）`);
    
    // 应用幸运草效果（如果有可用）
    let luckGrassUsed = 0;
    let usedLuck = false;
    
    if (luck) {
        const hasLuckGrass = await exist_najie_thing(usr_qq, "幸运草", "道具");
        if (hasLuckGrass) {
            let originalProb = prob;
            prob = prob + (1 - prob) * 0.5; // 幸运草效果：提高失败部分的50%成功率
            await Add_najie_thing(usr_qq, "幸运草", "道具", -1);
            luckGrassUsed++;
            usedLuck = true;
            msg.push(`幸运草加成：失败概率减少50%，成功率从${Math.round(originalProb * 100)}%提升至${Math.round(prob * 100)}%`);
        } else {
            msg.push(`背包中没有幸运草，无法使用幸运破体`);
        }
    }
    
    // 特殊体质突破特效 - 只在突破重要大境界时触发（每10级）
    if (hasSpecialTalent && (nextLevelId % 10 === 0)) {
        if (effectDesc) {
            msg.push(effectDesc);
        }
    }
    
    // 破体判定（使用综合成功率）
    if (Math.random() > prob) {
        // 突破失败
        const bad_time = Math.random();
        let lostExp = 0;
        
        if (bad_time > 0.9) lostExp = actual_need_exp * 0.4;
        else if (bad_time > 0.8) lostExp = actual_need_exp * 0.2;
        else if (bad_time > 0.7) lostExp = actual_need_exp * 0.1;
        else lostExp = 0;
        
        player.血气 -= lostExp;
        
        if (player.血气 < 0) {
            player.血气 = 0;
            msg.push(`气血耗尽！`);
        }
        
        // 加入失败信息到消息列表
        if (lostExp > 0) {
            msg.push(`突破失败！损失${lostExp}点气血`);
        } else {
            msg.push(`突破失败！`);
        }
        
        await Write_player(usr_qq, player);
    } else {
        // 突破成功
        player.Physique_id = nextLevelId;
        player.血气 -= actual_need_exp;
        
        // 计算理论寿元增加量
        const theoryShouyuan = calculateShouyuan(player.Physique_id);
        
        // ==== 寿元压制处理 ====
        let actualShouyuanAdd = theoryShouyuan; // 实际增加的寿元
        let suppressMsg = ""; // 压制提示信息
        
        // 检查是否处于绝灵时代且境界低于仙王
        if (currentEra.index === 4 && player.mijinglevel_id < 18) {
            // 计算当前寿元
            const currentShouyuan = player.寿元;
            
            // 计算增加后的寿元
            const potentialShouyuan = currentShouyuan + theoryShouyuan;
            
            // 如果超过9999，只增加到9999
            if (potentialShouyuan > 9999) {
                actualShouyuanAdd = 9999 - currentShouyuan;
                suppressMsg = `【寿元压制】由于处于绝灵时代，寿元被压制至9999年，实际增加${actualShouyuanAdd}年`;
            } else {
                suppressMsg = `【寿元压制】处于绝灵时代，但增加后未超过9999年`;
            }
            
            // 更新压制寿元（原始寿元记录）
            if (!player.压制寿元) {
                player.压制寿元 = currentShouyuan;
            }
            player.压制寿元 += actualShouyuanAdd;
        }
        
        // 增加寿元
        player.寿元 += actualShouyuanAdd;
        
        // 加入成功信息到消息列表
        msg.push(`${next_level_info.level} → 突破成功！`);
        msg.push(`寿元增加: ${actualShouyuanAdd}年`);
        if (suppressMsg) {
            msg.push(suppressMsg);
        }

        // 尝试获得仙宠
        let petResult = await this.tryAddPet(e, usr_qq, player.Physique_id);
        if (petResult.message) {
            msg.push(` ${petResult.message}`);
        }
        
        // 更新玩家数据
        await Write_player(usr_qq, player);
        let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
        await Add_HP(usr_qq, 99999999);
    }
    
    // 更新玩家数据
    await Write_player(usr_qq, player);
    
    // 整个突破结束后设置CD
    await redis.set("xiuxian:player:" + usr_qq + ":last_Levelup_time", Date.now());
    
    // 获取最终境界信息
    let finalLevelInfo = data.LevelMax_list.find(item => item.level_id == player.Physique_id);
    let finalLevel = finalLevelInfo ? finalLevelInfo.level : "未知境界";
    
    // 构建结果消息
    let resultMsg = [
        `破体结果：`,
        `破体类型：${luck ? "幸运破体" : "普通破体"}`,
        `初始境界：${startLevelName}`,
        `当前境界：${finalLevel}`,
        `时代影响：${currentEraData.name}`,
        `- 成功率：${currentEraData.breakthrough.bodySuccessRate}%`,
        `- 消耗系数：${currentEraData.breakthrough.bodyCostFactor}`,
        `气血消耗：${actual_need_exp}`
    ].join("\n");
    
    // 如果使用了幸运草
    if (luckGrassUsed > 0) {
        resultMsg += `\n使用幸运草：${luckGrassUsed}个`;
    }
    
    // 特殊结果：时代不利时的额外消息
    if (currentEra.index >= 3) { // 末法/绝灵时代
        resultMsg += `\n在${currentEraData.name}破体极为艰难，请耐心沉淀`;
    } else if (currentEra.index === 0) { // 神话时代
        resultMsg += `\n神话时代加持，大道与你共鸣！`;
    }

    // 合并所有消息
    const combinedMsg = [
        resultMsg,
        '',
        '===== 详细过程 =====',
        ...msg
    ].join('\n');
    
    e.reply(combinedMsg);
    return false;
}

// 突破函数（单次突破）
async Level_up(e, luck) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    // 有无账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    
    // 获取游戏状态
    let game_action = await redis.get('xiuxian:player:' + usr_qq + ':game_action');
    if (game_action == 0) {
        e.reply('修仙：游戏进行中...');
        return false;
    }
    
    /** ========== 获取当前时代信息 ========== */
    const cf = config.getConfig('xiuxian', 'xiuxian');
    const currentEra = cf.Era?.current || { index: 0, years: 0 };
    
    // 时代定义
    const eras = [
        { name: "神话时代", breakthrough: { qiSuccessRate: 25, qiCostFactor: 0.4 } },
        { name: "太古时代", breakthrough: { qiSuccessRate: 10, qiCostFactor: 0.6 } },
        { name: "天命时代", breakthrough: { qiSuccessRate: 0, qiCostFactor: 1.0 } },
        { name: "末法时代", breakthrough: { qiSuccessRate: -10, qiCostFactor: 1.8 } },
        { name: "绝灵时代", breakthrough: { qiSuccessRate: -30, qiCostFactor: 3.0 } }
    ];
    
    const currentEraData = eras[currentEra.index];
    const eraRateMessage = currentEraData.breakthrough.qiCostFactor !== 1.0 
        ? `(${currentEraData.breakthrough.qiCostFactor})` 
        : "";
    /** ========== 时代信息获取结束 ========== */
    
    // 读取玩家信息
    let player = await Read_player(usr_qq);
    
    // 使用体质突破信息函数获取加成和特效
    const talentInfo = await this.getTalentBreakthroughInfo(player);
    const costReduction = talentInfo.costReduction;
    const probBonus = talentInfo.probBonus;
    const talentDesc = talentInfo.talentDesc;
    const effectDesc = talentInfo.effectDesc;
    
    // 如果有体质特性描述，则显示
    if (talentDesc) {
        e.reply(talentDesc);
    }
    
    /** ========== 荒古圣体末法/绝灵时代特殊效果 ========== */
    if (player.灵根.name === "荒古圣体" && (currentEra.index === 3 || currentEra.index === 4)) {
        // 苦海未开辟限制
        if (player.mijinglevel_id < 2 && player.xiangulevel_id < 2 && player.level_id >= 1) {
            e.reply([
                `【${currentEraData.name}压制】`,
                `你的圣体苦海被天地法则锁住，如神铁般坚固！`,
                `在此${currentEraData.name}，没有足够灵气开辟苦海路径。`,
                `若想突破，必须先证道开辟苦海或等待其他时代`
            ].join("\n"));
            return false;
        }

        // 高阶突破限制
        if (player.level_id > 39) {
            e.reply([
                `【${currentEraData.name}诅咒】`,
                `天地不认可荒古圣体的大道法则在${currentEraData.name}愈发强烈！`,
                `无形之力压制你的突破，天道法则如枷锁般缠绕圣体。`,
                `若想打破命运，必须让圣体觉醒至小成或等待时代更迭`
            ].join("\n"));
            return false;
        }
        
        // 额外成功率惩罚
        probBonus -= 0.2;
        e.reply([
            `【圣体压制】`,
            `在${currentEraData.name}，荒古圣体受到天地法则压制！`,
            `突破成功率额外降低20%`,
            `当前成功率：${Math.round((currentEraData.breakthrough.qiSuccessRate/100 + probBonus) * 100)}%`
        ].join("\n"));
    }
    /** ========== 荒古圣体特殊效果结束 ========== */
    
    // 境界
    let now_level = data.Level_list.find(item => item.level_id == player.level_id)?.level || "未知境界";
 
    // 拦截渡劫期
    if (now_level == '无妄真劫境') {
        if (player.power == 2) {
            e.reply('你已度过雷劫，请感应仙门#登仙');
        } else {
            e.reply(`请先渡劫！`);
        }
        return false;
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
    
    let weimianyazhi = 10
    // 检查位面等级
    const weimianLevel = weimianData["诸天位面"] || 10;
    weimianyazhi = 10 - weimianLevel
    
    // 检查最高境界
    if (player.level_id >= 64-weimianyazhi) {
        e.reply(`诸天万界破碎，天地大道残缺，已经难以诞生至高强者，你的境界再难有所寸进`);
        return false;
    }
    
    // 检查最高境界
    if (player.level_id >= 64) {
        e.reply(`你已突破至最高境界`);
        return false;
    }
 
    // 计算所需寿元
    const shouyuan = calculateShouyuan(player.level_id);
    
    // 检查修为是否足够
    const now_level_info = data.Level_list.find(item => item.level_id == player.level_id);
    if (!now_level_info) {
        e.reply('境界数据异常');
        return false;
    }
    
    // 计算实际消耗（基础消耗 → 体质减免 → 时代影响）
    const base_need_exp = now_level_info.exp;
    const talentReducedExp = Math.round(base_need_exp * costReduction);
    const actual_need_exp = Math.ceil(talentReducedExp * currentEraData.breakthrough.qiCostFactor);
    const yuanshen = base_need_exp/1000
    
    if (player.修为 < actual_need_exp) {
        e.reply([
            `修为不足！`,
            `当前时代：${currentEraData.name}`,
            `基础需求：${base_need_exp}`,
            `体质减免：${talentReducedExp}`,
            `时代影响：${actual_need_exp} ${eraRateMessage}`,
            `还需积累${actual_need_exp - player.修为}点修为方可突破`
        ].join("\n"));
        return false;
    }
    
    // 高阶突破限制
    if (player.level_id > 25) {
        if (player.yuanshenlevel_id == undefined){
            e.reply([
                `你还未凝练出紫府元神，难以突破！`,
                `你需要获取修炼元神的法门或去精神宇宙摘取天药让元神涅槃。`,
            ].join("\n"));
            return false;
        }
    }
    
    // 检查CD
    const Time = cf.CD.level_up;
    const now_Time = new Date().getTime();
    const shuangxiuTimeout = parseInt(60000 * Time);
    
    let last_time = await redis.get('xiuxian:player:' + usr_qq + ':last_Levelup_time');
    last_time = parseInt(last_time);
    
    if (now_Time < last_time + shuangxiuTimeout) {
        const Couple_m = Math.trunc((last_time + shuangxiuTimeout - now_Time) / 60 / 1000);
        const Couple_s = Math.trunc(((last_time + shuangxiuTimeout - now_Time) % 60000) / 1000);
        e.reply(`突破正在CD中，剩余CD: ${Couple_m}分 ${Couple_s}秒`, false, { at: true });
        return false;
    }
    
    let now_level_id = data.Level_list.find(
        item => item.level_id == player.level_id
    ).level_id;
    
    // 计算基础成功率（基于当前境界）
    const baseProb = 1 - now_level_id / 60; // 境界越高，基础成功率越低
    
    // 应用时代影响
    const eraProb = currentEraData.breakthrough.qiSuccessRate / 100; // 时代基础成功率
    const eraBonus = eraProb * 1; // 时代加成效果（取时代基础成功率的50%）
    
    // 应用体质影响
    const talentBonus = probBonus; // 体质加成效果
    
    // 计算最终成功率
    let prob = baseProb + eraBonus + talentBonus;
    
    // 幸运草额外加成（如果有）
    let luckGrassUsed = 0;
    let luckyCloverMsg = "";
    
    // 如果是幸运模式，检查背包中是否有幸运草
    if (luck) {
        const hasLuckGrass = await exist_najie_thing(usr_qq, '幸运草', '道具');
        if (hasLuckGrass) {
            // 幸运草效果：减少50%失败概率
            const originalProb = prob;
            prob = prob + (1 - prob) * 0.5; // 失败概率减少50%
            await Add_najie_thing(usr_qq, "幸运草", "道具", -1);
            luckGrassUsed++;
            luckyCloverMsg = `幸运草加成：失败概率减少50%，成功率从${Math.round(originalProb * 100)}%提升至${Math.round(prob * 100)}%`;
        }
    }
    
    // 限制概率范围
    prob = Math.min(3, Math.max(0.01, prob)); // 确保在1%到99%之间
    
    // 创建消息数组
    let msg = [
        `突破准备完成`,
        `当前境界：${now_level_id}重天`,
        `境界基础成功率：${Math.round(baseProb * 100)}%`,
        `时代加成：+${Math.round(eraBonus * 100)}%`,
        `体质加成：+${Math.round(talentBonus * 100)}%`,
        luckyCloverMsg,
        `综合成功率：${Math.round(prob * 100)}%`,
        `基础消耗：${base_need_exp}`,
        `体质减免后：${talentReducedExp}`,
        `时代影响后：${actual_need_exp} ${eraRateMessage}`
    ].filter(Boolean);
    
    // 突破判定
    let rand = Math.random();
    
    // 突破失败处理
    if (rand > prob) {
        const bad_time = Math.random();
        let lostExp = 0;
        let failMsg = "";
        
        if (bad_time > 0.9) {
            lostExp = actual_need_exp * 0.4;
            failMsg = [
                `突破失败！损失${lostExp}点修为`,
                `正当你感悟天道时，突然灵光一闪：`,
                `"等等，我好像悟出了相对论！E=mc²！"`,
                `现代物理学与修仙法则冲突，真元瞬间紊乱！`
            ].join("\n");
        } else if (bad_time > 0.8) {
            lostExp = actual_need_exp * 0.2;
            failMsg = [
                `突破失败！损失${lostExp}点修为`,
                `关键时刻，你的本命法器突然提示：`,
                `"系统更新：新增'自动修炼'功能，需要重新启动"`,
                `修仙系统强制更新，中断了突破进程！`
            ].join("\n");
        } else if (bad_time > 0.7) {
            lostExp = actual_need_exp * 0.1;
            failMsg = [
                `突破失败！损失${lostExp}点修为`,
                `凝神之际，突然想起重要事情：`,
                `"糟糕！今天修仙界双十一，我的购物车还没清！"`,
                `心神激荡，真元逆流，突破功亏一篑！`
            ].join("\n");
        } else if (bad_time > 0.6) {
            lostExp = 0;
            failMsg = [
                `突破失败！`,
                `你正感悟大道，仙宠突然递上玉简：`,
                `"主人，您的修仙信用评分下降了！"`,
                `分神查看，突破良机已逝`
            ].join("\n");
        } else if (bad_time > 0.5) {
            lostExp = actual_need_exp * 0.05;
            failMsg = [
                `突破失败！损失${lostExp}点修为`,
                `突破紧要关头，突然顿悟：`,
                `"我好像...忘记关洞府的炼丹炉了！"`,
                `心神不宁，真元运行岔了道`
            ].join("\n");
        } else if (bad_time > 0.4) {
            lostExp = 0;
            failMsg = [
                `突破失败！`,
                `关键时刻，突然收到仙信：`,
                `"道友，您预约的仙剑保养服务已到期"`,
                `分神之际，突破良机溜走`
            ].join("\n");
        } else if (bad_time > 0.3) {
            lostExp = actual_need_exp * 0.15;
            failMsg = [
                `突破失败！损失${lostExp}点修为`,
                `关键时刻，天道突然提示：`,
                `"检测到异常登录，请验证您不是心魔"`,
                `忙着人脸识别，错过了突破时机`
            ].join("\n");
        } else {
            lostExp = actual_need_exp * 0.1;
            failMsg = [
                `突破失败！损失${lostExp}点修为`,
                `突破时突然想起：`,
                `"今天好像是修仙界税务申报截止日..."`,
                `心神不宁，真元运行失常`
            ].join("\n");
        }
        
        player.修为 -= lostExp;
        await Write_player(usr_qq, player);
        await redis.set('xiuxian:player:' + usr_qq + ':last_Levelup_time', now_Time);
        
        msg.push(failMsg);
    } else {
        // 突破成功 - 仙宠获取
        let petChance = player.level_id < 42 ? 
            ((player.level_id / 60) * 0.5) / 5 : 
            (player.level_id / 60) * 0.5;
        
        if (Math.random() < petChance) {
            const randomIndex = Math.floor(Math.random() * data.tupoxianchon.length);
            const pet = data.tupoxianchon[randomIndex];
            
            const petMsg = `修仙本是逆天而行,神明愿意降下自己的恩泽.这只[${pet.name}],将伴随与你,愿你修仙路上不再独身一人.`;
            msg.push(petMsg);
            await Add_najie_thing(usr_qq, pet.name, '仙宠', 1);
        }

        // 境界提升
        const newLevelId = player.level_id + 1;
        player.level_id = newLevelId;
        player.修为 -= actual_need_exp;

        // ==== 新增：寿元增加逻辑（考虑绝灵时代限制）====
        let actualShouyuanAdd = shouyuan; // 实际增加的寿元
        let suppressMsg = ""; // 压制提示信息

        // 检查是否处于绝灵时代且境界低于仙王
        if (currentEra.index === 4 && player.mijinglevel_id < 18) {
            // 计算当前寿元
            const currentShouyuan = player.寿元;
            
            // 计算增加后的寿元
            const potentialShouyuan = currentShouyuan + shouyuan;
            
            // 如果超过9999，只增加到9999
            if (potentialShouyuan > 9999) {
                actualShouyuanAdd = 9999 - currentShouyuan;
                suppressMsg = `【寿元压制】由于处于绝灵时代，寿元被压制至9999年，实际增加${actualShouyuanAdd}年`;
            } else {
                suppressMsg = `【寿元压制】处于绝灵时代，但增加后未超过9999年`;
            }
            
            // 更新压制寿元（原始寿元记录）
            if (!player.压制寿元) {
                player.压制寿元 = currentShouyuan;
            }
            player.压制寿元 += actualShouyuanAdd;
        }

        // 增加寿元
        player.寿元 += actualShouyuanAdd;
        // ==== 寿元增加逻辑结束 ====

        // 保存玩家数据
        await Write_player(usr_qq, player);
        
        // 刷新装备
        let equipment = await Read_equipment(usr_qq);
        await Write_equipment(usr_qq, equipment);
        
        // 补血
        await Add_HP(usr_qq, 999999999999);
        
        // 获取新境界名称
        const newLevelInfo = data.Level_list.find(item => item.level_id == newLevelId);
        const newLevelName = newLevelInfo ? newLevelInfo.level : "未知境界";
        
        // 记录CD
        await redis.set('xiuxian:player:' + usr_qq + ':last_Levelup_time', now_Time);
        
        // 构建成功消息
        let successMsg = [
            `突破成功至${newLevelName}`,
            `寿元增加：${actualShouyuanAdd}年`,
            `修为消耗：${actual_need_exp}`,
            `当前时代：${currentEraData.name}`,
            `体质加成：${Math.round(probBonus * 100)}%`,
            `综合成功率：${Math.round(prob * 100)}%`
        ].join("\n");
        
        // 添加压制提示
        if (suppressMsg) {
            successMsg += `\n${suppressMsg}`;
        }
        
        // 特殊体质特效
        if (effectDesc) {
            successMsg += `\n${effectDesc}`;
        }
        
        // 荒古圣体在末法/绝灵时代突破成功的特殊消息
        if (player.灵根.name === "荒古圣体" && (currentEra.index === 3 || currentEra.index === 4)) {
            successMsg += `\n【圣体逆天】\n` +
                `在${currentEraData.name}的压制下，你以圣体本源硬撼天道枷锁！\n` +
                `金色血气贯穿九霄，圣体之力逆天而上，打破时代桎梏！`;
        }
        
        // 添加幸运草使用信息
        if (luckGrassUsed > 0) {
            successMsg += `\n使用幸运草：${luckGrassUsed}个`;
        }
        
        msg.push(successMsg);
    }
    
    // 合并所有消息
    const combinedMsg = [
        '===== 突破结果 =====',
        ...msg
    ].join('\n');
    
    e.reply(combinedMsg);
    return false;
}


  async yes(e) {
    if (!verc({ e })) return false;
    /** 内容 */
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let new_msg = this.e.message;
    let choice = new_msg[0].text;
    let now = new Date();
    let nowTime = now.getTime(); //获取当前时间戳
    if (choice == '先不突破') {
      await this.reply('放弃突破');
      this.finish('yes');
      return false;
    } else if (choice == '确认突破') {
      redis.set('xiuxian:player:' + usr_qq + ':levelup', 1);
      e.reply('请再次#突破，或#幸运突破！');
      //console.log(this.getContext().recall);
      this.finish('yes');
      return false;
    } else {
      this.setContext('yes');
      await this.reply(
        '突破后灵根将被固化，无法使用【洗根水】进行洗髓！回复:【确认突破】或者【先不突破】进行选择'
      );
      return false;
    }
    /** 结束上下文 */
  }

  async Level_up_normal(e) {
    this.Level_up(e, false);
    return false
  }

  async LevelMax_up_normal(e) {
    this.LevelMax_up(e, false);
    return false
  }

  async Level_up_luck(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let x = await exist_najie_thing(usr_qq, '幸运草', '道具');
    if (!x) {
      e.reply('醒醒，你没有道具【幸运草】!');
      return false;
    }
    this.Level_up(e, true);
    return false
  }

  async LevelMax_up_luck(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let x = await exist_najie_thing(usr_qq, '幸运草', '道具');
    if (!x) {
      e.reply('醒醒，你没有道具【幸运草】!');
      return false;
    }
    this.LevelMax_up(e, true);
    return false
  }
// 新增指令：打散雷云
async command_dasan(e) {
  if (!verc({ e })) return false;
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  
  // 检查玩家是否存在
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) return false;
  
  let player = await Read_player(usr_qq);
  
  // 检查境界要求（这里设定为45重及以上境界）
  if (player.Physique_id < 45&&player.mijinglevel_id < 6) {
    e.reply('你的力量不足以打散雷云！');
    return false;
  }
  if (player.power ==1) {
    e.reply('你早已经将肉身劫打散了！');
    return false;
  }
  // 检查是否正在渡劫
  if (!dj_players[usr_qq]) {
    e.reply('当前没有雷劫，无需打散！');
    return false;
  }
  
  // 清除定时器
  clearInterval(dj_players[usr_qq].timer);
  
  // 标记渡肉身劫成功
  player.power = 1;
  
  // 计算属性加成（根据雷劫道数）
  const grade = dj_players[usr_qq].grade;
  const bonus = 500000 * grade;
  
  player.生命加成 += bonus;
  player.血量上限 += bonus;
  player.当前血量 += bonus;
  player.防御加成 += bonus;
  player.防御 += bonus;
  player.攻击加成 += bonus;
  player.攻击 += bonus;
  // 额外奖励：元神强化
  const spiritBonus = 100000 * grade;
  player.元神 += spiritBonus;
  player.元神上限 += spiritBonus;
  await Write_player(usr_qq, player);
  
  // 移除渡劫记录
  delete dj_players[usr_qq];
  

  
 e.reply([
    `≡≡≡ 雷云崩散 ≡≡≡`,
    `${player.名号}施展无上法力，一拳轰散雷云！`,
    `天地震动，雷劫消散于无形！`,
    `≡ 肉身劫完成！全属性提升${bonus}`,
    `≡ 元神强化：+${spiritBonus}`,
    `≡ 当前已渡劫道数：${grade}`,
    `≡ 请准备渡元神劫，完成最终证道！`
  ].join("\n"));
  
  return true;
}
async  fate_up(e) {
  if (!verc({ e })) return false;
  
  // 获取玩家信息
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  
  // 账号检查
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) return false;
  
  let player = await Read_player(usr_qq);
  
  // 境界检查
  let now_level = data.Level_list.find(
    item => item.level_id == player.level_id
  )?.level;

  if (!now_level || now_level != '无妄真劫境') {
    e.reply(`你非无妄真劫境修士！`);
    return false;
  }
  
  // 灵根检查
  if (player.linggenshow == 1) {
    e.reply(`你灵根未开，不能渡劫！`);
    return false;
  }
  
  // 检查渡劫状态
  if (player.power === 2) {
    e.reply('你已渡过双重真劫，请感应仙门#登仙');
    return false;
  }
  
  // 特殊状态：已过肉身劫，只需渡元神劫
  if (player.power === 1) {
    // 冷却时间检查
    const cooldown = 30 * 60 * 1000; // 24小时冷却
    const lastFailTime = player.元神劫上次失败时间 || 0;
    
    if (Date.now() - lastFailTime < cooldown) {
      const remainMs = cooldown - (Date.now() - lastFailTime);
      const remainHours = (remainMs / (30 * 60 * 1000)).toFixed(1);
      
      e.reply([
        `元神尚未恢复，强行渡劫恐有魂飞魄散之险！`,
        `还需等待 ${remainHours} 小时才能重渡元神劫`
      ].join("\n"));
      return false;
    }
    
    // 元神恢复检查
    const minSpirit = 500000; // 无妄真劫境最低元神要求
    if (player.元神 < minSpirit) {
      e.reply([
        `${player.名号}元神尚未恢复！`,
        `需要至少${minSpirit}点元神方可再渡此劫`,
        `推荐前往高等精神世界寻找元神宝物`
      ].join("\n"));
      return false;
    }
    
    // 直接进入元神劫
    e.reply(`≡≡≡ 再渡元神劫 ≡≡≡\n${player.名号}重聚元神，再战真劫！`);
     // 执行元神劫
    return await spirit_tribulation(e, player);
  }
  
  
  // ===== 首次渡劫检查 =====
  
  // 血量检查
  let list_HP = data.Level_list.find(
    item => item.level == '无妄真劫境'
  )?.基础血量 || 12000000;
  
  if (player.当前血量 < list_HP * 0.9) {
    player.当前血量 = 1;
    await Write_player(usr_qq, player);
    e.reply(`${player.名号}血量亏损，强行渡劫后晕倒在地！`);
    return false;
  }
  
  // 修为检查
  let now_level_id = player.level_id;
  let need_exp = data.Level_list.find(
    item => item.level_id == now_level_id
  )?.exp || 20000000;
  
  if (player.修为 < need_exp) {
    e.reply(`修为不足，再积累${need_exp - player.修为}修为后方可突破`);
    return false;
  }
  
  // 元神检查
  const minSpirit = 500000; // 无妄真劫境最低元神要求
  if (player.元神 < minSpirit) {
    e.reply([
      `${player.名号}元神强度不足！`,
      `需要至少${minSpirit}点元神方能承受真劫之威`,
      `推荐前往高等精神世界寻找元神宝物`
    ].join("\n"));
    return false;
  }

  // 开始双劫渡仙
  e.reply(`≡≡≡ 无妄真劫启 ≡≡≡\n${player.名号}即将面对双重劫难：天雷淬体！元神化真！`);
    player.dj =1;
    await Write_player(usr_qq, player);
  // 进入雷劫函数
 await mortal_tribulation(e, player);
}
  //#羽化登仙
  //专门为渡劫期设计的指令
  async Level_up_Max(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    //不开放私聊
    if (!verc({ e })) return false;
    //获取游戏状态
    let game_action = await redis.get(
      'xiuxian:player:' + usr_qq + ':game_action'
    );
    //防止继续其他娱乐行为
    if (game_action == 0) {
      e.reply('修仙：游戏进行中...');
      return false;
    }
    //读取信息
    let player = await Read_player(usr_qq);
    //境界
    let now_level = data.Level_list.find(
      item => item.level_id == player.level_id
    ).level;
    if (now_level != '无妄真劫境') {
      e.reply(`你非无妄真劫境修士！`);
      return false;
    }
    //查询redis中的人物动作
    let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
    action = JSON.parse(action);
    //不为空
    if (action != null) {
      let action_end_time = action.end_time;
      let now_time = new Date().getTime();
      if (now_time <= action_end_time) {
        let m = parseInt((action_end_time - now_time) / 1000 / 60);
        let s = parseInt((action_end_time - now_time - m * 60 * 1000) / 1000);
        e.reply('正在' + action.action + '中,剩余时间:' + m + '分' + s + '秒');
        return false;
      }
    }
    if (player.power != 2) {
      e.reply('请先渡劫！');
      return false;
    }
    //需要的修为
    let now_level_id;
    if (!isNotNull(player.level_id)) {
      e.reply('请先#刷新信息');
      return false;
    }
    now_level_id = data.Level_list.find(
      item => item.level_id == player.level_id
    ).level_id;
    let now_exp = player.修为;
    //修为
    let need_exp = data.Level_list.find(
      item => item.level_id == player.level_id
    ).exp;
    if (now_exp < need_exp) {
      e.reply(`修为不足,再积累${need_exp - now_exp}修为后方可成仙！`);
      return false;
    }
    //零，开仙门
    if (player.power == 2) {
      e.reply(
        '天空一声巨响，一道虚影从眼中浮现，突然身体微微颤抖，似乎感受到了什么，' +
          player.名号 +
          '来不及思索，立即向前飞去！只见万物仰头相望，似乎感觉到了，也似乎没有感觉，殊不知......'
      );
      now_level_id = now_level_id + 1;
      player.level_id = now_level_id;
      player.修为 -= need_exp;
      player.power_place= 1;
      await Write_player(usr_qq, player);
      let equipment = await Read_equipment(usr_qq);
      await Write_equipment(usr_qq, equipment);
      await Add_HP(usr_qq, 99999999);
      //突破成仙人
      if (now_level_id >= 42) {
        let player = data.getData('player', usr_qq);
        if (!isNotNull(player.宗门)) {
          return false;
        }
        //有宗门
        if (player.宗门.职位 != '宗主') {
          let ass = data.getAssociation(player.宗门.宗门名称);
          ass[player.宗门.职位] = ass[player.宗门.职位].filter(
            item => item != usr_qq
          );
          ass['所有成员'] = ass['所有成员'].filter(item => item != usr_qq);
          data.setAssociation(ass.宗门名称, ass);
          delete player.宗门;
          data.setData('player', usr_qq, player);
          await player_efficiency(usr_qq);
          e.reply('退出宗门成功');
        } else {
          let ass = data.getAssociation(player.宗门.宗门名称);
          if (ass.所有成员.length < 2) {
            fs.rmSync(
              `${data.filePathMap.association}/${player.宗门.宗门名称}.json`
            );
            delete player.宗门; //删除存档里的宗门信息
            data.setData('player', usr_qq, player);
            await player_efficiency(usr_qq);
            e.reply(
              '一声巨响,原本的宗门轰然倒塌,随着流沙沉没,世间再无半分痕迹'
            );
          } else {
            ass['所有成员'] = ass['所有成员'].filter(item => item != usr_qq); //原来的成员表删掉这个B
            delete player.宗门; //删除这个B存档里的宗门信息
            data.setData('player', usr_qq, player);
            await player_efficiency(usr_qq);
            //随机一个幸运儿的QQ,优先挑选等级高的
            let randmember_qq;
            if (ass.副宗主.length > 0) {
              randmember_qq = await get_random_fromARR(ass.副宗主);
            } else if (ass.长老.length > 0) {
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
            data.setData('player', randmember_qq, randmember); //记录到存档
            data.setData('player', usr_qq, player);
            data.setAssociation(ass.宗门名称, ass); //记录到宗门
            e.reply(
              `飞升前,遵循你的嘱托,${randmember.名号}将继承你的衣钵,成为新一任的宗主`
            );
          }
        }
      }
      return false;
    }
    return false;
  }
  
}
// 寿元计算函数
function calculateShouyuan(level) {

    if (level <= 6) return 3;
    if (level <= 11) return 10;
    if (level <= 16) return 20;
    if (level <= 21) return 50;
    if (level <= 26) return 100;
    if (level <= 31) return 200;
    if (level <= 36) return 500;
    if (level <= 40) return 1000;
    if (level === 41) return 1500;
    if (level <= 44) return (level - 41) * 700 + 1500; // 2200到3600
    if (level <= 52) return (level - 44) * 1000 + 3600; // 4600到11600
    if (level <= 55) return (level - 52) * 1500 + 11600; // 13100到16100
    if (level === 56) return 20000;
    if (level <= 62) return (level - 55) * 3000 + 20000; // 23000到41000
    if (level >= 63) return 999999999999;
    return 0; // 默认值
 
}


// 辅助函数：获取胜利诗篇
function getVictoryVerse(emperorTitle) {
    const verses = [
        `紫气东来三万里，${emperorTitle}证道时！`,
        `踏碎凌霄不回头，${emperorTitle}镇寰宇！`,
        `九天神魔皆低首，${emperorTitle}掌春秋！`,
        `混沌初开立新道，${emperorTitle}掌乾坤！`
    ];
    return verses[Math.floor(Math.random() * verses.length)];
}
// 辅助函数：心魔对战
async function battleDemon(player, demonPower) {
    // 简化版战斗逻辑
    const playerPower = player.攻击 * 1010+ player.防御 * 111;
    
    // 战斗结果
    if (playerPower > demonPower * 1.5) {
        return { success: true, msg: "心魔被道法净化的瞬间消散" };
    } 
    else if (playerPower > demonPower) {
        return { success: true, msg: "经历苦战后斩灭心魔" };
    }
    else if (playerPower > demonPower * 0.7) {
        // 50%几率险胜
        return { 
            success: Math.random() > 0.5, 
            msg: "与心魔两败俱伤后艰难取胜"
        };
    }
    else {
        return { success: false, msg: "心魔侵蚀道基" };
    }
}
/**
 * 大数字转换（支持到千垓 10^23）
 * @param {number} value - 要转换的数字值
 * @returns {string} - 转换后的带单位字符串
 */
 function bigNumberTransform(value) {
    // 边界处理和类型检查
    if (typeof value !== 'number' || isNaN(value)) {
        return '0';
    }
    
    // 处理负数和零
    if (value < 0) return '-' + bigNumberTransform(-value);
    if (value === 0) return '0';
    
    // 小于1万时直接返回原生数值
    if (value < 10000) return value.toString();
    
    // 精简单位体系（万、千万、亿、千亿、兆、千兆、京、千京、垓、千垓）
    const units = [
        { threshold: 1e4, units: ['万', '千万'] },      // 万级：1e4~1e7
        { threshold: 1e8, units: ['亿', '千亿'] },      // 亿级：1e8~1e11
        { threshold: 1e12, units: ['兆', '千兆'] },     // 兆级：1e12~1e15
        { threshold: 1e16, units: ['京', '千京'] },     // 京级：1e16~1e19
        { threshold: 1e20, units: ['垓', '千垓'] }      // 垓级：1e20~1e23+
    ];

    // 查找合适的单位和数量级
    for (let i = units.length - 1; i >= 0; i--) {
        const level = units[i];
        
        // 检查是否使用千倍单位
        const useKiloUnit = value >= level.threshold * 1000;
        const unitIndex = useKiloUnit ? 1 : 0;
        
        if (value >= (useKiloUnit ? level.threshold * 1000 : level.threshold)) {
            const divisor = useKiloUnit ? level.threshold * 1000 : level.threshold;
            const convertedValue = value / divisor;
            
            // 格式化为三位小数并去除尾部零
            let result = convertedValue.toFixed(3)
                .replace(/\.?0+$/, '') // 去除尾随零和小数点
                .replace(/(\.\d*?)0+$/, '$1'); // 去除小数点后的尾随零
            
            return result + level.units[unitIndex];
        }
    }
    // 理论上不会执行到此处（1万以上已被处理）
    return value.toString();
}
// 睡眠函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// 获取玩家自创帝经列表（同步函数）
function getCustomDiJingList() {
    try {
        // 直接使用内存中已加载的自创帝经数组
        if (!data || !data.dijingList) {
            return [];
        }
        
        // 确保是数组
        if (!Array.isArray(data.dijingList)) {
            console.error('自创帝经数据格式错误：应为数组');
            return [];
        }
        
        // 提取有效的帝经名称
        return data.dijingList
            .filter(sutra => sutra && sutra.name && typeof sutra.name === 'string')
            .map(sutra => sutra.name);
    } catch (error) {
        console.error('获取自创帝经失败:', error);
        return [];
    }
}

// 获取所需功法名称（同步函数）
function getRequiredGongfaName(player, realm) {
    // 获取玩家自创帝经列表
    const customDiJingList = getCustomDiJingList();
    
    // 完整帝经列表（优先级最高）
    const fullDiJingList = [
        "虚空经", "恒宇经", "妖帝古经", "无始经", 
        "太阳真经", "太阴真经", "万龙古经", 
        ...customDiJingList // 添加玩家自创帝经
    ];
    
    // 检查玩家是否拥有完整帝经（包括自创）
    if (player.学习的功法 && Array.isArray(player.学习的功法)) {
        for (const gongfa of player.学习的功法) {
            if (fullDiJingList.includes(gongfa)) {
                return gongfa;
            }
        }
    }
    
    // 如果没有完整帝经，则返回当前秘境对应的单一经卷名称
    const singleGongfaMap = {
        "轮海": "道经·轮海卷",
        "道宫": "西皇经·道宫卷",
        "四极": "恒宇经·四极卷",
        "化龙": "太皇经·化龙卷",
        "仙台": "无始经·仙台卷"
    };
    
    return singleGongfaMap[realm];
}

// 同步函数：检查是否拥有所需功法
function hasRequiredGongfa(player, realm) {
    // 获取玩家自创帝经列表（同步）
    const customDiJingList = getCustomDiJingList();
    
    // 单一秘境经卷的默认名称
    const singleGongfaMap = {
        "轮海": ["道经·轮海卷","西皇经·轮海卷","摇光经·轮海卷"],
        "道宫": ["西皇经·道宫卷","摇光经·道宫卷"],
        "四极": ["恒宇经·四极卷"],
        "化龙": ["太皇经·化龙卷"],
        "仙台": ["太阴真经·仙台卷", "太阳真经·仙台卷"]
    };
    
    // 完整帝经列表（包括自创）
    const fullDiJingList = [
        "虚空经", "恒宇经", "自然大道", "妖帝古经", 
        "无始经", "太阳真经", "太阴真经", "万龙古经", 
        "乱古经", "不灭天功", "吞天魔功", "永恒终极剑道", 
        "西皇经", "摇光圣典", ...customDiJingList
    ];
    
    // 检查玩家是否拥有当前秘境的单一经卷
    const requiredSingleGongfa = singleGongfaMap[realm];
    if (requiredSingleGongfa && requiredSingleGongfa.some(gongfa => player.学习的功法.includes(gongfa))) {
        return true;
    }
    
    // 检查玩家是否拥有完整帝经（包括自创）
    for (const gongfa of player.学习的功法) {
        if (fullDiJingList.includes(gongfa)) {
            return true;
        }
    }
    
    return false;
}

