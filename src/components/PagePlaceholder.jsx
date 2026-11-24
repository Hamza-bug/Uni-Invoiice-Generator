export default function PagePlaceholder({
  icon: Icon,
  eyebrow,
  title,
  description,
  emptyMessage,
}) {
  return (
    <section>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase text-emerald-800 dark:text-lime-300">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#17211d] dark:text-white">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66756c] dark:text-[#9aa99f]">
          {description}
        </p>
      </div>

      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5cd] bg-white px-6 py-10 text-center dark:border-white/15 dark:bg-[#151e19]">
        <span className="mb-4 grid size-12 place-items-center rounded-xl bg-[#edf3ed] text-emerald-800 dark:bg-[#223129] dark:text-lime-300">
          <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h2 className="text-sm font-semibold text-[#26352c] dark:text-[#e7eee9]">
          {title} workspace
        </h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-[#78867d] dark:text-[#91a097]">
          {emptyMessage}
        </p>
      </div>
    </section>
  )
}