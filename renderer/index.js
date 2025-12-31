/**
 * 渲染器包装器
 * 提供向后兼容的渲染器接口，同时集成内存管理
 */
import rendererManager from './RendererManager.js'
import memoryManager from '../utils/MemoryManager.js'

// 渲染器缓存
const rendererCache = new Map()
let cleanupInterval = null

/**
 * 获取渲染器（兼容原有接口）
 */
async function getRenderer(name = 'puppeteer') {
  try {
    // 检查缓存
    if (rendererCache.has(name)) {
      const cached = rendererCache.get(name)
      cached.lastUsed = Date.now()
      return cached.renderer
    }

    // 从管理器获取渲染器
    const { renderer, id } = await rendererManager.getRenderer(name)
    
    // 缓存渲染器
    rendererCache.set(name, {
      renderer,
      id,
      lastUsed: Date.now()
    })

    // 包装渲染器方法以跟踪使用情况
    const wrappedRenderer = wrapRenderer(renderer, id)
    
    return wrappedRenderer
    
  } catch (err) {
    console.error(`[渲染器包装器] 获取渲染器 ${name} 失败:`, err)
    
    // 返回空渲染器作为后备
    return {
      render: async () => null,
      screenshot: async () => null,
      screenshots: async () => null
    }
  }
}

/**
 * 包装渲染器以添加内存管理
 */
function wrapRenderer(renderer, id) {
  const wrapped = {
    ...renderer,
    
    async render(name, data) {
      try {
        // 更新使用时间
        rendererManager.updateLastUsed(id)
        
        // 调用原始渲染方法
        const result = await renderer.render(name, data)
        
        return result
      } catch (err) {
        console.error(`[渲染器包装器] 渲染失败:`, err)
        throw err
      }
    },
    
    async screenshot(name, data) {
      try {
        rendererManager.updateLastUsed(id)
        const result = await renderer.screenshot(name, data)
        return result
      } catch (err) {
        console.error(`[渲染器包装器] 截图失败:`, err)
        throw err
      }
    },
    
    async screenshots(name, data) {
      try {
        rendererManager.updateLastUsed(id)
        const result = await renderer.screenshots(name, data)
        return result
      } catch (err) {
        console.error(`[渲染器包装器] 多页截图失败:`, err)
        throw err
      }
    },
    
    // 添加清理方法
    async close() {
      await rendererManager.releaseRenderer(id)
      rendererCache.delete(name)
    }
  }

  return wrapped
}

/**
 * 启动定期清理
 */
function startPeriodicCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }

  cleanupInterval = memoryManager.setInterval(() => {
    cleanupCache()
  }, 20 * 60 * 1000) // 每20分钟清理一次缓存
}

/**
 * 清理缓存
 */
function cleanupCache() {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000 // 1小时
  let cleanedCount = 0

  for (const [name, cached] of rendererCache) {
    if (now - cached.lastUsed > maxAge) {
      // 释放渲染器
      rendererManager.releaseRenderer(cached.id).catch(console.error)
      rendererCache.delete(name)
      cleanedCount++
    }
  }

  if (cleanedCount > 0) {
    console.log(`[渲染器包装器] 清理了 ${cleanedCount} 个缓存渲染器`)
  }
}

/**
 * 强制清理所有缓存
 */
async function cleanupAll() {
  console.log('[渲染器包装器] 开始清理所有缓存...')
  
  // 释放所有缓存的渲染器
  for (const [name, cached] of rendererCache) {
    try {
      await rendererManager.releaseRenderer(cached.id)
    } catch (err) {
      console.error(`释放渲染器 ${name} 失败:`, err)
    }
  }
  
  rendererCache.clear()
  
  // 清理管理器中的所有渲染器
  await rendererManager.cleanupAll()
  
  // 停止清理定时器
  if (cleanupInterval) {
    memoryManager.clearTimer(cleanupInterval)
    cleanupInterval = null
  }
  
  console.log('[渲染器包装器] 清理完成')
}

/**
 * 获取统计信息
 */
function getStats() {
  const managerStats = rendererManager.getStats()
  const cacheStats = {
    cached: rendererCache.size,
    types: {}
  }

  for (const [name, cached] of rendererCache) {
    const type = name.split('_')[0]
    if (!cacheStats.types[type]) {
      cacheStats.types[type] = 0
    }
    cacheStats.types[type]++
  }

  return {
    ...managerStats,
    cache: cacheStats
  }
}

// 启动定期清理
startPeriodicCleanup()

// 优雅退出处理
process.on('SIGINT', async () => {
  console.log('\n[渲染器包装器] 接收到退出信号，开始清理...')
  await cleanupAll()
})

process.on('SIGTERM', async () => {
  console.log('\n[渲染器包装器] 接收到终止信号，开始清理...')
  await cleanupAll()
})

// 导出兼容接口
export default {
  getRenderer,
  cleanupAll,
  getStats
}

// 同时导出默认渲染器实例以保持兼容性
export const renderer = {
  screenshot: async (name, data) => {
    const renderer = await getRenderer()
    return renderer.screenshot(name, data)
  },
  
  screenshots: async (name, data) => {
    const renderer = await getRenderer()
    return renderer.screenshots(name, data)
  },
  
  render: async (name, data) => {
    const renderer = await getRenderer()
    return renderer.render(name, data)
  }
}