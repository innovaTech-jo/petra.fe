/** Backend entities that use numeric primary keys (RequestType module). */
export interface NumericEntityDto {
  id: number;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}
