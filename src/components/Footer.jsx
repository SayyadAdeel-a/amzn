import Link from "next/link"
import Image from "next/image"

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-800 py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded overflow-hidden grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
              <Image src="/logo.png" alt="FIFA26 Logo" fill className="object-cover" />
            </div>
            <span className="text-lg font-extrabold text-white group-hover:text-brand transition-colors">
              FIFA<span className="text-brand">26</span>
            </span>
          </Link>
          <span className="hidden sm:inline text-zinc-600 text-sm">|</span>
          <span className="text-zinc-500 text-xs max-w-xl text-center sm:text-left">
            Affiliate Disclosure: As an Amazon Associate we earn from qualifying purchases. This site contains affiliate links to products. We may receive a commission for purchases made through these links at no extra cost to you.
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-600">
          <Link href="/privacy" className="hover:text-brand transition-colors">
            Privacy Policy
          </Link>
          <span>© {year} FIFA26 Store. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
