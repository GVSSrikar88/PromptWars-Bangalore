'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useMemo } from 'react';

interface KeywordBubbleProps {
  /** The text content to display in the bubble */
  text: string;
  /** Global mouse X coordinate */
  mouseX: number;
  /** Global mouse Y coordinate */
  mouseY: number;
  /** Index for staggered animations */
  index: number;
}

/**
 * KeywordBubble - A mouse-reactive physics component that wobbles and pushes away from the cursor.
 */
export default function KeywordBubble({ text, mouseX, mouseY, index }: KeywordBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // High-performance springs for physics movement
  const x = useSpring(0, { stiffness: 60, damping: 25 });
  const y = useSpring(0, { stiffness: 60, damping: 25 });
  
  // Gentle ambient floating springs
  const floatX = useSpring(0, { stiffness: 12, damping: 8 });
  const floatY = useSpring(0, { stiffness: 12, damping: 8 });

  // Staggered ambient float effect
  useEffect(() => {
    const animateFloat = () => {
      const time = Date.now() / 1000;
      floatX.set(Math.sin(time + index * 0.5) * 15);
      floatY.set(Math.cos(time * 0.8 + index * 0.5) * 15);
    };

    const interval = setInterval(animateFloat, 50);
    return () => clearInterval(interval);
  }, [floatX, floatY, index]);

  // Mouse repulsion logic
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Get absolute center of the bubble
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.hypot(dx, dy);
    
    const REPULSION_RADIUS = 180;
    
    // Smoothly interpolate repulsion strength
    if (distance < REPULSION_RADIUS) {
      const strength = (REPULSION_RADIUS - distance) / REPULSION_RADIUS;
      const pushFactor = strength * strength * 120; // Quadratic scaling for more realistic feel
      
      const angle = Math.atan2(dy, dx);
      x.set(Math.cos(angle + Math.PI) * pushFactor);
      y.set(Math.sin(angle + Math.PI) * pushFactor);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [mouseX, mouseY, x, y]);

  // Reactive motion style
  const motionStyle = {
    x: useTransform([x, floatX], ([latestX, latestFloatX]) => (latestX as number) + (latestFloatX as number)),
    y: useTransform([y, floatY], ([latestY, latestFloatY]) => (latestY as number) + (latestFloatY as number)),
    cursor: 'grab'
  };

  return (
    <motion.div
      ref={containerRef}
      style={motionStyle}
      whileHover={{ scale: 1.15, zIndex: 100 }}
      whileTap={{ scale: 0.95, cursor: 'grabbing' }}
      className="keyword-bubble"
    >
      <div className="bubble-content">
        <span className="bubble-text">{text}</span>
        <div className="bubble-glow" />
      </div>
    </motion.div>
  );
}
