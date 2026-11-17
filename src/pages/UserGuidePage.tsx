/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Printer,
  BookOpen,
  UserPlus,
  CheckCircle2,
  ArrowLeftRight,
  CalendarOff,
  Grid3X3,
  CalendarCheck,
  MessageCircle,
  Smartphone,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export const UserGuidePage: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-300 print:p-0 print:max-w-none">
      {/* Barra Superior de Exportação (Oculta na Impressão) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-black/[0.06] shadow-sm mb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0071E3] flex items-center justify-center text-white shadow-md shadow-[#0071E3]/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1D1D1F]">
              Manual do Usuário — Como Usar o MídiaEscala
            </h2>
            <p className="text-xs text-gray-500">
              Guia ilustrado passo a passo para Voluntários e Líderes pronto para salvar em PDF
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-md shadow-[#0071E3]/25 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Baixar / Imprimir Manual em PDF</span>
        </button>
      </div>

      {/* FOLHA DO MANUAL EM PDF */}
      <div className="bg-white rounded-3xl border border-black/[0.06] p-8 sm:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.04)] print:border-none print:shadow-none print:p-0 space-y-10 text-[#1D1D1F]">
        {/* Cabeçalho */}
        <div className="border-b border-black/[0.08] pb-8">
          <div className="flex items-center justify-between gap-4">
            <Logo size="md" showText={true} subtitle="Guia Prático da Equipe" />
            <span className="px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[11px] font-bold uppercase tracking-wider">
              Manual Oficial • PDF
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] mt-6 leading-tight">
            Como Usar o MídiaEscala no Dia a Dia
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-3xl leading-relaxed">
            Aprenda rapidamente a acessar o aplicativo, confirmar suas escalas de culto, avisar datas de viagem, trocar turnos com outros irmãos e organizar toda a equipe de mídia da sua igreja.
          </p>
        </div>

        {/* Passo 1: Primeiro Acesso */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#0071E3] text-white text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>Primeiro Acesso & Código de Convite</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] space-y-2">
              <div className="flex items-center gap-2 text-[#0071E3] font-bold text-xs uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                <span>1. Crie sua Conta</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Na tela inicial, clique em <strong>Continuar com o Google</strong> (1 clique) ou utilize a aba <strong>Criar Conta</strong> informando seu nome, e-mail e uma senha segura.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] space-y-2">
              <div className="flex items-center gap-2 text-[#0071E3] font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Informe o Convite</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Se recebeu um código da sua igreja (ex: <code className="font-mono font-bold">MIDIA2026</code>), use a aba <strong>Com Convite</strong> para vincular seu cadastro à congregação correta.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>3. Aprovação do Líder</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Por segurança, novos cadastros passam pela aprovação do Líder ou Administrador do Ministério. Assim que aceito, todas as escalas são liberadas.
              </p>
            </div>
          </div>
        </section>

        {/* Passo 2: Guia do Voluntário */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#0071E3] text-white text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>Guia Rápido para Voluntários</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-black/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar ou Recusar Escala</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-xs text-gray-600 leading-relaxed">
                <li>Abra a aba <strong>Minhas Escalas</strong> no menu lateral (ou barra inferior do celular).</li>
                <li>Veja a data, horário, função (ex: Câmera 1) e equipamento.</li>
                <li>Toque no botão verde <strong>Confirmar Presença</strong> assim que visualizar a escala.</li>
                <li>Caso tenha um imprevisto, clique em <strong>Recusar</strong> e informe o motivo para o líder agir rápido.</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-black/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-[#0071E3] font-bold text-xs uppercase tracking-wider">
                <ArrowLeftRight className="w-4 h-4" />
                <span>Pedir Troca de Turno</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-xs text-gray-600 leading-relaxed">
                <li>Em <strong>Minhas Escalas</strong>, clique em <strong>Pedir Troca</strong> no culto desejado.</li>
                <li>Escreva um breve recado e clique em <strong>Publicar Troca</strong>.</li>
                <li>Sua vaga vai para o <strong>Mural de Trocas</strong>, onde outro colega disponível pode clicar em <em>Me voluntariar para cobrir</em>.</li>
                <li>O líder homologa com 1 clique e a escala é atualizada automaticamente.</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-black/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                <CalendarOff className="w-4 h-4" />
                <span>Avisar Viagens e Indisponibilidade</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Antes do fechamento da escala do mês, acesse <strong>Indisponibilidade</strong> e clique em <strong>Informar Data</strong>. Selecione a data de início, término e o motivo. O sistema emitirá um alerta automático ao líder se ele tentar escalar você nesse período.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-black/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>Instalar no Celular (App PWA)</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Android/Chrome:</strong> clique em <em>Instalar App</em> na barra superior.<br />
                <strong>iPhone (Safari):</strong> toque em <em>Instalar no iPhone</em> (ou no ícone Compartilhar) e escolha <strong>Adicionar à Tela de Início</strong>. Funciona inclusive em modo offline!
              </p>
            </div>
          </div>
        </section>

        {/* Passo 3: Guia do Líder / ADM */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#0071E3] text-white text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>Guia para Líderes & Administradores</span>
          </h2>

          <div className="space-y-3">
            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-start gap-3.5">
              <Video className="w-5 h-5 text-[#0071E3] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-[#1D1D1F] block text-sm mb-1">1. Cadastre Equipamentos & Matriz de Habilitação</strong>
                Em <strong>Equipamentos</strong>, registre câmeras, mesas de som, iluminação e projeção. Depois, na <strong>Matriz de Habilitação</strong>, clique nas células para classificar cada membro como <em>★ Instrutor</em>, <em>✓ Apto</em> ou <em>⏳ Em Treinamento</em>.
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-start gap-3.5">
              <CalendarCheck className="w-5 h-5 text-[#0071E3] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-[#1D1D1F] block text-sm mb-1">2. Monte Cultos & Escalas sem Conflitos</strong>
                Em <strong>Cultos & Escalas</strong>, clique em <em>Novo Culto / Evento</em> (você pode repetir automaticamente por 2 ou 4 semanas!). Ao escolher operadores, o app indica quem está <strong>✓ Apto</strong> e bloqueia/alerta quem está <strong>⚠ Indisponível</strong> ou <strong>⚠ Já Escalado</strong> no mesmo culto.
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-start gap-3.5">
              <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-[#1D1D1F] block text-sm mb-1">3. Aprovação de Membros & Mensagens Prontas no WhatsApp</strong>
                Na aba <strong>Voluntários</strong>, aceite ou negue cadastros pendentes com 1 toque. Use o botão <strong>WhatsApp</strong> no cartão de qualquer membro para enviar lembretes de escala, convites ou avisos de ensaio com textos prontos e editáveis.
              </div>
            </div>
          </div>
        </section>

        {/* Passo 4: Boas Práticas de Segurança */}
        <section className="p-6 rounded-3xl bg-[#0071E3]/5 border border-[#0071E3]/15 space-y-2">
          <div className="flex items-center gap-2 text-[#0071E3] font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Boas Práticas & Segurança da Sua Conta</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-700 leading-relaxed">
            <li>Não compartilhe sua senha pessoal ou o acesso da sua conta Google com terceiros.</li>
            <li>Utilize sempre o botão <strong>Sair da Conta</strong> se acessar o sistema em um computador compartilhado na cabine de mídia da igreja.</li>
            <li>Todos os formulários e gravações em nuvem contam com sanitização automática contra códigos maliciosos e regras de acesso estritas por perfil.</li>
          </ul>
        </section>

        {/* Rodapé */}
        <div className="pt-8 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>MídiaEscala © 2026 — Manual Oficial do Usuário</span>
          <span>Imprima ou salve em PDF para compartilhar no grupo do ministério</span>
        </div>
      </div>
    </div>
  );
};
