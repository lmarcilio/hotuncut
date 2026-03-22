import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: string;
  textSize?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string | null;
}

export default function Logo({ 
  className = "", 
  iconSize, 
  textSize,
  showText = true,
  size = 'md',
  src = null
}: LogoProps) {
  const [customLogo, setCustomLogo] = React.useState<string | null>(src);
  const [customHeight, setCustomHeight] = React.useState<number | null>(null);

  React.useEffect(() => {
    const loadSettings = () => {
      if (!src) {
        const savedLogo = localStorage.getItem('hotuncut_logo_url');
        if (savedLogo) setCustomLogo(savedLogo);
      } else {
        setCustomLogo(src);
      }

      const savedHeight = localStorage.getItem('hotuncut_logo_height');
      if (savedHeight) setCustomHeight(parseInt(savedHeight));
    };

    loadSettings();

    const handleUpdate = () => {
      loadSettings();
    };

    window.addEventListener('logo-updated', handleUpdate);
    return () => window.removeEventListener('logo-updated', handleUpdate);
  }, [src]);

  const sizeMap = {
    sm: { icon: "w-8 h-8", text: "text-lg", img: "h-8" },    // 32px
    md: { icon: "w-10 h-10", text: "text-2xl", img: "h-10" }, // 40px
    lg: { icon: "w-14 h-14", text: "text-3xl", img: "h-14" }, // 56px
    xl: { icon: "w-20 h-20", text: "text-4xl", img: "h-20" }  // 80px
  };

  const finalIconSize = iconSize || sizeMap[size].icon;
  const finalTextSize = textSize || sizeMap[size].text;
  const finalImgHeight = customHeight ? `${customHeight}px` : sizeMap[size].img;

  if (customLogo) {
    return (
      <div className={`flex items-center ${className}`}>
        <img 
          src={customLogo} 
          alt="HOT UNCUT" 
          style={{ height: customHeight ? `${customHeight}px` : undefined }}
          className={!customHeight ? `${finalImgHeight} w-auto object-contain` : "w-auto object-contain"}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Flame Icon */}
      <div className={`${finalIconSize} relative flex-shrink-0`}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(255,77,0,0.4)]"
        >
          <defs>
            <linearGradient id="flame-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B0000" />
              <stop offset="30%" stopColor="#FF4D00" />
              <stop offset="70%" stopColor="#FF8C00" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Main Flame Body */}
          <path 
            d="M50 95C75 95 90 75 90 55C90 40 80 25 65 10C70 20 70 30 65 40C60 30 55 20 40 5C45 20 45 35 35 50C25 35 20 25 20 45C20 70 30 95 50 95Z" 
            fill="url(#flame-grad)" 
          />
          {/* Inner Flame Highlights */}
          <path 
            d="M50 85C65 85 75 70 75 55C75 45 70 35 60 25C63 30 63 35 60 40C55 35 50 30 40 15C42 25 42 35 35 45C30 35 25 30 25 45C25 60 35 85 50 85Z" 
            fill="rgba(255,255,255,0.3)" 
            style={{ mixBlendMode: 'overlay' }}
          />
          {/* Core Flame */}
          <path 
            d="M50 75C60 75 65 65 65 55C65 48 62 40 55 30C57 35 57 40 55 45C50 40 45 35 38 25C40 32 40 40 35 48C32 40 28 35 28 48C28 60 35 75 50 75Z" 
            fill="#FFD700" 
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Text Logo */}
      {showText && (
        <div className={`${finalTextSize} font-display font-black tracking-tight flex items-center italic`}>
          <span className="text-[#FF4D00] drop-shadow-[0_0_10px_rgba(255,77,0,0.3)]">HOT</span>
          <span className="text-white ml-2 relative" style={{ WebkitTextStroke: '1px #FF4D00' }}>
            UNCUT
            <svg 
              className="absolute -bottom-2 left-0 w-full h-3 text-[#FF4D00]" 
              viewBox="0 0 100 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M5 5C25 15 75 15 95 5" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}
