import { plugin, puppeteer } from '../../api/api.js';
import config from '../../model/Config.js';
import data from '../../model/XiuxianData.js';
import fs from 'fs';
import Show from '../../model/show.js';
import {
  timestampToTime,
  shijianc,
  get_random_fromARR,
  player_efficiency,
  setFileValue,
  isNotNull,
  Write_player,
  Read_player,
  get_log_img,
  Go,
  existplayer,
  channel
} from '../../model/xiuxian.js';
//要DIY的话，确保这两个数组长度相等

export class zongmendazhan extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'Association',
      /** 功能描述 */
      dsc: '宗门模块',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 600,
      rule: [
        {
          reg: '^#战.*$',
          fnc: 'zhan',
        },
      ],
    });
  }
  async zhan(e){
    let isat = e.message.some(item => item.type === 'at');
    if (!isat) {
      return;
    }
    let atItem = e.message.filter(item => item.type === 'at'); //获取at信息
    let B_qq = atItem[0].qq; //对方qq
    B_qq=await channel(B_qq)
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq= await channel(usr_qq)
    

    let player = await Read_player(usr_qq)
    let player2 = await Read_player(B_qq)
    let ass = data.getAssociation(player.宗门.宗门名称);
    let flag = await Go(e)
    if (!flag) {
        return false
      }
      //获取输入信息/站+@宗主
    let qian ;

    if(e.msg.includes("/")){
        qian = e.msg.replace("/战", '');
    }else if(e.msg.includes("#")){
        qian = e.msg.replace("#战", '');
    }
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
    e.reply("你没有存档")
      return;
    }
    let ifexistplay2 = await existplayer(B_qq);
    if (!ifexistplay2) {
        e.reply("对方没有存档")
      return;
    }
    if(player.宗门==player2.宗门){
      e.reply("自己打自己宗门?")
      return;
    }
    if(player.宗门.职位!="宗主" && player.宗门.职位!="副宗主"){
      e.reply("非宗门高层人员不得发起")
      return
    }
    if (!isNotNull(player.宗门)) {
      e.reply("你没有宗门")
      return;
    }else if(!isNotNull(player2.宗门)){
        e.reply("对方没有宗门")
        return;
    }
    if(Object.keys(ass.所有成员).length<2){
      e.reply("你的宗门势力太弱小了,多招点弟子再去挑战宗门吧")
      return
    }
    let now = new Date();
    let nowTime = now.getTime(); //获取当前日期的时间戳
    let time=await redis.get('xiuxian:ass:' + ass.宗门名称 + ':fight', nowTime);
    if(nowTime-(1000 * 60 * 60 * 24 * 7)<time){
      e.reply('最近七天您的宗门挑战过别的宗门，再挑战风评就差了')
      return
    }
    let dir = data.filePathMap.association;
    let File = fs.readdirSync(dir);
    File = File.filter(file => file.endsWith('.json')); //这个数组内容是所有的宗门名称

    //遍历所有的宗门
    for (var i = 0; i < File.length; i++) {
      let this_name = File[i].replace('.json', '');
      let this_ass = await data.getAssociation(this_name);
      
      if (player2.宗门.宗门名称 == this_name) {
        //找到了的宗门
        if(Object.keys(this_ass.所有成员).length<2){
          e.reply("对方宗门势力太弱小了,挑战得不偿失")
          return
        }

        await redis.set('xiuxian:ass:' + ass.宗门名称 + ':fight', nowTime); //redis设置时间
        //开始战力计算

        let attackPower = 0;
        let defendPower = 0;

        for (let i in ass.所有成员) {
          //遍历所有成员
          let member_qq = ass.所有成员[i];
          let ifexistplay3 = await existplayer(member_qq);
          if(!ifexistplay3)continue
          //(攻击+防御+生命*0.5)*暴击率=理论战力
          let member_data = await Read_player(member_qq);
          let power = member_data.攻击 + member_data.血量上限 * 0.5;

          power = Math.trunc(power);
          attackPower += power;
        }
      
        for (let i in this_ass.所有成员) {

          //遍历所有成员
          let member_qq = this_ass.所有成员[i];
          let ifexistplaya = await existplayer(member_qq);
          if(!ifexistplaya)continue
          //(攻击+防御+生命*0.5)*暴击率=理论战力
          let member_data = await Read_player(member_qq);
          let power = member_data.防御 + member_data.血量上限 * 0.5;

          power = Math.trunc(power);
          defendPower += power;
        }

        let randomA = Math.random();
        let randomB = Math.random();
        if (randomA > 0.75) {
          //进攻方状态大好，战力上升10%
          attackPower = Math.trunc(attackPower * 1.1);
        }
        if (randomA < 0.25) {
          attackPower = Math.trunc(attackPower * 0.9);
        }

        if (randomB > 0.75) {
          defendPower = Math.trunc(defendPower * 1.1);
        }
        if (randomB < 0.25) {
          defendPower = Math.trunc(defendPower * 0.9);
        }
        //防守方大阵血量加入计算
        attackPower += ass.宗门建设等级 * 100 + ass.大阵血量 / 2;
        defendPower += this_ass.宗门建设等级 * 100 + this_ass.大阵血量;
        let loss_ass=0
        if (attackPower > defendPower) {
          ass.大阵血量 = 0
          this_ass.大阵血量 = 0;
          data.setAssociation(ass.宗门名称, ass);
          data.setAssociation(this_ass.宗门名称, this_ass);
          e.reply(
            `${ass.宗门名称}造成了${attackPower}伤害！,一举攻破了${this_ass.宗门名称} ${defendPower}的防御，`
          );
          loss_ass=this_ass
        } else if (attackPower < defendPower) {
          data.setAssociation(this_ass.宗门名称, this_ass);
          e.reply(
            `${ass.宗门名称}进攻了${this_ass.宗门名称}，对${this_ass.宗门名称}的防御造成了${attackPower}，可一瞬间${this_ass.宗门名称}的防御就回复到了${defendPower}`
          );
          loss_ass=ass
        } else {
          data.setAssociation(this_ass.宗门名称, this_ass);
          e.reply(
            `${ass.宗门名称}进攻了${this_ass.宗门名称}，对${this_ass.宗门名称}的防御造成了${attackPower}，可一瞬间${this_ass.宗门名称}的防御就回复到了${defendPower}`
          );
          loss_ass=ass
        }
        let fakuan=10000000//总扣钱
        if(loss_ass==ass){
          fakuan*=0.5
        }
        if(loss_ass!=0){
          let zongzhu={'名号':''}
          let fuzongzhu={'名号':''}
          let ifexistplay6 = await existplayer(loss_ass.宗主);
          if(ifexistplay6){
            zongzhu=await Read_player(loss_ass.宗主)
            zongzhu.灵石-=fakuan*0.4
            await Write_player(loss_ass.宗主,zongzhu)
          }

          let ifexistplay7 = await existplayer(loss_ass.副宗主);
          if(ifexistplay7){
          fuzongzhu=await Read_player(loss_ass.副宗主)
          fuzongzhu.灵石-=fakuan*0.4
          await Write_player(loss_ass.副宗主,fuzongzhu)
          }
          for (let z in loss_ass.外门成员) {
            //遍历所有成员
            let member_qq = loss_ass.外门成员[z];
            let ifexistplay4 = await existplayer(member_qq);
            if(!ifexistplay4)continue
            let member_data = await Read_player(member_qq);
            member_data.灵石-=fakuan*0.3/(Object.keys(loss_ass.所有成员).length-2)
            await Write_player(member_qq,menubar_data)
          }
          for (let k in loss_ass.外门成员) {
            //遍历所有成员
            let member_qq = loss_ass.外门成员[k];
            let ifexistplay5 = await existplayer(member_qq);
            if(!ifexistplay5)continue
            let member_data = await Read_player(member_qq);
            member_data.灵石-=fakuan*0.3/(Object.keys(loss_ass.所有成员).length-2)
            await Write_player(member_qq,menubar_data)
          }
          e.reply(await get_log_img(`[${loss_ass.宗门名称}]战败,${loss_ass.宗门名称}宗主[${zongzhu.名号}]被掠夺[${fakuan*0.4}]零石[${loss_ass.宗门名称}],副宗主[${fuzongzhu.名号}]被掠夺[${fakuan*0.3}]零石,[${loss_ass.宗门名称}]的宗门弟子所有人被掠夺[${fakuan*0.3/(Object.keys(loss_ass.所有成员).length-2)}]零石`))
        }else{
          e.reply("发生错误:无失败宗门")
        }

        return;
      }
    }
  }


















}