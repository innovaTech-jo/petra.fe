import { BaseDto } from './base.dto';
import { SearchParameters } from './api.types';

export interface UserRoleDto extends BaseDto {
  userId: number;
  userName?: string;
  roleId: number;
  roleName?: string;
}

export interface UserRoleSearchFilter extends SearchParameters {
  userId: number;
}
