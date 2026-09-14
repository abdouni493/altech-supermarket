interface BackupShape {
  [key: string]: unknown
}

const KEYS = [
  'cosmetics-auth',
  'cosmetics-products',
  'cosmetics-purchases',
  'cosmetics-sales',
  'cosmetics-clients',
  'cosmetics-suppliers',
  'cosmetics-workers',
  'cosmetics-expenses',
  'cosmetics-settings',
  'cosmetics-caisse',
  'cosmetics-lang',
]

export const exportData = (): void => {
  const backup: BackupShape = {}
  KEYS.forEach((k) => {
    const v = localStorage.getItem(k)
    if (v) backup[k] = JSON.parse(v)
  })
  const blob = new Blob([JSON.stringify({ __cosmetics: true, exportedAt: new Date().toISOString(), data: backup }, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `suppirette-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const importData = (file: File): Promise<void> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const data = parsed.data ?? parsed
        Object.entries(data).forEach(([k, v]) => {
          if (KEYS.includes(k)) localStorage.setItem(k, JSON.stringify(v))
        })
        resolve()
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
