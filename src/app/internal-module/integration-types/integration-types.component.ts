import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { environment } from '../../../environments/environment';
import { GceSoftBase } from '../../core/gce-soft-base';
import { IntegrationTypeDto } from '../../core/models';
import { IntegrationTypeService } from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ListPaginationBarComponent } from '../../shared/list-pagination-bar/list-pagination-bar.component';
import { RequestTypeLocalStoreService } from '../services/request-type-local-store.service';

@Component({
  selector: 'app-integration-types',
  imports: [CommonModule, FormsModule, ToggleSwitch, PageHeaderComponent, ListPaginationBarComponent],
  templateUrl: './integration-types.component.html',
  styleUrl: './integration-types.component.css'
})
export class IntegrationTypesComponent extends GceSoftBase implements OnInit {
  private readonly service = inject(IntegrationTypeService);
  private readonly localStore = inject(RequestTypeLocalStoreService);
  readonly notificationService = inject(NotificationService);

  allItems: IntegrationTypeDto[] = [];
  editing: Partial<IntegrationTypeDto> = { active: 1 };
  isModalOpen = false;
  loadingList = false;
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.loadingList = true;
    if (environment.useLocalInternalStore) {
      const page = this.localStore.searchIntegrationTypes({
        keyword: this.searchParameters.keyword,
        pagingParameters: this.searchParameters.pagingParameters
      });
      this.allItems = page.collections ?? [];
      this.searchParameters.totalCount = page.count ?? 0;
      this.loadingList = false;
      return;
    }
    this.service
      .search({
        keyword: this.searchParameters.keyword,
        pagingParameters: this.searchParameters.pagingParameters,
        isByPass: false
      })
      .subscribe({
        next: (page) => {
          this.allItems = page.collections ?? [];
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
    this.loadList();
  }

  openCreate(): void {
    this.editing = { active: 1, name: '', code: '' };
    this.isModalOpen = true;
  }

  openEdit(row: IntegrationTypeDto): void {
    this.editing = { ...row };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editing = { active: 1 };
  }

  setActiveFromToggle(on: boolean): void {
    this.editing.active = on ? 1 : 0;
  }

  canSave(): boolean {
    return !!(this.editing.name?.trim() && this.editing.code?.trim());
  }

  save(): void {
    if (!this.canSave()) return;
    const dto = { ...this.editing, active: this.editing.active ?? 1 } as IntegrationTypeDto;
    if (environment.useLocalInternalStore) {
      this.localStore.saveIntegrationType(dto);
      this.loadList();
      this.closeModal();
      this.notificationService.showSuccess();
      return;
    }
    const req = dto.id ? this.service.update(dto) : this.service.create(dto);
    req.subscribe({
      next: () => {
        this.loadList();
        this.closeModal();
        this.notificationService.showSuccess();
      },
      error: (err: Error) => this.notificationService.showError(err.message)
    });
  }

  changePage(page: number): void {
    this.searchParameters.pagingParameters!.pageNumber = page;
    this.loadList();
  }

  onPageSizeChange(size: number): void {
    this.searchParameters.pagingParameters!.pageSize = size;
    this.searchParameters.pagingParameters!.pageNumber = 1;
    this.loadList();
  }

  colCount(): number {
    return this.can(this.systemPermissions.EditIntegrationType) ? 4 : 3;
  }
}
