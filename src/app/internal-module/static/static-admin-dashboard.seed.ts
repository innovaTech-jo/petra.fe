import { UsersDto } from '../../core/models';
import { RoleDto } from '../../core/models';
import { RequestTypeDto } from '../../core/models';
import { InternalLocalStoreService } from '../services/internal-local-store.service';
import { RequestTypeLocalStoreService } from '../services/request-type-local-store.service';

export interface AdminDashboardCards {
  usersTotal: number;
  usersActive: number;
  rolesTotal: number;
  rolesActive: number;
  serviceTypesTotal: number;
  serviceTypesActive: number;
  serviceTypesWithWorkflow: number;
  integrationTotal: number;
  attachmentTotal: number;
  lookupTotal: number;
}

export interface AdminDashboardData {
  cards: AdminDashboardCards;
  usersBreakdown: { active: number; inactive: number };
  serviceBreakdown: { active: number; inactive: number; withWorkflow: number };
  moduleBar: { label: string; value: number }[];
  trend: {
    categories: string[];
    users: number[];
    roles: number[];
    serviceTypes: number[];
  };
}

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function localDayKey(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildTrendSeries(
  users: { createdDate?: string }[],
  roles: { createdDate?: string }[],
  services: { createdDate?: string }[],
  days = 7
): AdminDashboardData['trend'] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const categories: string[] = [];
  const keys: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    keys.push(localDayKey(d.toISOString())!);
    categories.push(d.toLocaleDateString('ar-JO', { weekday: 'short', day: 'numeric', month: 'numeric' }));
  }

  const countByDay = (items: { createdDate?: string }[]) => {
    const counts = new Array(days).fill(0);
    for (const item of items) {
      const key = localDayKey(item.createdDate);
      const idx = key ? keys.indexOf(key) : -1;
      if (idx >= 0) counts[idx]++;
    }
    return counts;
  };

  return {
    categories,
    users: countByDay(users),
    roles: countByDay(roles),
    serviceTypes: countByDay(services)
  };
}

function composeData(
  users: UsersDto[],
  roles: RoleDto[],
  serviceTypes: RequestTypeDto[],
  integrationTotal: number,
  attachmentTotal: number
): AdminDashboardData {
  const usersActive = users.filter((u) => u.active === 1).length;
  const rolesActive = roles.filter((r) => r.active === 1).length;
  const serviceActive = serviceTypes.filter((s) => s.active === 1).length;
  const withWorkflow = serviceTypes.filter(
    (s) => s.workFlowDefinitionId != null && s.workFlowDefinitionId > 0
  ).length;

  return {
    cards: {
      usersTotal: users.length,
      usersActive,
      rolesTotal: roles.length,
      rolesActive,
      serviceTypesTotal: serviceTypes.length,
      serviceTypesActive: serviceActive,
      serviceTypesWithWorkflow: withWorkflow,
      integrationTotal,
      attachmentTotal,
      lookupTotal: integrationTotal + attachmentTotal
    },
    usersBreakdown: { active: usersActive, inactive: users.length - usersActive },
    serviceBreakdown: {
      active: serviceActive,
      inactive: serviceTypes.length - serviceActive,
      withWorkflow
    },
    moduleBar: [
      { label: 'المستخدمون', value: users.length },
      { label: 'الأدوار', value: roles.length },
      { label: 'أنواع الخدمات', value: serviceTypes.length },
      { label: 'أنواع التكامل', value: integrationTotal },
      { label: 'أنواع المرفقات', value: attachmentTotal }
    ],
    trend: buildTrendSeries(users, roles, serviceTypes)
  };
}

/** Static demo when API mode or empty local stores. */
export function buildStaticAdminDashboardData(): AdminDashboardData {
  const users: UsersDto[] = [
    { id: 1, userName: 'admin', fullName: 'مسؤول النظام', active: 1, email: 'admin@petra.local', token: '', refreshToken: '', permssions: [], createdBy: 0, createdDate: daysAgoIso(6) },
    { id: 2, userName: 'ahmad', fullName: 'أحمد علي', active: 1, email: 'ahmad@petra.local', token: '', refreshToken: '', permssions: [], createdBy: 0, createdDate: daysAgoIso(5) },
    { id: 3, userName: 'sara', fullName: 'سارة محمد', active: 1, email: 'sara@petra.local', token: '', refreshToken: '', permssions: [], createdBy: 0, createdDate: daysAgoIso(4) },
    { id: 4, userName: 'khaled', fullName: 'خالد حسن', active: 0, email: 'khaled@petra.local', token: '', refreshToken: '', permssions: [], createdBy: 0, createdDate: daysAgoIso(3) },
    { id: 5, userName: 'nour', fullName: 'نور الدين', active: 1, email: 'nour@petra.local', token: '', refreshToken: '', permssions: [], createdBy: 0, createdDate: daysAgoIso(2) },
    { id: 6, userName: 'layla', fullName: 'ليلى يوسف', active: 1, email: 'layla@petra.local', token: '', refreshToken: '', permssions: [], createdBy: 0, createdDate: daysAgoIso(1) }
  ];

  const roles: RoleDto[] = [
    { id: 1, nameAr: 'مدير', nameOt: 'Manager', active: 1, createdBy: 0, createdDate: daysAgoIso(6) },
    { id: 2, nameAr: 'مسؤول النظام', nameOt: 'Admin', active: 1, createdBy: 0, createdDate: daysAgoIso(5) },
    { id: 3, nameAr: 'موظف', nameOt: 'Employee', active: 1, createdBy: 0, createdDate: daysAgoIso(4) },
    { id: 4, nameAr: 'محاسب', nameOt: 'Accountant', active: 1, createdBy: 0, createdDate: daysAgoIso(3) },
    { id: 5, nameAr: 'سكرتارية', nameOt: 'Secretary', active: 1, createdBy: 0, createdDate: daysAgoIso(2) }
  ];

  const serviceTypes: RequestTypeDto[] = [
    {
      id: 1, title: 'تأشيرة', code: 'VISA', isoCode: 'JO', logo: '', active: 1, description: '', isRequiredInnocent: true,
      workFlowDefinitionId: 1, createdBy: 0, createdDate: daysAgoIso(5), requestDetails: [], requestTypeAttachments: []
    },
    {
      id: 2, title: 'إجازة', code: 'LEAVE', isoCode: 'JO', logo: '', active: 1, description: '', isRequiredInnocent: false,
      workFlowDefinitionId: null, createdBy: 0, createdDate: daysAgoIso(3), requestDetails: [], requestTypeAttachments: []
    },
    {
      id: 3, title: 'تدريب', code: 'TRN', isoCode: 'JO', logo: '', active: 1, description: '', isRequiredInnocent: false,
      workFlowDefinitionId: 2, createdBy: 0, createdDate: daysAgoIso(1), requestDetails: [], requestTypeAttachments: []
    },
    {
      id: 4, title: 'قديم', code: 'OLD', isoCode: 'JO', logo: '', active: 0, description: '', isRequiredInnocent: false,
      workFlowDefinitionId: null, createdBy: 0, createdDate: daysAgoIso(0), requestDetails: [], requestTypeAttachments: []
    }
  ];

  return composeData(users, roles, serviceTypes, 2, 2);
}

export function buildAdminDashboardFromLocalStores(
  localStore: InternalLocalStoreService,
  rtStore: RequestTypeLocalStoreService
): AdminDashboardData {
  const users = localStore.getAllUsers();
  const roles = localStore.getAllRoles();
  const serviceTypes = rtStore.listAllRequestTypes();
  const integrationTotal = rtStore.listAllIntegrations().length;
  const attachmentTotal = rtStore.listAllAttachments().length;

  if (!users.length && !roles.length && !serviceTypes.length && !integrationTotal && !attachmentTotal) {
    return buildStaticAdminDashboardData();
  }

  return composeData(users, roles, serviceTypes, integrationTotal, attachmentTotal);
}
