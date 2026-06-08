import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AttachmentTypeDto, AttachmentTypeSearchFilter, PageResult } from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class AttachmentTypeService extends ApiBaseService {
  private readonly path = 'AttachmentType';

  search(filter: AttachmentTypeSearchFilter): Observable<PageResult<AttachmentTypeDto>> {
    return super.searchEntity<AttachmentTypeDto, AttachmentTypeSearchFilter>(this.path, filter);
  }

  getById(id: number): Observable<AttachmentTypeDto> {
    return super.getEntityById<AttachmentTypeDto>(this.path, String(id));
  }

  getAll(): Observable<AttachmentTypeDto[]> {
    return super.getAllEntities<AttachmentTypeDto>(this.path);
  }

  create(dto: AttachmentTypeDto): Observable<number> {
    return super.createEntity(this.path, dto).pipe(map((v) => Number(v)));
  }

  update(dto: AttachmentTypeDto): Observable<number> {
    return super.updateEntity(this.path, dto).pipe(map((v) => Number(v)));
  }

  delete(id: number): Observable<boolean> {
    return super.deleteEntity(this.path, String(id));
  }
}
