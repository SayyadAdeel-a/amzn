"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

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
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-800 group-hover:border-brand/50 transition-colors">
              <Image src="/logo.png" alt="FIFA26 Logo" fill className="object-cover" />
            </div>
            <span className="text-xl font-black text-white tracking-tight group-hover:text-brand transition-colors">
              FIFA<span className="text-brand">26</span>
            </span>
          </Link>

          <div className="flex gap-6 items-center">
            <Link
              href="/#products"
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/blog"
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
