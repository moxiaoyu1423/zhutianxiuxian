import { plugin, config ,data} from '../../api/api.js';
import { existplayer, Read_player, Write_player, Add_najie_thing,ForwardMsg, channel ,calculateHarm, ensureNumber, bigNumberTransform, exist_najie_thing} from '../../model/xiuxian.js';
import { segment } from "icqq"
import {
 checkEmperorAwareness,
 clearEmperorAwareness,
 setEmperorAwareness,
} from '../tasks/EraChangeTask.js';
export class tuanben extends plugin {
  constructor() {
    super({
      name: '团本战斗系统',
      dsc: '基于Redis持久化的修仙团本战斗模块',
      event: 'message',
      priority: 600,
      rule: [
          {
          reg: '^#组队迎战帝尊$',
          fnc: 'createEmperorTeam',
        },
        {
          reg: '^#加入迎战帝尊\\s*(.*)$',
          fnc: 'joinEmperorTeam',
        },
        {
          reg: '^#迎战帝尊$',
          fnc: 'startEmperorBattle',
        },
        {
          reg: '^#创建讨伐队伍\\s*(.*)$',
          fnc: 'createBossTeam',
        },
         {
          reg: '^#关闭所有讨伐$',
          fnc: 'shutdownAllBattles',
          permission: 'master' // 仅管理员可用
        },
   {
      reg: '^#加入讨伐队伍\\s*(.*)$',   // 修改后的正则
      fnc: 'joinBossTeam',
    },
        {
          reg: '^#发起讨伐$',
          fnc: 'startBossBattle',
        },
        {
          reg: '^#查看队伍信息$',
          fnc: 'getTeamInfo',
        },
        {
          reg: '^#解散队伍$',
          fnc: 'disbandTeam',
        },
                {
          reg: '^#重置所有讨伐CD$',
          fnc: 'resetAllPlayerCD',
          permission: 'master' // 仅管理员可用
        },
  {
          reg: '^#关闭团本系统$',
          fnc: 'disableTuanbenSystem',
          permission: 'master'
        },
        {
          reg: '^#开启团本系统$',
          fnc: 'enableTuanbenSystem',
          permission: 'master'
        },
          {
    reg: '^#结算团本奖励$',
    fnc: 'settleTeamRewards'
  },
{
  reg: /^#?结算魔君奖励\*(\d+)$/,
  fnc: 'batchSettleDevilMonarch'
},
        {
          reg: '^#离开队伍$',
          fnc: 'leaveTeam',
        }
      ],
    }
  );
    
    // Redis键配置
    this.redisKeys = {
      team: (id) => `Xiuxian:Battle:Team:${id}`,
      player: (id) => `Xiuxian:Battle:Player:${id}`,
      boss: (name) => `Xiuxian:Battle:Boss:${name}`
    };
    
    // 过期时间配置（秒）
    this.expire = {
      team: 86400,    // 队伍数据24小时
      player: 86400,  // 玩家关联24小时
      boss: 3600      // BOSS缓存1小时
    };
       // 初始化今日日期
    this.today = this.getTodayString();
      // ==== 新增系统状态管理 ====
    this.systemStatusKey = 'Xiuxian:Tuanben:System:Status';
    this.CD_DURATION = 16 * 3600 * 1000; // 12小时CD（毫秒）
    // 初始化系统状态
    this.initSystemStatus();
    // 初始化定时清理
    this.initCleanJob();
  }
 
  // 获取今日日期字符串（YYYYMMDD）
  getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
  
  // 检查是否需要更新日期
  checkDateUpdate() {
    const newToday = this.getTodayString();
    if (newToday !== this.today) {
      this.today = newToday;
      return true;
    }
    return false;
  }
  // 初始化系统状态
  async initSystemStatus() {
    const status = await redis.get(this.systemStatusKey);
    if (status === null) {
      // 默认开启
      await redis.set(this.systemStatusKey, 'enabled');
    }
  }
  
  // 关闭团本系统
  async disableTuanbenSystem(e) {
    await redis.set(this.systemStatusKey, 'disabled');
    e.reply('团本系统已关闭！所有玩家将无法进行团本相关操作');
    return true;
  }
  
  // 开启团本系统
  async enableTuanbenSystem(e) {
    await redis.set(this.systemStatusKey, 'enabled');
    e.reply('团本系统已开启！玩家可以正常进行团本活动');
    return true;
  }
  
  // 检查系统状态
  async isSystemEnabled() {
    const status = await redis.get(this.systemStatusKey);
    return status === 'enabled';
  }
  
  // 在团本操作前添加系统状态检查
  async checkSystemStatus(e) {
    if (!await this.isSystemEnabled()) {
      e.reply('团本系统当前已关闭，无法进行此操作');
      return false;
    }
    return true;
  }
  /*========== 修改CD方法 ==========*/
  
// 修改setPlayerCD方法
async setPlayerCD(userId) {
  const cdKey = `Xiuxian:Battle:PlayerCD:${userId}`;
  // 存储当前时间戳，过期时间设为13小时（确保覆盖12小时）
  await redis.set(cdKey, Date.now(), 'EX', 17 * 3600);
}
  
// 修改checkPlayerCD方法
async checkPlayerCD(userId) {
  const cdKey = `Xiuxian:Battle:PlayerCD:${userId}`;
  const cdTimestamp = await redis.get(cdKey);
  
  if (!cdTimestamp) return false; // 无CD
  
  const cdTime = parseInt(cdTimestamp);
  const now = Date.now();
  
  // 检查是否在12小时CD内
  return (now - cdTime) < this.CD_DURATION;
}
  
  /*========== 修改定时任务 ==========*/
  
  initCleanJob() {
    // 每小时清理一次过期数据
    setInterval(async () => {
      try {
        // 检查日期更新
        if (this.checkDateUpdate()) {
          console.log(`[系统] 日期已更新至 ${this.today}`);
        }
        
        // ...其他清理逻辑...
      } catch (err) {
        console.error('定时清理任务出错:', err);
      }
    }, 3600000); // 每小时执行一次
    
    // 添加午夜检查任务（确保每日重置）
    schedule.scheduleJob('0 0 * * *', () => {
      if (this.checkDateUpdate()) {
        console.log(`[系统] 日期已更新至 ${this.today}（午夜检查）`);
      }
    });
  }
async resetAllPlayerCD(e) {
  // 如果是第一次发送指令，要求确认

  
  // 重置确认状态
  this.confirmResetCD = false;
  
  // 获取所有玩家CD键
  const cdKeys = await redis.keys('Xiuxian:Battle:PlayerCD:*');
  
  if (cdKeys.length === 0) {
    return e.reply('当前没有玩家CD记录');
  }
  
  // 删除所有CD键
  await Promise.all(cdKeys.map(key => redis.del(key)));
  
  // 记录操作日志
  console.log(`[ADMIN] ${e.user_id} 重置了所有玩家讨伐CD，共清理 ${cdKeys.length} 条记录`);
  
  // 构建回复消息
  const message = [
    `⚔️ 讨伐CD已重置 ⚔️`,
    `已清理 ${cdKeys.length} 个玩家的讨伐CD`,
    `所有玩家现在可以重新参与讨伐`
  ].join('\n');
  
  return e.reply(message);
}
 // 创建帝尊挑战队伍
async createEmperorTeam(e) {
  const usr_qq = await this.getUserId(e);
   let player = await Read_player(usr_qq);
  // 检查帝尊感知标记 - 修正：添加括号调用函数
  const isEmperorAware = await checkEmperorAwareness();
  
  if (!isEmperorAware) {
    return e.reply([
      `帝尊尚未察觉此世变数！`,
      `「时间长河上游，帝尊仍在沉睡...」`,
      `「此世尚无值得他关注的存在！」`,
      `当有高境界修士出现时，帝尊会苏醒并感知到此世变数`,
      `届时方可挑战帝尊！`
    ].join('\n'));
  }
  
  // 检查是否已在队伍中
  if (await this.getPlayerTeamId(usr_qq)) {
    return e.reply('您已在其他队伍中');
  }
  
  // 创建队伍
  const teamId = this.generateTeamId();
  const newTeam = {
    id: teamId,
    boss: '帝尊',
    leader: usr_qq,
    members: [usr_qq],
    status: 'recruiting',
    createTime: Date.now(),
    battleLog: [],
    isEmperorChallenge: true // 标记为帝尊挑战
  };
  
  await this.saveTeam(teamId, newTeam);
  await this.linkPlayer(usr_qq, teamId);
  
 e.reply([
    `🌠【帝尊讨伐令·诸天震动】🌠`,
    `「${player.名号}」仰天长啸，声震九霄！`,
    `一道金光冲天而起，贯穿时间长河，直指帝尊所在！`,
    `成功创建【帝尊讨伐】队伍！`,
    `队伍ID: ${teamId}`,
    `当前成员: 1/5人`,
    `队长: ${player.名号}`,
    ``,
    `招募指令: #加入迎战帝尊 ${teamId}`,
    ``,
    `挑战须知:`,
    `• 此战只为证道,不计奖励,不占CD`,
    `• 帝尊实力滔天，九死一生！`,
    `• 胜则名垂青史，败则身死道消！`,
    ``,
    `「今日，吾等当逆天伐帝，证我辈修士不屈之志！」`
  ].join('\n'));
  return true;
}
  
  // 加入帝尊挑战队伍
  async joinEmperorTeam(e) {
    const usr_qq = await this.getUserId(e);
    
    // 检查是否已在队伍中
    const existingTeamId = await this.getPlayerTeamId(usr_qq);
    if (existingTeamId) {
      return e.reply('您已在其他队伍中');
    }
    
    // 获取队伍ID
    const match = e.msg.match(/#加入迎战帝尊\s*([^\s]+)/);
    if (!match || !match[1]) {
      return e.reply('请输入有效的队伍ID，格式: #加入迎战帝尊 [队伍ID]');
    }
    
    const teamId = match[1].trim();
    
    // 获取队伍数据
    const team = await this.getTeam(teamId);
    if (!team) return e.reply(`队伍 ${teamId} 不存在或已解散`);
    
    // 检查是否是帝尊挑战
    if (!team.isEmperorChallenge) {
      return e.reply('此队伍不是帝尊挑战队伍');
    }
    
    // 检查状态
    if (team.status !== 'recruiting') {
      return e.reply([
        `队伍 ${teamId} 当前无法加入`,
        `状态: ${this.getStatusText(team.status)}`,
        team.status === 'full' ? '队伍已满员' : '队伍正在战斗中'
      ].join('\n'));
    }
    
    // 检查人数
    if (team.members.length >= 5) {
      await this.updateTeamStatus(teamId, 'full');
      return e.reply('队伍已满员');
    }
    
    // 加入队伍
    team.members.push(usr_qq);
    
    // 更新队伍状态
    if (team.members.length >= 5) {
      team.status = 'full';
    }
    
    await this.saveTeam(teamId, team);
    await this.linkPlayer(usr_qq, teamId);
    
    // 获取成员详情
    const members = await this.getMemberDetails(team.members);
    const newMember = await Read_player(usr_qq);
    
    // 通知全体成员
    const message = [
      `【帝尊挑战队伍】有新成员加入！`,
      `新成员: ${newMember.名号}`,
      `当前成员: ${team.members.length}/5`,
      `队长: ${(await Read_player(team.leader)).名号}`,
      `成员列表:`,
      ...members.map(m => 
        `${m.id === team.leader ? '[队长] ' : ''}${m.name} ` +
        `(战力: ${this.formatPower(m.power)})`
      ),
      team.status === 'full' ? '队伍已满员，随时可发起挑战！' : '继续招募中...',
      `注意：此挑战无奖励，不计CD，只为证明实力！`
    ];
    
    e.reply(message.join('\n'));
    return true;
  }
  
  // 发起帝尊挑战
  async startEmperorBattle(e) {
    const usr_qq = await this.getUserId(e);
    const teamId = await this.getPlayerTeamId(usr_qq);
    if (!teamId) return e.reply('您不在任何队伍中');
    
    const team = await this.getTeam(teamId);
    if (!team) return e.reply('队伍数据异常');
    
    // 检查是否是帝尊挑战
    if (!team.isEmperorChallenge) {
      return e.reply('此队伍不是帝尊挑战队伍');
    }
    
    // 检查队长权限
    if (team.leader !== usr_qq) {
      return e.reply('只有队长可以发起挑战');
    }
    
    // 检查状态
    if (team.status === 'inBattle') {
      return e.reply('队伍正在战斗中，请稍后再试');
    }
    
    // 检查人数
    if (team.members.length < 1) {
      return e.reply('队伍人数不足，至少需要1人');
    }
    
    // 获取帝尊数据
    const bossData = await this.getBossData('帝尊');
    if (!bossData) return e.reply('帝尊数据加载失败');
    
    // 准备玩家数据并初始化状态
    const playersData = await Promise.all(
        team.members.map(async id => {
            const p = await Read_player(id);
            p.初始血量 = p.当前血量;
            
            // 基础状态
            p.dongjie = false;
            p.已复活 = false;
            p.免疫控制 = 0;
            p.已死亡 = false;
            
            return p;
        })
    );
    
    // 更新队伍状态
    team.status = 'inBattle';
    team.battleStartTime = Date.now();
    await this.saveTeam(teamId, team);
    
     
    try {
      // 执行战斗
      const battleResult = await this.tb_battle(playersData, bossData, e);

        // 更新队伍状态
        team.status = battleResult.result === "玩家胜利" ? 'victory' : 'defeated';
        team.battleLog.unshift({
            time: Date.now(),
            result: battleResult.result,
            boss: team.boss,
            members: team.members
        });
        await this.saveTeam(teamId, team);
if (battleResult.result === "玩家胜利") {
  // 清除帝尊感知标记
  await clearEmperorAwareness();
}
        // 发送战报
        await ForwardMsg(e, battleResult.msg);
        
        // 构建战斗结果总结
        const resultSummary = [
            ` 帝尊挑战结果 `,
            battleResult.result === "玩家胜利" 
                ? `恭喜队伍成功击败帝尊！守护了遮天宇宙！` 
                : `很遗憾，队伍未能击败帝尊...`,
            `战斗时长: ${((Date.now() - team.battleStartTime) / 1000).toFixed(1)}秒`,
            `此战只为证道，不计奖励，不占CD`
        ].join('\n');
        
        if (battleResult.result === "玩家胜利") {
      const 帝尊陨落 = [
        ``,
        `【帝尊陨落·万古成空】`,
        `帝尊帝躯寸寸崩裂，万道法则如琉璃破碎，帝血洒落星空，染红诸天万界！`,
        `「吾为帝尊，布局万古，欲炼化此界成就无上仙位...」`,
        `「竟...竟败于尔等之手...」`,
        `帝尊眸光黯淡，眼中倒映万古岁月流转，`,
        `从神话时代到如今，一幕幕辉煌与落寞在眸中沉浮。`,
        `帝冠碎裂，帝袍焚毁，九秘道痕逐一黯淡，`,
        `「可叹...可悲...吾道...成空！」`,
        `帝尊最后一声长叹，带着无尽遗憾与不甘，`,
        `帝躯化作亿万光雨，消散于时间长河之上。`,
        `帝血洒落，滋养万界，帝骨成灰，反哺天地。`,
        `曾经天上地下无敌，布局万古的帝尊，终究陨落！`,
        `时间长河奔涌不息，埋葬了万古多少帝与皇的故事，`,
        `帝尊的传说，至此画上句号。`,
        `此战之后，世间再无帝尊，唯有传说流传...`
    ].join('\n');

    e.reply(resultSummary + 帝尊陨落);
} else {
    e.reply(resultSummary);
}

    } catch (err) {
        console.error('战斗异常:', err);
        team.status = 'recruiting';
        await this.saveTeam(teamId, team);
        
        e.reply('挑战过程中发生错误，已重置队伍状态');
    }
    
    // 解散队伍（帝尊挑战结束后自动解散）
    await this.disbandTeamInternal(teamId, team);
    
    return true;
  }
  

  /*========== 核心功能实现 ==========*/
    // 关闭所有讨伐队伍
  async shutdownAllBattles(e) {
    // 获取所有队伍键
    const teamKeys = await redis.keys(this.redisKeys.team('*'));
    
    if (teamKeys.length === 0) {
      return e.reply('当前没有进行中的讨伐队伍');
    }
    
    // 获取所有玩家关联键
    const playerKeys = await redis.keys(this.redisKeys.player('*'));
    
    // 获取所有BOSS缓存键
    const bossKeys = await redis.keys(this.redisKeys.boss('*'));
    
    // 统计数量
    const teamCount = teamKeys.length;
    const playerCount = playerKeys.length;
    const bossCount = bossKeys.length;
    
    // 删除所有相关键
    await Promise.all([
      ...teamKeys.map(key => redis.del(key)),
      ...playerKeys.map(key => redis.del(key)),
      ...bossKeys.map(key => redis.del(key))
    ]);
    
    // 构建回复消息
    const message = [
      `讨伐系统已关闭`,
      `已清理：`,
      `- 讨伐队伍: ${teamCount}个`,
      `- 玩家关联: ${playerCount}个`,
      `- BOSS缓存: ${bossCount}个`,
      `所有讨伐数据已被永久删除`,
      `系统已重置，可以重新开始讨伐`
    ].join('\n');
    
    return e.reply(message);
  }
  
  // Redis键生成方法（确保这些方法存在）
  redisKeys = {
    team: (id) => `Xiuxian:Battle:Team:${id}`,
    player: (id) => `Xiuxian:Battle:Player:${id}`,
    boss: (name) => `Xiuxian:Battle:Boss:${name}`
  };

  // 创建队伍
  async createBossTeam(e) {
    if (!await this.checkSystemStatus(e)) return true;
    if (!await this.checkBasic(e)) return true;
    const bossName = e.msg.match(/^#创建讨伐队伍\s*(.*)$/)[1]?.trim();
    if (!bossName) return e.reply('请指定BOSS名称');

 
    const usr_qq = await this.getUserId(e);
         // 验证BOSS存在
    const bossData = await this.getBossData(bossName);
  // 检查玩家CD
  const hasCD = await this.checkPlayerCD(usr_qq);
  if (hasCD&&!bossData.名号 === '九幽魔君') {
    const cdTime = await redis.get(`Xiuxian:Battle:PlayerCD:${usr_qq}`);
    const remaining = this.CD_DURATION - (Date.now() - parseInt(cdTime));
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    
    return e.reply([
      `您正处于讨伐冷却时间！`,
      `上次参与讨伐后需等待16小时后才能再次参与`,
      `剩余冷却时间: ${hours}小时${minutes}分钟`,
      `冷却结束后才能创建队伍`
    ].join('\n'));
  }

    if (await this.getPlayerTeamId(usr_qq)) {
      return e.reply('您已在其他队伍中');
    }
   let mojun = await exist_najie_thing (usr_qq, "魔君讨伐令", "道具", 1);

    if (!bossData) return e.reply(`未知BOSS: ${bossName}`);
     // 魔君特殊消耗
  if (bossData.名号 === '九幽魔君') {
    const hasToken = await exist_najie_thing(usr_qq, '魔君讨伐令', '道具');
    if (!hasToken || hasToken < 1) {
      return e.reply('讨伐九幽魔君需要身上有【魔君讨伐令】，请先获取后再来。');
    }
  }
    if (bossData && bossData.名号 === "帝尊" ) {
  return e.reply(`帝尊无法创建讨伐队伍`);
}
    // 创建队伍
    const teamId = this.generateTeamId();
    const newTeam = {
      id: teamId,
      boss: bossName,
      leader: usr_qq,
      members: [usr_qq],
      status: 'recruiting',
      createTime: Date.now(),
      battleLog: []
    };
    
    await this.saveTeam(teamId, newTeam);
    await this.linkPlayer(usr_qq, teamId);
    
    e.reply([
      ` 成功创建讨伐【${bossName}】的队伍！`,
      ` 队伍ID: ${teamId}`,
      ` 当前成员: 1/5`,
      ` 其他成员使用: #加入讨伐队伍 ${teamId}`
    ].join('\n'));
    return true;
  }
  
async checkPlayerCD(userId) {
  const cdKey = `Xiuxian:Battle:PlayerCD:${userId}`;
  const cdTime = await redis.get(cdKey);
  
 if (cdTime) {
   const now = Date.now();
   const elapsed = now - parseInt(cdTime);

   if (elapsed < this.CD_DURATION) {
     return true;
   }
 }

 return false;;
}
// 加入讨伐队伍 - 修复版
async joinBossTeam(e) {
  if (!await this.checkSystemStatus(e)) return true;
  // 获取用户ID
  const usr_qq = await this.getUserId(e);

  
 // 检查玩家CD
  const hasCD = await this.checkPlayerCD(usr_qq);
  if (hasCD) {
    const cdTime = await redis.get(`Xiuxian:Battle:PlayerCD:${usr_qq}`);
    const remaining = this.CD_DURATION - (Date.now() - parseInt(cdTime));
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    
    return e.reply([
      `您正处于讨伐冷却时间！`,
      `上次参与讨伐后需等待16小时后才能再次参与`,
      `剩余冷却时间: ${hours}小时${minutes}分钟`,
      `冷却结束后才能加入队伍`
    ].join('\n'));
  }

  if (!usr_qq) {
    e.reply('无法获取用户ID');
    return true;
    
  }
  
  // 检查是否已在队伍
  const existingTeamId = await this.getPlayerTeamId(usr_qq);
  if (existingTeamId) {
    const existingTeam = await this.getTeam(existingTeamId);
    if (existingTeam) {
      return e.reply([
        `您已在其他队伍中！`,
        `队伍ID: ${existingTeamId}`,
        `目标BOSS: ${existingTeam.boss}`,
        `状态: ${this.getStatusText(existingTeam.status)}`,
        `使用 #离开队伍 退出当前队伍后再加入新队伍`
      ].join('\n'));
    }
  }
  
  // 获取队伍ID - 更宽松的匹配
  const match = e.msg.match(/#加入讨伐队伍\s*([^\s]+)/);
  if (!match || !match[1]) {
    return e.reply('请输入有效的队伍ID，格式: #加入讨伐队伍 [队伍ID]');
  }
  
  const teamId = match[1].trim();
  
  // 获取队伍数据
  const team = await this.getTeam(teamId);
  if (!team) return e.reply(`队伍 ${teamId} 不存在或已解散`);
  
  // 检查状态
  if (team.status !== 'recruiting') {
    return e.reply([
      `队伍 ${teamId} 当前无法加入`,
      `状态: ${this.getStatusText(team.status)}`,
      team.status === 'full' ? '队伍已满员' : '队伍正在战斗中'
    ].join('\n'));
  }
  
  // 检查人数
  if (team.members.length >= 5) {
    await this.updateTeamStatus(teamId, 'full');
    return e.reply('队伍已满员');
  }
  
  // 检查是否已在队伍中
  if (team.members.includes(usr_qq)) {
    return e.reply('您已在此队伍中');
  }
  
  // 加入队伍
  team.members.push(usr_qq);
  
  // 更新队伍状态
  if (team.members.length >= 5) {
    team.status = 'full';
  }
  
  await this.saveTeam(teamId, team);
  await this.linkPlayer(usr_qq, teamId);
  
  // 获取成员详情
  const members = await this.getMemberDetails(team.members);
  const newMember = await Read_player(usr_qq);
  
  // 通知全体成员
  const message = [
    `【${team.boss}讨伐队伍】有新成员加入！`,
    `新成员: ${newMember.名号}`,
    `当前成员: ${team.members.length}/5`,
    `队长: ${(await Read_player(team.leader)).名号}`,
    `成员列表:`,
    ...members.map(m => 
      `${m.id === team.leader ? '[队长] ' : ''}${m.name} ` +
      `(战力: ${this.formatPower(m.power)})`
    ),
    team.status === 'full' ? '队伍已满员，随时可发起讨伐！' : '继续招募中...'
  ];
  
  e.reply(message.join('\n'));
  return true;
}

  
  // 发起讨伐
  async startBossBattle(e) {
    if (!await this.checkSystemStatus(e)) return true;
    if (!await this.checkBasic(e)) return true;
    
    const usr_qq = await this.getUserId(e);
    const teamId = await this.getPlayerTeamId(usr_qq);
    if (!teamId) return e.reply('您不在任何队伍中');
    
    const team = await this.getTeam(teamId);
    if (!team) return e.reply('队伍数据异常');
    
    // 检查队长权限
    if (team.leader !== usr_qq) {
      return e.reply('只有队长可以发起讨伐');
    }
    
    // 检查状态
    if (team.status === 'inBattle') {
      return e.reply('队伍正在战斗中，请稍后再试');
    }
    
    // 检查人数
    if (team.members.length < 1) {
      return e.reply('队伍人数不足，至少需要1人');
    }
    // 检查是否是帝尊挑战队伍
if (team.isEmperorChallenge) {
    return e.reply('帝尊挑战队伍请使用 #迎战帝尊 命令，此挑战无奖励');
}
    // 获取BOSS数据
    const bossData = await this.getBossData(team.boss);
    const bossCopy = {
        ...bossData,
        dongjie: false, // BOSS也可以有定身状态
        isBoss: true   // 标记为BOSS
    };
    if (!bossData) return e.reply(`BOSS数据加载失败: ${team.boss}`);
    
  // 准备玩家数据并初始化状态
const playersData = await Promise.all(
    team.members.map(async id => {
        const p = await Read_player(id);
        p.初始血量 = p.当前血量;
        
        // 基础状态
        p.dongjie = false; // 定身状态
        p.已复活 = false;
        p.免疫控制 = 0;
        p.已死亡 = false;
        
        // 新增圆神相关状态
        p.分身 = [];         // 分身数组
        p.护盾值 = 0;        // 当前护盾值
        p.减伤比例 = 0;      // 减伤比例（0表示无减伤）
        p.圆环之理激活 = false; // 是否已激活圆环之理（首次释放特殊效果）
        
        return p;
    })
);
    
    // 更新队伍状态
    team.status = 'inBattle';
    team.battleStartTime = Date.now();
    await this.saveTeam(teamId, team);
    
  try {
    // 执行战斗
    const battleResult = await this.tb_battle(playersData, bossData, e);

    // 确保基础结构存在
    if (!battleResult || !battleResult.msg) {
      throw new Error('战斗模块返回数据异常');
    }
    
    // 更新队伍状态
    team.status = battleResult.result === "玩家胜利" ? 'victory' : 'defeated';
    team.battleLog.unshift({
      time: Date.now(),
      result: battleResult.result,
      boss: team.boss,
      members: team.members
    });
    await this.saveTeam(teamId, team);
    
    // 发送战报
    await ForwardMsg(e, battleResult.msg);
    
    // 构建战斗结果总结
    const resultSummary = [
      `===== ${team.boss}讨伐战报 =====`,
      `队伍成员: ${team.members.map(id => playersData.find(p => p.user_id === id)?.名号).join(', ')}`,
      battleResult.result === "玩家胜利" 
        ? `恭喜队伍成功击败${team.boss}！请队长使用 #结算团本奖励 领取奖励` 
        : `很遗憾，队伍未能击败${team.boss}...`,
      `战斗时长: ${((Date.now() - team.battleStartTime) / 1000).toFixed(1)}秒`
    ].join('\n');
    
    e.reply(resultSummary);

  } catch (err) {
    console.error('战斗异常:', err);
    team.status = 'recruiting';
    await this.saveTeam(teamId, team);
    
    e.reply('战斗过程中发生错误，已重置队伍状态');
  }
  return true;
}
async settleTeamRewards(e) {
  if (!await this.checkBasic(e)) return true;
  
  const usr_qq = await this.getUserId(e);
  const teamId = await this.getPlayerTeamId(usr_qq);
  if (!teamId) return e.reply('您不在任何队伍中');
  
  const team = await this.getTeam(teamId);
  if (!team) return e.reply('队伍数据异常');
  
  // 检查队长权限
  if (team.leader !== usr_qq) {
    return e.reply('只有队长可以结算奖励');
  }
  
  // 检查状态 - 必须是胜利状态才能结算
  if (team.status !== 'victory') {
    return e.reply('队伍尚未取得胜利，无法结算奖励');
  }
  
  // 获取BOSS数据
  const bossData = await this.getBossData(team.boss);
  if (!bossData) return e.reply(`BOSS数据加载失败: ${team.boss}`);
  
  // 准备玩家数据
  const playersData = await Promise.all(
    team.members.map(async id => await Read_player(id))
  );
  
  // 如果BOSS是帝尊，则无法结算奖励
  if (team.boss == '帝尊') {
    return e.reply('帝尊只可杀死，不可结算团本奖励');
  }
  
  // 如果BOSS是魔君，则发放特殊奖励
  if (team.boss === '九幽魔君') {
    // // 定义可抽取的丹药数组
    // const firstGroup = ["遣龙令", "遣虎令", "玄品秘境结算卡", "残卷", "仙舟", "秘境之匙", "仙品秘境结算卡"];
    // const secondGroup = ["九阶淬体丹", "九阶玄元丹", "天药", "天命轮回丹", "琴笙的加持", "七星玄元丹", "神魔炼体丹"];
    
    // let rewardMsg = '恭喜队伍成功击败魔君！获得以下奖励：\n';
    
    // // 为每位队员发放奖励
    // for (let i = 0; i < team.members.length; i++) {
    //   const playerId = team.members[i];
    //   const player = playersData[i];
      
    //   // 发放1000w源石和灵石
    //   if (!player.源石) player.源石 = 0;
    //   if (!player.灵石) player.灵石 = 0;
      
    //   player.源石 += 10000000;
    //   player.灵石 += 10000000;
      
    //   // 保存玩家数据（源石和灵石）
    //   await Write_player(playerId, player);
      
    //   // 从第一组随机抽三组丹药，并随机数量1-5
    //   const randomFirstGroup = [];
    //   for (let j = 0; j < 3; j++) {
    //     const randomIndex = Math.floor(Math.random() * firstGroup.length);
    //     const randomCount = Math.floor(Math.random() * 5) + 1; // 1-5的随机数
    //     randomFirstGroup.push(`${firstGroup[randomIndex]} x${randomCount}`);
        
    //     // 使用Add_najie_thing添加到玩家背包
    //     await Add_najie_thing(playerId, firstGroup[randomIndex], "道具", randomCount);
    //   }
      
    //   // 从第二组随机抽两组丹药，并随机数量1-5
    //   const randomSecondGroup = [];
    //   for (let j = 0; j < 2; j++) {
    //     const randomIndex = Math.floor(Math.random() * secondGroup.length);
    //     const randomCount = Math.floor(Math.random() * 5) + 1; // 1-5的随机数
    //     randomSecondGroup.push(`${secondGroup[randomIndex]} x${randomCount}`);
        
    //     // 使用Add_najie_thing添加到玩家背包
    //     await Add_najie_thing(playerId, secondGroup[randomIndex], "丹药", randomCount);
    //   }
      
    //   // 添加到奖励信息
    //   rewardMsg += `\n玩家${player.名号 || playerId}获得：\n`;
    //   rewardMsg += `源石 x1000万，灵石 x1000万\n`;
    //   rewardMsg += `道具：${randomFirstGroup.join('、')}\n`;
    //   rewardMsg += `丹药：${randomSecondGroup.join('、')}`;
    // }
    
    // 发送奖励信息
   return e.reply(`请使用结算魔君奖励指令来领取奖励`);
  }
  // 如果BOSS不是魔君，则分发奖励和设置CD
  else {
    // 分发奖励
    const rewardMsg = await this.distributeRewards(e, team, playersData, bossData);
    
    // 为所有队员设置CD
    for (const playerId of team.members) {
      await this.setPlayerCD(playerId);
    }
    
    // 发送奖励信息
    e.reply(rewardMsg);
  }
  
  // 解散队伍
  await this.disbandTeamInternal(teamId, team);
  
  return true;
}
/**
 * 批量结算魔君奖励
 * e.batch = 想要结算的次数（已转 Number）
 */
async batchSettleDevilMonarch(e) {
  // 1. 基础检查
  if (!await this.checkBasic(e)) return true;
  const usr_qq = await this.getUserId(e);

  // 2. 解析次数
  const match = e.msg.match(/^#?结算魔君奖励\*(\d+)$/);
  const batch = Number(match[1]);
  if (!batch || batch <= 0) return e.reply('次数格式错误，示例：结算魔君奖励*10');
  if (batch > 999) return e.reply('一次最多 999 次，防止爆仓。');

  // 3. 拿队伍
  const teamId = await this.getPlayerTeamId(usr_qq);
  if (!teamId) return e.reply('您不在任何队伍中，无法结算奖励。');
  const team = await this.getTeam(teamId);
  if (!team) return e.reply('队伍数据异常，结算失败。');
  if (team.leader !== usr_qq) return e.reply('只有队长可以批量结算奖励。');
  if (team.status !== 'victory' || team.boss !== '九幽魔君') {
    return e.reply('队伍尚未击败九幽魔君，无法结算。');
  }

  // 4. 检查队长讨伐令
  const hasToken = await exist_najie_thing(usr_qq, '魔君讨伐令', '道具');
  if (!hasToken || hasToken < batch) {
    return e.reply(`您的【魔君讨伐令】不足，当前拥有 ${hasToken || 0} 枚，需要 ${batch} 枚。`);
  }

  // 5. 准备玩家数据
  const playersData = await Promise.all(
    team.members.map(id => Read_player(id))
  );
  const bossData = await this.getBossData(team.boss);
  if (!bossData) return e.reply(`BOSS数据加载失败: ${team.boss}`);

  // 6. 奖励定义
  const firstGroup = ["遣龙令","遣虎令","玄品秘境结算卡","灵品秘境结算卡","仙舟","神域令牌","秘境之匙","仙品秘境结算卡","圣品秘境结算卡"];
  const secondGroup= ["天药","九转天药","天命轮回丹","琴笙的加持","圣品福源丹","七星玄元丹","神魔炼体丹","纪元道果"];

  // 7. 队长/队员分开汇总
  const leaderDrop = { 修为:0,血气:0,源石:0, 灵石:0, first:{}, second:{} };
  const memberDrop = { 修为:0,血气:0,源石:0, 灵石:0, first:{}, second:{} };

  // 8. 真正结算 N 次
  for (let round = 0; round < batch; round++) {
    for (let i = 0; i < team.members.length; i++) {
      const playerId = team.members[i];
      const isLeader = playerId === usr_qq;
      const target = isLeader ? leaderDrop : memberDrop;

      // 固定资源
      playersData[i].修为 = (playersData[i].修为 || 0) + 10000000;
      playersData[i].血气 = (playersData[i].血气 || 0) + 10000000;
      playersData[i].源石 = (playersData[i].源石 || 0) + 10000000;
      playersData[i].灵石 = (playersData[i].灵石 || 0) + 10000000;
      target.修为 += 10000000;
      target.血气 += 10000000;
      target.源石 += 10000000;
      target.灵石 += 10000000;

      // 随机道具*3
      for (let j = 0; j < 3; j++) {
        const idx  = Math.floor(Math.random() * firstGroup.length);
        const cnt  = Math.floor(Math.random() * 5) + 1;
        const name = firstGroup[idx];
        target.first[name] = (target.first[name] || 0) + cnt;
        await Add_najie_thing(playerId, name, "道具", cnt);
      }

      // 随机丹药*2
      for (let j = 0; j < 2; j++) {
        const idx  = Math.floor(Math.random() * secondGroup.length);
        const cnt  = Math.floor(Math.random() * 5) + 1;
        const name = secondGroup[idx];
        target.second[name] = (target.second[name] || 0) + cnt;
        await Add_najie_thing(playerId, name, "丹药", cnt);
      }
    }
  }

  // 9. 扣除讨伐令
  await Add_najie_thing(usr_qq, '魔君讨伐令', '道具', -batch);

// 10. 打印结果 - 优化文案格式
const buildLine = (obj) => {
  const lines = [];
  lines.push(`  修为 x${(obj.修为/10000000).toFixed(0)}千万，血气 x${(obj.血气/10000000).toFixed(0)}千万`);
  lines.push(`  源石 x${(obj.源石/10000000).toFixed(0)}千万，灵石 x${(obj.灵石/10000000).toFixed(0)}千万`);
  
  const firstItems = Object.entries(obj.first).map(([k, v]) => `${k} x${v}`).join('、');
  const secondItems = Object.entries(obj.second).map(([k, v]) => `${k} x${v}`).join('、');
  
  if (firstItems) lines.push(`  道具：${firstItems}`);
  if (secondItems) lines.push(`  丹药：${secondItems}`);
  
  return lines.join('\n');
};

// 获取队长名号
const leaderName = playersData.find(p => p.qq === usr_qq)?.名号 || '队长';

let reply = [
  `===== 九幽魔君批量结算完成 =====`,
  `结算次数：${batch}次`,
  `消耗道具：【魔君讨伐令】×${batch}`,
  ``,
  `【队长】${leaderName} 获得：`,
  `${buildLine(leaderDrop)}`,
  ``,
  `【队员】合计获得：`,
  `${buildLine(memberDrop)}`,
].join('\n');

e.reply(reply);

  return true;
}




async distributeRewards(e, team, playersData, bossData) {
  const rewards = [];
  
  // 获取团本奖励列表
  const rewardPool = data.tuanbenjiangli;
  
  // 根据BOSS级别确定奖励组数
  const rewardCount = bossData.级别 === '仙帝' ? 8 : 4;
  
  // 遍历所有队员发放奖励
  for (const playerId of team.members) {
    // 直接读取玩家数据，避免匹配问题
    let player = await Read_player(playerId);
    
    if (!player) {
      console.error(`无法读取玩家数据: ${playerId}`);
      continue;
    }
  
    // 确保玩家名号存在
    if (!player.名号) {
      player.名号 = `无名修士${playerId.slice(-4)}`;
    }
    
    // 生成奖励（根据BOSS级别）
    const playerRewards = await this.generatePlayerRewards(playerId, rewardPool, rewardCount);
    
    // 记录奖励信息
    rewards.push({
      player: player.名号,
      rewards: playerRewards
    });
  }
  
  // 构建奖励消息
  let rewardMsg = [
    `===== ${team.boss}讨伐奖励 =====`,
    `恭喜队伍成功击败${team.boss}（${bossData.级别}）！`,
    `根据BOSS级别，每位成员获得${rewardCount}组奖励`
  ];
  
  // 检查是否有奖励
  if (rewards.length === 0) {
    rewardMsg.push('未找到任何队员奖励信息');
    return rewardMsg.join('\n');
  }
  
  // 添加奖励详情
  for (const r of rewards) {
    rewardMsg.push(`玩家: ${r.player}`);
    
    // 检查是否有奖励
    if (!r.rewards || r.rewards.length === 0) {
      rewardMsg.push('  未获得任何奖励');
      continue;
    }
    
    // 显示该玩家的奖励
    r.rewards.forEach((reward, index) => {
      rewardMsg.push(`  第${index + 1}组: ${reward.name}x${reward.数量}`);
    });
    rewardMsg.push(''); // 空行分隔玩家
  }
  
  // 添加CD提示
  rewardMsg.push(
    '',
    `⚠️ 注意：您此次已参与团本讨伐，16小时内无法再次获得奖励`
  );
  
  return rewardMsg.join('\n');
}

async generatePlayerRewards(playerId, rewardPool, rewardCount) {
  // 检查奖励列表是否为空
  if (!rewardPool || rewardPool.length === 0) {
    console.error('团本奖励列表为空，无法生成奖励');
    return [];
  }
  
  // 深拷贝奖励列表，避免修改原始数据
  const poolCopy = JSON.parse(JSON.stringify(rewardPool));
  
  // 随机选择指定数量的奖励
  const selectedRewards = [];
  
  for (let i = 0; i < rewardCount; i++) {
    if (poolCopy.length === 0) {
      // 如果奖励池空了，添加默认奖励
      selectedRewards.push({
        name: "秘境之匙",
        class: "道具",
        数量: 5
      });
      continue;
    }
    
    // 随机选择一个奖励
    const randomIndex = Math.floor(Math.random() * poolCopy.length);
    const reward = poolCopy.splice(randomIndex, 1)[0];
    
    // 添加到玩家纳戒
    await Add_najie_thing(
      playerId, 
      reward.name, 
      reward.class, 
      reward.数量
    );
    
    // 添加到玩家奖励列表
    selectedRewards.push({
      name: reward.name,
      数量: reward.数量,
      class: reward.class
    });
  }
  
  return selectedRewards;
}
// 内部解散队伍方法
async disbandTeamInternal(teamId, team) {
  // 清理所有成员关联
  await Promise.all(
    team.members.map(id => redis.del(this.redisKeys.player(id)))
  );
  
  // 删除队伍数据
  await redis.del(this.redisKeys.team(teamId));
  
  return `队伍 ${teamId} 已解散`;
}
  // 查看队伍信息
  async getTeamInfo(e) {
    if (!await this.checkSystemStatus(e)) return true;
    if (!await this.checkBasic(e)) return true;
    
    const usr_qq = await this.getUserId(e);
    const teamId = await this.getPlayerTeamId(usr_qq);
    if (!teamId) return e.reply('您不在任何队伍中');
    
    const team = await this.getTeam(teamId);
    if (!team) return e.reply('队伍数据加载失败');
    
    const members = await this.getMemberDetails(team.members);
    const leader = members.find(m => m.id === team.leader);
    
    const message = [
      `队伍信息 [${teamId}]`,
      `目标: ${team.boss}`,
      `队长: ${leader?.name || '未知'}`,
      `状态: ${this.getStatusText(team.status)}`,
      `成员 (${team.members.length}/5):`,
      ...members.map(m => 
        `${m.id === team.leader ? '[队长] ' : ''}${m.name} ` +
        `(战力: ${this.formatPower(m.power)})`
      ),
      team.battleLog.length > 0 ? 
        `最近战况: ${team.battleLog[0].result}` : 
        '尚未进行战斗'
    ];
    
    e.reply(message.join('\n'));
    return true;
  }
  
  // 解散队伍
  async disbandTeam(e) {
    if (!await this.checkSystemStatus(e)) return true;
    if (!await this.checkBasic(e)) return true;
    
    const usr_qq = await this.getUserId(e);
    const teamId = await this.getPlayerTeamId(usr_qq);
    if (!teamId) return e.reply('您不在任何队伍中');
    
    const team = await this.getTeam(teamId);
    if (!team) return e.reply('队伍不存在');
    
    // 检查队长权限
    if (team.leader !== usr_qq) {
      return e.reply('只有队长可以解散队伍');
    }
    
    // 清理所有成员关联
    await Promise.all(
      team.members.map(id => redis.del(this.redisKeys.player(id)))
    );
    
    // 删除队伍数据
    await redis.del(this.redisKeys.team(teamId));
    
    e.reply(` 队伍 ${teamId} 已解散`);
    return true;
  }
  
  // 离开队伍
  async leaveTeam(e) {
    if (!await this.checkSystemStatus(e)) return true;
    if (!await this.checkBasic(e)) return true;
    
    const usr_qq = await this.getUserId(e);
    const teamId = await this.getPlayerTeamId(usr_qq);
    if (!teamId) return e.reply('您不在任何队伍中');
    
    const team = await this.getTeam(teamId);
    if (!team) return e.reply('队伍数据异常');
    
    // 如果是队长且队伍还有其他人
    if (team.leader === usr_qq && team.members.length > 1) {
      const newLeader = team.members.find(id => id !== usr_qq);
      team.leader = newLeader;
      await this.saveTeam(teamId, team);
      
      const newLeaderName = (await Read_player(newLeader)).名号;
      e.reply([
        ` 您已离开队伍`,
        ` 新队长已转移给: ${newLeaderName}`,
        ` 剩余成员: ${team.members.length - 1}人`
      ].join('\n'));
    } 
    // 如果是最后一人
    else if (team.members.length <= 1) {
      await redis.del(this.redisKeys.team(teamId));
      e.reply(' 您已离开队伍，队伍已自动解散');
    }
    // 普通成员离开
    else {
      team.members = team.members.filter(id => id !== usr_qq);
      await this.saveTeam(teamId, team);
      e.reply(' 您已离开队伍');
    }
    
    // 移除玩家关联
    await redis.del(this.redisKeys.player(usr_qq));
    return true;
  }

  /*========== Redis数据操作 ==========*/
  
  async saveTeam(id, data) {
    await redis.set(
      this.redisKeys.team(id),
      JSON.stringify(data),
      'EX', this.expire.team
    );
  }
  
  async getTeam(id) {
    const data = await redis.get(this.redisKeys.team(id));
    return data ? JSON.parse(data) : null;
  }
  
  async linkPlayer(userId, teamId) {
    await redis.set(
      this.redisKeys.player(userId),
      teamId,
      'EX', this.expire.player
    );
  }
  
  async getPlayerTeamId(userId) {
    return await redis.get(this.redisKeys.player(userId));
  }
  
  async updateTeamStatus(teamId, status) {
    const team = await this.getTeam(teamId);
    if (!team) return false;
    
    team.status = status;
    await this.saveTeam(teamId, team);
    return true;
  }
  
  async getBossData(name) {
    // 尝试从缓存获取
    let boss = await redis.get(this.redisKeys.boss(name));
    if (boss) return JSON.parse(boss);
    
    // 从数据库加载（模拟数据）
    const bossDatabase = {
        '尸骸仙帝': {
        名号: '尸骸仙帝',
        级别: '仙帝',
        攻击: 150000 * Math.floor(Math.random() * 800000000000),
        防御: 150000*Math.floor(Math.random() * 800000000000),
        当前血量: 250000 *Math.floor(Math.random() * 800000000000),
        血量上限: 250000* Math.floor(Math.random() * 8000000000000),
        暴击率: 1,
        灵根: "祭道",
        学习的功法: ["原始真解终极篇", "雷帝宝术", "鲲鹏宝术","真龙宝术","草字剑诀"]
      },
      '狠人大帝': {
        名号: '狠人大帝',
         级别: '大帝',
        攻击: 5000 * Math.floor(Math.random() * 8000000000),
        防御: 3000 * Math.floor(Math.random() * 1000000000),
        当前血量: 2000 * Math.floor(Math.random() * 50000000000),
        血量上限:  2000 * Math.floor(Math.random() * 50000000000),
        暴击率: 1,
        灵根: "魔胎仙体",
        学习的功法: ["不灭天功", "万化圣诀", "吞天魔功","飞仙","飞仙诀","一念花开，君临天下"]
      },
      '九幽魔君': {
        名号: '九幽魔君',
         级别: '魔君',
        攻击: 500 * Math.floor(Math.random() * 8000000000),
        防御: 300 * Math.floor(Math.random() * 1000000000),
        当前血量: 200 * Math.floor(Math.random() * 50000000000),
        血量上限:  200 * Math.floor(Math.random() * 50000000000),
        暴击率: 1,
        灵根: "九幽魔体",
        学习的功法: ["八品·太皇经","八品·八荒剑法","八品·太素","八品·天星","八品·鬼帝功","伪八品·影杀","八品·心禅不灭诀","万魔焚仙诀", "伪九品·魔帝功"]
      },
      '帝尊': {
        名号: '帝尊',
         级别: '红尘仙',
        攻击: 500 * Math.floor(Math.random() * 180000000000),
        防御: 300 * Math.floor(Math.random() * 180000000000),
        当前血量: 200 * Math.floor(Math.random() * 580000000000),
        血量上限:  200 * Math.floor(Math.random() * 580000000000),
        暴击率: 1,
        灵根: "混沌体",
        学习的功法:  [
"九秘合一", // 九秘合一，破灭万法
"临字秘", // 肉身不灭，永恒固守
"兵字秘", // 掌控万兵，御器无敌
"斗字秘", // 攻伐第一，战意无双
"者字秘", // 疗伤圣法，瞬间复原
"皆字秘", // 十倍战力，极致爆发
"阵字秘", // 阵法至尊，困杀一体
"组字秘", // 符文交织，天地为阵
"前字秘", // 预知未来，灵觉通天
"行字秘", // 极致速度，时空无阻
"临字秘·极尽", // 肉身不灭，永恒固守
"兵字秘·极尽", // 掌控万兵，御器无敌
"斗字秘·极尽", // 攻伐第一，战意无双
"者字秘·极尽", // 疗伤圣法，瞬间复原
"皆字秘·极尽", // 十倍战力，极致爆发
"阵字秘·极尽", // 阵法至尊，困杀一体
"组字秘·极尽", // 符文交织，天地为阵
"前字秘·极尽", // 预知未来，灵觉通天
"行字秘·极尽" // 极致速度，时空无阻
]
      },
    };
    
    const data = bossDatabase[name];
    if (!data) return null;
    
    // 写入缓存
    await redis.set(
      this.redisKeys.boss(name),
      JSON.stringify(data),
      'EX', this.expire.boss
    );
    
    return data;
  }

  /*========== 工具方法 ==========*/
  
  async checkBasic(e) {
    if (!e.isGroup) {
      e.reply('请在群聊中使用该功能');
      return false;
    }
    
    const usr_qq = await this.getUserId(e);
    if (!await existplayer(usr_qq)) {
      e.reply('请先发送【创建角色】');
      return false;
    }
    
    const player = await Read_player(usr_qq);
    if (player.level_id < 42 && player.lunhui == 0) {
      e.reply('需达到仙界境界才可参与讨伐');
      return false;
    }
    
    return true;
  }
  
  async getUserId(e) {
    let usr_qq = e.user_id.toString().replace('qg_','');
    return await channel(usr_qq);
  }
  
  generateTeamId() {
    const prefixes = ["讨伐", "远征", "诛魔", "斩妖", "伏魔", "荡寇", "平乱", "征伐"];
    const numbers = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let idNumbers = "";
    for (let i = 0; i < 3; i++) {
        const num = Math.floor(Math.random() * 11);
        idNumbers += numbers[num];
    }
    
    return `${prefix}${idNumbers}队`;
  }
  
  async getMemberDetails(memberIds) {
    return await Promise.all(
      memberIds.map(async id => {
        const p = await Read_player(id);
        return {
          id,
          name: p.名号,
          power: this.calculatePower(p),
          isLeader: false
        };
      })
    );
  }
  
  calculatePower(player) {
    return Math.floor(
      player.攻击 * 1.5 + 
      player.防御 * 1.2 + 
      player.血量上限 * 0.8 +
      (player.暴击率 * 100) * (player.暴击伤害 * 0.5)
    );
  }
  
  formatPower(value) {
    return bigNumberTransform(value);
  }
  
  getStatusText(status) {
    const map = {
      recruiting: '招募中',
      full: '已满员',
      inBattle: '战斗中',
      victory: '胜利',
      defeated: '失败'
    };
    return map[status] || status;
  }
  
  initCleanJob() {
    // 每小时清理一次过期数据
    setInterval(async () => {
      try {
        // 清理过期队伍
        const teamKeys = await redis.keys(this.redisKeys.team('*'));
        await Promise.all(
          teamKeys.map(async key => {
            if (await redis.ttl(key) === -2) {
              const teamId = key.split(':').pop();
              // 清理关联的玩家记录
              const team = JSON.parse(await redis.get(key));
              if (team?.members) {
                await Promise.all(
                  team.members.map(id => 
                    redis.del(this.redisKeys.player(id))
                  )
                );
              }
              await redis.del(key);
            }
          })
        );
        
        // 清理过期玩家关联
        const playerKeys = await redis.keys(this.redisKeys.player('*'));
        await Promise.all(
          playerKeys.map(async key => {
            if (await redis.ttl(key) === -2) {
              await redis.del(key);
            }
          })
        );
        
      } catch (err) {
        console.error('定时清理任务出错:', err);
      }
    }, 3600000); // 每小时执行一次
  }
  
  /*========== 战斗核心逻辑 ==========*/
  
  // 战斗数据消毒函数
  sanitizeCombatant(combatant) {
    return {
      ...combatant,
      攻击: ensureNumber(combatant.攻击),
      防御: ensureNumber(combatant.防御),
      当前血量: ensureNumber(combatant.当前血量),
      法球倍率: ensureNumber(combatant.法球倍率 || 0),
      魔道值: ensureNumber(combatant.魔道值 || 0),
      神石: ensureNumber(combatant.神石 || 0),
      暴击率: ensureNumber(combatant.暴击率 || 0)
    };
  }
  
  // 选择仇恨目标函数
  selectTarget(players, hatred) {
    // 找到仇恨值最高的存活玩家
    let maxHatred = -1;
    let targetIndex = 0;
    
    for (let i = 0; i < players.length; i++) {
      if (players[i].当前血量 > 0 && hatred[i] > maxHatred) {
        maxHatred = hatred[i];
        targetIndex = i;
      }
    }
    
    return targetIndex;
  }
  
  // 计算攻击伤害
  async calculateAttack(attacker, defender, cnt, jineng1, jineng2, addBattleLog) {
      const safeAttacker = this.sanitizeCombatant(attacker);
    const safeDefender = this.sanitizeCombatant(defender);
    const msgs = [];
        // 数据消毒

       let jieziTriggered = false;
    let originalAttack, originalDefense, originalHp;
        // ==== 武器效果触发 ====
    if (safeAttacker.id && safeAttacker.武器) {
        const ran = Math.random();
        const weapon = safeAttacker.武器;
        
        if (weapon.name === '紫云剑' && ran > 0.7) {
            const originalAttack = safeAttacker.攻击;
            safeAttacker.攻击 *= 3;
            msgs.push(
                `${safeAttacker.名号}手中紫云剑紫气升腾，剑意暴涨！`,
                `攻击力提升200%：${bigNumberTransform(originalAttack)} → ${bigNumberTransform(safeAttacker.攻击)}`
            );
        } 
        else if (weapon.name === '炼血竹枪' && ran > 0.75) {
            const originalAttack = safeAttacker.攻击;
            const originalHp = safeAttacker.当前血量;
            
            safeAttacker.攻击 *= 2;
            safeAttacker.当前血量 = Math.trunc(safeAttacker.当前血量 * 1.2);
            
            msgs.push(
                `${safeAttacker.名号}手中炼血竹枪血光流转，气势暴涨！`,
                `攻击力提升100%：${bigNumberTransform(originalAttack)} → ${bigNumberTransform(safeAttacker.攻击)}`,
                `生命回复20%：${bigNumberTransform(originalHp)} → ${bigNumberTransform(safeAttacker.当前血量)}`
            );
        } 
        else if (weapon.name === '少阴玉剑' && ran > 0.75) {
            const originalHp = safeAttacker.当前血量;
            safeAttacker.当前血量 = Math.trunc(safeAttacker.当前血量 * 1.4);
            
            msgs.push(
                `${safeAttacker.名号}手中少阴玉剑寒光流转，玉气护体！`,
                `生命回复40%：${bigNumberTransform(originalHp)} → ${bigNumberTransform(safeAttacker.当前血量)}`
            );
        } 
        else if (weapon.name === '仙帝器·大罗仙剑' && ran > 0.75) {
            const 武器伤害 = safeAttacker.攻击 * safeAttacker.法球倍率 * 100;
            safeDefender.当前血量 = Math.max(safeDefender.当前血量 - 武器伤害, 0);
            
          // 修改后（合并为一条消息）
const combinedMessage = [
    `${safeAttacker.名号}眼眸开阖间挥动帝剑，煌煌剑光仿佛截断了永恒！`,
    `斩开了时间长河，无穷大宇宙都在这一剑的滔天伟力下毁灭！`,
    `${safeDefender.名号}在过去现在未来都受到了这毁天灭地的一击，`,
    `仙躯与元神瞬间炸开！`,
    `造成${bigNumberTransform(武器伤害)}点伤害！`,
    `${safeDefender.名号}当前血量：${bigNumberTransform(safeDefender.当前血量)}`
].join('\n');

msgs.push(combinedMessage);
            
            // 大罗仙剑造成直接伤害后，跳过后续攻击计算
            return {
                damage: 武器伤害,
                msgs: msgs,
                isCritical: true // 视为暴击
            };
        }
    }
    
  const zhanli = ["皆字秘"];

// 确保学习的功法是数组
const gongfaList = Array.isArray(attacker.学习的功法) ? attacker.学习的功法 : [];

// 新增：检查目标是否为帝尊
const isEmperorTarget = defender.名号 === '帝尊';

if (gongfaList.length > 0 && 
    gongfaList.some(gongfa => zhanli.includes(gongfa)) && 
    Math.random() < 0.1) 
{
    // 新增：如果目标为帝尊，则皆字秘失效
    if (isEmperorTarget) {
        msgs.push(
            `${attacker.名号}欲催动「皆字秘」，`,
            `却见帝尊眸光如天刀斩落，混沌气弥漫！`,
            `「皆字秘乃吾所创，尔等也敢班门弄斧？」`,
            `帝尊言出即法，万道哀鸣，秘法反噬！`,
            `${attacker.名号}口喷仙血，道基震颤！`
        );
        
        // 造成反噬伤害（最大血量的10%）
        const backlashDamage = Math.trunc(attacker.血量上限 * 0.1);
        attacker.当前血量 = Math.max(0, attacker.当前血量 - backlashDamage);
        
        msgs.push(
            `秘法反噬造成${bigNumberTransform(backlashDamage)}点道伤！`,
            `剩余血量：${bigNumberTransform(attacker.当前血量)}`
        );
    } 
    // 正常触发皆字秘
    else {
        // 记录原始属性
        originalAttack = attacker.攻击;
        originalDefense = attacker.防御;
        originalHp = attacker.当前血量;
        
        // 提升属性
        attacker.攻击 = Math.trunc(attacker.攻击 * 10);
        attacker.防御 = Math.trunc(attacker.防御 * 10);
        attacker.当前血量 = Math.trunc(attacker.当前血量 * 10);
        
        // 计算增益值
        const attackGain = attacker.攻击 - originalAttack;
        const defenseGain = attacker.防御 - originalDefense;
        const hpGain = attacker.当前血量 - originalHp;
        
        msgs.push(
            `${attacker.名号}触发「皆字秘」，战力暴涨！`,
            `攻击提升${bigNumberTransform(attackGain)}`,
            `防御提升${bigNumberTransform(defenseGain)}`,
            `生命回复${bigNumberTransform(hpGain)}`
        );
        
        jieziTriggered = true;
    }
}

    
     // ==== 小成圣体效果实现 ====
  let shengtiBuff = 1; // 圣体基础增益
  let shengtiTriggered = false; // 是否触发圣体效果
  
 // 检查攻击者是否是小成或大成圣体
if (safeAttacker.灵根?.name === "小成·荒古圣体" || safeAttacker.灵根?.name === "大成·荒古圣体") {
    // 根据圣体阶段设置不同的增益系数
    const isDacheng = safeAttacker.灵根?.name === "大成·荒古圣体";
    const baseBuff = isDacheng ? 1.5 : 1.3; // 大成圣体增益更高
    
    // 1. 基础属性增益
    safeAttacker.攻击 = Math.trunc(safeAttacker.攻击 * baseBuff);
    safeAttacker.防御 = Math.trunc(safeAttacker.防御 * baseBuff);
    safeAttacker.当前血量 = Math.trunc(safeAttacker.当前血量 * baseBuff);
    
    // 2. 异象触发概率（大成圣体触发概率更高）
    const triggerChance = isDacheng ? 0.8 : 0.65; // 大成80%，小成65%
    
    if (Math.random() < triggerChance) {
        const yixiangTypes = [
            "仙王临九天",
            "阴阳生死图",
            "混沌种青莲"
        ];
        
        // 大成圣体可能同时触发多种异象
        const triggeredYixiangs = [];
        if (isDacheng) {
            // 大成圣体：随机触发1-3种异象
            const count = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < count; i++) {
                const randomIndex = Math.floor(Math.random() * yixiangTypes.length);
                triggeredYixiangs.push(yixiangTypes[randomIndex]);
            }
        } else {
            // 小成圣体：只触发一种异象
            const randomIndex = Math.floor(Math.random() * yixiangTypes.length);
            triggeredYixiangs.push(yixiangTypes[randomIndex]);
        }
        
        // 处理所有触发的异象
        for (const yixiang of triggeredYixiangs) {
            switch (yixiang) {
                case "仙王临九天":
                    msgs.push(`${safeAttacker.名号}发动异象【仙王临九天】，高坐九重天，身绕玄黄气，如同仙王出世！`);
                    // 额外造成一次伤害（大成圣体伤害更高）
                    const extraDamageMultiplier = isDacheng ? 1.0 : 0.8;
                    const extraDamage = Math.trunc(safeAttacker.攻击 * extraDamageMultiplier);
                    safeDefender.当前血量 = Math.max(0, safeDefender.当前血量 - extraDamage);
                    msgs.push(`仙王虚影对${safeDefender.名号}造成额外${bigNumberTransform(extraDamage)}点伤害！`);
                    break;
                    
                case "阴阳生死图":
                    msgs.push(`${safeAttacker.名号}演化【阴阳生死图】，阐述阴阳生死大道，威势惊天！`);
                    // 降低敌人属性（大成圣体效果更强）
                    const debuffMultiplier = isDacheng ? 0.7 : 0.8; // 大成降低30%，小成降低20%
                    safeDefender.攻击 = Math.trunc(safeDefender.攻击 * debuffMultiplier);
                    safeDefender.防御 = Math.trunc(safeDefender.防御 * debuffMultiplier);
                    msgs.push(`${safeDefender.名号}被阴阳生死图压制，攻击和防御降低${Math.trunc((1 - debuffMultiplier) * 100)}%！`);
                    break;
                    
                case "混沌种青莲":
                    msgs.push(`${safeAttacker.名号}展现异象【混沌种青莲】，混沌中一株青莲绽放，万法不侵！`);
                    // 获得减伤效果（大成圣体减伤更多）
                    const damageReduction = isDacheng ? 0.6 : 0.7; // 大成40%减伤，小成30%减伤
                    shengtiBuff *= damageReduction;
                    break;
            }
        }
        
        // 大成圣体额外效果：异象共鸣
        if (isDacheng && triggeredYixiangs.length > 1) {
            msgs.push(`【异象共鸣】多种异象交织，形成大道领域！`);
            // 额外效果：降低敌人暴击率
            safeDefender.暴击率 *= 0.5;
            msgs.push(`${safeDefender.名号}的暴击率被压制50%！`);
        }
    }
}

  
  // 暴击计算
 const baoji = this.baojishanghai(safeAttacker.暴击率);
  const isCritical = baoji > 1;
    // 暴击计算 - 使用 this.baojishanghai

  // 基础伤害计算 - 使用统一的calculateHarm函数
  let 基础伤害 = calculateHarm(safeAttacker.攻击 * 0.85, safeDefender.防御);
  let 法球伤害 = Math.trunc(safeAttacker.攻击 * safeAttacker.法球倍率);
  let 伤害 = Math.trunc(基础伤害 + 法球伤害 + safeAttacker.防御 * 0.1);
  
  // 应用圣体增益
  伤害 = Math.trunc(伤害 * shengtiBuff);
  
  // 确保不是NaN
  基础伤害 = ensureNumber(基础伤害, 0);
  法球伤害 = ensureNumber(法球伤害, 0);
  伤害 = ensureNumber(伤害, 0);
    
    // 技能触发
    let count = 0; // 限制次数
    let cnt2 = Math.trunc(cnt / 2);
     // 定义九秘功法列表（全局常量）
  const 九秘功法列表 = [
    "临字秘", "兵字秘", "斗字秘", "者字秘", 
    "皆字秘", "数字秘", "组字秘", "前字秘", "行字秘"
  ];
    for (var i = 0; i < jineng1.length; i++) {
         // ==== 九秘功法压制检测（二次确认）====
        if (九秘功法列表.includes(jineng1[i].name)) {
          const isSuppressed = await checkNineSecretSuppression(
            attacker, defender, jineng1[i].name, addBattleLog
          );
          
          // 如果被压制，跳过此技能
          if (isSuppressed) continue;
        }
      if (
        (jineng1[i].class == '常驻' &&
          (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
          Math.random() < jineng1[i].pr) ||
        (safeAttacker.学习的功法 &&
          jineng1[i].class == '功法' &&
          safeAttacker.学习的功法.indexOf(jineng1[i].name) > -1 &&
          (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
          Math.random() < jineng1[i].pr) ||
        (safeAttacker.灵根 &&
          jineng1[i].class == '灵根' &&
          safeAttacker.灵根.name == jineng1[i].name &&
          (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
          Math.random() < jineng1[i].pr)
      ) {
        // 构建技能消息
        let skillMsg = safeAttacker.名号 + jineng1[i].msg1;
        if (jineng1[i].msg2 !== '') {
          skillMsg += safeDefender.名号 + jineng1[i].msg2;
        }
        msgs.push(skillMsg);
        
        // 应用技能效果
        伤害 = 伤害 * jineng1[i].beilv + jineng1[i].other;
        
        count++;
        if (count == 2) break; // 最多触发3个技能
      }
    }
    
    for (var i = 0; i < jineng2.length; i++) {
      if (
        (safeDefender.学习的功法 &&
          jineng2[i].class == '功法' &&
          safeDefender.学习的功法.indexOf(jineng2[i].name) > -1 &&
          (cnt2 == jineng2[i].cnt || jineng2[i].cnt == -1) &&
          Math.random() < jineng2[i].pr) ||
        (safeDefender.灵根 &&
          jineng2[i].class == '灵根' &&
          safeDefender.灵根.name == jineng2[i].name &&
          (cnt2 == jineng2[i].cnt || jineng2[i].cnt == -1) &&
          Math.random() < jineng2[i].pr)
      ) {
        // 构建技能消息
        let skillMsg = safeDefender.名号 + jineng2[i].msg1;
        if (jineng2[i].msg2 !== '') {
          skillMsg += safeAttacker.名号 + jineng2[i].msg2;
        }
        msgs.push(skillMsg);
        
        // 应用技能效果
        伤害 = 伤害 * jineng2[i].beilv + jineng2[i].other;
      }
    }
    
    // 魔道值增益/神石减伤
    let buff = 1;
    if (safeAttacker.魔道值 > 999 && safeAttacker.灵根?.type == '魔头') {
      buff += Math.trunc(safeAttacker.魔道值 / 1000) / 100;
      if (buff > 1.3) buff = 1.3;
      msgs.push(
        `魔道值为${safeAttacker.名号}提供了${Math.trunc((buff - 1) * 100)}%的增伤`
      );
    }
    if (safeDefender.魔道值 < 1 && safeDefender.灵根?.type == '转生') {
      let buff2 = safeDefender.神石 * 0.0015;
      if (buff2 > 0.3) buff2 = 0.3;
      buff -= buff2;
      msgs.push(
        `神石为${safeDefender.名号}提供了${Math.trunc(buff * 100)}%的减伤`
      );
    }
    
    伤害 = Math.trunc(伤害 * buff);
    伤害 = ensureNumber(伤害, 0); // 再次确保不是NaN
     // 在函数结束前恢复属性
    if (jieziTriggered) {
        attacker.攻击 = originalAttack;
        attacker.防御 = originalDefense;
        attacker.当前血量 = originalHp;
    }
    
    return {
      damage: 伤害,
      msgs: msgs,
      isCritical: isCritical
    };
  }
  
  // 暴击伤害计算
  baojishanghai(baojilv) {
    baojilv = ensureNumber(baojilv, 0);
    if (baojilv > 1) baojilv = 1; // 暴击率最高为100%
    
    let rand = Math.random();
    let bl = 1;
    
    if (rand < baojilv) {
      bl = baojilv + 1.5; // 暴击伤害倍率
    }
    
    return ensureNumber(bl, 1);
  }
  
  // 团本战斗核心逻辑
async tb_battle(players, boss, e) {
  // 深拷贝玩家和BOSS数据，并进行数字安全处理
  const playersData = players.map(p => this.sanitizeCombatant(p));
  const bossCopy = this.sanitizeCombatant(boss);
  const battleLogs = []; // 用于收集所有战斗日志
  let cnt = 0; // 回合计数器
  let jineng1 = data.jineng1; // 玩家技能库
let jineng2 = data.jineng2; // BOSS技能库
// 在战斗日志生成处
const addBattleLog = (...lines) => {
  // 1. 过滤空行和无效内容
  const validLines = lines.filter(line => 
    line && typeof line === 'string' && line.trim().length > 0
  );
  
  // 2. 合并短消息
  const combinedLines = [];
  let currentLine = '';
  
  for (const line of validLines) {
    // 如果当前行很短，尝试合并
    if (currentLine.length < 50 && line.length < 100) {
      currentLine += (currentLine ? ' ' : '') + line;
    } else {
      if (currentLine) {
        combinedLines.push(currentLine);
        currentLine = '';
      }
      combinedLines.push(line);
    }
  }
  
  // 添加最后一行
  if (currentLine) {
    combinedLines.push(currentLine);
  }
  
  // 3. 添加到日志
  battleLogs.push(...combinedLines);
  
  // 4. 实时发送部分日志（避免积累过多）
  if (battleLogs.length > 50) {
    const logsToSend = battleLogs.splice(0, 30); // 发送前30条
    sendBattleMessages(e, logsToSend); // 不等待，避免阻塞战斗
  }
};
  
 // 定义sendBattleMessages函数
  const sendBattleMessages = async (e, messages) => {
    if (messages.length === 0) return;
    
    try {
      // 尝试构建转发消息
      const msgList = messages.map(msg => ({
        message: msg,
        nickname: '战斗日志',
        user_id: Bot.uin,
      }));
      
      const forwardMsg = await Bot.makeForwardMsg(msgList);
      await e.reply(forwardMsg);
    } catch (error) {
      console.error('发送转发消息失败:', error);
      
      // 回退到普通消息发送
      const chunkSize = 20;
      for (let i = 0; i < messages.length; i += chunkSize) {
        const chunk = messages.slice(i, i + chunkSize);
        await e.reply(chunk.join('\n'));
        await this.sleep(500); // 避免消息轰炸
      }
    }
  };
  
  // 初始化玩家状态
  for (let player of playersData) {
    player.初始血量 = player.当前血量; // 记录初始血量
    player.dongjie = false; // 定身状态
    player.已复活 = false; // 是否已复活
    player.免疫控制 = 0; // 免疫控制回合数
    player.已死亡 = false; // 是否已死亡
  }
  
  // 仇恨系统：记录每个玩家的仇恨值
  let hatred = new Array(playersData.length).fill(0);
  let currentTarget = 0; // 当前仇恨目标索引
  
  // 锦绣山河领域状态
  let jinxiuShanheActive = false; // 是否激活
  let jinxiuShanheRounds = 0;    // 持续回合
  let jinxiuShanheBuff = 1.0;    // 增益倍率
  
  // 战斗超时设置
  const startTime = Date.now();
  const timeout = 300000; // 5分钟超时（300秒）
  
  // 最大回合限制
  const maxRounds = 100;
  
  // 战斗主循环
  while (
    bossCopy.当前血量 > 0 && 
    playersData.some(p => !p.已死亡) &&
    cnt < maxRounds &&
    (Date.now() - startTime) < timeout
  ) {
    cnt++;
    // 添加回合开始消息
    await addBattleLog(`\n===== 第 ${cnt} 回合开始 =====`);
    
    // ==== 死亡检查与复活 ====
    await this.checkPlayerStatus(playersData, addBattleLog);
    
    // 检查玩家是否全部死亡
    if (playersData.every(p => p.已死亡)) {
      await addBattleLog(`所有玩家已被击败！`);
      break;
    }
// ==== 尸骸仙帝：帝之场域 ====
if (bossCopy.名号 === '尸骸仙帝') {
    // 仙帝境界对应的等级阈值
    const immortalEmperorLevel = 21; // 假设仙帝境界对应的 mijinglevel_id 为 20
    
    // 检查队伍中是否有玩家境界低于仙帝级别
    const hasLowLevelPlayer = playersData.some(player => {
        // 直接使用 mijinglevel_id 属性
        const playerLevel = player.mijinglevel_id || 0;
        return playerLevel < immortalEmperorLevel;
    });
    
    if (hasLowLevelPlayer) {
        addBattleLog(`【帝之场域】`);
        addBattleLog(`尸骸仙帝睁开万古未动的眼眸，帝威弥漫整个战场！`);
        addBattleLog(`未达仙帝者，皆为蝼蚁！`);
        
        // 初始化总夺取值
        let totalStolenAttack = 0;
        let totalStolenDefense = 0;
        let totalStolenHp = 0;
        
        // 使用 for...of 循环处理每个玩家
        for (const player of playersData) {
            const playerLevel = player.mijinglevel_id || 0;
            
            if (playerLevel < immortalEmperorLevel) {
                // 计算境界差距
                const levelDiff = immortalEmperorLevel - playerLevel;
                
                // 计算夺取比例（根据境界差距动态调整）
                const suppressRatio = Math.min(0.65 + levelDiff * 0.05, 0.9); // 最多夺取80%
                
                // 计算夺取数值
                const 夺取攻击 = Math.floor(player.攻击 * suppressRatio);
                const 夺取防御 = Math.floor(player.防御 * suppressRatio);
                const 夺取血量 = Math.floor(player.当前血量 * suppressRatio);
                
                // 执行夺取
                player.攻击 = Math.max(player.攻击 - 夺取攻击, 0);
                player.防御 = Math.max(player.防御 - 夺取防御, 0);
                player.当前血量 = Math.max(player.当前血量 - 夺取血量, 0);
                
                // 累加总夺取值
                totalStolenAttack += 夺取攻击;
                totalStolenDefense += 夺取防御;
                totalStolenHp += 夺取血量;
                
                // 添加日志（不使用 await）
                const logLines = [
                    `${player.名号}被帝威压制（境界差距${levelDiff}级），`,
                    `攻击减少${bigNumberTransform(夺取攻击)}，`,
                    `防御减少${bigNumberTransform(夺取防御)}，`,
                    `血量减少${bigNumberTransform(夺取血量)}！`
                ];
                
                addBattleLog(...logLines);
            }
        }
        
        // 尸骸仙帝吸收夺取的总力量
        bossCopy.攻击 += totalStolenAttack;
        bossCopy.防御 += totalStolenDefense;
        bossCopy.当前血量 += totalStolenHp;
        bossCopy.血量上限 = Math.max(bossCopy.血量上限, bossCopy.当前血量);
        
        addBattleLog(`尸骸仙帝吸收夺取的力量，自身属性提升！`);
        addBattleLog(
            `攻击提升${bigNumberTransform(totalStolenAttack)}，`,
            `防御提升${bigNumberTransform(totalStolenDefense)}，`,
            `血量提升${bigNumberTransform(totalStolenHp)}！`
        );
    }
}
// ==== 帝尊：兵字秘·极尽 ====
if (bossCopy.名号 === '帝尊') {
    // 45%概率触发兵字秘极尽
    if (Math.random() < 0.45) {
        // 随机选择一个玩家
        const randomIndex = Math.floor(Math.random() * playersData.length);
        const targetPlayer = playersData[randomIndex];
        
        addBattleLog(`【兵字秘·极尽】`);
        addBattleLog(`帝尊眸光一转，天地万物皆为我兵！`);
        addBattleLog(`他抬手间，虚空凝固，万道哀鸣，整片古史都在其掌指间流转！`);
        
        // 根据玩家境界和实力构建不同的文案
        const playerLevel = targetPlayer.mijinglevel_id || 0;
        let suppressionText = "";
        
        if (playerLevel >= 16) { // 大帝至准仙帝
            suppressionText = [
                `"帝者，亦为兵！"`,
                `帝尊声音冷漠，言出即法，整片宇宙都化为他的兵器！`,
                `${targetPlayer.名号}帝躯震颤，皇道龙气被生生剥离，如同凡铁遇上了磁母！`
            ].join('\n');
        } else { // 大帝以下
            suppressionText = [
                `"蝼蚁耳，也敢窥天？"`,
                `帝尊甚至未正眼相看，仅仅一念波动，便让${targetPlayer.名号}如陷泥沼！`,
                `虚空化为无形枷锁，将其牢牢定在原地，连思维都几乎停滞！`
            ].join('\n');
        }
        
        addBattleLog(suppressionText);
        
        // 添加遮天特色的细节描写
        const detailText = [
            `只见帝尊指尖流转九秘符文，兵字秘极尽升华，超脱了常理！`,
            `天地为炉，造化为工，阴阳为炭，万物为铜！`,
            `这一刻，${targetPlayer.名号}仿佛成了帝尊手中的一件兵器，身不由己！`,
            `时空长河都在其周围断流，古今未来都被定格在这一瞬！`,
            `"兵字秘修炼到极致，天地万物都可为兵，何况尔等？"`
        ];
        
        // 随机选择1-2条细节文案
        const randomDetails = [];
        for (let i = 0; i < 2; i++) {
            const randomIndex = Math.floor(Math.random() * detailText.length);
            if (!randomDetails.includes(detailText[randomIndex])) {
                randomDetails.push(detailText[randomIndex]);
            }
        }
        
        randomDetails.forEach(line => addBattleLog(line));
        
        // ==== 修改点：添加定身效果 ====
        // 实际效果：目标玩家被定身一回合
        targetPlayer.dongjie = true; // 设置定身状态
        targetPlayer.定身回合数 = (targetPlayer.定身回合数 || 0) + 1;
        
        addBattleLog(`${targetPlayer.名号}被兵字秘定住，下一回合无法行动！`);
       
    } 
}

    // ==== 锦绣山河领域效果 ====
    if (jinxiuShanheActive) {
      // 领域持续回合递减
      jinxiuShanheRounds--;
      
      if (jinxiuShanheRounds <= 0) {
        // 领域结束
        jinxiuShanheActive = false;
        await addBattleLog(`锦绣山河领域消散，天地异象归于平静`);
      } else {
        // 应用领域增益
        for (const player of playersData) {
          if (player.当前血量 > 0) {
            // 保存原始属性
            const originalAttack = player.攻击;
            const originalDefense = player.防御;
            const originalHp = player.当前血量;
            
            // 应用增益
            player.攻击 = Math.trunc(player.攻击 * jinxiuShanheBuff);
            player.防御 = Math.trunc(player.防御 * jinxiuShanheBuff);
            player.当前血量 = Math.trunc(player.当前血量 * jinxiuShanheBuff);
            
            // 计算增益值
            const attackGain = player.攻击 - originalAttack;
            const defenseGain = player.防御 - originalDefense;
            const hpGain = player.当前血量 - originalHp;
            
            await addBattleLog(
              `${player.名号}沐浴在锦绣山河领域中，`,
              `攻击提升${bigNumberTransform(attackGain)}，`,
              `防御提升${bigNumberTransform(defenseGain)}，`,
              `生命回复${bigNumberTransform(hpGain)}`
            );
          }
        }
      }
    }
    
    // ---------- 玩家阶段 ----------
    await addBattleLog(`【玩家阶段】`);
    
    // 玩家按照队伍顺序依次攻击
    for (let i = 0; i < playersData.length; i++) {
      const player = playersData[i];
      
      // 跳过死亡或被定身玩家
      if (player.已死亡 || player.dongjie) {
        await addBattleLog(`${player.名号}无法行动`);
        continue;
      }
        // ==== 九秘功法压制检测 ====
      if (player.当前使用的功法 && 九秘功法列表.includes(player.当前使用的功法)) {
        const isSuppressed = await checkNineSecretSuppression(
          player, bossCopy, player.当前使用的功法, addBattleLog
        );
        
        // 如果被压制，跳过本次行动
        if (isSuppressed) continue;
      }
      // ==== 极道天魔技能 ====
      if (player.灵根?.name === "极道天魔" && Math.random() > 0.7) {
        const demonMsg = [
          `${player.名号}周身魔气滔天，`,
          `六道轮回在其身后显化！`,
          `「魔临天下，万灵俯首！」`
        ];
        
        // 三灾六劫天人五衰
        if (Math.random() > 0.01) {
          const 伤害比例 = 0.2;
          const 防御削减比例 = 0.2;
          const 攻击削减比例 = 0.2;
          
          const 伤害 = Math.trunc(bossCopy.当前血量 * 伤害比例);
          const 减少防御 = Math.trunc(bossCopy.防御 * 防御削减比例);
          const 减少攻击 = Math.trunc(bossCopy.攻击 * 攻击削减比例);
          
          bossCopy.当前血量 = Math.max(0, bossCopy.当前血量 - 伤害);
          bossCopy.防御 = Math.max(0, bossCopy.防御 - 减少防御);
          bossCopy.攻击 = Math.max(0, bossCopy.攻击 - 减少攻击);
          
          demonMsg.push(
            `${player.名号}发动「三灾六劫天人五衰」！`,
            `六道轮回之力碾压而下，`,
            `${bossCopy.名号}顶上三花凋零，胸中五气溃散！`,
            `攻击降低${bigNumberTransform(减少攻击)}`,
            `防御降低${bigNumberTransform(减少防御)}`,
            `生命损失${bigNumberTransform(伤害)}`,
            `${bossCopy.名号}剩余：`,
            `攻击 ${bigNumberTransform(bossCopy.攻击)}`,
            `防御 ${bigNumberTransform(bossCopy.防御)}`,
            `生命 ${bigNumberTransform(bossCopy.当前血量)}`
          );
        }
        
        await addBattleLog(...demonMsg);
      }
      
      // ==== 终焉神魔体技能 ====
      if (player.灵根?.name === "终焉神魔体" && Math.random() > 0.01) {
        const godDemonMsg = [
          `${player.名号}左眼绽放神性金光，`,
          `右眼翻涌魔性黑炎！`,
          `终焉神魔体完全觉醒！`
        ];
        
        // 三维夺取效果
        if (Math.random() > 0.1) {
          // 计算夺取比例（25%-35%）
          const 夺取比例 = 0.25 + (Math.random() * 0.1);
          
          // 计算夺取数值
          const 夺取攻击 = Math.floor(bossCopy.攻击 * 夺取比例);
          const 夺取防御 = Math.floor(bossCopy.防御 * 夺取比例);
          const 夺取血量 = Math.floor(bossCopy.当前血量 * 夺取比例);
          
          // 执行夺取
          bossCopy.攻击 = Math.max(bossCopy.攻击 - 夺取攻击, 0);
          bossCopy.防御 = Math.max(bossCopy.防御 - 夺取防御, 0);
          bossCopy.当前血量 = Math.max(bossCopy.当前血量 - 夺取血量, 0);
          
          player.攻击 += 夺取攻击;
          player.防御 += 夺取防御;
          player.当前血量 += 夺取血量;
          
          godDemonMsg.push(
            `${player.名号}掌心浮现神魔轮盘，`,
            `「神魔终焉劫！」`,
            `诸天法则被改写，${bossCopy.名号}本源被强行剥夺！`,
            `攻击：${bossCopy.名号}-${bigNumberTransform(夺取攻击)} → ${player.名号}+${bigNumberTransform(夺取攻击)}`,
            `防御：${bossCopy.名号}-${bigNumberTransform(夺取防御)} → ${player.名号}+${bigNumberTransform(夺取防御)}`,
            `生命：${bossCopy.名号}-${bigNumberTransform(夺取血量)} → ${player.名号}+${bigNumberTransform(夺取血量)}`
          );
          
          // 终焉之力效果
          if (Math.random() > 0.1) {
            const 终焉伤害 = Math.floor(夺取攻击 + 夺取防御 + 夺取血量);
            bossCopy.当前血量 = Math.max(bossCopy.当前血量 - 终焉伤害, 0);
            godDemonMsg.push(
              `${player.名号}将夺取的本源转化为终焉之力，`,
              `对${bossCopy.名号}造成额外${bigNumberTransform(终焉伤害)}点真实伤害！`
            );
          }
        }
        
        await addBattleLog(...godDemonMsg);
      }
      if (player.灵根?.name === "圆神" && Math.random() < 0.99) {
    const isFirstCast = !player.圆环之理激活; // 检测是否首次释放
    
    // ===== 核心效果 =====
    // 1. 15倍光炮伤害
    const lightCannonDmg = Math.trunc(player.攻击 * 15);
    bossCopy.当前血量 = Math.max(0, bossCopy.当前血量 - lightCannonDmg);
    
    // 2. 全体治疗（30%血量上限）
    const healMessages = [];
    for (const member of playersData) {
        if (member.当前血量 > 0) {
            const healAmount = Math.trunc(member.血量上限 * 0.3);
            member.当前血量 = Math.min(member.当前血量 + healAmount, member.血量上限);
            healMessages.push(`${member.名号}恢复${bigNumberTransform(healAmount)}生命`);
        }
    }
    
    // 3. 自身增益
    player.减伤比例 = 0.3;  // 30%减伤
    player.护盾值 = Math.trunc(player.当前血量 * 0.4);  // 40%血量护盾
    
    // 4. 分身召唤（最多2个）
    if (!player.分身) player.分身 = [];
    if (player.分身.length < 2) {
        const newFenshen = {
            名号: `${player.名号}·圆环分身`,
            攻击: player.攻击,
            防御: player.防御,
            当前血量: player.当前血量,
            血量上限: player.血量上限,
            协同攻击: true,
            分身: true
        };
        player.分身.push(newFenshen);
    }
    
    // ===== 原著级战斗文案 =====
    const skillMessages = [
        `${player.名号}张开双臂，发间丝带绽放虹光！`,
        `「所有宇宙、过去未来的魔法少女们——」`,
        `「你们的悲伤，由我来承受！」`
    ];
    
    // 首次释放的特殊台词
    if (isFirstCast) {
        skillMessages.push(
            `因果律重构！粉红光翼贯穿多元宇宙！`,
            `圆环之理显现，改写宇宙基本法则！`,
            `「这就是我选择的命运！」`
        );
        player.圆环之理激活 = true;
    }
    
    // 光炮伤害描述
    skillMessages.push(
        `箭矢虹光洪流倾泻而出，`,
        `对${bossCopy.名号}造成${bigNumberTransform(lightCannonDmg)}点法则伤害！`,
    );
    
    // 治疗描述
    skillMessages.push(
        `悲叹之种化作粉色星尘飘落：`,
        ...healMessages,
    );
    
    // 护盾与分身描述
    skillMessages.push(
        `${player.名号}获得「神性加护」：`,
        `- 伤害减免30%`,
        `- 获得${bigNumberTransform(player.护盾值)}点因果护盾`
    );
    
    // 分身召唤描述
    if (player.分身.length > 0) {
        const fenshenCount = player.分身.length;
        skillMessages.push(
            `${fenshenCount}道虹光从圆环中分离，`,
            `化作${player.名号}的思念体！`,
            `「我们永远同在...」`
        );
    }
    
    await addBattleLog(...skillMessages);
}




      // ==== 木之本樱：爱牌（全队治疗） ====
      if (player.灵根?.name === "木之本樱" && 
          player.当前血量 < player.血量上限 && 
          Math.random() < 0.55) {
        
        // 计算治疗量
        const 回复比例 = 0.3;
        const 回复总量 = [];
        
        // 为全队回血
        for (const member of playersData) {
          if (member.当前血量 > 0) {
            const 回复血量 = Math.trunc(member.当前血量 * 回复比例);
            member.当前血量 = Math.min(member.当前血量 + 回复血量, member.血量上限);
            回复总量.push({
              name: member.名号,
              amount: 回复血量,
              current: member.当前血量
            });
          }
        }
        
        // 构建消息
        const healMsg = [
          `${player.名号}高举「爱」牌，轻声吟唱：`,
          `隐藏着星星力量的钥匙啊，请在我面前显示你真正的力量！`,
          `粉色的治愈光芒笼罩整个战场！`
        ];
        
        // 添加每个玩家的治疗详情
        回复总量.forEach(m => {
          healMsg.push(`${m.name}恢复${bigNumberTransform(m.amount)}点生命，当前血量${bigNumberTransform(m.current)}`);
        });
        
        await addBattleLog(...healMsg);
      }
      
     // ==== 木之本樱：风与火牌（持续伤害） ====
if (player.灵根?.name === "木之本樱" && 
    Math.random() > 0.35 && 
    !bossCopy.火焰风暴) {
  
  // 随机持续回合数（1-3）
  const 持续回合 = Math.floor(Math.random() * 3) + 1;
  
  // 计算基础伤害（攻击力×100%）
  const 基础伤害 = Math.trunc(player.攻击 * 1.5);
  
  // 计算实际伤害（减去BOSS防御）
  const 实际伤害 = Math.max(10000, 基础伤害 - bossCopy.防御);
  
  // 设置火焰风暴属性
  bossCopy.火焰风暴 = {
    回合: 持续回合,
    每回合伤害: 实际伤害
  };
  
  // 立即造成一次伤害
  bossCopy.当前血量 = Math.max(0, bossCopy.当前血量 - 实际伤害);
  
  await addBattleLog(
    `${player.名号}同时发动「风」与「火」牌！`,
    `风啊，火啊，请将你们的力量借给我！`,
    `狂暴的火焰风暴席卷战场，将${bossCopy.名号}吞噬！`,
    `造成初始${bigNumberTransform(实际伤害)}点伤害！`,
    `（基础伤害：${bigNumberTransform(基础伤害)} - BOSS防御：${bigNumberTransform(bossCopy.防御)}）`,
    `火焰风暴将持续${持续回合}回合！`
  );
}
      
      // ==== 小成·荒古圣体：锦绣山河领域触发 ====
      if (player.灵根?.name === "小成·荒古圣体" && !jinxiuShanheActive) {
        const triggerChance = 0.8; // 80%概率触发
        
        if (Math.random() < triggerChance) {
          jinxiuShanheActive = true;
          jinxiuShanheRounds = 3; // 持续3回合
          jinxiuShanheBuff = 1.5;  // 50%全属性提升
          
          // 构建消息
          const domainMsg = [
            `${player.名号}撑开异象【锦绣山河】，`,
            `一片不属于此界的天地山河浮现！`,
            `万千气象镇压诸天，大道符文交织成网，`,
            `将整个战场笼罩在圣体领域之中！`,
            `领域内所有队友获得50%全属性提升，`,
            `持续3回合！`
          ];
          
          await addBattleLog(...domainMsg);
          
          // 应用增益效果（包括施法者自己）
          for (const member of playersData) {
            if (member.当前血量 > 0) {
              // 记录原始属性
              const originalAttack = member.攻击;
              const originalDefense = member.防御;
              const originalHp = member.当前血量;
              
              // 应用增益
              member.攻击 = Math.trunc(member.攻击 * jinxiuShanheBuff);
              member.防御 = Math.trunc(member.防御 * jinxiuShanheBuff);
              member.当前血量 = Math.trunc(member.当前血量 * jinxiuShanheBuff);
              
              // 计算增益值
              const attackGain = member.攻击 - originalAttack;
              const defenseGain = member.防御 - originalDefense;
              const hpGain = member.当前血量 - originalHp;
              
              // 添加增益消息
              if (member === player) {
                await addBattleLog(
                  `${member.名号}作为领域施法者，` +
                  `攻击提升${bigNumberTransform(attackGain)}，` +
                  `防御提升${bigNumberTransform(defenseGain)}，` +
                  `生命回复${bigNumberTransform(hpGain)}`
                );
              } else {
                await addBattleLog(
                  `${member.名号}沐浴在圣体领域中，` +
                  `攻击提升${bigNumberTransform(attackGain)}，` +
                  `防御提升${bigNumberTransform(defenseGain)}，` +
                  `生命回复${bigNumberTransform(hpGain)}`
                );
              }
            }
          }
        }
      }
      
      // ==== 大成·荒古圣体：锦绣山河领域触发 ====
      if (player.灵根?.name === "大成·荒古圣体" && !jinxiuShanheActive) {
        const triggerChance = 0.9; // 90%概率触发
        
        if (Math.random() < triggerChance) {
          jinxiuShanheActive = true;
          jinxiuShanheRounds = 5; // 持续5回合
          jinxiuShanheBuff = 2.0;  // 100%全属性提升
          
          // 构建消息
          const domainMsg = [
            `${player.名号}撑开大成圣体专属异象【锦绣山河·圣体领域】，`,
            `一片不属于此界的天地山河浮现，大道符文交织成网！`,
            `万千气象镇压诸天，圣体之威撼动古今，`,
            `将整个战场笼罩在圣体领域之中！`,
            `领域内所有队友获得100%全属性提升，`,
            `并附加圣体专属效果，持续5回合！`
          ];
          
          await addBattleLog(...domainMsg);
          
          // 应用增益效果（包括施法者自己）
          for (const member of playersData) {
            if (member.当前血量 > 0) {
              // 记录原始属性
              const originalAttack = member.攻击;
              const originalDefense = member.防御;
              const originalHp = member.当前血量;
              const originalCritRate = member.暴击率;
              const originalCritDamage = member.暴击伤害;
              
              // 应用基础增益
              member.攻击 = Math.trunc(member.攻击 * jinxiuShanheBuff);
              member.防御 = Math.trunc(member.防御 * jinxiuShanheBuff);
              member.当前血量 = Math.trunc(member.当前血量 * jinxiuShanheBuff);
              
              // 计算基础增益值
              const attackGain = member.攻击 - originalAttack;
              const defenseGain = member.防御 - originalDefense;
              const hpGain = member.当前血量 - originalHp;
              
              // 添加圣体专属效果
              member.暴击率 += 0.2; // 增加20%暴击率
              member.暴击伤害 += 0.5; // 增加50%暴击伤害
              member.圣体领域 = true; // 标记圣体领域效果
              
              // 计算额外增益值
              const critRateGain = 0.2;
              const critDamageGain = 0.5;
              
              // 添加增益消息
              await addBattleLog(
                `${member.名号}沐浴在圣体领域中：`,
                `- 攻击提升${bigNumberTransform(attackGain)}`,
                `- 防御提升${bigNumberTransform(defenseGain)}`,
                `- 生命回复${bigNumberTransform(hpGain)}`,
                `- 暴击率提升${(critRateGain * 100).toFixed(0)}%`,
                `- 暴击伤害提升${(critDamageGain * 100).toFixed(0)}%`
              );
              
              // 额外效果：领域内每回合自动回复
              if (member !== player) {
                await addBattleLog(`- 获得圣体庇护：每回合自动回复生命值`);
              }
            }
          }
          
          // 施法者额外效果
          await addBattleLog(
            `${player.名号}作为大成圣体，获得领域掌控之力：`,
            `- 攻击附带圣体道则，无视敌人30%防御`,
            `- 获得圣体金身，减伤效果提升50%`
          );
        }
      }
      
      // 玩家攻击BOSS
      const result = await this.calculateAttack(player, bossCopy, cnt, jineng1, jineng2);
      if (result.msgs && result.msgs.length > 0) {
        await addBattleLog(...result.msgs);
      }
// 在玩家普通攻击后
if (player.分身 && player.分身.length > 0) {
    for (const fenshen of player.分身) {
        if (fenshen.当前血量 > 0) {
            const fenshenDmg = Math.trunc(fenshen.攻击 * 0.8);
            bossCopy.当前血量 = Math.max(0, bossCopy.当前血量 - fenshenDmg);
            await addBattleLog(` ${fenshen.名号}拉弓凝聚虹光，造成${bigNumberTransform(fenshenDmg)}点协同伤害`);
        }
    }
}
      // 确保伤害是有效数字
      let damage = ensureNumber(result.damage, 0);
      
      // 更新BOSS血量
      bossCopy.当前血量 = Math.max(0, ensureNumber(bossCopy.当前血量 - damage));
      
      // 更新仇恨值（伤害越高仇恨越高）
      hatred[i] += damage;
      
      await addBattleLog(`${player.名号}对${bossCopy.名号}造成${bigNumberTransform(damage)}点伤害，BOSS剩余血量：${bigNumberTransform(bossCopy.当前血量)}`);
      
      // 如果BOSS死亡，提前结束回合
      if (bossCopy.当前血量 <= 0) break;
    }
    
   // 检查BOSS是否死亡
if (bossCopy.当前血量 <= 0) {
  // ==== 帝尊：者字秘极尽复活 ====
  if (bossCopy.名号 === '帝尊' && !bossCopy.已触发者字秘复活) {
    bossCopy.已触发者字秘复活 = true; // 标记已触发复活，避免重复
 

     // 记录原始属性
    const originalAttack = bossCopy.攻击;
    const originalDefense = bossCopy.防御;
    const originalMaxHp = bossCopy.血量上限;
    
    // 提升属性（复活后更强）
    bossCopy.攻击 = Math.trunc(bossCopy.攻击 * 1.3);
    bossCopy.防御 = Math.trunc(bossCopy.防御 * 1.3);
    bossCopy.血量上限 = Math.trunc(bossCopy.血量上限 * 1.3);
    bossCopy.当前血量 = bossCopy.血量上限; // 满血复活

    await addBattleLog(
      `【者字秘·极尽】`,
      `帝尊身躯破碎，帝血洒落星空，却见万道符文自破碎帝躯中涌现！`,
      `「长生不朽，吾身不灭！」`,
      `者字秘演化至终极境界，破碎的帝躯在仙光中重组！`,
      `帝血倒流，万道重组，破碎的仙台重聚！`,
      `帝尊在寂灭中归来，气息更胜往昔！`,
      `「吾为长生天尊，掌不死秘术，谁能葬吾？」`,
      `帝尊极尽升华，重回巅峰！`,
       `攻击提升：${bigNumberTransform(originalAttack)} → ${bigNumberTransform(bossCopy.攻击)}`,
        `防御提升：${bigNumberTransform(originalDefense)} → ${bigNumberTransform(bossCopy.防御)}`,
        `生命上限提升：${bigNumberTransform(originalMaxHp)} → ${bigNumberTransform(bossCopy.血量上限)}`,
 
    );

  
  } else {
    // 其他BOSS死亡处理
    await addBattleLog(`\n${bossCopy.名号}已被击败！`);
    break;
  }
}
    
    // ---------- BOSS阶段 ----------
    await addBattleLog(`【BOSS阶段】`);
    
    // ==== 尸骸仙帝：大罗剑胎·诸天寂灭 ====
    if (bossCopy.名号 === '尸骸仙帝' && Math.random() < 1) {
      const skillName = "大罗剑胎·诸天寂灭";
      await addBattleLog(`【${skillName}】`);
      await addBattleLog(`尸骸仙帝眸绽冷电，手中大罗剑胎嗡鸣震颤，`);
      await addBattleLog(`一道贯穿古今未来的剑光撕裂诸天万界！`);
      await addBattleLog(`「诸天破灭，唯我永恒！」`);
      await addBattleLog(`大罗剑胎化作无量劫光，斩断时间长河，破灭万古时空！`);
      await addBattleLog(`剑光所至，诸天星辰皆成齑粉，无尽宇宙归于虚无！`);
      
      // 计算基础伤害（攻击力×300%）
      const baseDamage = Math.trunc(bossCopy.攻击 * 30);
      
      // 对每个玩家造成伤害
      let totalDamage = 0;
      const damageDetails = [];
      
      for (const player of playersData) {
        if (player.当前血量 > 0) {
          // 计算实际伤害（无视50%防御）
          const actualDamage = Math.trunc(
            baseDamage * (1 - player.防御 / (player.防御 + baseDamage * 10)) * 0.5
          );
          
          // 应用伤害
          player.当前血量 = Math.max(0, player.当前血量 - actualDamage);
          totalDamage += actualDamage;
          
          // 记录伤害详情
          damageDetails.push({
            player: player.名号,
            damage: actualDamage,
            remaining: player.当前血量
          });
        }
      }
      
      // 添加伤害详情
      for (const detail of damageDetails) {
        await addBattleLog(
          `${detail.player}被煌煌剑光贯穿，元神剧震！`,
          `造成${bigNumberTransform(detail.damage)}点道伤，`,
          `剩余血量：${bigNumberTransform(detail.remaining)}`
        );
      }
      
      await addBattleLog(`大罗剑胎归鞘，万道剑痕烙印虚空！`);
      await addBattleLog(`此击共造成${bigNumberTransform(totalDamage)}点湮灭伤害！`);
      
      // 如果玩家全部死亡，提前结束战斗
      if (playersData.every(p => p.当前血量 <= 0)) {
        await addBattleLog(`仙帝一击，谁与相抗？所有玩家魂归永寂，身死道消！`);
        break;
      }
      
      // 跳过后续普通攻击
      continue;
    }
    // ==== 帝尊：皆字秘·极尽 ====
if (bossCopy.名号 === '帝尊' && !bossCopy.皆字秘极尽触发 && cnt === 1) {
    bossCopy.皆字秘极尽触发 = true; // 标记已触发
    
    // 记录原始属性
    const originalAttack = bossCopy.攻击;
    const originalDefense = bossCopy.防御;
    const originalHp = bossCopy.当前血量;
    const originalMaxHp = bossCopy.血量上限;
    
    // 提升百倍属性
    bossCopy.攻击 = Math.trunc(bossCopy.攻击 * 100);
    bossCopy.防御 = Math.trunc(bossCopy.防御 * 100);
    bossCopy.当前血量 = Math.trunc(bossCopy.当前血量 * 100);
    bossCopy.血量上限 = Math.trunc(bossCopy.血量上限 * 100);
    
    // 构建战斗日志
    await addBattleLog(`【皆字秘·极尽】`);
    await addBattleLog(`帝尊眸光开阖，万古岁月在眼中流转！`);
    await addBattleLog(`皆字秘演化至终极境界，打破万古禁忌！`);
    await addBattleLog(`百倍战力极尽升华，帝威盖压诸天万界！`);
    await addBattleLog(`攻击：${bigNumberTransform(originalAttack)} → ${bigNumberTransform(bossCopy.攻击)}`);
    await addBattleLog(`防御：${bigNumberTransform(originalDefense)} → ${bigNumberTransform(bossCopy.防御)}`);
    await addBattleLog(`生命：${bigNumberTransform(originalHp)} → ${bigNumberTransform(bossCopy.当前血量)}`);
    await addBattleLog(`生命上限：${bigNumberTransform(originalMaxHp)} → ${bigNumberTransform(bossCopy.血量上限)}`);
    
    // 添加特殊状态
    bossCopy.九秘合一激活 = true;
    bossCopy.帝尊领域 = {
        回合: 5,
        效果: "万法皆封"
    };
    
    await addBattleLog(`帝尊领域展开，万道哀鸣！`);
    await addBattleLog(`「此域之中，九秘皆为我掌！」`);
    await addBattleLog(`所有九秘功法效果被压制，持续5回合！`);
}
   // ==== 帝尊领域状态更新 ====
    if (bossCopy.帝尊领域) {
      bossCopy.帝尊领域.回合--;
      
      if (bossCopy.帝尊领域.回合 <= 0) {
        await addBattleLog(
          `帝尊领域消散，万道枷锁解除！`,
          `「九秘压制已消失，尔等可尽情施展！」`
        );
        delete bossCopy.帝尊领域;
      } else {
        await addBattleLog(
          `帝尊领域持续中（剩余${bossCopy.帝尊领域.回合}回合）`,
          `九秘功法仍被压制！`
        );
      }
    }
// ==== 帝尊：九秘合一·天帝法旨 ====
if (bossCopy.名号 === '帝尊' && !bossCopy.九秘合一触发 && Math.random() < 1) {
  bossCopy.九秘合一触发 = true; // 标记已触发
  const skillName = "九秘合一·天帝法旨";
  await addBattleLog(`【${skillName}】`);
  await addBattleLog(`帝尊眸光开阖间，混沌气弥漫诸天，忽然喝道：`);
  await addBattleLog(`「临、兵、斗、者、皆、数、组、前、行！」`);
  await addBattleLog(`其声如九天惊雷，震得万古星河簌簌颤抖，仿佛天帝君临，威严无比！`);
  await addBattleLog(`九字真言化作九团永恒仙光，无量威能贯穿天上地下！`);
  await addBattleLog(`「九秘合一，当击穿一切阻挡！」`);
  await addBattleLog(`九字仙符熔炼为混沌道图，碾碎万古青天！`);
  
  // 计算总伤害（攻击力×6000%）
  const totalDamage = Math.trunc(bossCopy.攻击 * 1);
  
  // 获取存活玩家
  const alivePlayers = playersData.filter(p => p.当前血量 > 0);
  const playerCount = alivePlayers.length;
  
  if (playerCount === 0) {
    await addBattleLog(`所有玩家已阵亡，帝尊法旨无需施展！`);
    return;
  }
  
  // 计算每个玩家承受的伤害比例
  const damagePerPlayer = Math.trunc(totalDamage / playerCount);
  
  await addBattleLog(`混沌道图镇压诸天，伤害由所有存活玩家平摊！`);
  await addBattleLog(`存活玩家数: ${playerCount}人，每人承受: ${bigNumberTransform(damagePerPlayer)}点伤害`);
  
  let actualTotalDamage = 0;
  const damageDetails = [];
  
  for (const player of alivePlayers) {
    // 计算实际伤害（无视80%防御）
    const actualDamage = damagePerPlayer;
    
    // 附加道基损伤（最大血量10%的永久伤害）
    const daoDamage = Math.trunc(player.血量上限 * 0.1);
    player.血量上限 = Math.max(1, player.血量上限 - daoDamage);
    
    // 应用伤害
    player.当前血量 = Math.max(0, player.当前血量 - actualDamage);
    actualTotalDamage += actualDamage;
    
    // 记录伤害详情
    damageDetails.push({
      player: player.名号,
      damage: actualDamage,
      daoDamage: daoDamage,
      remaining: player.当前血量,
      maxHp: player.血量上限
    });
  }
  
  // 添加伤害详情
  for (const detail of damageDetails) {
    await addBattleLog(
      `${detail.player}被混沌道图镇压，仙台龟裂！`,
      `承受${bigNumberTransform(detail.damage)}点道伤 + ${bigNumberTransform(detail.daoDamage)}点道基损伤！`,
      `剩余血量：${bigNumberTransform(detail.remaining)}/${bigNumberTransform(detail.maxHp)}`
    );
  }
  
  await addBattleLog(`九秘仙光敛去，虚空留下永恒道痕！`);
  await addBattleLog(`此击共造成${bigNumberTransform(actualTotalDamage)}点本源伤害！`);
  
  // 如果玩家全部死亡，提前结束战斗
  if (playersData.every(p => p.当前血量 <= 0)) {
    await addBattleLog(`帝尊法旨，言出即法！所有玩家道果崩灭，永堕轮回！`);
    break;
  }
  
  // 跳过后续普通攻击
  continue;
}

// 火焰风暴持续伤害
if (bossCopy.火焰风暴) {
  // 基础伤害已在技能发动时计算（已减去防御）
  const 实际伤害 = bossCopy.火焰风暴.每回合伤害;
  
  // 应用伤害
  bossCopy.当前血量 = Math.max(0, bossCopy.当前血量 - 实际伤害);
  bossCopy.火焰风暴.回合--;
  
  await addBattleLog(
    `${bossCopy.名号}被火焰风暴持续灼烧！`,
    `造成${bigNumberTransform(实际伤害)}点伤害！`,
    `${bossCopy.名号}剩余血量：${bigNumberTransform(bossCopy.当前血量)}`,
    `火焰风暴剩余回合：${bossCopy.火焰风暴.回合}`
  );
  
  if (bossCopy.火焰风暴.回合 <= 0) {
    await addBattleLog(`火焰风暴渐渐平息...`);
    delete bossCopy.火焰风暴;
  }
}
    
    // 选择仇恨目标（仇恨值最高的存活玩家）
    if (bossCopy.dongjie) {
      await addBattleLog(`${bossCopy.名号}被定身，无法行动！`);
      bossCopy.dongjie = false; // 解除定身
    } else {
      currentTarget = this.selectTarget(playersData, hatred);
      const targetPlayer = playersData[currentTarget];
      
      // ==== 命运神道体技能 ====
      if (targetPlayer.灵根?.name === "命运神道体" && Math.random() > 0.7) {
        const fateMsg = [];
        fateMsg.push(
          `${targetPlayer.名号}眼眸中星河流转，`,
          `命运长河在身后显化！`,
          `「因果轮回，皆在吾掌中！」`
        );
        
        // 如梦真名庇护
        if (Math.random() > 0.01) {
          const 回复比例 = 0.5;
          const 回复血量 = Math.trunc(targetPlayer.当前血量 * 回复比例);
          targetPlayer.当前血量 = Math.min(targetPlayer.当前血量 + 回复血量, targetPlayer.血量上限);
          
          fateMsg.push(
            `${targetPlayer.名号}轻诵如梦真名：`,
            `"诸天万界，唯吾永恒！"`,
            `命运长河倒卷，庇护其身！`,
            `恢复${bigNumberTransform(回复血量)}点生命`,
            `当前血量：${bigNumberTransform(targetPlayer.当前血量)}`
          );
        }
        
        // 命运反噬
        if (Math.random() > 0.5) {
          const 反噬伤害 = Math.trunc(bossCopy.攻击 * 0.3);
          bossCopy.当前血量 = Math.max(0, bossCopy.当前血量 - 反噬伤害);
          
          fateMsg.push(
            `命运之力反噬！`,
            `${bossCopy.名号}遭受因果报应，`,
            `损失${bigNumberTransform(反噬伤害)}点生命！`
          );
        }
        
        await addBattleLog(...fateMsg);
      }
      
      // BOSS攻击玩家
      const result = await this.calculateAttack(bossCopy, targetPlayer, cnt, jineng1, jineng2);
      if (result.msgs && result.msgs.length > 0) {
        await addBattleLog(...result.msgs);
      }



      // 确保伤害是有效数字
     let damage = ensureNumber(result.damage, 0);
      // ==== 分身死亡处理 ====
// ==== 分身消散处理 ====
if (targetPlayer.分身 && targetPlayer.分身.length > 0) {
    // 过滤存活的分身
    targetPlayer.分身 = targetPlayer.分身.filter(f => f.当前血量 > 0);
    
    // 检查是否所有分身都已消散
    if (targetPlayer.分身.length === 0) {
        await addBattleLog(
            `✨ ${targetPlayer.名号}身后的虹光渐渐黯淡...`,
            `「思念的力量终究有极限...」`,
            `圆环分身化作光雨回归宇宙法则`,
            `最后的光点在空中划出优美的弧线，消失在虚空之中`
        );
    }
}
// 在护盾抵消逻辑后添加：
if (targetPlayer.护盾值 > 0) {
    if (targetPlayer.护盾值 >= damage) {
        targetPlayer.护盾值 -= damage;
        damage = 0;
        await addBattleLog(` ${targetPlayer.名号}的因果护盾抵消了${bigNumberTransform(damage)}点伤害！`);
    } else {
        damage -= targetPlayer.护盾值;
        await addBattleLog(` ${targetPlayer.名号}的因果护盾抵消${bigNumberTransform(targetPlayer.护盾值)}点伤害！`);
        targetPlayer.护盾值 = 0;
    }
}
      // ==== 分身伤害抵挡 ====
if (targetPlayer.分身 && targetPlayer.分身.length > 0) {
    // 优先选择血量最高的分身抵挡
    const activeFenshen = targetPlayer.分身
        .filter(f => f.当前血量 > 0)
        .sort((a, b) => b.当前血量 - a.当前血量);
    
    if (activeFenshen.length > 0) {
        const shieldFenshen = activeFenshen[0];
        const originalDmg = damage;
        
        if (shieldFenshen.当前血量 >= damage) {
            shieldFenshen.当前血量 -= damage;
            damage = 0;
            await addBattleLog(
                `${shieldFenshen.名号}挺身阻挡攻击！`,
                `分身承受${bigNumberTransform(originalDmg)}点伤害`
            );
        } else {
            damage -= shieldFenshen.当前血量;
            await addBattleLog(
                `${shieldFenshen.名号}化作星尘消散！`,
                `抵消${bigNumberTransform(shieldFenshen.当前血量)}点伤害`
            );
            shieldFenshen.当前血量 = 0;
        }
    }
}
      // 更新玩家血量
      targetPlayer.当前血量 = Math.max(0, ensureNumber(targetPlayer.当前血量 - damage));
      
      await addBattleLog(`${bossCopy.名号}攻击${targetPlayer.名号}，造成${bigNumberTransform(damage)}点伤害，${targetPlayer.名号}剩余血量：${bigNumberTransform(targetPlayer.当前血量)}`);
      
      // ==== 立即检查被攻击玩家是否死亡 ====
      if (targetPlayer.当前血量 <= 0 && !targetPlayer.已复活) {
        const revivalResult = await this.checkPlayerRevival(targetPlayer);
        if (revivalResult.success) {
          addBattleLog(...revivalResult.message);
          targetPlayer.已复活 = true;
          targetPlayer.已死亡 = false;
        } else {
          targetPlayer.已死亡 = true;
          await addBattleLog(`${targetPlayer.名号}已阵亡！`);
        }
      }
    }
    
    // 玩家定身状态解除
    for (const player of playersData) {
      if (player.dongjie) {
        player.dongjie = false;
        await addBattleLog(`${player.名号}的定身状态解除`);
      }
    }
    
    // BOSS定身状态解除
    if (bossCopy.dongjie) {
      bossCopy.dongjie = false;
      await addBattleLog(`${bossCopy.名号}的定身状态解除`);
    }
  }
  
  // 战斗结束处理
  if (cnt >= maxRounds) {
    await addBattleLog(`战斗超过${maxRounds}回合，强制结束！`);
  }
  
  if ((Date.now() - startTime) >= timeout) {
    await addBattleLog(`战斗超时（5分钟），强制结束！`);
  }
  
  // 计算血量变化
  const playersHpChange = playersData.map(p => ensureNumber(p.当前血量 - p.初始血量, 0));
  const bossHpChange = ensureNumber(bossCopy.当前血量 - bossCopy.初始血量, 0);
  
  // 确定战斗结果
  const result = bossCopy.当前血量 <= 0 ? "玩家胜利" : "BOSS胜利";
  await addBattleLog(`战斗结束`);
  await addBattleLog(`结果：${result}`);
  
  // 重置玩家状态
  this.resetPlayersStatus(playersData);
  
  // 发送剩余的消息
  if (battleLogs.length > 0) {
    await sendBattleMessages(e, battleLogs);
  }
  
  return {
    msg: battleLogs,
    players_hp_change: playersHpChange,
    boss_hp_change: bossHpChange,
    result: result
  };
}

// 辅助方法：检查玩家状态
async checkPlayerStatus(playersData, addBattleLog) {
  const logs = []; // 创建一个日志数组来收集消息
  
  try {
    const promises = playersData.map(async player => {
      // 跳过已死亡玩家
      if (player.已死亡) return;
      
      // 检查是否死亡且未复活过
      if (player.当前血量 <= 0 && !player.已复活) {
        const revivalResult = await this.checkPlayerRevival(player);
        
        if (revivalResult.success) {
          // 添加消息（但限制数量）
          if (logs.length < 100) {
            logs.push(...revivalResult.message);
          } else {
            logs.push(`${player.名号}成功复活`);
          }
          
          player.已复活 = true;
          player.已死亡 = false;
        } else {
          player.已死亡 = true;
          if (logs.length < 100) {
            logs.push(`${player.名号}已阵亡！`);
          }
        }
      }
      
      // 检查是否被定身
      if (player.dongjie) {
        if (logs.length < 100) {
          logs.push(`${player.名号}被定身，无法行动！`);
        }
        player.dongjie = false;
      }
      
      // 减少免疫控制回合数
      if (player.免疫控制 > 0) player.免疫控制--;
    });
    
    await Promise.all(promises);
    
    // 添加所有收集的日志
    if (logs.length > 0) {
      await addBattleLog(...logs);
    }
  } catch (err) {
    console.error('检查玩家状态出错:', err);
    await addBattleLog('检查玩家状态时发生错误');
  }
}

// 辅助方法：检查玩家复活
async checkPlayerRevival(player) {
  // 检查玩家是否死亡且未复活过
  if (player.当前血量 <= 0 && !player.已复活) {
    // 1. 涅槃仙功复活
    if (player.学习的功法?.includes("涅槃仙功") && Math.random() < 0.2) {
      const 最大血量 = player.血量上限;
      player.当前血量 = Math.trunc(最大血量 * 0.5);
      
      return {
        success: true,
        message: [
          ` ${player.名号}触发「涅槃仙功」，浴火重生！`,
          `涅槃真火熊熊燃烧，焚尽一切禁锢！`,
          `${player.名号}获得涅槃真火护体，三回合内免疫所有控制效果！`,
          ` 恢复${bigNumberTransform(最大血量 * 0.5)}点血量！`
        ]
      };
    }
    
    // 2. 斩我明道诀复活（乱古大帝版）
    if (player.学习的功法?.includes("斩我明道诀") && Math.random() < 0.3) {
      const 最大血量 = player.血量上限;
      player.当前血量 = 最大血量; // 满血复活
      
      // 属性提升
      const originalAttack = player.攻击;
      const originalDefense = player.防御;
      player.攻击 = Math.trunc(player.攻击 * 1.5);
      player.防御 = Math.trunc(player.防御 * 1.5);
      
      return {
        success: true,
        message: [
          `${player.名号}眼中闪过万古沧桑，百世轮回的印记在眸中沉浮！`,
          `「百败证道，乱天动地！」`,
          `虚空崩裂，一道横贯古今的斧影自时间长河劈落！`,
          `斧光过处，旧躯如瓷破碎，新我在寂灭中涅槃重生！`,
          `${player.名号}的道基在百败中蜕变，乱古帝符烙印虚空！`,
          `「历经万劫，吾道不孤！」`,
          `乱古经义轰鸣，战力逆乱而上，重临绝巅！`,
          `帝血重燃，恢复全部生命！`,
          `攻击提升50%：${bigNumberTransform(originalAttack)} → ${bigNumberTransform(player.攻击)}`,
          `防御提升50%：${bigNumberTransform(originalDefense)} → ${bigNumberTransform(player.防御)}`
        ]
      };
    }
    
    // 3. 鹿目圆灵根复活（变成圆神）
    if (player.灵根?.name === "鹿目圆" && Math.random() < 0.95) {
      const 最大血量 = player.血量上限;
      player.当前血量 = 最大血量; // 满血复活
      
      // 属性提升100倍
      const originalAttack = player.攻击;
      const originalDefense = player.防御;
      const originalHp = player.血量上限;
      
      player.攻击 = Math.trunc(player.攻击 * 100);
      player.防御 = Math.trunc(player.防御 * 100);
      player.血量上限 = Math.trunc(player.血量上限 * 100);
      player.当前血量 = player.血量上限;
      
      // 灵根升级为圆神
      player.灵根 = {
        name: "圆神",
        type: "神格",
        desc: "超越宇宙法则的存在"
      };
      
      return {
        success: true,
        message: [
          ` ${player.名号}周身绽放无量神光，与丘比签订契约！`,
          `上百条轮回世界线的因果聚集到了${player.名号}身上！`,
          `「所有的宇宙，过去与未来，所有的魔女...由我亲手来终结！」`,
          `${player.名号}化身为「圆神」，成为超越宇宙法则的存在！`,
          ` 生命提升100倍：${bigNumberTransform(originalHp)} → ${bigNumberTransform(player.血量上限)}`,
          ` 攻击提升100倍：${bigNumberTransform(originalAttack)} → ${bigNumberTransform(player.攻击)}`,
          ` 防御提升100倍：${bigNumberTransform(originalDefense)} → ${bigNumberTransform(player.防御)}`
        ]
      };
    }
  }
  
  return { success: false };
}

// 修改后的 sendBattleMessages 方法
async  sendBattleMessages(e, messages) {
  if (messages.length === 0) return;
  
  // 将消息数组分割成多个部分，每个部分最多15条消息
  const chunks = [];
  const chunkSize = 300;
  
  for (let i = 0; i < messages.length; i += chunkSize) {
    chunks.push(messages.slice(i, i + chunkSize));
  }
  
  // 构建转发消息节点
  const forwardNodes = chunks.map((chunk, index) => {
    return {
      nickname: '战斗日志',
      content: chunk.join('\n'),
      user_id: Bot.uin,
    };
  });
  
  // 使用Bot.makeForwardMsg构建转发消息
  const forwardMsg = await Bot.makeForwardMsg(forwardNodes);
  
  // 发送转发消息
  try {
    await e.reply(forwardMsg);
  } catch (error) {
    console.error('发送转发消息失败:', error);
    
    // 回退到普通消息发送
    for (const chunk of chunks) {
      await e.reply(chunk.join('\n'));
      await this.sleep(500); // 避免消息轰炸
    }
  }
}

// 辅助方法：重置玩家状态
resetPlayersStatus(playersData) {
    for (const player of playersData) {
        player.已复活 = false;
        player.免疫控制 = 0;
        player.已死亡 = false;
        
        // 重置圆神相关状态
        player.分身 = [];
        player.护盾值 = 0;
        player.减伤比例 = 0;
        player.圆环之理激活 = false;
    }
}

// 辅助方法：休眠
async  sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}}
// ===== 九秘功法压制检测函数 =====
async function checkNineSecretSuppression(attacker, bossCopy, skillName, addBattleLog) {
  try {
    // 1. 参数验证
    if (!attacker || !bossCopy || typeof skillName !== 'string') {
      console.error('无效的参数传递给 checkNineSecretSuppression');
      return false;
    }
    
    // 2. 日志函数验证
    if (typeof addBattleLog !== 'function') {
      console.error('addBattleLog 不是函数，跳过压制检测');
      return false;
    }
    
    // 3. 检查是否处于帝尊领域压制状态
    const isSuppressed = bossCopy.名号 === '帝尊' && 
                        bossCopy.帝尊领域 && 
                        bossCopy.帝尊领域.效果 === "万法皆封";
    
    if (!isSuppressed) return false;
    
    // 4. 构建压制文案
    const suppressionMsgs = [
      `${attacker.名号}欲催动「${skillName}」，`,
      `却见虚空中的九秘道痕骤然发亮！`,
      `「九秘合一，万法皆封！」`,
      `帝尊法旨镇压万道，秘法被强行压制！`,
      `${attacker.名号}道则紊乱，秘法反噬！`
    ];
    
    // 5. 添加战斗日志（带错误处理）
    try {
      await addBattleLog(...suppressionMsgs);
    } catch (logErr) {
      console.error('添加压制文案失败:', logErr);
      // 尝试简化日志
      await addBattleLog(`${attacker.名号}的九秘功法被帝尊压制！`);
    }
    
    // 6. 计算反噬伤害（最大血量的10%）
    const backlashDamage = Math.trunc(attacker.血量上限 * 0.1);
    
    // 7. 应用伤害（带边界检查）
    attacker.当前血量 = Math.max(0, ensureNumber(attacker.当前血量) - backlashDamage);
    
    // 8. 添加伤害日志（带错误处理）
    try {
      await addBattleLog(
        `秘法反噬造成${bigNumberTransform(backlashDamage)}点道伤！`,
        `剩余血量：${bigNumberTransform(attacker.当前血量)}`
      );
    } catch (logErr) {
      console.error('添加伤害日志失败:', logErr);
    }
    
    return true;
  } catch (err) {
    console.error('九秘压制检测发生严重错误:', err);
    return false;
  }
}

