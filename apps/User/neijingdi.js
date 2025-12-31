import { plugin, verc, data, config } from '../../api/api.js';
import { 
    Read_najie, Read_player, Write_player, exist_najie_thing, Add_najie_thing, 
    get_neijingdi_img, foundthing, get_log_img, Write_inner_world, Read_inner_world 
} from '../../model/xiuxian.js';
import fs from 'fs';
import path from 'path';

// 内景地升级配置
const INNER_WORLD_UPGRADE = {
  baseCost: 500000,          // 基础升级消耗
  capacityPerLevel: 500       // 每级增加容量
};

class InnerWorldManager {
    constructor() {
        // 物品空间权重配置
        this.ITEM_SPACE_RULES = {
            '装备': base => base * 2,    // 装备占用双倍空间
            '仙宠': base => base * 3,    // 仙宠占用三倍空间
            '丹药': base => base * 0.5,  // 丹药占用半格
            '道具': base => base * 1,    // 道具占用1格
            '功法': base => base * 1.2,  // 功法占用1.2格
            '草药': base => base * 0.8,  // 草药占用0.8格
            '食材': base => base * 0.8,  // 食材占用0.8格
            '盒子': base => base * 0.5,  // 盒子占用0.5格
            '材料': base => base * 1,    // 材料占用1格
            '仙宠口粮': base => base * 1, // 仙宠口粮占用1格
            '宝石': base => base * 1.5,  // 宝石占用1.5格
            '默认': base => base         // 其他物品占用1格
        };
        
        // 有效类别列表
        this.VALID_CATEGORIES = [
            '装备', '丹药', '道具', '功法',
            '草药', '食材', '盒子', '材料',
            '仙宠', '仙宠口粮', '宝石'
        ];
        
        // 品级映射
        this.PINJI_MAP = ['劣', '普', '优', '精', '极', '绝', '顶'];
    }

    // 解析指令
    parseCommand(e, prefix) {
        const command = e.msg.trim();
        const regex = new RegExp(`^#${prefix}(.+)\\*(\\d+|all)$`);
        const match = command.match(regex);
        
        if (!match) return null;
        
        return {
            name: match[1].trim(),
            quantity: match[2].trim()
        };
    }

    // 检查物品存在性和类别有效性
    async checkItemValidity(usr_qq, itemName) {
        const najie = await Read_najie(usr_qq);
        
        // 在所有有效类别中查找物品
        for (const category of this.VALID_CATEGORIES) {
            if (najie[category]) {
                const items = najie[category].filter(i => i.name === itemName);
                if (items.length > 0) {
                    return { 
                        exists: true, 
                        category,
                        // 对于装备，返回所有找到的品级
                        items: items
                    };
                }
            }
        }
        
        return { exists: false };
    }

    // 存入物品到内景地
    async storeToInnerWorld(e) {
        const parsed = this.parseCommand(e, '存');
        if (!parsed) {
            return this.showFormatError(e, '存');
        }
        
        const { name, quantity } = parsed;
        const usr_qq = e.user_id.toString().replace('qg_', '');
        const isStoreAll = quantity === 'all';
        
        try {
            // ==== 1. 验证玩家状态 ====
            const player = await Read_player(usr_qq);
            if (player.内景地开辟 !== 1) {
                return this.showError(e, [
                    ' 操作失败',
                    '你尚未开辟内景地空间',
                    '使用 #开辟内景地空间 开启'
                ].join('\n'));
            }

            // ==== 2. 检查物品存在性和类别有效性 ====
            const itemCheck = await this.checkItemValidity(usr_qq, name);
            if (!itemCheck.exists) {
                return this.showError(e, [
                    ' 物品不存在或类别无效',
                    `名称: ${name}`,
                    '请检查:',
                    '1. 名称是否完全匹配',
                    '2. 是否已获得该物品',
                    '3. 物品类别是否有效',
                    '有效类别:',
                    ...this.VALID_CATEGORIES.map(c => `- ${c}`)
                ].join('\n'));
            }
            
            const category = itemCheck.category;

            // ==== 3. 获取物品详情 ====
            const item = await foundthing(name);
            if (!item) {
                return this.showError(e, [
                    ' 物品不存在',
                    `名称: ${name}`,
                    '请检查:',
                    '1. 名称是否完全匹配',
                    '2. 是否已获得该物品'
                ].join('\n'));
            }

            // ==== 4. 计算存入数量 ====
            let storeQty;
            let itemPinji = 0; // 默认品级为0
            
            if (isStoreAll) {
                const najie = await Read_najie(usr_qq);
                // 对于装备，需要找到具体的品级
                if (category === '装备') {
                    const najieItems = najie[category]?.filter(i => i.name === name);
                    if (najieItems && najieItems.length > 0) {
                        // 检查是否有品级
                        const hasPinjiItems = najieItems.filter(i => i.pinji !== undefined && i.pinji !== null);
                        const noPinjiItems = najieItems.filter(i => i.pinji === undefined || i.pinji === null);
                        
                        if (hasPinjiItems.length > 0) {
                            // 有品级的装备，按品级分组存储
                            itemPinji = hasPinjiItems[0].pinji || 0;
                            storeQty = hasPinjiItems.reduce((sum, i) => sum + i.数量, 0);
                        } else {
                            // 没有品级的装备，统一存储
                            itemPinji = -1; // 标记为无品级
                            storeQty = noPinjiItems.reduce((sum, i) => sum + i.数量, 0);
                        }
                    } else {
                        storeQty = 0;
                    }
                } else if (category === '仙宠') {
                    // 仙宠没有品级，直接累加数量
                    const najieItems = najie[category]?.filter(i => i.name === name);
                    if (najieItems && najieItems.length > 0) {
                        storeQty = najieItems.reduce((sum, i) => sum + i.数量, 0);
                    } else {
                        storeQty = 0;
                    }
                } else {
                    const najieItem = najie[category]?.find(i => i.name === name);
                    storeQty = najieItem ? najieItem.数量 : 0;
                }
            } else {
    storeQty = parseInt(quantity);
    
    // 对于装备，需要确定品级
    if (category === '装备') {
        const najie = await Read_najie(usr_qq);
        const najieItems = najie[category]?.filter(i => i.name === name);
        if (najieItems && najieItems.length > 0) {
            // 检查是否有品级
            const hasPinjiItems = najieItems.filter(i => i.pinji !== undefined && i.pinji !== null);
            const noPinjiItems = najieItems.filter(i => i.pinji === undefined || i.pinji === null);
            
            if (hasPinjiItems.length > 0) {
                // 有品级的装备，取品级最高的
                const highestPinjiItem = hasPinjiItems.reduce((prev, current) => 
                    (prev.pinji > current.pinji) ? prev : current
                );
                itemPinji = highestPinjiItem.pinji || 0;
                
                // 检查有品级装备的数量是否足够
                const totalAvailable = hasPinjiItems.reduce((sum, i) => sum + i.数量, 0);
                if (storeQty > totalAvailable) {
                    return this.showError(e, [
                        ' 数量不足',
                        `请求数量: ${storeQty}`,
                        `可用数量: ${totalAvailable}`,
                        `装备: ${name} (有品级)`,
                        '提示: 使用 #查看纳戒 确认数量'
                    ].join('\n'));
                }
            } else {
                // 没有品级的装备
                itemPinji = -1; // 标记为无品级
                
                // 检查无品级装备的数量是否足够
                const totalAvailable = noPinjiItems.reduce((sum, i) => sum + i.数量, 0);
                if (storeQty > totalAvailable) {
                    return this.showError(e, [
                        ' 数量不足',
                        `请求数量: ${storeQty}`,
                        `可用数量: ${totalAvailable}`,
                        `装备: ${name} (无品级)`,
                        '提示: 使用 #查看纳戒 确认数量'
                    ].join('\n'));
                }
            }
        } else {
            return this.showError(e, [
                ' 物品不存在',
                `名称: ${name}`,
                '提示: 使用 #查看纳戒 确认物品'
            ].join('\n'));
        }
    } else {
        // 对于非装备物品，进行数量检查
        const najie = await Read_najie(usr_qq);
        let availableQty = 0;
        
        if (category === '仙宠') {
            // 仙宠可能有多个同名的，累加数量
            const najieItems = najie[category]?.filter(i => i.name === name);
            if (najieItems && najieItems.length > 0) {
                availableQty = najieItems.reduce((sum, i) => sum + i.数量, 0);
            }
        } else {
            // 其他类别，直接查找
            const najieItem = najie[category]?.find(i => i.name === name);
            availableQty = najieItem ? najieItem.数量 : 0;
        }
        
        if (storeQty > availableQty) {
            return this.showError(e, [
                ' 数量不足',
                `请求数量: ${storeQty}`,
                `可用数量: ${availableQty}`,
                `物品: ${name}`,
                `类别: ${category}`,
                '提示: 使用 #查看纳戒 确认数量'
            ].join('\n'));
        }
    }
}


            if (storeQty <= 0) {
                return this.showError(e, [
                    ' 数量错误',
                    `指定数量: ${quantity}`,
                    '必须为正整数或all'
                ].join('\n'));
            }

            // ==== 5. 检查空间容量 ====
            const innerWorld = await Read_inner_world(usr_qq);
            const itemSize = this.getItemSize({...item, 数量: storeQty}, category);
            
            if (innerWorld.当前容量 + itemSize > innerWorld.最大容量) {
                return this.showError(e, [
                    ' 空间不足',
                    `需要空间: ${itemSize}格`,
                    `当前剩余: ${innerWorld.最大容量 - innerWorld.当前容量}格`,
                    `最大容量: ${innerWorld.最大容量}格`,
                    '解决方案:',
                    '1. 取出部分物品 (#取物品名称*数量)',
                    '2. 升级扩容 (#内景地升级)'
                ].join('\n'));
            }

            // ==== 6. 执行存入操作 ====
            // 从纳戒扣除（考虑品级）
            if (category === '装备') {
                if (itemPinji === -1) {
                    // 无品级装备，不传递品级参数
                    await Add_najie_thing(usr_qq, name, category, -storeQty);
                } else {
                    // 有品级装备，传递品级参数
                    await Add_najie_thing(usr_qq, name, category, -storeQty, itemPinji);
                }
            } else {
                // 仙宠和其他物品不需要品级
                await Add_najie_thing(usr_qq, name, category, -storeQty);
            }
            
            // 添加到内景地
            if (!innerWorld[category]) innerWorld[category] = [];
            
            // 对于装备，需要按品级分开存储
            if (category === '装备') {
                const existing = innerWorld[category].find(i => 
                    i.name === name && 
                    i.pinji === itemPinji
                );
                
                if (existing) {
                    existing.数量 += storeQty;
                } else {
                    const newItem = {
                        ...item,
                        数量: storeQty,
                        存入时间: Date.now()
                    };
                    
                    // 只有有品级的装备才设置pinji属性
                    if (itemPinji !== -1) {
                        newItem.pinji = itemPinji;
                    }
                    
                    innerWorld[category].push(newItem);
                }
            } else if (category === '仙宠') {
                // 仙宠没有品级，按名称存储
                const existing = innerWorld[category].find(i => i.name === name);
                
                if (existing) {
                    existing.数量 += storeQty;
                } else {
                    innerWorld[category].push({
                        ...item,
                        数量: storeQty,
                        存入时间: Date.now()
                    });
                }
            } else {
                const existing = innerWorld[category].find(i => i.name === name);
                
                if (existing) {
                    existing.数量 += storeQty;
                } else {
                    innerWorld[category].push({
                        ...item,
                        数量: storeQty,
                        存入时间: Date.now()
                    });
                }
            }
            
            innerWorld.当前容量 += itemSize;
            innerWorld.最后更新时间 = Date.now();
            await Write_inner_world(usr_qq, innerWorld);

            // ==== 7. 返回操作结果 ====
            const nowCount = innerWorld[category].reduce((sum, i) => {
                if (category === '装备') {
                    return i.name === name && i.pinji === itemPinji ? sum + i.数量 : sum;
                } else if (category === '仙宠') {
                    return i.name === name ? sum + i.数量 : sum;
                } else {
                    return i.name === name ? sum + i.数量 : sum;
                }
            }, 0);
            
            let pinjiText = '';
            if (category === '装备') {
                if (itemPinji === -1) {
                    pinjiText = '品级: 无品级';
                } else {
                    pinjiText = `品级: ${this.PINJI_MAP[itemPinji] || itemPinji}`;
                }
            }
            // 仙宠没有品级，不显示品级信息
            
            return this.showSuccess(e, [
                ` 成功存入 ${storeQty}个${name}`,
                pinjiText,
                `存放位置: ${category}区`,
                `当前总量: ${nowCount}`,
                `占用空间: ${itemSize}格`,
                `剩余容量: ${innerWorld.最大容量 - innerWorld.当前容量}格`,
                `取出指令: #取${name}*数量`
            ].filter(line => line !== '').join('\n'));

        } catch (err) {
            console.error('存入内景地错误:', err);
            return this.showError(e, [
                ' 存入失败',
                `物品: ${name}`,
                `数量: ${quantity}`,
                `错误: ${err.message}`,
                '建议检查:',
                '1. 纳戒中物品数量',
                '2. 内景地空间剩余',
                '3. 物品类别是否正确'
            ].join('\n'));
        }
    }

    // 从内景地取出物品
    async takeFromInnerWorld(e) {
        const parsed = this.parseCommand(e, '取');
        if (!parsed) {
            return this.showFormatError(e, '取');
        }
        
        const { name, quantity } = parsed;
        const usr_qq = e.user_id.toString().replace('qg_', '');
        const isTakeAll = quantity === 'all';

        try {
            // ==== 1. 验证玩家状态 ====
            const player = await Read_player(usr_qq);
            if (player.内景地开辟 !== 1) {
                return this.showError(e, [
                    ' 操作失败',
                    '你尚未开辟内景地空间',
                    '使用 #开辟内景地空间 开启'
                ].join('\n'));
            }

            // ==== 2. 在内景地中查找物品 ====
            const innerWorld = await Read_inner_world(usr_qq);
            let targetItems = [];
            let targetCategory = null;
            
            // 在所有类别中查找物品（名称完全匹配）
            for (const category of this.VALID_CATEGORIES) {
                if (innerWorld[category]) {
                    const items = innerWorld[category].filter(i => i.name === name);
                    if (items.length > 0) {
                        targetItems = items;
                        targetCategory = category;
                        break;
                    }
                }
            }
            
            if (targetItems.length === 0) {
                return this.showError(e, [
                    ' 物品不存在',
                    `名称: ${name}`,
                    '提示: 使用 #查看内景地 确认物品'
                ].join('\n'));
            }

            // ==== 3. 计算取出数量 ====
            let takeQty;
            if (isTakeAll) {
                takeQty = targetItems.reduce((sum, i) => sum + i.数量, 0);
            } else {
                takeQty = parseInt(quantity);
                const totalExist = targetItems.reduce((sum, i) => sum + i.数量, 0);
                if (takeQty > totalExist) {
                    return this.showError(e, [
                        ' 数量不足',
                        `请求数量: ${takeQty}`,
                        `实际存在: ${totalExist}`,
                        '提示: 使用 all 取出全部'
                    ].join('\n'));
                }
            }

            // ==== 4. 执行取出操作 ====
            let remaining = takeQty;
            const updatedItems = [];
            let releasedSpace = 0;

            // 先进先出原则（按存入时间排序）
            targetItems.sort((a, b) => a.存入时间 - b.存入时间);
            
            for (const item of targetItems) {
                if (remaining <= 0) break;
                
                const takeFromThis = Math.min(remaining, item.数量);
                item.数量 -= takeFromThis;
                remaining -= takeFromThis;
                releasedSpace += this.getItemSize({...item, 数量: takeFromThis}, targetCategory);

                // 对于装备，需要传递品级信息
                if (targetCategory === '装备' ) {
                    if (item.pinji !== undefined && item.pinji !== null) {
                        // 有品级的装备，传递品级参数
                        await Add_najie_thing(usr_qq, item.name, targetCategory, takeFromThis, item.pinji);
                    } else {
                        // 无品级的装备，不传递品级参数
                        await Add_najie_thing(usr_qq, item.name, targetCategory, takeFromThis);
                    }
                } else {
                    await Add_najie_thing(usr_qq, item.name, targetCategory, takeFromThis);
                }

                if (item.数量 > 0) {
                    updatedItems.push(item);
                }
            }

            // 更新内景地数据
            innerWorld[targetCategory] = [
                ...innerWorld[targetCategory].filter(i => !targetItems.includes(i)),
                ...updatedItems
            ].filter(i => i.数量 > 0);

            innerWorld.当前容量 -= releasedSpace;
            innerWorld.最后更新时间 = Date.now();
            await Write_inner_world(usr_qq, innerWorld);

            // ==== 5. 返回操作结果 ====
            const remainingTotal = innerWorld[targetCategory]
                .filter(i => i.name === name)
                .reduce((sum, i) => sum + i.数量, 0);

            return this.showSuccess(e, [
                ` 成功取出 ${takeQty}个${name}`,
                `来源区域: ${targetCategory}`,
                `释放空间: ${releasedSpace}格`,
                `剩余数量: ${remainingTotal}`,
                `当前容量: ${innerWorld.当前容量}/${innerWorld.最大容量}格`,
                '提示: 使用 #查看内景地 查看详情'
            ].join('\n'));

        } catch (err) {
            console.error('取出内景地错误:', err);
            return this.showError(e, [
                ' 取出失败',
                `物品: ${name}`,
                `数量: ${quantity}`,
                `错误: ${err.message}`,
                '建议操作:',
                '1. 确认物品名称完全匹配',
                '2. 检查内景地状态 (#查看内景地)',
                '3. 联系管理员修复'
            ].join('\n'));
        }
    }

    // 计算物品占用空间
    getItemSize(item, category) {
        const rule = this.ITEM_SPACE_RULES[category] || this.ITEM_SPACE_RULES['默认'];
        return rule(item.数量);
    }

    // 显示格式错误
    async showFormatError(e, action) {
        const examples = action === '存' ? 
            ['示例1: #存九转金丹*5', '示例2: #存玄铁剑*all'] : 
            ['示例1: #取九转金丹*5', '示例2: #取玄铁剑*all'];
        
        return e.reply(await get_log_img([
            ' 格式错误',
            `正确格式: #${action}物品名称*数量`,
            ...examples,
            '有效类别:',
            ...this.VALID_CATEGORIES.map(c => `- ${c}`)
        ].join('\n')));
    }

    // 显示错误信息
    async showError(e, lines) {
        return e.reply(lines);
    }

    // 显示成功信息
    async showSuccess(e, lines) {
        return e.reply(lines);
    }
} // 结束 InnerWorldManager 类定义

export class InnerWorld extends plugin {
    constructor() {
        super({
            name: '内景地系统',
            dsc: '开辟和管理修士的内景地空间',
            event: 'message',
            priority: 100,
            rule: [
                {
                    reg: '^#开辟内景地空间$',
                    fnc: 'openInnerWorld'
                },
                {
                    reg: '^#存.+\\*(\\d+|all)$',
                    fnc: 'handleStore'
                },
                {
                    reg: '^#取.+\\*(\\d+|all)$',
                    fnc: 'handleTake'
                },
                {
                    reg: '^#升级内景地空间$',
                    fnc: 'upgradeInnerWorld'
                },
                {
                    reg: '^#(?:一键取出|全部取出)内景地(?:\\s+(.*))?$',
                    fnc: 'takeAllFromInnerWorld',
                },
                {
                    reg: '^#一键取出(装备|丹药|道具|功法|草药|食材|盒子|材料|仙宠|仙宠口粮|宝石)$',
                    fnc: 'takeCategoryFromInnerWorld'
                },
                {
                    reg: '^#一键存入内景地$',
                    fnc: 'storeAllToInnerWorld'
                },
                {
                    reg: '^#查看内景地$',
                    fnc: 'checkInnerWorld'
                }
            ]
        });
        
        // 在构造函数中初始化管理器
        this.manager = new InnerWorldManager();
        
        // 定义有效的物品分类
        this.VALID_CATEGORIES = [
            '装备', '丹药', '道具', '功法',
            '草药', '食材', '盒子', '材料',
            '仙宠', '仙宠口粮', '宝石'
        ];
        
        // 定义物品空间权重配置
        this.ITEM_SPACE_RULES = {
            '装备': base => base * 2,
            '仙宠': base => base * 3,
            '丹药': base => base * 0.5,
            '道具': base => base * 1,
            '功法': base => base * 1.2,
            '草药': base => base * 0.8,
            '食材': base => base * 0.8,
            '盒子': base => base * 0.5,
            '材料': base => base * 1,
            '仙宠口粮': base => base * 1,
            '宝石': base => base * 1.5,
            '默认': base => base
        };
        
        // 品级映射
        this.PINJI_MAP = ['劣', '普', '优', '精', '极', '绝', '顶'];
    }
    
    // 计算物品占用空间
    getItemSize(item, category) {
        const rule = this.ITEM_SPACE_RULES[category] || this.ITEM_SPACE_RULES['默认'];
        return rule(item.数量);
    }

    async storeAllToInnerWorld(e) {
        const usr_qq = e.user_id.toString().replace('qg_','');
        
        try {
            // ==== 1. 基础验证 ====
            const [player, innerWorld, najie] = await Promise.all([
                Read_player(usr_qq),
                Read_inner_world(usr_qq),
                Read_najie(usr_qq)
            ]);
            
            if (player.内景地开辟 !== 1) {
                return e.reply(await get_log_img([
                    '未开辟内景地空间',
                    '使用 #开辟内景地空间 开启空间'
                ]));
            }

            // ==== 2. 智能筛选物品 ====
            const storePlan = this.generateStorePlan(najie, innerWorld);
            
            if (storePlan.totalItems === 0) {
                return e.reply(await get_log_img([
                    ' 无可存物品',
                    '纳戒中没有符合存储条件的物品',
                    '以下物品不会自动存入:',
                    '- 已锁定的装备',
                    '- 任务关键道具',
                    '- 正在使用的功法'
                ]));
            }

            // ==== 3. 执行批量存入 ====
            const results = [];
            let successCount = 0;
            
            for (const category in storePlan.items) {
                for (const item of storePlan.items[category]) {
                    try {
                        // 从纳戒移除（考虑品级）
                        if (category === '装备' ) {
                            if (item.pinji !== undefined && item.pinji !== null) {
                                await Add_najie_thing(usr_qq, item.name, category, -item.count, item.pinji);
                            } else {
                                await Add_najie_thing(usr_qq, item.name, category, -item.count);
                            }
                        } else {
                            await Add_najie_thing(usr_qq, item.name, category, -item.count);
                        }
                        
                        // 添加到内景地
                        const existing = innerWorld[category]?.find(i => 
                            i.name === item.name && 
                            (category === '装备' ? i.pinji === item.pinji : true)
                        );
                        
                        if (existing) {
                            existing.数量 += item.count;
                        } else {
                            if (!innerWorld[category]) innerWorld[category] = [];
                            
                            const itemData = await foundthing(item.name);
                            if (itemData) {
                                const newItem = {
                                    ...itemData,
                                    数量: item.count,
                                    存入时间: Date.now()
                                };
                                
                                if (category === '装备') {
                                    if (item.pinji !== undefined && item.pinji !== null) {
                                        newItem.pinji = item.pinji;
                                    }
                                }
                                // 仙宠没有品级，不设置pinji
                                
                                innerWorld[category].push(newItem);
                            }
                        }
                        
                        successCount++;
                        results.push(`✔ ${item.name} ×${item.count}`);
                    } catch (err) {
                        results.push(`✘ ${item.name} (失败: ${err.message})`);
                    }
                }
            }

            // ==== 4. 更新空间数据 ====
            innerWorld.当前容量 = storePlan.newUsedSpace;
            innerWorld.最后更新时间 = Date.now();
            await Write_inner_world(usr_qq, innerWorld);

            // ==== 5. 生成报告 ====
            const remainingSpace = innerWorld.最大容量 - innerWorld.当前容量;
            const report = [
                `【一键存入报告】✦${successCount}件`,
                `◇ 存入物品: ${storePlan.totalItems}件`,
                `◇ 成功数量: ${successCount}件`,
                `◇ 释放空间: ${storePlan.totalSpace}格`,
                `◇ 剩余容量: ${remainingSpace}格`,
                '【操作详情】',
                ...results.slice(0, 15), // 最多显示15条
                results.length > 15 ? `...共${results.length}条记录` : ''
            ];

            return e.reply(await get_log_img(report));

        } catch (err) {
            console.error('一键存入错误:', err);
            return e.reply(await get_log_img([
                '❌ 一键存入失败',
                `错误原因: ${err.message}`,
                '建议检查:',
                '1. 内景地是否已满',
                '2. 纳戒物品状态'
            ]));
        }
    }

    // 生成智能存储方案
    generateStorePlan(najie, innerWorld) {
        const plan = {
            items: {},
            totalItems: 0,
            totalSpace: 0,
            newUsedSpace: innerWorld.当前容量
        };

        // 扫描纳戒
        for (const category of this.VALID_CATEGORIES) {
            if (!najie[category]?.length) continue;
            
            plan.items[category] = [];
            
            for (const item of najie[category]) {
                // ==== 计算空间 ====
                const itemSize = this.getItemSize(item, category);
                if (plan.newUsedSpace + itemSize > innerWorld.最大容量) continue;
                
                // ==== 添加到计划 ====
                const planItem = {
                    name: item.name,
                    count: item.数量,
                    data: item
                };
                
                // 只有有品级的装备才设置pinji属性
                if (category === '装备' && item.pinji !== undefined && item.pinji !== null) {
                    planItem.pinji = item.pinji;
                }
                
                plan.items[category].push(planItem);
                
                plan.totalItems += item.数量;
                plan.totalSpace += itemSize;
                plan.newUsedSpace += itemSize;
            }
        }
        
        return plan;
    }
// 添加按类别取出的方法
async takeCategoryFromInnerWorld(e) {
    const usr_qq = e.user_id.toString().replace('qg_', '');
    
    // 提取类别名称
    const categoryMatch = e.msg.match(/^#一键取出(装备|丹药|道具|功法|草药|食材|盒子|材料|仙宠|仙宠口粮|宝石)$/);
    if (!categoryMatch) return false;
    
    const category = categoryMatch[1];
    
    try {
        // === 1. 验证玩家状态 ===
        const player = await Read_player(usr_qq);
        if (player.内景地开辟 !== 1) {
            return e.reply([
                '❌ 操作失败',
                '你尚未开辟内景地空间',
                '使用 #开辟内景地空间 开启空间'
            ].join('\n'));
        }

        // === 2. 读取内景地数据 ===
        const innerWorld = await Read_inner_world(usr_qq);
        
        // 检查该类别是否有物品
        if (!innerWorld[category] || innerWorld[category].length === 0) {
            return e.reply([
                ` ${category}区为空`,
                `内景地的${category}区域没有物品`,
                '提示: 使用 #查看内景地 查看详情'
            ].join('\n'));
        }

        // === 3. 执行取出操作 ===
        const categoryItems = innerWorld[category];
        let totalTaken = 0;
        let releasedSpace = 0;
        const results = [];

        for (const item of categoryItems) {
            try {
                // 计算物品占用空间
                const itemSize = this.getItemSize(item, category);
                
                // 添加到纳戒（考虑品级）
                if (category === '装备') {
                    if (item.pinji !== undefined && item.pinji !== null) {
                        await Add_najie_thing(usr_qq, item.name, category, item.数量, item.pinji);
                    } else {
                        await Add_najie_thing(usr_qq, item.name, category, item.数量);
                    }
                } else {
                    await Add_najie_thing(usr_qq, item.name, category, item.数量);
                }
                
                totalTaken += item.数量;
                releasedSpace += itemSize;
                results.push(`✔ ${item.name} ×${item.数量}`);
            } catch (err) {
                results.push(`✘ ${item.name} (失败: ${err.message})`);
            }
        }

        // === 4. 更新内景地数据 ===
        innerWorld[category] = []; // 清空该类别
        innerWorld.当前容量 -= releasedSpace;
        innerWorld.最后更新时间 = Date.now();
        await Write_inner_world(usr_qq, innerWorld);

        // === 5. 返回操作结果 ===
        const remainingSpace = innerWorld.最大容量 - innerWorld.当前容量;
        const report = [
            `【${category}区一键取出】`,
            `◇ 取出物品: ${totalTaken}件`,
            `◇ 释放空间: ${releasedSpace}格`,
            `◇ 剩余容量: ${remainingSpace}格`,
            '【操作详情】',
            ...results.slice(0, 10), // 最多显示10条
            results.length > 10 ? `...共${results.length}件物品` : '',
            '提示: 物品已存入纳戒，使用 #查看纳戒 确认'
        ];

        return e.reply(report.join('\n'));

    } catch (err) {
        console.error('按类别取出错误:', err);
        return e.reply([
            ' 取出失败',
            `类别: ${category}`,
            `错误: ${err.message}`,
            '建议操作:',
            '1. 检查内景地状态 (#查看内景地)',
            '2. 检查纳戒空间',
            '3. 联系管理员'
        ].join('\n'));
    }
}
    // 开辟内景地
    async openInnerWorld(e) {
        const usr_qq = e.user_id.toString().replace('qg_','');
        
        try {
            const player = await Read_player(usr_qq);
            
            // 检查是否已开辟
            if (player.内景地开辟 === 1) {
                return e.reply(await get_log_img([
                    ' 操作失败',
                    '你已开辟过内景地',
                    '无需重复开辟'
                ]));
            }
            
            // 检查元神值
            if (player.元神 < 5000000) {
                return e.reply(await get_log_img([
                    ' 开辟失败',
                    '需要500万元神值',
                    `当前元神: ${player.元神.toLocaleString()}`,
                    '提升方式:',
                    '1. 突破境界 (#突破)',
                    '2. 服用丹药 (#服用丹药)'
                ]));
            }
            

            
            // 初始化内景地数据（完全匹配您的分类结构）
            const initialData = {
                等级: 1,
                灵石: 0,
                当前容量: 0,
                最大容量: 500,
                装备: [],      // 武器、防具等
                丹药: [],      // 各类丹药
                道具: [],      // 功能性道具
                功法: [],      // 修炼秘籍
                草药: [],      // 炼丹材料
                食材: [],      // 烹饪材料
                盒子: [],      // 特殊容器
                材料: [],      // 锻造/合成材料
                仙宠: [],     // 灵兽/坐骑
                仙宠口粮: [], // 宠物培养物品
                宝石: [],     // 镶嵌/强化材料
                最后更新时间: Date.now()
            };
            await Write_inner_world(usr_qq, initialData);
                        // 扣除元神并开辟
            player.元神 -= 5000000;
            player.内景地开辟 = 1;
            await Write_player(usr_qq, player);
            return e.reply(await get_log_img([
                ' 内景地开辟成功',
                '泥丸宫中轰然震动！',
                '你以无上元神之力在体内',
                '开辟出一方小世界',
                '初始容量: 500格',
                '使用 #存入内景地 管理物品'
            ]));
            
        } catch (err) {
            console.error('开辟内景地错误:', err);
            return e.reply(await get_log_img([
                ' 开辟失败',
                `错误原因: ${err.message}`,
                '请尝试以下操作:',
                '1. 重新尝试开辟',
                '2. 联系管理员修复'
            ]));
        }
    }

    async handleStore(e) {
        return await this.manager.storeToInnerWorld(e);
    }
    
    async handleTake(e) {
        return await this.manager.takeFromInnerWorld(e);
    }

    async takeAllFromInnerWorld(e) {
        const usr_qq = e.user_id.toString().replace('qg_', '');
        const categoryFilter = e.msg.match(/^#(?:一键取出|全部取出)内景地\s+(.*)/)?.[1]?.trim();

        try {
            // === 1. 验证玩家状态 ===
            const player = await Read_player(usr_qq);
            if (player.内景地开辟 !== 1) {
                return e.reply(
                    '操作失败',
                    '你尚未开辟内景地空间',
                    '使用 #开辟内景地空间 开启空间'
                );
            }

            // === 2. 读取内景地数据 ===
            const innerWorld = await Read_inner_world(usr_qq);
            let totalTaken = 0;
            let releasedSpace = 0;
            const resultMessages = [];
            
            // === 3. 确定操作范围 ===
            const targetCategories = categoryFilter 
                ? [categoryFilter].filter(c => this.VALID_CATEGORIES.includes(c))
                : this.VALID_CATEGORIES;

            if (categoryFilter && targetCategories.length === 0) {
                return e.reply(await get_log_img([
                    ' 无效分类',
                    `"${categoryFilter}"不是有效类别`,
                    '可用类别:',
                    ...this.VALID_CATEGORIES.map(c => `- ${c}`)
                ]));
            }

            // === 4. 批量取出操作 ===
            for (const category of targetCategories) {
                if (!innerWorld[category] || innerWorld[category].length === 0) {
                    resultMessages.push(`[${category}] 无物品`);
                    continue;
                }

                // 统计该分类下的所有物品
                const categoryItems = innerWorld[category];
                let categoryTaken = 0;
                let categorySpace = 0;

                for (const item of categoryItems) {
                    // 添加到纳戒（考虑品级）
                    if (category === '装备') {
                        if (item.pinji !== undefined && item.pinji !== null) {
                            await Add_najie_thing(usr_qq, item.name, category, item.数量, item.pinji);
                        } else {
                            await Add_najie_thing(usr_qq, item.name, category, item.数量);
                        }
                    } else {
                        await Add_najie_thing(usr_qq, item.name, category, item.数量);
                    }
                    
                    categoryTaken += item.数量;
                    categorySpace += this.getItemSize(item, category);
                }

                totalTaken += categoryTaken;
                releasedSpace += categorySpace;
                resultMessages.push(`[${category}] 取出 ${categoryTaken}件`);

                // 清空该分类
                innerWorld[category] = [];
            }

            // === 5. 更新数据 ===
            if (totalTaken > 0) {
                innerWorld.当前容量 -= releasedSpace;
                innerWorld.最后更新时间 = Date.now();
                await Write_inner_world(usr_qq, innerWorld);
            }

            // === 6. 返回结果 ===
            return e.reply(await get_log_img([
                ' 一键取出完成',
                ...resultMessages,
                `总计取出: ${totalTaken}件`,
                `释放空间: ${releasedSpace}格`,
                `当前容量: ${innerWorld.当前容量}/${innerWorld.最大容量}`,
                '提示: 物品已存入纳戒'
            ]));

        } catch (err) {
            console.error('一键取出失败:', err);
            return e.reply(await get_log_img([
                ' 操作异常',
                `错误: ${err.message}`,
                '建议检查:',
                '1. 内景地状态 (#查看内景地)',
                '2. 纳戒剩余空间',
                '3. 联系管理员'
            ]));
        }
    }

    // 升级内景地
    async upgradeInnerWorld(e) {
        const usr_qq = e.user_id.toString().replace('qg_','');
        
        try {
            // ==== 1. 验证玩家状态 ====
            const player = await Read_player(usr_qq);
            if (player.内景地开辟 !== 1) {
                return e.reply(await get_log_img([
                    ' 操作失败',
                    '你尚未开辟内景地空间',
                    '使用 #开辟内景地空间 开启'
                ]));
            }

            // ==== 2. 计算升级消耗 ====
            const innerWorld = await Read_inner_world(usr_qq);
            const cost = innerWorld.等级 * INNER_WORLD_UPGRADE.baseCost;
            
            if (player.源石 < cost) {
                return e.reply(([
                    ' 源石不足',
                    `升级需求: ${cost}`,
                    `当前源石: ${player.源石}`,
                ]));
            }

            // ==== 3. 执行升级 ====
            const beforeLevel = innerWorld.等级;
            const beforeCapacity = innerWorld.最大容量;
            
            player.源石 -= cost;
            innerWorld.等级 += 1;
            innerWorld.最大容量 += INNER_WORLD_UPGRADE.capacityPerLevel;
            innerWorld.最后更新时间 = Date.now();
            
            await Write_player(usr_qq, player);
            await Write_inner_world(usr_qq, innerWorld);

            // ==== 4. 返回升级结果 ====
            return e.reply(await get_log_img([
                ' 内景地升级成功',
                `等级: ${beforeLevel} → ${innerWorld.等级}`,
                `容量: ${beforeCapacity} → ${innerWorld.最大容量}格`,
                `消耗源石: ${cost}`,
                `剩余源石: ${player.源石}`,
                '下次升级需求:',
                `${(innerWorld.等级 * INNER_WORLD_UPGRADE.baseCost)}源石`
            ]));

        } catch (err) {
            console.error('升级内景地错误:', err);
            return e.reply(await get_log_img([
                '升级失败',
                `错误原因: ${err.message}`,
                '建议操作:',
                '1. 检查灵石数量',
                '2. 确认内景地状态',
                '3. 联系管理员'
            ]));
        }
    }

    // 查看内景地状态（显示全部物品）
    async checkInnerWorld(e) {
        if (!verc({ e })) return false;
        let img = await get_neijingdi_img(e);
        e.reply(img);
        return false;
    }
}