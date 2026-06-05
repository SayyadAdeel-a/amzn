import Navbar from "../../../components/Navbar"
import Footer from "../../../components/Footer"
import ProductsGrid from "../../../components/ProductsGrid"
import { db } from "../../../lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import Link from "next/link"

export const revalidate = 60;

export async function generateStaticParams() {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(productsCol);
  
  const categoriesSet = new Set();
  productSnapshot.docs.forEach(doc => {
    const cat = doc.data().category;
    if (cat) categoriesSet.add(cat.toLowerCase());
  });
  
  return Array.from(categoriesSet).map(cat => ({
    slug: cat,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const capitalizedSlug = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  return {
    title: `${capitalizedSlug} Collection | FIFA 2026 Gear`,
    description: `Shop the best ${slug} for the upcoming FIFA 2026 World Cup. Discover trending styles, authentic gear, and streetwear drops.`,
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  
  // Fetch all products to get full categories list and filter for this category
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(productsCol);
  const allProducts = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const categoriesSet = new Set();
  allProducts.forEach(p => {
    if (p.category) categoriesSet.add(p.category);
  });
  const allCategories = ["All", ...Array.from(categoriesSet)];

  // The actual category string in the DB might be Capitalized or lowercase
  const targetCategory = Array.from(categoriesSet).find(c => c.toLowerCase() === slug) || slug;

  const categoryProducts = allProducts.filter(p => p.category === targetCategory);

  const capitalizedSlug = slug.charAt(0).toUpperCase() + slug.slice(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${capitalizedSlug} Collection`,
    "description": `Shop the best ${slug} for the upcoming FIFA 2026 World Cup.`,
    "itemListElement": categoryProducts.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://fifa26-lake.vercel.app/product/${product.id}`
    }))
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      {/* ItemList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <nav className="flex items-center gap-2 text-sm text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-brand capitalize">{slug}</span>
          </nav>
        </div>

        <ProductsGrid 
          products={categoryProducts} 
          activeCategoryProp={targetCategory}
          allCategories={allCategories}
        />
      </main>
      <Footer />
    </div>
  )
}
