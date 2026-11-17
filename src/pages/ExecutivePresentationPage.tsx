/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Printer,
  ShieldCheck,
  Video,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Lock,
  MessageCircle,
  ShieldAlert,
  ArrowLeft,
  Building2,
  UserCheck,
  DatabaseZap,
} from 'lucide-react';
import { useChurch } from '../contexts/ChurchContext';
import { BrandLogo as Logo } from '../components/ui/BrandLogo';

export const ExecutivePresentationPage: React.FC = () => {
  const { church, isLeader } = useChurch();

  const handlePrint = () => {
    const prevTitle = document.title;
    document.title = 'Apresentacao_Executiva_Connect_Minist_A4';
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  };

  if (!isLeader) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#1D1D1F]">
          Documento Restrito à Liderança
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          A Apresentação Executiva em PDF é exclusiva para o Líder do Ministério, Administrador do Ministério e Super Admin. Para instruções de uso diário, acesse o Manual do Usuário.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link
            to="/how-to-use"
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED]"
          >
            Abrir Como Usar (PDF)
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-black/[0.04] text-[#1D1D1F] hover:bg-black/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[210mm] mx-auto pb-16 animate-in fade-in duration-300 print:p-0 print:pb-0 print:max-w-full print:w-full">
      {/* Barra de Ação Superior (Oculta na Impressão) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-black/[0.06] shadow-sm mb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0071E3] flex items-center justify-center text-white shadow-md shadow-[#0071E3]/20 shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-[#1D1D1F]">
                Apresentação Executiva — Connect Minist / MídiaEscala
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20 whitespace-nowrap">
                Líder & ADM
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] whitespace-nowrap">
                Padrão A4
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Documento formal em formato A4 (210×297 mm) para Diretoria, Pastores e Liderança
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

      {/* DOCUMENTO EXECUTIVO / PITCH DECK (PADRÃO A4) */}
      <div className="pdf-sheet w-full box-border bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-[12mm] print:p-0 shadow-[0_4px_30px_rgba(0,0,0,0.04)] space-y-6 print:space-y-4 text-[#1D1D1F]">
        {/* Cabeçalho do Documento */}
        <div className="border-b border-black/[0.08] pb-6 print:pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:mb-2">
            <Logo size="lg" showText={true} subtitle="Connect Minist • Apresentação Executiva" />
            <div className="flex flex-col sm:items-end gap-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                <Sparkles className="w-3 h-3" />
                <span>Produto, Governança & Segurança</span>
              </div>
              <span className="text-[11px] font-semibold text-gray-400">
                Edição Atualizada • Novembro de 2026
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl print:text-xl font-extrabold tracking-tight text-[#1D1D1F] mt-2 leading-tight">
            Connect Minist (MídiaEscala): Governança, Escala & Segurança para Ministério de Mídia
          </h1>
          <p className="text-sm print:text-[11px] text-gray-600 mt-2 max-w-3xl leading-relaxed print:leading-snug">
            Plataforma digital multi-igreja dedicada à gestão inteligente de escalas audiovisuais, matriz de capacitação técnica em equipamentos, homologação de voluntários em tempo real e proteção Zero-Trust dos dados do ministério.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-3 print:gap-2 mt-5 print:mt-3 pt-4 print:pt-2.5 border-t border-black/[0.05] text-xs print:text-[10px] text-gray-500">
            <div className="min-w-0">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">Administrador Geral:</span>
              <strong className="text-[#1D1D1F] break-all">joao.gls000@gmail.com</strong>
            </div>
            <div className="min-w-0">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">Congregação Ativa:</span>
              <strong className="text-[#1D1D1F] truncate block">{church?.name || 'Ministério Central'}</strong>
            </div>
            <div className="min-w-0">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">Arquitetura de Nuvem:</span>
              <strong className="text-emerald-600">Firebase Spark (R$ 0/mês)</strong>
            </div>
            <div className="min-w-0">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">Experiência & PWA:</span>
              <strong className="text-[#1D1D1F]">100% Modo Claro • PWA</strong>
            </div>
          </div>
        </div>

        {/* 1. Diagnóstico do Problema e Motivação */}
        <section className="space-y-3 print:space-y-2">
          <h2 className="text-base sm:text-lg print:text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-[#0071E3] text-white text-xs print:text-[10px] flex items-center justify-center font-bold shrink-0">
              1
            </span>
            <span>O Cenário Atual e os Desafios do Ministério</span>
          </h2>

          <p className="text-xs sm:text-sm print:text-[10.5px] text-gray-600 leading-relaxed print:leading-snug">
            As igrejas investem alto em infraestrutura audiovisual (câmeras mirrorless, mesas de som digitais, iluminação DMX, projeção LED e transmissão ao vivo). Sem um sistema estruturado de governança, o ministério fica exposto a falhas operacionais recorrentes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3 print:gap-2 pt-1">
            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-rose-500/5 border border-rose-500/15">
              <span className="text-xs print:text-[10.5px] font-bold text-rose-700 block">Risco aos Equipamentos</span>
              <p className="text-xs print:text-[10px] text-gray-600 mt-1 leading-relaxed print:leading-snug">
                Voluntários sem habilitação mínima escalados para operar mesas ou câmeras sensíveis por falta de registro técnico.
              </p>
            </div>
            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-amber-500/5 border border-amber-500/15">
              <span className="text-xs print:text-[10.5px] font-bold text-amber-700 block">Faltas e Conflitos no Culto</span>
              <p className="text-xs print:text-[10px] text-gray-600 mt-1 leading-relaxed print:leading-snug">
                Escalas em datas de viagem declarada ou duplicidade do mesmo operador em duas funções simultâneas.
              </p>
            </div>
            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-gray-500/5 border border-gray-500/15">
              <span className="text-xs print:text-[10.5px] font-bold text-gray-700 block">Sobrecarga da Liderança</span>
              <p className="text-xs print:text-[10px] text-gray-600 mt-1 leading-relaxed print:leading-snug">
                Horas semanais gastas cobrando confirmações manualmente e controlando acessos sem rastreabilidade.
              </p>
            </div>
          </div>
        </section>

        {/* 2. A Lógica Funcional do Aplicativo */}
        <section className="space-y-3 print:space-y-2">
          <h2 className="text-base sm:text-lg print:text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-[#0071E3] text-white text-xs print:text-[10px] flex items-center justify-center font-bold shrink-0">
              2
            </span>
            <span>Lógica Operacional & Recursos Inteligentes</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 print:gap-2">
            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04]">
              <div className="flex items-center gap-1.5 mb-1.5 print:mb-1">
                <Layers className="w-4 h-4 print:w-3.5 print:h-3.5 text-[#0071E3] shrink-0" />
                <h3 className="text-xs print:text-[10.5px] font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Matriz de Habilitações Técnicas
                </h3>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                Cada operador recebe classificação por posto: <strong>Em Treinamento</strong>, <strong>Apto</strong> ou <strong>Instrutor</strong>. Na montagem da escala, o sistema prioriza quem domina o equipamento e sinaliza quem ainda está em formação.
              </p>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04]">
              <div className="flex items-center gap-1.5 mb-1.5 print:mb-1">
                <Calendar className="w-4 h-4 print:w-3.5 print:h-3.5 text-emerald-600 shrink-0" />
                <h3 className="text-xs print:text-[10.5px] font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Validação Cruzada & Fuso Local
                </h3>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                Ao escalar, o motor verifica indisponibilidades registradas e conflitos no mesmo culto. Datas e recorrências semanais (2 ou 4 semanas) operam em fuso horário local exato, sem erros de virada noturna.
              </p>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04]">
              <div className="flex items-center gap-1.5 mb-1.5 print:mb-1">
                <CheckCircle2 className="w-4 h-4 print:w-3.5 print:h-3.5 text-purple-600 shrink-0" />
                <h3 className="text-xs print:text-[10.5px] font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Confirmação em 1 Toque & Mural de Trocas
                </h3>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                Voluntários confirmam ou justificam ausência com 1 clique. Pedidos no <em>Mural de Trocas</em> permitem que outro irmão habilitado cubra a vaga, ficando pendente apenas da aprovação final do líder.
              </p>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04]">
              <div className="flex items-center gap-1.5 mb-1.5 print:mb-1">
                <MessageCircle className="w-4 h-4 print:w-3.5 print:h-3.5 text-emerald-600 shrink-0" />
                <h3 className="text-xs print:text-[10.5px] font-bold uppercase tracking-wider text-[#1D1D1F]">
                  WhatsApp Pré-Definido & Exportação PDF
                </h3>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                Textos prontos e editáveis para lembretes, convites e alinhamento técnico com envio direto no WhatsApp. Inclui o <strong>Manual Como Usar (PDF)</strong> e esta <strong>Apresentação Executiva (PDF)</strong>.
              </p>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04]">
              <div className="flex items-center gap-1.5 mb-1.5 print:mb-1">
                <UserCheck className="w-4 h-4 print:w-3.5 print:h-3.5 text-[#0071E3] shrink-0" />
                <h3 className="text-xs print:text-[10.5px] font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Homologação ao Vivo & Remoção Higiênica
                </h3>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                Novas contas ficam em fila de espera até aprovação do líder, sendo desbloqueadas em tempo real ao clicar em <strong>Aceitar</strong>. Ao excluir um membro, habilitações e vagas futuras vinculadas são limpas automaticamente.
              </p>
            </div>

            <div className="pdf-card p-4 print:p-2.5 rounded-2xl print:rounded-xl bg-[#F5F5F7] border border-black/[0.04]">
              <div className="flex items-center gap-1.5 mb-1.5 print:mb-1">
                <Building2 className="w-4 h-4 print:w-3.5 print:h-3.5 text-[#0071E3] shrink-0" />
                <h3 className="text-xs print:text-[10.5px] font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Gestão Multi-Igreja (Super Admin)
                </h3>
              </div>
              <p className="text-xs print:text-[10px] text-gray-600 leading-relaxed print:leading-snug">
                Painel centralizado exclusivo do Administrador Geral para provisionar novas congregações, personalizar códigos de convite e alternar entre igrejas com isolamento completo de dados por congregação.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Blindagem de Segurança e Integridade */}
        <section className="space-y-3 print:space-y-2">
          <h2 className="text-base sm:text-lg print:text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-[#0071E3] text-white text-xs print:text-[10px] flex items-center justify-center font-bold shrink-0">
              3
            </span>
            <span>Segurança Zero-Trust & Proteção Contra Ataques</span>
          </h2>

          <div className="pdf-card p-4 print:p-3 rounded-2xl print:rounded-xl bg-[#0071E3]/5 border border-[#0071E3]/20 space-y-2 print:space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0071E3] shrink-0" />
              <h3 className="text-xs print:text-[10.5px] font-bold uppercase tracking-wider text-[#0071E3]">
                Defesa em Camadas (Frontend + Firestore Security Rules)
              </h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-5 gap-y-1.5 text-xs print:text-[10px] text-gray-700 list-disc pl-4 leading-relaxed print:leading-snug">
              <li>
                <strong>Anti-Injeção (SQL/NoSQL & XSS):</strong> Sanitização e bloqueio de payloads suspeitos, tags HTML e operadores maliciosos em todos os campos.
              </li>
              <li>
                <strong>Anti-Força Bruta & Hash SHA-256:</strong> Limitação de tentativas no login e criptografia SHA-256 via Web Crypto API.
              </li>
              <li>
                <strong>Regras Zero-Trust no Firestore:</strong> Validação estrita de chaves, tamanhos máximos e tipos de dados diretamente no banco de dados.
              </li>
              <li>
                <strong>Imunidade a Escalonamento de Privilégio:</strong> Impede auto-promoção de cargo ou leitura de dados antes de <code className="font-mono break-all">approvalStatus == 'approved'</code>.
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Governança e Hierarquia de Perfis (RBAC) */}
        <section className="space-y-3 print:space-y-2">
          <h2 className="text-base sm:text-lg print:text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-[#0071E3] text-white text-xs print:text-[10px] flex items-center justify-center font-bold shrink-0">
              4
            </span>
            <span>Governança e Hierarquia de Perfis (RBAC)</span>
          </h2>

          <div className="overflow-x-auto print:overflow-visible w-full">
            <table className="w-full text-left text-xs print:text-[10px] border border-black/[0.08] rounded-2xl print:rounded-lg overflow-hidden table-fixed">
              <thead className="bg-[#F5F5F7] border-b border-black/[0.08]">
                <tr>
                  <th className="w-[22%] py-2.5 px-3 print:py-1.5 print:px-2 font-bold text-gray-500 uppercase">Perfil</th>
                  <th className="w-[48%] py-2.5 px-3 print:py-1.5 print:px-2 font-bold text-gray-500 uppercase">Atribuições</th>
                  <th className="w-[30%] py-2.5 px-3 print:py-1.5 print:px-2 font-bold text-gray-500 uppercase">Escopo de Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                <tr>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 font-bold text-[#0071E3]">Super Admin (Site)</td>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 text-gray-600">
                    Administrador geral (<strong className="break-all">joao.gls000@gmail.com</strong>). Cria, edita, alterna e exclui igrejas no painel global.
                  </td>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 text-gray-500 font-mono text-[10px] print:text-[9px]">
                    email_verified == true; multi-igreja global
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 font-bold text-purple-700">Adm do Ministério</td>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 text-gray-600">
                    Líder geral da igreja local. Gerencia equipe, equipamentos, aprova trocas e acessa esta Apresentação Executiva (PDF).
                  </td>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 text-gray-500 font-mono text-[10px] print:text-[9px]">
                    Gestão plena da igreja local
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 font-bold text-gray-800">Líder de Equipe</td>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 text-gray-600">
                    Coordenador de culto/área. Monta escalas, homologa pendentes, remove usuários inativos e envia alertas no WhatsApp.
                  </td>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 text-gray-500 font-mono text-[10px] print:text-[9px]">
                    Escalas, cultos, habilitações e aprovações
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 font-bold text-gray-600">Voluntário</td>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 text-gray-600">
                    Operador de mídia. Cria conta, aguarda aprovação em tempo real, confirma escalas, pede trocas e consulta o Manual (PDF).
                  </td>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 text-gray-500 font-mono text-[10px] print:text-[9px]">
                    Liberado após approvalStatus == 'approved'
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Viabilidade Financeira: Custo Zero no Firebase Spark */}
        <section className="space-y-3 print:space-y-2">
          <h2 className="text-base sm:text-lg print:text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <span className="w-6 h-6 print:w-5 print:h-5 rounded-full bg-[#0071E3] text-white text-xs print:text-[10px] flex items-center justify-center font-bold shrink-0">
              5
            </span>
            <span>Viabilidade Financeira & Eficiência Operacional</span>
          </h2>

          <div className="pdf-card p-5 print:p-3 rounded-3xl print:rounded-xl bg-emerald-50 border border-emerald-500/20 text-xs print:text-[10px] text-emerald-950 space-y-2 print:space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm print:text-xs">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>Orçamento Mensal de Infraestrutura: R$ 0,00</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] print:text-[9px] font-bold">
                <DatabaseZap className="w-3 h-3" />
                <span>Firebase Spark 100% Otimizado</span>
              </span>
            </div>
            <p className="leading-relaxed print:leading-snug">
              Toda a engenharia do <strong>Connect Minist (MídiaEscala)</strong> foi projetada para rodar continuamente dentro do plano gratuito permanente do Firebase:
            </p>
            <ul className="list-disc pl-4 space-y-1 print:space-y-0.5 text-emerald-900 leading-relaxed print:leading-snug">
              <li><strong>Zero Cloud Functions:</strong> Toda validação e limpeza em cascata ocorre de forma segura e auditável via regras ABAC no Firestore.</li>
              <li><strong>Zero Cloud Storage:</strong> Avatares dinâmicos por iniciais eliminam custos de armazenamento e tráfego de mídia.</li>
              <li><strong>Cache Offline IndexedDB + PWA:</strong> Reduz leituras repetidas em nuvem e permite instalar o aplicativo direto no iOS e Android sem taxas de lojas.</li>
            </ul>
          </div>
        </section>

        {/* Rodapé Executivo */}
        <div className="pt-6 print:pt-3 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs print:text-[9.5px] text-gray-400">
          <span>Connect Minist • MídiaEscala © 2026 — Ministério de Mídia & Audiovisual</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Apresentação Executiva (Exclusiva para Liderança & Administração)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
