import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: 'https://caring-gull-42071.upstash.io',
  token: 'AaRXAAIjcDEyNWIxMTg5YTczZjA0MTFlOGY3YWY2MTViZTNiNDViYnAxMA',
})

export async function setKV(key: string, value: any, isEdit: boolean = false) {
  try {
    if (isEdit) {
      // For edit operations, we overwrite the existing data
      await redis.set(key, JSON.stringify(value))
    } else {
      // For non-edit operations, we append to the existing data
      const existingData = await getKV(key)
      if (Array.isArray(existingData) && Array.isArray(value)) {
        const newData = [...existingData, ...value]
        await redis.set(key, JSON.stringify(newData))
      } else {
        // If it's not an array, we treat it as a new entry
        await redis.set(key, JSON.stringify(value))
      }
    }
    // Backup to local storage
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting KV for key ${key}:`, error)
    // Fallback to local storage
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export async function getKV(key: string) {
  try {
    const data = await redis.get(key)
    if (typeof data === 'string') {
      return JSON.parse(data)
    }
    return data
  } catch (error) {
    console.error(`Error getting KV for key ${key}:`, error)
    // Fallback to local storage
    const localData = localStorage.getItem(key)
    return localData ? JSON.parse(localData) : null
  }
}

export async function deleteKV(key: string) {
  try {
    await redis.del(key)
    // Remove from local storage as well
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error deleting KV for key ${key}:`, error)
    // Fallback to removing from local storage
    localStorage.removeItem(key)
  }
}

export default redis
