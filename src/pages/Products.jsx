import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'

const emptyProduct = {
  name: '',
  barcode: '',
  price: '',
  stock: '',
  tax_rate: '',
}

function ProductDialog({ product, isSaving, error, onClose, onSubmit }) {
  const [form, setForm] = useState(() => product ? {
    name: product.name ?? '',
    barcode: product.barcode ?? '',
    price: String(product.price ?? 0),
    stock: String(product.stock ?? 0),
    tax_rate: String(product.tax_rate ?? 0),
  } : emptyProduct)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      ...(product ? { id: product.id } : {}),
      name: form.name.trim(),
      barcode: form.barcode.trim() || null,
      price: Number(form.price),
      stock: Number(form.stock),
      tax_rate: Number(form.tax_rate),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#101613]/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
        className="my-auto w-full max-w-xl rounded-xl border border-[#dfe6df] bg-white shadow-2xl dark:border-white/10 dark:bg-[#151e19]"
      >
        <div className="flex items-start justify-between border-b border-[#e8ede8] px-5 py-4 dark:border-white/10 sm:px-6">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase text-emerald-800 dark:text-lime-300">
              Inventory
            </p>
            <h2 id="product-dialog-title" className="text-lg font-semibold text-[#17211d] dark:text-white">
              {product ? 'Edit product' : 'Add product'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close dialog"
            className="grid size-9 place-items-center rounded-lg text-[#6b7a70] transition hover:bg-[#eff3ef] dark:text-[#a7b6ac] dark:hover:bg-white/[0.07]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
              <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Name</span>
            <input
              autoFocus
              required
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Product name"
              className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Barcode</span>
            <input
              name="barcode"
              value={form.barcode}
              onChange={updateField}
              placeholder="Optional barcode"
              className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Price</span>
              <input
                required
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={updateField}
                placeholder="0.00"
                className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Stock</span>
              <input
                required
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={updateField}
                placeholder="0"
                className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Tax rate (%)</span>
              <input
                required
                name="tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.tax_rate}
                onChange={updateField}
                placeholder="0"
                className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#e8ede8] pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 rounded-lg px-4 text-sm font-medium text-[#536258] transition hover:bg-[#eff3ef] disabled:opacity-50 dark:text-[#b2c0b6] dark:hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60 dark:bg-lime-300 dark:text-[#17211d] dark:hover:bg-lime-200"
            >
              {isSaving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
              {isSaving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [dialogProduct, setDialogProduct] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  async function loadProducts() {
    try {
      const result = await Promise.resolve().then(() => {
        if (!window.api?.getProducts) {
          throw new Error('Products are available when running the desktop app.')
        }
        return window.api.getProducts()
      })
      if (!result?.success) throw new Error(result?.error || 'Could not load products.')
      setProducts(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not load products.')
    } finally {
      setIsLoading(false)
    }
  }

  function retryLoadProducts() {
    setIsLoading(true)
    setPageError('')
    loadProducts()
  }

  useEffect(() => {
    void Promise.resolve().then(loadProducts)
  }, [])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return products
    return products.filter((product) =>
      `${product.name ?? ''} ${product.barcode ?? ''}`.toLocaleLowerCase().includes(query),
    )
  }, [products, search])

  function openAddDialog() {
    setDialogProduct(null)
    setDialogError('')
    setIsDialogOpen(true)
  }

  function openEditDialog(product) {
    setDialogProduct(product)
    setDialogError('')
    setIsDialogOpen(true)
  }

  function closeDialog() {
    if (isSaving) return
    setIsDialogOpen(false)
    setDialogError('')
  }

  async function saveProduct(product) {
    setIsSaving(true)
    setDialogError('')
    try {
      const method = dialogProduct ? window.api?.updateProduct : window.api?.addProduct
      if (!method) throw new Error('Product editing is available when running the desktop app.')

      const result = await method(product)
      if (!result?.success) throw new Error(result?.error || 'Could not save product.')

      setProducts((current) => {
        if (!dialogProduct) return [...current, result.data]
        return current.map((item) => item.id === result.data.id ? result.data : item)
      })
      setIsDialogOpen(false)
      setDialogProduct(null)
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : 'Could not save product.')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return

    setPageError('')
    try {
      if (!window.api?.deleteProduct) throw new Error('Product deletion is available when running the desktop app.')
      const result = await window.api.deleteProduct(product.id)
      if (!result?.success) throw new Error(result?.error || 'Could not delete product.')
      setProducts((current) => current.filter((item) => item.id !== product.id))
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not delete product.')
    }
  }

  return (
    <section>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-emerald-800 dark:text-lime-300">Inventory</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#17211d] dark:text-white">Products</h1>
          <p className="mt-2 text-sm leading-6 text-[#66756c] dark:text-[#9aa99f]">
            Manage product details, pricing, and available stock.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddDialog}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-800/20 dark:bg-lime-300 dark:text-[#17211d] dark:hover:bg-lime-200"
        >
          <Plus size={17} aria-hidden="true" />
          Add Product
        </button>
      </div>

      {pageError && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="flex-1">{pageError}</span>
          <button type="button" onClick={retryLoadProducts} className="font-semibold underline underline-offset-2">Retry</button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#dfe6df] bg-white shadow-sm dark:border-white/10 dark:bg-[#151e19]">
        <div className="flex flex-col gap-3 border-b border-[#e8ede8] p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Product catalogue</h2>
            <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#829087] dark:text-[#839288]" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or barcode"
              aria-label="Search products by name or barcode"
              className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white pl-9 pr-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-[#f7f9f6] text-[11px] font-semibold uppercase text-[#76847a] dark:bg-white/[0.025] dark:text-[#91a097]">
                <th scope="col" className="px-5 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Barcode</th>
                <th scope="col" className="px-4 py-3 text-right">Price</th>
                <th scope="col" className="px-4 py-3">Stock</th>
                <th scope="col" className="px-4 py-3 text-right">Tax</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0ed] dark:divide-white/[0.07]">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="h-44 text-center text-sm text-[#78867d] dark:text-[#91a097]">
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Loading products
                    </span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="h-48 px-5 text-center">
                    <span className="mx-auto mb-3 grid size-10 place-items-center rounded-lg bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300">
                      <Package size={19} aria-hidden="true" />
                    </span>
                    <p className="text-sm font-medium text-[#34443a] dark:text-[#d4dfd6]">
                      {search ? 'No matching products' : 'No products yet'}
                    </p>
                    <p className="mt-1 text-xs text-[#78867d] dark:text-[#91a097]">
                      {search ? 'Try another name or barcode.' : 'Add a product to start building your catalogue.'}
                    </p>
                  </td>
                </tr>
              ) : filteredProducts.map((product) => {
                const isLowStock = Number(product.stock) < 5
                return (
                  <tr key={product.id} className="transition-colors hover:bg-[#fafbf9] dark:hover:bg-white/[0.025]">
                    <td className="px-5 py-4">
                      <span className="block max-w-[240px] truncate text-sm font-medium text-[#26352c] dark:text-[#e7eee9]" title={product.name}>
                        {product.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#728077] dark:text-[#9aa99f]">
                      {product.barcode || <span className="text-[#a1aca4] dark:text-white/25">—</span>}
                    </td>
                    <td className="px-4 py-4 text-right text-sm tabular-nums text-[#34443a] dark:text-[#d4dfd6]">
                      {Number(product.price ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
                          <AlertCircle size={14} aria-hidden="true" />
                          {product.stock} <span className="text-[10px] font-semibold uppercase">Low stock</span>
                        </span>
                      ) : (
                        <span className="text-sm tabular-nums text-[#34443a] dark:text-[#d4dfd6]">{product.stock}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-sm tabular-nums text-[#728077] dark:text-[#9aa99f]">
                      {Number(product.tax_rate ?? 0)}%
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditDialog(product)}
                          aria-label={`Edit ${product.name}`}
                          title="Edit product"
                          className="grid size-8 place-items-center rounded-md text-[#617167] transition hover:bg-[#edf3ed] hover:text-emerald-800 dark:text-[#a7b6ac] dark:hover:bg-white/[0.08] dark:hover:text-lime-300"
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(product)}
                          aria-label={`Delete ${product.name}`}
                          title="Delete product"
                          className="grid size-8 place-items-center rounded-md text-[#8b7775] transition hover:bg-rose-50 hover:text-rose-700 dark:text-[#b39491] dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredProducts.length > 0 && (
          <div className="border-t border-[#e8ede8] px-5 py-3 text-xs text-[#78867d] dark:border-white/10 dark:text-[#91a097]">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>

      {isDialogOpen && (
        <ProductDialog
          product={dialogProduct}
          isSaving={isSaving}
          error={dialogError}
          onClose={closeDialog}
          onSubmit={saveProduct}
        />
      )}
    </section>
  )
}