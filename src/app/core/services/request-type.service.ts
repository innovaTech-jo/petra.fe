import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageResult, RequestTypeDto, RequestTypeSearchFilter } from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class RequestTypeService extends ApiBaseService {
  private readonly path = 'RequestType';

  search(filter: RequestTypeSearchFilter): Observable<PageResult<RequestTypeDto>> {
    return super.searchEntity<RequestTypeDto, RequestTypeSearchFilter>(this.path, filter);
  }

  getById(id: number): Observable<RequestTypeDto> {
    return super.getEntityById<RequestTypeDto>(this.path, String(id));
  }

  create(dto: RequestTypeDto): Observable<number> {
    return super.createEntity(this.path, dto).pipe(map((v) => Number(v)));
  }

  update(dto: RequestTypeDto): Observable<number> {
    return super.updateEntity(this.path, dto).pipe(map((v) => Number(v)));
  }

  delete(id: number): Observable<boolean> {
    return super.deleteEntity(this.path, String(id));
  }
}
