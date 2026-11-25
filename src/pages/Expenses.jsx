import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  LoaderCircle,
  Plus,
  ReceiptText,
  Wallet,
} from 'lucide-react'

const categories = ['Rent', 'Utilities', 'Salary', 'Other']
const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()

function todayAsInputValue() {
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function ExpenseForm({ isSaving, onSubmit }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Rent')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayAsInputValue)

  async function handleSubmit(event) {
    event.preventDefault()
    const saved = await onSubmit({
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
    })

    if (saved) {
      setTitle('')
      setCategory('Rent')
      setAmount('')
      setDate(todayAsInputValue())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#dfe6df] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151e19] sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300">
          <Plus size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Add an expense</h2>
          <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Record a business cost</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1.3fr)_minmax(140px,0.9fr)_minmax(130px,0.8fr)_minmax(150px,0.9fr)_auto] xl:items-end">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Title</span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Expense description"
            className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
          >
            {categories.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Amount</span>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm tabular-nums text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Date</span>
          <span className="relative block">
            <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#829087] dark:text-[#839288]" aria-hidden="true" />
            <input
              required
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 w-full rounded-lg border border-[#d8e0d9] bg-white pl-9 pr-2 text-sm text-[#17211d] outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-800/20 disabled:cursor-wait disabled:opacity-60 dark:bg-lime-300 dark:text-[#17211d] dark:hover:bg-lime-200 sm:col-span-2 xl:col-span-1"
        >
          {isSaving ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {isSaving ? 'Saving…' : 'Add expense'}
        </button>
      </div>
    </form>
  )
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadExpenses() {
    setError('')
    try {
      const result = await Promise.resolve().then(() => {
        if (!window.api?.getExpenses) throw new Error('Expenses are available when running the desktop app.')
        return window.api.getExpenses()
      })
      if (!result?.success) throw new Error(result?.error || 'Could not load expenses.')
      setExpenses(Array.isArray(result.data) ? result.data : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load expenses.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadExpenses)
  }, [])

  const sortedExpenses = useMemo(() => [...expenses].sort((first, second) => {
    const dateOrder = String(second.date ?? '').localeCompare(String(first.date ?? ''))
    return dateOrder || Number(second.id) - Number(first.id)
  }), [expenses])

  const currentMonthTotal = useMemo(() => {
    const monthTotalCents = expenses.reduce((sum, expense) => {
      const expenseDate = new Date(`${expense.date}T00:00:00`)
      if (
        Number.isNaN(expenseDate.getTime()) ||
        expenseDate.getFullYear() !== currentYear ||
        expenseDate.getMonth() !== currentMonth
      ) {
        return sum
      }
      return sum + Math.round((Number(expense.amount) + Number.EPSILON) * 100)
    }, 0)
    return monthTotalCents / 100
  }, [expenses])

  async function addExpense(expense) {
    setError('')
    setSuccess('')

    if (!expense.title) {
      setError('Enter an expense title.')
      return false
    }
    if (!Number.isFinite(expense.amount) || expense.amount < 0) {
      setError('Enter a valid non-negative amount.')
      return false
    }
    if (!expense.date) {
      setError('Choose an expense date.')
      return false
    }

    setIsSaving(true)
    try {
      if (!window.api?.addExpense) throw new Error('Expense recording is available when running the desktop app.')
      const result = await window.api.addExpense(expense)
      if (!result?.success) throw new Error(result?.error || 'Could not save expense.')

      setExpenses((current) => [...current, result.data])
      setSuccess('Expense added successfully.')
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save expense.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  function formatDate(date) {
    const parsedDate = new Date(`${date}T00:00:00`)
    return Number.isNaN(parsedDate.getTime()) ? date || '—' : parsedDate.toLocaleDateString()
  }

  return (
    <section>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-emerald-800 dark:text-lime-300">Operations</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#17211d] dark:text-white">Expenses</h1>
          <p className="mt-2 text-sm leading-6 text-[#66756c] dark:text-[#9aa99f]">Record business costs and review expense history.</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-[#78867d] dark:text-[#91a097]">
          <ReceiptText size={16} aria-hidden="true" />
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} recorded
        </span>
      </div>

      {error && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => { setIsLoading(true); loadExpenses() }} className="font-semibold underline underline-offset-2">Retry</button>
        </div>
      )}
      {success && (
        <div role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-lime-300/20 dark:bg-lime-300/10 dark:text-lime-200">
          <CheckCircle2 size={17} aria-hidden="true" />
          {success}
        </div>
      )}

      <div className="mb-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <ExpenseForm isSaving={isSaving} onSubmit={addExpense} />
        <section className="flex flex-col justify-between rounded-xl border border-[#dfe6df] bg-[#edf3ed] p-5 dark:border-white/10 dark:bg-[#1b2921] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-[#617167] dark:text-[#a7b6ac]">This month</p>
              <h2 className="mt-1 text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Total expenses</h2>
            </div>
            <span className="grid size-10 place-items-center rounded-lg bg-white/75 text-emerald-800 dark:bg-white/[0.07] dark:text-lime-300">
              <Wallet size={19} aria-hidden="true" />
            </span>
          </div>
          <div className="mt-6 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-[#17211d] dark:text-white">
              {currentMonthTotal.toFixed(2)}
            </p>
            <span className="mb-1 inline-flex items-center gap-1 text-xs text-[#6e7c72] dark:text-[#9aa99f]">
              <CircleDollarSign size={14} aria-hidden="true" /> Current month
            </span>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#dfe6df] bg-white shadow-sm dark:border-white/10 dark:bg-[#151e19]">
        <div className="border-b border-[#e8ede8] px-5 py-4 dark:border-white/10">
          <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Expense history</h2>
          <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Sorted by most recent date</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="bg-[#f7f9f6] text-[10px] font-semibold uppercase text-[#76847a] dark:bg-white/[0.025] dark:text-[#91a097]">
                <th scope="col" className="px-5 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Title</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0ed] dark:divide-white/[0.07]">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="h-40 text-center text-sm text-[#78867d] dark:text-[#91a097]">
                    <span className="inline-flex items-center gap-2"><LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Loading expenses</span>
                  </td>
                </tr>
              ) : sortedExpenses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="h-40 px-5 text-center text-sm text-[#78867d] dark:text-[#91a097]">
                    No expenses recorded yet.
                  </td>
                </tr>
              ) : sortedExpenses.map((expense) => (
                <tr key={expense.id} className="transition-colors hover:bg-[#fafbf9] dark:hover:bg-white/[0.025]">
                  <td className="px-5 py-3.5 text-sm text-[#536258] dark:text-[#b2c0b6]">{formatDate(expense.date)}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-[#26352c] dark:text-[#e7eee9]">{expense.title}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-full bg-[#edf3ed] px-2.5 py-1 text-[11px] font-medium text-[#52645a] dark:bg-white/[0.07] dark:text-[#b2c0b6]">{expense.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-medium tabular-nums text-[#26352c] dark:text-[#e7eee9]">{Number(expense.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}