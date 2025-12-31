import { plugin, verc } from '../../api/api.js';
import { __PATH } from '../../model/xiuxian.js';
import {
  get_gongfa_img,
  get_danyao_img,
  get_wuqi_img,
  get_daoju_img,
   get_yaoguang_img,
  get_XianChong_img,
  get_valuables_img,
  get_ningmenghome_img,
  get_hecheng_img,
  get_xigen_img,
  get_duihuan_img,
  get_wmtj_img,
  get_chengjiu_img,
  get_character_img,
  get_lqpf_img,
  get_linggen_img,
  get_jianyunhai_img,
  get_yaochi_img
} from '../../model/xiuxian.js';
export class Showningmeng extends plugin {
  constructor(e) {
    super({
      name: 'Showningmeng',
      dsc: '修仙存档展示',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#万宝楼$',
          fnc: 'show_valuables',
        },
        {
          reg: '^#装备楼$',
          fnc: 'Show_WuQi',
        },
        {
          reg: '^#丹药楼$',
          fnc: 'Show_DanYao',
        },
        {
          reg: '^#功法楼$',
          fnc: 'Show_GongFa',
        },
          {
          reg: '^#合成图鉴$',
          fnc: 'Show_hecheng',
        },
                  {
          reg: '^#洗根榜$',
          fnc: 'Show_xigen',
        },
        {
          reg: '^#兑换码图鉴$',
          fnc: 'Show_duihuan',
        },
          {
          reg: '^#位面天骄图鉴$',
          fnc: 'Show_wmtj',
        },
          {
          reg: '^#成就图鉴$',
          fnc: 'Show_chengjiu',
        },
                  {
          reg: '^#练气皮肤图鉴$',
          fnc: 'Show_lianqipifu',
        },
        {
          reg: '^#道具楼$',
          fnc: 'Show_DaoJu',
        },
        {
          reg: '^#仙宠楼$',
          fnc: 'Show_XianChong',
        },
        {
          reg: '^#柠檬堂(装备|丹药|功法|道具|草药|武器|护具|法宝|血量|修为|血气|天赋)?$',
          fnc: 'show_ningmenghome',
        },
         {
          reg: '^#瑶池仙楼$',
          fnc: 'show_yaochi',
        },
                 {
          reg: '^#摇光宝库$',
          fnc: 'show_yaoguang',
        },
         {
          reg: '^#剑云海剑阁$',
          fnc: 'show_jianyunhai',
        },
         {
          reg: '^#灵根图鉴$',
          fnc: 'show_linggen',
        },
         {
          reg: '^#剧情人物图鉴$',
          fnc: 'Show_character',
        },
      ],
    });
    this.path = __PATH.player_path;
  }
  async show_linggen(e) {
    if (!verc({ e })) return false;
    let thing_type = e.msg.replace('#灵根图鉴', '');
    let img = await get_linggen_img(e, thing_type);
    e.reply(img);
    return false;
  }
  
  //柠檬堂
  async show_ningmenghome(e) {
    if (!verc({ e })) return false;
    let thing_type = e.msg.replace('#柠檬堂', '');
    let img = await get_ningmenghome_img(e, thing_type);
    e.reply(img);
    return false;
  }
   //瑶池仙楼
  async show_yaochi(e) {
    if (!verc({ e })) return false;
    let thing_type = e.msg.replace('#瑶池仙楼', '');
    let img = await get_yaochi_img(e, thing_type);
    e.reply(img);
    return false;
  }
   //摇光宝库
  async show_yaoguang(e) {
    if (!verc({ e })) return false;
    let thing_type = e.msg.replace('#摇光宝库', '');
    let img = await get_yaoguang_img(e, thing_type);
    e.reply(img);
    return false;
  }
  async show_jianyunhai(e) {
    if (!verc({ e })) return false;
    let thing_type = e.msg.replace('#剑云海剑阁', '');
    let img = await get_jianyunhai_img(e, thing_type);
    e.reply(img);
    return false;
  }
  //万宝楼
  async show_valuables(e) {
    if (!verc({ e })) return false;
    let img = await get_valuables_img(e);
    e.reply(img);
    return false;
  }
  //仙宠楼
  async Show_XianChong(e) {
    if (!verc({ e })) return false;
    let img = await get_XianChong_img(e);
    e.reply(img);
    return false;
  }

  //武器楼
  async Show_WuQi(e) {
    if (!verc({ e })) return false;
    let img = await get_wuqi_img(e);
    e.reply(img);
    return false;
  }

  //丹药楼
  async Show_DanYao(e) {
    if (!verc({ e })) return false;
    let img = await get_danyao_img(e);
    e.reply(img);
    return false;
  }
  //功法楼
  async Show_GongFa(e) {
    if (!verc({ e })) return false;
    let img = await get_gongfa_img(e);
    e.reply(img);
    return false;
  }
  //合成图鉴
  async Show_hecheng(e) {
    if (!verc({ e })) return false;
    let img = await get_hecheng_img(e);
    e.reply(img);
    return false;
  }
    //洗根榜
  async Show_xigen(e) {
    if (!verc({ e })) return false;
    let img = await get_xigen_img(e);
    e.reply(img);
    return false;
  }
    //合成图鉴
  async Show_duihuan(e) {
    if (!verc({ e })) return false;
    let img = await get_duihuan_img(e);
    e.reply(img);
    return false;
  }
    //位面天骄图鉴
  async Show_wmtj(e) {
    if (!verc({ e })) return false;
    let img = await get_wmtj_img(e);
    e.reply(img);
    return false;
  }
    //成就图鉴
  async Show_chengjiu(e) {
    if (!verc({ e })) return false;
    let img = await get_chengjiu_img(e);
    e.reply(img);
    return false;
  }
//练气皮肤图鉴
    async Show_lianqipifu(e) {
    if (!verc({ e })) return false;
    let img = await get_lqpf_img(e);
    e.reply(img);
    return false;
  }
    //剧情人物图鉴
  async Show_character(e) {
    if (!verc({ e })) return false;
    let img = await get_character_img(e);
    e.reply(img);
    return false;
  }
  //道具楼
  async Show_DaoJu(e) {
    if (!verc({ e })) return false;
    let img = await get_daoju_img(e);
    e.reply(img);
    return false;
  }
}
