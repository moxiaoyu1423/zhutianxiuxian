import fs from 'fs';
import { plugin, common, config, data } from '../../api/api.js';
import path from 'path';
import {__PATH, sleep} from '../../model/xiuxian.js';
import { existplayer,  Read_Exchange,
  Write_Exchange,Write_Forum,
  Read_Forum,  Read_qinmidu,
  Write_qinmidu,Read_channel,Write_channel,fstadd_channel,isNotNull,  Read_player,
    
  Add_najie_thing,
   Read_najie,
  Add_修为,
  Add_血气,
    Add_player_学习功法,
  Reduse_player_学习功法,
  Add_HP,
  Read_danyao,
  Write_danyao,
  zd_battle, 
  get_log_img,
  exist_najie_thing,
  Write_player} from '../../model/xiuxian.js';
import{Read_tripod,Write_duanlu}from'../../model/duanzaofu.js'
import { AppName } from '../../app.config.js';



export class channels extends plugin {
    constructor() {
      super({
        name: 'Yunzai_Bot_AdminSuper',
        dsc: '修仙设置',
        event: 'message',
        priority: 100,
        rule: [
          {
            reg: '^#把所有频道存档撤回来',
            fnc: 'conversion',
          },
          {
            reg: '^#发起频道绑定',
            fnc: 'send',
          },
          {
            reg:"#接受频道绑定.*$",
            fnc:'reception',
          },

          {
            reg:"请私信发我一条消息",
            fnc:'cs',
          }
        ],
      });
    }
    async cs(e){
      await common.relpyPrivate(e.user_id.toString(), '你干嘛');
    }


    async send(e){
      if (e.isGroup) {
        e.reply('此功能暂时不开放在群');
        return false;
      }
      let nowid=e.user_id.toString().replace('qg_','')

      let channel;
      try {
        channel = await Read_channel();
      } catch {
        //没有建立一个
        await Write_channel([]);
        channel = await Read_channel();
      }
      for (let i = 0; i < channel.length; i++) {
        if(channel[i].QQ_ID==nowid || channel[i].频道_ID==nowid){
          e.reply("你已经发送或绑定过频道了，密钥为:"+channel[i].密钥)
          return
        }
      }
      var num=15
      var amm = ["!", "@", "#", "$", "%", "&", "*", "(", ")", "_",1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F","G"];
      var tmp = Math.floor(Math.random() * num);
      var s = tmp;//密钥
      s = s + amm[tmp];
      for (let i = 0; i < Math.floor(num/2)-1; i++) {
        tmp = Math.floor(Math.random() * 26);
        s = s + String.fromCharCode(65 + tmp);
      }
      for (let i = 0; i < (num-Math.floor(num/2)-1); i++) {
        tmp = Math.floor(Math.random() * 26);
        s = s + String.fromCharCode(97 + tmp);
      }
      await fstadd_channel(nowid,0,s)
      e.reply("您的密钥为:"+s+"请在私聊需要绑定端的机器人发送#接受频道绑定"+s)
      

    }
    async reception(e){
      let nowid=e.user_id.toString().replace('qg_','')
      // var i = nowid;
      // var l=0;
      //     while(i >= 1){
      //     i=i/10;
      //     l++;
      //     }
      // if(l<11){//判断是否为频道19位id
      //   e.reply("请在频道机器人端接受绑定申请")
      //   return
      // }
      let key = e.msg.replace('#接受频道绑定', '');
      let channel;
      try {
        channel = await Read_channel();
      } catch {
        //没有建立一个
        await Write_channel([]);
        channel = await Read_channel();
      }
      for (let i = 0; i < channel.length; i++) {
        if(channel[i].密钥==key){
          // if(nowid.indexOf("wx") != -1){
          //   channel[i].微信_ID=nowid.toString()
          //   await Write_channel(channel)
          //   e.reply("与账号"+channel[i].QQ_ID+"绑定成功")
          // }else 
          if(channel[i].QQ_ID==0){//频道发起的
            var p = nowid;
            var l=0;
                while(p >= 1){
                p=p/10;
                l++;
                }
            if(l>10){//判断是否为频道19位id
              e.reply("禁止在发起端接受申请")
              return
            }
            channel[i].QQ_ID=nowid.toString()
            await Write_channel(channel)
            e.reply("与账号"+channel[i].QQ_ID+"绑定成功")
            
          }else if(channel[i].频道_ID==0){//群发起的
            var k = nowid;
            var l=0;
                while(k >= 1){
                k=k/10;
                l++;
                }
            if(l<11){//判断是否为频道19位id
              e.reply("禁止在发起端接受申请")
              return
            }
            channel[i].频道_ID=nowid.toString()
            await Write_channel(channel)
            e.reply("与账号"+channel[i].频道_ID+"绑定成功")
          }
          return
        }
      }
      e.reply("未找到该申请")
    }
    async conversion(e){
      if(!e.isMaster){
        return
      }
      let playerList = [];
      let files = fs
        .readdirSync('./plugins/' + AppName + '/resources/data/xiuxian_player')
        .filter(file => file.endsWith('.json'));
      for (let file of files) {
        file = file.replace('.json', '');
        playerList.push(file);
      }
      let msg=0
      for (let player_id of playerList) {
      let nowid=player_id
      nowid=nowid.toString()

      var i = nowid;
      var l=0;
          while(i >= 1){
          i=i/10;
          l++;
          }
      var channel_id=0
      var channel_id2=0
      let channel;
      try {
        channel = await Read_channel();
      } catch {
        //没有建立一个
        await Write_channel([]);
        channel = await Read_channel();
      }
      let user=''
      for (i = 0; i < channel.length; i++) {
        if(channel[i].QQ_ID==nowid){
          user=channel[i]
          let player=await Read_player(nowid)
          player.id=nowid
          await Write_player(nowid,player)
        }
      }
      if(user==''){continue}
      msg+=1
      continue
      channel_id=user.频道_ID//转群
      channel_id2=user.QQ_ID

      
      let ifexistplay = await existplayer(channel_id2);
      if (ifexistplay){e.reply("发生错误:玩家"+channel_id2+'在两端存在存档，请管理员手动操作')}

        //宗门
        let dir = data.filePathMap.association;
        let File = fs.readdirSync(dir);
        File = File.filter(file => file.endsWith('.json')); //这个数组内容是所有的宗门名称
        for (var i = 0; i < File.length; i++) {
          let this_name = File[i].replace('.json', '');
          let this_ass = await data.getAssociation(this_name);
          for (var z=0;z<this_ass.所有成员.length;z++){
            if(this_ass.所有成员[z]==channel_id){

              this_ass.所有成员[z]=channel_id2

              
              data.setAssociation(this_name, this_ass);
            }
          }
          for (var z=0;z<this_ass.外门弟子.length;z++){
            if(this_ass.外门弟子[z]==channel_id){

              this_ass.外门弟子[z]=channel_id2

              
              data.setAssociation(this_name, this_ass);
            }
          }
          for (var z=0;z<this_ass.内门弟子.length;z++){
            if(this_ass.内门弟子[z]==channel_id){

              this_ass.内门弟子[z]=channel_id2

              
              data.setAssociation(this_name, this_ass);
            }
          }
          for (var z=0;z<this_ass.长老.length;z++){
            if(this_ass.长老[z]==channel_id){

              this_ass.长老[z]=channel_id2

              
              data.setAssociation(this_name, this_ass);
            }
          }
          if(this_ass.宗主==channel_id){

            this_ass.宗主=channel_id2

            
            data.setAssociation(this_name, this_ass);
          }
          
        }
        //冲水堂
        let Exchange;
        try {
          Exchange = await Read_Exchange();
        } catch {
          //没有表要先建立一个！
          await Write_Exchange([]);
          Exchange = await Read_Exchange();
        }
        for (let i of Exchange) {
          let usr_qq = i.qq;
          if(usr_qq==channel_id){
            i.qq=channel_id2
            await Write_Exchange(Exchange)
          }
        }
        //聚宝堂
        let Forum;
        try {
          Forum = await Read_Forum();
        } catch {
          //没有表要先建立一个！
          await Write_Forum([]);
          Forum = await Read_Forum();
        }
        for (let i of Forum) {
          let usr_qq = i.qq;
          if(usr_qq==channel_id){
            i.qq=channel_id2
            await Write_Forum(Forum)
          }
        }
        //亲密度
        let qinmidu;
        try {
          qinmidu = await Read_qinmidu();
        } catch {
          //没有表要先建立一个！
          await Write_qinmidu([]);
          qinmidu = await Read_qinmidu();
        }
        for (let i of qinmidu) {
          let usr_qqA = i.QQ_A;
          let usr_qqB = i.QQ_B;
          if(usr_qqA==channel_id){
            i.QQ_A=channel_id2
            await Write_qinmidu(qinmidu)
          }
          if(usr_qqB==channel_id){
            i.QQ_B=channel_id2
            await Write_qinmidu(qinmidu)
          }
        }
        //天地榜
        let tiandibang;
        try {
          tiandibang = await Read_tiandibang();
        } catch {
          //没有表要先建立一个！
          await Write_tiandibang([]);
          tiandibang = await Read_tiandibang();
        }
        for (let i of tiandibang) {
          let usr_qq = i.qq;
          if(usr_qq==channel_id){
            i.qq=channel_id2
            await Write_tiandibang(tiandibang)
          }
        }
        //炉子
        let duanlu;
        try {
          duanlu = await Read_tripod();
        } catch {
          //没有表要先建立一个！
          await Write_duanlu([]);
          duanlu = await Read_tripod();
        }
        for (let i of duanlu) {
          let usr_qq = i.qq;
          if(usr_qq==channel_id){
            i.qq=channel_id2
            await Write_duanlu(duanlu)
          }
        }

          //   //状态寄，主要问题在获取状态后数据不能赋值
          // //得到redis游戏状态
          let action = await redis.get('xiuxian:player:' + channel_id + ':action');
          action = await JSON.parse(action);
          await redis.set('xiuxian:player:' + channel_id2 + ':action', JSON.stringify(action));
          if (action != null) {
            //把状态都关了
            let arr = action;
            arr.is_jiesuan = 1; //结算状态
            arr.shutup = 1; //闭关状态
            arr.working = 1; //降妖状态
            arr.power_up = 1; //渡劫状态
            arr.Place_action = 1; //秘境
            arr.Place_actionplus = 1; //沉迷状态
            arr.end_time = new Date().getTime(); //结束的时间也修改为当前时间
            delete arr.group_id; //结算完去除group_id
            await redis.set('xiuxian:player:' + channel_id + ':action', JSON.stringify(arr));
          }
          
        //副职
        let action2 = await redis.get('xiuxian:player:' + channel_id + ':fuzhi'); //副职
        action2 = await JSON.parse(action2); 
        if (action2 != null) {
          await redis.set(
            'xiuxian:player:' + channel_id2 + ':fuzhi',
            JSON.stringify(action2)
          );
          action2=null
          await redis.set(
            'xiuxian:player:' + channel_id + ':fuzhi',
            JSON.stringify(action2)
          );
        }

        console.log(typeof channel_id2)
        fs.rename(`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_player/${channel_id}.json`,`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_player/${channel_id2}.json`,(err)=>{
          if (err) throw err;
          console.log('Rename complete!1');
        })

        fs.rename(`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_najie/${channel_id}.json`,`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_najie/${channel_id2}.json`,(err)=>{
          if (err) throw err;
          console.log('Rename complete!2');
        })

        fs.rename(`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_equipment/${channel_id}.json`,`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_equipment/${channel_id2}.json`,(err)=>{
          if (err) throw err;
          console.log('Rename complete!3');
        })

        fs.rename(`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_danyao/${channel_id}.json`,`./plugins/xiuxian-emulator-plugin/resources/data/xiuxian_danyao/${channel_id2}.json`,(err)=>{
          if (err) throw err;
          console.log('Rename complete!4');
        })
        msg+=1
        
      }
      e.reply(`转换存档${msg}个成功`)
    }
  /**
   * 推送消息，群消息推送群，或者推送私人
   * @param id
   * @param is_group
   * @return  falses {Promise<void>}
   */
  async pushInfo(id, is_group, msg) {
    if (is_group) {
      await Bot.pickGroup(id)
        .sendMsg(msg)
        .catch(err => {
          Bot.logger.mark(err);
        });
    } else {
      await common.relpyPrivate(id, msg);
    }
  }
}
async function Write_tiandibang(wupin) {
  let dir = path.join(__PATH.tiandibang, `tiandibang.json`);
  let new_ARR = JSON.stringify(wupin, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return false;
}


async function channel(usr_qq) {
  const dir = path.join(`${__PATH.channel}/channel.json`);
  const logfile = fs.readFileSync(dir, 'utf8');
  const allRecords = JSON.parse(logfile);
   if (usr_qq.length > 16) {
    for (let record of allRecords) {
      if (record.频道_ID == usr_qq) {
        usr_qq = record.QQ_ID; // 使用存档的 usr_qq
        let ifexistplay = data.existData("player", usr_qq);
        if (!ifexistplay) {
          usr_qq = record.频道_ID; // 使用存档的 usr_qq
        }
        break;
      }
    }
  } else {
    for (let record of allRecords) {
      if (record.频道_ID == usr_qq) {
        usr_qq = record.QQ_ID; // 使用存档的 usr_qq
        let ifexistplay = data.existData("player", usr_qq);
        if (!ifexistplay) {
          usr_qq = record.频道_ID; // 使用存档的 usr_qq
        }
        break;
      }
    }
  }
  return usr_qq; // 返回转换后的 usr_qq 值
}

async function Read_tiandibang() {
  let dir = path.join(`${__PATH.tiandibang}/tiandibang.json`);
  let tiandibang = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  tiandibang = JSON.parse(tiandibang);
  return tiandibang;
}
