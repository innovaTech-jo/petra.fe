import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { environment } from '../../../../environments/environment';
import { GceSoftBase } from '../../../core/gce-soft-base';
import { PrivilegeDto, RoleDto, RolePrivilegeDto } from '../../../core/models';
import { PrivilegeService, RoleService } from '../../../core/services';
import { NotificationService } from '../../../core/notification.service';
import { InternalLocalStoreService } from '../../services/internal-local-store.service';

export interface PrivilegeTreeNode {
  key: string;
  label: string;
  icon?: string;
  data?: string;
  children?: PrivilegeTreeNode[];
}

export type PrivilegeActionKind = 'create' | 'edit' | 'query' | 'other';

@Component({
  selector: 'app-role-form',
  imports: [CommonModule, FormsModule, RouterLink, ToggleSwitch, Tree],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.css'
})
export class RoleFormComponent extends GceSoftBase implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly roleService = inject(RoleService);
  private readonly privilegeService = inject(PrivilegeService);
  private readonly localStore = inject(InternalLocalStoreService);
  readonly notificationService = inject(NotificationService);

  privileges: PrivilegeDto[] = [];
  privilegeTree: PrivilegeTreeNode[] = [];
  privilegeTreePrime: TreeNode<{ privilege: PrivilegeTreeNode; isRoot: boolean; parentScreenLabel?: string }>[] =
    [];
  privilegeTreeSelection: TreeNode[] = [];
  selectedPrivilage: string[] = [];
  editingRole: Partial<RoleDto> = { active: 1 };

  wizardStep: 1 | 2 = 1;
  saving = false;

  readonly configurationMaxLength = 255;

  get isEditMode(): boolean {
    return !!this.editingRole?.id;
  }

  ngOnInit(): void {
    this.getAllPrivileges();
    const id = this.route.snapshot.paramMap.get('id');
    const step = this.route.snapshot.queryParamMap.get('step');
    if (id) {
      this.loadRole(id, step === '2' ? 2 : 1);
    } else {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.editingRole = { active: 1 };
    this.selectedPrivilage = [];
    this.privilegeTreeSelection = [];
    this.wizardStep = 1;
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

  onPrivilegeTreeSelectionChanged(sel: TreeNode | TreeNode[] | null | undefined): void {
    const arr = sel == null ? [] : Array.isArray(sel) ? sel : [sel];
    this.privilegeTreeSelection = arr;
    this.selectedPrivilage = [...new Set(arr.map((n) => String(n.key ?? '')).filter(Boolean))];
  }

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
    if (environment.useLocalInternalStore) {
      this.privileges = this.localStore.getAllPrivileges();
      this.buildPrivilegeTree(this.privileges);
      return;
    }
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
      sorted.length > 0 ? sorted.map((c) => this.mapPrivilegeToTreeNode(c, false, p.label)) : undefined;
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

  loadRole(id: number | string, initialStep: 1 | 2): void {
    const roleId = Number(id);
    if (environment.useLocalInternalStore) {
      const role = this.localStore.getRoleById(roleId);
      if (!role) {
        this.notificationService.showError('تعذر تحميل بيانات الدور');
        void this.router.navigate(['/internal/user-roles']);
        return;
      }
      this.editingRole = { ...role };
      this.loadPrivilegesForRole(roleId);
      this.wizardStep = initialStep;
      return;
    }
    this.roleService.getById(roleId).subscribe({
      next: (role) => {
        this.editingRole = { ...role };
        this.loadPrivilegesForRole(roleId);
        this.wizardStep = initialStep;
      },
      error: (err: Error) => {
        this.notificationService.showError(err.message);
        void this.router.navigate(['/internal/user-roles']);
      }
    });
  }

  goToWizardStep(step: 1 | 2): void {
    if (step === 1) {
      this.wizardStep = 1;
      return;
    }
    if (step === 2 && this.editingRole.id) {
      this.wizardStep = 2;
      this.loadPrivilegesForRole(this.editingRole.id);
    }
  }

  prevWizardStep(): void {
    if (this.wizardStep === 2) this.wizardStep = 1;
  }

  setRoleActiveFromToggle(on: boolean): void {
    this.editingRole.active = on ? 1 : 0;
  }

  canSubmitStep1(): boolean {
    return !!(this.editingRole.nameAr?.trim() && this.editingRole.nameOt?.trim());
  }

  submitStep1(): void {
    if (!this.canSubmitStep1()) return;
    this.saving = true;
    const dto = this.editingRole as RoleDto;

    const onSaved = (newId: number): void => {
      this.saving = false;
      this.editingRole.id = newId;
      this.loadPrivilegesForRole(newId);
      this.wizardStep = 2;
    };

    if (environment.useLocalInternalStore) {
      const now = new Date().toISOString();
      const payload: RoleDto = {
        ...dto,
        id: dto.id,
        createdBy: dto.createdBy || this.currentUserId || 0,
        createdDate: dto.createdDate || now,
        active: dto.active ?? 1,
        nameAr: dto.nameAr ?? '',
        nameOt: dto.nameOt ?? ''
      };
      onSaved(this.localStore.saveRole(payload));
      return;
    }

    const req = dto.id ? this.roleService.update(dto) : this.roleService.create(dto);
    req.subscribe({
      next: (newId) => {
        const id = dto.id || Number(newId);
        if (!id) {
          this.saving = false;
          this.notificationService.showError('تعذر الحصول على معرف الدور بعد الحفظ');
          return;
        }
        onSaved(id);
      },
      error: (err: Error) => {
        this.saving = false;
        this.notificationService.showError(err.message);
      }
    });
  }

  loadPrivilegesForRole(roleId: number | string): void {
    const id = Number(roleId);
    if (environment.useLocalInternalStore) {
      const role = this.localStore.getRoleById(id);
      this.selectedPrivilage = (role?.rolePrivileges ?? [])
        .map((a) => String(a.privilegeId))
        .filter(Boolean);
      this.syncPrivilegeTreeSelectionFromIds();
      return;
    }
    this.roleService.getById(id).subscribe({
      next: (role) => {
        this.selectedPrivilage = (role.rolePrivileges ?? [])
          .map((a) => String(a.privilegeId))
          .filter(Boolean);
        this.syncPrivilegeTreeSelectionFromIds();
      },
      error: () => {
        this.selectedPrivilage = [];
        this.syncPrivilegeTreeSelectionFromIds();
      }
    });
  }

  savePrivileges(): void {
    if (!this.selectedPrivilage.length) {
      this.notificationService.showError('الرجاء اختيار صلاحية واحدة على الأقل');
      return;
    }
    const selected: RolePrivilegeDto[] = [];
    this.selectedPrivilage.forEach((p) => {
      const privilegeId = Number(p);
      if (!selected.some((a) => String(a.privilegeId) === String(p))) {
        selected.push({
          id: 0,
          createdBy: this.currentUserId || 0,
          createdDate: new Date().toISOString(),
          roleId: Number(this.editingRole.id),
          privilegeId
        });
      }
    });
    this.editingRole.rolePrivileges = selected;
    this.saving = true;

    const onSuccess = (): void => {
      this.saving = false;
      this.notificationService.showSuccess();
      void this.router.navigate(['/internal/user-roles']);
    };

    if (environment.useLocalInternalStore) {
      this.localStore.saveRole(
        this.editingRole as RoleDto,
        this.selectedPrivilage.map((p) => Number(p)).filter((n) => !Number.isNaN(n))
      );
      onSuccess();
      return;
    }

    this.roleService.update(this.editingRole as RoleDto).subscribe({
      next: () => onSuccess(),
      error: (err: Error) => {
        this.saving = false;
        this.notificationService.showError(err.message);
      }
    });
  }
}
