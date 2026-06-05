"use client";

import { useState, useEffect } from "react";

export default function TrendsPage() {
  const [auth, setAuth] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trends, setTrends] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

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

  const fetchTrends = async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/pinterest/trends");
      const data = await res.json();
      setTrends(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch trends");
    } finally {
      setIsFetching(false);
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
          <h1 className="text-3xl font-black text-white">Pinterest Trends Report</h1>
          <p className="text-zinc-400">Discover viral keywords to optimize your products.</p>
        </div>

        <div className="bg-surface-2 p-6 rounded-2xl border border-zinc-800">
          <button
            onClick={fetchTrends}
            disabled={isFetching}
            className="bg-brand text-black font-bold px-6 py-3 rounded-lg hover:bg-brand-light transition-colors disabled:opacity-50 mb-6"
          >
            {isFetching ? "Fetching Trends..." : "Fetch Trends Report"}
          </button>

          {trends.length > 0 && (
            <div className="animate-in fade-in duration-500">
              <div className="overflow-x-auto bg-surface rounded-xl border border-zinc-800 mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-surface-2 text-zinc-400 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold">Keyword</th>
                      <th className="p-4 font-bold text-center">Interest Score</th>
                      <th className="p-4 font-bold text-center">Direction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trends.map((t, i) => (
                      <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="p-4 font-semibold text-white">{t.keyword}</td>
                        <td className="p-4 text-center text-zinc-300">{t.score}</td>
                        <td className="p-4 text-center">
                          {t.direction === "up" ? (
                            <span className="text-brand font-bold">↑ Rising</span>
                          ) : (
                            <span className="text-red-400 font-bold">↓ Falling</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={copyReport}
                className="w-full bg-zinc-800 text-white border border-zinc-700 font-bold text-lg py-4 rounded-xl hover:bg-zinc-700 transition-all duration-300 shadow-lg"
              >
                📋 Copy Full Report (For ChatGPT)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
