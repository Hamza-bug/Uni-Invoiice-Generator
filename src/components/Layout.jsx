import { useState } from 'react'
import {
  Boxes,
  FileText,
  LayoutDashboard,
  Moon,
  Package,
  Settings,
  Sun,
  Users,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/products', icon: Package },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Invoices', to: '/invoices', icon: FileText },
  { label: 'Settings', to: '/settings', icon: Settings },
]

function Sidebar() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = window.localStorage.getItem('ledger-local-theme')
    const isDark = savedTheme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    return isDark
  })

  function toggleDarkMode() {
    const nextIsDark = !isDarkMode
    document.documentElement.classList.toggle('dark', nextIsDark)
    window.localStorage.setItem('ledger-local-theme', nextIsDark ? 'dark' : 'light')
    setIsDarkMode(nextIsDark)
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[76px] flex-col border-r border-white/10 bg-[#151d19] px-3 py-5 text-white md:w-64 md:px-4">
      <div className="mb-9 flex h-10 items-center justify-center gap-3 md:justify-start">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime-300 text-[#17211d]">
          <Boxes size={21} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span className="hidden text-sm font-semibold tracking-wide md:block">
          Ledger Local
        </span>
      </div>

      <p className="mb-3 hidden px-3 text-[10px] font-semibold uppercase text-white/40 md:block">
        Workspace
      </p>
      <nav aria-label="Main navigation" className="flex-1 space-y-1">
        {navigation.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `group flex min-h-11 items-center justify-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors md:justify-start md:px-3 ${
                isActive
                  ? 'bg-lime-300 text-[#17211d]'
                  : 'text-white/65 hover:bg-white/[0.07] hover:text-white'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
            <span className="hidden md:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          aria-pressed={isDarkMode}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg px-2.5 text-sm text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white md:justify-start md:px-3"
        >
          {isDarkMode ? (
            <Sun size={18} strokeWidth={1.9} aria-hidden="true" />
          ) : (
            <Moon size={18} strokeWidth={1.9} aria-hidden="true" />
          )}
          <span className="hidden md:block">Dark mode</span>
        </button>
      </div>
    </aside>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f5f7f4] text-[#17211d] transition-colors dark:bg-[#101613] dark:text-[#e7eee9]">
      <Sidebar />
      <div className="min-h-screen pl-[76px] md:pl-64">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#17211d]/10 bg-[#f5f7f4]/95 px-5 backdrop-blur dark:border-white/10 dark:bg-[#101613]/95 sm:px-8">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold uppercase text-[#52645a] dark:text-[#9aada2]">
              Local workspace
            </span>
            <span className="text-[#9aa69e] dark:text-white/25">/</span>
            <span className="hidden text-[#7b8980] dark:text-[#91a097] sm:block">
              Invoice &amp; inventory
            </span>
          </div>
          <span className="flex items-center gap-2 text-xs text-[#52645a] dark:text-[#a7b6ac]">
            <span className="size-2 rounded-full bg-lime-500" />
            Saved locally
          </span>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}