import React, { useState } from 'react';

interface SubdomainLogoProps {
  subdomainId: string;
  size?: number;
  className?: string;
  rounded?: boolean;
}

const LOGO_PATHS: Record<string, string> = {
  all: '/logos/logo-circle.svg',
  kids: '/logos/mascot.svg',
  code: '/logos/app-code.svg',
  consult: '/logos/app-consult.svg',
  digital: '/logos/app-digital.svg',
  lab: '/logos/app-lab.svg',
  shop: '/logos/app-shop.svg',
  farms: '/logos/app-farms.svg',
  warp: '/logos/app-warp.svg'
};

const FALLBACK_EMOJIS: Record<string, string> = {
  all: '🌐',
  kids: '👶',
  code: '💻',
  consult: '💼',
  digital: '🎨',
  lab: '🔬',
  shop: '🛒',
  farms: '🌾',
  warp: '⚡'
};

export const SubdomainLogo: React.FC<SubdomainLogoProps> = ({
  subdomainId,
  size = 20,
  className = '',
  rounded = true
}) => {
  const [loadError, setLoadError] = useState(false);
  const src = LOGO_PATHS[subdomainId] || LOGO_PATHS.all;
  const emoji = FALLBACK_EMOJIS[subdomainId] || '🌐';

  if (loadError) {
    return (
      <span 
        style={{ fontSize: `${size * 0.8}px`, width: `${size}px`, height: `${size}px` }} 
        className={`inline-flex items-center justify-center select-none ${className}`}
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${subdomainId} logo`}
      width={size}
      height={size}
      onError={() => setLoadError(true)}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`inline-block select-none object-contain shrink-0 ${rounded ? 'rounded-full' : ''} ${className}`}
      loading="eager"
    />
  );
};

export default SubdomainLogo;
