import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { GceSoftBase } from '../../core/gce-soft-base';
import { ApplicationDto } from '../../core/models';
import { ApplicationService } from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { Permissions } from '../../shared/enums';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ListPaginationBarComponent } from '../../shared/list-pagination-bar/list-pagination-bar.component';

@Component({
  selector: 'app-applications',
  imports: [CommonModule, FormsModule, PageHeaderComponent, ListPaginationBarComponent],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.css'
})
export class ApplicationsComponent extends GceSoftBase implements OnInit {
  private readonly applicationService = inject(ApplicationService);
  readonly notificationService = inject(NotificationService);

  allApplications: ApplicationDto[] = [];
  application: Partial<ApplicationDto> = { active: 1, nameAr: '', nameOt: '', file: '' };
  selectedFile: File | undefined;
  isSaving = false;
  loadingList = false;
  isModalOpen = false;

  readonly acceptApk = '.apk,application/vnd.android.package-archive';
  readonly acceptImages = this.acceptApk;
  previewUrl: string | null = null;
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.getAllApplications();
  }

  getAllApplications(): void {
    this.loadingList = true;
    this.applicationService
      .search({
        keyword: this.searchParameters.keyword,
        pagingParameters: this.searchParameters.pagingParameters,
        isByPass: false
      })
      .subscribe({
        next: (page) => {
          this.allApplications = page.collections ?? [];
          this.searchParameters.totalCount = page.count ?? 0;
          this.loadingList = false;
        },
        error: (err: Error) => {
          this.loadingList = false;
          this.notificationService.showError(err.message);
        }
      });
  }

  onSearchInput(event: Event): void {
    this.searchParameters.keyword = (event.target as HTMLInputElement).value;
    this.searchParameters.pagingParameters!.pageNumber = 1;
    this.getAllApplications();
  }

  showCreateModal(): void {
    this.application = { active: 1, nameAr: '', nameOt: '', file: '' };
    this.selectedFile = undefined;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  getApplicationById(id: number | undefined): void {
    if (!id) return;
    this.applicationService.getById(id).subscribe({
      next: (app) => {
        this.application = { ...app };
        this.isModalOpen = true;
      },
      error: (err: Error) => this.notificationService.showError(err.message)
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.selectedFile = file;
  }

  onActiveChange(): void {
    this.application.active = this.application.active === 1 ? 0 : 1;
  }

  save(form: NgForm): void {
    if (!form.valid) {
      form.form.markAllAsTouched();
      return;
    }
    if (!this.application.id && !this.selectedFile) {
      this.notificationService.showError('يرجى اختيار ملف APK');
      return;
    }

    this.isSaving = true;

    const persist = (dto: Partial<ApplicationDto>) => {
      const req = dto.id
        ? this.applicationService.update(dto as ApplicationDto)
        : this.applicationService.create(dto as ApplicationDto);
      req.subscribe({
        next: () => {
          this.isSaving = false;
          this.getAllApplications();
          this.closeModal();
          this.notificationService.showSuccess();
        },
        error: (err: Error) => {
          this.isSaving = false;
          this.notificationService.showError(err.message);
        }
      });
    };

    if (this.selectedFile) {
      this.applicationService.fileToBase64(this.selectedFile).then((b64) => {
        this.application.file = b64;
        persist(this.application);
      });
    } else {
      persist(this.application);
    }
  }

  changePage(page: number): void {
    this.searchParameters.pagingParameters!.pageNumber = page;
    this.getAllApplications();
  }

  onPageSizeChange(size: number): void {
    this.searchParameters.pagingParameters!.pageSize = size;
    this.searchParameters.pagingParameters!.pageNumber = 1;
    this.getAllApplications();
  }

  get totalPages(): number {
    const total = this.searchParameters.totalCount ?? 0;
    const size = this.searchParameters.pagingParameters?.pageSize ?? 10;
    return Math.max(1, Math.ceil(total / size) || 1);
  }

  canEdit(): boolean {
    return this.can(Permissions.Applications);
  }

  colCount(): number {
    return this.canEdit() ? 8 : 7;
  }

  formatCreatedDate(value: string | Date | undefined): string {
    if (!value) return '—';
    const d = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' });
  }

  formatSizeMb(bytes: number | null | undefined): string {
    if (bytes == null) return '—';
    return `${(bytes / 1048576).toFixed(1)} م.ب`;
  }
}
