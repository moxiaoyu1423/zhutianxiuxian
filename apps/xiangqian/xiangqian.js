import { plugin,  data, } from '../../api/api.js'
import {
  Read_player,
  isNotNull,
  Go,
  exist_najie_thing,
  Read_equipment,
  Write_equipment,
  Write_player,
  Write_najie,
  get_baoshi_img,
  Add_najie_thing,
  Read_najie} from '../../model/xiuxian.js'
  import { __PATH } from '../../model/xiuxian.js';
  import { alluser } from "../../model/duanzaofu.js";
//名字出品，禁止使用在商业场景
export class xiangqian extends plugin {
    constructor() {
      super({
        name: 'xiangqian',
        dsc: '修仙模块',
        event: 'message',
        priority: 600,
        rule: [
          // {
          //   reg: '^(#|/)同步宝石位$',
          //   fnc: 'tongbu'
          // },
          // {
          //   reg: '^(#|/)镶嵌.*$',
          //   fnc: 'xiangqian'
          // },
          // // {
          // //   reg: '^(#|/)同步装备宝石位$',
          // //   fnc: 'tongbuxiangqian'
          // // },
          // {
          //   reg: '^(#|/)取下.*$',
          //   fnc: 'quxiangqian'
          // },
          // // {
          // //   reg: '^(#|/)我的宝石装备$',
          // //   fnc: 'mybaoshi'
          // // },
          // {
          //   reg: '^(#|/)强化.*$',
          //   fnc: 'qianghua'
          // },
          // {
          //   reg: '^(#|/)查看.*$',
          //   fnc: 'cheak'
          // }
      ]})
    }
    async tongbu(e){
      let usr_qq = await alluser();
let najiePromises = usr_qq.map(qq => Read_najie(qq));
let najieResults = await Promise.all(najiePromises);
let equipmentPromises = usr_qq.map(qq => Read_equipment(qq));
let equipmentResults = await Promise.all(equipmentPromises);
console.log(usr_qq);
const type = ['武器', '护具', '法宝'];

// 检查并添加宝石位
const addGemSlots = (item) => {
  if (!item.hasOwnProperty('宝石位')) {
    item['宝石位'] = {
      "宝石位1": "无",
      "宝石位2": "无",
      "宝石位3": "无",
    };
  }
};

for (let i = 0; i < usr_qq.length; i++) {
  // console.log(usr_qq.length);
  let qq = usr_qq[i];
  let najie = najieResults[i];
  let equipment = equipmentResults[i];


  for (let n = 0; n < najie.装备.length; n++) {
    for (let m = 0; m < type.length; m++) {
      addGemSlots(equipment[type[m]]);
      addGemSlots(najie.装备[n]); 
    }
  }
  if(!najie.hasOwnProperty('宝石')){
    najie["宝石"]=[]
  }
  // for (let m = 0; m < type.length; m++) {
  //   addGemSlots(equipment[type[m]]);

  // }
  await Write_najie(qq, najie);
  await Write_equipment(qq, equipment);
}  
  let lib = data.filePathMap.lib;
      const dataList = await data.getlist("装备列表.json",lib);
    
      if (dataList !== 'error') {
        for (let i in await data.equipment_list) {
          console.log(i);
          let item = await data.equipment_list[i];
          if (!item.hasOwnProperty('宝石位')) {
            // let 宝石位={
            //   "宝石位1": "无",
            //   "宝石位2": "无",
            //   "宝石位3": "无",
            // };
            
            // item.push(宝石位)
            // let dir = path.join(__PATH.equipment_list, `装备列表.json`);
            // let new_ARR = JSON.stringify(channel, '', '\t');
            // fs.writeFileSync(dir, new_ARR, 'utf8', err => {
            //   console.log('写入成功', err);
            // });
          }
        }
        await data.writelist("装备列表.json",lib, dataList);
      } else {
       console.log(error);
       return;
      }
     
      e.reply(`同步成功`)
    }
    async cheak(e){
        let usr_qq = e.user_id
    console.log(1231231219923);
    //获得土地信息
    let player = await Read_player(usr_qq)
    let flag = await Go(e)
    if (!flag) {
        return false
      }
      //获取输入信息宝石*装备*宝石位+数字
    let qian ;
    if(e.msg.includes("/")){
        qian = e.msg.replace("/查看", '');
    }else if(e.msg.includes("#")){
        qian = e.msg.replace("#查看", '');
    }
    qian = qian.trim();
    let code = qian.split('*');
    //宝石名称
    // let baoshi = parseInt(code[0]);
    // if (isNaN(baoshi)) {
    //   e.reply("宝石名称无效");
    //   return;
    // }
     
  

    let baoshi = code[0].trim(); // 宝石名称
   let thing_name = code[1].trim(); // 装备名称
   let gemSlot = code[2].trim(); // 宝石位
    // let thing_name = code[1]; //装备
    // let gemSlot = code[2].trim(); // 宝石位
    let baoshi2 = await data.baoshi_list.find(item => item.name == baoshi);
    let thing2 = await data.equipment_list.find(item => item.name == thing_name);
    console.log(baoshi);
    console.log(baoshi2);
    console.log(gemSlot);
    console.log(thing_name); 
    let equipment = await Read_equipment(usr_qq);
    const gem = equipment[thing2.type].宝石位[gemSlot];
    const equipmentType = equipment[thing2.type];
  //   let type=[
  //     '武器',
  //     '护具',
  //     '法宝'
  //   ]
  //   let type2=[
  //     '宝石位1',
  //     '宝石位2',
  //     '宝石位3'
  //   ]

  //   //宝石镶嵌位
  // for (let p = 0; p < type.length; p++) {
  //   for(let m=0;m<type.length;m++){
  //     if(Object.keys(equipment[type[m]]).length!=13){
  //       e.reply("检测到你的存档十分得有9分不对劲开始自动同步")
  //       equipment[type[m]]['宝石位']={
  //         "宝石位1":"无",
  //         "宝石位2":"无",
  //         "宝石位3":"无",
  //       }
  //     }else if (equipmentType.宝石位 != ''&&Object.keys(equipment[type[m]].宝石位[type2[p]]) != "无") {
  //       equipment[type[m]]['宝石位']={
  //         "宝石位1":"无",
  //         "宝石位2":"无",
  //         "宝石位3":"无",
  //       }  
  //     }
  //   } 
  //    e.reply("自动同步完毕")
  //     await Write_equipment(usr_qq, equipment);
  // }
  
   
    if (!isNotNull(baoshi2)) {
        e.reply("哪里来的这种宝石")  
        return;
   }else if(equipmentType.宝石位 == ''){
    e.reply(`你的${thing2.type}上没有宝石位，请找输入#同步装备宝石位`)
    return;
   }else if(gemSlot != "宝石位1"&&gemSlot != "宝石位2"&&gemSlot != "宝石位3"){
       e.reply("没有这个宝石位")
       return;
   }
   if (gem.name != baoshi) {
    e.reply("此位置上没有这种宝石")
   }
   if (gem =="无") {
    e.reply(`此位置上啥也没有`)
    return;
   }
   e.reply(`此宝石位上的的宝石等阶是${gem.type}\n等级为${gem.强化次数 -gem.失败次数}`)
   return;
    }
  async xiangqian(e){
    if (usr_qq =3163323136) {
      e.reply(`老登`)     
    }
    let usr_qq = e.user_id
    console.log(1231231219923);
    //获得土地信息
    let najie = await Read_najie(usr_qq)
    let player = await Read_player(usr_qq)
    let flag = await Go(e)
    if (!flag) {
        return false
      }
      //获取输入信息宝石*装备*宝石位+数字
    let qian ;
    if(e.msg.includes("/")){
        qian = e.msg.replace("/镶嵌", '');
    }else if(e.msg.includes("#")){
        qian = e.msg.replace("#镶嵌", '');
    }
    qian = qian.trim();

    let code = qian.split('*');
    //宝石名称
    // let baoshi = parseInt(code[0]);
    // if (isNaN(baoshi)) {
    //   e.reply("宝石名称无效");
    //   return;
    // }
     
  

    let baoshi = code[0].trim(); // 宝石名称
   let thing_name = code[1].trim(); // 装备名称
   let gemSlot = code[2].trim(); // 宝石位
    // let thing_name = code[1]; //装备
    // let gemSlot = code[2].trim(); // 宝石位
    let baoshi2 = await data.baoshi_list.find(item => item.name == baoshi);
    let thing2 = await data.equipment_list.find(item => item.name == thing_name);
    let baoshi3 =najie.find(item => item.name == baoshi);
    let equipment = await Read_equipment(usr_qq);
    const gem = equipment[thing2.type].宝石位[gemSlot];
    const equipmentType = equipment[thing2.type];
    console.log(baoshi);
    console.log(baoshi2);
    console.log(gemSlot);
    console.log(thing_name);
    this.tongbu
    // let a =await exist_najie_thing(usr_qq,baoshi2,"宝石")
   let a = await exist_najie_thing(usr_qq, baoshi, "宝石");
   if (!a) {
  e.reply(`你没有这个${baoshi}`);
  return;
   }
   if (gem.强化次数==0) {
    if (!isNotNull(baoshi2)) {
   e.reply("哪里来的这种宝石")  
   return;
  }
    if (gem.name != baoshi) {
       e.reply("此位置上没有这种宝石")
       return;
      }
  }
  //  else if(baoshi!=baoshi2){
       
      
  //   }
  // e.reply("检测到你的存档十分得有9分不对劲开始自动同步,并清除宝石")
  // e.reply("自动同步完毕")

// let cheak =await cheakbaoshi(e,usr_qq)
// console.log(cheak);
// if (cheak) {
if(equipmentType.宝石位 == ''){
     e.reply(`你的${thing2.type}上没有宝石位，请找输入#同步装备宝石位`)
  }
     else if(thing_name != equipmentType.name){
        e.reply(`请先把需要镶嵌宝石的装备装备上`)
        return;
    }else if(gemSlot != "宝石位1"&&gemSlot != "宝石位2"&&gemSlot != "宝石位3"){
        e.reply("没有这个宝石位")
        return;
    }else if(gem!= "无"){
        e.reply(`此处已经镶嵌上${gem.name}`)
        return;
    }
    // if (gem.name != baoshi) {
    //     e.reply("此位置上没有这种宝石")
    //    }
    
    const time = 3 //时间（分钟)
  if (najie.宝石.baoshi.强化次数 == 0) {
    let abc = najie.宝石.baoshi.type 
     let arr = {
          action: '镶嵌', //动作
          start_time: new Date().getTime(), //结束时间
          Place_address: baoshi2,
          wei:gemSlot,
          thing:thing2,
          type:abc
        };
        if (e.isGroup) {
          arr.group_id = e.group_id
        }
        console.log("来源:万界修仙");
        await redis.set(
            'xiuxian:player:' + usr_qq + ':action',
            JSON.stringify(arr)
          ); 
        
        e.reply('开始镶嵌宝石' + baoshi2.name + ',' + time + '分钟后完毕!(来源:万界修仙)')
        Add_najie_thing(usr_qq,baoshi2.name,"宝石",-1,returns,thing2)
        return false
  }
    let abc =baoshi3.type
    let arr = {
      action: '镶嵌', //动作
      start_time: new Date().getTime(), //结束时间
      Place_address: baoshi3,
      wei:gemSlot,
      thing:thing2,
      type:abc
    };
    if (e.isGroup) {
      arr.group_id = e.group_id
    }
    console.log("来源:万界修仙");
    await redis.set(
        'xiuxian:player:' + usr_qq + ':action',
        JSON.stringify(arr)
      ); 
    
    e.reply('开始镶嵌宝石' + baoshi + ',' + time + '分钟后完毕!(来源:万界修仙)')
    Add_najie_thing(usr_qq,baoshi,"宝石",-1,returns,baoshi3)
    return false
  }


 async quxiangqian(e){
    let usr_qq = e.user_id
    console.log(1231231219923);
    //获得土地信息
    let najie  = await Read_najie(usr_qq)
    let player = await Read_player(usr_qq)
    let flag = await Go(e)
    if (!flag) {
        return false
      }
      //获取输入信息宝石*装备*宝石位+数字
    let qian ;
    if(e.msg.includes("/")){
        qian = e.msg.replace("/取下", '');
    }else if(e.msg.includes("#")){
        qian = e.msg.replace("#取下", '');
    }
    qian = qian.trim();
    let code = qian.split('*');
    //宝石名称
    // let baoshi = parseInt(code[0]);
    // if (isNaN(baoshi)) {
    //   e.reply("宝石名称无效");
    //   return;
    // }
    let baoshi = code[0].trim(); // 宝石名称
   let thing_name = code[1].trim(); // 装备名称
   let gemSlot = code[2].trim(); // 宝石位
   let baoshi2 = await data.baoshi_list.find(item => item.name == baoshi);
   let thing2 = await data.equipment_list.find(item => item.name == thing_name);
   console.log(baoshi);
   console.log(baoshi2);
   console.log(gemSlot);
   console.log(thing_name);
   let equipment = await Read_equipment(usr_qq);
   let gem = equipment[thing2.type].宝石位[gemSlot];
   let equipmentType = equipment[thing2.type];
   if (!isNotNull(baoshi2)) {
    e.reply("哪里来的这种宝石")  
    return;
   }
   if (gem.强化次数==0) {
    if (!isNotNull(baoshi2)) {
   e.reply("哪里来的这种宝石")  
   return;
  }
    if (gem.name != baoshi) {
       e.reply("此位置上没有这种宝石")
       return;
      }else{
        e.reply(`已取下${baoshi}`) 
        await Add_najie_thing(usr_qq,baoshi,"宝石",+1)
      }
  }
   if (gem.取下判断<1) {
    let a =gem.暴击加成*1
    let b =gem.攻击加成*1
    let c =gem.生命加成*1
    let d =gem.防御加成*1
    equipmentType.atk += a -gem.攻击加成 
    equipmentType.bao += b -gem.暴击加成
    equipmentType.HP  += c -gem.生命加成 
    equipmentType.def += d -gem.防御加成
    return;
   }else if (gem.取下判断>=1) {
    equipmentType.atk -= gem.攻击加成 
    equipmentType.bao -= gem.暴击加成
    equipmentType.HP  -= gem.生命加成 
    equipmentType.def -= gem.防御加成
    
   }
   e.reply(`已取下${baoshi}`) 
   let name =gem.name + "(" + gem.强化次数 + ")";
   let information={
    name:name,
    type:gem.type,
    class: gem.class,
    攻击加成: gem.攻击加成,
    暴击加成: gem.暴击加成,
    生命加成: gem.生命加成,
    防御加成:gem.防御加成,
    强化次数:gem.强化次数,
    升级次数:gem.升级次数,
    失败次数:gem.失败次数,
    取下判断:gem.取下判断,
    出售价: gem.出售价
  }
   await Add_najie_thing(usr_qq,information,"宝石",1)
   equipment[thing2.type].宝石位[gemSlot] = "无"
   await Write_najie(usr_qq, najie);
   await Write_equipment(usr_qq, equipment);
  
   return;
}
 async mybaoshi(e){
        //不开放私聊功能
        if (!e.isGroup) {
            return;
        }
        let img = await get_baoshi_img(e);
        e.reply(img);
        return;
    
 }
 async qianghua(e){
    let usr_qq = e.user_id
    console.log(1231231219923);
    //获得土地信息
    let player = await Read_player(usr_qq)
    let flag = await Go(e)
    if (!flag) {
        return false
      }
      //获取输入信息宝石*装备*宝石位+数字
    let qian ;
    if(e.msg.includes("/")){
        qian = e.msg.replace("/强化", '');
    }else if(e.msg.includes("#")){
        qian = e.msg.replace("#强化", '');
    }
    qian = qian.trim();
    let code = qian.split('*');
    //宝石名称
    // let baoshi = parseInt(code[0]);
    // if (isNaN(baoshi)) {
    //   e.reply("宝石名称无效");
    //   return;
    // }
    let baoshi = code[0].trim(); // 宝石名称
   let thing_name = code[1].trim(); // 装备名称
   let gemSlot = code[2].trim(); // 宝石位
   let baoshi2 = await data.baoshi_list.find(item => item.name == baoshi);
   let thing2 = await data.equipment_list.find(item => item.name == thing_name);
   let equipment = await Read_equipment(usr_qq);
   const gem = equipment[thing2.type].宝石位[gemSlot];
   const equipmentType = equipment[thing2.type];
   console.log(baoshi);
   console.log(baoshi2);
   console.log(gemSlot);
   console.log(thing_name);
   const random = Math.random();
   if (gem.强化次数==0) {
     if (!isNotNull(baoshi2)) {
    e.reply("哪里来的这种宝石")  
    return;
   }
     if (gem.name != baoshi) {
        e.reply("此位置上没有这种宝石")
        return;
       }
   }
  
   
       const gemType = gem.type;
       let stoneType = "";
       if (gemType === "低级宝石") {
         stoneType = "低级强化石";
       } else if (gemType === "中级宝石") {
         stoneType = "中级强化石";
       } else if (gemType === "高级宝石") {
         stoneType = "高级强化石";
       }
       
       if (stoneType) {
         const hasStone = await exist_najie_thing(usr_qq, stoneType, "道具");
         if (!hasStone) {
           e.reply(`你没有${stoneType}`);
           return;
         }
         await Add_najie_thing(usr_qq, stoneType, "道具", -1);
       }
       if (gem.取下判断 == 0) {
        e.reply("tmd，有没有好好看我判断就乱改，你家0乘以任何数不等于0，奶奶滴，你小子，帮你改1了，tm再改0.头给你打歪(名字除外)")
        gem.取下判断 = 1
        await Write_equipment(usr_qq, equipment);
        return;
       }
       console.log(1);
   if (gem.强化次数 ==0 ) {
    if (gem.type=="低级宝石") {
        if (random < 0.8) {
            if (random < 0.9) {
                console.log(2);
              e.reply("强化成功");
              gem.强化次数 += 1;
              gem.升级次数 += 1;
              const multiplier = 1.1 + Math.random() * 0.3;
              const { 攻击加成, 暴击加成, 生命加成, 防御加成 } = gem;
              gem.攻击加成 = Math.floor(gem.攻击加成 * multiplier);
              gem.暴击加成 = Math.floor(gem.暴击加成 * multiplier);
              gem.生命加成 = Math.floor(gem.生命加成 * multiplier);
              gem.防御加成 = Math.floor(gem.防御加成 * multiplier);
              gem.取下判断 = Math.floor(gem.取下判断 * multiplier);
              gem.出售价 = Math.floor(gem.出售价*1.2);
              equipmentType.atk += gem.攻击加成 - 攻击加成;
              equipmentType.bao += gem.暴击加成 - 暴击加成;
              equipmentType.HP += gem.生命加成 - 生命加成;
              equipmentType.def += gem.防御加成 - 防御加成;
            } else if (random < 0.5) {
              e.reply("触发双倍强化");
              gem.升级次数 += 2;
              gem.强化次数 += 2;
              const { 攻击加成, 暴击加成, 生命加成, 防御加成 } = gem;
              const multiplier = 1.2+ Math.random() * 0.3;;
              gem.攻击加成 = Math.floor(gem.攻击加成 * multiplier);
              gem.暴击加成 = Math.floor(gem.暴击加成 * multiplier);
              gem.生命加成 = Math.floor(gem.生命加成 * multiplier);
              gem.防御加成 = Math.floor(gem.防御加成 * multiplier);
              gem.取下判断 = Math.floor(gem.取下判断 * multiplier);
              gem.出售价 *= 1.3;
              equipmentType.atk += gem.攻击加成 - 攻击加成;
              equipmentType.bao += gem.暴击加成 - 暴击加成;
              equipmentType.HP += gem.生命加成 - 生命加成;
              equipmentType.def += gem.防御加成 - 防御加成;
            }
            
            await Write_equipment(usr_qq, equipment);
          } else if (gem.失败次数 === 0) {
            e.reply('强化失败');
            gem.强化次数 += 1;
            gem.失败次数 += 1;
            const { 攻击加成, 暴击加成, 生命加成, 防御加成 } = gem;
            const multiplier = 0.9+ Math.random() * 0.2;
            gem.攻击加成 = Math.floor(gem.攻击加成 * multiplier);
            gem.暴击加成 = Math.floor(gem.暴击加成 * multiplier);
            gem.生命加成 = Math.floor(gem.生命加成 * multiplier);
            gem.防御加成 = Math.floor(gem.防御加成 * multiplier);
            gem.取下判断 = Math.floor(gem.取下判断 * multiplier);
            gem.出售价 = Math.floor(gem.出售价*0.9);
            equipmentType.atk += gem.攻击加成 - 攻击加成;
            equipmentType.bao += gem.暴击加成 - 暴击加成;
            equipmentType.HP += gem.生命加成 - 生命加成;
            equipmentType.def += gem.防御加成 - 防御加成 ;
            await Write_equipment(usr_qq, equipment);
          }
        }
            // else if (gem.失败次数 > 0) {
            //     if (gem.失败次数>=10) {
            //         e.reply("强化成功")
            //         gem.强化次数+=1
            //         gem.失败次数 = 0
                    
            //     }
            // }  
    }else if (gem.type=="中级宝石") {
        if (random < 0.5) {
            if (random < 0.91) {
              e.reply("强化成功");
              gem.强化次数 += 1;
              gem.升级次数 += 1;
              const { 攻击加成, 暴击加成, 生命加成, 防御加成 } = gem;
              const multiplier = 1.2+ Math.random() * 0.3;
              gem.攻击加成 = Math.floor(gem.攻击加成 * multiplier);
              gem.暴击加成 = Math.floor(gem.暴击加成 * multiplier);
              gem.生命加成 = Math.floor(gem.生命加成 * multiplier);
              gem.防御加成 = Math.floor(gem.防御加成 * multiplier);
              gem.取下判断 = Math.floor(gem.取下判断 * multiplier);
              gem.出售价 = Math.floor(gem.出售价 * 1.2);

              equipmentType.atk += gem.攻击加成 - 攻击加成;
              equipmentType.bao += gem.暴击加成 - 暴击加成;
              equipmentType.HP += gem.生命加成 - 生命加成;
              equipmentType.def += gem.防御加成 - 防御加成;
              await Write_equipment(usr_qq, equipment);
            } else if (random < 0.4) {
                e.reply("触发双倍强化");
                gem.强化次数 += 2;
                gem.升级次数 += 2;
                const { 攻击加成, 暴击加成, 生命加成, 防御加成 } = gem;
                const multiplier = 1.4+ Math.random() * 0.3;
                gem.攻击加成 = Math.floor(gem.攻击加成 * multiplier);
                gem.暴击加成 = Math.floor(gem.暴击加成 * multiplier);
                gem.生命加成 = Math.floor(gem.生命加成 * multiplier);
                gem.防御加成 = Math.floor(gem.防御加成 * multiplier);
                gem.取下判断 = Math.floor(gem.取下判断 * multiplier);
                gem.出售价 = Math.floor(gem.出售价*1.4);
               
                equipmentType.atk += gem.攻击加成 - 攻击加成;
                equipmentType.bao += gem.暴击加成 - 暴击加成;
                equipmentType.HP += gem.生命加成 - 生命加成;
                equipmentType.def += gem.防御加成 - 防御加成;
                await Write_equipment(usr_qq, equipment);
              }
            } else {
              if (gem.失败次数 === 0) {
                e.reply('强化失败');
                gem.强化次数 += 1;
                gem.失败次数 += 1;
                const { 攻击加成, 暴击加成, 生命加成, 防御加成 } = gem;
                const multiplier = 0.8+ Math.random() * 0.2;
                gem.攻击加成 = Math.floor(gem.攻击加成 * multiplier);
                gem.暴击加成 = Math.floor(gem.暴击加成 * multiplier);
                gem.生命加成 = Math.floor(gem.生命加成 * multiplier);
                gem.防御加成 = Math.floor(gem.防御加成 * multiplier);
                gem.取下判断 = Math.floor(gem.取下判断 * multiplier);
                gem.出售价 = Math.floor(gem.出售价*0.8);
                equipmentType.atk -= 攻击加成 - gem.攻击加成;
                equipmentType.bao -= 暴击加成 - gem.暴击加成;
                equipmentType.HP -= 生命加成 - gem.生命加成;
                equipmentType.def -= 防御加成 - gem.防御加成;
                await Write_equipment(usr_qq, equipment);
              }
            }
          }else if (gem.type=="高级宝石") {
            if (random < 0.2) {
                if (random < 0.95) {
                  e.reply("强化成功");
                  gem.强化次数 += 1;
                  gem.升级次数 += 1;
                  const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                  const multiplier = 1.4+ Math.random() * 0.3;
                  gem.攻击加成 = Math.floor(gem.攻击加成 * multiplier);
                  gem.暴击加成 = Math.floor(gem.暴击加成 * multiplier);
                  gem.生命加成 = Math.floor(gem.生命加成 * multiplier);
                  gem.防御加成 = Math.floor(gem.防御加成 * multiplier);
                  gem.取下判断 = Math.floor(gem.取下判断 * multiplier);
                  gem.出售价 = Math.floor(gem.出售价*1.4);
                  equipmentType.atk -= 攻击加成 - gem.攻击加成;
                  equipmentType.bao -= 暴击加成 - gem.暴击加成;
                  equipmentType.HP -= 生命加成 - gem.生命加成;
                  equipmentType.def -= 防御加成 - gem.防御加成;
                  await Write_equipment(usr_qq, equipment);
                } else if (random < 0.3) {
                  e.reply("触发双倍强化");
                  gem.强化次数 += 2;
                  gem.升级次数 += 2;
                  const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                  const multiplier = 1.6+ Math.random() * 0.2;
                  gem.攻击加成 = Math.floor(gem.攻击加成 * multiplier);
                  gem.暴击加成 = Math.floor(gem.暴击加成 * multiplier);
                  gem.生命加成 = Math.floor(gem.生命加成 * multiplier);
                  gem.防御加成 = Math.floor(gem.防御加成 * multiplier);
                  gem.取下判断 = Math.floor(gem.取下判断 * multiplier);
                  gem.出售价 = Math.floor(gem.出售价*1.6);
                  equipmentType.atk -= 攻击加成 - gem.攻击加成;
                  equipmentType.bao -= 暴击加成 - gem.暴击加成;
                  equipmentType.HP -= 生命加成 - gem.生命加成;
                  equipmentType.def -= 防御加成 - gem.防御加成;
                  await Write_equipment(usr_qq, equipment);
                }
              } else {
                if (gem.失败次数 == 0) {
                  e.reply('强化失败');
                  gem.强化次数 += 1;
                  gem.失败次数 += 1;
                  const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                  let enhanceMultiplier =0.7+ Math.random() * 0.2;
                  gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                  gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                  gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                  gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                  gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                  gem.出售价 = Math.floor(gem.出售价*0.9);
                  equipmentType.atk -= 攻击加成 - gem.攻击加成;
                  equipmentType.bao -= 暴击加成 - gem.暴击加成;
                  equipmentType.HP -= 生命加成 - gem.生命加成;
                  equipmentType.def -= 防御加成 - gem.防御加成;
                  await Write_equipment(usr_qq, equipment);
                }
              }
            }
            else if (gem.强化次数 > 0 || gem.强化次数 < 0) {
                if (gem.type == "低级宝石") {
                  if (random < 0.75) {
                    if (random < 0.95) {
                      e.reply("强化成功");
                      gem.强化次数 += 1;
                      gem.升级次数 += 1
                      const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                      const enhanceMultiplier = 1.15+ Math.random() * 0.3;
                     gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                     gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                     gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                     gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                     gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                     gem.出售价 = Math.floor(gem.出售价*1.2);
                      equipmentType.atk += gem.攻击加成 - 攻击加成;
                      equipmentType.bao += gem.暴击加成 - 暴击加成;
                      equipmentType.HP += gem.生命加成 - 生命加成;
                      equipmentType.def += gem.防御加成 - 防御加成;
                      if (gem.升级次数 >= 10) {
                          gem.type = "中级宝石";
                          e.reply("恭喜你你的宝石进化成中级宝石");
                          gem.升级次数 = 0
                        }
                      await Write_equipment(usr_qq, equipment);
                      return;
                    } else if (random < 0.45) {
                      e.reply("触发双倍强化");
                      gem.强化次数 += 2;
                      gem.升级次数 += 2;
                      const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                      const enhanceMultiplier = 1.25+ Math.random() * 0.3;
                     gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                     gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                     gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                     gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                     gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                     gem.出售价 = Math.floor(gem.出售价*1.2);
                      equipmentType.atk += gem.攻击加成 - 攻击加成;
                      equipmentType.bao += gem.暴击加成 - 暴击加成;
                      equipmentType.HP += gem.生命加成 - 生命加成;
                      equipmentType.def += gem.防御加成 - 防御加成;
                      if (gem.升级次数 >= 10) {
                          gem.type = "中级宝石";
                          e.reply("恭喜你你的宝石进化成中级宝石");
                          gem.升级次数 = 0
                        }
                      await Write_equipment(usr_qq, equipment);
                      return;
                    }
                  } else {
                    if (gem.失败次数 == 0) {
                      if (gem.失败次数 >= 10) {
                        e.reply("触发保底，强化成功");
                        gem.强化次数 += 1;
                        gem.升级次数 += 1;
                        const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                        const enhanceMultiplier = 1.15+ Math.random() * 0.3;
                        gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                        gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                        gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                        gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                        gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                        gem.出售价 = Math.floor(gem.出售价*1.5);
                        equipmentType.atk += gem.攻击加成 - 攻击加成;
                        equipmentType.bao += gem.暴击加成 - 暴击加成;
                        equipmentType.HP += gem.生命加成 - 生命加成;
                        equipmentType.def += gem.防御加成 - 防御加成;
                        if (gem.升级次数 >= 10) {
                            gem.type = "中级宝石";
                            e.reply("恭喜你你的宝石进化成中级宝石");
                            gem.升级次数 = 0
                          }
                        await Write_equipment(usr_qq, equipment);
                      } else {
                        e.reply("强化失败");
                        gem.强化次数 += 1;
                        gem.失败次数 += 1;
                        const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                        const enhanceMultiplier = 0.85+ Math.random() * 0.2;
                        gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                        gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                        gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                        gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                        gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                        gem.出售价 = Math.floor(gem.出售价*0.85);
                        equipmentType.atk -= 攻击加成 - gem.攻击加成;
                        equipmentType.bao -= 暴击加成 - gem.暴击加成;
                        equipmentType.HP -= 生命加成 - gem.生命加成;
                        equipmentType.def -= 防御加成 - gem.防御加成;
                        await Write_equipment(usr_qq, equipment);
                      }
                    }
                  }
                }
              
                else if (gem.type == "中级宝石") {
                    if (random < 0.55) {
                      if (random < 0.95) {
                        e.reply("强化成功");
                        gem.强化次数 += 1;
                        gem.升级次数 += 1;
                        const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                        const enhanceMultiplier = 1.25+ Math.random() * 0.3;
                        gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                        gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                        gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                        gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                        gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                        gem.出售价 = Math.floor(gem.出售价*1.35);
                        equipmentType.atk += gem.攻击加成 - 攻击加成;
                        equipmentType.bao += gem.暴击加成 - 暴击加成;
                        equipmentType.HP += gem.生命加成 - 生命加成;
                        equipmentType.def += gem.防御加成 - 防御加成;
                        if (gem.升级次数 >= 10) {
                            gem.type = "高级宝石";
                            e.reply("恭喜你你的宝石进化成高级宝石");
                            gem.升级次数 = 0
                          }
                        await Write_equipment(usr_qq, equipment);
                        return;
                      } else if (random < 0.45) {
                        e.reply("触发双倍强化");
                        gem.强化次数 += 2;
                        gem.升级次数 += 2;
                        const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                        const enhanceMultiplier = 1.45+ Math.random() * 0.3;
                        gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                        gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                        gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                        gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                        gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                        gem.出售价 = Math.floor(gem.出售价*1.4);
                        equipmentType.atk += gem.攻击加成 - 攻击加成;
                        equipmentType.bao += gem.暴击加成 - 暴击加成;
                        equipmentType.HP += gem.生命加成 - 生命加成;
                        equipmentType.def += gem.防御加成 - 防御加成;
                        if (gem.强化次数 >= 10) {
                          gem.type = "高级宝石";
                          e.reply("恭喜你你的宝石进化成高级宝石");
                        }
                        await Write_equipment(usr_qq, equipment);
                        return;
                      }
                    } else {
                      if (gem.失败次数 == 0) {
                        if (gem.失败次数 >= 10) {
                          e.reply("触发保底，强化成功");
                          gem.强化次数 += 1;
                          const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                          const enhanceMultiplier = 1.35+ Math.random() * 0.3;
                          gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                          gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                          gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                          gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                          gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                          gem.出售价 = Math.floor(gem.出售价*1.35);
                          equipmentType.atk += gem.攻击加成 - 攻击加成;
                          equipmentType.bao += gem.暴击加成 - 暴击加成;
                          equipmentType.HP += gem.生命加成 - 生命加成;
                          equipmentType.def+=gem.防御加成 - 防御加成;
                          if (gem.升级次数 >= 10) {
                          gem.type = "高级宝石";
                          e.reply("恭喜你你的宝石进化成高级宝石");
                          }
                          await Write_equipment(usr_qq, equipment);
                          return;
                          }
                          e.reply('强化失败');
                          gem.强化次数 += 1;
                          gem.失败次数 +=1
                          const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                          const enhanceMultiplier = 0.75+ Math.random() * 0.2;
                          gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                          gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                          gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                          gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                          gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                          gem.出售价 = Math.floor(gem.出售价*1.45);
                          equipmentType.atk -= 攻击加成 - gem.攻击加成;
                          equipmentType.bao -= 暴击加成 - gem.暴击加成;
                          equipmentType.HP -= 生命加成 - gem.生命加成;
                          equipmentType.def -= 防御加成 - gem.防御加成
                          await Write_equipment(usr_qq, equipment);
                          }
                          }
                           
            }else if (gem.type == "高级宝石") {
                if (random < 0.25) {
                  if (random < 0.95) {
                    e.reply("强化成功");
                    gem.强化次数 += 1;
                    gem.升级次数 += 1;
                    const enhanceMultiplier = 1.55+ Math.random() * 0.3;
                    const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                    gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                    gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                    gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                    gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                    gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                    gem.出售价 = Math.floor(gem.出售价*1.55);
                    equipmentType.atk += gem.攻击加成 - 攻击加成;
                    equipmentType.bao += gem.暴击加成 - 暴击加成;
                    equipmentType.HP += gem.生命加成 - 生命加成;
                    equipmentType.def += gem.防御加成 - 防御加成;
                    await Write_equipment(usr_qq, equipment);
                  } else if (random < 0.45) {
                    e.reply("触发双倍强化");
                    gem.强化次数 += 2;
                    gem.升级次数 += 2;
                    const enhanceMultiplier = 1.65+ Math.random() * 0.3;
                    const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                    gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                    gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                    gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                    gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                    gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                    gem.出售价 = Math.floor(gem.出售价*1.65);
                    equipmentType.atk += gem.攻击加成 - 攻击加成;
                    equipmentType.bao += gem.暴击加成 - 暴击加成;
                    equipmentType.HP += gem.生命加成 - 生命加成;
                    equipmentType.def += gem.防御加成 - 防御加成;
                    await Write_equipment(usr_qq, equipment);
                  }
                } else {
                  if (gem.失败次数 == 0) {
                    if (gem.失败次数 >= 10) {
                      e.reply("触发保底，强化成功");
                      gem.强化次数 += 1;
                      gem.升级次数 += 1;
                      const enhanceMultiplier = 1.55+ Math.random() * 0.3;
                      const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                     gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                     gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                     gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                     gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                     gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                     gem.出售价 = Math.floor(gem.出售价*1.55);
                      equipmentType.atk += gem.攻击加成 - 攻击加成;
                      equipmentType.bao += gem.暴击加成 - 暴击加成;
                      equipmentType.HP += gem.生命加成 - 生命加成;
                      equipmentType.def += gem.防御加成 - 防御加成;
                      if (gem.强化次数 >= 10){
                        gem.type = "高级宝石";
                        e.reply("恭喜你你的宝石进化成高级宝石");
                        await Write_equipment(usr_qq, equipment);
                        return;
                        }
                        await Write_equipment(usr_qq, equipment);
                        } else {
                        e.reply('强化失败');
                        gem.强化次数 += 1;
                        gem.失败次数 += 1;
                        const enhanceMultiplier = 0.75+ Math.random() * 0.2;
                        const { 攻击加成, 暴击加成, 生命加成, 防御加成, 出售价 } = gem;
                        gem.攻击加成 = Math.floor(gem.攻击加成 * enhanceMultiplier);
                        gem.暴击加成 = Math.floor(gem.暴击加成 * enhanceMultiplier);
                        gem.生命加成 = Math.floor(gem.生命加成 * enhanceMultiplier);
                        gem.防御加成 = Math.floor(gem.防御加成 * enhanceMultiplier);
                        gem.取下判断 = Math.floor(gem.取下判断 * enhanceMultiplier);
                        gem.出售价 = Math.floor(gem.出售价*0.75);
                        equipmentType.atk -= 攻击加成 - gem.攻击加成;
                        equipmentType.bao -= 暴击加成 - gem.暴击加成;
                        equipmentType.HP -= 生命加成 - gem.生命加成;
                        equipmentType.def -= 防御加成 - gem.防御加成;
                        await Write_equipment(usr_qq, equipment);
                        }
                        }
                    }
                }
                    
            }
        }
            
        
    
            
        
    


   
    async tongbuxiangqian(e){
      let usr_qq = e.user_id
      await cheakbaoshi(e,usr_qq)
      return;
   }
        


 










}
export async function cheakbaoshi(e, usr_qq) {
  let equipment = await Read_equipment(usr_qq);
  let type = ['武器', '护具', '法宝'];
  let type2 = ['宝石位1', '宝石位2', '宝石位3'];

  for (let m = 0; m < type.length; m++) {
    if (!('宝石位' in equipment[type[m]])) {
      equipment[type[m]]['宝石位'] = {
        '宝石位1': '无',
        '宝石位2': '无',
        '宝石位3': '无'
      };
    }
    
    await Write_equipment(usr_qq, equipment);
    return true;
  }

  for (let m = 0; m < type.length; m++) {
    if (equipment[type[m]]['宝石位'] !== '') {
      for (let a in type2) {
        if (equipment[type[m]]['宝石位'][type2[a]] === 0) {
          delete equipment[type[m]]['宝石位'];
          equipment[type[m]]['宝石位'] = {
            '宝石位1': '无',
            '宝石位2': '无',
            '宝石位3': '无'
          };
        }
      }
    }
    await Write_equipment(usr_qq, equipment);
    return true;
  }

  for (let a in type2) {
    for (let m = 0; m < type.length; m++) {
      if (equipment[type[m]]['宝石位'] !== '' && equipment[type[m]]['宝石位'][type2[a]] !== 0) {
        // 执行相应的逻辑
        return true;
      }
    }
  }

  return true; 
}


  
  // for (let p = 0; p < type.length; p++) {
  //   for(let m=0;m<type.length;m++){
  //     if(Object.keys(equipment[type[m]]).length!=13){
  //       equipment[type[m]]['宝石位']={
  //         "宝石位1":"无",
  //         "宝石位2":"无",
  //         "宝石位3":"无",
  //       }
  //     }else if (equipmentType.宝石位 != ''&&Object.keys(equipment[type[m]].宝石位[type2[p]]) != "无") {
  //       equipment[type[m]]['宝石位']={
  //         "宝石位1":"无",
  //         "宝石位2":"无",
  //         "宝石位3":"无",
  //       }  
  //     }
  //   } 
    //  e.reply("自动同步完毕")
    //   await Write_equipment(usr_qq, equipment);
  
          
          
          // let type=['武器','护具','法宝']

          // for(let m=0;m<type.length;m++){
          //   if(!"宝石位" in equipment[type[m]]){
          //     equipment[type[m]]['宝石位']={
          //       '宝石位1':"无",
          //       '宝石位2':'无',
          //       "宝石位3":"无"
          //     }
          //   }else{
          //     delete equipment[type[m]]['宝石位']
          //     equipment[type[m]]['宝石位']={
          //       '宝石位1':"无",
          //       '宝石位2':'无',
          //       "宝石位3":"无"
          //     }
          //   }
          // }