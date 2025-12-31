/**
 * 渲染器内存管理器
 * 管理渲染器的创建、使用和清理
 */
import memoryManager from '../utils/MemoryManager.js'

class RendererManager {
  constructor() {
    this.activeRenderers = new Map()      // 活跃的渲染器实例
    this.rendererPool = new Map()         // 渲染器池
    this.usageCount = new Map()           // 使用计数
    this.lastUsed = new Map()              // 最后使用时间
    this.maxPoolSize = 5                  // 最大池大小
    this.maxIdleTime = 30 * 60 * 1000     // 最大空闲时间（30分钟）
    this.cleanupInterval = null            // 清理定时器
    
    this.startCleanupTimer()
  }

  /**
   * 获取渲染器实例（带池化）
   */
  async getRenderer(rendererType = 'puppeteer') {
    const rendererId = `${rendererType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // 尝试从池中获取
      const pooledRenderer = this.getFromPool(rendererType)
      if (pooledRenderer) {
        this.activeRenderers.set(rendererId, pooledRenderer)
        this.usageCount.set(rendererId, 1)
        this.lastUsed.set(rendererId, Date.now())
        return { renderer: pooledRenderer, id: rendererId }
      }

      // 创建新渲染器
      const renderer = await this.createRenderer(rendererType)
      if (!renderer) {
        throw new Error(`无法创建 ${rendererType} 渲染器`)
      }

      // 注册到内存管理器
      memoryManager.addRenderer(rendererId, renderer)
      
      // 记录使用信息
      this.activeRenderers.set(rendererId, renderer)
      this.usageCount.set(rendererId, 1)
      this.lastUsed.set(rendererId, Date.now())

      console.log(`[渲染器管理] 创建新渲染器: ${rendererId}`)
      return { renderer, id: rendererId }
      
    } catch (err) {
      console.error(`[渲染器管理] 获取渲染器失败:`, err)
      throw err
    }
  }

  /**
   * 从池中获取渲染器
   */
  getFromPool(rendererType) {
    const pool = this.rendererPool.get(rendererType)
    if (!pool || pool.length === 0) {
      return null
    }

    return pool.pop()
  }

  /**
   * 创建新的渲染器实例
   */
  async createRenderer(rendererType) {
    try {
      // 动态导入渲染器
      const RendererLoader = await import('../renderer/loader.js')
      const rendererLoader = RendererLoader.default
      
      if (!rendererLoader || typeof rendererLoader.getRenderer !== 'function') {
        throw new Error('渲染器加载器不可用')
      }

      const renderer = rendererLoader.getRenderer(rendererType)
      
      if (!renderer || typeof renderer.render !== 'function') {
        throw new Error(`渲染器 ${rendererType} 不可用或缺少 render 方法`)
      }

      // 为渲染器添加清理方法（如果不存在）
      if (!renderer.close && !renderer.dispose && !renderer.destroy) {
        renderer.close = async () => {
          console.log(`[渲染器管理] 关闭渲染器实例`)
          // 这里可以添加具体的关闭逻辑
        }
      }

      return renderer
      
    } catch (err) {
      console.error(`[渲染器管理] 创建渲染器 ${rendererType} 失败:`, err)
      return null
    }
  }

  /**
   * 释放渲染器回池或销毁
   */
  async releaseRenderer(rendererId) {
    const renderer = this.activeRenderers.get(rendererId)
    if (!renderer) {
      return false
    }

    try {
      const usage = this.usageCount.get(rendererId) || 0
      
      if (usage > 1) {
        // 减少使用计数
        this.usageCount.set(rendererId, usage - 1)
        return true
      }

      // 尝试放回池中
      const rendererType = this.getRendererType(renderer)
      if (this.canReturnToPool(rendererType)) {
        this.returnToPool(rendererType, renderer)
      } else {
        // 销毁渲染器
        await this.destroyRenderer(rendererId, renderer)
      }

      // 清理记录
      this.activeRenderers.delete(rendererId)
      this.usageCount.delete(rendererId)
      this.lastUsed.delete(rendererId)

      // 从内存管理器中移除
      await memoryManager.clearRenderer(rendererId)

      return true
      
    } catch (err) {
      console.error(`[渲染器管理] 释放渲染器 ${rendererId} 失败:`, err)
      return false
    }
  }

  /**
   * 判断是否可以返回池中
   */
  canReturnToPool(rendererType) {
    const pool = this.rendererPool.get(rendererType) || []
    return pool.length < this.maxPoolSize
  }

  /**
   * 返回渲染器到池中
   */
  returnToPool(rendererType, renderer) {
    if (!this.rendererPool.has(rendererType)) {
      this.rendererPool.set(rendererType, [])
    }
    
    const pool = this.rendererPool.get(rendererType)
    pool.push(renderer)
    
    console.log(`[渲染器管理] 渲染器返回池中: ${rendererType}, 池大小: ${pool.length}`)
  }

  /**
   * 销毁渲染器
   */
  async destroyRenderer(rendererId, renderer) {
    try {
      if (typeof renderer.close === 'function') {
        await renderer.close()
      } else if (typeof renderer.dispose === 'function') {
        await renderer.dispose()
      } else if (typeof renderer.destroy === 'function') {
        await renderer.destroy()
      }
      
      console.log(`[渲染器管理] 已销毁渲染器: ${rendererId}`)
      
    } catch (err) {
      console.error(`[渲染器管理] 销毁渲染器 ${rendererId} 时出错:`, err)
    }
  }

  /**
   * 获取渲染器类型
   */
  getRendererType(renderer) {
    // 尝试从渲染器对象获取类型信息
    if (renderer.id) {
      return renderer.id.split('_')[0]
    } else if (renderer.type) {
      return renderer.type
    }
    
    // 默认返回 puppeteer
    return 'puppeteer'
  }

  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.cleanupInterval = memoryManager.setInterval(() => {
      this.cleanupIdleRenderers()
    }, 10 * 60 * 1000) // 每10分钟清理一次

    console.log('[渲染器管理] 启动定时清理任务')
  }

  /**
   * 清理空闲渲染器
   */
  cleanupIdleRenderers() {
    const now = Date.now()
    let cleanedCount = 0

    // 清理活跃渲染器中长时间未使用的
    for (const [rendererId, lastUsedTime] of this.lastUsed) {
      if (now - lastUsedTime > this.maxIdleTime) {
        const renderer = this.activeRenderers.get(rendererId)
        if (renderer) {
          this.destroyRenderer(rendererId, renderer).catch(console.error)
          this.activeRenderers.delete(rendererId)
          this.usageCount.delete(rendererId)
          this.lastUsed.delete(rendererId)
          cleanedCount++
        }
      }
    }

    // 清理池中过多的渲染器
    for (const [rendererType, pool] of this.rendererPool) {
      if (pool.length > this.maxPoolSize / 2) {
        const toRemove = pool.length - Math.floor(this.maxPoolSize / 2)
        for (let i = 0; i < toRemove; i++) {
          const renderer = pool.pop()
          if (renderer) {
            this.destroyRenderer(`pool_${rendererType}_${i}`, renderer).catch(console.error)
            cleanedCount++
          }
        }
      }
    }

    if (cleanedCount > 0) {
      console.log(`[渲染器管理] 清理了 ${cleanedCount} 个空闲渲染器`)
    }
  }

  /**
   * 强制清理所有渲染器
   */
  async cleanupAll() {
    console.log('[渲染器管理] 开始清理所有渲染器...')
    
    let totalCleaned = 0

    // 清理活跃渲染器
    const activeRendererIds = Array.from(this.activeRenderers.keys())
    for (const rendererId of activeRendererIds) {
      const renderer = this.activeRenderers.get(rendererId)
      if (renderer) {
        await this.destroyRenderer(rendererId, renderer)
        totalCleaned++
      }
    }

    // 清理池中渲染器
    for (const [rendererType, pool] of this.rendererPool) {
      for (let i = 0; i < pool.length; i++) {
        const renderer = pool[i]
        if (renderer) {
          await this.destroyRenderer(`pool_${rendererType}_${i}`, renderer)
          totalCleaned++
        }
      }
    }

    // 清空所有记录
    this.activeRenderers.clear()
    this.rendererPool.clear()
    this.usageCount.clear()
    this.lastUsed.clear()

    // 停止清理定时器
    if (this.cleanupInterval) {
      memoryManager.clearTimer(this.cleanupInterval)
      this.cleanupInterval = null
    }

    console.log(`[渲染器管理] 清理完成，共清理 ${totalCleaned} 个渲染器`)
    return totalCleaned
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const stats = {
      active: this.activeRenderers.size,
      pooled: 0,
      byType: {}
    }

    // 统计池中数量
    for (const [rendererType, pool] of this.rendererPool) {
      stats.pooled += pool.length
      stats.byType[rendererType] = {
        active: 0,
        pooled: pool.length
      }
    }

    // 统计活跃数量
    for (const [rendererId, renderer] of this.activeRenderers) {
      const rendererType = this.getRendererType(renderer)
      if (!stats.byType[rendererType]) {
        stats.byType[rendererType] = { active: 0, pooled: 0 }
      }
      stats.byType[rendererType].active++
    }

    return stats
  }

  /**
   * 更新最后使用时间
   */
  updateLastUsed(rendererId) {
    this.lastUsed.set(rendererId, Date.now())
  }

  /**
   * 增加使用计数
   */
  incrementUsage(rendererId) {
    const current = this.usageCount.get(rendererId) || 0
    this.usageCount.set(rendererId, current + 1)
  }
}

// 创建全局单例
const rendererManager = new RendererManager()

// 导出管理器
export default rendererManager

// 优雅退出处理
process.on('SIGINT', async () => {
  console.log('\n[渲染器管理] 接收到退出信号，开始清理渲染器...')
  await rendererManager.cleanupAll()
})

process.on('SIGTERM', async () => {
  console.log('\n[渲染器管理] 接收到终止信号，开始清理渲染器...')
  await rendererManager.cleanupAll()
})