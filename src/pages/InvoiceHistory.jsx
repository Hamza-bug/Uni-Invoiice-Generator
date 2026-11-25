import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Check,
  Clock3,
  CreditCard,
  FileText,
  LoaderCircle,
  ReceiptText,
  Search,
  X,
} from 'lucide-react'

function todayAsInputValue() {
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function statusStyle(status) {
  switch (String(status).toLowerCase()) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300'
    case 'partial':
      return 'bg-amber-50 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200'
    default:
      return 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300'
  }
}

function PaymentModal({ invoice, isSaving, error, onClose, onSubmit }) {
  const amountDue = Math.max(0, Number(invoice.total_amount || 0) - Number(invoice.paid_amount || 0))
  const [amount, setAmount] = useState(amountDue.toFixed(2))
  const [paymentDate, setPaymentDate] = useState(todayAsInputValue)
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  function handleSubmit(event) {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      onSubmit(null, 'Enter a payment amount greater than zero.')
      return
    }
    if (numericAmount > amountDue) {
      onSubmit(null, 'Payment cannot exceed the remaining invoice balance.')
      return
    }
    if (!paymentDate) {
      onSubmit(null, 'Select a payment date.')
      return
    }

    onSubmit({
      invoice_id: Number(invoice.id),
      customer_id: Number(invoice.customer_id),
      amount: numericAmount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
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
        aria-labelledby="payment-modal-title"
        className="my-auto w-full max-w-md rounded-xl border border-[#dfe6df] bg-white shadow-2xl dark:border-white/10 dark:bg-[#151e19]"
      >
        <div className="flex items-start justify-between border-b border-[#e8ede8] px-5 py-4 dark:border-white/10 sm:px-6">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase text-emerald-800 dark:text-lime-300">Invoice #{invoice.id}</p>
            <h2 id="payment-modal-title" className="text-lg font-semibold text-[#17211d] dark:text-white">Record payment</h2>
            <p className="mt-1 text-xs text-[#78867d] dark:text-[#91a097]">{invoice.customer_name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close payment dialog"
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

          <div className="rounded-lg bg-[#f7f9f6] p-3 dark:bg-[#101613]">
            <div className="flex justify-between gap-3 text-xs text-[#78867d] dark:text-[#91a097]">
              <span>Invoice total</span>
              <span className="tabular-nums">{Number(invoice.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between gap-3 text-xs text-[#78867d] dark:text-[#91a097]">
              <span>Already paid</span>
              <span className="tabular-nums">{Number(invoice.paid_amount || 0).toFixed(2)}</span>
            </div>
            <div className="mt-3 flex justify-between gap-3 border-t border-[#e2e8e2] pt-3 text-sm font-semibold text-[#26352c] dark:border-white/10 dark:text-[#e7eee9]">
              <span>Remaining balance</span>
              <span className="tabular-nums">{amountDue.toFixed(2)}</span>
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Payment amount</span>
            <input
              required
              autoFocus
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm tabular-nums text-[#17211d] outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Payment date</span>
              <input
                required
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Payment method</span>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Bank</option>
              </select>
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
              disabled={isSaving || amountDue <= 0}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-lime-300 dark:text-[#17211d] dark:hover:bg-lime-200"
            >
              {isSaving ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
              {isSaving ? 'Submitting…' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [modalError, setModalError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  async function loadInvoices() {
    try {
      const result = await Promise.resolve().then(() => {
        if (!window.api?.getInvoices) throw new Error('Invoice history is available in the desktop app.')
        return window.api.getInvoices()
      })
      if (!result?.success) throw new Error(result?.error || 'Could not load invoices.')
      setInvoices(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Could not load invoices.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadInvoices)
  }, [])

  const visibleInvoices = invoices.filter((invoice) => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return true
    return `#${invoice.id} ${invoice.customer_name ?? ''} ${invoice.status ?? ''}`
      .toLocaleLowerCase()
      .includes(query)
  })

  async function recordPayment(payment, validationError) {
    if (!payment) {
      setModalError(validationError || 'Enter a valid payment amount and date.')
      return
    }

    setIsSaving(true)
    setModalError('')
    setPageError('')
    setSuccess('')
    try {
      if (!window.api?.addPayment) throw new Error('Payment recording is available in the desktop app.')
      const result = await window.api.addPayment(payment)
      if (!result?.success) throw new Error(result?.error || 'Could not record payment.')

      setSelectedInvoice(null)
      setSuccess(`Payment recorded for invoice #${payment.invoice_id}.`)
      await loadInvoices()
    } catch (error) {
      setModalError(error instanceof Error ? error.message : 'Could not record payment.')
    } finally {
      setIsSaving(false)
    }
  }

  function openPaymentModal(invoice) {
    setSelectedInvoice(invoice)
    setModalError('')
    setSuccess('')
  }

  function closePaymentModal() {
    if (isSaving) return
    setSelectedInvoice(null)
    setModalError('')
  }

  return (
    <section>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-emerald-800 dark:text-lime-300">Sales</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#17211d] dark:text-white">Invoice history</h1>
          <p className="mt-2 text-sm leading-6 text-[#66756c] dark:text-[#9aa99f]">Review invoice balances and record customer payments.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#78867d] dark:text-[#91a097]">
          <ReceiptText size={16} aria-hidden="true" />
          {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
        </div>
      </div>

      {pageError && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="flex-1">{pageError}</span>
          <button type="button" onClick={() => { setIsLoading(true); loadInvoices() }} className="font-semibold underline underline-offset-2">Retry</button>
        </div>
      )}
      {success && (
        <div role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200">
          <Check size={17} aria-hidden="true" />
          {success}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#dfe6df] bg-white shadow-sm dark:border-white/10 dark:bg-[#151e19]">
        <div className="flex flex-col gap-3 border-b border-[#e8ede8] p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">All invoices</h2>
            <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Payment status updates when a payment is recorded.</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#829087] dark:text-[#839288]" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice or customer"
              aria-label="Search invoice history"
              className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white pl-9 pr-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#f7f9f6] text-[10px] font-semibold uppercase text-[#76847a] dark:bg-white/[0.025] dark:text-[#91a097]">
                <th scope="col" className="px-5 py-3">Invoice ID</th>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Customer name</th>
                <th scope="col" className="px-4 py-3 text-right">Total amount</th>
                <th scope="col" className="px-4 py-3 text-right">Paid amount</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0ed] dark:divide-white/[0.07]">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="h-44 text-center text-sm text-[#78867d] dark:text-[#91a097]">
                    <span className="inline-flex items-center gap-2"><LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Loading invoices</span>
                  </td>
                </tr>
              ) : visibleInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="h-48 px-5 text-center">
                    <span className="mx-auto mb-3 grid size-10 place-items-center rounded-lg bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300"><FileText size={19} aria-hidden="true" /></span>
                    <p className="text-sm font-medium text-[#34443a] dark:text-[#d4dfd6]">{search ? 'No matching invoices' : 'No invoices yet'}</p>
                    <p className="mt-1 text-xs text-[#78867d] dark:text-[#91a097]">{search ? 'Try another invoice ID or customer name.' : 'Saved invoices will appear here.'}</p>
                  </td>
                </tr>
              ) : visibleInvoices.map((invoice) => {
                const normalizedStatus = String(invoice.status ?? 'Unpaid').toLowerCase()
                const canRecordPayment = normalizedStatus === 'unpaid' || normalizedStatus === 'partial'
                return (
                  <tr key={invoice.id} className="transition-colors hover:bg-[#fafbf9] dark:hover:bg-white/[0.025]">
                    <td className="px-5 py-4 text-sm font-semibold tabular-nums text-[#26352c] dark:text-[#e7eee9]">#{invoice.id}</td>
                    <td className="px-4 py-4 text-sm text-[#536258] dark:text-[#b2c0b6]">
                      {invoice.date ? new Date(`${invoice.date}T00:00:00`).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-[#34443a] dark:text-[#d4dfd6]">{invoice.customer_name || '—'}</td>
                    <td className="px-4 py-4 text-right text-sm tabular-nums text-[#34443a] dark:text-[#d4dfd6]">{Number(invoice.total_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-4 text-right text-sm tabular-nums text-[#34443a] dark:text-[#d4dfd6]">{Number(invoice.paid_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle(invoice.status)}`}>
                        {normalizedStatus === 'paid' ? <Check size={12} aria-hidden="true" /> : <Clock3 size={12} aria-hidden="true" />}
                        {invoice.status || 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {canRecordPayment ? (
                        <button
                          type="button"
                          onClick={() => openPaymentModal(invoice)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d8e0d9] px-2.5 text-xs font-semibold text-[#405247] transition hover:border-emerald-700 hover:bg-[#edf3ed] hover:text-emerald-800 dark:border-white/15 dark:text-[#c7d2ca] dark:hover:border-lime-300/50 dark:hover:bg-lime-300/10 dark:hover:text-lime-200"
                        >
                          <CreditCard size={14} aria-hidden="true" /> Record payment
                        </button>
                      ) : (
                        <span className="text-xs text-[#9aa69e] dark:text-white/30">Settled</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && visibleInvoices.length > 0 && (
          <div className="border-t border-[#e8ede8] px-5 py-3 text-xs text-[#78867d] dark:border-white/10 dark:text-[#91a097]">
            Showing {visibleInvoices.length} of {invoices.length} invoices
          </div>
        )}
      </div>

      {selectedInvoice && (
        <PaymentModal
          key={selectedInvoice.id}
          invoice={selectedInvoice}
          isSaving={isSaving}
          error={modalError}
          onClose={closePaymentModal}
          onSubmit={recordPayment}
        />
      )}
    </section>
  )
}