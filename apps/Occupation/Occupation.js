import { plugin, puppeteer, verc, data, Show } from '../../api/api.js';
import fs from 'fs';
import {
  existplayer,
  Write_player,
  isNotNull,
   Write_equipment,
  exist_najie_thing,
  Add_najie_thing,
  Add_职业经验,
  Add_灵石,
  Read_equipment,
  sleep,
  ForwardMsg,
  convert2integer,
  Go,
  zd_battle,
  get_danfang_img,
  get_tuzhi_img,
  get_zhizuo_img,
  get_log_img,
  bigNumberTransform,
  channel
} from '../../model/xiuxian.js';
import { Read_player, __PATH, Read_danyao } from '../../model/xiuxian.js';

// 材料稀有度
const MATERIAL_RARITY = {
   "大罗银精": 9,
   "仙泪绿金": 9,
    "凰血赤金": 9,
    "龙纹黑金": 9,
    "永恒蓝金": 9,
    "神痕紫金": 9,
    "道劫黄金": 9,
    "羽化青金": 9,
    "混沌石精": 9,
    "九彩神金": 12,
    "万物母气": 10,
};

   // 九大仙金列表
let IMMORTAL_GOLDS = [
    "仙泪绿金", "凰血赤金", "龙纹黑金", "永恒蓝金", 
    "神痕紫金", "道劫黄金", "羽化青金", "混沌石精", 
    "大罗银精"
];



// 帝兵形态选项
const WEAPON_FORMS = ["剑", "刀", "枪", "戟", "斧", "钟", "鼎", "塔", "镜", "印", "炉", "伞", "琴", "扇", "鞭"];
export class Occupation extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_Occupation',
      dsc: '修仙模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#转职.*$',
          fnc: 'chose_occupation',
        },
        {
          reg: '^#转换副职$',
          fnc: 'chose_occupation2',
        },
        {
          reg: '^#猎户转.*$',
          fnc: 'zhuanzhi',
        },
        {
          reg: '(^#采药$)|(^#采药(.*)(分|分钟)$)',
          fnc: 'plant',
        },
        {
          reg: '^#结束采药$',
          fnc: 'plant_back',
        },
        {
          reg: '(^#采矿$)|(^#采矿(.*)(分|分钟)$)',
          fnc: 'mine',
        },
        {
          reg: '^#结束采矿$',
          fnc: 'mine_back',
        },
        {
          reg: '^#丹药配方$',
          fnc: 'show_danfang',
        },
        {
          reg: '^#符道配方$',
          fnc: 'show_zhizuo',
        },
        {
          reg: '^#我的药效$',
          fnc: 'yaoxiao',
        },
        {
          reg: '^#装备图纸$',
          fnc: 'show_tuzhi',
        },
        {
          reg: '^#炼制.*(\\*[0-9]*)?$',
          fnc: 'liandan',
        },
          {
          reg: '^#制作.*(\\*[0-9]*)?$',
          fnc: 'zhizuo_fu',
        },
        {
          reg: '^#打造.*(\\*[0-9]*)?$',
          fnc: 'lianqi',
        },
        {
          reg: '^#悬赏目标$',
          fnc: 'search_sb',
        },
        {
          reg: '^#讨伐目标.*$',
          fnc: 'taofa_sb',
        },
        {
          reg: '^#悬赏.*$',
          fnc: 'xuanshang_sb',
        },
        {
          reg: '^#赏金榜$',
          fnc: 'shangjingbang',
        },
        {
          reg: '^#刺杀目标.*$',
          fnc: 'cisha_sb',
        },
        {
          reg: '^#清空赏金榜$',
          fnc: 'qingchushangjinbang',
        },
         {
                    reg: '(^#狩猎$)|(^#狩猎(.*)(分|分钟)$)',
                    fnc: 'shoulie'
                },
                {
                    reg: '^#结束狩猎$',
                    fnc: 'shoulie_back'
                },
                {
                    reg: '^#村庄列表$',
                    fnc: 'search_cz'
                 },
                 {
                     reg: '^#劫掠村庄.*$',
                     fnc: 'taofa_cz'
                 },
                   {
                    reg: '(^#寻源$)|(^#寻源(.*)(分|分钟)$)',
                    fnc: 'xunyuan'
                },
                {
                    reg: '^#结束寻源$',
                    fnc: 'xunyuan_back'
                },
                {
                    reg: '(^#寻脉定源$)|(^#寻脉定源(.*)(分|分钟)$)',
                    fnc: 'xunyuan2'
                },
                {
                    reg: '^#结束寻脉定源$',
                    fnc: 'xunyuan2_back'
                },
                                {
                    reg: '(^#地脉引气$)|(^#地脉引气(.*)(分|分钟)$)',
                    fnc: 'xunyuan3'
                },
                {
                    reg: '^#结束地脉引气$',
                    fnc: 'xunyuan3_back'
                },
                {
    reg: '^#禁仙六封$',
    fnc: 'forbiddenImmortalSixSeals'
},
{
    reg: '^#解除禁仙六封$',
    fnc: 'releaseForbiddenSeal'
},
                {
    reg: '^#以(.*)炼制帝兵(.*)$',
    fnc: 'forgeEmperorWeapon'
},
{
    reg: '^#以(.*)融合帝兵$',
    fnc: 'fuseEmperorWeapon'
},
{
    reg: '^#以雷劫洗礼帝兵$',
    fnc: 'upgradeEmperorWeapon'
},
{
  reg: '^#为帝兵更名\\s*(.*)$',
  fnc: 'renameEmperorWeapon'
},
                  {
                    reg: '^#蕴养帝兵$',
                    fnc: 'nurtureEmperorWeapon'
                 },                  {
                    reg: '^#刻写帝兵$',
                    fnc: 'engraveEmperorWeapon'
                 },
                  {
                    reg: '^#查看恶人$',
                    fnc: 'chakanhuaidan'
                 },
                 {
                     reg: '^#消灭恶人.*$',
                     fnc: 'taofahuaidan'
                 }
      ],
    });
  }
async  forbiddenImmortalSixSeals(e) {
    if (!e.isGroup) {
        e.reply('请在群聊中施展禁仙六封');
        return true;
    }

    // 检查是否有艾特信息
    const atItems = e.message.filter(item => item.type === "at");
    if (atItems.length === 0) {
        e.reply('请艾特需要封印的修士');
        return true;
    }

    const casterQQ = e.user_id; // 施法者QQ
    const targetQQ = atItems[0].qq; // 被封印者QQ
    
    // 读取施法者数据
    const caster = await Read_player(casterQQ);
    
    // 检查施法者是否为源天师
    if (caster.occupation !== "源天师") {
        return e.reply([
            '「源术造诣不足！」',
            '禁仙六封乃源天师一脉至高秘术',
            `你当前职业：${caster.occupation || "未就职"}`,
            '需成为源天师方可施展此无上源术'
        ].join('\n'));
    }
    
    // 检查源石是否足够
    const requiredSourceStones = 1000000; // 100万源石
    if (caster.源石 < requiredSourceStones) {
        return e.reply([
            '「源石不足！」',
            `施展禁仙六封需消耗${bigNumberTransform(requiredSourceStones)}源石`,
            `你当前源石：${bigNumberTransform(caster.源石)}`,
            '请前往源矿采集或交易获取源石'
        ].join('\n'));
    }
    

    // 读取被封印者数据
    if (!await existplayer(targetQQ)) {
        return e.reply('目标修士不存在');
    }
    const target = await Read_player(targetQQ);
    
// 检查是否已被封印 - 通过Redis action状态检查
const targetAction = await redis.get(`xiuxian:player:${targetQQ}:action`);
      const actionData = JSON.parse(targetAction);
    if (targetAction != null) {

      let now_time = new Date().getTime();
      //人物任务的动作是否结束
      let targetAction_end_time = targetAction.end_time;
      if (now_time <= targetAction_end_time) {
        let m = parseInt((targetAction_end_time - now_time) / 1000 / 60);
        let s = parseInt((targetAction_end_time - now_time - m * 60 * 1000) / 1000);
        e.reply(
          '正在' + targetAction.action + '中,剩余时间:' + m + '分' + s + '秒'
        );
        return false;
      }
    }
if (targetAction) {
    const actionData = JSON.parse(targetAction);
    if (actionData.action === '神源封印') {
        return e.reply([
            `「${target.名号}」已被禁仙六封封印！`,
            `封印时间：${target.封印时间 || "未知"}`,
            `解封时间：待黄金大世开启`
        ].join('\n'));
    }
}
        let 目标秘境体系 = data.Levelmijing_list.find(item => item.level_id == target.mijinglevel_id);
        let 自身秘境体系 = data.Levelmijing_list.find(item => item.level_id == caster.mijinglevel_id);
    let 目标仙古今世法 = data.xiangujinshi_list.find(item => item.level_id == target.xiangulevel_id);
    let 自身仙古今世法 = data.xiangujinshi_list.find(item => item.level_id == caster.xiangulevel_id);
    // 检查目标境界是否过高
    if (target.mijinglevel_id > caster.mijinglevel_id + 2&&target.xiangulevel_id > caster.xiangulevel_id + 2) {
        return e.reply([
            '「源术反噬！」',
            `${target.名号}境界过高，无法封印`,
            `施法者境界：`,
            `秘境体系：${自身秘境体系}，仙古今世法：${自身仙古今世法}`,
            `目标境界：`,
            `秘境体系：${目标秘境体系}，仙古今世法：${目标仙古今世法}`,
        ].join('\n'));
    }
    
    // === 施展禁仙六封 ===
    
    // 扣除源石
    caster.源石 -= requiredSourceStones;
    
    // 更新施法者数据
    caster.禁仙六封使用次数 = (caster.禁仙六封使用次数 || 0) + 1;
    caster.最后使用时间 = new Date().toLocaleString();
    
    // 更新目标数据
    target.封印状态 = "禁仙六封";
    target.封印时间 = new Date().toLocaleString();
    target.封印者 = caster.名号;
    target.封印者ID = casterQQ;
    target.解封条件 = "待黄金大世开启";
    
    // === 添加神源封印状态 ===
    const sealState = {
        action: '神源封印',
        end_time: Date.now() + 99999 * 60000, // 99999分钟（近乎永久）
        time: 99999 * 60000,
        shutup: '1', // 禁止发言
        working: '1', // 禁止工作
        Place_action: '1', // 禁止场景行动
        Place_actionplus: '1', // 禁止高级行动
        power_up: '1', // 禁止提升修为
        mojie: '1', // 禁止魔界行动
        xijie: '1', // 禁止仙界行动
        plant: '1', // 禁止种植
        mine: '1', // 禁止采矿
        jieyin: '1' // 特殊标记：神源封印
    };
    
    // 保存封印状态到Redis
    await redis.set(`xiuxian:player:${targetQQ}:action`, JSON.stringify(sealState));
    
    // 保存玩家数据
    await Write_player(casterQQ, caster);
    await Write_player(targetQQ, target);
    
    // === 生成遮天风格文案 ===
    const sealText = [
        `【禁仙六封·神源永镇】`,
        `${caster.名号}双眸绽放源天神光，手掐无上源诀！`,
        `「源天师一脉，禁仙六封！」`,
        `天地间源气沸腾，化作六道神链贯穿虚空！`,
        ``,
        `${target.名号}周身空间凝固，大道符文湮灭！`,
        `神源之气自九幽涌出，化作不朽晶体！`,
        `「以吾之名，封汝于此，待黄金大世重临！」`,
        ``,
        `六道神则锁链缠绕，${target.名号}被永恒封入神源！`,
        `神源晶体沉入大地深处，等待下一个黄金大世开启...`,
        ``,
        `施法者：${caster.名号}（源天师）`,
        `消耗：${bigNumberTransform(requiredSourceStones)}源石`,
        `封印状态：神源封印（99999分钟）`,
        `解封条件：黄金大世开启或源天师解封`
    ].join('\n');
    
    e.reply(sealText);
    return true;
}
async  releaseForbiddenSeal(e) {
    if (!e.isGroup) {
        e.reply('请在群聊中解除禁仙六封');
        return true;
    }

    // 检查是否有艾特信息
    const atItems = e.message.filter(item => item.type === "at");
    if (atItems.length === 0) {
        e.reply('请艾特需要解封的修士');
        return true;
    }

    const casterQQ = e.user_id; // 解封者QQ
    const targetQQ = atItems[0].qq; // 被解封者QQ
    
    // 读取解封者数据
    const caster = await Read_player(casterQQ);
    
    // 检查解封者是否为源天师
    if (caster.occupation !== "源天师") {
        return e.reply([
            '「源术造诣不足！」',
            '解除禁仙六封需源天师境界',
            `你当前职业：${caster.occupation || "未就职"}`,
            '唯有源天师可解此无上源术'
        ].join('\n'));
    }
    
    // 读取被解封者数据
    if (!await existplayer(targetQQ)) {
        return e.reply('目标修士不存在');
    }
    const target = await Read_player(targetQQ);
    
    // 检查是否被禁仙六封封印
    if (target.封印状态 !== "禁仙六封") {
        return e.reply([
            `「${target.名号}」未被禁仙六封封印！`,
            `当前状态：${target.封印状态 || "正常"}`
        ].join('\n'));
    }
    
    // 检查解封者是否为原封印者或更高境界
    if (casterQQ !== target.封印者ID && caster.mijinglevel_id <= target.mijinglevel_id) {
        return e.reply([
            '「源术反噬！」',
            `你非原封印者，且境界不足`,
            `原封印者：${target.封印者}`,
            `目标境界：${target.境界}`,
            `你当前境界：${caster.境界}`
        ].join('\n'));
    }
    
    // === 解除封印 ===
    
    // 更新目标数据
    target.封印状态 = null;
    target.解封时间 = new Date().toLocaleString();
    target.解封者 = caster.名号;
    
    // 移除Redis中的封印状态
    await redis.del(`xiuxian:player:${targetQQ}:action`);
    
    // 保存玩家数据
    await Write_player(targetQQ, target);
    
    // === 生成解封文案 ===
    const releaseText = [
        `【源天解封·神源破茧】`,
        `${caster.名号}手掐源天解封诀，引动天地源气！`,
        `「源天师一脉，六封皆解！」`,
        `大地震动，神源晶体自九幽升起！`,
        ``,
        `六道神则锁链寸寸断裂，神源晶体绽放无量光！`,
        `${target.名号}破源而出，气息更胜往昔！`,
        `「黄金大世已至，当重临世间！」`,
        ``,
        `解封者：${caster.名号}（源天师）`,
        `解封时间：${new Date().toLocaleString()}`,
        `被封印时长：${calculateSealDuration(target.封印时间)}`
    ].join('\n');
    
    e.reply(releaseText);
    return true;
}


async nurtureEmperorWeapon(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    // 检查玩家是否存在
    if (!await existplayer(usr_qq)) {
        e.reply("请先创建修仙角色");
        return true;
    }
    
    // 获取玩家数据
    const player = await Read_player(usr_qq);
    const equipment = await Read_equipment(usr_qq);
    
    // 检查是否有帝兵
    if (!equipment.帝兵 || equipment.帝兵.author_name !== player.id) {
        return e.reply("这并非你的本命帝兵，无法蕴养");
    }
    
    const weapon = equipment.帝兵;
    
    //
    const hasBingziMi = player.学习的功法?.includes("兵字秘");
    const currentNurtureLimit = hasBingziMi ? 25 : 5;
    
    // 修改检查逻辑：使用实时计算的上限值
    if (weapon.蕴养 && weapon.蕴养 >= currentNurtureLimit) {
        return e.reply([
            `帝兵蕴养已达上限！`,
            `当前蕴养次数：${weapon.蕴养}/${currentNurtureLimit}`,
            `无法继续蕴养`
        ].join("\n"));
    }
    
    // 计算消耗
    const costCultivation = 20000000000; // 20e修为
    const costBlood = 20000000000; // 20e血气
    const costLifeEssence = 50; // 50点生命本源
    
    // 检查资源是否足够
    if (player.修为 < costCultivation || player.血气 < costBlood || player.生命本源 < costLifeEssence) {
        const messages = [
            `资源不足！`,
            `蕴养消耗：`,
            `修为：${bigNumberTransform(costCultivation)}`,
            `血气：${bigNumberTransform(costBlood)}`,
            `生命本源：${costLifeEssence}`,
            `当前资源：`,
            `修为：${bigNumberTransform(player.修为)}`,
            `血气：${bigNumberTransform(player.血气)}`,
            `生命本源：${player.生命本源}`
        ];
        
        if (player.修为 < costCultivation) {
            messages.push(`修为不足：${bigNumberTransform(costCultivation - player.修为)}`);
        }
        
        if (player.血气 < costBlood) {
            messages.push(`血气不足：${bigNumberTransform(costBlood - player.血气)}`);
        }
        
        if (player.生命本源 < costLifeEssence) {
            messages.push(`生命本源不足：${costLifeEssence - player.生命本源}`);
        }
        
        return e.reply(messages.join("\n"));
    }
    
    // 扣除消耗
    player.修为 -= costCultivation;
    player.血气 -= costBlood;
    player.生命本源 -= costLifeEssence;
    
    // 更新蕴养次数
    if (!weapon.蕴养) weapon.蕴养 = 0;
    weapon.蕴养++;
    
    // 🛠️ 【核心修改点】更新帝兵的蕴养上限为当前实时计算的值
    weapon.蕴养上限 = currentNurtureLimit;
    
    // 提升帝兵属性
    const baseBoost = 5000000000; // 5e
    weapon.atk += baseBoost;
    weapon.def += baseBoost;
    weapon.HP += baseBoost;
    weapon.全属性 += 1;
    
    // 特殊效果：达到上限时额外加成
    if (weapon.蕴养 === weapon.蕴养上限) {
        weapon.全属性 += hasBingziMi ? 25 : 5;
        
        // 兵字秘额外加成
        if (hasBingziMi) {
            weapon.bao += 0.1; // 暴击率增加10%
        }
    }
    
    // 保存数据
    equipment.帝兵 = weapon;
    await Write_equipment(usr_qq, equipment);
    await Write_player(usr_qq, player);
    
    // 构建回复消息
    const weaponForm = weapon.name.match(/剑|鼎|枪|钟|塔|镜|印|刀|斧|戟|鞭|琴|扇/)?.[0] || "帝兵";
    
    let successMsg = [
        `【帝兵蕴养成功】`,
        `以自身生命本源温养帝兵，大道共鸣！`,
        `${weaponForm}形帝兵「${weapon.name}」得生命本源滋养，威能大增！`,
        `属性提升：`,
        `攻击：+${bigNumberTransform(baseBoost)}`,
        `防御：+${bigNumberTransform(baseBoost)}`,
        `气血：+${bigNumberTransform(baseBoost)}`,
        `全属性：+1`,
        `当前蕴养次数：${weapon.蕴养}/${weapon.蕴养上限}`
    ];
    
    // 达到上限的特殊消息
    if (weapon.蕴养 === weapon.蕴养上限) {
        successMsg.push(
            ``,
            `【帝兵蕴养圆满】`,
            `帝兵与主人心意相通，达到完美蕴养状态！`,
            `全属性额外增加：${hasBingziMi ? "+25" : "+5"}`
        );
        
        if (hasBingziMi) {
            successMsg.push(
                `兵字秘效果触发，帝兵与主人心意相通！`,
                `暴击率增加：10%`
            );
        }
    }
    
    // 兵字秘上限提示
    if (hasBingziMi) {
        successMsg.push(
            ``,
            `「兵字秘」效果：蕴养上限提升至25次`
        );
    }
    
    e.reply(successMsg.join("\n"));
    return true;
}
  async  engraveEmperorWeapon(e) {
    if (!e.isGroup) {
        e.reply('请在群聊中刻写帝兵');
        return true;
    }

    const usr_qq = e.user_id.toString().replace('qg_', '');
    const player = await Read_player(usr_qq);
    const equipment = await Read_equipment(usr_qq);
    
    // 检查玩家是否已创自身之道
    if (!player.已创自身之道) {
        return e.reply([
            `你尚未开创自身之道！`,
            `需先使用 #创造自身之道 开创专属大道`,
            `方能将其刻写入帝兵`
        ].join('\n'));
    }
    
    // 检查是否有帝兵
    if (!equipment.帝兵 || equipment.帝兵.author_name !== player.id) {
        return e.reply("这并非你的本命帝兵，无法刻写");
    }
    
    const weapon = equipment.帝兵;
    
    // 检查帝兵品阶是否达到要求
    if (weapon.品阶 !== "圣兵") {
        return e.reply([
            `帝兵品阶不足！`,
            `当前品阶：${weapon.品阶}`,
            `需要品阶：圣兵`,
            `请先使用 #以雷劫洗礼帝兵 将帝兵提升至圣兵品阶`
        ].join('\n'));
    }
    
    // 检查是否已刻写过
    if (weapon.刻写之道) {
        return e.reply([
            `帝兵已刻写道法！`,
            `「${weapon.name}」已刻写：${weapon.刻写之道}`,
            `无法再次刻写`
        ].join('\n'));
    }
    
    // 检查玩家境界是否足够
    if (player.mijinglevel_id < 13) { // 大帝境界
        return e.reply([
            `境界不足！`,
            `刻写道法需要达到圣人王境界`,
            `当前境界：${player.mijinglevel_id}`,
            `请先提升境界`
        ].join('\n'));
    }
    
    // 获取玩家自身之道
    const playerWay = {
        name: player.自身之道名称,
        type: player.自身之道类型
    };
    
    // 计算消耗
    const costCultivation = 1e10; // 100亿修为
    const costBlood = 1e10; // 100亿血气
    const costLifeEssence = 100; // 100点生命本源
    
    // 检查资源是否足够
    if (player.修为 < costCultivation || player.血气 < costBlood || player.生命本源 < costLifeEssence) {
        const messages = [
            `资源不足！`,
            `刻写消耗：`,
            `修为：${bigNumberTransform(costCultivation)}`,
            `血气：${bigNumberTransform(costBlood)}`,
            `生命本源：${costLifeEssence}`,
            `当前资源：`,
            `修为：${bigNumberTransform(player.修为)}`,
            `血气：${bigNumberTransform(player.血气)}`,
            `生命本源：${player.生命本源}`
        ];
        
        if (player.修为 < costCultivation) {
            messages.push(`修为不足：${bigNumberTransform(costCultivation - player.修为)}`);
        }
        
        if (player.血气 < costBlood) {
            messages.push(`血气不足：${bigNumberTransform(costBlood - player.血气)}`);
        }
        
        if (player.生命本源 < costLifeEssence) {
            messages.push(`生命本源不足：${costLifeEssence - player.生命本源}`);
        }
        
        return e.reply(messages.join("\n"));
    }
    
    // 扣除消耗
    player.修为 -= costCultivation;
    player.血气 -= costBlood;
    player.生命本源 -= costLifeEssence;
    
    // 刻写道法
    weapon.刻写之道 = playerWay.name;
    weapon.道法类型 = playerWay.type;
    weapon.全属性 += 5;
    
    // 根据道法类型添加特殊效果
    switch (playerWay.type) {
        case '攻伐':
            weapon.atk *= 1.5; // 攻击提升50%
            weapon.bao += 0.1; // 暴击率+10%
            break;
        case '护体':
            weapon.def *= 1.5; // 防御提升50%
             weapon.bao += 0.1; // 暴击率+10%
            break;
        case '涅槃':
            weapon.HP *= 1.5; // 生命提升50%
             weapon.bao += 0.1; // 暴击率+10%
            break;
    }
    
    // 保存数据
    equipment.帝兵 = weapon;
    await Write_equipment(usr_qq, equipment);
    await Write_player(usr_qq, player);
    
    // 构建回复消息
    const weaponForm = weapon.name.match(/剑|鼎|枪|钟|塔|镜|印|刀|斧|戟|鞭|琴|扇/)?.[0] || "帝兵";
    
    // 根据道法类型生成不同文案
    let engraveText = "";
    switch (playerWay.type) {
        case '攻伐':
            engraveText = [
                `「${player.名号}」双眸如电，手持帝兵划破虚空！`,
                `大道符文自体内涌出，化作攻伐神则融入帝兵！`,
                `「${playerWay.name}」之道刻入帝兵，锋芒毕露！`,
                `帝兵震颤，发出震天剑鸣，似要斩断万古！`
            ].join('\n');
            break;
        case '护体':
            engraveText = [
                `「${player.名号}」盘坐虚空，帝兵悬浮身前！`,
                `护体神光流转，化作不朽道则融入帝兵！`,
                `「${playerWay.name}」之道刻入帝兵，万法不侵！`,
                `帝兵绽放永恒神光，构筑不朽防御！`
            ].join('\n');
            break;
        case '涅槃':
            engraveText = [
                `「${player.名号}」引动涅槃真火，煅烧帝兵！`,
                `生命本源燃烧，涅槃之道融入帝兵！`,
                `「${playerWay.name}」之道刻入帝兵，生生不息！`,
                `帝兵浴火重生，散发不朽生机！`
            ].join('\n');
            break;
    }
    
    const successMsg = [
        `【帝兵刻写·大道铭刻】`,
        engraveText,
        ``,
        `「${weaponForm}形帝兵」${weapon.name} 已刻写：`,
        `大道名称：${playerWay.name}`,
        `大道类型：${playerWay.type}`,
        ``,
        `【属性提升】`,
        `全属性：+5`,
        `当前全属性：${weapon.全属性}`,
        playerWay.type === '攻伐' ? `攻击力提升：50%` : '',
        playerWay.type === '护体' ? `防御力提升：50%` : '',
        playerWay.type === '涅槃' ? `生命值提升：50%` : '',
        weapon.bao > 0 ? `暴击率提升：${Math.round(weapon.bao * 100)}%` : '',
        ``,
        `「${playerWay.name}之道，与兵同在！」`
    ].filter(Boolean).join('\n');
    
    e.reply(successMsg);
    return true;
}
async renameEmperorWeapon(e) {
    if (!e.isGroup) return;
    
    // 使用更灵活的名称提取方式
    const match = e.msg.match(/^#为帝兵更名\s*([\u4e00-\u9fa5a-zA-Z0-9]+)$/);
    if (!match) {
        e.reply("指令格式错误！正确格式：#为帝兵更名 [新名称]");
        return true;
    }
    
    const newName = match[1];
    const usr_qq = e.user_id;
    
    // 检查玩家是否存在
    if (!await existplayer(usr_qq)) {
        e.reply("请先创建修仙角色");
        return true;
    }
    
    // 获取玩家装备数据
    const equipment = await Read_equipment(usr_qq);
    
    // 检查是否有帝兵
    if (!equipment.帝兵 ) {
        return e.reply("你还没有炼制帝兵！请先使用 #以[材料]炼制帝兵[名称] 炼制帝兵");
    }
    
    const weapon = equipment.帝兵;
    
    // 定义必须包含的帝兵形态字眼
    const REQUIRED_WEAPON_FORMS = ["剑", "鼎", "枪", "钟", "塔", "镜", "印", "刀", "斧", "戟", "鞭", "琴", "扇"];
    
    // 检查新名称是否合法
    const isValidWeaponName = REQUIRED_WEAPON_FORMS.some(form => 
        newName.includes(form)
    );
    
    if (!isValidWeaponName) {
        return e.reply([
            `帝兵名称必须包含以下形态之一：`,
            REQUIRED_WEAPON_FORMS.join("、"),
            `例如：#为帝兵更名 混沌剑`,
            `您输入的名称：${newName}`,
            `请重新命名！`
        ].join("\n"));
    }
    
    // 检查名称长度
    if (newName.length < 2 || newName.length > 10) {
        return e.reply("帝兵名称长度需在2-10个字符之间");
    }
    
    // 保存旧名称
    const oldName = weapon.name;
    
    // 更新名称
    weapon.name = newName;
    equipment.帝兵 = weapon;
    
    // 保存装备数据
    await Write_equipment(usr_qq, equipment);
    
    // 回复消息
    e.reply([
        `【帝兵更名】`,
        `原名称：${oldName}`,
        `新名称：${newName}`,
        `帝兵更名成功！`
    ].join("\n"));
    
    return true;
}
async upgradeEmperorWeapon(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    // 检查玩家是否存在
    if (!await existplayer(usr_qq)) {
        e.reply("请先创建修仙角色");
        return true;
    }
    
    // 获取玩家数据
    const player = await Read_player(usr_qq);
    const equipment = await Read_equipment(usr_qq);
    
    // 检查是否有帝兵
    if (!equipment.帝兵.author_name || equipment.帝兵.author_name !== player.id) {
        return e.reply("这并非你的本命帝兵，无法洗礼进阶");
    }

    const weapon = equipment.帝兵;

    // 帝兵品阶体系
    const DI_BING_RANKS = [
        "雏形", "通灵", "铭刻道与理", "斩道王兵", 
        "圣兵", "准帝兵", "极道帝兵", "仙器", 
        "仙王器", "准仙帝器", "仙帝器", "祭道器"
    ];
    
    // 检查是否已达上限
    if (weapon.品阶 === "祭道器") {
        return e.reply([
            `帝兵已达终极境界！`,
            `「${weapon.name}」已进阶至最高品阶「祭道器」`,
            `无法再进行雷劫洗礼`
        ].join("\n"));
    }
        if (weapon.品阶 === "铭刻道与理"&&!weapon.蕴养) {
        return e.reply([
            `你需要用自身道行和生命本源蕴养${weapon.name}才能使其更进一步承受住雷劫洗礼`,
        ].join("\n"));
    }
            if (weapon.品阶 === "圣兵"&&!weapon.刻写之道) {
        return e.reply([
            `你需要将自身之道刻在${weapon.name}才能使其更进一步承受住雷劫洗礼`,
        ].join("\n"));
    }
   // 极道帝兵检查
    if (weapon.品阶 === "极道帝兵" ) {
        // 检查是否融合了全部九种仙金
        const hasAllNineGolds = checkAllNineGoldsFused(weapon);
        
        if (!hasAllNineGolds) {
            // 获取缺少的仙金列表
            const missingGolds = getMissingGolds(weapon);
            
            return e.reply([
                `「${weapon.name}」需要融合全部九种仙金才能使其更进一步承受住雷劫洗礼`,
                `当前已融合仙金：${weapon.主材料}（主材）${weapon.融合仙金?.join('、') || '无'}`,
                `缺少仙金：${missingGolds.join('、')}`,
                `请使用 #以[仙金名称]融合帝兵 完成祭炼`
            ].join("\n"));
        } else {
        weapon.祭炼 = true;
        equipment.帝兵 = weapon;
        await Write_equipment(usr_qq, equipment);
        e.reply(`「${weapon.name}」已融合全部九种仙金，开始终极一跃！`);
        }
    }
// 辅助函数：检查是否融合了全部九种仙金
function checkAllNineGoldsFused(weapon) {
    // 主材料
    const mainMaterial = weapon.主材料;
    
    // 融合仙金列表
    const fusedMaterials = weapon.融合仙金 || [];
    
    // 合并所有仙金
    const allMaterials = [mainMaterial, ...fusedMaterials];
    
    // 检查是否包含全部九大仙金
    return IMMORTAL_GOLDS.every(gold => allMaterials.includes(gold));
}

// 辅助函数：获取缺少的仙金列表
function getMissingGolds(weapon) {
    // 主材料
    const mainMaterial = weapon.主材料;
    
    // 融合仙金列表
    const fusedMaterials = weapon.融合仙金 || [];
    
    // 合并所有仙金
    const allMaterials = [mainMaterial, ...fusedMaterials];
    
    // 找出缺少的仙金
    return IMMORTAL_GOLDS.filter(gold => !allMaterials.includes(gold));
}


    if (weapon.品阶 === "仙王器"&&!weapon.祭炼) {
        return e.reply([
            `「${weapon.name}」需要用同品阶帝兵进行祭炼才能使其更进一步承受住雷劫洗礼`,
        ].join("\n"));
    }
    // 检查成长次数是否已达潜力上限
    if (weapon.成长次数 >= weapon.潜力) {
        return e.reply([
            `帝兵潜力已耗尽！`,
            `当前潜力：${weapon.潜力}星`,
            `已成长次数：${weapon.成长次数}`,
            `可通过融合仙金提升潜力上限`,
            `当前品阶：${weapon.品阶}`,
            `最高可进阶至：祭道器`
        ].join("\n"));
    }
    
    // 帝兵进阶体系
    const EVOLUTION_STAGES = {
        "雏形": { next: "通灵", power: 2, require: "无", addAllAttr: 1 },
        "通灵": { next: "铭刻道与理", power: 2, require: "雷劫洗礼", addAllAttr: 2 },
        "铭刻道与理": { next: "斩道王兵", power: 2, require: "斩道境界", addAllAttr: 3 },
        "斩道王兵": { next: "圣兵", power: 2, require: "圣人境界", addAllAttr: 5 },
        "圣兵": { next: "准帝兵", power: 2, require: "准帝境界", addAllAttr: 7 },
        "准帝兵": { next: "极道帝兵", power: 2, require: "大帝境界", addAllAttr: 10 },
        "极道帝兵": { next: "仙器", power: 2, require: "红尘仙境界", addAllAttr: 20 },
        "仙器": { next: "仙王器", power: 2, require: "仙王境界", addAllAttr: 30 },
        "仙王器": { next: "准仙帝器", power: 2, require: "准仙帝境界", addAllAttr: 50 },
        "准仙帝器": { next: "仙帝器", power: 2, require: "仙帝境界", addAllAttr: 100 },
        "仙帝器": { next: "祭道器", power: 2, require: "祭道境界", addAllAttr: 200 }
    };
    
    const currentStage = weapon.品阶;
    const stageInfo = EVOLUTION_STAGES[currentStage];
    const nextStage = stageInfo.next;
    const powerBoost = stageInfo.power;
    const requireCondition = stageInfo.require;
    
    // 检查进阶条件
    if (requireCondition !== "无") {
        // 检查玩家是否满足进阶条件
        let conditionMet = false;
        
        if (requireCondition === "雷劫洗礼") {
            conditionMet = true; // 雷劫洗礼本身就是条件
        } else if (requireCondition === "斩道境界") {
            conditionMet = player.mijinglevel_id >= 11; // 斩道王者境界
        } else if (requireCondition === "圣人境界") {
            conditionMet = player.mijinglevel_id >= 12; // 圣人境界
        } else if (requireCondition === "准帝境界") {
            conditionMet = player.mijinglevel_id >= 15; // 准帝境界
        } else if (requireCondition === "大帝境界") {
            conditionMet = player.mijinglevel_id >= 16; // 大帝境界
        } else if (requireCondition === "红尘仙境界") {
            conditionMet = player.mijinglevel_id >= 17; // 红尘仙境界
        } else if (requireCondition === "仙王境界") {
            conditionMet = player.mijinglevel_id >= 18; // 仙王境界
        } else if (requireCondition === "准仙帝境界") {
            conditionMet = player.mijinglevel_id >= 20; // 准仙帝境界
        } else if (requireCondition === "仙帝境界") {
            conditionMet = player.mijinglevel_id >= 21; // 仙帝境界
        } else if (requireCondition === "祭道境界") {
            conditionMet = player.mijinglevel_id >= 22; // 祭道境界
        }
        
        if (!conditionMet) {
            return e.reply([
                `进阶条件不足！`,
                `当前品阶：${currentStage}`,
                `下一品阶：${nextStage}`,
                `要求：${requireCondition}`,
            ].join("\n"));
        }
    }
    
    // 添加辅助函数
    function getLevelName(condition) {
        const levelMap = {
            "斩道境界": "斩道王者",
            "圣人境界": "圣人",
            "准帝境界": "准帝",
            "大帝境界": "大帝",
            "红尘仙境界": "红尘仙",
            "仙王境界": "仙王",
            "准仙帝境界": "准仙帝",
            "仙帝境界": "仙帝",
            "祭道境界": "祭道"
        };
        return levelMap[condition] || condition;
    }
    
    // 计算消耗
    const baseCost = 10000000;
    const actualCost = Math.round(baseCost * (1 + weapon.成长次数 * 5));
    // 血气消耗比例 (100%)
    const bloodCost = Math.round(actualCost * 1);
    
    // 检查修为和血气是否足够
    if (player.修为 < actualCost || player.血气 < bloodCost) {
        const messages = [
            `资源不足！`,
            `进阶消耗：`,
            `修为：${actualCost.toLocaleString()}`,
            `血气：${bloodCost.toLocaleString()}`,
            `当前资源：`,
            `修为：${player.修为.toLocaleString()}`,
            `血气：${player.血气.toLocaleString()}`
        ];
        
        if (player.修为 < actualCost) {
            messages.push(`修为不足：${(actualCost - player.修为).toLocaleString()}`);
        }
        
        if (player.血气 < bloodCost) {
            messages.push(`血气不足：${(bloodCost - player.血气).toLocaleString()}`);
        }
        
        return e.reply(messages.join("\n"));
    }
    
    // 计算成功率
    let successRate = 0.75 - (weapon.成长次数 * 0.02);
    
    // 高品阶进阶更难
    if (weapon.品阶 === "极道帝兵") successRate = 0.3;
    if (weapon.品阶 === "仙器") successRate = 0.2;
    if (weapon.品阶 === "仙王器") successRate = 0.1;
    if (weapon.品阶 === "准仙帝器") successRate = 0.05;
    if (weapon.品阶 === "仙帝器") successRate = 0.01;
    
    // 添加境界加成
    if (player.mijinglevel_id >= 16) successRate += 0.2; // 大帝境界加成
    if (player.mijinglevel_id >= 17) successRate += 0.3; // 红尘仙加成
    if (player.mijinglevel_id >= 19) successRate += 0.4; // 准仙帝加成
    if (player.mijinglevel_id >= 20) successRate += 0.5; // 仙帝加成
    if (player.mijinglevel_id >= 21) successRate += 0.6; // 祭道加成
    
    // 限制成功率范围
    successRate = Math.max(0.01, Math.min(0.95, successRate));
    
    // 发送确认消息
    await e.reply([
        `【帝兵雷劫洗礼】`,
        `当前品阶：${currentStage}`,
        `下一品阶：${nextStage}`,
        `成功率：${Math.round(successRate * 100)}%`,
        `消耗修为：${actualCost.toLocaleString()}`,
        `消耗血气：${bloodCost.toLocaleString()}`,
    ].join("\n"));
    
    // 扣除资源
    player.修为 -= actualCost;
    player.血气 -= bloodCost;
    await Write_player(usr_qq, player);
    
    // 进行雷劫判定
    const rand = Math.random();
    if (rand > successRate) {
        // 进阶失败
        const damageRate = 0.1 + (1 - successRate) * 0.2;
        const damage = Math.round(weapon.HP * damageRate);
        weapon.HP -= damage;
        weapon.成长次数 += 1;
        
        // 保存帝兵
        equipment.帝兵 = weapon;
        await Write_equipment(usr_qq, equipment);
        
        return e.reply([
            `【雷劫洗礼失败】`,
            `九天神雷劈落，帝兵遭受重创！`,
            `气血损失：${damage.toLocaleString()}`,
            `当前气血：${weapon.HP.toLocaleString()}`,
            `帝兵品阶未提升，当前品阶：${weapon.品阶}`,
            `距离${nextStage}还需努力！`
        ].join('\n'));
    }
    
    // 进阶成功
    weapon.品阶 = nextStage;
    weapon.成长次数 += 1;
    
    // 提升属性
    weapon.atk = Math.round(weapon.atk * powerBoost);
    weapon.def = Math.round(weapon.def * powerBoost);
    weapon.HP = Math.round(weapon.HP * powerBoost);
    

    
    // 计算新全属性值
     weapon.全属性 += stageInfo.addAllAttr;
    

    // 暴击率提升
    if (nextStage === "极道帝兵") {
        weapon.bao += 0.05;
    } else if (nextStage === "仙器") {
        weapon.bao += 0.1;
    } else if (nextStage === "仙王器") {
        weapon.bao += 0.15;
    } else if (nextStage === "准仙帝器") {
        weapon.bao += 0.2;
    } else if (nextStage === "仙帝器") {
        weapon.bao += 0.25;
    } else if (nextStage === "祭道器") {
        weapon.bao += 0.5;
    }
    
    // 保存帝兵
    equipment.帝兵 = weapon;
    await Write_equipment(usr_qq, equipment);
    
    // 生成成功消息
    const weaponForm = weapon.name.match(/剑|鼎|枪|钟|塔|镜|印|刀|斧|戟|鞭|琴|扇/)?.[0] || "帝兵";
    
    // 添加辅助函数
    function getBaoIncrease(stage) {
        const increaseMap = {
            "极道帝兵": 5,
            "仙器": 10,
            "仙王器": 15,
            "准仙帝器": 20,
            "仙帝器": 25,
            "祭道器": 50
        };
        return increaseMap[stage] || 0;
    }
    
    // 特殊品阶的消息
    let specialTitle = "";
    let specialDesc = "";
    
    if (nextStage === "准仙帝器") {
        specialTitle = "【准仙帝器出世·纪元更迭】";
        specialDesc = `时间长河倒流，纪元更迭！`;
    } else if (nextStage === "仙帝器") {
        specialTitle = "【仙帝器诞生·诸天共尊】";
        specialDesc = `仙光耀世，万道臣服！`;
    } else if (nextStage === "祭道器") {
        specialTitle = "【祭道器诞生·诸天同悲】";
        specialDesc = `万道崩解，诸天同悲！`;
    }
    
    const successMsg = [
        specialTitle ? specialTitle : `【帝兵进阶成功】`,
        specialDesc ? specialDesc : `九天神雷淬炼，大道符文铭刻！`,
        `${weaponForm}形帝兵「${weapon.name}」成功进阶为「${nextStage}」！`,
        `属性提升：`,
        `攻击：${weapon.atk.toLocaleString()}（×${powerBoost}）`,
        `防御：${weapon.def.toLocaleString()}（×${powerBoost}）`,
        `气血：${weapon.HP.toLocaleString()}（×${powerBoost}）`,
        `全属性加成：${weapon.全属性.toLocaleString()}`,
        nextStage === "极道帝兵" || nextStage === "仙器" || 
        nextStage === "仙王器" || nextStage === "准仙帝器" || 
        nextStage === "仙帝器" || nextStage === "祭道器" ? 
        `暴击率：+${getBaoIncrease(nextStage)}% → ${Math.round(weapon.bao * 100)}%` : "",
        `当前成长次数：${weapon.成长次数}/${weapon.潜力}`,
        weapon.成长次数 < weapon.潜力 ? 
            `可继续进阶` : `潜力已耗尽，需融合仙金提升潜力`
    ].filter(Boolean).join("\n");
    
    e.reply(successMsg);
    return true;
}
async forgeEmperorWeapon(e) {
    if (!e.isGroup) return;
    
    // 解析命令
    const match = e.msg.match(/^#以(.*)炼制帝兵(.*)$/);
    if (!match) return false;
    
    const materialName = match[1].trim();
    const weaponName = match[2].trim();
    const usr_qq = e.user_id;
    
    // 检查玩家是否存在
    if (!await existplayer(usr_qq)) {
        e.reply("请先创建修仙角色");
        return true;
    }
    
    // 获取玩家数据
    const player = await Read_player(usr_qq);
    const equipment = await Read_equipment(usr_qq);

    const chuilian = {
            "id": 23001005,
            "name": "神纹锤炼法",
            "class": "功法",
            "type": "炼器",
            "desc": "以神纹锤炼本命法器",
            "出售价": 1000000
    };
    

    if (!player.学习的功法.includes(chuilian.name)) {
       return e.reply(`你没有炼制本命帝兵的法门`);
    }
    // 检查材料是否存在
    if (!await exist_najie_thing(usr_qq, materialName, "材料")) {
        return e.reply(`你缺少【${materialName}】材料`);
    }
    
    // 定义必须包含的帝兵形态字眼
    const REQUIRED_WEAPON_FORMS = ["剑", "鼎", "枪", "钟", "塔", "镜", "印", "刀", "斧", "戟", "鞭", "琴", "扇"];
    
    // 检查帝兵名称是否包含必要字眼
    const isValidWeaponName = REQUIRED_WEAPON_FORMS.some(form => 
        weaponName.includes(form)
    );
    
    if (!isValidWeaponName) {
        return e.reply([
            `帝兵名称必须包含以下形态之一：`,
            REQUIRED_WEAPON_FORMS.join("、"),
            `例如：#以仙泪绿金炼制帝兵「混沌剑」`,
            `请重新命名！`
        ].join("\n"));
    }
    
    // 获取材料稀有度
    const rarity = MATERIAL_RARITY[materialName] || 5;
    
    // 消耗材料
    await Add_najie_thing(usr_qq, materialName, "材料", -1);
    
    // 创建帝兵 - 使用统一的属性名称
    const weapon = {
        id: 1997, // 唯一ID
        name: weaponName,
        author_name: player.id,
        class:"装备",
        type: "帝兵",
        品阶: "雏形",
        主材料: materialName,
        atk: Math.floor(rarity * 800 ), // 攻击
        def: Math.floor(rarity * 800 ),  // 防御
        HP: Math.floor(rarity * 800 ),  // 血量
        全属性:rarity * 0.1 ,  
        出售价:rarity * 120000,
        bao: 0.03, // 暴击率加成
        潜力: rarity * 0.3, // 稀有度越高潜力越大
        成长次数: 0
    };
    
    // 保存帝兵
    equipment.帝兵 = weapon;
    await Add_najie_thing(usr_qq, weapon,"装备",1);
    
    // 从名称中提取帝兵形态
    const weaponForm = REQUIRED_WEAPON_FORMS.find(form => 
        weaponName.includes(form)
    ) || "兵器";
    
    // 潜力星级
    const potentialStars = Math.min(5, Math.floor(rarity / 2));
    
    // 生成成功消息
    const successMsg = [
        `【极道帝兵现世】`,
        `九天神雷劈开混沌，大道梵音响彻星域！`,
        `${weaponForm}形帝兵「${weaponName}」横空出世！`,
        `使用材料：${materialName}（稀有度${rarity}）`,
        `初始属性：`,
        `攻击 │ ${weapon.atk.toLocaleString()}`,
        `防御 │ ${weapon.def.toLocaleString()}`,
        `气血 │ ${weapon.HP.toLocaleString()}`,
        `全属性加成 │ ${weapon.全属性.toLocaleString()}`, 
        `此兵可随主人渡劫成长，当前潜力：${'★'.repeat(potentialStars)}`,
        `帝兵等阶：${weapon.品阶}`,
        `需以自身道与法温养，历经雷劫方能极尽升华！`
    ].join("\n");
    
    e.reply(successMsg);
    return true;
}
async fuseEmperorWeapon(e) {
    if (!e.isGroup) return;
    
    // 解析命令
    const match = e.msg.match(/^#以(.*)融合帝兵$/);
    if (!match) return false;
    
    const materialName = match[1].trim();
    const usr_qq = e.user_id;
    
    // 检查玩家是否存在
    if (!await existplayer(usr_qq)) {
        e.reply("请先创建修仙角色");
        return true;
    }
    
    // 获取玩家数据
    const player = await Read_player(usr_qq);
    const equipment = await Read_equipment(usr_qq);
       // 检查是否有帝兵
    if (!equipment.帝兵.author_name||equipment.帝兵.author_name&&equipment.帝兵.author_name!=player.id) {
        return e.reply("这并非你的本命帝兵，无法进行融合");
    }

    
    // 获取帝兵
    const weapon = equipment.帝兵;
    
    // 检查是否已达上限
    if (weapon.品阶 === "仙帝器") {
        return e.reply([
            `帝兵已达上限！`,
            `「${weapon.name}」已进阶至最高品阶「仙帝器」`,
            `无法再融合新的仙金材料`
        ].join("\n"));
    }
    
    // 设置潜力上限
    const MAX_POTENTIAL = 40;
    if (weapon.潜力 >= MAX_POTENTIAL) {
        return e.reply([
            `帝兵潜力已达上限！`,
            `当前潜力：${weapon.潜力}星（最大${MAX_POTENTIAL}星）`,
            `无法再融合新的仙金材料`
        ].join("\n"));
    }
    
    // 检查材料是否为九大仙金
    const IMMORTAL_GOLDS = [
        "仙泪绿金", "凰血赤金", "龙纹黑金", "永恒蓝金",
        "神痕紫金", "道劫黄金", "羽化青金", "混沌石精",
        "大罗银精", "太初源金", "混沌母金", "万物源金"
    ];
    
    if (!IMMORTAL_GOLDS.includes(materialName)) {
        return e.reply([
            `「${materialName}」非九大仙金！`,
            `可用的仙金材料：`,
            IMMORTAL_GOLDS.join("、"),
            `例如：#以仙泪绿金融合帝兵`
        ].join("\n"));
    }
    
    // 检查材料是否存在
    if (!await exist_najie_thing(usr_qq, materialName, "材料")) {
        return e.reply(`你缺少【${materialName}】仙金`);
    }
    
    // ===== 关键检查：是否已使用过该仙金 =====
    // 检查是否作为主材料使用过
    const isMainMaterial = weapon.主材料 === materialName;
    // 检查是否作为融合材料使用过
    const isFusedMaterial = weapon.融合仙金 && weapon.融合仙金.includes(materialName);
    
    if (isMainMaterial || isFusedMaterial) {
        let msg = `「${weapon.name}」已融合过${materialName}，每种仙金只能融合一次！`;
        
        if (isMainMaterial) {
            msg += `\n（该仙金是帝兵的主材料）`;
        } else {
            msg += `\n（该仙金已作为融合材料使用过）`;
        }
        
        return e.reply(msg);
    }
    
    // 获取仙金稀有度
    const MATERIAL_RARITY = {
        "大罗银精": 9,
        "仙泪绿金": 9,
        "凰血赤金": 9,
        "龙纹黑金": 9,
        "永恒蓝金": 9,
        "神痕紫金": 9,
        "道劫黄金": 9,
        "羽化青金": 9,
        "混沌石精": 9
    };
    
    const rarity = MATERIAL_RARITY[materialName] || 9;
    
    // 消耗材料
    await Add_najie_thing(usr_qq, materialName, "材料", -1);
    
    // 记录融合仙金
    if (!weapon.融合仙金) weapon.融合仙金 = [];
    weapon.融合仙金.push(materialName);
    
    // 潜力提升值 = 稀有度 / 2（四舍五入）
    const potentialBoost = Math.round(rarity / 3);
    
    // 提升潜力（注意：先计算新的潜力值，然后不超过上限）
    weapon.潜力 = Math.min(weapon.潜力 + potentialBoost, MAX_POTENTIAL);
    
    // 保存帝兵
    equipment.帝兵 = weapon;
    await Write_equipment(usr_qq, equipment);
    
    // 生成成功消息
    const weaponForm = weapon.name.match(/剑|鼎|枪|钟|塔|镜|印|刀|斧|戟|鞭|琴|扇/)?.[0] || "帝兵";
    
    const successMsg = [
        `【帝兵融合·仙金融道】`,
        `九天神火焚尽虚空，${materialName}化作道则神链！`,
        `${weaponForm}形帝兵「${weapon.name}」与仙金融为一体！`,
        `潜力提升：+${potentialBoost}星 → ${weapon.潜力}星${weapon.潜力 === MAX_POTENTIAL ? "（已达上限）" : ""}`,
        `当前品阶：${weapon.品阶}`,
        `已融合仙金：${weapon.主材料}（主材）${weapon.融合仙金.join("、")}`,
        weapon.潜力 < MAX_POTENTIAL ? 
            `可继续融合仙金提升潜力上限` : 
            `潜力已达上限，无法再提升`,
        `使用 #以雷劫洗礼帝兵 提升帝兵品阶`
    ].join("\n");
    
    e.reply(successMsg);
    return true;
}



  // 开始寻脉定源
async xunyuan2(e) {
    let usr_qq = e.user_id;
    if (!await existplayer(usr_qq)) return;
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }

    // 源天师职业验证
    let player = await Read_player(usr_qq);
    if (player.occupation !== "源天师") {
        e.reply("您并非源天师，没有拘禁山川龙脉改天换地的能力又怎么定源?");
        return;
    }

    // 时间处理（标准化为15分钟倍数）
    let time = parseInt(e.msg.replace("#寻脉定源", "").replace("分钟", "")) || 30;
    const TIME_UNIT = 15; // 基础时间单位
    const MAX_CYCLES = 480; // 最大循环次数
    
    // 寻找最近的TIME_UNIT倍数
    for (let i = MAX_CYCLES; i > 0; i--) {
        if (time >= TIME_UNIT * i) {
            time = TIME_UNIT * i;
            break;
        }
    }
  time = Math.max(time, 30); // 最低30分钟

  // 动作冲突检查
  let action = await redis.get(`xiuxian:player:${usr_qq}:action`);
  action = JSON.parse(action);
  if (action && Date.now() <= action.end_time) {
      const remain = action.end_time - Date.now();
      const m = Math.floor(remain / 60000);
      const s = Math.floor((remain % 60000) / 1000);
      e.reply(`正在${action.action}中，剩余时间:${m}分${s}秒`);
      return;
  }

  // 设置新动作
  const action_time = time * 60000; // 毫秒
  const arr = {
      action: '寻脉定源',
      end_time: Date.now() + action_time,
        time: action_time,
        xunyuan2:0,plant: 1, shutup: 1, working: 1, 
        Place_action: 1, power_up: 1, mojie: 1,
        xijie: 1, mine: 1, shoulie: 1
    };
    if (e.isGroup) arr.group_id = e.group_id;

    await redis.set(`xiuxian:player:${usr_qq}:action`, JSON.stringify(arr));
    e.reply(`现在开始寻脉定源${time}分钟`);
}

// 结束寻脉定源
async xunyuan2_back(e) {
    if (!verc({ e })) {
        e.reply("验证失败，无法结束寻脉定源！");
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 获取当前动作
    const actionData = await redis.get(`xiuxian:player:${usr_qq}:action`);
    const action = JSON.parse(actionData);
    if (!action || action.action !== '寻脉定源') {
        e.reply("你当前没有进行寻脉定源");
        return;
    }

    // 计算有效时间
    const start_time = action.end_time - action.time;
    const now = Date.now();
    let validTime = 0;
    const TIME_UNIT = 15;
    const MAX_CYCLES = 480;

    if (now < action.end_time) {
        // 提前结束
        validTime = Math.floor((now - start_time) / 60000);
        for (let i = MAX_CYCLES; i > 0; i--) {
            if (validTime >= TIME_UNIT * i) {
                validTime = TIME_UNIT * i;
                break;
            }
        }
    } else {
        // 超时结算
        validTime = Math.floor(action.time / 60000);
        for (let i = MAX_CYCLES; i > 0; i--) {
            if (validTime >= TIME_UNIT * i) {
                validTime = TIME_UNIT * i;
                break;
            }
        }
    }
    
    // 执行结算
    if (e.isGroup) {
        await this.xunyuan2_jiesuan(usr_qq, validTime, e.group_id);
    } else {
        await this.xunyuan2_jiesuan(usr_qq, validTime);
    }

    // 更新动作状态
    action.is_jiesuan = 1;
    action.xunyuan2 = 1;
    action.end_time = now;
    delete action.group_id;
    await redis.set(`xiuxian:player:${usr_qq}:action`, JSON.stringify(action));
}

// 寻脉定源结算
async xunyuan2_jiesuan(usr_qq, time, group_id) {
    const player = data.getData("player", usr_qq);
    if (!player.level_id) return;

    // 源天师职业加成计算
    const exp = (player.occupation === "源天师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 资源计算（龙脉能量）
    const baseAmount = Math.floor((1.8 + Math.random() * 0.4) * time);
    const rareAmount = Math.floor(time / 30);
    let end_amount = Math.floor(3 * (rate + 1) * baseAmount); // 超品源石
    let end_amount2 = Math.floor(2 * (rate + 0.7) * rareAmount); // 上品神源石
    let end_amount3 = Math.floor(1 * (rate + 0.5) * rareAmount); // 超品神源石

    // 境界惩罚（化神以下受压制）
    const levelFactor = player.level_id <= 21 
        ? player.level_id / 80 
        : player.level_id / 40;
    
    end_amount = Math.floor(end_amount * levelFactor);
    end_amount2 = Math.floor(end_amount2 * levelFactor);
    end_amount3 = Math.floor(end_amount3 * levelFactor);

    // 添加龙脉资源
    await Add_najie_thing(usr_qq, "超品源石", "道具", end_amount);
    await Add_najie_thing(usr_qq, "上品神源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "神源液", "丹药", end_amount2);
    await Add_najie_thing(usr_qq, "超品神源石", "道具", end_amount3);
    await Add_najie_thing(usr_qq, "神源药", "丹药", end_amount3);
    await Add_职业经验(usr_qq, exp);

    // 构造龙脉能量报告
    let msg = `【${player.名号}】寻脉定源归来，`;
    if (exp > 0) {
        msg += `获得${exp}点龙脉勘测经验，`;
        msg += `源石产量提升${Math.floor(rate * 100)}%，`;
    }
    
    // 添加境界警告
    if (player.level_id <= 21) {
        const penalty = (1 - player.level_id / 40) * 50;
        msg += `\n⚠️境界压制：遭遇诡异怪物，产量降低${penalty.toFixed(1)}%`;
    }
    
     
    if (Math.random() > 0.85) {
      await Add_najie_thing(usr_qq, "龙脉精华", "道具", 1);
      msg += `\n\n🏮发现上古遗迹！获得【龙脉精华】×1`;
    }
    msg += `\n\n收获龙脉精华：`;
    msg += `\n超品源石 × ${end_amount}`;
    msg += `\n上品神源石 × ${end_amount2} + 神源液 × ${end_amount2}`;
    msg += `\n超品神源石 × ${end_amount3} + 神源药 × ${end_amount3}`;
    
    // 发送结果
    if (group_id) {
        await this.pushInfo(group_id, true, msg);
    } else {
        await this.pushInfo(usr_qq, false, msg);
    }
}
  async xunyuan(e) {
    let usr_qq = e.user_id;
    // 账号检查
    if (!await existplayer(usr_qq)) return;
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }

    // 职业验证
    let player = await Read_player(usr_qq);
    if (player.occupation != "源师") {
        e.reply("您又不是源师，怎么寻找源脉?");
        return;
    }

    // 时间处理（标准化为15分钟倍数）
    let time = parseInt(e.msg.replace("#寻源", "").replace("分钟", "")) || 30;
    const TIME_UNIT = 15; // 基础时间单位
    const MAX_CYCLES = 480; // 最大循环次数
    
    // 寻找最近的TIME_UNIT倍数
    for (let i = MAX_CYCLES; i > 0; i--) {
        if (time >= TIME_UNIT * i) {
            time = TIME_UNIT * i;
            break;
        }
    }
    time = Math.max(time, 30); // 最低30分钟

    // 动作冲突检查
    let action = await redis.get(`xiuxian:player:${usr_qq}:action`);
    action = JSON.parse(action);
    if (action && new Date().getTime() <= action.end_time) {
        const remain = action.end_time - Date.now();
        const m = Math.floor(remain / 60000);
        const s = Math.floor((remain % 60000) / 1000);
        e.reply(`正在${action.action}中，剩余时间:${m}分${s}秒`);
        return;
    }

    // 设置新动作
    const action_time = time * 60000; // 毫秒
    const arr = {
        action: '寻源',
        end_time: Date.now() + action_time,
        time: action_time,xunyuan:0,
        plant: 1, shutup: 1, working: 1, 
        Place_action: 1, power_up: 1, mojie: 1,
        xijie: 1, mine: 1, shoulie: 1
    };
    if (e.isGroup) arr.group_id = e.group_id;

    await redis.set(`xiuxian:player:${usr_qq}:action`, JSON.stringify(arr));
    e.reply(`现在开始寻源${time}分钟`);
}

async xunyuan_back(e) {
    if (!verc({ e })) {
        e.reply("验证失败，无法结束寻源！");
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 获取当前动作
    const actionData = await redis.get(`xiuxian:player:${usr_qq}:action`);
    const action = JSON.parse(actionData);
    if (!action || action.action !== '寻源') {
        e.reply("你当前没有进行寻源");
        return;
    }

    // 计算有效时间
    const start_time = action.end_time - action.time;
    const now = Date.now();
    let validTime = 0;
    const TIME_UNIT = 15;
    const MAX_CYCLES = 480;

    if (now < action.end_time) {
        // 提前结束
        validTime = Math.floor((now - start_time) / 60000);
        for (let i = MAX_CYCLES; i > 0; i--) {
            if (validTime >= TIME_UNIT * i) {
                validTime = TIME_UNIT * i;
                break;
            }
        }
    } else {
        // 超时结算
        validTime = Math.floor(action.time / 60000);
        for (let i = MAX_CYCLES; i > 0; i--) {
            if (validTime >= TIME_UNIT * i) {
                validTime = TIME_UNIT * i;
                break;
            }
        }
    }
    
    // 执行结算
    if (e.isGroup) {
        await this.xunyuan_jiesuan(usr_qq, validTime, e.group_id);
    } else {
        await this.xunyuan_jiesuan(usr_qq, validTime);
    }

    // 更新动作状态
    action.is_jiesuan = 1;
    action.xunyuan = 1;
    action.end_time = now;
    delete action.group_id;
   await redis.del(`xiuxian:player:${usr_qq}:action`);
}

async xunyuan_jiesuan(usr_qq, time, group_id) {
    const player = data.getData("player", usr_qq);
    if (!player.level_id) return;

    // 职业加成计算
    const exp = (player.occupation === "源师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 资源计算
    const baseAmount = Math.floor((1.8 + Math.random() * 0.4) * time);
    const rareAmount = Math.floor(time / 30);
    let end_amount = Math.floor(3 * (rate + 1) * baseAmount);
    let end_amount2 = Math.floor(2 * (rate + 0.7) * rareAmount);
    let end_amount3 = Math.floor(1 * (rate + 0.5) * rareAmount);

    // 境界惩罚
    const levelFactor = player.level_id <= 21 
        ? player.level_id / 80 
        : player.level_id / 40;
    
    end_amount = Math.floor(end_amount * levelFactor);
    end_amount2 = Math.floor(end_amount2 * levelFactor);
    end_amount3 = Math.floor(end_amount3 * levelFactor);

    // 添加资源
    await Add_najie_thing(usr_qq, "下品源石", "道具", end_amount);
    await Add_najie_thing(usr_qq, "中品源石", "道具", end_amount);
    await Add_najie_thing(usr_qq, "上品源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "神源石", "道具", end_amount3);
    await Add_najie_thing(usr_qq, "凡源药", "丹药", end_amount3);
    await Add_职业经验(usr_qq, exp);

    // 构造消息
    let msg = `【${player.名号}】寻源归来，`;
    if (exp > 0) msg += `获得寻源经验${exp}，`;
    msg += `收获：\n下品源石×${end_amount}\n中品源石×${end_amount}\n上品源石×${end_amount2}\n神源石×${end_amount3}\n凡源药×${end_amount3}`;
    
    // 发送结果
    if (group_id) {
        await this.pushInfo(group_id, true, msg);
    } else {
        await this.pushInfo(usr_qq, false, msg);
    }
}
 async xunyuan3(e) {
    let usr_qq = e.user_id;
    // 账号检查
    if (!await existplayer(usr_qq)) return;
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }

    // 职业验证
    let player = await Read_player(usr_qq);
    if (player.occupation != "源地师") {
        e.reply("您又不是源地师，怎么感知地脉流转，引导山川精气?");
        return;
    }

    // 时间处理（标准化为15分钟倍数）
    let time = parseInt(e.msg.replace("#地脉引气", "").replace("分钟", "")) || 30;
    const TIME_UNIT = 15; // 基础时间单位
    const MAX_CYCLES = 480; // 最大循环次数
    
    // 寻找最近的TIME_UNIT倍数
    for (let i = MAX_CYCLES; i > 0; i--) {
        if (time >= TIME_UNIT * i) {
            time = TIME_UNIT * i;
            break;
        }
    }
    time = Math.max(time, 30); // 最低30分钟

    // 动作冲突检查
    let action = await redis.get(`xiuxian:player:${usr_qq}:action`);
    action = JSON.parse(action);
    if (action && new Date().getTime() <= action.end_time) {
        const remain = action.end_time - Date.now();
        const m = Math.floor(remain / 60000);
        const s = Math.floor((remain % 60000) / 1000);
        e.reply(`正在${action.action}中，剩余时间:${m}分${s}秒`);
        return;
    }

    // 设置新动作
    const action_time = time * 60000; // 毫秒
    let arr = {
        action: '地脉引气',
        end_time: Date.now() + action_time,
        time: action_time,xunyuan3:0,
        plant: 1, shutup: 1, working: 1, 
        Place_action: 1, power_up: 1, mojie: 1,
        xijie: 1, mine: 1, shoulie: 1
    };
    if (e.isGroup) {
      arr.group_id = e.group_id;
    }


    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    e.reply(`现在开始地脉引气${time}分钟`);
}
async xunyuan3_back(e) {
    if (!verc({ e })) {
        e.reply("验证失败，无法结束寻源！");
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 获取当前动作
    const actionData = await redis.get(`xiuxian:player:${usr_qq}:action`);
    const action = JSON.parse(actionData);
    if (!action || action.action !== '地脉引气') {
        e.reply("你当前没有进行地脉引气");
        return;
    }

    // 计算有效时间
    const start_time = action.end_time - action.time;
    const now = Date.now();
    let validTime = 0;
    const TIME_UNIT = 15;
    const MAX_CYCLES = 480;

    if (now < action.end_time) {
        // 提前结束
        validTime = Math.floor((now - start_time) / 60000);
        for (let i = MAX_CYCLES; i > 0; i--) {
            if (validTime >= TIME_UNIT * i) {
                validTime = TIME_UNIT * i;
                break;
            }
        }
    } else {
        // 超时结算
        validTime = Math.floor(action.time / 60000);
        for (let i = MAX_CYCLES; i > 0; i--) {
            if (validTime >= TIME_UNIT * i) {
                validTime = TIME_UNIT * i;
                break;
            }
        }
    }
    
    // 执行结算
    if (e.isGroup) {
        await this.xunyuan3_jiesuan(usr_qq, validTime, e.group_id);
    } else {
        await this.xunyuan3_jiesuan(usr_qq, validTime);
    }

    // 更新动作状态
    action.is_jiesuan = 1;
    action.xunyuan3 = 1;
    action.end_time = now;
    delete action.group_id;
    await redis.del(`xiuxian:player:${usr_qq}:action`, JSON.stringify(action));
}
async xunyuan3_jiesuan(usr_qq, time, group_id) {
    const player = data.getData("player", usr_qq);
    if (!player.level_id) return;

    // 职业加成计算
    const exp = (player.occupation === "源地师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    const rareAmount = Math.floor(time / 30);
    let end_amount2 = Math.floor(4 * (rate + 0.7) * rareAmount);
    let end_amount3 = Math.floor(1 * (rate + 0.5) * rareAmount);

    // 境界惩罚
    const levelFactor = player.level_id <= 21 
        ? player.level_id / 80 
        : player.level_id / 40;
    

    end_amount2 = Math.floor(end_amount2 * levelFactor);
    end_amount3 = Math.floor(end_amount3 * levelFactor);

    await Add_najie_thing(usr_qq, "上品源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "超品源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "神源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "地源药", "丹药", end_amount3);
    await Add_职业经验(usr_qq, exp);

    // 构造消息
    let msg = `【${player.名号}】地脉引气归来，`;
    if (exp > 0) msg += `获得地脉引气经验${exp}，`;
    msg += `收获：\n上品源石×${end_amount2}\n神源石×${end_amount2}\n超品源石 × ${end_amount2}\n地源药×${end_amount3}`;
    
    // 发送结果
    if (group_id) {
        await this.pushInfo(group_id, true, msg);
    } else {
        await this.pushInfo(usr_qq, false, msg);
    }
}
 async taofahuaidan(e) {
    let usr_qq = e.user_id;
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply("玩家不存在，请先创建角色");
        return;
    }
    let player = await Read_player(usr_qq);
    if (player.occupation != "侠客") {
        e.reply("非侠客不能执行此操作");
        return;
    }

    let 侠客令 = await exist_najie_thing(usr_qq, "侠客令", "道具")
    // 检查侠客令道具数量
    if (侠客令 < 1) {
        e.reply("您没有侠客令道具，无法进行消灭");
        return;
    }
    
    let action = await redis.get("xiuxian:player:" + usr_qq + ":jiangjing");
    if (!action) {
        e.reply("当前没有可消灭的目标");
        return;
    }
    action = JSON.parse(action);

    if (action.arm.length === 0) {
        e.reply("当前没有可消灭的目标");
        return;
    }

    let num = e.msg.replace("#消灭恶人", '');
    num = parseInt(num.trim()) - 1;

    if (isNaN(num) || num < 0 || num >= action.arm.length) {
        e.reply("目标编号错误");
        return;
    }

    // 使用与劫掠村庄相似的计算格式
    let baseReward = 500; // 基础赏金
    let levelMultiplier = 1.2 + 0.02 * player.occupation_level; // 等级倍数
    let target赏金 = Math.trunc(baseReward * levelMultiplier * player.level_id * player.Physique_id * 1.5);
    let zuizhongjiangli = Math.floor(target赏金 * 0.0002); // 降低的魔道值
    const end_amount = Math.floor(target赏金 * 0.0001);
    let ent = Math.floor(end_amount * 0.015);

    let target = action.arm[num];
    let last_msg = "";
    
    // 执行消灭逻辑
    player.灵石 += target赏金;
    player.魔道值 -= zuizhongjiangli;
    await Add_najie_thing(usr_qq, "侠客令", "道具", -1);
    await Write_player(usr_qq, player);
    await Add_职业经验(usr_qq, 2255);
    
    // 添加侠客特色奖励
    await Add_najie_thing(usr_qq, "四阶淬体丹", "丹药", end_amount);
    await Add_najie_thing(usr_qq, "四阶玄元丹", "丹药", end_amount);
    await Add_najie_thing(usr_qq, "秘境之匙", "道具", ent);
    
    // 构建消息 - 保持与劫掠村庄相似的格式
    last_msg = `你消灭了【${target.名号}】,获得灵石${target赏金}，降低魔道值${zuizhongjiangli}\n`;
    last_msg += `你搜刮了恶人的巢穴，发现了一些丹药和宝物：\n`;
    last_msg += `四阶淬体丹 × ${end_amount}\n`;
    last_msg += `四阶玄元丹 × ${end_amount}\n`;
    last_msg += `秘境之匙 × ${ent}`;

    // 从列表中移除目标
    action.arm.splice(num, 1);
    await redis.set("xiuxian:player:" + usr_qq + ":jiangjing", JSON.stringify(action));

    e.reply(last_msg);
}
async chakanhuaidan(e) {
    let usr_qq = e.user_id;
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply("玩家不存在，请先创建角色");
        return;
    }
    let player = await Read_player(usr_qq);
    if (player.occupation != "侠客") {
        e.reply("非侠客不能执行此操作");
        return;
    }

    // 尝试获取现有的恶人列表
    let action = await redis.get("xiuxian:player:" + usr_qq + ":jiangjing");
    let mubiao = [];
    let needRefresh = true;

    // 如果存在且未过期，则使用现有的恶人列表
    if (action) {
        action = JSON.parse(action);
        // 检查是否过期
        if (new Date().getTime() < action.end_time) {
            mubiao = action.arm;
            needRefresh = false;
        }
    }

    // 如果恶人列表为空或需要刷新，则生成新的恶人
    if (mubiao.length === 0 || needRefresh) {
        // 生成劫掠目标
        let baseReward = 500; // 基础赏金
        let levelMultiplier = 1.2 + 0.05 * player.occupation_level; // 等级倍数

        // 添加仙路窃贼目标
        mubiao.push({
            名号: "老王八蛋",
            赏金: Math.trunc(baseReward * levelMultiplier * player.level_id * player.Physique_id * 1.5),
            掉落物: "四阶玄元丹，四阶淬体丹，秘境之匙",
            QQ: 1
        });

        // 添加村庄目标
        mubiao.push({
            名号: "大卡拉米-老王",
            赏金: Math.trunc(baseReward * levelMultiplier * player.level_id * player.Physique_id * 1.5),
            掉落物: "四阶玄元丹，四阶淬体丹，秘境之匙",
            QQ: 1
        });

        mubiao.push({
            名号: "邪神信徒",
            赏金: Math.trunc(baseReward * levelMultiplier * player.level_id * player.Physique_id * 1.5),
            掉落物: "四阶玄元丹，四阶淬体丹，秘境之匙",
            QQ: 1
        });

        // 设置劫掠目标和结束时间
        let arr = {
            arm: mubiao,
            end_time: new Date().getTime() + 60000 * 60 * 12, // 12小时后刷新
        };
        await redis.set("xiuxian:player:" + usr_qq + ":jiangjing", JSON.stringify(arr));
    }

    // 显示劫掠目标
    let msg_data = {
        msg: mubiao,
        type: 2
    };
    const data1 = await new Show(e).get_msg(msg_data);
    let img = await puppeteer.screenshot("msg", {
        ...data1,
    });
    e.reply(img);
    return;
}
     async shoulie(e) {
        let usr_qq = e.user_id;//用户qq
        //有无存档
        if (!await existplayer(usr_qq)) {
            return;
        }

        //不开放私聊
        if (!e.isGroup) {
            e.reply('修仙游戏请在群聊中游玩');
            return;
        }
        let player = await Read_player(usr_qq);
        if (player.occupation != "猎户") {
            e.reply("你的狩猎许可证呢？盗猎是吧？罚款2000灵石。")
            await Add_灵石(usr_qq, -2000)
            return
        }

        //获取时间
        let time = e.msg.replace("#狩猎", "");
        time = time.replace("分钟", "");
        if (parseInt(time) == parseInt(time)) {
            time = parseInt(time);
            var y = 30;//时间
            var x = 240;//循环次数
            //如果是 >=16*33 ----   >=30
            for (var i = x; i > 0; i--) {
                if (time >= y * i) {
                    time = y * i;
                    break;
                }
            }
            //如果<30，修正。
            if (time < 30) {
                time = 30;
            }
        }
        else {
            //不设置时间默认30分钟
            time = 30;
        }

         //查询redis中的人物动作
    let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
    action = JSON.parse(action);
    if (action != null) {
      //人物有动作查询动作结束时间
      let action_end_time = action.end_time;
      let now_time = new Date().getTime();
      if (now_time <= action_end_time) {
        let m = parseInt((action_end_time - now_time) / 1000 / 60);
        let s = parseInt((action_end_time - now_time - m * 60 * 1000) / 1000);
        e.reply('正在' + action.action + '中，剩余时间:' + m + '分' + s + '秒');
        return false;
      }
    }

    let action_time = time * 60 * 1000; //持续时间，单位毫秒
    let arr = {
      action: '狩猎', //动作
      end_time: new Date().getTime() + action_time, //结束时间
      time: action_time, //持续时间
      plant: '1', //采药-开启
      shoulie: '0', //狩猎-开启
      shutup: '1', //闭关状态-开启
      working: '1', //降妖状态-关闭
      Place_action: '1', //秘境状态---关闭
      Place_actionplus: '1', //沉迷---关闭
      power_up: '1', //渡劫状态--关闭
      mojie: '1', //魔界状态---关闭
      xijie: '1', //洗劫状态开启
      mine: '1', //采矿-开启
    };
    if (e.isGroup) {
      arr.group_id = e.group_id;
    }

    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr)); //redis设置动作
    e.reply(`现在开始狩猎${time}分钟`);

    return false;
  }
        
    
async shoulie_back(e) {
   if (!verc({ e })) {
        // 假设有发送消息的方法，例如 e.reply
        e.reply("验证失败，无法结束狩猎！");
        return false;
    }
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let action = await this.getPlayerAction(usr_qq);
    if (action.shoulie == 1) {
      e.reply(`你并没有狩猎`);
      return false;
    }
    //结算
    let end_time = action.end_time;
    let start_time = action.end_time - action.time;
    let now_time = new Date().getTime();
    let time;
    var y = 15; //固定时间
    var x = 48; //循环次数

    if (end_time > now_time) {
      //属于提前结束
      time = parseInt((new Date().getTime() - start_time) / 1000 / 60);
      //超过就按最低的算，即为满足30分钟才结算一次
      //如果是 >=16*33 ----   >=30
      for (var i = x; i > 0; i--) {
        if (time >= y * i) {
          time = y * i;
          break;
        }
      }
      //如果<15，不给收益
      if (time < y) {
        time = 0;
      }
    } else {
      //属于结束了未结算
      time = parseInt(action.time / 1000 / 60);
      //超过就按最低的算，即为满足30分钟才结算一次
      //如果是 >=16*33 ----   >=30
      for (var i = x; i > 0; i--) {
        if (time >= y * i) {
          time = y * i;
          break;
        }
      }
      //如果<15，不给收益
      if (time < y) {
        time = 0;
      }
    }
       if (e.isGroup) {
      // 将群号作为第三个参数 group_id 传入
      await this.shoulie_jiesuan(usr_qq, time, e.group_id); 
    } else {
      // 私聊时第三个参数为 undefined（或不传，但函数定义有三个参数，所以这里传undefined）
      await this.shoulie_jiesuan(usr_qq, time, undefined); 
    }
    let arr = action;
    arr.is_jiesuan = 1; //结算状态
    arr.shoulie = 1; //狩猎状态
    arr.shutup = 1; //闭关状态
    arr.working = 1; //降妖状态
    arr.power_up = 1; //渡劫状态
    arr.Place_action = 1; //秘境
    //结束的时间也修改为当前时间
    arr.end_time = new Date().getTime();
    delete arr.group_id; //结算完去除group_id
    await redis.set(
      'xiuxian:player:' +usr_qq  + ':action',
      JSON.stringify(arr)
    );
  }

  async shoulie_jiesuan(user_id, time, group_id) {
    //time的单位是min
    let usr_qq = user_id;
    let player = data.getData("player", usr_qq);
    if (!isNotNull(player.level_id)) {
        return;
    }
    let msg = `【${player.名号}】`;
    //返回数目
    let shoulie_amount = Math.floor((3 + Math.random() * 0.5) * time * 12);
    //职业经验
    let exp = 0;
    let ext = "";
    if (player.occupation == "猎户") {
        exp = time * 100;
        ext = `你是猎户，获得狩猎经验${exp}，`;
    }
    let end_amount = Math.floor(shoulie_amount)
    end_amount *= player.occupation_level / 60
    end_amount = Math.floor(end_amount);
    // 定义要添加的物品数组
    const items = [
        {name: "野兔", type: "食材", amount: end_amount},
        {name: "野鸡", type: "食材", amount: end_amount},
        {name: "野猪", type: "食材", amount: end_amount},
        {name: "野牛", type: "食材", amount: end_amount},
        {name: "野羊", type: "食材", amount: end_amount}
    ];
    msg += `\n狩猎归来，${ext}\n收获：`;
    for (let item of items) {
        await Add_najie_thing(usr_qq, item.name, item.type, item.amount);
        msg += `\n${item.name}×${item.amount}`;
    }
    await Add_职业经验(usr_qq, exp);
    let img = await get_log_img(msg);
    if (group_id) {
        await this.pushInfo(group_id, true, img);
    } else {
        await this.pushInfo(usr_qq, false, img);
    }
    return;
}

  async zhuanzhi(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    if (player.occupation != '猎户') {
      e.reply('你不是猎户,无法自选职业');
      return false;
    }
    let occupation = e.msg.replace('#猎户转', '');
    let x = data.occupation_list.find(item => item.name == occupation);
    if (!isNotNull(x)) {
      e.reply(`没有[${occupation}]这项职业`);
      return false;
    }
    player.occupation = occupation;
    await Write_player(usr_qq, player);
    e.reply(`恭喜${player.名号}转职为[${occupation}]`);
    return false;
  }
  async chose_occupation(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let flag = await Go(e);
    if (!flag) {
      return false;
    }
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;

    let occupation = e.msg.replace('#转职', '');
    let player = await Read_player(usr_qq);
    let player_occupation = player.occupation;
    let x = data.occupation_list.find(item => item.name == occupation);
    if (!isNotNull(x)) {
      e.reply(`没有[${occupation}]这项职业`);
      return false;
    }
    let now_level_id;
    now_level_id = data.Level_list.find(
      item => item.level_id == player.level_id
    ).level_id;
    if (now_level_id < 17 && occupation == '采矿师') {
      e.reply('包工头:就你这小身板还来挖矿？再去修炼几年吧');
      return false;
    }
    if (now_level_id < 25 && occupation == "猎户") {
            e.reply("就你这点修为做猎户？怕不是光头强砍不到树来转的？")
            return
        }
    let thing_name = occupation + '转职凭证';
    let thing_class = '道具';
    let n = -1;
    let thing_quantity = await exist_najie_thing(
      usr_qq,
      thing_name,
      thing_class
    );
    if (!thing_quantity) {
      //没有
      e.reply(`你没有【${thing_name}】`);
      return false;
    }
    if (player_occupation == occupation) {
      e.reply(`你已经是[${player_occupation}]了，可使用[职业转化凭证]重新转职`);
      return false;
    }
    await Add_najie_thing(usr_qq, thing_name, thing_class, n);
    if (player.occupation.length == 0) {
      player.occupation = occupation;
      player.occupation_level = 1;
      player.occupation_exp = 0;
      await Write_player(usr_qq, player);
      e.reply(`恭喜${player.名号}转职为[${occupation}]`);
      return false;
    }
    let action = await redis.get('xiuxian:player:' + usr_qq + ':fuzhi'); //副职
    action = await JSON.parse(action);
    if (action == null) {
      action = [];
    }
    var arr = {
      职业名: player.occupation,
      职业经验: player.occupation_exp,
      职业等级: player.occupation_level,
    };
    action = arr;
    await redis.set(
      'xiuxian:player:' + usr_qq + ':fuzhi',
      JSON.stringify(action)
    );
    player.occupation = occupation;
    player.occupation_level = 1;
    player.occupation_exp = 0;
    await Write_player(usr_qq, player);
    e.reply(`恭喜${player.名号}转职为[${occupation}],您的副职为${arr.职业名}`);
    return false;
  }
  async chose_occupation2(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let flag = await Go(e);
    if (!flag) {
      return false;
    }
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;

    let player = await Read_player(usr_qq);
    let action = await redis.get('xiuxian:player:' + usr_qq + ':fuzhi'); //副职
    action = await JSON.parse(action);
    if (action == null) {
      action = [];
      e.reply(`您还没有副职哦`);
      return false;
    }
    let a, b, c;
    a = action.职业名;
    b = action.职业经验;
    c = action.职业等级;
    action.职业名 = player.occupation;
    action.职业经验 = player.occupation_exp;
    action.职业等级 = player.occupation_level;
    player.occupation = a;
    player.occupation_exp = b;
    player.occupation_level = c;
    await redis.set(
      'xiuxian:player:' + usr_qq + ':fuzhi',
      JSON.stringify(action)
    );
    await Write_player(usr_qq, player);
    e.reply(
      `恭喜${player.名号}转职为[${player.occupation}],您的副职为${action.职业名}`
    );
    return false;
  }

  async plant(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq); //用户qq
    if (!(await existplayer(usr_qq))) return false;
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
    let player = await Read_player(usr_qq);
    if (player.occupation != '采药师') {
      e.reply('您采药，您配吗?');
      return false;
    }
    //获取时间
    let time = e.msg.replace('#采药', '');
    time = time.replace('分钟', '');
    if (parseInt(time) == parseInt(time)) {
      time = parseInt(time);
      var y = 15; //时间
      var x = 48; //循环次数
      //如果是 >=16*33 ----   >=30
      for (var i = x; i > 0; i--) {
        if (time >= y * i) {
          time = y * i;
          break;
        }
      }
      //如果<30，修正。
      if (time < 30) {
        time = 30;
      }
    } else {
      //不设置时间默认30分钟
      time = 30;
    }

    //查询redis中的人物动作
    let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
    action = JSON.parse(action);
    if (action != null) {
      //人物有动作查询动作结束时间
      let action_end_time = action.end_time;
      let now_time = new Date().getTime();
      if (now_time <= action_end_time) {
        let m = parseInt((action_end_time - now_time) / 1000 / 60);
        let s = parseInt((action_end_time - now_time - m * 60 * 1000) / 1000);
        e.reply('正在' + action.action + '中，剩余时间:' + m + '分' + s + '秒');
        return false;
      }
    }

    let action_time = time * 60 * 1000; //持续时间，单位毫秒
    let arr = {
      action: '采药', //动作
      end_time: new Date().getTime() + action_time, //结束时间
      time: action_time, //持续时间
      plant: '0', //采药-开启
      shutup: '1', //闭关状态-开启
      working: '1', //降妖状态-关闭
      Place_action: '1', //秘境状态---关闭
      Place_actionplus: '1', //沉迷---关闭
      power_up: '1', //渡劫状态--关闭
      mojie: '1', //魔界状态---关闭
      xijie: '1', //洗劫状态开启
      mine: '1', //采矿-开启
    };
    if (e.isGroup) {
      arr.group_id = e.group_id;
    }

    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr)); //redis设置动作
    e.reply(`现在开始采药${time}分钟`);

    return false;
  }

  async qingchushangjinbang(e) {
    if (!verc({ e })) return false;
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let action = await redis.get('xiuxian:player:' + 1 + ':shangjing');
    action = await JSON.parse(action);
    action = null;
    e.reply('清除完成');
    await redis.set(
      'xiuxian:player:' + 1 + ':shangjing',
      JSON.stringify(action)
    );
    return false;
  }

  async plant_back(e) {
    if (!verc({ e })) return false;
    let usr_qq=e.user_id.toString().replace('qg_','')
    usr_qq = await channel(usr_qq);
    let action = await this.getPlayerAction(usr_qq);
    if (action.plant == 1) {
      return false;
    }
    //结算
    let end_time = action.end_time;
    let start_time = action.end_time - action.time;
    let now_time = new Date().getTime();
    let time;
    var y = 15; //固定时间
    var x = 48; //循环次数

    if (end_time > now_time) {
      //属于提前结束
      time = parseInt((new Date().getTime() - start_time) / 1000 / 60);
      //超过就按最低的算，即为满足30分钟才结算一次
      //如果是 >=16*33 ----   >=30
      for (var i = x; i > 0; i--) {
        if (time >= y * i) {
          time = y * i;
          break;
        }
      }
      //如果<15，不给收益
      if (time < y) {
        time = 0;
      }
    } else {
      //属于结束了未结算
      time = parseInt(action.time / 1000 / 60);
      //超过就按最低的算，即为满足30分钟才结算一次
      //如果是 >=16*33 ----   >=30
      for (var i = x; i > 0; i--) {
        if (time >= y * i) {
          time = y * i;
          break;
        }
      }
      //如果<15，不给收益
      if (time < y) {
        time = 0;
      }
    }
    if (e.isGroup) {
      await this.plant_jiesuan(usr_qq, time, false, e.group_id); //提前闭关结束不会触发随机事件
    } else {
      await this.plant_jiesuan(usr_qq, time, false); //提前闭关结束不会触发随机事件
    }
    let arr = action;
    arr.is_jiesuan = 1; //结算状态
    arr.plant = 1; //采药状态
    arr.shutup = 1; //闭关状态
    arr.working = 1; //降妖状态
    arr.power_up = 1; //渡劫状态
    arr.Place_action = 1; //秘境
    //结束的时间也修改为当前时间
    arr.end_time = new Date().getTime();
    delete arr.group_id; //结算完去除group_id
    await redis.set(
      'xiuxian:player:' +usr_qq  + ':action',
      JSON.stringify(arr)
    );
  }
  async mine(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq); //用户qq
    if (!(await existplayer(usr_qq))) return false;
    //获取游戏状态
    let game_action = await redis.get(
      'xiuxian:player:' + usr_qq + ':game_action'
    );
    //防止继续其他娱乐行为
    if (game_action == 0) {
      e.reply('修仙：游戏进行中...');
      return false;
    }
    let player = await Read_player(usr_qq);
    if (player.occupation != '采矿师') {
      e.reply('你挖矿许可证呢？非法挖矿，罚款200灵石');
      await Add_灵石(usr_qq, -200);
      return false;
    }
    //获取时间
    let time = e.msg.replace('#采矿', '');
    time = time.replace('分钟', '');
    if (parseInt(time) == parseInt(time)) {
      time = parseInt(time);
      var y = 30; //时间
      var x = 24; //循环次数
      //如果是 >=16*33 ----   >=30
      for (var i = x; i > 0; i--) {
        if (time >= y * i) {
          time = y * i;
          break;
        }
      }
      //如果<30，修正。
      if (time < 30) {
        time = 30;
      }
    } else {
      //不设置时间默认30分钟
      time = 30;
    }
    //查询redis中的人物动作
    let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
    action = JSON.parse(action);
    if (action != null) {
      //人物有动作查询动作结束时间
      let action_end_time = action.end_time;
      let now_time = new Date().getTime();
      if (now_time <= action_end_time) {
        let m = parseInt((action_end_time - now_time) / 1000 / 60);
        let s = parseInt((action_end_time - now_time - m * 60 * 1000) / 1000);
        e.reply('正在' + action.action + '中，剩余时间:' + m + '分' + s + '秒');
        return false;
      }
    }

    let action_time = time * 60 * 1000; //持续时间，单位毫秒
    let arr = {
      action: '采矿', //动作
      end_time: new Date().getTime() + action_time, //结束时间
      time: action_time, //持续时间
      plant: '1', //采药-开启
      mine: '0', //采药-开启
      shutup: '1', //闭关状态-开启
      working: '1', //降妖状态-关闭
      Place_action: '1', //秘境状态---关闭
      Place_actionplus: '1', //沉迷---关闭
      power_up: '1', //渡劫状态--关闭
      mojie: '1', //魔界状态---关闭
      xijie: '1', //洗劫状态开启
    };
    if (e.isGroup) {
      arr.group_id = e.group_id;
    }

    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr)); //redis设置动作
    e.reply(`现在开始采矿${time}分钟`);

    return false;
  }

  async mine_back(e) {
    if (!verc({ e })) return false;
    let usr_qq=e.user_id.toString().replace('qg_','')
    usr_qq=await channel(usr_qq)
    let action = await this.getPlayerAction(usr_qq);
    if (action.mine == 1) return false;
    //结算
    let end_time = action.end_time;
    let start_time = action.end_time - action.time;
    let now_time = new Date().getTime();
    let time;
    if (end_time > now_time) {
      //属于提前结束
      time = parseInt((new Date().getTime() - start_time) / 1000 / 60);
      var y = 30; //时间
      var x = 24; //循环次数
      //超过就按最低的算，即为满足30分钟才结算一次
      //如果是 >=16*33 ----   >=30
      for (var i = x; i > 0; i--) {
        if (time >= y * i) {
          time = y * i;
          break;
        }
      }
      //如果<15，不给收益
      if (time < y) {
        time = 0;
      }
    } else {
      //属于结束了未结算
      time = parseInt(action.time / 1000 / 60);
      //超过就按最低的算，即为满足30分钟才结算一次
      //如果是 >=16*33 ----   >=30
      for (var i = x; i > 0; i--) {
        if (time >= y * i) {
          time = y * i;
          break;
        }
      }
      //如果<15，不给收益
      if (time < y) {
        time = 0;
      }
    }

    if (e.isGroup) {
      await this.mine_jiesuan(usr_qq, time, false, e.group_id); //提前闭关结束不会触发随机事件
    } else {
      await this.mine_jiesuan(usr_qq, time, false); //提前闭关结束不会触发随机事件
    }

    let arr = action;
    arr.is_jiesuan = 1; //结算状态
    arr.mine = 1; //采药状态
    arr.plant = 1; //采药状态
    arr.shutup = 1; //闭关状态
    arr.working = 1; //降妖状态
    arr.power_up = 1; //渡劫状态
    arr.Place_action = 1; //秘境
    //结束的时间也修改为当前时间
    arr.end_time = new Date().getTime();
    delete arr.group_id; //结算完去除group_id
    await redis.set(
      'xiuxian:player:' + usr_qq + ':action',
      JSON.stringify(arr)
    );
  }

  async plant_jiesuan(user_id, time, is_random, group_id) {
    let usr_qq = user_id;
    let player = data.getData('player', usr_qq);
    let msg = player.名号;
    let exp = 0;
    exp = time * 10;
    let k = 1;
    if (player.level_id < 22) {
      k = 0.5;
    }
    let sum = (time / 480) * (player.occupation_level * 2 + 12) * k;
    if (player.level_id >= 36) {
      sum = (time / 480) * (player.occupation_level * 3 + 11);
    }
    let names = [
      '万年凝血草',
      '万年何首乌',
      '万年血精草',
      '万年甜甜花',
      '万年清心草',
      '古神藤',
      '万年太玄果',
      '炼骨花',
      '魔蕴花',
      '万年清灵草',
      '万年天魂菊',
      '仙蕴花',
      '仙缘草',
      '太玄仙草',
    ];
    const sum2 = [0.2, 0.3, 0.2, 0.2, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const sum3 = [
      0.17, 0.22, 0.17, 0.17, 0.17, 0.024, 0.024, 0.024, 0.024, 0.024, 0.024,
      0.024, 0.012, 0.011,
    ];
    msg+=`\n恭喜你获得了经验${exp},草药:`;
    let newsum = sum3.map(item => item * sum);
    if (player.level_id < 36) {
      newsum = sum2.map(item => item * sum);
    }
    for (let item in sum3) {
      if (newsum[item] < 1) {
        continue;
      }
      msg+=`\n${names[item]}${Math.floor(newsum[item])}个`;
      await Add_najie_thing(
        usr_qq,
        names[item],
        '草药',
        Math.floor(newsum[item])
      );
    }
    await Add_职业经验(usr_qq, exp);
    let img=await get_log_img(msg)
    if (group_id) {
      await this.pushInfo(group_id, true, img);
    } else {
      await this.pushInfo(usr_qq, false, img);
    }

    return false;
  }

  async mine_jiesuan(user_id, time, is_random, group_id) {
    let usr_qq = user_id;
    let player = data.getData('player', usr_qq);
    let msg =player.名号;
    let mine_amount1 = Math.floor((1.8 + Math.random() * 0.4) * time);
    let rate =
      data.occupation_exp_list.find(item => item.id == player.occupation_level)
        .rate * 10;
    let exp = 0;
    let ext = '';
    exp = time * 10;
    ext = `你是采矿师，获得采矿经验${exp}，额外获得矿石${Math.floor(
      rate * 100
    )}%,`;
    let end_amount = Math.floor(4 * (rate + 1) * mine_amount1); //普通矿石
    let num = Math.floor(((rate / 12) * time) / 30); //锻造
    const A = [
      '金色石胚',
      '棕色石胚',
      '绿色石胚',
      '红色石胚',
      '蓝色石胚',
      '金色石料',
      '棕色石料',
      '绿色石料',
      '红色石料',
      '蓝色石料',
    ];
    const B = [
      '金色妖石',
      '棕色妖石',
      '绿色妖石',
      '红色妖石',
      '蓝色妖石',
      '金色妖丹',
      '棕色妖丹',
      '绿色妖丹',
      '红色妖丹',
      '蓝色妖丹',
    ];
    let xuanze = Math.trunc(Math.random() * A.length);
    end_amount *= player.level_id / 40;
    end_amount = Math.floor(end_amount);
    await Add_najie_thing(usr_qq, '庚金', '材料', end_amount);
    await Add_najie_thing(usr_qq, '玄土', '材料', end_amount);
    await Add_najie_thing(usr_qq, A[xuanze], '材料', num);
    await Add_najie_thing(usr_qq, B[xuanze], '材料', Math.trunc(num / 48));
    await Add_职业经验(usr_qq, exp);
    msg+=`\n采矿归来，${ext}\n收获庚金×${end_amount}\n玄土×${end_amount}`;
    msg+=`\n${A[xuanze]}x${num}\n${B[xuanze]}x${Math.trunc(num / 48)}`;
    let img=await get_log_img(msg)
    if (group_id) {
      await this.pushInfo(group_id, true, img);
    } else {
      await this.pushInfo(usr_qq, false, img);
    }
    return false;
  }

  async show_danfang(e) {
    if (!verc({ e })) return false;
    let img = await get_danfang_img(e);
    e.reply(img);
    return false;
  }
    async show_zhizuo(e) {
    if (!verc({ e })) return false;
    let img = await get_zhizuo_img(e);
    e.reply(img);
    return false;
  }
  async yaoxiao(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let dy = await Read_danyao(usr_qq);
    let player = await Read_player(usr_qq);
    let m = '丹药效果:';
    if (dy.ped > 0) {
      m += `\n仙缘丹药力${dy.beiyong1 * 100}%药效${dy.ped}次`;
    }
    if (dy.lianti > 0) {
      m += `\n炼神丹药力${dy.beiyong4 * 100}%药效${dy.lianti}次`;
    }
    if (dy.beiyong2 > 0) {
      m += `\n神赐丹药力${dy.beiyong3 * 100}% 药效${dy.beiyong2}次`;
    }
    if (dy.biguan > 0) {
      m += `\n辟谷丹药力${dy.biguanxl * 100}%药效${dy.biguan}次`;
    }
    if (player.islucky > 0) {
      m += `\n福源丹药力${player.addluckyNo * 100}%药效${player.islucky}次`;
    }
    if (player.breakthrough == true) {
      m += `\n破境丹生效中`;
    }
    if (dy.xingyun > 0) {
      m += `\n真器丹药力${dy.beiyong5}药效${dy.xingyun}次`;
    }
        if (player.出金次数 > 0) {
      m += `\n冒险出金率${player.出金率}%药效${player.出金次数}次`;
    }
    e.reply(m);
    return false;
  }

  async show_tuzhi(e) {
    if (!verc({ e })) return false;
    let img = await get_tuzhi_img(e);
    e.reply(img);
    return false;
  }

  async liandan(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    if (player.occupation != '炼丹师') {
      e.reply('丹是上午炼的,药是中午吃的,人是下午走的');
      return false;
    }
    let t = e.msg.replace('#炼制', '').split('*');
    if (t <= 0) {
      t = 1;
    }
    let danyao = t[0];
    let n = await convert2integer(t[1]);
    let tmp_msg = '';
    let danfang = data.danfang_list.find(item => item.name == danyao);
    if (!isNotNull(danfang)) {
      e.reply(`世界上没有丹药[${danyao}]的配方`);
      return false;
    }
    if (danfang.level_limit > player.occupation_level) {
      e.reply(`${danfang.level_limit}级炼丹师才能炼制${danyao}`);
      return false;
    }
    let materials = danfang.materials;
    let exp = danfang.exp;
    tmp_msg += '消耗';
    for (let i in materials) {
      let material = materials[i];
      // 根据丹药名称决定材料类型
      let materialType = (danyao === '天命轮回丹') ? '丹药' : '草药';
      let x = await exist_najie_thing(usr_qq, material.name, materialType);
      if (x === false) {
        x = 0;
      }
      if (x < material.amount * n) {
        e.reply(
          `纳戒中拥有${material.name}(${materialType})${x}份，炼制需要${material.amount * n}份`
        );
        return false;
      }
    }

    for (let i in materials) {
      let material = materials[i];
      let materialType = (danyao === '天命轮回丹') ? '丹药' : '草药';
      tmp_msg += `${material.name}×${material.amount * n}，`;
      await Add_najie_thing(
        usr_qq,
        material.name,
        materialType,
        -material.amount * n
      );
    }
    let total_exp = exp[1] * n;
    if (player.仙宠.type == '炼丹') {
      let random = Math.random();
     
      if (random < player.仙宠.加成) {
        n *= 2;
        e.reply(
          '你的仙宠' + player.仙宠.name + '辅佐了你进行炼丹,成功获得了双倍丹药'
        );
      } else {
        e.reply('你的仙宠只是在旁边看着');
      }
    }
    if (
      danyao == '神心丹' ||
      danyao == '九阶淬体丹' ||
      danyao == '九阶玄元丹' ||
      danyao == '起死回生丹' ||danyao == '天命轮回丹'   // 添加这一行
    ) {
      await Add_najie_thing(usr_qq, danyao, '丹药', n);
      e.reply(`${tmp_msg}得到${danyao}${n}颗，获得炼丹经验${total_exp}`);
    } else {
      let dengjixiuzheng = player.occupation_level;
      let newrandom = Math.random();
      let newrandom2 = Math.random();
   
      if (newrandom >= 0.1 + (dengjixiuzheng * 3) / 100) {
        await Add_najie_thing(usr_qq, '凡品' + danyao, '丹药', n);
        e.reply(
          `${tmp_msg}得到"凡品"${danyao}${n}颗，获得炼丹经验${total_exp}`
        );
      } else {
        if (newrandom2 >= 0.4) {
          await Add_najie_thing(usr_qq, '极品' + danyao, '丹药', n);
          e.reply(
            `${tmp_msg}得到"极品"${danyao}${n}颗，获得炼丹经验${total_exp}`
          );
        } else {
          await Add_najie_thing(usr_qq, '仙品' + danyao, '丹药', n);
          e.reply(
            `${tmp_msg}得到"仙品"${danyao}${n}颗，获得炼丹经验${total_exp}`
          );
        }
      }
    }
    await Add_职业经验(usr_qq, total_exp);
  }
async zhizuo_fu(e) {
  if (!verc({ e })) return false;
  const usr_qq = e.user_id.toString().replace('qg_', '');
  const player = await Read_player(usr_qq);

  // 1. 职业验证
  if (player.occupation !== '符师') {
    e.reply('符道玄奥，非符师不可妄为！');
    return false;
  }

  // 2. 指令解析
  const args = e.msg.replace('#制作', '').split('*');
  const fuming = args[0]?.trim(); // 符箓名称
  const n = args[1] ? await convert2integer(args[1]) : 1; // 默认制作1张

  // 3. 配方验证
  const fufang = data.zhizuo_list.find(item => item.name === fuming);
  if (!fufang) {
    e.reply(`符道秘录中无「${fuming}」记载`);
    return false;
  }

  // 4. 等级与材料检查
  if (fufang.level_limit > player.occupation_level) {
    e.reply(`需达「符师${fufang.level_limit}重境」方可制作`);
    return false;
  }
  for (const material of fufang.materials) {
    const stock = await exist_najie_thing(usr_qq, material.name, material.class) || 0;
    if (stock < material.amount * n) {
      e.reply(`「${material.name}」不足！需${material.amount*n}份，仅存${stock}份`);
      return false;
    }
  }

  // 5. 执行制作
  try {
    // 扣除材料
    for (const material of fufang.materials) {
      await Add_najie_thing(usr_qq, material.name, material.class, -material.amount * n);
    }
    // 添加基础成品
    await Add_najie_thing(usr_qq, fuming, fufang.class, n);
    // 仙宠双倍判定
    if (player.仙宠?.type === '制符' && Math.random() < player.仙宠.加成) {
      await Add_najie_thing(usr_qq, fuming, fufang.class, n);
      e.reply(`✨ 仙宠【${player.仙宠.name}】助力，符箓产出翻倍！`);
    }
    // 成功反馈
    e.reply(`成功制作「${fuming}」×${n}！`);
  } catch (err) {
    console.error(`制作失败@${usr_qq}:`, err);
    e.reply('灵力反噬！符纸自焚成灰...');
  }
  return true;
}
  async lianqi(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    if (player.occupation != '炼器师') {
      e.reply('铜都不炼你还炼器？');
      return false;
    }
    let t = e.msg.replace('#打造', '').split('*');
    let equipment_name = t[0];
    let suc_rate = 0;
    let tmp_msg1 = '';
    let tmp_msg2 = '';
    let tuzhi = data.tuzhi_list.find(item => item.name == equipment_name);
    if (!tuzhi) {
      e.reply(`世界上没有[${equipment_name}]的图纸`);
      return false;
    }
    let materials = tuzhi.materials;
    let exp = tuzhi.exp;
    let res_exp;
    suc_rate += tuzhi.rate;

    let rate = 0;

    if (player.occupation_level > 0) {
      rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
      ).rate;
      rate = rate * 10;
      rate = rate * 0.025;
    }
    if (player.occupation == '炼器师') {
      tmp_msg1 += `你是炼器师，额外增加成功率${Math.floor(
        rate * 10
      )}%(以乘法算)，`;
      suc_rate *= 1 + rate;
      if (player.occupation_level >= 24) {
        suc_rate = 0.8;
      }
      res_exp = exp[0];
      tmp_msg2 += `，获得炼器经验${res_exp}`;
    }
    tmp_msg1 += '消耗';
    for (let i in materials) {
      let material = materials[i];
      let x = await exist_najie_thing(usr_qq, material.name, '材料');
      if (x < material.amount || !x) {
        e.reply(
          `纳戒中拥有${material.name}×${x}，打造需要${material.amount}份`
        );
        return false;
      }
    }
    for (let i in materials) {
      let material = materials[i];
      tmp_msg1 += `${material.name}×${material.amount}，`;
      await Add_najie_thing(usr_qq, material.name, '材料', -material.amount);
    }
    let rand1 = Math.random();
    if (rand1 > suc_rate) {
      let random = Math.random();
      if (random < 0.5) {
        e.reply(`打造装备时不小心锤断了刃芯，打造失败！`);
      } else {
        e.reply(`打造装备时没有把控好火候，烧毁了，打造失败！`);
      }
      return false;
    }
    let pinji = Math.trunc(Math.random() * 7);
    if (pinji > 5) {
      e.reply('在你细致的把控下，一把绝世极品即将问世！！！！');
      await sleep(10000);
    }
    await Add_najie_thing(usr_qq, equipment_name, '装备', 1, pinji);
    await Add_职业经验(usr_qq, res_exp);
    e.reply(
      `${tmp_msg1}打造成功，获得${equipment_name}(${
        ['劣', '普', '优', '精', '极', '绝', '顶'][pinji]
      })×1${tmp_msg2}`
    );
  }
  async search_sb(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    if (player.occupation != '侠客') {
      e.reply('只有专业的侠客才能获取悬赏');
      return false;
    }
    let msg = [];
    let action = await redis.get('xiuxian:player:' + usr_qq + ':shangjing');
    action = await JSON.parse(action);
    let type = 0;
    if (action != null) {
      if (action.end_time > new Date().getTime()) {
        msg = action.arm;
        var msg_data = {
          msg,
          type,
        };
        const data1 = await new Show(e).get_msg(msg_data);
        let img = await puppeteer.screenshot('msg', {
          ...data1,
        });
        e.reply(img);
        return false;
      }
    }
    let mubiao = [];
    let i = 0;
    let File = fs.readdirSync(__PATH.player_path);
    File = File.filter(file => file.endsWith('.json'));
    let File_length = File.length;
    for (var k = 0; k < File_length; k++) {
      let this_qq = File[k].replace('.json', '');

      let players = await Read_player(this_qq);
      if (players.魔道值 > 999 && this_qq != usr_qq) {
        mubiao[i] = {
          名号: players.名号,
          赏金: Math.trunc(
            (1000000 *
              (1.2 + 0.05 * player.occupation_level) *
              player.level_id *
              player.Physique_id) /
              42 /
              42 /
              4
          ),
          QQ: this_qq,
        };
        i++;
      }
    }
    while (i < 4) {
      mubiao[i] = {
        名号: 'DD大妖王',
        赏金: Math.trunc(
          (1000000 *
            (1.2 + 0.05 * player.occupation_level) *
            player.level_id *
            player.Physique_id) /
            42 /
            42 /
            4
        ),
        QQ: 1,
      };
      i++;
    }
    for (var k = 0; k < 3; k++) {
      msg.push(mubiao[Math.trunc(Math.random() * i)]);
    }
    let arr = {
      arm: msg,
      end_time: new Date().getTime() + 60000 * 60 * 20, //结束时间
    };
    await redis.set(
      'xiuxian:player:' + usr_qq + ':shangjing',
      JSON.stringify(arr)
    );
    var msg_data = {
      msg,
      type,
    };
    const data1 = await new Show(e).get_msg(msg_data);
    let img = await puppeteer.screenshot('msg', {
      ...data1,
    });
    e.reply(img);
    return false;
  }
  async taofa_sb(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let A_action = await redis.get('xiuxian:player:' + usr_qq + ':action');
    A_action = JSON.parse(A_action);
    if (A_action != null) {
      let now_time = new Date().getTime();
      //人物任务的动作是否结束
      let A_action_end_time = A_action.end_time;
      if (now_time <= A_action_end_time) {
        let m = parseInt((A_action_end_time - now_time) / 1000 / 60);
        let s = parseInt((A_action_end_time - now_time - m * 60 * 1000) / 1000);
        e.reply(
          '正在' + A_action.action + '中,剩余时间:' + m + '分' + s + '秒'
        );
        return false;
      }
    }
    let player = await Read_player(usr_qq);
    if (player.occupation != '侠客') {
      e.reply('侠客资质不足,需要进行训练');
      return false;
    }
    let action = await redis.get('xiuxian:player:' + usr_qq + ':shangjing');
    action = await JSON.parse(action);
    if (action == null) {
      e.reply('还没有接取到悬赏,请查看后再来吧'); //没接取悬赏
      return false;
    }
    if (action.arm.length == 0) {
      e.reply('每日限杀,请等待20小时后新的赏金目标'); //悬赏做完了(20h后刷新)
      return false;
    }
    var num = e.msg.replace('#讨伐目标', '');
    num = num.trim() - 1;
    let qq;
    try {
      qq = action.arm[num].QQ;
    } catch {
      e.reply('不要伤及无辜'); //输错了，没有该目标
      return false;
    }
    let last_msg = '';
    if (qq != 1) {
      var player_B = await Read_player(qq);
      player_B.当前血量 = player_B.血量上限;

      player_B.法球倍率 = player_B.灵根.法球倍率;
      let buff = 1 + player.occupation_level * 0.055;
      let player_A = {
        id: player.id,
        名号: player.名号,
        攻击: parseInt(player.攻击 * buff),
        防御: parseInt(player.防御),
        当前血量: parseInt(player.血量上限 * buff),
        暴击率: player.暴击率,
        学习的功法: player.学习的功法,
        魔道值: player.魔道值,
        灵根: player.灵根,
        法球倍率: player.灵根.法球倍率,
        仙宠: player.仙宠,
        神石: player.神石,
      };
      let Data_battle = await zd_battle(player_A, player_B);
      let msg = Data_battle.msg;
      let A_win = `${player_A.名号}击败了${player_B.名号}`;
      let B_win = `${player_B.名号}击败了${player_A.名号}`;
      if (msg.find(item => item == A_win)) {
        player_B.魔道值 -= 50;
        player_B.灵石 -= 1000000;
        player_B.当前血量 = 0;
        await Write_player(qq, player_B);
        player.灵石 += action.arm[num].赏金;
        player.魔道值 -= 5;
        await Write_player(usr_qq, player);
        await Add_职业经验(usr_qq, 2255);
        last_msg +=
          '【全服公告】' +
          player_B.名号 +
          '失去了1000000灵石,罪恶得到了洗刷,魔道值-50,无名侠客获得了部分灵石,自己的正气提升了,同时获得了更多的悬赏加成';
      } else if (msg.find(item => item == B_win)) {
        var shangjing = Math.trunc(action.arm[num].赏金 * 0.8);
        player.当前血量 = 0;
        player.灵石 += shangjing;
        player.魔道值 -= 5;
        await Write_player(usr_qq, player);
        await Add_职业经验(usr_qq, 1100);
        last_msg += player_B.名号 + '反杀了你,只获得了部分辛苦钱';
      }
      if (msg.length > 100) {
      } else {
        await ForwardMsg(e, msg);
      }
    } else {
      player.灵石 += action.arm[num].赏金;
      player.魔道值 -= 5;
      await Write_player(usr_qq, player);
      await Add_职业经验(usr_qq, 2255);
      last_msg += '你惩戒了仙路窃贼,获得了部分灵石'; //直接获胜
    }
    action.arm.splice(num, 1);
    await redis.set(
      'xiuxian:player:' + usr_qq + ':shangjing',
      JSON.stringify(action)
    );
    if (
      last_msg == '你惩戒了仙路窃贼,获得了部分灵石' ||
      last_msg == player_B.名号 + '反杀了你,只获得了部分辛苦钱'
    ) {
      let last_img=await get_log_img(last_msg)
      e.reply(last_img);
    } else {
      let last_img=await get_log_img(last_msg)
      const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';
      const groupList = await redis.sMembers(redisGlKey);
      for (const group_id of groupList) {
        this.pushInfo(group_id, true, last_img);
      }
    }
  }

  async xuanshang_sb(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    let qq = e.msg.replace('#悬赏', '');
    let code = qq.split('*');
    qq = code[0];
    let money = await convert2integer(code[1]);



    
    if (money < 10000000) {
      money = 10000000;
    }


    if (player.灵石 < money) {
      e.reply('您手头这点灵石,似乎在说笑');
      return false;
    }
    let player_B;
    try {
      player_B = await Read_player(qq);
    } catch {
      e.reply('世间没有这人'); //查无此人
      return false;
    }
    var arr = {
      名号: player_B.名号,
      QQ: qq,
      赏金: money,
    };
    let action = await redis.get('xiuxian:player:' + 1 + ':shangjing');
    action = await JSON.parse(action);
    if (action != null) {
      action.push(arr);
    } else {
      action = [];
      action.push(arr);
    }
    player.灵石 -= money;
    await Write_player(usr_qq, player);
    e.reply('悬赏成功!');
    let msg = '';
    msg += '【全服公告】' + player_B.名号 + '被悬赏了' + money + '灵石';
    const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';
    const groupList = await redis.sMembers(redisGlKey);
    for (const group_id of groupList) {
      this.pushInfo(group_id, true, msg);
    }
    await redis.set(
      'xiuxian:player:' + 1 + ':shangjing',
      JSON.stringify(action)
    );
    return false;
  }
  async shangjingbang(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let action = await redis.get('xiuxian:player:' + 1 + ':shangjing');
    action = await JSON.parse(action);
    if (action == null) {
      e.reply('悬赏已经被抢空了'); //没人被悬赏
      return false;
    }
    for (var i = 0; i < action.length - 1; i++) {
      var count = 0;
      for (var j = 0; j < action.length - i - 1; j++) {
        if (action[j].赏金 < action[j + 1].赏金) {
          var t;
          t = action[j];
          action[j] = action[j + 1];
          action[j + 1] = t;
          count = 1;
        }
      }
      if (count == 0) break;
    }
    await redis.set(
      'xiuxian:player:' + 1 + ':shangjing',
      JSON.stringify(action)
    );
    let type = 1;
    var msg_data = {
      msg: action,
      type,
    };
    const data1 = await new Show(e).get_msg(msg_data);
    let img = await puppeteer.screenshot('msg', {
      ...data1,
    });
    e.reply(img);
    return false;
  }
  async cisha_sb(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let A_action = await redis.get('xiuxian:player:' + usr_qq + ':action');
    A_action = JSON.parse(A_action);
    if (A_action != null) {
      let now_time = new Date().getTime();
      //人物任务的动作是否结束
      let A_action_end_time = A_action.end_time;
      if (now_time <= A_action_end_time) {
        let m = parseInt((A_action_end_time - now_time) / 1000 / 60);
        let s = parseInt((A_action_end_time - now_time - m * 60 * 1000) / 1000);
        e.reply(
          '正在' + A_action.action + '中,剩余时间:' + m + '分' + s + '秒'
        );
        return false;
      }
    }
    let action = await redis.get('xiuxian:player:' + 1 + ':shangjing');
    action = await JSON.parse(action);
    var num = e.msg.replace('#刺杀目标', '');
    num = num.trim() - 1;
    let qq;
    try {
      qq = action[num].QQ;
    } catch {
      e.reply('不要伤及无辜'); //输错了，没有该目标
      return false;
    }
    if (qq == usr_qq) {
      e.reply('咋的，自己干自己？');
      return false;
    }
    let player = await Read_player(usr_qq);
    let buff = 1;
    if (player.occupation == '侠客') {
      buff = 1 + player.occupation_level * 0.055;
    }
    let last_msg = '';
    let player_B = await Read_player(qq);
    //if (player_B.当前血量 == 0) {
    //  e.reply(`对方已经没有血了,请等一段时间再刺杀他吧`);
    //  return false;
    //}
    let B_action = await redis.get('xiuxian:player:' + qq + ':action');
    B_action = JSON.parse(B_action);
    if (B_action != null) {
      let now_time = new Date().getTime();
      //人物任务的动作是否结束
      let B_action_end_time = B_action.end_time;
      if (now_time <= B_action_end_time) {
        let ishaveyss = await exist_najie_thing(usr_qq, '隐身水', '道具');
        if (!ishaveyss) {
          //如果A没有隐身水，直接返回不执行
          let m = parseInt((B_action_end_time - now_time) / 1000 / 60);
          let s = parseInt(
            (B_action_end_time - now_time - m * 60 * 1000) / 1000
          );
          e.reply(
            '对方正在' + B_action.action + '中,剩余时间:' + m + '分' + s + '秒'
          );
          return false;
        }
      }
    }
    player_B.法球倍率 = player_B.灵根.法球倍率;
    player_B.当前血量 = player_B.血量上限;
    let player_A = {
      id: player.id,
      名号: player.名号,
      攻击: parseInt(player.攻击 * buff),
      防御: parseInt(player.防御),
      当前血量: parseInt(player.血量上限),
      暴击率: player.暴击率,
      学习的功法: player.学习的功法,
      灵根: player.灵根,
      魔道值: player.魔道值,
      神石: player.神石,
      法球倍率: player.灵根.法球倍率,
      仙宠: player.仙宠,
    };
    let Data_battle = await zd_battle(player_A, player_B);
    let msg = Data_battle.msg;
    let A_win = `${player_A.名号}击败了${player_B.名号}`;
    let B_win = `${player_B.名号}击败了${player_A.名号}`;
    let 赏金_2=action[num].赏金/2
    if (msg.find(item => item == A_win)) {
      player_B.当前血量 = 0;
      player_B.修为 -= 赏金_2;
      player_B.血气 -= 赏金_2;
      await Write_player(qq, player_B);
      player.灵石 += Math.trunc(action[num].赏金 * 0.3);
      await Write_player(usr_qq, player);
      last_msg +=
        '【全服公告】' +
        player_B.名号 +
        '被' +
        player.名号 +
        '悄无声息的刺杀了';
      //优化下文案，比如xxx在刺杀xxx中
      action.splice(num, 1);
      await redis.set(
        'xiuxian:player:' + 1 + ':shangjing',
        JSON.stringify(action)
      );
    } else if (msg.find(item => item == B_win)) {
      player.当前血量 = 0;
      await Write_player(usr_qq, player);
      last_msg +=
        '【全服公告】' +
        player.名号 +
        '刺杀失败,' +
        player_B.名号 +
        '勃然大怒,单手就反杀了' +
        player.名号; //优化下文案，比如xxx在刺杀xxx中
    }
    if (msg.length > 100) {
    } else {
      await ForwardMsg(e, msg);
    }
    const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';
    const groupList = await redis.sMembers(redisGlKey);
    for (const group_id of groupList) {
      this.pushInfo(group_id, true, last_msg);
    }
    return false;
  }

    /**
 * 
 * @param {any} e
 * @returns
 */
async search_cz(e) {
    let usr_qq = e.user_id;
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply("玩家不存在，请先创建角色");
        return;
    }
    let player = await Read_player(usr_qq);
    if (player.occupation != "唤魔者") {
        e.reply("非唤魔者不能执行此操作");
        return;
    }

    // 清空之前的劫掠目标
    await redis.del("xiuxian:player:" + usr_qq + ":jiangjing");

    // 生成劫掠目标
    let mubiao = [];
    let baseReward = 500; // 基础赏金
    let levelMultiplier = 1.2 + 0.02 * player.occupation_level; // 等级倍数

    // 添加仙路窃贼目标
    mubiao.push({
        名号: "仙路窃贼-小卡拉米老王的村庄",
        赏金: Math.trunc(baseReward * levelMultiplier * player.level_id * player.mijinglevel_id * player.Physique_id * 1.5),
        掉落物: "土豆,小麦，面包，胡萝卜",
        QQ: 1
    });

    // 添加村庄目标
    mubiao.push({
        名号: "村庄-蒙德",
        赏金: Math.trunc(baseReward * levelMultiplier * player.level_id * player.Physique_id * 1.5),
        掉落物: "土豆,小麦，面包，胡萝卜",
        QQ: 1
    });

    mubiao.push({
        名号: "村庄-稻妻",
        赏金: Math.trunc(baseReward * levelMultiplier * player.level_id * player.Physique_id * 1.5),
        掉落物: "土豆,小麦，面包，胡萝卜",
        QQ: 1
    });

    // 设置劫掠目标和结束时间
    let arr = {
        arm: mubiao,
        end_time: new Date().getTime() + 60000 * 60 * 1, // 20小时后刷新
    };
    await redis.set("xiuxian:player:" + usr_qq + ":jiangjing", JSON.stringify(arr));

    // 构建消息
    let msg = "可劫掠的目标：";
    mubiao.forEach((target, index) => {
        msg += `${index + 1}. ${target.名号} - 赏金: ${target.赏金}灵石\n`;
    });
    msg += "使用 #劫掠村庄 [编号] 进行劫掠";

     // 显示劫掠目标
        let msg_data = {
            msg: mubiao,
            type: 0
        };
        const data1 = await new Show(e).get_msg2(msg_data);
        let img = await puppeteer.screenshot("msg2", {
            ...data1,
        });
        e.reply(img);
    }

async taofa_cz(e) {
    let usr_qq = e.user_id;
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply("玩家不存在，请先创建角色");
        return;
    }
    let player = await Read_player(usr_qq);
    if (player.occupation != "唤魔者") {
        e.reply("非唤魔者不能执行此操作");
        return;
    }

    let 唤魔令 = await exist_najie_thing(usr_qq, "唤魔令", "道具");
    // 检查唤魔令道具数量
    if (唤魔令 < 1) {
        e.reply("您没有唤魔令道具，无法进行劫掠");
        return;
    }

    let action = await redis.get("xiuxian:player:" + usr_qq + ":jiangjing");
    if (!action) {
        e.reply("当前没有可劫掠的目标");
        return;
    }
    action = JSON.parse(action);

    if (action.arm.length === 0) {
        e.reply("当前没有可劫掠的目标");
        return;
    }

    let num = e.msg.replace("#劫掠村庄", '').trim();
    num = parseInt(num) - 1;

    if (isNaN(num) || num < 0 || num >= action.arm.length) {
        e.reply("目标编号错误");
        return;
    }
    
    await Add_najie_thing(usr_qq, "唤魔令", "道具", -1);
    await Write_player(usr_qq, player);
    
    let target = action.arm[num];
    // 使用与劫掠村庄相似的计算格式
    let baseReward = 500; // 基础赏金
    let levelMultiplier = 1.2 + 0.02 * player.occupation_level; // 等级倍数
    let target赏金 = Math.trunc(baseReward * levelMultiplier * player.level_id * player.Physique_id * 1.5);
    let zuizhongjiangli = Math.floor(target赏金 * 0.0002); // 降低的魔道值
    const end_amount = Math.floor(target赏金 * 0.001);


    // 执行劫掠逻辑
    player.灵石 += target赏金;
    player.魔道值 += zuizhongjiangli;
    await Write_player(usr_qq, player);
    await Add_职业经验(usr_qq, 2255);
    await Add_najie_thing(usr_qq, "面包", "食材", end_amount);
    await Add_najie_thing(usr_qq, "小麦", "食材", end_amount);
    await Add_najie_thing(usr_qq, "胡萝卜", "食材", end_amount);
    await Add_najie_thing(usr_qq, "土豆", "食材", end_amount);

    // 构建消息
    let msg = `你劫掠了【${target.名号}】,获得灵石${target赏金}，魔道值${zuizhongjiangli}\n`;
    msg += `你劫掠完村庄后一番搜索发现了几块菜田和宝箱，\n`;
    msg += `最终搜刮获得：\n`;
    msg += `小麦×${end_amount}\n`;
    msg += `面包×${end_amount}\n`;
    msg += `土豆×${end_amount}\n`;
    msg += `胡萝卜×${end_amount}`;

    // 从列表中移除劫掠目标
    action.arm.splice(num, 1);
    await redis.set("xiuxian:player:" + usr_qq + ":jiangjing", JSON.stringify(action));

    // 发送消息
    let img = await get_log_img(msg);
    e.reply(img);
}
  /**
   * 获取缓存中的人物状态信息
   * @param usr_qq
   * @return  falses {Promise<void>}
   */
  async getPlayerAction(usr_qq) {
    let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
    action = JSON.parse(action); //转为json格式数据
    return action;
  }
 async pushInfo(id, is_group, msg) {
    try {
        if (is_group) {
            await Bot.pickGroup(id).sendMsg(msg);
        } else {
            await Bot.pickUser(id).sendMsg(msg);
        }
    } catch (err) {
        Bot.logger.mark(err);
    }
}
}
// 辅助函数：计算封印时长
function calculateSealDuration(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}天${hours}时${minutes}分`;
}
