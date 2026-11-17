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
  Grid3X3,
} from 'lucide-react';
import { useChurch } from '../../contexts/ChurchContext';

export const BottomNav: React.FC = () => {
  const { slots, currentMember } = useChurch();

  const myPendingCount = slots.filter(
    (s) => s.memberId === currentMember?.id && s.status === 'pending'
  ).length;

  const tabs = [
    { to: '/', label: 'Início', icon: LayoutDashboard },
    { to: '/events', label: 'Escalas', icon: CalendarCheck },
    {
      to: '/my-schedule',
      label: 'Minhas',
      icon: UserCheck2,
      badge: myPendingCount > 0 ? myPendingCount : undefined,
    },
    { to: '/skills', label: 'Matriz', icon: Grid3X3 },
    { to: '/volunteers', label: 'Equipe', icon: Users },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/85 border-t border-black/[0.08] px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all ${
                  isActive
                    ? 'text-[#0071E3]'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
