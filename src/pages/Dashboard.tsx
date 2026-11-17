/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Users,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  Share2,
  ChevronRight,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { Avatar } from '../components/ui/Avatar';
import { SlotStatusBadge, CategoryBadge } from '../components/ui/Badge';
import { formatWhatsAppDigits, getLocalTodayStr, openSafeExternalUrl, safeFormatDateBR } from '../utils/security';

export const Dashboard: React.FC = () => {
  const {
    church,
    currentMember,
    isLeader,
    members,
    pendingMembers,
    equipments,
    events,
    slots,
    seedSampleData,
  } = useChurch();

  // Próximo evento a partir de hoje
  const todayStr = getLocalTodayStr();
  const upcomingEvents = events
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextEvent = upcomingEvents[0] || events[0];

  const nextEventSlots = nextEvent
    ? slots.filter((s) => s.eventId === nextEvent.id)
    : [];

  const confirmedCount = nextEventSlots.filter((s) => s.status === 'confirmed').length;
  const pendingCount = nextEventSlots.filter((s) => s.status === 'pending').length;
  const openCount = nextEventSlots.filter((s) => !s.memberId).length;

  // Compartilhamento no WhatsApp
  const handleShareWhatsApp = () => {
    if (!nextEvent) return;
    const dateFormatted = new Date(`${nextEvent.date}T12:00:00`).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    let msg = `🎥 *ESCALA DE MÍDIA - ${church?.name || 'Igreja'}*\n`;
    msg += `📅 *${nextEvent.title}*\n`;
    msg += `🗓 ${dateFormatted} às ${nextEvent.startTime}h\n\n`;
    msg += `*EQUIPE ESCALADA:*\n`;

    nextEventSlots.forEach((slot) => {
      const mem = members.find((m) => m.id === slot.memberId);
      const eq = equipments.find((e) => e.id === slot.equipmentId);
      const icon = slot.status === 'confirmed' ? '✅' : '⏳';
      const name = mem ? mem.name : '*(VAGA ABERTA)*';
      msg += `• *${slot.roleName}* (${eq?.name || 'Equipamento'}): ${name} ${icon}\n`;
    });

    msg += `\n_Favor confirmar sua presença no app MídiaEscala:_\n${window.location.origin}`;

    openSafeExternalUrl(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header com Boas-Vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Paz, {currentMember?.name?.split(' ')[0] || 'Líder'}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Aqui está o panorama atual do Ministério de Mídia da{' '}
            <span className="font-semibold text-[#1D1D1F]">
              {church?.name || 'sua Igreja'}
            </span>
            .
          </p>
        </div>

        {events.length === 0 && isLeader && (
          <button
            onClick={() => seedSampleData()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Preencher Dados de Demonstração</span>
          </button>
        )}
      </div>

      {/* Alerta de Novos Voluntários Aguardando Aprovação */}
      {isLeader && pendingMembers.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-950">
                {pendingMembers.length} {pendingMembers.length === 1 ? 'novo voluntário aguarda' : 'novos voluntários aguardam'} sua aprovação
              </p>
              <p className="text-[11px] text-amber-900/80 mt-0.5">
                Aceite ou recuse novos membros para liberar o acesso deles à escala e aos equipamentos.
              </p>
            </div>
          </div>
          <Link
            to="/volunteers"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0"
          >
            <span>Gerenciar na Equipe</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Grid de Estatísticas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Voluntários</span>
            <Users className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#1D1D1F]">
              {members.filter((m) => m.active).length}
            </span>
            <span className="text-xs text-gray-400">ativos</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Equipamentos</span>
            <Video className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#1D1D1F]">
              {equipments.length}
            </span>
            <span className="text-xs text-gray-400">postos</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {confirmedCount}
            </span>
            <span className="text-xs text-gray-400">de {nextEventSlots.length} vagas</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pendentes</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600">
              {pendingCount}
            </span>
            <span className="text-xs text-gray-400">aguardando</span>
          </div>
        </div>
      </div>

      {/* Próximo Culto em Destaque */}
      {nextEvent ? (
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0071E3]/10 text-[#0071E3]">
                  Próxima Escala
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {nextEvent.startTime}h - {nextEvent.endTime || 'término'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] mt-1.5">
                {nextEvent.title}
              </h2>
              <p className="text-xs text-gray-500">
                {safeFormatDateBR(nextEvent.date, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer"
                title="Compartilhar lista da escala pronta no grupo de WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] transition-all"
              >
                <span>Ver Todos</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Lista de Posições do Culto */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              Operadores e Postos Escalados
            </h3>

            {nextEventSlots.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">
                Nenhuma posição adicionada a este culto ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {nextEventSlots.map((slot) => {
                  const member = members.find((m) => m.id === slot.memberId);
                  const equip = equipments.find((e) => e.id === slot.equipmentId);

                  return (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-2xl bg-black/[0.02] border border-black/[0.04] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={member?.name || 'Vago'} size="md" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-[#1D1D1F] truncate">
                            {member ? member.name : '(Vaga Aberta)'}
                          </h4>
                          <p className="text-[11px] text-[#0071E3] font-medium truncate">
                            {slot.roleName}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {equip?.name || 'Equipamento'}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <SlotStatusBadge status={slot.status} />
                        {member?.phone && slot.status === 'pending' && isLeader && (
                          <a
                            href={`https://wa.me/${formatWhatsAppDigits(member.phone)}?text=${encodeURIComponent(
                              `Olá ${member.name}! Por favor, confirme sua presença no culto de ${nextEvent.date} como ${slot.roleName}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Cobrar</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-12 text-center border border-black/[0.04]">
          <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1D1D1F]">
            Nenhum culto agendado
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Cadastre seu próximo culto de domingo ou evento especial para começar a escalar sua equipe de mídia.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED]"
          >
            Cadastrar Novo Culto
          </Link>
        </div>
      )}

      {/* Seção Inferior: Acesso Rápido a Habilitações e Voluntários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card: Matriz de Habilitações */}
        <div className="rounded-3xl bg-white p-6 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Competências
              </span>
              <span className="text-[11px] font-semibold text-[#0071E3]">
                Zero Falhas de Operação
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              Matriz de Habilitação de Mídia
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Visualize em uma tabela rápida quem sabe operar cada equipamento (Câmeras, Mesas de Som, Luz, Projeção, Live).
            </p>
          </div>
          <Link
            to="/skills"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#0071E3] hover:underline"
          >
            <span>Abrir Matriz de Habilidades</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card: Minhas Escalas */}
        <div className="rounded-3xl bg-white p-6 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Seu Serviço
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                Área do Voluntário
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              Minhas Escalas & Confirmações
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Confirme sua presença com 1 toque, justifique ausências ou solicite troca de escala com outro irmão.
            </p>
          </div>
          <Link
            to="/my-schedule"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#0071E3] hover:underline"
          >
            <span>Ver Minhas Escalas</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
