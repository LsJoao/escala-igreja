/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  errorMessage?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Sim, Excluir',
  cancelLabel = 'Cancelar',
  isLoading = false,
  errorMessage = '',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-black/5 text-center relative">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-40"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
            variant === 'danger'
              ? 'bg-rose-50 text-rose-600'
              : 'bg-[#0071E3]/10 text-[#0071E3]'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-[#1D1D1F]">{title}</h3>
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{description}</p>

        {errorMessage && (
          <div className="mt-3 p-2.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 text-left">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-full text-xs font-semibold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#0071E3] hover:bg-[#0077ED]'
            }`}
          >
            {isLoading ? 'Processando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
