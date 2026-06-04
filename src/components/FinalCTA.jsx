const FinalCTA = () => {
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative py-24 sm:py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-brand/5 to-surface" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <span className="inline-block text-5xl mb-6">⚽</span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.15] mb-6">
          Don't miss the{" "}
          <span className="text-brand">FIFA 2026 hype drops</span>
        </h2>

        <p className="text-zinc-400 text-lg sm:text-xl mb-10 max-w-xl mx-auto">
          Limited stock on trending football gear and streetwear. Grab yours before they sell out.
        </p>

        <button
          onClick={scrollToProducts}
          className="group relative px-10 py-4 bg-brand text-black font-bold text-lg rounded-full hover:bg-brand-light transition-all duration-300 shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5"
        >
          <span className="relative z-10 flex items-center gap-2">
            Shop Now
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </section>
  )
}

export default FinalCTA
