/**
 * 内存泄漏管理器
 * 负责清理定时器、渲染器资源和全局变量
 */
import redis from '../api/redis.js'

class MemoryManager {
  constructor() {
    this.timers = new Set()        // 存储所有定时器引用
    this.renderers = new Map()     // 存储渲染器引用
    this.intervals = new Set()     // 存储所有间隔定时器
    this.timeouts = new Set()      // 存储所有延时定时器
    this.cleanupInterval = null    // 定期清理任务
    this.isCleaning = false        // 防止重复清理
    
    // 启动定期清理任务
    this.startPeriodicCleanup()
  }

  /**
   * 添加定时器到管理列表
   */
  addTimer(timer, type = 'interval') {
    if (!timer) return null
    
    switch (type) {
      case 'interval':
        this.intervals.add(timer)
        break
      case 'timeout':
        this.timeouts.add(timer)
        break
      default:
        this.timers.add(timer)
    }
    
    return timer
  }

  /**
   * 创建受管理的 setInterval
   */
  setInterval(callback, delay, ...args) {
    const timer = setInterval(callback, delay, ...args)
    this.addTimer(timer, 'interval')
    return timer
  }

  /**
   * 创建受管理的 setTimeout
   */
  setTimeout(callback, delay, ...args) {
    const timer = setTimeout(callback, delay, ...args)
    this.addTimer(timer, 'timeout')
    return timer
  }

  /**
   * 清理指定定时器
   */
  clearTimer(timer) {
    if (!timer) return false
    
    let cleared = false
    
    if (this.intervals.has(timer)) {
      clearInterval(timer)
      this.intervals.delete(timer)
      cleared = true
    } else if (this.timeouts.has(timer)) {
      clearTimeout(timer)
      this.timeouts.delete(timer)
      cleared = true
    } else if (this.timers.has(timer)) {
      // 通用清理
      try {
        if (typeof timer.unref === 'function') {
          timer.unref()
        }
        this.timers.delete(timer)
        cleared = true
      } catch (err) {
        console.warn('清理定时器时出错:', err.message)
      }
    }
    
    return cleared
  }

  /**
   * 添加渲染器引用
   */
  addRenderer(id, renderer) {
    if (renderer && id) {
      this.renderers.set(id, renderer)
    }
  }

  /**
   * 清理指定渲染器
   */
  async clearRenderer(id) {
    const renderer = this.renderers.get(id)
    if (!renderer) return false

    try {
      // 尝试调用渲染器的清理方法
      if (typeof renderer.close === 'function') {
        await renderer.close()
      } else if (typeof renderer.dispose === 'function') {
        await renderer.dispose()
      } else if (typeof renderer.destroy === 'function') {
        await renderer.destroy()
      }
      
      this.renderers.delete(id)
      return true
    } catch (err) {
      console.error(`清理渲染器 ${id} 时出错:`, err)
      return false
    }
  }

  /**
   * 清理所有定时器
   */
  clearAllTimers() {
    let clearedCount = 0

    // 清理间隔定时器
    this.intervals.forEach(timer => {
      try {
        clearInterval(timer)
        clearedCount++
      } catch (err) {
        console.warn('清理 interval 定时器时出错:', err.message)
      }
    })
    this.intervals.clear()

    // 清理延时定时器
    this.timeouts.forEach(timer => {
      try {
        clearTimeout(timer)
        clearedCount++
      } catch (err) {
        console.warn('清理 timeout 定时器时出错:', err.message)
      }
    })
    this.timeouts.clear()

    // 清理其他定时器
    this.timers.forEach(timer => {
      try {
        if (typeof timer.unref === 'function') {
          timer.unref()
        }
        clearedCount++
      } catch (err) {
        console.warn('清理定时器时出错:', err.message)
      }
    })
    this.timers.clear()

    console.log(`[内存管理] 已清理 ${clearedCount} 个定时器`)
    return clearedCount
  }

  /**
   * 清理所有渲染器
   */
  async clearAllRenderers() {
    let clearedCount = 0
    const promises = []

    for (const [id, renderer] of this.renderers) {
      promises.push(
        this.clearRenderer(id).then(success => {
          if (success) clearedCount++
        })
      )
    }

    await Promise.all(promises)
    console.log(`[内存管理] 已清理 ${clearedCount} 个渲染器`)
    return clearedCount
  }

  /**
   * 清理 Redis 中的过期数据
   */
  async clearExpiredRedisData() {
    try {
      const patterns = [
        'Xiuxian:Battle:Team:*',
        'Xiuxian:Battle:Player:*',
        'Xiuxian:Battle:PlayerCD:*',
        'Xiuxian:Battle:Boss:*',
        'Xiuxian:Emperor:*'
      ]

      let totalCleared = 0

      for (const pattern of patterns) {
        const keys = await redis.keys(pattern)
        
        if (keys.length > 0) {
          // 检查每个键的TTL，清理已过期的
          const expiredKeys = []
          
          for (const key of keys) {
            try {
              const ttl = await redis.ttl(key)
              if (ttl === -1) { // 没有设置过期时间的键
                const value = await redis.get(key)
                if (value) {
                  const data = JSON.parse(value)
                  // 检查数据中的时间戳，清理超过24小时的
                  if (data.createTime && (Date.now() - data.createTime) > 24 * 3600 * 1000) {
                    expiredKeys.push(key)
                  }
                }
              } else if (ttl === -2) { // 已过期但未删除
                expiredKeys.push(key)
              }
            } catch (err) {
              // 无法解析的数据，直接删除
              expiredKeys.push(key)
            }
          }

          if (expiredKeys.length > 0) {
            await Promise.all(expiredKeys.map(key => redis.del(key)))
            totalCleared += expiredKeys.length
            console.log(`[内存管理] 清理模式 ${pattern} 中的 ${expiredKeys.length} 个过期键`)
          }
        }
      }

      console.log(`[内存管理] 总共清理了 ${totalCleared} 个过期 Redis 键`)
      return totalCleared
    } catch (err) {
      console.error('[内存管理] 清理 Redis 数据时出错:', err)
      return 0
    }
  }

  /**
   * 清理全局变量
   */
  clearGlobalVariables() {
    const globalVarsToClear = [
      'Renderer',
      'dj',
      'dj_players',
      'spirit_players',
      'BloodPlayers'
    ]

    let clearedCount = 0

    globalVarsToClear.forEach(varName => {
      if (global[varName] !== undefined) {
        try {
          if (Array.isArray(global[varName])) {
            global[varName].length = 0 // 清空数组但保留引用
          } else if (typeof global[varName] === 'object' && global[varName] !== null) {
            Object.keys(global[varName]).forEach(key => {
              delete global[varName][key]
            })
          } else {
            delete global[varName]
          }
          clearedCount++
        } catch (err) {
          console.warn(`清理全局变量 ${varName} 时出错:`, err.message)
        }
      }
    })

    console.log(`[内存管理] 已清理 ${clearedCount} 个全局变量`)
    return clearedCount
  }

  /**
   * 强制垃圾回收（如果可用）
   */
  forceGarbageCollection() {
    if (global.gc) {
      try {
        global.gc()
        console.log('[内存管理] 已执行强制垃圾回收')
        return true
      } catch (err) {
        console.warn('[内存管理] 强制垃圾回收失败:', err.message)
        return false
      }
    } else {
      console.log('[内存管理] 垃圾回收不可用，请使用 --expose-gc 参数启动')
      return false
    }
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    const usage = process.memoryUsage()
    return {
      rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(usage.external / 1024 / 1024 * 100) / 100, // MB
      timers: this.intervals.size + this.timeouts.size + this.timers.size,
      renderers: this.renderers.size
    }
  }

  /**
   * 启动定期清理任务
   */
  startPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // 每30分钟执行一次清理
    this.cleanupInterval = this.setInterval(async () => {
      if (this.isCleaning) {
        console.log('[内存管理] 上次清理仍在进行中，跳过本次清理')
        return
      }

      this.isCleaning = true
      try {
        console.log('[内存管理] 开始定期清理...')
        
        const memoryBefore = this.getMemoryUsage()
        console.log('[内存管理] 清理前内存使用:', memoryBefore)

        // 清理过期 Redis 数据
        await this.clearExpiredRedisData()

        // 清理已完成的定时器
        this.clearCompletedTimers()

        // 如果内存使用过高，执行更激进的清理
        if (memoryBefore.heapUsed > 500) { // 超过 500MB
          console.log('[内存管理] 内存使用过高，执行深度清理...')
          await this.deepCleanup()
        }

        const memoryAfter = this.getMemoryUsage()
        console.log('[内存管理] 清理后内存使用:', memoryAfter)
        console.log('[内存管理] 定期清理完成')
      } catch (err) {
        console.error('[内存管理] 定期清理时出错:', err)
      } finally {
        this.isCleaning = false
      }
    }, 30 * 60 * 1000) // 30分钟

    console.log('[内存管理] 定期清理任务已启动（每30分钟）')
  }

  /**
   * 清理已完成的定时器
   */
  clearCompletedTimers() {
    // 这里可以添加逻辑来检测和清理已完成的定时器
    // 由于 Node.js 的定时器 API 限制，这里主要清理已经被标记为删除的定时器
  }

  /**
   * 深度清理
   */
  async deepCleanup() {
    console.log('[内存管理] 执行深度清理...')
    
    // 清理所有定时器
    this.clearAllTimers()
    
    // 清理所有渲染器
    await this.clearAllRenderers()
    
    // 清理全局变量
    this.clearGlobalVariables()
    
    // 强制垃圾回收
    this.forceGarbageCollection()
    
    console.log('[内存管理] 深度清理完成')
  }

  /**
   * 停止定期清理任务
   */
  stopPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
      console.log('[内存管理] 定期清理任务已停止')
    }
  }

  /**
   * 完全清理所有资源
   */
  async cleanup() {
    console.log('[内存管理] 开始完全清理...')
    
    // 停止定期清理
    this.stopPeriodicCleanup()
    
    // 清理所有定时器
    this.clearAllTimers()
    
    // 清理所有渲染器
    await this.clearAllRenderers()
    
    // 清理 Redis 过期数据
    await this.clearExpiredRedisData()
    
    // 清理全局变量
    this.clearGlobalVariables()
    
    // 强制垃圾回收
    this.forceGarbageCollection()
    
    console.log('[内存管理] 完全清理完成')
  }

  /**
   * 创建内存监控报告
   */
  createMemoryReport() {
    const usage = this.getMemoryUsage()
    const report = {
      timestamp: new Date().toISOString(),
      memory: usage,
      timers: {
        intervals: this.intervals.size,
        timeouts: this.timeouts.size,
        others: this.timers.size
      },
      renderers: this.renderers.size,
      recommendations: []
    }

    // 生成建议
    if (usage.heapUsed > 300) {
      report.recommendations.push('内存使用较高，建议执行深度清理')
    }
    
    if (usage.timers > 50) {
      report.recommendations.push('定时器数量较多，检查是否有未清理的定时器')
    }
    
    if (usage.renderers > 5) {
      report.recommendations.push('渲染器数量较多，检查是否有未释放的渲染器实例')
    }

    return report
  }
}

// 创建全局单例
const memoryManager = new MemoryManager()

// 导出管理器
export default memoryManager

// 优雅退出处理
process.on('SIGINT', async () => {
  console.log('\n[内存管理] 接收到退出信号，开始清理资源...')
  await memoryManager.cleanup()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n[内存管理] 接收到终止信号，开始清理资源...')
  await memoryManager.cleanup()
  process.exit(0)
})

// 未捕获异常处理
process.on('uncaughtException', async (err) => {
  console.error('[内存管理] 未捕获异常:', err)
  await memoryManager.cleanup()
  process.exit(1)
})

process.on('unhandledRejection', async (reason, promise) => {
  console.error('[内存管理] 未处理的 Promise 拒绝:', reason)
  // 这里不退出，只记录错误
})