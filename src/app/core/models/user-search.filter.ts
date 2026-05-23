import { SearchParameters } from './api.types';

export interface UserSearchFilter extends SearchParameters {
  userName?: string;
}
