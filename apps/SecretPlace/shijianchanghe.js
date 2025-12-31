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
export class shijianchanghe extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_shijianchanghe',
      dsc: '时间长河模块',
      event: 'message',
      priority: 600,
      rule: [
                      {
    reg: '^#遨游时间长河$',
    fnc: 'roamTimeRiver'
    }
      ],
    });
  }
  //遨游时间长河
    async roamTimeRiver(e) {
      let usr_qq = e.user_id.toString().replace('qg_','');
      usr_qq = await channel(usr_qq);
      let player = await Read_player(usr_qq);
       // 检查是否可以前往
    const flag = await Go(e);
    if (!flag) {
        return false;
    }
      let now_level_id;
        now_level_id = data.Level_list.find(
        item => item.level_id == player.level_id
      ).level_id;
  if (player.mijinglevel_id < 20) {
      const replyMsg = [
          `【时间长河·禁忌之地】`,
          `时间长河！任何低阶生灵都不能遥望的古史禁忌！`,
          `每一滴水珠都承载着一个纪元的兴衰，`,
          `每一道涟漪都映射着帝落时代的血与火！`,
          `因果之力交织如网，命运长线缠绕如茧！`,
          `逆流而上者，将直面古史中的至强者，`,
          `顺流而下者，将窥见未来大世的杀劫！`,
          `曾有仙王巨头欲窥时间长河奥秘，`,
          `却被一道眸光斩断万古，真灵永坠轮回！`,
          `此乃诸天禁忌之首，万道不存之地！`,
          `非准仙帝不可踏足，非祭道不可窥全貌！`,
          `以道友目前境界，涉足时间长河顷刻间便会：`,
          `因果反噬！真名蒙尘！道果崩解！`,
          `待你凝聚准仙帝道果，再来探寻这时空秘辛！`,
      ].join('\n');
      e.reply(replyMsg);
      return false;
  }
  
  player.power_place =4;
    await Write_player(usr_qq, player);
      let time = 10; //时间（分钟）
      let action_time = 60000 * time; //持续时间，单位毫秒
      let arr = {
        action: '遨游时间长河', //动作
       end_time: new Date().getTime() + action_time,//结束时间
        time: action_time, //持续时间
        shutup: '1', //闭关
        working: '1', //降妖
        Place_action: '1', //秘境状态---开启
        Place_actionplus: '1', //沉迷秘境状态---关闭
        power_up: '1', //渡劫状态--关闭
        mojie: '1', //魔界状态---关闭
        xijie: '1', //洗劫状态开启
        plant: '1', //采药-开启
        mine: '1', //采矿-开启
        time_river: '0',  
      };
      if (e.isGroup) {
        arr.group_id = e.group_id;
      }
      let A = e.user_id;
      A=await channel(A)
      let user_A = A;
      let renwu = await Read_renwu();
      let i = await found(user_A);
      let chazhao = await find_renwu(A);
      if (chazhao == 0) {
        }else
      if(renwu[i].wancheng3 == 1){
      renwu[i].jilu3 += 1
      await Write_renwu(renwu);
      }
       await redis.set(`xiuxian:time_river:end_time:${usr_qq}`, arr.end_time);
        const activePlayers = await redis.get('xiuxian:time_river:active_players') || '[]';
  const playersList = JSON.parse(activePlayers);
  playersList.push(usr_qq);
       // 添加玩家到有序集合
  await redis.set('xiuxian:time_river:active_players', JSON.stringify(playersList));
  await redis.set('xiuxian:player:' + usr_qq + ':action', JSON.stringify(arr));
       // 回复玩家
      e.reply([
          `你的真身踏入了时间长河，逆流而上！`,
          `探索将在10分钟后结束，请耐心等待。`
      ].join('\n'));
      
      return true;
  }
}
async function found(A) {
  let renwu = await Read_renwu();
  let i;
  for (i = 0; i < renwu.length; i++) {
      if (renwu[i].player == A) {
          break;
      }
  }
  return i;
}