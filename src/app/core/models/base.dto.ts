export interface BaseDto {
  id: number;
  createdBy: number;
  createdDate: string;
  modifiedBy?: number;
  modifiedDate?: string;
}
