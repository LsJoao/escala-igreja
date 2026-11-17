/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
}) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7 rounded-xl',
    md: 'w-9 h-9 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const svgDimensions = {
    sm: 18,
    md: 22,
    lg: 28,
    xl: 36,
  };

  const textClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold',
  };

  const dim = svgDimensions[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Símbolo do Logo: Lente de Câmera Broadcast + Ondas de Mídia + Escala */}
      <div
        className={`${iconSizeClasses[size]} bg-gradient-to-br from-[#0071E3] via-[#0A84FF] to-[#0058C6] flex items-center justify-center text-white shadow-md shadow-[#0071E3]/25 shrink-0 relative overflow-hidden transition-transform duration-200 hover:scale-105`}
      >
        {/* Efeito de Reflexo / Vidro Estilo Apple */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 pointer-events-none" />

        <svg
          width={dim}
          height={dim}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Câmera / Cabine de Mídia com cantos arredondados */}
          <rect
            x="3"
            y="6"
            width="18"
            height="18"
            rx="4.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Lente Central / Foco de Transmissão */}
          <circle
            cx="12"
            cy="15"
            r="4.2"
            stroke="white"
            strokeWidth="2.2"
          />
          <circle
            cx="12"
            cy="15"
            r="1.6"
            fill="white"
          />
          {/* Feixe / Transmissão Live Broadcast */}
          <path
            d="M21 11.5L28 7.5V22.5L21 18.5V11.5Z"
            fill="white"
            stroke="white"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Ondas de Sinal / Conexão Superior */}
          <path
            d="M8 3.5C10.5 2 13.5 2 16 3.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* Tipografia da Marca */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`${textClasses[size]} tracking-tight text-[#1D1D1F] leading-none`}
            >
              Mídia<span className="text-[#0071E3]">Escala</span>
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 leading-tight truncate">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
