import { useState, useEffect } from "react"

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-surface/90 backdrop-blur-md shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2 group">
            <span className="text-2xl">⚽</span>
            <span className="text-lg font-extrabold text-white tracking-tight group-hover:text-brand transition-colors">
              FIFA<span className="text-brand">26</span>
            </span>
          </a>

          <a
            href="#products"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Shop
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
