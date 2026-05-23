import { BaseDto } from './base.dto';

export interface UserGroupDto extends BaseDto {
  userId: string;
  userName?: string;
  groupId: string;
  groupName?: string;
}
