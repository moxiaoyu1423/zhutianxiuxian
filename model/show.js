import base from './base.js';

export default class Game extends base {
  constructor(e) {
    super(e);
    this.model = 'show';
  }

  async get_playerData(myData) {
    this.model = 'player';
    return {
      ...this.screenData,
      saveId: 'player',
      ...myData,
    };
  }
  async get_player_pindao_Data(myData) {
    this.model = 'player_pindao';
    return {
      ...this.screenData,
      saveId: 'player_pindao',
      ...myData,
    };
  }
    async get_zhizuoData(myData) {
    this.model = 'zhizuo';
    return {
      ...this.screenData,
      saveId: 'zhizuo',
      ...myData,
    };
  }
  //我的任务
  async get_renwuData(myData) {
    this.model = 'renwu';
    return {
      ...this.screenData,
      saveId: 'renwu',
      ...myData,
    };
  }
  async get_equipmnetData3(myData) {
    this.model = 'equipment3';
    return {
      ...this.screenData,
      saveId: 'equipment3',
      ...myData,
    };
  }
  //师徒商城
  async get_shitujifenData(myData) {
    this.model = 'shitujifen';
    return {
      ...this.screenData,
      saveId: 'shitujifen',
      ...myData,
    };
  }
  //我的弟子
  async get_shituData(myData) {
    this.model = 'shitu';
    return {
      ...this.screenData,
      saveId: 'shitu',
      ...myData,
    };
  }
  //我的师门
  async get_shifuData(myData) {
    this.model = 'shifu';
    return {
      ...this.screenData,
      saveId: 'shifu',
      ...myData,
    };
  }
  //log
async get_xunbao_placeData(myData) {
  this.model = 'xunbao_place';
  return {
    ...this.screenData,
    saveId: 'get_xunbao_place',
    ...myData,
  };
}
  //log
async get_xianjing_placeData(myData) {
  this.model = 'xianjing_place';
  return {
    ...this.screenData,
    saveId: 'get_xianjing_place',
    ...myData,
  };
}
  //log
async get_zhetian_placeData(myData) {
  this.model = 'zhetian_place';
  return {
    ...this.screenData,
    saveId: 'get_zhetian_place',
    ...myData,
  };
}
async get_shangcang_placeData(myData) {
  this.model = 'shangcang_place';
  return {
    ...this.screenData,
    saveId: 'get_shangcang_place',
    ...myData,
  };
}
async get_xiajie_placeData(myData) {
  this.model = 'xiajie_place';
  return {
    ...this.screenData,
    saveId: 'get_xiajie_place',
    ...myData,
  };
}
async get_shangjie_placeData(myData) {
  this.model = 'shangjie_place';
  return {
    ...this.screenData,
    saveId: 'get_shangjie_place',
    ...myData,
  };
}
async get_lqpfData(myData) {
  this.model = 'lqpf';
  return {
    ...this.screenData,
    saveId: 'lqpf',
    ...myData,
  };
}
  //log
async get_jindi_placeData(myData) {
  this.model = 'jindi_place';
  return {
    ...this.screenData,
    saveId: 'get_jindi_place',
    ...myData,
  };
}
 //遗迹商店
  async get_yijishopData(myData) {
    this.model = 'yijishop';
    return {
      ...this.screenData,
      saveId: 'yijishop',
      ...myData,
    };
  }
    async get_yijishop2Data(myData) {
    this.model = 'yijishop2';
    return {
      ...this.screenData,
      saveId: 'yijishop2',
      ...myData,
    };
  }
  async get_gongfaData(myData) {
    this.model = 'gongfa';
    return {
      ...this.screenData,
      saveId: 'gongfa',
      ...myData,
    };
  }
    async get_duihuanData(myData) {
    this.model = 'duihuan';
    return {
      ...this.screenData,
      saveId: 'duihuan',
      ...myData,
    };
  }

  async get_hechengData(myData) {
    this.model = 'hecheng';
    return {
      ...this.screenData,
      saveId: 'hecheng',
      ...myData,
    };
  }
  async get_qiandaoData(myData) {
    this.model = 'xiuxianqiandao';
    return {
      ...this.screenData,
      saveId: 'xiuxianqiandao',
      ...myData,
    };
  }
  async get_neijingdiData(myData) {
    this.model = 'neijingdi';
    return {
      ...this.screenData,
      saveId: 'neijingdi',
      ...myData,
    };
  }
  async get_xigenData(myData) {
    this.model = 'xigen';
    return {
      ...this.screenData,
      saveId: 'xigen',
      ...myData,
    };
  }

  async get_chengjiuData(myData) {
    this.model = 'chengjiu';
    return {
      ...this.screenData,
      saveId: 'chengjiu',
      ...myData,
    };
  }

  async get_wmtjData(myData) {
    this.model = 'wmtj';
    return {
      ...this.screenData,
      saveId: 'wmtj',
      ...myData,
    };
  }

  async get_characterData(myData) {
    this.model = 'character';
    return {
      ...this.screenData,
      saveId: 'character',
      ...myData,
    };
  }

  async get_danyaoData(myData) {
    this.model = 'danyao';
    return {
      ...this.screenData,
      saveId: 'danyao',
      ...myData,
    };
  }
  async get_linggenData(myData) {
    this.model = 'linggen';
    return {
      ...this.screenData,
      saveId: 'linggen',
      ...myData,
    };
  }
  async get_xianchong(myData) {
    this.model = 'xianchong';
    return {
      ...this.screenData,
      saveId: 'xianchong',
      ...myData,
    };
  }

  async get_daojuData(myData) {
    this.model = 'daoju';
    return {
      ...this.screenData,
      saveId: 'daoju',
      ...myData,
    };
  }

  async get_wuqiData(myData) {
    this.model = 'wuqi';
    return {
      ...this.screenData,
      saveId: 'wuqi',
      ...myData,
    };
  }

  async get_playercopyData(myData) {
    this.model = 'playercopy';
    return {
      ...this.screenData,
      saveId: 'playercopy',
      ...myData,
    };
  }

  async get_equipmnetData(myData) {
    this.model = 'equipment';
    return {
      ...this.screenData,
      saveId: 'equipment',
      ...myData,
    };
  }
  async get_equipmnetData2(myData) {
    this.model = 'equipment2';
    return {
      ...this.screenData,
      saveId: 'equipment2',
      ...myData,
    };
  }
  async get_najieData(myData) {
    this.model = 'najie';
    return {
      ...this.screenData,
      saveId: 'najie',
      ...myData,
    };
  }
  
  async get_najie_category_Data(myData) {
    this.model = 'najie-category';
    return {
      ...this.screenData,
      saveId: 'najie-category',
      ...myData,
    };
  }
  async get_najie_chouchou_Data(myData) {
    this.model = 'najie_copy';
    return {
      ...this.screenData,
      saveId: 'najie_copy',
      ...myData,
    };
  }
  async get_stateData(myData) {
    this.model = 'state';
    return {
      ...this.screenData,
      saveId: 'state',
      ...myData,
    };
  }

  async get_stateDatazhiye(myData) {
    this.model = 'statezhiye';
    return {
      ...this.screenData,
      saveId: 'statezhiye',
      ...myData,
    };
  }
    async get_geniusData(myData) {
    this.model = 'genius';
    return {
      ...this.screenData,
      saveId: 'genius',
      ...myData,
    };
  }
  async get_statemaxData(myData) {
    this.model = 'statemax';
    return {
      ...this.screenData,
      saveId: 'statemax',
      ...myData,
    };
  }
    async get_mijingData(myData) {
    this.model = 'mijing';
    return {
      ...this.screenData,
      saveId: 'mijing',
      ...myData,
    };
  }
      async get_xiangujinshiData(myData) {
    this.model = 'xiangujinshi';
    return {
      ...this.screenData,
      saveId: 'xiangujinshi',
      ...myData,
    };
  }
  async get_dungeon_drop_template(myData) {
    this.model = 'dungeon_drop';
    return {
      ...this.screenData,
      saveId: 'dungeon_drop',
      ...myData,
    };
  }
 // 添加小世界数据方法
  async get_xiaoshijieData(myData) {
    this.model = 'xiaoshijie';
    return {
        ...this.screenData,
        saveId: 'xiaoshijie',
        ...myData,
        // 添加时间流速比率计算
        timeRatio: this.calculateTimeRatio(myData.attributes.时间流速),
        // 添加当前时间
        now: new Date().toLocaleString()
    };
  }

  // 辅助方法：计算时间流速比率
  calculateTimeRatio(timeFlow) {
    const parts = timeFlow.split(':');
    return parseInt(parts[1]) / parseInt(parts[0]);
  }
  //searchforum
  async get_searchforumData(myData) {
    this.model = 'searchforum';
    return {
      ...this.screenData,
      saveId: 'searchforum',
      ...myData,
    };
  }
  //天地堂
  async get_tianditangData(myData) {
    this.model = 'tianditang';
    return {
      ...this.screenData,
      saveId: 'tianditang',
      ...myData,
    };
  }
    //传闻
    async get_chuanwen(myData) {
      this.model = 'chuanwen';
      return {
        ...this.screenData,
        saveId: 'chuanwen',
        ...myData,
      };
    }
  //悬赏名单
  async get_msg(myData) {
    this.model = 'msg';
    return {
      ...this.screenData,
      saveId: 'msg',
      ...myData,
    };
  }
    //村庄列表
  async get_msg2(myData) {
    this.model = 'msg2';
    return {
      ...this.screenData,
      saveId: 'msg2',
      ...myData,
    };
  }
  //我的宗门
  async get_associationData(myData) {
    this.model = 'association';
    return {
      ...this.screenData,
      saveId: 'association',
      ...myData,
    };
  }

  //shop
  async get_didianData(myData) {
    this.model = 'shop';
    return {
      ...this.screenData,
      saveId: 'shop',
      ...myData,
    };
  }

  //宗门
  async get_zongmeng_data(myData) {
    this.model = 'zongmeng';
    return {
      ...this.screenData,
      saveId: 'zongmeng',
      ...myData,
    };
  }

  //temp
  async get_tempData(myData) {
    this.model = 'temp';
    return {
      ...this.screenData,
      saveId: 'temp',
      ...myData,
    };
  }

  //log
  async get_logData(myData) {
    this.model = 'log';
    return {
      ...this.screenData,
      saveId: 'log',
      ...myData,
    };
  }
   //log
  async get_log3Data(myData) {
    this.model = 'log3';
    return {
      ...this.screenData,
      saveId: 'log3',
      ...myData,
    };
  }
  //柠檬堂
  async get_ningmenghomeData(myData) {
    this.model = 'ningmenghome';
    return {
      ...this.screenData,
      saveId: 'ningmenghome',
      ...myData,
    };
  }
  //瑶池
  async get_yaochiData(myData) {
    this.model = 'yaochi';
    return {
      ...this.screenData,
      saveId: 'yaochi',
      ...myData,
    };
  }
    //摇光
  async get_yaoguangData(myData) {
    this.model = 'yaoguang';
    return {
      ...this.screenData,
      saveId: 'yaoguang',
      ...myData,
    };
  }
    //剑云海
  async get_jianyunhaiData(myData) {
    this.model = 'jianyunhai';
    return {
      ...this.screenData,
      saveId: 'jianyunhai',
      ...myData,
    };
  }
  //万宝楼
  async get_valuablesData(myData) {
    this.model = 'valuables';
    return {
      ...this.screenData,
      saveId: 'valuables',
      ...myData,
    };
  }

  //法宝楼
  async get_valuables_fabaoData(myData) {
    this.model = 'valuables_fabao';
    return {
      ...this.screenData,
      saveId: 'valuables_fabao',
      ...myData,
    };
  }

  //武器楼
  async get_valuables_wuqiData(myData) {
    this.model = 'valuables_wuqi';
    return {
      ...this.screenData,
      saveId: 'valuables_wuqi',
      ...myData,
    };
  }

  //护具楼
  async get_valuables_hujuData(myData) {
    this.model = 'valuables_huju';
    return {
      ...this.screenData,
      saveId: 'valuables_huju',
      ...myData,
    };
  }

  //丹药楼
  async get_valuables_drugData(myData) {
    this.model = 'valuables_drug';
    return {
      ...this.screenData,
      saveId: 'valuables_drug',
      ...myData,
    };
  }

  //功法楼
  async get_valuables_skillData(myData) {
    this.model = 'valuables_skill';
    return {
      ...this.screenData,
      saveId: 'valuables_skill',
      ...myData,
    };
  }

  //道具楼
  async get_valuables_propData(myData) {
    this.model = 'valuables_prop';
    return {
      ...this.screenData,
      saveId: 'valuables_prop',
      ...myData,
    };
  }

  //数独
  async get_sudokuData(myData) {
    this.model = 'sudoku';
    return {
      ...this.screenData,
      saveId: 'sudoku',
      ...myData,
    };
  }

  //修为榜
  async get_ranking_powerData(myData) {
    this.model = 'ranking_power';
    return {
      ...this.screenData,
      saveId: 'ranking_power',
      ...myData,
    };
  }

  //灵石榜
  async get_ranking_moneyData(myData) {
    this.model = 'ranking_money';
    return {
      ...this.screenData,
      saveId: 'ranking_money',
      ...myData,
    };
  }

  async get_updataData(myData) {
    this.model = 'updata';
    return {
      ...this.screenData,
      saveId: 'updata',
      ...myData,
    };
  }

  //修仙设置
  async get_adminsetData(myData) {
    this.model = 'adminset';
    return {
      ...this.screenData,
      saveId: 'adminset',
      ...myData,
    };
  }

  async get_secret_placeData(myData) {
    this.model = 'secret_place';
    return {
      ...this.screenData,
      saveId: 'secret_place',
      ...myData,
    };
  }

  async get_forbidden_areaData(myData) {
    this.model = 'forbidden_area';
    return {
      ...this.screenData,
      saveId: 'forbidden_area',
      ...myData,
    };
  }

  async get_time_placeData(myData) {
    this.model = 'time_place';
    return {
      ...this.screenData,
      saveId: 'time_place',
      ...myData,
    };
  }

  async get_fairyrealmData(myData) {
    this.model = 'fairyrealm';
    return {
      ...this.screenData,
      saveId: 'fairyrealm',
      ...myData,
    };
  }

  async get_supermarketData(myData) {
    this.model = 'supermarket';
    return {
      ...this.screenData,
      saveId: 'supermarket',
      ...myData,
    };
  }

  async get_forumData(myData) {
    this.model = 'forum';
    return {
      ...this.screenData,
      saveId: 'forum',
      ...myData,
    };
  }
  //斩首堂
  async get_yuansu(myData) {
    this.model = 'tujian';
    return {
      ...this.screenData,
      saveId: 'tujian',
      ...myData,
    };
  }
  // 金银坊记录
  async get_jinyin(myData) {
    this.model = 'moneyCheck';
    return {
      ...this.screenData,
      saveId: 'moneyCheck',
      ...myData,
    };
  }

  async get_talentData(myData) {
    this.model = 'talent';
    return {
      ...this.screenData,
      saveId: 'talent',
      ...myData,
    };
  }

  async get_danfangData(myData) {
    this.model = 'danfang';
    return {
      ...this.screenData,
      saveId: 'danfang',
      ...myData,
    };
  }

  async get_tuzhiData(myData) {
    this.model = 'tuzhi';
    return {
      ...this.screenData,
      saveId: 'tuzhi',
      ...myData,
    };
  }
  async get_NIANGJIU(myData) {
    this.model = 'niangjiu';
    return {
      ...this.screenData,
      saveId: 'niangjiu',
      ...myData,
    };
  }
  //神兵榜
  async get_shenbing(myData) {
    this.model = 'shenbing';
    return {
      ...this.screenData,
      saveId: 'shenbing',
      ...myData,
    };
  }
  async xingge(myData) {
    this.model = 'xingge';
    return {
      ...this.screenData,
      saveId: 'xingge',
      ...myData,
    };
  }
  
  //通用消息
  async get_log(myData) {
    this.model = 'log';
    return {
      ...this.screenData,
      saveId: 'log',
      ...myData,
    };
  }

  //沉迷消息
  async get_log2(myData) {
    this.model = 'log2';
    return {
      ...this.screenData,
      saveId: 'log2',
      ...myData,
    };
  }

  //沉迷消息
  async get_log3(myData) {
    this.model = 'log3';
    return {
      ...this.screenData,
      saveId: 'log3',
      ...myData,
    };
  }

  //战斗消息
  async get_fightData(myData) {
    this.model = 'fight';
    return {
      ...this.screenData,
      saveId: 'fight',
      ...myData,
    };
  }

    //temp
    async get_battleData(myData) {
      this.model = 'battle';
      return {
        ...this.screenData,
        saveId: 'battle',
        ...myData,
      };
    }

  //团本奖励查看
  async get_BossRewardData(myData) {
    this.model = 'BossReward';
    return {
      ...this.screenData,
      saveId: 'BossReward',
      ...myData,
    };
  }
}
