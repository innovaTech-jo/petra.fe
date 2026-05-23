import { BaseDto } from './base.dto';
import { SearchParameters } from './api.types';

export interface PrivilegeDto extends BaseDto {
  privilegeName: string;
  privilegeNameEn: string;
  parentId?: string;
  icon?: string;
  parentName?: string;
  sortOrder?: number;
}

export interface PrivilegeSearchFilter extends SearchParameters {}
