import fs from 'fs';
import Config from './Config.js';
import path from 'path';
import { AppName } from '../app.config.js';
import schedule from 'node-schedule';
/*
  数据封装
 */
class XiuxianData {
  constructor() {
    //获取配置文件参数
    this.configData = Config.getConfig('version', 'version');

    //文件路径参数
    //插件根目录
    const __dirname =
      path.resolve() + path.sep + 'plugins' + path.sep + AppName;
   this.filePathMap = {
     player: path.join(__dirname, '/resources/data/xiuxian_player'), //用户数据
     equipment: path.join(__dirname, '/resources/data/xiuxian_equipment'),
     najie: path.join(__dirname, '/resources/data/xiuxian_najie'),
     lib: path.join(__dirname, '/resources/data/item'),
     Timelimit: path.join(__dirname, '/resources/data/Timelimit'), //限定
     Level: path.join(__dirname, '/resources/data/Level'), //境界
     inner_world: path.join(__dirname, '/resources/data/inner_world'),
     association: path.join(__dirname, '/resources/data/association'),
     occupation: path.join(__dirname, '/resources/data/occupation'),
     givename: path.join(__dirname, '/resources/data/custom'),
      daofaList: path.join(__dirname, '/resources/data/daofa_list.json'),
      weimianList: path.join(__dirname, '/resources/data/位面.json'), // 去掉逗号
    
   };
    this.lib_path = this.filePathMap.lib;
    this.givename_path=this.filePathMap.givename;
    this.Timelimit = this.filePathMap.Timelimit;
    this.Level = this.filePathMap.Level;
    this.Occupation = this.filePathMap.occupation;
     // 确保所有目录存在
    this.ensureDirsExist();
    
    // 初始化道法仙术定时任务
    this.initDaofaTask();
    

  }
  
  // 确保所有数据目录存在
  ensureDirsExist() {
    Object.values(this.filePathMap).forEach(filePath => {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // 初始化道法列表文件
    if (!fs.existsSync(this.filePathMap.daofaList)) {
      fs.writeFileSync(this.filePathMap.daofaList, '{}');
    }
  

        //加载怪物列表
        this.monster_list = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/怪物列表.json`));
        this.monster_list1 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/怪物列表筑基.json`));
        this.monster_list2 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/怪物列表金丹.json`));
        this.monster_list3 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/怪物列表化神.json`));
        this.monster_list4 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/怪物列表合体.json`));
        this.monster_list5 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/怪物列表大乘.json`));
        this.monster_list6 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/怪物列表地仙.json`));
        this.monster_list7 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/怪物列表小千世界.json`));
        this.monster_list8 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/怪物列表大千世界.json`));
        this.monster_list9 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/诸天怪物列表.json`));
        this.monster_list10 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/真魔怪物列表.json`));
        this.monster_list11 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/生死道天怪物列表.json`));
        this.monster_list12 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/荒古禁地怪物列表.json`));
        this.monster_list13 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/光阴之外怪物列表.json`));
        this.monster_list14 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/太初古矿怪物列表.json`));
        this.monster_list15 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/北斗星紫山怪物列表.json`));
        this.monster_list16 = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/神域怪物列表.json`));
        this.monster_list_huodong = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/界海怪物列表.json`));
        this.monster_list_jieyin = JSON.parse(fs.readFileSync(`${this.lib_path}/怪物/接引古殿怪物列表.json`));
         this.yaochishangdian = JSON.parse(fs.readFileSync(`${this.lib_path}/势力商店/瑶池商店.json`));
        this.yaoguangshangdian = JSON.parse(fs.readFileSync(`${this.lib_path}/势力商店/摇光商店.json`)); 
          this.jianyunhaishangdian = JSON.parse(fs.readFileSync(`${this.lib_path}/势力商店/剑云海商店.json`));
 //加载时间长河列表
          this.shijianchanghe_list = JSON.parse(fs.readFileSync(`${this.lib_path}/副本/时间长河列表.json`));
     //加载材料列表
    this.cailiao_list = JSON.parse(fs.readFileSync(`${this.lib_path}/材料列表.json`));

    //练气境界
    this.Level_list = JSON.parse(
      fs.readFileSync(`${this.Level}/练气境界.json`)
    );
        //练气境界
    this.Levelyuanshen_list = JSON.parse(
      fs.readFileSync(`${this.Level}/元神境界.json`)
    );
    //秘境体系
      this.Levelmijing_list = JSON.parse(
      fs.readFileSync(`${this.Level}/秘境体系.json`));
          //神慧体系
      this.shenhui_list = JSON.parse(
      fs.readFileSync(`${this.Level}/神慧体系.json`));
          //仙古今世法
      this.xiangujinshi_list = JSON.parse(
      fs.readFileSync(`${this.Level}/仙古今世法.json`));

    //练体境界
    this.LevelMax_list = JSON.parse(
      fs.readFileSync(`${this.Level}/炼体境界.json`)
    );
    
    //加载装备列表
    this.equipment_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/装备列表.json`)
    );
        //加载帝兵列表
    this.dibing_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/帝兵列表.json`)
    );
            //加载特殊装备列表
    this.tszb_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/特殊装备列表.json`)
    );
    //加载丹药列表
    this.danyao_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/丹药列表.json`)
    );
    //加载炼丹师丹药列表
    this.newdanyao_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/炼丹师丹药.json`)
    );
    //加载道具列表
    this.daoju_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/道具列表.json`)
    );
    //加载食材列表
        this.shicai_list = JSON.parse(fs.readFileSync(`${this.lib_path}/食材列表.json`));
        //加载mc合成列表
        this.hecheng_list = JSON.parse(fs.readFileSync(`${this.lib_path}/合成列表.json`));
                //加载位面boss列表
        this.weimiantianjiao_list = JSON.parse(fs.readFileSync(`${this.lib_path}/位面boss列表.json`));
               //加载剧情人物列表
        this.juqingrenwu_list = JSON.parse(fs.readFileSync(`${this.lib_path}/剧情人物列表.json`));
              //加载成就列表
        this.chengjiu_list = JSON.parse(fs.readFileSync(`${this.lib_path}/成就列表.json`));
         //加载mc孵化列表
         this.fuhua_list = JSON.parse(fs.readFileSync(`${this.lib_path}/孵化列表.json`));
        //加载mc加工列表
        this.jiagong_list = JSON.parse(fs.readFileSync(`${this.lib_path}/加工列表.json`));
   // 加载功法列表
this.gongfa_list = JSON.parse(
  fs.readFileSync(`${this.lib_path}/功法列表.json`)
);
   //加载宝石列表
  this.baoshi_list = JSON.parse(
    fs.readFileSync(`${this.lib_path}/宝石.json`));
    //加载灵根列表
    this.talent_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/灵根列表.json`)
    );
  this.dijingList =  JSON.parse(
      fs.readFileSync(`${this.lib_path}/玩家自创帝经.json`));

    //加载草药列表
    this.caoyao_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/草药列表.json`)
    );
//加载列表
       this.heiandongluandizhan = JSON.parse(fs.readFileSync(`${this.lib_path}/黑暗动乱帝战奖励.json`));
    //加载地点列表
    this.didian_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/副本/地点列表.json`)
    );
        this.jiutianshidi_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/副本/九天十地.json`)
    );
    //加载寻宝列表
    this.xunbao_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/寻宝列表.json`)
    );
     //加载遮天列表
    this.zhetian_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/副本/遮天宇宙列表.json`)
    );
         //加载下界八域列表
    this.xiajie_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/副本/下界八域列表.json`)
    );
     //加载界海列表
    this.jiehai_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/副本/界海列表.json`)
    );
    //加载上苍之上列表
    this.shangcang_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/副本/上苍之上列表.json`)
    );
     //加载hezi列表
    this.hezi_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/盒子列表.json`)
    );
    //加载洞天福地列表
    this.bless_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/洞天福地.json`)
    );
    //加载宗门秘境
    this.guildSecrets_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/副本/宗门秘境.json`)
    );
    //加载禁地列表
    this.forbiddenarea_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/副本/禁地列表.json`)
    );
    //加载仙域列表
    this.Fairyrealm_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/副本/仙境列表.json`)
    );
    //加载限定仙府
    this.timeplace_list = JSON.parse(
      fs.readFileSync(`${this.Timelimit}/限定仙府.json`)
    );
    //加载限定功法
    this.timegongfa_list = JSON.parse(
      fs.readFileSync(`${this.Timelimit}/限定功法.json`)
    );
    //加载限定装备
    this.timeequipmen_list = JSON.parse(
      fs.readFileSync(`${this.Timelimit}/限定装备.json`)
    );
    //加载限定丹药
    this.timedanyao_list = JSON.parse(
      fs.readFileSync(`${this.Timelimit}/限定丹药.json`)
    );
    //加载职业列表
    this.occupation_list = JSON.parse(
      fs.readFileSync(`${this.Occupation}/职业列表.json`)
    );
    //加载职业经验列表
    this.occupation_exp_list = JSON.parse(
      fs.readFileSync(`${this.Occupation}/experience.json`)
    );
    //加载丹方列表
    this.danfang_list = JSON.parse(
      fs.readFileSync(`${this.Occupation}/炼丹配方.json`)
    );
    //加载制符列表
    this.zhizuo_list = JSON.parse(
      fs.readFileSync(`${this.Occupation}/制符列表.json`)
    );
    //加载图纸列表
    this.tuzhi_list = JSON.parse(
      fs.readFileSync(`${this.Occupation}/装备图纸.json`)
    );

    //加载八品功法列表
    this.bapin = JSON.parse(fs.readFileSync(`${this.lib_path}/八品.json`));
    //加载星阁列表
    this.xingge = JSON.parse(
      fs.readFileSync(`${this.lib_path}/星阁拍卖行列表.json`)
    );
        //加载星阁列表
    this.xingge2 = JSON.parse(
      fs.readFileSync(`${this.lib_path}/星阁内场拍卖行.json`)
    );
    //加载小世界列表
    this.xiaoshijie = JSON.parse(
      fs.readFileSync(`${this.lib_path}/小世界列表.json`));
    //天地
    this.tianditang = JSON.parse(
      fs.readFileSync(`${this.lib_path}/商店/天地堂.json`)
    );
        //加载商品列表
    this.commodities_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/商店/商品列表.json`)
    );
    this.tianjige_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/商店/天机阁.json`)
    );
        this.tianjige2_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/商店/天机阁符楼.json`)
    );
        //师徒积分
    this.shitujifen = JSON.parse(
      fs.readFileSync(`${this.lib_path}/商店/积分商城.json`)
    );
    //仙宠
    this.changzhuxianchon = JSON.parse(
      fs.readFileSync(`${this.lib_path}/常驻仙宠.json`)
    );
        //仙宠
    this.tupoxianchon = JSON.parse(
      fs.readFileSync(`${this.lib_path}/突破仙宠.json`)
    );
    this.xianchon = JSON.parse(
      fs.readFileSync(`${this.lib_path}/仙宠列表.json`)
    );
    this.xianchonkouliang = JSON.parse(
      fs.readFileSync(`${this.lib_path}/仙宠口粮列表.json`)
    );
     this.xianchonxunbao = JSON.parse(
      fs.readFileSync(`${this.lib_path}/仙宠探索列表.json`)
    );
     this.xianchonkouliang2 = JSON.parse(
      fs.readFileSync(`${this.lib_path}/高级仙宠口粮列表.json`)
    );
    //npc
    this.npc_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/npc列表.json`)
    );
    //
    this.shop_list = JSON.parse(
      fs.readFileSync(`${this.lib_path}/shop列表.json`)
    );

    this.qinlong = JSON.parse(fs.readFileSync(`${this.Timelimit}/青龙.json`));
    this.qilin = JSON.parse(fs.readFileSync(`${this.Timelimit}/麒麟.json`));
    this.xuanwu = JSON.parse(
      fs.readFileSync(`${this.Timelimit}/玄武朱雀白虎.json`)
    );
    //魔界
    this.mojie = JSON.parse(fs.readFileSync(`${this.lib_path}/魔界列表.json`));
    //兑换码
    this.duihuan = JSON.parse(
      fs.readFileSync(`${this.lib_path}/兑换列表.json`)
    );
    //神界
    this.shenjie = JSON.parse(
      fs.readFileSync(`${this.lib_path}/神界列表.json`)
    );
    //加载技能列表
    this.jineng1 = JSON.parse(
      fs.readFileSync(`${this.lib_path}/技能列表/技能列表1.json`)
    );
    this.jineng2 = JSON.parse(
      fs.readFileSync(`${this.lib_path}/技能列表/技能列表2.json`)
    );
      this.jineng3 = JSON.parse(
      fs.readFileSync(`${this.lib_path}/技能列表/技能列表3.json`)
    );
      this.teshujineng = JSON.parse(
      fs.readFileSync(`${this.lib_path}/技能列表/特殊技能.json`)
    );
    //加载强化列表
    this.qianghua = JSON.parse(
      fs.readFileSync(`${this.lib_path}/强化列表.json`)
    );
    //锻造材料列表
    this.duanzhaocailiao = JSON.parse(
      fs.readFileSync(`${this.lib_path}/锻造材料.json`)
    );
    //锻造武器列表
    this.duanzhaowuqi = JSON.parse(
      fs.readFileSync(`${this.lib_path}/锻造武器.json`)
    );
    //锻造护具列表
    this.duanzhaohuju = JSON.parse(
      fs.readFileSync(`${this.lib_path}/锻造护具.json`)
    );
    //锻造宝物列表
    this.duanzhaobaowu = JSON.parse(
      fs.readFileSync(`${this.lib_path}/锻造宝物.json`)
    );
    //隐藏灵根列表
    this.yincang = JSON.parse(
      fs.readFileSync(`${this.lib_path}/隐藏灵根.json`)
    );
     //命名武器
     this.namegive = JSON.parse(
      fs.readFileSync(`${this.givename_path}/custom.json`)
    );
    //锻造杂类列表
    this.zalei = JSON.parse(fs.readFileSync(`${this.lib_path}/锻造杂类.json`));

    //加载卡面列表
		this.kamian = JSON.parse(fs.readFileSync(`${this.lib_path}/纳戒玄影.json`));
		this.kamian3 = JSON.parse(fs.readFileSync(`${this.lib_path}/练气玄影.json`));
    //加载卡池
    this.changzhu = JSON.parse(fs.readFileSync(`${this.lib_path}/常驻.json`));
		this.xianding = JSON.parse(fs.readFileSync(`${this.lib_path}/限定.json`));
    this.tuanbenjiangli = JSON.parse(fs.readFileSync(`${this.lib_path}/团本奖励列表.json`));
    //BOSS掉落列表
    this.GroupBossReward_list = JSON.parse(fs.readFileSync(`${this.lib_path}/GroupBoss.json`));
  }
   /**
   * 获取道法仙术列表
   * @returns {Object} 道法仙术玩家列表
   */
  getDaofaList() {
    const filePath = this.filePathMap.daofaList;
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取道法仙术列表失败:', error);
      return {};
    }
  }
  
  /**
   * 保存道法仙术列表
   * @param {Object} list 道法仙术玩家列表
   */
  saveDaofaList(list) {
    const filePath = this.filePathMap.daofaList;
    try {
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
    } catch (error) {
      console.error('保存道法仙术列表失败:', error);
    }
  }
  
  /**
   * 添加玩家到道法仙术列表
   * @param {string} qq 玩家QQ
   */
  addToDaofaList(qq) {
    const list = this.getDaofaList();
    list[qq] = true;
    this.saveDaofaList(list);
  }
  
  /**
   * 从道法仙术列表中移除玩家
   * @param {string} qq 玩家QQ
   */
  removeFromDaofaList(qq) {
    const list = this.getDaofaList();
    if (list[qq]) {
      delete list[qq];
      this.saveDaofaList(list);
    }
  }
  
  /**
   * 初始化道法仙术定时任务
   */
  initDaofaTask() {
    // 避免重复初始化
    if (this.daofaTaskInitialized) return;
    
    // 每天00:00执行扣减
    schedule.scheduleJob('0 0 0 * * *', () => {
      console.log('开始执行道法仙术每日扣减任务');
      const now = new Date();
      const nowTime = now.getTime();
      const list = this.getDaofaList();
      let updated = false;
      
      for (const qq of Object.keys(list)) {
        try {
          // 检查玩家是否存在
          if (!this.existData('player', qq)) {
            this.removeFromDaofaList(qq);
            updated = true;
            continue;
          }
          
          // 读取玩家数据
          const player = this.getData('player', qq);
          
          // 检查玩家是否有道法仙术且未过期
          if (!player.daofaxianshu_endtime || player.daofaxianshu_endtime <= nowTime) {
            // 如果已经过期，则移除并更新状态
            player.daofa = "未开启";
            player.daofaxianshu_endtime = 0;
            this.setData('player', qq, player);
            this.removeFromDaofaList(qq);
            updated = true;
            continue;
          }
          
          // 扣除一天（86400000毫秒）
          player.daofaxianshu_endtime -= 86400000;
          
          // 检查扣除后是否过期
          if (player.daofaxianshu_endtime <= nowTime) {
            player.daofa = "未开启";
            player.daofaxianshu_endtime = 0;
            this.setData('player', qq, player);
            this.removeFromDaofaList(qq);
          } else {
            // 更新剩余天数显示
            const remainingDays = Math.round((player.daofaxianshu_endtime - nowTime) / 86400000 * 10) / 10;
            player.daofa = `已开启，当前剩余${remainingDays}天`;
            this.setData('player', qq, player);
          }
          
          updated = true;
          
        } catch (error) {
          console.error(`处理玩家 ${qq} 的道法仙术时出错:`, error);
        }
      }
      
      if (updated) {
        // 如果有更新，保存列表（主要是为了移除过期玩家）
        this.saveDaofaList(list);
      }
      
      console.log('道法仙术每日扣减任务完成');
    });
    
    this.daofaTaskInitialized = true;
    console.log('道法仙术定时任务已初始化');
  }
  
  /**
   * 开通道法仙术
   * @param {string} qq 玩家QQ
   * @returns {boolean} 是否成功
   */
  async openDaofaForPlayer(qq) {
    if (!this.existData('player', qq)) {
      console.error(`玩家 ${qq} 数据不存在`);
      return false;
    }
    
    const nowTime = new Date().getTime();
    const player = this.getData('player', qq);
    
    // 设置道法仙术状态
    player.daofaxianshu = 2;
    const duration = 2592000000; // 30天的毫秒数
    
    // 添加到道法列表
    this.addToDaofaList(qq);
    
    // 更新到期时间
    if (!player.daofaxianshu_endtime || player.daofaxianshu_endtime < nowTime) {
      player.daofaxianshu_endtime = nowTime + duration;
    } else {
      player.daofaxianshu_endtime += duration;
    }
    
    // 计算剩余天数
    const remainingDays = Math.round((player.daofaxianshu_endtime - nowTime) / 86400000 * 10) / 10;
    player.daofa = `已开启，当前剩余${remainingDays}天`;
    
    // 保存玩家数据
    this.setData('player', qq, player);
    
    return true;
  }



  /**
   * 检测存档存在
   * @param file_path_type ["player" , "association" ]
   * @param file_name
   */
  existData(file_path_type, file_name) {
    let file_path;
    file_path = this.filePathMap[file_path_type];
    let dir = path.join(file_path + '/' + file_name + '.json');
    if (fs.existsSync(dir)) {
      return true;
    }
    return false;
  }
   /**
     * 
     * @param list  json文件名
     * @param path  路径
     */
   getlist(list,path) {
    // let path
    // path == this.lib_path = this.filePathMap.lib;
    // this.Timelimit = this.filePathMap.Timelimit;
    // this.Level = this.filePathMap.Level;
    // this.Occupation = this.filePathMap.occupation;
    // this.playerCopy = this.filePathMap.playerCopy_path;
    try {
            const filePath = `${path}/${list}`;
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
          } catch (error) {
            console.error('读取文件错误：' + error);
            return 'error';
          }
        }
     /**
 * 
 * @param list  json文件名
 * @param path  路径
 * @param data  getlist函数
 */
    writelist(list, path, data) {
    try {
    const filePath = `${path}/${list}`;
    const jsonData = JSON.stringify(data);
    fs.writeFileSync(filePath, jsonData, 'utf8', err => {
      console.log('写入成功', err);
    });
            } catch (error) {
              console.error('写入文件错误：' + error);
            }
          }

  /**
   * 获取文件数据(user_qq为空查询item下的file_name文件)
   * @param file_name  [player,equipment,najie]
   * @param user_qq
   */
  getData(file_name, user_qq) {
    let file_path;
    let dir;
    let data;
    if (user_qq) {
      //带user_qq的查询数据文件
      file_path = this.filePathMap[file_name];
      dir = path.join(file_path + '/' + user_qq + '.json');
    } else {
      //不带参数的查询item下文件
      file_path = this.filePathMap.lib;
      dir = path.join(file_path + '/' + file_name + '.json');
    }
    try {
      data = fs.readFileSync(dir, 'utf8');
    } catch (error) {
      logger.error('读取文件错误：' + error);
      return 'error';
    }
    //将字符串数据转变成json格式
    data = JSON.parse(data);
    return data;
  }
  // 添加新的自创帝经
  addCustomSutra(sutra) {
    // 首先，从文件加载当前的自创帝经列表（确保最新）
    const customSutras = this.loadCustomDiJing(); // 注意：之前没有这个方法，我们需要定义

    // 检查是否已有同名帝经
    const existing = customSutras.some(item => item.name === sutra.name);
    if (existing) {
      throw new Error(`已存在同名帝经: ${sutra.name}`);
    }

    // 添加新帝经
    customSutras.push(sutra);

    // 保存到文件
    this.saveCustomDiJing(customSutras);

    // 更新内存中的列表
    this.dijingList = customSutras;

    return true;
  }

  // 加载自创帝经列表（从文件读取）
  loadCustomDiJing() {
    const filePath = path.join(this.lib_path, '玩家自创帝经.json');
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('加载玩家自创帝经失败:', error);
      return [];
    }
  }

  // 保存自创帝经列表到文件
  saveCustomDiJing(customSutras) {
    const filePath = path.join(this.lib_path, '玩家自创帝经.json');
    try {
      fs.writeFileSync(filePath, JSON.stringify(customSutras, null, 2), 'utf8');
    } catch (error) {
      console.error('保存玩家自创帝经失败:', error);
      throw error; // 抛出异常，由调用者处理
    }
  }

  /**
   * 写入数据
   * @param file_name [player,equipment,najie]
   * @param user_qq
   * @param data
   */
  setData(file_name, user_qq, data) {
    let file_path;
    let dir;
    if (user_qq) {
      file_path = this.filePathMap[file_name];
      dir = path.join(file_path + '/' + user_qq + '.json');
    } else {
      file_path = this.filePathMap.lib;
      dir = path.join(file_path + '/' + file_name + '.json');
    }
    let new_ARR = JSON.stringify(data, '', '\t'); //json转string
    if (fs.existsSync(dir)) {
      fs.writeFileSync(dir, new_ARR, 'utf-8', err => {
        console.log('写入成功', err);
      });
    }
    return;
  }

  /**
   * 获取宗门数据
   * @param file_name  宗门名称
   */
  getAssociation(file_name) {
    let file_path;
    let dir;
    let data;
    file_path = this.filePathMap.association;
    dir = path.join(file_path + '/' + file_name + '.json');
    try {
      data = fs.readFileSync(dir, 'utf8');
    } catch (error) {
      logger.error('读取文件错误：' + error);
      return 'error';
    }
    //将字符串数据转变成json格式
    data = JSON.parse(data);
    return data;
  }

  /**
   * 写入宗门数据
   * @param file_name  宗门名称
   * @param data
   */
  setAssociation(file_name, data) {
    let file_path;
    let dir;
    file_path = this.filePathMap.association;
    dir = path.join(file_path + '/' + file_name + '.json');
    let new_ARR = JSON.stringify(data, '', '\t'); //json转string
    fs.writeFileSync(dir, new_ARR, 'utf-8', err => {
      console.log('写入成功', err);
    });
    return;
  }

}
export default new XiuxianData();
