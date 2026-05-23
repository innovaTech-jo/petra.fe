import { BaseDto } from './base.dto';
import { SearchParameters } from './api.types';

export interface SettingDto extends BaseDto {
  settingName: string;
  displayName: string;
  displayNameOt: string;
  settingValue: string;
  settingValueOt: string;
  isMedia: number;
  enableEditor: number;
  sendToMobileApp: number;
  isSystem: number;
  hintAr?: string;
  hintOt?: string;
}

export interface SettingMiniDto {
  settingName: string;
  displayName: string;
  settingValue: string;
}

export interface SettingSearchFilter extends SearchParameters {
  term?: string;
}
