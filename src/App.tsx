/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChurchProvider, useChurch } from './contexts/ChurchContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { BrandLogo as Logo } from './components/ui/BrandLogo';

import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { VolunteersPage } from './pages/VolunteersPage';
import { EquipmentsPage } from './pages/EquipmentsPage';
import { SkillsMatrixPage } from './pages/SkillsMatrixPage';
import { EventsPage } from './pages/EventsPage';
import { MySchedulePage } from './pages/MySchedulePage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { CalendarPage } from './pages/CalendarPage';

import { ExecutivePresentationPage } from './pages/ExecutivePresentationPage';
import { ManageChurchesPage } from './pages/ManageChurchesPage';
import { UserGuidePage } from './pages/UserGuidePage';

const AppContent: React.FC = () => {
  const { currentUser, loading, logout } = useAuth();
  const { loadingChurch, isSuperAdmin, isLeader, currentMember, church } = useChurch();

  if (loading || loadingChurch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="flex flex-col items-center gap-3">
          <Logo size="lg" showText={true} subtitle="Carregando ministério..." className="animate-pulse" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  // Se o usuário não for Super Admin e o status de aprovação for pendente ou rejeitado
  if (!isSuperAdmin && currentMember && (currentMember.approvalStatus === 'pending' || currentMember.approvalStatus === 'rejected')) {
    const isPending = currentMember.approvalStatus === 'pending';
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F5F7] text-[#1D1D1F]">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-black/[0.04] text-center">
          <Logo size="lg" showText={false} className="mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1D1D1F]">
            {isPending ? 'Aguardando Aprovação do Líder' : 'Acesso Não Autorizado'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
            {isPending
              ? `Olá, ${currentMember.name}! Sua solicitação para ingressar na equipe de mídia da ${church?.name || 'igreja'} foi enviada. Assim que o administrador aprovar seu perfil, você poderá visualizar as escalas e equipamentos.`
              : `Olá, ${currentMember.name}. Sua solicitação de ingresso foi recusada pela administração do ministério. Entre em contato com seu líder para mais informações.`}
          </p>

          <div className="my-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs text-left space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              {isPending ? 'Status: Análise Pendente' : 'Status: Negado'}
            </span>
            <p className="text-[11px] text-amber-800/80">
              {isPending
                ? 'O líder já recebeu uma notificação no painel de voluntários para homologar sua entrada.'
                : 'Você pode tentar novamente com outro código de convite ou falar com a liderança.'}
            </p>
          </div>

          <button
            onClick={() => logout()}
            className="w-full py-2.5 px-4 rounded-full text-xs font-semibold bg-black/[0.04] hover:bg-black/10 text-[#1D1D1F] transition-all cursor-pointer"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen flex flex-col bg-[#F5F5F7] text-[#1D1D1F] transition-colors pb-16 lg:pb-0 print:pb-0">
      <Navbar />

      <div className="app-body flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/my-schedule" element={<MySchedulePage />} />
            <Route path="/volunteers" element={<VolunteersPage />} />
            <Route path="/equipments" element={<EquipmentsPage />} />
            <Route path="/skills" element={<SkillsMatrixPage />} />
            <Route path="/availability" element={<AvailabilityPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/how-to-use" element={<UserGuidePage />} />
            <Route
              path="/executive-presentation"
              element={isLeader ? <ExecutivePresentationPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/churches"
              element={isSuperAdmin ? <ManageChurchesPage /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <BottomNav />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  // Garantir modo claro permanente (100% Light Mode Apple Style)
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ChurchProvider>
          <AppContent />
        </ChurchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
