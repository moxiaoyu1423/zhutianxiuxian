import { plugin, puppeteer, verc } from '../../api/api.js';
import Help from '../../model/help.js';
import Help2 from '../../model/shituhelp.js';
import Help3 from '../../model/zhutianhelp.js';
import md5 from 'md5';
let helpData = {
  md5: '',
  img: '',
};
export class BotHelp extends plugin {
  constructor() {
    super({
      name: 'BotHelp',
      dsc: '修仙帮助',
      event: 'message',
      priority: 400,
      rule: [
        {
          reg: '^.*修仙帮助.*',
          fnc: 'Xiuxianhelp',
        },
                {
          reg: '^.*职业帮助.*',
          fnc: 'zhiyehelp',
        },
          {
          reg: '^.*诸天帮助.*',
          fnc: 'zhutianhelp',
        },
                  {
          reg: '^.*灵根帮助.*',
          fnc: 'linggenhelp',
        },
                  {
          reg: '^.*基础帮助.*',
          fnc: 'jichuhelp',
        },
          {
          reg: '^.*小世界帮助.*',
          fnc: 'xiaoshijiehelp',
        },
        {
          reg: '^.*修仙管理.*',
          fnc: 'adminsuper',
        },
        {
          reg: '^.*宗门管理.*',
          fnc: 'AssociationAdmin',
        },
        {
          reg: '^.*修仙扩展.*',
          fnc: 'Xiuxianhelpcopy',
        },
            {
          reg: '^.*三周目帮助.*',
          fnc: 'Xiuxianhelpcopy2',
        },
        {
          reg: '^#师徒帮助$',
          fnc: 'shituhelp',
        },
        {
          reg: '^#周年庆帮助$',
          fnc: 'znq',
        },
        {
          reg: '^#星海之缘活动$',
          fnc: 'xinghai',
        },
      ],
    });
  }
  async znq(e) {
    let data = await Help.get_zhounian(e);

    let img = await this.cache(data);
    await e.reply(img);
  }
  async xinghai(e) {
    let data = await Help.get_xinghai(e);

    let img = await this.cache(data);
    await e.reply(img);
  }

  async Xiuxianhelpcopy(e) {
    if (!verc({ e })) return false;
    let data = await Help.gethelpcopy(e);
    if (!data) return false;
    let img = await this.cache(data);
    await e.reply(img);
  }
    async Xiuxianhelpcopy2(e) {
    if (!verc({ e })) return false;
    let data = await Help.gethelpcopy2(e);
    if (!data) return false;
    let img = await this.cache(data);
    await e.reply(img);
  }
  async Xiuxianhelp(e) {

    let data = await Help.get(e);

    let img = await this.cache(data);
    await e.reply(img);
  }
async zhutianhelp(e) {

    let data = await Help3.zhutianhelp(e);

    let img = await this.cache(data);
    await e.reply(img);
  }

async xiaoshijiehelp(e) {
    let data = await Help.xiaoshijiehelp(e);
    let img = await this.cache(data);
    await e.reply(img);
  }
  async jichuhelp(e) {
    let data = await Help.jichuhelp(e);
    let img = await this.cache(data);
    await e.reply(img);
  }
  async linggenhelp(e) {
    let data = await Help.linggenhelp(e);
    let img = await this.cache(data);
    await e.reply(img);
  }  
  async zhiyehelp(e) {

    let data = await Help.zhiyehelp(e);

    let img = await this.cache(data);
    await e.reply(img);
  }
  async adminsuper(e) {
    if (!verc({ e })) return false;
    let data = await Help.setup(e);
    if (!data) return false;
    let img = await this.cache(data);
    await e.reply(img);
  }

  async AssociationAdmin(e) {
    if (!verc({ e })) return false;
    let data = await Help.Association(e);
    if (!data) return false;
    let img = await this.cache(data);
    await e.reply(img);
  }

  async shituhelp(e) {
    if (!verc({ e })) return false;
    let data = await Help2.shituhelp(e);
    if (!data) return false;
    let img = await this.cache(data);
    await e.reply(img);
  }

  async cache(data) {
    let tmp = md5(JSON.stringify(data));
    if (helpData.md5 == tmp) return helpData.img;
    helpData.img = await puppeteer.screenshot('help', data);
    helpData.md5 = tmp;
    return helpData.img;
  }
}
