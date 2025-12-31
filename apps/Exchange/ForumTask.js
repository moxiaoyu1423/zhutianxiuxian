import { plugin, config } from '../../api/api.js';
import { Write_Forum, Read_Forum, Add_灵石 } from '../../model/xiuxian.js';

export class ForumTask extends plugin {
  constructor() {
    super({
      name: 'ForumTask',
      dsc: '论坛帖子超时处理定时任务',
      event: 'message',
      priority: 300,
      rule: [],
    });
    
    // 获取任务配置
    this.taskConfig = config.getConfig('task', 'task');
    
    // 设置定时任务
    this.task = {
      cron: this.taskConfig.ForumTask || "0 0 4 * * *", // 默认每天4点执行
      name: 'ForumTask',
      fnc: () => this.processExpiredPosts(),
    };
  }

  async processExpiredPosts() {
    let forumPosts;
    try {
      forumPosts = await Read_Forum();
    } catch (err) {
      console.error('读取论坛数据失败:', err);
      await Write_Forum([]);
      forumPosts = await Read_Forum();
    }
    
    const nowTime = Date.now();
    const expiredPosts = [];
    
    // 倒序遍历避免删除元素时索引问题
    for (let i = forumPosts.length - 1; i >= 0; i--) {
      const post = forumPosts[i];
      
      // 计算帖子存在时间（天）
      const postAgeDays = (nowTime - post.now_time) / (24 * 60 * 60 * 1000);
      
      if (postAgeDays >= 3) {
        try {
          // 返还灵石给发帖人
          await Add_灵石(post.qq, post.whole);
          expiredPosts.push(post);
          
          // 从论坛列表中移除
          forumPosts.splice(i, 1);
        } catch (err) {
          console.error(`处理过期帖子失败（ID: ${post.id || '未知'}）:`, err);
        }
      }
    }
    
    if (expiredPosts.length > 0) {
      console.log(`处理了 ${expiredPosts.length} 个过期帖子`);
      await Write_Forum(forumPosts);
    }
    
    return true;
  }
}