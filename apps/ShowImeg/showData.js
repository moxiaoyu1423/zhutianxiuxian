import { plugin,verc, config } from "../../api/api.js";
import {
  __PATH,
  get_equipment_img,
  get_adminset_img,
  get_power_img,
  get_statezhiye_img,
  get_state_img,
  get_statemax_img,
  get_xiangujinshi_img,
  get_mijing_img,
  get_association_img,
} from "../../model/xiuxian.js";
export class showData extends plugin {
  constructor(e) {
    super({
      name: "showData",
      dsc: "修仙存档展示",
      event: "message",
      priority: 600,
      rule: [
        {
          reg: "^#我的装备$",
          fnc: "show_equipment",
        },
        {
          reg: "^#我的炼体$",
          fnc: "show_power",
        },
        {
          reg: "^#练气境界$",
          fnc: "show_Level",
        },
        {
          reg: "^#职业等级$",
          fnc: "show_Levelzhiye",
        },
        {
          reg: "^#炼体境界$",
          fnc: "show_LevelMax",
        },
        {
          reg: "^#秘境体系$",
          fnc: "show_mijing",
        },
          {
          reg: "^#仙古今世法$",
          fnc: "show_xiangujinshi",
        },
        {
          reg: "^#我的宗门$",
          fnc: "show_association",
        },
        {
          reg: "^#修仙设置|#诸天设置|#天地本质$",
          fnc: "show_adminset",
        },
      ],
    });
    this.path = __PATH.player_path;
  }

  //修仙设置
  async show_adminset(e) {
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) return  false;
if (!verc({ e })) return  false ;
    let img = await get_adminset_img(e);
    e.reply(img);
    return  false;
  }

  async show_power(e) {
if (!verc({ e })) return  false ;
    let img = await get_power_img(e);
    e.reply(img);
    return  false;
  }
  async show_equipment(e) {
if (!verc({ e })) return  false ;
    let img = await get_equipment_img(e);
    e.reply(img);
    return  false;
  }

  async show_Levelzhiye(e) {
if (!verc({ e })) return  false ;
    let img = await get_statezhiye_img(e);
    e.reply(img);
    return  false;
  }

  async show_Level(e) {
if (!verc({ e })) return  false ;
    let img = await get_state_img(e);
    e.reply(img);
    return  false;
  }

  async show_LevelMax(e) {
if (!verc({ e })) return  false ;
    let img = await get_statemax_img(e);
    e.reply(img);
    return  false;
  }

  async show_mijing(e) {
if (!verc({ e })) return  false ;
    let img = await get_mijing_img(e);
    e.reply(img);
    return  false;
  }

  async show_xiangujinshi(e) {
if (!verc({ e })) return  false ;
    let img = await get_xiangujinshi_img(e);
    e.reply(img);
    return  false;
  }

  //我的宗门
  async show_association(e) {
if (!verc({ e })) return  false ;
    let img = await get_association_img(e);
    e.reply(img);
    return  false;
  }
}
