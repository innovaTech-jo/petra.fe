import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { GceSoftBase } from '../../core/gce-soft-base';
import { RoleDto } from '../../core/models';
import { RoleService } from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ListPaginationBarComponent } from '../../shared/list-pagination-bar/list-pagination-bar.component';
import { InternalLocalStoreService } from '../services/internal-local-store.service';

@Component({
  selector: 'app-user-role',
  imports: [CommonModule, RouterLink, PageHeaderComponent, ListPaginationBarComponent],
  templateUrl: './user-role.component.html',
  styleUrl: './user-role.component.css'
})
export class UserRoleComponent extends GceSoftBase implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly localStore = inject(InternalLocalStoreService);
  readonly notificationService = inject(NotificationService);

  allRoles: RoleDto[] = [];
  loadingList = false;
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.getAllRoles();
  }

  override can(permission: import('../../shared/enums').PermissionId): boolean {
    return super.can(permission);
  }

  getAllRoles(): void {
    this.loadingList = true;
    if (environment.useLocalInternalStore) {
      const page = this.localStore.searchRoles({
        keyword: this.searchParameters.keyword,
        pagingParameters: this.searchParameters.pagingParameters
      });
      this.allRoles = page.collections ?? [];
      this.searchParameters.totalCount = page.count ?? 0;
      this.loadingList = false;
      return;
    }
    this.roleService
      .search({
        keyword: this.searchParameters.keyword,
        pagingParameters: this.searchParameters.pagingParameters,
        isByPass: false
      })
      .subscribe({
        next: (page) => {
          this.allRoles = page.collections ?? [];
          this.searchParameters.totalCount = page.count ?? 0;
          this.loadingList = false;
        },
        error: (err: Error) => {
          this.loadingList = false;
          this.notificationService.showError(err.message);
        }
      });
  }

  changePage(page: number): void {
    const current = this.searchParameters.pagingParameters.pageNumber ?? 1;
    if (page < 1 || page > this.totalPages || page === current) return;
    this.searchParameters.pagingParameters.pageNumber = page;
    this.getAllRoles();
  }

  onPageSizeChange(size: number): void {
    this.searchParameters.pagingParameters.pageSize = size > 0 ? size : 10;
    this.searchParameters.pagingParameters.pageNumber = 1;
    this.getAllRoles();
  }

  get totalPages(): number {
    const total = this.searchParameters.totalCount ?? 0;
    const size = this.searchParameters.pagingParameters.pageSize ?? 10;
    return Math.max(1, Math.ceil(total / size) || 1);
  }

  formatCreatedDate(value: string | Date | undefined): string {
    if (!value) return '—';
    const d = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' });
  }

  colCount(): number {
    let n = 4;
    if (this.can(this.systemPermissions.EditUserRoles)) n++;
    if (this.can(this.systemPermissions.AssignedPrivilages)) n++;
    return n;
  }
}
