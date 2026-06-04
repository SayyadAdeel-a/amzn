const reasons = [
  {
    icon: "📈",
    title: "Updated with viral football trends",
    description: "We track TikTok and Pinterest to bring you what's actually trending right now.",
  },
  {
    icon: "🏆",
    title: "Only high-demand FIFA 2026 products",
    description: "Curated picks from official World Cup gear to streetwear that sells out fast.",
  },
  {
    icon: "⚡",
    title: "Direct Amazon affiliate checkout",
    description: "Secure checkout through Amazon's trusted global platform with fast shipping.",
  },
  {
    icon: "🌍",
    title: "Global shipping available",
    description: "Amazon delivers worldwide — no matter where you are, your gear ships to you.",
  },
]

const WhyThisSite = () => {
  return (
    <section className="py-20 sm:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-brand text-sm font-semibold uppercase tracking-widest">
            Why This Site
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
            Built for the football culture
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-surface-2 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 group"
            >
              <span className="text-3xl mb-4 block">{item.icon}</span>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyThisSite
