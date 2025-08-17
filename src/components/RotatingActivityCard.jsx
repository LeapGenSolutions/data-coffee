import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../lib/utils";

export function RotatingActivityCard({ title, logs, color }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (logs.length <= 1) return;

    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % logs.length);
      }, 3000);
    };

    startInterval();

    return () => clearInterval(intervalRef.current);
  }, [logs]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (logs.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logs.length);
    }, 3000);
  };

  const currentLog = logs[currentIndex];

  // Darker and more noticeable hover background classes
  const hoverBgClass = color === "#4CAF50"
    ? "bg-green-100"
    : color === "#F44336"
    ? "bg-red-100"
    : color === "#2196F3"
    ? "bg-blue-100"
    : color === "#FFC107" 
    ? "bg-yellow-100"
    : "bg-white";

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "p-4 shadow-sm border-l-[4px] rounded-r-md transition-colors duration-200",
        isHovered ? hoverBgClass : "bg-white"
      )}
      style={{ borderColor: color }}
    >
      <p className="font-semibold text-[#1e3a8a]">{title}</p>
      <p className="text-sm text-gray-700 mt-1">{currentLog.text}</p>
      <p className="text-xs text-gray-500">
        {formatDistanceToNow(new Date(currentLog.time), { addSuffix: true })}
      </p>
    </div>
  );
}
