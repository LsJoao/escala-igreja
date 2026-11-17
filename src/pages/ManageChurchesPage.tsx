/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  ShieldCheck,
  Users,
  KeyRound,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { openSafeExternalUrl, safeFormatDateBR } from '../utils/security';

export const ManageChurchesPage: React.FC = () => {
  const {
    allChurches,
    church,
    isSuperAdmin,
    createChurch,
    updateChurch,
    deleteChurch,
    switchChurch,
  } = useChurch();

  const [search, setSearch] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Modal de Criação de Igreja
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Modal de Edição de Igreja
  const [editingChurch, setEditingChurch] = useState<{ id: string; name: string; inviteCode: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal de Exclusão
  const [deletingChurchId, setDeletingChurchId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleShareWhatsApp = (churchName: string, inviteCode: string) => {
    const text = encodeURIComponent(
      `Olá! Junte-se à equipe de Mídia da ${churchName} no MídiaEscala!\n` +
      `Código de convite: *${inviteCode}*\n` +
      `Acesse: ${window.location.origin}`
    );
    openSafeExternalUrl(`https://wa.me/?text=${text}`);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await createChurch(newName.trim());
      setShowCreateModal(false);
      setNewName('');
      setFeedbackMsg({ text: 'Nova igreja cadastrada e ativada com sucesso!', type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: unknown) {
      setFeedbackMsg({ text: (err as Error)?.message || 'Erro ao criar igreja', type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChurch || !editingChurch.name.trim()) return;
    setIsUpdating(true);
    try {
      await updateChurch(editingChurch.id, {
        name: editingChurch.name.trim(),
        inviteCode: editingChurch.inviteCode.trim().toUpperCase(),
      });
      setEditingChurch(null);
      setFeedbackMsg({ text: 'Dados da congregação atualizados com sucesso!', type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: unknown) {
      setFeedbackMsg({ text: (err as Error)?.message || 'Erro ao atualizar igreja', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingChurchId) return;
    setIsDeleting(true);
    try {
      await deleteChurch(deletingChurchId);
      setDeletingChurchId(null);
      setFeedbackMsg({ text: 'Igreja removida da plataforma com sucesso.', type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: unknown) {
      setFeedbackMsg({ text: (err as Error)?.message || 'Erro ao remover igreja', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredChurches = allChurches.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.inviteCode.toLowerCase().includes(search.toLowerCase())
  );

  if (!isSuperAdmin) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-[#1D1D1F]">Acesso Restrito ao Super Admin</h2>
        <p className="text-xs text-gray-500">
          Somente o Administrador Geral do site tem permissão para criar e gerenciar múltiplas igrejas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner de Identificação Super Admin */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-black/[0.06] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0071E3] flex items-center justify-center text-white shadow-md shadow-[#0071E3]/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
                Gerenciar Igrejas & Congregações
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                Painel Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Controle centralizado de todas as igrejas atendidas pela plataforma MídiaEscala.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Igreja</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Barra de Filtro e Métricas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar igreja por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white border border-black/10 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="px-3 py-1.5 rounded-full bg-white border border-black/5 shadow-xs">
            Total: <strong className="text-[#1D1D1F]">{allChurches.length}</strong> {allChurches.length === 1 ? 'igreja' : 'igrejas'}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-semibold border border-[#0071E3]/15">
            Igreja ativa: {church?.name || 'Nenhuma'}
          </span>
        </div>
      </div>

      {/* Grid de Igrejas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChurches.map((item) => {
          const isCurrentActive = church?.id === item.id;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-[#0071E3] ring-2 ring-[#0071E3]/20 shadow-md'
                  : 'border-black/[0.06] hover:border-black/15 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        isCurrentActive
                          ? 'bg-[#0071E3] text-white shadow-xs'
                          : 'bg-black/[0.04] text-[#1D1D1F]'
                      }`}
                    >
                      {item.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1D1D1F] leading-tight line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        ID: {item.id}
                      </p>
                    </div>
                  </div>

                  {isCurrentActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Ativa
                    </span>
                  )}
                </div>

                {/* Código de Convite */}
                <div className="p-3 rounded-2xl bg-black/[0.02] border border-black/[0.04] space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">Código de Convite:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#0071E3] tracking-wider text-xs">
                        {item.inviteCode}
                      </span>
                      <button
                        onClick={() => handleCopyCode(item.id, item.inviteCode)}
                        className="p-1 rounded-lg hover:bg-black/5 text-gray-500 hover:text-[#0071E3] transition-colors cursor-pointer"
                        title="Copiar código"
                      >
                        {copiedCodeId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleShareWhatsApp(item.name, item.inviteCode)}
                        className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors cursor-pointer"
                        title="Enviar convite por WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-black/[0.04]">
                    <span>Cadastrada em:</span>
                    <span>{safeFormatDateBR(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between gap-2">
                <button
                  onClick={() => switchChurch(item.id)}
                  disabled={isCurrentActive}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:cursor-default ${
                    isCurrentActive
                      ? 'bg-black/[0.04] text-gray-400'
                      : 'bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-xs'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isCurrentActive ? 'Em Uso' : 'Acessar Igreja'}</span>
                </button>

                <button
                  onClick={() =>
                    setEditingChurch({
                      id: item.id,
                      name: item.name,
                      inviteCode: item.inviteCode,
                    })
                  }
                  className="p-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-[#1D1D1F] transition-colors cursor-pointer"
                  title="Editar dados da congregação"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDeletingChurchId(item.id)}
                  disabled={allChurches.length <= 1}
                  className="p-2 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
                  title={
                    allChurches.length <= 1
                      ? 'Não é permitido excluir a única igreja'
                      : 'Excluir congregação'
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChurches.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white border border-black/5">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#1D1D1F]">Nenhuma igreja encontrada</h3>
          <p className="text-xs text-gray-500 mt-1">
            Não encontramos congregações com os termos pesquisados.
          </p>
        </div>
      )}

      {/* Modal: Cadastrar Nova Igreja */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0071E3]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  Cadastrar Nova Igreja
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Nome da Congregação / Ministério
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Igreja Batista da Aliança - Sede"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0071E3]/5 border border-[#0071E3]/15 text-xs text-[#0071E3] space-y-1">
                <p className="font-semibold">Informação de Governança:</p>
                <p className="text-[11px] text-gray-600">
                  Um código de convite exclusivo será gerado automaticamente. Você será vinculado como Super Admin da nova congregação e poderá alternar entre ela e as demais a qualquer momento.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? 'Cadastrando...' : 'Criar e Conectar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Igreja */}
      {editingChurch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#0071E3]" />
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  Editar Dados da Congregação
                </h3>
              </div>
              <button
                onClick={() => setEditingChurch(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Nome da Igreja
                </label>
                <input
                  type="text"
                  required
                  value={editingChurch.name}
                  onChange={(e) =>
                    setEditingChurch({ ...editingChurch, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Código de Convite
                </label>
                <input
                  type="text"
                  required
                  value={editingChurch.inviteCode}
                  onChange={(e) =>
                    setEditingChurch({ ...editingChurch, inviteCode: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] border border-black/5 text-xs font-mono font-bold tracking-wider uppercase text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingChurch(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão */}
      {deletingChurchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-black/5 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">
              Excluir Congregação?
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Tem certeza que deseja remover esta congregação da plataforma? Esta ação não pode ser desfeita.
            </p>

            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeletingChurchId(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
