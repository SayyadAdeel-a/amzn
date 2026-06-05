import Image from "next/image"

const HeroSection = ({ products }) => {
  const bgProducts = [products[1], products[0], products[4], products[3], products[2]].filter(Boolean);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/95 to-surface" />

      {bgProducts.map((p, i) => (
        <div
          key={p.id}
          className="absolute hidden md:block w-64 lg:w-80 opacity-50 rounded-2xl overflow-hidden aspect-[4/5]"
          style={{
            top: `${15 + i * 18}%`,
            left: i % 2 === 0 ? `${-5 + (i % 3) * 8}%` : 'auto',
            right: i % 2 !== 0 ? `${-5 + (i % 3) * 8}%` : 'auto',
            transform: `rotate(${i % 2 === 0 ? '-' : ''}${8 + i * 4}deg)`,
            filter: 'blur(1px)',
          }}
        >
          <Image
            src={p.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 256px, 320px"
            priority={true}
            className="object-cover"
          />
        </div>
      ))}

      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1577223625816-7546e13df25d?w=1920&h=1080&fit=crop"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      >
        <source
          src="https://cdn.coverr.co/videos/coverr-football-stadium-with-lights-5890/1080p.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-sm font-semibold mb-6 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-brand animate-glow" />
          FIFA 2026 Collection Live
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
          FIFA 2026 Football Gear &{" "}
          <span className="text-brand">Streetwear Drops</span>
          <span className="inline-block ml-2">⚽🔥</span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Trending sneakers, jerseys, and football fashion from global teams
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#products"
            className="group relative px-8 py-4 bg-brand text-black font-bold text-lg rounded-full hover:bg-brand-light transition-all duration-300 shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5 inline-block"
          >
            <span className="relative z-10">Explore Trending Products</span>
          </a>

          <a
            href="#products"
            className="px-8 py-4 border border-zinc-700 text-white font-semibold text-lg rounded-full hover:bg-white/5 hover:border-zinc-500 transition-all duration-300 inline-block"
          >
            View Deals
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
    </section>
  )
}

export default HeroSection
