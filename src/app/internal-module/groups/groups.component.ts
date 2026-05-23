import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GceSoftBase } from '../../core/gce-soft-base';
import { GroupDto } from '../../core/models';
import { GroupService } from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { Permissions } from '../../shared/enums';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ListPaginationBarComponent } from '../../shared/list-pagination-bar/list-pagination-bar.component';

@Component({
  selector: 'app-groups',
  imports: [CommonModule, FormsModule, PageHeaderComponent, ListPaginationBarComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent extends GceSoftBase implements OnInit {
  private readonly groupService = inject(GroupService);
  readonly toast = inject(NotificationService);

  rows: GroupDto[] = [];
  loadingList = false;
  readonly pageSizeOptions = [5, 10, 20, 50];
  readonly permissionIds = Permissions;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loadingList = true;
    this.groupService
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
