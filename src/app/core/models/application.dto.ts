import { BaseDto } from './base.dto';
import { SearchParameters } from './api.types';

export interface ApplicationDto extends BaseDto {
  nameAr: string;
  nameOt: string;
  active: number;
  file: string;
  packageName?: string;
  versionName?: string;
  label?: string;
  appSize?: number;
  createdByName?: string;
}

export interface ApplicationSearchFilter extends SearchParameters {
  description?: string;
  active?: number;
}
