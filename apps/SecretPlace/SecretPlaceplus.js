import { plugin, verc, data } from '../../api/api.js';
import {
  Read_player,
  isNotNull,
  sleep,
  exist_najie_thing,
  Write_player,
  Go,
  Add_najie_thing,
  convert2integer,
  Add_灵石,
  Add_修为,
  Add_寿元,
   Add_血气,
  Goweizhi,
  channel
} from '../../model/xiuxian.js';
export class SecretPlaceplus extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_SecretPlace',
      dsc: '修仙模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#沉迷秘境.*$',
          fnc: 'Gosecretplace',
        },
        {
          reg: '^#沉迷禁地.*$',
          fnc: 'Goforbiddenarea',
        },
        {
          reg: '^#沉迷仙境.*$',
          fnc: 'Gofairyrealm',
        },
         {
          reg: '^#沉迷遮天位面.*$',
          fnc: 'Gozhetian',
        },
                 {
          reg: '^#沉迷下界八域.*$',
          fnc: 'Goxiajie',
        },
                         {
          reg: '^#沉迷九天十地.*$',
          fnc: 'Gojiutianshidi',
        },
        {
          reg: '^#沉迷收获$',
          fnc: 'CheckAddictionHarvest',
        },
        {
          reg: '^#清除沉迷记录$',
          fnc: 'ClearAddictionHistory',
        },
      ],
    });
  }

  async Xiuxianstate(e) {
    if (!verc({ e })) return false;
    let flag = await Go(e);
    if (!flag) {
      return false;
    }
    return false;
  }

  //秘境地点
  async Secretplace(e) {
    if (!verc({ e })) return false;
    let addres = '秘境';
    let weizhi = data.didian_list;
    await Goweizhi(e, weizhi, addres);
  }

  //禁地
  async Forbiddenarea(e) {
    if (!verc({ e })) return false;
    let addres = '禁地';
    let weizhi = data.forbiddenarea_list;
    let img=await Goweizhi(e, weizhi, addres);
    e.reply(img)
  }

  //限定仙府
  async Timeplace(e) {
    if (!verc({ e })) return false;
    e.reply('仙府乃民间传说之地,请自行探索');
  }

  //仙境
  async Fairyrealm(e) {
    if (!verc({ e })) return false;
    let addres = '仙境';
    let weizhi = data.Fairyrealm_list;
    await Goweizhi(e, weizhi, addres);
  }

async Gosecretplace(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
     usr_qq = await channel(usr_qq);
    // 解析指令
    let didian = e.msg.replace('#沉迷秘境', '').trim();
    let code = didian.split('*');
    didian = code[0].trim();
    let i = await convert2integer(code[1]);
    
    // 检查沉迷次数
    if (i > 12 || i < 1) {
        return e.reply('沉迷次数必须在1-12之间');
    }
    
    // 获取秘境信息
    const weizhi = data.didian_list.find(item => item.name == didian);
    if (!weizhi) {
        return e.reply(`未找到秘境：${didian}`);
    }
    
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
    
    // 获取玩家数据
    const player = await Read_player(usr_qq);
         // 检查是否已在目标地点
    if (player.power_place != 0) {
        return e.reply(`你不在凡间`);
    }
    // 特殊秘境检查
    if (didian == '桃花岛') {
        return e.reply('该秘境不支持沉迷哦');
    }
    
    // 检查等级要求
    const now_level_id = data.Level_list.find(
        item => item.level_id == player.level_id
    ).level_id;
    
    if (didian == "永恒海" && now_level_id < 55) {
        return e.reply('没有达到万界道祖之前还是不要去了');
    }
    if (didian == "永恒海尽头" && now_level_id < 63) {
        return e.reply('没有达到永恒境之前还是不要去了');
    }
    
    // 计算资源消耗
    const basePrice = weizhi.Price * 10 * i;
    const baseShouyuan = weizhi.shouyuan * 10 * i;
    
    // 检查资源是否足够
    if (player.灵石 < basePrice) {
        return e.reply(`没有灵石寸步难行，攒到${basePrice}灵石才够哦~`);
    }
    if (player.寿元 < baseShouyuan) {
        return e.reply(`道友这点寿元就不要去了吧，免得原地坐化了`);
    }
    
    // 检查秘境之匙
    const keyCount = await exist_najie_thing(usr_qq, '秘境之匙', '道具');
    if (!keyCount || keyCount < i) {
        return e.reply(`你需要${i}个秘境之匙才能沉迷此秘境`);
    }
    
    // ==== 真身沉迷逻辑 ====
    // 收集所有消息
    const allMsgs = [];

    
    // 特殊秘境处理
    if (didian == "小千世界" || didian == "中千世界" || didian == "大千世界") {
        const dagongCount = await exist_najie_thing(usr_qq, "打工券", "道具");
        if (!dagongCount || dagongCount < i) {
            return e.reply(`没有足够打工券的话打工本不支持沉迷哦`);
        }
        await Add_najie_thing(usr_qq, "打工券", "道具", -i);
        allMsgs.push(`${player.名号}消耗了${i}张打工券，开始前往苦逼打工`);
    }
    
    // 扣除资源
    await Add_najie_thing(usr_qq, '秘境之匙', '道具', -i);
    await Add_寿元(usr_qq, -baseShouyuan);
    await Add_灵石(usr_qq, -basePrice);
    
    // 收集消耗信息
    let costInfo = `消耗：${baseShouyuan}寿元，${basePrice}灵石，${i}个秘境之匙`;
    
    // 计算基础时间
    let baseTime = i * 10 * 7; // 基础时间（分钟）

    
    // 统一计算时间缩减效果
    const { timeReduction, msgs } = await calculateTimeReductionForAddiction(player, i);
    let time = baseTime - timeReduction;
    allMsgs.push(...msgs);
    
    // 应用时间减少
    
    
    // 添加时间减少汇总
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            `剩余时间：${time}分钟`,
        ].join('\n'));
    }
    
   
    
    // 添加消耗信息
    allMsgs.push(`${player.名号}${costInfo}`);
    
    // ==== 修改点：使用新的沉迷状态定义 ====
    
 // 计算每次结算的时间间隔（分钟）
    const intervalPerTime = time /(10*i);
    
    // 转换为毫秒
    const intervalMs = intervalPerTime * 60 * 1000;
    
    // 设置行动状态
    const arr = {
        action: '秘境历练',
        start_time: new Date().getTime(), // 开始时间
        total_time: time, // 总时间（分钟）
        remaining_time: time, // 剩余时间（分钟）
        total_count: 10*i, // 总次数
        settled_count: 0, // 已结算次数
        interval: intervalMs, // 每次结算的时间间隔（毫秒）
        next_settle_time: new Date().getTime() + intervalMs, // 下一次结算时间
        shutup: '1',
        working: '1',
        Place_action: '1',
        Place_actionplus: '0',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // ==== 记录沉迷历史数据 ====
    const addictionHistory = {
        start_time: new Date().getTime(),
        location: weizhi.name,
        location_type: '秘境',
        total_count: 10*i,
        settled_count: 0,
        death_count: 0,
        xiuwei_gained: 0,
        xueqi_gained: 0,
        items_gained: [],
        status: 'in_progress', // in_progress, completed
        end_time: null
    };
    
    // 保存到redis，用于后续查询
    await redis.set('xiuxian:player:' + usr_qq + ':addiction_history', JSON.stringify(addictionHistory));
    
    // ==== 修改点结束 ====
    
    // 添加主要行动信息
    allMsgs.push(`开始沉迷${didian}，${time}分钟后归来！`);
    
    // 一次性发送所有消息
    e.reply(allMsgs.join('\n\n'));
    return false;
}
async Goxiajie(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
     usr_qq = await channel(usr_qq);
    
    // 解析指令
    let didian = e.msg.replace('#沉迷下界八域', '').trim();
    let code = didian.split('*');
    didian = code[0].trim();
    let i = await convert2integer(code[1]);
    
    // 检查沉迷次数
    if (i > 12 || i < 1) {
        return e.reply('沉迷次数必须在1-12之间');
    }
    
    // 获取秘境信息
    const weizhi = data.xiajie_list.find(item => item.name == didian);
    if (!weizhi) {
        return e.reply(`未找到地点：${didian}`);
    }
    
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
    
    // 获取玩家数据
    const player = await Read_player(usr_qq);
         // 检查是否已在目标地点
    if (player.power_place != 1.5) {
        return e.reply(`你不在下界八域`);
    }
    // 特殊地点境界检查
    if (didian === "鲲鹏巢" && player.xiangulevel_id > 4) {
        e.reply('北海鲲鹏巢只有化灵境及以下的修士才能前往');
        return false;
    }
    if (didian === "百断山脉" && player.xiangulevel_id > 3) {
        e.reply('百断山脉只有洞天境及以下的修士才能前往');
        return false;
    }
    
    // 计算资源消耗
    const basePrice = weizhi.Price * 10 * i;
    const baseShouyuan = weizhi.shouyuan * 10 * i;
    const baseexperience = weizhi.experience * 10 * i;
    // 检查资源是否足够
    if (player.灵石 < basePrice) {
        return e.reply(`没有灵石寸步难行，攒到${basePrice}灵石才够哦~`);
    }
    if (player.寿元 < baseShouyuan) {
        return e.reply(`道友这点寿元就不要去了吧，免得原地坐化了`);
    }
        if (player.修为 < baseexperience) {
        e.reply('道友的修为不足以前往');
        return false;
    }
    if (player.血气 < baseexperience) {
        e.reply('道友的血气不足以前往');
        return false;
    }
    // 检查秘境之匙
    const keyCount = await exist_najie_thing(usr_qq, '秘境之匙', '道具');
    if (!keyCount || keyCount < i) {
        return e.reply(`你需要${i}个秘境之匙才能沉迷此秘境`);
    }
    
    // ==== 真身沉迷逻辑 ====
    // 收集所有消息
    const allMsgs = [];

    
    // 扣除资源
    await Add_najie_thing(usr_qq, '秘境之匙', '道具', -i);
    await Add_寿元(usr_qq, -baseShouyuan);
    await Add_灵石(usr_qq, -basePrice);
    await Add_修为(usr_qq, -baseexperience);
    await Add_血气(usr_qq, -baseexperience);
    
    // 收集消耗信息
    let costInfo = `消耗：${baseShouyuan}寿元，${basePrice}灵石，${baseexperience}修为与血气，${i}个秘境之匙`;
    
    // 计算基础时间
    let baseTime = i * 10 * 10; // 基础时间（分钟）

    
    // 统一计算时间缩减效果
    const { timeReduction, msgs } = await calculateTimeReductionForAddiction(player, i);
    let time = baseTime - timeReduction;
    allMsgs.push(...msgs);
    

    
    // 添加时间减少汇总
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            `剩余时间：${time}分钟`,
        ].join('\n'));
    }
    
   
    
    // 添加消耗信息
    allMsgs.push(`${player.名号}${costInfo}`);
    
    // ==== 修改点：使用新的沉迷状态定义 ====
    
 // 计算每次结算的时间间隔（分钟）
    const intervalPerTime = time /(10*i);
    
    // 转换为毫秒
    const intervalMs = intervalPerTime * 60 * 1000;
    
    // 设置行动状态
    const arr = {
        action: '下界八域历练',
        start_time: new Date().getTime(), // 开始时间
        total_time: time, // 总时间（分钟）
        remaining_time: time, // 剩余时间（分钟）
        total_count: 10*i, // 总次数
        settled_count: 0, // 已结算次数
        interval: intervalMs, // 每次结算的时间间隔（毫秒）
        next_settle_time: new Date().getTime() + intervalMs, // 下一次结算时间
        shutup: '1',
        working: '1',
        Place_action: '1',
        Place_actionplus: '0',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // ==== 记录沉迷历史数据 ====
    const addictionHistory = {
        start_time: new Date().getTime(),
        location: weizhi.name,
        location_type: '下界八域',
        total_count: 10*i,
        settled_count: 0,
        death_count: 0,
        xiuwei_gained: 0,
        xueqi_gained: 0,
        items_gained: [],
        status: 'in_progress', // in_progress, completed
        end_time: null
    };
    
    // 保存到redis，用于后续查询
    await redis.set('xiuxian:player:' + usr_qq + ':addiction_history', JSON.stringify(addictionHistory));
    
    // ==== 修改点结束 ====
    
    // 添加主要行动信息
    allMsgs.push(`开始沉迷${didian}，${time}分钟后归来！`);
    
    // 一次性发送所有消息
    e.reply(allMsgs.join('\n\n'));
    return false;
}
async Gojiutianshidi(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
     usr_qq = await channel(usr_qq);
    
    // 解析指令
    let didian = e.msg.replace('#沉迷九天十地', '').trim();
    let code = didian.split('*');
    didian = code[0].trim();
    let i = await convert2integer(code[1]);
    
    // 检查沉迷次数
    if (i > 12 || i < 1) {
        return e.reply('沉迷次数必须在1-12之间');
    }
    
    // 获取秘境信息
    const weizhi = data.jiutianshidi_list.find(item => item.name == didian);
    if (!weizhi) {
        return e.reply(`未找到地点：${didian}`);
    }
    
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
    
    // 获取玩家数据
    const player = await Read_player(usr_qq);
         // 检查是否已在目标地点
    if (player.power_place != 2.5) {
        return e.reply(`你不在九天十地`);
    }
    // 特殊地点境界检查
 // 特殊地点境界检查
    if (didian === "元天秘境" && player.xiangulevel_id > 7) {
        e.reply('元天秘境只有尊者境及以下的修士才能前往');
        return false;
    }
    
    // 计算资源消耗
    const basePrice = weizhi.Price * 10 * i;
    const baseShouyuan = weizhi.shouyuan * 10 * i;
    const baseexperience = weizhi.experience * 10 * i;
    // 检查资源是否足够
    if (player.灵石 < basePrice) {
        return e.reply(`没有灵石寸步难行，攒到${basePrice}灵石才够哦~`);
    }
    if (player.寿元 < baseShouyuan) {
        return e.reply(`道友这点寿元就不要去了吧，免得原地坐化了`);
    }
        if (player.修为 < baseexperience) {
        e.reply('道友的修为不足以前往');
        return false;
    }
    if (player.血气 < baseexperience) {
        e.reply('道友的血气不足以前往');
        return false;
    }
    // 检查秘境之匙
    const keyCount = await exist_najie_thing(usr_qq, '秘境之匙', '道具');
    if (!keyCount || keyCount < i) {
        return e.reply(`你需要${i}个秘境之匙才能沉迷此秘境`);
    }
    
    // ==== 真身沉迷逻辑 ====
    // 收集所有消息
    const allMsgs = [];

    
    // 扣除资源
    await Add_najie_thing(usr_qq, '秘境之匙', '道具', -i);
    await Add_寿元(usr_qq, -baseShouyuan);
    await Add_灵石(usr_qq, -basePrice);
    await Add_修为(usr_qq, -baseexperience);
    await Add_血气(usr_qq, -baseexperience);
    
    // 收集消耗信息
    let costInfo = `消耗：${baseShouyuan}寿元，${basePrice}灵石，${baseexperience}修为与血气，${i}个秘境之匙`;
    
    // 计算基础时间
    let baseTime = i * 10 * 10; // 基础时间（分钟）

    
    // 统一计算时间缩减效果
    const { timeReduction, msgs } = await calculateTimeReductionForAddiction(player, i);
    let time = baseTime - timeReduction;
    allMsgs.push(...msgs);
    

    
    // 添加时间减少汇总
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            `剩余时间：${time}分钟`,
        ].join('\n'));
    }
    
   
    
    // 添加消耗信息
    allMsgs.push(`${player.名号}${costInfo}`);
    
    // ==== 修改点：使用新的沉迷状态定义 ====
    
 // 计算每次结算的时间间隔（分钟）
    const intervalPerTime = time /(10*i);
    
    // 转换为毫秒
    const intervalMs = intervalPerTime * 60 * 1000;
    
    // 设置行动状态
    const arr = {
        action: '九天十地历练',
        start_time: new Date().getTime(), // 开始时间
        total_time: time, // 总时间（分钟）
        remaining_time: time, // 剩余时间（分钟）
        total_count: 10*i, // 总次数
        settled_count: 0, // 已结算次数
        interval: intervalMs, // 每次结算的时间间隔（毫秒）
        next_settle_time: new Date().getTime() + intervalMs, // 下一次结算时间
        shutup: '1',
        working: '1',
        Place_action: '1',
        Place_actionplus: '0',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // ==== 记录沉迷历史数据 ====
    const addictionHistory = {
        start_time: new Date().getTime(),
        location: weizhi.name,
        location_type: '九天十地',
        total_count: 10*i,
        settled_count: 0,
        death_count: 0,
        xiuwei_gained: 0,
        xueqi_gained: 0,
        items_gained: [],
        status: 'in_progress', // in_progress, completed
        end_time: null
    };
    
    // 保存到redis，用于后续查询
    await redis.set('xiuxian:player:' + usr_qq + ':addiction_history', JSON.stringify(addictionHistory));
    
    // ==== 修改点结束 ====
    
    // 添加主要行动信息
    allMsgs.push(`开始沉迷${didian}，${time}分钟后归来！`);
    
    // 一次性发送所有消息
    e.reply(allMsgs.join('\n\n'));
    return false;
}
async Gozhetian(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
     usr_qq = await channel(usr_qq);
    
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
    
    const player = await Read_player(usr_qq);
    let didian = e.msg.replace('#沉迷遮天位面', '').trim();
    let code = didian.split('*');
    didian = code[0].trim();
    let i = parseInt(code[1]) || 1; // 默认1次
         // 检查是否已在目标地点
    if (player.power_place != 2) {
        return e.reply(`你不在遮天位面`);
    }
    // 检查沉迷次数
    if (i < 1 || i > 12) {
        return e.reply('沉迷次数必须在1-12之间');
    }
    
    // 获取目标地点信息
    const weizhi = data.zhetian_list.find(item => item.name == didian);
    if (!weizhi) {
        return e.reply(`未找到地点：${didian}`);
    }
    
    // 基础时间计算
    let baseTime = i * 10 * 12; // 基础时间（分钟）
    
    // ==== 真身沉迷逻辑 ====
    // 收集所有消息
    const allMsgs = [];

    
    // ==== 天帝特权处理 ====
    if (player.di_wei == "天帝") {

        weizhi.Price = 0; // 天帝免费
        allMsgs.push([
            `【天帝巡视·万道臣服】`,
            `你为诸天共尊的天帝，此刻巡视寰宇！`,
            `万道臣服，邪祟避退，举世无人可阻！`,
        ].join('\n'));
    }
    
    // ==== 灵石检查 ====
    let basePrice = weizhi.Price * 10 * i;
    if (player.灵石 < basePrice) {
        return e.reply(`没有灵石寸步难行，攒到${basePrice}灵石才够哦~`);
    }
    
    // ==== 寿元检查 ====
    let baseShouyuan = weizhi.shouyuan * 10 * i;
    if (player.寿元 < baseShouyuan) {
        return e.reply('道友这点寿元就不要去了吧，免得原地坐化了');
    }
    
    // ==== 星域境界检查 ====
    if (weizhi.Grade === "星域" && player.mijinglevel_id < 12) {
        return e.reply(`你的秘境体系尚未达到圣人境，不具备星海遨游之力！`);
    }
        // ==== 星域境界检查 ====
    if (weizhi.Grade === "生命禁区" && player.mijinglevel_id < 12) {
        return e.reply(`你的秘境体系尚未达到圣人境，若是沉迷遮天位面的生命禁区将会是凶多吉少，念及此处你放弃了前往！`);
    }
    // ==== 秘境之匙检查 ====
    const keyCount = await exist_najie_thing(usr_qq, "秘境之匙", "道具");
    if (!keyCount || keyCount < i) {
        return e.reply(`你需要${i}个秘境之匙才能沉迷此秘境`);
    }
    

    
    // 计算基础资源消耗
    let baseExperience = weizhi.experience * 10 * i;
    
    // 实际消耗
    let actualPrice = basePrice;
    let actualExperience = baseExperience;
    let actualShouyuan = baseShouyuan;
        // 统一计算时间缩减效果
    let { timeReduction, msgs } = await calculateTimeReductionForAddiction(player, i);
           
    allMsgs.push(...msgs);
    // 生命禁区特殊处理
    if (weizhi.Grade === "生命禁区") {
        let adjustMsg = "";
        
    // 使用 actualExperience 而不是新建变量
    switch (player.灵根.type) {
        case "大成圣体":
            actualExperience = 0;
            timeReduction+=2*10*i;
            adjustMsg = "你为大成圣体，气吞山河君临天下，万邪不侵！";
            break;
        case "大成霸体":
            actualExperience = 0;
             timeReduction+=2*10*i;
            adjustMsg = "你为大成霸体，气吞山河君临天下，万邪不侵！";
            break;    
        case "小成圣体":
            actualExperience = Math.ceil(actualExperience / 2);
            adjustMsg = "你为小成圣体，血气如龙，堪比古之圣人！";
            break;
        case "圣体":
            actualExperience = Math.ceil(actualExperience * 0.77);
            adjustMsg = "你为人族圣体，拥有超越常人的体魄！";
            break;
        case "命运":
        case "天魔":
            actualExperience = 0;
            adjustMsg = "你为超脱者，三界六道皆在掌控！";
            break;
        case "圣体道胎":
            actualExperience = 0;
             timeReduction+=3*10*i;
            adjustMsg = "万道共鸣！圣体道胎先天立于不败之地！";
            break;
        case "混沌圣体道胎":
            actualExperience = 0;
            timeReduction+=4*10*i;
            adjustMsg = "混沌初开，万道共鸣！圣体道胎先天立于不败之地！";
            break;    
        case "大道体":
            actualExperience = Math.ceil(actualExperience * 0.3);
             timeReduction+=1*10*i;
            adjustMsg = "身与道合，言出法随！大道体血脉中流淌着大道印记！";
            break;
        default:
            adjustMsg = "作为普通体质，你需以修为血气为代价！";
    }
    

        if (adjustMsg) {
            allMsgs.push(adjustMsg);
        }
        
        // 不死神泉效果
        if (await exist_najie_thing(usr_qq, "不死神泉", "道具")) {
            actualExperience = Math.ceil(actualExperience * 0.8);
            allMsgs.push("饮下不死神泉，生命禁区的诅咒与道则压制大幅减弱！");
            await Add_najie_thing(usr_qq, "不死神泉", "道具", -1);
        }
        
        // 检查修为和血气是否足够
        if (player.修为 < actualExperience) {
            return e.reply(`你需要积累${actualExperience}修为，才能抵抗生命禁区！`);
        }
        if (player.血气 < actualExperience) {
            return e.reply(`你需要积累${actualExperience}血气，才能抵抗生命禁区！`);
        }
    }
    

    
    // 应用时间减少
    
     let time = baseTime - timeReduction;
    // 添加时间减少汇总
    if (timeReduction > 0) {
        allMsgs.push([
            `【时间缩减】`,
            `总计减少：${timeReduction}分钟`,
            `剩余时间：${time}分钟`,
        ].join('\n'));
    }
    
    // 扣除资源
    await Add_najie_thing(usr_qq, "秘境之匙", "道具", -i);
    await Add_寿元(usr_qq, -actualShouyuan);
    await Add_灵石(usr_qq, -actualPrice);
    await Add_修为(usr_qq, -actualExperience);
    await Add_血气(usr_qq, -actualExperience);
    
    // 收集消耗信息
    let costInfo = `消耗：${actualShouyuan}寿元`;
    if (actualPrice > 0) {
        costInfo += `，${actualPrice}灵石`;
    }
    if (actualExperience > 0) {
        costInfo += `，${actualExperience}修为，${actualExperience}血气`;
    }
    costInfo += `，${i}个秘境之匙`;
    
    allMsgs.push(`${player.名号}${costInfo}`);
    

    
    // ==== 修改点：使用新的沉迷状态定义 ====
    
  // 计算每次结算的时间间隔（分钟）
    const intervalPerTime = time /(10*i);
    
    // 转换为毫秒
    const intervalMs = intervalPerTime * 60 * 1000;
    
    // 设置行动状态
    const arr = {
        action: '遮天位面历练',
        start_time: new Date().getTime(), // 开始时间
        total_time: time, // 总时间（分钟）
        remaining_time: time, // 剩余时间（分钟）
        total_count: 10*i, // 总次数
        settled_count: 0, // 已结算次数
        interval: intervalMs, // 每次结算的时间间隔（毫秒）
        next_settle_time: new Date().getTime() + intervalMs, // 下一次结算时间
        shutup: '1',
        working: '1',
        Place_action: '1',
        Place_actionplus: '0',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // ==== 记录沉迷历史数据 ====
    const addictionHistory = {
        start_time: new Date().getTime(),
        location: weizhi.name,
        location_type: '遮天位面',
        total_count: 10*i,
        settled_count: 0,
        death_count: 0,
        xiuwei_gained: 0,
        xueqi_gained: 0,
        items_gained: [],
        status: 'in_progress', // in_progress, completed
        end_time: null
    };
    
    // 保存到redis，用于后续查询
    await redis.set('xiuxian:player:' + usr_qq + ':addiction_history', JSON.stringify(addictionHistory));
    
    // ==== 修改点结束 ====
    
    // 添加主要行动信息
    allMsgs.push(`开始沉迷${didian}，${time}分钟后归来！`);
    
    // 一次性发送所有消息
    e.reply(allMsgs.join('\n\n'));
    return false;
}
async Goforbiddenarea(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
     usr_qq = await channel(usr_qq);
    
    // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
    
    const player = await Read_player(usr_qq);
    const msg = e.msg.replace('#沉迷禁地', '').trim();
    const parts = msg.split('*');
    const didian = parts[0].trim();
    const i = parseInt(parts[1]) || 1; // 默认1次
    
    // 检查沉迷次数
    if (i < 1 || i > 12) {
        return e.reply('沉迷次数必须在1-12之间');
    }
    
    // 获取禁地信息
    const weizhi = data.forbiddenarea_list.find(item => item.name == didian);
    if (!weizhi) {
        return e.reply(`未找到禁地：${didian}`);
    }
    
    // 检查等级要求
    const now_level_id = data.Level_list.find(
        item => item.level_id == player.level_id
    ).level_id;
    
    if (now_level_id < 22) {
        return e.reply('没有达到化神之前还是不要去了');
    }
    if (didian == '诸神黄昏·旧神界' && now_level_id < 46) {
        return e.reply('没有达到金仙之前还是不要去了');
    }
    if (didian == '始源·混沌初开之地' && now_level_id < 64) {
        return e.reply('没有达到无境之前还是不要去了');
    }
    
    // 收集所有消息
    const allMsgs = [];

    
    // 计算基础资源消耗
    let basePrice = weizhi.Price * 10 * i;
    let baseShouyuan = weizhi.shouyuan * 10 * i;
    let baseExperience = weizhi.experience * 10 * i;
    
    // 检查资源是否足够
    if (player.灵石 < basePrice) {
        return e.reply(`没有灵石寸步难行，攒到${basePrice}灵石才够哦~`);
    }
    if (player.寿元 < baseShouyuan) {
        return e.reply('道友这点寿元就不要去了吧，免得原地坐化了');
    }
    if (player.修为 < baseExperience) {
        return e.reply(`你需要积累${baseExperience}修为，才能抵抗禁地魔气！`);
    }
    
    // 检查秘境之匙
    const keyCount = await exist_najie_thing(usr_qq, '秘境之匙', '道具');
    if (!keyCount || keyCount < i) {
        return e.reply(`你需要${i}个秘境之匙才能沉迷此禁地`);
    }
    
    // 统一计算时间缩减效果
    const { timeReduction, msgs } = await calculateTimeReductionForAddiction(player, i);

    allMsgs.push(...msgs);
    
    // 计算基础时间
    let baseTime = i * 10 * 7; // 基础时间（分钟）
    let time = baseTime - timeReduction;
    
    // 添加时间减少汇总
    if (timeReduction > 0) {
        allMsgs.push(`总计减少时间：${timeReduction}分钟`);
        allMsgs.push(`剩余时间：${time}分钟`);
    }
    
    // 扣除资源
    await Add_najie_thing(usr_qq, '秘境之匙', '道具', -i);
    await Add_寿元(usr_qq, -baseShouyuan);
    await Add_灵石(usr_qq, -basePrice);
    await Add_修为(usr_qq, -baseExperience);
    
    // 收集消耗信息
    const costInfo = `消耗：${baseShouyuan}寿元，${basePrice}灵石，${baseExperience}修为，${i}个秘境之匙`;
    allMsgs.push(`${player.名号}${costInfo}`);
    
    // ==== 修改点：使用新的沉迷状态定义 ====
    
  // 计算每次结算的时间间隔（分钟）
    const intervalPerTime = time /(10*i);
    
    // 转换为毫秒
    const intervalMs = intervalPerTime * 60 * 1000;
    
    // 设置行动状态
    const arr = {
        action: '禁地历练',
        start_time: new Date().getTime(), // 开始时间
        total_time: time, // 总时间（分钟）
        remaining_time: time, // 剩余时间（分钟）
        total_count: 10*i, // 总次数
        settled_count: 0, // 已结算次数
        interval: intervalMs, // 每次结算的时间间隔（毫秒）
        next_settle_time: new Date().getTime() + intervalMs, // 下一次结算时间
        shutup: '1',
        working: '1',
        Place_action: '1',
        Place_actionplus: '0',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // ==== 记录沉迷历史数据 ====
    const addictionHistory = {
        start_time: new Date().getTime(),
        location: weizhi.name,
        location_type: '禁地',
        total_count: 10*i,
        settled_count: 0,
        death_count: 0,
        xiuwei_gained: 0,
        xueqi_gained: 0,
        items_gained: [],
        status: 'in_progress', // in_progress, completed
        end_time: null
    };
    
    // 保存到redis，用于后续查询
    await redis.set('xiuxian:player:' + usr_qq + ':addiction_history', JSON.stringify(addictionHistory));
    
    // ==== 修改点结束 ====
    
    // 根据禁地类型添加特殊描述
    let locationDesc = "";
    switch (didian) {
        case "诸神黄昏·旧神界":
            locationDesc = "此地曾是神界战场，神血染红大地，神骨铺就道路，空气中弥漫着神魔陨落的哀鸣。";
            break;
        case "始源·混沌初开之地":
            locationDesc = "混沌初开之地，万物起源之所，大道法则在此交织碰撞，形成无数奇观异象。";
            break;
        case "幽冥血海":
            locationDesc = "血海无边，怨魂哀嚎，此地汇聚了世间最深的怨念与诅咒，非大能者不可入。";
            break;
        case "九幽魔渊":
            locationDesc = "魔气滔天，万魔蛰伏，此地是魔道修士的圣地，也是正道修士的噩梦。";
            break;
        case "荒古禁地":
            locationDesc = "荒古禁地蕴含无尽诅咒，万古以来无数强者陨落于此，但也藏着上古秘宝。";
            break;
        default:
            locationDesc = "禁地之中危机四伏，但也蕴藏着无尽机缘，祝道友沉迷顺利！";
    }
    allMsgs.push(locationDesc);
    
    // 添加主要行动信息
    allMsgs.push(`开始沉迷${didian}，${time}分钟后归来！`);
    
    // 一次性发送所有消息
    e.reply(allMsgs.join('\n'));
    return false;
}
async Gofairyrealm(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 消息收集器
    let messages = [];
    
    // 检查是否可以前往
    let flag = await Go(e);
    if (!flag) {
        return false;
    }
    
    // 解析指令
    let didian = e.msg.replace('#沉迷仙境', '').trim();
    let code = didian.split('*');
    didian = code[0].trim();
    let i = parseInt(code[1]) || 1; // 默认1次
    
    // 检查沉迷次数
    if (i < 1 || i > 12) {
        return e.reply('沉迷次数必须在1-12之间');
    }
    
    // 获取仙境信息
    let weizhi = data.Fairyrealm_list.find(item => item.name == didian);
    if (!weizhi) {
        return e.reply(`未找到仙境：${didian}`);
    }
    
    // 获取玩家数据
    let player = await Read_player(usr_qq);
    
    // 检查是否已在目标地点
    if (player.power_place != 1) {
        return e.reply(`你不在仙界`);
    }
    
    // 检查等级要求
    let now_level_id = data.Level_list.find(
        item => item.level_id == player.level_id
    ).level_id;

    if (now_level_id < 42 && player.lunhui == 0) {
        return e.reply('轮回未启，仙境难入');
    }
    if (didian == "杀神崖" && now_level_id < 50) {
        return e.reply('没有达到究极仙王之前还是不要去了');
    }
    if (didian == "诸天") {
        if (player.灵根.name !== "九转轮回体" && player.灵根.name !== "命运神道体" && player.灵根.type !== "神魔体") {
            return e.reply([
                `【轮回者专属】`,
                `诸天乃轮回之地，`,
                `只有真正圆满的轮回者方可踏足！`,
                `道友轮回未达圆满，无法进入。`,
            ].join('\n'));
        }
    }

    // 真魔殿检查
    if (didian == "真魔殿") {
        if (player.灵根.name !== "九重魔功" && player.灵根.name !== "极道天魔" && player.灵根.type !== "神魔体") {
            return e.reply([
                `【真魔专属】`,
                `真魔殿乃万魔朝圣之地，`,
                `只有真正极致之魔才能踏足！`,
                `道友魔中巨擘，无法进入。`,
            ].join('\n'));
        }
    }

    // 光阴之外检查
    if (didian == "光阴之外") {
        if (player.灵根.type !== "命运" && player.灵根.type !== "天魔" && player.灵根.type !== "神魔体") {
            return e.reply([
                `【超脱者专属】`,
                `光阴之外乃超越极限之地，`,
                `只有真正的超脱者才能踏足！`,
                `道友非超脱者，无法进入。`,
            ].join('\n'));
        }
    }
    
    // 计算资源消耗
    let basePrice = weizhi.Price * 10 * i;
    let baseShouyuan = weizhi.shouyuan * 10 * i;
    
    // 检查资源是否足够
    if (player.灵石 < basePrice) {
        return e.reply(`没有灵石寸步难行，攒到${basePrice}灵石才够哦~`);
    }
    if (player.寿元 < baseShouyuan) {
        return e.reply('道友这点寿元就不要去了吧，免得原地坐化了');
    }
    
    // 检查秘境之匙
    let keyCount = await exist_najie_thing(usr_qq, '秘境之匙', '道具');
    if (!keyCount || keyCount < i) {
        return e.reply(`你需要${i}个秘境之匙才能沉迷此仙境`);
    }
    
    // 特殊仙境检查
    let specialMsg = "";
    let specialCost = "";

if (didian === "往世星海") {
    const requiredKeys = i * 5;           // 每次消耗 5 枚，可随 i 叠加
    const keyCount = await exist_najie_thing(usr_qq, "群星秘钥", "道具");
    if (!keyCount || keyCount < requiredKeys) {
        return e.reply(`你需要${requiredKeys}个群星秘钥才能前往往世星海`);
    }
    if (player.level_id <= 54) {
        return e.reply("只有万界道祖级强者才能踏入星海");
    }
    await Add_najie_thing(usr_qq, "群星秘钥", "道具", -requiredKeys);
    specialMsg = `${player.名号}消耗了${requiredKeys}个群星秘钥，神魂受到无瑕之刻印指引，脱离万界遨游混沌海前往往世星海`;
    specialCost = `，${requiredKeys}个群星秘钥`;
}


    if (didian === "神域星宫") {
        const requiredTokens = i * 10;
        let shenyuCount = await exist_najie_thing(usr_qq, "神域令牌", "道具");
        if (!shenyuCount || shenyuCount < requiredTokens) {
            return e.reply(`你需要${requiredTokens}个神域令牌才能前往神域星宫`);
        }
        if (player.level_id <= 54) {
            return e.reply("只有万界道祖级强者才能前往天外天");
        }
        await Add_najie_thing(usr_qq, "神域令牌", "道具", -requiredTokens);
        specialMsg = `${player.名号}消耗了${requiredTokens}个神域令牌，神魂受到神域主宰感召指引，脱离万界遨游混沌海前往神域星宫`;
        specialCost = `,${requiredTokens}个神域令牌`;
    }
    
    // 瑞泽云海
    if (didian === "瑞泽云海") {
        const requiredShips = i * 10;
        let xianzhouCount = await exist_najie_thing(usr_qq, "仙舟", "道具");
        if (!xianzhouCount || xianzhouCount < requiredShips) {
            return e.reply(`你需要${requiredShips}艘仙舟才能前往瑞泽云海`);
        }
        await Add_najie_thing(usr_qq, "仙舟", "道具", -requiredShips);
        specialMsg = `${player.名号}乘坐仙舟前往瑞泽云海寻找仙兽们留下的福泽`;
        specialCost = `，${requiredShips}艘仙舟`;
    }
    
    // 仙界矿场
    if (didian === "仙界矿场") {
        const requiredTickets = i;
        let dagongCount = await exist_najie_thing(usr_qq, "打工券", "道具");
        if (!dagongCount || dagongCount < requiredTickets) {
            return e.reply(`你需要${requiredTickets}张打工券才能前往仙界矿场`);
        }
        await Add_najie_thing(usr_qq, "打工券", "道具", -requiredTickets);
        specialMsg = `${player.名号}消耗了${requiredTickets}张打工券，开始前往苦逼打工`;
        specialCost = `，${requiredTickets}张打工券`;
    }
    
    // 扣除资源
    await Add_najie_thing(usr_qq, '秘境之匙', '道具', -i);
    await Add_寿元(usr_qq, -baseShouyuan);
    await Add_灵石(usr_qq, -basePrice);
    
    // 收集消耗信息
    let costInfo = `消耗：${baseShouyuan}寿元，${basePrice}灵石，${i}个秘境之匙${specialCost}`;
    
    // 计算基础时间
    let baseTime = i * 10 * 7; // 基础时间（分钟）

    // 统一计算时间缩减效果
    const { timeReduction, msgs } = await calculateTimeReductionForAddiction(player, i);
    let time = baseTime - timeReduction;
    messages.push(...msgs);
    
    // 计算每次结算的时间间隔（分钟）
    const intervalPerTime = time / (10 * i);
    
    // 转换为毫秒
    const intervalMs = intervalPerTime * 60 * 1000;
    
    // 设置行动状态
    let arr = {
        action: '镇守仙境',
        start_time: new Date().getTime(), // 开始时间
        total_time: time, // 总时间（分钟）
        remaining_time: time, // 剩余时间（分钟）
        total_count: 10 * i, // 总次数
        settled_count: 0, // 已结算次数
        interval: intervalMs, // 每次结算的时间间隔（毫秒）
        next_settle_time: new Date().getTime() + intervalMs, // 下一次结算时间
        shutup: '1',
        working: '1',
        Place_action: '1',
        Place_actionplus: '0',
        power_up: '1',
        mojie: '1',
        xijie: '1',
        plant: '1',
        mine: '1',
        Place_address: weizhi,
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    
    // ==== 记录沉迷历史数据 ====
    const addictionHistory = {
        start_time: new Date().getTime(),
        location: weizhi.name,
        location_type: '仙境',
        total_count: 10*i,
        settled_count: 0,
        death_count: 0,
        xiuwei_gained: 0,
        xueqi_gained: 0,
        items_gained: [],
        status: 'in_progress', // in_progress, completed
        end_time: null
    };
    
    // 保存到redis，用于后续查询
    await redis.set('xiuxian:player:' + usr_qq + ':addiction_history', JSON.stringify(addictionHistory));
    
    // ==== 修改点结束 ====
    
    // 添加时间减少信息
    let timeMsg = "";
    if (timeReduction > 0) {
        timeMsg = `（时间减少${timeReduction}分钟，从${baseTime}分钟减少到${time}分钟）`;
    }

    // 收集所有消息
    if (specialMsg) messages.push(specialMsg);
    messages.push(`${player.名号}${costInfo}`);
    messages.push(`开始沉迷${didian}，${time}分钟后归来！${timeMsg}`);
    
    // 根据仙境类型添加特殊描述
    let locationDesc = "";
    switch (didian) {
        case "神域星宫":
            locationDesc = "神域星宫悬浮于混沌海之上，是诸天万界至高无上的存在，镇守此地可获得神域主宰的恩赐。";
            break;
        case "瑞泽云海":
            locationDesc = "瑞泽云海曾是仙兽栖息之地，祥云缭绕，瑞气千条，曾有道友有幸获得过仙兽福泽。";
            break;
        case "瑶池仙境":
            locationDesc = "瑶池仙境仙气缭绕，琼楼玉宇，镇守此地可沐浴仙光，洗涤凡尘。";
            break;
        case "蓬莱仙岛":
            locationDesc = "蓬莱仙岛隐于东海，仙草遍地，灵泉涌动，镇守此地可感悟长生之道。";
            break;
        default:
            locationDesc = "仙境之中灵气充沛，是修行悟道的绝佳之地，祝道友镇守顺利！";
    }
    messages.push(locationDesc);
    
    e.reply(messages.join("\n"));
    return true;
  }

  // 沉迷收获功能
  async CheckAddictionHarvest(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
     usr_qq = await channel(usr_qq);
    
    // 获取沉迷历史数据
    const addictionHistory = await redis.get('xiuxian:player:' + usr_qq + ':addiction_history');
    
    if (!addictionHistory) {
      return e.reply('暂无沉迷记录，请先进行沉迷活动');
    }
    
    const history = JSON.parse(addictionHistory);
    
    // 格式化时间
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };
    
    // 构建收获信息
    let harvestMsg = [
      `【沉迷收获详情】`,
      `沉迷地点：${history.location}`,
      `地点类型：${history.location_type}`,
      `沉迷次数：${history.settled_count}/${history.total_count}`,
      `死亡次数：${history.death_count}`,
      `获得修为：${history.xiuwei_gained.toLocaleString()}`,
      `获得血气：${history.xueqi_gained.toLocaleString()}`,
      `开始时间：${formatTime(history.start_time)}`,
    ];
    
    // 添加结束时间
    if (history.end_time) {
      harvestMsg.push(`结束时间：${formatTime(history.end_time)}`);
      
      // 计算持续时间
      const duration = history.end_time - history.start_time;
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      harvestMsg.push(`持续时间：${hours}小时${minutes}分钟`);
    } else {
      harvestMsg.push(`结束时间：进行中...`);
    }
    
    // 添加状态
    const statusText = history.status === 'completed' ? '已完成' : '进行中';
    harvestMsg.push(`状态：${statusText}`);
    
    // 添加获得的道具
    if (history.items_gained && history.items_gained.length > 0) {
      harvestMsg.push(`获得物品：`);
      history.items_gained.forEach((item, index) => {
        harvestMsg.push(`   ${index + 1}. [${item.name}] x${item.count}`);
      });
    } else {
      harvestMsg.push(`获得道具：暂无记录`);
    }
    
    
    // 如果沉迷已完成，提供删除选项
    if (history.status === 'completed') {
      harvestMsg.push(`提示：可以发送"#清除沉迷记录"来清除本次记录`);
    }
    
    e.reply(harvestMsg.join('\n'));
    return false;
  }

  // 清除沉迷记录功能
  async ClearAddictionHistory(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
     usr_qq = await channel(usr_qq);
    
    // 获取沉迷历史数据
    const addictionHistory = await redis.get('xiuxian:player:' + usr_qq + ':addiction_history');
    
    if (!addictionHistory) {
      return e.reply('暂无沉迷记录可清除');
    }
    
    const history = JSON.parse(addictionHistory);
    
    // 只有已完成的沉迷才能清除
    if (history.status !== 'completed') {
      return e.reply('沉迷活动尚未完成，无法清除记录');
    }
    
    // 清除记录
    await redis.del('xiuxian:player:' + usr_qq + ':addiction_history');
    
    e.reply(`已清除沉迷记录：${history.location}（${history.location_type}）`);
    return false;
  }
}
/**
 * 统一计算时间缩减效果
 * @param {Object} player 玩家对象
 * @param {number} i 沉迷次数
 * @returns {Object} 包含时间缩减值和消息数组的对象
 */
async function calculateTimeReductionForAddiction(player, i) {
    let timeReduction = 0;
    const msgs = [];
    
    // 检查玩家是否拥有行字秘
    const hasXingziMi = player.学习的功法.includes('行字秘');
    
    // 检查玩家是否拥有天璇步法（且没有行字秘）
    const hasTianxuanBufa = !hasXingziMi && player.学习的功法.includes('天璇步法');
    
    // 行字秘效果（优先级最高）
    if (hasXingziMi) {
        let reduction = 2 * 10 * i;
        const xingziTexts = [
            `【行字秘·极速奥义】`,
            `足下道纹流转，身形如电穿梭`,
            `行字秘运转间：`,
            `- 步伐玄妙，缩地成寸`,
            `- 身形飘忽，难觅踪迹`
        ];

        // 根据境界增强效果
        if (player.mijinglevel_id >= 9) {
            reduction += 1 * 10 * i;
            xingziTexts.push(`脚下金莲隐现，速度更上一层`);
        }
        if (player.mijinglevel_id >= 16) {
            reduction += 1 * 10 * i;
            xingziTexts.push(`时光碎片缭绕，触及时间领域`);
        }

        xingziTexts.push(
            `"天下极速，唯我行字！"`,
            `时间减少${reduction}分钟`
        );
        timeReduction += reduction;
        msgs.push(xingziTexts.join('\n'));
    }
    // 天璇步法效果（只在没有行字秘时触发）
    else if (hasTianxuanBufa) {
        const reduction = 1 * 10 * i;
        const tianxuanTexts = [
            `【天璇步法·残篇奥义】`,
            `足下道纹流转，身形如烟似幻`,
            `步罡踏斗间：`,
            `- 缩地成寸，山河倒转如浮光掠影`,
            `- 残影留空，十步之外难辨真身`,
            `"天璇遗韵，乾坤挪移！"`,
            `时间减少${reduction}分钟（残缺秘法，未达极速真谛）`
        ];
        timeReduction += reduction;
        msgs.push(tianxuanTexts.join('\n'));
    }

    // 道法仙术效果（独立触发）
    if (player.daofaxianshu == 2) {
        const reduction = 2 * 10 * i;
        timeReduction += reduction;
        msgs.push(`【道法仙术】天地道则加持，时间减少${reduction}分钟`);
    }

    return { timeReduction, msgs };
}