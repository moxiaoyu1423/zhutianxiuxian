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

export class zhengdaotixi extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_zhengdaotixi',
      dsc: '证道体系模块',
      event: 'message',
      priority: 600,
      rule: [
{
reg: '^#?赐予(练气|炼体)升(\\d+)级(?:@(\\d+))?$',
 fnc: 'ciyujingjie'
},  
{
reg: '^#天意一刀斩众生万灵$',
fnc: 'tianyi_yidao'
},
{
    reg: '^#映照(?:复活)?.*$',
    fnc: 'yingzhao',
},
{
    reg: '^#镇压(?:@(\\d+))?$',
    fnc: 'suppressPlayer'
},
  {
          reg: '^#(?:消耗|转化)纪元积累(?:\\s*(\\d+)|\\*(\\d+))?$',
          fnc: 'jiyuanjilei',
        },
        {
          reg: '^#创造仙宠\\s+(.*?)\\s+(.*?)\\s+(\\d*\\.?\\d+)',
          fnc: 'createXianchong'
        },
{
  reg: '^#灌顶至\\d+级$',  // 匹配如 #灌顶至5级
  fnc: 'guanding'
},
               // {
 // reg: '^#破王成帝$',
 // fnc: 'powangchengdi'
//},
  {
  reg: '^#重塑灵根',
  fnc: 'reshapeLinggen'
},
{
          reg: '^#护法$',
          fnc: 'addProtector'
        },
        { 
            reg: '^#解除护法$',   
            fnc: 'removeProtector' }
            ,
 {
        reg: '^#传授功法(?:@(\\d+))?\\s*(.*)$',
        fnc: 'teachGongfa',
        dsc: '传授指定功法给目标玩家'
    },
    {
        reg: '^#传授全部功法(?:@(\\d+))?$',
        fnc: 'teachAllGongfa',
        dsc: '将自己所有功法传授给目标玩家'
    },
      {
        reg: '^#神城兑换源石 (.*) (\\d+)$',
        fnc: 'exchangeSourceStone'
    },
    {
        reg: '^#神城兑换源石 (.*)$',
        fnc: 'exchangeSourceStone'
    },
     {
        reg: '^#造化万物 (.*)$',
        fnc: 'createEverything'
    },
    {
    reg: '^#凝聚精血(\\*\\d+)?$',
    fnc: 'jingxue'
},
 {
    reg: '^#轰击天地万道助其成帝$',
    fnc: 'hongjiTiandao'
},
{
  reg: '^#修炼圣体秘术(?:\\s+(轮海|道宫|四极|化龙))?(?:\\s+(\\d+))?$',
  fnc: 'shengtimishu',
  dsc: '修炼圣体秘术 - 打磨单一秘境（支持批量修炼）'
},
{
    reg: '^#修炼终极圣体秘术(?:\\s+(\\d+))?$',
    fnc: 'shengtizhongjimishu',
},
 {
                    reg: '^#祭道$',
                    fnc: 'jidao'
                },

                      {
                    reg: '^#修复位面$',
                    fnc: 'xiufu_weimian'
                },
                 {
          reg: '^#为其逆天改命\\s+(.+)\\s*(?:@(\\d+))?$',
          fnc: 'changeAptitude',
          dsc: '仙帝可改变玩家天资'
        },
       
{
  reg: '^#轰击成仙路$',
  fnc: 'hongjiChengxianlu'
},
{
  reg: '^#推演天机(.*)$',
  fnc: 'tuiyanTianji'
}
      ],
    });
 // 仙宠基础配置
    this.xianchonTypes = {
      "战斗": { atk: 5, def: 5, HP: 5 },
      "炼丹": { atk: 3, def: 3, HP: 7 },
      "炼器": { atk: 3, def: 7, HP: 3 },
      "幸运": { atk: 4, def: 4, HP: 4 },
      "修炼": { atk: 2, def: 2, HP: 2 }
    };
  }
// 添加护法者（增强版）
async addProtector(e) {
  if (!e.isGroup) return e.reply('请在群聊中使用护法指令');

  const at = e.message.find(m => m.type === 'at');
  if (!at) return e.reply('请@需要护法的玩家');

  const protectorId = e.user_id.toString().replace('qg_', '');
  const targetId   = at.qq.toString().replace('qg_', '');

  const protector = await Read_player(protectorId);
  const target    = await Read_player(targetId);

  if (!target) return e.reply('目标玩家不存在');
  if (target.护法玩家) return e.reply('该玩家已有护法者');
  if (target.破王成帝 === undefined || target.破王成帝 !== 0)
    return e.reply('目标当前并未处于破王成帝/渡劫阶段，无需护法');

  // 护法者境界检查
  if (protector.mijinglevel_id < target.mijinglevel_id - 1)
    return e.reply('你的境界不足以为该玩家护法（需 ≥ 目标境界 −1）');

  // 一人只能同时给一个人护法
  if (protector.正在护法)
    return e.reply(`你正在为 ${protector.正在护法} 护法，请先 #解除护法`);

  // 快照护法血量（×3 倍，一次性）
  const protectorSnap = {
    名字: protector.名号,
    境界: protector.mijinglevel_id,
    当前血量: Math.floor(protector.当前血量 * 3),
    血量上限: Math.floor(protector.当前血量 * 3)
  };

  target.护法玩家   = protectorSnap;
  protector.正在护法 = target.名号;

  await Write_player(targetId, target);
  await Write_player(protectorId, protector);

  return e.reply([
    `【护法结成】`,
    `${protector.名号} 愿为 ${target.名号} 护道！`,
    `护法血量：${protectorSnap.当前血量.toLocaleString()}`,
    `可分担 40 % 雷劫伤害，直至本次破王成帝结束`
  ].join('\n'));
}

// 解除护法（可选指令）
async removeProtector(e) {
  if (!e.isGroup) return e.reply('请在群聊中使用');
  const pid = e.user_id.toString().replace('qg_', '');
  const me  = await Read_player(pid);

  if (!me.正在护法)
    return e.reply('你当前并未担任任何玩家的护法');

  const targetQQ = me.正在护法;          // 存的是名号，需反向查 QQ
  const allFiles = fs.readdirSync(__PATH.player_path);
  let targetId = null;
  for (const f of allFiles) {
    const tmp = await Read_player(f.replace('.json', ''));
    if (tmp.名号 === targetQQ) { targetId = f.replace('.json', ''); break; }
  }
  if (!targetId) return e.reply('目标数据异常，解除失败');

  const target = await Read_player(targetId);
  delete target.护法玩家;
  delete me.正在护法;

  await Write_player(targetId, target);
  await Write_player(pid, me);
  return e.reply(`【护法解除】${me.名号} 已退出护法状态`);
}


  // 辅助方法
  hasGongfa(player, gongfa) {
    return player.功法 && player.功法[gongfa];
  }



  // ==== 创造仙宠指令 ====
  async createXianchong(e) {
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const player = await Read_player(usr_qq);
    
    // ==== 境界检查 ====
    if (player.mijinglevel_id < 21) { // 需达到圣人境界
      return e.reply([
        `「欲创仙宠，先入仙帝境！」`,
        `${player.名号}当前境界仅为${player.mijinglevel_id}，`,
        `需突破至仙帝境方可创造仙宠`
      ].join('\n'));
    }

    // ==== 参数解析 ====
    const args = e.msg.match(/^#创造仙宠\s+(.*?)\s+(.*?)\s+(\d*\.?\d+)/);
    const [_, name, type, bonusStr] = args;
    const bonus = parseFloat(bonusStr);

    // ==== 类型验证 ====
    if (!this.xianchonTypes[type]) {
      return e.reply([
        `无效的仙宠类型！可选类型：`,
        ...Object.keys(this.xianchonTypes).map(t => `- ${t}`)
      ].join('\n'));
    }

    // ==== 加成验证 ====
    if (isNaN(bonus) || bonus <= 0 || bonus > 0.15) {
      return e.reply('加成需在0-0.15之间（如0.05表示5%加成）');
    }

    // ==== 创建仙宠对象 ====
    const newPet = {
      id: Date.now(), // 使用时间戳作为唯一ID
      name: name,
      class: "仙宠",
      type: type,
      atk: this.xianchonTypes[type].atk,
      def: this.xianchonTypes[type].def,
      HP: this.xianchonTypes[type].HP,
      初始加成: bonus,
      每级增加: bonus * 0.1, // 每级增加10%基础加成
      加成: bonus,
      灵魂绑定: 0,
      品级: "仙仔",
      desc: `${player.名号}创造的专属仙宠`,
      等级: 1,
      获取难度: Math.floor(bonus * 1e9),
      等级上限: 100,
      出售价: Math.floor(bonus * 1e8),
      稀有度: Math.min(4, Math.floor(bonus * 100))
    };

    // ==== 保存到仙宠列表 ====
    try {
      await this.saveXianchong(newPet);
       await Add_najie_thing(usr_qq, newPet.name, '仙宠', 1);
      await e.reply(this.generateCreationText(player.名号, newPet));
    } catch (err) {
      console.error('创造仙宠失败:', err);
      e.reply('仙宠创造失败，天地法则紊乱！');
    }
  }

  // ==== 仙宠保存方法 ====
  async saveXianchong(pet) {
    const filePath = path.join(data.lib_path, '仙宠列表.json');
    let petList = [];
    
    // 读取现有列表
    if (fs.existsSync(filePath)) {
      petList = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    // 检查同名仙宠
    if (petList.some(p => p.name === pet.name)) {
      throw new Error(`已存在同名仙宠: ${pet.name}`);
    }
    
    // 添加新仙宠
    petList.push(pet);
    
    // 保存文件
    fs.writeFileSync(filePath, JSON.stringify(petList, null, 2));
    
    // 更新内存数据
    if (data.xianchon) {
      data.xianchon = petList;
    }
  }

  // ==== 仙宠读取方法 ====
  async getXianchongList() {
    const filePath = path.join(data.lib_path, '仙宠列表.json');
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
        return [];
      }
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error('读取仙宠列表失败:', err);
      return [];
    }
  }

  // ==== 生成创造文案 ====
  generateCreationText(playerName, pet) {
    return [
      `【仙宠诞生·天地共鸣】`,
      ,
      `${playerName}以无上法力创造${pet.name}！`,
      `虚空裂开，无尽仙光汇聚成${pet.type}型仙宠！`,
      `「${pet.name}」诞生时引发天地异象，万兽朝拜！`,
      ,
      `仙宠属性：`,
      `- 类型：${pet.type}`,
      `- 攻击：${pet.atk} ★`,
      `- 防御：${pet.def} ★`,
      `- 生命：${pet.HP} ★`,
      `- 基础加成：${(pet.初始加成*100).toFixed(1)}%`,
      `- 成长系数：${(pet.每级增加*100).toFixed(1)}%/级`,
      ,
    ].join('\n');
  }
  /**
   * 获取仙宠列表
   */
  getXianchongList() {
    const filePath = path.join(this.lib_path, '仙宠列表.json');
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
        return [];
      }
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error('读取仙宠列表失败:', err);
      return [];
    }
  }

  /**
   * 保存仙宠列表
   */
  saveXianchongList(petList) {
    const filePath = path.join(this.lib_path, '仙宠列表.json');
    try {
      fs.writeFileSync(filePath, JSON.stringify(petList, null, 2));
      this.xianchon = petList; // 更新内存数据
    } catch (err) {
      console.error('保存仙宠列表失败:', err);
      throw err;
    }
  }

  /**
   * 添加新仙宠
   */
  addXianchong(newPet) {
    const petList = this.getXianchongList();
    
    // 检查同名
    if (petList.some(p => p.name === newPet.name)) {
      throw new Error(`已存在同名仙宠: ${newPet.name}`);
    }
    
    petList.push(newPet);
    this.saveXianchongList(petList);
  }




  async xiufu_weimian(e) {
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
  
  // 检查玩家境界是否大于20
  if (player.mijinglevel_id <= 20) {
    e.reply("你尚未达到仙帝之境，无法修复破碎的位面");
    return;
  }
  
  // 读取位面数据
  let weimianData = {};
  try {
    const weimianPath = data.filePathMap.weimianList;
    if (fs.existsSync(weimianPath)) {
      weimianData = JSON.parse(fs.readFileSync(weimianPath, 'utf8'));
    } else {
      // 如果文件不存在，创建默认位面数据
      weimianData = {
        "诸天位面": 5,
        "现世承受力": 9999999
      };
      fs.writeFileSync(weimianPath, JSON.stringify(weimianData, null, 2));
    }
  } catch (err) {
    console.error("读取位面数据失败:", err);
    e.reply("读取位面数据失败，请稍后再试");
    return;
  }
  
  // 计算修复所需修为和血气
  const requiredCultivation = player.修为 * 0.5+100000000000; // 50%修为
  const requiredBlood = player.血气 * 0.5+100000000000; // 30%血气
  
  // 检查是否足够
  if (player.修为 < requiredCultivation || player.血气 < requiredBlood) {
    e.reply([
      `【修复位面·修为不足】`,
      
      `修复破碎的诸天位面需要消耗：`,
      `修为：${Math.floor(requiredCultivation)}（当前：${Math.floor(player.修为)}）`,
      `血气：${Math.floor(requiredBlood)}（当前：${Math.floor(player.血气)}）`,
      
      `你尚不具备修复位面的伟力，请继续修炼！`
    ].join("\n"));
    return;
  }
  
  // 扣除修为和血气
  player.修为 -= requiredCultivation;
  player.血气 -= requiredBlood;
  
  // 修复位面 - 同时增加现世承受力和诸天位面
  const repairAmount = player.mijinglevel_id * 10000;
  weimianData.现世承受力 += repairAmount;
  
  // 增加诸天位面数量
  const weimianIncrease = 1; // 每5级增加1个位面
  weimianData.诸天位面 += weimianIncrease;

  // 保存玩家数据
  await Write_player(usr_qq, player);
  
  // 保存位面数据
  try {
    fs.writeFileSync(data.filePathMap.weimianList, JSON.stringify(weimianData, null, 4), 'utf8');
  } catch (err) {
    console.error("保存位面数据失败:", err);
    e.reply("保存位面数据失败，修复可能未完全生效");
  }
  
  // 广播修复消息
  const message = [
    `【仙帝伟力·修复位面】`,
    
    `诸天崩坏，万界哀鸣！`,
    `${player.名号}仙帝踏岁月长河而来，`,
    `眸中映照万古轮回，掌中演化宇宙生灭！`,
    
    `只见仙帝双手结印，无上道则如星河垂落，`,
    `破碎的位面壁垒在仙帝伟力下缓缓愈合！`,
    
    `消耗：`,
    `修为：${Math.floor(requiredCultivation)}`,
    `血气：${Math.floor(requiredBlood)}`,
    
    `修复成果：`,
    `现世承受力 +${repairAmount}`,
    `诸天位面 +${weimianIncrease}`,
    
    `当前状态：`,
    `现世承受力：${weimianData.现世承受力}`,
    `诸天位面：${weimianData.诸天位面}`,
    
    `万灵有感，诸天震动！`,
    `破碎的位面在仙帝伟力下重获新生！`,
    
    ` 众生齐颂：${player.名号}仙帝功德无量！`
  ].join("\n");
      const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';
    const groupList = await redis.sMembers(redisGlKey);
  for (const group_id of groupList) {
        await pushInfo(group_id, true, message);
    }
}
async jiyuanjilei(e) {
  if (!e.isGroup) {
    e.reply('修仙游戏请在群聊中游玩');
    return;
  }

  // 解析指令（支持 #消耗纪元积累*3 这样的格式）
  const match = e.msg.match(/^#(?:消耗|转化)纪元积累(?:\s*(\d+)|\*(\d+))?$/);
  const consumeCount = parseInt(match[1] || match[2] || '1');

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

  // 检查纪元积累是否足够
  if (player.纪元积累 === undefined || player.纪元积累 < consumeCount) {
    e.reply(`你的纪元积累不足！当前剩余：${player.纪元积累 || 0}，需要消耗：${consumeCount}`);
    return;
  }

  // 计算奖励（优化后的公式）
  const baseReward = 100000;
  const reward = baseReward * 
   player.mijinglevel_id * 
    player.level_id  * 
    player.Physique_id ;

  // 应用奖励
  const totalReward = Math.floor(reward * consumeCount);
  player.修为 += totalReward;
  player.血气 += totalReward;
  player.纪元积累 -= consumeCount;

  // 保存数据
  await Write_player(usr_qq, player);

  // 构建回复消息
  const msg = [
    `【纪元积累转化】`,
    `消耗 ${consumeCount} 个纪元积累，获得：`,
    `修为：+${totalReward.toLocaleString()}`,
    `血气：+${totalReward.toLocaleString()}`,
    `当前纪元积累剩余：${player.纪元积累}`,
    `（转化效率：${Math.floor(reward / baseReward * 100)}%）`
  ].join('\n');

  e.reply(msg);
}

async hongjiChengxianlu(e) {
  try {
    const usr_qq = e.user_id.toString().replace('qg_','');
    const player_qq = await channel(usr_qq);
    const player = await Read_player(player_qq);

    // 检查境界 - 必须大于16（红尘仙境界）
    if (player.mijinglevel_id <= 16) {
      return e.reply([
        `【境界不足·无法轰击成仙路】`,
        ,
        `${player.名号}立于星空古路尽头，`,
        `欲轰击成仙路，却感力不从心！`,
        ,
        `「红尘仙境界方可撼动仙路壁垒！」`,
        `当前境界: ${player.mijinglevel_id}（需 > 16）`,
        ,
        `继续苦修，待境界足够再来尝试！`
      ].join('\n'));
    }

    // 读取位面数据
    let weimianData = {};
    try {
      const weimianPath = data.filePathMap.weimianList;
      if (fs.existsSync(weimianPath)) {
        const rawData = fs.readFileSync(weimianPath, 'utf8');
        weimianData = JSON.parse(rawData);
      } else {
        return e.reply('位面数据文件不存在，无法验证成仙路状态');
      }
    } catch (err) {
      console.error('读取位面数据失败:', err);
      return e.reply('读取位面数据失败，无法验证成仙路状态');
    }

    // 检查帝尊状态 - 必须为0（已被打败）
    if (weimianData.帝尊 !== 0) {
      return e.reply([
        `【帝尊未灭·仙路难开】`,
        ,
        `${player.名号}欲轰击成仙路，`,
        `却感冥冥中有大恐怖阻隔！`,
        ,
        `「帝尊未灭，仙路难开！」`,
        `帝尊仍在布局万古，炼化诸天，`,
        `此时轰击成仙路必遭其扼杀！`,
        ,
        `待帝尊彻底败亡后，方可尝试！`
      ].join('\n'));
    }
    
    // ==== 新增：时空条件检查 ====
    // 1. 检查是否在遮天位面（power_place=2）
    if (player.power_place !== 2) {
      const placeNames = {
        '凡间': 0,
        '仙界': 1,
        '下界八域': 1.5,
        '遮天位面': 2,
        "九天十地":2.5,
        '界海': 3,
        '时间长河': 4,
        '永恒未知之地': 5,
        '仙域': 6
      };
      
      const currentPlace = placeNames[player.power_place] || "未知位面";
      
      return e.reply([
        `【时空错位·仙路难寻】`,
        ,
        `${player.名号}欲轰击成仙路，`,
        `却感天地法则排斥，时空错乱！`,
        ,
        `「仙路只在特定时空节点显现！」`,
        `古史记载：`,
        `- 神话时代，帝尊于北斗星域开启仙路`,
        `- 太古末年，不死天皇在飞仙星踏仙路`,
        `- 荒古岁月，狠人大帝一掌断仙路于葬帝星`,
        ,
        `唯有遮天位面（北斗、飞仙、葬帝等古星），`,
        `方有成仙路显现的时空节点！`,
        ,
        `当前位置：${currentPlace}`,
        `请先前往遮天位面再尝试轰击！`
      ].join('\n'));
    }
    
    // 2. 检查成仙路是否开启（weimianData.成仙路=1）
    if (weimianData.成仙路 !== 1) {
      return e.reply([
        `【仙路未开·时机未至】`,
        ,
        `${player.名号}立于星空下，`,
        `眸光如电，欲击穿仙路壁垒！`,
        ,
        `然，虚空寂寥，万道沉寂，`,
        `仙路壁垒坚如磐石，纹丝不动！`,
        ,
        `「仙路未开，时机未至！」`,
        `古史昭示：`,
        `- 仙路开启需万古积累`,
        `- 时机未至，纵仙帝亦难强行开启`,
        ,
        `唯有等待成仙路自然开启之时，`,
        `方可尝试轰击！`,
        ,
        `当前状态：成仙路未开启`
      ].join('\n'));
    }

    // 更新玩家位置
    player.power_place = 6;
    await Write_player(player_qq, player);

    // 构建辰东风格文案
    const realmNames = [
      "北斗星域",
      "飞仙星",
      "葬帝星",
      "紫微星域",
      "通天古星"
    ];
    const randomRealm = realmNames[Math.floor(Math.random() * realmNames.length)];

    const message = [
      `【轰击成仙路·万古奇迹】`,
      `${player.名号}立于${randomRealm}之巅，眸光开阖间，天上地下都在颤栗！`,
      ,
      `"万古等待，只为今朝！"`,
      `${player.名号}一声道喝震碎星河，`,
      `无穷仙光自其体内爆发，照亮了永恒！`,
      ,
      `一拳轰出，万道哀鸣！`,
      `成仙路壁垒如琉璃般寸寸破碎，`,
      `璀璨仙光自裂缝中喷涌而出，`,
      `弥漫着长生气息！`,
      ,
      `"成功了！"`,
      `${player.名号}迈步而入，踏入仙域，`,
      `眼前景象令其震撼不已：`,
      `- 仙山巍峨，灵气如液，瀑布垂落九万丈`,
      `- 神药遍地，不死物质浓郁得化不开`,
      `- 仙禽瑞兽嬉戏，祥瑞之气弥漫`,
      `- 天地规则完整无缺，大道轰鸣`,
      ,
      `「这就是仙域么？」`,
      `${player.名号}深吸一口气，`,
      `只觉寿元暴涨，道基稳固，`,
      `仿佛下一刻就能突破至高境界！`,
      ,
      `在正确的时间，正确的地点，`,
      `${player.名号}终于轰穿了成仙路，`,
      `抵达了无数修士梦寐以求的仙域！`,
      `自此，长生不死不再是传说！`,
      ,
      `位置已更新：仙域`
    ].join('\n');

    await e.reply(message);
    return true;

  } catch (error) {
    console.error('轰击成仙路失败:', error);
    await e.reply([
      `❌ 轰击成仙路失败`,
      `错误信息: ${error.message}`,
      `请联系管理员查看日志`
    ].join('\n'));
    return false;
  }
}
    /** 逆天改命功能 */
  async changeAptitude(e) {
    // 群聊限定
    if (!e.isGroup) {
      e.reply('修仙之路当在群仙汇聚之所印证');
      return false;
    }
    
    // 解析命令
    const aptitudeName = e.msg.match(/#为其逆天改命\s+(.+?)(?:\s|$)/);
    if (!aptitudeName || !aptitudeName[1]) {
      e.reply('指令格式：#为其逆天改命 新天资名称 [@目标玩家]');
      return false;
    }
    
    // 确定目标玩家QQ
    let targetQQ = e.user_id;
    if (e.message.some(item => item.type === "at")) {
      const atItem = e.message.find(item => item.type === "at");
      targetQQ = atItem.qq;
    }
    
    // 检查施法者境界
    const invokerQQ = e.user_id;
    const invoker = await Read_player(invokerQQ);
    if (invoker.mijinglevel_id < 21) {
      e.reply(`你当前境界不足，唯有仙帝方可掌控命运！`);
      return false;
    }
    
    // 获取目标玩家
    const targetPlayer = await Read_player(targetQQ);
    if (!targetPlayer) {
      e.reply('目标修士尚未踏入仙途');
      return false;
    }
    
    // 天资序列
    const aptitudeSequence = [
      '天弃之人', '先天不足', '平庸之资', 
      '超凡资质', '天纵之资', '旷世奇才',
      '绝世天骄', '万古无双', '无演无尽'
    ];
    
    // 检查新的天资是否有效
    const newAptitude = aptitudeName[1];
    if (!aptitudeSequence.includes(newAptitude)) {
      const validList = aptitudeSequence.join('、');
      e.reply(`"${newAptitude}"非有效天资！可用天资：${validList}`);
      return false;
    }
    
       // 构建天资评价 - 辰东风格
    const aptitudeEvaluations = {
        '无演无尽': '万古未有，超脱诸天之上！此人天资已凌驾于天道束缚之外，演尽诸天万界法则，便是纪元更迭亦难掩其辉',
        '万古无双': '横推古今未来敌！此等天资乃为修道而生，为应劫而至，纵使时间长河倒灌亦难磨灭其永恒帝光',
        '绝世天骄': '惊才绝艳，帝姿天成！注定要成为纪元主角的存在，眸光开阖间便有真龙盘绕，气血奔腾似星海翻涌',
        '旷世奇才': '九天上界难觅！这般资质便是放在仙古纪元也是无上仙苗，一滴血便可压塌虚空',
        '天纵之资': '天碑刻名！足以媲美长生世家传人的天资，吞吐间有混沌气缭绕',
        '超凡资质': '超越凡俗！已然初现非凡气象，道基之上显化异象',
        '平庸之资': '平凡无奇！在芸芸修士中毫不起眼',
        '先天不足': '道基残缺！如同漏鼎难承天地灵气',
        '天弃之人': '大道弃子！每一步修行都将遭遇天罚拷问'
    };
    
    // 获取原天资
    const oldAptitude = targetPlayer.天资等级 || '平庸之资';
    
    // 构建仙帝威势消息
    let emperorRealmDesc = "";
    if (invoker.mijinglevel_id === 23) {
        emperorRealmDesc = `（${invoker.名号}周身缭绕不灭道光，祭道之力席卷八荒，诸世在他面前颤抖）`;
    } else if (invoker.mijinglevel_id === 22) {
        emperorRealmDesc = `（${invoker.名号}帝威浩荡，眸中映照万界生灭，一念间诸天星辰皆成尘埃）`;
    } else {
        emperorRealmDesc = `（${invoker.名号}仙帝气机震动时间长河，掌指间流淌着毁灭万物的能量）`;
    }
    
    // 构建特效消息 - 辰东风
    let effectMsg = [
        `〖逆天改命·篡夺造化〗`,
        `混沌炸裂！时空震颤！`,
        `${emperorRealmDesc}`,
        `${invoker.名号}一步踏出，诸天规则哀鸣！`,
        `时间长河被截断，命运长河激起万丈波澜！`,
        `帝掌覆盖无量宇宙，因果轨迹在其掌心重铸！`
    ];
    
    // 天资蜕变特效 - 辰东风
    let changeProcess = [
        `▼ 命运长河倒灌 ▼`,
        `▷ 原始天资【${oldAptitude}】被强行剥离：`,
        `  天地间回荡着命运规则的崩裂声，万道枷锁寸寸断裂`,
        `▷ 创世仙光重塑本源：`,
        `  九色神虹贯穿诸天，三千大道符文烙印进血脉深处`,
        `▷ 万古无双道果孕育：`,
        `  混沌气弥漫中，【${newAptitude}】真命正在复苏`
    ];
    
    // 结果消息 - 辰东风
    let resultMsg = [
        `≡≡≡ 宿命终章 ≡≡≡`,
        `一缕眸光击穿时间长河，帝掌缓缓收回：`,
        `  万界重归平静，唯留命运长河上荡漾的涟漪`,
        `≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡`,
        `  目标修士：${targetPlayer.名号}`,
        `  原始天资：【${oldAptitude}】 ➠ 重塑天资：【${newAptitude}】`,
        `  命格批语：${aptitudeEvaluations[newAptitude]}`,
        `≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡`,
        `${invoker.名号}收拢周身道则，漠然低语：`,
        `  "修道一途，逆天而行！今日本帝篡尔天命，望汝不负此造化"`
    ];
    
    // 更新玩家数据
    targetPlayer.天资等级 = newAptitude;
    targetPlayer.天资评价 = aptitudeEvaluations[newAptitude];
    await Write_player(targetQQ, targetPlayer);
    
    // 发送分段消息（带特效延迟）
    await e.reply(` ${invoker.名号}〖帝威初现〗`);
    await sleep(1500);
    await e.reply(effectMsg.join('\n'));
    await sleep(2500);
    await e.reply(changeProcess.join('\n'));
    await sleep(3000);
    await e.reply(resultMsg.join('\n'));
    
    return true;
}




 async jidao(e) {
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
    
    // 检查玩家是否已经达到ID21境界（仙帝）
    if (player.mijinglevel_id !== 21) {
        e.reply('只有达到仙帝境界才能祭掉自身至高大道');
        return;
    }
    
    // 祭道成功率与失败处理
    const successRate = 0.5; // 50%成功率
    const randomValue = Math.random();
    
    if (randomValue > successRate) {
       if (player.莫晓羽庇护 === 1) {
        e.reply([
            `【祭道失败·厄土阻道】`,
            ,
            `${player.名号}焚尽规则与秩序，欲祭掉自身至高大道！`,
            `刹那间，诸天万界剧烈震动，时空长河倒卷！`,
            `"轰隆——"`,
            `厄土高原深处，十具古老棺椁同时开启！`,
            `十位始祖自万古沉眠中苏醒，眸光撕裂无尽宇宙！`,
            `"何人敢窥祭道之境？"`,
            `声波化作亿万黑暗神链贯穿诸天，无尽次元宇宙在威压下哀鸣崩灭！`,
            `十股祭道级威压锁定${player.名号}，厄土高原显化实体，`,
            `要将整个祭道场域拖入永恒的黑暗深渊！`,
            `就在十位始祖真身降临的刹那——`,
            `"聒噪！"`,
            `九天之巅传来一声道喝，莫晓羽踏破万古时空降临！`,
            `一位始祖瞳孔骤缩："是你？！当年那个无化如是的小子！"`,
            `另一始祖骇然道："不可能！你竟已走到这一步？！"`,
            `莫晓羽眸光平静扫过十位始祖："无化如是是我，无演无尽依旧是我。"`,
            `音声震碎万古虚空，十位始祖齐齐后退，厄土高原剧烈震动！`,
            `"她我保定了，尔等可有异议？！"`,
            `十位始祖怒极而笑："狂妄！即便你触摸到那个境界，也休想独抗我十人！"`,
            `"合体！让他见识真正的终极始祖之力！"`,
            `十位始祖化作十道黑暗本源，在厄土高原深处融合！`,
            `一尊超越祭道领域的终极始祖诞生：`,
            ` 身躯贯穿古今未来，同时存在于所有时间线`,
            ` 每根发丝都缠绕着亿万宇宙的生灭轮回`,
            ` 呼吸间喷吐的黑暗物质足以污染整部古史`,
            `"此乃我等燃烧始祖本源凝聚的终极形态，看你如何抵挡！"`,
            `终极始祖一掌拍出，掌中蕴含诸天万界所有黑暗时代的毁灭力量！`,
            ``,
            `莫晓羽淡然不语，只是轻轻抬眸一瞥——`,
            `"轰！！！！"`,
            `终极始祖的身躯寸寸炸裂，连同整个厄土高原一起化作虚无粒子！`,
            `眸光所及，时空重构，黑暗物质逆流回溯，万古因果尽数斩断！`,
            ,
            `骤然！无尽维度的尽头传来开天辟地之音：`,
            `"祭道领域，岂容亵渎！"`,
            `一道身披万道星辉的身影踏破维度壁障，其威压令诸天规则哀鸣臣服：`,
            ` 每一步落下都有新宇宙诞生又湮灭`,
            ` 发丝飘动间亿万星河随之明暗流转`,
            ` 眸光开阖时映照古今未来所有因果`,
            `万维梵宇至高主帝！真正统御无限维度的存在降临！`,
            `"此子祭道，当入万维炼狱受永世劫火"`,
            `主帝声如开天法则，言出法随，整个祭道场域开始固化结晶！`,
            `莫晓羽黑发狂舞，面对至高主帝竟露轻笑：`,
            `"就凭你？"`,
            `他翻掌祭出主宰道舍，这件超越维度理解的至宝瞬间化作永恒庇护：`,
            ` 道舍绽放无量文明辉光，将${player.名号}笼罩其中`,
            `万道梵宇法则触及时空扭曲避让`,
            ` 主帝威压被隔绝在文明辉光之外`,
            `护好此物，待我归来！`,
            `道音未落，莫晓羽已撕裂维度：`,
            `"主帝小儿，可敢随本座去那鸿蒙未判之地做过一场？！"`,
            `鸿蒙未判之地的战斗余波穿透万古维度：`,
            `有开天巨斧劈碎永恒星海的虚影`,
            `见混沌青莲镇封亿万文明的景象`,
            `闻时空长河被斩断重续的悲鸣`,
            `感诸天万界在道战中颤栗崩解`,
            `主帝怒喝穿透万古："莫晓羽！你竟触摸到了那层境界？！"`,
            `道音渐隐，唯留主宰道舍庇护下的${player.名号}安然祭道...`
        ].join('\n'));
        
            
            // 祭道成功并获得主宰道舍庇护
            player.修为 = 0;
            player.血气 = 0;
            player.mijinglevel_id = 22;
            player.level_id = 1;
            player.Physique_id = 1;
            player.主宰道舍庇护 = 1; // 新增庇护属性
            
            await Add_HP(usr_qq, 9999999999);
            await Write_player(usr_qq, player);
        } else {
            e.reply([
                `【祭道失败·始祖阻道】`,
                ,
                `${player.名号}焚尽规则与秩序，欲祭掉自身至高大道！`,
                `刹那间，诸天万界剧烈震动，时空长河倒卷！`,
                `"轰隆——"`,
                `厄土高原深处，十具古老棺椁同时开启！`,
                `十位始祖自万古沉眠中苏醒，眸光撕裂无尽宇宙！`,
                `何人敢窥探祭道领域？`,
                `声波化作实质的黑暗秩序链，贯穿古今未来！`,
                `亿万黑暗物质自虚空裂缝涌出，化作遮天巨手抓向${player.名号}！`,
                `始祖真身未至，其威压已让诸天星辰黯淡，万道哀鸣！`,
                `此路不通，当永寂！`,
                `冰冷的声音冻结时空，${player.名号}的祭道进程被强行中断！`,
                `黑暗秩序链贯穿${player.名号}的仙帝本源，`,
                `大道根基被撕裂，神魂遭受不可逆的重创！`,
                `十位始祖联手施压，祭道之路被彻底断绝！`,
                `始祖齐出，天下无不克之地，无不败之兵！`,
                `${player.名号}从祭道状态跌落，道果崩裂，`,
                `修为大幅倒退，需重新积累方能再次尝试！`,
                `厄土始祖的黑暗印记已烙印在其大道本源中，`,
                `下次祭道将会引来更恐怖的阻道！`
            ].join('\n'));
            
            // 祭道失败惩罚
            player.修为 *= 0.3; 
            player.血气 *= 0.3; 

             player.mijinglevel_id = 20;
            await Write_player(usr_qq, player);
        }
    } else {
        // 40%概率成功
        player.修为 = 0;
        player.血气 = 0;
        player.mijinglevel_id = 22;
        player.level_id = 1;
        player.Physique_id = 1;
        await Add_HP(usr_qq, 9999999999);
        await Write_player(usr_qq, player);
        
        e.reply(`你焚尽规则与秩序，祭掉了自身的至高大道与过往的一切，极尽升华！成功到达祭道领域，此刻你已经能够洞彻古今未来，意志便能让一切因果时空命运尽灭，拥有恐怖的伟力，仅是立身于现世就能压塌无尽无限多元宇宙，哪怕是囊括无穷尽神维丝线海的维宙在你一眼凝视下也要刹那湮灭！`);
    }
}
async hongjiTiandao(e) {
    // 仅限群聊使用
    if (!e.isGroup) {
        e.reply('帝境神通需在群内施展');
        return true;
    }

    // 检查@目标
    const atTarget = e.message.find(item => item.type === "at");
    if (!atTarget) {
        e.reply('请指定护道目标：\n#轰击天地万道助其成帝@目标QQ');
        return true;
    }
    const targetQQ = atTarget.qq;

    // 验证执行者
    const executorQQ = e.user_id;
    const executor = await Read_player(executorQQ);
    if (!executor) {
        e.reply('执行者未创建修仙角色');
        return true;
    }

    // 境界校验（需准仙帝）
    if (executor.mijinglevel_id < 16) {
        e.reply([
            `「帝威不足！」`,
            `${executor.名号}当前境界：${executor.境界}`,
            `轰穿万道需大帝之境（境界ID≥16）`
        ].join('\n'));
        return true;
    }

    // 验证目标
    const target = await Read_player(targetQQ);
    if (!target) {
        e.reply(`目标玩家不存在`);
        return true;
    }

    // 目标状态校验
    if (target.mijinglevel_id < 15) {
        e.reply([
            `「帝基未固」`,
            `${target.名号}当前境界：${target.境界}`,
            `需达到准帝九重天（境界ID≥15）`
        ].join('\n'));
        return true;
    }

    if (target.护道状态) {
        e.reply([
            `「帝路已开」`,
            `${target.名号}已有短暂证道时间`,
            `无需重复护道`
        ].join('\n'));
        return true;
    }

   // ==== 开始护道流程 ====
await e.reply(`🌌 ${executor.帝号}眸绽冷电，帝拳轰击天地万道！`);
await sleep(2000);

     // 新增：护道过程状态追踪
    let totalDamage = 0; // 累计承受伤害
    const damagePer5Sec = 30000000000; // 每5秒300亿伤害
    let isFailed = false; // 是否失败标志
    
   // 阶段1：旧道反噬（参考叶凡战九大天尊）
await e.reply([
    `万道化九大天尊虚影临世！`,
    `虚空雷海翻涌，少年无始持钟、狠人执罐踏劫而至`,
    `${executor.帝号}独断帝劫，每五息承${damagePer5Sec/100000000}亿道痕反噬！`
].join('\n'));
    
    // 新增：循环扣血机制（共3轮，每次5秒）
    for (let i = 1; i <= 30; i++) {
        await sleep(5000); // 等待5秒
        
        // 扣除血量
        executor.当前血量 = Math.max(0, executor.当前血量 - damagePer5Sec);
        totalDamage += damagePer5Sec;
        
        // 更新玩家数据
        await Write_player(executorQQ, executor);
        
          await e.reply([
        `第${i}重帝劫！`,
        `天尊虚影结「诛仙阵」引动混沌雷池`,
        `${executor.帝号}帝血染星海，道骨现裂痕！`,
        `气血暴跌${(damagePer5Sec/100000000).toLocaleString()}亿`
    ].join('\n'));
        
        // 检查是否失败
        if (executor.当前血量 <= 0) {
            isFailed = true;
            await e.reply([
                `帝躯崩解！`,
                `${executor.帝号}道基溃散，玄黄鼎坠落星海`,
                `「终究...逆不了这天...」`,
                `轰击万道失败！`
            ].join('\n'));
            break; // 中断循环
        }
    }
    
    // 若中途失败则终止流程
    if (isFailed) return true;

    // 阶段2：重塑道痕（仅当存活时执行）
    await e.reply([
        `帝血焚燃，万道重组！`,
        `玄黄鼎吞噬旧道痕，撕裂天道枷锁`,
        `「新道当立！！」`
    ].join('\n'));
    
    // 阶段3：禁区干扰（30%概率）
    if (Math.random() < 0.3) {
        await sleep(3000);
        await e.reply([
            `太初古矿传来冷笑：`,
            `「投机取巧，终将道崩！」`,
            `不死山射出诅咒仙芒，削弱${target.名号}20%血气`
        ].join('\n'));
        target.血气 *= 0.8;
    }

    const damage = 30000000000
    totalDamage += damage;
    
    // 玩家承受伤害
    executor.当前血量 = Math.max(0,executor.当前血量 - damage);
    // ==== 更新数据 ====
    // 赋予目标天心印记（1小时有效期）
    target.护道状态 = Date.now() + 3600000;
    await Write_player(targetQQ, target);

    // 执行者代价
    executor.修为 *= 0.7;
    executor.血气 *= 0.8;
    await Write_player(executorQQ, executor);

    // ==== 天道诏告 · 新帝契机 ====
    target.护道状态 = Date.now() + 3600000; // 1时辰证道窗口
    // 成功播报
    return e.reply([
        `〖天道诏告〗`,
        `万古铁律崩坏！累计承受${(totalDamage/100000000).toLocaleString()}亿道伤`,
        `${executor.帝号}以帝血开辟新路：`,
        `• 修为跌落${(executor.修为*0.3).toLocaleString()}(-30%)`,
        `• 血气枯竭${(executor.血气*0.2).toLocaleString()}(-20%)`,
        `——————————————————`,
        `${target.名号}获证道契机至 ${new Date(Date.now() + 3600000).toLocaleTimeString()}`
    ].join('\n'));
}
async jingxue(e) {
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const player = await Read_player(usr_qq);
    
    // 解析数量参数
    const match = e.msg.match(/#凝聚精血\*(\d+)$/);
    let amount = 1;
    if (match && match[1]) {
        amount = parseInt(match[1]);
        if (amount <= 0) {
            return e.reply('凝聚数量需为正整数！');
        }
        if (amount > 999) {
            return e.reply('单次最多凝聚999滴精血！');
        }
    }
    
    // 特殊体质映射表（添加圆神）
    const specialConstitutions = {
        "圣体": "圣体精血",
        "小成圣体": "小成圣体精血",
        "大成圣体": "大成圣体精血",
        "道胎": "先天道胎精血",
        "圣体道胎": "圣体道胎精血",
        "妖体": "妖体精血",
        "神体": "神体精血",
        "混沌体": "混沌体精血",
        "混沌圣体道胎": "混沌圣体道胎精血",
        "至尊体": "至尊体精血",
        "大道体": "大道体精血",
        "圆环之理": "圆神精血"  // 新增圆神体质
    };
    
    // 检查是否特殊体质
    if (!specialConstitutions[player.灵根.type]) {
        return e.reply([
            `【万道反噬】`,
            `你尝试凝聚本源精血，却引发大道暴动！`,
            `体内奔涌的${player.灵根.type}血脉剧烈沸腾，`,
            `七窍喷薄神光，仙台秘境几欲崩裂！`,
            `警告：唯有特殊体质方可凝聚本源精血！`,
        ].join('\n'));
    }
    
    // 根据体质等级确定消耗和产出
    const bloodMap = {
        "圣体精血": { costXiuwei: 15000000, costXueqi: 15000000 },
        "小成圣体精血": { costXiuwei: 25000000, costXueqi: 25000000 },
        "大成圣体精血": { costXiuwei: 35000000, costXueqi: 35000000 },
        "先天道胎精血": { costXiuwei: 15000000, costXueqi: 15000000 },
        "圣体道胎精血": { costXiuwei: 45000000, costXueqi: 45000000 },
        "妖体精血": { costXiuwei: 10000000, costXueqi: 10000000 },
        "神体精血": { costXiuwei: 10000000, costXueqi: 10000000 },
        "混沌体精血": { costXiuwei: 40000000, costXueqi: 40000000 },
        "至尊体精血": { costXiuwei: 40000000, costXueqi: 40000000 },
         "大道体精血": { costXiuwei: 40000000, costXueqi: 40000000 },
        "混沌圣体道胎精血": { costXiuwei: 75000000, costXueqi: 75000000 },
        "圆神精血": { costXiuwei: 70000000, costXueqi: 70000000 }  // 圆神消耗更高
    };
    
    const bloodName = specialConstitutions[player.灵根.type];
    const { costXiuwei, costXueqi } = bloodMap[bloodName];
    
    // 计算总消耗
    const totalXiuwei = costXiuwei * amount;
    const totalXueqi = costXueqi * amount;
    
    // 检查资源是否足够
    if (player.修为 < totalXiuwei) {
        return e.reply([
            `【本源枯竭】`,
            `尝试凝聚${amount}滴${bloodName}失败！`,
            `需${totalXiuwei.toLocaleString()}点修为，当前仅有${player.修为.toLocaleString()}点`,
            `体内道则轰鸣却后继无力，血气黯淡如残烛`,
        ].join('\n'));
    }
    
    if (player.血气 < totalXueqi) {
        return e.reply([
            `【血气衰败】`,
            `凝聚${amount}滴${bloodName}遭遇反噬！`,
            `需${totalXueqi.toLocaleString()}点血气，当前仅有${player.血气.toLocaleString()}点`,
            `血气如退潮般消散，本源几近枯竭`,
        ].join('\n'));
    }
    
    // 凝聚精血文案（根据体质不同）
    let cultivationText = [];
    
    // 圆神体质特殊文案
    if (player.灵根.type === "圆环之理") {
        cultivationText = [
            `【圆环之理·精血凝聚】`,
            `${player.名号}张开双臂，发间丝带绽放虹光！`,
            `「所有宇宙、过去未来的魔法少女们——」`,
            `「你们的悲伤，由我来承受！」`,
            ,
            `因果律重构！粉红光翼贯穿多元宇宙！`,
            `圆环之理显现，改写宇宙基本法则！`,
            `「这就是我选择的命运！」`,
            ,
            `悲叹之种在掌心旋转，`,
            `化作${amount}滴闪耀着虹光的圆神精血！`,
            `每滴精血中都映照着无限宇宙的生灭轮回`,
            ,
            `「希望与绝望的平衡，由我来维系...」`,
            `虹光渐隐，${player.名号}眼中闪过一丝悲悯`
        ];
    } 
    // 其他体质文案
    else {
        const baseText = {
            "圣体精血": [
                `【圣体精血·凝聚成功】`,
                `苦海翻腾，金色浪涛击天！`,
                `圣体本源轰鸣，脊柱大龙昂首长吟`,
                `${amount}滴缠绕混沌气的黄金精血自仙台凝结`
            ],
           "至尊体精血":     [
        `【至尊体·帝血重凝】`,
        `「帝威浩荡，镇压万古！」`,
        `${player.名号}体内帝血沸腾，背后浮现九重天虚影`,
        `每一滴血液都似一颗生命古星在轮转`,
        ,
        `仙台秘境中走出模糊帝影，手托日月星辰`,
        `凝练出${amount}滴紫金色的至尊帝血`,
        `每滴血中都沉浮着一方小世界，万灵膜拜`,
    ],
 "大道体精血": [
        `【大道体·本源截天】`,
        `「道法自然，我为乾坤！」`,
        `${player.名号}周身浮现三千大道锁链，`,
        `头顶浮现混沌青莲，莲心吞吐鸿蒙紫气`,
        ,
        `脊椎骨节节炸响，化作通天建木贯穿天地`,
        `凝出${amount}滴琉璃色的道源精血`,
        `每滴血中都烙印着完整的大道符文`,
    ],
            "小成圣体精血": [
                `【小成圣体精血·凝聚成功】`,
                `气血如龙，贯穿三十三重天！`,
                `金色苦海化作熔炉，淬炼圣体本源`,
                `脊柱腾起九条真龙，共同孕育${amount}滴璀璨精血`
            ],
            "大成圣体精血": [
                `【大成圣体精血·凝聚成功】`,
                `帝威弥漫，诸天星辰为之震颤！`,
                `黄金血气化作永恒神炉，熔炼万道法则`,
                `${amount}滴压塌虚空的精血浮现，内蕴开天辟地异象`
            ],
            "先天道胎精血": [
                `【先天道胎精血·凝聚成功】`,
                `道音轰鸣，万道法则垂落如瀑！`,
                `先天道纹交织成茧，孕育大道本源`,
                `${amount}滴晶莹剔透的道胎精血浮现，映照诸天星辰`
            ],
            "圣体道胎精血": [
                `【圣体道胎精血·凝聚成功】`,
                `黄金血气与先天道纹共舞！`,
                `苦海中升起混沌青莲，莲心孕育无上精血`,
                `${amount}滴融合圣体与道胎本源的混沌精血震动古今`
            ],
            "混沌体精血": [
                `【混沌体精血·凝聚成功】`,
                `混沌气弥漫，开天辟地异象显化！`,
                `体内三千小世界同时轰鸣，混沌本源凝聚`,
                `${amount}滴沉重如星域的精血浮现，内蕴鸿蒙初开景象`
            ],
            "混沌圣体道胎精血": [
                `【混沌圣体道胎精血·凝聚成功】`,
                `时间长河虚影显化，万道为之哀鸣！`,
                `黄金血气、先天道纹、混沌本源三相合一`,
                `${amount}滴照耀古史的精血凝结，散发准帝威压`
            ],
            "妖体精血": [
                `【妖体精血·凝聚成功】`,
                `万妖虚影显化，妖气席卷星域！`,
                `体内妖血沸腾，凝聚上古大妖真形`,
                `${amount}滴妖异如血钻的精血浮现，内蕴太古凶兽咆哮`
            ],
            "神体精血": [
                `【神体精血·凝聚成功】`,
                `神光冲霄，引动诸神共鸣！`,
                `体内神血沸腾，凝聚远古神明虚影`,
                `${amount}滴璀璨如大日的精血浮现，散发神圣气息`
            ]
        }[bloodName];
        
        cultivationText = [
            ...baseText,
            ,
            `消耗：${totalXiuwei.toLocaleString()}修为 | ${totalXueqi.toLocaleString()}血气`,
            `获得：${bloodName}×${amount}`,
            `此精血蕴含无上本源，可：`,
            `- 炼丹：炼制无上九转仙丹的核心材料`,
            `- 延寿：生死人肉白骨的绝世神药`,
        ];
    }
    
    // 扣除资源
    player.修为 -= totalXiuwei;
    player.血气 -= totalXueqi;
    
    // 添加精血到纳戒
    await Add_najie_thing(usr_qq, bloodName, "丹药", amount);
    await Write_player(usr_qq, player);
    
    // 构建回复
    return e.reply(cultivationText.join('\n'));
}

async shengtimishu(e) {
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const player = await Read_player(usr_qq);
    
    // 初始化圣体秘境加成属性
    if (typeof player.圣体秘境加成 === 'undefined') {
        player.圣体秘境加成 = {
            轮海: 0,
            道宫: 0,
            四极: 0,
            化龙: 0
        };
    }

    // 初始化圣体秘境完成度系统
    if (typeof player.圣体秘境完成度 === 'undefined') {
        player.圣体秘境完成度 = {
            轮海: 0,
            道宫: 0,
            四极: 0,
            化龙: 0
        };
    }

    // 解析指令参数
    const args = e.msg.trim().split(/\s+/);
    let mijing = "";
    let times = 1; // 默认修炼1次
    
    // 解析修炼次数（最后一个数字参数）
    for (let i = args.length - 1; i >= 1; i--) {
        const num = parseInt(args[i]);
        if (!isNaN(num) && num > 0) {
            times = num;
            // 从args中移除次数参数，剩下的就是秘境参数
            args.splice(i, 1);
            break;
        }
    }
    
    // 限制最大批量次数（防止刷属性）
    const maxBatchTimes = 10;
    if (times > maxBatchTimes) {
        times = maxBatchTimes;
        e.reply(` 批量修炼次数限制为${maxBatchTimes}次，已自动调整`);
    }
    
    // 检查是否指定了秘境
    if (args.length > 1) {
        const specifiedMijing = args[1];
        if (["轮海", "道宫", "四极", "化龙"].includes(specifiedMijing)) {
            mijing = specifiedMijing;
        } else {
            return e.reply([
                `秘境指定错误！`,
                `可选秘境：轮海、道宫、四极、化龙`,
                `示例：#修炼圣体秘术 轮海 5（修炼5次轮海秘境）`
            ].join('\n'));
        }
    }
    
    // 基础检查函数
    const checkPrerequisites = () => {
        // 检查功法
        if (!player.学习的功法.includes("圣体秘术")) {
            return `道途未明，秘术难寻！\n你体内并无《圣体秘术》的传承道痕\n需寻得荒古石碑，方能参悟此等打磨秘境的盖世法门`;
        }

        // 检查圣体血脉
        if (!["圣体", "小成圣体", "圣体道胎", "大成圣体"].includes(player.灵根.type)) {
            return `血脉轰鸣，金辉溃散！\n非荒古圣体一脉，强修此术必遭反噬\n你体内奔涌的${player.灵根.type}血脉与圣体道纹剧烈冲突`;
        }

        // 检查境界（需达到仙台秘境）
        if (player.mijinglevel_id < 9) {
            return `仙台未筑，秘境难开！\n圣体秘术需以仙台为基，引动九天神辉\n你当前${player.mijinglevel_id}境修为，强修恐致道基崩裂`;
        }
        
        return null;
    };

    // 批量修炼逻辑
    const batchCultivate = () => {
        let totalCostXiuwei = 0;
        let totalCostXueqi = 0;
        let totalAttributeGain = 0;
        let successTimes = 0;
        let progressDetails = [];
        let nodeAchievements = [];

        // 预先计算总消耗
        for (let i = 0; i < times; i++) {
            const currentProgress = player.圣体秘境完成度[mijing] + (i * 5);
            if (currentProgress >= 100) break;
            
            const progressFactor = 1 + (currentProgress / 100);
            const costxiuwei = Math.round(10000000 * progressFactor);
            const costXueqi = Math.round(10000000 * progressFactor);
            
            totalCostXiuwei += costxiuwei;
            totalCostXueqi += costXueqi;
        }

        // 检查资源是否足够
        if (player.修为 < totalCostXiuwei) {
            return {
                success: false,
                message: `道源枯竭！批量修炼需${totalCostXiuwei}缕混沌炁，你仅存${player.修为}缕`
            };
        }
        if (player.血气 < totalCostXueqi) {
            return {
                success: false,
                message: `气血衰败！批量修炼需${totalCostXueqi}滴圣血，你仅余${player.血气}滴`
            };
        }

        // 执行批量修炼
        for (let i = 0; i < times; i++) {
            if (player.圣体秘境完成度[mijing] >= 100) {
                progressDetails.push(`${mijing}秘境已圆满，停止修炼`);
                break;
            }

            const 原完成度 = player.圣体秘境完成度[mijing];
            const progressFactor = 1 + (原完成度 / 100);
            const costxiuwei = Math.round(10000000 * progressFactor);
            const costXueqi = Math.round(10000000 * progressFactor);
            const 单次增加属性 = Math.round(45000000 * 0.05);

            // 扣除资源
            player.修为 -= costxiuwei;
            player.血气 -= costXueqi;
            
            // 更新完成度
            player.圣体秘境完成度[mijing] += 5;
            if (player.圣体秘境完成度[mijing] > 100) {
                player.圣体秘境完成度[mijing] = 100;
            }
            
            // 更新属性加成
            player.圣体秘境加成[mijing] += 单次增加属性;
            player.攻击加成 += 单次增加属性;
            player.攻击 += 单次增加属性;
            player.生命加成 += 单次增加属性;
            player.血量上限 += 单次增加属性;
            player.当前血量 += 单次增加属性;
            player.防御加成 += 单次增加属性;
            player.防御 += 单次增加属性;

            totalAttributeGain += 单次增加属性;
            successTimes++;

            // 记录进度
            progressDetails.push(`第${i+1}次：${原完成度}% → ${player.圣体秘境完成度[mijing]}% (+${单次增加属性}属性)`);

            // 检查重要节点
            const 当前完成度 = player.圣体秘境完成度[mijing];
            if (原完成度 < 25 && 当前完成度 >= 25) {
                nodeAchievements.push(` ${mijing}秘境初成，道基稳固！`);
            } else if (原完成度 < 50 && 当前完成度 >= 50) {
                nodeAchievements.push(` ${mijing}秘境小成，黄金血气澎湃！`);
            } else if (原完成度 < 75 && 当前完成度 >= 75) {
                nodeAchievements.push(` ${mijing}秘境大成，异象纷呈！`);
            } else if (原完成度 < 100 && 当前完成度 >= 100) {
                nodeAchievements.push(` ${mijing}秘境圆满！黄金圣血沸腾！`);
            }
        }

        return {
            success: true,
            successTimes,
            totalCostXiuwei,
            totalCostXueqi,
            totalAttributeGain,
            progressDetails,
            nodeAchievements,
            finalProgress: player.圣体秘境完成度[mijing]
        };
    };

    // 主逻辑执行
    const prerequisiteCheck = checkPrerequisites();
    if (prerequisiteCheck) {
        return e.reply(prerequisiteCheck);
    }

    // 自动选择秘境（如果未指定）
    if (!mijing) {
        const unfinishedMijings = ["轮海", "道宫", "四极", "化龙"].filter(
            mij => player.圣体秘境完成度[mij] < 100
        );
        
        if (unfinishedMijings.length === 0) {
            return e.reply([
                `恭喜！所有秘境均已圆满！`,
                `轮海、道宫、四极、化龙四大秘境皆已臻至完美境界`,
                `黄金血气如大日悬空，圣体已然小成大圆满！`
            ].join('\n'));
        }
        
        mijing = unfinishedMijings[Math.floor(Math.random() * unfinishedMijings.length)];
    }

    // 检查完成度是否已达上限
    if (player.圣体秘境完成度[mijing] >= 100) {
        return e.reply([
            `${mijing}秘境已达极境！`,
            `黄金血气如大日悬空，再难寸进`,
            `当前完成度：${player.圣体秘境完成度[mijing]}%`,
            `可尝试修炼其他未圆满秘境`
        ].join('\n'));
    }

    // 执行批量修炼
    const result = batchCultivate();
    if (!result.success) {
        return e.reply(result.message);
    }

    // 保存数据
    await Write_player(usr_qq, player);

    // 秘境修炼文案
    const cultivationText = {
        轮海: `苦海翻腾，神桥贯空！轮海秘境中浪涛击天，命泉喷涌混沌气`,
        道宫: `五神诵经，道宫轰鸣！五脏道宫共振，传出远古祭祀道音`,
        四极: `四肢擎天，撑开寰宇！地水火风道则缠绕，演绎开天辟地异象`,
        化龙: `脊椎化龙，直冲仙台！脊柱大龙腾空而起，九节龙骨迸发仙光`
    }[mijing];

    // 构建回复
    const replyLines = [
        `【圣体秘术·${mijing}篇】×${result.successTimes}`,
        cultivationText,
        ``,
        ` 修炼统计：`,
        ` 成功修炼：${result.successTimes}次`,
        ` 进度提升：${player.圣体秘境完成度[mijing] - (result.successTimes * 5)}% → ${player.圣体秘境完成度[mijing]}%`,
        ` 属性增益：+${result.totalAttributeGain}（攻击/防御/气血）`,
        ` 资源消耗：${result.totalCostXiuwei}修为 | ${result.totalCostXueqi}血气`,
        ``
    ];

    // 添加节点成就
    if (result.nodeAchievements.length > 0) {
        replyLines.push(` 秘境突破：`);
        replyLines.push(...result.nodeAchievements);
        replyLines.push(``);
    }

    // 添加详细进度（如果次数较多则折叠显示）
    if (result.successTimes <= 5) {
        replyLines.push(` 详细进度：`);
        replyLines.push(...result.progressDetails);
    } else {
        replyLines.push(` 详细进度（${result.successTimes}次修炼，此处显示前5次）：`);
        replyLines.push(...result.progressDetails.slice(0, 5));
        replyLines.push(`... 以及${result.successTimes - 5}次修炼`);
    }

    // 检查圆满状态
    if (player.圣体秘境完成度[mijing] >= 100) {
        replyLines.push(``);
        replyLines.push(`✨ **${mijing}秘境已臻至大圆满！**`);
        
        const 所有完成度 = Object.values(player.圣体秘境完成度);
        if (所有完成度.every(完成度 => 完成度 >= 100)) {
            replyLines.push(`🎉 **恭喜！四大秘境全部圆满，圣体小成达到大圆满！**`);
            replyLines.push(`黄金血气贯霄汉，举手投足间已有大帝之姿！`);
        } else {
            replyLines.push(`可继续修炼其他未圆满秘境`);
        }
    }

    return e.reply(replyLines.join('\n'));
}
async shengtizhongjimishu(e) {
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
    if (player.生命本源 !== 100 + player.灵根.生命本源) {
        e.reply("你的生命本源亏空无法修炼终极秘术");
        return;
    }

    // 解析修炼次数
    let times = 1; // 默认修炼1次
    const message = e.msg.trim();
    const match = message.match(/#修炼终极圣体秘术(?:\\s+(\\d+))?$/);
    if (match && match[1]) {
        times = parseInt(match[1]);
        if (times <= 0) {
            e.reply('修炼次数必须大于0');
            return;
        }
    }

    // 限制最大批量次数
    const maxBatchTimes = 5; // 仙台秘境消耗巨大，限制次数
    if (times > maxBatchTimes) {
        times = maxBatchTimes;
        e.reply(` 仙台秘境修炼消耗巨大，批量次数限制为${maxBatchTimes}次，已自动调整`);
    }

    // 检查功法
    if (!player.学习的功法.includes("终极圣体秘术")) {
        return e.reply([
            `圣体道痕未显，仙台秘境未开！`,
            `你神识内探，苦海寂静，未能寻到那源自火星大成圣体的无上道痕。`,
            `《终极圣体秘术》乃圣体一脉真正的无敌资本，非大机缘、大悟性不可得。`
        ].join('\n'));
    }

    // 核心条件1：必须为大成圣体
    if (player.灵根.type !== "大成圣体") {
        return e.reply([
            `血脉未达极致！`,
            `《终极圣体秘术》乃无上仙台法，需成就大成圣体方可参悟`,
            `当前血脉：${player.灵根.type}`
        ].join('\n'));
    }

    // 核心条件2：四大基础秘境必须全部圆满[7](@ref)
    if (typeof player.圣体秘境完成度 === 'undefined' ||
        player.圣体秘境完成度.轮海 < 100 ||
        player.圣体秘境完成度.道宫 < 100 ||
        player.圣体秘境完成度.四极 < 100 ||
        player.圣体秘境完成度.化龙 < 100) {
        
        const 未圆满秘境 = [];
        if (!player.圣体秘境完成度 || player.圣体秘境完成度.轮海 < 100) 未圆满秘境.push(`轮海(${player.圣体秘境完成度?.轮海 || 0}%)`);
        if (!player.圣体秘境完成度 || player.圣体秘境完成度.道宫 < 100) 未圆满秘境.push(`道宫(${player.圣体秘境完成度?.道宫 || 0}%)`);
        if (!player.圣体秘境完成度 || player.圣体秘境完成度.四极 < 100) 未圆满秘境.push(`四极(${player.圣体秘境完成度?.四极 || 0}%)`);
        if (!player.圣体秘境完成度 || player.圣体秘境完成度.化龙 < 100) 未圆满秘境.push(`化龙(${player.圣体秘境完成度?.化龙 || 0}%)`);
        
        return e.reply([
            `根基不足！欲修仙台，先固根基`,
            `《终极圣体秘术》需以四大秘境圆满为基`,
            `当前未圆满秘境：${未圆满秘境.join('、')}`,
            `请先使用 #修炼圣体秘术 将基础秘境打磨至圆满`
        ].join('\n'));
    }

    // 初始化仙台秘境系统
    if (typeof player.仙台秘境完成度 === 'undefined') {
        player.仙台秘境完成度 = {
            仙台一层天: 0,
            仙台二层天: 0,
            仙台三层天: 0,
            仙台四层天: 0,
            仙台五层天: 0,
            仙台六层天: 0
        };
        player.仙台秘境加成 = 0;
    }

    // 检查仙台秘境是否已全部圆满
    const 仙台完成度 = Object.values(player.仙台秘境完成度);
    if (仙台完成度.every(完成度 => 完成度 >= 100)) {
        return e.reply([
            `仙台极境，道果圆满！`,
            `你已将仙台六层天全部修炼至大圆满境界`,
            `神识覆盖诸天，一念可动星辰，已达此术极致`
        ].join('\n'));
    }

    // 批量修炼逻辑
    const batchCultivate = () => {
        let totalCostXiuwei = 0;
        let totalCostXueqi = 0;
        let totalAttributeGain = 0;
        let successTimes = 0;
        let progressDetails = [];
        let layerProgress = {};
        let nodeAchievements = [];

        // 预先估算总消耗（由于进度会变化，这里做保守估算）
        for (let i = 0; i < times; i++) {
            const 当前总完成度 = 仙台完成度.reduce((sum, curr) => sum + curr, 0) / 6 + (i * 4 / 6);
            const progressFactor = 1 + (当前总完成度 / 100);
            const costxiuwei = Math.round(50000000 * progressFactor);
            const costXueqi = Math.round(50000000 * progressFactor);
            
            totalCostXiuwei += costxiuwei;
            totalCostXueqi += costXueqi;
        }

        // 检查资源是否足够
        if (player.修为 < totalCostXiuwei) {
            return {
                success: false,
                message: `道源枯竭！批量修炼需${totalCostXiuwei}缕混沌炁，你仅存${player.修为}缕`
            };
        }
        if (player.血气 < totalCostXueqi) {
            return {
                success: false,
                message: `气血衰败！批量修炼需${totalCostXueqi}滴圣血，你仅余${player.血气}滴`
            };
        }

        // 执行批量修炼
        for (let i = 0; i < times; i++) {
            // 检查是否全部圆满
            const 所有仙台完成度 = Object.values(player.仙台秘境完成度);
            if (所有仙台完成度.every(完成度 => 完成度 >= 100)) {
                progressDetails.push(`所有仙台秘境已圆满，停止修炼`);
                break;
            }

            // 确定当前修炼层数
            let 当前修炼层数 = "";
            if (player.仙台秘境完成度.仙台一层天 < 100) {
                当前修炼层数 = "仙台一层天";
            } else if (player.仙台秘境完成度.仙台二层天 < 100) {
                当前修炼层数 = "仙台二层天";
            } else if (player.仙台秘境完成度.仙台三层天 < 100) {
                当前修炼层数 = "仙台三层天";
            } else if (player.仙台秘境完成度.仙台四层天 < 100) {
                当前修炼层数 = "仙台四层天";
            } else if (player.仙台秘境完成度.仙台五层天 < 100) {
                当前修炼层数 = "仙台五层天";
            } else {
                当前修炼层数 = "仙台六层天";
            }

            // 记录层数进度
            if (!layerProgress[当前修炼层数]) {
                layerProgress[当前修炼层数] = {
                    start: player.仙台秘境完成度[当前修炼层数],
                    count: 0
                };
            }
            layerProgress[当前修炼层数].count++;

            // 计算本次消耗和加成
            const 当前总完成度 = 所有仙台完成度.reduce((sum, curr) => sum + curr, 0) / 6;
            const progressFactor = 1 + (当前总完成度 / 100);
            const costxiuwei = Math.round(50000000 * progressFactor);
            const costXueqi = Math.round(50000000 * progressFactor);
            
            const 层数加成系数 = {
                "仙台一层天": 1.0,
                "仙台二层天": 1.2,
                "仙台三层天": 1.5,
                "仙台四层天": 2.0,
                "仙台五层天": 2.5,
                "仙台六层天": 3.0
            }[当前修炼层数];
            
            const 实际属性增加值 = Math.round(90000000 * 层数加成系数);

            // 扣除资源
            player.修为 -= costxiuwei;
            player.血气 -= costXueqi;
            
            // 更新完成度
            const 原完成度 = player.仙台秘境完成度[当前修炼层数];
            player.仙台秘境完成度[当前修炼层数] += 4;
            if (player.仙台秘境完成度[当前修炼层数] > 100) {
                player.仙台秘境完成度[当前修炼层数] = 100;
            }
            
            // 更新属性加成
            player.仙台秘境加成 += 实际属性增加值;
            player.攻击加成 += 实际属性增加值;
            player.攻击 += 实际属性增加值;
            player.生命加成 += 实际属性增加值;
            player.血量上限 += 实际属性增加值;
            player.当前血量 += 实际属性增加值;
            player.防御加成 += 实际属性增加值;
            player.防御 += 实际属性增加值;

            totalAttributeGain += 实际属性增加值;
            successTimes++;

            // 记录进度
            progressDetails.push(`第${i+1}次：${当前修炼层数} ${原完成度}% → ${player.仙台秘境完成度[当前修炼层数]}%`);

            // 检查层数圆满
            if (原完成度 < 100 && player.仙台秘境完成度[当前修炼层数] >= 100) {
                const 圆满奖励系数 = 层数加成系数 * 0.5;
                const 圆满奖励值 = Math.round(90000000 * 圆满奖励系数);
                
                player.攻击加成 += 圆满奖励值;
                player.攻击 += 圆满奖励值;
                player.生命加成 += 圆满奖励值;
                player.血量上限 += 圆满奖励值;
                player.当前血量 += 圆满奖励值;
                player.防御加成 += 圆满奖励值;
                player.防御 += 圆满奖励值;

                nodeAchievements.push(`✨ ${当前修炼层数}圆满！获得圆满奖励`);
            }
        }

        // 计算实际总消耗
        totalCostXiuwei = 0;
        totalCostXueqi = 0;
        for (let i = 0; i < successTimes; i++) {
            // 这里简化计算，实际应该按每次修炼的进度重新计算
            totalCostXiuwei += Math.round(50000000 * (1 + (i * 0.04)));
            totalCostXueqi += Math.round(50000000 * (1 + (i * 0.04)));
        }

        return {
            success: true,
            successTimes,
            totalCostXiuwei,
            totalCostXueqi,
            totalAttributeGain,
            progressDetails,
            nodeAchievements,
            layerProgress,
            finalProgress: player.仙台秘境完成度
        };
    };

    // 执行批量修炼
    const result = batchCultivate();
    if (!result.success) {
        return e.reply(result.message);
    }

    // 保存数据
    await Write_player(usr_qq, player);

    // 构建回复
    const 回复文案 = [
        `【终极圣体秘术·批量修炼】×${result.successTimes}`,
        `仙台秘境绽放无量光，神识跨越诸天万界！`,
        ``,
        ` 修炼统计：`,
        ` 成功修炼：${result.successTimes}次`,
        ` 属性增益：+${result.totalAttributeGain}`,
        ` 资源消耗：${result.totalCostXiuwei}修为 | ${result.totalCostXueqi}血气`,
        ` 仙台总加成：${player.仙台秘境加成}`,
        ``
    ];

    // 添加层数进度概要
    回复文案.push(` 层数进度：`);
    for (let layer in result.layerProgress) {
        const progress = result.layerProgress[layer];
        const finalProgress = player.仙台秘境完成度[layer];
        回复文案.push(` ${layer}: ${progress.start}% → ${finalProgress}% (修炼${progress.count}次)`);
    }
    回复文案.push(``);

    // 添加节点成就
    if (result.nodeAchievements.length > 0) {
        回复文案.push(` 秘境突破：`);
        回复文案.push(...result.nodeAchievements);
        回复文案.push(``);
    }

    // 添加详细进度（限制显示条数）
    if (result.successTimes <= 3) {
        回复文案.push(` 详细进度：`);
        回复文案.push(...result.progressDetails);
    } else {
        回复文案.push(` 详细进度（前3次）：`);
        回复文案.push(...result.progressDetails.slice(0, 3));
        回复文案.push(`... 以及${result.successTimes - 3}次修炼`);
    }

    // 检查是否全部圆满
    const 所有仙台完成度 = Object.values(player.仙台秘境完成度);
    if (所有仙台完成度.every(完成度 => 完成度 >= 100)) {
        回复文案.push(``);
        回复文案.push(` **恭喜！仙台六层天全部圆满，圣体终极蜕变！**`);
        回复文案.push(`黄金血气映照诸天，五大秘境圆满合一，已具天帝之资！`);
    }

    return e.reply(回复文案.join('\n'));
}  
async createEverything(e) {
    // 群聊限定
    if (!e.isGroup) {
        e.reply('此无上神通需在诸天群聊中方显神威！');
        return true;
    }

    const usr_qq = e.user_id.toString().replace('qg_','');
    const player_qq = await channel(usr_qq);
    const player = await Read_player(player_qq);

    // 检查境界 - 仙帝及以上（境界ID >= 21）
    if (player.mijinglevel_id < 21) {
        e.reply([
            `【境界不足】`,
            `造化万物乃仙帝伟力！`,
            `道友当前境界不足，无法施展此无上神通！`,
        ].join('\n'));
        return true;
    }

    // 解析指令
    const msg = e.msg.replace('#造化万物', '').trim();
    let [itemName, amountStr] = msg.split(/\s+/);
    let amount = parseInt(amountStr) || 1;

    if (amount <= 0) {
        e.reply('造化万物需心诚，数量需为正数！');
        return true;
    }

    // 检查物品是否存在
    const itemExist = await foundthing(itemName);
        if (itemExist.不可创造) {
        e.reply(`此等物品涉及的力量哪怕是仙帝也无法造化！`);
        return true;
    }
    if (!itemExist) {
        e.reply(`诸天万界中并无【${itemName}】此物，仙帝亦不可无中生有！`);
        return true;
    }

    // 读取位面数据
    let weimianData = {};
    try {
        const weimianPath = data.filePathMap.weimianList;
        if (fs.existsSync(weimianPath)) {
            const rawData = fs.readFileSync(weimianPath, 'utf8');
            weimianData = JSON.parse(rawData);
        } else {
            e.reply('位面数据文件不存在，无法进行造化万物');
            return true;
        }
    } catch (err) {
        console.error('读取位面数据失败:', err);
        e.reply('读取位面数据失败，无法进行造化万物');
        return true;
    }

    // === 根据境界计算消耗 ===
    let costPerItem = 0;
    let costDescription = "";
    
    if (player.mijinglevel_id === 22) {
        // 祭道境界：每10000出售价消耗1点承受力
        costPerItem = Math.ceil(itemExist.出售价 / 10000);
        costDescription = `每10000出售价消耗1点承受力`;
    } else if (player.mijinglevel_id === 23) {
        // 祭道之上境界：不消耗任何承受力
        costPerItem = 0;
        costDescription = `祭道之上，言出法随，不染因果`;
    } else {
        // 仙帝境界：每100出售价消耗1点承受力
        costPerItem = Math.ceil(itemExist.出售价 / 100);
        costDescription = `每100出售价消耗1点承受力`;
    }

    const totalCost = costPerItem * amount;

    // 检查承受力是否足够（祭道之上除外）
    if (player.mijinglevel_id <24 && weimianData.现世承受力 < totalCost) {
        const realmNames = [
            "上苍之上",
            "魂河尽头",
            "天帝葬坑",
            "古地府",
            "祭海"
        ];
        const randomRealm = realmNames[Math.floor(Math.random() * realmNames.length)];
        
        e.reply([
            `【诸天震荡·法则反噬】`,
            `${player.名号}立于${randomRealm}之巅，眸中仙光暴涨！`,
            `欲创【${itemName}】x${amount}，撼动诸天根基！`,
            ,
            `轰！！！`,
            `万道法则哀鸣，时间长河掀起滔天巨浪！`,
            `诸天万界剧烈震荡，星辰如雨坠落！`,
            ,
            `「现世承受力不足！」`,
            `此方天地已无法承受更多造化伟力！`,
            `需消耗：${totalCost}点现世承受力（${costDescription}）`,
            `当前剩余：${weimianData.现世承受力}点`,
        ].join('\n'));
        return true;
    }

    // 扣除承受力（祭道之上除外）
    if (player.mijinglevel_id <24) {
        weimianData.现世承受力 -= totalCost;
        
        // 保存位面数据
        try {
            fs.writeFileSync(data.filePathMap.weimianList, JSON.stringify(weimianData, null, 4), 'utf8');
        } catch (error) {
            console.error('保存位面数据失败:', error);
        }
    }

    // 添加物品到纳戒
    await Add_najie_thing(player_qq, itemName, itemExist.class, amount);
 if (player.mijinglevel_id < 22 && weimianData.现世承受力 < 1000000) {
        // 40%概率触发始祖扼杀
        if (Math.random() < 0.4) {
            isKilledByAncestor = true;
            
            // 境界跌落
            player.mijinglevel_id -= 1;
            await Write_player(player_qq, player);
            
            // 构建始祖扼杀文案
            const killTexts = [
                ,
                `【厄土震怒·始祖扼杀】`,
                `诸天根基剧烈震荡，万界濒临崩坏！`,
                ,
                `厄土高原深处，十具古老棺椁同时开启！`,
                `诸天竟有如此变数，当扼杀之！"`,
                 `十大始祖齐声喝令，十股祭道级力量融合归一！`,
                ,
                `厄土高原显化本体，化作一柄斩断万古的黑暗天刀！`,
                `刀锋所指，时空长河断流，古今未来隔绝！`,
                `整个诸天都在这一刀下颤栗哀鸣！`,
                ,
                `"噗——"`,
                `${player.名号}的仙帝之躯在黑暗天刀下寸寸瓦解！`,
                `大道根基被十股始祖之力联手斩断！`,
                `境界永恒跌落至${getRealmName(player.mijinglevel_id)}！`,
                ,
                `十大始祖的冰冷道音回荡诸天：`,
                `"自此之后，万古再无此变数！"`,
                `十道身影缓缓退回棺椁，厄土高原隐入虚空...`
            ];
            
            // 发送扼杀文案
            e.reply(createTexts.join('\n') + '\n' + killTexts.join('\n'));
            return true;
        }
    }
    // 构建辰东风格文案
    const realmNames = [
        "上苍之上",
        "魂河尽头",
        "天帝葬坑",
        "古地府",
        "祭海"
    ];
    const randomRealm = realmNames[Math.floor(Math.random() * realmNames.length)];

    // 基础文案
    const createTexts = [
        `【诸天造化·创世】`,
        `${player.名号}立于${randomRealm}之巅，眸光开阖间，`,
        `整部古史都在颤栗！`,
        ,
        `"诸天为炉，万道为火！"`,
        `一声道喝震碎时间长河！`,
        `无穷诸天仿佛都要炸开了！`,
        ,
        `只见${player.名号}抬手间：`,
        `- 仙域边荒的星辰簌簌坠落`,
        `- 界海深处的浪涛席卷诸天`,
        `- 万道符文如天河倒灌，汇聚于掌心`,
        ,
        `轰！！！`,
        `一道贯穿古今未来的神光中，`,
        `【${itemName}】x${amount}自虚无中诞生！`,
    ];

    // 祭道境界文案（境界22）
    if (player.mijinglevel_id === 22) {
        createTexts.splice(4, 0, 
            `祭道符文照亮了永恒未知之地！`
        );
        createTexts.splice(11, 0,
            `"他化自在，他化万古！"`,
            `三道帝影自岁月长河中走出，结印共演创世法！`
        );
        
        // 添加消耗说明
        createTexts.push(
            
            `此造化撼动诸天根基，消耗${totalCost}点现世承受力（每10000出售价消耗1点）！`,
            `当前现世承受力：${weimianData.现世承受力}点`
        );
    }
    // 祭道之上境界文案（境界23）
    else if (player.mijinglevel_id >= 23) {
        createTexts.splice(4, 0,
            `「眸光所至，枯竭所有，重现所有！」`,
            `诸天万界，无量宇宙，所有生灵心头莫名悸动，`,
            `仿佛某种至高无上的存在睁开了双眼！`
        );
        
        createTexts.splice(11, 0,
            `"言出法随，万道共尊！"`,
            `诸天法则自动演化，无需消耗任何承受力！`
        );
        
        // 添加不消耗说明
        createTexts.push(
            
            `祭道之上，言出法随，不染因果！`,
            `造化万物无需消耗现世承受力！`
        );
    }
    // 仙帝境界文案（境界21）
    else {
        createTexts.push(
            
            `此造化撼动诸天根基，消耗${totalCost}点现世承受力（每100出售价消耗1点）！`,
            `当前现世承受力：${weimianData.现世承受力}点`
        );
    }

    // 特殊物品文案增强
    switch(itemName) {
        case "混沌青莲":
            createTexts.splice(createTexts.length - 1, 0, 
                `一株青莲摇曳生姿，混沌气弥漫，仿佛开天辟地前的第一缕生机！`
            );
            break;
        case "世界石":
            createTexts.splice(createTexts.length - 1, 0, 
                `石体表面浮现诸天万界虚影，大道符文流转不息！`
            );
            break;
        case "仙泉之眼":
            createTexts.splice(createTexts.length - 1, 0, 
                `仙泉喷涌，生命精气如龙腾空，滋养万古！`
            );
            break;
        case "不死神药":
            createTexts.splice(createTexts.length - 1, 0, 
                `神药通灵，散发不朽气息，仿佛能让人活出第二世！`
            );
            break;
    }

    // 承受力接近枯竭时的警告（祭道之上除外）
    if (player.mijinglevel_id <24 && weimianData.现世承受力 < 1000000) {
        createTexts.splice(createTexts.length, 0,
            
            `「警告！」`,
            `诸天根基动摇，万界濒临崩坏！`,
            `现世承受力仅余：${weimianData.现世承受力}点！`
        );
    }

    e.reply(createTexts.join('\n'));
    return true;
}
  async exchangeSourceStone(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    const player_qq = await channel(usr_qq);
    const player = await Read_player(player_qq);
    // ==== 初始化源石属性 ====
    if (player.源石 === undefined) {
        player.源石 = 0;
        await Write_player(player_qq, player);
           // 发送初始化提示
        e.reply([
            `【源石系统激活】`,
            `首次兑换源石，系统已激活源石属性！`,
            `当前源石：0斤`,
        ].join("\n"));
    
    }
    // 解析命令
    const match = e.msg.match(/^#神城兑换源石 (.*?)(?: (\d+))?$/);
    if (!match) return false;
    
    const stoneName = match[1].trim();
    let amount = match[2] ? parseInt(match[2]) : 1;
        // 源石兑换表
const SOURCE_STONE_EXCHANGE_RATES = {
    "下品源石": 10,
    "中品源石": 50,
    "上品源石": 100,
    "超品源石": 300,
    "神源石": 5000,
    "上品神源石": 7000,
    "超品神源石": 12500
};
    // 检查源石类型是否有效
    if (!SOURCE_STONE_EXCHANGE_RATES[stoneName]) {
        const validStones = Object.keys(SOURCE_STONE_EXCHANGE_RATES).join('、');
        return e.reply([
            `【神城兑换·源石】`,
            `未知的源石类型：${stoneName}`,            
            `可兑换源石类型：${validStones}`,
        ].join("\n"));
    }
    
    // 获取玩家拥有的该源石数量
    const stoneCount = await exist_najie_thing(player_qq, stoneName, "道具");
    
    // 检查数量是否足够
    if (stoneCount < amount) {
        return e.reply([
            `【神城兑换·源石】`,
            `源石不足！`,            
            `你拥有【${stoneName}】x${stoneCount}`,
            `试图兑换数量：${amount}`,
        ].join("\n"));
    }
    
    // 计算兑换值
    const exchangeRate = SOURCE_STONE_EXCHANGE_RATES[stoneName];
    const totalValue = exchangeRate * amount;
    
    // 扣除源石道具
    await Add_najie_thing(player_qq, stoneName, "道具", -amount);
    
      // 增加源石数值（确保属性已存在）
    player.源石 = (player.源石 || 0) + totalValue;
    await Write_player(player_qq, player);
    
    // 构建兑换文案
    const exchangeTexts = [
        `【神城兑换·源石】`,
        `你在神城找到源天师后人开设的兑换铺`,
        `交出${amount}块【${stoneName}】`,
        `获得${bigNumberTransform(totalValue)}斤源石`,
        `源天师后人轻抚源石，眼中闪过异彩：`,
    ];
    
    // 根据源石类型添加不同文案
    if (stoneName.includes("神源")) {
        exchangeTexts.push(
            `"神源难寻，道友福缘深厚！"`,
            `一缕神光从源石中透出，映照半边天宇`
        );
    } else if (stoneName === "超品源石") {
        exchangeTexts.push(
            `"源中蕴道，此石不凡！"`,
            `源石表面浮现道道先天纹路`
        );
    } else {
        exchangeTexts.push(
            `"源气充沛，可助修行！"`,
            `源石在阳光下闪烁晶莹光泽`
        );
    }
    
    
    e.reply(exchangeTexts.join("\n"));
    return true;
}
// 传授指定功法
async teachGongfa(e) {
        if (!e.isGroup) {
        e.reply('请在群聊中传授功法');
        return true;
    }

    const casterQQ = e.user_id.toString().replace('qg_', '');
    const caster = await Read_player(casterQQ);
    
    if (caster.mijinglevel_id<12&& caster.xiangulevel_id<10) {
        e.reply('你的道行不够，还没有传道授业为别人指点修行的能力');
         return true; // 确保返回true
    }
    return this.handleTeach(e, false);
}

// 传授全部功法
async teachAllGongfa(e) {
    if (!e.isGroup) {
        e.reply('请在群聊中传授功法');
        return true;
    }

    const casterQQ = e.user_id.toString().replace('qg_', '');
    const caster = await Read_player(casterQQ);
    
    if (caster.mijinglevel_id<12&& caster.xiangulevel_id<10) {
        e.reply('你的道行不够，还没有传道授业为别人指点修行的能力');
         return true; // 确保返回true
    }
    return this.handleTeach(e, true);
}

// 处理功法传授的核心逻辑
async handleTeach(e, isAll = false) {
    if (!e.isGroup) {
        e.reply('请在群聊中传授功法');
        return true;
    }

    const casterQQ = e.user_id.toString().replace('qg_', '');
    const caster = await Read_player(casterQQ);
    
    // 检查施法者是否拥有功法
    if (!caster.学习的功法 || caster.学习的功法.length === 0) {
        e.reply('你尚未习得任何功法，无法传授');
        return true;
    }
    // 检查施法者是否拥有功法
    if (caster.mijinglevel_id<12&& caster.xiangulevel_id<12) {
        e.reply('你的道行不够，还没有传道授业为别人指点修行的能力');
        return true;
    }
    // 获取目标玩家
    const atItems = e.message.filter(item => item.type === "at");
    if (atItems.length === 0) {
        e.reply('请指定传授目标（@某人）');
        return true;
    }

    const targetQQ = atItems[0].qq.toString().replace('qg_', '');
    
    // 不能传授给自己
    if (targetQQ === casterQQ) {
        e.reply('无法向自己传授功法');
        return true;
    }

    // 检查目标玩家是否存在
    if (!await existplayer(targetQQ)) {
        e.reply('目标玩家不存在');
        return true;
    }

    const target = await Read_player(targetQQ);
    const gongfaHierarchy = {
  "神慧者": 8,
  "仙帝法": 7,
  "仙王法": 6,
  "十凶宝术": 6,
  "帝经": 5,
  "九秘": 5,
  "盖世杀术": 5,
  "道与法": 4,
  "宝术": 4,
  "天赋": 2,
  "修炼功法": 1,
  "炼器": 1,
  "推演": 1,
  "技能": 1,
  "武学": 1
};

// 定义天资等级映射（数字越大表示天资越高）
const aptitudeLevels = {
  "无演无尽": 8,
  "万古无双": 7,
  "绝世天骄": 6,
  "旷世奇才": 5,
  "天纵之资": 4,
  "超凡资质": 3,
  "平庸之资": 2,
  "先天不足": 1,
  "天弃之人": 0
};
  
    
    // 获取目标玩家的天资等级
    const targetAptitudeLevel = aptitudeLevels[target.天资等级] || 0;
    
    // 传授指定功法
    if (!isAll) {
        const gongfaName = e.msg.replace(/^#传授功法(?:\s+|@\d+\s*)?/, '').trim();
        
        if (!gongfaName) {
            e.reply('请指定要传授的功法名称');
            return true;
        }

        // 检查施法者是否拥有该功法
        if (!caster.学习的功法.includes(gongfaName)) {
            e.reply(`你尚未习得【${gongfaName}】，无法传授`);
            return true;
        }

        // 检查目标是否已学习该功法
        if (target.学习的功法 && target.学习的功法.includes(gongfaName)) {
            e.reply(`目标已掌握【${gongfaName}】，无需传授`);
            return true;
        }
        
        // 获取功法类型（从数据中查找）
        let gongfaType = "修炼功法"; // 默认类型
        for (const category in data) {
            if (Array.isArray(data[category])) {
                const found = data[category].find(item => item.name === gongfaName);
                if (found) {
                    gongfaType = found.type || "修炼功法";
                    break;
                }
            }
        }
        
        // 获取功法层级
        const gongfaLevel = gongfaHierarchy[gongfaType] || 8;
        
        // 检查天资条件
        if (targetAptitudeLevel < gongfaLevel) {
            e.reply([
                `【天资不足】`,
                `${target.名号}的天资【${target.天资等级}】不足以领悟【${gongfaName}】！`,
                `需要天资至少达到：${getAptitudeNameByLevel(gongfaLevel)}`,
                `当前天资：${target.天资等级}`,
                `请先提升目标的天资等级`
            ].join('\n'));
            return true;
        }
        
        // 特殊功法检查
        if (gongfaName === '自然大道') {
            // 允许学习的资质类型
            const allowedAptitudes = ["平庸之资", "先天不足", "天弃之人"];
            
            if (!allowedAptitudes.includes(target.天资等级)) {
                e.reply([
                    `【大道拒斥】`,
                    `${target.名号}的天资【${target.天资等级}】过于聪慧，`,
                    `无法领悟【自然大道】的真谛！`,
                    `自然大道只适合天资平庸者修炼`,
                    `当前天资：${target.天资等级}`
                ].join('\n'));
                return true;
            }
        }
        
        if (gongfaName === '无始经' && target.灵根.name !== "先天圣体道胎") {
            e.reply(`【灵根不符】目标需要先天圣体道胎灵根才能学习【无始经】`);
            return true;
        }
        
        if (gongfaName === '西皇经' && !["道胎", "圣体道胎"].includes(target.灵根.type)) {
            e.reply(`【灵根不符】目标需要拥有先天道胎才能学习【西皇经】`);
            return true;
        }
        
        if (["妖帝古经", "万龙古经"].includes(gongfaName) && target.灵根.type !== "妖体") {
            e.reply(`【灵根不符】目标需要妖体才能学习【${gongfaName}】`);
            return true;
        }

        // 使用Add_player_学习功法方法
        await Add_player_学习功法(targetQQ, gongfaName);
        await player_efficiency(targetQQ);
        
        // 添加传授记录
        caster.传授记录 = caster.传授记录 || [];
        caster.传授记录.push({
            时间: new Date().toLocaleString(),
            目标: target.名号,
            功法: gongfaName
        });
        await Write_player(casterQQ, caster);
        
        e.reply([
            `【功法传授】`,
            `${caster.名号}将毕生所学【${gongfaName}】倾囊相授`,
            `${target.名号}顿觉灵台清明，`,
            `功法真谛如醍醐灌顶，尽数领悟！`,
        ].join('\n'));
        return true;
    }
    
    // 传授全部功法
    const teachableGongfa = [];
    const alreadyKnown = [];
    const failedByAptitude = [];
    const failedBySpecial = [];
    
    for (const gongfaName of caster.学习的功法) {
        // 检查目标是否已学习
        if (target.学习的功法 && target.学习的功法.includes(gongfaName)) {
            alreadyKnown.push(gongfaName);
            continue;
        }
        
        // 获取功法类型
        let gongfaType = "修炼功法";
        for (const category in data) {
            if (Array.isArray(data[category])) {
                const found = data[category].find(item => item.name === gongfaName);
                if (found) {
                    gongfaType = found.type || "修炼功法";
                    break;
                }
            }
        }
        
        // 获取功法层级
        const gongfaLevel = gongfaHierarchy[gongfaType] || 8;
        
        // 检查天资条件
        if (targetAptitudeLevel < gongfaLevel) {
            failedByAptitude.push(`${gongfaName}(需要${getAptitudeNameByLevel(gongfaLevel)})`);
            continue;
        }
        
        // 特殊功法检查
        if (gongfaName === '自然大道') {
            const allowedAptitudes = ["平庸之资", "先天不足", "天弃之人"];
            if (!allowedAptitudes.includes(target.天资等级)) {
                failedBySpecial.push(`${gongfaName}(天资过高)`);
                continue;
            }
        }
        
        if (gongfaName === '无始经' && target.灵根.name !== "先天圣体道胎") {
            failedBySpecial.push(`${gongfaName}(需要先天圣体道胎)`);
            continue;
        }
        
        if (gongfaName === '西皇经' && !["道胎", "圣体道胎"].includes(target.灵根.type)) {
            failedBySpecial.push(`${gongfaName}(需要道胎)`);
            continue;
        }
        
        if (["妖帝古经", "万龙古经"].includes(gongfaName) && target.灵根.type !== "妖体") {
            failedBySpecial.push(`${gongfaName}(需要妖体)`);
            continue;
        }
        
        // 可以传授
        teachableGongfa.push(gongfaName);
    }
    
    if (teachableGongfa.length === 0) {
        let message = ['无法传授任何功法'];
        
        if (alreadyKnown.length > 0) {
            message.push(`目标已掌握：${alreadyKnown.length}门功法`);
        }
        
        if (failedByAptitude.length > 0) {
            message.push(`天资不足：${failedByAptitude.length}门功法`);
        }
        
        if (failedBySpecial.length > 0) {
            message.push(`条件不符：${failedBySpecial.length}门功法`);
        }
        
        e.reply(message.join('\n'));
        return true;
    }
    
    // 使用Add_player_学习功法批量传授
    for (const gongfaName of teachableGongfa) {
        await Add_player_学习功法(targetQQ, gongfaName);
    }
    await player_efficiency(targetQQ);
    
    // 添加传授记录
    caster.传授记录 = caster.传授记录 || [];
    caster.传授记录.push({
        时间: new Date().toLocaleString(),
        目标: target.名号,
        功法: '全部功法',
        传授数量: teachableGongfa.length
    });
    await Write_player(casterQQ, caster);
    
    const message = [
        `【醍醐灌顶·倾囊相授】`,
        `${caster.名号}将毕生所学尽数传授给${target.名号}`,
        `成功传授功法：${teachableGongfa.length}门`,
        `传授列表：${teachableGongfa.join('、')}`,
        `目标已掌握功法：${alreadyKnown.length}门`,
    ];
    
    if (failedByAptitude.length > 0) {
        message.push(`天资不足：${failedByAptitude.length}门`);
    }
    
    if (failedBySpecial.length > 0) {
        message.push(`条件不符：${failedBySpecial.length}门`);
    }
    
    message.push(
        `${target.名号}灵台清明，如获新生！`,
    );
    
    e.reply(message.join('\n'));
    return true;
}




  async suppressPlayer(e) {
    // 群聊限定
    if (!e.isGroup) {
        e.reply('请在群聊中使用此无上神通');
        return true;
    }

    // 获取施法者信息
    const casterQQ = e.user_id.toString().replace('qg_', '');
    const caster = await Read_player(casterQQ);
    
    // 检查施法者境界（仙帝及以上）
    if (caster.mijinglevel_id < 21) {
        e.reply([
            `▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂`,
            `【境界不足】`,
            `镇压诸天、令万灵永寂乃仙帝伟力！`,
            `道友当前境界不足，无法施展此无上神通！`,
            `▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂`
        ].join('\n'));
        return true;
    }

    // 检查是否有艾特信息
    const atItems = e.message.filter(item => item.type === "at");
    if (atItems.length === 0) {
        e.reply('请指定要镇压的目标（@某人）');
        return true;
    }

    // 获取目标玩家QQ
    const targetQQ = atItems[0].qq.toString().replace('qg_', '');

    // 不能镇压自己
    if (targetQQ === casterQQ) {
        e.reply('道友不可对己身施展镇压之术！');
        return true;
    }

    // 检查目标玩家是否存在
    if (!await existplayer(targetQQ)) {
        e.reply('目标玩家不存在于诸天万界中');
        return true;
    }

    // 读取目标玩家信息
    const target = await Read_player(targetQQ);

    // 执行镇压：将目标状态设置为永寂
    await this.setPlayerToYongji(targetQQ, caster);

    // 构建镇压文案（根据境界层次）
    const messages = this.generateSuppressionMessage(caster, target);

    e.reply(messages.join('\n'));
    return true;
}

/** 将玩家设置为永寂状态 */
async setPlayerToYongji(targetQQ, caster) {
    // 设置永寂状态
    const yongjiData = {
        state: 'yongji',
        caster: caster.名号,
        time: new Date().toLocaleString(),
        casterLevel: caster.mijinglevel_id
    };
      // 设置永寂行动状态
        let arr = {
            action: '永寂',
            end_time: new Date().getTime() + 99999 * 60000, // 近乎永久
            time: 99999 * 60000,
            shutup: '1',
            working: '1',
            Place_action: '1',
            Place_actionplus: '1',
            power_up: '1',
            mojie: '1',
            xijie: '1',
            plant: '1',
            mine: '1',
            yongji: '1' // 特殊标记
        };

            // 清除其他行动状态
    await redis.del(`xiuxian:player:${targetQQ}:action`);
    await redis.set('xiuxian:player:' + targetQQ + ':action', JSON.stringify(arr));
    // 记录到玩家数据
    const player = await Read_player(targetQQ);
    player.永寂标记 = 1; // 标记为永寂状态
    player.镇压记录 = player.镇压记录 || [];
    player.镇压记录.push({
        时间: new Date().toLocaleString(),
        施法者: caster.名号,
        施法者境界: data.Levelmijing_list.find(l => l.level_id === caster.mijinglevel_id)?.level || '未知'
    });
    await Write_player(targetQQ, player);
}

/** 生成镇压文案（根据施法者境界） */
generateSuppressionMessage(caster, target) {
    const messages = [];

    // 仙帝级镇压文案（21-22级）
    if (caster.mijinglevel_id <= 22) {
        messages.push(
            `【仙帝镇世·万灵永寂】`,
            `${caster.名号}眸光开阖，整部古史都在颤栗！`,
            `一只覆盖整片星海的帝手探出，`,
            `无穷大道符文缠绕，镇压向${target.名号}！`,
            `"违逆帝者，当永寂！"`,
            `帝音回荡，万道哀鸣！`,
            `${target.名号}的身影在帝手下寸寸崩灭，`,
            `真灵被投入永寂之地，万世不得超生！`,
        );
    }
    // 祭道级镇压文案（23级）
    else if (caster.mijinglevel_id === 23) {
        messages.push(
            `【祭道镇世·诸天同寂】`,
            `轰！！！`,
            `整部古史突然剧烈震荡！${caster.名号}的祭道符文照亮诸天万界！`,
            `"祭吾真名，葬汝永世！"`,
            `祭祀音回荡，${target.名号}所在宇宙瞬间枯竭，`,
            `时光长河断流，因果命运崩解！`,
            `诸天万界都在哀鸣，无数宇宙走向终点，`,
            `${target.名号}的真名被从古史中彻底抹除，`,
            `永坠祭海，永世沉沦！`,
        );
    }
    // 祭道之上镇压文案（24级+）
    else {
        messages.push(
            `【永恒镇压·诸天归墟】`,
            `眸光所至，整部古史突然陷入死寂！`,
            `${caster.名号}的身影同时显化在：`,
            ` 开天辟地前的混沌原点`,
            ` 现世轮回的尽头`,
            ` 所有可能的未来支流`,
            `"枯竭。"`,
            `二字道出，${target.名号}所在时空瞬间湮灭！`,
            `连"存在"这个概念本身都在瓦解！`,
            `诸天万界，无量宇宙，所有生灵心头莫名悸动，`,
            `仿佛某种至高无上的存在睁开了双眼。`,
            `"永恒镇压。"`,
            `四字道出，万古时空彻底凝固！`,
            `${target.名号}被永恒禁锢在"无"与"有"的夹缝中，`,
            `永世不得超脱！`,
        );
    }

    return messages;
}
async yingzhao(e) {
    // 群聊限定
    if (!e.isGroup) {
        e.reply('请在群聊中使用此神圣术法');
        return true;
    }

    // 检查施法者境界
    const casterQQ = e.user_id.toString().replace('qg_','');
    const caster = await Read_player(casterQQ);
    
    // 只有仙帝级以上才能使用映照复活
    if (caster.mijinglevel_id < 21) {
        e.reply([
            `▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂`,
            `【境界不足】`,
            `映照诸天、逆转生死乃仙帝伟力！`,
            `道友当前境界不足，无法施展此无上神通！`,
            `▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂`
        ].join('\n'));
        return true;
    }

    // 检查是否有艾特信息（可以复活他人或自己）
    let targetQQ;
    const atItems = e.message.filter(item => item.type === "at");
    
    if (atItems.length > 0) {
        // 复活他人
        targetQQ = atItems[0].qq.toString().replace('qg_','');
    } else {
        // 复活自己
        targetQQ = casterQQ;
    }

    // 检查目标玩家是否存在
    if (!await existplayer(targetQQ)) {
        e.reply('目标玩家不存在于诸天万界中');
        return true;
    }

    // 读取目标数据
    const target = await Read_player(targetQQ);
    const targetAction = await redis.get('xiuxian:player:' + targetQQ + ':action');
    const parsedAction = targetAction ? JSON.parse(targetAction) : null;

    // 判断目标状态
    const isSelf = targetQQ === casterQQ;
    const isYongji = parsedAction?.yongji; // 永寂状态
    const isTianlao = parsedAction?.action === '天牢'; // 天牢状态
    const isHeianlaolong = parsedAction?.heianlaolong; // 黑暗牢笼状态
    const isNormal = !isYongji && !isTianlao && !isHeianlaolong; // 正常状态但有其他异常

    // 处理不同状态
    if (isYongji) {
        // 永寂状态 - 执行复活
        return await this.handleYongjiResurrection(e, caster, target, targetQQ);
    } else if (isTianlao) {
        // 天牢状态 - 解放并恢复
        return await this.handleTianlaoRelease(e, caster, target, targetQQ);
    } else if (isHeianlaolong) {
        // 黑暗牢笼状态 - 解救并恢复
        return await this.handleHeianlaolongRescue(e, caster, target, targetQQ);
    } else if (isSelf) {
        // 对自己使用 - 恢复满血并解除所有状态
        return await this.handleSelfRecovery(e, caster, targetQQ);
    } else {
        // 对他人使用但非特殊状态 - 恢复满血并解除异常状态
        return await this.handleNormalRecovery(e, caster, target, targetQQ);
    }
}

/** 处理永寂复活 */
async handleYongjiResurrection(e, caster, target, targetQQ) {
    // 执行复活
    await this.resurrectPlayer(targetQQ, caster);

    // 构建回复消息
    const messages = [
        `【映照诸天·逆转生死】`,
        `${caster.名号}于超脱现世外的永恒未知之地施展无上仙帝伟力，`,
        `于岁月长河中映照${targetQQ === caster.qq ? '己身' : target.名号}！`,
        ``,
        `整部古史都在颤栗！${caster.名号}的身影同时显现在：`,
        ` 仙域初开的混沌纪元`,
        ` 帝落时代的血色黄昏`,
        ` 现世轮回的尽头`,
        ``,
        `"归来！"`,
        `一声道喝震碎时间长河！无穷诸天仿佛都要炸开了！`,
        `强大的力量改写了古史中既定的命运`,
        `一道贯穿古今未来的神光降临，`,
        `${targetQQ === caster.qq ? '己身' : target.名号}从永寂中归来！`,
    ];
    
    // 祭道级映照文案（22-23级）
    if (caster.mijinglevel_id >= 22 && caster.mijinglevel_id <= 23) {
        messages.push(
            ``,
            `「他化自在，他化万古！」`,
            ``,
            `整部古史突然剧烈震荡！${caster.名号}的祭道符文照亮黑暗深渊：`,
            `- 仙域边荒的帝骨残骸突然绽放霞光`,
            `- 葬坑深处的祭文自主燃烧`,
            `- 魂河尽头的无上存在猛然睁眼`,
            ``,
            `三道贯穿古今的帝影同时结印映照诸天，诸天万界响起祭祀音：`,
            `"以我祭道真名，唤汝真灵重聚！"`
        );
    }
    
    // 祭道之上映照文案（24级+）
    if (caster.mijinglevel_id >= 24) {
        messages.push(
            ``,
            `【永恒映照·祭道之上】`,
            `「眸光所至，枯竭所有，重现所有！」`,
            ``,
            `轰！`,
            `整部古史突然剧烈震荡！`,
            ``,
            `诸天万界，无量宇宙，所有生灵心头莫名悸动，仿佛某种至高无上的存在睁开了双眼。`,
            ``,
            `"枯竭。"`,
            `二字道出，永寂黑暗吞噬万古！`,
            ``,
            `无量量的宇宙开始枯竭，`,
            `无数个纪元的事与物都化作了光雨，`,
            `命运、造化、因果、时空、大道都如同梦幻泡影般虚淡了，仿佛要从未存在过！`,
            ``,
            `就在诸天即将彻底湮灭时——`,
            ``,
            `"重现。"`,
            `${caster.名号}的眸光再次闪动！`,
            ``,
            `号称"不可逆"的永寂，竟如薄雾般被生生蒸干！ `,
            `连"死亡"这个概念本身，都在颤栗、哀鸣！！ `,
            `破碎的宇宙重新凝聚，`,
            `干涸的时光长河重新奔涌，`,
            `${target.名号}的身影从虚无中踏出，`,
            `诸天震颤，所有仙帝级存在皆心生感应，望向此地！`,
            `"这便是......祭道之上！"`
        );
    }
    
    e.reply(messages.join('\n'));
    return true;
}

/** 处理天牢解放 */
async handleTianlaoRelease(e, caster, target, targetQQ) {
    // 解除天牢状态
    await redis.del(`xiuxian:player:${targetQQ}:action`);
    
    // 恢复玩家属性
    const player = await Read_player(targetQQ);
    player.当前血量 = player.血量上限;
    player.修为 = Math.floor(player.修为 * 0.9); // 保留90%修为
    player.灵石 = Math.floor(player.灵石 * 0.7); // 保留70%灵石
    
    // 添加解放记录
    player.解放记录 = player.解放记录 || [];
    player.解放记录.push({
        时间: new Date().toLocaleString(),
        施法者: caster.名号,
        施法者境界: data.Levelmijing_list.find(l => l.level_id === caster.mijinglevel_id)?.level || '未知'
    });

    await Write_player(targetQQ, player);
    
    // 构建回复消息
    const message = [
        `【映照诸天·破狱解厄】`,
        `${caster.名号}施展无上仙帝伟力，映照诸天万界！`,
        
        `天牢深处，一道神光贯穿古今，`,
        `坚固的牢狱壁垒在仙帝伟力前如薄纸般破碎！`,
        
        `${target.名号}从天牢中被解放，`,
        `所有伤势瞬间痊愈！`,
        
        `"谢仙帝救命之恩！"`
    ].join('\n');
    
    e.reply(message);
    return true;
}

/** 处理黑暗牢笼解救 */
async handleHeianlaolongRescue(e, caster, target, targetQQ) {
    // 解除黑暗牢笼状态
    await redis.del(`xiuxian:player:${targetQQ}:action`);
    
    // 恢复玩家属性
    const player = await Read_player(targetQQ);
    player.当前血量 = player.血量上限;
    player.修为 = Math.floor(player.修为 * 0.9); // 保留90%修为
    player.灵石 = Math.floor(player.灵石 * 0.7); // 保留70%灵石
    
    // 添加解救记录
    player.解救记录 = player.解救记录 || [];
    player.解救记录.push({
        时间: new Date().toLocaleString(),
        施法者: caster.名号,
        施法者境界: data.Levelmijing_list.find(l => l.level_id === caster.mijinglevel_id)?.level || '未知'
    });

    await Write_player(targetQQ, player);
    
    // 构建回复消息 - 根据仙帝境界不同显示不同文案
    let messages = [];
    
    // 普通仙帝级解救文案（21级）
    if (caster.mijinglevel_id === 21) {
        messages = [
            `【映照诸天·破灭黑暗】`,
            `${caster.名号}于永恒未知之地睁开仙帝之眸，`,
            `眸光穿透无尽虚空，映照那传说中永无天日的黑暗牢笼！`,
            ``,
            `"区区黑暗，也敢囚我道友？"`,
            `一声道喝震碎万古虚空！`,
            `仙帝伟力化作无量神光，贯穿永恒黑暗！`,
            `那号称不朽的黑暗物质在仙帝法则前如冰雪般消融，`,
            `冰冷的秩序神链寸寸断裂！`,
            ``,
            `接引古殿虚影剧烈震颤，青铜巨门轰然洞开！`,
            `一道璀璨仙光自牢笼深处迸发，`,
            `${target.名号}的元神挣脱黑暗枷锁，重归现世！`,
            ``,
            `"谢仙帝救命之恩！"`
        ];
    }
    // 祭道级解救文案（22-23级）
    else if (caster.mijinglevel_id >= 22 && caster.mijinglevel_id <= 23) {
        messages = [
            `【祭道映照·焚尽黑暗】`,
            `${caster.名号}立于时光长河之上，祭道符文在眸中流转，`,
            `目光所及，那永恒黑暗的牢笼竟开始燃烧！`,
            ``,
            `"他化自在，他化万古！"`,
            `三道贯穿古今的帝影同时显化：`,
            `- 一道立于现世，手持仙剑斩断秩序神链`,
            `- 一道立于过去，焚尽黑暗物质本源`,
            `- 一道立于未来，镇压接引古殿反噬`,
            ``,
            `整部古史都在颤栗！黑暗牢笼的根基被祭道伟力彻底焚毁！`,
            `那号称"永无天日"的囚笼，第一次被光明彻底照亮！`,
            `${target.名号}的元神沐浴祭道神火，重塑真身！`,
            ``,
            `"以祭道之名，赐汝新生！"`
        ];
    }
    // 祭道之上解救文案（24级+）
    else if (caster.mijinglevel_id >= 24) {
        messages = [
            `【永恒映照·湮灭黑暗】`,
            `「眸光所至，枯竭所有，重现所有！」`,
            `${caster.名号}的眸光穿透诸天万界，落在黑暗牢笼深处。`,
            ``,
            `轰！`,
            `整部古史突然剧烈震荡！`,
            `接引古殿发出不堪重负的哀鸣，`,
            `那流淌了万古纪元的黑暗物质竟开始...倒流！`,
            ``,
            `"枯竭。"`,
            `二字道出，永寂黑暗吞噬万古！`,
            `黑暗牢笼、秩序神链、接引古殿...`,
            `一切与黑暗相关的事物都在湮灭，归于虚无！`,
            ``,
            `就在黑暗即将彻底消失时——`,
            ``,
            `"重现。"`,
            `${caster.名号}的眸光再次闪动！`,
            ``,
            `一道纯净无暇的身影自虚无中踏出，`,
            `正是${target.名号}，`,
            `其元神晶莹剔透，再无半点黑暗侵蚀痕迹！`,
            ``,
            `诸天震颤，所有仙帝级存在皆心生感应：`,
            `"黑暗源头...被抹除了？！"`
        ];
    }
    
    e.reply(messages.join('\n'));
    return true;
}

/** 处理自身恢复 */
async handleSelfRecovery(e, caster, targetQQ) {
    // 解除所有异常状态
    await redis.del(`xiuxian:player:${targetQQ}:action`);
    
    // 恢复玩家属性
    const player = await Read_player(targetQQ);
    player.当前血量 = player.血量上限;
    player.修为 = player.修为; // 保持修为不变
    player.灵石 = player.灵石; // 保持灵石不变
    player.道伤=0;
    player.生命本源=100+player.灵根.生命本源;
    // 添加恢复记录
    player.恢复记录 = player.恢复记录 || [];
    player.恢复记录.push({
        时间: new Date().toLocaleString(),
        境界: data.Levelmijing_list.find(l => l.level_id === player.mijinglevel_id)?.level || '未知'
    });

    await Write_player(targetQQ, player);
    
    // 构建回复消息
    const message = [
        `【映照己身·万法不侵】`,
        `${caster.名号}施展无上仙帝伟力，映照己身！`,
        
        `周身仙光缭绕，所有异常状态瞬间消散，`,
        `伤势痊愈，状态恢复到巅峰！`,
        
        `"我身即道，万法不侵！"`
    ].join('\n');
    
    e.reply(message);
    return true;
}

/** 处理普通恢复 */
async handleNormalRecovery(e, caster, target, targetQQ) {
    // 解除所有异常状态
    await redis.del(`xiuxian:player:${targetQQ}:action`);
    
    // 恢复玩家属性
    const player = await Read_player(targetQQ);
    player.当前血量 = player.血量上限;
    player.道伤=0;
    player.生命本源=100+player.灵根.生命本源;
    // 添加恢复记录
    player.恢复记录 = player.恢复记录 || [];
    player.恢复记录.push({
        时间: new Date().toLocaleString(),
        施法者: caster.名号,
        施法者境界: data.Levelmijing_list.find(l => l.level_id === caster.mijinglevel_id)?.level || '未知'
    });

    await Write_player(targetQQ, player);
    
    // 构建回复消息
    const message = [
        `【映照诸天·涤荡尘埃】`,
        `${caster.名号}施展仙帝伟力，映照${target.名号}！`,
        
        `一道纯净仙光笼罩${target.名号}，`,
        `所有异常状态瞬间消散，伤势痊愈！`,
        
        `"谢仙帝恩典！"`
    ].join('\n');
    
    e.reply(message);
    return true;
}

/** 复活玩家具体逻辑 */
async resurrectPlayer(targetQQ, caster) {
    // 解除永寂状态
    await redis.del(`xiuxian:player:${targetQQ}:yongji`);
    await redis.del(`xiuxian:player:${targetQQ}:action`);

    // 恢复基础属性
    const target = await Read_player(targetQQ);
    target.当前血量 = target.血量上限;
    target.永寂标记 = 0;
    
    // 添加复活记录
    target.复活记录 = target.复活记录 || [];
    target.复活记录.push({
        时间: new Date().toLocaleString(),
        施法者: caster.名号,
        施法者境界: data.Levelmijing_list.find(l => l.level_id === caster.mijinglevel_id)?.level || '未知'
    });

    await Write_player(targetQQ, target);
}
 
async reshapeLinggen(e) {
   // 群聊限定
   if (!e.isGroup) {
     e.reply('修仙游戏请在群聊中游玩');
     return;
   }
   
   // 获取操作者信息
   const invokerQQ = e.user_id;
   const invoker = await Read_player(invokerQQ);
   
   // 检查操作者境界
   if (invoker.mijinglevel_id < 21) {
     return e.reply("你尚未达到仙帝境界，无法重塑他人灵根！");
   }
   
   // 检查是否有艾特信息
   const atItems = e.message.filter(item => item.type === "at");
   if (atItems.length === 0) {
     return e.reply("请艾特需要重塑灵根的玩家");
   }
   
   // 获取目标玩家QQ
   const targetQQ = atItems[0].qq;
   
   // 处理消息内容：去掉指令前缀和所有艾特
   let content = e.msg.replace(/^#重塑灵根\s*/, '');
   content = content.replace(/$$CQ:at,qq=\d+$$\s*/g, '');
   const linggenName = content.trim();
   
   // 如果没有提取到灵根名称，提示用户输入
   if (!linggenName) {
     return e.reply("请指定要重塑的灵根名称，例如：先天混沌圣体道胎");
   }
   
   // ==== 新增：特殊灵根拦截 ====
   const forbiddenLinggens = [
     "终焉神魔体", 
     "无演无尽者", 
     "圆神", 
     "先天混沌圣体道胎", 
     "如梦本尊"
   ];
   
   if (forbiddenLinggens.includes(linggenName)&&invoker.mijinglevel_id <23) {
     return e.reply([
       `【仙帝伟力·不可重塑】`,
       `${invoker.名号}欲重塑灵根为【${linggenName}】，却感天地法则剧烈震荡！`,
       `「轰隆——」`,
       `诸天万界剧烈震动，时空长河倒卷！`,
       `一股源自大道本源的禁忌之力反噬而来！`,
       `${invoker.名号}仙帝之躯剧烈震颤，嘴角溢出一缕帝血！`,
       `「不可能！这灵根竟引动大道本源反噬！」`,
       `冥冥中，一道贯穿古今的声音在神魂中回响：`,
       `「此等灵根乃大道禁忌，纵使仙帝亦不可强塑！」`,
       `「仙帝也无法达到万能的程度！」`,
       `重塑失败！${invoker.名号}道基受损，需修养三日方能恢复！`
     ].join("\n"));
   }
   // ==== 特殊灵根拦截结束 ====
   
   // 验证目标玩家
   if (!await existplayer(targetQQ)) {
     return e.reply("目标玩家不存在，请先创建角色");
   }
   
   const targetPlayer = await Read_player(targetQQ);
   
   // 查找灵根
   const newLinggen = data.talent_list.find(item => item.name === linggenName);
   if (!newLinggen) {
     return e.reply(`灵根【${linggenName}】不存在！`);
   }
   
   // 记录旧灵根信息
   const oldLinggen = targetPlayer.灵根;
   
   // 更新灵根
   targetPlayer.灵根 = newLinggen;
   targetPlayer.生命本源 = 100+targetPlayer.灵根.生命本源;
    await Write_player(targetQQ, targetPlayer);
    let equipment = await Read_equipment(targetQQ);
    await Write_equipment(targetQQ, equipment);
    await player_efficiency(targetQQ); // 添加await
      
 // 格式化新灵根属性
const formattedLinggen = {
    ...newLinggen,
    eff: `${(newLinggen.eff * 100).toFixed(0)}%`,
    法球倍率: `${(newLinggen.法球倍率 * 100).toFixed(0)}%`,
    攻击加成: `${((newLinggen.攻击 || 0) * 100).toFixed(0)}%`,
    防御加成: `${((newLinggen.防御 || 0) * 100).toFixed(0)}%`,
    生命加成: `${((newLinggen.生命 || 0) * 100).toFixed(0)}%`,
    生命本源: newLinggen.生命本源 || 0
};

// 构建回复消息
const message = [
    `【仙帝伟力·重塑灵根】`,
    `${invoker.名号}施展无上仙帝伟力，重塑${targetPlayer.名号}的灵根！`,
    `旧灵根: ${oldLinggen.name} (${oldLinggen.type})`,
    `新灵根: ${formattedLinggen.name} (${formattedLinggen.type})`,
    `灵根属性:`,
    ` 修炼加成: ${formattedLinggen.eff}`,
    ` 额外增伤: ${formattedLinggen.法球倍率}`,
    ` 攻击加成: ${formattedLinggen.攻击加成}`,
    ` 防御加成: ${formattedLinggen.防御加成}`,
    ` 生命加成: ${formattedLinggen.生命加成}`,
    ` 生命本源: +${formattedLinggen.生命本源}`,
    `${targetPlayer.名号}的灵根已被重塑为【${formattedLinggen.name}】！`
].join("\n");
   
   return e.reply(message);
}

// 推演天机功能
async tuiyanTianji(e) {
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
    // 权限检查：只有机器人管理员或修仙管理员可以使用
  const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
  const masterList = xiuxianConfig.Master || [];
  const userQQ = e.user_id.toString().replace('qg_', '');
  // 检查玩家境界是否足够推演天机
  if (!e.isMaster && !masterList.includes(userQQ)&&player.mijinglevel_id < 15) {
    e.reply('你境界不足，无法推演天机！');
    return;
  }
  
  // 解析功法名称
  const match = e.msg.match(/^#推演天机(.*)$/);
  if (!match || !match[1] || match[1].trim() === '') {
    e.reply('请指定要推演的功法名称！格式：#推演天机 功法名');
    return;
  }
  
  const targetGongfa = match[1].trim();
  
  // 遍历所有玩家存档
  let File = fs.readdirSync(__PATH.player_path);
  File = File.filter(file => file.endsWith(".json"));
  
  let foundPlayers = [];
  let processed = 0;
  
  for (let i = 0; i < File.length; i++) {
    let this_qq = File[i].replace(".json", '');
    let playerData = await Read_player(this_qq);
    
    // 检查玩家是否有这个功法
    if (playerData.学习的功法 && playerData.学习的功法.includes(targetGongfa)) {
      foundPlayers.push({
        qq: this_qq,
        name: playerData.名号 || '未知修士',
        realm: playerData.mijinglevel_id || 0
      });
    }
    
    processed++;
    
    // 每处理50个玩家显示进度
    if (processed % 50 === 0) {
      e.reply(`已推演 ${processed}/${File.length} 名修士的天机...`);
    }
  }
  
  // 构建回复消息
  if (foundPlayers.length === 0) {
    e.reply(`经过天机推演，发现诸天万界并无修士修炼【${targetGongfa}】此功法！`);
  } else {
    let message = [
      `【天机推演·功法溯源】`,
      `经过推演诸天万界，发现【${targetGongfa}】的修炼者信息：`,
      ``,
      `共计发现 ${foundPlayers.length} 名修士修炼此功法：`,
      ``
    ];
    
    // 如果玩家数量超过10个，只显示前10个
    let displayPlayers = foundPlayers.slice(0, 10);
    
    displayPlayers.forEach((p, index) => {
      message.push(`${index + 1}. ${p.name} (ID: ${p.qq}) - 境界: ${p.realm}`);
    });
    
    if (foundPlayers.length > 10) {
      message.push(``);
      message.push(`...还有 ${foundPlayers.length - 10} 名修士的信息被天机所遮蔽`);
    }
    
    message.push(``);
    message.push(`推演完成！共检查了 ${File.length} 名修士的修行记录。`);
    
    e.reply(message.join('\n'));
  }
}
    async  tianyi_yidao(e) {
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
          // 检查玩家mijinglevelid是否大于20
          if (player.mijinglevel_id <= 20) {
              e.reply("你并非超越诸天极限的生灵，没有这种伟力");
              return;
          }
          // 所有玩家
          let File = fs.readdirSync(__PATH.player_path);
          File = File.filter(file => file.endsWith(".json"));
          let File_length = File.length;
          let processed = 0;
          for (let i = 0; i < File_length; i++) {
              let this_qq = File[i].replace(".json", '');
              let player = await Read_player(this_qq);
              // 将除mijinglevelid为21以下的全部玩家修为和血气清为0
              if (player.mijinglevel_id < 7) {
                  player.血气 = 0;
                  player.修为 = 0;
                  await Write_player(this_qq, player);
          processed++;
    if (processed % 10 === 0) {
        e.reply(`已斩掉 ${processed}/${File_length} 名四极以下玩家的修为与血气...`);
    }
}
          }
          e.reply(`你从永恒未知之地转身，眼眸凝视整片现世诸天，以掌化刀划过虚空，强大的意志和仙帝伟力代表了天意一刀，至高力量针对了无量量宇宙中的修士，他们纷纷修炼体系断裂，修行道基炸开！`);
      }
async ciyujingjie(e) {
        // 境界描述配置
    const realmDescriptions = {
        level: {
            64: `九重天劫·大罗道果！周身混沌气弥漫，体内演化三十六诸天。挥手间星河倒转，一念永恒，此乃大罗金仙极境！`,
            63: `太乙道果！紫气东来三万里，头顶三花聚顶。弹指破灭万古青天，眸光开阖间界海生灭`
        },
        physique: {
            63: `不灭圣体！气血熔炼万界，骨文铭刻诸天法则。一滴血可填瀚海，一根发丝斩断星域`,
            62: `混元霸体！肉身横渡无量劫，细胞演化诸天万界。吐纳间混沌开天，血肉重组天地玄黄`
        }
    };
    // ==== 基础校验 ====
    if (!e.isGroup) return e.reply('需在群聊中使用');
    const atTarget = e.message.find(m => m.type === "at");
    if (!atTarget) return e.reply('请@目标玩家');
    
    const user_qq = e.user_id;
    const targetQQ = atTarget.qq;

    // ==== 权限检查 ====
    const [invoker, target] = await Promise.all([
        Read_player(user_qq),
        Read_player(targetQQ)
    ]);
    if (invoker.mijinglevel_id < 21) {
        return e.reply(`需仙帝境(21重)以上才可赐予境界`);
    }
    if (!target) return e.reply('目标玩家不存在');

    // ==== 指令解析 ====
    const match = e.msg.match(/赐予(练气|炼体)升(\d+)级/);
    if (!match) return e.reply('格式：赐予练气升5级 或 赐予炼体升5级');
    const [_, realmType, levelStr] = match;
    const levelIncrease = parseInt(levelStr);
    if (isNaN(levelIncrease) || levelIncrease <= 0) {
        return e.reply('请输入有效的境界提升级数');
    }

    // ==== 境界参数设置 ====
    const isLevelUp = realmType === '练气';
    const realmKey = isLevelUp ? 'level_id' : 'Physique_id';
    const maxLevel = isLevelUp ? 64 : 63;
    const currentLevel = target[realmKey];
    let newLevel = Math.min(currentLevel + levelIncrease, maxLevel);
    if (newLevel === currentLevel) {
        return e.reply(`目标已达到${realmType}最高境界`);
    }

    // ==== 寿元计算（移除绝灵时代压制） ====
    const getShouyuan = (level) => {
        if (level <= 6) return 3;
        else if (level <= 11) return 10;
        else if (level <= 16) return 20;
        else if (level <= 21) return 50;
        else if (level <= 26) return 100;
        else if (level <= 31) return 200;
        else if (level <= 36) return 500;
        else if (level <= 40) return 1000;
        else if (level == 41) return 1500;
        else if (level <= 44) return (level - 41) * 700 + 1500;
        else if (level <= 52) return (level - 44) * 1000 + 3600;
        else if (level <= 55) return (level - 52) * 1500 + 11600;
        else  if (level == 56) return 20000;
        else  if (level <= 62) return (level - 55) * 3000 + 20000;
        else  if (level == 62) return 100000;
        else  if (level <= 64) return 999999999999;
        return 0;
    };

    // 直接计算新寿元（无压制）
    const newShouyuan = getShouyuan(newLevel);
    const shouyuanAdded = newShouyuan + target.寿元;

    // ==== 执行境界提升 ====
    target[realmKey] = newLevel;
    target.寿元 = newShouyuan;
    if (isLevelUp) {
        target.修为 += levelIncrease * 1000000;
    } else {
        target.血气 += levelIncrease * 1500000;
    }
     let equipment = await Read_equipment(targetQQ);
    // ==== 数据保存 ====
    await Write_player(targetQQ, target);
    await Write_equipment(targetQQ, equipment);
    await Add_HP(targetQQ, 99999999999999);

    // ==== 消息构建 ====
    const realmName = data.Level_list.find(l => l.level_id === newLevel)?.level || '未知境界';
    let invokerAction = '';
    if (invoker.mijinglevel_id >= 23) {
        invokerAction = `\n${invoker.名号}眸光开合间，命运因果时空随之明灭：\n"大道不过泡影，念起则境界生..."`;
    } else if (invoker.mijinglevel_id === 22) {
        invokerAction = `\n${invoker.名号}祭道伟力贯通古今：\n"因果改写，大道重铸！"`;
    } else {
        invokerAction = `\n${invoker.名号}仙帝之威撼动万古：\n"赐汝道果，续写传奇！"`;
    }

    e.reply([
        `▼无上赐予·境界飞升▼`,
        `${realmType}境：${currentLevel} → ${newLevel}重天`,
        `寿元增加：${shouyuanAdded}年`,
        `${invokerAction}`,
        `\n${target.名号}已达${realmName}！`,
        realmDescriptions[isLevelUp ?  'level' : 'Physique'][newLevel] || ''
    ].join('\n'));
}
async guanding(e) {
    // ==== 基础校验 ====
    if (!e.isGroup) return e.reply('需在群聊中使用');
    
    const atTarget = e.message.find(m => m.type === "at");
    if (!atTarget) return e.reply('请@目标玩家');
    
    const user_qq = e.user_id;
    const targetQQ = atTarget.qq;

    // ==== 权限检查 ====
    const [invoker, target] = await Promise.all([
        Read_player(user_qq),
        Read_player(targetQQ)
    ]);
    
    // 检查操作者境界是否足够
    if (invoker.mijinglevel_id < 21) {
        return e.reply(`需仙帝境(21重)以上才可灌顶`);
    }
    if (!target) return e.reply('目标玩家不存在');

    // ==== 指令解析 ====
    const match = e.msg.match(/灌顶至(\d+)级/);
    if (!match) return e.reply('格式：灌顶至5级');
    
    const [_, targetLevelStr] = match;
    const targetLevel = parseInt(targetLevelStr);
    
    // 检查目标等级是否有效
    if (isNaN(targetLevel) || targetLevel <= 0 || targetLevel > 24) {
        return e.reply('请输入有效的境界等级(1-24)');
    }

    // ==== 灌顶限制检查 ====
    // 1. 不能超过操作者自身境界
    if (targetLevel > invoker.mijinglevel_id) {
        return e.reply(`无法灌顶至超过自身境界（你当前为${invoker.mijinglevel_id}重天）`);
    }
    
    // 2. 不能低于目标当前境界
    if (targetLevel <= target.mijinglevel_id) {
        return e.reply(`目标当前已是${target.mijinglevel_id}重天，无需灌顶`);
    }

    // ==== 获取境界配置 ====
    const targetRealm = data.Levelmijing_list.find(l => l.level_id === targetLevel);
    if (!targetRealm) {
        return e.reply('未知境界配置，请联系管理员');
    }

    // ==== 执行灌顶 ====
    const oldLevel = target.mijinglevel_id;
    target.mijinglevel_id = targetLevel;
    
    // 更新基础属性
    target.基础攻击 = targetRealm.基础攻击;
    target.基础防御 = targetRealm.基础防御;
    target.基础血量 = targetRealm.基础血量;
    


     let equipment = await Read_equipment(targetQQ);
    // ==== 数据保存 ====
    await Write_player(targetQQ, target);
    await Write_equipment(targetQQ, equipment);
    await Add_HP(targetQQ, 99999999999999);
    
    // ==== 消息构建 ====
    let invokerAction = '';
    if (invoker.mijinglevel_id >= 23) {
        invokerAction = `\n${invoker.名号}眸光开合间，命运长河为之倒流：\n"今日助你破境，他日共踏仙路！"`;
    } else if (invoker.mijinglevel_id === 22) {
        invokerAction = `\n${invoker.名号}祭道伟力倾泻而下：\n"以我道果，铸你根基！"`;
    } else {
        invokerAction = `\n${invoker.名号}仙帝之威笼罩四方：\n"灌顶传功，助你登天！"`;
    }

    e.reply([
        `▼无上灌顶·境界突破▼`,
        `目标境界：${oldLevel} → ${targetLevel}重天`,
        `当前境界：${targetRealm.level}`,
        `${invokerAction}`,
        `\n${target.名号}已直达${targetRealm.level}！`
    ].join('\n'));
}
async command_zhengdao(e) {
    if (!verc({ e })) return false;
    
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const player = await Read_player(usr_qq);
    

 // 检查自己是否有护道状态（临时状态，允许在已有大帝的情况下证道）
const isProtected = player.护道状态;   // 注意：这个护道状态是轰击天地万道设置的

// 检查当世是否已有大帝（天心印记持有者）
const hasHeavenHeartMark = await this.checkHeavenHeartMark(usr_qq);

// 如果当世已有大帝，且当前玩家没有护道状态，则无法证道
if (hasHeavenHeartMark && !isProtected) {
    e.reply([
        `【天心印记·帝路断绝】`,
        
        `${player.名号}欲证道成帝，却感天地大道压制！`,
        `当世已有大帝存在，天心印记镇压万道！`,
        
        `"一时代只容一帝，此乃天道铁律！"`
    ].join("\n"));
    return false;
}

    
    // 获取时代信息
    const set = config.getConfig('xiuxian', 'xiuxian');
    const currentEra = set.Era?.current || { index: 0, years: 0 };
    
    // 时代系统配置
    const eraCostRates = [0.75, 0.8, 1.0, 2.0, 3.0];
    const eraDifficultyRates = [0.8, 0.9, 1.0, 1.2, 1.5];
    const eraNames = ["神话时代", "太古时代", "天命时代", "末法时代", "绝灵时代"];
    
    // 先定义 difficultyRate
    const difficultyRate = eraDifficultyRates[currentEra.index];
    
    // 然后再使用它
    const costRate = eraCostRates[currentEra.index];
    const eraName = eraNames[currentEra.index];
    const eraBoost = difficultyRate; // 使用难度系数作为时代加成
    const costModifier = costRate !== 1.0 ? `(×${costRate})` : "";
    
    // 计算实际需求
    const base_need_exp = Math.pow(2, 15) * 250000;
    const actual_need_exp = Math.ceil(base_need_exp * costRate);
    const exp2 = Math.max(0, actual_need_exp - player.修为);
    const exp3 = Math.max(0, actual_need_exp - player.血气);
    
    // 资源检查
    if (player.修为 < actual_need_exp) {
        e.reply([
            `修为不足以证道成帝！`,
            
            `当前时代: ${eraName} ${costRate !== 1.0 ? `(消耗${costRate > 1 ? '增加' : '减少'}${Math.abs(100 - costRate*100)}%)` : ''}`,
            `基础需求: ${base_need_exp.toLocaleString()}`,
            `实际需求: ${actual_need_exp.toLocaleString()} ${costModifier}`,
            `还需修为: ${exp2.toLocaleString()}`
        ].join("\n"));
        return false;
    }
    if (player.血气 < actual_need_exp) {
        e.reply([
            `血气不足以证道成帝！`,
            
            `当前时代: ${eraName} ${costRate !== 1.0 ? `(消耗${costRate > 1 ? '增加' : '减少'}${Math.abs(100 - costRate*100)}%)` : ''}`,
            `基础需求: ${base_need_exp.toLocaleString()}`,
            `实际需求: ${actual_need_exp.toLocaleString()} ${costModifier}`,
            `还需血气: ${exp3.toLocaleString()}`
        ].join("\n"));
        return false;
    }
    
    // 境界检查
    if (player.mijinglevel_id < 15) {
        const levelName = data.Levelmijing_list.find(l => l.level_id === player.mijinglevel_id)?.level || "未知境界";
        e.reply([
            `证道成帝需达到准帝九重天！`,
            `你当前的证道体系仅到达 ${levelName}`
        ].join("\n"));
        return false;
    }
    if (player.mijinglevel_id >= 16) {
        e.reply(`你早已成就帝位，不可重复证道`);
        return false;
    }
    
    // 开始证道仪式
    const eraEffectNote = costRate !== 1.0 
        ? `【天道影响】资源消耗${costRate > 1 ? '大幅增加' : '有所减少'}`
        : "";
    
    await e.reply([
        ` 诸天震动！万域共鸣！`,
        `时代背景：${eraName}`,
        eraEffectNote,
        
        `天地众生感应到${player.名号}在宇宙深处证道成帝`,
        `天道降下万道枷锁欲将${player.名号}抹除...`
    ].join("\n"));
    await sleep(2000);
    
    await e.reply(`破碎万道枷锁中...`);
    await sleep(3000);
    await e.reply(` 轰！天道法则崩解，万古时空震颤！`);
    await sleep(1000);
    
    // 大帝意志阵列
    const emperors = [
        { name: "太阳圣皇", desc: "扶桑神树，耀照九天", quote: "帝路茫茫，唯道可证", basePower: 7.5e8 },
        { name: "青帝", desc: "万古青天一株莲", quote: "天道无常，我道永恒", basePower: 8.2e8 },
        { name: "虚空大帝", desc: "虚空无垠，道化万古", quote: "虚空不灭，大道永存", basePower: 8.8e8 },
        { name: "斗战圣皇", desc: "战天斗地，不敬仙神", quote: "战无不胜，攻无不克", basePower: 9.0e8 },
        { name: "狠人大帝", desc: "一念花开，君临天下", quote: "不为成仙，只为在这红尘中等你归来", basePower: 9e8 },
        { name: "无始大帝", desc: "仙路尽头谁为峰，一见无始道成空", quote: "我道成时，天地俯首", basePower: 9.5e8 }

    ];
    

let battleCount = 0;

let battleSuccess = true;
let accumulatedPower = 0; // 积累的天地威能

for (const emperor of emperors) {
    battleCount++;
    
    // 创建大帝虚影（BB_player）
    const BB_player = createEmperorPlayer(
        emperor.name,
        battleCount,
        difficultyRate
    );
     player.当前血量 = player.血量上限;
    await Write_player(usr_qq, player); 
    // 战斗预告
    const prebattleMsg = [
        `第${battleCount}战：${emperor.name}意志降临！`,
        `「${emperor.desc}」`,
        `道音："${emperor.quote}"`,
        `气血：${bigNumberTransform(BB_player.当前血量)} | 攻击：${bigNumberTransform(BB_player.攻击)}`,
        eraBoost > 1 ? `【${eraName}加持】威能提升${(eraBoost-1)*100}%` : ""
    ];
    await e.reply(prebattleMsg.join("\n"));
    await sleep(5000);
    
   
// 修改后
const battleResult = await zd_battle(BB_player, player);
  // 更新玩家血量
        player.当前血量 = battleResult.A_hp;
       
        await ForwardMsg(e, battleResult.msg);
        
     // 处理战斗结果 - 结果解释调整
        if (battleResult.A_hp <= 0) {
            // 玩家战败
            battleSuccess = false;
            
            // 时代惩罚机制
            const penaltyFactor = costRate > 1.0 ? costRate : 1.0;
            const powerLoss = battleCount * emperor.basePower * penaltyFactor;
            const attackLoss = Math.round(powerLoss * 0.4);
            const defenseLoss = Math.round(powerLoss * 0.3);
            const hpLoss = Math.round(powerLoss * 0.3);
            
            player.攻击加成 -= attackLoss;
            player.防御加成 -= defenseLoss;
            player.生命加成 -= hpLoss;
            player.mijinglevel_id = Math.max(1, player.mijinglevel_id - battleCount);
            
            await Write_player(usr_qq, player);
            
            // 失败结局
            await e.reply([
                `${player.名号}败于${emperor.name}之手！`,
                `证道之路断绝！天道惩罚：`,
                `境界跌落：${player.mijinglevel_id}重天`,
                `攻击损失: ${bigNumberTransform(attackLoss)}`,
                `防御损失: ${bigNumberTransform(defenseLoss)}`,
                `生命损失: ${bigNumberTransform(hpLoss)}`,
                eraName !== "天命时代" ? `【${eraName}天罚】惩罚增强${(penaltyFactor-1)*100}%` : ""
            ].join('\n'));
            
            break; // 终止后续挑战
        } else if (battleResult.B_hp <= 0) {
            // 战胜大帝的奖励
            const powerReward = emperor.basePower * difficultyRate;
            const attackReward = Math.round(powerReward * 0.4);
            const defenseReward = Math.round(powerReward * 0.3);
            const hpReward = Math.round(powerReward * 0.3);
            
            player.攻击加成 += attackReward;
            player.防御加成 += defenseReward;
            player.生命加成 += hpReward;
            accumulatedPower += powerReward;
            
            await Write_player(usr_qq, player);
            
            await e.reply([
                `🏆 ${player.名号}战胜${emperor.name}意志！`,
                `攻击获得: ${bigNumberTransform(attackReward)}`,
                `防御获得: ${bigNumberTransform(defenseReward)}`,
                `生命获得: ${bigNumberTransform(hpReward)}`,
                difficultyRate < 1 ? `【${eraName}馈赠】奖励增强${(1/difficultyRate-1)*100}%` : ""
            ].join('\n'));
            
            if (battleCount < emperors.length) {
                await sleep(3000);
                await e.reply(`⏳ 准备迎战下一位古帝意志...`);
                await sleep(2000);
            }
        }
    }
    
    // 最终证道结果
    if (battleSuccess) {
        // 扣除资源
        player.修为 -= actual_need_exp;
        player.血气 -= actual_need_exp;
        player.mijinglevel_id = 16;
        
        // 生成帝号
        const titleComponents = emperors.map(e => e.name.charAt(0)).join('');
        const divineAppellation = getDivineAppellation();
        player.di_wei = "天帝";
        player.帝号 = `${titleComponents}${divineAppellation}天帝`;
        
        // 最终属性奖励
        const finalPowerBonus = Math.round(accumulatedPower * 2);
        player.攻击加成 += finalPowerBonus;
        player.防御加成 += finalPowerBonus;
        player.生命加成 += finalPowerBonus;
        
        // 新增：授予天心印记
        player.天心印记 = 1;
        
        await Write_player(usr_qq, player);
        // 证道成功结局
        await e.reply([
            `大道共鸣！诸天齐贺！`,
            `${player.名号}成功证道成帝！`,
            `诸天尊号：${player.帝号}`,
            `时代背景：${eraName}`,
            `资源消耗：${actual_need_exp.toLocaleString()} ${costModifier}`,
            `最终属性提升：${bigNumberTransform(finalPowerBonus)}`,
            `【天心印记】`,
            `天道认可，授予天心印记！`,
            `此时代唯你独尊，镇压万道！`,
        ].join("\n"));
    }
    
    return true;
}

// 新增：检查天心印记的方法
async checkHeavenHeartMark(currentQQ) {
    const playerFiles = fs.readdirSync(__PATH.player_path);
    const jsonFiles = playerFiles.filter(file => file.endsWith(".json"));
    
    for (const file of jsonFiles) {
        const qq = file.replace(".json", "");
        // 跳过当前玩家
        if (qq === currentQQ) continue;
        
        const player = await Read_player(qq);
        // 检查天心印记是否存在且大于0
        if (player.天心印记 && player.天心印记>0) {
            return true; // 存在其他大帝
        }
    }
    
    return false; // 没有其他大帝
}

    }
function createEmperorPlayer(emperorName, battleNumber, difficultyRate = 1) {
    // 创建B_player对象
    const B_player = {
        名号: `${emperorName}虚影`,
        当前血量: 100000000000, // 200亿血量
        攻击: 100000000000,     // 20亿攻击
        防御: 100000000000,   // 15亿防御
        学习的功法: [],
        灵根: { name: "普通灵根", type: "普通", 法球倍率: 1.0 },
        法球倍率: 1.0,
        血量上限: 100000000000,
        魔道值: 0,
        神石: 0,
        
        dongjie: false,
        mijinglevel_id: 16, // 大帝级.
    };
    
    // 根据大帝名字添加特性和功法
    switch (emperorName) {
        case "太阳圣皇":
            B_player.当前血量 = 40000000000; // 700亿
            B_player.攻击 = 40000000000;     // 20亿
            B_player.防御 = 50000000000;   // 75亿
            B_player.学习的功法.push("扶桑神树守护","太阳真火焚九天","太阳真经", "扶桑神术");
            B_player.灵根 = { name: "太阳神体", type: "特殊体质", "法球倍率": 1.5 };
            B_player.法球倍率 = 1;
            break;
            
        case "青帝":
            B_player.当前血量 = 40000000000; // 150亿
            B_player.攻击 = 30000000000;      // 20亿
            B_player.防御 = 60000000000;    // 75亿
            B_player.学习的功法.push("青莲万法不侵","妖帝九斩","混沌青莲开天", "混沌青莲法");
            B_player.灵根 = { name: "混沌青莲体", type: "特殊体质", "法球倍率": 1.5 };
            B_player.法球倍率 = 1;
            break;
            
        case "虚空大帝":
            B_player.当前血量 = 50000000000; // 700亿
            B_player.攻击 = 35000000000;     // 50亿
            B_player.防御 = 60000000000;   // 75亿
            B_player.学习的功法.push("虚空遁形","虚空经", "虚空永恒放逐","大虚空术");
            B_player.灵根 = { name: "虚空道体", type: "特殊体质", "法球倍率": 1.5 };
            B_player.法球倍率 = 1;
            break;
            
        case "斗战圣皇":
            B_player.当前血量 = 50000000000; // 700亿
            B_player.攻击 = 70000000000;     // 50亿
            B_player.防御 = 50000000000;   // 75亿（修正为7.5e9）
            B_player.学习的功法.push("斗战金身","斗战圣法·葬仙图", "九转天功","斗字秘");
            B_player.灵根 = { name: "斗战圣体", type: "特殊体质", "法球倍率": 3 };
            B_player.法球倍率 = 1;
            break;    

        case "无始大帝":
            B_player.当前血量 = 70000000000; // 700亿
            B_player.攻击 =70000000000;     // 50亿
            B_player.防御 = 70000000000; // 75亿（修正为7.5e9）
            B_player.学习的功法.push("无始钟护体","无始无终","无始经", "时光逆转");
            B_player.灵根 = { name: "先天圣体道胎", type: "特殊体质", "法球倍率": 2 };
            B_player.法球倍率 = 1;
            break;
            
        case "狠人大帝":
            B_player.当前血量 = 80000000000; // 700亿
            B_player.攻击 = 60000000000;     // 50亿
            B_player.防御 = 40000000000;  // 75亿（修正为7.5e9）
            B_player.学习的功法.push("不灭天功", "万化圣诀", "飞仙","一念花开，君临天下");
            B_player.灵根 = { name: "魔胎仙体", type: "特殊体质", "法球倍率": 2 };
            B_player.法球倍率 = 1;
            break;
    }
    
    // 根据战斗次数增强
  const multiplier = 1 + (battleNumber - 1) * 0.2 * difficultyRate;
    B_player.当前血量 = B_player.当前血量 * multiplier;
    B_player.攻击 =B_player.攻击 * multiplier;
    B_player.防御 =B_player.防御 * multiplier;
    B_player.血量上限 = B_player.当前血量; // 设置血量上限
    
    return B_player;
}
// 睡眠函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 辅助函数：获取神圣称谓
function getDivineAppellation() {
    const appellations = ["玄", "昊", "寰", "太初", "道衍", "星穹", "混元", "混沌"];
    return appellations[Math.floor(Math.random() * appellations.length)];
}
// 辅助函数：根据层级获取天资名称
function getAptitudeNameByLevel(level) {
    const aptitudeLevels = {
        8: "无演无尽",
        7: "万古无双",
        6: "绝世天骄",
        5: "旷世奇才",
        4: "天纵之资",
        3: "超凡资质",
        2: "平庸之资",
        1: "先天不足",
        0: "天弃之人"
    };
    return aptitudeLevels[level] || "未知天资";
}
/**
 * 推送消息，群消息推送群，或者推送私人
 * @param id
 * @param is_group
 * @returns {Promise<void>}
 */
async function pushInfo(id, is_group, msg) {
  if (is_group) {
    await Bot.pickGroup(id)
      .sendMsg(msg)
      .catch(err => {
        Bot.logger.mark(err);
      });
  } else {
    await common.relpyPrivate(id, msg);
  }
}


