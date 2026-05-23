import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResult, RoleDto, RoleSearchFilter } from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class RoleService extends ApiBaseService {
  private readonly path = 'Role';

  search(filter: RoleSearchFilter): Observable<PageResult<RoleDto>> {
    return super.searchEntity<RoleDto, RoleSearchFilter>(this.path, filter);
  }

  getById(id: string): Observable<RoleDto> {
    return super.getEntityById<RoleDto>(this.path, id);
  }

  create(dto: RoleDto): Observable<string> {
    return super.createEntity(this.path, dto);
  }

  update(dto: RoleDto): Observable<string> {
    return super.updateEntity(this.path, dto);
  }

  delete(id: string): Observable<boolean> {
    return super.deleteEntity(this.path, id);
  }
}
