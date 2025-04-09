import { kv } from '@vercel/kv'

const isKVConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

export async function getKV(key: string) {
  if (isKVConfigured) {
    return await kv.get(key)
  } else {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  }
}

export async function setKV(key: string, value: any) {
  if (isKVConfigured) {
    await kv.set(key, value)
  } else {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export async function deleteKV(key: string) {
  if (isKVConfigured) {
    await kv.del(key)
  } else {
    localStorage.removeItem(key)
  }
}
