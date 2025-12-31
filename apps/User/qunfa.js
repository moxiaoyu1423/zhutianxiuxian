import { plugin, verc, data, config } from '../../api/api.js';
import fs from 'fs';
import path from 'path';
import {
  Read_player,
  existplayer,
  Add_najie_thing,
  exist_najie_thing
} from '../../model/xiuxian.js';
import { channel } from '../../model/xiuxian.js';

export class qunfa extends plugin {
  constructor() {
    super({
      name: 'qunfa',
      dsc: '修仙全服公告模块',
      event: 'message',
      rule: [
        {
          reg: '^#全服公告',
          fnc: 'globalAnnouncement',
        },
        {
          reg: '^#设置公告群\\s*(\\d+)$',
          fnc: 'addAnnounceGroup',
        },
        {
          reg: '^#移除公告群\\s*(\\d+)$',
          fnc: 'removeAnnounceGroup',
        },
        {
          reg: '^#查看公告群$',
          fnc: 'listAnnounceGroups',
        }
      ],
    });
    
    // 公告群组配置
    this.announceGroups = [1056477978, 955798247]; // 默认群组
    this.loadAnnounceGroups();
  }

  // 加载公告群组配置
  loadAnnounceGroups() {
    try {
      const configPath = './config/announceGroups.json';
      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf8');
        this.announceGroups = JSON.parse(data);
      }
    } catch (err) {
      console.error('加载公告群组配置失败:', err);
      this.announceGroups = [1056477978, 955798247]; // 默认值
    }
  }

  // 保存公告群组配置
  saveAnnounceGroups() {
    try {
      const configPath = './config/announceGroups.json';
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(this.announceGroups, null, 2));
    } catch (err) {
      console.error('保存公告群组配置失败:', err);
    }
  }

  // 消息内容安全过滤
  filterMessageContent(message) {
    const white_type = ["text", "image", "face"];
    return message.filter(v => white_type.includes(v.type));
  }

  // 全服公告功能（无需管理员权限）
async globalAnnouncement(e) {
    if (!verc({ e })) return false;
    
    let usr_qq = await channel(e.user_id);
    if (!await existplayer(usr_qq)) return false;

    // 清洗消息内容
    let white_type = ["text", "image", "face"];
    let msg = e.message.filter(v => white_type.includes(v.type));
    
    // 移除指令关键词
    let one_text = msg.find(v => v.type == "text");
    if (one_text) {
        one_text.text = one_text.text.replace("#全服公告", "");
    }
    
    // 转换图片格式（使用正确的方法）
    msg = msg.map(v => {
        if (v.type == "image") {
            return segment.image(v.url);  // 正确的方式
        }
        return v;  // 文本和表情直接返回
    });

    // 检查喇叭道具
    let hornCount = await exist_najie_thing(usr_qq, "喇叭", "道具");
    if (!hornCount || hornCount <= 0) {
        return e.reply('发送全服公告需要【喇叭】道具，你当前没有喇叭');
    }

    // 构建公告消息（不要使用 segment.text）
    let player = await Read_player(usr_qq);
    let announcementMsg = [
        `【${player.名号}】${player.id}发送了全服公告：\n`,
        ...msg
    ];

    // 扣除喇叭
    await Add_najie_thing(usr_qq, "喇叭", "道具", -1);

    // 发送到所有公告群组
    let successCount = 0;
    for (const groupId of this.announceGroups) {
        try {
            await Bot.pickGroup(Number(groupId)).sendMsg(announcementMsg);
            successCount++;
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
            console.error(`发送失败: ${groupId}`, err);
        }
    }

    e.reply(`全服公告发送完成，成功发送到 ${successCount} 个群组`);
    return true;
}

  // 添加公告群组（保留管理员权限）
  async addAnnounceGroup(e) {
            // 修改权限检查：不是主人也不是修仙管理员则返回
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    
    const groupId = e.msg.replace('#设置公告群', '').trim();
    
    if (!groupId || !/^\d+$/.test(groupId)) {
      return e.reply('格式错误：#设置公告群 群号');
    }
    
    const numGroupId = Number(groupId);
    
    if (this.announceGroups.includes(numGroupId)) {
      return e.reply(`群组 ${groupId} 已在公告列表中`);
    }
    
    this.announceGroups.push(numGroupId);
    this.saveAnnounceGroups();
    
    e.reply(`已设置群组 ${groupId} 到公告列表\n当前公告群数: ${this.announceGroups.length}`);
    return true;
  }

  // 移除公告群组（保留管理员权限）
  async removeAnnounceGroup(e) {
            // 修改权限检查：不是主人也不是修仙管理员则返回
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
        return false;
    }
    const groupId = e.msg.replace('#移除公告群', '').trim();
    
    if (!groupId || !/^\d+$/.test(groupId)) {
      return e.reply('格式错误：#移除公告群 群号');
    }
    
    const index = this.announceGroups.indexOf(Number(groupId));
    
    if (index === -1) {
      return e.reply(`群组 ${groupId} 不在公告列表中`);
    }
    
    this.announceGroups.splice(index, 1);
    this.saveAnnounceGroups();
    
    e.reply(`已从公告列表移除群组 ${groupId}\n剩余公告群数: ${this.announceGroups.length}`);
    return true;
  }

  // 查看公告群组（所有人可查看）
  async listAnnounceGroups(e) {
    if (this.announceGroups.length === 0) {
      return e.reply('当前未设置任何公告群组');
    }
    
    const groupList = this.announceGroups.map((id, index) => 
      `${index + 1}. ${id}`
    ).join('\n');
    
    e.reply([
      '当前公告群组列表:',
      groupList,
      `共计: ${this.announceGroups.length} 个群组`
    ].join('\n'));
    
    return true;
  }
}