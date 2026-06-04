import ProductCard from "./ProductCard"
import products from "../data/products"

const ProductsGrid = () => {
  return (
    <section id="products" className="py-20 sm:py-28 px-4 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-brand text-sm font-semibold uppercase tracking-widest">
            Shop Trending
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
            Trending Products
          </h2>
          <p className="text-zinc-400 mt-3 max-w-xl mx-auto">
            Viral football gear and streetwear picks curated from Amazon's best sellers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductsGrid
