"use client"
import Image from "next/image"

const ProductMarquee = ({ products }) => {
  const items = [...products, ...products]

  return (
    <section className="py-12 sm:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <span className="text-brand text-sm font-semibold uppercase tracking-widest">
          Trending Now
        </span>
      </div>

      <div className="relative">
        <div className="flex gap-4 marquee-track">
          {items.map((product, i) => (
            <a
              key={`${product.id}-${i}`}
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="relative flex-shrink-0 w-48 sm:w-56 aspect-square rounded-xl overflow-hidden bg-surface-2 border border-zinc-800 hover:border-zinc-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority={true}
                className="object-cover"
              />
            </a>
          ))}
        </div>

        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface to-transparent pointer-events-none z-10" />
      </div>
    </section>
  )
}

export default ProductMarquee
