import { BaseDto } from './base.dto';
import { FieldType } from './field-type.enum';

/** Backend uses numeric id; other audit fields match {@link BaseDto}. */
export type RequestEntityId = Omit<BaseDto, 'id'> & { id: number };

export interface RequestDetailDto extends RequestEntityId {
  requestTypeId?: number;
  nameAr: string;
  nameOt: string;
  fieldType: FieldType;
  isRequiredIntegration: boolean;
  integrationTypeId?: number | null;
  integrationTypeName?: string;
  requestTypeTitle?: string;
}
