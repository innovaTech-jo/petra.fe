import { BaseDto } from './base.dto';

export interface UserGroupDto extends BaseDto {
  userId: number;
  userName?: string;
  groupId: number;
  groupName?: string;
}
