import { BaseDto } from './base.dto';
import { SearchParameters } from './api.types';
import { RolePrivilegeDto } from './role-privilege.dto';
import { UserRoleDto } from './user-role.dto';

export interface RoleDto extends BaseDto {
  nameAr: string;
  nameOt: string;
  active: number;
  isSystem?: number;
  userRoles?: UserRoleDto[];
  rolePrivileges?: RolePrivilegeDto[];
}

export interface RoleSearchFilter extends SearchParameters {
  name?: string;
  active?: number;
}
