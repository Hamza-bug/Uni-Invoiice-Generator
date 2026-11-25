import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FilePlus2,
  LoaderCircle,
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'

function todayAsInputValue() {
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function unwrapResponse(result, fallbackMessage) {
  if (!result?.success) throw new Error(result?.error || fallbackMessage)
  return result.data
}

function toCents(amount) {
  return Math.round((Number(amount) + Number.EPSILON) * 100)
}

function fromCents(cents) {
  return cents / 100
}

function lineTotalCents(item) {
  return toCents(Number(item.quantity || 0) * Number(item.unit_price || 0))
}

export default function CreateInvoice() {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(todayAsInputValue)
  const [productSearch, setProductSearch] = useState('')
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false)
  const [items, setItems] = useState([])
  const [discountInput, setDiscountInput] = useState('0')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadInvoiceOptions() {
    try {
      const [customerResult, productResult] = await Promise.all([
        window.api?.getCustomers?.(),
        window.api?.getProducts?.(),
      ])

      const customerRows = unwrapResponse(customerResult, 'Could not load customers.')
      const productRows = unwrapResponse(productResult, 'Could not load products.')
      setCustomers(Array.isArray(customerRows) ? customerRows : [])
      setProducts(Array.isArray(productRows) ? productRows : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load invoice data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadInvoiceOptions)
  }, [])

  const matchingProducts = useMemo(() => {
    const query = productSearch.trim().toLocaleLowerCase()
    const availableProducts = products.filter((product) => Number(product.stock) > 0)
    if (!query) return availableProducts.slice(0, 8)
    return availableProducts
      .filter((product) =>
        `${product.name ?? ''} ${product.barcode ?? ''}`.toLocaleLowerCase().includes(query),
      )
      .slice(0, 8)
  }, [products, productSearch])

  const subtotalCents = items.reduce((sum, item) => sum + lineTotalCents(item), 0)
  const discountCents = Math.min(Math.max(toCents(discountInput || 0), 0), subtotalCents)
  const taxableRatio = subtotalCents > 0 ? (subtotalCents - discountCents) / subtotalCents : 0
  const taxCents = items.reduce((sum, item) => {
    const discountedLineCents = Math.round(lineTotalCents(item) * taxableRatio)
    return sum + Math.round(discountedLineCents * Number(item.tax_rate || 0) / 100)
  }, 0)
  const grandTotalCents = Math.max(0, subtotalCents - discountCents + taxCents)

  function addProduct(product) {
    setError('')
    setSuccess('')
    const existing = items.find((item) => item.product_id === product.id)
    if (existing && Number(existing.quantity) + 1 > Number(product.stock)) {
      setError(`Only ${product.stock} units of ${product.name} are in stock.`)
      return
    }

    if (existing) {
      setItems((current) => current.map((item) => item.product_id === product.id
        ? { ...item, quantity: String(Number(item.quantity) + 1) }
        : item))
    } else {
      setItems((current) => [...current, {
        product_id: product.id,
        name: product.name,
        barcode: product.barcode,
        stock: Number(product.stock),
        quantity: '1',
        unit_price: String(product.price ?? 0),
        tax_rate: Number(product.tax_rate ?? 0),
      }])
    }
    setProductSearch('')
    setIsProductMenuOpen(false)
  }

  function updateItem(productId, field, value) {
    setItems((current) => current.map((item) =>
      item.product_id === productId ? { ...item, [field]: value } : item,
    ))
    setError('')
    setSuccess('')
  }

  function removeItem(productId) {
    setItems((current) => current.filter((item) => item.product_id !== productId))
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (items.length === 0) {
      setError('Add at least one product to the invoice.')
      return
    }
    if (!customerId) {
      setError('Select a customer before saving the invoice.')
      return
    }
    if (!invoiceDate) {
      setError('Select an invoice date before saving.')
      return
    }

    const invalidItem = items.find((item) =>
      !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0 ||
      !Number.isFinite(Number(item.unit_price)) || Number(item.unit_price) < 0 ||
      Number(item.quantity) > item.stock,
    )
    if (invalidItem) {
      setError(`Check the quantity and unit price for ${invalidItem.name}. Quantity cannot exceed stock.`)
      return
    }

    setIsSaving(true)
    try {
      if (!window.api?.saveInvoice) throw new Error('Invoice saving is available when running the desktop app.')

      const payload = {
        customer_id: Number(customerId),
        date: invoiceDate,
        total_amount: fromCents(grandTotalCents),
        discount: fromCents(discountCents),
        tax_amount: fromCents(taxCents),
        paid_amount: 0,
        status: 'unpaid',
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total_price: fromCents(lineTotalCents(item)),
        })),
      }
      const result = await window.api.saveInvoice(payload)

      if (!result?.success) throw new Error(result?.error || 'Could not save invoice.')

      setSuccess(`Invoice #${result.invoice_id} saved successfully.`)
      setItems([])
      setDiscountInput('0')
      setCustomerId('')
      setProductSearch('')
      setIsProductMenuOpen(false)
      setInvoiceDate(todayAsInputValue())
      const productsResult = await window.api.getProducts()
      if (productsResult?.success && Array.isArray(productsResult.data)) setProducts(productsResult.data)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save invoice.')
    } finally {
      setIsSaving(false)
    }
  }

  function formatAmount(amount) {
    return Number(amount || 0).toFixed(2)
  }

  return (
    <section>
      <div className="mb-7">
        <p className="mb-2 text-xs font-semibold uppercase text-emerald-800 dark:text-lime-300">Sales</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#17211d] dark:text-white">Create invoice</h1>
        <p className="mt-2 text-sm leading-6 text-[#66756c] dark:text-[#9aa99f]">
          Select a customer and add products to prepare a new invoice.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-lime-300/20 dark:bg-lime-300/10 dark:text-lime-200">
          <CheckCircle2 size={17} aria-hidden="true" />
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-2 rounded-xl border border-[#dfe6df] bg-white text-sm text-[#78867d] dark:border-white/10 dark:bg-[#151e19] dark:text-[#91a097]">
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
          Loading customers and products
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            <section className="rounded-xl border border-[#dfe6df] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151e19] sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300">
                  <UserRound size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Invoice details</h2>
                  <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Customer and issue date</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Customer</span>
                  <select
                    value={customerId}
                    onChange={(event) => setCustomerId(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
                  >
                    <option value="">Choose a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                  {customers.length === 0 && (
                    <span className="block text-xs text-amber-700 dark:text-amber-300">Add a customer before creating an invoice.</span>
                  )}
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Invoice date</span>
                  <span className="relative block">
                    <CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#829087] dark:text-[#839288]" aria-hidden="true" />
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(event) => setInvoiceDate(event.target.value)}
                      className="h-11 w-full rounded-lg border border-[#d8e0d9] bg-white pl-9 pr-3 text-sm text-[#17211d] outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
                    />
                  </span>
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-[#dfe6df] bg-white shadow-sm dark:border-white/10 dark:bg-[#151e19]">
              <div className="flex flex-col gap-4 border-b border-[#e8ede8] p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300">
                    <Package size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Selected items</h2>
                    <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">{items.length} {items.length === 1 ? 'line item' : 'line items'}</p>
                  </div>
                </div>

                <div className="relative w-full sm:max-w-sm">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#829087] dark:text-[#839288]" aria-hidden="true" />
                  <input
                    type="search"
                    value={productSearch}
                    onFocus={() => setIsProductMenuOpen(true)}
                    onChange={(event) => {
                      setProductSearch(event.target.value)
                      setIsProductMenuOpen(true)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setIsProductMenuOpen(false)
                      if (event.key === 'Enter' && matchingProducts[0]) {
                        event.preventDefault()
                        addProduct(matchingProducts[0])
                      }
                    }}
                    placeholder="Search products to add"
                    aria-label="Search products to add to invoice"
                    aria-expanded={isProductMenuOpen}
                    className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white pl-9 pr-9 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
                  />
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#829087] dark:text-[#839288]" aria-hidden="true" />

                  {isProductMenuOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close product search results"
                        onClick={() => setIsProductMenuOpen(false)}
                        className="fixed inset-0 z-10 cursor-default"
                      />
                      <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-72 overflow-y-auto rounded-lg border border-[#dfe6df] bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#151e19]">
                        {matchingProducts.length === 0 ? (
                          <p className="px-3 py-4 text-center text-xs text-[#78867d] dark:text-[#91a097]">
                            {products.length === 0 ? 'No products in catalogue.' : 'No matching in-stock products.'}
                          </p>
                        ) : matchingProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addProduct(product)}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-[#f3f6f2] dark:hover:bg-white/[0.06]"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-[#26352c] dark:text-[#e7eee9]">{product.name}</span>
                              <span className="mt-0.5 block truncate text-xs text-[#78867d] dark:text-[#91a097]">
                                {product.barcode || 'No barcode'} · {product.stock} in stock
                              </span>
                            </span>
                            <span className="shrink-0 text-sm font-medium tabular-nums text-[#34443a] dark:text-[#d4dfd6]">
                              {formatAmount(product.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#f7f9f6] text-[10px] font-semibold uppercase text-[#76847a] dark:bg-white/[0.025] dark:text-[#91a097]">
                      <th scope="col" className="px-5 py-3">Product name</th>
                      <th scope="col" className="px-3 py-3">Quantity</th>
                      <th scope="col" className="px-3 py-3">Unit price</th>
                      <th scope="col" className="px-3 py-3 text-right">Total price</th>
                      <th scope="col" className="px-4 py-3 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0ed] dark:divide-white/[0.07]">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="h-36 px-5 text-center">
                          <p className="text-sm font-medium text-[#536258] dark:text-[#b2c0b6]">No items selected</p>
                          <p className="mt-1 text-xs text-[#859188] dark:text-[#819087]">Search the catalogue above to add products.</p>
                        </td>
                      </tr>
                    ) : items.map((item) => (
                      <tr key={item.product_id}>
                        <td className="px-5 py-3.5">
                          <span className="block max-w-[190px] truncate text-sm font-medium text-[#26352c] dark:text-[#e7eee9]">{item.name}</span>
                          <span className="mt-0.5 block text-[11px] text-[#859188] dark:text-[#819087]">Tax {item.tax_rate}% · {item.stock} in stock</span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="flex h-9 w-[104px] items-center rounded-md border border-[#d8e0d9] bg-white dark:border-white/15 dark:bg-[#101613]">
                            <button
                              type="button"
                              onClick={() => updateItem(item.product_id, 'quantity', String(Math.max(0, Number(item.quantity) - 1)))}
                              aria-label={`Decrease ${item.name} quantity`}
                              className="grid size-8 shrink-0 place-items-center text-[#718077] hover:text-[#17211d] dark:text-[#a7b6ac] dark:hover:text-white"
                            >
                              <Minus size={13} aria-hidden="true" />
                            </button>
                            <input
                              type="number"
                              min="0.01"
                              max={item.stock}
                              step="0.01"
                              value={item.quantity}
                              onChange={(event) => updateItem(item.product_id, 'quantity', event.target.value)}
                              aria-label={`${item.name} quantity`}
                              className="w-full min-w-0 bg-transparent text-center text-sm tabular-nums text-[#17211d] outline-none dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => updateItem(item.product_id, 'quantity', String(Math.min(item.stock, Number(item.quantity || 0) + 1)))}
                              aria-label={`Increase ${item.name} quantity`}
                              className="grid size-8 shrink-0 place-items-center text-[#718077] hover:text-[#17211d] dark:text-[#a7b6ac] dark:hover:text-white"
                            >
                              <Plus size={13} aria-hidden="true" />
                            </button>
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(event) => updateItem(item.product_id, 'unit_price', event.target.value)}
                            aria-label={`${item.name} unit price`}
                            className="h-9 w-28 rounded-md border border-[#d8e0d9] bg-white px-2 text-sm tabular-nums text-[#17211d] outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
                          />
                        </td>
                        <td className="px-3 py-3.5 text-right text-sm font-medium tabular-nums text-[#26352c] dark:text-[#e7eee9]">
                          {formatAmount(fromCents(lineTotalCents(item)))}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id)}
                            aria-label={`Remove ${item.name}`}
                            title="Remove item"
                            className="grid size-8 place-items-center rounded-md text-[#8b7775] transition hover:bg-rose-50 hover:text-rose-700 dark:text-[#b39491] dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="rounded-xl border border-[#dfe6df] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151e19] xl:sticky xl:top-[88px]">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300">
                <FilePlus2 size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Summary</h2>
                <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Invoice totals</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[#66756c] dark:text-[#9aa99f]">Subtotal</span>
                <span className="font-medium tabular-nums text-[#26352c] dark:text-[#e7eee9]">{formatAmount(fromCents(subtotalCents))}</span>
              </div>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[#66756c] dark:text-[#9aa99f]">Discount</span>
                <span className="relative block w-28">
                  <input
                    type="number"
                    min="0"
                    max={fromCents(subtotalCents)}
                    step="0.01"
                    value={discountInput}
                    onChange={(event) => {
                      setDiscountInput(event.target.value)
                      setSuccess('')
                    }}
                    aria-label="Discount amount"
                    className="h-9 w-full rounded-md border border-[#d8e0d9] bg-white px-2 text-right text-sm tabular-nums text-[#17211d] outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
                  />
                </span>
              </label>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[#66756c] dark:text-[#9aa99f]">Tax amount</span>
                <span className="font-medium tabular-nums text-[#26352c] dark:text-[#e7eee9]">{formatAmount(fromCents(taxCents))}</span>
              </div>
              <div className="border-t border-dashed border-[#d8e0d9] pt-4 dark:border-white/15">
                <div className="flex items-end justify-between gap-3">
                  <span className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Grand total</span>
                  <span className="text-2xl font-semibold tabular-nums text-emerald-800 dark:text-lime-300">{formatAmount(fromCents(grandTotalCents))}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-800/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-lime-300 dark:text-[#17211d] dark:hover:bg-lime-200"
            >
              {isSaving ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <FilePlus2 size={17} aria-hidden="true" />}
              {isSaving ? 'Saving invoice…' : 'Save Invoice'}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-[#859188] dark:text-[#819087]">
              Stock is updated when the invoice is saved.
            </p>
          </aside>
        </form>
      )}
    </section>
  )
}