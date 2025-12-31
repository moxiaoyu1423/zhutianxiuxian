import base from './base.js';
import xiuxianCfg from './Config.js';

export default class Help3 extends base {
  constructor(e) {
    super(e);
    this.model = 'zhutianhelp';
  }

  // 将静态方法名改为 zhutianhelp
  static async zhutianhelp(e) {
    let html = new Help3(e);
    return await html.zhutianhelp(); // 调用实例方法
  }

  // 将实例方法名改为 zhutianhelp
  async zhutianhelp() {
    let helpData = xiuxianCfg.getConfig('help', 'zhutianhelp');
    let versionData = xiuxianCfg.getConfig('version', 'version');
    const version =
      (versionData && versionData.length && versionData[0].version) || '1.0.4';
    const version_name =
      (versionData && versionData.length && versionData[0].name) || '1.0.4';
    return {
      ...this.screenData,
      saveId: 'zhutianhelp',
      version: version,
      version_name: version_name,
      helpData,
    };
  }
}