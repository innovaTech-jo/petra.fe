import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IntegrationTypeDto, IntegrationTypeSearchFilter, PageResult } from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class IntegrationTypeService extends ApiBaseService {
  private readonly path = 'IntegrationType';

  search(filter: IntegrationTypeSearchFilter): Observable<PageResult<IntegrationTypeDto>> {
    return super.searchEntity<IntegrationTypeDto, IntegrationTypeSearchFilter>(this.path, filter);
  }

  getById(id: number): Observable<IntegrationTypeDto> {
    return super.getEntityById<IntegrationTypeDto>(this.path, String(id));
  }

  getAll(): Observable<IntegrationTypeDto[]> {
    return super.getAllEntities<IntegrationTypeDto>(this.path);
  }

  create(dto: IntegrationTypeDto): Observable<number> {
    return super.createEntity(this.path, dto).pipe(map((v) => Number(v)));
  }

  update(dto: IntegrationTypeDto): Observable<number> {
    return super.updateEntity(this.path, dto).pipe(map((v) => Number(v)));
  }

  delete(id: number): Observable<boolean> {
    return super.deleteEntity(this.path, String(id));
  }
}
