"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AddProductPage() {
  const [auth, setAuth] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Form states
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<any>(null);

  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenData, setRewrittenData] = useState<any>(null);

  const [category, setCategory] = useState("Jerseys");
  const [badge, setBadge] = useState("none");
  const [rating, setRating] = useState(5);
  const [reviewCount, setReviewCount] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [originalPrice, setOriginalPrice] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ message: string; error?: boolean } | null>(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem("admin_auth");
    if (savedAuth && savedAuth === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem("admin_auth", auth);
      setIsAuthenticated(true);
    } else {
      alert("Invalid password");
    }
  };

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

  const handleSave = async () => {
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
      // 1. Save to TinaCMS (assuming local API route since direct client mutation from browser requires auth/setup)
      const tinaRes = await fetch("/api/tina/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      if (!tinaRes.ok) {
        throw new Error("Failed to save to TinaCMS");
      }

      // 2. Pin to Pinterest
      const pinRes = await fetch("/api/pinterest/create-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const pinData = await pinRes.json();

      if (pinData.success) {
        setSaveStatus({ message: "✅ Product saved and Pinterest pin created!" });
      } else {
        setSaveStatus({ message: `✅ Product saved — ⚠️ Pinterest pin failed: ${pinData.error}`, error: true });
      }
    } catch (error) {
      console.error(error);
      setSaveStatus({ message: "❌ Failed to save product to CMS.", error: true });
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white">Smart Product Add Pipeline</h1>
          <p className="text-zinc-400">Fetch, Rewrite, and Auto-Pin products instantly.</p>
        </div>

        {/* Step 1: URL Fetch */}
        <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-4">1. Fetch Product</h2>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Amazon product URL"
              className="flex-1 bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand"
            />
            <button
              onClick={fetchAmazonData}
              disabled={isFetching || !url}
              className="bg-brand text-black font-bold px-6 py-3 rounded-lg hover:bg-brand-light transition-colors disabled:opacity-50"
            >
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

        {/* Step 2: Groq Rewrite */}
        {fetchedData && (
          <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">2. Pinterest Optimization</h2>
              <button
                onClick={rewriteForPinterest}
                disabled={isRewriting}
                className="bg-[#181818] border border-zinc-700 text-white font-bold px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm"
              >
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
                  <span className="text-xs font-bold text-brand uppercase tracking-wider block mb-2 flex items-center gap-1">
                    ✨ Optimized by Groq AI
                  </span>
                  <input
                    type="text"
                    value={rewrittenData.title}
                    onChange={(e) => setRewrittenData({ ...rewrittenData, title: e.target.value })}
                    className="w-full bg-transparent border-b border-brand/30 pb-2 mb-3 text-sm text-white font-semibold focus:outline-none focus:border-brand"
                  />
                  <textarea
                    value={rewrittenData.description}
                    onChange={(e) => setRewrittenData({ ...rewrittenData, description: e.target.value })}
                    className="w-full bg-transparent text-sm text-zinc-200 resize-none h-32 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Product Details */}
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
                  <option value="gaming">Gaming</option>
                  <option value="collectibles">Collectibles</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">Badge</label>
                <select value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand">
                  <option value="none">None</option>
                  <option value="hot">Hot</option>
                  <option value="new">New</option>
                  <option value="limited">Limited</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">Original Price (Optional)</label>
                <input type="text" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="e.g. 129.99" className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-zinc-400 mb-2">Rating (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-zinc-400 mb-2">Reviews</label>
                  <input type="number" value={reviewCount} onChange={(e) => setReviewCount(Number(e.target.value))} className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-5 h-5 accent-brand" />
                <label htmlFor="featured" className="text-sm font-bold text-white">Featured Product (Shows on homepage)</label>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-brand text-black font-bold text-lg py-4 rounded-xl hover:bg-brand-light transition-all duration-300 shadow-lg shadow-brand/20 disabled:opacity-50"
            >
              {isSaving ? "Saving & Pinning..." : "Save Product + Post to Pinterest"}
            </button>

            {saveStatus && (
              <div className={`mt-4 p-4 rounded-lg font-bold text-sm ${saveStatus.error ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                {saveStatus.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
