import { plugin, puppeteer, verc, data, config } from '../../api/api.js';
import fs from 'fs';
import Show from '../../model/show.js';
import {
  existplayer,
  Write_player,
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
  timestampToTime,
  get_log_img,
  channel,
  Add_修为,
  Add_血气
} from '../../model/xiuxian.js';
import { Read_player, __PATH, Read_danyao } from '../../model/xiuxian.js';

const WORLD_LEVELS = {
  1: {
    name: '混沌初开',
    attributes: {
      灵气浓度: 1000,
      面积: '十里方圆',
      时间流速: '1:1',
      特殊资源: [],
      药田上限: 1 // 新增药田上限
    },
    requirements: {
      材料: { '世界石': 1 }
    }
  },
  2: {
    name: '鸿蒙小界',
    attributes: {
      灵气浓度: 3000,
      面积: '百里方圆',
      时间流速: '1:2',
      特殊资源: [],
      药田上限: 3 // 新增药田上限
    },
    requirements: {
      材料: { '世界石': 3, '玄渊真水': 1, '元虚罡风': 1, '太初燧火': 1, '须弥神土': 1 }
    }
  },
  3: {
    name: '紫府洞天',
    attributes: {
      灵气浓度: 5000,
      面积: '千里方圆',
      时间流速: '1:3',
      特殊资源: [],
      药田上限: 5 // 新增药田上限
    },
    requirements: {
      材料: { '世界石': 5, '造化玉碟': 1 }
    }
  },
  4: {
    name: '太虚仙境',
    attributes: {
      灵气浓度: 10000,
      面积: '万里山河',
      时间流速: '1:4',
      特殊资源: [],
      药田上限: 8 // 新增药田上限
    },
    requirements: {
      材料: { '世界石': 10, '混沌母气': 10 }
    }
  },
  5: {
    name: '洪荒世界',
    attributes: {
      灵气浓度: 30000,
      面积: '十万里疆域',
      时间流速: '1:8',
      特殊资源: [],
      药田上限: 12 // 新增药田上限
    },
    requirements: {
      材料: { '世界石': 20 }
    }
  }
};

// 特殊资源池
const SPECIAL_RESOURCES = [
  '先天灵泉', '星辰矿脉', '混沌灵根', 
  '太初神木', '鸿蒙紫气', '大道金莲',
  '虚空晶石', '时间碎片', '生命古树'
];

// 神药生长阶段配置
const SHENYAO_STAGES = {
  1: { name: "萌芽", duration: 3600, desc: "种子破土而出，嫩芽初现" },
  2: { name: "幼苗", duration: 10800, desc: "枝叶舒展，初具药形" },
  3: { name: "成长期", duration: 21600, desc: "药株茁壮，散发神性光辉" },
  4: { name: "开花期", duration: 43200, desc: "神花绽放，道韵流转" },
  5: { name: "成熟期", desc: "神药成熟，可采摘" }
};

// 神药种子配置
const SHENYAO_SEEDS = {
  "麒麟神药种子": {
    id: 900433,
    name: "麒麟神药种子",
    class: "草药",
    type: "神药种子",
    harvest: "麒麟神药",
    stages: SHENYAO_STAGES,
    requirements: {
      灵气浓度: 3000,
      特殊环境: [ "仙泉"]
    }
  },
   "玄武神药种子": {
    id: 900433,
    name: "玄武神药种子",
    class: "草药",
    type: "神药种子",
    harvest: "玄武神药",
    stages: SHENYAO_STAGES,
    requirements: {
      灵气浓度: 3000,
      特殊环境: [ "仙泉"]
    }
  },
   "蟠桃仙种": {
    id: 900433,
    name: "蟠桃仙种",
    class: "草药",
    type: "神药种子",
    harvest: "蟠桃仙果",
    stages: SHENYAO_STAGES,
    requirements: {
      灵气浓度: 3000,
      特殊环境: [ "仙泉"]
    }
  },
  "真龙不死药种子": {
    id: 900434,
    name: "真龙不死药种子",
    class: "草药",
    type: "神药种子",
    harvest: "真龙不死药",
    stages: SHENYAO_STAGES,
    requirements: {
      灵气浓度: 5000,
      特殊环境: ["龙穴"]
    }
  },
    "大夏神药种子": {
    id: 900434,
    name: "大夏神药种子",
    class: "草药",
    type: "神药种子",
    harvest: "大夏神药",
    stages: SHENYAO_STAGES,
    requirements: {
      灵气浓度: 3000
    }
  },
  "九妙不死药种子": {
    id: 900435,
    name: "九妙不死药种子",
    class: "草药",
    type: "神药种子",
    harvest: "九妙不死药",
    stages: SHENYAO_STAGES,
    requirements: {
      灵气浓度: 8000,
      特殊环境: ["仙坟"]
    }
  },
  "悟道古茶树幼苗": {
    id: 23001005,
     name: "悟道古茶树幼苗",
    class: "草药",
    type: "古茶树种子",
    harvest: "悟道古茶树",
    stages: SHENYAO_STAGES,
    requirements: {
      灵气浓度: 10000,
      特殊环境: ["仙坟","仙泉"]
    }
  }
};

export class xiaoshijie extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_xiaoshijie',
      dsc: '小世界模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#开辟小世界 (.*)$',
          fnc: 'createSmallWorld'
        },
        {
          reg: '^#演化小世界$',
          fnc: 'upgradeSmallWorld'
        },
        {
          reg: '^#我的小世界$',
          fnc: 'viewSmallWorld'
        },
        {
          reg: '^#将分身化入小世界$',
          fnc: 'createAvatar'
        },
        {
          reg: '^#收获小世界资源$',
          fnc: 'harvestResources'
        },
{
    reg: '^#使用(.*?)创造环境$',
    fnc: 'createEnvironmentWithItem'
},
{
    reg: '^#小世界栽种(.*?)$',
    fnc: 'plantShenyao'
},
        {
  reg: '^#浇灌小世界作物$',
  fnc: 'forceRipenAllCrops', 
},
        {
  reg: '^#种植指南$',
  fnc: 'showPlantingHelp', 
},
{
  reg: '^#(?:使用|浇灌)?\\s*(草木精华露|岁月流金沙|掌天灵液)\\s*(?:催熟|浇灌)?\\s*(?:第)?(\\d+)(?:号)?(?:作物|药田)?$',
  fnc: 'forceRipenSingleCrop'
},
         {
        reg: '^#催熟小世界作物$',
        fnc: 'forceRipenCrops',
        permission: 'master'
    }
      ],
    });
  }
  // 将formatCropList方法放在类内部
  formatCropList(crops) {
    return crops.map((crop, index) => {
      const seedConfig = SHENYAO_SEEDS[crop.种子];
      if (!seedConfig) return `${index + 1}号: 未知作物`;
      
      const stage = seedConfig.stages[crop.当前阶段];
      const progress = "▰".repeat(crop.当前阶段) + "▱".repeat(5 - crop.当前阶段);
      
      return `${index + 1}号: ${seedConfig.name} [${progress}] ${stage.name}`;
    }).join("\n");
  }
async forceRipenSingleCrop(e) {
    if (!e.isGroup) return;
    
    // 更灵活的正则匹配，支持多种指令格式
    const match = e.msg.match(/^#(?:使用|浇灌)?\s*(草木精华露|岁月流金沙|掌天灵液)\s*(?:催熟|浇灌)?\s*(?:第)?(\d+)(?:号)?(?:作物|药田)?$/);
    if (!match) return false;
    
    const itemName = match[1];
    const position = parseInt(match[2]) - 1; // 位置从1开始，转换为索引
    
    const usr_qq = e.user_id;
    const player_qq = await channel(usr_qq);
    
    try {
        // 获取玩家小世界
        const world = data.xiaoshijie.find(w => w.player_qq === player_qq);
        if (!world) {
            return e.reply('请先使用 #开辟小世界 创建您的小世界');
        }
        
        // 检查药田
        if (!world.药田 || world.药田.length === 0) {
            return e.reply('您的药田还没有种植任何作物，请先使用 #种植 [作物名] 进行种植');
        }
        
        // 检查位置是否有效
        if (position < 0 || position >= world.药田.length) {
            return e.reply(`位置无效，请选择1-${world.药田.length}号作物\n当前药田情况：\n${this.formatCropList(world.药田)}`);
        }
        
        // 获取作物
        const crop = world.药田[position];
        const seedConfig = SHENYAO_SEEDS[crop.种子];
        
        if (!seedConfig) {
            return e.reply('该作物配置异常，无法催熟');
        }
        
        // 检查是否已成熟
        if (crop.当前阶段 >= 5) {
            return e.reply([
                `【${seedConfig.name}】已成熟，无需催熟`,
                `提示：使用 #收获${position + 1} 收获作物`
            ].join("\n"));
        }
        
        // 检查道具数量
        const itemCount = await exist_najie_thing(player_qq, itemName, "道具");
        if (itemCount < 1) {
            return e.reply([
                `需要【${itemName}】x1`,
                `提示：您当前拥有 ${itemCount} 个`
            ].join("\n"));
        }
        
        // 确定催熟阶段数
        const stageEffects = {
            '草木精华露': 1,
            '岁月流金沙': 2,
            '掌天灵液': 3
        };
        
        const stagesToAdvance = stageEffects[itemName] || 1;
        
        // 计算新阶段
        const newStage = Math.min(crop.当前阶段 + stagesToAdvance, 5);
        const stagesAdvanced = newStage - crop.当前阶段;
        
        if (stagesAdvanced <= 0) {
            return e.reply('催熟未能推进作物生长阶段');
        }
        
        // 更新作物阶段
        crop.当前阶段 = newStage;
        crop.阶段开始时间 = new Date().toLocaleString();
        
        // 记录生长日志
        crop.生长记录 = crop.生长记录 || [];
        crop.生长记录.push(`${new Date().toLocaleString()}: 使用【${itemName}】催熟，推进${stagesAdvanced}个阶段至【${seedConfig.stages[newStage].name}】`);
        
        // 扣除道具
        await Add_najie_thing(player_qq, itemName, "道具", -1);
        
        let replyMessage = [];
        
        // 如果作物成熟，则收获
        if (newStage === 5) {
            const harvestItem = seedConfig.harvest;
            let itemType = "丹药";
            if (harvestItem === "悟道古茶树") itemType = "道具";
            
            // 添加到纳戒
            await Add_najie_thing(player_qq, harvestItem, itemType, 1);
            
            // 从药田中移除
            world.药田.splice(position, 1);
            
            replyMessage = [
                `成功使用【${itemName}】催熟第${position + 1}号作物！`,
                `作物：${seedConfig.name}直接成熟！`,
                `收获：【${harvestItem}】x1`,
                `已自动存入纳戒`
            ];
        } else {
            replyMessage = [
                `成功使用【${itemName}】催熟第${position + 1}号作物！`,
                `作物：${seedConfig.name}推进${stagesAdvanced}个生长阶段`,
                `当前：${seedConfig.stages[newStage].name}（${seedConfig.stages[newStage].desc}）`,
                `下一阶段：${newStage < 4 ? seedConfig.stages[newStage + 1].name : '成熟'}`
            ];
        }
        
        // 保存小世界数据
        const worldIndex = data.xiaoshijie.findIndex(w => w.player_qq === player_qq);
        if (worldIndex !== -1) {
            data.xiaoshijie[worldIndex] = world;
            fs.writeFileSync(`${data.lib_path}/小世界列表.json`, JSON.stringify(data.xiaoshijie, null, 2));
        }
        
        // 添加药田概览
        if (world.药田.length > 0) {
            replyMessage.push("\n当前药田概览：");
            replyMessage.push(this.formatCropList(world.药田));
        }
        
        e.reply(replyMessage.join("\n"));
        
    } catch (err) {
        console.error('催熟作物错误:', err);
        e.reply([
            '催熟失败',
            `错误: ${err.message}`,
            '请稍后重试或联系管理员'
        ].join("\n"));
    }
    
    return true;
}
async forceRipenAllCrops(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    const player_qq = await channel(usr_qq);
    
    // 获取玩家小世界
    const world = data.xiaoshijie.find(w => w.player_qq === player_qq);
    if (!world) {
        e.reply('请先开辟小世界');
        return true;
    }
    
    // 检查药田
    if (!world.药田 || world.药田.length === 0) {
        e.reply('药田中没有作物');
        return true;
    }
    
    // 检查道具数量
    const itemName = '乾坤造化瓶';
    const itemCount = await exist_najie_thing(player_qq, itemName, "道具");
    if (itemCount < 1) {
        e.reply(`需要【${itemName}】x1`);
        return true;
    }
    
    // 检查冷却时间（12小时）
    const now = new Date();
   // if (world.lastGroupRipenTime) {
      //  const lastTime = new Date(world.lastGroupRipenTime);
       // const hoursPassed = (now - lastTime) / (1000 * 60 * 60);
       // if (hoursPassed < 12) {
         //   const remainingHours = (12 - hoursPassed).toFixed(1);
        //    e.reply(`【${itemName}】正在冷却中，剩余${remainingHours}小时`);
        //    return true;
        //}
    //}
    await Add_najie_thing(player_qq,itemName, "道具", -1);
    // 扣除道具（使用次数不扣除，只记录冷却）
    // 不扣除道具，因为是一次性使用后进入冷却
    
    // 记录使用时间
    //world.lastGroupRipenTime = now.toLocaleString();
    
    // 催熟所有作物一个阶段
    const harvested = [];
    
    for (let i = world.药田.length - 1; i >= 0; i--) {
        const crop = world.药田[i];
        
        // 如果已成熟则跳过
        if (crop.当前阶段 >= 5) continue;
        
        // 进入下一阶段
        crop.当前阶段++;
        crop.阶段开始时间 = now.toLocaleString();
        
        const seedConfig = SHENYAO_SEEDS[crop.种子];
        crop.生长记录.push(`${now.toLocaleString()}: 使用【${itemName}】群体催熟，进入【${seedConfig.stages[crop.当前阶段].name}】阶段`);
        
        // 如果成熟则收获
        if (crop.当前阶段 === 5) {
            harvested.push(seedConfig.harvest);
            
            // 添加到纳戒
            let itemType = "丹药";
            if (seedConfig.harvest === "悟道古茶树") itemType = "道具";
            await Add_najie_thing(player_qq, seedConfig.harvest, itemType, 1);
            
            // 移除作物
            world.药田.splice(i, 1);
        }
    }
    
    // 保存小世界数据
    const worldIndex = data.xiaoshijie.findIndex(w => w.player_qq === player_qq);
    data.xiaoshijie[worldIndex] = world;
    fs.writeFileSync(`${data.lib_path}/小世界列表.json`, JSON.stringify(data.xiaoshijie, null, 2));
    
    // 构建回复消息
    let msg = [
        `成功使用【${itemName}】！`,
        `小世界内所有作物生长加速！`,
    ];
    
    if (harvested.length > 0) {
        msg.push(`以下作物已成熟并收获：`);
        harvested.forEach(item => msg.push(`- ${item}`));
    } else {
        msg.push(`所有作物进入下一生长阶段`);
    }
    

   // msg.push(`【${itemName}】进入冷却，12小时后可再次使用`);
    
    e.reply(msg.join("\n"));
    return true;
}
checkShenyaoGrowth(world, hoursPassed) {
    const results = {
        harvested: [],
        grown: []
    };
    
    if (!world.药田 || world.药田.length === 0) {
        return results;
    }
    
    const timeFlow = world.attributes.时间流速.split(':');
    const timeRatio = parseInt(timeFlow[1]) / parseInt(timeFlow[0]);
    const now = new Date();
    
    for (let i = 0; i < world.药田.length; i++) {
        const plant = world.药田[i];
        const seedConfig = SHENYAO_SEEDS[plant.种子];
        
        if (plant.当前阶段 >= 5) continue;
        
        const growthRate = world.attributes.灵气浓度 / seedConfig.requirements.灵气浓度;
        const effectiveSeconds = hoursPassed * 3600 * timeRatio * growthRate;
        
        // 计算当前阶段已生长时间
        const startTime = new Date(plant.阶段开始时间);
        const elapsedSeconds = (now - startTime) / 1000;
        const adjustedElapsed = elapsedSeconds * timeRatio * growthRate;
        
        // 计算总可用生长时间（包括之前累积的时间）

        let totalGrowthTime = adjustedElapsed + effectiveSeconds;
        // 记录是否推进了阶段
        let advanced = false;
        
        // 循环推进阶段直到时间不足
        while (plant.当前阶段 < 5) {
            const currentStage = seedConfig.stages[plant.当前阶段];
            
            // 检查是否满足当前阶段所需时间
            if (totalGrowthTime >= currentStage.duration) {
                // 扣除当前阶段所需时间
                totalGrowthTime -= currentStage.duration;
                
                // 进入下一阶段
                plant.当前阶段++;
                advanced = true;
                
                // 记录生长日志
                plant.生长记录.push(`${now.toLocaleString()}: 进入【${seedConfig.stages[plant.当前阶段].name}】阶段`);
                
                // 记录生长信息
                results.grown.push(`【${seedConfig.harvest}】进入${seedConfig.stages[plant.当前阶段].name}阶段`);
                
                // 检查是否成熟
                if (plant.当前阶段 === 5) {
                    results.harvested.push(seedConfig.harvest);
                    world.药田.splice(i, 1);
                    i--;
                    break; // 成熟后跳出循环
                }
            } else {
                // 时间不足，更新阶段开始时间
                // 计算剩余时间对应的实际时间
                const remainingTime = totalGrowthTime / (timeRatio * growthRate);
                plant.阶段开始时间 = new Date(now - remainingTime * 1000).toLocaleString();
                break;
            }
        }
        
        // 如果没有推进阶段且没有成熟，更新阶段开始时间
        if (!advanced && plant.当前阶段 < 5) {
            plant.阶段开始时间 = now.toLocaleString();
        }
    }
    
    return results;
}
async forceRipenCrops(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    const player_qq = await channel(usr_qq);
    
    // 获取玩家小世界
    const world = data.xiaoshijie.find(w => w.player_qq === player_qq);
    if (!world) {
        e.reply('你尚未开辟小世界');
        return true;
    }
    
    // 检查是否有药田
    if (!world.药田 || world.药田.length === 0) {
        e.reply('你的小世界中没有种植任何作物');
        return true;
    }
    
    // 记录收获的神药
    const harvested = [];
    
     // 遍历药田，将所有作物催熟
   for (let i = world.药田.length - 1; i >= 0; i--) {
       const plant = world.药田[i];
       const seedConfig = SHENYAO_SEEDS[plant.种子];
       
       // 直接设置为成熟期
       plant.当前阶段 = 5;
       plant.阶段开始时间 = new Date().toLocaleString();
       plant.生长记录.push(`${new Date().toLocaleString()}: 管理员催熟，【${seedConfig.harvest}】已成熟`);
       
       // 添加到收获列表
       harvested.push(seedConfig.harvest);
       
       // 根据收获物名称判断类型
       let itemType = "丹药";
       if (seedConfig.harvest === "悟道古茶树") {
           itemType = "道具";
       }
       
       // 添加到纳戒 - 在循环内部添加
       await Add_najie_thing(player_qq, seedConfig.harvest, itemType, 1);
       
       // 移除成熟药株
       world.药田.splice(i, 1);
   }
    
    // 保存小世界数据
    const worldIndex = data.xiaoshijie.findIndex(w => w.player_qq === player_qq);
    data.xiaoshijie[worldIndex] = world;
    fs.writeFileSync(`${data.lib_path}/小世界列表.json`, JSON.stringify(data.xiaoshijie, null, 2));
    
    // 构建回复消息
    let replyMsg = [
        '【管理员催熟】',
        '你以无上伟力催熟小世界所有作物！',
        '成功收获以下神药：'
    ];
    
    // 添加收获的神药
    harvested.forEach(item => {
        replyMsg.push(`- ${item}`);
    });
    
    replyMsg.push('▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂');
    
    e.reply(replyMsg.join("\n"));
    return true;
}
async createEnvironmentWithItem(e) {
    if (!e.isGroup) return;
    
    // 提取物品名称（支持更灵活的匹配）
    const itemName = e.msg.replace(/^#使用|创造环境$/g, '').trim();
    
    if (!itemName) {
        return this.showEnvironmentHelp(e);
    }
    
    const player_qq = await channel(e.user_id);
    const world = data.xiaoshijie.find(w => w.player_qq === player_qq);
    
    if (!world) {
        e.reply('请先开辟小世界');
        return true;
    }
    
    // 道具与环境映射
    const itemEnvironmentMap = {
        "混沌源石": "混沌土",
        "仙泉之眼": "仙泉",
        "龙魂精魄": "龙穴",
        "雷池核心": "雷池",
        "仙坟土": "仙坟",
        "星辰核心": "星辰矿脉",
        "生命之种": "生命古树",
        "时间沙漏": "时间碎片"
    };
    
    // 检查道具是否有效
    if (!itemEnvironmentMap[itemName]) {
        e.reply([
            `无法使用【${itemName}】创造环境`,
            `可用道具列表：`,
            ...Object.keys(itemEnvironmentMap).map(item => `- ${item}`)
        ].join("\n"));
        return true;
    }
    
    const environment = itemEnvironmentMap[itemName];
    
    // 检查是否已有该环境
    if (world.attributes.特殊资源.includes(environment)) {
        e.reply(`你的小世界已拥有【${environment}】环境`);
        return true;
    }
    
    // 检查道具数量
    const itemCount = await exist_najie_thing(player_qq, itemName, "材料");
    if (itemCount < 1) {
        e.reply([
            `需要【${itemName}】x1`,
            `提示：你当前拥有 ${itemCount} 个`
        ].join("\n"));
        return true;
    }
    
    // 扣除道具并添加环境
    await Add_najie_thing(player_qq, itemName, "材料", -1);
    world.attributes.特殊资源.push(environment);
    
    // 保存数据
    const worldIndex = data.xiaoshijie.findIndex(w => w.player_qq === player_qq);
    data.xiaoshijie[worldIndex] = world;
    fs.writeFileSync(`${data.lib_path}/小世界列表.json`, JSON.stringify(data.xiaoshijie, null, 2));
    
    // 获取环境描述
    const environmentDesc = {
        "混沌土": "提升混沌属性神药生长速度",
        "仙泉": "提升水属性神药生长速度",
        "龙穴": "提升龙属性神药生长速度",
        "雷池": "提升雷属性神药生长速度",
        "仙坟": "提升阴属性神药生长速度",
        "星辰矿脉": "增加灵矿产量",
        "生命古树": "增加仙馐果产量",
        "时间碎片": "加速所有作物生长"
    };
    
    e.reply([
        `成功使用【${itemName}】在小世界创造【${environment}】环境！`,
        `效果：${environmentDesc[environment] || '特殊环境效果'}`
    ].join("\n"));
    
    return true;
}

// 显示环境帮助信息
async showEnvironmentHelp(e) {
    const helpText = [
        "【小世界环境创造指南】",
        "指令：#使用[道具名]创造环境",
        "可用道具及效果：",
        "- 混沌源石 → 混沌土（提升混沌属性神药生长）",
        "- 仙泉之眼 → 仙泉（提升水属性神药生长）",
        "- 龙魂精魄 → 龙穴（提升龙属性神药生长）",
        "- 雷池核心 → 雷池（提升雷属性神药生长）",
        "- 仙坟土 → 仙坟（提升阴属性神药生长）",
        "- 星辰核心 → 星辰矿脉（增加灵矿产量）",
        "- 生命之种 → 生命古树（增加仙馐果产量）",
        "- 时间沙漏 → 时间碎片（加速所有作物生长）",
    ];
    
    e.reply(helpText.join("\n"));
    return true;
}
  
  // 开辟小世界
  async createSmallWorld(e) {
    if (!e.isGroup) return;
    
    // 解析命令
    const match = e.msg.match(/^#开辟小世界 (.*)$/);
    if (!match) return false;
    
    const worldName = match[1].trim();
    const usr_qq = e.user_id;
    const player_qq = await channel(usr_qq);
    
    // 检查玩家是否存在
    if (!await existplayer(player_qq)) {
      e.reply("请先创建修仙角色");
      return true;
    }
    
    // 获取玩家数据
    const player = await Read_player(player_qq);
    
    // 确保小世界列表被初始化
    if (!data.xiaoshijie) {
      data.xiaoshijie = [];
    }
    
    // 检查是否已有小世界
    const existingWorld = data.xiaoshijie.find(w => w.player_qq === player_qq);
    if (existingWorld) {
      e.reply(`你已开辟【${existingWorld.world_name}】，无法再开辟新的小世界`);
      return true;
    }
    
    // 获取第一级配置
    const level1Config = WORLD_LEVELS[1];
    
    // 检查境界
    const playerLevel = data.Level_list.find(item => item.level_id == player.level_id);
    const requiredLevel = level1Config.requirements.境界;
    if (player.level_id < 42) {
        e.reply(`开辟小世界需要成仙`);
        return;
    }
    
    // 检查材料
    const materials = level1Config.requirements.材料;
    for (const [item, amount] of Object.entries(materials)) {
      const count = await exist_najie_thing(player_qq, item, "材料");
      if (count < amount) {
        e.reply(`开辟小世界需要${item}x${amount}`);
        return true;
      }
    }
    
    // 扣除材料
    for (const [item, amount] of Object.entries(materials)) {
      await Add_najie_thing(player_qq, item, "材料", -amount);
    }
    
    // 开辟小世界
    const newWorld = {
      player_qq: player_qq,
      player_name: player.名号 || player.name,
      world_name: worldName,
      level: 1,
      attributes: { ...level1Config.attributes },
      事件记录: [],
      creation_time: new Date().toLocaleString(),
      last_upgrade_time: null,
      药田: [] // 初始化药田
    };
    
    // 添加到小世界列表
    data.xiaoshijie.push(newWorld);
    // 保存到文件
    fs.writeFileSync(`${data.lib_path}/小世界列表.json`, JSON.stringify(data.xiaoshijie, null, 2));
    
    // 开辟文案
    const creationTexts = [
      `你以无上法力撕裂虚空，于混沌中开辟出一方小世界！`,
      `掌中世界，心中乾坤！你成功开辟【${newWorld.world_name}】！`,
      `虚空震荡，法则重组！一方新世界在你手中诞生！`,
      `混沌初开，鸿蒙始分！你成功开辟属于自己的小世界【${newWorld.world_name}】！`
    ];
    
    const worldDesc = [
      `◇◇◇【${newWorld.world_name}】◇◇◇`,
      `等级：混沌初开（1级）`,
      `灵气浓度：${newWorld.attributes.灵气浓度}`,
      `面积：${newWorld.attributes.面积}`,
      `时间流速：${newWorld.attributes.时间流速}`,
      `特殊资源：${newWorld.attributes.特殊资源.join('、') || '无'}`,
      `「此界初成，尚需精心培育方能成为洞天福地」`
    ];
    
    e.reply([
      creationTexts[Math.floor(Math.random() * creationTexts.length)],
      ...worldDesc
    ].join("\n"));
    
    return true;
  }
  
  async upgradeSmallWorld(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    const player_qq = await channel(usr_qq);
    
    // 获取玩家小世界
    const world = data.xiaoshijie.find(w => w.player_qq === player_qq);
    if (!world) {
        e.reply('请先使用 #开辟小世界 创建你的小世界');
        return true;
    }
    
    // 获取下一等级配置
    const nextLevel = world.level + 1;
    const levelConfig = WORLD_LEVELS[nextLevel];
    
    if (!levelConfig) {
        e.reply(`你的小世界已达到最高等级（${world.level}级），无法继续升级`);
        return true;
    }
    
    // 获取玩家数据
    const player = await Read_player(player_qq);
    if (!player) {
        e.reply('角色数据异常');
        return true;
    }
    
    if (player.level_id < 47) {
        e.reply(`演化小世界需要大罗金仙`);
        return;
    }
    
    // 检查材料
    const materials = levelConfig.requirements.材料;
    for (const [item, amount] of Object.entries(materials)) {
        const count = await exist_najie_thing(player_qq, item, "材料");
        if (count < amount) {
            e.reply(`演化小世界需要${item}x${amount}`);
            return true;
        }
    }
    
    // 扣除材料
    for (const [item, amount] of Object.entries(materials)) {
        await Add_najie_thing(player_qq, item, "材料", -amount);
    }
    
    // 保存原有的特殊资源
    const existingResources = [...world.attributes.特殊资源];
    
    // 升级小世界，保留原有特殊资源
    world.level = nextLevel;
    world.attributes = {
        ...levelConfig.attributes,
        特殊资源: existingResources  // 保留原有资源
    };
    world.last_upgrade_time = new Date().toLocaleString();
    
    // 随机添加新资源
    const newResources = [];
    const availableResources = [...SPECIAL_RESOURCES];
    
    // 确保不重复
    for (let i = 0; i < Math.min(2, availableResources.length); i++) {
        const randomIndex = Math.floor(Math.random() * availableResources.length);
        const resource = availableResources.splice(randomIndex, 1)[0];
        
        // 如果已有该资源，则跳过
        if (world.attributes.特殊资源.includes(resource)) {
            continue;
        }
        
        newResources.push(resource);
    }
    
    // 添加新资源
    world.attributes.特殊资源.push(...newResources);
    
    // 保存小世界
    const worldIndex = data.xiaoshijie.findIndex(w => w.player_qq === player_qq);
    if (worldIndex !== -1) {
        data.xiaoshijie[worldIndex] = world;
        // 保存到文件
        fs.writeFileSync(`${data.lib_path}/小世界列表.json`, JSON.stringify(data.xiaoshijie, null, 2));
    }
    
    // 升级文案
    const upgradeTexts = [
        `天地震荡，法则重组！你的小世界【${world.world_name}】成功晋升为【${levelConfig.name}】！`,
        `鸿蒙演化，世界晋升！【${world.world_name}】已升级为【${levelConfig.name}】！`,
        `乾坤再造，世界升华！你的小世界完成蜕变！`,
        `大道共鸣，世界跃迁！【${world.world_name}】成功晋升！`
    ];
    
    const newDesc = [
        `◇◇◇【${world.world_name}】◇◇◇`,
        `等级：${levelConfig.name}（${world.level}级）`,
        `灵气浓度：${world.attributes.灵气浓度}`,
        `面积：${world.attributes.面积}`,
        `时间流速：${world.attributes.时间流速}`,
        `特殊资源：${world.attributes.特殊资源.join('、') || '无'}`,
        `「世界晋升，大道可期！」`
    ];
    
    e.reply([
        upgradeTexts[Math.floor(Math.random() * upgradeTexts.length)],
        ...newDesc
    ].join("\n"));
    
    return true;
}
  
  // 创建分身
  async createAvatar(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    const player_qq = await channel(usr_qq);
    
    // 获取玩家数据
    const player = await Read_player(player_qq);
    if (!player) {
      e.reply('请先创建角色');
      return true;
    }
    
    // 获取玩家小世界
    const world = data.xiaoshijie.find(w => w.player_qq === player_qq);
    if (!world) {
      e.reply('请先使用 #开辟小世界 创建你的小世界');
      return true;
    }
    
    // 检查是否已有分身
    if (world.avatar) {
      e.reply('你已化入分身在小世界中，无需再次化入');
      return true;
    }
    
    // 检查修为是否足够
    const cultivationCost = 1000000; // 消耗1000000点修为
    if (player.修为 < cultivationCost) {
      e.reply(`化入分身需要${cultivationCost}点修为，你只有${player.修为}点`);
      return true;
    }
    
    // 扣除修为
    player.修为 -= cultivationCost;
    await Write_player(player_qq, player);
    
    // 创建分身
    world.avatar = {
      created_time: new Date().toLocaleString(),
      last_harvest_time: new Date().toLocaleString(),
      resources: {}
    };
    
    // 保存小世界数据
    const worldIndex = data.xiaoshijie.findIndex(w => w.player_qq === player_qq);
    data.xiaoshijie[worldIndex] = world;
    fs.writeFileSync(`${data.lib_path}/小世界列表.json`, JSON.stringify(data.xiaoshijie, null, 2));
    
    e.reply(`你消耗${cultivationCost}点修为，化出一道分身进入【${world.world_name}】！\n分身将自动收集资源，最多积累12小时的资源`);
    
    return true;
  }
  
  // 资源计算函数
  calculateResources(world, hours) {
    // 基础资源产量（根据小世界等级）
    const baseProduction = {
      1: { '灵石': 100000, '仙馐果': 50 },
      2: { '灵石': 200000, '仙馐果': 100, '灵矿': 5 },
      3: { '灵石': 300000, '仙馐果': 100, '灵矿': 10, '仙果': 5 },
      4: { '灵石': 500000, '仙馐果': 200, '灵矿': 10, '仙果': 10, '混沌元液': 3 },
      5: { '灵石': 800000, '仙馐果': 300, '灵矿': 20, '仙果': 15, '混沌元液': 5 }
    };
    
    // 获取基础产量
    const base = baseProduction[world.level] || baseProduction[1];
    const resources = {};
    for (const [res, amount] of Object.entries(base)) {
      resources[res] = Math.floor(amount * hours);
    }
    
    // 特殊资源加成
    if (world.attributes.特殊资源.includes('先天灵泉')) {
      resources['仙馐果'] = Math.floor(resources['仙馐果'] * 15);
    }
    if (world.attributes.特殊资源.includes('星辰矿脉')) {
      resources['灵矿'] = Math.floor(resources['灵矿'] * 15);
    }
    if (world.attributes.特殊资源.includes('混沌灵根')) {
      resources['混沌元液'] = Math.floor((resources['混沌元液'] || 0) * 15);
    }
    if (world.attributes.特殊资源.includes('太初神木')) {
      resources['仙果'] = Math.floor(resources['仙果'] * 15);
    }
    if (world.attributes.特殊资源.includes('虚空晶石')) {
      resources['灵石'] = Math.floor(resources['灵石'] * 15);
    }
    
    return resources;
  }
  
  // 收获资源
  async harvestResources(e) {
    if (!e.isGroup) return;
    
    const usr_qq = e.user_id;
    const player_qq = await channel(usr_qq);
    
    // 获取玩家小世界
    const world = data.xiaoshijie.find(w => w.player_qq === player_qq);
    if (!world) {
      e.reply('请先使用 #开辟小世界 创建你的小世界');
      return true;
    }
    
    // 检查是否有分身
    if (!world.avatar) {
      e.reply('请先使用 #将分身化入小世界 创建分身');
      return true;
    }
    
    // 解析时间流速
    const timeFlow = world.attributes.时间流速.split(':');
    const timeRatio = parseInt(timeFlow[1]) / parseInt(timeFlow[0]);
    
    // 计算可收获资源
    const now = new Date();
    const lastHarvest = new Date(world.avatar.last_harvest_time);
    const hoursPassed = (now - lastHarvest) / (1000 * 60 * 60);
    
    // 应用时间流速
    const effectiveHoursPassed = hoursPassed * timeRatio;
    
    // 最多积累24小时的资源
    const maxHours = 24;
    const harvestHours = Math.min(effectiveHoursPassed, maxHours);
    
    if (harvestHours <= 0) {
      e.reply('距离上次收获时间太短，暂无资源可收获');
      return true;
    }
    
    // 计算资源产量
    const resources = this.calculateResources(world, harvestHours);
    
    // 添加资源到纳戒
    for (const [resource, amount] of Object.entries(resources)) {
      switch(resource) {
        case '灵石':
          // 使用 Add_灵石 方法添加灵石
          await Add_灵石(player_qq, amount);
          break;
          
        case '仙馐果':
          await Add_najie_thing(player_qq, '仙馐果', '食材', amount);
          break;
          
        case '灵矿':
          // 作为道具添加到纳戒
          await Add_najie_thing(player_qq, '灵矿', '道具', amount);
          break;
          
        case '仙果':
          // 作为丹药添加到纳戒
          await Add_najie_thing(player_qq, '仙果', '丹药', amount);
          break;
          
        case '混沌元液':
          // 作为丹药添加到纳戒
          await Add_najie_thing(player_qq, '混沌元液', '丹药', amount);
          break;
      }
    }
    
    // 检查神药生长
    const shenyaoResults = this.checkShenyaoGrowth(world, harvestHours);
    
       // 处理收获的神药
   for (const shenyao of shenyaoResults.harvested) {
     // 根据神药名称添加属性加成
     switch(shenyao) {
       case '九妙不死药':
         // 添加修为和血气
         await Add_修为(player_qq, 35000000);
         await Add_血气(player_qq, 35000000);
         break;
         
       case '真龙不死药':
       case '神凰不死药':
         await Add_修为(player_qq, 8000000);
         await Add_血气(player_qq, 8000000);
         break;
         
       case '麒麟神药':
       case '玄武神药':
         await Add_修为(player_qq, 5000000);
         await Add_血气(player_qq, 5000000);
         break;
    case '蟠桃仙果':
         await Add_修为(player_qq, 15000000);
         await Add_血气(player_qq, 15000000);
         break;
     }
     
     // 根据神药名称判断类型
     let itemType = "丹药";
     if (shenyao === "悟道古茶树") {
       itemType = "道具";
     }
     
     // 添加到纳戒
     await Add_najie_thing(player_qq, shenyao, itemType, 1);
   }
    
    // 更新收获时间
    world.avatar.last_harvest_time = now.toLocaleString();
    
    // 保存小世界数据
    const worldIndex = data.xiaoshijie.findIndex(w => w.player_qq === player_qq);
    data.xiaoshijie[worldIndex] = world;
    fs.writeFileSync(`${data.lib_path}/小世界列表.json`, JSON.stringify(data.xiaoshijie, null, 2));
    
    // 构建收获信息
    const resourceList = Object.entries(resources)
      .map(([res, amount]) => `${res}x${amount}`)
      .join('、');
    
    // 添加时间流速信息
    const timeFlowInfo = `时间流速 ${world.attributes.时间流速}（加速${timeRatio}倍）`;
    
    // 构建回复消息
    let replyMsg = [
      `成功收获分身收集的资源：${resourceList}`,
      timeFlowInfo
    ];
    
    // 添加神药收获信息
    if (shenyaoResults.harvested.length > 0) {
      replyMsg.push(
        `【神药成熟】`,
        ...shenyaoResults.harvested.map(item => `收获【${item}】`)
      );
    }
    
    if (shenyaoResults.grown.length > 0) {
      replyMsg.push(
        `【神药生长】`,
        ...shenyaoResults.grown
      );
    }
    
    replyMsg.push(`分身将继续在【${world.world_name}】中收集资源`);
    
    e.reply(replyMsg.join("\n"));
    
    return true;
  }
//    // 查看小世界
// async viewSmallWorld(e) {
//     if (!e.isGroup) return;
    
//     const usr_qq = e.user_id;
//     const player_qq = await channel(usr_qq);
    
//     // 确保小世界列表被初始化
//     if (!data.xiaoshijie) {
//         data.xiaoshijie = [];
//     }
    
//     // 获取玩家小世界
//     const world = data.xiaoshijie.find(w => w.player_qq === player_qq);
//     if (!world) {
//         e.reply('请先使用 #开辟小世界 创建你的小世界');
//         return true;
//     }
    
//     // 获取等级名称
//     const levelName = WORLD_LEVELS[world.level]?.name || `未知等级${world.level}`;
    
//     // 解析时间流速
//     const timeFlow = world.attributes.时间流速.split(':');
//     const timeRatio = parseInt(timeFlow[1]) / parseInt(timeFlow[0]);
    
//     // 构建消息数组
//     let msg = [
//         `---【${world.world_name}】---`,
//         `开辟者：${world.player_name}`,
//         `等级：${levelName}（${world.level}级）`,
//         `开辟时间：${world.creation_time}`,
//         world.last_upgrade_time ? `上次升级：${world.last_upgrade_time}` : '',
//         `灵气浓度：${world.attributes.灵气浓度}`,
//         `面积：${world.attributes.面积}`,
//         `时间流速：${world.attributes.时间流速}（加速${timeRatio}倍）`,
//         `药田容量：${world.药田?.length || 0}/${world.attributes.药田上限}株`,
//         `特殊资源：${world.attributes.特殊资源.join('、') || '无'}`,
//     ];
    
//     // 添加药田信息
//     msg.push(`---【神药药田】---`);
//     if (world.药田 && world.药田.length > 0) {
//         const now = new Date();
        
//         world.药田.forEach(plant => {
//             const seedConfig = SHENYAO_SEEDS[plant.种子];
//             const stageInfo = seedConfig.stages[plant.当前阶段];
            
//             // 计算当前阶段剩余时间
//             let stageRemaining = "已成熟";
//             let totalRemaining = "已成熟";
            
//             if (plant.当前阶段 < 5) {
//                 const startTime = new Date(plant.阶段开始时间);
//                 const elapsedSeconds = (now - startTime) / 1000;
                
//                 // 计算生长速率（灵气浓度影响）
//                 const growthRate = world.attributes.灵气浓度 / seedConfig.requirements.灵气浓度;
//                 const adjustedElapsed = elapsedSeconds * timeRatio * growthRate;
//                 const remainingSeconds = Math.max(0, stageInfo.duration - adjustedElapsed);
                
//                 // 转换为天、小时、分钟
//                 const days = Math.floor(remainingSeconds / 86400);
//                 const hours = Math.floor((remainingSeconds % 86400) / 3600);
//                 const minutes = Math.floor((remainingSeconds % 3600) / 60);
                
//                 stageRemaining = `${days}天${hours}小时${minutes}分钟`;
                
//                 // 计算整株神药剩余时间
//                 let totalSeconds = 0;
//                 for (let stage = plant.当前阶段; stage <= 4; stage++) {
//                     totalSeconds += seedConfig.stages[stage].duration;
//                 }
                
//                 // 应用时间流速和灵气浓度
//                 const adjustedTotal = totalSeconds / (timeRatio * growthRate);
                
//                 // 转换为天、小时、分钟
//                 const totalDays = Math.floor(adjustedTotal / 86400);
//                 const totalHours = Math.floor((adjustedTotal % 86400) / 3600);
//                 const totalMinutes = Math.floor((adjustedTotal % 3600) / 60);
                
//                 totalRemaining = `${totalDays}天${totalHours}小时${totalMinutes}分钟`;
//             }
            
//             // 构建每条神药信息
//             const plantMsg = [
//                 `神药：${seedConfig.harvest}`,
//                 `种子：${plant.种子}`,
//                 `当前阶段：${stageInfo.name}（${stageRemaining}后进入下一阶段）`,
//                 `预计成熟：${totalRemaining}`,
//                 `种植时间：${plant.种植时间}`
//             ]
            
//             msg.push(plantMsg);
//         });
//     } else {
//         msg.push(`药田暂无神药种植`);
//     }
    
//     // 添加分身信息
//     if (world.avatar) {
//         msg.push(`---【分身状态】---`);
        
//         const now = new Date();
//         const lastHarvest = new Date(world.avatar.last_harvest_time);
//         const hoursPassed = (now - lastHarvest) / (1000 * 60 * 60);
//         const effectiveHours = hoursPassed * timeRatio;
//         const maxHours = 24;
//         const harvestHours = Math.min(effectiveHours, maxHours);
        
//         // 计算可收获资源量
//         const resources = this.calculateResources(world, harvestHours);
//         const resourceList = Object.entries(resources)
//             .map(([res, amount]) => `${res}x${amount}`)
//             .join('、');
        
//         const avatarMsg = [
//             `分身已收集资源：${harvestHours.toFixed(1)}小时`,
//             `可收获资源：${resourceList || '无'}`,
//             `上次收获：${world.avatar.last_harvest_time}`,
//             `最大积累：24小时资源`
//         ]
        
//         msg.push(avatarMsg);
//     }
    
//     // 添加事件记录
//     if (world.事件记录 && world.事件记录.length > 0) {
//         msg.push(`◇◇◇【近期事件】◇◇◇`);
//         // 显示最近3条事件
//         const recentEvents = world.事件记录.slice(-3);
//         recentEvents.forEach(event => {
//             const eventMsg = [
//                 `[${event.时间}]`,
//                 `${event.事件}：${event.描述}`
//             ].join('\n');
            
//             msg.push(eventMsg);
//         });
//     }
    
//     // 添加等级描述
//     const levelDescriptions = {
//         1: `「混沌初开，万物始生」`,
//         2: `「鸿蒙初判，阴阳始分」`,
//         3: `「紫府洞天，仙家福地」`,
//         4: `「太虚仙境，超凡脱俗」`,
//         5: `「洪荒世界，开天辟地」`
//     };
    
//     msg.push(levelDescriptions[world.level] || `「此界玄妙，难以言表」`);
    
//     // 使用ForwardMsg发送消息
//     await ForwardMsg(e, msg);
//     return true;
// }
  // 查看小世界
async viewSmallWorld(e) {
 let img = await get_xiaoshijie_img(e);
     e.reply(img);
     return false;}
async plantShenyao(e) {
    if (!e.isGroup) return;
    
    // 提取种子名称（支持更灵活的匹配）
    const seedName = e.msg.replace(/^#小世界栽种/, '').trim();
    
    if (!seedName) {
        return this.showPlantingHelp(e);
    }
    
    const usr_qq = e.user_id;
    const player_qq = await channel(usr_qq);
    
    // 获取玩家小世界
    const world = data.xiaoshijie.find(w => w.player_qq === player_qq);
    if (!world) {
        e.reply('请先开辟小世界');
        return true;
    }
    
    // 检查药田容量
    const maxFields = world.attributes.药田上限 || 0;
    if (world.药田 && world.药田.length >= maxFields) {
        e.reply([
            `药田已满（${world.药田.length}/${maxFields}）`,
            `提示：升级小世界可增加药田容量`
        ].join("\n"));
        return true;
    }
    
    // 查找匹配的种子配置（支持模糊匹配）
    let seedConfig;
    for (const key in SHENYAO_SEEDS) {
        if (key.includes(seedName)) {
            seedConfig = SHENYAO_SEEDS[key];
            break;
        }
    }
    
    if (!seedConfig) {
        return this.showPlantingHelp(e, `未找到【${seedName}】种子`);
    }
    
    // 检查种子数量
    const seedCount = await exist_najie_thing(player_qq, seedConfig.name, "材料");
    if (seedCount < 1) {
        e.reply([
            `需要【${seedConfig.name}】x1`,
            `提示：你当前拥有 ${seedCount} 个`
        ].join("\n"));
        return true;
    }
    
    // 检查种植条件
    const requirements = seedConfig.requirements || {};
    if (requirements.灵气浓度 && world.attributes.灵气浓度 < requirements.灵气浓度) {
        e.reply([
            `灵气浓度不足（需要${requirements.灵气浓度}，当前${world.attributes.灵气浓度}）`,
            `提示：升级小世界可提升灵气浓度`
        ].join("\n"));
        return true;
    }
    
    if (requirements.特殊环境) {
        const missingEnvironments = requirements.特殊环境.filter(env => 
            !world.attributes.特殊资源.includes(env)
        );
        
        if (missingEnvironments.length > 0) {
            e.reply([
                `缺少特殊环境：${missingEnvironments.join('、')}`,
                `提示：使用 #使用[道具]创造环境 创建所需环境`
            ].join("\n"));
            return true;
        }
    }
    
    // 扣除种子
    await Add_najie_thing(player_qq, seedConfig.name, "草药", -1);
    
    // 添加作物
    if (!world.药田) world.药田 = [];
    
    world.药田.push({
        种子: seedConfig.name,
        当前阶段: 1,
        阶段开始时间: new Date().toLocaleString(),
        种植时间: new Date().toLocaleString(),
        生长记录: [`${new Date().toLocaleString()}: 种植【${seedConfig.name}】`]
    });
    
    // 保存小世界数据
    const worldIndex = data.xiaoshijie.findIndex(w => w.player_qq === player_qq);
    data.xiaoshijie[worldIndex] = world;
    fs.writeFileSync(`${data.lib_path}/小世界列表.json`, JSON.stringify(data.xiaoshijie, null, 2));
    
    // 获取生长信息
    const stageInfo = seedConfig.stages[1];
    const growthInfo = [
        `成功种植【${seedConfig.name}】！`,
        `当前阶段：${stageInfo.name}`,
        `阶段描述：${stageInfo.desc}`,
        `预计成熟：${this.calculateGrowthTime(seedConfig, world)}`
    ];
    
    if (world.药田.length >= maxFields) {
        growthInfo.push(`⚠️ 药田已满（${world.药田.length}/${maxFields}），无法种植更多作物`);
    }
    
    e.reply(growthInfo.join("\n"));
    return true;
}

// 计算生长时间
calculateGrowthTime(seedConfig, world) {
    let totalSeconds = 0;
    for (let stage = 1; stage <= 4; stage++) {
        totalSeconds += seedConfig.stages[stage].duration;
    }
    
    // 应用时间流速
    const timeFlow = world.attributes.时间流速.split(':');
    const timeRatio = parseInt(timeFlow[1]) / parseInt(timeFlow[0]);
    totalSeconds /= timeRatio;
    
    // 转换为天、小时
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    
    return `${days}天${hours}小时`;
}

// 显示种植帮助信息
async showPlantingHelp(e, errorMsg = "") {
    const helpText = [
        "【小世界神药种植指南】",
        "指令：#小世界栽种[种子名]",
        "可用种子列表："
    ];
    
    // 添加种子列表
    for (const key in SHENYAO_SEEDS) {
        const seed = SHENYAO_SEEDS[key];
        const requirements = [];
        
        if (seed.requirements?.灵气浓度) {
            requirements.push(`灵气≥${seed.requirements.灵气浓度}`);
        }
        
        if (seed.requirements?.特殊环境) {
            requirements.push(`需要${seed.requirements.特殊环境.join('、')}`);
        }
        
        helpText.push(`- ${seed.name} → ${seed.harvest} ${requirements.length ? `(${requirements.join('，')})` : ''}`);
    }
    
    helpText.push(
        "",
        "提示：",
        "1. 使用 #查看小世界 查看当前种植情况",
        "2. 使用 #使用[道具]创造环境 创建特殊环境"
    );
    
    if (errorMsg) {
        helpText.unshift(errorMsg);
    }
    
    e.reply(helpText.join("\n"));
    return true;
}}
export async function get_xiaoshijie_img(e) {
    try {
        const usr_qq = e.user_id;
        const player_qq = await channel(usr_qq);
        
        // 验证玩家是否存在
        if (!data.existData('player', usr_qq)) {
            return e.reply('玩家数据不存在');
        }
        
        // 获取玩家数据
        const player = await data.getData('player', usr_qq);
        
        // 确保小世界列表存在
        if (!data.xiaoshijie) {
            data.xiaoshijie = [];
        }
        
        // 获取玩家小世界
        const world = data.xiaoshijie.find(w => w.player_qq === player_qq);
        if (!world) {
            return e.reply('请先使用 #开辟小世界 创建您的小世界');
        }
        
        // 确保属性存在
        world.attributes = world.attributes || {};
        world.attributes.时间流速 = world.attributes.时间流速 || '1:1';
        world.attributes.特殊资源 = world.attributes.特殊资源 || [];
        world.attributes.药田上限 = world.attributes.药田上限 || 0;
        
        // 获取等级名称
        const levelName = WORLD_LEVELS[world.level]?.name || `未知等级${world.level}`;
        
        // 计算时间比率
        const timeFlow = world.attributes.时间流速.split(':');
        const timeRatio = parseInt(timeFlow[1]) / parseInt(timeFlow[0]);
        
        // 准备渲染数据
        const renderData = {
            user_id: usr_qq,
            nickname: player.名号 || "未知玩家",
            world_name: world.world_name || "未命名小世界",
            level: world.level,
            level_name: levelName,
            creation_time: world.creation_time,
            last_upgrade_time: world.last_upgrade_time || "从未升级",
            attributes: world.attributes,
            description: getWorldDescription(world.level),
            unlockedCount: world.药田?.length || 0,
            totalCount: world.attributes.药田上限,
            timeRatio: timeRatio,
            // 添加预计算描述文本
            spirit_desc: world.attributes.灵气浓度 > 5000 
                ? '灵气充盈，适宜修炼' 
                : '灵气稀薄，需提升',
            area_desc: world.level > 2
                ? '山川河流，自成天地'
                : '初具规模，尚需扩展',
            capacity_desc: world.attributes.药田上限 > (world.药田?.length || 0)
                ? '可种植更多灵植'
                : '药田已满',
            progressPercent: ((world.药田?.length || 0) / world.attributes.药田上限 * 100).toFixed(1),
            now: new Date().toLocaleString()
        };
        
        // 生成特殊资源HTML
        renderData.special_resources_html = generateSpecialResourcesHTML(world);
        
        // 生成药田信息HTML
        renderData.medicine_field_html = generateMedicineFieldHTML(world, timeRatio);
        
        // 生成分身信息HTML
        renderData.avatar_html = generateAvatarHTML(world, timeRatio);
        
        // 生成事件记录HTML
        renderData.events_html = generateEventsHTML(world);
        
        // 获取渲染数据并生成截图
        const templateData = await new Show(e).get_xiaoshijieData(renderData);
        return await puppeteer.screenshot('xiaoshijie', templateData);
        
    } catch (err) {
        console.error('生成小世界截图错误:', err);
        return e.reply('处理小世界数据时发生错误');
    }
}

// 生成特殊资源HTML
function generateSpecialResourcesHTML(world) {
    if (!world.attributes.特殊资源 || world.attributes.特殊资源.length === 0) {
        return '<div class="no-resources">暂无特殊资源</div>';
    }
    
    return world.attributes.特殊资源.map(res => {
        const iconClass = getResourceIcon(res);
        return `
            <div class="resource-item">
                <div class="resource-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="resource-name">${res}</div>
            </div>
        `;
    }).join('');
}

// 生成药田信息HTML
function generateMedicineFieldHTML(world, timeRatio) {
    if (!world.药田 || world.药田.length === 0) {
        return '<div class="no-plants">药田暂无神药种植</div>';
    }
    
    const now = new Date();
    
    return world.药田.map(plant => {
        const seedConfig = SHENYAO_SEEDS[plant.种子];
        if (!seedConfig) return '';
        
        const stageInfo = seedConfig.stages[plant.当前阶段];
        if (!stageInfo) return '';
        
        // 计算进度百分比
        let progressPercent = 0;
        let stageRemaining = "已成熟";
        let totalRemaining = "已成熟";
        
        if (plant.当前阶段 < 5) {
            const startTime = new Date(plant.阶段开始时间);
            const elapsedSeconds = (now - startTime) / 1000;
            
            // 计算生长速率（灵气浓度影响）
            const growthRate = world.attributes.灵气浓度 / (seedConfig.requirements?.灵气浓度 || 1);
            const adjustedElapsed = elapsedSeconds * timeRatio * growthRate;
            progressPercent = Math.min(100, (adjustedElapsed / stageInfo.duration) * 100);
            
            const remainingSeconds = Math.max(0, stageInfo.duration - adjustedElapsed);
            
            // 转换为天、小时、分钟
            const days = Math.floor(remainingSeconds / 86400);
            const hours = Math.floor((remainingSeconds % 86400) / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            
            stageRemaining = `${days}天${hours}小时${minutes}分钟`;
            
            // 计算整株神药剩余时间
            let totalSeconds = 0;
            for (let stage = plant.当前阶段; stage <= 4; stage++) {
                totalSeconds += seedConfig.stages[stage].duration;
            }
            
            // 应用时间流速和灵气浓度
            const adjustedTotal = totalSeconds / (timeRatio * growthRate);
            
            // 转换为天、小时、分钟
            const totalDays = Math.floor(adjustedTotal / 86400);
            const totalHours = Math.floor((adjustedTotal % 86400) / 3600);
            const totalMinutes = Math.floor((adjustedTotal % 3600) / 60);
            
            totalRemaining = `${totalDays}天${totalHours}小时${totalMinutes}分钟`;
        } else {
            progressPercent = 100;
        }
        
        return `
            <div class="field-item">
                <div class="plant-name">
                    <i class="fas fa-seedling plant-icon"></i>
                    ${seedConfig.harvest}
                </div>
                
                <div class="plant-stats">
                    <div class="plant-stat">
                        <div class="stat-label">当前阶段</div>
                        <div class="stat-value">${stageInfo.name} (${plant.当前阶段}/5)</div>
                    </div>
                    
                    <div class="plant-stat">
                        <div class="stat-label">种植时间</div>
                        <div class="stat-value">${plant.种植时间}</div>
                    </div>
                    
                    <div class="plant-stat">
                        <div class="stat-label">阶段剩余</div>
                        <div class="stat-value">${stageRemaining}</div>
                    </div>
                    
                    <div class="plant-stat">
                        <div class="stat-label">成熟剩余</div>
                        <div class="stat-value">${totalRemaining}</div>
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-label">
                        <span>生长进度</span>
                        <span>${progressPercent.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent.toFixed(1)}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 生成分身信息HTML
function generateAvatarHTML(world, timeRatio) {
    if (!world.avatar) {
        return '';
    }
    
    const now = new Date();
    const lastHarvest = new Date(world.avatar.last_harvest_time);
    const hoursPassed = (now - lastHarvest) / (1000 * 60 * 60);
    const effectiveHours = hoursPassed * timeRatio;
    const maxHours = 24;
    const harvestHours = Math.min(effectiveHours, maxHours);
    
    // 计算可收获资源量
    const resources = calculateResources(world, harvestHours);
    
    // 构建资源卡片HTML
    const resourcesHTML = Object.entries(resources).map(([name, value]) => {
        const iconClass = getResourceIcon(name);
        const desc = getResourceDesc(name);
        return `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="stat-title">${name}</div>
                <div class="stat-value">${value}</div>
                <div class="stat-desc">
                    ${desc}
                </div>
            </div>
        `;
    }).join('');
    
    // 添加时间流速信息
    const timeFlowInfo = `时间流速 ${world.attributes.时间流速}（加速${timeRatio}倍）`;
    
    return `
        <div class="section">
            <div class="section-title">分身状态</div>
            <div class="avatar-stats">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-user-clock"></i></div>
                    <div class="stat-title">已收集时间</div>
                    <div class="stat-value">${harvestHours.toFixed(1)}小时</div>
                    <div class="stat-desc">最大积累：24小时</div>
                </div>
                ${resourcesHTML}
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-hourglass"></i></div>
                    <div class="stat-title">时间流速</div>
                    <div class="stat-value">${world.attributes.时间流速}</div>
                    <div class="stat-desc">加速${timeRatio}倍</div>
                </div>
            </div>
        </div>
    `;
}

// 生成事件记录HTML
function generateEventsHTML(world) {
    if (!world.事件记录 || world.事件记录.length === 0) {
        return '<div class="no-events">暂无近期事件</div>';
    }
    
    const recentEvents = world.事件记录.slice(-3);
    
    return recentEvents.map(event => {
        return `
            <div class="event-item">
                <div class="event-time">${event.时间}</div>
                <div class="event-desc">${event.事件}：${event.描述}</div>
            </div>
        `;
    }).join('');
}


// 辅助函数：获取小世界描述
function getWorldDescription(level) {
    const descriptions = {
        1: '「混沌初开，万物始生」',
        2: '「鸿蒙初判，阴阳始分」',
        3: '「紫府洞天，仙家福地」',
        4: '「太虚仙境，超凡脱俗」',
        5: '「洪荒世界，开天辟地」'
    };
    return descriptions[level] || '「此界玄妙，难以言表」';
}

// 资源计算函数 - 与收获资源函数保持一致
function calculateResources(world, hours) {
    // 基础资源产量（根据小世界等级）
    const baseProduction = {
        1: { '灵石': 1000000, '仙馐果': 500 },
        2: { '灵石': 2000000, '仙馐果': 1000, '灵矿': 50 },
        3: { '灵石': 3000000, '仙馐果': 1000, '灵矿': 100, '仙果': 50 },
        4: { '灵石': 15000000, '仙馐果': 2000, '灵矿': 100, '仙果': 100, '混沌元液': 30 },
        5: { '灵石': 28000000, '仙馐果': 5000, '灵矿': 400, '仙果': 450, '混沌元液': 450 }
    };
    
    // 获取基础产量
    const base = baseProduction[world.level] || baseProduction[1];
    const resources = {};
    for (const [res, amount] of Object.entries(base)) {
        resources[res] = Math.floor(amount * hours);
    }
    
    // 特殊资源加成 - 与收获资源函数保持一致
    if (world.attributes.特殊资源.includes('先天灵泉')) {
        resources['仙馐果'] = Math.floor(resources['仙馐果'] * 15);
    }
    if (world.attributes.特殊资源.includes('星辰矿脉')) {
        resources['灵矿'] = Math.floor(resources['灵矿'] * 15);
    }
    if (world.attributes.特殊资源.includes('混沌灵根')) {
        resources['混沌元液'] = Math.floor((resources['混沌元液'] || 0) * 15);
    }
    if (world.attributes.特殊资源.includes('太初神木')) {
        resources['仙果'] = Math.floor(resources['仙果'] * 15);
    }
    if (world.attributes.特殊资源.includes('虚空晶石')) {
        resources['灵石'] = Math.floor(resources['灵石'] * 15);
    }
    
    return resources;
}

// 获取资源图标类名
function getResourceIcon(resource) {
    if (resource.includes('泉')) return 'fa-water';
    if (resource.includes('矿')) return 'fa-gem';
    if (resource.includes('树')) return 'fa-tree';
    if (resource.includes('气')) return 'fa-wind';
    if (resource.includes('石')) return 'fa-diamond';
    if (resource.includes('果')) return 'fa-apple-alt';
    return 'fa-star';
}

// 获取资源描述
function getResourceDesc(resource) {
    if (resource === '灵石') return '可用于交易和修炼';
    if (resource === '仙馐果') return '可增加小许饱食度';
    if (resource === '灵矿') return '可用于卖些许灵石';
    if (resource === '仙果') return '提升小量修为与血气';
    if (resource === '混沌元液') return '提升大量修为与血气';
    return '珍稀资源';
}