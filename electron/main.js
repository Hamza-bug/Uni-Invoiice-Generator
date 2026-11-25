import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'node:fs'
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

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

  register('db:backup', async () => {
    const sourcePath = path.join(app.getPath('userData'), 'invoicedb.sqlite')
    if (!fs.existsSync(sourcePath)) throw new Error('The database file could not be found.')

    const saveResult = await dialog.showSaveDialog({
      title: 'Back up Invoice Manager database',
      defaultPath: path.join(app.getPath('downloads'), 'invoicedb.sqlite'),
      buttonLabel: 'Save Backup',
      filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }],
    })

    if (saveResult.canceled || !saveResult.filePath) return { cancelled: true }

    const journalMode = db.pragma('journal_mode', { simple: true })
    if (String(journalMode).toLowerCase() === 'wal') {
      db.pragma('wal_checkpoint(FULL)')
    }

    fs.copyFileSync(sourcePath, saveResult.filePath)
    return { cancelled: false, filePath: saveResult.filePath }
  })

  register('invoice:exportPDF', async (request) => {
    const exportRequest = typeof request === 'string' ? { html: request } : request
    if (!isRecord(exportRequest)) {
      throw new TypeError('Provide invoice HTML or a URL to export.')
    }

    const hasHtml = typeof exportRequest.html === 'string' && exportRequest.html.trim().length > 0
    const hasUrl = typeof exportRequest.url === 'string' && exportRequest.url.trim().length > 0
    if (hasHtml === hasUrl) {
      throw new TypeError('Provide either invoice HTML or a URL, but not both.')
    }

    let targetUrl
    if (hasHtml) {
      targetUrl = `data:text/html;charset=utf-8,${encodeURIComponent(exportRequest.html)}`
    } else {
      let parsedUrl
      try {
        parsedUrl = new URL(exportRequest.url)
      } catch {
        throw new TypeError('The invoice URL is invalid.')
      }
      if (!['file:', 'http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new TypeError('Invoice URLs must use file, http, or https.')
      }
      targetUrl = parsedUrl.toString()
    }

    const downloadDirectory = app.getPath('downloads')
    fs.mkdirSync(downloadDirectory, { recursive: true })
    const requestedName = typeof exportRequest.filename === 'string'
      ? path.basename(exportRequest.filename)
      : `invoice-${Date.now()}`
    const safeName = requestedName
      .replace(/\.pdf$/i, '')
      .split('')
      .map((character) => /[<>:"/\\|?*]/.test(character) || character.charCodeAt(0) < 32 ? '_' : character)
      .join('')
      .trim() || `invoice-${Date.now()}`
    const filePath = path.join(downloadDirectory, `${safeName}.pdf`)

    const printWindow = new BrowserWindow({
      show: false,
      width: 794,
      height: 1123,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    })

    try {
      await printWindow.loadURL(targetUrl)
      const pdfBuffer = await printWindow.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
      })
      fs.writeFileSync(filePath, pdfBuffer)
      return filePath
    } finally {
      if (!printWindow.isDestroyed()) printWindow.destroy()
    }
  })

  register('auth:login', (enteredPin) => {
    const settings = db.prepare('SELECT pin_code FROM settings LIMIT 1').get()
    return { authenticated: String(enteredPin ?? '') === String(settings?.pin_code ?? '') }
  })

  register('dashboard:getStats', () => {
    const now = new Date()
    const today = formatLocalDate(now)
    const monthStart = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))
    const nextMonthStart = formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 1))
    const chartStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
    const chartStart = formatLocalDate(chartStartDate)
    const chartEnd = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))

    const todaySales = db.prepare(
      'SELECT COALESCE(SUM(total_amount), 0) AS total FROM invoices WHERE date = ?',
    ).get(today).total

    const totalReceivables = db.prepare(
      `SELECT COALESCE(SUM(total_amount - paid_amount), 0) AS total
       FROM invoices
       WHERE LOWER(status) IN ('unpaid', 'partial')`,
    ).get().total

    const totalExpenses = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE date >= ? AND date < ?',
    ).get(monthStart, nextMonthStart).total

    const lowStockCount = db.prepare(
      'SELECT COUNT(*) AS count FROM products WHERE stock <= 5',
    ).get().count

    const salesByDate = db.prepare(
      `SELECT date, COALESCE(SUM(total_amount), 0) AS total
       FROM invoices
       WHERE date >= ? AND date < ?
       GROUP BY date`,
    ).all(chartStart, chartEnd)
    const expensesByDate = db.prepare(
      `SELECT date, COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE date >= ? AND date < ?
       GROUP BY date`,
    ).all(chartStart, chartEnd)

    const salesByDateMap = new Map(salesByDate.map((row) => [row.date, row.total]))
    const expensesByDateMap = new Map(expensesByDate.map((row) => [row.date, row.total]))
    const chartDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
    const chartData = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index)
      const dateKey = formatLocalDate(date)
      return {
        date: chartDateFormatter.format(date),
        sales: salesByDateMap.get(dateKey) ?? 0,
        expenses: expensesByDateMap.get(dateKey) ?? 0,
      }
    })

    return { todaySales, totalReceivables, totalExpenses, lowStockCount, chartData }
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

  ipcMain.handle('db:saveInvoice', async (_event, invoice) => {
    try {
      if (!isRecord(invoice)) throw new TypeError('Invoice data must be provided as an object.')
      if (!Number.isInteger(Number(invoice.customer_id)) || Number(invoice.customer_id) < 1) {
        throw new TypeError('A valid customer ID is required.')
      }
      if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
        throw new TypeError('An invoice must contain at least one item.')
      }

      const invoiceFields = ['total_amount', 'discount', 'tax_amount', 'paid_amount']
      for (const field of invoiceFields) {
        if (typeof invoice[field] !== 'number' || !Number.isFinite(invoice[field])) {
          throw new TypeError(`${field} must be a finite number.`)
        }
      }
      if (typeof invoice.date !== 'string' || !invoice.date.trim()) {
        throw new TypeError('An invoice date is required.')
      }

      for (const item of invoice.items) {
        if (!isRecord(item) || !Number.isInteger(Number(item.product_id)) || Number(item.product_id) < 1) {
          throw new TypeError('Each invoice item must have a valid product ID.')
        }
        if (
          typeof item.quantity !== 'number' || !Number.isFinite(item.quantity) || item.quantity <= 0 ||
          typeof item.unit_price !== 'number' || !Number.isFinite(item.unit_price) || item.unit_price < 0 ||
          typeof item.total_price !== 'number' || !Number.isFinite(item.total_price) || item.total_price < 0
        ) {
          throw new TypeError('Invoice item quantities and prices must be valid non-negative numbers.')
        }
      }

      const createInvoice = db.transaction(() => {
        const invoiceResult = db.prepare(
          `INSERT INTO invoices
            (customer_id, date, total_amount, discount, tax_amount, status, paid_amount)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ).run(
          Number(invoice.customer_id),
          invoice.date.trim(),
          invoice.total_amount,
          invoice.discount,
          invoice.tax_amount,
          typeof invoice.status === 'string' && invoice.status.trim() ? invoice.status.trim() : 'unpaid',
          invoice.paid_amount,
        )

        const invoiceId = Number(invoiceResult.lastInsertRowid)
        const insertItem = db.prepare(
          `INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?)`,
        )
        const reduceStock = db.prepare(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        )
        const findProduct = db.prepare('SELECT name, stock FROM products WHERE id = ?')

        for (const item of invoice.items) {
          const productId = Number(item.product_id)
          const stockResult = reduceStock.run(item.quantity, productId, item.quantity)
          if (stockResult.changes === 0) {
            const product = findProduct.get(productId)
            if (!product) throw new Error(`Product ${productId} was not found.`)
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}.`)
          }

          insertItem.run(
            invoiceId,
            productId,
            item.quantity,
            item.unit_price,
            item.total_price,
          )
        }

        return invoiceId
      })

      const invoiceId = createInvoice()
      return { success: true, invoice_id: invoiceId }
    } catch (error) {
      console.error('IPC handler failed (db:saveInvoice):', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred.',
      }
    }
  })

  register('db:getInvoices', () => {
    return db.prepare(
      `SELECT invoices.*, customers.name AS customer_name
       FROM invoices
       INNER JOIN customers ON customers.id = invoices.customer_id
       ORDER BY invoices.date DESC, invoices.id DESC`,
    ).all()
  })

  register('db:addPayment', (payment) => {
    if (!isRecord(payment)) throw new TypeError('Payment data must be provided as an object.')
    if (!Number.isInteger(Number(payment.invoice_id)) || Number(payment.invoice_id) < 1) {
      throw new TypeError('A valid invoice ID is required.')
    }
    if (!Number.isInteger(Number(payment.customer_id)) || Number(payment.customer_id) < 1) {
      throw new TypeError('A valid customer ID is required.')
    }
    if (typeof payment.amount !== 'number' || !Number.isFinite(payment.amount) || payment.amount <= 0) {
      throw new TypeError('Payment amount must be a positive finite number.')
    }
    if (typeof payment.payment_date !== 'string' || !payment.payment_date.trim()) {
      throw new TypeError('A payment date is required.')
    }
    if (typeof payment.payment_method !== 'string' || !payment.payment_method.trim()) {
      throw new TypeError('A payment method is required.')
    }

    const recordPayment = db.transaction(() => {
      const invoiceId = Number(payment.invoice_id)
      const customerId = Number(payment.customer_id)
      const invoice = db.prepare(
        'SELECT id, customer_id, total_amount FROM invoices WHERE id = ?',
      ).get(invoiceId)

      if (!invoice) throw new Error(`Invoice ${invoiceId} was not found.`)
      if (invoice.customer_id !== customerId) {
        throw new Error('The selected customer does not match this invoice.')
      }

      const paymentResult = db.prepare(
        `INSERT INTO payments (invoice_id, customer_id, amount, payment_date, payment_method)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(
        invoiceId,
        customerId,
        payment.amount,
        payment.payment_date.trim(),
        payment.payment_method.trim(),
      )

      const paidAmount = db.prepare(
        'SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE invoice_id = ?',
      ).get(invoiceId).total_paid
      const totalAmount = Number(invoice.total_amount)
      const status = paidAmount >= totalAmount
        ? 'Paid'
        : paidAmount > 0
          ? 'Partial'
          : 'Unpaid'

      db.prepare('UPDATE invoices SET paid_amount = ?, status = ? WHERE id = ?')
        .run(paidAmount, status, invoiceId)

      return {
        payment: db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentResult.lastInsertRowid),
        invoice: db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId),
      }
    })

    return recordPayment()
  })

  register('db:addExpense', (expense) => {
    if (!isRecord(expense)) throw new TypeError('Expense data must be provided as an object.')
    if (typeof expense.title !== 'string' || !expense.title.trim()) {
      throw new TypeError('An expense title is required.')
    }
    if (typeof expense.amount !== 'number' || !Number.isFinite(expense.amount) || expense.amount < 0) {
      throw new TypeError('Expense amount must be a non-negative finite number.')
    }
    if (typeof expense.date !== 'string' || !expense.date.trim()) {
      throw new TypeError('An expense date is required.')
    }
    if (typeof expense.category !== 'string' || !expense.category.trim()) {
      throw new TypeError('An expense category is required.')
    }

    const result = db.prepare(
      'INSERT INTO expenses (title, amount, date, category) VALUES (?, ?, ?, ?)',
    ).run(expense.title.trim(), expense.amount, expense.date.trim(), expense.category.trim())

    return db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid)
  })

  register('db:getExpenses', () => {
    return db.prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC').all()
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