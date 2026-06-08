import { SearchParameters } from './api.types';
import { NumericEntityDto } from './numeric-entity.dto';

export interface IntegrationTypeDto extends NumericEntityDto {
  name: string;
  code: string;
  active: number;
}

export interface IntegrationTypeSearchFilter extends SearchParameters {
  keyword?: string;
  active?: number;
}
