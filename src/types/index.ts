/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'superadmin' | 'ministry_admin' | 'leader' | 'volunteer';

export type CategoryBadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple';

export type EquipmentCategory = string;

export interface EquipmentCategoryItem {
  id: string;
  label: string;
  variant?: CategoryBadgeVariant;
}

export const DEFAULT_EQUIPMENT_CATEGORIES: EquipmentCategoryItem[] = [
  { id: 'video', label: 'Vídeo / Câmeras', variant: 'info' },
  { id: 'audio', label: 'Áudio / Som', variant: 'purple' },
  { id: 'lighting', label: 'Iluminação', variant: 'warning' },
  { id: 'projection', label: 'Projeção / Telão', variant: 'success' },
  { id: 'broadcast', label: 'Transmissão', variant: 'info' },
  { id: 'other', label: 'Outros', variant: 'default' },
];

export type EquipmentStatus = 'available' | 'maintenance';

export type SkillLevel = 'training' | 'qualified' | 'instructor';

export type EventType =
  | 'sunday_service'
  | 'midweek_service'
  | 'rehearsal'
  | 'special_event';

export type SlotStatus = 'pending' | 'confirmed' | 'declined';

export type SwapStatus = 'open' | 'accepted_by_peer' | 'approved' | 'rejected';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Church {
  id: string;
  name: string;
  inviteCode: string;
  leaderId: string;
  createdAt: string;
  equipmentCategories?: EquipmentCategoryItem[];
}

export interface Member {
  id: string;
  churchId: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
  approvalStatus?: ApprovalStatus; // 'pending' | 'approved' | 'rejected'
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  churchId: string;
  name: string;
  category: EquipmentCategory;
  description: string;
  status: EquipmentStatus;
  createdAt: string;
}

export interface Skill {
  id: string;
  churchId: string;
  memberId: string;
  equipmentId: string;
  level: SkillLevel;
  updatedAt: string;
}

export interface EventSchedule {
  id: string;
  churchId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: EventType;
  notes?: string;
  createdAt: string;
}

export interface Slot {
  id: string;
  churchId: string;
  eventId: string;
  roleName: string; // Ex: Câmera 1, Mesa Som PA, Projeção Holyrics
  equipmentId: string;
  memberId?: string; // ID do membro escalado (opcional caso vaga em aberto)
  status: SlotStatus;
  declineReason?: string;
  updatedAt: string;
}

export interface Unavailability {
  id: string;
  churchId: string;
  memberId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason?: string;
  createdAt: string;
}

export interface SwapRequest {
  id: string;
  churchId: string;
  eventId: string;
  slotId: string;
  requesterMemberId: string;
  candidateMemberId?: string;
  status: SwapStatus;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  churchId: string;
  targetMemberId?: string; // Se omitido, é notificação geral para a liderança ou igreja
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
