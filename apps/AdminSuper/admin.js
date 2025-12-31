import { plugin, verc, config } from '../../api/api.js';
import { AppName } from '../../app.config.js';
import { exec } from 'child_process';
export class admin extends plugin {
  constructor() {
    super({
      name: '管理|更新插件',
      dsc: '管理和更新代码',
      event: 'message',
      priority: 400,
      rule: [
        {
          reg: '^#修仙(插件)?(强制)?更新',
          fnc: 'checkout',
        },
      ],
    });
  }
  async checkout(e) {
    const xiuxianConfig = config.getConfig('xiuxian', 'xiuxian');
    const masterList = xiuxianConfig.Master || [];
    const userQQ = e.user_id.toString().replace('qg_', '');
    if (!e.isMaster && !masterList.includes(userQQ)) return false;
    if (!verc({ e })) return false;
    const isForce = this.e.msg.includes('强制');
    let command = 'git  pull';
    if (isForce) {
      command =
        'git fetch --all && git reset --hard zhutianxiuxian && git  pull';
      this.e.reply('正在执行强制更新操作，请稍等');
    } else {
      this.e.reply('正在执行更新操作，请稍等');
    }
    exec(
      command,
      { cwd: `${process.cwd()}/plugins/${AppName}/` },
      function (error, stdout, stderr) {
        if (/(Already up[ -]to[ -]date|已经是最新的)/.test(stdout)) {
          e.reply('目前已经是最新版zhutianxiuxian了~');
          return false;
        }
        if (error) {
          e.reply(
            'zhutianxiuxian更新失败！\nError code: ' +
              error.code +
              '\n' +
              error.stack +
              '\n 请稍后重试。'
          );
          return false;
        }
        e.reply('更新成功,请[#重启]');
      }
    );
    return false;
  }
}
