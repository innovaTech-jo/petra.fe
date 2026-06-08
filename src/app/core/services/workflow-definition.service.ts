import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  InnovaResponse,
  PageResult,
  WorkFlowDefinitionDto,
  WorkFlowDefinitionSearchFilter
} from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class WorkFlowDefinitionService extends ApiBaseService {
  private readonly path = 'WorkFlowDefinition';

  search(filter: WorkFlowDefinitionSearchFilter): Observable<PageResult<WorkFlowDefinitionDto>> {
    return super.searchEntity<WorkFlowDefinitionDto, WorkFlowDefinitionSearchFilter>(this.path, filter);
  }

  getById(id: number): Observable<WorkFlowDefinitionDto> {
    return super.getEntityById<WorkFlowDefinitionDto>(this.path, String(id));
  }

  getByRequestTypeId(requestTypeId: number): Observable<WorkFlowDefinitionDto | null> {
    return this.withProgress(
      this.http.get<InnovaResponse<WorkFlowDefinitionDto | null>>(
        `${this.baseUrl}/${this.path}/by-request-type/${requestTypeId}`
      )
    ).pipe(map((res) => this.unwrap(res)));
  }

  create(dto: WorkFlowDefinitionDto): Observable<number> {
    return super.createEntity(this.path, dto).pipe(map((v) => Number(v)));
  }

  update(dto: WorkFlowDefinitionDto): Observable<number> {
    return super.updateEntity(this.path, dto).pipe(map((v) => Number(v)));
  }

  delete(id: number): Observable<boolean> {
    return super.deleteEntity(this.path, String(id));
  }
}
