import { cn } from "../lib/utils";
import { useState, useEffect } from "react";

export function InteractiveCoffeeLogo({ className, size = "md" }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [wobble, setWobble] = useState(false);
  const [steamLevel, setSteamLevel] = useState(1);
  const [dataPoints, setDataPoints] = useState([]);
  const [barHeights, setBarHeights] = useState([10, 20, 25]);
  
  // Generate random data points and set up auto-animation
  useEffect(() => {
    const newPoints = [];
    for (let i = 0; i < 15; i++) {
      newPoints.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: 0.5 + Math.random() * 0.5,
        size: 1 + Math.random() * 2
      });
    }
    setDataPoints(newPoints);
    
    // Auto animate regularly (every 1-3 seconds)
    const interval = setInterval(() => {
      handleAnimation();
    }, 1000 + Math.random() * 2000); // Random interval between 1-3 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Animation handler
  const handleAnimation = () => {
    setIsAnimating(true);
    setWobble(true);
    setSteamLevel(2);
    
    // Animate bars
    const newHeights = [
      5 + Math.random() * 15,
      15 + Math.random() * 15,
      20 + Math.random() * 15
    ];
    setBarHeights(newHeights);
    
    // Reset
    setTimeout(() => {
      setWobble(false);
      setTimeout(() => setSteamLevel(1), 500);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 300);
  };

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-60 h-60"
  };

  return (
    <div 
      className={cn(sizeClasses[size], className, "cursor-pointer select-none")}
      onClick={handleAnimation}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" 
        className={cn(
          "w-full h-full", 
          wobble ? "animate-wobble" : "",
          isAnimating ? "animate-pulse-subtle" : ""
        )}
      >
        {/* Background with glow effect */}
        <circle cx="50" cy="50" r="45" fill="url(#interactive-glow)" 
          className={isAnimating ? "animate-pulse-fast" : ""}
          opacity={isAnimating ? 0.35 : 0.25} 
        />
        
        {/* Data visualization points */}
        {dataPoints.map((point, i) => (
          <circle 
            key={i}
            cx={point.x} 
            cy={point.y} 
            r={point.size} 
            fill="white" 
            opacity={isAnimating ? point.opacity * 1.5 : point.opacity * 0.6}
            className={`animate-float-${(i % 3) + 1}`}
          />
        ))}
        
        {/* Data flow lines */}
        <path 
          d="M10,50 Q30,20 50,50 Q70,80 90,50" 
          stroke="#8B5A40" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.4"
          className={isAnimating ? "animate-pulse-fast" : ""}
        />
        
        <path 
          d="M10,60 Q30,90 50,60 Q70,30 90,60" 
          stroke="#8B5A40" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.4"
          className={isAnimating ? "animate-pulse-fast" : ""}
        />
        
        {/* Cup Base - Saucer */}
        <ellipse 
          cx="50" 
          cy="90" 
          rx="35" 
          ry="5" 
          fill="#6f4536" 
          opacity="0.8"
          className={wobble ? "animate-expand" : ""}
        />
        
        {/* Cup body */}
        <path 
          d="M24 40C24 40 24 85 35 85L65 85C76 85 76 40 76 40L24 40Z" 
          fill="#8B5A40" 
          stroke="#6f4536"
          strokeWidth="2"
          className={wobble ? "animate-pulse-subtle" : ""}
        />
        
        {/* Cup handle */}
        <path 
          d="M76 50C86 50 86 65 76 75" 
          fill="none" 
          stroke="#6f4536" 
          strokeWidth="3"
          strokeLinecap="round"
          className={wobble ? "animate-rotate-subtle" : ""}
        />
        
        {/* Coffee liquid - with animation */}
        <path
          d="M30 50C30 50 34 47 70 47L70 75C70 75 66 75 30 75L30 50Z"
          fill="#5d4037"
          opacity={wobble ? "0.9" : "0.8"}
          className="animate-brewing"
        />
        
        {/* Bar chart visualization */}
        <rect 
          x="37" 
          y={75 - barHeights[0]} 
          width="6" 
          height={barHeights[0]} 
          fill="white" 
          opacity="0.9"
          className={isAnimating ? "animate-bar-grow" : ""}
        />
        <rect 
          x="47" 
          y={75 - barHeights[1]} 
          width="6" 
          height={barHeights[1]} 
          fill="white" 
          opacity="0.9"
          className={isAnimating ? "animate-bar-grow" : ""}
        />
        <rect 
          x="57" 
          y={75 - barHeights[2]} 
          width="6" 
          height={barHeights[2]} 
          fill="white" 
          opacity="0.9"
          className={isAnimating ? "animate-bar-grow" : ""}
        />
        
        {/* Steam animation with enhanced effect */}
        <g className="animate-steam">
          <path 
            d="M32 30C27 20 37 15 32 10" 
            fill="none" 
            stroke="#b98e6a" 
            strokeWidth={steamLevel > 1 ? "3" : "2"} 
            strokeLinecap="round"
            className="animate-float-1"
            opacity={steamLevel > 1 ? "0.9" : "0.7"}
          />
          
          <path 
            d="M50 25C45 15 55 10 50 5" 
            fill="none" 
            stroke="#b98e6a" 
            strokeWidth={steamLevel > 1 ? "3" : "2"} 
            strokeLinecap="round"
            className="animate-float-2"
            opacity={steamLevel > 1 ? "0.9" : "0.7"}
          />
          
          <path 
            d="M68 30C63 20 73 15 68 10" 
            fill="none" 
            stroke="#b98e6a" 
            strokeWidth={steamLevel > 1 ? "3" : "2"} 
            strokeLinecap="round"
            className="animate-float-3"
            opacity={steamLevel > 1 ? "0.9" : "0.7"}
          />
        </g>
        
        {/* Animated binary data elements */}
        {isAnimating && (
          <>
            <text x="40" y="65" fill="white" fontSize="10" fontFamily="monospace" opacity="0.8" className="animate-fade-in">01</text>
            <text x="50" y="55" fill="white" fontSize="10" fontFamily="monospace" opacity="0.8" className="animate-fade-in">10</text>
          </>
        )}
        
        {/* Animated particle effects on click */}
        {isAnimating && (
          <>
            {[...Array(8)].map((_, i) => (
              <circle
                key={`particle-${i}`}
                cx="50"
                cy="50"
                r="1"
                fill="white"
                opacity="0.7"
                style={{
                  animation: `particle-fly-${i % 4 + 1} 2s ease-out forwards`,
                  transformOrigin: 'center',
                  transform: `rotate(${i * 45}deg)`,
                }}
              />
            ))}
          </>
        )}
                
        {/* Definitions */}
        <defs>
          <radialGradient id="interactive-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#8B5A40" />
            <stop offset="100%" stopColor="#f3e8d9" stopOpacity="0" />
          </radialGradient>
          
          {/* Animation keyframes in style block */}
          <style>
            {`
              @keyframes particle-fly-1 {
                0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
                100% { transform: translate(25px, -25px) scale(0); opacity: 0; }
              }
              @keyframes particle-fly-2 {
                0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
                100% { transform: translate(-25px, -25px) scale(0); opacity: 0; }
              }
              @keyframes particle-fly-3 {
                0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
                100% { transform: translate(25px, 25px) scale(0); opacity: 0; }
              }
              @keyframes particle-fly-4 {
                0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
                100% { transform: translate(-25px, 25px) scale(0); opacity: 0; }
              }
              @keyframes expand {
                0% { transform: scaleX(1); }
                50% { transform: scaleX(1.1); }
                100% { transform: scaleX(1); }
              }
              @keyframes wobble {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(-5deg); }
                75% { transform: rotate(5deg); }
                100% { transform: rotate(0deg); }
              }
              @keyframes rotate-subtle {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(10deg); }
              }
              @keyframes bar-grow {
                0% { transform: scaleY(0.8); }
                50% { transform: scaleY(1.2); }
                100% { transform: scaleY(1); }
              }
            `}
          </style>
        </defs>
      </svg>
      
      {/* No text needed */}
    </div>
  );
}