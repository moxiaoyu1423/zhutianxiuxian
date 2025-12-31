import { plugin, verc, data, config } from '../../api/api.js';

import {
  Read_player,
  existplayer,
  isNotNull,
  sleep,
  exist_najie_thing,
  Add_najie_thing,

} from '../../model/xiuxian.js';

import {
  Add_灵石,
  Add_修为,
   Add_血气,
   Add_寿元,
  exist_hunyin,
  find_qinmidu,
  add_qinmidu,
  Goweizhi,
  Write_player,
  xunbaoweizhi,
  Go,
  channel,
  Read_renwu,
  Write_renwu,
  find_renwu,
} from '../../model/xiuxian.js';
import Show from "../../model/show.js";
import puppeteer from "../../../../lib/puppeteer/puppeteer.js";
export class tianjishop extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_tianjishop',
      dsc: '天机阁模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#天机阁兑换.*$',
          fnc: 'daibiduihuan',
        },
        {
          reg: '^#天机符楼兑换.*$',
          fnc: 'daibiduihuan2',
        },
        {
         reg: '^#创造命运仙轮.*$',
         fnc: 'xianlun'
        },
         {
          reg: '^#天机阁',
          fnc: 'yijishop',
        },
         {
          reg: '^#天机符楼',
          fnc: 'yijishop2',
        }
      ],
    });
  }
        //活动
      async yijishop(e) {
  
          //不开放私聊功能
          if (!e.isGroup) {
              e.reply('修仙游戏请在群聊中游玩');
              return;
          }
          let img = await get_yijishop_img(e);
          e.reply(img);
          return;
      }
async yijishop2(e) {
    if (!e.isGroup) return e.reply('修仙游戏请在群聊中游玩');
    
    const usr_qq = e.user_id.toString().replace('qg_', '');
    const hasInvitation = await exist_najie_thing(usr_qq, "天机符楼邀请函", "道具");
    
    if (!hasInvitation) {
        return e.reply([
            "【天机符楼·禁制】",
            "门前浮现金色符文：",
            "「非持函者不得窥视楼内天机！」",
            "",
            "获取方式：",
            "天机阁购买（#天机阁兑换 天机符楼邀请函）",
        ].join('\n'));
    }

    let img = await get_yijishop2_img(e);
    e.reply(img);
}
async daibiduihuan(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);

    // 获取输入信息
    let msg = e.msg.replace("#天机阁兑换", "").trim();
    let bool = msg.indexOf("*");
    
    // 分割文本变数组
    let code = [];
    if (bool > 0) {
        code = msg.split("*");
    } else {
        code.push(msg);
        code.push(1);
    }

    // 获取物品名和数量
    let thing_name = code[0].trim();
    let shuliang = await convert2integer(code[1]);
    
    // 确保数量是数字类型
    shuliang = Number(shuliang);
    if (isNaN(shuliang) || shuliang <= 0) {
        e.reply("兑换数量必须为正整数");
        return;
    }
    
    // 获取活动商店数据
    let commodities_list = data.tianjige_list;
    let commodity = commodities_list.find(item => item.name === thing_name);
    
    if (!commodity) {
        e.reply(`天机阁中没有【${thing_name}】这件宝物`);
        return;
    }

    // 计算所需代币数量
    let quantity = commodity.出售价 * shuliang;
    
    // 确保代币数量是数字
    quantity = Number(quantity);
    
    // 检查代币是否足够
    let success = false;
    let usedDaibi = null;
    
    // 优先尝试daibi
    if (commodity.daibi) {
        let shu_daibi = await exist_najie_thing(usr_qq, commodity.daibi, "道具");
        
        // 确保代币数量是数字
        shu_daibi = Number(shu_daibi);
        
        if (shu_daibi >= quantity) {
            // 添加物品时确保数量是数字
            await Add_najie_thing(usr_qq, commodity.daibi, "道具", -quantity);
            await Add_najie_thing(usr_qq, commodity.name, commodity.class, shuliang);
            e.reply(`成功兑换【${commodity.name}】x${shuliang}，消耗【${commodity.daibi}】x${quantity}`);
            return;
        }
    }
    
    // 如果daibi不足或没有daibi，尝试daibi2
    if (commodity.daibi2) {
        let shu_daibi2 = await exist_najie_thing(usr_qq, commodity.daibi2, "道具");
        
        // 确保代币数量是数字
        shu_daibi2 = Number(shu_daibi2);
        
        if (shu_daibi2 >= quantity) {
            // 添加物品时确保数量是数字
            await Add_najie_thing(usr_qq, commodity.daibi2, "道具", -quantity);
            await Add_najie_thing(usr_qq, commodity.name, commodity.class, shuliang);
            e.reply(`成功兑换【${commodity.name}】x${shuliang}，消耗【${commodity.daibi2}】x${quantity}`);
            return;
        }
    }
    
    // 两种代币都不足
    let errorMsg = `兑换需要`;
    let hasFirst = false;
    
    if (commodity.daibi) {
        let shu_daibi = await exist_najie_thing(usr_qq, commodity.daibi, "道具") || 0;
        shu_daibi = Number(shu_daibi); // 确保是数字
        errorMsg += `【${commodity.daibi}】x${quantity}（当前：${shu_daibi}）`;
        hasFirst = true;
    }
    
    if (commodity.daibi2) {
        if (hasFirst) errorMsg += " 或 ";
        let shu_daibi2 = await exist_najie_thing(usr_qq, commodity.daibi2, "道具") || 0;
        shu_daibi2 = Number(shu_daibi2); // 确保是数字
        errorMsg += `【${commodity.daibi2}】x${quantity}（当前：${shu_daibi2}）`;
    }
    
    e.reply(errorMsg);
}
async daibiduihuan2(e) {
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    let player = await Read_player(usr_qq);
    // 1. 检查邀请函
    const hasInvitation = await exist_najie_thing(usr_qq, "天机符楼邀请函", "道具");
    if (!hasInvitation) {
        return e.reply([
            "天机符楼守卫拦住了你",
            "「此地乃天机重地，需持邀请函方可入内！」",
            "请先获取【天机符楼邀请函】后再尝试兑换"
        ].join('\n'));
    }

    // 2. 解析输入指令
    let msg = e.msg.replace("#天机符楼兑换", "").trim();
    let parts = msg.split("*").map(s => s.trim());
    
    // 3. 获取物品名和数量
    let thing_name = parts[0];
    let shuliang = parts.length > 1 ? await convert2integer(parts[1]) : 1;
    shuliang = Number(shuliang);
    
    // 4. 验证数量有效性
    if (isNaN(shuliang) || shuliang <= 0) {
        return e.reply("兑换数量必须为正整数");
    }

    // 5. 查找商品信息
    let commodity = data.tianjige2_list.find(item => item.name === thing_name);
    if (!commodity) {
        return e.reply(`天机符楼中没有【${thing_name}】这件宝物`);
    }

    // 6. 全服每日限购检查
    const today = new Date().toISOString().split('T')[0]; // 格式：YYYY-MM-DD
    const globalLimitKey = `tianjige2:global_limit:${today}:${commodity.name}`;
    
    // 获取当前已兑换数量
    let boughtToday = await redis.get(globalLimitKey) || 0;
    boughtToday = Number(boughtToday);
    
    // 检查剩余可兑换量
    if (commodity.每日限购 && (boughtToday + shuliang > commodity.每日限购)) {
        return e.reply([
            `全服今日限购已达上限！`,
            `【${commodity.name}】全服每日限购 ${commodity.每日限购} 个`,
            `今日已被兑换：${boughtToday}`,
            `剩余可兑换：${Math.max(0, commodity.每日限购 - boughtToday)}`
        ].join('\n'));
    }

    // 7. 计算总价
    const totalCost = commodity.出售价 * shuliang;

    // 8. 特殊处理灵石兑换
    if (commodity.daibi === "灵石") {
        if (player.灵石 < totalCost) {
            return e.reply([
                `灵石不足！`,
                `需要：${totalCost.toLocaleString()} 灵石`,
                `当前拥有：${player.灵石}`
            ].join('\n'));
        }

        // 执行兑换
        await Add_灵石(usr_qq, -totalCost);
        await Add_najie_thing(usr_qq, commodity.name, commodity.class, shuliang);
        
        // 更新全服限购计数（原子操作）
        await redis.incrBy(globalLimitKey, shuliang);  // 注意大写 B
        await redis.expire(globalLimitKey, 86400 * 2);

        return e.reply([
            `兑换成功！`,
            `获得：【${commodity.name}】×${shuliang}`,
            `消耗：${totalCost.toLocaleString()} 灵石`,
            `全服今日剩余可兑换：${commodity.每日限购 - (boughtToday + shuliang)}`
        ].join('\n'));
    }

    // 9. 普通道具兑换
    const daibiItem = await exist_najie_thing(usr_qq, commodity.daibi, "道具");
    if (daibiItem < totalCost) {
        return e.reply([
            `${commodity.daibi}不足！`,
            `需要：${totalCost.toLocaleString()} ${commodity.daibi}`,
            `当前拥有：${daibiItem.toLocaleString()}`
        ].join('\n'));
    }

    // 执行兑换
    await Add_najie_thing(usr_qq, commodity.daibi, "道具", -totalCost);
    await Add_najie_thing(usr_qq, commodity.name, commodity.class, shuliang);
    
    // 更新全服限购计数（原子操作）
    await redis.incrBy(globalLimitKey, shuliang);
    await redis.expire(globalLimitKey, 86400 * 2);

    return e.reply([
        `兑换成功！`,
        `获得：【${commodity.name}】×${shuliang}`,
        `消耗：${totalCost.toLocaleString()} ${commodity.daibi}`,
        `全服今日剩余可兑换：${commodity.每日限购 - (boughtToday + shuliang)}`
    ].join('\n'));
}



async xianlun(e) {
    // 群聊限定
    if (!e.isGroup) {
        e.reply('修仙游戏请在群聊中游玩');
        return;
    }
    
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    
    // 检查玩家是否存在
    if (!await existplayer(usr_qq)) {
        return;
    }
    
    await Go(e);
    let player = await Read_player(usr_qq);
    let msg = e.msg.toString();
    
    // 默认数量为1
    let shu = 1;
    
    // 如果消息包含*，尝试解析数量
    if (msg.includes("*")) {
        let code = msg.split("*");
        // 使用convert2integer转换数量
        shu = await convert2integer(code[1]);
        // 确保数量是数字类型
        shu = Number(shu);
        if (isNaN(shu) || shu <= 0) {
            shu = 1;
        }
    }
    
    // 获取所需材料数量
    let shu1 = await exist_najie_thing(usr_qq, "旧神印章", "材料");
    let shu2 = await exist_najie_thing(usr_qq, "仙王残魂", "材料");
    let shu3 = await exist_najie_thing(usr_qq, "轮回印", "材料");
    
    // 确保材料数量是数字类型
    shu1 = Number(shu1);
    shu2 = Number(shu2);
    shu3 = Number(shu3);
    
    if (shu1 < shu || shu2 < shu || shu3 < shu) {
        e.reply(`缺少至关重要的一样东西，无法创造命运仙轮！`);
        return;
    }
    
    // 消耗材料（确保传入数字）
    await Add_najie_thing(usr_qq, "旧神印章", "材料", -shu);
    await Add_najie_thing(usr_qq, "仙王残魂", "材料", -shu);
    await Add_najie_thing(usr_qq, "轮回印", "材料", -shu);
    
    // 添加命运仙轮（确保传入数字）
    await Add_najie_thing(usr_qq, "命运仙轮", "道具", shu);
    
    e.reply(`你将仙王残魂和旧神印章炼化，融入到轮回印中，创造出了【命运仙轮】*${shu}`);
    return;
}}
/**
 * 
 * @param {*} amount 输入数量
 * @returns 返回正整数
 */
export async function convert2integer(amount) {
    let number = 1;
    let reg = new RegExp(/^[1-9]\d*$/);
    if (!reg.test(amount)) {
        return number;
    }
    else {
        return amount;
    }
}
/**
 *天机阁
 */
export async function get_yijishop_img(e) {
     let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let ifexistplay = data.existData("player", usr_qq);
    if (!ifexistplay) {
        return;
    }
    let commodities_list = data.tianjige_list;
    let yijishop_data = {
        user_id: usr_qq,
        commodities_list: commodities_list
    }
    const data1 = await new Show(e).get_yijishopData(yijishop_data);
    let img = await puppeteer.screenshot("yijishop", {
        ...data1,
    });
    return img;
}
/**
 *天机符楼
 */
export async function get_yijishop2_img(e) {
    let usr_qq = e.user_id.toString().replace('qg_', '');
    usr_qq = await channel(usr_qq);
    
    // 检查玩家存在性
    if (!data.existData("player", usr_qq)) return;

    // 检查邀请函
    const has_invitation = await exist_najie_thing(usr_qq, "天机符楼邀请函", "道具");
    
    // 获取商品列表并添加限购信息
    let commodities_list = await Promise.all(data.tianjige2_list.map(async item => {
        if (!item.每日限购) return item;
        
        // 获取今日已兑换数量
        const today = new Date().toISOString().split('T')[0];
        const redisKey = `tianjige2:global_limit:${today}:${item.name}`;
        const boughtToday = await redis.get(redisKey) || 0;
        
        return {
            ...item,
            bought_today: Number(boughtToday),
            remaining: item.每日限购 - boughtToday
        };
    }));

    // 准备渲染数据
    let yijishop2_data = {
        user_id: usr_qq,
        commodities_list: commodities_list,
        has_invitation: has_invitation,
        invitation_count: has_invitation 
            ? await exist_najie_thing(usr_qq, "天机符楼邀请函", "道具") 
            : 0,
        timestamp: new Date().toLocaleString()
    };

    // 生成图片
    const data1 = await new Show(e).get_yijishop2Data(yijishop2_data);
    return puppeteer.screenshot("yijishop2", data1);
}