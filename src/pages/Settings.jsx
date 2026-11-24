import { useEffect, useState } from 'react'
import { Building2, Check, ImagePlus, LoaderCircle, Save, Upload, X } from 'lucide-react'

const emptySettings = {
  company_name: '',
  address: '',
  phone: '',
  tax_rate: '0',
  logo_base64: '',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(emptySettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadSettings() {
      try {
        if (!window.api?.getSettings) {
          throw new Error('Settings are available when running the desktop app.')
        }

        const result = await window.api.getSettings()
        if (!result?.success) {
          throw new Error(result?.error || 'Could not load company settings.')
        }

        if (isMounted && result.data) {
          setSettings({
            company_name: result.data.company_name ?? '',
            address: result.data.address ?? '',
            phone: result.data.phone ?? '',
            tax_rate: String(result.data.tax_rate ?? 0),
            logo_base64: result.data.logo_base64 ?? '',
          })
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load company settings.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadSettings()
    return () => {
      isMounted = false
    }
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setSettings((current) => ({ ...current, [name]: value }))
    setError('')
    setSuccess('')
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for the company logo.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSettings((current) => ({ ...current, logo_base64: reader.result }))
        setError('')
        setSuccess('')
      } else {
        setError('The selected logo could not be read.')
      }
    }
    reader.onerror = () => setError('The selected logo could not be read.')
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setSettings((current) => ({ ...current, logo_base64: '' }))
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      if (!window.api?.updateSettings) {
        throw new Error('Settings are available when running the desktop app.')
      }

      const result = await window.api.updateSettings({
        company_name: settings.company_name.trim(),
        address: settings.address.trim(),
        phone: settings.phone.trim(),
        tax_rate: Number(settings.tax_rate || 0),
        logo_base64: settings.logo_base64 || null,
      })

      if (!result?.success) {
        throw new Error(result?.error || 'Could not save company settings.')
      }

      if (result.data) {
        setSettings({
          company_name: result.data.company_name ?? '',
          address: result.data.address ?? '',
          phone: result.data.phone ?? '',
          tax_rate: String(result.data.tax_rate ?? 0),
          logo_base64: result.data.logo_base64 ?? '',
        })
      }
      setSuccess('Company settings saved successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save company settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase text-emerald-800 dark:text-lime-300">
          Preferences
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#17211d] dark:text-white">
          Company settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66756c] dark:text-[#9aa99f]">
          Manage the business details shown on your invoices.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
          <span className="flex-1">{error}</span>
          <button type="button" aria-label="Dismiss error" onClick={() => setError('')}>
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-lime-300/20 dark:bg-lime-300/10 dark:text-lime-200">
          <Check size={17} aria-hidden="true" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-xl border border-[#dfe6df] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151e19] sm:p-7">
          <div className="mb-6 flex items-center gap-3 border-b border-[#e8ede8] pb-5 dark:border-white/10">
            <span className="grid size-10 place-items-center rounded-lg bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300">
              <Building2 size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Business details</h2>
              <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Contact and tax information</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-44 items-center justify-center gap-2 text-sm text-[#78867d] dark:text-[#91a097]">
              <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
              Loading settings
            </div>
          ) : (
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="block text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Company name</span>
                <input
                  name="company_name"
                  type="text"
                  value={settings.company_name}
                  onChange={updateField}
                  placeholder="Your business name"
                  className="h-11 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="block text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Address</span>
                <textarea
                  name="address"
                  rows="3"
                  value={settings.address}
                  onChange={updateField}
                  placeholder="Street, city, region"
                  className="w-full resize-y rounded-lg border border-[#d8e0d9] bg-white px-3 py-2.5 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
                />
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Phone</span>
                <input
                  name="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={updateField}
                  placeholder="Business phone"
                  className="h-11 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm text-[#17211d] outline-none transition placeholder:text-[#9aa69e] focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:placeholder:text-white/30 dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
                />
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-medium text-[#46564b] dark:text-[#becbc1]">Tax rate (%)</span>
                <div className="relative">
                  <input
                    name="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.tax_rate}
                    onChange={updateField}
                    className="h-11 w-full rounded-lg border border-[#d8e0d9] bg-white px-3 pr-10 text-sm text-[#17211d] outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-white/15 dark:bg-[#101613] dark:text-white dark:focus:border-lime-300 dark:focus:ring-lime-300/10"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[#78867d] dark:text-[#91a097]">%</span>
                </div>
              </label>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[#dfe6df] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151e19] sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300">
              <ImagePlus size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">Company logo</h2>
              <p className="mt-0.5 text-xs text-[#78867d] dark:text-[#91a097]">Used on printed and exported invoices</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-[#cbd5cd] bg-[#f7f9f6] dark:border-white/15 dark:bg-[#101613]">
              {settings.logo_base64 ? (
                <img src={settings.logo_base64} alt="Company logo preview" className="h-full w-full object-contain p-2" />
              ) : (
                <ImagePlus size={23} className="text-[#9aa69e] dark:text-white/35" aria-hidden="true" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#d8e0d9] bg-white px-3 text-sm font-medium text-[#334238] transition hover:bg-[#f5f8f4] dark:border-white/15 dark:bg-[#101613] dark:text-[#d4dfd6] dark:hover:bg-white/[0.05]">
                <Upload size={16} aria-hidden="true" />
                Upload logo
                <input type="file" accept="image/*" onChange={handleLogoChange} className="sr-only" />
              </label>
              {settings.logo_base64 && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="h-10 rounded-lg px-3 text-sm font-medium text-[#68776d] transition hover:bg-rose-50 hover:text-rose-700 dark:text-[#a7b6ac] dark:hover:bg-rose-400/10 dark:hover:text-rose-200"
                >
                  Remove logo
                </button>
              )}
              <p className="basis-full text-xs text-[#859188] dark:text-[#819087]">Image files are stored locally with your company settings.</p>
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-[#859188] dark:text-[#819087]">Changes are saved on this device.</p>
          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-800/20 disabled:cursor-not-allowed disabled:opacity-55 dark:bg-lime-300 dark:text-[#17211d] dark:hover:bg-lime-200 dark:focus:ring-lime-300/20"
          >
            {isSaving ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
            {isSaving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </section>
  )
}