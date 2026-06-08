import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, finalize, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { InnovaResponse, PageResult, SearchParameters } from '../models';
import { ApiProgressService } from '../../services/api-progress.service';

@Injectable({ providedIn: 'root' })
export class ApiBaseService {
  protected readonly http = inject(HttpClient);
  private readonly apiProgress = inject(ApiProgressService);

  protected get baseUrl(): string {
    return environment.apiUrl;
  }

  protected withProgress<T>(request: Observable<T>, requestId?: string): Observable<T> {
    const id = requestId ?? `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    this.apiProgress.startRequest(id);
    return request.pipe(finalize(() => this.apiProgress.endRequest(id)));
  }

  protected unwrap<T>(response: InnovaResponse<T>): T {
    if (!response.isSuccess) {
      throw new Error(response.message || 'Request failed');
    }
    return response.data;
  }

  protected searchEntity<T, F extends SearchParameters>(entityPath: string, filter: F): Observable<PageResult<T>> {
    return this.withProgress(
      this.http.post<InnovaResponse<PageResult<T>>>(`${this.baseUrl}/${entityPath}/search`, filter)
    ).pipe(map((res) => this.unwrap(res)));
  }

  protected getEntityById<T>(entityPath: string, id: number | string): Observable<T> {
    return this.withProgress(this.http.get<InnovaResponse<T>>(`${this.baseUrl}/${entityPath}/${id}`)).pipe(
      map((res) => this.unwrap(res))
    );
  }

  protected getAllEntities<T>(entityPath: string): Observable<T[]> {
    return this.withProgress(this.http.get<InnovaResponse<T[]>>(`${this.baseUrl}/${entityPath}/all`)).pipe(
      map((res) => this.unwrap(res))
    );
  }

  protected createEntity<T>(entityPath: string, dto: T): Observable<string> {
    return this.withProgress(this.http.post<InnovaResponse<string>>(`${this.baseUrl}/${entityPath}`, dto)).pipe(
      map((res) => this.unwrap(res))
    );
  }

  protected updateEntity<T>(entityPath: string, dto: T): Observable<string> {
    return this.withProgress(
      this.http.post<InnovaResponse<string>>(`${this.baseUrl}/${entityPath}/update`, dto)
    ).pipe(map((res) => this.unwrap(res)));
  }

  protected deleteEntity(entityPath: string, id: number | string): Observable<boolean> {
    return this.withProgress(
      this.http.get<InnovaResponse<boolean>>(`${this.baseUrl}/${entityPath}/delete/${id}`)
    ).pipe(map((res) => this.unwrap(res)));
  }

  /** Read file as base64 (no data: prefix). */
  fileToBase64(file: File | undefined): Promise<string> {
    if (!file) return Promise.resolve('');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result instanceof ArrayBuffer) {
          const uint8Array = new Uint8Array(result);
          const binaryString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join('');
          resolve(btoa(binaryString));
        } else {
          reject(new Error('Failed to convert file to base64.'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error.'));
      reader.readAsArrayBuffer(file);
    });
  }

  postAnonymous<TReq, TRes>(path: string, body: TReq): Observable<TRes> {
    return this.withProgress(this.http.post<InnovaResponse<TRes>>(`${this.baseUrl}/${path}`, body)).pipe(
      map((res) => this.unwrap(res))
    );
  }

  refreshToken(): Observable<{ token: string; refreshToken?: string }> {
    const raw = localStorage.getItem('dcpUser');
    const refreshToken = raw ? (JSON.parse(raw) as { refreshToken?: string }).refreshToken : undefined;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.http
      .post<InnovaResponse<{ token: string; refreshToken?: string }>>(
        `${this.baseUrl}/User/refresh-token`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      )
      .pipe(map((res) => this.unwrap(res)));
  }
}
