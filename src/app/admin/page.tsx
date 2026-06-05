"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "../../lib/firebase";
import { collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const [auth, setAuth] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "add-product" | "pinterest" | "products" | "blogs">("overview");
  const [trends, setTrends] = useState<any[]>([]);

  // Form states - Add Product
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [productForm, setProductForm] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ message: string; error?: boolean } | null>(null);

  // States - Pinterest
  const [selectedPinProduct, setSelectedPinProduct] = useState<any>(null);
  const [pinRewrite, setPinRewrite] = useState<any>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [pinStatus, setPinStatus] = useState<{ message: string; error?: boolean } | null>(null);

  // States - Manage Products & Blogs
  const [products, setProducts] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // States - Blog Editor
  const [blogForm, setBlogForm] = useState({ slug: "", title: "", excerpt: "", body: "" });
  const [isEnhancingBlog, setIsEnhancingBlog] = useState(false);

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

  const handleEnhanceBlog = async () => {
    if (!blogForm.body) return alert("Write some blog content first!");
    setIsEnhancingBlog(true);
    try {
      const res = await fetch("/api/enhance-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: blogForm.body, products })
      });
      const data = await res.json();
      if (data.enhancedBody) {
        setBlogForm({ ...blogForm, body: data.enhancedBody });
        alert("Blog successfully enhanced with product links!");
      } else {
        alert("Enhancement failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to enhance blog.");
    } finally {
      setIsEnhancingBlog(false);
    }
  };

  // Add Product Methods
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
      setProductForm({
        title: data.title || "",
        description: data.description || "",
        price: data.price || "",
        originalPrice: "",
        image: data.image || "",
        category: data.category || "jerseys",
        badge: data.badge || "none",
        rating: data.rating || 5,
        reviewCount: data.reviewCount || 0,
        reviews: data.reviews || [],
        salesVolume: data.salesVolume || "",
        featured: false,
        affiliateLink: data.url || url
      });
    } catch (error) {
      console.error(error);
      alert("Failed to fetch Amazon data.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm) return;
    setIsSaving(true);
    setSaveStatus(null);

    const productPayload = {
      ...productForm,
      rating: Number(productForm.rating),
      reviewCount: Number(productForm.reviewCount),
      publishedAt: new Date().toISOString(),
    };

    try {
      const slug = productPayload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      await setDoc(doc(db, "products", slug), productPayload);
      fetchList("products");
      setSaveStatus({ message: "✅ Product successfully saved to Store!" });
      // Reset form
      setProductForm(null);
      setUrl("");
    } catch (error) {
      console.error(error);
      setSaveStatus({ message: "❌ Failed to save product to Firebase.", error: true });
    } finally {
      setIsSaving(false);
    }
  };

  // Pinterest Methods
  const rewriteForPinterest = async () => {
    if (!selectedPinProduct) return;
    setIsRewriting(true);
    try {
      const res = await fetch("/api/rewrite-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedPinProduct.title,
          description: selectedPinProduct.description,
          category: selectedPinProduct.category,
        }),
      });
      const data = await res.json();
      setPinRewrite({
        title: data.title || selectedPinProduct.title,
        description: data.description || selectedPinProduct.description,
      });
    } catch (error) {
      console.error(error);
      alert("Rewrite failed. Falling back to original data.");
      setPinRewrite({
        title: selectedPinProduct.title,
        description: selectedPinProduct.description,
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCreatePin = async () => {
    if (!selectedPinProduct || !pinRewrite) return;
    setIsPinning(true);
    setPinStatus(null);

    const pinPayload = {
      title: pinRewrite.title,
      description: pinRewrite.description,
      price: selectedPinProduct.price,
      affiliateLink: selectedPinProduct.affiliateLink,
      image: selectedPinProduct.image,
    };

    try {
      const pinRes = await fetch("/api/pinterest/create-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pinPayload),
      });

      const pinData = await pinRes.json();
      if (pinData.success) {
        setPinStatus({ message: "✅ Pinterest pin successfully created on your board!" });
      } else {
        setPinStatus({ message: `❌ Pinterest pin failed: ${pinData.error}`, error: true });
      }
    } catch (error) {
      console.error(error);
      setPinStatus({ message: "❌ Failed to contact Pinterest API.", error: true });
    } finally {
      setIsPinning(false);
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
          <button onClick={() => setActiveTab("add-product")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "add-product" ? "bg-brand text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>Add Product</button>
          <button onClick={() => setActiveTab("pinterest")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "pinterest" ? "bg-brand text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>Pinterest Marketing</button>
          <button onClick={() => setActiveTab("products")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "products" ? "bg-brand text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>Manage Products</button>
          <button onClick={() => setActiveTab("blogs")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "blogs" ? "bg-brand text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>Manage Blogs</button>
        </div>

        {/* TAB: OVERVIEW */}
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

        {/* TAB: ADD PRODUCT */}
        {activeTab === "add-product" && (
          <div className="space-y-6">
            <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-xl font-bold text-white mb-4">1. Fetch Product Data</h2>
              <div className="flex gap-3">
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste Amazon product URL" className="flex-1 bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
                <button onClick={fetchAmazonData} disabled={isFetching || !url} className="bg-brand text-black font-bold px-6 py-3 rounded-lg hover:bg-brand-light transition-colors disabled:opacity-50">
                  {isFetching ? "Fetching..." : "Fetch Data"}
                </button>
              </div>
            </div>

            {productForm && (
              <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-white mb-6">2. Edit & Publish</h2>
                
                <div className="flex gap-6 mb-6">
                  {productForm.image && (
                    <div className="w-32 h-32 relative rounded-xl overflow-hidden flex-shrink-0 border border-zinc-700">
                      <Image src={productForm.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-2">Title</label>
                      <input type="text" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-2">Price ($)</label>
                        <input type="text" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-2">Original Price ($)</label>
                        <input type="text" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" placeholder="e.g. 129.99" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-zinc-400 mb-2">Description</label>
                  <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white h-32 resize-none focus:outline-none focus:border-brand" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Category</label>
                    <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand">
                      <option value="jerseys">Jerseys</option>
                      <option value="balls">Balls</option>
                      <option value="footwear">Footwear</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Badge</label>
                    <select value={productForm.badge} onChange={e => setProductForm({...productForm, badge: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand">
                      <option value="none">None</option>
                      <option value="hot">Hot</option>
                      <option value="new">New</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Rating (Out of 5)</label>
                    <input type="number" step="0.1" min="0" max="5" value={productForm.rating} onChange={e => setProductForm({...productForm, rating: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Total Review Count</label>
                    <input type="number" min="0" value={productForm.reviewCount} onChange={e => setProductForm({...productForm, reviewCount: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Sales Volume</label>
                    <input type="text" value={productForm.salesVolume} onChange={e => setProductForm({...productForm, salesVolume: e.target.value})} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" placeholder="e.g. 500+ bought in past month" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-brand/10 text-brand text-xs font-bold px-3 py-1.5 rounded-lg border border-brand/20">
                      💬 Scraped Text Reviews: {productForm.reviews?.length || 0}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <input type="checkbox" id="featured" checked={productForm.featured} onChange={e => setProductForm({...productForm, featured: e.target.checked})} className="w-5 h-5 accent-brand" />
                    <label htmlFor="featured" className="text-sm font-bold text-white">Featured Product (Shows on homepage)</label>
                  </div>
                </div>

                <button onClick={handleSaveProduct} disabled={isSaving} className="w-full bg-brand text-black font-bold text-lg py-4 rounded-xl hover:bg-brand-light transition-all duration-300 shadow-lg shadow-brand/20 disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Product to Store"}
                </button>
                {saveStatus && (
                  <div className={`mt-4 p-4 rounded-lg font-bold text-sm ${saveStatus.error ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{saveStatus.message}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: PINTEREST MARKETING */}
        {activeTab === "pinterest" && (
          <div className="space-y-6">
            {!selectedPinProduct ? (
              <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800">
                <h2 className="text-xl font-bold text-white mb-6">Select a Product to Pin</h2>
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
                      <button onClick={() => { setSelectedPinProduct(p); setPinRewrite(null); setPinStatus(null); }} className="bg-[#E60023] text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#ad081b] transition-colors shadow-lg shadow-[#E60023]/20">
                        Create Pin
                      </button>
                    </div>
                  ))}
                  {products.length === 0 && !isLoadingList && <p className="text-zinc-500">No products found. Add products first.</p>}
                </div>
              </div>
            ) : (
              <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800 animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Generate Pinterest Pin</h2>
                  <button onClick={() => setSelectedPinProduct(null)} className="text-zinc-400 hover:text-white font-bold text-sm px-4 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors">
                    Back to Products
                  </button>
                </div>

                <div className="flex gap-6 mb-8 bg-surface p-4 rounded-xl border border-zinc-800">
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={selectedPinProduct.image} alt="" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-white mb-1 line-clamp-2">{selectedPinProduct.title}</p>
                    <p className="text-brand font-bold">${selectedPinProduct.price}</p>
                  </div>
                </div>

                {!pinRewrite ? (
                  <div className="text-center py-8 bg-brand/5 border border-brand/20 rounded-xl mb-6">
                    <p className="text-zinc-300 mb-6">Generate highly-engaging SEO optimized copy for Pinterest.</p>
                    <button onClick={rewriteForPinterest} disabled={isRewriting} className="bg-brand text-black font-bold text-lg px-8 py-3 rounded-xl hover:bg-brand-light transition-all shadow-lg shadow-brand/20 disabled:opacity-50">
                      {isRewriting ? "AI is typing..." : "✨ Rewrite for Pinterest"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-surface p-6 rounded-xl border border-brand/30 relative">
                      <span className="absolute -top-3 left-4 bg-surface px-2 text-xs font-black text-brand uppercase tracking-wider flex items-center gap-1">✨ AI Optimized Pin</span>
                      
                      <div className="mb-4 mt-2">
                        <label className="block text-xs font-bold text-zinc-400 mb-2">Pin Title</label>
                        <input type="text" value={pinRewrite.title} onChange={e => setPinRewrite({...pinRewrite, title: e.target.value})} className="w-full bg-transparent border-b border-brand/30 pb-2 text-sm text-white font-bold focus:outline-none focus:border-brand" />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-2">Pin Description & Hashtags</label>
                        <textarea value={pinRewrite.description} onChange={e => setPinRewrite({...pinRewrite, description: e.target.value})} className="w-full bg-transparent text-sm text-zinc-200 resize-none h-32 focus:outline-none" />
                      </div>
                    </div>

                    <button onClick={handleCreatePin} disabled={isPinning} className="w-full bg-[#E60023] text-white font-bold text-lg py-4 rounded-xl hover:bg-[#ad081b] transition-all duration-300 shadow-lg shadow-[#E60023]/30 disabled:opacity-50 flex justify-center items-center gap-2">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.604 0 12.017 0z"/></svg>
                      {isPinning ? "Posting to Pinterest..." : "Post to Pinterest"}
                    </button>

                    {pinStatus && (
                      <div className={`p-4 rounded-lg font-bold text-sm ${pinStatus.error ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{pinStatus.message}</div>
                    )}
                  </div>
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
                <div className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-zinc-400">Content (Markdown)</label>
                    <button type="button" onClick={handleEnhanceBlog} disabled={isEnhancingBlog || !blogForm.body} className="text-xs bg-brand text-black font-bold px-3 py-1.5 rounded-lg hover:bg-brand-light transition-colors disabled:opacity-50 flex items-center gap-1 shadow-lg shadow-brand/20">
                      {isEnhancingBlog ? "✨ Enhancing..." : "✨ Enhance Blog (Add Links)"}
                    </button>
                  </div>
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
