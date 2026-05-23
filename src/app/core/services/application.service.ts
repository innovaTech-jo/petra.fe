import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationDto, ApplicationSearchFilter, PageResult } from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class ApplicationService extends ApiBaseService {
  private readonly path = 'Applications';

  search(filter: ApplicationSearchFilter): Observable<PageResult<ApplicationDto>> {
    return super.searchEntity<ApplicationDto, ApplicationSearchFilter>(this.path, filter);
  }

  getById(id: string): Observable<ApplicationDto> {
    return super.getEntityById<ApplicationDto>(this.path, id);
  }

  create(dto: ApplicationDto): Observable<string> {
    return super.createEntity(this.path, dto);
  }

  update(dto: ApplicationDto): Observable<string> {
    return super.updateEntity(this.path, dto);
  }

  delete(id: string): Observable<boolean> {
    return super.deleteEntity(this.path, id);
  }
}
