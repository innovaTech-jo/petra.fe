import { Injectable, signal } from '@angular/core';

export type ToastMessage = { type: 'success' | 'error'; text: string };

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly toast = signal<ToastMessage | null>(null);

  showSuccess(message?: string): void {
    this.toast.set({ type: 'success', text: message ?? 'تمت العملية بنجاح' });
    setTimeout(() => this.toast.set(null), 4000);
  }

  showError(message?: string): void {
    if (!message || message.includes('Http failure')) {
      return;
    }
    this.toast.set({ type: 'error', text: message ?? 'حدث خطأ ما الرجاء التواصل مع مدير النظام' });
    setTimeout(() => this.toast.set(null), 5000);
  }

  dismiss(): void {
    this.toast.set(null);
  }
}
