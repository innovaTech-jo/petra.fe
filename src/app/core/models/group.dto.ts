import { BaseDto } from './base.dto';
import { SearchParameters } from './api.types';

export interface GroupDto extends BaseDto {
  nameAr: string;
  nameOt: string;
  active: number;
  createdByName?: string;
}

export interface GroupSearchFilter extends SearchParameters {
  description?: string;
  active?: number;
  userId?: string;
}
