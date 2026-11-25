import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  LoaderCircle,
  ReceiptText,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const metricCards = [
  {
    key: 'todaySales',
    label: "Today's sales",
    icon: CircleDollarSign,
    tone: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-300/10',
    format: 'amount',
  },
  {
    key: 'totalReceivables',
    label: 'Total receivables',
    icon: ArrowDownRight,
    tone: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-300/10',
    format: 'amount',
  },
  {
    key: 'totalExpenses',
    label: 'Monthly expenses',
    icon: Wallet,
    tone: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-300/10',
    format: 'amount',
  },
  {
    key: 'lowStockCount',
    label: 'Low stock items',
    icon: AlertCircle,
    tone: 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-300/10',
    format: 'count',
    to: '/products',
  },
]

function formatAmount(value) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboardData() {
    try {
      const results = await Promise.resolve().then(() => {
        if (!window.api?.getStats || !window.api?.getInvoices || !window.api?.getProducts) {
          throw new Error('Dashboard data is available in the desktop app.')
        }
        return Promise.all([
          window.api.getStats(),
          window.api.getInvoices(),
          window.api.getProducts(),
        ])
      })
      const [statsResult, invoicesResult, productsResult] = results
      for (const [result, label] of [
        [statsResult, 'dashboard data'],
        [invoicesResult, 'recent invoices'],
        [productsResult, 'products'],
      ]) {
        if (!result?.success) throw new Error(result?.error || `Could not load ${label}.`)
      }

      setStats(statsResult.data)
      setInvoices(Array.isArray(invoicesResult.data) ? invoicesResult.data : [])
      setProducts(Array.isArray(productsResult.data) ? productsResult.data : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadDashboardData)
  }, [])

  const recentInvoices = [...invoices]
    .sort((first, second) => {
      const dateOrder = String(second.date ?? '').localeCompare(String(first.date ?? ''))
      return dateOrder || Number(second.id) - Number(first.id)
    })
    .slice(0, 5)
  const lowStockProducts = products
    .filter((product) => Number(product.stock) < 5)
    .sort((first, second) => Number(first.stock) - Number(second.stock))

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-emerald-800 dark:text-lime-300">Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#17211d] dark:text-white">Dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-[#66756c] dark:text-[#9aa99f]">
            A quick view of sales, receivables, expenses, and inventory.
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs text-[#78867d] dark:text-[#91a097]">
          <ReceiptText size={15} aria-hidden="true" /> Business overview
        </span>
      </div>

      {error && (
        <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true)
              setError('')
              loadDashboardData()
            }}
            className="shrink-0 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {metricCards.map(({ key, label, icon: Icon, tone, format, to }) => {
          const value = stats?.[key]
          const cardContent = (
            <>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-[#66756c] dark:text-[#9aa99f]">{label}</p>
                <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tone}`}>
                  <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
                </span>
              </div>
              <div className="mt-6 flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-[#17211d] dark:text-white">
                  {isLoading ? '—' : format === 'amount' ? formatAmount(value) : Number(value || 0).toLocaleString()}
                </p>
                {to && <ArrowUpRight size={16} className="mb-1 text-[#8b9990] dark:text-[#91a097]" aria-hidden="true" />}
              </div>
              {isLoading && <LoaderCircle size={14} className="mt-2 animate-spin text-[#8b9990] dark:text-[#91a097]" aria-label="Loading metric" />}
            </>
          )

          const className = `block rounded-xl border border-[#dfe6df] bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-[#151e19] ${to ? 'cursor-pointer hover:border-orange-200 dark:hover:border-orange-300/30' : ''}`

          return to ? (
            <Link key={key} to={to} className={className} aria-label={`${label}: view products`}>
              {cardContent}
            </Link>
          ) : (
            <article key={key} className={className}>
              {cardContent}
            </article>
          )
        })}
      </div>

      <section className="mt-5 rounded-xl border border-[#dfe6df] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151e19] sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase text-[#78867d] dark:text-[#91a097]">Daily activity</p>
            <h2 className="text-base font-semibold text-[#26352c] dark:text-[#e7eee9]">Last 7 Days Performance</h2>
          </div>
          <p className="text-xs text-[#859188] dark:text-[#819087]">Sales and expenses by day</p>
        </div>

        <div className="h-[300px] w-full min-w-0 sm:h-[340px]">
          {isLoading ? (
            <div className="grid h-full place-items-center text-sm text-[#78867d] dark:text-[#91a097]">
              <span className="inline-flex items-center gap-2">
                <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                Loading performance data
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chartData ?? []} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke="#dfe6df" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#78867d', fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  width={64}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#78867d', fontSize: 11 }}
                  tickFormatter={(value) => Number(value).toLocaleString()}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(110, 130, 115, 0.08)' }}
                  formatter={(value, name) => [formatAmount(value), name]}
                  contentStyle={{
                    border: '1px solid #dfe6df',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#52645a', fontWeight: 600, marginBottom: 4 }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={34}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', color: '#66756c' }}
                />
                <Bar dataKey="sales" name="Sales" fill="#15803d" radius={[4, 4, 0, 0]} maxBarSize={34} />
                <Bar dataKey="expenses" name="Expenses" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-[#dfe6df] bg-white shadow-sm dark:border-white/10 dark:bg-[#151e19]">
          <div className="flex items-center justify-between gap-3 border-b border-[#e8ede8] px-5 py-4 dark:border-white/10">
            <div>
              <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Recent invoices</h2>
              <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Latest 5 by invoice date</p>
            </div>
            <Link to="/invoice-history" className="text-xs font-semibold text-emerald-800 hover:underline dark:text-lime-300">
              View history
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f7f9f6] text-[10px] font-semibold uppercase text-[#76847a] dark:bg-white/[0.025] dark:text-[#91a097]">
                  <th scope="col" className="px-5 py-3">Customer name</th>
                  <th scope="col" className="px-4 py-3 text-right">Amount</th>
                  <th scope="col" className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ed] dark:divide-white/[0.07]">
                {isLoading ? (
                  <tr><td colSpan="3" className="h-28 text-center text-sm text-[#78867d] dark:text-[#91a097]">Loading invoices…</td></tr>
                ) : recentInvoices.length === 0 ? (
                  <tr><td colSpan="3" className="h-28 text-center text-sm text-[#78867d] dark:text-[#91a097]">No invoices recorded yet.</td></tr>
                ) : recentInvoices.map((invoice) => {
                  const normalizedStatus = String(invoice.status ?? 'Unpaid').toLowerCase()
                  const badgeTone = normalizedStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-300'
                    : normalizedStatus === 'partial'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-300/10 dark:text-rose-300'
                  return (
                    <tr key={invoice.id} className="hover:bg-[#fafbf9] dark:hover:bg-white/[0.025]">
                      <td className="px-5 py-3.5">
                        <span className="block truncate text-sm font-medium text-[#26352c] dark:text-[#e7eee9]">{invoice.customer_name || '—'}</span>
                        <span className="mt-0.5 block text-[11px] text-[#859188] dark:text-[#819087]">Invoice #{invoice.id}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm tabular-nums text-[#34443a] dark:text-[#d4dfd6]">{formatAmount(invoice.total_amount)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${badgeTone}`}>
                          {invoice.status || 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#dfe6df] bg-white shadow-sm dark:border-white/10 dark:bg-[#151e19]">
          <div className="flex items-center justify-between gap-3 border-b border-[#e8ede8] px-5 py-4 dark:border-white/10">
            <div>
              <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Low stock alerts</h2>
              <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Products with fewer than 5 units</p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-emerald-800 hover:underline dark:text-lime-300">
              View products
            </Link>
          </div>
          <ul className="divide-y divide-[#edf0ed] dark:divide-white/[0.07]">
            {isLoading ? (
              <li className="flex h-28 items-center justify-center text-sm text-[#78867d] dark:text-[#91a097]">Loading products…</li>
            ) : lowStockProducts.length === 0 ? (
              <li className="flex h-28 items-center justify-center text-sm text-[#78867d] dark:text-[#91a097]">No low-stock products.</li>
            ) : lowStockProducts.slice(0, 8).map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <span className="min-w-0 truncate text-sm font-medium text-[#26352c] dark:text-[#e7eee9]">{product.name}</span>
                <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-red-600 dark:bg-rose-400/10 dark:text-red-300">
                  {product.stock} left
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  )
}