import { useState, useEffect } from "react";

const Logo = ({ size = "medium" }) => {
  const sizes = {
    small: "h-10 w-10",
    medium: "h-14 w-14",
    large: "h-24 w-24",
  };
  
  const [morphProgress, setMorphProgress] = useState(0);
  const [particleCount, setParticleCount] = useState(0);
  const [animationDirection, setAnimationDirection] = useState(1);
  
  // Continuous morphing animation
  useEffect(() => {
    const animate = () => {
      setMorphProgress(prev => {
        let newProgress = prev + (0.015 * animationDirection);
        
        if (newProgress >= 1) {
          newProgress = 1;
          setAnimationDirection(-1);
        } else if (newProgress <= 0) {
          newProgress = 0;
          setAnimationDirection(1);
        }
        
        return newProgress;
      });
    };
    
    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [animationDirection]);
  
  // Continuous particle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setParticleCount(prev => (prev + 1) % 8);
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  const handleMouseEnter = () => {};
  const handleMouseLeave = () => {};

  return (
    <div 
      className={`${sizes[size]} relative cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform: `scale(${1 + morphProgress * 0.1})`,
        filter: morphProgress > 0.3 ? 'drop-shadow(0 0 15px rgba(33, 150, 243, 0.4))' : 'none',
        transition: 'filter 0.3s ease'
      }}
    >
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2196F3"/>
            <stop offset={`${morphProgress * 100}%`} stopColor="#00BCD4"/>
            <stop offset="100%" stopColor="#2196F3"/>
          </linearGradient>
          
          <radialGradient id="particleGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00BCD4" stopOpacity="1"/>
            <stop offset="100%" stopColor="#2196F3" stopOpacity="0"/>
          </radialGradient>
          
          <filter id="morphGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={2 + morphProgress * 2} result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        
        {/* Floating particles */}
        {morphProgress > 0.2 && [...Array(6)].map((_, i) => {
          const angle = (i * 60) + (particleCount * 45);
          const radius = 80 + Math.sin(particleCount + i) * 10;
          return (
            <circle
              key={i}
              cx={100 + Math.cos(angle * Math.PI / 180) * radius}
              cy={100 + Math.sin(angle * Math.PI / 180) * radius}
              r={2 + Math.sin(particleCount + i) * 1}
              fill="url(#particleGradient)"
              opacity={0.7 + Math.sin(particleCount + i) * 0.3}
            />
          );
        })}

        {/* Medical cross with morphing effect */}
        <g filter="url(#morphGlow)">
          {/* Horizontal line of plus - morphs width */}
          <rect 
            x={30 - morphProgress * 10} 
            y={90 - morphProgress * 2} 
            width={140 + morphProgress * 20} 
            height={20 + morphProgress * 4} 
            fill="url(#morphGradient)"
            rx={10 + morphProgress * 5}
            style={{ transition: 'all 0.1s ease' }}
          />
          
          {/* Vertical line of plus - morphs height */}
          <rect 
            x={90 - morphProgress * 2} 
            y={30 - morphProgress * 10} 
            width={20 + morphProgress * 4} 
            height={140 + morphProgress * 20} 
            fill="url(#morphGradient)"
            rx={10 + morphProgress * 5}
            style={{ transition: 'all 0.1s ease' }}
          />
          
          {/* Diagonal accent lines - morph thickness and position */}
          <path 
            d={`M ${50 - morphProgress * 5},${50 - morphProgress * 5} L ${150 + morphProgress * 5},${150 + morphProgress * 5}`}
            stroke="url(#morphGradient)"
            strokeWidth={20 + morphProgress * 10}
            strokeLinecap="round"
            opacity={0.6 + morphProgress * 0.3}
            style={{ transition: 'all 0.1s ease' }}
          />
          
          <path 
            d={`M ${50 - morphProgress * 5},${150 + morphProgress * 5} L ${90 + morphProgress * 5},${110 - morphProgress * 5}`}
            stroke="url(#morphGradient)"
            strokeWidth={20 + morphProgress * 10}
            strokeLinecap="round"
            opacity={0.6 + morphProgress * 0.3}
            style={{ transition: 'all 0.1s ease' }}
          />
        </g>
        
        {/* Coffee cup with morphing interaction */}
        <g 
          transform={`scale(${1 + morphProgress * 0.15}) translate(${-morphProgress * 10}, ${-morphProgress * 8})`} 
          style={{ transformOrigin: '145px 62px', transition: 'transform 0.1s ease' }}
        >
          {/* Coffee cup body - morphs shape */}
          <path
            d={`M 130,${50 - morphProgress * 3} L 130,${70 + morphProgress * 2} Q 130,${75 + morphProgress * 2} ${135 - morphProgress},${75 + morphProgress * 2} L ${155 + morphProgress},${75 + morphProgress * 2} Q ${160 + morphProgress},${75 + morphProgress * 2} ${160 + morphProgress},${70 + morphProgress * 2} L ${160 + morphProgress},${50 - morphProgress * 3} Z`}
            fill={morphProgress > 0.5 ? "#D4A574" : "#8B4513"}
            stroke="#6B3410"
            strokeWidth={1 + morphProgress}
            style={{ transition: 'fill 0.3s ease' }}
          />
          
          {/* Coffee cup handle - expands */}
          <path
            d={`M ${160 + morphProgress},${55 - morphProgress} Q ${167 + morphProgress * 3},${55 - morphProgress} ${167 + morphProgress * 3},${60} Q ${167 + morphProgress * 3},${65 + morphProgress} ${160 + morphProgress},${65 + morphProgress}`}
            fill="none"
            stroke={morphProgress > 0.5 ? "#D4A574" : "#8B4513"}
            strokeWidth={2 + morphProgress}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.3s ease' }}
          />
          
          {/* Liquid inside cup - animated with morphing */}
          <ellipse
            cx={145 + morphProgress * 2}
            cy={52 + morphProgress}
            rx={12 + morphProgress * 3}
            ry={2 + morphProgress}
            fill={morphProgress > 0.4 ? "#3F51B5" : "#2196F3"}
            opacity={0.7 + morphProgress * 0.2}
            style={{ transition: 'fill 0.3s ease' }}
          />
          
          {/* Chart bars inside cup - grow and change */}
          <rect 
            x={138 + morphProgress} 
            y={60 - morphProgress * 3} 
            width={3 + morphProgress} 
            height={10 + morphProgress * 4} 
            fill="#E3F2FD" 
            rx="1"
            style={{ transition: 'all 0.1s ease' }}
          />
          <rect 
            x={143 + morphProgress} 
            y={57 - morphProgress * 4} 
            width={3 + morphProgress} 
            height={13 + morphProgress * 5} 
            fill="#BBDEFB" 
            rx="1"
            style={{ transition: 'all 0.1s ease' }}
          />
          <rect 
            x={148 + morphProgress} 
            y={54 - morphProgress * 5} 
            width={3 + morphProgress} 
            height={16 + morphProgress * 6} 
            fill="#90CAF9" 
            rx="1"
            style={{ transition: 'all 0.1s ease' }}
          />
          
          {/* Morphing steam with wave effect */}
          <g opacity={0.7 + morphProgress * 0.3} style={{ transition: 'opacity 0.1s ease' }}>
            <path
              d={`M ${138 + morphProgress},${48 - morphProgress * 2} Q ${138 + morphProgress},${43 - morphProgress * 3} ${140 + morphProgress * 2},${45 - morphProgress * 2} Q ${140 + morphProgress * 2},${38 - morphProgress * 4} ${142 + morphProgress * 3},${40 - morphProgress * 3}`}
              fill="none"
              stroke={morphProgress > 0.6 ? "#E3F2FD" : "white"}
              strokeWidth={2 + morphProgress}
              strokeLinecap="round"
              style={{ transition: 'stroke 0.3s ease' }}
            />
            <path
              d={`M ${145 + morphProgress},${48 - morphProgress * 2} Q ${145 + morphProgress},${43 - morphProgress * 3} ${147 + morphProgress * 2},${45 - morphProgress * 2} Q ${147 + morphProgress * 2},${38 - morphProgress * 4} ${149 + morphProgress * 3},${40 - morphProgress * 3}`}
              fill="none"
              stroke={morphProgress > 0.5 ? "#BBDEFB" : "white"}
              strokeWidth={2 + morphProgress}
              strokeLinecap="round"
              style={{ transition: 'stroke 0.3s ease' }}
            />
            <path
              d={`M ${152 + morphProgress},${48 - morphProgress * 2} Q ${152 + morphProgress},${43 - morphProgress * 3} ${154 + morphProgress * 2},${45 - morphProgress * 2} Q ${154 + morphProgress * 2},${38 - morphProgress * 4} ${156 + morphProgress * 3},${40 - morphProgress * 3}`}
              fill="none"
              stroke={morphProgress > 0.4 ? "#90CAF9" : "white"}
              strokeWidth={2 + morphProgress}
              strokeLinecap="round"
              style={{ transition: 'stroke 0.3s ease' }}
            />
          </g>
        </g>
        

      </svg>
    </div>
  );
};

export default Logo;