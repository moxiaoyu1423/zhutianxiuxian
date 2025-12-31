import plugin from '../../../../lib/plugins/plugin.js';
import common from '../../../../lib/common/common.js';
import config from '../../model/Config.js';
import {
  Add_najie_thing,
  Add_灵石,
  Add_源石,
  isNotNull,
  Read_player,
  sleep,
} from '../../model/xiuxian.js';
import { openAU } from '../Auction/Auction2.js';
import data from '../../model/XiuxianData.js';

/**
 * 定时任务 - 拍卖系统（含NPC竞价功能）
 */
export class AuctionofficialTask2 extends plugin {
  constructor() {
    super({
      name: 'AuctionofficialTask2',
      dsc: '定时任务',
      event: 'message',
      priority: 300,
      rule: [],
    });
    this.set = config.getConfig('xiuxian', 'xiuxian');
    this.task = {
      cron: this.set.Auction2.Auction_task,
      name: 'AuctionofficialTask2',
      fnc: () => this.AuctionofficialTask2(),
    };
    
    // NPC类型配置
    this.npcTypes = [
      { type: "谨慎", minBid: 1.05, maxBid: 1.15, probability: 0.4 },
      { type: "激进", minBid: 1.15, maxBid: 1.35, probability: 0.3 },
      { type: "豪爽", minBid: 1.25, maxBid: 1.5, probability: 0.2 },
      { type: "神秘", minBid: 1.1, maxBid: 1.8, probability: 0.1 }
    ];
    
    // NPC名称池
    this.npcNames = [
      "隐世高人", "仙门长老", "世家公子", "妖族大能", 
      "魔道巨擘", "佛门高僧", "散修大能", "商会代表"
    ];
    
    // NPC评论
    this.npcComments = {
      "谨慎": ["此物虽好，但价格已高", "再加一次，若不成便放弃"],
      "激进": ["此物我志在必得！", "再加！我看谁还敢争"],
      "豪爽": ["这点源石不算什么", "宝物有缘者得之"],
      "神秘": ["......", "此物与我有缘"]
    };
  }
  
  async AuctionofficialTask2() {
    // 判断是否已经在拍卖中
    const wupinStr = await redis.get('xiuxian:AuctionofficialTask2');
    console.log("拍卖定时" + wupinStr);
    
    // 如果不在拍卖中
    if (!wupinStr) {
      // 判断是否在开启时间
      const nowDate = new Date();
      const todayDate = new Date(nowDate);
      const { openHour, closeHour } = this.set.Auction2;
      const todayTime = todayDate.setHours(0, 0, 0, 0);
      const openTime = todayTime + openHour * 60 * 60 * 1000;
      const nowTime = nowDate.getTime();
      const closeTime = todayTime + closeHour * 60 * 60 * 1000;
      if (nowTime < openTime || nowTime > closeTime) return;

      // 在开启时间且未开启拍卖则开启拍卖
      const auction = await openAU();
      let msg = `___[星阁内场]___\n目前正在拍卖【${auction.thing.name}x${auction.amount}】\n`;
      if (auction.last_offer_player === 0) {
        msg += '暂无人出价';
      } else {
        const player = await Read_player(auction.last_offer_player);
        msg += `最高出价是${player.名号}叫出的${auction.last_price}`;
      }
      auction.groupList.forEach(group_id => this.pushInfo(group_id, true, msg));
      return;
    }

    // 如果已在拍卖中
    const wupin = JSON.parse(wupinStr);
    let msg = '';
    const group_ids = wupin.groupList;
    const last_offer_price = wupin.last_offer_price;
    const interMinu = this.set.Auction2.interval;
    const nowTime = new Date().getTime();
    
    // 计算距离下次结束的时间
    let timeToEnd = wupin.last_offer_price + interMinu * 60 * 1000 - nowTime;
    
    // 添加NPC竞价事件
    if (timeToEnd > 0) {
      // 竞价超时一半时增加NPC竞价概率
      let npcBidProbability = 0.3;

      
      const shouldNpcBid = Math.random() < npcBidProbability;
      
      // 确保不是NPC自己在竞价，且有人出过价
      if (shouldNpcBid && wupin.last_offer_player > 0) {
        const npcBidResult = await this.npcBid(wupin);
        
        msg = npcBidResult.message;
        
        // 更新拍卖状态
        wupin.last_price = npcBidResult.newPrice;
        wupin.last_offer_player = -1; // 使用负数表示NPC出价
        wupin.last_offer_price = nowTime;
        
        // 保存更新后的拍卖状态
        await redis.set('xiuxian:AuctionofficialTask2', JSON.stringify(wupin));
        
        // 通知所有群组
        for (const group_id of group_ids) {
          this.pushInfo(group_id, true, msg);
        }
        
        // 添加延迟，模拟NPC思考时间
        await sleep(2000 + Math.random() * 3000);
        
        // 更新距离结束时间
        timeToEnd = wupin.last_offer_price + interMinu * 60 * 1000 - nowTime;
      }
    }

    // 检查拍卖是否结束
    if (timeToEnd > 0) {
      const m = Math.floor(timeToEnd / 1000 / 60);
      const s = Math.floor((timeToEnd / 1000) % 60);
      
      msg = `星阁内场限定物品【${wupin.thing.name}】x${wupin.amount}拍卖中\n`;
      msg += `距离拍卖结束还有${m}分${s}秒\n`;
      msg += `目前最高价：${wupin.last_price}源石`;
      
      // 添加当前最高出价者信息
      if (wupin.last_offer_player > 0) {
        const player = await Read_player(wupin.last_offer_player);
        msg += `（由${player.名号}出价）`;
      } else if (wupin.last_offer_player < 0) {
        msg += `（由神秘NPC出价）`;
      }

      for (const group_id of group_ids) {
        this.pushInfo(group_id, true, msg);
      }
    } else {
      const last_offer_player = wupin.last_offer_player;
      if (last_offer_player === 0) {
        msg = `流拍，${wupin.thing.name}x${wupin.amount}已退回神秘人的纳戒`;
      } else if (last_offer_player < 0) {
        msg = `拍卖结束，神秘NPC以${wupin.last_price}源石拍得【${wupin.thing.name}】x${wupin.amount}！`;
      } else {
        await Add_源石(last_offer_player, -wupin.last_price);
        await Add_najie_thing(
          last_offer_player,
          wupin.thing.name,
          wupin.thing.class,
          wupin.amount,
          wupin.thing.pinji
        );
        
        const player = await Read_player(last_offer_player);
        msg = `拍卖结束，${player.名号}最终以${wupin.last_price}源石拍得【${wupin.thing.name}】x${wupin.amount}！`;
      }

      for (const group_id of group_ids) {
        this.pushInfo(group_id, true, msg);
      }
      await redis.del('xiuxian:AuctionofficialTask2');
    }
  }
  
  /**
   * NPC竞价逻辑
   * @param {Object} auction 拍卖对象
   * @returns {Object} 竞价结果 {message: string, newPrice: number}
   */
  async npcBid(auction) {
    // 随机选择NPC
    const npcName = this.npcNames[Math.floor(Math.random() * this.npcNames.length)];
    const npcType = this.selectNpcType();
    
    // 计算加价幅度
    const bidIncrease = npcType.minBid + Math.random() * (npcType.maxBid - npcType.minBid);
    const newPrice = Math.ceil(auction.last_price * bidIncrease);
    
    // 构建消息
    let msg = `【NPC竞价】${npcName}出价${newPrice}源石竞拍【${auction.thing.name}】x${auction.amount}！`;
    
    // 添加NPC评论
    if (Math.random() < 0.5) { // 50%概率添加评论
      const typeComments = this.npcComments[npcType.type];
      const comment = typeComments[Math.floor(Math.random() * typeComments.length)];
      msg += `\n${npcName}低语："${comment}"`;
    }
    
    return {
      message: msg,
      newPrice: newPrice
    };
  }
  
  /**
   * 选择NPC类型
   * @returns {Object} NPC类型对象
   */
  selectNpcType() {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const type of this.npcTypes) {
      cumulative += type.probability;
      if (rand <= cumulative) {
        return type;
      }
    }
    
    return this.npcTypes[0]; // 默认返回第一个类型
  }

  /**
   * 推送消息，群消息推送群，或者推送私人
   * @param {number} id 群号或QQ号
   * @param {boolean} is_group 是否为群消息
   * @param {string} msg 消息内容
   * @returns {Promise<void>}
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