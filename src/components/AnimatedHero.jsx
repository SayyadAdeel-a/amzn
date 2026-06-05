"use client";

import { motion } from "framer-motion";

export default function AnimatedHero({ title, excerpt, overline }) {
  // Split title into words for individual staggering
  const words = title.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -40 },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 1,
      },
    },
  };

  const lineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    show: { 
      scaleX: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.5 }
    }
  };

  const excerptVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.6 }
    }
  };

  return (
    <motion.header 
      className="mb-16 md:mb-24 max-w-4xl relative z-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ perspective: 1000 }}
    >
      {overline && (
        <div className="flex items-center gap-4 mb-8 overflow-hidden">
          <motion.span 
            variants={lineVariants} 
            className="h-[2px] w-12 bg-brand origin-left"
          ></motion.span>
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-brand font-bold tracking-widest uppercase text-xs"
          >
            {overline}
          </motion.span>
        </div>
      )}
      
      <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white leading-[0.95] mb-10 tracking-tighter" style={{ textWrap: 'balance' }}>
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-2 mr-[0.25em]">
            <motion.span variants={wordVariants} className="inline-block origin-bottom">
              {word}
            </motion.span>
          </span>
        ))}
      </h1>
      
      {excerpt && (
        <motion.p 
          variants={excerptVariants}
          className="text-xl md:text-3xl text-zinc-400 font-medium leading-snug max-w-3xl tracking-tight" 
          style={{ textWrap: 'pretty' }}
        >
          {excerpt}
        </motion.p>
      )}
    </motion.header>
  );
}
