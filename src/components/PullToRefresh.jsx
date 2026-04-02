import React, { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const THRESHOLD = 72; // px to pull before triggering

export default function PullToRefresh({ onRefresh, children, darkMode }) {
  const startY = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef(null);

  const isAtTop = () => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollTop <= 0;
  };

  const handleTouchStart = (e) => {
    if (!isAtTop()) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      e.preventDefault();
      setPullDistance(Math.min(delta * 0.5, THRESHOLD + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    startY.current = null;
    setPullDistance(0);
  };

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200 ease-out"
        style={{ height: pullDistance > 0 || refreshing ? (refreshing ? THRESHOLD : pullDistance) : 0 }}
      >
        {refreshing ? (
          <Loader2
            className={`w-6 h-6 animate-spin ${darkMode ? "text-blue-400" : "text-blue-600"}`}
          />
        ) : (
          <div
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              darkMode ? "border-blue-400" : "border-blue-600"
            }`}
            style={{
              opacity: progress,
              transform: `scale(${0.5 + progress * 0.5}) rotate(${progress * 180}deg)`,
            }}
          />
        )}
      </div>
      {children}
    </div>
  );
}