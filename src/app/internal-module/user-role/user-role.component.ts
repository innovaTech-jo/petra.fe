import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { GceSoftBase } from '../../core/gce-soft-base';
import { PrivilegeDto, RoleDto, RolePrivilegeDto } from '../../core/models';
import { PrivilegeService, RoleService } from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ListPaginationBarComponent } from '../../shared/list-pagination-bar/list-pagination-bar.component';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tree } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

/** Tree node for privilege UI (replaces PrimeNG TreeNode). */
export interface PrivilegeTreeNode {
  key: string;
  label: string;
  icon?: string;
  data?: string;
  children?: PrivilegeTreeNode[];
}

export type PrivilegeActionKind = 'create' | 'edit' | 'query' | 'other';

@Component({
  selector: 'app-user-role',
  imports: [CommonModule, FormsModule, PageHeaderComponent, ListPaginationBarComponent, ToggleSwitch, Tree],
  templateUrl: './user-role.component.html',
  styleUrl: './user-role.component.css'
})
export class UserRoleComponent extends GceSoftBase implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly privilegeService = inject(PrivilegeService);
  readonly notificationService = inject(NotificationService);

  allRoles: RoleDto[] = [];
  privileges: PrivilegeDto[] = [];
  privilegeTree: PrivilegeTreeNode[] = [];
  /** PrimeNG `p-tree` value — mirrors `privilegeTree` with `expanded` and `data.isRoot`. */
  privilegeTreePrime: TreeNode<{ privilege: PrivilegeTreeNode; isRoot: boolean; parentScreenLabel?: string }>[] =
    [];
  /** Bound to `p-tree` checkbox selection (same node refs as `privilegeTreePrime`). */
  privilegeTreeSelection: TreeNode[] = [];
  selectedPrivilage: string[] = [];
  editingRole: Partial<RoleDto> = {};

  /** Single wizard: step 1 = role info, step 2 = permissions tree */
  isRoleWizardOpen = false;
  roleWizardStep: 1 | 2 = 1;
  roleWizardSaving = false;

  loadingList = false;

  readonly configurationMaxLength = 255;
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.getAllRoles();
    this.getAllPrivileges();
  }

  override can(permission: string): boolean {
    return super.can(permission);
  }

  bindChildrens(parentId: string | number): PrivilegeTreeNode[] {
    const children: PrivilegeTreeNode[] = [];
    this.privileges
      .filter((child) => child.parentId != null && String(child.parentId) === String(parentId))
      .forEach((p) => {
        children.push({
          key: String(p.id),
          label: this.isArabic ? (p.privilegeName ?? '') : (p.privilegeNameEn ?? ''),
          icon: p.icon,
          data: this.isArabic ? (p.privilegeName ?? '') : (p.privilegeNameEn ?? ''),
          children: undefined
        });
      });
    return children;
  }

  /** Maps `p-tree` checkbox selection to `selectedPrivilage` (privilege ids). */
  onPrivilegeTreeSelectionChanged(sel: TreeNode | TreeNode[] | null | undefined): void {
    const arr = this.normalizeTreeSelection(sel);
    this.privilegeTreeSelection = arr;
    this.selectedPrivilage = [...new Set(arr.map((n) => String(n.key ?? '')).filter(Boolean))];
  }

  private normalizeTreeSelection(sel: TreeNode | TreeNode[] | null | undefined): TreeNode[] {
    if (sel == null) return [];
    return Array.isArray(sel) ? sel : [sel];
  }

  /** Rebuilds tree checkbox state from `selectedPrivilage` after load or tree rebuild. */
  syncPrivilegeTreeSelectionFromIds(): void {
    const out: TreeNode[] = [];
    const seen = new Set<string>();
    for (const id of this.selectedPrivilage) {
      const node = this.findTreeNodeByKey(String(id), this.privilegeTreePrime);
      if (node?.key != null && !seen.has(String(node.key))) {
        seen.add(String(node.key));
        out.push(node);
      }
    }
    this.privilegeTreeSelection = out;
  }

  private findTreeNodeByKey(key: string, nodes: TreeNode[]): TreeNode | null {
    for (const n of nodes) {
      if (String(n.key) === key) return n;
      if (n.children?.length) {
        const found = this.findTreeNodeByKey(key, n.children);
        if (found) return found;
      }
    }
    return null;
  }

  /** Classify API privilege label for UI column: إضافة / تعديل / استعلام */
  privilegeActionKind(node: PrivilegeTreeNode): PrivilegeActionKind {
    const t = `${node.data ?? ''} ${node.label ?? ''}`.toLowerCase();
    if (/create|add|insert|new|إضافة|إنشاء|انشاء|اضافة/.test(t)) return 'create';
    if (/edit|update|modify|تعديل|تحرير/.test(t)) return 'edit';
    if (/query|search|view|select|list|عرض|استعلام|بحث|قراءة/.test(t)) return 'query';
    return 'other';
  }

  privilegeActionLabelAr(kind: PrivilegeActionKind): string {
    switch (kind) {
      case 'create':
        return 'إضافة';
      case 'edit':
        return 'تعديل';
      case 'query':
        return 'استعلام';
      default:
        return 'أخرى';
    }
  }

  /** Stable order: إضافة → تعديل → استعلام → others */
  sortedChildrenForDisplay(children: PrivilegeTreeNode[] | undefined): PrivilegeTreeNode[] {
    if (!children?.length) return [];
    const rank = (n: PrivilegeTreeNode): number => {
      const k = this.privilegeActionKind(n);
      if (k === 'create') return 0;
      if (k === 'edit') return 1;
      if (k === 'query') return 2;
      return 3;
    };
    return [...children].sort((a, b) => {
      const d = rank(a) - rank(b);
      return d !== 0 ? d : a.label.localeCompare(b.label, 'ar');
    });
  }

  getAllPrivileges(): void {
    this.privilegeService.getAll().subscribe({
      next: (list) => {
        this.privileges = list ?? [];
        this.buildPrivilegeTree(this.privileges);
      },
      error: (err: Error) => this.notificationService.showError(err.message)
    });
  }

  private buildPrivilegeTree(list: PrivilegeDto[]): void {
    this.privilegeTree = [];
    list
      .filter((a) => a.parentId == null)
      .forEach((p) => {
        this.privilegeTree.push({
          key: String(p.id),
          label: this.isArabic ? (p.privilegeName ?? '') : (p.privilegeNameEn ?? ''),
          data: this.isArabic ? (p.privilegeName ?? '') : (p.privilegeNameEn ?? ''),
          icon: p.icon,
          children: this.bindChildrens(p.id!)
        });
      });
    this.rebuildPrivilegeTreePrime();
  }

  private mapPrivilegeToTreeNode(
    p: PrivilegeTreeNode,
    isRoot: boolean,
    parentScreenLabel?: string
  ): TreeNode<{ privilege: PrivilegeTreeNode; isRoot: boolean; parentScreenLabel?: string }> {
    const sorted = this.sortedChildrenForDisplay(p.children);
    const childNodes =
      sorted.length > 0
        ? sorted.map((c) => this.mapPrivilegeToTreeNode(c, false, p.label))
        : undefined;
    return {
      key: p.key,
      label: p.label,
      expanded: true,
      data: { privilege: p, isRoot, parentScreenLabel: isRoot ? undefined : parentScreenLabel },
      children: childNodes
    };
  }

  private rebuildPrivilegeTreePrime(): void {
    this.privilegeTreePrime = this.privilegeTree.map((r) => this.mapPrivilegeToTreeNode(r, true));
    this.syncPrivilegeTreeSelectionFromIds();
  }

  getAllRoles(): void {
    this.loadingList = true;
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

  onSearchInput(event: Event): void {
    this.searchParameters.keyword = (event.target as HTMLInputElement).value;
    this.searchParameters.pagingParameters.pageNumber = 1;
    this.getAllRoles();
  }

  showCreateModal(): void {
    this.editingRole = { active: 1 };
    this.selectedPrivilage = [];
    this.privilegeTreeSelection = [];
    this.roleWizardStep = 1;
    this.isRoleWizardOpen = true;
  }

  closeRoleWizard(): void {
    this.isRoleWizardOpen = false;
    this.roleWizardStep = 1;
    this.roleWizardSaving = false;
    this.resetRoleForm();
    this.selectedPrivilage = [];
    this.privilegeTreeSelection = [];
  }

  goToRoleWizardStep(step: 1 | 2): void {
    if (step === 1) {
      this.roleWizardStep = 1;
      return;
    }
    if (step === 2 && this.editingRole.id) {
      this.roleWizardStep = 2;
      this.loadPrivilegesForRole(String(this.editingRole.id));
    }
  }

  prevRoleWizardStep(): void {
    if (this.roleWizardStep === 2) this.roleWizardStep = 1;
  }

  /** Step 1 → persist role then open permissions step */
  submitRoleStep1(roleForm: NgForm): void {
    if (!roleForm.valid) return;
    this.roleWizardSaving = true;
    const dto = this.editingRole as RoleDto;
    const req = dto.id ? this.roleService.update(dto) : this.roleService.create(dto);
    req.subscribe({
      next: (newId) => {
        this.roleWizardSaving = false;
        if (!dto.id && newId) {
          this.editingRole.id = newId;
        }
        if (!this.editingRole.id) {
          this.notificationService.showError('تعذر الحصول على معرف الدور بعد الحفظ');
          return;
        }
        this.loadPrivilegesForRole(String(this.editingRole.id));
        this.roleWizardStep = 2;
      },
      error: (err: Error) => {
        this.roleWizardSaving = false;
        this.notificationService.showError(err.message);
      }
    });
  }

  loadPrivilegesForRole(roleId: string): void {
    this.roleService.getById(roleId).subscribe({
      next: (role) => {
        this.selectedPrivilage = (role.rolePrivileges ?? [])
          .map((a) => a.privilegeId)
          .filter((id): id is string => !!id);
        this.syncPrivilegeTreeSelectionFromIds();
      },
      error: () => {
        this.selectedPrivilage = [];
        this.syncPrivilegeTreeSelectionFromIds();
      }
    });
  }

  openRolePermissions(role: RoleDto): void {
    if (!role.id) return;
    this.editingRole = { ...role };
    this.roleWizardStep = 2;
    this.isRoleWizardOpen = true;
    this.loadPrivilegesForRole(String(role.id));
  }

  getRoleById(id: string | undefined): void {
    if (!id) return;
    this.roleService.getById(id).subscribe({
      next: (role) => {
        this.editingRole = { ...role };
        this.selectedPrivilage = [];
        this.privilegeTreeSelection = [];
        this.roleWizardStep = 1;
        this.isRoleWizardOpen = true;
      },
      error: (err: Error) => this.notificationService.showError(err.message)
    });
  }

  resetRoleForm(): void {
    this.editingRole = {};
  }

  setRoleActiveFromToggle(on: boolean): void {
    this.editingRole.active = on ? 1 : 0;
  }

  saveSystemUserPrivilege(): void {
    if (!this.selectedPrivilage.length) {
      this.notificationService.showError('الرجاء اختيار صلاحية واحدة على الأقل');
      return;
    }
    const selected: RolePrivilegeDto[] = [];
    this.selectedPrivilage.forEach((p) => {
      const exists = selected.some((a) => a.privilegeId === p);
      if (!exists) {
        selected.push({
          id: '',
          createdBy: this.currentUserId,
          createdDate: new Date().toISOString(),
          roleId: String(this.editingRole.id),
          privilegeId: p
        });
      }
    });
    this.editingRole.rolePrivileges = selected;
    this.roleWizardSaving = true;
    this.roleService.update(this.editingRole as RoleDto).subscribe({
      next: () => {
        this.roleWizardSaving = false;
        this.resetRoleForm();
        this.getAllRoles();
        this.closeRoleWizard();
        this.notificationService.showSuccess();
      },
      error: (err: Error) => {
        this.roleWizardSaving = false;
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

  isRoleFormReady(form: NgForm | null | undefined): boolean {
    return !!form?.valid;
  }

  colCount(): number {
    let n = 4;
    if (this.can(this.systemPermissions.EditUserRoles)) n++;
    if (this.can(this.systemPermissions.AssignedPrivilages)) n++;
    return n;
  }
}
