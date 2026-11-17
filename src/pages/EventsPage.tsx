/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock3,
  UserPlus,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { Avatar } from '../components/ui/Avatar';
import { SlotStatusBadge, CategoryBadge } from '../components/ui/Badge';
import { BrandLogo } from '../components/ui/BrandLogo';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EventSchedule, Slot, EventType, SlotStatus } from '../types';
import { getLocalDateStr, getLocalTodayStr, isValidDateStr, openSafeExternalUrl } from '../utils/security';

export const EventsPage: React.FC = () => {
  const {
    church,
    events,
    slots,
    members,
    equipments,
    skills,
    unavailabilities,
    isLeader,
    addEvent,
    updateEvent,
    deleteEvent,
    addSlot,
    updateSlot,
    deleteSlot,
  } = useChurch();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Modal Novo / Editar Evento
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventSchedule | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('20:30');
  const [type, setType] = useState<EventType>('sunday_service');
  const [notes, setNotes] = useState('');
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [eventError, setEventError] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Modal Atribuir / Adicionar Posição (Slot)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [targetEvent, setTargetEvent] = useState<EventSchedule | null>(null);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [slotRoleName, setSlotRoleName] = useState('');
  const [slotEquipId, setSlotEquipId] = useState('');
  const [slotMemberId, setSlotMemberId] = useState('');
  const [slotError, setSlotError] = useState('');
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);

  // Confirmação de Exclusão (Culto ou Posição)
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: 'event'; id: string; title: string }
    | { kind: 'slot'; eventId: string; slotId: string; roleName: string }
    | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const todayStr = getLocalTodayStr();

  const upcomingEvents = events.filter((e) => e.date >= todayStr);
  const pastEvents = events.filter((e) => e.date < todayStr);

  const currentList = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  // Abre modal de novo evento
  const openAddEventModal = () => {
    setEditingEvent(null);
    setTitle('Culto de Celebração');
    // Próximo domingo
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    setDate(getLocalDateStr(d));
    setStartTime('18:30');
    setEndTime('20:30');
    setType('sunday_service');
    setNotes('');
    setRepeatWeeks(1);
    setEventError('');
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (ev: EventSchedule) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setDate(ev.date);
    setStartTime(ev.startTime);
    setEndTime(ev.endTime || '');
    setType(ev.type);
    setNotes(ev.notes || '');
    setRepeatWeeks(1);
    setEventError('');
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventError('');
    if (!title.trim() || !isValidDateStr(date)) {
      setEventError('Informe um título e uma data válida.');
      return;
    }

    setIsSubmittingEvent(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, {
          title: title.trim(),
          date,
          startTime,
          endTime,
          type,
          notes: notes.trim(),
        });
      } else {
        for (let w = 0; w < repeatWeeks; w++) {
          const evDate = new Date(`${date}T12:00:00`);
          evDate.setDate(evDate.getDate() + w * 7);
          const dateStr = getLocalDateStr(evDate);

          const newEvId = await addEvent({
            title: title.trim(),
            date: dateStr,
            startTime,
            endTime,
            type,
            notes: notes.trim(),
          });

          if (w === 0 && equipments.length > 0) {
            for (const eq of equipments.slice(0, 5)) {
              await addSlot(newEvId, {
                roleName: eq.name,
                equipmentId: eq.id,
                memberId: '',
                status: 'pending',
              });
            }
          }
        }
      }
      setIsEventModalOpen(false);
    } catch (err: unknown) {
      setEventError((err as Error)?.message || 'Erro ao salvar evento.');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = (id: string, evTitle: string) => {
    setDeleteError('');
    setDeleteTarget({ kind: 'event', id, title: evTitle });
  };

  // Posições / Slots
  const openAddSlotModal = (ev: EventSchedule) => {
    setTargetEvent(ev);
    setEditingSlot(null);
    setSlotRoleName('');
    setSlotEquipId(equipments[0]?.id || '');
    setSlotMemberId('');
    setSlotError('');
    setIsSlotModalOpen(true);
  };

  const openEditSlotModal = (ev: EventSchedule, s: Slot) => {
    setTargetEvent(ev);
    setEditingSlot(s);
    setSlotRoleName(s.roleName);
    setSlotEquipId(s.equipmentId);
    setSlotMemberId(s.memberId || '');
    setSlotError('');
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError('');
    if (!targetEvent || !slotRoleName.trim() || !slotEquipId) {
      setSlotError('Preencha o nome da função e selecione o equipamento.');
      return;
    }

    setIsSubmittingSlot(true);
    try {
      if (editingSlot) {
        await updateSlot(targetEvent.id, editingSlot.id, {
          roleName: slotRoleName.trim(),
          equipmentId: slotEquipId,
          memberId: slotMemberId || '',
          status: (editingSlot.memberId || '') !== slotMemberId ? 'pending' : editingSlot.status,
        });
      } else {
        await addSlot(targetEvent.id, {
          roleName: slotRoleName.trim(),
          equipmentId: slotEquipId,
          memberId: slotMemberId || '',
          status: 'pending',
        });
      }
      setIsSlotModalOpen(false);
    } catch (err: unknown) {
      setSlotError((err as Error)?.message || 'Erro ao salvar posição na escala.');
    } finally {
      setIsSubmittingSlot(false);
    }
  };

  const handleDeleteSlot = (eventId: string, slotId: string, roleName: string) => {
    setDeleteError('');
    setDeleteTarget({ kind: 'slot', eventId, slotId, roleName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === 'event') {
        await deleteEvent(deleteTarget.id);
      } else {
        await deleteSlot(deleteTarget.eventId, deleteTarget.slotId);
      }
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteError((err as Error)?.message || 'Não foi possível concluir a exclusão.');
    } finally {
      setIsDeleting(false);
    }
  };

  // WhatsApp Share
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

  // Impressão da Escala
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300 print:pb-0">
      {/* Cabeçalho Exclusivo para Impressão PDF com Logo Centralizada */}
      <div className="hidden print:flex items-center justify-between gap-4 border-b border-black/[0.08] pb-3 mb-4">
        <BrandLogo
          size="md"
          showText={true}
          subtitle={church?.name ? `${church.name} • Escala de Mídia` : 'Escala de Mídia'}
        />
        <span className="text-[11px] font-semibold text-gray-500">
          Mural Oficial da Cabine de Mídia
        </span>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Cultos & Escalas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Planeje escalas com validação inteligente de habilitações e conflitos de horário.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] transition-all cursor-pointer"
            title="Imprimir escalas para mural da cabine de mídia"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          {isLeader && (
            <button
              onClick={openAddEventModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Culto / Evento</span>
            </button>
          )}
        </div>
      </div>

      {/* Abas Próximos / Passados */}
      <div className="flex items-center gap-2 border-b border-black/[0.06] pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-[#0071E3] text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Próximos Cultos ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'past'
              ? 'bg-[#0071E3] text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Anteriores ({pastEvents.length})
        </button>
      </div>

      {/* Lista de Cultos */}
      {currentList.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-black/[0.04]">
          <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#1D1D1F]">
            Nenhum evento nesta aba
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Clique em "Novo Culto / Evento" para agendar uma escala.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((ev) => {
            const evSlots = slots.filter((s) => s.eventId === ev.id);
            const confirmedCount = evSlots.filter((s) => s.status === 'confirmed').length;
            const isExpanded = expandedEventId === ev.id;

            const dateObj = new Date(`${ev.date}T12:00:00`);
            const dateDay = dateObj.toLocaleDateString('pt-BR', { day: '2-digit' });
            const dateMonth = dateObj.toLocaleDateString('pt-BR', { month: 'short' });
            const dateWeekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });

            return (
              <div
                key={ev.id}
                className="rounded-3xl bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-all"
              >
                {/* Cabeçalho do Card */}
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Bloco de Data Apple */}
                    <div className="w-14 h-14 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex flex-col items-center justify-center shrink-0 border border-[#0071E3]/20">
                      <span className="text-lg font-black leading-none">{dateDay}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                        {dateMonth}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 capitalize">
                          {dateWeekday}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {ev.startTime}h {ev.endTime && `às ${ev.endTime}h`}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F] mt-0.5">
                        {ev.title}
                      </h3>
                      {ev.notes && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                          "{ev.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações e Progresso */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-black/[0.04]">
                    {/* Status de Confirmação */}
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#1D1D1F]">
                        {confirmedCount} / {evSlots.length}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">confirmados</div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleShareWhatsApp(ev)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                        title="Compartilhar no WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {isLeader && (
                        <>
                          <button
                            onClick={() => openEditEventModal(ev)}
                            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-black/5 cursor-pointer"
                            title="Editar culto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.id, ev.title)}
                            className="p-2 text-rose-400 hover:text-rose-600 rounded-full hover:bg-rose-50 cursor-pointer"
                            title="Excluir culto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                        className="p-2 rounded-full hover:bg-black/5 text-gray-500 cursor-pointer ml-1"
                        title={isExpanded ? 'Recolher escala' : 'Ver escala'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seção Expandida: Posições da Escala */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-black/[0.04] bg-black/[0.01]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Posições Escaladas ({evSlots.length})
                      </span>
                      {isLeader && (
                        <button
                          onClick={() => openAddSlotModal(ev)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:underline cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Posição</span>
                        </button>
                      )}
                    </div>

                    {evSlots.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">
                        Nenhuma posição escalada ainda neste culto.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {evSlots.map((slot) => {
                          const member = members.find((m) => m.id === slot.memberId);
                          const equip = equipments.find((e) => e.id === slot.equipmentId);

                          return (
                            <div
                              key={slot.id}
                              className="p-3.5 rounded-2xl bg-white border border-black/[0.05] shadow-xs flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-[#1D1D1F] truncate">
                                      {slot.roleName}
                                    </h4>
                                    <p className="text-[11px] text-gray-400 truncate">
                                      {equip?.name || 'Equipamento'}
                                    </p>
                                  </div>
                                  <SlotStatusBadge status={slot.status} />
                                </div>

                                {/* Membro Atribuído */}
                                <div className="mt-3 flex items-center gap-2.5">
                                  <Avatar name={member?.name || 'Vaga'} size="sm" />
                                  <div className="min-w-0">
                                    <span className="text-xs font-semibold text-[#1D1D1F] block truncate">
                                      {member ? member.name : '(Vaga Aberta)'}
                                    </span>
                                    {member?.phone && (
                                      <span className="text-[10px] text-gray-400 block truncate">
                                        {member.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {slot.status === 'declined' && slot.declineReason && (
                                  <div className="mt-2 p-2 rounded-xl bg-rose-500/10 text-rose-600 text-[10px]">
                                    <strong>Recusado:</strong> {slot.declineReason}
                                  </div>
                                )}
                              </div>

                              {isLeader && (
                                <div className="mt-3 pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs">
                                  <button
                                    onClick={() => openEditSlotModal(ev, slot)}
                                    className="text-[11px] font-semibold text-[#0071E3] hover:underline cursor-pointer"
                                  >
                                    Trocar / Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSlot(ev.id, slot.id, slot.roleName)}
                                    className="text-[11px] text-rose-500 hover:text-rose-700 cursor-pointer"
                                  >
                                    Remover
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar / Editar Culto */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <h3 className="text-base font-bold text-[#1D1D1F]">
                {editingEvent ? 'Editar Culto' : 'Novo Culto / Evento'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="mt-4 space-y-3.5">
              {eventError && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                  {eventError}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Culto de Celebração (Domingo Noite)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full px-3 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    <option value="sunday_service">Culto de Domingo</option>
                    <option value="midweek_service">Culto de Quarta / Meio de Semana</option>
                    <option value="rehearsal">Ensaio de Mídia / Louvor</option>
                    <option value="special_event">Evento Especial / Conferência</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Horário de Término
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>

              {!editingEvent && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Recorrência Semanal
                  </label>
                  <select
                    value={repeatWeeks}
                    onChange={(e) => setRepeatWeeks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    <option value={1}>Apenas nesta data (1 evento)</option>
                    <option value={2}>Repetir por 2 semanas consecutivas</option>
                    <option value={4}>Repetir por 4 semanas (mês inteiro)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Observações / Pauta
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Santa ceia, transmissão ao vivo, gravação especial."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEvent ? 'Salvando...' : 'Salvar Culto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Inteligente de Atribuição de Posição / Slot na Escala */}
      {isSlotModalOpen && targetEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-black/5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  {editingSlot ? 'Editar Posição na Escala' : 'Nova Posição na Escala'}
                </h3>
                <p className="text-xs text-gray-400">
                  {targetEvent.title} • {targetEvent.date}
                </p>
              </div>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="mt-4 space-y-4">
              {slotError && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                  {slotError}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Nome da Função / Posição *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Câmera 1 (Palco), Mesa de Som PA, Projeção"
                  value={slotRoleName}
                  onChange={(e) => setSlotRoleName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Equipamento Vinculado *
                </label>
                <select
                  required
                  value={slotEquipId}
                  onChange={(e) => setSlotEquipId(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                >
                  <option value="">Selecione o Equipamento...</option>
                  {equipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* SELEÇÃO INTELIGENTE DE VOLUNTÁRIO COM VALIDAÇÃO DE APTIDÃO E CONFLITO */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Operador / Voluntário
                  </label>
                  <span className="text-[10px] font-bold text-[#0071E3]">
                    Validação Automática
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 border border-black/5 rounded-2xl p-2 bg-black/[0.015]">
                  {/* Opção Vaga Aberta */}
                  <label
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      slotMemberId === ''
                        ? 'bg-[#0071E3] text-white font-semibold'
                        : 'hover:bg-black/5 text-[#1D1D1F]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="volunteerChoice"
                        checked={slotMemberId === ''}
                        onChange={() => setSlotMemberId('')}
                        className="hidden"
                      />
                      <span>(Deixar vaga em aberto)</span>
                    </div>
                  </label>

                  {/* Voluntários avaliados */}
                  {members
                    .filter((m) => m.active)
                    .map((m) => {
                      // 1. Nível de habilidade para o equipamento selecionado
                      const sk = skills.find(
                        (s) => s.memberId === m.id && s.equipmentId === slotEquipId
                      );
                      const isApt = sk?.level === 'qualified' || sk?.level === 'instructor';
                      const isTraining = sk?.level === 'training';

                      // 2. Indisponibilidade na data
                      const hasUnavailability = unavailabilities.some(
                        (u) =>
                          u.memberId === m.id &&
                          targetEvent.date >= u.startDate &&
                          targetEvent.date <= u.endDate
                      );

                      // 3. Já escalado em outra posição no mesmo evento?
                      const alreadyScheduled = slots.some(
                        (s) =>
                          s.eventId === targetEvent.id &&
                          s.memberId === m.id &&
                          s.id !== editingSlot?.id
                      );

                      const isSelected = slotMemberId === m.id;

                      return (
                        <label
                          key={m.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#0071E3] text-white font-semibold'
                              : 'hover:bg-black/5 text-[#1D1D1F]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <input
                              type="radio"
                              name="volunteerChoice"
                              checked={isSelected}
                              onChange={() => setSlotMemberId(m.id)}
                              className="hidden"
                            />
                            <Avatar name={m.name} size="sm" />
                            <span className="truncate">{m.name}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Badges de Conflito ou Aptidão */}
                            {hasUnavailability ? (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                  isSelected
                                    ? 'bg-rose-900 text-white'
                                    : 'bg-rose-500/10 text-rose-600'
                                }`}
                              >
                                ⚠ Indisponível
                              </span>
                            ) : alreadyScheduled ? (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                  isSelected
                                    ? 'bg-rose-900 text-white'
                                    : 'bg-rose-500/10 text-rose-600'
                                }`}
                              >
                                ⚠ Já Escalado
                              </span>
                            ) : isApt ? (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-emerald-500/15 text-emerald-700'
                                }`}
                              >
                                {sk?.level === 'instructor' ? '★ Instrutor' : '✓ Apto'}
                              </span>
                            ) : isTraining ? (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                  isSelected
                                    ? 'bg-amber-900 text-white'
                                    : 'bg-amber-500/15 text-amber-700'
                                }`}
                              >
                                ⏳ Em Treino
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  isSelected
                                    ? 'text-white/60'
                                    : 'text-gray-400'
                                }`}
                              >
                                Sem Habilitação
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSlot}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingSlot ? 'Salvando...' : 'Salvar Posição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={
          deleteTarget?.kind === 'event'
            ? `Excluir culto "${deleteTarget.title}"?`
            : `Remover posição "${deleteTarget?.roleName || ''}"?`
        }
        description={
          deleteTarget?.kind === 'event'
            ? 'Esta ação removerá o culto e suas posições da escala. Não é possível desfazer.'
            : 'Esta vaga será removida permanentemente da escala deste culto.'
        }
        confirmLabel="Sim, Excluir"
        isLoading={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError('');
          }
        }}
      />
    </div>
  );
};
