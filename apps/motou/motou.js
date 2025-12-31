import { plugin, verc, data } from '../../api/api.js';
import { __PATH } from '../../model/xiuxian.js';
import {
  existplayer,
  Read_player,
  exist_najie_thing,
  Add_najie_thing,
  Write_player,
  channel
} from '../../model/xiuxian.js';
export class motou extends plugin {
  constructor() {
    super({
      name: 'motou',
      dsc: '交易模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#供奉魔石$',
          fnc: 'add_lingeng',
        },
        {
          reg: '^#堕入魔界$',
          fnc: 'mojie',
        },
        {
          reg: '^#献祭魔石(\\*(\\d+))?$',
          fnc: 'xianji',
        },
          {
          reg: '^#修炼魔功$',
          fnc: 'xiulianmogong',
        },
      ],
    });
  }

  async add_lingeng(e) {
    if (!verc({ e })) return false;
    //固定写法
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    if (player.魔道值 < 1000 && (player.灵根.type !== "魔头" && player.灵根.type !== "天魔")) {
            e.reply("你不是魔头");
            return;
      }
    let x = await exist_najie_thing(usr_qq, '魔石', '道具');
    if (!x) {
      e.reply('你没有魔石');
      return false;
    }
   if (player.灵根.type != "魔头"&& player.灵根.type !== "天魔") {
      /** 设置上下文 */
      this.setContext('RE_lingeng');
      /** 回复 */
      await e.reply(
        '一旦转为魔根,将会舍弃当前灵根。回复:【放弃魔根】或者【转世魔根】进行选择',
        false,
        { at: true }
      );
      return false;
    }
    let random = Math.random();
    if (player.灵根.name == '一重魔功') {
      if (x < 20) {
        e.reply('魔石不足20个,当前魔石数量' + x + '个');
        return false;
      }
      await Add_najie_thing(usr_qq, '魔石', '道具', -20);
      if (random < 0.9) {
        player.灵根 = {"id":100992,"name":"二重魔功","type":"魔头","eff":0.42,"法球倍率":0.27,"攻击":0,"防御":0,"生命":0,"生命本源":0};
        await Write_player(usr_qq, player);
        e.reply('恭喜你,灵根突破成功,当前灵根二重魔功!');
        return false;
      } else {
        e.reply('灵根突破失败');
        return false;
      }
    } else if (player.灵根.name == '二重魔功') {
      if (x < 30) {
        e.reply('魔石不足30个,当前魔石数量' + x + '个');
        return false;
      }
      await Add_najie_thing(usr_qq, '魔石', '道具', -30);
      if (random < 0.7) {
        player.灵根 = {"id":100993,"name":"三重魔功","type":"魔头","eff":0.48,"法球倍率":0.31,"攻击":0,"防御":0,"生命":0,"生命本源":0};
        await Write_player(usr_qq, player);
        e.reply('恭喜你,灵根突破成功,当前灵根三重魔功!');
        return false;
      } else {
        e.reply('灵根突破失败');
        return false;
      }
    } else if (player.灵根.name == '三重魔功') {
      if (x < 30) {
        e.reply('魔石不足30个,当前魔石数量' + x + '个');
        return false;
      }
      await Add_najie_thing(usr_qq, '魔石', '道具', -30);
      if (random < 0.6) {
        player.灵根 = {"id":100994,"name":"四重魔功","type":"魔头","eff":0.54,"法球倍率":0.36,"攻击":0,"防御":0,"生命":0,"生命本源":0};
        await Write_player(usr_qq, player);
        e.reply('恭喜你,灵根突破成功,当前灵根四重魔功!');
        return false;
      } else {
        e.reply('灵根突破失败');
        return false;
      }
    } else if (player.灵根.name == '四重魔功') {
      if (x < 40) {
        e.reply('魔石不足40个,当前魔石数量' + x + '个');
        return false;
      }
      await Add_najie_thing(usr_qq, '魔石', '道具', -40);
      if (random < 0.5) {
        player.灵根 = {"id":100995,"name":"五重魔功","type":"魔头","eff":0.6,"法球倍率":0.4,"攻击":0,"防御":0,"生命":0,"生命本源":0};
        await Write_player(usr_qq, player);
        e.reply('恭喜你,灵根突破成功,当前灵根五重魔功!');
        return false;
      } else {
        e.reply('灵根突破失败');
        return false;
      }
    } else if (player.灵根.name == '五重魔功') {
      if (x < 40) {
        e.reply('魔石不足40个,当前魔石数量' + x + '个');
        return false;
      }
      await Add_najie_thing(usr_qq, '魔石', '道具', -40);
      if (random < 0.4) {
        player.灵根 = {"id":100996,"name":"六重魔功","type":"魔头","eff":0.66,"法球倍率":0.43,"攻击":0,"防御":0,"生命":0,"生命本源":0};
        await Write_player(usr_qq, player);
        e.reply('恭喜你,灵根突破成功,当前灵根六重魔功!');
        return false;
      } else {
        e.reply('灵根突破失败');
        return false;
      }
    } else if (player.灵根.name == '六重魔功') {
      if (x < 40) {
        e.reply('魔石不足40个,当前魔石数量' + x + '个');
        return false;
      }
      await Add_najie_thing(usr_qq, '魔石', '道具', -40);
      if (random < 0.3) {
        player.灵根 = {"id":100997,"name":"七重魔功","type":"魔头","eff":0.72,"法球倍率":0.47,"攻击":0,"防御":0,"生命":0,"生命本源":0};
        await Write_player(usr_qq, player);
        e.reply('恭喜你,灵根突破成功,当前灵根七重魔功!');
        return false;
      } else {
        e.reply('灵根突破失败');
        return false;
      }
    } else if (player.灵根.name == '七重魔功') {
      if (x < 50) {
        e.reply('魔石不足50个,当前魔石数量' + x + '个');
        return false;
      }
      await Add_najie_thing(usr_qq, '魔石', '道具', -50);
      if (random < 0.25) {
        player.灵根 = {"id":100998,"name":"八重魔功","type":"魔头","eff":0.78,"法球倍率":0.5,"攻击":0,"防御":0,"生命":0,"生命本源":0};
        await Write_player(usr_qq, player);
        e.reply('恭喜你,灵根突破成功,当前灵根八重魔功!');
        return false;
      } else {
        e.reply('灵根突破失败');
        return false;
      }
    } else if (player.灵根.name == '八重魔功') {
      if (x < 50) {
        e.reply('魔石不足50个,当前魔石数量' + x + '个');
        return false;
      }
      await Add_najie_thing(usr_qq, '魔石', '道具', -50);
      if (random < 0.2) {
        player.灵根 = {"id":100999,"name":"九重魔功","type":"魔头","eff":1.2,"法球倍率":1.2,"攻击":0,"防御":0,"生命":0,"生命本源":0};
        await Write_player(usr_qq, player);
        e.reply('恭喜你,灵根突破成功,当前灵根九重魔功!');
        return false;
      } else {
        e.reply('灵根突破失败');
        return false;
      }
    }
    return false;
  }
  async RE_lingeng(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    let player = await Read_player(usr_qq);
    /** 内容 */
    let new_msg = this.e.message;
    let choice = new_msg[0].text;
    if (choice == '放弃魔根') {
      await this.reply('重拾道心,继续修行');
      /** 结束上下文 */
      this.finish('RE_lingeng');
      return false;
    } else if (choice == '转世魔根') {
      var x = await exist_najie_thing(usr_qq, '魔石', '道具');
      if (!x) {
        e.reply('你没有魔石');
        return false;
      }
      if (x < 10) {
        e.reply('你魔石不足10个');
        return false;
      }
      await Add_najie_thing(usr_qq, '魔石', '道具', -10);
      player.灵根 = {"id":100991,"name":"一重魔功","type":"魔头","eff":0.36,"法球倍率":0.23,"攻击":0,"防御":0,"生命":0,"生命本源":0};
      await Write_player(usr_qq, player);
      e.reply('恭喜你,转世魔头成功!');
      /** 结束上下文 */
      this.finish('RE_lingeng');
      return false;
    }
  }

  async mojie(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
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
    let player = await Read_player(usr_qq);
     if (player.魔道值 < 100 && (player.灵根.type !== "魔头" && player.灵根.type !== "天魔")) {
            e.reply("你并非真正的魔");
            return;
        }
    if (player.修为 < 4000000) {
      e.reply('修为不足');
      return false;
    }
    player.魔道值 -= 100;
    player.修为 -= 4000000;
    await Write_player(usr_qq, player);
    var time = 60; //时间（分钟）
    let action_time = 60000 * time; //持续时间，单位毫秒
    let arr = {
      action: '魔界', //动作
      end_time: new Date().getTime() + action_time, //结束时间
      time: action_time, //持续时间
      shutup: '1', //闭关
      working: '1', //降妖
      Place_action: '1', //秘境状态---关闭
      mojie: '0', //魔界状态---关闭
      Place_actionplus: '1', //沉迷秘境状态---关闭
      power_up: '1', //渡劫状态--关闭
      xijie: '1', //洗劫状态开启
      plant: '1', //采药-开启
      mine: '1', //采矿-开启
      cishu: '10',
    };
    if (e.isGroup) {
      arr.group_id = e.group_id;
    }
    await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
    e.reply('开始进入魔界,' + time + '分钟后归来!');
    return false;
  }

  async xianji(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //查看存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    
    // 解析献祭次数
    let times = 1; // 默认献祭1次
    const message = e.raw_message;
    const match = message.match(/#献祭魔石\*(\d+)/);
    if (match && match[1]) {
      times = parseInt(match[1]);
      if (times <= 0) {
        e.reply('献祭次数必须大于0');
        return false;
      }
    }
    
     if ( player.灵根.type == "神慧者") {
    e.reply("你眉心的神慧之光绽放，以凌驾整片维度的力量改变了某种规则与概念！");
    
    let totalCost = times; // 神慧者每次消耗1个魔石
    let x = await exist_najie_thing(usr_qq, '魔石', '道具');
    if (!x || x < totalCost) {
      e.reply(`魔石不足，需要${totalCost}个，当前只有${x || 0}个`);
      return false;
    }
    
    await Add_najie_thing(usr_qq, '魔石', '道具', -totalCost);
    
    // 批量获取物品
    let rewards = {};
    for (let i = 0; i < times; i++) {
      let wuping_length = data.xingge.length;
      let wuping_index = Math.trunc(Math.random() * wuping_length);
      let wuping = data.xingge[wuping_index];
      
      if (!rewards[wuping.name]) {
        rewards[wuping.name] = { item: wuping, count: 0 };
      }
      rewards[wuping.name].count++;
    }
    
    // 添加所有奖励到背包
    let rewardText = [];
    for (let itemName in rewards) {
      let reward = rewards[itemName];
      await Add_najie_thing(usr_qq, reward.item.name, reward.item.class, reward.count);
      rewardText.push(`${reward.item.name}×${reward.count}`);
    }
    
    e.reply(`献祭完成！获得：${rewardText.join('，')}`);
    return false;
} else if (player.魔道值 < 100 && (player.灵根.type !== "魔头" && player.灵根.type !== "天魔")) {
            e.reply("你并非真正的魔");
            return;
        }
        
    const costPerTime = 8; // 每次献祭需要8个魔石
    let totalCost = times * costPerTime;
    
    let x = await exist_najie_thing(usr_qq, '魔石', '道具');
    if (!x) {
      e.reply('你没有魔石');
      return false;
    }
    
    if (x < totalCost) {
      e.reply(`魔石不足，需要${totalCost}个（${times}次×8个/次），当前只有${x}个`);
      return false;
    }
    
    await Add_najie_thing(usr_qq, '魔石', '道具', -totalCost);
    
    // 批量获取物品
    let rewards = {};
    for (let i = 0; i < times; i++) {
      let wuping_length = data.xingge.length;
      let wuping_index = Math.trunc(Math.random() * wuping_length);
      let wuping = data.xingge[wuping_index];
      
      if (!rewards[wuping.name]) {
        rewards[wuping.name] = { item: wuping, count: 0 };
      }
      rewards[wuping.name].count++;
    }
    
    // 添加所有奖励到背包
    let rewardText = [];
    for (let itemName in rewards) {
      let reward = rewards[itemName];
      await Add_najie_thing(usr_qq, reward.item.name, reward.item.class, reward.count);
      rewardText.push(`${reward.item.name}×${reward.count}`);
    }
    
    e.reply(`献祭完成！消耗魔石${totalCost}个，获得：${rewardText.join('，')}`);
    return false;
  }
  async xiulianmogong(e) {
        if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
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
        let player = await Read_player(usr_qq);
        if (player.魔道值 < 100 && (player.灵根.type !== "魔头" && player.灵根.type !== "天魔")) {
            e.reply("你并非真正的魔");
            return;
        }
        // 检查玩家是否已经修炼过魔功
        let lastPracticeTime = await redis.get('xiuxian:player:' + usr_qq + ':lastPracticeTime');
        if (lastPracticeTime && (Date.now() - lastPracticeTime < 86400000)) { // 86400000 ms is one day
            e.reply("你今天已经修炼过魔功了。");
            return;
        }
        // 随机增加魔气值
        let moqi_increase = Math.floor(Math.random() * (800 - 150 + 1)) + 150;
        player.魔道值 += moqi_increase;
        player.修为 += 150000;
        await Write_player(usr_qq, player);
        await redis.set('xiuxian:player:' + usr_qq + ':lastPracticeTime', Date.now());
        e.reply("你在凡俗界偏僻处找到了一座村庄，将那里的村民屠戮殆尽，还找到了几个灵根不错但从未接触过修行的稚童，最终残忍夺根，并炼化了所有人死后的魂魄，从此这座村庄的人再无来生!修为增加15w，魔道值增加" + moqi_increase + "。");
    
        // 检查是否有万魂幡道具
        let hasWanHunFan = await exist_najie_thing(usr_qq, "万魂幡", "道具");
        if (hasWanHunFan) {
            e.reply("你杀死了数十名无辜修士，并将他们的魂魄招进了万魂幡中。为避免正道修士追杀，你躲到一片荒无人烟处拿出魂幡开始炼化魂魄。魂幡散发着滔天的怨念和恨意，不时有凄厉的哀嚎和求饶声传出，你脸色阴冷不为所动，发出桀桀笑声。");
            // 随机增加魔气值
            let moqi_increase_wanhun = Math.floor(Math.random() * (3500 - 1200 + 1)) + 1200;
            let xiuwei = 1500000*player.level_id;
            player.魔道值 += moqi_increase_wanhun;
            player.修为 += xiuwei;
            await Write_player(usr_qq, player);
            e.reply("最终成功炼化他们的魂魄转化为你自身的魔气，修为增加" + xiuwei ,"魔道值增加" + moqi_increase_wanhun + "。");
        } else {
            // 如果没有万魂幡，设置修炼时间
            await redis.set('xiuxian:player:' + usr_qq + ':lastPracticeTime', Date.now());
        }
    }
}
