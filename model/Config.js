import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { __dirname } from '../app.config.js';

class Config {
  /**
   * 获取用户自己配置的配置文件信息
   * @param {string} app - 应用名称
   * @param {string} name - 配置文件名
   * @returns {object} 配置对象
   */
  getConfig(app, name) {
    const file = this.getConfigPath(app, name);
    if (!fs.existsSync(file)) {
      return {};
    }
    const data = YAML.parse(fs.readFileSync(file, 'utf8'));
    return data;
  }

  /**
   * 保存配置到文件
   * @param {string} app - 应用名称
   * @param {string} name - 配置文件名
   * @param {object} config - 配置对象
   */
  setConfig(app, name, config) {
    const file = this.getConfigPath(app, name);
    const yamlStr = YAML.stringify(config);
    
    // 确保目录存在
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(file, yamlStr, 'utf8');
  }

  /**
   * 获取配置文件路径
   * @param {string} app - 应用名称
   * @param {string} name - 配置文件名
   * @returns {string} 配置文件完整路径
   */
  getConfigPath(app, name) {
    return path.join(__dirname, 'config', app, `${name}.yaml`);
  }
}

export default new Config();