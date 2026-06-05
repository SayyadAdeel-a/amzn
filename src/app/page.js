import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import ProductMarquee from "../components/ProductMarquee"
import ProductsGrid from "../components/ProductsGrid"
import ProductCollection from "../components/ProductCollection"
import WhyThisSite from "../components/WhyThisSite"
import SocialProof from "../components/SocialProof"
import FinalCTA from "../components/FinalCTA"
import Footer from "../components/Footer"
import { db } from "../lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export const revalidate = 60; // Optional: revalidate every minute for caching

export default async function Home() {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(productsCol);
  const products = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // 1. Hot Products (Uses badge first, falls back to highest reviewed products)
  let hotProducts = products.filter(p => p.badge === 'hot');
  if (hotProducts.length === 0) {
    hotProducts = [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 8);
  }

  // 2. New Arrivals (Uses badge first, falls back to most recently added)
  let newProducts = products.filter(p => p.badge === 'new');
  if (newProducts.length === 0) {
    newProducts = [...products].sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 8);
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <HeroSection products={products} />
        <ProductMarquee products={products} />
        
        <div id="collections" className="pt-8">
          <ProductCollection 
            title="🔥 Hot Selling" 
            description="The most viral and highly-demanded gear right now." 
            products={hotProducts} 
          />
          
          <ProductCollection 
            title="✨ New Arrivals" 
            description="Fresh streetwear drops and newly released jerseys." 
            products={newProducts} 
          />
        </div>

        <div id="products">
          <ProductsGrid products={products} />
        </div>
        
        <WhyThisSite />
        <SocialProof />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
