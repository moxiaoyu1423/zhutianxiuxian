import base from './base.js';
import xiuxianCfg from './Config.js';

export default class Help extends base {
  constructor(e) {
    super(e);
    this.model = 'help';
    this.versionData = xiuxianCfg.getConfig('version', 'version');
  }

  static async get(e) {
    let html = new Help(e);
    return await html.getData();
  }

  static async gethelpcopy(e) {
    let html = new Help(e);
    return await html.getDatahelpcopy();
  }
  static async gethelpcopy2(e) {
    let html = new Help(e);
    return await html.getDatahelpcopy2();
  }
    static async xiaoshijiehelp(e) {
    let html = new Help(e);
    return await html.getDataxiaoshijie();
  }
      static async jichuhelp(e) {
    let html = new Help(e);
    return await html.getDatajichu();
  }
        static async linggenhelp(e) {
    let html = new Help(e);
    return await html.getDatalinggen();
  }
      static async zhiyehelp(e) {
    let html = new Help(e);
    return await html.getDatazhiye();
  }
  static async get_zhounian(e) {
    let html = new Help(e);
    return await html.getData_zhounian();
  }
  static async get_xinghai(e) {
    let html = new Help(e);
    return await html.getData_xinghai();
  }
  static async setup(e) {
    let html = new Help(e);
    return await html.Getset();
  }

  static async Association(e) {
    let html = new Help(e);
    return await html.GetAssociationt();
  }

  async getDatahelpcopy() {
    let helpData = xiuxianCfg.getConfig('help', 'helpcopy');
    return {
      ...this.screenData,
      saveId: 'help',
      version: this.versionData.version,
      helpData,
    };
  }

  async getDatahelpcopy2() {
    let helpData = xiuxianCfg.getConfig('help', 'help2');
    return {
      ...this.screenData,
      saveId: 'help',
      version: this.versionData.version,
      helpData,
    };
  }
  async getDataxiaoshijie() {
    let helpData = xiuxianCfg.getConfig('help', 'xiaoshijiehelp');
    return {
      ...this.screenData,
      saveId: 'help',
      version: this.versionData.version,
      helpData,
    };
  }
    async getDatajichu() {
    let helpData = xiuxianCfg.getConfig('help', 'jichuhelp');
    return {
      ...this.screenData,
      saveId: 'help',
      version: this.versionData.version,
      helpData,
    };
  }
      async getDatalinggen() {
    let helpData = xiuxianCfg.getConfig('help', 'linggenhelp');
    return {
      ...this.screenData,
      saveId: 'help',
      version: this.versionData.version,
      helpData,
    };
  }
    async getDatazhiye() {
    let helpData = xiuxianCfg.getConfig('help', 'zhiyehelp');
    return {
      ...this.screenData,
      saveId: 'help',
      version: this.versionData.version,
      helpData,
    };
  }
  async getData() {
    let helpData = xiuxianCfg.getConfig('help', 'help');
    return {
      ...this.screenData,
      saveId: 'help',
      version: this.versionData.version,
      helpData,
    };
  }

  async Getset() {
    let helpData = xiuxianCfg.getConfig('help', 'set');
    return {
      ...this.screenData,
      saveId: 'help',
      version: this.versionData.version,
      helpData,
    };
  }

  async GetAssociationt() {
    let helpData = xiuxianCfg.getConfig('help', 'Association');
    return {
      ...this.screenData,
      saveId: 'help',
      version: this.versionData.version,
      helpData,
    };
  }
async  get_zhutianhelp() {
    let helpData = xiuxianCfg.getConfig('help', 'zhutianhelp');
    this.model = 'zhutianhelp';
    return {
      ...this.screenData,
      saveId: 'zhutianhelp',
      version: this.versionData.version,
      helpData,
    };
  }
    async getData_xinghai() {
    let helpData = xiuxianCfg.getConfig('help', 'xinghai');
    this.model = 'xinghai';
    return {
      ...this.screenData,
      saveId: 'xinghai',
      version: this.versionData.version,
      helpData,
    };
    
  }
  async getData_zhounian() {
    let helpData = xiuxianCfg.getConfig('help', 'zhounianqing');
    this.model = 'zhounianqing';
    return {
      ...this.screenData,
      saveId: 'zhounianqing',
      version: this.versionData.version,
      helpData,
    };
    
  }
}
