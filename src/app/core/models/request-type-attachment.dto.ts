import { RequestEntityId } from './request-detail.dto';

export interface RequestTypeAttachmentDto extends RequestEntityId {
  requestTypeId?: number;
  nameAr: string;
  nameOt: string;
  attachmentTypeId: number;
  isRequired: boolean;
  isMulti: boolean;
  attachmentTypeName?: string;
  requestTypeTitle?: string;
}
