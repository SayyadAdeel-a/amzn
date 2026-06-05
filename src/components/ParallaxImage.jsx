"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ParallaxImage(props) {
  const containerRef = useRef(null);

  // Track the scroll progress of this specific image container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Map scroll progress to a subtle vertical shift for the image
  // This means the image moves slightly slower than the page scrolls
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div 
      ref={containerRef} 
      className="relative overflow-hidden rounded-3xl my-16 shadow-2xl bg-zinc-900 border border-zinc-800"
      style={{ aspectRatio: "16/9" }}
    >
      <motion.img
        {...props}
        style={{ y, scale: 1.2 }}
        className="absolute top-0 left-0 w-full h-full object-cover rounded-none my-0 shadow-none border-none"
        loading="lazy"
      />
    </div>
  );
}
