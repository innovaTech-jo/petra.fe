import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupDto, GroupSearchFilter, PageResult } from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class GroupService extends ApiBaseService {
  private readonly path = 'Group';

  search(filter: GroupSearchFilter): Observable<PageResult<GroupDto>> {
    return super.searchEntity<GroupDto, GroupSearchFilter>(this.path, filter);
  }

  getById(id: string): Observable<GroupDto> {
    return super.getEntityById<GroupDto>(this.path, id);
  }

  create(dto: GroupDto): Observable<string> {
    return super.createEntity(this.path, dto);
  }

  update(dto: GroupDto): Observable<string> {
    return super.updateEntity(this.path, dto);
  }

  delete(id: string): Observable<boolean> {
    return super.deleteEntity(this.path, id);
  }
}
