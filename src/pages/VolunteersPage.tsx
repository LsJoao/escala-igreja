/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  MessageCircle,
  Share2,
  X,
  Send,
  Wrench,
  Grid3X3,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { Avatar } from '../components/ui/Avatar';
import { RoleBadge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Member, SkillLevel, UserRole } from '../types';
import { formatWhatsAppDigits, getLocalTodayStr, openSafeExternalUrl } from '../utils/security';

export const VolunteersPage: React.FC = () => {
  const {
    church,
    currentMember,
    members,
    pendingMembers,
    isLeader,
    isSuperAdmin,
    isMinistryAdmin,
    addMember,
    updateMember,
    deleteMember,
    approveMember,
    rejectMember,
    skills,
    setSkillLevel,
    getSkillLevel,
    equipments,
    events,
  } = useChurch();

  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'pending' | 'inactive'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Confirmação e feedback de ações (exclusão / aprovação / recusa)
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal de Disparo WhatsApp com Texto Pré-definido
  const [whatsAppModalMember, setWhatsAppModalMember] = useState<Member | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [customText, setCustomText] = useState('');

  // Modal rápido de Habilitações ("Apto a Operar") por voluntário
  const [skillsModalMember, setSkillsModalMember] = useState<Member | null>(null);
  const [savingSkillEqId, setSavingSkillEqId] = useState<string | null>(null);
  const [skillsModalError, setSkillsModalError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('volunteer');
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [draftSkills, setDraftSkills] = useState<Record<string, SkillLevel | null>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('volunteer');
    setActive(true);
    setNotes('');
    setDraftSkills({});
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (m: Member) => {
    setEditingMember(m);
    setName(m.name);
    setEmail(m.email || '');
    setPhone(m.phone || '');
    setRole(m.role);
    setActive(m.active);
    setNotes(m.notes || '');
    const initialDraft: Record<string, SkillLevel | null> = {};
    equipments.forEach((eq) => {
      initialDraft[eq.id] = getSkillLevel(m.id, eq.id);
    });
    setDraftSkills(initialDraft);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      let targetMemberId = editingMember?.id;
      if (editingMember) {
        await updateMember(editingMember.id, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          active,
          notes: notes.trim(),
        });
      } else {
        targetMemberId = await addMember({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          active,
          notes: notes.trim(),
        });
      }

      if (targetMemberId && equipments.length > 0) {
        for (const eq of equipments) {
          const desired = draftSkills[eq.id] ?? null;
          const previous = editingMember ? getSkillLevel(editingMember.id, eq.id) : null;
          if (desired !== previous) {
            await setSkillLevel(targetMemberId, eq.id, desired);
          }
        }
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError((err as Error)?.message || 'Não foi possível salvar os dados do voluntário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSkillChange = async (
    memberId: string,
    equipmentId: string,
    level: SkillLevel | null
  ) => {
    setSkillsModalError('');
    setSavingSkillEqId(equipmentId);
    try {
      await setSkillLevel(memberId, equipmentId, level);
    } catch (err: unknown) {
      setSkillsModalError((err as Error)?.message || 'Não foi possível atualizar a habilitação.');
    } finally {
      setSavingSkillEqId(null);
    }
  };

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const handleRequestDelete = (id: string, memberName: string) => {
    setDeleteError('');
    setMemberToDelete({ id, name: memberName });
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteMember(memberToDelete.id);
      const removedName = memberToDelete.name;
      setMemberToDelete(null);
      showFeedback(`"${removedName}" foi removido(a) da equipe com sucesso.`, 'success');
    } catch (err: unknown) {
      setDeleteError((err as Error)?.message || 'Não foi possível excluir este usuário.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async (id: string, memberName: string) => {
    try {
      await approveMember(id);
      showFeedback(`${memberName} aprovado(a) com sucesso!`, 'success');
    } catch (err: unknown) {
      showFeedback((err as Error)?.message || 'Não foi possível aprovar este usuário.', 'error');
    }
  };

  const handleReject = async (id: string, memberName: string) => {
    try {
      await rejectMember(id);
      showFeedback(`Solicitação de ${memberName} negada.`, 'success');
    } catch (err: unknown) {
      showFeedback((err as Error)?.message || 'Não foi possível negar este usuário.', 'error');
    }
  };

  const handleShareInvite = () => {
    if (!church) return;
    const text = encodeURIComponent(
      `Olá! Venha fazer parte do Ministério de Mídia da ${church.name}.\n` +
      `Código de convite: *${church.inviteCode}*\n` +
      `Cadastre-se no app: ${window.location.origin}`
    );
    openSafeExternalUrl(`https://wa.me/?text=${text}`);
  };

  // Abrir Modal de WhatsApp com mensagens pré-formatadas
  const openWhatsAppModal = (m: Member) => {
    setWhatsAppModalMember(m);
    setSelectedTemplate(0);

    const todayStr = getLocalTodayStr();
    const nextEvent = events.find((e) => e.date >= todayStr);
    const eventDateFormatted = nextEvent
      ? new Date(`${nextEvent.date}T12:00:00`).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      : 'próximo culto';

    const defaultMsg = `Olá, ${m.name}! Tudo bem?\nPassando para pedir que você confirme sua presença na escala de mídia do culto (${eventDateFormatted}) através do app MídiaEscala.\n\nAcesse: ${window.location.origin}`;
    setCustomText(defaultMsg);
  };

  const getTemplates = (m: Member) => {
    const todayStr = getLocalTodayStr();
    const nextEvent = events.find((e) => e.date >= todayStr);
    const eventDateFormatted = nextEvent
      ? new Date(`${nextEvent.date}T12:00:00`).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      : 'próximo culto';

    return [
      {
        title: 'Lembrete de Confirmação de Escala',
        desc: 'Para membros com presença pendente na escala',
        text: `Olá, ${m.name}! Tudo bem?\nPassando para pedir que você confirme sua presença na escala de mídia do culto (${eventDateFormatted}) através do app MídiaEscala.\n\nAcesse: ${window.location.origin}`,
      },
      {
        title: 'Convite para Servir no Próximo Culto',
        desc: 'Consultar disponibilidade do voluntário',
        text: `Paz do Senhor, ${m.name}!\nEstamos montando a escala da equipe de mídia da ${church?.name || 'igreja'} para o culto de ${eventDateFormatted} e gostaríamos de contar com você! Você teria disponibilidade para servir nesse dia? Um abraço!`,
      },
      {
        title: 'Alinhamento & Ensaio Técnico',
        desc: 'Chamada para teste de áudio, câmeras e projeção',
        text: `Olá, ${m.name}!\nLembrando que teremos alinhamento técnico da equipe de mídia 45 minutos antes do culto para passagem de som e teste das câmeras. Contamos com a sua pontualidade!`,
      },
      {
        title: 'Treinamento de Novos Equipamentos',
        desc: 'Aviso sobre capacitação e matriz de habilitação',
        text: `Olá, ${m.name}!\nTeremos uma oficina prática para capacitação em novos postos de mídia (câmeras, mesa de som, iluminação e transmissão). Queremos habilitar você para novos equipamentos!`,
      },
    ];
  };

  const handleSendWhatsApp = () => {
    if (!whatsAppModalMember?.phone) return;
    const cleanPhone = formatWhatsAppDigits(whatsAppModalMember.phone);
    if (cleanPhone.length < 10) return;
    const encoded = encodeURIComponent(customText);
    openSafeExternalUrl(`https://wa.me/${cleanPhone}?text=${encoded}`);
    setWhatsAppModalMember(null);
  };

  // Filtros
  const filteredMembers = members.filter((m) => {
    const matchQuery =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(search.toLowerCase())) ||
      (m.phone && m.phone.includes(search));

    const matchActive =
      filterActive === 'all'
        ? true
        : filterActive === 'pending'
        ? m.approvalStatus === 'pending'
        : filterActive === 'active'
        ? m.active && m.approvalStatus !== 'pending'
        : !m.active || m.approvalStatus === 'rejected';

    return matchQuery && matchActive;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Voluntários de Mídia
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie operadores de câmera, áudio, iluminação, projeção e transmissão.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareInvite}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Convidar via WhatsApp</span>
          </button>

          {isLeader && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Novo Voluntário</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback de Ações (Exclusão / Aprovação / Erros) */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="p-1 rounded-full hover:bg-black/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner de Solicitações Pendentes para o Líder / Adm */}
      {isLeader && pendingMembers.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>
                {pendingMembers.length} {pendingMembers.length === 1 ? 'novo voluntário aguarda' : 'novos voluntários aguardam'} aprovação para ingressar
              </span>
            </div>
            <button
              onClick={() => setFilterActive('pending')}
              className="text-xs font-semibold text-amber-900 hover:underline cursor-pointer"
            >
              Ver pendentes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {pendingMembers.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-white border border-amber-500/20 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={p.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1D1D1F] truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{p.email || p.phone || 'Sem contato'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleApprove(p.id, p.name)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => handleReject(p.id, p.name)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Negar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-white border border-black/[0.04] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-black/[0.03] border-none text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setFilterActive('active')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              filterActive === 'active'
                ? 'bg-[#0071E3] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Ativos ({members.filter((m) => m.active && m.approvalStatus !== 'pending').length})
          </button>
          <button
            onClick={() => setFilterActive('pending')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              filterActive === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 hover:text-amber-900 bg-amber-500/10'
            }`}
          >
            <span>Pendentes</span>
            {pendingMembers.length > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                filterActive === 'pending' ? 'bg-white text-amber-600' : 'bg-amber-600 text-white'
              }`}>
                {pendingMembers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              filterActive === 'all'
                ? 'bg-[#0071E3] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Todos ({members.length})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              filterActive === 'inactive'
                ? 'bg-[#0071E3] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Inativos / Negados ({members.filter((m) => !m.active || m.approvalStatus === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Lista de Voluntários */}
      {filteredMembers.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-black/[0.04]">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#1D1D1F]">
            Nenhum voluntário encontrado
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {search ? 'Tente ajustar sua busca.' : 'Cadastre voluntários ou compartilhe o código de convite da igreja.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const memberSkills = skills.filter(
              (s) => s.memberId === member.id && (s.level === 'qualified' || s.level === 'instructor')
            );

            return (
              <div
                key={member.id}
                className="p-5 rounded-3xl bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} size="lg" />
                      <div>
                        <h3 className="text-sm font-bold text-[#1D1D1F]">
                          {member.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <RoleBadge role={member.role} />
                          {member.approvalStatus === 'pending' ? (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Pendente</span>
                            </span>
                          ) : member.approvalStatus === 'rejected' ? (
                            <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 font-semibold">
                              <XCircle className="w-3 h-3" />
                              <span>Negado</span>
                            </span>
                          ) : member.active ? (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                              <CheckCircle className="w-3 h-3" />
                              <span>Ativo</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5 font-medium">
                              <XCircle className="w-3 h-3" />
                              <span>Inativo</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isLeader && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-black/5 cursor-pointer"
                          title="Editar voluntário"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {member.id !== currentMember?.id && (member.role !== 'superadmin' || isSuperAdmin) && (
                          <button
                            onClick={() => handleRequestDelete(member.id, member.name)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Remover voluntário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contatos com WhatsApp Pré-Definido */}
                  <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                    {member.phone && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{member.phone}</span>
                        </span>
                        <button
                          onClick={() => openWhatsAppModal(member)}
                          className="text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                          title="Abrir WhatsApp com texto pré-definido"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    )}

                    {member.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}

                    {member.notes && (
                      <p className="text-[11px] text-gray-400 italic pt-1 line-clamp-2">
                        "{member.notes}"
                      </p>
                    )}
                  </div>

                  {/* Habilitações Aptas */}
                  <div className="mt-4 pt-3 border-t border-black/[0.04]">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Apto a Operar ({memberSkills.length}):
                      </span>
                      {isLeader && (
                        <button
                          type="button"
                          onClick={() => {
                            setSkillsModalError('');
                            setSkillsModalMember(member);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0071E3]/10 text-[#0071E3] hover:bg-[#0071E3]/20 transition-colors cursor-pointer"
                          title="Definir equipamentos que este voluntário está apto a operar"
                        >
                          <Wrench className="w-2.5 h-2.5" />
                          <span>{memberSkills.length === 0 ? 'Apontar' : 'Editar'}</span>
                        </button>
                      )}
                    </div>
                    {memberSkills.length === 0 ? (
                      <span className="text-[11px] text-gray-400">
                        Nenhuma habilitação vinculada.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {memberSkills.slice(0, 3).map((sk) => {
                          const eq = equipments.find((e) => e.id === sk.equipmentId);
                          return (
                            <span
                              key={sk.id}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold truncate max-w-[140px] ${
                                sk.level === 'instructor'
                                  ? 'bg-purple-500/10 text-purple-700'
                                  : 'bg-[#0071E3]/10 text-[#0071E3]'
                              }`}
                              title={eq?.name}
                            >
                              {sk.level === 'instructor' ? '★ ' : '✓ '}
                              {eq?.name || 'Equipamento'}
                            </span>
                          );
                        })}
                        {memberSkills.length > 3 && (
                          <span className="text-[10px] font-semibold text-gray-400 px-1 py-0.5">
                            +{memberSkills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ações de Aprovação quando pendente */}
                  {isLeader && member.approvalStatus === 'pending' && (
                    <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-amber-800">
                        Ingresso pendente:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleApprove(member.id, member.name)}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => handleReject(member.id, member.name)}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          Negar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Botão de reativação se estiver negado */}
                  {isLeader && member.approvalStatus === 'rejected' && (
                    <div className="mt-4 pt-3 border-t border-rose-500/20 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-rose-700">
                        Acesso negado anteriormente:
                      </span>
                      <button
                        onClick={() => handleApprove(member.id, member.name)}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Reconsiderar e Aceitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Disparo WhatsApp com Texto Pré-Definido */}
      {whatsAppModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-black/5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">
                    Mensagem WhatsApp
                  </h3>
                  <p className="text-xs text-gray-500">
                    Para: <strong>{whatsAppModalMember.name}</strong> ({whatsAppModalMember.phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalMember(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Escolha um Modelo Pré-Definido:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getTemplates(whatsAppModalMember).map((tmpl, idx) => (
                    <button
                      key={tmpl.title}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(idx);
                        setCustomText(tmpl.text);
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        selectedTemplate === idx
                          ? 'border-emerald-600 bg-emerald-500/5 ring-1 ring-emerald-600'
                          : 'border-black/5 hover:bg-black/[0.02]'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#1D1D1F] block">
                        {tmpl.title}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-0.5 block">
                        {tmpl.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Mensagem que será enviada:
                  </label>
                  <span className="text-[10px] text-gray-400">
                    Você pode editar livremente abaixo
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setWhatsAppModalMember(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Abrir no WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Apontar Equipamentos Aptos do Voluntário */}
      {skillsModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-black/5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-black/5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={skillsModalMember.name} size="md" />
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#1D1D1F] truncate">
                    Apto a Operar — {skillsModalMember.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Toque no nível para cada equipamento do ministério
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSkillsModalMember(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {skillsModalError && (
              <div className="mt-3 p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 shrink-0">
                {skillsModalError}
              </div>
            )}

            <div className="mt-4 overflow-y-auto space-y-2.5 pr-1 flex-1">
              {equipments.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#F5F5F7] text-center space-y-2">
                  <p className="text-xs font-semibold text-[#1D1D1F]">
                    Nenhum equipamento cadastrado ainda.
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Cadastre câmeras, mesas de som, projeção ou transmissão na aba Equipamentos para vincular ao voluntário.
                  </p>
                  <Link
                    to="/equipments"
                    onClick={() => setSkillsModalMember(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] mt-1"
                  >
                    Ir para Equipamentos
                  </Link>
                </div>
              ) : (
                equipments.map((eq) => {
                  const currentLevel = getSkillLevel(skillsModalMember.id, eq.id);
                  const isSavingThis = savingSkillEqId === eq.id;

                  return (
                    <div
                      key={eq.id}
                      className="p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#1D1D1F] block truncate">
                          {eq.name}
                        </span>
                        <span className="text-[10px] text-gray-500 capitalize">
                          {eq.category === 'video'
                            ? 'Vídeo'
                            : eq.category === 'audio'
                            ? 'Áudio'
                            : eq.category === 'lighting'
                            ? 'Iluminação'
                            : eq.category === 'projection'
                            ? 'Projeção'
                            : 'Transmissão'}
                          {isSavingThis ? ' • Salvando...' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap shrink-0">
                        {(
                          [
                            { val: null, label: '— Não', activeCls: 'bg-gray-700 text-white' },
                            { val: 'training', label: '⏳ Treino', activeCls: 'bg-amber-600 text-white' },
                            { val: 'qualified', label: '✓ Apto', activeCls: 'bg-emerald-600 text-white' },
                            { val: 'instructor', label: '★ Instrutor', activeCls: 'bg-purple-600 text-white' },
                          ] as const
                        ).map((opt) => {
                          const isSelected = currentLevel === opt.val;
                          return (
                            <button
                              key={String(opt.val)}
                              type="button"
                              disabled={isSavingThis}
                              onClick={() => handleQuickSkillChange(skillsModalMember.id, eq.id, opt.val)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                                isSelected
                                  ? `${opt.activeCls} shadow-xs`
                                  : 'bg-white text-gray-600 hover:bg-black/5 border border-black/5'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between gap-2 shrink-0">
              <Link
                to="/skills"
                onClick={() => setSkillsModalMember(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:underline"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Abrir Matriz Completa</span>
              </Link>
              <button
                type="button"
                onClick={() => setSkillsModalMember(null)}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de Voluntário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <h3 className="text-base font-bold text-[#1D1D1F]">
                {editingMember ? 'Editar Voluntário' : 'Novo Voluntário'}
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
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matheus Lima"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 98888-7777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Papel no Ministério
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    <option value="volunteer">Voluntário</option>
                    <option value="leader">Líder de Equipe</option>
                    {isMinistryAdmin && <option value="ministry_admin">Adm do Ministério</option>}
                    {isSuperAdmin && <option value="superadmin">Super Admin (Site)</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="matheus@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Observações / Disponibilidade
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Não pode servir domingo de manhã, apenas noite."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0071E3] focus:ring-[#0071E3]"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-[#1D1D1F]">
                  Voluntário Ativo para Escalas
                </label>
              </div>

              {/* Seção Apto a Operar dentro do formulário do voluntário */}
              <div className="pt-3 border-t border-black/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Apto a Operar (Equipamentos)
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {Object.values(draftSkills).filter((v) => v === 'qualified' || v === 'instructor').length} aptos
                  </span>
                </div>

                {equipments.length === 0 ? (
                  <p className="text-[11px] text-gray-400 p-2.5 rounded-2xl bg-black/[0.02]">
                    Nenhum equipamento cadastrado ainda. Cadastre em <strong>Equipamentos</strong> para selecionar aqui.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {equipments.map((eq) => {
                      const val = draftSkills[eq.id] ?? null;
                      return (
                        <div
                          key={eq.id}
                          className="p-2 rounded-2xl bg-black/[0.02] border border-black/[0.04] flex items-center justify-between gap-2"
                        >
                          <span className="text-[11px] font-semibold text-[#1D1D1F] truncate">
                            {eq.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {(
                              [
                                { lvl: null, txt: '—', activeCls: 'bg-gray-600 text-white' },
                                { lvl: 'training', txt: 'Treino', activeCls: 'bg-amber-600 text-white' },
                                { lvl: 'qualified', txt: 'Apto', activeCls: 'bg-emerald-600 text-white' },
                                { lvl: 'instructor', txt: 'Instr.', activeCls: 'bg-purple-600 text-white' },
                              ] as const
                            ).map((o) => (
                              <button
                                key={String(o.lvl)}
                                type="button"
                                onClick={() =>
                                  setDraftSkills((prev) => ({
                                    ...prev,
                                    [eq.id]: o.lvl,
                                  }))
                                }
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                                  val === o.lvl
                                    ? o.activeCls
                                    : 'bg-white text-gray-500 hover:bg-black/5 border border-black/5'
                                }`}
                              >
                                {o.txt}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-black/5">
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
                  {isSubmitting ? 'Salvando...' : 'Salvar Voluntário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(memberToDelete)}
        title={`Remover ${memberToDelete?.name || 'usuário'}?`}
        description="Esta ação removerá o usuário da equipe de mídia desta igreja, desvinculará suas escalas pendentes e limpará suas habilitações."
        confirmLabel="Sim, Excluir Usuário"
        isLoading={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setMemberToDelete(null);
            setDeleteError('');
          }
        }}
      />
    </div>
  );
};
