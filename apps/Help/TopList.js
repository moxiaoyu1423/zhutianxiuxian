import { plugin, verc, data } from '../../api/api.js';
import fs from 'fs';
import {
  existplayer,
  Get_xiuwei,
  sortBy,
  sleep,
  ForwardMsg,
  isNotNull,
  Read_player,
  Read_najie,
  __PATH,
  get_ranking_money_img,
  get_ranking_power_img,
  channel,
  get_genius_img
} from '../../model/xiuxian.js';
import { AppName } from '../../app.config.js';
export class TopList extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_TopList',
      dsc: '修仙模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#天榜$',
          fnc: 'TOP_xiuwei',
        },
        {
          reg: '^#灵榜$',
          fnc: 'TOP_lingshi',
        },
        {
          reg: '^#封神榜$',
          fnc: 'TOP_Immortal',
        },
                {
          reg: '^#遮天榜$',
          fnc: 'TOP_zhetian',
        },
                        {
          reg: '^#完美世界榜$',
          fnc: 'TOP_xiangu',
        },
        {
          reg: '^#至尊榜$',
          fnc: 'TOP_genius',
        },
      ],
    });
  }
   // 封神榜功能
async TOP_xiangu(e) {
  if (!verc({ e })) return false;
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) return false;
  
  // 获取所有玩家数据
  let playerList = [];
  let files = fs
    .readdirSync('./plugins/' + AppName + '/resources/data/xiuxian_player')
    .filter(file => file.endsWith('.json'));
  for (let file of files) {
    file = file.replace('.json', '');
    playerList.push(file);
  }
  
  // 计算战力并排序
  let rankings = [];
  for (let player_id of playerList) {
    let player = await Read_player(player_id);
    
    // 只计算仙人境界以上的玩家
    if (player.xiangulevel_id < 2) continue;
    
    // 计算战力
    let power = Math.trunc(
      (player.攻击 + player.防御 * 1 + player.血量上限 * 1) *
      (player.暴击率 + 1)
    );
    
    rankings.push({
      qq: player_id,  // 确保包含QQ号
      name: player.名号,
      power: power,
      level: data.xiangujinshi_list.find(l => l.level_id === player.xiangulevel_id)?.level || "未知境界"
    });
  }
  
  // 按战力排序
  rankings.sort((a, b) => b.power - a.power);
  
  // 只取前10名
  rankings = rankings.slice(0, 10);
  
  // 获取当前玩家排名
  let userRank = rankings.findIndex(r => r.qq === usr_qq) + 1;
  
  // 获取当前玩家的战力
  let userPower = 0;
  if (userRank > 0) {
    userPower = rankings[userRank - 1].power;
  } else {
    // 如果当前玩家不在排行榜上，则重新计算其战力
    let player = await Read_player(usr_qq);
    userPower = Math.trunc(
      (player.攻击 + player.防御 * 1 + player.血量上限 * 1) *
      (player.暴击率 + 1)
    );
  }
  
  // 当前玩家数据
  let thisplayer = await Read_player(usr_qq);
  
  // 调用图片生成函数，传递正确的参数

  let img = await get_genius_img(e, rankings, userRank, userPower, thisplayer, "仙古今世法榜");
  // 发送图片
  e.reply(img);
  return true;
}
 // 封神榜功能
async TOP_zhetian(e) {
  if (!verc({ e })) return false;
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) return false;
  
  // 获取所有玩家数据
  let playerList = [];
  let files = fs
    .readdirSync('./plugins/' + AppName + '/resources/data/xiuxian_player')
    .filter(file => file.endsWith('.json'));
  for (let file of files) {
    file = file.replace('.json', '');
    playerList.push(file);
  }
  
  // 计算战力并排序
  let rankings = [];
  for (let player_id of playerList) {
    let player = await Read_player(player_id);
    
    // 只计算仙人境界以上的玩家
    if (player.mijinglevel_id < 2) continue;
    
    // 计算战力
    let power = Math.trunc(
      (player.攻击 + player.防御 * 1 + player.血量上限 * 1) *
      (player.暴击率 + 1)
    );
    
    rankings.push({
      qq: player_id,  // 确保包含QQ号
      name: player.名号,
      power: power,
      level: data.Levelmijing_list.find(l => l.level_id === player.mijinglevel_id)?.level || "未知境界"
    });
  }
  
  // 按战力排序
  rankings.sort((a, b) => b.power - a.power);
  
  // 只取前10名
  rankings = rankings.slice(0, 10);
  
  // 获取当前玩家排名
  let userRank = rankings.findIndex(r => r.qq === usr_qq) + 1;
  
  // 获取当前玩家的战力
  let userPower = 0;
  if (userRank > 0) {
    userPower = rankings[userRank - 1].power;
  } else {
    // 如果当前玩家不在排行榜上，则重新计算其战力
    let player = await Read_player(usr_qq);
    userPower = Math.trunc(
      (player.攻击 + player.防御 * 1 + player.血量上限 * 1) *
      (player.暴击率 + 1)
    );
  }
  
  // 当前玩家数据
  let thisplayer = await Read_player(usr_qq);
  
  // 调用图片生成函数，传递正确的参数

  let img = await get_genius_img(e, rankings, userRank, userPower, thisplayer, "人体秘境榜");
  // 发送图片
  e.reply(img);
  return true;
}

 // 封神榜功能
async TOP_Immortal(e) {
  if (!verc({ e })) return false;
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) return false;
  
  // 获取所有玩家数据
  let playerList = [];
  let files = fs
    .readdirSync('./plugins/' + AppName + '/resources/data/xiuxian_player')
    .filter(file => file.endsWith('.json'));
  for (let file of files) {
    file = file.replace('.json', '');
    playerList.push(file);
  }
  
  // 计算战力并排序
  let rankings = [];
  for (let player_id of playerList) {
    let player = await Read_player(player_id);
    
    // 只计算仙人境界以上的玩家
    if (player.level_id < 42) continue;
    
    // 计算战力
    let power = Math.trunc(
      (player.攻击 + player.防御 * 1 + player.血量上限 * 1) *
      (player.暴击率 + 1)
    );
    
    rankings.push({
      qq: player_id,  // 确保包含QQ号
      name: player.名号,
      power: power,
      level: data.Level_list.find(l => l.level_id === player.level_id)?.level || "未知境界"
    });
  }
  
  // 按战力排序
  rankings.sort((a, b) => b.power - a.power);
  
  // 只取前10名
  rankings = rankings.slice(0, 10);
  
  // 获取当前玩家排名
  let userRank = rankings.findIndex(r => r.qq === usr_qq) + 1;
  
  // 获取当前玩家的战力
  let userPower = 0;
  if (userRank > 0) {
    userPower = rankings[userRank - 1].power;
  } else {
    // 如果当前玩家不在排行榜上，则重新计算其战力
    let player = await Read_player(usr_qq);
    userPower = Math.trunc(
      (player.攻击 + player.防御 * 1 + player.血量上限 * 1) *
      (player.暴击率 + 1)
    );
  }
  
  // 当前玩家数据
  let thisplayer = await Read_player(usr_qq);
  
  // 调用图片生成函数，传递正确的参数

  let img = await get_genius_img(e, rankings, userRank, userPower, thisplayer, "封神榜");
  // 发送图片
  e.reply(img);
  return true;
}

 // 至尊榜功能优化
async TOP_genius(e) {
  if (!verc({ e })) return false;
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) return false;
  
  // 获取所有玩家数据
  let playerList = [];
  let files = fs
    .readdirSync('./plugins/' + AppName + '/resources/data/xiuxian_player')
    .filter(file => file.endsWith('.json'));
  for (let file of files) {
    file = file.replace('.json', '');
    playerList.push(file);
  }
  
  // 计算战力并排序
  let rankings = [];
  for (let player_id of playerList) {
    let player = await Read_player(player_id);
    
    // 只计算凡人境界的玩家（level_id < 42）
    if (player.level_id >= 42) continue;
    
    // 计算战力
    let power = Math.trunc(
      (player.攻击 + player.防御 * 0.8 + player.血量上限 * 0.6) *
      (player.暴击率 + 1)
    );
    
    rankings.push({
      qq: player_id,  // 确保包含QQ号
      name: player.名号,
      power: power,
      level: data.Level_list.find(l => l.level_id === player.level_id)?.level || "未知境界"
    });
  }
  
  // 按战力排序
  rankings.sort((a, b) => b.power - a.power);
  
  // 只取前10名
  rankings = rankings.slice(0, 10);
  
  // 获取当前玩家排名
  let userRank = rankings.findIndex(r => r.qq === usr_qq) + 1;
  
  // 获取当前玩家的战力
  let userPower = 0;
  if (userRank > 0) {
    userPower = rankings[userRank - 1].power;
  } else {
    // 如果当前玩家不在排行榜上，则重新计算其战力
    let player = await Read_player(usr_qq);
    userPower = Math.trunc(
      (player.攻击 + player.防御 * 0.8 + player.血量上限 * 0.6) *
      (player.暴击率 + 1)
    );
  }
  
  // 当前玩家数据
  let thisplayer = await Read_player(usr_qq);
  
  // 调用图片生成函数，传递正确的参数
  let img = await get_genius_img(e, rankings, userRank, userPower, thisplayer, "至尊榜");
  
  // 发送图片
  e.reply(img);
  return true;
}

  async TOP_xiuwei(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;

    let usr_paiming;
    let File = fs.readdirSync(__PATH.player_path);
    File = File.filter(file => file.endsWith('.json'));
    let File_length = File.length;
    let temp = [];
    for (var i = 0; i < File_length; i++) {
      let this_qq = File[i].replace('.json', '');

      let player = await Read_player(this_qq);
      let sum_exp = await Get_xiuwei(this_qq);
      if (!isNotNull(player.level_id)) {
        e.reply('请先#同步信息');
        return false;
      }
      //境界名字需要查找境界名
      let level = data.Level_list.find(
        item => item.level_id == player.level_id
      ).level;
      temp[i] = {
        总修为: sum_exp,
        境界: level,
        名号: player.名号,
        qq: this_qq,
      };
    }
    //排序
    temp.sort(sortBy('总修为'));
    usr_paiming = temp.findIndex(temp => temp.qq === usr_qq) + 1;
    let Data = [];
    if (File_length > 10) {
      File_length = 10;
    } //最多显示前十
    for (var i = 0; i < File_length; i++) {
      temp[i].名次 = i + 1;
      Data[i] = temp[i];
    }
    let thisplayer = await data.getData('player', usr_qq);
    let img = await get_ranking_power_img(e, Data, usr_paiming, thisplayer);
    e.reply(img);
    return false;
  }

  //TOP_lingshi
  async TOP_lingshi(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id;

    let usr_paiming;
    let File = fs.readdirSync(__PATH.player_path);
    
    File = File.filter(file => file.endsWith('.json'));

    let File_length = File.length;
    let temp = [];

    for (var i = 0; i < File_length; i++) {
      let this_qq = File[i].replace('.json', '');  

      let ifexistplay = await existplayer(this_qq);
      if (!ifexistplay){continue}
      let player = await Read_player(this_qq);
      let najie = await Read_najie(this_qq);
      let lingshi = player.灵石 + najie.灵石;
      temp[i] = {
        ls1: najie.灵石,
        ls2: player.灵石,
        灵石: lingshi,
        名号: player.名号,
        qq: this_qq,
      };

    }
    //排序
    temp.sort(sortBy('灵石'));
    let Data = [];
    usr_paiming = temp.findIndex(temp => temp.qq === usr_qq) + 1;
    if (File_length > 10) {
      File_length = 10;
    } //最多显示前十
    for (var i = 0; i < File_length; i++) {
      temp[i].名次 = i + 1;
      Data[i] = temp[i];
    }
    await sleep(500);
    let thisplayer = await data.getData('player', usr_qq);
    let thisnajie = await data.getData('najie', usr_qq);
    let img = await get_ranking_money_img(
      e,
      Data,
      usr_paiming,
      thisplayer,
      thisnajie
    );
    e.reply(img);
    return false;
  }
}
/**
 * 大数字转换（支持到10^44）
 * @param {number|string} value - 要转换的数字值
 * @returns {string} - 转换后的带单位字符串
 */
export function bigNumberTransform(value) {
    // 边界处理和类型检查
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    if (typeof value !== 'number' || isNaN(value)) {
        return '0';
    }
    
    // 处理负数和零
    if (value < 0) return '-' + bigNumberTransform(-value);
    if (value === 0) return '0';
    
    // 小于1万时直接返回原生数值
    if (value < 10000) return value.toString();
    
    // 扩展单位体系（万、亿、兆、京、垓、秭、穰、沟、涧、正、载）
    const units = [
        { threshold: 1e4, units: ['万', '千万'] },      // 万级：1e4~1e7
        { threshold: 1e8, units: ['亿', '千亿'] },      // 亿级：1e8~1e11
        { threshold: 1e12, units: ['兆', '千兆'] },     // 兆级：1e12~1e15
        { threshold: 1e16, units: ['京', '千京'] },     // 京级：1e16~1e19
        { threshold: 1e20, units: ['垓', '千垓'] },     // 垓级：1e20~1e23
        { threshold: 1e24, units: ['秭', '千秭'] },     // 秭级：1e24~1e27
        { threshold: 1e28, units: ['穰', '千穰'] },     // 穰级：1e28~1e31
        { threshold: 1e32, units: ['沟', '千沟'] },     // 沟级：1e32~1e35
        { threshold: 1e36, units: ['涧', '千涧'] },     // 涧级：1e36~1e39
        { threshold: 1e40, units: ['正', '千正'] },     // 正级：1e40~1e43
        { threshold: 1e44, units: ['载', '千载'] }      // 载级：1e44+
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
            
            // 根据数值大小确定小数位数
            let decimalPlaces = 3;
            if (convertedValue >= 1000) decimalPlaces = 0;
            else if (convertedValue >= 100) decimalPlaces = 1;
            else if (convertedValue >= 10) decimalPlaces = 2;
            
            // 格式化为指定小数位数并去除尾部零
            let result = convertedValue.toFixed(decimalPlaces)
                .replace(/\.?0+$/, '') // 去除尾随零和小数点
                .replace(/(\.\d*?)0+$/, '$1'); // 去除小数点后的尾随零
            
            return result + level.units[unitIndex];
        }
    }
    
    // 如果数值大于1万但小于最小单位阈值（理论上不会发生）
    return value.toLocaleString();
}