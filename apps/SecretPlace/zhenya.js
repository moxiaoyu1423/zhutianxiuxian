import { plugin, common, data } from '../../api/api.js';
import fs from 'fs';
import {
  Read_player,
  isNotNull,
  Add_najie_thing,
  Add_修为,
  Add_血气,
  Add_HP,
  Write_player,
  Read_equipment,
  Add_寿元,
  Read_danyao,
  Write_danyao,
  bigNumberTransform,
  zd_battle,
  get_log_img,
  Read_najie,
  exist_najie_thing
} from '../../model/xiuxian.js';
import { AppName } from '../../app.config.js';

export class DarkSuppressionTask extends plugin {
  constructor() {
    super({
      name: '黑暗镇压定时任务',
      dsc: '处理被黑暗准仙帝镇压的玩家',
      event: 'message',
      priority: 1000,
      rule: [],
    });
    
    // 调整为每10分钟执行一次（注意cron表达式格式）
    this.task = {
      cron: '0 */10 * * * *', // 每10分钟的第0秒执行
      name: 'DarkSuppressionTask',
      fnc: () => this.checkSuppressedPlayers(),
    };
    
    // 镇压持续时间（毫秒）
    this.SUPPRESSION_DURATION = 60 * 60 * 1000; // 60分钟
  }

  async checkSuppressedPlayers() {
    const now = Date.now();
    console.log(`[${new Date().toISOString()}] 执行镇压检查任务`);
    
    // 获取所有被镇压的玩家
    const suppressedPlayers = await redis.keys('xiuxian:dark_suppression:*');
    
    if (suppressedPlayers.length === 0) {
      console.log('当前没有玩家被镇压');
      return;
    }
    
    console.log(`发现${suppressedPlayers.length}个被镇压玩家`);
    
    for (const key of suppressedPlayers) {
      const playerId = key.replace('xiuxian:dark_suppression:', '');
      
      try {
        // 获取镇压结束时间
        const endTime = await redis.get(`xiuxian:player:${playerId}:suppression_end`);
        
        if (!endTime) {
          console.warn(`玩家${playerId}无镇压结束时间，已自动解除`);
          await this.cleanupSuppression(playerId);
          continue;
        }
        
        const remainingTime = parseInt(endTime) - now;
        
        if (remainingTime <= 0) {
          // 镇压时间到，解除镇压
          console.log(`解除玩家${playerId}的镇压状态`);
          await this.releaseSuppression(playerId);
        } else {
          console.log(`玩家${playerId}还需镇压${Math.ceil(remainingTime/60000)}分钟`);
          
          // 每10分钟发送一次镇压剩余时间提醒（仅剩30分钟和10分钟时）
          const remainingMinutes = Math.floor(remainingTime / 60000);
          if (remainingMinutes === 30 || remainingMinutes === 10) {
            await this.sendSuppressionReminder(playerId, remainingMinutes);
          }
        }
      } catch (err) {
        console.error(`处理玩家${playerId}镇压状态失败:`, err);
      }
    }
  }

  async sendSuppressionReminder(playerId, remainingMinutes) {
    try {
      const suppressionData = await redis.get(`xiuxian:player:${playerId}:suppression_data`);
      if (!suppressionData) return;
      
      const { group_id } = JSON.parse(suppressionData);
      const msg = [
        `【黑暗镇压剩余时间】`,
        `你的元神仍在被黑暗准仙帝炼化中！`,
        `剩余镇压时间: ${remainingMinutes}分钟`,
        `解除后你的境界将跌落一层！`,
      ].join('\n');
      
      if (group_id) {
        await Bot.pickGroup(group_id).sendMsg([
          segment.at(playerId),
          msg
        ]);
      } else {
        await common.relpyPrivate(playerId, msg);
      }
    } catch (err) {
      console.error('发送镇压提醒失败:', err);
    }
  }

  async releaseSuppression(playerId) {
    try {
      const player = await Read_player(playerId);
      const suppressionData = await redis.get(`xiuxian:player:${playerId}:suppression_data`);
      const { group_id } = JSON.parse(suppressionData || '{}');
      
      // 境界跌落一层（至少保留1层）
      const originalLevel = player.mijinglevel_id;
      player.mijinglevel_id = Math.max(1, originalLevel - 1);
      
      // 保存玩家数据
      await Write_player(playerId, player);
      
      // 构建解除消息
      const msg = [
        `【镇压解除·道果受损】`,
        `黑暗准仙帝的镇压已解除！`,
        `你的道果被炼化部分，境界跌落一层！`,
        `境界变化: ${originalLevel} → ${player.mijinglevel_id}`,
        `建议立即调息恢复，稳固道基！`
      ].join('\n');
      
      // 发送通知
      if (group_id) {
        await Bot.pickGroup(group_id).sendMsg([
          segment.at(playerId),
          msg
        ]);
      } else {
        await common.relpyPrivate(playerId, msg);
      }
      
    } catch (err) {
      console.error('解除镇压失败:', err);
    } finally {
      await this.cleanupSuppression(playerId);
    }
  }

  async cleanupSuppression(playerId) {
    // 清理所有镇压相关键
    await redis.del(`xiuxian:dark_suppression:${playerId}`);
    await redis.del(`xiuxian:player:${playerId}:suppression_end`);
    await redis.del(`xiuxian:player:${playerId}:suppression_data`);
    await redis.del(`xiuxian:player:${playerId}:action`);
  }
}