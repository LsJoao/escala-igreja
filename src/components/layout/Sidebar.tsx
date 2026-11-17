/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  UserCheck2,
  Users,
  Video,
  Grid3X3,
  CalendarDays,
  CalendarOff,
  FileText,
  ShieldCheck,
  Building2,
  BookOpen,
} from 'lucide-react';
import { useChurch } from '../../contexts/ChurchContext';

export const Sidebar: React.FC = () => {
  const { isLeader, isSuperAdmin, isMinistryAdmin, slots, currentMember } = useChurch();

  const myPendingCount = slots.filter(
    (s) => s.memberId === currentMember?.id && s.status === 'pending'
  ).length;

  const navItems = [
    {
      to: '/',
      label: 'Painel Geral',
      icon: LayoutDashboard,
    },
    {
      to: '/events',
      label: 'Cultos & Escalas',
      icon: CalendarCheck,
    },
    {
      to: '/my-schedule',
      label: 'Minhas Escalas',
      icon: UserCheck2,
      badge: myPendingCount > 0 ? myPendingCount : undefined,
    },
    {
      to: '/volunteers',
      label: 'Voluntários',
      icon: Users,
    },
    {
      to: '/equipments',
      label: 'Equipamentos',
      icon: Video,
    },
    {
      to: '/skills',
      label: 'Matriz de Habilitação',
      icon: Grid3X3,
    },
    {
      to: '/calendar',
      label: 'Calendário Mensal',
      icon: CalendarDays,
    },
    {
      to: '/availability',
      label: 'Indisponibilidade',
      icon: CalendarOff,
    },
    {
      to: '/how-to-use',
      label: 'Como Usar (PDF)',
      icon: BookOpen,
    },
    ...(isLeader
      ? [
          {
            to: '/executive-presentation',
            label: 'Apresentação (PDF)',
            icon: FileText,
          },
        ]
      : []),
    ...(isSuperAdmin
      ? [
          {
            to: '/churches',
            label: 'Gerenciar Igrejas',
            icon: Building2,
          },
        ]
      : []),
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 py-6 px-3 border-r border-black/[0.06] bg-[#F5F5F7] min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          Navegação
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0071E3] text-white shadow-sm shadow-[#0071E3]/25'
                    : 'text-[#1D1D1F]/80 hover:bg-black/[0.04]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Card Minimalista de Dica */}
      <div className="mt-auto p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>
            {isSuperAdmin
              ? 'Super Admin (Site)'
              : isMinistryAdmin
              ? 'Adm do Ministério'
              : isLeader
              ? 'Líder de Equipe'
              : 'Voluntário Conectado'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          {isSuperAdmin
            ? 'Acesso irrestrito a todas as congregações e criação de novas igrejas.'
            : isMinistryAdmin
            ? 'Gestão total do ministério de mídia local e inventário.'
            : isLeader
            ? 'Montagem e homologação de escalas.'
            : 'Confirme suas presenças na aba Minhas Escalas.'}
        </p>
      </div>
    </aside>
  );
};
