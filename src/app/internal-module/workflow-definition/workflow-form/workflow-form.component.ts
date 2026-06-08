import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MultiSelect } from 'primeng/multiselect';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { environment } from '../../../../environments/environment';
import { GceSoftBase } from '../../../core/gce-soft-base';
import { RoleDto, WorkFlowDefinitionDto, WorkFlowStepDto } from '../../../core/models';
import { RoleService, WorkFlowDefinitionService } from '../../../core/services';
import { NotificationService } from '../../../core/notification.service';
import { InternalLocalStoreService } from '../../services/internal-local-store.service';
import { RequestTypeLocalStoreService } from '../../services/request-type-local-store.service';

interface RoleOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-workflow-form',
  imports: [CommonModule, FormsModule, RouterLink, ToggleSwitch, MultiSelect],
  templateUrl: './workflow-form.component.html',
  styleUrl: './workflow-form.component.css'
})
export class WorkflowFormComponent extends GceSoftBase implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workflowService = inject(WorkFlowDefinitionService);
  private readonly roleService = inject(RoleService);
  private readonly localStore = inject(InternalLocalStoreService);
  private readonly rtLocalStore = inject(RequestTypeLocalStoreService);
  readonly notificationService = inject(NotificationService);

  requestTypeId = 0;
  requestTypeTitle = '';
  roleOptions: RoleOption[] = [];
  editing: Partial<WorkFlowDefinitionDto> = { active: 1, steps: [] };
  saving = false;

  ngOnInit(): void {
    this.requestTypeId = +(this.route.snapshot.paramMap.get('requestTypeId') ?? 0);
    const workflowId = this.route.snapshot.queryParamMap.get('workflowId');
    this.loadRoles(() => {
      if (workflowId) {
        this.loadById(+workflowId);
      } else {
        this.loadByRequestType();
      }
    });
    this.loadRequestTypeTitle();
  }

  private loadRequestTypeTitle(): void {
    if (environment.useLocalInternalStore) {
      this.requestTypeTitle = this.rtLocalStore.getRequestTypeById(this.requestTypeId)?.title ?? '';
      return;
    }
  }

  private loadRoles(done: () => void): void {
    if (environment.useLocalInternalStore) {
      const page = this.localStore.searchRoles({ pagingParameters: { pageNumber: 1, pageSize: 100 } });
      this.roleOptions = (page.collections ?? []).map((r, i) => ({
        label: r.nameAr || r.nameOt || `Role ${i + 1}`,
        value: this.roleToNumericId(r, i)
      }));
      done();
      return;
    }
    this.roleService
      .search({ pagingParameters: { pageNumber: 1, pageSize: 200 }, isByPass: false })
      .subscribe({
        next: (page) => {
          this.roleOptions = (page.collections ?? []).map((r, i) => ({
            label: r.nameAr || r.nameOt || `Role ${i + 1}`,
            value: this.roleToNumericId(r, i)
          }));
          done();
        },
        error: () => {
          this.roleOptions = [];
          done();
        }
      });
  }

  private roleToNumericId(role: RoleDto, index: number): number {
    const n = Number(role.id);
    return Number.isFinite(n) && n > 0 ? n : index + 1;
  }

  private loadById(id: number): void {
    if (environment.useLocalInternalStore) {
      const dto = this.rtLocalStore.getWorkflowById(id);
      if (dto) this.hydrate(dto);
      else this.initNew();
      return;
    }
    this.workflowService.getById(id).subscribe({
      next: (dto) => this.hydrate(dto),
      error: () => this.initNew()
    });
  }

  private loadByRequestType(): void {
    if (environment.useLocalInternalStore) {
      const dto = this.rtLocalStore.getWorkflowByRequestTypeId(this.requestTypeId);
      if (dto) this.hydrate(dto);
      else this.initNew();
      return;
    }
    this.workflowService.getByRequestTypeId(this.requestTypeId).subscribe({
      next: (dto) => (dto ? this.hydrate(dto) : this.initNew()),
      error: () => this.initNew()
    });
  }

  private hydrate(dto: WorkFlowDefinitionDto): void {
    this.editing = {
      ...dto,
      steps: (dto.steps ?? []).map((s) => ({
        ...s,
        approveRoleIds: [...(s.approveRoleIds ?? [])],
        rejectRoleIds: [...(s.rejectRoleIds ?? [])],
        skipRoleIds: [...(s.skipRoleIds ?? [])]
      }))
    };
  }

  private initNew(): void {
    this.editing = {
      active: 1,
      requestTypeId: this.requestTypeId,
      nameAr: '',
      nameOt: '',
      steps: [this.emptyStep()]
    };
  }

  private emptyStep(): WorkFlowStepDto {
    return {
      order: 1,
      nameAr: '',
      nameOt: '',
      isArchivedStep: false,
      approveRoleIds: [],
      rejectRoleIds: [],
      skipRoleIds: [],
      requireNote: false,
      notePrompt: ''
    };
  }

  setActiveFromToggle(on: boolean): void {
    this.editing.active = on ? 1 : 0;
  }

  addStep(): void {
    this.editing.steps = [...(this.editing.steps ?? []), this.emptyStep()];
  }

  removeStep(index: number): void {
    const list = [...(this.editing.steps ?? [])];
    list.splice(index, 1);
    this.editing.steps = list.length ? list : [this.emptyStep()];
  }

  moveStep(index: number, dir: -1 | 1): void {
    const list = [...(this.editing.steps ?? [])];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    this.editing.steps = list;
  }

  onArchivedChange(step: WorkFlowStepDto, checked: boolean): void {
    if (checked) {
      (this.editing.steps ?? []).forEach((s) => {
        if (s !== step) s.isArchivedStep = false;
      });
    }
    step.isArchivedStep = checked;
  }

  canSave(): boolean {
    const e = this.editing;
    if (!(e.nameAr?.trim() || e.nameOt?.trim())) return false;
    if (!(e.steps?.length ?? 0)) return false;
    return (e.steps ?? []).every((s) => s.nameAr?.trim() || s.nameOt?.trim());
  }

  save(): void {
    if (!this.canSave() || this.saving) return;
    this.saving = true;
    const dto: WorkFlowDefinitionDto = {
      id: this.editing.id ?? 0,
      nameAr: this.editing.nameAr?.trim() ?? '',
      nameOt: this.editing.nameOt?.trim() ?? '',
      active: this.editing.active ?? 1,
      requestTypeId: this.requestTypeId,
      steps: (this.editing.steps ?? []).map((s, i) => ({
        ...s,
        order: i + 1,
        approveRoleIds: [...(s.approveRoleIds ?? [])],
        rejectRoleIds: [...(s.rejectRoleIds ?? [])],
        skipRoleIds: [...(s.skipRoleIds ?? [])]
      }))
    };

    if (environment.useLocalInternalStore) {
      try {
        this.rtLocalStore.saveWorkflow(dto);
        this.saving = false;
        void this.router.navigate(['/internal/request-types']);
        this.notificationService.showSuccess();
      } catch (err) {
        this.saving = false;
        this.notificationService.showError((err as Error).message);
      }
      return;
    }

    const req = dto.id ? this.workflowService.update(dto) : this.workflowService.create(dto);
    req.subscribe({
      next: () => {
        this.saving = false;
        void this.router.navigate(['/internal/request-types']);
        this.notificationService.showSuccess();
      },
      error: (err: Error) => {
        this.saving = false;
        this.notificationService.showError(err.message);
      }
    });
  }
}
