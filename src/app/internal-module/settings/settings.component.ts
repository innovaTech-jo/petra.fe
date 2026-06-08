import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { GceSoftBase } from '../../core/gce-soft-base';
import { SettingDto } from '../../core/models';
import { SettingService } from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { SettingValueType } from '../../shared/enums';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ListPaginationBarComponent } from '../../shared/list-pagination-bar/list-pagination-bar.component';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, PageHeaderComponent, ListPaginationBarComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent extends GceSoftBase implements OnInit {
  private readonly settingService = inject(SettingService);
  readonly notificationService = inject(NotificationService);

  allSetting: SettingDto[] = [];
  Setting: Partial<SettingDto> = {};
  isSettingModalOpen = false;
  loadingList = false;

  readonly SettingValueType = SettingValueType;
  readonly activeTab = 'settings' as const;
  readonly settingValuePatternMedia = '^(https?:\\/\\/\\S+|\\/\\S+)$';
  readonly settingValuePatternNumber = '^-?\\d+(\\.\\d+)?$';
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.getAllSetting();
  }

  getAllSetting(): void {
    this.loadingList = true;
    this.settingService
      .search({
        term: this.searchParameters.keyword,
        keyword: this.searchParameters.keyword,
        pagingParameters: this.searchParameters.pagingParameters,
        isByPass: false
      })
      .subscribe({
        next: (page) => {
          this.allSetting = page.collections ?? [];
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
    this.getAllSetting();
  }

  getSettingById(id: number | undefined): void {
    if (!id) return;
    this.settingService.getById(id).subscribe({
      next: (s) => {
        this.Setting = { ...s };
        this.isSettingModalOpen = true;
      },
      error: (err: Error) => this.notificationService.showError(err.message)
    });
  }

  closeSettingModal(): void {
    this.isSettingModalOpen = false;
    this.Setting = {};
  }

  save(): void {
    const dto = { ...this.Setting } as SettingDto;
    const req = dto.id ? this.settingService.update(dto) : this.settingService.create(dto);
    req.subscribe({
      next: () => {
        this.getAllSetting();
        this.closeSettingModal();
        this.notificationService.showSuccess();
      },
      error: (err: Error) => this.notificationService.showError(err.message)
    });
  }

  changePage(page: number): void {
    this.searchParameters.pagingParameters!.pageNumber = page;
    this.getAllSetting();
  }

  onPageSizeChange(size: number): void {
    this.searchParameters.pagingParameters!.pageSize = size;
    this.searchParameters.pagingParameters!.pageNumber = 1;
    this.getAllSetting();
  }

  get totalPages(): number {
    const total = this.searchParameters.totalCount ?? 0;
    const size = this.searchParameters.pagingParameters?.pageSize ?? 10;
    return Math.max(1, Math.ceil(total / size) || 1);
  }

  getSettingValueType(): number {
    return SettingValueType.Text;
  }

  get settingHintDisplay(): string {
    const raw = this.isArabic ? this.Setting?.hintAr : this.Setting?.hintOt;
    return raw?.trim() ?? '';
  }

  isSettingFormReady(_form: unknown): boolean {
    return !!(this.Setting.settingValue ?? '').trim();
  }

  formatModifiedDate(value: string | Date | undefined): string {
    if (!value) return '—';
    const d = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' });
  }
}
