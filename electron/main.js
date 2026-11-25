import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const settingColumns = new Set([
  'company_name',
  'address',
  'phone',
  'logo_base64',
  'tax_rate',
])
const productColumns = new Set(['name', 'barcode', 'price', 'stock', 'tax_rate'])
const customerColumns = new Set(['name', 'phone', 'address', 'opening_balance'])

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function registerDatabaseHandlers(db) {
  const register = (channel, handler) => {
    ipcMain.handle(channel, async (_event, ...args) => {
      try {
        return { success: true, data: await handler(...args) }
      } catch (error) {
        console.error(`IPC handler failed (${channel}):`, error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'An unexpected error occurred.',
        }
      }
    })
  }

  register('auth:login', (enteredPin) => {
    const settings = db.prepare('SELECT pin_code FROM settings LIMIT 1').get()
    return { authenticated: String(enteredPin ?? '') === String(settings?.pin_code ?? '') }
  })

  register('settings:get', () => {
    return db.prepare('SELECT * FROM settings ORDER BY id LIMIT 1').get() ?? null
  })

  register('settings:update', (updates) => {
    if (!isRecord(updates)) throw new TypeError('Settings must be provided as an object.')

    const entries = Object.entries(updates).filter(([column]) => settingColumns.has(column))
    if (entries.length === 0) {
      throw new TypeError('Provide at least one supported settings field to update.')
    }

    const updateSettings = db.transaction(() => {
      const currentSettings = db.prepare('SELECT id FROM settings ORDER BY id LIMIT 1').get()
      if (!currentSettings) throw new Error('Settings have not been initialized.')

      const assignments = entries.map(([column]) => `${column} = ?`).join(', ')
      db.prepare(`UPDATE settings SET ${assignments} WHERE id = ?`).run(
        ...entries.map(([, value]) => value),
        currentSettings.id,
      )

      return db.prepare('SELECT * FROM settings WHERE id = ?').get(currentSettings.id)
    })

    return updateSettings()
  })

  register('db:getProducts', () => {
    return db.prepare('SELECT * FROM products ORDER BY name COLLATE NOCASE, id').all()
  })

  register('db:addProduct', (product) => {
    if (!isRecord(product) || typeof product.name !== 'string' || !product.name.trim()) {
      throw new TypeError('A product name is required.')
    }

    const result = db.prepare(
      `INSERT INTO products (name, barcode, price, stock, tax_rate)
       VALUES (@name, @barcode, @price, @stock, @tax_rate)`,
    ).run({
      name: product.name.trim(),
      barcode: product.barcode ?? null,
      price: product.price ?? 0,
      stock: product.stock ?? 0,
      tax_rate: product.tax_rate ?? 0,
    })

    return db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
  })

  register('db:updateProduct', (product) => {
    if (!isRecord(product) || !Number.isInteger(Number(product.id)) || Number(product.id) < 1) {
      throw new TypeError('A valid product ID is required.')
    }

    const entries = Object.entries(product).filter(([column]) => productColumns.has(column))
    if (entries.length === 0) {
      throw new TypeError('Provide at least one supported product field to update.')
    }
    if (entries.some(([column, value]) => column === 'name' && (typeof value !== 'string' || !value.trim()))) {
      throw new TypeError('Product name cannot be empty.')
    }
    if (entries.some(([column, value]) =>
      ['price', 'stock', 'tax_rate'].includes(column) &&
      (typeof value !== 'number' || !Number.isFinite(value))
    )) {
      throw new TypeError('Price, stock, and tax rate must be finite numbers.')
    }

    const productId = Number(product.id)
    const assignments = entries.map(([column]) => `${column} = ?`).join(', ')
    const result = db.prepare(`UPDATE products SET ${assignments} WHERE id = ?`).run(
      ...entries.map(([column, value]) => column === 'name' ? value.trim() : value),
      productId,
    )

    if (result.changes === 0) throw new Error(`Product ${productId} was not found.`)
    return db.prepare('SELECT * FROM products WHERE id = ?').get(productId)
  })

  register('db:deleteProduct', (productId) => {
    if (!Number.isInteger(Number(productId)) || Number(productId) < 1) {
      throw new TypeError('A valid product ID is required.')
    }

    const result = db.prepare('DELETE FROM products WHERE id = ?').run(Number(productId))
    if (result.changes === 0) throw new Error(`Product ${productId} was not found.`)
    return { deleted: true, id: Number(productId) }
  })

  register('db:getCustomers', () => {
    return db.prepare('SELECT * FROM customers ORDER BY name COLLATE NOCASE, id').all()
  })

  register('db:addCustomer', (customer) => {
    if (!isRecord(customer) || typeof customer.name !== 'string' || !customer.name.trim()) {
      throw new TypeError('A customer name is required.')
    }

    const result = db.prepare(
      `INSERT INTO customers (name, phone, address, opening_balance)
       VALUES (@name, @phone, @address, @opening_balance)`,
    ).run({
      name: customer.name.trim(),
      phone: customer.phone ?? null,
      address: customer.address ?? null,
      opening_balance: customer.opening_balance ?? 0,
    })

    return db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid)
  })

  register('db:updateCustomer', (customer) => {
    if (!isRecord(customer) || !Number.isInteger(Number(customer.id)) || Number(customer.id) < 1) {
      throw new TypeError('A valid customer ID is required.')
    }

    const entries = Object.entries(customer).filter(([column]) => customerColumns.has(column))
    if (entries.length === 0) {
      throw new TypeError('Provide at least one supported customer field to update.')
    }
    if (entries.some(([column, value]) => column === 'name' && (typeof value !== 'string' || !value.trim()))) {
      throw new TypeError('Customer name cannot be empty.')
    }
    if (entries.some(([column, value]) =>
      column === 'opening_balance' && (typeof value !== 'number' || !Number.isFinite(value))
    )) {
      throw new TypeError('Opening balance must be a finite number.')
    }

    const customerId = Number(customer.id)
    const assignments = entries.map(([column]) => `${column} = ?`).join(', ')
    const result = db.prepare(`UPDATE customers SET ${assignments} WHERE id = ?`).run(
      ...entries.map(([column, value]) => column === 'name' ? value.trim() : value),
      customerId,
    )

    if (result.changes === 0) throw new Error(`Customer ${customerId} was not found.`)
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId)
  })

  register('db:deleteCustomer', (customerId) => {
    if (!Number.isInteger(Number(customerId)) || Number(customerId) < 1) {
      throw new TypeError('A valid customer ID is required.')
    }

    const result = db.prepare('DELETE FROM customers WHERE id = ?').run(Number(customerId))
    if (result.changes === 0) throw new Error(`Customer ${customerId} was not found.`)
    return { deleted: true, id: Number(customerId) }
  })

  register('db:getCustomerLedger', (customerId) => {
    if (!Number.isInteger(Number(customerId)) || Number(customerId) < 1) {
      throw new TypeError('A valid customer ID is required.')
    }

    const id = Number(customerId)
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id)
    if (!customer) throw new Error(`Customer ${id} was not found.`)

    const invoices = db.prepare(
      'SELECT * FROM invoices WHERE customer_id = ? ORDER BY date DESC, id DESC',
    ).all(id)
    const payments = db.prepare(
      'SELECT * FROM payments WHERE customer_id = ? ORDER BY payment_date DESC, id DESC',
    ).all(id)

    return { customer, invoices, payments }
  })
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(currentDirectory, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (app.isPackaged) {
    window.loadFile(path.join(currentDirectory, '../dist/index.html'))
  } else {
    window.loadURL('http://127.0.0.1:5173')
  }
}

app.whenReady().then(async () => {
  const { default: db } = await import('./database.js')
  registerDatabaseHandlers(db)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})