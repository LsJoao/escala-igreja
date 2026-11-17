/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Share2,
  Copy,
  Check,
  LogOut,
  Sparkles,
  ChevronDown,
  UserCheck,
  Plus,
  FileText,
  ShieldAlert,
  X,
  Building2,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChurch } from '../../contexts/ChurchContext';
import { Avatar } from '../ui/Avatar';
import { RoleBadge } from '../ui/Badge';
import { BrandLogo as Logo } from '../ui/BrandLogo';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { openSafeExternalUrl } from '../../utils/security';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const {
    church,
    currentMember,
    isSuperAdmin,
    isMinistryAdmin,
    isLeader,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    seedSampleData,
    createChurch,
    switchDemoRole,
    simulatedRole,
  } = useChurch();

  const [copiedCode, setCopiedCode] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modal Criar Igreja (Exclusivo Super Admin)
  const [showNewChurchModal, setShowNewChurchModal] = useState(false);
  const [newChurchName, setNewChurchName] = useState('');
  const [isCreatingChurch, setIsCreatingChurch] = useState(false);
  const [churchModalError, setChurchModalError] = useState('');

  const handleCopyInviteCode = () => {
    if (!church?.inviteCode) return;
    navigator.clipboard.writeText(church.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsAppInvite = () => {
    if (!church) return;
    const text = encodeURIComponent(
      `Olá! Junte-se à equipe de Mídia da ${church.name} no MídiaEscala!\n` +
      `Código de convite: *${church.inviteCode}*\n` +
      `Acesse: ${window.location.origin}`
    );
    openSafeExternalUrl(`https://wa.me/?text=${text}`);
  };

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedSampleData();
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateChurchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChurchName.trim()) return;
    setChurchModalError('');
    setIsCreatingChurch(true);
    try {
      await createChurch(newChurchName.trim());
      setShowNewChurchModal(false);
      setNewChurchName('');
    } catch (err: unknown) {
      setChurchModalError((err as Error)?.message || 'Erro ao criar igreja');
    } finally {
      setIsCreatingChurch(false);
    }
  };

  const renderActionPills = (compact = false) => (
    <>
      {church && (
        <div
          className={`flex items-center gap-1.5 rounded-full bg-black/[0.04] text-xs whitespace-nowrap shrink-0 ${
            compact ? 'px-2.5 py-1' : 'px-3 py-1'
          }`}
        >
          <span className="text-gray-500">Convite:</span>
          <button
            onClick={handleCopyInviteCode}
            className="font-mono font-bold text-[#0071E3] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
            title="Clique para copiar código"
          >
            {church.inviteCode}
            {copiedCode ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
          </button>
          <button
            onClick={handleShareWhatsAppInvite}
            className="ml-0.5 text-emerald-600 hover:text-emerald-700 cursor-pointer shrink-0"
            title="Compartilhar no WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Gestão de Igrejas exclusivo para Super Admin */}
      {isSuperAdmin && (
        <Link
          to="/churches"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          title="Gerenciar todas as igrejas e congregações cadastradas"
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span>Gerenciar Igrejas</span>
        </Link>
      )}

      {/* Manual de Como Usar em PDF (Para todos os usuários) */}
      <Link
        to="/how-to-use"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-gray-600 hover:bg-black/[0.04] transition-colors whitespace-nowrap shrink-0"
        title="Manual ilustrado de como usar o aplicativo em PDF"
      >
        <BookOpen className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
        <span>Como Usar (PDF)</span>
      </Link>

      {/* Link para Apresentação Executiva em PDF (Para Líder do Ministério e ADM) */}
      {isLeader && (
        <Link
          to="/executive-presentation"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-gray-600 hover:bg-black/[0.04] transition-colors whitespace-nowrap shrink-0"
          title="Apresentação executiva do app e lógica de governança em PDF (Líderes e ADM)"
        >
          <FileText className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
          <span>Apresentação (PDF)</span>
        </Link>
      )}

      {isLeader && (
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
          title="Preenche equipamentos, voluntários e culto de exemplo"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{isSeeding ? 'Carregando...' : 'Carregar Exemplo'}</span>
        </button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-black/[0.06] transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo e Nome da Aplicação */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <Logo
            size="md"
            showText={true}
            subtitle={church?.name || 'Mídia de Igreja'}
          />
        </Link>

        {/* Centro / Ações Rápidas de Igreja em Desktop Amplo */}
        <div className="hidden xl:flex items-center gap-1.5 min-w-0">
          {renderActionPills(false)}
        </div>

        {/* Lado Direito: PWA, Notificações e Perfil */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />

          {/* Notificações */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-full text-gray-600 hover:bg-black/5 transition-colors relative cursor-pointer"
              title="Notificações e Avisos"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#0071E3] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-black/5 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Avisos & Notificações
                  </span>
                  <span className="text-[11px] text-[#0071E3]">
                    {unreadNotificationsCount} não lidas
                  </span>
                </div>

                <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-xs text-gray-400">
                      Nenhuma notificação no momento.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                          n.read
                            ? 'bg-black/[0.02] opacity-75'
                            : 'bg-[#0071E3]/5 border-l-4 border-[#0071E3]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-[#1D1D1F]">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-gray-400">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar e Menu do Usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            >
              <Avatar
                name={currentMember?.name || currentUser?.displayName || 'Mídia'}
                size="md"
              />
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
            </button>

            {/* Menu Suspenso */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-black/5 p-3 z-50">
                <div className="pb-3 border-b border-black/5">
                  <p className="text-sm font-semibold text-[#1D1D1F] truncate">
                    {currentMember?.name || currentUser?.displayName || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser?.email}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <RoleBadge
                      role={
                        isSuperAdmin
                          ? 'superadmin'
                          : isMinistryAdmin
                          ? 'ministry_admin'
                          : isLeader
                          ? 'leader'
                          : 'volunteer'
                      }
                    />
                  </div>
                </div>

                {/* Alternar Visão do App para testes */}
                <div className="py-2 border-b border-black/5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Alternar Visão do App:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        switchDemoRole('leader');
                      }}
                      className={`px-2 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isLeader
                          ? 'bg-[#0071E3] text-white shadow-xs'
                          : 'bg-black/[0.04] hover:bg-black/10 text-[#1D1D1F]'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Visão Líder</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        switchDemoRole('volunteer');
                      }}
                      className={`px-2 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        !isLeader
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-black/[0.04] hover:bg-black/10 text-[#1D1D1F]'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Voluntário</span>
                    </button>
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="py-2 border-b border-black/5 text-xs">
                    <Link
                      to="/churches"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#0071E3] hover:bg-[#0071E3]/5 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-[#0071E3]" />
                      <span>Painel de Igrejas (Super Admin)</span>
                    </Link>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Faixa de Ações Rápidas em Telas Médias/Pequenas (sempre visível e sem quebra de linha) */}
      <div className="xl:hidden border-t border-black/[0.05] bg-[#F5F5F7]/75">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {renderActionPills(true)}
        </div>
      </div>

      {/* Modal Criar Igreja (Exclusivo Super Admin) */}
      {showNewChurchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0071E3] text-white flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">
                    Criar Nova Igreja
                  </h3>
                  <span className="text-[10px] font-bold text-[#0071E3] uppercase tracking-wider">
                    Super Admin Geral ({currentUser?.email})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowNewChurchModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChurchSubmit} className="mt-4 space-y-3.5">
              <p className="text-xs text-gray-500">
                Como Super Administrador do MídiaEscala, você pode provisionar novas congregações. Um código de convite exclusivo será gerado automaticamente.
              </p>

              {churchModalError && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                  {churchModalError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Nome da Nova Igreja / Congregação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Igreja Batista da Aliança - Sede"
                  value={newChurchName}
                  onChange={(e) => setNewChurchName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.03] border border-black/5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setShowNewChurchModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingChurch}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreatingChurch ? 'Provisionando...' : 'Criar Congregação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Indicador claro quando líder simulando Visão Voluntário */}
      {simulatedRole === 'volunteer' && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-1.5 text-center text-xs text-amber-900 flex items-center justify-center gap-3">
          <span>
            Você está pré-visualizando o app na <strong>Visão Voluntário</strong> (ações de edição e exclusão ficam ocultas).
          </span>
          <button
            type="button"
            onClick={() => switchDemoRole(null)}
            className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors cursor-pointer text-[11px]"
          >
            Voltar para Visão Líder
          </button>
        </div>
      )}
    </header>
  );
};
