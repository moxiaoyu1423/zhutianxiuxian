import { plugin } from '../../api/api.js';
import { alluser } from '../../model/duanzaofu.js';
import config from "../../model/Config.js"

import {
  isNotNull,
  Read_equipment,
  Write_equipment,
  Read_najie,
  Write_najie
} from '../../model/xiuxian.js';
import { __PATH } from '../../model/xiuxian.js';
//这是雪喵喵写的喵！
export class baojitongbu extends plugin {
  constructor() {
    super({
      name: 'baoshitongbu',
      dsc: '暴击率同步',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#同步暴击率$',
          fnc: 'tongbu'
        }
      ]
    });
    this.xiuxianConfigData = config.getConfig("xiuxian", "xiuxian");
  }
  async tongbu(e) {
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) return false;//是否开启主人模式
    e.reply('开始同步')
    let arr = await alluser()  //读取全部玩家列表
    let type = ['武器', '护具', '法宝','帝兵']
    for (let z = 0; z < arr.length; z++) {  //遍历所有玩家
      //开始遍历已装备的武器
      let equipment = await Read_equipment(arr[z]) //读取玩家装备
      for (let m = 0; m < type.length; m++) {  //遍历三个装备
        let bao = (equipment[type[m]]["bao"])
        if (!isNotNull(bao)) {//没有暴击率则改为0
          bao = 0
        }
        bao = bao?.toString().replace("%", "")  //删除百分号
        if (Number(bao) > 1 || Number(bao) < -1) {  //如果暴击率大于100就除
          bao = Number(Number(bao) / 100)
        }
        equipment[type[m]]["bao"] = Number(bao)
      }
      await Write_equipment(arr[z], equipment)  //写入装备
      //开始遍历纳戒武器
      let najie = await Read_najie(arr[z])  //读取纳戒
      for (let p = 0; p < najie["装备"].length; p++) {  //一个一个遍历武器
        let bao = najie["装备"][p]["bao"]
        if (!isNotNull(bao)) {//没有暴击率则改为0
          bao = 0
        }
        bao = bao?.toString().replace("%", "")  //删除百分号
        if (Number(bao) > 1 || Number(bao) < -1) {  //如果暴击率大于100就除
          bao = Number(Number(bao) / 100)
        }
        najie["装备"][p]["bao"] = Number(bao)
      }
      Write_najie(arr[z], najie)  //写入纳戒
    }
    e.reply('同步完成')
    return
  }
}