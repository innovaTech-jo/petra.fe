import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResult, UserSearchFilter, UsersDto } from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiBaseService {
  private readonly path = 'User';

  search(filter: UserSearchFilter): Observable<PageResult<UsersDto>> {
    return super.searchEntity<UsersDto, UserSearchFilter>(this.path, filter);
  }

  getById(id: string): Observable<UsersDto> {
    return super.getEntityById<UsersDto>(this.path, id);
  }

  create(dto: UsersDto): Observable<string> {
    return super.createEntity(this.path, dto);
  }

  update(dto: UsersDto): Observable<string> {
    return super.updateEntity(this.path, dto);
  }

  delete(id: string): Observable<boolean> {
    return super.deleteEntity(this.path, id);
  }
}
