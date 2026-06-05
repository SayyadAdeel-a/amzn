import Image from "next/image"
import Link from "next/link"
import Navbar from "../../../components/Navbar"
import Footer from "../../../components/Footer"
import { db } from "../../../lib/firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"

export const revalidate = 60;

export async function generateStaticParams() {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(productsCol);
  
  return productSnapshot.docs.map(doc => ({
    slug: doc.id,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const productRef = doc(db, "products", slug);
  const productSnap = await getDoc(productRef);
  
  if (!productSnap.exists()) {
    return { title: "Product Not Found" };
  }

  const product = productSnap.data();

  return {
    title: `${product.title} | FIFA 2026 Gear`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [product.image],
      type: "website",
    },
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const productRef = doc(db, "products", slug);
  const productSnap = await getDoc(productRef);
  
  if (!productSnap.exists()) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white">Product not found</h1>
        </main>
        <Footer />
      </div>
    )
  }

  const product = productSnap.data();

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.image,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "url": `https://fifa26-lake.vercel.app/product/${slug}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": "https://schema.org/InStock",
    },
  }

  if (product.rating && product.reviewCount) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount,
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow py-32 px-4 max-w-6xl mx-auto w-full">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-12">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.category?.toLowerCase()}`} className="hover:text-white transition-colors capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-brand line-clamp-1">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Image Gallery */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface-2 border border-zinc-800 flex items-center justify-center">
            {product.badge && product.badge !== 'none' && (
              <div className="absolute top-6 left-6 z-10 px-4 py-2 bg-brand text-black text-xs font-black uppercase tracking-widest rounded-full">
                {product.badge}
              </div>
            )}
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title || product.name || "Product"}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <span className="text-zinc-500 font-medium">No Image Provided</span>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
              {product.title || product.name || "Untitled Product"}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-brand">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl font-bold text-zinc-500 line-through">${product.originalPrice}</span>
                )}
              </div>
              
              {product.rating && (
                <div className="flex items-center gap-1 bg-surface-2 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <svg className="w-4 h-4 text-brand" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white font-bold text-sm">{product.rating}</span>
                  <span className="text-zinc-400 text-sm">({product.reviewCount || 0})</span>
                </div>
              )}
            </div>

            <div className="prose prose-invert prose-p:text-zinc-300 prose-p:leading-relaxed mb-12">
              <p>{product.description}</p>
            </div>

            <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800 mb-8">
              <p className="text-sm text-zinc-400 mb-4">
                <strong>Why we love it:</strong> Perfect for game day or street style. Authentic look and feel directly shipped via Amazon Prime.
              </p>
              <a
                href={product.affiliateLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group flex items-center justify-center gap-3 w-full px-8 py-5 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-lg font-black rounded-xl hover:from-amber-300 hover:to-orange-400 transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-1"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.3 21.4c-.9-.3-1.9-.6-2.9-.6-1.1 0-2.1.3-3.1.6-.5.2-1 .3-1.5.3-.3 0-.5-.1-.7-.2-.6-.3-1.2-.7-1.8-1-.7-.4-1.5-.7-2.3-.7-.8 0-1.6.3-2.3.7-.6.4-1.2.7-1.8 1-.2.1-.4.2-.7.2-.5 0-1-.1-1.5-.3-1-.3-2-.6-3.1-.6-1 0-2 .3-2.9.6-.2.1-.5.1-.7 0-.3-.1-.4-.4-.3-.7.8-2.2 2.5-3.5 4.8-3.9.8-.1 1.6-.2 2.4-.2 1.8 0 3.5.5 5 1.3.2.1.4.1.6 0 1.5-.8 3.2-1.3 5-1.3.8 0 1.6.1 2.4.2 2.3.4 4 1.7 4.8 3.9.1.3 0 .6-.3.7-.2.1-.4.1-.6 0zM6.5 12c-.8 0-1.5-.3-2.1-.8-.6-.5-.9-1.2-.9-2V6.5c0-.8.3-1.5.9-2 .6-.5 1.3-.8 2.1-.8s1.5.3 2.1.8c.6.5.9 1.2.9 2V9c0 .8-.3 1.5-.9 2-.6.5-1.3.8-2.1.8zm11 0c-.8 0-1.5-.3-2.1-.8-.6-.5-.9-1.2-.9-2V6.5c0-.8.3-1.5.9-2 .6-.5 1.3-.8 2.1-.8s1.5.3 2.1.8c.6.5.9 1.2.9 2V9c0 .8-.3 1.5-.9 2-.6.5-1.3.8-2.1.8z"/>
                </svg>
                <span>Check Availability on Amazon</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <p className="text-center text-xs text-zinc-500 mt-4">
                Eligible for Prime Delivery.
              </p>
            </div>
            
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
