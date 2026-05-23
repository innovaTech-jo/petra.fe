import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { InnovaResponse, PageResult, SearchParameters } from '../core/models';
import { ApiProgressService } from './api-progress.service';

/**
 * @deprecated Prefer entity services in `core/services`. Kept for gradual migration.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiProgress = inject(ApiProgressService);

  private withProgress<T>(request: Observable<T>): Observable<T> {
    const id = `req_${Date.now()}`;
    this.apiProgress.startRequest(id);
    return request.pipe(finalize(() => this.apiProgress.endRequest(id)));
  }

  getAll<T>(filter: SearchParameters, target: string): Observable<InnovaResponse<PageResult<T>>> {
    return this.withProgress(
      this.http.post<InnovaResponse<PageResult<T>>>(`${environment.apiUrl}/${target}/search`, filter)
    );
  }

  getById<T>(id: string, target: string): Observable<InnovaResponse<T>> {
    return this.withProgress(this.http.get<InnovaResponse<T>>(`${environment.apiUrl}/${target}/${id}`));
  }

  addOrUpdate<T>(entity: T, target: string): Observable<InnovaResponse<string>> {
    const e = entity as { id?: string };
    if (!e.id) {
      return this.withProgress(this.http.post<InnovaResponse<string>>(`${environment.apiUrl}/${target}`, entity));
    }
    return this.withProgress(
      this.http.post<InnovaResponse<string>>(`${environment.apiUrl}/${target}/update`, entity)
    );
  }

  convertImageToBase64(file: File | undefined): Promise<string> {
    if (!file) return Promise.resolve('');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result instanceof ArrayBuffer) {
          const uint8Array = new Uint8Array(result);
          resolve(btoa(Array.from(uint8Array, (b) => String.fromCharCode(b)).join('')));
        } else reject(new Error('Failed to convert file.'));
      };
      reader.onerror = () => reject(new Error('File reading error.'));
      reader.readAsArrayBuffer(file);
    });
  }
}
