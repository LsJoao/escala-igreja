/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utilitários centralizados de segurança, sanitização e validação de dados.
 * Protege contra payloads de SQL Injection, NoSQL Operator Injection, XSS e Prototype Pollution.
 */

const DANGEROUS_PATTERNS: RegExp[] = [
  /<\s*script\b/i,
  /<\/\s*script\s*>/i,
  /javascript\s*:/i,
  /on(error|load|click|mouseover|focus)\s*=/i,
  /(\bunion\s+(all\s+)?select\b|\bdrop\s+table\b|\bdelete\s+from\b|\binsert\s+into\b|\bupdate\s+\w+\s+set\b)/i,
  /(--|\/\*|\*\/|;\s*--)/,
  /(\$\s*(where|ne|gt|gte|lt|lte|in|nin|regex|or|and|exists)\b)/i,
  /(__proto__|constructor\.prototype)/i,
];

/**
 * Detecta se um texto contém padrões suspeitos de SQL Injection, NoSQL Injection ou XSS.
 */
export function hasDangerousPayload(value: string): boolean {
  if (!value) return false;
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Remove caracteres de controle, tags HTML e limita o comprimento de strings.
 */
export function sanitizeText(value: string, maxLength = 200): string {
  if (!value || typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Remove caracteres de controle
    .replace(/[<>]/g, '') // Previne injeção de tags HTML/XSS
    .trim()
    .slice(0, maxLength);
}

/**
 * Valida e sanitiza input de texto lançando erro amigável caso contenha payload de ataque.
 */
export function assertSafeText(value: string, fieldLabel: string, maxLength = 200): string {
  if (hasDangerousPayload(value)) {
    throw new Error(`Entrada inválida detectada no campo "${fieldLabel}". Remova caracteres ou comandos não permitidos.`);
  }
  return sanitizeText(value, maxLength);
}

/**
 * Sanitiza número de telefone/WhatsApp mantendo apenas caracteres válidos.
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^\d+\-()\s]/g, '').trim().slice(0, 30);
}

/**
 * Formata dígitos de telefone para link seguro do WhatsApp (com DDI 55 padrão se nacional).
 */
export function formatWhatsAppDigits(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Valida formato de e-mail seguro.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 120 || hasDangerousPayload(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Valida identificador seguro para documentos do Firestore na criação/atualização.
 */
export function isValidFirestoreId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_-]{1,128}$/.test(id);
}

/**
 * Valida segmento de ID de documento para exclusão/leitura segura contra path traversal (permite IDs legados com pontos ou arroba).
 */
export function isSafeDocId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  if (id.length > 256) return false;
  if (id.includes('/') || id.includes('\\') || id === '.' || id === '..' || id.includes('..')) {
    return false;
  }
  return true;
}

/**
 * Formata um Date no fuso horário local do usuário no padrão YYYY-MM-DD (evita erro de virada de dia UTC após 21h no Brasil).
 */
export function getLocalDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna a data de hoje no fuso local YYYY-MM-DD.
 */
export function getLocalTodayStr(): string {
  return getLocalDateStr(new Date());
}

/**
 * Valida string de data YYYY-MM-DD real.
 */
export function isValidDateStr(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const parsed = new Date(`${dateStr}T12:00:00`);
  return !Number.isNaN(parsed.getTime());
}

/**
 * Formata data YYYY-MM-DD com proteção contra datas inválidas.
 */
export function safeFormatDateBR(
  dateStr: string | undefined,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
): string {
  if (!dateStr) return 'Data a definir';
  const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return 'Data inválida';
  return d.toLocaleDateString('pt-BR', options);
}

/**
 * Valida horário HH:mm.
 */
export function isValidTimeStr(timeStr: string): boolean {
  if (!timeStr) return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr);
}

/**
 * Gera hash SHA-256 usando Web Crypto API para não armazenar senhas em texto puro no navegador.
 */
export async function hashCredential(email: string, password: string): Promise<string> {
  const normalized = `midiaescala_v1:${email.trim().toLowerCase()}:${password}`;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback determinístico caso subtle esteja indisponível em contexto não-HTTPS
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv_${(hash >>> 0).toString(16)}`;
}

/**
 * Abre link externo (ex: WhatsApp) com proteção contra Reverse Tabnabbing (noopener, noreferrer).
 */
export function openSafeExternalUrl(url: string): void {
  if (!url.startsWith('https://wa.me/') && !url.startsWith('https://')) {
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
