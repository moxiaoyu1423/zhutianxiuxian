import { plugin, verc, data } from '../../api/api.js';
import {
  Read_player,
  existplayer,
  Write_player,
  isNotNull,
  sleep,
  exist_najie_thing,
  Go,
  Add_najie_thing,
  convert2integer,
  Add_灵石,
  Add_修为,
  Goweizhi,
  channel
} from '../../model/xiuxian.js';
export class weimiantianjiao extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_weimiantianjiao',
      dsc: '修仙模块位面天骄系统',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#讨伐鹤无双$',
          fnc: 'tiaozhan1',
        },
        {
          reg: '^#凝聚洞天灵身$',
          fnc: 'lingshen',
        },
        {
          reg: '^#凝聚意志化身$',
          fnc: 'huashen',
        },
         {
          reg: '^#凝聚无上法身$',
          fnc: 'fashen',
        },
        {
          reg: '^#神祇代行$',
          fnc: 'shenqidaixing',
        },
      ],
    });
  }
}