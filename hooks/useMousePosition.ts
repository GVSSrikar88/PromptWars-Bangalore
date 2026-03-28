import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to track global mouse position with performance optimizations.
 */
export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Throttle mouse updates to the display's refresh rate
      if (requestRef.current) return;

      requestRef.current = requestAnimationFrame(() => {
        setMousePosition({ x: event.clientX, y: event.clientY });
        requestRef.current = 0;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePosition;
}
