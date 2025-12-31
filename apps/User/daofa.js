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
  channel,
  ForwardMsg
} from '../../model/xiuxian.js';
// 在玩家数据结构中添加轮回大道相关字段
const playerTemplate = {
    // ...其他字段
    轮回大道: {
        境界: "未入门", // 生死境初期、生死境中期、生死境后期、生死境大圆满、岁月境初期等
        生死境: {
            阶段: 0, // 0-3 对应初期到圆满
            进度: 0, // 当前阶段进度百分比
            掌控生死: 0, // 掌控生死的能力值
            突破寿元压制: 0, // 突破寿元压制的能力值
        },
        岁月境: {
            阶段: 0, // 0-3 对应初期到圆满
            进度: 0, // 当前阶段进度百分比
            掌控时间: 0, // 掌控时间的能力值
            改变时代: 0, // 改变时代的能力值
        },
        修炼记录: [] // 记录每次修炼
    }
};
  // 在文件顶部定义功法层级分类
const GONGFA_HIERARCHY = {
    "神慧者": 0,
    "仙帝法": 1,
    "仙王法": 2,
    "十凶宝术": 3,
    "帝经": 4,
    "九秘": 5,
    "盖世杀术": 5,
    "道与法": 6,
    "宝术": 6,
    "天赋": 7,
    "天魔法": 7,
    "命运法": 7,
    "修炼功法": 8,
    "炼器": 8,
    "技能": 8,
    "武学": 8,
    "限定功法": 0.5,
    "天帝经": 3.5
};
const aptitudeMap = {
'天弃之人': 0,
'先天不足': 1,
'平庸之资': 2,
'超凡资质': 3,
'天纵之资': 4,
'旷世奇才': 5,
'绝世天骄': 6,
'万古无双': 7,
'无演无尽': 8
};
// 天资等级序列
const aptitudeSequence = [
    '天弃之人',      // 0
    '先天不足',      // 1
    '平庸之资',      // 2
    '超凡资质',      // 3
    '天纵之资',      // 4
    '旷世奇才',      // 5
    '绝世天骄',      // 6
    '万古无双',      // 7
    '无演无尽'       // 8
];
export class daofa extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_daofa',
      dsc: '道与法模块',
      event: 'message',
      priority: 600,
      rule: [

                {
  reg: '^#创造自身之道\\s+(.*)$',  // 匹配 #创造自身之道 后跟任意字符
  fnc: 'createOwnWay',         
},
{
  reg: '^#修炼自身之道(?:\\*(\\d+))?$',  // 支持可选*数字后缀
  fnc: 'cultivateOwnWay',
}, 
    {
                    reg: '^#轮回大道$',
                    fnc: 'viewReincarnationWay',
                    dsc: '查看当前轮回大道境界'
                },
                {
                    reg: '^#修炼轮回大道(?:\\*(\\d+))?$',
                    fnc: 'cultivateReincarnationWay',
                    dsc: '修炼轮回大道'
                },
                {
                    reg: '^#掌控生死\\s+@(\\d+)\\s+(\\d+)$',
                    fnc: 'controlLifeDeath',
                    dsc: '掌控目标玩家的生死（延长或缩短寿元）',
                    permission: 'master' // 仅管理员可用
                },
                {
                    reg: '^#推进时代\\s+(\\d+)$',
                    fnc: 'advanceEra2',
                    dsc: '直接推进时代（岁月境大圆满可用）',
                },     
    {
    reg: '^#创造帝经\\s*(.*)$',
    fnc: 'createEmperorSutra',
    dsc: '炉养百经，开创属于自己的无上帝经'
}
      ],
    });
  }


// 检查玩家是否满足功法学习条件
async  checkGongfaRequirements(player) {
    // 获取所有功法数据
    const allGongfa = await data.gongfa_list;
    
    // 加载限定功法列表
    const timegongfa_list = await data.timegongfa_list;
    
    // 获取玩家自创帝经列表
    const customSutras = await data.dijingList;
    
    let validGongfaCount = 0; // 有效功法计数（类型1-7）
    
    // 遍历玩家已学习的功法
    if (player.学习的功法 && player.学习的功法.length > 0) {
        for (const gongfaName of player.学习的功法) {
            // 检查是否为玩家自创帝经
            const isCustomSutra = customSutras.some(item => item.name === gongfaName);
            if (isCustomSutra) {
                // 天帝经属于有效功法（层级3.5）
                validGongfaCount++;
                continue;
            }
            
            // 检查是否为限定功法
            const isTimeLimited = timegongfa_list.some(item => item.name === gongfaName);
            if (isTimeLimited) {
                // 限定功法层级0.5，不计入有效功法
                continue;
            }
            
            // 在全局功法数据中查找匹配的功法
            const gongfa = allGongfa.find(item => item.name === gongfaName);
            
            if (gongfa && gongfa.type) {
                // 获取功法层级
                const hierarchy = GONGFA_HIERARCHY[gongfa.type];
                
                // 检查是否为有效功法（层级1-7）
                if (hierarchy !== undefined && hierarchy >= 1 && hierarchy <= 7) {
                    validGongfaCount++;
                }
            }
        }
    }
    
    return validGongfaCount;
}
    // 查看轮回大道状态
    async viewReincarnationWay(e) {
        const usr_qq = e.user_id.toString().replace('qg_', '');
        const player = await Read_player(usr_qq);
        
        const reincarnation = player.轮回大道 || {
            境界: "未入门",
            生死境: {阶段: 0, 进度: 0},
            岁月境: {阶段: 0, 进度: 0}
        };
        
        let message = [
            `【轮回大道·当前境界】`,
            `境界：${reincarnation.境界}`,
            ``
        ];
        
        if (reincarnation.境界.includes("生死境")) {
            const stageNames = ["初期", "中期", "后期", "大圆满"];
            const stage = reincarnation.生死境.阶段;
            const progress = reincarnation.生死境.进度;
            
            message.push(
                `生死境：${stageNames[stage]}（${progress}%）`,
                `掌控生死：${reincarnation.生死境.掌控生死.toFixed(1)}`,
                `突破寿元压制：${reincarnation.生死境.突破寿元压制.toFixed(1)}`,
                ``,
                `境界能力：`,
                `- 延长自身寿元（最高${(reincarnation.生死境.掌控生死 * 100).toFixed(0)}%）`,
                `- 突破绝灵时代寿元压制（最高${(reincarnation.生死境.突破寿元压制 * 100).toFixed(0)}%）`
            );
            
            if (stage === 3) {
                message.push(`- 掌控往生（可复活死亡时间不超过1小时的玩家）`);
            }
        }
        
        if (reincarnation.境界.includes("岁月境")) {
            const stageNames = ["初期", "中期", "后期", "大圆满"];
            const stage = reincarnation.岁月境.阶段;
            const progress = reincarnation.岁月境.进度;
            
            message.push(
                `岁月境：${stageNames[stage]}（${progress}%）`,
                `掌控时间：${reincarnation.岁月境.掌控时间.toFixed(1)}`,
                `改变时代：${reincarnation.岁月境.改变时代.toFixed(1)}`,
                ``,
                `境界能力：`,
                `- 加速或减缓局部时间流速`,
                `- 短暂推进个人时间（加速修炼）`
            );
            
            if (stage === 3) {
                message.push(`- 直接改变时代（需满足特定条件）`);
            }
        }
        
        if (reincarnation.境界 === "未入门") {
            message.push(
                `轮回大道尚未入门`,
                `需达到准帝境界方可开始修炼`,
                `使用指令：#修炼轮回大道 开始修炼`
            );
        }
        
        e.reply(message.join('\n'));
        return true;
    }
    
    // 修炼轮回大道
    async cultivateReincarnationWay(e) {
        const usr_qq = e.user_id.toString().replace('qg_', '');
        const player = await Read_player(usr_qq);
        
        // 检查境界是否足够（准帝以上）
        if (player.mijinglevel_id < 15) {
            return e.reply([
                `欲修轮回大道，需先登临准帝之境！`,
                `你当前境界仅为${player.mijinglevel_id}，`,
                `需达到准帝境界方可修炼轮回大道`
            ].join('\n'));
        }
        
        // 解析倍数参数
        const match = e.msg.match(/#修炼轮回大道\*(\d+)/);
        const batchTimes = match ? Math.min(parseInt(match[1]), 99) : 1; // 限制最大99次
        
        // 初始化轮回大道数据
        if (!player.轮回大道) {
            player.轮回大道 = {
                境界: "生死境初期",
                生死境: {
                    阶段: 0,
                    进度: 0,
                    掌控生死: 0.1,
                    突破寿元压制: 0
                },
                岁月境: {
                    阶段: 0,
                    进度: 0,
                    掌控时间: 0,
                    改变时代: 0
                },
                修炼记录: []
            };
        }
        
        const reincarnation = player.轮回大道;
        
        // 计算总消耗
        const costPerTime = this.getReincarnationCost(reincarnation);
        const totalCost = costPerTime * batchTimes;
        
        // 检查资源是否足够
        if (player.修为 < totalCost || player.寿元 < totalCost * 100) {
            return e.reply([
                `修炼轮回大道需消耗大量修为和寿元！`,
                `单次消耗：${bigNumberTransform(costPerTime)}修为 + ${costPerTime * 100}年寿元`,
                `批量消耗：${batchTimes}×${bigNumberTransform(costPerTime)} = ${bigNumberTransform(totalCost)}修为`,
                `         ${batchTimes}×${costPerTime * 100} = ${totalCost * 100}年寿元`,
                `当前修为：${bigNumberTransform(player.修为)}`,
                `当前寿元：${player.寿元}年`,
                `所需修为：${bigNumberTransform(totalCost)}`,
                `所需寿元：${totalCost * 100}年`
            ].join('\n'));
        }
        
        // 扣除资源
        player.修为 -= totalCost;
        player.寿元 -= totalCost * 100;
        
        // 记录修炼过程
        let progressGain = 0;
        let stageUp = false;
        let newStage = reincarnation.生死境.阶段;
        let newProgress = reincarnation.生死境.进度;
        let newRealm = reincarnation.境界;
        
        for (let i = 0; i < batchTimes; i++) {
            // 增加进度
            newProgress += this.getProgressPerCultivation(reincarnation);
            
            // 检查是否突破阶段
            if (newProgress >= 100) {
                newProgress = 0;
                newStage++;
                stageUp = true;
                
                // 生死境突破到岁月境
                if (reincarnation.境界.includes("生死境") && newStage > 3) {
                    reincarnation.境界 = "岁月境初期";
                    reincarnation.岁月境.阶段 = 0;
                    reincarnation.岁月境.进度 = 0;
                    newStage = 0;
                    newRealm = "岁月境初期";
                }
                
                // 更新能力值
                this.updateReincarnationAbilities(reincarnation);
            }
            
            // 记录每次修炼
            reincarnation.修炼记录.push({
                时间: new Date().toLocaleString(),
                消耗修为: costPerTime,
                消耗寿元: costPerTime * 100,
                进度增加: this.getProgressPerCultivation(reincarnation)
            });
        }
        
        // 更新数据
        if (reincarnation.境界.includes("生死境")) {
            reincarnation.生死境.阶段 = newStage;
            reincarnation.生死境.进度 = newProgress;
        } else {
            reincarnation.岁月境.阶段 = newStage;
            reincarnation.岁月境.进度 = newProgress;
        }
        
        reincarnation.境界 = newRealm;
        
        // 保存数据
        await Write_player(usr_qq, player);
        
        // 构建回复消息
        let message = [
            `【轮回大道·精进修炼】`,
            `消耗：${bigNumberTransform(totalCost)}修为 + ${totalCost * 100}年寿元`,
            `当前境界：${newRealm}`
        ];
        
        if (reincarnation.境界.includes("生死境")) {
            const stageNames = ["初期", "中期", "后期", "大圆满"];
            message.push(
                `生死境：${stageNames[newStage]}（${newProgress.toFixed(1)}%）`,
                `掌控生死：${reincarnation.生死境.掌控生死.toFixed(2)}`,
                `突破寿元压制：${reincarnation.生死境.突破寿元压制.toFixed(2)}`
            );
        } else {
            const stageNames = ["初期", "中期", "后期", "大圆满"];
            message.push(
                `岁月境：${stageNames[newStage]}（${newProgress.toFixed(1)}%）`,
                `掌控时间：${reincarnation.岁月境.掌控时间.toFixed(2)}`,
                `改变时代：${reincarnation.岁月境.改变时代.toFixed(2)}`
            );
        }
        
        if (stageUp) {
            message.push(
                ``,
                `【境界突破】`,
                `轮回大道境界提升！`,
                `获得新的天地感悟！`
            );
        }
        
        e.reply(message.join('\n'));
        return true;
    }
    
    // 获取轮回大道修炼消耗
    getReincarnationCost(reincarnation) {
        if (reincarnation.境界.includes("生死境")) {
            const stage = reincarnation.生死境.阶段;
            // 基础消耗：1亿修为
            // 每阶段增加50%
            return 1e8 * Math.pow(1.5, stage);
        } else {
            const stage = reincarnation.岁月境.阶段;
            // 基础消耗：10亿修为
            // 每阶段增加100%
            return 1e9 * Math.pow(2, stage);
        }
    }
    
    // 获取每次修炼增加的进度
    getProgressPerCultivation(reincarnation) {
        if (reincarnation.境界.includes("生死境")) {
            const stage = reincarnation.生死境.阶段;
            // 初期：每次5%，中期：4%，后期：3%，大圆满：2%
            return [5, 4, 3, 2][stage];
        } else {
            const stage = reincarnation.岁月境.阶段;
            // 初期：每次4%，中期：3%，后期：2%，大圆满：1%
            return [4, 3, 2, 1][stage];
        }
    }
    
    // 更新轮回大道能力值
    updateReincarnationAbilities(reincarnation) {
        if (reincarnation.境界.includes("生死境")) {
            const stage = reincarnation.生死境.阶段;
            // 掌控生死：初期0.1，中期0.3，后期0.6，大圆满1.0
            reincarnation.生死境.掌控生死 = [0.1, 0.3, 0.6, 1.0][stage];
            // 突破寿元压制：初期0，中期0.1，后期0.3，大圆满0.5
            reincarnation.生死境.突破寿元压制 = [0, 0.1, 0.3, 0.5][stage];
        } else {
            const stage = reincarnation.岁月境.阶段;
            // 掌控时间：初期0.1，中期0.3，后期0.6，大圆满1.0
            reincarnation.岁月境.掌控时间 = [0.1, 0.3, 0.6, 1.0][stage];
            // 改变时代：初期0，中期0.1，后期0.3，大圆满0.5
            reincarnation.岁月境.改变时代 = [0, 0.1, 0.3, 0.5][stage];
        }
    }
    
    // 掌控生死（管理员指令）
    async controlLifeDeath(e) {
        const match = e.msg.match(/^#掌控生死\s+@(\d+)\s+(\d+)$/);
        if (!match) return;
        
        const targetQQ = match[1];
        const years = parseInt(match[2]);
        
        const usr_qq = e.user_id.toString().replace('qg_', '');
        const player = await Read_player(usr_qq);
        
        // 检查是否达到生死境大圆满
        if (!player.轮回大道 || !player.轮回大道.境界.includes("生死境大圆满")) {
            return e.reply('只有达到生死境大圆满境界才能掌控生死！');
        }
        
        const targetPlayer = await Read_player(targetQQ);
        if (!targetPlayer) {
            return e.reply(`未找到目标玩家：${targetQQ}`);
        }
        
        // 延长或缩短寿元
        targetPlayer.寿元 += years;
        
        // 寿元不能低于0
        if (targetPlayer.寿元 < 0) targetPlayer.寿元 = 0;
        
        await Write_player(targetQQ, targetPlayer);
        
        e.reply([
            `【生死掌控·轮回大道】`,
            `${player.名号}施展无上轮回大道！`,
            `目标玩家：${targetPlayer.名号}`,
            `寿元${years > 0 ? '增加' : '减少'}：${Math.abs(years)}年`,
            `当前寿元：${targetPlayer.寿元}年`
        ].join('\n'));
        
        return true;
    }
    
    // 推进时代（管理员指令）
    async advanceEra2(e) {
        const match = e.msg.match(/^#推进时代\s+(\d+)$/);
        if (!match) return;
        
        const years = parseInt(match[1]);
        
        const usr_qq = e.user_id.toString().replace('qg_', '');
        const player = await Read_player(usr_qq);
        
        // 检查是否达到岁月境大圆满
        if (!player.轮回大道 || !player.轮回大道.境界.includes("岁月境大圆满")) {
            return e.reply('只有达到岁月境大圆满境界才能推进时代！');
        }
        
        // 获取当前时代配置
        const eraConfig = config.getConfig('xiuxian', 'Era') || {
            current: { index: 0, years: 0 }
        };
        
        // 推进时代
        eraConfig.current.years += years;
        
        // 检查是否进入新时代
        if (eraConfig.current.years >= 10000) {
            const eraCount = Math.floor(eraConfig.current.years / 10000);
            eraConfig.current.years %= 10000;
            eraConfig.current.index = (eraConfig.current.index + eraCount) % this.eras.length;
        }
        
        // 保存配置
        config.setConfig('xiuxian', 'Era', eraConfig);
        
        e.reply([
            `【岁月流转·轮回大道】`,
            `${player.名号}施展无上轮回大道！`,
            `时间长河奔涌向前！`,
            `时代推进：${years}年`,
            `当前时代：${this.eras[eraConfig.current.index].name}`,
            `当前年份：${eraConfig.current.years}/10000年`
        ].join('\n'));
        
        return true;
    }



async  createOwnWay(e) {
    try {
        if (!e.isGroup) {
            e.reply('请在群聊中创造自身之道');
            return true;
        }

        const usr_qq = e.user_id.toString().replace('qg_', '');
        const player = await Read_player(usr_qq);
        
        // 检查冷却时间
        if (player.大道冷却时间 && player.大道冷却时间 > Date.now()) {
            const remainingHours = Math.ceil((player.大道冷却时间 - Date.now()) / (60 * 60 * 1000));
            return e.reply([
                `「大道反噬未愈！」`,
                `开创大道失败后需调息恢复`,
                `剩余冷却时间：${remainingHours}小时`,
                `请耐心等待`
            ].join('\n'));
        }

        // === 前置条件检查 ===
        // 生命本源检查
        if (player.生命本源 < 50) {
            return e.reply([
                `「生命本源亏损！」`,
                `开创大道需消耗生命本源`,
                `当前生命本源：${player.生命本源}`,
                `需至少50点生命本源`,
                `可通过 #修复生命本源 或服用神药恢复`
            ].join('\n'));
        }
        
        // 道伤检查
        if (player.道伤 > 0) {
            return e.reply([
                `「身负道伤，难证大道！」`,
                `大道伤痕会阻碍你与天地大道的共鸣`,
                `当前道伤：${player.道伤}`,
                `请先使用 #修复道伤 或服用神药修复大道伤痕`
            ].join('\n'));
        }
        
        // 顶级功法检查
        const topGongfaList = [
            "行字秘", "皆字秘", "斗字秘", "者字秘", "临字秘", 
            "兵字秘", "数字秘", "组字秘", "前字秘", "六道轮回拳", 
            "一气化三清", "霸拳真解", "天庭杀生大术", "无始术","斩我明道诀",
            "天帝拳", "飞仙诀", "万化圣诀", "妖帝九斩",
            "真龙宝术", "草字剑诀","平乱诀","仙劫剑诀",
            "真龙宝术","真凰宝术","天角蚁宝术","麒麟宝术","鲲鹏宝术","蛄之宝术","九幽獓宝术","打神石宝术"
        ];
        
        // 计算玩家掌握的顶级功法数量
        const learnedTopGongfa = topGongfaList.filter(gongfa => 
            player.学习的功法.includes(gongfa)
        );
        const learnedCount = learnedTopGongfa.length;
        
        if (learnedCount < 6) {
            return e.reply([
                `「未掌握足够顶级功法！」`,
                `开创自身之道需至少掌握六种顶级功法`,
                `你当前掌握顶级功法：${learnedCount}种`,
                `已掌握功法：${learnedTopGongfa.join('、') || '无'}`,
                `顶级功法列表：${topGongfaList.join('、')}`,
                `请继续参悟顶级功法`
            ].join('\n'));
        }
        
        // 有效功法数量检查
        const validGongfaCount = await this.checkGongfaRequirements(player);
        if (validGongfaCount < 30) {
            return e.reply([
                `「欲创自身大道，需炉养百经！」`,
                `你当前研习有效功法：${validGongfaCount}部`,
                `开创无上大道需研习至少30部无上功法`,
                `请继续参悟更多高深功法！`
            ].join('\n'));
        }
        
        // 检查玩家是否已有自身之道
        if (player.已创自身之道) {
            return e.reply([
                `你已开创无上大道【${player.自身之道名称}】！`,
                `修士一生只能开创一条属于自己的大道`,
                `此乃天地法则所限，无法更改`
            ].join('\n'));
        }
        
        // 境界检查（准帝以上）
        if (player.mijinglevel_id < 13) {
            return e.reply([
                `欲创自身大道，需先登临圣人王之境！`,
                `你当前境界仅为${player.境界}，`,
                `需达到圣人王境界方可开创自身大道`
            ].join('\n'));
        }

        // 指令解析
        const match = e.msg.match(/^#创造自身之道\s+(\S+)\s+(.*)$/);
        if (!match) {
            return e.reply([
                '指令格式错误！',
                '正确格式：#创造自身之道 [大道类型] [大道名称]',
                '大道类型：攻伐、护体、涅槃',
                '示例：#创造自身之道 攻伐 杀伐剑道'
            ].join('\n'));
        }
        
        const wayType = match[1];
        const wayName = match[2].trim();
        
        // 验证类型
        const validTypes = ['攻伐', '护体', '涅槃'];
        if (!validTypes.includes(wayType)) {
            return e.reply(`无效的大道类型！请选择：${validTypes.join('、')}`);
        }
        
        // 检查名称长度
        if (wayName.length > 10) {
            return e.reply('大道名称过长，请控制在10字以内');
        }
        
        // 检查是否已有同名功法
        if (player.学习的功法?.includes(wayName)) {
            return e.reply(`你已掌握【${wayName}】，无需再创`);
        }
        
        // 检查修为是否足够
        const requiredCultivation = 500e8; // 5亿修为
        if (player.修为 < requiredCultivation) {
            return e.reply([
                `开创大道需消耗海量修为！`,
                `你当前修为：${bigNumberTransform(player.修为)}`,
                `所需修为：${bigNumberTransform(requiredCultivation)}`,
                `请继续积累修为再试`
            ].join('\n'));
        }
        if (player.血气 < requiredCultivation) {
            return e.reply([
                `开创大道需消耗海量血气！`,
                `你当前血气：${bigNumberTransform(player.血气)}`,
                `所需血气：${bigNumberTransform(requiredCultivation)}`,
                `请继续积累血气再试`
            ].join('\n'));
        }
        
  // === 天资成功率计算 ===
    // 获取天资等级字符串
    const aptitudeStr = player.天资等级 || "天弃之人";
    
    // 使用映射表转换为数字等级
    let aptitudeLevel = aptitudeMap[aptitudeStr];
    
    // 如果找不到对应等级，设为0
    if (aptitudeLevel === undefined) {
        console.warn(`未知的天资等级：${aptitudeStr}，已设为0`);
        aptitudeLevel = 0;
    }
    
    // 确保在有效范围内
    if (aptitudeLevel < 0) aptitudeLevel = 0;
    if (aptitudeLevel >= aptitudeSequence.length) {
        aptitudeLevel = aptitudeSequence.length - 1;
        console.warn(`天资等级过高：${aptitudeStr}，已设为最大值 ${aptitudeLevel}`);
    }
    
    const aptitudeName = aptitudeSequence[aptitudeLevel] || '未知';
        
        // 基础成功率
        let baseSuccessRate = 0.3; // 30%
        
        // 天资加成
        const aptitudeBonus = aptitudeLevel * 0.1; // 每级天资增加10%成功率
        const successRate = Math.min(1, baseSuccessRate + aptitudeBonus);
        
        // 构建成功率消息
        const successMsg = [
            `【天资影响】`,
            `当前天资：${aptitudeName}（${aptitudeLevel}级）`,
            `基础成功率：${(baseSuccessRate * 100).toFixed(0)}%`,
            `天资加成：+${(aptitudeBonus * 100).toFixed(0)}%`,
            `最终成功率：${(successRate * 100).toFixed(0)}%`
        ].join('\n');
        await e.reply(successMsg);
        
        // 进行成功率判定
        const rand = Math.random();
        if (rand > successRate) {
            // 开创失败
            const failureMessages = [
                `「大道难证！」`,
                `开创【${wayName}】失败！`,
                `天资不足，未能证得大道真谛`,
                ``,
                `失败惩罚：`,
                `- 修为损失：${bigNumberTransform(requiredCultivation * 0.5)}`,
                `- 血气损失：${bigNumberTransform(requiredCultivation * 0.5)}`,
                `- 3小时内无法再次尝试`
            ];
            
            // 扣除部分资源
            player.修为 = Math.max(0, player.修为 - requiredCultivation * 0.5);
            player.血气 = Math.max(0, player.血气 - requiredCultivation * 0.5);
            
            // 添加冷却时间（3小时）
            player.大道冷却时间 = Date.now() + 3 * 60 * 60 * 1000;
            
            // 保存玩家数据
            await Write_player(usr_qq, player);
            
            return e.reply(failureMessages.join('\n'));
        }
        
        // 根据类型创建技能对象
        let newWaySkill;
        switch (wayType) {
            case '攻伐':
                newWaySkill = this.createAttackSkill(wayName, player.名号);
                break;
            case '护体':
                newWaySkill = this.createDefenseSkill(wayName, player.名号);
                break;
            case '涅槃':
                newWaySkill = this.createSurvivalSkill(wayName, player.名号);
                break;
        }
        
        // 创建对应的帝经对象
        const newSutra = {
            id: Date.now(), // 唯一ID
            name: wayName,
            class: "功法",
            type: "道与法",
            修炼加成: 5,      // 基础修炼速度+5%
            出售价: 180000000, // 1.8亿灵石
            创造者: player.名号,
            创造者ID: usr_qq,
            创造时间: new Date().toLocaleString(),
            关联技能: newWaySkill.name // 建立关联关系
        };
        
        // 根据类型保存到不同的技能列表
        let saveResult;
        switch (wayType) {
            case '攻伐':
                saveResult = await this.saveCustomSkill(newWaySkill, 1);
                break;
            case '护体':
                saveResult = await this.saveCustomSkill(newWaySkill, 2);
                break;
            case '涅槃':
                saveResult = await this.saveCustomSkill(newWaySkill, 3);
                break;
        }
        
        if (!saveResult) {
            return e.reply('保存大道失败，请稍后再试');
        }
        
        // 保存帝经
        await this.saveCustomSutra(newSutra);
        
        // 扣除资源
        player.修为 -= requiredCultivation;
        player.血气 -= requiredCultivation;
        player.生命本源 -= 50; // 扣除生命本源
        
        // 添加到玩家功法列表
        player.学习的功法 = player.学习的功法 || [];
        player.学习的功法.push(wayName);
        
        // 添加创造记录
        player.自身之道创造 = player.自身之道创造 || [];
        player.自身之道创造.push({
            时间: new Date().toLocaleString(),
            大道名称: wayName,
            大道类型: wayType,
            消耗修为: requiredCultivation,
            消耗生命本源: 50
        });
        
        // 标记已创自身之道
        player.已创自身之道 = true;
        player.自身之道名称 = wayName;
        player.自身之道类型 = wayType;
        
        await Write_player(usr_qq, player);
        
        // 生成大道创造文案
        const creationText = this.generateWayCreationText(player.名号, wayName, wayType);
        
        e.reply(creationText);
        return true;
    } catch (error) {
        console.error("开创自身之道出错:", error);
        e.reply("开创自身之道过程中发生未知错误");
        return true;
    }
}

// 创建攻伐技能
createAttackSkill(name, creator) {
    return {
        name: name,
        class: "功法",
        pr: 0.05, // 5%触发概率
        cnt: -1,  // 无冷却限制
        beilv: 1, // 1倍基础倍率
        other: 0,
        msg1: `${creator}施展自身开创的【${name}】，`,
        msg2: `被${name}的无上威能重创！`,
        稀有度: 2, // 自定义标识
        创造者: creator,
        创造时间: new Date().toLocaleString(),
        效果类型: "攻伐"
    };
}

// 创建防御技能
createDefenseSkill(name, creator) {
    return {
        name: name,
        class: "功法",
        pr: 0.05, // 5%触发概率
        cnt: -1,  // 无冷却限制
        beilv: -0.1, // 初始防御倍率（负值表示减伤）
        other: 0,
        msg1: `${creator}施展【${name}】，周身浮现大道符文！`,
        msg2: `的攻击被${name}的无上护体真法化解！`,
        稀有度: 2,
        创造者: creator,
        创造时间: new Date().toLocaleString(),
        效果类型: "护体",
        反弹伤害: 0.1, // 初始反弹比例
        优先级: 3
    };
}

// 创建保命技能
createSurvivalSkill(name, creator) {
    return {
        name: name,
        class: "功法",
        pr: 0.05, // 100%触发（当满足条件时）
        cnt: -1,  // 无冷却限制（可调整）
        msg1: `${creator}施展【${name}】，大道本源护体！`,
        msg2: `从死亡边缘涅槃归来，恢复部分状态！`,
        稀有度: 2,
        创造者: creator,
        创造时间: new Date().toLocaleString(),
        效果类型: "涅槃",
        复活技能: 1,
        恢复比例: 0.5, // 初始恢复比例
        免控: 1,      // 初始免控回合
        攻击加成: 0,   // 初始攻击加成
        防御加成: 0,   // 初始防御加成
        生命加成: 0    // 初始生命加成
    };
}

// 保存自定义技能到指定列表
async saveCustomSkill(skill, listType) {
  try {
    const lib_path = data.lib_path;
    const fileName = `技能列表${listType}.json`;
    const filePath = path.join(lib_path, '技能列表', fileName);
    
    console.log(`技能保存路径: ${filePath}`);

    // 确保目录存在
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // 确保文件存在
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf8');
      console.log(`初始化空的技能列表文件: ${fileName}`);
    }

    // 读取现有技能
    let skillList = [];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      skillList = JSON.parse(fileContent);
      
      if (!Array.isArray(skillList)) {
        console.warn('技能列表格式错误，重置为空数组');
        skillList = [];
      }
    } catch (error) {
      console.error('读取技能列表失败:', error);
    }

    // 检查同名技能
    const existingIndex = skillList.findIndex(s => s.name === skill.name);
    if (existingIndex !== -1) {
      skillList[existingIndex] = skill; // 更新
      console.log(`更新已有技能: ${skill.name}`);
    } else {
      skillList.push(skill); // 新增
      console.log(`添加新技能: ${skill.name}`);
    }

    // 保存文件
    fs.writeFileSync(filePath, JSON.stringify(skillList, null, 2), 'utf8');
    
    // 同步内存数据
    switch (listType) {
      case 1:
        data.jineng1 = skillList;
        break;
      case 2:
        data.jineng2 = skillList;
        break;
      case 3:
        data.jineng3 = skillList;
        break;
    }
    
    return true;
  } catch (error) {
    console.error('保存技能失败:', error);
    return false;
  }
}
// 生成大道创造文案（遮天风格）
generateWayCreationText(playerName, wayName, wayType) {
    // 基础文案
    const baseText = [
        `「炉养百经，菩提证道！」`,
        `${playerName}盘坐菩提树下，道我与逝我诵经,九天神光垂落，大道符文漫天！`,
        `身后浮现万卷道经，化作神炉熔炼百经，`,
        `周身混沌气弥漫，无数星辰环绕，大道金莲绽放，天际边仙音袅袅，儒佛禅唱`,
        `打遍星空古路绝代天骄，横扫天上地下敌，终证得无上大道！`,
        ``,
        `【${wayName}】横空出世，诸天震动！`,
        ``
    ];
    
    // 类型专属文案
    let typeSpecificText = [];
    let finalText = [];
    
    switch (wayType) {
        case '攻伐':
            typeSpecificText = [
                ` 大道特性：`,
                `- 攻伐无双：心念一动，万法皆破`,
                `- 触发概率：5%（随境界提升可增加）`,
                `- 基础倍率：1倍（可随修为提升）`,
                `- 无冷却时间，一念破万法`,
                ``,
                `「${wayName}一出，诸天颤栗！」`,
                `此乃攻伐极致之道，未来可演化无上杀伐圣术！`,
                ``
            ];
            finalText = [
                ` 菩提叶落，道则轰鸣！`,
                `${playerName}睁开双眸，`,
                `眸中射出两道仙芒，撕裂虚空，贯穿万古！`,
                `「从今往后，我道即天道！」`,
                ``,
                `使用指令：#修炼自身之道 精进此无上大道`
            ];
            break;
            
        case '护体':
            typeSpecificText = [
                ` 大道特性：`,
                `- 万法不侵：诸邪退避，万法难伤`,
                `- 触发概率：5%（随境界提升可增加）`,
                `- 基础防御：10%减伤（可随修为提升）`,
                `- 反弹伤害：10%（可随修为提升）`,
                `- 无冷却时间，永恒守护`,
                ``,
                `「${wayName}护体，万劫不灭！」`,
                `此乃防御极致之道，未来可铸不朽道基！`,
                ``
            ];
            finalText = [
                ` 菩提树摇曳，洒落亿万神辉！`,
                `${playerName}周身道则环绕，`,
                `演化混沌青莲，万法不侵，诸邪退避！`,
                `「我身即道，万劫不磨！」`,
                ``,
                `使用指令：#修炼自身之道 精进此无上大道`
            ];
            break;
            
        case '涅槃':
            typeSpecificText = [
                ` 大道特性：`,
                `- 涅槃重生：向死而生，破而后立`,
                `- 触发条件：濒死状态自动触发`,
                `- 恢复效果：50%生命值（可随修为提升）`,
                `- 免控回合：1回合（可随修为提升）`,
                `- 无冷却时间，生生不息`,
                ``,
                `「${wayName}运转，向死而生！」`,
                `此乃生命极致之道，未来可证不死不灭！`,
                ``
            ];
            finalText = [
                ` 菩提树绽放无量光，涅槃真火焚尽虚空！`,
                `${playerName}浴火重生，`,
                `褪去旧躯，再造新我，气息更胜往昔！`,
                `「我命由我不由天！」`,
                ``,
                `使用指令：#修炼自身之道 精进此无上大道`
            ];
            break;
    }
    
    return [...baseText, ...typeSpecificText, ...finalText].join('\n');
}
async cultivateOwnWay(e) {
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const player = await Read_player(usr_qq);

    // === 1. 解析倍数参数 ===
    const match = e.msg.match(/#修炼自身之道\*(\d+)/);
    const batchTimes = match ? Math.min(parseInt(match[1]), 9999) : 1; // 限制最大9999次

    // === 2. 前置条件检查 ===
    if (!player.已创自身之道) {
        return e.reply('你尚未开创自身之道，请先使用 #创造自身之道');
    }

    // === 3. 计算总消耗 ===
    const currentCultivationCount = player.修炼次数 || 0;
    let totalCost = 0;
    let cultivateCosts = []; // 存储每次修炼的消耗
    
    // 计算每次修炼的消耗（递增）
    for (let i = 1; i <= batchTimes; i++) {
        const costPerTime = 1e9 * (currentCultivationCount + i);
        cultivateCosts.push(costPerTime);
        totalCost += costPerTime;
    }
    
    if (player.修为 < totalCost) {
        return e.reply([
            `批量修炼需消耗 ${batchTimes}×递增修为！`,
            `当前修为：${bigNumberTransform(player.修为)}`,
            `所需修为：${bigNumberTransform(totalCost)}`,
            `(首单次消耗：${bigNumberTransform(cultivateCosts[0])})`,
            `(末单次消耗：${bigNumberTransform(cultivateCosts[batchTimes-1])})`
        ].join('\n'));
    }
    if (player.血气 < totalCost) {
        return e.reply([
            `批量修炼需消耗 ${batchTimes}×递增血气！`,
            `当前血气：${bigNumberTransform(player.血气)}`,
            `所需血气：${bigNumberTransform(totalCost)}`,
            `(首单次消耗：${bigNumberTransform(cultivateCosts[0])})`,
            `(末单次消耗：${bigNumberTransform(cultivateCosts[batchTimes-1])})`
        ].join('\n'));
    }
    
    // === 4. 获取技能数据 ===
    const skillName = player.自身之道名称;
    const listType = this.getListTypeByWayType(player.自身之道类型);
    let customSkill = await this.getCustomSkill(skillName, listType);
    
    if (!customSkill) {
        // 如果找不到技能，创建一个默认技能
        customSkill = {
            name: skillName,
            pr: 0.05,
            beilv: 1,
            msg1: `${skillName}发动效果`,
            msg2: ''
        };
        
        // 根据类型添加默认属性
        switch (player.自身之道类型) {
            case '攻伐':
                customSkill.效果类型 = "攻伐";
                break;
            case '护体':
                customSkill.效果类型 = "护体";
                customSkill.beilv = -0.1;
                customSkill.反弹伤害 = 0.1;
                break;
            case '涅槃':
                customSkill.效果类型 = "涅槃";
                customSkill.恢复比例 = 0.5;
                customSkill.免控 = 1;
                break;
        }
    }

    // === 5. 根据大道类型进行不同的提升 ===
    let totalPrGain = 0;
    let totalBeilvGain = 0;
    let specialEffects = [];
    
    // 临时变量用于计算
    let tempPr = customSkill.pr;
    let tempBeilv = customSkill.beilv;
    
    // 记录初始值（用于计算总增益）
    const initialPr = tempPr;
    const initialBeilv = tempBeilv;
    
    // 先扣除资源
    player.修为 -= totalCost;
    player.血气 -= totalCost;
    
    // === 关键修复：改为循环处理每次修炼 ===
    for (let i = 0; i < batchTimes; i++) {
        const currentCount = currentCultivationCount + i + 1;
        
        // 根据类型进行提升
        switch (player.自身之道类型) {
            case '攻伐':
                // 攻伐大道：提升触发概率和伤害倍率
                tempPr = Math.min(0.85, tempPr + 0.005);
                tempBeilv += 0.1;
                totalPrGain += 0.005;
                totalBeilvGain += 0.1;
                
                // 概率获得特殊属性 (5%概率)
                if (Math.random() < 0.05) {
                    // 随机选择一种特殊属性
                    const specialTypes = ['不可防御', '不可复活', '控制'];
                    const selectedType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
                    
                    // 如果还没有该属性，则添加
                    if (!customSkill[selectedType]) {
                        customSkill[selectedType] = 1;
                        specialEffects.push(`获得特殊属性：${selectedType}`);
                    } else {
                        // 如果已有该属性，则提升等级
                        customSkill[selectedType] += 0.1;
                        specialEffects.push(`提升${selectedType}等级：${customSkill[selectedType].toFixed(1)}`);
                    }
                }
                break;
                
            case '护体':
                // 护体真法：降低倍率（增强防御），提升反弹概率
                tempPr = Math.min(0.85, tempPr + 0.005);
                tempBeilv = Math.max(-0.95, tempBeilv - 0.01); // 最大减伤95%
                totalPrGain += 0.005;
                totalBeilvGain -= 0.01; // 注意：这里是负值
                
                // 提升反弹伤害 (5%概率)
                if (Math.random() < 0.05) {
                    if (!customSkill.反弹伤害) customSkill.反弹伤害 = 0.1;
                    customSkill.反弹伤害 = Math.min(0.5, customSkill.反弹伤害 + 0.005);
                    specialEffects.push(`反弹伤害提升：${(customSkill.反弹伤害 * 100).toFixed(1)}%`);
                }
                break;
                
            case '涅槃':
                // 涅槃圣术：提升恢复比例、免控回合和属性加成
                tempPr = Math.min(1.0, tempPr + 0.01); // 涅槃技能pr上限100%
                totalPrGain += 0.01;
                
                // 提升恢复比例
                if (!customSkill.恢复比例) customSkill.恢复比例 = 0.5;
                customSkill.恢复比例 = Math.min(0.95, customSkill.恢复比例 + 0.01);
                
                // 提升免控回合
                if (!customSkill.免控) customSkill.免控 = 1;
                customSkill.免控 = Math.min(5, customSkill.免控 + 0.1);
                
                // 提升属性加成
                const attributes = ['攻击加成', '防御加成', '生命加成'];
                attributes.forEach(attr => {
                    if (!customSkill[attr]) customSkill[attr] = 0;
                    customSkill[attr] = Math.min(0.5, customSkill[attr] + 0.005);
                });
                break;
        }
    }
    
    // 更新修炼次数
    player.修炼次数 = (player.修炼次数 || 0) + batchTimes;

    // === 6. 更新数据 ===
    const updatedSkill = {
        ...customSkill,
        pr: tempPr,
        beilv: tempBeilv
    };

    // === 7. 保存数据 ===
    await Write_player(usr_qq, player);
    await this.saveCustomSkill(updatedSkill, this.getListTypeByWayType(player.自身之道类型));

    // === 8. 构建反馈消息 ===
    let resultMessage = [
        `【大道精进·批量修炼】`,
        `消耗 ${batchTimes}次递增修为与血气（总消耗：${bigNumberTransform(totalCost)}）`,
        `「${skillName}」累计提升：`
    ];
    
    // 计算总增益
    const prGainPercent = (tempPr - initialPr) * 100;
    const beilvGain = tempBeilv - initialBeilv;
    
    // 根据类型添加不同的提升信息
    switch (player.自身之道类型) {
        case '攻伐':
            resultMessage.push(
                `├─ 触发概率：+${prGainPercent.toFixed(1)}%`,
                `├─ 当前概率：${(tempPr * 100).toFixed(1)}%/${(0.85 * 100).toFixed(0)}%上限`,
                `├─ 伤害倍率：+${beilvGain.toFixed(1)}`,
                `└─ 当前倍率：${tempBeilv.toFixed(1)}`
            );
            break;
            
        case '护体':
            resultMessage.push(
                `├─ 触发概率：+${prGainPercent.toFixed(1)}%`,
                `├─ 当前概率：${(tempPr * 100).toFixed(1)}%/${(0.85 * 100).toFixed(0)}%上限`,
                `├─ 减伤效果：${(-tempBeilv * 100).toFixed(1)}%`,
                `└─ 反弹伤害：${(customSkill.反弹伤害 * 100).toFixed(1)}%`,
            );
            break;
            
        case '涅槃':
            resultMessage.push(
                `├─ 触发概率：+${prGainPercent.toFixed(1)}%`,
                `├─ 当前概率：${(tempPr * 100).toFixed(1)}%`,
                `├─ 恢复比例：${(customSkill.恢复比例 * 100).toFixed(1)}%`,
                `├─ 免控回合：${customSkill.免控.toFixed(1)}`,
                `├─ 攻击加成：${(customSkill.攻击加成 * 100).toFixed(1)}%`,
                `├─ 防御加成：${(customSkill.防御加成 * 100).toFixed(1)}%`,
                `└─ 生命加成：${(customSkill.生命加成 * 100).toFixed(1)}%`
            );
            break;
    }
    
    // 添加特殊效果信息（去重）
    if (specialEffects.length > 0) {
        // 合并相同类型的特殊效果
        const effectSummary = {};
        specialEffects.forEach(effect => {
            effectSummary[effect] = (effectSummary[effect] || 0) + 1;
        });
        
        resultMessage.push(`大道感悟触发特殊效果：`);
        Object.keys(effectSummary).forEach(effect => {
            if (effectSummary[effect] > 1) {
                resultMessage.push(`├─ ${effect} (x${effectSummary[effect]})`);
            } else {
                resultMessage.push(`├─ ${effect}`);
            }
        });
    }
    
    resultMessage.push(`大道感悟愈发深邃！`);
    
    e.reply(resultMessage.join('\n'));
}

// 获取自定义技能
async getCustomSkill(skillName, listType) {
    try {
        const lib_path = data.lib_path;
        const fileName = `技能列表${listType}.json`;
        const filePath = path.join(lib_path, '技能列表', fileName);
        
        // 确保文件存在
        if (!fs.existsSync(filePath)) {
            return null;
        }
        
        // 读取文件
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const skillList = JSON.parse(fileContent);
        
        // 查找技能
        return skillList.find(skill => skill.name === skillName) || null;
    } catch (error) {
        console.error(`读取技能列表${listType}失败:`, error);
        return null;
    }
}
// 根据大道类型获取对应的技能列表类型
getListTypeByWayType(wayType) {
    switch (wayType) {
        case '攻伐': return 1;
        case '护体': return 2;
        case '涅槃': return 3;
        default: return 1;
    }
}
async createEmperorSutra(e) {
    if (!e.isGroup) {
        e.reply('请在群聊中创造帝经');
        return true;
    }

    const usr_qq = e.user_id.toString().replace('qg_', '');
    const player = await Read_player(usr_qq);
    
    // 检查玩家是否已有帝经
    if (player.已创帝经) {
        return e.reply([
            `你已开创无上帝经【${player.帝经名称}】！`,
            `古往今来，大帝只能开创一部属于自己的无上帝经`,
            `此乃天地法则所限，无法更改`
        ].join('\n'));
    }
    
    // 检查玩家是否达到大帝境界
    if (player.mijinglevel_id < 16) {
        return e.reply([
            `欲创帝经，需先证道成帝！`,
            `你当前境界仅为${player.level}，`,
            `需达到大帝境界方可开创无上帝经`
        ].join('\n'));
    }
    
    // 获取帝经名称
    const sutraName = e.msg.match(/^#创造帝经\s*(.*)$/)[1]?.trim();
    if (!sutraName) {
        return e.reply('请为你的帝经命名，如：#创造帝经 天帝经');
    }
    
    // 检查名称长度
    if (sutraName.length > 10) {
        return e.reply('帝经名称过长，请控制在10字以内');
    }
    
    // 检查是否已有同名功法
    if (player.学习的功法?.includes(sutraName)) {
        return e.reply(`你已掌握【${sutraName}】，无需再创`);
    }
    
    // 检查修为是否足够
    const requiredCultivation = 1e9; 
    if (player.修为 < requiredCultivation) {
        return e.reply([
            `开创帝经需消耗海量修为！`,
            `你当前修为：${bigNumberTransform(player.修为)}`,
            `所需修为：${bigNumberTransform(requiredCultivation)}`,
            `请继续积累修为再试`
        ].join('\n'));
    }
    
    // 创建帝经对象
    const newSutra = {
        id: Date.now(), // 使用时间戳作为唯一ID
        name: sutraName,
        class: "功法",
        type: "帝经",
        修炼加成: 5, // 基础加成
        出售价: 180000000, // 基础售价
        创造者: player.名号,
        创造者ID: usr_qq,
        创造时间: new Date().toLocaleString(),
    };
    
    // 保存到玩家自创帝经列表
    await this.saveCustomSutra(newSutra);
    
    // 扣除修为
    player.修为 -= requiredCultivation;
    
    // 添加帝经到玩家功法列表
    player.学习的功法 = player.学习的功法 || [];
    player.学习的功法.push(sutraName);
    
    // 添加创造记录
    player.帝经创造 = player.帝经创造 || [];
    player.帝经创造.push({
        时间: new Date().toLocaleString(),
        帝经名称: sutraName,
        消耗修为: requiredCultivation
    });
    
    // 标记已创帝经
    player.已创帝经 = true;
    player.帝经名称 = sutraName;
    
    await Write_player(usr_qq, player);
    
    // 生成帝经创造文案
    const creationText = this.generateSutraCreationText(player.名号, sutraName);
    
    e.reply(creationText);
    return true;
}

async saveCustomSutra(sutra) {
    try {
        // === 直接使用指定的路径 ===
        const lib_path = data.lib_path; // 获取lib路径
        const filePath = path.join(lib_path, '玩家自创帝经.json');
        
        console.log(`保存路径: ${filePath}`);
        
        // === 确保文件存在 ===
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '[]', 'utf8');
            console.log('已创建新的玩家自创帝经文件');
        }
        
        // === 读取现有数据 ===
        let customSutras = [];
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            customSutras = JSON.parse(fileContent);
            
            // 确保是数组
            if (!Array.isArray(customSutras)) {
                console.warn('玩家自创帝经文件格式错误，重置为空数组');
                customSutras = [];
            }
        } catch (error) {
            console.error('读取玩家自创帝经列表失败:', error);
        }
        
        // === 检查是否已有同名帝经 ===
        const existingSutra = customSutras.find(s => s.name === sutra.name);
        if (existingSutra) {
            console.warn(`已存在同名帝经: ${sutra.name}`);
            return false; // 返回失败
        }
        
        // === 添加到列表 ===
        customSutras.push(sutra);
        
        // === 保存文件 ===
        fs.writeFileSync(filePath, JSON.stringify(customSutras, null, 2), 'utf8');
        console.log(`成功保存新帝经: ${sutra.name} 到 ${filePath}`);
        
        // === 更新内存缓存 ===
        data.dijingList = customSutras;
        
        return true; // 返回成功
    } catch (error) {
        console.error('保存玩家自创帝经列表失败:', error);
        return false; // 返回失败
    }
}
// 生成帝经创造文案
generateSutraCreationText(playerName, sutraName) {
    const creationProcesses = [
        `${playerName}盘坐九天之上，周身万道轰鸣`,
        ` 体内三百六十五处神藏同时发光，演化诸天星辰`,
        ` 炉养百经，万法熔炼，历经千劫万险`,
        ` 终在混沌中开辟出一条前所未有的道路`,
        ` 大道符文交织成经，天地法则为之共鸣`
    ];
    
    const sutraEffects = [
        ` 一经施展，星河倒转，岁月长河为之断流`,
        ` 帝经显化，万道哀鸣，诸天星辰皆颤栗`,
        ` 修至大成，万法不侵，永恒不灭`,
        ` 一念花开，君临天下，镇压世间一切敌`
    ];
    
    const creationSuccess = [
        ` ${playerName}双眸开阖，射出两道仙芒，撕裂永恒`,
        ` 虚空中浮现四个大道神文：${sutraName}`,
        `从此天上地下，唯此帝经独尊！`,
        ` 新的传说，自此开始书写！`
    ];
    
    // 随机选择过程描述
    const selectedProcess = get_random_fromARR(creationProcesses);
    const selectedEffect = get_random_fromARR(sutraEffects);
    
    return [
        `无上帝经诞生`,
        selectedProcess,
        `《${sutraName}》初现世间！`,
        selectedEffect,
        ...creationSuccess,
    ].join('\n');
}
}