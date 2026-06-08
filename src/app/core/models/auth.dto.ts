import { BaseDto } from './base.dto';
import { UserGroupDto } from './user-group.dto';
import { UserRoleDto } from './user-role.dto';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface UsersDto extends BaseDto {
  userName: string;
  fullName: string;
  active: number;
  email: string;
  cityId?: number | null;
  isSystem?: number | null;
  password?: string;
  newPassword?: string;
  token?: string;
  refreshToken?: string;
  permssions?: number[];
  operationType?: number;
  userRoles?: UserRoleDto[];
  userGroups?: UserGroupDto[];
}
