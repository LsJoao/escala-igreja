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
  CalendarCheck,
  MessageCircle,
  Smartphone,
  ShieldCheck,
  Video,
  Users,
  Building2,
} from 'lucide-react';
import { BrandLogo as Logo } from '../components/ui/BrandLogo';

export const UserGuidePage: React.FC = () => {
  const handlePrint = () => {
    const prevTitle = document.title;
    document.title = 'Manual_Como_Usar_Connect_Minist_A4';
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  };

  return (
    <div className="w-full max-w-[210mm] mx-auto pb-16 animate-in fade-in duration-300 print:p-0 print:pb-0 print:max-w-full print:w-full">
      {/* Barra Superior de Exportação (Oculta na Impressão) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-black/[0.06] shadow-sm mb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0071E3] flex items-center justify-center text-white shadow-md shadow-[#0071E3]/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-[#1D1D1F]">
                Manual do Usuário — Connect Minist / MídiaEscala
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] whitespace-nowrap">
                Padrão A4 (210×297 mm)
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Guia ilustrado passo a passo configurado em formato A4 para salvar em PDF ou imprimir
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-md shadow-[#0071E3]/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / PDF (A4)</span>
        </button>
      </div>

      {/* FOLHA DO MANUAL EM PDF (PADRÃO A4) */}
      <div className="pdf-sheet w-full box-border bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-[12mm] print:p-0 shadow-[0_4px_30px_rgba(0,0,0,0.04)] space-y-6 print:space-y-4 text-[#1D1D1F]">
        {/* Cabeçalho */}
        <div className="border-b border-black/[0.08] pb-6 print:pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Logo size="lg" showText={true} subtitle="Connect Minist • Guia Prático da Equipe" />
            <span className="px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
              Manual Oficial • PDF Atualizado
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl print:text-xl font-extrabold tracking-tight text-[#1D1D1F] mt-4 print:mt-2 leading-tight">
            Como Usar o Connect Minist (MídiaEscala) no Dia a Dia
          </h1>
          <p className="text-sm print:text-[10.5px] text-gray-600 mt-2 max-w-3xl leading-relaxed print:leading-snug">
            Aprenda passo a passo como criar sua conta, aguardar a liberação em tempo real, confirmar suas escalas, registrar indisponibilidades, solicitar trocas e gerenciar toda a equipe de mídia da sua igreja.
          </p>
        </div>

        {/* Passo 1: Primeiro Acesso */}
        <section className="space-y-3 print:space-y-2">
          <h2 className="text-base sm:text-lg print:text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-[#0071E3] text-white text-xs print:text-[10px] flex items-center justify-center font-bold shrink-0">
              1
            </span>
            <span>Primeiro Acesso, Convite & Aprovação em Tempo Real</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3 print:gap-2">
            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04] space-y-1.5 print:space-y-1">
              <div className="flex items-center gap-1.5 text-[#0071E3] font-bold text-xs print:text-[10.5px] uppercase tracking-wider">
                <UserPlus className="w-4 h-4 print:w-3.5 print:h-3.5 shrink-0" />
                <span>1. Entre ou Crie Conta</span>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                Na tela inicial, clique em <strong>Continuar com o Google</strong> (1 clique) ou utilize as abas <strong>Entrar</strong> / <strong>Criar Conta</strong> informando nome completo, e-mail e senha (mínimo 6 dígitos).
              </p>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04] space-y-1.5 print:space-y-1">
              <div className="flex items-center gap-1.5 text-[#0071E3] font-bold text-xs print:text-[10.5px] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 print:w-3.5 print:h-3.5 shrink-0" />
                <span>2. Código de Convite</span>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                Recebeu o código da sua igreja (ex: <code className="font-mono font-bold">MIDIA2026</code>)? Acesse a aba <strong>Com Convite</strong>, informe o código e suas credenciais para vincular-se à congregação correta.
              </p>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04] space-y-1.5 print:space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs print:text-[10.5px] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 print:w-3.5 print:h-3.5 shrink-0" />
                <span>3. Liberação Instantânea</span>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                Novos cadastros aguardam aprovação da liderança. Não precisa atualizar a página: assim que o líder clicar em <strong>Aceitar</strong>, seu painel é liberado automaticamente ao vivo.
              </p>
            </div>
          </div>
        </section>

        {/* Passo 2: Guia do Voluntário */}
        <section className="space-y-3 print:space-y-2">
          <h2 className="text-base sm:text-lg print:text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-[#0071E3] text-white text-xs print:text-[10px] flex items-center justify-center font-bold shrink-0">
              2
            </span>
            <span>Guia Rápido para Voluntários</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 print:gap-2">
            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-white border border-black/[0.08] space-y-1.5 print:space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs print:text-[10.5px] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 print:w-3.5 print:h-3.5 shrink-0" />
                <span>Confirmar ou Recusar Escala</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1 print:space-y-0.5 text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                <li>Abra a aba <strong>Minhas Escalas</strong> no menu lateral ou barra inferior.</li>
                <li>Confira data, horário do culto, função (ex: Câmera 1) e equipamento.</li>
                <li>Toque no botão verde <strong>Confirmar Presença</strong> assim que receber o aviso.</li>
                <li>Se houver imprevisto, clique em <strong>Recusar</strong> e informe o motivo para remanejamento.</li>
              </ol>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-white border border-black/[0.08] space-y-1.5 print:space-y-1">
              <div className="flex items-center gap-1.5 text-[#0071E3] font-bold text-xs print:text-[10.5px] uppercase tracking-wider">
                <ArrowLeftRight className="w-4 h-4 print:w-3.5 print:h-3.5 shrink-0" />
                <span>Pedir Troca no Mural</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1 print:space-y-0.5 text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                <li>Em <strong>Minhas Escalas</strong>, toque em <strong>Pedir Troca</strong> na escala desejada.</li>
                <li>Adicione uma observação curta e clique em <strong>Publicar Troca</strong>.</li>
                <li>Sua vaga aparece no <strong>Mural de Trocas</strong> para outro colega clicar em <em>Me voluntariar para cobrir</em>.</li>
                <li>Quando o líder aprovar a substituição, a escala é atualizada automaticamente.</li>
              </ol>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-white border border-black/[0.08] space-y-1.5 print:space-y-1">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs print:text-[10.5px] uppercase tracking-wider">
                <CalendarOff className="w-4 h-4 print:w-3.5 print:h-3.5 shrink-0" />
                <span>Avisar Viagens e Indisponibilidades</span>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                Antes da montagem da escala mensal, acesse <strong>Indisponibilidade</strong> e toque em <strong>Informar Data</strong>. Defina início, término e motivo. O sistema emitirá alerta automático se alguém tentar escalar você nesse período.
              </p>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-white border border-black/[0.08] space-y-1.5 print:space-y-1">
              <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs print:text-[10.5px] uppercase tracking-wider">
                <Smartphone className="w-4 h-4 print:w-3.5 print:h-3.5 shrink-0" />
                <span>Instalar no Celular (App PWA)</span>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                <strong>Android / Chrome:</strong> clique em <em>Instalar App</em> na barra superior.<br />
                <strong>iPhone / Safari:</strong> toque em Compartilhar e selecione <strong>Adicionar à Tela de Início</strong>. Funciona em 100% Modo Claro com consulta offline!
              </p>
            </div>
          </div>
        </section>

        {/* Passo 3: Guia do Líder / ADM */}
        <section className="space-y-3 print:space-y-2">
          <h2 className="text-base sm:text-lg print:text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-[#0071E3] text-white text-xs print:text-[10px] flex items-center justify-center font-bold shrink-0">
              3
            </span>
            <span>Guia para Líderes & Administradores</span>
          </h2>

          <div className="space-y-2.5 print:space-y-1.5">
            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04] flex items-start gap-3">
              <Video className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
              <div className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                <strong className="text-[#1D1D1F] block text-xs print:text-[10.5px] mb-0.5">1. Equipamentos & Matriz de Habilitação</strong>
                Em <strong>Equipamentos</strong>, cadastre câmeras, mesas de som, iluminação e projeção. Na <strong>Matriz de Habilitação</strong>, clique em qualquer célula para classificar cada membro como <em>★ Instrutor</em>, <em>✓ Apto</em> ou <em>⏳ Em Treinamento</em>.
              </div>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04] flex items-start gap-3">
              <CalendarCheck className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
              <div className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                <strong className="text-[#1D1D1F] block text-xs print:text-[10.5px] mb-0.5">2. Cultos, Recorrência Semanal & Calendário</strong>
                Em <strong>Cultos & Escalas</strong>, crie cultos avulsos ou recorrentes (2 ou 4 semanas consecutivas). Ao escalar operadores, o sistema destaca quem está <strong>✓ Apto</strong> e alerta sobre <strong>⚠ Indisponível</strong> ou <strong>⚠ Já Escalado</strong>. Use também o botão <em>Imprimir</em> para fixar a escala na cabine.
              </div>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04] flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                <strong className="text-[#1D1D1F] block text-xs print:text-[10.5px] mb-0.5">3. Aprovações, WhatsApp Pré-definido & Exclusão Segura</strong>
                Na aba <strong>Voluntários</strong>, aprove ou recuse cadastros pendentes em 1 clique. O botão <strong>WhatsApp</strong> no cartão de cada membro abre mensagens prontas e editáveis. Caso precise remover um usuário, o botão de lixeira abre confirmação segura e desocupa automaticamente as escalas vinculadas.
              </div>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04] flex items-start gap-3">
              <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                <strong className="text-[#1D1D1F] block text-xs print:text-[10.5px] mb-0.5">4. Pré-visualizar Visão Voluntário</strong>
                No menu do avatar (canto superior direito), você pode alternar entre <strong>Visão Líder</strong> e <strong>Voluntário</strong> para testar o aplicativo exatamente como sua equipe enxerga — um banner no topo permite voltar à Visão Líder com 1 clique.
              </div>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04] flex items-start gap-3">
              <Building2 className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
              <div className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                <strong className="text-[#1D1D1F] block text-xs print:text-[10.5px] mb-0.5">5. Painel de Igrejas & Apresentação Executiva</strong>
                Líderes e Administradores do Ministério contam com o botão <strong>Apresentação (PDF)</strong> e <strong>Carregar Exemplo</strong> na barra superior. O Super Admin dispõe ainda do painel <strong>Gerenciar Igrejas</strong> para cadastrar congregações e alternar entre unidades.
              </div>
            </div>
          </div>
        </section>

        {/* Passo 4: Boas Práticas de Segurança */}
        <section className="pdf-card p-5 print:p-3 rounded-3xl print:rounded-xl bg-[#0071E3]/5 border border-[#0071E3]/15 space-y-1.5">
          <div className="flex items-center gap-2 text-[#0071E3] font-bold text-xs print:text-[10.5px] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Boas Práticas & Segurança da Sua Conta</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 print:space-y-0.5 text-xs print:text-[10px] text-gray-700 leading-relaxed print:leading-snug">
            <li>Não compartilhe sua senha pessoal nem sua conta Google conectada com outros operadores.</li>
            <li>Clique sempre em <strong>Sair da Conta</strong> após utilizar o sistema em computadores compartilhados da cabine de mídia.</li>
            <li>Todos os campos e links contam com validação automática contra injeção de código e proteção de sessão por perfil.</li>
          </ul>
        </section>

        {/* Rodapé */}
        <div className="pt-6 print:pt-3 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs print:text-[9.5px] text-gray-400">
          <span>Connect Minist • MídiaEscala © 2026 — Manual Oficial do Usuário</span>
          <span>Salve em PDF ou imprima para compartilhar no grupo da equipe</span>
        </div>
      </div>
    </div>
  );
};
