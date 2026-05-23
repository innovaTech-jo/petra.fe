import { BaseDto } from './base.dto';

export interface UserRoleDto extends BaseDto {
  userId: string;
  userName?: string;
  roleId: string;
  roleName?: string;
}
