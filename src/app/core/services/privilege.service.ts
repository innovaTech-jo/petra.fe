import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResult, PrivilegeDto, PrivilegeSearchFilter } from '../models';
import { ApiBaseService } from './api-base.service';

/** Read-only privilege tree for role assignment (no standalone UI). */
@Injectable({ providedIn: 'root' })
export class PrivilegeService extends ApiBaseService {
  private readonly path = 'Privilege';

  search(filter: PrivilegeSearchFilter = { pagingParameters: { pageNumber: 1, pageSize: 500 } }): Observable<
    PageResult<PrivilegeDto>
  > {
    return super.searchEntity<PrivilegeDto, PrivilegeSearchFilter>(this.path, filter);
  }

  getAll(): Observable<PrivilegeDto[]> {
    return super.getAllEntities<PrivilegeDto>(this.path);
  }
}
