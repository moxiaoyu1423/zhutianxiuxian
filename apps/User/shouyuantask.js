import fs from 'fs';
import { plugin, config } from '../../api/api.js';
import { Read_player, Write_player,__PATH } from '../../model/xiuxian.js';

export class ReduceShouyuanTask extends plugin {
  constructor() {
    super({
      name: '寿元流逝定时任务',
      dsc: '每三小时减少玩家1000寿元',
      event: 'message',
      priority: 300,
      rule: [],
    });
    this.set = config.getConfig('task', 'task');
    this.task = {
      cron: "0 0 */3 * * ?", // 每三小时执行一次
      name: 'ReduceShouyuanTask',
      fnc: () => this.reduceShouyuan(),
    };
  }

  async reduceShouyuan() {
    try {
      // 获取所有玩家文件列表
      const playerDir = __PATH.player_path;
      const files = fs.readdirSync(playerDir);
      
      let count = 0;
      const startTime = Date.now();
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        try {
          const usr_qq = file.replace('.json', '');
          const player = await Read_player(usr_qq);
          
          // 跳过特殊玩家（如GM、管理员）
          if (player.名号.includes("管理员") || player.名号.includes("GM")) {
            continue;
          }
          
          // 境界越高，寿元减少越少
          let reduction = 1000;
           if (player.level_id > 50) {
            reduction = Math.floor(reduction * 0.5);
          } else if (player.level_id <=41) {
            reduction = 20;
          }
          
          // 特殊体质寿元流逝更慢
          if (player.灵根.type === "圣体道胎" || player.灵根.type === "大成圣体"|| player.灵根.type === "大成霸体") {
            reduction = Math.floor(reduction * 0.3);
          }
          // 特殊体质寿元流逝更慢
          if (player.灵根.type === "小成圣体" ||player.灵根.type === "小成霸体" || player.灵根.type === "大道体") {
            reduction = Math.floor(reduction * 0.5);
          }
          // 特殊体质寿元流逝更慢
          if (player.灵根.type === "圣体" ) {
            reduction = Math.floor(reduction * 0.7);
          }
           // 特殊体质寿元流逝更慢
          if (player.灵根.type === "神体"||player.灵根.type === "神王体"|| player.灵根.type === "转生"||player.灵根.type === "魔头"||player.灵根.type === "魔女" || player.灵根.type === "魔法少女"|| player.灵根.type === "魔卡少女") {
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
      console.log(`[寿元流逝] 已完成 ${count} 名玩家的寿元减少，耗时 ${duration.toFixed(2)} 秒`);
    } catch (err) {
      console.error('寿元流逝任务执行失败:', err);
    }
    return true;
  }
}