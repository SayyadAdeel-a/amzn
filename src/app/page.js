import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import ProductMarquee from "../components/ProductMarquee"
import ProductsGrid from "../components/ProductsGrid"
import WhyThisSite from "../components/WhyThisSite"
import SocialProof from "../components/SocialProof"
import FinalCTA from "../components/FinalCTA"
import Footer from "../components/Footer"
import fs from "fs"
import path from "path"

export default async function Home() {
  const productsDir = path.join(process.cwd(), "content/products")
  const productFiles = fs.readdirSync(productsDir)
  const products = productFiles
    .filter(file => file.endsWith(".json"))
    .map(file => {
      try {
        const filePath = path.join(productsDir, file)
        const content = fs.readFileSync(filePath, "utf-8")
        return JSON.parse(content)
      } catch (error) {
        console.error(`Error parsing ${file}:`, error)
        return null
      }
    })
    .filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <HeroSection products={products} />
        <ProductMarquee products={products} />
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
