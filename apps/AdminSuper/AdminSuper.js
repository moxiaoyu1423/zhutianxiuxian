import fs from 'fs';
import { plugin, puppeteer, verc, data, Show, config } from '../../api/api.js';
import { AppName } from '../../app.config.js';
import XiuxianData from '../../model/XiuxianData.js';
import {
  existplayer,
  Write_player,
  Read_updata_log,
  Add_najie_thing,
  exist_najie_thing,
  Read_Exchange,
  Write_Exchange,
  get_player_img,
  Read_qinmidu,
  Write_qinmidu,
  channel
} from '../../model/xiuxian.js';
import { Read_player, __PATH } from '../../model/xiuxian.js';
export class AdminSuper extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_AdminSuper',
      dsc: '修仙设置',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#解封.*$',
          fnc: 'relieve',
        },
        {
          reg: '^#解除所有$',
          fnc: 'Allrelieve',
        },
         {
          reg: '^#解除法身$',
          fnc: 'relieveFashanAction',
        },
        {
          reg: '^#打落凡间.*$',
          fnc: 'Knockdown',
        },
        {
          reg: '^#清除冲水堂$',
          fnc: 'Deleteexchange',
        },
        {
          reg: '^#查看日志$',
          fnc: 'show_log',
        },
        {
          reg: '^#解散宗门.*$',
          fnc: 'jiesan_ass',
        },
        {
          reg: '#将米娜桑的纳戒里叫.*的的的(装备|道具|丹药|功法|草药|材料|仙宠|口粮)(抹除|替换为叫.*之之之(装备|道具|丹药|功法|草药|材料|仙宠|口粮))$',
          fnc: 'replaceThing',
        },
        {
          reg: '^#补发等级.*$',
          fnc: 'add_level',
        },
        {
          reg: '^#打入地狱.*$',
          fnc: 'down',
        },
        {
          reg: '^#拆散道侣.*$',
          fnc: 'xiaosan',
        },
        {
          reg: '#开通道法仙术.*$',
          fnc: 'openDaofa',
        },
        {
    reg: '^#打入天牢(?:@(\\d+))?\\s*(\\d+)?$',
    fnc: 'imprisonPlayer'
},
{
    reg: '^#全局推送消息(\\d+)$',
    fnc: 'globalPushMessage'
},
{
    reg: '^#删除全局推送(\\d+)$',
    fnc: 'removeGlobalPush'
},
{
    reg: '^#查看全局推送$',
    fnc: 'viewGlobalPush'
},
{
    reg: '^#设置修仙管理员.*$',
    fnc: 'setMaster'
}
      ],
    });
        this.xiuxianData =  XiuxianData; // 移至 super 之后
  }
  // 设置修仙管理员功能
async setMaster(e) {
  // 权限检查：只有机器人管理员或现有修仙管理员可以设置新的管理员
  const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
  const masterList = xiuxianConfig.Master || [];
  const userQQ = e.user_id.toString().replace('qg_', '');
  if (!e.isMaster && !masterList.includes(userQQ)) {
    return e.reply('你没有权限设置修仙管理员');
  }

  // 解析消息，获取目标用户QQ
  let targetQQ = '';

  // 方法1：优先从消息数组中查找at类型
  if (e.message && Array.isArray(e.message)) {
    const atMsg = e.message.find(item => item.type === 'at');
    if (atMsg && atMsg.qq) {
      targetQQ = atMsg.qq.toString();
    }
  }

  // 方法2：从e.msg中匹配CQ码格式的@用户 
  if (!targetQQ && e.msg) {
    const cqAtMatch = e.msg.match(/\[CQ:at,qq=(\d+)\]/);
    if (cqAtMatch) {
      targetQQ = cqAtMatch[1];
    }
  }
  
  // 方法3：从e.msg中匹配普通@用户格式
  if (!targetQQ && e.msg && e.msg.includes('@')) {
    const atMatch = e.msg.match(/@(\d+)/);
    if (atMatch) {
      targetQQ = atMatch[1];
    }
  }

  // 方法4：从消息中提取QQ号
  if (!targetQQ && e.msg) {
    const qqMatch = e.msg.match(/(\d{5,})/);
    if (qqMatch) {
      targetQQ = qqMatch[1];
    }
  }

  // 调试信息
  console.log('调试 - e.msg:', e.msg);
  console.log('调试 - e.message:', e.message);
  console.log('调试 - 解析出的targetQQ:', targetQQ);

  if (!targetQQ) {
    return e.reply('请指定要设置为管理员的用户格式：#设置修仙管理员@用户 或 #设置修仙管理员 QQ号');
  }

  // 检查目标用户是否已经是管理员
  if (masterList.includes(targetQQ)) {
    return e.reply(`用户 ${targetQQ} 已经是修仙管理员了`);
  }

  try {
    // 使用现有的config对象读取配置
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    
    // 确保Master数组存在
    if (!xiuxianConfig.Master) {
      xiuxianConfig.Master = [];
    }
    
    // 添加新的管理员
    xiuxianConfig.Master.push(targetQQ);
    
    // 使用config对象保存配置
    config.setConfig('xiuxian', 'xiuxian', xiuxianConfig);
    
    e.reply(`成功设置用户 ${targetQQ} 为修仙管理员`);
    
  } catch (error) {
    console.error('设置修仙管理员失败:', error);
    e.reply('设置修仙管理员失败，请检查配置文件权限');
  }
}
      async globalPushMessage(e) {
    // 只有管理员可以使用
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    
    // 解析群号
    const match = e.msg.match(/^#全局推送消息(\d+)$/);
    if (!match) {
        e.reply('格式错误，请使用：#全局推送消息群号');
        return true;
    }
    
    const groupId = match[1];
    
    try {
        // 读取配置文件
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
        
        // 检查Era配置是否存在
        if (!xiuxianConfig.Era) {
            xiuxianConfig.Era = {};
        }
        
        // 检查notifyGroups是否存在
        if (!xiuxianConfig.Era.notifyGroups) {
            xiuxianConfig.Era.notifyGroups = [];
        }
        
        // 检查群号是否已存在
        if (xiuxianConfig.Era.notifyGroups.includes(groupId)) {
            e.reply(`群号 ${groupId} 已在全局推送列表中`);
            return true;
        }
        
        // 添加群号到notifyGroups
        xiuxianConfig.Era.notifyGroups.push(groupId);
        
        // 保存配置
        config.setConfig('xiuxian', 'xiuxian', xiuxianConfig);
        
        e.reply(`✅ 成功添加群号 ${groupId} 到全局推送列表
当前推送群组：
${xiuxianConfig.Era.notifyGroups.join('\n')}`);
        
        return true;
        
    } catch (error) {
        console.error('配置全局推送消息失败:', error);
        e.reply('配置失败，请检查日志');
        return true;
    }
}

async removeGlobalPush(e) {
    // 只有管理员可以使用
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    
    // 解析群号
    const match = e.msg.match(/^#删除全局推送(\d+)$/);
    if (!match) {
        e.reply('格式错误，请使用：#删除全局推送群号');
        return true;
    }
    
    const groupId = match[1];
    
    try {
        // 读取配置文件
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
        
        // 检查Era配置和notifyGroups是否存在
        if (!xiuxianConfig.Era || !xiuxianConfig.Era.notifyGroups) {
            e.reply('当前没有配置任何全局推送群组');
            return true;
        }
        
        // 检查群号是否存在
        const index = xiuxianConfig.Era.notifyGroups.indexOf(groupId);
        if (index === -1) {
            e.reply(`群号 ${groupId} 不在全局推送列表中`);
            return true;
        }
        
        // 从数组中移除群号
        xiuxianConfig.Era.notifyGroups.splice(index, 1);
        
        // 保存配置
        config.setConfig('xiuxian', 'xiuxian', xiuxianConfig);
        
        e.reply(`✅ 成功从全局推送列表中移除群号 ${groupId}
当前推送群组：
${xiuxianConfig.Era.notifyGroups.length > 0 ? xiuxianConfig.Era.notifyGroups.join('\n') : '暂无群组'}`);
        
        return true;
        
    } catch (error) {
        console.error('删除全局推送消息失败:', error);
        e.reply('删除失败，请检查日志');
        return true;
    }
}

async viewGlobalPush(e) {
    // 只有管理员可以使用
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    
    try {
        // 读取配置文件
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
        
        // 检查Era配置和notifyGroups是否存在
        if (!xiuxianConfig.Era || !xiuxianConfig.Era.notifyGroups) {
            e.reply('当前没有配置任何全局推送群组');
            return true;
        }
        
        const notifyGroups = xiuxianConfig.Era.notifyGroups;
        
        if (notifyGroups.length === 0) {
            e.reply('📋 全局推送群组列表：暂无群组使用 #全局推送消息群号 来添加群组');
            return true;
        }
        
        let message = '📋 全局推送群组列表：';
        notifyGroups.forEach((groupId, index) => {
            message += `${index + 1}. 群号: ${groupId}`;
        });
        
        message += `共 ${notifyGroups.length} 个群组`;
        message += `使用指令：`;
        message += `• #全局推送消息群号 - 添加群组`;
        message += `• #删除全局推送群号 - 删除群组`;
        
        e.reply(message);
        return true;
        
    } catch (error) {
        console.error('查看全局推送消息失败:', error);
        e.reply('查看失败，请检查日志');
        return true;
    }
}
    async imprisonPlayer(e) {
    // 群聊限定
    if (!e.isGroup) {
        e.reply('请在群聊中使用此管理指令');
        return true;
    }
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    // 检查是否有艾特信息
    const atItems = e.message.filter(item => item.type === "at");
    if (atItems.length === 0) {
        e.reply('请指定要打入天牢的目标（@某人）');
        return true;
    }

    // 获取目标玩家QQ
    const targetQQ = atItems[0].qq.toString().replace('qg_', '');
    
    // 解析禁闭时间（分钟）
    const match = e.msg.match(/#打入天牢(?:\s*@\d+)?\s*(\d+)?/);
    const minutes = match && match[1] ? parseInt(match[1]) : 120; // 默认120分钟
    
    // 检查目标玩家是否存在
    if (!await existplayer(targetQQ)) {
        e.reply('目标玩家不存在于诸天万界中');
        return true;
    }

    // 读取目标玩家信息
    const target = await Read_player(targetQQ);
    
    // 执行打入天牢
    await this.setPlayerToPrison(targetQQ, minutes);
    
    // 构建天牢文案
    const messages = [
        `⚖️【天道审判·打入天牢】⚖️`,
        `管理员 ${e.sender.nickname} 施展天道伟力，`,
        `将 ${target.名号} 打入万仙盟天牢！`,
        `天牢位置：九幽之地第十八层`,
        `禁闭时间：${minutes}分钟`,
        `天牢特性：`,
        `- 修为增长停滞`,
        `- 无法进行任何修炼活动`,
        `- 无法参与秘境探索`,
        `- 无法使用任何道具`,
        `"天道昭昭，疏而不漏！"`
    ];
    
    e.reply(messages.join('\n'));
    return true;
}

/** 将玩家打入天牢 */
async setPlayerToPrison(targetQQ, minutes) {
    // 计算结束时间（毫秒）
    const action_time = minutes * 60 * 1000; // 分钟转毫秒
    const end_time = new Date().getTime() + action_time;
    
    // 设置天牢状态
    const prisonData = {
        action: '天牢',
        start_time: new Date().toLocaleString(),
        end_time: end_time,
        duration: minutes
    };
    
    // 保存到Redis
    await redis.set(`xiuxian:player:${targetQQ}:action`, JSON.stringify(prisonData));
    
    // 记录到玩家数据
    const player = await Read_player(targetQQ);
    player.禁闭记录 = player.禁闭记录 || [];
    player.禁闭记录.push({
        时间: new Date().toLocaleString(),
        时长: `${minutes}分钟`,
        执行者: '管理员'
    });
    await Write_player(targetQQ, player);
}
  
  async openDaofa(e) {
       const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    let nowTime = new Date().getTime();

    // 获取@的玩家QQ
    const atItem = e.message.find(item => item.type === 'at');
    if (!atItem) {
      e.reply('请@需要开通的玩家');
      return false;
    }
    const qq = atItem.qq;
    let player =await Read_player(qq)
    // 调用道法仙术开通方法
    const result =  this.xiuxianData.openDaofaForPlayer(qq);
    
      e.reply(`开通成功!【道法仙术】有效天数增加30天！`);
      return true;
    
  
}

  async ktgjdfxt(e) {
     const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
   let nowtime = new Date().getTime();
  let isat = e.message.some(item => item.type === 'at');
  if (!isat) return;

  let atItem = e.message.filter(item => item.type === 'at');
  let usr_qq = atItem[0].qq;
  
  if (!data.existData("player", usr_qq)) return;
  
  let player = await Read_player(usr_qq);
  player.daofaxianshu = 2;
let daofaxianshu_endtime = 2592000000; // 30天的毫秒数
if (Number(player.daofaxianshu_endtime) < nowtime) {
    player.daofaxianshu_endtime = daofaxianshu_endtime + nowtime;
} else {
    player.daofaxianshu_endtime += daofaxianshu_endtime;
}
// 计算剩余天数（相对于当前时间）
let remainingMilliseconds = player.daofaxianshu_endtime - nowtime;
let remainingDays = remainingMilliseconds / 86400000;
// 保留一位小数
remainingDays = Math.round(remainingDays * 10) / 10;

player.daofa = `已开启，当前剩余${remainingDays}天`;
  
  await Write_player(usr_qq, player);
  e.reply("开通成功!【道法仙术】的有效天数直接增加30天");
  return;
}
  
  async xiaosan(e){
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    if (!verc({ e })) return false;
    let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) return false;
    let atItem = e.message.filter(item => item.type === 'at');
    let B = atItem[0].qq.replace('qg_','');
    B=await channel(B)
    let i = await found(A, B);
    let qinmidu;
    try {
      qinmidu = await Read_qinmidu();
    } catch {
      //没有建立一个
      await Write_qinmidu([]);
      qinmidu = await Read_qinmidu();
    }

    if (i != qinmidu.length) {

        qinmidu[i].婚姻 = 0;
        await Write_qinmidu(qinmidu)
        e.reply("拆散成功")
    }
  }


  async down(e){
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    if (!verc({ e })) return false;
    //没有at信息直接返回,不执行
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) return false;
    //获取at信息
    let atItem = e.message.filter(item => item.type === 'at');
    //对方qq
    let qq = atItem[0].qq.replace('qg_','');
    qq=await channel(qq)
    //检查存档
    let ifexistplay = await existplayer(qq);
    if (!ifexistplay){
      e.reply("不存在:"+qq)
      return
    }
    fs.unlink(`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_player/${qq}.json`,(err)=>{
      if (err) throw err;
      console.log('Rename complete!1');
    })
    fs.unlink(`./plugins/xiuxian-emulator-plugin/resources/data//xiuxian_najie/${qq}.json`,(err)=>{
      if (err) throw err;
      console.log('Rename complete!1');
    })
    fs.unlink(`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_equipment/${qq}.json`,(err)=>{
      if (err) throw err;
      console.log('Rename complete!1');
    })
    fs.unlink(`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_danyao/${qq}.json`,(err)=>{
      if (err) throw err;
      console.log('Rename complete!1');
    })
    e.reply("清除完成")
  }
  async add_level(e){
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    if (!verc({ e })) return false;
    //没有at信息直接返回,不执行
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) return false;
    //获取at信息
    let atItem = e.message.filter(item => item.type === 'at');
    //对方qq
    let qq = atItem[0].qq.replace('qg_','');
    qq=await channel(qq)
    //检查存档
    let ifexistplay = await existplayer(qq);
    if (!ifexistplay) return false;
    let level = parseInt(e.msg.replace('#补发等级', ''));
    
    let player=await Read_player(qq)
    player.occupation_level+=level
    await Write_player(qq,player)
    player=await Read_player(qq)
    e.reply("补发"+level+"级成功,当前为"+player.occupation+player.occupation_level+"级")
  }
  async jiesan_ass(e) {
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    if (!verc({ e })) return false;
    let didian = e.msg.replace('#解散宗门', '');
    didian = didian.trim();
    let ass = data.getAssociation(didian);
    if (ass == 'error') {
      e.reply('该宗门不存在');
      return false;
    }
    for (let qq of ass.所有成员) {
      let player = await data.getData('player', qq);
      if (player.宗门) {
        if (player.宗门.宗门名称 == didian) {
          delete player.宗门;
          await Write_player(qq, player);
        }
      }
    }
    fs.rmSync(`${data.filePathMap.association}/${didian}.json`);
    e.reply('解散成功!');
    return false;
  }
  async show_log(e) {
    if (!verc({ e })) return false;
    let j;
    const reader = await Read_updata_log();
    let str = [];
    let line_log = reader.trim().split('\n'); //读取数据并按行分割
    line_log.forEach((item, index) => {
      // 删除空项
      if (!item) {
        line_log.splice(index, 1);
      }
    });
    for (let y = 0; y < line_log.length; y++) {
      let temp = line_log[y].trim().split(/\s+/); //读取数据并按空格分割
      let i = 0;
      if (temp.length == 4) {
        str.push(temp[0]);
        i = 1;
      }
      let t = '';
      for (let x = i; x < temp.length; x++) {
        t += temp[x];
        //console.log(t)
        if (x == temp.length - 2 || x == temp.length - 3) {
          t += '\t';
        }
      }
      str.push(t);
      //str += "\n";
    }
    let T;
    for (j = 0; j < str.length / 2; j++) {
      T = str[j];
      str[j] = str[str.length - 1 - j];
      str[str.length - 1 - j] = T;
    }
    for (j = str.length - 1; j > -1; j--) {
      if (str[j] == '零' || str[j] == '打铁的') {
        let m = j;
        while (str[m - 1] != '零' && str[m - 1] != '打铁的' && m > 0) {
          T = str[m];
          str[m] = str[m - 1];
          str[m - 1] = T;
          m--;
        }
      }
    }
    let log_data = {
      log: str,
    };
    const data1 = await new Show(e).get_logData(log_data);
    let img = await puppeteer.screenshot('log', {
      ...data1,
    });
    e.reply(img);
    return false;
  }

  async Deleteexchange(e) {
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    if (!verc({ e })) return false;
    e.reply('开始清除！');
    let Exchange;
    try {
      Exchange = await Read_Exchange();
    } catch {
      //没有表要先建立一个！
      await Write_Exchange([]);
      Exchange = await Read_Exchange();
    }
    for (let i of Exchange) {
      let usr_qq = i.qq;
      let thing = i.name.name;
      let quanity = i.aconut;
      if (i.name.class == '装备' || i.name.class == '仙宠') thing = i.name;
      await Add_najie_thing(usr_qq, thing, i.name.class, quanity, i.name.pinji);
    }
    await Write_Exchange([]);
    e.reply('清除完成！');
    return false;
  }

  //#我的信息
  async Show_player(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    if (!e.isGroup) {
      e.reply('此功能暂时不开放私聊');
      return false;
    }
    let img = await get_player_img(e);
    e.reply(img);
    return false;
  }

  async Allrelieve(e) {
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    if (!verc({ e })) return false;
    e.reply('开始行动！');
    let playerList = [];
    let files = fs
      .readdirSync('./plugins/' + AppName + '/resources/data/xiuxian_player')
      .filter(file => file.endsWith('.json'));
    for (let file of files) {
      file = file.replace('.json', '');
      playerList.push(file);
    }
    for (let player_id of playerList) {
      //清除游戏状态
      await redis.set('xiuxian:player:' + player_id + ':game_action', 1);
      let action = await redis.get('xiuxian:player:' + player_id + ':action');
      action = JSON.parse(action);
      //不为空，存在动作
      if (action != null) {
        await redis.del('xiuxian:player:' + player_id + ':action');
        let arr = action;
        arr.is_jiesuan = 1; //结算状态
        arr.shutup = 1; //闭关状态
        arr.working = 1; //降妖状态
        arr.power_up = 1; //渡劫状态
        arr.Place_action = 1; //秘境
        arr.Place_actionplus = 1; //沉迷状态
        arr.end_time = new Date().getTime(); //结束的时间也修改为当前时间
        delete arr.group_id; //结算完去除group_id
        await redis.set(
          'xiuxian:player:' + player_id + ':action',
          JSON.stringify(arr)
        );
      }
    }
    e.reply('行动结束！');
  }
async relieveFashanAction(e) {
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    
    if (!verc({ e })) return false;
    
    e.reply('开始解除法身行动状态...');
    
    // 获取所有玩家列表
    let playerList = [];
    const files = fs
        .readdirSync('./plugins/' + AppName + '/resources/data/xiuxian_player')
        .filter(file => file.endsWith('.json'));
    
    for (let file of files) {
        playerList.push(file.replace('.json', ''));
    }
    
    let relievedCount = 0;
    
    for (let player_id of playerList) {
        // 获取法身行动状态
        const fashanActionKey = 'xiuxian:player:' + player_id + ':action:fashan';
        const fashanAction = await redis.get(fashanActionKey);
        
        if (fashanAction) {
            // 解析法身行动数据
            let actionData = JSON.parse(fashanAction);
            
            // 添加解除记录
            actionData.relieved_time = new Date().getTime();
            actionData.relieved_by = e.user_id;
            
            // 保存解除记录
            await redis.set(fashanActionKey, JSON.stringify(actionData));
            
            // 删除法身行动状态
            await redis.del(fashanActionKey);
            
            // 获取玩家信息
            const player = await Read_player(player_id);
            
            // 添加解除日志
            const log = {
                time: new Date().getTime(),
                action: '解除法身行动',
                relieved_by: e.user_id,
                fashan_type: actionData.fashan_type || '未知'
            };
            
            // 保存玩家日志
            if (!player.action_logs) player.action_logs = [];
            player.action_logs.push(log);
            await Write_player(player_id, player);
            
            relievedCount++;
        }
    }
    
    // 构建结果消息
    let resultMsg = `法身行动解除完成！`;
    resultMsg += `\n共解除 ${relievedCount} 名玩家的法身行动状态`;
    
    if (relievedCount > 0) {
        resultMsg += `\n\n【解除详情】`;
        resultMsg += `\n管理员：${e.user_id}`;
        resultMsg += `\n时间：${new Date().toLocaleString('zh-CN')}`;
    }
    
    e.reply(resultMsg);
    return true;
}
  async relieve(e) {
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    if (!verc({ e })) return false;
    //没有at信息直接返回,不执行
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) return false;
    //获取at信息
    let atItem = e.message.filter(item => item.type === 'at');
    //对方qq
    let qq = atItem[0].qq;
    qq=qq.toString().replace('qg_','')
    qq=await channel(qq)
    //检查存档
    let ifexistplay = await existplayer(qq);
    if (!ifexistplay) return false;
    //清除游戏状态
    await redis.set('xiuxian:player:' + qq + ':game_action', 1);
    //查询redis中的人物动作
    let action = await redis.get('xiuxian:player:' + qq + ':action');
    action = JSON.parse(action);
    //不为空，有状态
    if (action != null) {
      //把状态都关了
      let arr = action;
      arr.is_jiesuan = 1; //结算状态
      arr.shutup = 1; //闭关状态
      arr.working = 1; //降妖状态
      arr.power_up = 1; //渡劫状态
      arr.Place_action = 1; //秘境
      arr.Place_actionplus = 1; //沉迷状态
      arr.end_time = new Date().getTime(); //结束的时间也修改为当前时间
      delete arr.group_id; //结算完去除group_id
      await redis.set('xiuxian:player:' + qq + ':action', JSON.stringify(arr));
      e.reply('已解除！');
      return false;
    }
    e.reply('不需要解除！');
    return false;
  }

  async Knockdown(e) {
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    if (!verc({ e })) return false;
    //没有at信息直接返回,不执行
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) return false;
    //获取at信息
    let atItem = e.message.filter(item => item.type === 'at');
    //对方qq
    let qq = atItem[0].qq.replace('qg_','');
    qq=await channel(qq)
    //检查存档
    let ifexistplay = await existplayer(qq);
    if (!ifexistplay) {
      e.reply('没存档你打个锤子！');
      return false;
    }
    let player = await Read_player(qq);
    player.power_place = 0;
    e.reply('已打落凡间！');
    await Write_player(qq, player);
    return false;
  }

  async replaceThing(e) {
        const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    const msg1 = e.msg.replace('#将米娜桑的纳戒里叫', '');
    const [thingName, msg2] = msg1.split('的的的');

    // #将米娜桑的纳戒里叫.*的的的(装备|道具|丹药|功法|草药|材料|盒子|仙宠|口粮|项链|食材)(抹除|替换为叫.*之之之(装备|道具|丹药|功法|草药|材料|盒子|仙宠|口粮|项链|食材))$
    if (e.msg.endsWith('抹除')) {
      const thingType = msg2.replace(/抹除$/, '');
      if (!thingName || !thingType)
        return e.reply(
          '格式错误，正确格式范例：#将米娜桑的纳戒里叫1w的的的道具替换为叫1k之之之道具'
        );
      await clearNajieThing(thingType, thingName);
      return e.reply('全部抹除完成');
    }

    // 替换为
    const N = 1; // 倍数
    const [thingType, msg3] = msg2.split('替换为叫');
    const [newThingName, newThingType] = msg3.split('之之之');
    const objArr = await clearNajieThing(thingType, thingName);
    objArr.map(uid_tnum => {
      const usrId = Object.entries(uid_tnum)[0][0];
      Add_najie_thing(usrId, newThingName, newThingType, uid_tnum.usrId * N);
    });
    return e.reply('全部替换完成');
  }
}

async function found(A, B) {
  let qinmidu = await Read_qinmidu();
  let i;
  for (i = 0; i < qinmidu.length; i++) {
    if (
      (qinmidu[i].QQ_A == A || qinmidu[i].QQ_B == B) ||
      (qinmidu[i].QQ_A == B || qinmidu[i].QQ_B == A)
    ) {
      break;
    }
  }
  return i;
}


async function clearNajieThing(thingType, thingName) {
  if (!thingType || !thingName) return [];
  const path = './plugins/' + AppName + '/resources/data/xiuxian_najie';
  return fs
    .readdirSync(path)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const usrId = file.replace('.json', '');
      const najie = fs.readFileSync(`${path}/${file}`);
      const thingInNajie = JSON.parse(najie)[thingType]?.find(
        thing => thing.name == thingName
      );
      if (!thingInNajie) return false;
      let thingNumber = thingInNajie.数量;
      Add_najie_thing(usrId, thingName, thingType, -thingNumber);
      if (thingType == '装备') {
        ['劣', '普', '优', '精', '绝', '顶'].map(async pinji => {
          const thingNum = await exist_najie_thing(
            usrId,
            thingName,
            thingType,
            pinji
          );
          if (thingNum) {
            Add_najie_thing(usrId, thingName, thingType, -thingNum, pinji);
            thingNumber += thingNum;
          }
        });
      }
      return { [usrId]: thingNumber };
    })
    .filter(usrObj => usrObj);
}




