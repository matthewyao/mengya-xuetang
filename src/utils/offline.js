import { load, save } from './storage'

const QUEUE_KEY = 'syncQueue'

// 获取离线队列
function getQueue() {
  return load(QUEUE_KEY, [])
}

// 保存队列
function setQueue(queue) {
  save(QUEUE_KEY, queue)
}

// 添加到同步队列
export function addToSyncQueue(action) {
  const queue = getQueue()
  queue.push({ ...action, timestamp: Date.now() })
  setQueue(queue)
}

// 处理同步队列
export async function processSyncQueue(handler) {
  const queue = getQueue()
  if (queue.length === 0) return

  const failed = []
  for (const action of queue) {
    try {
      await handler(action)
    } catch (e) {
      console.error('同步失败:', e)
      failed.push(action)
    }
  }
  setQueue(failed)
}

// 是否在线
export function isOnline() {
  return navigator.onLine
}

// 网络恢复回调
export function onOnline(callback) {
  window.addEventListener('online', callback)
  return () => window.removeEventListener('online', callback)
}
