import { SearchParameters } from './api.types';
import { NumericEntityDto } from './numeric-entity.dto';

export interface AttachmentTypeDto extends NumericEntityDto {
  name: string;
  code: string;
  active: number;
}

export interface AttachmentTypeSearchFilter extends SearchParameters {
  keyword?: string;
  active?: number;
}
