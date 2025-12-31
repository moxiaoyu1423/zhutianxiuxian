import fs from 'fs';
import path from 'path';
import { plugin, config } from '../../api/api.js';
import { __PATH } from '../../model/xiuxian.js';

export class BackUp extends plugin {
  constructor() {
    super({
      name: 'BackUp',
      dsc: '存档备份',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: '^#备份存档$',
          fnc: 'saveBackUp',
        },
        {
          reg: '^#存档列表$',
          fnc: 'checkBackUp',
        },
        {
          reg: '^#读取存档(.*)',
          fnc: 'loadBackUp',
        },
      ],
    });
    this.saving = false;
    this.task = {
      cron: config.getConfig('task', 'task').AutoBackUpTask,
      name: '修仙备份存档Task',
      fnc: this.saveBackUp,
    };
  }

  async saveBackUp(e) {
    let opentime = new Date().getTime();
    if (e && !e.isMaster) {
      e.reply('只有主人可以执行操作');
      return false;
    }
    try {
      logger.info("修仙：备份存档");
      await e?.reply('开始备份喵~');

      // 修正后的路径键名列表（确保与__PATH完全一致）
      const needSave = [
        'player_path',    // 玩家数据
        'najie_path',     // 纳戒数据
        'equipment_path', // 装备数据
        'danyao_path',    // 丹药数据
        'association',    // 宗门数据
        'Exchange',       // 冲水堂
        'qinmidu',       // 亲密度
        'duanlu',        // 煅炉
        'shitu',         // 师徒
        'tiandibang',    // 天地榜
        'custom',        // 命名装备
        'shop',          // 洗劫
        'temp_path',     // 缓存
        'renwu',         // 每日任务
        'mijing',        // 秘境
        'inner_world_path' // 小世界
      ].filter(key => {
        if (!__PATH[key]) {
          logger.warn(`配置中缺少路径定义: ${key}`);
          return false;
        }
        return true;
      });

      if (needSave.length === 0) {
        e?.reply('没有有效的备份路径配置');
        return false;
      }

      // 收集文件数据
      const dataFname = [];
      const dataProm = [];
      for (let i = 0; i < needSave.length; i++) {
        const currentPath = __PATH[needSave[i]];
        if (!fs.existsSync(currentPath)) {
          logger.warn(`路径不存在: ${currentPath}`);
          dataFname.push([]);
          dataProm.push([]);
          continue;
        }

        let mingzi = fs.readdirSync(currentPath).filter(fn => fn.endsWith('.json'));
        dataFname.push(mingzi);
        
        let shujv = [];
        for (let j = 0; j < mingzi.length; j++) {
          shujv[j] = fs.promises.readFile(`${currentPath}/${mingzi[j]}`);
          if (j % 100 === 99) shujv = await Promise.all(shujv);
        }
        shujv = await Promise.all(shujv);
        dataProm.push(shujv);
      }

      // redis备份
      const redisObj = {};
      const redisKeys = await redis.keys('xiuxian:*');
      const redisTypes = await Promise.all(
        redisKeys.map(key => redis.type(key))
      );
      const redisValues = await Promise.all(
        redisKeys.map((key, i) => {
          switch (redisTypes[i]) {
            case 'string':
              return redis.get(key);
            case 'set':
              return redis.sMembers(key);
          }
        })
      );
      redisKeys.forEach(
        (key, i) => (redisObj[key] = [redisTypes[i], redisValues[i]])
      );

      // 检查备份目录
      if (!fs.existsSync(__PATH.backup)) {
        fs.mkdirSync(__PATH.backup, { recursive: true });
      }

      const nowTimeStamp = Date.now();
      const saveFolder = `${__PATH.backup}/${nowTimeStamp}`;
      if (fs.existsSync(saveFolder)) {
        e?.reply('备份目录已存在，可能是系统时间问题');
        return;
      }
      fs.mkdirSync(saveFolder);

      // 执行备份写入
      const finishTask = [];
      for (let i = 0; i < needSave.length; i++) {
        if (dataFname[i].length === 0) continue;
        
        fs.mkdirSync(`${saveFolder}/${needSave[i]}`, { recursive: true });
        for (let j = 0; j < dataFname[i].length; j++) {
          let b = fs.promises.writeFile(
            `${saveFolder}/${needSave[i]}/${dataFname[i][j]}`,
            dataProm[i][j]
          );
          finishTask.push(b);
          if (j % 100 === 99) await Promise.all(finishTask);
        }
      }

      // 写入redis备份
      fs.writeFileSync(`${saveFolder}/redis.json`, JSON.stringify(redisObj));

      // 等待所有任务完成
      await Promise.all(finishTask);

      const timeStr = this.getTimeStr(nowTimeStamp);
      e?.reply(`存档备份成功喵~\n${timeStr}`);
      console.log("备份存档耗时：", new Date().getTime() - opentime);

      return false;
    } catch (err) {
      e?.reply(`备份失败惹喵...\n${err.message}`);
      logger.error('备份存档出错:', err);
      return false;
    }
  }

  async checkBackUp(e) {
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
      e.reply('只有主人可以执行操作');
      return false;
    }
    try {
      let backUpList = fs.readdirSync(__PATH.backup).filter(folderName => {
        const stat = fs.statSync(`${__PATH.backup}/${folderName}`);
        return folderName === `${Number(folderName)}` && stat.isDirectory();
      }).sort((a, b) => Number(b) - Number(a)); // 按时间倒序排序

      if (backUpList.length > 80) backUpList = backUpList.slice(0, 80);

      const messageList = backUpList.map((folder, index) => ({
        message: `${index + 1}：${this.getTimeStr(folder)}`,
        nickname: Bot.nickname,
        user_id: Bot.uin,
      }));

      if (messageList.length === 0) {
        e.reply('暂无存档备份');
        return false;
      }

      e.reply(await Bot.makeForwardMsg(messageList));
      return false;
    } catch (err) {
      await e.reply(`查看存档列表失败，${err.message}`);
      logger.error('查看存档列表出错:', err);
      return false;
    }
  }

  async loadBackUp(e) {
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) {
      e.reply('只有主人可以执行操作');
      return false;
    }

    const saveDataNum = Number(e.msg.replace('#读取存档', '').trim());
    if (isNaN(saveDataNum) || saveDataNum < 1 || saveDataNum > 80) {
      e.reply('正确格式：#读取存档[1~80]\n如：#读取存档18');
      return false;
    }

    try {
      await e.reply('正在自动备份当前存档...');
      await this.saveBackUp(e);

      await e.reply('开始读取存档...');
      let backUpList = fs.readdirSync(__PATH.backup).filter(folderName => {
        const stat = fs.statSync(`${__PATH.backup}/${folderName}`);
        return folderName === `${Number(folderName)}` && stat.isDirectory();
      }).sort((a, b) => Number(b) - Number(a));

      if (backUpList.length > 80) backUpList = backUpList.slice(0, 80);
      if (saveDataNum > backUpList.length) {
        e.reply('该存档不存在');
        return false;
      }

      const backUpPath = `${__PATH.backup}/${backUpList[saveDataNum - 1]}`;
      if (!fs.existsSync(backUpPath)) {
        e.reply('该存档已损坏');
        return false;
      }

      const needLoad = [
        'player_path', 'najie_path', 'equipment_path', 'danyao_path',
        'association', 'Exchange', 'qinmidu', 'duanlu', 'shitu', 'tiandibang',
        'custom', 'shop', 'temp_path', 'renwu', 'mijing', 'inner_world_path'
      ].filter(key => __PATH[key]); // 过滤不存在的路径

      // 读取备份数据
      const backupData = {};
      for (const key of needLoad) {
        const backupDir = `${backUpPath}/${key}`;
        if (!fs.existsSync(backupDir)) continue;

        const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
        backupData[key] = {
          files: files,
          contents: await Promise.all(
            files.map(file => fs.promises.readFile(`${backupDir}/${file}`, 'utf8'))
          )
        };
      }

      // 恢复数据
      const restoreTasks = [];
      for (const key of needLoad) {
        if (!backupData[key]) continue;

        // 清空原目录
        const originalDir = __PATH[key];
        const originalFiles = fs.readdirSync(originalDir).filter(f => f.endsWith('.json'));
        for (const file of originalFiles) {
          restoreTasks.push(fs.promises.unlink(`${originalDir}/${file}`));
        }

        // 写入备份数据
        for (let i = 0; i < backupData[key].files.length; i++) {
          restoreTasks.push(
            fs.promises.writeFile(
              `${originalDir}/${backupData[key].files[i]}`,
              backupData[key].contents[i]
            )
          );
        }
      }

      // 恢复redis数据
      const redisBackupPath = `${backUpPath}/redis.json`;
      if (fs.existsSync(redisBackupPath)) {
        const redisData = JSON.parse(fs.readFileSync(redisBackupPath, 'utf8'));
        const redisKeys = await redis.keys('xiuxian:*');
        await Promise.all(redisKeys.map(key => redis.del(key)));

        for (const [key, [type, value]] of Object.entries(redisData)) {
          if (type === 'string') {
            await redis.set(key, value);
          } else if (type === 'set') {
            await redis.sAdd(key, value);
          }
        }
      }

      await Promise.all(restoreTasks);
      const timeStr = this.getTimeStr(backUpList[saveDataNum - 1]);
      e.reply(`存档已读取：${timeStr}`);

      return false;
    } catch (err) {
      e.reply(`读取失败，${err.message}`);
      logger.error('读取存档出错:', err);
      return false;
    }
  }

  getTimeStr(timeStamp) {
    return new Date(Number(timeStamp)).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}