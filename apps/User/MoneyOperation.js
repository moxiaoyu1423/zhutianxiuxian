import { plugin,  verc, data, config } from '../../api/api.js';
import fs from 'fs';
import {
  Read_player,
  existplayer,
  exist_najie_thing,
  foundthing,
  Read_najie,
  Go,
  Add_灵石,
  Add_源石,
  Add_寿元,
  Add_najie_thing,
  convert2integer,
  __PATH,
  Add_修为,
  Add_血气,
  channel
} from '../../model/xiuxian.js';
export class MoneyOperation extends plugin {
  constructor() {
    super({
      name: 'MoneyOperation',
      dsc: '修仙模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#赠送.*$',
          fnc: 'Give',
        },
        {
          reg: '^#发红包.*$',
          fnc: 'Give_honbao',
        },
        {
          reg: '^#抢红包$',
          fnc: 'uer_honbao',
        },
        {
          reg: '^#发.*$',
          fnc: 'wup',
        },
        {
          reg: '^#全体发.*$',
          fnc: 'wup_all',
        },
        {
          reg: '^#打开钱包$',
          fnc: 'openwallet',
        },
        {
          reg: '#交税[1-9]d*',
          fnc: 'MoneyWord',
        },
      ],
    });
  }
  async wup2(e) {
    if (!verc({ e })) return false;
    //对方
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) return false;
    let atItem = e.message.filter(item => item.type === 'at'); //获取at信息
    let B_qq = atItem[0].qq//对方qq
    B_qq=B_qq.toString().replace('qg_','');
    B_qq=await channel(B_qq)
    //检查存档
    let ifexistplay = await existplayer(B_qq);
    if (!ifexistplay) {
      e.reply('对方无存档');
      return false;
    }
    //获取发送灵石数量
    let thing_name = e.msg.replace('#创造', '');
    let code = thing_name.split('*');
    thing_name = code[0];
    let thing_amount = code[1]; //数量
    let thing_piji;
    thing_amount = Number(thing_amount);
    if (isNaN(thing_amount)) {
      thing_amount = 1;
    }
    if (thing_name == '灵石') {
      await Add_灵石(B_qq, thing_amount);
    } else if (thing_name == '修为') {
      await Add_修为(B_qq, thing_amount);
    } else if (thing_name == '血气') {
      await Add_血气(B_qq, thing_amount);
    } else {
      let thing_exist = await foundthing(thing_name);
      if (!thing_exist) {
        e.reply(`这方世界没有[${thing_name}]`);
        return false;
      }
      let pj = {
        劣: 0,
        普: 1,
        优: 2,
        精: 3,
        极: 4,
        绝: 5,
        顶: 6,
      };
      thing_piji = pj[code[1]];
      if (thing_exist.class == '装备') {
        if (thing_piji) {
          thing_amount = code[2];
        } else {
          thing_piji = 0;
        }
      }
      thing_amount = Number(thing_amount);
      if (isNaN(thing_amount)) {
        thing_amount = 1;
      }
      await Add_najie_thing(
        B_qq,
        thing_name,
        thing_exist.class,
        thing_amount,
        thing_piji
      );
    }
    e.reply(`创造成功,增加${thing_name} x ${thing_amount}`);
    return false;
  }
  async wup(e) {
    if (!verc({ e })) return false;
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    //对方
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) return false;
    let atItem = e.message.filter(item => item.type === 'at'); //获取at信息
    let B_qq = atItem[0].qq//对方qq
    B_qq=B_qq.toString().replace('qg_','');
    B_qq=await channel(B_qq)
    //检查存档
    let ifexistplay = await existplayer(B_qq);
    if (!ifexistplay) {
      e.reply('对方无存档');
      return false;
    }
    //获取发送灵石数量
    let thing_name = e.msg.replace('#发', '');
    let code = thing_name.split('*');
    thing_name = code[0];
    let thing_amount = code[1]; //数量
    let thing_piji;
    thing_amount = Number(thing_amount);
    if (isNaN(thing_amount)) {
      thing_amount = 1;
    }
    if (thing_name == '灵石') {
      await Add_灵石(B_qq, thing_amount);
    } else if (thing_name == '修为') {
      await Add_修为(B_qq, thing_amount);
    } else if (thing_name == '源石') {
      await Add_源石(B_qq, thing_amount);
    }else if (thing_name == '寿元') {
      await Add_寿元(B_qq, thing_amount);
    } else if (thing_name == '血气') {
      await Add_血气(B_qq, thing_amount);
    } else {
      let thing_exist = await foundthing(thing_name);
      if (!thing_exist) {
        e.reply(`这方世界没有[${thing_name}]`);
        return false;
      }
      let pj = {
        劣: 0,
        普: 1,
        优: 2,
        精: 3,
        极: 4,
        绝: 5,
        顶: 6,
      };
      thing_piji = pj[code[1]];
      if (thing_exist.class == '装备') {
        if (thing_piji) {
          thing_amount = code[2];
        } else {
          thing_piji = 0;
        }
      }
      thing_amount = Number(thing_amount);
      if (isNaN(thing_amount)) {
        thing_amount = 1;
      }
      await Add_najie_thing(
        B_qq,
        thing_name,
        thing_exist.class,
        thing_amount,
        thing_piji
      );
    }
    e.reply(`发放成功,增加${thing_name} x ${thing_amount}`);
    return false;
  }

  async wup_all(e) {
    if (!verc({ e })) return false;
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    //所有玩家
    let File = fs.readdirSync(__PATH.player_path);
    File = File.filter(file => file.endsWith('.json'));
    let File_length = File.length;
    //获取发送灵石数量
    let thing_name = e.msg.replace('#全体发', '');
    let code = thing_name.split('*');
    thing_name = code[0];
    let thing_amount = code[1]; //数量
    let thing_piji;
    thing_amount = Number(thing_amount);
    if (isNaN(thing_amount)) {
      thing_amount = 1;
    }
    if (thing_name == '灵石') {
      for (let i = 0; i < File_length; i++) {
        let this_qq = File[i].replace('.json', '');
        await Add_灵石(this_qq, thing_amount);
      }
    } else if (thing_name == '修为') {
      for (let i = 0; i < File_length; i++) {
        let this_qq = File[i].replace('.json', '');
        await Add_修为(this_qq, thing_amount);
      }
    } else if (thing_name == '血气') {
      for (let i = 0; i < File_length; i++) {
        let this_qq = File[i].replace('.json', '');
        await Add_血气(this_qq, thing_amount);
      }
    } else {
      let thing_exist = await foundthing(thing_name);
      if (!thing_exist) {
        e.reply(`这方世界没有[${thing_name}]`);
        return false;
      }
      let pj = {
        劣: 0,
        普: 1,
        优: 2,
        精: 3,
        极: 4,
        绝: 5,
        顶: 6,
      };
      thing_piji = pj[code[1]];
      if (thing_exist.class == '装备') {
        if (thing_piji) {
          thing_amount = code[2];
        } else {
          thing_piji = 0;
        }
      }
      thing_amount = Number(thing_amount);
      if (isNaN(thing_amount)) {
        thing_amount = 1;
      }
      for (let i = 0; i < File_length; i++) {
        let this_qq = File[i].replace('.json', '');
        await Add_najie_thing(
          this_qq,
          thing_name,
          thing_exist.class,
          thing_amount,
          thing_piji
        );
      }
    }
    e.reply(
      `发放成功,目前共有${File_length}个玩家,每人增加${thing_name} x ${thing_amount}`
    );
    return false;
  }

  async MoneyWord(e) {
    if (!verc({ e })) return false;
    //这是自己的
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //自己没存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    //获取发送灵石数量
    let lingshi = e.msg.replace('#', '');
    lingshi = lingshi.replace('交税', '');
    lingshi = await convert2integer(lingshi);
    let player = await Read_player(usr_qq);
    if (player.灵石 <= lingshi) {
      e.reply('醒醒，你没有那么多');
      return false;
    }
    await Add_灵石(usr_qq, -lingshi);
    e.reply('成功交税' + lingshi);
    return false;
  }

async Give(e) {
  if (!verc({ e })) return false;
  
  // 获取自己的QQ
  let A_qq = e.user_id.toString().replace('qg_','');
  A_qq = await channel(A_qq);
  
  // 检查自己是否有存档
  if (!await existplayer(A_qq)) {
    return e.reply("你尚未踏入仙途，无法进行赠送");
  }
  
  // 检查是否有@对象
  if (!e.message.some(item => item.type === 'at')) {
    return e.reply("请@要赠送的对象");
  }
  
  // 获取对方QQ
  const atItem = e.message.filter(item => item.type === 'at');
  let B_qq = atItem[0].qq.toString().replace('qg_','');
  B_qq = await channel(B_qq);
  
  // 检查对方是否有存档
  if (!await existplayer(B_qq)) {
    return e.reply("对方尚未踏入仙途，无法接受赠送");
  }
  
  // 获取双方玩家数据
  const A_player = await Read_player(A_qq);
  const B_player = await Read_player(B_qq);
  
  // 解析消息
  const msg = e.msg.replace('#赠送', '').trim();
  const cf = config.getConfig('xiuxian', 'xiuxian');
  
  // 处理源石赠送
  if (msg.startsWith('源石')) {
    const sourceStoneAmount = await convert2integer(msg.replace('源石*', ''));
    
    // 验证输入
    if (!sourceStoneAmount || sourceStoneAmount <= 0) {
      return e.reply("请输入有效的源石数量，例如：#赠送源石*100");
    }
    
    // 计算手续费（百分比）
    const costPercentage = cf.percentage.cost || 0.1; // 默认10%手续费
    const totalCost = sourceStoneAmount + Math.ceil(sourceStoneAmount * costPercentage);
    
    // 检查源石是否足够
    if (A_player.源石 < totalCost) {
      return e.reply([
        `你的源石不足！`,
        `需要 ${totalCost.toLocaleString()} 源石（含手续费）`,
        `当前仅有 ${A_player.源石.toLocaleString()} 源石`
      ].join('\n'));
    }
    
    // 执行交易
    await Add_源石(A_qq, -totalCost);
    await Add_源石(B_qq, sourceStoneAmount);
    
    // 构建回复
    return e.reply([
      `【仙缘相赠】`,
      `${A_player.名号} 赠予 ${B_player.名号} ${sourceStoneAmount.toLocaleString()} 源石`,
      `（手续费：${Math.ceil(sourceStoneAmount * costPercentage).toLocaleString()} 源石）`,
      `愿此源石助道友仙途坦荡！`
    ].join('\n'));
  }
  
  // 处理灵石赠送
  if (msg.startsWith('灵石')) {
    let lingshi = msg.replace('灵石*', '');
    // 校验输入灵石数
    lingshi = await convert2integer(lingshi);
    
    // 没有输入正确数字或＜0
    if (!lingshi || lingshi <= 0) {
      return e.reply("请输入有效的灵石数量，例如：#赠送灵石*1000");
    }
    
    // 计算手续费
    const costPercentage = cf.percentage.cost || 0.1; // 默认10%手续费
    const totalCost = lingshi + Math.ceil(lingshi * costPercentage);
    
    // 检验A有没有那么多灵石
    if (A_player.灵石 < totalCost) {
      return e.reply([
        `你身上似乎没有${totalCost.toLocaleString()}灵石`,
        `当前仅有：${A_player.灵石.toLocaleString()}灵石`
      ]);
    }

    // 交易
    await Add_灵石(A_qq, -totalCost);
    await Add_灵石(B_qq, lingshi);
    
    return e.reply([
      `【灵石相赠】`,
      `${A_player.名号} 赠予 ${B_player.名号} ${lingshi.toLocaleString()} 灵石`,
      `（手续费：${Math.ceil(lingshi * costPercentage).toLocaleString()} 灵石）`,
      `愿此灵石助道友修行精进！`
    ]);
  }
  
  // 处理物品赠送
  let code = msg.split('*');
  let thing_name = code[0];
  let quantity = code[1];
  
  // 处理代号输入
  let thing_piji;
  let najie = await Read_najie(A_qq);
  if (!isNaN(parseInt(thing_name))) {
    const thing_code = parseInt(thing_name);
    
    if (thing_code > 1000) {
      // 仙宠代号
      try {
        const petIndex = thing_code - 1001;
        if (petIndex >= 0 && petIndex < najie.仙宠.length) {
          thing_name = najie.仙宠[petIndex].name;
        } else {
          return e.reply('仙宠代号输入有误!');
        }
      } catch {
        return e.reply('仙宠代号输入有误!');
      }
    } else if (thing_code > 100) {
      // 装备代号
      try {
        const equipIndex = thing_code - 101;
        if (equipIndex >= 0 && equipIndex < najie.装备.length) {
          thing_name = najie.装备[equipIndex].name;
          thing_piji = najie.装备[equipIndex].pinji;
        } else {
          return e.reply('装备代号输入有误!');
        }
      } catch {
        return e.reply('装备代号输入有误!');
      }
    }
  }
  
  // 检查物品是否存在
  let thing_exist = await foundthing(thing_name);
  if (!thing_exist) {
    return e.reply(`这方世界没有[${thing_name}]`);
  }
  
  // 处理品级
  const pj = {
    劣: 0,
    普: 1,
    优: 2,
    精: 3,
    极: 4,
    绝: 5,
    顶: 6,
  };
  
  // 如果未指定品级，尝试获取默认品级
  if (!thing_piji && code[1] && pj[code[1]] !== undefined) {
    thing_piji = pj[code[1]];
    quantity = code[2]; // 数量在第三个位置
  }
  
  // 转换数量
  quantity = await convert2integer(quantity) || 1;
  
  // 检查物品数量
  let x = await exist_najie_thing(
    A_qq,
    thing_name,
    thing_exist.class,
    thing_piji
  );
  
  if (x < quantity || !x) {
    return e.reply(`你还没有这么多[${thing_name}]`);
  }
  
  // 执行赠送
  await Add_najie_thing(
    A_qq,
    thing_name,
    thing_exist.class,
    -quantity,
    thing_piji
  );
  
  if (thing_exist.class == '装备' || thing_exist.class == '仙宠') {
    // 对于装备和仙宠，需要传递完整对象
    let itemToSend;
    if (thing_exist.class == '装备') {
      itemToSend = najie.装备.find(item => 
        item.name == thing_name && item.pinji == thing_piji
      );
    } else {
      itemToSend = najie.仙宠.find(item => item.name == thing_name);
    }
    
    await Add_najie_thing(
      B_qq,
      itemToSend,
      thing_exist.class,
      quantity,
      thing_piji
    );
  } else {
    // 普通物品
    await Add_najie_thing(
      B_qq,
      thing_name,
      thing_exist.class,
      quantity,
      thing_piji
    );
  }
  
  // 构建回复
  let qualityText = "";
  if (thing_piji !== undefined) {
    const qualityNames = ["劣质", "普通", "优质", "精品", "极品", "绝世", "顶级"];
    qualityText = `（${qualityNames[thing_piji]}品质）`;
  }
  
  return e.reply([
    segment.at(A_qq),
    segment.at(B_qq),
    `【宝物相赠】`,
    `${A_player.名号} 赠予 ${B_player.名号} [${thing_name}]×${quantity}${qualityText}`,
    `愿此宝物助道友仙途更上一层楼！`
  ]);
}

  //发红包
  async Give_honbao(e) {
    if (!verc({ e })) return false;
    //这是自己的
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //自己没存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    //获取发送灵石数量
    let lingshi = e.msg.replace('#', '');
    lingshi = lingshi.replace('发红包', '');
    // let flag = await Go(e);
    // if (!flag) {
    //   return false;
    // }
    let code = lingshi.split('*');
    lingshi = code[0];
    let acount = code[1];
    lingshi = await convert2integer(lingshi);
    acount = await convert2integer(acount);
    let player = await data.getData('player', usr_qq);
    const cf = config.getConfig('xiuxian', 'xiuxian');
    const cost = cf.percentage.cost;

    //对比自己的灵石，看看够不够！
    if (player.灵石 <= parseInt(lingshi * acount + Math.trunc(lingshi * cost * acount))) {
      e.reply(`红包数要比自身灵石数小噢,您还需:${lingshi * acount + Math.trunc(lingshi * cost * acount) - player.灵石}灵石(${cost*100}%包装运输费)`);
      return false;
    }
    lingshi = Math.trunc(lingshi / 10000) * 10000;
    //发送的灵石要当到数据库里。大家都能取
    await redis.set('xiuxian:player:' + usr_qq + ':honbao', lingshi);
    await redis.set('xiuxian:player:' + usr_qq + ':honbaoacount', acount);
    //然后扣灵石
    await Add_灵石(usr_qq, -(lingshi * acount + Math.trunc(lingshi * cost * acount)));
    e.reply(
      '【全服公告】' +
        player.名号 +
        '发了' +
        acount +
        '个' +
        lingshi +
        '灵石的红包！'
    );
    return false;
  }

  //抢红包
  async uer_honbao(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //自己没存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await data.getData('player', usr_qq);
    //抢红包要有一分钟的CD
    let now_time = new Date().getTime();
    let lastgetbung_time = await redis.get(
      'xiuxian:player:' + usr_qq + ':last_getbung_time'
    );
    lastgetbung_time = parseInt(lastgetbung_time);
    const cf = config.getConfig('xiuxian', 'xiuxian');
    let transferTimeout = parseInt(cf.CD.honbao * 60000);
    if (now_time < lastgetbung_time + transferTimeout) {
      let waittime_m = Math.trunc(
        (lastgetbung_time + transferTimeout - now_time) / 60 / 1000
      );
      let waittime_s = Math.trunc(
        ((lastgetbung_time + transferTimeout - now_time) % 60000) / 1000
      );
      e.reply(
        `每${transferTimeout / 1000 / 60}分钟抢一次，正在CD中，` +
          `剩余cd: ${waittime_m}分${waittime_s}秒`
      );
      return false;
    }
    //要艾特对方，表示抢对方红包
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) return false;
    let atItem = e.message.filter(item => item.type === 'at');
    let honbao_qq = atItem[0].qq;
    honbao_qq=honbao_qq.toString().replace('qg_','')
    honbao_qq=await channel(honbao_qq)
    //有无存档
    let ifexistplay_honbao = await existplayer(honbao_qq);
    if (!ifexistplay_honbao) {
      return false;
    }
    //这里有错
    let acount = await redis.get(
      'xiuxian:player:' + honbao_qq + ':honbaoacount'
    );
    acount = Number(acount);
    //根据个数判断
    if (acount <= 0) {
      e.reply('他的红包被光啦！');
      return false;
    }
    //看看一个有多少灵石
    const lingshi = await redis.get('xiuxian:player:' + honbao_qq + ':honbao');
    const addlingshi = Math.trunc(lingshi);
    //减少个数
    acount--;
    await redis.set('xiuxian:player:' + honbao_qq + ':honbaoacount', acount);
    //拿出来的要给玩家
    await Add_灵石(usr_qq, addlingshi);
    //给个提示
    e.reply(
      '【全服公告】' + player.名号 + '抢到一个' + addlingshi + '灵石的红包！'
    );
    //记录时间
    await redis.set('xiuxian:player:' + usr_qq + ':last_getbung_time', now_time);
    return false;
  }

  async openwallet(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await data.getData('player', usr_qq);
    let thing_name = '水脚脚的钱包';
    //x是纳戒内有的数量
    let acount = await exist_najie_thing(usr_qq, thing_name, '装备');
    //没有
    if (!acount) {
      e.reply(`你没有[${thing_name}]这样的装备`);
      return false;
    }
    //扣掉装备
    await Add_najie_thing(usr_qq, thing_name, '装备', -1);
    //获得随机
    const x = 0.4;
    let random1 = Math.random();
    const y = 0.3;
    let random2 = Math.random();
    const z = 0.2;
    let random3 = Math.random();
    const p = 0.1;
    let random4 = Math.random();
    let m = '';
    let lingshi = 0;
    //查找秘境
    if (random1 < x) {
      if (random2 < y) {
        if (random3 < z) {
          if (random4 < p) {
            lingshi = 2000000;
            m =
              player.名号 +
              '打开了[' +
              thing_name +
              ']金光一现！' +
              lingshi +
              '颗灵石！';
          } else {
            lingshi = 1000000;
            m =
              player.名号 +
              '打开了[' +
              thing_name +
              ']金光一现!' +
              lingshi +
              '颗灵石！';
          }
        } else {
          lingshi = 400000;
          m =
            player.名号 +
            '打开了[' +
            thing_name +
            ']你很开心的得到了' +
            lingshi +
            '颗灵石！';
        }
      } else {
        lingshi = 180000;
        m =
          player.名号 +
          '打开了[' +
          thing_name +
          ']你很开心的得到了' +
          lingshi +
          '颗灵石！';
      }
    } else {
      lingshi = 100000;
      m =
        player.名号 +
        '打开了[' +
        thing_name +
        ']你很开心的得到了' +
        lingshi +
        '颗灵石！';
    }
    await Add_灵石(usr_qq, lingshi);
    e.reply(m);
    return false;
  }
}
