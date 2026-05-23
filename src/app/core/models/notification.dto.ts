import { BaseDto } from './base.dto';
import { SearchParameters } from './api.types';

export interface NotificationDto extends BaseDto {
  title: string;
  body: string;
  token: string;
  createdByName?: string;
}

export interface NotificationSearchFilter extends SearchParameters {}
