/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarCheck2,
  CheckCircle,
  XCircle,
  ArrowLeftRight,
  Clock,
  Video,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { SlotStatusBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Slot, EventSchedule } from '../types';
import { getLocalTodayStr, safeFormatDateBR } from '../utils/security';

export const MySchedulePage: React.FC = () => {
  const {
    currentMember,
    isLeader,
    events,
    slots,
    equipments,
    members,
    swaps,
    confirmSlot,
    declineSlot,
    requestSwap,
    acceptSwap,
    approveSwap,
  } = useChurch();

  const [activeTab, setActiveTab] = useState<'my_slots' | 'swaps'>('my_slots');

  // Modal Recusar
  const [declineModalSlot, setDeclineModalSlot] = useState<{
    eventId: string;
    slotId: string;
  } | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Modal Troca
  const [swapModalSlot, setSwapModalSlot] = useState<{
    eventId: string;
    slotId: string;
    roleName: string;
  } | null>(null);
  const [swapNotes, setSwapNotes] = useState('');
  const [actionError, setActionError] = useState('');

  const todayStr = getLocalTodayStr();

  // Escalas do voluntário logado
  const myUpcomingSlots = slots
    .filter((s) => s.memberId === currentMember?.id)
    .map((s) => {
      const ev = events.find((e) => e.id === s.eventId);
      return { slot: s, event: ev };
    })
    .filter((item) => item.event && item.event.date >= todayStr)
    .sort((a, b) => (a.event?.date || '').localeCompare(b.event?.date || ''));

  const handleConfirm = async (eventId: string, slotId: string) => {
    setActionError('');
    try {
      await confirmSlot(eventId, slotId);
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Erro ao confirmar presença.');
    }
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    if (!declineModalSlot || !declineReason.trim()) return;
    try {
      await declineSlot(declineModalSlot.eventId, declineModalSlot.slotId, declineReason.trim());
      setDeclineModalSlot(null);
      setDeclineReason('');
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Erro ao registrar recusa.');
    }
  };

  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    if (!swapModalSlot) return;
    try {
      await requestSwap(swapModalSlot.eventId, swapModalSlot.slotId, swapNotes.trim());
      setSwapModalSlot(null);
      setSwapNotes('');
      setActiveTab('swaps');
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Erro ao solicitar troca.');
    }
  };

  const handleAcceptSwap = async (swapId: string) => {
    setActionError('');
    try {
      await acceptSwap(swapId);
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Erro ao se candidatar à troca.');
    }
  };

  const handleApproveSwap = async (swapId: string) => {
    setActionError('');
    try {
      await approveSwap(swapId);
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Erro ao aprovar troca.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="p-1 hover:bg-rose-100 rounded-full cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
          Minhas Escalas
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Confirme sua presença nos cultos, informe ausências ou solicite troca de equipe.
        </p>
      </div>

      {/* Abas Alternadoras */}
      <div className="flex items-center gap-2 border-b border-black/[0.06] pb-2">
        <button
          onClick={() => setActiveTab('my_slots')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'my_slots'
              ? 'bg-[#0071E3] text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Minhas Próximas Escalas ({myUpcomingSlots.length})
        </button>
        <button
          onClick={() => setActiveTab('swaps')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'swaps'
              ? 'bg-[#0071E3] text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Mural de Trocas ({swaps.filter((sw) => sw.status !== 'approved').length})
        </button>
      </div>

      {activeTab === 'my_slots' ? (
        myUpcomingSlots.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center border border-black/[0.04]">
            <CalendarCheck2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1D1D1F]">
              Você não possui escalas pendentes
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Quando a liderança escalar você para operar algum equipamento, seus cultos aparecerão aqui para você confirmar presença.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myUpcomingSlots.map(({ slot, event }) => {
              if (!event) return null;
              const equip = equipments.find((e) => e.id === slot.equipmentId);

              const dateFormatted = safeFormatDateBR(event.date, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              });

              return (
                <div
                  key={slot.id}
                  className={`p-6 rounded-3xl bg-white border shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all ${
                    slot.status === 'confirmed'
                      ? 'border-emerald-500/30'
                      : slot.status === 'declined'
                      ? 'border-rose-500/30 opacity-75'
                      : 'border-black/[0.06]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-semibold text-[#0071E3] capitalize">
                        {dateFormatted}
                      </span>
                      <SlotStatusBadge status={slot.status} />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F]">
                      {event.title}
                    </h3>

                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {event.startTime}h {event.endTime && `às ${event.endTime}h`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-[#0071E3]" />
                        <span className="font-semibold text-[#1D1D1F]">
                          Função: {slot.roleName}
                        </span>
                      </div>
                      {equip && (
                        <p className="text-[11px] text-gray-400 pl-5">
                          Equipamento: {equip.name}
                        </p>
                      )}
                    </div>

                    {slot.status === 'declined' && slot.declineReason && (
                      <div className="mt-3 p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 text-xs">
                        <strong>Motivo informado:</strong> {slot.declineReason}
                      </div>
                    )}
                  </div>

                  {/* Ações do Voluntário */}
                  <div className="mt-6 pt-4 border-t border-black/[0.04] flex flex-wrap items-center justify-between gap-2">
                    {slot.status !== 'confirmed' ? (
                      <button
                        onClick={() => handleConfirm(event.id, slot.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirmar Presença</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Presença Confirmada!</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {slot.status !== 'declined' && (
                        <button
                          onClick={() =>
                            setDeclineModalSlot({ eventId: event.id, slotId: slot.id })
                          }
                          className="px-3 py-1.5 rounded-full text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          Recusar
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setSwapModalSlot({
                            eventId: event.id,
                            slotId: slot.id,
                            roleName: slot.roleName,
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] transition-colors cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-[#0071E3]" />
                        <span>Pedir Troca</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Aba do Mural de Trocas */
        <div className="space-y-4">
          {swaps.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-black/[0.04]">
              <ArrowLeftRight className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#1D1D1F]">
                Nenhum pedido de troca em aberto
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Quando alguém precisar de substituição, a solicitação aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {swaps.map((sw) => {
                const requester = members.find((m) => m.id === sw.requesterMemberId);
                const candidate = members.find((m) => m.id === sw.candidateMemberId);
                const ev = events.find((e) => e.id === sw.eventId);
                const slot = slots.find((s) => s.id === sw.slotId);

                return (
                  <div
                    key={sw.id}
                    className="p-5 rounded-3xl bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sw.status === 'open'
                              ? 'bg-amber-500/15 text-amber-700'
                              : sw.status === 'accepted_by_peer'
                              ? 'bg-sky-500/15 text-sky-700'
                              : 'bg-emerald-500/15 text-emerald-700'
                          }`}
                        >
                          {sw.status === 'open'
                            ? 'Aguardando Voluntário'
                            : sw.status === 'accepted_by_peer'
                            ? 'Aguardando Aprovação do Líder'
                            : 'Troca Concluída'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(sw.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#1D1D1F]">
                        {ev?.title || 'Culto'} • {slot?.roleName || 'Posição'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Data: {ev?.date} às {ev?.startTime}h
                      </p>

                      <div className="mt-3 p-2.5 rounded-2xl bg-black/[0.02] text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <Avatar name={requester?.name || 'Membro'} size="sm" />
                          <span className="text-gray-600">
                            <strong>{requester?.name}</strong> solicitou substituição.
                          </span>
                        </div>
                        {sw.notes && (
                          <p className="text-[11px] text-gray-400 italic pl-8">
                            "{sw.notes}"
                          </p>
                        )}
                      </div>

                      {candidate && (
                        <div className="mt-2 p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-800 text-xs flex items-center gap-2">
                          <Avatar name={candidate.name} size="sm" />
                          <span>
                            <strong>{candidate.name}</strong> aceitou cobrir a vaga!
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação na Troca */}
                    <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-end gap-2">
                      {sw.status === 'open' && sw.requesterMemberId !== currentMember?.id && (
                        <button
                          onClick={() => handleAcceptSwap(sw.id)}
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer"
                        >
                          Me voluntariar para cobrir
                        </button>
                      )}

                      {sw.status === 'accepted_by_peer' && isLeader && (
                        <button
                          onClick={() => handleApproveSwap(sw.id)}
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                        >
                          Aprovar Troca (Líder)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Justificar Recusa */}
      {declineModalSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-base font-bold text-[#1D1D1F]">
                Recusar Escala
              </h3>
              <button
                onClick={() => setDeclineModalSlot(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeclineSubmit} className="mt-4 space-y-3.5">
              <p className="text-xs text-gray-500">
                Por favor, informe ao líder o motivo da impossibilidade para que a vaga seja remanejada a tempo.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Motivo *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Estarei em viagem familiar / compromisso profissional inadiável."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeclineModalSlot(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all cursor-pointer"
                >
                  Confirmar Recusa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Solicitar Troca */}
      {swapModalSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-base font-bold text-[#1D1D1F]">
                Solicitar Troca de Escala
              </h3>
              <button
                onClick={() => setSwapModalSlot(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSwapSubmit} className="mt-4 space-y-3.5">
              <p className="text-xs text-gray-500">
                Esta posição será disponibilizada no <strong>Mural de Trocas</strong> para que outro operador habilitado possa cobrir.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Recado / Motivo da Troca
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Preciso de substituição pois tenho prova no dia seguinte."
                  value={swapNotes}
                  onChange={(e) => setSwapNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSwapModalSlot(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer"
                >
                  Publicar Troca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
