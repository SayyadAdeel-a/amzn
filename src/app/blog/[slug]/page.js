import ReactMarkdown from "react-markdown"
import Navbar from "../../../components/Navbar"
import Footer from "../../../components/Footer"
import { db } from "../../../lib/firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}
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
    <div className="min-h-screen flex flex-col font-sans bg-black">
      <Navbar />
      
      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="flex-grow py-24 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        {/* Editorial Hero */}
        <header className="mb-16 md:mb-24 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-12 bg-brand"></span>
            <span className="text-brand font-bold tracking-widest uppercase text-sm">
              Editorial
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight" style={{ textWrap: 'balance' }}>
            {data.title}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-3xl" style={{ textWrap: 'pretty' }}>
            {data.excerpt}
          </p>
        </header>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          {/* Sticky Meta Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-32 space-y-8">
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Published</h4>
                <p className="text-white font-medium">
                  {new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Author</h4>
                <p className="text-white font-medium">FIFA 2026 Gear Team</p>
              </div>
              <div className="pt-8 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Share</h4>
                <div className="flex gap-4">
                  {/* Fake social buttons for aesthetic */}
                  <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-brand hover:bg-zinc-800 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-brand hover:bg-zinc-800 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Markdown Content */}
          <article className="flex-grow max-w-prose">
            <div className="prose prose-invert prose-lg max-w-none 
              prose-headings:font-black prose-headings:text-white prose-headings:tracking-tight
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
              prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-8
              prose-a:text-brand prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-bold
              prose-ul:list-square prose-ul:text-zinc-300
              prose-li:marker:text-brand
              prose-blockquote:border-l-4 prose-blockquote:border-brand 
              prose-blockquote:bg-zinc-900/50 prose-blockquote:py-4 prose-blockquote:px-6 
              prose-blockquote:rounded-r-2xl prose-blockquote:not-italic 
              prose-blockquote:text-white prose-blockquote:font-medium
              prose-img:rounded-3xl prose-img:w-full prose-img:shadow-2xl">
              <ReactMarkdown>{markdownContent}</ReactMarkdown>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
