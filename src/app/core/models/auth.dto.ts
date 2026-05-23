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
  token: string;
  refreshToken: string;
  permssions: string[];
  userRoles?: UserRoleDto[];
  userGroups?: UserGroupDto[];
  operationType?: number;
  email?: string;
  cityId?: string;
  password?: string;
  newPassword?: string;
  departmentId?: string;
  signatureImageBase64?: string;
}
