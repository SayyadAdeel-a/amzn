import { db } from "../../lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import Link from "next/link"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export const metadata = {
  title: "Blog | FIFA 2026 Gear",
  description: "Read the latest news, drops, and trends in football fashion and gear.",
}

export const revalidate = 60; // Optional: revalidate every minute for caching

export default async function BlogIndex() {
  const blogsCol = collection(db, "blogs");
  const blogSnapshot = await getDocs(blogsCol);
  
  const posts = blogSnapshot.docs.map(doc => ({
    slug: doc.id,
    ...doc.data()
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow py-32 px-4 max-w-4xl mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">The Playbook</h1>
          <p className="text-zinc-400 text-lg">Latest drops, news, and trends in football fashion.</p>
        </div>
        
        <div className="grid gap-8">
          {posts.map(post => (
            <Link 
              key={post.slug} 
              href={`/blog/${post.slug}`}
              className="group block p-6 sm:p-8 rounded-2xl bg-surface-2 border border-zinc-800 hover:border-brand/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5"
            >
              <div className="text-brand text-sm font-semibold tracking-widest mb-3">
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-brand transition-colors">
                {post.title}
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="mt-6 flex items-center text-sm font-bold text-white group-hover:text-brand transition-colors">
                Read Article
                <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          ))}
          
          {posts.length === 0 && (
            <div className="text-zinc-500 italic">No posts found. Check back later!</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
