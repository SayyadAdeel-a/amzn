const stats = [
  {
    icon: "🔥",
    text: "Trending on TikTok Football Culture",
  },
  {
    icon: "⚽",
    text: "FIFA 2026 viral fashion picks",
  },
  {
    icon: "👟",
    text: "Worn by global streetwear community",
  },
  {
    icon: "💰",
    text: "High-demand Amazon products",
  },
]

const SocialProof = () => {
  return (
    <section className="py-20 sm:py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item) => (
            <div
              key={item.text}
              className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-brand/10 to-transparent border border-brand/20 text-center group hover:border-brand/40 transition-all duration-300"
            >
              <span className="text-3xl sm:text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </span>
              <p className="text-white font-bold text-sm sm:text-base leading-snug">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SocialProof
