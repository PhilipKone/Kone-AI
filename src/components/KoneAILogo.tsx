import React from 'react';

interface KoneAILogoProps {
  className?: string;
  size?: number;
  variant?: 'glass' | 'gradient' | 'cyan' | 'white';
}

export const KoneAILogo: React.FC<KoneAILogoProps> = ({ 
  className = '', 
  size = 24,
  variant = 'glass' 
}) => {
  const getSrc = () => {
    switch (variant) {
      case 'gradient':
        return '/AI-Gradient.svg';
      case 'cyan':
        return '/AI-Cyan.svg';
      case 'white':
        return '/AI-White.svg';
      case 'glass':
      default:
        return '/AI-Glass.svg';
    }
  };

  return (
    <img 
      src={getSrc()} 
      alt="Kone AI" 
      width={size} 
      height={size} 
      className={`inline-block select-none object-contain ${className}`}
      loading="eager"
    />
  );
};

export default KoneAILogo;
