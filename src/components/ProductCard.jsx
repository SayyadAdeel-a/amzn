import Image from "next/image"
import Link from "next/link"

const ProductCard = ({ product }) => {
  const title = product.title || product.name || "Untitled Product";
  const imageSrc = product.image || "/placeholder.jpg"; // Use a local placeholder or a default remote image if available
  const link = product.affiliateLink || product.amazonUrl || "#";

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block bg-surface-2 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand/10"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-3">
        {product.image ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-sm">
            No Image
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-white font-bold text-base sm:text-lg mb-4 line-clamp-2">
          {title}
        </h3>

        <span className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-extrabold rounded-xl group-hover:from-amber-300 group-hover:to-orange-400 transition-all duration-300 shadow-lg shadow-orange-500/20 group-hover:shadow-xl group-hover:shadow-orange-500/40 group-hover:-translate-y-0.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.3 21.4c-.9-.3-1.9-.6-2.9-.6-1.1 0-2.1.3-3.1.6-.5.2-1 .3-1.5.3-.3 0-.5-.1-.7-.2-.6-.3-1.2-.7-1.8-1-.7-.4-1.5-.7-2.3-.7-.8 0-1.6.3-2.3.7-.6.4-1.2.7-1.8 1-.2.1-.4.2-.7.2-.5 0-1-.1-1.5-.3-1-.3-2-.6-3.1-.6-1 0-2 .3-2.9.6-.2.1-.5.1-.7 0-.3-.1-.4-.4-.3-.7.8-2.2 2.5-3.5 4.8-3.9.8-.1 1.6-.2 2.4-.2 1.8 0 3.5.5 5 1.3.2.1.4.1.6 0 1.5-.8 3.2-1.3 5-1.3.8 0 1.6.1 2.4.2 2.3.4 4 1.7 4.8 3.9.1.3 0 .6-.3.7-.2.1-.4.1-.6 0zM6.5 12c-.8 0-1.5-.3-2.1-.8-.6-.5-.9-1.2-.9-2V6.5c0-.8.3-1.5.9-2 .6-.5 1.3-.8 2.1-.8s1.5.3 2.1.8c.6.5.9 1.2.9 2V9c0 .8-.3 1.5-.9 2-.6.5-1.3.8-2.1.8zm11 0c-.8 0-1.5-.3-2.1-.8-.6-.5-.9-1.2-.9-2V6.5c0-.8.3-1.5.9-2 .6-.5 1.3-.8 2.1-.8s1.5.3 2.1.8c.6.5.9 1.2.9 2V9c0 .8-.3 1.5-.9 2-.6.5-1.3.8-2.1.8z"/>
          </svg>
          <span>Buy on Amazon</span>
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

export default ProductCard
