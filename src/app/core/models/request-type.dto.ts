import { SearchParameters } from './api.types';
import { RequestEntityId } from './request-detail.dto';
import { RequestDetailDto } from './request-detail.dto';
import { RequestTypeAttachmentDto } from './request-type-attachment.dto';

export interface RequestTypeDto extends RequestEntityId {
  title: string;
  code: string;
  isoCode: string;
  logo: string;
  active: number;
  description: string;
  isRequiredInnocent: boolean;
  createdByName?: string;
  workFlowDefinitionId?: number | null;
  workFlowNameAr?: string;
  workFlowNameOt?: string;
  requestDetails: RequestDetailDto[];
  requestTypeAttachments: RequestTypeAttachmentDto[];
}

export interface RequestTypeSearchFilter extends SearchParameters {
  keyword?: string;
  active?: number;
}
