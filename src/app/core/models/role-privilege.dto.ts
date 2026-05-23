import { BaseDto } from './base.dto';

export interface RolePrivilegeDto extends BaseDto {
  privilegeId: string;
  privilegeName?: string;
  roleId: string;
  roleName?: string;
}
