import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Same behavior as MobCentra.FE `ApiProgressService` — global HTTP activity indicator. */
@Injectable({ providedIn: 'root' })
export class ApiProgressService {
  private activeRequests = new Set<string>();
  private progressSubject = new BehaviorSubject<boolean>(false);
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly progress$ = this.progressSubject.asObservable();

  startRequest(requestId: string): void {
    this.activeRequests.add(requestId);
    this.clearHideTimeout();
    this.updateProgress();
  }

  endRequest(requestId: string): void {
    this.activeRequests.delete(requestId);
    this.updateProgressWithDelay();
  }

  private updateProgress(): void {
    this.progressSubject.next(this.activeRequests.size > 0);
  }

  private updateProgressWithDelay(): void {
    if (this.activeRequests.size > 0) {
      this.clearHideTimeout();
      this.progressSubject.next(true);
    } else {
      this.clearHideTimeout();
      this.hideTimeout = setTimeout(() => {
        this.progressSubject.next(false);
      }, 0);
    }
  }

  private clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  clearAllRequests(): void {
    this.activeRequests.clear();
    this.clearHideTimeout();
    this.updateProgress();
  }
}
