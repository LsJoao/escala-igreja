/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Se já estiver instalado em modo standalone, oculta
  if (isInstalled) {
    return null;
  }

  // Fluxo Desktop / Android / Chrome
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] transition-all shadow-sm active:scale-95 cursor-pointer"
        title="Instalar aplicativo MídiaEscala no seu dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // Fluxo iOS Safari
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#1D1D1F] bg-black/5 hover:bg-black/10 transition-all active:scale-95 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#0071E3]" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0071E3] flex items-center justify-center text-white font-bold text-sm">
                    M
                  </div>
                  <h3 className="text-base font-semibold text-[#1D1D1F]">
                    Instalar no iPhone / iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[#1D1D1F]/80">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    1
                  </div>
                  <p>
                    No Safari, toque no botão <strong>Compartilhar</strong>{' '}
                    <Share2 className="w-4 h-4 inline text-[#0071E3] mx-1" /> na barra inferior.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p>
                    Role a lista para baixo e toque em{' '}
                    <strong>Adicionar à Tela de Início</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p>Toque em <strong>Adicionar</strong> no canto superior direito.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-full bg-[#0071E3] py-2.5 text-sm font-semibold text-white hover:bg-[#0077ED] transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
