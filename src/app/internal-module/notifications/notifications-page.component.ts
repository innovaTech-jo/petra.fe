import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GceSoftBase } from '../../core/gce-soft-base';
import { NotificationDto } from '../../core/models';
import { NotificationApiService } from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ListPaginationBarComponent } from '../../shared/list-pagination-bar/list-pagination-bar.component';

@Component({
  selector: 'app-notifications-page',
  imports: [CommonModule, FormsModule, PageHeaderComponent, ListPaginationBarComponent],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.css'
})
export class NotificationsPageComponent extends GceSoftBase implements OnInit {
  private readonly notificationApi = inject(NotificationApiService);
  readonly toast = inject(NotificationService);

  rows: NotificationDto[] = [];
  loadingList = false;
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loadingList = true;
    this.notificationApi
      .search({
        keyword: this.searchParameters.keyword,
        pagingParameters: this.searchParameters.pagingParameters,
        isByPass: false
      })
      .subscribe({
        next: (page) => {
          this.rows = page.collections ?? [];
          this.searchParameters.totalCount = page.count ?? 0;
          this.loadingList = false;
        },
        error: (err: Error) => {
          this.loadingList = false;
          this.toast.showError(err.message);
        }
      });
  }

  onSearch(term: string): void {
    this.search(term);
    this.searchParameters.pagingParameters!.pageNumber = 1;
    this.load();
  }

  onPageChange(page: number): void {
    this.searchParameters.pagingParameters!.pageNumber = page;
    this.load();
  }

  onPageSizeChange(size: number): void {
    this.searchParameters.pagingParameters!.pageSize = size;
    this.searchParameters.pagingParameters!.pageNumber = 1;
    this.load();
  }
}
