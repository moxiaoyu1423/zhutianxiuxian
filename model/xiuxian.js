import fs from 'fs';
import path from 'path';
import puppeteer from '../../../lib/puppeteer/puppeteer.js';

import data from './XiuxianData.js';
import { Writeit, Read_it,readall,dataall } from './duanzaofu.js';
import { AppName } from '../app.config.js';
import config from './Config.js';
import Show from './show.js';
import { log } from 'console';
import { TIMEOUT } from 'dns';
import { userInfo } from 'os';
// import {action_way_fun} from "../apps/Game/action.js";
import{cheakbaoshi}from "../apps/xiangqian/xiangqian.js"

/**
 * 全局
 */
// 全局渡劫状态管理
export let dj = 0;
export let dj_players = {}; // 存储正在渡劫的玩家信息 {qq: {timer: 定时器, grade: 雷劫道数, count: 当前道数}}
export const spirit_players = {}; // 存储元神劫状态
//插件根目录
const __dirname = `${path.resolve()}${path.sep}plugins${path.sep}${AppName}`;
// 文件存放路径
export const __PATH = {
  //更新日志
  updata_log_path: path.join(__dirname, 'vertion.txt'),
  //用户数据
  player_path: path.join(__dirname, '/resources/data/xiuxian_player'),
  //装备
  equipment_path: path.join(__dirname, '/resources/data/xiuxian_equipment'),
  //纳戒
  najie_path: path.join(__dirname, '/resources/data/xiuxian_najie'),
  //丹药
  danyao_path: path.join(__dirname, '/resources/data/xiuxian_danyao'),
  inner_world_path: path.join(__dirname, '/resources/data/inner_world'), // 修正后的路径
  //源数据
  lib_path: path.join(__dirname, '/resources/data/item'),
  Timelimit: path.join(__dirname, '/resources/data/Timelimit'),
  Exchange: path.join(__dirname, '/resources/data/Exchange'),
  shop: path.join(__dirname, '/resources/data/shop'),
  log_path: path.join(__dirname, '/resources/data/suduku'),
  association: path.join(__dirname, '/resources/data/association'),
  renwu: path.join(__dirname, '/resources/data/renwu'),
  tiandibang: path.join(__dirname, '/resources/data/tiandibang'),
  qinmidu: path.join(__dirname, '/resources/data/qinmidu'),
  backup: path.join(__dirname, '/resources/backup'),
  player_pifu_path: path.join(__dirname, '/resources/img/player_pifu'),
  shitu: path.join(__dirname, '/resources/data/shitu'),
  equipment_pifu_path: path.join(__dirname, '/resources/img/equipment_pifu'),
  duanlu: path.join(__dirname, '/resources/data/duanlu'),
  temp_path: path.join(__dirname, '/resources/data/temp'),
  custom: path.join(__dirname, '/resources/data/custom'),
  auto_backup: path.join(__dirname, '/resources/data/auto_backup'),
  channel: path.join(__dirname, '/resources/data/channel'),
  chengzhang: path.join(__dirname, '/resources/data/chengzhang'),
  equipment_list: path.join(__dirname, '/resources/data/item'),
  dibing_list: path.join(__dirname, '/resources/data/item'),
  tszb_list: path.join(__dirname, '/resources/data/item'),
};


//检查存档是否存在，存在返回true;
export async function existplayer(usr_qq) {
  let exist_player;
  exist_player = fs.existsSync(`${__PATH.player_path}/${usr_qq}.json`);

  if (exist_player) {
    return true;
  }
  return false;
}

/**
 * 
 * @param {*} amount 输入数量
 * @returns 返回正整数
 */
export async function convert2integer(amount) {
  let number = 1;
  let reg = new RegExp(/^[1-9][0-9]{0,12}$/);
  if (!reg.test(amount)) {
    return number;
  } else {
    return parseInt(amount);
  }
}

export async function Locked_najie_thing(usr_qq, thing_name, thing_class,thing_pinji=null) {
    let najie = await Read_najie(usr_qq);
    let ifexist;
    if (thing_class == "装备") {
        ifexist = najie.装备.find(item => item.name == thing_name&&item.pinji==thing_pinji);
    }
    if (thing_class == "丹药") {
        ifexist = najie.丹药.find(item => item.name == thing_name);
    }
    if (thing_class == "道具") {
        ifexist = najie.道具.find(item => item.name == thing_name);
    }
    if (thing_class == "功法") {
        ifexist = najie.功法.find(item => item.name == thing_name);
    }
    if (thing_class == "草药") {
        ifexist = najie.草药.find(item => item.name == thing_name);
    }
    if (thing_class == "材料") {
        ifexist = najie.材料.find(item => item.name == thing_name);
    }
    if (thing_class == "食材") {
        ifexist = najie.食材.find(item => item.name == thing_name);
    }
    if (thing_class == "盒子") {
        ifexist = najie.盒子.find(item => item.name == thing_name);
    }
    if (thing_class == "仙宠") {
        ifexist = najie.仙宠.find(item => item.name == thing_name);
    }
    if (thing_class == "仙米") {
        ifexist = najie.仙宠口粮.find(item => item.name == thing_name);
    }
    if (ifexist) {
        return ifexist.islockd;
    }
    return false;
}

export async function Check_thing(data){
    let state=0;
    if (data.id >= 5005000&& data.id <= 5005009) {
        state=1;
    }
    else if (data.id >= 400991 && data.id <= 400999) {
        state=1;
    }
    return state;
}

export async function Read_updata_log() {
  let dir = path.join(`${__PATH.updata_log_path}`);
  let update_log = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  return update_log;
}

//读取存档信息，返回成一个JavaScript对象
export async function Read_player(usr_qq) {
  let dir = path.join(`${__PATH.player_path}/${usr_qq}.json`);
  let player = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  player = JSON.parse(player);
  return player;
}
export async function LevelTask(e, power_n, power_m, power_Grade, aconut, illusionRate) {
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  
  let msg = [segment.at(Number(usr_qq))];
  let player = await Read_player(usr_qq);
  
    // 特殊体质：肉身打散雷劫
  if (player.Physique_id == 43) {
    const damagePercent = 0.25;
    const damage = Math.trunc(player.血量上限 * damagePercent);
    player.当前血量 -= damage;
    
    await Write_player(usr_qq, player);
    
    msg.push(`\n${player.名号}仰天长啸，肉身之力震动天地！`);
    msg.push(`只见他纵身跃起，一拳轰向雷云！`);
    msg.push(`第${aconut}道雷劫竟被硬生生打散！`);
    msg.push(`肉身硬抗雷劫，气血翻涌，损失${damage}点生命值`);
    
    if (aconut >= power_Grade) {
      // 关键优化：不再设置power_place，而是直接触发元神劫
      const bonus = 100000 * aconut;
      player.生命加成 += bonus;
      player.血量上限 += bonus;
      player.当前血量 += bonus;
      player.防御加成 += bonus;
      player.防御 += bonus;
      player.攻击加成 += bonus;
      player.攻击 += bonus;
      
      await Write_player(usr_qq, player);
      msg.push(`\n${player.名号}以肉身之力硬撼天劫，肉身劫完成！`);
      msg.push(`肉身经雷劫淬炼，全属性提升${bonus}点！`);
      
      // 立即开始元神劫
      try {
        await e.reply(msg);
      } catch (err) {
        console.log(`[${new Date().toISOString()}] e.reply错误:`, err);
      }
      console.log(`[${new Date().toISOString()}] ${player.名号}肉身劫完成，等待3秒后进入元神劫`);
      
      // 等待3秒，确保玩家看到消息
      console.log(`[${new Date().toISOString()}] 开始3秒倒计时...`);
      await new Promise(resolve => {
        setTimeout(() => {
          console.log(`[${new Date().toISOString()}] 3秒倒计时结束，${player.名号}开始进入元神劫`);
          resolve();
        }, 3000);
      });
      
      // 关键优化：直接调用元神劫
      console.log(`[${new Date().toISOString()}] ${player.名号}调用元神劫函数`);
      const spiritResult = await spirit_tribulation(e, player);
      console.log(`[${new Date().toISOString()}] ${player.名号}元神劫结果:`, spiritResult.success);
      
      if (spiritResult.success) {
        return 3; // 返回3表示双劫完成
      } else {
        return 2; // 返回2表示肉身劫完成但元神劫失败
      }
    }
    
    msg.push(`\n下一道雷劫在一分钟后落下！`);
    e.reply(msg);
    return 1;
  }
  
  // 元神防御机制
  let power_distortion = await dujie(usr_qq);
  if (illusionRate > 0.1) {
    const reduction = Math.min(0.5, illusionRate * 0.7);
    power_distortion = power_distortion * (1 + reduction);
    msg.push(`元神化虚为实，雷抗提升${(reduction*100).toFixed(1)}%`);
  }
  
  // 草药辅助
  const yaocaolist = ['凝血草', '小吉祥草', '大吉祥草'];
  for (const j in yaocaolist) {
    const num = await exist_najie_thing(usr_qq, yaocaolist[j], '草药');
    if (num) {
      msg.push(`[${yaocaolist[j]}]为你提高了雷抗\n`);
      power_distortion = Math.trunc(power_distortion * (1 + 0.2 * j));
      await Add_najie_thing(usr_qq, yaocaolist[j], '草药', -1);
    }
  }
  
  // 雷劫威力计算
  let variable = Math.random() * (power_m - power_n) + power_n;
  variable = variable + aconut / 10;
  variable = Number(variable);
  
  // 高阶体质特效
  if (player.Physique_id > 43) {
    const damagePercent = 0.05;
    const damage = Math.trunc(player.当前血量 * damagePercent);
    player.当前血量 -= damage;
    
    await Write_player(usr_qq, player);
    
    msg.push(`${player.名号}抬头望向天空！`);
    msg.push(`仰天长啸，一拳轰向雷云！`);
    msg.push(`第${aconut}道雷劫竟被硬生生打散！`);
    msg.push(`将打散的雷劫炼化，损失了${damage}点生命值`);
    
    if (aconut >= power_Grade) {

      
      // 保留全属性强化
      const bonus = 500000 * aconut;
      player.生命加成 += bonus;
      player.血量上限 += bonus;
      player.当前血量 += bonus;
      player.防御加成 += bonus;
      player.防御 += bonus;
      player.攻击加成 += bonus;
      player.攻击 += bonus;
      
      await Write_player(usr_qq, player);
      msg.push(`${player.名号}以天劫之力淬炼肉身，肉身劫完成！`);
      msg.push(`肉身经雷劫淬炼，全属性提升${bonus}点！`);
      
      // 立即开始元神劫
      await e.reply(msg);
      console.log(`[${new Date().toISOString()}] ${player.名号}肉身劫完成(43+体质)，等待3秒后进入元神劫`);
      
      // 等待3秒，确保玩家看到消息
      await new Promise(resolve => {
        setTimeout(() => {
          console.log(`[${new Date().toISOString()}] ${player.名号}开始进入元神劫(43+体质)`);
          resolve();
        }, 3000);
      });
      
      // 直接调用元神劫
      console.log(`[${new Date().toISOString()}] ${player.名号}调用元神劫函数(43+体质)`);
      const spiritResult = await spirit_tribulation(e, player);
      console.log(`[${new Date().toISOString()}] ${player.名号}元神劫结果(43+体质):`, spiritResult.success);
      
      if (spiritResult.success) {
        return 3; // 返回3表示双劫完成
      } else {
        return 2; // 返回2表示肉身劫完成但元神劫失败
      }
    }
    
    msg.push(`下一道雷劫在一分钟后落下！`);
    e.reply(msg);
    return 1;
  }
  
  if (power_distortion >= variable) {
    if (aconut >= power_Grade) {
      // 关键优化：不再设置power_place，而是直接触发元神劫
      const bonus = 100000 * aconut;
      player.生命加成 += bonus;
      player.血量上限 += bonus;
      player.当前血量 += bonus;
      player.防御加成 += bonus;
      player.防御 += bonus;
      player.攻击加成 += bonus;
      player.攻击 += bonus;
      
      await Write_player(usr_qq, player);
      msg.push(
        '\n' + player.名号 + '成功度过了第' + aconut + '道雷劫！肉身劫完成！'
      );
      msg.push(`肉身经雷劫淬炼，全属性提升${bonus}点！`);
      
      // 立即开始元神劫
      try {
        await e.reply(msg);
      } catch (err) {
        console.log(`[${new Date().toISOString()}] e.reply错误:`, err);
      }
      console.log(`[${new Date().toISOString()}] ${player.名号}肉身劫完成，等待3秒后进入元神劫`);
      
      // 等待3秒，确保玩家看到消息
      console.log(`[${new Date().toISOString()}] 开始3秒倒计时...`);
      await new Promise(resolve => {
        setTimeout(() => {
          console.log(`[${new Date().toISOString()}] 3秒倒计时结束，${player.名号}开始进入元神劫`);
          resolve();
        }, 3000);
      });
      
      // 关键优化：直接调用元神劫
      console.log(`[${new Date().toISOString()}] ${player.名号}调用元神劫函数`);
      const spiritResult = await spirit_tribulation(e, player);
      console.log(`[${new Date().toISOString()}] ${player.名号}元神劫结果:`, spiritResult.success);
      
      if (spiritResult.success) {
        return 3; // 返回3表示双劫完成
      } else {
        return 2; // 返回2表示肉身劫完成但元神劫失败
      }
    }
    
    let act = variable - power_n;
    act = act / (power_m - power_n);
    player.当前血量 = Math.trunc(player.当前血量 - player.当前血量 * act);
    
    await Write_player(usr_qq, player);
    
    msg.push(
      '\n本次雷伤：' + variable.toFixed(2) +
      '\n本次雷抗：' + power_distortion +
      '\n' + player.名号 + '成功度过了第' + aconut + '道雷劫！' +
      '\n下一道雷劫在一分钟后落下！'
    );
    e.reply(msg);
    return 1;
  } 
  
  // 雷劫失败
  player.当前血量 = 1;
  player.修为 = Math.trunc(player.修为 * 0.5);

  
  await Write_player(usr_qq, player);
  
  msg.push(
    '\n本次雷伤：' + variable.toFixed(2) +
    '\n本次雷抗：' + power_distortion +
    '\n第' + aconut + '道雷劫落下了，' + player.名号 + '未能抵挡！'
  );
  e.reply(msg);
  return 0;
}
// =====================
// 肉身劫函数 (异步版)
// =====================
export async function mortal_tribulation(e, player) {
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  
  // 获取最新玩家数据
  player = await Read_player(usr_qq);
  
  try {
    // 当前系数计算
    let x = await dujie(usr_qq);
    
    // 劫数计算（根据灵根）
    let y = 3; // 默认劫数
    const rootType = player.灵根.type;
    
    // 灵根类型与对应劫数
    const rootLevels = {
      '伪灵根': 3,
      '真灵根': 6,
      '天灵根': 9,
      '体质': 10,
      '转生': 21, '魔头': 21,
      '妖体': 26,'神体': 26,
      '圣体': 52,
      '小成圣体': 72,
      '混沌体': 82,
      '至尊体': 96,
      '大成圣体': 102, '大道体': 102,
      '圣体道胎': 128,
      '神慧者': 1280
    };
    
    y = rootLevels[rootType] || 12;
    
    // 渡劫系数区间
    let n = 11800; // 最低
    let p = 2800;  // 变动
    
    // 元神保护机制
    if (player.虚实转化率 > 0) {
      const reduction = Math.min(0.5, player.虚实转化率 * 0.7);
      n *= (1 - reduction); 
      p *= (1 - reduction); 
      x *= (1 + reduction / 2); 
    }
    
    if (x <= n) {
      player.当前血量 = 0;
      const currentLevel = data.Level_list.find(item => item.level_id == player.level_id);
      const levelExp = currentLevel ? currentLevel.exp : 1000; // 默认值防止找不到
      player.修为 -= parseInt(levelExp / 4);
      await Write_player(usr_qq, player);
      e.reply('天空一声巨响，未降下雷劫，就被天道的气势震死了。');
      return { success: false };
    }
    
    // // 全局渡劫锁定检查
    // if (dj > 0) {
    //   e.reply('已经有人在渡劫了，建议打死他');
    //   return { success: false };
    // }
    
    // dj++;
    
    // 渡劫成功率计算
    let l = (x - n) / (p + y * 0.1) * 100;
    l = l.toFixed(2);
    
    // 发送渡劫信息
    e.reply('天道：就凭这肉身，也敢逆天改命？');
    let img = await get_log_img(
      `[${player.名号}]\n雷抗：${x}\n成功率：${l}%\n灵根：${rootType}\n需渡${y}道雷劫\n将在一分钟后落下\n[温馨提示]请把其他渡劫期打死后再渡劫！`
    );
    e.reply(img);
    
    let aconut = 1;
    let result = { success: false };
    
  let time = setInterval(async () => {
    try {
      const flag = await LevelTask(e, n, p+n, y, aconut, player.虚实转化率 || 0);
      
      // 更新当前雷劫道数
      if (dj_players[usr_qq]) {
        dj_players[usr_qq].count = aconut;
      }
      
      if (flag === 3) {
        // 双劫完成 - 等待LevelTask内部完全执行完毕
        // 注意：LevelTask内部的元神劫已经完成，这里只需清理定时器
        clearInterval(time);
        if (dj_players[usr_qq]) {
          delete dj_players[usr_qq];
        }
        result.success = true;
        dj = 0;
      } else if (flag === 2) {
        // 肉身劫完成但元神劫失败
        clearInterval(time);
        if (dj_players[usr_qq]) {
          delete dj_players[usr_qq];
        }
        
        // 更新玩家状态：标记肉身劫已完成
        player = await Read_player(usr_qq);
        player.power = 1; // 标记已过肉身劫
        player.元神劫上次失败时间 = Date.now(); // 记录失败时间
        await Write_player(usr_qq, player);
        
        result.success = true; // 肉身劫成功
        result.spiritFailed = true; // 元神劫失败标记
        dj = 0;
      } else if (flag === 0) {
        // 肉身劫失败
        clearInterval(time);
        if (dj_players[usr_qq]) {
          delete dj_players[usr_qq];
        }
        result.success = false;
        dj = 0;
      } else {
        // 继续下一道雷劫
        aconut++;
      }
    } catch (error) {
      logger.error(`雷劫任务出错: ${error}`);
      clearInterval(time);
      dj = 0;
    }
  }, 60000);
    
    // 记录渡劫信息
    dj_players[usr_qq] = {
      timer: time,
      grade: y,
      count: aconut
    };
    
    return new Promise(resolve => {
      // 设置超时检查
      const timeout = setTimeout(() => {
        if (!result.success && dj_players[usr_qq]) {
          clearInterval(time);
          delete dj_players[usr_qq];
          dj = 0;
          resolve({ success: false });
        }
      }, 60000 * (y + 5)); // 总劫数时间 + 5分钟缓冲
      
      // 等待结果
      const checkResult = setInterval(() => {
        if (result.success !== undefined) {
          clearInterval(checkResult);
          clearTimeout(timeout);
          resolve(result);
        }
      }, 1000);
    });
    
  } catch (error) {
    logger.error(`肉身劫处理错误: ${error}`);
    return { success: false };
  }
}

// =====================
// 元神劫函数 (完整异步版)
// =====================
export async function spirit_tribulation(e, player) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    console.log(`[${new Date().toISOString()}] spirit_tribulation开始: ${player?.名号 || '未知玩家'} (${usr_qq})`);
    
    // 检查是否已在元神劫中
    if (spirit_players[usr_qq]) {
        console.log(`[${new Date().toISOString()}] ${player?.名号 || '未知玩家'}已在元神劫中`);
        e.reply('你已在元神劫中，请勿重复尝试');
        return { success: false };
    }
    
    // 获取最新玩家数据
    player = await Read_player(usr_qq);
    
    try {
        // 元神化真系数
        const spiritFactor = player.元神 / 1000000 * (1 + (player.虚实转化率 || 0.1));
        
        // 发送元神劫信息
        await e.reply([
            `≡≡≡ 元神化真劫开启 ≡≡≡`,
            `${player.名号}元神出窍，直面真实壁垒`,
            `当前元神强度：${(spiritFactor*100).toFixed(1)}%`,
            `虚实转化率：${((player.虚实转化率 || 0.1)*100).toFixed(1)}%`,
            `将经受九转虚实考验`
        ].join("\n"));
        
        // 初始化元神劫状态
        spirit_players[usr_qq] = {
            current_transformation: 1,
            transformations: 9,
            result: { success: false },
            timer: null,
            startTime: Date.now()
        };
        
        const playerState = spirit_players[usr_qq];
        
        // 创建元神劫定时器
        playerState.timer = setInterval(async () => {
            try {
                // 每转开始前刷新玩家数据
                player = await Read_player(usr_qq);
                
                // 元神消耗（随转数增加）
                const spiritCost = playerState.current_transformation * 50000;
                if (player.元神 < spiritCost) {
                    clearInterval(playerState.timer);
                    playerState.result = { success: false, damage: 0.1 };
                    e.reply(`元神枯竭，无法继续虚实转化！`);
                    delete spirit_players[usr_qq];
                    return;
                }
                
                // 元神震荡（随机波动）
                const fluctuation = (Math.random() * 0.3) - 0.15;
                const current_strength = Math.max(0.05, spiritFactor + fluctuation);
                
                // 转化难度（指数增长）
                const difficulty = 0.1 * Math.pow(1.3, playerState.current_transformation);
                
                // 构建消息
                let msg = `【${player.名号}:第${playerState.current_transformation}转】`;
                msg += `元神强度：${(current_strength*100).toFixed(1)}% 要求：${(difficulty*100).toFixed(1)}%\n`;
                
                if (current_strength > difficulty) {
                    // 虚实转化成功
                    player.元神 -= spiritCost;
                    player.元神上限 += spiritCost * 0.1;
                    player.虚实转化率 = (player.虚实转化率 || 0.1) + 0.125;
                    
                    msg += `≡ 虚实转化成功！\n`;
                    msg += `≡ 元神上限提升至：${player.元神上限.toFixed(0)}\n`;
                    msg += `≡ 虚实转化率提升至：${(player.虚实转化率*100).toFixed(1)}%`;
                    
                    // 保存玩家数据
                    await Write_player(usr_qq, player);
                    
                    // 最终转突破
                    if (playerState.current_transformation >= playerState.transformations) {
                        clearInterval(playerState.timer);
                        msg += `\n\n≡≡≡ 元神化真完成！≡≡≡`;
                        player.power = 2;
                        player.真实掌握度 = 1.0; // 完全掌握真实法则
                        await Write_player(usr_qq, player);
                        
                        // 发送登仙喜报
                        const celebrationMsg = [
                            `≡≡≡ 阴阳同济·永恒证真 ≡≡≡`,
                            `≡ ${player.名号}成功渡过双重无妄真劫，超脱人世间`,
                            `≡ 元神强度：${player.元神.toFixed(0)}`,
                            `≡ 真实掌握度：100%`,
                            `≡ 请即刻#登仙进入仙界！`
                        ].join("\n");
                        
                        e.reply(msg + "\n\n" + celebrationMsg);
                        playerState.result = { success: true };
                        delete spirit_players[usr_qq];
                        return;
                    }
                    
                    e.reply(msg + `\n\n下一转将在1分钟后降临...`);
                    playerState.current_transformation++;
                    
                } else {
                    // 转化失败
                    clearInterval(playerState.timer);
                    const damage = Math.max(0.01, (1 - current_strength) * 0.1);
                    player.虚实转化率 = Math.max(0.01, (player.虚实转化率 || 0.1) - damage);
                    
                    // 记录失败时间和次数
                    player.元神劫上次失败时间 = Date.now();
                    player.元神劫失败次数 = (player.元神劫失败次数 || 0) + 1;
                    
                    // 元神值临时下降
                    const spiritDamage = damage * player.元神 * 0.5;
                    player.元神 = Math.max(500000, player.元神 - spiritDamage);
                    
                    // 保存玩家数据
                    await Write_player(usr_qq, player);
                    
                    msg += `≡≡≡ 元神震荡！≡≡≡\n`;
                    msg += `虚实失衡，转化率受损：-${(damage*100).toFixed(1)}%\n`;
                    msg += `元神值下降：-${spiritDamage.toFixed(0)}`;
                    
                    e.reply(msg);
                    playerState.result = { success: false, damage };
                    delete spirit_players[usr_qq];
                }
            } catch (error) {
                logger.error(`元神劫处理出错: ${error}`);
                clearInterval(playerState.timer);
                playerState.result = { success: false, damage: 0.1 };
                delete spirit_players[usr_qq];
            }
        }, 60000); // 每转间隔1分钟
        
        // 返回Promise等待结果
        return new Promise(resolve => {
            // 设置超时检查
            const timeout = setTimeout(() => {
                if (!playerState.result.success && spirit_players[usr_qq]) {
                    clearInterval(playerState.timer);
                    delete spirit_players[usr_qq];
                    resolve({ success: false });
                }
            }, 60000 * (playerState.transformations + 2)); // 总转数时间 + 2转缓冲
            
            // 定期检查结果
            const checkInterval = setInterval(() => {
                if (playerState.result.success !== undefined) {
                    clearInterval(checkInterval);
                    clearTimeout(timeout);
                    resolve(playerState.result);
                }
            }, 1000);
        });
        
    } catch (error) {
        logger.error(`元神劫初始化错误: ${error}`);
        if (spirit_players[usr_qq]) {
            delete spirit_players[usr_qq];
        }
        return { success: false };
    }
}

export async function dujie(user_qq) {
  let usr_qq = user_qq;
  let player = await Read_player(usr_qq);
  
  // 基础属性归一化
  var new_blood = player.当前血量 / 100000;
  var new_defense = player.防御 / 100000;
  var new_attack = player.攻击 / 100000;
  
  // 属性权重分配
  new_blood = (new_blood * 4) / 10;
  new_defense = (new_defense * 6) / 10;
  new_attack = (new_attack * 2) / 10;
  
  // 基础厚度计算
  var N = new_blood + new_defense;
  
  // 初始系数
  var x = N * new_attack;
  
  // 灵根加成
  const rootBonus = {
    '伪灵根': 1.0,
    '真灵根': 1.5,
    '天灵根': 1.75,
    '转生': 2.5,'魔头': 2.5,
    '神体': 3.0,'妖体': 3.0,
    '圣体': 4.0,
    '小成圣体': 5.0,
    '大成圣体': 8.0,'至尊体': 8.0,'命运': 8.0,'魔头': 8.0,
    '混沌体': 8.0,
    '大道体': 8.0,
    '圣体道胎': 10.0,'神魔体': 12.0,
    '神慧者': 15.0,
    '圆环之理': 15.0
  };
  
  // 应用灵根加成
  const rootType = player.灵根.type || '伪灵根';
  x *= rootBonus[rootType] || 1.0;
  
  // 虚实转化率加成
  if (player.虚实转化率 && player.虚实转化率 > 0) {
    const illusionBonus = Math.min(2.0, 1 + player.虚实转化率 * 5);
    x *= illusionBonus;
  }
  
  // 结果格式化
  return Number(x.toFixed(2));
}
//写入存档信息,第二个参数是一个JavaScript对象
export async function Write_player(usr_qq, player) {
  let dir = path.join(__PATH.player_path, `${usr_qq}.json`);
  let new_ARR = JSON.stringify(player, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

//读取装备信息，返回成一个JavaScript对象
export async function Read_equipment(usr_qq) {
  let dir = path.join(`${__PATH.equipment_path}/${usr_qq}.json`);
  let equipment = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  equipment = JSON.parse(equipment);
  return equipment;
}

//写入装备信息,第二个参数是一个JavaScript对象
export async function Write_equipment(usr_qq, equipment) {
  let player = await Read_player(usr_qq);

   // 新增逻辑：如果仙古今世法等级是undefined，则赋值为1
  if (player.xiangulevel_id === undefined) {
    player.xiangulevel_id = 1;
  }
   if (!player.光阴加成) player.光阴加成 = { 攻: 0, 防: 0, 生: 0 };
  player.攻击 =
    data.Level_list.find(item => item.level_id == player.level_id).基础攻击 +
    player.攻击加成 + player.光阴加成.攻+
    data.LevelMax_list.find(item => item.level_id == player.Physique_id).基础攻击+ 
    data.Levelmijing_list.find(item => item.level_id == player.mijinglevel_id).基础攻击+ 
    data.xiangujinshi_list.find(item => item.level_id == player.xiangulevel_id).基础攻击;
  player.防御 =
    data.Level_list.find(item => item.level_id == player.level_id).基础防御 +
   player.防御加成 +player.光阴加成.防+
    data.LevelMax_list.find(item => item.level_id == player.Physique_id).基础防御+ 
    data.Levelmijing_list.find(item => item.level_id == player.mijinglevel_id).基础防御+ 
    data.xiangujinshi_list.find(item => item.level_id == player.xiangulevel_id).基础防御;
  player.血量上限 =
    data.Level_list.find(item => item.level_id == player.level_id).基础血量 +
    player.生命加成 +player.光阴加成.生+
    data.LevelMax_list.find(item => item.level_id == player.Physique_id).基础血量+ 
    data.Levelmijing_list.find(item => item.level_id == player.mijinglevel_id).基础血量+ 
    data.xiangujinshi_list.find(item => item.level_id == player.xiangulevel_id).基础血量;;
  player.暴击率 =
    data.Level_list.find(item => item.level_id == player.level_id).基础暴击 +
    data.LevelMax_list.find(item => item.level_id == player.Physique_id)
      .基础暴击;
const 灵根攻击 = player.灵根?.攻击 ?? 0;
const 灵根防御 = player.灵根?.防御 ?? 0;
const 灵根生命 = player.灵根?.生命 ?? 0;   
player.攻击 = player.攻击 * (1+灵根攻击);
player.防御 = player.防御 *(1+灵根防御);
player.血量上限 = player.血量上限 * (1+灵根生命);
  let type = ['武器', '护具', '法宝','帝兵'];
  for (let i of type) {
    if (
      equipment[i].atk > 99 ||
      equipment[i].def > 99||
      equipment[i].HP > 99
    ) {
      player.攻击 += equipment[i].atk;
      player.防御 += equipment[i].def;
      player.血量上限 += equipment[i].HP;
    } else {
      player.攻击 = Math.trunc(player.攻击 * (1 + equipment[i].atk));
      player.防御 = Math.trunc(player.防御 * (1 + equipment[i].def));
      player.血量上限 = Math.trunc(player.血量上限 * (1 + equipment[i].HP));
    }
    player.暴击率 += equipment[i].bao;
  }
  player.暴击伤害 = player.暴击率 + 1.5;
  if (player.暴击伤害 > 2.5) player.暴击伤害 = 2.5;
  if (player.仙宠.type == '暴伤') player.暴击伤害 += player.仙宠.加成;
      if (equipment.武器.name == "灭仙剑" && equipment.法宝.name == "灭仙符" && equipment.护具.name == "灭仙衣" && player.魔道值 > 999 && player.灵根.type == "魔头") {
        player.攻击 = Math.trunc(1.15 * player.攻击);
    }
    if (equipment.武器.name == "诛仙枪" && equipment.法宝.name == "诛仙花" && equipment.护具.name == "诛仙甲" && player.魔道值 > 999 && player.灵根.type == "魔头") {
        player.攻击 = Math.trunc(1.05 * player.攻击);
        player.血量上限 = Math.trunc(1.2 * player.血量上限);
    }
    if (equipment.武器.name == "光明剑" && equipment.法宝.name == "光明符" && equipment.护具.name == "光明衣" && player.魔道值 < 1 && player.灵根.type == "转生" ) {
        player.攻击 = Math.trunc(1.15 * player.攻击);
    }
    if (equipment.武器.name == "神月剑" && equipment.法宝.name == "神日花" && equipment.护具.name == "神星甲" && player.魔道值 < 1 && player.灵根.type == "转生" ) {
        player.攻击 = Math.trunc(1.05 * player.攻击);
        player.血量上限 = Math.trunc(1.2 * player.血量上限);
    }
    if (equipment.武器.name == "【武祖】万仙武极天" && equipment.法宝.name == "【神命】无法无天" && equipment.护具.name == "【如梦】道祖的加护" && player.魔道值 < 1 && (  player.灵根.type == "命运")) {
        player.攻击 = Math.trunc(3 * player.攻击);
        player.血量上限 = Math.trunc(3 * player.血量上限);
        player.防御 = Math.trunc(3 * player.防御);
    }
    if (equipment.武器.name == "【邪神】斩仙灭神剑" && equipment.法宝.name == "【邪神】魔渊的凝视" && equipment.护具.name == "【邪神】冥王真祖甲" && player.魔道值 > 9999 && ( player.灵根.type == "天魔")) {
        player.攻击 = Math.trunc( 4* player.攻击);
        player.血量上限 = Math.trunc(2 * player.血量上限);
        player.防御 = Math.trunc(2.5 * player.防御);
    }
    if (equipment.武器.name == "【光阴】天道之剑" && equipment.法宝.name == "【光阴】命运之心" && equipment.护具.name == "【光阴】主宰之甲"  && ( player.灵根.type == "命运")) {
        player.攻击 = Math.trunc( 6* player.攻击);
        player.血量上限 = Math.trunc(6 * player.血量上限);
        player.防御 = Math.trunc(6 * player.防御);
    }
    if (equipment.武器.name == "【光阴】天道之剑" && equipment.法宝.name == "【光阴】命运之心" && equipment.护具.name == "【光阴】主宰之甲"  && ( player.灵根.type == "天魔")) {
        player.攻击 = Math.trunc( 7* player.攻击);
        player.血量上限 = Math.trunc(5 * player.血量上限);
        player.防御 = Math.trunc(6 * player.防御);
    }
    if (equipment.武器.name == "【超维】天帝剑" && ( player.灵根.type == "命运")) {
        player.攻击 = Math.trunc( 10* player.攻击);
        player.血量上限 = Math.trunc(8 * player.血量上限);
        player.防御 = Math.trunc(8* player.防御);
    } 
    if (equipment.武器.name == "【超维】多元星盘" && ( player.灵根.type == "命运")) {
        player.攻击 = Math.trunc( 7* player.攻击);
        player.血量上限 = Math.trunc(10 * player.血量上限);
        player.防御 = Math.trunc(5 * player.防御);
    }  
    if (equipment.武器.name == "【超维】主帝神甲" && ( player.灵根.type == "命运")) {
        player.攻击 = Math.trunc( 5* player.攻击);
        player.血量上限 = Math.trunc(5 * player.血量上限);
        player.防御 = Math.trunc(10 * player.防御);
    } 
    if (equipment.武器.name == "【超维】天帝剑" && ( player.灵根.type == "天魔")) {
        player.攻击 = Math.trunc( 15* player.攻击);
        player.血量上限 = Math.trunc(8 * player.血量上限);
        player.防御 = Math.trunc(8 * player.防御);
    } 
    if (equipment.武器.name == "【超维】多元星盘" && ( player.灵根.type == "天魔")) {
        player.攻击 = Math.trunc( 7* player.攻击);
        player.血量上限 = Math.trunc(10 * player.血量上限);
        player.防御 = Math.trunc(5 * player.防御);
    }  
    if (equipment.武器.name == "【超维】主帝神甲" && ( player.灵根.type == "天魔")) {
        player.攻击 = Math.trunc( 5* player.攻击);
        player.血量上限 = Math.trunc(5 * player.血量上限);
        player.防御 = Math.trunc(10 * player.防御);
    }    
    if (equipment.武器.name == "【极道帝兵】万物母气鼎"  &&  player.灵根.type == "大成圣体") {
        player.攻击 = Math.trunc( 15 * player.攻击);
        player.血量上限 = Math.trunc(5 * player.血量上限);
        player.防御 = Math.trunc(5 * player.防御);
    }
   if ( equipment.武器.name == "仙帝器·大罗仙剑" &&  player.mijinglevel_id >= 20 ) {
        player.攻击 = Math.trunc( 17.5 * player.攻击);
        player.血量上限 = Math.trunc(10 * player.血量上限);
        player.防御 = Math.trunc(10 * player.防御);
        
    }
       if ( equipment.武器.name == "荒剑"  &&  player.mijinglevel_id >= 21) {
        player.攻击 = Math.trunc( 20 * player.攻击);
        player.血量上限 = Math.trunc(10 * player.血量上限);
        player.防御 = Math.trunc(10 * player.防御);
        
    }
              if ( equipment.武器.name == "天帝鼎"  &&  player.mijinglevel_id >= 21) {
        player.攻击 = Math.trunc( 20 * player.攻击);
        player.血量上限 = Math.trunc(10 * player.血量上限);
        player.防御 = Math.trunc(10 * player.防御);
    }

                   if ( equipment.护具.name == "祭道甲胄" &&  player.mijinglevel_id >= 21) {
        player.攻击 = Math.trunc( 15 * player.攻击);
        player.血量上限 = Math.trunc(20 * player.血量上限);
        player.防御 = Math.trunc(35 * player.防御);
    }
               if ( equipment.法宝.name == "雷池" &&  player.mijinglevel_id >= 21) {
        player.攻击 = Math.trunc( 20 * player.攻击);
        player.血量上限 = Math.trunc(20 * player.血量上限);
        player.防御 = Math.trunc(20 * player.防御);
    }
     if ( equipment.帝兵.author_name == player.id ) {
        player.攻击 += Math.trunc( equipment.帝兵.全属性 * player.攻击);
        player.血量上限 += Math.trunc(equipment.帝兵.全属性 * player.血量上限);
        player.防御 += Math.trunc(equipment.帝兵.全属性 * player.防御); 
    }
                  if ( (equipment.帝兵.name== "封神榜"||equipment.帝兵.name== "神女炉"||equipment.帝兵.name== "天庭权杖")&&player.mijinglevel_id < 12&&player.xiangulevel_id < 12  ) {
       player.攻击 += Math.trunc( equipment.帝兵.全属性 * player.攻击/10);
        player.血量上限 += Math.trunc(equipment.帝兵.全属性 * player.血量上限/10);
        player.防御 += Math.trunc(equipment.帝兵.全属性 * player.防御/10); 
}
         else   if ( equipment.帝兵&&!equipment.帝兵.author_name  ) {
       player.攻击 += Math.trunc( equipment.帝兵.全属性 * player.攻击);
        player.血量上限 += Math.trunc(equipment.帝兵.全属性 * player.血量上限);
        player.防御 += Math.trunc(equipment.帝兵.全属性 * player.防御); 
}
    await Write_player(usr_qq, player);
    await Add_HP(usr_qq, 0);
    let dir = path.join(__PATH.equipment_path, `${usr_qq}.json`);
    let new_ARR = JSON.stringify(equipment, "", "\t");
    fs.writeFileSync(dir, new_ARR, 'utf8', (err) => {
        console.log('写入成功', err)
    })
    return;
}

export async function Write_linggen(usr_qq) {
  // 1. 读取玩家当前数据
  let player = await Read_player(usr_qq);

const 灵根攻击 = player.灵根?.攻击 ?? 0;
const 灵根防御 = player.灵根?.防御 ?? 0;
const 灵根生命 = player.灵根?.生命 ?? 0;   
player.攻击 = player.攻击 * (1+灵根攻击);
player.防御 = player.防御 *(1+灵根防御);
player.血量上限 = player.血量上限 * (1+灵根生命);
    
    // 生命本源直接加算
    if (player.灵根.生命本源) {
      player.生命本源 = 100+player.灵根.生命本源;
    }
  

  // 5. 保存更新后的玩家数据
  await Write_player(usr_qq, player);

  return ;
}
//读取纳戒信息，返回成一个JavaScript对象
export async function Read_najie(usr_qq) {
  let dir = path.join(`${__PATH.najie_path}/${usr_qq}.json`);
  let najie = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  try {
    najie = JSON.parse(najie);
  } catch {
    //转换不了，纳戒错误
    await fixed(usr_qq);
    najie = await Read_najie(usr_qq);
  }
  return najie;
}
/**
 * 返回该玩家的仙宠图片
 * @return image
 */
export async function get_XianChong_img(e) {
  let i;
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  let XianChong_have = [];
  let XianChong_need = [];
  let Kouliang = [];
  let XianChong_list = data.xianchon;
  let Kouliang_list = data.xianchonkouliang;
  for (i = 0; i < XianChong_list.length; i++) {
    if (najie.仙宠.find(item => item.name == XianChong_list[i].name)) {
      XianChong_have.push(XianChong_list[i]);
    } else if (player.仙宠.name == XianChong_list[i].name) {
      XianChong_have.push(XianChong_list[i]);
    } else {
      XianChong_need.push(XianChong_list[i]);
    }
  }
  for (i = 0; i < Kouliang_list.length; i++) {
    Kouliang.push(Kouliang_list[i]);
  }
  let player_data = {
    nickname: player.名号,
    XianChong_have,
    XianChong_need,
    Kouliang,
  };
  const data1 = await new Show(e).get_xianchong(player_data);
  return await puppeteer.screenshot('xianchong', {
    ...data1,
  });
}
/**
 * 通用消息图片
 * @return image
 */
export async function get_log_img(e){
  let log2=e
  let log={
    log:log2
  }

  const data1 = await new Show(e).get_log(log);
  return await puppeteer.screenshot('log', {
    ...data1,
  });
}
export async function get_log3_img(e){
 

  const data1 = await new Show(e).get_log(log);
  return await puppeteer.screenshot('log3', {
    ...data1,
  });
}

/**
 * 沉迷消息图片
 * @return image
 */
export async function get_log2_img(e){
  let log2=e
  let log={
    log:log2
  }

  const data1 = await new Show(e).get_log2(log);
  return await puppeteer.screenshot('log2', {
    ...data1,
  });
}
/**
 * 返回该图片
 * @return image
 */
export async function get_daoju_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  let daoju_have = [];
  let daoju_need = [];
  for (const i of data.daoju_list) {
    if (najie.道具.find(item => item.name == i.name)) {
      daoju_have.push(i);
    } else {
      daoju_need.push(i);
    }
  }
  let player_data = {
    user_id: usr_qq,
    nickname: player.名号,
    daoju_have,
    daoju_need,
  };
  const data1 = await new Show(e).get_daojuData(player_data);
  return await puppeteer.screenshot('daoju', {
    ...data1,
  });
}

/**
 * 返回该玩家的武器图片
 * @return image
 */
export async function get_wuqi_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  let equipment = await Read_equipment(usr_qq);
  let wuqi_have = [];
  let wuqi_need = [];
  const wuqi_list = [
    'equipment_list',
    'dibing_list',
    'tszb_list',
    'timeequipmen_list',
    'duanzhaowuqi',
    'duanzhaohuju',
    'duanzhaobaowu',
  ];
  let zb = [];
  for (const i of wuqi_list) {
    for (const j of data[i]) {
      if (
        najie['装备'].find(item => item.name == j.name) &&
        !wuqi_have.find(item => item.name == j.name)
      ) {
        wuqi_have.push(j);
      } else if (
        (equipment['武器'].name == j.name ||
          equipment['法宝'].name == j.name ||
          equipment['护具'].name == j.name||
          equipment['帝兵'].name == j.name) &&
        !wuqi_have.find(item => item.name == j.name)
      ) {
        wuqi_have.push(j);
      } else if (!wuqi_need.find(item => item.name == j.name)) {
        wuqi_need.push(j);
      }
    }
  }

  let player_data = {
    user_id: usr_qq,
    nickname: player.名号,
    wuqi_have,
    wuqi_need,
  };
  const data1 = await new Show(e).get_wuqiData(player_data);
  return await puppeteer.screenshot('wuqi', {
    ...data1,
  });
}
export async function get_neijingdi_img(e) {
    // 用户ID处理
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 验证玩家是否存在
    if (!data.existData('player', usr_qq)) {
        return e.reply('请先创建角色');
    }
    
    // 获取玩家数据和内景地数据
    const player = await data.getData('player', usr_qq);
    const innerWorld = await data.getData('inner_world', usr_qq);
    
    // 检查是否已开辟内景地
    if (player.内景地开辟 !== 1) {
        return e.reply('尚未开辟内景地空间');
    }
    
    // 获取当前时间戳
    const now = Date.now();
    
    // 定义时间格式化函数 - 显示具体日期时间和相对时间
    const formatStorageTime = (timestamp) => {
        if (!timestamp) return { absolute: '未知时间', relative: '未知时间前存放' };
        
        try {
            // 确保时间戳是数字
            timestamp = Number(timestamp);
            
            // 检查时间戳单位（毫秒或秒）
            if (timestamp < 10000000000) {
                timestamp *= 1000; // 转换为毫秒
            }
            
            const date = new Date(timestamp);
            
            // 1. 格式化绝对时间（具体日期时间）
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const absoluteTime = `${year}年${month}月${day}日 ${hours}:${minutes}`;
            
            // 2. 计算相对时间（几天前几点几分存放）
            const diffMs = now - timestamp;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            let relativeTime = '';
            if (diffDays > 0) {
                relativeTime = `${diffDays}天前 ${hours}:${minutes}存放`;
            } else if (diffHours > 0) {
                relativeTime = `${diffHours}小时${diffMinutes}分钟前存放`;
            } else if (diffMinutes > 0) {
                relativeTime = `${diffMinutes}分钟前存放`;
            } else {
                relativeTime = '刚刚存放';
            }
            
            return {
                absolute: absoluteTime,
                relative: relativeTime
            };
        } catch (err) {
            console.error('时间格式化错误:', err);
            return {
                absolute: '时间错误',
                relative: '时间错误'
            };
        }
    };
    
    // 动态分类内景地物品
    const categorizedItems = {};
    const VALID_CATEGORIES = ["装备","丹药", "道具", "功法", "草药",  "食材", "材料", "仙宠口粮", "盒子", "仙宠"];
    
    VALID_CATEGORIES.forEach(category => {
        if (innerWorld[category] && innerWorld[category].length > 0) {
            categorizedItems[category] = innerWorld[category].map(item => {
                // 生成星星字符串
                const stars = item.稀有度 ? '★'.repeat(item.稀有度) : '';
                
                // 格式化时间
                const timeInfo = formatStorageTime(item.存入时间);
                
                return {
                    name: item.name,
                    amount: item.数量 || 1,
                    pinji: item.pinji || null,
                    rarity: item.稀有度 || null,
                    storageTimeAbsolute: timeInfo.absolute, // 绝对时间
                    storageTimeRelative: timeInfo.relative, // 相对时间
                    stars: stars // 添加星星字符串
                };
            });
        }
    });
    
    // 计算空间使用率
    const usedPercent = Math.round((innerWorld.当前容量 / innerWorld.最大容量) * 100);
    
    // 格式化最后更新时间
    const lastUpdateInfo = formatStorageTime(innerWorld.最后更新时间);
    
    // 准备渲染数据
    const renderData = {
        user_id: usr_qq,
        nickname: player.名号,
        innerWorld: {
            level: innerWorld.等级,
            spiritStones: innerWorld.灵石,
            currentCapacity: innerWorld.当前容量,
            maxCapacity: innerWorld.最大容量,
            usedPercent: usedPercent,
            upgradeCost: innerWorld.等级 * 500000, // 示例：每级升级需要100源石
            lastUpdateAbsolute: lastUpdateInfo.absolute, // 最后更新绝对时间
            lastUpdateRelative: lastUpdateInfo.relative, // 最后更新相对时间
            categorizedItems: categorizedItems // 分类物品
        },
        sortedCategories: Object.keys(categorizedItems).sort()
    };
    
    // 获取渲染数据并生成截图
    const templateData = await new Show(e).get_neijingdiData(renderData);
    return await puppeteer.screenshot('neijingdi', templateData);
}
// 时间戳转换函数
function formatStorageTime(timestamp) {
    if (!timestamp) return '未知时间';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // 如果是今天，显示具体时间
    if (diffDays === 0) {
        return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    // 如果是昨天
    else if (diffDays === 1) {
        return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    // 如果是7天内
    else if (diffDays < 7) {
        return `${diffDays}天前`;
    }
    // 其他情况显示完整日期
    else {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
}
/**
 * 返回该玩家的丹药图片
 * @return image
 */
export async function get_danyao_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  const player = await Read_player(usr_qq);
  const najie = await Read_najie(usr_qq);
  let danyao_have = [];
  let danyao_need = [];
  const danyao = ['danyao_list', 'timedanyao_list', 'newdanyao_list'];
  for (const i of danyao) {
    for (const j of data[i]) {
      if (
        najie['丹药'].find(item => item.name == j.name) &&
        !danyao_have.find(item => item.name == j.name)
      ) {
        danyao_have.push(j);
      } else if (!danyao_need.find(item => item.name == j.name)) {
        danyao_need.push(j);
      }
    }
  }
  let player_data = {
    user_id: usr_qq,
    nickname: player.名号,
    danyao_have,
    danyao_need,
  };
  const data1 = await new Show(e).get_danyaoData(player_data);
  return await puppeteer.screenshot('danyao', {
    ...data1,
  });
}
export async function get_linggen_img(e) {
    let player; // 将 player 声明在函数顶部
    
    try {
        // 1. 获取玩家数据
        let usr_qq = e.user_id.toString().replace('qg_','');
        usr_qq = await channel(usr_qq);
        player = await Read_player(usr_qq);
        
        // 2. 获取所有灵根数据
        const allLinggen = data.talent_list;
        
        // 辅助函数：计算品质类
        function calculateQualityClass(linggen) {
            const attackBonus = parseFloat(linggen.攻击 || 0);
            const defenseBonus = parseFloat(linggen.防御 || 0);
            const healthBonus = parseFloat(linggen.生命 || 0);
            const totalBonus = attackBonus + defenseBonus + healthBonus;
            
            if (totalBonus >= 3.0) return 'quality-rainbow';
            if (totalBonus >= 2.5) return 'quality-red';
            if (totalBonus >= 2.0) return 'quality-orange';
            if (totalBonus >= 1.5) return 'quality-gold';
            if (totalBonus >= 1.0) return 'quality-purple';
            if (totalBonus >= 0.5) return 'quality-blue';
            if (totalBonus >= 0.2) return 'quality-green';
            return 'quality-white';
        }
        
        // 3. 按归类分组灵根（优先使用"归类"属性，没有则使用"type"）
        const linggenGroups = {};
        allLinggen.forEach(linggen => {
            // 确定分组键 - 优先使用"归类"属性
            const groupKey = linggen.归类 || linggen.type || "其他";
            
            if (!linggenGroups[groupKey]) {
                linggenGroups[groupKey] = [];
            }
            
            // 格式化属性显示
            const formattedLinggen = {
                ...linggen,
                eff: `${(linggen.eff * 100).toFixed(0)}%`,
                法球倍率: `${(linggen.法球倍率 * 100).toFixed(0)}%`,
                攻击加成: `${((linggen.攻击 || 0) * 100).toFixed(0)}%`,
                防御加成: `${((linggen.防御 || 0) * 100).toFixed(0)}%`,
                生命加成: `${((linggen.生命 || 0) * 100).toFixed(0)}%`,
                生命本源: linggen.生命本源 || 0,
                isCurrent: player.灵根?.id === linggen.id,
                qualityClass: calculateQualityClass(linggen)
            };
            
            linggenGroups[groupKey].push(formattedLinggen);
        });
        
        // 4. 构建模板数据
        const templateData = {
            title: "灵根图鉴",
            current: player.灵根?.name || "无",
            groups: Object.entries(linggenGroups).map(([groupName, linggens]) => ({
                groupName,
                linggens
            })),
            totalLinggens: allLinggen.length
        };
        
        // 5. 获取模板数据
        const data1 = await new Show(e).get_linggenData(templateData);
        
        // 6. 生成图片
        return await puppeteer.screenshot('linggen', {
            ...data1,
        });
        
    } catch (err) {
        console.error('生成灵根图鉴失败:', err);
        
        // 降级方案：返回文本信息
        // 确保 player 变量已定义
        const currentLinggenName = player ? (player.灵根?.name || "无") : "无";
        
        return [
            `【灵根图鉴】`,
            `生成图片失败: ${err.message}`,
            `当前灵根: ${currentLinggenName}`,
            ...data.talent_list.map(l => 
                `${l.name}(${l.type}): 修${(l.eff*100).toFixed(0)}% 攻${((l.攻击||1)*100-100).toFixed(0)}%`
            )
        ].join('\n');
    }
}
/**
 * 返回该玩家的功法图片
 * @return image
 */
export async function get_gongfa_img(e) {
  let i;
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let xuexi_gongfa = player.学习的功法;
  let gongfa_have = [];
  let gongfa_need = [];
  const gongfa = ['gongfa_list', 'timegongfa_list', 'dijingList'];
  for (const i of gongfa) {
    for (const j of data[i]) {
      if (
        xuexi_gongfa.find(item => item == j.name) &&
        !gongfa_have.find(item => item.name == j.name)
      ) {
        gongfa_have.push(j);
      } else if (!gongfa_need.find(item => item.name == j.name)) {
        gongfa_need.push(j);
      }
    }
  }
  let player_data = {
    user_id: usr_qq,
    nickname: player.名号,
    gongfa_have,
    gongfa_need,
  };
  const data1 = await new Show(e).get_gongfaData(player_data);
  return await puppeteer.screenshot('gongfa', {
    ...data1,
  });
}
export async function get_hecheng_img(e) {
    // 用户ID处理
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 验证玩家是否存在
    if (!data.existData('player', usr_qq)) return;
    
    // 获取玩家数据和合成列表
    const player = await data.getData('player', usr_qq);
    const hechengItems = data.hecheng_list;
    
    // 动态分类合成项目[1](@ref)
    const categorizedItems = {};
    
    hechengItems.forEach(item => {
        const category = item.class || '材料';
        if (!categorizedItems[category]) {
            categorizedItems[category] = [];
        }
        
        categorizedItems[category].push({
            name: item.name,
            materials: item.materials.map(mat => ({
                name: mat.name,
                class: mat.class,
                amount: mat.amount
            }))
        });
    });
    
    // 准备渲染数据
    const renderData = {
        user_id: usr_qq,
        nickname: player.名号,
        categorizedItems,
        unlockedCount: player.hecheng_unlocked || 0,
        totalCount: hechengItems.length,
        // 新增分类排序功能
        sortedCategories: Object.keys(categorizedItems).sort()
    };
    
    // 获取渲染数据并生成截图[5,7](@ref)
    const templateData = await new Show(e).get_hechengData(renderData);
    return await puppeteer.screenshot('hecheng', templateData);
}
export async function get_xiuxianqiandao_img(e, player, gift_xiuwei, yuanshi, ticketCount, isSignedToday = false) {
    // 获取玩家境界信息
    const 练气 = data.Level_list.find(item => item.level_id == player.level_id);
    const 炼体 = data.LevelMax_list.find(item => item.level_id == player.Physique_id);
    const 秘境体系 = data.Levelmijing_list.find(item => item.level_id == player.mijinglevel_id);
    const 仙古今世法 = data.xiangujinshi_list.find(item => item.level_id == player.xiangulevel_id);
    
    // 获取当前日期信息
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // 生成日历数据
    const calendarData = await generateCalendarData(player, year, month);
    
    // 准备渲染数据
    const renderData = {
        nickname: player.名号 || "修仙者",
        signDays: player.连续签到天数 || 1,
        realm1: 练气.level || 练气.level_name || "未知",
        realm2: 炼体.level || 炼体.level_name || "未知",
        realm3: 秘境体系.level || "未知",
        realm4: 仙古今世法.level || "未知",
        xiuwei: isSignedToday ? "0 (已签到)" : bigNumberTransform(gift_xiuwei),
        xueqi: isSignedToday ? "0 (已签到)" : bigNumberTransform(gift_xiuwei),
        lingshi: isSignedToday ? "0 (已签到)" : bigNumberTransform(yuanshi),
        yuanshi: isSignedToday ? "0 (已签到)" : bigNumberTransform(yuanshi),
        tickets: isSignedToday ? "0 (已签到)" : ticketCount,
        isDaofaPlayer: player.daofaxianshu == 2,
        calendar: calendarData
    };
    
    // 获取渲染数据并生成截图
    const templateData = await new Show(e).get_qiandaoData(renderData);
    return await puppeteer.screenshot('xiuxianqiandao', templateData);
}
export async function generateCalendarData(player, year, month) {
    // 如果玩家不存在，返回空日历
    if (!player) {
        const totalDays = new Date(year, month, 0).getDate();
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        
        return {
            year: year,
            month: month,
            signedCount: 0,
            totalDays: totalDays,
            progress: 0,
            emptyDays: firstDayOfMonth,
            days: []
        };
    }
    
    // 初始化签到记录对象
    if (!player.signRecord) {
        player.signRecord = {};
    }
    
    // 创建月份键名
    const monthKey = `${year}-${month}`;
    
    // 计算正确的总天数
    const correctTotalDays = new Date(year, month, 0).getDate();
    
    // 获取月份数据
    let monthData = player.signRecord[monthKey];
    
    // 如果月份数据不存在，创建新数据
    if (!monthData) {
        monthData = {
            signedDays: [],
            totalDays: correctTotalDays
        };
        player.signRecord[monthKey] = monthData;
    }
    
    // 确保总天数正确
    if (monthData.totalDays !== correctTotalDays) {
        monthData.totalDays = correctTotalDays;
    }
    
    // 2. 获取当月第一天是星期几（0=周日）
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    
    // 3. 获取当前日期
    const now = new Date();
    const currentDay = now.getDate();
    
    // 4. 生成日期数组
    const days = [];
    for (let d = 1; d <= monthData.totalDays; d++) {
        // 计算每个日期的星期几
        const date = new Date(year, month - 1, d);
        const dayOfWeek = date.getDay(); // 0=周日, 1=周一, ..., 6=周六
        
        days.push({
            day: d,
            isSigned: monthData.signedDays.includes(d),
            isToday: d === currentDay,
            dayOfWeek: dayOfWeek
        });
    }
    
    // 5. 计算签到进度
    const progress = Math.floor((monthData.signedDays.length / monthData.totalDays) * 100);
    
    // 添加详细日志
    console.log(`[日历数据] ${year}年${month}月`);
    console.log(` - 总天数: ${monthData.totalDays}`);
    console.log(` - 已签天数: ${monthData.signedDays.length}`);
    console.log(` - 签到日期: ${monthData.signedDays.join(', ') || '无'}`);
    
    return {
        year: year,
        month: month,
        signedCount: monthData.signedDays.length,
        totalDays: monthData.totalDays,
        progress: progress,
        emptyDays: firstDayOfMonth,
        days: days
    };
}
export async function get_chengjiu_img(e) {
    // 用户ID处理
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 验证玩家是否存在
    if (!data.existData('player', usr_qq)) return;
    
    // 获取玩家数据和成就列表
    const player = await data.getData('player', usr_qq);
    const chengjiuItems = data.chengjiu_list;
    
    // 动态分类成就项目
    const categorizedItems = {};
    let unlockedCount = 0;
    
    chengjiuItems.forEach(item => {
        const category = item.type || '其他成就';
        if (!categorizedItems[category]) {
            categorizedItems[category] = [];
        }
        
        // 检查成就是否已解锁 - 使用成就ID匹配
        const unlocked = player.成就 && Array.isArray(player.成就) && 
                         player.成就.includes(item.id.toString());
        
        if (unlocked) unlockedCount++;
        
        categorizedItems[category].push({
            id: item.id,
            name: item.name,
            desc: item.desc,
            unlocked: unlocked
        });
    });
    
    // 准备渲染数据
    const renderData = {
        user_id: usr_qq,
        nickname: player.名号 || "未知玩家",
        categorizedItems: categorizedItems,
        unlockedCount: unlockedCount,
        totalCount: chengjiuItems.length,
        sortedCategories: Object.keys(categorizedItems).sort()
    };
    
    // 获取渲染数据并生成截图
    const templateData = await new Show(e).get_chengjiuData(renderData);
    return await puppeteer.screenshot('chengjiu', templateData);
}

export async function get_lqpf_img(e) {
    // 用户ID处理
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 验证玩家是否存在
    if (!data.existData('player', usr_qq)) return;
    
    // 获取玩家数据
    const player = await data.getData('player', usr_qq);
    
    // 获取皮肤目录路径
    const skinDir = __PATH.player_pifu_path;
    
    // 读取所有皮肤文件
    let skinFiles = [];
    try {
        skinFiles = fs.readdirSync(skinDir).filter(file => 
            file.endsWith('.jpg') || file.endsWith('.png')
        );
    } catch (err) {
        console.error('读取皮肤目录失败:', err);
        return '获取皮肤数据失败，请检查目录配置';
    }
    
    // 构建皮肤数据
    const skinData = skinFiles.map(file => {
        const id = path.basename(file, path.extname(file));
        return {
            id,
            name: `练气·${id}`,
            path: path.join(skinDir, file),
            isEquipped: player.练气皮肤 === id
        };
    });
    
    // 准备渲染数据
    const renderData = {
        user_id: usr_qq,
        nickname: player.名号 || "无名修士",
        skinData: skinData,
        totalCount: skinFiles.length,
        equippedCount: skinData.filter(skin => skin.isEquipped).length
    };
    
    // 获取渲染数据并生成截图
    const templateData = await new Show(e).get_lqpfData(renderData);
    return await puppeteer.screenshot('lqpf', templateData);
}
export async function get_xigen_img(e) {
    try {
        let usr_qq = e.user_id.toString().replace('qg_', '');
        usr_qq = await channel(usr_qq);

        // 1. 验证玩家是否存在
        if (!data.existData('player', usr_qq)) return;

        // 2. 异步读取所有玩家文件
        const files = await fs.promises.readdir(__PATH.player_path);
        const jsonFiles = files.filter(file => file.endsWith(".json"));

        // 3. 并行读取玩家数据（提升效率）
        const players = await Promise.all(
            jsonFiles.map(async file => {
                const qq = file.replace(".json", '');
                const player = await Read_player(parseInt(qq));
                
                // 处理洗根次数未找到的情况，设为0
                const washCount = player.洗根次数 || 0;
                
                return {
                    qq,
                    name: player.名号,
                    washCount: washCount,
                    linggen: player.灵根
                };
            })
        );

        // 4. 过滤掉洗根次数为0的玩家
        const filteredPlayers = players.filter(p => p.washCount > 0);
        


        // 5. 按洗根次数降序排序
        filteredPlayers.sort((a, b) => b.washCount - a.washCount);

        // 6. 获取当前用户排名（只考虑有洗根次数的玩家）
        const userWashCount = players.find(p => p.qq === usr_qq)?.washCount || 0;
        const usr_paiming = userWashCount > 0 ? 
            filteredPlayers.findIndex(p => p.qq === usr_qq) + 1 : 
            filteredPlayers.length + 1; // 如果用户洗根次数为0，则排在最后

        // 7. 仅取前20名（避免逻辑矛盾）
        const topPlayers = filteredPlayers.slice(0, 20).map((p, index) => ({
            ...p,
            rank: index + 1
        }));

        // 8. 构造渲染数据
        const renderData = {
            currentPlayer: { 
                qq: usr_qq, 
                rank: usr_paiming,
                washCount: userWashCount
            },
            topPlayers: topPlayers,
            totalPlayers: filteredPlayers.length // 有洗根次数的玩家总数
        };

        // 9. 生成截图
        const templateData = await new Show(e).get_xigenData(renderData);
        return await puppeteer.screenshot('xigen', templateData);
    } catch (error) {
        console.error("洗根榜生成失败:", error);
        return null;
    }
}
export async function get_duihuan_img(e) {
    // 用户ID处理
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 验证玩家是否存在
    if (!data.existData('player', usr_qq)) return;
    
    // 获取玩家数据和兑换列表
    const player = await data.getData('player', usr_qq);
    const giftPacks = data.duihuan; // 从数据源获取兑换列表
    
    // 准备渲染数据
    const renderData = {
        user_id: usr_qq,
        nickname: player.名号 || '道友',
        giftPacks: giftPacks,
        currency: {
            points: player.积分 || 0,
            tokens: player.代币 || 0
        }
    };
    
    // 获取渲染数据并生成截图
    const templateData = await new Show(e).get_duihuanData(renderData);
    return await puppeteer.screenshot('duihuan', templateData);
}
export async function get_wmtj_img(e) {
    // 用户ID处理
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 验证玩家是否存在
    if (!data.existData('player', usr_qq)) return;
    
    // 获取玩家数据和位面天骄列表
    const player = await data.getData('player', usr_qq);
    const tianjiaoItems = data.weimiantianjiao_list;
    
    // 格式化天骄数据中的大数字
    const formattedTianjiaoItems = tianjiaoItems.map(tianjiao => {
        return {
            ...tianjiao,
            攻击: bigNumberTransform(tianjiao.攻击),
            防御: bigNumberTransform(tianjiao.防御),
            血量: bigNumberTransform(tianjiao.血量),
            血量上限: bigNumberTransform(tianjiao.血量上限)
        };
    });
    
    // 准备渲染数据
    const renderData = {
        user_id: usr_qq,
        nickname: player.名号 || "未知修士",
        tianjiaoItems: formattedTianjiaoItems,
        totalCount: tianjiaoItems.length
    };
    
    // 获取渲染数据并生成截图
    const templateData = await new Show(e).get_wmtjData(renderData);
    return await puppeteer.screenshot('wmtj', templateData);
}
export async function get_character_img(e) {
    try {
        // 1. 获取玩家数据
        let usr_qq = e.user_id.toString().replace('qg_','');
        usr_qq = await channel(usr_qq);
        
        // 验证玩家是否存在
        if (!data.existData('player', usr_qq)) return;
        
        const player = await data.getData('player', usr_qq);
        
        // 2. 获取剧情人物数据
        const characters = data.juqingrenwu_list;
        
        // 3. 获取玩家已解锁的剧情人物
        const unlockedCharacters = player.剧情人物 || [];
        const unlockedMap = {};
        
        // 创建已解锁人物的映射
        unlockedCharacters.forEach(char => {
            // 获取人物标识（如"柳神"）
            const charKey = Object.keys(char).find(key => 
                key !== "关系" && key !== "好感度" && key !== "解锁时间" && key !== "事件记录"
            );
            
            if (charKey) {
                unlockedMap[charKey] = {
                    关系: char.关系,
                    好感度: char.好感度
                };
            }
        });
        
        // 4. 按位面对人物进行分类，并标记解锁状态
        const realms = {};
        characters.forEach(character => {
            // 处理位面信息 - 可能包含多个位面
            const characterRealms = character.位面.split('/');
            
            // 检查是否已解锁
            const isUnlocked = !!unlockedMap[character.名号];
            const relationInfo = isUnlocked ? unlockedMap[character.名号] : null;
            
            characterRealms.forEach(realm => {
                if (!realms[realm]) {
                    realms[realm] = [];
                }
                
                // 添加解锁状态和关系信息
                realms[realm].push({
                    ...character,
                    已解锁: isUnlocked,
                    关系: relationInfo ? relationInfo.关系 : 0,
                    好感度: relationInfo ? relationInfo.好感度 : 0
                });
            });
        });
        
        // 转换为数组格式用于模板渲染
        const realmArray = Object.entries(realms).map(([name, characters]) => ({
            name,
            characters
        }));
        
        // 5. 计算解锁进度
        const unlockedCount = Object.keys(unlockedMap).length;
        const totalCharacters = characters.length;
        
        // 6. 构建模板数据
        const templateData = {
            realms: realmArray,
            totalCharacters,
            unlockedCount,
            progressPercentage: totalCharacters > 0 ? Math.round((unlockedCount / totalCharacters) * 100) : 0
        };
        
        // 7. 获取模板数据并生成截图
        const renderData = await new Show(e).get_characterData(templateData);
        return await puppeteer.screenshot('character', renderData);
        
    } catch (err) {
        console.error('生成人物图鉴失败:', err);
        return `生成人物图鉴失败: ${err.message}`;
    }
}
export async function get_power_img(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let player = await data.getData('player', usr_qq);
    let lingshi = Math.trunc(player.灵石);
    if (player.灵石 > 999999999999) {
        lingshi = 999999999999;
    }
    data.setData('player', usr_qq, player);
    await player_efficiency(usr_qq);
    
    if (!isNotNull(player.level_id)) {
        e.reply('请先#同步信息');
        return;
    }
    
    let this_association;
    if (!isNotNull(player.宗门)) {
        this_association = {
            宗门名称: '无',
            职位: '无',
        };
    } else {
        this_association = player.宗门;
    }
    
    // 境界名字需要查找境界名
    let levelMax = data.LevelMax_list.find(
        item => item.level_id == player.Physique_id
    ).level;
    let need_xueqi = data.LevelMax_list.find(
        item => item.level_id == player.Physique_id
    ).exp;
    
    // 功法层级分类
    const gongfaHierarchy = {
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
        "天帝经": 3.5 // 新增层级，高于仙帝法
    };
    
    // 获取所有功法数据
    const allGongfa = await data.gongfa_list;
    
    // 加载限定功法列表
    const timegongfa_list = await data.timegongfa_list;
    
    // 初始化分类对象
    const categorizedGongfa = {};
    
    // 初始化分类
    for (const category in gongfaHierarchy) {
        categorizedGongfa[category] = [];
    }
    
    // 添加"未知"分类
    categorizedGongfa["未知"] = [];
    
    // 获取玩家自创帝经列表
    const customSutras = await data.dijingList; // 假设 data.dijingList 是玩家自创帝经列表
    
    // 遍历玩家已学习的功法
    if (player.学习的功法 && player.学习的功法.length > 0) {
        for (const gongfaName of player.学习的功法) {
            // 首先检查是否为玩家自创帝经
            const isCustomSutra = customSutras.some(item => item.name === gongfaName);
            
            if (isCustomSutra) {
                // 玩家自创帝经归入"玩家自创帝经"类别
                categorizedGongfa["天帝经"].push(gongfaName);
                continue; // 跳过后续检查
            }
            
            // 检查是否为限定功法
            const isTimeLimited = timegongfa_list.some(item => item.name === gongfaName);
            
            if (isTimeLimited) {
                // 限定功法直接归入"限定功法"类别
                categorizedGongfa["限定功法"].push(gongfaName);
                continue; // 跳过后续检查
            }
            
            // 在全局功法数据中查找匹配的功法
            const gongfa = allGongfa.find(item => item.name === gongfaName);
            
            if (gongfa && gongfa.type) {
                // 检查功法类型是否在层级映射中
                if (gongfaHierarchy.hasOwnProperty(gongfa.type)) {
                    categorizedGongfa[gongfa.type].push(gongfaName);
                } else {
                    categorizedGongfa["未知"].push(gongfaName);
                }
            } else {
                categorizedGongfa["未知"].push(gongfaName);
            }
        }
    }
    
    // 构建玩家数据
    let playercopy = {
        user_id: usr_qq,
        nickname: player.名号,
        need_xueqi: need_xueqi,
        xueqi: player.血气,
        levelMax: levelMax,
        lingshi: lingshi,
        镇妖塔层数: player.镇妖塔层数,
        神魄段数: player.神魄段数,
        hgd: player.favorability,
        player_maxHP: player.血量上限,
        player_nowHP: player.当前血量,
        learned_gongfa: player.学习的功法,
        categorized_gongfa: categorizedGongfa, // 使用正确的属性名
        timegongfa_list: timegongfa_list,
        association: this_association,
        dijingList:customSutras
    };
    
    const data1 = await new Show(e).get_playercopyData(playercopy);
    return await puppeteer.screenshot('playercopy', {
        ...data1,
    });
}
// 新建 utils.js
export function getPinjiName(index) {
  return ['劣','普','优','精','极','绝'][index] || '未知';
}
/**
 * 返回该玩家的存档图片
 * @return image
 */
export async function get_player_img(e) {
  let 法宝评级;
  let 护具评级;
  let 武器评级;
  let 帝兵评级;
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let equipment = await data.getData('equipment', usr_qq);
  let player_status = await getPlayerAction(usr_qq);
  let status = '空闲';
  if (player_status.time != null) {
    status = player_status.action + '(剩余时间:' + player_status.time + ')';
  }
  let lingshi = Math.trunc(player.灵石);
  // if (player.灵石 > 999999999999) {
  //   lingshi = 999999999999;
  // }
  if (player.宣言 == null || player.宣言 == undefined) {
    player.宣言 = '这个人很懒什么都没写';
  }
  if (player.灵根 == null || player.灵根 == undefined) {
    player.灵根 = await get_random_talent();
  }
  if (player.天资等级 == null || player.天资等级 == undefined) {
    player.天资等级 = await  get_random_aptitude();
  }
  data.setData('player', usr_qq, player);
  await player_efficiency(usr_qq); // 注意这里刷新了修炼效率提升
  if ((await player.linggenshow) != 0) {
    player.灵根.type = '无';
    player.灵根.name = '未知';
    player.灵根.法球倍率 = '0';
    player.修炼效率提升 = '0';
  }
  if (!isNotNull(player.level_id)) {
    e.reply('请先#一键同步');
    return;
  }
  if (!isNotNull(player.sex)) {
    e.reply('请先#一键同步');
    return;
  }
  let nd = '无';
  if (player.隐藏灵根) nd = player.隐藏灵根.name;
  let zd = ['攻击', '防御', '生命加成', '防御加成', '攻击加成'];
  let num = [];
  let p = [];
  let kxjs = [];
  let count = 0;
  for (let j of zd) {
    if (player[j] == 0) {
      p[count] = '';
      kxjs[count] = 0;
      count++;
      continue;
    }
    p[count] = Math.floor(Math.log(player[j]) / Math.LN10);
    num[count] = player[j] * 10 ** -p[count];
    kxjs[count] = `${num[count].toFixed(2)} x 10`;
    count++;
  }
  let 元神状态 = "尚未凝练";
  let 元神等级名称 = "无";
  
  // 检查元神等级是否已凝练
  if (player.yuanshenlevel_id === undefined || player.yuanshenlevel_id === null) {
      元神状态 = "未凝练";
  } else {
      // 查找元神等级数据
      const 元神等级数据 = data.Levelyuanshen_list.find(
          item => item.level_id == player.yuanshenlevel_id
      );
      
      // 检查是否找到对应等级
      if (!元神等级数据) {
          元神状态 = "数据异常";
      } else {
          元神等级名称 = 元神等级数据.level;
          元神状态 = "已凝练";
      }
  }

  // 确保元神数值存在
  player.元神 = player.元神 || 0;
  player.元神上限 = player.元神上限 || 0;
  player.神识 = bigNumberTransform(player.神识) || 0;

  //境界名字需要查找境界名
  let level = data.Level_list.find(
    item => item.level_id == player.level_id
  ).level;
  let power =
    (player.攻击 * 0.9 +
      player.防御 * 1.1 +
      player.血量上限 * 0.6 +
      player.暴击率 * player.攻击 * 0.5 +
      player.灵根.法球倍率 * player.攻击) /
    10000;
  power = Number(power);
  power = power.toFixed(2);
  let power2 =
    (player.攻击 + player.防御 * 1.1 + player.血量上限 * 0.5) / 10000;
  power2 = Number(power2);
  power2 = power2.toFixed(2);
  let level2 = data.LevelMax_list.find(
    item => item.level_id == player.Physique_id
  ).level;
  let need_exp = bigNumberTransform(data.Level_list.find(
    item => item.level_id == player.level_id
  ).exp);
  let need_exp2 = data.LevelMax_list.find(
    item => item.level_id == player.Physique_id
  ).exp;
  let wudi2 = data.LevelMax_list.find(
    item => item.level_id == player.Physique_id
  ).exp;
  let occupation = player.occupation;
  let occupation_level;
  let occupation_level_name;
  let occupation_exp;
  let occupation_need_exp;
  if (!isNotNull(player.occupation)) {
    occupation = '无';
    occupation_level_name = '-';
    occupation_exp = '-';
    occupation_need_exp = '-';
  } else {
    occupation_level = player.occupation_level;
    occupation_level_name = data.occupation_exp_list.find(
      item => item.id == occupation_level
    ).name;
    occupation_exp = player.occupation_exp;
    occupation_need_exp = data.occupation_exp_list.find(
      item => item.id == occupation_level
    ).experience;
  }
  let this_association;
  if (!isNotNull(player.宗门)) {
    this_association = {
      宗门名称: '无',
      职位: '无',
    };
  } else {
    this_association = player.宗门;
  }
  let pinji = ['劣', '普', '优', '精', '极', '绝', '顶'];
  if (!isNotNull(equipment.武器.pinji)) {
    武器评级 = '无';
  } else {
    武器评级 = pinji[equipment.武器.pinji];
  }
  if (!isNotNull(equipment.护具.pinji)) {
    护具评级 = '无';
  } else {
    护具评级 = pinji[equipment.护具.pinji];
  }
  if (!isNotNull(equipment.法宝.pinji)) {
    法宝评级 = '无';
  } else {
    法宝评级 = pinji[equipment.法宝.pinji];
  }
  if (!isNotNull(equipment.帝兵.pinji)) {
    帝兵评级 = '无';
  } else {
    帝兵评级 = pinji[equipment.帝兵.pinji];
  }
  let rank_lianqi = (data.Level_list.find(
    item => item.level_id == player.level_id
  ).level);
  let expmax_lianqi = bigNumberTransform(
  data.Level_list.find(item => item.level_id == player.level_id).exp
  );
   let wudi = 
  data.Level_list.find(item => item.level_id == player.level_id).exp
  ;
  let rank_llianti = data.LevelMax_list.find(
    item => item.level_id == player.Physique_id
  ).level;
   let rank_xiuliantixi = data.Levelmijing_list.find(
    item => item.level_id == player.mijinglevel_id
  ).level;
     let rank_xiangujinshi = data.xiangujinshi_list.find(
    item => item.level_id == player.xiangulevel_id
  ).level;
    let 极境名称 = data.xiangujinshi_list.find(
    item => item.level_id == player.xiangulevel_id
  ).极境名称;
let 元神等级数据 = data.Levelyuanshen_list.find(
          item => item.level_id == player.yuanshenlevel_id
      );
  let expmax_llianti = bigNumberTransform(need_exp2);
  let rank_liandan = occupation_level_name;
  let expmax_liandan = occupation_need_exp;
  let strand_hp = Strand(player.当前血量, player.血量上限);
  let strand_lianqi = Strand(player.修为, wudi);
  let strand_llianti = Strand(player.血气, wudi2);
  let strand_liandan = Strand(occupation_exp, expmax_liandan);
  let Power = GetPower(
    player.攻击,
    player.防御,
    player.血量上限,
    player.暴击率
  );
  let PowerMini = bigNumberTransform(Power);
  lingshi = bigNumberTransform(lingshi);
 // 修为转换（显示用）
 let shengming = bigNumberTransform(player.当前血量);
 let shengming2 = bigNumberTransform(player.血量上限);
const exp = bigNumberTransform(player.修为);
// 血气转换（显示用）
const exp2 = bigNumberTransform(player.血气);

  let hunyin = '未知';
  let A = usr_qq;
  let qinmidu;
  try {
    qinmidu = await Read_qinmidu();
  } catch {
    //没有建立一个
    await Write_qinmidu([]);
    qinmidu = await Read_qinmidu();
  }
  for (let i = 0; i < qinmidu.length; i++) {
    if (qinmidu[i].QQ_A == A || qinmidu[i].QQ_B == A) {
      if (qinmidu[i].婚姻 > 0) {
        if (qinmidu[i].QQ_A == A) {
          let B = await Read_player(qinmidu[i].QQ_B);
          hunyin = B.名号;
        } else {
          let A = await Read_player(qinmidu[i].QQ_A);
          hunyin = A.名号;
        }
        break;
      }
    }
  }
  let action = player.练气皮肤;

  if(usr_qq==3413211040){action="A"}
  if(usr_qq==3196383818){action="DD"}
  var i = usr_qq;
  var l=0;
      while(i >= 1){
      i=i/10;
      l++;
  }

  let type=[
    "武器",
    "法宝",
    '护具'
  ]
  let equipment_wuqi_1=false
  let equipment_wuqi_2=false
  let equipment_wuqi_3=false

  let equipment_fabao_1=false
  let equipment_fabao_2=false
  let equipment_fabao_3=false

  let equipment_huju_1=false
  let equipment_huju_2=false
  let equipment_huju_3=false

  
  for(let m=0;m<type.length;m++){



      if(type[m]=="武器"){
        if(!equipment[type[m]].hasOwnProperty('宝石位')){
          equipment[type[m]]["宝石位"]={
              "宝石位1": "无",
              "宝石位2": "无",
              "宝石位3": "无",
            }
            await Write_equipment(usr_qq,equipment)
        }

        if(equipment[type[m]]["宝石位"].宝石位1!="无"){
          equipment_wuqi_1=true
        }
        if(equipment[type[m]]["宝石位"].宝石位2!="无"){
          equipment_wuqi_2=true
        }
        if(equipment[type[m]]["宝石位"].宝石位3!="无"){
          equipment_wuqi_3=true
        }
      
      }

      if(type[m]=="法宝"){
        if(!equipment[type[m]].hasOwnProperty('宝石位')){
          equipment[type[m]]["宝石位"]={
              "宝石位1": "无",
              "宝石位2": "无",
              "宝石位3": "无",
            }
            await Write_equipment(usr_qq,equipment)
        }
        if(equipment[type[m]]["宝石位"].宝石位1!="无"){
          equipment_fabao_1=true
        }
        if(equipment[type[m]]["宝石位"].宝石位2!="无"){
          equipment_fabao_2=true
        }
        if(equipment[type[m]]["宝石位"].宝石位3!="无"){
          equipment_fabao_3=true
        }
      
      }


      if(type[m]=="护具"){
        if(!equipment[type[m]].hasOwnProperty('宝石位')){
          equipment[type[m]]["宝石位"]={
              "宝石位1": "无",
              "宝石位2": "无",
              "宝石位3": "无",
            }
            await Write_equipment(usr_qq,equipment)
        }
        if(equipment[type[m]]["宝石位"].宝石位1!="无"){
          equipment_huju_1=true
        }
        if(equipment[type[m]]["宝石位"].宝石位2!="无"){
          equipment_huju_2=true
        }
        if(equipment[type[m]]["宝石位"].宝石位3!="无"){
          equipment_huju_3=true
        }
      
      }

    
  }
  let bao = parseInt(player.暴击率 * 100) + '%';
  equipment.武器.bao = parseInt(equipment.武器.bao * 100) + '%';
  equipment.护具.bao = parseInt(equipment.护具.bao * 100) + '%';
  equipment.法宝.bao = parseInt(equipment.法宝.bao * 100) + '%';
  equipment.帝兵.bao = parseInt(equipment.帝兵.bao * 100) + '%';
  if(l<11){

  
  let player_data = {
    equipment_wuqi_1:equipment_wuqi_1,
    equipment_wuqi_2:equipment_wuqi_2,
    equipment_wuqi_3:equipment_wuqi_3,
   yuanshen: player.元神,
    yuanshen_max: player.元神上限,
    yuanshen_level: 元神等级名称,
    yuanshen_status: 元神状态,
    shensi: player.神识,
    
    // 元神进度条数据
    strand_yuanshen: {
      style: `width: ${(player.元神/player.元神上限)*100}%`,
      num: ((player.元神/player.元神上限)*100).toFixed(1)
    },
    equipment_fabao_1:equipment_fabao_1,
    equipment_fabao_2:equipment_fabao_2,
    equipment_fabao_3:equipment_fabao_3,
  
    equipment_huju_1:equipment_huju_1,
    equipment_huju_2:equipment_huju_2,
    equipment_huju_3:equipment_huju_3,
    neidan: nd,
    pifu: action,
    user_id: usr_qq,
    player, // 玩家数据
    rank_lianqi, // 练气境界
    expmax_lianqi, // 练气需求经验
    rank_llianti, // 炼体境界
    expmax_llianti, // 炼体需求经验
    rank_xiuliantixi,
    rank_xiangujinshi,
    极境名称,
    元神等级数据,
    rank_liandan, // 炼丹境界
    expmax_liandan, // 炼丹需求经验
    equipment, // 装备数据
    talent: parseInt(player.修炼效率提升 * 100), //
    player_action: status, // 当前状态
    this_association, // 宗门信息
    strand_hp,
    strand_lianqi,
    strand_llianti,
    strand_liandan,
    PowerMini, // 玩家战力
    bao,
    nickname: player.名号,
    linggen: player.灵根, //
    declaration: player.宣言,
    need_exp: need_exp,
    need_exp2: need_exp2,
    shengming,
    shengming2,
    exp,
    exp2,
    zdl: power,
    镇妖塔层数: player.镇妖塔层数,
    sh: player.神魄段数,
    mdz: player.魔道值,
    hgd: player.favorability,
    jczdl: power2,
    level: level,
    level2: level2,
    lingshi: lingshi,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    player_atk: kxjs[0],
    player_atk2: p[0],
    player_def: kxjs[1],
    player_def2: p[1],
    生命加成: kxjs[2],
    生命加成_t: p[2],
    防御加成: kxjs[3],
    防御加成_t: p[3],
    攻击加成: kxjs[4],
    攻击加成_t: p[4],
    player_bao: player.暴击率,
    player_bao2: player.暴击伤害,
    occupation: occupation,
    occupation_level: occupation_level_name,
    occupation_exp: occupation_exp,
    occupation_need_exp: occupation_need_exp,
    arms: equipment.武器,
    armor: equipment.护具,
    treasure: equipment.法宝,
    association: this_association,
    learned_gongfa: player.学习的功法,
    婚姻状况: hunyin,
    武器评级: 武器评级,
    护具评级: 护具评级,
    法宝评级: 法宝评级,
    帝兵评级: 帝兵评级,
  };
  const data1 = await new Show(e).get_playerData(player_data);
  return await puppeteer.screenshot('player', {
    ...data1,
  });
  }else{

    let player_data = {
      equipment_wuqi_1:equipment_wuqi_1,
      equipment_wuqi_2:equipment_wuqi_2,
      equipment_wuqi_3:equipment_wuqi_3,
    
      equipment_fabao_1:equipment_fabao_1,
      equipment_fabao_2:equipment_fabao_2,
      equipment_fabao_3:equipment_fabao_3,
    
      equipment_huju_1:equipment_huju_1,
      equipment_huju_2:equipment_huju_2,
      equipment_huju_3:equipment_huju_3,
      touxian:e.user.avatar,
      neidan: nd,
      pifu: action,
      user_id: usr_qq,
       yuanshen: player.元神,
    yuanshen_max: player.元神上限,
    yuanshen_level: 元神等级名称,
    yuanshen_status: 元神状态,
    shensi: player.神识,
    
    // 元神进度条数据
    strand_yuanshen: {
      style: `width: ${(player.元神/player.元神上限)*100}%`,
      num: ((player.元神/player.元神上限)*100).toFixed(1)
    },
      player, // 玩家数据
      rank_lianqi, // 练气境界
      expmax_lianqi, // 练气需求经验
      rank_llianti, // 炼体境界
      expmax_llianti, // 炼体需求经验
      rank_xiuliantixi,
      rank_xiangujinshi,
      极境名称,
      元神等级数据,
      rank_liandan, // 炼丹境界
      expmax_liandan, // 炼丹需求经验
      equipment, // 装备数据
      talent: parseInt(player.修炼效率提升 * 100), //
      player_action: status, // 当前状态
      this_association, // 宗门信息
      strand_hp,
      strand_lianqi,
      strand_llianti,
      strand_liandan,
      PowerMini, // 玩家战力
      bao,
      nickname: player.名号,
      linggen: player.灵根, //
      declaration: player.宣言,
      need_exp: need_exp,
      need_exp2: need_exp2,
      exp,
      exp2,
      zdl: power,
      镇妖塔层数: player.镇妖塔层数,
      sh: player.神魄段数,
      mdz: player.魔道值,
      hgd: player.favorability,
      jczdl: power2,
      level: level,
      level2: level2,
      lingshi: lingshi,
      player_maxHP: player.血量上限,
      player_nowHP: player.当前血量,
      player_atk: kxjs[0],
      player_atk2: p[0],
      player_def: kxjs[1],
      player_def2: p[1],
      生命加成: kxjs[2],
      生命加成_t: p[2],
      防御加成: kxjs[3],
      防御加成_t: p[3],
      攻击加成: kxjs[4],
      攻击加成_t: p[4],
      player_bao: player.暴击率,
      player_bao2: player.暴击伤害,
      occupation: occupation,
      occupation_level: occupation_level_name,
      occupation_exp: occupation_exp,
      occupation_need_exp: occupation_need_exp,
      arms: equipment.武器,
      armor: equipment.护具,
      treasure: equipment.法宝,
      association: this_association,
      learned_gongfa: player.学习的功法,
      婚姻状况: hunyin,
      武器评级: 武器评级,
      护具评级: 护具评级,
      法宝评级: 法宝评级,
      帝兵评级: 帝兵评级,
    };
    const data1 = await new Show(e).get_player_pindao_Data(player_data);
    return await puppeteer.screenshot('player_pindao', {
      ...data1,
    });
  } 
}
//返回战斗
export async function get_fight_img(e,data) {
  let get_data={fightmsg: data}
  const data1 = await new Show(e).get_fightData(get_data);
  return await puppeteer.screenshot('fight', {
    ...data1,
  });
}
/**
 * 我的宗门
 * @return image
 */
export async function get_association_img(e) {
  let item;
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  //无存档
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  //门派
  let player = data.getData('player', usr_qq);
  if (!isNotNull(player.宗门)) {
    return;
  }
  //境界
  //let now_level_id;
  if (!isNotNull(player.level_id)) {
    e.reply('请先#同步信息');
    return;
  }
  //有加入宗门
  let ass = data.getAssociation(player.宗门.宗门名称);
  //寻找
  let mainqq = await data.getData('player', ass.宗主);
  //仙宗
  let xian = ass.power;
  let weizhi;
  if (xian == 0) {
    weizhi = '凡界';
  } else {
    weizhi = '仙界';
  }
  //门槛
  let level = data.Level_list.find(
    item => item.level_id === ass.最低加入境界
  ).level;
  // 副宗主
  let fuzong = [];
  for (item in ass.副宗主) {
    fuzong[item] =
      '道号：' +
      data.getData('player', ass.副宗主[item]).名号 +
      'QQ：' +
      ass.副宗主[item];
  }
  //长老
  const zhanglao = [];
  for (item in ass.长老) {
    zhanglao[item] =
      '道号：' +
      data.getData('player', ass.长老[item]).名号 +
      'QQ：' +
      ass.长老[item];
  }
  //内门弟子
  const neimen = [];
  for (item in ass.内门弟子) {
    neimen[item] =
      '道号：' +
      data.getData('player', ass.内门弟子[item]).名号 +
      'QQ：' +
      ass.内门弟子[item];
  }
  //外门弟子
  const waimen = [];
  for (item in ass.外门弟子) {
    waimen[item] =
      '道号：' +
      data.getData('player', ass.外门弟子[item]).名号 +
      'QQ：' +
      ass.外门弟子[item];
  }
  let state = '需要维护';
  let now = new Date();
  let nowTime = now.getTime(); //获取当前日期的时间戳
  if (ass.维护时间 > nowTime - 1000 * 60 * 60 * 24 * 7) {
    state = '不需要维护';
  }
  //计算修炼效率
  let xiulian;
  let dongTan = await data.bless_list.find(item => item.name == ass.宗门驻地);
  if (ass.宗门驻地 == 0) {
    xiulian = ass.宗门等级 * 0.05 * 100;
  } else {
    try {
      xiulian = ass.宗门等级 * 0.05 * 100 + dongTan.efficiency * 100;
    } catch {
      xiulian = ass.宗门等级 * 0.05 * 100 + 0.5;
    }
  }
  xiulian = Math.trunc(xiulian);
  if (ass.宗门神兽 == 0) {
    ass.宗门神兽 = '无';
  }
  let association_data = {
    user_id: usr_qq,
    ass: ass,
    mainname: mainqq.名号,
    mainqq: ass.宗主,
    xiulian: xiulian,
    weizhi: weizhi,
    level: level,
    mdz: player.魔道值,
    zhanglao: zhanglao,
    fuzong: fuzong,
    neimen: neimen,
    waimen: waimen,
    state: state,
  };
  const data1 = await new Show(e).get_associationData(association_data);
  return await puppeteer.screenshot('association', {
    ...data1,
  });
}
export async function get_baoshi_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq= await channel(usr_qq)
  let player = await data.getData('player', usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  const bao = Math.trunc(parseInt(player.暴击率 * 100));
  let equipment = await data.getData('equipment', usr_qq);
  let player_data = {
    user_id: usr_qq,
    mdz: player.魔道值,
    nickname: player.名号,
    arms: equipment.武器,
    armor: equipment.护具,
    treasure: equipment.法宝,
    player_atk: player.攻击,
    player_def: player.防御,
    player_bao: bao,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    pifu: Number(player.装备皮肤),
  };
  const data1 = await new Show(e).get_equipmnetData3(player_data);
  return await puppeteer.screenshot('equipment3', {
    ...data1,
  });
}
/**
 * 返回该玩家的装备图片
 * @return image
 */
export async function get_equipment_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let player = await data.getData('player', usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  const bao = Math.trunc(parseInt(player.暴击率 * 100));
  let equipment = await data.getData('equipment', usr_qq);
  let player_data = {
    user_id: usr_qq,
    mdz: player.魔道值,
    nickname: player.名号,
    arms: equipment.武器,
    armor: equipment.护具,
    treasure: equipment.法宝,
    player_atk: player.攻击,
    player_def: player.防御,
    player_bao: bao,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    pifu: Number(player.装备皮肤),
  };
  const data1 = await new Show(e).get_equipmnetData(player_data);
  return await puppeteer.screenshot('equipment', {
    ...data1,
  });
}
// 新增函数：生成特定类别的纳戒图片
export async function get_najie_category_img(e, category) {
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  
  // 检查玩家是否存在
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  
  // 获取玩家和纳戒数据
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  
  // 数据处理
  const lingshi = Math.trunc(najie.灵石);
  const lingshi2 = Math.trunc(najie.灵石上限);
  let strand_hp = Strand(player.当前血量, player.血量上限);
  let strand_lingshi = Strand(najie.灵石, najie.灵石上限);
  
  // 获取指定类别的物品
  const categoryItems = najie[category] || {};
  
  // 构建玩家数据对象（只包含指定类别）
  let player_data = {
    user_id: usr_qq,
    player: player,
    // 添加纳戒基本信息供模板使用
    najie: {
      等级: najie.等级,
      灵石: lingshi,
      灵石上限: lingshi2
    },
    mdz: player.魔道值,
    nickname: player.名号,
    najie_lv: najie.等级,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    najie_maxlingshi: lingshi2,
    najie_lingshi: lingshi,
    strand_hp: strand_hp,
    strand_lingshi: strand_lingshi,
    pifu: player.纳戒皮肤,
    current_category: category,
  };
  
  // 根据类别设置对应的属性
  const categoryMap = {
    '装备': 'najie_装备',
    '丹药': 'najie_丹药', 
    '道具': 'najie_道具',
    '功法': 'najie_功法',
    '草药': 'najie_草药',
    '材料': 'najie_材料',
    '食材': 'najie_食材',
    '盒子': 'najie_盒子'
  };
  
  // 设置当前类别的物品数据
  const dataKey = categoryMap[category];
  if (dataKey) {
    player_data[dataKey] = categoryItems;
  }
  
  // 其他类别设为空数组
  Object.values(categoryMap).forEach(key => {
    if (player_data[key] === undefined) {
      player_data[key] = [];
    }
  });
  
  // 设置当前查看的类别
  player_data.current_category = category;
  
  // 生成并返回纳戒图片
  const data1 = await new Show(e).get_najie_category_Data(player_data);
  return await puppeteer.screenshot('najie-category', {
    ...data1,
  });
}


/**
 * 返回该玩家的纳戒图片
 * @return image
 */
export async function get_najie_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  const lingshi = Math.trunc(najie.灵石);
  const lingshi2 = Math.trunc(najie.灵石上限);
  let strand_hp = Strand(player.当前血量, player.血量上限);
  let strand_lingshi = Strand(najie.灵石, najie.灵石上限);
  let player_data = {
    user_id: usr_qq,
    player: player,
    najie: najie,
    mdz: player.魔道值,
    nickname: player.名号,
    najie_lv: najie.等级,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    najie_maxlingshi: lingshi2,
    najie_lingshi: lingshi,
    najie_equipment: najie.装备,
    najie_danyao: najie.丹药,
    najie_daoju: najie.道具,
    najie_gongfa: najie.功法,
    najie_caoyao: najie.草药,
    najie_cailiao: najie.材料,
    najie_shicai: najie.食材,
    najie_hezi: najie.盒子,
    strand_hp: strand_hp,
    strand_lingshi: strand_lingshi,
    pifu: player.纳戒皮肤,
  };
  const data1 = await new Show(e).get_najieData(player_data);
  return await puppeteer.screenshot('najie', {
    ...data1,
  });
}


/**
 * 返回该玩家的纳戒图片
 * @return image
 */
export async function get_najie_chouchou_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  const lingshi = Math.trunc(najie.灵石);
  const lingshi2 = Math.trunc(najie.灵石上限);
  let strand_hp = Strand(player.当前血量, player.血量上限);
  let strand_lingshi = Strand(najie.灵石, najie.灵石上限);

  // for(i in najie){
  //   for(var z=0;z<najie[i].length;z++){
  //     for(d in najie[i][z]){
  //       if(najie[i][z][d]==1){
  //         najie[i][z]
  //       }
  //     }
  //   }
  // }
  let wupin = [
    '装备',
    '丹药',
    '道具',
    '功法',
    '草药',
    '材料',
    '仙宠',
    '仙宠口粮',
  ];
  for (var i of wupin) {
    for (let l of najie[i]) {
      //纳戒中的数量
      if(l.islockd==1){
        console.log("执行1111111111111111111111111")
        let a=l.name
        let b=l.desc
        for(var z=0;z<najie[i].length;z++){
          if(najie[i][z].name==a && najie[i][z].desc==b){
            if(najie[i].length>1){
              najie[i].splice(z,1)
            }else{
              najie[i]=''

            }
            
          }
        }
      }
    }
  }


  let player_data = {
    user_id: usr_qq,
    player: player,
    najie: najie,
    mdz: player.魔道值,
    nickname: player.名号,
    najie_lv: najie.等级,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    najie_maxlingshi: lingshi2,
    najie_lingshi: lingshi,
    najie_equipment: najie.装备,
    najie_danyao: najie.丹药,
    najie_daoju: najie.道具,
    najie_gongfa: najie.功法,
    najie_caoyao: najie.草药,
    najie_cailiao: najie.材料,
    strand_hp: strand_hp,
    strand_lingshi: strand_lingshi,
    pifu: player.纳戒皮肤,
  };
  const data1 = await new Show(e).get_najie_chouchou_Data(player_data);
  return await puppeteer.screenshot('najie', {
    ...data1,
  });
}



/**
 * 返回境界列表图片
 * @return image
 */
export async function get_state_img(e, all_level) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let Level_id = player.level_id;
  let Level_list = data.Level_list;
  //循环删除表信息
  if (!all_level) {
    for (let i = 1; i <= 60; i++) {
      if (i > Level_id - 6 && i < Level_id + 6) {
        continue;
      }
      Level_list = await Level_list.filter(item => item.level_id != i);
    }
  }
  let state_data = {
    user_id: usr_qq,
    Level_list: Level_list,
  };
  const data1 = await new Show(e).get_stateData(state_data);
  return await puppeteer.screenshot('state', {
    ...data1,
  });
}

export async function get_statezhiye_img(e, all_level) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let Level_id = player.occupation_level;
  let Level_list = data.occupation_exp_list;
  //循环删除表信息
  if (!all_level) {
    for (let i = 0; i <= 60; i++) {
      if (i > Level_id - 6 && i < Level_id + 6) {
        continue;
      }
      Level_list = await Level_list.filter(item => item.id != i);
    }
  }
  let state_data = {
    user_id: usr_qq,
    Level_list: Level_list,
  };
  const data1 = await new Show(e).get_stateDatazhiye(state_data);
  return await puppeteer.screenshot('statezhiye', {
    ...data1,
  });
}

/**
 * 返回境界列表图片
 * @return image
 */
export async function get_statemax_img(e, all_level) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let Level_id = player.Physique_id;
  let LevelMax_list = data.LevelMax_list;
  //循环删除表信息
  if (!all_level) {
    for (let i = 1; i <= 60; i++) {
      if (i > Level_id - 6 && i < Level_id + 6) {
        continue;
      }
      LevelMax_list = await LevelMax_list.filter(item => item.level_id != i);
    }
  }
  let statemax_data = {
    user_id: usr_qq,
    LevelMax_list: LevelMax_list,
  };
  const data1 = await new Show(e).get_statemaxData(statemax_data);
  return await puppeteer.screenshot('statemax', {
    ...data1,
  });
}

/**
 * 返回秘境体系列表图片
 * @return image
 */
export async function get_mijing_img(e, all_level) {
    try {
        // 1. 用户ID处理（保持不变）
        let usr_qq = e.user_id.toString().replace('qg_', '');
        usr_qq = await channel(usr_qq);

        // 2. 检查玩家是否存在（保持不变）
        if (!data.existData('player', usr_qq)) return;
        let player = await data.getData('player', usr_qq);
        let Level_id = player.mijinglevel_id; // 玩家当前秘境等级

        // 3. 获取秘境列表（复制原列表，避免修改全局数据）
        let Levelmijing_list = [...data.Levelmijing_list]; 

        // 4. 核心修改：适配1-24级范围过滤
        if (!all_level) {
            // 计算有效范围：当前等级±5级，但不超出1-24边界
            const minLevel = Math.max(1, Level_id - 5); // 最小等级≥1
            const maxLevel = Math.min(24, Level_id + 5); // 最大等级≤24

            // 直接过滤保留范围内的秘境（替代原循环）
            Levelmijing_list = Levelmijing_list.filter(item => 
                item.level_id >= minLevel && item.level_id <= maxLevel
            );
        }

        // 5. 准备渲染数据（保持不变）
        let statemax_data = {
            user_id: usr_qq,
            Levelmijing_list: Levelmijing_list,
        };

        // 6. 生成截图（保持不变）
        const data1 = await new Show(e).get_mijingData(statemax_data);
        return await puppeteer.screenshot('mijing', { ...data1 });
    } catch (err) {
        console.error("生成秘境图片失败:", err);
        return "生成秘境图片失败，请稍后再试";
    }
}

/**
 * 返回仙古今世法列表图片
 * @return image
 */
export async function get_xiangujinshi_img(e, all_level) {
    try {
        // 1. 用户ID处理（保持不变）
        let usr_qq = e.user_id.toString().replace('qg_', '');
        usr_qq = await channel(usr_qq);

        // 2. 检查玩家是否存在（保持不变）
        if (!data.existData('player', usr_qq)) return;
        let player = await data.getData('player', usr_qq);
        let Level_id = player.xiangulevel_id; // 玩家当前秘境等级

        // 3. 获取秘境列表（复制原列表，避免修改全局数据）
        let xiangujinshi_list = [...data.xiangujinshi_list]; 

        // 4. 核心修改：适配1-24级范围过滤
        if (!all_level) {
            // 计算有效范围：当前等级±5级，但不超出1-24边界
            const minLevel = Math.max(1, Level_id - 5); // 最小等级≥1
            const maxLevel = Math.min(24, Level_id + 5); // 最大等级≤24

            // 直接过滤保留范围内的秘境（替代原循环）
            xiangujinshi_list = xiangujinshi_list.filter(item => 
                item.level_id >= minLevel && item.level_id <= maxLevel
            );
        }

        // 5. 准备渲染数据（保持不变）
        let statemax_data = {
            user_id: usr_qq,
            xiangujinshi_list: xiangujinshi_list,
        };

        // 6. 生成截图（保持不变）
        const data1 = await new Show(e).get_xiangujinshiData(statemax_data);
        return await puppeteer.screenshot('xiangujinshi', { ...data1 });
    } catch (err) {
        console.error("生成秘境图片失败:", err);
        return "生成秘境图片失败，请稍后再试";
    }
}

export async function get_talent_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let Level_id = player.Physique_id;
  let talent_list = data.talent_list;
  let talent_data = {
    user_id: usr_qq,
    talent_list: talent_list,
  };
  const data1 = await new Show(e).get_talentData(talent_data);
  return await puppeteer.screenshot('talent', {
    ...data1,
  });
}

/**
 * 返回修仙设置
 * @return image
 */
export async function get_adminset_img(e) {
  const cf =config.getConfig('xiuxian', 'xiuxian')
  let adminset = {
    //CD：分
    CDassociation: cf.CD.association,
    CDjoinassociation: cf.CD.joinassociation,
    CDassociationbattle: cf.CD.associationbattle,
    CDrob: cf.CD.rob,
    CDgambling: cf.CD.gambling,
    CDcouple: cf.CD.couple,
    CDgarden: cf.CD.garden,
    CDlevel_up: cf.CD.level_up,
    CDsecretplace: cf.CD.secretplace,
    CDtimeplace: cf.CD.timeplace,
    CDforbiddenarea: cf.CD.forbiddenarea,
    CDreborn: cf.CD.reborn,
    CDtransfer: cf.CD.transfer,
    CDhonbao: cf.CD.honbao,
    CDboss: cf.CD.boss,
    //手续费
    percentagecost: cf.percentage.cost,
    percentageMoneynumber: cf.percentage.Moneynumber,
    percentagepunishment: cf.percentage.punishment,
    //出千控制
    sizeMoney: cf.size.Money,
    //开关
    switchplay: cf.switch.play,
    switchMoneynumber: cf.switch.play,
    switchcouple: cf.switch.couple,
    switchXiuianplay_key: cf.switch.Xiuianplay_key,
    //倍率
    biguansize: cf.biguan.size,
    biguantime: cf.biguan.time,
    biguancycle: cf.biguan.cycle,
    //
    worksize: cf.work.size,
    worktime: cf.work.time,
    workcycle: cf.work.cycle,

    //出金倍率
    SecretPlaceone: cf.SecretPlace.one,
    SecretPlacetwo: cf.SecretPlace.two,
    SecretPlacethree: cf.SecretPlace.three,
  };
  const data1 = await new Show(e).get_adminsetData(adminset);
  return await puppeteer.screenshot('adminset', {
    ...data1,
  });
}

export async function get_ranking_power_img(e, Data, usr_paiming, thisplayer) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let level = data.Level_list.find(
    item => item.level_id == thisplayer.level_id
  ).level;
  let ranking_power_data = {
    user_id: usr_qq,
    mdz: thisplayer.魔道值,
    nickname: thisplayer.名号,
    exp: thisplayer.修为,
    level: level,
    usr_paiming: usr_paiming,
    allplayer: Data,
  };
  const data1 = await new Show(e).get_ranking_powerData(ranking_power_data);
  return await puppeteer.screenshot('ranking_power', {
    ...data1,
  });
}
export async function get_genius_img(
  e,
  rankings,
  userRank,
  userPower,
  thisplayer,
  title = "封神榜"  // 添加标题参数
) {
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  
  // 设置副标题逻辑
  let subtitle;
  if (title === "封神榜") {
    subtitle = "仙界战力排行榜";
  } else if (title === "人体秘境榜") {
    subtitle = "遮天战力排行榜";
  }else if (title === "仙古今世法榜") {
    subtitle = "完美世界战力排行榜";
  } else {
    subtitle = "凡人战力排行榜";
  }
  
  // 准备图片数据
  const genius_data = {
    title: title,  // 添加标题
    subtitle: subtitle, // 根据标题设置副标题
    user_id: usr_qq,
    nickname: thisplayer.名号,
    user_rank: userRank > 0 ? userRank : "未上榜",
    user_power: bigNumberTransform(userPower),
    user_level: data.Levelmijing_list.find(l => l.level_id === thisplayer.level_id)?.level || "未知境界",
    user_qq: usr_qq,
    rankings: rankings.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      power: bigNumberTransform(r.power),
      level: r.level,
      qq: r.qq
    })),
    epoch: thisplayer.epoch || 1
  };
  
  // 获取渲染数据
  const renderData = await new Show(e).get_geniusData(genius_data);
  
  // 生成图片
  return await puppeteer.screenshot('genius', {
    ...renderData,
  });
}
export async function get_ranking_money_img(
  e,
  Data,
  usr_paiming,
  thisplayer,
  thisnajie
) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  const najie_lingshi = Math.trunc(thisnajie.灵石);
  const lingshi = Math.trunc(thisplayer.灵石 + thisnajie.灵石);
  let ranking_money_data = {
    user_id: usr_qq,
    nickname: thisplayer.名号,
    lingshi: lingshi,
    najie_lingshi: najie_lingshi,
    usr_paiming: usr_paiming,
    allplayer: Data,
  };
  const data1 = await new Show(e).get_ranking_moneyData(ranking_money_data);
  return await puppeteer.screenshot('ranking_money', {
    ...data1,
  });
}
export async function fixed(usr_qq) {
  fs.copyFileSync(
    `${__PATH.auto_backup}/najie/${usr_qq}.json`,
    `${__PATH.najie_path}/${usr_qq}.json`
    `${__PATH.player_path}/${usr_qq}.json`
  );
  return;
}
/**
 * 返回柠檬堂
 * @return image
 */
export async function get_ningmenghome_img(e, thing_type) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let commodities_list = data.commodities_list;
  if (thing_type != '') {
    if (
      thing_type == '装备' ||
      thing_type == '丹药' ||
      thing_type == '功法' ||
      thing_type == '道具' ||
      thing_type == '草药'
    ) {
      commodities_list = commodities_list.filter(
        item => item.class == thing_type
      );
    } else if (
      thing_type == '武器' ||
      thing_type == '护具' ||
      thing_type == '法宝' ||
      thing_type == '修为' ||
      thing_type == '血量' ||
      thing_type == '血气' ||
      thing_type == '天赋'
    ) {
      commodities_list = commodities_list.filter(
        item => item.type == thing_type
      );
    }
  }
  let ningmenghome_data = {
    user_id: usr_qq,
    commodities_list: commodities_list,
  };
  const data1 = await new Show(e).get_ningmenghomeData(ningmenghome_data);
  let img = await puppeteer.screenshot('ningmenghome', {
    ...data1,
  });
  return img;
}
/**
 * 返回瑶池仙楼
 * @return image
 */
export async function get_yaochi_img(e, thing_type) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let yaochishangdian = data.yaochishangdian;
  if (thing_type != '') {
    if (
      thing_type == '装备' ||
      thing_type == '丹药' ||
      thing_type == '功法' ||
      thing_type == '道具' ||
      thing_type == '草药'||
      thing_type == '材料'
    ) {
      yaochishangdian = yaochishangdian.filter(
        item => item.class == thing_type
      );
    } else if (
      thing_type == '武器' ||
      thing_type == '护具' ||
      thing_type == '法宝' ||
      thing_type == '帝兵' ||
      thing_type == '修为' ||
      thing_type == '血量' ||
      thing_type == '血气' ||
      thing_type == '天赋'
    ) {
      yaochishangdian = yaochishangdian.filter(
        item => item.type == thing_type
      );
    }
  }
  let yaochi_data = {
    user_id: usr_qq,
    yaochishangdian: yaochishangdian,
  };
  const data1 = await new Show(e).get_yaochiData(yaochi_data);
  let img = await puppeteer.screenshot('yaochi', {
    ...data1,
  });
  return img;
}
/**
 * 返回摇光宝库
 * @return image
 */
export async function get_yaoguang_img(e, thing_type) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let yaoguangshangdian = data.yaoguangshangdian;
  if (thing_type != '') {
    if (
      thing_type == '装备' ||
      thing_type == '丹药' ||
      thing_type == '功法' ||
      thing_type == '道具' ||
      thing_type == '草药'||
      thing_type == '材料'
    ) {
      yaoguangshangdian = yaoguangshangdian.filter(
        item => item.class == thing_type
      );
    } else if (
      thing_type == '武器' ||
      thing_type == '护具' ||
      thing_type == '法宝' ||
      thing_type == '帝兵' ||
      thing_type == '修为' ||
      thing_type == '血量' ||
      thing_type == '血气' ||
      thing_type == '天赋'
    ) {
      yaoguangshangdian = yaoguangshangdian.filter(
        item => item.type == thing_type
      );
    }
  }
  let yaoguang_data = {
    user_id: usr_qq,
    yaoguangshangdian: yaoguangshangdian,
  };
  const data1 = await new Show(e).get_yaoguangData(yaoguang_data);
  let img = await puppeteer.screenshot('yaoguang', {
    ...data1,
  });
  return img;
}
/**
 * 返回瑶池仙楼
 * @return image
 */
export async function get_jianyunhai_img(e, thing_type) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let jianyunhaishangdian = data.jianyunhaishangdian;
  if (thing_type != '') {
    if (
      thing_type == '装备' ||
      thing_type == '丹药' ||
      thing_type == '功法' ||
      thing_type == '道具' ||
      thing_type == '草药'||
      thing_type == '材料'||
      thing_type == '盒子'
    ) {
      jianyunhaishangdian = jianyunhaishangdian.filter(
        item => item.class == thing_type
      );
    } else if (
      thing_type == '武器' ||
      thing_type == '护具' ||
      thing_type == '法宝' ||
      thing_type == '帝兵' ||
      thing_type == '修为' ||
      thing_type == '血量' ||
      thing_type == '血气' ||
      thing_type == '天赋'
    ) {
      jianyunhaishangdian = jianyunhaishangdian.filter(
        item => item.type == thing_type
      );
    }
  }
  let jianyunhai_data = {
    user_id: usr_qq,
    jianyunhaishangdian: jianyunhaishangdian,
  };
  const data1 = await new Show(e).get_jianyunhaiData(jianyunhai_data);
  let img = await puppeteer.screenshot('jianyunhai', {
    ...data1,
  });
  return img;
}
/**
 * 返回万宝楼
 * @return image
 */
export async function get_valuables_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let valuables_data = {
    user_id: usr_qq,
  };
  const data1 = await new Show(e).get_valuablesData(valuables_data);
  let img = await puppeteer.screenshot('valuables', {
    ...data1,
  });
  return img;
}
/**
 * @description: 进度条渲染
 * @param {Number} res 百分比小数
 * @return {*} css样式
 */
function Strand(now, max) {
  let num = ((now / max) * 100).toFixed(0);
  let mini;
  if (num > 100) {
    mini = 100;
  } else {
    mini = num;
  }
  let strand = {
    style: `style=width:${mini}%`,
    num: num,
  };
  return strand;
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

//读Boss表
export async function Read_Boss_List() {
  let dir = path.join(`${__PATH.Exchange}/Boss_list.json`);
  let Boss_list = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  Boss_list = JSON.parse(Boss_list);
  return Boss_list;
}

//写Boss表
export async function Write_Boss_List(wupin) {
  let dir = path.join(__PATH.Exchange, `Boss_list.json`);
  let new_ARR = JSON.stringify(wupin, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
  /**
   *从输入字符串中截取数字存入数组arr
   */
   export async function getNumversFromString(str) {
    var pattern = /\d+/g;//正则表达
    var matches = str.match(pattern);//匹配
    var arr = [];
    if (matches !== null) {
      for (var i = 0; i < matches.length; i++) {
        arr[i] = parseInt(matches[i], 10);
        //arr.push(parseInt(matches[i],10));
      }
    } else {
      arr[0] = 1;
      return arr;
    }
    return arr;
  }
/**
 * 计算战力
 */
export function GetPower(atk, def, hp, bao) {
  let power = (atk + def * 0.8 + hp * 0.6) * (bao + 1);
  power = Math.trunc(power);
  return power;
}
/**
 * 增加减少纳戒内物品
 * @param usr_qq 操作存档的qq号
 * @param thing_name  仙宠名称
 * @param n  操作的数量,取+增加,取 -减少
 * @param thing_level  仙宠等级
 * @returns 无
 */
export async function Add_仙宠(usr_qq, thing_name, n, thing_level = null) {
  var x = Number(n);
  if (x == 0) {
    return;
  }
  let najie = await Read_najie(usr_qq);
  let trr = najie.仙宠.find(
    item => item.name == thing_name && item.等级 == thing_level
  );
  var name = thing_name;
  if (x > 0 && !isNotNull(trr)) {
    //无中生有
    let newthing = data.xianchon.find(item => item.name == name);
    if (!isNotNull(newthing)) {
      console.log('没有这个东西');
      return;
    }
    if (thing_level != null) {
      newthing.等级 = thing_level;
    }
    najie.仙宠.push(newthing);
    najie.仙宠.find(
      item => item.name == name && item.等级 == newthing.等级
    ).数量 = x;
    let xianchon = najie.仙宠.find(
      item => item.name == name && item.等级 == newthing.等级
    );
    najie.仙宠.find(
      item => item.name == name && item.等级 == newthing.等级
    ).加成 = xianchon.等级 * xianchon.每级增加;
    najie.仙宠.find(
      item => item.name == name && item.等级 == newthing.等级
    ).islockd = 0;
    await Write_najie(usr_qq, najie);
    return;
  }
  najie.仙宠.find(item => item.name == name && item.等级 == trr.等级).数量 += x;
  if (
    najie.仙宠.find(item => item.name == name && item.等级 == trr.等级).数量 < 1
  ) {
    //假如用完了,需要删掉数组中的元素,用.filter()把!=该元素的过滤出来
    najie.仙宠 = najie.仙宠.filter(
      item => item.name != thing_name || item.等级 != trr.等级
    );
  }
  await Write_najie(usr_qq, najie);
  return;
}
export async function get_danfang_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }

  // 获取纳戒数据
  let najie;
  try {
    najie = await data.getData('najie', usr_qq);
  } catch (err) {
    console.error("读取纳戒数据失败：", err);
    e.reply("读取纳戒数据失败");
    return;
  }
  
  // 将纳戒物品展平为数组
  const najie_items = [];
  for (const category in najie) {
    if (Array.isArray(najie[category])) {
      najie[category].forEach(item => {
        najie_items.push({
          name: item.name,
          class: item.class,
          num: item.数量 || 0 
        });
      });
    }
  }

  let danfang_list = data.danfang_list;
  
  // 计算每个配方可制作的数量
  danfang_list = danfang_list.map(dan => {
    let max_craftable = Infinity;
    const materials_info = [];
    
    for (const material of dan.materials) {
      // 在纳戒中查找材料
      const item = najie_items.find(item =>
        item.name && material.name && 
        item.name.trim().toLowerCase() === material.name.trim().toLowerCase()
      );
      
      const have = item ? item.num : 0;
      const craftable = Math.floor(have / material.amount);
      max_craftable = Math.min(max_craftable, craftable);
      
      materials_info.push({
        name: material.name,
        amount: material.amount,
        have: have,
        enough: have >= material.amount
      });
    }
    
    return {
      ...dan,
      max_craftable: max_craftable === Infinity ? 0 : max_craftable,
      materials: materials_info
    };
  });

  let danfang_data = {
    user_id: usr_qq,
    danfang_list: danfang_list,
  };
  
  const data1 = await new Show(e).get_danfangData(danfang_data);
  let img = await puppeteer.screenshot('danfang', {
    ...data1,
  });
  return img;
}
export async function get_zhizuo_img(e) {
  const usr_qq = e.user_id.toString().replace('qg_', '');
  
  // 1. 玩家存在性检查
  if (!await existplayer(usr_qq)) {
    e.reply('玩家不存在，请先创建角色');
    return;
  }

  // 2. 读取玩家数据
  let player, najie;
  try {
    player = await Read_player(usr_qq);
    najie = await data.getData('najie', usr_qq);
  } catch (err) {
    console.error("数据读取失败:", err);
    e.reply("读取玩家数据失败");
    return;
  }

  // 3. 展平纳戒物品
  const najie_items = [];
  for (const category in najie) {
    if (Array.isArray(najie[category])) {
      najie[category].forEach(item => {
        najie_items.push({
          name: item.name?.trim().toLowerCase(),
          class: item.class,
          amount: item.数量 || 0
        });
      });
    }
  }

  // 4. 处理制作配方数据
  const zhizuo_list = data.zhizuo_list.map(recipe => {
    let max_craftable = Infinity;
    const materials_info = [];
    
    for (const material of recipe.materials) {
      const materialName = material.name?.trim().toLowerCase();
      const item = najie_items.find(i => i.name === materialName);
      
      const have = item ? item.amount : 0;
      const craftable = Math.floor(have / material.amount);
      max_craftable = Math.min(max_craftable, craftable);
      
      materials_info.push({
        name: material.name,
        class: material.class,
        amount: material.amount,
        have: have,
        enough: have >= material.amount
      });
    }
    
    return {
      ...recipe,
      max_craftable: max_craftable === Infinity ? 0 : max_craftable,
      materials: materials_info
    };
  });

  // 5. 调用Show类处理数据并生成图片
  try {
    const zhizuo_data = {
      user_id: usr_qq,
      zhizuo_list: zhizuo_list,
      player_level: player.level_id,
      timestamp: new Date().toLocaleString()
    };
    
     const data1 = await new Show(e).get_zhizuoData(zhizuo_data);
    const img = await puppeteer.screenshot('zhizuo', {
      ...data1, // 展开Show类处理后的数据
    });
    return img;
  } catch (err) {
    console.error("生成图片失败:", err);
    e.reply("生成制作列表失败，请稍后再试");
    throw err;
  }
}
export async function get_tuzhi_img(e, all_level) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }

  let tuzhi_list = data.tuzhi_list;

  let tuzhi_data = {
    user_id: usr_qq,
    tuzhi_list: tuzhi_list,
  };
  const data1 = await new Show(e).get_tuzhiData(tuzhi_data);
  let img = await puppeteer.screenshot('tuzhi', {
    ...data1,
  });
  return img;
}
//图开关
export async function setu(e) {
  e.reply(
    `玩命加载图片中,请稍后...   ` +
      '\n(一分钟后还没有出图片,大概率被夹了,这个功能谨慎使用,机器人容易寄)'
  );
  let url;
  //setu接口地址
  url = 'https://api.lolicon.app/setu/v2?proxy=i.pixiv.re&r18=0';
  let msg = [];
  let res;
  //
  try {
    let response = await fetch(url);
    res = await response.json();
  } catch (error) {
    console.log('Request Failed', error);
  }
  if (res !== '{}') {
    console.log('res不为空');
  } else {
    console.log('res为空');
  }
  let link = res.data[0].urls.original; //获取图链
  link = link.replace('pixiv.cat', 'pixiv.re'); //链接改为国内可访问的域名
  let pid = res.data[0].pid; //获取图片ID
  let uid = res.data[0].uid; //获取画师ID
  let title = res.data[0].title; //获取图片名称
  let author = res.data[0].author; //获取画师名称
  let px = res.data[0].width + '*' + res.data[0].height; //获取图片宽高
  msg.push(
    'User: ' +
      author +
      '\nUid: ' +
      uid +
      '\nTitle: ' +
      title +
      '\nPid: ' +
      pid +
      '\nPx: ' +
      px +
      '\nLink: ' +
      link
  );
  await sleep(1000);
  //最后回复消息
  e.reply(segment.image(link));
  //
  await ForwardMsg(e, msg);
  //返回true 阻挡消息不再往下
  return true;
}

//改变数据格式
export async function datachange(data) {
  if (data / 1000000000000 > 1) {
    return Math.floor((data * 100) / 1000000000000) / 100 + '万亿';
  } else if (data / 100000000 > 1) {
    return Math.floor((data * 100) / 100000000) / 100 + '亿';
  } else if (data / 10000 > 1) {
    return Math.floor((data * 100) / 10000) / 100 + '万';
  } else {
    return data;
  }
}
//写入纳戒信息,第二个参数是一个JavaScript对象
export async function Write_najie(usr_qq, najie) {
  let dir = path.join(__PATH.najie_path, `${usr_qq}.json`);
  let new_ARR = JSON.stringify(najie, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

//修为数量和灵石数量正增加,负减少
//使用时记得加await
export async function Add_灵石(usr_qq, 灵石数量 = 0) {
  let player = await Read_player(usr_qq);
  player.灵石 += Math.trunc(灵石数量);
  await Write_player(usr_qq, player);
  return;
}
export async function Add_源石(usr_qq, 源石数量 = 0) {
  let player = await Read_player(usr_qq);
  player.源石 += Math.trunc(源石数量);
  await Write_player(usr_qq, player);
  return;
}
export async function Add_修为(usr_qq, 修为数量 = 0) {
  let player = await Read_player(usr_qq);
  player.修为 += Math.trunc(修为数量);
  await Write_player(usr_qq, player);
  return;
}
export async function Add_练气(usr_qq, 数量 = 0) {
  const player = await Read_player(usr_qq);
  player.level_id = Math.max(0, player.level_id + Math.trunc(数量));
  await Write_player(usr_qq, player);
  return;
}

export async function Add_炼体(usr_qq, 数量 = 0) {
  const player = await Read_player(usr_qq);
  player.Physique_id = Math.max(0, player.Physique_id + Math.trunc(数量));
  await Write_player(usr_qq, player);
}
export async function Add_寿元(usr_qq, 寿元数量 = 0) {
  let player = await Read_player(usr_qq);
  player.寿元 += Math.trunc(寿元数量);
  await Write_player(usr_qq, player);
  return;
}
export async function Add_魔道值(usr_qq, 魔道值 = 0) {
  let player = await Read_player(usr_qq);
  player.魔道值 += Math.trunc(魔道值);
  await Write_player(usr_qq, player);
  return;
}
export async function Add_血气(usr_qq, 血气 = 0) {
  let player = await Read_player(usr_qq);
  player.血气 += Math.trunc(血气);
  await Write_player(usr_qq, player);
  return;
}


export async function Add_热量(usr_qq, 热量 = 0) {
    let player = await Read_player(usr_qq);
  if (!isNotNull(player.热量)) {
    player.热量 = Math.trunc(热量);
    await Write_player(usr_qq, player);
    return;
  }
  if (isNotNull(player.热量)) {
    player.热量 += Math.trunc(热量);
        await Write_player(usr_qq, player);
        return;
    }
}

export async function Add_饱食度(usr_qq, 饱食度 = 0) {
    let player = await Read_player(usr_qq);
  if (!isNotNull(player.饱食度)) {
    player.饱食度 = Math.trunc(饱食度);
    await Write_player(usr_qq, player);
    return;
  }
  if (isNotNull(player.饱食度)) {
    player.饱食度 += Math.trunc(饱食度);
        await Write_player(usr_qq, player);
        return;
    }
}



export async function Add_HP(usr_qq, blood = 0) {
  let player = await Read_player(usr_qq);
  player.当前血量 += Math.trunc(blood);
  if (player.当前血量 > player.血量上限) {
    player.当前血量 = player.血量上限;
  }
  if (player.当前血量 < 0) {
    player.当前血量 = 0;
  }
  await Write_player(usr_qq, player);
  return;
}
/**
 *
 * @param {*} usr_qq 用户qq
 * @param {*} exp 经验值
 * @returns
 */
export async function Add_职业经验(usr_qq, exp = 0) {
  let player = await Read_player(usr_qq);

  if (exp == 0) {
    return;
  }
  exp = player.occupation_exp + exp;
  let level = player.occupation_level;
  while (true) {
    if(level>36){
      break
    }
    let need_exp = data.occupation_exp_list.find(item => item.id == level).experience;

    if (need_exp > exp) {
      break;
    } else {
      exp -= need_exp;
      level++;
    }
  }
  player.occupation_exp = exp;
  player.occupation_level = level;
  await Write_player(usr_qq, player);
  return;
}

export async function Add_najie_灵石(usr_qq, lingshi) {
  let najie = await Read_najie(usr_qq);
  najie.灵石 += Math.trunc(lingshi);
  await Write_najie(usr_qq, najie);
  return;
}

export async function Add_player_学习功法(usr_qq, gongfa_name) {
  let player = await Read_player(usr_qq);
  player.学习的功法.push(gongfa_name);
  data.setData('player', usr_qq, player);
  await player_efficiency(usr_qq);
  return;
}
export async function Reduse_player_学习功法(usr_qq, gongfa_name) {
    let player = await Read_player(usr_qq);
    Array.prototype.remove = function (v) {
        for (let i = 0, j = 0; i < this.length; i++) {
            if (this[i] != v) {
                this[j++] = this[i];
            }
        }
        this.length -= 1;
    }
    player.学习的功法.remove(gongfa_name);
    data.setData("player", usr_qq, player);
    await player_efficiency(usr_qq);
    return;
}

//---------------------------------------------分界线------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//修炼效率综合
export async function player_efficiency(usr_qq) {
  //这里有问题
  let player = await data.getData('player', usr_qq); //修仙个人信息
  let ass;
  let Assoc_efficiency; //宗门效率加成
  let linggen_efficiency; //灵根效率加成
  let gongfa_efficiency = 0; //功法效率加成
  let xianchong_efficiency = 0; // 仙宠效率加成
  if (!isNotNull(player.宗门)) {
    //是否存在宗门信息
    Assoc_efficiency = 0; //不存在，宗门效率为0
  } else {
    ass = await data.getAssociation(player.宗门.宗门名称); //修仙对应宗门信息
    if (ass.宗门驻地 == 0) {
      Assoc_efficiency = ass.宗门等级 * 0.05;
    } else {
      let dongTan = await data.bless_list.find(
        item => item.name == ass.宗门驻地
      );
      try {
        Assoc_efficiency = ass.宗门等级 * 0.05 + dongTan.efficiency;
      } catch {
        Assoc_efficiency = ass.宗门等级 * 0.05 + 0.5;
      }
    }
  }
  linggen_efficiency = player.灵根.eff; //灵根修炼速率
  label1: for (let i in player.学习的功法) {
    //存在功法，遍历功法加成
    let gongfa = ['gongfa_list', 'timegongfa_list', 'dijingList'];
    //这里是查看了功法表
    for (let j of gongfa) {
      let ifexist = data[j].find(item => item.name == player.学习的功法[i]);
      if (ifexist) {
        gongfa_efficiency += ifexist.修炼加成;
        continue label1;
      }
    }
    player.学习的功法.splice(i, 1);
  }
  if (player.仙宠.type == '修炼') {
    // 是否存在修炼仙宠
    xianchong_efficiency = player.仙宠.加成; // 存在修炼仙宠，仙宠效率为仙宠效率加成
  }
  let dy = await Read_danyao(usr_qq);
  let bgdan = dy.biguanxl;
  if (parseInt(player.修炼效率提升) != parseInt(player.修炼效率提升)) {
    player.修炼效率提升 = 0;
  }

  player.修炼效率提升 =
    linggen_efficiency +
    Assoc_efficiency +
    gongfa_efficiency +
    xianchong_efficiency +
    bgdan; //修炼效率综合
  data.setData('player', usr_qq, player);
  return;
}
/**
 *
 * @param {*} usr_qq 玩家qq
 * @param {*} thing_name 物品名
 * @param {*} thing_class 物品类别
 * @param {*} thing_pinji 可选参数，装备品阶，数字0-6等
 * @returns 物品数量或者false
 */

//修改纳戒物品锁定状态
export async function re_najie_thing(
  usr_qq,
  thing_name,
  thing_class,
  thing_pinji,
  lock
) {
  let najie = await Read_najie(usr_qq);
  if (thing_class == '装备' && (thing_pinji || thing_pinji == 0)) {
    for (let i of najie['装备']) {
      if (i.name == thing_name && i.pinji == thing_pinji) i.islockd = lock;
    }
  } else {
    for (let i of najie[thing_class]) {
      if (i.name == thing_name) i.islockd = lock;
    }
  }
  await Write_najie(usr_qq, najie);
  return true;
}

//检查纳戒内物品是否存在
//判断物品
//要用await
export async function exist_najie_thing(
  usr_qq,
  thing_name,
  thing_class,
  thing_pinji
) {
  let najie = await Read_najie(usr_qq);
  let ifexist;
  if (thing_class == '装备' && (thing_pinji || thing_pinji == 0)) {
    ifexist = najie.装备.find(
      item => item.name == thing_name && item.pinji == thing_pinji
    );
  } else {
    let type = [
      '宝石',
      '装备',
      '丹药',
      '道具',
      '功法',
      '草药',
      '材料',
      '仙宠',
      '仙宠口粮',
      '食材',
      '盒子'
    ];

    
    for (let i of type) {
      if(!isNotNull(najie[i])){
        najie[i]=[]
        await Write_najie(usr_qq, najie)
      }
      ifexist = najie[i].find(item => item.name == thing_name);
      if (ifexist) break;
    }
  }
  if (ifexist) {
    return ifexist.数量;
  }
  return false;
}
/**
 *
 * @param {*} usr_qq 用户qq
 * @param {*} thing_name 物品名
 * @param {*} thing_class 物品类别
 * @param {*} thing_pinji 品级 数字0-6
 * @returns
 */

/**
 * 增加减少纳戒内物品
 * @param usr_qq 操作存档的qq号
 * @param name  物品名称
 * @param thing_class  物品类别
 * @param x  操作的数量,取+增加,取 -减少
 * @param pinji 品级 数字0-6
 * @returns 无
 */
export async function Add_najie_thing(usr_qq, name, thing_class, x, pinji) {

  if(x>0){
  let wupin= await foundthing(name)

  }
  if (x == 0) return;
  let najie = await Read_najie(usr_qq);
  //写入
  //这部分写得很冗余,但能跑
  if (thing_class == '装备') {
    if (!pinji && pinji != 0) {
      pinji = Math.trunc(Math.random() * 6);
    }
    let z = [0.8, 1, 1.1, 1.2, 1.3, 1.5, 2];
    if (x > 0) {
      if (typeof name != 'object') {
        let list = [
          'equipment_list',
          'dibing_list',
          'tszb_list',
          'timeequipmen_list',
          'duanzhaowuqi',
          'duanzhaohuju',
          'duanzhaobaowu',
          'namegive',
        ];
        for (let i of list) {
          let thing = data[i].find(item => item.name == name);
          if (thing) {
            let equ = JSON.parse(JSON.stringify(thing));
            equ.pinji = pinji;
            equ.atk *= z[pinji];
            equ.def *= z[pinji];
            equ.HP *= z[pinji];
            equ.数量 = x;
            equ.islockd = 0;
            najie[thing_class].push(equ);
            await Write_najie(usr_qq, najie);
            return;
          }
        }
      } else {
        if (!name.pinji) name.pinji = pinji;
        name.数量 = x;
        name.islockd = 0;
        najie[thing_class].push(name);
        await Write_najie(usr_qq, najie);
        return;
      }
    }
    if (typeof name != 'object') {
      najie[thing_class].find(
        item => item.name == name && item.pinji == pinji
      ).数量 += x;
    } else {
      najie[thing_class].find(
        item => item.name == name.name && item.pinji == pinji
      ).数量 += x;
    }
    najie.装备 = najie.装备.filter(item => item.数量 > 0);
    await Write_najie(usr_qq, najie);
    return;
  } else if (thing_class == '仙宠') {
    if (x > 0) {
      if (typeof name != 'object') {
        let thing = data.xianchon.find(item => item.name == name);
        if (thing) {
          thing = JSON.parse(JSON.stringify(thing));
          thing.数量 = x;
          thing.islockd = 0;
          najie[thing_class].push(thing);
          await Write_najie(usr_qq, najie);
          return;
        }
      } else {
        name.数量 = x;
        name.islockd = 0;
        najie[thing_class].push(name);
        await Write_najie(usr_qq, najie);
        return;
      }
    }
    if (typeof name != 'object') {
      najie[thing_class].find(item => item.name == name).数量 += x;
    } else {
      najie[thing_class].find(item => item.name == name.name).数量 += x;
    }
    najie.仙宠 = najie.仙宠.filter(item => item.数量 > 0);
    await Write_najie(usr_qq, najie);
    return;
  }else  if (thing_class == '宝石')
    if (x > 0) {
      if (typeof name != 'object') {
        let list = [
          'baoshi_list',
        ];
        for (let i of list) {
          let thing = data[i].find(item => item.name == name);
          if (thing) {
            let equ = JSON.parse(JSON.stringify(thing));
            equ.数量 = x;
            equ.islockd = 0;
            najie[thing_class].push(equ);
            await Write_najie(usr_qq, najie);
            return;
          }
        }
      } else {
        name.数量 = x;
        name.islockd = 0;
        najie[thing_class].push(name);
        await Write_najie(usr_qq, najie);
        return;
      }
  }
  let exist = await exist_najie_thing(usr_qq, name, thing_class);
  if (x > 0 && !exist) {
    let thing;
    let list = [
      'danyao_list',
      'newdanyao_list',
      'timedanyao_list',
      'daoju_list',
      'gongfa_list',
      'timegongfa_list',
      'caoyao_list',
      'xianchonkouliang',
      'xianchonkouliang2',
      'duanzhaocailiao',
      'kamian',
      'kamian3',
     'hecheng_list',
     'dijingList',
     'fuhua_list',
    
     'shicai_list',
      'jiagong_list',
     'cailiao_list',
      'hezi_list',
    'baoshi_list'
    ];
    for (let i of list) {
      thing = data[i].find(item => item.name == name);
      if (thing) {
        najie[thing_class].push(thing);
        najie[thing_class].find(item => item.name == name).数量 = x;
        najie[thing_class].find(item => item.name == name).islockd = 0;
        await Write_najie(usr_qq, najie);
        return;
      }
    }
  }
  najie[thing_class].find(item => item.name == name).数量 += x;
  najie[thing_class] = najie[thing_class].filter(item => item.数量 > 0);
  await Write_najie(usr_qq, najie);
  return;
}

//替换装备
export async function instead_equipment(usr_qq, equipment_data) {
  //装备name
  await Add_najie_thing(
    usr_qq,
    equipment_data,
    '装备',
    -1,
    equipment_data.pinji
  );
  let equipment = await Read_equipment(usr_qq);
  if (equipment_data.type == '武器') {
    //把读取装备，把武器放回戒指
    await Add_najie_thing(
      usr_qq,
      equipment.武器,
      '装备',
      1,
      equipment.武器.pinji
    );
    //根据名字找武器
    equipment.武器 = equipment_data;
    //武器写入装备
    await Write_equipment(usr_qq, equipment);
    return;
  }
  if (equipment_data.type == '护具') {
    await Add_najie_thing(
      usr_qq,
      equipment.护具,
      '装备',
      1,
      equipment.护具.pinji
    );
    equipment.护具 = equipment_data;
    await Write_equipment(usr_qq, equipment);
    return;
  }
  if (equipment_data.type == '法宝') {
    await Add_najie_thing(
      usr_qq,
      equipment.法宝,
      '装备',
      1,
      equipment.法宝.pinji
    );
    equipment.法宝 = equipment_data;
    await Write_equipment(usr_qq, equipment);
    return;
  }
  if (equipment_data.type == '帝兵') {
    await Add_najie_thing(
      usr_qq,
      equipment.帝兵,
      '装备',
      1,
      equipment.帝兵.pinji
    );
    equipment.帝兵 = equipment_data;
    await Write_equipment(usr_qq, equipment);
    return;
  }
  return;
}
//发送转发消息
//输入data一个数组,元素是字符串,每一个元素都是一条消息.
export async function ForwardMsg(e, data) {
//  let msgList = [];
//  for (let i of data) {
//    msgList.push({
//      message: i,
//      nickname: Bot.nickname,
//      user_id: Bot.uin,
//    });
//  }
//  if (msgList.length == 1) {
//    await e.reply(msgList[0].message);
//  } else {
//    await e.reply(await Bot.makeForwardMsg(msgList));
//  }
let img = await get_fight_img(e,data)
e.reply(img)
  return;
}


//对象数组排序
export function sortBy(field) {
  //从大到小,b和a反一下就是从小到大
  return function (b, a) {
    return a[field] - b[field];
  };
}

//获取总修为
export async function Get_xiuwei(usr_qq) {
  let player = await Read_player(usr_qq);
  let sum_exp = 0;
  let now_level_id;
  if (!isNotNull(player.level_id)) {
    return;
  }
  now_level_id = data.Level_list.find(
    item => item.level_id == player.level_id
  ).level_id;
  if (now_level_id < 65) {
    for (var i = 1; i < now_level_id; i++) {
      sum_exp = sum_exp + data.Level_list.find(temp => temp.level_id == i).exp;
    }
  } else {
    sum_exp = -999999999;
  } //说明玩家境界有错误
  sum_exp += player.修为;
  return sum_exp;
}
// 获取随机天资等级
async function get_random_aptitude() {
  // 定义天资等级及其概率
  const aptitudeGrades = {
    '无演无尽': 0.00001,   // 0.001% (传说中的存在)
    '万古无双': 0.0001,    // 0.01% (百万年难遇)
    '绝世天骄': 0.001,     // 0.1% (十万年难遇)
    '旷世奇才': 0.005,     // 0.5% (万年难遇)
    '天纵之资': 0.01,      // 1% (百年难遇)
    '超凡资质': 0.05,      // 5% (宗门核心弟子级别)
    '平庸之资': 0.78379,   // 78.379% (普通凡人)
    '先天不足': 0.1,       // 10% (修炼困难)
    '天弃之人': 0.05       // 5% (被天道诅咒)
  };

  // 计算总概率确保为1
  const totalProbability = Object.values(aptitudeGrades).reduce((sum, p) => sum + p, 0);
  if (Math.abs(totalProbability - 1) > 0.0001) {
    aptitudeGrades['平庸之资'] += 1 - totalProbability;
  }

  // 生成随机数决定天资等级
  const rand = Math.random();
  let cumulative = 0;
  let selectedGrade = '平庸之资';

  for (const [grade, prob] of Object.entries(aptitudeGrades)) {
    cumulative += prob;
    if (rand < cumulative) {
      selectedGrade = grade;
      break;
    }
  }

  // 天资评价描述
  const descriptions = {
    '无演无尽': '亘古绝今从未有，演尽诸天万界，此等天资已超脱天道束缚',
    '万古无双': '横推古今未来无对手，为修道而生，为应劫而至，永恒无敌',
    '绝世天骄': '惊才绝艳，具备帝姿，注定为一个时代的天地主角',
    '旷世奇才': '万年难遇，此等资质放眼九天十地也是难寻',
    '天纵之资': '天赋异禀，媲美上古大教的天才',
    '超凡资质': '资质超凡，注定异于常人',
    '平庸之资': '资质平平，勉勉强强',
    '先天不足': '先天有缺，修炼事倍功半',
    '天弃之人': '被天道抛弃，修炼必遭反噬'
  };

  return {
    grade: selectedGrade,
    evaluation: descriptions[selectedGrade],
    probability: aptitudeGrades[selectedGrade]
  };
}
// 获取随机灵根
export async function get_random_talent() {
  // 定义灵根类型概率
  const talentProbabilities = {
    '大道体': 0.00001,
    '至尊体': 0.0001,     // 0.01%
    '圣体': 0.0009,        // 0.09%
    '霸体': 0.0010,        // 0.10% (新增)
    '神王体': 0.0011,      // 0.11% (新增)
    '道胎': 0.0012,        // 0.12%
    '神体': 0.002,         // 0.2%
    '妖体': 0.005,         // 0.5%
    '天灵根': 0.08,        // 8%
    '变异灵根': 0.05,      // 5%
    '体质': 0.2,           // 20%
    '真灵根': 0.29,        // 29%
    '伪灵根': 0.3718       // 37.18% (调整后)
  };

  // 计算总概率确保为1
  const totalProbability = Object.values(talentProbabilities).reduce((sum, p) => sum + p, 0);
  if (Math.abs(totalProbability - 1) > 0.0001) {
    console.error('灵根概率总和不为1:', totalProbability);
    // 自动调整伪灵根概率使总和为1
    talentProbabilities.伪灵根 += 1 - totalProbability;
  }

  // 生成随机数决定灵根类型
  const rand = Math.random();
  let cumulative = 0;
  let selectedType = '伪灵根'; // 默认值

  // 按优先级顺序检查
  const priorityOrder = [
    '大道体', '至尊体', '圣体', '霸体', '神王体', // 新增霸体和神王体
    '道胎', '神体', '妖体',  
    '天灵根', '变异灵根', '体质', '真灵根', '伪灵根'
  ];

  for (const type of priorityOrder) {
    cumulative += talentProbabilities[type];
    if (rand < cumulative) {
      selectedType = type;
      break;
    }
  }

  // 获取对应类型的灵根列表
  let talentList = data.talent_list.filter(item => item.type === selectedType);
  
  // 如果列表为空，使用伪灵根作为备选
  if (talentList.length === 0) {
    console.warn(`未找到${selectedType}类型的灵根，使用伪灵根代替`);
    talentList = data.talent_list.filter(item => item.type === '伪灵根');
  }

  // 随机选择一个灵根
  const randomIndex = Math.floor(Math.random() * talentList.length);
  return talentList[randomIndex];
}
// 在xiuxian.js中添加这个函数
export function getMonsterByLocation(weizhi, xf = -1) {
  let monster_list;
  
  if (
    weizhi.name == '三清山' ||
    weizhi.name == '张家界' ||
    weizhi.name == '九寨沟' ||
    weizhi.name == '灵通山' ||
    weizhi.name == '啵唧的小金库' ||
    (weizhi.name == '低级' && xf == 0) ||
    weizhi.name == '太玄门' || 
    weizhi.name == '瑶池旧址'|| 
    weizhi.name == '小涅槃界天墟'
  ) {
    monster_list = data.monster_list1;
  } else if (
    weizhi.name == '华山之巅' ||
    weizhi.name == '武当山' ||
    weizhi.name == '天下会' ||
    (weizhi.name == '中级' && xf == 0) ||
    weizhi.name == '职场' ||
    weizhi.name == '昆仑墟' ||
    weizhi.name == '须弥'
  ) {
    monster_list = data.monster_list2;
  } else if (
    weizhi.name == '试炼' ||
    weizhi.name == '华山' ||
    weizhi.name == '衡山' ||
    weizhi.name == '嵩山' ||
    weizhi.name == '桃花岛' ||
    (weizhi.name == '高级' && xf == 0) ||
    weizhi.name == '轮回池' ||
    weizhi.name == '神龙山' ||
    weizhi.name == '火域' ||
    weizhi.name == '大夏祖庙'
  ) {
    monster_list = data.monster_list3;
  } else if (
    weizhi.name == '神兽试炼' ||
    weizhi.name == '灭仙洞' ||
    weizhi.name == '禁忌海' ||
    weizhi.name == '雷风岛' ||
    weizhi.name == '仙遗之地' ||
    weizhi.name == '无欲天仙' ||
    weizhi.name == '须弥'
  ) {
    monster_list = data.monster_list4;
  } else if (
    weizhi.name == '剑冢' ||
    weizhi.name == '影界' ||
    weizhi.name == '太极之阴' ||
    weizhi.name == '太极之阳' ||
    weizhi.name == '剑帝传承' ||
    weizhi.name == '荧惑古星' ||
    weizhi.name == '灵墟洞天'
  ) {
    monster_list = data.monster_list5;
  } else if (weizhi.name == '终极古地') {
    monster_list = data.monster_list_huodong;
  } else if (weizhi.name == '接引古殿') {
    monster_list = data.monster_list_jieyin;
  } else if (
    weizhi.name == '永恒海' ||
    weizhi.name == '永恒海尽头' ||
    weizhi.name == '诸天'
  ) {
    monster_list = data.monster_list9;
  } else if (
    weizhi.name == '紫薇星域' || 
    weizhi.name == '真魔殿' || 
    weizhi.name == '北斗南域'
  ) {
    monster_list = data.monster_list10;
  } else if (weizhi.name == '葬天星墟') {
    monster_list = data.monster_list11;
  } else if (
    weizhi.name == '荒古禁地' ||
    weizhi.name == '青铜仙殿' ||
    weizhi.name == '万龙巢'||
    weizhi.name == '圣崖'
  ) {
    monster_list = data.monster_list12;
  } else if (weizhi.name == '始源·混沌初开之地') {
    monster_list = data.monster_list13;
  } else if (weizhi.name == '太初古矿') {
    monster_list = data.monster_list14;
  } else if (weizhi.name == '北斗星紫山') {
    monster_list = data.monster_list15;
  } else if (weizhi.name == '神域星宫') {
    monster_list = data.monster_list16;
  } else if (
    weizhi.name == '蓬莱岛' ||
    weizhi.name == '昆仑山' ||
    weizhi.name == '方诸山' ||
    weizhi.name == '杀神崖' ||
    weizhi.name == '斩魔谷' ||
    weizhi.name == '仙界矿场' ||
    weizhi.name == '诸神黄昏·旧神界' ||
    weizhi.name == '瑞泽云海' ||
    (weizhi.name == '高级' && xf == 1)
  ) {
    monster_list = data.monster_list6;
  } else if (weizhi.name == '低级' && xf == 1) {
    monster_list = data.monster_list7;
  } else if (weizhi.name == '中级' && xf == 1) {
    monster_list = data.monster_list8;
  } else if (weizhi.id == 5200) {
    monster_list = data.monster_list1;
  } else {
    monster_list = data.monster_list;
  }

  const monster_index = Math.trunc(Math.random() * monster_list.length);
  return monster_list[monster_index];
}
/**
 * 输入概率随机返回布尔类型数据
 * @param P 概率
 * @returns 随机返回 false or true
 */
export function get_random_res(P) {
  if (P > 1) {
    P = 1;
  }
  if (P < 0) {
    P = 0;
  }
  let rand = Math.random();
  if (rand < P) {
    return true;
  }
  return false;
}

/**
 * 输入数组随机返回其中一个
 * @param ARR 输入的数组
 * @returns 随机返回一个元素
 */
export function get_random_fromARR(ARR) {
  //let L = ARR.length;
  let randindex = Math.trunc(Math.random() * ARR.length);
  return ARR[randindex];
}

//sleep
export async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

// 时间转换
export function timestampToTime(timestamp) {
  //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var date = new Date(timestamp);
  var Y = date.getFullYear() + '-';
  var M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '-';
  var D = date.getDate() + ' ';
  var h = date.getHours() + ':';
  var m = date.getMinutes() + ':';
  var s = date.getSeconds();
  return Y + M + D + h + m + s;
}

//根据时间戳获取年月日时分秒
export async function shijianc(time) {
  let dateobj = {};
  var date = new Date(time);
  dateobj.Y = date.getFullYear();
  dateobj.M = date.getMonth() + 1;
  dateobj.D = date.getDate();
  dateobj.h = date.getHours();
  dateobj.m = date.getMinutes();
  dateobj.s = date.getSeconds();
  return dateobj;
}

//获取上次签到时间
export async function getLastsign(usr_qq) {
  //查询redis中的人物动作
  let time = await redis.get('xiuxian:player:' + usr_qq + ':lastsign_time');
  if (time != null) {
    let data = await shijianc(parseInt(time));
    return data;
  }
  return false;
}
//获取上次周年庆签到时间
export async function getLastsign2(usr_qq) {
  //查询redis中的人物动作
  let time = await redis.get('xiuxian:player:' + usr_qq + ':lastsign_time2');
  if (time != null) {
    let data = await shijianc(parseInt(time));
    return data;
  }
  return false;
}
//获取上次周年庆签到时间
export async function getxinghailastsign_time(usr_qq) {
  //查询redis中的人物动作
  let time = await redis.get('xiuxian:player:' + usr_qq + ':xinghailastsign_time');
  if (time != null) {
    let data = await shijianc(parseInt(time));
    return data;
  }
  return false;
}
//获取上次道法仙术签到时间
export async function getLastsign3(usr_qq) {
  //查询redis中的人物动作
  let time = await redis.get('xiuxian:player:' + usr_qq + ':lastsign_time3');
  if (time != null) {
    let data = await shijianc(parseInt(time));
    return data;
  }
  return false;
}
export async function getPlayerAction(usr_qq) {
    try {
        // 查询redis中的人物动作
        let actionData = await redis.get('xiuxian:player:' + usr_qq + ':action');
        if (!actionData) {
            return {
                action: '空闲'
            };
        }
        
        const action = JSON.parse(actionData);
        const now_time = new Date().getTime();
        
        // 确定结束时间
        let end_time;
        if (action.end_time) {
            // 普通副本（禁地历练）结构
            end_time = action.end_time;
        } else if (action.Place_actionplus == '0') {
            // 沉迷副本（秘境历练）结构 - 使用 start_time + total_time
            end_time = action.start_time + action.total_time * 60 * 1000;
        } else {
            console.error('无效的动作数据：缺少结束时间', action);
            return {
                action: '空闲',
                error: '动作数据异常'
            };
        }
        
        // 检查动作是否已完成
        if (now_time > end_time) {
            return {
                action: '空闲'
            };
        }
        
        // 计算剩余时间
        const remainingMs = end_time - now_time;
        
        // 确保剩余时间是正数
        if (remainingMs <= 0) {
            return {
                action: '空闲'
            };
        }
        
        // 计算分钟和秒
        const m = Math.max(0, Math.floor(remainingMs / (1000 * 60)));
        const s = Math.max(0, Math.floor((remainingMs % (1000 * 60)) / 1000));
        
        // 基础返回对象
        const result = {
            action: action.action,
            time: `${m}分${s}秒`,
            progress: '0%',
            location: '无'
        };
        
        // 处理沉迷仙境状态（秘境历练）
        if (action.Place_actionplus === '0') {
           
            result.location = action.Place_address?.name || '未知';
            
            // 计算进度
            if (action.total_count && action.settled_count !== undefined) {
                const total = Number(action.total_count);
                const settled = Number(action.settled_count);
                
                if (!isNaN(total) && !isNaN(settled) && total > 0) {
                    const progress = Math.round((settled / total) * 100);
                    result.progress = `${progress}%`;
                }
            }
        }
        // 处理普通副本状态（禁地历练）
        else if (action.action === '禁地历练') {
            result.location = action.Place_address?.name || '未知地点';
            
            // 计算进度（基于时间）
            if (action.time && !isNaN(action.time)) {
                const totalTimeMs = action.time;
                if (totalTimeMs > 0) {
                    const progress = Math.round((1 - remainingMs / totalTimeMs) * 100);
                    result.progress = `${progress}%`;
                }
            }
        }
        // 处理位面传送状态
        else if (action.action === '位面传送') {
            result.location = action.to_name || '未知地点';
            
            // 计算进度
            if (action.travel_time && !isNaN(action.travel_time)) {
                const travelTimeMs = action.travel_time * 60 * 1000;
                if (travelTimeMs > 0) {
                    const progress = Math.round((1 - remainingMs / travelTimeMs) * 100);
                    result.progress = `${progress}%`;
                }
            }
        }
        // 处理其他状态
        else {
            result.location = action.Place_address?.name || '无';
        }
        
        return result;
    } catch (err) {
        console.error('获取玩家状态出错：', err);
        return {
            action: '空闲',
            error: '系统错误'
        };
    }
}

//锁定
export async function dataverification(e) {
  if (!e.isGroup) {
    //禁私聊
    return 1;
  }
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  if (usr_qq == 80000000) {
    //非匿名
    return 1;
  }
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) {
    //无存档
    return 1; //假
  }
  //真
  return 0;
}

/**
 * 判断对象是否不为undefined且不为null
 * @param obj 对象
 * @returns
 */
export function isNotNull(obj) {
  if (obj == undefined || obj == null) return false;
  return true;
}

export function isNotBlank(value) {
  if (value ?? '' !== '') {
    return true;
  } else {
    return false;
  }
}

export async function Read_qinmidu() {
  let dir = path.join(`${__PATH.qinmidu}/qinmidu.json`);
  let qinmidu = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  qinmidu = JSON.parse(qinmidu);
  return qinmidu;
}

export async function Write_qinmidu(qinmidu) {
  let dir = path.join(__PATH.qinmidu, `qinmidu.json`);
  let new_ARR = JSON.stringify(qinmidu, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
export async function Read_channel() {
  let dir = path.join(`${__PATH.channel}/channel.json`);
  let channel = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  channel = JSON.parse(channel);
  return channel;
}

export async function Write_channel(channel) {
  let dir = path.join(__PATH.channel, `channel.json`);
  let new_ARR = JSON.stringify(channel, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
export async function fstadd_channel(A, B, key) {
  let channel;
  try {
    channel = await Read_channel();
  } catch {
    //没有表要先建立一个！
    await Write_channel([]);
    channel = await Read_channel();
  }
  let pd=false
  var i = A;
  var l=0;
      while(i >= 1){
      i=i/10;
      l++;
      }
  if(l>10){//判断是否为频道19位id
    pd=true
  }
  let player=''
  if(pd){
    player = {
      QQ_ID: B,
      频道_ID: A,
      密钥: key,
    };
  }else{
    player = {
    QQ_ID: A,
    频道_ID: B,
    密钥: key,
  };
  }
  if(player==''){
    console.log("出现错误!!!!:设置绑定请求出现错误")
    return
  }
  channel.push(player);
  await Write_channel(channel);
  return;
}
export async function fstadd_qinmidu(A, B) {
  let qinmidu;
  try {
    qinmidu = await Read_qinmidu();
  } catch {
    //没有表要先建立一个！
    await Write_qinmidu([]);
    qinmidu = await Read_qinmidu();
  }
  let player = {
    QQ_A: A,
    QQ_B: B,
    亲密度: 0,
    婚姻: 0,
  };
  qinmidu.push(player);
  await Write_qinmidu(qinmidu);
  return;
}

export async function add_qinmidu(A, B, qinmi) {
  let qinmidu;
  try {
    qinmidu = await Read_qinmidu();
  } catch {
    //没有表要先建立一个！
    await Write_qinmidu([]);
    qinmidu = await Read_qinmidu();
  }
  let i;
  for (i = 0; i < qinmidu.length; i++) {
    if (
      (qinmidu[i].QQ_A == A && qinmidu[i].QQ_B == B) ||
      (qinmidu[i].QQ_A == B && qinmidu[i].QQ_B == A)
    ) {
      break;
    }
  }
  if (i == qinmidu.length) {
    await fstadd_qinmidu(A, B);
    qinmidu = await Read_qinmidu();
  }
  qinmidu[i].亲密度 += qinmi;
  await Write_qinmidu(qinmidu);
  return;
}

export async function find_qinmidu(A, B) {
  let qinmidu;
  try {
    qinmidu = await Read_qinmidu();
  } catch {
    //没有建立一个
    await Write_qinmidu([]);
    qinmidu = await Read_qinmidu();
  }
  let i;
  let QQ = [];
  for (i = 0; i < qinmidu.length; i++) {
    if (qinmidu[i].QQ_A == A || qinmidu[i].QQ_A == B) {
      if (qinmidu[i].婚姻 != 0) {
        QQ.push = qinmidu[i].QQ_B;
        break;
      }
    } else if (qinmidu[i].QQ_B == A || qinmidu[i].QQ_B == B) {
      if (qinmidu[i].婚姻 != 0) {
        QQ.push = qinmidu[i].QQ_A;
        break;
      }
    }
  }
  for (i = 0; i < qinmidu.length; i++) {
    if (
      (qinmidu[i].QQ_A == A && qinmidu[i].QQ_B == B) ||
      (qinmidu[i].QQ_A == B && qinmidu[i].QQ_B == A)
    ) {
      break;
    }
  }
  if (i == qinmidu.length) {
    return false;
  } else if (QQ.length != 0) {
    return 0;
  } else {
    return qinmidu[i].亲密度;
  }
}
//查询A的婚姻，如果有婚姻则返回对方qq，若无则返回false
export async function exist_hunyin(A) {
  let qinmidu;
  try {
    qinmidu = await Read_qinmidu();
  } catch {
    //没有建立一个
    await Write_qinmidu([]);
    qinmidu = await Read_qinmidu();
  }
  let i = 0;
  let flag = 0;
  for (i = 0; i < qinmidu.length; i++) {
    if (qinmidu[i].QQ_A == A) {
      //已婚则将A/B的另一半存到QQ数组中
      if (qinmidu[i].婚姻 != 0) {
        flag = qinmidu[i].QQ_B;
        break;
      }
    } else if (qinmidu[i].QQ_B == A) {
      if (qinmidu[i].婚姻 != 0) {
        flag = qinmidu[i].QQ_A;
        break;
      }
    }
  }
  //A存在已婚则返回对方qq
  if (flag != 0) {
    //console.log(flag);
    return flag;
  } else {
    return false;
  }
}

export async function Write_shitu(shitu) {
  let dir = path.join(__PATH.shitu, `shitu.json`);
  let new_ARR = JSON.stringify(shitu, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
export async function Read_shitu() {
  let dir = path.join(`${__PATH.shitu}/shitu.json`);
  let shitu = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  shitu = JSON.parse(shitu);
  return shitu;
}

export async function fstadd_shitu(A) {
  let shitu;
  try {
    shitu = await Read_shitu();
  } catch {
    //没有表要先建立一个！
    await Write_shitu([]);
    shitu = await Read_shitu();
  }
  let player = {
    师傅: A,
    收徒: 0,
    未出师徒弟: 0,
    任务阶段: 0,
    renwu1: 0,
    renwu2: 0,
    renwu3: 0,
    师徒BOOS剩余血量: 100000000,
    已出师徒弟: [],
  };
  shitu.push(player);
  await Write_shitu(shitu);
  return;
}

export async function add_shitu(A, num) {
  let shitu;
  try {
    shitu = await Read_shitu();
  } catch {
    //没有表要先建立一个！
    await Write_shitu([]);
    shitu = await Read_shitu();
  }
  let i;
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].A == A) {
      break;
    }
  }
  if (i == shitu.length) {
    await fstadd_shitu(A);
    shitu = await Read_shitu();
  }
  shitu[i].收徒 += num;
  await Write_shitu(shitu);
  return;
}

export async function find_shitu(A) {
  let shitu;
  try {
    shitu = await Read_shitu();
  } catch {
    //没有建立一个
    await Write_shitu([]);
    shitu = await Read_shitu();
  }
  let i;
  let QQ = [];
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].师傅 == A) {
      break;
    }
  }
  if (i == shitu.length) {
    return false;
  } else if (QQ.length != 0) {
    return 0;
  } else {
    return shitu[i].师徒;
  }
}

export async function find_tudi(A) {
  let shitu;
  shitu = await Read_shitu();
  let i;
  let QQ = [];
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].未出师徒弟 == A) {
      break;
    }
  }
  if (i == shitu.length) {
    return 0;
  } else if (QQ.length != 0) {
    return 0;
  } else {
    return shitu[i].师徒;
  }
}
export async function Read_danyao(usr_qq) {
  let dir = path.join(`${__PATH.danyao_path}/${usr_qq}.json`);
  let danyao = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  danyao = JSON.parse(danyao);
  return danyao;
}

export async function Write_danyao(usr_qq, danyao) {
  let dir = path.join(__PATH.danyao_path, `${usr_qq}.json`);
  let new_ARR = JSON.stringify(danyao, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
/**
 * 查找沉迷消息
 * @param {玩家ID} usr_qq 
 * @param {true或false} returns true为返回下标false为数据，不可为空
 * @returns 
 */
export async function find_temp(usr_qq, returns) {
    let temp = await Read_temp()
    let index
    let rom = []
    for (let i = 0; i < temp.length; i++) {
        if (temp[i].usr_qq == usr_qq) {
            index = i
            if (returns) {
                rom = i
            } else {
                rom = temp[i]
            }
        }
    }
    return rom
}
export async function Read_temp() {
  let dir = path.join(`${__PATH.temp_path}/temp.json`);
  let temp = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  temp = JSON.parse(temp);
  return temp;
}

export async function Write_temp(temp) {
  let dir = path.join(__PATH.temp_path, `temp.json`);
  let new_ARR = JSON.stringify(temp, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
export async function Write_renwu(renwu) {
  let dir = path.join(__PATH.renwu, `renwu.json`);
  let new_ARR = JSON.stringify(renwu, "", "\t");
  fs.writeFileSync(dir, new_ARR, 'utf8', (err) => {
      console.log('写入成功', err)
  })
  return;
}
export async function Read_renwu() {
  let dir = path.join(`${__PATH.renwu}/renwu.json`);
  let renwu = fs.readFileSync(dir, 'utf8', (err, data) => {
      if (err) {
          console.log(err)
          return "error";
      }
      return data;
  })
  //将字符串数据转变成数组格式
  renwu = JSON.parse(renwu);
  return renwu;
}



export async function fstadd_renwu(A) {
  let renwu;
  try {
      renwu = await Read_renwu();
      ;
  } catch {
      //没有表要先建立一个！
      await Write_renwu([]);
      renwu = await Read_renwu();
  }
  let player = {
      player: A,
      等级: 0,
      经验: 0,
      renwu: 0,
      wancheng1: 0,
      jilu1: 0,
      wancheng2: 0,
      jilu2: 0,
      wancheng3: 0,
      jilu3: 0,
      jiequ: []

  }
  renwu.push(player);
  await Write_renwu(renwu);
  return;
}

export async function add_renwu(A, num) {
  let renwu;
  try {
      renwu = await Read_renwu();
      ;
  } catch {
      //没有表要先建立一个！
      await Write_renwu([]);
      renwu = await Read_renwu();
  }
  let i;
  for (i = 0; i < renwu.length; i++) {
      if (renwu[i].A == A) {
          break;
      }
  }
  if (i == renwu.length) {
      await fstadd_renwu(A);
      renwu = await Read_renwu();
  }
  renwu[i].等级 += num;
  await Write_renwu(renwu);
  return;
}

export async function find_renwu(A) {
  let renwu;
  try {
      renwu = await Read_renwu();
  } catch {
      //没有建立一个
      await Write_renwu([])
      renwu = await Read_renwu();
  }
  let i;
  let QQ = [];
  for (i = 0; i < renwu.length; i++) {
      if (renwu[i].player == A) {
          break;

      }
  }
  if (i == renwu.length) {
      return false;
  } else if (QQ.length != 0) {
      return 0;
  } else {
      return renwu[i].任务;
  }
}
/**
 * 常用查询合集
 */
export async function Go(e) {
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    const player = await Read_player(usr_qq);
    
    // 定义位置状态映射
    const PLACE_STATES = {
        0: "凡间",
        1: "仙界",
        2: "遮天位面",
        2.5: "九天十地",
        3: "界海",
        4: "时间长河",
        5: "永恒未知之地"
    };
    
    // 获取当前位置名称
    const currentPlace = player.power_place || 0; // 默认为仙界
    const placeName = PLACE_STATES[currentPlace] || "未知之地";
    
    // 不开放私聊
    if (!e.isGroup) {
        return 0;
    }
    
    // 有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        return 0;
    }
    
    // 获取游戏状态
    let game_action = await redis.get('xiuxian:player:' + usr_qq + ':game_action');
    
    // 防止继续其他娱乐行为
    if (game_action == 0) {
        e.reply('修仙：游戏进行中...');
        return 0;
    }
    
    // 查询redis中的人物动作
    let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
    action = JSON.parse(action);
    
    if (action != null) {
        // 人物有动作查询动作结束时间
        let action_end_time = action.end_time;
        let now_time = new Date().getTime();
        if (action.Place_actionplus === '0') {
        // 沉迷副本（秘境历练）结构
        action_end_time = action.start_time + action.total_time * 60 * 1000;
    } 
        if (now_time <= action_end_time) {
            const m = parseInt((action_end_time - now_time) / 1000 / 60);
            const s = parseInt((action_end_time - now_time - m * 60 * 1000) / 1000);
            const replyMsg = [
                `真身当前位置：${placeName}`,
  
                `正在${action.action}中，剩余时间：${m}分${s}秒`
            ];

            
            // 发送所有信息
            e.reply(replyMsg.join("\n"));
            return 0;
        }
    
    
    // ...其他代码...


    // if(action.Place_action==0){
    //   action=action.toString()
    //   e.reply(`降临秘境${action.Place_address}已完成,等待结算中`)
    //   return 0;
    // }

    // if(action.Place_actionplus==0){
    //   action=action.toString()
    //   e.reply(`沉迷秘境${action.Place_address}x${action.cishu}次已完成,等待结算中`)
    //   return 0;
    // }
  }

  return true;
}
// export async function Go(e) {
//   let usr_qq = e.user_id;
//   //不开放私聊
//   if (!e.isGroup) {
//     return 0;
//   }
//   //有无存档
//   let ifexistplay = await existplayer(usr_qq);
//   if (!ifexistplay) {
//     return 0;
//   }
//   //获取游戏状态
//   let game_action = await redis.get(
//     'xiuxian:player:' + usr_qq + ':game_action'
//   );
//   //防止继续其他娱乐行为
//   if (game_action == 0) {
//     e.reply('修仙：游戏进行中...');
//     return 0;
//   }
//   //查询redis中的人物动作
//   let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
//   action = JSON.parse(action);
//   let now_time = new Date().getTime();
//   if (action != null) {
//     if("禁闭" == action.action){
//       if(null != action.start_time){
//         if(0 <= now_time - action.start_time- 3600000){
//           await redis.del('xiuxian:player:' + usr_qq + ':action');
//           e.reply("碎了一觉，跑出来了")
//           return true;
//         }
//       }else if(null != action.end_time){
//         if(0 <= now_time - action.end_time){
//           await redis.del('xiuxian:player:' + usr_qq + ':action');
//           e.reply("碎了一觉，跑出来了")
//           return true;
//         }
//       }
//     }
//     if(null != action.start_time){
//       let time = parseInt(now_time - action.start_time);
//       if("历练" == action.action){
//         let need_time = 360000;
//         let cishu = 1;
//         if(null != action.cishu){
//           cishu = action.cishu;
//           need_time = need_time * cishu;
//         }
//         if(need_time <= time){
//           await action_way_fun(e);
//           return true;
//         }
//       }
//       let days = parseInt(time / (1000 * 60 * 60 * 24));
//       let hours = parseInt((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       let minutes = parseInt((time % (1000 * 60 * 60)) / (1000 * 60));
//       e.reply(action.action + days + " 天 " + hours + " 小时 " + minutes + " 分钟 ");
//       return 0;
//     }
//   }
//   return true;
// }


export async function Write_shop(shop) {
  let dir = path.join(__PATH.shop, `shop.json`);
  let new_ARR = JSON.stringify(shop, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

export async function Read_shop() {
  let dir = path.join(`${__PATH.shop}/shop.json`);
  let shop = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  shop = JSON.parse(shop);
  return shop;
}
//判断是否还有物品
export async function existshop(didian) {
  let shop = await Read_shop();
  let i;
  let thing = [];
  for (i = 0; i < shop.length; i++) {
    if (shop[i].name == didian) {
      break;
    }
  }
  for (var j = 0; j < shop[i].one.length; j++) {
    if (shop[i].one[j].数量 > 0) {
      thing.push(shop[i].one[j]);
    }
  }
  if (thing.length > 0) {
    return thing;
  } else {
    return false;
  }
}
/**
 * 处理帝兵效果
 * @param {Object} attacker 攻击者对象
 * @param {Object} defender 防御者对象
 * @param {Array} msg 消息数组
 * @returns {boolean} 是否触发了帝兵效果
 */
export async function handleEmperorWeapon(attacker, defender, msg,emperorWeaponTriggered) {
    if (emperorWeaponTriggered || !isNotNull(attacker.id)|| !isNotNull(defender.id)) return false;
    
    const equipment = await Read_equipment(attacker.id);
const DI_BING_RANKS = [
    "雏形", "通灵", "铭刻道与理", "斩道王兵", 
    "圣兵", "准帝兵", "极道帝兵", "仙器", 
    "仙王器", "准仙帝器", "仙帝器", "祭道器"
];
    if (!equipment.帝兵 || 
        equipment.帝兵.author_name !== attacker.id || 
        DI_BING_RANKS.indexOf(equipment.帝兵.品阶) < DI_BING_RANKS.indexOf("极道帝兵")) {
        return false;
    }
    
    // 帝兵属性加成
    const 攻击加成 = Math.trunc(10 * attacker.攻击);
    const 血量加成 = Math.trunc(10 * attacker.血量上限);
    const 防御加成 = Math.trunc(10 * attacker.防御);
    
    attacker.攻击 += 攻击加成;
    attacker.血量上限 += 血量加成;
    attacker.防御 += 防御加成;
    
    // 根据品阶生成不同的描述
    let 帝兵描述 = "";
    switch(equipment.帝兵.品阶) {
        case "极道帝兵": 帝兵描述 = "极道帝威席卷九天十地，大道符文烙印虚空！"; break;
        case "仙器": 帝兵描述 = "仙光璀璨，照耀万古，不朽仙气弥漫诸天！"; break;
        case "仙王器": 帝兵描述 = "仙王法则交织，时间长河为之倒流，万界臣服！"; break;
        case "仙帝器": 帝兵描述 = "帝威浩荡，镇压万古轮回，一念可开天辟地！"; break;
        default: 帝兵描述 = "帝兵复苏，威压震古烁今！";
    }
    
    // 辰东风格文案
    msg.push("轰隆！");
    msg.push(`${equipment.帝兵.name}突然复苏，${帝兵描述}`);
    msg.push(`帝兵通体绽放仙光，与${attacker.名号}共鸣！`);
    msg.push(`「我为天帝，当镇压世间一切敌！」${attacker.名号}长啸，声震寰宇！`);
    msg.push(`帝兵加持下，${attacker.名号}战力暴涨！`);
    msg.push(`攻击增加：${bigNumberTransform(攻击加成)}`);
    msg.push(`血量上限增加：${bigNumberTransform(血量加成)}`);
    msg.push(`防御增加：${bigNumberTransform(防御加成)}`);
    
    emperorWeaponTriggered = true;
    
    // 特殊效果 - 万物母气
    if (equipment.帝兵.主材料 === "万物母气") {
        msg.push(`玄黄垂落，母气流转，镇压诸天万道！`);
        msg.push(`${defender.名号}如陷泥沼，行动艰难！`);
        defender.dongjie = true;
    }
    
    // 特殊帝兵效果
    if (equipment.帝兵.name === "无始钟") {
        msg.push(`钟声悠悠，震动万古，时间长河为之倒流！`);
        msg.push(`${defender.名号}周身时光碎片飞舞，寿元被斩去千年！`);
        defender.当前血量 = Math.max(defender.当前血量 * 0.7, 0);
    } 
    else if (equipment.帝兵.name === "吞天魔罐") {
        msg.push(`魔罐吞天，万灵哀嚎，吞噬一切精气！`);
        const 吞噬伤害 = Math.trunc(defender.当前血量 * 0.2);
        defender.当前血量 -= 吞噬伤害;
        attacker.当前血量 += 吞噬伤害;
        msg.push(`${defender.名号}被吞噬${bigNumberTransform(吞噬伤害)}点生命，${attacker.名号}恢复等量生命！`);
    }
    
    // 帝兵品阶压制效果
    const defenderequipment = await Read_equipment(defender.id);
    if (defenderequipment?.帝兵) {
        const attackerRank = DI_BING_RANKS.indexOf(equipment.帝兵.品阶);
        const defenderRank = DI_BING_RANKS.indexOf(defenderequipment.帝兵.品阶);
        
        if (attackerRank >= defenderRank + 2) {
            const destroyChance = 0.3 + (attackerRank - defenderRank) * 0.1;
            
            if (Math.random() < destroyChance) {
                msg.push(`「${equipment.帝兵.name}」绽放无量帝威，煌煌神光撕裂永恒！`);
                msg.push(`「${defenderequipment.帝兵.name}」在对方帝兵的威压下寸寸崩裂！`);
                msg.push(`${defender.名号}的帝兵被彻底粉碎！`);
            }
        }
    }
    
    return true;
}
/**
 * 处理圆神效果
 * @param {Object} attacker 攻击者对象
 * @param {Object} defender 防御者对象
 * @param {Array} msg 消息数组
 * @param {string} context 上下文（"main"或"fenshen"）
 * @returns {boolean} 是否触发了圆神效果
 */
function handleCircularGod(attacker, defender, msg, context) {
    if (context === "fenshen" || attacker.灵根?.name !== "圆神" || Math.random() >= 0.2) {
        return false;
    }
    
    const isFirstCast = !attacker.圆环之理激活;
    const healMessages = [];
    
    // 光炮伤害
    const lightCannonDmg = Math.trunc(attacker.攻击 * 10);
    defender.当前血量 = Math.max(0, defender.当前血量 - lightCannonDmg);
    
    // 治疗效果
    if (attacker.当前血量 > 0) {
        const healAmount = Math.trunc(attacker.血量上限 * 0.3);
        attacker.当前血量 = Math.min(attacker.当前血量 + healAmount, attacker.血量上限);
        healMessages.push(`${attacker.名号}恢复${bigNumberTransform(healAmount)}生命`);
    }
    
    // 自身增益
    attacker.减伤比例 = 0.3;
    attacker.护盾值 = Math.trunc(attacker.当前血量 * 0.4);
    
    // 分身召唤
    if (!attacker.分身) attacker.分身 = [];
    if (attacker.分身.length < 2) {
        const newFenshen = {
            名号: `${attacker.名号}·圆环分身`,
            攻击: attacker.攻击,
            防御: attacker.防御,
            当前血量: attacker.当前血量,
            血量上限: attacker.血量上限,
            法球倍率: attacker.法球倍率,
            暴击率: attacker.暴击率,
            协同攻击: true,
            分身: true
        };
        attacker.分身.push(newFenshen);
    }
    
    // 构建消息
    const skillMessages = [
        `${attacker.名号}张开双臂，发间丝带绽放虹光！`,
        `「所有宇宙、过去未来的魔法少女们——」`,
        `「你们的悲伤，由我来承受！」`
    ];
    
    if (isFirstCast) {
        skillMessages.push(
            `因果律重构！粉红光翼贯穿多元宇宙！`,
            `圆环之理显现，改写宇宙基本法则！`,
            `「这就是我选择的命运！」`
        );
        attacker.圆环之理激活 = true;
    }
    
    skillMessages.push(
        `箭矢虹光洪流倾泻而出，`,
        `对${defender.名号}造成${bigNumberTransform(lightCannonDmg)}点法则伤害！`,
        ...healMessages,
        `${attacker.名号}获得「神性加护」：`,
        `- 伤害减免30%`,
        `- 获得${bigNumberTransform(attacker.护盾值)}点因果护盾`
    );
    
    if (attacker.分身.length > 0) {
        const fenshenCount = attacker.分身.length;
        skillMessages.push(
            `${fenshenCount}道虹光从圆环中分离，`,
            `化作${attacker.名号}的思念体！`,
            `「我们永远同在...」`
        );
    }
    
    msg.push(...skillMessages);
    return true;
}
/**
 * 处理控制效果（冻结、禁锢等）
 * @param {Object} attacker 攻击者对象
 * @param {Object} defender 防御者对象
 * @param {Array} msg 消息数组
 */
function handleControlEffects(A_immune_control, B_immune_control,A_player,B_player,attacker, cnt,defender, msg,emperorFieldTriggered,context,cnt2,A_临字秘触发,B_临字秘触发,A_临字秘加成,B_临字秘加成) {
    if (emperorFieldTriggered === false && attacker.mijinglevel_id > 19 && defender.mijinglevel_id < 20) {
      if (attacker.mijinglevel_id - defender.mijinglevel_id >= 2) {
            // 计算夺取数值
            let 夺取攻击 = Math.floor(defender.攻击 * 0.5);
            let 夺取防御 = Math.floor(defender.防御 * 0.5);
            let 夺取血量 = Math.floor(defender.当前血量 * 0.5);
            
            // 执行夺取
            defender.攻击 = Math.max(defender.攻击 - 夺取攻击, 0);
            defender.防御 = Math.max(defender.防御 - 夺取防御, 0);
            defender.当前血量 = Math.max(defender.当前血量 - 夺取血量, 0);
      msg.push(`${defender.名号}受到帝之场域压制，一身战力被削去十之五六!`);
       emperorFieldTriggered = true;
    } 
}
if (attacker.mijinglevel_id > 19 && defender.mijinglevel_id < 20 && Math.random() < 0.99) {
  // 检查防御方是否有免疫控制效果
  const isImmune = (defender === A_player && A_immune_control > 0) || 
                   (defender === B_player && B_immune_control > 0);
  
  if (isImmune) {
    // 秘境等级差距过大时，免疫失效
    if (attacker.mijinglevel_id - defender.mijinglevel_id >= 2) {
      defender.dongjie = true;
      msg.push(`${attacker.名号}周身仙光亿万缕，大道符文压盖诸天，一缕气息崩断万古时空！`);
      msg.push(`然而${defender.名号}的涅槃真火在绝对实力差距下黯然熄灭，如同萤火之于皓月！`);
      msg.push(`${defender.名号}，在吾面前，纵有涅槃之力亦难逃镇压！`);
      msg.push(`${attacker.名号}声震寰宇，言出法随！`);
      msg.push(`${defender.名号}的身躯与神魂被永恒禁锢，万道哀鸣，诸天颤栗！`);
    } else {
      // 秘境等级差距不大时，免疫生效
      msg.push(`${attacker.名号}眸中射出两道仙芒，撕裂虚空，欲定住${defender.名号}的万古道果！`);
      msg.push(`${defender.名号}周身涅槃真火熊熊燃烧，焚尽万法，破灭一切禁锢！`);
      msg.push(`区区小道，也敢在涅槃真火前逞威？`);
      msg.push(`${defender.名号}冷笑，真火化作仙凰展翅，击穿永恒！`);
    }
  } else {
    // 无免疫效果时正常触发
    defender.dongjie = true; 
    msg.push(`${attacker.名号}身上散发出超越诸天极限的气息，一缕眸光压塌万古！`);
    msg.push(`${defender.名号}的身躯与神魂被永恒禁锢，时间长河在此断流！`);
    msg.push(`${defender.名号}，在吾面前，你连蝼蚁都不如！`);
    msg.push(`${attacker.名号}的声音冰冷彻骨，震动诸天万界！`);
  }
}


if ( defender.灵根&&defender.灵根.name === "命运神道体") {
      if (Math.random() > 0.7) {
        msg.push(`${defender.名号}推开了命运生死轮盘，改写了真实，局势发生了微妙的变化，${attacker.名号}被命运之力禁锢了！`);
         attacker.dongjie = true; 
        if (Math.random() > 0.01) {
          let 回复血量 = defender.当前血量 * 0.5;
          defender.当前血量 = Math.max(defender.当前血量 + 回复血量, 0);
          msg.push(`${defender.名号}念诵如梦真名，身魂受到庇护，永不坠劫，生命回复${回复血量}点,${defender.名号}当前血量${defender.当前血量}`);
        }
      }
    } 
// 九秘触发主逻辑
if (context !== "fenshen") {
    // 检查已学九秘数量（用于共鸣计算）
    const learnedMijue = attacker.学习的功法?.filter(gongfa => 
        ["临", "兵", "斗", "者", "皆", "数", "组", "前", "行"].some(mijue => gongfa.includes(mijue))
    ).length || 0;

    // 九秘共鸣概率计算函数
    const calculateTriggerProbability = (attacker) => {
        const baseProb = 0.01;
        const bonusProbability = learnedMijue * 0.1;
        return Math.min(1.0, baseProb + bonusProbability);
    };

    // 先判断皆字秘触发
    if (attacker.学习的功法?.includes("皆字秘") && !attacker.皆字秘触发) {
        const prob = calculateTriggerProbability(attacker);
        if (Math.random() < prob) {
            // 保存原始属性用于文案
            const originalAttack = attacker.攻击;
            const originalDefense = attacker.防御;
            const originalHP = attacker.当前血量;
            
            // 应用十倍战力
            attacker.攻击 = Math.trunc(attacker.攻击 * 10);
            attacker.防御 = Math.trunc(attacker.防御 * 10);
            attacker.当前血量 = Math.trunc(attacker.当前血量 * 10);
            attacker.皆字秘触发 = true;
            
            // 构建皆字秘文案
            const jieziMsg = [
                `「皆！」`,
                `${attacker.名号}口吐真言，周身迸发开天辟地之光！`,
                `九秘之皆字秘显化，战力飙升十倍，打破天地桎梏！`,
                ``,
                `【战力飙升】`,
                `攻击：${bigNumberTransform(originalAttack)} → ${bigNumberTransform(attacker.攻击)}`,
                `防御：${bigNumberTransform(originalDefense)} → ${bigNumberTransform(attacker.防御)}`,
                `生命：${bigNumberTransform(originalHP)} → ${bigNumberTransform(attacker.当前血量)}`,
            ];

            
            msg.push(jieziMsg.join('\n'));
        }
    }

    // 再判断临字秘（禁忌领域）触发，受皆字秘抑制
    if (attacker.学习的功法?.includes("临字秘") && !(attacker === A_player ? A_临字秘触发 : B_临字秘触发)) {
        const prob = calculateTriggerProbability(attacker);
        if (Math.random() < prob) {
            const realmLevel = Math.floor(Math.random() * 9) + 1;
            
            // 禁忌领域抑制判断：皆字秘触发时，非神禁领域不得触发
            if (attacker.皆字秘触发 && realmLevel !== 9) {
                // 皆字秘压制非神禁领域，输出描述
                const suppressMsg = [
                    ``,
                    `「临！」${attacker.名号}欲展开禁忌领域，然周身皆字秘的十倍战力如星河决堤，煌煌神威不可犯！`,
                    `皆字秘乃无上增幅，未入神禁，无法相互叠加，禁忌领域演化被强行中断未能成形！`
                ];
                msg.push(suppressMsg.join('\n'));
            } else {
                // 可正常触发禁忌领域（包括神禁突破抑制）
                
                // 禁数领域描述
                const realmNames = {
                    1: "一禁领域",
                    2: "二禁领域", 
                    3: "三禁领域",
                    4: "四禁领域",
                    5: "五禁领域",
                    6: "六禁领域",
                    7: "七禁领域",
                    8: "八禁领域",
                    9: "神禁领域"
                };
                
                // 领域描述文案（辰东风格）
                const realmDescriptions = {
                    1: "周身混沌气弥漫，淡淡神辉浮现，大道初鸣",
                    2: "气血如龙，贯穿霄汉，战力翻涌如潮",
                    3: "道则环绕，符文漫天，战力飙升破苍穹",
                    4: "神光冲霄，撕裂永恒，战力惊动万古",
                    5: "大道共鸣，天地颤栗，战力破开九重天",
                    6: "异象纷呈，仙王临九天，盖压当世无敌手",
                    7: "神魔虚影显化，时间长河浮现，震古烁今",
                    8: "轮回往生，阴阳逆转，横推当世一切敌",
                    9: "踏入神禁领域，超脱在上，举世无敌！"
                };
                
                // 神禁领域突破皆字秘抑制的特殊描述
                if (attacker.皆字秘触发 && realmLevel === 9) {
                    const breakthroughMsg = [
                        ``,
                        `「轰——！」`,
                        `万丈雷海凭空起，${attacker.名号}长啸震古烁今，竟在十倍战力加持下强行踏足神禁！`,
                        `这是唯有古之大帝才能常驻的无上领域，此刻双秘共鸣，${attacker.名号}身涌帝气，威压万古青天！`,
                        `周边星域在这股气势下寸寸崩裂，无尽星域化为齑粉，岁月长河都为之倒流显化！`,
                        `「神禁领域，唯我独尊！」`
                    ];
                    msg.push(breakthroughMsg.join('\n'));
                }
                
                // 计算属性提升
                const selfMultiplier = realmLevel;
                const enemyMultiplier = realmLevel / 10;
                const gongfa = realmLevel * 4;
                
                // 保存原始属性
                const originalAttack = attacker.攻击;
                const originalDefense = attacker.防御;
                const originalHP = attacker.当前血量;
                
                // 计算新属性
                attacker.攻击 = Math.trunc(
                    attacker.攻击 * selfMultiplier + 
                    defender.攻击 * enemyMultiplier
                );
                attacker.防御 = Math.trunc(
                    attacker.防御 * selfMultiplier + 
                    defender.防御 * enemyMultiplier
                );
                attacker.当前血量 = Math.trunc(
                    attacker.当前血量 * selfMultiplier + 
                    defender.当前血量 * enemyMultiplier
                );
                
                // 属性压制效果
                const suppressionRate = realmLevel * 0.05;
                defender.攻击 = Math.trunc(defender.攻击 * (1 - suppressionRate));
                defender.防御 = Math.trunc(defender.防御 * (1 - suppressionRate));
                
                // 设置技能触发概率加成
                if (attacker === A_player) {
                    A_临字秘加成 = realmLevel * 0.04;
                    A_临字秘触发 = true;
                } else {
                    B_临字秘加成 = realmLevel * 0.04;
                    B_临字秘触发 = true;
                }
                
                // 构建临字秘文案
                const realmMsg = [
                    `「临！」`,
                    `${attacker.名号}口吐真言，${realmNames[realmLevel]}轰然展开！`,
                    realmDescriptions[realmLevel],
                    ``,
                    `【战力飙升】`,
                    `战力指数级暴涨，位阶突破${realmLevel}重天关！`,
                    `攻击：${bigNumberTransform(originalAttack)} → ${bigNumberTransform(attacker.攻击)}`,
                    `防御：${bigNumberTransform(originalDefense)} → ${bigNumberTransform(attacker.防御)}`,
                    `生命：${bigNumberTransform(originalHP)} → ${bigNumberTransform(attacker.当前血量)}`,
                    ``,
                    `【道则压制】`,
                    `禁忌领域展开，${defender.名号}如陷泥沼！`,
                    `攻击压制：${(suppressionRate * 100).toFixed(0)}%`,
                    `防御压制：${(suppressionRate * 100).toFixed(0)}%`,
                    `功法触发概率提升：${gongfa}%`
                ];
                
                // 神禁领域特殊描述
                if (realmLevel === 9) {
                    realmMsg.push(
                        ``,
                        `「神禁领域，唯我独尊！」`,
                        `九重天关尽破，${attacker.名号}身与道合，超脱在上！`,
                        `举手投足间，万道哀鸣，诸天星辰为之黯淡！`
                    );
                }
                
                // 九秘共鸣效果
                if (learnedMijue > 0) {
                    realmMsg.push(``);
                    realmMsg.push(`【九秘共鸣】`);
                    
                    if (learnedMijue >= 9) {
                        realmMsg.push(
                            `九秘齐鸣，万道合一！`,
                            `${attacker.名号}身后浮现九大天尊虚影，`,
                            `临、兵、斗、者、皆、数、组、前、行九字真言照亮永恒！`,
                        );
                    } else if (learnedMijue >= 7) {
                        realmMsg.push(
                            `七秘共振，映照诸天！`,
                            `${attacker.名号}周身${learnedMijue}道天尊符文闪耀，`,
                            `大道锁链崩断之声震彻万古星空！`
                        );
                    } else if (learnedMijue >= 4) {
                        realmMsg.push(
                            `四秘交织，异象纷呈！`,
                            `${attacker.名号}体内${learnedMijue}种秘术本源共鸣，`,
                            `演化九十九重天，无量仙阙等无上异象！`
                        );
                    } else {
                        realmMsg.push(
                            `秘术初鸣，大道涟漪！`,
                            `${attacker.名号}体内${learnedMijue}种秘术本源轻轻颤动，`,
                            `初窥九秘合一的无上大道！`
                        );
                    }
                }
                
                msg.push(realmMsg.join('\n'));
            }
        }
    }
}
}
// 统一的技能效果处理对象
const 技能效果处理 = {
  // 时牌定身 - 木之本樱
  "时牌定身": function(attacker, defender, msg, skill) {
    defender.dongjie = true; 
    let processedMsg1 = skill.msg1.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    let processedMsg2 = skill.msg2.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    msg.push(attacker.名号 + processedMsg1 + defender.名号 + processedMsg2);
  },
  
  // 神魔夺取 - 终焉神魔体
  "神魔夺取": function(attacker, defender, msg, skill) {
    let godDemonMsg = [];
    
    // 禁锢效果
    defender.dongjie = true;
    let processedMsg1 = skill.msg1.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    let processedMsg2 = skill.msg2.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    godDemonMsg.push(processedMsg1);
    godDemonMsg.push(processedMsg2);
    
    // 三维夺取效果
    if (Math.random() > 0.1) {
      // 计算夺取比例
      let 夺取比例 = skill.全属性夺取 || 0.25;
      
      // 计算夺取数值
      let 夺取攻击 = Math.floor(defender.攻击 * 夺取比例);
      let 夺取防御 = Math.floor(defender.防御 * 夺取比例);
      let 夺取血量 = Math.floor(defender.当前血量 * 夺取比例);
      
      // 执行夺取
      defender.攻击 = Math.max(defender.攻击 - 夺取攻击, 0);
      defender.防御 = Math.max(defender.防御 - 夺取防御, 0);
      defender.当前血量 = Math.max(defender.当前血量 - 夺取血量, 0);
      
      attacker.攻击 += 夺取攻击;
      attacker.防御 += 夺取防御;
      attacker.当前血量 += 夺取血量;
      
      godDemonMsg.push(`${attacker.名号}发动「神魔终焉劫」，掌心浮现神魔轮盘`);
      godDemonMsg.push(`诸天法则被改写，${defender.名号}的三维属性被强行剥夺`);
      godDemonMsg.push(`攻击：${defender.名号}-${bigNumberTransform(夺取攻击)} → ${attacker.名号}+${bigNumberTransform(夺取攻击)}`);
      godDemonMsg.push(`防御：${defender.名号}-${bigNumberTransform(夺取防御)} → ${attacker.名号}+${bigNumberTransform(夺取防御)}`);
      godDemonMsg.push(`生命：${defender.名号}-${bigNumberTransform(夺取血量)} → ${attacker.名号}+${bigNumberTransform(夺取血量)}`);
      
      // 终焉之力效果
      if (Math.random() > 0.1) {
        let 终焉伤害 = Math.floor(夺取攻击 + 夺取防御 + 夺取血量);
        defender.当前血量 = Math.max(defender.当前血量 - 终焉伤害, 0);
        godDemonMsg.push(`${attacker.名号}将夺取的三维属性转化为终焉之力，对${defender.名号}造成额外${bigNumberTransform(终焉伤害)}点伤害`);
      }
    }
    
    // 将消息加入msg数组
    msg.push(...godDemonMsg);
  },
  
  // 锦绣山河 - 大成·荒古圣体
  "锦绣山河": function(attacker, defender, msg, skill) {
    let godDemonMsg = [];
    let processedMsg1 = skill.msg1.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    let processedMsg2 = skill.msg2.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    godDemonMsg.push(processedMsg1);
    godDemonMsg.push(processedMsg2);
    
    // 应用属性削减
    const debuff = 0.8;
    defender.攻击 = Math.round(defender.攻击 * debuff);
    defender.防御 = Math.round(defender.防御 * debuff);
    defender.当前血量 = Math.round(defender.当前血量 * debuff);
    
    msg.push(...godDemonMsg);
    msg.push(`${defender.名号}全属性下降20%！`);
  },
  
  // 圣体异象 - 大成·荒古圣体
  "圣体异象": function(attacker, defender, msg, skill) {
    let godDemonMsg = [];
    let processedMsg1 = skill.msg1.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    let processedMsg2 = skill.msg2.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    godDemonMsg.push(processedMsg1);
    godDemonMsg.push(processedMsg2);
    
    // 应用属性提升
    attacker.攻击 *= 3;
    attacker.防御 *= 3;
    attacker.当前血量 *= 3;
    
    msg.push(...godDemonMsg);
    msg.push(`${attacker.名号}全属性提升三倍！`);
  },
  
  // 三灾六劫天人五衰 - 极道天魔
  "三灾六劫天人五衰": function(attacker, defender, msg, skill) {
    // 创建技能消息数组
    const godDemonMsg = [];
    
    // 禁锢效果
    defender.dongjie = true;
    
    // 处理消息文本
    const processedMsg1 = skill.msg1.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    const processedMsg2 = skill.msg2.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    godDemonMsg.push(processedMsg1);
    godDemonMsg.push(processedMsg2);
    
    // 99%概率触发效果
    if (Math.random() > 0.01) {
        // 计算效果数值
        const 伤害 = Math.floor(defender.当前血量 * 0.2);
        const 减少防御 = Math.floor(defender.防御 * 0.2);
        const 减少攻击 = Math.floor(defender.攻击 * 0.2);
        
        // 应用效果（确保不低于0）
        defender.当前血量 = Math.max(defender.当前血量 - 伤害, 0);
        defender.防御 = Math.max(defender.防御 - 减少防御, 0);
        defender.攻击 = Math.max(defender.攻击 - 减少攻击, 0);
        
        // 构建详细战斗消息
        const battleMsg = `${attacker.名号}发动「三灾六劫天人五衰」，${defender.名号}的顶上三花胸中五气都被削掉！` +
            `${defender.名号}损失了${bigNumberTransform(伤害)}点生命，攻击降低了${bigNumberTransform(减少攻击)}点，防御降低了${bigNumberTransform(减少防御)}点` +
            `${defender.名号}当前状态：` +
            ` 生命：${bigNumberTransform(defender.当前血量)}` +
            ` 攻击：${bigNumberTransform(defender.攻击)}` +
            ` 防御：${bigNumberTransform(defender.防御)}`;
        
        msg.push(battleMsg);
    }
    
    // 将技能消息加入主消息数组
    msg.push(...godDemonMsg);
  },
  
  // 混沌开天 - 混沌体
  "混沌开天": function(attacker, defender, msg, skill) {
    // 禁锢效果
    defender.dongjie = true;
    
    // 处理消息文本
    const processedMsg1 = skill.msg1.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    const processedMsg2 = skill.msg2.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    msg.push(processedMsg1);
    msg.push(processedMsg2);
    
    // 混沌侵蚀效果
    const 侵蚀比例 = skill.混沌侵蚀 || 0.3;
    const 减少攻击 = Math.floor(defender.攻击 * 侵蚀比例);
    const 减少防御 = Math.floor(defender.防御 * 侵蚀比例);
    const 减少血量 = Math.floor(defender.当前血量 * 侵蚀比例);
    
    defender.攻击 = Math.max(defender.攻击 - 减少攻击, 0);
    defender.防御 = Math.max(defender.防御 - 减少防御, 0);
    defender.当前血量 = Math.max(defender.当前血量 - 减少血量, 0);
    
    msg.push(`${defender.名号}道基受损，全属性下降${侵蚀比例 * 100}%！`);
    msg.push(`攻击：-${bigNumberTransform(减少攻击)}`);
    msg.push(`防御：-${bigNumberTransform(减少防御)}`);
    msg.push(`生命：-${bigNumberTransform(减少血量)}`);
  },
  
  // 圣胎共鸣 - 先天圣体道胎
  "圣胎共鸣": function(attacker, defender, msg, skill) {
    // 处理消息文本
    const processedMsg1 = skill.msg1.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    const processedMsg2 = skill.msg2.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    msg.push(processedMsg1);
    msg.push(processedMsg2);
    
    // 属性提升效果
    const 提升比例 = skill.属性提升 || 5;
    const 原始攻击 = attacker.攻击;
    const 原始防御 = attacker.防御;
    const 原始血量 = attacker.当前血量;
    
    attacker.攻击 = Math.floor(attacker.攻击 * 提升比例);
    attacker.防御 = Math.floor(attacker.防御 * 提升比例);
    attacker.当前血量 = Math.floor(attacker.当前血量 * 提升比例);
    
    msg.push(`${attacker.名号}战力暴涨${(提升比例 - 1) * 100}%！`);
    msg.push(`攻击：${bigNumberTransform(原始攻击)} → ${bigNumberTransform(attacker.攻击)}`);
    msg.push(`防御：${bigNumberTransform(原始防御)} → ${bigNumberTransform(attacker.防御)}`);
    msg.push(`生命：${bigNumberTransform(原始血量)} → ${bigNumberTransform(attacker.当前血量)}`);
  },
  
  // 三元归一 - 先天混沌圣体道胎
  "三元归一": function(attacker, defender, msg, skill) {
    // 处理消息文本
    const processedMsg1 = skill.msg1.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    const processedMsg2 = skill.msg2.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    msg.push(processedMsg1);
    msg.push(processedMsg2);
    
    // 属性提升效果
    const 提升比例 = skill.属性提升 || 3;
    const 原始攻击 = attacker.攻击;
    const 原始防御 = attacker.防御;
    const 原始血量 = attacker.当前血量;
    
    attacker.攻击 = Math.floor(attacker.攻击 * 提升比例);
    attacker.防御 = Math.floor(attacker.防御 * 提升比例);
    attacker.当前血量 = Math.floor(attacker.当前血量 * 提升比例);
    
    msg.push(`攻击：${bigNumberTransform(原始攻击)} → ${bigNumberTransform(attacker.攻击)}`);
    msg.push(`防御：${bigNumberTransform(原始防御)} → ${bigNumberTransform(attacker.防御)}`);
    msg.push(`生命：${bigNumberTransform(原始血量)} → ${bigNumberTransform(attacker.当前血量)}`);
  }
};

// 特殊技能处理函数
function handleSpecialSkills(attacker, defender, msg, teshujineng) {
  for (var i = 0; i < teshujineng.length; i++) {
    if (teshujineng[i].cnt === 0) continue;
    
    if (attacker.灵根 && attacker.灵根.name === teshujineng[i].name) {
      let Random = Math.random();
      
      if (Random < teshujineng[i].pr) {
        // 调用对应的效果处理函数
        const effectHandler = 技能效果处理[teshujineng[i].效果类型];
        if (effectHandler) {
          effectHandler(attacker, defender, msg, teshujineng[i]);
        } else {
          // 默认处理
          let processedMsg1 = teshujineng[i].msg1.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
          let processedMsg2 = teshujineng[i].msg2.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
          msg.push(processedMsg1);
          msg.push(processedMsg2);
        }
        
        if (teshujineng[i].cnt > 0) {
          teshujineng[i].cnt--;
        }
        
        break;
      }
    }
  }
}
export async function zd_battle(AA_player, BB_player) {
  let A_player = JSON.parse(JSON.stringify(BB_player));
  let B_player = JSON.parse(JSON.stringify(AA_player));
// 初始化负面效果
A_player.fumianhuihe = 0; // 负面效果剩余回合数
A_player.fumian_damage = 0; // 每回合伤害
A_player.fumian_type = null; // 负面效果类型
B_player.fumianhuihe = 0;
B_player.fumian_damage = 0;
B_player.fumian_type = null;
  let cnt = 0; //回合数
  let cnt2;
  let A_xue = 0; //最后要扣多少血
  let B_xue = 0;
  let t;
  let msg = [];
  let jineng1 = data.jineng1;
  let jineng2 = data.jineng2;
  let jineng3 = data.jineng3; 
  let teshujineng = data.teshujineng;
  let A_immune_control = 0; // A玩家免疫控制剩余回合数
  let B_immune_control = 0; // B玩家免疫控制剩余回合数
  let A_immune_type = null; // A玩家免疫控制类型
  let B_immune_type = null; // B玩家免疫控制类型
let A_临字秘加成 = 0; // A玩家临字秘加成
let B_临字秘加成 = 0; // B玩家临字秘加成
let A_临字秘触发 = false; // A玩家临字秘触发状态
let B_临字秘触发 = false; // B玩家临字秘触发状态
  let A_revived = false;
  let B_revived = false;
  let fenshen = ["【仙帝】他化自在法", "一气化三清"]; // 定义分身功法
  let huifu = ["者字秘"]; // 定义恢复类功法
  let healMessages = []; // 初始化为空数组
  let A_fenshen = null; // A玩家的分身
  let B_fenshen = null; // B玩家的分身
  let A_fenshen_duration = 0; // A分身持续回合数
  let B_fenshen_duration = 0; // B分身持续回合数
  let emperorFieldTriggered = false;
  let emperorWeaponTriggered = false;
  let 轮回诸天拳触发 = false;

const timeRiverAvatars = [
  { name: "叶天帝", skill: "天帝拳", desc: "拳震万古，压塌诸天" },
  { name: "狠人大帝", skill: "一念花开", desc: "君临天下，万道哀鸣" },
  { name: "柳神", skill: "柳神法", desc: "祭灵之力，守护苍生" },
  { name: "无始大帝", skill: "无始术", desc: "时间倒流，镇压永恒" },
  { name: "鲲鹏王", skill: "鲲鹏宝术", desc: "阴阳逆转，撕裂虚空" },
  { name: "雷帝", skill: "雷帝宝术", desc: "九天神雷，湮灭万界" }
];
  // 定义统一的攻击处理函数，attacker是攻击者 defender是防御者
  async function performAttack(attacker, defender, cnt2, context = "main") {
    //  此处检查回合轮到攻击者有无控制状态
const isImmune = (attacker === A_player && A_immune_control > 0) || 
                 (attacker === B_player && B_immune_control > 0);

if (attacker.dongjie) {
    if (isImmune) {
        // 免疫控制，解除冻结状态
        attacker.dongjie = false;
        const immuneType = (attacker === A_player ? A_immune_type : B_immune_type) || "涅槃真火护体";
        msg.push(`${attacker.名号}的${immuneType}效果免疫了冻结状态！`);
    } else {
        // 没有免疫效果，处理冻结状态
        if (context !== "fenshen") {
            msg.push(`${attacker.名号}无法动弹！`);
            attacker.dongjie = false;
            return null;
        }
    }
}

     let baoji = baojishanghai(attacker.暴击率);
  let isCritical = baoji > 1; // 是否暴击
  // 处理仙帝压制效果
    handleControlEffects( A_immune_control, B_immune_control, A_player,B_player,attacker,cnt, defender, msg,emperorFieldTriggered,context,cnt2,A_临字秘触发,B_临字秘触发,A_临字秘加成,B_临字秘加成)
 // 处理帝兵效果
    handleEmperorWeapon(attacker, defender, msg,emperorWeaponTriggered);
 // 处理圆神效果
    handleCircularGod(attacker, defender, msg, context);

// 处理特殊技能效果
handleSpecialSkills(attacker, defender, msg, teshujineng,emperorFieldTriggered)
  // 彼岸·命运神道体技能
if (attacker.灵根 && attacker.灵根.name === "彼岸·命运神道体" && 轮回诸天拳触发 == false) {
  轮回诸天拳触发 = true;
  
  // 先定义 godDemonMsg 数组，确保它在所有分支中都存在
  let godDemonMsg = [];
  
  if (Math.random() > 0.01) {
    // 禁锢效果
    defender.dongjie = true;
    godDemonMsg.push(`所有法，所有名，所有往来朝夕皆如土！`);
    godDemonMsg.push(`${attacker.名号}身与魂轮回诸天归来！祂自出世以来游历无穷混沌海未曾一败，在此刻意气神已经到达了顶峰，超脱了彼岸`);
    godDemonMsg.push(`无穷的拳意世界重重而立，巍峨神殿压迫而来，诸天命运生死轮盘浮现！`);
    godDemonMsg.push(`真实与虚妄在不断倒转，万千神魔撕裂虚空而来，此刻${attacker.名号}端坐九重天上仿佛至高天帝，${defender.名号}被恐怖的神意压制无法动弹！`);
    // 三维夺取效果
    if (Math.random() > 0.01) {
      let 夺取比例 = 0.5;
      let 夺取攻击 = Math.floor(defender.攻击 * 夺取比例);
      let 夺取防御 = Math.floor(defender.防御 * 夺取比例);
      let 夺取血量 = Math.floor(defender.当前血量 * 夺取比例);
      
      defender.攻击 = Math.max(defender.攻击 - 夺取攻击, 0);
      defender.防御 = Math.max(defender.防御 - 夺取防御, 0);
      defender.当前血量 = Math.max(defender.当前血量 - 夺取血量, 0);
      
      godDemonMsg.push(`${defender.名号}受到诸天生死轮盘压制，一身气势在克泄，神与意都将被磨灭`);
      godDemonMsg.push(`攻击：${defender.名号}-${夺取攻击}`);
      godDemonMsg.push(`防御：${defender.名号}-${夺取防御}`);
      godDemonMsg.push(`生命：${defender.名号}-${夺取血量}`);
    }

    godDemonMsg.push(`轮回诸天拳第九重，诛天灭地！`);
    godDemonMsg.push(`${attacker.名号}断喝一声！音声撕裂了无穷大千宇宙，意气爆发，递出恐怖一拳，锁定了无穷时空变量，覆盖了一切概念！`);

    // 终焉之力效果
    if (Math.random() > 0.01) {
      let 夺取比例 = 0.5;
      let 夺取攻击 = Math.floor(defender.攻击 * 夺取比例);
      let 夺取防御 = Math.floor(defender.防御 * 夺取比例);
      let 夺取血量 = Math.floor(defender.当前血量 * 夺取比例);
      let 终焉伤害 = Math.floor(夺取攻击 + 夺取防御 + 夺取血量) + attacker.攻击 * 100;
      
      defender.当前血量 = Math.max(defender.当前血量 - 终焉伤害, 0);
      godDemonMsg.push(`${defender.名号}眼眸刹那晦暗，意识在无尽冰冷的黑暗中不断下坠，被轮回诸天拳打的当空炸开！存在的概念都被磨灭殆尽了，失去了${bigNumberTransform(终焉伤害)}生命，当前血量${bigNumberTransform(defender.当前血量)}`);

      // 击败检查
      if (defender.当前血量 <= 0) {
        const canRevive = defender.学习的功法?.some(gongfa => 
          ["涅槃仙功", "圆神"].includes(gongfa)
        ) && !(defender === A_player ? A_revived : B_revived);

        if (canRevive) {
          const 最大血量 = defender.血量上限;
          defender.当前血量 = Math.trunc(最大血量 * 0.5);
          if (defender === A_player) A_revived = true;
          else B_revived = true;
          
          godDemonMsg.push(`然而${defender.名号}体内涅槃真火突然爆发！`);
          godDemonMsg.push(`「纵使轮回千百世，我亦不灭！」`);
          godDemonMsg.push(`${defender.名号}浴火重生，恢复${bigNumberTransform(最大血量 * 0.5)}点生命！`);
        } else {
          godDemonMsg.push(`「这一世，你败了。」${attacker.名号}收拳而立，眸光冰冷`);
          godDemonMsg.push(`${defender.名号}的道果被彻底磨灭，再无重生可能！`);
          
          msg = msg.concat(godDemonMsg);
          cnt += godDemonMsg.length;
          
          return { 
            msg, 
            battleEnded: true,
            winner: attacker === A_player ? "A" : "B"
          };
        }
      }
    }
  } else {
    // 随机数≤0.01时的处理
    godDemonMsg.push(`${attacker.名号}试图施展轮回诸天拳，但天地法则突然紊乱，招式未能成形！`);
  }

  // 确保无论如何都会执行的消息合并
  msg = msg.concat(godDemonMsg);
  cnt += godDemonMsg.length;
}




    // 5. 基础伤害计算 - 先应用暴击倍率
  let 基础伤害 = Harm(attacker.攻击 * 0.85, defender.防御);
  let 暴击伤害 = Math.trunc(基础伤害 * baoji); // 应用暴击倍率
  let 法球伤害 = Math.trunc(attacker.攻击 * attacker.法球倍率);
  let 伤害 = 暴击伤害 + 法球伤害 ;


  

    // 6. 仙宠效果
    if (isNotNull(attacker.仙宠)) {
      if (attacker.仙宠.type == '暴伤') baoji += attacker.仙宠.加成;
      else if (attacker.仙宠.type == '战斗') {
        let ran = Math.random();
        if (ran < 0.35) {
          attacker.攻击 += Math.trunc(attacker.攻击 * attacker.仙宠.加成);
          attacker.防御 += Math.trunc(attacker.防御 * attacker.仙宠.加成);
          attacker.当前血量 += Math.trunc(attacker.当前血量 * attacker.仙宠.加成);
          msg.push(`仙宠【${attacker.仙宠.name}】辅佐了${attacker.名号}，使其伤害增加了${Math.trunc(attacker.仙宠.加成 * 100)}%防御增加了${Math.trunc(attacker.仙宠.加成 * 100)}%血量增加了${Math.trunc(attacker.仙宠.加成 * 100)}%`);
        }
      }
    }
     
    // 7. 武器效果
    if (isNotNull(attacker.id)) {
      let equipment = await Read_equipment(attacker.id);
      let ran = Math.random();
         if (equipment.法宝.name == '万灵天图' && ran > 0.1) {
        // 计算护盾值（40%血量）
        const shieldValue = Math.trunc( attacker.血量上限 * 0.4);
        attacker.护盾值 = shieldValue;
        msg.push(` 【万灵天图·诸天护体】`);
        msg.push(` ${attacker.名号}祭出万灵天图，天图展开，万灵显化：真龙盘绕，神凰展翅，鲲鹏击天！`);
        msg.push(` 诸天符文流转，演化无上防御：万灵护体，诸邪不侵！`);
        msg.push(` 一道混沌光幕笼罩${attacker.名号}，凝聚万灵之力（护盾值+${shieldValue}）`);
    }
if (equipment.护具.name == '星辰袍' && ran > 0.15) {
    // 星辰袍效果一：周天星斗护体
    const shieldValue = Math.trunc(attacker.血量上限 * 0.35);
    attacker.护盾值 = (attacker.护盾值 || 0) + shieldValue;
    
    // 星辰袍效果二：星辰之力加持
    const defenseBoost = Math.trunc(attacker.防御 * 0.5);
    attacker.防御 += defenseBoost;
    
    msg.push(`【星辰袍·周天星斗护体】`);
    msg.push(`${attacker.名号}身披星辰袍，引动周天星斗之力！`);
    msg.push(`三百六十五颗主星同时亮起，垂落无尽星辉，结成周天星斗大阵！`);
    msg.push(`星辰之力凝聚成不灭护盾，万法不侵（护盾值+${shieldValue}）`);
    msg.push(`星辉淬体，防御力大幅提升（防御+${defenseBoost}）`);
    
    // 星辰袍效果三：星辰反噬（概率触发）
    if (ran > 0.85) {
        const counterDamage = Math.trunc(defender.攻击 * 0.8);
        defender.当前血量 = Math.max(defender.当前血量 - counterDamage, 0);
        
        msg.push(`【星辰反噬·星陨天罚】`);
        msg.push(`周天星斗大阵逆转，星辰之力化作毁灭光束！`);
        msg.push(`一道璀璨星芒贯穿虚空，直击${defender.名号}！`);
        msg.push(`星辰反噬造成${counterDamage}点伤害！`);
    }
}
      if (equipment.武器.name == '紫云剑' && ran > 0.7) {
        attacker.攻击 *= 3;
        msg.push(`${attacker.名号}触发了紫云剑被动,攻击力提高了200%`);
      } else if (equipment.武器.name == '炼血竹枪' && ran > 0.75) {
        attacker.攻击 *= 2;
        attacker.当前血量 = Math.trunc(attacker.当前血量 * 1.2);
        msg.push(`${attacker.名号}触发了炼血竹枪被动,攻击力提高了100%,血量回复了20%`);
      } else if (equipment.武器.name == '少阴玉剑' && ran > 0.75) {
        attacker.当前血量 = Math.trunc(attacker.当前血量 * 1.4);
        msg.push(`${attacker.名号}触发了少阴玉剑被动,血量回复了40%`);
      } else if (equipment.武器.name == '荒剑' &&(attacker.mijinglevel_id>20||attacker.xiangulevel_id>20)&& ran > 0.75) {
        let 武器伤害 = attacker.攻击 * attacker.法球倍率 * 100;
        defender.当前血量 = Math.max(defender.当前血量 - 武器伤害, 0);
        msg.push(`${attacker.名号}眼眸开阖间挥动帝剑，煌煌剑光仿佛截断了永恒，斩开了时间长河，无穷大宇宙都在这一剑的滔天伟力下毁灭了，${defender.名号}在过去现在未来都受到了这毁天灭地的一击，仙躯与元神瞬间炸开！失去了${bigNumberTransform(武器伤害)}点血量,${defender.名号}当前血量${defender.当前血量}`);
            if (defender.当前血量 <= 0) {
  const 复活结果 = checkRevival(defender, "main");
  if (复活结果.revived) {
    msg.push(复活结果.message);
  } else {
    msg.push(`${attacker.名号}击败了${defender.名号}`);
    return { 
            msg, 
            battleEnded: true,
            winner: attacker === A_player ? "A" : "B"
          };
  }
}
      }  // 新增：如梦的诸天棋盘特殊效果
  if (equipment.帝兵.name === "如梦的诸天棋盘" ) {
    msg.push(`「诸天为盘，众生为子！」${attacker.名号}轻语，抬手间祭出如梦的诸天棋盘`);
    msg.push(`棋盘上星罗棋布，每一颗棋子都映照着一方大千世界`);
    msg.push(`一道贯穿古今未来的光芒从棋盘射出，锁定${defender.名号}的所有时空存在，刹那间，风不转，云不动，一切都静止了`);
    msg.push(`「这一局，你输了。」${attacker.名号}落下一枚黑子，诸天震动！`);
    
    // 直接抹杀，无视任何复活效果
    defender.当前血量 = 0;
    msg.push(`${defender.名号}的存在痕迹被从所有时间线上彻底抹除！`);
    return { msg }; // 提前结束战斗
    
  }
    }

// 8. 技能1（攻击方技能）处理
let count = 0;
let Random = Math.random();
let 不可防御 = false; // 新增：用于标记是否触发不可防御技能
let 不可复活 = false; // 新增：用于标记是否触发不可防御技能
for (var i = 0; i < jineng1.length; i++) {

  // 分身不能触发分身技能
  if (context === "fenshen" && fenshen.includes(jineng1[i].name)) {
    continue;
  }
    let actualPr = jineng1[i].pr;
    
    if (attacker === A_player) {
        actualPr += A_临字秘加成;
    } else {
        actualPr += B_临字秘加成;
    }
  if (
    (jineng1[i].class == '常驻' &&
      (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
      Random < jineng1[i].pr) ||
    (attacker.学习的功法 &&
      jineng1[i].class == '功法' &&
      attacker.学习的功法.indexOf(jineng1[i].name) > -1 &&
      (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
      Random < jineng1[i].pr) ||
    (attacker.灵根 &&
      jineng1[i].class == '灵根' &&
      attacker.灵根.name == jineng1[i].name &&
      (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
      Random < jineng1[i].pr)
  ) {
    // 处理消息文本中的"他"和"对手"替换
    let processedMsg1 = jineng1[i].msg1.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    let processedMsg2 = jineng1[i].msg2.replace(/他/g, attacker.名号).replace(/对手/g, defender.名号);
    
    if (jineng1[i].msg2 == '') {
      msg.push(attacker.名号 + processedMsg1);
    } else {
      msg.push(attacker.名号 + processedMsg1 + defender.名号 + processedMsg2);
    }
    
    // 检查是否是不可防御技能
    if (jineng1[i].不可防御 === 1) {
      不可防御 = true;
    }
    // 检查是否是不可复活技能
    if (jineng1[i].不可复活 === 1) {
      不可复活 = true;
      defender.不可复活 = true;
    }
        // 检查是否是不可复活技能
    if (jineng1[i].控制 === 1) {
     defender.dongjie = true; 
    }
       if (jineng1[i].负面效果) {
    defender.fumianhuihe = jineng1[i].负面回合; // 负面效果持续回合
    defender.fumian_damage = Math.trunc(伤害 * jineng1[i].beilv + jineng1[i].other); // 计算每回合伤害
    defender.fumian_type = jineng1[i].负面类型; // 设置负面效果类型
}

    伤害 = 伤害 * jineng1[i].beilv + jineng1[i].other;
    count++;
    if (count == 3) break;
  }
}
// 9. 技能2（防御方技能）处理
// 只有没有触发不可防御技能时，才处理防御方技能
if (!不可防御) {
  let 反弹伤害 = 0;
  let random = Math.random();
  let 已触发技能 = false;
  
  // 按优先级排序技能（优先级数值越小优先级越高）
  const sortedSkills = [...jineng2].sort((a, b) => (a.优先级 || 999) - (b.优先级 || 999));
  
  for (var i = 0; i < sortedSkills.length; i++) {
    const skill = sortedSkills[i];
 let actualPr = skill.pr;
    
    if (defender === A_player) {
        actualPr += A_临字秘加成;
    } else {
        actualPr += B_临字秘加成;
    }
    if (
      (defender.学习的功法 &&
        skill.class == '功法' &&
        defender.学习的功法.indexOf(skill.name) > -1 &&
        (cnt2 == skill.cnt || skill.cnt == -1) &&
        random < skill.pr) ||
      (defender.灵根 &&
        skill.class == '灵根' &&
        defender.灵根.name == skill.name &&
        (cnt2 == skill.cnt || skill.cnt == -1) &&
        random < skill.pr)
    ) {
      // 显示技能消息
      if (skill.msg1 == '') {
        msg.push(attacker.名号 + skill.msg2);
      } else if (skill.msg2 == '') {
        msg.push(defender.名号 + skill.msg1);
      } else {
        msg.push(defender.名号 + skill.msg1 + attacker.名号 + skill.msg2);
      }
       // 检查是否有负面效果可转移
    if (skill.负面转移&&defender.fumianhuihe > 0) {
        // 转移负面效果
        attacker.fumianhuihe = defender.fumianhuihe;
        attacker.fumian_damage = defender.fumian_damage;
        attacker.fumian_type = defender.fumian_type;
        
        // 清除自身负面效果
        defender.fumianhuihe = 0;
        defender.fumian_damage = 0;
        defender.fumian_type = null;
        
        // 添加转移消息
        msg.push(`${defender.名号}成功将${attacker.fumian_type}效果转移给${attacker.名号}！`);
        msg.push(`${attacker.名号}将承受${attacker.fumianhuihe}回合的${attacker.fumian_type}效果！`);
        
    }

       // ==== 处理反弹伤害 ====
      if (skill.反弹伤害) {
        defender.反弹比例 = skill.反弹伤害;
        
        // 计算反弹伤害（基于原始伤害）
        反弹伤害 = Math.floor(伤害 * defender.反弹比例);
        
        // 记录攻击者原始血量
        const 攻击者原始血量 = attacker.当前血量;
        
        // 应用反弹伤害到攻击者
        attacker.当前血量 = Math.max(attacker.当前血量 - 反弹伤害, 0);
        
        // 计算攻击者实际损失血量
        const 攻击者损失血量 = 攻击者原始血量 - attacker.当前血量;
        
        
              // 应用伤害倍率
      伤害 = 伤害 * skill.beilv + skill.other;
               
        // 显示攻击者血量变化
        msg.push(`  ${attacker.名号}受到${bigNumberTransform(反弹伤害)}点反弹伤害！`);
        msg.push(`  ${defender.名号}当前生命${bigNumberTransform(defender.当前血量)}，${attacker.名号}当前生命：${bigNumberTransform(攻击者原始血量)} → ${bigNumberTransform(attacker.当前血量)} (减少${bigNumberTransform(攻击者损失血量)})`);
        

      }
      
      // 应用伤害倍率
      伤害 = 伤害 * skill.beilv + skill.other;
      
      // 标记已触发技能
      已触发技能 = true;
      
      // 只触发一个技能（优先级最高的）
      break;
    }
  }
  
  // 如果没有触发任何技能，添加默认消息
  if (!已触发技能) {
    msg.push(`${defender.名号}未能触发任何防御技能！`);
  }
} else {
  // 可选：添加一条消息说明防御被无视
  msg.push(`${defender.名号}的防御手段被${attacker.名号}的攻击神通完全压制！`);
}
    // 10. 魔道值/神石加成
    let buff = 1;
    if (attacker.魔道值 > 999 && attacker.灵根.type == '魔头') {
      buff += Math.trunc(attacker.魔道值 / 1000) / 100;
      if (buff > 1.3) buff = 1.3;
           msg.push(
        `魔道值为${attacker.名号}提供了${Math.trunc((buff - 1) * 100)}%的增伤`
      );
    }
    if (defender.魔道值 < 1 && defender.灵根.type == '转生' ) {
      let buff2 = defender.神石 * 0.0015;
      if (buff2 > 0.3) buff2 = 0.3;
      buff -= buff2;
      msg.push(
        `神石为${defender.名号}提供了${Math.trunc(buff2 * 100)}%的减伤`
      );
    }
  if (attacker.魔道值 > 999 && attacker.灵根.type == '天魔') {
      buff += Math.trunc(attacker.魔道值 / 1000) / 100;
      if (buff > 1.3) buff = 1.3;
      if (attacker.灵根.name == '极道天魔') buff += 0.3;
      msg.push(
        `${attacker.名号}将魔道之力转化为邪神之力，获得了${Math.trunc((buff - 1) * 100)}%的增伤`
      );
    }
    if (defender.魔道值 < 1 && defender.灵根.type == '命运' ) {
      let buff2 = defender.神石 * 0.0015;
      if (buff2 > 0.3) buff2 = 0.3;
      if (defender.灵根.name == '命运神道体') buff2 += 0.3;
      buff -= buff2;
            msg.push(
        `${defender.名号}将神石之力转化为命运之力，获得了${Math.trunc(buff * 100)}%的减伤`
      );
    }

    伤害 = Math.trunc(伤害 * buff);
    
    return { 伤害, isCritical, baoji }; 
  }
  
  // 统一的伤害应用函数
  function applyDamage(defender, 伤害, context) {
    let fenshen_blocked = false;
    let actual_damage = 伤害;
  // ==== 护盾抵消 ====
  if (defender.护盾值 > 0) {
    if (defender.护盾值 >= actual_damage) {
      defender.护盾值 -= actual_damage;
      actual_damage = 0;
      msg.push(` ${defender.名号}的护盾抵消了${bigNumberTransform(actual_damage)}点伤害！`);
    } else {
      actual_damage -= defender.护盾值;
      msg.push(` ${defender.名号}的护盾抵消${bigNumberTransform(defender.护盾值)}点伤害！`);
      defender.护盾值 = 0;
    }
  }
   // ==== 分身抵挡 ====
  if (context !== "fenshen" && defender.分身 && defender.分身.length > 0) {
    // 优先选择血量最高的分身抵挡
    const activeFenshen = defender.分身
      .filter(f => f.当前血量 > 0)
      .sort((a, b) => b.当前血量 - a.当前血量);
    
    if (activeFenshen.length > 0) {
      const shieldFenshen = activeFenshen[0];
      const originalDmg = actual_damage;
      
      if (shieldFenshen.当前血量 >= actual_damage) {
        shieldFenshen.当前血量 -= actual_damage;
        actual_damage = 0;
        msg.push(
          `${shieldFenshen.名号}挺身阻挡攻击！`,
          `分身承受${bigNumberTransform(originalDmg)}点伤害`
        );
      } else {
        actual_damage -= shieldFenshen.当前血量;
        msg.push(
          `${shieldFenshen.名号}化作星尘消散！`,
          `抵消${bigNumberTransform(shieldFenshen.当前血量)}点伤害`
        );
        shieldFenshen.当前血量 = 0;
      }
      fenshen_blocked = true;
    }
  }
    // 检查是否有分身抵挡
    if (context !== "fenshen") { // 分身攻击不能触发分身抵挡
      if (defender === A_player && A_fenshen) {
        let blocked_damage = Math.trunc(伤害 * 1);
        A_fenshen.当前血量 -= blocked_damage;
        actual_damage = 伤害 - blocked_damage;
        fenshen_blocked = true;
        msg.push(`${A_fenshen.名号}为${defender.名号}抵挡了${bigNumberTransform(blocked_damage)}点伤害！`);
        
        if (A_fenshen.当前血量 <= 0) {
          msg.push(`${A_fenshen.名号}承受了致命伤害，消散在虚空中！`);
          A_fenshen = null;
        }
      } 
      else if (defender === B_player && B_fenshen) {
        let blocked_damage = Math.trunc(伤害 * 0.8);
        B_fenshen.当前血量 -= blocked_damage;
        actual_damage = 伤害 - blocked_damage;
        fenshen_blocked = true;
        msg.push(`${B_fenshen.名号}为${defender.名号}抵挡了${bigNumberTransform(blocked_damage)}点伤害！`);
        
        if (B_fenshen.当前血量 <= 0) {
          msg.push(`${B_fenshen.名号}承受了致命伤害，消散在虚空中！`);
          B_fenshen = null;
        }
      }
    }
    
    // 应用实际伤害
    defender.当前血量 -= actual_damage;
    if (defender.当前血量 < 0) defender.当前血量 = 0;
    
    return { actual_damage, fenshen_blocked };
  }
  
 // 修改createCombatMessage函数
function createCombatMessage(round, attacker, defender, 伤害, actual_damage, isCritical, fenshen_blocked) {
  let message = `第${round + 1}回合：`;
  if (attacker.名号.includes('分身')) {
    message += `${attacker.名号}攻击了${defender.名号}，`;
  } else {
    // 使用isCritical判断暴击
    if (isCritical) {
      message += `${attacker.名号}攻击了${defender.名号}，暴击！造成伤害${bigNumberTransform(伤害)}`;
    } else {
      message += `${attacker.名号}攻击了${defender.名号}，造成伤害${bigNumberTransform(伤害)}`;
    }
  }
  
  if (fenshen_blocked) {
    message += `（分身抵挡后实际伤害${bigNumberTransform(actual_damage)}）`;
  }
  
  message += `，${defender.名号}剩余血量${bigNumberTransform(defender.当前血量)}`;
  
  return message;
}
// 统一的复活检查函数
function checkRevival(player, context = "main") {
  // 1. 检查复活条件
  const 可复活 = 
    context !== "fenshen" && // 分身不能复活
    player.当前血量 <= 0 &&  // 必须已死亡
    player.学习的功法 &&     // 必须有功法
    ((player === A_player && !A_revived) || (player === B_player && !B_revived)); // 未复活过

  if (!可复活|| player.不可复活) {
    return { revived: false };
  }

  // 2. 遍历jineng3数组，检查是否有复活技能满足条件
  for (var i = 0; i < jineng3.length; i++) {
    // 跳过非复活技能
    if (jineng3[i].复活技能 !== 1) {
      continue;
    }

    // 检查是否学习该功法，并且cnt条件满足（复活技能的cnt为-1，所以总是满足）
    if (player.学习的功法 &&
        player.学习的功法.indexOf(jineng3[i].name) > -1 &&
        (cnt2 == jineng3[i].cnt || jineng3[i].cnt == -1)) {
      
      // 注意：复活技能不需要概率检查，因为pr为1，所以总是触发

      // 3. 执行复活
      const 最大血量 = player.血量上限;
      const 恢复比例 = jineng3[i].恢复比例 || 0.5; // 默认为50%
      const 恢复血量 = Math.trunc(最大血量 * 恢复比例);
      player.当前血量 = 恢复血量;
      player.dongjie = false; // 解除控制

      // 4. 设置复活标记和免疫控制
      const 免控回合 = jineng3[i].免控 || 0; // 默认为0回合
      if (player === A_player) {
        A_revived = true;
        if (免控回合 > 0) {
          A_immune_control = 免控回合;
        }
      } else {
        B_revived = true;
        if (免控回合 > 0) {
          B_immune_control = 免控回合;
        }
      }

      // 5. 应用属性加成
      if (jineng3[i].攻击加成 && jineng3[i].攻击加成 > 0) {
        player.攻击 = Math.trunc(player.攻击 * (1 + jineng3[i].攻击加成));
      }
      if (jineng3[i].防御加成 && jineng3[i].防御加成 > 0) {
        player.防御 = Math.trunc(player.防御 * (1 + jineng3[i].防御加成));
      }
      if (jineng3[i].生命加成 && jineng3[i].生命加成 > 0) {
        const 新血量上限 = Math.trunc(player.血量上限 * (1 + jineng3[i].生命加成));
        player.血量上限 = 新血量上限;
        // 按比例调整当前血量
        player.当前血量 = Math.trunc(player.当前血量 * (1 + jineng3[i].生命加成));
      }

      // 6. 构建返回消息
      const 消息 = [];
      // 添加技能描述消息
      if (jineng3[i].msg1) {消息.push(player.名号 + jineng3[i].msg1);} 
      if (jineng3[i].msg2) {消息.push(player.名号 + jineng3[i].msg2);}
      
      // 添加免控消息（如果有免控效果）
      if (免控回合 > 0 && jineng3[i].免控类型 && jineng3[i].免控类型.length > 0) {
        const 随机免控类型 = jineng3[i].免控类型[Math.floor(Math.random() * jineng3[i].免控类型.length)];
         if (player === A_player) {
    A_immune_type = 随机免控类型;
  } else {
    B_immune_type = 随机免控类型;
  }
        消息.push(`${player.名号}获得${随机免控类型}，${免控回合}回合内免疫所有控制效果！`);
      } else if (免控回合 > 0) {
         if (player === A_player) {
    A_immune_type = "涅槃真火护体";
  } else {
    B_immune_type = "涅槃真火护体";
  }
        消息.push(`${player.名号}获得涅槃真火护体，${免控回合}回合内免疫所有控制效果！`);
      }
      // 添加属性加成消息
      let 加成消息 = "";
      if (jineng3[i].攻击加成 > 0) 加成消息 += `攻击+${(jineng3[i].攻击加成 * 100).toFixed(0)}% `;
      if (jineng3[i].防御加成 > 0) 加成消息 += `防御+${(jineng3[i].防御加成 * 100).toFixed(0)}% `;
      if (jineng3[i].生命加成 > 0) 加成消息 += `生命+${(jineng3[i].生命加成 * 100).toFixed(0)}% `;
      if (加成消息 !== "") {
        消息.push(`${player.名号}获得${加成消息.trim()}！`);
      }
      // 添加恢复血量消息
      消息.push(`恢复${bigNumberTransform(恢复血量)}点血量！`);
      return {
        revived: true,
        message: 消息,
        skill: jineng3[i].name
      };
    }
  }
  // 如果没有找到符合条件的复活技能，返回false
  return { revived: false };
}
  // 主战斗循环
  while (A_player.当前血量 > 0 && B_player.当前血量 > 0) {
    cnt2 = Math.trunc(cnt / 2);
    
    // 确定攻击方和防御方
    let attacker, defender;
    if (cnt % 2 === 0) {
      attacker = B_player;
      defender = A_player;
    } else {
      attacker = A_player;
      defender = B_player;
    }

    // 在每回合处理负面效果
if (A_player.fumianhuihe > 0) {
    // 根据负面效果类型显示不同的消息
    let effectMsg = "";
    switch (A_player.fumian_type) {
        case "太阴之力":
            effectMsg = "被太阴之力冰封，生机冻结，元神僵硬";
            break;
        case "火焰风暴":
            effectMsg = "被火焰风暴席卷全身";
            break;
        case "剧毒":
            effectMsg = "被剧毒侵蚀，五脏六腑如被腐蚀";
            break;
        default:
            effectMsg =`受到${A_player.fumian_type}影响`;
    }
    
    A_player.当前血量 -= A_player.fumian_damage;
    A_player.当前血量 = Math.max(A_player.当前血量, 0);
    msg.push(`${A_player.名号}${effectMsg}，损失了${bigNumberTransform(A_player.fumian_damage)}点生命值！`);
    
    A_player.fumianhuihe--;
    if (A_player.fumianhuihe === 0) {
        msg.push(`${A_player.名号}身上的${A_player.fumian_type}效果消失了。`);
        A_player.fumian_type = null;
    }
}

if (B_player.fumianhuihe > 0) {
    let effectMsg = "";
    switch (B_player.fumian_type) {
        case "太阴之力":
            effectMsg = "被太阴之力冰封，生机冻结，元神僵硬";
            break;
        case "火焰风暴":
            effectMsg = "被火焰风暴席卷全身";
            break;
        case "剧毒":
            effectMsg = "被剧毒侵蚀，五脏六腑如被腐蚀";
            break;
        default:
            effectMsg = `受到${B_player.fumian_type}影响`;
    }
    
    B_player.当前血量 -= B_player.fumian_damage;
    B_player.当前血量 = Math.max(B_player.当前血量, 0);
    msg.push(`${B_player.名号}${effectMsg}，损失了${bigNumberTransform(B_player.fumian_damage)}点生命值！`);
    
    B_player.fumianhuihe--;
    if (B_player.fumianhuihe === 0) {
        msg.push(`${B_player.名号}身上的${B_player.fumian_type}效果消失了。`);
        B_player.fumian_type = null;
    }
}
     // 减少免疫控制回合数
  if (A_immune_control > 0) A_immune_control--;
  if (B_immune_control > 0) B_immune_control--;
  

// 显示免疫状态信息 - 根据实际免控类型显示
if (A_immune_control > 0) {
  const immuneType = A_immune_type || "涅槃真火护体";
  msg.push(`${A_player.名号}的${immuneType}效果剩余${A_immune_control}回合`);
}
if (B_immune_control > 0) {
  const immuneType = B_immune_type || "涅槃真火护体";
  msg.push(`${B_player.名号}的${immuneType}效果剩余${B_immune_control}回合`);
}
       // 检查攻击者是否被冻结
  if (attacker.dongjie) {
    msg.push(`${attacker.名号}无法动弹！`);
    attacker.dongjie = false; // 解除冻结状态，以便下一回合行动
    cnt++; // 增加回合计数
    continue; // 跳过本次攻击
  }
    // 处理攻击
    if (!attacker.dongjie) {

 if (attacker.灵根&& attacker.灵根.name === "木之本樱" &&attacker.当前血量 <attacker.血量上限&& Math.random() < 0.55) {
        let 回复血量 = attacker.当前血量 * 0.3;
        attacker.当前血量 = Math.max(attacker.当前血量 + 回复血量, 0);
        msg.push(`${attacker.名号}拿出了爱牌，为自己回复了${bigNumberTransform(回复血量)}点生命,${attacker.名号}当前血量${bigNumberTransform(attacker.当前血量)}`);
    }  
     // 小成圣体技能触发
  if (attacker.灵根?.type == "小成圣体") {
    if (Math.random() < 0.15) {
      msg.push(`${attacker.名号} 撑开了异象锦绣山河，一片不属于此界的天地山河浮现，山河领域笼罩自身，战力暴涨，举手投足间让宇宙中的日月星辰都与之共鸣，绽开无量神光`);
      attacker.当前血量 *= 1.5;
      attacker.防御 *= 1.5;
      attacker.攻击 *= 1.5;
      msg.push(`${attacker.名号}的攻击暴涨到了${bigNumberTransform(attacker.攻击)}，${attacker.名号}的防御暴涨到了${bigNumberTransform(attacker.防御)}，${attacker.名号}的生命暴涨到了${bigNumberTransform(attacker.当前血量)}`);
    }
    
    if (Math.random() < 0.25) {
      msg.push(`${attacker.名号} 演化出了阴阳生死图，虚空抖动，一副阐述阴阳生死大道的神图出现，天地间一瞬间只剩下了阴阳黑白鱼，其上散发出的威势让人心生绝望，似要破灭一切，重开此界`);
      
      let 伤害 = Harm(attacker.攻击 * 0.85, defender.防御);
      let 法球伤害 = Math.trunc(伤害 * attacker.法球倍率);
      伤害 = Math.trunc(1.5 * 法球伤害);
      
      defender.当前血量 -= 伤害;
      defender.当前血量 = Math.max(defender.当前血量, 0);
      
      msg.push(`${attacker.名号}催动阴阳生死图，撕开了天地混沌，轰杀向${defender.名号}，${defender.名号}损失了${bigNumberTransform(伤害)}生命，${defender.名号}剩余${bigNumberTransform(defender.当前血量)}生命`);
          if (defender.当前血量 <= 0) {
  const 复活结果 = checkRevival(defender, "main");
  if (复活结果.revived) {
    msg.push(复活结果.message);
  } else {
    msg.push(`${attacker.名号}击败了${defender.名号}`);
    return { 
            msg, 
            battleEnded: true,
            winner: attacker === A_player ? "A" : "B"
          };
  }
}
    }

    if (Math.random() < 0.1) {
      msg.push(`${attacker.名号} 发动了异象仙王临九天，召出一道身影，那是另一个他自己，高坐九重天，身绕玄黄气，俯瞰天地间，如同一尊仙王出世，威震苍穹`);
      
      let 伤害 = Harm(attacker.攻击 * 0.85, defender.防御);
      let 法球伤害 = Math.trunc(伤害 * attacker.法球倍率);
      伤害 = Math.trunc(2 * 法球伤害);
      
      defender.当前血量 -= 伤害;
      defender.当前血量 = Math.max(defender.当前血量, 0);
      
      msg.push(`${attacker.名号} 的仙王分身对敌手打出恐怖一击后消散了，${defender.名号}损失了${bigNumberTransform(伤害)}生命，${defender.名号}剩余${bigNumberTransform(defender.当前血量)}生命`);
          if (defender.当前血量 <= 0) {
  const 复活结果 = checkRevival(defender, "main");
  if (复活结果.revived) {
    msg.push(复活结果.message);
  } else {
    msg.push(`${attacker.名号}击败了${defender.名号}`);
    return { 
            msg, 
            battleEnded: true,
            winner: attacker === A_player ? "A" : "B"
          };
  }
}
    }
    
  }


   // 攻击者触发分身（仅在主攻击中有效）
if (!attacker.名号.includes('分身')) {
  // 检查是否学习了他化自在法
  if (attacker.学习的功法?.includes("【仙帝】他化自在法") && Math.random() < 0.3) {
    // 触发他化自在身
    const fenshen_obj = JSON.parse(JSON.stringify(attacker));
    fenshen_obj.名号 = `${attacker.名号}·他化自在身`;
    if (attacker === A_player) {
      A_fenshen = fenshen_obj;
      A_fenshen_duration = 3;
    } else {
      B_fenshen = fenshen_obj;
      B_fenshen_duration = 3;
    }
    const selectedAvatars = [];
     // 随机选择两位不同的强者
    while (selectedAvatars.length < 1) {
      const randomIndex = Math.floor(Math.random() * timeRiverAvatars.length);
      const avatar = timeRiverAvatars[randomIndex];
      if (!selectedAvatars.includes(avatar)) {
        selectedAvatars.push(avatar);
      }
    }
    
    // 召唤第一位强者
    const avatar1 = selectedAvatars[0];
    const damage1 = attacker.攻击 * 10; // 十倍攻击伤害
    defender.当前血量 -= damage1;
    defender.当前血量 = Math.max(defender.当前血量, 0);
    
    msg.push(`${attacker.名号}施展「他化自在法」，时间长河泛起涟漪！`);
    msg.push(`一道身影自时间长河中踏出，那是${avatar1.name}！`);
    msg.push(`${avatar1.name}眸绽冷电，睥睨万古：「${avatar1.desc}」`);
    msg.push(`${avatar1.name}施展${avatar1.skill}，一道贯穿古今的神光轰向${defender.名号}！`);
    msg.push(`这一击蕴含了跨越万古的伟力，造成${bigNumberTransform(damage1)}点伤害！`);
 
    msg.push(`${defender.名号}剩余血量：${bigNumberTransform(defender.当前血量)}`);
      if (defender.当前血量 <= 0) {
  const 复活结果 = checkRevival(defender, "main");
  if (复活结果.revived) {
    msg.push(复活结果.message);
  } else {
    msg.push(`${attacker.名号}击败了${defender.名号}`);
    return { 
            msg, 
            battleEnded: true,
            winner: attacker === A_player ? "A" : "B"
          };
  }
}
    msg.push(`${attacker.名号}施展「他化自在法」，虚空震荡中走出另一个自我！`);

  }
  // 检查是否学习了一气化三清
  else if (attacker.学习的功法?.includes("一气化三清") && Math.random() < 0.9) {
    // 触发一气化三清分身
    const fenshen_obj = JSON.parse(JSON.stringify(attacker));
    fenshen_obj.名号 = `${attacker.名号}·道身`;
    // 一气化三清分身属性强化（举例）
    fenshen_obj.攻击力 *= 0.6;
    fenshen_obj.防御力 *= 0.6;
    
    if (attacker === A_player) {
      A_fenshen = fenshen_obj;
      A_fenshen_duration = 4; // 持续时间延长
    } else {
      B_fenshen = fenshen_obj;
      B_fenshen_duration = 4;
    }
    msg.push(`${attacker.名号}施展「一气化三清」，三花聚顶凝聚出道身！`);
  }
}

// 触发防御者的分身（仅限他化自在法）
if (defender && !defender.名号?.includes('分身') && 
    defender.学习的功法?.includes("【仙帝】他化自在法") && 
    Math.random() < 0.25) {
  
  const fenshen_obj = JSON.parse(JSON.stringify(attacker)); // 复制攻击者
  fenshen_obj.名号 = `${defender.名号}化出的${attacker.名号}虚影`;
    const selectedAvatars = [];
    
    // 随机选择两位不同的强者
    while (selectedAvatars.length < 2) {
      const randomIndex = Math.floor(Math.random() * timeRiverAvatars.length);
      const avatar = timeRiverAvatars[randomIndex];
      if (!selectedAvatars.includes(avatar)) {
        selectedAvatars.push(avatar);
      }
    }
    
    // 召唤第一位强者
    const avatar1 = selectedAvatars[0];
    const damage1 = defender.攻击 * 10; // 十倍攻击伤害
    attacker.当前血量 -= damage1;
    attacker.当前血量 = Math.max(attacker.当前血量, 0);
    
    msg.push(`${defender.名号}暴喝道「他化自在，他化万古」，映照出${attacker.名号}的时空投影！同时时间长河泛起涟漪！`);
    msg.push(`一道身影自时间长河中踏出，那是${avatar1.name}！`);
    msg.push(`${avatar1.name}眸绽冷电，睥睨万古：「${avatar1.desc}」`);
    msg.push(`${avatar1.name}施展${avatar1.skill}，一道贯穿古今的神光轰向${attacker.名号}！`);
    msg.push(`这一击蕴含了跨越万古的伟力，造成${bigNumberTransform(damage1)}点伤害！`);
    msg.push(`${attacker.名号}剩余血量：${bigNumberTransform(attacker.当前血量)}`);
      if (attacker.当前血量 <= 0) {
  const 复活结果 = checkRevival(attacker, "main");
  if (复活结果.revived) {
    msg.push(复活结果.message);
  } else {
    msg.push(`${defender.名号}击败了${attacker.名号}`);
    return { 
            msg, 
            battleEnded: true,
            winner: defender === A_player ? "A" : "B"
          };
  }
}
    // 召唤第二位强者
    const avatar2 = selectedAvatars[1];
    const damage2 = defender.攻击 * 10; // 十倍攻击伤害
    attacker.当前血量 -= damage2;
    attacker.当前血量 = Math.max(attacker.当前血量, 0);
    
    msg.push(`又一道身影自时间长河中显现，那是${avatar2.name}！`);
    msg.push(`${avatar2.name}周身道则缭绕：「${avatar2.desc}」`);
    msg.push(`${avatar2.name}施展${avatar2.skill}，无尽法则之力倾泻而下！`);
    msg.push(`这一击撕裂了时空壁垒，造成${bigNumberTransform(damage2)}点伤害！`);
    msg.push(`${attacker.名号}剩余血量：${bigNumberTransform(attacker.当前血量)}`);
      if (attacker.当前血量 <= 0) {
  const 复活结果 = checkRevival(attacker, "main");
  if (复活结果.revived) {
    msg.push(复活结果.message);
  } else {
    msg.push(`${defender.名号}击败了${attacker.名号}`);
    return { 
            msg, 
            battleEnded: true,
            winner: defender === A_player ? "A" : "B"
          };
  }
}
    msg.push(`两位强者身影渐渐虚淡，回归时间长河，只留下万古不灭的道韵...`);
  if (defender === A_player) {
    A_fenshen = fenshen_obj;
    A_fenshen_duration = 3;
  } else {
    B_fenshen = fenshen_obj;
    B_fenshen_duration = 3;
  }
}
 
// 执行攻击
  const { 伤害, isCritical, baoji } = await performAttack(attacker, defender, cnt2, "main");
  
  // 应用伤害
  const { actual_damage, fenshen_blocked } = applyDamage(defender, 伤害, "main");
  
  // 生成战斗消息 - 传入isCritical
  const attack_msg = createCombatMessage(cnt2, attacker, defender, 伤害, actual_damage, isCritical, fenshen_blocked);
  msg.push(attack_msg);
      
      // 5. 者字秘恢复效果
      if (attacker.学习的功法?.some(gongfa => huifu.includes(gongfa))) {
        const 最大血量 = attacker.血量上限;
        const 恢复量 = Math.trunc(最大血量 * 0.1);
        if (attacker.当前血量 < 最大血量) {
          attacker.当前血量 = Math.min(attacker.当前血量 + 恢复量, 最大血量);
          msg.push(` ${attacker.名号}周身泛起赤色霞光🩸，「者字秘」燃烧生命精气，恢复${bigNumberTransform(恢复量)}点气血！`);
        }
      }
      
      // 6. 检查复活
     const 复活结果= checkRevival(defender, "main");
        if (复活结果.revived) {
    msg.push(复活结果.message);
  }
    }
    
 // 在玩家攻击后执行分身协同攻击
if (attacker.分身 && attacker.分身.length > 0) {
    for (const fenshen of attacker.分身) {
        if (fenshen.当前血量 > 0) {
            // 使用分身的属性执行攻击
            const { 伤害: fenshen_damage } = await performAttack(fenshen, defender, cnt2, "fenshen");
            const { actual_damage } = applyDamage(defender, fenshen_damage, "fenshen");
            
            msg.push(
                ` ${fenshen.名号}拉弓凝聚虹光，`,
                `造成${bigNumberTransform(actual_damage)}点协同伤害`
            );
        }
    }
}
// 修改分身攻击部分
if (A_fenshen && A_fenshen_duration > 0) {
  const { 伤害: fenshen_damage, isCritical: fenshen_critical } = await performAttack(A_fenshen, B_player, cnt2, "fenshen");
  const { actual_damage } = applyDamage(B_player, fenshen_damage, "fenshen");
  
  // 添加暴击显示
  let criticalText = fenshen_critical ? "暴击！" : "";
  msg.push(`${A_fenshen.名号}发动攻击，${criticalText}对${B_player.名号}造成${bigNumberTransform(actual_damage)}伤害，${B_player.名号}剩余血量${bigNumberTransform(B_player.当前血量)}`);
  
  A_fenshen_duration--;
}

if (B_fenshen && B_fenshen_duration > 0) {
  const { 伤害: fenshen_damage, isCritical: fenshen_critical } = await performAttack(B_fenshen, A_player, cnt2, "fenshen");
  const { actual_damage } = applyDamage(A_player, fenshen_damage, "fenshen");
  
  // 添加暴击显示
  let criticalText = fenshen_critical ? "暴击！" : "";
  msg.push(`${B_fenshen.名号}发动攻击，${criticalText}对${A_player.名号}造成${bigNumberTransform(actual_damage)}伤害，${A_player.名号}剩余血量${bigNumberTransform(A_player.当前血量)}`);
  
  B_fenshen_duration--;
}
   // 8. 分身持续时间检查（区分功法特效）
if (A_fenshen && A_fenshen_duration <= 0) {
  // 根据分身类型显示不同消散效果
  if (A_fenshen.名号.includes('道身')) {
    msg.push(`${A_fenshen.名号}化作一缕清气，重归天地之间！`);
  } else if (A_fenshen.名号.includes('虚影')) {
    msg.push(`${A_fenshen.名号}渐渐虚淡，消散在时空长河中！`);
  } else {
    msg.push(`${A_fenshen.名号}的持续时间结束，化作光雨消散！`);
  }
  A_fenshen = null;
}

if (B_fenshen && B_fenshen_duration <= 0) {
  if (B_fenshen.名号.includes('道身')) {
    msg.push(`${B_fenshen.名号}化作一缕清气，重归天地之间！`);
  } else if (B_fenshen.名号.includes('虚影')) {
    msg.push(`${B_fenshen.名号}渐渐虚淡，消散在时空长河中！`);
  } else {
    msg.push(`${B_fenshen.名号}的持续时间结束，化作光雨消散！`);
  }
  B_fenshen = null;
}


cnt++;
  }
// 修改后代码
if (B_player.当前血量 <= 0) {
    msg.push(`${BB_player.名号}击败了${AA_player.名号}`);
    A_xue = A_player.当前血量;  // 修正：返回战斗后玩家的实际剩余血量
    B_xue = B_player.当前血量; // 修正：返回怪物原始血量（用于奖励计算等）
} else if (A_player.当前血量 <= 0) {
    msg.push(`${AA_player.名号}击败了${BB_player.名号}`);
    A_xue = A_player.当前血量;  // 修正：玩家剩余血量（此时应为0）
    B_xue = B_player.当前血量;  // 修正：怪物剩余血量
}
  
 return { 
    msg: msg, 
    A_xue: (A_xue),
    B_xue: (B_xue),
    A_hp: A_player.当前血量,   // 这是内部交换后的A_player，即传入的第二个参数（大帝虚影）的剩余血量
    B_hp: B_player.当前血量    // 这是传入的第一个参数（玩家）的剩余血量
};
} 
// 团本战斗逻辑
export async function tb_battle(players, boss, team) {
  // 深拷贝玩家和BOSS数据
  let teamData = players.map(p => JSON.parse(JSON.stringify(p)));
  let bossCopy = JSON.parse(JSON.stringify(boss));
  
  let cnt = 0; // 回合计数器
  let msg = []; // 战斗日志
  let jineng1 = data.jineng1; // 玩家技能库
  let jineng2 = data.jineng2; // BOSS技能库

  // 初始化玩家属性
  for (let player of teamData) {
    player.初始血量 = player.当前血量; // 记录初始血量
    
    // 魔道值增益处理
    if (player.魔道值 > 999 && player.灵根.type == '魔头'||player.灵根.type == '天魔') {
      let buff = Math.trunc(player.魔道值 / 1000) / 100 + 1;
      if (buff > 1.3) buff = 1.3;
      if (player.灵根.name == '极道天魔') buff += 0.2;
      msg.push(
        `${attacker.名号}将魔道之力转化为邪神之力，获得了${Math.trunc((buff - 1) * 100)}%的增伤`
      );
    }
 else if (
      player.灵根.type == '转生'|| player.灵根.type == '命运')
     {
      let buff2 = player.神石 * 0.0015;
      if (buff2 > 0.3) buff2 = 0.3;
      if (player.灵根.name == '命运神道体') buff2 += 0.2;
      msg.push(
        `${defender.名号}将神石之力转化为命运之力，获得了${Math.trunc(buff2 * 100)}%的减伤`
      );
    }
  }
  
  // 仇恨系统：记录每个玩家的仇恨值
  let hatred = new Array(teamData.length).fill(0);
  let currentTarget = 0; // 当前仇恨目标索引
  
  // 战斗主循环
  while (bossCopy.当前血量 > 0 && teamData.some(p => p.当前血量 > 0)) {
    cnt++;
    msg.push(`\n===== 第 ${cnt} 回合开始 =====`);
    
    // ---------- 玩家阶段 ----------
    msg.push(`【玩家阶段】`);
    
    // 玩家按照队伍顺序依次攻击
    for (let i = 0; i < teamData.length; i++) {
      const player = teamData[i];
      
      // 跳过死亡玩家
      if (player.当前血量 <= 0) {
        msg.push(`${player.名号}已倒下，无法行动`);
        continue;
      }
      
      // 玩家攻击BOSS
      const result = await calculateAttack(player, bossCopy, cnt, jineng1, jineng2);
      msg.push(...result.msgs);
      
      // 更新BOSS血量
      bossCopy.当前血量 -= result.damage;
      if (bossCopy.当前血量 < 0) bossCopy.当前血量 = 0;
      
      // 更新仇恨值（伤害越高仇恨越高）
      hatred[i] += result.damage;
      
      msg.push(`${player.名号}对${bossCopy.名号}造成${result.damage}点伤害，BOSS剩余血量：${bossCopy.当前血量}`);
      
      // 如果BOSS死亡，提前结束回合
      if (bossCopy.当前血量 <= 0) break;
    }
    
    // 检查BOSS是否死亡
    if (bossCopy.当前血量 <= 0) {
      msg.push(`\n${bossCopy.名号}已被击败！`);
      break;
    }
    
    // ---------- BOSS阶段 ----------
    msg.push(`\n【BOSS阶段】`);
    
    // 选择仇恨目标（仇恨值最高的存活玩家）
    currentTarget = selectTarget(teamData, hatred);
    const targetPlayer = teamData[currentTarget];
    
    // BOSS攻击仇恨目标
    const result = await calculateAttack(bossCopy, targetPlayer, cnt, jineng1, jineng2);
    msg.push(...result.msgs);
    
    // 更新玩家血量
    targetPlayer.当前血量 -= result.damage;
    if (targetPlayer.当前血量 < 0) targetPlayer.当前血量 = 0;
    
    msg.push(`${bossCopy.名号}攻击${targetPlayer.名号}，造成${result.damage}点伤害，${targetPlayer.名号}剩余血量：${targetPlayer.当前血量}`);
    
    // 检查玩家是否全部死亡
    if (teamData.every(p => p.当前血量 <= 0)) {
      msg.push(`\n所有玩家已被击败！`);
      break;
    }
  }
  
  // 计算血量变化
  const playersHpChange = teamData.map(p => p.当前血量 - p.初始血量);
  const bossHpChange = bossCopy.当前血量 - bossCopy.初始血量;
  
  // 确定战斗结果
  const result = bossCopy.当前血量 <= 0 ? "玩家胜利" : "BOSS胜利";
  msg.push(`\n===== 战斗结束 =====`);
  msg.push(`结果：${result}`);
  
  return {
    msg: msg,
    players_hp_change: playersHpChange,
    boss_hp_change: bossHpChange,
    result: result
  };
}

// 选择仇恨目标函数
function selectTarget(players, hatred) {
  // 找到仇恨值最高的存活玩家
  let maxHatred = -1;
  let targetIndex = 0;
  
  for (let i = 0; i < players.length; i++) {
    if (players[i].当前血量 > 0 && hatred[i] > maxHatred) {
      maxHatred = hatred[i];
      targetIndex = i;
    }
  }
  
  return targetIndex;
}

// 计算攻击伤害（删除仙宠逻辑）
async function calculateAttack(attacker, defender, cnt, jineng1, jineng2) {
  const msgs = [];
  let triggerShengti = false; // 小成圣体触发标志
  
  // 装备效果
  if (isNotNull(attacker.id)) {
    let equipment = await Read_equipment(attacker.id);
    let ran = Math.random();
    
    if (equipment.武器.name == '紫云剑' && ran > 0.7) {
      const originalAtk = attacker.攻击;
      attacker.攻击 *= 3;
      msgs.push(`${attacker.名号}触发了紫云剑被动，攻击力从${originalAtk}提高到${attacker.攻击}`);
    } else if (equipment.武器.name == '炼血竹枪' && ran > 0.75) {
      const originalAtk = attacker.攻击;
      const originalHp = attacker.当前血量;
      
      attacker.攻击 *= 2;
      attacker.当前血量 = Math.trunc(attacker.当前血量 * 1.2);
      
      msgs.push(
        `${attacker.名号}触发了炼血竹枪被动，攻击力从${originalAtk}提高到${attacker.攻击}，` +
        `血量从${originalHp}回复到${attacker.当前血量}`
      );
    } else if (equipment.武器.name == '少阴玉剑' && ran > 0.85) {
      const originalHp = attacker.当前血量;
      attacker.当前血量 = Math.trunc(attacker.当前血量 * 1.4);
      msgs.push(`${attacker.名号}触发了少阴玉剑被动，血量从${originalHp}回复到${attacker.当前血量}`);
    }
  }
  
  // 小成圣体技能触发
  if (attacker.灵根?.type == "小成圣体") {
    if (Math.random() < 0.89) {
      msgs.push(`${attacker.名号} 撑开了异象锦绣山河，一片不属于此界的天地山河浮现，山河领域笼罩全队，全队战力暴涨，举手投足间让宇宙中的日月星辰都与之共鸣，绽开无量神光`);
      
      // 标记触发了小成圣体领域
      triggerShengti = true;
    }
  }

  let 伤害 = Harm(attacker.攻击 * 0.85, defender.防御);
  let 法球伤害 = Math.trunc(attacker.攻击 * attacker.法球倍率);
  伤害 = Math.trunc( 伤害 + 法球伤害 + attacker.防御 * 0.1);
  
  // 技能触发
  let count = 0; // 限制次数
  let cnt2 = Math.trunc(cnt / 2);
  
  for (var i = 0; i < jineng1.length; i++) {
    if (
      (jineng1[i].class == '常驻' &&
        (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
        Math.random() < jineng1[i].pr) ||
      (attacker.学习的功法 &&
        jineng1[i].class == '功法' &&
        attacker.学习的功法.indexOf(jineng1[i].name) > -1 &&
        (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
        Math.random() < jineng1[i].pr) ||
      (attacker.灵根 &&
        jineng1[i].class == '灵根' &&
        attacker.灵根.name == jineng1[i].name &&
        (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
        Math.random() < jineng1[i].pr)
    ) {
      // 构建技能消息
      let skillMsg = attacker.名号 + jineng1[i].msg1;
      if (jineng1[i].msg2 !== '') {
        skillMsg += defender.名号 + jineng1[i].msg2;
      }
      msgs.push(skillMsg);
      
      // 应用技能效果
      伤害 = 伤害 * jineng1[i].beilv + jineng1[i].other;
      
      count++;
      if (count == 2) break; // 最多触发3个技能
    }
  }
  
  for (var i = 0; i < jineng2.length; i++) {
    if (
      (defender.学习的功法 &&
        jineng2[i].class == '功法' &&
        defender.学习的功法.indexOf(jineng2[i].name) > -1 &&
        (cnt2 == jineng2[i].cnt || jineng2[i].cnt == -1) &&
        Math.random() < jineng2[i].pr) ||
      (defender.灵根 &&
        jineng2[i].class == '灵根' &&
        defender.灵根.name == jineng2[i].name &&
        (cnt2 == jineng2[i].cnt || jineng2[i].cnt == -1) &&
        Math.random() < jineng2[i].pr)
    ) {
      // 构建技能消息
      let skillMsg = defender.名号 + jineng2[i].msg1;
      if (jineng2[i].msg2 !== '') {
        skillMsg += attacker.名号 + jineng2[i].msg2;
      }
      msgs.push(skillMsg);
      
      // 应用技能效果
      伤害 = 伤害 * jineng2[i].beilv + jineng2[i].other;
    }
  }
  
  // 魔道值增益/神石减伤
  let buff = 1;
  if (attacker.魔道值 > 999) {
    buff += Math.trunc(attacker.魔道值 / 1000) / 100;
    if (buff > 1.3) buff = 1.3;
    if (attacker.灵根.name == '九重魔功') buff += 0.2;
  }
  
  if (
    defender.魔道值 < 1 &&
    (defender.灵根.type == '转生' || defender.level_id > 41)
  ) {
    let buff2 = defender.神石 * 0.0015;
    if (buff2 > 0.3) buff2 = 0.3;
    if (defender.灵根.name == '九转轮回体') buff2 += 0.2;
    buff -= buff2;
  }
  
  伤害 = Math.trunc(伤害 * buff);
  

  
  return {
    damage: 伤害,
    msgs: msgs,
    triggerShengti: triggerShengti // 返回是否触发了小成圣体领域
  };
}
// 创建一个专门的 combatUtils.js 模块
export function calculateHarm(atk, def, baoji = 1) {
  // 确保输入是数字
  atk = ensureNumber(atk);
  def = ensureNumber(def);
  baoji = ensureNumber(baoji, 1);
  
  // 使用BigInt处理超大数字
  if (atk > Number.MAX_SAFE_INTEGER || def > Number.MAX_SAFE_INTEGER) {
    try {
      const bigAtk = BigInt(Math.round(atk));
      const bigDef = BigInt(Math.round(def));
      
      // 伤害公式：攻击 * 0.85 - 防御
      const damage = bigAtk * 850n / 1000n - bigDef;
      
      // 确保伤害不为负数
      return damage > 0n ? Number(damage) : 0;
    } catch (e) {
      console.error('BigInt计算错误:', e);
      return 0;
    }
  }
  
  // 普通数字计算
  let x;
  let s = atk / def;
  let rand = Math.trunc(Math.random() * 11) / 100 + 0.95;
  
  if (s < 1) {
    x = 0.1;
  } else if (s > 2.5) {
    x = 1;
  } else {
    x = 0.6 * s - 0.5;
  }
  
  let damage = Math.trunc(x * atk * rand * baoji);
  return ensureNumber(damage, 0);
}

export function ensureNumber(value, defaultValue = 0) {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}
export function baojishanghai(baojilv) {
  if (baojilv > 1) {
    baojilv = 1;
  } //暴击率最高为100%,即1
  let rand = Math.random();
  let bl = 1;
  if (rand < baojilv) {
    bl = baojilv + 1.5; //这个是暴击伤害倍率//满暴击时暴伤2为50%
  }
  return bl;
}
// 修改Harm函数，使其能处理暴击
export function Harm(atk, def, baoji = 1) {
  let x;
  let s = atk / def;
  let rand = Math.trunc(Math.random() * 11) / 100 + 0.95;
  
  if (s < 1) {
    x = 0.1;
  } else if (s > 2.5) {
    x = 1;
  } else {
    x = 0.6 * s - 0.5;
  }
  
  // 应用暴击倍率
  x = Math.trunc(x * atk * rand * baoji);
  return x;
}


//判断克制关系
export function kezhi(equ, wx) {
  let wuxing = ['金', '木', '土', '水', '火', '金'];
  let equ_wx = wuxing[equ - 1];
  //相同
  for (let j of wx) {
    if (j == equ_wx) return 0.04;
  }
  //不同
  for (let j of wx)
    for (let i = 0; i < wuxing.length - 1; i++) {
      if (wuxing[i] == equ_wx && wuxing[i + 1] == j) return -0.02;
    }
  return 0;
}
//通过暴击伤害返回输出用的文本
export function ifbaoji(baoji) {
  if (baoji == 1) {
    return '';
  } else {
    return '触发暴击，';
  }
}
//写入交易表
export async function Write_Exchange(wupin) {
  let dir = path.join(__PATH.Exchange, `Exchange.json`);
  let new_ARR = JSON.stringify(wupin, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

//写入交易表
export async function Write_Forum(wupin) {
  let dir = path.join(__PATH.Exchange, `Forum.json`);
  let new_ARR = JSON.stringify(wupin, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

//读交易表
export async function Read_Exchange() {
  let dir = path.join(`${__PATH.Exchange}/Exchange.json`);
  let Exchange = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  Exchange = JSON.parse(Exchange);
  return Exchange;
}

//读交易表
export async function Read_Forum() {
  let dir = path.join(`${__PATH.Exchange}/Forum.json`);
  let Forum = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  Forum = JSON.parse(Forum);
  return Forum;
}

export async function get_supermarket_img(e, thing_class) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let Exchange_list;
  try {
    Exchange_list = await Read_Exchange();
  } catch {
    await Write_Exchange([]);
    Exchange_list = await Read_Exchange();
  }
  for (let i = 0; i < Exchange_list.length; i++) {
    Exchange_list[i].num = i + 1;
  }
  if (thing_class) {
    Exchange_list = Exchange_list.filter(
      item => item.name.class == thing_class
    );
  }

  Exchange_list.sort(function (a, b) {
    return b.now_time - a.now_time;
  });
  let supermarket_data = {
    user_id: usr_qq,
    Exchange_list: Exchange_list,
  };
  const data1 = await new Show(e).get_supermarketData(supermarket_data);
  let img = await puppeteer.screenshot('supermarket', {
    ...data1,
  });
  return img;
}

export async function get_forum_img(e, thing_class) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let Forum;
  try {
    Forum = await Read_Forum();
  } catch {
    await Write_Forum([]);
    Forum = await Read_Forum();
  }
  for (let i = 0; i < Forum.length; i++) {
    Forum[i].num = i + 1;
  }
  if (thing_class) {
    Forum = Forum.filter(item => item.class == thing_class);
  }

  Forum.sort(function (a, b) {
    return b.now_time - a.now_time;
  });
  let forum_data = {
    user_id: usr_qq,
    Forum: Forum,
  };
  const data1 = await new Show(e).get_forumData(forum_data);
  let img = await puppeteer.screenshot('forum', {
    ...data1,
  });
  return img;
}

export async function openAU() {
  const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';

  const random = Math.floor(Math.random() * data.xingge[0].one.length);
  const thing_data = data.xingge[0].one[random];
  const thing_value = Math.floor(thing_data.出售价);
  const thing_amount = 1;
  const now_time = new Date().getTime();
  const groupList = await redis.sMembers(redisGlKey);

  const wupin = {
    thing: thing_data,
    start_price: thing_value,
    last_price: thing_value,
    amount: thing_amount,
    last_offer_price: now_time,
    last_offer_player: 0,
    groupList,
  };
  await redis.set('xiuxian:AuctionofficialTask', JSON.stringify(wupin));
  return wupin;
}



export async function Goweizhi(e, weizhi, addres) {
let get_data={didian_list: weizhi,
            addres:addres}
const data1 = await new Show(e).get_secret_placeData(get_data);
return await puppeteer.screenshot('secret_place', {
  ...data1,
});
}

export async function xunbaoweizhi(e, placeNames, addres) {
    try {
        // 确保数据存在
        if (!data || !data.xunbao_list || !data.xunbao_list.treasureMaps) {
            return e.reply('❌ 寻宝数据未初始化');
        }
        
        const treasureMaps = data.xunbao_list.treasureMaps;
        
        // 转换数据格式 - 修复版本
        const weizhi = placeNames.map(placeName => {
            const place = treasureMaps[placeName];
            if (!place) return null;
            
            // 处理必备地图
            const one = place.requirements?.map?.map(item => ({
                name: item.name,
                amount: item.amount || 1 // 添加数量字段
            })) || [];
            
            // 处理所需工具
            const two = place.requirements?.tools?.map(item => ({
                name: item.name,
                amount: item.amount || 1 // 添加数量字段
            })) || [];
            
            // 处理普通奖励
            const three = place.rewards?.base?.map(item => ({
                name: item.name,
                amount: item.amount || 1 // 添加数量字段
            })) || [];
            
            // 处理额外奖励
            const four = place.rewards?.random?.map(item => ({
                name: item.items?.[0]?.name || '未知',
                chance: item.chance || 0,
                amount: item.items?.[0]?.amount || 1 // 添加数量字段
            })) || [];
            
            return {
                name: place.name,
                Grade: place.grade,
                Price: typeof place.price === 'string' ? 
                       place.price.split(',')[0] : place.price,
                one, // 包含数量的必备地图
                two, // 包含数量的所需工具
                three, // 包含数量的普通奖励
                four, // 包含数量的额外奖励
                experience: place.experience ? `经验要求: ${place.experience.toLocaleString()}` : ''
            };
        }).filter(Boolean);
        
        // 如果没有找到任何地点
        if (weizhi.length === 0) {
            return e.reply(`❌ 未找到${addres}的寻宝地点信息`);
        }
        
        // 构建数据对象
        const get_data = {
            didian_list: weizhi,
            addres: addres || "寻宝地图",
            timestamp: Date.now()
        };
        
        // 获取模板数据
        const templateData = await new Show(e).get_xunbao_placeData(get_data);
        
        // 使用 puppeteer 截图
        const screenshot = await puppeteer.screenshot('get_xunbao_placeData', {
            ...templateData,
            quality: 90,
            waitFor: 1000,
            viewport: { width: 1200, height: 800 }
        });
        
        return screenshot;
    } catch (error) {
        console.error('寻宝位置导出错误:', error);
        
        // 错误处理：返回默认错误消息
        return '❌ 寻宝信息生成失败，请稍后重试';
    }
}
export async function xianjingweizhi(e, weizhi, addres) {
    let get_data = {
        didian_list: weizhi,
        addres: addres
    }
    const data1 = await new Show(e).get_xianjing_placeData(get_data);
    return await puppeteer.screenshot('get_xianjing_placeData', {
        ...data1,
    });
}


/**
 * 增加player文件某属性的值（在原本的基础上增加）
 * @param user_qq
 * @param num 属性的value
 * @param type 修改的属性
 * @returns {Promise<void>}
 */
export async function setFileValue(user_qq, num, type) {
  let user_data = data.getData('player', user_qq);
  let current_num = user_data[type]; //当前灵石数量
  let new_num = current_num + num;
  if (type == '当前血量' && new_num > user_data.血量上限) {
    new_num = user_data.血量上限; //治疗血量需要判读上限
  }
  user_data[type] = new_num;
  await data.setData('player', user_qq, user_data);
  return;
}

export async function Synchronization_ASS(e) {
  const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
  const masterList = xiuxianConfig.Master || [];
  const userQQ = e.user_id.toString().replace('qg_', '');
  if (!e.isMaster && !masterList.includes(userQQ)) {
    return;
  }
  e.reply('宗门开始同步');
  let assList = [];
  let files = fs
    .readdirSync('./plugins/' + AppName + '/resources/data/association')
    .filter(file => file.endsWith('.json'));
  for (let file of files) {
    file = file.replace('.json', '');
    assList.push(file);
  }
  for (let ass_name of assList) {
    let ass = await data.getAssociation(ass_name);
    let player = data.getData('player', ass.宗主);
    let now_level_id = data.Level_list.find(
      item => item.level_id == player.level_id
    ).level_id;
    //补
    if (!isNotNull(ass.power)) {
      ass.power = 0;
    }
    if (now_level_id < 42) {
      ass.power = 0; // 凡界
    } else {
      ass.power = 1; //  仙界
    }
    if (ass.power == 1) {
      if (ass.大阵血量 == 114514) {
        ass.大阵血量 = 1145140;
      }
      let level = ass.最低加入境界;
      if (level < 42) {
        ass.最低加入境界 = 42;
      }
    }
    if (ass.power == 0 && ass.最低加入境界 > 41) {
      ass.最低加入境界 = 41;
    }
    if (!isNotNull(ass.宗门驻地)) {
      ass.宗门驻地 = 0;
    }
    if (!isNotNull(ass.宗门建设等级)) {
      ass.宗门建设等级 = 0;
    }
    if (!isNotNull(ass.宗门神兽)) {
      ass.宗门神兽 = 0;
    }
    if (!isNotNull(ass.副宗主)) {
      ass.副宗主 = [];
    }
    await data.setAssociation(ass_name, ass);
  }

  e.reply('宗门同步结束');
  return;
}

export async function synchronization(e) {
  const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
  const masterList = xiuxianConfig.Master || [];
  const userQQ = e.user_id.toString().replace('qg_', '');
  if (!e.isMaster && !masterList.includes(userQQ)) {
    return;
  }
  e.reply('存档开始同步');
  let playerList = [];
  let files = fs
    .readdirSync('./plugins/' + AppName + '/resources/data/xiuxian_player')
    .filter(file => file.endsWith('.json'));
  for (let file of files) {
    file = file.replace('.json', '');
    playerList.push(file);
  }
  for (let player_id of playerList) {
    let usr_qq = player_id;
    let player = await data.getData('player', usr_qq);
    let najie = await Read_najie(usr_qq);
    let equipment = await Read_equipment(usr_qq);
    
    // ========== 灵根数据同步 ==========
    // 检查玩家灵根数据是否需要更新
    if (player.灵根 && isNotNull(player.灵根)) {
      // 查找新版本的灵根数据
      let newTalent = data.talent_list.find(t => 
        t.id === player.灵根.id || t.name === player.灵根.name
      );
      
      if (newTalent) {
        // 合并新旧灵根数据，保留玩家已有的自定义属性
        player.灵根 = {
          ...newTalent,           // 新版本的属性
          ...player.灵根          // 保留玩家已有的属性（如果有自定义的话）
        };
        
        console.log(`玩家 ${usr_qq} 灵根已更新: ${player.灵根.name}`);
      }
    }
    // ========== 灵根同步结束 ==========
    
    // 扩展字段数组，添加新版本字段
    let ziduan = [
      '镇妖塔层数', '神魄段数', '魔道值', '饱食度', '热量', '师徒任务阶段', 
      '师徒积分', 'favorability', '血气', 'lunhuiBH', 'lunhui', '攻击加成', 
      '防御加成', '生命加成', '幸运', '练气皮肤', '装备皮肤', 'islucky', 'sex', 
      'addluckyNo', '神石', '源石', '生命本源', '寿元', '道法赐福天数', 
      'daofaxianshu', 'daofaxianshu_endtime', '抽奖次数', '出金率', '出金次数', 
      '仙宠寻宝状态', '仙宠寻宝开始时间', '五色祭坛'
    ];
    
    let ziduan2 = [
      'Physique_id', 'mijinglevel_id', 'xiangulevel_id', 'linggenshow', 
      'power_place', 'occupation_level', '血量上限', '当前血量', '攻击', '防御'
    ];
    let ziduan3 = ['linggen', 'occupation', '仙宠'];
    let ziduan4 = ['材料', '草药', '仙宠', '仙宠口粮', '宝石', '食材', '盒子'];
    
    // 初始化数值字段为0
    for (let k of ziduan) {
      if (!isNotNull(player[k])) {
        player[k] = 0;
      }
    }
    
    // 初始化数值字段为1
    for (let k of ziduan2) {
      if (!isNotNull(player[k])) {
        player[k] = 1;
      }
    }
    
    // 初始化数组字段
    for (let k of ziduan3) {
      if (!isNotNull(player[k])) {
        player[k] = [];
      }
    }
    
    // 初始化纳戒数组字段
    for (let k of ziduan4) {
      if (!isNotNull(najie[k])) {
        najie[k] = [];
      }
    }
    
    // ========== 元神和元神上限特殊处理 ==========
    // 获取玩家当前境界ID
    let level_id = player.level_id || 1;
    
    // 计算基于境界的元神值（境界ID * 500000）
    let base_spirit = level_id * 500000;
    
    // 如果元神字段不存在或为0，设置基于境界的初始值
    if (!isNotNull(player.元神) || player.元神 === 0) {
      player.元神 = base_spirit;
    }
    
    // 如果元神上限字段不存在或为0，设置基于境界的初始值
    if (!isNotNull(player.元神上限) || player.元神上限 === 0) {
      player.元神上限 = base_spirit;
    }
    
    // 如果神识字段不存在或为0，也设置基于境界的初始值
    if (!isNotNull(player.神识) || player.神识 === 0) {
      player.神识 = base_spirit * 0.1; // 神识是元神的10%
    }
    // ========== 元神处理结束 ==========
    
    // ========== 寿元特殊处理 ==========
    // 根据境界ID计算基础寿元（境界ID * 500）
    let base_lifespan = level_id * 500;
    
    // 如果寿元字段不存在或为0，设置基于境界的初始值
    if (!isNotNull(player.寿元) || player.寿元 === 0) {
      player.寿元 = base_lifespan;
    }
    // ========== 寿元处理结束 ==========
    
    // ========== 生命本源特殊处理 ==========
    // 根据灵根的生命本源属性计算基础生命本源
    let base_life_essence = 100; // 基础值
    if (player.灵根 && player.灵根.生命本源) {
      base_life_essence += player.灵根.生命本源;
    }
    
    // 如果生命本源字段不存在或为0，设置基于灵根的初始值
    if (!isNotNull(player.生命本源) || player.生命本源 === 0) {
      player.生命本源 = base_life_essence;
    }
    // ========== 生命本源处理结束 ==========
    
    // 初始化字符串字段
    if (!isNotNull(player.daofa)) {
      player.daofa = '未开启';
    }
    if (!isNotNull(player.仙宠寻宝)) {
      player.仙宠寻宝 = "";
    }
    if (!isNotNull(player.势力)) {
      player.势力 = "无";
    }
    if (!isNotNull(player.势力职位)) {
      player.势力职位 = "";
    }
    if (!isNotNull(player.护道人)) {
      player.护道人 = "无";
    }
    if (!isNotNull(player.庇护人)) {
      player.庇护人 = "";
    }
    if (Array.isArray(player.护道人) && player.护道人.length === 0) {
    player.护道人 = "无";
}
if (Array.isArray(player.势力) && player.势力.length === 0) {
    player.势力 = "无";
}
if (Array.isArray(player.势力职位) && player.势力职位.length === 0) {
    player.势力职位 = "";
}
    // 初始化布尔字段
    if (!isNotNull(player.attempting_level_7)) {
      player.attempting_level_7 = false;
    }
    if (!isNotNull(player.guardian)) {
      player.guardian = null;
    }
    
    // 初始化天资系统（新增关键字段）
    if (!isNotNull(player.天资等级)) {
      player.天资等级 = "天纵之资"; // 默认天资等级
    }
    if (!isNotNull(player.天资评价)) {
      player.天资评价 = "天赋异禀，媲美上古大教的天才"; // 默认天资评价
    }
    
    // 原有逻辑保持不变
    if (!isNotNull(player.breakthrough)) {
      player.breakthrough = false;
    }
    if (!isNotNull(player.id)) {
      player.id = usr_qq;
    }
    if (!isNotNull(player.轮回点) || player.轮回点 > 10) {
      player.轮回点 = 10 - player.lunhui;
    }
    
    // 初始化丹药数据
    try {
      await Read_danyao(usr_qq);
    } catch {
      const arr = {
        biguan: 0, //闭关状态
        biguanxl: 0, //增加效率
        xingyun: 0,
        lianti: 0,
        ped: 0,
        modao: 0,
        beiyong1: 0, //ped
        beiyong2: 0,
        beiyong3: 0,
        beiyong4: 0,
        beiyong5: 0,
      };
      await Write_danyao(usr_qq, arr);
    }

    // 初始化装备的帝兵字段（新增）
    if (!isNotNull(equipment.帝兵)) {
      equipment.帝兵 = data.dibing_list.find(item => item.name == '废铁') || {
        name: '废铁',
        type: '帝兵',
        attack: 0,
        defense: 0
      };
    }

    let suoding = [
      '装备', '丹药', '道具', '功法', '草药', '材料', '仙宠', 
      '仙宠口粮', '宝石', '食材', '盒子'
    ];
    for (let j of suoding) {
      najie[j].forEach(item => {
        if (!isNotNull(item.islockd)) {
          item.islockd = 0;
        }
      });
    }
    
    // 仙宠调整（保持不变）
    if (player.仙宠.id > 2930 && player.仙宠.id < 2936) {
      player.仙宠.初始加成 = 0.002;
      player.仙宠.每级增加 = 0.002;
      player.仙宠.加成 = player.仙宠.每级增加 * player.仙宠.等级;
      player.幸运 = player.addluckyNo + player.仙宠.加成;
    } else {
      player.幸运 = player.addluckyNo;
    }
    
    for (let j of najie.仙宠) {
      if (j.id > 2930 && player.仙宠.id < 2936) {
        j.初始加成 = 0.002;
        j.每级增加 = 0.002;
      }
    }
    
    // 装备调整（保持不变）
    let wuqi = ['雾切之回光', '护摩之杖', '磐岩结绿', '三圣器·朗基努斯之枪'];
    let wuqi2 = ['紫云剑', '炼血竹枪', '少阴玉剑', '纯阴金枪'];
    for (let j of najie.装备) {
      for (let k in wuqi) {
        if (j.name == wuqi[k]) {
          j.name = wuqi2[k];
        }
        if (equipment.武器.name == wuqi[k]) equipment.武器.name = wuqi2[k];
        if (equipment.法宝.name == wuqi[k]) equipment.法宝.name = wuqi2[k];
      }
    }
    
    // 口粮调整（保持不变）
    for (let j of najie.仙宠口粮) {
      j.class = '仙宠口粮';
    }
    
    // 灵根数据同步（使用新版本的灵根列表）
    let linggeng = data.talent_list.find(item => item.name == player.灵根.name);
    if (linggeng) {
      // 合并灵根数据，保留玩家可能存在的自定义属性
      player.灵根 = {
        ...linggeng,
        ...player.灵根
      };
    }

    // 隐藏灵根（保持不变）
    if (player.隐藏灵根) {
      player.隐藏灵根 = data.yincang.find(
        item => item.name == player.隐藏灵根.name
      );
    }
    
    // 重新根据id去重置仙门（保持不变）
    let now_level_id = await data.Level_list.find(
      item => item.level_id == player.level_id
    ).level_id;
    if (now_level_id < 42) {
      player.power_place = 0;
    }
   
    
    await Write_najie(usr_qq, najie);
    await Write_player(usr_qq, player);
    await Write_equipment(usr_qq, equipment);
    
    // 记录同步信息（可选，用于调试）
    console.log(`玩家 ${usr_qq} 同步完成：境界${level_id} 元神${player.元神} 生命本源${player.生命本源} 寿元${player.寿元}`);
  }
  e.reply('存档同步结束');
  return;
}

export async function channel(usr_qq) {
  const dir = path.join(`${__PATH.channel}/channel.json`);
  const logfile = fs.readFileSync(dir, 'utf8');
  const allRecords = JSON.parse(logfile);
   if (usr_qq.length > 16) {
    for (let record of allRecords) {
      if (record.频道_ID == usr_qq) {
        usr_qq = record.QQ_ID; // 使用存档的 usr_qq
        let ifexistplay = data.existData("player", usr_qq);
        if (!ifexistplay) {
          usr_qq = record.频道_ID; // 使用存档的 usr_qq
        }
        break;
      }
    }
  } else {
    for (let record of allRecords) {
      if (record.频道_ID == usr_qq) {
        usr_qq = record.QQ_ID; // 使用存档的 usr_qq
        let ifexistplay = data.existData("player", usr_qq);
        if (!ifexistplay) {
          usr_qq = record.频道_ID; // 使用存档的 usr_qq
        }
        break;
      }
    }
  }
  return usr_qq; // 返回转换后的 usr_qq 值
}

/**
 *
 * @param {*} thing_name 物品名
 * @returns
 */
//遍历物品
export async function foundthing(thing_name) {
  let thing = [
    'equipment_list',
    'danyao_list',
    'dibing_list',
    'tszb_list',
    'dijingList',
    'daoju_list',
    'gongfa_list',
    'caoyao_list',
    'timegongfa_list',
    'timeequipmen_list',
    'timedanyao_list',
    'newdanyao_list',
    'xianchon',
    'xianchonkouliang',
    'xianchonkouliang2',
    'duanzhaocailiao',
    'kamian',
    'kamian3',
   'namegive',
    'hecheng_list',
     'fuhua_list',
     'jiagong_list',
     'shicai_list',
     'cailiao_list',
     'duanzhaohuju',
      'hezi_list',
  'baoshi_list'
  ];
  for (var i of thing) {
    for (var j of data[i]) {
      if (j.name == thing_name) return j;
    }
  }
  let A;
  try {
    A = await Read_it();
  } catch {
    await Writeit([]);
    A = await Read_it();
  }
  if (typeof thing_name != 'string') {
    thing_name=thing_name.name
   }
  for (var j of A) {
    if (j.name == thing_name) return j;
  }
  thing_name = thing_name.replace(/[0-9]+/g, '');
  thing = ['duanzhaowuqi', 'duanzhaohuju', 'duanzhaobaowu', 'zalei'];
  for (var i of thing) {
    for (var j of data[i]) {
      if (j.name == thing_name) return j;
    }
  }
  return false;
}





export async function get_shitujifen_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
  let player = await Read_player(usr_qq);
  let commodities_list = data.shitujifen;
  let jifen = player.师徒积分;
  let tianditang_data = {
    name: player.名号,
    jifen: jifen,
    commodities_list: commodities_list,
  };
  const data1 = await new Show(e).get_shitujifenData(tianditang_data);
  return await puppeteer.screenshot('shitujifen', {
    ...data1,
  });
}
//提交任务
export async function get_tijiao_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
  let player = await Read_player(usr_qq);
  let user_A;
  let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
  user_A = A;
  let shitu = await Read_shitu();
  let i = await found_shitu_2(user_A);
  let jifen = shitu[i].师傅;
  let player2 = await Read_player(jifen);
  if (
    shitu[i].任务阶段 == 1 &&
    shitu[i].renwu1 == 2 &&
    shitu[i].renwu2 == 2 &&
    shitu[i].renwu3 == 2
  ) {
    shitu[i].任务阶段 = 2;
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    await Write_shitu(shitu);
    player.师徒任务阶段 = 2;
    await Write_player(usr_qq, player);
    player2.师徒积分 += 5;
    await Write_player(jifen, player2);
    await Add_修为(usr_qq, 10000);
    await Add_灵石(usr_qq, 10000);
    await Add_血气(usr_qq, 10000);
    e.reply(
      '已完成阶段任务1\n获得奖励：\n1.修为*10000\n2.血气*10000\n3.灵石*10000\n师傅获得奖励：师徒积分*5'
    );
    return;
  } else if (
    shitu[i].任务阶段 == 2 &&
    shitu[i].renwu1 == 2 &&
    shitu[i].renwu2 == 2 &&
    shitu[i].renwu3 == 2
  ) {
    shitu[i].任务阶段 = 3;
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    await Write_shitu(shitu);
    player.师徒任务阶段 = 3;
    await Write_player(usr_qq, player);
    player2.师徒积分 += 15;
    await Write_player(jifen, player2);
    await Add_修为(usr_qq, 40000);
    await Add_灵石(usr_qq, 40000);
    await Add_血气(usr_qq, 40000);
    await Add_najie_thing(usr_qq, '功法盒', '盒子', 1);
     await Add_najie_thing(usr_qq, '药水盒', '盒子', 1);
    e.reply(
      '已完成阶段任务2\n获得奖励：\n1.修为*40000\n2.血气*40000\n3.灵石*40000\n师傅获得奖励：师徒积分*15'
    );
    return;
  } else if (
    shitu[i].任务阶段 == 3 &&
    shitu[i].renwu1 == 2 &&
    shitu[i].renwu2 == 2 &&
    shitu[i].renwu3 == 2
  ) {
    shitu[i].任务阶段 = 4;
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    await Write_shitu(shitu);
    player.师徒任务阶段 = 4;
    await Write_player(usr_qq, player);
    player2.师徒积分 += 20;
    await Write_player(jifen, player2);
    await Add_修为(usr_qq, 50000);
    await Add_灵石(usr_qq, 50000);
    await Add_血气(usr_qq, 50000);
     await Add_najie_thing(usr_qq, '道具盒', '盒子', 1);
     await Add_najie_thing(usr_qq, '功法盒', '盒子', 1);
    e.reply(
      '已完成阶段任务3\n获得奖励：\n1.修为*50000\n2.血气*50000\n2.灵石*50000\n师傅获得奖励：师徒积分*20'
    );
    return;
  } else if (
    shitu[i].任务阶段 == 4 &&
    shitu[i].renwu1 == 2 &&
    shitu[i].renwu2 == 2 &&
    shitu[i].renwu3 == 2
  ) {
    shitu[i].任务阶段 = 5;
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    await Write_shitu(shitu);
    player.师徒任务阶段 = 5;
    await Write_player(usr_qq, player);
    player2.师徒积分 += 30;
    await Write_player(jifen, player2);
    await Add_修为(usr_qq, 150000);
    await Add_灵石(usr_qq, 150000);
    await Add_血气(usr_qq, 150000);
     await Add_najie_thing(usr_qq, '药水盒', '盒子', 1);
     await Add_najie_thing(usr_qq, '道具盒', '盒子', 1);
    e.reply(
      '已完成阶段任务4\n获得奖励：\n1.修为*150000\n2.血气*150000\n3.灵石*150000\n师傅获得奖励：师徒积分*30'
    );
    return;
  } else if (
    shitu[i].任务阶段 == 5 &&
    shitu[i].renwu1 == 2 &&
    shitu[i].renwu2 == 2 &&
    shitu[i].renwu3 == 2
  ) {
    shitu[i].任务阶段 = 0;
    shitu[i].renwu1 = 0;
    shitu[i].renwu2 = 0;
    shitu[i].renwu3 = 0;
    shitu[i].未出师徒弟 = 0;
    shitu[i].已出师徒弟.push(A);
    await Write_shitu(shitu);
    player.师徒任务阶段 = 6;
    await Write_player(usr_qq, player);
    player2.师徒积分 += 50;
    await Write_player(jifen, player2);
    await Add_修为(usr_qq, 250000);
    await Add_灵石(usr_qq, 250000);
    await Add_血气(usr_qq, 250000);
     await Add_najie_thing(usr_qq, '功法盒', '盒子', 3);
     await Add_najie_thing(usr_qq, '药水盒', '盒子', 3);
     await Add_najie_thing(usr_qq, '道具盒', '盒子', 3);
    e.reply(
      '已完成阶段任务5，恭喜你成功出师！\n获得奖励：\n1.修为*250000\n2.血气*250000\n3.灵石*250000\n师傅获得奖励：师徒积分*50'
    );
    return;
  } else if (
    shitu[i].renwu1 == 1 ||
    shitu[i].renwu2 == 1 ||
    shitu[i].renwu3 == 1
  ) {
    e.reply('你还有任务没完成哦~');
    return;
  }
}

export async function found_shitu(A) {
  let shitu = await Read_shitu();
  let i;
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].师傅 == A) {
      break;
    }
  }
  return i;
}
export async function found_shitu_2(A) {
  let shitu = await Read_shitu();
  let i;
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].未出师徒弟 == A) {
      break;
    }
  }
  return i;
}
//检索任务状态
export async function get_renwu_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
  let player = await Read_player(usr_qq);
  let user_A;
  let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
  user_A = A;
  let shitu = await Read_shitu();
  let i = await found_shitu_2(user_A);
  let shifu = await find_shitu(A);
  let tudi = await find_tudi(A);
  //无存档
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  //判断对方有没有存档
  if (shifu == 0 && tudi == 0) {
    e.reply('你还没拜师&收徒过！');
    return;
  }
  if (shitu[i].任务阶段 == 1) {
    if (shitu[i].renwu1 == 1 && player.level_id > 9) {
      shitu[i].renwu1 = 2;
    }
    if (shitu[i].renwu2 == 1 && player.Physique_id > 9) {
      shitu[i].renwu2 = 2;
    }
    if (shitu[i].renwu3 == 1 && player.学习的功法 != 0) {
      shitu[i].renwu3 = 2;
    }
    await Write_shitu(shitu);
  } else if (shitu[i].任务阶段 == 2) {
    if (shitu[i].renwu1 == 1 && player.level_id > 17) {
      shitu[i].renwu1 = 2;
    }
    if (shitu[i].renwu2 == 1 && player.Physique_id > 16) {
      shitu[i].renwu2 = 2;
    }
    if (shitu[i].renwu3 == 1 && player.linggenshow == 0) {
      shitu[i].renwu3 = 2;
    }
    await Write_shitu(shitu);
  } else if (shitu[i].任务阶段 == 3) {
    if (shitu[i].renwu1 == 1 && player.level_id > 25) {
      shitu[i].renwu1 = 2;
    }
    if (shitu[i].renwu2 == 1 && player.Physique_id > 23) {
      shitu[i].renwu2 = 2;
    }
    if (shitu[i].renwu3 == 1 && player.灵石 > 3999999) {
      shitu[i].renwu3 = 2;
    }
    await Write_shitu(shitu);
  } else if (shitu[i].任务阶段 == 4) {
    if (shitu[i].renwu1 == 1 && player.level_id > 33) {
      shitu[i].renwu1 = 2;
    }
    if (shitu[i].renwu2 == 1 && player.Physique_id > 30) {
      shitu[i].renwu2 = 2;
    }
    if (
      shitu[i].renwu3 == 1 &&
      player.occupation != 0 &&
      player.occupation_level > 9
    ) {
      shitu[i].renwu3 = 2;
    }
    await Write_shitu(shitu);
  } else if (shitu[i].任务阶段 == 5) {
    if (shitu[i].renwu1 == 1 && player.level_id > 41) {
      shitu[i].renwu1 = 2;
    }
    if (shitu[i].renwu2 == 1 && player.Physique_id > 37) {
      shitu[i].renwu2 = 2;
    }
    if (shitu[i].renwu3 == 1 && shitu[i].师徒BOOS剩余血量 < 1) {
      shitu[i].renwu3 = 2;
    }
    await Write_shitu(shitu);
  } else if (player.师徒任务阶段 != 0 && player.师徒任务阶段 != 6) {
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    shitu[i].任务阶段 = player.师徒任务阶段;
    shitu[i].师徒BOOS剩余血量 = 100000000;
    await Write_shitu(shitu);
    e.reply(
      `任务已刷新！\n你上次任务进行到了阶段${player.师徒任务阶段}已自动为你延续`
    );
    return;
  } else if (player.任务阶段 != 6) {
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    shitu[i].任务阶段 = 1;
    shitu[i].师徒BOOS剩余血量 = 100000000;
    await Write_shitu(shitu);
    player.师徒任务阶段 = 1;
    await Write_player(usr_qq, player);
    e.reply('任务已刷新！');
    return;
  } else {
    e.reply('你已经毕业了，就别来做师徒任务了吧');
    return;
  }
  return;
}
/**
 * 我的弟子
 * @return image
 */
export async function get_shitu_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
  let player = await Read_player(usr_qq);
  let user_A;
  let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
  user_A = A;
  let shitu = await Read_shitu();
  let x = await found_shitu(user_A);
  let shifu = await find_shitu(A);
  //无存档
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  //判断对方有没有存档
  if (shifu == 0) {
    e.reply('你还没有收过徒弟');
    return;
  }

  let action = await find_shitu(A);
  if (action == false) {
    await fstadd_shitu(A);
  }
  let newaction = await Read_shitu();
  let i;
  for (i = 0; i < newaction.length; i++) {
    if (newaction[i].师傅 == A) {
      //有加入宗门
      let ass;
      ass = player.师徒积分;
      let renwu1 = '当前没有任务';
      let renwu2 = '当前没有任务';
      let renwu3 = '当前没有任务';
      let wc1;
      let wc2;
      let wc3;
      let new1 = 0;
      if (newaction[i].未出师徒弟 != 0) {
        new1 = 1;
      }
      let item;
      let chengyuan = [];
      for (item in newaction[i].已出师徒弟) {
        chengyuan[item] =
          '道号：' +
          data.getData('player', newaction[i].已出师徒弟[item]).名号 +
          'QQ：' +
          newaction[i].已出师徒弟[item];
      }
      if (shitu[x].任务阶段 == 1) {
        renwu1 = '练气等级达到筑基巅峰';
        renwu2 = '炼体等级达到炼肉巅峰';
        renwu3 = '学习一个功法';
      } else if (shitu[x].任务阶段 == 2) {
        renwu1 = '练气等级达到元婴中期';
        renwu2 = '练体等级达到炼骨初期';
        renwu3 = '消耗一个定灵珠';
      } else if (shitu[x].任务阶段 == 3) {
        renwu1 = '练气等级达到化神圆满';
        renwu2 = '练体等级达到炼血后期';
        renwu3 = '拥有400w灵石(此项任务不会扣除灵石！)';
      } else if (shitu[x].任务阶段 == 4) {
        renwu1 = '练气等级达到合体后期';
        renwu2 = '练体等级达到炼脏圆满';
        renwu3 = '进行一次转职且等级到达黄袍中品';
      } else if (shitu[x].任务阶段 == 5) {
        renwu1 = '羽化登仙';
        renwu2 = '练体等级达到炼神中期';
        renwu3 = '击败师徒BOSS';
      }
      if (shitu[x].renwu1 == 0) {
        wc1 = '(未接取)';
      } else if (shitu[x].renwu1 == 1) {
        wc1 = '(未完成)';
      } else if (shitu[x].renwu1 == 2) {
        wc1 = '(已完成)';
      }
      if (shitu[x].renwu2 == 0) {
        wc2 = '(未接取)';
      } else if (shitu[x].renwu2 == 1) {
        wc2 = '(未完成)';
      } else if (shitu[x].renwu2 == 2) {
        wc2 = '(已完成)';
      }
      if (shitu[x].renwu3 == 0) {
        wc3 = '(未接取)';
      } else if (shitu[x].renwu3 == 1) {
        wc3 = '(未完成)';
      } else if (shitu[x].renwu3 == 2) {
        wc3 = '(已完成)';
      }
      let newchengyuan = data.getData('player', newaction[i].未出师徒弟).名号;
      let shitu_data = {
        user_id: usr_qq,
        minghao: player.名号,
        shifu: newaction[i].师傅,
        shimen: ass,
        renwu: newaction[i].任务阶段,
        tudinum: newaction[i].已出师徒弟.length + new1,
        rw1: renwu1,
        rw2: renwu2,
        rw3: renwu3,
        wancheng1: wc1,
        wancheng2: wc2,
        wancheng3: wc3,
        chengyuan: chengyuan,
        newchengyuan: newchengyuan,
      };
      const data1 = await new Show(e).get_shituData(shitu_data);
      return await puppeteer.screenshot('shitu', {
        ...data1,
      });
    }
  }
}
/**
 * 我的师傅
 * @return image
 */
export async function get_shifu_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
  let player = await Read_player(usr_qq);
  let user_A;
  let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
  user_A = A;
  let shitu = await Read_shitu();
  let x = await found_shitu_2(user_A);
  //无存档
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let action = await find_shitu(A);
  if (action == false) {
    await fstadd_shitu(A);
  }
  let newaction = await Read_shitu();
  let i;
  let newi = await chushi(A);
  if (newi == undefined) {
    newi = [5, 5];
  }
  for (i = 0; i < newaction.length; i++) {
    if (newaction[i].未出师徒弟 == A || newi[0] == A) {
      //有加入宗门;
      if (newi[0] == A) {
        newaction[i] = newi[1];
      }
      let ass;
      ass = player.师徒积分;
      let renwu1 = '请先输入"#提交任务"获取任务';
      let renwu2 = '请先输入"#提交任务"获取任务';
      let renwu3 = '请先输入"#提交任务"获取任务';
      let wc1;
      let wc2;
      let wc3;
      let new1 = 0;
      if (newaction[i].未出师徒弟 != 0) {
        new1 = 1;
      }
      let item;
      let chengyuan = [];
      for (item in newaction[i].已出师徒弟) {
        if (newaction[i].已出师徒弟[item] == A) {
          continue;
        }
        chengyuan[item] =
          '道号：' +
          data.getData('player', newaction[i].已出师徒弟[item]).名号 +
          'QQ：' +
          newaction[i].已出师徒弟[item];
      }
      if (shitu[x].任务阶段 == 1) {
        renwu1 = '练气等级达到筑基巅峰';
        renwu2 = '炼体等级达到炼肉巅峰';
        renwu3 = '学习一个功法';
      } else if (shitu[x].任务阶段 == 2) {
        renwu1 = '练气等级达到元婴中期';
        renwu2 = '练体等级达到炼骨初期';
        renwu3 = '消耗一个定灵珠';
      } else if (shitu[x].任务阶段 == 3) {
        renwu1 = '练气等级达到化神圆满';
        renwu2 = '练体等级达到炼血后期';
        renwu3 = '拥有400w灵石(此项任务不会扣除灵石！)';
      } else if (shitu[x].任务阶段 == 4) {
        renwu1 = '练气等级达到合体后期';
        renwu2 = '练体等级达到炼脏圆满';
        renwu3 = '进行一次转职且等级到达黄袍中品';
      } else if (shitu[x].任务阶段 == 5) {
        renwu1 = '羽化登仙';
        renwu2 = '练体等级达到炼神中期';
        renwu3 = '击败师徒BOSS';
      }
      if (shitu[x].renwu1 == 0) {
        wc1 = '(未接取)';
      } else if (shitu[x].renwu1 == 1) {
        wc1 = '(未完成)';
      } else if (shitu[x].renwu1 == 2) {
        wc1 = '(已完成)';
      }
      if (shitu[x].renwu2 == 0) {
        wc2 = '(未接取)';
      } else if (shitu[x].renwu2 == 1) {
        wc2 = '(未完成)';
      } else if (shitu[x].renwu2 == 2) {
        wc2 = '(已完成)';
      }
      if (shitu[x].renwu3 == 0) {
        wc3 = '(未接取)';
      } else if (shitu[x].renwu3 == 1) {
        wc3 = '(未完成)';
      } else if (shitu[x].renwu3 == 2) {
        wc3 = '(已完成)';
      }
    }
  }
      let shifu = data.getData('player', newaction[i].师傅).名号;
      let shifu_data = {
        user_id: usr_qq,
        minghao: player.名号,
        shifu: shifu,
        shimen: ass,
        renwu: newaction[i].任务阶段,
        tudinum: newaction[i].已出师徒弟.length + new1,
        rw1: renwu1,
        rw2: renwu2,
        rw3: renwu3,
        wancheng1: wc1,
        wancheng2: wc2,
        wancheng3: wc3,
        chengyuan: chengyuan,
      };
      const data1 = await new Show(e).get_shifuData(shifu_data);
      return await puppeteer.screenshot('shifu', {
        ...data1,
      });
    
}

// }<---这个括号导致整个插件无法运行，罪大恶极

export async function chushi(A) {
  let t;
  let i;
  let newaction = await Read_shitu();
  for (i = 0; i < newaction.length; i++) {
    for (t = 0; t < newaction[i].已出师徒弟.length; t++) {
      if (newaction[i].已出师徒弟[t] == A) {
        return [newaction[i].已出师徒弟[t], newaction[i]];
      }
    }
  }
}
export {

  get_random_aptitude  // 确保这一行存在
};

// 创建内景地空间
export async function Create_inner_world(usr_qq) {
  const dir = path.join(__PATH.inner_world_path, `${usr_qq}.json`);
  
  if (!fs.existsSync(__PATH.inner_world_path)) {
    fs.mkdirSync(__PATH.inner_world_path, { recursive: true });
  }
  
  fs.writeFileSync(dir, JSON.stringify(createInnerWorld(), null, 2), 'utf8');
}

// 读取内景地空间
export async function Read_inner_world(usr_qq) {
  const dir = path.join(__PATH.inner_world_path, `${usr_qq}.json`);
  
  if (!fs.existsSync(dir)) {
    await Create_inner_world(usr_qq);
  }
  
  return JSON.parse(fs.readFileSync(dir, 'utf8'));
}

// 写入内景地空间
export async function Write_inner_world(usr_qq, data) {
  const dir = path.join(__PATH.inner_world_path, `${usr_qq}.json`);
  fs.writeFileSync(dir, JSON.stringify(data, null, 2), 'utf8');
}

// 添加物品到内景地
// 修改 Add_inner_world_thing 支持合并相同物品
export async function Add_inner_world_thing(usr_qq, item, category) {
  const innerWorld = await Read_inner_world(usr_qq);
  
  if (!Array.isArray(innerWorld[category])) {
    innerWorld[category] = [];
  }

  // 查找是否已存在相同物品
  const existingItem = innerWorld[category].find(
    i => i.name === item.name && i.pinji === item.pinji
  );

  if (existingItem) {
    existingItem.数量 += (item.数量 || 1); // 合并数量
  } else {
    innerWorld[category].push(item);
  }

  // 更新当前容量
  innerWorld.当前容量 += getItemSize(item, category);
  await Write_inner_world(usr_qq, innerWorld);
}

// 从内景地移除物品
// 修改 Remove_inner_world_thing
export async function Remove_inner_world_thing(usr_qq, itemName, category) {
  const innerWorld = await Read_inner_world(usr_qq);
  
  const [removedItem] = innerWorld[category].filter(
    item => item.name === itemName
  );
  
  if (removedItem) {
    innerWorld[category] = innerWorld[category].filter(
      item => item.name !== itemName
    );
    // 扣除对应容量
    innerWorld.当前容量 -= getItemSize(removedItem, category);
    await Write_inner_world(usr_qq, innerWorld);
    return removedItem; // 返回被移除的物品
  }
  
  return null; // 未找到物品
}
// 计算物品占用空间
export function getItemSize(item, category) {
  const rule = ITEM_SPACE_RULES[category] || ITEM_SPACE_RULES['默认'];
  return rule(1) * (item.数量 || 1); 
}

// 检查能否存入
export async function checkStorageSpace(usr_qq, itemSize) {
  const innerWorld = await Read_inner_world(usr_qq);
  return innerWorld.当前容量 + itemSize <= innerWorld.最大容量;
}
/* ---------- 辅助：读位面等级 ---------- */
export async function getWeimianLevel() {
  try {
    const path = data.filePathMap.weimianList;
    if (!fs.existsSync(path)) return 10;
    return JSON.parse(fs.readFileSync(path, 'utf8'))['诸天位面'] || 10;
  } catch {
    return 10;
  }
}