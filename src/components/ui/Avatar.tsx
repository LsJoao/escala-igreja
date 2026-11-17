/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const COLORS = [
  'bg-blue-500 text-white',
  'bg-indigo-500 text-white',
  'bg-purple-500 text-white',
  'bg-rose-500 text-white',
  'bg-emerald-500 text-white',
  'bg-teal-500 text-white',
  'bg-amber-500 text-white',
  'bg-sky-500 text-white',
];

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  const getInitials = (str: string) => {
    if (!str) return 'M';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Hash simples para selecionar a cor consistentemente pelo nome
  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs font-medium',
    md: 'w-9 h-9 text-xs font-semibold',
    lg: 'w-12 h-12 text-sm font-semibold',
    xl: 'w-16 h-16 text-lg font-bold',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shrink-0 select-none shadow-sm ${sizeClasses} ${getColor(
        name || ''
      )} ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
