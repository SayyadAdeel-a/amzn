"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "../../lib/firebase";
import { collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const [auth, setAuth] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "smart-add" | "products" | "blogs">("overview");
  const [trends, setTrends] = useState<any[]>([]);

  // Form states - Smart Add
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenData, setRewrittenData] = useState<any>(null);
  const [category, setCategory] = useState("jerseys");
  const [badge, setBadge] = useState("none");
  const [rating, setRating] = useState(5);
  const [reviewCount, setReviewCount] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [originalPrice, setOriginalPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ message: string; error?: boolean } | null>(null);

  // States - Manage Products & Blogs
  const [products, setProducts] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // States - Blog Editor
  const [blogForm, setBlogForm] = useState({ slug: "", title: "", excerpt: "", body: "" });

  useEffect(() => {
    const savedAuth = localStorage.getItem("admin_auth");
    if (savedAuth && savedAuth === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchList("products");
      fetchList("blogs");
      fetchTrends();
    }
  }, [isAuthenticated]);

  const fetchTrends = async () => {
    try {
      const res = await fetch("/api/pinterest/trends");
      const data = await res.json();
      setTrends(data);
    } catch (err) {
      console.error(err);
    }
  };

  const copyReport = () => {
    if (trends.length === 0) return;
    
    let text = "Trending Keywords Report:\n\n";
    trends.forEach(t => {
      text += `- ${t.keyword} (Score: ${t.score}, Trend: ${t.direction})\n`;
    });
    
    text += "\nPrompt for ChatGPT: Using the trending keywords above, generate 5 highly engaging Pinterest pin descriptions for a FIFA 2026 streetwear and football gear store. Make them punchy and include relevant hashtags.";

    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem("admin_auth", auth);
      setIsAuthenticated(true);
    } else {
      alert("Invalid password");
    }
  };

  const fetchList = async (type: "products" | "blogs") => {
    setIsLoadingList(true);
    try {
      const snapshot = await getDocs(collection(db, type));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (type === "products") setProducts(data);
      if (type === "blogs") setBlogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleDelete = async (type: "products" | "blogs", id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type === "products" ? "product" : "blog"}?`)) return;
    try {
      await deleteDoc(doc(db, type, id));
      fetchList(type);
    } catch (err) {
      console.error(err);
      alert("Failed to delete.");
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.slug || !blogForm.body) return alert("Please fill required fields");
    
    try {
      await setDoc(doc(db, "blogs", blogForm.slug), {
        title: blogForm.title,
        excerpt: blogForm.excerpt,
        body: blogForm.body,
        date: new Date().toISOString()
      });
      alert("Blog Saved!");
      setBlogForm({ slug: "", title: "", excerpt: "", body: "" });
      fetchList("blogs");
    } catch (err) {
      console.error(err);
      alert("Failed to save blog");
    }
  };

  // Smart Add Methods
  const fetchAmazonData = async () => {
    if (!url) return;
    setIsFetching(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/fetch-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setFetchedData(data);
      if (data.rating) setRating(data.rating);
      if (data.reviewCount) setReviewCount(data.reviewCount);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch Amazon data.");
    } finally {
      setIsFetching(false);
    }
  };

  const rewriteForPinterest = async () => {
    if (!fetchedData) return;
    setIsRewriting(true);
    try {
      const res = await fetch("/api/rewrite-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fetchedData.title,
          description: fetchedData.description,
          category,
        }),
      });
      const data = await res.json();
      setRewrittenData({
        title: data.title || fetchedData.title,
        description: data.description || fetchedData.description,
      });
    } catch (error) {
      console.error(error);
      alert("Rewrite failed. Falling back to original data.");
      setRewrittenData({
        title: fetchedData.title,
        description: fetchedData.description,
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!rewrittenData || !fetchedData) return;
    setIsSaving(true);
    setSaveStatus(null);

    const productPayload = {
      title: rewrittenData.title,
      description: rewrittenData.description,
      price: fetchedData.price,
      originalPrice,
      affiliateLink: fetchedData.url || url,
      image: fetchedData.image,
      category,
      badge,
      rating: Number(rating),
      reviewCount: Number(reviewCount),
      featured,
      publishedAt: new Date().toISOString(),
    };

    try {
      const slug = productPayload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      await setDoc(doc(db, "products", slug), productPayload);
      fetchList("products");

      const pinRes = await fetch("/api/pinterest/create-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const pinData = await pinRes.json();
      if (pinData.success) {
        setSaveStatus({ message: "✅ Product saved to Firebase and Pinterest pin created!" });
      } else {
        setSaveStatus({ message: `✅ Product saved — ⚠️ Pinterest pin failed: ${pinData.error}`, error: true });
      }
    } catch (error) {
      console.error(error);
      setSaveStatus({ message: "❌ Failed to save product to Firebase.", error: true });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-sans text-foreground">
        <form onSubmit={handleLogin} className="bg-surface-2 p-8 rounded-2xl border border-zinc-800 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-white text-center">Admin Access</h1>
          <input
            type="password"
            value={auth}
            onChange={(e) => setAuth(e.target.value)}
            placeholder="Password"
            className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-brand"
          />
          <button type="submit" className="w-full bg-brand text-black font-bold py-3 rounded-lg hover:bg-brand-light transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-foreground py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white">Storefront CMS</h1>
          <p className="text-zinc-400">Manage products, blogs, and marketing pipelines.</p>
        </div>

        {/* TABS */}
        <div className="flex gap-4 border-b border-zinc-800 pb-4 overflow-x-auto">
          <button onClick={() => setActiveTab("overview")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "overview" ? "bg-brand text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>Overview</button>
          <button onClick={() => setActiveTab("smart-add")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "smart-add" ? "bg-brand text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>Smart Add Product</button>
          <button onClick={() => setActiveTab("products")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "products" ? "bg-brand text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>Manage Products</button>
          <button onClick={() => setActiveTab("blogs")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "blogs" ? "bg-brand text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>Manage Blogs</button>
        </div>

        {/* TAB 0: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center">
                <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Total Products</span>
                <span className="text-5xl font-black text-brand">{products.length}</span>
              </div>
              <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center">
                <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Total Blogs</span>
                <span className="text-5xl font-black text-brand">{blogs.length}</span>
              </div>
            </div>

            <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-xl font-bold text-white mb-6">Live Trends Analysis</h2>
              {trends.length > 0 ? (
                <div className="animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {trends.slice(0, 15).map((t, i) => (
                      <div key={i} className="bg-surface p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                        <span className="text-white font-bold capitalize truncate mr-2">{t.keyword}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-brand font-black bg-brand/10 px-2 py-1 rounded-md">{t.score > 0 ? Math.round(t.score) : 90}+ Score</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={copyReport}
                    className="w-full bg-zinc-800 text-white border border-zinc-700 font-bold text-lg py-4 rounded-xl hover:bg-zinc-700 transition-all duration-300 shadow-lg"
                  >
                    📋 Copy Full Report (For ChatGPT)
                  </button>
                </div>
              ) : (
                <p className="text-zinc-500">Loading trends...</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: SMART ADD */}
        {activeTab === "smart-add" && (
          <div className="space-y-6">
            <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-xl font-bold text-white mb-4">1. Fetch Product</h2>
              <div className="flex gap-3">
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste Amazon product URL" className="flex-1 bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
                <button onClick={fetchAmazonData} disabled={isFetching || !url} className="bg-brand text-black font-bold px-6 py-3 rounded-lg hover:bg-brand-light transition-colors disabled:opacity-50">
                  {isFetching ? "Fetching..." : "Fetch Data"}
                </button>
              </div>
              {fetchedData && (
                <div className="mt-6 flex gap-4 p-4 bg-surface rounded-xl border border-zinc-800">
                  {fetchedData.image && (
                    <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={fetchedData.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white line-clamp-2">{fetchedData.title}</p>
                    <p className="text-brand font-bold mt-2">${fetchedData.price}</p>
                  </div>
                </div>
              )}
            </div>

            {fetchedData && (
              <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">2. Pinterest Optimization</h2>
                  <button onClick={rewriteForPinterest} disabled={isRewriting} className="bg-[#181818] border border-zinc-700 text-white font-bold px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm">
                    {isRewriting ? "Processing..." : "Rewrite for Pinterest with AI"}
                  </button>
                </div>
                {rewrittenData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-xl border border-zinc-800">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Original (Amazon)</span>
                      <input type="text" readOnly value={fetchedData.title} className="w-full bg-transparent border-b border-zinc-800 pb-2 mb-3 text-sm text-zinc-400 focus:outline-none" />
                      <textarea readOnly value={fetchedData.description} className="w-full bg-transparent text-sm text-zinc-400 resize-none h-32 focus:outline-none" />
                    </div>
                    <div className="bg-brand/5 p-4 rounded-xl border border-brand/20">
                      <span className="text-xs font-bold text-brand uppercase tracking-wider block mb-2 flex items-center gap-1">✨ Optimized by AI</span>
                      <input type="text" value={rewrittenData.title} onChange={(e) => setRewrittenData({ ...rewrittenData, title: e.target.value })} className="w-full bg-transparent border-b border-brand/30 pb-2 mb-3 text-sm text-white font-semibold focus:outline-none focus:border-brand" />
                      <textarea value={rewrittenData.description} onChange={(e) => setRewrittenData({ ...rewrittenData, description: e.target.value })} className="w-full bg-transparent text-sm text-zinc-200 resize-none h-32 focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {rewrittenData && (
              <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-white mb-6">3. Finalize & Publish</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand">
                      <option value="jerseys">Jerseys</option>
                      <option value="balls">Balls</option>
                      <option value="footwear">Footwear</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Badge</label>
                    <select value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand">
                      <option value="none">None</option>
                      <option value="hot">Hot</option>
                      <option value="new">New</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Rating (Out of 5)</label>
                    <input type="number" step="0.1" min="0" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Review Count</label>
                    <input type="number" min="0" value={reviewCount} onChange={(e) => setReviewCount(Number(e.target.value))} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <input type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-5 h-5 accent-brand" />
                    <label htmlFor="featured" className="text-sm font-bold text-white">Featured Product (Shows on homepage)</label>
                  </div>
                </div>
                <button onClick={handleSaveProduct} disabled={isSaving} className="w-full bg-brand text-black font-bold text-lg py-4 rounded-xl hover:bg-brand-light transition-all duration-300 shadow-lg shadow-brand/20 disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Product + Post to Pinterest"}
                </button>
                {saveStatus && (
                  <div className={`mt-4 p-4 rounded-lg font-bold text-sm ${saveStatus.error ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{saveStatus.message}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANAGE PRODUCTS */}
        {activeTab === "products" && (
          <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-6">Manage Products</h2>
            <div className="space-y-4">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-surface p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-4">
                    {p.image ? (
                      <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                        <Image src={p.image} alt="" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] text-zinc-500">No Img</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white line-clamp-1">{p.title || p.name || "Untitled Product"}</p>
                      <p className="text-sm text-zinc-400">${p.price} • {p.category}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete("products", p.id)} className="text-red-400 hover:text-red-300 font-bold text-sm px-4 py-2 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
                    Delete
                  </button>
                </div>
              ))}
              {products.length === 0 && !isLoadingList && <p className="text-zinc-500">No products found.</p>}
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE BLOGS */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-xl font-bold text-white mb-6">Create New Blog</h2>
              <form onSubmit={handleSaveBlog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Title</label>
                    <input type="text" value={blogForm.title} onChange={e => setBlogForm({...blogForm, title: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-brand outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">URL Slug</label>
                    <input type="text" value={blogForm.slug} onChange={e => setBlogForm({...blogForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} placeholder="e.g. top-5-jerseys" className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-brand outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">Excerpt</label>
                  <textarea value={blogForm.excerpt} onChange={e => setBlogForm({...blogForm, excerpt: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-brand outline-none h-20 resize-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">Content (Markdown)</label>
                  <textarea value={blogForm.body} onChange={e => setBlogForm({...blogForm, body: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-brand outline-none h-64 font-mono text-sm" required />
                </div>
                <button type="submit" className="bg-brand text-black font-bold px-6 py-3 rounded-lg hover:bg-brand-light transition-colors">
                  Publish Blog
                </button>
              </form>
            </div>

            <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-xl font-bold text-white mb-6">Manage Blogs</h2>
              <div className="space-y-4">
                {blogs.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-surface p-4 rounded-xl border border-zinc-800">
                    <div>
                      <p className="font-bold text-white">{b.title}</p>
                      <p className="text-sm text-zinc-400">{b.id}</p>
                    </div>
                    <button onClick={() => handleDelete("blogs", b.id)} className="text-red-400 hover:text-red-300 font-bold text-sm px-4 py-2 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
                      Delete
                    </button>
                  </div>
                ))}
                {blogs.length === 0 && !isLoadingList && <p className="text-zinc-500">No blogs found.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
