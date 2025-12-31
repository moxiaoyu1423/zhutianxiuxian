// 木之本樱灵根进阶系统
// 基于《百变小樱》动画设定和修仙游戏框架

export class SakuraAdvancementSystem extends plugin {
  constructor() {
    super({
      name: '木之本樱灵根进阶系统',
      dsc: '基于百变小樱设定的灵根进阶系统',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#月之审判$',
          fnc: 'yueShenpan'
        },
        {
          reg: '^#梦之试炼$',
          fnc: 'mengShilian'
        },
        {
          reg: '^#小樱进阶$',
          fnc: 'sakuraAdvancement'
        },
        {
          reg: '^#收集库洛牌$',
          fnc: 'collectClowCard'
        }
      ]
    });
  }

// 库洛牌数据库（基于《百变小樱》原著设定完善）
// 包含动画版53张库洛牌：基础52张 + 剧场版1张「无」牌
clowCards = [
  // ==== 四大元素牌（核心卡牌） ====
  { id: 1, name: "风", english: "THE WINDY", type: "元素", power: 95, description: "四大元素之一，掌控风之力量", unlockCondition: "初始", symbol: "前进、充实、期待的暗示", appear: "动画第1话" },
  { id: 2, name: "水", english: "THE WATERY", type: "元素", power: 90, description: "四大元素之一，掌控水之力量", unlockCondition: "境界达到筑基", symbol: "协调性，打开他人心扉的力量", appear: "动画第3话" },
  { id: 3, name: "火", english: "THE FIREY", type: "元素", power: 92, description: "四大元素之一，掌控火焰力量", unlockCondition: "境界达到金丹", symbol: "强烈的信条信念，突破难关", appear: "动画第35话" },
  { id: 4, name: "地", english: "THE EARTHY", type: "元素", power: 91, description: "四大元素之一，掌控大地力量", unlockCondition: "境界达到元婴", symbol: "基础与稳定", appear: "动画第??话" },

  // ==== 光暗核心牌 ====
  { id: 5, name: "光", english: "THE LIGHT", type: "光明", power: 99, description: "可鲁贝洛斯支配的第一张牌，具有强烈光的魔法", unlockCondition: "通过月之审判", symbol: "由自己来主导对未来的展望", appear: "动画第42话" },
  { id: 6, name: "暗", english: "THE DARK", type: "黑暗", power: 99, description: "月支配的第一张牌，具有黑暗的魔法", unlockCondition: "通过月之审判", symbol: "照旧、顺着自然的发展前进", appear: "动画第42话" },

  // ==== 自然现象牌 ====
  { id: 7, name: "树", english: "THE WOOD", type: "自然", power: 85, description: "具有操控树木的魔法", unlockCondition: "初始", symbol: "象征各自的成长与发展", appear: "动画第4话" },
  { id: 8, name: "雨", english: "THE RAIN", type: "天气", power: 75, description: "具有降雨的魔法", unlockCondition: "收集3张牌后解锁", symbol: "最后终究会好转", appear: "动画第4话" },
  { id: 9, name: "雷", english: "THE THUNDER", type: "天气", power: 88, description: "具有操控雷电的魔法", unlockCondition: "魔法熟练度30", symbol: "若能不迷失自己，便能有幸运的发展", appear: "动画第8话" },
  { id: 10, name: "雾", english: "THE MIST", type: "天气", power: 72, description: "具有雾并有腐蚀性的魔法", unlockCondition: "探索特定地点", symbol: "判定事态，决定出方向", appear: "动画第14话" },
  { id: 11, name: "岚", english: "THE STORM", type: "天气", power: 84, description: "具有操控暴风雨的魔法", unlockCondition: "天气类牌收集", symbol: "激烈的感情，欲求不满的消解", appear: "动画第15话" },
  { id: 12, name: "雪", english: "THE SNOW", type: "天气", power: 73, description: "具有降雪的魔法", unlockCondition: "冬季事件触发", symbol: "纯净与转变", appear: "动画第??话" },
  { id: 13, name: "云", english: "THE CLOUD", type: "天气", power: 71, description: "具有操控云的魔法", unlockCondition: "天气类牌收集", symbol: "你的决断将造成决定性的结果", appear: "动画第39话" },

  // ==== 移动与空间牌 ====
  { id: 14, name: "翔", english: "THE FLY", type: "移动", power: 75, description: "在魔杖前端长出翅膀，可以在空中飞翔", unlockCondition: "初始", symbol: "挑战飞跃的机会", appear: "动画第1话" },
  { id: 15, name: "跳", english: "THE JUMP", type: "移动", power: 65, description: "在脚上长出小羽翼，具有高度跳跃的魔法", unlockCondition: "初始", symbol: "实力发挥、最佳状态", appear: "动画第5话" },
  { id: 16, name: "浮", english: "THE FLOAT", type: "移动", power: 68, description: "具有将人或物浮起的魔法，并可高速移动", unlockCondition: "移动类牌熟练", symbol: "由束缚中解放、自由", appear: "动画第15话" },
  { id: 17, name: "移", english: "THE MOVE", type: "空间", power: 80, description: "具有瞬间移动的魔法，但无法移动生物或大东西", unlockCondition: "空间类牌解锁", symbol: "幸运的预兆", appear: "动画第19话" },
  { id: 18, name: "消", english: "THE ERASE", type: "空间", power: 85, description: "具有将人或物消失的魔法", unlockCondition: "通过空间试炼", symbol: "运气的停滞，等一下的警告", appear: "动画第17话" },

  // ==== 战斗与防御牌 ====
  { id: 19, name: "剑", english: "THE SWORD", type: "武器", power: 82, description: "魔法杖的本身变成剑，威力取决于使用者心的魔法", unlockCondition: "通过初级试炼", symbol: "真实的探求、报偿，有时是破坏力", appear: "动画第9话" },
  { id: 20, name: "盾", english: "THE SHIELD", type: "防御", power: 80, description: "具有防御攻击的魔法", unlockCondition: "防御类任务", symbol: "保护，为了保持调和的防卫手段", appear: "动画第11话" },
  { id: 21, name: "斗", english: "THE FIGHT", type: "战斗", power: 81, description: "具有格斗技巧的魔法，威力取决于使用者心", unlockCondition: "战斗类牌熟练", symbol: "大转机的前兆", appear: "动画第20话" },
  { id: 22, name: "击", english: "THE SHOT", type: "攻击", power: 78, description: "具有射击力的魔法", unlockCondition: "精准度训练", symbol: "锁定目标", appear: "动画第28话" },
  { id: 23, name: "力", english: "THE POWER", type: "强化", power: 78, description: "具有强大力量的魔法", unlockCondition: "力量试炼", symbol: "愿望的实现、扩展", appear: "动画第13话" },
  { id: 24, name: "矢", english: "THE ARROW", type: "攻击", power: 77, description: "具有射箭的魔法", unlockCondition: "远程攻击训练", symbol: "能量的高涨、积极性", appear: "剧场版香港之旅" },

  // ==== 幻术与特殊能力牌 ====
  { id: 25, name: "影", english: "THE SHADOW", type: "幻影", power: 80, description: "具有操控自己以及别人的影子的魔法", unlockCondition: "幻术基础", symbol: "未知的部分，问题的发生与消除", appear: "动画第2话" },
  { id: 26, name: "幻", english: "THE ILLUSION", type: "幻术", power: 85, description: "具有让对手想出心中思念的事，并产生幻觉的魔法", unlockCondition: "幻术修炼", symbol: "想要从现实中逃离的欲望", appear: "动画第6话" },
  { id: 27, name: "镜", english: "THE MIRROR", type: "幻影", power: 88, description: "具有复制人或物的魔法，但也可以做一般的镜子", unlockCondition: "高级幻术", symbol: "深切看清自己的时期", appear: "动画第25话" },
  { id: 28, name: "梦", english: "THE DREAM", type: "梦境", power: 87, description: "可以做出预知梦", unlockCondition: "梦境试炼", symbol: "潜意识与直觉", appear: "动画提及" },
  { id: 29, name: "静", english: "THE SILENT", type: "辅助", power: 75, description: "具有消去四周声音的魔法", unlockCondition: "辅助类牌收集", symbol: "思虑深远、充电期", appear: "动画第7话" },
  { id: 30, name: "时", english: "THE TIME", type: "时间", power: 98, description: "具有操控时间的魔法，但只能操控一天", unlockCondition: "通过月之审判", symbol: "各种体验的磨练、自立", appear: "动画第12话" },
  { id: 31, name: "轮", english: "THE LOOP", type: "空间", power: 86, description: "具有将空间分割结合的魔法", unlockCondition: "空间掌握", symbol: "连结、更上一层楼的机会", appear: "动画第21话" },
  { id: 32, name: "眠", english: "THE SLEEP", type: "状态", power: 70, description: "具有将对手睡眠的魔法", unlockCondition: "状态类牌解锁", symbol: "休息、平稳的心境", appear: "动画第22话" },
  { id: 33, name: "歌", english: "THE SONG", type: "音律", power: 60, description: "具有模仿他人歌声的魔法", unlockCondition: "艺术类事件", symbol: "欢喜、调和、治疗的力量", appear: "动画第23话" },
  { id: 34, name: "迷", english: "THE MAZE", type: "空间", power: 82, description: "具有将空间变成巨大迷宫的魔法", unlockCondition: "空间迷宫试炼", symbol: "丧失自信、混乱", appear: "动画第26话" },
  { id: 35, name: "戾", english: "THE RETURN", type: "时间", power: 96, description: "具有返转时间的魔法", unlockCondition: "时间类牌精通", symbol: "败者复活，永不放弃", appear: "动画第27话" },

  // ==== 变化与创造牌 ====
  { id: 36, name: "花", english: "THE FLOWER", type: "自然", power: 60, description: "具有制造出各种花卉的魔法", unlockCondition: "自然类牌收集", symbol: "成果、报酬、目标达标率很高的时期", appear: "动画第10话" },
  { id: 37, name: "小", english: "THE LITTLE", type: "变化", power: 65, description: "具有将人或物缩小的魔法", unlockCondition: "变化类牌基础", symbol: "虽然小,却也是有意义的蜕变期", appear: "动画第24话" },
  { id: 38, name: "大", english: "THE BIG", type: "变化", power: 68, description: "具有将人或物放大的魔法", unlockCondition: "变化类牌进阶", symbol: "极大的可能性与能力,知识欲的提高", appear: "动画第31话" },
  { id: 39, name: "替", english: "THE CHANGE", type: "变化", power: 84, description: "具有同时将两人的心,身体交换的魔法", unlockCondition: "高级变化术", symbol: "心情的切换、浪费", appear: "动画第32话" },
  { id: 40, name: "双", english: "THE TWIN", type: "创造", power: 89, description: "具有将人或物变成两个的魔法", unlockCondition: "创造类牌解锁", symbol: "最佳搭挡的出现", appear: "动画第43话" },
  { id: 41, name: "创", english: "THE CREATE", type: "创造", power: 92, description: "具有将书写事物实体化的魔法（仅夜晚有效）", unlockCondition: "创造类牌精通", symbol: "创造与实现", appear: "动画提及" },
  { id: 42, name: "泡", english: "THE BUBBLES", type: "变化", power: 62, description: "可以形成泡沫，并有洗涤功能", unlockCondition: "生活类事件", symbol: "清洁与净化", appear: "动画提及" },
  { id: 43, name: "波", english: "THE WAVE", type: "能量", power: 74, description: "可以唤起水波或能量波澜", unlockCondition: "能量控制", symbol: "波动与传播", appear: "动画提及" },
  { id: 44, name: "砂", english: "THE SAND", type: "自然", power: 76, description: "可以控制沙子", unlockCondition: "自然类牌精通", symbol: "流动与变化", appear: "动画提及" },
  { id: 45, name: "甘", english: "THE SWEET", type: "变化", power: 58, description: "具有将食物变甜,并将物体变成甜食的魔法", unlockCondition: "生活类事件", symbol: "新恋情、受欢迎、依赖心的表现", appear: "动画第29话" },
  { id: 46, name: "冻", english: "THE FREEZE", type: "状态", power: 83, description: "具有将人或物结冻的魔法", unlockCondition: "状态类牌精通", symbol: "基础能力的成型,我行我素也OK", appear: "动画第33话" },
  { id: 47, name: "火", english: "THE FIRY", type: "元素", power: 92, description: "四大元素之一，可以操控火焰", unlockCondition: "元素平衡", symbol: "激情与能量", appear: "动画第35话" },

  // ==== 特殊功能牌 ====
  { id: 48, name: "灯", english: "THE GLOW", type: "光明", power: 55, description: "具有放出微弱光芒的魔法", unlockCondition: "光明类牌基础", symbol: "幸运的预兆", appear: "动画第18话" },
  { id: 49, name: "声", english: "THE VOICE", type: "音律", power: 75, description: "具有将声音盗走的魔法", unlockCondition: "音律类牌解锁", symbol: "想成为朋友,和睦相处的心情", appear: "动画第37话" },
  { id: 50, name: "锭", english: "THE LOCK", type: "封印", power: 66, description: "具有将房间锁上的魔法", unlockCondition: "封印术基础", symbol: "智能、英知。对真实、内心的察觉", appear: "动画第38话" },
  { id: 51, name: "秤", english: "THE LIBRA", type: "辅助", power: 79, description: "可以判断人说话的真伪", unlockCondition: "审判事件", symbol: "平衡与判断", appear: "动画提及" },
  { id: 52, name: "拔", english: "THE THROUGH", type: "空间", power: 81, description: "可以穿越墙壁，厚度与魔力相关", unlockCondition: "空间穿透试炼", symbol: "穿透与突破", appear: "动画提及" },

  // ==== 剧场版特殊牌 ====
  { id: 53, name: "无", english: "THE NOTHING", type: "特殊", power: 100, description: "剧场版中出现的最终牌，象征虚无", unlockCondition: "完成所有试炼", symbol: "虚无与潜能", appear: "剧场版2被封印的卡片" }
];

  /**
   * 主进阶函数 - 小樱进阶
   */
  async sakuraAdvancement(e) {
    if (!e.isGroup) {
      e.reply('请在群聊中使用此命令');
      return false;
    }

    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 检查玩家存在
    if (!await existplayer(usr_qq)) {
      e.reply('玩家不存在，请先创建角色');
      return false;
    }

    const player = await Read_player(usr_qq);
    const allMsgs = [];

    // 初始化库洛牌系统
    if (typeof player.库洛牌系统 === 'undefined') {
      player.库洛牌系统 = {
        已封印库洛牌: [],
        魔杖形态: "初始封印杖",
        魔法熟练度: 0,
        通过月之审判: false,
        通过梦之试炼: false,
        当前梦境进度: 0,
        月之审判次数: 0,
        总探索次数: 0
      };
    }

    // 根据当前灵根类型进行不同的进阶判断
    switch (player.灵根.type) {
      case "魔卡少女":
        return await this.advanceToStarStaff(e, player, usr_qq, allMsgs);
      case "魔卡少女·觉醒":
        return await this.advanceToDreamStaff(e, player, usr_qq, allMsgs);
      case "魔卡少女·完全":
        e.reply("你已经是完全体的梦之杖·木之本樱，达到了当前体系的巅峰！");
        return true;
      default:
        e.reply("当前灵根不属于木之本樱体系，无法使用此进阶系统");
        return false;
    }
  }

  /**
   * 进阶到星之杖形态
   */
  async advanceToStarStaff(e, player, usr_qq, allMsgs) {
    const requiredRealm = 9; // 仙台秘境大能
    const requiredCards = 10;
    
    // 检查境界条件
    if (player.mijinglevel_id < requiredRealm) {
      allMsgs.push(
        "星之杖进阶条件不足！",
        `需要满足以下所有条件：`,
        ``,
        `境界要求：仙台秘境大能以上（当前境界：${player.mijinlevel || '未知'}）`,
        `库洛牌数量：10张（当前${player.库洛牌系统.已封印库洛牌.length}张）`,
        `通过月之审判：未完成`,
        `魔法熟练度：50（当前${player.库洛牌系统.魔法熟练度}）`,
        ``,
        `首要任务：提升境界至仙台秘境大能`
      );
      return e.reply(allMsgs.join('\n'));
    }

    // 检查库洛牌数量
    if (player.库洛牌系统.已封印库洛牌.length < requiredCards) {
      allMsgs.push(
        "星之杖进阶条件不足！",
        `需要满足以下所有条件：`,
        ``,
        `境界要求：仙台秘境大能以上（已满足）`,
        `库洛牌数量：10张（当前${player.库洛牌系统.已封印库洛牌.length}张）`,
        `通过月之审判：未完成`,
        `魔法熟练度：50（当前${player.库洛牌系统.魔法熟练度}）`,
        ``,
        `请继续收集库洛牌，使用 #收集库洛牌 命令`
      );
      return e.reply(allMsgs.join('\n'));
    }

    // 检查魔法熟练度
    if (player.库洛牌系统.魔法熟练度 < 50) {
      allMsgs.push(
        "星之杖进阶条件不足！",
        `需要满足以下所有条件：`,
        ``,
        `境界要求：仙台秘境大能以上（已满足）`,
        `库洛牌数量：10张（当前${player.库洛牌系统.已封印库洛牌.length}张）`,
        `通过月之审判：未完成`,
        `魔法熟练度：50（当前${player.库洛牌系统.魔法熟练度}）`,
        ``,
        `请多使用库洛牌进行探索，提升魔法熟练度`
      );
      return e.reply(allMsgs.join('\n'));
    }

    // 触发月之审判
    if (!player.库洛牌系统.通过月之审判) {
      allMsgs.push("检测到进阶条件满足，自动触发月之审判...");
      e.reply(allMsgs.join('\n'));
      
      const trialResult = await this.yueShenpan(e, player);
      if (!trialResult.success) {
        return false;
      }
      // 更新玩家数据
      player.库洛牌系统.通过月之审判 = true;
    }

    // 正式进阶为星之杖形态
    player.灵根 = {
      "id": 7010015,
      "name": "星之杖·木之本樱",
      "type": "魔卡少女·觉醒",
      "归类": "诸天万界",
      "eff": 1.5,
      "法球倍率": 1,
      "攻击": 1.5,
      "防御": 1,
      "生命": 1,
      "生命本源": 50,
      "特殊能力": ["库洛牌转化", "星之杖魔法"]
    };

    player.库洛牌系统.魔杖形态 = "星之杖";
    player.修为 += 1000;
    player.魔法熟练度 += 100;

    await Write_player(usr_qq, player);

    const successMsg = [
      "星之杖觉醒！",
      "",
      "在月光照耀下，你的封印杖迸发出璀璨星光！",
      "库洛里多的声音在耳边回响：「你已成为库洛牌真正的主人」",
      "",
      "【星之杖·木之本樱 进阶成功】",
      "获得星之杖魔法加持，全属性提升",
      "解锁库洛牌转化能力，可将库洛牌转化为小樱牌",
      "魔法威力大幅增强，掌握更高级的魔法技能",
      "",
      `当前魔法熟练度：${player.库洛牌系统.魔法熟练度}`,
      `已收集库洛牌：${player.库洛牌系统.已封印库洛牌.length}/52张`
    ];

    e.reply(successMsg.join('\n'));
    return true;
  }

  /**
   * 进阶到梦之杖完全体
   */
  async advanceToDreamStaff(e, player, usr_qq, allMsgs) {
    const requiredRealm = 14; // 仙台秘境准帝
    const requiredCards = 52; // 所有库洛牌
    
    // 检查境界条件
    if (player.mijinglevel_id < requiredRealm) {
      allMsgs.push(
        "梦之杖进阶条件不足！",
        `需要满足以下所有条件：`,
        ``,
        `境界要求：仙台秘境准帝以上（当前境界：${player.mijinlevel || '未知'}）`,
        `库洛牌数量：52张（当前${player.库洛牌系统.已封印库洛牌.length}张）`,
        `通过梦之试炼：未完成`,
        `魔法熟练度：200（当前${player.库洛牌系统.魔法熟练度}）`,
        ``,
        `首要任务：提升境界至仙台秘境准帝`
      );
      return e.reply(allMsgs.join('\n'));
    }

    // 检查是否收集全部库洛牌
    if (player.库洛牌系统.已封印库洛牌.length < requiredCards) {
      allMsgs.push(
        " 梦之杖进阶条件不足！",
        `需要满足以下所有条件：`,
        ``,
        ` 境界要求：仙台秘境准帝以上（已满足）`,
        ` 库洛牌数量：52张（当前${player.库洛牌系统.已封印库洛牌.length}张）`,
        ` 通过梦之试炼：未完成`,
        ` 魔法熟练度：200（当前${player.库洛牌系统.魔法熟练度}）`,
        ``,
        ` 请收集全部52张库洛牌，包括光牌和暗牌`
      );
      return e.reply(allMsgs.join('\n'));
    }

    // 检查魔法熟练度
    if (player.库洛牌系统.魔法熟练度 < 200) {
      allMsgs.push(
        " 梦之杖进阶条件不足！",
        `需要满足以下所有条件：`,
        ``,
        ` 境界要求：仙台秘境准帝以上（已满足）`,
        ` 库洛牌数量：52张（当前${player.库洛牌系统.已封印库洛牌.length}张）`,
        ` 通过梦之试炼：未完成`,
        ` 魔法熟练度：200（当前${player.库洛牌系统.魔法熟练度}）`,
        ``,
        ` 请继续使用魔法，提升熟练度至200`
      );
      return e.reply(allMsgs.join('\n'));
    }

    // 触发梦之试炼
    if (!player.库洛牌系统.通过梦之试炼) {
      allMsgs.push(" 检测到进阶条件满足，自动触发梦之试炼...");
      e.reply(allMsgs.join('\n'));
      
      const dreamResult = await this.mengShilian(e, player);
      if (!dreamResult.success) {
        return false;
      }
      // 更新玩家数据
      player.库洛牌系统.通过梦之试炼 = true;
    }

    // 正式进阶为梦之杖完全体
    player.灵根 = {
      "id": 7010015,
      "name": "梦之杖·木之本樱", 
      "type": "魔卡少女·完全",
      "归类": "诸天万界",
      "eff": 2.5,
      "法球倍率": 2,
      "攻击": 5,
      "防御": 2,
      "生命": 2,
      "生命本源": 100,
      "特殊能力": ["透明卡牌创造", "梦境魔法", "时间操作"]
    };

    player.库洛牌系统.魔杖形态 = "梦之杖";
    player.修为 += 5000;
    player.魔法熟练度 += 300;
    player.生命本源 = 100 + player.灵根.生命本源;

    await Write_player(usr_qq, player);

    const successMsg = [
      " 梦之杖绽放！",
      "",
      " 在梦境与现实的交界处，星之杖进化为闪耀的梦之杖！",
      " 艾利欧的声音响起：「你已超越库洛里多，创造了属于自己的魔法」",
      "",
      " 【梦之杖·木之本樱 最终进阶成功】",
      " 获得梦境魔法能力，可创造透明卡牌",
      " 掌握时间操作等高级魔法",
      " 成为真正的魔法主宰，超越因果律限制",
      "",
      ` 当前魔法熟练度：${player.库洛牌系统.魔法熟练度}`,
      ` 已完成梦之试炼全部${player.库洛牌系统.当前梦境进度}个阶段`
    ];

    e.reply(successMsg.join('\n'));
    return true;
  }

  /**
   * 月之审判事件
   */
  async yueShenpan(e, player) {
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const allMsgs = [];
    
    // 审判前提条件检查
    if (player.库洛牌系统.已封印库洛牌.length < 10) {
      return {
        success: false,
        message: " 月之审判条件不足！\n需要至少封印10张库洛牌才能挑战审判者月。"
      };
    }
    
    if (player.mijinglevel_id < 9) {
      return {
        success: false, 
        message: ` 境界不足！\n需要通过月之审判，需达到「仙台秘境大能」境界。`
      };
    }
    
    allMsgs.push("【月之审判开启】");
    allMsgs.push("审判者月从月光中显现，银发如瀑，目光清冷：");
    allMsgs.push("「库洛牌是一人收集的，那最后的审判就没有意思了！」");
    
    // 审判难度计算
    const difficulty = Math.min(1, player.库洛牌系统.月之审判次数 * 0.1 + 0.5);
    const successRate = 0.3 + (player.库洛牌系统.魔法熟练度 / 100) * 0.5;
    
    // 审判过程
    if (Math.random() < successRate) {
      // 审判成功 - 参考动画中小樱用风牌获胜
      player.库洛牌系统.通过月之审判 = true;
      player.库洛牌系统.魔法熟练度 += 30;
      player.修为 += 500;
      
      allMsgs.push(" 你面对月的攻击，想起雪兔哥的温柔，始终不忍心下重手...");
      allMsgs.push("「树牌！」你尝试束缚月，却被月反射回来！");
      allMsgs.push("就在被紧紧束缚时，你感受到内心「星」的力量觉醒！");
      allMsgs.push("星之杖绽放光芒！你用「风牌」温柔地包裹住月！");
      allMsgs.push("月宣布：「你已成为库洛牌的新主人，不是因为力量，而是因为你的心！」");
      
      await Write_player(usr_qq, player);
      
      return {
        success: true,
        message: allMsgs.join('\n')
      };
    } else {
      // 审判失败
      player.库洛牌系统.月之审判次数 += 1;
      const forgetPenalty = Math.floor(player.修为 * 0.1);
      player.修为 -= forgetPenalty;
      
      allMsgs.push(" 审判失败！月的力量太过强大...");
      allMsgs.push("你感受到心中重要的感情正在模糊，这是「遗忘」的代价！");
      allMsgs.push(`修为减少${forgetPenalty}点，请积累更多库洛牌后再来挑战！`);
      
      await Write_player(usr_qq, player);
      
      return {
        success: false,
        message: allMsgs.join('\n')
      };
    }
  }

  /**
   * 梦之试炼事件
   */
  async mengShilian(e, player) {
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const allMsgs = [];
    
    // 试炼前提条件
    if (!player.库洛牌系统.通过月之审判) {
      return {
        success: false,
        message: " 需先通过月之审判，才能进入梦之试炼！"
      };
    }
    
    if (player.库洛牌系统.已封印库洛牌.length < 52) {
      return {
        success: false,
        message: " 需收集全部52张库洛牌，才能开启最终试炼！"
      };
    }
    
    allMsgs.push("【梦之试炼开启】");
    allMsgs.push("你陷入深层梦境，透明卡牌在四周飞舞...");
    
    // 梦境进度推进
    player.库洛牌系统.当前梦境进度 += 1;
    const progress = player.库洛牌系统.当前梦境进度;
    
    // 不同进度的梦境事件
    const dreamEvents = [
      {
        trigger: progress === 1,
        message: [
          "第一重梦境：你回到友枝小学，但所有人都变成了卡牌！",
          "使用「镜牌」看破幻觉，找到真实的知世！"
        ],
        requirement: "镜牌",
        successBonus: { 因果律领悟: 1 }
      },
      {
        trigger: progress === 2, 
        message: [
          "第二重梦境：库洛里多的幻影出现，质问你的决心！",
          "展现你与卡牌的羁绊，获得库洛的认可！"
        ],
        requirement: "所有基础库洛牌",
        successBonus: { 时间线干涉: 1 }
      },
      {
        trigger: progress >= 3,
        message: [
          "最终梦境：透明卡牌环绕，你需要创造属于自己的新卡牌！",
          "集中精神，将希望和梦想注入空白卡牌中！"
        ],
        requirement: "魔法熟练度100+",
        successBonus: { 魔杖形态: "梦之杖" }
      }
    ];
    
    const currentEvent = dreamEvents.find(event => event.trigger) || dreamEvents[2];
    allMsgs.push(...currentEvent.message);
    
    // 检查是否满足要求
    let requirementMet = false;
    if (currentEvent.requirement === "镜牌") {
      requirementMet = player.库洛牌系统.已封印库洛牌.includes("镜");
    } else if (currentEvent.requirement === "所有基础库洛牌") {
      requirementMet = player.库洛牌系统.已封印库洛牌.length >= 52;
    } else {
      requirementMet = player.库洛牌系统.魔法熟练度 >= 100;
    }
    
    if (requirementMet) {
      // 试炼成功
      if (progress >= 3) {
        player.库洛牌系统.通过梦之试炼 = true;
        allMsgs.push(" 梦之试炼完成！梦之杖绽放！");
        allMsgs.push("你成功创造了属于自己的透明卡牌，成为真正的卡牌主宰！");
      }
      
      player.库洛牌系统.魔法熟练度 += 50;
      await Write_player(usr_qq, player);
      
      return {
        success: progress >= 3,
        message: allMsgs.join('\n')
      };
    } else {
      allMsgs.push(` 试炼暂停！需要满足条件：${currentEvent.requirement}`);
      allMsgs.push("在梦境中继续探索，下次将会继续...");
      
      await Write_player(usr_qq, player);
      
      return {
        success: false,
        message: allMsgs.join('\n')
      };
    }
  }

  /**
   * 收集库洛牌功能
   */
  async collectClowCard(e) {
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    if (!await existplayer(usr_qq)) {
      e.reply('玩家不存在，请先创建角色');
      return false;
    }

    const player = await Read_player(usr_qq);
    
    // 初始化库洛牌系统
    if (typeof player.库洛牌系统 === 'undefined') {
      player.库洛牌系统 = {
        已封印库洛牌: [],
        魔杖形态: "初始封印杖",
        魔法熟练度: 0,
        通过月之审判: false,
        通过梦之试炼: false,
        当前梦境进度: 0,
        月之审判次数: 0,
        总探索次数: 0
      };
    }

    // 随机获得一张库洛牌
    const availableCards = this.clowCards.filter(card => 
      !player.库洛牌系统.已封印库洛牌.includes(card.name)
    );
    
    if (availableCards.length === 0) {
      e.reply(" 恭喜！你已经收集了全部52张库洛牌！");
      return true;
    }

    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    player.库洛牌系统.已封印库洛牌.push(randomCard.name);
    player.库洛牌系统.魔法熟练度 += 5;
    player.库洛牌系统.总探索次数 += 1;

    await Write_player(usr_qq, player);

    const message = [
      " 库洛牌收集成功！",
      ` 获得库洛牌：「${randomCard.name}」`,
      ` 类型：${randomCard.type} | 威力：${randomCard.power}`,
      ` 描述：${randomCard.description}`,
      "",
      ` 当前进度：${player.库洛牌系统.已封印库洛牌.length}/52张`,
      ` 魔法熟练度：${player.库洛牌系统.魔法熟练度}`,
      "",
      " 使用 #小樱进阶 查看进阶条件"
    ];

    e.reply(message.join('\n'));
    return true;
  }
}