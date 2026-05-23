import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationDto, NotificationSearchFilter, PageResult } from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class NotificationApiService extends ApiBaseService {
  private readonly path = 'Notification';

  search(filter: NotificationSearchFilter): Observable<PageResult<NotificationDto>> {
    return super.searchEntity<NotificationDto, NotificationSearchFilter>(this.path, filter);
  }

  getById(id: string): Observable<NotificationDto> {
    return super.getEntityById<NotificationDto>(this.path, id);
  }

  create(dto: NotificationDto): Observable<string> {
    return super.createEntity(this.path, dto);
  }

  update(dto: NotificationDto): Observable<string> {
    return super.updateEntity(this.path, dto);
  }

  delete(id: string): Observable<boolean> {
    return super.deleteEntity(this.path, id);
  }
}
