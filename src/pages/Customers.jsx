import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BookOpenText,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'

const emptyCustomer = {
  name: '',
  phone: '',
  address: '',
  opening_balance: '',
}

function CustomerDialog({ customer, isSaving, error, onClose, onSubmit }) {
  const [form, setForm] = useState(() => customer ? {
    name: customer.name ?? '',
    phone: customer.phone ?? '',
    address: customer.address ?? '',
    opening_balance: String(customer.opening_balance ?? 0),
  } : emptyCustomer)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      ...(customer ? { id: customer.id } : {}),
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      opening_balance: Number(form.opening_balance || 0),
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
        aria-labelledby="customer-dialog-title"
        className="my-auto w-full max-w-xl rounded-xl border border-[#dfe6df] bg-white shadow-2xl dark:border-white/10 dark:bg-[#151e19]"
      >
        <div className="flex items-start justify-between border-b border-[#e8ede8] px-5 py-4 dark:border-white/10 sm:px-6">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase text-emerald-800 dark:text-lime-300">
              Customers
            </p>
            <h2 id="customer-dialog-title" className="text-lg font-semibold text-[#17211d] dark:text-white">
              {customer ? 'Edit customer' : 'Add customer'}
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
              placeholder="Customer name"
              className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Phone</span>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              placeholder="Phone number"
              className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Address</span>
            <textarea
              name="address"
              rows="3"
              value={form.address}
              onChange={updateField}
              placeholder="Street, city, region"
              className="w-full resize-y rounded-lg border border-[#d8e0d9] bg-white px-3 py-2.5 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Opening balance</span>
            <input
              name="opening_balance"
              type="number"
              step="0.01"
              value={form.opening_balance}
              onChange={updateField}
              placeholder="0.00"
              className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </label>

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
              {isSaving ? 'Saving…' : customer ? 'Save changes' : 'Add customer'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function CustomerLedger({ customer, onClose }) {
  const [ledger, setLedger] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadLedger() {
      try {
        const result = await Promise.resolve().then(() => {
          if (!window.api?.getCustomerLedger) {
            throw new Error('Customer ledgers are available when running the desktop app.')
          }
          return window.api.getCustomerLedger(customer.id)
        })

        if (!result?.success) throw new Error(result?.error || 'Could not load customer ledger.')
        if (isMounted) setLedger(result.data)
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load customer ledger.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadLedger()
    return () => {
      isMounted = false
    }
  }, [customer.id])

  const invoices = ledger?.invoices ?? []
  const payments = ledger?.payments ?? []
  const totalBilled = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0)
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const openingBalance = Number(ledger?.customer?.opening_balance ?? customer.opening_balance ?? 0)
  const outstandingBalance = openingBalance + totalBilled - totalPaid
  const transactions = [
    ...invoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      date: invoice.date,
      type: 'Invoice',
      detail: `Invoice #${invoice.id}`,
      debit: Number(invoice.total_amount || 0),
      credit: 0,
    })),
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      date: payment.payment_date,
      type: 'Payment',
      detail: payment.payment_method || 'Customer payment',
      debit: 0,
      credit: Number(payment.amount || 0),
    })),
  ].sort((first, second) => {
    const firstTimestamp = Date.parse(first.date)
    const secondTimestamp = Date.parse(second.date)
    if (Number.isNaN(firstTimestamp) || Number.isNaN(secondTimestamp)) {
      return String(second.date ?? '').localeCompare(String(first.date ?? ''))
    }
    return secondTimestamp - firstTimestamp
  })

  function formatDate(date) {
    const parsedDate = new Date(date)
    return Number.isNaN(parsedDate.getTime()) ? date || '—' : parsedDate.toLocaleDateString()
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#101613]/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ledger-dialog-title"
        className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto rounded-xl border border-[#dfe6df] bg-white shadow-2xl dark:border-white/10 dark:bg-[#151e19]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e8ede8] bg-white/95 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-[#151e19]/95 sm:px-6">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase text-emerald-800 dark:text-lime-300">Account ledger</p>
            <h2 id="ledger-dialog-title" className="text-lg font-semibold text-[#17211d] dark:text-white">
              {ledger?.customer?.name ?? customer.name}
            </h2>
            <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Invoices, payments, and current balance</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ledger"
            className="grid size-9 place-items-center rounded-lg text-[#6b7a70] transition hover:bg-[#eff3ef] dark:text-[#a7b6ac] dark:hover:bg-white/[0.07]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
              <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-[#78867d] dark:text-[#91a097]">
              <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
              Loading ledger
            </div>
          ) : !error && (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <section className="rounded-lg border border-[#dfe6df] bg-[#f7f9f6] p-4 dark:border-white/10 dark:bg-[#101613]">
                  <p className="text-xs font-medium text-[#78867d] dark:text-[#91a097]">Total billed</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-[#26352c] dark:text-[#e7eee9]">
                    {totalBilled.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-[#859188] dark:text-[#819087]">{invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}</p>
                </section>
                <section className="rounded-lg border border-[#dfe6df] bg-[#f7f9f6] p-4 dark:border-white/10 dark:bg-[#101613]">
                  <p className="text-xs font-medium text-[#78867d] dark:text-[#91a097]">Total paid</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-700 dark:text-lime-300">
                    {totalPaid.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-[#859188] dark:text-[#819087]">{payments.length} {payments.length === 1 ? 'payment' : 'payments'}</p>
                </section>
                <section className="rounded-lg border border-[#dfe6df] bg-[#f7f9f6] p-4 dark:border-white/10 dark:bg-[#101613]">
                  <p className="text-xs font-medium text-[#78867d] dark:text-[#91a097]">Outstanding balance</p>
                  <p className={`mt-2 text-2xl font-semibold tabular-nums ${outstandingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-lime-300'}`}>
                    {outstandingBalance.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-[#859188] dark:text-[#819087]">
                    Opening balance {openingBalance.toFixed(2)}
                  </p>
                </section>
              </div>

              <section className="overflow-hidden rounded-lg border border-[#dfe6df] dark:border-white/10">
                <div className="flex items-center justify-between border-b border-[#e8ede8] px-4 py-3 dark:border-white/10 sm:px-5">
                  <div>
                    <h3 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Transaction history</h3>
                    <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Invoices are charges; payments are credits.</p>
                  </div>
                  <BookOpenText size={17} className="text-[#809087] dark:text-[#91a097]" aria-hidden="true" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead>
                      <tr className="bg-[#f7f9f6] text-[10px] font-semibold uppercase text-[#76847a] dark:bg-white/[0.025] dark:text-[#91a097]">
                        <th scope="col" className="px-4 py-3 sm:px-5">Date</th>
                        <th scope="col" className="px-4 py-3">Type</th>
                        <th scope="col" className="px-4 py-3">Details</th>
                        <th scope="col" className="px-4 py-3 text-right">Debit / charge</th>
                        <th scope="col" className="px-4 py-3 text-right sm:px-5">Credit / payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf0ed] dark:divide-white/[0.07]">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="h-28 px-4 text-center text-sm text-[#78867d] dark:text-[#91a097]">
                            No invoices or payments recorded yet.
                          </td>
                        </tr>
                      ) : transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-4 py-3 text-sm text-[#536258] dark:text-[#b2c0b6] sm:px-5">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${transaction.type === 'Invoice' ? 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300' : 'bg-emerald-50 text-emerald-800 dark:bg-lime-300/10 dark:text-lime-300'}`}>
                              {transaction.type === 'Invoice' ? 'Charge' : 'Payment'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#536258] dark:text-[#b2c0b6]">{transaction.detail}</td>
                          <td className="px-4 py-3 text-right text-sm tabular-nums text-red-600 dark:text-red-400">
                            {transaction.debit ? transaction.debit.toFixed(2) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm tabular-nums text-emerald-700 dark:text-lime-300 sm:px-5">
                            {transaction.credit ? transaction.credit.toFixed(2) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-[#e8ede8] px-5 py-3 dark:border-white/10 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg px-4 text-sm font-medium text-[#536258] transition hover:bg-[#eff3ef] dark:text-[#b2c0b6] dark:hover:bg-white/[0.06]"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  )
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [dialogCustomer, setDialogCustomer] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [ledgerCustomer, setLedgerCustomer] = useState(null)

  async function loadCustomers() {
    try {
      const result = await Promise.resolve().then(() => {
        if (!window.api?.getCustomers) {
          throw new Error('Customers are available when running the desktop app.')
        }
        return window.api.getCustomers()
      })
      if (!result?.success) throw new Error(result?.error || 'Could not load customers.')
      setCustomers(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not load customers.')
    } finally {
      setIsLoading(false)
    }
  }

  function retryLoadCustomers() {
    setIsLoading(true)
    setPageError('')
    loadCustomers()
  }

  useEffect(() => {
    void Promise.resolve().then(loadCustomers)
  }, [])

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return customers
    return customers.filter((customer) =>
      `${customer.name ?? ''} ${customer.phone ?? ''}`.toLocaleLowerCase().includes(query),
    )
  }, [customers, search])

  function openAddDialog() {
    setDialogCustomer(null)
    setDialogError('')
    setIsDialogOpen(true)
  }

  function openEditDialog(customer) {
    setDialogCustomer(customer)
    setDialogError('')
    setIsDialogOpen(true)
  }

  function closeDialog() {
    if (isSaving) return
    setIsDialogOpen(false)
    setDialogError('')
  }

  async function saveCustomer(customer) {
    setIsSaving(true)
    setDialogError('')
    try {
      const method = dialogCustomer ? window.api?.updateCustomer : window.api?.addCustomer
      if (!method) throw new Error('Customer editing is available when running the desktop app.')

      const result = await method(customer)
      if (!result?.success) throw new Error(result?.error || 'Could not save customer.')

      setCustomers((current) => {
        if (!dialogCustomer) return [...current, result.data]
        return current.map((item) => item.id === result.data.id ? result.data : item)
      })
      setIsDialogOpen(false)
      setDialogCustomer(null)
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : 'Could not save customer.')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteCustomer(customer) {
    if (!window.confirm(`Delete “${customer.name}”? This cannot be undone.`)) return

    setPageError('')
    try {
      if (!window.api?.deleteCustomer) {
        throw new Error('Customer deletion is available when running the desktop app.')
      }
      const result = await window.api.deleteCustomer(customer.id)
      if (!result?.success) throw new Error(result?.error || 'Could not delete customer.')
      setCustomers((current) => current.filter((item) => item.id !== customer.id))
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not delete customer.')
    }
  }

  return (
    <section>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-emerald-800 dark:text-lime-300">Relationships</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#17211d] dark:text-white">Customers</h1>
          <p className="mt-2 text-sm leading-6 text-[#66756c] dark:text-[#9aa99f]">
            Keep customer contacts and account balances organized.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddDialog}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-800/20 dark:bg-lime-300 dark:text-[#17211d] dark:hover:bg-lime-200"
        >
          <Plus size={17} aria-hidden="true" />
          Add Customer
        </button>
      </div>

      {pageError && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="flex-1">{pageError}</span>
          <button type="button" onClick={retryLoadCustomers} className="font-semibold underline underline-offset-2">Retry</button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#dfe6df] bg-white shadow-sm dark:border-white/10 dark:bg-[#151e19]">
        <div className="flex flex-col gap-3 border-b border-[#e8ede8] p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Customer directory</h2>
            <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">
              {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
            </p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#829087] dark:text-[#839288]" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or phone"
              aria-label="Search customers by name or phone"
              className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white pl-9 pr-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[790px] border-collapse text-left">
            <thead>
              <tr className="bg-[#f7f9f6] text-[11px] font-semibold uppercase text-[#76847a] dark:bg-white/[0.025] dark:text-[#91a097]">
                <th scope="col" className="px-5 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Phone</th>
                <th scope="col" className="px-4 py-3">Address</th>
                <th scope="col" className="px-4 py-3 text-right">Opening balance</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0ed] dark:divide-white/[0.07]">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="h-44 text-center text-sm text-[#78867d] dark:text-[#91a097]">
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Loading customers
                    </span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="h-48 px-5 text-center">
                    <span className="mx-auto mb-3 grid size-10 place-items-center rounded-lg bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300">
                      <Users size={19} aria-hidden="true" />
                    </span>
                    <p className="text-sm font-medium text-[#34443a] dark:text-[#d4dfd6]">
                      {search ? 'No matching customers' : 'No customers yet'}
                    </p>
                    <p className="mt-1 text-xs text-[#78867d] dark:text-[#91a097]">
                      {search ? 'Try another name or phone number.' : 'Add a customer to start building your directory.'}
                    </p>
                  </td>
                </tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.id} className="transition-colors hover:bg-[#fafbf9] dark:hover:bg-white/[0.025]">
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300">
                        <UserRound size={17} aria-hidden="true" />
                      </span>
                      <span className="block max-w-[190px] truncate text-sm font-medium text-[#26352c] dark:text-[#e7eee9]" title={customer.name}>
                        {customer.name}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#536258] dark:text-[#b2c0b6]">
                    {customer.phone || <span className="text-[#a1aca4] dark:text-white/25">—</span>}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#728077] dark:text-[#9aa99f]">
                    <span className="block max-w-[260px] truncate" title={customer.address || ''}>
                      {customer.address || <span className="text-[#a1aca4] dark:text-white/25">—</span>}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm tabular-nums text-[#34443a] dark:text-[#d4dfd6]">
                    {Number(customer.opening_balance ?? 0).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setLedgerCustomer(customer)}
                        aria-label={`View ledger for ${customer.name}`}
                        title="View ledger"
                        className="grid size-8 place-items-center rounded-md text-[#617167] transition hover:bg-[#edf3ed] hover:text-emerald-800 dark:text-[#a7b6ac] dark:hover:bg-white/[0.08] dark:hover:text-lime-300"
                      >
                        <BookOpenText size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditDialog(customer)}
                        aria-label={`Edit ${customer.name}`}
                        title="Edit customer"
                        className="grid size-8 place-items-center rounded-md text-[#617167] transition hover:bg-[#edf3ed] hover:text-emerald-800 dark:text-[#a7b6ac] dark:hover:bg-white/[0.08] dark:hover:text-lime-300"
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomer(customer)}
                        aria-label={`Delete ${customer.name}`}
                        title="Delete customer"
                        className="grid size-8 place-items-center rounded-md text-[#8b7775] transition hover:bg-rose-50 hover:text-rose-700 dark:text-[#b39491] dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredCustomers.length > 0 && (
          <div className="border-t border-[#e8ede8] px-5 py-3 text-xs text-[#78867d] dark:border-white/10 dark:text-[#91a097]">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        )}
      </div>

      {isDialogOpen && (
        <CustomerDialog
          customer={dialogCustomer}
          isSaving={isSaving}
          error={dialogError}
          onClose={closeDialog}
          onSubmit={saveCustomer}
        />
      )}
      {ledgerCustomer && (
        <CustomerLedger customer={ledgerCustomer} onClose={() => setLedgerCustomer(null)} />
      )}
    </section>
  )
}