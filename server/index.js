const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

const DATA_FILE = path.join(__dirname, 'data.json')

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    return {
      products: [],
      clients: [],
      suppliers: [],
      purchases: [],
      sales: [],
      workers: [],
      expenses: [],
      caisse: [],
      settings: null,
    }
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

let DB = loadData()

const app = express()
app.use(cors())
app.use(bodyParser.json())

function list(table) {
  return DB[table] || []
}

function insert(table, obj) {
  const id = obj.id || randomUUID()
  const item = { ...obj, id }
  DB[table] = [item, ...(DB[table] || [])]
  saveData(DB)
  return item
}

function upsert(table, id, obj) {
  const item = { ...obj, id }
  DB[table] = DB[table] || []
  const idx = DB[table].findIndex((r) => r.id === id)
  if (idx >= 0) DB[table][idx] = item
  else DB[table].push(item)
  saveData(DB)
  return item
}

function remove(table, id) {
  DB[table] = (DB[table] || []).filter((r) => r.id !== id)
  saveData(DB)
}

;['products','clients','suppliers','purchases','sales','workers','expenses','caisse'].forEach((table) => {
  app.get(`/api/${table}`, (req, res) => res.json(list(table)))
  app.post(`/api/${table}`, (req, res) => {
    try {
      const obj = insert(table, req.body)
      res.json(obj)
    } catch (e) {
      res.status(500).json({ error: String(e) })
    }
  })
  app.put(`/api/${table}/:id`, (req, res) => {
    try {
      const obj = upsert(table, req.params.id, req.body)
      res.json(obj)
    } catch (e) {
      res.status(500).json({ error: String(e) })
    }
  })
  app.delete(`/api/${table}/:id`, (req, res) => {
    try {
      remove(table, req.params.id)
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: String(e) })
    }
  })
})

app.get('/api/settings', (req, res) => res.json(DB.settings || null))
app.post('/api/settings', (req, res) => {
  DB.settings = req.body
  saveData(DB)
  res.json(DB.settings)
})

app.post('/api/auth/demo', (req, res) => {
  const demo = { id: 'admin-demo', fullName: 'Admin Démo', username: 'admin', email: 'admin@suppirette.com', password: 'demo2024', role: 'Administrateur', permissions: 'ALL', isDemo: true }
  // store as worker for persistence convenience
  upsert('workers', demo.id, demo)
  res.json(demo)
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
