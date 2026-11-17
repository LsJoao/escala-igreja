/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SkillLevel, SlotStatus, EquipmentCategory } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-black/5 text-[#1D1D1F]',
    success: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-700 border border-rose-500/20',
    info: 'bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20',
    purple: 'bg-purple-500/10 text-purple-700 border border-purple-500/20',
  }[variant];

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
    md: 'px-2.5 py-1 text-xs font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full whitespace-nowrap transition-colors ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};

export const SkillBadge: React.FC<{ level: SkillLevel | null }> = ({ level }) => {
  if (!level) {
    return <span className="text-gray-400 text-xs">—</span>;
  }
  switch (level) {
    case 'instructor':
      return (
        <Badge variant="purple" size="sm">
          ★ Instrutor
        </Badge>
      );
    case 'qualified':
      return (
        <Badge variant="success" size="sm">
          ✓ Apto
        </Badge>
      );
    case 'training':
      return (
        <Badge variant="warning" size="sm">
          ⏳ Em Treinamento
        </Badge>
      );
  }
};

export const SlotStatusBadge: React.FC<{ status: SlotStatus }> = ({ status }) => {
  switch (status) {
    case 'confirmed':
      return (
        <Badge variant="success" size="sm">
          Confirmado
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="warning" size="sm">
          Pendente
        </Badge>
      );
    case 'declined':
      return (
        <Badge variant="danger" size="sm">
          Recusado
        </Badge>
      );
  }
};

export const CategoryBadge: React.FC<{ category: EquipmentCategory }> = ({ category }) => {
  const map: Record<EquipmentCategory, { label: string; variant: BadgeProps['variant'] }> = {
    video: { label: 'Vídeo', variant: 'info' },
    audio: { label: 'Áudio', variant: 'purple' },
    lighting: { label: 'Iluminação', variant: 'warning' },
    projection: { label: 'Projeção', variant: 'success' },
    broadcast: { label: 'Transmissão', variant: 'info' },
    other: { label: 'Outros', variant: 'default' },
  };
  const c = map[category] || { label: category, variant: 'default' };
  return (
    <Badge variant={c.variant} size="sm">
      {c.label}
    </Badge>
  );
};

export const RoleBadge: React.FC<{ role: import('../../types').UserRole }> = ({ role }) => {
  switch (role) {
    case 'superadmin':
      return (
        <Badge variant="danger" size="sm">
          Super Admin (Site)
        </Badge>
      );
    case 'ministry_admin':
      return (
        <Badge variant="purple" size="sm">
          Adm do Ministério
        </Badge>
      );
    case 'leader':
      return (
        <Badge variant="info" size="sm">
          Líder de Equipe
        </Badge>
      );
    case 'volunteer':
    default:
      return (
        <Badge variant="default" size="sm">
          Voluntário
        </Badge>
      );
  }
};

