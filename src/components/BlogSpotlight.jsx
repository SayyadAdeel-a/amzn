"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function BlogSpotlight() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Use springs to give the spotlight a smooth, heavy feel when following the mouse
  const springX = useSpring(0, { stiffness: 100, damping: 30, mass: 1 });
  const springY = useSpring(0, { stiffness: 100, damping: 30, mass: 1 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Set the exact center of the spotlight
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    springX.set(mousePosition.x);
    springY.set(mousePosition.y);
  }, [mousePosition, springX, springY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen"
      style={{
        background: `radial-gradient(800px circle at calc(var(--x) * 1px) calc(var(--y) * 1px), rgba(204, 255, 0, 0.05), transparent 80%)`,
        "--x": springX,
        "--y": springY,
      }}
    />
  );
}
