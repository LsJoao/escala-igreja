/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Share2,
  Video,
  Printer,
  Users,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { Avatar } from '../components/ui/Avatar';
import { SlotStatusBadge } from '../components/ui/Badge';
import { BrandLogo } from '../components/ui/BrandLogo';
import { EventSchedule } from '../types';
import { openSafeExternalUrl, getLocalTodayStr, safeFormatDateBR } from '../utils/security';

export const CalendarPage: React.FC = () => {
  const { church, events, slots, members, equipments } = useChurch();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(getLocalTodayStr());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Criação dos dias do mês
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Dias vazios antes do dia 1
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Dias do mês
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNumber: d, dateStr: dStr });
  }

  // Eventos do dia selecionado
  const selectedDayEvents = events.filter((e) => e.date === selectedDayStr);

  const handleShareWhatsApp = (ev: EventSchedule) => {
    const evSlots = slots.filter((s) => s.eventId === ev.id);
    const dateFormatted = new Date(`${ev.date}T12:00:00`).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    let msg = `🎥 *ESCALA DE MÍDIA - ${church?.name || 'Igreja'}*\n`;
    msg += `📅 *${ev.title}*\n`;
    msg += `🗓 ${dateFormatted} às ${ev.startTime}h\n\n`;
    msg += `*EQUIPE ESCALADA:*\n`;

    evSlots.forEach((slot) => {
      const mem = members.find((m) => m.id === slot.memberId);
      const eq = equipments.find((e) => e.id === slot.equipmentId);
      const icon =
        slot.status === 'confirmed' ? '✅' : slot.status === 'declined' ? '❌' : '⏳';
      const name = mem ? mem.name : '*(VAGA ABERTA)*';
      msg += `• *${slot.roleName}* (${eq?.name || 'Equipamento'}): ${name} ${icon}\n`;
    });

    msg += `\n_Acesse o app para confirmar sua presença:_\n${window.location.origin}`;

    openSafeExternalUrl(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300 print:pb-0">
      {/* Cabeçalho Exclusivo para Impressão PDF com Logo Centralizada */}
      <div className="hidden print:flex items-center justify-between gap-4 border-b border-black/[0.08] pb-3 mb-4">
        <BrandLogo
          size="md"
          showText={true}
          subtitle={`${church?.name || 'Ministério de Mídia'} • ${monthNames[month]} ${year}`}
        />
        <span className="text-[11px] font-semibold text-gray-500">
          Calendário Mensal Oficial
        </span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Calendário Mensal de Escalas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualização completa de cultos, ensaios e confirmações por data.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] transition-all cursor-pointer w-fit"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir Calendário</span>
        </button>
      </div>

      {/* Grade do Calendário */}
      <div className="rounded-3xl bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-4 sm:p-6">
        {/* Navegação de Mês */}
        <div className="flex items-center justify-between pb-6 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#0071E3]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#1D1D1F] capitalize">
              {monthNames[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-black/5 text-gray-600 cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-black/5 text-gray-600 cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 gap-1 mt-4 text-center">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dw, idx) => (
            <div
              key={dw}
              className={`py-2 text-[11px] font-bold uppercase tracking-wider ${
                idx === 0 ? 'text-[#0071E3]' : 'text-gray-400'
              }`}
            >
              {dw}
            </div>
          ))}
        </div>

        {/* Grade de Dias */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2">
          {calendarDays.map((item, index) => {
            if (!item) {
              return (
                <div
                  key={`empty_${index}`}
                  className="min-h-[72px] sm:min-h-[96px] rounded-2xl bg-black/[0.01]"
                />
              );
            }

            const dayEvents = events.filter((e) => e.date === item.dateStr);
            const isSelected = selectedDayStr === item.dateStr;
            const isToday = getLocalTodayStr() === item.dateStr;

            return (
              <div
                key={item.dateStr}
                onClick={() => setSelectedDayStr(item.dateStr)}
                className={`min-h-[72px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0071E3] bg-[#0071E3]/5 ring-2 ring-[#0071E3]/30'
                    : 'border-black/[0.04] hover:border-black/15 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-[#0071E3] text-white'
                        : 'text-[#1D1D1F]'
                    }`}
                  >
                    {item.dayNumber}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
                  )}
                </div>

                {/* Badges de Eventos no Dia */}
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const evSlots = slots.filter((s) => s.eventId === ev.id);
                    const allConfirmed =
                      evSlots.length > 0 &&
                      evSlots.every((s) => s.status === 'confirmed');

                    return (
                      <div
                        key={ev.id}
                        className={`px-1.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-medium truncate ${
                          allConfirmed
                            ? 'bg-emerald-500/15 text-emerald-700'
                            : 'bg-[#0071E3]/15 text-[#0071E3]'
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-gray-400 block text-right font-bold">
                      +{dayEvents.length - 2}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalhamento do Dia Selecionado */}
      <div className="rounded-3xl bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
        <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
          <span>Cultos no dia</span>
          <span className="text-[#0071E3]">
            {safeFormatDateBR(selectedDayStr, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </h3>

        {selectedDayEvents.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            Nenhum culto ou evento agendado para esta data.
          </p>
        ) : (
          <div className="space-y-6 mt-4">
            {selectedDayEvents.map((ev) => {
              const evSlots = slots.filter((s) => s.eventId === ev.id);

              return (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.04]">
                    <div>
                      <h4 className="text-sm font-bold text-[#1D1D1F]">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {ev.startTime}h {ev.endTime && `às ${ev.endTime}h`}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleShareWhatsApp(ev)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer w-fit"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Compartilhar Escala no WhatsApp</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
                    {evSlots.map((slot) => {
                      const member = members.find((m) => m.id === slot.memberId);
                      const equip = equipments.find((e) => e.id === slot.equipmentId);

                      return (
                        <div
                          key={slot.id}
                          className="p-2.5 rounded-xl bg-white border border-black/[0.05] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Avatar name={member?.name || 'Vaga'} size="sm" />
                            <div className="truncate">
                              <span className="text-xs font-bold text-[#1D1D1F] block truncate">
                                {member ? member.name : '(Vaga Aberta)'}
                              </span>
                              <span className="text-[10px] text-gray-400 block truncate">
                                {slot.roleName} ({equip?.name})
                              </span>
                            </div>
                          </div>
                          <SlotStatusBadge status={slot.status} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
