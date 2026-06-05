import ReactMarkdown from "react-markdown"
import Navbar from "../../../components/Navbar"
import Footer from "../../../components/Footer"
import { db } from "../../../lib/firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"

export const revalidate = 60; // Optional: revalidate every minute for caching

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blogRef = doc(db, "blogs", slug);
  const blogSnap = await getDoc(blogRef);
  
  if (!blogSnap.exists()) {
    return { title: "Post Not Found" };
  }

  const data = blogSnap.data();

  return {
    title: `${data.title} | FIFA 2026 Gear`,
    description: data.excerpt,
    openGraph: {
      title: data.title,
      description: data.excerpt,
      type: "article",
      publishedTime: data.date,
    },
  }
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const blogRef = doc(db, "blogs", slug);
  const blogSnap = await getDoc(blogRef);
  
  if (!blogSnap.exists()) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white">Post not found</h1>
        </main>
        <Footer />
      </div>
    )
  }

  const data = blogSnap.data();
  const markdownContent = data.body || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.title,
    "description": data.excerpt,
    "datePublished": data.date,
    "author": {
      "@type": "Person",
      "name": "FIFA 2026 Gear Team"
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="flex-grow py-32 px-4 max-w-3xl mx-auto w-full">
        <article className="max-w-prose mx-auto">
          <header className="mb-12 text-center">
            <div className="text-brand font-bold tracking-widest uppercase mb-4">
              {new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              {data.title}
            </h1>
            <p className="text-xl text-zinc-400">
              {data.excerpt}
            </p>
          </header>
          
          <div className="mt-16 text-zinc-300 leading-loose text-lg [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-white [&>h1]:mt-12 [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-10 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-8 [&>h3]:mb-4 [&>p]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2 [&>a]:text-brand [&>a]:underline hover:[&>a]:text-brand-light [&>blockquote]:border-l-4 [&>blockquote]:border-brand [&>blockquote]:bg-surface-2 [&>blockquote]:py-2 [&>blockquote]:px-6 [&>blockquote]:rounded-r-xl [&>blockquote]:italic [&>img]:rounded-2xl [&>img]:my-8 [&>strong]:text-white">
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
