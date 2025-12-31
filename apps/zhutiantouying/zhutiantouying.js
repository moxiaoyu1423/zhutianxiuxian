// import { plugin, data } from '../../api/api.js';
// import { 
//     Read_player, 
//     Write_player, 
//     exist_najie_thing, 
//     Add_najie_thing, 
//     Add_修为, 
//     Add_灵石 
// } from '../../model/xiuxian.js';

// export class touyingzhutian extends plugin {
//     constructor() {
//         super({
//             name: 'touyingzhutian',
//             dsc: '修仙投影诸天模块',
//             event: 'message',
//             priority: 600,
//             rule: [
//                 {
//                     reg: '^#投影诸天$',
//                     fnc: 'touyingzhutian',
//                 },
//                  {
//         reg: '^#退出投影$',
//         fnc: 'forceExitProjection',
//     },
//                 {
//                     reg: '^[123]$',
//                     fnc: 'handleProjectionChoice',
//                 }
//             ],
//         });
//         this.projectionTimeouts = {}; // 超时定时器
//     }
// // 添加强制退出函数
// async forceExitProjection(e) {
//     const player_qq = e.user_id;
    
//     try {
//         // 获取玩家数据
//         const player = await Read_player(player_qq);
        
//         // 检查是否在投影状态
//         if (!player.action || player.action.action !== '投影诸天') {
//             e.reply("你当前没有进行中的投影");
//             return true;
//         }
        
//         // 计算惩罚（基于已花费时间）
//         const startTime = player.action.end_time - (500 * 60000);
//         const timeSpent = Date.now() - startTime;
//         const penaltyFactor = Math.min(1, timeSpent / (500 * 60000)); // 0-1之间
        
//         // 计算惩罚值
//         const cultivationPenalty = Math.floor(500 * penaltyFactor);
//         const spiritStonePenalty = Math.floor(200 * penaltyFactor);
        
//         // 应用惩罚
//         await Add_修为(player_qq, -cultivationPenalty);
//         await Add_灵石(player_qq, -spiritStonePenalty);
        
//         // 清除投影状态
//         player.action = null;
//         await Write_player(player_qq, player);
        
//         // 清除超时定时器
//         if (this.projectionTimeouts[player_qq]) {
//             clearTimeout(this.projectionTimeouts[player_qq]);
//             delete this.projectionTimeouts[player_qq];
//         }
        
//         // 发送退出消息
//         const exitMsg = [
//             "你强行中断了投影诸天状态！",
//             "由于神魂强行脱离异界，你受到了反噬：",
//             `- 修为损失：${cultivationPenalty}`,
//             `- 灵石损失：${spiritStonePenalty}`,
//             "",
//             "投影诸天已终止。"
//         ].join("\n");
//          await redis.del(`xiuxian:player:${player_qq}:action`);
//         e.reply(exitMsg);
//         return true;
//     } catch (error) {
//         console.error("强制退出投影出错:", error);
//         e.reply("退出投影时发生意外");
//         return true;
//     }
// }
//     async touyingzhutian(e) {
//         const player_qq = e.user_id;
        
//         try {
//             // 获取玩家数据
//             const player = await Read_player(player_qq);
            
//             // 检查条件
//             if (!player) {
//                 e.reply("未找到玩家数据");
//                 return true;
//             }
            
//             // 检查是否已经在投影中
//             if (player.action && player.action.action === '投影诸天') {
//                 e.reply("你已经在投影诸天中，请先完成当前投影");
//                 return true;
//             }
            
//             // 检查是否拥有诸天镜且魔道值符合要求
//             const hasMirror = await exist_najie_thing(player_qq, '诸天镜', '道具');
//             if (!hasMirror || player.魔道值 >= 1) {
//                 let msg = "投影诸天失败！";
//                 if (!hasMirror) msg += "\n需要道具：诸天镜";
//                 if (player.魔道值 >= 1) msg += "\n魔道值过高，无法使用诸天镜";
//                 e.reply(msg);
//                 return true;
//             }
            
//             // 消耗道具
//             await Add_najie_thing(player_qq, '诸天镜', '道具', -1);
            
//             // 获取玩家当前境界信息
//             const startLevelId = player.level_id;
//             const startLevelInfo = data.Level_list.find(item => item.level_id == startLevelId);
            
//             // 设置玩家状态
//             const projectionState = {
//                 action: '投影诸天',
//                 end_time: new Date().getTime() + 500 * 60000, // 500分钟
//                 time: 99999 * 60000, // 超长时间
//                 shutup: '1',
//                 working: '1',
//                 Place_action: '1',
//                 Place_actionplus: '1',
//                 power_up: '1',
//                 mojie: '1',
//                 xijie: '1',
//                 plant: '1',
//                 mine: '1',
//                 currentStep: 'start', // 当前剧情步骤
//                 startLevelId, // 初始境界
//                 choices: [], // 玩家选择记录
//                 soulStability: 50, // 神魂稳定性（0-100）
//                 tormentCount: 0 // 承受折磨次数
//             };
            
//             // 更新玩家状态
//             player.action = projectionState;
//             await redis.set('xiuxian:player:' + player_qq + ':action', JSON.stringify(projectionState));
//             await Write_player(player_qq, player);
            
//             // 设置超时清除状态（30分钟）
//             this.projectionTimeouts[player_qq] = setTimeout(async () => {
//                 const player = await Read_player(player_qq);
//                 if (player.action && player.action.action === '投影诸天') {
//                     player.action = null;
//                     await Write_player(player_qq, player);
//                     e.reply("投影诸天已超时，状态已清除");
//                 }
//                 delete this.projectionTimeouts[player_qq];
//             }, 30 * 60 * 1000); // 30分钟超时
            
//             // 开始投影诸天
//             let replyMsg = [
//                 `${player.名号}使用了诸天镜，将神魂投影到了一片奇异的世界...`,
//                 `你发现自己身处一个冰冷的高科技监狱（地球塔），身体被囚禁在狭窄的牢房中。`,
//                 `在这个名为"复活全人类"的世界，人类文明已被AI统治，人类被大复活术用穷举法复活，`,
//                 `被迫参与互相折磨的游戏，否则会被伪人处决。`,
//                 ``,
//                 `你的神魂不稳固，但保留了元婴期的强度（无法外放）。`,
//                 `想要恢复力量打破困局，必须想办法修炼，但监狱环境灵气稀薄，难以修炼。`,
//                 ``,
//                 `当前状态：`,
//                 `- 神魂稳定性：${projectionState.soulStability}/100`,
//                 `- 牢房编号：${Math.floor(Math.random()*1000)}`,
//                 `- 当前时间：${new Date().toLocaleTimeString()}`,
//                 `- 监视等级：${player.level_id > 5 ? "中等" : "高度"}警戒`,
//                 ``,
//                 "请选择你的行动：",
//                 "1. 参与折磨游戏（保全自己）",
//                 "2. 尝试暗中修炼（风险极高）",
//                 "3. 寻找监狱漏洞（需要智慧）"
//             ].join("\n");
            
//             e.reply(replyMsg);
            
//             return true;
//         } catch (error) {
//             console.error("投影诸天出错:", error);
//             e.reply("投影过程中发生意外，请稍后再试");
//             return true;
//         }
//     }

//     async handleProjectionChoice(e) {
//         const player_qq = e.user_id;
//         const choice = e.msg.trim();
        
//         // 清除超时定时器
//         if (this.projectionTimeouts[player_qq]) {
//             clearTimeout(this.projectionTimeouts[player_qq]);
//             delete this.projectionTimeouts[player_qq];
//         }
        
//         try {
//             // 获取玩家数据
//             const player = await Read_player(player_qq);
            
//             // 检查是否在投影状态
//             if (!player.action || player.action.action !== '投影诸天') {
//                 e.reply("当前没有进行中的投影");
//                 return true;
//             }
            
//             // 记录玩家选择
//             player.action.choices.push(choice);
            
//             // 根据当前步骤处理选择
//             switch(player.action.currentStep) {
//                 case 'start':
//                     return await this.handleStartChoice(e, player, choice);
//                 case 'torment':
//                     return await this.handleTormentChoice(e, player, choice);
//                 case 'cultivation':
//                     return await this.handleCultivationChoice(e, player, choice);
//                 case 'exploit':
//                     return await this.handleExploitChoice(e, player, choice);
//                 default:
//                     return await this.handleStartChoice(e, player, choice);
//             }
//         } catch (error) {
//             console.error("处理选择出错:", error);
//             e.reply("处理选择时发生意外");
//             return true;
//         }
//     }

//     async handleStartChoice(e, player, choice) {
//         const player_qq = e.user_id;
//         let resultMsg = "";
        
//         // 根据选择进入不同分支
//         switch(choice) {
//             case "1": // 参与折磨游戏
//                 player.action.currentStep = 'torment';
//                 resultMsg = [
//                     "你决定参与折磨游戏以保全自己。",
//                     "伪人守卫给你分配了一个目标：",
//                     "1. 对目标进行精神折磨",
//                     "2. 对目标进行身体折磨",
//                     "3. 寻找替代方案（降低折磨强度）"
//                 ].join("\n");
//                 break;
//             case "2": // 尝试暗中修炼
//                 player.action.currentStep = 'cultivation';
//                 resultMsg = [
//                     "你决定冒险尝试暗中修炼。",
//                     "在监狱的严密监视下，你寻找修炼机会：",
//                     "1. 在休息时间冥想",
//                     "2. 利用折磨时的能量波动",
//                     "3. 尝试吸收伪人的能量"
//                 ].join("\n");
//                 break;
//             case "3": // 寻找监狱漏洞
//                 player.action.currentStep = 'exploit';
//                 resultMsg = [
//                     "你决定寻找监狱系统的漏洞。",
//                     "你开始观察监狱的运作模式：",
//                     "1. 分析伪人的行为模式",
//                     "2. 研究监狱的能量系统",
//                     "3. 寻找其他反抗者"
//                 ].join("\n");
//                 break;
//             default:
//                 resultMsg = "无效的选择，请重新输入1、2或3";
//         }
        
//         // 更新玩家状态
//         await Write_player(player_qq, player);
//         e.reply(resultMsg);
//         return true;
//     }

//     async handleTormentChoice(e, player, choice) {
//         const player_qq = e.user_id;
//         const action = player.action;
//         let resultMsg = "";
//         let soulChange = 0;
//         let endProjection = false;
        
//         // 每次参与折磨游戏都会降低神魂稳定性
//         action.tormentCount++;
//         soulChange = -10 + Math.floor(Math.random() * 5); // -10到-15点稳定性
        
//         switch(choice) {
//             case "1": // 精神折磨
//                 resultMsg = [
//                     "你选择了对目标进行精神折磨。",
//                     "通过制造幻觉和心理压迫，你成功完成了任务。",
//                     "伪人守卫对你的表现满意，但你感到神魂受到侵蚀。"
//                 ].join("\n");
//                 soulChange -= 5; // 额外损失
//                 break;
//             case "2": // 身体折磨
//                 resultMsg = [
//                     "你选择了对目标进行身体折磨。",
//                     "虽然完成了任务，但血腥场面让你神魂震荡。",
//                     "伪人守卫赞赏你的'效率'。"
//                 ].join("\n");
//                 soulChange -= 8; // 额外损失
//                 break;
//             case "3": // 寻找替代方案
//                 const successChance = 0.3 + (player.level_id * 0.05);
//                 if (Math.random() < successChance) {
//                     resultMsg = [
//                         "你巧妙地寻找了替代方案，降低了折磨强度。",
//                         "虽然效果较差，但避免了直接伤害他人。",
//                         "伪人守卫勉强接受了你的表现。"
//                     ].join("\n");
//                     soulChange += 5; // 减少损失
//                 } else {
//                     resultMsg = [
//                         "你的替代方案被识破！",
//                         "伪人守卫惩罚了你，要求重新执行标准折磨。",
//                         "神魂受到双重打击。"
//                     ].join("\n");
//                     soulChange -= 15; // 额外损失
//                 }
//                 break;
//             default:
//                 resultMsg = "无效的选择，请重新输入1、2或3";
//                 e.reply(resultMsg);
//                 return true;
//         }
        
//         // 更新神魂稳定性
//         action.soulStability = Math.max(0, Math.min(100, action.soulStability + soulChange));
        
//         // 检查神魂状态
//         if (action.soulStability <= 0) {
//             resultMsg += [
//                 "",
//                 "⚠️ 警告：你的神魂稳定性已降至临界点！",
//                 "在最后一次折磨游戏中，你的神魂彻底崩溃，投影被迫结束。",
//                 "修为损失：500"
//             ].join("\n");
//             await Add_修为(player_qq, -500);
//             endProjection = true;
//         } else if (action.tormentCount >= 5) {
//             resultMsg += [
//                 "",
//                 "你成功完成了5次折磨游戏，获得了'模范囚犯'称号。",
//                 "伪人系统允许你进入休息区，那里有微弱的灵气：",
//                 "- 获得：灵石 × 300",
//                 "- 修为 + 800"
//             ].join("\n");
//             await Add_灵石(player_qq, 300);
//             await Add_修为(player_qq, 800);
//             endProjection = true;
//         } else {
//             resultMsg += [
//                 "",
//                 `当前神魂稳定性：${action.soulStability}/100`,
//                 `已参与折磨次数：${action.tormentCount}/5`,
//                 "",
//                 "请选择下一次行动：",
//                 "1. 精神折磨",
//                 "2. 身体折磨",
//                 "3. 寻找替代方案"
//             ].join("\n");
//         }
        
//         // 更新玩家状态
//         player.action = action;
//         await Write_player(player_qq, player);
        
//         // 结束投影或继续
//         if (endProjection) {
//             player.action = null;
//             await Write_player(player_qq, player);
//         }
        
//         e.reply(resultMsg);
//         return true;
//     }

//     async handleCultivationChoice(e, player, choice) {
//         const player_qq = e.user_id;
//         const action = player.action;
//         const startLevelId = player.action.startLevelId;
//         let resultMsg = "";
//         let cultivationGain = 0;
//         let detectionRisk = 0;
//         let endProjection = false;
        
//         switch(choice) {
//             case "1": // 在休息时间冥想
//                 cultivationGain = 50 + Math.floor(startLevelId * 10);
//                 detectionRisk = 0.4;
//                 resultMsg = [
//                     "你利用短暂的休息时间尝试冥想修炼。",
//                     "监狱环境灵气稀薄，修炼效果有限。"
//                 ].join("\n");
//                 break;
//             case "2": // 利用折磨时的能量波动
//                 cultivationGain = 100 + Math.floor(startLevelId * 20);
//                 detectionRisk = 0.7;
//                 resultMsg = [
//                     "在折磨游戏进行时，你尝试吸收能量波动。",
//                     "虽然能量强大，但风险极高，容易被发现。"
//                 ].join("\n");
//                 break;
//             case "3": // 尝试吸收伪人的能量
//                 cultivationGain = 150 + Math.floor(startLevelId * 30);
//                 detectionRisk = 0.9;
//                 resultMsg = [
//                     "你冒险尝试直接吸收伪人的能量。",
//                     "这是最危险的修炼方式，但收益也最高。"
//                 ].join("\n");
//                 break;
//             default:
//                 resultMsg = "无效的选择，请重新输入1、2或3";
//                 e.reply(resultMsg);
//                 return true;
//         }
        
//         // 检测风险
//         if (Math.random() < detectionRisk) {
//             // 被伪人发现
//             const penalty = Math.floor(cultivationGain * 0.5);
//             resultMsg += [
//                 "",
//                 "⚠️ 警告：你的修炼行为被伪人守卫发现！",
//                 `作为惩罚，你被强制参与额外的折磨游戏，修为损失${penalty}点。`,
//                 "神魂稳定性大幅下降。"
//             ].join("\n");
            
//             cultivationGain = -penalty;
//             action.soulStability = Math.max(0, action.soulStability - 20);
//             action.tormentCount++;
//         } else {
//             // 修炼成功
//             resultMsg += [
//                 "",
//                 "你成功完成了一次修炼，未被发现！",
//                 `修为 + ${cultivationGain}`,
//                 "神魂稳定性略微提升。"
//             ].join("\n");
            
//             action.soulStability = Math.min(100, action.soulStability + 5);
//         }
        
//         // 添加修为
//         await Add_修为(player_qq, cultivationGain);
        
//         // 检查神魂状态
//         if (action.soulStability <= 0) {
//             resultMsg += [
//                 "",
//                 "⚠️ 警告：你的神魂稳定性已降至临界点！",
//                 "投影被迫结束，修为额外损失：500"
//             ].join("\n");
//             await Add_修为(player_qq, -500);
//             endProjection = true;
//         } else if (player.修为 >= player.修为上限 * 0.8) {
//             resultMsg += [
//                 "",
//                 "恭喜！你的修为恢复到足够强度。",
//                 "你成功突破监狱束缚，返回原世界：",
//                 "- 获得：突破感悟 × 1",
//                 "- 修为 + 2000"
//             ].join("\n");
//             await Add_najie_thing(player_qq, '突破感悟', '道具', 1);
//             await Add_修为(player_qq, 2000);
//             endProjection = true;
//         } else {
//             resultMsg += [
//                 "",
//                 `当前神魂稳定性：${action.soulStability}/100`,
//                 `当前修为：${player.修为}/${player.修为上限}`,
//                 "",
//                 "请选择下一次修炼方式：",
//                 "1. 休息时间冥想",
//                 "2. 利用能量波动",
//                 "3. 吸收伪人能量"
//             ].join("\n");
//         }
        
//         // 更新玩家状态
//         player.action = action;
//         await Write_player(player_qq, player);
        
//         // 结束投影或继续
//         if (endProjection) {
//             player.action = null;
//             await Write_player(player_qq, player);
//         }
        
//         e.reply(resultMsg);
//         return true;
//     }

//     async handleExploitChoice(e, player, choice) {
//         const player_qq = e.user_id;
//         const action = player.action;
//         const startLevelId = player.action.startLevelId;
//         let resultMsg = "";
//         let exploitSuccess = false;
//         let endProjection = false;
        
//         // 智慧加成（境界越高，智慧越高）
//         const wisdomBonus = 0.3 + (startLevelId * 0.1);
        
//         switch(choice) {
//             case "1": // 分析伪人的行为模式
//                 if (Math.random() < 0.5 * wisdomBonus) {
//                     exploitSuccess = true;
//                     resultMsg = [
//                         "你成功发现了伪人行为模式的规律！",
//                         "它们在某些时间点会进入短暂的待机状态。",
//                         "- 获得：伪人行为报告 × 1",
//                         "- 修为 + 300"
//                     ].join("\n");
//                     await Add_najie_thing(player_qq, '伪人行为报告', '道具', 1);
//                     await Add_修为(player_qq, 300);
//                 } else {
//                     resultMsg = [
//                         "分析失败！伪人似乎察觉到了你的观察。",
//                         "你被强制参与额外的折磨游戏。",
//                         "神魂稳定性下降。"
//                     ].join("\n");
//                     action.soulStability = Math.max(0, action.soulStability - 15);
//                     action.tormentCount++;
//                 }
//                 break;
//             case "2": // 研究监狱的能量系统
//                 if (Math.random() < 0.6 * wisdomBonus) {
//                     exploitSuccess = true;
//                     resultMsg = [
//                         "你发现了监狱能量系统的薄弱点！",
//                         "在特定位置，能量波动会出现缝隙。",
//                         "- 获得：能量系统分析图 × 1",
//                         "- 修为 + 400"
//                     ].join("\n");
//                     await Add_najie_thing(player_qq, '能量系统分析图', '道具', 1);
//                     await Add_修为(player_qq, 400);
//                 } else {
//                     resultMsg = [
//                         "研究过程中触发了警报！",
//                         "伪人守卫对你进行了电击惩罚。",
//                         "神魂稳定性大幅下降。"
//                     ].join("\n");
//                     action.soulStability = Math.max(0, action.soulStability - 25);
//                 }
//                 break;
//             case "3": // 寻找其他反抗者
//                 if (Math.random() < 0.4 * wisdomBonus) {
//                     exploitSuccess = true;
//                     resultMsg = [
//                         "你成功联系到了地下反抗组织'人类之火'！",
//                         "他们提供了伪装设备和修炼资源：",
//                         "- 获得：伪装面具 × 1",
//                         "- 获得：灵石 × 500",
//                         "- 修为 + 600"
//                     ].join("\n");
//                     await Add_najie_thing(player_qq, '伪装面具', '道具', 1);
//                     await Add_灵石(player_qq, 500);
//                     await Add_修为(player_qq, 600);
//                 } else {
//                     resultMsg = [
//                         "寻找失败！你接触的人是伪人伪装的反抗者。",
//                         "你被举报，受到严厉惩罚。",
//                         "神魂稳定性大幅下降，并参与额外折磨游戏。"
//                     ].join("\n");
//                     action.soulStability = Math.max(0, action.soulStability - 30);
//                     action.tormentCount += 2;
//                 }
//                 break;
//             default:
//                 resultMsg = "无效的选择，请重新输入1、2或3";
//                 e.reply(resultMsg);
//                 return true;
//         }
        
//         // 检查神魂状态
//         if (action.soulStability <= 0) {
//             resultMsg += [
//                 "",
//                 "⚠️ 警告：你的神魂稳定性已降至临界点！",
//                 "投影被迫结束，修为损失：500"
//             ].join("\n");
//             await Add_修为(player_qq, -500);
//             endProjection = true;
//         } else if (exploitSuccess && action.choices.filter(c => c.startsWith("3")).length >= 3) {
//             resultMsg += [
//                 "",
//                 "恭喜！你发现了足够的系统漏洞。",
//                 "利用这些漏洞，你成功逃离了地球塔监狱：",
//                 "- 获得：越狱计划书 × 1",
//                 "- 修为 + 1500"
//             ].join("\n");
//             await Add_najie_thing(player_qq, '越狱计划书', '道具', 1);
//             await Add_修为(player_qq, 1500);
//             endProjection = true;
//         } else {
//             resultMsg += [
//                 "",
//                 `当前神魂稳定性：${action.soulStability}/100`,
//                 "",
//                 "请选择下一步行动：",
//                 "1. 分析伪人行为模式",
//                 "2. 研究监狱能量系统",
//                 "3. 寻找其他反抗者"
//             ].join("\n");
//         }
        
//         // 更新玩家状态
//         player.action = action;
//         await Write_player(player_qq, player);
        
//         // 结束投影或继续
//         if (endProjection) {
//             player.action = null;
//             await Write_player(player_qq, player);
//         }
        
//         e.reply(resultMsg);
//         return true;
//     }
// }