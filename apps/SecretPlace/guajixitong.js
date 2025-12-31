import { plugin, verc, data } from '../../api/api.js';
import {
  Read_player,
  existplayer,
  Write_player,
  isNotNull,
  sleep,
  exist_najie_thing,
  Go,
  Add_najie_thing,
  Add_职业经验,
  get_log_img,
  convert2integer,
  Add_灵石,
  Add_修为,
  Goweizhi,
  channel
} from '../../model/xiuxian.js';
export class guajixitong extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_guajixitong',
      dsc: '修仙模块挂机系统',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#凝聚道宫神祇$',
          fnc: 'shenqi',
        },
        {
          reg: '^#凝聚洞天灵身$',
          fnc: 'lingshen',
        },
        {
          reg: '^#凝聚意志化身$',
          fnc: 'huashen',
        },
         {
          reg: '^#凝聚无上法身$',
          fnc: 'fashen',
        },
        {
        reg: '^#神祇代行(采药|采矿|狩猎|寻源|地脉引气|寻脉定源)',
        fnc: 'shenqidaixing',
        },
        {
         reg: '^#结束神祇代行$',
         fnc: 'shenqi_jiesuan',
        },
        {
          reg: '^#灵身代行(采药|采矿|狩猎|寻源|地脉引气|寻脉定源)',
          fnc: 'lingshendaixing',
        },
        {
         reg: '^#结束灵身代行$',
         fnc: 'lingshen_jiesuan',
        },
                {
         reg: '^#清除神祇$',
         fnc: 'qingchushenqi',
        },
      ],
    });
  }
// 神祇代行结算函数
async qingchushenqi(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 检查是否有账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('请先创建角色');
        return;
    }
    
    let player = await Read_player(usr_qq);
    if (!player.神祇 || player.神祇 < 1) {
        e.reply('你都没有道宫神祇');
        return;
    }
    
    // 清除代行任务
    await redis.del('xiuxian:player:' + usr_qq + ':shenqiaction');
    e.reply('清除完成');
    return true;
}
  async shenqi(e) {
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
    if (player.mijinglevel_id < 6) {
        e.reply('你还没有开辟道宫神藏，无法凝聚道宫神祇');
        return;
    }
    if (player.神祇&&player.神祇 ==1 ) {
        e.reply('你已经具有神祇了');
        return;
    }
            if (player.修为 < 20000000) {
        e.reply('修为不足');
        return;
    }
            if (player.血气 < 20000000) {
        e.reply('血气不足');
        return;
    }
    player.修为 -=20000000;
    player.血气 -=20000000;
    player.神祇 =1;
    await Write_player(usr_qq, player);
      e.reply([
        `神祇凝练成功`,
        `耗费两千万修为与血气，于五大神藏中凝聚出神祇`,
        `道宫中逝我，道我，真我的诵经声震彻轮海`,
        `自此可得神祇相助，代行秘境！`,
        `当前修为：${player.修为.toLocaleString()}`,
        `当前血气：${player.血气.toLocaleString()}`
    ].join('\n'));
    return false;
  }
    async lingshen(e) {
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
     if (player.xiangulevel_id < 3) {
        e.reply('洞天未开，神曦不显！需达洞天境方可凝聚灵身');
        return;
    }
    if (player.灵身 && player.灵身 == 1) {
        e.reply('洞天之中已有灵身盘坐，可代行诸事');
        return;
    }
        if (player.修为 < 20000000) {
        e.reply('修为不足');
        return;
    }
            if (player.血气 < 20000000) {
        e.reply('血气不足');
        return;
    }
    player.修为 -= 20000000;
    player.血气 -= 20000000;
    player.灵身 = 1;
    await Write_player(usr_qq, player);
    e.reply([
        `洞天灵身·初成`,
        `——————————————`,
        `耗费两千万修为血气，于洞天秘境中`,
        `以原始符文凝聚出第一尊灵身`,
        `此灵身可代行诸事，参悟宝术`,
        `当前修为：${player.修为.toLocaleString()}`,
        `当前血气：${player.血气.toLocaleString()}`
    ].join('\n'));
    
    return true;
}
async huashen(e) {
    if (!e.isGroup) {
        e.reply('仙路争锋，当在群雄论道之所！请移步群聊开启修行');
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('轮回中未见汝之道痕，请以「#踏入仙途」铸就道基');
        return;
    }
    
    let player = await Read_player(usr_qq);
    if (player.xiangulevel_id < 14 && player.mijinglevel_id < 16) {
        e.reply('未至人道绝巅，难凝意志化身！需达至尊境或大帝领域');
        return;
    }
    if (player.化身 && player.化身 == 1) {
        e.reply('已有化身行走世间，或为逝我，或为道身');
        return;
    }
            if (player.修为 < 20000000) {
        e.reply('修为不足');
        return;
    }
            if (player.血气 < 20000000) {
        e.reply('血气不足');
        return;
    }
    // 消耗修为与血气
    player.修为 -= 20000000;
    player.血气 -= 20000000;
    player.化身 = 1;
    
    await Write_player(usr_qq, player);
    e.reply([
        `意志化身·凝成`,
        `耗费两千万修为与血气，于仙台秘境中`,
        `斩出第一尊意志化身`,
        `此化身可：`,
        `• 代本体行走诸天万界`,
        `• 参悟不同大道法则`,
        `• 镇守一方星域道统`,
        `《完美世界》洞天养灵身，十洞天圆满`,
        `《遮天》仙台斩道我，九重天登顶`,
        `《圣墟》映照诸天身，横渡轮回海`,
        `当前修为：${player.修为.toLocaleString()}`,
        `当前血气：${player.血气.toLocaleString()}`
    ].join('\n'));
    return true;
}
async fashen(e) {
    if (!e.isGroup) {
        e.reply('仙路尽头谁为峰？当在诸天论道之地共证不朽！');
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('时光长河未见汝之印记，请以「#踏入仙途」铸就道基');
        return;
    }
    
    let player = await Read_player(usr_qq);
    if (player.xiangulevel_id < 18 && player.mijinglevel_id < 20) {
        e.reply('未证道祖果位，难凝不朽法身！需达准仙帝领域');
        return;
    }
    if (player.法身 && player.法身 >= 1) {
        e.reply('已有法身行走诸天，一念可映照万古轮回');
        return;
    }
            if (player.纪元积累&&player.纪元积累 < 10) {
        e.reply('纪元积累不足');
        return;
    }
    player.纪元积累 -= 10;
    player.法身 = 1;
    
    await Write_player(usr_qq, player);
    e.reply([
        `不朽法身·凝成`,
        `耗费十点纪元积累，于时光长河尽头`,
        `斩出第一具不朽法身`,
        `此法身可：`,
        `横渡界海，征战黑暗源头`,
        `俯瞰诸天，镇压一个纪元`,
        `开辟新修炼体系，教化万灵`,
        `当前修为：${player.修为.toLocaleString()}`,
        `当前血气：${player.血气.toLocaleString()}`
    ].join('\n'));
    return true;
}
// async shenqidaixing(e) {
//     if (!e.isGroup) {
//         e.reply('仙路尽头谁为峰？当在诸天论道之地共证不朽！');
//         return;
//     }
    
//     let usr_qq = e.user_id.toString().replace('qg_', '');
//     let ifexistplay = await existplayer(usr_qq);
//     if (!ifexistplay) {
//         e.reply('时光长河未见汝之印记，请以「#踏入仙途」铸就道基');
//         return;
//     }
    
//     let player = await Read_player(usr_qq);
//     if (player.神祇&&player.神祇<1 ) {
//         e.reply('你没有道宫神祇');
//         return;
//     }
//     const time = 2880; 
//     let action_time = 60000 * time; //持续时间，单位毫秒
//     let arr = {
//       shenqiaction: '寻找机缘', //动作
//       end_time: new Date().getTime() + action_time, //结束时间
//       time: action_time, //持续时间
//       shenqidaixing:0
//     };
//     if (e.isGroup) {
//       arr.group_id = e.group_id;
//     }
//     await redis.set('xiuxian:player:' + usr_qq + ':shenqiaction', JSON.stringify(arr));
//       e.reply([
//         `神祇代行启程`,
//         `代行任务：寻找机缘、采集灵物、镇压妖魔`,
//         `最大代行时间:2天`
//     ].join('\n'));
//     await Write_player(usr_qq, player);

//     return true;
// }
async shenqidaixing(e) {
    if (!e.isGroup) {
        e.reply('仙路尽头谁为峰？当在诸天论道之地共证不朽！');
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('时光长河未见汝之印记，请以「#踏入仙途」铸就道基');
        return;
    }
    
    let player = await Read_player(usr_qq);
    if (!player.神祇 || player.神祇 < 1) {
        e.reply('你没有道宫神祇');
        return;
    }
    
    // 解析任务类型
    const taskType = e.msg.match(/采药|采矿|狩猎|寻源|地脉引气|寻脉定源/)[0];
    // 职业验证
    let requiredOccupation = '';
    switch(taskType) {
        case '采药':
            requiredOccupation = '采药师';
            break;
        case '采矿':
            requiredOccupation = '采矿师';
            break;
        case '狩猎':
            requiredOccupation = '猎户';
            break;
        case '寻源':
            requiredOccupation = '源师';
            break;
        case '地脉引气':
            requiredOccupation = '源地师';
            break;
        case '寻脉定源':
            requiredOccupation = '源天师';
            break;
    }
    
    // 检查职业是否符合要求
    if (requiredOccupation && player.occupation !== requiredOccupation) {
        let occupationName = '';
        switch(requiredOccupation) {
            case '采药师':
                occupationName = '采药师';
                break;
            case '采矿师':
                occupationName = '采矿师';
                break;
            case '猎户':
                occupationName = '猎户';
                break;
            case '源师':
                occupationName = '源师';
                break;
            case '源地师':
                occupationName = '源地师';
                break;
            case '源天师':
                occupationName = '源天师';
                break;

        }
        
        e.reply(`你当前并非${occupationName}，无法让神祇进行${taskType}任务`);
        return;
    }
    // 解析时间参数
    let timeInput = e.msg.replace(`#神祇代行${taskType}`, '').trim();
    let time = 0;
    
    if (timeInput.includes('分钟')) {
        time = parseInt(timeInput.replace('分钟', ''));
    } else if (timeInput.includes('小时')) {
        time = parseInt(timeInput.replace('小时', '')) * 60;
    } else if (timeInput.includes('天')) {
        time = parseInt(timeInput.replace('天', '')) * 1440;
    } else {
        // 默认代行时间
        time = 120; // 2小时
    }
    
    // 限制最大代行时间
    const maxTime = 2880; // 2天
    if (time > maxTime) {
        time = maxTime;
        e.reply('神祇代行时间不能超过2天，已自动设置为2天');
    }
    
    // 检查是否已有代行任务
    let shenqiaction = await redis.get('xiuxian:player:' + usr_qq + ':shenqiaction');
    if (shenqiaction) {
        shenqiaction = JSON.parse(shenqiaction);
        if (shenqiaction.end_time > new Date().getTime()) {
            let remaining = shenqiaction.end_time - new Date().getTime();
            let minutes = Math.floor(remaining / 60000);
            let hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            
            e.reply(`神祇正在执行${shenqiaction.taskType}任务中，剩余时间: ${hours}小时${minutes}分钟`);
            return;
        }
    }
    
// 在设置神祇代行任务时
let action_time = time * 60 * 1000; // 持续时间，单位毫秒
let currentTime = Date.now();
let arr = {
    taskType: taskType, // 任务类型
    start_time: currentTime, // 添加开始时间
    end_time: currentTime + action_time, // 结束时间
    time: action_time, // 持续时间
};
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':shenqiaction', JSON.stringify(arr));
    
    // 计算结束时间
    let endDate = new Date(arr.end_time);
    let endTimeStr = `${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    e.reply([
        `神祇代行任务启程`,
        `任务内容: ${taskType}`,
        `任务时间: ${time}分钟`,
        `预计结束时间: ${endTimeStr}`,
    ].join('\n'));
    
    return true;
}
// 神祇代行结算函数
async shenqi_jiesuan(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 检查是否有账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('请先创建角色');
        return;
    }
    
    let player = await Read_player(usr_qq);
    if (!player.神祇 || player.神祇 < 1) {
        e.reply('你都没有道宫神祇');
        return;
    }
    
    // 获取神祇代行任务
    let shenqiaction = await redis.get('xiuxian:player:' + usr_qq + ':shenqiaction');
    if (!shenqiaction) {
        e.reply('你的神祇当前没有执行任何代行任务');
        return;
    }
    
    shenqiaction = JSON.parse(shenqiaction);
    const taskType = shenqiaction.taskType; // 任务类型
    
    // 检查任务是否包含开始时间
    if (!shenqiaction.start_time) {
        e.reply('任务数据异常，缺少开始时间');
        return;
    }
    
    // 结束任务也需要职业验证
    const occupationMap = {
        '采药': {req: '采药师', name: '采药师'},
        '采矿': {req: '采矿师', name: '采矿师'},
        '狩猎': {req: '猎户', name: '猎户'},
        '寻源': {req: '源师', name: '源师'},
        '地脉引气': {req: '源地师', name: '源地师'},
        '寻脉定源': {req: '源天师', name: '源天师'}
    };
    
    const occupationInfo = occupationMap[taskType];
    if (occupationInfo && player.occupation !== occupationInfo.req) {
        e.reply(`你当前并非${occupationInfo.name}，无法结束神祇的${taskType}任务`);
        return;
    }
    
    // 计算实际执行时间（分钟）
    const currentTime = Date.now();
    const startTime = shenqiaction.start_time;
    let actualMinutes = Math.floor((currentTime - startTime) / 60000);
    
    // 确保实际时间不超过计划时间
    const plannedMinutes = Math.floor(shenqiaction.time / 60000);
    if (actualMinutes > plannedMinutes) {
        actualMinutes = plannedMinutes;
    }
    
    // 处理少于1分钟的情况
    if (actualMinutes < 1) {
        e.reply('任务执行时间太短，无法获得奖励');
        await redis.del('xiuxian:player:' + usr_qq + ':shenqiaction');
        return;
    }
    
    // 根据任务类型进行结算
    let result;
    switch(taskType) {
        case '采药':
            result = await this.shenqi_plant_jiesuan(usr_qq, actualMinutes);
            break;
        case '采矿':
            result = await this.shenqi_mine_jiesuan(usr_qq, actualMinutes);
            break;
        case '狩猎':
            result = await this.shenqi_hunt_jiesuan(usr_qq, actualMinutes);
            break;
        case '寻源':
            result = await this.shenqi_source_jiesuan(usr_qq, actualMinutes);
            break;
        case '地脉引气':
            result = await this.shenqi_earth_qi_jiesuan(usr_qq, actualMinutes);
            break;
        case '寻脉定源':
            result = await this.shenqi_vein_locate_jiesuan(usr_qq, actualMinutes);
            break;
        default:
            e.reply('未知的神祇代行任务类型');
            return;
    }
    
    // 检查是否超时
    const isOverdue = currentTime > shenqiaction.end_time;
    if (isOverdue && result) {
        const overdueMinutes = Math.floor((currentTime - shenqiaction.end_time) / 60000);
        const penaltyRate = Math.min(0.3, overdueMinutes / 60); // 最多30%惩罚
        const penalty = 1 - penaltyRate;
        
        // 应用惩罚
        if (result.items) {
            result.items.forEach(item => {
                item.count = Math.floor(item.count * penalty);
            });
        }
        if (result.exp) {
            result.exp = Math.floor(result.exp * penalty);
        }
        
        // 更新消息
        result.msg += `\n\n任务超时${overdueMinutes}分钟，奖励减少${Math.floor(penaltyRate * 100)}%`;
    }
    
    // 清除代行任务
    await redis.del('xiuxian:player:' + usr_qq + ':shenqiaction');
    
    // 发送结算结果
    if (result && result.msg) {
        // 添加任务信息
        const fullMsg = [
            `【神祇代行结算】`,
            `任务类型: ${taskType}`,
            `计划时间: ${plannedMinutes}分钟`,
            `实际执行: ${actualMinutes}分钟`,
            `神祇境界: ${player.神祇}重天`,
            ``,
            result.msg
        ].join('\n');
        
        // 将文案转换为图片
        const img = await get_log_img(fullMsg);
        
        if (e.isGroup) {
            await this.pushInfo(e.group_id, true, img);
        } else {
            await this.pushInfo(usr_qq, false, img);
        }
    }
    
    return true;
}
// 神祇采药任务结算
async shenqi_plant_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player.level_id) return;
    
    // 职业加成计算
    const exp = (player.occupation === "采药师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 计算药材总量
    let sum = (time / 480) * (player.occupation_level * 2 + 12);
    
    // 等级修正
    let k = 1;
    if (player.level_id < 22) {
        k = 0.5;
    } else if (player.level_id >= 36) {
        k = 1.5;
    }
    sum *= k;
    
    // 药材种类和概率分布
    const names = [
        '万年凝血草', '万年何首乌', '万年血精草', '万年甜甜花', '万年清心草',
        '古神藤', '万年太玄果', '炼骨花', '魔蕴花', '万年清灵草',
        '万年天魂菊', '仙蕴花', '仙缘草', '太玄仙草'
    ];
    
    // 普通药材概率分布
    const commonProb = [0.2, 0.3, 0.2, 0.2, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // 稀有药材概率分布
    const rareProb = [
        0.17, 0.22, 0.17, 0.17, 0.17, 0.024, 0.024, 0.024, 0.024, 0.024,
        0.024, 0.024, 0.012, 0.011
    ];
    
    // 选择概率分布
    const prob = player.level_id < 36 ? commonProb : rareProb;
    
    // 计算每种药材数量
    const rewards = [];
    for (let i = 0; i < names.length; i++) {
        const count = Math.floor(prob[i] * sum);
        if (count > 0) {
            rewards.push({
                name: names[i],
                type: '草药',
                count: count
            });
        }
    }
    
    // 添加物品到纳戒
    for (const reward of rewards) {
        await Add_najie_thing(usr_qq, reward.name, reward.type, reward.count);
    }
    
    // 增加职业经验
    await Add_职业经验(usr_qq, exp);
    
    // 构造神祇归来文案
    const herbNames = rewards.map(r => `${r.name}x${r.count}`).join('、');
    const msg = [
        `${player.名号}的神祇采药归来`,
        `采药时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `采集药材: ${herbNames}`,
        `药材总量: ${Math.floor(sum)}份`
    ].join('\n');
    
    return {
        exp: exp,
        items: rewards,
        msg: msg
    };
}

// 神祇采矿任务结算
async shenqi_mine_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player.level_id) return;
    
    // 职业加成计算
    const exp = (player.occupation === "采矿师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 计算基础矿石数量
    const mine_amount1 = Math.floor((1.8 + Math.random() * 0.4) * time);
    
    // 计算最终矿石数量
    let end_amount = Math.floor(4 * (rate + 1) * mine_amount1);
    
    // 境界惩罚
    end_amount = Math.floor(end_amount * (player.level_id / 40));
    
    // 石胚和妖石种类
    const A = [
        '金色石胚', '棕色石胚', '绿色石胚', '红色石胚', '蓝色石胚',
        '金色石料', '棕色石料', '绿色石料', '红色石料', '蓝色石料'
    ];
    
    const B = [
        '金色妖石', '棕色妖石', '绿色妖石', '红色妖石', '蓝色妖石',
        '金色妖丹', '棕色妖丹', '绿色妖丹', '红色妖丹', '蓝色妖丹'
    ];
    
    // 随机选择一种石胚和妖石
    const xuanze = Math.trunc(Math.random() * A.length);
    const num = Math.floor(((rate / 12) * time) / 30);
    
    // 添加物品到纳戒
    await Add_najie_thing(usr_qq, '庚金', '材料', end_amount);
    await Add_najie_thing(usr_qq, '玄土', '材料', end_amount);
    await Add_najie_thing(usr_qq, A[xuanze], '材料', num);
    await Add_najie_thing(usr_qq, B[xuanze], '材料', Math.trunc(num / 48));
    
    // 增加职业经验
    await Add_职业经验(usr_qq, exp);
    
    // 构造神祇归来文案
    const oreNames = [
        `庚金x${end_amount}`,
        `玄土x${end_amount}`,
        `${A[xuanze]}x${num}`,
        `${B[xuanze]}x${Math.trunc(num / 48)}`
    ].join('、');
    
    const msg = [
        `${player.名号}的神祇采矿归来`,
        `采矿时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `开采矿石: ${oreNames}`,
        `矿石总量: ${end_amount * 2 + num + Math.trunc(num / 48)}份`
    ].join('\n');
    
    return {
        exp: exp,
        items: [
            {name: '庚金', type: '材料', count: end_amount},
            {name: '玄土', type: '材料', count: end_amount},
            {name: A[xuanze], type: '材料', count: num},
            {name: B[xuanze], type: '材料', count: Math.trunc(num / 48)}
        ],
        msg: msg
    };
}

// 狩猎任务结算
async shenqi_hunt_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player.level_id) return;
    
    // 职业加成计算
    const exp = (player.occupation === "猎户") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 计算稀有奖励次数（每30分钟一次）
    const rareAmount = Math.floor(time / 30);
    
    // 计算奖励数量
    let end_amount = Math.floor(4 * (rate + 0.7) * rareAmount);
    let end_amount2 = Math.floor(1 * (rate + 0.5) * rareAmount);

    // 境界惩罚
    const levelFactor = player.level_id <= 21 
        ? player.level_id / 80 
        : player.level_id / 40;
    
    end_amount = Math.floor(end_amount * levelFactor);
    end_amount2 = Math.floor(end_amount2 * levelFactor);

    // 添加物品到纳戒
    await Add_najie_thing(usr_qq, "野兔", "食材", end_amount);
    await Add_najie_thing(usr_qq, "野猪", "食材", end_amount);
    await Add_najie_thing(usr_qq, "野牛", "食材", end_amount);
    await Add_najie_thing(usr_qq, "野鸡", "食材", end_amount);
    await Add_najie_thing(usr_qq, "野羊", "食材", end_amount);
    
    // 增加职业经验
    await Add_职业经验(usr_qq, exp);
    
    // 构造神祇归来文案
    const preyNames = [
        `野兔x${end_amount}`,
        `野猪x${end_amount}`,
        `野牛x${end_amount}`,
        `野鸡x${end_amount}`,
        `野羊x${end_amount}`
    ].join('、');
    
    const msg = [
        `${player.名号}的神祇狩猎归来`,
        `狩猎时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `猎获猎物: ${preyNames}`,
        `猎物总量: ${end_amount * 5}份`
    ].join('\n');
    
    return {
        exp: exp,
        items: [
            {name: "野兔", type: "食材", count: end_amount},
            {name: "野猪", type: "食材", count: end_amount},
            {name: "野牛", type: "食材", count: end_amount},
            {name: "野羊", type: "食材", count: end_amount},
            {name: "野鸡", type: "食材", count: end_amount}
        ],
        msg: msg
    };
}

// 寻源任务结算
async shenqi_source_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player.level_id) return;
    
    // 职业加成计算
    const exp = (player.occupation === "源师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 计算基础奖励
    const baseAmount = Math.floor((1.8 + Math.random() * 0.4) * time);
    
    // 普通源石奖励
    const commonAmount = Math.floor(3 * (rate + 1) * baseAmount);
    
    // 稀有源石奖励
    const rareAmount = Math.floor(time / 30);
    const rareSource = Math.floor(2 * (rate + 0.7) * rareAmount);
    
    // 神源石奖励
    const divineSource = Math.floor(1 * (rate + 0.5) * rareAmount);
    
    // 源药奖励
    const sourceMedicine = Math.floor(1 * (rate + 0.5) * rareAmount);
    
    // 添加物品到纳戒
    await Add_najie_thing(usr_qq, "下品源石", "道具", commonAmount);
    await Add_najie_thing(usr_qq, "中品源石", "道具", commonAmount);
    await Add_najie_thing(usr_qq, "上品源石", "道具", rareSource);
    await Add_najie_thing(usr_qq, "神源石", "道具", divineSource);
    await Add_najie_thing(usr_qq, "凡源药", "丹药", sourceMedicine);
    
    // 增加职业经验
    await Add_职业经验(usr_qq, exp);
    
    // 构造神祇归来文案
    const sourceNames = [
        `下品源石x${commonAmount}`,
        `中品源石x${commonAmount}`,
        `上品源石x${rareSource}`,
        `神源石x${divineSource}`,
        `凡源药x${sourceMedicine}`
    ].join('、');
    
    const msg = [
        `${player.名号}的神祇寻源归来`,
        `寻源时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `探寻源石: ${sourceNames}`,
        `源石总量: ${commonAmount * 2 + rareSource + divineSource}份`
    ].join('\n');
    
    return {
        exp: exp,
        items: [
            {name: "下品源石", type: "道具", count: commonAmount},
            {name: "中品源石", type: "道具", count: commonAmount},
            {name: "上品源石", type: "道具", count: rareSource},
            {name: "神源石", type: "道具", count: divineSource},
            {name: "凡源药", type: "丹药", count: sourceMedicine}
        ],
        msg: msg
    };
}

// 地脉引气任务结算
async shenqi_earth_qi_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player.level_id) return;

    // 职业加成计算
    const exp = (player.occupation === "源地师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 计算稀有奖励次数（每30分钟一次）
    const rareAmount = Math.floor(time / 30);
    
    // 计算奖励数量
    let end_amount2 = Math.floor(4 * (rate + 0.7) * rareAmount);
    let end_amount3 = Math.floor(1 * (rate + 0.5) * rareAmount);

    // 境界惩罚
    const levelFactor = player.level_id <= 21 
        ? player.level_id / 80 
        : player.level_id / 40;
    
    end_amount2 = Math.floor(end_amount2 * levelFactor);
    end_amount3 = Math.floor(end_amount3 * levelFactor);

    // 添加物品到纳戒
    await Add_najie_thing(usr_qq, "上品源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "超品源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "神源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "地源药", "丹药", end_amount3);
    
    // 增加职业经验
    await Add_职业经验(usr_qq, exp);
    
    // 构造神祇归来文案
    const itemNames = [
        `上品源石x${end_amount2}`,
        `超品源石x${end_amount2}`,
        `神源石x${end_amount2}`,
        `地源药x${end_amount3}`
    ].join('、');
    
    const msg = [
        `${player.名号}的神祇引气归来`,
        `引气时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `引导地脉: ${itemNames}`,
        `灵气总量: ${end_amount2 * 3 + end_amount3}份`
    ].join('\n');
    
    return {
        exp: exp,
        items: [
            {name: "上品源石", type: "道具", count: end_amount2},
            {name: "超品源石", type: "道具", count: end_amount2},
            {name: "神源石", type: "道具", count: end_amount2},
            {name: "地源药", type: "丹药", count: end_amount3}
        ],
        msg: msg
    };
}

// 寻脉定源任务结算
async shenqi_vein_locate_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player || !player.level_id) return;
    
    // 计算基础奖励
    const baseAmount = Math.floor((2.0 + Math.random() * 0.5) * time);
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 高级奖励计算
    const end_amount = Math.floor(0.5 * (rate + 1) * baseAmount);
    const end_amount2 = Math.floor(0.3 * (rate + 0.8) * baseAmount);
    const end_amount3 = Math.floor(0.1 * (rate + 0.6) * baseAmount);
    
    // 特殊奖励
    let longmaiEssence = 0;
    if (Math.random() < 0.15) {
        longmaiEssence = 1;
    }
    
    // 添加物品到纳戒
    await Add_najie_thing(usr_qq, "超品源石", "道具", end_amount);
    await Add_najie_thing(usr_qq, "上品神源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "神源液", "丹药", end_amount2);
    await Add_najie_thing(usr_qq, "超品神源石", "道具", end_amount3);
    await Add_najie_thing(usr_qq, "神源药", "丹药", end_amount3);
    
    if (longmaiEssence > 0) {
        await Add_najie_thing(usr_qq, "龙脉精华", "道具", longmaiEssence);
    }
    
    // 增加职业经验
    const exp = time * 20;
    await Add_职业经验(usr_qq, exp);
    
    // 构建奖励物品列表
    const items = [
        {name: "超品源石", type: "道具", count: end_amount},
        {name: "上品神源石", type: "道具", count: end_amount2},
        {name: "神源液", type: "丹药", count: end_amount2},
        {name: "超品神源石", type: "道具", count: end_amount3},
        {name: "神源药", type: "丹药", count: end_amount3}
    ];
    
    if (longmaiEssence > 0) {
        items.push({name: "龙脉精华", type: "道具", count: longmaiEssence});
    }
    
    // 构造神祇归来文案
    const itemNames = items.map(i => `${i.name}x${i.count}`).join('、');
    const msg = [
        `${player.名号}的神祇定源归来`,
        `定源时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `定位灵脉: ${itemNames}`,
        `灵脉总量: ${end_amount + end_amount2 + end_amount3}处`
    ].join('\n');
    
    return {
        exp: exp,
        items: items,
        msg: msg
    };
}
async lingshendaixing(e) {
    if (!e.isGroup) {
        e.reply('仙路尽头谁为峰？当在诸天论道之地共证不朽！');
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('时光长河未见汝之印记，请以「#踏入仙途」铸就道基');
        return;
    }
    
    let player = await Read_player(usr_qq);
    if (player.灵身&&player.灵身<1 ) {
        e.reply('你的洞天没有蕴养出灵身');
        return;
    }
   // 解析任务类型
    const taskType = e.msg.match(/采药|采矿|狩猎|寻源|地脉引气|寻脉定源/)[0];
     // 职业验证
    let requiredOccupation = '';
    switch(taskType) {
        case '采药':
            requiredOccupation = '采药师';
            break;
        case '采矿':
            requiredOccupation = '采矿师';
            break;
        case '狩猎':
            requiredOccupation = '猎户';
            break;
        case '寻源':
            requiredOccupation = '源师';
            break;
        case '地脉引气':
            requiredOccupation = '源地师';
            break;
        case '寻脉定源':
            requiredOccupation = '源天师';
            break;
    }
    
    // 检查职业是否符合要求
    if (requiredOccupation && player.occupation !== requiredOccupation) {
        let occupationName = '';
        switch(requiredOccupation) {
            case '采药师':
                occupationName = '采药师';
                break;
            case '采矿师':
                occupationName = '采矿师';
                break;
            case '猎户':
                occupationName = '猎户';
                break;
            case '源师':
                occupationName = '源师';
                break;
            case '源地师':
                occupationName = '源地师';
                break;
            case '源天师':
                occupationName = '源天师';
                break;

        }
        
        e.reply(`你当前并非${occupationName}，无法让灵身进行${taskType}任务`);
        return;
    }
    // 解析时间参数
    let timeInput = e.msg.replace(`#灵身代行${taskType}`, '').trim();
    let time = 0;
    
    if (timeInput.includes('分钟')) {
        time = parseInt(timeInput.replace('分钟', ''));
    } else if (timeInput.includes('小时')) {
        time = parseInt(timeInput.replace('小时', '')) * 60;
    } else if (timeInput.includes('天')) {
        time = parseInt(timeInput.replace('天', '')) * 1440;
    } else {
        // 默认代行时间
        time = 120; // 2小时
    }
    
    // 限制最大代行时间
    const maxTime = 2880; // 2天
    if (time > maxTime) {
        time = maxTime;
        e.reply('灵身代行时间不能超过2天，已自动设置为2天');
    }
    
    // 检查是否已有代行任务
    let lingshenaction = await redis.get('xiuxian:player:' + usr_qq + ':lingshenaction');
    if (lingshenaction) {
        lingshenaction = JSON.parse(lingshenaction);
        if (lingshenaction.end_time > new Date().getTime()) {
            let remaining = lingshenaction.end_time - new Date().getTime();
            let minutes = Math.floor(remaining / 60000);
            let hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            
            e.reply(`灵身正在执行${lingshenaction.taskType}任务中，剩余时间: ${hours}小时${minutes}分钟`);
            return;
        }
    }
    
    // 设置灵身代行任务
    let action_time = time * 60 * 1000; // 持续时间，单位毫秒
    let arr = {
        taskType: taskType, // 任务类型
        end_time: new Date().getTime() + action_time, // 结束时间
        time: action_time, // 持续时间
    };
    
    if (e.isGroup) {
        arr.group_id = e.group_id;
    }
    
    await redis.set('xiuxian:player:' + usr_qq + ':lingshenaction', JSON.stringify(arr));
    
    // 计算结束时间
    let endDate = new Date(arr.end_time);
    let endTimeStr = `${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    e.reply([
        `灵身代行任务启程`,
        `任务内容: ${taskType}`,
        `任务时间: ${time}分钟`,
        `预计结束时间: ${endTimeStr}`,
    ].join('\n'));
    
    return true;
}
// 灵身代行结算函数
async lingshen_jiesuan(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 检查是否有账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('请先创建角色');
        return;
    }
        if (!player.灵身 || player.灵身 < 1) {
        e.reply('你的洞天都没有蕴养出灵身');
        return;
    }
    // 获取灵身代行任务
    let lingshenaction = await redis.get('xiuxian:player:' + usr_qq + ':lingshenaction');
    
    if (!lingshenaction) {
        e.reply('你的灵身当前没有执行任何代行任务');
        return;
    }
    
    lingshenaction = JSON.parse(lingshenaction);
    const taskType = lingshenaction.lingshenaction; // 任务类
    
    // 结束任务也需要职业验证
    let requiredOccupation = '';
    let occupationName = '';
    switch(taskType) {
        case '采药':
            requiredOccupation = '采药师';
            occupationName = '采药师';
            break;
        case '采矿':
            requiredOccupation = '采矿师';
            occupationName = '采矿师';
            break;
        case '狩猎':
            requiredOccupation = '猎户';
            occupationName = '猎户';
            break;
        case '寻源':
            requiredOccupation = '源师';
            occupationName = '源师';
            break;
        case '地脉引气':
            requiredOccupation = '源地师';
            occupationName = '源地师';
            break;
        case '寻脉定源':
            requiredOccupation = '源天师';
            occupationName = '源天师';
            break;
    }
    
    // 检查职业是否符合要求
    if (requiredOccupation && player.occupation !== requiredOccupation) {
        e.reply(`你当前并非${occupationName}，无法结束灵身的${taskType}任务`);
        return;
    }
    // 计算实际执行时间（分钟）
    const currentTime = Date.now();
    const startTime = lingshenaction.end_time - lingshenaction.time;
    let time = Math.floor((currentTime - startTime) / 60000);
    
    // 确保实际时间不超过计划时间
    const plannedMinutes = Math.floor(lingshenaction.time / 60000);
    if (time > plannedMinutes) {
        time = plannedMinutes;
    }
    
      // 根据任务类型进行结算
    let result;
    switch(taskType) {
        case '采药':
            result = await this.lingshen_plant_jiesuan(usr_qq, time);
            break;
        case '采矿':
            result = await this.lingshen_mine_jiesuan(usr_qq, time);
            break;
        case '狩猎':
            result = await this.lingshen_hunt_jiesuan(usr_qq,time);
            break;
        case '寻源':
            result = await this.lingshen_source_jiesuan(usr_qq,time);
            break;
        case '地脉引气':
            result = await this.lingshen_earth_qi_jiesuan(usr_qq,time);
            break;
        case '寻脉定源':
            result = await this.lingshen_vein_locate_jiesuan(usr_qq, time);
            break;
        default:
            e.reply('未知的灵身代行任务类型');
            return;
    }
    
    // 清除代行任务
    await redis.del('xiuxian:player:' + usr_qq + ':lingshenaction');
    
    // 发送结算结果
    if (result && result.msg) {
        // 将文案转换为图片
        const img = await get_log_img(result.msg);
        
        if (e.isGroup) {
            await this.pushInfo(e.group_id, true, img);
        } else {
            await this.pushInfo(usr_qq, false, img);
        }
    }
    
    return true;
}
// 灵身采药任务结算
async lingshen_plant_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player.level_id) return;
    
    // 职业加成计算
    const exp = (player.occupation === "采药师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 计算药材总量
    let sum = (time / 480) * (player.occupation_level * 2 + 12);
    
    // 等级修正
    let k = 1;
    if (player.level_id < 22) {
        k = 0.5;
    } else if (player.level_id >= 36) {
        k = 1.5;
    }
    sum *= k;
    
    // 药材种类和概率分布
    const names = [
        '万年凝血草', '万年何首乌', '万年血精草', '万年甜甜花', '万年清心草',
        '古神藤', '万年太玄果', '炼骨花', '魔蕴花', '万年清灵草',
        '万年天魂菊', '仙蕴花', '仙缘草', '太玄仙草'
    ];
    
    // 普通药材概率分布
    const commonProb = [0.2, 0.3, 0.2, 0.2, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // 稀有药材概率分布
    const rareProb = [
        0.17, 0.22, 0.17, 0.17, 0.17, 0.024, 0.024, 0.024, 0.024, 0.024,
        0.024, 0.024, 0.012, 0.011
    ];
    
    // 选择概率分布
    const prob = player.level_id < 36 ? commonProb : rareProb;
    
    // 计算每种药材数量
    const rewards = [];
    for (let i = 0; i < names.length; i++) {
        const count = Math.floor(prob[i] * sum);
        if (count > 0) {
            rewards.push({
                name: names[i],
                type: '草药',
                count: count
            });
        }
    }
    
    // 添加物品到纳戒
    for (const reward of rewards) {
        await Add_najie_thing(usr_qq, reward.name, reward.type, reward.count);
    }
    
    // 增加职业经验
    await Add_职业经验(usr_qq, exp);
    
    // 构造灵身归来文案
    const herbNames = rewards.map(r => `${r.name}x${r.count}`).join('、');
    const msg = [
        `${player.名号}的灵身采药归来`,
        `采药时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `采集药材: ${herbNames}`,
        `药材总量: ${Math.floor(sum)}份`
    ].join('\n');
    
    return {
        exp: exp,
        items: rewards,
        msg: msg
    };
}

// 灵身采矿任务结算
async lingshen_mine_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player.level_id) return;
    
    // 职业加成计算
    const exp = (player.occupation === "采矿师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 计算基础矿石数量
    const mine_amount1 = Math.floor((1.8 + Math.random() * 0.4) * time);
    
    // 计算最终矿石数量
    let end_amount = Math.floor(4 * (rate + 1) * mine_amount1);
    
    // 境界惩罚
    end_amount = Math.floor(end_amount * (player.level_id / 40));
    
    // 石胚和妖石种类
    const A = [
        '金色石胚', '棕色石胚', '绿色石胚', '红色石胚', '蓝色石胚',
        '金色石料', '棕色石料', '绿色石料', '红色石料', '蓝色石料'
    ];
    
    const B = [
        '金色妖石', '棕色妖石', '绿色妖石', '红色妖石', '蓝色妖石',
        '金色妖丹', '棕色妖丹', '绿色妖丹', '红色妖丹', '蓝色妖丹'
    ];
    
    // 随机选择一种石胚和妖石
    const xuanze = Math.trunc(Math.random() * A.length);
    const num = Math.floor(((rate / 12) * time) / 30);
    
    // 添加物品到纳戒
    await Add_najie_thing(usr_qq, '庚金', '材料', end_amount);
    await Add_najie_thing(usr_qq, '玄土', '材料', end_amount);
    await Add_najie_thing(usr_qq, A[xuanze], '材料', num);
    await Add_najie_thing(usr_qq, B[xuanze], '材料', Math.trunc(num / 48));
    
    // 增加职业经验
    await Add_职业经验(usr_qq, exp);
    
    // 构造灵身归来文案
    const oreNames = [
        `庚金x${end_amount}`,
        `玄土x${end_amount}`,
        `${A[xuanze]}x${num}`,
        `${B[xuanze]}x${Math.trunc(num / 48)}`
    ].join('、');
    
    const msg = [
        `${player.名号}的灵身采矿归来`,
        `采矿时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `开采矿石: ${oreNames}`,
        `矿石总量: ${end_amount * 2 + num + Math.trunc(num / 48)}份`
    ].join('\n');
    
    return {
        exp: exp,
        items: [
            {name: '庚金', type: '材料', count: end_amount},
            {name: '玄土', type: '材料', count: end_amount},
            {name: A[xuanze], type: '材料', count: num},
            {name: B[xuanze], type: '材料', count: Math.trunc(num / 48)}
        ],
        msg: msg
    };
}

// 狩猎任务结算
async lingshen_hunt_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player.level_id) return;
    
    // 职业加成计算
    const exp = (player.occupation === "猎户") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 计算稀有奖励次数（每30分钟一次）
    const rareAmount = Math.floor(time / 30);
    
    // 计算奖励数量
    let end_amount = Math.floor(4 * (rate + 0.7) * rareAmount);
    let end_amount2 = Math.floor(1 * (rate + 0.5) * rareAmount);

    // 境界惩罚
    const levelFactor = player.level_id <= 21 
        ? player.level_id / 80 
        : player.level_id / 40;
    
    end_amount = Math.floor(end_amount * levelFactor);
    end_amount2 = Math.floor(end_amount2 * levelFactor);

    // 添加物品到纳戒
    await Add_najie_thing(usr_qq, "野兔", "食材", end_amount);
    await Add_najie_thing(usr_qq, "野猪", "食材", end_amount);
    await Add_najie_thing(usr_qq, "野牛", "食材", end_amount);
    await Add_najie_thing(usr_qq, "野鸡", "食材", end_amount);
    await Add_najie_thing(usr_qq, "野羊", "食材", end_amount);
    
    // 增加职业经验
    await Add_职业经验(usr_qq, exp);
    
    // 构造灵身归来文案
    const preyNames = [
        `野兔x${end_amount}`,
        `野猪x${end_amount}`,
        `野牛x${end_amount}`,
        `野鸡x${end_amount}`,
        `野羊x${end_amount}`
    ].join('、');
    
    const msg = [
        `${player.名号}的灵身狩猎归来`,
        `狩猎时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `猎获猎物: ${preyNames}`,
        `猎物总量: ${end_amount * 5}份`
    ].join('\n');
    
    return {
        exp: exp,
        items: [
            {name: "野兔", type: "食材", count: end_amount},
            {name: "野猪", type: "食材", count: end_amount},
            {name: "野牛", type: "食材", count: end_amount},
            {name: "野羊", type: "食材", count: end_amount},
            {name: "野鸡", type: "食材", count: end_amount}
        ],
        msg: msg
    };
}

// 寻源任务结算
async lingshen_source_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player.level_id) return;
    
    // 职业加成计算
    const exp = (player.occupation === "源师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 计算基础奖励
    const baseAmount = Math.floor((1.8 + Math.random() * 0.4) * time);
    
    // 普通源石奖励
    const commonAmount = Math.floor(3 * (rate + 1) * baseAmount);
    
    // 稀有源石奖励
    const rareAmount = Math.floor(time / 30);
    const rareSource = Math.floor(2 * (rate + 0.7) * rareAmount);
    
    // 神源石奖励
    const divineSource = Math.floor(1 * (rate + 0.5) * rareAmount);
    
    // 源药奖励
    const sourceMedicine = Math.floor(1 * (rate + 0.5) * rareAmount);
    
    // 添加物品到纳戒
    await Add_najie_thing(usr_qq, "下品源石", "道具", commonAmount);
    await Add_najie_thing(usr_qq, "中品源石", "道具", commonAmount);
    await Add_najie_thing(usr_qq, "上品源石", "道具", rareSource);
    await Add_najie_thing(usr_qq, "神源石", "道具", divineSource);
    await Add_najie_thing(usr_qq, "凡源药", "丹药", sourceMedicine);
    
    // 增加职业经验
    await Add_职业经验(usr_qq, exp);
    
    // 构造灵身归来文案
    const sourceNames = [
        `下品源石x${commonAmount}`,
        `中品源石x${commonAmount}`,
        `上品源石x${rareSource}`,
        `神源石x${divineSource}`,
        `凡源药x${sourceMedicine}`
    ].join('、');
    
    const msg = [
        `${player.名号}的灵身寻源归来`,
        `寻源时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `探寻源石: ${sourceNames}`,
        `源石总量: ${commonAmount * 2 + rareSource + divineSource}份`
    ].join('\n');
    
    return {
        exp: exp,
        items: [
            {name: "下品源石", type: "道具", count: commonAmount},
            {name: "中品源石", type: "道具", count: commonAmount},
            {name: "上品源石", type: "道具", count: rareSource},
            {name: "神源石", type: "道具", count: divineSource},
            {name: "凡源药", type: "丹药", count: sourceMedicine}
        ],
        msg: msg
    };
}

// 地脉引气任务结算
async lingshen_earth_qi_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player.level_id) return;

    // 职业加成计算
    const exp = (player.occupation === "源地师") ? time * 100 : 0;
    const rate = data.occupation_exp_list.find(
        item => item.id == player.occupation_level
    )?.rate * 10 || 1;
    
    // 计算稀有奖励次数（每30分钟一次）
    const rareAmount = Math.floor(time / 30);
    
    // 计算奖励数量
    let end_amount2 = Math.floor(4 * (rate + 0.7) * rareAmount);
    let end_amount3 = Math.floor(1 * (rate + 0.5) * rareAmount);

    // 境界惩罚
    const levelFactor = player.level_id <= 21 
        ? player.level_id / 80 
        : player.level_id / 40;
    
    end_amount2 = Math.floor(end_amount2 * levelFactor);
    end_amount3 = Math.floor(end_amount3 * levelFactor);

    // 添加物品到纳戒
    await Add_najie_thing(usr_qq, "上品源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "超品源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "神源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "地源药", "丹药", end_amount3);
    
    // 增加职业经验
    await Add_职业经验(usr_qq, exp);
    
    // 构造灵身归来文案
    const itemNames = [
        `上品源石x${end_amount2}`,
        `超品源石x${end_amount2}`,
        `神源石x${end_amount2}`,
        `地源药x${end_amount3}`
    ].join('、');
    
    const msg = [
        `${player.名号}的灵身引气归来`,
        `引气时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `引导地脉: ${itemNames}`,
        `灵气总量: ${end_amount2 * 3 + end_amount3}份`
    ].join('\n');
    
    return {
        exp: exp,
        items: [
            {name: "上品源石", type: "道具", count: end_amount2},
            {name: "超品源石", type: "道具", count: end_amount2},
            {name: "神源石", type: "道具", count: end_amount2},
            {name: "地源药", type: "丹药", count: end_amount3}
        ],
        msg: msg
    };
}

// 寻脉定源任务结算
async lingshen_vein_locate_jiesuan(usr_qq, time) {
    const player = data.getData('player', usr_qq);
    if (!player || !player.level_id) return;
    
    // 计算基础奖励
    const baseAmount = Math.floor((2.0 + Math.random() * 0.5) * time);
    const occupationLevel = player.occupation_level || 1;
    const occupationData = data.occupation_exp_list.find(item => item.id == occupationLevel);
    const rate = occupationData ? occupationData.rate * 20 : 20;
    
    // 高级奖励计算
    const end_amount = Math.floor(0.5 * (rate + 1) * baseAmount);
    const end_amount2 = Math.floor(0.3 * (rate + 0.8) * baseAmount);
    const end_amount3 = Math.floor(0.1 * (rate + 0.6) * baseAmount);
    
    // 特殊奖励
    let longmaiEssence = 0;
    if (Math.random() < 0.15) {
        longmaiEssence = 1;
    }
    
    // 添加物品到纳戒
    await Add_najie_thing(usr_qq, "超品源石", "道具", end_amount);
    await Add_najie_thing(usr_qq, "上品神源石", "道具", end_amount2);
    await Add_najie_thing(usr_qq, "神源液", "丹药", end_amount2);
    await Add_najie_thing(usr_qq, "超品神源石", "道具", end_amount3);
    await Add_najie_thing(usr_qq, "神源药", "丹药", end_amount3);
    
    if (longmaiEssence > 0) {
        await Add_najie_thing(usr_qq, "龙脉精华", "道具", longmaiEssence);
    }
    
    // 增加职业经验
    const exp = time * 20;
    await Add_职业经验(usr_qq, exp);
    
    // 构建奖励物品列表
    const items = [
        {name: "超品源石", type: "道具", count: end_amount},
        {name: "上品神源石", type: "道具", count: end_amount2},
        {name: "神源液", type: "丹药", count: end_amount2},
        {name: "超品神源石", type: "道具", count: end_amount3},
        {name: "神源药", type: "丹药", count: end_amount3}
    ];
    
    if (longmaiEssence > 0) {
        items.push({name: "龙脉精华", type: "道具", count: longmaiEssence});
    }
    
    // 构造灵身归来文案
    const itemNames = items.map(i => `${i.name}x${i.count}`).join('、');
    const msg = [
        `${player.名号}的灵身定源归来`,
        `定源时间: ${time}分钟`,
        `获得职业经验: ${exp}`,
        `定位灵脉: ${itemNames}`,
        `灵脉总量: ${end_amount + end_amount2 + end_amount3}处`
    ].join('\n');
    
    return {
        exp: exp,
        items: items,
        msg: msg
    };
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