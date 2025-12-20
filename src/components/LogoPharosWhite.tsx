import React from 'react';

interface LogoPharosWhiteProps {
  width?: number;
  height?: number;
  className?: string;
}

const LogoPharosWhite: React.FC<LogoPharosWhiteProps> = ({ 
  width = 180, 
  height = 45,
  className = '' 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 180 45" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Logo simples da Pharos em branco */}
      <path 
        d="M0 5H8.14286V21.6667H20.3571V28.3333H0V5Z" 
        fill="white"
      />
      <path 
        d="M28.5 5H36.6429V28.3333H28.5V5Z" 
        fill="white"
      />
      <path 
        d="M44.7857 5H52.9286L62.1429 17.6667V5H70.2857V28.3333H62.1429L52.9286 15.6667V28.3333H44.7857V5Z" 
        fill="white"
      />
      <path 
        d="M77.1429 5H96.7857V11.6667H85.2857V13.3333H95.5714V19.3333H85.2857V21.6667H96.7857V28.3333H77.1429V5Z" 
        fill="white"
      />
      <path 
        d="M123.214 5H131.357V28.3333H123.214V21.6667H113.393V28.3333H105.25V5H113.393V15H123.214V5Z" 
        fill="white"
      />
      <path 
        d="M139.5 5H147.643V13.3333L157.464 5H168.5L156.25 15L168.5 28.3333H156.25L147.643 20V28.3333H139.5V5Z" 
        fill="white"
      />
      <path 
        d="M170.357 5H178.5V28.3333H170.357V5Z" 
        fill="white"
      />
      {/* Texto "Negócios Imobiliários" abaixo do logo */}
      <text 
        x="90" 
        y="40" 
        fontFamily="Arial, sans-serif" 
        fontSize="8" 
        fill="white" 
        textAnchor="middle"
      >
        NEGÓCIOS IMOBILIÁRIOS
      </text>
    </svg>
  );
};

export default LogoPharosWhite; 