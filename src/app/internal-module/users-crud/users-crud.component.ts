import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { GceSoftBase } from '../../core/gce-soft-base';
import { UsersDto } from '../../core/models';
import { UserService } from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ListPaginationBarComponent } from '../../shared/list-pagination-bar/list-pagination-bar.component';
import { InternalLocalStoreService } from '../services/internal-local-store.service';

@Component({
  selector: 'app-users-crud',
  imports: [CommonModule, RouterLink, PageHeaderComponent, ListPaginationBarComponent],
  templateUrl: './users-crud.component.html',
  styleUrl: './users-crud.component.css'
})
export class UsersCrudComponent extends GceSoftBase implements OnInit {
  private readonly userService = inject(UserService);
  private readonly localStore = inject(InternalLocalStoreService);
  readonly notificationService = inject(NotificationService);

  allUsers: UsersDto[] = [];
  loadingList = false;
  readonly pageSizeOptions = [5, 10, 20, 50];

  get totalPages(): number {
    const total = this.searchParameters.totalCount ?? 0;
    const size = this.searchParameters.pagingParameters?.pageSize ?? 10;
    return Math.max(1, Math.ceil(total / size) || 1);
  }

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    if (environment.useLocalInternalStore) {
      this.loadingList = true;
      const page = this.localStore.searchUsers({
        keyword: this.searchParameters.keyword,
        pagingParameters: this.searchParameters.pagingParameters
      });
      this.allUsers = this.prioritizeCurrentUserFirst(page.collections ?? []);
      this.searchParameters.totalCount = page.count ?? 0;
      this.loadingList = false;
      return;
    }
    this.loadingList = true;
    this.userService
      .search({
        keyword: this.searchParameters.keyword,
        pagingParameters: this.searchParameters.pagingParameters,
        isByPass: false
      })
      .subscribe({
        next: (page) => {
          this.allUsers = this.prioritizeCurrentUserFirst(page.collections ?? []);
          this.searchParameters.totalCount = page.count ?? 0;
          this.loadingList = false;
        },
        error: (err: Error) => {
          this.loadingList = false;
          this.notificationService.showError(err.message);
        }
      });
  }

  getCityLabel(cityId: number | null | undefined): string {
    if (cityId == null || cityId <= 0) return '—';
    return String(cityId);
  }

  changePage(page: number): void {
    const current = this.searchParameters.pagingParameters.pageNumber ?? 1;
    if (page < 1 || page > this.totalPages || page === current) {
      return;
    }
    this.searchParameters.pagingParameters.pageNumber = page;
    this.getAllUsers();
  }

  onPageSizeChange(size: number): void {
    const s = size > 0 ? size : 10;
    this.searchParameters.pagingParameters.pageSize = s;
    this.searchParameters.pagingParameters.pageNumber = 1;
    this.getAllUsers();
  }

  trackByUserId(_: number, user: UsersDto): number {
    return user.id;
  }

  private prioritizeCurrentUserFirst(users: UsersDto[]): UsersDto[] {
    const sid = this.currentUserId;
    if (!sid) return users;
    return [...users].sort((a, b) => {
      const aSelf = a.id === sid ? 0 : 1;
      const bSelf = b.id === sid ? 0 : 1;
      return aSelf - bSelf;
    });
  }
}
