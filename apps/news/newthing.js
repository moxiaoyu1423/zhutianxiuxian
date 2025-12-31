
import {  puppeteer, verc, Show, plugin, config } from '../../api/api.js';
import {
  Read_player,
  Write_player,
  __PATH,
  existplayer,
  channel
} from '../../model/xiuxian.js';
import{
    readall,
    dataall,
} from '../../model/duanzaofu.js';


export class newthing extends plugin {
  constructor() {
    super({
      name: 'newthing',
      dsc: '交易模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#江湖传闻',
          fnc: 'newsThing',
        },


      ],
    });
}

async newsThing(e) {

        try{
          const allThing=await readall('传闻系统')
          let TIME=Date.now()
          let a=[]
          let B=0
          for(let item of allThing){
            let yes=1
            for(let and of a){
              
              if((and.name==item.name)&&(and.uid==item.uid)){
                yes=0
              }
            }
            if(((TIME-item.Time)<1000*60*60*12)&&(yes==1)){
                a.push(item)
            }
          }
 
          console.log(a);
          let reply=''
          if(a.length==B){
           e.reply(`近期无传闻`)
            return 
          }
          let newimg=[]
          for(let news of a){

            let player=await Read_player(news.uid);
           let newtome=Math.floor((TIME-news.Time)/1000/60/60)
            let time1=Math.floor(newtome%24)
            let time2= Math.floor(((TIME-news.Time)/1000/60)%60)
            let zongmen=''
          try{
              zongmen=player.宗门.宗门名称
          }
           catch{
             zongmen='(无门无派)'
           }
           let pinji=''
           if(news.稀有度==1){
              pinji='仙品'
           }else if(news.稀有度==2){
              pinji='圣品'
           }else if(news.稀有度==3){
            pinji='古品'
           }else if(news.稀有度==4){
            pinji='孤品'
           }else{
            pinji='垃圾'
           }
            let new1={
                   名号: player.名号+'('+zongmen+')',
                   TIME:`${time1}时,${time2}分`,
                   物品:news.name+'('+pinji+')',
                   数量:news.num,
            }
            newimg.unshift(new1)
        }
        await dataall(a,'传闻系统')
            let img=await  get_chuanwen_img(e,newimg)
          
        
          e.reply(img);
    
    
          return 
        }
        catch{
         await dataall([],'传闻系统')
          e.reply('近期无传闻')
          return
        }
    }
}
async function get_chuanwen_img(e, a) {
    const data1 = await new Show(e).get_chuanwen({a});
    let img = await puppeteer.screenshot('chuanwen', {
      ...data1,
    });
    return img;

  
}

function generateCodes(numOfCodes) {
  const codes = [];
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while (codes.length < numOfCodes) {
    let code = "A";
    for (let i = 0; i < 24; i++) {
      let randomIndex = Math.floor(Math.random() * chars.length);
      let char = chars.charAt(randomIndex);
      code += char;
    }
    codes.push(code);
  }

  // Fisher-Yates随机置乱算法
  for (let i = codes.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [codes[i], codes[j]] = [codes[j], codes[i]];
  }

  return codes;
}
