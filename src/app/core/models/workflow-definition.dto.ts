import { SearchParameters } from './api.types';
import { NumericEntityDto } from './numeric-entity.dto';

export interface WorkFlowStepDto {
  id?: number;
  order: number;
  nameAr: string;
  nameOt: string;
  isArchivedStep: boolean;
  approveRoleIds: number[];
  rejectRoleIds: number[];
  skipRoleIds: number[];
  requireNote: boolean;
  notePrompt: string;
}

export interface WorkFlowDefinitionDto extends NumericEntityDto {
  nameAr: string;
  nameOt: string;
  requestTypeId: number;
  requestTypeTitle?: string;
  active: number;
  steps: WorkFlowStepDto[];
}

export interface WorkFlowDefinitionSearchFilter extends SearchParameters {
  keyword?: string;
  active?: number;
  requestTypeId?: number;
}
