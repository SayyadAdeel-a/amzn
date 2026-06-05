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

  const hotProducts = products.filter(p => p.badge === 'hot');
  const newProducts = products.filter(p => p.badge === 'new');

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
