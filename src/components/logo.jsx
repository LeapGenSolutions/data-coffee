import { cn } from "../lib/utils";
import { useState, useEffect } from "react";

export function Logo({ className, size = "md", interactive = true }) {
  const [isHovered, setIsHovered] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [coffeeBeans, setShowCoffeeBeans] = useState(false);

  // Cycle through chart types on hover
  useEffect(() => {
    if (isHovered && interactive) {
      const interval = setInterval(() => {
        setChartType(prev => {
          if (prev === 'bar') return 'pie';
          if (prev === 'pie') return 'binary';
          if (prev === 'binary') return 'pulse';
          return 'bar';
        });
        
        // Occasionally show coffee beans animation
        if (Math.random() > 0.7) {
          setShowCoffeeBeans(true);
          setTimeout(() => setShowCoffeeBeans(false), 1000);
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isHovered, interactive]);

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };

  return (
    <div 
      className={cn(sizeClasses[size], className, interactive ? "cursor-pointer" : "")}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onClick={() => interactive && setChartType(prev => {
        if (prev === 'bar') return 'pie';
        if (prev === 'pie') return 'binary';
        if (prev === 'binary') return 'pulse';
        return 'bar';
      })}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full translate-y-1", isHovered && interactive ? "animate-subtle-wiggle" : "")}>
        {/* Background glow */}
        <circle cx="50" cy="55" r="45" fill="url(#logo-glow)" opacity={isHovered ? "0.25" : "0.15"} />
      
        {/* Saucer */}
        <ellipse cx="50" cy="90" rx="35" ry="5" fill="#5b21b6" opacity="0.8" />
        
        {/* Cup body - cleaner version more like the reference */}
        <path 
          d="M20 40C20 40 20 85 30 85L70 85C80 85 80 40 80 40L20 40Z" 
          fill="#5b21b6" 
          stroke="#7c3aed"
          strokeWidth="1.5"
          className={isHovered ? "animate-subtle-pulse" : ""}
        />
        
        {/* Cup handle */}
        <path 
          d="M80 55C90 55 90 65 80 75" 
          fill="none"
          stroke="#7c3aed" 
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Cup rim */}
        <path
          d="M20 40L80 40"
          stroke="#7c3aed"
          strokeWidth="3"
        />
        
        {/* Coffee liquid */}
        <path
          d="M25 50C25 50 30 45 75 45L75 75C75 75 70 75 25 75L25 50Z"
          fill="#7c3aed"
          className="animate-brewing"
        />

        {/* Data visualizations based on state */}
        {chartType === 'bar' && (
          <>
            {/* Bar chart visualization - like the first reference image */}
            <rect x="35" y="65" width="6" height="10" fill="white" opacity="0.9" />
            <rect x="45" y="55" width="6" height="20" fill="white" opacity="0.9" />
            <rect x="55" y="50" width="6" height="25" fill="white" opacity="0.9" />
          </>
        )}
        
        {chartType === 'pie' && (
          <>
            {/* Pie chart visualization - like the second reference image */}
            <circle cx="52" cy="60" r="15" fill="#5b21b6" stroke="white" strokeWidth="2" />
            <path d="M52 60 L52 45 A15 15 0 0 1 67 60 Z" fill="white" opacity="0.9" />
            <path d="M52 60 L67 60 A15 15 0 0 1 52 75 Z" fill="white" opacity="0.7" />
            <line x1="52" y1="60" x2="52" y2="45" stroke="white" strokeWidth="1" />
            <line x1="52" y1="60" x2="67" y2="60" stroke="white" strokeWidth="1" />
          </>
        )}
        
        {chartType === 'binary' && (
          <>
            {/* Binary data - like the third reference image */}
            <text x="42" y="65" fontFamily="monospace" fontSize="14" fill="white" fontWeight="bold">10</text>
            <text x="42" y="78" fontFamily="monospace" fontSize="14" fill="white" fontWeight="bold">10</text>
            
            {coffeeBeans && (
              <g className="animate-float-1">
                <path d="M35 50 Q38 45 41 50 Q44 55 41 60 Q38 65 35 60 Q32 55 35 50 Z" fill="white" transform="rotate(15, 38, 55)" opacity="0.8" />
                <path d="M60 50 Q63 45 66 50 Q69 55 66 60 Q63 65 60 60 Q57 55 60 50 Z" fill="white" transform="rotate(-15, 63, 55)" opacity="0.8" />
              </g>
            )}
          </>
        )}
        
        {chartType === 'pulse' && (
          <>
            {/* Pulse line visualization - like the fourth reference image */}
            <path 
              d="M30 60 L40 60 L45 55 L50 65 L55 55 L60 65 L65 60 L70 60" 
              stroke="white" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </>
        )}
        
        {/* Steam animation - simplified and more like the reference */}
        <g className={isHovered ? "animate-steam-enhanced" : "animate-steam"}>
          <path 
            d="M35 30C30 20 40 15 35 10" 
            fill="none" 
            stroke="#c4b5fd" 
            strokeWidth={isHovered ? "2.5" : "2"} 
            strokeLinecap="round"
            className="animate-float-1"
          />
          
          <path 
            d="M55 25C50 15 60 10 55 5" 
            fill="none" 
            stroke="#c4b5fd" 
            strokeWidth={isHovered ? "2.5" : "2"} 
            strokeLinecap="round"
            className="animate-float-2"
          />
          
          {/* Binary data nodes on hover */}
          {isHovered && (
            <>
              <circle cx="35" cy="18" r="4" fill="#ddd6fe" opacity="0.8" className="animate-pulse" />
              <text x="33" y="20" fontFamily="monospace" fontSize="5" fill="#5b21b6" fontWeight="bold">1</text>
              
              <circle cx="55" cy="15" r="4" fill="#ddd6fe" opacity="0.8" className="animate-pulse" />
              <text x="53" y="17" fontFamily="monospace" fontSize="5" fill="#5b21b6" fontWeight="bold">0</text>
            </>
          )}
        </g>
        
        {/* Definitions */}
        <defs>
          <radialGradient id="logo-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#f5f5f4" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      
      {size === "lg" && (
        <div className="text-center font-bold text-xl text-purple-800 mt-2">Data Coffee</div>
      )}
    </div>
  );
}
