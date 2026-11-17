/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logoImg from './Logo.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

const IMAGE_SIZES = {
  sm: 'h-8 w-auto rounded-lg',
  md: 'h-9 w-auto rounded-xl',
  lg: 'h-12 w-auto rounded-xl',
  xl: 'h-24 w-auto rounded-2xl',
};

const TEXT_SIZES = {
  sm: 'text-sm',
  md: 'text-base sm:text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={logoImg}
        alt="Connect Minist"
        className={`${IMAGE_SIZES[size]} object-cover shrink-0 shadow-sm border border-black/10`}
      />

      {showText && (
        <div className="leading-tight min-w-0">
          <span
            className={`${TEXT_SIZES[size]} font-bold tracking-tight text-[#1D1D1F] block whitespace-nowrap`}
          >
            Mídia<span className="text-[#0071E3]">Escala</span>
          </span>
          {subtitle && (
            <span className="text-[11px] font-medium text-gray-500 block leading-none truncate max-w-[160px] sm:max-w-[200px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
