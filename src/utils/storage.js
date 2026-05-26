export function load(key, defaultVal) {
  try {
    const raw = localStorage.getItem('mengya_' + key)
    return raw ? JSON.parse(raw) : defaultVal
  } catch { return defaultVal }
}

export function save(key, val) {
  try { localStorage.setItem('mengya_' + key, JSON.stringify(val)) } catch {}
}

export function clearAll() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('mengya_'))
  keys.forEach(k => localStorage.removeItem(k))
}
