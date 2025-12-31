import fs from 'fs';
import { plugin } from '../../api/api.js';
import { Read_player, Write_player, __PATH } from '../../model/xiuxian.js';


export class ManualShouyuanTask extends plugin {
  constructor() {
    super({
      name: '手动寿元流逝',
      dsc: '主人手动执行寿元流逝任务',
      event: 'message',
      priority: 300,
      rule: [
        {
          reg: '^#执行寿元流逝$',
          fnc: 'manualReduceShouyuan',
        },
        {
          reg: '^#执行寿元流逝(\\d+)$',
          fnc: 'manualReduceShouyuanWithAmount',
        }
      ],
    });
  }

  async manualReduceShouyuan(e) {
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
      e.reply('只有主人可以执行此操作');
      return false;
    }
    
    await e.reply('开始执行寿元流逝...');
    const result = await this.reduceShouyuan(1000); // 默认减少200寿元
    e.reply(result);
    return true;
  }

  async manualReduceShouyuanWithAmount(e) {
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
      e.reply('只有主人可以执行此操作');
      return false;
    }
    
    const amount = parseInt(e.msg.match(/#执行寿元流逝(\d+)/)[1]);
    if (isNaN(amount) || amount <= 0) {
      e.reply('请输入有效的寿元数量，如：#执行寿元流逝500');
      return false;
    }
    
    await e.reply(`开始执行寿元流逝，将减少${amount}点寿元...`);
    const result = await this.reduceShouyuan(amount);
    e.reply(result);
    return true;
  }

  async reduceShouyuan(amount) {
    try {
      const playerDir = __PATH.player_path;
      const files = fs.readdirSync(playerDir);
      
      let count = 0;
      let gmCount = 0;
      let highLevelCount = 0;
      let specialBodyCount = 0;
      let sealedCount = 0; // 新增：被禁仙六封封印的玩家数量
      const startTime = Date.now();
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        try {
          const usr_qq = file.replace('.json', '');
          const player = await Read_player(usr_qq);
          
          // 跳过特殊玩家
          if (player.名号.includes("管理员") || player.名号.includes("GM")) {
            gmCount++;
            continue;
          }
          
          // === 新增：检查是否被禁仙六封封印 ===
          const actionKey = `xiuxian:player:${usr_qq}:action`;
          const actionData = await redis.get(actionKey);
          
          if (actionData) {
            const actionObj = JSON.parse(actionData);
            if (actionObj.action === '神源封印') {
                sealedCount++;
                continue; // 跳过被封印的玩家
            }
          }
          
          // 计算实际减少量
          let reduction = amount;
          
          // 境界越高，寿元减少越少
          if (player.level_id > 50) {
            reduction = Math.floor(amount * 0.5);
            highLevelCount++;
          } else if (player.level_id <=41) {
            reduction = 100;
          }
          
          // 特殊体质寿元流逝更慢
          if (player.灵根.type === "圆环之理" ) {
            reduction = Math.floor(reduction * 0.1);
            specialBodyCount++;
          }
          // 特殊体质寿元流逝更慢
          if (player.灵根.type === "圣体道胎" || player.灵根.type === "大成圣体"|| player.灵根.type === "混沌体") {
            reduction = Math.floor(reduction * 0.5);
            specialBodyCount++;
          }
           // 特殊体质寿元流逝更慢
          if (player.灵根.type === "小成圣体" || player.灵根.type === "大道体") {
            reduction = Math.floor(reduction * 0.6);
          }
          // 特殊体质寿元流逝更慢
          if (player.灵根.type === "圣体" ) {
            reduction = Math.floor(reduction * 0.7);
          }
           // 特殊体质寿元流逝更慢
          if (player.灵根.type === "神体"|| player.灵根.type === "转生"||player.灵根.type === "魔头"||player.灵根.type === "魔女" || player.灵根.type === "魔法少女"|| player.灵根.type === "魔卡少女") {
            reduction = Math.floor(reduction * 0.8);
          }
          
          // 确保寿元不为负
          player.寿元 = Math.max(0, player.寿元 - reduction);
          
          await Write_player(usr_qq, player);
          count++;
          
          // 每处理100个玩家休息一下，避免阻塞
          if (count % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (err) {
          console.error(`处理玩家 ${file} 时出错:`, err);
        }
      }
      
      const duration = (Date.now() - startTime) / 1000;
      return [
        `寿元流逝执行完成！`,
        `处理玩家总数: ${count}`,
        `跳过管理员/GM: ${gmCount}`,
        `跳过禁仙六封玩家: ${sealedCount}`, // 新增：显示跳过的封印玩家
        `未登仙修士(固定): 100`,
        `高阶修士(减免): ${highLevelCount}`,
        `特殊体质(减免): ${specialBodyCount}`,
        `耗时: ${duration.toFixed(2)}秒`,
        `所有玩家寿元已减少${amount}点（已根据境界和体质减免）`
      ].join("\n");
    } catch (err) {
      console.error('手动寿元流逝执行失败:', err);
      return `寿元流逝执行失败: ${err.message}`;
    }
  }
}