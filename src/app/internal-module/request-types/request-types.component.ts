import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { GceSoftBase } from '../../core/gce-soft-base';
import { RequestTypeDto } from '../../core/models';
import { RequestTypeService } from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ListPaginationBarComponent } from '../../shared/list-pagination-bar/list-pagination-bar.component';
import { RequestTypeLocalStoreService } from '../services/request-type-local-store.service';

@Component({
  selector: 'app-request-types',
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent, ListPaginationBarComponent],
  templateUrl: './request-types.component.html',
  styleUrl: './request-types.component.css'
})
export class RequestTypesComponent extends GceSoftBase implements OnInit {
  private readonly service = inject(RequestTypeService);
  private readonly localStore = inject(RequestTypeLocalStoreService);
  readonly notificationService = inject(NotificationService);

  allRequestTypes: RequestTypeDto[] = [];
  loadingList = false;
  activeFilter: '' | '1' | '0' = '';
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.loadingList = true;
    const active = this.activeFilter === '' ? undefined : Number(this.activeFilter);
    if (environment.useLocalInternalStore) {
      const page = this.localStore.searchRequestTypes(
        { keyword: this.searchParameters.keyword, pagingParameters: this.searchParameters.pagingParameters },
        active
      );
      this.allRequestTypes = page.collections ?? [];
      this.searchParameters.totalCount = page.count ?? 0;
      this.loadingList = false;
      return;
    }
    this.service
      .search({
        keyword: this.searchParameters.keyword,
        active,
        pagingParameters: this.searchParameters.pagingParameters,
        isByPass: false
      })
      .subscribe({
        next: (page) => {
          this.allRequestTypes = page.collections ?? [];
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

  onActiveFilterChange(): void {
    this.searchParameters.pagingParameters!.pageNumber = 1;
    this.loadList();
  }

  deleteRow(row: RequestTypeDto): void {
    if (!confirm('حذف نوع الخدمة؟')) return;
    if (environment.useLocalInternalStore) {
      this.localStore.deleteRequestType(row.id);
      this.loadList();
      this.notificationService.showSuccess();
      return;
    }
    this.service.delete(row.id).subscribe({
      next: () => {
        this.loadList();
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

  hasWorkflow(row: RequestTypeDto): boolean {
    return row.workFlowDefinitionId != null && row.workFlowDefinitionId > 0;
  }

  workflowLabel(row: RequestTypeDto): string {
    return row.workFlowNameAr || row.workFlowNameOt || '—';
  }

  colCount(): number {
    let n = 6;
    if (this.can(this.systemPermissions.EditRequestType)) n++;
    return n;
  }
}
