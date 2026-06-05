import ProductCard from "./ProductCard"
import Link from "next/link"

const ProductCollection = ({ title, description, products, viewAllLink }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 px-4 border-t border-zinc-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {title}
            </h2>
            {description && (
              <p className="text-zinc-400 mt-2 max-w-xl">
                {description}
              </p>
            )}
          </div>
          {viewAllLink && (
            <Link 
              href={viewAllLink}
              className="text-brand font-bold text-sm hover:text-brand-light transition-colors whitespace-nowrap"
            >
              View All &rarr;
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCollection
