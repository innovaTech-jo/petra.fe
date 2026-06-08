import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResult, UserRoleDto, UserRoleSearchFilter } from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class UserRoleService extends ApiBaseService {
  private readonly path = 'UserRole';

  searchByUser(userId: number, paging?: UserRoleSearchFilter['pagingParameters']): Observable<PageResult<UserRoleDto>> {
    return this.searchEntity<UserRoleDto, UserRoleSearchFilter>(this.path, {
      userId,
      pagingParameters: paging ?? { pageNumber: 1, pageSize: 50 }
    });
  }
}
