/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  limit,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, auth, OperationType } from '../services/firebase';
import { removeLocalAccountByEmail, useAuth } from './AuthContext';
import {
  Church,
  Member,
  Equipment,
  Skill,
  EventSchedule,
  Slot,
  Unavailability,
  SwapRequest,
  NotificationItem,
  SkillLevel,
} from '../types';
import {
  assertSafeText,
  getLocalDateStr,
  isSafeDocId,
  isValidDateStr,
  isValidEmail,
  isValidFirestoreId,
  isValidTimeStr,
  sanitizePhone,
  sanitizeText,
} from '../utils/security';

const SUPER_ADMIN_EMAIL = 'joao.gls000@gmail.com';

interface ChurchContextType {
  church: Church | null;
  allChurches: Church[];
  currentMember: Member | null;
  isSuperAdmin: boolean;
  isMinistryAdmin: boolean;
  isLeader: boolean;
  loadingChurch: boolean;
  members: Member[];
  pendingMembers: Member[];
  equipments: Equipment[];
  skills: Skill[];
  events: EventSchedule[];
  slots: Slot[];
  unavailabilities: Unavailability[];
  swaps: SwapRequest[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  // Ações de Igreja
  createChurch: (name: string) => Promise<void>;
  updateChurch: (churchId: string, data: { name?: string; inviteCode?: string }) => Promise<void>;
  deleteChurch: (churchId: string) => Promise<void>;
  switchChurch: (churchId: string) => Promise<void>;
  joinChurchByCode: (inviteCode: string) => Promise<boolean>;
  refreshChurches: () => Promise<void>;
  // Membros & Aprovação de Acesso
  addMember: (data: Omit<Member, 'id' | 'churchId' | 'createdAt'>) => Promise<string>;
  updateMember: (id: string, data: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  approveMember: (id: string) => Promise<void>;
  rejectMember: (id: string) => Promise<void>;
  // Equipamentos
  addEquipment: (data: Omit<Equipment, 'id' | 'churchId' | 'createdAt'>) => Promise<void>;
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  // Habilitações
  setSkillLevel: (memberId: string, equipmentId: string, level: SkillLevel | null) => Promise<void>;
  getSkillLevel: (memberId: string, equipmentId: string) => SkillLevel | null;
  // Eventos e Escalas
  addEvent: (data: Omit<EventSchedule, 'id' | 'churchId' | 'createdAt'>) => Promise<string>;
  updateEvent: (id: string, data: Partial<EventSchedule>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  // Posições / Slots na Escala
  addSlot: (eventId: string, data: Omit<Slot, 'id' | 'churchId' | 'eventId' | 'updatedAt'>) => Promise<void>;
  updateSlot: (eventId: string, slotId: string, data: Partial<Slot>) => Promise<void>;
  deleteSlot: (eventId: string, slotId: string) => Promise<void>;
  confirmSlot: (eventId: string, slotId: string) => Promise<void>;
  declineSlot: (eventId: string, slotId: string, reason: string) => Promise<void>;
  // Indisponibilidade
  addUnavailability: (startDate: string, endDate: string, reason?: string) => Promise<void>;
  deleteUnavailability: (id: string) => Promise<void>;
  // Troca de Escala
  requestSwap: (eventId: string, slotId: string, notes?: string) => Promise<void>;
  acceptSwap: (swapId: string) => Promise<void>;
  approveSwap: (swapId: string) => Promise<void>;
  // Notificações
  sendNotification: (title: string, message: string, targetMemberId?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  // Dados de Demonstração e Alternância de Visão
  seedSampleData: () => Promise<void>;
  switchDemoRole: (role: 'leader' | 'volunteer' | null) => void;
  simulatedRole: 'leader' | 'volunteer' | null;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

function logSnapshotError(err: unknown, op: OperationType, path: string) {
  console.warn(`Firestore (${op}) em "${path}":`, err instanceof Error ? err.message : String(err));
}

function toFriendlyFirestoreError(err: unknown, fallbackMsg: string): Error {
  const code = (err as { code?: string })?.code || '';
  const rawMsg = err instanceof Error ? err.message : String(err || '');
  if (code === 'permission-denied' || rawMsg.includes('Missing or insufficient permissions')) {
    return new Error(
      'Permissão negada no banco de dados. Verifique se você está autenticado como Líder/Administrador (e não em "Visão Voluntário").'
    );
  }
  if (code === 'unavailable' || rawMsg.includes('offline')) {
    return new Error('Sem conexão com o servidor. Verifique sua internet e tente novamente.');
  }
  if (err instanceof Error && err.message) {
    return err;
  }
  return new Error(fallbackMsg);
}

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [church, setChurch] = useState<Church | null>(null);
  const [allChurches, setAllChurches] = useState<Church[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [loadingChurch, setLoadingChurch] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState<'leader' | 'volunteer' | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [events, setEvents] = useState<EventSchedule[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const isSuperAdmin = useMemo(() => {
    return currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL && !currentUser?.isCustomAuth;
  }, [currentUser]);

  // Carrega todas as igrejas para o Super Admin
  const refreshChurches = async () => {
    if (!currentUser || currentUser.isCustomAuth) return;
    try {
      const churchesRef = collection(db, 'churches');
      const snap = await getDocs(query(churchesRef, limit(50)));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Church));
      setAllChurches(list);
    } catch (err) {
      console.warn('Erro ao listar todas as igrejas:', err);
    }
  };

  // 1. Localiza a igreja do usuário logado
  useEffect(() => {
    if (!currentUser) {
      setChurch(null);
      setAllChurches([]);
      setCurrentMember(null);
      setLoadingChurch(false);
      return;
    }

    // Usuários em fallback local sem sessão Firebase Auth ficam com registro pendente local seguro
    if (currentUser.isCustomAuth) {
      const localChurch: Church = {
        id: 'igreja_central',
        name: 'Ministério de Mídia Central',
        inviteCode: 'MIDIA2026',
        leaderId: 'superadmin',
        createdAt: new Date().toISOString(),
      };
      setChurch(localChurch);
      setAllChurches([localChurch]);
      setCurrentMember({
        id: currentUser.uid,
        churchId: localChurch.id,
        userId: currentUser.uid,
        name: currentUser.displayName || 'Voluntário',
        email: currentUser.email || '',
        phone: '',
        role: 'volunteer',
        active: false,
        approvalStatus: 'pending',
        createdAt: new Date().toISOString(),
      });
      setLoadingChurch(false);
      return;
    }

    setLoadingChurch(true);
    let isSubscribed = true;

    async function resolveChurch() {
      try {
        const churchesRef = collection(db, 'churches');
        const q = query(churchesRef, limit(50));
        const snap = await getDocs(q);

        const loadedChurches = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Church));
        if (isSubscribed) {
          setAllChurches(loadedChurches);
        }

        let userChurch: Church | null = null;
        let memberDoc: Member | null = null;
        const isSuper = currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL && !currentUser?.isCustomAuth;

        if (loadedChurches.length > 0) {
          for (const cData of loadedChurches) {
            if (cData.leaderId === currentUser?.uid || isSuper) {
              userChurch = cData;
              break;
            }
            const mDoc = await getDoc(doc(db, `churches/${cData.id}/members/${currentUser?.uid}`));
            if (mDoc.exists()) {
              userChurch = cData;
              memberDoc = { id: mDoc.id, ...mDoc.data() } as Member;
              break;
            }
          }
          if (!userChurch && loadedChurches.length > 0) {
            userChurch = loadedChurches[0];
          }
        }

        // Provisiona igreja inicial somente se ainda não houver e o usuário for Super Admin
        if (!userChurch && isSuper) {
          const newChurchId = 'igreja_central';
          const initialChurch: Church = {
            id: newChurchId,
            name: 'Ministério de Mídia Central',
            inviteCode: 'MIDIA2026',
            leaderId: currentUser?.uid || 'admin',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'churches', newChurchId), initialChurch);
          userChurch = initialChurch;
          if (isSubscribed) {
            setAllChurches([initialChurch]);
          }
        }

        if (isSubscribed && userChurch) {
          setChurch(userChurch);

          const memberRef = doc(db, `churches/${userChurch.id}/members/${currentUser?.uid}`);
          const currentMDoc = await getDoc(memberRef);

          if (currentMDoc.exists()) {
            memberDoc = { id: currentMDoc.id, ...currentMDoc.data() } as Member;
            if (isSuper && (memberDoc.role !== 'superadmin' || memberDoc.approvalStatus !== 'approved' || !memberDoc.active)) {
              memberDoc.role = 'superadmin';
              memberDoc.approvalStatus = 'approved';
              memberDoc.active = true;
              await updateDoc(memberRef, { role: 'superadmin', approvalStatus: 'approved', active: true });
            }
          } else {
            const isChurchOwner = userChurch.leaderId === currentUser?.uid;
            const newMember: Member = {
              id: currentUser?.uid || 'user_default',
              churchId: userChurch.id,
              userId: currentUser?.uid,
              name: sanitizeText(
                currentUser?.displayName || currentUser?.email?.split('@')[0] || (isSuper ? 'João (Super Admin)' : 'Voluntário'),
                100
              ),
              email: sanitizeText(currentUser?.email || '', 120),
              phone: '',
              role: isSuper ? 'superadmin' : isChurchOwner ? 'ministry_admin' : 'volunteer',
              active: isSuper || isChurchOwner,
              approvalStatus: isSuper || isChurchOwner ? 'approved' : 'pending',
              createdAt: new Date().toISOString(),
            };
            await setDoc(memberRef, newMember);
            memberDoc = newMember;
          }

          if (isSubscribed) {
            setCurrentMember(memberDoc);
          }
        }
      } catch (err) {
        console.warn('Erro ao resolver igreja:', err);
      } finally {
        if (isSubscribed) setLoadingChurch(false);
      }
    }

    resolveChurch();

    return () => {
      isSubscribed = false;
    };
  }, [currentUser]);

  // 1b. Escuta o próprio perfil do membro em tempo real (permite liberar usuário pendente assim que ADM aprovar)
  useEffect(() => {
    if (!church?.id || !currentUser || currentUser.isCustomAuth) return;
    const memberRef = doc(db, `churches/${church.id}/members/${currentUser.uid}`);
    const unsubSelf = onSnapshot(
      memberRef,
      (snap) => {
        if (snap.exists()) {
          setCurrentMember({ id: snap.id, ...snap.data() } as Member);
        }
      },
      (err) => logSnapshotError(err, OperationType.GET, `churches/${church.id}/members/${currentUser.uid}`)
    );
    return () => unsubSelf();
  }, [church?.id, currentUser]);

  // 2. Assinatura em tempo real apenas quando membro estiver aprovado (evita permission-denied em conta pendente)
  const canReadChurchData = Boolean(
    church?.id &&
      currentUser &&
      !currentUser.isCustomAuth &&
      (isSuperAdmin ||
        (currentMember &&
          currentMember.active &&
          currentMember.approvalStatus !== 'pending' &&
          currentMember.approvalStatus !== 'rejected'))
  );

  useEffect(() => {
    if (!church?.id || !canReadChurchData) {
      setMembers([]);
      setEquipments([]);
      setSkills([]);
      setEvents([]);
      setSlots([]);
      setUnavailabilities([]);
      setSwaps([]);
      setNotifications([]);
      return;
    }

    const churchId = church.id;

    const unsubMembers = onSnapshot(
      query(collection(db, `churches/${churchId}/members`), limit(50)),
      (snap) => {
        setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member)));
      },
      (err) => logSnapshotError(err, OperationType.LIST, `churches/${churchId}/members`)
    );

    const unsubEquipments = onSnapshot(
      query(collection(db, `churches/${churchId}/equipments`), limit(50)),
      (snap) => {
        setEquipments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Equipment)));
      },
      (err) => logSnapshotError(err, OperationType.LIST, `churches/${churchId}/equipments`)
    );

    const unsubSkills = onSnapshot(
      query(collection(db, `churches/${churchId}/skills`), limit(200)),
      (snap) => {
        setSkills(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Skill)));
      },
      (err) => logSnapshotError(err, OperationType.LIST, `churches/${churchId}/skills`)
    );

    const unsubEvents = onSnapshot(
      query(collection(db, `churches/${churchId}/events`), limit(50)),
      (snap) => {
        const evs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventSchedule));
        evs.sort((a, b) => a.date.localeCompare(b.date));
        setEvents(evs);
      },
      (err) => logSnapshotError(err, OperationType.LIST, `churches/${churchId}/events`)
    );

    const unsubUnavailability = onSnapshot(
      query(collection(db, `churches/${churchId}/unavailability`), limit(50)),
      (snap) => {
        setUnavailabilities(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Unavailability)));
      },
      (err) => logSnapshotError(err, OperationType.LIST, `churches/${churchId}/unavailability`)
    );

    const unsubSwaps = onSnapshot(
      query(collection(db, `churches/${churchId}/swaps`), limit(50)),
      (snap) => {
        setSwaps(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SwapRequest)));
      },
      (err) => logSnapshotError(err, OperationType.LIST, `churches/${churchId}/swaps`)
    );

    const unsubNotifications = onSnapshot(
      query(collection(db, `churches/${churchId}/notifications`), limit(50)),
      (snap) => {
        const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
        notifs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setNotifications(notifs);
      },
      (err) => logSnapshotError(err, OperationType.LIST, `churches/${churchId}/notifications`)
    );

    return () => {
      unsubMembers();
      unsubEquipments();
      unsubSkills();
      unsubEvents();
      unsubUnavailability();
      unsubSwaps();
      unsubNotifications();
    };
  }, [church?.id, canReadChurchData]);

  // 3. Ouvinte de Slots em cada evento ativo
  useEffect(() => {
    if (!church?.id || !canReadChurchData || events.length === 0) {
      setSlots([]);
      return;
    }

    const unsubs: (() => void)[] = [];
    const churchId = church.id;

    events.forEach((ev) => {
      const unsub = onSnapshot(
        collection(db, `churches/${churchId}/events/${ev.id}/slots`),
        (snap) => {
          setSlots((prev) => {
            const otherSlots = prev.filter((s) => s.eventId !== ev.id);
            const currentEventSlots = snap.docs.map(
              (d) => ({ id: d.id, ...d.data() } as Slot)
            );
            return [...otherSlots, ...currentEventSlots];
          });
        },
        (err) => logSnapshotError(err, OperationType.LIST, `churches/${churchId}/events/${ev.id}/slots`)
      );
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [church?.id, canReadChurchData, events]);

  const switchDemoRole = (role: 'leader' | 'volunteer' | null) => {
    setSimulatedRole(role);
  };

  const isMinistryAdmin = useMemo(() => {
    if (simulatedRole) return simulatedRole === 'leader';
    if (isSuperAdmin) return true;
    if (church && church.leaderId === currentUser?.uid) return true;
    return currentMember?.role === 'ministry_admin' || currentMember?.role === 'superadmin';
  }, [isSuperAdmin, church, currentUser, currentMember, simulatedRole]);

  const isLeader = useMemo(() => {
    if (simulatedRole) return simulatedRole === 'leader';
    if (isMinistryAdmin) return true;
    return currentMember?.role === 'leader';
  }, [isMinistryAdmin, currentMember, simulatedRole]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(
      (n) => !n.read && (!n.targetMemberId || n.targetMemberId === currentMember?.id)
    ).length;
  }, [notifications, currentMember]);

  const pendingMembers = useMemo(() => {
    return members.filter((m) => m.approvalStatus === 'pending');
  }, [members]);

  // Ações da Igreja (Criação restrita ao Super Admin)
  const createChurch = async (name: string) => {
    if (!currentUser) return;
    if (!isSuperAdmin) {
      throw new Error(
        'Apenas o Administrador Geral do site (joao.gls000@gmail.com) tem permissão para cadastrar novas igrejas.'
      );
    }
    const cleanName = assertSafeText(name, 'Nome da Igreja', 100);
    if (cleanName.length < 2) {
      throw new Error('O nome da igreja deve ter pelo menos 2 caracteres.');
    }

    const churchId = `igreja_${Date.now()}`;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newChurch: Church = {
      id: churchId,
      name: cleanName,
      inviteCode: code,
      leaderId: currentUser.uid,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'churches', churchId), newChurch);
    const memberRef = doc(db, `churches/${churchId}/members/${currentUser.uid}`);
    const adminMember: Member = {
      id: currentUser.uid,
      churchId,
      userId: currentUser.uid,
      name: sanitizeText(currentUser.displayName || 'João (Super Admin)', 100),
      email: sanitizeText(currentUser.email || '', 120),
      phone: '',
      role: 'superadmin',
      active: true,
      approvalStatus: 'approved',
      createdAt: new Date().toISOString(),
    };
    await setDoc(memberRef, adminMember);
    setChurch(newChurch);
    setCurrentMember(adminMember);
    setAllChurches((prev) => [...prev, newChurch]);
  };

  // Alternar entre congregações (apenas Super Admin ou membro já vinculado)
  const switchChurch = async (targetChurchId: string) => {
    if (!currentUser || !isValidFirestoreId(targetChurchId)) return;
    const targetDoc = await getDoc(doc(db, 'churches', targetChurchId));
    if (!targetDoc.exists()) throw new Error('Igreja não encontrada.');
    const target = { id: targetDoc.id, ...targetDoc.data() } as Church;

    const memberRef = doc(db, `churches/${target.id}/members/${currentUser.uid}`);
    const mDoc = await getDoc(memberRef);
    if (!isSuperAdmin && !mDoc.exists()) {
      throw new Error('Você não possui vínculo com esta congregação.');
    }

    let targetMember: Member;
    if (mDoc.exists()) {
      targetMember = { id: mDoc.id, ...mDoc.data() } as Member;
      if (isSuperAdmin && (targetMember.role !== 'superadmin' || targetMember.approvalStatus !== 'approved')) {
        targetMember.role = 'superadmin';
        targetMember.approvalStatus = 'approved';
        targetMember.active = true;
        await updateDoc(memberRef, { role: 'superadmin', approvalStatus: 'approved', active: true });
      }
    } else {
      targetMember = {
        id: currentUser.uid,
        churchId: target.id,
        userId: currentUser.uid,
        name: sanitizeText(currentUser.displayName || 'João (Super Admin)', 100),
        email: sanitizeText(currentUser.email || '', 120),
        phone: '',
        role: 'superadmin',
        active: true,
        approvalStatus: 'approved',
        createdAt: new Date().toISOString(),
      };
      await setDoc(memberRef, targetMember);
    }

    setChurch(target);
    setCurrentMember(targetMember);
  };

  // Editar nome ou código da igreja
  const updateChurch = async (churchId: string, data: { name?: string; inviteCode?: string }) => {
    if (!isSuperAdmin) throw new Error('Apenas o Super Admin pode editar dados cadastrais de igrejas.');
    if (!isValidFirestoreId(churchId)) throw new Error('Identificador de igreja inválido.');

    const payload: { name?: string; inviteCode?: string } = {};
    if (data.name !== undefined) {
      const cleanName = assertSafeText(data.name, 'Nome da Igreja', 100);
      if (cleanName.length < 2) throw new Error('Nome da igreja muito curto.');
      payload.name = cleanName;
    }
    if (data.inviteCode !== undefined) {
      const cleanCode = assertSafeText(data.inviteCode, 'Código de Convite', 32).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (cleanCode.length < 3) throw new Error('Código de convite deve ter pelo menos 3 caracteres.');
      payload.inviteCode = cleanCode;
    }

    const churchRef = doc(db, 'churches', churchId);
    await updateDoc(churchRef, payload);
    setAllChurches((prev) =>
      prev.map((c) => (c.id === churchId ? { ...c, ...payload } : c))
    );
    if (church?.id === churchId) {
      setChurch((prev) => (prev ? { ...prev, ...payload } : null));
    }
  };

  // Excluir igreja (Super Admin)
  const deleteChurch = async (churchId: string) => {
    if (!isSuperAdmin) throw new Error('Apenas o Super Admin pode excluir igrejas do sistema.');
    if (!isValidFirestoreId(churchId)) throw new Error('Identificador de igreja inválido.');
    if (allChurches.length <= 1) {
      throw new Error('Não é possível excluir a única igreja cadastrada no sistema.');
    }
    await deleteDoc(doc(db, 'churches', churchId));
    const remaining = allChurches.filter((c) => c.id !== churchId);
    setAllChurches(remaining);

    if (church?.id === churchId && remaining.length > 0) {
      await switchChurch(remaining[0].id);
    }
  };

  const joinChurchByCode = async (inviteCode: string): Promise<boolean> => {
    const activeUser =
      currentUser ||
      (auth.currentUser
        ? {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName,
            isCustomAuth: false,
          }
        : null);

    if (!activeUser) return false;
    if (activeUser.isCustomAuth) {
      throw new Error(
        'Para ingressar em uma igreja da nuvem pelo código de convite, autentique-se com "Continuar com o Google".'
      );
    }
    const cleanCode = assertSafeText(inviteCode, 'Código de Convite', 32).toUpperCase();
    const churchesRef = collection(db, 'churches');
    const snap = await getDocs(query(churchesRef, limit(50)));
    const target = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Church))
      .find((c) => c.inviteCode.toUpperCase() === cleanCode);

    if (!target) return false;

    const isTargetSuperAdmin =
      activeUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL && !activeUser.isCustomAuth;

    const memberRef = doc(db, `churches/${target.id}/members/${activeUser.uid}`);
    const newMember: Member = {
      id: activeUser.uid,
      churchId: target.id,
      userId: activeUser.uid,
      name: sanitizeText(activeUser.displayName || activeUser.email?.split('@')[0] || 'Voluntário', 100),
      email: sanitizeText(activeUser.email || '', 120),
      phone: '',
      role: isTargetSuperAdmin ? 'superadmin' : 'volunteer',
      active: isTargetSuperAdmin,
      approvalStatus: isTargetSuperAdmin ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
    };
    await setDoc(memberRef, newMember);
    setChurch(target);
    setCurrentMember(newMember);

    try {
      const notifId = `notif_join_${Date.now()}`;
      await setDoc(doc(db, `churches/${target.id}/notifications`, notifId), {
        id: notifId,
        churchId: target.id,
        title: 'Novo Membro Solicitando Acesso',
        message: `${newMember.name} solicitou ingresso na equipe de mídia. Acesse a aba Voluntários para aprovar ou rejeitar.`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Erro ao disparar notificação de aprovação:', e);
    }

    return true;
  };

  // Aprovar voluntário
  const approveMember = async (id: string) => {
    if (!church) throw new Error('Nenhuma igreja ativa.');
    if (!isLeader) throw new Error('Sem permissão de líder para aprovar voluntários.');
    if (!isSafeDocId(id)) throw new Error('Identificador de voluntário inválido.');

    try {
      const memberRef = doc(db, `churches/${church.id}/members`, id);
      await updateDoc(memberRef, {
        active: true,
        approvalStatus: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: sanitizeText(currentUser?.displayName || currentUser?.email || 'Administrador', 120),
      });
    } catch (err) {
      throw toFriendlyFirestoreError(err, 'Não foi possível aprovar este voluntário.');
    }

    try {
      const notifId = `notif_appr_${Date.now()}`;
      await setDoc(doc(db, `churches/${church.id}/notifications`, notifId), {
        id: notifId,
        churchId: church.id,
        targetMemberId: id,
        title: 'Acesso Aprovado!',
        message: 'Sua solicitação de ingresso foi aprovada pela liderança. Agora você tem acesso às escalas e aos equipamentos.',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Erro ao notificar membro aprovado:', e);
    }
  };

  // Rejeitar voluntário
  const rejectMember = async (id: string) => {
    if (!church) throw new Error('Nenhuma igreja ativa.');
    if (!isLeader) throw new Error('Sem permissão de líder para negar voluntários.');
    if (!isSafeDocId(id)) throw new Error('Identificador de voluntário inválido.');

    try {
      const memberRef = doc(db, `churches/${church.id}/members`, id);
      await updateDoc(memberRef, {
        active: false,
        approvalStatus: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: sanitizeText(currentUser?.displayName || currentUser?.email || 'Administrador', 120),
      });
    } catch (err) {
      throw toFriendlyFirestoreError(err, 'Não foi possível recusar este voluntário.');
    }
  };

  // CRUD Membros
  const addMember = async (data: Omit<Member, 'id' | 'churchId' | 'createdAt'>) => {
    if (!church || !isLeader) {
      throw new Error('Apenas líderes e administradores podem cadastrar voluntários.');
    }
    if (!isSuperAdmin && data.role === 'superadmin') {
      throw new Error('Permissão negada: apenas o Super Admin pode atribuir o papel de Super Admin.');
    }
    if (!isMinistryAdmin && data.role === 'ministry_admin') {
      throw new Error('Permissão negada: apenas o Adm do Ministério pode atribuir o papel de Adm do Ministério.');
    }

    const cleanName = assertSafeText(data.name, 'Nome', 100);
    const cleanEmail = data.email ? assertSafeText(data.email, 'E-mail', 120) : '';
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      throw new Error('Formato de e-mail inválido.');
    }
    const cleanPhone = sanitizePhone(data.phone || '');
    const cleanNotes = data.notes ? assertSafeText(data.notes, 'Observações', 500) : '';

    const id = `member_${Date.now()}`;
    const member: Member = {
      id,
      churchId: church.id,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: data.role,
      active: Boolean(data.active),
      approvalStatus: 'approved',
      notes: cleanNotes,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, `churches/${church.id}/members`, id), member);
    return id;
  };

  const updateMember = async (id: string, data: Partial<Member>) => {
    if (!church || !isLeader || !isValidFirestoreId(id)) return;
    const target = members.find((m) => m.id === id);
    if (target?.role === 'superadmin' && !isSuperAdmin) {
      throw new Error('Permissão negada para alterar o Super Admin.');
    }
    if (!isSuperAdmin && data.role === 'superadmin') {
      throw new Error('Permissão negada para promover a Super Admin.');
    }
    if (!isMinistryAdmin && data.role === 'ministry_admin') {
      throw new Error('Permissão negada para promover a Adm do Ministério.');
    }

    const payload: Partial<Member> = {};
    if (data.name !== undefined) payload.name = assertSafeText(data.name, 'Nome', 100);
    if (data.email !== undefined) {
      const cleanEmail = assertSafeText(data.email, 'E-mail', 120);
      if (cleanEmail && !isValidEmail(cleanEmail)) throw new Error('Formato de e-mail inválido.');
      payload.email = cleanEmail;
    }
    if (data.phone !== undefined) payload.phone = sanitizePhone(data.phone);
    if (data.role !== undefined) payload.role = data.role;
    if (data.active !== undefined) payload.active = Boolean(data.active);
    if (data.notes !== undefined) payload.notes = assertSafeText(data.notes, 'Observações', 500);

    await updateDoc(doc(db, `churches/${church.id}/members`, id), payload);
  };

  const deleteMember = async (id: string) => {
    if (!church) {
      throw new Error('Nenhuma igreja ativa encontrada.');
    }
    if (!isLeader) {
      throw new Error(
        'Sem permissão para excluir voluntários. Caso tenha ativado a "Visão Voluntário" no menu superior, retorne para a "Visão Líder".'
      );
    }
    if (!isSafeDocId(id)) {
      throw new Error('Identificador de usuário inválido.');
    }
    if (id === currentMember?.id || id === currentUser?.uid) {
      throw new Error('Você não pode excluir o seu próprio usuário enquanto estiver conectado.');
    }

    const target = members.find((m) => m.id === id);
    if (target?.role === 'superadmin' && !isSuperAdmin) {
      throw new Error('O Super Admin não pode ser removido.');
    }

    try {
      await deleteDoc(doc(db, `churches/${church.id}/members`, id));
    } catch (err) {
      throw toFriendlyFirestoreError(err, 'Não foi possível excluir o usuário.');
    }

    // Limpeza em cascata de vínculos órfãos (habilidades, vagas escaladas, indisponibilidades e conta local)
    const cleanupTasks: Promise<unknown>[] = [];

    skills
      .filter((sk) => sk.memberId === id)
      .forEach((sk) => {
        cleanupTasks.push(deleteDoc(doc(db, `churches/${church.id}/skills`, sk.id)));
      });

    slots
      .filter((sl) => sl.memberId === id)
      .forEach((sl) => {
        cleanupTasks.push(
          updateDoc(doc(db, `churches/${church.id}/events/${sl.eventId}/slots`, sl.id), {
            memberId: '',
            status: 'pending',
            declineReason: '',
            updatedAt: new Date().toISOString(),
          })
        );
      });

    unavailabilities
      .filter((u) => u.memberId === id)
      .forEach((u) => {
        cleanupTasks.push(deleteDoc(doc(db, `churches/${church.id}/unavailability`, u.id)));
      });

    if (target?.email) {
      removeLocalAccountByEmail(target.email);
    }

    if (cleanupTasks.length > 0) {
      await Promise.allSettled(cleanupTasks);
    }
  };

  // CRUD Equipamentos
  const addEquipment = async (data: Omit<Equipment, 'id' | 'churchId' | 'createdAt'>) => {
    if (!church || !isLeader) {
      throw new Error('Apenas líderes podem cadastrar equipamentos.');
    }
    const cleanName = assertSafeText(data.name, 'Nome do Equipamento', 100);
    const cleanDesc = data.description ? assertSafeText(data.description, 'Descrição', 300) : '';

    const id = `eq_${Date.now()}`;
    const eq: Equipment = {
      id,
      churchId: church.id,
      name: cleanName,
      category: data.category,
      description: cleanDesc,
      status: data.status,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, `churches/${church.id}/equipments`, id), eq);
  };

  const updateEquipment = async (id: string, data: Partial<Equipment>) => {
    if (!church || !isLeader || !isValidFirestoreId(id)) return;
    const payload: Partial<Equipment> = {};
    if (data.name !== undefined) payload.name = assertSafeText(data.name, 'Nome do Equipamento', 100);
    if (data.category !== undefined) payload.category = data.category;
    if (data.status !== undefined) payload.status = data.status;
    if (data.description !== undefined) payload.description = assertSafeText(data.description, 'Descrição', 300);

    await updateDoc(doc(db, `churches/${church.id}/equipments`, id), payload);
  };

  const deleteEquipment = async (id: string) => {
    if (!church) throw new Error('Nenhuma igreja ativa.');
    if (!isLeader) throw new Error('Sem permissão para remover equipamentos.');
    if (!isSafeDocId(id)) throw new Error('Identificador de equipamento inválido.');
    try {
      await deleteDoc(doc(db, `churches/${church.id}/equipments`, id));
    } catch (err) {
      throw toFriendlyFirestoreError(err, 'Não foi possível excluir o equipamento.');
    }
  };

  // Habilitações (Skills Matrix)
  const setSkillLevel = async (
    memberId: string,
    equipmentId: string,
    level: SkillLevel | null
  ) => {
    if (!church || !isLeader) return;
    if (!isValidFirestoreId(memberId) || !isValidFirestoreId(equipmentId)) return;

    const skillId = `${memberId}_${equipmentId}`;
    const skillRef = doc(db, `churches/${church.id}/skills`, skillId);
    if (!level) {
      await deleteDoc(skillRef);
    } else {
      const skillData: Skill = {
        id: skillId,
        churchId: church.id,
        memberId,
        equipmentId,
        level,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(skillRef, skillData);
    }
  };

  const getSkillLevel = (memberId: string, equipmentId: string): SkillLevel | null => {
    const s = skills.find((sk) => sk.memberId === memberId && sk.equipmentId === equipmentId);
    return s ? s.level : null;
  };

  // Eventos / Cultos
  const addEvent = async (
    data: Omit<EventSchedule, 'id' | 'churchId' | 'createdAt'>
  ): Promise<string> => {
    if (!church || !isLeader) throw new Error('Sem permissão para criar eventos.');
    const cleanTitle = assertSafeText(data.title, 'Título do Evento', 120);
    if (!isValidDateStr(data.date)) throw new Error('Data do culto inválida.');
    if (!isValidTimeStr(data.startTime)) throw new Error('Horário de início inválido.');
    if (data.endTime && !isValidTimeStr(data.endTime)) throw new Error('Horário de término inválido.');
    const cleanNotes = data.notes ? assertSafeText(data.notes, 'Observações', 500) : '';

    const id = `event_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const ev: EventSchedule = {
      id,
      churchId: church.id,
      title: cleanTitle,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime || '',
      type: data.type,
      notes: cleanNotes,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, `churches/${church.id}/events`, id), ev);
    return id;
  };

  const updateEvent = async (id: string, data: Partial<EventSchedule>) => {
    if (!church || !isLeader || !isValidFirestoreId(id)) return;
    const payload: Partial<EventSchedule> = {};
    if (data.title !== undefined) payload.title = assertSafeText(data.title, 'Título do Evento', 120);
    if (data.date !== undefined) {
      if (!isValidDateStr(data.date)) throw new Error('Data inválida.');
      payload.date = data.date;
    }
    if (data.startTime !== undefined) {
      if (!isValidTimeStr(data.startTime)) throw new Error('Horário de início inválido.');
      payload.startTime = data.startTime;
    }
    if (data.endTime !== undefined) {
      if (data.endTime && !isValidTimeStr(data.endTime)) throw new Error('Horário de término inválido.');
      payload.endTime = data.endTime;
    }
    if (data.type !== undefined) payload.type = data.type;
    if (data.notes !== undefined) payload.notes = assertSafeText(data.notes, 'Observações', 500);

    await updateDoc(doc(db, `churches/${church.id}/events`, id), payload);
  };

  const deleteEvent = async (id: string) => {
    if (!church) throw new Error('Nenhuma igreja ativa.');
    if (!isLeader) throw new Error('Sem permissão para excluir cultos.');
    if (!isSafeDocId(id)) throw new Error('Identificador de culto inválido.');
    try {
      await deleteDoc(doc(db, `churches/${church.id}/events`, id));
    } catch (err) {
      throw toFriendlyFirestoreError(err, 'Não foi possível excluir o culto.');
    }
  };

  // Slots na Escala
  const addSlot = async (
    eventId: string,
    data: Omit<Slot, 'id' | 'churchId' | 'eventId' | 'updatedAt'>
  ) => {
    if (!church || !isLeader || !isValidFirestoreId(eventId)) return;
    if (!isValidFirestoreId(data.equipmentId)) throw new Error('Equipamento inválido.');

    const cleanRoleName = assertSafeText(data.roleName, 'Função na Escala', 80);
    const id = `slot_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const slot: Slot = {
      id,
      churchId: church.id,
      eventId,
      roleName: cleanRoleName,
      equipmentId: data.equipmentId,
      memberId: data.memberId || '',
      status: data.status,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, `churches/${church.id}/events/${eventId}/slots`, id), slot);

    if (data.memberId) {
      const ev = events.find((e) => e.id === eventId);
      await sendNotification(
        'Você foi escalado!',
        `Você foi escalado como ${cleanRoleName} no culto de ${ev?.date || 'data próxima'}.`,
        data.memberId
      );
    }
  };

  const updateSlot = async (eventId: string, slotId: string, data: Partial<Slot>) => {
    if (!church || !isLeader) return;
    if (!isValidFirestoreId(eventId) || !isValidFirestoreId(slotId)) return;

    const payload: Partial<Slot> = {
      updatedAt: new Date().toISOString(),
    };
    if (data.roleName !== undefined) payload.roleName = assertSafeText(data.roleName, 'Função na Escala', 80);
    if (data.equipmentId !== undefined) {
      if (!isValidFirestoreId(data.equipmentId)) throw new Error('Equipamento inválido.');
      payload.equipmentId = data.equipmentId;
    }
    if (data.memberId !== undefined) payload.memberId = data.memberId || '';
    if (data.status !== undefined) payload.status = data.status;
    if (data.declineReason !== undefined) {
      payload.declineReason = assertSafeText(data.declineReason, 'Motivo', 300);
    }

    await updateDoc(doc(db, `churches/${church.id}/events/${eventId}/slots`, slotId), payload);
  };

  const deleteSlot = async (eventId: string, slotId: string) => {
    if (!church) throw new Error('Nenhuma igreja ativa.');
    if (!isLeader) throw new Error('Sem permissão para remover posições da escala.');
    if (!isSafeDocId(eventId) || !isSafeDocId(slotId)) throw new Error('Identificador da vaga inválido.');
    try {
      await deleteDoc(doc(db, `churches/${church.id}/events/${eventId}/slots`, slotId));
    } catch (err) {
      throw toFriendlyFirestoreError(err, 'Não foi possível remover esta posição.');
    }
  };

  const confirmSlot = async (eventId: string, slotId: string) => {
    if (!church || !isValidFirestoreId(eventId) || !isValidFirestoreId(slotId)) return;
    await updateDoc(doc(db, `churches/${church.id}/events/${eventId}/slots`, slotId), {
      status: 'confirmed',
      declineReason: '',
      updatedAt: new Date().toISOString(),
    });
    const ev = events.find((e) => e.id === eventId);
    await sendNotification(
      'Presença Confirmada',
      `${currentMember?.name || 'Voluntário'} confirmou presença na escala de ${ev?.date || 'culto'}.`
    );
  };

  const declineSlot = async (eventId: string, slotId: string, reason: string) => {
    if (!church || !isValidFirestoreId(eventId) || !isValidFirestoreId(slotId)) return;
    const cleanReason = assertSafeText(reason, 'Motivo da Recusa', 300);
    if (!cleanReason) throw new Error('Por favor, informe o motivo da recusa.');

    await updateDoc(doc(db, `churches/${church.id}/events/${eventId}/slots`, slotId), {
      status: 'declined',
      declineReason: cleanReason,
      updatedAt: new Date().toISOString(),
    });
    const ev = events.find((e) => e.id === eventId);
    await sendNotification(
      'Escala Recusada',
      `${currentMember?.name || 'Voluntário'} não poderá servir no culto de ${ev?.date || 'culto'}. Motivo: ${cleanReason}`
    );
  };

  // Indisponibilidade
  const addUnavailability = async (startDate: string, endDate: string, reason?: string) => {
    if (!church || !currentMember) return;
    if (!isValidDateStr(startDate) || !isValidDateStr(endDate)) {
      throw new Error('Datas de indisponibilidade inválidas.');
    }
    if (endDate < startDate) {
      throw new Error('A data de término não pode ser anterior à data de início.');
    }
    const cleanReason = reason ? assertSafeText(reason, 'Motivo', 300) : '';

    const id = `unavail_${Date.now()}`;
    const unavail: Unavailability = {
      id,
      churchId: church.id,
      memberId: currentMember.id,
      startDate,
      endDate,
      reason: cleanReason,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, `churches/${church.id}/unavailability`, id), unavail);
  };

  const deleteUnavailability = async (id: string) => {
    if (!church) throw new Error('Nenhuma igreja ativa.');
    if (!isSafeDocId(id)) throw new Error('Identificador de indisponibilidade inválido.');
    try {
      await deleteDoc(doc(db, `churches/${church.id}/unavailability`, id));
    } catch (err) {
      throw toFriendlyFirestoreError(err, 'Não foi possível remover a indisponibilidade.');
    }
  };

  // Pedidos de Troca
  const requestSwap = async (eventId: string, slotId: string, notes?: string) => {
    if (!church || !currentMember) return;
    if (!isValidFirestoreId(eventId) || !isValidFirestoreId(slotId)) return;

    const cleanNotes = notes ? assertSafeText(notes, 'Observações da Troca', 300) : '';
    const id = `swap_${Date.now()}`;
    const swap: SwapRequest = {
      id,
      churchId: church.id,
      eventId,
      slotId,
      requesterMemberId: currentMember.id,
      status: 'open',
      notes: cleanNotes,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, `churches/${church.id}/swaps`, id), swap);
    const ev = events.find((e) => e.id === eventId);
    const slot = slots.find((s) => s.id === slotId);
    await sendNotification(
      'Pedido de Troca Aberto',
      `${currentMember.name} solicitou substituição na posição ${slot?.roleName || 'na escala'} no culto de ${ev?.date || 'data próxima'}.`
    );
  };

  const acceptSwap = async (swapId: string) => {
    if (!church || !currentMember || !isValidFirestoreId(swapId)) return;
    const swap = swaps.find((s) => s.id === swapId);
    if (!swap || swap.status !== 'open') {
      throw new Error('Este pedido de troca não está mais disponível.');
    }
    if (swap.requesterMemberId === currentMember.id) {
      throw new Error('Você não pode cobrir o seu próprio pedido de troca.');
    }

    await updateDoc(doc(db, `churches/${church.id}/swaps`, swapId), {
      candidateMemberId: currentMember.id,
      status: 'accepted_by_peer',
    });
    await sendNotification(
      'Voluntário Disponível para Troca',
      `${currentMember.name} se ofereceu para cobrir a escala. Aguardando aprovação do líder.`
    );
  };

  const approveSwap = async (swapId: string) => {
    if (!church || !isLeader || !isValidFirestoreId(swapId)) return;
    const swap = swaps.find((s) => s.id === swapId);
    if (!swap || !swap.candidateMemberId) return;

    await updateDoc(
      doc(db, `churches/${church.id}/events/${swap.eventId}/slots`, swap.slotId),
      {
        memberId: swap.candidateMemberId,
        status: 'confirmed',
        updatedAt: new Date().toISOString(),
      }
    );

    await updateDoc(doc(db, `churches/${church.id}/swaps`, swapId), {
      status: 'approved',
    });

    const newMember = members.find((m) => m.id === swap.candidateMemberId);
    await sendNotification(
      'Troca Aprovada',
      `A troca foi aprovada pelo líder. ${newMember?.name || 'O voluntário'} assumiu a escala com sucesso!`
    );
  };

  // Notificações
  const sendNotification = async (title: string, message: string, targetMemberId?: string) => {
    if (!church) return;
    const id = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const notif: NotificationItem = {
      id,
      churchId: church.id,
      targetMemberId: targetMemberId || '',
      title: sanitizeText(title, 120),
      message: sanitizeText(message, 300),
      read: false,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, `churches/${church.id}/notifications`, id), notif);
  };

  const markNotificationRead = async (id: string) => {
    if (!church || !isValidFirestoreId(id)) return;
    await updateDoc(doc(db, `churches/${church.id}/notifications`, id), {
      read: true,
    });
  };

  // Seeder de Dados Demonstrativos para Ministério de Mídia
  const seedSampleData = async () => {
    if (!church || !isLeader) return;
    const churchId = church.id;

    const initialEquipments: Omit<Equipment, 'id' | 'churchId' | 'createdAt'>[] = [
      {
        name: 'Câmera 1 (Sony FX3 - Palco/Pastor)',
        category: 'video',
        description: 'Câmera principal fixa no tripé central com teleobjetiva 70-200mm',
        status: 'available',
      },
      {
        name: 'Câmera 2 (Sony A7IV - Lateral/Gimbal)',
        category: 'video',
        description: 'Câmera móvel para closes de louvor e tomadas dinâmicas',
        status: 'available',
      },
      {
        name: 'Mesa de Corte (Blackmagic ATEM Mini Pro)',
        category: 'broadcast',
        description: 'Switcher de corte de câmeras e transmissão ao vivo no YouTube',
        status: 'available',
      },
      {
        name: 'Mesa de Som PA (Behringer X32)',
        category: 'audio',
        description: 'Controle de áudio ambiente no templo e retorno de palco',
        status: 'available',
      },
      {
        name: 'Mesa de Som Transmissão (Yamaha TF5)',
        category: 'audio',
        description: 'Mixagem exclusiva da live com fone de referência flat',
        status: 'available',
      },
      {
        name: 'Projeção & Telão (Holyrics / ProPresenter)',
        category: 'projection',
        description: 'Notebook de projeção de versículos, avisos e vídeos no telão LED',
        status: 'available',
      },
      {
        name: 'Iluminação Cênica (Mesa DMX GrandMA onPC)',
        category: 'lighting',
        description: 'Controle de Moving Heads, Par LEDs e luz frontal dos ministrantes',
        status: 'available',
      },
    ];

    const createdEquips: Equipment[] = [];
    for (let i = 0; i < initialEquipments.length; i++) {
      const eqId = `eq_seed_${i + 1}`;
      const eqData: Equipment = {
        ...initialEquipments[i],
        id: eqId,
        churchId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, `churches/${churchId}/equipments`, eqId), eqData);
      createdEquips.push(eqData);
    }

    const sampleVolunteers = [
      {
        name: 'Lucas Ferreira',
        email: 'lucas.camera@gmail.com',
        phone: '(11) 98765-4321',
        role: 'volunteer' as const,
        active: true,
        approvalStatus: 'approved' as const,
        notes: 'Disponível domingos à noite e ensaios.',
      },
      {
        name: 'Camila Rocha',
        email: 'camila.projecao@gmail.com',
        phone: '(11) 99123-4567',
        role: 'volunteer' as const,
        active: true,
        approvalStatus: 'approved' as const,
        notes: 'Opera Holyrics e ProPresenter com excelência.',
      },
      {
        name: 'Gabriel Souza (Áudio)',
        email: 'gabriel.som@gmail.com',
        phone: '(11) 97345-6789',
        role: 'volunteer' as const,
        active: true,
        approvalStatus: 'approved' as const,
        notes: 'Técnico de áudio profissional, opera X32 e Yamaha.',
      },
      {
        name: 'Mariana Duarte',
        email: 'mariana.luz@gmail.com',
        phone: '(11) 98888-2233',
        role: 'volunteer' as const,
        active: true,
        approvalStatus: 'approved' as const,
        notes: 'Programação de cenas e iluminação de louvor.',
      },
      {
        name: 'Thiago Oliveira',
        email: 'thiago.corte@gmail.com',
        phone: '(11) 99777-4455',
        role: 'volunteer' as const,
        active: true,
        approvalStatus: 'approved' as const,
        notes: 'Diretor de TV e operador de switcher ATEM.',
      },
    ];

    const createdMembers: Member[] = [];
    for (let i = 0; i < sampleVolunteers.length; i++) {
      const mId = `mem_seed_${i + 1}`;
      const mData: Member = {
        ...sampleVolunteers[i],
        id: mId,
        churchId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, `churches/${churchId}/members`, mId), mData);
      createdMembers.push(mData);
    }

    const skillPairs: { memIdx: number; eqIdx: number; level: SkillLevel }[] = [
      { memIdx: 0, eqIdx: 0, level: 'instructor' },
      { memIdx: 0, eqIdx: 1, level: 'qualified' },
      { memIdx: 1, eqIdx: 5, level: 'instructor' },
      { memIdx: 1, eqIdx: 0, level: 'training' },
      { memIdx: 2, eqIdx: 3, level: 'instructor' },
      { memIdx: 2, eqIdx: 4, level: 'qualified' },
      { memIdx: 3, eqIdx: 6, level: 'qualified' },
      { memIdx: 4, eqIdx: 2, level: 'instructor' },
      { memIdx: 4, eqIdx: 0, level: 'qualified' },
    ];

    for (const pair of skillPairs) {
      const member = createdMembers[pair.memIdx];
      const eq = createdEquips[pair.eqIdx];
      if (member && eq) {
        const sId = `${member.id}_${eq.id}`;
        await setDoc(doc(db, `churches/${churchId}/skills`, sId), {
          id: sId,
          churchId,
          memberId: member.id,
          equipmentId: eq.id,
          level: pair.level,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const today = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(today.getDate() + ((7 - today.getDay()) % 7 || 7));
    const nextSundayStr = getLocalDateStr(nextSunday);

    const ev1Id = `ev_seed_1`;
    const ev1: EventSchedule = {
      id: ev1Id,
      churchId,
      title: 'Culto da Família (Noite)',
      date: nextSundayStr,
      startTime: '18:30',
      endTime: '20:30',
      type: 'sunday_service',
      notes: 'Santa Ceia e transmissão ao vivo no YouTube.',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, `churches/${churchId}/events`, ev1Id), ev1);

    const initialSlots = [
      {
        roleName: 'Câmera Principal (FX3)',
        equipmentId: createdEquips[0].id,
        memberId: createdMembers[0].id,
        status: 'confirmed' as const,
      },
      {
        roleName: 'Câmera 2 Móvel',
        equipmentId: createdEquips[1].id,
        memberId: currentMember?.id || createdMembers[4].id,
        status: 'pending' as const,
      },
      {
        roleName: 'Direção de Corte (ATEM)',
        equipmentId: createdEquips[2].id,
        memberId: createdMembers[4].id,
        status: 'confirmed' as const,
      },
      {
        roleName: 'Mesa Som PA',
        equipmentId: createdEquips[3].id,
        memberId: createdMembers[2].id,
        status: 'confirmed' as const,
      },
      {
        roleName: 'Projeção Holyrics',
        equipmentId: createdEquips[5].id,
        memberId: createdMembers[1].id,
        status: 'pending' as const,
      },
      {
        roleName: 'Iluminação Cênica',
        equipmentId: createdEquips[6].id,
        memberId: createdMembers[3].id,
        status: 'pending' as const,
      },
    ];

    for (let i = 0; i < initialSlots.length; i++) {
      const sId = `slot_seed_${i + 1}`;
      await setDoc(doc(db, `churches/${churchId}/events/${ev1Id}/slots`, sId), {
        ...initialSlots[i],
        id: sId,
        churchId,
        eventId: ev1Id,
        updatedAt: new Date().toISOString(),
      });
    }

    await sendNotification(
      'Bem-vindo ao MídiaEscala!',
      'O ministério de mídia está configurado com equipamentos, voluntários e o próximo culto já escalado.'
    );
  };

  return (
    <ChurchContext.Provider
      value={{
        church,
        allChurches,
        currentMember,
        isSuperAdmin,
        isMinistryAdmin,
        isLeader,
        loadingChurch,
        members,
        pendingMembers,
        equipments,
        skills,
        events,
        slots,
        unavailabilities,
        swaps,
        notifications,
        unreadNotificationsCount,
        createChurch,
        updateChurch,
        deleteChurch,
        switchChurch,
        joinChurchByCode,
        refreshChurches,
        addMember,
        updateMember,
        deleteMember,
        approveMember,
        rejectMember,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        setSkillLevel,
        getSkillLevel,
        addEvent,
        updateEvent,
        deleteEvent,
        addSlot,
        updateSlot,
        deleteSlot,
        confirmSlot,
        declineSlot,
        addUnavailability,
        deleteUnavailability,
        requestSwap,
        acceptSwap,
        approveSwap,
        sendNotification,
        markNotificationRead,
        seedSampleData,
        switchDemoRole,
        simulatedRole,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurch deve ser utilizado dentro de ChurchProvider');
  }
  return context;
};
