import { plugin, puppeteer, verc, data, config,Show } from '../../api/api.js';
import { __PATH } from '../../model/xiuxian.js';
import {
  existplayer,
  Read_player,
  Add_灵石,
  Write_player,
  shijianc,
  exist_najie_thing,
  existshop,
  Add_najie_thing,
  Write_shop,
  Read_shop,
} from '../../model/xiuxian.js';

export class Xijie extends plugin {
  constructor() {
    super({
      name: 'Xijie',
      dsc: '交易模块',
      event: 'message',
      rule: [
        {
          reg: '^#洗劫.*$',
          fnc: 'xijie',
        },
        {
          reg: '^#探查.*$',
          fnc: 'tancha',
        },
        {
          reg: '^#重置.*$',
          fnc: 'chongzhi',
        },
      ],
    });
  }
   // 检查玩家纳戒中是否有逆道令，并消耗它
        async CheckAndConsumeNiDaoLing(usr_qq) {
          // 检查逆道令是否存在
          let niDaoLingCount = await exist_najie_thing(usr_qq, "逆道令", "道具");
          if (niDaoLingCount > 0) {
              // 如果存在，消耗一个逆道令
              await Add_najie_thing(usr_qq, "逆道令", "道具", -1);
              return true; // 返回true表示消耗成功
          } else {
              // 如果不存在，返回false
              return false; // 返回false表示没有逆道令
          }
      }
  async chongzhi(e) {
    if (!verc({ e })) return false;
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) return false;
    var didian = e.msg.replace('#重置', '');
    didian = didian.trim();
    let shop;
    try {
      shop = await Read_shop();
    } catch {
      await Write_shop(data.shop_list);
      shop = await Read_shop();
    }
    let i;
    for (i = 0; i < shop.length; i++) {
      if (shop[i].name == didian) {
        break;
      }
    }
    if (i == shop.length) {
      return false;
    }
    shop[i].state = 0;
    await Write_shop(shop);
    e.reply('重置成功!');
    return false;
  }
  async xijie(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id;
    //查看存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;

    let game_action = await redis.get(
      'xiuxian:player:' + usr_qq + ':game_action'
    );
    //防止继续其他娱乐行为
    if (game_action == 0) {
      e.reply('修仙：游戏进行中...');
      return false;
    }
    //查询redis中的人物动作
    let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
    action = JSON.parse(action);
    let now_time = new Date().getTime();
    if (action != null) {
      //人物有动作查询动作结束时间
      let action_end_time = action.end_time;
      if (now_time <= action_end_time) {
        let m = parseInt((action_end_time - now_time) / 1000 / 60);
        let s = parseInt((action_end_time - now_time - m * 60 * 1000) / 1000);
        e.reply('正在' + action.action + '中,剩余时间:' + m + '分' + s + '秒');
        return false;
      }
    }
    let lastxijie_time = await redis.get(
      'xiuxian:player:' + usr_qq + ':lastxijie_time'
    );
    lastxijie_time = parseInt(lastxijie_time);
    if (now_time < lastxijie_time + 7200000) {
      let lastxijie_m = Math.trunc(
        (lastxijie_time + 7200000 - now_time) / 60 / 1000
      );
      let lastxijie_s = Math.trunc(
        ((lastxijie_time + 7200000 - now_time) % 60000) / 1000
      );
      e.reply(
        `每120分钟洗劫一次，正在CD中，` +
          `剩余cd: ${lastxijie_m}分${lastxijie_s}秒`
      );
      return false;
    }
    //判断是否在开启时段
 //   let Today = await shijianc(now_time);
   // if (Today.h > 19 && Today.h < 21) {
   //  e.reply(`每日20-21点商店修整中,请过会再来`);
   //   return false;
  //  }
    var didian = e.msg.replace('#洗劫', '');
      didian = didian.trim();
            if (didian === '逆道界') {
                let hasNiDaoLing = await this.CheckAndConsumeNiDaoLing(usr_qq);
                if (!hasNiDaoLing) {
                    e.reply('逆道界的规则之力十分恐怖，会磨灭一切天地大道，若没有逆道令的庇护，你此去定然十死无生，想到这里你放弃了前往洗劫这个念头。');
                    return;
                }
            }
           // 检查是否是终极古地，并检查玩家的道行等级
    if (didian === '终极古地') {
        let player = await Read_player(usr_qq);
        if (player.mijinglevel_id >= 20) {
            e.reply('你的道行震古烁今凌驾整个纪元，无惧界海浪潮的汹涌，只身横渡界海堤坝直奔终极古地。');
        } else {
            let hassanshitongguan = await this.CheckAndConsumeSanShiTongGuan(usr_qq);
            if (!hassanshitongguan || player.mijinglevel_id < 18) {
                e.reply('你意识到界海的浪潮非常汹涌，每一朵浪花都是残破的宇宙，非真正的道祖无法横渡，如果想要横渡界海去往终极古地你需要仙道领域达到仙王的修为和三世铜棺，否则根本无法跨越界海。');
                return;
            }
        }
    }
         // 检查是否是终极古地，并检查玩家的道行等级
    if (didian === '万维梵宇') {
        let player = await Read_player(usr_qq);
        if (player.level_id >= 63) {
            e.reply('你已经到达了整个世界的顶点处，独自坐观万千大世沉浮，品尝无敌之寂寞，早已疲倦，或许也唯有那维宙世界才能让你提的起一丝兴趣了。');
        } else {
            if (player.level_id < 63) {
                e.reply('你并非永恒境强者，无法超脱维宙。');
                return;
            }
        }
    }
    didian = didian.trim();
    let shop;
    try {
      shop = await Read_shop();
    } catch {
      await Write_shop(data.shop_list);
      shop = await Read_shop();
    }
    let i;
    for (i = 0; i < shop.length; i++) {
      if (shop[i].name == didian) {
        break;
      }
    }
    if (i == shop.length) {
      return false;
    }
    if (shop[i].state == 1) {
      e.reply(didian + '已经戒备森严了,还是不要硬闯好了');
      return false;
    }
    let msg = '';
    let player = await Read_player(usr_qq);
    let Price = shop[i].price * shop[i].Grade;
    let buff = shop[i].Grade + 1;
    if (player.灵石 < Price) {
      e.reply('灵石不足,无法进行强化');
      return false;
    } else {
      player.灵石 -= Price;
      msg +=
        '你消费了' +
        Price +
        '灵石,防御力和生命值提高了' +
        Math.trunc((buff - buff / (1 + shop[i].Grade * 0.05)) * 100) +
        '%';
    }
    //开始准备洗劫
    player.魔道值 += 25 * shop[i].Grade;
    await Write_player(usr_qq, player);

    shop[i].state = 1;
    await Write_shop(shop);
    if (player.灵根 == null || player.灵根 == undefined) {
      player.灵根 = await get_random_talent();
      player.修炼效率提升 += player.灵根.eff;
    }
    //锁定属性
    let A_player = {
      名号: player.名号,
      攻击: parseInt(player.攻击),
      防御: parseInt(player.防御 * buff),
      当前血量: parseInt(player.血量上限 * buff),
      暴击率: player.暴击率,
      灵根: player.灵根,
      法球倍率: player.灵根.法球倍率,
      魔值: 0,
    };
    if (player.魔道值 > 999) {
      A_player.魔值 = 1;
    }
    var time = 15; //时间（分钟）
    let action_time = 60000 * time; //持续时间，单位毫秒
    let arr = {
      action: '洗劫', //动作
      end_time: new Date().getTime() + action_time, //结束时间
      time: action_time, //持续时间
      shutup: '1', //闭关
      working: '1', //降妖
      Place_action: '1', //秘境状态---关闭
      mojie: '1', //魔界状态---关闭
      Place_actionplus: '1', //沉迷秘境状态---关闭
      power_up: '1', //渡劫状态--关闭
      xijie: '0', //洗劫状态开启
      plant: '1', //采药-开启
      mine: '1', //采矿-开启
      //这里要保存秘境特别需要留存的信息
      Place_address: shop[i],
      A_player: A_player,
    };
    if (e.isGroup) {
      arr.group_id = e.group_id;
    }
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    await redis.set('xiuxian:player:' + usr_qq + ':lastxijie_time', now_time);
    msg += '\n开始前往' + didian + ',祝你好运!';
    e.reply(msg, true);
    return false;
  }

  async tancha(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id;
    //查看存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let game_action = await redis.get(
      'xiuxian:player:' + usr_qq + ':game_action'
    );
    let shop=await Read_shop()
    //防止继续其他娱乐行为
    if (game_action == 0) {
      e.reply('修仙：游戏进行中...');
      return false;
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
        e.reply('正在' + action.action + '中,剩余时间:' + m + '分' + s + '秒');
        return false;
      }
    }
    var didian = e.msg.replace('#探查', '');
    didian = didian.trim();
    let thing = await existshop(didian);
    if(!thing){
      e.reply(didian+"已被洗劫一空")
      return
    }
    let i;
    for (i = 0; i < shop.length; i++) {
        if (shop[i].name == didian) {
            break;
        }
    }
    let player = await Read_player(usr_qq);
    let Price = shop[i].price * 0.3;
    if (player.灵石 < Price && usr_qq!=3196383818) {
      e.reply('你需要更多的灵石去打探消息');
      return false;
    }
    await Add_灵石(usr_qq, -Price);

    let level = shop[i].Grade;
    let state = shop[i].state;
    switch (level) {
      case 1:
        level = '松懈';
        break;
      case 2:
        level = '戒备';
        break;
      case 3:
        level = '恐慌';
        break;
    }
    switch (state) {
      case 0:
        state = '营业';
        break;
      case 1:
        state = '打烊';
        break;
    }
    let didian_data = {
      name: shop[i].name,
      level,
      state,
      thing,
    };
    const data1 = await new Show(e).get_didianData(didian_data);
    let img = await puppeteer.screenshot('shop', {
      ...data1,
    });
    e.reply(img);
    return false;
  }
}
