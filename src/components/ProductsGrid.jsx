"use client"
import Link from "next/link"
import { useState } from "react"
import ProductCard from "./ProductCard"

const PER_PAGE = 4

const ProductsGrid = ({ products, activeCategoryProp, allCategories }) => {
  const [page, setPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState("All")
  
  const categories = allCategories || ["All", ...new Set(products.map(p => p.category).filter(Boolean))]
  
  const filteredProducts = (activeCategoryProp || activeCategory) === "All" 
    ? products 
    : products.filter(p => p.category === (activeCategoryProp || activeCategory))

  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE)
  const start = (page - 1) * PER_PAGE
  const paged = filteredProducts.slice(start, start + PER_PAGE)

  return (
    <section id="products" className="py-20 sm:py-28 px-4 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-brand text-sm font-semibold uppercase tracking-widest">
            Shop Trending
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
            {activeCategoryProp && activeCategoryProp !== "All" ? `${activeCategoryProp} Collection` : "Trending Products"}
          </h2>
          <p className="text-zinc-400 mt-3 max-w-xl mx-auto">
            Viral football gear and streetwear picks curated from Amazon's best sellers.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => {
            const isActive = (activeCategoryProp || activeCategory) === cat;
            const href = cat === "All" ? "/#products" : `/category/${cat.toLowerCase()}`;
            
            return (
              <Link
                key={cat}
                href={href}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  isActive
                    ? "bg-brand text-black shadow-lg shadow-brand/20"
                    : "bg-surface-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {paged.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-surface-2 border border-zinc-700 text-sm font-semibold text-zinc-400 hover:text-white hover:border-zinc-500 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                  n === page
                    ? "bg-brand text-black shadow-lg shadow-brand/25"
                    : "bg-surface-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-surface-2 border border-zinc-700 text-sm font-semibold text-zinc-400 hover:text-white hover:border-zinc-500 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductsGrid
