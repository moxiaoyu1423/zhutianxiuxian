import { plugin, puppeteer, verc, data, Show } from '../../api/api.js';
import fs from 'fs';
import {
  Read_player,
  existplayer,
  sleep,
  add_shitu,
  Write_shitu,
  Read_shitu,
  find_shitu,
  find_tudi,
  Write_player,
  Add_najie_thing,
  channel,
  isNotNull,
  get_shitujifen_img,
  get_tijiao_img,
  get_renwu_img,
  get_shitu_img,
  get_shifu_img,
} from '../../model/xiuxian.js';
import {  __PATH } from '../../model/xiuxian.js';
export class shitu extends plugin {
  constructor() {
    super({
      name: 'shituxitong',
      dsc: '修仙模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#开启收徒$',
          fnc: 'okshoutu',
        },
        {
          reg: '^#关闭收徒$',
          fnc: 'noshoutu',
        },
        {
          reg: '^#拜师$',
          fnc: 'rendie',
        },
        {
          reg: '^#解除师徒关系$',
          fnc: 'buzairendie',
        },
        {
          reg: '^#我的弟子$',
          fnc: 'show_shitu',
        },
        {
          reg: '^#我的师门$',
          fnc: 'show_shifu',
        },
        {
          reg: '^#提交任务$',
          fnc: 'tijiao',
        },
        {
          reg: '^#查看师傅列表$',
          fnc: 'looklook',
        },
        {
          reg: '^#师徒商店$',
          fnc: 'looklookshop',
        },
        {
          reg: '^#师徒兑换(.*)$',
          fnc: 'duihuan',
        },
        {
          reg: '^#开始师徒试炼$',
          fnc: 'jijian',
        },
        {
          reg: '^#师徒同步$',
          fnc: 'tongbu'
        },
      ],
    });
  }
  /*开启收徒*/

  async okshoutu(e) {
    //禁止私聊
    if (!e.isGroup) {
      return;
    }
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
    let player1 = await data.getData('player', usr_qq);
    let player = await Read_player(usr_qq);
    let now_level_id;
    let user_A;
    let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
    user_A = A;
    let shitu = await Read_shitu();
    let i = await found(user_A);
    let shifu = await find_shitu(A);
    now_level_id = data.Level_list.find(
      item => item.level_id == player.level_id
    ).level_id;
    let tudi = await find_tudi(A);
    var Time = 3;
    let now_Time = new Date().getTime(); //获取当前时间戳
    let shuangxiuTimeout = parseInt(1200000 * Time);
    let last_time = await redis.get(
      'xiuxian:player:' + usr_qq + 'jiechushituCD'
    ); //获得上次的时间戳,
    last_time = parseInt(last_time);
    if (now_Time < last_time + shuangxiuTimeout) {
      let Couple_m = Math.trunc(
        (last_time + shuangxiuTimeout - now_Time) / 60 / 1000
      );
      let Couple_s = Math.trunc(
        ((last_time + shuangxiuTimeout - now_Time) % 60000) / 1000
      );
      e.reply('距离再次开启收徒\n' + `还需要  ${Couple_m}分 ${Couple_s}秒。`);
      return;
    }
    //判断境界以及是否轮回
    if (player1.lunhui == 9 || player1.灵根.id==100999) {
    }else{
      e.reply('没有轮回过九世的人不能收徒!');
      return;
    }
    //判断有没有出师
    if (tudi != 0) {
      e.reply('你还没出师');
      return;
    }
    //查看存档
    if (shifu == 0) {
      await add_shitu(A, 1);
      e.reply('成功开启收徒');
      return;
    }
    //判断是否有徒弟
    if (shitu[i].未出师徒弟 != 0) {
      e.reply('需要等这个徒弟出师后才能再次收徒!');
      return;
    }
    //前戏做完了，开启收徒
    if (shitu[i].收徒 == 0) {
      shitu[i].收徒 = 1;
      await Write_shitu(shitu);
      e.reply('成功开启收徒');
      return;
    } else if (shitu[i].收徒 == 1) {
      e.reply('你已经开启收徒了');
      return;
    }
    return
  }
  /*关闭收徒*/

  async noshoutu(e) {
    //禁止私聊
    if (!e.isGroup) {
      return;
    }
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
    let player1 = await data.getData('player', usr_qq);
    let player = await Read_player(usr_qq);
    let now_level_id;
    now_level_id = data.Level_list.find(
      item => item.level_id == player.level_id
    ).level_id;
    let user_A;
    let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
    user_A = A;
    let shitu = await Read_shitu();
    let i = await found(user_A);
    let shifu = await find_shitu(A);
    // //判断境界以及是否轮回
    // if (now_level_id < 42 && player1.lunhui == 0) {
    //   e.reply('只有仙人才可以收徒');
    //   return;
    // }
    //前戏做完了，关闭收徒
    if (shifu == 0) {
      await add_shitu(A, 0);
      e.reply('成功关闭收徒');
      return;
    } else if (shitu[i].收徒 == 1) {
      shitu[i].收徒 = 0;
      await Write_shitu(shitu);
      e.reply('成功关闭收徒');
      return;
    } else if (shitu[i].收徒 == 0) {
      e.reply('你就没开启收徒');
      return;
    }
  }

  /*拜师*/

  async rendie(e) {
    //禁止私聊
    if (!e.isGroup) {
      return;
    }
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
    let player1 = await data.getData('player', usr_qq);
    let player = await Read_player(usr_qq);
    let now_level_id;
    now_level_id = data.Level_list.find(
      item => item.level_id == player.level_id
    ).level_id;
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) {
      return;
    }
    let atItem = e.message.filter(item => item.type === 'at');
    let B = atItem[0].qq;
    let A = e.user_id.toString().replace('qg_','');
    A= await channel(A);
    B= await channel(B);
    let shifu = await find_shitu(B);
    let user_B;
    user_B = B;
    let user_A;
    user_A = A;
    let shitu = await Read_shitu();
    let i = await found(user_B);
    let x = await found(user_A);
    let tudi = await find_tudi(A);
    var Time = 3;
    let now_Time = new Date().getTime(); //获取当前时间戳
    let shuangxiuTimeout = parseInt(1200000 * Time);
    let last_time = await redis.get(
      'xiuxian:player:' + usr_qq + 'jiechushituCD'
    ); //获得上次的时间戳,
    last_time = parseInt(last_time);
    if (now_Time < last_time + shuangxiuTimeout) {
      let Couple_m = Math.trunc(
        (last_time + shuangxiuTimeout - now_Time) / 60 / 1000
      );
      let Couple_s = Math.trunc(
        ((last_time + shuangxiuTimeout - now_Time) % 60000) / 1000
      );
      e.reply('距离再次拜师\n' + `还需要  ${Couple_m}分 ${Couple_s}秒。`);
      return;
    }
    //判断有没有师傅
    if (tudi != 0) {
      e.reply('你都有师傅了还拜什么师？');
      return;
    }
    //拒绝自己拜自己
    if (A == B) {
      e.reply('自己拜自己是吧');
      return;
    }
    //判断境界以及是否轮回
    if (player1.level_id > 50) {
      e.reply('你这修为都能当师傅了，拜师？');
      return;
    }
    //判断对方有没有存档
    if (shifu == 0) {
      e.reply('他并没有开启收徒，换个人吧。');
      return;
    }
    //判断对方有没有徒弟
    if (shitu[i].未出师徒弟 != 0) {
      e.reply('他已经有徒弟了，换个人吧。');
      return;
    }
    for(let t=0;t<shitu.length;t++){
      for(let k=0;k<shitu[t].已出师徒弟.length;k++){
        if(usr_qq==shitu[t].已出师徒弟[k]){
          e.reply('你曾拜入过师门且已出师')
          return
        }
      }
    }

    //前戏做完了，拜师成功
    if (shitu[i].收徒 == 0) {
      e.reply('他并没有开启收徒，换个人吧。');
      return;
    } else if (shitu[i].收徒 == 1) {
      shitu[i].未出师徒弟 = A;
      await Write_shitu(shitu);
      shitu[i].收徒 = 0;
      await Write_shitu(shitu);
      e.reply('成功拜师');
      return;
    }
  }

  /*解除师徒关系*/

  async buzairendie(e) {
    //禁止私聊
    if (!e.isGroup) {
      return;
    }
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
    let player = await Read_player(usr_qq);
    let user_A;
    let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
    user_A = A;
    let shitu = await Read_shitu();
    let i = await found(user_A);
    let x = await found1(user_A);
    let shifu = await find_shitu(A);
    let tudi = await find_tudi(A);
    var Time = 3;
    let now_Time = new Date().getTime(); //获取当前时间戳
    let shuangxiuTimeout = parseInt(1200000 * Time);
    let last_time = await redis.get(
      'xiuxian:player:' + usr_qq + 'jiechushituCD'
    ); //获得上次的时间戳,
    last_time = parseInt(last_time);
    if (now_Time < (last_time + shuangxiuTimeout)*24) {
      let Couple_m = Math.trunc(
        (last_time + shuangxiuTimeout - now_Time) / 60 / 1000
      );
      let Couple_s = Math.trunc(
        ((last_time + shuangxiuTimeout - now_Time) % 60000) / 1000
      );
      e.reply('距离再次解除关系\n' + `还需要  ${Couple_m}分 ${Couple_s}秒。`);
      return;
    }
    //师傅列表查找不到就查找徒弟列表
    if (tudi == 0) {
      if (shifu == 0) {
        //既不是师傅也不是徒弟
        e.reply('你有徒弟或者师傅？');
        return;
        //这里是师傅解除
      } else if (shitu[i].未出师徒弟 != 0) {
        if (shitu[i].任务阶段 > 3) {
          await redis.set(
            'xiuxian:player:' + usr_qq + 'jiechushituCD',
            now_Time
          );
          shitu[i].收徒 = 0;
          e.reply('你解除了任务阶段大于3的徒弟，24小时后才能再次收徒');
        } else {
          await redis.set(
            'xiuxian:player:' + usr_qq + 'jiechushituCD',
            now_Time
          );
          shitu[i].收徒 = 1;
        }
        shitu[i].renwu1 = 0;
        shitu[i].renwu2 = 0;
        shitu[i].renwu3 = 0;
        shitu[i].任务阶段 = 0;
        shitu[i].未出师徒弟 = 0;
        await Write_shitu(shitu);
        e.reply('解除成功，24小时后才能再次拜师');
        await redis.set('xiuxian:player:' + usr_qq + 'jiechushituCD', now_Time);
        return;
      } else {
        e.reply('你还没收过徒弟');
        return;
      }
      //这里是徒弟解除
    } else {
      shitu[i].renwu1 = 0;
      shitu[i].renwu2 = 0;
      shitu[i].renwu3 = 0;
      shitu[i].任务阶段 = 0;
      shitu[x].未出师徒弟 = 0;
      shitu[x].收徒 = 1;
      await Write_shitu(shitu);
      e.reply('解除成功，24小时后才能再次拜师');
      await redis.set('xiuxian:player:' + usr_qq + 'jiechushituCD', now_Time);
      return;
    }
  }

  //我的弟子
  async show_shitu(e) {
    let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
    let tudi = await find_tudi(A);
    //不开放私聊功能
    if (!e.isGroup) {
      return;
    }
    if (tudi != 0) {
      e.reply('等你先出师再说吧');
      return;
    }
    let img = await get_shitu_img(e);
    e.reply(img);
    return;
  }

  //我的师门
  async show_shifu(e) {
    let A = e.user_id.toString().replace('qg_','');
    A= await channel(A);
    let tudi = await find_tudi(A);
    //不开放私聊功能
    if (!e.isGroup) {
      return;
    }
    if (tudi == 0) {
      e.reply('你先拜个师再来吧');
      return;
    }
    await get_renwu_img(e);
    await sleep(3000);
    let img = await get_shifu_img(e);
    // if (img == undefined) {
    //   e.reply(`再氪两单嘛就是歌姬吧`);
    // }
    e.reply(img);
    return;
  }
  //提交任务
  async tijiao(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
    let player = await Read_player(usr_qq);
    let user_A;
    let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
    user_A = A;
    let shifu = await find_shitu(A);
    let tudi = await find_tudi(A);
    //不开放私聊功能
    if (!e.isGroup) {
      return;
    }
    //判断对方有没有存档
    if (shifu == 0 && tudi == 0) {
      e.reply('你还没拜师&收徒过！');
      return;
    }
    if (tudi == 0) {
      e.reply('只能由徒弟提交任务');
      return;
    }
    await get_renwu_img(e);
    await sleep(3000);
    await get_tijiao_img(e);
  }
  //查看师傅列表
  async looklook(e) {
    let shitu = await Read_shitu()
    let i
    let t = 0
    let v = 0
    let A = 0
    let kaiqi = await found3();
    let shoutu = ``
    let suiji = 0;
    if(kaiqi == 1){
      shoutu = `师傅列表：\n(仅显示随机的五个可拜师师傅)\n`
    }else if(kaiqi == 0){
      shoutu = `暂时还没有开启收徒的师傅`
    }
  for(i = 0 ;i<shitu.length;i++){
      if(shitu[i].收徒 == 1) v++
    }
    suiji = Math.floor(Math.random() * shitu.length);
    if(v<6)suiji = 0
    for (i = suiji; i < shitu.length; i++) {
      if (shitu[i].收徒 == 1) {
        let player = await Read_player(shitu[i].师傅);
        let daohao = player.名号
        shoutu += `道号:${daohao}\nQQ:${shitu[i].师傅}\n`;
        t++
        if (t == 5) {
          break
        }
      }
    }
    if(t!=5 && v> 5){
      for (i = 0; i < shitu.length; i++) {
        if (shitu[i].收徒 == 1) {
          if(i == suiji){
            break
          }
          let player = await Read_player(shitu[i].师傅);
          let daohao = player.名号
          shoutu += `道号:${daohao}\nQQ:${shitu[i].师傅}\n`;
          A++
          if (A == 5-t) {
            break
          }
        }
      }
    }
    e.reply(shoutu);
    return;
  }
  //查看积分商城
  async looklookshop(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
    if (!e.isGroup) {
      return;
    }
    //无存档
    let ifexistplay = data.existData('player', usr_qq);
    if (!ifexistplay) {
      return;
    }
    let img = await get_shitujifen_img(e);
    e.reply(img);
    return;
  }
  //兑换物品
  async duihuan(e) {
    if (!e.isGroup) {
      return;
    }
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
    //查看存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
      return;
    }
    var reg = new RegExp(/师徒兑换/);
    let msg = e.msg.replace(reg, '');
    msg = msg.replace('#', '');
    let thing_name = msg.replace('师徒兑换', '');
    let ifexist = data.shitujifen.find(item => item.name == thing_name);
    if (!ifexist) {
      e.reply(`师徒商店还没有这样的东西:${thing_name}`);
      return;
    }
    let player = await Read_player(usr_qq);
    let jifen = player.师徒积分;
    let i;
    for (i = 0; i < data.shitujifen.length; i++) {
      if (thing_name == data.shitujifen[i].name) {
        break;
      }
    }
    if (jifen < data.shitujifen[i].积分) {
      e.reply(
        `积分不足,还需${data.shitujifen[i].积分 - jifen}积分兑换${thing_name}`
      );
      return;
    }
    player.师徒积分 -= data.shitujifen[i].积分;

    await Add_najie_thing(usr_qq, thing_name, data.shitujifen[i].class, 1);
    await Write_player(usr_qq, player);
    e.reply([
      `兑换成功!  获得[${thing_name}],剩余[${player.师徒积分}]积分  `,
      '\n可以在【我的纳戒】中查看',
    ]);
    return;
  }
  /*师徒boss */
  async jijian(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
    let player = await Read_player(usr_qq);
    let user_A;
    let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
    user_A = A;
    let shitu = await Read_shitu();
    let i = await found(user_A);
    let x = await found1(user_A);
    let z
    let shifu = await find_shitu(A);
    let tudi = await find_tudi(A);
    let shifushanghai
    let tudishanghai
    let xue = player.攻击
    let gaoji
    //不开放私聊功能
    if (!e.isGroup) {
      return;
    }
    //判断对方有没有存档
    if (shifu == 0 && tudi == 0) {
      e.reply('你还没拜师&收徒过！');
      return;
    }
    //判断当前血量
    if (player.当前血量 < 10000) {
      e.reply("你都伤成这样了,先回回血再打吧");
      return;
    }
    //判断是师傅还是徒弟
    if (tudi == 0 && shitu[i].师傅 == A) {
      z = i
    } else if (tudi != 0) {
      z = x
    } else {
      e.reply('只能由徒弟提交任务');
      return;
    }
    //判断任务进度
    if (shitu[z].任务阶段 == 5) {
      //判断是不是师傅
      if (shifu != 0 && tudi == 0) {
        if (shitu[i].师徒BOOS剩余血量 == 0) {
          e.reply(`你已经通过了师徒试炼`);
          return
        }
        e.reply(`你即将进入上古战场`);
        await sleep(10000);
        e.reply(`你受到此方天地的限制`);
        await sleep(10000);
        if (shitu[i].师徒BOOS剩余血量 > 0) {
          shifushanghai = Math.round(Math.random() * 50000000)
          if (xue - shifushanghai < 0) {
            gaoji = 0
          } else {
            gaoji = xue - shifushanghai
          }
          shitu[i].师徒BOOS剩余血量 -= gaoji;
          await Write_shitu(shitu);
          e.reply(`第一回合你对道祖虚影造成${gaoji}点伤害`);
          await sleep(10000);
        }
        if (shitu[i].师徒BOOS剩余血量 > 0) {
          shifushanghai = Math.round(Math.random() * 50000000)
          if (xue - shifushanghai < 0) {
            gaoji = 0
          } else {
            gaoji = xue - shifushanghai
          }
          shitu[i].师徒BOOS剩余血量 -= gaoji;
          await Write_shitu(shitu);
          e.reply(`第二回合你对道祖虚影造成${gaoji}点伤害`);
          await sleep(10000);
        }
        if (shitu[i].师徒BOOS剩余血量 > 0) {
          shifushanghai = Math.round(Math.random() * 50000000)
          if (xue - shifushanghai < 0) {
            gaoji = 0
          } else {
            gaoji = xue - shifushanghai
          }
          shitu[i].师徒BOOS剩余血量 -= gaoji;
          await Write_shitu(shitu);
          e.reply(`第三回合你对道祖虚影造成${gaoji}点伤害`);
          await sleep(10000);
        }
        if (shitu[i].师徒BOOS剩余血量 > 0) {
          shifushanghai = Math.round(Math.random() * 50000000)
          if (xue - shifushanghai < 0) {
            gaoji = 0
          } else {
            gaoji = xue - shifushanghai
          }
          shitu[i].师徒BOOS剩余血量 -= gaoji;
          await Write_shitu(shitu);
          e.reply(`第四回合你对道祖虚影造成${gaoji}点伤害`);
          await sleep(10000);
        }
        if (shitu[i].师徒BOOS剩余血量 > 0) {
          shifushanghai = Math.round(Math.random() * 50000000)
          if (xue - shifushanghai < 0) {
            gaoji = 0
          } else {
            gaoji = xue - shifushanghai
          }
          shitu[i].师徒BOOS剩余血量 -= gaoji;
          await Write_shitu(shitu);
          e.reply(`第五回合你对道祖虚影造成${gaoji}点伤害`);
          await sleep(10000);
        }
        if (shitu[i].师徒BOOS剩余血量 > 0) {
          shifushanghai = Math.round(Math.random() * 50000000)
          if (xue - shifushanghai < 0) {
            gaoji = 0
          } else {
            gaoji = xue - shifushanghai
          }
          shitu[i].师徒BOOS剩余血量 -= gaoji;
          await Write_shitu(shitu);
          e.reply(`第六回合你对道祖虚影造成${gaoji}点伤害`);
          await sleep(10000);
        }
        if (shitu[i].师徒BOOS剩余血量 < 1) {
          shitu[i].师徒BOOS剩余血量 = 0;
          await Write_shitu(shitu);
          e.reply(`恭喜你通过了师徒试炼！`);
          return
        } else {
          player.当前血量 = 0;
          await Write_player(usr_qq, player);
          e.reply(`这次并没有一口气通过试炼呢，再接再厉！\n道祖虚影剩余血量:${shitu[i].师徒BOOS剩余血量}`);
          return
        }
      }
      //判断是不是徒弟
      if (tudi != 0) {
        if (shitu[x].师徒BOOS剩余血量 == 0) {
          e.reply(`你已经通过了师徒试炼`);
          return
        }
        e.reply(`你即将进入上古战场`);
        await sleep(10000);
        e.reply(`你进去了古战场试炼之地`);
        await sleep(10000);
        e.reply(`你得到了古战场试炼之地的眷顾，伤害提升了。`);
        await sleep(10000);
        if (shitu[x].师徒BOOS剩余血量 > 0) {
          tudishanghai = Math.round(Math.random() * 5)
          shitu[x].师徒BOOS剩余血量 -= xue * tudishanghai;
          await Write_shitu(shitu);
          e.reply(`第一回合你对道祖虚影造成${xue * tudishanghai}点伤害`);
          await sleep(10000);
        }
        if (shitu[x].师徒BOOS剩余血量 > 0) {
          tudishanghai = Math.round(Math.random() * 5)
          shitu[x].师徒BOOS剩余血量 -= xue * tudishanghai;
          await Write_shitu(shitu);
          e.reply(`第二回合你对道祖虚影造成${xue * tudishanghai}点伤害`);
          await sleep(10000);
        }
        if (shitu[x].师徒BOOS剩余血量 > 0) {
          tudishanghai = Math.round(Math.random() * 5)
          shitu[x].师徒BOOS剩余血量 -= xue * tudishanghai;
          await Write_shitu(shitu);
          e.reply(`第三回合你对道祖虚影造成${xue * tudishanghai}点伤害`);
          await sleep(10000);
        }
        if (shitu[x].师徒BOOS剩余血量 > 0) {
          tudishanghai = Math.round(Math.random() * 5)
          shitu[x].师徒BOOS剩余血量 -= xue * tudishanghai;
          await Write_shitu(shitu);
          e.reply(`第四回合你对道祖虚影造成${xue * tudishanghai}点伤害`);
          await sleep(10000);
        }
        if (shitu[x].师徒BOOS剩余血量 > 0) {
          tudishanghai = Math.round(Math.random() * 5)
          shitu[x].师徒BOOS剩余血量 -= xue * tudishanghai;
          await Write_shitu(shitu);
          e.reply(`第五回合你对道祖虚影造成${xue * tudishanghai}点伤害`);
          await sleep(10000);
        }
        if (shitu[x].师徒BOOS剩余血量 > 0) {
          tudishanghai = Math.round(Math.random() * 5)
          shitu[x].师徒BOOS剩余血量 -= xue * tudishanghai;
          await Write_shitu(shitu);
          e.reply(`第六回合你对道祖虚影造成${xue * tudishanghai}点伤害`);
          await sleep(10000);
        }
        if (shitu[x].师徒BOOS剩余血量 < 1) {
          shitu[x].师徒BOOS剩余血量 = 0;
          await Write_shitu(shitu);
          e.reply(`恭喜你通过了师徒试炼！`);
          return
        } else {
          player.当前血量 = 0;
          await Write_player(usr_qq, player);
          e.reply(`这次并没有一口气通过试炼呢，再接再厉！\n道祖虚影剩余血量:${shitu[x].师徒BOOS剩余血量}`);
          return
        }
      }
    } else {
      e.reply(`你的任务还没到此阶段`);
      return
    }
  }
  /*师徒同步 */
    async tongbu(e) {
    let shitu = await Read_shitu();
    let user_A;
    let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
    user_A = A;
    let i = await found(user_A);
    let shifu = await find_shitu(A);
    let tudi = await find_tudi(A);
    //判断对方有没有存档
    if (shifu == 0 && tudi == 0) {
      e.reply('你还没拜师&收徒过！');
      return;
    }
    e.reply(`开始同步`);
    for(let i=0;i<shitu.length;i++){
    if (!isNotNull(shitu[i].师徒BOOS剩余血量)) {
      shitu[i].师徒BOOS剩余血量 = 100000000;
    }
    if (!isNotNull(shitu[i].已出师徒弟)) {
      shitu[i].已出师徒弟 = [];
    }
    if (!isNotNull(shitu[i].任务阶段)) {
      shitu[i].任务阶段 = 0;
    }
    if (!isNotNull(shitu[i].未出师徒弟)) {
      shitu[i].未出师徒弟 = 0;
    }
    if (!isNotNull(shitu[i].收徒)) {
      shitu[i].收徒 = 0;
    }
  }
    e.reply(`同步完成`);
    await Write_shitu(shitu);
    return
  }



}



async function found(A) {
  let shitu = await Read_shitu();
  let i;
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].师傅 == A) {
      break;
    }
  }
  return i;
}
async function found1(A) {
  let shitu = await Read_shitu();
  let i;
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].未出师徒弟 == A) {
      break;
    }
  }
  return i;
}
async function found3(A) {
  let shitu = await Read_shitu();
  let i;
  let m = 0
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].收徒 == 1) {
      m = 1
      break;
    }
  }
  return m;
}