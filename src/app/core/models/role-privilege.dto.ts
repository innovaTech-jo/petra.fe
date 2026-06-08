import { BaseDto } from './base.dto';

export interface RolePrivilegeDto extends BaseDto {
  privilegeId: number | string;
  privilegeName?: string;
  roleId: number;
  roleName?: string;
}
