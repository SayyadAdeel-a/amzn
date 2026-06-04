const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-800 py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-white">
            FIFA<span className="text-brand">26</span>
          </span>
          <span className="text-zinc-600 text-sm">|</span>
          <span className="text-zinc-500 text-xs">
            Affiliate Site — As an Amazon Associate we earn from qualifying purchases.
          </span>
        </div>

        <p className="text-zinc-600 text-xs">© {year} FIFA26 Store. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
