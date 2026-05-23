import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InnovaResponse, PageResult, SettingDto, SettingMiniDto, SettingSearchFilter } from '../models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class SettingService extends ApiBaseService {
  private readonly path = 'Setting';

  search(filter: SettingSearchFilter): Observable<PageResult<SettingDto>> {
    return super.searchEntity<SettingDto, SettingSearchFilter>(this.path, filter);
  }

  getById(id: string): Observable<SettingDto> {
    return super.getEntityById<SettingDto>(this.path, id);
  }

  create(dto: SettingDto): Observable<string> {
    return super.createEntity(this.path, dto);
  }

  update(dto: SettingDto): Observable<string> {
    return super.updateEntity(this.path, dto);
  }

  delete(id: string): Observable<boolean> {
    return super.deleteEntity(this.path, id);
  }

  getByName(settingName: string): Observable<SettingDto[]> {
    return this.withProgress(
      this.http.get<InnovaResponse<SettingDto[]>>(`${this.baseUrl}/${this.path}/setting/${settingName}`)
    ).pipe(map((res) => this.unwrap(res)));
  }

  getByKey(settingName: string): Observable<SettingDto> {
    return this.withProgress(
      this.http.get<InnovaResponse<SettingDto>>(`${this.baseUrl}/${this.path}/byKey/${settingName}`)
    ).pipe(map((res) => this.unwrap(res)));
  }

  getMini(): Observable<SettingMiniDto[]> {
    return this.withProgress(
      this.http.get<InnovaResponse<SettingMiniDto[]>>(`${this.baseUrl}/${this.path}/mini`)
    ).pipe(map((res) => this.unwrap(res)));
  }
}
