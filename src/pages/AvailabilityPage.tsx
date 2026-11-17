/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarOff,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  X,
  Info,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { Avatar } from '../components/ui/Avatar';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { getLocalTodayStr, safeFormatDateBR } from '../utils/security';

export const AvailabilityPage: React.FC = () => {
  const {
    currentMember,
    isLeader,
    members,
    unavailabilities,
    addUnavailability,
    deleteUnavailability,
  } = useChurch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmação de exclusão
  const [unavailToDelete, setUnavailToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const todayStr = getLocalTodayStr();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!startDate || !endDate) return;
    if (endDate < startDate) {
      setFormError('A data de término não pode ser anterior à data de início.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addUnavailability(startDate, endDate, reason.trim());
      setIsModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err: unknown) {
      setFormError((err as Error)?.message || 'Não foi possível registrar a indisponibilidade.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteError('');
    setUnavailToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!unavailToDelete) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteUnavailability(unavailToDelete);
      setUnavailToDelete(null);
    } catch (err: unknown) {
      setDeleteError((err as Error)?.message || 'Não foi possível remover este registro.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Se for líder, exibe as indisponibilidades de toda a equipe para planejamento.
  // Se for voluntário, exibe suas próprias indisponibilidades.
  const displayedUnavailabilities = unavailabilities.filter((u) =>
    isLeader ? true : u.memberId === currentMember?.id
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Indisponibilidade de Datas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Informe períodos em que você estará viajando ou impossibilitado de servir.
          </p>
        </div>

        <button
          onClick={() => {
            const today = getLocalTodayStr();
            setStartDate(today);
            setEndDate(today);
            setReason('');
            setFormError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Informar Data</span>
        </button>
      </div>

      {/* Informativo */}
      <div className="flex items-start gap-3 p-4 rounded-3xl bg-[#0071E3]/5 border border-[#0071E3]/15 text-xs text-[#0071E3]">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Ao cadastrar uma indisponibilidade, o sistema bloqueará ou emitirá um aviso vermelho para o líder caso ele tente escalar você em um culto dentro desse intervalo.
        </p>
      </div>

      {/* Lista de Indisponibilidades */}
      {displayedUnavailabilities.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-black/[0.04]">
          <CalendarOff className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#1D1D1F]">
            Nenhuma indisponibilidade registrada
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {isLeader
              ? 'Nenhum membro da equipe informou bloqueio de datas no momento.'
              : 'Você está 100% disponível para as próximas escalas de mídia!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedUnavailabilities.map((u) => {
            const member = members.find((m) => m.id === u.memberId);
            const isMine = u.memberId === currentMember?.id;
            const isPast = u.endDate < todayStr;

            return (
              <div
                key={u.id}
                className={`p-5 rounded-3xl bg-white border shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between ${
                  isPast
                    ? 'opacity-60 border-black/[0.04]'
                    : 'border-amber-500/25'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={member?.name || 'Membro'} size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-[#1D1D1F]">
                          {member?.name || 'Voluntário'}
                        </h4>
                        <span className="text-[10px] text-gray-400">
                          {isMine ? 'Minha Indisponibilidade' : 'Membro da Equipe'}
                        </span>
                      </div>
                    </div>

                    {(isMine || isLeader) && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-black/5 cursor-pointer"
                        title="Remover indisponibilidade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 p-3 rounded-2xl bg-black/[0.02] space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-[#1D1D1F]">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {safeFormatDateBR(u.startDate)} até {safeFormatDateBR(u.endDate)}
                      </span>
                    </div>
                    {u.reason && (
                      <p className="text-[11px] text-gray-500 italic pt-1">
                        "{u.reason}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400">
                  <span>
                    {isPast ? 'Período encerrado' : 'Bloqueio ativo na escala'}
                  </span>
                  <span>
                    Registrado em {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Cadastrar Indisponibilidade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-base font-bold text-[#1D1D1F]">
                Informar Indisponibilidade
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Data de Início *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Data de Término *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Motivo (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Viagem de férias, plantão médico, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Bloqueio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(unavailToDelete)}
        title="Remover indisponibilidade?"
        description="Após remover, você voltará a aparecer normalmente disponível para escalas nesse período."
        confirmLabel="Sim, Remover"
        isLoading={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setUnavailToDelete(null);
            setDeleteError('');
          }
        }}
      />
    </div>
  );
};
