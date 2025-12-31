import base from './base.js';
import xiuxianCfg from './Config.js';

export default class Help3 extends base {
  constructor(e) {
    super(e);
    this.model = 'huodonghelp';
  }

  static async huodonghelp(e) {
    let html = new Help3(e);
    return await html.huodonghelp();
  }

  async huodonghelp() {
    let helpData = xiuxianCfg.getConfig('help', 'huodonghelp');
    let versionData = xiuxianCfg.getConfig('version', 'version');
    const version =
      (versionData && versionData.length && versionData[0].version) || '1.0.4';
    const version_name =
      (versionData && versionData.length && versionData[0].name) || '1.0.4';
    return {
      ...this.screenData,
      saveId: 'help',
      version: version,
      version_name: version_name,
      helpData,
    };
  }

}
