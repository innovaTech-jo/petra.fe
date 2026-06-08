import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { environment } from '../../../../environments/environment';
import { GceSoftBase } from '../../../core/gce-soft-base';
import {
  AttachmentTypeDto,
  FIELD_TYPE_OPTIONS,
  FieldType,
  IntegrationTypeDto,
  RequestDetailDto,
  RequestTypeAttachmentDto,
  RequestTypeDto
} from '../../../core/models';
import { AttachmentTypeService, IntegrationTypeService, RequestTypeService } from '../../../core/services';
import { NotificationService } from '../../../core/notification.service';
import { RequestTypeLocalStoreService } from '../../services/request-type-local-store.service';

@Component({
  selector: 'app-request-type-form',
  imports: [CommonModule, FormsModule, RouterLink, ToggleSwitch],
  templateUrl: './request-type-form.component.html',
  styleUrl: './request-type-form.component.css'
})
export class RequestTypeFormComponent extends GceSoftBase implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly requestTypeService = inject(RequestTypeService);
  private readonly integrationTypeService = inject(IntegrationTypeService);
  private readonly attachmentTypeService = inject(AttachmentTypeService);
  private readonly localStore = inject(RequestTypeLocalStoreService);
  readonly notificationService = inject(NotificationService);

  readonly fieldTypeOptions = FIELD_TYPE_OPTIONS;
  integrationTypes: IntegrationTypeDto[] = [];
  attachmentTypes: AttachmentTypeDto[] = [];

  editingRequestType: Partial<RequestTypeDto> = {
    active: 1,
    isRequiredInnocent: false,
    requestDetails: [],
    requestTypeAttachments: []
  };

  wizardStep: 1 | 2 | 3 = 1;
  saving = false;
  invalidDetailRowIndex: number | null = null;

  get isEditMode(): boolean {
    return !!(this.editingRequestType.id && this.editingRequestType.id > 0);
  }

  ngOnInit(): void {
    this.loadLookups();
    const id = this.route.snapshot.paramMap.get('id');
    const step = this.route.snapshot.queryParamMap.get('step');
    if (id) {
      this.loadRequestType(+id, step === '2' ? 2 : step === '3' ? 3 : 1);
    } else {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.editingRequestType = {
      active: 1,
      isRequiredInnocent: false,
      title: '',
      code: '',
      isoCode: '',
      logo: '',
      description: '',
      requestDetails: [],
      requestTypeAttachments: []
    };
    this.wizardStep = 1;
    this.invalidDetailRowIndex = null;
  }

  private loadLookups(): void {
    if (environment.useLocalInternalStore) {
      this.integrationTypes = this.localStore.getAllIntegrationTypes();
      this.attachmentTypes = this.localStore.getAllAttachmentTypes();
      return;
    }
    this.integrationTypeService.getAll().subscribe({
      next: (list) => (this.integrationTypes = (list ?? []).filter((x) => x.active === 1)),
      error: () => (this.integrationTypes = [])
    });
    this.attachmentTypeService.getAll().subscribe({
      next: (list) => (this.attachmentTypes = (list ?? []).filter((x) => x.active === 1)),
      error: () => (this.attachmentTypes = [])
    });
  }

  private loadRequestType(id: number, step: 1 | 2 | 3): void {
    if (environment.useLocalInternalStore) {
      const dto = this.localStore.getRequestTypeById(id);
      if (dto) {
        this.editingRequestType = { ...dto };
        this.wizardStep = step;
      }
      return;
    }
    this.requestTypeService.getById(id).subscribe({
      next: (dto) => {
        this.editingRequestType = {
          ...dto,
          requestDetails: dto.requestDetails ?? [],
          requestTypeAttachments: dto.requestTypeAttachments ?? []
        };
        this.wizardStep = step;
      },
      error: (err: Error) => this.notificationService.showError(err.message)
    });
  }

  goToWizardStep(step: 1 | 2 | 3): void {
    if (step > 1 && !this.editingRequestType.id) return;
    this.wizardStep = step;
  }

  prevWizardStep(): void {
    if (this.wizardStep === 2) this.wizardStep = 1;
    else if (this.wizardStep === 3) this.wizardStep = 2;
  }

  setActiveFromToggle(on: boolean): void {
    this.editingRequestType.active = on ? 1 : 0;
  }

  onIntegrationRequiredChange(row: RequestDetailDto, required: boolean): void {
    row.isRequiredIntegration = required;
    if (!required) {
      row.integrationTypeId = null;
    }
  }

  canSaveDetailRow(row: RequestDetailDto): boolean {
    if (!row.nameAr?.trim() && !row.nameOt?.trim()) return false;
    if (!row.fieldType) return false;
    if (row.isRequiredIntegration && !row.integrationTypeId) return false;
    return true;
  }

  canSaveAttachmentRow(row: RequestTypeAttachmentDto): boolean {
    return !!(row.nameAr?.trim() || row.nameOt?.trim()) && !!row.attachmentTypeId;
  }

  canSubmitStep1(): boolean {
    return !!(this.editingRequestType.title?.trim() && this.editingRequestType.code?.trim());
  }

  canSubmitStep2(): boolean {
    const rows = this.editingRequestType.requestDetails ?? [];
    return rows.every((d) => this.canSaveDetailRow(d));
  }

  canSubmitStep3(): boolean {
    const rows = this.editingRequestType.requestTypeAttachments ?? [];
    return rows.every((a) => this.canSaveAttachmentRow(a));
  }

  submitStep1(): void {
    if (!this.canSubmitStep1() || this.saving) return;
    this.persist(2);
  }

  submitStep2(): void {
    if (!this.canSubmitStep2() || this.saving) return;
    this.persist(3);
  }

  submitStep3(): void {
    if (!this.canSubmitStep3() || this.saving) return;
    this.persist(null);
  }

  private persist(nextStep: 2 | 3 | null): void {
    if (!this.validateChildrenBeforeSave()) return;

    this.saving = true;
    const payload = this.buildDto();
    const isCreate = !payload.id || payload.id === 0;

    const onSuccess = (id?: number) => {
      if (id != null && id > 0) {
        this.editingRequestType.id = id;
      }
      this.saving = false;
      this.invalidDetailRowIndex = null;
      if (nextStep == null) {
        void this.router.navigate(['/internal/request-types']);
      } else {
        this.wizardStep = nextStep;
      }
      this.notificationService.showSuccess();
    };

    if (environment.useLocalInternalStore) {
      onSuccess(this.localStore.saveRequestType(payload));
      return;
    }

    const req = isCreate ? this.requestTypeService.create(payload) : this.requestTypeService.update(payload);
    req.subscribe({
      next: (id) => onSuccess(Number(id) || payload.id),
      error: (err: Error) => this.handleSaveError(err)
    });
  }

  private validateChildrenBeforeSave(): boolean {
    const dto = this.buildDto();
    for (let i = 0; i < dto.requestDetails.length; i++) {
      const d = dto.requestDetails[i];
      if (d.isRequiredIntegration && !d.integrationTypeId) {
        this.invalidDetailRowIndex = i;
        this.notificationService.showError('نوع التكامل مطلوب عند تفعيل التكامل');
        return false;
      }
    }
    this.invalidDetailRowIndex = null;
    return true;
  }

  private handleSaveError(err: Error): void {
    this.saving = false;
    const msg = err.message ?? '';
    const match = msg.match(/حقل التكامل مطلوب للحقل رقم\s*(\d+)/);
    if (match) {
      this.invalidDetailRowIndex = Number(match[1]) - 1;
      this.wizardStep = 2;
    }
    this.notificationService.showError(msg);
  }

  private buildDto(): RequestTypeDto {
    const rt = this.editingRequestType;
    return {
      id: rt.id ?? 0,
      createdBy: rt.createdBy ?? 0,
      createdDate: rt.createdDate ?? '',
      title: rt.title?.trim() ?? '',
      code: rt.code?.trim() ?? '',
      isoCode: rt.isoCode?.trim() ?? '',
      logo: rt.logo?.trim() ?? '',
      active: rt.active ?? 1,
      description: rt.description?.trim() ?? '',
      isRequiredInnocent: !!rt.isRequiredInnocent,
      requestDetails: (rt.requestDetails ?? []).map((d) => ({
        ...d,
        nameAr: d.nameAr?.trim() ?? '',
        nameOt: d.nameOt?.trim() ?? '',
        integrationTypeId: d.isRequiredIntegration ? d.integrationTypeId : null
      })),
      requestTypeAttachments: (rt.requestTypeAttachments ?? []).map((a) => ({
        ...a,
        nameAr: a.nameAr?.trim() ?? '',
        nameOt: a.nameOt?.trim() ?? ''
      }))
    };
  }

  addDetailRow(): void {
    const row: RequestDetailDto = {
      id: 0,
      createdBy: 0,
      createdDate: '',
      nameAr: '',
      nameOt: '',
      fieldType: FieldType.Text,
      isRequiredIntegration: false,
      integrationTypeId: null
    };
    this.editingRequestType.requestDetails = [...(this.editingRequestType.requestDetails ?? []), row];
  }

  removeDetailRow(index: number): void {
    const list = [...(this.editingRequestType.requestDetails ?? [])];
    list.splice(index, 1);
    this.editingRequestType.requestDetails = list;
    if (this.invalidDetailRowIndex === index) {
      this.invalidDetailRowIndex = null;
    }
  }

  addAttachmentRow(): void {
    const row: RequestTypeAttachmentDto = {
      id: 0,
      createdBy: 0,
      createdDate: '',
      nameAr: '',
      nameOt: '',
      attachmentTypeId: 0,
      isRequired: false,
      isMulti: false
    };
    this.editingRequestType.requestTypeAttachments = [
      ...(this.editingRequestType.requestTypeAttachments ?? []),
      row
    ];
  }

  removeAttachmentRow(index: number): void {
    const list = [...(this.editingRequestType.requestTypeAttachments ?? [])];
    list.splice(index, 1);
    this.editingRequestType.requestTypeAttachments = list;
  }

  isDetailRowInvalid(index: number): boolean {
    return this.invalidDetailRowIndex === index;
  }
}
