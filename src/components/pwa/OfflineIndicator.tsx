/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[#1D1D1F]/90 backdrop-blur-md px-4 py-2 text-xs font-medium text-white shadow-xl border border-white/10 animate-bounce">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Modo Offline — exibindo dados salvos em cache</span>
    </div>
  );
};
