import plugin from '../../../../lib/plugins/plugin.js';
import data from '../../model/XiuxianData.js';
import common from '../../../../lib/common/common.js';
import config from '../../model/Config.js';
import Show from '../../model/show.js';
import puppeteer from '../../../../lib/puppeteer/puppeteer.js';
import { __PATH } from '../../model/xiuxian.js';
import {
  existplayer,
  Read_player,
  Add_源石,
  Write_player,
  Read_najie,
  isNotNull,
  bigNumberTransform,
  Locked_najie_thing,
  channel
} from '../../model/xiuxian.js';
import { Add_najie_thing,convert2integer} from '../../model/xiuxian.js';

// const intervalTime = 7 * 24 * 60 * 60 * 1000;

/**
 * 全局变量
 */
let allaction = false; //全局状态判断
/**
 * 拍卖系统
 */
export class Auction2 extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'Auction2',
      /** 功能描述 */
      dsc: '内场拍卖模块',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 600,
      rule: [
        {
          reg: '^#查看当前内场拍卖$',
          fnc: 'show_auction2',
        },
        {
          reg: '^#内场竞价[0-9]*$',
          fnc: 'offer_price2',
        },
        {
          reg: '^#星阁内场出价[0-9]*$',
          fnc: 'offer_priceXINGGE2',
        },
        {
          reg: '^#星阁内场拍卖行$',
          fnc: 'xingGE2',
        },
        {
          reg: '^#开启星阁内场体系$',
          fnc: 'openAction2',
        },
        {
          reg: '^#取消星阁内场体系$',
          fnc: 'cancalAction2',
        },
        {
          reg: '^#关闭星阁内场体系$',
          fnc: 'offAction2',
        },
                {
          reg: '^#星阁内场验资$',
          fnc: 'yanzhi',
        },
      ],
    });
    this.set = config.getConfig('xiuxian', 'xiuxian');
  }
 async yanzhi(e) {
    if (!e.isGroup) {
      return;
    }
    let usr_qq = e.user_id;
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        e.reply('玩家不存在，请先创建角色');
        return;
    }
    
    let player = await Read_player(usr_qq);
    // 检查是否已是贵宾
    if (player.星阁内场 && player.星阁内场 === 1) {
        e.reply('您已是星阁内场贵宾，无需再次验资');
        return;
    }
    if (player.源石 < 12000000) {
      e.reply('你的资产实在少的可怜，请积累到一千二百万源石再来内场拍卖行验资吧');
      return;
    }
    player.星阁内场 =1;
    await Write_player(usr_qq, player);
    await Add_源石(usr_qq, -5000000);
   return e.reply('你花费了五百万源石获得了星阁内场贵宾身份');

  }
 async xingGE2(e) {
    if (!e.isGroup) return;
    
     //固定写法
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
     let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
      return;
    }
    const auctionStr = await redis.get('xiuxian:AuctionofficialTask2');
    if (!auctionStr) {
        e.reply('目前星阁内场没有拍卖正在进行');
        return;
    }
    
    const auction = JSON.parse(auctionStr);
    const item = auction.thing;
    
    let msg = [
        '___[星阁内场拍卖行]___',
        `拍卖物品：${item.name}`,
        `物品类别：${item.class}`,
        `物品数量：${auction.amount}`,
        `起拍价格：${bigNumberTransform(auction.start_price)}源石`,
        `当前最高价：${bigNumberTransform(auction.last_price)}源石`
    ];
    
    if (auction.last_offer_player === 0) {
        msg.push('暂无人出价');
    } else {
        const player = await Read_player(auction.last_offer_player);
        msg.push(`最高出价者：${player.名号}`);
    }
    
    // 添加物品描述
    if (item.desc) {
        msg.push(`物品描述：${item.desc}`);
    }
    
    e.reply(msg.join('\n'));
}


  async openAction2(e) {

    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }

    // 如果星阁已经开了，将本群加入Redis
    // INFO: 缺省判断是否在进行，GroupList判断哪些群开启了星阁体系
    const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList2';
    const groupList = await redis.sMembers(redisGlKey);
    if (groupList.length > 0) {
      if (await redis.sIsMember(redisGlKey, String(e.group_id))) {
        console.log(await redis.sMembers(redisGlKey));
        return e.reply('星阁内场拍卖行已经开啦');
      }
      await redis.sAdd(redisGlKey, String(e.group_id));
      return e.reply('星阁内场已开启，已将本群添加至星阁内场体系');
    }

    // 如果没开，判断是否在开启时间
    const nowDate = new Date();
    const todayDate = new Date(nowDate);
    const { openHour, closeHour } = this.set.Auction2;
    const todayTime = todayDate.setHours(0, 0, 0, 0);
    const openTime = todayTime + openHour * 60 * 60 * 1000;
    const nowTime = nowDate.getTime();
    const closeTime = todayTime + closeHour * 60 * 60 * 1000;
    if (nowTime > openTime && nowTime < closeTime) {
      // 如果在拍卖时间，随机一个物品来开启
      const auction = await openAU();
      let msg = `___[星阁内场]___\n目前正在拍卖【${auction.thing.name}x${auction.amount}】\n`;
      if (auction.last_offer_player === 0) {
        msg += '暂无人出价';
      } else {
        const player = await Read_player(auction.last_offer_player);
        msg += `最高出价是${player.名号}叫出的${auction.last_price}`;
      }
      await e.reply(msg);
    }

    // const addTIME = intervalTime;
    // await redis.set(
    //   'xiuxian:AuctionofficialTaskENDTIME',
    //   JSON.stringify(Date.now() + addTIME)
    // );

    // await redis.set('xiuxian:AuctionofficialTask_E', e.group_id); NOTE: 过时的
    try {
      await redis.del(redisGlKey);
    } catch (_) {}
    await redis.sAdd(redisGlKey, String(e.group_id));
    return e.reply('星阁内场体系在本群开启！');
  }

  async cancalAction2(e) {
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }

    const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList2';
    if (!redis.sIsMember(redisGlKey, String(e.group_id))) {
      return e.reply('本来就没开取消个冒险');
    }
    await redis.sRem(redisGlKey, String(e.group_id));

    return e.reply('星阁内场体系在本群取消了');
  }

  async offAction2(e) {
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList2';
    await redis.del('xiuxian:AuctionofficialTask2');
    await redis.del(redisGlKey);
    // await redis.set(
    //   'xiuxian:AuctionofficialTaskENDTIME',
    //   JSON.stringify(1145141919181145)
    // );
    return e.reply('星阁内场体系已关闭！');
  }

  /*出价10000 */
  async offer_priceXINGGE2(e) {
    if (!e.isGroup) {
      return;
    }
    //固定写法
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //判断是否为匿名创建存档
    if (usr_qq == 80000000) {
      return;
    }
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
      return;
    }
    // 此群是否开启星阁体系
    const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList2';
    if (!(await redis.sIsMember(redisGlKey, String(e.group_id)))) return;
    // 是否到拍卖时间
    let auction = await redis.get('xiuxian:AuctionofficialTask2');
    if (!isNotNull(auction)) {
      const { openHour, closeHour } = config.getConfig(
        'xiuxian',
        'xiuxian'
      ).Auction2;
      e.reply(`不在拍卖时间，开启时间为每天${openHour}时~${closeHour}时`);
      return;
    }

    let player = await Read_player(usr_qq);
    auction = JSON.parse(auction);
    // let start_price = auction.start_price;
    let last_price = auction.last_price;
    let new_price = e.msg.replace('#星阁内场出价', '');
    new_price = parseInt(new_price);
    if (isNaN(new_price)) {
      new_price = parseInt(Math.ceil(last_price * 1.1));
    } else {
      if (new_price < Math.ceil(last_price * 1.1)) {
        e.reply(`最新价格为${last_price}源石，每次加价不少于10 %！`);
        return;
      }
    }
        if (!player.星阁内场) {
      e.reply('由于你没有验资过资产，被星阁内场守门人给狼狈的赶了出来');
      return;
    }
    if (player.源石 < new_price) {
      e.reply('没这么多钱也想浑水摸鱼?');
      return;
    }

    // if (auction.group_id.indexOf(e.group_id) < 0) {
    //   auction.group_id += '|' + e.group_id;
    // } NOTE: 过时的
    // 关掉了
    // await redis.sAdd(redisGlKey, String(e.group_id));
    auction.groupList = await redis.sMembers(redisGlKey);

    const msg = `${player.名号}叫价${new_price} `;
    auction.groupList.forEach(group_id => pushInfo(group_id, true, msg));
    // ↑新的：RetuEase

    auction.last_price = new_price;
    auction.last_offer_player = usr_qq;
    auction.last_offer_price = new Date().getTime(); // NOTE: Big SB
    await redis.set('xiuxian:AuctionofficialTask2', JSON.stringify(auction));
  }

  async show_auction2(e) {
    if (!e.isGroup) {
      return;
    }
    //固定写法
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //判断是否为匿名创建存档
    if (usr_qq == 80000000) {
      return;
    }
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
      return;
    }
    let auction = await redis.get('xiuxian:auction2');
    if (!isNotNull(auction)) {
      e.reply('目前没有拍卖正在进行');
      return;
    }
    auction = JSON.parse(auction);
    let tmp = '';
    if (auction.last_offer_player == 0) {
      tmp = '暂无人出价';
    } else {
      let player = await Read_player(auction.last_offer_player);
      tmp = `最高出价是${player.名号}叫出的${auction.last_price}`;
    }
    let msg = '___[星阁内场拍卖行]___\n';
    msg += `目前正在拍卖【${auction.thing.name}x${auction.amount}】\n${tmp}`;
    e.reply(msg);
  }




  /*竞价10000 */
  async offer_price2(e) {
    if (!e.isGroup) {
      return;
    }
    //固定写法
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //判断是否为匿名创建存档
    if (usr_qq == 80000000) {
      return;
    }
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
      return;
    }
    let auction = await redis.get('xiuxian:auction2');
    if (!isNotNull(auction)) {
      e.reply(`没有拍卖正在进行`);
      return;
    }
    let player = await Read_player(usr_qq);
    auction = JSON.parse(auction);
    if (usr_qq == auction.qq) {
      e.reply('禁止自娱自乐！');
      return;
    }
    if (usr_qq == auction.last_offer_player) {
      e.reply('不会吧不会吧，不会还有人抬自己的价吧？');
      return;
    }
    // let start_price = auction.start_price;
    let last_price = auction.last_price;
    let new_price = e.msg.replace('#内场竞价', '');
    new_price = parseInt(new_price);
    if (isNaN(new_price)) {
      new_price = parseInt(last_price * 1.1);
    } else {
      if (new_price <= last_price * 1.1) {
        e.reply(`最新价格为${last_price}源石，每次加价不少于10 %！`);
        return;
      }
    }
            if (!player.星阁内场) {
      e.reply('由于你没有验资过资产，被星阁内场守门人给狼狈的赶了出来');
      return;
    }
    if (player.源石 < new_price) {
      e.reply('没这么多钱也想浑水摸鱼?');
      return;
    }
    if (auction.group_id.indexOf(e.group_id) < 0) {
      auction.group_id += '|' + e.group_id;
    }
    e.reply(`${player.名号}叫价${new_price} `);
    auction.last_price = new_price;
    auction.last_offer_player = usr_qq;
    auction.last_offer_price = new Date().getTime();
    await redis.set('xiuxian:auction2', JSON.stringify(auction));
  }
}



export async function get_supermarket_img(e, thing_type) {
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



export async function openAU() {
  const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList2';

  const random = Math.floor(Math.random() * data.xingge2.length);
  const thing_data = data.xingge2[random];
  const thing_value = Math.floor(thing_data.出售价);
  const thing_amount = Math.floor(thing_data.数量);
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
  await redis.set('xiuxian:AuctionofficialTask2', JSON.stringify(wupin));
  return wupin;
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
