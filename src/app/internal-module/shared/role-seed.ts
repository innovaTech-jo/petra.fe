import { RoleDto } from '../../core/models';

export const RoleSeedIds = {
  manager: 1,
  admin: 2,
  employee: 3,
  accountant: 4,
  secretary: 5
} as const;

export function buildDefaultRoles(): RoleDto[] {
  const now = new Date().toISOString();
  const base = { createdBy: 0, createdDate: now, active: 1 as const };
  return [
    { ...base, id: RoleSeedIds.manager, nameAr: 'مدير', nameOt: 'Manager' },
    { ...base, id: RoleSeedIds.admin, nameAr: 'مسؤول النظام', nameOt: 'Admin' },
    { ...base, id: RoleSeedIds.employee, nameAr: 'موظف', nameOt: 'Employee' },
    { ...base, id: RoleSeedIds.accountant, nameAr: 'محاسب', nameOt: 'Accountant' },
    { ...base, id: RoleSeedIds.secretary, nameAr: 'سكرتارية', nameOt: 'Secretary' }
  ];
}
